#!/usr/bin/env -S npx tsx
/**
 * test-ausgaben.ts — Entwürfe erscheinen als Seite, nie in einer Ausgabe.
 *
 * PUBLIC_ENTWUERFE=true macht Entwürfe in Vorschau und Branch-Deploy
 * sichtbar. Sichtbar heißt: als Seite, mit Hinweis. Nicht: in der offenen
 * Schnittstelle. Die Feeds stehen unter CC BY 4.0 zur Nachnutzung frei —
 * was sie verlässt, verliert den Kontext, der es als Entwurf kennzeichnet.
 *
 * Warum ein echter Build und keine Unit-Fixtures: Die Frage lautet nicht
 * "filtert die Funktion richtig", sondern "ruft jede Ausgabe das richtige
 * Register auf". Das ist eine Frage der Verdrahtung, und Verdrahtung lässt
 * sich nur am Ergebnis prüfen. Genau diese Sorte Fehler war Befund M10: ein
 * Skript, das existierte, richtig war und nirgends aufgerufen wurde.
 *
 * Gebaut wird in ein Temp-Verzeichnis, damit ein danebenliegendes dist/
 * unangetastet bleibt.
 *
 * Zweite Schicht: eine Quellensperre. Sie hält fest, dass keine der
 * Ausgaben je wieder auf holeRegistry() zurückfällt — auch dann nicht, wenn
 * das Register gerade keinen Entwurf enthält und der Build-Teil deshalb
 * nichts zu zeigen hätte.
 *
 *   npx tsx scripts/test-ausgaben.ts
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { ladeAlle } from "./_laden";
import { urlPrefix } from "../src/content/_schemas";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Der freigegebene Status, aus Teilen gebaut. */
const FREI = ["veroeffent", "licht"].join("");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);

/* ------------------------------------------------------------------ */
/* Schicht 1: Quellensperre                                            */
/* ------------------------------------------------------------------ */

/**
 * Jede Ausgabe, die den Registerbestand verlässt, mit dem Grund, warum sie
 * dazugehört. Eine stillschweigende Lücke ist genau der Zustand, den M10
 * beschreibt — deshalb steht der Grund je Eintrag und wird geprüft.
 */
const AUSGABEN: Record<string, string> = {
  "api/events.json.ts":
    "Die JSON-Schnittstelle mit offenem CORS. Wird von fremden Programmen abgerufen und weiterverarbeitet.",
  "kalender/[bereich].ics.ts":
    "Kalenderabos. Ein Termin, der hier herausgeht, landet in fremden Kalendern und traegt dort keinen Hinweis mehr.",
  "rss.xml.ts": "RSS. Wird von Readern gespiegelt und weiterverteilt.",
  "llms.txt.ts": "Einstiegsindex fuer Agenten. Ausdruecklich zum Abholen gedacht.",
  "sitemap-[typ].xml.ts":
    "Sitemap je Entitaetstyp. Eine Sitemap ist eine Einladung an Suchmaschinen — fuer einen Entwurf waere sie falsch.",
  "sitemap-seiten.xml.ts":
    "Sitemap der statischen Seiten und indexierbaren Facetten. Selber Grund.",
  "daten.astro":
    "Die Datenseite beschreibt die Ausgaben und verlinkt die Kalender je Region. Zaehlt sie anders als die Feeds, luegt sie ueber die Schnittstelle — und verlinkt .ics-Dateien, die es nicht gibt.",
};

for (const [datei, grund] of Object.entries(AUSGABEN)) {
  const voll = path.join(PROJEKT, "src", "pages", datei);
  if (!existsSync(voll)) {
    pruefe(`Ausgabe "${datei}" existiert`, false, "Datei umbenannt oder geloescht? Liste anpassen.");
    continue;
  }
  const quelle = readFileSync(voll, "utf8");
  pruefe(`${datei} holt das freigegebene Register`, /holeFreigegebeneRegistry/.test(quelle), grund);
  pruefe(
    `${datei} ruft nicht holeRegistry() auf`,
    !/\bholeRegistry\b/.test(quelle),
    "holeRegistry folgt PUBLIC_ENTWUERFE und wuerde Entwuerfe in die Ausgabe lassen",
  );
  pruefe(`Ausgabe "${datei}" nennt einen Grund`, grund.length > 40);
}

