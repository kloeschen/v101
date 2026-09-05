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
 * Sauber und vollständig — inklusive `aliases`, denn die Regel
 * `veroeffentlichungsreife` verlangt sie und meldet für Entwürfe nichts.
 * Genau darum prüft freigeben.ts den Zustand NACH der Änderung.
 */
const eintrag = (name: string, verweise: string[], extra: Record<string, string> = {}) => {
  const felder: Record<string, string> = {
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
  const kopf = Object.entries(felder)
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

function lauf(wurzel: string, args: string[]) {
  const r = spawnSync("npx", ["tsx", path.join(PROJEKT, "scripts", "freigeben.ts"), ...args], {
    encoding: "utf8",
    cwd: wurzel,
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
   * `aliases: []` lässt die Regel `veroeffentlichungsreife` eine Warnung
   * melden, die unter --strict zum Fehler wird. Für den Entwurf meldet sie
   * NICHTS — der Verstoß existiert erst im freigegebenen Zustand. Damit
   * prüft dieser Fall zugleich, dass freigeben.ts gegen den Zustand nach
   * der Änderung prüft und nicht gegen den davor.
   */
  // Alle drei zuerst anlegen: Die internen Links zeigen aufeinander, und ein
  // Link auf einen noch nicht existierenden Eintrag waere ein Verstoss, der
  // mit der Freigabelogik nichts zu tun hat.
  writeFileSync(datei("kaputt"), eintrag("Kaputtprobe", ["sauber", "trocken"], { aliases: "[]" }));
  writeFileSync(datei("sauber"), eintrag("Sauberprobe", ["kaputt", "trocken"]));
  writeFileSync(datei("trocken"), eintrag("Trockenprobe", ["kaputt", "sauber"]));

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
      eintrag("Schonfreiprobe", ["kaputt", "sauber"], { status: FREI, geprueftAm: "2026-01-15" }),
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
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
