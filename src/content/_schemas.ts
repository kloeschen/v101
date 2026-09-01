/**
 * Der Datenvertrag.
 *
 * Bewusst ohne Astro-Import: hier wird `zod` direkt verwendet, damit sowohl
 * `src/content.config.ts` (Astro-Build) als auch `scripts/*.ts` (Node-CLI,
 * CI, Hooks) dieselben Schemas nutzen können. Eine Quelle, zwei Konsumenten.
 *
 * Referenzen auf andere Entitäten sind hier bewusst `z.string()` (Slugs),
 * nicht Astros `reference()`. Grund: referenzielle Integrität wird zentral
 * in scripts/validate-content.ts geprüft — inklusive kollektionsübergreifender
 * Fälle, die `reference()` nicht abbilden kann. Wer Build-Fehler statt
 * Validator-Fehler bevorzugt, kann in content.config.ts einzelne Felder mit
 * `.and(reference('bands'))` überschreiben.
 */

import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Bausteine                                                           */
/* ------------------------------------------------------------------ */

/** Kleinbuchstaben, Ziffern, Bindestriche. Keine Umlaute, keine Slashes. */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: nur a-z, 0-9 und Bindestriche");

// Zod 4: z.url() statt des veralteten z.string().url(). Die Protokollprüfung
// steckt jetzt in der Option statt in einem nachgelagerten startsWith().
export const httpsUrl = z.url({ protocol: /^https$/, error: "Nur https-URLs" });

export const isoDate = z.coerce.date();

/**
 * Belegkette. Jeder recherchierte Fakt muss durch mindestens eine Quelle
 * gedeckt sein. `felder` listet die Frontmatter-Felder, die diese Quelle
 * belegt; `["alle"]` deckt den kompletten Eintrag ab.
 */
export const quelle = z
  .object({
    url: httpsUrl,
    titel: z.string().min(3).optional(),
    abgerufenAm: isoDate,
    felder: z.array(z.string().min(1)).min(1),
    art: z
      .enum(["offiziell", "presse", "aggregator", "social", "sonstige"])
      .default("sonstige"),
  })
  .strict();

/**
 * Bilder. `rechte` ist Pflicht — ohne dokumentierte Rechtelage kein Bild.
 * Das ist bei einer Event-Site das größte reale juristische Risiko.
 */
export const bild = z
  .object({
    src: z.string().min(1),
    alt: z.string().min(10, "Alt-Text braucht Substanz, nicht 'Foto'"),
    bildunterschrift: z.string().optional(),
    urheber: z.string().min(2),
    rechte: z.enum([
      "eigenes-werk",
      "pressematerial-freigegeben",
      "cc-by",
      "cc-by-sa",
      "cc0",
      "lizenziert",
      "genehmigung-eingeholt",
    ]),
    rechteNachweis: z.string().optional(),
    quelleUrl: httpsUrl.optional(),
  })
  .strict();

/** Wird 1:1 zu `sameAs` im JSON-LD. Nur belegte, auflösende Profile. */
export const linksSchema = z
  .object({
    website: httpsUrl.optional(),
    wikidata: z
      .string()
      .regex(/^Q\d+$/, "Wikidata-ID im Format Q12345")
      .optional(),
    wikipedia: httpsUrl.optional(),
    instagram: httpsUrl.optional(),
    facebook: httpsUrl.optional(),
    youtube: httpsUrl.optional(),
    bandcamp: httpsUrl.optional(),
    spotify: httpsUrl.optional(),
    discogs: httpsUrl.optional(),
    musicbrainz: httpsUrl.optional(),
    songkick: httpsUrl.optional(),
    googleMaps: httpsUrl.optional(),
  })
  .strict();

