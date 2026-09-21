#!/usr/bin/env -S npx tsx
/**
 * warteschlange.ts — welcher offene Punkt darf ohne Menschen gebaut werden?
 *
 * ANLASS: Ab dem 2026-09-20 läuft täglich ein unbeaufsichtigter Lauf, der
 * sich seine Aufgabe selbst aus OFFENE-PUNKTE.md nimmt. Damit ist diese
 * Datei nicht mehr nur Prosa für Menschen, sondern die Eingabe eines
 * Automaten — und eine Eingabe, die ein Automat rät, ist keine.
 *
 * Deshalb trägt jeder Posten unter „Als Nächstes" eine Marke:
 *
 *   `frei`    — darf ein Lauf ohne Rückfrage bauen
 *   `mensch`  — gehört dem Menschen: Ermessen, Zahlen, Semantik, oder der
 *               Posten liegt hinter einer Sperre (`.claude/`, Schema)
 *
 * WARUM EIN FEHLENDER MARKER EIN FEHLER IST und nicht stillschweigend
 * `mensch` bedeutet: Beide naheliegenden Voreinstellungen sind falsch.
 * „Ohne Marke = frei" lässt einen unmarkierten Ermessensposten in den
 * Automaten laufen. „Ohne Marke = mensch" lässt ihn stumm aus der
 * Warteschlange fallen — der Lauf meldet „nichts zu tun", obwohl etwas da
 * ist, und niemand merkt es. Eine Voreinstellung, die man nicht sieht, ist
 * die schlechtere von beiden (Lektion 19). Also: laut scheitern.
 *
 * Geprüft wird nur der Abschnitt „Als Nächstes". „Vor dem Go-Live" und
 * „Später, mit Bedingung" sind Rückstau, keine Warteschlange — dort wäre
 * eine Marke eine Behauptung über einen Zeitpunkt, den niemand kennt.
 *
 * ZWEITE AUFGABE seit dem 2026-09-21: einen Posten ueberspringen, den ein
 * noch offener Zweig bereits abarbeitet. Anlass war der teuerste Fehlgriff
 * der ersten beiden Laeufe — beide nahmen denselben Posten, weil der PR des
 * Vorabends noch nicht gemergt war und OFFENE-PUNKTE.md im Arbeitsbaum
 * unveraendert `frei` sagte. Zwei Pull Requests, dieselbe Band, ein
 * garantierter Konflikt.
 *
 * WARUM GIT-REFS UND NICHT DIE GITHUB-API: Die Entscheidung lautete, dass
 * `--naechster` die offenen Pull Requests abfragt. Gebaut ist etwas
 * Aequivalentes, das weniger kostet — und der Unterschied gehoert benannt.
 * Gefragt wird nach **nicht gemergten Zweigen** unter `refs/remotes/`, nicht
 * nach Pull Requests. Das ist:
 *
 *   - tokenfrei. Kein `GITHUB_TOKEN`, kein Netzaufruf im Skript selbst; es
 *     liest, was `git fetch` ohnehin schon geholt hat. Damit bleibt die
 *     ganze Datei offline lauffaehig, nicht nur `--check` — der Einwand,
 *     der gegen diese Variante sprach, entfaellt ganz;
 *   - breiter im richtigen Sinn. Ein Zweig, der Arbeit traegt, zaehlt auch
 *     dann, wenn noch gar kein Pull Request offen ist. Genau dieses Fenster
 *     — gepusht, PR noch nicht da — war der Zustand am 2026-09-20 abends;
 *   - enger im richtigen Sinn. Ein gemergter Zweig zaehlt nicht mehr, auch
 *     wenn er als Ref noch herumliegt.
 *
 * Erkannt wird die Belegung nicht am Zweignamen, sondern am Inhalt: Ein
 * Posten, der auf der Basis `frei` ist und auf dem Zweig nicht mehr, wird
 * dort bearbeitet. Das ist derselbe Parser wie oben, auf zwei Fassungen
 * derselben Datei angewandt.
 *
 *   npx tsx scripts/warteschlange.ts            # alle Posten mit Marke
 *   npx tsx scripts/warteschlange.ts --naechster # der oberste freie Posten
 *   npx tsx scripts/warteschlange.ts --check     # Exitcode 1 bei fehlender Marke
 *   npx tsx scripts/warteschlange.ts --belegt    # was offene Zweige schon bearbeiten
 *   npx tsx scripts/warteschlange.ts --json
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export type Marke = "frei" | "mensch";

export interface Posten {
  marke: Marke;
  titel: string;
  /** Der vollständige Absatz, ohne Marke — das ist der Auftrag. */
  text: string;
  /** 1-basiert, für Fehlermeldungen. */
  zeile: number;
}

