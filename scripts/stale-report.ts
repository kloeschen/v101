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
import { pruefKadenzTage } from "../src/content/_schemas";

interface Posten {
  art: "entwurf" | "ueberfaellig" | "vergangen" | "reihe-ohne-folge" | "verwaiste-band" | "ohne-quelle";
  datei: string;
  titel: string;
  detail: string;
  /** Höher = dringender. Steuert die Reihenfolge im Bericht. */
  gewicht: number;
}

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
      const vorbei = new Date(d.ende ?? d.beginn) < new Date();
      if (vorbei && d.durchfuehrung === "geplant") {
        posten.push({
          art: "vergangen",
          datei: e.datei,
          titel: d.name,
          detail: 'Termin vorbei, Status noch "geplant" — npm run archivieren',
          gewicht: 300,
        });
      }
      if (!d.quellen?.length) {
        posten.push({ art: "ohne-quelle", datei: e.datei, titel: d.name, detail: "keine Belegkette", gewicht: 150 });
      }
    }
  }

  // Reihen ohne kommende Ausgabe: der häufigste stille Verfall eines
  // Eventregisters — die Reihe existiert weiter, der Eintrag altert.
  const reihen = new Map<string, { name: string; letzte: Date; datei: string }>();
  for (const e of alle) {
    if (e.collection !== "events" || !e.daten?.reihe) continue;
    const datum = new Date(e.daten.beginn);
    const bisher = reihen.get(e.daten.reihe);
    if (!bisher || datum > bisher.letzte) {
      // Die Datei der jüngsten Ausgabe, nicht der URL-Pfad: Der Bericht soll
      // sagen, wo man nachschlagen muss, nicht wo die Seite liegt.
      reihen.set(e.daten.reihe, { name: e.daten.reiheName ?? e.daten.reihe, letzte: datum, datei: e.datei });
    }
  }
  for (const [slug, r] of reihen) {
    if (r.letzte < new Date() && !alle.some((e) => e.daten?.reihe === slug && new Date(e.daten!.beginn) >= new Date())) {
      posten.push({
        art: "reihe-ohne-folge",
        datei: r.datei,
        titel: r.name,
        detail: `letzte Ausgabe vor ${tage(r.letzte)} Tagen, kein Folgetermin erfasst`,
        gewicht: 250,
      });
    }
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
        `${zaehle("ueberfaellig")} überfällige Prüfungen, ${zaehle("entwurf")} Entwürfe in der Warteschlange.`,
    );
    const top = posten[0];
    console.log(`Dringendstes: ${top.titel} — ${top.detail}`);
    return;
  }

  const ueberschrift: Record<Posten["art"], string> = {
    vergangen: "Vergangene Termine ohne Statuspflege",
    "reihe-ohne-folge": "Reihen ohne Folgetermin",
    ueberfaellig: "Überfällige Prüfungen",
    "ohne-quelle": "Ohne Belegkette",
    "verwaiste-band": "Bands ohne Profil",
    entwurf: "Entwürfe in der Warteschlange",
  };

  for (const art of ["vergangen", "reihe-ohne-folge", "ueberfaellig", "ohne-quelle", "verwaiste-band", "entwurf"] as const) {
    const gruppe = posten.filter((p) => p.art === art).slice(0, limit);
    if (gruppe.length === 0) continue;
    console.log(`\n## ${ueberschrift[art]} (${posten.filter((p) => p.art === art).length})`);
    for (const p of gruppe) console.log(`  ${p.titel} — ${p.detail}\n    ${p.datei === "—" ? "" : rel(p.datei)}`);
  }

  console.log(`\n${posten.length} offene Posten insgesamt.`);
}

main();
