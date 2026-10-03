#!/usr/bin/env -S npx tsx
/**
 * gegenlesen.ts — der Gegenleser: belegpflichtige Felder blind gegen die
 * Quelle prüfen lassen und im Code vergleichen.
 *
 * ANLASS (Entscheidung Markus, 2026-09-30): Die Prüfkette beweist Struktur,
 * nicht Wahrheit. Beim Record Hop war die Anfangszeit falsch, alle Prüfungen
 * grün, gefunden nur durch Zufall. Und der Engpass des Projekts ist Markus'
 * Prüfzeit, nicht das Erzeugen. Ein zweiter, unabhängiger Agent liest deshalb
 * vor jedem Inhalts-PR die Quellen erneut, und dieses Skript vergleicht.
 *
 * ARBEITSTEILUNG (BETRIEB.md 2.1: Skripte rechnen, Agenten urteilen):
 *
 *   1. `--auftrag` schreibt die Prüfpunkte: je Eintrag und belegpflichtigem
 *      Feld die Frage und die Quellen, die das Feld laut `quellen[]` decken.
 *      OHNE die eingetragenen Werte. Ein Prüfer, dem man „19:00" vorlegt,
 *      findet gern 19:00; einer, der die Uhrzeit selbst aus der Quelle holen
 *      muss, nicht. Einzige Ausnahme: Bei Terminen stehen Name und Datum im
 *      Auftrag, sonst fände der Prüfer auf einer Kalenderseite mit fünf
 *      Terminen den richtigen nicht. Gibt es an dem Tag keinen solchen
 *      Termin, meldet er das — auch das Datum wird so geprüft.
 *   2. Der Gegenleser (ein Subagent, Anleitung in docs/ablaeufe/gegenlesen.md)
 *      öffnet jede Quelle und antwortet je Prüfpunkt mit Wert und Zitat.
 *   3. `--vergleich <antwort.json>` vergleicht im Code und schreibt den
 *      Abschnitt für die PR-Beschreibung. Es ändert NICHTS am Eintrag
 *      (Entscheidung Markus: nur melden; sonst urteilte am Ende wieder der
 *      Autor über seinen eigenen Fehler).
 *
 * URTEILE: bestätigt · Abweichung · Sichtprüfung (der Code kann es nicht
 * entscheiden, Quelle und Eintrag stehen nebeneinander) · nicht prüfbar
 * (Quelle nicht erreichbar, keine Quelle). Eine Antwort, die Prüfpunkte
 * auslässt, ist ungültig — ein Gegenleser, der still Felder überspringt,
 * wäre ein grünes Häkchen ohne Prüfung (Lektion 19).
 *
 *   npx tsx scripts/gegenlesen.ts --auftrag --basis origin/main > auftrag.json
 *   npx tsx scripts/gegenlesen.ts --vergleich antwort.json --basis origin/main
 *   npx tsx scripts/gegenlesen.ts --auftrag --dateien src/content/events/x.md
 *
 * Exitcodes von --vergleich: 0 keine Abweichung, 3 Abweichung(en),
 * 1 Antwort ungültig oder unvollständig, 2 Aufruf falsch.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ladeAlle, type GeladenerEintrag } from "./_laden";
import { belegpflichtigeFelder } from "../src/content/_schemas";
import { site } from "../src/site.config";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ANLEITUNG = "docs/ablaeufe/gegenlesen.md";

/* ------------------------------------------------------------------ */
/* Typen                                                               */
/* ------------------------------------------------------------------ */

export interface Pruefpunkt {
  id: string;
  pfad: string;
  name: string;
  feld: string;
  /** Was der Gegenleser herausfinden soll, und in welcher Form. */
  frage: string;
  /** Nur bei Terminen: woran der Termin in der Quelle zu erkennen ist. */
  termin?: { name: string; datum: string };
  quellen: string[];
}

export interface Auftrag {
  anleitung: string;
  pruefpunkte: Pruefpunkt[];
}

