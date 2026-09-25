/**
 * Vorschaubilder für geteilte Links (og:image), eines je Seite.
 *
 * ANLASS: Die Szene teilt Termine über Facebook-Gruppen und WhatsApp. Am
 * 2026-09-25 hatte keine der 89 Seiten ein Vorschaubild; ein geteilter
 * Link erschien als nackter Text. Markus hat sich für ein Bild je Seite
 * mit Titel entschieden, nicht für ein festes Bild für alle.
 *
 * WAS DRAUFSTEHT: Wortmarke, Sammlung, Titel und eine Zeile mit den harten
 * Fakten — bei Terminen Datum und Ort, bei Orten und Läden die Stadt.
 * Nur, was ohnehin auf der Seite steht; das Bild behauptet nichts Eigenes.
 * Keine Fotos: Bilder brauchen dokumentierte Rechte (CLAUDE.md), Schrift
 * und Farbe nicht.
 *
 * SCHRIFTEN: Libre Baskerville und Source Sans 3, beide unter der SIL Open
 * Font License, aus den @fontsource-Paketen. Die Seite selbst nutzt
 * Systemschriften; ins Bild müssen die Schriften eingebettet werden, und
 * Georgia darf das nicht.
 *
 * Kein `import.meta` hier: `scripts/test-vorschaubild.ts` lädt das Modul in
 * Node (Lektion 2). Die Schriftdateien werden über `process.cwd()`
 * gefunden, das in Build und Test die Projektwurzel ist.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { site } from "../site.config";
import type { EintragMeta } from "./links";

export const BREITE = 1200;
export const HOEHE = 630;

/** Die Farben aus src/styles/tokens.css — das Bild soll aussehen wie die Seite. */
const FARBE = { grund: "#fbfaf7", text: "#1c1a17", leise: "#5a544c", linie: "#ddd8cf", akzent: "#8c2f24" };

export interface Vorschau {
  sammlung: string;
  titel: string;
  zeile?: string;
}

const TAG = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: site.zeitzone });
const TAG_JAHR = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: site.zeitzone });
const UHR = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: site.zeitzone });

/** „Sa., 17.10.2026, 19:00 Uhr" oder „Fr., 22.05. – Mo., 25.05.2026". */
export function terminZeile(beginn: Date, ende?: Date, ganztaegig = false): string {
  const tag = (d: Date) => TAG_JAHR.format(d);
  if (ende && tag(ende) !== tag(beginn)) {
    // Ein Ende kurz nach Mitternacht gehört zum Abend davor, nicht zu einem
    // zweiten Tag: Eine Party von 19 bis 1:30 Uhr ist ein Abend.
    const stunden = (+ende - +beginn) / 3_600_000;
    if (stunden > 12) return `${TAG.format(beginn)} – ${tag(ende)}`;
  }
  return ganztaegig ? tag(beginn) : `${tag(beginn)}, ${UHR.format(beginn)} Uhr`;
}

/** Was auf dem Bild eines Eintrags steht. `namen` löst Slugs auf (Ort, Region). */
export function vorschauFuer(e: EintragMeta, sammlung: string, namen: (collection: string, slug: string) => string | undefined): Vorschau {
  const d = e.daten;
  const teile: string[] = [];
  if (e.collection === "events" && d.beginn) {
    teile.push(terminZeile(new Date(d.beginn), d.ende ? new Date(d.ende) : undefined, d.ganztaegig));
    const ort = typeof d.ort === "string" ? namen("locations", d.ort) : undefined;
    if (ort) teile.push(ort);
  } else if ((e.collection === "locations" || e.collection === "adressen") && d.adresse?.ort) {
    teile.push(d.adresse.ort);
    const region = typeof d.region === "string" ? namen("regionen", d.region) : undefined;
    if (region && region !== d.adresse.ort) teile.push(region);
  } else if (e.collection === "bands" && d.herkunftOrt) {
    teile.push(`aus ${d.herkunftOrt}`);
  }
  return { sammlung, titel: e.name, zeile: teile.length ? teile.join(" · ") : undefined };
}

/* ------------------------------------------------------------------ */
/* Zeichnen                                                            */
/* ------------------------------------------------------------------ */

type Knoten = { type: string; props: { style: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Knoten => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

/** Schriftgröße nach Titellänge, damit auch lange Titel in drei Zeilen passen. */
export function titelGroesse(titel: string): number {
  return titel.length > 60 ? 54 : titel.length > 35 ? 66 : 80;
}

function layout(v: Vorschau): Knoten {
  return h(
    "div",
    {
      width: BREITE, height: HOEHE, display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: FARBE.grund, padding: "64px 72px", borderTop: `14px solid ${FARBE.akzent}`, fontFamily: "Sans",
    },
    h(
      "div",
      { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
      h("div", { fontFamily: "Serif", fontSize: 34, color: FARBE.text }, site.name),
      h("div", { fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: FARBE.akzent }, v.sammlung),
    ),
    h(
      "div",
      { display: "flex", flexDirection: "column", gap: 24 },
      h("div", { fontFamily: "Serif", fontSize: titelGroesse(v.titel), lineHeight: 1.15, color: FARBE.text }, v.titel),
      v.zeile ? h("div", { fontSize: 36, color: FARBE.leise }, v.zeile) : h("div", {}, ""),
    ),
    h(
      "div",
      { display: "flex", borderTop: `2px solid ${FARBE.linie}`, paddingTop: 20, fontSize: 24, color: FARBE.leise },
      "Register der Vintage- und Rockabilly-Szene",
    ),
  );
}

let schriften: { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[] | undefined;
function ladeSchriften() {
  const datei = (paket: string, name: string) =>
    readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", paket, "files", name));
  schriften ??= [
    { name: "Serif", data: datei("libre-baskerville", "libre-baskerville-latin-700-normal.woff"), weight: 700, style: "normal" },
    { name: "Sans", data: datei("source-sans-3", "source-sans-3-latin-400-normal.woff"), weight: 400, style: "normal" },
    { name: "Sans", data: datei("source-sans-3", "source-sans-3-latin-600-normal.woff"), weight: 600, style: "normal" },
  ];
  return schriften;
}

/** PNG-Bytes des Vorschaubilds. */
export async function zeichne(v: Vorschau): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(layout(v) as any, { width: BREITE, height: HOEHE, fonts: ladeSchriften() });
  // Kopie in einen eigenen ArrayBuffer: `Response` nimmt keinen Node-Buffer
  // mit geteiltem Speicher an (astro check, ts2345).
  return new Uint8Array(new Resvg(svg).render().asPng());
}

/** Pfad des Bildes zu einer Seite. Einträge bekommen ihr eigenes, alles andere das Standardbild. */
export function vorschauPfad(collection?: string, slug?: string): string {
  return collection && slug ? `/og/${collection}/${slug}.png` : "/og/standard.png";
}
