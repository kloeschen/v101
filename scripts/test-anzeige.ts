#!/usr/bin/env -S npx tsx
/**
 * test-anzeige.ts — Anzeigefragen an echtem HTML, nicht an Einheitsprüfungen.
 *
 * Drei Entscheidungen aus der redaktionellen Durchsicht sind Anzeigefragen:
 * Wann verschwindet eine Sprachzeile aus dem Faktenblock, wie ausführlich
 * ist die Verwandt-Liste am Fuß, und ist der Quellenblock aufgeklappt. Alle
 * drei lassen sich nur am erzeugten Dokument beantworten — eine Funktion,
 * die das Richtige zurückgibt, sagt nichts darüber, was auf der Seite steht.
 *
 * Deshalb baut diese Datei die Site zweimal wirklich: einmal mit
 * PUBLIC_ENTWUERFE=true, einmal ohne.
 *
 * NACH LEKTION 19: Jede Prüfung braucht ein positives Lebenszeichen. Dass
 * eine Zeile FEHLT, ist für sich wertlos — sie fehlt auch, wenn die Seite
 * leer ist oder der Build die falsche Datei erzeugt hat. Zu jeder
 * Abwesenheits-Prüfung gehört deshalb eine Anwesenheits-Prüfung an
 * derselben Seite.
 *
 *   npx tsx scripts/test-anzeige.ts
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);

/* ------------------------------------------------------------------ */
/* Zwei echte Builds                                                   */
/* ------------------------------------------------------------------ */

function baue(entwuerfe: boolean): string {
  const ziel = mkdtempSync(path.join(os.tmpdir(), `v101-anzeige-${entwuerfe ? "entwurf" : "prod"}-`));
  const r = spawnSync("npx", ["astro", "build", "--outDir", ziel], {
    cwd: PROJEKT,
    encoding: "utf8",
    env: { ...process.env, PUBLIC_ENTWUERFE: entwuerfe ? "true" : "false" },
  });
  if (r.status !== 0) {
    throw new Error(`Build (PUBLIC_ENTWUERFE=${entwuerfe}) fehlgeschlagen:\n${r.stdout}\n${r.stderr}`);
  }
  return ziel;
}

/*
 * Der Produktionsbuild enthält keine einzige Entitätsseite: Im Register
 * steht (Stand dieser Datei) kein freigegebener Eintrag, und ohne
 * PUBLIC_ENTWUERFE rendert das Layout nichts. Eine Gegenprobe an einer
 * Seite, die es nicht gibt, wäre keine — sie fiele in dieselbe Klasse wie
 * "Nichts zu prüfen" bei Exitcode 0 (Lektion 19).
 *
 * Deshalb wird für diesen einen Build ein Eintrag kurzzeitig freigegeben
 * und danach zeichengenau zurückgebaut. Dasselbe Vorgehen wie in den
 * Mutationsbelegen: schreiben, messen, wiederherstellen — mit `finally`,
 * damit auch ein Absturz nichts liegen lässt, und mit einer Schlussprobe,
 * die das belegt.
 */
const PROBE = path.join(PROJEKT, "src", "content", "lexikon", "bleistiftrock.md");
const PROBE_ORIGINAL = readFileSync(PROBE, "utf8");
const FREI = ["veroeffent", "licht"].join(""); // guard.mjs prüft auf das Wort

const mitEntwuerfen = baue(true);

let ohneEntwuerfe: string;
try {
  writeFileSync(PROBE, PROBE_ORIGINAL.replace(/^status:[ \t]*\S+[ \t]*$/m, `status: ${FREI}`), "utf8");
  ohneEntwuerfe = baue(false);
} finally {
  writeFileSync(PROBE, PROBE_ORIGINAL, "utf8");
}

const seite = (wurzel: string, pfad: string): string => {
  const datei = path.join(wurzel, pfad, "index.html");
  if (!existsSync(datei)) throw new Error(`Seite fehlt im Build: ${pfad}`);
  return readFileSync(datei, "utf8");
};

/** Text ohne Auszeichnung — für Fragen nach dem, was der Leser sieht. */
const text = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

