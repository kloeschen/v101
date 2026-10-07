#!/usr/bin/env -S npx tsx
/**
 * konflikte.ts — welcher offene Zweig würde an welcher Datei kollidieren?
 *
 * ANLASS (2026-10-07): Seit `main` geschützt ist („Require branches to be up
 * to date", 2026-10-04), braucht jeder PR nach jedem anderen Merge ein
 * Update — und jeder Konflikt dabei kostet einen Menschen oder eine
 * Sitzung. Gemessen über die Merge-Commits seit dem 2026-09-30: fünf
 * Konflikte in OFFENE-PUNKTE.md, je einer in termin-recherche.md und
 * ENTSCHEIDUNGEN.md. Die Warteschlange liegt deshalb inzwischen in
 * `docs/posten/`, eine Datei je Posten. Was bleibt, soll man sehen, BEVOR
 * es klemmt: Dieses Skript mergt jeden offenen Zweig probehalber mit der
 * Basis und jeden mit jedem, ohne Arbeitsbaum und ohne etwas zu schreiben
 * (`git merge-tree --write-tree`, Git ≥ 2.38).
 *
 * ZWEI FRAGEN, ZWEI TABELLEN:
 *
 *   1. **Gegen die Basis** — dieser Zweig lässt sich jetzt nicht sauber
 *      aktualisieren. Das ist Arbeit, sofort.
 *   2. **Untereinander** — beide Zweige sind gegen die Basis sauber, aber
 *      wer als Zweiter mergt, bekommt einen Konflikt an dieser Datei. Das
 *      ist die Vorhersage: Hier entscheidet die Reihenfolge, und der zweite
 *      PR braucht nach dem ersten Merge ein Update von Hand.
 *
 * WAS „OFFEN" HEISST: Ein Zweig unter `refs/remotes/<fern>/`, den die Basis
 * nicht enthält und dessen Spitze höchstens `--tage` Tage alt ist (Vorgabe
 * 7). Ohne die Altersgrenze stünden rund fünfzig verlassene Zweige aus
 * geschlossenen PRs in der Liste (gezählt am 2026-10-07, ein einziger PR
 * war offen) — eine Meldung, die meist von Toten handelt, liest niemand.
 * Ob zu einem Zweig ein PR offen ist, weiß Git nicht; das Skript bleibt
 * trotzdem tokenfrei und offline wie `warteschlange.ts`. Wer es genau
 * braucht, nennt die Zweige mit `--zweige a,b`. Dazu kommt der eigene
 * `HEAD`, falls er noch nicht gepusht oder neuer als sein Remote ist.
 *
 * Gelesen wird, was der letzte `git fetch` geholt hat. Das Ergebnis ist ein
 * Bericht, kein Tor: Exitcode 0, auch bei Konflikten. `--streng` liefert 1,
 * wenn der eigene HEAD gegen die Basis kollidiert.
 *
 *   npx tsx scripts/konflikte.ts                 # Markdown für den PR
 *   npx tsx scripts/konflikte.ts --tage 3
 *   npx tsx scripts/konflikte.ts --zweige origin/a,origin/b
 *   npx tsx scripts/konflikte.ts --basis origin/main --json
 */

import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export interface Zweig {
  name: string;
  /** Spitze als Commit-Hash. */
  spitze: string;
  /** Alter der Spitze in Tagen (Commit-Zeit, Epochensekunden — keine Zeitzone). */
  alterTage: number;
}

export interface Ergebnis {
  sauber: boolean;
  dateien: string[];
}

export interface Kollision {
  zweig: string;
  gegen: string;
  dateien: string[];
}

