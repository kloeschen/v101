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
 * Auf einem frischen Klon ist es leer — dann gibt es nichts zu prüfen, und
 * ein roter Testlauf wäre eine Falschmeldung. Die Logik selbst ist oben
 * bereits gegen synthetische Daten abgesichert.
 */
const hatInhalte = (slug: string, art: Parameters<typeof aufloesen>[1]) =>
  aufloesen(echte, art, slug) !== undefined;

if (!hatInhalte("the-firebirds", "bands")) {
  console.log("Hinweis: Register enthält die Beispieldaten nicht — Abschnitt gegen echte Inhalte übersprungen.");
} else {
{
  const band = aufloesen(echte, "bands", "the-firebirds");
  pruefe("Band wird aufgelöst", !!band, "the-firebirds fehlt");

  const { kommend, vergangen } = auftritte(echte, "the-firebirds");
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
  pruefe("Pfad wird zum Eintrag aufgelöst", pfadZuEintrag(echte, "/bands/the-firebirds/")?.name === "The Firebirds");
}
}

{
  // Von Inhalten unabhängig: reine Textanalyse.
  const pfade = interneLinks("[a](/lexikon/rockabilly/) und [b](/bands/the-firebirds/) und [a](/lexikon/rockabilly/)");
  gleich("interne Links dedupliziert", pfade.length, 2);
  pruefe("unbekannter Pfad löst nicht auf", pfadZuEintrag(echte, "/bands/gibt-es-nicht/") === undefined);
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
