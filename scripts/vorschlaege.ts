#!/usr/bin/env -S npx tsx
/**
 * vorschlaege.ts — Einsendungen aus dem Vorschlagsformular abholen und
 * vorsortieren.
 *
 * ANLASS: Seit dem 2026-09-24 kann die Szene über `/vorschlagen/` eine URL
 * einsenden, optional mit einer Zeile Hinweis (Entscheidung Markus). Die
 * Einsendungen liegen bei Netlify Forms. Der wöchentliche Suchlauf macht
 * aus ihnen `frei`-Posten mit „Herkunft: Vorschlag" — und zwar VOR seinen
 * eigenen Funden, innerhalb derselben Obergrenze von zehn Posten
 * (Entscheidung Markus, Variante a).
 *
 * ARBEITSTEILUNG (BETRIEB.md 2.1: Skripte rechnen, Agenten urteilen):
 * Dieses Skript entscheidet nur, was sich ohne Urteil entscheiden lässt —
 * ist die URL gültig, steht sie schon im Register oder in einem offenen
 * Posten, wurde die Einsendung schon verarbeitet. Ob eine Seite zur Szene
 * gehört und ob sie einen Termin belegt, entscheidet der Suchlauf, der sie
 * öffnet. Was er entscheidet, trägt er hier mit `--vermerke` ein.
 *
 * DAS VERZEICHNIS `docs/ablaeufe/vorschlaege-verarbeitet.json` hält fest,
 * welche Einsendung wie ausging. Es enthält nur Kennung, Datum und
 * Ergebnis — keine URL, keinen Hinweistext: Beides ist Freitext aus einem
 * öffentlichen Formular und könnte Personenbezug tragen. Es dient zweierlei:
 * Keine Einsendung wird zweimal bearbeitet, und die Auswertung kann zählen,
 * wie viele Vorschläge zu einem Eintrag wurden.
 *
 * OHNE ZUGANGSDATEN bricht das Skript mit Exitcode 2 und einer eindeutigen
 * Zeile ab. Ein stilles „keine Vorschläge" wäre von „niemand hat etwas
 * eingesandt" nicht zu unterscheiden (Lektion 17, Regel 6).
 *
 *   npx tsx scripts/vorschlaege.ts                     # abholen, vorsortieren, anzeigen
 *   npx tsx scripts/vorschlaege.ts --json              # dasselbe maschinenlesbar
 *   npx tsx scripts/vorschlaege.ts --schreiben         # Eindeutiges (ungültig, bekannt) ins Verzeichnis
 *   npx tsx scripts/vorschlaege.ts --vermerke <id> <ergebnis>
 *
 * Umgebung: NETLIFY_AUTH_TOKEN (persönlicher Zugangsschlüssel),
 *           NETLIFY_SITE_ID (die Site-ID aus den Netlify-Einstellungen).
 *
 * Exitcode 0 = gelaufen, 1 = Fehler beim Abruf, 2 = Zugangsdaten fehlen.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ladeAlle } from "./_laden";
import { VORSCHLAG } from "../src/lib/vorschlag";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const VERZEICHNIS = path.join(PROJEKT, "docs", "ablaeufe", "vorschlaege-verarbeitet.json");
const OFFENE_PUNKTE = path.join(PROJEKT, "OFFENE-PUNKTE.md");

/** Wie eine Einsendung ausging. Die ersten beiden setzt das Skript selbst. */
export const ERGEBNISSE = ["ungueltig", "bekannt", "posten", "verworfen"] as const;
export type Ergebnis = (typeof ERGEBNISSE)[number];

export interface Einsendung {
  id: string;
  erstellt: string;
  url: string;
  hinweis?: string;
  eintrag?: string;
}

export type Urteil =
  | { art: "neu"; url: string }
  | { art: "ungueltig"; grund: string }
  | { art: "bekannt"; wo: string }
  | { art: "verarbeitet"; ergebnis: Ergebnis };

export interface Vermerk {
  id: string;
  am: string;
  ergebnis: Ergebnis;
}

/* ------------------------------------------------------------------ */
/* Reine Funktionen — geprüft in scripts/test-vorschlaege.ts            */
/* ------------------------------------------------------------------ */

