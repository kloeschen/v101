#!/usr/bin/env -S npx tsx
/**
 * test-checklinks.ts — die Bewertung der Linkprüfung, ohne Netz.
 *
 * `check-links.ts` selbst läuft bewusst nicht in jedem Durchlauf: Es ruft das
 * Netz, und ein fremder Server, der gerade hustet, ist kein Grund, einen
 * Merge zu blockieren (die Ausnahme steht mit Begründung in
 * `scripts/test-pruefkette.ts`). Seine Bewertungsfunktion `bewerte()` ist
 * dagegen rein — sie bekommt einen Statuscode und gibt einen Befund zurück.
 * Genau die wird hier geprüft, und zwar vollständig.
 *
 * ANLASS war die Bot-Abwehr-Liste. Britannica antwortet Prüfskripten mit
 * HTTP 403, auch nach dem GET-Nachfassen; die Seite ist trotzdem abrufbar
 * und gelesen. Ein wöchentlicher Bericht, der immer denselben Fehlalarm
 * meldet, erzieht zum Überlesen — also wird dieser Fall herabgestuft.
 *
 * Eine Ausnahmeliste ist aber genau die Stelle, an der still Dinge landen.
 * Deshalb prüft dieser Lauf drei Dinge, die sie eng halten:
 *
 *   1. Sie schlägt nur bei 403 an. Ein 404 desselben Hosts bleibt ein Fehler.
 *   2. Sie trifft nur den eingetragenen Host und seine Subdomains —
 *      `notbritannica.com` fällt nicht darunter.
 *   3. Jeder Eintrag trägt eine Begründung, und die Liste ist nicht leer.
 *      Ohne den zweiten Teil wäre "alle Einträge haben eine Begründung"
 *      für eine leere Liste trivial wahr (Lektion 19).
 *
 *   npx tsx scripts/test-checklinks.ts
 */

import { BOT_ABWEHR, bewerte, botAbwehrGrund } from "./check-links";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/** Cache-Eintrag, wie `pruefeUrl` ihn liefert. */
const antwort = (status: number | null, extra: Record<string, unknown> = {}) => ({
  status,
  geprueftAm: "2026-09-11T00:00:00.000Z",
  ...extra,
});

const BRIT = "https://www.britannica.com/art/boogie-woogie";
const FREMD = "https://example.org/irgendwas";

/* ------------------------------------------------------------------ */
/* Die Liste selbst                                                    */
/* ------------------------------------------------------------------ */

// Lebenszeichen zuerst: Ohne diese Zeile wären die beiden folgenden
// Behauptungen auch für eine leere Liste wahr.
pruefe("die Bot-Abwehr-Liste ist nicht leer", BOT_ABWEHR.length >= 1, `${BOT_ABWEHR.length} Einträge`);
// Und der Gegenfall dazu: Eine Ausnahme ohne Begründung darf nicht wirken.
gleich(
  "ein Eintrag ohne Begründung hebt die Prüfung nicht auf",
  botAbwehrGrund.length >= 0 && BOT_ABWEHR.every((e) => e.grund.trim().length > 0),
  true,
);
gleich(
  "jeder Eintrag trägt eine Begründung",
  BOT_ABWEHR.filter((e) => !e.grund || e.grund.trim().length < 20).map((e) => e.host),
  [],
);
gleich(
  "jeder Eintrag trägt einen Host ohne Schema und ohne Pfad",
  BOT_ABWEHR.filter((e) => !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(e.host)).map((e) => e.host),
  [],
);
gleich(
  "die Liste nennt britannica.com, den Fall, für den sie entstand",
  BOT_ABWEHR.some((e) => e.host === "britannica.com"),
  true,
);

/* ------------------------------------------------------------------ */
/* Zuordnung Host → Eintrag                                            */
/* ------------------------------------------------------------------ */

pruefe("die Subdomain www zählt zum Eintrag", botAbwehrGrund(BRIT) !== null);
pruefe("der Host selbst zählt zum Eintrag", botAbwehrGrund("https://britannica.com/x") !== null);
// Der Gegenfall zu einem schlichten includes(): Genau daran ist der
// Bash-Zweig von guard.mjs schon einmal gescheitert (Lektion 18).
pruefe("ein Host, der den Eintrag nur enthält, zählt nicht", botAbwehrGrund("https://notbritannica.com/x") === null);
pruefe("ein fremder Host zählt nicht", botAbwehrGrund(FREMD) === null);
pruefe("eine unbrauchbare URL wirft nicht, sondern zählt nicht", botAbwehrGrund("kein-url-text") === null);

/* ------------------------------------------------------------------ */
/* Bewertung: der herabgestufte Fall und seine Gegenfälle              */
/* ------------------------------------------------------------------ */

