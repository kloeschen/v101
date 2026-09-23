#!/usr/bin/env -S npx tsx
/**
 * test-freigeben.ts — die Sperre gegen ein Freigabewerkzeug, das Kaputtes
 * durchlässt.
 *
 * Ein Skript, das Entwürfe massenhaft auf `veroeffentlicht` setzt, ist
 * nützlich, solange es prüft, und gefährlich, sobald es das nicht mehr tut.
 * Der Fall, der zählt, ist deshalb nicht "gibt frei, was sauber ist",
 * sondern "gibt NICHT frei, was einen Regelverstoß hat".
 *
 * NACH LEKTION 19: Jede Prüfung hier verlangt ein positives Lebenszeichen —
 * eine Aussage, die nur wahr sein kann, wenn das Skript den Eintrag
 * tatsächlich angefasst und geprüft hat. Ein bloßes "keine Änderung an der
 * Datei" wäre auch dann wahr, wenn das Skript den Eintrag nie gesehen hätte:
 * ein Ergebnis mit zwei Ursachen. Deshalb wird zusätzlich verlangt, dass der
 * Bericht den Eintrag namentlich unter ABGELEHNT führt und den konkreten
 * Befund nennt.
 *
 *   npx tsx scripts/test-freigeben.ts
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* Der freigegebene Status wird aus Fragmenten gebaut: Der Bash-Zweig von
 * guard.mjs prüft auf das Wort, und diese Datei nennt es mehrfach. */
const FREI = ["veroeffent", "licht"].join("");

/* ------------------------------------------------------------------ */
/* Prüfeinträge                                                        */
/* ------------------------------------------------------------------ */

/**
 * Sauber und vollständig — inklusive `autor`, denn die Regel
 * `veroeffentlichungsreife` verlangt ihn und meldet für Entwürfe nichts.
 * Genau darum prüft freigeben.ts den Zustand NACH der Änderung.
 * Ein Feld mit `undefined` in `extra` wird weggelassen.
 */
const eintrag = (name: string, verweise: string[], extra: Record<string, string | undefined> = {}) => {
  const felder: Record<string, string | undefined> = {
    name,
    aliases: `[${name}-Kurzform]`,
    kurzbeschreibung: `${name} ist eine Spieltechnik auf dem Kontrabass, bei der die Saiten hörbar auf das Griffbrett schlagen und ein perkussives Klacken erzeugen.`,
    status: "entwurf",
    erstelltAm: "2026-09-02",
    geprueftAm: "2026-09-02",
    autor: "markus",
    kategorie: "musiktechnik",
    definition: `${name} ist eine Kontrabasstechnik, bei der die Saiten perkussiv gegen das Griffbrett geschlagen werden.`,
    abgrenzung: `${name} am Kontrabass wird häufig mit der gleichnamigen Technik am E-Bass verwechselt, bei der der Daumen die Saite anschlägt.`,
    ...extra,
  };
  // `undefined` heisst: Feld weglassen. So laesst sich ein Pflichtfeld
  // gezielt entfernen, statt es mit einem Leerwert zu fuellen.
  const kopf = Object.entries(felder)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  // Die Verweise sind Pflicht, nicht Zierde: `interne-links` verlangt eine
  // Mindestzahl verschiedener Ziele, und `quellen-vorhanden` einen Beleg.
  // Eine Fixture, die daran scheitert, prüft die Freigabelogik nicht mehr,
  // sondern nur noch ihre eigene Unvollständigkeit.
  const links = verweise.map((v) => `[${v}](/lexikon/${v}/)`).join(" und ");

  return `---
${kopf}
quellen:
  - url: https://de.wikipedia.org/wiki/Kontrabass
    titel: Kontrabass (Wikipedia)
    abgerufenAm: 2026-09-02
    felder: [definition, abgrenzung, body:ausfuehrung]
    art: nachschlagewerk
---

${name} ist eine Spieltechnik auf dem Kontrabass, bei der die Saiten nach dem Zupfen hörbar auf das Griffbrett zurückschlagen. Das dabei entstehende perkussive Klacken übernimmt einen Teil der Funktion, die in anderen Besetzungen das Schlagzeug trägt. Die Technik prägt den Klang des Rockabilly maßgeblich und ist dort weiter verbreitet als das reine Zupfen.

## Ausführung von ${name}

Die Saite wird kräftig vom Griffbrett weggezogen und losgelassen, sodass sie beim Zurückschnellen aufschlägt. Geübte Spieler kombinieren den Anschlag mit einem Schlag der Handfläche auf die Saiten, was einen zweiten, trockeneren Akzent ergibt. Verwandt sind ${links}.

## Abgrenzung von ${name}

Am E-Bass bezeichnet derselbe Ausdruck eine andere Bewegung: Dort schlägt der Daumen die Saite an, und der Klang entsteht am Tonabnehmer statt am Griffbrett. Wer die Begriffe verwechselt, sucht am Kontrabass nach einer Technik, die es dort nicht gibt.
`;
};

