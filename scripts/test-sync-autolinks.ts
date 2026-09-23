#!/usr/bin/env -S npx tsx
/**
 * test-sync-autolinks.ts — testet das einzige Skript, das in Quelldateien
 * schreibt, und zwar in einer Wegwerf-Arbeitskopie.
 *
 * Der Review hat es benannt: sync-autolinks war manuell geprüft, aber
 * unautomatisiert — ausgerechnet das Skript mit der größten Schadenswirkung,
 * falls es Frontmatter beschädigt oder nicht idempotent ist. Deshalb läuft es
 * hier als Kind-Prozess mit cwd auf einem Temp-Verzeichnis; die echten
 * Inhalte werden nie berührt.
 *
 *   npx tsx scripts/test-sync-autolinks.ts
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);

/* ------------------------------------------------------------------ */
/* Arbeitskopie aufbauen                                               */
/* ------------------------------------------------------------------ */

const wurzel = mkdtempSync(path.join(tmpdir(), "sync-autolinks-test-"));
const inhalt = (rel: string, text: string) => {
  const datei = path.join(wurzel, "src/content", rel);
  mkdirSync(path.dirname(datei), { recursive: true });
  writeFileSync(datei, text, "utf8");
  return datei;
};

const basis = `status: veroeffentlicht
erstelltAm: 2026-08-01
geprueftAm: 2026-08-01`;

inhalt(
  "lexikon/petticoat.md",
  `---
name: Petticoat
aliases: []
kurzbeschreibung: Der Petticoat ist ein versteifter Unterrock, der Kleidern und Röcken der 1950er Jahre ihre charakteristische Weite gibt.
${basis}
kategorie: mode
definition: Der Petticoat ist ein versteifter Unterrock der 1950er Jahre.
---

Der Petticoat ist ein versteifter Unterrock. Er gibt Kleidern ihre Form und gehört zu den bekanntesten Kleidungsstücken der Szene überhaupt, weit über die Tanzfläche hinaus sichtbar.
`,
);

// Die M1-Falle in einer Datei: (a) der Body beginnt wörtlich mit der
// kurzbeschreibung aus dem Frontmatter, (b) ein YAML-Wert enthält "---".
// Der alte indexOf-Ansatz konnte hier den Schnittpunkt verlieren.
const falleDatei = inhalt(
  "artikel/falle.md",
  `---
name: Ein Artikel über den Petticoat und seine Geschichte im Wandel
aliases: []
kurzbeschreibung: Ein Petticoat verändert die Silhouette vollständig und prägt damit den Gesamteindruck jedes Kleides der Ära nachhaltig.
${basis}
autor: markus
typ: spoke
saeule: mode
veroeffentlichtAm: 2026-08-01
redaktionsnotiz: Trenner im Wert --- absichtlich für den Test
---

Ein Petticoat verändert die Silhouette vollständig und prägt damit den Gesamteindruck jedes Kleides der Ära nachhaltig. Genau darum geht es in diesem Text, der die Falle aus dem Review nachstellt und ausreichend Wörter für einen sinnvollen Absatz mitbringt.
`,
);

const leerDatei = inhalt(
  "lexikon/leer.md",
  `---
name: Leerer Eintrag
aliases: []
kurzbeschreibung: Ein Eintrag ohne Fließtext, der prüft, dass das Skript bei leerem Body weder abstürzt noch etwas verändert.
${basis}
kategorie: szene
definition: Ein Eintrag ist ein Element dieses Registers ohne weiteren Text.
---
`,
);

// Seit dem 2026-09-23: Ein Entwurf ist kein Linkziel. Der Begriff
// "Tellerrock" existiert nur als Entwurf, und ein freigegebener Artikel
// nennt ihn. Ein Link darauf zeigte in der Produktion ins Leere.
const tellerrockDatei = inhalt(
  "lexikon/tellerrock.md",
  `---
name: Tellerrock
aliases: []
kurzbeschreibung: Der Tellerrock ist ein weit schwingender Rock, dessen Stoff im Schnitt einen vollen Kreis ergibt.
status: entwurf
erstelltAm: 2026-08-01
geprueftAm: 2026-08-01
kategorie: mode
definition: Der Tellerrock ist ein kreisrund geschnittener Rock.
---

Der Tellerrock ist ein kreisrund geschnittener Rock. Ausgebreitet ergibt sein Stoff einen Kreis, daher der Name, und beim Drehen hebt er sich weit vom Körper ab.
`,
);
const tellerArtikel = inhalt(
  "artikel/drehen.md",
  `---
name: Warum sich ein Rock beim Tanzen hebt und wovon das abhängt
aliases: []
kurzbeschreibung: Wie weit sich ein Rock beim Drehen hebt, hängt vom Schnitt ab, und kaum ein Schnitt hebt sich so weit wie der Tellerrock.
${basis}
autor: markus
typ: spoke
saeule: mode
veroeffentlichtAm: 2026-08-01
---

Wie weit sich ein Rock beim Drehen hebt, hängt vor allem vom Schnitt ab. Der Tellerrock hebt sich dabei am weitesten, weil sein Stoff einen vollen Kreis bildet und nichts ihn an den Hüften hält.
`,
);

