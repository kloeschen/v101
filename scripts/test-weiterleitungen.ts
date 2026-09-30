#!/usr/bin/env -S npx tsx
/**
 * test-weiterleitungen.ts — die Regeln für die alten Pfade von v101.de:
 * der Abgleich (`check-weiterleitungen`) und die automatischen 301
 * (`schreibe-weiterleitungen`).
 *
 * Jede Fehlerart hat einen Fall, an dem sie anschlagen muss, und den
 * Gegenfall, an dem sie still bleibt. Der Build ist ein Wegwerfverzeichnis
 * mit genau den Seiten, die der Fall braucht. Dazu ein Lebenszeichen an der
 * echten Regeldatei: Sie trifft alte Pfade mit beiden Status — sonst wäre
 * „kein Fehler" auch das Ergebnis einer Datei, die nichts trifft.
 *
 *   npx tsx scripts/test-weiterleitungen.ts
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  leseRegeln, leseAltliste, trifft, ersteRegel, beurteile, ALTLISTE,
} from "./check-weiterleitungen";
import { automatischeRegeln, slugForm, schluessel, alsText, ZUORDNUNG } from "./schreibe-weiterleitungen";
import { ladeAlle } from "./_laden";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") => {
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
};
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* --- trifft: Netlifys Mustersprache ---------------------------------- */
pruefe("fester Pfad trifft sich selbst", trifft("/c/korsett", "/c/korsett"));
pruefe("Schrägstrich am Ende zählt nicht", trifft("/c/korsett", "/c/korsett/"));
pruefe("fester Pfad trifft keinen tieferen", !trifft("/c/korsett", "/c/korsett/ctag/rot/"));
pruefe("fester Pfad trifft kein Präfix", !trifft("/c/korsett", "/c/korsetts/"));
pruefe("Platzhalter steht für einen Abschnitt", trifft("/c/:kat/ctag/*", "/c/hemd/ctag/rot/"));
pruefe("Platzhalter steht nicht für zwei", !trifft("/c/:kat/ctag/*", "/c/hemd/kurz/ctag/rot/"));
pruefe("Stern trifft beliebig tief", trifft("/wp-content/*", "/wp-content/themes/x/style.css"));
pruefe("Stern trifft auch den leeren Rest", trifft("/wp-json/*", "/wp-json/"));
pruefe("Stern trifft keinen anderen Anfang", !trifft("/wp-json/*", "/wp-jsonx/"));

const regeln = leseRegeln(`
# Kommentar
/c/korsett      /lexikon/korsett/   301
/c/:kat/ctag/*  /404.html           410   # Kommentar am Zeilenende
`);
gleich("Kommentare und Leerzeilen fallen weg", regeln.map((r) => [r.von, r.nach, r.status]), [
  ["/c/korsett", "/lexikon/korsett/", 301],
  ["/c/:kat/ctag/*", "/404.html", 410],
]);
gleich("Zeilennummer zeigt auf die Datei", regeln.map((r) => r.zeile), [3, 4]);
gleich("die erste passende Regel gewinnt", ersteRegel(regeln, "/c/korsett/")?.status, 301);
gleich("Altliste: Kommentare fallen weg", leseAltliste("# x\n/a/\n\n/b\n"), ["/a/", "/b"]);

/* --- beurteile: gegen einen Wegwerf-Build ----------------------------- */
const dist = mkdtempSync(path.join(tmpdir(), "weiterleitungen-"));
const seite = (p: string) => {
  mkdirSync(path.join(dist, p), { recursive: true });
  writeFileSync(path.join(dist, p, "index.html"), "<html></html>");
};
seite("");
seite("lexikon/korsett");
seite("impressum");
writeFileSync(path.join(dist, "404.html"), "<html></html>");

const alt = ["/c/korsett/", "/c/hemd/ctag/rot/", "/c/hemd/", "/impressum/"];
const gut = beurteile(regeln, alt, dist);
gleich("gute Regeln: kein Fehler", gut.fehler, []);
gleich("gute Regeln: je Schicksal gezählt", gut.zaehlung, { weiter: 1, weg: 1, neu: 1, offen: 1 });
gleich("offen ist, was keine Regel und keine Seite hat", gut.offen, ["/c/hemd/"]);

const mit = (text: string, altliste = alt) => beurteile(leseRegeln(text), altliste, dist).fehler;
const schlaegtAn = (name: string, text: string, muster: RegExp, altliste = alt) => {
  const f = mit(text, altliste);
  pruefe(name, f.some((x) => muster.test(x)), JSON.stringify(f));
};

schlaegtAn("301 auf eine Seite, die der Build nicht hat",
  "/c/korsett /lexikon/mieder/ 301\n/c/:kat/ctag/* /404.html 410", /Ziel \/lexikon\/mieder\/ hat im Build keine Seite/);
schlaegtAn("301-Ziel ohne Schrägstrich am Ende",
  "/c/korsett /lexikon/korsett 301\n/c/:kat/ctag/* /404.html 410", /ohne Schrägstrich/);
