/**
 * Die sechs Ressorts des Portals (Entscheidung 2026-10-02, DESIGN-BRIEF.md,
 * „Das Gestaltungssystem"). Jedes trägt eine Katalognummer wie auf einem
 * Plattenlabel und zeigt auf die Lexikon-Kategorie, aus der es sich speist.
 *
 * Die Reihenfolge ist die Nummerierung und damit fest — ein Ressort, das
 * später dazukommt, bekommt die nächste Nummer, nie eine dazwischen.
 *
 * Angezeigt wird ein Ressort nur, wenn seine Kategorie mindestens einen
 * sichtbaren Eintrag hat (gleiche Regel wie die Hauptnavigation im
 * BasisLayout): Ein Link auf eine leere Seite ist schlimmer als keiner.
 */
// Typ aus links.ts, nicht aus registry.ts: Letzteres importiert astro:content
// und ist aus Node nicht ladbar — dieses Modul soll testbar bleiben.
import type { Registry } from "./links";

export interface Ressort {
  /** Katalognummer, z. B. "V101-01". */
  nummer: string;
  name: string;
  /** Wert von `kategorie` im Lexikon, aus dem das Ressort sich speist. */
  kategorie: string;
}

export const RESSORTS: readonly Ressort[] = [
  { nummer: "V101-01", name: "Musik", kategorie: "genre" },
  { nummer: "V101-02", name: "Mode", kategorie: "mode" },
  { nummer: "V101-03", name: "Tanz", kategorie: "tanz" },
  { nummer: "V101-04", name: "Autos", kategorie: "auto" },
  { nummer: "V101-05", name: "Frisur", kategorie: "frisur" },
  { nummer: "V101-06", name: "Szene", kategorie: "szene" },
];

export const ressortPfad = (r: Ressort) => `/lexikon/kategorie/${r.kategorie}/`;

/** Die Ressorts, deren Kategorie in dieser Registry etwas enthält. */
export function sichtbareRessorts(registry: Registry): Ressort[] {
  const kategorien = new Set<string>();
  for (const e of registry.eintraege.values()) {
    if (e.collection === "lexikon" && typeof e.daten.kategorie === "string") kategorien.add(e.daten.kategorie);
  }
  return RESSORTS.filter((r) => kategorien.has(r.kategorie));
}

/**
 * Themenbereiche der Artikel, die zu einem Ressort gehören. Der Rest
 * (Geschichte, Sammeln, Tattoo, Einstieg) hat kein eigenes Ressort und
 * trägt deshalb keine Katalognummer. Kustom Kulture ist die Autoseite der
 * Szene und läuft unter V101-04 Autos.
 */
const SAEULE_RESSORT: Record<string, string> = {
  musik: "genre",
  mode: "mode",
  tanz: "tanz",
  "kustom-kulture": "auto",
  frisur: "frisur",
  szene: "szene",
};

/**
 * Das Ressort eines Eintrags, dessen Katalognummer über der H1 steht
 * (DESIGN-BRIEF.md, „Katalognummern": über Artikeln und Lexikoneinträgen
 * des Ressorts). Andere Sammlungen und Werte ohne Ressort: keins.
 */
export function ressortVon(collection: string, daten: Record<string, any>): Ressort | undefined {
  const kategorie =
    collection === "lexikon" ? daten.kategorie : collection === "artikel" ? SAEULE_RESSORT[daten.saeule] : undefined;
  return RESSORTS.find((r) => r.kategorie === kategorie);
}