export interface Antwort {
  id: string;
  ergebnis: "gefunden" | "nicht-gefunden" | "nicht-erreichbar";
  wert?: any;
  zitat?: string;
  quelle?: string;
  grund?: string;
}

export type Urteil = "bestaetigt" | "abweichung" | "sichtpruefung" | "nicht-pruefbar";

export interface Befund {
  id: string;
  pfad: string;
  feld: string;
  urteil: Urteil;
  eingetragen: string;
  quelleSagt: string;
  zitat?: string;
  url?: string;
  hinweis?: string;
}

/* ------------------------------------------------------------------ */
/* Hilfen                                                              */
/* ------------------------------------------------------------------ */

/** Für Namensvergleiche: klein, ohne Akzente und Satzzeichen. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TEILE = new Intl.DateTimeFormat("en-CA", {
  timeZone: site.zeitzone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Datum und Uhrzeit eines Zeitpunkts in der Zeitzone der Site. */
export function ortszeit(d: Date): { datum: string; uhrzeit: string } {
  const t = Object.fromEntries(TEILE.formatToParts(d).map((p) => [p.type, p.value]));
  return { datum: `${t.year}-${t.month}-${t.day}`, uhrzeit: `${t.hour}:${t.minute}` };
}

function quellenFuer(daten: Record<string, any>, felder: string[]): string[] {
  const urls: string[] = (daten.quellen ?? [])
    .filter((q: any) => (q.felder ?? []).some((f: string) => felder.includes(f)))
    .map((q: any) => q.url as string);
  return [...new Set(urls)];
}

/* ------------------------------------------------------------------ */
/* Auftrag                                                             */
/* ------------------------------------------------------------------ */

const FRAGEN: Record<string, string> = {
  beginn:
    'Wann beginnt der Termin laut Quelle? wert: {"datum":"JJJJ-MM-TT","uhrzeit":"HH:MM" oder null,"einlass":"HH:MM" oder null} — Ortszeit, wie die Quelle sie nennt.',
  ende: 'Wann endet der Termin laut Quelle? wert: {"datum":"JJJJ-MM-TT","uhrzeit":"HH:MM" oder null}.',
  preise:
    'Welche Eintrittspreise nennt die Quelle? wert: {"betraege":[Zahl, …],"waehrung":"EUR"} oder {"frei":true}. Nennt sie keinen Preis: ergebnis "nicht-gefunden".',
  ort: 'Wo findet der Termin statt? wert: {"name":"Name des Hauses","stadt":"Ort"}.',
  lineupBands: 'Wer spielt laut Quelle? wert: {"acts":["Name", …]} — alle genannten Bands und Künstler.',
  ticketUrl: 'Wo gibt es laut Quelle Tickets? wert: {"url":"https://…"}.',
  kapazitaet: 'Wie viele Besucher fasst der Termin oder das Haus laut Quelle? wert: {"zahl":Zahl}.',
  durchfuehrung:
    'Nennt die Quelle eine Absage, Verschiebung oder „ausverkauft"? wert: {"status":"geplant"|"abgesagt"|"verschoben"|"ausverkauft"} — ohne solchen Hinweis "geplant".',
};

const allgemeineFrage = (feld: string) =>
  `Was sagt die Quelle zu „${feld}"? wert: {"text":"…"} — wörtlich oder knapp zusammengefasst.`;

/** Ob ein Feld im Eintrag überhaupt etwas behauptet. */
function belegt(wert: unknown): boolean {
  if (wert === undefined || wert === null || wert === "") return false;
  if (Array.isArray(wert)) return wert.length > 0;
  return true;
}

