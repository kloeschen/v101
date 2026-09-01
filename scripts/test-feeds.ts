#!/usr/bin/env -S npx tsx
/**
 * test-feeds.ts — sichert die Kodierung der Maschinenschnittstellen ab.
 *
 * Feeds werden von fremden Programmen gelesen, die keine Nachsicht kennen:
 * Ein nicht maskiertes Komma in LOCATION, eine fehlende Faltung nach 75
 * Oktetten oder ein mitten in einer UTF-8-Sequenz zerschnittener Umlaut, und
 * der Kalender importiert Kauderwelsch oder gar nichts. Solche Fehler
 * bemerkt man nicht im Browser, sondern erst durch eine Beschwerde.
 *
 *   npx tsx scripts/test-feeds.ts
 */

import { readFileSync } from "node:fs";
import { jsonldSicher } from "../src/lib/jsonld";
import {
  icsKalender,
  eventFeed,
  rssFeed,
  robotsTxt,
  llmsTxt,
  sitemapXml,
  sitemapIndexXml,
  sitemapFuerCollection,
} from "../src/lib/feeds";
import { buildRegistry, type RegistryEingabe } from "../src/lib/links";
import { ladeAlle, alsRegistryEingaben } from "./_laden";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

const STAMP = new Date("2026-08-29T10:00:00Z");

/* ------------------------------------------------------------------ */
/* Testdaten                                                           */
/* ------------------------------------------------------------------ */

const halle: RegistryEingabe = {
  collection: "locations",
  slug: "halle",
  daten: {
    name: "Halle; mit Semikolon, Komma und \\ Backslash",
    kurzbeschreibung: "Eine Halle.",
    adresse: { strasse: "Musterweg 1", plz: "12345", ort: "Musterstadt", land: "DE", lat: 49.3, lng: 8.6 },
  },
};

const ev = (slug: string, extra: Record<string, any> = {}): RegistryEingabe => ({
  collection: "events",
  slug,
  daten: {
    name: "Ein Wochenende",
    kurzbeschreibung: "Eine Veranstaltung mit einer Beschreibung, die über fünfundsiebzig Oktette hinausgeht und deshalb gefaltet werden muss — inklusive Umlauten wie ä, ö und ü.",
    typ: "weekender",
    beginn: new Date("2027-07-02T18:00:00+02:00"),
    ende: new Date("2027-07-04T23:00:00+02:00"),
    ort: "halle",
    durchfuehrung: "geplant",
    eintrittFrei: false,
    preise: [{ bezeichnung: "Tageskasse", betrag: 25, waehrung: "EUR" }],
    lineupBands: [],
    lineupWeitere: ["Band Eins"],
    geprueftAm: new Date("2026-08-01"),
    erstelltAm: new Date("2026-08-01"),
    ...extra,
  },
});

const registry = buildRegistry([halle, ev("wochenende")]);
const ics = icsKalender(registry, [registry.eintraege.get("events/wochenende")!], "Test", STAMP);

/* ------------------------------------------------------------------ */
/* iCalendar                                                           */
/* ------------------------------------------------------------------ */

{
  pruefe("Kalender ist umschlossen", ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.trimEnd().endsWith("END:VCALENDAR"));
  pruefe("Termin ist umschlossen", ics.includes("BEGIN:VEVENT\r\n") && ics.includes("END:VEVENT"));
  pruefe("nur CRLF als Zeilenende", !/[^\r]\n/.test(ics));
  pruefe("UID enthält den Host", /UID:wochenende@[^\s]+/.test(ics), ics.match(/UID:.*/)?.[0]);
  pruefe("DTSTAMP wird gesetzt", ics.includes("DTSTAMP:20260829T100000Z"));
  pruefe("Zeiten in UTC mit Z", /DTSTART:2027\d{4}T\d{6}Z/.test(ics), ics.match(/DTSTART.*/)?.[0]);
}

{
  const loc = ics.split("\r\n").find((z) => z.startsWith("LOCATION:")) ?? "";
  pruefe("Semikolon maskiert", loc.includes("\\;"), loc);
  pruefe("Komma maskiert", loc.includes("\\,"), loc);
  pruefe("Backslash maskiert", loc.includes("\\\\"), loc);
}

{
  const desc = ics.slice(ics.indexOf("DESCRIPTION:"));
  pruefe("Zeilenumbruch als \\n kodiert", desc.includes("\\n\\n"), desc.slice(0, 60));
}

