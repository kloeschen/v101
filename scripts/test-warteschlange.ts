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
 * Geprüft wird gegen Zeichenketten im Testharnisch, NICHT gegen die echte
 * OFFENE-PUNKTE.md. Ein Test, der an der echten Datei hängt, schlägt an,
 * sobald jemand einen Posten erledigt — und wird dann abgeschaltet statt
 * gelesen. Die echte Datei prüft `npm run warteschlange --check` in der
 * Kette, das ist die andere Frage.
 *
 * WARUM HIER UEBERALL `?.` UND `?? ""` STEHT: Der erste Mutationsbeleg
 * dieser Datei ist an ihr selbst gescheitert. `u.gruende[0].grund` warf eine
 * TypeError, sobald die mutierte Regel eine leere Liste lieferte — der Test
 * STUERZTE AB, statt FEHLZUSCHLAGEN, und der Beleg sah null gefallene
 * Behauptungen. Ein Absturz ist kein Fehlschlag: Er sagt nichts darüber, ob
 * die Behauptung stimmt. Dieselbe Fehlerklasse wie damals in
 * test-checklinks.ts.
 *
 *   npx tsx scripts/test-warteschlange.ts
 */

import { lies, belegte, type Zweigstand } from "./warteschlange";
import { beurteile, MENSCHENPFLICHTIG } from "./automerge-erlaubt";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* 1. Die Warteschlange liest Marken                                   */
/* ------------------------------------------------------------------ */

const DATEI = (koerper: string) => `# Offene Punkte

Vorspann, der keine Posten enthält.

## Als Nächstes

${koerper}

## Vor dem Go-Live

\`frei\` **Ein markierter Posten im Rückstau.** Er darf NICHT in der
Warteschlange auftauchen — an ihm fällt auf, wenn die Abschnittsgrenze bricht.

**Und einer ohne Marke.** Hier ist das erlaubt: Der Rückstau trägt keine
Marken.
`;

{
  const b = lies(
    DATEI(
      "`frei` **Erster Posten.** Text dazu.\n\n" +
        "`mensch` **Zweiter Posten.** Gehört dem Menschen.\n\n" +
        "`frei` **Dritter Posten.** Auch frei.",
    ),
  );
  gleich("drei Posten erkannt", b.posten.length, 3);
  gleich("Marken in der richtigen Reihenfolge", b.posten.map((p) => p.marke), ["frei", "mensch", "frei"]);
  gleich("Titel ohne Schlusspunkt", b.posten[0]?.titel, "Erster Posten");
  gleich("nichts Unmarkiertes gemeldet", b.ohneMarke.length, 0);

  // Das Lebenszeichen zur Reihenfolge: Der OBERSTE freie Posten ist der
  // erste, nicht irgendein freier. Daran hängt, was der Lauf morgen tut.
  gleich("der oberste freie Posten ist der erste", b.posten.filter((p) => p.marke === "frei")[0]?.titel, "Erster Posten");
}

/* ------------------------------------------------------------------ */
/* 2. Ein Posten ohne Marke fällt auf — das ist der Kern               */
/* ------------------------------------------------------------------ */

{
  const b = lies(DATEI("`frei` **Markiert.** Text.\n\n**Unmarkiert.** Text."));
  gleich("der unmarkierte Posten wird gemeldet", b.ohneMarke.map((o) => o.titel), ["Unmarkiert"]);
  // Gegenrichtung im selben Lauf: Der markierte daneben wird NICHT gemeldet.
  // Ohne diese Zeile wäre „meldet Unmarkiertes" auch mit einer Regel
  // vereinbar, die jeden Posten meldet (Lektion 17).
  gleich("der markierte daneben bleibt ein Posten", b.posten.map((p) => p.titel), ["Markiert"]);
  gleich("und er wandert nicht zusätzlich in die Mängelliste", b.ohneMarke.length, 1);
}

{
  // Der Abschnitt endet an der nächsten H2. Sonst zöge der Rückstau
  // Posten in die Warteschlange, die dort nichts zu suchen haben — und
  // „Vor dem Go-Live" hat absichtlich keine Marken.
  const b = lies(DATEI("`frei` **Einziger Posten.** Text."));
  gleich("der Rückstau wird nicht mitgelesen", b.posten.length, 1);
  gleich("und erzeugt keine Mängelmeldung", b.ohneMarke.length, 0);
}

