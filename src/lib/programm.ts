/**
 * programm.ts — das Programm eines Termins: was wann wo läuft.
 *
 * Das Feld `programm` (Entscheidung 2026-10-02, ENTSCHEIDUNGEN.md, „Line-up
 * als Zeitplan") ist eine Liste von Punkten mit Uhrzeit, Art, Titel und
 * optional Band und Bühne. Dieses Modul rechnet zweierlei, beides aus Node
 * testbar (scripts/test-programm.ts):
 *
 *   - `programmZeilen`: die Tabelle für die Eventseite, sortiert und in
 *     `site.zeitzone` formatiert (Lektion 1).
 *   - `programmBefunde`: was an einem Programm nicht stimmen kann. Die Regel
 *     `event-programm` in validate-content.ts meldet das als Fehler.
 *
 * Kein Import aus registry.ts (astro:content, Lektion 2), nur Typen und
 * `aufloesen` aus links.ts.
 */
import { site } from "../site.config";
import { tagesnummer, type Datumswert } from "./datum";
import { aufloesen, type Registry } from "./links";

export const PROGRAMM_ART: Record<string, string> = {
  auftritt: "Live",
  dj: "DJ",
  kurs: "Kurs",
  sonstiges: "Programm",
};

export interface Programmpunkt {
  beginn: Datumswert;
  ende?: Datumswert;
  art: string;
  titel: string;
  band?: string;
  buehne?: string;
}

export interface ProgrammZeile {
  /** Tagesnummer in der Zone, für die Gruppierung nach Tagen. */
  tagNr: number;
  /** „Sa., 16. Jan." */
  tag: string;
  /** „20:30" oder „11:00–13:00" */
  zeit: string;
  /** ISO-Zeitstempel für <time datetime>. */
  datetime: string;
  art: string;
  titel: string;
  href?: string;
  buehne?: string;
}

const formate = new Map<string, { tag: Intl.DateTimeFormat; zeit: Intl.DateTimeFormat; stunde: Intl.DateTimeFormat }>();
function format(zone: string) {
  let f = formate.get(zone);
  if (!f) {
    f = {
      tag: new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "short", timeZone: zone }),
      zeit: new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zone }),
      stunde: new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: zone }),
    };
    formate.set(zone, f);
  }
  return f;
}

const alsDate = (d: Datumswert) => (d instanceof Date ? d : new Date(d));

/**
 * Die Zeilen der Programmtabelle, nach Beginn sortiert. Eine Band mit
 * eigener Seite wird verlinkt, wenn die Registry sie kennt — sonst bleibt der
 * Titel Text (ein Entwurf ist in der Produktion nicht da).
 */
export function programmZeilen(
  programm: Programmpunkt[] | undefined,
  registry?: Registry,
  zone: string = site.zeitzone,
): ProgrammZeile[] {
  const f = format(zone);
  return [...(programm ?? [])]
    .filter((p) => !Number.isNaN(alsDate(p.beginn).getTime()))
    .sort((a, b) => +alsDate(a.beginn) - +alsDate(b.beginn))
    .map((p) => {
      const beginn = alsDate(p.beginn);
      const ende = p.ende === undefined ? undefined : alsDate(p.ende);
      const band = p.band && registry ? aufloesen(registry, "bands", p.band) : undefined;
      return {
        tagNr: tagesnummer(beginn, zone),
        tag: f.tag.format(beginn),
        zeit: f.zeit.format(beginn) + (ende && !Number.isNaN(ende.getTime()) ? `–${f.zeit.format(ende)}` : ""),
        datetime: beginn.toISOString(),
        art: PROGRAMM_ART[p.art] ?? p.art,
        titel: p.titel,
        href: band?.pfad,
        buehne: p.buehne,
      };
    });
}

/** Bis zu dieser Stunde des Folgetags zählt ein Punkt noch zum letzten Tag (Nachtprogramm). */
export const NACHT_BIS_STUNDE = 6;

export interface ProgrammBefund {
  index: number;
  nachricht: string;
}

/**
 * Was an einem Programm nicht stimmen kann:
 *
 *   - Ein Punkt liegt außerhalb des Termins. Erlaubt ist vom ersten Tag an
 *     bis zum letzten Tag, dazu die Nacht danach bis 06:00 Ortszeit — eine
 *     Aftershowparty um 01:00 gehört zum Samstag, nicht zum Sonntag.
 *   - Ein Punkt endet vor seinem Beginn.
 *   - `band` steht nicht im Line-up. Das Line-up ist die Liste, die
 *     verlinkt, geprüft und belegt wird; das Programm ordnet sie nur zeitlich.
 *
 * Ob jeder Punkt eine Uhrzeit hat, sieht man einem Date nicht mehr an; das
 * prüft die Regel `event-programm` am Text des Frontmatters.
 */
export function programmBefunde(
  daten: { beginn?: Datumswert; ende?: Datumswert; lineupBands?: string[]; programm?: Programmpunkt[] },
  zone: string = site.zeitzone,
): ProgrammBefund[] {
  const befunde: ProgrammBefund[] = [];
  if (!daten.beginn) return befunde;
  const ersterTag = tagesnummer(daten.beginn, zone);
  const letzterTag = tagesnummer(daten.ende ?? daten.beginn, zone);
  const lineup = new Set(daten.lineupBands ?? []);
  const f = format(zone);

  for (const [index, p] of (daten.programm ?? []).entries()) {
    const beginn = alsDate(p.beginn);
    if (Number.isNaN(beginn.getTime())) {
      befunde.push({ index, nachricht: `„${p.titel}": Beginn ist kein lesbares Datum.` });
      continue;
    }
    const tag = tagesnummer(beginn, zone);
    const stunde = Number(f.stunde.format(beginn)) % 24;
    const inNacht = tag === letzterTag + 1 && stunde < NACHT_BIS_STUNDE;
    if (tag < ersterTag || (tag > letzterTag && !inNacht)) {
      befunde.push({ index, nachricht: `„${p.titel}" liegt außerhalb des Termins (${f.tag.format(beginn)}, ${f.zeit.format(beginn)}).` });
    }
    if (p.ende !== undefined && +alsDate(p.ende) < +beginn) {
      befunde.push({ index, nachricht: `„${p.titel}" endet vor seinem Beginn.` });
    }
    if (p.band && !lineup.has(p.band)) {
      befunde.push({ index, nachricht: `„${p.titel}": band „${p.band}" steht nicht in lineupBands.` });
    }
  }
  return befunde;
}
