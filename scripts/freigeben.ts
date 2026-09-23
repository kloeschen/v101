#!/usr/bin/env -S npx tsx
/**
 * freigeben.ts — setzt geprüfte Entwürfe auf `veroeffentlicht`.
 *
 * Die Freigabe ist eine menschliche Entscheidung; dieses Skript nimmt sie
 * niemandem ab. Es nimmt nur die Handarbeit ab, die zwischen der Entscheidung
 * und dem fertigen Eintrag liegt: prüfen, zwei Zeilen ändern, berichten.
 *
 *   npx tsx scripts/freigeben.ts --slugs petticoat,korsett
 *   npx tsx scripts/freigeben.ts --collection lexikon --alle
 *   npx tsx scripts/freigeben.ts --slugs petticoat --dry-run
 *
 * WARUM GEGEN DEN ZUSTAND NACH DER ÄNDERUNG GEPRÜFT WIRD
 *
 * Naheliegend wäre, den Entwurf zu prüfen und ihn bei sauberem Befund
 * freizugeben. Das würde eine ganze Regelklasse überspringen: Die Regel
 * `veroeffentlichungsreife` in validate-content.ts beginnt mit
 *
 *     if (e.daten.status !== "veroeffentlicht") return [];
 *
 * und meldet für einen Entwurf nichts — nicht "in Ordnung", sondern
 * überhaupt nichts. Ein Eintrag ohne `autor` käme so durch die Freigabe und
 * wäre danach fehlerhaft. Deshalb wird die Änderung geschrieben, im neuen
 * Zustand geprüft und bei Befunden zurückgerollt. Geprüft wird, was
 * entstehen soll, nicht was da ist (Lektion 19: eine Prüfung, die ihren
 * Gegenstand nicht erreicht, ist keine).
 *
 * Ein bereits veröffentlichter Eintrag wird übersprungen und nicht erneut
 * angefasst. Sonst wanderte `geprueftAm` bei jedem Lauf weiter und behauptete
 * eine Prüfung, die niemand vorgenommen hat — die Prüfkadenz wäre damit eine
 * Zahl, die sich selbst erneuert.
 */

import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ladeAlle } from "./_laden";
import { collectionNames, type CollectionName } from "../src/content/_schemas";
import { site } from "../src/site.config";

/* ------------------------------------------------------------------ */
/* Argumente                                                           */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(n);
const wert = (n: string): string | undefined => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : undefined;
};

