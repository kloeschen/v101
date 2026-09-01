/**
 * Maschinenschnittstellen.
 *
 * Der strategische Punkt dahinter: llms.txt wird von den großen KI-Crawlern
 * derzeit praktisch nicht abgerufen — sie holen HTML. Was Agenten und
 * Nachnutzer dagegen wirklich verwerten können, sind saubere, dokumentierte
 * Feeds. Wer die Daten nachnutzt, nennt die Quelle, und genau daraus entsteht
 * die verteilte Erwähnung, die Entitätsautorität trägt.
 *
 * Deshalb liegt hier der Schwerpunkt auf JSON, ICS und RSS. llms.txt wird
 * trotzdem erzeugt: kostet nichts und ist billige Optionalität, falls sich
 * die Lage ändert.
 */

import { site, indexierbar } from "../site.config";
import type { EintragMeta, Registry } from "./links";
import { urlPrefix, type CollectionName } from "../content/_schemas";

const absolut = (pfad: string) => `${site.url}${pfad}`;

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

export interface EventFeedEintrag {
  slug: string;
  url: string;
  name: string;
  beschreibung: string;
  typ: string;
  beginn: string;
  ende?: string;
  status: string;
  ort: { name: string; ort?: string; land?: string; url?: string } | null;
  region: { name: string; url: string } | null;
  lineup: string[];
  eintrittFrei: boolean;
  preise: { bezeichnung: string; betrag: number; waehrung: string }[];
  ticketUrl?: string;
  website?: string;
  geprueftAm: string;
}

/**
 * Das Eventregister als JSON.
 * Bewusst flach und ohne interne Feldnamen, die sich noch ändern können —
 * eine öffentliche Schnittstelle ist ein Versprechen.
 */
export function eventFeed(registry: Registry): {
  name: string;
  url: string;
  lizenz: string;
  erzeugtAm: string;
  anzahl: number;
  events: EventFeedEintrag[];
} {
  const events = [...registry.eintraege.values()]
    .filter((e) => e.collection === "events")
    .sort((a, b) => +new Date(a.daten.beginn) - +new Date(b.daten.beginn))
    .map((e): EventFeedEintrag => {
      const ort = registry.eintraege.get(`locations/${e.daten.ort}`);
      const region = e.daten.region ? registry.eintraege.get(`regionen/${e.daten.region}`) : undefined;
      return {
        slug: e.slug,
        url: e.url,
        name: e.name,
        beschreibung: e.daten.kurzbeschreibung,
        typ: e.daten.typ,
        beginn: new Date(e.daten.beginn).toISOString(),
        ende: e.daten.ende ? new Date(e.daten.ende).toISOString() : undefined,
        status: e.daten.durchfuehrung,
        ort: ort
          ? { name: ort.name, ort: ort.daten.adresse?.ort, land: ort.daten.adresse?.land, url: ort.url }
          : null,
        region: region ? { name: region.name, url: region.url } : null,
        lineup: [
          ...(e.daten.lineupBands ?? []).map((s: string) => registry.eintraege.get(`bands/${s}`)?.name ?? s),
          ...(e.daten.lineupWeitere ?? []),
        ],
        eintrittFrei: e.daten.eintrittFrei ?? false,
        preise: (e.daten.preise ?? []).map((p: any) => ({
          bezeichnung: p.bezeichnung,
          betrag: p.betrag,
          waehrung: p.waehrung,
        })),
        ticketUrl: e.daten.ticketUrl,
        website: e.daten.links?.website,
        geprueftAm: new Date(e.daten.geprueftAm).toISOString().slice(0, 10),
      };
    });

  return {
    name: `Eventregister — ${site.name}`,
    url: absolut("/daten/"),
    lizenz: site.datenLizenz,
    erzeugtAm: new Date().toISOString(),
    anzahl: events.length,
    events,
  };
}

/* ------------------------------------------------------------------ */
/* iCalendar                                                           */
/* ------------------------------------------------------------------ */

