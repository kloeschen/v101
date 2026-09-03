#!/usr/bin/env -S npx tsx
/**
 * archive-events.ts — setzt vergangene Termine auf "stattgefunden".
 *
 * Bewusst ein deterministisches Skript und kein Agent: Die Regel ist
 * vollständig aus den Daten ableitbar (Enddatum liegt in der Vergangenheit,
 * Status steht noch auf "geplant"), es gibt nichts zu entscheiden und nichts
 * zu recherchieren. Alles, was ein Skript zuverlässig kann, sollte kein
 * Modell tun — das spart Geld, Zeit und eine Fehlerquelle.
 *
 * Abgesagte und verschobene Termine bleiben unangetastet: Diese Zustände
 * sind Aussagen über die Wirklichkeit, keine Ableitungen aus dem Kalender.
 *
 *   npx tsx scripts/archive-events.ts --dry-run
 *   npx tsx scripts/archive-events.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ladeAlle } from "./_laden";
import { eventVorbei } from "../src/lib/datum";

function main() {
  const trocken = process.argv.includes("--dry-run");
  const jetzt = new Date();
  let geaendert = 0;

  for (const e of ladeAlle({ collection: "events" })) {
    const d = e.daten;
    if (!d) continue; // Schemafehler zuerst beheben
    if (d.durchfuehrung !== "geplant" && d.durchfuehrung !== "ausverkauft") continue;
    // Tagesgenau in der Zeitzone der Site: Ein Termin von heute wird erst
    // nach Mitternacht Ortszeit archiviert, nicht ab 00:01 UTC (M9).
    if (!eventVorbei(d, jetzt)) continue;

    console.log(`${trocken ? "[dry] " : ""}${path.relative(process.cwd(), e.datei)} — ${d.name}: ${d.durchfuehrung} → stattgefunden`);
    geaendert++;
    if (trocken) continue;

    // Nur die eine Zeile anfassen. Ein Neuschreiben des Frontmatters würde
    // Formatierung und Feldreihenfolge zerstören — dieselbe Überlegung wie
    // in sync-autolinks.ts.
    const roh = readFileSync(e.datei, "utf8");
    const neu = roh.replace(/^durchfuehrung:[ \t]*\S+[ \t]*$/m, "durchfuehrung: stattgefunden");
    if (neu === roh) {
      console.error(`  übersprungen: Zeile "durchfuehrung:" nicht eindeutig gefunden.`);
      continue;
    }
    writeFileSync(e.datei, neu, "utf8");
  }

  console.log(`\n${geaendert} Termin(e) ${trocken ? "würden umgestellt" : "umgestellt"}.`);
}

main();
