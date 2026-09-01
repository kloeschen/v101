/**
 * Übersichts- und Facettenseiten.
 *
 * Der Grundsatz zuerst, weil er die halbe Komplexität wegnimmt:
 *
 *   **Wo eine Entität existiert, gibt es keine Facette.**
 *
 * `/events/region/rhein-neckar/` wäre eine dünnere Kopie von
 * `/regionen/rhein-neckar/`, das ohnehin alles der Region bündelt. Dasselbe
 * gilt für Genres — die Lexikonseite ist die kanonische Adresse des Begriffs.
 * Übrig bleiben Facetten über Werte, die keine eigene Entität sind: Jahre,
 * Veranstaltungsarten, Kategorien, Themenbereiche.
 *
 * Facetten liegen unter einem eigenen Segment (`/events/jahr/2027/`), damit
 * sie nicht mit Entitäts-Slugs kollidieren können. Die Segmentnamen sind in
 * `RESERVIERTE_SEGMENTE` gesperrt und werden von validate-content.ts geprüft.
 *
 * Indexiert wird eine Facettenseite nur, wenn sie beides erfüllt:
 *   1. mindestens MIN_EINTRAEGE Einträge
 *   2. eine redaktionelle Einleitung mit mindestens MIN_EINLEITUNG_WORTE Wörtern
 *
 * Punkt 2 ist bewusst nicht automatisierbar. Eine generierte Einleitung wäre
 * genau der Thin Content, den der Schwellenwert verhindern soll. Bis jemand
 * sie schreibt, ist die Seite erreichbar, aber `noindex, follow` — sie
 * vererbt also Linkkraft weiter, ohne den Index zu verwässern.
 */

import type { Registry, EintragMeta } from "./links";
import type { CollectionName } from "../content/_schemas";
import { site } from "../site.config";

export const MIN_EINTRAEGE = 5;
export const MIN_EINLEITUNG_WORTE = 150;
/** Reihen sind eine Ausnahme: ab zwei Ausgaben ist die Übersicht sinnvoll. */
export const MIN_AUSGABEN_REIHE = 2;

/**
 * Diese Slugs darf keine Entität belegen — sonst kollidieren die Routen.
 * "seite" ist für künftige Paginierung reserviert, "alle" für den
 * Gesamtfeed /kalender/alle.ics: Eine Region mit diesem Slug würde ihn
 * überschreiben.
 */
export const RESERVIERTE_SEGMENTE = ["jahr", "typ", "reihe", "kategorie", "saeule", "seite", "alle"];

/* ------------------------------------------------------------------ */

export interface FacettenDefinition {
  collection: CollectionName;
  /** URL-Segment, z. B. "jahr" in /events/jahr/2027/. */
  segment: string;
  label: string;
  /** Welche Facettenwerte hat dieser Eintrag? Leer = kommt nicht vor. */
  werte(daten: Record<string, any>): string[];
  /** Anzeigename eines Werts. */
  wertLabel(wert: string, eintraege: EintragMeta[]): string;
  /** Sortierung der Einträge innerhalb der Facette. */
  sortiere?(a: EintragMeta, b: EintragMeta): number;
  /** Abweichender Mindestbestand. */
  minEintraege?: number;
  /** Braucht keine redaktionelle Einleitung, um indexiert zu werden. */
  ohneEinleitung?: boolean;
}

const nachName = (a: EintragMeta, b: EintragMeta) => a.name.localeCompare(b.name, "de");

function jahrVorOrt(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: site.zeitzone, year: "numeric" }).format(d);
}

/** Kommende zuerst, dann vergangene absteigend — wie auf der Bandseite. */
function nachDatum(a: EintragMeta, b: EintragMeta): number {
  const da = +new Date(a.daten.beginn);
  const db = +new Date(b.daten.beginn);
  const jetzt = Date.now();
  const aKommt = da >= jetzt;
  const bKommt = db >= jetzt;
  if (aKommt !== bKommt) return aKommt ? -1 : 1;
  return aKommt ? da - db : db - da;
}

const ART: Record<string, string> = {
  weekender: "Weekender", festival: "Festivals", konzert: "Konzerte",
  convention: "Conventions", carshow: "Car Shows", markt: "Märkte",
  tanzabend: "Tanzabende", workshop: "Workshops", stammtisch: "Stammtische",
};

const KATEGORIE: Record<string, string> = {
  genre: "Genres", mode: "Mode", frisur: "Frisuren", tanz: "Tänze",
  musiktechnik: "Musiktechnik", instrument: "Instrumente", auto: "Autos",
  tattoo: "Tattoo", szene: "Szene", medium: "Medien", epoche: "Epochen",
};

