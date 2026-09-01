/**
 * Der sichtbare Faktenblock.
 *
 * Erzeugt die Zeilen aus `faktenblockFelder` — derselben Liste, gegen die
 * `check-jsonld.ts` die Content Parity prüft. Dadurch kann der Faktenblock
 * nicht hinter dem JSON-LD zurückbleiben: Wer ein Feld in einen Builder
 * aufnimmt, muss es hier ergänzen, sonst bricht der Paritätstest.
 *
 * Felder ohne Wert und Felder mit dem Wert "unbekannt" erscheinen nicht.
 * Eine leere Zeile ist keine Information, sondern Rauschen.
 */

import { faktenblockFelder } from "./jsonld";
import { referenzFelder, urlPrefix, type CollectionName } from "../content/_schemas";
import { aufloesen, type Registry } from "./links";
import { site } from "../site.config";

export interface FaktStueck {
  text: string;
  href?: string;
  /** Externe Links bekommen rel und ein Kennzeichen. */
  extern?: boolean;
}

export interface FaktZeile {
  feld: string;
  label: string;
  stuecke: FaktStueck[];
}

/* ------------------------------------------------------------------ */

const LABEL: Record<string, string> = {
  typ: "Art",
  beginn: "Beginn",
  ende: "Ende",
  ort: "Ort",
  ortHinweis: "Hinweis zum Ort",
  region: "Region",
  veranstalter: "Veranstalter",
  lineupBands: "Line-up",
  lineupWeitere: "Weitere Acts",
  djs: "DJs",
  preise: "Eintritt",
  eintrittFrei: "Eintritt",
  ticketUrl: "Tickets",
  kapazitaet: "Kapazität",
  camping: "Camping",
  barrierefrei: "Barrierefreiheit",
  kinder: "Kinder",
  drinnenDraussen: "Drinnen / Draußen",
  genres: "Genres",
  durchfuehrung: "Status",
  durchfuehrungHinweis: "Hinweis",
  reihe: "Reihe",
  reiheName: "Reihe",
  ausgabe: "Ausgabe",
  letzteAusgabe: "Letzte Ausgabe",
  gegruendet: "Gegründet",
  aufgeloest: "Aufgelöst",
  aktiv: "Aktiv",
  herkunftOrt: "Herkunft",
  herkunftLand: "Land",
  besetzung: "Besetzung",
  veroeffentlichungen: "Veröffentlichungen",
  label: "Label",
  einstieg: "Einstieg",
  aehnlicheBands: "Ähnliche Bands",
  adresse: "Adresse",
  tanzflaeche: "Tanzfläche",
  parken: "Parken",
  oepnv: "ÖPNV",
  ebene: "Ebene",
  land: "Land",
  uebergeordnet: "Teil von",
  schwerpunkt: "Szene-Schwerpunkt",
  definition: "Definition",
  kategorie: "Kategorie",
  bezeichnungDe: "Deutsch",
  bezeichnungEn: "Englisch",
  verwandt: "Verwandte Begriffe",
  aeraVon: "Ab",
  aeraBis: "Bis",
  herkunftsland: "Herkunftsland",
  abgrenzung: "Abgrenzung",
  saeule: "Themenbereich",
  hauptentitaet: "Handelt von",
  erwaehnteBegriffe: "Erwähnte Begriffe",
  gehoertZu: "Gehört zu",
  howto: "Anleitung",
  veroeffentlichtAm: "Veröffentlicht",
  geaendertAm: "Aktualisiert",
  autor: "Autor",
  links: "Weblinks",
};

/** Felder, die die Seite selbst schon als Überschrift oder Kapsel zeigt. */
const UEBERSPRINGEN = new Set(["name", "kurzbeschreibung"]);

const LEER = new Set(["unbekannt", ""]);

const LAND: Record<string, string> = {
  DE: "Deutschland", AT: "Österreich", CH: "Schweiz", NL: "Niederlande",
  BE: "Belgien", FR: "Frankreich", LU: "Luxemburg", CZ: "Tschechien",
  PL: "Polen", DK: "Dänemark", IT: "Italien", GB: "Vereinigtes Königreich",
  IE: "Irland", ES: "Spanien", SE: "Schweden", FI: "Finnland", NO: "Norwegen",
  US: "USA", CA: "Kanada", AU: "Australien", JP: "Japan",
};

