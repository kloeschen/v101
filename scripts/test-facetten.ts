#!/usr/bin/env -S npx tsx
/**
 * test-facetten.ts — sichert den Indexierungs-Schwellenwert ab.
 *
 * Der Schwellenwert entscheidet, welche Seiten überhaupt in den Index dürfen.
 * Liegt er falsch, produziert die Site entweder Thin Content in Masse oder
 * verschenkt Einstiegsseiten. Beides fällt erst Monate später auf — deshalb
 * hier als Behauptungen.
 *
 *   npx tsx scripts/test-facetten.ts
 */

import {
  sammleFacetten,
  indexierbarkeit,
  RESERVIERTE_SEGMENTE,
  FACETTEN,
  MIN_EINTRAEGE,
  MIN_EINLEITUNG_WORTE,
  zaehleWorte,
} from "../src/lib/facetten";
import { buildRegistry, type RegistryEingabe } from "../src/lib/links";
import { ladeAlle, alsRegistryEingaben } from "./_laden";
import { collectionNames } from "../src/content/_schemas";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Testdaten                                                           */
/* ------------------------------------------------------------------ */

const event = (slug: string, jahr: number, typ = "weekender", reihe?: string): RegistryEingabe => ({
  collection: "events",
  slug,
  daten: {
    name: slug,
    kurzbeschreibung: `${slug} ist eine Veranstaltung.`,
    typ,
    beginn: new Date(`${jahr}-07-01T18:00:00+02:00`),
    ort: "halle",
    ...(reihe ? { reihe, reiheName: "Die Reihe" } : {}),
  },
});

const lang = "Wort ".repeat(MIN_EINLEITUNG_WORTE + 20);
const kurz = "Wort ".repeat(20);

/* ------------------------------------------------------------------ */
/* Facettenbildung                                                     */
/* ------------------------------------------------------------------ */

{
  const reg = buildRegistry([event("a", 2027), event("b", 2027), event("c", 2026)]);
  const facetten = sammleFacetten(reg);

  const jahre = facetten.filter((f) => f.segment === "jahr").map((f) => f.wert).sort();
  gleich("Jahresfacetten entstehen aus dem Startdatum", jahre, ["2026", "2027"]);

  const f2027 = facetten.find((f) => f.segment === "jahr" && f.wert === "2027")!;
  gleich("Einträge werden der richtigen Facette zugeordnet", f2027.eintraege.length, 2);
  gleich("Pfad liegt unter einem eigenen Segment", f2027.pfad, "/events/jahr/2027/");
  pruefe("Facettenlabel ist sprechend", f2027.label === "Veranstaltungen 2027", f2027.label);
}

{
  const reg = buildRegistry([event("a", 2027, "festival"), event("b", 2027, "weekender")]);
  const typen = sammleFacetten(reg).filter((f) => f.segment === "typ");
  gleich("je Veranstaltungsart eine Facette", typen.length, 2);
  pruefe(
    "Art wird ausgeschrieben",
    typen.some((f) => f.label === "Festivals") && typen.some((f) => f.label === "Weekender"),
    typen.map((f) => f.label).join(", "),
  );
}

/* ------------------------------------------------------------------ */
/* Schwellenwert                                                       */
/* ------------------------------------------------------------------ */

{
  const reg = buildRegistry([event("a", 2027, "festival"), event("b", 2027, "festival")]);
  const f = sammleFacetten(reg).find((x) => x.segment === "typ")!;
  const { indexierbar, grund } = indexierbarkeit(f, lang);
  pruefe("zu wenige Einträge: kein Index trotz Einleitung", !indexierbar, grund);
  pruefe("Grund nennt die fehlenden Einträge", (grund ?? "").includes(`von ${MIN_EINTRAEGE}`), grund);
}

