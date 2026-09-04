/**
 * Einstiegspunkt: aus einem validierten Frontmatter wird ein @graph.
 *
 * Verwendung in einem Astro-Layout:
 *
 *   const graph = buildGraph("events", entry.id, entry.data);
 *   <script type="application/ld+json" set:html={JSON.stringify(graph)} />
 */

import {
  organisationsKnoten,
  websiteKnoten,
  webseitenKnoten,
  breadcrumbKnoten,
  bildKnoten,
  faqKnoten,
  personKnoten,
  saeubern,
  type Knoten,
  type SeitenKontext,
} from "./shared";
import { builders } from "./builders";
import { site } from "../../site.config";
import type { CollectionName } from "../../content/_schemas";

export * from "./shared";

/**
 * Graph sicher in ein <script type="application/ld+json"> einbetten.
 *
 * JSON.stringify maskiert "<" nicht. Ein "</script>" in einer
 * Kurzbeschreibung — und die schreiben Recherche-Agenten — beendet sonst das
 * Script-Element mitten im JSON, und der Rest des Strings wird als HTML
 * interpretiert. Deshalb NIE JSON.stringify direkt in set:html geben,
 * sondern immer diese Funktion.
 */
export function jsonldSicher(graph: unknown): string {
  return JSON.stringify(graph)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
export { builders } from "./builders";

export function buildGraph(collection: CollectionName, slug: string, daten: any) {
  const builder = builders[collection];

  const ctx: SeitenKontext = {
    collection,
    slug,
    titel: daten.name,
    beschreibung: daten.kurzbeschreibung,
    veroeffentlicht: daten.veroeffentlichtAm ?? daten.erstelltAm,
    geaendert: daten.geaendertAm ?? daten.geprueftAm,
    autor: daten.autor,
    breadcrumb: [{ name: "Start", url: `${site.url}/` }, ...builder.breadcrumb(daten, slug)],
    bild: daten.bilder?.[0],
  };

  const knoten: (Knoten | undefined)[] = [
    organisationsKnoten(),
    websiteKnoten(),
    webseitenKnoten(ctx),
    breadcrumbKnoten(ctx),
    bildKnoten(ctx),
    personKnoten(daten.autor),
    builder.entitaet(daten, slug),
    ...(builder.zusatz?.(daten, slug, ctx) ?? []),
    faqKnoten(ctx, daten.faq),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": knoten.filter((k): k is Knoten => k !== undefined).map((k) => saeubern(k)),
  };
}

/**
 * Graph für Übersichts- und Facettenseiten.
 *
 * `ItemList` mit `url`-Einträgen statt eingebetteter Knoten: Die Entitäten
 * sind auf ihren eigenen Seiten vollständig beschrieben, hier wären sie
 * Duplikate. Die Liste sagt nur, was zusammengehört und in welcher Reihenfolge.
 */
export function buildListenGraph(optionen: {
  pfad: string;
  titel: string;
  beschreibung: string;
  eintraege: { name: string; pfad: string }[];
  breadcrumb: { name: string; url?: string }[];
}) {
  const url = `${site.url}${optionen.pfad}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organisationsKnoten(),
      websiteKnoten(),
      saeubern({
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: optionen.titel,
        description: optionen.beschreibung,
        inLanguage: site.sprache,
        isPartOf: { "@id": `${site.url}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#liste` },
      }),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: optionen.breadcrumb.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          ...(b.url ? { item: b.url } : {}),
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#liste`,
        name: optionen.titel,
        numberOfItems: optionen.eintraege.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: optionen.eintraege.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.name,
          url: `${site.url}${e.pfad}`,
        })),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Content Parity                                                      */
/* ------------------------------------------------------------------ */

/**
 * Welche Frontmatter-Felder rendert der sichtbare Faktenblock?
 *
 * Diese Liste ist die andere Hälfte des Paritätsvertrags: Jedes Feld, das
 * ein Builder in `verwendeteFelder` deklariert, muss hier auftauchen —
 * sonst behauptet das JSON-LD etwas, das auf der Seite nicht steht.
 *
 * Die Layouts sollten diese Liste importieren und den Faktenblock daraus
 * generieren, statt Felder von Hand auszugeben. Dann kann die Parität
 * nicht auseinanderlaufen.
 */
export const faktenblockFelder: Record<CollectionName, string[]> = {
  events: [
    "name", "kurzbeschreibung", "typ", "beginn", "ende", "ort", "region",
    "veranstalter", "veranstalterUrl", "lineupBands", "lineupWeitere", "djs",
    "preise", "ticketUrl", "eintritt", "kapazitaet", "camping",
    "barrierefrei", "kinder", "drinnenDraussen", "genres", "durchfuehrung",
    "durchfuehrungHinweis", "reihe", "reiheName", "ausgabe", "letzteAusgabe", "links",
  ],
  bands: [
    "name", "kurzbeschreibung", "typ", "gegruendet", "aufgeloest", "aktiv",
    "herkunftOrt", "herkunftLand", "region", "genres", "besetzung",
    "veroeffentlichungen", "label", "einstieg", "aehnlicheBands", "links",
  ],
  locations: [
    "name", "kurzbeschreibung", "typ", "adresse", "region", "kapazitaet",
    "tanzflaeche", "barrierefrei", "parken", "oepnv", "aktiv", "links",
  ],
  regionen: ["name", "kurzbeschreibung", "ebene", "land", "uebergeordnet", "schwerpunkt", "links"],
  lexikon: [
    "name", "definition", "kategorie", "bezeichnungDe", "bezeichnungEn",
    "uebergeordnet", "verwandt", "aeraVon", "aeraBis", "herkunftsland",
    "abgrenzung", "links",
  ],
  artikel: [
    "name", "kurzbeschreibung", "typ", "saeule", "hauptentitaet",
    "erwaehnteBegriffe", "gehoertZu", "howto", "veroeffentlichtAm",
    "geaendertAm", "autor",
  ],
};
