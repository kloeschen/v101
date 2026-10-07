#!/usr/bin/env -S npx tsx
/**
 * test-warteschlange.ts — die Warteschlange und die Auto-Merge-Grenze.
 *
 * Beide Regeln sind neu am 2026-09-20 und beide entscheiden etwas, das ohne
 * menschliche Augen passiert: welche Aufgabe ein unbeaufsichtigter Lauf
 * nimmt, und was er ohne Prüfung mergen darf. Für beide gilt Regel 4 —
 * jede Prüfung braucht ihren Negativtest, und jede Abwesenheit braucht ein
 * positives Lebenszeichen daneben (Lektion 19).
 *
 * Seit dem 2026-10-07 liegt jeder Posten in einer eigenen Datei unter
 * `docs/posten/`. Geprüft wird gegen Zeichenketten im Testharnisch, NICHT
 * gegen das echte Verzeichnis. Ein Test, der an den echten Dateien hängt,
 * schlägt an, sobald jemand einen Posten erledigt — und wird dann
 * abgeschaltet statt gelesen. Die echten Dateien prüft
 * `npm run warteschlange:check` in der Kette, das ist die andere Frage.
 *
 * WARUM HIER UEBERALL `?.` UND `?? ""` STEHT: Der erste Mutationsbeleg
 * dieser Datei ist an ihr selbst gescheitert. `u.gruende[0].grund` warf eine
 * TypeError, sobald die mutierte Regel eine leere Liste lieferte — der Test
 * STUERZTE AB, statt FEHLZUSCHLAGEN, und der Beleg sah null gefallene
 * Behauptungen. Ein Absturz ist kein Fehlschlag.
 *
 *   npx tsx scripts/test-warteschlange.ts
 */

import { lies, liesDatei, belegte, waehle, istLexikon, platz, OBERGRENZE, type Rohdatei, type Zweigstand } from "./warteschlange";
import { beurteile, MENSCHENPFLICHTIG } from "./automerge-erlaubt";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/** Eine Postendatei, wie ein Lauf sie schreibt. */
const P = (name: string, marke: string, titel: string, angelegt = "2026-10-01", auftrag = "Der Auftrag."): Rohdatei => ({
  name,
  text: `---\nmarke: ${marke}\ntitel: "${titel}"\nangelegt: ${angelegt}\n---\n\n${auftrag}\n`,
});

/* ------------------------------------------------------------------ */
/* 1. Die Warteschlange liest Postendateien                            */
/* ------------------------------------------------------------------ */

{
  const b = lies([
    P("a.md", "frei", "Erster Posten.", "2026-10-05", "Text dazu."),
    P("b.md", "mensch", "Zweiter Posten", "2026-10-04"),
    P("c.md", "frei", "Dritter Posten", "2026-10-03"),
  ]);
  gleich("drei Posten erkannt", b.posten.length, 3);
  gleich("Marken richtig gelesen", b.posten.map((p) => p.marke), ["frei", "mensch", "frei"]);
  gleich("Titel ohne Schlusspunkt", b.posten[0]?.titel, "Erster Posten");
  gleich("nichts Unlesbares gemeldet", b.maengel.length, 0);
  pruefe("der Auftrag trägt Titel und Text", b.posten[0]?.text === "**Erster Posten.**\nText dazu.", b.posten[0]?.text ?? "kein Posten");
  gleich("die Datei ist die Identität", b.posten[0]?.datei, "a.md");
}

{
  // DIE REIHENFOLGE. Vorher galt die Reihenfolge der Absätze, und der
  // Suchlauf fügte oben ein — neuester zuerst. Ein Verzeichnis hat keine
  // Reihenfolge; `angelegt` übernimmt sie. Die Dateinamen sind hier mit
  // Absicht gegenläufig zum Datum gewählt: Eine Sortierung nach Namen
  // (die Reihenfolge, in der readdir sie meist liefert) fiele auf.
  const b = lies([
    P("aaa-alt.md", "frei", "Alt", "2026-09-30"),
    P("zzz-neu.md", "frei", "Neu", "2026-10-06"),
    P("mmm-mitte.md", "frei", "Mitte", "2026-10-02"),
  ]);
  gleich("neuester Posten zuerst, nicht nach Dateiname", b.posten.map((p) => p.titel), ["Neu", "Mitte", "Alt"]);
}

