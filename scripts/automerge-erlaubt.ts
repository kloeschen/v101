#!/usr/bin/env -S npx tsx
/**
 * automerge-erlaubt.ts — darf dieser Zweig ohne menschliche Prüfung mergen?
 *
 * ANLASS: Ab dem 2026-09-20 öffnet ein täglicher unbeaufsichtigter Lauf
 * Pull Requests. Entscheidung von Markus am selben Tag: **Reine Code-PRs
 * dürfen selbst mergen, sobald die CI grün ist. Alles, was Inhalt anfasst,
 * wartet auf einen Menschen.**
 *
 * WARUM DIESE GRENZE UND KEINE ANDERE: Die Prüfkette beweist Struktur, nicht
 * Wahrheit. Ein Tippfehler in `validate-content.ts` fällt in `npm run verify`
 * auf — eine falsch recherchierte Anfangszeit nicht. Genau das ist beim
 * Record Hop passiert: Die Zeit war falsch, alle Prüfungen waren grün, und
 * gefunden wurde sie nur, weil die Quelle aus einem anderen Grund noch
 * einmal geöffnet wurde. Code kann sich selbst beweisen, ein recherchierter
 * Fakt nicht.
 *
 * WARUM DIE REGEL HIER STEHT UND NICHT IM PROMPT DER ROUTINE: Eine Regel,
 * die entscheidet, was ohne menschliche Augen auf `main` landet, ist genau
 * die Sorte Regel, die in Code gehört (Regel 3 des Projekts). Im Prompt
 * wäre sie eine Bitte an ein Modell, das gerade müde ist. Hier ist sie ein
 * Exitcode, und `test-automerge.ts` beweist beide Richtungen.
 *
 * Nicht selbst mergen darf ein Lauf ausserdem, wenn der Zweig eine der
 * gesperrten Dateien anfasst. Dorthin kommt er ohnehin nicht — der Hook
 * blockiert das —, aber eine Sperre, die sich auf eine andere Sperre
 * verlässt, ist eine halbe.
 *
 *   npx tsx scripts/automerge-erlaubt.ts                  # gegen origin/main
 *   npx tsx scripts/automerge-erlaubt.ts --basis origin/main
 *   npx tsx scripts/automerge-erlaubt.ts --dateien a.ts,b.md
 *
 * Exitcode 0 = darf mergen, 1 = braucht einen Menschen.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Pfade, deren Änderung einen Menschen verlangt.
 *
 * `src/content/` ist der Grund für die ganze Regel: Dort stehen recherchierte
 * Behauptungen über die Wirklichkeit. Die übrigen vier sind die Sperren aus
 * `guard.mjs` — hier noch einmal, damit diese Prüfung auch dann greift, wenn
 * der Hook einmal nicht läuft.
 */
export const MENSCHENPFLICHTIG: { pfad: string; grund: string }[] = [
  { pfad: "src/content/", grund: "recherchierter Inhalt — die Prüfkette beweist Struktur, nicht Wahrheit" },
  { pfad: "src/content/_schemas.ts", grund: "Datenvertrag" },
  { pfad: "src/site.config.ts", grund: "Domain steckt in jeder @id des Wissensgraphen" },
  { pfad: ".claude/", grund: "Mechanik der Absicherung" },
  { pfad: ".github/", grund: "CI-Konfiguration" },
];

export interface Urteil {
  erlaubt: boolean;
  /** Die Dateien, die einen Menschen verlangen, mit Begründung. */
  gruende: { datei: string; grund: string }[];
  geprueft: number;
}

export function beurteile(dateien: string[]): Urteil {
  const gruende: { datei: string; grund: string }[] = [];
  for (const datei of dateien) {
    const d = datei.trim();
    if (!d) continue;
    // Der längste Treffer gewinnt, damit `_schemas.ts` seinen eigenen Grund
    // nennt und nicht den allgemeinen von `src/content/`.
    const treffer = MENSCHENPFLICHTIG.filter((m) => d === m.pfad || d.startsWith(m.pfad)).sort(
      (a, b) => b.pfad.length - a.pfad.length,
    )[0];
    if (treffer) gruende.push({ datei: d, grund: treffer.grund });
  }
  return {
    erlaubt: gruende.length === 0,
    gruende,
    geprueft: dateien.filter((d) => d.trim()).length,
  };
}

function geaenderteDateien(basis: string): string[] {
  const aus = execFileSync("git", ["diff", "--name-only", `${basis}...HEAD`], {
    cwd: PROJEKT,
    encoding: "utf8",
  });
  return aus.split("\n").filter(Boolean);
}

function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--dateien");
  const j = argv.indexOf("--basis");
  const dateien =
    i >= 0 ? (argv[i + 1] ?? "").split(",") : geaenderteDateien(j >= 0 ? argv[j + 1] : "origin/main");

  const u = beurteile(dateien);
  if (u.erlaubt) {
    console.log(`Auto-Merge erlaubt: ${u.geprueft} geänderte Datei(en), keine davon menschenpflichtig.`);
    process.exit(0);
  }
  console.log(`Auto-Merge NICHT erlaubt — ${u.gruende.length} von ${u.geprueft} Datei(en) brauchen einen Menschen:`);
  for (const g of u.gruende) console.log(`  ${g.datei}\n    ${g.grund}`);
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
