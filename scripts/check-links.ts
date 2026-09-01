#!/usr/bin/env -S npx tsx
/**
 * check-links.ts — prüft die externen Links.
 *
 * Interne Referenzen prüft validate-content.ts zur Build-Zeit. Externe Links
 * kann nur das Netz beantworten, und das kostet Zeit — deshalb hier mit
 * Cache, Nebenläufigkeit und einer Höchstalter-Regel. Ein Lauf, der zehn
 * Minuten dauert, wird nicht ausgeführt.
 *
 * Warum es sich lohnt: Ein Register lebt von Verweisen auf Veranstalter-,
 * Band- und Ticketseiten. Genau diese Seiten verschwinden, ziehen um oder
 * laufen ab. Tote Weblinks sind der sichtbarste Verfall eines Verzeichnisses
 * und das erste, was Nutzern die Aktualität in Zweifel zieht.
 *
 *   npx tsx scripts/check-links.ts
 *   npx tsx scripts/check-links.ts --max-age 7      # Cache-Alter in Tagen
 *   npx tsx scripts/check-links.ts --concurrency 4   # gleichzeitige Hosts
 *   npx tsx scripts/check-links.ts --pause 500        # ms zwischen Anfragen je Host
 *   npx tsx scripts/check-links.ts --collection events --json
 *   npx tsx scripts/check-links.ts --no-cache --strict
 *
 * Exit 0 = sauber, 1 = tote Links (oder Warnungen bei --strict).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { ladeAlle, type GeladenerEintrag } from "./_laden";
import { collectionNames, type CollectionName } from "../src/content/_schemas";

type Ebene = "fehler" | "warnung";
interface Befund { ebene: Ebene; code: string; url: string; nachricht: string }

interface CacheEintrag {
  status: number | null;
  /** Endziel nach Weiterleitungen, falls abweichend. */
  ziel?: string;
  fehler?: string;
  geprueftAm: string;
}

const CACHE_DATEI = path.resolve(process.cwd(), ".cache/link-check.json");

/* ------------------------------------------------------------------ */
/* URLs einsammeln                                                     */
/* ------------------------------------------------------------------ */

interface Fundstelle { url: string; datei: string; feld: string }