{
  // Fettschrift MITTEN in einem Posten ist Auszeichnung, kein neuer Posten.
  // Fast jeder echte Posten enthält so etwas.
  const b = lies(DATEI("`frei` **Ein Posten.** Text mit\n**Fettschrift** mitten im Absatz."));
  gleich("Fettschrift im Fließtext startet keinen Posten", b.posten.length, 1);
  gleich("und gilt nicht als unmarkiert", b.ohneMarke.length, 0);
  pruefe("der Folgesatz gehört zum Auftragstext", !!b.posten[0]?.text.includes("Fettschrift"), b.posten[0]?.text ?? "kein Posten");
}

{
  const b = lies("# Datei ganz ohne den Abschnitt\n\n**Irgendwas.**\n");
  gleich("ohne den Abschnitt gibt es keine Posten", b.posten.length, 0);
  gleich("und keine Mängel", b.ohneMarke.length, 0);
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
 * Die Regel: Ein freier Posten gilt als belegt, wenn er am ABZWEIGPUNKT
 * eines offenen Zweigs frei war und an dessen SPITZE nicht mehr.
 *
 * Die zweite Hälfte dieser Bedingung ist in einem ersten Entwurf gefehlt,
 * und der Fehler war beim ersten Lauf gegen das echte Repository sofort da:
 * drei Fehlalarme auf `pflege/woechentlich`, einem Zweig, der schlicht von
 * einem älteren Stand abzweigte. Fall C unten ist genau dieser Fall — er ist
 * der Grund, warum es diesen Abschnitt gibt, und er muss grün bleiben.
 */

const BASIS = DATEI(
  "`frei` **Posten A.** Frei auf der Basis.\n\n" +
    "`frei` **Posten B.** Ebenfalls frei.\n\n" +
    "`mensch` **Posten C.** Gehört dem Menschen.\n\n" +
    "`frei` **Posten D.** Kam erst nach dem Abzweig dazu.\n\n" +
    "`mensch` **Posten E.** War frei, ist inzwischen zurückgeholt.",
);

/** Der Abzweigpunkt eines Zweigs, der D noch nicht kannte — und auf dem E
 *  noch frei war. */
const ALT = DATEI(
  "`frei` **Posten A.** Frei auf der Basis.\n\n" +
    "`frei` **Posten B.** Ebenfalls frei.\n\n" +
    "`mensch` **Posten C.** Gehört dem Menschen.\n\n" +
    "`frei` **Posten E.** Damals noch frei.",
);

const basis = lies(BASIS);

{
  // A: Der Lauf hat den Posten auf `mensch` gestellt — der Normalfall.
  const zweig: Zweigstand = {
    zweig: "origin/claude/gestern",
    abzweig: ALT,
    text: DATEI(
      "`frei` **Posten A.** Frei auf der Basis.\n\n" +
        "`mensch` **Posten B.** Wird auf diesem Zweig bearbeitet.\n\n" +
        "`mensch` **Posten C.** Gehört dem Menschen.",
    ),
  };
  const b = belegte(basis, [zweig]);
  gleich("A — umgestellter Posten gilt als belegt", b.map((x) => x.titel), ["Posten B"]);
  gleich("A — und der Zweig wird benannt", b[0]?.zweig, "origin/claude/gestern");
}

{
  // B: Der Lauf hat den Posten ganz entfernt, weil er erledigt ist.
  const zweig: Zweigstand = {
    zweig: "origin/claude/erledigt",
    abzweig: ALT,
    text: DATEI(
      "`frei` **Posten A.** Frei auf der Basis.\n\n" + "`mensch` **Posten C.** Gehört dem Menschen.",
    ),
  };
  gleich("B — entfernter Posten gilt als belegt", belegte(basis, [zweig]).map((x) => x.titel), ["Posten B"]);
}

{
  // C: DER FEHLALARM AUS DEM ECHTEN REPOSITORY. Der Zweig hinkt hinterher:
  // Posten D gab es an seinem Abzweigpunkt noch nicht, und es gibt ihn auf
  // dem Zweig auch nicht. Ohne die Abzweigbedingung zählte das als
  // „bearbeitet" — mit ihr nicht.
  const zweig: Zweigstand = { zweig: "origin/pflege/woechentlich", abzweig: ALT, text: ALT };
  const b = belegte(basis, [zweig]);
  gleich("C — ein zurückliegender Zweig belegt nichts", b.map((x) => x.titel), []);

  // Das positive Lebenszeichen daneben: Derselbe Zweig belegt sehr wohl
  // etwas, sobald er wirklich etwas anfasst. Sonst wäre die leere Liste
  // oben auch aus einem zweiten Grund erklärbar (Regel 4).
  const arbeitend: Zweigstand = {
    zweig: "origin/pflege/woechentlich",
    abzweig: ALT,
    text: DATEI(
      "`mensch` **Posten A.** Jetzt doch angefasst.\n\n" +
        "`frei` **Posten B.** Ebenfalls frei.\n\n" +
        "`mensch` **Posten C.** Gehört dem Menschen.",
    ),
  };
  gleich("C — derselbe Zweig belegt, sobald er etwas anfasst", belegte(basis, [arbeitend]).map((x) => x.titel), ["Posten A"]);
}

{
  // D: Nichts verändert — nichts belegt.
  const zweig: Zweigstand = { zweig: "origin/claude/leer", abzweig: BASIS, text: BASIS };
  gleich("D — ein unveränderter Zweig belegt nichts", belegte(basis, [zweig]).map((x) => x.titel), []);
  gleich("D — und ohne offene Zweige erst recht nichts", belegte(basis, []).map((x) => x.titel), []);
}

{
  // E: Was die Basis inzwischen dem Menschen zugeschlagen hat, wird nicht
  // als Belegung gemeldet.
  //
  // DIE VORRICHTUNG MUSSTE DAFÜR UMGEBAUT WERDEN. Der erste Anlauf setzte
  // einen Posten ein, der schon am Abzweigpunkt `mensch` war — dann greift
  // aber bereits die Abzweigbedingung, und die Mutation dieser Zeile ließ
  // alles grün. Eine Prüfung, die auch aus einem zweiten Grund besteht,
  // belegt keinen von beiden (Regel 4). Posten E trägt deshalb den einzigen
  // Zustand, der wirklich nur an dieser Zeile hängt: am Abzweigpunkt frei,
  // auf dem Zweig abgearbeitet — und auf der Basis inzwischen `mensch`,
  // weil der Mensch ihn zurückgeholt hat. Ihn zu melden wäre Lärm über
  // etwas, das ohnehin niemand mehr automatisch nimmt.
  const zweig: Zweigstand = {
    zweig: "origin/claude/mensch",
    abzweig: ALT,
    text: DATEI(
      "`frei` **Posten A.** Frei auf der Basis.\n\n" +
        "`frei` **Posten B.** Ebenfalls frei.\n\n" +
        "`mensch` **Posten C.** Gehört dem Menschen.",
    ),
  };
  const b = belegte(basis, [zweig]);
  gleich("E — ein zurückgeholter Posten wird nicht als belegt gemeldet", b.map((x) => x.titel), []);
}

{
  // F: Zwei Zweige, zwei verschiedene Posten — jeder wird seinem Zweig
  // zugeordnet und keiner doppelt gezählt.
  const eins: Zweigstand = {
    zweig: "origin/claude/eins",
    abzweig: ALT,
    text: DATEI("`mensch` **Posten A.** Hier.\n\n`frei` **Posten B.** Ebenfalls frei.\n\n`mensch` **Posten C.** X."),
  };
  const zwei: Zweigstand = {
    zweig: "origin/claude/zwei",
    abzweig: ALT,
    text: DATEI("`frei` **Posten A.** Frei.\n\n`mensch` **Posten B.** Dort.\n\n`mensch` **Posten C.** X."),
  };
  const b = belegte(basis, [eins, zwei]);
  gleich("F — beide Posten erkannt", b.map((x) => x.titel).sort(), ["Posten A", "Posten B"]);
  gleich("F — jeder seinem Zweig zugeordnet", b.find((x) => x.titel === "Posten A")?.zweig, "origin/claude/eins");
  gleich("F — und der zweite dem seinen", b.find((x) => x.titel === "Posten B")?.zweig, "origin/claude/zwei");
}

{
  // G: Was der Lauf morgen früh tatsächlich nimmt. Das ist die Behauptung,
  // an der die ganze Regel hängt: Der oberste freie Posten wird
  // übersprungen, wenn er belegt ist — und der nächste kommt dran, statt
  // dass der Lauf leer ausgeht.
  const zweig: Zweigstand = {
    zweig: "origin/claude/gestern",
    abzweig: ALT,
    text: DATEI("`mensch` **Posten A.** Bearbeitet.\n\n`frei` **Posten B.** Ebenfalls frei.\n\n`mensch` **Posten C.** X."),
  };
  const belegtTitel = new Set(belegte(basis, [zweig]).map((x) => x.titel));
  const offen = basis.posten.filter((p) => p.marke === "frei" && !belegtTitel.has(p.titel));
  gleich("G — der Lauf nimmt den nächsten freien Posten", offen[0]?.titel, "Posten B");
  gleich("G — und nicht etwa gar keinen", offen.length, 2);
}

/* ------------------------------------------------------------------ */
/* 6. Umgebrochene Titel                                               */
/* ------------------------------------------------------------------ */

/*
 * Der gefährlichste Fehler, den diese Datei haben kann, weil er nichts
 * meldet: Ein Titel, der über zwei Zeilen umbricht, wurde von beiden
 * Mustern verfehlt — der Posten fiel STUMM aus der Liste, und `--check`
 * schlug nicht an, weil nichts da war, worüber es hätte klagen können.
 *
 * Die neue Belegungsprüfung hängt an derselben Erkennung: Sie vergleicht
 * Posten über ihren Titel. Ein verschluckter Titel hieße dort, dass ein
 * Posten als unbelegt gilt, obwohl ein Zweig ihn schon bearbeitet.
 */

{
  const b = lies(
    DATEI(
      "`frei` **Ein Titel, der so lang ist, dass er beim Schreiben über zwei\nZeilen umbricht.** Und der Text dahinter.\n\n" +
        "`mensch` **Ein kurzer.** Text.",
    ),
  );
  gleich("umgebrochener Titel wird gefunden", b.posten.length, 2);
  gleich(
    "und vollständig gelesen, über den Umbruch hinweg",
    b.posten[0]?.titel,
    "Ein Titel, der so lang ist, dass er beim Schreiben über zwei Zeilen umbricht",
  );
  gleich("die Marke bleibt richtig", b.posten[0]?.marke, "frei");
  gleich("nichts landet fälschlich in ohneMarke", b.ohneMarke.length, 0);
}

{
  // Die Gegenprobe: Der Zusammenzug darf die Meldung für fehlende Marken
  // nicht verschlucken. Ein umgebrochener Titel OHNE Marke muss weiterhin
  // auffallen — sonst hätte die Reparatur das Loch nur verschoben.
  const b = lies(
    DATEI("**Ein unmarkierter Posten, dessen Titel ebenfalls über zwei\nZeilen läuft.** Text dazu."),
  );
  gleich("umgebrochener Titel ohne Marke fällt auf", b.ohneMarke.length, 1);
  gleich("und wird vollständig benannt", b.ohneMarke[0]?.titel, "Ein unmarkierter Posten, dessen Titel ebenfalls über zwei Zeilen läuft");
  gleich("er zählt nicht als Posten", b.posten.length, 0);
}

{
  // Und Fettschrift mitten im Absatz bleibt Auszeichnung, auch wenn sie
  // umbricht. Sonst zerfiele ein Posten in zwei.
  const b = lies(
    DATEI(
      "`frei` **Ein Posten.** Erste Zeile.\n" +
        "**Eine Hervorhebung mitten im Text, die auch noch über zwei\nZeilen geht.** Weiter im Text.",
    ),
  );
  gleich("Hervorhebung im Absatz erzeugt keinen zweiten Posten", b.posten.length, 1);
  gleich("und keine Meldung über eine fehlende Marke", b.ohneMarke.length, 0);
}

{
  // Ein Titel, dessen schließende `**` nie kommen, darf den Zusammenzug
  // nicht bis ans Abschnittsende laufen lassen. Die Leerzeile stoppt ihn.
  const b = lies(DATEI("`frei` **Ein Titel ohne Ende\n\n`mensch` **Der nächste Posten.** Text."));
  gleich("ein nie geschlossener Titel frisst den nächsten Posten nicht", b.posten.length, 1);
  gleich("und der gefundene ist der nächste", b.posten[0]?.titel, "Der nächste Posten");
}

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
