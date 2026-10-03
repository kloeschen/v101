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
 * ZWEITER ANLASS (2026-10-02, Etappe 3 der Plattenhülle): Nicht nur der
 * Feldname, auch der WERT kann roh erscheinen. Die Lexikon-Kategorie stand
 * als „mode" im Faktenblock, weil Auswahlwerte durch eine gemeinsame
 * Tabelle für alle Felder laufen und unbekannte Werte durchreichen. Teil 2
 * rendert deshalb jeden Wert jedes Auswahlfelds im Faktenblock, so wie die
 * Seite es tut, und verlangt Text statt Schlüssel.
 *
 *   npx tsx scripts/test-beschriftung.ts
 */
import { fehlendeBeschriftungen, BESCHRIFTUNGEN, faktZeilen } from "../src/lib/faktenblock";
import { collectionSchemas, type CollectionName } from "../src/content/_schemas";
import { faktenblockFelder } from "../src/lib/jsonld";
import { buildRegistry } from "../src/lib/links";

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

/* --- 2. Werte der Auswahlfelder --------------------------------------- */

/** Zod-Hüllen (optional, default, pipe …) abwickeln bis zum Enum. */
function optionen(t: any): string[] | undefined {
  for (let i = 0; i < 10 && t; i++) {
    if (Array.isArray(t.options) && t.options.every((o: unknown) => typeof o === "string")) return t.options;
    const d = t._def ?? t.def;
    t = d?.innerType ?? d?.schema ?? d?.in;
  }
  return undefined;
}
function form(s: any): Record<string, any> | undefined {
  for (let i = 0; i < 10 && s; i++) {
    if (s.shape) return s.shape;
    const d = s._def ?? s.def;
    s = d?.schema ?? d?.innerType ?? d?.in;
  }
  return undefined;
}

const leer = buildRegistry([]);
const roh: string[] = [];
let gerendert = 0;
for (const collection of Object.keys(collectionSchemas) as CollectionName[]) {
  const shape = form((collectionSchemas as any)[collection]);
  for (const feld of faktenblockFelder[collection]) {
    for (const wert of optionen(shape?.[feld]) ?? []) {
      const zeile = faktZeilen(collection, { [feld]: wert }, leer).find((z) => z.feld === feld);
      if (!zeile) continue; // bewusst ausgelassen, etwa „unbekannt"
      gerendert++;
      const text = zeile.stuecke.map((s) => s.text).join(" ");
      if (text === wert) roh.push(`${collection}.${feld}=${wert}`);
    }
  }
}
// Lebenszeichen: Es wurden überhaupt Auswahlwerte gerendert.
pruefe("Auswahlwerte im Faktenblock gefunden und gerendert (Lebenszeichen)", gerendert > 50, String(gerendert));
pruefe("kein Auswahlwert erscheint roh", roh.length === 0, roh.join(", "));

// Die beiden Felder mit eigenem Namen und Link, an je einem Wert festgemacht.
const kat = faktZeilen("lexikon", { kategorie: "tattoo" }, leer).find((z) => z.feld === "kategorie")?.stuecke[0];
pruefe("Kategorie tattoo heißt Tattoo, nicht Tattoo-Studio", kat?.text === "Tattoo", JSON.stringify(kat));
pruefe("Kategorie verlinkt ihre Facettenseite", kat?.href === "/lexikon/kategorie/tattoo/", JSON.stringify(kat));
const sae = faktZeilen("artikel", { saeule: "kustom-kulture" }, leer).find((z) => z.feld === "saeule")?.stuecke[0];
pruefe("Themenbereich kustom-kulture heißt Kustom Kulture", sae?.text === "Kustom Kulture", JSON.stringify(sae));
pruefe("Themenbereich verlinkt seine Facettenseite", sae?.href === "/artikel/saeule/kustom-kulture/", JSON.stringify(sae));

// Musik und Tanz getrennt (Entscheidung 2026-10-03, src/lib/genres.ts).
// Ein Termin mit einem Musik- und einem Tanzeintrag zeigt zwei Zeilen,
// eine Band mit denselben Daten behält ihre eine Zeile „Genres".
{
  const reg = buildRegistry([
    { collection: "lexikon", slug: "rockabilly", daten: { name: "Rockabilly", kategorie: "genre" } },
    { collection: "lexikon", slug: "boogie-woogie-tanz", daten: { name: "Boogie-Woogie (Tanz)", kategorie: "tanz" } },
  ]);
  const zeilen = faktZeilen("events", { genres: ["boogie-woogie-tanz", "rockabilly"] }, reg);
  const musik = zeilen.find((z) => z.feld === "genres");
  const tanz = zeilen.find((z) => z.feld === "genres-tanz");
  pruefe("Termin: Musik steht unter „Musik\"", musik?.label === "Musik" && musik.stuecke.map((s) => s.text).join() === "Rockabilly", JSON.stringify(musik));
  pruefe("Termin: Tanz steht unter „Tanz\" und ist verlinkt", tanz?.label === "Tanz" && tanz.stuecke[0]?.href === "/lexikon/boogie-woogie-tanz/", JSON.stringify(tanz));
  pruefe("Termin: keine Zeile „Genres\" mehr", !zeilen.some((z) => z.label === "Genres"), JSON.stringify(zeilen));
  const nurMusik = faktZeilen("events", { genres: ["rockabilly"] }, reg);
  pruefe("Termin ohne Tanz: keine leere Zeile „Tanz\"", !nurMusik.some((z) => z.feld === "genres-tanz"), JSON.stringify(nurMusik));
  const band = faktZeilen("bands", { genres: ["rockabilly"] }, reg).find((z) => z.feld === "genres");
  pruefe("Band: Zeile heißt weiter „Genres\"", band?.label === "Genres", JSON.stringify(band));
}

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
