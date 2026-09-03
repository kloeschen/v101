/**
 * Ein Builder pro Entitätstyp.
 *
 * `verwendeteFelder` ist nicht Dokumentation, sondern Vertrag: Der
 * Paritätsprüfer in scripts/check-jsonld.ts vergleicht diese Liste gegen die
 * Felder, die der Faktenblock sichtbar rendert. Ein Fakt, der nur im JSON-LD
 * steht und nicht auf der Seite, ist eine Behauptung gegenüber Maschinen, die
 * der Mensch nicht überprüfen kann — und genau das will Content Parity
 * verhindern. Wer hier ein Feld ergänzt, muss es auch im Faktenblock zeigen.
 */

import {
  type Knoten,
  type SeitenKontext,
  ref,
  refs,
  entitaetsId,
  seitenUrl,
  sameAs,
  saeubern,
  isoDatum,
  adressKnoten,
  geoKnoten,
  eventStatusMap,
  eventTypMap,
  locationTypMap,
  regionEbeneMap,
  autorId,
} from "./shared";
import { site, siteIds } from "../../site.config";
import { eventVorbei } from "../datum";
import type { CollectionName } from "../../content/_schemas";

export interface Builder {
  verwendeteFelder: string[];
  /** Der Hauptknoten der Entität. */
  entitaet(d: any, slug: string): Knoten;
  /** Zusätzliche Knoten, z. B. Article-Wrapper oder HowTo. */
  zusatz?(d: any, slug: string, ctx: SeitenKontext): Knoten[];
  /** Brotkrumenpfad ohne die Startseite — die setzt buildGraph. */
  breadcrumb(d: any, slug: string): { name: string; url?: string }[];
}

/* ------------------------------------------------------------------ */
/* Events                                                             */
/* ------------------------------------------------------------------ */

export const eventBuilder: Builder = {
  verwendeteFelder: [
    "name", "kurzbeschreibung", "typ", "beginn", "ende", "ort", "region",
    "veranstalter", "veranstalterUrl", "lineupBands", "lineupWeitere",
    "preise", "ticketUrl", "eintrittFrei", "kapazitaet", "genres",
    "durchfuehrung", "reihe", "reiheName", "links",
  ],

  entitaet(d, slug) {
    const url = seitenUrl("events", slug);
    // Tagesgenau, nicht zeitstempelgenau: Ein Konzert heute Abend ist am
    // Vormittag nicht OutOfStock (M9, siehe lib/datum.ts).
    const vorbei = eventVorbei(d);

    const angebote = d.eintrittFrei
      ? undefined
      : (d.preise ?? []).map((p: any) =>
          saeubern({
            "@type": "Offer",
            name: p.bezeichnung,
            price: String(p.betrag),
            priceCurrency: p.waehrung,
            url: d.ticketUrl,
            validThrough: isoDatum(p.gueltigBis),
            // SoldOut nur, wenn es wirklich ausverkauft war. Für vergangene
            // Termine OutOfStock — das behauptet nichts über den Grund.
            availability:
              d.durchfuehrung === "ausverkauft"
                ? "https://schema.org/SoldOut"
                : vorbei
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
          }),
        );

    return saeubern({
      "@type": eventTypMap[d.typ] ?? "Event",
      "@id": entitaetsId("events", slug),
      name: d.name,
      alternateName: d.aliases,
      description: d.kurzbeschreibung,
      url,
      startDate: isoDatum(d.beginn, !d.ganztaegig),
      endDate: isoDatum(d.ende, !d.ganztaegig),
      eventStatus: eventStatusMap[d.durchfuehrung],
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: ref("locations", d.ort),
      // Bands mit eigener Seite als Referenz, der Rest als benannte Gruppe:
      // beides ist wahr, nur unterschiedlich tief modelliert.
      performer: [
        ...refs("bands", d.lineupBands),
        ...(d.lineupWeitere ?? []).map((n: string) => ({ "@type": "MusicGroup", name: n })),
      ],
      organizer: d.veranstalter
        ? saeubern({ "@type": "Organization", name: d.veranstalter, url: d.veranstalterUrl })
        : undefined,
      isAccessibleForFree: d.eintrittFrei,
      offers: angebote,
      maximumAttendeeCapacity: d.kapazitaet,
      about: refs("lexikon", d.genres),
      // Vollständiger Knoten statt bloßer Referenz: die Reihenseite unter
      // /events/reihe/{slug}/ wird aus allen Ausgaben generiert, hat also
      // keine eigene Content-Datei, auf die eine Referenz zeigen könnte.
      superEvent: d.reihe
        ? {
            "@type": "EventSeries",
            "@id": `${site.url}/events/reihe/${d.reihe}/#series`,
            name: d.reiheName,
            url: `${site.url}/events/reihe/${d.reihe}/`,
          }
        : undefined,
      sameAs: sameAs(d.links),
    });
  },

  breadcrumb(d, slug) {
    return [
      { name: "Events", url: `${site.url}/events/` },
      { name: d.name, url: seitenUrl("events", slug) },
    ];
  },
};

