/**
 * Das Vorschlagsformular — eine Definition für beide Seiten.
 *
 * Die Formularseite (`src/pages/vorschlagen/index.astro`) rendert diese
 * Feldnamen, das Abrufskript (`scripts/vorschlaege.ts`) liest sie aus den
 * Netlify-Einsendungen. Stünden die Namen an zwei Stellen, liefe eine
 * Umbenennung auf der Seite still ins Leere: Das Skript fände dann einfach
 * keine URL mehr und meldete „keine Vorschläge" — ein Ergebnis, das auch
 * ohne Fehler eintreten kann (Lektion 17). `test-ausgaben` prüft das
 * gebaute Formular gegen genau diese Namen.
 *
 * Grundsätze (Markus, 2026-09-24): Pflicht ist nur die URL, ein Hinweis
 * ist freiwillig, Angaben zur Person werden nicht erhoben.
 *
 * Kein `import.meta` hier — das Skript läuft in Node (Lektion 2).
 */
export const VORSCHLAG = {
  /** `name` des Formulars, zugleich der Wert des versteckten `form-name`. */
  formName: "vorschlag",
  felder: {
    /** Pflicht: die Seite, auf der der Termin oder die Angabe steht. */
    url: "url",
    /** Freiwillig, eine Zeile: „Konzert am 9. Januar", „Uhrzeit falsch". */
    hinweis: "hinweis",
    /** Versteckt, vorbelegt über ?eintrag=collection/slug („Fehler melden"). */
    eintrag: "eintrag",
  },
  /** Honigtopf: für Menschen unsichtbar, Bots füllen es aus. */
  honigtopf: "bot-feld",
  /** Obergrenze für den Hinweis — eine Zeile, kein Aufsatz. */
  hinweisMaxLaenge: 200,
  /** Wohin Netlify nach dem Absenden leitet. */
  danke: "/vorschlagen/danke/",
} as const;

/** Der Link „Fehler melden" einer Eintragsseite. */
export function meldePfad(collection: string, slug: string): string {
  return `/vorschlagen/?${VORSCHLAG.felder.eintrag}=${encodeURIComponent(`${collection}/${slug}`)}`;
}
