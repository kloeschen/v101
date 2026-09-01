#!/usr/bin/env -S npx tsx
/**
 * check-jsonld.ts — prüft die generierten Graphen, nicht die Quelldaten.
 *
 * validate-content.ts sorgt dafür, dass das Frontmatter stimmt. Hier geht es
 * um die Frage danach: Ergibt der daraus gebaute Graph ein konsistentes,
 * auflösbares Netz aus Entitäten — oder eine Sammlung isolierter Knoten mit
 * toten Referenzen?
 *
 *   npx tsx scripts/check-jsonld.ts
 *   npx tsx scripts/check-jsonld.ts --collection events
 *   npx tsx scripts/check-jsonld.ts --changed src/content/events/x.md
 *   npx tsx scripts/check-jsonld.ts --print events/walldorf-weekender-2026
 *   npx tsx scripts/check-jsonld.ts --strict --json
 *
 * Exit 0 = sauber, 1 = Fehler.
 */

import path from "node:path";
import { ladeAlle as ladeContent } from "./_laden";
import { collectionNames, type CollectionName } from "../src/content/_schemas";
import { buildGraph, faktenblockFelder, builders, entitaetsId, seitenUrl } from "../src/lib/jsonld";
import { site } from "../src/site.config";

type Ebene = "fehler" | "warnung";
interface Befund { ebene: Ebene; code: string; nachricht: string }

/**
 * Pflichtfelder je @type. Fehlt eins, ist der Knoten für Konsumenten
 * unbrauchbar oder irreführend.
 *
 * Seit dem Review-Befund M2 wird der Graph REKURSIV geprüft — diese Tabelle
 * gilt also auch für verschachtelte Knoten (Offers, Mitglieder, Adressen,
 * FAQ-Fragen), nicht nur für die oberste @graph-Ebene. Deshalb sind die
 * Anforderungen bewusst kontextneutral gehalten: Organization verlangt nur
 * name, weil ein verschachtelter Veranstalter keine URL haben muss — dass
 * der Site-Knoten selbst eine trägt, garantiert organisationsKnoten().
 * Person verlangt nichts, weil der Autoren-Knoten bis zur
 * Autoren-Collection absichtlich nur die @id trägt.
 */
const PFLICHT: Record<string, string[]> = {
  Event: ["name", "startDate", "location"],
  MusicEvent: ["name", "startDate", "location"],
  Festival: ["name", "startDate", "location"],
  DanceEvent: ["name", "startDate", "location"],
  EducationEvent: ["name", "startDate", "location"],
  SocialEvent: ["name", "startDate", "location"],
  EventSeries: ["name", "url"],
  MusicGroup: ["name"],
  Person: [],
  Organization: ["name"],
  MusicAlbum: ["name", "datePublished"],
  MusicVenue: ["name", "address"],
  BarOrPub: ["name", "address"],
  Campground: ["name", "address"],
  Museum: ["name", "address"],
  CivicStructure: ["name", "address"],
  Place: ["name"],
  City: ["name"],
  Country: ["name"],
  AdministrativeArea: ["name"],
  PostalAddress: ["addressLocality"],
  GeoCoordinates: ["latitude", "longitude"],
  LocationFeatureSpecification: ["name", "value"],
  DefinedTerm: ["name", "description", "inDefinedTermSet"],
  DefinedTermSet: ["name", "url"],
  Article: ["headline", "datePublished", "author", "publisher"],
  HowTo: ["name"],
  HowToSupply: ["name"],
  WebPage: ["url", "name"],
  WebSite: ["url", "name"],
  BreadcrumbList: ["itemListElement"],
  ListItem: ["position", "name"],
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  Offer: ["price", "priceCurrency", "availability"],
  ImageObject: ["url"],
  ItemList: ["itemListElement"],
  CollectionPage: ["url", "name"],
};

/* ------------------------------------------------------------------ */
/* Graph-Werkzeug                                                      */
/* ------------------------------------------------------------------ */

interface GefundenerKnoten {
  knoten: any;
  pfad: string;
  /** Direkt in @graph, also referenzierbar — braucht zwingend eine @id. */
  oberste: boolean;
}

/**
 * Alle Knoten des Graphen, auch verschachtelte. Ein Knoten ist jedes Objekt
 * mit @type; Objekte, die nur aus @id bestehen, sind Referenzen und werden
 * von sammleRefs behandelt. Verschachtelte Knoten dürfen ohne @id bleiben
 * (Blank Nodes) — tragen sie eine, gelten dieselben Regeln wie oben.
 */
