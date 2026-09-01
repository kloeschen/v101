#!/usr/bin/env -S npx tsx
/**
 * sync-autolinks.ts — schreibt die Lexikon-Verlinkung in die Quelldateien.
 *
 * Warum in die Quelle und nicht beim Rendern?
 *
 *  - Die Links stehen im Git-Diff und sind damit vor dem Deploy überprüfbar.
 *    Eine automatische Verlinkung, die niemand zu Gesicht bekommt, verlinkt
 *    irgendwann etwas Dummes und keiner merkt es.
 *  - Astros Markdown-Pipeline bleibt unangetastet. Die Alternative wäre,
 *    den Fließtext an Astro vorbei selbst zu rendern.
 *  - `validate-content.ts` zählt interne Links im Quelltext. Nach dem Lauf
 *    stimmt diese Zählung mit dem überein, was die Seite tatsächlich zeigt.
 *
 * Der Lauf ist idempotent: bestehende Links sind geschützt und sperren ihr
 * Ziel, ein zweiter Durchlauf ändert nichts. Wächst das Lexikon, kommen beim
 * nächsten Lauf neue Links dazu — das ist gewollt.
 *
 *   npx tsx scripts/sync-autolinks.ts --dry-run     # nur zeigen
 *   npx tsx scripts/sync-autolinks.ts               # schreiben
 *   npx tsx scripts/sync-autolinks.ts --collection artikel
 *   npx tsx scripts/sync-autolinks.ts --max 8
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ladeAlle, alsRegistryEingaben } from "./_laden";
import { buildRegistry, autolink } from "../src/lib/links";
import { collectionNames, type CollectionName } from "../src/content/_schemas";

function main() {
  const argv = process.argv.slice(2);
  const wert = (n: string) => {
    const i = argv.indexOf(n);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const trocken = argv.includes("--dry-run");
  const nurCollection = wert("--collection") as CollectionName | undefined;
  const maxLinks = Number(wert("--max") ?? 12);

  if (nurCollection && !collectionNames.includes(nurCollection)) {
    console.error(`Unbekannte Collection "${nurCollection}".`);
    process.exit(2);
  }

  const alle = ladeAlle();
  const registry = buildRegistry(alsRegistryEingaben(alle));

  if (registry.begriffe.length === 0) {
    console.log("Kein Lexikonbegriff vorhanden — nichts zu verlinken.");
    return;
  }

  let geaendert = 0;
  let neueLinks = 0;

  for (const e of alle) {
    if (nurCollection && e.collection !== nurCollection) continue;
    if (e.daten === null) continue; // Schemafehler zuerst beheben

    const { markdown, verlinkt } = autolink(e.body, registry, {
      aktuell: { collection: e.collection, slug: e.slug },
      maxLinks,
    });
    if (verlinkt.length === 0 || markdown === e.body) continue;

    geaendert++;
    neueLinks += verlinkt.length;
    console.log(
      `${trocken ? "[dry] " : ""}${path.relative(process.cwd(), e.datei)} — ${verlinkt.length} neu: ${verlinkt.join(", ")}`,
    );

    if (trocken) continue;

    // Frontmatter unverändert übernehmen: gray-matter würde beim Neuschreiben
    // Formatierung, Kommentare und Feldreihenfolge zerstören. Der Block wird
    // deshalb per Regex abgetrennt und byteidentisch zurückgeschrieben —
    // NICHT per indexOf des Body-Texts: Der kann wörtlich im Frontmatter
    // vorkommen (kurzbeschreibung = erster Satz), und ein "---" in einem
    // YAML-Wert verschöbe den Suchanfang (Review-Befund M1).
    const roh = readFileSync(e.datei, "utf8");
    const kopf = roh.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (!kopf) {
      console.error(`  übersprungen: ${path.relative(process.cwd(), e.datei)} — Frontmatter-Block nicht gefunden.`);
      continue;
    }
    const bodyAlt = roh.slice(kopf[0].length);
    // Gegen den geladenen Body autolinken wäre eine zweite Wahrheit; die
    // Datei auf der Platte ist die Referenz.
    const ergebnis = autolink(bodyAlt, registry, {
      aktuell: { collection: e.collection, slug: e.slug },
      maxLinks,
    });
    if (ergebnis.markdown === bodyAlt) continue;
    writeFileSync(e.datei, kopf[0] + ergebnis.markdown, "utf8");
  }

  console.log(
    `\n${geaendert} Datei(en) ${trocken ? "würden geändert" : "geändert"}, ${neueLinks} Link(s) gesetzt.`,
  );
}

main();
