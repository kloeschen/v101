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
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
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
 * FRÜHER STAND HIER EIN BEHELF, und er ist am 2026-09-11 entfallen.
 *
 * Solange im Register kein einziger Eintrag freigegeben war, enthielt der
 * Produktionsbuild keine Entitätsseite — eine Gegenprobe an einer Seite, die
 * es nicht gibt, wäre keine gewesen (Lektion 19). Diese Datei hat deshalb
 * für den einen Build einen Eintrag kurzzeitig freigegeben und danach
 * zeichengenau zurückgebaut.
 *
 * Seit der Freigabe vom 2026-09-10 ist das Register vollständig
 * freigegeben. Der Behelf ist damit überflüssig — und mit ihm die einzige
 * Stelle im Repo, die den Statusschutz umging, wenn auch nur für die Dauer
 * eines Builds. Was ohne Umweg geht, geht ohne Umweg.
 *
 * Das Lebenszeichen bleibt: Unten wird geprüft, dass der Produktionsbuild
 * die Probeseite tatsächlich enthält. Wäre das Register wieder leer, fiele
 * diese Behauptung — und nicht stillschweigend die Gegenprobe.
 */
const mitEntwuerfen = baue(true);
const ohneEntwuerfe = baue(false);

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
  /* 4. Startseite, Navigation und leere Übersichten                   */
  /* ---------------------------------------------------------------- */
  /*
   * Die Startseite war bis zum 2026-09-11 ein Satz und eine Zahl, ohne
   * einen einzigen Link außer der Navigation — die schwächste Seite der
   * Site und zugleich die, auf der die meisten landen.
   */
  {
    const html = seite(ohneEntwuerfe, "");
    const t = text(html);
    const linkZiele = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);

    // Lebenszeichen zuerst: Ohne diese Zeile wären die folgenden
    // Behauptungen auch für eine kaputte oder leere Seite wahr.
    pruefe("die Startseite führt die Rubrik der kommenden Termine", /Als Nächstes/.test(t), t.slice(0, 200));
    pruefe(
      "die Startseite verlinkt einzelne Termine",
      linkZiele.filter((z) => /^\/events\/[a-z0-9-]+\/$/.test(z)).length >= 1,
      linkZiele.join(" "),
    );
    pruefe(
      "die Termine tragen ihr Datum",
      /\d{2}\.\d{2}\.\d{4}/.test(t),
      t.slice(0, 400),
    );
    // Die Gegenprobe zur alten Fassung: die reine Zählung ist weg.
    pruefe("die Startseite ist keine bloße Zählung mehr", !/Aktuell \d+ Einträge im Register/.test(t), t.slice(0, 300));
    pruefe(
      "die Startseite verlinkt die Sammlungen mit Inhalt",
      linkZiele.includes("/events/") && linkZiele.includes("/lexikon/"),
      linkZiele.join(" "),
    );
    // Und die entscheidende Abwesenheit, mit dem Lebenszeichen daneben:
    // Locations hat Einträge und steht drin, Bands hat keine.
    pruefe("eine Sammlung ohne Eintrag steht nicht in der Navigation", !linkZiele.includes("/bands/"), linkZiele.join(" "));
    pruefe("eine Sammlung mit Einträgen schon", linkZiele.includes("/locations/"), linkZiele.join(" "));
  }

  {
    // Die leere Übersicht bleibt erreichbar und sagt, was sie ist --
    // statt "Das Register enthält 0 Einträge in der Kategorie Bands".
    const t = text(seite(ohneEntwuerfe, "bands"));
    pruefe("die leere Übersicht existiert weiterhin", /Bands/.test(t), t.slice(0, 200));
    pruefe("sie sagt, was die Sammlung ist", /Bands und Solokünstler/.test(t), t.slice(0, 300));
    pruefe("sie zählt nicht null", !/0 Einträge/.test(t) && /Noch kein Eintrag/.test(t), t.slice(0, 300));
    // Gegenprobe an einer gefüllten Übersicht im selben Build.
    const tl = text(seite(ohneEntwuerfe, "lexikon"));
    pruefe("die gefüllte Übersicht nennt ihre Zahl", /Derzeit \d+ Einträge/.test(tl), tl.slice(0, 300));
    pruefe("und sie trägt keine Überschrift \"Einträge\" mehr", !/>\s*Einträge\s*</.test(seite(ohneEntwuerfe, "lexikon")), "Überschrift noch da");
  }

  {
    // Und eine Ebene hoeher: Der Sitemap-Index nennt keine leere Datei.
    // Ohne diese Regel stand `/sitemap-bands.xml` mit null URLs darin -- die
    // Search Console meldet das dauerhaft als "0 entdeckte URLs".
    const index = readFileSync(path.join(ohneEntwuerfe, "sitemap-index.xml"), "utf8");
    const genannt = [...index.matchAll(/<loc>[^<]*\/(sitemap-[a-z]+\.xml)<\/loc>/g)].map((m) => m[1]);

    pruefe("der Sitemap-Index nennt die gefüllten Sammlungen", genannt.includes("sitemap-events.xml") && genannt.includes("sitemap-lexikon.xml"), genannt.join(" "));
    pruefe("und die leeren nicht", !genannt.includes("sitemap-bands.xml") && !genannt.includes("sitemap-artikel.xml"), genannt.join(" "));
    pruefe("die festen Seiten stehen weiterhin darin", genannt.includes("sitemap-seiten.xml"), genannt.join(" "));
    // Lebenszeichen fuer die weggelassene Datei: Es gibt sie, sie ist nur
    // nicht genannt. Sonst waere "nicht im Index" auch wahr, wenn der Build
    // sie gar nicht erst erzeugt haette.
    pruefe(
      "die leere Sitemap wird trotzdem gebaut und ist leer",
      existsSync(path.join(ohneEntwuerfe, "sitemap-bands.xml")) &&
        !/<loc>/.test(readFileSync(path.join(ohneEntwuerfe, "sitemap-bands.xml"), "utf8")),
      "Datei fehlt oder enthält URLs",
    );
  }
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