function sammleKnoten(wert: any, pfad: string, oberste: boolean, aus: GefundenerKnoten[] = []): GefundenerKnoten[] {
  if (Array.isArray(wert)) {
    wert.forEach((v, i) => sammleKnoten(v, `${pfad}[${i}]`, oberste, aus));
    return aus;
  }
  if (!wert || typeof wert !== "object") return aus;
  if ("@type" in wert) aus.push({ knoten: wert, pfad, oberste });
  for (const [k, v] of Object.entries(wert)) {
    if (k.startsWith("@")) continue;
    sammleKnoten(v, `${pfad}.${k}`, false, aus);
  }
  return aus;
}

function typen(knoten: any): string[] {
  const t = knoten["@type"];
  return Array.isArray(t) ? t : t ? [t] : [];
}

/** Alle {"@id": …}-Referenzen im Graph einsammeln, mit Herkunftspfad. */
function sammleRefs(wert: any, pfad = "", aus: { id: string; pfad: string }[] = []) {
  if (Array.isArray(wert)) {
    wert.forEach((v, i) => sammleRefs(v, `${pfad}[${i}]`, aus));
  } else if (wert && typeof wert === "object") {
    const schluessel = Object.keys(wert);
    // Ein Objekt, das NUR @id hat, ist eine Referenz. Alles andere ein Knoten.
    if (schluessel.length === 1 && schluessel[0] === "@id") {
      aus.push({ id: wert["@id"], pfad: pfad || "(Wurzel)" });
    } else {
      for (const [k, v] of Object.entries(wert)) {
        if (k === "@id") continue;
        sammleRefs(v, pfad ? `${pfad}.${k}` : k, aus);
      }
    }
  }
  return aus;
}

function sammleWerte(wert: any, schluessel: string, aus: string[] = []): string[] {
  if (Array.isArray(wert)) wert.forEach((v) => sammleWerte(v, schluessel, aus));
  else if (wert && typeof wert === "object") {
    for (const [k, v] of Object.entries(wert)) {
      if (k === schluessel) {
        if (typeof v === "string") aus.push(v);
        else if (Array.isArray(v)) aus.push(...v.filter((x) => typeof x === "string"));
      } else sammleWerte(v, schluessel, aus);
    }
  }
  return aus;
}

/* ------------------------------------------------------------------ */
/* Prüfungen pro Graph                                                 */
/* ------------------------------------------------------------------ */