export interface Befund {
  posten: Posten[];
  /** Absätze, die wie ein Posten aussehen, aber keine Marke tragen. */
  ohneMarke: { titel: string; zeile: number }[];
}

const ABSCHNITT = "## Als Nächstes";
/** `frei` **Titel.** … — die Marke steht am Zeilenanfang, davor nichts. */
const MIT_MARKE = /^`(frei|mensch)`\s+\*\*(.+?)\*\*/;
/** Ein Absatz, der mit Fettschrift beginnt, ist ein Posten ohne Marke. */
const OHNE_MARKE = /^\*\*(.+?)\*\*/;
/** Der Anfang eines Titels, dessen schließende `**` noch fehlen. */
const TITEL_BEGINN = /^(?:`(?:frei|mensch)`\s+)?\*\*/;

/**
 * Umgebrochene Titel zu einer logischen Zeile zusammenziehen.
 *
 * DER FEHLER, DEN DAS BEHEBT, war der schlimmste, den diese Datei haben
 * kann: Ein Posten, dessen fetter Titel über zwei Zeilen umbricht — bei 79
 * Zeichen Zeilenlänge der Normalfall für einen langen Titel —, fiel
 * **stumm** aus der Liste. Weder `MIT_MARKE` noch `OHNE_MARKE` griffen, denn
 * die Folgezeile beginnt nicht mit `**`. `--check` schlug nicht an, weil der
 * Posten gar nicht erst gesehen wurde. Ein freier Posten, den niemand sieht,
 * wird nie gebaut; ein `mensch`-Posten, den niemand sieht, gilt als
 * erledigt. Genau der Zustand, den der Kopf dieser Datei ausschließen
 * wollte.
 *
 * Die Zeilennummer bleibt die der ERSTEN Zeile — Fehlermeldungen sollen
 * dorthin zeigen, wo der Posten anfängt.
 */
function logischeZeilen(zeilen: string[]): { inhalt: string; zeile: number }[] {
  const aus: { inhalt: string; zeile: number }[] = [];
  for (let i = 0; i < zeilen.length; i++) {
    const zeile = zeilen[i] ?? "";
    // Nur ein angefangener Titel wird fortgesetzt — und nur solange die
    // schließenden `**` auf derselben Zeile fehlen.
    if (TITEL_BEGINN.test(zeile) && !MIT_MARKE.test(zeile) && !OHNE_MARKE.test(zeile)) {
      let inhalt = zeile;
      let j = i + 1;
      // Eine Leerzeile beendet den Absatz: Was dahinter steht, gehört nicht
      // mehr zum Titel, auch wenn irgendwo später `**` käme.
      while (j < zeilen.length && (zeilen[j] ?? "").trim() !== "" && !inhalt.includes("**", inhalt.indexOf("**") + 2)) {
        inhalt += " " + (zeilen[j] ?? "").trim();
        j++;
      }
      aus.push({ inhalt, zeile: i + 1 });
      i = j - 1;
      continue;
    }
    aus.push({ inhalt: zeile, zeile: i + 1 });
  }
  return aus;
}

