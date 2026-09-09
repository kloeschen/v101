#!/usr/bin/env -S npx tsx
/**
 * test-regionen.ts — der Bestand einer Region, und die Bedingung unter der
 * die Entscheidung gegen eine Indexschwelle steht.
 *
 * Zwei Teile, und der zweite ist der ungewöhnliche.
 *
 * TEIL 1 prüft `regionsBestand` und `bestandsLuecke`: Was zählt mit, was
 * nicht, und schlägt der Posten genau dann an, wenn er soll. Jede Behauptung
 * hat ihren Gegenfall — die beiden Entscheidungen beim Bau (Entwürfe zählen
 * nicht, die Region zählt sich nicht selbst) sind so aufgesetzt, dass ein
 * Fixture kippt, wenn die Entscheidung anders fiele. Ohne diesen Gegenfall
 * wäre „drei Einträge, keine Lücke" auch dann wahr, wenn irgendetwas anderes
 * mitgezählt hätte (Lektion 17).
 *
 * TEIL 2 hält die Begründung fest, warum hier KEINE Indexschwelle steht. Sie
 * beruht auf zwei Zahlen aus der Prüfkette: `minWorte.regionen` (250 Wörter
 * Fließtext, harter Fehler) und der Deckel der Antwortkapsel (90 Wörter). Aus
 * beiden folgt, dass jede Region, die die Kette besteht, mindestens 160 Wörter
 * über die Kapsel hinaus trägt — und damit den verlangten Textarm einer
 * Schwelle immer erfüllt. Ein ODER mit einem immer wahren Arm ergibt nie ein
 * noindex.
 *
 * Eine Begründung, die nur im Kommentar steht, verfällt still, sobald jemand
 * eine der beiden Zahlen ändert. Deshalb steht sie hier als Bedingung: Sinkt
 * das Mindestmaß, wird dieser Lauf rot und sagt, dass die Entscheidung neu zu
 * treffen ist.
 *
 *   npx tsx scripts/test-regionen.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry } from "../src/lib/links";
import { zaehleWorte } from "../src/lib/facetten";
import {
  eigenerText,
  regionsBestand,
  bestandsLuecke,
  MIN_REGION_EINTRAEGE,
} from "../src/lib/regionen";
import { minWorte, type CollectionName } from "../src/content/_schemas";
import { ladeAlle } from "./_laden";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/* ------------------------------------------------------------------ */
/* Bausteine für die Fixtures                                          */
/* ------------------------------------------------------------------ */

/**
 * Ein Fixture ist eine Registry-Eingabe plus Rumpf. Der Rumpf gehört nicht in
 * `RegistryEingabe` — die Registry braucht ihn nicht, `bestandsLuecke` schon,
 * und die bekommt ihn dort, wo er ohnehin liegt: beim geladenen Eintrag.
 */
interface Fixture {
  collection: CollectionName;
  slug: string;
  daten: Record<string, any>;
  body: string;
}

const KAPSEL = "Musterland ist ein erfundenes Bundesland und dient hier als Prüffall.";
const RUMPF = `${KAPSEL}\n\n## Szene in Musterland\n\nEin zweiter Absatz mit sechs Wörtern mehr.`;

const region = (slug: string, status: string, body = RUMPF): Fixture => ({
  collection: "regionen",
  slug,
  daten: { name: slug, status },
  body,
});

const ort = (slug: string, regionSlug: string, status: string): Fixture => ({
  collection: "locations",
  slug,
  daten: { name: slug, region: regionSlug, status },
  body: "",
});

/** Ohne eigenes `region`: erbt es über `ort` aus der Location. */
const event = (slug: string, ortSlug: string, status: string): Fixture => ({
  collection: "events",
  slug,
  daten: { name: slug, ort: ortSlug, status },
  body: "",
});

/** Der Eintrag, wie `bestandsLuecke` ihn erwartet (Form von `ladeAlle`). */
const alsEintrag = (e: Fixture) => ({
  collection: e.collection as string,
  slug: e.slug,
  daten: e.daten,
  body: e.body,
});

/* ------------------------------------------------------------------ */
/* Teil 1a — eigenerText                                               */
/* ------------------------------------------------------------------ */

