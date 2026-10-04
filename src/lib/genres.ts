/**
 * genres.ts — was in `genres` stehen darf und wie es angezeigt wird.
 *
 * Entscheidung Markus vom 2026-10-03 (ENTSCHEIDUNGEN.md, „Tänze in
 * genres"): `genres` verweist auf Lexikoneinträge der Kategorie `genre`
 * (Musik). Bei Terminen, an denen getanzt wird, dürfen zusätzlich Einträge
 * der Kategorie `tanz` stehen — ein Boogie-Abend hat den Tanz zum Thema,
 * nicht den Klavierstil. Bei Bands bleibt `genres` reine Musik.
 *
 * Zwei Abnehmer, eine Regel: `validate-content.ts` (Regel
 * `genres-kategorie`) und der Faktenblock, der Musik und Tanz in getrennten
 * Zeilen zeigt statt alles unter „Genres". Kein Import aus registry.ts
 * (Lektion 2) — die Kategorie kommt als Funktion herein.
 */

/** Terminarten, an denen getanzt wird und ein Tanz in `genres` stehen darf. */
export const TANZ_TYPEN: ReadonlySet<string> = new Set(["tanzabend", "workshop", "weekender"]);

export type GenreArt = "musik" | "tanz";

/** Musik oder Tanz — oder `undefined`, wenn die Kategorie in `genres` nichts verloren hat. */
export function genreArt(kategorie: string | undefined): GenreArt | undefined {
  if (kategorie === "genre") return "musik";
  if (kategorie === "tanz") return "tanz";
  return undefined;
}

export interface GenreBefund {
  slug: string;
  nachricht: string;
}

/**
 * Was an `genres` nicht stimmt. `kategorieVon` liefert die Kategorie des
 * Lexikoneintrags oder `undefined`, wenn es ihn nicht gibt — ein Verweis
 * ins Leere ist Sache der Regel `referenzen` und wird hier übergangen.
 */
export function genresBefunde(
  collection: string,
  daten: { typ?: string; genres?: string[] },
  kategorieVon: (slug: string) => string | undefined | null,
): GenreBefund[] {
  const befunde: GenreBefund[] = [];
  for (const slug of daten.genres ?? []) {
    const kategorie = kategorieVon(slug);
    if (kategorie === null || kategorie === undefined) continue;
    const art = genreArt(kategorie);
    if (art === "musik") continue;
    if (art === "tanz") {
      if (collection === "events" && TANZ_TYPEN.has(daten.typ ?? "")) continue;
      befunde.push({
        slug,
        nachricht:
          collection === "events"
            ? `„${slug}" ist ein Tanz; Tänze stehen in genres nur bei ${[...TANZ_TYPEN].join(", ")}, nicht bei typ „${daten.typ}".`
            : `„${slug}" ist ein Tanz; bei ${collection} führt genres nur Musik.`,
      });
      continue;
    }
    befunde.push({
      slug,
      nachricht: `„${slug}" hat die Kategorie „${kategorie}"; genres führt Musik (Kategorie genre) und bei Tanzterminen Tänze (Kategorie tanz).`,
    });
  }
  return befunde;
}

/** Teilt `genres` für die Anzeige in Musik und Tanz, Reihenfolge bleibt. */
export function genresNachArt(
  genres: string[],
  kategorieVon: (slug: string) => string | undefined | null,
): { musik: string[]; tanz: string[] } {
  const musik: string[] = [];
  const tanz: string[] = [];
  for (const slug of genres) (genreArt(kategorieVon(slug) ?? undefined) === "tanz" ? tanz : musik).push(slug);
  return { musik, tanz };
}