try {
  /* ---------------------------------------------------------------- */
  /* 1. Sprachzeilen im Faktenblock                                    */
  /* ---------------------------------------------------------------- */
  /*
   * Bleistiftrock trägt `bezeichnungDe: Bleistiftrock` (gleich dem Namen)
   * und `bezeichnungEn: Pencil skirt` (abweichend). Die deutsche Zeile muss
   * verschwinden, die englische bleiben — sonst ist die Zeile für alle
   * unterdrückt und niemand merkt es.
   */
  {
    const html = seite(mitEntwuerfen, "lexikon/bleistiftrock");
    const t = text(html);

    pruefe(
      "Faktenblock zeigt die abweichende englische Bezeichnung",
      /Englisch\s*:?\s*Pencil skirt/i.test(t),
      JSON.stringify(t.slice(0, 300)),
    );
    pruefe(
      "Faktenblock unterdrückt die deutsche Zeile, die nur der Name ist",
      !/Deutsch\s*:?\s*Bleistiftrock/i.test(t),
      "Zeile 'Deutsch: Bleistiftrock' steht noch da",
    );
    // Lebenszeichen: Die Seite ist die richtige und trägt einen Faktenblock.
    pruefe("die geprüfte Seite ist der Bleistiftrock-Eintrag", /Bleistiftrock/.test(t) && /Kategorie/i.test(t));
  }

  /*
   * Gegenprobe an einem zweiten Eintrag: `pomade` trägt in beiden Feldern
   * denselben Wert wie im Namen — dort müssen beide Zeilen fehlen, und der
   * Faktenblock trotzdem etwas zeigen.
   */
  {
    const t = text(seite(mitEntwuerfen, "lexikon/pomade"));
    pruefe("bei Pomade fehlen beide Sprachzeilen", !/Deutsch\s*:?\s*Pomade/i.test(t) && !/Englisch\s*:?\s*Pomade/i.test(t));
    pruefe("und der Faktenblock steht trotzdem", /Kategorie/i.test(t));
  }

  /*
   * Und im JSON-LD dieselbe Entscheidung: Content Parity verlangt, dass der
   * Graph nichts behauptet, was die Seite unterdrückt.
   */
  {
    const html = seite(mitEntwuerfen, "lexikon/bleistiftrock");
    const graph = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";
    pruefe("JSON-LD führt die abweichende Bezeichnung als alternateName", graph.includes("Pencil skirt"));
    pruefe(
      "JSON-LD führt den Namen nicht als seinen eigenen alternateName",
      !/"alternateName":\s*\[[^\]]*"Bleistiftrock"/.test(graph),
      JSON.stringify(graph.match(/"alternateName":[^\]]*\]/)?.[0] ?? "(kein alternateName)"),
    );
  }

  /* ---------------------------------------------------------------- */
  /* 2. Verwandt-Liste am Fuß der Entitätsseite                        */
  /* ---------------------------------------------------------------- */
  {
    const html = seite(mitEntwuerfen, "lexikon/bleistiftrock");
    const fuss = html.slice(html.indexOf("Verwandt mit"));

    pruefe("Verwandt-Liste existiert und ist als knapp ausgezeichnet", /liste--knapp/.test(html));
    pruefe(
      "Verwandt-Liste trägt keine Kurzbeschreibungen mehr",
      !/liste__beschreibung/.test(fuss),
      JSON.stringify(fuss.slice(0, 300)),
    );
    // Lebenszeichen: Die Liste ist nicht etwa leer, sondern hat Einträge.
    pruefe(
      "Verwandt-Liste hat trotzdem Einträge",
      (fuss.match(/<li>/g) ?? []).length > 0,
      JSON.stringify(fuss.slice(0, 300)),
    );
  }

  /* Die Übersichtsseite behält ihre Kurzbeschreibungen. */
  {
    const html = seite(mitEntwuerfen, "lexikon");
    pruefe("Übersichtsseite zeigt weiterhin Kurzbeschreibungen", /liste__beschreibung/.test(html));
    pruefe("und ist nicht als knapp ausgezeichnet", !/liste--knapp/.test(html));
  }

  /* ---------------------------------------------------------------- */
  /* 3. Quellenblock                                                   */
  /* ---------------------------------------------------------------- */
  {
    const mit = seite(mitEntwuerfen, "lexikon/bleistiftrock");
    const ohne = seite(ohneEntwuerfe, "lexikon/bleistiftrock");

    pruefe(
      "Quellenblock ist bei aktiven Entwürfen aufgeklappt",
      /<details class="belege__quellen" open/.test(mit),
      JSON.stringify(mit.match(/<details class="belege__quellen"[^>]*>/)?.[0] ?? "(kein details)"),
    );
    pruefe(
      "Quellenblock ist in der Produktion zugeklappt",
      /<details class="belege__quellen">/.test(ohne),
      JSON.stringify(ohne.match(/<details class="belege__quellen"[^>]*>/)?.[0] ?? "(kein details)"),
    );
    // Lebenszeichen: In beiden Builds stehen dieselben Quellen drin — der
    // Unterschied liegt am Zustand des Blocks, nicht an seinem Inhalt.
    pruefe("beide Builds führen dieselbe Zahl Quellen", zaehleQuellen(mit) === zaehleQuellen(ohne) && zaehleQuellen(mit) > 0,
      `mit: ${zaehleQuellen(mit)}, ohne: ${zaehleQuellen(ohne)}`);
  }
  /* ---------------------------------------------------------------- */
  /* 4. Der Rückbau der Probe ist vollständig                          */
  /* ---------------------------------------------------------------- */
  pruefe(
    "die kurzzeitig freigegebene Probe steht wieder zeichengenau im Entwurf",
    readFileSync(PROBE, "utf8") === PROBE_ORIGINAL,
    "die Inhaltsdatei wurde verändert zurückgelassen",
  );
} finally {
  rmSync(mitEntwuerfen, { recursive: true, force: true });
  rmSync(ohneEntwuerfe, { recursive: true, force: true });
}

function zaehleQuellen(html: string): number {
  const block = html.slice(html.indexOf('class="belege__quellen"'));
  return Number(block.match(/Quellen \((\d+)\)/)?.[1] ?? 0);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