schlaegtAn("410 ohne Fehlerseite im Build",
  "/c/korsett /lexikon/korsett/ 301\n/c/:kat/ctag/* /410.html 410", /Fehlerseite \/410\.html fehlt/);
schlaegtAn("anderer Status als 301 oder 410",
  "/c/korsett /lexikon/korsett/ 302\n/c/:kat/ctag/* /404.html 410", /Status 302/);
schlaegtAn("feste Regel über einer Seite des Builds",
  "/c/korsett /lexikon/korsett/ 301\n/c/:kat/ctag/* /404.html 410\n/impressum /404.html 410", /trifft eine Seite des Builds/);
schlaegtAn("Muster-Regel, die einen gebauten alten Pfad trifft",
  "/c/korsett /lexikon/korsett/ 301\n/c/:kat/ctag/* /404.html 410\n/:seite /404.html 410", /trifft \/impressum\/, und den gibt es im Build/);
schlaegtAn("Regel ohne alten Pfad dahinter",
  "/c/korsett /lexikon/korsett/ 301\n/c/:kat/ctag/* /404.html 410\n/gibtsnicht /404.html 410", /\/gibtsnicht\): trifft keinen alten Pfad/);
schlaegtAn("Regel, die hinter einer früheren Regel verschwindet, ist tot",
  "/c/* /404.html 410\n/c/korsett /lexikon/korsett/ 301", /\/c\/korsett\): trifft keinen alten Pfad/);
rmSync(dist, { recursive: true, force: true });

/* --- automatische 301: die Namensregel ------------------------------ */
gleich("Slug-Form schreibt Umlaute aus", slugForm("Strumpfhaltergürtel"), "strumpfhaltergaertel".replace("aertel", "uertel"));
gleich("Slug-Form macht Leerzeichen zu Strichen", slugForm("Pork Pie Hat"), "pork-pie-hat");
gleich("Schlüssel einer Kategorie", schluessel("/c/korsett/"), "korsett");
gleich("Schlüssel einer Unterkategorie", schluessel("/c/hosen/capri/"), "capri");
gleich("Schlüssel einer Themenseite", schluessel("/thema/pin-up/"), "pin-up");
gleich("Kombination hat keinen Schlüssel", schluessel("/c/hemd/ctag/rot/"), null);
gleich("Folgeseite hat keinen Schlüssel", schluessel("/jahrzehnt/50s/page/2/"), null);
gleich("fremder Bereich hat keinen Schlüssel", schluessel("/brand/normani"), null);

const begriffe = [
  { slug: "korsett", aliases: ["Corset"] },
  { slug: "pork-pie", aliases: ["Pork Pie Hat"] },
  { slug: "neu", aliases: [] },
  { slug: "a", aliases: ["Doppelt"] },
  { slug: "b", aliases: ["Doppelt"] },
];
const gebautFix = new Set(["/lexikon/korsett/", "/lexikon/pork-pie/", "/lexikon/a/", "/lexikon/b/", "/lexikon/bleistiftrock/"]);
const auto = automatischeRegeln(
  ["/c/korsett/", "/thema/corset/", "/c/pork-pie/jahrz/40s/", "/c/neu/", "/thema/doppelt/", "/thema/pencil/", "/c/petticoats/", "/c/korsett"],
  begriffe,
  (p) => gebautFix.has(p),
);
gleich("gleicher Slug und gleicher Alias leiten weiter, Zuordnung auch", auto.regeln.map((r) => [r.von, r.nach]), [
  ["/c/korsett", "/lexikon/korsett/"],
  ["/thema/corset", "/lexikon/korsett/"],
  ["/thema/pencil", "/lexikon/bleistiftrock/"],
]);
pruefe("Kombination leitet nie weiter, auch bei passendem Namen", !auto.regeln.some((r) => r.von.includes("jahrz")));
pruefe("nicht gebautes Ziel leitet nicht weiter (bleibt 404)", !auto.regeln.some((r) => r.von === "/c/neu"));
gleich("Zuordnung ohne gebautes Ziel wartet", auto.wartend, ["/c/petticoats → /lexikon/petticoat/"]);
gleich("mehrdeutiger Name leitet nicht weiter", auto.mehrdeutig, ["/thema/doppelt → a, b"]);
pruefe("derselbe Pfad mit und ohne Schrägstrich gibt eine Regel", auto.regeln.filter((r) => r.von === "/c/korsett").length === 1);
const text = alsText(auto.regeln);
gleich("der Text ist als Regeldatei lesbar", leseRegeln(text).map((r) => [r.von, r.status]), [
  ["/c/korsett", 301], ["/thema/corset", 301], ["/thema/pencil", 301],
]);
for (const [von, slug] of Object.entries(ZUORDNUNG)) {
  pruefe(`Zuordnung ${von} ist ein alter Pfad`, leseAltliste(readFileSync(ALTLISTE, "utf8")).some((p) => p.replace(/\/$/, "") === von));
  pruefe(`Zuordnung ${von} zeigt auf einen Lexikoneintrag`, ladeAlle({ collection: "lexikon" }).some((e) => e.slug === slug));
}

