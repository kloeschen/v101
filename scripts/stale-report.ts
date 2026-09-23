#!/usr/bin/env -S npx tsx
/**
 * stale-report.ts — was liegt an?
 *
 * Der Bericht, der einen agentischen Betrieb überhaupt steuerbar macht. Ohne
 * ihn arbeiten Recherche-Agenten ins Blaue: Sie legen Neues an, während
 * Bestehendes veraltet, und niemand sieht die Schieflage. Der Bericht ist
 * bewusst die einzige Stelle, an der Prioritäten entstehen — Agenten
 * bekommen ihre Aufgaben daraus, statt sie sich selbst auszudenken.
 *
 *   npx tsx scripts/stale-report.ts            # voller Bericht
 *   npx tsx scripts/stale-report.ts --brief     # 3 Zeilen für SessionStart
 *   npx tsx scripts/stale-report.ts --json
 *   npx tsx scripts/stale-report.ts --limit 30
 */

import path from "node:path";
import { ladeAlle, alsRegistryEingaben } from "./_laden";
import { buildRegistry } from "../src/lib/links";
import { eventVorbei, istVorbei, tageBis } from "../src/lib/datum";
import { pruefKadenzTage } from "../src/content/_schemas";
import { istFreigegeben } from "../src/lib/sichtbarkeit";
import { regionsIndexierbarkeit } from "../src/lib/regionen";
import { uebersichtIndexierbar } from "../src/lib/facetten";
import { collectionNames } from "../src/content/_schemas";
import { SAMMLUNGSNAME, sammlungsPfad } from "../src/lib/faktenblock";

interface Posten {
  art:
    | "entwurf"
    | "termin-naht"
    | "ueberfaellig"
    | "vergangen"
    | "reihe-ohne-folge"
    | "verwaiste-band"
    | "ohne-quelle"
    | "region-noindex"
    | "sammlung-leer";
  datei: string;
  titel: string;
  detail: string;
  /** Höher = dringender. Steuert die Reihenfolge im Bericht. */
  gewicht: number;
}

/**
 * Termin naht, Prüfung liegt zurück. Entscheidung von Markus vom
 * 2026-09-23 (ENTSCHEIDUNGEN.md): Beginn in höchstens TERMIN_NAHT_TAGE
 * Kalendertagen, letzte Prüfung älter als PRUEFUNG_FRISCH_TAGE Tage.
 *
 * Zwei belegte Fälle stehen dahinter: Die Anfangszeit des Record Hop war
 * falsch und wurde nur zufällig vor dem Termin gefunden, und das Line-up
 * der Rockabilly Convention erschien, ohne dass sich das dateModified der
 * Seite bewegte. Die Prüfkadenz von 30 Tagen fängt keinen der beiden.
 *
 * Ein Posten im Bericht, keine Regel im Validator: Ob sich eine Quelle
 * geändert hat, weiß erst, wer sie wieder öffnet. Blockieren hieße, den
 * Build an einem Datum scheitern zu lassen, nicht an einem Fehler.
 */
const TERMIN_NAHT_TAGE = 14;
const PRUEFUNG_FRISCH_TAGE = 7;

const tage = (d: Date | string) => Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
const rel = (p: string) => path.relative(process.cwd(), p);