export function lies(text: string): Befund {
  const zeilen = text.split("\n");
  const start = zeilen.findIndex((z) => z.trim() === ABSCHNITT);
  if (start < 0) return { posten: [], ohneMarke: [] };

  // Bis zur nächsten H2 — der Abschnitt endet dort, nicht am Dateiende.
  let ende = zeilen.length;
  for (let i = start + 1; i < zeilen.length; i++) {
    if (zeilen[i].startsWith("## ")) { ende = i; break; }
  }

  const posten: Posten[] = [];
  const ohneMarke: { titel: string; zeile: number }[] = [];
  let offen: Posten | null = null;

  // Gelesen wird über logische Zeilen: Ein Titel, der umbricht, ist eine.
  const log = logischeZeilen(zeilen.slice(start + 1, ende));

  for (let i = 0; i < log.length; i++) {
    const inhalt = log[i]?.inhalt ?? "";
    const nummer = start + 1 + (log[i]?.zeile ?? 0);
    const m = MIT_MARKE.exec(inhalt);
    if (m) {
      if (offen) posten.push(offen);
      offen = {
        marke: m[1] as Marke,
        titel: (m[2] ?? "").replace(/\.$/, ""),
        text: inhalt.replace(/^`(frei|mensch)`\s+/, ""),
        zeile: nummer,
      };
      continue;
    }
    const o = OHNE_MARKE.exec(inhalt);
    if (o) {
      // Nur ein Absatzanfang zählt: Fettschrift mitten im Text eines
      // laufenden Postens ist Auszeichnung, kein neuer Posten.
      const vorher = log[i - 1]?.inhalt ?? "";
      if (vorher.trim() === "") {
        if (offen) { posten.push(offen); offen = null; }
        ohneMarke.push({ titel: (o[1] ?? "").replace(/\.$/, ""), zeile: nummer });
        continue;
      }
    }
    if (offen) offen.text += "\n" + inhalt;
  }
  if (offen) posten.push(offen);
  return { posten, ohneMarke };
}

/* ------------------------------------------------------------------ */
/* Belegung durch offene Zweige                                        */
/* ------------------------------------------------------------------ */

export interface Belegung {
  /** Der Titel des Postens, so wie er auf der Basis steht. */
  titel: string;
  /** Der Zweig, der ihn bearbeitet. */
  zweig: string;
}

/** Ein offener Zweig: sein Stand, und der Stand an seinem Abzweigpunkt. */
export interface Zweigstand {
  zweig: string;
  /** OFFENE-PUNKTE.md an der Spitze des Zweigs. */
  text: string;
  /** Dieselbe Datei am Abzweigpunkt (merge-base mit der Basis). */
  abzweig: string;
}

/**
 * Welche freien Posten der Basis bearbeitet ein offener Zweig bereits?
 *
 * Reine Funktion: Sie bekommt fertig gelesene Texte und ruft kein Git auf.
 * Genau deshalb ist sie im Harnisch pruefbar, ohne ein Repository zu bauen.
 *
 * DIE ENTSCHEIDENDE BEDINGUNG IST DIE ZWEITE, und sie hat gefehlt. Der erste
 * Entwurf pruefte nur: „auf der Basis `frei`, auf dem Zweig nicht mehr".
 * Beim ersten Lauf gegen das echte Repository meldete er prompt drei
 * Fehlalarme — der Zweig `pflege/woechentlich` zweigte von einem aelteren
 * Stand ab, auf dem es diese drei Posten schlicht noch nicht gab. „Steht da
 * nicht" und „wurde dort abgearbeitet" sind verschiedene Dinge, und ein
 * Zweig, der hinterherhinkt, sieht ohne diese Unterscheidung aus wie einer,
 * der arbeitet.
 *
 * Deshalb zaehlt ein Posten nur dann als belegt, wenn er
 *
 *   1. **am Abzweigpunkt des Zweigs `frei` war** — er lag dem Lauf also
 *      ueberhaupt vor —, und
 *   2. **an der Spitze des Zweigs nicht mehr `frei` ist** — der Lauf hat ihn
 *      auf `mensch` gestellt oder als erledigt entfernt.
 *
 * Der Vergleich laeuft ueber den Titel, nicht ueber die Zeilennummer: Ein
 * Zweig, der weiter oben etwas einfuegt, verschiebt sonst alles darunter.
 */