export function pruefpunkteFuer(e: GeladenerEintrag): Pruefpunkt[] {
  const d = e.daten;
  if (!d) return [];
  const pfad = `${e.collection}/${e.slug}`;
  const name = String(d.name ?? e.slug);
  const felder = [...(belegpflichtigeFelder[e.collection] ?? [])];
  const aus: Pruefpunkt[] = [];

  const termin = e.collection === "events" && d.beginn instanceof Date ? { name, datum: ortszeit(d.beginn).datum } : undefined;

  for (const feld of felder) {
    // `preise` wird bei Terminen immer gefragt: Auch „frei" und „nicht
    // veröffentlicht" sind Aussagen über die Quelle (event-preise).
    const immer = e.collection === "events" && feld === "preise";
    if (!immer && !belegt(d[feld])) continue;
    // Ein vergangener Termin braucht keine Statusprüfung mehr.
    if (feld === "durchfuehrung" && d[feld] === "stattgefunden") continue;
    const deckend = feld === "preise" ? ["preise", "eintritt"] : [feld];
    aus.push({
      id: `${pfad}#${feld}`,
      pfad,
      name,
      feld,
      frage: FRAGEN[feld] && e.collection === "events" ? FRAGEN[feld] : allgemeineFrage(feld),
      ...(termin ? { termin } : {}),
      quellen: quellenFuer(d, deckend),
    });
  }
  return aus;
}

/** Die Einträge der Auswahl, zu denen es keinen einzigen Prüfpunkt gibt. */
export function ohnePruefpunkte(eintraege: GeladenerEintrag[]): string[] {
  return eintraege.filter((e) => pruefpunkteFuer(e).length === 0).map((e) => `${e.collection}/${e.slug}`);
}

export function auftragFuer(eintraege: GeladenerEintrag[]): Auftrag {
  return { anleitung: ANLEITUNG, pruefpunkte: eintraege.flatMap(pruefpunkteFuer) };
}

/* ------------------------------------------------------------------ */
/* Vergleich                                                           */
/* ------------------------------------------------------------------ */

export interface Kontext {
  /** "collection/slug" → Eintrag, für Orte und Bands. */
  alle: Map<string, GeladenerEintrag>;
}

/** Prüft die Form der Antwort. Gibt Fehlermeldungen zurück, leer = gültig. */
export function pruefeAntwort(auftrag: Auftrag, antworten: unknown): string[] {
  const fehler: string[] = [];
  if (!Array.isArray(antworten)) return ["Die Antwort ist keine Liste."];
  const ids = new Set(auftrag.pruefpunkte.map((p) => p.id));
  const gesehen = new Map<string, number>();
  for (const a of antworten as any[]) {
    if (!a || typeof a.id !== "string") {
      fehler.push("Ein Antworteintrag hat keine id.");
      continue;
    }
    if (!ids.has(a.id)) fehler.push(`Unbekannter Prüfpunkt: ${a.id}`);
    gesehen.set(a.id, (gesehen.get(a.id) ?? 0) + 1);
    if (!["gefunden", "nicht-gefunden", "nicht-erreichbar"].includes(a.ergebnis)) {
      fehler.push(`${a.id}: ergebnis muss gefunden, nicht-gefunden oder nicht-erreichbar sein.`);
    }
    if (a.ergebnis === "gefunden" && (a.wert === undefined || !a.zitat)) {
      fehler.push(`${a.id}: „gefunden" braucht wert und zitat.`);
    }
    if (a.ergebnis !== "gefunden" && !a.grund) fehler.push(`${a.id}: „${a.ergebnis}" braucht einen grund.`);
  }
  for (const id of ids) if (!gesehen.has(id)) fehler.push(`Nicht beantwortet: ${id}`);
  for (const [id, n] of gesehen) if (n > 1) fehler.push(`Mehrfach beantwortet: ${id}`);
  return fehler;
}

type Vergleich = { urteil: Urteil; eingetragen: string; quelleSagt: string; hinweis?: string };