export const adresse = z
  .object({
    strasse: z.string().optional(),
    plz: z.string().optional(),
    ort: z.string().min(2),
    land: z.enum([
      "DE", "AT", "CH", "NL", "BE", "FR", "LU", "CZ", "PL", "DK",
      "IT", "GB", "IE", "ES", "SE", "FI", "NO", "US", "CA", "AU", "JP",
    ]),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .strict();

export const preis = z
  .object({
    bezeichnung: z.string().min(2), // "Weekender-Ticket", "Tageskasse Samstag"
    betrag: z.number().nonnegative(),
    waehrung: z.enum(["EUR", "CHF", "GBP"]).default("EUR"),
    gueltigBis: isoDate.optional(),
    hinweis: z.string().optional(),
  })
  .strict();

export const faqEintrag = z
  .object({
    frage: z.string().min(10).endsWith("?", "FAQ-Frage muss ein Fragezeichen haben"),
    antwort: z.string().min(40),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Basis — gilt für jede Entität                                       */
/* ------------------------------------------------------------------ */

export const basis = z.object({
  /** Anzeigename. Der Dateiname liefert den Slug. */
  name: z.string().min(2),

  /**
   * Szene-Kurzformen, alte Namen, Schreibvarianten.
   * Ohne das verlierst du die Hälfte der realen Suchanfragen — und die
   * Duplikatprüfung greift nicht.
   */
  aliases: z.array(z.string().min(2)).default([]),

  /**
   * Definitorischer Einzeiler. Wird zur Antwortkapsel und zu
   * schema.org `description`. Muss ohne Kontext verständlich sein.
   */
  kurzbeschreibung: z
    .string()
    .min(40, "Zu kurz für eine brauchbare Definition")
    .max(320, "Ein Satz, keine Zusammenfassung"),

  status: z.enum(["entwurf", "geprueft", "veroeffentlicht"]).default("entwurf"),

  erstelltAm: isoDate,
  geprueftAm: isoDate,
  /** Nur setzen, wenn sich inhaltlich etwas geändert hat. Nicht bei jedem Build. */
  geaendertAm: isoDate.optional(),

  autor: slug.optional(),
  quellen: z.array(quelle).default([]),
  bilder: z.array(bild).default([]),
  faq: z.array(faqEintrag).default([]),

  /** Manuelles Override; normalerweise entscheidet der Build. */
  noindex: z.boolean().default(false),
  /** Freitext für die Redaktion, wird nie gerendert. */
  redaktionsnotiz: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* 1. Events                                                           */
/* ------------------------------------------------------------------ */

export const eventSchema = basis
  .extend({
    typ: z.enum([
      "weekender",
      "festival",
      "konzert",
      "convention",
      "carshow",
      "markt",
      "tanzabend",
      "workshop",
      "stammtisch",
    ]),

    /**
     * Slug der übergeordneten Reihe, z. B. "firebirds-festival".
     * Der Build erzeugt daraus die Reihenseite /events/{reihe}/ mit allen
     * Ausgaben — es braucht dafür keine eigene Content-Datei.
     */
    reihe: slug.optional(),
    /** Anzeigename der Reihe. Pflicht, sobald `reihe` gesetzt ist. */
    reiheName: z.string().min(2).optional(),
    /** Zählung der Ausgabe, wenn bekannt. */
    ausgabe: z.number().int().positive().optional(),
    /** Für Reihen, die enden. Wird im Text prominent ausgespielt. */
    letzteAusgabe: z.boolean().default(false),

    beginn: isoDate,
    ende: isoDate.optional(),
    ganztaegig: z.boolean().default(false),

    /** Slug aus der locations-Collection. */
    ort: slug,
    /** Nur wenn abweichend vom Location-Eintrag (z. B. Nebenbühne, Zeltplatz). */
    ortHinweis: z.string().optional(),
    /** Slug aus regionen — wird sonst aus der Location abgeleitet. */
    region: slug.optional(),

    veranstalter: z.string().min(2).optional(),
    veranstalterUrl: httpsUrl.optional(),

    /** Bands mit eigener Seite. */
    lineupBands: z.array(slug).default([]),
    /** Bands ohne eigene Seite — landen in der Warteliste, nicht automatisch im Register. */
    lineupWeitere: z.array(z.string().min(2)).default([]),
    djs: z.array(z.string().min(2)).default([]),

    eintrittFrei: z.boolean().default(false),
    preise: z.array(preis).default([]),
    ticketUrl: httpsUrl.optional(),

    kapazitaet: z.number().int().positive().optional(),
    camping: z.enum(["ja", "nein", "in-der-naehe", "unbekannt"]).default("unbekannt"),
    barrierefrei: z.enum(["ja", "teilweise", "nein", "unbekannt"]).default("unbekannt"),
    kinder: z.enum(["ja", "eingeschraenkt", "nein", "unbekannt"]).default("unbekannt"),
    drinnenDraussen: z.enum(["drinnen", "draussen", "beides"]).optional(),

    /** Lexikon-Slugs. Wird zu schema.org `about`. */
    genres: z.array(slug).default([]),

    /** Mappt auf schema.org eventStatus. */
    durchfuehrung: z
      .enum(["geplant", "abgesagt", "verschoben", "ausverkauft", "stattgefunden"])
      .default("geplant"),
    durchfuehrungHinweis: z.string().optional(),

    links: linksSchema.default({}),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 2. Bands                                                            */
/* ------------------------------------------------------------------ */

export const bandSchema = basis
  .extend({
    typ: z.enum(["band", "solo", "dj", "orchester"]).default("band"),

    gegruendet: z.number().int().min(1930).max(2100).optional(),
    aufgeloest: z.number().int().min(1930).max(2100).optional(),
    aktiv: z.boolean().default(true),

    herkunftOrt: z.string().min(2).optional(),
    herkunftLand: adresse.shape.land,
    /** Slug aus regionen, nur für DACH+ relevant. */
    region: slug.optional(),

    /** Lexikon-Slugs. Mindestens eines — sonst ist die Entität nicht eingeordnet. */
    genres: z.array(slug).min(1, "Mindestens ein Genre aus dem Lexikon"),

    besetzung: z
      .array(
        z
          .object({
            name: z.string().min(2),
            instrument: z.string().min(2),
            aktuell: z.boolean().default(true),
          })
          .strict(),
      )
      .default([]),

    veroeffentlichungen: z
      .array(
        z
          .object({
            titel: z.string().min(1),
            jahr: z.number().int().min(1930).max(2100),
            art: z.enum(["album", "ep", "single", "compilation", "live"]).default("album"),
            label: z.string().optional(),
          })
          .strict(),
      )
      .default([]),

    label: z.string().optional(),

    /** Der Absatz, den sonst niemand schreibt: womit fängt man an? */
    einstieg: z
      .object({
        titel: z.string().min(1),
        art: z.enum(["album", "song", "video"]).default("album"),
        begruendung: z.string().min(30),
      })
      .strict()
      .optional(),

    aehnlicheBands: z.array(slug).default([]),

    links: linksSchema.default({}),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 3. Locations                                                        */
/* ------------------------------------------------------------------ */

export const locationSchema = basis
  .extend({
    typ: z.enum([
      "halle",
      "club",
      "kneipe",
      "freigelaende",
      "campingplatz",
      "gemeindehaus",
      "museum",
      "tanzschule",
      "sonstiges",
    ]),

    adresse,
    region: slug,

    kapazitaet: z.number().int().positive().optional(),
    /** Der Absatz, der bei Tanzveranstaltungen wirklich zählt. */
    tanzflaeche: z.enum(["parkett", "beton", "holz", "estrich", "wiese", "keine", "unbekannt"]).default("unbekannt"),
    barrierefrei: z.enum(["ja", "teilweise", "nein", "unbekannt"]).default("unbekannt"),
    parken: z.string().optional(),
    oepnv: z.string().optional(),
    aktiv: z.boolean().default(true),

    links: linksSchema.default({}),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 4. Regionen                                                         */
/* ------------------------------------------------------------------ */

export const regionSchema = basis
  .extend({
    ebene: z.enum(["land", "bundesland", "metropolregion", "stadt"]),
    land: adresse.shape.land,
    /** Slug der übergeordneten Region. Baut die Place-Hierarchie im JSON-LD. */
    uebergeordnet: slug.optional(),

    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),

    /** Nur Regionen mit echter Szene-Dichte bekommen eine indexierte Seite. */
    schwerpunkt: z.boolean().default(false),

    links: linksSchema.default({}),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 5. Lexikon                                                          */
/* ------------------------------------------------------------------ */

export const lexikonSchema = basis
  .extend({
    kategorie: z.enum([
      "genre",
      "mode",
      "frisur",
      "tanz",
      "musiktechnik",
      "instrument",
      "auto",
      "tattoo",
      "szene",
      "medium",
      "epoche",
    ]),

    /** Beide Sprachformen explizit — die Szene spricht Denglisch. */
    bezeichnungDe: z.string().optional(),
    bezeichnungEn: z.string().optional(),

    /**
     * Der eine Satz, der als DefinedTerm-Description ausgespielt wird.
     * Getrennt von kurzbeschreibung: hier maximal knapp und definitorisch.
     */
    definition: z.string().min(30).max(280),

    /** Lexikon-Slug des Oberbegriffs. */
    uebergeordnet: slug.optional(),
    verwandt: z.array(slug).default([]),

    aeraVon: z.number().int().min(1900).max(2100).optional(),
    aeraBis: z.number().int().min(1900).max(2100).optional(),
    herkunftsland: adresse.shape.land.optional(),

    /** Häufige Fehlannahme, die der Eintrag ausräumt. Starkes Zitationsformat. */
    abgrenzung: z.string().optional(),

    links: linksSchema.default({}),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* 6. Artikel                                                          */
/* ------------------------------------------------------------------ */

export const artikelSchema = basis
  .extend({
    /** Der Titel steht in `name`; hier nur das, was zusätzlich nötig ist. */
    typ: z.enum(["pillar", "spoke", "howto", "vergleich", "liste", "report", "praxis"]),

    saeule: z.enum([
      "musik",
      "geschichte",
      "mode",
      "frisur",
      "tanz",
      "kustom-kulture",
      "szene",
      "sammeln",
      "tattoo",
      "einstieg",
    ]),

    /** Genau eine Hauptentität. Wird zu schema.org `about`. */
    hauptentitaet: z
      .object({
        typ: z.enum(["events", "bands", "locations", "regionen", "lexikon", "artikel"]),
        slug,
      })
      .strict()
      .optional(),

    /** Wird zu `mentions`. Treibt außerdem die interne Verlinkung. */
    erwaehnteBegriffe: z.array(slug).default([]),

    /** Slug der Pillar-Seite, zu der dieser Spoke gehört. */
    gehoertZu: slug.optional(),

    /** Nur für typ: howto — speist HowTo-Markup. */
    howto: z
      .object({
        dauerMinuten: z.number().int().positive(),
        schwierigkeit: z.enum(["anfaenger", "fortgeschritten", "profi"]),
        material: z.array(z.string().min(2)).min(1),
      })
      .strict()
      .optional(),

    veroeffentlichtAm: isoDate,
    /** Nächste redaktionelle Prüfung; steuert den Stale-Report. */
    naechstePruefung: isoDate.optional(),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const collectionSchemas = {
  events: eventSchema,
  bands: bandSchema,
  locations: locationSchema,
  regionen: regionSchema,
  lexikon: lexikonSchema,
  artikel: artikelSchema,
} as const;

export type CollectionName = keyof typeof collectionSchemas;
export const collectionNames = Object.keys(collectionSchemas) as CollectionName[];

/** URL-Präfix je Collection. Einzige Stelle, an der das definiert wird. */
export const urlPrefix: Record<CollectionName, string> = {
  events: "/events",
  bands: "/bands",
  locations: "/locations",
  regionen: "/regionen",
  lexikon: "/lexikon",
  artikel: "/artikel",
};

/**
 * Felder, die ohne Quellenbeleg nicht veröffentlicht werden dürfen.
 * Halluzinierte Termine und Preise sind das realistischste Schadensszenario
 * dieses Projekts — deshalb hier hart geführt.
 */
export const belegpflichtigeFelder: Record<CollectionName, string[]> = {
  events: ["beginn", "ende", "preise", "ticketUrl", "ort", "lineupBands", "kapazitaet", "durchfuehrung"],
  bands: ["gegruendet", "aufgeloest", "besetzung", "veroeffentlichungen", "label", "herkunftOrt"],
  locations: ["adresse", "kapazitaet"],
  regionen: [],
  lexikon: ["aeraVon", "aeraBis", "herkunftsland"],
  artikel: [],
};

/** Prüfkadenz in Tagen. Speist den Stale-Report. */
export const pruefKadenzTage: Record<CollectionName, number> = {
  events: 30,
  bands: 180,
  locations: 90,
  regionen: 180,
  lexikon: 365,
  artikel: 180,
};

/** Referenzfelder: welches Feld zeigt auf welche Collection? */
export const referenzFelder: Record<CollectionName, Record<string, CollectionName>> = {
  // `reihe` bewusst nicht geprüft: Reihen bekommen später eine eigene Collection.
  events: { ort: "locations", region: "regionen", lineupBands: "bands", genres: "lexikon" },
  bands: { region: "regionen", genres: "lexikon", aehnlicheBands: "bands" },
  locations: { region: "regionen" },
  regionen: { uebergeordnet: "regionen" },
  lexikon: { uebergeordnet: "lexikon", verwandt: "lexikon" },
  artikel: { erwaehnteBegriffe: "lexikon", gehoertZu: "artikel" },
};

/** Mindestlänge des Fließtexts in Wörtern. Unter diesem Wert: Thin Content. */
export const minWorte: Record<CollectionName, number> = {
  events: 180,
  bands: 150,
  locations: 100,
  regionen: 250,
  lexikon: 90,
  artikel: 500,
};
