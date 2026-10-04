#!/usr/bin/env -S npx tsx
/**
 * test-gegenlesen.ts — der Gegenleser: blinder Auftrag, vollständige
 * Antwort, Vergleich im Code.
 *
 * Drei Behauptungen tragen den Gegenleser, und jede hat hier ihren Test:
 *   1. Der Auftrag verrät die eingetragenen Werte nicht (sonst prüft der
 *      Gegenleser den Autor statt der Quelle).
 *   2. Eine Antwort mit Lücken wird zurückgewiesen (sonst wäre ein
 *      übersprungenes Feld ein stilles grünes Häkchen, Lektion 19).
 *   3. Der Vergleich findet die Fehler, um die es geht — falsche Uhrzeit,
 *      falscher Preis, falscher Ort, fehlende Band — und bestätigt, was
 *      stimmt (positives Lebenszeichen neben jeder Abweichung).
 *
 * Geprüft wird gegen Einträge im Testharnisch, nicht gegen echte Dateien.
 *
 *   npx tsx scripts/test-gegenlesen.ts
 */

import {
  auftragFuer,
  pruefeAntwort,
  vergleiche,
  vergleichAlles,
  alsMarkdown,
  ohnePruefpunkte,
  ortszeit,
  type Antwort,
  type Kontext,
  type Pruefpunkt,
} from "./gegenlesen";
import type { GeladenerEintrag } from "./_laden";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

const eintrag = (collection: any, slug: string, daten: Record<string, any>): GeladenerEintrag => ({
  datei: `/test/${collection}/${slug}.md`,
  collection,
  slug,
  roh: daten,
  daten,
  body: "",
  frontmatter: "",
});

const Q1 = "https://verein.example/termine";
const Q2 = "https://flyer.example/herbst.jpg";

// 20:00 Ortszeit am 24.10. (Sommerzeit, +02:00).
const termin = eintrag("events", "herbst-2026-10-24", {
  name: "Herbst Boogie Party",
  beginn: new Date("2026-10-24T20:00:00+02:00"),
  ort: "gasthaus-test",
  lineupBands: ["die-testband"],
  eintritt: "beziffert",
  preise: [{ bezeichnung: "Abendkasse", betrag: 15, waehrung: "EUR" }, { bezeichnung: "Vorverkauf", betrag: 12, waehrung: "EUR" }],
  ticketUrl: "https://tickets.example/herbst",
  durchfuehrung: "geplant",
  quellen: [
    { url: Q1, felder: ["beginn", "ort", "lineupBands", "durchfuehrung", "ticketUrl"] },
    { url: Q2, felder: ["beginn", "eintritt"] },
  ],
});
const ort = eintrag("locations", "gasthaus-test", {
  name: "Gasthaus Forstinger",
  aliases: ["Forstinger"],
  adresse: { ort: "Roitham am Traunfall" },
});
const band = eintrag("bands", "die-testband", { name: "The Testers", aliases: ["Testers"] });
const k: Kontext = { alle: new Map([termin, ort, band].map((e) => [`${e.collection}/${e.slug}`, e])) };

