#!/usr/bin/env -S npx tsx
/**
 * validate-content.ts — der Torwächter.
 *
 * Prüft Frontmatter gegen den Zod-Vertrag und den Fließtext gegen die
 * Redaktions- und GEO-Standards. Was hier durchfällt, geht nicht live.
 *
 *   npx tsx scripts/validate-content.ts                    # alles
 *   npx tsx scripts/validate-content.ts --collection events
 *   npx tsx scripts/validate-content.ts --changed a.md b.md # nur diese Dateien
 *   npx tsx scripts/validate-content.ts --strict            # Warnungen = Fehler
 *   npx tsx scripts/validate-content.ts --json              # maschinenlesbar
 *
 * Exit 0 = sauber, 1 = Fehler gefunden.
 *
 * Neue Regel hinzufügen: einen Eintrag in REGELN ergänzen. Sonst nichts.
 */

import path from "node:path";
import { z } from "zod";
import { ladeAlle, type GeladenerEintrag } from "./_laden";
import { RESERVIERTE_SEGMENTE } from "../src/lib/facetten";
import {
  collectionSchemas,
  collectionNames,
  belegpflichtigeFelder,
  pruefKadenzTage,
  referenzFelder,
  minWorte,
  urlPrefix,
  type CollectionName,
} from "../src/content/_schemas";

/* ------------------------------------------------------------------ */
/* Typen                                                               */
/* ------------------------------------------------------------------ */

type Ebene = "fehler" | "warnung";

interface Befund {
  ebene: Ebene;
  code: string;
  nachricht: string;
  feld?: string;
}

type Eintrag = GeladenerEintrag;

interface Kontext {
  eintraege: Eintrag[];
  /** collection -> Set aller Slugs */
  slugs: Map<CollectionName, Set<string>>;
  /** normalisierter Name/Alias -> Liste "collection/slug" */
  namensIndex: Map<string, string[]>;
  heute: Date;
}

interface Regel {
  code: string;
  collections: "*" | CollectionName[];
  /** true = läuft auch, wenn das Zod-Schema fehlgeschlagen ist */
  auchOhneSchema?: boolean;
  pruefe(e: Eintrag, ctx: Kontext): Befund[];
}

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */

/**
 * Lektion 4: Der leere Zustand bekommt einen sichtbaren Hinweis, keinen
 * roten Lauf. Einmal pro Prozess — sonst steht die Zeile hinter jedem
 * Eintrag und niemand liest sie noch.
 */
let linkzieleGemeldet = false;
function meldeLinkzieleKnapp(verfuegbar: number, soll: number): void {
  if (linkzieleGemeldet) return;
  linkzieleGemeldet = true;
  console.log(
    `Hinweis: Das Register bietet ${verfuegbar} verlinkbare(s) Ziel(e). ` +
      `Die Mindestzahl interner Links (${soll}) wird entsprechend gesenkt, ` +
      `solange nicht genug Einträge existieren.`,
  );
}

/** Nur für Tests: den Einmal-Hinweis zurücksetzen. */
export function _resetLinkzielHinweis(): void {
  linkzieleGemeldet = false;
}

