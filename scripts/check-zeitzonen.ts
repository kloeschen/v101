#!/usr/bin/env -S npx tsx
/**
 * check-zeitzonen.ts — die Konvention als Check, nicht als Merksatz.
 *
 * In dieser Codebasis sind drei Zeitzonenfehler derselben Klasse
 * aufgetreten: JSON-LD-startDate in UTC statt Ortszeit, der Faktenblock in
 * der Server- statt der Site-Zeitzone, die Jahresfacette per getFullYear()
 * auf einem UTC-Runner. Das Muster ist systematisch, also gehört die Regel
 * in ein Skript:
 *
 *   Datumswerte werden nie ohne explizite Zeitzone formatiert oder in
 *   Kalenderteile zerlegt. Erlaubt sind UTC-explizite Methoden
 *   (toISOString, getUTC*, setUTC*) und Intl mit gesetztem timeZone.
 *
 * Bewusste Ausnahmen markiert ein Kommentar `zeitzone-ok` auf derselben
 * Zeile — mit Begründung daneben, sonst ist die Markierung beim nächsten
 * Review fällig.
 *
 *   npx tsx scripts/check-zeitzonen.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import fg from "fast-glob";

interface Befund { datei: string; zeile: number; text: string; grund: string }

/** Lokalzeit-Getter und -Formatierer, die stumm die Prozess-Zeitzone nehmen. */
const VERBOTEN: { muster: RegExp; grund: string }[] = [
  {
    muster: /\.get(FullYear|Month|Date|Day|Hours|Minutes)\(/,
    grund: "liest Kalenderteile in der Prozess-Zeitzone — getUTC* oder Intl mit timeZone verwenden",
  },
  {
    muster: /\.set(FullYear|Month|Date|Hours|Minutes)\(/,
    grund: "schreibt Kalenderteile in der Prozess-Zeitzone — setUTC* verwenden",
  },
  {
    muster: /\.toLocale(Date|Time)?String\(/,
    grund: "formatiert in der Prozess-Zeitzone — Intl.DateTimeFormat mit timeZone verwenden",
  },
];

/** Intl-Aufrufe sind nur mit explizitem timeZone im Optionsobjekt erlaubt. */
const INTL = /new\s+Intl\.DateTimeFormat\s*\(/g;

function pruefeDatei(datei: string): Befund[] {
  const inhalt = readFileSync(datei, "utf8");
  const zeilen = inhalt.split("\n");
  const befunde: Befund[] = [];

  zeilen.forEach((zeile, i) => {
    if (zeile.includes("zeitzone-ok")) return;
    for (const { muster, grund } of VERBOTEN) {
      if (muster.test(zeile)) {
        befunde.push({ datei, zeile: i + 1, text: zeile.trim().slice(0, 90), grund });
      }
    }
  });

  for (const treffer of inhalt.matchAll(INTL)) {
    const start = treffer.index!;
    const zeilennr = inhalt.slice(0, start).split("\n").length;
    const zeilentext = zeilen[zeilennr - 1] ?? "";
    if (zeilentext.includes("zeitzone-ok")) continue;
    // Heuristik: das Optionsobjekt folgt dem Aufruf unmittelbar.
    const umgebung = inhalt.slice(start, start + 400);
    if (!umgebung.includes("timeZone")) {
      befunde.push({
        datei,
        zeile: zeilennr,
        text: zeilentext.trim().slice(0, 90),
        grund: "Intl.DateTimeFormat ohne timeZone formatiert in der Prozess-Zeitzone",
      });
    }
  }

  return befunde;
}

function main() {
  // Toleranz gilt nur den Tests: Dort ist die Prozess-Zeitzone teils
  // Absicht (TZ=UTC-Regressionen). Produktions- und Skriptcode nicht.
  const dateien = fg.sync(["src/**/*.{ts,astro,mjs}", "scripts/**/*.ts"], {
    cwd: process.cwd(),
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "scripts/test-*.ts"],
  });

  const befunde = dateien.flatMap(pruefeDatei);

  for (const b of befunde) {
    console.log(
      `FEHLER  ${path.relative(process.cwd(), b.datei)}:${b.zeile} — ${b.grund}\n        ${b.text}`,
    );
  }
  console.log(`\n${dateien.length} Datei(en) geprüft — ${befunde.length} zonenlose Datumsstelle(n)`);
  process.exit(befunde.length ? 1 : 0);
}

main();
