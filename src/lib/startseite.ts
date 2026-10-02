/**
 * startseite.ts — die Rechnungen hinter den Blöcken der Startseite
 * (Plattenhülle, Etappe 4; DESIGN-BRIEF.md, „Neue Bausteine").
 *
 * Getrennt von src/pages/index.astro, damit sie aus Node testbar sind
 * (scripts/test-startseite.ts). Deshalb kein Import aus registry.ts, das
 * astro:content lädt (Lektion 2), sondern nur Typen aus links.ts.
 *
 * Alle Kalenderrechnungen laufen über `tagesnummer` in `site.zeitzone`, nie
 * über die Wochentage des Prozesses (Lektion 1): Auf einem UTC-Runner ist
 * Samstag 00:30 Berliner Zeit noch Freitag.
 */
import type { EintragMeta } from "./links";
import { eventVorbei, tagesnummer, type Datumswert } from "./datum";
import { site } from "../site.config";

type Termin = Pick<EintragMeta, "collection" | "slug" | "daten">;

/**
 * Samstag und Sonntag „dieses Wochenendes" als Tagesnummern. Montag bis
 * Freitag ist es das kommende, am Samstag und Sonntag das laufende.
 */
export function wochenende(jetzt: Date = new Date(), zone: string = site.zeitzone): { samstag: number; sonntag: number } {
  const heute = tagesnummer(jetzt, zone);
  // Der 1. Januar 1970 war ein Donnerstag: (n + 3) % 7 ist 0 für Montag.
  const wochentag = (heute + 3) % 7;
  const samstag = heute - wochentag + 5;
  return { samstag, sonntag: samstag + 1 };
}

/**
 * Liegt der Termin an diesem Wochenende? Entschieden wird über Überlappung:
 * Ein Weekender von Freitag bis Sonntag gehört dazu, ein Konzert nur am
 * Freitag nicht. Was schon vorbei ist — am Sonntag der Samstagstermin —,
 * ebenfalls nicht. Ein Termin mit unlesbarem Datum liefert NaN und fällt
 * aus jedem Vergleich heraus.
 */
export function amWochenende(t: Termin, jetzt: Date = new Date(), zone: string = site.zeitzone): boolean {
  if (t.collection !== "events" || eventVorbei(t.daten, jetzt, zone)) return false;
  const { samstag, sonntag } = wochenende(jetzt, zone);
  const von = tagesnummer(t.daten.beginn as Datumswert, zone);
  const bis = tagesnummer((t.daten.ende ?? t.daten.beginn) as Datumswert, zone);
  return von <= sonntag && bis >= samstag;
}

const nachBeginn = (a: Termin, b: Termin) => +new Date(a.daten.beginn) - +new Date(b.daten.beginn);

/**
 * Die beiden Terminblöcke: „Dieses Wochenende" und „Als Nächstes".
 *
 * Kein Termin steht in beiden. Der Kalender beginnt nach dem Wochenende
 * und nimmt nur, was das Wochenende nicht schon zeigt — sonst stünde der
 * Weekender zweimal untereinander.
 */
export function terminbloecke<T extends Termin>(
  eintraege: T[],
  jetzt: Date = new Date(),
  anzahl = 8,
  zone: string = site.zeitzone,
): { wochenende: T[]; kalender: T[] } {
  const events = eintraege.filter((e) => e.collection === "events");
  const amWE = events.filter((e) => amWochenende(e, jetzt, zone)).sort(nachBeginn);
  const drin = new Set(amWE);
  const kalender = events
    .filter((e) => !drin.has(e) && !eventVorbei(e.daten, jetzt, zone))
    .sort(nachBeginn)
    .slice(0, anzahl);
  return { wochenende: amWE, kalender };
}

/**
 * Begriff im Fokus: je Kalenderwoche (Montag bis Sonntag, in `zone`) der
 * nächste Lexikoneintrag in fester Reihenfolge nach Slug.
 *
 * Gezählt werden Wochen seit 1970 statt Kalenderwochen eines Jahres — an
 * der Jahresgrenze mit 52 oder 53 Wochen stünde sonst zweimal derselbe
 * Begriff oder einer fiele aus. Übergeben werden nur freigegebene Einträge
 * (holeFreigegebeneRegistry): Ein Entwurf wird nicht beworben.
 */
export function begriffDerWoche<T extends Termin>(
  eintraege: T[],
  jetzt: Date = new Date(),
  zone: string = site.zeitzone,
): T | undefined {
  const lexikon = eintraege.filter((e) => e.collection === "lexikon").sort((a, b) => a.slug.localeCompare(b.slug));
  if (lexikon.length === 0) return undefined;
  const woche = Math.floor((tagesnummer(jetzt, zone) + 3) / 7);
  return lexikon[woche % lexikon.length];
}

/** Kommende Termine je Region, nur Regionen mit mindestens einem. */
export function termineJeRegion(eintraege: Termin[], jetzt: Date = new Date(), zone: string = site.zeitzone): Map<string, number> {
  const zaehlung = new Map<string, number>();
  for (const e of eintraege) {
    if (e.collection !== "events" || typeof e.daten.region !== "string" || eventVorbei(e.daten, jetzt, zone)) continue;
    zaehlung.set(e.daten.region, (zaehlung.get(e.daten.region) ?? 0) + 1);
  }
  return zaehlung;
}