function pruefeGraph(
  graph: any,
  collection: CollectionName,
  slug: string,
  bekannteIds: Set<string>,
): Befund[] {
  const b: Befund[] = [];
  const knoten: any[] = graph["@graph"] ?? [];
  const push = (ebene: Ebene, code: string, nachricht: string) => b.push({ ebene, code, nachricht });

  // Serialisierbarkeit — fängt Date-Objekte, NaN und Zyklen.
  let text = "";
  try {
    text = JSON.stringify(graph);
  } catch (e) {
    push("fehler", "serialisierung", `Graph nicht serialisierbar: ${(e as Error).message}`);
    return b;
  }
  if (/"[^"]*":\s*null/.test(text)) push("warnung", "leerwert", "null-Wert im Graph — saeubern() umgangen?");
  if (text.includes('"[object Object]"') || text.includes("NaN")) {
    push("fehler", "serialisierung", "NaN oder [object Object] im Graph.");
  }

  // @context genau einmal, auf der Wurzel.
  if (graph["@context"] !== "https://schema.org") {
    push("fehler", "context", '@context fehlt oder ist nicht "https://schema.org".');
  }

  // Oberste Ebene: jeder @graph-Eintrag muss Typ UND @id tragen — sonst ist
  // er nicht referenzierbar und hätte dort nichts verloren.
  for (const [i, k] of knoten.entries()) {
    if (typen(k).length === 0) push("fehler", "typ", `@graph[${i}] ohne @type: ${JSON.stringify(k).slice(0, 90)}…`);
    else if (!k["@id"]) push("fehler", "id", `@graph[${i}] (${typen(k).join("+")}) ohne @id — nicht referenzierbar.`);
  }

  // Alle Knoten, auch verschachtelte (Review-Befund M2: vorher blieb alles
  // unterhalb der obersten Ebene ungeprüft — die Offer- und Person-Zeilen
  // der PFLICHT-Tabelle waren totes Gewicht).
  const alle = knoten.flatMap((k: any, i: number) => sammleKnoten(k, `[${i}]`, true));
  const idsImGraph = new Set<string>();

  for (const { knoten: k, pfad, oberste } of alle) {
    const ts = typen(k);
    const id: string | undefined = k["@id"];

    if (id) {
      if (idsImGraph.has(id)) push("fehler", "id-doppelt", `@id doppelt im selben Graph: ${id}`);
      idsImGraph.add(id);
      if (!id.startsWith(site.url)) {
        push("fehler", "id-fremd", `@id liegt außerhalb der eigenen Domain (${pfad}): ${id}`);
      }
      if (/wikidata\.org|wikipedia\.org/.test(id)) {
        push("fehler", "id-fremd", `Externe Wissensbasis als @id verwendet (${pfad}): ${id}. Gehört in sameAs.`);
      }
    }

    for (const t of ts) {
      for (const feld of PFLICHT[t] ?? []) {
        if (k[feld] === undefined) {
          push("fehler", "pflichtfeld", `${t} ohne Pflichtfeld "${feld}" (${pfad}${id ? `, ${id}` : ""}).`);
        }
      }
    }
    void oberste;
  }

  // Der Hauptknoten der Entität muss existieren.
  const hauptId = entitaetsId(collection, slug);
  if (!idsImGraph.has(hauptId)) {
    push("fehler", "hauptknoten", `Kein Knoten mit der Entitäts-ID ${hauptId}.`);
  }

  // Referenzen: entweder im selben Graph oder auf eine real existierende Seite.
  for (const { id, pfad } of sammleRefs(knoten)) {
    if (idsImGraph.has(id)) continue;
    if (bekannteIds.has(id)) continue;
    if (id.startsWith(`${site.url}/autoren/`)) continue; // Autoren-Collection folgt
    push("fehler", "referenz", `Referenz in ${pfad} zeigt auf eine unbekannte @id: ${id}`);
  }

  // sameAs: absolut, https, keine Dubletten, nicht die eigene Seite.
  const alleSameAs = sammleWerte(knoten, "sameAs");
  const gesehen = new Set<string>();
  for (const u of alleSameAs) {
    if (!u.startsWith("https://")) push("fehler", "sameas", `sameAs ohne https: ${u}`);
    if (u.startsWith(site.url)) push("fehler", "sameas", `sameAs zeigt auf die eigene Domain: ${u}`);
    if (gesehen.has(u)) push("warnung", "sameas", `sameAs doppelt: ${u}`);
    gesehen.add(u);
  }

  // Datumsfelder ISO 8601.
  for (const feld of ["startDate", "endDate", "datePublished", "dateModified", "validThrough"]) {
    for (const w of sammleWerte(knoten, feld)) {
      if (!/^\d{4}-\d{2}-\d{2}(T[\d:.+\-Z]+)?$/.test(w)) {
        push("fehler", "datum", `${feld} ist kein ISO-8601-Wert: ${w}`);
      }
    }
  }

  // URLs absolut.
  for (const feld of ["url", "contentUrl", "item"]) {
    for (const w of sammleWerte(knoten, feld)) {
      if (!/^https?:\/\//.test(w)) push("fehler", "url", `${feld} ist nicht absolut: ${w}`);
    }
  }

  // Event-spezifisch.
  const ev = knoten.find((k) => idsImGraph.has(hauptId) && k["@id"] === hauptId && collection === "events");
  if (ev) {
    if (ev.endDate && ev.startDate && new Date(ev.endDate) < new Date(ev.startDate)) {
      push("fehler", "event", "endDate liegt vor startDate.");
    }
    if (!ev.offers && ev.isAccessibleForFree !== true) {
      push("warnung", "event", "Weder offers noch isAccessibleForFree — der Preis ist die meistgestellte Frage.");
    }
    for (const o of [ev.offers ?? []].flat()) {
      if (o.price !== undefined && !/^\d+(\.\d+)?$/.test(String(o.price))) {
        push("fehler", "offer", `Offer.price muss eine reine Zahl als String sein: "${o.price}"`);
      }
    }
  }

  // Breadcrumb-Positionen lückenlos ab 1.
  const bc = knoten.find((k) => typen(k).includes("BreadcrumbList"));
  if (bc) {
    const pos = (bc.itemListElement ?? []).map((e: any) => e.position);
    const erwartet = pos.map((_: number, i: number) => i + 1);
    if (JSON.stringify(pos) !== JSON.stringify(erwartet)) {
      push("fehler", "breadcrumb", `position-Werte nicht lückenlos ab 1: ${pos.join(", ")}`);
    }
  }

  return b;
}

/* ------------------------------------------------------------------ */
/* Content Parity                                                      */
/* ------------------------------------------------------------------ */

function pruefeParitaet(): Befund[] {
  const b: Befund[] = [];
  for (const name of collectionNames) {
    const genutzt = builders[name].verwendeteFelder;
    const sichtbar = new Set(faktenblockFelder[name]);
    for (const feld of genutzt) {
      // aliases/faq/bilder werden vom Layout eigenständig gerendert.
      if (["aliases", "faq", "bilder"].includes(feld)) continue;
      if (!sichtbar.has(feld)) {
        b.push({
          ebene: "fehler",
          code: "paritaet",
          nachricht: `${name}: Feld "${feld}" fließt ins JSON-LD, wird aber vom Faktenblock nicht gezeigt. Entweder sichtbar rendern oder aus dem Builder entfernen.`,
        });
      }
    }
  }
  return b;
}

/* ------------------------------------------------------------------ */
/* Laden                                                               */
/* ------------------------------------------------------------------ */

interface Eintrag {
  datei: string;
  collection: CollectionName;
  slug: string;
  daten: any;
}

function ladeAlle(): Eintrag[] {
  // Schemafehler meldet validate-content.ts — hier interessieren nur die
  // Einträge, aus denen sich überhaupt ein Graph bauen lässt.
  return ladeContent()
    .filter((e) => e.daten !== null)
    .map((e) => ({ datei: e.datei, collection: e.collection, slug: e.slug, daten: e.daten! }));
}

/* ------------------------------------------------------------------ */

function main() {
  const argv = process.argv.slice(2);
  const flag = (n: string) => argv.includes(n);
  const wert = (n: string) => {
    const i = argv.indexOf(n);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const changedIdx = argv.indexOf("--changed");
  const changed = changedIdx >= 0
    ? argv.slice(changedIdx + 1).filter((a) => !a.startsWith("--")).map((p) => path.resolve(p))
    : undefined;
  const nurCollection = wert("--collection") as CollectionName | undefined;
  const drucke = wert("--print");
  const strikt = flag("--strict");
  const alsJson = flag("--json");

  const alle = ladeAlle();

  // Alle @id-Werte, die es im Projekt gibt — Grundlage der Referenzprüfung.
  const bekannteIds = new Set<string>();
  for (const e of alle) {
    bekannteIds.add(entitaetsId(e.collection, e.slug));
    bekannteIds.add(`${seitenUrl(e.collection, e.slug)}#webpage`);
  }
  bekannteIds.add(`${site.url}/#organization`);
  bekannteIds.add(`${site.url}/#website`);
  bekannteIds.add(`${site.url}/lexikon/#termset`);

  if (drucke) {
    const [c, s] = drucke.split("/");
    const e = alle.find((x) => x.collection === c && x.slug === s);
    if (!e) {
      console.error(`Nicht gefunden: ${drucke}`);
      process.exit(2);
    }
    console.log(JSON.stringify(buildGraph(e.collection, e.slug, e.daten), null, 2));
    return;
  }

  const zuPruefen = alle.filter(
    (e) =>
      (!nurCollection || e.collection === nurCollection) &&
      (!changed || changed.includes(e.datei)),
  );

  const bericht = new Map<string, Befund[]>();

  // Paritätsprüfung ist global, nicht dateibezogen.
  const paritaet = pruefeParitaet();
  if (paritaet.length) bericht.set("(Builder ↔ Faktenblock)", paritaet);

  for (const e of zuPruefen) {
    let graph: any;
    try {
      graph = buildGraph(e.collection, e.slug, e.daten);
    } catch (err) {
      bericht.set(e.datei, [
        { ebene: "fehler", code: "build", nachricht: `buildGraph ist abgestürzt: ${(err as Error).message}` },
      ]);
      continue;
    }
    const befunde = pruefeGraph(graph, e.collection, e.slug, bekannteIds);
    if (befunde.length) bericht.set(e.datei, befunde);
  }

  const flach = [...bericht.values()].flat();
  const fehler = flach.filter((x) => x.ebene === "fehler").length;
  const warnungen = flach.filter((x) => x.ebene === "warnung").length;

  if (alsJson) {
    console.log(JSON.stringify({
      geprueft: zuPruefen.length,
      fehler,
      warnungen,
      befunde: [...bericht].map(([datei, b]) => ({
        datei: datei.startsWith("(") ? datei : path.relative(process.cwd(), datei),
        befunde: b,
      })),
    }, null, 2));
  } else {
    for (const [datei, befunde] of bericht) {
      console.log(`\n${datei.startsWith("(") ? datei : path.relative(process.cwd(), datei)}`);
      for (const x of befunde) {
        console.log(`  ${x.ebene === "fehler" ? "FEHLER " : "warnung"}  [${x.code}] ${x.nachricht}`);
      }
    }
    console.log(`\n${zuPruefen.length} Graph(en) geprüft — ${fehler} Fehler, ${warnungen} Warnungen${strikt ? " (strict)" : ""}`);
  }

  process.exit(fehler > 0 || (strikt && warnungen > 0) ? 1 : 0);
}

main();
