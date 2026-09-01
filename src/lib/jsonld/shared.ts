/**
 * Gemeinsame Bausteine für alle JSON-LD-Generatoren.
 *
 * Zwei Regeln, die hier technisch durchgesetzt werden:
 *  1. @id liegt IMMER auf der eigenen Domain. Wikidata und Wikipedia
 *     gehören ausschließlich in sameAs.
 *  2. Beziehungen zwischen Knoten sind Referenzen ({"@id": …}), keine
 *     eingebetteten Duplikate. Ein Knoten wird genau einmal definiert.
 */

import { site, siteIds } from "../../site.config";
import { urlPrefix, type CollectionName } from "../../content/_schemas";

export type Knoten = Record<string, any>;
export type Ref = { "@id": string };

/* ------------------------------------------------------------------ */
/* IDs und URLs                                                        */
/* ------------------------------------------------------------------ */

/** Kanonische Seiten-URL einer Entität, immer mit Slash am Ende. */
export function seitenUrl(collection: CollectionName, slug: string): string {
  return `${site.url}${urlPrefix[collection]}/${slug}/`;
}

/** Fragment-Anker je Collection. Stabil — Änderungen brechen den Graph. */
const fragment: Record<CollectionName, string> = {
  events: "event",
  bands: "band",
  locations: "place",
  regionen: "region",
  lexikon: "term",
  artikel: "article",
};

export function entitaetsId(collection: CollectionName, slug: string): string {
  return `${seitenUrl(collection, slug)}#${fragment[collection]}`;
}

export function ref(collection: CollectionName, slug: string): Ref {
  return { "@id": entitaetsId(collection, slug) };
}

export function refs(collection: CollectionName, slugs: string[] = []): Ref[] {
  return slugs.map((s) => ref(collection, s));
}

export function autorId(slug: string): string {
  return `${site.url}/autoren/${slug}/#person`;
}

/** Relative Pfade absolut machen. Externe URLs bleiben unangetastet. */
export function absolut(pfad?: string): string | undefined {
  if (!pfad) return undefined;
  if (/^https?:\/\//.test(pfad)) return pfad;
  return `${site.url}${pfad.startsWith("/") ? "" : "/"}${pfad}`;
}

/* ------------------------------------------------------------------ */
/* Aufräumen                                                           */
/* ------------------------------------------------------------------ */

/**
 * Entfernt undefined, null, leere Strings und leere Arrays rekursiv.
 * Ein leeres Feld im JSON-LD ist schlechter als gar keins: Es signalisiert
 * eine Aussage, die nicht getroffen wird.
 */
export function saeubern<T>(wert: T): T {
  if (Array.isArray(wert)) {
    const arr = wert.map(saeubern).filter((v) => v !== undefined);
    return (arr.length ? arr : undefined) as unknown as T;
  }
  if (wert && typeof wert === "object" && !(wert instanceof Date)) {
    const aus: Record<string, any> = {};
    for (const [k, v] of Object.entries(wert as Record<string, any>)) {
      const s = saeubern(v);
      if (s !== undefined && s !== null && s !== "") aus[k] = s;
    }
    return (Object.keys(aus).length ? aus : undefined) as unknown as T;
  }
  return wert;
}

/**
 * Date → ISO 8601.
 *
 * Mit Uhrzeit wird bewusst Ortszeit mit Offset ausgegeben
 * ("2026-05-22T18:00:00+02:00") statt UTC: Ein Event beginnt um 18 Uhr vor
 * Ort, und genau so soll es in Suchergebnissen erscheinen. `toISOString()`
 * würde daraus 16:00Z machen — technisch dieselbe Zeit, aber schlechter
 * lesbar und fehleranfälliger bei der Weiterverarbeitung.
 */
export function isoDatum(d?: Date | string, mitZeit = false): string | undefined {
  if (!d) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return undefined;
  if (!mitZeit) return ortsDatumsteile(dt).datum;
  const { datum, zeit, offset } = ortsDatumsteile(dt);
  return `${datum}T${zeit}${offset}`;
}

function ortsDatumsteile(dt: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: site.zeitzone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23", timeZoneName: "longOffset",
  });
  const teile = Object.fromEntries(fmt.formatToParts(dt).map((p) => [p.type, p.value]));
  const roh = teile.timeZoneName ?? "GMT+00:00"; // z. B. "GMT+02:00"
  const offset = roh.replace("GMT", "") || "+00:00";
  return {
    datum: `${teile.year}-${teile.month}-${teile.day}`,
    zeit: `${teile.hour}:${teile.minute}:${teile.second}`,
    offset: offset === "" ? "Z" : offset,
  };
}

/* ------------------------------------------------------------------ */
/* sameAs                                                              */
/* ------------------------------------------------------------------ */

/**
 * Baut sameAs aus dem links-Objekt.
 * Die Wikidata-ID wird zur vollständigen URL expandiert.
 */
export function sameAs(links: Record<string, string | undefined> = {}): string[] {
  const { wikidata, ...rest } = links;
  const liste = [
    wikidata ? `https://www.wikidata.org/wiki/${wikidata}` : undefined,
    // Die offizielle Seite gehört bei fremden Entitäten in sameAs: `url`
    // ist bei uns die eigene Seite über die Entität, nicht die Entität
    // selbst. Für die Identitätsauflösung ist die offizielle Domain das
    // stärkste Signal, das wir haben.
    ...Object.values(rest),
  ].filter((u): u is string => typeof u === "string" && u.startsWith("https://"));
  return [...new Set(liste)];
}