{
  // Bei gleichem Tag entscheidet der Dateiname — sonst hinge die
  // Reihenfolge an der Laune des Dateisystems.
  const b = lies([P("b.md", "frei", "B", "2026-10-04"), P("a.md", "frei", "A", "2026-10-04")]);
  gleich("gleicher Tag: nach Dateiname", b.posten.map((p) => p.datei), ["a.md", "b.md"]);
}

{
  // VORRANG (2026-10-07). Ein Suchlauf schreibt alle Posten mit demselben
  // Tag; `vorrang` ordnet sie innerhalb des Tages. Die Dateinamen laufen
  // absichtlich gegen den Vorrang, sonst bestünde der Test auch über den
  // Dateinamen (Regel 4).
  const V = (name: string, angelegt: string, vorrang?: number): Rohdatei => ({
    name,
    text: `---\nmarke: frei\ntitel: ${name}\nangelegt: ${angelegt}\n${vorrang ? `vorrang: ${vorrang}\n` : ""}---\n\nText.\n`,
  });
  const b = lies([
    V("a-fern.md", "2026-10-04", 3),
    V("b-ohne.md", "2026-10-04"),
    V("c-mitte.md", "2026-10-04", 2),
    V("z-nah.md", "2026-10-04", 1),
    V("y-neuer.md", "2026-10-05", 9),
  ]);
  gleich(
    "gleicher Tag: nach vorrang, ohne Feld zuletzt; ein neuerer Tag schlägt jeden Vorrang",
    b.posten.map((p) => p.datei),
    ["y-neuer.md", "z-nah.md", "c-mitte.md", "a-fern.md", "b-ohne.md"],
  );
  gleich("vorrang wird als Zahl gelesen", b.posten.find((p) => p.datei === "c-mitte.md")?.vorrang, 2);
  gleich("ohne Feld kein vorrang", "vorrang" in (b.posten.find((p) => p.datei === "b-ohne.md") ?? {}), false);
  // Zweistellig: Als Zeichenkette verglichen käme „10" vor „9".
  const z = lies([V("a.md", "2026-10-04", 10), V("b.md", "2026-10-04", 9)]);
  gleich("vorrang 9 vor 10 (Zahl, nicht Zeichenkette)", z.posten.map((p) => p.datei), ["b.md", "a.md"]);
}

{
  // README und Dateien mit `_` sind keine Posten, ebensowenig Nicht-Markdown.
  const b = lies([
    { name: "README.md", text: "# Posten\n\nKein Kopf." },
    { name: "_vorlage.md", text: "---\nmarke: frei\n---\n" },
    { name: "notiz.txt", text: "irgendwas" },
    P("echt.md", "frei", "Echt"),
  ]);
  gleich("README, _vorlage und .txt werden übergangen", b.posten.map((p) => p.datei), ["echt.md"]);
  gleich("und erzeugen keine Mängel", b.maengel.length, 0);
}

{
  // Titel mit Doppelpunkt, Backticks und Apostroph — so sehen echte aus.
  const b = lies([
    P("x.md", "frei", "Boppin'B, Tour: 6 Termine anlegen (31.10.2026)"),
    { name: "y.md", text: "---\r\nmarke: mensch\r\ntitel: Tanztermine: `genres` nachtragen\r\nangelegt: 2026-10-03\r\n---\r\n\r\nText.\r\n" },
  ]);
  gleich("Doppelpunkt im Titel in Anführungszeichen", b.posten.find((p) => p.datei === "x.md")?.titel, "Boppin'B, Tour: 6 Termine anlegen (31.10.2026)");
  gleich("Doppelpunkt ohne Anführungszeichen, Windows-Zeilenenden", b.posten.find((p) => p.datei === "y.md")?.titel, "Tanztermine: `genres` nachtragen");
  gleich("beide lesbar", b.maengel.length, 0);
}

/* ------------------------------------------------------------------ */
/* 2. Eine kaputte Datei fällt auf — das ist der Kern                  */
/* ------------------------------------------------------------------ */

/*
 * Jede Zeile hier ist ein Weg, auf dem ein Posten stumm aus der
 * Warteschlange fallen könnte. Daneben steht jeweils der lesbare Posten,
 * damit „gemeldet" nicht auch von einer Regel erfüllt wird, die alles
 * meldet (Lektion 17).
 */
