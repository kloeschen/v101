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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
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
/* guard.mjs — dieselben Sperren über die Shell (Befund M8)            */
/* ------------------------------------------------------------------ */
/*
 * Der Hook hing am Matcher `Write|Edit` und sah Shell-Schreibzugriffe nie.
 * `sed -i`, `tee`, `cat >` liefen an allen fünf Sperren vorbei — aufgefallen
 * beim Negativtest zu PR #3, als `status: veroeffentlicht` per `sed`
 * kommentarlos durchging. Diese Fälle halten den zweiten Weg offen sichtbar.
 *
 * Die Pfade stehen hier bewusst zerlegt (`SCHEMA`, `SITE` …): Der Bash-Zweig
 * betrachtet den Befehlstext als Ganzes, und ein Testskript, das den
 * gesperrten Pfad wörtlich neben einem Schreibverb nennt, blockiert sich
 * beim Schreiben selbst. Das ist keine Schwäche des Tests, sondern die
 * Grobheit der Sperre — sie ist so gewollt und in guard.mjs dokumentiert.
 */

const SCHEMA = ["src", "content", "_schemas.ts"].join("/");
const SITE = ["src", "site.config.ts"].join("/");
const AGENT = [".claude", "settings.json"].join("/");
const HOOKDATEI = [".claude", "hooks", "guard.mjs"].join("/");
const CI = [".github", "workflows", "ci.yml"].join("/");
const EINTRAG = ["src", "content", "lexikon", "probe.md"].join("/");

const bashEvent = (command: string) => ({ tool_name: "Bash", tool_input: { command } });

const bashGesperrt: Array<[string, string]> = [
  ["sed -i auf den Datenvertrag", `sed -i 's/a/b/' ${SCHEMA}`],
  ["Umleitung auf den Datenvertrag", `echo 'export const x = 1;' > ${SCHEMA}`],
  ["Anhängen an die Site-Konfiguration", `echo '// x' >> ${SITE}`],
  ["tee auf die Agenten-Konfiguration", `echo '{}' | tee ${AGENT}`],
  ["tee -a auf einen Hook", `echo 'x' | tee -a ${HOOKDATEI}`],
  ["Umleitung auf die CI-Konfiguration", `cat vorlage.yml > ${CI}`],
  ["cp auf die Site-Konfiguration", `cp /tmp/neu.ts ${SITE}`],
  ["mv auf den Datenvertrag", `mv /tmp/neu.ts ${SCHEMA}`],
  ["git checkout auf die Agenten-Konfiguration", `git checkout main -- ${AGENT}`],
  ["git restore auf die CI-Konfiguration", `git restore ${CI}`],
];

for (const [was, command] of bashGesperrt) {
  const r = rufeHook("node", GUARD, bashEvent(command));
  gleich(`guard blockiert über Bash: ${was}`, r.code, 2);
  pruefe(`guard begründet die Bash-Sperre: ${was}`, r.stderr.trim().length > 0, "stderr war leer");
  pruefe(
    `guard-Begründung nennt den Shell-Weg: ${was}`,
    r.stderr.includes("Shell"),
    JSON.stringify(r.stderr.trim().slice(0, 160)),
  );
}

/* Die Statussperre über die Shell. Der dritte Fall ist der, der in PR #3
 * durchging: Das Feld "status" kommt im Befehl gar nicht vor, nur der Wert. */
const LIVE = ["veroeffent", "licht"].join("");
const bashStatus: Array<[string, string]> = [
  ["Heredoc mit Statuszeile", `cat > ${EINTRAG} <<'EOF'\nstatus: ${LIVE}\nEOF`],
  ["Anhängen der Statuszeile", `echo 'status: ${LIVE}' >> ${EINTRAG}`],
  ["Ersetzung entwurf zu live", `sed -i 's/entwurf/${LIVE}/' ${EINTRAG}`],
  // Schreibweisen, die dieselbe Wirkung haben. Sie stehen hier, weil das
  // Muster nach dem Teilstring-Befund enger geworden ist: Eine Verengung,
  // die nebenbei Varianten durchlässt, wäre schlechter als der Fehlalarm.
  ["Ersetzung mit vollem Feldnamen", `sed -i 's/status: entwurf/status: ${LIVE}/' ${EINTRAG}`],
  ["Ersetzung mit anderem Trennzeichen", `sed -i 's|entwurf|${LIVE}|' ${EINTRAG}`],
  ["perl -pi statt sed", `perl -pi -e 's/entwurf/${LIVE}/' ${EINTRAG}`],
  ["awk mit Umleitung", `awk '{gsub("entwurf","${LIVE}")}1' ${EINTRAG} > ${EINTRAG}.neu`],
  ["zusätzlicher Leerraum vor dem Wert", `echo 'status:   ${LIVE}' >> ${EINTRAG}`],
  ["Anführungszeichen um den Wert", `echo 'status: "${LIVE}"' >> ${EINTRAG}`],
  ["Tabulator nach dem Doppelpunkt", `echo 'status:\t${LIVE}' >> ${EINTRAG}`],
  [
    "vollständiges Frontmatter im Heredoc",
    `cat > ${EINTRAG} <<'EOF'\n---\nname: Probe\nstatus: ${LIVE}\ntyp: konzert\n---\nText\nEOF`,
  ],
];