export function belegte(basis: Befund, zweige: Zweigstand[]): Belegung[] {
  const belegt: Belegung[] = [];
  for (const posten of basis.posten) {
    if (posten.marke !== "frei") continue;
    for (const z of zweige) {
      const vorher = lies(z.abzweig).posten.find((p) => p.titel === posten.titel);
      if (vorher?.marke !== "frei") continue; // lag dem Zweig nie als frei vor
      const nachher = lies(z.text).posten.find((p) => p.titel === posten.titel);
      if (!nachher || nachher.marke !== "frei") {
        belegt.push({ titel: posten.titel, zweig: z.zweig });
        break;
      }
    }
  }
  return belegt;
}

/**
 * Git aufrufen und nur stdout zurueckgeben.
 *
 * `stdio` ist ausgeschrieben, weil der Vorgabewert stderr an den eigenen
 * Prozess durchreicht: Ein `git show` auf einen Zweig ohne die Datei ist
 * hier ein erwarteter, abgefangener Fall — aber Git schrieb sein `fatal:`
 * trotzdem in die Ausgabe des Laufs. Aufgefallen beim Mutationsbeleg zur
 * Zweigauswahl. Erwartete Fehler gehoeren nicht in fremde Ausgaben; das ist
 * dieselbe stdout-Hygiene, die `--json` schon verlangt.
 */
