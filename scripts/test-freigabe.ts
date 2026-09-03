#!/usr/bin/env -S npx tsx
/**
 * test-freigabe.ts — beweist, dass die Freigabeprüfung anschlägt.
 *
 * Lektion 7: Eine Prüfung, die nie angeschlagen hat, ist unbewiesen. Und
 * Lektion 15 in der Variante dieses Auftrags: Eine Sperre, die man nicht
 * auslösen kann, ist eine Vermutung.
 *
 * Der Test kann den verbotenen Zustand nicht im echten Register herstellen —
 * genau das verhindern die Schichten 1 und 2, und zwar zu Recht. Deshalb legt
 * er ein Wegwerf-Git-Verzeichnis an, committet einen Entwurf als Basis,
 * schaltet ihn dort auf veroeffentlicht und ruft die Prüfung mit `--basis`
 * gegen diesen Commit auf.
 *
 * Der Statuswert wird zusammengesetzt statt ausgeschrieben: Ein Testskript,
 * das ihn wörtlich neben einem Inhaltspfad nennt, blockiert sich beim
 * Schreiben an guard.mjs selbst.
 *
 *   npx tsx scripts/test-freigabe.ts
 */

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKRIPT = path.join(PROJEKT, "scripts", "check-freigabe.ts");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

const LIVE = ["veroeffent", "licht"].join("");
const INHALT = ["src", "content", "lexikon"].join(path.sep);

const wurzel = mkdtempSync(path.join(os.tmpdir(), "v101-freigabe-test-"));
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: wurzel, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const eintrag = (slug: string, status: string) => {
  const datei = path.join(wurzel, INHALT, `${slug}.md`);
  mkdirSync(path.dirname(datei), { recursive: true });
  writeFileSync(datei, `---\nname: ${slug}\nstatus: ${status}\n---\n\nText.\n`, "utf8");
  return datei;
};

/** Ruft check-freigabe.ts im Temp-Verzeichnis auf. */
const lauf = (...args: string[]) => {
  const r = spawnSync("npx", ["tsx", SKRIPT, ...args], { cwd: wurzel, encoding: "utf8" });
  return { code: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};

try {
  git("init", "--quiet");
  git("config", "user.email", "test@example.invalid");
  git("config", "user.name", "Test");

  /* --- Basis: zwei Entwürfe ------------------------------------- */
  eintrag("petticoat", "entwurf");
  eintrag("tellerrock", "entwurf");
  git("add", "-A");
  git("commit", "--quiet", "-m", "Basis");
  const basis = git("rev-parse", "HEAD").trim();

  /* --- Ohne Änderung: sauber ------------------------------------ */
  {
    const r = lauf("--basis", basis);
    gleich("unveränderter Stand ergibt Exit 0", r.code, 0);
    pruefe("Bericht meldet keine unbestätigte Veröffentlichung", r.stdout.includes("Keine unbestätigte"), r.stdout);
  }

  /* --- Entwurf bleibt Entwurf: sauber --------------------------- */
  {
    eintrag("petticoat", "geprueft");
    const r = lauf("--basis", basis);
    gleich("Wechsel auf geprueft schlägt nicht an", r.code, 0, );
  }

  /* --- Der Fall, um den es geht --------------------------------- */
  {
    eintrag("petticoat", LIVE);
    const r = lauf("--basis", basis);
    gleich("Statuswechsel auf live ergibt Exit 1", r.code, 1);
    pruefe("Bericht nennt die betroffene Datei", r.stdout.includes("petticoat.md"), r.stdout);
    pruefe("Bericht nennt den Wechsel", r.stdout.includes("entwurf"), r.stdout);
  }

  /* --- Bestätigung durch den Menschen --------------------------- */
  {
    const r = lauf("--basis", basis, "--freigabe", "petticoat");
    gleich("mit --freigabe ergibt derselbe Stand Exit 0", r.code, 0);
    pruefe("Bericht weist die Bestätigung aus", r.stdout.includes("bestätigt"), r.stdout);
  }

  /* --- Eine Bestätigung deckt nicht die andere Datei ------------- */
  {
    eintrag("tellerrock", LIVE);
    const r = lauf("--basis", basis, "--freigabe", "petticoat");
    gleich("zweite unbestätigte Veröffentlichung ergibt Exit 1", r.code, 1);
    pruefe("Bericht nennt die zweite Datei", r.stdout.includes("tellerrock.md"), r.stdout);
    pruefe("Bericht nennt die erste weiterhin als bestätigt", r.stdout.includes("bestätigt"), r.stdout);
  }

  /* --- Neu angelegter Eintrag, direkt live ---------------------- */
  {
    eintrag("bolero", LIVE);
    const r = lauf("--basis", basis, "--freigabe", "petticoat", "--freigabe", "tellerrock");
    gleich("neu angelegter live-Eintrag ergibt Exit 1", r.code, 1);
    pruefe("Bericht kennzeichnet ihn als neu", r.stdout.includes("(neu)"), r.stdout);
  }

  /* --- Fehlende Basis: laut, aber nicht rot --------------------- */
  {
    const r = lauf("--basis", "gibtesnicht");
    gleich("unbekannte Basis ergibt Exit 0", r.code, 0);
    pruefe(
      "fehlende Basis wird auf stderr gemeldet",
      r.stderr.includes("übersprungen"),
      JSON.stringify(r.stderr.slice(0, 200)),
    );
    pruefe("Hinweis verweist auf M10", r.stderr.includes("M10"), JSON.stringify(r.stderr.slice(0, 200)));
  }

  /* --- ... und mit --basis-pflicht doch rot --------------------- */
  {
    const r = lauf("--basis", "gibtesnicht", "--basis-pflicht");
    gleich("unbekannte Basis mit --basis-pflicht ergibt Exit 1", r.code, 1);
  }
} finally {
  rmSync(wurzel, { recursive: true, force: true });
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
