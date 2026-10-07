#!/usr/bin/env -S npx tsx
/**
 * test-konflikte.ts — sagt `konflikte.ts` die Kollisionen richtig voraus?
 *
 * Geprüft wird an einem Wegwerf-Repository im Temp-Verzeichnis, nicht am
 * echten: Dort hängen die Zweige vom Tag ab, und ein Test, der vom Stand
 * des Remotes abhängt, ist morgen rot oder grundlos grün. Hier entsteht
 * jeder Fall mit Absicht, und jeder Fall „sauber" steht neben einem Fall
 * „kollidiert" aus demselben Repository (Regel 4).
 *
 *   npx tsx scripts/test-konflikte.ts
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { alsMarkdown, bericht, liesMergeTree, mitHead, offeneZweige, probeMerge } from "./konflikte";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* --- reine Funktion -------------------------------------------------- */

gleich("merge-tree-Ausgabe: Baum weg, Dateien bleiben", liesMergeTree("abc123\nOFFENE-PUNKTE.md\nBETRIEB.md\n"), [
  "OFFENE-PUNKTE.md",
  "BETRIEB.md",
]);
gleich("merge-tree-Ausgabe ohne Konflikt: leer", liesMergeTree("abc123\n"), []);

/* --- Wegwerf-Repository ---------------------------------------------- */

const repo = mkdtempSync(path.join(tmpdir(), "v101-konflikte-"));
const JETZT = 1_800_000_000; // feste Uhr, Epochensekunden
const TAG = 86400;
const g = (zeit: number, ...args: string[]) =>
  execFileSync("git", args, {
    cwd: repo,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t",
      GIT_AUTHOR_DATE: `@${zeit} +0000`, GIT_COMMITTER_DATE: `@${zeit} +0000`,
    },
  }).trim();
const schreib = (datei: string, text: string) => writeFileSync(path.join(repo, datei), text);
const commit = (zeit: number, nachricht: string) => {
  g(zeit, "add", "-A");
  g(zeit, "commit", "-q", "-m", nachricht);
};
/** Einen Zweig von `von` aus bauen, eine Datei ändern, als Remote-Ref ablegen. */
const zweig = (name: string, von: string, datei: string, text: string, zeit = JETZT - TAG) => {
  g(zeit, "checkout", "-q", "-B", name, von);
  schreib(datei, text);
  commit(zeit, name);
  g(zeit, "update-ref", `refs/remotes/origin/${name}`, "HEAD");
};