/** Markdown grob entfernen, um Wörter zu zählen. */
function nurText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_`>|]/g, " ")
    .replace(/<[^>]+>/g, " ");
}

function zaehleWorte(md: string): number {
  const t = nurText(md).trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Erster Absatz vor der ersten Überschrift. Das ist die Antwortkapsel. */
function ersterAbsatz(body: string): string {
  const bisUeberschrift = body.split(/^\s{0,3}#{1,6}\s+/m)[0] ?? "";
  const absaetze = bisUeberschrift
    .split(/\n\s*\n/)
    .map((a) => a.trim())
    .filter(Boolean);
  return absaetze[0] ?? "";
}

function ersterSatz(text: string): string {
  const m = nurText(text).trim().match(/^[^.!?]{5,}?[.!?]/);
  return m ? m[0] : nurText(text).trim();
}

/**
 * Definitorischer Erstsatz: "[Entität] ist/sind/bezeichnet ein …".
 * Bewusst tolerant — es geht darum, Einleitungsgeplänkel abzufangen
 * ("In diesem Artikel schauen wir uns an …"), nicht um Grammatikpolizei.
 */
const DEFINITORISCH = /\b(ist|sind|war|waren|bezeichnet|benennt|meint|steht für|gilt als|bezeichnete)\b/i;
const GEPLAENKEL = /^(in diesem|willkommen|hallo|wer kennt|stell dir vor|es war einmal|heute schauen|jeder, der)/i;

function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^(the|die|der|das)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tageSeit(d: Date, heute: Date): number {
  return Math.floor((heute.getTime() - new Date(d).getTime()) / 86_400_000);
}

function alsArray(v: unknown): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : typeof v === "string" ? [v] : [];
}

/** Alle belegten Felder aus den Quellen einsammeln. */
function belegteFelder(daten: Record<string, any>): Set<string> {
  const s = new Set<string>();
  for (const q of daten.quellen ?? []) for (const f of q.felder ?? []) s.add(f);
  return s;
}

/* ------------------------------------------------------------------ */
/* Regeln                                                              */
/* ------------------------------------------------------------------ */

const REGELN: Regel[] = [
  /* --- Struktur / GEO -------------------------------------------- */

  {
    code: "kapsel-vorhanden",
    auchOhneSchema: true,
    collections: "*",
    pruefe(e) {
      const abs = ersterAbsatz(e.body);
      if (!abs) {
        return [{ ebene: "fehler", code: "", nachricht: "Kein Absatz vor der ersten Überschrift — Antwortkapsel fehlt." }];
      }
      const w = zaehleWorte(abs);
      const b: Befund[] = [];
      if (w < 25) b.push({ ebene: "fehler", code: "", nachricht: `Antwortkapsel zu kurz (${w} Wörter, mindestens 25).` });
      if (w > 90) b.push({ ebene: "warnung", code: "", nachricht: `Antwortkapsel zu lang (${w} Wörter, Ziel ≤ 80). Der Rest gehört unter die erste H2.` });
      return b;
    },
  },

  {
    code: "kapsel-definitorisch",
    auchOhneSchema: true,
    collections: "*",
    pruefe(e) {
      const satz = ersterSatz(ersterAbsatz(e.body));
      if (!satz) return [];
      if (GEPLAENKEL.test(satz)) {
        return [{ ebene: "fehler", code: "", nachricht: `Erster Satz ist Einleitungsgeplänkel: "${satz.slice(0, 70)}…" — mit der Antwort beginnen.` }];
      }
      if (!DEFINITORISCH.test(satz)) {
        return [{ ebene: "warnung", code: "", nachricht: `Erster Satz wirkt nicht definitorisch: "${satz.slice(0, 70)}…"` }];
      }
      return [];
    },
  },

  {
    code: "ueberschriften",
    auchOhneSchema: true,
    collections: "*",
    pruefe(e) {
      const zeilen = e.body.split("\n");
      const ueber: { tiefe: number; text: string }[] = [];
      let imCodeblock = false;
      for (const z of zeilen) {
        if (/^\s{0,3}```/.test(z)) { imCodeblock = !imCodeblock; continue; }
        if (imCodeblock) continue;
        const m = z.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
        if (m) ueber.push({ tiefe: m[1].length, text: m[2].trim() });
      }
      const b: Befund[] = [];
      if (ueber.some((u) => u.tiefe === 1)) {
        b.push({ ebene: "fehler", code: "", nachricht: "H1 im Fließtext. Der Titel kommt aus dem Frontmatter." });
      }
      if (ueber.length === 0) {
        b.push({ ebene: "warnung", code: "", nachricht: "Keine Zwischenüberschrift — ohne H2 gibt es keine extrahierbaren Abschnitte." });
      }
      let vorher = 1;
      for (const u of ueber) {
        if (u.tiefe > vorher + 1) {
          b.push({ ebene: "fehler", code: "", nachricht: `Überschriftensprung H${vorher} → H${u.tiefe} bei "${u.text}".` });
        }
        vorher = u.tiefe;
      }
      return b;
    },
  },

  {
    code: "mindestlaenge",
    auchOhneSchema: true,
    collections: "*",
    pruefe(e) {
      const w = zaehleWorte(e.body);
      const min = minWorte[e.collection];
      return w < min
        ? [{ ebene: "fehler", code: "", nachricht: `Nur ${w} Wörter Fließtext, mindestens ${min} erwartet. Register-Einträge brauchen einen eigenen Einordnungsabsatz.` }]
        : [];
    },
  },

  {
    code: "reservierter-slug",
    collections: "*",
    auchOhneSchema: true,
    pruefe(e) {
      if (!RESERVIERTE_SEGMENTE.includes(e.slug)) return [];
      return [{
        ebene: "fehler",
        code: "",
        nachricht: `"${e.slug}" ist als Facettensegment reserviert (${RESERVIERTE_SEGMENTE.join(", ")}). Die Route würde mit den Facettenseiten kollidieren.`,
      }];
    },
  },

  {
    code: "platzhalter",
    collections: "*",
    auchOhneSchema: true,
    pruefe(e) {
      const treffer = (e.body + JSON.stringify(e.roh)).match(/\b(TODO|TBD|FIXME|XXX|Lorem ipsum|Platzhalter)\b|\?\?\?/i);
      return treffer
        ? [{ ebene: e.roh.status === "veroeffentlicht" ? "fehler" : "warnung", code: "", nachricht: `Platzhalter gefunden: "${treffer[0]}".` }]
        : [];
    },
  },

  /* --- Belege ----------------------------------------------------- */

  {
    code: "quellen-vorhanden",
    collections: ["events", "bands", "locations", "lexikon"],
    pruefe(e) {
      if (!e.daten) return [];
      if ((e.daten.quellen ?? []).length === 0) {
        const ebene: Ebene = e.daten.status === "entwurf" ? "warnung" : "fehler";
        return [{ ebene, code: "", nachricht: "Keine Quelle hinterlegt. Kein Fakt ohne Beleg." }];
      }
      return [];
    },
  },

  {
    code: "belegpflicht",
    collections: "*",
    pruefe(e) {
      if (!e.daten) return [];
      const pflicht = belegpflichtigeFelder[e.collection];
      if (pflicht.length === 0) return [];
      // Kein Sammelwert mehr: `felder: [alle]` hat diese Schleife früher
      // komplett übersprungen. Die Abkürzung erspart genau die Arbeit, um die
      // es geht — wer eine Quelle Feld für Feld zuordnet, prüft dabei Feld für
      // Feld. Das ist der Zweck, nicht die Buchführung. Eine Quelle, die
      // wirklich alles deckt, kann die Felder auch aufzählen.
      // "alle" ist damit ungültig; `quellen-felder-gueltig` fängt es ab.
      const belegt = belegteFelder(e.daten);
      const b: Befund[] = [];
      for (const feld of pflicht) {
        const wert = e.daten[feld];
        const gesetzt = Array.isArray(wert) ? wert.length > 0 : wert !== undefined && wert !== null && wert !== "";
        if (!gesetzt) continue;
        // Defaults, die niemand recherchiert hat, brauchen keinen Beleg.
        // Nur außergewöhnliche Zustände brauchen einen Beleg.
        if (feld === "durchfuehrung" && !["abgesagt", "verschoben", "ausverkauft"].includes(wert)) continue;
        if (!belegt.has(feld)) {
          b.push({
            ebene: e.daten.status === "veroeffentlicht" ? "fehler" : "warnung",
            code: "",
            feld,
            nachricht: `Feld "${feld}" ist gesetzt, aber von keiner Quelle gedeckt (quellen[].felder).`,
          });
        }
      }
      return b;
    },
  },

  {
    /**
     * Was in `quellen[].felder` steht, muss nachprüfbar sein. Sonst belegt die
     * Liste nichts, sie behauptet nur. Zwei Formen sind gültig:
     *
     *   - ein Feldname der Collection — die gültigen Namen kommen aus dem
     *     Schema selbst (`.shape`), nicht aus einer zweiten Liste, die
     *     auseinanderlaufen könnte;
     *   - `body:<abschnitt>` für Aussagen im Fließtext. Die entstand als
     *     Versehen (der Petticoat-Eintrag trug "aufbau", "geschichte" und
     *     "gegenwart" ein, allesamt Textabschnitte, keine Frontmatter-Felder).
     *     Die Absicht war richtig, also ist sie jetzt explizit und geprüft.
     */
    code: "quellen-felder-gueltig",
    collections: "*",
    pruefe(e) {
      if (!e.daten) return [];
      const feldNamen = new Set(Object.keys((collectionSchemas[e.collection] as any).shape));
      const bodyMuster = /^body:[a-z0-9]+(?:-[a-z0-9]+)*$/;
      const ebene: Ebene = e.daten.status === "veroeffentlicht" ? "fehler" : "warnung";
      const b: Befund[] = [];
      const gesehen = new Set<string>();
      for (const q of e.daten.quellen ?? []) {
        for (const f of q.felder ?? []) {
          if (feldNamen.has(f) || bodyMuster.test(f)) continue;
          if (gesehen.has(f)) continue;
          gesehen.add(f);
          const hinweis =
            f === "alle"
              ? 'Sammelwert "alle" ist nicht mehr zulässig — er schaltete die Belegpflicht komplett ab. Felder einzeln aufzählen.'
              : `Erlaubt ist ein Feldname der Collection "${e.collection}" oder das Muster "body:<abschnitt>" (Kleinbuchstaben, keine Umlaute, z. B. body:geschichte).`;
          b.push({
            ebene,
            code: "",
            feld: "quellen",
            nachricht: `Ungültiger Wert "${f}" in quellen[].felder. ${hinweis}`,
          });
        }
      }
      return b;
    },
  },

  {
    code: "quellen-aktualitaet",
    collections: ["events"],
    pruefe(e, ctx) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      for (const q of e.daten.quellen ?? []) {
        const alter = tageSeit(q.abgerufenAm, ctx.heute);
        if (alter > 120 && new Date(e.daten.beginn) > ctx.heute) {
          b.push({ ebene: "warnung", code: "", nachricht: `Quelle ${alter} Tage alt (${q.url}) für ein zukünftiges Event. Preise und Termine erneut prüfen.` });
        }
      }
      return b;
    },
  },

  /* --- Referenzen ------------------------------------------------- */

  {
    code: "referenzen",
    collections: "*",
    pruefe(e, ctx) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      for (const [feld, ziel] of Object.entries(referenzFelder[e.collection])) {
        for (const s of alsArray(e.daten[feld])) {
          if (!ctx.slugs.get(ziel)?.has(s)) {
            b.push({ ebene: "fehler", code: "", feld, nachricht: `Referenz "${s}" in ${feld} zeigt auf nichts in ${ziel}/.` });
          }
        }
      }
      const h = e.daten.hauptentitaet;
      if (h && !ctx.slugs.get(h.typ as CollectionName)?.has(h.slug)) {
        b.push({ ebene: "fehler", code: "", feld: "hauptentitaet", nachricht: `hauptentitaet ${h.typ}/${h.slug} existiert nicht.` });
      }
      return b;
    },
  },

  {
    code: "interne-links",
    auchOhneSchema: true,
    collections: "*",
    pruefe(e, ctx) {
      const b: Befund[] = [];
      const pfade = [...e.body.matchAll(/\]\((\/[^)#\s]*)/g)].map((m) => m[1].replace(/\/$/, ""));
      for (const p of pfade) {
        const eintrag = Object.entries(urlPrefix).find(([, prefix]) => p.startsWith(prefix + "/"));
        if (!eintrag) continue; // /impressum, /daten etc.
        const [coll, prefix] = eintrag as [CollectionName, string];
        const ziel = p.slice(prefix.length + 1).split("/")[0];
        if (ziel && !ctx.slugs.get(coll)?.has(ziel)) {
          b.push({ ebene: "fehler", code: "", nachricht: `Toter interner Link: ${p}` });
        }
      }
      // Eindeutige Ziele zählen, nicht Vorkommen: Dreimal derselbe Link ist
      // eine Verbindung, keine drei (Review-Befund M3).
      const eindeutig = new Set(pfade).size;

      // Lektion 4: Die Mindestzahl gilt nur, soweit es überhaupt etwas zu
      // verlinken gibt. Auf einem frischen Register hat der erste Eintrag
      // keine Ziele — er wäre unter --strict rot, ohne dass etwas kaputt
      // ist. Der eigene Eintrag zählt nicht als Ziel; ein Selbstlink ist
      // keine Verbindung.
      let verfuegbar = 0;
      for (const [coll, menge] of ctx.slugs) {
        verfuegbar += coll === e.collection ? Math.max(0, menge.size - 1) : menge.size;
      }
      const soll = e.collection === "artikel" ? 5 : 2;
      const minLinks = Math.min(soll, verfuegbar);

      if (minLinks < soll) meldeLinkzieleKnapp(verfuegbar, soll);
      if (minLinks > 0 && eindeutig < minLinks) {
        b.push({ ebene: "warnung", code: "", nachricht: `Nur ${eindeutig} verschiedene interne Links (Ziel: ${minLinks}). Semantische Verlinkung ist der Hauptzweck dieser Seite.` });
      }
      return b;
    },
  },

  /* --- Fachliche Konsistenz --------------------------------------- */

  {
    code: "event-zeitraum",
    collections: ["events"],
    pruefe(e, ctx) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      const { beginn, ende, durchfuehrung } = e.daten;
      if (ende && new Date(ende) < new Date(beginn)) {
        b.push({ ebene: "fehler", code: "", feld: "ende", nachricht: "Ende liegt vor Beginn." });
      }
      const vorbei = new Date(ende ?? beginn) < ctx.heute;
      if (vorbei && durchfuehrung === "geplant") {
        b.push({ ebene: "fehler", code: "", feld: "durchfuehrung", nachricht: 'Termin ist vorbei, Status steht noch auf "geplant". Auf "stattgefunden" setzen — nicht löschen.' });
      }
      if (!vorbei && durchfuehrung === "stattgefunden") {
        b.push({ ebene: "fehler", code: "", feld: "durchfuehrung", nachricht: 'Status "stattgefunden", Termin liegt aber in der Zukunft.' });
      }
      if (["abgesagt", "verschoben"].includes(durchfuehrung) && !e.daten.durchfuehrungHinweis) {
        b.push({ ebene: "warnung", code: "", nachricht: "Abgesagt oder verschoben ohne durchfuehrungHinweis — Besucher brauchen die Begründung." });
      }
      return b;
    },
  },

  {
    code: "reihe-name",
    collections: ["events"],
    pruefe(e) {
      if (!e.daten) return [];
      if (e.daten.reihe && !e.daten.reiheName) {
        return [{ ebene: "fehler", code: "", feld: "reiheName", nachricht: "reihe gesetzt, aber kein reiheName — die Reihenseite und das superEvent im JSON-LD brauchen einen Anzeigenamen." }];
      }
      if (!e.daten.reihe && e.daten.reiheName) {
        return [{ ebene: "warnung", code: "", nachricht: "reiheName ohne reihe." }];
      }
      return [];
    },
  },

  {
    code: "event-preise",
    collections: ["events"],
    pruefe(e) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      const { eintrittFrei, preise, ticketUrl } = e.daten;
      if (eintrittFrei && preise.length > 0) {
        b.push({ ebene: "fehler", code: "", nachricht: "eintrittFrei: true, aber Preise hinterlegt." });
      }
      if (!eintrittFrei && preise.length === 0 && !ticketUrl) {
        b.push({ ebene: "warnung", code: "", nachricht: "Weder Preise noch Ticket-URL. Preis ist die meistgestellte Frage zu einem Event." });
      }
      return b;
    },
  },

  {
    code: "band-jahre",
    collections: ["bands"],
    pruefe(e) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      const { gegruendet, aufgeloest, aktiv } = e.daten;
      if (gegruendet && aufgeloest && aufgeloest < gegruendet) {
        b.push({ ebene: "fehler", code: "", nachricht: "Auflösung liegt vor Gründung." });
      }
      if (aufgeloest && aktiv) {
        b.push({ ebene: "fehler", code: "", nachricht: "aufgeloest gesetzt, aber aktiv: true." });
      }
      return b;
    },
  },

  /* --- Lexikon: Grounding-Page-Bausteine ---------------------------
   *
   * Umgesetzt nach dem Grounding Page Standard v1.6 (groundingpage.com).
   * Kein Normungsstandard, sondern ein Ordnungsrahmen — übernommen, weil
   * die Substanz trägt und sich weitgehend mit dem deckt, was ohnehin gilt.
   * Vier Bausteine gehen über unsere bisherigen Regeln hinaus.
   */

  {
    code: "gp-lead",
    collections: ["lexikon"],
    auchOhneSchema: true,
    pruefe(e) {
      const lead = ersterAbsatz(e.body);
      if (!lead) return [];
      const b: Befund[] = [];
      const saetze = nurText(lead).split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 15);
      // Definition, Einordnung, Zuordnung — mindestens zwei davon sichtbar.
      if (saetze.length < 2) {
        b.push({
          ebene: "warnung",
          code: "",
          nachricht: "Lead hat nur einen Satz. Der Standard sieht Definition, Einordnung und Abgrenzung vor — mindestens Definition plus Einordnung.",
        });
      }
      return b;
    },
  },

  {
    code: "gp-erstsatz-nennt-begriff",
    collections: ["lexikon"],
    auchOhneSchema: true,
    pruefe(e) {
      const satz = ersterSatz(ersterAbsatz(e.body));
      if (!satz) return [];
      const namen = [String(e.roh.name ?? ""), ...alsArray(e.roh.aliases)].filter(Boolean);
      const trifft = namen.some((n) => normalisiere(satz).includes(normalisiere(n)));
      return trifft
        ? []
        : [{
            ebene: "fehler",
            code: "",
            nachricht: `Der erste Satz nennt den Begriff nicht. Muster: "${e.roh.name} ist ein/e …" — isoliert extrahiert wäre der Satz sonst nicht zuzuordnen.`,
          }];
    },
  },

  {
    code: "gp-h2-nennt-begriff",
    collections: ["lexikon"],
    auchOhneSchema: true,
    pruefe(e) {
      const namen = [String(e.roh.name ?? ""), ...alsArray(e.roh.aliases)]
        .filter(Boolean)
        .map(normalisiere);
      const ohne: string[] = [];
      let imCodeblock = false;
      for (const z of e.body.split("\n")) {
        if (/^\s{0,3}```/.test(z)) { imCodeblock = !imCodeblock; continue; }
        if (imCodeblock) continue;
        const m = z.match(/^\s{0,3}##\s+(.*)$/);
        if (!m) continue;
        const titel = m[1].trim();
        if (!namen.some((n) => normalisiere(titel).includes(n))) ohne.push(titel);
      }
      if (ohne.length === 0) return [];
      // Ein Abschnitt wird einzeln extrahiert; ohne den Begriff in der
      // Überschrift verliert er seine Zuordnung.
      return [{
        ebene: e.roh.status === "veroeffentlicht" ? "fehler" : "warnung",
        code: "",
        nachricht: `H2 ohne Begriffsnamen: ${ohne.map((t) => `"${t}"`).join(", ")}. Isoliert extrahiert fehlt die Zuordnung — z. B. "Merkmale von ${e.roh.name}".`,
      }];
    },
  },

  {
    code: "gp-abgrenzung",
    collections: ["lexikon"],
    pruefe(e) {
      if (!e.daten) return [];
      if (e.daten.abgrenzung) return [];
      return [{
        ebene: e.daten.status === "veroeffentlicht" ? "fehler" : "warnung",
        code: "",
        feld: "abgrenzung",
        nachricht: "Keine Abgrenzung. Wovon wird der Begriff häufig verwechselt? Falsche Zuordnung ist die häufigste Fehlerquelle bei Entitäten, nicht fehlende Fakten.",
      }];
    },
  },

  {
    code: "lexikon-definition",
    collections: ["lexikon"],
    pruefe(e) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      if (!DEFINITORISCH.test(e.daten.definition)) {
        b.push({ ebene: "warnung", code: "", feld: "definition", nachricht: "definition wirkt nicht definitorisch — Muster: \"X ist ein …\"." });
      }
      if (!e.daten.definition.trim().endsWith(".")) {
        b.push({ ebene: "warnung", code: "", feld: "definition", nachricht: "definition sollte genau ein abgeschlossener Satz sein." });
      }
      return b;
    },
  },

  {
    code: "artikel-faq",
    collections: ["artikel"],
    pruefe(e) {
      if (!e.daten) return [];
      const noetig = ["pillar", "vergleich", "howto"].includes(e.daten.typ) ? 4 : 3;
      return (e.daten.faq ?? []).length < noetig
        ? [{ ebene: "warnung", code: "", nachricht: `Nur ${(e.daten.faq ?? []).length} FAQ-Einträge (Ziel für typ "${e.daten.typ}": ${noetig}). Echte Fragen aus der Prompt-Map nehmen.` }]
        : [];
    },
  },

  {
    code: "howto-felder",
    collections: ["artikel"],
    pruefe(e) {
      if (!e.daten) return [];
      if (e.daten.typ === "howto" && !e.daten.howto) {
        return [{ ebene: "fehler", code: "", nachricht: 'typ: howto ohne howto-Block — ohne Material und Dauer kein HowTo-Markup.' }];
      }
      if (e.daten.typ !== "howto" && e.daten.howto) {
        return [{ ebene: "warnung", code: "", nachricht: "howto-Block gesetzt, aber typ ist nicht howto." }];
      }
      return [];
    },
  },

  /* --- Bilder ----------------------------------------------------- */

  {
    code: "bildrechte",
    collections: "*",
    pruefe(e) {
      if (!e.daten) return [];
      const b: Befund[] = [];
      for (const bild of e.daten.bilder ?? []) {
        if (["lizenziert", "genehmigung-eingeholt", "pressematerial-freigegeben"].includes(bild.rechte) && !bild.rechteNachweis) {
          b.push({ ebene: "fehler", code: "", nachricht: `Bild "${bild.src}": rechte="${bild.rechte}" verlangt einen rechteNachweis (Mail, Vertrag, Ticket-ID).` });
        }
        if (zaehleWorte(bild.alt) < 4) {
          b.push({ ebene: "warnung", code: "", nachricht: `Bild "${bild.src}": Alt-Text zu dünn. Entitätsnamen nennen.` });
        }
      }
      return b;
    },
  },

  /* --- Lebenszyklus ----------------------------------------------- */

  {
    code: "veroeffentlichungsreife",
    collections: "*",
    pruefe(e) {
      if (!e.daten || e.daten.status !== "veroeffentlicht") return [];
      const b: Befund[] = [];
      if (!e.daten.autor) b.push({ ebene: "fehler", code: "", nachricht: "Veröffentlicht ohne Autor. E-E-A-T braucht einen Namen." });
      if ((e.daten.aliases ?? []).length === 0) {
        b.push({ ebene: "warnung", code: "", nachricht: "Keine aliases. Ohne Szene-Kurzformen fehlt die halbe Suchnachfrage." });
      }
      return b;
    },
  },

  {
    code: "pruefkadenz",
    collections: "*",
    pruefe(e, ctx) {
      if (!e.daten) return [];
      const alter = tageSeit(e.daten.geprueftAm, ctx.heute);
      const grenze = pruefKadenzTage[e.collection];
      if (alter > grenze * 2) {
        return [{ ebene: "fehler", code: "", nachricht: `Seit ${alter} Tagen nicht geprüft (Kadenz ${grenze} Tage, doppelt überschritten).` }];
      }
      if (alter > grenze) {
        return [{ ebene: "warnung", code: "", nachricht: `Seit ${alter} Tagen nicht geprüft (Kadenz ${grenze} Tage).` }];
      }
      return [];
    },
  },
];

/* ------------------------------------------------------------------ */
/* Globale Prüfungen (über alle Einträge)                              */
/* ------------------------------------------------------------------ */

function globalePruefungen(ctx: Kontext): Map<string, Befund[]> {
  const ergebnis = new Map<string, Befund[]>();
  const add = (datei: string, b: Befund) => {
    if (!ergebnis.has(datei)) ergebnis.set(datei, []);
    ergebnis.get(datei)!.push(b);
  };

  // Namens- und Alias-Kollisionen: der häufigste Schaden bei paralleler Recherche.
  for (const [norm, refs] of ctx.namensIndex) {
    if (refs.length < 2) continue;
    const eindeutig = [...new Set(refs)];
    if (eindeutig.length < 2) continue;
    for (const ref of eindeutig) {
      const eintrag = ctx.eintraege.find((e) => `${e.collection}/${e.slug}` === ref);
      if (eintrag) {
        add(eintrag.datei, {
          ebene: "fehler",
          code: "duplikat",
          nachricht: `Name oder Alias "${norm.split(":").slice(1).join(":")}" kollidiert mit: ${eindeutig.filter((r) => r !== ref).join(", ")}. Zusammenführen oder Alias entfernen.`,
        });
      }
    }
  }

  // Verwaiste Bands: im Line-up genannt, aber ohne eigene Seite.
  const offen = new Map<string, string[]>();
  for (const e of ctx.eintraege) {
    if (e.collection !== "events" || !e.daten) continue;
    for (const name of e.daten.lineupWeitere ?? []) {
      const n = normalisiere(name);
      if (!offen.has(n)) offen.set(n, []);
      offen.get(n)!.push(e.slug);
    }
  }
  for (const [name, events] of offen) {
    if (events.length >= 3) {
      const e = ctx.eintraege.find((x) => x.collection === "events" && x.slug === events[0]);
      if (e) {
        add(e.datei, {
          ebene: "warnung",
          code: "offene-entitaet",
          nachricht: `"${name}" steht in ${events.length} Line-ups ohne eigene Bandseite. Kandidat fürs Register.`,
        });
      }
    }
  }

  return ergebnis;
}

/* ------------------------------------------------------------------ */
/* Laden                                                               */
/* ------------------------------------------------------------------ */

function ladeEintraege(nurCollection?: CollectionName, nurDateien?: string[]): Eintrag[] {
  return ladeAlle({ collection: nurCollection, dateien: nurDateien });
}

/** Slug- und Namensindex immer über ALLE Dateien, auch im --changed-Modus. */
function baueKontext(): Kontext {
  const alle = ladeEintraege();
  const slugs = new Map<CollectionName, Set<string>>();
  const namensIndex = new Map<string, string[]>();

  for (const name of collectionNames) slugs.set(name, new Set());
  for (const e of alle) {
    slugs.get(e.collection)!.add(e.slug);
    const namen = [String(e.roh.name ?? ""), ...alsArray(e.roh.aliases)].filter(Boolean);
    for (const n of namen) {
      const norm = normalisiere(n);
      if (!norm) continue;
      const key = `${e.collection}:${norm}`; // Kollisionen nur innerhalb einer Collection
      if (!namensIndex.has(key)) namensIndex.set(key, []);
      namensIndex.get(key)!.push(`${e.collection}/${e.slug}`);
    }
  }
  return { eintraege: alle, slugs, namensIndex, heute: new Date() };
}

/* ------------------------------------------------------------------ */
/* Ausführung                                                          */
/* ------------------------------------------------------------------ */

function zodBefunde(fehler: z.ZodError): Befund[] {
  return fehler.issues.map((i) => ({
    ebene: "fehler" as const,
    code: "schema",
    feld: i.path.join(".") || undefined,
    nachricht: `${i.path.join(".") || "(Wurzel)"}: ${i.message}`,
  }));
}

function main() {
  const argv = process.argv.slice(2);
  const flag = (n: string) => argv.includes(n);
  const wert = (n: string) => {
    const i = argv.indexOf(n);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const changedIdx = argv.indexOf("--changed");
  const changed = changedIdx >= 0 ? argv.slice(changedIdx + 1).filter((a) => !a.startsWith("--")) : undefined;
  const collection = wert("--collection") as CollectionName | undefined;
  const strikt = flag("--strict");
  const alsJson = flag("--json");

  if (collection && !collectionNames.includes(collection)) {
    console.error(`Unbekannte Collection "${collection}". Erlaubt: ${collectionNames.join(", ")}`);
    process.exit(2);
  }

  const zuPruefen = ladeEintraege(collection, changed);
  if (zuPruefen.length === 0) {
    console.log("Nichts zu prüfen.");
    return;
  }
  const ctx = baueKontext();
  const global = globalePruefungen(ctx);
  const geprüftePfade = new Set(zuPruefen.map((e) => e.datei));

  const bericht = new Map<string, Befund[]>();
  for (const e of zuPruefen) {
    const befunde: Befund[] = [];

    if (!e.daten) {
      const parsed = collectionSchemas[e.collection].safeParse(e.roh);
      if (!parsed.success) befunde.push(...zodBefunde(parsed.error));
    }

    for (const regel of REGELN) {
      if (regel.collections !== "*" && !regel.collections.includes(e.collection)) continue;
      if (!e.daten && !regel.auchOhneSchema) continue;
      for (const b of regel.pruefe(e, ctx)) befunde.push({ ...b, code: b.code || regel.code });
    }

    for (const b of global.get(e.datei) ?? []) befunde.push(b);
    if (befunde.length) bericht.set(e.datei, befunde);
  }

  // Globale Funde (z. B. Duplikate) betreffen immer zwei Dateien. Im
  // Volllauf beide melden, im --changed-Modus nur die geänderte — sonst
  // rauscht der PostToolUse-Hook bei jeder Schreiboperation zu.
  if (!changed) {
    for (const [datei, befunde] of global) {
      if (!geprüftePfade.has(datei)) bericht.set(datei, [...(bericht.get(datei) ?? []), ...befunde]);
    }
  }

  const fehler = [...bericht.values()].flat().filter((b) => b.ebene === "fehler").length;
  const warnungen = [...bericht.values()].flat().filter((b) => b.ebene === "warnung").length;

  if (alsJson) {
    console.log(JSON.stringify({
      geprueft: zuPruefen.length,
      fehler,
      warnungen,
      befunde: [...bericht].map(([datei, b]) => ({ datei: path.relative(process.cwd(), datei), befunde: b })),
    }, null, 2));
  } else {
    for (const [datei, befunde] of [...bericht].sort()) {
      console.log(`\n${path.relative(process.cwd(), datei)}`);
      for (const b of befunde.sort((a, z) => a.ebene.localeCompare(z.ebene))) {
        const marke = b.ebene === "fehler" ? "FEHLER " : "warnung";
        console.log(`  ${marke}  [${b.code}] ${b.nachricht}`);
      }
    }
    console.log(
      `\n${zuPruefen.length} Datei(en) geprüft — ${fehler} Fehler, ${warnungen} Warnungen${strikt ? " (strict)" : ""}`,
    );
  }

  process.exit(fehler > 0 || (strikt && warnungen > 0) ? 1 : 0);
}

main();
