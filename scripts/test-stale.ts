#!/usr/bin/env -S npx tsx
/**
 * test-stale.ts — der Bericht muss erledigbare Posten führen.
 *
 * Ein Bericht ist nur so viel wert wie das Vertrauen, dass jede Zeile darin
 * eine Aufgabe ist. Führt er dauerhaft Posten, die niemand erledigen kann,
 * gewöhnt man sich daran, ihn zu überlesen — und übersieht die Zeile, die
 * zählt. Das ist Lektion 4 in der Berichtsform: Ein voller Bericht muss
 * etwas bedeuten.
 *
 * Der Betriebsfall: Der Walldorf Weekender stand seit 110 Tagen als "Reihe
 * ohne Folgetermin" im Bericht. Der Eintrag trägt aber `letzteAusgabe: true`
 * — die Reihe ist ausdrücklich beendet, es kommt nichts mehr. Der Posten war
 * nicht erledigbar, sondern eine Fehlmeldung.
 *
 * NACH LEKTION 19: Die Abwesenheit des Postens allein belegt nichts — sie
 * wäre auch wahr, wenn der Bericht die Reihe gar nicht erst gesehen hätte
 * oder die ganze Rubrik leer liefe. Jede Prüfung hier hat deshalb ihre
 * Gegenrichtung an denselben Daten: dieselbe Reihe OHNE `letzteAusgabe` muss
 * gemeldet werden.
 *
 *   npx tsx scripts/test-stale.ts
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { site } from "../src/site.config";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Datum in der Zeitzone der Site (Lektion 1)                          */
/* ------------------------------------------------------------------ */