/* --- Lebenszeichen: die echten Daten ---------------------------------- */
// Die Namensregel muss genau die Weiterleitungen ergeben, die bis zum
// 2026-09-29 von Hand in public/_redirects standen — plus thema/pencil
// (Entscheidung Markus) und c/huete/pork-pie (Unterkategorie, von Hand
// übersehen, von der Namensregel gefunden) — und dazu die der Entwürfe, deren
// Name oder Alias ein alter Pfad ist.
//
// ZWEI BLICKE, weil die Freigabe den Stand ändert: Bis zum 2026-09-30
// verglich der Test den freigegebenen Stand mit einer festen Liste. Dann
// brach jede Freigabe eines Begriffs mit altem Pfad den Freigeben-Workflow
// (Lauf 11, Gingham & Co.) — die Liste war nur von Hand nachzutragen, und
// der Workflow kann das nicht. Deshalb:
//   1. Das Gesamtbild — alle Einträge, als wären sie freigegeben — steht
//      fest in der Liste. Es ändert sich nur, wenn ein Eintrag entsteht oder
//      einen Alias bekommt, also in einem PR, der hier nachtragen kann.
//   2. Der freigegebene Stand ist genau der Teil des Gesamtbilds, dessen
//      Ziel freigegeben ist. Das hängt vom Status ab, aber an keiner Liste.
const echtAlt = leseAltliste(readFileSync(ALTLISTE, "utf8"));
const lexikon = ladeAlle({ collection: "lexikon" }).filter((e) => !e.slug.startsWith("_"));
const echtEintraege = lexikon.map((e) => ({ slug: e.slug, aliases: ((e.roh.aliases as string[] | undefined) ?? []).map(String) }));
const alleZiele = new Set(lexikon.map((e) => `/lexikon/${e.slug}/`));
const frei = new Set(lexikon.filter((e) => e.roh.status === "veroeffentlicht").map((e) => `/lexikon/${e.slug}/`));
const alsZeilen = (r: { regeln: { von: string; nach: string }[] }) => r.regeln.map((x) => `${x.von} → ${x.nach}`).sort();
const gesamt = automatischeRegeln(echtAlt, echtEintraege, (p) => alleZiele.has(p));
const echt = automatischeRegeln(echtAlt, echtEintraege, (p) => frei.has(p));
pruefe("Altliste ist gelesen (mindestens 1000 Pfade)", echtAlt.length >= 1000, String(echtAlt.length));
gleich("echte Daten, alle Einträge als freigegeben gedacht: die erwarteten automatischen 301", alsZeilen(gesamt), [
  "/c/bleistiftrock → /lexikon/bleistiftrock/",
  "/c/huete/pork-pie → /lexikon/pork-pie/",
  "/c/korsett → /lexikon/korsett/",
  "/c/petticoats → /lexikon/petticoat/",
  "/c/pomade → /lexikon/pomade/",
  "/c/strapsguertel → /lexikon/strapsguertel/",
  "/c/taillenmieder → /lexikon/taillenmieder/",
  "/thema/gingham → /lexikon/gingham/",
  "/thema/hahnentritt → /lexikon/hahnentritt/",
  "/thema/houndstooth → /lexikon/hahnentritt/",
  "/thema/nadelstreifen → /lexikon/nadelstreifen/",
  "/thema/pencil → /lexikon/bleistiftrock/",
  "/thema/polka-dots → /lexikon/polka-dots/",
  "/thema/rockabilly → /lexikon/rockabilly/",
]);
gleich("echte Daten, alle Einträge als freigegeben gedacht: nichts mehrdeutig", gesamt.mehrdeutig, []);
gleich(
  "echte Daten: der freigegebene Stand ist genau der Teil des Gesamtbilds mit freigegebenem Ziel",
  alsZeilen(echt),
  alsZeilen({ regeln: gesamt.regeln.filter((r) => frei.has(r.nach)) }),
);
pruefe("echte Daten: der freigegebene Stand leitet überhaupt weiter", echt.regeln.length > 0, String(echt.regeln.length));
gleich("echte Daten: nichts mehrdeutig", echt.mehrdeutig, []);
const statisch = leseRegeln(readFileSync(path.join(path.dirname(ALTLISTE), "../../public/_redirects"), "utf8"));
pruefe("public/_redirects hat 410-Regeln", statisch.some((r) => r.status === 410));
pruefe("public/_redirects hat keine 301 mehr (die schreibt der Build)", !statisch.some((r) => r.status === 301));
pruefe("eine echte 410 trifft einen alten Pfad", echtAlt.some((p) => ersteRegel(statisch, p)?.status === 410));

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
