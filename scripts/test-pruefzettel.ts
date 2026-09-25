#!/usr/bin/env -S npx tsx
/**
 * test-pruefzettel.ts — jedes Signal des Prüfzettels, mit Gegenfall.
 *
 * Ein Signal, das nie anschlägt, ist so wertlos wie eines, das immer
 * anschlägt: Im ersten Fall übersieht der Zettel die Stelle, im zweiten
 * lernt der Leser, ihn zu überspringen. Deshalb hat jedes Signal einen Fall,
 * in dem es feuern muss, und einen, in dem es schweigen muss. Dazu ein
 * Lebenszeichen am echten Bestand (Lektion 17, Regel 4).
 *
 *   npx tsx scripts/test-pruefzettel.ts
 */
import { ladeAlle, type GeladenerEintrag } from "./_laden";
import { zettelFuer, alsMarkdown, belegeFuer, NAH_TAGE, type Kontext } from "./pruefzettel";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") => {
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

const JETZT = new Date("2026-09-25T10:00:00+02:00");
const ORT: GeladenerEintrag = {
  datei: "x", collection: "locations", slug: "testhalle", roh: {}, body: "",
  daten: { name: "Testhalle", adresse: { strasse: "Hauptstraße 1", plz: "10115", ort: "Berlin" }, typ: "club",
    quellen: [{ url: "https://testhalle.example/", felder: ["adresse", "typ"], art: "offiziell", abgerufenAm: new Date("2026-09-24") }] },
};
const kontext = (neu: string[] = []): Kontext => ({
  alle: new Map([["locations/testhalle", ORT]]), neu: new Set(neu), jetzt: JETZT,
});

/** Ein unauffälliger Termin: zwei Quellen, eine offiziell, Genres, frische Abrufe, weit weg. */
const termin = (aenderung: Record<string, any> = {}): GeladenerEintrag => ({
  datei: "y", collection: "events", slug: "testabend", roh: {}, body: "",
  daten: {
    name: "Testabend", beginn: new Date("2026-12-05T20:00:00+01:00"), ort: "testhalle",
    eintritt: "beziffert", preise: [{ bezeichnung: "Abendkasse", betrag: 15, waehrung: "EUR" }],
    genres: ["rockabilly"], redaktionsnotiz: "Alles übereinstimmend.",
    quellen: [
      { url: "https://testhalle.example/programm", titel: "Programm", felder: ["beginn", "ort", "preise"], art: "offiziell", abgerufenAm: new Date("2026-09-24") },
      { url: "https://kalender.example/x", titel: "Kalender", felder: ["beginn", "ort"], art: "aggregator", abgerufenAm: new Date("2026-09-24") },
    ],
    ...aenderung,
  },
});
const signale = (e: GeladenerEintrag, k = kontext()) => zettelFuer(e, k).signale.join(" | ");

/* --- Grundfall -------------------------------------------------------- */
const ruhig = zettelFuer(termin(), kontext());
pruefe("unauffälliger Termin hat keine Signale", ruhig.signale.length === 0, ruhig.signale.join(" | "));
pruefe("Beginn mit Wochentag in Berliner Zeit", ruhig.fakten[0]?.wert === "Sa., 05.12.2026, 20:00 Uhr", ruhig.fakten[0]?.wert);
pruefe("Ort mit Adresse aufgelöst", ruhig.fakten[1]?.wert === "Testhalle, Hauptstraße 1, 10115 Berlin", ruhig.fakten[1]?.wert);
pruefe("Preis lesbar", ruhig.fakten[2]?.wert === "Abendkasse 15 EUR", ruhig.fakten[2]?.wert);
pruefe("Beleg je Fakt verlinkt", ruhig.fakten[0]?.belege.length === 2);

/* --- Signale, je mit Gegenfall --------------------------------------- */
const nurAggregator = termin({
  quellen: [{ url: "https://kalender.example/x", felder: ["beginn", "ort", "preise"], art: "aggregator", abgerufenAm: new Date("2026-09-24") }],
});
pruefe("nur Aggregator → Signal", /Beginn\*\* steht nur in aggregator/.test(signale(nurAggregator)), signale(nurAggregator));
pruefe("nur Aggregator → auch „einzige Quelle“", /einzigen Quelle/.test(signale(nurAggregator)));
pruefe("Gegenfall: offizielle Quelle daneben → kein Aggregator-Signal", !/nur in/.test(signale(termin())));

const nah = termin({ beginn: new Date("2026-10-03T20:00:00+02:00") });
pruefe(`Termin unter ${NAH_TAGE} Tagen → eilt`, /in \*\*8 Tagen\*\*/.test(signale(nah)), signale(nah));
pruefe("Gegenfall: Termin in 71 Tagen → eilt nicht", !/eilt/.test(signale(termin())));
pruefe("vergangener Termin → Signal", /Vergangenheit/.test(signale(termin({ beginn: new Date("2026-09-20T20:00:00+02:00") }))));