/* --- 1. Der Auftrag ---------------------------------------------------- */
const auftrag = auftragFuer([termin]);
{
  const felder = auftrag.pruefpunkte.map((p) => p.feld).sort();
  gleich("je belegpflichtigem Feld mit Wert ein Prüfpunkt", felder, ["beginn", "durchfuehrung", "lineupBands", "ort", "preise", "ticketUrl"]);
  const text = JSON.stringify(auftrag);
  // Blindheit: nichts, was der Gegenleser selbst finden soll, steht drin.
  for (const [was, verraeterisch] of [
    ["Uhrzeit", "20:00"],
    ["Preis", "15"],
    ["Vorverkaufspreis", "12"],
    ["Ortsname", "Forstinger"],
    ["Bandname", "Testers"],
    ["Ticket-Link", "tickets.example"],
  ]) {
    pruefe(`der Auftrag verrät nicht: ${was}`, !text.includes(verraeterisch!), text.slice(0, 300));
  }
  // Positives Lebenszeichen der Blindheitsprüfung: Name und Datum stehen
  // drin, genau wie vorgesehen — der Text ist also der richtige.
  pruefe("…wohl aber Name und Datum zum Wiederfinden", text.includes("Herbst Boogie Party") && text.includes("2026-10-24"));
  const preise = auftrag.pruefpunkte.find((p) => p.feld === "preise");
  gleich("preise fragt die Quelle, die `eintritt` deckt", preise?.quellen, [Q2]);
  const beginn = auftrag.pruefpunkte.find((p) => p.feld === "beginn");
  gleich("beginn fragt beide Quellen", beginn?.quellen, [Q1, Q2]);
}
{
  // Kurz vor Mitternacht UTC ist in Berlin schon der nächste Tag.
  const spaet = eintrag("events", "spaet", { ...termin.daten!, beginn: new Date("2026-10-24T22:30:00Z") });
  gleich("das Datum im Auftrag ist Ortszeit", auftragFuer([spaet]).pruefpunkte[0]?.termin?.datum, "2026-10-25");
  gleich("ortszeit rechnet in der Zone der Site", ortszeit(new Date("2026-10-24T22:30:00Z")), { datum: "2026-10-25", uhrzeit: "00:30" });
}
{
  const vorbei = eintrag("events", "vorbei", { ...termin.daten!, durchfuehrung: "stattgefunden" });
  pruefe("ein stattgefundener Termin braucht keine Statusprüfung", !auftragFuer([vorbei]).pruefpunkte.some((p) => p.feld === "durchfuehrung"));
  const ohnePreis = eintrag("events", "ohne", { ...termin.daten!, eintritt: "unveroeffentlicht", preise: [] });
  pruefe("preise wird auch ohne Betrag gefragt", auftragFuer([ohnePreis]).pruefpunkte.some((p) => p.feld === "preise"));
}

/* --- 2. Die Antwort muss vollständig sein ------------------------------ */
const gut = (id: string, wert: any, zitat = "laut Quelle"): Antwort => ({ id, ergebnis: "gefunden", wert, zitat, quelle: Q1 });
const id = (feld: string) => `events/herbst-2026-10-24#${feld}`;
const vollstaendig: Antwort[] = [
  gut(id("beginn"), { datum: "2026-10-24", uhrzeit: "20:00", einlass: "19:00" }),
  gut(id("preise"), { betraege: [12, 15], waehrung: "EUR" }),
  gut(id("ort"), { name: "Gasthaus Forstinger", stadt: "Roitham" }),
  gut(id("lineupBands"), { acts: ["The Testers", "DJ Nachtschicht"] }),
  gut(id("ticketUrl"), { url: "https://www.tickets.example/herbst/" }),
  gut(id("durchfuehrung"), { status: "geplant" }),
];
gleich("vollständige Antwort ist gültig", pruefeAntwort(auftrag, vollstaendig), []);
{
  const f = pruefeAntwort(auftrag, vollstaendig.slice(1));
  pruefe("fehlender Prüfpunkt wird gemeldet", f.some((x) => x.includes("Nicht beantwortet") && x.includes("#beginn")), JSON.stringify(f));
}
pruefe("doppelte Antwort wird gemeldet", pruefeAntwort(auftrag, [...vollstaendig, vollstaendig[0]!]).some((x) => x.includes("Mehrfach")));
pruefe("unbekannte id wird gemeldet", pruefeAntwort(auftrag, [...vollstaendig, gut("events/x#beginn", {})]).some((x) => x.includes("Unbekannt")));
pruefe(
  "„gefunden“ ohne Zitat ist ungültig",
  pruefeAntwort(auftrag, [{ ...vollstaendig[0]!, zitat: undefined }, ...vollstaendig.slice(1)]).some((x) => x.includes("zitat")),
);
pruefe(
  "„nicht-gefunden“ ohne Grund ist ungültig",
  pruefeAntwort(auftrag, [{ id: id("beginn"), ergebnis: "nicht-gefunden" }, ...vollstaendig.slice(1)]).some((x) => x.includes("grund")),
);
pruefe("keine Liste ist ungültig", pruefeAntwort(auftrag, { antworten: vollstaendig }).length > 0);

/* --- 3. Der Vergleich --------------------------------------------------- */
const pp = (feld: string): Pruefpunkt => auftrag.pruefpunkte.find((p) => p.feld === feld)!;
const urteil = (feld: string, a: Antwort, e = termin) => vergleiche(pp(feld), a, e, k).urteil;

