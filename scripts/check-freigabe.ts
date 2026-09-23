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
 * GRENZE: Die Prüfung braucht eine Basis im Git-Verzeichnis. Liegt keine
 * vor, meldet sie das laut und läuft durch — `--basis-pflicht` macht die
 * fehlende Basis stattdessen zum Fehler.
 *
 * SEIT DEM 2026-09-03 GILT DAS AUCH IN DER CI (Befund M10, behoben): `ci.yml`
 * klont mit `fetch-depth: 0`, und `verify:ci` ruft `freigabe:ci` auf, also
 * diese Prüfung mit `--basis-pflicht`. Der Kommentar hier behauptete bis zum
 * 2026-09-22 das Gegenteil — er beschrieb den Zustand vor der Behebung und
 * ließ glauben, die Prüfung sei in der CI folgenlos.
 *
 * WAS DAS FÜR EINEN FREIGABE-PULL-REQUEST BEDEUTET: Er wird die CI rot
 * machen, und zwar planmäßig. Der Statuswechsel steht im Diff, bestätigt hat
 * ihn beim Aufruf niemand, also schlägt diese Prüfung an — sie soll es. Wer
 * den Pull Request prüft, führt die Bestätigungszeile aus, die `freigeben.ts`
 * am Ende ausgibt, oder merged in dem Wissen, welche Slugs freigegeben
 * werden. Solange `main` nicht geschützt ist, ist der rote Haken folgenlos;
 * mit `verify` als Required Check wird er zum Tor (Posten in
 * OFFENE-PUNKTE.md).
 *
 *   npx tsx scripts/check-freigabe.ts
 *   npx tsx scripts/check-freigabe.ts --basis origin/main
 *   npx tsx scripts/check-freigabe.ts --freigabe petticoat --freigabe rockabilly
 *   npx tsx scripts/check-freigabe.ts --basis-pflicht     # fehlende Basis = Fehler
 *   FREIGABE_BESTAETIGT=petticoat,korsett npm run verify:ci
 *
 * Exit 0 = sauber, 1 = unbestätigte Veröffentlichung.
 *
 * DIE BESTÄTIGUNG AUS DER UMGEBUNG (seit dem 2026-09-23). `FREIGABE_BESTAETIGT`
 * nimmt eine kommagetrennte Slug-Liste und wirkt wie dieselbe Zahl
 * `--freigabe`-Schalter. Es gibt sie aus genau einem Grund: Der
 * Freigabe-Workflow soll die ganze Kette auf seinem Ergebnis laufen lassen,
 * bevor er den Pull Request öffnet. `verify:ci` ruft diese Prüfung aber als
 * festen Schritt auf, ohne Schalter — und bricht an ihr ab, weil ein
 * Freigabe-Ergebnis naturgemäß lauter Statuswechsel enthält. Tests und Build
 * stehen in der Kette dahinter und liefen nie.
 *
 * Genau das ist am 2026-09-22 passiert: Der erste Freigabe-PR hätte `main`
 * rot gemacht, und keine Prüfung hätte es gezeigt. Die CI auf dem PR lief
 * gar nicht (von einem Bot-Token ausgelöst), und selbst wenn sie gelaufen
 * wäre, hätte sie bei Schritt 3 von 9 geendet — mit dem erwarteten Rot, hinter
 * dem das echte versteckt gewesen wäre.
 *
 * WARUM DAS DIE PRÜFUNG NICHT SCHWÄCHT: Oben steht, die Bestätigung sei „eine
 * Handlung an der Kommandozeile". Das war nie ein Beweis für einen Menschen —
 * ein Agent mit Shell ruft dieselbe Zeile auf, und am 2026-09-22 hat einer
 * genau das getan. Wogegen die Prüfung schützt, ist die UNBEABSICHTIGTE
 * Veröffentlichung: ein Statuswechsel, der nebenbei in einem Pull Request
 * landet. Der Freigabe-Workflow ist per Definition beabsichtigt, und er
 * reicht nur die Slugs durch, die er selbst gerade freigegeben hat.
 *
 * Damit eine liegengebliebene Variable nicht still alles durchwinkt, gilt:
 * Es gibt keinen Sammelwert (kein `*`, kein `alle`), jede Bestätigung aus der
 * Umgebung steht im Bericht mit ihrer Herkunft, und ein Slug, den die
 * Variable nennt, der aber gar nicht wechselt, wird auf stderr gemeldet.
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

const ausAufruf = new Set(werte("--freigabe"));
const ausUmgebung = new Set(
  (process.env.FREIGABE_BESTAETIGT ?? "")
    .split(",")
    .map((s) => s.trim())
    // Nur, was wie ein Slug aussieht. Ein Sammelwert wäre eine Bestätigung
    // für alles, und genau die soll es nicht geben.
    .filter((s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)),
);
const freigegeben = new Set([...ausAufruf, ...ausUmgebung]);
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
const gewechselt = new Set<string>();

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
  gewechselt.add(slug);
  if (ausAufruf.has(slug)) bestaetigt.push(`${datei} (Freigabe: ${slug})`);
  else if (ausUmgebung.has(slug)) bestaetigt.push(`${datei} (Freigabe: ${slug}, aus FREIGABE_BESTAETIGT)`);
  else befunde.push(`${datei}: status ${vorher ?? "(neu)"} → veroeffentlicht`);
}

// Eine Bestätigung ohne Wechsel ist kein Fehler, aber ein Zeichen: Entweder
// liegt die Variable von einem früheren Lauf herum, oder jemand hat einen
// Slug vertippt. Beides soll man sehen.
const leerlauf = [...ausUmgebung].filter((s) => !gewechselt.has(s));
if (leerlauf.length > 0) {
  console.error(
    `Hinweis: FREIGABE_BESTAETIGT nennt ${leerlauf.length} Slug(s) ohne Statuswechsel: ${leerlauf.join(", ")}`,
  );
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
