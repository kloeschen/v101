#!/usr/bin/env -S npx tsx
/**
 * test-links.ts — sichert die Kanten des Autolinks ab.
 *
 * Der Autolink schreibt automatisch in jeden Artikel. Wenn er falsch liegt,
 * liegt er hundertfach falsch — deshalb liegen die Grenzfälle hier als
 * Behauptungen fest, nicht als Kommentar.
 *
 *   npx tsx scripts/test-links.ts
 */

import {
  buildRegistry,
  autolink,
  segmentiere,
  aufloesen,
  auftritte,
  inRegion,
  verwandtes,
  eingehendeVerweise,
  interneLinks,
  pfadZuEintrag,
  type RegistryEingabe,
} from "../src/lib/links";
import { ladeAlle, alsRegistryEingaben } from "./_laden";
import { faktZeilen } from "../src/lib/faktenblock";

let bestanden = 0;
const fehler: string[] = [];

function pruefe(name: string, bedingung: boolean, detail = "") {
  if (bedingung) bestanden++;
  else fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

function gleich(name: string, ist: unknown, soll: unknown) {
  const a = JSON.stringify(ist);
  const b = JSON.stringify(soll);
  pruefe(name, a === b, `ist ${a}, soll ${b}`);
}

/* ------------------------------------------------------------------ */
/* Testregistry                                                        */
/* ------------------------------------------------------------------ */

const lex = (slug: string, name: string, extra: Record<string, any> = {}): RegistryEingabe => ({
  collection: "lexikon",
  slug,
  daten: { name, aliases: [], kurzbeschreibung: `${name} ist ein Begriff.`, ...extra },
});

const registry = buildRegistry([
  lex("rockabilly", "Rockabilly", { bezeichnungEn: "Rockabilly" }),
  lex("neo-rockabilly", "Neo-Rockabilly"),
  lex("petticoat", "Petticoat", { aliases: ["Unterrock"] }),
  lex("wet-set", "Wet Set"),
  lex("pompadour", "Pompadour"),
  lex("tolle", "Tolle"),
  lex("boogie-woogie", "Boogie Woogie"),
]);

/* ------------------------------------------------------------------ */
/* Autolink                                                            */
/* ------------------------------------------------------------------ */

{
  const { markdown, verlinkt } = autolink("Der Petticoat gehört dazu.", registry);
  gleich("einfacher Begriff wird verlinkt", markdown, "Der [Petticoat](/lexikon/petticoat/) gehört dazu.");
  gleich("Rückgabe nennt den Slug", verlinkt, ["petticoat"]);
}

{
  const { markdown } = autolink("Ein Petticoat. Noch ein Petticoat.", registry);
  pruefe("nur das erste Vorkommen wird verlinkt", markdown.match(/\/lexikon\/petticoat\//g)?.length === 1, markdown);
}

{
  const md = "Text mit `Petticoat` als Code.\n\n```\nEin Petticoat im Codeblock\n```\n";
  const { markdown, verlinkt } = autolink(md, registry);
  gleich("Code bleibt unangetastet", verlinkt, []);
  gleich("Codetext unverändert", markdown, md);
}

{
  const md = "## Der Petticoat als Überschrift\n\nNormaler Text.";
  const { verlinkt } = autolink(md, registry);
  gleich("Überschriften werden nicht verlinkt", verlinkt, []);
}

{
  const md = "Ein [Petticoat](/lexikon/petticoat/) ist schon verlinkt. Noch ein Petticoat.";
  const { markdown, verlinkt } = autolink(md, registry);
  gleich("bestehender Link sperrt den Begriff", verlinkt, []);
  gleich("Text bleibt unverändert", markdown, md);
}

{
  const md = "Siehe [diesen Text über Petticoat](/artikel/mode/) hier.";
  const { verlinkt } = autolink(md, registry);
  gleich("kein Link im Linktext eines fremden Ziels", verlinkt, []);
}

{
  const { markdown } = autolink("Neo-Rockabilly klingt anders.", registry);
  pruefe(
    "längster Begriff gewinnt",
    markdown.includes("/lexikon/neo-rockabilly/") && !markdown.includes("/lexikon/rockabilly/"),
    markdown,
  );
}

{
  const { markdown } = autolink("Viele Petticoats hängen dort.", registry);
  gleich("Flexion wird mitgenommen", markdown, "Viele [Petticoats](/lexikon/petticoat/) hängen dort.");
}

{
  const { markdown, verlinkt } = autolink("Ein Rockabilly-Weekender in Walldorf.", registry);
  gleich("Kompositum mit Bindestrich: vorderer Teil wird verlinkt", verlinkt, ["rockabilly"]);
  pruefe("Kompositum bleibt lesbar", markdown.includes("[Rockabilly](/lexikon/rockabilly/)-Weekender"), markdown);
}

{
  const { verlinkt } = autolink("Der Neo-Rockabilly der Achtziger.", registry);
  gleich("vorangehender Bindestrich blockiert den kurzen Begriff", verlinkt, ["neo-rockabilly"]);
}

{
  const { verlinkt } = autolink("Er hört Rockabillymusik.", registry);
  gleich("kein Treffer innerhalb eines Wortes", verlinkt, []);
}

{
  const { verlinkt } = autolink("Sie kaufte Tollerei ein.", registry);
  gleich("Wortgrenze hält bei Umlaut-Nachbarschaft", verlinkt, []);
}

{
  const { markdown } = autolink("Der Unterrock ist ein Petticoat.", registry);
  pruefe(
    "Alias verlinkt aufs selbe Ziel, und zwar beim frühesten Vorkommen",
    markdown.match(/\/lexikon\/petticoat\//g)?.length === 1 && markdown.includes("[Unterrock]"),
    markdown,
  );
}

{
  const { markdown, verlinkt } = autolink("Neo-Rockabilly kam nach dem Rockabilly.", registry);
  gleich("überlappende Begriffe: beide Ziele, korrekt zugeordnet", verlinkt.sort(), ["neo-rockabilly", "rockabilly"]);
  pruefe(
    "Neo-Rockabilly bleibt als Ganzes erhalten",
    markdown.includes("[Neo-Rockabilly](/lexikon/neo-rockabilly/)") &&
      markdown.includes("[Rockabilly](/lexikon/rockabilly/)"),
    markdown,
  );
}

{
  const { markdown } = autolink("Zuerst Pompadour, dann Wet Set, dann Petticoat.", registry);
  const reihenfolge = [...markdown.matchAll(/\/lexikon\/([a-z-]+)\//g)].map((m) => m[1]);
  gleich("Links stehen in Textreihenfolge", reihenfolge, ["pompadour", "wet-set", "petticoat"]);
}

{
  const md = "Ein Petticoat.\n\n```\ncode\n```\n\nEin Pompadour und ein Wet Set.";
  const { verlinkt } = autolink(md, registry, { maxLinks: 2 });
  gleich("maxLinks gilt über Segmentgrenzen hinweg", verlinkt.length, 2);
}

{
  const { verlinkt } = autolink("Wet Set und Pompadour und Petticoat.", registry, { maxLinks: 2 });
  gleich("maxLinks begrenzt", verlinkt.length, 2);
}

{
  const { verlinkt } = autolink("Rockabilly ist ein Musikstil.", registry, {
    aktuell: { collection: "lexikon", slug: "rockabilly" },
  });
  gleich("keine Selbstverlinkung auf der eigenen Lexikonseite", verlinkt, []);
}

{
  const { verlinkt } = autolink("Ein Petticoat.", registry, { ausnahmen: ["Petticoat"] });
  gleich("Ausnahmen greifen", verlinkt, []);
}

/* --- Mehrdeutige Wörter (2026-09-25) ------------------------------ *
 * Trägt mehr als ein Eintrag dasselbe Wort, verlinkt der Autolink es nicht.
 * Gegenprobe: Mit nur einem Träger wird dasselbe Wort verlinkt — sonst
 * wäre „kein Link" auch aus einem kaputten Muster erklärbar (Lektion 17). */
{
  const nurMusik = buildRegistry([lex("rocknroll", "Rock'n'Roll", { aliases: ["Rock and Roll"] })]);
  const { verlinkt } = autolink("Die Band spielt Rock'n'Roll.", nurMusik);
  gleich("Gegenprobe: ein Träger, Wort wird verlinkt", verlinkt, ["rocknroll"]);
  gleich("Gegenprobe: ohne Geschwister nichts mehrdeutig", [...nurMusik.mehrdeutig.keys()], []);
}

{
  const beide = buildRegistry([
    lex("rocknroll", "Rock'n'Roll", { aliases: ["Rock and Roll"] }),
    lex("rocknroll-tanz", "Rock'n'Roll-Tanz", { aliases: ["Rock'n'Roll", "Akrobatischer Rock'n'Roll"] }),
    lex("petticoat", "Petticoat"),
  ]);
  gleich("geteiltes Wort ist mehrdeutig, mit beiden Trägern", beide.mehrdeutig.get("rock'n'roll"), ["rocknroll", "rocknroll-tanz"]);
  const a = autolink("Die Band spielt Rock'n'Roll zum Petticoat.", beide);
  gleich("mehrdeutiges Wort wird nicht verlinkt, eindeutiges schon", a.verlinkt, ["petticoat"]);
  const b = autolink("Der Rock'n'Roll-Tanz ist akrobatisch.", beide);
  gleich("eindeutige Form verlinkt den Tanz", b.verlinkt, ["rocknroll-tanz"]);
  pruefe("…und nicht die Musik als Teilwort", !b.markdown.includes("/lexikon/rocknroll/"), b.markdown);
  const c = autolink("Rock and Roll kam aus den USA.", beide);
  gleich("nicht geteilter Alias bleibt beim Träger", c.verlinkt, ["rocknroll"]);
  const d = autolink("Er tanzt [Rock'n'Roll](/lexikon/rocknroll-tanz/) und hört Rock'n'Roll.", beide);
  pruefe("Handlink bleibt, das zweite Vorkommen bleibt unverlinkt", d.markdown === "Er tanzt [Rock'n'Roll](/lexikon/rocknroll-tanz/) und hört Rock'n'Roll.", d.markdown);
}

{
  // Fund am echten Bestand: Der Unterrock trägt „Petticoat" als englische
  // Bezeichnung. Die zählt nachrangig, sonst verlöre der Petticoat seinen Link.
  const rang = buildRegistry([
    lex("unterrock", "Unterrock", { bezeichnungEn: "Petticoat" }),
    lex("petticoat", "Petticoat", { bezeichnungEn: "Petticoat" }),
  ]);
  gleich("Name schlägt fremde englische Bezeichnung", autolink("Ein Petticoat.", rang).verlinkt, ["petticoat"]);
  gleich("…und macht das Wort nicht mehrdeutig", [...rang.mehrdeutig.keys()], []);
  const nurEn = buildRegistry([
    lex("a-eintrag", "Erster Eintrag", { bezeichnungEn: "Swingout" }),
    lex("b-eintrag", "Zweiter Eintrag", { bezeichnungEn: "Swingout" }),
  ]);
  gleich("gleichrangige englische Bezeichnungen sind mehrdeutig", nurEn.mehrdeutig.get("swingout"), ["a-eintrag", "b-eintrag"]);
  const allein = buildRegistry([lex("unterrock", "Unterrock", { bezeichnungEn: "Petticoat" })]);
  gleich("englische Bezeichnung ohne Konkurrenz verlinkt weiter", autolink("Ein Petticoat.", allein).verlinkt, ["unterrock"]);
}

{
  const gross = buildRegistry([lex("boogie-woogie", "Boogie-Woogie"), lex("boogie-woogie-tanz", "Boogie-Woogie-Tanz", { aliases: ["boogie-woogie"] })]);
  gleich("Mehrdeutigkeit unabhängig von Groß-/Kleinschreibung", [...gross.mehrdeutig.keys()], ["boogie-woogie"]);
}

{
  const md = "Siehe https://example.com/petticoat-guide für mehr.";
  const { markdown } = autolink(md, registry);
  gleich("nackte URLs bleiben unangetastet", markdown, md);
}

{
  const md = "| Begriff | Bedeutung |\n| --- | --- |\n| Petticoat | Unterrock |\n";
  const { verlinkt } = autolink(md, registry);
  pruefe("Tabellenzellen werden verlinkt, Trennzeile nicht", verlinkt.includes("petticoat"));
  const { markdown } = autolink(md, registry);
  pruefe("Trennzeile unverändert", markdown.includes("| --- | --- |"), markdown);
}

{
  const md = "Text mit <span>Petticoat</span> in HTML.";
  const { markdown } = autolink(md, registry);
  pruefe("HTML-Tags bleiben intakt", markdown.includes("<span>") && markdown.includes("</span>"), markdown);
}

{
  const segmente = segmentiere("A `b` C ```\nd\n``` E");
  pruefe("Segmentierung trennt geschützte Bereiche", segmente.filter((s) => s.geschuetzt).length === 2);
  gleich("Segmente ergeben wieder den Originaltext", segmente.map((s) => s.text).join(""), "A `b` C ```\nd\n``` E");
}

/* ------------------------------------------------------------------ */
/* Rückverweise gegen echte Daten                                      */
/* ------------------------------------------------------------------ */

const echte = buildRegistry(alsRegistryEingaben(ladeAlle()));

/**
 * Dieser Abschnitt prüft gegen die tatsächlichen Inhalte des Registers.
 *
 * BIS ZUM 2026-09-23 LIEF ER NIE. Er hing an der Band `the-firebirds`, und
 * die gab es nur im Golden Example, das der Loader überspringt. Jeder Lauf
 * endete mit „Abschnitt übersprungen", drei Wochen lang, und sechs
 * Prüfungen hatten nie etwas gesehen (Lektion 19). Aufgefallen ist es beim
 * Ersetzen der Vorlage.
 *
 * Jetzt hängt er an echten, freigegebenen Einträgen, und ein fehlender Anker
 * ist ein Fehler, kein Hinweis: Ein Test, der sich still abschaltet, wenn
 * sein Gegenstand fehlt, ist genau der Zustand, aus dem er kam. Wird ein
 * Anker gelöscht, ist der Test umzustellen, nicht zu überspringen.
 */
const hatInhalte = (slug: string, art: Parameters<typeof aufloesen>[1]) =>
  aufloesen(echte, art, slug) !== undefined;
const ANKER_BAND = "boppin-b";

pruefe(
  "Anker im Register: die Band, gegen die geprüft wird",
  hatInhalte(ANKER_BAND, "bands"),
  `${ANKER_BAND} fehlt — Anker umstellen, nicht überspringen`,
);
{
{
  const band = aufloesen(echte, "bands", ANKER_BAND);
  pruefe("Band wird aufgelöst", !!band, `${ANKER_BAND} fehlt`);

  const { kommend, vergangen } = auftritte(echte, ANKER_BAND);
  pruefe(
    "Auftritt fällt aus den Eventdaten heraus",
    kommend.length + vergangen.length >= 1,
    `kommend ${kommend.length}, vergangen ${vergangen.length}`,
  );
}

{
  // Regression zu einem Review-Befund: Das Schema erlaubt Events ohne
  // explizite Region, weil sie aus der Location folgt. buildRegistry muss
  // diese Ableitung einlösen, sonst ist das Event regional unsichtbar.
  const reg = buildRegistry([
    { collection: "regionen", slug: "rn", daten: { name: "RN" } },
    { collection: "locations", slug: "h", daten: { name: "H", region: "rn" } },
    { collection: "events", slug: "e", daten: { name: "E", ort: "h", beginn: new Date("2027-07-01") } },
  ]);
  gleich("Event ohne region erbt sie von der Location", (inRegion(reg, "rn").get("events") ?? []).length, 1);
  gleich("abgeleitete Region steht in den Registry-Daten", reg.eintraege.get("events/e")?.daten.region, "rn");
}

{
  const gruppen = inRegion(echte, "rhein-neckar");
  pruefe("Region bündelt Locations", (gruppen.get("locations") ?? []).length >= 1);
  pruefe("Region bündelt Events", (gruppen.get("events") ?? []).length >= 1);
}

{
  const v = verwandtes(echte, "lexikon", "rockabilly");
  pruefe("Verwandtes enthält Rückverweise", v.length >= 1, `${v.length} Einträge`);
  pruefe("Verwandtes enthält nicht sich selbst", !v.some((e) => e.collection === "lexikon" && e.slug === "rockabilly"));
}

{
  const verweise = eingehendeVerweise(echte, "locations", "astoria-halle", { nurFeld: "ort" });
  pruefe("Location kennt ihre Veranstaltungen", verweise.length >= 1);
}

{
  pruefe("Pfad wird zum Eintrag aufgelöst", pfadZuEintrag(echte, `/bands/${ANKER_BAND}/`)?.name === "Boppin'B");
}
}

{
  // Von Inhalten unabhängig: reine Textanalyse.
  const pfade = interneLinks("[a](/lexikon/rockabilly/) und [b](/bands/the-firebirds/) und [a](/lexikon/rockabilly/)");
  gleich("interne Links dedupliziert", pfade.length, 2);
  pruefe("unbekannter Pfad löst nicht auf", pfadZuEintrag(echte, "/bands/gibt-es-nicht/") === undefined);
}

/* ------------------------------------------------------------------ */
/* Die Hauptentität eines Artikels                                     */
/* ------------------------------------------------------------------ */
/*
 * Lektion 19 in Reinform. `hauptentitaet` ist das einzige Referenzfeld, das
 * nicht in `referenzFelder` steht: Es zeigt auf eine variable Collection und
 * wird in `buildRegistry` deshalb von Hand behandelt. Bis zum 2026-09-22 trug
 * kein Artikel des Registers einen Wert — beide Wege, die daran hängen, sind
 * also nie gelaufen: der Rückverweis auf die Entität und die Zeile
 * "Handelt von" im Faktenblock.
 *
 * Geprüft wird in beide Richtungen. Ein Test, der nur zeigt, dass ein
 * Rückverweis existiert, belegt nicht, dass er an `hauptentitaet` hängt — er
 * wäre auch grün, wenn ihn ein anderes Feld erzeugte. Deshalb steht neben
 * jeder Anwesenheit eine Abwesenheit mit derselben Vorrichtung.
 */

const artikelMit = (haupt?: { typ: string; slug: string }): RegistryEingabe => ({
  collection: "artikel",
  slug: "autoseite",
  daten: {
    name: "Die Autoseite",
    aliases: [],
    kurzbeschreibung: "Die Autoseite ist ein Testartikel.",
    typ: "pillar",
    saeule: "kustom-kulture",
    erwaehnteBegriffe: [],
    ...(haupt ? { hauptentitaet: haupt } : {}),
  },
});

const mitHaupt = buildRegistry([lex("kustom-kulture", "Kustom Kulture"), artikelMit({ typ: "lexikon", slug: "kustom-kulture" })]);
const ohneHaupt = buildRegistry([lex("kustom-kulture", "Kustom Kulture"), artikelMit()]);
const insLeere = buildRegistry([lex("kustom-kulture", "Kustom Kulture"), artikelMit({ typ: "lexikon", slug: "gibt-es-nicht" })]);

{
  const verweise = eingehendeVerweise(mitHaupt, "lexikon", "kustom-kulture");
  gleich("hauptentitaet erzeugt genau einen Rückverweis", verweise.length, 1);
  gleich("und dieser Rückverweis ist als hauptentitaet ausgewiesen", verweise[0]?.feld, "hauptentitaet");
  gleich("er zeigt auf den Artikel, der das Feld trägt", verweise[0]?.von.slug, "autoseite");

  gleich(
    "ohne hauptentitaet gibt es den Rückverweis nicht — dieselbe Vorrichtung, anderes Ergebnis",
    eingehendeVerweise(ohneHaupt, "lexikon", "kustom-kulture").length,
    0,
  );
  gleich(
    "eine hauptentitaet ins Leere erzeugt keinen Rückverweis (und keinen Absturz)",
    eingehendeVerweise(insLeere, "lexikon", "kustom-kulture").length,
    0,
  );
}

{
  // Faktenblock: dieselbe Angabe, anderer Konsument.
  const zeile = (r: typeof mitHaupt) =>
    faktZeilen("artikel", aufloesen(r, "artikel", "autoseite")!.daten, r).find((z) => z.feld === "hauptentitaet");

  const gesetzt = zeile(mitHaupt);
  pruefe("Faktenblock zeigt eine Zeile zur Hauptentität", Boolean(gesetzt), "keine Zeile mit feld=hauptentitaet");
  gleich("die Zeile trägt die Beschriftung Handelt von", gesetzt?.label, "Handelt von");
  gleich("sie nennt den Namen der Entität", gesetzt?.stuecke[0]?.text, "Kustom Kulture");
  gleich("und verlinkt sie", gesetzt?.stuecke[0]?.href, "/lexikon/kustom-kulture/");

  pruefe("ohne hauptentitaet fehlt die Zeile", zeile(ohneHaupt) === undefined);

  const leer = zeile(insLeere);
  pruefe("eine hauptentitaet ins Leere fällt auf den Rohwert zurück", Boolean(leer), "keine Zeile");
  gleich("dort steht Typ und Slug", leer?.stuecke[0]?.text, "lexikon/gibt-es-nicht");
  gleich("und es wird nicht verlinkt", leer?.stuecke[0]?.href, undefined);
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