{
  const eintraege = Array.from({ length: MIN_EINTRAEGE }, (_, i) => event(`e${i}`, 2027, "festival"));
  const f = sammleFacetten(buildRegistry(eintraege)).find((x) => x.segment === "typ")!;

  gleich("genug Einträge, keine Einleitung: kein Index", indexierbarkeit(f, undefined).indexierbar, false);
  gleich("genug Einträge, zu kurze Einleitung: kein Index", indexierbarkeit(f, kurz).indexierbar, false);
  gleich("genug Einträge und Einleitung: Index", indexierbarkeit(f, lang).indexierbar, true);

  const grund = indexierbarkeit(f, kurz).grund ?? "";
  pruefe("Grund nennt den Dateipfad der Einleitung", grund.includes("src/facetten/events/typ/festival.md"), grund);
}

{
  // Jahresarchive haben eine niedrigere Schwelle, weil sie direkt gesucht
  // werden ("Rockabilly Festivals 2027") und auch dünn nützlich sind.
  const drei = [event("a", 2027), event("b", 2027), event("c", 2027)];
  const f = sammleFacetten(buildRegistry(drei)).find((x) => x.segment === "jahr")!;
  gleich("Jahresarchiv braucht weniger Einträge", indexierbarkeit(f, lang).indexierbar, true);
  gleich("aber weiterhin eine Einleitung", indexierbarkeit(f, undefined).indexierbar, false);
}

{
  // Reihen sind die einzige Ausnahme ohne Einleitungspflicht: Die Seite
  // besteht aus den Ausgaben selbst, es gibt nichts zu erklären.
  const zwei = [event("a", 2026, "weekender", "reihe-x"), event("b", 2027, "weekender", "reihe-x")];
  const f = sammleFacetten(buildRegistry(zwei)).find((x) => x.segment === "reihe")!;
  gleich("Reihe ab zwei Ausgaben indexierbar", indexierbarkeit(f, undefined).indexierbar, true);
  gleich("Reihenlabel kommt aus reiheName", f.label, "Die Reihe");

  const eine = [event("a", 2026, "weekender", "reihe-y")];
  const f1 = sammleFacetten(buildRegistry(eine)).find((x) => x.segment === "reihe")!;
  gleich("Einzelausgabe ergibt keine indexierte Reihenseite", indexierbarkeit(f1, undefined).indexierbar, false);
}

{
  // Regression zu einem Review-Befund: Silvesterball am 01.01. um 00:30
  // Ortszeit. getFullYear() auf einem UTC-Server ergäbe das Vorjahr.
  const reg = buildRegistry([event("silvester", 2027).collection === "events" ? {
    collection: "events", slug: "silvester",
    daten: { name: "Silvesterball", kurzbeschreibung: "x", typ: "tanzabend",
             beginn: new Date("2027-01-01T00:30:00+01:00"), ort: "halle" },
  } : event("x", 2027)]);
  const jahre = sammleFacetten(reg).filter((f) => f.segment === "jahr").map((f) => f.wert);
  gleich("Jahresfacette rechnet in der Site-Zeitzone", jahre, ["2027"]);
}

{
  gleich("Wortzählung ignoriert Markdown-Auszeichnung", zaehleWorte("## Titel\n\n**fett** und [link](/a/)"), 4);
  gleich("leere Einleitung zählt null", zaehleWorte(undefined), 0);
}

/* ------------------------------------------------------------------ */
/* Kollisionen                                                         */
/* ------------------------------------------------------------------ */

{
  const segmente = [...new Set(FACETTEN.map((f) => f.segment))];
  pruefe(
    "jedes Facettensegment ist reserviert",
    segmente.every((s) => RESERVIERTE_SEGMENTE.includes(s)),
    segmente.filter((s) => !RESERVIERTE_SEGMENTE.includes(s)).join(", "),
  );

  const echte = buildRegistry(alsRegistryEingaben(ladeAlle()));
  const kollisionen = [...echte.eintraege.values()].filter((e) => RESERVIERTE_SEGMENTE.includes(e.slug));
  gleich("kein Entitäts-Slug belegt ein reserviertes Segment", kollisionen.map((e) => `${e.collection}/${e.slug}`), []);

  pruefe(
    "Facetten nur für Collections, die es gibt",
    FACETTEN.every((f) => collectionNames.includes(f.collection)),
  );
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