function zeitVergleich(eintrag: Date | undefined, w: any, ganztaegig: boolean, mitEinlass: boolean): Vergleich {
  if (!(eintrag instanceof Date)) return { urteil: "sichtpruefung", eingetragen: "—", quelleSagt: JSON.stringify(w) };
  const e = ortszeit(eintrag);
  const eingetragen = ganztaegig ? e.datum : `${e.datum} ${e.uhrzeit}`;
  const quelleSagt = `${w?.datum ?? "?"}${w?.uhrzeit ? ` ${w.uhrzeit}` : ""}${mitEinlass && w?.einlass ? ` (Einlass ${w.einlass})` : ""}`;
  if (w?.datum !== e.datum) return { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "anderes Datum" };
  if (ganztaegig) return { urteil: "bestaetigt", eingetragen, quelleSagt };
  if (!w?.uhrzeit) {
    return { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "die Quelle nennt keine Uhrzeit — die eingetragene ist nicht gedeckt" };
  }
  if (w.uhrzeit === e.uhrzeit) return { urteil: "bestaetigt", eingetragen, quelleSagt };
  if (mitEinlass && w.einlass === e.uhrzeit) {
    return { urteil: "sichtpruefung", eingetragen, quelleSagt, hinweis: "eingetragen ist der Einlass, nicht der Beginn" };
  }
  return { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "andere Uhrzeit" };
}

function preisVergleich(d: Record<string, any>, a: Antwort): Vergleich {
  const betraege = ((d.preise ?? []) as { betrag: number }[]).map((p) => p.betrag).sort((x, y) => x - y);
  const eingetragen =
    d.eintritt === "frei" ? "Eintritt frei" : d.eintritt === "unveroeffentlicht" ? "kein Preis veröffentlicht" : betraege.join(" / ");
  if (a.ergebnis === "nicht-gefunden") {
    const quelleSagt = "nennt keinen Preis";
    return d.eintritt === "unveroeffentlicht"
      ? { urteil: "bestaetigt", eingetragen, quelleSagt }
      : { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "eingetragener Preis nicht gedeckt" };
  }
  const w = a.wert ?? {};
  if (w.frei === true) {
    return d.eintritt === "frei"
      ? { urteil: "bestaetigt", eingetragen, quelleSagt: "Eintritt frei" }
      : { urteil: "abweichung", eingetragen, quelleSagt: "Eintritt frei" };
  }
  const quelle = (Array.isArray(w.betraege) ? w.betraege : []).map(Number).sort((x: number, y: number) => x - y);
  const quelleSagt = quelle.join(" / ") || JSON.stringify(w);
  if (d.eintritt !== "beziffert") return { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "die Quelle nennt einen Preis" };
  if (JSON.stringify(quelle) === JSON.stringify(betraege)) return { urteil: "bestaetigt", eingetragen, quelleSagt };
  const rest = [...quelle];
  const alleDa = betraege.every((b) => {
    const i = rest.indexOf(b);
    if (i < 0) return false;
    rest.splice(i, 1);
    return true;
  });
  return alleDa
    ? { urteil: "sichtpruefung", eingetragen, quelleSagt, hinweis: "die Quelle nennt weitere Preise" }
    : { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "andere Beträge" };
}

function ortVergleich(slug: string, w: any, k: Kontext): Vergleich {
  const ort = k.alle.get(`locations/${slug}`)?.daten;
  const stadt = ort?.adresse?.ort ?? "";
  const eingetragen = ort ? `${ort.name}, ${stadt}` : slug;
  const quelleSagt = `${w?.name ?? "?"}, ${w?.stadt ?? "?"}`;
  if (!ort) return { urteil: "sichtpruefung", eingetragen, quelleSagt, hinweis: "Ort nicht im Register gefunden" };
  const stadtGleich = norm(String(w?.stadt ?? "")) !== "" && (norm(String(w.stadt)).includes(norm(stadt)) || norm(stadt).includes(norm(String(w.stadt))));
  if (!stadtGleich) return { urteil: "abweichung", eingetragen, quelleSagt, hinweis: "andere Stadt" };
  const namen = [ort.name, ...(ort.aliases ?? [])].map((n: string) => norm(n));
  const gesucht = norm(String(w?.name ?? ""));
  const nameGleich = gesucht !== "" && namen.some((n: string) => n.includes(gesucht) || gesucht.includes(n));
  return nameGleich
    ? { urteil: "bestaetigt", eingetragen, quelleSagt }
    : { urteil: "sichtpruefung", eingetragen, quelleSagt, hinweis: "Stadt stimmt, Name anders geschrieben" };
}

