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

import { lies } from "./warteschlange";
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

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
