#!/usr/bin/env -S npx tsx
/**
 * test-programm.ts — rechnet das Programm eines Termins, was es verspricht?
 *
 * Das Feld `programm` (Entscheidung 2026-10-02) trägt Uhrzeiten, und
 * Uhrzeiten hängen an der Zeitzone (Lektion 1): 00:30 in Berlin ist in UTC
 * noch der Vortag. Deshalb wie test-datum.ts: Die Datei startet sich unter
 * vier fremden Prozesszeitzonen neu und muss überall dasselbe ergeben.
 *
 *   npx tsx scripts/test-programm.ts
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { programmZeilen, programmBefunde, type Programmpunkt } from "../src/lib/programm";
import { buildRegistry } from "../src/lib/links";

const SELBST = fileURLToPath(import.meta.url);
const UNTERLAUF = process.env.V101_TZ_UNTERLAUF === "1";
const ZONE = "Europe/Berlin";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

const d = (s: string) => new Date(s);
/** Ein Weekender Fr 15. – So 17. Januar 2027, wie Zod die Daten liefert. */
const weekender = (programm: Programmpunkt[], lineupBands: string[] = []) => ({
  beginn: d("2027-01-15T14:00:00+01:00"),
  ende: d("2027-01-17"),
  lineupBands,
  programm,
});
const punkt = (beginn: string, titel: string, extra: Partial<Programmpunkt> = {}): Programmpunkt => ({
  beginn: d(beginn),
  art: "auftritt",
  titel,
  ...extra,
});

/* ------------------------------------------------------------------ */
/* 1. Zeilen                                                           */
/* ------------------------------------------------------------------ */
{
  const registry = buildRegistry([
    { collection: "bands", slug: "boppin-b", daten: { name: "Boppin'B", kurzbeschreibung: "x".repeat(40) } },
  ]);
  const zeilen = programmZeilen(
    [
      punkt("2027-01-16T14:30:00+01:00", "Boogie-Woogie-Kurs II", { art: "kurs", ende: d("2027-01-16T17:15:00+01:00") }),
      punkt("2027-01-15T20:30:00+01:00", "Boppin'B", { band: "boppin-b", buehne: "Saal" }),
      punkt("2027-01-16T11:00:00+01:00", "Boogie-Woogie-Kurs I", { art: "kurs", ende: d("2027-01-16T13:00:00+01:00") }),
      punkt("2027-01-16T00:30:00+01:00", "DJ Nachtschicht", { art: "dj" }),
    ],
    registry,
    ZONE,
  );
  pruefe("vier Zeilen (Lebenszeichen)", zeilen.length === 4, String(zeilen.length));
  gleich("nach Beginn sortiert", zeilen.map((z) => z.titel), ["Boppin'B", "DJ Nachtschicht", "Boogie-Woogie-Kurs I", "Boogie-Woogie-Kurs II"]);
  gleich("Uhrzeit in Ortszeit", zeilen[0].zeit, "20:30");
  gleich("mit Ende als Spanne", zeilen[2].zeit, "11:00–13:00");
  gleich("Tag in Ortszeit", zeilen[0].tag, "Fr., 15. Jan.");
  // 00:30 Berlin ist 23:30 UTC des Vortags.
  gleich("00:30 Ortszeit steht unter Samstag", zeilen[1].tag, "Sa., 16. Jan.");
  gleich("00:30 Ortszeit als 00:30", zeilen[1].zeit, "00:30");
  gleich("Band mit Seite verlinkt", zeilen[0].href, "/bands/boppin-b/");
  gleich("Kurs ohne Band: kein Link", zeilen[2].href, undefined);
  gleich("Art als Wort", [zeilen[0].art, zeilen[1].art, zeilen[2].art], ["Live", "DJ", "Kurs"]);
  gleich("Bühne durchgereicht", zeilen[0].buehne, "Saal");
  const ohne = programmZeilen([punkt("2027-01-15T20:30:00+01:00", "Boppin'B", { band: "boppin-b" })], undefined, ZONE);
  gleich("ohne Registry kein Link", ohne[0].href, undefined);
  gleich("leeres Programm: keine Zeilen", programmZeilen(undefined, undefined, ZONE), []);
}

/* ------------------------------------------------------------------ */
/* 2. Befunde                                                          */
/* ------------------------------------------------------------------ */
const befunde = (p: Programmpunkt[], lineup: string[] = []) => programmBefunde(weekender(p, lineup), ZONE);
const anzahl = (p: Programmpunkt[], lineup: string[] = []) => befunde(p, lineup).length;

// Positive Fälle zuerst: Ohne sie wäre jedes „meldet" auch für eine
// Funktion wahr, die immer etwas meldet.
gleich("Freitagabend: in Ordnung", anzahl([punkt("2027-01-15T20:30:00+01:00", "Band")]), 0);
gleich("letzter Tag: in Ordnung", anzahl([punkt("2027-01-17T15:00:00+01:00", "Frühschoppen")]), 0);
gleich("Nacht nach dem letzten Tag, 01:00: in Ordnung", anzahl([punkt("2027-01-18T01:00:00+01:00", "Aftershow")]), 0);
gleich("erster Tag 00:30 Ortszeit (in UTC Vortag): in Ordnung", anzahl([punkt("2027-01-15T00:30:00+01:00", "Warm-up")]), 0);
gleich("Band im Line-up: in Ordnung", anzahl([punkt("2027-01-15T20:30:00+01:00", "Boppin'B", { band: "boppin-b" })], ["boppin-b"]), 0);
// Die Negativfälle.
gleich("Tag vor dem Termin: gemeldet", anzahl([punkt("2027-01-14T20:00:00+01:00", "Vorabend")]), 1);
gleich("Folgetag 07:00: gemeldet", anzahl([punkt("2027-01-18T07:00:00+01:00", "Katerfrühstück")]), 1);
gleich("zwei Tage danach in der Nacht: gemeldet", anzahl([punkt("2027-01-19T01:00:00+01:00", "Zu spät")]), 1);
gleich("Ende vor Beginn: gemeldet", anzahl([punkt("2027-01-16T14:00:00+01:00", "Kurs", { ende: d("2027-01-16T13:00:00+01:00") })]), 1);
gleich("Band nicht im Line-up: gemeldet", anzahl([punkt("2027-01-15T20:30:00+01:00", "Boppin'B", { band: "boppin-b" })]), 1);
gleich("unlesbarer Beginn: gemeldet", anzahl([{ beginn: "kein Datum", art: "dj", titel: "Kaputt" }]), 1);
gleich("Index zeigt auf den Punkt", befunde([punkt("2027-01-15T20:30:00+01:00", "Gut"), punkt("2027-01-14T20:00:00+01:00", "Schlecht")])[0]?.index, 1);
{
  // Eintägiger Termin ohne Ende: Nacht bis 06:00 zählt dazu.
  const abend = { beginn: d("2026-11-06T20:00:00+01:00"), programm: [punkt("2026-11-07T02:00:00+01:00", "Letzte Runde")] };
  gleich("Tanzabend ohne Ende, 02:00 danach: in Ordnung", programmBefunde(abend, ZONE).length, 0);
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
