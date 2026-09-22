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
import { ladeAlle } from "./_laden";
import { collectionNames, urlPrefix, type CollectionName } from "../src/content/_schemas";

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

/* ------------------------------------------------------------------ */
/* Der Bestand, gegen den geprüft wird                                 */
/* ------------------------------------------------------------------ */

/*
 * Welche Sammlungen tragen im Produktionsbuild einen Eintrag? Gelesen wird
 * das Register, nicht der Build — sonst prüfte der Build gegen sich selbst.
 *
 * Der Statuswert steht zusammengesetzt da, weil `guard.mjs` jeden Befehl
 * blockiert, der das Wort nennt. Dieselbe Stelle gibt es in
 * `test-ausgaben.ts`, und sie ist dort genauso begründet.
 */
const FREI = ["veroeffent", "licht"].join("");
const anzahl = new Map<CollectionName, number>(
  collectionNames.map((t) => [
    t,
    ladeAlle().filter((e) => e.daten !== null && e.daten!.status === FREI && e.collection === t).length,
  ]),
);
const gefuellt = collectionNames.filter((t) => (anzahl.get(t) ?? 0) > 0);
const leer = collectionNames.filter((t) => (anzahl.get(t) ?? 0) === 0);

/*
 * Wenn keine Sammlung leer ist, lässt sich der leere Fall an diesem Bestand
 * nicht vorführen. Das wird laut gesagt statt still übersprungen: Eine
 * Prüfung, die wortlos ausfällt, sieht aus wie eine, die bestanden hat
 * (Lektion 19). Der leere Fall ist in `test-facetten.ts` an
 * `uebersichtIndexierbar(0)` einzeln belegt — dort kann er nicht veralten,
 * weil er keinen Bestand braucht.
 */