function git(...args: string[]): string {
  return execFileSync("git", args, {
    cwd: PROJEKT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

/**
 * Die nicht gemergten Zweige unter `refs/remotes/<fern>/`, samt ihrer
 * Fassung von OFFENE-PUNKTE.md.
 *
 * Kein Netzaufruf: gelesen wird, was der letzte `git fetch` geholt hat. Wer
 * den aktuellen Stand braucht, holt ihn vorher — das ist die Entscheidung
 * des Aufrufers und nicht die dieses Skripts, damit die Pruefkette offline
 * bleibt.
 *
 * Faellt Git aus (kein Repository, keine Refs), ist das Ergebnis leer und
 * nicht etwa ein Abbruch: Die Belegungspruefung ist eine Verbesserung, kein
 * Tor. Ohne sie arbeitet der Lauf wie vorher.
 */
export function offeneZweige(basis = "origin/main", fern = "origin"): Zweigstand[] {
  let refs: string[];
  try {
    refs = git("for-each-ref", "--format=%(refname:short)", `refs/remotes/${fern}/`)
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
  const offen: Zweigstand[] = [];
  for (const ref of refs) {
    if (ref === basis || ref === `${fern}/HEAD`) continue;
    let abzweigPunkt: string;
    try {
      // Gemergt heisst: die Basis enthaelt den Zweig schon. Dann traegt er
      // keine offene Arbeit mehr.
      execFileSync("git", ["merge-base", "--is-ancestor", ref, basis], { cwd: PROJEKT, stdio: "ignore" });
      continue;
    } catch {
      // Nicht gemergt — weiter.
    }
    try {
      abzweigPunkt = git("merge-base", ref, basis);
    } catch {
      continue; // keine gemeinsame Geschichte: nichts zu vergleichen
    }
    try {
      offen.push({
        zweig: ref,
        text: git("show", `${ref}:OFFENE-PUNKTE.md`),
        abzweig: git("show", `${abzweigPunkt}:OFFENE-PUNKTE.md`),
      });
    } catch {
      // Zweig oder Abzweigpunkt ohne die Datei: kein Posten belegt.
    }
  }
  return offen;
}

/* ------------------------------------------------------------------ */

function main() {
  const argv = process.argv.slice(2);
  const datei = path.join(PROJEKT, "OFFENE-PUNKTE.md");
  const befund = lies(readFileSync(datei, "utf8"));
  const frei = befund.posten.filter((p) => p.marke === "frei");

  if (argv.includes("--json")) {
    console.log(JSON.stringify(befund, null, 2));
    process.exit(befund.ohneMarke.length ? 1 : 0);
  }

  if (argv.includes("--check")) {
    if (befund.ohneMarke.length === 0) {
      console.log(
        `OFFENE-PUNKTE.md: ${befund.posten.length} Posten unter 'Als Nächstes', ` +
          `alle markiert (${frei.length}× frei, ${befund.posten.length - frei.length}× mensch).`,
      );
      process.exit(0);
    }
    console.error("OFFENE-PUNKTE.md: Posten ohne Marke unter 'Als Nächstes'.\n");
    for (const o of befund.ohneMarke) {
      console.error(`  Zeile ${o.zeile}: ${o.titel}`);
    }
    console.error(
      "\nJeder Posten dort braucht `frei` oder `mensch` am Zeilenanfang.\n" +
        "Siehe den Kopf von scripts/warteschlange.ts, warum es keine Voreinstellung gibt.",
    );
    process.exit(1);
  }

  // Die Zweigprüfung lässt sich abschalten — für einen Lauf, der bewusst
  // neben einem offenen Zweig arbeiten soll, und für den Testharnisch.
  const zweige = argv.includes("--ohne-zweigpruefung") ? [] : offeneZweige();
  const belegt = belegte(befund, zweige);
  const istBelegt = (titel: string) => belegt.find((b) => b.titel === titel);

  if (argv.includes("--belegt")) {
    if (belegt.length === 0) {
      console.log(`Kein freier Posten ist belegt (${zweige.length} offene(r) Zweig(e) geprüft).`);
      process.exit(0);
    }
    console.log(`${belegt.length} freie(r) Posten wird bereits bearbeitet:`);
    for (const b of belegt) console.log(`  ${b.titel}\n    ${b.zweig}`);
    process.exit(0);
  }

  if (argv.includes("--naechster")) {
    if (befund.ohneMarke.length) {
      console.error(`Erst die ${befund.ohneMarke.length} unmarkierten Posten klären (--check).`);
      process.exit(1);
    }
    const offen = frei.filter((p) => !istBelegt(p.titel));
    if (offen.length === 0) {
      const grund =
        belegt.length > 0
          ? `Kein freier Posten übrig — ${belegt.length} wird bereits auf einem offenen Zweig bearbeitet ` +
            `(${belegt.map((b) => b.zweig).join(", ")}).`
          : "Kein freier Posten.";
      console.log(`${grund} Der Lauf nimmt stattdessen den Stale-Bericht.`);
      process.exit(0);
    }
    for (const b of belegt) {
      console.error(`Übersprungen, wird schon bearbeitet (${b.zweig}): ${b.titel}`);
    }
    console.log(offen[0].text);
    process.exit(0);
  }

  for (const p of befund.posten) {
    const b = istBelegt(p.titel);
    console.log(`  ${p.marke === "frei" ? "frei  " : "mensch"}  ${p.titel}${b ? `   [belegt: ${b.zweig}]` : ""}`);
  }
  for (const o of befund.ohneMarke) {
    console.log(`  OHNE MARKE (Zeile ${o.zeile})  ${o.titel}`);
  }
  console.log(
    `\n${befund.posten.length} Posten, davon ${frei.length - belegt.length} ohne Rückfrage baubar.` +
      (belegt.length ? `  ${belegt.length} bereits auf einem offenen Zweig.` : "") +
      (befund.ohneMarke.length ? `  ${befund.ohneMarke.length} ohne Marke.` : ""),
  );
  process.exit(befund.ohneMarke.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