// Alles richtig: jedes Feld bestätigt (das Lebenszeichen neben den Abweichungen unten).
{
  const befunde = vergleichAlles(auftrag, vollstaendig, k);
  gleich("die richtige Antwort bestätigt alle sechs Felder", befunde.map((b) => b.urteil), Array(6).fill("bestaetigt"));
}
// Uhrzeit — der Record-Hop-Fall.
gleich("andere Uhrzeit ist eine Abweichung", urteil("beginn", gut(id("beginn"), { datum: "2026-10-24", uhrzeit: "21:00" })), "abweichung");
gleich("anderes Datum ist eine Abweichung", urteil("beginn", gut(id("beginn"), { datum: "2026-10-25", uhrzeit: "20:00" })), "abweichung");
gleich("Quelle ohne Uhrzeit deckt die eingetragene nicht", urteil("beginn", gut(id("beginn"), { datum: "2026-10-24", uhrzeit: null })), "abweichung");
gleich("eingetragen ist der Einlass: Sichtprüfung", urteil("beginn", gut(id("beginn"), { datum: "2026-10-24", uhrzeit: "21:00", einlass: "20:00" })), "sichtpruefung");
gleich("Termin an diesem Tag nicht gefunden", urteil("beginn", { id: id("beginn"), ergebnis: "nicht-gefunden", grund: "nur 31.10." }), "abweichung");
{
  const ganz = eintrag("events", "herbst-2026-10-24", { ...termin.daten!, ganztaegig: true });
  gleich("ganztägig: das Datum reicht", urteil("beginn", gut(id("beginn"), { datum: "2026-10-24", uhrzeit: null }), ganz), "bestaetigt");
}
// Preise.
gleich("anderer Betrag ist eine Abweichung", urteil("preise", gut(id("preise"), { betraege: [12, 16] })), "abweichung");
gleich("weitere Preise in der Quelle: Sichtprüfung", urteil("preise", gut(id("preise"), { betraege: [10, 12, 15] })), "sichtpruefung");
gleich("Quelle nennt keinen Preis, eingetragen ist einer", urteil("preise", { id: id("preise"), ergebnis: "nicht-gefunden", grund: "kein Preis" }), "abweichung");
gleich("Quelle sagt frei, eingetragen ist ein Preis", urteil("preise", gut(id("preise"), { frei: true })), "abweichung");
{
  const ohne = eintrag("events", "herbst-2026-10-24", { ...termin.daten!, eintritt: "unveroeffentlicht", preise: [] });
  gleich("kein Preis und keiner eingetragen: bestätigt", urteil("preise", { id: id("preise"), ergebnis: "nicht-gefunden", grund: "kein Preis" }, ohne), "bestaetigt");
  const frei = eintrag("events", "herbst-2026-10-24", { ...termin.daten!, eintritt: "frei", preise: [] });
  gleich("frei und frei: bestätigt", urteil("preise", gut(id("preise"), { frei: true }), frei), "bestaetigt");
}
// Ort und Line-up.
gleich("andere Stadt ist eine Abweichung", urteil("ort", gut(id("ort"), { name: "Gasthaus Forstinger", stadt: "Gmunden" })), "abweichung");
gleich("Alias des Hauses zählt", urteil("ort", gut(id("ort"), { name: "Forstinger", stadt: "Roitham" })), "bestaetigt");
gleich("anderer Name, gleiche Stadt: Sichtprüfung", urteil("ort", gut(id("ort"), { name: "Festsaal", stadt: "Roitham" })), "sichtpruefung");
gleich("fehlende Band ist eine Abweichung", urteil("lineupBands", gut(id("lineupBands"), { acts: ["Andere Band"] })), "abweichung");
gleich("Band über ihren Alias gefunden", urteil("lineupBands", gut(id("lineupBands"), { acts: ["TESTERS"] })), "bestaetigt");
// Status und Link.
gleich("Quelle meldet Absage", urteil("durchfuehrung", gut(id("durchfuehrung"), { status: "abgesagt" })), "abweichung");
gleich("anderer Ticket-Link: Sichtprüfung", urteil("ticketUrl", gut(id("ticketUrl"), { url: "https://andere.example/x" })), "sichtpruefung");
// Nicht prüfbar.
gleich("Quelle nicht erreichbar: nicht prüfbar", urteil("ort", { id: id("ort"), ergebnis: "nicht-erreichbar", grund: "Zeitüberschreitung" }), "nicht-pruefbar");
{
  const ohneQuelle = eintrag("events", "herbst-2026-10-24", { ...termin.daten!, quellen: [] });
  const p = auftragFuer([ohneQuelle]).pruefpunkte.find((x) => x.feld === "ort")!;
  gleich("Feld ohne Quelle: nicht prüfbar", vergleiche(p, gut(p.id, { name: "Gasthaus Forstinger", stadt: "Roitham" }), ohneQuelle, k).urteil, "nicht-pruefbar");
}
// Nicht prüfbar zeigt den eingetragenen Wert wie die übrigen Zweige
// (seit 2026-10-04): Ortszeit statt Date.toString(), Beträge statt
// „[object Object]". Fund aus PR #156.
{
  const weg = (feld: string): Antwort => ({ id: id(feld), ergebnis: "nicht-erreichbar", grund: "Zeitüberschreitung" });
  const zeile = (feld: string, a: Antwort, e = termin) => vergleiche(pp(feld), a, e, k);
  // Lebenszeichen: Die frühe Rückgabe ist wirklich der Zweig, der antwortet.
  gleich("nicht erreichbar: beginn ist nicht prüfbar", zeile("beginn", weg("beginn")).urteil, "nicht-pruefbar");
  gleich("…und zeigt Datum und Uhrzeit in Ortszeit", zeile("beginn", weg("beginn")).eingetragen, "2026-10-24 20:00");
  gleich("…preise als Beträge", zeile("preise", weg("preise")).eingetragen, "12 / 15");
  gleich("…ort mit Namen und Stadt", zeile("ort", weg("ort")).eingetragen, "Gasthaus Forstinger, Roitham am Traunfall");
  gleich("…lineupBands mit Bandnamen", zeile("lineupBands", weg("lineupBands")).eingetragen, "The Testers");
  // Dieselbe Darstellung wie im bestätigten Fall — nicht bloß „irgendwie lesbar".
  const richtig = vergleichAlles(auftrag, vollstaendig, k);
  for (const feld of ["beginn", "preise", "ort", "lineupBands"]) {
    gleich(`…${feld} genau wie im Vergleichszweig`, zeile(feld, weg(feld)).eingetragen, richtig.find((b) => b.feld === feld)?.eingetragen);
  }
  const ohneQuelle = eintrag("events", "herbst-2026-10-24", { ...termin.daten!, quellen: [] });
  const pb = auftragFuer([ohneQuelle]).pruefpunkte.find((x) => x.feld === "beginn")!;
  const ohne = vergleiche(pb, weg("beginn"), ohneQuelle, k);
  gleich("ohne Quelle: beginn ist nicht prüfbar", ohne.urteil, "nicht-pruefbar");
  gleich("…und zeigt ebenfalls Ortszeit", ohne.eingetragen, "2026-10-24 20:00");
  const ng = vergleiche(pp("beginn"), { id: id("beginn"), ergebnis: "nicht-gefunden", grund: "nur 31.10." }, termin, k);
  gleich("nicht gefunden: beginn zeigt Ortszeit", ng.eingetragen, "2026-10-24 20:00");
  const ganz = eintrag("events", "herbst-2026-10-24", { ...termin.daten!, ganztaegig: true });
  gleich("ganztägig, nicht erreichbar: nur das Datum", vergleiche(pp("beginn"), weg("beginn"), ganz, k).eingetragen, "2026-10-24");
}
// Andere Sammlungen: kein Code-Vergleich, Mensch sieht hin.
{
  const begriff = eintrag("lexikon", "swing", { name: "Swing", aeraVon: 1930, quellen: [{ url: Q1, felder: ["aeraVon"] }] });
  const p = auftragFuer([begriff]).pruefpunkte[0]!;
  gleich("Lexikon: aeraVon wird gefragt", p.feld, "aeraVon");
  pruefe("…ohne den Wert zu verraten", !JSON.stringify(p).includes("1930"), JSON.stringify(p));
  gleich("…und zur Sichtprüfung gestellt", vergleiche(p, gut(p.id, { text: "Ende der 1920er Jahre" }), begriff, k).urteil, "sichtpruefung");
}