function sammleUrls(eintraege: GeladenerEintrag[]): Fundstelle[] {
  const funde: Fundstelle[] = [];
  const sehen = new Set<string>();

  const merke = (url: string | undefined, datei: string, feld: string) => {
    if (!url || !/^https?:\/\//.test(url)) return;
    const schluessel = `${datei}::${url}`;
    if (sehen.has(schluessel)) return;
    sehen.add(schluessel);
    funde.push({ url, datei, feld });
  };

  for (const e of eintraege) {
    const d = (e.daten ?? e.roh) as Record<string, any>;

    for (const [art, ziel] of Object.entries(d.links ?? {})) {
      // Die Wikidata-ID ist keine URL, sondern eine Kennung.
      if (art === "wikidata") merke(`https://www.wikidata.org/wiki/${ziel}`, e.datei, "links.wikidata");
      else merke(ziel as string, e.datei, `links.${art}`);
    }
    for (const [i, q] of (d.quellen ?? []).entries()) merke(q?.url, e.datei, `quellen[${i}].url`);
    merke(d.ticketUrl, e.datei, "ticketUrl");
    merke(d.veranstalterUrl, e.datei, "veranstalterUrl");
    for (const [i, b] of (d.bilder ?? []).entries()) merke(b?.quelleUrl, e.datei, `bilder[${i}].quelleUrl`);

    // Externe Links im Fließtext, ohne die in Codeblöcken.
    const ohneCode = e.body.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]+`/g, " ");
    for (const m of ohneCode.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) merke(m[1], e.datei, "fließtext");
  }

  return funde;
}

/* ------------------------------------------------------------------ */
/* Prüfen                                                              */
/* ------------------------------------------------------------------ */

async function pruefeUrl(url: string, timeoutMs: number): Promise<CacheEintrag> {
  const geprueftAm = new Date().toISOString();

  const anfrage = async (methode: "HEAD" | "GET"): Promise<Response> => {
    const abbruch = new AbortController();
    const timer = setTimeout(() => abbruch.abort(), timeoutMs);
    try {
      return await fetch(url, {
        method: methode,
        redirect: "follow",
        signal: abbruch.signal,
        headers: {
          // Ohne erkennbaren Absender antworten viele Seiten mit 403.
          "User-Agent": "VintageGuideLinkCheck/1.0 (+Linkprüfung des Szene-Registers)",
          Accept: "*/*",
        },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let antwort = await anfrage("HEAD");
    // Viele Server beantworten HEAD gar nicht oder falsch — dann GET.
    if (antwort.status === 405 || antwort.status === 403 || antwort.status === 501) {
      antwort = await anfrage("GET");
    }
    const ziel = antwort.url && antwort.url !== url ? antwort.url : undefined;
    return { status: antwort.status, ziel, geprueftAm };
  } catch (e) {
    const grund = (e as Error).name === "AbortError" ? "Zeitüberschreitung" : (e as Error).message;
    return { status: null, fehler: grund, geprueftAm };
  }
}

/**
 * Nebenläufig über Hosts, seriell innerhalb eines Hosts.
 *
 * Acht parallele Anfragen an denselben Server sind bei 500 Discogs-Links
 * keine Prüfung mehr, sondern ein kleiner Angriff — und die 429-Antworten
 * verfälschen dann den Bericht (Review-Befund M5). --concurrency steuert
 * deshalb die Zahl gleichzeitig bearbeiteter Hosts; je Host läuft eine
 * eigene Warteschlange mit kurzer Pause zwischen den Anfragen.
 */
async function parallelJeHost(
  urls: string[],
  hostGrenze: number,
  pauseMs: number,
  arbeit: (url: string) => Promise<CacheEintrag>,
): Promise<Map<string, CacheEintrag>> {
  const jeHost = new Map<string, string[]>();
  for (const u of urls) {
    const host = new URL(u).hostname;
    if (!jeHost.has(host)) jeHost.set(host, []);
    jeHost.get(host)!.push(u);
  }

  const ergebnisse = new Map<string, CacheEintrag>();
  const hosts = [...jeHost.keys()];
  let naechster = 0;

  const arbeiter = Array.from({ length: Math.min(hostGrenze, hosts.length) }, async () => {
    while (naechster < hosts.length) {
      const host = hosts[naechster++]!;
      for (const url of jeHost.get(host)!) {
        ergebnisse.set(url, await arbeit(url));
        if (pauseMs > 0) await new Promise((r) => setTimeout(r, pauseMs));
      }
    }
  });
  await Promise.all(arbeiter);
  return ergebnisse;
}

/* ------------------------------------------------------------------ */

function bewerte(url: string, e: CacheEintrag): Befund | null {
  if (e.status === null) {
    // Netzfehler sind Warnungen, keine Fehler: Ein einzelner Timeout darf
    // keinen Build brechen. Wiederholt sich das, fällt es im Bericht auf.
    return { ebene: "warnung", code: "unerreichbar", url, nachricht: e.fehler ?? "nicht erreichbar" };
  }
  if (e.status >= 500) {
    return { ebene: "warnung", code: "serverfehler", url, nachricht: `HTTP ${e.status} — später erneut prüfen` };
  }
  if (e.status === 429) {
    return { ebene: "warnung", code: "gedrosselt", url, nachricht: "HTTP 429 — Prüfung gedrosselt" };
  }
  if (e.status >= 400) {
    return { ebene: "fehler", code: "tot", url, nachricht: `HTTP ${e.status}` };
  }
  if (e.ziel) {
    const von = new URL(url);
    const nach = new URL(e.ziel);
    if (von.hostname !== nach.hostname) {
      // Weiterleitung auf einen anderen Host heißt oft: Domain verkauft,
      // Veranstalter aufgegeben, Shop übernommen. Immer ansehen.
      return {
        ebene: "warnung",
        code: "umgezogen",
        url,
        nachricht: `leitet auf einen anderen Host weiter: ${e.ziel}`,
      };
    }
    if (von.protocol === "http:" && nach.protocol === "https:") {
      // Kein Umzug, nur ein Schema-Upgrade — die Quelle sollte trotzdem
      // gleich auf https zeigen, statt jedem Leser den Redirect zuzumuten
      // (Review-Befund M4: vorher fälschlich als "fremde Domain" gemeldet).
      return {
        ebene: "warnung",
        code: "http",
        url,
        nachricht: "antwortet per Weiterleitung auf https — Link direkt auf https umstellen",
      };
    }
  }
  return null;
}

async function main() {
  const argv = process.argv.slice(2);
  const flag = (n: string) => argv.includes(n);
  const zahl = (n: string, standard: number) => {
    const i = argv.indexOf(n);
    return i >= 0 ? Number(argv[i + 1]) : standard;
  };
  const wert = (n: string) => {
    const i = argv.indexOf(n);
    return i >= 0 ? argv[i + 1] : undefined;
  };

  const maxAlterTage = zahl("--max-age", 14);
  const gleichzeitig = zahl("--concurrency", 8);
  const timeoutMs = zahl("--timeout", 10_000);
  const nurCollection = wert("--collection") as CollectionName | undefined;
  const ohneCache = flag("--no-cache");
  const strikt = flag("--strict");
  const alsJson = flag("--json");

  if (nurCollection && !collectionNames.includes(nurCollection)) {
    console.error(`Unbekannte Collection "${nurCollection}".`);
    process.exit(2);
  }

  const funde = sammleUrls(ladeAlle({ collection: nurCollection }));
  const eindeutige = [...new Set(funde.map((f) => f.url))];

  const cache: Record<string, CacheEintrag> =
    !ohneCache && existsSync(CACHE_DATEI) ? JSON.parse(readFileSync(CACHE_DATEI, "utf8")) : {};

  const frisch = (e?: CacheEintrag) =>
    e !== undefined &&
    e.status !== null &&
    e.status < 400 &&
    (Date.now() - new Date(e.geprueftAm).getTime()) / 86_400_000 < maxAlterTage;

  const zuPruefen = eindeutige.filter((u) => !frisch(cache[u]));
  if (!alsJson) {
    console.log(
      `${eindeutige.length} eindeutige URL(s), ${zuPruefen.length} zu prüfen (${eindeutige.length - zuPruefen.length} aus dem Cache).`,
    );
  }

  const pauseMs = zahl("--pause", 250);
  const ergebnisse = await parallelJeHost(zuPruefen, gleichzeitig, pauseMs, (u) => pruefeUrl(u, timeoutMs));
  for (const [u, e] of ergebnisse) cache[u] = e;

  if (!ohneCache) {
    mkdirSync(path.dirname(CACHE_DATEI), { recursive: true });
    writeFileSync(CACHE_DATEI, JSON.stringify(cache, null, 2), "utf8");
  }

  // Befunde je Datei sammeln — dieselbe URL kann in mehreren Einträgen stehen.
  const bericht = new Map<string, (Befund & { feld: string })[]>();
  for (const f of funde) {
    const eintrag = cache[f.url];
    if (!eintrag) continue;
    const befund = bewerte(f.url, eintrag);
    if (!befund) continue;
    if (!bericht.has(f.datei)) bericht.set(f.datei, []);
    bericht.get(f.datei)!.push({ ...befund, feld: f.feld });
  }

  const flach = [...bericht.values()].flat();
  const fehler = flach.filter((b) => b.ebene === "fehler").length;
  const warnungen = flach.filter((b) => b.ebene === "warnung").length;

  if (alsJson) {
    console.log(JSON.stringify({
      geprueft: eindeutige.length,
      fehler,
      warnungen,
      befunde: [...bericht].map(([datei, b]) => ({ datei: path.relative(process.cwd(), datei), befunde: b })),
    }, null, 2));
  } else {
    for (const [datei, befunde] of bericht) {
      console.log(`\n${path.relative(process.cwd(), datei)}`);
      for (const b of befunde) {
        console.log(`  ${b.ebene === "fehler" ? "FEHLER " : "warnung"}  [${b.code}] ${b.feld}: ${b.nachricht}\n            ${b.url}`);
      }
    }
    console.log(`\n${eindeutige.length} URL(s) — ${fehler} tot, ${warnungen} auffällig${strikt ? " (strict)" : ""}`);
  }

  process.exit(fehler > 0 || (strikt && warnungen > 0) ? 1 : 0);
}

main();
