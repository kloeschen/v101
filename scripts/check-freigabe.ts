#!/usr/bin/env -S npx tsx
/**
 * check-freigabe.ts — die dritte Schicht gegen Befund M8.
 *
 * Schicht 1 (permissions.deny) und Schicht 2 (guard.mjs) fragen beide danach,
 * WER schreibt: welches Werkzeug, welcher Befehl, welcher Pfad. Beide lassen
 * sich umgehen, sobald jemand einen Schreibweg wählt, den sie nicht kennen —
 * ein Node- oder Python-Skript, das die Datei selbst öffnet, kommt an beiden
 * vorbei. Das ist in guard.mjs dokumentiert und keine Vermutung: Genau so
 * sind die Änderungen dieses Projekts bisher entstanden.
 *
 * Diese Prüfung fragt stattdessen, WAS am Ende dasteht. Sie vergleicht den
 * Arbeitsstand mit einer Basis und meldet jeden Eintrag, dessen `status` auf
 * `veroeffentlicht` gewechselt ist. Welches Werkzeug das geschrieben hat, ist
 * ihr gleichgültig — und genau darin liegt der Wert.
 *
 * Ein Mensch, der bewusst veröffentlicht, nennt den Slug beim Aufruf:
 *
 *   npx tsx scripts/check-freigabe.ts --freigabe petticoat
 *
 * Das ist eine Handlung an der Kommandozeile, nichts, was im Repository
 * steht. Ein Agent, der `npm run verify` aufruft, setzt sie nicht.
 *
 * GRENZE — und sie ist erheblich: Die Prüfung braucht eine Basis im
 * Git-Verzeichnis. Die CI dieses Projekts klont mit `actions/checkout@v4` in
 * der Standardtiefe 1; dort gibt es keinen Vorgänger und die Prüfung meldet
 * das laut und läuft durch. Wirksam ist sie damit lokal — dort, wo CLAUDE.md
 * `npm run verify` vor jedem Commit verlangt — und überall, wo die Historie
 * vorhanden ist. Was fehlt, ist `fetch-depth: 0` im Workflow; das steht als
 * M10 in REVIEW.md und liegt in `.github/`, das für Agenten gesperrt ist.
 * `--basis-pflicht` macht die fehlende Basis zum Fehler, sobald das behoben
 * ist.
 *
 *   npx tsx scripts/check-freigabe.ts
 *   npx tsx scripts/check-freigabe.ts --basis origin/main
 *   npx tsx scripts/check-freigabe.ts --freigabe petticoat --freigabe rockabilly
 *   npx tsx scripts/check-freigabe.ts --basis-pflicht     # fehlende Basis = Fehler
 *
 * Exit 0 = sauber, 1 = unbestätigte Veröffentlichung.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(n);
const werte = (n: string): string[] => {
  const aus: string[] = [];
  for (let i = 0; i < argv.length; i++) if (argv[i] === n && argv[i + 1]) aus.push(argv[i + 1]);
  return aus;
};

const freigegeben = new Set(werte("--freigabe"));
const basisPflicht = flag("--basis-pflicht");

/** git ohne Rauschen. Gibt null zurück, statt zu werfen. */
function git(...args: string[]): string | null {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Basis bestimmen                                                     */
/* ------------------------------------------------------------------ */

const kandidaten = [
  ...werte("--basis"),
  process.env.V101_BASIS,
  process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : undefined,
  "origin/main",
  "main",
].filter((x): x is string => Boolean(x));

const flach = git("rev-parse", "--is-shallow-repository") === "true";
const basis = flach ? null : kandidaten.find((r) => git("rev-parse", "--verify", `${r}^{commit}`) !== null) ?? null;

if (!basis) {
  // Lektion 4 und 5: Der unbestimmbare Zustand bekommt einen sichtbaren
  // Hinweis und einen Exitcode, keine stille Null. Auf stderr, damit stdout
  // für Ergebnisse frei bleibt.
  const grund = flach
    ? "das Git-Verzeichnis ist flach geklont (actions/checkout Standardtiefe 1)"
    : `keine der geprüften Basis-Referenzen existiert (${kandidaten.join(", ")})`;
  console.error(
    `Freigabeprüfung übersprungen: ${grund}. ` +
      `Ohne Basis lässt sich kein Statuswechsel erkennen. ` +
      `Siehe M10 in REVIEW.md — mit "fetch-depth: 0" im Workflow greift die Prüfung auch in der CI.`,
  );
  process.exit(basisPflicht ? 1 : 0);
}

/* ------------------------------------------------------------------ */
/* Statuswechsel suchen                                                */
/* ------------------------------------------------------------------ */

/** Wert von `status:` im Frontmatter. null, wenn die Datei fehlt. */
function status(text: string | null): string | null {
  if (text === null) return null;
  const m = text.match(/^status:[ \t]*([a-z]+)[ \t]*$/m);
  return m ? m[1] : null;
}

// `git diff` kennt nur, was Git kennt. Ein Eintrag, der neu angelegt und noch
// nicht hinzugefügt wurde, taucht dort nicht auf — und genau so entsteht ein
// Eintrag, der von Anfang an auf veroeffentlicht steht. Der Negativtest hat
// diese Lücke beim ersten Lauf gefunden; deshalb kommen die unversionierten
// Dateien ausdrücklich dazu.
const ausDiff = git("diff", "--name-only", basis, "--", "src/content") ?? "";
const unversioniert = git("ls-files", "--others", "--exclude-standard", "--", "src/content") ?? "";

const geaendert = [...new Set(`${ausDiff}\n${unversioniert}`.split("\n").map((z) => z.trim()))].filter(
  (z) => z.endsWith(".md") && !path.basename(z).startsWith("_"),
);

const befunde: string[] = [];
const bestaetigt: string[] = [];

for (const datei of geaendert) {
  const vorher = status(git("show", `${basis}:${datei}`));
  // Der Arbeitsstand zählt, nicht der Index: Eine Änderung, die noch nicht
  // committet ist, ist genau der Fall, den diese Prüfung fangen soll.
  let jetzt: string | null;
  try {
    jetzt = status(readFileSync(datei, "utf8"));
  } catch {
    jetzt = status(git("show", `HEAD:${datei}`)); // gelöscht oder umbenannt
  }

  if (jetzt !== "veroeffentlicht" || vorher === "veroeffentlicht") continue;

  const slug = path.basename(datei, ".md");
  if (freigegeben.has(slug)) bestaetigt.push(`${datei} (Freigabe: ${slug})`);
  else befunde.push(`${datei}: status ${vorher ?? "(neu)"} → veroeffentlicht`);
}

/* ------------------------------------------------------------------ */
/* Bericht                                                             */
/* ------------------------------------------------------------------ */

console.log(`Freigabeprüfung gegen ${basis}: ${geaendert.length} geänderte Inhaltsdatei(en).`);
for (const b of bestaetigt) console.log(`  bestätigt  ${b}`);

if (befunde.length === 0) {
  console.log("Keine unbestätigte Veröffentlichung.");
  process.exit(0);
}

for (const b of befunde) console.log(`  FEHLER     ${b}`);
console.log(
  `\n${befunde.length} Eintrag/Einträge werden veröffentlicht, ohne dass ein Mensch das beim Aufruf bestätigt hat.\n` +
    `Diese Prüfung fragt nicht, welches Werkzeug geschrieben hat — sie sieht nur das Ergebnis. Das ist Absicht:\n` +
    `Hook- und Berechtigungssperren lassen sich umgehen, der Statuswechsel im Diff nicht.\n\n` +
    `Wenn die Veröffentlichung gewollt ist, bestätige sie beim Aufruf:\n` +
    befunde.map((b) => `  npx tsx scripts/check-freigabe.ts --freigabe ${path.basename(b.split(":")[0], ".md")}`).join("\n"),
);
process.exit(1);
