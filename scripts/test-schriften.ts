#!/usr/bin/env -S npx tsx
/**
 * test-schriften.ts — sind die Schriften so eingebunden, wie entschieden?
 *
 * Entscheidung 2026-10-02 (ENTSCHEIDUNGEN.md, DESIGN-BRIEF.md): vier
 * statische Schnitte, selbst gehostet, keine Einbindung von Google Fonts
 * (Datenschutz: kein Abruf bei Dritten; Ladegewicht: gemessen 76 KB).
 * Diese Regeln stehen sonst nur in Prosa — und eine Schrift, die still
 * ausfällt, sieht man nicht: Der Browser nimmt einfach die Systemschrift.
 *
 * Geprüft:
 *   1. Jede `url()` in src/styles/schriften.css zeigt auf eine vorhandene
 *      .woff2-Datei unter public/.
 *   2. Jede Schriftfamilie, die tokens.css nennt und die keine
 *      Systemschrift ist, hat ein @font-face.
 *   3. Das Ladegewicht aller Dateien bleibt unter dem Budget.
 *   4. Zu jeder Familie liegt ein Lizenztext (OFL) bei den Dateien.
 *   5. Die vorgeladene Datei im BasisLayout existiert und ist eingebunden.
 *   6. Nirgends unter src/ steht ein Abruf von Google Fonts.
 *
 *   npx tsx scripts/test-schriften.ts [projektverzeichnis]
 *
 * Das optionale Verzeichnis ist für den Mutationsbeleg: eine Kopie mit
 * absichtlich kaputten Daten, gegen die genau die erwarteten Prüfungen
 * fallen müssen.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const PROJEKT = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
/** Gemessen 76 KB; das Budget lässt Luft für einen Austausch, nicht für einen fünften Schnitt. */
const BUDGET_KB = 90;
/** Familien, die das System mitbringt — für sie gibt es kein @font-face. */
const SYSTEM = new Set([
  "georgia", "iowan old style", "serif", "sans-serif", "ui-serif", "ui-sans-serif", "system-ui",
  "-apple-system", "segoe ui", "arial narrow", "roboto condensed", "sans-serif-condensed",
]);

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") => {
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
};
const lies = (rel: string) => readFileSync(path.join(PROJEKT, rel), "utf8");

const schriftenCss = lies("src/styles/schriften.css");
const tokensCss = lies("src/styles/tokens.css");

/* --- 1. Dateien ------------------------------------------------------- */
const urls = [...schriftenCss.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
pruefe("schriften.css bindet überhaupt Dateien ein (Lebenszeichen)", urls.length > 0, "keine url() gefunden");
for (const u of urls) {
  const datei = path.join(PROJEKT, "public", u);
  pruefe(`Schriftdatei vorhanden: ${u}`, existsSync(datei));
  pruefe(`Schriftdatei ist woff2: ${u}`, u.endsWith(".woff2"));
}

/* --- 2. Familien ------------------------------------------------------ */
const definiert = new Set(
  [...schriftenCss.matchAll(/font-family:\s*"([^"]+)"/g)].map((m) => m[1].toLowerCase()),
);
const genannt = new Set<string>();
for (const m of tokensCss.matchAll(/--schrift-[a-z]+:\s*([^;]+);/g)) {
  if (m[1].trim().startsWith("var(")) continue;
  for (const teil of m[1].split(",")) genannt.add(teil.trim().replace(/^"|"$/g, "").toLowerCase());
}
const eigene = [...genannt].filter((f) => !SYSTEM.has(f));
pruefe("tokens.css nennt eigene Schriften (Lebenszeichen)", eigene.length > 0);
for (const f of eigene) pruefe(`@font-face für „${f}"`, definiert.has(f), "in tokens.css genannt, in schriften.css nicht definiert");

/* --- 3. Budget -------------------------------------------------------- */
const summe = urls
  .map((u) => path.join(PROJEKT, "public", u))
  .filter((d) => existsSync(d))
  .reduce((s, d) => s + statSync(d).size, 0);
pruefe(`Ladegewicht unter ${BUDGET_KB} KB`, summe > 0 && summe <= BUDGET_KB * 1024, `${Math.round(summe / 1024)} KB`);

/* --- 4. Lizenz -------------------------------------------------------- */
for (const familie of ["archivo", "newsreader"]) {
  const lizenz = path.join(PROJEKT, "public", "schriften", `OFL-${familie}.txt`);
  pruefe(`Lizenztext für ${familie}`, existsSync(lizenz) && /SIL OPEN FONT LICENSE/i.test(readFileSync(lizenz, "utf8")));
}

/* --- 5. Vorladen ------------------------------------------------------ */
const layout = lies("src/layouts/BasisLayout.astro");
const preload = [...layout.matchAll(/rel="preload" href="([^"]+)" as="font"/g)].map((m) => m[1]);
pruefe("BasisLayout lädt eine Schrift vor (Lebenszeichen)", preload.length > 0);
for (const p of preload) {
  pruefe(`vorgeladene Datei existiert: ${p}`, existsSync(path.join(PROJEKT, "public", p)));
  pruefe(`vorgeladene Datei ist eingebunden: ${p}`, urls.includes(p), "Vorladen ohne @font-face lädt umsonst");
}

/* --- 6. Kein Google Fonts ---------------------------------------------- */
const dateien = fg.sync(["src/**/*.{astro,css,ts,mjs,js,md,html}"], { cwd: PROJEKT, dot: false });
pruefe("src/ enthält Dateien (Lebenszeichen)", dateien.length > 0);
const treffer = dateien.filter((d) => /fonts\.(googleapis|gstatic)\.com/.test(lies(d)));
pruefe("kein Abruf von Google Fonts unter src/", treffer.length === 0, treffer.join(", "));

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