function lineupVergleich(slugs: string[], w: any, k: Kontext): Vergleich {
  const acts = (Array.isArray(w?.acts) ? w.acts : []).map((a: unknown) => norm(String(a)));
  const fehlend: string[] = [];
  const namen: string[] = [];
  for (const slug of slugs) {
    const band = k.alle.get(`bands/${slug}`)?.daten;
    const varianten = [band?.name ?? slug, ...(band?.aliases ?? [])].map((n: string) => norm(n)).filter(Boolean);
    namen.push(band?.name ?? slug);
    if (!acts.some((a: string) => varianten.some((v) => a === v || a.includes(v) || v.includes(a)))) fehlend.push(band?.name ?? slug);
  }
  const quelleSagt = (w?.acts ?? []).join(", ") || "?";
  return fehlend.length === 0
    ? { urteil: "bestaetigt", eingetragen: namen.join(", "), quelleSagt }
    : { urteil: "abweichung", eingetragen: namen.join(", "), quelleSagt, hinweis: `nicht in der Quelle: ${fehlend.join(", ")}` };
}

function urlNorm(u: string): string {
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^www\./, "")}${x.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return u.trim().toLowerCase();
  }
}

/** Die Prüfung eines Punkts gegen den Eintrag. */
export function vergleiche(p: Pruefpunkt, a: Antwort, e: GeladenerEintrag, k: Kontext): Befund {
  const d = e.daten ?? {};
  const basis = { id: p.id, pfad: p.pfad, feld: p.feld, zitat: a.zitat, url: a.quelle };
  if (p.quellen.length === 0) {
    return { ...basis, urteil: "nicht-pruefbar", eingetragen: String(d[p.feld] ?? "—"), quelleSagt: "—", hinweis: "keine Quelle deckt das Feld" };
  }
  if (a.ergebnis === "nicht-erreichbar") {
    return { ...basis, urteil: "nicht-pruefbar", eingetragen: String(d[p.feld] ?? "—"), quelleSagt: "—", hinweis: a.grund };
  }

  let v: Vergleich;
  const hart = ["beginn", "ende", "ort", "lineupBands", "kapazitaet"];
  if (e.collection === "events" && p.feld === "preise") {
    v = preisVergleich(d, a);
  } else if (a.ergebnis === "nicht-gefunden") {
    const eingetragen = String(d[p.feld] ?? "—");
    v = hart.includes(p.feld) && e.collection === "events"
      ? { urteil: "abweichung", eingetragen, quelleSagt: "nicht gefunden", hinweis: a.grund }
      : { urteil: "sichtpruefung", eingetragen, quelleSagt: "nicht gefunden", hinweis: a.grund };
  } else if (e.collection === "events" && p.feld === "beginn") {
    v = zeitVergleich(d.beginn, a.wert, Boolean(d.ganztaegig), true);
  } else if (e.collection === "events" && p.feld === "ende") {
    v = zeitVergleich(d.ende, a.wert, Boolean(d.ganztaegig), false);
  } else if (e.collection === "events" && p.feld === "ort") {
    v = ortVergleich(String(d.ort), a.wert, k);
  } else if (e.collection === "events" && p.feld === "lineupBands") {
    v = lineupVergleich(d.lineupBands ?? [], a.wert, k);
  } else if (e.collection === "events" && p.feld === "ticketUrl") {
    const quelleSagt = String(a.wert?.url ?? "?");
    v = urlNorm(quelleSagt) === urlNorm(String(d.ticketUrl))
      ? { urteil: "bestaetigt", eingetragen: String(d.ticketUrl), quelleSagt }
      : { urteil: "sichtpruefung", eingetragen: String(d.ticketUrl), quelleSagt, hinweis: "anderer Ticket-Link" };
  } else if (e.collection === "events" && p.feld === "kapazitaet") {
    const zahl = Number(a.wert?.zahl);
    v = zahl === d.kapazitaet
      ? { urteil: "bestaetigt", eingetragen: String(d.kapazitaet), quelleSagt: String(zahl) }
      : { urteil: "abweichung", eingetragen: String(d.kapazitaet), quelleSagt: String(a.wert?.zahl ?? "?") };
  } else if (e.collection === "events" && p.feld === "durchfuehrung") {
    const status = String(a.wert?.status ?? "?");
    v = status === d.durchfuehrung
      ? { urteil: "bestaetigt", eingetragen: d.durchfuehrung, quelleSagt: status }
      : { urteil: "abweichung", eingetragen: d.durchfuehrung, quelleSagt: status };
  } else {
    // Alles Übrige vergleicht kein Code verlässlich — Quelle und Eintrag
    // stehen nebeneinander, ein Mensch sieht hin.
    v = {
      urteil: "sichtpruefung",
      eingetragen: typeof d[p.feld] === "object" ? JSON.stringify(d[p.feld]) : String(d[p.feld]),
      quelleSagt: String(a.wert?.text ?? JSON.stringify(a.wert)),
    };
  }
  return { ...basis, ...v };
}