/* --- 4. Der Bericht ----------------------------------------------------- */
{
  const antworten = vollstaendig.map((a) => (a.id === id("beginn") ? gut(id("beginn"), { datum: "2026-10-24", uhrzeit: "21:00" }, "Beginn 21 Uhr") : a));
  const md = alsMarkdown(vergleichAlles(auftrag, antworten, k));
  pruefe("Bericht zählt die Abweichung", md.includes("**1 Abweichung(en)**"), md.slice(0, 300));
  pruefe("…und zeigt sie offen mit beiden Werten", /\*\*Abweichungen\*\*[\s\S]*beginn \| 2026-10-24 20:00 \| 2026-10-24 21:00/.test(md), md);
  pruefe("…mit dem Zitat als Link zur Quelle", md.includes(`[Beginn 21 Uhr](${Q1})`), md);
  pruefe("Bestätigtes steht eingeklappt", /<details><summary>Bestätigt \(5\)<\/summary>/.test(md), md);
}

/* --- 5. Einträge ohne Prüfpunkte (seit 2026-10-03) ---------------------- */
/*
 * Eine Region hat keine belegpflichtigen Felder, also keine Prüfpunkte. Der
 * Bericht darf darüber nicht „0 Abweichungen" sagen. Lebenszeichen: Die
 * Region ist ein vollständiger Eintrag mit Quelle — dass sie keine
 * Prüfpunkte hat, liegt an der Collection, nicht an fehlenden Daten.
 *
 * Bis zum 2026-10-03 stand hier ein Artikel. Seit `kurzbeschreibung` und
 * `faq` bei Artikeln belegpflichtig sind, hat er Prüfpunkte — die
 * Gegenrichtung steht am Ende des Blocks.
 */
{
  const region = eintrag("regionen", "testregion", { name: "Testregion", kurzbeschreibung: "Eine erfundene Region.", quellen: [{ url: Q1, felder: ["kurzbeschreibung"] }] });
  pruefe("Lebenszeichen: die Region hat Daten", region.daten?.name === "Testregion");
  gleich("eine Region hat keine Prüfpunkte", auftragFuer([region]).pruefpunkte.length, 0);
  gleich("…und steht in der Liste ohne Prüfpunkte", ohnePruefpunkte([termin, region]), ["regionen/testregion"]);
  gleich("…der Termin daneben nicht", ohnePruefpunkte([termin]), []);

  const leer = alsMarkdown([], ohnePruefpunkte([region]));
  pruefe("ohne Prüfpunkte heißt es „nicht anwendbar\"", leer.includes("**Nicht anwendbar:** 0 Prüfpunkte"), leer);
  pruefe("…und nicht „0 Abweichung(en)\"", !/Abweichung/.test(leer), leer);
  pruefe("…und nennt den Eintrag", leer.includes("`regionen/testregion`"), leer);

  const gemischt = alsMarkdown(vergleichAlles(auftrag, vollstaendig, k), ohnePruefpunkte([termin, region]));
  pruefe("gemischt: der Termin wird gezählt", gemischt.includes("**0 Abweichung(en)**"), gemischt.slice(0, 300));
  pruefe("…und die Region steht als nicht gegengelesen da", gemischt.includes("nicht gegengelesen: `regionen/testregion`"), gemischt.slice(0, 400));

  // Gegenrichtung: Ein Artikel hat seit dem 2026-10-03 Prüfpunkte für
  // kurzbeschreibung und faq — der Gegenleser ist für Artikel nicht mehr blind.
  const artikel = eintrag("artikel", "petticoat-test", {
    name: "Petticoat tragen",
    kurzbeschreibung: "Einen Petticoat trägt man in der natürlichen Taille.",
    faq: [{ frage: "Darf der Petticoat hervorschauen?", antwort: "Das ist eine Stilfrage." }],
    quellen: [{ url: Q1, felder: ["kurzbeschreibung", "faq"] }],
  });
  gleich("ein Artikel hat Prüfpunkte für kurzbeschreibung und faq", auftragFuer([artikel]).pruefpunkte.map((p) => p.feld), ["kurzbeschreibung", "faq"]);
  pruefe("…ohne den Wert zu verraten", !JSON.stringify(auftragFuer([artikel])).includes("natürlichen Taille"), JSON.stringify(auftragFuer([artikel])));
  gleich("…und steht nicht mehr in der Liste ohne Prüfpunkte", ohnePruefpunkte([artikel]), []);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
