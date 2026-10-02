#!/usr/bin/env -S npx tsx
/**
 * test-ressorts.ts — trägt jeder Eintrag die Katalognummer seines Ressorts?
 *
 * DESIGN-BRIEF.md, „Katalognummern": V101-01 Musik bis -06 Szene, über
 * Artikeln und Lexikoneinträgen des Ressorts. Die Zuordnung steht in
 * src/lib/ressorts.ts (`ressortVon`) — für Lexikoneinträge über die
 * Kategorie, für Artikel über den Themenbereich.
 *
 *   npx tsx scripts/test-ressorts.ts
 */
import { RESSORTS, ressortVon } from "../src/lib/ressorts";
import { lexikonSchema, artikelSchema } from "../src/content/_schemas";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const nummer = (c: string, d: Record<string, any>) => ressortVon(c, d)?.nummer;

// Positive Fälle zuerst (Lebenszeichen).
pruefe("Lexikon mode → V101-02", nummer("lexikon", { kategorie: "mode" }) === "V101-02");
pruefe("Lexikon genre → V101-01", nummer("lexikon", { kategorie: "genre" }) === "V101-01");
pruefe("Artikel mode → V101-02", nummer("artikel", { saeule: "mode" }) === "V101-02");
pruefe("Artikel musik → V101-01", nummer("artikel", { saeule: "musik" }) === "V101-01");
pruefe("Artikel kustom-kulture → V101-04 Autos", nummer("artikel", { saeule: "kustom-kulture" }) === "V101-04");
// Und was keins hat.
pruefe("Lexikon instrument → keins", nummer("lexikon", { kategorie: "instrument" }) === undefined);
pruefe("Artikel geschichte → keins", nummer("artikel", { saeule: "geschichte" }) === undefined);
pruefe("Event → keins, auch mit passendem Feld", nummer("events", { kategorie: "mode", saeule: "mode" }) === undefined);
pruefe("Artikel mit Kategorie statt Themenbereich → keins", nummer("artikel", { kategorie: "mode" }) === undefined);

// Jede Ressort-Kategorie gibt es im Datenvertrag, und jedes Ressort ist von
// beiden Sammlungen aus erreichbar — sonst stünde eine Nummer nie irgendwo.
const kategorien: string[] = (lexikonSchema as any).shape.kategorie.options;
const saeulen: string[] = (artikelSchema as any).shape.saeule.options;
pruefe("Optionen aus dem Datenvertrag gelesen (Lebenszeichen)", kategorien.length > 5 && saeulen.length > 5);
for (const r of RESSORTS) {
  pruefe(`${r.nummer}: Kategorie „${r.kategorie}" steht im Datenvertrag`, kategorien.includes(r.kategorie));
  pruefe(`${r.nummer}: aus dem Lexikon erreichbar`, kategorien.some((k) => ressortVon("lexikon", { kategorie: k }) === r));
  pruefe(`${r.nummer}: aus den Artikeln erreichbar`, saeulen.some((s) => ressortVon("artikel", { saeule: s }) === r));
}

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