const ENUM_TEXT: Record<string, string> = {
  weekender: "Weekender", festival: "Festival", konzert: "Konzert",
  convention: "Convention", carshow: "Car Show", markt: "Markt",
  tanzabend: "Tanzabend", workshop: "Workshop", stammtisch: "Stammtisch",
  geplant: "Findet statt", abgesagt: "Abgesagt", verschoben: "Verschoben",
  ausverkauft: "Ausverkauft", stattgefunden: "Hat stattgefunden",
  ja: "Ja", nein: "Nein", teilweise: "Teilweise",
  eingeschraenkt: "Eingeschränkt", "in-der-naehe": "In der Nähe",
  drinnen: "Drinnen", draussen: "Draußen", beides: "Drinnen und draußen",
  parkett: "Parkett", beton: "Beton", holz: "Holz", estrich: "Estrich",
  wiese: "Wiese", keine: "Keine",
  band: "Band", solo: "Solo", dj: "DJ", orchester: "Orchester",
  halle: "Halle", club: "Club", kneipe: "Kneipe", freigelaende: "Freigelände",
  campingplatz: "Campingplatz", gemeindehaus: "Gemeindehaus",
  museum: "Museum", tanzschule: "Tanzschule", sonstiges: "Sonstiges",
  land: "Land", bundesland: "Bundesland",
  metropolregion: "Metropolregion", stadt: "Stadt",
  pillar: "Überblick", spoke: "Vertiefung", howto: "Anleitung",
  vergleich: "Vergleich", liste: "Liste", report: "Report", praxis: "Praxis",
};

// Immer in der Zeitzone der Site formatieren, nie in der des Build-Servers.
// Ein Event beginnt um 18 Uhr vor Ort — auf einem UTC-Runner stünde sonst 16.
const ZAHL = new Intl.NumberFormat("de-DE");
const DATUM = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: site.zeitzone });
const DATUM_ZEIT = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: site.zeitzone,
});

function text(t: string): FaktStueck[] {
  return [{ text: t }];
}

function beschriftung(feld: string): string {
  return LABEL[feld] ?? feld;
}

/* ------------------------------------------------------------------ */

export function faktZeilen(
  collection: CollectionName,
  daten: Record<string, any>,
  registry: Registry,
): FaktZeile[] {
  const zeilen: FaktZeile[] = [];
  const refFelder = referenzFelder[collection];

  for (const feld of faktenblockFelder[collection]) {
    if (UEBERSPRINGEN.has(feld)) continue;
    const wert = daten[feld];
    if (wert === undefined || wert === null || wert === false) continue;
    if (Array.isArray(wert) && wert.length === 0) continue;
    if (typeof wert === "string" && LEER.has(wert)) continue;

    // Eintritt: entweder frei oder Preise, nie beides.
    if (feld === "eintrittFrei" && !wert) continue;
    if (feld === "preise" && daten.eintrittFrei) continue;
    // Der Anzeigename der Reihe ersetzt den Slug.
    if (feld === "reihe" && daten.reiheName) continue;

    const stuecke = formatiere(feld, wert, daten, registry, refFelder);
    if (stuecke.length) zeilen.push({ feld, label: beschriftung(feld), stuecke });
  }
  return zeilen;
}