try {
  g(JETZT, "init", "-q", "-b", "main");
  schreib("liste.md", "eins\nzwei\ndrei\nvier\nfuenf\nsechs\nsieben\nacht\n");
  schreib("andere.md", "a\nb\nc\n");
  schreib("dritte.md", "x\ny\nz\n");
  commit(JETZT - 10 * TAG, "start");
  const start = g(JETZT, "rev-parse", "HEAD");

  // Zweige vom Start aus:
  zweig("kollidiert", start, "liste.md", "EINS\nzwei\ndrei\nvier\nfuenf\nsechs\nsieben\nacht\n"); // gleiche Zeile wie main
  // … und derselbe Zweig fasst auch dritte.md an, wie die Paarzweige. So
  // hätte er Paarmeldungen, wenn die Paarprüfung ihn nicht ausließe.
  schreib("dritte.md", "x\nYK\nz\n");
  commit(JETZT - TAG, "kollidiert, zweite Datei");
  g(JETZT, "update-ref", "refs/remotes/origin/kollidiert", "HEAD");
  zweig("sauber", start, "andere.md", "a\nB\nc\n"); // andere Datei
  zweig("paar-1", start, "dritte.md", "x\nY1\nz\n"); // gegen main sauber …
  zweig("paar-2", start, "dritte.md", "x\nY2\nz\n"); // … untereinander nicht
  zweig("alt", start, "liste.md", "EINS-ALT\nzwei\ndrei\nvier\nfuenf\nsechs\nsieben\nacht\n", JETZT - 30 * TAG);

  // main geht weiter und ändert die erste Zeile von liste.md.
  g(JETZT, "checkout", "-q", "main");
  schreib("liste.md", "Eins (main)\nzwei\ndrei\nvier\nfuenf\nsechs\nsieben\nacht\n");
  commit(JETZT - 2 * TAG, "main weiter");
  g(JETZT, "update-ref", "refs/remotes/origin/main", "HEAD");

  // Ein gemergter Zweig: steckt in main und darf nicht auftauchen.
  zweig("gemergt", "main", "neu.md", "neu\n");
  g(JETZT, "checkout", "-q", "main");
  g(JETZT, "merge", "-q", "--ff-only", "gemergt");
  g(JETZT, "update-ref", "refs/remotes/origin/main", "HEAD");

  /* Probe-Merge direkt */
  const k = probeMerge("origin/main", "origin/kollidiert", repo);
  gleich("gleiche Zeile wie main: Konflikt", k.sauber, false);
  gleich("und zwar an liste.md", k.dateien, ["liste.md"]);
  gleich("andere Datei: sauber (Lebenszeichen der Gegenrichtung)", probeMerge("origin/main", "origin/sauber", repo), {
    sauber: true,
    dateien: [],
  });
  let geworfen = false;
  try {
    probeMerge("origin/main", "gibt-es-nicht", repo);
  } catch {
    geworfen = true;
  }
  pruefe("ein Git-Fehler wird geworfen, nicht als sauber gemeldet", geworfen);

  /* Auswahl der offenen Zweige */
  const offen = offeneZweige({ basis: "origin/main", tage: 7, cwd: repo, jetzt: JETZT }).map((z) => z.name).sort();
  gleich("offen: die frischen, ungemergten Zweige", offen, [
    "origin/kollidiert",
    "origin/paar-1",
    "origin/paar-2",
    "origin/sauber",
  ]);
  pruefe("der alte Zweig fällt über die Altersgrenze", !offen.includes("origin/alt"));
  pruefe("der gemergte Zweig fällt heraus", !offen.includes("origin/gemergt"));
  const mitAlt = offeneZweige({ basis: "origin/main", tage: 60, cwd: repo, jetzt: JETZT }).map((z) => z.name);
  pruefe("mit größerer Grenze ist der alte Zweig dabei (Lebenszeichen)", mitAlt.includes("origin/alt"), mitAlt.join(", "));

  /* Bericht */
  const b = bericht("origin/main", offeneZweige({ basis: "origin/main", tage: 7, cwd: repo, jetzt: JETZT }), repo);
  gleich("gegen die Basis kollidiert genau ein Zweig", b.gegenBasis.map((x) => [x.zweig, x.dateien]), [
    ["origin/kollidiert", ["liste.md"]],
  ]);
  gleich("untereinander kollidiert genau das Paar", b.untereinander.map((x) => [x.zweig, x.gegen, x.dateien]), [
    ["origin/paar-1", "origin/paar-2", ["dritte.md"]],
  ]);
  pruefe(
    "ein gegen die Basis klemmender Zweig erzeugt keine Paarmeldungen",
    !b.untereinander.some((x) => x.zweig === "origin/kollidiert" || x.gegen === "origin/kollidiert"),
    JSON.stringify(b.untereinander),
  );
  const md = alsMarkdown(b, 7);
  pruefe("Markdown nennt Zweig und Datei", md.includes("`kollidiert`: `liste.md`"), md);
  pruefe("Markdown nennt das Paar", md.includes("`paar-1` × `paar-2`: `dritte.md`"), md);

  /* HEAD */
  g(JETZT, "checkout", "-q", "-B", "lokal", "origin/main");
  schreib("liste.md", "LOKAL\nzwei\ndrei\nvier\nfuenf\nsechs\nsieben\nacht\n");
  commit(JETZT, "lokal");
  const mitLokal = mitHead([], "origin/main", repo);
  gleich("ein ungepushter HEAD mit Arbeit wird mitgeprüft", mitLokal.map((z) => z.name), ["HEAD (lokal)"]);
  g(JETZT, "checkout", "-q", "-B", "leer", "origin/main");
  gleich("ein HEAD ohne eigene Arbeit nicht", mitHead([], "origin/main", repo).map((z) => z.name), []);
  g(JETZT, "checkout", "-q", "paar-1");
  const paar = offeneZweige({ basis: "origin/main", tage: 7, cwd: repo, jetzt: JETZT });
  gleich("ein HEAD, der schon als Remote-Zweig dasteht, nicht doppelt", mitHead(paar, "origin/main", repo).length, paar.length);
} finally {
  rmSync(repo, { recursive: true, force: true });
}

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
