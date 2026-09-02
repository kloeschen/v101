#!/usr/bin/env -S npx tsx
/**
 * test-hooks.ts — beweist, dass die Sperren sperren.
 *
 * Lektion 15: Die Hooks lagen ohne Executable-Bit im Repo, settings.json rief
 * sie direkt als Programm auf. Der Start scheiterte mit Exit 126, und ein
 * Hook, dessen Start fehlschlägt, blockiert nichts — er meldet es auch nicht.
 * Sämtliche Sperren waren wirkungslos, ohne dass jemand es merkte.
 *
 * Deshalb steht der Nachweis hier und nicht in einem Bericht: Die Hooks werden
 * als echte Kindprozesse gestartet, exakt so, wie settings.json sie aufruft
 * (`node` für guard.mjs, `bash` für validate-changed.sh), bekommen ein
 * Hook-Event als JSON auf stdin und werden auf Exitcode UND stderr geprüft.
 *
 * Die stderr-Prüfung ist kein Beiwerk: Claude Code wertet bei Exit 2 nur
 * stderr aus. Ein Hook, der ohne Begründung blockiert, lässt den Agenten
 * raten — genau das war der zweite Fund.
 *
 * Die Fälle für validate-changed.sh laufen in einem Temp-Verzeichnis. Es
 * bekommt `scripts` und `node_modules` als Symlink und ein eigenes
 * `src/content` mit Prüfdateien. Das genügt, weil der Loader seine Wurzel aus
 * `process.cwd()` bildet — das echte Register wird nicht angefasst.
 *
 *   npx tsx scripts/test-hooks.ts
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GUARD = path.join(PROJEKT, ".claude", "hooks", "guard.mjs");
const VALIDATE = path.join(PROJEKT, ".claude", "hooks", "validate-changed.sh");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Hook-Aufruf                                                         */
/* ------------------------------------------------------------------ */

interface Ergebnis {
  code: number;
  stderr: string;
  stdout: string;
}

/** Ruft einen Hook so auf, wie settings.json es tut: über den Interpreter. */
function rufeHook(interpreter: "node" | "bash", skript: string, event: unknown, cwd = PROJEKT): Ergebnis {
  const lauf = spawnSync(interpreter, [skript], {
    input: JSON.stringify(event),
    encoding: "utf8",
    cwd,
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
  });
  return {
    // Ein am Start gescheiterter Hook liefert keinen Code — das ist genau der
    // Fall aus Lektion 15 und darf nicht als "hat nicht blockiert" durchgehen.
    code: lauf.status ?? -1,
    stderr: lauf.stderr ?? "",
    stdout: lauf.stdout ?? "",
  };
}

const schreibEvent = (datei: string, inhalt = "") => ({
  tool_name: "Write",
  tool_input: { file_path: path.isAbsolute(datei) ? datei : path.join(PROJEKT, datei), content: inhalt },
});

/* ------------------------------------------------------------------ */
/* Vorbedingung: die Hooks sind überhaupt da                           */
/* ------------------------------------------------------------------ */

pruefe("guard.mjs existiert", existsSync(GUARD), GUARD);
pruefe("validate-changed.sh existiert", existsSync(VALIDATE), VALIDATE);

/* ------------------------------------------------------------------ */
/* guard.mjs — die Sperren                                             */
/* ------------------------------------------------------------------ */

const gesperrt: Array<[string, string, string]> = [
  ["Datenvertrag", "src/content/_schemas.ts", "gesperrt"],
  ["Site-Konfiguration", "src/site.config.ts", "gesperrt"],
  ["Agenten-Konfiguration", ".claude/settings.json", ""],
  ["CI-Konfiguration", ".github/workflows/ci.yml", ""],
];

for (const [was, datei, erwarteterText] of gesperrt) {
  const r = rufeHook("node", GUARD, schreibEvent(datei, "beliebiger Inhalt"));
  gleich(`guard blockiert ${was} (${datei})`, r.code, 2);
  pruefe(`guard begründet die Sperre für ${was}`, r.stderr.trim().length > 0, "stderr war leer");
  if (erwarteterText) {
    pruefe(
      `guard-Begründung für ${was} nennt "${erwarteterText}"`,
      r.stderr.includes(erwarteterText),
      JSON.stringify(r.stderr.trim()),
    );
  }
}

/* Die Statussperre: veroeffentlicht setzt ausschließlich ein Mensch. */
const veroeffentlicht = `---
name: Probe
status: veroeffentlicht
---

Text.
`;
{
  const r = rufeHook("node", GUARD, schreibEvent("src/content/lexikon/probe.md", veroeffentlicht));
  gleich("guard blockiert status: veroeffentlicht", r.code, 2);
  pruefe(
    'guard-Begründung nennt "Mensch"',
    r.stderr.includes("Mensch"),
    JSON.stringify(r.stderr.trim()),
  );
}

const entwurf = `---
name: Probe
status: entwurf
---

Text.
`;
{
  const r = rufeHook("node", GUARD, schreibEvent("src/content/lexikon/probe.md", entwurf));
  gleich("guard lässt status: entwurf durch", r.code, 0);
}