{
  // Faltung: keine Zeile über 75 Oktette, Folgezeilen mit führendem Leerzeichen.
  const zeilen = ics.split("\r\n").filter(Boolean);
  const zuLang = zeilen.filter((z) => Buffer.byteLength(z, "utf8") > 75);
  gleich("keine Zeile über 75 Oktette", zuLang, []);
  pruefe("gefaltete Folgezeilen beginnen mit Leerzeichen", zeilen.some((z) => z.startsWith(" ")));

  // Der entscheidende Fall: entfalten, entmaskieren, und der ursprüngliche
  // Text muss Zeichen für Zeichen wieder da sein. Ein in der Mitte
  // zerschnittener Umlaut fällt genau hier auf und sonst nirgends.
  const entfaltet = ics.replace(/\r\n /g, "");
  const entmaskiert = (s: string) => s.replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c));
  const beschreibung = entmaskiert(
    entfaltet.split("\r\n").find((z) => z.startsWith("DESCRIPTION:"))!.slice("DESCRIPTION:".length),
  );
  pruefe(
    "Text überlebt Faltung und Maskierung unverändert",
    beschreibung.startsWith(registry.eintraege.get("events/wochenende")!.daten.kurzbeschreibung),
    beschreibung.slice(0, 90),
  );
  pruefe("keine zerschnittene UTF-8-Sequenz", !beschreibung.includes("\uFFFD") && beschreibung.includes("ä, ö und ü"));
}

{
  const abgesagt = icsKalender(
    buildRegistry([halle, ev("x", { durchfuehrung: "abgesagt" })]),
    [buildRegistry([halle, ev("x", { durchfuehrung: "abgesagt" })]).eintraege.get("events/x")!],
    "Test",
    STAMP,
  );
  pruefe("Absage wird als STATUS:CANCELLED übertragen", abgesagt.includes("STATUS:CANCELLED"));
}

{
  const reg = buildRegistry([
    halle,
    ev("ganztag", { ganztaegig: true, beginn: new Date("2027-07-02"), ende: new Date("2027-07-04") }),
  ]);
  const k = icsKalender(reg, [reg.eintraege.get("events/ganztag")!], "Test", STAMP);
  pruefe("Ganztägig als VALUE=DATE", k.includes("DTSTART;VALUE=DATE:20270702"), k.match(/DTSTART.*/)?.[0]);
  // RFC 5545: DTEND ist bei Ganztagsterminen exklusiv, also der Folgetag.
  pruefe("DTEND ist exklusiv (Folgetag)", k.includes("DTEND;VALUE=DATE:20270705"), k.match(/DTEND.*/)?.[0]);
}

{
  pruefe("Geokoordinaten werden übernommen", ics.includes("GEO:49.3;8.6"));
}

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

{
  const feed = eventFeed(registry);
  gleich("Anzahl stimmt", feed.anzahl, 1);
  pruefe("Lizenz ist deklariert", feed.lizenz.startsWith("https://"));
  const e = feed.events[0];
  pruefe("Datum als ISO 8601", /^\d{4}-\d{2}-\d{2}T/.test(e.beginn), e.beginn);
  gleich("Ort ist aufgelöst, nicht als Slug ausgegeben", e.ort?.ort, "Musterstadt");
  gleich("Line-up ohne eigene Seite bleibt als Name", e.lineup, ["Band Eins"]);
  pruefe("JSON ist serialisierbar", typeof JSON.stringify(feed) === "string");
}

/* ------------------------------------------------------------------ */
/* XML                                                                 */
/* ------------------------------------------------------------------ */

{
  const rss = rssFeed(registry);
  pruefe("RSS maskiert kaufmännisches Und", !/&(?!amp;|lt;|gt;|quot;)/.test(rss), "unmaskiertes & im Feed");
  pruefe("RSS deklariert sich selbst", rss.includes('rel="self"'));
}