gleich("eigenerText lässt die Antwortkapsel weg", zaehleWorte(eigenerText(RUMPF)) < zaehleWorte(RUMPF), true);
gleich("eigenerText behält, was nach der Kapsel steht", eigenerText(RUMPF).includes("Szene in Musterland"), true);
gleich("eigenerText behält die Kapsel selbst nicht", eigenerText(RUMPF).includes(KAPSEL), false);
gleich("ein Rumpf aus nur einer Kapsel ergibt keinen eigenen Text", zaehleWorte(eigenerText(KAPSEL)), 0);
gleich("ein leerer Rumpf ergibt keinen eigenen Text", zaehleWorte(eigenerText("")), 0);
gleich("ohne Argument ergibt sich kein eigener Text", zaehleWorte(eigenerText()), 0);

/* ------------------------------------------------------------------ */
/* Teil 1b — regionsBestand: was zählt mit                             */
/* ------------------------------------------------------------------ */

{
  const registry = buildRegistry([
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    event("tanzabend", "halle", "veroeffentlicht"),
  ]);
  const { alle, freigegeben } = regionsBestand(registry, "musterland");

  gleich(
    "Location und Event zählen zum Bestand",
    alle.map((e) => e.slug).sort(),
    ["halle", "tanzabend"],
  );
  // Das Event trägt kein eigenes `region` — es erbt sie über den Ort. Ohne
  // diese Ableitung stünde hier nur die Halle.
  gleich("das Event zählt auch ohne eigenes region-Feld", alle.some((e) => e.slug === "tanzabend"), true);
  gleich("beide sind freigegeben", freigegeben.length, 2);

  // Der Gegenfall zur Entscheidung „die Region zählt sich nicht selbst":
  // Die Region ist hier freigegeben und läge mitgezählt bei drei.
  gleich("die Region zählt sich nicht selbst mit", alle.some((e) => e.slug === "musterland"), false);
  gleich("mitgezählt wären es drei, gezählt sind es zwei", freigegeben.length, MIN_REGION_EINTRAEGE - 1);
}

{
  const registry = buildRegistry([
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    ort("schuppen", "musterland", "entwurf"),
    ort("keller", "musterland", "entwurf"),
  ]);
  const { alle, freigegeben } = regionsBestand(registry, "musterland");
  gleich("Entwürfe stehen im Bestand", alle.length, 3);
  gleich("Entwürfe zählen nicht als freigegeben", freigegeben.length, 1);
}

/* ------------------------------------------------------------------ */
/* Teil 1c — bestandsLuecke: schlägt sie genau dann an                 */
/* ------------------------------------------------------------------ */

/** Drei freigegebene Orte in der Region — der Bestand trägt sich. */
{
  const eintraege = [
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    ort("schuppen", "musterland", "veroeffentlicht"),
    ort("keller", "musterland", "veroeffentlicht"),
  ];
  const registry = buildRegistry(eintraege);
  const { luecke } = bestandsLuecke(alsEintrag(eintraege[0]), registry);
  gleich("drei freigegebene Einträge: keine Lücke", luecke, false);
}

/** Zwei freigegebene — einer zu wenig. */
{
  const eintraege = [
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    ort("schuppen", "musterland", "veroeffentlicht"),
  ];
  const registry = buildRegistry(eintraege);
  const { luecke, grund } = bestandsLuecke(alsEintrag(eintraege[0]), registry);
  gleich("zwei freigegebene Einträge: Lücke", luecke, true);
  pruefe("der Grund nennt Ist und Soll", !!grund?.includes(`2 von ${MIN_REGION_EINTRAEGE}`), grund ?? "kein Grund");
  // `!grund?.includes(…)` allein wäre auch dann wahr, wenn es gar keinen
  // Grund gibt — ein Ergebnis mit zwei Ursachen (Lektion 17). Der Grund muss
  // erst existieren.
  pruefe("der Grund nennt keine Entwürfe, wo keine sind", !!grund && !grund.includes("Entwurf"), grund ?? "kein Grund");
  pruefe("der Grund nennt den eigenen Textumfang", /\d+ eigene Wörter/.test(grund ?? ""), grund ?? "");
}

/**
 * Der Gegenfall zur Entscheidung „Entwürfe zählen nicht mit": Dieselbe Region
 * mit drei Verweisen, aber alle drei sind Entwürfe. Zählten sie mit, wäre die
 * Lücke geschlossen — das Fixture unterscheidet die beiden Ursachen.
 */
{
  const eintraege = [
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "entwurf"),
    ort("schuppen", "musterland", "entwurf"),
    ort("keller", "musterland", "entwurf"),
  ];
  const registry = buildRegistry(eintraege);
  const { luecke, grund } = bestandsLuecke(alsEintrag(eintraege[0]), registry);
  gleich("drei Entwürfe schließen die Lücke nicht", luecke, true);
  pruefe("der Grund zählt sie als Entwurf aus", !!grund?.includes("(3 als Entwurf vorhanden)"), grund ?? "");
}

