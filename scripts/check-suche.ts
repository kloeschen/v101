#!/usr/bin/env -S npx tsx
/**
 * check-suche.ts — trägt der Suchindex, was die Entscheidung verspricht?
 *
 * Entscheidung 2026-10-02 (ENTSCHEIDUNGEN.md): Suche mit Pagefind, Index
 * beim Build. Zugesagt ist zweierlei, und beides sieht man einer Seite
 * nicht an: (a) jede Inhaltsseite ist im Index, (b) keine Seite außer
 * /suche/ lädt dafür etwas. Ein fehlender Index fällt erst auf, wenn
 * jemand sucht und nichts findet — still, wie eine fehlende Schrift.
 *
 * Läuft nach `npm run build` gegen dist/.
 *
 * Geprüft:
 *   1. Pagefind hat einen Index geschrieben (dist/pagefind/…).
 *   2. Die Zahl der indexierten Seiten ist genau die Zahl der Seiten mit
 *      `data-pagefind-body` — und beides ist nicht null.
 *   3. Bekannte Inhaltsseiten tragen das Attribut (Lebenszeichen); /suche/
 *      und die 404 tragen es nicht.
 *   4. Das Formular im Kopf führt auf eine Seite, die es gibt.
 *   5. Nur /suche/ lädt Pagefind.
 *
 *   npx tsx scripts/check-suche.ts [dist-verzeichnis]
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.resolve(process.argv[2] ?? path.join(PROJEKT, "dist"));

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") => {
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* --- 1. Index --------------------------------------------------------- */
const eintritt = path.join(DIST, "pagefind", "pagefind-entry.json");
pruefe("Pagefind hat einen Index geschrieben", existsSync(eintritt) && existsSync(path.join(DIST, "pagefind", "pagefind.js")));

/* --- 2. Seitenzahl ---------------------------------------------------- */
const seiten = fg.sync("**/*.html", { cwd: DIST });
const html = new Map(seiten.map((s) => [s, readFileSync(path.join(DIST, s), "utf8")]));
const mitBody = seiten.filter((s) => /<main[^>]*\sdata-pagefind-body/.test(html.get(s)!));
let indexiert = -1;
if (existsSync(eintritt)) {
  const e = JSON.parse(readFileSync(eintritt, "utf8"));
  indexiert = Object.values<{ page_count: number }>(e.languages ?? {}).reduce((s, l) => s + (l.page_count ?? 0), 0);
}
pruefe("Seiten mit data-pagefind-body vorhanden (Lebenszeichen)", mitBody.length > 0, String(mitBody.length));
pruefe(
  "Index enthält genau die markierten Seiten",
  indexiert === mitBody.length,
  `Index ${indexiert}, markiert ${mitBody.length}`,
);

/* --- 3. Stichproben --------------------------------------------------- */
for (const s of ["index.html", "lexikon/rockabilly/index.html", "events/index.html"]) {
  pruefe(`im Index: /${s.replace(/index\.html$/, "")}`, mitBody.includes(s), html.has(s) ? "Attribut fehlt" : "Seite fehlt im Build");
}
for (const s of ["suche/index.html", "404.html"]) {
  pruefe(`nicht im Index: /${s}`, html.has(s) && !mitBody.includes(s), html.has(s) ? "trägt data-pagefind-body" : "Seite fehlt im Build");
}

/* --- 4. Formular ------------------------------------------------------ */
const mitFormular = seiten.filter((s) => /<form[^>]*class="kopf__suche"/.test(html.get(s)!));
pruefe("Kopf mit Suchformular auf den Seiten (Lebenszeichen)", mitFormular.length > 0);
const falscheZiele = mitFormular.filter((s) => !/<form[^>]*class="kopf__suche"[^>]*action="\/suche\/"/.test(html.get(s)!));
pruefe("Suchformular führt überall auf /suche/", falscheZiele.length === 0, falscheZiele.slice(0, 5).join(", "));
pruefe("/suche/ existiert", html.has("suche/index.html"));

/* --- 5. Kosten -------------------------------------------------------- */
// Gesucht wird ein Verweis auf das Verzeichnis /pagefind/ (Skript, Stil,
// Import) — nicht das Wort: `data-pagefind-ignore` und `-body` sind
// Markierungen für den Indexer und laden nichts. Die erste Fassung prüfte
// das Wort und schlug am 2026-10-02 auf 30 Seiten falsch an.
const laden = seiten.filter((s) => s !== "suche/index.html" && /["'(]\/pagefind\//.test(html.get(s)!));
pruefe("nur /suche/ lädt Pagefind", laden.length === 0, laden.slice(0, 5).join(", "));

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen (${mitBody.length} Seiten im Index)`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
