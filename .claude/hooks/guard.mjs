/**
 * Sperren für agentische Schreibzugriffe. Exit 2 blockiert den Tool-Aufruf,
 * stderr geht als Begründung an das Modell zurück.
 *
 * Zwei Eingangswege, weil es zwei Schreibwege gibt:
 *
 *   - `tool_input.file_path` — Write und Edit. Der ursprüngliche Fall.
 *   - `tool_input.command`  — Bash. Nachgerüstet nach Befund M8: Der Hook
 *     hing am Matcher `Write|Edit` und sah Shell-Schreibzugriffe nie. Ein
 *     `sed -i` auf eine gesperrte Datei lief kommentarlos durch; aufgefallen
 *     ist es beim Negativtest zu PR #3, als `status: veroeffentlicht` per
 *     `sed` gesetzt wurde und keine Sperre ansprang.
 *
 * GRENZEN DIESER DATEI — bitte nicht überschätzen:
 *
 * Der Bash-Zweig erkennt Muster, keine Absichten. Er liest den Befehlstext
 * und sucht nach bekannten Schreibarten. Wer einen anderen Weg wählt, kommt
 * durch. Namentlich nicht abgedeckt:
 *
 *   - base64- oder anders kodierte Befehle (`echo <b64> | base64 -d | sh`),
 *   - Skripte, die anderswo geschrieben und dann ausgeführt werden
 *     (`node schreib.mjs`, `python3 - <<EOF ... EOF`),
 *   - Interpreter, die selbst Dateien öffnen — genau der Weg, den die
 *     Sitzungen dieses Projekts bisher benutzt haben,
 *   - Pfade über Variablen, Globs oder Symlinks (`f=_schemas.ts; sed -i … $f`),
 *   - `git apply`, `patch`, `install`, `rsync`, `truncate` und alles Weitere,
 *     was nicht in der Liste unten steht.
 *
 * Diese Schicht senkt die Wahrscheinlichkeit eines versehentlichen
 * Schreibzugriffs. Sie hält niemanden auf, der den Weg sucht. Die härtere
 * Ebene sind die `permissions.deny`-Regeln in settings.json (Schicht 1), die
 * unabhängig vom Matcher greifen; die letzte Instanz ist
 * `scripts/check-freigabe.ts` im Build (Schicht 3), die nicht danach fragt,
 * wer geschrieben hat, sondern was am Ende dasteht.
 */
import { readFileSync } from "node:fs";

const eingabe = JSON.parse(readFileSync(0, "utf8") || "{}");
const datei = eingabe?.tool_input?.file_path ?? "";
const inhalt = eingabe?.tool_input?.content ?? eingabe?.tool_input?.new_string ?? "";
const befehl = eingabe?.tool_input?.command ?? "";

const verweigern = (grund) => {
  console.error(grund);
  process.exit(2);
};

/* ------------------------------------------------------------------ */
/* Gesperrte Pfade                                                     */
/* ------------------------------------------------------------------ */

