#!/usr/bin/env -S npx tsx
/**
 * test-datum.ts — der Beweis für die eine Antwort auf "ist das vorbei?".
 *
 * Befund M9: Sechs Stellen verglichen `new Date(ende ?? beginn)` gegen jetzt.
 * `z.coerce.date()` macht aus einem Datum ohne Uhrzeit Mitternacht UTC, also
 * galt ein Termin von heute ab 00:01 UTC als vergangen — in Berlin ab 02:01
 * Ortszeit derselben Nacht. Die Antwort steht jetzt in src/lib/datum.ts.
 *
 * Diese Datei prüft sie an den Rändern, an denen sie falsch sein könnte:
 * Mitternacht (beide Seiten), beide Zeitumstellungen, Jahreswechsel,
 * mehrtägige Termine, unlesbare Werte. Und sie prüft, was die Rechnung von
 * der alten unterscheidet: dass sie in `site.zeitzone` läuft und nicht in der
 * des Servers. Dafür startet sie sich selbst unter fremden TZ neu — Lektion 1
 * ist viermal in dieser Codebasis aufgetreten, ein Test unter einer einzigen
 * Prozesszeitzone wäre kein Beleg.
 *
 *   npx tsx scripts/test-datum.ts
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { endeDesTages, istVorbei, istKommend, eventVorbei } from "../src/lib/datum";
import { site } from "../src/site.config";

const SELBST = fileURLToPath(import.meta.url);
/** Gesetzt in den Unterläufen, damit sie sich nicht weiter verzweigen. */
const UNTERLAUF = process.env.V101_TZ_UNTERLAUF === "1";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

const iso = (d: Date) => d.toISOString();

/* ------------------------------------------------------------------ */
/* endeDesTages — der Tag endet um Mitternacht Ortszeit                */
/* ------------------------------------------------------------------ */

gleich("Zeitzone der Site ist die erwartete", site.zeitzone, "Europe/Berlin");

// Sommerzeit: Berlin ist UTC+2, der 3.9. endet um 22:00 UTC.
gleich("Datum ohne Uhrzeit, Sommerzeit", iso(endeDesTages("2026-09-03")), "2026-09-03T22:00:00.000Z");
// Winterzeit: UTC+1, der 15.1. endet um 23:00 UTC.
gleich("Datum ohne Uhrzeit, Winterzeit", iso(endeDesTages("2026-01-15")), "2026-01-15T23:00:00.000Z");

// Eine Uhrzeit ändert nichts am Tagesende — genau das ist der Punkt.
gleich(
  "Uhrzeit im Wert ändert das Tagesende nicht",
  iso(endeDesTages("2026-09-03T20:00:00+02:00")),
  iso(endeDesTages("2026-09-03")),
);
gleich(
  "auch eine Uhrzeit kurz vor Mitternacht nicht",
  iso(endeDesTages("2026-09-03T23:59:59+02:00")),
  "2026-09-03T22:00:00.000Z",
);

// Zeitumstellung: Der 29.3.2026 hat in Berlin 23 Stunden, der 25.10. deren 25.
gleich("Tag vor der Umstellung nach vorn", iso(endeDesTages("2026-03-28")), "2026-03-28T23:00:00.000Z");
gleich("Umstellungstag selbst (23 Stunden)", iso(endeDesTages("2026-03-29")), "2026-03-29T22:00:00.000Z");
gleich("Tag vor der Umstellung zurück", iso(endeDesTages("2026-10-24")), "2026-10-24T22:00:00.000Z");
gleich("Umstellungstag selbst (25 Stunden)", iso(endeDesTages("2026-10-25")), "2026-10-25T23:00:00.000Z");

// Monats- und Jahreswechsel: Date.UTC muss den Überlauf normalisieren.
gleich("Monatswechsel", iso(endeDesTages("2026-01-31")), "2026-01-31T23:00:00.000Z");
gleich("Schalttag", iso(endeDesTages("2028-02-29")), "2028-02-29T23:00:00.000Z");
gleich(
  "Silvester endet zum Jahreswechsel Ortszeit",
  iso(endeDesTages("2026-12-31T23:30:00+01:00")),
  "2026-12-31T23:00:00.000Z",
);