const KAPUTT: [string, string, RegExp][] = [
  ["ohne-marke.md", "---\ntitel: X\nangelegt: 2026-10-01\n---\n\nText.\n", /keine Marke/],
  ["falsche-marke.md", "---\nmarke: Frei\ntitel: X\nangelegt: 2026-10-01\n---\n\nText.\n", /unbekannte Marke/],
  ["ohne-titel.md", "---\nmarke: frei\nangelegt: 2026-10-01\n---\n\nText.\n", /kein Titel/],
  ["ohne-tag.md", "---\nmarke: frei\ntitel: X\n---\n\nText.\n", /angelegt/],
  ["falscher-tag.md", "---\nmarke: frei\ntitel: X\nangelegt: 7.10.2026\n---\n\nText.\n", /angelegt/],
  ["ohne-kopf.md", "`frei` **Alter Stil.** Ein Absatz wie früher in OFFENE-PUNKTE.\n", /kein Kopf/],
  ["offener-kopf.md", "---\nmarke: frei\ntitel: X\nangelegt: 2026-10-01\n\nText.\n", /schließendes/],
  ["vorrang-null.md", "---\nmarke: frei\ntitel: X\nangelegt: 2026-10-01\nvorrang: 0\n---\n\nText.\n", /vorrang/],
  ["vorrang-text.md", "---\nmarke: frei\ntitel: X\nangelegt: 2026-10-01\nvorrang: hoch\n---\n\nText.\n", /vorrang/],
  ["ohne-auftrag.md", "---\nmarke: frei\ntitel: X\nangelegt: 2026-10-01\n---\n\n", /kein Auftragstext/],
];
for (const [name, text, grund] of KAPUTT) {
  const b = lies([{ name, text }, P("gut.md", "frei", "Gut")]);
  gleich(`${name}: gemeldet`, b.maengel.map((m) => m.datei), [name]);
  pruefe(`${name}: mit passendem Grund`, grund.test(b.maengel[0]?.grund ?? ""), b.maengel[0]?.grund ?? "keiner");
  gleich(`${name}: kein Posten daraus, der gute daneben bleibt`, b.posten.map((p) => p.datei), ["gut.md"]);
}

{
  // Ein ungeschütztes YAML-Datum würde ein Parser als Zeitpunkt in UTC
  // lesen (Regel 1). Hier bleibt es eine Zeichenkette.
  const x = liesDatei(P("t.md", "frei", "T", "2026-10-07"));
  gleich("angelegt bleibt der Kalendertag als Zeichenkette", "angelegt" in x ? x.angelegt : x, "2026-10-07");
}

/* ------------------------------------------------------------------ */
/* 3. Die Auto-Merge-Grenze                                            */
/* ------------------------------------------------------------------ */

{
  const u = beurteile(["scripts/validate-content.ts", "src/lib/datum.ts", "README.md"]);
  pruefe("reine Code- und Doku-Änderungen dürfen mergen", u.erlaubt, JSON.stringify(u.gruende));
  gleich("und zwar ohne Einwand", u.gruende.length, 0);
  gleich("geprüft wurden alle drei", u.geprueft, 3);
}

{
  const u = beurteile(["scripts/validate-content.ts", "src/content/lexikon/petticoat.md"]);
  pruefe("eine einzige Inhaltsdatei genügt zum Stopp", !u.erlaubt, JSON.stringify(u));
  gleich("und sie wird namentlich genannt", u.gruende.map((g) => g.datei), ["src/content/lexikon/petticoat.md"]);
  pruefe("mit einer Begründung, die auf Wahrheit zielt", /Wahrheit/.test(u.gruende[0]?.grund ?? ""), u.gruende[0]?.grund ?? "kein Grund");
}

{
  // Die vier gesperrten Pfade, einzeln. Der Hook blockiert sie ohnehin —
  // aber eine Sperre, die sich auf eine andere verlässt, ist eine halbe.
  for (const [datei, erwartet] of [
    ["src/content/_schemas.ts", "Datenvertrag"],
    ["src/site.config.ts", "Domain"],
    [".claude/hooks/guard.mjs", "Absicherung"],
    [".github/workflows/ci.yml", "CI-Konfiguration"],
  ] as const) {
    const u = beurteile([datei]);
    pruefe(`${datei} verlangt einen Menschen`, !u.erlaubt, JSON.stringify(u));
    pruefe(`${datei} nennt den passenden Grund`, new RegExp(erwartet).test(u.gruende[0]?.grund ?? ""), u.gruende[0]?.grund ?? "keiner");
  }
}