const gesperrt = [
  {
    muster: /\/src\/content\/_schemas\.ts$/,
    // Für den Befehlstext: derselbe Pfad, aber ohne Anker am Zeilenende,
    // weil er dort mitten im Befehl steht.
    imBefehl: /src\/content\/_schemas\.ts/,
    grund:
      "src/content/_schemas.ts ist gesperrt. Schemaänderungen brauchen eine ausdrückliche menschliche Entscheidung — nicht als Nebenwirkung einer Recherche. Melde stattdessen, welches Feld fehlt.",
  },
  {
    muster: /\/src\/site\.config\.ts$/,
    imBefehl: /src\/site\.config\.ts/,
    grund: "src/site.config.ts ist gesperrt: Die Domain steckt in jeder @id des Wissensgraphen.",
  },
  {
    muster: /\/\.claude\//,
    imBefehl: /(^|[\s"'=/])\.claude\//,
    grund: "Die Agenten-Konfiguration ist für Agenten gesperrt.",
  },
  {
    muster: /\/\.github\//,
    imBefehl: /(^|[\s"'=/])\.github\//,
    grund: "CI-Konfiguration ist für Agenten gesperrt.",
  },
];

/* ------------------------------------------------------------------ */
/* Weg 1: Write und Edit                                               */
/* ------------------------------------------------------------------ */

if (datei) {
  for (const { muster, grund } of gesperrt) if (muster.test(datei)) verweigern(grund);

  // Veröffentlichungsstatus setzt der Mensch. Ohne diese Sperre wandert früher
  // oder später ein unbelegter Entwurf live — die Reputation eines Registers
  // hängt daran, dass die Termine stimmen.
  if (/\/src\/content\/.*\.md$/.test(datei) && /^status:[ \t]*veroeffentlicht[ \t]*$/m.test(inhalt)) {
    verweigern(
      "status: veroeffentlicht darf nur ein Mensch setzen. Lege den Eintrag mit status: entwurf an; die Freigabe läuft über die Review-Warteschlange (npm run stale).",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Weg 2: Bash                                                         */
/* ------------------------------------------------------------------ */

if (befehl) {
  // Schreibende Verben, die einen Pfad als Argument nehmen. Bewusst grob:
  // Der Befehlstext wird als Ganzes betrachtet, nicht geparst. Lieber eine
  // Meldung zu viel — ein Lesezugriff lässt sich anders formulieren, ein
  // übersehener Schreibzugriff nicht zurücknehmen.
  const schreibverben = [
    /\bsed\b[^|;&]*\s-[a-zA-Z]*i/, //   sed -i, sed -Ei, sed --in-place
    /\bsed\b[^|;&]*--in-place/,
    /\btee\b/, //                       tee und tee -a
    /\bcp\b/,
    /\bmv\b/,
    /\bdd\b/,
    /\btruncate\b/,
    /\binstall\b\s+-/,
    /\brsync\b/,
    /\bpatch\b/,
    /\bgit\s+(checkout|restore|apply)\b/,
    /\bperl\b[^|;&]*\s-[a-zA-Z]*i/, //  perl -pi -e
    />>?/, //                           Umleitungen, auch 2> und &>
  ];

  const schreibt = schreibverben.some((r) => r.test(befehl));

  if (schreibt) {
    for (const { imBefehl, grund } of gesperrt) {
      if (imBefehl.test(befehl)) {
        verweigern(
          `${grund}\n\nDieser Pfad ist auch über die Shell gesperrt: Der Befehl enthält einen Schreibzugriff (Umleitung, sed -i, tee, cp, mv, git checkout/restore o. ä.) auf einen gesperrten Pfad. Der Hook prüft Write, Edit und Bash gleichermaßen.`,
        );
      }
    }
  }

  // Der Statuswechsel steckt nicht immer im String "status: veroeffentlicht".
  // Der naheliegendste Shell-Weg ist eine Ersetzung — `sed -i
  // s/entwurf/veroeffentlicht/ …` —, in der das Feld gar nicht vorkommt.
  // Beim ersten Probelauf dieses Hooks ging genau dieser Befehl durch.
  // Deshalb reicht das Wort allein, sobald der Befehl schreibt und einen
  // Inhaltspfad nennt. Ein reines `grep veroeffentlicht src/content/` bleibt
  // erlaubt, weil dort kein Schreibverb steht.
  const heredoc = /<<-?\s*['"]?\w+/.test(befehl);
  if (
    /veroeffentlicht/.test(befehl) &&
    /src\/content\//.test(befehl) &&
    (schreibt || heredoc)
  ) {
    verweigern(
      "status: veroeffentlicht darf nur ein Mensch setzen. Lege den Eintrag mit status: entwurf an; die Freigabe läuft über die Review-Warteschlange (npm run stale).\n\nDieser Befehl setzt den Status über die Shell. Die Sperre gilt für Write, Edit und Bash gleichermaßen — und `scripts/check-freigabe.ts` prüft den Statuswechsel zusätzlich im Build gegen die Basis, unabhängig davon, welches Werkzeug geschrieben hat.",
    );
  }
}