/** Parameter, die nur Herkunft messen und dieselbe Seite verschieden aussehen lassen. */
const MESSPARAMETER = /^(utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|ref)$/i;

/**
 * Eine eingesandte Adresse in eine vergleichbare Form bringen. `null`, wenn
 * es keine http(s)-Adresse ist. Fehlt das Schema („www.beispiel.de"), wird
 * https ergänzt — so tippen Menschen Adressen.
 */
export function normalisiereUrl(roh: string): string | null {
  let s = roh.trim();
  if (!s || /\s/.test(s)) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (!u.hostname.includes(".")) return null;
  u.hash = "";
  for (const k of [...u.searchParams.keys()]) if (MESSPARAMETER.test(k)) u.searchParams.delete(k);
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  u.protocol = "https:";
  let aus = u.toString();
  if (u.pathname !== "/" && aus.endsWith("/") && !u.search) aus = aus.slice(0, -1);
  if (u.pathname === "/" && !u.search) aus = aus.replace(/\/$/, "");
  return aus;
}

/** Alle Adressen, die das Register schon kennt: Quellen und Links. */
export function registerUrls(eintraege: { daten: Record<string, any> | null; collection: string; slug: string }[]): Map<string, string> {
  const bekannt = new Map<string, string>();
  const merke = (roh: unknown, wo: string) => {
    if (typeof roh !== "string") return;
    const n = normalisiereUrl(roh);
    if (n && !bekannt.has(n)) bekannt.set(n, wo);
  };
  for (const e of eintraege) {
    if (!e.daten) continue;
    const wo = `${e.collection}/${e.slug}`;
    for (const q of e.daten.quellen ?? []) merke(q.url, wo);
    for (const v of Object.values(e.daten.links ?? {})) merke(v, wo);
    merke(e.daten.ticketUrl, wo);
    merke(e.daten.veranstalterUrl, wo);
  }
  return bekannt;
}

/** Adressen, die in OFFENE-PUNKTE.md schon einem Posten zugeordnet sind. */
export function postenUrls(text: string): Set<string> {
  const aus = new Set<string>();
  for (const m of text.matchAll(/https?:\/\/[^\s)<>"'`]+/g)) {
    const n = normalisiereUrl(m[0].replace(/[.,;:]+$/, ""));
    if (n) aus.add(n);
  }
  return aus;
}

export function beurteile(
  e: Einsendung,
  kontext: { register: Map<string, string>; posten: Set<string>; verarbeitet: Map<string, Vermerk> },
): Urteil {
  const alt = kontext.verarbeitet.get(e.id);
  if (alt) return { art: "verarbeitet", ergebnis: alt.ergebnis };
  const url = normalisiereUrl(e.url ?? "");
  if (!url) return { art: "ungueltig", grund: `keine http(s)-Adresse: ${JSON.stringify((e.url ?? "").slice(0, 80))}` };
  const imRegister = kontext.register.get(url);
  if (imRegister) return { art: "bekannt", wo: imRegister };
  if (kontext.posten.has(url)) return { art: "bekannt", wo: "offener Posten in OFFENE-PUNKTE.md" };
  return { art: "neu", url };
}

/** Eine Netlify-Einsendung auf die Felder des Formulars abbilden. */
export function ausNetlify(roh: any): Einsendung | null {
  const d = roh?.data ?? {};
  const url = d[VORSCHLAG.felder.url];
  if (typeof url !== "string" || !roh?.id) return null;
  const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, VORSCHLAG.hinweisMaxLaenge) : undefined);
  return {
    id: String(roh.id),
    erstellt: String(roh.created_at ?? ""),
    url,
    hinweis: text(d[VORSCHLAG.felder.hinweis]),
    eintrag: text(d[VORSCHLAG.felder.eintrag]),
  };
}

export function leseVerzeichnis(datei = VERZEICHNIS): Map<string, Vermerk> {
  if (!existsSync(datei)) return new Map();
  const roh = JSON.parse(readFileSync(datei, "utf8")) as { verarbeitet: Vermerk[] };
  return new Map(roh.verarbeitet.map((v) => [v.id, v]));
}

