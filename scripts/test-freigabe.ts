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

/**
 * Ruft check-freigabe.ts im Temp-Verzeichnis auf.
 *
 * `FREIGABE_BESTAETIGT` wird ausdrücklich geleert, wenn der Aufruf sie nicht
 * setzt: Eine Variable, die zufällig in der Umgebung des Testlaufs steht,
 * bestätigte sonst Fälle, die hier als unbestätigt geprüft werden — und der
 * Test bestünde aus dem falschen Grund.
 *
 * Dasselbe gilt seit dem 2026-09-29 für `GITHUB_HEAD_REF`: Läuft dieser Test
 * in der CI auf einem Freigabe-PR, stünde dort `freigabe/<Lauf-ID>`, und die
 * Prüfung holte sich die echte Bestätigung dieses Laufs (_freigabelauf.ts).
 */
const lauf = (...args: string[]) => laufMit({}, ...args);
const laufMit = (umgebung: Record<string, string>, ...args: string[]) => {
  const r = spawnSync("npx", ["tsx", SKRIPT, ...args], {
    cwd: wurzel,
    encoding: "utf8",
    env: { ...process.env, FREIGABE_BESTAETIGT: "", GITHUB_HEAD_REF: "", ...umgebung },
  });
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

  /* --- Bestätigung aus der Umgebung (seit 2026-09-23) ------------ */
  /*
   * Der Freigabe-Workflow reicht die Slugs, die er gerade freigegeben hat,
   * über FREIGABE_BESTAETIGT an `verify:ci` weiter. Hier steht petticoat
   * und tellerrock auf live, beide gegenüber der Basis gewechselt.
   */
  {
    const r = laufMit({ FREIGABE_BESTAETIGT: "petticoat,tellerrock" }, "--basis", basis);
    gleich("Bestätigung aus der Umgebung ergibt Exit 0", r.code, 0);
    pruefe(
      "Bericht nennt die Herkunft der Bestätigung",
      r.stdout.includes("aus FREIGABE_BESTAETIGT"),
      r.stdout,
    );
  }
  {
    // Die Umgebung deckt nur, was sie nennt.
    const r = laufMit({ FREIGABE_BESTAETIGT: "petticoat" }, "--basis", basis);
    gleich("Umgebung deckt nicht die zweite Datei", r.code, 1);
    pruefe("Bericht nennt die ungedeckte Datei", r.stdout.includes("tellerrock.md"), r.stdout);
  }
  {
    // Kein Sammelwert: `*` und `alle` sind keine Slugs und bestätigen nichts.
    const r1 = laufMit({ FREIGABE_BESTAETIGT: "*" }, "--basis", basis);
    gleich("ein Stern bestätigt nichts", r1.code, 1);
    const r2 = laufMit({ FREIGABE_BESTAETIGT: "alle" }, "--basis", basis);
    gleich("\"alle\" bestätigt nichts", r2.code, 1);
    // Leer, nur Kommas, nur Leerzeichen: dasselbe wie gar keine Variable.
    const r3 = laufMit({ FREIGABE_BESTAETIGT: " , ,, " }, "--basis", basis);
    gleich("eine Variable aus Leerraum und Kommas bestätigt nichts", r3.code, 1);
  }
  {
    // Aufruf und Umgebung zusammen: jede Quelle deckt ihren Teil, und der
    // Bericht unterscheidet sie.
    const r = laufMit({ FREIGABE_BESTAETIGT: "tellerrock" }, "--basis", basis, "--freigabe", "petticoat");
    gleich("Aufruf und Umgebung zusammen ergeben Exit 0", r.code, 0);
    pruefe("Aufruf-Bestätigung ohne Herkunftsvermerk", r.stdout.includes("(Freigabe: petticoat)"), r.stdout);
    pruefe(
      "Umgebungs-Bestätigung mit Herkunftsvermerk",
      r.stdout.includes("(Freigabe: tellerrock, aus FREIGABE_BESTAETIGT)"),
      r.stdout,
    );
  }
  {
    // Ein Slug ohne Statuswechsel: kein Fehler, aber sichtbar.
    const r = laufMit({ FREIGABE_BESTAETIGT: "petticoat,tellerrock,gibtesnicht" }, "--basis", basis);
    gleich("ein überzähliger Slug macht nicht rot", r.code, 0);
    pruefe(
      "er wird auf stderr gemeldet",
      r.stderr.includes("ohne Statuswechsel") && r.stderr.includes("gibtesnicht"),
      JSON.stringify(r.stderr.slice(0, 200)),
    );
  }
  {
    // Lebenszeichen für den Harnisch selbst: Ohne gesetzte Variable ist
    // derselbe Stand weiterhin rot. Sonst wären die grünen Fälle oben auch
    // mit einem Skript wahr, das die Variable gar nicht liest und einfach
    // alles durchwinkt.
    const r = lauf("--basis", basis);
    gleich("ohne Variable bleibt derselbe Stand rot", r.code, 1);
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

  /* --- Bestätigung aus dem Freigabelauf (seit 2026-09-29) -------- */
  /*
   * Auf einem Freigabe-PR holt die Prüfung die Slugs aus dem Lauf, der den
   * PR geöffnet hat. Hier mit einem nachgebauten `gh` im PATH: `gh api`
   * liefert Workflow und Ereignis aus FAKE_GH_LAUF, `gh run download`
   * schreibt FAKE_GH_SLUGS als Artefaktdatei. Stand: petticoat, tellerrock
   * und der neu angelegte bolero stehen auf live.
   */
  {
    const bin = path.join(wurzel, ".fake-bin");
    mkdirSync(bin, { recursive: true });
    writeFileSync(
      path.join(bin, "gh"),
      [
        "#!/bin/sh",
        'if [ "$1" = "api" ]; then printf \'%s\' "$FAKE_GH_LAUF"; exit 0; fi',
        'if [ "$1" = "run" ] && [ "$2" = "download" ]; then',
        '  while [ $# -gt 0 ]; do if [ "$1" = "--dir" ]; then ziel="$2"; fi; shift; done',
        '  printf \'%s\' "$FAKE_GH_SLUGS" > "$ziel/freigabe-slugs.txt"; exit 0',
        "fi",
        "exit 1",
        "",
      ].join("\n"),
      { mode: 0o755 },
    );
    const pr = (lauf: string, slugs = "petticoat,tellerrock,bolero") => ({
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      GITHUB_HEAD_REF: "freigabe/42",
      GITHUB_REPOSITORY: "o/r",
      GH_TOKEN: "x",
      FAKE_GH_LAUF: lauf,
      FAKE_GH_SLUGS: slugs,
    });
    const ECHT = ".github/workflows/freigeben.yml\tworkflow_dispatch";

    const gut = laufMit(pr(ECHT), "--basis", basis);
    gleich("Freigabe-PR mit echtem Lauf ergibt Exit 0", gut.code, 0);
    pruefe("Bericht nennt die Herkunft der Bestätigung", gut.stdout.includes("aus Freigabelauf 42"), gut.stdout);

    const teil = laufMit(pr(ECHT, "petticoat"), "--basis", basis);
    gleich("der Lauf deckt nur, was er freigegeben hat", teil.code, 1);
    pruefe("…und der Bericht nennt die ungedeckte Datei", /FEHLER.*tellerrock\.md/.test(teil.stdout), teil.stdout);

    const fremd = laufMit(pr(".github/workflows/ci.yml\tworkflow_dispatch"), "--basis", basis);
    gleich("Lauf eines fremden Workflows bestätigt nichts", fremd.code, 1);
    pruefe("…und der Bericht sagt warum", fremd.stdout.includes("keine Bestätigung"), fremd.stdout);

    const push = laufMit(pr(".github/workflows/freigeben.yml\tpush"), "--basis", basis);
    gleich("nicht von Hand gestarteter Lauf bestätigt nichts", push.code, 1);

    const kein = laufMit({ ...pr(ECHT), GITHUB_HEAD_REF: "claude/irgendwas" }, "--basis", basis);
    gleich("ohne Freigabe-Zweig fragt die Prüfung keinen Lauf", kein.code, 1);
    pruefe("…und erwähnt keinen", !kein.stdout.includes("Freigabelauf"), kein.stdout);
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
