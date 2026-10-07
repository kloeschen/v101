#!/usr/bin/env -S npx tsx
/**
 * warteschlange.ts — welcher offene Punkt darf ohne Menschen gebaut werden?
 *
 * ANLASS: Ab dem 2026-09-20 läuft täglich ein unbeaufsichtigter Lauf, der
 * sich seine Aufgabe selbst aus der Warteschlange nimmt. Damit ist sie
 * nicht mehr nur Prosa für Menschen, sondern die Eingabe eines Automaten —
 * und eine Eingabe, die ein Automat rät, ist keine.
 *
 * EIN POSTEN, EINE DATEI (seit dem 2026-10-07). Bis dahin standen die
 * Posten als Absätze unter „Als Nächstes" in OFFENE-PUNKTE.md. Gemessen
 * über die Merge-Commits seit dem 2026-09-30 (`git show --remerge-diff`):
 * fünf von sieben Konflikten lagen in genau dieser Datei, weil parallele
 * Läufe benachbarte Zeilen am Kopf desselben Abschnitts änderten — der
 * Suchlauf fügte oben ein, der Tageslauf strich oben einen Posten. Jetzt
 * liegt jeder Posten in `docs/posten/<slug>.md`. Ein Lauf löscht seine
 * eigene Datei, der Suchlauf legt neue an; zwei Läufe berühren nie
 * dieselbe Datei, solange sie nicht denselben Posten bearbeiten — und das
 * verhindert schon `--belegt`.
 *
 * Eine Postendatei:
 *
 *   ---
 *   marke: frei
 *   titel: Pullman City: 1 Termin anlegen (27.12.2026, Rockabilly Night)
 *   angelegt: 2026-10-04
 *   ---
 *
 *   Der Auftrag als Fließtext.
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
 * die schlechtere von beiden (Lektion 19). Also: laut scheitern. Dasselbe
 * gilt für `titel` und `angelegt`.
 *
 * REIHENFOLGE: Bis zum 2026-10-07 galt die Reihenfolge der Absätze, und
 * der Suchlauf fügte oben ein — der neueste Posten stand zuerst. Ein
 * Verzeichnis hat keine Reihenfolge, also trägt sie jetzt `angelegt`:
 * neuester zuerst. Bei gleichem Tag entscheidet das optionale Feld
 * `vorrang` (1 vor 2 vor 3 …, ohne Feld danach), dann der Dateiname. Den
 * `vorrang` gibt es seit dem 2026-10-07 (Entscheidung Markus): Alle
 * Posten eines Suchlaufs tragen denselben Tag, und ohne das Feld ordnete
 * sie der Dateiname statt „nahe Termine vor fernen". Gilt nur innerhalb
 * eines Tages; ein neuerer Posten steht immer vor einem älteren, auch mit
 * schlechterem Vorrang. Das Datum ist ein
 * Kalendertag als Zeichenkette (`JJJJ-MM-TT`) und wird nie als Datum
 * gelesen — deshalb kein YAML-Parser, der daraus einen Zeitpunkt in UTC
 * machte (Regel 1), sondern die Schlüssel von Hand.
 *
 * ZWEITE AUFGABE seit dem 2026-09-21: einen Posten ueberspringen, den ein
 * noch offener Zweig bereits abarbeitet. Anlass war der teuerste Fehlgriff
 * der ersten beiden Laeufe — beide nahmen denselben Posten, weil der PR des
 * Vorabends noch nicht gemergt war und die Warteschlange im Arbeitsbaum
 * unveraendert `frei` sagte. Zwei Pull Requests, dieselbe Band, ein
 * garantierter Konflikt.
 *
 * WARUM GIT-REFS UND NICHT DIE GITHUB-API: Gefragt wird nach **nicht
 * gemergten Zweigen** unter `refs/remotes/`, nicht nach Pull Requests. Das
 * ist tokenfrei (es liest, was `git fetch` geholt hat), breiter im
 * richtigen Sinn (ein gepushter Zweig ohne PR zählt) und enger im richtigen
 * Sinn (ein gemergter Zweig zählt nicht mehr).
 *
 * Erkannt wird die Belegung nicht am Zweignamen, sondern am Inhalt: Ein
 * Posten, der auf der Basis `frei` ist und auf dem Zweig nicht mehr (Datei
 * gelöscht oder auf `mensch` gestellt), wird dort bearbeitet. Verglichen
 * wird über den Dateinamen, nicht über den Titel — ein Lauf, der den Titel
 * umformuliert, bleibt so derselbe Posten.
 *
 *   npx tsx scripts/warteschlange.ts            # alle Posten mit Marke
 *   npx tsx scripts/warteschlange.ts --naechster # der nächste freie Posten (Termine
 *                                                  morgens, Lexikon nachmittags zuerst)
 *   npx tsx scripts/warteschlange.ts --check     # Exitcode 1 bei einer kaputten Datei
 *                                                  oder mehr als zwölf freien Posten
 *   npx tsx scripts/warteschlange.ts --platz     # was der Suchlauf schreiben darf
 *   npx tsx scripts/warteschlange.ts --belegt    # was offene Zweige schon bearbeiten
 *   npx tsx scripts/warteschlange.ts --json
 */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Das Verzeichnis der Warteschlange, relativ zum Projekt (auch für `git show`). */
