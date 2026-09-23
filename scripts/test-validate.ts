#!/usr/bin/env -S npx tsx
/**
 * test-validate.ts — der Testharnisch für den Torwächter.
 *
 * Befund M00 aus dem Review: `validate-content.ts` trägt über zwanzig Regeln
 * und hatte keinen automatisierten Test. Negativtests liefen von Hand und
 * hinterließen keine Spur — bei den schärfsten Prüfungen des Projekts war
 * jede Regeländerung ein Blindflug.
 *
 * Aufbau nach dem Muster von test-hooks.ts und test-sync-autolinks.ts: ein
 * Temp-Verzeichnis bekommt `scripts` und `node_modules` als Symlink und ein
 * eigenes `src/content`. Das genügt, weil der Loader seine Wurzel aus
 * `process.cwd()` bildet — das echte Register wird nie angefasst. Die
 * Modulauflösung von `../src/content/_schemas` folgt dem Symlink zurück ins
 * Projekt, sodass gegen den echten Datenvertrag geprüft wird.
 *
 * Geprüft wird über `--json --changed`: Das Ergebnis nennt je Datei die
 * Befunde mit `code` und `ebene`. Daran lässt sich präzise prüfen, welche
 * Regel angeschlagen hat — statt Textausgabe zu lesen, die sich mit jeder
 * Formulierung ändert.
 *
 * Je Regel mindestens ein Fall, der anschlägt, und einer, der sauber
 * durchgeht. Wo eine Regel je nach `status` Fehler oder Warnung meldet,
 * werden beide Ebenen geprüft — das ist die Unterscheidung, die im Betrieb
 * zählt (Entwurf darf warnen, Veröffentlichtes muss brechen).
 *
 *   npx tsx scripts/test-validate.ts
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { site } from "../src/site.config";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Datumshilfen — Regeln wie pruefkadenz rechnen gegen "heute"          */
/* ------------------------------------------------------------------ */

/**
 * Ein Tag relativ zu heute, gerechnet in der Zeitzone der Site.
 *
 * Nicht `Date.now() - n * 86_400_000`: Das ergäbe den Tag in UTC, und der
 * ist zwischen Mitternacht und zwei Uhr Ortszeit der Vortag. Die Fixtures zu
 * `event-zeitraum` hängen genau an dieser Unterscheidung — mit der
 * UTC-Rechnung wäre der Test in diesen zwei Stunden jeder Nacht rot, ohne
 * dass etwas kaputt wäre (Lektion 4: ein roter Lauf muss einen echten Fehler
 * bedeuten).
 */