const tagVorOrt = (versatz: number): string => {
  const heute = new Intl.DateTimeFormat("en-CA", {
    timeZone: site.zeitzone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [j, m, t] = heute.split("-").map(Number);
  return new Date(Date.UTC(j, m - 1, t + versatz)).toISOString().slice(0, 10);
};
const HEUTE = tagVorOrt(0);
const VOR_100_TAGEN = tagVorOrt(-100);

/* ------------------------------------------------------------------ */
/* Prüfprojekt                                                         */
/* ------------------------------------------------------------------ */

const FREI = ["veroeffent", "licht"].join(""); // guard.mjs prüft auf das Wort

/** Ein vergangener Termin einer Reihe. `beendet` setzt letzteAusgabe. */
const event = (slug: string, name: string, beendet: boolean) => `---
name: ${name}
aliases: [${name}-Kurzform]
kurzbeschreibung: ${name} war ein Wochenendfestival der Rockabilly-Szene mit Konzerten, Plattenboerse und Tanzflaeche in einer Halle am Ortsrand.
status: ${FREI}
erstelltAm: ${VOR_100_TAGEN}
geprueftAm: ${HEUTE}
autor: markus
typ: weekender
beginn: ${VOR_100_TAGEN}T18:00:00+02:00
ort: testhalle
region: testregion
reihe: ${slug}
reiheName: ${name}
eintritt: frei
durchfuehrung: stattgefunden
letzteAusgabe: ${beendet}
quellen:
  - url: https://de.wikipedia.org/wiki/Rockabilly
    titel: Rockabilly (Wikipedia)
    abgerufenAm: ${HEUTE}
    felder: [beginn, ort, eintritt, durchfuehrung, letzteAusgabe]
    art: nachschlagewerk
---

${name} war ein Wochenendfestival der Rockabilly-Szene, das ueber mehrere Jahre in derselben Halle stattfand und Konzerte, Plattenboerse und Tanzflaeche unter einem Dach zusammenbrachte. Die Ausgabe vom ${VOR_100_TAGEN} war die vorerst letzte.

## Ablauf von ${name}

Gespielt wurde an zwei Abenden auf einer Buehne, dazwischen legten DJs auf. Der Eintritt war frei, die Halle bot Platz fuer mehrere hundert Gaeste, und die Plattenboerse lief ueber den ganzen Samstag. Wer frueh kam, bekam einen Platz an den Tischen am Rand der Tanzflaeche, alle anderen standen. Das Publikum reiste zum Teil von weit her an.
`;

function baueTempProjekt(): string {
  const wurzel = mkdtempSync(path.join(os.tmpdir(), "v101-staletest-"));
  for (const c of ["events", "locations", "regionen"]) {
    mkdirSync(path.join(wurzel, "src", "content", c), { recursive: true });
  }
  symlinkSync(path.join(PROJEKT, "scripts"), path.join(wurzel, "scripts"), "dir");
  symlinkSync(path.join(PROJEKT, "node_modules"), path.join(wurzel, "node_modules"), "dir");
  mkdirSync(path.join(wurzel, "src", "lib"), { recursive: true });
  rmSync(path.join(wurzel, "src", "lib"), { recursive: true, force: true });
  symlinkSync(path.join(PROJEKT, "src", "lib"), path.join(wurzel, "src", "lib"), "dir");
  symlinkSync(path.join(PROJEKT, "src", "content", "_schemas.ts"), path.join(wurzel, "src", "content", "_schemas.ts"));
  symlinkSync(path.join(PROJEKT, "src", "site.config.ts"), path.join(wurzel, "src", "site.config.ts"));

  // Referenzziele, damit der Loader nicht an fehlenden Slugs haengt.
  writeFileSync(path.join(wurzel, "src", "content", "regionen", "testregion.md"), `---
name: Testregion
kurzbeschreibung: Die Testregion ist eine erfundene Gebietseinheit fuer die Pruefung des Berichts und steht fuer keine wirkliche Gegend.
status: ${FREI}
erstelltAm: ${HEUTE}
geprueftAm: ${HEUTE}
autor: markus
ebene: metropolregion
land: DE
---

Die Testregion ist eine erfundene Gebietseinheit, die nur in den Pruefdaten dieses Projekts vorkommt und dort als Ziel fuer Referenzen dient.
`);
  writeFileSync(path.join(wurzel, "src", "content", "locations", "testhalle.md"), `---
name: Testhalle
kurzbeschreibung: Die Testhalle ist ein erfundener Veranstaltungsort fuer die Pruefung des Berichts und steht fuer kein wirkliches Haus.
status: ${FREI}
erstelltAm: ${HEUTE}
geprueftAm: ${HEUTE}
autor: markus
typ: halle
adresse:
  strasse: Teststrasse 1
  plz: "12345"
  ort: Teststadt
  land: DE
region: testregion
---

Die Testhalle ist ein erfundener Veranstaltungsort, der nur in den Pruefdaten dieses Projekts vorkommt und dort als Ziel fuer Referenzen dient.
`);
  return wurzel;
}

interface JsonPosten { art: string; titel: string; detail: string }

function bericht(wurzel: string): { code: number; posten: JsonPosten[]; roh: string } {
  const r = spawnSync("npx", ["tsx", path.join(PROJEKT, "scripts", "stale-report.ts"), "--json", "--limit", "100"], {
    cwd: wurzel,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const roh = r.stdout ?? "";
  let posten: JsonPosten[] = [];
  try {
    const d = JSON.parse(roh);
    posten = (d.posten ?? d) as JsonPosten[];
  } catch {
    posten = [];
  }
  return { code: r.status ?? -1, posten, roh };
}

const temp = baueTempProjekt();
const evDatei = path.join(temp, "src", "content", "events", "testreihe-2026.md");

try {
  /* ---------------------------------------------------------------- */
  /* 1. Das Paar: dieselben Daten, ein Feld Unterschied                */
  /* ---------------------------------------------------------------- */
  /*
   * Beide Laeufe gehen ueber dieselbe Datei; einzig `letzteAusgabe` wechselt.
   * Das Paar IST das Lebenszeichen: "nicht gemeldet" allein waere auch wahr,
   * wenn der Bericht die Reihe nie gesehen haette oder die Rubrik leer
   * liefe. Erst der Nachweis, dass derselbe Bericht sie meldet, sobald das
   * Feld fehlt, trennt die beiden Ursachen (Lektion 17/19).
   *
   * Eine Zaehlung "Bericht nicht leer" taugt hier nicht: Bei beendeter Reihe
   * ist er tatsaechlich leer -- alle Pruefeintraege sind freigegeben, frisch
   * geprueft und belegt. Genau das ist ja der gewuenschte Zustand.
   */
  {
    writeFileSync(evDatei, event("testreihe", "Testreihe Weekender", false));
    const laufend = bericht(temp);
    const laufendeTreffer = laufend.posten.filter((p) => p.art === "reihe-ohne-folge");

    pruefe(
      "Bericht ist lesbar",
      laufend.code === 0 && laufend.roh.trim().startsWith("{"),
      `Exit ${laufend.code}, stdout: ${JSON.stringify(laufend.roh.slice(0, 200))}`,
    );
    gleich("laufende Reihe ohne Folgetermin wird gemeldet", laufendeTreffer.length, 1);
    pruefe(
      "und zwar namentlich, mit Alter",
      laufendeTreffer[0]?.titel === "Testreihe Weekender" && /\d+ Tagen/.test(laufendeTreffer[0]?.detail ?? ""),
      JSON.stringify(laufendeTreffer[0] ?? null),
    );

    writeFileSync(evDatei, event("testreihe", "Testreihe Weekender", true));
    const beendet = bericht(temp);
    const beendeteTreffer = beendet.posten.filter((p) => p.art === "reihe-ohne-folge");

    gleich("beendete Reihe wird nicht mehr gemeldet", beendeteTreffer.length, 0);
    pruefe(
      "und der Unterschied haengt allein an letzteAusgabe",
      laufendeTreffer.length === 1 && beendeteTreffer.length === 0,
      `laufend: ${laufendeTreffer.length}, beendet: ${beendeteTreffer.length}`,
    );
  }

  /* ---------------------------------------------------------------- */
  /* 3. Eine zweite, laufende Reihe bleibt unberührt                   */
  /* ---------------------------------------------------------------- */
  /*
   * Sonst wäre "beendete Reihen verschwinden" auch mit einer Änderung
   * vereinbar, die die ganze Rubrik abschaltet — zwei Ursachen, ein
   * Ergebnis (Lektion 17).
   */
  {
    const zweite = path.join(temp, "src", "content", "events", "andere-2026.md");
    writeFileSync(evDatei, event("testreihe", "Testreihe Weekender", true));
    writeFileSync(zweite, event("andere-reihe", "Andere Reihe", false));
    const b = bericht(temp);
    const arten = b.posten.filter((p) => p.art === "reihe-ohne-folge").map((p) => p.titel);

    gleich("die laufende Reihe steht weiterhin im Bericht", arten, ["Andere Reihe"]);
    rmSync(zweite, { force: true });
  }

  /* ---------------------------------------------------------------- */
  /* 4. Sammlungen ohne einen einzigen Eintrag                         */
  /* ---------------------------------------------------------------- */
  /*
   * Das Pruefprojekt legt nur events, locations und regionen an. Bands,
   * Lexikon und Artikel sind darin leer -- und damit ist dieselbe Lage da,
   * die im echten Register beim ersten Build mit freigegebenen Inhalten
   * auffiel: `/bands/` und `/artikel/` standen indexierbar in der Sitemap,
   * obwohl sie nichts zeigten.
   *
   * Das Paar steht wieder in einem Lauf: Die drei leeren Sammlungen muessen
   * gemeldet werden, die drei gefuellten nicht. Eine Rubrik, die gar nicht
   * laeuft, faellt an der ersten Haelfte; eine, die wahllos meldet, an der
   * zweiten.
   */
  {
    writeFileSync(evDatei, event("testreihe", "Testreihe Weekender", true));
    const b = bericht(temp);
    const leer = b.posten.filter((p) => p.art === "sammlung-leer").map((p) => p.titel.replace(/ \(.*\)$/, ""));

    gleich("die leeren Sammlungen werden gemeldet", [...leer].sort(), ["Artikel", "Bands", "Lexikon"]);
    pruefe(
      "und der Posten sagt, was ihnen fehlt",
      b.posten.some((p) => p.art === "sammlung-leer" && /keinen Eintrag/.test(p.detail)),
      JSON.stringify(b.posten.filter((p) => p.art === "sammlung-leer")[0] ?? null),
    );
    pruefe(
      "der Posten nennt den Pfad der Uebersicht",
      b.posten.every((p) => p.art !== "sammlung-leer" || /\(\/[a-z]+\/\)$/.test(p.titel)),
      JSON.stringify(leer),
    );
  }

  /* ---------------------------------------------------------------- */
  /* 5. Termin naht, Pruefung liegt zurueck (seit 2026-09-23)          */
  /* ---------------------------------------------------------------- */
  /*
   * Zehn Termine in einem Lauf, jeder mit genau einer Abweichung vom
   * Grundfall "freigegeben, in 5 Tagen, vor 10 Tagen geprueft". Gemeldet
   * werden duerfen genau drei. Das Paar steht wieder im selben Lauf: Eine
   * Rubrik, die gar nicht laeuft, faellt an den dreien, eine, die wahllos
   * meldet, an den sieben anderen. Die Raender liegen auf beiden Achsen
   * (14/15 Tage bis zum Termin, 7/8 Tage seit der Pruefung).
   */
  {
    const naht = (slug: string, name: string, inTagen: number, geprueftVor: number, extra: Record<string, string> = {}) => {
      const felder: Record<string, string> = {
        name,
        kurzbeschreibung: `${name} ist ein erfundener Tanzabend der Rockabilly-Szene, an dem die Pruefung naher Termine getestet wird.`,
        status: FREI,
        erstelltAm: tagVorOrt(-30),
        geprueftAm: tagVorOrt(-geprueftVor),
        autor: "markus",
        typ: "tanzabend",
        beginn: tagVorOrt(inTagen),
        ganztaegig: "true",
        ort: "testhalle",
        region: "testregion",
        eintritt: "frei",
        durchfuehrung: "geplant",
        ...extra,
      };
      const kopf = Object.entries(felder).map(([k, v]) => `${k}: ${v}`).join("\n");
      writeFileSync(path.join(temp, "src", "content", "events", `${slug}.md`), `---
${kopf}
quellen:
  - url: https://de.wikipedia.org/wiki/Rockabilly
    titel: Rockabilly (Wikipedia)
    abgerufenAm: ${tagVorOrt(-geprueftVor)}
    felder: [beginn, ort, eintritt, durchfuehrung]
    art: nachschlagewerk
---

${name} ist ein erfundener Tanzabend der Rockabilly-Szene. Er existiert nur in den Pruefdaten dieses Projekts und dient dazu, den Bericht ueber nahe Termine mit veralteter Pruefung zu testen.
`);
    };
    // Laufende Reihe, damit der Reihenfolge-Test unten einen Gegenstand hat.
    writeFileSync(evDatei, event("testreihe", "Testreihe Weekender", false));
    naht("naht-grund", "Nah Alt", 5, 10);
    naht("naht-heute", "Heute Alt", 0, 10);
    naht("naht-rand14", "Rand Vierzehn", 14, 8);
    naht("naht-frisch", "Nah Frisch", 5, 3);
    naht("naht-rand7", "Rand Sieben", 5, 7);
    naht("naht-rand15", "Rand Fuenfzehn", 15, 8);
    naht("naht-fern", "Fern Alt", 20, 10);
    naht("naht-entwurf", "Entwurf Nah Alt", 5, 10, { status: "entwurf" });
    naht("naht-abgesagt", "Abgesagt Nah Alt", 5, 10, { durchfuehrung: "abgesagt" });
    // Laeuft gerade: Beginn gestern, Ende morgen -- nicht vorbei, aber auch nicht "bevorstehend".
    naht("naht-laeuft", "Laeuft Alt", -1, 10, { ende: tagVorOrt(1), typ: "weekender" });

    const b = bericht(temp);
    const nah = b.posten.filter((p) => p.art === "termin-naht");

    // Lebenszeichen: Alle zehn muessen geladen sein, sonst belegt jedes
    // "nicht gemeldet" nur ein Schema, das die Datei verworfen hat. Der
    // Entwurf taucht als Entwurf auf -- er wurde also gelesen.
    pruefe(
      "der Entwurf wurde gelesen (steht als Entwurf im Bericht)",
      b.posten.some((p) => p.art === "entwurf" && p.titel === "Entwurf Nah Alt"),
      JSON.stringify(b.posten.map((p) => `${p.art}:${p.titel}`)),
    );
    gleich(
      "genau die drei faelligen Termine werden gemeldet",
      nah.map((p) => p.titel).sort(),
      ["Heute Alt", "Nah Alt", "Rand Vierzehn"],
    );
    gleich("der naechste steht vorn", nah[0]?.titel, "Heute Alt");
    pruefe("heute heisst heute", /^heute, zuletzt vor 10 Tagen/.test(nah[0]?.detail ?? ""), nah[0]?.detail ?? "");
    pruefe(
      "der Rand nennt die Tage",
      nah.some((p) => p.titel === "Rand Vierzehn" && /^in 14 Tagen, zuletzt vor 8 Tagen/.test(p.detail)),
      JSON.stringify(nah),
    );
    const reihe = b.posten.findIndex((q) => q.art === "reihe-ohne-folge");
    pruefe("die Reihe ohne Folgetermin steht im selben Bericht", reihe >= 0, JSON.stringify(b.posten.map((p) => p.art)));
    pruefe(
      "und alle nahen Termine stehen vor ihr",
      reihe >= 0 && nah.every((p) => b.posten.indexOf(p) < reihe),
      JSON.stringify(b.posten.map((p) => `${p.art}:${p.titel}`)),
    );
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