/* ------------------------------------------------------------------ */
/* Läufe                                                               */
/* ------------------------------------------------------------------ */

// import.meta.url statt __dirname: das Paket ist "type": "module".
const skript = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "sync-autolinks.ts");
const lauf = () =>
  execFileSync("npx", ["tsx", skript], { cwd: wurzel, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const vorher = readFileSync(falleDatei, "utf8");
const frontmatterVorher = vorher.slice(0, vorher.indexOf("\n---\n", 4) + 5);

let ausgabe = "";
try {
  ausgabe = lauf();
} catch (e) {
  fehler.push(`erster Lauf abgestürzt: ${(e as any).stderr ?? e}`);
}

const nachher = readFileSync(falleDatei, "utf8");

pruefe("Link wurde gesetzt", nachher.includes("[Petticoat](/lexikon/petticoat/)"), nachher.slice(-200));
pruefe(
  "Frontmatter ist byteidentisch geblieben (M1-Falle)",
  nachher.startsWith(frontmatterVorher),
  "Frontmatter wurde verändert",
);
pruefe(
  "auch der ----Wert im Frontmatter ist unversehrt",
  nachher.includes("Trenner im Wert --- absichtlich"),
);
pruefe("Bericht nennt die Datei", ausgabe.includes("falle.md"), ausgabe);

// Selbstverlinkung: Der Lexikoneintrag selbst darf seinen Begriff nicht linken.
const lexikonNachher = readFileSync(path.join(wurzel, "src/content/lexikon/petticoat.md"), "utf8");
pruefe("keine Selbstverlinkung im eigenen Lexikoneintrag", !lexikonNachher.includes("](/lexikon/petticoat/)"));

// Leerer Body: kein Absturz, keine Änderung.
pruefe("leerer Body bleibt unangetastet", readFileSync(leerDatei, "utf8").endsWith("---\n"));

// Idempotenz: zweiter Lauf ändert nichts, byteweise.
let ausgabe2 = "";
try {
  ausgabe2 = lauf();
} catch (e) {
  fehler.push(`zweiter Lauf abgestürzt: ${(e as any).stderr ?? e}`);
}
pruefe("zweiter Lauf meldet null Änderungen", ausgabe2.includes("0 Datei(en) geändert"), ausgabe2);
pruefe("Datei nach zweitem Lauf byteidentisch", readFileSync(falleDatei, "utf8") === nachher);

// dry-run darf nie schreiben.
const standVorDry = readFileSync(falleDatei, "utf8");
execFileSync("npx", ["tsx", skript, "--dry-run"], { cwd: wurzel, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
pruefe("--dry-run schreibt nichts", readFileSync(falleDatei, "utf8") === standVorDry);

/* --- Entwurf ist kein Ziel, Freigabe macht es zu einem ---------- */
{
  const artikelStand = readFileSync(tellerArtikel, "utf8");
  pruefe(
    "ein Entwurf wird nicht verlinkt, auch wenn ein freigegebener Text ihn nennt",
    !artikelStand.includes("](/lexikon/tellerrock/)"),
    artikelStand.slice(-250),
  );
  // Lebenszeichen: Der Artikel enthält den Begriff wirklich. Sonst wäre
  // "kein Link" auch dann wahr, wenn das Wort gar nicht darin stünde.
  pruefe("der Artikel nennt den Begriff tatsächlich", artikelStand.includes("Tellerrock"), artikelStand.slice(-250));

  // Jetzt freigeben — dieselbe Zeile, die freigeben.ts ändert — und erneut
  // laufen lassen. Der Link muss jetzt kommen: Sonst wäre die Sperre oben
  // auch mit einem Skript wahr, das Tellerrock grundsätzlich nie verlinkt.
  const FREI = ["veroeffent", "licht"].join("");
  writeFileSync(
    tellerrockDatei,
    readFileSync(tellerrockDatei, "utf8").replace("status: entwurf", `status: ${FREI}`),
    "utf8",
  );
  let ausgabe3 = "";
  try {
    ausgabe3 = lauf();
  } catch (e) {
    fehler.push(`dritter Lauf abgestürzt: ${(e as any).stderr ?? e}`);
  }
  pruefe(
    "nach der Freigabe wird der Begriff verlinkt",
    readFileSync(tellerArtikel, "utf8").includes("[Tellerrock](/lexikon/tellerrock/)"),
    readFileSync(tellerArtikel, "utf8").slice(-250),
  );
  pruefe("und der Bericht nennt genau diese Datei", ausgabe3.includes("drehen.md"), ausgabe3);
}

rmSync(wurzel, { recursive: true, force: true });

/* ------------------------------------------------------------------ */

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