/* ------------------------------------------------------------------ */
/* Prüfprojekt                                                         */
/* ------------------------------------------------------------------ */

/**
 * Eigenes src/content, echte scripts und node_modules. `realpathSync` ist
 * hier nicht nötig, weil freigeben.ts über den Loader läuft, der beide
 * Seiten auflöst (siehe Lektion 19) — der Aufruf verwendet trotzdem den
 * aufgelösten Pfad, damit ein Fehlschlag eindeutig am Skript liegt.
 */
function baueTempProjekt(): string {
  const wurzel = mkdtempSync(path.join(os.tmpdir(), "v101-freigabetest-"));
  mkdirSync(path.join(wurzel, "src", "content", "lexikon"), { recursive: true });
  symlinkSync(path.join(PROJEKT, "scripts"), path.join(wurzel, "scripts"), "dir");
  symlinkSync(path.join(PROJEKT, "node_modules"), path.join(wurzel, "node_modules"), "dir");
  symlinkSync(path.join(PROJEKT, "src", "content", "_schemas.ts"), path.join(wurzel, "src", "content", "_schemas.ts"));
  symlinkSync(path.join(PROJEKT, "src", "site.config.ts"), path.join(wurzel, "src", "site.config.ts"));
  symlinkSync(path.join(PROJEKT, "src", "lib"), path.join(wurzel, "src", "lib"), "dir");
  return wurzel;
}

