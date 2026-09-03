#!/usr/bin/env -S npx tsx
/**
 * test-pruefkette.ts — die Sperre gegen Befund M10.
 *
 * M10 war nicht, dass `check-freigabe.ts` fehlerhaft war. Es war, dass das
 * Skript existierte, lokal lief, grün aussah — und in der CI schlicht nicht
 * aufgerufen wurde. Zwei Gründe, beide still: `ci.yml` zählte seine Schritte
 * einzeln auf und rief `npm run verify` nie auf, und selbst mit Schritt
 * hätte dem Vergleich die Basis gefehlt. Aufgefallen ist es erst, als jemand
 * ins Job-Log sah. Ein grüner Lauf hatte nichts bewiesen.
 *
 * Diese Datei macht daraus eine Bedingung. Sie prüft dreierlei:
 *
 *   1. `ci.yml` ruft die Kette auf, statt Schritte aufzuzählen. Damit gibt es
 *      genau eine Stelle, an der ein Prüfschritt eingetragen wird, und die
 *      liegt in package.json — nicht hinter einer Agentensperre.
 *   2. Jede Datei `scripts/check-*.ts` und `scripts/test-*.ts` ist von
 *      `verify:ci` aus erreichbar, direkt oder über ein anderes npm-Skript.
 *      Genau das war bei `check-freigabe.ts` nicht der Fall.
 *   3. Der Checkout holt die volle Historie. Ohne sie hat die
 *      Freigabeprüfung keine Basis, und `--basis-pflicht` würde die CI
 *      dauerhaft rot färben statt zu prüfen.
 *
 * Ausnahmen sind erlaubt, aber nur ausdrücklich und mit Begründung: siehe
 * AUSNAHMEN. Eine stillschweigende Lücke ist genau der Zustand, den M10
 * beschreibt.
 *
 *   npx tsx scripts/test-pruefkette.ts
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Ausnahmen — jede mit Grund, keine stillschweigende Lücke            */
/* ------------------------------------------------------------------ */

const AUSNAHMEN: Record<string, string> = {
  "check-links.ts":
    "Ruft das Netz. Läuft wöchentlich über .github/workflows/linkcheck.yml und " +
    "eröffnet dort bei toten Links ein Issue. Gehört nicht in jeden PR-Lauf: " +
    "Ein fremder Server, der gerade hustet, ist kein Grund, einen Merge zu " +
    "blockieren (Lektion 4 — ein roter Lauf muss einen echten Fehler bedeuten).",
};

/* ------------------------------------------------------------------ */
/* Erreichbarkeit aus verify:ci                                        */
/* ------------------------------------------------------------------ */

const paket = JSON.parse(readFileSync(path.join(PROJEKT, "package.json"), "utf8"));
const skripte: Record<string, string> = paket.scripts ?? {};

/**
 * Alle `scripts/*.ts`, die von einem npm-Skript aus erreichbar sind.
 * Folgt `npm run <name>` transitiv und sammelt jedes `scripts/<datei>.ts`.
 */
function erreichbar(start: string): { dateien: Set<string>; besucht: Set<string> } {
  const dateien = new Set<string>();
  const besucht = new Set<string>();
  const offen = [start];

  while (offen.length) {
    const name = offen.pop()!;
    if (besucht.has(name)) continue;
    besucht.add(name);
    const rumpf = skripte[name];
    if (rumpf === undefined) continue;

    for (const m of rumpf.matchAll(/scripts\/([A-Za-z0-9._-]+\.ts)/g)) dateien.add(m[1]);
    for (const m of rumpf.matchAll(/npm run (?:--silent )?([A-Za-z0-9:_-]+)/g)) offen.push(m[1]);
  }
  return { dateien, besucht };
}

pruefe("package.json kennt das Skript verify:ci", typeof skripte["verify:ci"] === "string", Object.keys(skripte).join(", "));

const { dateien: erreichteDateien, besucht } = erreichbar("verify:ci");

const pruefskripte = readdirSync(path.join(PROJEKT, "scripts"))
  .filter((d) => /^(check|test)-.*\.ts$/.test(d))
  .sort();

pruefe("es gibt überhaupt Prüfskripte zu prüfen", pruefskripte.length > 0, String(pruefskripte.length));

