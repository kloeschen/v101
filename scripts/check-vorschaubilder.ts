#!/usr/bin/env -S npx tsx
/**
 * check-vorschaubilder.ts — zeigt jede gebaute Seite auf ein Bild, das es gibt?
 *
 * Läuft nach dem Build über `dist/`. Ein og:image, das ins Leere zeigt, ist
 * schlimmer als keines: Facebook und WhatsApp zeigen dann einen grauen
 * Kasten, und niemand merkt es, weil die Seite selbst tadellos aussieht.
 *
 * Geprüft wird je HTML-Seite: Es gibt genau ein og:image, es zeigt auf die
 * eigene Domain, die Datei liegt in `dist/`, sie ist ein PNG in 1200 × 630.
 * Dazu ein Lebenszeichen: Mindestens eine Eintragsseite hat ein eigenes
 * Bild und nicht das Standardbild — sonst wäre die Prüfung auch bestanden,
 * wenn jede Seite auf `standard.png` zeigte.
 *
 *   npx tsx scripts/check-vorschaubilder.ts [dist]
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { site } from "../src/site.config";
import { BREITE, HOEHE } from "../src/lib/vorschaubild";

const DIST = path.resolve(process.argv[2] ?? "dist");

/** Breite und Höhe aus dem IHDR-Block, oder null, wenn es kein PNG ist. */
export function pngMasse(daten: Buffer): { breite: number; hoehe: number } | null {
  const signatur = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (daten.length < 24 || !daten.subarray(0, 8).equals(signatur)) return null;
  return { breite: daten.readUInt32BE(16), hoehe: daten.readUInt32BE(20) };
}

function main() {
  const seiten = fg.sync("**/*.html", { cwd: DIST });
  const fehler: string[] = [];
  let eigene = 0;
  for (const s of seiten) {
    const html = readFileSync(path.join(DIST, s), "utf8");
    const treffer = [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map((m) => m[1]);
    if (treffer.length !== 1) {
      fehler.push(`${s}: ${treffer.length} og:image statt genau einem`);
      continue;
    }
    const url = treffer[0];
    if (!url.startsWith(`${site.url}/`)) {
      fehler.push(`${s}: og:image zeigt nicht auf ${site.url}: ${url}`);
      continue;
    }
    const datei = path.join(DIST, url.slice(site.url.length));
    if (!existsSync(datei)) {
      fehler.push(`${s}: Bild fehlt im Build: ${url}`);
      continue;
    }
    const masse = pngMasse(readFileSync(datei));
    if (!masse || masse.breite !== BREITE || masse.hoehe !== HOEHE) {
      fehler.push(`${s}: ${url} ist kein PNG in ${BREITE} × ${HOEHE}`);
      continue;
    }
    if (!url.endsWith("/og/standard.png")) eigene++;
  }
  if (seiten.length === 0) fehler.push(`keine HTML-Seiten in ${DIST} — wurde gebaut?`);
  if (eigene === 0) fehler.push("keine Seite hat ein eigenes Vorschaubild — alle zeigen auf standard.png");

  console.log(`${seiten.length} Seiten geprüft, ${eigene} mit eigenem Vorschaubild, ${fehler.length} Fehler`);
  for (const f of fehler) console.log(`  FEHLER  ${f}`);
  process.exit(fehler.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