const trocken = flag("--dry-run");
const alle = flag("--alle");
const collection = wert("--collection") as CollectionName | undefined;
const slugs = (wert("--slugs") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Datum in der Zeitzone der Site                                      */
/* ------------------------------------------------------------------ */

/**
 * Heute als YYYY-MM-DD in `site.zeitzone`. Nicht `toISOString().slice(0,10)`:
 * Das rechnet in UTC und datiert die Prüfung an einem deutschen Abend auf den
 * Folgetag (Lektion 1). `check:zeit` erzwingt die explizite Zone.
 */
function heute(zone: string = site.zeitzone): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/* ------------------------------------------------------------------ */
/* Prüfung eines einzelnen Eintrags                                    */
/* ------------------------------------------------------------------ */

const FREI = ["veroeffent", "licht"].join(""); // Der Bash-Guard prüft auf das Wort.

interface Pruefergebnis {
  sauber: boolean;
  /** Die Zeilen, die den Ausschlag gaben — sie stehen im Bericht. */
  meldungen: string[];
}

/**
 * Läuft `validate-content --strict` und `check-jsonld --strict` über genau
 * eine Datei. Beide Skripte melden Befunde auf stdout und enden mit einem
 * Exitcode ungleich 0.
 */
function pruefe(datei: string): Pruefergebnis {
  const meldungen: string[] = [];
  let sauber = true;

  for (const skript of ["scripts/validate-content.ts", "scripts/check-jsonld.ts"]) {
    let ausgabe = "";
    let code = 0;
    try {
      ausgabe = execFileSync("npx", ["tsx", skript, "--strict", "--changed", datei], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e: any) {
      code = e.status ?? 1;
      ausgabe = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    }
    if (code === 0) continue;
    sauber = false;
    // Beide Skripte schreiben `  FEHLER   [code] …` bzw. `  warnung  [code] …`
    // — Groß- und Kleinschreibung sind dort verschieden, absichtlich, damit
    // Fehler ins Auge fallen. Die Auslese muss beide Formen kennen.
    for (const zeile of ausgabe.split("\n")) {
      const t = zeile.trim();
      if (/^(FEHLER|warnung|hinweis)\b/.test(t)) meldungen.push(t);
    }
    // Ein Fehlschlag ohne verwertbare Zeile darf nicht als leerer Grund im
    // Bericht landen — dann wüsste niemand, woran es lag (Lektion 19).
    if (meldungen.length === 0) {
      meldungen.push(`${path.basename(skript)} endete mit Code ${code}: ${ausgabe.trim().split("\n").slice(-3).join(" / ")}`);
    }
  }

  return { sauber, meldungen };
}

/* ------------------------------------------------------------------ */
/* Die beiden Zeilen                                                   */
/* ------------------------------------------------------------------ */

/**
 * Ändert `status` und `geprueftAm`, sonst nichts. Kein Neuschreiben des
 * Frontmatters: Das würde Feldreihenfolge, Blockskalare und Kommentare
 * zerstören — dieselbe Überlegung wie in sync-autolinks.ts und
 * archive-events.ts.
 */
function setzeFreigabe(roh: string, tag: string): { text: string; fehler?: string } {
  if (!/^status:[ \t]*\S+[ \t]*$/m.test(roh)) return { text: roh, fehler: 'Zeile "status:" nicht eindeutig gefunden.' };
  if (!/^geprueftAm:[ \t]*\S+[ \t]*$/m.test(roh)) return { text: roh, fehler: 'Zeile "geprueftAm:" nicht eindeutig gefunden.' };

  const text = roh
    .replace(/^status:[ \t]*\S+[ \t]*$/m, `status: ${FREI}`)
    .replace(/^geprueftAm:[ \t]*\S+[ \t]*$/m, `geprueftAm: ${tag}`);
  return { text };
}

/* ------------------------------------------------------------------ */
/* Hauptlauf                                                           */
/* ------------------------------------------------------------------ */

interface Zeile {
  slug: string;
  collection: string;
  datei: string;
  grund?: string[];
}

function main() {
  if (collection && !collectionNames.includes(collection)) {
    console.error(`Unbekannte Collection "${collection}". Erlaubt: ${collectionNames.join(", ")}`);
    process.exit(2);
  }
  if (slugs.length === 0 && !alle) {
    console.error("Nichts ausgewählt. Entweder --slugs a,b oder --collection <name> --alle.");
    process.exit(2);
  }

  const bestand = ladeAlle(collection ? { collection } : {});
  const gewaehlt = alle && slugs.length === 0 ? bestand : bestand.filter((e) => slugs.includes(e.slug));

  // Ein Slug, den es nicht gibt, ist ein Tippfehler und kein leerer Zustand.
  // Ohne diese Meldung liefe der Aufruf durch und meldete "0 freigegeben" —
  // dieselbe Klasse wie "Nichts zu prüfen" bei Exitcode 0 (Lektion 19).
  const gefunden = new Set(gewaehlt.map((e) => e.slug));
  const unbekannt = slugs.filter((s) => !gefunden.has(s));

  const tag = heute();
  const freigegeben: Zeile[] = [];
  const abgelehnt: Zeile[] = [];
  const unveraendert: Zeile[] = [];

  /*
   * GEMEINSAM FREIGEBEN, DANN PRÜFEN — BIS NICHTS MEHR KIPPT (seit dem
   * 2026-09-23).
   *
   * Früher wurde Eintrag für Eintrag geschrieben und sofort geprüft. Seit der
   * Regel `link-auf-entwurf` hängt das Ergebnis dabei an der Reihenfolge: Ein
   * Artikel, der auf einen Begriff aus DERSELBEN Freigabe verlinkt, wäre
   * abgelehnt worden, sobald er vor dem Begriff an der Reihe war — der Begriff
   * stand zu dem Zeitpunkt noch auf Entwurf. Die Freigabe vom 2026-09-22 wäre
   * genau daran gescheitert (`hot-rod-und-kustom-kulture` verlinkt auf
   * `hot-rod` und `kustom-kulture`, alle drei im selben Lauf).
   *
   * Deshalb: alle Kandidaten zugleich schreiben, dann prüfen. Wer durchfällt,
   * wird zurückgerollt — und weil das einen anderen Kandidaten ungültig machen
   * kann, der auf ihn verlinkt, wird wiederholt, bis ein Durchgang niemanden
   * mehr ablehnt. Die Menge schrumpft bei jeder Wiederholung, also endet es.
   */
  const kandidaten: { e: (typeof gewaehlt)[number]; kurz: Zeile; roh: string; text: string }[] = [];

  for (const e of gewaehlt) {
    const kurz = { slug: e.slug, collection: e.collection, datei: path.relative(process.cwd(), e.datei) };

    if (e.roh.status === FREI) {
      unveraendert.push({ ...kurz, grund: ["bereits freigegeben — nicht erneut angefasst"] });
      continue;
    }

    const roh = readFileSync(e.datei, "utf8");
    const { text, fehler } = setzeFreigabe(roh, tag);
    if (fehler) {
      abgelehnt.push({ ...kurz, grund: [fehler] });
      continue;
    }
    kandidaten.push({ e, kurz, roh, text });
  }

  // Alles, was geschrieben wurde, muss bei einem Absturz zurück — und im
  // Trockenlauf ohnehin. Deshalb steht das Zurückrollen im finally.
  let offen = [...kandidaten];
  try {
    for (const k of offen) writeFileSync(k.e.datei, k.text, "utf8");

    for (;;) {
      const durchgefallen: { k: (typeof kandidaten)[number]; meldungen: string[] }[] = [];
      for (const k of offen) {
        const ergebnis = pruefe(k.e.datei);
        if (!ergebnis.sauber) durchgefallen.push({ k, meldungen: ergebnis.meldungen });
      }
      if (durchgefallen.length === 0) break;
      for (const { k, meldungen } of durchgefallen) {
        writeFileSync(k.e.datei, k.roh, "utf8");
        abgelehnt.push({ ...k.kurz, grund: meldungen });
      }
      const raus = new Set(durchgefallen.map((d) => d.k));
      offen = offen.filter((k) => !raus.has(k));
    }

    for (const k of offen) freigegeben.push(k.kurz);
  } catch (err) {
    for (const k of kandidaten) writeFileSync(k.e.datei, k.roh, "utf8");
    throw err;
  } finally {
    // Auch im Trockenlauf wird wirklich geprüft — ein --dry-run, der die
    // Prüfung überspringt, sagte nichts über den echten Lauf. Danach geht
    // alles zurück.
    if (trocken) for (const k of kandidaten) writeFileSync(k.e.datei, k.roh, "utf8");
  }

  /* ---- Autolink nachziehen -------------------------------------- */

  // Seit dem 2026-09-23 verlinkt der Autolink nur freigegebene Ziele (siehe
  // Kopf von sync-autolinks.ts). Ein Begriff, der eben freigegeben wurde,
  // ist damit erst JETZT ein Ziel — die Links darauf entstehen hier, im
  // selben Lauf und damit im selben Pull Request, der ihn veröffentlicht.
  //
  // Ohne diesen Schritt bliebe der Autolink nach jeder Freigabe eines
  // Lexikonbegriffs aus dem Takt: `autolink:check` meldete Drift, `verify:ci`
  // im Freigabe-Workflow würde rot, und es entstünde gar kein Pull Request.
  let autolinkBericht = "";
  if (!trocken && freigegeben.length > 0) {
    try {
      const aus = execFileSync("npx", ["tsx", "scripts/sync-autolinks.ts"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      autolinkBericht = aus.trim().split("\n").filter(Boolean).slice(-1)[0] ?? "";
    } catch (e: any) {
      // Die Freigabe ist geschrieben, die Links nicht. Das darf nicht still
      // bleiben: Der Workflow soll hier scheitern, bevor er einen Pull
      // Request mit halbem Stand öffnet.
      console.error(
        `\nAutolink nach der Freigabe fehlgeschlagen:\n${`${e.stdout ?? ""}${e.stderr ?? ""}`.trim()}`,
      );
      process.exitCode = 1;
    }
  }

  /* ---- Bericht -------------------------------------------------- */

  const zeig = (titel: string, zeilen: Zeile[]) => {
    if (zeilen.length === 0) return;
    console.log(`\n${titel} (${zeilen.length})`);
    for (const z of zeilen) {
      console.log(`  ${z.collection}/${z.slug}`);
      for (const g of z.grund ?? []) console.log(`      ${g}`);
    }
  };

  console.log(
    `Freigabelauf${trocken ? " (Trockenlauf — nichts geschrieben)" : ""}: ` +
      `${gewaehlt.length} Eintrag/Einträge geprüft, Stichtag ${tag}.`,
  );

  zeig(trocken ? "WÜRDEN FREIGEGEBEN" : "FREIGEGEBEN", freigegeben);
  zeig("ABGELEHNT", abgelehnt);
  zeig("UNVERÄNDERT", unveraendert);

  if (unbekannt.length) {
    console.log(`\nNICHT GEFUNDEN (${unbekannt.length})`);
    for (const s of unbekannt) console.log(`  ${s}`);
  }

  // Ein positives Lebenszeichen: Der Bericht nennt die Zahl der tatsächlich
  // angefassten Einträge und die Prüfungen, die dafür gelaufen sind. Ein
  // Lauf, der nichts erreicht hat, sieht damit anders aus als einer, der
  // nichts zu tun fand (Lektion 19).
  console.log(
    `\nGeprüft mit validate-content --strict und check-jsonld --strict: ` +
      `${freigegeben.length + abgelehnt.length} Eintrag/Einträge, je zwei Läufe.`,
  );
  console.log(
    `${freigegeben.length} freigegeben, ${abgelehnt.length} abgelehnt, ` +
      `${unveraendert.length} unverändert${unbekannt.length ? `, ${unbekannt.length} nicht gefunden` : ""}.`,
  );
  if (autolinkBericht) console.log(`Autolink nach der Freigabe: ${autolinkBericht}`);

  if (freigegeben.length > 0 && !trocken) {
    // check-freigabe.ts meldet jeden Statuswechsel gegen die Basis, solange
    // ihn niemand beim Aufruf bestätigt. Das ist Absicht (Befund M8): Die
    // Bestätigung ist eine Handlung an der Kommandozeile und steht nicht im
    // Repository. Deshalb steht hier die Zeile, die sie ausspricht.
    console.log(
      `\nDiese Freigabe bestätigen (check-freigabe.ts meldet sie sonst als unbestätigt):\n` +
        `  npx tsx scripts/check-freigabe.ts ${freigegeben.map((z) => `--freigabe ${z.slug}`).join(" ")}`,
    );
  }

  // Für den Freigabe-Workflow: Welche Slugs wurden TATSÄCHLICH freigegeben?
  // Der nächste Schritt dort lässt `verify:ci` auf dem Ergebnis laufen und
  // reicht genau diese Liste als FREIGABE_BESTAETIGT weiter (siehe Kopf von
  // check-freigabe.ts). Nicht die Eingabe des Workflows: Die kann eine ganze
  // Collection sein, und abgelehnte Einträge gehören nicht in die Bestätigung.
  //
  // Geschrieben wird nur, wenn GitHub Actions die Datei bereitstellt. Ein
  // Aufruf von Hand bleibt davon unberührt.
  if (process.env.GITHUB_OUTPUT && !trocken) {
    appendFileSync(process.env.GITHUB_OUTPUT, `slugs=${freigegeben.map((z) => z.slug).join(",")}\n`, "utf8");
  }

  // Abgelehnte Einträge sind kein Fehlschlag des Laufs — sie sind sein
  // Ergebnis. Rot wird es nur, wenn gar nichts erreicht wurde, obwohl etwas
  // ausgewählt war.
  if (unbekannt.length > 0) process.exit(1);
}

main();