for (const datei of pruefskripte) {
  const grund = AUSNAHMEN[datei];
  if (grund) {
    // Eine Ausnahme, die doch erreichbar ist, ist tote Konfiguration und
    // täuscht beim Lesen über den wahren Zustand hinweg.
    pruefe(
      `Ausnahme "${datei}" ist tatsächlich nicht in der Kette (sonst überflüssig)`,
      !erreichteDateien.has(datei),
      "Die Ausnahme kann entfernt werden — das Skript läuft bereits mit.",
    );
    continue;
  }
  pruefe(
    `${datei} ist von verify:ci aus erreichbar`,
    erreichteDateien.has(datei),
    `erreicht: ${[...erreichteDateien].sort().join(", ")}`,
  );
}

// Keine Karteileichen: Eine Ausnahme für eine gelöschte Datei verschleiert,
// was die Liste eigentlich aussagt.
for (const datei of Object.keys(AUSNAHMEN)) {
  pruefe(`Ausnahme "${datei}" bezeichnet eine existierende Datei`, pruefskripte.includes(datei));
  pruefe(`Ausnahme "${datei}" nennt einen Grund`, (AUSNAHMEN[datei] ?? "").length > 40);
}

// Die teuren Schritte müssen wirklich in der Kette hängen, nicht nur die
// billigen — sonst ist "verify:ci" ein Name ohne Inhalt.
for (const noetig of ["check", "build", "test", "freigabe:ci", "validate:strict", "jsonld:strict", "autolink:check", "check:zeit"]) {
  pruefe(`verify:ci erreicht das Skript "${noetig}"`, besucht.has(noetig), [...besucht].sort().join(", "));
}

/* ------------------------------------------------------------------ */
/* ci.yml ruft die Kette auf, statt Schritte aufzuzählen               */
/* ------------------------------------------------------------------ */

const ci = readFileSync(path.join(PROJEKT, ".github", "workflows", "ci.yml"), "utf8");

/** Alle Kommandozeilen aus `run:`-Schritten, ein- und mehrzeilig. */
function runBefehle(yaml: string): string[] {
  const aus: string[] = [];
  const zeilen = yaml.split("\n");
  for (let i = 0; i < zeilen.length; i++) {
    const einzeilig = zeilen[i].match(/^\s*(?:- )?run:\s*(?!\||>)(\S.*)$/);
    if (einzeilig) {
      aus.push(einzeilig[1].trim());
      continue;
    }
    if (/^\s*(?:- )?run:\s*[|>][-+]?\s*$/.test(zeilen[i])) {
      const einzug = (zeilen[i].match(/^(\s*)/) ?? ["", ""])[1].length;
      for (let j = i + 1; j < zeilen.length; j++) {
        if (zeilen[j].trim() === "") continue;
        const jetzt = (zeilen[j].match(/^(\s*)/) ?? ["", ""])[1].length;
        if (jetzt <= einzug) break;
        aus.push(zeilen[j].trim());
      }
    }
  }
  return aus;
}

const befehle = runBefehle(ci);
pruefe("ci.yml enthält run-Schritte", befehle.length > 0, JSON.stringify(befehle));
pruefe("ci.yml ruft npm run verify:ci auf", befehle.some((b) => /npm run verify:ci\b/.test(b)), JSON.stringify(befehle));

// Der eigentliche M10-Fehler: einzeln aufgezählte Prüfschritte. Erlaubt sind
// nur die Installation und die Kette selbst.
const erlaubt = /^(npm ci|npm run verify:ci)$/;
const aufgezaehlt = befehle.filter((b) => !erlaubt.test(b));
gleich("ci.yml zählt keine Prüfschritte einzeln auf", aufgezaehlt, []);

// Ohne volle Historie hat die Freigabeprüfung keine Basis, und
// --basis-pflicht würde die CI dauerhaft rot färben statt zu prüfen.
pruefe(
  "ci.yml holt die volle Historie (fetch-depth: 0)",
  /fetch-depth:\s*0/.test(ci),
  "Ohne fetch-depth: 0 findet check-freigabe.ts keine Vergleichsbasis.",
);

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