export function vergleichAlles(auftrag: Auftrag, antworten: Antwort[], k: Kontext): Befund[] {
  const nachId = new Map(antworten.map((a) => [a.id, a]));
  return auftrag.pruefpunkte.map((p) => {
    const e = k.alle.get(p.pfad);
    const a = nachId.get(p.id)!;
    if (!e) return { id: p.id, pfad: p.pfad, feld: p.feld, urteil: "nicht-pruefbar" as const, eingetragen: "—", quelleSagt: "—", hinweis: "Eintrag nicht gefunden" };
    return vergleiche(p, a, e, k);
  });
}

/* ------------------------------------------------------------------ */
/* Bericht                                                             */
/* ------------------------------------------------------------------ */

const zelle = (s: string | undefined) => (s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

/**
 * Der Abschnitt für die PR-Beschreibung. `ungeprueft` sind die Einträge der
 * Auswahl, die keinen einzigen Prüfpunkt hatten — bei Artikeln immer, weil
 * `belegpflichtigeFelder.artikel` leer ist. Sie stehen ausdrücklich da: Ein
 * „0 Abweichungen" über Einträge, die niemand gelesen hat, sähe aus wie eine
 * bestandene Prüfung (Fund vom 2026-10-02, Entscheidung Markus vom
 * 2026-10-03, OFFENE-PUNKTE „Gegenleser ist für Artikel blind").
 */
export function alsMarkdown(befunde: Befund[], ungeprueft: string[] = []): string {
  const zahl = (u: Urteil) => befunde.filter((b) => b.urteil === u).length;
  const ohne = ungeprueft.map((p) => `\`${p}\``).join(", ");
  if (befunde.length === 0) {
    return [
      "## Gegenleser",
      "",
      "**Nicht anwendbar:** 0 Prüfpunkte. Kein geänderter Eintrag hat ein belegpflichtiges Feld mit Wert, " +
        "gelesen wurde nichts — das ist keine bestandene Prüfung." +
        (ohne ? ` Nicht gegengelesen: ${ohne}.` : ""),
    ].join("\n");
  }
  const zeilen: string[] = [
    "## Gegenleser",
    "",
    `${befunde.length} Prüfpunkte, blind gegen die Quellen gelesen: ` +
      `${zahl("bestaetigt")} bestätigt, **${zahl("abweichung")} Abweichung(en)**, ` +
      `${zahl("sichtpruefung")} zur Sichtprüfung, ${zahl("nicht-pruefbar")} nicht prüfbar.`,
  ];
  if (ohne) zeilen.push("", `Ohne Prüfpunkte, also nicht gegengelesen: ${ohne}.`);
  const tabelle = (titel: string, u: Urteil, offen: boolean) => {
    const liste = befunde.filter((b) => b.urteil === u);
    if (liste.length === 0) return;
    const kopf = ["| Eintrag | Feld | Eingetragen | Quelle sagt | Zitat |", "|---|---|---|---|---|"];
    const rumpf = liste.map(
      (b) =>
        `| ${zelle(b.pfad)} | ${b.feld} | ${zelle(b.eingetragen)} | ${zelle(b.quelleSagt)}${b.hinweis ? ` — ${zelle(b.hinweis)}` : ""} | ${b.url ? `[${zelle(b.zitat ?? "Quelle")}](${b.url})` : zelle(b.zitat)} |`,
    );
    if (offen) zeilen.push("", `**${titel}**`, "", ...kopf, ...rumpf);
    else zeilen.push("", `<details><summary>${titel} (${liste.length})</summary>`, "", ...kopf, ...rumpf, "", "</details>");
  };
  tabelle("Abweichungen", "abweichung", true);
  tabelle("Zur Sichtprüfung", "sichtpruefung", true);
  tabelle("Nicht prüfbar", "nicht-pruefbar", false);
  tabelle("Bestätigt", "bestaetigt", false);
  return zeilen.join("\n");
}

/* ------------------------------------------------------------------ */

function auswahl(argv: string[], alle: GeladenerEintrag[]): GeladenerEintrag[] {
  const wert = (n: string) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined);
  const basis = wert("--basis");
  const dateien = wert("--dateien");
  if (!basis && !dateien) {
    console.error("Auswahl fehlt: --basis <ref> oder --dateien a.md,b.md");
    process.exit(2);
  }
  const liste = dateien
    ? dateien.split(",")
    : execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", `${basis}...HEAD`], { cwd: PROJEKT, encoding: "utf8" })
        .split("\n")
        .filter((f) => /^src\/content\/[^/]+\/[^_][^/]*\.md$/.test(f));
  const gewaehlt = new Set(liste.map((f) => path.resolve(PROJEKT, f)));
  return alle.filter((e) => gewaehlt.has(e.datei));
}