/* ------------------------------------------------------------------ */
/* Wiederkehrende Knoten                                               */
/* ------------------------------------------------------------------ */

export function organisationsKnoten(): Knoten {
  return saeubern({
    "@type": "Organization",
    "@id": siteIds.organization,
    name: site.name,
    url: `${site.url}/`,
    description: site.kurzbeschreibung,
    logo: absolut(site.logo),
    foundingDate: site.gegruendet,
    sameAs: site.sameAs,
  });
}

export function websiteKnoten(): Knoten {
  return saeubern({
    "@type": "WebSite",
    "@id": siteIds.website,
    name: site.name,
    url: `${site.url}/`,
    inLanguage: site.sprache,
    publisher: { "@id": siteIds.organization },
  });
}

export interface SeitenKontext {
  collection: CollectionName;
  slug: string;
  titel: string;
  beschreibung: string;
  veroeffentlicht?: Date | string;
  geaendert?: Date | string;
  autor?: string;
  breadcrumb: { name: string; url?: string }[];
  bild?: { src: string; alt: string; urheber: string };
}

export function webseitenKnoten(ctx: SeitenKontext): Knoten {
  const url = seitenUrl(ctx.collection, ctx.slug);
  return saeubern({
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: ctx.titel,
    description: ctx.beschreibung,
    inLanguage: site.sprache,
    isPartOf: { "@id": siteIds.website },
    about: { "@id": entitaetsId(ctx.collection, ctx.slug) },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    datePublished: isoDatum(ctx.veroeffentlicht),
    dateModified: isoDatum(ctx.geaendert ?? ctx.veroeffentlicht),
    primaryImageOfPage: ctx.bild ? { "@id": `${url}#primaryimage` } : undefined,
  });
}

export function breadcrumbKnoten(ctx: SeitenKontext): Knoten {
  const url = seitenUrl(ctx.collection, ctx.slug);
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: ctx.breadcrumb.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      ...(b.url ? { item: b.url } : {}),
    })),
  };
}

export function bildKnoten(ctx: SeitenKontext): Knoten | undefined {
  if (!ctx.bild) return undefined;
  const url = seitenUrl(ctx.collection, ctx.slug);
  return saeubern({
    "@type": "ImageObject",
    "@id": `${url}#primaryimage`,
    url: absolut(ctx.bild.src),
    contentUrl: absolut(ctx.bild.src),
    caption: ctx.bild.alt,
    creditText: ctx.bild.urheber,
  });
}

export function faqKnoten(
  ctx: SeitenKontext,
  faq: { frage: string; antwort: string }[] = [],
): Knoten | undefined {
  if (faq.length === 0) return undefined;
  const url = seitenUrl(ctx.collection, ctx.slug);
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faq.map((f, i) => ({
      "@type": "Question",
      "@id": `${url}#frage-${i + 1}`,
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: f.antwort },
    })),
  };
}

export function personKnoten(slug?: string): Knoten | undefined {
  if (!slug) return undefined;
  // Nur @id, noch keine url: Die Autorenseiten existieren noch nicht, und
  // eine deklarierte URL, die 404 liefert, ist schlechter als keine. Sobald
  // die Autoren-Collection steht, kommen url, name und sameAs dazu.
  return {
    "@type": "Person",
    "@id": autorId(slug),
  };
}

/* ------------------------------------------------------------------ */
/* Mappings                                                            */
/* ------------------------------------------------------------------ */

/** durchfuehrung → schema.org eventStatus. */
export const eventStatusMap: Record<string, string> = {
  geplant: "https://schema.org/EventScheduled",
  abgesagt: "https://schema.org/EventCancelled",
  verschoben: "https://schema.org/EventPostponed",
  ausverkauft: "https://schema.org/EventScheduled",
  stattgefunden: "https://schema.org/EventScheduled",
};

/** Konkreter Typ schlägt generischen — AI-Systeme gewichten Spezifität. */
export const eventTypMap: Record<string, string> = {
  weekender: "Festival",
  festival: "Festival",
  konzert: "MusicEvent",
  convention: "Festival",
  carshow: "Event",
  markt: "Event",
  tanzabend: "DanceEvent",
  workshop: "EducationEvent",
  stammtisch: "SocialEvent",
};

export const locationTypMap: Record<string, string> = {
  halle: "MusicVenue",
  club: "MusicVenue",
  kneipe: "BarOrPub",
  freigelaende: "Place",
  campingplatz: "Campground",
  gemeindehaus: "CivicStructure",
  museum: "Museum",
  tanzschule: "Place",
  sonstiges: "Place",
};

export const regionEbeneMap: Record<string, string> = {
  land: "Country",
  bundesland: "AdministrativeArea",
  metropolregion: "AdministrativeArea",
  stadt: "City",
};

export function adressKnoten(a: any): Knoten | undefined {
  if (!a) return undefined;
  return saeubern({
    "@type": "PostalAddress",
    streetAddress: a.strasse,
    postalCode: a.plz,
    addressLocality: a.ort,
    addressCountry: a.land,
  });
}

export function geoKnoten(lat?: number, lng?: number): Knoten | undefined {
  if (lat === undefined || lng === undefined) return undefined;
  return { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
}