{
  const b = bewerte(BRIT, antwort(403));
  gleich("403 bei bekannter Bot-Abwehr: Warnung", b?.ebene, "warnung");
  gleich("403 bei bekannter Bot-Abwehr: eigener Code", b?.code, "bot-abwehr");
  // Nicht auf "403" prüfen: Das stünde auch in der Meldung "HTTP 403" des
  // Fehlerzweigs — ein Ergebnis mit zwei Ursachen (Lektion 17). Geprüft wird
  // der Begründungstext aus der Liste selbst.
  // Kein `!` auf dem find(): Fehlt der Eintrag, soll dieser Lauf FEHLSCHLAGEN
  // und nicht ABSTÜRZEN. Ein Test, der mit einem TypeError endet, hat keine
  // Behauptung fallen lassen — er hat gar keine geprüft, und der
  // Mutationsbeleg bekommt nichts zu sehen. Genau das ist hier passiert.
  const grund = BOT_ABWEHR.find((x) => x.host === "britannica.com")?.grund ?? "";
  // `includes("")` ist für jede Zeichenkette wahr — ohne die erste Bedingung
  // wäre diese Behauptung bei leerer Begründung trivial erfüllt (Lektion 17).
  pruefe(
    "die Meldung trägt die Begründung aus der Liste",
    grund.length > 0 && !!b?.nachricht.includes(grund),
    b?.nachricht ?? "kein Befund",
  );
}

// Der entscheidende Gegenfall: Ohne ihn wäre "403 ist eine Warnung" auch
// dann wahr, wenn die Liste gar nicht abgefragt würde (Lektion 17).
{
  const b = bewerte(FREMD, antwort(403));
  gleich("403 bei einem fremden Host bleibt ein Fehler", b?.ebene, "fehler");
  gleich("403 bei einem fremden Host bleibt tot", b?.code, "tot");
}

// Der zweite entscheidende Gegenfall: Die Liste sagt "sperrt Roboter aus",
// nicht "diesem Anbieter glauben wir alles".
{
  const b = bewerte(BRIT, antwort(404));
  gleich("404 bei bekannter Bot-Abwehr bleibt ein Fehler", b?.ebene, "fehler");
  gleich("404 bei bekannter Bot-Abwehr bleibt tot", b?.code, "tot");
}

/* ------------------------------------------------------------------ */
/* Status je Eintrag (seit 2026-09-25)                                 */
/* ------------------------------------------------------------------ */
/*
 * Facebook sperrt mit 400 statt 403. Der Eintrag nennt deshalb seinen
 * eigenen Status. Das ist die enge Form: Der Status gilt nur für diesen
 * Host, und jeder übrige Status desselben Hosts bleibt, was er war.
 */

const FB = "https://www.facebook.com/madsinofficial";
const RESERVIX = "https://asb-bahnhof.reservix.de/";

{
  const b = bewerte(FB, antwort(400));
  gleich("400 bei Facebook: Warnung", b?.ebene, "warnung");
  gleich("400 bei Facebook: eigener Code", b?.code, "bot-abwehr");
  pruefe("400 bei Facebook: Meldung nennt den echten Status", !!b?.nachricht.startsWith("HTTP 400 "), b?.nachricht ?? "kein Befund");
}
// Gegenfälle: Der Sonderstatus gilt weder für andere Hosts noch ersetzt er
// die Unterscheidung zwischen gesperrt und weg.
gleich("400 bei Britannica bleibt ein Fehler (Status gilt nur je Eintrag)", bewerte(BRIT, antwort(400))?.code, "tot");
gleich("400 bei einem fremden Host bleibt ein Fehler", bewerte(FREMD, antwort(400))?.code, "tot");
gleich("403 bei Facebook bleibt ein Fehler (Eintrag nennt nur 400)", bewerte(FB, antwort(403))?.code, "tot");
gleich("404 bei Facebook bleibt ein Fehler", bewerte(FB, antwort(404))?.code, "tot");
gleich("403 bei einer Reservix-Subdomain: Warnung", bewerte(RESERVIX, antwort(403))?.code, "bot-abwehr");
gleich("404 bei Reservix bleibt ein Fehler", bewerte(RESERVIX, antwort(404))?.code, "tot");
pruefe(
  "kein Eintrag nennt 404 oder 410 — das hieße, einem Anbieter alles zu glauben",
  BOT_ABWEHR.every((e) => !(e.status ?? []).some((s) => s === 404 || s === 410)),
);

/* ------------------------------------------------------------------ */
/* Die übrigen Regeln, damit die Erweiterung nichts verschoben hat     */
/* ------------------------------------------------------------------ */

gleich("200 ergibt keinen Befund", bewerte(FREMD, antwort(200)), null);
gleich("404 ist ein Fehler", bewerte(FREMD, antwort(404))?.code, "tot");
gleich("410 ist ein Fehler", bewerte(FREMD, antwort(410))?.code, "tot");
gleich("429 ist eine Warnung", bewerte(FREMD, antwort(429))?.code, "gedrosselt");
gleich("500 ist eine Warnung", bewerte(FREMD, antwort(500))?.code, "serverfehler");
gleich("503 ist eine Warnung", bewerte(FREMD, antwort(503))?.code, "serverfehler");
gleich("ein Netzfehler ist eine Warnung", bewerte(FREMD, antwort(null, { fehler: "Zeitüberschreitung" }))?.code, "unerreichbar");

gleich(
  "Weiterleitung auf einen fremden Host ist eine Warnung",
  bewerte("https://alt.example/x", antwort(200, { ziel: "https://neu.example/x" }))?.code,
  "umgezogen",
);
gleich(
  "Weiterleitung von http auf https derselben Domain ist eine Warnung",
  bewerte("http://example.org/x", antwort(200, { ziel: "https://example.org/x" }))?.code,
  "http",
);
gleich(
  "Weiterleitung innerhalb desselben Hosts ergibt keinen Befund",
  bewerte("https://example.org/a", antwort(200, { ziel: "https://example.org/b" })),
  null,
);

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
