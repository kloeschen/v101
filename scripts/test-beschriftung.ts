#!/usr/bin/env -S npx tsx
/**
 * test-beschriftung.ts — hat jedes Feld im Faktenblock eine Beschriftung?
 *
 * ANLASS (2026-10-02): Auf jeder Eventseite mit Veranstalter-Website stand
 * als Feldname „veranstalterUrl" — der Schlüssel aus dem Datenvertrag,
 * weil `LABEL` in src/lib/faktenblock.ts keinen Eintrag hatte und
 * `beschriftung()` dann still auf den Schlüssel zurückfällt. Aufgefallen
 * ist es erst beim Gestalten der Seite.
 *
 *   npx tsx scripts/test-beschriftung.ts
 */
import { fehlendeBeschriftungen, BESCHRIFTUNGEN } from "../src/lib/faktenblock";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);

const fehlend = fehlendeBeschriftungen();
pruefe(
  "jedes anzeigbare Feld ist beschriftet",
  fehlend.length === 0,
  fehlend.map((f) => `${f.collection}.${f.feld}`).join(", "),
);

// Lebenszeichen: Ohne eine Beschriftung muss die Prüfung genau dieses Feld
// melden — sonst wäre „nichts fehlt" auch das Ergebnis einer Prüfung, die
// nichts ansieht.
const ohne = { ...BESCHRIFTUNGEN };
delete ohne.veranstalterUrl;
const gemeldet = fehlendeBeschriftungen(ohne).map((f) => `${f.collection}.${f.feld}`);
pruefe("ohne Beschriftung wird events.veranstalterUrl gemeldet", gemeldet.includes("events.veranstalterUrl"), gemeldet.join(", "));
pruefe("…und nur dieses Feld", gemeldet.length === 1, gemeldet.join(", "));

for (const [feld, text] of Object.entries(BESCHRIFTUNGEN)) {
  pruefe(`Beschriftung für ${feld} ist kein Schlüssel`, text !== feld && /^[A-ZÄÖÜ]/.test(text), text);
}

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