{
  // Der längste Treffer gewinnt: _schemas.ts liegt unter src/content/ und
  // müsste sonst den allgemeinen Inhaltsgrund tragen.
  const u = beurteile(["src/content/_schemas.ts"]);
  gleich("der genauere Grund schlägt den allgemeinen", u.gruende[0]?.grund, "Datenvertrag");
}

{
  // Ein leerer Zweig ist erlaubt — aber das ist eine Aussage über null
  // Dateien, keine über Sicherheit. Daneben das Lebenszeichen, dass die
  // Liste überhaupt Pfade kennt.
  const u = beurteile([]);
  pruefe("ein Zweig ohne Änderungen stoppt nicht", u.erlaubt, JSON.stringify(u));
  gleich("gezählt wurden null Dateien", u.geprueft, 0);
  pruefe("und die Sperrliste ist nicht leer", MENSCHENPFLICHTIG.length >= 5, String(MENSCHENPFLICHTIG.length));
}

{
  // Ein Pfad, der nur so AUSSIEHT wie ein gesperrter, darf durch.
  const u = beurteile(["scripts/test-content-hilfe.ts", "docs/src-content-notizen.md"]);
  pruefe("Pfade mit ähnlichem Namen lösen nicht aus", u.erlaubt, JSON.stringify(u.gruende));
}

/* ------------------------------------------------------------------ */
/* 5. Belegung durch offene Zweige                                     */
/* ------------------------------------------------------------------ */

/*
 * Die Regel: Ein freier Posten gilt als belegt, wenn seine Datei am
 * ABZWEIGPUNKT eines offenen Zweigs `frei` war und an dessen SPITZE nicht
 * mehr (gelöscht oder auf `mensch` gestellt).
 *
 * Die erste Hälfte dieser Bedingung hat in einem ersten Entwurf gefehlt,
 * und der Fehler war beim ersten Lauf gegen das echte Repository sofort da:
 * drei Fehlalarme auf `pflege/woechentlich`, einem Zweig, der schlicht von
 * einem älteren Stand abzweigte. Fall C unten ist genau dieser Fall.
 */

const A = P("a.md", "frei", "Posten A", "2026-10-05");
const B = P("b.md", "frei", "Posten B", "2026-10-04");
const C = P("c.md", "mensch", "Posten C", "2026-10-03");
const D = P("d.md", "frei", "Posten D", "2026-10-06"); // kam erst nach dem Abzweig
const E_FREI = P("e.md", "frei", "Posten E", "2026-10-02");
const E_MENSCH = P("e.md", "mensch", "Posten E", "2026-10-02"); // inzwischen zurückgeholt

const basis = lies([A, B, C, D, E_MENSCH]);
/** Der Abzweigpunkt eines Zweigs, der D noch nicht kannte und auf dem E noch frei war. */
const ALT = [A, B, C, E_FREI];

{
  // A: Der Lauf hat den Posten auf `mensch` gestellt.
  const zweig: Zweigstand = { zweig: "origin/claude/gestern", abzweig: ALT, spitze: [A, P("b.md", "mensch", "Posten B"), C] };
  const b = belegte(basis, [zweig]);
  gleich("A — umgestellter Posten gilt als belegt", b.map((x) => x.datei), ["b.md"]);
  gleich("A — und der Zweig wird benannt", b[0]?.zweig, "origin/claude/gestern");
  gleich("A — mit dem Titel der Basis", b[0]?.titel, "Posten B");
}

{
  // B: Der Lauf hat die Datei gelöscht, weil der Posten erledigt ist —
  // der Normalfall seit dem 2026-10-07.
  const zweig: Zweigstand = { zweig: "origin/claude/erledigt", abzweig: ALT, spitze: [A, C, E_FREI] };
  gleich("B — gelöschte Datei gilt als belegt", belegte(basis, [zweig]).map((x) => x.datei), ["b.md"]);
}

{
  // B2: Ein Lauf, der den TITEL umformuliert, die Datei aber behält, hat
  // den Posten nicht abgearbeitet. Vorher wurde über den Titel verglichen —
  // dann hätte das als „entfernt" gegolten.
  const zweig: Zweigstand = {
    zweig: "origin/claude/umbenannt",
    abzweig: ALT,
    spitze: [P("a.md", "frei", "Posten A, neu formuliert"), B, C, E_FREI],
  };
  gleich("B2 — geänderter Titel bei gleicher Datei belegt nichts", belegte(basis, [zweig]).map((x) => x.datei), []);
}