export function schreibeVerzeichnis(eintraege: Map<string, Vermerk>, datei = VERZEICHNIS): void {
  const liste = [...eintraege.values()].sort((a, b) => a.am.localeCompare(b.am) || a.id.localeCompare(b.id));
  writeFileSync(datei, JSON.stringify({ verarbeitet: liste }, null, 2) + "\n");
}

/* ------------------------------------------------------------------ */
/* Abruf und Ausgabe                                                    */
/* ------------------------------------------------------------------ */

async function holeEinsendungen(token: string, siteId: string): Promise<Einsendung[]> {
  const aus: Einsendung[] = [];
  for (let seite = 1; seite <= 20; seite++) {
    const res = await fetch(
      `https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/submissions?per_page=100&page=${seite}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`Netlify-API antwortet ${res.status} ${res.statusText}`);
    const liste = (await res.json()) as any[];
    for (const r of liste) {
      const e = ausNetlify(r);
      if (e) aus.push(e);
    }
    if (liste.length < 100) break;
  }
  return aus;
}

function heute(): string {
  // Kalendertag in Berlin, nicht in UTC — Regel 1.
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

async function main() {
  const args = process.argv.slice(2);

  const iv = args.indexOf("--vermerke");
  if (iv >= 0) {
    const [id, ergebnis] = [args[iv + 1], args[iv + 2]];
    if (!id || !ERGEBNISSE.includes(ergebnis as Ergebnis)) {
      console.error(`Aufruf: --vermerke <id> <${ERGEBNISSE.join("|")}>`);
      process.exit(1);
    }
    const v = leseVerzeichnis();
    v.set(id, { id, am: heute(), ergebnis: ergebnis as Ergebnis });
    schreibeVerzeichnis(v);
    console.log(`Vermerkt: ${id} → ${ergebnis}`);
    return;
  }

  const token = process.env.NETLIFY_AUTH_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;
  if (!token || !siteId) {
    console.log(
      `VORSCHLÄGE NICHT ABGERUFEN — es fehlt ${[!token && "NETLIFY_AUTH_TOKEN", !siteId && "NETLIFY_SITE_ID"].filter(Boolean).join(" und ")}. ` +
        `Das ist nicht dasselbe wie „keine Vorschläge". Im Bericht melden.`,
    );
    process.exit(2);
  }

  let einsendungen: Einsendung[];
  try {
    einsendungen = await holeEinsendungen(token, siteId);
  } catch (err) {
    console.log(`VORSCHLÄGE NICHT ABGERUFEN — ${(err as Error).message}. Im Bericht melden.`);
    process.exit(1);
  }

  const verarbeitet = leseVerzeichnis();
  const kontext = {
    register: registerUrls(ladeAlle()),
    posten: postenUrls(readFileSync(OFFENE_PUNKTE, "utf8")),
    verarbeitet,
  };
  const urteile = einsendungen.map((e) => ({ e, u: beurteile(e, kontext) }));

  if (args.includes("--schreiben")) {
    for (const { e, u } of urteile) {
      if (u.art === "ungueltig" || u.art === "bekannt") verarbeitet.set(e.id, { id: e.id, am: heute(), ergebnis: u.art });
    }
    schreibeVerzeichnis(verarbeitet);
  }

  const neu = urteile.filter((x) => x.u.art === "neu");
  if (args.includes("--json")) {
    console.log(JSON.stringify(urteile.map(({ e, u }) => ({ ...e, urteil: u })), null, 2));
    return;
  }
  console.log(`${einsendungen.length} Einsendung(en) abgerufen, davon ${neu.length} neu zu prüfen.\n`);
  for (const { e, u } of urteile) {
    if (u.art === "verarbeitet") continue;
    const zusatz = [e.hinweis && `Hinweis: ${e.hinweis}`, e.eintrag && `zu Eintrag: ${e.eintrag}`].filter(Boolean).join(" · ");
    const kopf =
      u.art === "neu" ? `NEU        ${u.url}` : u.art === "bekannt" ? `bekannt    ${e.url} (${u.wo})` : `ungültig   ${u.grund}`;
    console.log(`  [${e.id}] ${e.erstellt.slice(0, 10)}  ${kopf}${zusatz ? `\n             ${zusatz}` : ""}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