function formatiere(
  feld: string,
  wert: any,
  daten: Record<string, any>,
  registry: Registry,
  refFelder: Record<string, CollectionName>,
): FaktStueck[] {
  // 1. Referenzfelder werden zu internen Links.
  if (refFelder[feld]) {
    const ziel = refFelder[feld];
    const slugs: string[] = Array.isArray(wert) ? wert : [wert];
    return slugs.map((s) => {
      const e = aufloesen(registry, ziel, s);
      return e ? { text: e.name, href: e.pfad } : { text: s };
    });
  }

  switch (feld) {
    case "hauptentitaet": {
      const e = aufloesen(registry, wert.typ, wert.slug);
      return e ? [{ text: e.name, href: e.pfad }] : text(`${wert.typ}/${wert.slug}`);
    }
    case "beginn":
    case "ende":
      return text(daten.ganztaegig ? DATUM.format(wert) : DATUM_ZEIT.format(wert) + " Uhr");
    case "veroeffentlichtAm":
    case "geaendertAm":
      return text(DATUM.format(wert));
    case "preise":
      return wert.map((p: any) => ({
        text: `${p.bezeichnung}: ${ZAHL.format(p.betrag)} ${p.waehrung}${p.hinweis ? ` (${p.hinweis})` : ""}`,
      }));
    case "eintrittFrei":
      return text("Frei");
    case "letzteAusgabe":
      return text("Ja — diese Ausgabe war die letzte");
    case "aktiv":
      return text(wert ? "Ja" : "Nein");
    case "schwerpunkt":
      return text("Ja");
    case "ticketUrl":
      return [{ text: "Zum Ticketshop", href: wert, extern: true }];
    case "herkunftLand":
    case "land":
    case "herkunftsland":
      return text(LAND[wert] ?? wert);
    case "kapazitaet":
      return text(`${ZAHL.format(wert)} Personen`);
    case "ausgabe":
      return text(`${wert}. Ausgabe`);
    case "aeraVon":
    case "aeraBis":
    case "gegruendet":
    case "aufgeloest":
      return text(String(wert));
    case "adresse":
      return text(
        [wert.strasse, [wert.plz, wert.ort].filter(Boolean).join(" "), LAND[wert.land] ?? wert.land]
          .filter(Boolean)
          .join(", "),
      );
    case "besetzung":
      return wert
        .filter((m: any) => m.aktuell !== false)
        .map((m: any) => ({ text: `${m.name} (${m.instrument})` }));
    case "veroeffentlichungen":
      return wert.map((v: any) => ({ text: `${v.titel} (${v.jahr})` }));
    case "einstieg":
      return text(`${wert.titel} — ${wert.begruendung}`);
    case "howto":
      return text(
        `${wert.dauerMinuten} Minuten, ${ENUM_TEXT[wert.schwierigkeit] ?? wert.schwierigkeit}. Material: ${wert.material.join(", ")}`,
      );
    case "autor":
      // Bewusst ohne Link, bis die Autoren-Collection existiert — ein
      // interner 404 auf jeder Seite wäre schlimmer als ein fehlender Link.
      return text(wert);
    case "links":
      return Object.entries(wert as Record<string, string>).map(([art, ziel]) => ({
        text: art === "wikidata" ? `Wikidata (${ziel})` : linkLabel(art),
        href: art === "wikidata" ? `https://www.wikidata.org/wiki/${ziel}` : ziel,
        extern: true,
      }));
    default:
      break;
  }

  if (Array.isArray(wert)) return wert.map((v) => ({ text: String(v) }));
  if (typeof wert === "string") return text(ENUM_TEXT[wert] ?? wert);
  if (typeof wert === "number") return text(String(wert));
  if (wert instanceof Date) return text(DATUM.format(wert));
  return [];
}

function linkLabel(art: string): string {
  const namen: Record<string, string> = {
    website: "Offizielle Website",
    wikipedia: "Wikipedia",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    bandcamp: "Bandcamp",
    spotify: "Spotify",
    discogs: "Discogs",
    musicbrainz: "MusicBrainz",
    songkick: "Songkick",
    googleMaps: "Google Maps",
  };
  return namen[art] ?? art;
}

/** Pfadpräfix einer Collection — für Breadcrumbs in den Layouts. */
export function sammlungsPfad(collection: CollectionName): string {
  return `${urlPrefix[collection]}/`;
}

export const SAMMLUNGSNAME: Record<CollectionName, string> = {
  events: "Events",
  bands: "Bands",
  locations: "Locations",
  regionen: "Regionen",
  lexikon: "Lexikon",
  artikel: "Artikel",
};