function main() {
  const argv = process.argv.slice(2);
  const alle = ladeAlle();
  const gewaehlt = auswahl(argv, alle);
  const auftrag = auftragFuer(gewaehlt);

  if (argv.includes("--auftrag")) {
    console.log(JSON.stringify(auftrag, null, 2));
    console.error(`${auftrag.pruefpunkte.length} Prüfpunkte aus ${gewaehlt.length} Eintrag/Einträgen.`);
    const ohne = ohnePruefpunkte(gewaehlt);
    if (ohne.length) console.error(`Ohne Prüfpunkte, also nicht gegengelesen: ${ohne.join(", ")}.`);
    process.exit(0);
  }

  const i = argv.indexOf("--vergleich");
  if (i < 0 || !argv[i + 1]) {
    console.error("Modus fehlt: --auftrag oder --vergleich <antwort.json>");
    process.exit(2);
  }
  let antworten: unknown;
  try {
    antworten = JSON.parse(readFileSync(argv[i + 1]!, "utf8"));
  } catch (err: any) {
    console.error(`Antwort nicht lesbar: ${err.message}`);
    process.exit(1);
  }
  const fehler = pruefeAntwort(auftrag, antworten);
  if (fehler.length) {
    console.error(`Gegenlesen unvollständig oder ungültig (${fehler.length}):`);
    for (const f of fehler) console.error(`  ${f}`);
    process.exit(1);
  }
  const befunde = vergleichAlles(auftrag, antworten as Antwort[], {
    alle: new Map(alle.map((e) => [`${e.collection}/${e.slug}`, e])),
  });
  if (argv.includes("--json")) console.log(JSON.stringify(befunde, null, 2));
  else console.log(alsMarkdown(befunde, ohnePruefpunkte(gewaehlt)));
  process.exit(befunde.some((b) => b.urteil === "abweichung") ? 3 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