/** TEXT-Werte nach RFC 5545: Backslash, Semikolon, Komma, Zeilenumbruch. */
function icsText(wert = ""): string {
  return wert
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Zeilen auf 75 Oktette falten (RFC 5545, 3.1).
 * Gefaltet wird nach Bytes, nicht nach Zeichen — sonst zerreißt ein Umlaut
 * mitten in seiner UTF-8-Sequenz und der Kalender zeigt Kauderwelsch.
 */
function falte(zeile: string): string {
  const bytes = Buffer.from(zeile, "utf8");
  if (bytes.length <= 75) return zeile;

  const teile: string[] = [];
  let start = 0;
  let grenze = 75;
  while (start < bytes.length) {
    let ende = Math.min(start + grenze, bytes.length);
    // Nicht mitten in eine Mehrbyte-Sequenz schneiden.
    while (ende > start && ende < bytes.length && (bytes[ende] & 0b1100_0000) === 0b1000_0000) ende--;
    teile.push(bytes.subarray(start, ende).toString("utf8"));
    start = ende;
    grenze = 74; // Folgezeilen tragen ein führendes Leerzeichen.
  }
  return teile.join("\r\n ");
}

const icsZeit = (d: Date) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsDatum = (d: Date) => new Date(d).toISOString().slice(0, 10).replace(/-/g, "");

/** durchfuehrung → iCalendar STATUS. */
const ICS_STATUS: Record<string, string> = {
  geplant: "CONFIRMED",
  ausverkauft: "CONFIRMED",
  stattgefunden: "CONFIRMED",
  verschoben: "TENTATIVE",
  abgesagt: "CANCELLED",
};

export function icsKalender(
  registry: Registry,
  events: EintragMeta[],
  titel: string,
  erzeugtAm = new Date(),
): string {
  const zeilen: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${icsText(site.name)}//DE`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsText(titel)}`,
    `X-WR-TIMEZONE:${site.zeitzone}`,
  ];

  for (const e of events) {
    const d = e.daten;
    const ort = registry.eintraege.get(`locations/${d.ort}`);
    const ortText = ort
      ? [ort.name, ort.daten.adresse?.strasse, [ort.daten.adresse?.plz, ort.daten.adresse?.ort].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ")
      : undefined;

    zeilen.push(
      "BEGIN:VEVENT",
      `UID:${e.slug}@${new URL(site.url).host}`,
      `DTSTAMP:${icsZeit(erzeugtAm)}`,
      d.ganztaegig
        ? `DTSTART;VALUE=DATE:${icsDatum(d.beginn)}`
        : `DTSTART:${icsZeit(d.beginn)}`,
      ...(d.ende
        ? [d.ganztaegig ? `DTEND;VALUE=DATE:${icsDatum(tagDanach(d.ende))}` : `DTEND:${icsZeit(d.ende)}`]
        : []),
      `SUMMARY:${icsText(e.name)}`,
      `DESCRIPTION:${icsText(`${d.kurzbeschreibung}\n\n${e.url}`)}`,
      `URL:${e.url}`,
      `STATUS:${ICS_STATUS[d.durchfuehrung] ?? "CONFIRMED"}`,
      ...(ortText ? [`LOCATION:${icsText(ortText)}`] : []),
      ...(ort?.daten.adresse?.lat !== undefined && ort?.daten.adresse?.lng !== undefined
        ? [`GEO:${ort.daten.adresse.lat};${ort.daten.adresse.lng}`]
        : []),
      "END:VEVENT",
    );
  }

  zeilen.push("END:VCALENDAR");
  // Ganztägige Termine enden im ICS am Folgetag — deshalb tagDanach().
  return zeilen.map(falte).join("\r\n") + "\r\n";
}

function tagDanach(d: Date | string): Date {
  const n = new Date(d);
  n.setUTCDate(n.getUTCDate() + 1);
  return n;
}

/* ------------------------------------------------------------------ */
/* RSS                                                                 */
/* ------------------------------------------------------------------ */

function xmlText(wert = ""): string {
  return wert
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function rssFeed(registry: Registry, limit = 50): string {
  const eintraege = [...registry.eintraege.values()]
    .map((e) => ({ e, datum: new Date(e.daten.veroeffentlichtAm ?? e.daten.erstelltAm) }))
    .filter((x) => !Number.isNaN(x.datum.getTime()))
    .sort((a, b) => +b.datum - +a.datum)
    .slice(0, limit);

  const items = eintraege
    .map(
      ({ e, datum }) => `    <item>
      <title>${xmlText(e.name)}</title>
      <link>${e.url}</link>
      <guid isPermaLink="true">${e.url}</guid>
      <pubDate>${datum.toUTCString()}</pubDate>
      <description>${xmlText(e.kurzbeschreibung ?? "")}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlText(site.name)}</title>
    <link>${site.url}/</link>
    <description>${xmlText(site.kurzbeschreibung)}</description>
    <language>de-de</language>
    <atom:link href="${absolut("/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

/* ------------------------------------------------------------------ */
/* Sitemaps                                                            */
/* ------------------------------------------------------------------ */

export interface SitemapEintrag {
  pfad: string;
  lastmod?: string;
}

export function sitemapXml(eintraege: SitemapEintrag[]): string {
  const urls = eintraege
    .map(
      (e) => `  <url>
    <loc>${absolut(e.pfad)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function sitemapIndexXml(dateien: string[]): string {
  const eintraege = dateien
    .map((d) => `  <sitemap>\n    <loc>${absolut(d)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${eintraege}
</sitemapindex>
`;
}

/** Entitätsseiten einer Collection, nach Sammlung getrennt ausgeliefert. */
export function sitemapFuerCollection(registry: Registry, collection: CollectionName): SitemapEintrag[] {
  return [
    { pfad: `${urlPrefix[collection]}/` },
    ...[...registry.eintraege.values()]
      .filter((e) => e.collection === collection && !e.daten.noindex)
      .map((e) => ({
        pfad: e.pfad,
        lastmod: new Date(e.daten.geaendertAm ?? e.daten.geprueftAm).toISOString().slice(0, 10),
      })),
  ];
}

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

/**
 * Bei einem Community-Register, das von Sichtbarkeit lebt, ist Blocken die
 * falsche Entscheidung — wer nicht gecrawlt wird, wird nicht zitiert.
 */
const KI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot",
  "meta-externalagent", "Amazonbot", "cohere-ai",
];

/**
 * @param freigegeben Überschreibt den globalen Schalter — nur für Tests, die
 * beide Zustände prüfen müssen; im Betrieb entscheidet die Umgebung.
 */
export function robotsTxt(freigegeben = indexierbar): string {
  // Im Aufbaumodus konsequent dicht: Ein halbfertiges Register indexiert zu
  // bekommen ist teurer, als ein paar Wochen später zu starten.
  if (!freigegeben) {
    return [
      "# Aufbaumodus — die Site ist noch nicht freigegeben.",
      "User-agent: *",
      "Disallow: /",
      "",
    ].join("\n");
  }

  return [
    "# Dieses Register lebt von Sichtbarkeit. KI-Crawler sind ausdrücklich willkommen.",
    "# Datenlizenz und maschinenlesbare Feeds: " + absolut("/daten/"),
    "",
    ...KI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${absolut("/sitemap-index.xml")}`,
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* llms.txt                                                            */
/* ------------------------------------------------------------------ */

/**
 * Kuratierter Einstiegsindex.
 *
 * Bewusst eine Auswahl, kein Volldump: Der Sinn des Formats ist ein knapper
 * Wegweiser. Wer alles will, nimmt die Feeds — die stehen deshalb oben.
 */
export function llmsTxt(registry: Registry, proSammlung = 25): string {
  const zeile = (e: EintragMeta) =>
    `- [${e.name}](${e.url})${e.kurzbeschreibung ? `: ${einzeilig(e.kurzbeschreibung)}` : ""}`;

  const abschnitt = (collection: CollectionName, titel: string) => {
    const eintraege = [...registry.eintraege.values()]
      .filter((e) => e.collection === collection)
      .sort((a, b) => a.name.localeCompare(b.name, "de"))
      .slice(0, proSammlung);
    if (eintraege.length === 0) return "";
    return `## ${titel}\n\n${eintraege.map(zeile).join("\n")}\n`;
  };

  const kopf = [
    `# ${site.name}`,
    "",
    `> ${einzeilig(site.kurzbeschreibung)}`,
    "",
    "## Maschinenlesbare Daten",
    "",
    `- [Eventregister als JSON](${absolut("/api/events.json")}): Alle erfassten Veranstaltungen mit Ort, Line-up und Preisen.`,
    `- [Kalenderabo aller Termine](${absolut("/kalender/alle.ics")}): iCalendar-Feed zum Abonnieren.`,
    `- [Neuigkeiten als RSS](${absolut("/rss.xml")}): Zuletzt erfasste und aktualisierte Einträge.`,
    `- [Datenlizenz und Nutzungshinweise](${absolut("/daten/")}): ${site.datenLizenz}`,
  ].join("\n");

  // Leere Abschnitte fallen weg — aber die Leerzeilen des Kopfs dürfen es
  // nicht, deshalb wird der Kopf getrennt zusammengesetzt.
  const abschnitte = [
    abschnitt("artikel", "Erklärartikel"),
    abschnitt("lexikon", "Lexikon"),
    abschnitt("regionen", "Regionen"),
    abschnitt("events", "Veranstaltungen"),
    abschnitt("bands", "Bands"),
  ].filter(Boolean);

  return [kopf, ...abschnitte].join("\n\n");
}

function einzeilig(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
