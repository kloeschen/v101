#!/usr/bin/env -S npx tsx
/**
 * test-startseite.ts — rechnet die Startseite, was sie verspricht?
 *
 * Etappe 4 der Plattenhülle (DESIGN-BRIEF.md, „Neue Bausteine"): „Dieses
 * Wochenende" heißt nur Samstag und Sonntag, der Kalender darunter zeigt
 * nichts doppelt, und der Begriff im Fokus wechselt einmal je Woche. Alle
 * drei hängen am Wochentag — und der Wochentag hängt an der Zeitzone
 * (Lektion 1): Samstag 00:30 in Berlin ist auf einem UTC-Runner Freitag.
 *
 * Deshalb wie test-datum.ts: Die Datei startet sich unter vier fremden
 * Prozesszeitzonen neu und muss überall dasselbe ergeben.
 *
 *   npx tsx scripts/test-startseite.ts
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tagesnummer } from "../src/lib/datum";
import { wochenende, amWochenende, terminbloecke, begriffDerWoche, termineJeRegion } from "../src/lib/startseite";

const SELBST = fileURLToPath(import.meta.url);
const UNTERLAUF = process.env.V101_TZ_UNTERLAUF === "1";
const ZONE = "Europe/Berlin";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/** Ein Zeitpunkt in Berliner Wanduhrzeit (Oktober 2026: Sommerzeit bis 25.10.). */
const um = (s: string) => new Date(s);
/** Tagesnummer eines Kalendertags, gelesen in Berlin. */
const tag = (ymd: string) => tagesnummer(new Date(`${ymd}T12:00:00+02:00`), ZONE);
/** Wie Zod ein Datum ohne Uhrzeit liefert: Mitternacht UTC. */
const datum = (ymd: string) => new Date(ymd);
const event = (slug: string, beginn: Date, ende?: Date, region?: string) => ({
  collection: "events" as const,
  slug,
  daten: { beginn, ...(ende ? { ende } : {}), ...(region ? { region } : {}) },
});
const begriff = (slug: string) => ({ collection: "lexikon" as const, slug, daten: {} });

/* ------------------------------------------------------------------ */
/* 1. Welches Wochenende ist „dieses"?                                  */
/* ------------------------------------------------------------------ */
// Der 2. Oktober 2026 ist ein Freitag.
const SA = tag("2026-10-03");
const SO = tag("2026-10-04");
gleich("Freitag: das kommende Wochenende", wochenende(um("2026-10-02T10:00:00+02:00"), ZONE), { samstag: SA, sonntag: SO });
gleich("Montag: das Wochenende darauf", wochenende(um("2026-09-28T09:00:00+02:00"), ZONE), { samstag: SA, sonntag: SO });
gleich("Samstag: das laufende", wochenende(um("2026-10-03T15:00:00+02:00"), ZONE), { samstag: SA, sonntag: SO });
gleich("Sonntag spätabends: noch das laufende", wochenende(um("2026-10-04T23:30:00+02:00"), ZONE), { samstag: SA, sonntag: SO });
// Samstag 00:30 Berlin ist Freitag 22:30 UTC. Für das Wochenende selbst
// unterscheidet das nichts (vom Freitag aus ist es dasselbe) — der Fall
// steht hier der Vollständigkeit halber. Die Falle aus Lektion 1 schnappt
// an der Montagsgrenze darunter zu (Mutationsbeleg 2026-10-02: Rechnung in
// UTC lässt genau sie fallen) und beim Termin um 00:30 in Abschnitt 2.
gleich("Samstag 00:30 Ortszeit zählt als Samstag", wochenende(um("2026-10-03T00:30:00+02:00"), ZONE), { samstag: SA, sonntag: SO });
// Montag 00:30 Berlin ist Sonntag 22:30 UTC — und schon die nächste Woche.
gleich(
  "Montag 00:30 Ortszeit gehört zur neuen Woche",
  wochenende(um("2026-10-05T00:30:00+02:00"), ZONE),
  { samstag: tag("2026-10-10"), sonntag: tag("2026-10-11") },
);