pruefe("unlesbares Datum ergibt ein ungültiges Date", Number.isNaN(endeDesTages("kein datum").getTime()));

/* ------------------------------------------------------------------ */
/* istVorbei — der Kern von M9                                         */
/* ------------------------------------------------------------------ */

{
  // 00:30 UTC am 3. September = 02:30 Ortszeit. Genau hier lag der Fehler:
  // Der alte Vergleich erklärte den heutigen Termin für vorbei.
  const nachts = new Date("2026-09-03T00:30:00Z");
  gleich("Termin von heute ist nachts um halb drei nicht vorbei", istVorbei("2026-09-03", nachts), false);
  gleich("Termin von gestern ist vorbei", istVorbei("2026-09-02", nachts), true);
  gleich("Termin von morgen ist nicht vorbei", istVorbei("2026-09-04", nachts), false);
  gleich("Termin heute Abend ist nachts davor nicht vorbei", istVorbei("2026-09-03T20:00:00+02:00", nachts), false);

  // Der Rand selbst: exakt Mitternacht Ortszeit ist der Tag um.
  const mitternacht = new Date("2026-09-03T22:00:00.000Z");
  gleich("um Mitternacht Ortszeit ist der Tag vorbei", istVorbei("2026-09-03", mitternacht), true);
  gleich(
    "eine Millisekunde davor nicht",
    istVorbei("2026-09-03", new Date("2026-09-03T21:59:59.999Z")),
    false,
  );

  // Ein Konzert um 20 Uhr ist um 21 Uhr nicht vorbei, es läuft.
  const abends = new Date("2026-09-03T19:00:00Z"); // 21:00 Ortszeit
  gleich("laufendes Konzert gilt nicht als vorbei", istVorbei("2026-09-03T20:00:00+02:00", abends), false);

  gleich("istKommend ist die Gegenprobe", istKommend("2026-09-03", nachts), true);
  gleich("istKommend am Rand", istKommend("2026-09-03", mitternacht), false);
  gleich("unlesbares Datum ist nicht vorbei", istVorbei("kein datum", nachts), false);
}

/* ------------------------------------------------------------------ */
/* eventVorbei — Ende schlägt Beginn                                   */
/* ------------------------------------------------------------------ */

{
  const zweiterTag = new Date("2026-07-03T12:00:00Z");
  gleich(
    "dreitägiges Festival ist am zweiten Tag nicht vorbei",
    eventVorbei({ beginn: "2026-07-02", ende: "2026-07-04" }, zweiterTag),
    false,
  );
  gleich(
    "am letzten Tag ebenfalls nicht",
    eventVorbei({ beginn: "2026-07-02", ende: "2026-07-04" }, new Date("2026-07-04T12:00:00Z")),
    false,
  );
  gleich(
    "erst danach",
    eventVorbei({ beginn: "2026-07-02", ende: "2026-07-04" }, new Date("2026-07-05T12:00:00Z")),
    true,
  );
  gleich(
    "ohne ende zählt beginn",
    eventVorbei({ beginn: "2026-07-02" }, zweiterTag),
    true,
  );
  gleich("ohne Datum keine Aussage", eventVorbei({}, zweiterTag), false);
  gleich("ohne Daten keine Aussage", eventVorbei(undefined, zweiterTag), false);
}

/* ------------------------------------------------------------------ */
/* Unabhängigkeit von der Prozess-Zeitzone (Lektion 1)                 */
/* ------------------------------------------------------------------ */

if (!UNTERLAUF) {
  // Vier Zonen quer über die Datumsgrenze: UTC, die Site-Zone selbst, +14
  // und -11. Fiele die Rechnung auf die Prozesszeitzone zurück, läge in
  // mindestens einer davon ein anderer Tag an.
  const zonen = ["UTC", "Europe/Berlin", "Pacific/Kiritimati", "Pacific/Niue"];
  for (const tz of zonen) {
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

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
