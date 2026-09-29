#!/usr/bin/env -S npx tsx
/**
 * check-weiterleitungen.ts — bekommt jeder alte Pfad von v101.de das
 * Schicksal, das `dist/_redirects` ihm zuschreibt, und stimmt es?
 *
 * ANLASS: Die Domain trug bis 2024 einen Preisvergleich; 1434 Pfade stehen
 * in der Wayback Machine (`docs/daten/v101-alte-urls.txt`). Sie landen seit
 * dem Umzug auf dieser Site. `dist/_redirects` ordnet ihnen 301 (gleiche
 * Sache, anderes Zuhause; geschrieben von `schreibe-weiterleitungen.ts`)
 * oder 410 (gibt es nicht mehr; aus `public/_redirects`) zu; was keine
 * Regel trifft, bleibt offen und bekommt Netlifys 404.
 *
 * Läuft nach dem Build über `dist/`, weil nur der Build weiß, welche Seiten
 * es gibt. Fehler sind:
 *   - ein 301-Ziel, das im Build keine Seite hat (auch: Ziel ist ein Entwurf,
 *     denn Entwürfe baut die Produktion nicht);
 *   - eine Regel, die eine Seite des Builds trifft — Netlify würde sie still
 *     ignorieren (die Datei gewinnt), und die Regel täuscht beim Lesen;
 *   - eine Regel, die keinen alten Pfad trifft (tote Regel);
 *   - ein anderer Status als 301 oder 410, ein 410 ohne vorhandene Fehlerseite.
 * Lebenszeichen: Die Liste ist gelesen (mindestens 1000 Pfade), und es gibt
 * Treffer für 301 und für 410 — sonst wäre „kein Fehler" auch das Ergebnis
 * einer leeren Liste oder einer Regeldatei, die nichts trifft.
 *
 *   npx tsx scripts/check-weiterleitungen.ts [dist]
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ALTLISTE = path.join(PROJEKT, "docs/daten/v101-alte-urls.txt");

export interface Regel {
  zeile: number;
  von: string;
  nach: string;
  status: number;
}

/** Liest `_redirects`: Kommentare und Leerzeilen fallen weg, Status ist Pflicht. */
export function leseRegeln(text: string): Regel[] {
  const regeln: Regel[] = [];
  text.split("\n").forEach((roh, i) => {
    const z = roh.replace(/#.*$/, "").trim();
    if (!z) return;
    const [von, nach, status] = z.split(/\s+/);
    regeln.push({ zeile: i + 1, von, nach, status: Number(status) });
  });
  return regeln;
}

/** Liest die Altliste: ein Pfad je Zeile, `#` leitet einen Kommentar ein. */
export function leseAltliste(text: string): string[] {
  return text.split("\n").map((z) => z.trim()).filter((z) => z && !z.startsWith("#"));
}

const teile = (p: string) => p.replace(/\/+$/, "").split("/").filter(Boolean);

/**
 * Trifft das Muster den Pfad? So, wie Netlify es auswertet: Der Schrägstrich
 * am Ende zählt nicht, `:name` steht für genau einen Abschnitt, `*` am Ende
 * für den Rest (auch für nichts — `/wp-json/*` trifft `/wp-json/`).
 */
export function trifft(muster: string, pfad: string): boolean {
  const m = teile(muster);
  const p = teile(pfad);
  const rest = m[m.length - 1] === "*";
  const fest = rest ? m.slice(0, -1) : m;
  if (rest ? p.length < fest.length : p.length !== fest.length) return false;
  return fest.every((s, i) => s.startsWith(":") || s === p[i]);
}

/** Die erste Regel, die den Pfad trifft — wie bei Netlify. */
export function ersteRegel(regeln: Regel[], pfad: string): Regel | undefined {
  return regeln.find((r) => trifft(r.von, pfad));
}

/** Hat der Build unter diesem Pfad eine Seite oder Datei? */
export function imBuild(dist: string, pfad: string): boolean {
  const ohne = pfad.replace(/^\/+/, "");
  if (!ohne) return existsSync(path.join(dist, "index.html"));
  return existsSync(path.join(dist, ohne, "index.html")) || (!ohne.endsWith("/") && existsSync(path.join(dist, ohne)));
}

export interface Urteil {
  fehler: string[];
  zaehlung: { weiter: number; weg: number; neu: number; offen: number };
  offen: string[];
}

export function beurteile(regeln: Regel[], alt: string[], dist: string): Urteil {
  const fehler: string[] = [];
  const zaehlung = { weiter: 0, weg: 0, neu: 0, offen: 0 };
  const offen: string[] = [];
  const genutzt = new Set<Regel>();

  for (const r of regeln) {
    const wo = `_redirects:${r.zeile} (${r.von})`;
    if (r.status !== 301 && r.status !== 410) {
      fehler.push(`${wo}: Status ${r.status} — erlaubt sind 301 und 410`);
      continue;
    }
    if (r.status === 301 && (!r.nach.endsWith("/") || !imBuild(dist, r.nach))) {
      fehler.push(`${wo}: Ziel ${r.nach} hat im Build keine Seite (fehlt, Entwurf oder ohne Schrägstrich am Ende)`);
    }
    if (r.status === 410 && !imBuild(dist, r.nach)) {
      fehler.push(`${wo}: Fehlerseite ${r.nach} fehlt im Build`);
    }
    // Enthält das Muster keinen Platzhalter, lässt es sich direkt gegen den
    // Build halten; mit Platzhalter zählt, ob ein alter Pfad dahinter eine
    // Seite des Builds ist (unten).
    if (!/[:*]/.test(r.von) && imBuild(dist, r.von)) {
      fehler.push(`${wo}: trifft eine Seite des Builds — Netlify würde die Regel ignorieren`);
    }
  }

  for (const pfad of alt) {
    const r = ersteRegel(regeln, pfad);
    const gebaut = imBuild(dist, pfad);
    if (r) genutzt.add(r);
    if (r && gebaut) {
      fehler.push(`_redirects:${r.zeile} (${r.von}) trifft ${pfad}, und den gibt es im Build`);
    } else if (gebaut) {
      zaehlung.neu++;
    } else if (!r) {
      zaehlung.offen++;
      offen.push(pfad);
    } else if (r.status === 301) {
      zaehlung.weiter++;
    } else if (r.status === 410) {
      zaehlung.weg++;
    }
  }

  for (const r of regeln) {
    if (!genutzt.has(r)) fehler.push(`_redirects:${r.zeile} (${r.von}): trifft keinen alten Pfad — tote Regel`);
  }
  return { fehler, zaehlung, offen };
}

function main() {
  const dist = path.resolve(process.argv[2] ?? "dist");
  const regeln = leseRegeln(readFileSync(path.join(dist, "_redirects"), "utf8"));
  const alt = leseAltliste(readFileSync(ALTLISTE, "utf8"));
  const u = beurteile(regeln, alt, dist);

  if (!existsSync(path.join(dist, "index.html"))) u.fehler.push(`keine Startseite in ${dist} — wurde gebaut?`);
  if (alt.length < 1000) u.fehler.push(`Altliste hat nur ${alt.length} Pfade — gelesen?`);
  if (u.zaehlung.weiter === 0) u.fehler.push("kein alter Pfad wird weitergeleitet — Regeln gelesen?");
  if (u.zaehlung.weg === 0) u.fehler.push("kein alter Pfad bekommt 410 — Regeln gelesen?");

  const z = u.zaehlung;
  console.log(
    `${alt.length} alte Pfade, ${regeln.length} Regeln: ${z.weiter} weitergeleitet (301), ${z.weg} abgemeldet (410), ` +
      `${z.neu} neu belegt, ${z.offen} offen (404)`,
  );
  for (const f of u.fehler) console.log(`  FEHLER  ${f}`);
  process.exit(u.fehler.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
