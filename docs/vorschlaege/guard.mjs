/**
 * VORSCHLAG — wird nicht ausgeführt.
 *
 * Einzusetzen als `.claude/hooks/guard.mjs` (vollständiger Ersatz). Das
 * Löschen dieser Datei danach übernimmt ein Agent. Agenten können `.claude/`
 * nicht schreiben, deshalb
 * liegt der Vorschlag hier; Begründung und Belege stehen in
 * ENTSCHEIDUNGEN.md („guard.mjs: Umleitungen nach ihrem Ziel beurteilen")
 * und im PR. `scripts/test-hooks.ts` prüft diese Fassung mit
 * `V101_GUARD=docs/vorschlaege/guard.mjs npx tsx scripts/test-hooks.ts`.
 *
 * ---------------------------------------------------------------------
 *
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
  //
  // Umleitungen stehen seit dem 2026-09-23 NICHT mehr in dieser Liste,
  // sondern werden unten nach ihrem Ziel beurteilt. Das nackte Zeichen `>`
  // traf `=>` (Pfeilfunktionen), `>=`, `2>&1` und `2>/dev/null` — also
  // reine Lesebefehle. Fünf belegte Fälle, einer davon hat einen
  // Mutationsbeleg still entwertet (OFFENE-PUNKTE.md, ENTSCHEIDUNGEN.md).
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
  ];
  const verbSchreibt = schreibverben.some((r) => r.test(befehl));

  // Umleitungen werden nach ihrem Ziel beurteilt, nicht nach ihrem Zeichen.
  // Jedes `>` liefert ein Kandidatenziel: das Wort dahinter. Ob es wirklich
  // eine Umleitung ist oder `=>`, `>=`, `2>&1` — das zu unterscheiden hieße,
  // die Shell zu parsen. Es ist auch nicht nötig: Bei `=>` ist das
  // „Ziel" ein Wort wie `console.log`, bei `>=` ein `=`, bei `2>&1` gibt es
  // keines, und `/dev/null` ist harmlos. Sperren kann nur ein Ziel, das ein
  // gesperrter Pfad ist oder (für den Status) in src/content/ liegt.
  //
  // Die erste Fassung dieses Vorschlags unterschied die Fälle mit
  // Look-arounds und filterte /dev/null. Der Mutationsbeleg hat alle drei
  // Bausteine als wirkungslos gezeigt — sie sind deshalb weg.
  const umleitungsZiele = [...befehl.matchAll(/>>?\s*(["']?)([^\s"'|;&()<>]+)\1/g)].map((m) => m[2]);

  for (const { imBefehl, grund } of gesperrt) {
    // Verben nehmen ihren Pfad als Argument irgendwo im Befehl — dort bleibt
    // es beim groben Blick auf den ganzen Text. Eine Umleitung dagegen
    // schreibt genau in ihr Ziel, und nur das Ziel entscheidet.
    const perVerb = verbSchreibt && imBefehl.test(befehl);
    const perUmleitung = umleitungsZiele.some((ziel) => imBefehl.test(ziel));
    if (perVerb || perUmleitung) {
      verweigern(
        `${grund}\n\nDieser Pfad ist auch über die Shell gesperrt: Der Befehl enthält einen Schreibzugriff (Umleitung, sed -i, tee, cp, mv, git checkout/restore o. ä.) auf einen gesperrten Pfad. Der Hook prüft Write, Edit und Bash gleichermaßen.`,
      );
    }
  }

  // Der Statuswechsel steckt nicht immer im String "status: veroeffentlicht".
  // Der naheliegendste Shell-Weg ist eine Ersetzung — `sed -i
  // s/entwurf/veroeffentlicht/ …` —, in der das Feld gar nicht vorkommt.
  // Beim ersten Probelauf dieses Hooks ging genau dieser Befehl durch.
  //
  // Das Wort allein taugt aber nicht als Muster: Der dritte Preiszustand
  // heißt `unveroeffentlicht` und enthält es als Teilwort. Geprüft werden
  // deshalb zwei Formen, beide mit Wortgrenze:
  //
  //   1. der Feldname davor — `status: veroeffentlicht`, auch mit
  //      Anführungszeichen oder zusätzlichem Leerraum;
  //   2. das Wort als Ziel einer Ersetzung — `s/entwurf/veroeffentlicht/`,
  //      `s|…|…|`, `gsub("…","…")`.
  //
  // Form 2 muss bleiben. Ein Muster, das den Feldnamen VERLANGT, ließe genau
  // den Befehl wieder durch, der beim ersten Probelauf durchging;
  // `scripts/test-hooks.ts` hält diesen Fall seit damals fest.
  //
  // Geschrieben wird hier, wenn ein Verb im Befehl steht, eine Umleitung in
  // src/content/ zielt oder ein Heredoc Text liefert. Eine Umleitung nach
  // /tmp oder /dev/null neben einem lesenden `grep` auf das Statuswort ist
  // kein Schreibzugriff auf das Register — sie wurde bis zum 2026-09-23
  // trotzdem blockiert.
  //
  // Bewusst NICHT gelockert: Eine Ersetzung per `sed -i` in einer
  // Statuszeile bleibt gesperrt, auch rückwärts (`veroeffentlicht` zu
  // `entwurf`). Die Richtung aus dem Befehlstext zu lesen, wäre fehleranfällig,
  // und der seltene Rückweg lässt sich über ein Skript gehen.
  const heredoc = /<<-?\s*['"]?\w+/.test(befehl);
  const WORT = String.raw`\bveroeffentlicht\b`;
  const freigabeMuster = [
    new RegExp(String.raw`status:\s*["']?\s*` + WORT),
    new RegExp(String.raw`["'/|,#]\s*` + WORT + String.raw`\s*["'/|,#]`),
  ];
  const schreibtInsRegister = verbSchreibt || heredoc || umleitungsZiele.some((ziel) => /src\/content\//.test(ziel));
  if (freigabeMuster.some((r) => r.test(befehl)) && /src\/content\//.test(befehl) && schreibtInsRegister) {
    verweigern(
      "status: veroeffentlicht darf nur ein Mensch setzen. Lege den Eintrag mit status: entwurf an; die Freigabe läuft über die Review-Warteschlange (npm run stale).\n\nDieser Befehl setzt den Status über die Shell. Die Sperre gilt für Write, Edit und Bash gleichermaßen — und `scripts/check-freigabe.ts` prüft den Statuswechsel zusätzlich im Build gegen die Basis, unabhängig davon, welches Werkzeug geschrieben hat.",
    );
  }
}