{
  // C: DER FEHLALARM AUS DEM ECHTEN REPOSITORY. Der Zweig hinkt hinterher:
  // Posten D gab es an seinem Abzweigpunkt noch nicht, und es gibt ihn auf
  // dem Zweig auch nicht.
  const zweig: Zweigstand = { zweig: "origin/pflege/woechentlich", abzweig: ALT, spitze: ALT };
  gleich("C — ein zurückliegender Zweig belegt nichts", belegte(basis, [zweig]).map((x) => x.datei), []);

  // Das positive Lebenszeichen daneben: Derselbe Zweig belegt sehr wohl
  // etwas, sobald er wirklich etwas anfasst (Regel 4).
  const arbeitend: Zweigstand = { zweig: "origin/pflege/woechentlich", abzweig: ALT, spitze: [B, C, E_FREI] };
  gleich("C — derselbe Zweig belegt, sobald er etwas anfasst", belegte(basis, [arbeitend]).map((x) => x.datei), ["a.md"]);
}

{
  // C2: Ein Zweig vom alten Stand (Posten noch in OFFENE-PUNKTE.md) hat am
  // Abzweigpunkt kein Verzeichnis. Er belegt nichts — auch nicht, wenn das
  // Verzeichnis an seiner Spitze fehlt.
  const zweig: Zweigstand = { zweig: "origin/claude/vorher", abzweig: [], spitze: [] };
  gleich("C2 — Zweig ohne Verzeichnis belegt nichts", belegte(basis, [zweig]).map((x) => x.datei), []);
}

{
  // D: Nichts verändert — nichts belegt.
  const zweig: Zweigstand = { zweig: "origin/claude/leer", abzweig: [A, B, C, D, E_MENSCH], spitze: [A, B, C, D, E_MENSCH] };
  gleich("D — ein unveränderter Zweig belegt nichts", belegte(basis, [zweig]).map((x) => x.datei), []);
  gleich("D — und ohne offene Zweige erst recht nichts", belegte(basis, []).map((x) => x.datei), []);
}

{
  // E: Was die Basis inzwischen dem Menschen zugeschlagen hat, wird nicht
  // als Belegung gemeldet. Posten E trägt den einzigen Zustand, der nur an
  // dieser Bedingung hängt: am Abzweigpunkt frei, auf dem Zweig gelöscht,
  // auf der Basis inzwischen `mensch`.
  const zweig: Zweigstand = { zweig: "origin/claude/mensch", abzweig: ALT, spitze: [A, B, C] };
  gleich("E — ein zurückgeholter Posten wird nicht als belegt gemeldet", belegte(basis, [zweig]).map((x) => x.datei), []);
}

{
  // F: Zwei Zweige, zwei verschiedene Posten.
  const eins: Zweigstand = { zweig: "origin/claude/eins", abzweig: ALT, spitze: [B, C, E_FREI] };
  const zwei: Zweigstand = { zweig: "origin/claude/zwei", abzweig: ALT, spitze: [A, C, E_FREI] };
  const b = belegte(basis, [eins, zwei]);
  gleich("F — beide Posten erkannt", b.map((x) => x.datei).sort(), ["a.md", "b.md"]);
  gleich("F — jeder seinem Zweig zugeordnet", b.find((x) => x.datei === "a.md")?.zweig, "origin/claude/eins");
  gleich("F — und der zweite dem seinen", b.find((x) => x.datei === "b.md")?.zweig, "origin/claude/zwei");
}

{
  // G: Was der Lauf morgen früh tatsächlich nimmt. D ist der neueste und
  // steht oben; ist er belegt, kommt der nächste dran.
  const abzweig = [A, B, C, D, E_MENSCH];
  const zweig: Zweigstand = { zweig: "origin/claude/gestern", abzweig, spitze: [A, B, C, E_MENSCH] };
  const belegtDatei = new Set(belegte(basis, [zweig]).map((x) => x.datei));
  const offen = basis.posten.filter((p) => p.marke === "frei" && !belegtDatei.has(p.datei));
  gleich("G — ohne Belegung stünde D oben", basis.posten[0]?.datei, "d.md");
  gleich("G — belegt nimmt der Lauf den nächsten freien Posten", offen[0]?.datei, "a.md");
  gleich("G — und nicht etwa gar keinen", offen.length, 2);
}