function main() {
  const argv = process.argv.slice(2);
  const kurz = argv.includes("--brief");
  const alsJson = argv.includes("--json");
  const limitIdx = argv.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : 25;

  const alle = ladeAlle();
  const registry = buildRegistry(alsRegistryEingaben(alle));
  const posten: Posten[] = [];
  // Ein Zeitpunkt für den ganzen Lauf. Sonst kann ein Bericht, der über
  // Mitternacht läuft, zwei verschiedene Antworten auf dieselbe Frage geben.
  const jetzt = new Date();

  for (const e of alle) {
    const d = e.daten;
    if (!d) continue;

    if (d.status !== "veroeffentlicht") {
      posten.push({
        art: "entwurf",
        datei: e.datei,
        titel: d.name,
        detail: `Status "${d.status}", seit ${tage(d.erstelltAm)} Tagen`,
        gewicht: 100 + tage(d.erstelltAm),
      });
    }

    const alter = tage(d.geprueftAm);
    const kadenz = pruefKadenzTage[e.collection];
    if (alter > kadenz) {
      posten.push({
        art: "ueberfaellig",
        datei: e.datei,
        titel: d.name,
        detail: `seit ${alter} Tagen nicht geprüft (Kadenz ${kadenz})`,
        // Doppelt überschritten wiegt überproportional — das ist die Grenze,
        // ab der validate-content einen Fehler statt einer Warnung meldet.
        gewicht: alter > kadenz * 2 ? 200 + alter : 50 + alter,
      });
    }

    if (e.collection === "events") {
      const vorbei = eventVorbei(d, jetzt);
      if (vorbei && d.durchfuehrung === "geplant") {
        posten.push({
          art: "vergangen",
          datei: e.datei,
          titel: d.name,
          detail: 'Termin vorbei, Status noch "geplant" — npm run archivieren',
          gewicht: 300,
        });
      }
      // Nur Freigegebenes: Ein Entwurf steht ohnehin in der Warteschlange
      // und wird bei der Freigabe geprüft. Abgesagte und stattgefundene
      // Termine brauchen keine Nachprüfung vor dem Datum mehr.
      // Ein eigenes `!vorbei` braucht es nicht: `bis >= 0` heißt, der Beginn
      // ist heute oder später, und dann ist der Termin nicht vorbei. Der
      // Mutationsbeleg hat die Bedingung als wirkungslos gezeigt.
      const bis = tageBis(d.beginn, jetzt);
      // Kalendertage, nicht 24-Stunden-Bloecke wie `tage()`: Sonst zaehlte
      // eine Pruefung von vor acht Tagen zwischen Mitternacht und 02:00
      // Ortszeit als sieben, und der Rand des Fensters wackelte.
      const seitPruefung = -tageBis(d.geprueftAm, jetzt);
      if (
        istFreigegeben(d) &&
        d.durchfuehrung !== "abgesagt" &&
        d.durchfuehrung !== "stattgefunden" &&
        bis >= 0 &&
        bis <= TERMIN_NAHT_TAGE &&
        seitPruefung > PRUEFUNG_FRISCH_TAGE
      ) {
        posten.push({
          art: "termin-naht",
          datei: e.datei,
          titel: d.name,
          detail:
            `${bis === 0 ? "heute" : bis === 1 ? "morgen" : `in ${bis} Tagen`}, ` +
            `zuletzt vor ${seitPruefung} Tagen geprüft — Quelle erneut öffnen`,
          // Über einer Reihe ohne Folgetermin, unter einem vergangenen
          // Termin; je näher, desto dringender.
          gewicht: 260 + (TERMIN_NAHT_TAGE - bis),
        });
      }
      if (!d.quellen?.length) {
        posten.push({ art: "ohne-quelle", datei: e.datei, titel: d.name, detail: "keine Belegkette", gewicht: 150 });
      }
    }

    // Die Gegenbuchung zur Regionsschwelle. Das noindex setzt der Build von
    // selbst — und genau deshalb muss es hier stehen: Eine Entscheidung, die
    // niemandem auffällt, nimmt auch niemand zurück. Der Posten sagt, was der
    // Seite zum Index fehlt, und das ist bei einer Region immer Bestand, also
    // Recherche.
    //
    // Nur für freigegebene Regionen: Solange die Region selbst Entwurf ist,
    // steht sie ohnehin in der Warteschlange, und zwei Posten für denselben
    // Zustand machen den Bericht nur länger.
    if (e.collection === "regionen" && istFreigegeben(d)) {
      const { indexierbar, grund } = regionsIndexierbarkeit(registry, e.slug, e.body);
      if (!indexierbar) {
        posten.push({
          art: "region-noindex",
          datei: e.datei,
          titel: d.name,
          detail: `nicht im Index — ${grund}`,
          // Über einem frischen Entwurf, unter einem Event ohne Belegkette:
          // Die Seite ist da und liest sich, ihr fehlt nur, worauf sie zeigt.
          gewicht: 140,
        });
      }
    }
  }

  // Reihen ohne kommende Ausgabe: der häufigste stille Verfall eines
  // Eventregisters — die Reihe existiert weiter, der Eintrag altert.
  const reihen = new Map<string, { name: string; letzte: Date; datei: string; beendet: boolean }>();
  for (const e of alle) {
    if (e.collection !== "events" || !e.daten?.reihe) continue;
    const datum = new Date(e.daten.beginn);
    const bisher = reihen.get(e.daten.reihe);
    if (!bisher || datum > bisher.letzte) {
      // Die Datei der jüngsten Ausgabe, nicht der URL-Pfad: Der Bericht soll
      // sagen, wo man nachschlagen muss, nicht wo die Seite liegt.
      reihen.set(e.daten.reihe, {
        name: e.daten.reiheName ?? e.daten.reihe,
        letzte: datum,
        datei: e.datei,
        // `letzteAusgabe` der JÜNGSTEN Ausgabe zählt: Die Reihe ist beendet,
        // wenn ihr letzter Termin sich als letzter ausweist.
        beendet: e.daten.letzteAusgabe === true,
      });
    }
  }
  for (const [slug, r] of reihen) {
    // Eine ausdrücklich beendete Reihe hat keinen Folgetermin, und das ist
    // kein offener Posten, sondern die Auskunft. Ohne diese Zeile stünde der
    // Walldorf Weekender dauerhaft im Bericht — und ein Bericht, der Posten
    // führt, die niemand erledigen kann, gewöhnt einen daran, ihn zu
    // überlesen (Lektion 4: ein roter Lauf muss etwas bedeuten).
    if (r.beendet) continue;
    // Dieselbe Frage wie in archive-events und im Validator, also dieselbe
    // Antwort: tagesgenau in der Zeitzone der Site (M9).
    const folgetermin = alle.some(
      (e) => e.daten?.reihe === slug && !istVorbei(e.daten!.ende ?? e.daten!.beginn, jetzt),
    );
    if (istVorbei(r.letzte, jetzt) && !folgetermin) {
      posten.push({
        art: "reihe-ohne-folge",
        datei: r.datei,
        titel: r.name,
        detail: `letzte Ausgabe vor ${tage(r.letzte)} Tagen, kein Folgetermin erfasst`,
        gewicht: 250,
      });
    }
  }

  // Sammlungen ohne einen einzigen freigegebenen Eintrag. Ihre
  // Uebersichtsseite ist erreichbar, aber nicht indexierbar -- und das soll
  // sichtbar bleiben, so wie bei den Regionen. Gezaehlt wird mit
  // `istFreigegeben`, weil nur Freigegebenes in der Produktion existiert;
  // die Regel steht in sichtbarkeit.ts und nicht noch einmal hier.
  for (const c of collectionNames) {
    const anzahl = alle.filter((e) => e.collection === c && istFreigegeben(e.daten ?? {})).length;
    const { indexierbar, grund } = uebersichtIndexierbar(anzahl);
    if (indexierbar) continue;
    posten.push({
      art: "sammlung-leer",
      datei: "\u2014",
      titel: `${SAMMLUNGSNAME[c]} (${sammlungsPfad(c)})`,
      detail: `nicht im Index \u2014 ${grund}`,
      gewicht: 130,
    });
  }

  // Bands, die wiederholt im Line-up stehen, aber kein Profil haben.
  const offen = new Map<string, number>();
  for (const e of registry.eintraege.values()) {
    if (e.collection !== "events") continue;
    for (const name of e.daten.lineupWeitere ?? []) offen.set(name, (offen.get(name) ?? 0) + 1);
  }
  for (const [name, anzahl] of offen) {
    if (anzahl >= 3) {
      posten.push({
        art: "verwaiste-band",
        datei: "—",
        titel: name,
        detail: `in ${anzahl} Line-ups ohne eigenes Profil`,
        gewicht: 120 + anzahl,
      });
    }
  }

  posten.sort((a, b) => b.gewicht - a.gewicht);

  const zaehle = (art: Posten["art"]) => posten.filter((p) => p.art === art).length;

  if (alsJson) {
    console.log(JSON.stringify({ gesamt: posten.length, posten }, null, 2));
    return;
  }

  if (kurz) {
    // Format für den SessionStart-Hook: drei Zeilen, keine Liste.
    if (posten.length === 0) return console.log("Register ist auf Stand — nichts überfällig.");
    console.log(
      `Offen: ${zaehle("vergangen")} vergangene Termine ohne Statuspflege, ` +
        `${zaehle("ueberfaellig")} überfällige Prüfungen, ${zaehle("entwurf")} Entwürfe in der Warteschlange` +
        (zaehle("termin-naht") ? `, ${zaehle("termin-naht")} nahe Termine ohne frische Prüfung.` : "."),
    );
    const top = posten[0];
    console.log(`Dringendstes: ${top.titel} — ${top.detail}`);
    return;
  }

  const ueberschrift: Record<Posten["art"], string> = {
    vergangen: "Vergangene Termine ohne Statuspflege",
    "termin-naht": `Termine in den nächsten ${TERMIN_NAHT_TAGE} Tagen, Prüfung älter als ${PRUEFUNG_FRISCH_TAGE} Tage`,
    "reihe-ohne-folge": "Reihen ohne Folgetermin",
    ueberfaellig: "Überfällige Prüfungen",
    "ohne-quelle": "Ohne Belegkette",
    "verwaiste-band": "Bands ohne Profil",
    "region-noindex": "Regionen unter der Indexschwelle",
    "sammlung-leer": "Sammlungen ohne Eintrag",
    entwurf: "Entwürfe in der Warteschlange",
  };

  for (const art of ["vergangen", "termin-naht", "reihe-ohne-folge", "ueberfaellig", "ohne-quelle", "region-noindex", "sammlung-leer", "verwaiste-band", "entwurf"] as const) {
    const gruppe = posten.filter((p) => p.art === art).slice(0, limit);
    if (gruppe.length === 0) continue;
    console.log(`\n## ${ueberschrift[art]} (${posten.filter((p) => p.art === art).length})`);
    for (const p of gruppe) console.log(`  ${p.titel} — ${p.detail}\n    ${p.datei === "—" ? "" : rel(p.datei)}`);
  }

  console.log(`\n${posten.length} offene Posten insgesamt.`);
}

main();
