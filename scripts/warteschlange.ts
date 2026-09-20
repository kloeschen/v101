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
 *   npx tsx scripts/warteschlange.ts            # alle Posten mit Marke
 *   npx tsx scripts/warteschlange.ts --naechster # der oberste freie Posten
 *   npx tsx scripts/warteschlange.ts --check     # Exitcode 1 bei fehlender Marke
 *   npx tsx scripts/warteschlange.ts --json
 */

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

  for (let i = start + 1; i < ende; i++) {
    const zeile = zeilen[i];
    const m = MIT_MARKE.exec(zeile);
    if (m) {
      if (offen) posten.push(offen);
      offen = {
        marke: m[1] as Marke,
        titel: m[2].replace(/\.$/, ""),
        text: zeile.replace(/^`(frei|mensch)`\s+/, ""),
        zeile: i + 1,
      };
      continue;
    }
    const o = OHNE_MARKE.exec(zeile);
    if (o) {
      // Nur ein Absatzanfang zählt: Fettschrift mitten im Text eines
      // laufenden Postens ist Auszeichnung, kein neuer Posten.
      const vorher = zeilen[i - 1] ?? "";
      if (vorher.trim() === "") {
        if (offen) { posten.push(offen); offen = null; }
        ohneMarke.push({ titel: o[1].replace(/\.$/, ""), zeile: i + 1 });
        continue;
      }
    }
    if (offen) offen.text += "\n" + zeile;
  }
  if (offen) posten.push(offen);
  return { posten, ohneMarke };
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

  if (argv.includes("--naechster")) {
    if (befund.ohneMarke.length) {
      console.error(`Erst die ${befund.ohneMarke.length} unmarkierten Posten klären (--check).`);
      process.exit(1);
    }
    if (frei.length === 0) {
      console.log("Kein freier Posten. Der Lauf nimmt stattdessen den Stale-Bericht.");
      process.exit(0);
    }
    console.log(frei[0].text);
    process.exit(0);
  }

  for (const p of befund.posten) {
    console.log(`  ${p.marke === "frei" ? "frei  " : "mensch"}  ${p.titel}`);
  }
  for (const o of befund.ohneMarke) {
    console.log(`  OHNE MARKE (Zeile ${o.zeile})  ${o.titel}`);
  }
  console.log(
    `\n${befund.posten.length} Posten, davon ${frei.length} ohne Rückfrage baubar.` +
      (befund.ohneMarke.length ? `  ${befund.ohneMarke.length} ohne Marke.` : ""),
  );
  process.exit(befund.ohneMarke.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