/* ------------------------------------------------------------------ */
/* 7. Termine und Lexikon abwechselnd (2026-09-29)                     */
/* ------------------------------------------------------------------ */
{
  const w = lies([
    P("termin-a.md", "frei", "Termin A anlegen", "2026-10-04"),
    P("termin-b.md", "frei", "Termin B anlegen", "2026-10-03"),
    P("lexikon-1.md", "frei", "Lexikon, Bündel Muster: X, Y", "2026-10-02"),
    P("lexikon-2.md", "frei", "Lexikon: Teddy Boy", "2026-10-01"),
  ]);
  const titel = (p?: { titel: string }) => p?.titel ?? "(keiner)";
  gleich("morgens: der oberste Posten, der kein Lexikon ist", titel(waehle(w.posten, 4)), "Termin A anlegen");
  gleich("nachmittags: der oberste Lexikon-Posten, auch wenn Termine darüber stehen", titel(waehle(w.posten, 14)), "Lexikon, Bündel Muster: X, Y");
  gleich("die Grenze liegt bei 12 Uhr UTC (11 Uhr noch morgens)", titel(waehle(w.posten, 11)), "Termin A anlegen");
  gleich("die Grenze liegt bei 12 Uhr UTC (12 Uhr schon nachmittags)", titel(waehle(w.posten, 12)), "Lexikon, Bündel Muster: X, Y");
  const nurTermine = w.posten.filter((p) => !istLexikon(p));
  gleich("nachmittags ohne Lexikon-Posten: der oberste Termin statt nichts", titel(waehle(nurTermine, 14)), "Termin A anlegen");
  const nurLexikon = w.posten.filter(istLexikon);
  gleich("morgens ohne Termin-Posten: der oberste Lexikon-Posten statt nichts", titel(waehle(nurLexikon, 4)), "Lexikon, Bündel Muster: X, Y");
  gleich("leere Warteschlange: kein Posten", waehle([], 14), undefined);
  pruefe("„Lexikon, Bündel …\" gilt als Lexikon", istLexikon({ titel: "Lexikon, Bündel Tanz: Jive" }));
  pruefe("„Lexikon: …\" gilt als Lexikon", istLexikon({ titel: "Lexikon: Teddy Boy." }));
  pruefe("ein Termin, der das Wort nur im Text trägt, gilt nicht als Lexikon", !istLexikon({ titel: "Lexikonabend im Café Central" }));
}

/* ------------------------------------------------------------------ */
/* 8. Obergrenze und Lexikon-Nachschub (Weg A, 2026-09-29)             */
/* ------------------------------------------------------------------ */
{
  const t = (n: number) => Array.from({ length: n }, (_, i) => ({ titel: `Termin ${i + 1} anlegen` }));
  const l = (n: number) => Array.from({ length: n }, (_, i) => ({ titel: `Lexikon, Bündel ${i + 1}: X` }));

  gleich("die Obergrenze ist zwölf", OBERGRENZE, 12);
  gleich("leere Warteschlange: zwölf Plätze, drei davon Lexikon", platz([]), {
    frei: 0, lexikon: 0, platz: 12, lexikonNachziehen: 3, ueber: 0,
  });
  gleich("ein Lexikon-Posten: auf drei auffüllen, also zwei", platz([...t(5), ...l(1)]).lexikonNachziehen, 2);
  gleich("zwei Lexikon-Posten: noch genug, nichts nachziehen", platz([...t(5), ...l(2)]).lexikonNachziehen, 0);
  gleich("vier Lexikon-Posten (von Hand): nichts nachziehen, kein Fehler", platz([...t(3), ...l(4)]), {
    frei: 7, lexikon: 4, platz: 5, lexikonNachziehen: 0, ueber: 0,
  });
  gleich("Nachschub nie über die Obergrenze: elf Termine, ein Platz", platz(t(11)).lexikonNachziehen, 1);
  gleich("zwölf frei: kein Platz, kein Nachschub, kein Fehler", platz(t(12)), {
    frei: 12, lexikon: 0, platz: 0, lexikonNachziehen: 0, ueber: 0,
  });
  gleich("dreizehn frei: einer über der Grenze", platz(t(13)).ueber, 1);
  gleich("und kein negativer Platz", platz(t(13)).platz, 0);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