const tagVorOrt = (versatz: number): string => {
  const heute = new Intl.DateTimeFormat("en-CA", {
    timeZone: site.zeitzone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [j, m, t] = heute.split("-").map(Number);
  return new Date(Date.UTC(j, m - 1, t + versatz)).toISOString().slice(0, 10);
};

const vorTagen = (n: number): string => tagVorOrt(-n);
const inTagen = (n: number): string => tagVorOrt(n);

const HEUTE = tagVorOrt(0);
/** Das laufende Jahr in site.zeitzone -- HEUTE ist dort schon formatiert. */
const JAHR = Number(HEUTE.slice(0, 4));

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

interface Fall {
  /** Was dieser Fall zeigen soll. */
  name: string;
  /** Pfad relativ zu src/content, z. B. "lexikon/kaputt.md". */
  datei: string;
  inhalt: string;
  /** Codes, die im Ergebnis stehen MÜSSEN — optional mit erwarteter Ebene. */
  erwartet?: Record<string, "fehler" | "warnung" | "hinweis">;
  /** Codes, die NICHT vorkommen dürfen. */
  verboten?: string[];
}

const faelle: Fall[] = [];
const fall = (f: Fall) => { faelle.push(f); return f; };

/** Wörter auffüllen, wo eine Regel nur Länge verlangt (mindestlaenge). */
const FUELLWORTE = (
  "Der Schnitt folgt der Linie der Zeit und bleibt dabei tragbar im Alltag der Szene " +
  "denn die Form entsteht aus Stoff und Verarbeitung statt aus einem Gestell " +
  "was sich beim Tanzen und beim langen Stehen an der Bar gleichermassen bemerkbar macht " +
  "und deshalb bis heute von Traegerinnen und Traegern geschaetzt wird die Wert auf Haltbarkeit legen"
).split(/\s+/);
const fueller = (n: number): string => {
  const w: string[] = [];
  while (w.length < n) w.push(...FUELLWORTE);
  return w.slice(0, n).join(" ") + ".";
};

/** Frontmatter + Body zu einer Datei. Werte sind rohes YAML. */
function md(felder: Record<string, string | undefined>, body: string): string {
  const zeilen = Object.entries(felder)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`);
  return `---\n${zeilen.join("\n")}\n---\n\n${body}\n`;
}

/** Eine Quelle, die das angegebene Feld deckt. */
const quelle = (felder: string) =>
  `\n  - url: https://de.wikipedia.org/wiki/Rock_(Kleidung)\n` +
  `    titel: Rock (Wikipedia)\n` +
  `    abgerufenAm: ${HEUTE}\n` +
  `    felder: [${felder}]\n` +
  `    art: nachschlagewerk`;

/** Lead + eine H2, die den Begriff nennt. Erfüllt Kapsel-, GP- und Längenregeln. */
const lexKoerper = (begriff: string, worte = 70) =>
  `Ein ${begriff} ist ein Kleidungsstueck aus der Mode der fuenfziger Jahre, das in der Taille eng anliegt und nach unten weit ausschwingt. ` +
  `In der Vintage- und Rockabilly-Szene gilt der ${begriff} bis heute als feste Groesse, weil er die Silhouette der Zeit ohne Hilfsmittel traegt.\n\n` +
  `## Schnitt von ${begriff}\n\n${fueller(worte)}`;

/** Vollstaendiges, regelkonformes Lexikon-Frontmatter. Einzelne Felder ueberschreibbar. */
const lexFelder = (name: string, ueber: Record<string, string | undefined> = {}) => ({
  name,
  aliases: `[${name}-Form]`,
  kurzbeschreibung: `Ein ${name} ist ein weit schwingendes Kleidungsstueck der fuenfziger Jahre und in der Vintage-Szene bis heute gebraeuchlich.`,
  status: "entwurf",
  erstelltAm: HEUTE,
  geprueftAm: HEUTE,
  autor: "markus",
  kategorie: "mode",
  definition: `Ein ${name} ist ein in der Taille anliegender, nach unten weit ausgestellter Rock der fuenfziger Jahre.`,
  abgrenzung: `Ein ${name} wird oft mit dem Petticoat verwechselt, ist aber Oberbekleidung und kein Unterrock.`,
  quellen: quelle("definition, kurzbeschreibung"),
  ...ueber,
});

/* --- Zwei saubere Grundeintraege ---------------------------------- */
/* Sie sind zugleich Verlinkungs- und Referenzziele fuer andere Faelle. */

fall({
  name: "sauberer Lexikoneintrag loest keine der geprueften Regeln aus",
  datei: "lexikon/tellerrock.md",
  inhalt: md(lexFelder("Tellerrock"), lexKoerper("Tellerrock")),
  verboten: [
    "schema", "kapsel-vorhanden", "kapsel-definitorisch", "ueberschriften", "mindestlaenge",
    "platzhalter", "reservierter-slug", "quellen-vorhanden", "belegpflicht",
    "quellen-felder-gueltig", "referenzen", "lexikon-definition",
    "lexikon-schreibvarianten", "gp-lead",
    "gp-erstsatz-nennt-begriff", "gp-h2-nennt-begriff", "gp-abgrenzung", "bildrechte",
    "veroeffentlichungsreife", "pruefkadenz", "duplikat",
  ],
});

fall({
  name: "zweiter sauberer Lexikoneintrag (Verlinkungsziel)",
  datei: "lexikon/bolero.md",
  inhalt: md(lexFelder("Bolero"), lexKoerper("Bolero")),
  verboten: ["schema", "duplikat"],
});

/* --- Kontext fuer die Event-, Band- und Location-Faelle ------------ */

fall({
  name: "Region als Referenzziel",
  datei: "regionen/testregion.md",
  inhalt: md(
    {
      name: "Testregion Rheinland",
      aliases: "[Rheinland Test]",
      kurzbeschreibung: "Die Testregion Rheinland dient in diesem Harnisch als Referenzziel fuer Locations und Events.",
      status: "entwurf",
      erstelltAm: HEUTE,
      geprueftAm: HEUTE,
      autor: "markus",
      ebene: "metropolregion",
      land: "DE",
    },
    `Die Testregion Rheinland ist eine erfundene Region, die in diesem Testharnisch als Referenzziel dient und sonst keine Bedeutung hat.\n\n## Szene in der Testregion\n\n${fueller(260)}`,
  ),
  verboten: ["schema"],
});

fall({
  name: "Location als Referenzziel",
  datei: "locations/testhalle.md",
  inhalt: md(
    {
      name: "Testhalle Sued",
      aliases: "[Halle Sued]",
      kurzbeschreibung: "Die Testhalle Sued ist eine erfundene Veranstaltungshalle und dient hier als Referenzziel fuer Events.",
      status: "entwurf",
      erstelltAm: HEUTE,
      geprueftAm: HEUTE,
      autor: "markus",
      typ: "halle",
      adresse: "\n  ort: Teststadt\n  land: DE",
      region: "testregion",
      quellen: quelle("adresse"),
    },
    `Die Testhalle Sued ist eine erfundene Halle, die in diesem Testharnisch als Referenzziel fuer Events dient.\n\n## Saal der Testhalle\n\n${fueller(110)}`,
  ),
  verboten: ["schema", "referenzen"],
});

/* ------------------------------------------------------------------ */
/* Struktur / GEO                                                      */
/* ------------------------------------------------------------------ */

fall({
  name: "schema: unbekanntes Feld (strict) wird abgelehnt",
  datei: "lexikon/schema-unbekannt.md",
  inhalt: md(lexFelder("Schemafremdling", { erfundenesFeld: "irgendwas" }), lexKoerper("Schemafremdling")),
  erwartet: { schema: "fehler" },
});

fall({
  name: "schema: fehlendes Pflichtfeld (definition) wird abgelehnt",
  datei: "lexikon/schema-fehlend.md",
  inhalt: md(lexFelder("Schemaluecke", { definition: undefined }), lexKoerper("Schemaluecke")),
  erwartet: { schema: "fehler" },
});

fall({
  name: "kapsel-vorhanden: kein Absatz vor der ersten Ueberschrift",
  datei: "lexikon/kapsel-fehlt.md",
  inhalt: md(lexFelder("Kapselloser"), `## Schnitt von Kapselloser\n\n${fueller(100)}`),
  erwartet: { "kapsel-vorhanden": "fehler" },
});

fall({
  name: "kapsel-vorhanden: Kapsel zu kurz (unter 25 Woertern)",
  datei: "lexikon/kapsel-kurz.md",
  inhalt: md(lexFelder("Kurzkapsel"), `Ein Kurzkapsel ist ein Rock.\n\n## Schnitt von Kurzkapsel\n\n${fueller(100)}`),
  erwartet: { "kapsel-vorhanden": "fehler" },
});

fall({
  name: "kapsel-definitorisch: Einleitungsgeplaenkel ist ein Fehler",
  datei: "lexikon/kapsel-geplaenkel.md",
  inhalt: md(
    lexFelder("Geplaenkel"),
    `In diesem Beitrag schauen wir uns den Geplaenkel einmal in Ruhe an und klaeren, woher er kommt und warum er heute noch getragen wird. ` +
      `Der Geplaenkel ist dabei mehr als nur ein Kleidungsstueck der fuenfziger Jahre.\n\n## Schnitt von Geplaenkel\n\n${fueller(80)}`,
  ),
  erwartet: { "kapsel-definitorisch": "fehler" },
});

fall({
  name: "kapsel-definitorisch: nicht definitorischer Erstsatz warnt nur",
  datei: "lexikon/kapsel-unklar.md",
  inhalt: md(
    lexFelder("Unklarrock"),
    `Den Unklarrock trugen die Taenzerinnen der fuenfziger Jahre bei jeder Gelegenheit und ueberall dort, wo Musik lief. ` +
      `Ein Unklarrock gehoert damit zur Grundausstattung der Szene.\n\n## Schnitt von Unklarrock\n\n${fueller(80)}`,
  ),
  erwartet: { "kapsel-definitorisch": "warnung" },
});

fall({
  name: "ueberschriften: H1 im Fliesstext",
  datei: "lexikon/ueber-h1.md",
  inhalt: md(lexFelder("Einserrock"), `${lexKoerper("Einserrock")}\n\n# Einserrock als Ueberschrift\n\n${fueller(20)}`),
  erwartet: { ueberschriften: "fehler" },
});

fall({
  name: "ueberschriften: Ebenensprung H2 auf H4",
  datei: "lexikon/ueber-sprung.md",
  inhalt: md(lexFelder("Sprungrock"), `${lexKoerper("Sprungrock")}\n\n#### Details von Sprungrock\n\n${fueller(20)}`),
  erwartet: { ueberschriften: "fehler" },
});

fall({
  name: "mindestlaenge: zu kurzer Fliesstext",
  datei: "lexikon/zu-kurz.md",
  inhalt: md(
    lexFelder("Kurzrock"),
    `Ein Kurzrock ist ein Kleidungsstueck der fuenfziger Jahre, das in der Taille anliegt und nach unten weit ausschwingt. ` +
      `Der Kurzrock bleibt hier absichtlich unter der Mindestlaenge.\n\n## Schnitt von Kurzrock\n\nNur wenige Worte stehen hier.`,
  ),
  erwartet: { mindestlaenge: "fehler" },
});

fall({
  name: "platzhalter: TODO im Entwurf warnt",
  datei: "lexikon/platzhalter-entwurf.md",
  inhalt: md(lexFelder("Platzhalterrock"), `${lexKoerper("Platzhalterrock")}\n\nTODO: Quellenlage nachtragen.`),
  erwartet: { platzhalter: "warnung" },
});

fall({
  name: "platzhalter: TODO im veroeffentlichten Eintrag ist ein Fehler",
  datei: "lexikon/platzhalter-live.md",
  inhalt: md(
    lexFelder("Livplatzhalter", { status: "veroeffentlicht" }),
    `${lexKoerper("Livplatzhalter")}\n\nTODO: Quellenlage nachtragen.`,
  ),
  erwartet: { platzhalter: "fehler" },
});

fall({
  name: "reservierter-slug: Dateiname kollidiert mit einem Facettensegment",
  datei: "lexikon/jahr.md",
  inhalt: md(lexFelder("Jahresbegriff"), lexKoerper("Jahresbegriff")),
  erwartet: { "reservierter-slug": "fehler" },
});

/* ------------------------------------------------------------------ */
/* Belege                                                              */
/* ------------------------------------------------------------------ */

fall({
  name: "quellen-vorhanden: keine Quelle im Entwurf warnt",
  datei: "lexikon/ohne-quelle-entwurf.md",
  inhalt: md(lexFelder("Quellenlos", { quellen: "[]" }), lexKoerper("Quellenlos")),
  erwartet: { "quellen-vorhanden": "warnung" },
});

fall({
  name: "quellen-vorhanden: keine Quelle im geprueften Eintrag ist ein Fehler",
  datei: "lexikon/ohne-quelle-geprueft.md",
  inhalt: md(lexFelder("Quellenlosgeprueft", { quellen: "[]", status: "geprueft" }), lexKoerper("Quellenlosgeprueft")),
  erwartet: { "quellen-vorhanden": "fehler" },
});

fall({
  name: "belegpflicht: gesetztes Pflichtfeld ohne Deckung warnt im Entwurf",
  datei: "lexikon/belegluecke-entwurf.md",
  inhalt: md(lexFelder("Beleglueckerock", { herkunftsland: "GB" }), lexKoerper("Beleglueckerock")),
  erwartet: { belegpflicht: "warnung" },
});

fall({
  name: "belegpflicht: dasselbe im veroeffentlichten Eintrag ist ein Fehler",
  datei: "lexikon/belegluecke-live.md",
  inhalt: md(
    lexFelder("Livbelegluecke", { herkunftsland: "GB", status: "veroeffentlicht" }),
    lexKoerper("Livbelegluecke"),
  ),
  erwartet: { belegpflicht: "fehler" },
});

fall({
  name: "belegpflicht: gedecktes Pflichtfeld schlaegt nicht an",
  datei: "lexikon/beleg-gedeckt.md",
  inhalt: md(
    lexFelder("Gedecktrock", { herkunftsland: "GB", quellen: quelle("definition, herkunftsland") }),
    lexKoerper("Gedecktrock"),
  ),
  verboten: ["belegpflicht", "quellen-felder-gueltig"],
});

fall({
  name: 'quellen-felder-gueltig: Sammelwert "alle" ist nicht mehr zulaessig',
  datei: "lexikon/felder-alle.md",
  inhalt: md(lexFelder("Allerock", { quellen: quelle("alle") }), lexKoerper("Allerock")),
  erwartet: { "quellen-felder-gueltig": "warnung" },
});

fall({
  name: "quellen-felder-gueltig: erfundener Feldname wird abgelehnt",
  datei: "lexikon/felder-erfunden.md",
  inhalt: md(lexFelder("Erfundenrock", { quellen: quelle("gibtesnicht") }), lexKoerper("Erfundenrock")),
  erwartet: { "quellen-felder-gueltig": "warnung" },
});

fall({
  name: "quellen-felder-gueltig: im veroeffentlichten Eintrag ist es ein Fehler",
  datei: "lexikon/felder-alle-live.md",
  inhalt: md(
    lexFelder("Livallerock", { quellen: quelle("alle"), status: "veroeffentlicht" }),
    lexKoerper("Livallerock"),
  ),
  erwartet: { "quellen-felder-gueltig": "fehler" },
});

fall({
  name: "quellen-felder-gueltig: body:<abschnitt> ist gueltig",
  datei: "lexikon/felder-body.md",
  inhalt: md(
    lexFelder("Bodyrock", { quellen: quelle("definition, body:geschichte") }),
    lexKoerper("Bodyrock"),
  ),
  verboten: ["quellen-felder-gueltig"],
});

/* ------------------------------------------------------------------ */
/* Referenzen und Verlinkung                                           */
/* ------------------------------------------------------------------ */

fall({
  name: "referenzen: tote Slug-Referenz in verwandt",
  datei: "lexikon/ref-tot.md",
  inhalt: md(lexFelder("Totverweis", { verwandt: "[gibtesnichtimregister]" }), lexKoerper("Totverweis")),
  erwartet: { referenzen: "fehler" },
});

fall({
  name: "referenzen: aufloesende Referenz schlaegt nicht an",
  datei: "lexikon/ref-gut.md",
  inhalt: md(lexFelder("Gutverweis", { verwandt: "[tellerrock]" }), lexKoerper("Gutverweis")),
  verboten: ["referenzen"],
});

fall({
  name: "interne-links: toter interner Link",
  datei: "lexikon/link-tot.md",
  inhalt: md(
    lexFelder("Totlinkrock"),
    `${lexKoerper("Totlinkrock")}\n\nVergleiche den [Nichteintrag](/lexikon/gibtesnichtimregister/).`,
  ),
  erwartet: { "interne-links": "fehler" },
});

fall({
  name: "interne-links: zwei aufloesende Links schlagen nicht an",
  datei: "lexikon/link-gut.md",
  inhalt: md(
    lexFelder("Gutlinkrock"),
    `${lexKoerper("Gutlinkrock")}\n\nVergleiche den [Tellerrock](/lexikon/tellerrock/) und den [Bolero](/lexikon/bolero/).`,
  ),
  verboten: ["interne-links"],
});

/* --- link-auf-entwurf (seit 2026-09-23) --------------------------- */
/*
 * Ein freigegebener Eintrag, der im Fliesstext auf einen Entwurf verlinkt,
 * zeigt in der Produktion ins Leere: Entwuerfe werden dort nicht gebaut.
 * `interne-links` sieht es nicht, weil es gegen den Bestand prueft. Am
 * 2026-09-23 standen so zwanzig Links auf einen Entwurf, und alles war gruen.
 *
 * Die vier Faelle sind so gewaehlt, dass jede Bedingung der Regel einzeln
 * einen Gegenstand hat: Status der Quelle, Status des Ziels, Existenz des
 * Ziels.
 */
const LIVE = ["veroeffent", "licht"].join("");

fall({
  name: "link-auf-entwurf: freigegebenes Ziel fuer die Gegenprobe",
  datei: "lexikon/freiziel.md",
  inhalt: md(lexFelder("Freizielrock", { status: LIVE }), lexKoerper("Freizielrock")),
  verboten: ["schema", "link-auf-entwurf"],
});

fall({
  name: "link-auf-entwurf: freigegeben verlinkt auf Entwurf schlaegt an",
  datei: "lexikon/frei-auf-entwurf.md",
  inhalt: md(
    lexFelder("Freilinkrock", { status: LIVE }),
    `${lexKoerper("Freilinkrock")}\n\nVergleiche den [Tellerrock](/lexikon/tellerrock/) und den [Freizielrock](/lexikon/freiziel/).`,
  ),
  erwartet: { "link-auf-entwurf": "fehler" },
  // Der Link auf `tellerrock` loest im Bestand auf — `interne-links` darf
  // hier NICHT anschlagen. Genau das war die Luecke.
  verboten: ["interne-links"],
});

fall({
  name: "link-auf-entwurf: freigegeben verlinkt nur auf Freigegebenes schweigt",
  datei: "lexikon/frei-auf-frei.md",
  inhalt: md(
    lexFelder("Freifreirock", { status: LIVE }),
    `${lexKoerper("Freifreirock")}\n\nVergleiche den [Freizielrock](/lexikon/freiziel/) und den [Freilinkrock](/lexikon/frei-auf-entwurf/).`,
  ),
  verboten: ["link-auf-entwurf"],
});

fall({
  name: "link-auf-entwurf: ein Entwurf darf auf einen Entwurf zeigen",
  datei: "lexikon/entwurf-auf-entwurf.md",
  inhalt: md(
    lexFelder("Entwurflinkrock"),
    `${lexKoerper("Entwurflinkrock")}\n\nVergleiche den [Tellerrock](/lexikon/tellerrock/) und den [Bolero](/lexikon/bolero/).`,
  ),
  verboten: ["link-auf-entwurf"],
});

fall({
  name: "link-auf-entwurf: ein toter Link wird nicht doppelt gemeldet",
  datei: "lexikon/frei-tot.md",
  inhalt: md(
    lexFelder("Freitotrock", { status: LIVE }),
    `${lexKoerper("Freitotrock")}\n\nVergleiche den [Nichteintrag](/lexikon/gibtesnichtimregister/) und den [Freizielrock](/lexikon/freiziel/).`,
  ),
  erwartet: { "interne-links": "fehler" },
  verboten: ["link-auf-entwurf"],
});

/* ------------------------------------------------------------------ */
/* Duplikate (globale Pruefung)                                        */
/* ------------------------------------------------------------------ */

fall({
  name: "duplikat: zwei Eintraege mit gleichem Namen kollidieren (a)",
  datei: "lexikon/dublette-a.md",
  inhalt: md(lexFelder("Zwillingsrock", { aliases: "[]" }), lexKoerper("Zwillingsrock")),
  erwartet: { duplikat: "fehler" },
});

fall({
  name: "duplikat: zwei Eintraege mit gleichem Namen kollidieren (b)",
  datei: "lexikon/dublette-b.md",
  inhalt: md(lexFelder("Zwillingsrock", { aliases: "[]" }), lexKoerper("Zwillingsrock")),
  erwartet: { duplikat: "fehler" },
});

/* ------------------------------------------------------------------ */
/* Fachliche Konsistenz: Events                                        */
/* ------------------------------------------------------------------ */

const evFelder = (name: string, ueber: Record<string, string | undefined> = {}) => ({
  name,
  aliases: `[${name} Kurz]`,
  kurzbeschreibung: `${name} ist eine erfundene Veranstaltung, die in diesem Testharnisch die Eventregeln ausloest.`,
  status: "entwurf",
  erstelltAm: HEUTE,
  geprueftAm: HEUTE,
  autor: "markus",
  typ: "weekender",
  beginn: inTagen(60),
  ort: "testhalle",
  region: "testregion",
  eintritt: "frei",
  quellen: quelle("beginn, ort"),
  ...ueber,
});

const evKoerper = (name: string) =>
  `${name} ist ein erfundener Weekender, der in diesem Testharnisch die Regeln zu Zeitraum, Reihe und Preisen ausloest. ` +
  `Die Veranstaltung existiert nicht und dient ausschliesslich der Pruefung des Validators.\n\n` +
  `## Programm von ${name}\n\n${fueller(190)}`;

fall({
  name: "event-zeitraum: Ende liegt vor Beginn",
  datei: "events/zeit-verdreht.md",
  inhalt: md(evFelder("Verdrehter Weekender", { beginn: inTagen(60), ende: inTagen(58) }), evKoerper("Verdrehter Weekender")),
  erwartet: { "event-zeitraum": "fehler" },
});

fall({
  name: 'event-zeitraum: Termin vorbei, Status noch "geplant"',
  datei: "events/zeit-vergangen.md",
  inhalt: md(
    evFelder("Vergangener Weekender", { beginn: vorTagen(30), durchfuehrung: "geplant" }),
    evKoerper("Vergangener Weekender"),
  ),
  erwartet: { "event-zeitraum": "fehler" },
});

fall({
  name: 'event-zeitraum: Status "stattgefunden" bei kuenftigem Termin',
  datei: "events/zeit-vorgegriffen.md",
  inhalt: md(
    evFelder("Vorgegriffener Weekender", { beginn: inTagen(60), durchfuehrung: "stattgefunden" }),
    evKoerper("Vorgegriffener Weekender"),
  ),
  erwartet: { "event-zeitraum": "fehler" },
});

fall({
  name: "event-zeitraum: abgesagt ohne Begruendung warnt",
  datei: "events/zeit-abgesagt.md",
  inhalt: md(
    evFelder("Abgesagter Weekender", { durchfuehrung: "abgesagt", quellen: quelle("beginn, ort, durchfuehrung") }),
    evKoerper("Abgesagter Weekender"),
  ),
  erwartet: { "event-zeitraum": "warnung" },
});

fall({
  name: "event-zeitraum: kuenftiger Termin mit Status geplant ist sauber",
  datei: "events/zeit-gut.md",
  inhalt: md(evFelder("Sauberer Weekender"), evKoerper("Sauberer Weekender")),
  verboten: ["event-zeitraum", "reihe-name", "event-preise", "referenzen"],
});

/* --- Befund M9: der Tagesrand ----------------------------------------
 * Der alte Vergleich war `new Date(ende ?? beginn) < jetzt`. Weil
 * `z.coerce.date()` aus einem Datum ohne Uhrzeit Mitternacht UTC macht, galt
 * ein Termin von heute ab 00:01 UTC als vergangen — der Validator verlangte
 * "stattgefunden" fuer einen Termin, der erst abends stattfand. Diese vier
 * Faelle halten beide Richtungen der Regel am scharfen Rand fest.
 */

fall({
  name: "event-zeitraum (M9): Termin heute ohne Uhrzeit ist NICHT vorbei",
  datei: "events/zeit-heute.md",
  inhalt: md(
    evFelder("Heutiger Weekender", { beginn: HEUTE, durchfuehrung: "geplant" }),
    evKoerper("Heutiger Weekender"),
  ),
  verboten: ["event-zeitraum"],
});

fall({
  name: 'event-zeitraum (M9): Termin heute mit Status "stattgefunden" ist verfrueht',
  datei: "events/zeit-heute-vorgegriffen.md",
  inhalt: md(
    evFelder("Vorgegriffener Heutiger", { beginn: HEUTE, durchfuehrung: "stattgefunden" }),
    evKoerper("Vorgegriffener Heutiger"),
  ),
  erwartet: { "event-zeitraum": "fehler" },
});

fall({
  name: "event-zeitraum (M9): Termin gestern ist vorbei",
  datei: "events/zeit-gestern.md",
  inhalt: md(
    evFelder("Gestriger Weekender", { beginn: vorTagen(1), durchfuehrung: "geplant" }),
    evKoerper("Gestriger Weekender"),
  ),
  erwartet: { "event-zeitraum": "fehler" },
});

fall({
  name: "event-zeitraum (M9): laufendes Festival endet heute und ist nicht vorbei",
  datei: "events/zeit-laufend.md",
  inhalt: md(
    evFelder("Laufender Weekender", { beginn: vorTagen(2), ende: HEUTE, durchfuehrung: "geplant" }),
    evKoerper("Laufender Weekender"),
  ),
  verboten: ["event-zeitraum"],
});

/* --- Die drei Preiszustaende --------------------------------------------
 * `eintritt` unterscheidet frei, beziffert und unveroeffentlicht. Jeder
 * Zustand bekommt einen sauberen Fall und seinen Widerspruch; der dritte
 * zusaetzlich den Fall ohne Quellenbeleg, der anschlagen MUSS -- sonst
 * waere "die Quelle schweigt" eine Behauptung, die niemand pruefen kann.
 */

const PREIS = "\n  - bezeichnung: Tageskasse\n    betrag: 20\n    waehrung: EUR";

fall({
  name: "event-preise: eintritt frei ist sauber",
  datei: "events/preis-frei.md",
  inhalt: md(evFelder("Freier Weekender"), evKoerper("Freier Weekender")),
  verboten: ["event-preise"],
});

fall({
  name: "event-preise: eintritt frei zusammen mit Preisen",
  datei: "events/preis-widerspruch.md",
  inhalt: md(
    evFelder("Widerspruechlicher Weekender", {
      eintritt: "frei",
      preise: PREIS,
      quellen: quelle("beginn, ort, preise"),
    }),
    evKoerper("Widerspruechlicher Weekender"),
  ),
  erwartet: { "event-preise": "fehler" },
});

fall({
  name: "event-preise: eintritt beziffert mit Preisen ist sauber",
  datei: "events/preis-beziffert.md",
  inhalt: md(
    evFelder("Bezifferter Weekender", {
      eintritt: "beziffert",
      preise: PREIS,
      quellen: quelle("beginn, ort, preise"),
    }),
    evKoerper("Bezifferter Weekender"),
  ),
  verboten: ["event-preise"],
});

fall({
  name: "event-preise: eintritt beziffert ohne Preise",
  datei: "events/preis-beziffert-leer.md",
  inhalt: md(
    evFelder("Leerer Bezifferter", { eintritt: "beziffert", quellen: quelle("beginn, ort, preise") }),
    evKoerper("Leerer Bezifferter"),
  ),
  erwartet: { "event-preise": "fehler" },
});

fall({
  name: "event-preise: unveroeffentlicht mit Quellenbeleg auf eintritt ist sauber",
  datei: "events/preis-unbekannt-belegt.md",
  inhalt: md(
    evFelder("Belegter Schweiger", {
      eintritt: "unveroeffentlicht",
      quellen: quelle("beginn, ort, eintritt"),
    }),
    evKoerper("Belegter Schweiger"),
  ),
  verboten: ["event-preise"],
});

fall({
  name: "event-preise: unveroeffentlicht mit Quellenbeleg auf preise ist ebenfalls sauber",
  datei: "events/preis-unbekannt-belegt-preise.md",
  inhalt: md(
    evFelder("Zweiter Belegter Schweiger", {
      eintritt: "unveroeffentlicht",
      quellen: quelle("beginn, ort, preise"),
    }),
    evKoerper("Zweiter Belegter Schweiger"),
  ),
  verboten: ["event-preise"],
});

fall({
  name: "event-preise: unveroeffentlicht OHNE Quellenbeleg schlaegt an (Entwurf)",
  datei: "events/preis-unbekannt-unbelegt.md",
  inhalt: md(
    evFelder("Unbelegter Schweiger", {
      eintritt: "unveroeffentlicht",
      quellen: quelle("beginn, ort"),
    }),
    evKoerper("Unbelegter Schweiger"),
  ),
  erwartet: { "event-preise": "warnung" },
});

fall({
  name: "event-preise: unveroeffentlicht OHNE Quellenbeleg ist bei veroeffentlicht ein Fehler",
  datei: "events/preis-unbekannt-unbelegt-live.md",
  inhalt: md(
    evFelder("Unbelegter Schweiger Live", {
      status: ["veroeffent", "licht"].join(""),
      eintritt: "unveroeffentlicht",
      quellen: quelle("beginn, ort"),
    }),
    evKoerper("Unbelegter Schweiger Live"),
  ),
  erwartet: { "event-preise": "fehler" },
});

fall({
  name: "event-preise: unveroeffentlicht zusammen mit Preisen",
  datei: "events/preis-unbekannt-widerspruch.md",
  inhalt: md(
    evFelder("Widerspruechlicher Schweiger", {
      eintritt: "unveroeffentlicht",
      preise: PREIS,
      quellen: quelle("beginn, ort, preise"),
    }),
    evKoerper("Widerspruechlicher Schweiger"),
  ),
  erwartet: { "event-preise": "fehler" },
});

fall({
  name: "reihe-name: reihe ohne reiheName",
  datei: "events/reihe-ohne-namen.md",
  inhalt: md(evFelder("Reihenloser Weekender", { reihe: "testreihe" }), evKoerper("Reihenloser Weekender")),
  erwartet: { "reihe-name": "fehler" },
});

fall({
  name: "reihe-name: reiheName ohne reihe warnt",
  datei: "events/reihe-nur-name.md",
  inhalt: md(evFelder("Namensreihe Weekender", { reiheName: "Die Testreihe" }), evKoerper("Namensreihe Weekender")),
  erwartet: { "reihe-name": "warnung" },
});

fall({
  name: "reihe-name: reihe und reiheName gemeinsam sind sauber",
  datei: "events/reihe-gut.md",
  inhalt: md(
    evFelder("Vollstaendige Reihe Weekender", { reihe: "testreihe", reiheName: "Die Testreihe" }),
    evKoerper("Vollstaendige Reihe Weekender"),
  ),
  verboten: ["reihe-name"],
});

/* ------------------------------------------------------------------ */
/* Fachliche Konsistenz: Bands                                         */
/* ------------------------------------------------------------------ */

const bandFelder = (name: string, ueber: Record<string, string | undefined> = {}) => ({
  name,
  aliases: `[${name} Kurz]`,
  kurzbeschreibung: `${name} ist eine erfundene Band, die in diesem Testharnisch die Regel zu Gruendungs- und Aufloesungsjahren ausloest.`,
  status: "entwurf",
  erstelltAm: HEUTE,
  geprueftAm: HEUTE,
  autor: "markus",
  herkunftLand: "DE",
  genres: "[tellerrock]",
  quellen: quelle("gegruendet, aufgeloest"),
  ...ueber,
});

const bandKoerper = (name: string) =>
  `${name} ist eine erfundene Band, die in diesem Testharnisch die Pruefung der Jahreszahlen ausloest. ` +
  `Die Gruppe existiert nicht und steht hier nur als Fixture.\n\n## Besetzung von ${name}\n\n${fueller(160)}`;

fall({
  name: "band-jahre: Aufloesung liegt vor Gruendung",
  datei: "bands/jahre-verdreht.md",
  inhalt: md(bandFelder("Die Verdrehten", { gegruendet: "1990", aufgeloest: "1985", aktiv: "false" }), bandKoerper("Die Verdrehten")),
  erwartet: { "band-jahre": "fehler" },
});

fall({
  name: "band-jahre: aufgeloest trotz aktiv: true",
  datei: "bands/jahre-widerspruch.md",
  inhalt: md(bandFelder("Die Widerspruechlichen", { gegruendet: "1985", aufgeloest: "1990", aktiv: "true" }), bandKoerper("Die Widerspruechlichen")),
  erwartet: { "band-jahre": "fehler" },
});

fall({
  name: "band-jahre: plausible Jahre sind sauber",
  datei: "bands/jahre-gut.md",
  inhalt: md(bandFelder("Die Plausiblen", { gegruendet: "1985", aufgeloest: "1990", aktiv: "false" }), bandKoerper("Die Plausiblen")),
  verboten: ["band-jahre", "referenzen"],
});

/* --- Die Schema-Untergrenze festnageln ---------------------------------
 *
 * Am 2026-09-11 von 1930 auf 1900 gesenkt. Es gibt null Bandeintraege, also
 * kann kein Lauf gegen echte Daten zeigen, ob die Zahl stimmt -- `npm run
 * verify` bliebe gruen, egal was dort steht. Diese vier Faelle sind das
 * einzige, was die Grenze haelt: Ohne sie dreht sie jemand in einem Jahr
 * stillschweigend zurueck.
 *
 * Anlass war ein konkreter Fall aus dem eigenen Bestand: Der
 * Boogie-Woogie-Eintrag nennt Pinetop Smith, dessen "Pinetop's Boogie
 * Woogie" von 1928 stammt. Unter min(1930) liess sich dieses Jahr nicht
 * eintragen.
 */

fall({
  name: "Schema-Untergrenze: gegruendet 1900 geht durch",
  datei: "bands/grenze-gegruendet-gut.md",
  inhalt: md(bandFelder("Die Jahrhundertwende", { gegruendet: "1900" }), bandKoerper("Die Jahrhundertwende")),
  verboten: ["schema"],
});

fall({
  name: "Schema-Untergrenze: gegruendet 1899 faellt",
  datei: "bands/grenze-gegruendet-schlecht.md",
  inhalt: md(bandFelder("Die Zufruehen", { gegruendet: "1899" }), bandKoerper("Die Zufruehen")),
  erwartet: { schema: "fehler" },
});

/*
 * `aufgeloest` ohne `gegruendet` und mit `aktiv: false` -- sonst traefe
 * zusaetzlich "Aufloesung liegt vor Gruendung" oder "aufgeloest trotz
 * aktiv", und ein Ergebnis mit zwei moeglichen Ursachen belegt keine von
 * beiden (Lektion 17).
 */
fall({
  name: "Schema-Untergrenze: aufgeloest 1899 faellt",
  datei: "bands/grenze-aufgeloest-schlecht.md",
  inhalt: md(bandFelder("Die Frueh Getrennten", { aufgeloest: "1899", aktiv: "false" }), bandKoerper("Die Frueh Getrennten")),
  erwartet: { schema: "fehler" },
});

fall({
  name: "Schema-Untergrenze: Veroeffentlichung 1899 faellt",
  datei: "bands/grenze-jahr-schlecht.md",
  inhalt: md(
    bandFelder("Die Fruehpresser", {
      gegruendet: "1900",
      quellen: quelle("gegruendet, veroeffentlichungen"),
      veroeffentlichungen: "\n  - titel: Zu frueh gepresst\n    jahr: 1899\n    art: single",
    }),
    bandKoerper("Die Fruehpresser"),
  ),
  erwartet: { schema: "fehler" },
});

/* --- band-jahre: Zukunft und Veroeffentlichung vor der Gruendung ------- */

fall({
  name: "band-jahre: Veroeffentlichung liegt vor der Gruendung",
  datei: "bands/jahre-platte-zu-frueh.md",
  inhalt: md(
    bandFelder("Die Vorgreifer", {
      gegruendet: "1980",
      quellen: quelle("gegruendet, veroeffentlichungen"),
      veroeffentlichungen: "\n  - titel: Aus der Tracklist abgeschrieben\n    jahr: 1955\n    art: album",
    }),
    bandKoerper("Die Vorgreifer"),
  ),
  erwartet: { "band-jahre": "fehler" },
});

fall({
  name: "band-jahre: Gruendung liegt hinter dem Folgejahr",
  datei: "bands/jahre-gruendung-zukunft.md",
  inhalt: md(bandFelder("Die Uebermorgigen", { gegruendet: String(JAHR + 2) }), bandKoerper("Die Uebermorgigen")),
  erwartet: { "band-jahre": "fehler" },
});

fall({
  name: "band-jahre: Veroeffentlichung liegt hinter dem Folgejahr",
  datei: "bands/jahre-platte-zukunft.md",
  inhalt: md(
    bandFelder("Die Vorbesteller", {
      gegruendet: "1980",
      quellen: quelle("gegruendet, veroeffentlichungen"),
      veroeffentlichungen: `\n  - titel: Angekuendigt fuers Uebermorgen\n    jahr: ${JAHR + 2}\n    art: album`,
    }),
    bandKoerper("Die Vorbesteller"),
  ),
  erwartet: { "band-jahre": "fehler" },
});

/*
 * Die Gegenrichtung, und sie ist hier die eigentliche Aussage: Das
 * FOLGEJAHR ist erlaubt. Ohne diesen Fall waere "Zukunft wird gemeldet"
 * auch mit einer Regel vereinbar, die jedes kommende Jahr verwirft -- und
 * eine angekuendigte Band oder ein vorbestellbares Album waere nicht
 * eintragbar.
 */
fall({
  name: "band-jahre: Gruendung im Folgejahr ist erlaubt",
  datei: "bands/jahre-gruendung-folgejahr.md",
  inhalt: md(bandFelder("Die Angekuendigten", { gegruendet: String(JAHR + 1) }), bandKoerper("Die Angekuendigten")),
  verboten: ["band-jahre"],
});

/*
 * Die bewusst NICHT gebaute Regel, als Fall festgehalten: Eine
 * Veroeffentlichung nach der Aufloesung ist kein Fehler. Compilations und
 * Live-Mitschnitte erscheinen regelmaessig danach. Faellt dieser Fall
 * eines Tages, hat jemand die Regel doch gebaut -- und soll die Begruendung
 * in ENTSCHEIDUNGEN.md dagegen halten muessen.
 */
fall({
  name: "band-jahre: Veroeffentlichung nach der Aufloesung ist kein Fehler",
  datei: "bands/jahre-platte-posthum.md",
  inhalt: md(
    bandFelder("Die Nachgelassenen", {
      gegruendet: "1980",
      aufgeloest: "1990",
      aktiv: "false",
      quellen: quelle("gegruendet, aufgeloest, veroeffentlichungen"),
      veroeffentlichungen: "\n  - titel: Das Beste, lange danach\n    jahr: 2005\n    art: compilation",
    }),
    bandKoerper("Die Nachgelassenen"),
  ),
  verboten: ["band-jahre"],
});

/* ------------------------------------------------------------------ */
/* Lexikon: Grounding-Page-Bausteine                                   */
/* ------------------------------------------------------------------ */

fall({
  name: "gp-erstsatz-nennt-begriff: erster Satz nennt den Begriff nicht",
  datei: "lexikon/gp-erstsatz.md",
  inhalt: md(
    lexFelder("Namenloserstsatz", { aliases: "[]" }),
    `Dieses Kleidungsstueck ist ein weit ausgestellter Rock der fuenfziger Jahre, der in der Taille anliegt und nach unten schwingt. ` +
      `Getragen wurde er zu Tanzveranstaltungen und im Alltag.\n\n## Schnitt von Namenloserstsatz\n\n${fueller(80)}`,
  ),
  erwartet: { "gp-erstsatz-nennt-begriff": "fehler" },
});

fall({
  name: "gp-lead: Lead mit nur einem Satz warnt",
  datei: "lexikon/gp-lead-kurz.md",
  inhalt: md(
    lexFelder("Einsatzrock"),
    `Ein Einsatzrock ist ein in der Taille anliegender und nach unten weit ausgestellter Rock der fuenfziger Jahre, der in der Szene bis heute getragen wird.\n\n` +
      `## Schnitt von Einsatzrock\n\n${fueller(80)}`,
  ),
  erwartet: { "gp-lead": "warnung" },
});

fall({
  name: "gp-h2-nennt-begriff: H2 ohne Begriffsnamen warnt im Entwurf",
  datei: "lexikon/gp-h2-entwurf.md",
  inhalt: md(
    lexFelder("Namenloseszwei", { aliases: "[]" }),
    `Ein Namenloseszwei ist ein weit ausgestellter Rock der fuenfziger Jahre, der in der Taille anliegt. ` +
      `In der Szene gilt er bis heute als gebraeuchlich und wird oft getragen.\n\n## Merkmale\n\n${fueller(80)}`,
  ),
  erwartet: { "gp-h2-nennt-begriff": "warnung" },
});

fall({
  name: "gp-h2-nennt-begriff: dasselbe im veroeffentlichten Eintrag ist ein Fehler",
  datei: "lexikon/gp-h2-live.md",
  inhalt: md(
    lexFelder("Livnamenloszwei", { aliases: "[]", status: "veroeffentlicht" }),
    `Ein Livnamenloszwei ist ein weit ausgestellter Rock der fuenfziger Jahre, der in der Taille anliegt. ` +
      `In der Szene gilt er bis heute als gebraeuchlich und wird oft getragen.\n\n## Merkmale\n\n${fueller(80)}`,
  ),
  erwartet: { "gp-h2-nennt-begriff": "fehler" },
});

fall({
  name: "gp-abgrenzung: fehlende Abgrenzung warnt im Entwurf",
  datei: "lexikon/gp-abgrenzung-entwurf.md",
  inhalt: md(lexFelder("Abgrenzungslos", { abgrenzung: undefined }), lexKoerper("Abgrenzungslos")),
  erwartet: { "gp-abgrenzung": "warnung" },
});

fall({
  name: "gp-abgrenzung: fehlende Abgrenzung im veroeffentlichten Eintrag ist ein Fehler",
  datei: "lexikon/gp-abgrenzung-live.md",
  inhalt: md(
    lexFelder("Livabgrenzungslos", { abgrenzung: undefined, status: "veroeffentlicht" }),
    lexKoerper("Livabgrenzungslos"),
  ),
  erwartet: { "gp-abgrenzung": "fehler" },
});

fall({
  name: "lexikon-definition: nicht definitorische definition warnt",
  datei: "lexikon/def-unklar.md",
  inhalt: md(
    lexFelder("Defunklarrock", { definition: "Ein weit ausgestelltes Kleidungsstueck der fuenfziger Jahre mit anliegender Taille." }),
    lexKoerper("Defunklarrock"),
  ),
  erwartet: { "lexikon-definition": "warnung" },
});

fall({
  name: "lexikon-definition: definition ohne Schlusspunkt warnt",
  datei: "lexikon/def-ohne-punkt.md",
  inhalt: md(
    lexFelder("Defpunktrock", { definition: "Ein Defpunktrock ist ein weit ausgestellter Rock der fuenfziger Jahre" }),
    lexKoerper("Defpunktrock"),
  ),
  erwartet: { "lexikon-definition": "warnung" },
});

/* --- lexikon-schreibvarianten -------------------------------------- */
/*
 * Drei Faelle, weil die Regel drei Behauptungen aufstellt: Sie findet eine
 * ungedeckte Trennzeichen-Variante, sie schweigt bei einer gedeckten, und sie
 * schweigt bei einem Treffer mit weniger Bestandteilen als der Begriff. Die
 * dritte war der einzige Fehlalarm der Messung ueber den Bestand
 * ("Pork Pie Hat" auf "Porkpie hat") und ist deshalb hier festgenagelt.
 */

fall({
  name: "lexikon-schreibvarianten: ungedeckte Bindestrichschreibung gibt einen Hinweis",
  datei: "lexikon/variante-offen.md",
  inhalt: md(
    lexFelder("Schwof Tanz", { aliases: "[]" }),
    lexKoerper("Schwof Tanz") +
      `\n\nGeschrieben wird der Schwof-Tanz in der Szene auch mit Bindestrich, und genau darum geht es hier.`,
  ),
  erwartet: { "lexikon-schreibvarianten": "hinweis" },
});

fall({
  name: "lexikon-schreibvarianten: dieselbe Schreibung als Alias schweigt",
  datei: "lexikon/variante-gedeckt.md",
  inhalt: md(
    lexFelder("Boogie Schritt", { aliases: "[Boogie-Schritt]" }),
    lexKoerper("Boogie Schritt") +
      `\n\nGeschrieben wird der Boogie-Schritt in der Szene auch mit Bindestrich, und dieser Eintrag fuehrt ihn als Alias.`,
  ),
  verboten: ["lexikon-schreibvarianten"],
});

fall({
  /*
   * Nachbau des echten Fehlalarms: pork-pie.md fuehrt bezeichnungEn
   * "Pork pie hat" -- kleines "hat" am Ende. Waeren die Trennzeichen
   * optional, matchte das Muster auf "Porkpie hat" im deutschen Satz, also
   * auf ein Hilfsverb. Die Schreibung der Bestandteile muss hier deshalb
   * kleingeschrieben sein wie im Original, sonst prueft der Fall nur die
   * Gross-/Kleinschreibung und nicht die Zahl der Bestandteile.
   */
  name: "lexikon-schreibvarianten: Treffer mit weniger Bestandteilen ist kein Fehlalarm",
  datei: "lexikon/variante-hilfsverb.md",
  inhalt: md(
    lexFelder("Zwirbelhut", { aliases: "[]", bezeichnungEn: "Zwirbel rock hat" }),
    lexKoerper("Zwirbelhut") +
      `\n\nDer Zwirbelrock hat einen schmalen Saum, und das ist keine Schreibvariante.`,
  ),
  verboten: ["lexikon-schreibvarianten"],
});

/* ------------------------------------------------------------------ */
/* Bilder und Lebenszyklus                                             */
/* ------------------------------------------------------------------ */

const bild = (rechte: string, alt: string, nachweis?: string) =>
  `\n  - src: /bilder/test.jpg\n    alt: ${alt}\n    urheber: Testfotograf\n    rechte: ${rechte}` +
  (nachweis ? `\n    rechteNachweis: ${nachweis}` : "");

fall({
  name: "bildrechte: lizenziertes Bild ohne rechteNachweis",
  datei: "lexikon/bild-ohne-nachweis.md",
  inhalt: md(
    lexFelder("Bildrechtlos", { bilder: bild("lizenziert", "Ein Tellerrock auf einem Buegel im Studio") }),
    lexKoerper("Bildrechtlos"),
  ),
  erwartet: { bildrechte: "fehler" },
});

fall({
  name: "bildrechte: zu duenner Alt-Text warnt",
  datei: "lexikon/bild-alt-duenn.md",
  inhalt: md(
    lexFelder("Bildaltduenn", { bilder: bild("eigenes-werk", "Ein Rock hier") }),
    lexKoerper("Bildaltduenn"),
  ),
  erwartet: { bildrechte: "warnung" },
});

fall({
  name: "bildrechte: eigenes Werk mit tragfaehigem Alt-Text ist sauber",
  datei: "lexikon/bild-gut.md",
  inhalt: md(
    lexFelder("Bildgutrock", { bilder: bild("eigenes-werk", "Ein Bildgutrock auf einem Buegel im Studio") }),
    lexKoerper("Bildgutrock"),
  ),
  verboten: ["bildrechte"],
});

fall({
  name: "veroeffentlichungsreife: veroeffentlicht ohne Autor",
  datei: "lexikon/reife-ohne-autor.md",
  inhalt: md(
    lexFelder("Autorlosrock", { status: "veroeffentlicht", autor: undefined }),
    lexKoerper("Autorlosrock"),
  ),
  erwartet: { veroeffentlichungsreife: "fehler" },
});

/*
 * HINWEIS, nicht Warnung -- und das ist die Aussage, an der die Freigabe
 * haengt. Als Warnung war der Befund unter `--strict` ein Blocker; neun von
 * zehn Lexikoneintraegen gingen durch, der zehnte hing daran, weil aus ihm
 * zwei unbelegbare Aliases ENTFERNT worden waren. Nicht jeder Begriff hat
 * eine gebraeuchliche Zweitbezeichnung, und eine Pflicht, die sich nicht
 * erfuellen laesst, erzeugt erfundene Aliases.
 *
 * Der Befund bleibt: Er ist eine nuetzliche Auskunft. Nur blockiert er nicht
 * mehr. Dass `--strict` ihn wirklich durchlaesst, prueft der eigene Lauf am
 * Ende dieser Datei -- die Ebene hier allein sagt darueber nichts.
 */
fall({
  name: "veroeffentlichungsreife: veroeffentlicht ohne aliases ist nur ein Hinweis",
  datei: "lexikon/reife-ohne-aliases.md",
  inhalt: md(
    lexFelder("Aliaslosrock", { status: "veroeffentlicht", aliases: "[]" }),
    lexKoerper("Aliaslosrock"),
  ),
  erwartet: { veroeffentlichungsreife: "hinweis" },
});

/*
 * Fuer den `--strict`-Lauf am Ende der Datei: ausser dem aliases-Hinweis
 * vollstaendig sauber, inklusive der zwei internen Links, die
 * `interne-links` verlangt. Ohne sie truebe eine zweite, echte Warnung den
 * Exitcode, und der Lauf misst nicht mehr, was er messen soll.
 */
// BIS ZUM 2026-09-23 verlinkte dieser freigegebene Eintrag auf `tellerrock`
// und `bolero` — beide hier Entwuerfe. Er galt als "sauber bis auf den
// Hinweis", weil nichts pruefte, dass ein freigegebener Eintrag nicht auf
// einen Entwurf zeigen darf. Die Regel `link-auf-entwurf` hat ihn beim
// ersten Lauf gemeldet: Die Vorrichtung trug genau den Zustand, den die neue
// Regel verbietet. Jetzt zeigt er auf zwei freigegebene Ziele.
fall({
  name: "veroeffentlichungsreife: sonst sauberer Eintrag, nur ohne aliases",
  datei: "lexikon/reife-nur-hinweis.md",
  inhalt: md(
    lexFelder("Nurhinweisrock", { status: "veroeffentlicht", aliases: "[]" }),
    `Ein Nurhinweisrock ist ein Kleidungsstueck aus der Mode der fuenfziger Jahre, das in der Taille eng anliegt und nach unten weit ausschwingt. ` +
      `In der Vintage- und Rockabilly-Szene gilt der Nurhinweisrock bis heute als feste Groesse, weil er die Silhouette der Zeit ohne Hilfsmittel traegt.\n\n` +
      `## Schnitt von Nurhinweisrock\n\nVerwandt sind der [Freizielrock](/lexikon/freiziel/) und der [Reifgutrock](/lexikon/reife-gut/). ${fueller(80)}`,
  ),
  erwartet: { veroeffentlichungsreife: "hinweis" },
  verboten: ["interne-links", "pruefkadenz", "quellen-vorhanden", "gp-abgrenzung"],
});

fall({
  name: "veroeffentlichungsreife: vollstaendiger veroeffentlichter Eintrag ist sauber",
  datei: "lexikon/reife-gut.md",
  inhalt: md(lexFelder("Reifgutrock", { status: "veroeffentlicht" }), lexKoerper("Reifgutrock")),
  verboten: ["veroeffentlichungsreife", "gp-abgrenzung", "gp-h2-nennt-begriff", "platzhalter"],
});

fall({
  name: "pruefkadenz: Kadenz einfach ueberschritten warnt",
  datei: "lexikon/kadenz-warnung.md",
  inhalt: md(lexFelder("Kadenzwarnrock", { geprueftAm: vorTagen(400) }), lexKoerper("Kadenzwarnrock")),
  erwartet: { pruefkadenz: "warnung" },
});

fall({
  name: "pruefkadenz: Kadenz doppelt ueberschritten ist ein Fehler",
  datei: "lexikon/kadenz-fehler.md",
  inhalt: md(lexFelder("Kadenzfehlrock", { geprueftAm: vorTagen(800) }), lexKoerper("Kadenzfehlrock")),
  erwartet: { pruefkadenz: "fehler" },
});

/* ------------------------------------------------------------------ */
/* Die Grenze, die auchOhneSchema zieht                                */
/* ------------------------------------------------------------------ */
/*
 * Scheitert das Zod-Schema, laufen nur noch die Regeln mit
 * `auchOhneSchema: true` — alle anderen lesen `e.daten` und wuerden auf null
 * laufen. Das ist Absicht, hat aber eine Reichweite, die man kennen muss:
 * Ein einziges unbekanntes Feld nimmt einem Eintrag die halbe Pruefung.
 * Derselbe Eintrag, einmal mit und einmal ohne Schemafehler, macht die
 * Grenze sichtbar und faellt auf, wenn jemand ein Flag umstellt.
 */

const luecke = (name: string, ueber: Record<string, string | undefined> = {}) =>
  md(
    lexFelder(name, {
      aliases: "[]",
      status: "veroeffentlicht",
      abgrenzung: undefined,
      quellen: "[]",
      herkunftsland: "GB",
      verwandt: "[gibtesnichtimregister]",
      ...ueber,
    }),
    `Ein ${name} ist ein weit ausgestellter Rock der fuenfziger Jahre, der in der Taille anliegt. ` +
      `In der Szene gilt er bis heute als gebraeuchlich.\n\n## Merkmale\n\n${fueller(80)}`,
  );

fall({
  name: "auchOhneSchema: bei gueltigem Schema greifen die datenabhaengigen Regeln",
  datei: "lexikon/grenze-ohne-schemafehler.md",
  inhalt: luecke("Grenzeohnefehler"),
  erwartet: {
    "quellen-vorhanden": "fehler",
    belegpflicht: "fehler",
    referenzen: "fehler",
    "gp-abgrenzung": "fehler",
    veroeffentlichungsreife: "hinweis",
    "gp-h2-nennt-begriff": "fehler",
  },
  verboten: ["schema"],
});

fall({
  name: "auchOhneSchema: ein unbekanntes Feld nimmt genau diese Regeln aus dem Lauf",
  datei: "lexikon/grenze-mit-schemafehler.md",
  inhalt: luecke("Grenzemitfehler", { erfundenesFeld: "kaputt" }),
  // Was bleibt: die Strukturregeln, die den Body lesen.
  erwartet: { schema: "fehler", "gp-h2-nennt-begriff": "fehler" },
  // Was stumm wird — dieselben Maengel stecken in der Datei.
  verboten: ["quellen-vorhanden", "belegpflicht", "referenzen", "gp-abgrenzung", "veroeffentlichungsreife"],
});

/* ------------------------------------------------------------------ */
/* Temp-Register bauen und einmal validieren                           */
/* ------------------------------------------------------------------ */

const wurzel = mkdtempSync(path.join(os.tmpdir(), "v101-validate-test-"));
symlinkSync(path.join(PROJEKT, "scripts"), path.join(wurzel, "scripts"), "dir");
symlinkSync(path.join(PROJEKT, "node_modules"), path.join(wurzel, "node_modules"), "dir");

const pfade: string[] = [];
for (const f of faelle) {
  const ziel = path.join(wurzel, "src/content", f.datei);
  mkdirSync(path.dirname(ziel), { recursive: true });
  writeFileSync(ziel, f.inhalt, "utf8");
  pfade.push(ziel);
}

interface JsonBefund { ebene: "fehler" | "warnung" | "hinweis"; code: string; nachricht: string; feld?: string }
interface JsonBericht {
  geprueft: number;
  fehler: number;
  warnungen: number;
  hinweise: number;
  befunde: { datei: string; befunde: JsonBefund[] }[];
}

const skript = path.join(wurzel, "scripts", "validate-content.ts");

/** Ein Lauf ueber alle Fixtures. Gibt das geparste --json-Dokument zurueck. */
function lauf(dateien: string[]): { roh: string; stderr: string; code: number; bericht: JsonBericht | null } {
  const r = spawnSync("npx", ["tsx", skript, "--json", "--changed", ...dateien], {
    cwd: wurzel,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  let bericht: JsonBericht | null = null;
  try {
    bericht = JSON.parse(r.stdout) as JsonBericht;
  } catch {
    bericht = null;
  }
  return { roh: r.stdout, stderr: r.stderr ?? "", code: r.status ?? -1, bericht };
}

try {
  const ergebnis = lauf(pfade);

  // Ohne parsebares stdout ist der Rest sinnlos — und die Hygiene von --json
  // ist selbst eine Zusicherung: Ein Hinweis auf stdout hat sie frueher
  // gebrochen, ohne dass es jemandem auffiel.
  pruefe(
    "--json liefert reines JSON auf stdout",
    ergebnis.bericht !== null,
    `Exit ${ergebnis.code}, stdout beginnt mit ${JSON.stringify(ergebnis.roh.slice(0, 120))}`,
  );

  if (ergebnis.bericht) {
    const bericht = ergebnis.bericht;
    gleich("alle Fixtures wurden geprueft", bericht.geprueft, faelle.length);

    // datei (relativ zum Temp-cwd) -> Befunde
    const proDatei = new Map<string, JsonBefund[]>();
    for (const eintrag of bericht.befunde) proDatei.set(eintrag.datei, eintrag.befunde);

    const holen = (rel: string) => proDatei.get(path.join("src/content", rel)) ?? [];

    for (const f of faelle) {
      const befunde = holen(f.datei);
      const codes = new Set(befunde.map((b) => b.code));

      for (const [code, ebene] of Object.entries(f.erwartet ?? {})) {
        const treffer = befunde.filter((b) => b.code === code);
        pruefe(
          `${f.name}: Regel "${code}" schlaegt an`,
          treffer.length > 0,
          `gefundene Codes: ${[...codes].join(", ") || "(keine)"}`,
        );
        if (treffer.length > 0) {
          pruefe(
            `${f.name}: Regel "${code}" meldet Ebene "${ebene}"`,
            treffer.some((b) => b.ebene === ebene),
            `gemeldet: ${treffer.map((b) => b.ebene).join(", ")}`,
          );
        }
      }

      for (const code of f.verboten ?? []) {
        pruefe(
          `${f.name}: Regel "${code}" schlaegt nicht an`,
          !codes.has(code),
          befunde.filter((b) => b.code === code).map((b) => b.nachricht).join(" | "),
        );
      }
    }

    // Exitcode: Fehler im Register muessen 1 ergeben, sonst laeuft die CI blind.
    gleich("Exitcode 1, weil Fixtures mit Fehlern dabei sind", ergebnis.code, 1);
    pruefe("Bericht zaehlt Fehler", bericht.fehler > 0, String(bericht.fehler));
    pruefe("Bericht zaehlt Warnungen", bericht.warnungen > 0, String(bericht.warnungen));
    pruefe("Bericht zaehlt Hinweise getrennt", bericht.hinweise > 0, String(bericht.hinweise));
  }

  /* --- Gegenprobe: nur der saubere Eintrag, Exitcode 0 -------------- */
  {
    const nurSauber = path.join(wurzel, "src/content", "lexikon/tellerrock.md");
    const r = lauf([nurSauber]);
    gleich("sauberer Einzeleintrag ergibt Exitcode 0", r.code, 0);
    pruefe(
      "sauberer Einzeleintrag meldet keinen Fehler",
      r.bericht !== null && r.bericht.fehler === 0,
      JSON.stringify(r.bericht?.befunde ?? r.roh.slice(0, 200)),
    );
  }

  /* --- Die eigentliche Frage: eskaliert --strict den Hinweis? ------- */
  /*
   * Der Fixture-Lauf oben belegt die EBENE. Ob `--strict` sie durchlaesst,
   * ist eine andere Aussage -- und genau die, an der die Freigabe haengt.
   * Sie braucht einen eigenen Lauf ueber einen Eintrag, der ausser dem
   * Hinweis sauber ist.
   */
  {
    const strikt = (rel: string) => {
      const r = spawnSync("npx", ["tsx", skript, "--json", "--strict", "--changed", path.join(wurzel, "src/content", rel)], {
        cwd: wurzel,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      let bericht: JsonBericht | null = null;
      try {
        bericht = JSON.parse(r.stdout) as JsonBericht;
      } catch {
        bericht = null;
      }
      return { code: r.status ?? -1, bericht, roh: r.stdout };
    };

    const h = strikt("lexikon/reife-nur-hinweis.md");
    gleich("--strict laesst den aliases-Hinweis durch (Exitcode 0)", h.code, 0);
    // Positives Lebenszeichen: Der Hinweis MUSS im Bericht stehen. Ein
    // Exitcode 0 waere auch dann wahr, wenn die Regel gar nichts meldete --
    // und dann haette der Umbau die Auskunft verloren statt die Blockade.
    pruefe(
      "und meldet ihn trotzdem, als Hinweis",
      (h.bericht?.hinweise ?? 0) > 0 &&
        (h.bericht?.befunde ?? []).some((d) =>
          d.befunde.some((b) => b.code === "veroeffentlichungsreife" && b.ebene === "hinweis"),
        ),
      JSON.stringify(h.bericht?.befunde ?? h.roh.slice(0, 300)),
    );

    // Gegenprobe: Eine echte WARNUNG blockiert unter --strict weiterhin.
    // Ohne sie waere "Exitcode 0" auch mit einem --strict vereinbar, das
    // ueberhaupt nichts mehr eskaliert.
    const w = strikt("lexikon/kapsel-unklar.md");
    gleich("--strict eskaliert eine echte Warnung weiterhin (Exitcode 1)", w.code, 1);
    pruefe(
      "und die Warnung steht als solche im Bericht",
      (w.bericht?.warnungen ?? 0) > 0,
      JSON.stringify(w.bericht?.befunde ?? w.roh.slice(0, 300)),
    );
  }
} finally {
  rmSync(wurzel, { recursive: true, force: true });
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