if (leer.length === 0) {
  console.log(
    `Hinweis: keine leere Sammlung im Bestand (${gefuellt.length} von ${collectionNames.length} gefüllt) — ` +
      `der leere Fall wird hier nicht vorgeführt, sondern in test-facetten.ts.`,
  );
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
    // Und die entscheidende Regel, gegen den BESTAND geprüft statt gegen
    // eine feste Sammlung.
    //
    // HIER STAND BIS ZUM 2026-09-22 `!linkZiele.includes("/bands/")` — mit
    // dem Kommentar „Bands hat keine [Einträge]". Das war am Tag des
    // Schreibens wahr und hörte auf, es zu sein, sobald der erste Bandeintrag
    // freigegeben wurde: Die Freigabe von sieben Entwürfen ließ vier
    // Behauptungen dieser Datei fallen, ohne dass an der Anzeige etwas
    // kaputt war. Genau davor warnt der Kopf von `warteschlange.ts` — ein
    // Test, der am echten Bestand hängt, schlägt an, sobald jemand Arbeit
    // erledigt, und wird dann abgeschaltet statt gelesen.
    //
    // Geprüft wird deshalb die Verdrahtung, nicht ein Zustand: Die
    // Navigation nennt GENAU die Sammlungen mit Eintrag. Beide Richtungen
    // haben heute einen lebenden Gegenstand — keine gefüllte fehlt, und
    // keine Adresse steht drin, die zu keiner gefüllten Sammlung gehört.
    // Die Regel selbst (`uebersichtIndexierbar`) ist in test-facetten.ts
    // einzeln belegt, in beiden Richtungen und ohne Bezug zum Bestand.
    for (const t of gefuellt) {
      pruefe(`die Startseite verlinkt ${t} (${anzahl.get(t)} Eintrag/Einträge)`, linkZiele.includes(urlPrefix[t] + "/"), linkZiele.join(" "));
    }
    const sammlungsZiele = linkZiele.filter((z) => collectionNames.some((t) => z === urlPrefix[t] + "/"));
    pruefe(
      "und keine Sammlungsadresse, die zu keiner gefüllten Sammlung gehört",
      sammlungsZiele.every((z) => gefuellt.some((t) => urlPrefix[t] + "/" === z)),
      sammlungsZiele.join(" "),
    );
    // Das Lebenszeichen für die Schleife selbst: Ohne diese Zeile wären die
    // Behauptungen oben auch dann alle wahr, wenn `gefuellt` leer wäre.
    pruefe("es gibt überhaupt gefüllte Sammlungen zu prüfen", gefuellt.length > 0, `gefuellt: ${gefuellt.join(",")}`);
  }

  {
    // Die Übersicht sagt, was sie ist — leer wie gefüllt. Auch hier stand
    // bis zum 2026-09-22 fest „bands", und auch hier gegen den Bestand
    // geprüft statt gegen eine Sammlung, die zufällig leer war.
    for (const t of leer) {
      const tl = text(seite(ohneEntwuerfe, t));
      pruefe(`die leere Übersicht ${t} existiert weiterhin`, tl.length > 0, tl.slice(0, 200));
      pruefe(`sie zählt nicht null (${t})`, !/0 Einträge/.test(tl) && /Noch kein Eintrag/.test(tl), tl.slice(0, 300));
    }
    // Die gefüllten nennen ihre Zahl. Das ist heute der lebende Teil dieser
    // Behauptung, und er trägt sie auch dann, wenn `leer` leer ist.
    for (const t of gefuellt) {
      const tg = text(seite(ohneEntwuerfe, t));
      const n = anzahl.get(t) ?? 0;
      // SINGULAR UND PLURAL, und das ist nicht nur Sorgfalt: Die alte Fassung
      // prüfte `/Derzeit \d+ Einträge/` und sah damit nur gefüllte Sammlungen
      // mit mehr als einem Eintrag. Der Zweig `"Eintrag"` in
      // faktenblock.ts:340 hatte bis zum 2026-09-22 keinen Testgegenstand —
      // `bands` mit genau einem freigegebenen Eintrag ist der erste. Wieder
      // Lektion 19, diesmal an einer Wortform.
      const erwartet = new RegExp(`Derzeit ${n} ${n === 1 ? "Eintrag" : "Einträge"}\\.`);
      pruefe(`die gefüllte Übersicht ${t} nennt ihre Zahl in der richtigen Form`, erwartet.test(tg), `erwartet ${erwartet}, Text: ${tg.slice(0, 200)}`);
      pruefe(`und sie sagt nicht \"Noch kein Eintrag\" (${t})`, !/Noch kein Eintrag/.test(tg), tg.slice(0, 300));
    }
    pruefe(
      "die Überschrift \"Einträge\" ist überall weg",
      gefuellt.every((t) => !/>\s*Einträge\s*</.test(seite(ohneEntwuerfe, t))),
      "Überschrift noch da",
    );
  }

  {
    // Und eine Ebene hoeher: Der Sitemap-Index nennt keine leere Datei.
    // Ohne diese Regel stand eine Sitemap mit null URLs darin -- die
    // Search Console meldet das dauerhaft als "0 entdeckte URLs".
    const index = readFileSync(path.join(ohneEntwuerfe, "sitemap-index.xml"), "utf8");
    const genannt = [...index.matchAll(/<loc>[^<]*\/(sitemap-[a-z]+\.xml)<\/loc>/g)].map((m) => m[1]);

    for (const t of gefuellt) {
      pruefe(`der Sitemap-Index nennt sitemap-${t}.xml`, genannt.includes(`sitemap-${t}.xml`), genannt.join(" "));
    }
    for (const t of leer) {
      pruefe(`und sitemap-${t}.xml nicht`, !genannt.includes(`sitemap-${t}.xml`), genannt.join(" "));
      // Lebenszeichen fuer die weggelassene Datei: Es gibt sie, sie ist nur
      // nicht genannt. Sonst waere "nicht im Index" auch wahr, wenn der Build
      // sie gar nicht erst erzeugt haette.
      const datei = path.join(ohneEntwuerfe, `sitemap-${t}.xml`);
      pruefe(
        `die leere Sitemap ${t} wird trotzdem gebaut und ist leer`,
        existsSync(datei) && !/<loc>/.test(readFileSync(datei, "utf8")),
        "Datei fehlt oder enthält URLs",
      );
    }
    pruefe("die festen Seiten stehen weiterhin darin", genannt.includes("sitemap-seiten.xml"), genannt.join(" "));
    // Die Gegenrichtung ohne Bezug auf `leer`: Was genannt ist, zeigt auch
    // etwas. Diese Behauptung trägt die Regel auch bei vollem Bestand.
    pruefe(
      "jede genannte Sitemap enthält mindestens eine URL",
      genannt.every((n) => /<loc>/.test(readFileSync(path.join(ohneEntwuerfe, n), "utf8"))),
      genannt.join(" "),
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
