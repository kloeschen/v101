/**
 * Verlinkungslogik.
 *
 * Drei Aufgaben, die zusammengehören, weil sie alle denselben Index brauchen:
 *
 *  1. Auflösen — aus "collection/slug" wird URL und Anzeigename.
 *  2. Rückverweise — welche Entitäten zeigen auf diese hier? Damit rendert
 *     die Bandseite ihre Auftritte, ohne dass jemand sie doppelt pflegt.
 *  3. Autolink — Fachbegriffe im Fließtext werden beim ersten Vorkommen
 *     automatisch aufs Lexikon verlinkt.
 *
 * Punkt 3 ist der größte Einzelhebel für semantische Dichte: Über hunderte
 * Artikel entsteht so eine vollständige, konsistente interne Verlinkung, um
 * die sich beim Schreiben niemand kümmern muss. Er ist auch der Punkt, an
 * dem man am leichtesten Unsinn produziert — deshalb sind die Schutzzonen
 * (Code, bestehende Links, Überschriften) hier hart implementiert und in
 * scripts/test-links.ts einzeln abgesichert.
 */

import { urlPrefix, referenzFelder, type CollectionName } from "../content/_schemas";
import { site } from "../site.config";
import { istVorbei } from "./datum";

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export interface RegistryEingabe {
  collection: CollectionName;
  slug: string;
  daten: Record<string, any>;
}

export interface EintragMeta {
  collection: CollectionName;
  slug: string;
  name: string;
  kurzbeschreibung?: string;
  pfad: string;
  url: string;
  daten: Record<string, any>;
}

export interface Rueckverweis {
  von: EintragMeta;
  /** Über welches Feld zeigt der Eintrag hierher? */
  feld: string;
}

interface BegriffMuster {
  /** Zielslug im Lexikon. */
  slug: string;
  /** Der Suchbegriff in Originalschreibung. */
  begriff: string;
  regex: RegExp;
}

export interface Registry {
  eintraege: Map<string, EintragMeta>;
  slugs: Map<CollectionName, Set<string>>;
  /** Zielschlüssel "collection/slug" → eingehende Verweise. */
  rueckverweise: Map<string, Rueckverweis[]>;
  /** Nach Länge absteigend: längere Begriffe gewinnen gegen kürzere. */
  begriffe: BegriffMuster[];
}

const schluessel = (c: CollectionName, s: string) => `${c}/${s}`;

export function eintragsPfad(collection: CollectionName, slug: string): string {
  return `${urlPrefix[collection]}/${slug}/`;
}

export function buildRegistry(eingaben: RegistryEingabe[]): Registry {
  const eintraege = new Map<string, EintragMeta>();
  const slugs = new Map<CollectionName, Set<string>>();

  // Erste Passage: Regionen der Locations einsammeln. Das Schema erlaubt
  // Events ohne explizite Region, weil sie aus dem Ort folgt — hier wird
  // dieses Versprechen tatsächlich eingelöst. Ohne die Ableitung wäre ein
  // solches Event auf der Regionsseite und im regionalen Kalender unsichtbar.
  const regionVonLocation = new Map<string, string>();
  for (const e of eingaben) {
    if (e.collection === "locations" && typeof e.daten.region === "string") {
      regionVonLocation.set(e.slug, e.daten.region);
    }
  }

  for (const roh of eingaben) {
    const e =
      roh.collection === "events" && !roh.daten.region && regionVonLocation.has(roh.daten.ort)
        ? { ...roh, daten: { ...roh.daten, region: regionVonLocation.get(roh.daten.ort) } }
        : roh;
    if (!slugs.has(e.collection)) slugs.set(e.collection, new Set());
    slugs.get(e.collection)!.add(e.slug);
    const pfad = eintragsPfad(e.collection, e.slug);
    eintraege.set(schluessel(e.collection, e.slug), {
      collection: e.collection,
      slug: e.slug,
      name: e.daten.name,
      kurzbeschreibung: e.daten.kurzbeschreibung,
      pfad,
      url: `${site.url}${pfad}`,
      daten: e.daten,
    });
  }

  // Rückverweise aus den deklarierten Referenzfeldern aufbauen.
  const rueckverweise = new Map<string, Rueckverweis[]>();
  for (const eintrag of eintraege.values()) {
    for (const [feld, zielCollection] of Object.entries(referenzFelder[eintrag.collection])) {
      for (const zielSlug of alsListe(eintrag.daten[feld])) {
        const k = schluessel(zielCollection, zielSlug);
        if (!eintraege.has(k)) continue; // meldet validate-content.ts
        if (!rueckverweise.has(k)) rueckverweise.set(k, []);
        rueckverweise.get(k)!.push({ von: eintrag, feld });
      }
    }
    // artikel.hauptentitaet zeigt auf eine variable Collection.
    const h = eintrag.daten.hauptentitaet;
    if (h?.typ && h?.slug) {
      const k = schluessel(h.typ, h.slug);
      if (eintraege.has(k)) {
        if (!rueckverweise.has(k)) rueckverweise.set(k, []);
        rueckverweise.get(k)!.push({ von: eintrag, feld: "hauptentitaet" });
      }
    }
  }

  return { eintraege, slugs, rueckverweise, begriffe: baueBegriffe(eintraege) };
}

