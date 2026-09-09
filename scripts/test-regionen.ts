#!/usr/bin/env -S npx tsx
/**
 * test-regionen.ts — die Regionsschwelle, und die Bedingung, unter der sie so
 * gebaut ist.
 *
 * Zwei Teile, und der zweite ist der ungewöhnliche.
 *
 * TEIL 1 prüft die Schwelle selbst: was zählt mit, was nicht, und schlägt sie
 * genau dann an, wenn sie soll — an der Seite und in der Sitemap. Jede
 * Behauptung hat ihren Gegenfall. Die beiden Entscheidungen in der Zählung
 * (Entwürfe zählen nicht, die Region zählt sich nicht selbst) sind so
 * aufgesetzt, dass ein Fixture kippt, wenn die Entscheidung anders fiele. Ohne
 * diesen Gegenfall wäre „drei Einträge, indexierbar" auch dann wahr, wenn
 * irgendetwas anderes mitgezählt hätte (Lektion 17).
 *
 * TEIL 2 hält fest, warum die Schwelle NUR den Bestand zählt und nicht auch
 * den Text. Vorgesehen war ein ODER; der Textarm kann in diesem Repo nie
 * falsch werden. Er beruht auf zwei Zahlen aus der Prüfkette:
 * `minWorte.regionen` (250 Wörter Fließtext, harter Fehler) und dem Deckel der
 * Antwortkapsel (90 Wörter). Aus beiden folgt, dass jede Region, die die Kette
 * besteht, mindestens 160 Wörter über die Kapsel hinaus trägt — und damit
 * einen Arm, der nach 150 fragt, immer erfüllt.
 *
 * Eine Begründung, die nur im Kommentar steht, verfällt still, sobald jemand
 * eine der beiden Zahlen ändert. Deshalb steht sie hier als Bedingung: Sinkt
 * das Mindestmaß, wird dieser Lauf rot und sagt, dass ein Textarm wieder
 * baubar und die Entscheidung neu zu treffen ist.
 *
 *   npx tsx scripts/test-regionen.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry } from "../src/lib/links";
import { sitemapFuerCollection } from "../src/lib/feeds";
import { zaehleWorte } from "../src/lib/facetten";
import {
  eigenerText,
  regionsBestand,
  regionsIndexierbarkeit,
  istDuenneRegion,
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

interface Fixture {
  collection: CollectionName;
  slug: string;
  daten: Record<string, any>;
  body: string;
}

const KAPSEL = "Musterland ist ein erfundenes Bundesland und dient hier als Prüffall.";
const RUMPF = `${KAPSEL}\n\n## Szene in Musterland\n\nEin zweiter Absatz mit sechs Wörtern mehr.`;

/** `geprueftAm` braucht die Sitemap für `lastmod`. */
const stamm = (slug: string, status: string) => ({ name: slug, status, geprueftAm: "2026-09-01" });

const region = (slug: string, status: string, body = RUMPF): Fixture => ({
  collection: "regionen",
  slug,
  daten: stamm(slug, status),
  body,
});

const ort = (slug: string, regionSlug: string, status: string): Fixture => ({
  collection: "locations",
  slug,
  daten: { ...stamm(slug, status), region: regionSlug },
  body: "",
});

