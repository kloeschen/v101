/**
 * datum.ts — die eine Antwort auf die Frage "ist das vorbei?".
 *
 * Befund M9: Sechs Stellen beantworteten diese Frage, und alle gleich falsch.
 * `new Date(ende ?? beginn) < jetzt` sieht richtig aus, ist es aber nicht:
 * `z.coerce.date()` macht aus `beginn: 2026-09-03` (ein Datum ohne Uhrzeit)
 * den Zeitstempel Mitternacht UTC. Ab 00:01 UTC — in Berlin ab 02:01
 * Ortszeit derselben Nacht — galt der heutige Termin als vergangen. Der
 * Validator verlangte dann `stattgefunden` für einen Termin, der erst
 * abends stattfand.
 *
 * Die Semantik ist entschieden und steht in ENTSCHEIDUNGEN.md:
 *
 *   Ein Event ist vorbei, wenn das ENDE SEINES LETZTEN TAGES in der
 *   Zeitzone der Site überschritten ist.
 *
 * Nicht "der Zeitstempel liegt in der Vergangenheit", sondern "der Tag ist
 * um". Das ist auch für Einträge mit Uhrzeit richtig: Ein Konzert um 20 Uhr
 * ist um 21 Uhr nicht "vorbei", es läuft. Und die Regel braucht keine
 * Heuristik, die Datum von Zeitstempel unterscheidet — die Unterscheidung
 * ist nach der Zod-Konvertierung ohnehin verloren.
 *
 * Die Rechnung läuft in `site.zeitzone`, nie in der Zeitzone des Prozesses
 * (Lektion 1). Auf einem UTC-Runner endet der 3. September in Berlin um
 * 22:00 UTC, nicht um 00:00 UTC.
 *
 * Dieses Modul wird von Astro UND von den Skripten in scripts/ importiert.
 * Es darf deshalb kein `import.meta` verwenden (Lektion 2); `site.config.ts`
 * kapselt den Zugriff bereits.
 */

import { site } from "../site.config";

/** Ein Datumswert in den Formen, in denen er hier ankommt. */
export type Datumswert = Date | string | number;

const FORMATIERER = new Map<string, Intl.DateTimeFormat>();

function formatierer(zone: string): Intl.DateTimeFormat {
  let f = FORMATIERER.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      // h23 statt hour12: false — sonst liefern manche ICU-Fassungen für
      // Mitternacht die Stunde "24" statt "00".
      hourCycle: "h23",
    });
    FORMATIERER.set(zone, f);
  }
  return f;
}

interface Wanduhr {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Was die Wanduhr in `zone` zum Zeitpunkt `d` zeigt. */
function wanduhr(d: Date, zone: string): Wanduhr {
  const teile: Record<string, number> = {};
  for (const t of formatierer(zone).formatToParts(d)) {
    if (t.type !== "literal") teile[t.type] = Number(t.value);
  }
  return {
    year: teile.year,
    month: teile.month,
    day: teile.day,
    hour: teile.hour % 24,
    minute: teile.minute,
    second: teile.second,
  };
}

/**
 * Verschiebung der Zone gegen UTC in Millisekunden, gültig zum Zeitpunkt
 * `d`. Berlin liefert +3600000 im Winter, +7200000 im Sommer.
 */
function versatz(d: Date, zone: string): number {
  const w = wanduhr(d, zone);
  const alsWaereEsUTC = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  // Auf volle Sekunden abschneiden: Die formatierten Teile haben keine
  // Millisekunden, der Rohwert kann welche haben.
  return alsWaereEsUTC - Math.floor(d.getTime() / 1000) * 1000;
}

/**
 * Der Zeitpunkt, zu dem die Wanduhr in `zone` auf y-m-tag 00:00 steht.
 * `tag` darf überlaufen (32 im Januar heißt 1. Februar) — Date.UTC
 * normalisiert das.
 *
 * Zwei Durchgänge wegen der Zeitumstellung: Der erste Versatz wird an einem
 * geschätzten Zeitpunkt gemessen, der auf der falschen Seite der Umstellung
 * liegen kann. Ergibt die Korrektur einen anderen Versatz, gilt der zweite.
 */
function ortsMitternacht(jahr: number, monat: number, tag: number, zone: string): Date {
  const naiv = Date.UTC(jahr, monat - 1, tag, 0, 0, 0);
  const v1 = versatz(new Date(naiv), zone);
  const kandidat = naiv - v1;
  const v2 = versatz(new Date(kandidat), zone);
  return new Date(v2 === v1 ? kandidat : naiv - v2);
}

/**
 * Der Zeitpunkt, an dem der Tag endet, in den `datum` in `zone` fällt —
 * also Mitternacht des Folgetags. Ein Termin am 3. September endet für
 * Berlin am 4. September um 00:00 Ortszeit (= 3. September 22:00 UTC im
 * Sommer).
 *
 * Ein unlesbares Datum liefert ein ungültiges Date; die Prüfung darauf
 * gehört an die Aufrufstelle, `istVorbei` erledigt sie selbst.
 */
export function endeDesTages(datum: Datumswert, zone: string = site.zeitzone): Date {
  const d = datum instanceof Date ? datum : new Date(datum);
  if (Number.isNaN(d.getTime())) return new Date(NaN);
  const w = wanduhr(d, zone);
  return ortsMitternacht(w.year, w.month, w.day + 1, zone);
}

/**
 * Ist der Tag, in den `datum` fällt, vorbei?
 *
 * Ein unlesbares Datum ist nicht vorbei: Über einen Wert, den man nicht
 * lesen kann, ist keine Aussage zu treffen — und `false` lässt ihn in den
 * kommenden Terminen sichtbar, wo er auffällt, statt ihn ins Archiv zu
 * schieben, wo er nicht mehr stört.
 */
export function istVorbei(datum: Datumswert, jetzt: Date = new Date(), zone: string = site.zeitzone): boolean {
  const ende = endeDesTages(datum, zone);
  if (Number.isNaN(ende.getTime())) return false;
  return jetzt.getTime() >= ende.getTime();
}

/**
 * Die Gegenprobe. Kein eigener Vergleich, damit es keinen Rand gibt, an dem
 * ein Termin weder kommend noch vergangen ist.
 */
export function istKommend(datum: Datumswert, jetzt: Date = new Date(), zone: string = site.zeitzone): boolean {
  return !istVorbei(datum, jetzt, zone);
}

/**
 * Der maßgebliche Datumswert eines Events: das Ende, sonst der Beginn.
 * Ein dreitägiges Festival ist am ersten Abend nicht vorbei.
 */
export function eventDatum(daten: { beginn?: Datumswert; ende?: Datumswert } | null | undefined): Datumswert | undefined {
  return daten?.ende ?? daten?.beginn;
}

/** Kurzform für den häufigsten Fall: "ist dieses Event vorbei?" */
export function eventVorbei(
  daten: { beginn?: Datumswert; ende?: Datumswert } | null | undefined,
  jetzt: Date = new Date(),
  zone: string = site.zeitzone,
): boolean {
  const d = eventDatum(daten);
  return d === undefined ? false : istVorbei(d, jetzt, zone);
}
