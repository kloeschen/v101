#!/usr/bin/env -S npx tsx
/**
 * test-orientierung.ts — die Wegweiser in CLAUDE.md müssen irgendwohin zeigen.
 *
 * CLAUDE.md schließt mit einer Orientierungsliste: wo Architektur steht, wo
 * Entscheidungen, wo Lektionen, was als Nächstes ansteht. Diese Liste ist
 * das Erste, was eine neue Sitzung liest — und ein Verweis, der ins Leere
 * geht, kostet dort mehr als anderswo: Er wird nicht als Fehler erkannt,
 * sondern als "gibt es wohl nicht".
 *
 * Genau das ist beim Umzug von `lektionen.md` nach `docs/` fast passiert;
 * fünf Fundstellen mussten von Hand nachgezogen werden, und die Suche
 * danach war einmalig statt dauerhaft.
 *
 * Geprüft wird das Verallgemeinerte, nicht der Einzelfall: JEDE Datei, die
 * die Liste nennt, muss existieren und Inhalt haben. Das deckt
 * `OFFENE-PUNKTE.md` mit ab, ohne dass eine Prüfung nur für sie entsteht —
 * und es fängt den nächsten Umzug.
 *
 * Mehr lässt sich sinnvoll nicht prüfen: Ob ein Punkt in OFFENE-PUNKTE.md
 * noch aktuell ist, weiß kein Skript.
 *
 *   npx tsx scripts/test-orientierung.ts
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Die Liste lesen                                                     */
/* ------------------------------------------------------------------ */

/**
 * Alle Pfadangaben in Backticks aus dem Abschnitt "## Orientierung".
 *
 * Bewusst nur dieser Abschnitt: Im übrigen Text nennt CLAUDE.md auch
 * Befehle, Feldnamen und Beispielpfade mit Platzhaltern. Die
 * Orientierungsliste dagegen ist eine Liste von Wegweisern, und für die
 * gilt die Zusage.
 */
function orientierungsZiele(text: string): string[] {
  const ab = text.indexOf("## Orientierung");
  if (ab < 0) return [];
  const rest = text.slice(ab + 1);
  const bis = rest.indexOf("\n## ");
  const block = bis < 0 ? rest : rest.slice(0, bis);

  const ziele: string[] = [];
  for (const m of block.matchAll(/`([^`]+)`/g)) {
    const p = m[1].trim();
    // Globs zeigen auf ein Muster, nicht auf eine Datei — sie werden
    // getrennt behandelt.
    if (p.includes("*")) continue;
    ziele.push(p);
  }
  return ziele;
}

const claude = readFileSync(path.join(PROJEKT, "CLAUDE.md"), "utf8");
const ziele = orientierungsZiele(claude);

/* ------------------------------------------------------------------ */
/* Prüfungen                                                           */
/* ------------------------------------------------------------------ */

/*
 * Positives Lebenszeichen zuerst (Lektion 19): Ohne diese Zeile wäre
 * "alle Ziele existieren" auch dann wahr, wenn die Liste gar nicht
 * gefunden wurde und `ziele` leer ist — ein Ergebnis mit zwei Ursachen.
 */
pruefe(
  "die Orientierungsliste wurde gefunden und nennt mehrere Ziele",
  ziele.length >= 5,
  `gefunden: ${ziele.length} (${ziele.join(", ") || "keine"})`,
);

// Und eine Behauptung über den Inhalt, nicht nur die Menge: Die Liste muss
// die vier Dokumente nennen, an denen die Arbeitsweise hängt. Sonst könnte
// sie fünf beliebige Einträge enthalten und die Prüfung wäre zufrieden.
for (const pflicht of ["README.md", "ENTSCHEIDUNGEN.md", "OFFENE-PUNKTE.md", "docs/lektionen.md"]) {
  pruefe(`Orientierungsliste nennt ${pflicht}`, ziele.includes(pflicht), ziele.join(", "));
}

for (const ziel of ziele) {
  const voll = path.join(PROJEKT, ziel);
  if (!existsSync(voll)) {
    pruefe(`${ziel} existiert`, false, "Datei fehlt — Wegweiser zeigt ins Leere");
    continue;
  }
  bestanden++; // existiert

  // Nicht leer: Eine angelegte, aber ungefüllte Datei ist derselbe tote
  // Wegweiser, nur schwerer zu bemerken. Die Grenze ist bewusst niedrig —
  // sie soll das Versehen fangen, nicht Inhalt bewerten.
  const inhalt = readFileSync(voll, "utf8").trim();
  pruefe(
    `${ziel} ist nicht leer`,
    statSync(voll).isFile() && inhalt.length >= 200,
    `${inhalt.length} Zeichen`,
  );
}

/* Die Golden Examples stehen als Glob in der Liste — hier ausgeschrieben. */
{
  const collections = ["events", "bands", "locations", "regionen", "lexikon", "artikel"];
  const fehlend = collections.filter(
    (c) => !existsSync(path.join(PROJEKT, "src", "content", c, "_golden-example.md")),
  );
  gleich("jede Collection hat ein Golden Example", fehlend, []);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