const SAEULE: Record<string, string> = {
  musik: "Musik", geschichte: "Geschichte", mode: "Mode", frisur: "Frisur",
  tanz: "Tanz", "kustom-kulture": "Kustom Kulture", szene: "Szene",
  sammeln: "Sammeln", tattoo: "Tattoo", einstieg: "Einstieg",
};

export const FACETTEN: FacettenDefinition[] = [
  {
    collection: "events",
    segment: "jahr",
    label: "Jahr",
    // In der Zeitzone der Site, nicht der des Build-Servers: Ein
    // Silvesterball am 01.01. um 00:30 Ortszeit gehört ins neue Jahr —
    // getFullYear() auf einem UTC-Runner steckt ihn ins alte.
    werte: (d) => (d.beginn ? [jahrVorOrt(new Date(d.beginn))] : []),
    wertLabel: (w) => `Veranstaltungen ${w}`,
    sortiere: nachDatum,
    // Jahresarchive sind auch mit wenigen Einträgen ein sinnvoller Einstieg
    // und werden häufig direkt so gesucht ("Rockabilly Festivals 2027").
    minEintraege: 3,
  },
  {
    collection: "events",
    segment: "typ",
    label: "Art",
    werte: (d) => (d.typ ? [d.typ] : []),
    wertLabel: (w) => ART[w] ?? w,
    sortiere: nachDatum,
  },
  {
    collection: "events",
    segment: "reihe",
    label: "Reihe",
    werte: (d) => (d.reihe ? [d.reihe] : []),
    // Der Anzeigename kommt aus den Ausgaben selbst, nicht aus dem Slug.
    wertLabel: (w, e) => e[0]?.daten.reiheName ?? w,
    sortiere: (a, b) => +new Date(b.daten.beginn) - +new Date(a.daten.beginn),
    minEintraege: MIN_AUSGABEN_REIHE,
    ohneEinleitung: true,
  },
  {
    collection: "lexikon",
    segment: "kategorie",
    label: "Kategorie",
    werte: (d) => (d.kategorie ? [d.kategorie] : []),
    wertLabel: (w) => KATEGORIE[w] ?? w,
    sortiere: nachName,
  },
  {
    collection: "artikel",
    segment: "saeule",
    label: "Themenbereich",
    werte: (d) => (d.saeule ? [d.saeule] : []),
    wertLabel: (w) => SAEULE[w] ?? w,
    sortiere: nachName,
  },
];

/* ------------------------------------------------------------------ */

export interface Facettenseite {
  collection: CollectionName;
  segment: string;
  wert: string;
  label: string;
  pfad: string;
  eintraege: EintragMeta[];
  definition: FacettenDefinition;
}

export function sammleFacetten(registry: Registry): Facettenseite[] {
  const seiten: Facettenseite[] = [];

  for (const def of FACETTEN) {
    const nachWert = new Map<string, EintragMeta[]>();
    for (const e of registry.eintraege.values()) {
      if (e.collection !== def.collection) continue;
      for (const w of def.werte(e.daten)) {
        if (!nachWert.has(w)) nachWert.set(w, []);
        nachWert.get(w)!.push(e);
      }
    }

    for (const [wert, eintraege] of nachWert) {
      eintraege.sort(def.sortiere ?? nachName);
      seiten.push({
        collection: def.collection,
        segment: def.segment,
        wert,
        label: def.wertLabel(wert, eintraege),
        pfad: `/${def.collection}/${def.segment}/${wert}/`,
        eintraege,
        definition: def,
      });
    }
  }

  return seiten;
}

/* ------------------------------------------------------------------ */
/* Schwellenwert                                                       */
/* ------------------------------------------------------------------ */

export function zaehleWorte(text = ""): number {
  const t = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>|-]/g, " ")
    .trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Der Schwellenwert als Funktion, nicht als Redaktionsregel.
 * Gibt zusätzlich den Grund zurück — der erscheint in der Entwicklungsansicht,
 * damit man sieht, was der Seite zum Index fehlt.
 */
export function indexierbarkeit(
  seite: Facettenseite,
  einleitung?: string,
): { indexierbar: boolean; grund?: string } {
  const min = seite.definition.minEintraege ?? MIN_EINTRAEGE;
  if (seite.eintraege.length < min) {
    return { indexierbar: false, grund: `nur ${seite.eintraege.length} von ${min} nötigen Einträgen` };
  }
  if (seite.definition.ohneEinleitung) return { indexierbar: true };

  const worte = zaehleWorte(einleitung);
  if (worte < MIN_EINLEITUNG_WORTE) {
    return {
      indexierbar: false,
      grund: `Einleitung hat ${worte} von ${MIN_EINLEITUNG_WORTE} nötigen Wörtern (src/facetten/${seite.collection}/${seite.segment}/${seite.wert}.md)`,
    };
  }
  return { indexierbar: true };
}