/* ------------------------------------------------------------------ */
/* 2. Gehört ein Termin dazu?                                           */
/* ------------------------------------------------------------------ */
const FREITAG = um("2026-10-02T10:00:00+02:00");
const nurFreitag = event("nur-freitag", datum("2026-10-02"));
const weekender = event("weekender", datum("2026-10-02"), datum("2026-10-04"));
const samstag = event("samstag", datum("2026-10-03"));
const sonntag = event("sonntag", datum("2026-10-04"));
const montag = event("montag", datum("2026-10-05"));
const ueberMontag = event("so-bis-mo", datum("2026-10-04"), datum("2026-10-05"));
const kurzNachMitternacht = event("sa-0030", um("2026-10-03T00:30:00+02:00"));
const vorbei = event("vorbei", datum("2026-09-26"));

// Positive Lebenszeichen zuerst: Ohne sie wäre jedes „gehört nicht dazu"
// auch für eine Funktion wahr, die immer false liefert.
pruefe("Samstagstermin gehört dazu", amWochenende(samstag, FREITAG, ZONE));
pruefe("Sonntagstermin gehört dazu", amWochenende(sonntag, FREITAG, ZONE));
pruefe("Weekender Freitag–Sonntag gehört dazu (Überlappung)", amWochenende(weekender, FREITAG, ZONE));
pruefe("Sonntag–Montag gehört dazu (Überlappung)", amWochenende(ueberMontag, FREITAG, ZONE));
pruefe("Samstag 00:30 Ortszeit gehört dazu", amWochenende(kurzNachMitternacht, FREITAG, ZONE));
// Die Negativfälle.
pruefe("nur Freitag gehört nicht dazu", !amWochenende(nurFreitag, FREITAG, ZONE));
pruefe("Montag gehört nicht dazu", !amWochenende(montag, FREITAG, ZONE));
// Montag 00:30 Berlin ist Sonntag 22:30 UTC: Wer den Beginn in UTC liest,
// holt ihn ins Wochenende (Mutationsbeleg 2026-10-02).
pruefe("Montag 00:30 Ortszeit gehört nicht dazu", !amWochenende(event("mo-0030", um("2026-10-05T00:30:00+02:00")), FREITAG, ZONE));
pruefe("Vergangenes gehört nicht dazu", !amWochenende(vorbei, FREITAG, ZONE));
const SONNTAG = um("2026-10-04T12:00:00+02:00");
pruefe("am Sonntag: Samstagstermin ist vorbei, gehört nicht mehr dazu", !amWochenende(samstag, SONNTAG, ZONE));
pruefe("am Sonntag: Weekender läuft noch", amWochenende(weekender, SONNTAG, ZONE));
pruefe("unlesbares Datum gehört nicht dazu", !amWochenende(event("kaputt", new Date(NaN)), FREITAG, ZONE));
pruefe("ein Nicht-Termin gehört nicht dazu", !amWochenende({ ...samstag, collection: "lexikon" as never }, FREITAG, ZONE));

/* ------------------------------------------------------------------ */
/* 3. Wochenende und Kalender ohne Doppelungen                          */
/* ------------------------------------------------------------------ */
{
  const spaeter = Array.from({ length: 12 }, (_, i) => event(`spaeter-${i}`, datum(`2026-11-${String(10 + i).padStart(2, "0")}`)));
  const alle = [montag, ...spaeter, sonntag, vorbei, nurFreitag, weekender, samstag, begriff("rockabilly")];
  const { wochenende: we, kalender } = terminbloecke(alle, FREITAG, 8, ZONE);
  gleich("Wochenende: genau die drei, nach Beginn", we.map((e) => e.slug), ["weekender", "samstag", "sonntag"]);
  pruefe("Kalender hat Einträge (Lebenszeichen)", kalender.length > 0);
  gleich("Kalender: kein Termin aus dem Wochenende", kalender.filter((e) => we.includes(e)).map((e) => e.slug), []);
  gleich("Kalender beginnt mit dem heutigen Freitag, dann Montag", kalender.slice(0, 2).map((e) => e.slug), ["nur-freitag", "montag"]);
  pruefe("Kalender ohne Vergangenes", !kalender.includes(vorbei));
  pruefe("Kalender ohne Nicht-Termine", kalender.every((e) => e.collection === "events"));
  gleich("Kalender ist auf die Anzahl begrenzt", kalender.length, 8);
  const leer = terminbloecke([montag, ...spaeter], FREITAG, 8, ZONE);
  gleich("leeres Wochenende bleibt leer", leer.wochenende.length, 0);
  gleich("dann beginnt der Kalender mit dem nächsten Termin", leer.kalender[0]?.slug, "montag");
}