{
  const r = rufeHook("node", GUARD, schreibEvent("README.md", "# Titel\n"));
  gleich("guard lässt Datei außerhalb von src/content durch", r.code, 0);
}

/* Eine Datei außerhalb von src/content darf auch dann durchgehen, wenn
 * zufällig "veroeffentlicht" im Text steht — die Statussperre gilt für
 * Inhalte, nicht für Prosa über Inhalte. */
{
  const r = rufeHook("node", GUARD, schreibEvent("BETRIEB.md", "status: veroeffentlicht\n"));
  gleich("Statussperre greift nicht außerhalb von src/content", r.code, 0);
}

/* ------------------------------------------------------------------ */
/* validate-changed.sh — die Rückmeldung                               */
/* ------------------------------------------------------------------ */

const SAUBER = `---
name: Slapbass
kurzbeschreibung: Slapbass ist eine Spieltechnik auf dem Kontrabass, bei der die Saiten hörbar auf das Griffbrett schlagen und ein perkussives Klacken erzeugen.
status: entwurf
erstelltAm: 2026-09-02
geprueftAm: 2026-09-02
kategorie: musiktechnik
definition: Slapbass ist eine Kontrabasstechnik, bei der die Saiten perkussiv gegen das Griffbrett geschlagen werden.
abgrenzung: Slapbass am Kontrabass wird häufig mit der gleichnamigen Technik am E-Bass verwechselt, bei der der Daumen die Saite anschlägt.
---

Slapbass ist eine Spieltechnik auf dem Kontrabass, bei der die Saiten nach dem Zupfen hörbar auf das Griffbrett zurückschlagen. Das dabei entstehende perkussive Klacken übernimmt einen Teil der Funktion, die in anderen Besetzungen das Schlagzeug trägt. Die Technik prägt den Klang des Rockabilly maßgeblich und ist dort weiter verbreitet als das reine Zupfen.

## Ausführung von Slapbass

Die Saite wird kräftig vom Griffbrett weggezogen und losgelassen, sodass sie beim Zurückschnellen aufschlägt. Geübte Spieler kombinieren den Anschlag mit einem Schlag der Handfläche auf die Saiten, was einen zweiten, trockeneren Akzent ergibt. Der Effekt trägt den Takt und ersetzt in kleinen Besetzungen einen Teil des Schlagzeugs.

## Abgrenzung von Slapbass

Slapbass am Kontrabass ist nicht dasselbe wie die Slap-Technik am E-Bass, auch wenn beide denselben Namen tragen. Am E-Bass schlägt der Daumen die Saite an; am Kontrabass entsteht das Geräusch durch das Zurückschnellen der Saite auf das Griffbrett.
`;

const KAPUTT = `---
name: Kaputtprobe
kurzbeschreibung: Zu kurz.
status: entwurf
erstelltAm: 2026-09-02
geprueftAm: 2026-09-02
kategorie: musiktechnik
definition: Kurz.
---

Kurzer Text.
`;

/**
 * Temp-Projekt: eigenes src/content, aber die echten scripts und node_modules.
 * Der Loader bildet seine Wurzel aus process.cwd(), deshalb sieht der Validator
 * nur die Prüfdateien — und das echte Register bleibt unberührt.
 */
function baueTempProjekt(): string {
  const wurzel = mkdtempSync(path.join(os.tmpdir(), "v101-hooktest-"));
  mkdirSync(path.join(wurzel, "src", "content", "lexikon"), { recursive: true });
  symlinkSync(path.join(PROJEKT, "scripts"), path.join(wurzel, "scripts"), "dir");
  symlinkSync(path.join(PROJEKT, "node_modules"), path.join(wurzel, "node_modules"), "dir");
  return wurzel;
}

const temp = baueTempProjekt();
try {
  const sauber = path.join(temp, "src", "content", "lexikon", "sauber.md");
  const kaputt = path.join(temp, "src", "content", "lexikon", "kaputt.md");
  writeFileSync(sauber, SAUBER);
  writeFileSync(kaputt, KAPUTT);

  {
    const r = rufeHook("bash", VALIDATE, schreibEvent(sauber), temp);
    gleich("Validator lässt saubere Content-Datei durch", r.code, 0);
  }

  {
    const r = rufeHook("bash", VALIDATE, schreibEvent(kaputt), temp);
    gleich("Validator blockiert Content-Datei mit Regelverstoß", r.code, 2);
    // Der eigentliche Punkt: Ohne Begründung auf stderr weiß der Agent nur,
    // DASS er blockiert wurde, und kann sich nicht selbst korrigieren.
    pruefe(
      "Validator begründet die Blockade auf stderr",
      r.stderr.trim().length > 0,
      "stderr war leer — die Befunde landen auf stdout und erreichen das Modell nicht",
    );
    pruefe(
      "Validator-Begründung nennt den konkreten Befund",
      r.stderr.includes("kurzbeschreibung"),
      JSON.stringify(r.stderr.trim().slice(0, 200)),
    );
  }

  {
    const fehlt = path.join(temp, "src", "content", "lexikon", "gibtesnicht.md");
    const r = rufeHook("bash", VALIDATE, schreibEvent(fehlt), temp);
    gleich("Validator ignoriert nicht existierende Datei", r.code, 0);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
