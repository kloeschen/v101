#!/usr/bin/env -S npx tsx
/**
 * test-vorschaubild.ts — was auf den Vorschaubildern steht, und dass sie entstehen.
 *
 * Die Zeile unter dem Titel ist ein harter Fakt (Datum, Ort). Sie muss so
 * stimmen wie auf der Seite, auch an den Tagesgrenzen: Eine Party von 19
 * bis 1:30 Uhr ist ein Abend, kein Zeitraum über zwei Tage. Dazu ein
 * Lebenszeichen: Ein echtes Bild wird gezeichnet und hat das richtige
 * Format.
 *
 *   npx tsx scripts/test-vorschaubild.ts
 */
import { terminZeile, vorschauFuer, titelGroesse, zeichne, vorschauPfad, BREITE, HOEHE } from "../src/lib/vorschaubild";
import { pngMasse } from "./check-vorschaubilder";
import type { EintragMeta } from "../src/lib/links";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* --- Terminzeile ------------------------------------------------------ */
gleich("Abend mit Uhrzeit, Berliner Zeit", terminZeile(new Date("2026-10-17T19:00:00+02:00")), "Sa., 17.10.2026, 19:00 Uhr");
gleich(
  "Ende nach Mitternacht bleibt ein Abend",
  terminZeile(new Date("2026-10-17T19:00:00+02:00"), new Date("2026-10-18T01:30:00+02:00")),
  "Sa., 17.10.2026, 19:00 Uhr",
);
gleich(
  "Weekender über mehrere Tage als Zeitraum",
  terminZeile(new Date("2026-05-22T18:00:00+02:00"), new Date("2026-05-25T23:00:00+02:00")),
  "Fr., 22.05. – Mo., 25.05.2026",
);
gleich("ganztägig ohne Uhrzeit", terminZeile(new Date("2026-06-13T00:00:00+02:00"), undefined, true), "Sa., 13.06.2026");
// Die Zeitzonenfalle (Lektion 1): 23:30 Uhr Ortszeit ist in UTC schon der nächste Tag.
gleich("späte Uhrzeit bleibt am Ortstag", terminZeile(new Date("2026-12-31T23:30:00+01:00")), "Do., 31.12.2026, 23:30 Uhr");

/* --- Was auf dem Bild steht ------------------------------------------- */
const meta = (collection: string, name: string, daten: Record<string, any>): EintragMeta =>
  ({ collection, slug: "x", name, pfad: "/x/", url: "https://v101.de/x/", daten }) as EintragMeta;
const NAMEN: Record<string, string> = { "locations/testhalle": "Testhalle", "regionen/rhein-neckar": "Rhein-Neckar" };
const namen = (c: string, s: string): string | undefined => NAMEN[`${c}/${s}`];

gleich(
  "Termin: Datum und Ortsname",
  vorschauFuer(meta("events", "Testabend", { beginn: "2026-10-17T19:00:00+02:00", ort: "testhalle" }), "Events", namen),
  { sammlung: "Events", titel: "Testabend", zeile: "Sa., 17.10.2026, 19:00 Uhr · Testhalle" },
);
gleich(
  "Termin mit unbekanntem Ort: nur das Datum, kein Slug",
  vorschauFuer(meta("events", "Testabend", { beginn: "2026-10-17T19:00:00+02:00", ort: "gibtesnicht" }), "Events", namen).zeile,
  "Sa., 17.10.2026, 19:00 Uhr",
);
gleich(
  "Ort: Stadt und Region",
  vorschauFuer(meta("locations", "Astoria", { adresse: { ort: "Walldorf" }, region: "rhein-neckar" }), "Locations", namen).zeile,
  "Walldorf · Rhein-Neckar",
);
gleich("Band: Herkunft", vorschauFuer(meta("bands", "Mad Sin", { herkunftOrt: "Berlin" }), "Bands", namen).zeile, "aus Berlin");
gleich("Lexikon: keine Zeile", vorschauFuer(meta("lexikon", "Petticoat", {}), "Lexikon", namen).zeile, undefined);

/* --- Form ------------------------------------------------------------- */
pruefe("lange Titel werden kleiner", titelGroesse("x".repeat(70)) < titelGroesse("x".repeat(40)) && titelGroesse("x".repeat(40)) < titelGroesse("kurz"));
gleich("Eintrag bekommt eigenes Bild", vorschauPfad("events", "abc"), "/og/events/abc.png");
gleich("ohne Eintrag das Standardbild", vorschauPfad(), "/og/standard.png");

/* --- Lebenszeichen: ein echtes Bild ----------------------------------- */
const png = Buffer.from(await zeichne({ sammlung: "Events", titel: "Steyrtal Boogie Party, Oktober 2026", zeile: "Sa., 17.10.2026, 19:00 Uhr · Zorba der Grieche" }));
gleich("gezeichnetes Bild ist ein PNG im Zielformat", pngMasse(png), { breite: BREITE, hoehe: HOEHE });
pruefe("gezeichnetes Bild ist nicht leer", png.length > 10_000, `${png.length} Bytes`);
gleich("pngMasse erkennt Nicht-PNG", pngMasse(Buffer.from("kein bild, nur text, lang genug")), null);

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