pruefe("neuer Ort → Signal", /Ort ist neu/.test(signale(termin(), kontext(["locations/testhalle"]))));
pruefe("Gegenfall: bestehender Ort → kein Signal", !/Ort ist neu/.test(signale(termin())));

pruefe("keine Genres → Signal", /Keine Genres/.test(signale(termin({ genres: [] }))));

for (const notiz of ["Die Quellen widersprechen sich.", "JSON-LD weicht um zwei Stunden ab.", "Der Versatz ist systematisch.", "Angaben nicht einheitlich."]) {
  pruefe(`Abweichung erkannt: „${notiz}“`, /Abweichung zwischen Quellen/.test(signale(termin({ redaktionsnotiz: notiz }))));
}
pruefe("Gegenfall: neutrale Notiz → kein Abweichungssignal", !/Abweichung/.test(signale(termin({ redaktionsnotiz: "Preis aus der Ankündigung." }))));

const alt = termin({ quellen: termin().daten!.quellen.map((q: any) => ({ ...q, abgerufenAm: new Date("2026-09-01") })) });
pruefe("alte Quellen → Signal", /2 Quelle\(n\) vor mehr als 14 Tagen/.test(signale(alt)), signale(alt));

const ohneBeleg = termin({ quellen: [{ url: "https://x.example", felder: ["ort"], art: "offiziell", abgerufenAm: new Date("2026-09-24") }] });
pruefe("Fakt ohne Beleg → Signal", /Beginn\*\* ist von keiner Quelle gedeckt/.test(signale(ohneBeleg)), signale(ohneBeleg));

/* --- Läden & Studios -------------------------------------------------- */
const laden = (quellen: any[]): GeladenerEintrag => ({
  datei: "z", collection: "adressen", slug: "testbarber", roh: {}, body: "",
  daten: { name: "Testbarber", typ: "barber", schwerpunkte: ["Pompadour", "Flat Top"],
    adresse: { strasse: "Teststraße 1", plz: "10115", ort: "Berlin" }, quellen },
});
const eigen = { url: "https://barber.example/", felder: ["typ", "schwerpunkte", "adresse"], art: "offiziell", abgerufenAm: new Date("2026-09-24") };
const lz = zettelFuer(laden([eigen]), kontext());
pruefe("Laden: Schwerpunkte als harter Fakt", lz.fakten.find((f) => f.name === "Schwerpunkte")?.wert === "Pompadour, Flat Top", JSON.stringify(lz.fakten));
pruefe("Laden: Adresse als harter Fakt", lz.fakten.find((f) => f.name === "Adresse")?.wert === "Teststraße 1, 10115 Berlin");
const lzVerz = zettelFuer(laden([{ ...eigen, art: "aggregator" }]), kontext());
pruefe("Laden: Schwerpunkt nur im Verzeichnis → Signal", lzVerz.signale.some((s) => /Schwerpunkte\*\* steht nur in aggregator/.test(s)), lzVerz.signale.join(" | "));
pruefe("Gegenfall: Laden mit eigener Seite → kein Schwerpunkt-Signal", !lz.signale.some((s) => /Schwerpunkte/.test(s)), lz.signale.join(" | "));

/* --- Darstellung ------------------------------------------------------- */
const md = alsMarkdown([zettelFuer(nah, kontext()), ruhig]);
pruefe("Auffällige stehen vor Unauffälligen", md.indexOf("in **8 Tagen**") < md.indexOf("<details>"), md);
pruefe("Unauffällige eingeklappt, Einzahl korrekt", md.includes("1 unauffälliger Eintrag"));
pruefe("Aggregator in der Quellenspalte markiert", md.includes("_(aggregator)_"));
pruefe("leere Auswahl sagt das", alsMarkdown([]).includes("Keine Inhalte zu prüfen"));

/* --- Lebenszeichen am echten Bestand ---------------------------------- */
const echt = ladeAlle({ collection: "events" }).filter((e) => e.daten?.beginn && (e.daten.quellen ?? []).length);
const alle = new Map(ladeAlle().map((e) => [`${e.collection}/${e.slug}`, e]));
const z = echt.map((e) => zettelFuer(e, { alle, neu: new Set(), jetzt: JETZT }));
pruefe("echter Bestand: jeder Termin hat einen Beginn mit Beleg", z.length > 5 && z.every((x) => (x.fakten.find((f) => f.name === "Beginn")?.belege.length ?? 0) > 0),
  z.filter((x) => !(x.fakten.find((f) => f.name === "Beginn")?.belege.length)).map((x) => x.pfad).join(", "));
pruefe("echter Bestand: Orte werden aufgelöst", z.some((x) => /,\s*\d{4,5} /.test(x.fakten.find((f) => f.name === "Ort")?.wert ?? "")));
pruefe("belegeFuer liest echte Felder", belegeFuer(echt[0].daten!, "beginn").length > 0);

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
