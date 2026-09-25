#!/usr/bin/env -S npx tsx
/**
 * test-vorschlaege.ts — die Vorsortierung der Formulareinsendungen.
 *
 * Jede Behauptung hat ihren Gegenfall: „bekannt" muss an einer Adresse
 * fallen, die nur in der Form abweicht (www, Schrägstrich, utm), und darf an
 * einer wirklich anderen nicht fallen. Dazu ein Lebenszeichen am echten
 * Bestand — sonst wäre „kein Duplikat gefunden" auch dann grün, wenn das
 * Register gar nicht gelesen würde (Lektion 17, Regel 4).
 *
 *   npx tsx scripts/test-vorschlaege.ts
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ladeAlle } from "./_laden";
import {
  normalisiereUrl, registerUrls, postenUrls, beurteile, ausNetlify,
  leseVerzeichnis, schreibeVerzeichnis, VERZEICHNIS, type Einsendung,
} from "./vorschlaege";
import { VORSCHLAG, meldePfad } from "../src/lib/vorschlag";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") => {
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
};
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* --- normalisiereUrl ------------------------------------------------ */
gleich("Schema wird ergänzt", normalisiereUrl("www.Cafecentral.de/konzert/x/"), "https://cafecentral.de/konzert/x");
gleich("http wird https", normalisiereUrl("http://boogie.at/event/a"), "https://boogie.at/event/a");
gleich("Startseite ohne Schrägstrich", normalisiereUrl("https://boogie.at/"), "https://boogie.at");
gleich("Messparameter fallen weg", normalisiereUrl("https://x.de/a?utm_source=fb&fbclid=1"), "https://x.de/a");
gleich("echte Parameter bleiben", normalisiereUrl("https://x.de/a?page=2"), "https://x.de/a?page=2");
gleich("Anker fällt weg", normalisiereUrl("https://x.de/a#termine"), "https://x.de/a");
gleich("javascript: ist ungültig", normalisiereUrl("javascript:alert(1)"), null);
gleich("ftp ist ungültig", normalisiereUrl("ftp://x.de/a"), null);
gleich("Freitext ist ungültig", normalisiereUrl("Konzert am Samstag"), null);
gleich("Host ohne Punkt ist ungültig", normalisiereUrl("https://localhost/a"), null);
gleich("leer ist ungültig", normalisiereUrl("   "), null);

/* --- beurteile ------------------------------------------------------ */
const register = registerUrls([
  { collection: "events", slug: "test-termin", daten: { quellen: [{ url: "https://www.boogie.at/event/party-1" }], links: { website: "https://band.example/" } } },
  { collection: "events", slug: "entwurf-kaputt", daten: null },
]);
const posten = postenUrls("`frei` **Posten.** Gesehen auf https://cafecentral.de/konzert/boppin-b/. Dort steht …");
const kontext = { register, posten, verarbeitet: new Map([["alt-1", { id: "alt-1", am: "2026-09-20", ergebnis: "posten" as const }]]) };
const e = (id: string, url: string): Einsendung => ({ id, erstellt: "2026-09-25T10:00:00Z", url });

gleich("neu bleibt neu", beurteile(e("a", "https://pullmancity.de/events/neu"), kontext).art, "neu");
gleich("Quelle im Register ist bekannt (www/Schrägstrich egal)", beurteile(e("b", "http://boogie.at/event/party-1/"), kontext), { art: "bekannt", wo: "events/test-termin" });
gleich("Link im Register ist bekannt", beurteile(e("c", "band.example"), kontext).art, "bekannt");
gleich("Adresse aus offenem Posten ist bekannt", beurteile(e("d", "https://www.cafecentral.de/konzert/boppin-b?utm_medium=x"), kontext).art, "bekannt");
gleich("Nachbarseite ist NICHT bekannt", beurteile(e("f", "https://boogie.at/event/party-2"), kontext).art, "neu");
gleich("schon verarbeitet bleibt verarbeitet", beurteile(e("alt-1", "https://pullmancity.de/events/neu"), kontext), { art: "verarbeitet", ergebnis: "posten" });
gleich("Unsinn ist ungültig", beurteile(e("g", "kauf jetzt"), kontext).art, "ungueltig");
pruefe("kaputter Eintrag (daten null) bricht nichts", register.size === 2, `${register.size} Adressen`);

/* --- ausNetlify: Feldnamen aus der gemeinsamen Definition ------------ */
const roh = {
  id: "n1", created_at: "2026-09-25T08:00:00Z",
  data: { [VORSCHLAG.felder.url]: "https://x.de/a", [VORSCHLAG.felder.hinweis]: "  Konzert am 9.1.  ", [VORSCHLAG.felder.eintrag]: "", [VORSCHLAG.honigtopf]: "" },
};
gleich("Einsendung wird abgebildet", ausNetlify(roh), { id: "n1", erstellt: "2026-09-25T08:00:00Z", url: "https://x.de/a", hinweis: "Konzert am 9.1.", eintrag: undefined });
gleich("ohne URL-Feld keine Einsendung", ausNetlify({ id: "n2", data: { anderes: "x" } }), null);
gleich("Hinweis wird gekappt", ausNetlify({ id: "n3", data: { url: "https://x.de", hinweis: "x".repeat(500) } })?.hinweis?.length, VORSCHLAG.hinweisMaxLaenge);
gleich("Meldelink kodiert den Eintrag", meldePfad("events", "a-b"), "/vorschlagen/?eintrag=events%2Fa-b");

/* --- Verzeichnis ------------------------------------------------------ */
const tmp = mkdtempSync(path.join(tmpdir(), "vorschlaege-"));
try {
  const datei = path.join(tmp, "v.json");
  schreibeVerzeichnis(new Map([["z", { id: "z", am: "2026-09-26", ergebnis: "verworfen" }], ["y", { id: "y", am: "2026-09-25", ergebnis: "posten" }]]), datei);
  gleich("Verzeichnis übersteht Hin und Zurück, sortiert", [...leseVerzeichnis(datei).keys()], ["y", "z"]);
  gleich("fehlendes Verzeichnis ist leer", leseVerzeichnis(path.join(tmp, "gibtsnicht.json")).size, 0);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
pruefe("echtes Verzeichnis ist lesbar", (() => { try { leseVerzeichnis(VERZEICHNIS); return true; } catch { return false; } })());

/* --- Lebenszeichen am echten Bestand --------------------------------- */
const echt = registerUrls(ladeAlle());
pruefe("echter Bestand liefert Adressen", echt.size > 20, `${echt.size}`);
pruefe("echter Bestand kennt den Gig Guide", echt.has("https://rockin-wildcat.com/rwc/guide"), "Rockin' Wildcat fehlt");

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
