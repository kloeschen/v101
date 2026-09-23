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
 * Diese Datei macht daraus eine Bedingung. Sie prüft viererlei:
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
 *   4. Die lokale Kette `verify` erreicht jeden Schritt von `verify:ci`,
 *      selbst oder in einer ausdrücklich genannten milden Fassung. Sonst
 *      ist lokal grün, was nach dem Push rot wird (Lektion 27).
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
/* Die lokale Kette deckt jeden Schritt der CI-Kette                   */
/* ------------------------------------------------------------------ */

// Am 2026-09-23 war PR #39 lokal grün und in der CI rot: `verify:ci` prüft
// den Autolink-Drift, `verify` tat es nicht. CLAUDE.md verlangt vor jedem
// Commit `npm run verify` — ein Schritt, der nur in der CI hängt, fällt also
// erst nach dem Push auf (Lektion 27).
//
// Nachsichtiger darf die lokale Kette sein, lückenhafter nicht. Erlaubt ist
// je CI-Schritt genau eine nachsichtige Entsprechung, und nur die hier
// genannten; die Begründung steht im Kommentar "// verify" in package.json.
const NACHSICHTIG: Record<string, string> = {
  "freigabe:ci": "freigabe", // ohne --basis-pflicht: lokal fehlt oft die Basis
  "validate:strict": "validate", // Warnungen bleiben lokal Warnungen
  "jsonld:strict": "jsonld",
};

const ciSchritte = [...(skripte["verify:ci"] ?? "").matchAll(/npm run (?:--silent )?([A-Za-z0-9:_-]+)/g)].map((m) => m[1]);
// Lebenszeichen: Ohne erkannte Schritte wäre die Schleife unten leer und
// jede Lücke unsichtbar.
pruefe("verify:ci besteht aus erkennbaren Schritten", ciSchritte.length >= 5, JSON.stringify(ciSchritte));
pruefe("darunter der Autolink-Drift, an dem die Lücke auffiel", ciSchritte.includes("autolink:check"), JSON.stringify(ciSchritte));

const { besucht: lokalBesucht } = erreichbar("verify");
for (const schritt of ciSchritte) {
  const ersatz = NACHSICHTIG[schritt];
  pruefe(
    `verify erreicht den CI-Schritt "${schritt}"${ersatz ? ` oder seine nachsichtige Fassung "${ersatz}"` : ""}`,
    lokalBesucht.has(schritt) || (ersatz !== undefined && lokalBesucht.has(ersatz)),
    `verify erreicht: ${[...lokalBesucht].sort().join(", ")}`,
  );
}
for (const [streng, milde] of Object.entries(NACHSICHTIG)) {
  pruefe(`nachsichtige Fassung "${milde}" existiert als Skript`, typeof skripte[milde] === "string");
  pruefe(`"${streng}" ist wirklich ein Schritt von verify:ci`, ciSchritte.includes(streng), JSON.stringify(ciSchritte));
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
/* freigeben.yml prüft sein Ergebnis, bevor er den PR öffnet           */
/* ------------------------------------------------------------------ */
/*
 * SEIT DEM 2026-09-23. Der erste Freigabe-PR hätte `main` rot gemacht, und
 * keine Prüfung hätte es gezeigt: Die CI auf einem PR, den der Workflow mit
 * seinem Bot-Token öffnet, läuft gar nicht, und selbst wenn sie liefe, endete
 * `verify:ci` bei Schritt 3 von 9 — an der Freigabeprüfung, die auf einem
 * Freigabe-Ergebnis naturgemäß anschlägt. Tests und Build liefen nie.
 *
 * Deshalb lässt der Freigabe-Workflow die Kette selbst laufen, und zwar mit
 * den Slugs, die er gerade freigegeben hat, als Bestätigung
 * (FREIGABE_BESTAETIGT, siehe Kopf von check-freigabe.ts).
 *
 * Diese Prüfungen stehen hier und nicht in einer Beschreibung, weil
 * `.github/` hinter der Agentensperre liegt: Den Schritt setzt ein Mensch ein,
 * und ohne Prüfung wüsste niemand, ob er noch dasteht. Eine Sperre, die nie
 * geprüft wurde, ist wirkungslos, bis das Gegenteil gezeigt ist (Regel 6).
 */

const freigabeWorkflow = readFileSync(path.join(PROJEKT, ".github", "workflows", "freigeben.yml"), "utf8");

/** Die Schritte eines Jobs, je als Textblock ab dem `- `, das ihn beginnt. */
function schritte(yaml: string): string[] {
  const zeilen = yaml.split("\n");
  const start = zeilen.findIndex((z) => /^\s*steps:\s*$/.test(z));
  if (start < 0) return [];
  const bloecke: string[][] = [];
  let einzug = -1;
  for (let i = start + 1; i < zeilen.length; i++) {
    const z = zeilen[i] ?? "";
    const m = z.match(/^(\s*)- /);
    if (m && (einzug < 0 || (m[1] ?? "").length === einzug)) {
      einzug = (m[1] ?? "").length;
      bloecke.push([z]);
      continue;
    }
    // Weniger eingerückt als ein Schritt: der Job ist zu Ende.
    if (einzug >= 0 && z.trim() !== "" && ((z.match(/^(\s*)/) ?? ["", ""])[1] ?? "").length < einzug) break;
    bloecke[bloecke.length - 1]?.push(z);
  }
  return bloecke.map((b) => b.join("\n"));
}

const fSchritte = schritte(freigabeWorkflow);
const iLauf = fSchritte.findIndex((b) => /\bid:\s*lauf\b/.test(b));
const iKette = fSchritte.findIndex((b) => runBefehle(b).some((c) => /^npm run verify:ci$/.test(c)));
const iPr = fSchritte.findIndex((b) => /gh pr create/.test(b));

// Lebenszeichen für den Zerleger: Ohne erkannte Schritte wären alle
// folgenden Behauptungen aus demselben Grund falsch — und keine sagte etwas.
pruefe("freigeben.yml: Schritte werden erkannt", fSchritte.length >= 6, `erkannt: ${fSchritte.length}`);
pruefe("freigeben.yml: der Freigabelauf trägt id: lauf", iLauf >= 0);
pruefe("freigeben.yml: der Pull Request wird mit gh pr create geöffnet", iPr >= 0);

pruefe(
  "freigeben.yml lässt die Kette auf dem Freigabe-Ergebnis laufen (npm run verify:ci)",
  iKette >= 0,
  "Schritt fehlt — der Block steht in BETRIEB.md, Abschnitt \"Wo die Prüfkette läuft\", und im Kopf von check-freigabe.ts",
);
pruefe(
  "die Kette bekommt die freigegebenen Slugs als Bestätigung",
  iKette >= 0 && /FREIGABE_BESTAETIGT:\s*\$\{\{\s*steps\.lauf\.outputs\.slugs\s*\}\}/.test(fSchritte[iKette] ?? ""),
  fSchritte[iKette] ?? "(kein Kettenschritt)",
);
pruefe("sie läuft nach dem Freigabelauf", iLauf >= 0 && iKette > iLauf, `lauf=${iLauf}, kette=${iKette}`);
pruefe("und bevor der Pull Request entsteht", iPr >= 0 && iKette >= 0 && iKette < iPr, `kette=${iKette}, pr=${iPr}`);
pruefe(
  "freigeben.yml holt die volle Historie (fetch-depth: 0)",
  /fetch-depth:\s*0/.test(freigabeWorkflow),
  "Ohne sie findet freigabe:ci mit --basis-pflicht keine Basis.",
);

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