/**
 * Eine Region, die selbst noch Entwurf ist, steht nicht doppelt im Bericht.
 * Der Gegenfall steht direkt daneben: dieselbe Lage, nur freigegeben.
 */
{
  const alsEntwurf = [region("musterland", "entwurf"), ort("halle", "musterland", "veroeffentlicht")];
  const alsFrei = [region("musterland", "veroeffentlicht"), ort("halle", "musterland", "veroeffentlicht")];
  gleich(
    "eine Region im Entwurf erzeugt keinen Posten",
    bestandsLuecke(alsEintrag(alsEntwurf[0]), buildRegistry(alsEntwurf)).luecke,
    false,
  );
  gleich(
    "dieselbe Lage freigegeben erzeugt einen",
    bestandsLuecke(alsEintrag(alsFrei[0]), buildRegistry(alsFrei)).luecke,
    true,
  );
}

/** Nur Regionen. Eine Location mit wenig Bestand ist kein Posten. */
{
  const eintraege = [region("musterland", "veroeffentlicht"), ort("halle", "musterland", "veroeffentlicht")];
  const registry = buildRegistry(eintraege);
  gleich("eine Location erzeugt keinen Regionsposten", bestandsLuecke(alsEintrag(eintraege[1]), registry).luecke, false);
}

/* ------------------------------------------------------------------ */
/* Teil 2 — die Bedingung hinter der Entscheidung                      */
/* ------------------------------------------------------------------ */

/**
 * Der Deckel der Antwortkapsel steht als Zahl in validate-content.ts und lässt
 * sich nicht importieren. Er wird deshalb aus der Quelle gelesen — und der
 * Lesevorgang trägt sein eigenes Lebenszeichen: Findet das Muster nichts, ist
 * das ein Fehler und kein stillschweigendes „passt schon" (Lektion 19).
 */
function kapselDeckel(): number | null {
  const quelle = readFileSync(path.join(PROJEKT, "scripts", "validate-content.ts"), "utf8");
  const ab = quelle.indexOf('code: "kapsel-vorhanden"');
  if (ab < 0) return null;
  const block = quelle.slice(ab, ab + 1500);
  const treffer = block.match(/w > (\d+)/);
  return treffer ? Number(treffer[1]) : null;
}

{
  const deckel = kapselDeckel();
  pruefe("der Deckel der Antwortkapsel wurde in validate-content.ts gefunden", deckel !== null, String(deckel));
  gleich("das Mindestmaß für Regionen ist bekannt", typeof minWorte.regionen, "number");

  if (deckel !== null) {
    // Der Kern der Entscheidung: Was bleibt einer Region im schlechtesten
    // erlaubten Fall an eigenem Text? Mindestmaß minus größtmögliche Kapsel.
    const garantiert = minWorte.regionen - deckel;
    pruefe(
      "jede Region der Prüfkette trägt garantiert mehr als 150 eigene Wörter",
      garantiert > 150,
      `garantiert ${garantiert} Wörter (${minWorte.regionen} minus Kapseldeckel ${deckel}) — ` +
        "sinkt das unter 150, ist ein Textarm als Indexschwelle wieder baubar " +
        "und die Begründung in src/lib/regionen.ts neu zu treffen",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Lebenszeichen am echten Register                                    */
/* ------------------------------------------------------------------ */

{
  const regionen = ladeAlle({ collection: "regionen" });
  pruefe("das Register enthält Regionen", regionen.length >= 1, `gefunden: ${regionen.length}`);

  // Die Messung, auf der die Entscheidung beruht, an den echten Dateien:
  // keine einzige Region liegt unter dem Textarm, den eine Schwelle prüfen
  // würde. Fällt eine darunter, wäre die Prüfkette bereits rot — dann sagt
  // dieser Lauf, an welcher Datei.
  const zuKurz = regionen
    .map((r) => ({ slug: r.slug, worte: zaehleWorte(eigenerText(r.body)) }))
    .filter((r) => r.worte < 150);
  gleich("keine Region liegt unter 150 eigenen Wörtern", zuKurz, []);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