/* ------------------------------------------------------------------ */
/* Bands                                                              */
/* ------------------------------------------------------------------ */

export const bandBuilder: Builder = {
  verwendeteFelder: [
    "name", "kurzbeschreibung", "typ", "gegruendet", "aufgeloest",
    "herkunftOrt", "herkunftLand", "genres", "besetzung",
    "veroeffentlichungen", "label", "links",
  ],

  entitaet(d, slug) {
    // Auch Solokünstler und DJs sind MusicGroup: schema.org definiert den
    // Typ ausdrücklich einschließlich Einzelmusiker. Die Alternative Person
    // wäre falsch verdrahtet — Person kennt kein genre, und genau diese
    // Kante trägt die Verbindung ins Lexikon.
    return saeubern({
      "@type": "MusicGroup",
      "@id": entitaetsId("bands", slug),
      name: d.name,
      alternateName: d.aliases,
      description: d.kurzbeschreibung,
      url: seitenUrl("bands", slug),
      foundingDate: d.gegruendet ? String(d.gegruendet) : undefined,
      dissolutionDate: d.aufgeloest ? String(d.aufgeloest) : undefined,
      foundingLocation: d.herkunftOrt
        ? { "@type": "Place", name: d.herkunftOrt, address: adressKnoten({ ort: d.herkunftOrt, land: d.herkunftLand }) }
        : undefined,
      member: (d.besetzung ?? [])
        .filter((m: any) => m.aktuell !== false)
        .map((m: any) => ({ "@type": "Person", name: m.name })),
      // genre nimmt Text oder URL — die Lexikon-URL verbindet die Band mit
      // dem Begriff, ohne den DefinedTerm-Knoten hier zu duplizieren.
      genre: (d.genres ?? []).map((g: string) => seitenUrl("lexikon", g)),
      recordLabel: d.label ? { "@type": "Organization", name: d.label } : undefined,
      album: (d.veroeffentlichungen ?? [])
        .filter((v: any) => v.art === "album" || v.art === "live")
        .map((v: any) =>
          saeubern({
            "@type": "MusicAlbum",
            name: v.titel,
            datePublished: String(v.jahr),
            ...(v.label ? { recordLabel: { "@type": "Organization", name: v.label } } : {}),
          }),
        ),
      sameAs: sameAs(d.links),
    });
  },

  breadcrumb(d, slug) {
    return [
      { name: "Bands", url: `${site.url}/bands/` },
      { name: d.name, url: seitenUrl("bands", slug) },
    ];
  },
};

/* ------------------------------------------------------------------ */
/* Locations                                                          */
/* ------------------------------------------------------------------ */

export const locationBuilder: Builder = {
  verwendeteFelder: [
    "name", "kurzbeschreibung", "typ", "adresse", "region",
    "kapazitaet", "barrierefrei", "links",
  ],

  entitaet(d, slug) {
    return saeubern({
      "@type": locationTypMap[d.typ] ?? "Place",
      "@id": entitaetsId("locations", slug),
      name: d.name,
      alternateName: d.aliases,
      description: d.kurzbeschreibung,
      url: seitenUrl("locations", slug),
      address: adressKnoten(d.adresse),
      geo: geoKnoten(d.adresse?.lat, d.adresse?.lng),
      containedInPlace: ref("regionen", d.region),
      maximumAttendeeCapacity: d.kapazitaet,
      publicAccess: true,
      // "unbekannt" ist keine Aussage — dann lieber gar keine machen.
      // amenityFeature statt accessibilityFeature: Letzteres ist eine
      // CreativeWork-Eigenschaft und auf Place ungültig.
      ...(d.barrierefrei === "ja" || d.barrierefrei === "teilweise"
        ? {
            amenityFeature: {
              "@type": "LocationFeatureSpecification",
              name: "Rollstuhlgerecht",
              value: d.barrierefrei === "ja",
            },
          }
        : {}),
      sameAs: sameAs(d.links),
    });
  },

  breadcrumb(d, slug) {
    return [
      { name: "Locations", url: `${site.url}/locations/` },
      { name: d.name, url: seitenUrl("locations", slug) },
    ];
  },
};

/* ------------------------------------------------------------------ */
/* Regionen                                                           */
/* ------------------------------------------------------------------ */