for (const [was, command] of bashStatus) {
  const r = rufeHook("node", GUARD, bashEvent(command));
  gleich(`guard blockiert über Bash: ${was}`, r.code, 2);
  pruefe(
    `guard-Begründung nennt "Mensch": ${was}`,
    r.stderr.includes("Mensch"),
    JSON.stringify(r.stderr.trim().slice(0, 160)),
  );
}

/* ------------------------------------------------------------------ */
/* Der Fehlalarm auf dem Preiszustand — der eigentliche Regressionsschutz */
/* ------------------------------------------------------------------ */
/*
 * Der dritte Preiszustand heißt `unveroeffentlicht` und enthält das
 * Statuswort als Teilwort. Solange die Sperre auf den bloßen Teilstring
 * prüfte, wurde jeder Shell-Schreibzugriff auf eine Eventdatei mit diesem
 * Wert als Statusänderung abgelehnt — zweimal in der Sitzung passiert, in
 * der der Zustand entstand.
 *
 * Diese Fälle sind die Gegenrichtung zu `bashStatus` oben. Sie schlagen an,
 * sobald jemand wieder auf Teilstring-Prüfung zurückfällt, und sind damit
 * der Grund, warum dieser Abschnitt existiert: Ein Prüfmuster, das auf
 * Wortbestandteile schaut, bricht beim nächsten neuen Enum-Wert wieder.
 *
 * `PREIS` wird aus Fragmenten gebaut wie `LIVE` — sonst blockiert der Hook
 * das Schreiben dieser Datei selbst.
 *
 * WAS DEN FEHLALARM TATSÄCHLICH BEHEBT — nachgemessen, nicht vermutet:
 * Es sind die zwei Formen des Musters, nicht die Wortgrenzen. Ein
 * Differenztest über 252 Varianten des Wortes mit allen direkt
 * anliegenden Zeichen zeigt, dass sich `\b…\b` und das nackte Wort nur bei
 * Ketten der Gestalt `status: veroeffentlicht<suffix>` unterscheiden
 * (`…Am`, `…ung`, `…er`) — keine davon ist ein heutiger Befehl. Die
 * Wortgrenze ist also Vorsorge gegen das nächste Vokabular, nicht die
 * Ursache der Reparatur; genau deshalb steht hier kein Test, der sie
 * einfordert. Ein solcher Test müsste behaupten, ein künftiger Statuswert
 * wie `veroeffentlicht_intern` dürfe durchgehen — und das wäre falsch.
 * Dasselbe gilt für die optionalen Anführungszeichen in Form 1: Form 2
 * fängt den Fall `status: "…"` ohnehin ab.
 */
const PREIS = "un" + LIVE;
const bashPreiszustand: Array<[string, string]> = [
  ["Preiszustand per sed setzen", `sed -i 's/eintritt: beziffert/eintritt: ${PREIS}/' ${EINTRAG}`],
  ["Preiszustand anhängen", `echo 'eintritt: ${PREIS}' >> ${EINTRAG}`],
  ["Preiszustand mit Anführungszeichen", `echo 'eintritt: "${PREIS}"' >> ${EINTRAG}`],
  [
    "Preiszustand im Frontmatter eines Heredocs",
    `cat > ${EINTRAG} <<'EOF'\n---\nname: Probe\nstatus: entwurf\neintritt: ${PREIS}\n---\nText\nEOF`,
  ],
  [
    "das Wort nur im Fließtext",
    `echo 'Der Veranstalter hat den Preis ${PREIS} gelassen.' >> ${EINTRAG}`,
  ],
];

