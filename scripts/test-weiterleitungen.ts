#!/usr/bin/env -S npx tsx
/**
 * test-weiterleitungen.ts — der Abgleich von `public/_redirects` mit den
 * alten Pfaden von v101.de und mit dem Build.
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
  leseRegeln, leseAltliste, trifft, ersteRegel, beurteile, REGELDATEI, ALTLISTE,
} from "./check-weiterleitungen";

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

/* --- Lebenszeichen: die echten Dateien ------------------------------- */
const echt = leseRegeln(readFileSync(REGELDATEI, "utf8"));
const echtAlt = leseAltliste(readFileSync(ALTLISTE, "utf8"));
pruefe("Altliste ist gelesen (mindestens 1000 Pfade)", echtAlt.length >= 1000, String(echtAlt.length));
pruefe("die echte Regeldatei hat 301-Regeln", echt.some((r) => r.status === 301));
pruefe("die echte Regeldatei hat 410-Regeln", echt.some((r) => r.status === 410));
pruefe("eine echte 301 trifft einen alten Pfad",
  echtAlt.some((p) => ersteRegel(echt, p)?.status === 301));
pruefe("eine echte 410 trifft einen alten Pfad",
  echtAlt.some((p) => ersteRegel(echt, p)?.status === 410));

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