/* ------------------------------------------------------------------ */
/* 4. Begriff der Woche                                                 */
/* ------------------------------------------------------------------ */
{
  const lexikon = ["petticoat", "bleistiftrock", "rockabilly", "jive", "pomade"].map(begriff);
  const am = (s: string) => begriffDerWoche(lexikon, um(s), ZONE)?.slug;
  const montagFrueh = am("2026-09-28T00:05:00+02:00");
  pruefe("liefert einen Begriff (Lebenszeichen)", typeof montagFrueh === "string");
  gleich("Montag früh und Sonntag spät: derselbe Begriff", am("2026-10-04T23:55:00+02:00"), montagFrueh);
  pruefe("die Woche darauf: ein anderer", am("2026-10-05T00:30:00+02:00") !== montagFrueh, String(montagFrueh));
  // Fünf Wochen hintereinander zeigen jeden der fünf Begriffe genau einmal.
  const fuenf = Array.from({ length: 5 }, (_, i) =>
    begriffDerWoche(lexikon, new Date(um("2026-10-05T12:00:00+02:00").getTime() + i * 7 * 86_400_000), ZONE)?.slug);
  gleich("fünf Wochen, fünf verschiedene Begriffe", new Set(fuenf).size, 5);
  gleich("Reihenfolge hängt nicht an der Eingabe", begriffDerWoche([...lexikon].reverse(), um("2026-10-02T12:00:00+02:00"), ZONE)?.slug,
    begriffDerWoche(lexikon, um("2026-10-02T12:00:00+02:00"), ZONE)?.slug);
  // Jahreswechsel mitten in der Woche: Do 31.12.2026 und Fr 1.1.2027.
  gleich("über den Jahreswechsel dieselbe Woche", begriffDerWoche(lexikon, um("2027-01-01T12:00:00+01:00"), ZONE)?.slug,
    begriffDerWoche(lexikon, um("2026-12-31T12:00:00+01:00"), ZONE)?.slug);
  gleich("ohne Lexikon kein Begriff", begriffDerWoche([event("x", datum("2026-10-03"))], FREITAG, ZONE), undefined);
}

/* ------------------------------------------------------------------ */
/* 5. Termine je Region                                                 */
/* ------------------------------------------------------------------ */
{
  const z = termineJeRegion([
    event("a", datum("2026-10-03"), undefined, "berlin"),
    event("b", datum("2026-11-03"), undefined, "berlin"),
    event("c", datum("2026-10-10"), undefined, "bayern"),
    event("d", datum("2026-09-03"), undefined, "bayern"),
    event("e", datum("2026-09-03"), undefined, "brandenburg"),
  ], FREITAG, ZONE);
  gleich("kommende Termine je Region, Vergangenes nicht gezählt", [...z.entries()].sort(), [["bayern", 1], ["berlin", 2]]);
}

/* ------------------------------------------------------------------ */
/* Unabhängigkeit von der Prozess-Zeitzone (Lektion 1)                 */
/* ------------------------------------------------------------------ */
if (!UNTERLAUF) {
  for (const tz of ["UTC", "Europe/Berlin", "Pacific/Kiritimati", "Pacific/Niue"]) {
    const lauf = spawnSync("npx", ["tsx", SELBST], {
      env: { ...process.env, TZ: tz, V101_TZ_UNTERLAUF: "1" },
      encoding: "utf8",
    });
    pruefe(
      `dieselben Ergebnisse unter TZ=${tz}`,
      lauf.status === 0,
      `${(lauf.stdout ?? "").trim().split("\n").slice(-3).join(" | ")}${lauf.stderr ? ` :: ${lauf.stderr.trim().slice(0, 200)}` : ""}`,
    );
  }
}

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