{
  const xml = sitemapXml([{ pfad: "/a/", lastmod: "2026-01-01" }, { pfad: "/b/" }]);
  gleich("eine URL je Eintrag", (xml.match(/<url>/g) ?? []).length, 2);
  pruefe("lastmod nur wo vorhanden", (xml.match(/<lastmod>/g) ?? []).length === 1);
  pruefe("URLs sind absolut", !/<loc>\//.test(xml));

  const index = sitemapIndexXml(["/sitemap-events.xml"]);
  pruefe("Index verweist auf Teil-Sitemaps", index.includes("sitemap-events.xml"));
}

{
  const echte = buildRegistry(alsRegistryEingaben(ladeAlle()));
  const eintraege = sitemapFuerCollection(echte, "events");
  pruefe("Sitemap enthält die Übersichtsseite", eintraege.some((e) => e.pfad === "/events/"));
  // Auf einem frischen Klon ohne Inhalte gibt es keine Entitätsseiten —
  // dann ist eine Sitemap mit nur der Übersichtsseite das richtige Ergebnis.
  if (eintraege.length > 1) {
    pruefe("Sitemap enthält Entitätsseiten mit lastmod", eintraege.some((e) => e.pfad.startsWith("/events/") && e.lastmod));
  }
  pruefe("keine noindex-Einträge in der Sitemap", !eintraege.some((e) => echte.eintraege.get(`events/${e.pfad.split("/")[2]}`)?.daten.noindex));
}

/* ------------------------------------------------------------------ */
/* robots.txt und llms.txt                                             */
/* ------------------------------------------------------------------ */

{
  // Freigegebener Zustand: Crawler willkommen.
  const robots = robotsTxt(true);
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
    pruefe(`robots.txt erlaubt ${bot}`, robots.includes(`User-agent: ${bot}`));
  }
  pruefe("robots.txt nennt die Sitemap", /Sitemap: https:\/\/.*sitemap-index\.xml/.test(robots));
  pruefe("nichts wird pauschal gesperrt", !/^Disallow: \/$/m.test(robots));

  // Aufbaumodus: konsequent dicht. Ein halb gefülltes Register indexiert zu
  // bekommen ist teurer, als ein paar Wochen später zu starten.
  const aufbau = robotsTxt(false);
  pruefe("Aufbaumodus sperrt alles", /^Disallow: \/$/m.test(aufbau), aufbau);
  pruefe("Aufbaumodus nennt keine Sitemap", !aufbau.includes("Sitemap:"), aufbau);
}

{
  const txt = llmsTxt(registry);
  pruefe("beginnt mit H1", txt.startsWith("# "));
  pruefe("Leerzeile nach der Überschrift", txt.split("\n")[1] === "");
  pruefe("Zusammenfassung als Blockzitat", txt.includes("\n> "));
  pruefe("Feeds stehen vor den Inhalten", txt.indexOf("Maschinenlesbare Daten") < txt.indexOf("## Veranstaltungen"));
  pruefe("Links sind absolut", !/\]\(\//.test(txt));
}

/* ------------------------------------------------------------------ */
/* Konfiguration in beiden Laufzeiten                                  */
/* ------------------------------------------------------------------ */

{
  // Regression: site.config.ts wird von Astro (Vite) UND von jedem Skript
  // in scripts/ importiert. Ein direkter import.meta.env-Zugriff bricht die
  // Node-Seite komplett — dieselbe Falle wie einst bei facetten.ts. Dass
  // diese Datei hier überhaupt läuft, beweist die Node-Hälfte; robotsTxt()
  // beweist, dass der Schalter dabei ausgewertet wird.
  const roh = readFileSync(new URL("../src/site.config.ts", import.meta.url), "utf8");
  pruefe(
    "site.config greift nicht ungeschützt auf import.meta.env zu",
    !/import\.meta\.env\./.test(roh),
    "direkter import.meta.env-Zugriff bricht alle Node-Skripte",
  );
  pruefe("robots.txt reagiert auf den Indexierungsschalter", typeof robotsTxt() === "string");
}

/* ------------------------------------------------------------------ */
/* JSON-LD-Einbettung                                                  */
/* ------------------------------------------------------------------ */

{
  // Regression zu einem Review-Befund: JSON.stringify maskiert "<" nicht.
  // Ein "</script>" im Inhalt beendet sonst das Script-Element mitten im
  // Graphen — der Rest würde als HTML interpretiert.
  const eingebettet = jsonldSicher({ text: 'böse: </script><img src=x onerror=alert(1)>' });
  pruefe("kein </script> im eingebetteten JSON-LD", !eingebettet.includes("</script>"), eingebettet);
  pruefe("kein rohes < im eingebetteten JSON-LD", !eingebettet.includes("<"), eingebettet);
  gleich("Maskierung ist verlustfrei", JSON.parse(eingebettet).text, 'böse: </script><img src=x onerror=alert(1)>');
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