export interface Bericht {
  basis: string;
  zweige: Zweig[];
  gegenBasis: Kollision[];
  untereinander: Kollision[];
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function istVorfahr(cwd: string, a: string, b: string): boolean {
  return spawnSync("git", ["merge-base", "--is-ancestor", a, b], { cwd, stdio: "ignore" }).status === 0;
}

/**
 * Die Ausgabe von `git merge-tree --write-tree --name-only --no-messages`
 * lesen: erste Zeile der Baum, danach je Zeile eine Datei mit Konflikt.
 */
export function liesMergeTree(ausgabe: string): string[] {
  return ausgabe.split("\n").slice(1).map((z) => z.trim()).filter(Boolean);
}

/**
 * Zwei Stände probehalber mergen. Exitcode 0 heißt sauber, 1 heißt
 * Konflikt; alles andere ist ein Fehler von Git und wird geworfen — ein
 * Absturz darf nicht als „sauber" durchgehen.
 */
export function probeMerge(a: string, b: string, cwd = PROJEKT): Ergebnis {
  const r = spawnSync("git", ["merge-tree", "--write-tree", "--name-only", "--no-messages", a, b], {
    cwd,
    encoding: "utf8",
  });
  // Exitcode 1 allein genügt nicht: Git meldet einen unbekannten Ref
  // ebenfalls mit 1, dann aber ohne Baum auf stdout. Gefunden vom Test,
  // der einen Fehler erwartete und „Konflikt ohne Dateien" bekam.
  const mitBaum = /^[0-9a-f]{40,64}$/.test(r.stdout.split("\n")[0]?.trim() ?? "");
  if (r.status === 0 && mitBaum) return { sauber: true, dateien: [] };
  if (r.status === 1 && mitBaum) return { sauber: false, dateien: liesMergeTree(r.stdout) };
  throw new Error(`git merge-tree ${a} ${b}: ${r.stderr?.trim() || `Exitcode ${r.status}`}`);
}

/** Die offenen Zweige: nicht in der Basis, Spitze höchstens `tage` alt. */
export function offeneZweige(opt: { basis: string; tage: number; fern?: string; cwd?: string; jetzt?: number }): Zweig[] {
  const cwd = opt.cwd ?? PROJEKT;
  const fern = opt.fern ?? "origin";
  const jetzt = opt.jetzt ?? Date.now() / 1000;
  let zeilen: string[];
  try {
    zeilen = git(cwd, "for-each-ref", "--format=%(refname:short) %(objectname) %(committerdate:unix)", `refs/remotes/${fern}/`)
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
  const zweige: Zweig[] = [];
  for (const z of zeilen) {
    const [name = "", spitze = "", zeit = "0"] = z.split(" ");
    if (name === opt.basis || name === `${fern}/HEAD` || name === fern) continue;
    const alterTage = (jetzt - Number(zeit)) / 86400;
    if (alterTage > opt.tage) continue;
    if (istVorfahr(cwd, spitze, opt.basis)) continue; // schon gemergt
    // Keine gemeinsame Geschichte (etwa ein verwaister Zweig): nichts zu mergen.
    if (spawnSync("git", ["merge-base", spitze, opt.basis], { cwd, stdio: "ignore" }).status !== 0) continue;
    zweige.push({ name, spitze, alterTage });
  }
  return zweige;
}

/** Den eigenen HEAD dazunehmen, wenn er Arbeit trägt, die kein Remote-Zweig zeigt. */
export function mitHead(zweige: Zweig[], basis: string, cwd = PROJEKT): Zweig[] {
  let spitze: string;
  let name: string;
  try {
    spitze = git(cwd, "rev-parse", "HEAD");
    name = git(cwd, "rev-parse", "--abbrev-ref", "HEAD");
  } catch {
    return zweige;
  }
  if (istVorfahr(cwd, spitze, basis)) return zweige;
  if (zweige.some((z) => z.spitze === spitze)) return zweige;
  // Ein Remote-Zweig, der hinter HEAD liegt, ist derselbe Zweig in älterem
  // Stand — sonst kollidierte HEAD in der Paartabelle mit sich selbst.
  const ohneAlt = zweige.filter((z) => !istVorfahr(cwd, z.spitze, spitze));
  return [...ohneAlt, { name: `HEAD (${name})`, spitze, alterTage: 0 }];
}

export function bericht(basis: string, zweige: Zweig[], cwd = PROJEKT): Bericht {
  const gegenBasis: Kollision[] = [];
  const sauber: Zweig[] = [];
  for (const z of zweige) {
    const e = probeMerge(basis, z.spitze, cwd);
    if (e.sauber) sauber.push(z);
    else gegenBasis.push({ zweig: z.name, gegen: basis, dateien: e.dateien });
  }
  // Untereinander nur die, die gegen die Basis sauber sind: Ein Zweig, der
  // schon jetzt klemmt, wird ohnehin angefasst; seine Paare wären Lärm.
  const untereinander: Kollision[] = [];
  for (let i = 0; i < sauber.length; i++) {
    for (let j = i + 1; j < sauber.length; j++) {
      const a = sauber[i]!;
      const b = sauber[j]!;
      const e = probeMerge(a.spitze, b.spitze, cwd);
      if (!e.sauber) untereinander.push({ zweig: a.name, gegen: b.name, dateien: e.dateien });
    }
  }
  return { basis, zweige, gegenBasis, untereinander };
}

export function alsMarkdown(b: Bericht, tage: number): string {
  const kurz = (n: string) => n.replace(/^origin\//, "");
  const zeilen = [`### Konfliktvorschau (\`npm run konflikte\`)`, ""];
  zeilen.push(
    `${b.zweige.length} offene(r) Zweig(e) gegen \`${b.basis}\` geprüft (Spitze höchstens ${tage} Tage alt` +
      `${b.zweige.length ? `: ${b.zweige.map((z) => `\`${kurz(z.name)}\``).join(", ")}` : ""}).`,
    "",
  );
  if (b.gegenBasis.length === 0 && b.untereinander.length === 0) {
    zeilen.push("Keine Kollision: Jeder Zweig lässt sich sauber mit der Basis und mit jedem anderen mergen.");
    return zeilen.join("\n");
  }
  if (b.gegenBasis.length) {
    zeilen.push(`**Kollidiert jetzt mit \`${b.basis}\`** — braucht ein Update von Hand:`, "");
    for (const k of b.gegenBasis) zeilen.push(`- \`${kurz(k.zweig)}\`: ${k.dateien.map((d) => `\`${d}\``).join(", ")}`);
    zeilen.push("");
  }
  if (b.untereinander.length) {
    zeilen.push("**Kollidiert untereinander** — wer als Zweiter mergt, braucht danach ein Update von Hand:", "");
    for (const k of b.untereinander) {
      zeilen.push(`- \`${kurz(k.zweig)}\` × \`${kurz(k.gegen)}\`: ${k.dateien.map((d) => `\`${d}\``).join(", ")}`);
    }
  }
  return zeilen.join("\n").trimEnd();
}

function main() {
  const argv = process.argv.slice(2);
  const wert = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const basis = wert("--basis") ?? "origin/main";
  const tage = Number(wert("--tage") ?? 7);
  const genannt = wert("--zweige");

  let zweige: Zweig[];
  if (genannt) {
    zweige = genannt.split(",").filter(Boolean).map((name) => ({ name, spitze: git(PROJEKT, "rev-parse", name), alterTage: 0 }));
  } else {
    zweige = offeneZweige({ basis, tage });
  }
  if (!argv.includes("--ohne-head")) zweige = mitHead(zweige, basis);

  const b = bericht(basis, zweige);
  if (argv.includes("--json")) console.log(JSON.stringify(b, null, 2));
  else console.log(alsMarkdown(b, tage));

  const headKlemmt = b.gegenBasis.some((k) => k.zweig.startsWith("HEAD ("));
  process.exit(argv.includes("--streng") && headKlemmt ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