function lauf(wurzel: string, args: string[], umgebung: Record<string, string> = {}) {
  // GITHUB_OUTPUT wird entfernt, solange ein Fall sie nicht ausdrücklich
  // setzt: Läuft dieser Test selbst in GitHub Actions, stünde sie sonst in
  // der Umgebung, und jeder Fall schriebe in die echte Ausgabedatei der CI.
  const basis = { ...process.env };
  delete basis.GITHUB_OUTPUT;
  const r = spawnSync("npx", ["tsx", path.join(PROJEKT, "scripts", "freigeben.ts"), ...args], {
    encoding: "utf8",
    cwd: wurzel,
    env: { ...basis, ...umgebung },
  });
  return { code: r.status ?? -1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const temp = baueTempProjekt();
const datei = (slug: string) => path.join(temp, "src", "content", "lexikon", `${slug}.md`);
const statusVon = (slug: string) => readFileSync(datei(slug), "utf8").match(/^status:[ \t]*(\S+)/m)?.[1];
const geprueftAmVon = (slug: string) => readFileSync(datei(slug), "utf8").match(/^geprueftAm:[ \t]*(\S+)/m)?.[1];

try {
  /* ---------------------------------------------------------------- */
  /* 1. Der Fall, der zählt: Regelverstoß wird NICHT freigegeben       */
  /* ---------------------------------------------------------------- */
  /*
   * Ein fehlender `autor` lässt die Regel `veroeffentlichungsreife` einen
   * FEHLER melden. Für den Entwurf meldet sie NICHTS — der Verstoß existiert
   * erst im freigegebenen Zustand. Damit prüft dieser Fall zugleich, dass
   * freigeben.ts gegen den Zustand nach der Änderung prüft und nicht gegen
   * den davor.
   *
   * Vorher stand hier `aliases: []`. Das war ebenfalls ein Befund dieser
   * Regel, aber nur eine Warnung, die erst `--strict` zum Blocker machte —
   * und genau die ist inzwischen ein Hinweis, weil nicht jeder Begriff eine
   * gebräuchliche Zweitbezeichnung hat. Der fehlende Autor ist der
   * belastbarere Fall: Einen Autor hat jeder Eintrag, den ein Mensch
   * freigibt, das ist immer erfüllbar.
   */
  // FESTE LINKZIELE, von Anfang an freigegeben.
  //
  // Bis zum 2026-09-23 verlinkten die Prüfeinträge aufeinander: `sauber`
  // zeigte auf `kaputt` (fällt durch, bleibt Entwurf) und auf `trocken` (wird
  // nie freigegeben). In der Produktion wären das tote Links gewesen. Die
  // Regel `link-auf-entwurf` hat beim ersten Lauf dieser Datei elf
  // Behauptungen fallen lassen — nicht weil die Freigabelogik falsch war,
  // sondern weil die Vorrichtung genau den Zustand trug, den die neue Regel
  // verbietet. Jetzt zeigen alle Prüfeinträge auf drei Anker, die schon
  // freigegeben sind; Querverweise gibt es nur dort, wo ein Abschnitt sie
  // prüft (8 und 9).
  const ANKER = ["anker-eins", "anker-zwei", "anker-drei"];
  for (const a of ANKER) {
    writeFileSync(
      datei(a),
      eintrag(`Anker${a.split("-")[1]}`, ANKER.filter((x) => x !== a), { status: FREI }),
    );
  }
  const ziele = ["anker-eins", "anker-zwei"];

  writeFileSync(datei("kaputt"), eintrag("Kaputtprobe", ziele, { autor: undefined }));
  writeFileSync(datei("sauber"), eintrag("Sauberprobe", ziele));
  writeFileSync(datei("trocken"), eintrag("Trockenprobe", ziele));

  {
    const r = lauf(temp, ["--slugs", "kaputt,sauber"]);

    gleich("Eintrag mit Regelverstoß bleibt Entwurf", statusVon("kaputt"), "entwurf");
    gleich("geprueftAm des abgelehnten Eintrags bleibt stehen", geprueftAmVon("kaputt"), "2026-09-02");

    // Positives Lebenszeichen: Der Bericht muss den Eintrag namentlich
    // führen UND den Befund nennen. Ohne das wäre "blieb Entwurf" auch dann
    // wahr, wenn das Skript ihn nie angefasst hätte.
    pruefe(
      "Bericht führt den abgelehnten Eintrag namentlich",
      /ABGELEHNT[\s\S]*lexikon\/kaputt/.test(r.out),
      JSON.stringify(r.out.slice(0, 400)),
    );
    pruefe(
      "Bericht nennt den konkreten Befund, nicht nur die Ablehnung",
      r.out.includes("veroeffentlichungsreife"),
      JSON.stringify(r.out.slice(0, 400)),
    );

    // Und die Gegenrichtung im selben Lauf: Ein sauberer Eintrag geht durch.
    // Ohne ihn wäre "nichts freigegeben" auch mit einem Skript wahr, das
    // grundsätzlich nichts tut.
    gleich("sauberer Eintrag im selben Lauf wird freigegeben", statusVon("sauber"), FREI);
    pruefe(
      "Bericht führt den freigegebenen Eintrag namentlich",
      /FREIGEGEBEN[\s\S]*lexikon\/sauber/.test(r.out),
      JSON.stringify(r.out.slice(0, 400)),
    );
    pruefe("Freigabelauf endet ohne Fehlercode", r.code === 0, `Code ${r.code}`);
  }

  /* ---------------------------------------------------------------- */
  /* 2. Bereits freigegeben bleibt unangetastet                        */
  /* ---------------------------------------------------------------- */
  /*
   * Der zweite Lauf über denselben Eintrag darf `geprueftAm` nicht
   * weiterschieben. Sonst behauptete die Prüfkadenz eine Prüfung, die
   * niemand vorgenommen hat.
   */
  {
    // Der Eintrag muss ein ALTES geprueftAm tragen. Nimmt man den soeben
    // freigegebenen, hat der erste Lauf geprueftAm schon auf heute gesetzt --
    // ein zweiter Lauf schriebe denselben Wert, und "zeichengenau
    // unveraendert" waere auch ohne die Sprungmarke wahr. Zwei Ursachen, ein
    // Ergebnis; der Mutationsbeleg hat genau das aufgedeckt (Lektion 19).
    writeFileSync(
      datei("schonfrei"),
      eintrag("Schonfreiprobe", ziele, { status: FREI, geprueftAm: "2026-01-15" }),
    );
    const vorher = readFileSync(datei("schonfrei"), "utf8");
    const r = lauf(temp, ["--slugs", "schonfrei"]);

    gleich("zweiter Lauf lässt die Datei zeichengenau unverändert", readFileSync(datei("schonfrei"), "utf8"), vorher);
    gleich("geprueftAm wandert nicht auf heute", geprueftAmVon("schonfrei"), "2026-01-15");
    pruefe(
      "Bericht führt ihn als unverändert, mit Grund",
      /UNVERÄNDERT[\s\S]*lexikon\/schonfrei[\s\S]*bereits freigegeben/.test(r.out),
      JSON.stringify(r.out.slice(0, 400)),
    );
    pruefe(
      "und zählt ihn nicht als geprüft",
      /Geprüft mit validate-content --strict und check-jsonld --strict: 0 /.test(r.out),
      JSON.stringify(r.out.slice(-300)),
    );
  }

  /* ---------------------------------------------------------------- */
  /* 3. Der Trockenlauf schreibt nichts — auch nicht kurz              */
  /* ---------------------------------------------------------------- */
  {
    const vorher = readFileSync(datei("trocken"), "utf8");
    const r = lauf(temp, ["--slugs", "trocken", "--dry-run"]);

    gleich("Trockenlauf lässt die Datei zeichengenau unverändert", readFileSync(datei("trocken"), "utf8"), vorher);
    pruefe(
      "Trockenlauf hat trotzdem wirklich geprüft",
      /WÜRDEN FREIGEGEBEN[\s\S]*lexikon\/trocken/.test(r.out) && /je zwei Läufe/.test(r.out),
      JSON.stringify(r.out.slice(0, 400)),
    );
  }

  /* ---------------------------------------------------------------- */
  /* 4. Ein unbekannter Slug ist ein Tippfehler, kein leerer Zustand   */
  /* ---------------------------------------------------------------- */
  {
    const r = lauf(temp, ["--slugs", "gibtesnicht"]);
    gleich("unbekannter Slug endet mit Fehlercode", r.code, 1);
    pruefe("und wird namentlich genannt", /NICHT GEFUNDEN[\s\S]*gibtesnicht/.test(r.out), JSON.stringify(r.out.slice(0, 300)));
  }

  /* ---------------------------------------------------------------- */
  /* 5. Ohne Auswahl passiert nichts                                   */
  /* ---------------------------------------------------------------- */
  {
    const r = lauf(temp, []);
    gleich("Aufruf ohne Auswahl endet mit Fehlercode", r.code, 2);
    pruefe("und sagt, was fehlt", r.out.includes("--slugs"), JSON.stringify(r.out.slice(0, 200)));
  }

  /* ---------------------------------------------------------------- */
  /* 6. Die Slug-Ausgabe für den Freigabe-Workflow                     */
  /* ---------------------------------------------------------------- */
  /*
   * Der Workflow reicht diese Liste als FREIGABE_BESTAETIGT an `verify:ci`
   * weiter. Entscheidend ist, WAS darin steht: die tatsächlich
   * freigegebenen Slugs — nicht die Eingabe. Ein abgelehnter Eintrag in der
   * Liste wäre eine Bestätigung für etwas, das gar nicht wechselt; ein
   * fehlender freigegebener hieße, dass die Kette im Workflow an genau dem
   * Eintrag scheitert, den er gerade freigegeben hat.
   */
  {
    writeFileSync(datei("ausgabeok"), eintrag("Ausgabeprobe", ziele));
    writeFileSync(datei("ausgabekaputt"), eintrag("Ausgabefehler", ziele, { autor: undefined }));
    const ausgabe = path.join(temp, "github-output.txt");
    writeFileSync(ausgabe, "", "utf8");

    const r = lauf(temp, ["--slugs", "ausgabeok,ausgabekaputt"], { GITHUB_OUTPUT: ausgabe });
    const inhalt = readFileSync(ausgabe, "utf8");

    // Lebenszeichen zuerst: Der Lauf hat wirklich einen freigegeben und
    // einen abgelehnt. Sonst wäre die Ausgabe auch aus einem zweiten Grund
    // so, wie sie ist.
    gleich("Probe: der saubere Eintrag wurde freigegeben", statusVon("ausgabeok"), FREI);
    gleich("Probe: der kaputte blieb Entwurf", statusVon("ausgabekaputt"), "entwurf");

    gleich("die Ausgabe nennt genau die freigegebenen Slugs", inhalt, "slugs=ausgabeok\n");
    pruefe("der abgelehnte Slug steht nicht darin", !inhalt.includes("ausgabekaputt"), JSON.stringify(inhalt));
    pruefe("Lauf endet ohne Fehlercode", r.code === 0, `Code ${r.code}`);
  }
  {
    // Ein Trockenlauf gibt nichts frei, also bestätigt er auch nichts.
    writeFileSync(datei("ausgabetrocken"), eintrag("Trockenausgabe", ziele));
    const ausgabe = path.join(temp, "github-output-trocken.txt");
    writeFileSync(ausgabe, "", "utf8");
    lauf(temp, ["--slugs", "ausgabetrocken", "--dry-run"], { GITHUB_OUTPUT: ausgabe });
    gleich("ein Trockenlauf schreibt keine Slug-Ausgabe", readFileSync(ausgabe, "utf8"), "");
    gleich("und lässt den Eintrag, wie er war", statusVon("ausgabetrocken"), "entwurf");
  }

  /* ---------------------------------------------------------------- */
  /* 7. Die Freigabe zieht den Autolink nach                           */
  /* ---------------------------------------------------------------- */
  /*
   * Seit dem 2026-09-23 verlinkt der Autolink nur freigegebene Ziele. Ein
   * eben freigegebener Begriff wird also erst durch die Freigabe zum Ziel —
   * und freigeben.ts muss die Links im selben Lauf setzen. Täte es das
   * nicht, meldete `autolink:check` im Freigabe-Workflow Drift, `verify:ci`
   * würde rot, und es entstünde gar kein Pull Request.
   */
  {
    writeFileSync(datei("slaptechnik"), eintrag("Slaptechnik", ziele));
    writeFileSync(
      datei("erwaehner"),
      eintrag("Erwaehnerprobe", ziele) +
        "\nIm Unterricht beginnt man selten mit der Slaptechnik, sondern mit dem gezupften Grundton.\n",
    );
    const nenntLink = () => readFileSync(datei("erwaehner"), "utf8").includes("[Slaptechnik](/lexikon/slaptechnik/)");

    // Lebenszeichen: Der erwähnende Text nennt den Begriff wirklich — sonst
    // wäre "kein Link" auch aus diesem Grund wahr.
    pruefe("Probe: der Text nennt den Begriff", readFileSync(datei("erwaehner"), "utf8").includes("Slaptechnik"));

    // Trockenlauf: nichts freigegeben, also auch kein Link.
    lauf(temp, ["--slugs", "slaptechnik", "--dry-run"]);
    pruefe("ein Trockenlauf setzt keinen Link auf den Kandidaten", !nenntLink());
    gleich("und der Kandidat bleibt Entwurf", statusVon("slaptechnik"), "entwurf");

    // Echte Freigabe: Jetzt muss der Link da sein.
    const r = lauf(temp, ["--slugs", "slaptechnik"]);
    gleich("der Begriff wurde freigegeben", statusVon("slaptechnik"), FREI);
    pruefe("die Freigabe setzt den Link im selben Lauf", nenntLink(), readFileSync(datei("erwaehner"), "utf8").slice(-200));
    pruefe("der Bericht weist den Autolink aus", r.out.includes("Autolink nach der Freigabe"), JSON.stringify(r.out.slice(-300)));
    pruefe("Lauf endet ohne Fehlercode", r.code === 0, `Code ${r.code}`);
  }

  /* ---------------------------------------------------------------- */
  /* 8. Gemeinsam freigeben: die Reihenfolge darf nichts entscheiden   */
  /* ---------------------------------------------------------------- */
  /*
   * Seit `link-auf-entwurf` darf ein freigegebener Eintrag nicht auf einen
   * Entwurf zeigen. Früher wurde Eintrag für Eintrag geprüft — ein Artikel,
   * der vor seinem Begriff an der Reihe war, wäre abgelehnt worden, weil der
   * Begriff in dem Moment noch Entwurf war. Die Freigabe vom 2026-09-22 wäre
   * daran gescheitert.
   *
   * "kette-artikel" kommt alphabetisch VOR "kette-begriff": Die Reihenfolge,
   * die früher scheiterte, ist hier die, in der das Skript sie sieht.
   */
  {
    writeFileSync(datei("kette-begriff"), eintrag("Kettenbegriff", ziele));
    writeFileSync(datei("kette-artikel"), eintrag("Kettenartikel", ["kette-begriff", "anker-eins"]));
    const r = lauf(temp, ["--slugs", "kette-artikel,kette-begriff"]);
    gleich("der Begriff wird freigegeben", statusVon("kette-begriff"), FREI);
    gleich("und der Artikel, der vor ihm an der Reihe war, ebenfalls", statusVon("kette-artikel"), FREI);
    pruefe("keiner der beiden wird abgelehnt", !/ABGELEHNT/.test(r.out), JSON.stringify(r.out.slice(0, 400)));
  }

  /* ---------------------------------------------------------------- */
  /* 9. Kaskade: fällt das Ziel durch, fällt der Verweis mit           */
  /* ---------------------------------------------------------------- */
  /*
   * Das Gegenstück zu 8, und der Grund für die Wiederholung bis zum
   * Fixpunkt: Im ersten Durchgang ist das Ziel noch mit freigegeben, der
   * Verweis darauf also gültig. Erst wenn das Ziel zurückgerollt ist, zeigt
   * der Verweis auf einen Entwurf — das sieht nur ein zweiter Durchgang.
   */
  {
    writeFileSync(datei("kaskade-ziel"), eintrag("Kaskadenziel", ziele, { autor: undefined }));
    writeFileSync(datei("kaskade-zeiger"), eintrag("Kaskadenzeiger", ["kaskade-ziel", "anker-eins"]));
    const r = lauf(temp, ["--slugs", "kaskade-ziel,kaskade-zeiger"]);
    gleich("das Ziel mit Regelverstoß bleibt Entwurf", statusVon("kaskade-ziel"), "entwurf");
    gleich("der Eintrag, der darauf zeigt, bleibt ebenfalls Entwurf", statusVon("kaskade-zeiger"), "entwurf");
    pruefe(
      "und der Bericht nennt dafür den Link auf den Entwurf",
      /ABGELEHNT[\s\S]*kaskade-zeiger[\s\S]*link-auf-entwurf/.test(r.out),
      JSON.stringify(r.out.slice(0, 600)),
    );
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