export const VERZEICHNIS = "docs/posten";

export type Marke = "frei" | "mensch";

export interface Posten {
  marke: Marke;
  titel: string;
  /** Kalendertag `JJJJ-MM-TT`, nur als Zeichenkette verglichen. */
  angelegt: string;
  /** Rang innerhalb desselben Tages, 1 zuerst. Optional. */
  vorrang?: number;
  /** Dateiname ohne Verzeichnis — die Identität des Postens. */
  datei: string;
  /** Titel und Auftrag, so wie der Lauf ihn bekommt. */
  text: string;
}

export interface Mangel {
  datei: string;
  grund: string;
}

export interface Befund {
  /** In der Reihenfolge der Warteschlange: neuester zuerst. */
  posten: Posten[];
  /** Dateien, die wie ein Posten aussehen, aber nicht lesbar sind. */
  maengel: Mangel[];
}

export interface Rohdatei {
  name: string;
  text: string;
}

/** Dateien, die im Verzeichnis liegen dürfen, ohne ein Posten zu sein. */
export const KEIN_POSTEN = (name: string) => !name.endsWith(".md") || name === "README.md" || name.startsWith("_");

const TAG = /^\d{4}-\d{2}-\d{2}$/;

/** Eine Postendatei lesen. Liefert den Posten oder den Grund, warum nicht. */
export function liesDatei(d: Rohdatei): Posten | Mangel {
  const zeilen = d.text.replace(/\r\n/g, "\n").split("\n");
  if (zeilen[0]?.trim() !== "---") return { datei: d.name, grund: "kein Kopf (erste Zeile muss `---` sein)" };
  const ende = zeilen.indexOf("---", 1);
  if (ende < 0) return { datei: d.name, grund: "Kopf ohne schließendes `---`" };
  const kopf: Record<string, string> = {};
  for (const z of zeilen.slice(1, ende)) {
    const m = /^([a-z]+):\s*(.*)$/.exec(z.trim());
    if (!m) continue;
    kopf[m[1]!] = (m[2] ?? "").trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  const marke = kopf.marke;
  if (!marke) return { datei: d.name, grund: "keine Marke (`marke: frei` oder `marke: mensch`)" };
  if (marke !== "frei" && marke !== "mensch") return { datei: d.name, grund: `unbekannte Marke „${marke}" (nur frei oder mensch)` };
  const titel = (kopf.titel ?? "").replace(/\.$/, "");
  if (!titel) return { datei: d.name, grund: "kein Titel (`titel: …`)" };
  const angelegt = kopf.angelegt ?? "";
  if (!TAG.test(angelegt)) return { datei: d.name, grund: `\`angelegt\` fehlt oder ist kein Tag JJJJ-MM-TT („${angelegt}")` };
  let vorrang: number | undefined;
  if (kopf.vorrang !== undefined) {
    if (!/^[1-9]\d*$/.test(kopf.vorrang)) return { datei: d.name, grund: `\`vorrang\` ist keine ganze Zahl ab 1 („${kopf.vorrang}")` };
    vorrang = Number(kopf.vorrang);
  }
  const auftrag = zeilen.slice(ende + 1).join("\n").trim();
  if (!auftrag) return { datei: d.name, grund: "kein Auftragstext unter dem Kopf" };
  return { marke, titel, angelegt, ...(vorrang ? { vorrang } : {}), datei: d.name, text: `**${titel}.**\n${auftrag}` };
}

const istMangel = (x: Posten | Mangel): x is Mangel => "grund" in x;

/** Neuester zuerst; bei gleichem Tag nach `vorrang` (ohne Feld zuletzt), dann nach Dateiname. */
export function reihenfolge(a: Posten, b: Posten): number {
  if (a.angelegt !== b.angelegt) return a.angelegt < b.angelegt ? 1 : -1;
  const va = a.vorrang ?? Infinity;
  const vb = b.vorrang ?? Infinity;
  if (va !== vb) return va < vb ? -1 : 1;
  return a.datei < b.datei ? -1 : a.datei > b.datei ? 1 : 0;
}

/**
 * Die Warteschlange aus fertig gelesenen Dateien. Reine Funktion: kein
 * Dateisystem, kein Git — deshalb im Harnisch prüfbar und für die
 * Belegung auf beliebige Stände anwendbar.
 */
export function lies(dateien: Rohdatei[]): Befund {
  const posten: Posten[] = [];
  const maengel: Mangel[] = [];
  for (const d of dateien) {
    if (KEIN_POSTEN(d.name)) continue;
    const x = liesDatei(d);
    if (istMangel(x)) maengel.push(x);
    else posten.push(x);
  }
  posten.sort(reihenfolge);
  maengel.sort((a, b) => (a.datei < b.datei ? -1 : 1));
  return { posten, maengel };
}

/** Das Verzeichnis im Arbeitsbaum. Fehlt es, ist die Warteschlange leer. */
export function liesVerzeichnis(verzeichnis = path.join(PROJEKT, VERZEICHNIS)): Rohdatei[] {
  let namen: string[];
  try {
    namen = readdirSync(verzeichnis);
  } catch {
    return [];
  }
  return namen
    .filter((n) => !KEIN_POSTEN(n))
    .map((name) => ({ name, text: readFileSync(path.join(verzeichnis, name), "utf8") }));
}

/* ------------------------------------------------------------------ */
/* Belegung durch offene Zweige                                        */
/* ------------------------------------------------------------------ */

export interface Belegung {
  /** Der Titel des Postens, so wie er auf der Basis steht. */
  titel: string;
  /** Seine Datei — darüber wird verglichen. */
  datei: string;
  /** Der Zweig, der ihn bearbeitet. */
  zweig: string;
}

/** Ein offener Zweig: seine Warteschlange, und die an seinem Abzweigpunkt. */
export interface Zweigstand {
  zweig: string;
  /** Die Postendateien an der Spitze des Zweigs. */
  spitze: Rohdatei[];
  /** Dieselben am Abzweigpunkt (merge-base mit der Basis). */
  abzweig: Rohdatei[];
}

/**
 * Welche freien Posten der Basis bearbeitet ein offener Zweig bereits?
 *
 * DIE ENTSCHEIDENDE BEDINGUNG IST DIE ERSTE, und sie hat im ersten Entwurf
 * gefehlt. Ohne sie meldete die Prüfung beim ersten Lauf gegen das echte
 * Repository drei Fehlalarme — der Zweig `pflege/woechentlich` zweigte von
 * einem aelteren Stand ab, auf dem es diese drei Posten schlicht noch nicht
 * gab. „Steht da nicht" und „wurde dort abgearbeitet" sind verschiedene
 * Dinge.
 *
 * Ein Posten zaehlt deshalb nur dann als belegt, wenn er
 *
 *   1. **am Abzweigpunkt des Zweigs `frei` war** — er lag dem Lauf also
 *      ueberhaupt vor —, und
 *   2. **an der Spitze des Zweigs nicht mehr `frei` ist** — der Lauf hat ihn
 *      auf `mensch` gestellt oder seine Datei geloescht.
 *
 * Ein Zweig, der noch vom alten Stand abzweigte (Posten in
 * OFFENE-PUNKTE.md), hat am Abzweigpunkt kein Verzeichnis und belegt
 * nichts. Das ist dieselbe Lücke wie bei jedem Zweig, der hinterherhinkt,
 * und schließt sich mit dem nächsten Merge von main.
 */
export function belegte(basis: Befund, zweige: Zweigstand[]): Belegung[] {
  const belegt: Belegung[] = [];
  const stand = (dateien: Rohdatei[]) => new Map(lies(dateien).posten.map((p) => [p.datei, p]));
  const gelesen = zweige.map((z) => ({ zweig: z.zweig, vorher: stand(z.abzweig), nachher: stand(z.spitze) }));
  for (const posten of basis.posten) {
    if (posten.marke !== "frei") continue;
    for (const z of gelesen) {
      if (z.vorher.get(posten.datei)?.marke !== "frei") continue; // lag dem Zweig nie als frei vor
      const nachher = z.nachher.get(posten.datei);
      if (!nachher || nachher.marke !== "frei") {
        belegt.push({ titel: posten.titel, datei: posten.datei, zweig: z.zweig });
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
 * Prozess durchreicht: Ein `git show` auf einen Stand ohne die Datei ist
 * hier ein erwarteter, abgefangener Fall — aber Git schrieb sein `fatal:`
 * trotzdem in die Ausgabe des Laufs. Erwartete Fehler gehoeren nicht in
 * fremde Ausgaben; das ist dieselbe stdout-Hygiene, die `--json` verlangt.
 */
function git(...args: string[]): string {
  return execFileSync("git", args, {
    cwd: PROJEKT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}

/** Die Postendateien eines Stands (Commit oder Ref). Ohne Verzeichnis: leer. */
export function liesStand(stand: string): Rohdatei[] {
  let namen: string[];
  try {
    namen = git("ls-tree", "--name-only", `${stand}:${VERZEICHNIS}`).split("\n").filter(Boolean);
  } catch {
    return [];
  }
  const dateien: Rohdatei[] = [];
  for (const name of namen) {
    if (KEIN_POSTEN(name)) continue;
    try {
      dateien.push({ name, text: git("show", `${stand}:${VERZEICHNIS}/${name}`) });
    } catch {
      // Unterverzeichnis oder unlesbar: kein Posten.
    }
  }
  return dateien;
}

/**
 * Die nicht gemergten Zweige unter `refs/remotes/<fern>/`, samt ihrer
 * Warteschlange an Spitze und Abzweigpunkt.
 *
 * Kein Netzaufruf: gelesen wird, was der letzte `git fetch` geholt hat.
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
    if (ref === basis || ref === `${fern}/HEAD` || ref === fern) continue;
    try {
      // Gemergt heisst: die Basis enthaelt den Zweig schon. Dann traegt er
      // keine offene Arbeit mehr.
      execFileSync("git", ["merge-base", "--is-ancestor", ref, basis], { cwd: PROJEKT, stdio: "ignore" });
      continue;
    } catch {
      // Nicht gemergt — weiter.
    }
    let abzweigPunkt: string;
    try {
      abzweigPunkt = git("merge-base", ref, basis);
    } catch {
      continue; // keine gemeinsame Geschichte: nichts zu vergleichen
    }
    offen.push({ zweig: ref, spitze: liesStand(ref), abzweig: liesStand(abzweigPunkt) });
  }
  return offen;
}


/* ------------------------------------------------------------------ */
/* Welcher freie Posten zuerst? Termine und Lexikon abwechselnd        */
/* ------------------------------------------------------------------ */

/**
 * Lexikon-Posten erkennt man am Titel: „Lexikon: …" oder „Lexikon, Bündel …".
 */
export const istLexikon = (p: Pick<Posten, "titel">) => /^Lexikon\b/.test(p.titel);

/**
 * Entscheidung Markus, 2026-09-29: Lexikon und Termine abwechselnd, statt
 * Termine immer zuerst. Lexikon-Posten bringen bis zu vier Einträge je Lauf,
 * kommen kaum zurück und hängen nicht an erreichbaren Kalendern; sie
 * standen aber stets hinter den Terminen, weil der Suchlauf neue Posten oben
 * einfügt — eine bloße Umsortierung der Datei hätte der nächste Suchlauf
 * wieder aufgehoben.
 *
 * Abgewechselt wird nach der Tageszeit, nicht nach dem letzten Lauf: Der
 * Morgenlauf (vor 12 Uhr UTC) nimmt zuerst einen Posten, der kein Lexikon
 * ist, der Nachmittagslauf zuerst einen Lexikon-Posten. Das braucht keinen
 * gespeicherten Zustand und ist aus der Uhrzeit nachvollziehbar. Gibt es
 * von der bevorzugten Sorte keinen freien Posten, nimmt der Lauf den
 * obersten der anderen — ein leerer Vorzug darf keinen Lauf verschenken.
 * Innerhalb einer Sorte bleibt die Reihenfolge der Warteschlange
 * (`angelegt`, dann `vorrang`).
 */
export function waehle(offen: Posten[], stundeUtc: number): Posten | undefined {
  const lexikonZuerst = stundeUtc >= 12;
  const bevorzugt = offen.find((p) => istLexikon(p) === lexikonZuerst);
  return bevorzugt ?? offen[0];
}

/* ------------------------------------------------------------------ */
/* Wie viel Platz hat der Suchlauf? Obergrenze und Lexikon-Nachschub   */
/* ------------------------------------------------------------------ */

/**
 * Weg A, Entscheidung Markus vom 2026-09-29: drei Tagesläufe statt zwei,
 * der Suchlauf dreimal die Woche statt zweimal, und er füllt auf höchstens
 * zwölf `frei`-Posten auf statt auf zehn.
 *
 * Bis dahin stand die Zahl nur im Prompt des Suchlaufs und in drei
 * Dokumenten — eine Bitte an ein Modell (Regel 3). Jetzt scheitert
 * `--check` an einer dreizehnten, und der Suchlauf lässt `--check` vor dem
 * PR laufen.
 */
export const OBERGRENZE = 12;

/**
 * Lexikon-Nachschub, dieselbe Entscheidung: Stehen weniger als zwei
 * Lexikon-Posten auf `frei`, zieht der Suchlauf Bündel aus dem
 * „Lexikon-Vorrat" nach oben, bis drei dastehen — nie über die Obergrenze.
 * Ohne das hätte der Nachmittagslauf die Bündel in drei, vier Tagen
 * abgearbeitet und danach wieder nur Termine gebaut; nach oben gezogen
 * hatte bis dahin niemand.
 *
 * Die drei ist eine Grenze fürs Nachziehen, kein Zustand, den `--check`
 * erzwingt: Von Hand dürfen mehr Lexikon-Posten dastehen (am 2026-09-29
 * standen vier). Die Obergrenze von zwölf gilt dagegen immer.
 */
export const LEXIKON_NACHZIEHEN_UNTER = 2;
export const LEXIKON_AUFFUELLEN_AUF = 3;

export interface Platz {
  frei: number;
  lexikon: number;
  /** Wie viele Posten der Suchlauf noch schreiben darf. */
  platz: number;
  /** Wie viele davon Lexikon-Bündel aus dem Vorrat sein sollen. */
  lexikonNachziehen: number;
  /** Wie viele `frei`-Posten über der Obergrenze stehen. */
  ueber: number;
}

export function platz(frei: Pick<Posten, "titel">[]): Platz {
  const lexikon = frei.filter(istLexikon).length;
  const platz = Math.max(0, OBERGRENZE - frei.length);
  const lexikonNachziehen =
    lexikon < LEXIKON_NACHZIEHEN_UNTER ? Math.min(LEXIKON_AUFFUELLEN_AUF - lexikon, platz) : 0;
  return { frei: frei.length, lexikon, platz, lexikonNachziehen, ueber: Math.max(0, frei.length - OBERGRENZE) };
}

/* ------------------------------------------------------------------ */

function main() {
  const argv = process.argv.slice(2);
  const befund = lies(liesVerzeichnis());
  const frei = befund.posten.filter((p) => p.marke === "frei");
  const ort = `${VERZEICHNIS}/`;

  if (argv.includes("--json")) {
    console.log(JSON.stringify(befund, null, 2));
    process.exit(befund.maengel.length ? 1 : 0);
  }

  if (argv.includes("--platz")) {
    const p = platz(frei);
    console.log(
      `${p.frei} frei (davon ${p.lexikon} Lexikon), Obergrenze ${OBERGRENZE}: Platz für ${p.platz}.\n` +
        `Lexikon nachziehen: ${p.lexikonNachziehen}` +
        ` (erst unter ${LEXIKON_NACHZIEHEN_UNTER} freien Lexikon-Posten, dann auf ${LEXIKON_AUFFUELLEN_AUF}).`,
    );
    process.exit(0);
  }

  if (argv.includes("--check")) {
    const { ueber } = platz(frei);
    if (ueber > 0) {
      console.error(
        `${ort}: ${frei.length} \`frei\`-Posten, ${ueber} über der Obergrenze von ${OBERGRENZE} (Weg A, 2026-09-29).`,
      );
      process.exit(1);
    }
    if (befund.maengel.length === 0) {
      console.log(
        `${ort}: ${befund.posten.length} Posten, alle lesbar und markiert ` +
          `(${frei.length}× frei, ${befund.posten.length - frei.length}× mensch).`,
      );
      process.exit(0);
    }
    console.error(`${ort}: Postendateien, die nicht lesbar sind.\n`);
    for (const m of befund.maengel) console.error(`  ${m.datei}: ${m.grund}`);
    console.error(
      "\nJede Datei braucht einen Kopf mit `marke: frei|mensch`, `titel:` und `angelegt: JJJJ-MM-TT`.\n" +
        `Vorlage: ${ort}README.md. Warum es keine Voreinstellung gibt: Kopf von scripts/warteschlange.ts.`,
    );
    process.exit(1);
  }

  // Die Zweigprüfung lässt sich abschalten — für einen Lauf, der bewusst
  // neben einem offenen Zweig arbeiten soll, und für den Testharnisch.
  const zweige = argv.includes("--ohne-zweigpruefung") ? [] : offeneZweige();
  const belegt = belegte(befund, zweige);
  const istBelegt = (datei: string) => belegt.find((b) => b.datei === datei);

  if (argv.includes("--belegt")) {
    if (belegt.length === 0) {
      console.log(`Kein freier Posten ist belegt (${zweige.length} offene(r) Zweig(e) geprüft).`);
      process.exit(0);
    }
    console.log(`${belegt.length} freie(r) Posten wird bereits bearbeitet:`);
    for (const b of belegt) console.log(`  ${b.titel} (${b.datei})\n    ${b.zweig}`);
    process.exit(0);
  }

  if (argv.includes("--naechster")) {
    if (befund.maengel.length) {
      console.error(`Erst die ${befund.maengel.length} unlesbaren Postendateien klären (--check).`);
      process.exit(1);
    }
    const offen = frei.filter((p) => !istBelegt(p.datei));
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
    // `--stunde N` ersetzt die Uhrzeit — für einen Lauf außer der Reihe,
    // der bewusst die andere Sorte nehmen soll, und für den Testharnisch.
    const i = argv.indexOf("--stunde");
    const stunde = i >= 0 ? Number(argv[i + 1]) : new Date().getUTCHours();
    const gewaehlt = waehle(offen, stunde)!;
    console.error(`Vorzug: ${stunde >= 12 ? "Lexikon" : "Termine und Übriges"} (${stunde} Uhr UTC).`);
    console.log(`Datei: ${ort}${gewaehlt.datei} — nach getaner Arbeit löschen (oder auf mensch stellen).\n`);
    console.log(gewaehlt.text);
    process.exit(0);
  }

  for (const p of befund.posten) {
    const b = istBelegt(p.datei);
    console.log(`  ${p.marke === "frei" ? "frei  " : "mensch"}  ${p.angelegt}  ${p.titel}${b ? `   [belegt: ${b.zweig}]` : ""}`);
  }
  for (const m of befund.maengel) {
    console.log(`  UNLESBAR  ${m.datei}: ${m.grund}`);
  }
  console.log(
    `\n${befund.posten.length} Posten in ${ort}, davon ${frei.length - belegt.length} ohne Rückfrage baubar.` +
      (belegt.length ? `  ${belegt.length} bereits auf einem offenen Zweig.` : "") +
      (befund.maengel.length ? `  ${befund.maengel.length} unlesbar.` : ""),
  );
  process.exit(befund.maengel.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
