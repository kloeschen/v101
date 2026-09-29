#!/usr/bin/env -S npx tsx
/**
 * test-freigabelauf.ts — die Bestätigung eines Freigabe-PRs aus seinem Lauf.
 *
 * Geprüft wird die Regel aus _freigabelauf.ts gegen ein nachgebautes GitHub,
 * ohne Netz. Der wichtigere Teil sind die Fälle, in denen KEINE Bestätigung
 * entstehen darf: Jede dieser Abweichungen öffnete sonst die Freigabeprüfung
 * für Statuswechsel, die kein Mensch über den Workflow freigegeben hat.
 *
 * Positives Lebenszeichen (Regel 4): Jeder Ablehnungsfall ist dieselbe
 * Vorrichtung wie der Gutfall mit genau einer Abweichung — der Gutfall
 * zeigt, dass die Vorrichtung überhaupt bestätigen kann, und die Meldung
 * jedes Ablehnungsfalls nennt den Grund, an dem er scheiterte.
 *
 *   npx tsx scripts/test-freigabelauf.ts
 */

import { bestaetigungAusFreigabelauf, WORKFLOW, type GitHub } from "./_freigabelauf";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

const ENV = { GITHUB_HEAD_REF: "freigabe/36631226726", GITHUB_REPOSITORY: "kloeschen/v101", GH_TOKEN: "x" };

/** Ein GitHub, das den Gutfall liefert — jede Abweichung überschreibt genau ein Feld. */
const github = (anders: Partial<{ pfad: string; ereignis: string; slugs: string | null; lauf: null }> = {}): GitHub & { aufrufe: string[] } => {
  const aufrufe: string[] = [];
  return {
    aufrufe,
    lauf(repo, id) {
      aufrufe.push(`lauf ${repo} ${id}`);
      if ("lauf" in anders) return null;
      return { pfad: anders.pfad ?? WORKFLOW, ereignis: anders.ereignis ?? "workflow_dispatch" };
    },
    slugs(repo, id) {
      aufrufe.push(`slugs ${repo} ${id}`);
      return "slugs" in anders ? (anders.slugs ?? null) : "kontrabass,swing\n";
    },
  };
};
const liste = (b: { slugs: Set<string> }) => [...b.slugs].sort();

/* --- Der Gutfall ------------------------------------------------------- */
{
  const gh = github();
  const b = bestaetigungAusFreigabelauf(ENV, gh);
  gleich("Freigabe-PR mit echtem Lauf: beide Slugs bestätigt", liste(b), ["kontrabass", "swing"]);
  gleich("…mit der Lauf-ID aus dem Zweignamen", b.lauf, "36631226726");
  pruefe("…und einer Meldung, die Lauf und Slugs nennt", /Freigabelauf 36631226726.*kontrabass, swing/.test(b.meldung ?? ""), b.meldung ?? "");
  gleich("…gefragt wurde nach genau diesem Lauf in diesem Repository", gh.aufrufe, [
    "lauf kloeschen/v101 36631226726",
    "slugs kloeschen/v101 36631226726",
  ]);
  const mitRef = bestaetigungAusFreigabelauf(ENV, github({ pfad: `${WORKFLOW}@refs/heads/main` }));
  gleich("Pfad mit angehängter Referenz zählt als derselbe Workflow", liste(mitRef), ["kontrabass", "swing"]);
}

/* --- Kein Freigabe-PR: still, ohne GitHub zu fragen --------------------- */
for (const [fall, zweig] of [
  ["gewöhnlicher PR", "claude/lexikon-swing"],
  ["Push ohne Zweigangabe", undefined],
  ["freigabe/ ohne Nummer", "freigabe/abc"],
  ["Nummer mit Anhang", "freigabe/123-extra"],
  ["Präfix mitten im Namen", "x/freigabe/123"],
] as const) {
  const gh = github();
  const b = bestaetigungAusFreigabelauf({ ...ENV, GITHUB_HEAD_REF: zweig }, gh);
  gleich(`${fall}: keine Bestätigung`, liste(b), []);
  gleich(`${fall}: keine Meldung`, b.meldung, null);
  gleich(`${fall}: GitHub wird nicht gefragt`, gh.aufrufe, []);
}

/* --- Freigabe-PR, aber die Bestätigung trägt nicht --------------------- */
const abgelehnt = (fall: string, env: Record<string, string | undefined>, gh: GitHub, grund: RegExp) => {
  const b = bestaetigungAusFreigabelauf(env, gh);
  gleich(`${fall}: keine Bestätigung`, liste(b), []);
  gleich(`${fall}: keine Lauf-ID`, b.lauf, null);
  pruefe(`${fall}: die Meldung nennt den Grund`, grund.test(b.meldung ?? ""), b.meldung ?? "(keine Meldung)");
};
abgelehnt("fremder Workflow", ENV, github({ pfad: ".github/workflows/ci.yml" }), /ci\.yml, nicht zu/);
abgelehnt("Workflow mit ähnlichem Namen", ENV, github({ pfad: ".github/workflows/freigeben.yml.bak" }), /nicht zu/);
abgelehnt("nicht von Hand gestartet", ENV, github({ ereignis: "push" }), /„push"/);
abgelehnt("Lauf nicht lesbar", ENV, github({ lauf: null }), /nicht lesbar/);
abgelehnt("Artefakt fehlt", ENV, github({ slugs: null }), /Artefakt/);
abgelehnt("Artefakt ohne Slug", ENV, github({ slugs: "  \n" }), /keinen Slug/);
abgelehnt("kein Token", { ...ENV, GH_TOKEN: undefined }, github(), /kein Token/);
abgelehnt("kein Repository", { ...ENV, GITHUB_REPOSITORY: undefined }, github(), /GITHUB_REPOSITORY/);

/* --- Sammelwerte und Müll im Artefakt bestätigen nichts ----------------- */
{
  const b = bestaetigungAusFreigabelauf(ENV, github({ slugs: "alle,*, Swing ,kontrabass,../x" }));
  // „alle" hat die Form eines Slugs und bleibt deshalb stehen — es bestätigt
  // aber nur einen Eintrag, der wirklich `alle` heißt, nichts sonst. Wie in
  // check-freigabe.ts gibt es keinen Sammelwert; `*`, Großschreibung und
  // Pfade fallen heraus.
  gleich("nur, was wie ein Slug aussieht; kein Sammelwert", liste(b), ["alle", "kontrabass"]);
}
{
  const b = bestaetigungAusFreigabelauf({ ...ENV, GH_TOKEN: undefined, GITHUB_TOKEN: "y" }, github());
  gleich("GITHUB_TOKEN reicht als Token", liste(b), ["kontrabass", "swing"]);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