/** Ohne eigenes `region`: erbt es über `ort` aus der Location. */
const event = (slug: string, ortSlug: string, status: string): Fixture => ({
  collection: "events",
  slug,
  daten: { ...stamm(slug, status), ort: ortSlug },
  body: "",
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
/* Teil 1c — regionsIndexierbarkeit                                    */
/* ------------------------------------------------------------------ */

/** Drei freigegebene Einträge — die Seite trägt sich. */
{
  const registry = buildRegistry([
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    ort("schuppen", "musterland", "veroeffentlicht"),
    ort("keller", "musterland", "veroeffentlicht"),
  ]);
  const { indexierbar, grund } = regionsIndexierbarkeit(registry, "musterland", RUMPF);
  gleich("drei freigegebene Einträge: indexierbar", indexierbar, true);
  gleich("wer indexierbar ist, braucht keinen Grund", grund, undefined);
}

/** Zwei freigegebene — einer zu wenig. */
{
  const registry = buildRegistry([
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    ort("schuppen", "musterland", "veroeffentlicht"),
  ]);
  const { indexierbar, grund } = regionsIndexierbarkeit(registry, "musterland", RUMPF);
  gleich("zwei freigegebene Einträge: nicht indexierbar", indexierbar, false);
  pruefe("der Grund nennt Ist und Soll", !!grund?.includes(`2 von ${MIN_REGION_EINTRAEGE}`), grund ?? "kein Grund");
  // `!grund?.includes(…)` allein wäre auch dann wahr, wenn es gar keinen Grund
  // gibt — ein Ergebnis mit zwei Ursachen (Lektion 17). Der Grund muss erst da
  // sein.
  pruefe("der Grund nennt keine Entwürfe, wo keine sind", !!grund && !grund.includes("Entwurf"), grund ?? "kein Grund");
  pruefe("der Grund nennt den eigenen Textumfang", /\d+ eigene Wörter/.test(grund ?? ""), grund ?? "");
}

/**
 * Der Gegenfall zur Entscheidung „Entwürfe zählen nicht mit": Dieselbe Region
 * mit drei Verweisen, aber alle drei sind Entwürfe. Zählten sie mit, wäre die
 * Seite indexierbar — das Fixture unterscheidet die beiden Ursachen.
 */
{
  const registry = buildRegistry([
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "entwurf"),
    ort("schuppen", "musterland", "entwurf"),
    ort("keller", "musterland", "entwurf"),
  ]);
  const { indexierbar, grund } = regionsIndexierbarkeit(registry, "musterland", RUMPF);
  gleich("drei Entwürfe machen eine Region nicht indexierbar", indexierbar, false);
  pruefe("der Grund zählt sie als Entwurf aus", !!grund?.includes("(3 als Entwurf vorhanden)"), grund ?? "");
}

/**
 * Kein Textarm: Auch eine Region mit viel eigenem Text bleibt draußen, wenn
 * ihr Bestand fehlt. Das ist die Entscheidung, die dieser Fall festhält — mit
 * dem alten ODER wäre sie indexierbar gewesen.
 */
{
  const lang = `${KAPSEL}\n\n## Szene in Musterland\n\n${"Wort ".repeat(400)}`;
  const registry = buildRegistry([region("musterland", "veroeffentlicht", lang)]);
  gleich(
    "viel eigener Text ersetzt den Bestand nicht",
    regionsIndexierbarkeit(registry, "musterland", lang).indexierbar,
    false,
  );
  gleich(
    "ohne Rumpf urteilt die Schwelle genauso",
    regionsIndexierbarkeit(registry, "musterland").indexierbar,
    false,
  );
  pruefe(
    "ohne Rumpf nennt der Grund keine Wortzahl",
    !/eigene Wörter/.test(regionsIndexierbarkeit(registry, "musterland").grund ?? ""),
    regionsIndexierbarkeit(registry, "musterland").grund ?? "",
  );
}

/* ------------------------------------------------------------------ */
/* Teil 1d — istDuenneRegion und die Sitemap                           */
/* ------------------------------------------------------------------ */

{
  const duenn = [
    region("musterland", "veroeffentlicht"),
    ort("halle", "musterland", "veroeffentlicht"),
    ort("schuppen", "musterland", "veroeffentlicht"),
  ];
  const dick = [...duenn, ort("keller", "musterland", "veroeffentlicht")];

  const rDuenn = buildRegistry(duenn);
  const rDick = buildRegistry(dick);

  gleich("unter der Schwelle: dünne Region", istDuenneRegion(rDuenn, rDuenn.eintraege.get("regionen/musterland")!), true);
  gleich("über der Schwelle: keine dünne Region", istDuenneRegion(rDick, rDick.eintraege.get("regionen/musterland")!), false);
  // Ohne diesen Fall wäre `istDuenneRegion` in der Sitemap eine Falle: Sie
  // läuft über alle Collections.
  gleich(
    "eine Location ist nie eine dünne Region",
    istDuenneRegion(rDuenn, rDuenn.eintraege.get("locations/halle")!),
    false,
  );

  const pfade = (r: ReturnType<typeof buildRegistry>) => sitemapFuerCollection(r, "regionen").map((e) => e.pfad);
  gleich("die dünne Region fehlt in der Sitemap", pfade(rDuenn), ["/regionen/"]);
  gleich("die tragende Region steht in der Sitemap", pfade(rDick), ["/regionen/", "/regionen/musterland/"]);
  // Die Übersichtsseite bleibt in beiden Fällen drin — sie ist der Einstieg,
  // über den die Seite erreichbar bleibt.
  gleich("die Übersicht bleibt in jedem Fall", pfade(rDuenn)[0], "/regionen/");

  // Und die Sitemap darf sonst nichts verlieren: Locations sind unberührt.
  gleich(
    "Locations bleiben von der Regionsschwelle unberührt",
    sitemapFuerCollection(rDuenn, "locations").map((e) => e.pfad).sort(),
    ["/locations/", "/locations/halle/", "/locations/schuppen/"],
  );
}

/* ------------------------------------------------------------------ */
/* Teil 2 — die Bedingung hinter dem fehlenden Textarm                 */
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
        "sinkt das unter 150, ist ein Textarm neben dem Bestandsarm wieder baubar " +
        "und die Entscheidung in src/lib/regionen.ts neu zu treffen",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Lebenszeichen am echten Register                                    */
/* ------------------------------------------------------------------ */

{
  const regionen = ladeAlle({ collection: "regionen" });
  pruefe("das Register enthält Regionen", regionen.length >= 1, `gefunden: ${regionen.length}`);

  const registry = buildRegistry(
    ladeAlle().filter((e) => e.daten).map((e) => ({ collection: e.collection, slug: e.slug, daten: e.daten! })),
  );

  // Jede echte Region bekommt ein Urteil, und jedes negative trägt einen Grund.
  // Ein Urteil ohne Grund wäre genau das stille noindex, das der Stale-Report
  // verhindern soll.
  const ohneGrund = regionen
    .map((r) => ({ slug: r.slug, ...regionsIndexierbarkeit(registry, r.slug, r.body) }))
    .filter((r) => !r.indexierbar && !r.grund);
  gleich("kein negatives Urteil ohne Grund", ohneGrund, []);

  // Die Messung, auf der die Entscheidung beruht: keine echte Region liegt
  // unter dem Textarm, den ein zweiter Arm prüfen würde. Fällt eine darunter,
  // wäre die Prüfkette bereits rot — dann sagt dieser Lauf, an welcher Datei.
  const zuKurz = regionen
    .map((r) => ({ slug: r.slug, worte: zaehleWorte(eigenerText(r.body)) }))
    .filter((r) => r.worte < 150);
  gleich("keine Region liegt unter 150 eigenen Wörtern", zuKurz, []);
}

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