function alsListe(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

/* ------------------------------------------------------------------ */
/* Auflösen                                                            */
/* ------------------------------------------------------------------ */

export function aufloesen(
  registry: Registry,
  collection: CollectionName,
  slug: string,
): EintragMeta | undefined {
  return registry.eintraege.get(schluessel(collection, slug));
}

export function aufloesenViele(
  registry: Registry,
  collection: CollectionName,
  slugs: string[] = [],
): EintragMeta[] {
  return slugs
    .map((s) => aufloesen(registry, collection, s))
    .filter((e): e is EintragMeta => e !== undefined);
}

/* ------------------------------------------------------------------ */
/* Rückverweise                                                        */
/* ------------------------------------------------------------------ */

/**
 * Alle Entitäten, die auf diese hier zeigen.
 * `nurFeld` schränkt ein, z. B. "lineupBands" für die Auftrittsliste einer
 * Band. `nurCollection` filtert nach Typ des verweisenden Eintrags.
 */
export function eingehendeVerweise(
  registry: Registry,
  collection: CollectionName,
  slug: string,
  optionen: { nurFeld?: string; nurCollection?: CollectionName } = {},
): Rueckverweis[] {
  const alle = registry.rueckverweise.get(schluessel(collection, slug)) ?? [];
  return alle.filter(
    (r) =>
      (!optionen.nurFeld || r.feld === optionen.nurFeld) &&
      (!optionen.nurCollection || r.von.collection === optionen.nurCollection),
  );
}

/**
 * Auftritte einer Band, chronologisch — kommende zuerst, dann vergangene
 * absteigend. Die Bandseite pflegt keine Terminliste; sie fällt aus den
 * Eventdaten heraus.
 */
export function auftritte(registry: Registry, bandSlug: string, jetzt = new Date()) {
  const verweise = eingehendeVerweise(registry, "bands", bandSlug, { nurFeld: "lineupBands" });
  const mitDatum = verweise
    .map((v) => ({ event: v.von, datum: new Date(v.von.daten.ende ?? v.von.daten.beginn) }))
    .filter((x) => !Number.isNaN(x.datum.getTime()));

  // Nicht `datum >= jetzt`: Ein Termin heute Abend gehört unter "kommend",
  // auch wenn sein Zeitstempel schon vorbei ist (M9, siehe lib/datum.ts).
  const kommend = mitDatum.filter((x) => !istVorbei(x.datum, jetzt)).sort((a, b) => +a.datum - +b.datum);
  const vergangen = mitDatum.filter((x) => istVorbei(x.datum, jetzt)).sort((a, b) => +b.datum - +a.datum);
  return { kommend, vergangen };
}

/**
 * Alles, was in einer Region liegt — gruppiert nach Typ.
 * Das ist der Kern der Regionsseiten, dem strategisch wertvollsten Seitentyp.
 */
export function inRegion(registry: Registry, regionSlug: string) {
  const verweise = eingehendeVerweise(registry, "regionen", regionSlug, { nurFeld: "region" });
  const gruppen = new Map<CollectionName, EintragMeta[]>();
  for (const v of verweise) {
    if (!gruppen.has(v.von.collection)) gruppen.set(v.von.collection, []);
    gruppen.get(v.von.collection)!.push(v.von);
  }
  // Untergeordnete Regionen mit einbeziehen wäre der nächste Schritt;
  // bewusst noch nicht drin, solange die Hierarchie flach ist.
  for (const liste of gruppen.values()) liste.sort((a, b) => a.name.localeCompare(b.name, "de"));
  return gruppen;
}

/**
 * "Verwandtes" für den Fußbereich: ausgehende Referenzen plus Rückverweise,
 * dedupliziert, ohne die Seite selbst.
 */
export function verwandtes(
  registry: Registry,
  collection: CollectionName,
  slug: string,
  limit = 12,
): EintragMeta[] {
  const eintrag = aufloesen(registry, collection, slug);
  if (!eintrag) return [];
  const gesehen = new Set<string>([schluessel(collection, slug)]);
  const aus: EintragMeta[] = [];

  const hinzu = (m?: EintragMeta) => {
    if (!m) return;
    const k = schluessel(m.collection, m.slug);
    if (gesehen.has(k)) return;
    gesehen.add(k);
    aus.push(m);
  };

  for (const [feld, ziel] of Object.entries(referenzFelder[collection])) {
    for (const s of alsListe(eintrag.daten[feld])) hinzu(aufloesen(registry, ziel, s));
  }
  for (const r of eingehendeVerweise(registry, collection, slug)) hinzu(r.von);

  return aus.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Autolink                                                            */
/* ------------------------------------------------------------------ */

/**
 * Deutsche Flexionsendungen, die nach einem Fachbegriff stehen dürfen,
 * ohne dass es ein anderes Wort wird ("Petticoats", "Pompadours").
 * Nur für einteilige Begriffe — bei "Wet Set" wäre das Raten.
 */
const FLEXION = "(?:s|es|n|en|er)?";

/**
 * Wortgrenzen, die auch mit Umlauten funktionieren — \b tut das nicht.
 *
 * Asymmetrisch, und das mit Absicht: Ein vorangehender Bindestrich blockiert
 * (in "Neo-Rockabilly" darf nicht der kurze Begriff greifen), ein folgender
 * nicht (in "Rockabilly-Weekender" soll er greifen). Deutsche Komposita
 * hängen sich hinten an, nicht vorn.
 */
const VOR = "(?<![\\p{L}\\p{N}_\\-])";
const NACH = "(?![\\p{L}\\p{N}_])";

function maskiere(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function baueBegriffe(eintraege: Map<string, EintragMeta>): BegriffMuster[] {
  const muster: BegriffMuster[] = [];
  const gesehen = new Set<string>();

  for (const e of eintraege.values()) {
    if (e.collection !== "lexikon") continue;
    const kandidaten = [
      e.name,
      ...(e.daten.aliases ?? []),
      e.daten.bezeichnungDe,
      e.daten.bezeichnungEn,
    ].filter((x): x is string => typeof x === "string" && x.trim().length >= 4);

    for (const begriff of kandidaten) {
      const norm = begriff.toLowerCase();
      if (gesehen.has(norm)) continue; // erster Eintrag gewinnt, danach Duplikat
      gesehen.add(norm);
      const einteilig = !/[\s\-']/.test(begriff);
      muster.push({
        slug: e.slug,
        begriff,
        regex: new RegExp(`${VOR}(${maskiere(begriff)}${einteilig ? FLEXION : ""})${NACH}`, "iu"),
      });
    }
  }

  // Längster Begriff zuerst: "Neo-Rockabilly" darf nicht als "Rockabilly"
  // verlinkt werden, nur weil das kürzere Muster früher dran war.
  return muster.sort((a, b) => b.begriff.length - a.begriff.length);
}

interface Segment {
  text: string;
  /** Geschützte Segmente werden nie angefasst. */
  geschuetzt: boolean;
}

/**
 * Zerlegt Markdown in verlinkbare und geschützte Abschnitte.
 * Geschützt sind: Codeblöcke, Inline-Code, HTML-Tags, bestehende Links und
 * Bilder, Linkziele, Überschriften und Tabellentrennzeilen.
 */
export function segmentiere(markdown: string): Segment[] {
  const geschuetztesMuster = new RegExp(
    [
      "```[\\s\\S]*?```", // Codeblock
      "~~~[\\s\\S]*?~~~",
      "`[^`\\n]+`", // Inline-Code
      "!?\\[[^\\]]*\\]\\([^)]*\\)", // Link oder Bild
      "!?\\[[^\\]]*\\]\\[[^\\]]*\\]", // Referenzlink
      "^\\s{0,3}#{1,6}[^\\n]*$", // Überschrift
      "^\\s{0,3}\\[[^\\]]+\\]:[^\\n]*$", // Linkdefinition
      "<[^>]+>", // HTML-Tag
      "^\\s*\\|[-:| ]+\\|\\s*$", // Tabellentrennzeile
      "https?://\\S+", // nackte URL
    ].join("|"),
    "gmu",
  );

  const segmente: Segment[] = [];
  let zuletzt = 0;
  for (const treffer of markdown.matchAll(geschuetztesMuster)) {
    const start = treffer.index!;
    if (start > zuletzt) segmente.push({ text: markdown.slice(zuletzt, start), geschuetzt: false });
    segmente.push({ text: treffer[0], geschuetzt: true });
    zuletzt = start + treffer[0].length;
  }
  if (zuletzt < markdown.length) segmente.push({ text: markdown.slice(zuletzt), geschuetzt: false });
  return segmente;
}

export interface AutolinkOptionen {
  /** Die aktuelle Seite — verhindert Selbstverlinkung. */
  aktuell?: { collection: CollectionName; slug: string };
  /** Höchstzahl automatisch gesetzter Links pro Dokument. */
  maxLinks?: number;
  /** Begriffe, die in diesem Dokument nicht verlinkt werden sollen. */
  ausnahmen?: string[];
}

export interface AutolinkErgebnis {
  markdown: string;
  /** Welche Lexikon-Slugs wurden verlinkt? Speist `mentions` im JSON-LD. */
  verlinkt: string[];
}

/**
 * Verlinkt jeden bekannten Fachbegriff genau einmal — beim ersten Vorkommen
 * im freien Text. Bereits vorhandene manuelle Links bleiben unangetastet und
 * verbrauchen kein Kontingent, weil sie in geschützten Segmenten liegen.
 */
export function autolink(
  markdown: string,
  registry: Registry,
  optionen: AutolinkOptionen = {},
): AutolinkErgebnis {
  const { aktuell, maxLinks = 12, ausnahmen = [] } = optionen;
  const gesperrt = new Set(ausnahmen.map((a) => a.toLowerCase()));
  const segmente = segmentiere(markdown);

  const erledigt = new Set<string>(); // Slugs, die schon verlinkt sind
  const verlinkt: string[] = [];

  // Bereits manuell verlinkte Ziele zählen als erledigt.
  for (const s of segmente.filter((x) => x.geschuetzt)) {
    for (const m of s.text.matchAll(/\]\((\/lexikon\/([a-z0-9-]+))\/?\)/g)) erledigt.add(m[2]);
  }

  for (const segment of segmente) {
    if (segment.geschuetzt) continue;
    if (verlinkt.length >= maxLinks) break;

    // Erst alle Kandidaten im Segment sammeln, dann nach Position auflösen:
    // Wer im Text zuerst steht, wird verlinkt — nicht wer im Musterindex
    // zufällig vorn liegt. Bei gleicher Position gewinnt der längere Begriff
    // ("Neo-Rockabilly" schlägt "Rockabilly").
    const kandidaten: { start: number; laenge: number; slug: string; wort: string }[] = [];
    for (const muster of registry.begriffe) {
      if (erledigt.has(muster.slug)) continue;
      if (gesperrt.has(muster.begriff.toLowerCase())) continue;
      if (aktuell?.collection === "lexikon" && aktuell.slug === muster.slug) continue;
      const treffer = muster.regex.exec(segment.text);
      if (!treffer) continue;
      kandidaten.push({
        start: treffer.index,
        laenge: treffer[1].length,
        slug: muster.slug,
        wort: treffer[1],
      });
    }

    kandidaten.sort((a, b) => a.start - b.start || b.laenge - a.laenge);

    const angenommen: typeof kandidaten = [];
    for (const k of kandidaten) {
      if (verlinkt.length + angenommen.length >= maxLinks) break;
      if (erledigt.has(k.slug) || angenommen.some((a) => a.slug === k.slug)) continue;
      // Überlappungen ausschließen — sonst zerlegt ein kürzerer Treffer
      // einen bereits angenommenen längeren.
      const kollidiert = angenommen.some(
        (a) => k.start < a.start + a.laenge && a.start < k.start + k.laenge,
      );
      if (kollidiert) continue;
      angenommen.push(k);
    }

    // Von hinten einsetzen, damit die Indizes gültig bleiben.
    for (const k of [...angenommen].sort((a, b) => b.start - a.start)) {
      segment.text =
        segment.text.slice(0, k.start) +
        `[${k.wort}](${eintragsPfad("lexikon", k.slug)})` +
        segment.text.slice(k.start + k.laenge);
    }
    for (const k of angenommen) {
      erledigt.add(k.slug);
      verlinkt.push(k.slug);
    }
  }

  return { markdown: segmente.map((s) => s.text).join(""), verlinkt };
}

/* ------------------------------------------------------------------ */
/* Analyse                                                             */
/* ------------------------------------------------------------------ */

/** Alle internen Pfade aus einem Markdown-Text, ohne Duplikate. */
export function interneLinks(markdown: string): string[] {
  const pfade = [...markdown.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]);
  return [...new Set(pfade)];
}

/** Interner Pfad → Registry-Eintrag, falls auflösbar. */
export function pfadZuEintrag(registry: Registry, pfad: string): EintragMeta | undefined {
  const sauber = pfad.replace(/\/$/, "");
  for (const [collection, prefix] of Object.entries(urlPrefix) as [CollectionName, string][]) {
    if (!sauber.startsWith(`${prefix}/`)) continue;
    const slug = sauber.slice(prefix.length + 1).split("/")[0];
    return aufloesen(registry, collection, slug);
  }
  return undefined;
}