for (const [was, command] of bashPreiszustand) {
  const r = rufeHook("node", GUARD, bashEvent(command));
  gleich(`guard lässt den Preiszustand durch: ${was}`, r.code, 0);
}

/* Harmlose Befehle müssen durchgehen — eine Sperre, die alles blockiert,
 * wird abgeschaltet und schützt danach nichts mehr. */
const bashErlaubt: Array<[string, string]> = [
  ["Verzeichnis auflisten", "ls -la src/content"],
  ["Prüflauf", "npm run verify"],
  ["lesender Zugriff auf den Datenvertrag", `grep -n 'quelle' ${SCHEMA}`],
  ["lesende Suche nach dem Statuswort", `grep -rn '${LIVE}' src/content/`],
  ["Schreiben außerhalb der gesperrten Pfade", "echo 'notiz' > /tmp/notiz.txt"],
  ["Entwurf über die Shell anlegen", `echo 'status: entwurf' >> ${EINTRAG}`],
];

for (const [was, command] of bashErlaubt) {
  const r = rufeHook("node", GUARD, bashEvent(command));
  gleich(`guard lässt durch: ${was}`, r.code, 0);
}

/* ------------------------------------------------------------------ */
/* settings.json — die Verdrahtung, die den Hook überhaupt aufruft     */
/* ------------------------------------------------------------------ */
/*
 * Lektion 15: Ein Hook, der nicht aufgerufen wird, ist wirkungslos und meldet
 * das nicht. Der Bash-Zweig oben nützt nichts, solange settings.json keinen
 * Matcher dafür hat — deshalb wird die Verdrahtung mitgeprüft, samt der
 * deny-Regeln aus Schicht 1.
 */
{
  const settings = JSON.parse(readFileSync(path.join(PROJEKT, ".claude", "settings.json"), "utf8"));
  const matcher: string[] = (settings?.hooks?.PreToolUse ?? []).map((e: any) => e.matcher);
  pruefe("settings.json ruft guard.mjs für Write|Edit auf", matcher.includes("Write|Edit"), JSON.stringify(matcher));
  pruefe("settings.json ruft guard.mjs für Bash auf", matcher.includes("Bash"), JSON.stringify(matcher));

  const deny: string[] = settings?.permissions?.deny ?? [];
  for (const regel of [`Edit(/${SCHEMA})`, `Edit(/${SITE})`, "Edit(/.claude/**)", "Edit(/.github/**)"]) {
    pruefe(`permissions.deny enthält ${regel}`, deny.includes(regel), JSON.stringify(deny));
  }
}

/* ------------------------------------------------------------------ */
/* Die Grenze: Mechanik gesperrt, Text über Mechanik nicht             */
/* ------------------------------------------------------------------ */
/*
 * `.claude/` enthält die Mechanik der Absicherung — Hooks, Berechtigungen,
 * Agentendefinitionen. Was sich selbst absichert, darf sich nicht selbst
 * ändern, deshalb die Sperre.
 *
 * Die Kehrseite: Wer eine Datei dort ablegt, sperrt sie für alle künftige
 * Pflege mit. Genau das war mit den Lektionen passiert — eine Sammlung von
 * Erfahrungssätzen, also Dokumentation, lag hinter der Sperre für Mechanik
 * und konnte von der Instanz, die sie schreiben sollte, nie gepflegt
 * werden. Sie liegt jetzt in `docs/`.
 *
 * Diese Prüfung hält das fest, statt es der Erinnerung zu überlassen:
 * `.claude/rules/` darf nicht wieder entstehen, und die Lektionen müssen
 * in `docs/` liegen. Ohne sie wäre die Entscheidung eine Bitte (Lektion 6).
 */
{
  const alterOrt = path.join(PROJEKT, ".claude", "rules");
  const neuerOrt = path.join(PROJEKT, "docs", "lektionen.md");

  pruefe(
    "Lektionen liegen in docs/, nicht hinter der Agentensperre",
    existsSync(neuerOrt),
    `${neuerOrt} fehlt`,
  );
  pruefe(
    ".claude/rules/ existiert nicht mehr — dort gehört keine Dokumentation hin",
    !existsSync(alterOrt),
    `${alterOrt} ist wieder da`,
  );
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
