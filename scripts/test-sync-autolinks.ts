#!/usr/bin/env -S npx tsx
/**
 * test-sync-autolinks.ts — testet das einzige Skript, das in Quelldateien
 * schreibt, und zwar in einer Wegwerf-Arbeitskopie.
 *
 * Der Review hat es benannt: sync-autolinks war manuell geprüft, aber
 * unautomatisiert — ausgerechnet das Skript mit der größten Schadenswirkung,
 * falls es Frontmatter beschädigt oder nicht idempotent ist. Deshalb läuft es
 * hier als Kind-Prozess mit cwd auf einem Temp-Verzeichnis; die echten
 * Inhalte werden nie berührt.
 *
 *   npx tsx scripts/test-sync-autolinks.ts
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);

/* ------------------------------------------------------------------ */
/* Arbeitskopie aufbauen                                               */
/* ------------------------------------------------------------------ */

const wurzel = mkdtempSync(path.join(tmpdir(), "sync-autolinks-test-"));
const inhalt = (rel: string, text: string) => {
  const datei = path.join(wurzel, "src/content", rel);
  mkdirSync(path.dirname(datei), { recursive: true });
  writeFileSync(datei, text, "utf8");
  return datei;
};

const basis = `status: veroeffentlicht
erstelltAm: 2026-08-01
geprueftAm: 2026-08-01`;

inhalt(
  "lexikon/petticoat.md",
  `---
name: Petticoat
aliases: []
kurzbeschreibung: Der Petticoat ist ein versteifter Unterrock, der Kleidern und Röcken der 1950er Jahre ihre charakteristische Weite gibt.
${basis}
kategorie: mode
definition: Der Petticoat ist ein versteifter Unterrock der 1950er Jahre.
---

Der Petticoat ist ein versteifter Unterrock. Er gibt Kleidern ihre Form und gehört zu den bekanntesten Kleidungsstücken der Szene überhaupt, weit über die Tanzfläche hinaus sichtbar.
`,
);

// Die M1-Falle in einer Datei: (a) der Body beginnt wörtlich mit der
// kurzbeschreibung aus dem Frontmatter, (b) ein YAML-Wert enthält "---".
// Der alte indexOf-Ansatz konnte hier den Schnittpunkt verlieren.
const falleDatei = inhalt(
  "artikel/falle.md",
  `---
name: Ein Artikel über den Petticoat und seine Geschichte im Wandel
aliases: []
kurzbeschreibung: Ein Petticoat verändert die Silhouette vollständig und prägt damit den Gesamteindruck jedes Kleides der Ära nachhaltig.
${basis}
autor: markus
typ: spoke
saeule: mode
veroeffentlichtAm: 2026-08-01
redaktionsnotiz: Trenner im Wert --- absichtlich für den Test
---

Ein Petticoat verändert die Silhouette vollständig und prägt damit den Gesamteindruck jedes Kleides der Ära nachhaltig. Genau darum geht es in diesem Text, der die Falle aus dem Review nachstellt und ausreichend Wörter für einen sinnvollen Absatz mitbringt.
`,
);

const leerDatei = inhalt(
  "lexikon/leer.md",
  `---
name: Leerer Eintrag
aliases: []
kurzbeschreibung: Ein Eintrag ohne Fließtext, der prüft, dass das Skript bei leerem Body weder abstürzt noch etwas verändert.
${basis}
kategorie: szene
definition: Ein Eintrag ist ein Element dieses Registers ohne weiteren Text.
---
`,
);

/* ------------------------------------------------------------------ */
/* Läufe                                                               */
/* ------------------------------------------------------------------ */

// import.meta.url statt __dirname: das Paket ist "type": "module".
const skript = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "sync-autolinks.ts");
const lauf = () =>
  execFileSync("npx", ["tsx", skript], { cwd: wurzel, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const vorher = readFileSync(falleDatei, "utf8");
const frontmatterVorher = vorher.slice(0, vorher.indexOf("\n---\n", 4) + 5);

let ausgabe = "";
try {
  ausgabe = lauf();
} catch (e) {
  fehler.push(`erster Lauf abgestürzt: ${(e as any).stderr ?? e}`);
}

const nachher = readFileSync(falleDatei, "utf8");

pruefe("Link wurde gesetzt", nachher.includes("[Petticoat](/lexikon/petticoat/)"), nachher.slice(-200));
pruefe(
  "Frontmatter ist byteidentisch geblieben (M1-Falle)",
  nachher.startsWith(frontmatterVorher),
  "Frontmatter wurde verändert",
);
pruefe(
  "auch der ----Wert im Frontmatter ist unversehrt",
  nachher.includes("Trenner im Wert --- absichtlich"),
);
pruefe("Bericht nennt die Datei", ausgabe.includes("falle.md"), ausgabe);

// Selbstverlinkung: Der Lexikoneintrag selbst darf seinen Begriff nicht linken.
const lexikonNachher = readFileSync(path.join(wurzel, "src/content/lexikon/petticoat.md"), "utf8");
pruefe("keine Selbstverlinkung im eigenen Lexikoneintrag", !lexikonNachher.includes("](/lexikon/petticoat/)"));

// Leerer Body: kein Absturz, keine Änderung.
pruefe("leerer Body bleibt unangetastet", readFileSync(leerDatei, "utf8").endsWith("---\n"));

// Idempotenz: zweiter Lauf ändert nichts, byteweise.
let ausgabe2 = "";
try {
  ausgabe2 = lauf();
} catch (e) {
  fehler.push(`zweiter Lauf abgestürzt: ${(e as any).stderr ?? e}`);
}
pruefe("zweiter Lauf meldet null Änderungen", ausgabe2.includes("0 Datei(en) geändert"), ausgabe2);
pruefe("Datei nach zweitem Lauf byteidentisch", readFileSync(falleDatei, "utf8") === nachher);

// dry-run darf nie schreiben.
const standVorDry = readFileSync(falleDatei, "utf8");
execFileSync("npx", ["tsx", skript, "--dry-run"], { cwd: wurzel, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
pruefe("--dry-run schreibt nichts", readFileSync(falleDatei, "utf8") === standVorDry);

rmSync(wurzel, { recursive: true, force: true });

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