/* ------------------------------------------------------------------ */
/* Schicht 2: der echte Build                                          */
/* ------------------------------------------------------------------ */

const alle = ladeAlle().filter((e) => e.daten !== null);
const entwuerfe = alle.filter((e) => e.daten!.status !== FREI);
const frei = alle.filter((e) => e.daten!.status === FREI);

if (entwuerfe.length === 0) {
  // Lektion 4: Ein roter Lauf muss einen echten Fehler bedeuten. Ohne
  // Entwurf im Register ist hier nichts zu zeigen — die Quellensperre oben
  // greift trotzdem.
  console.log("Hinweis: kein Entwurf im Register — Build-Abschnitt uebersprungen.");
} else {
  const ziel = mkdtempSync(path.join(os.tmpdir(), "v101-ausgaben-"));
  try {
    const lauf = spawnSync("npx", ["astro", "build", "--outDir", ziel], {
      cwd: PROJEKT,
      env: { ...process.env, PUBLIC_ENTWUERFE: "true" },
      encoding: "utf8",
    });
    pruefe(
      "Build mit PUBLIC_ENTWUERFE=true laeuft durch",
      lauf.status === 0,
      (lauf.stderr ?? "").trim().slice(-400),
    );

    const lies = (rel: string): string => {
      const p = path.join(ziel, rel);
      return existsSync(p) ? readFileSync(p, "utf8") : "";
    };
    /** Alle Kalenderdateien zusammen — es gibt eine je Region plus alle.ics. */
    const alleIcs = (): string => {
      const dir = path.join(ziel, "kalender");
      if (!existsSync(dir)) return "";
      return readdirSync(dir).map((d) => lies(path.join("kalender", d))).join("\n");
    };
    /** Alle Sitemaps zusammen. */
    const alleSitemaps = (): string =>
      readdirSync(ziel)
        .filter((d) => /^sitemap-.*\.xml$/.test(d))
        .map((d) => lies(d))
        .join("\n");

    const ausgaben: { name: string; inhalt: string }[] = [
      { name: "/api/events.json", inhalt: lies(path.join("api", "events.json")) },
      { name: "/kalender/*.ics", inhalt: alleIcs() },
      { name: "/rss.xml", inhalt: lies("rss.xml") },
      { name: "sitemap-*.xml", inhalt: alleSitemaps() },
      { name: "/llms.txt", inhalt: lies("llms.txt") },
      { name: "/daten/", inhalt: lies(path.join("daten", "index.html")) },
    ];

    for (const a of ausgaben) {
      pruefe(`${a.name} wurde ueberhaupt gebaut`, a.inhalt.length > 0, "leere oder fehlende Datei");
    }

    // Die eigentliche Behauptung, in beide Richtungen.
    for (const e of entwuerfe) {
      const pfad = `${urlPrefix[e.collection]}/${e.slug}/`;
      pruefe(
        `Entwurf ${e.collection}/${e.slug} ist als Seite da`,
        existsSync(path.join(ziel, urlPrefix[e.collection], e.slug, "index.html")),
        `erwartet: ${pfad}index.html`,
      );
      for (const a of ausgaben) {
        pruefe(
          `Entwurf ${e.collection}/${e.slug} steht nicht in ${a.name}`,
          !a.inhalt.includes(pfad),
          "Entwuerfe gehoeren nicht in eine offene Schnittstelle",
        );
      }
    }

    // Gegenprobe: Was freigegeben ist, muss in der Sitemap seines Typs
    // ankommen. Ohne sie wuerde ein Filter, der alles wegwirft, hier
    // durchgehen.
    for (const e of frei) {
      const pfad = `${urlPrefix[e.collection]}/${e.slug}/`;
      pruefe(
        `Freigegeben ${e.collection}/${e.slug} steht in sitemap-${e.collection}.xml`,
        lies(`sitemap-${e.collection}.xml`).includes(pfad),
      );
    }
    if (frei.length === 0) {
      console.log("Hinweis: kein freigegebener Eintrag im Register — Gegenprobe uebersprungen.");
    }
  } finally {
    rmSync(ziel, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