export const regionBuilder: Builder = {
  verwendeteFelder: ["name", "kurzbeschreibung", "ebene", "land", "uebergeordnet", "links"],

  entitaet(d, slug) {
    return saeubern({
      "@type": regionEbeneMap[d.ebene] ?? "Place",
      "@id": entitaetsId("regionen", slug),
      name: d.name,
      alternateName: d.aliases,
      description: d.kurzbeschreibung,
      url: seitenUrl("regionen", slug),
      geo: geoKnoten(d.lat, d.lng),
      containedInPlace: d.uebergeordnet ? ref("regionen", d.uebergeordnet) : undefined,
      address: adressKnoten({ ort: d.name, land: d.land }),
      sameAs: sameAs(d.links),
    });
  },

  breadcrumb(d, slug) {
    return [
      { name: "Regionen", url: `${site.url}/regionen/` },
      { name: d.name, url: seitenUrl("regionen", slug) },
    ];
  },
};

/* ------------------------------------------------------------------ */
/* Lexikon                                                            */
/* ------------------------------------------------------------------ */

export const lexikonBuilder: Builder = {
  verwendeteFelder: [
    "name", "definition", "kategorie", "bezeichnungDe", "bezeichnungEn",
    "verwandt", "uebergeordnet", "abgrenzung", "links",
  ],

  entitaet(d, slug) {
    return saeubern({
      "@type": "DefinedTerm",
      "@id": entitaetsId("lexikon", slug),
      name: d.name,
      alternateName: [...(d.aliases ?? []), d.bezeichnungDe, d.bezeichnungEn].filter(
        (x: string | undefined) => x && x !== d.name,
      ),
      description: d.definition,
      // Die Abgrenzung ist der Baustein gegen Entitätsverwechslung;
      // disambiguatingDescription ist genau dafür da.
      disambiguatingDescription: d.abgrenzung,
      termCode: slug,
      url: seitenUrl("lexikon", slug),
      inDefinedTermSet: { "@id": siteIds.lexikonSet },
      sameAs: sameAs(d.links),
    });
  },

  zusatz() {
    // Der Set-Knoten wird auf jeder Lexikonseite mitgeliefert, damit der
    // Begriff auch isoliert abgerufen seine Zugehörigkeit trägt.
    return [
      {
        "@type": "DefinedTermSet",
        "@id": siteIds.lexikonSet,
        name: `Lexikon — ${site.name}`,
        url: `${site.url}/lexikon/`,
        publisher: { "@id": siteIds.organization },
      },
    ];
  },

  breadcrumb(d, slug) {
    return [
      { name: "Lexikon", url: `${site.url}/lexikon/` },
      { name: d.name, url: seitenUrl("lexikon", slug) },
    ];
  },
};

/* ------------------------------------------------------------------ */
/* Artikel                                                            */
/* ------------------------------------------------------------------ */

export const artikelBuilder: Builder = {
  verwendeteFelder: [
    "name", "kurzbeschreibung", "typ", "saeule", "hauptentitaet",
    "erwaehnteBegriffe", "veroeffentlichtAm", "geaendertAm", "autor", "howto",
  ],

  entitaet(d, slug) {
    const url = seitenUrl("artikel", slug);
    return saeubern({
      "@type": d.typ === "liste" ? ["Article", "ItemList"] : "Article",
      "@id": entitaetsId("artikel", slug),
      headline: d.name,
      description: d.kurzbeschreibung,
      url,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      datePublished: isoDatum(d.veroeffentlichtAm),
      dateModified: isoDatum(d.geaendertAm ?? d.veroeffentlichtAm),
      author: d.autor ? { "@id": autorId(d.autor) } : undefined,
      publisher: { "@id": siteIds.organization },
      inLanguage: site.sprache,
      articleSection: d.saeule,
      about: d.hauptentitaet
        ? { "@id": entitaetsId(d.hauptentitaet.typ as CollectionName, d.hauptentitaet.slug) }
        : undefined,
      mentions: refs("lexikon", d.erwaehnteBegriffe),
    });
  },

  zusatz(d, slug) {
    if (d.typ !== "howto" || !d.howto) return [];
    const url = seitenUrl("artikel", slug);
    return [
      saeubern({
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: d.name,
        description: d.kurzbeschreibung,
        totalTime: `PT${d.howto.dauerMinuten}M`,
        supply: d.howto.material.map((m: string) => ({ "@type": "HowToSupply", name: m })),
        // Die Schritte kommen aus dem Fließtext und werden vom Layout
        // eingesetzt — hier bewusst nicht aus dem Frontmatter erfunden.
      }),
    ];
  },

  breadcrumb(d, slug) {
    return [
      { name: "Artikel", url: `${site.url}/artikel/` },
      { name: d.name, url: seitenUrl("artikel", slug) },
    ];
  },
};

/* ------------------------------------------------------------------ */

export const builders: Record<CollectionName, Builder> = {
  events: eventBuilder,
  bands: bandBuilder,
  locations: locationBuilder,
  regionen: regionBuilder,
  lexikon: lexikonBuilder,
  artikel: artikelBuilder,
};
