#!/usr/bin/env -S npx tsx
/**
 * test-jsonld.ts — Negativtests für zwei Regeln des JSON-LD-Checks, die
 * beide erst der erste Band- und der erste Artikeleintrag ausgelöst haben.
 *
 * Anlass: Der erste Bandeintrag mit Diskografie hat `check-jsonld.ts` rot
 * gemacht. Der Builder schreibt das Erscheinungsjahr einer Platte als
 * `datePublished: "1988"`, die Datumsprüfung verlangte ein volles
 * Kalenderdatum und meldete zwölfmal „kein ISO-8601-Wert". Die Regel hatte
 * bis dahin nie an einem Album angeschlagen — die Collection war leer. Das
 * ist Lektion 4 in Reinform: Eine Prüfung, die nie angeschlagen hat, ist
 * unbewiesen.
 *
 * Die Ausnahme ist eng: nur `datePublished`, nur an einem `MusicAlbum`.
 * Genau das prüft diese Datei — in beide Richtungen. Ein Test, der nur
 * zeigt, dass das Jahr durchgeht, würde eine Ausnahme belegen, die
 * versehentlich für den ganzen Graphen gilt.
 *
 * Dazu kommt das positive Lebenszeichen: Der Bandbuilder wird aufgerufen und
 * muss tatsächlich ein `MusicAlbum` mit einem nackten Jahr erzeugen. Ohne
 * das belegte „keine Befunde" nichts — es wäre auch dann grün, wenn gar kein
 * Album im Graphen stünde.
 *
 * Die zweite Regel steht am Ende der Datei: die Urheberschaft am Article.
 * Auch sie war widersprüchlich, solange die Collection leer stand.
 *
 *   npx tsx scripts/test-jsonld.ts
 */

import { datumsBefunde, DATUMSFELDER } from "./_jsonld-datum";
import { buildGraph } from "../src/lib/jsonld";
import { site } from "../src/site.config";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
const gleich = (name: string, ist: unknown, soll: unknown) =>
  pruefe(name, JSON.stringify(ist) === JSON.stringify(soll), `ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);

/** Kurzform: die beanstandeten Felder eines Graphen, in Fundreihenfolge. */
const felder = (graph: unknown) => datumsBefunde(graph).map((x) => `${x.feld}=${x.wert}`);

/* ------------------------------------------------------------------ */
/* Die Ausnahme: datePublished am MusicAlbum                           */
/* ------------------------------------------------------------------ */

gleich(
  "Jahr allein am MusicAlbum ist zulaessig",
  felder({ "@graph": [{ "@type": "MusicAlbum", name: "Amphigory", datePublished: "1991" }] }),
  [],
);

gleich(
  "Jahr und Monat am MusicAlbum sind zulaessig",
  felder({ "@graph": [{ "@type": "MusicAlbum", name: "Amphigory", datePublished: "1991-04" }] }),
  [],
);

gleich(
  "volles Datum am MusicAlbum bleibt zulaessig",
  felder({ "@graph": [{ "@type": "MusicAlbum", name: "Amphigory", datePublished: "1991-04-17" }] }),
  [],
);

gleich(
  "zweistellige Jahresangabe faellt auch am MusicAlbum",
  felder({ "@graph": [{ "@type": "MusicAlbum", name: "Amphigory", datePublished: "91" }] }),
  ["datePublished=91"],
);

gleich(
  "Freitext faellt auch am MusicAlbum",
  felder({ "@graph": [{ "@type": "MusicAlbum", name: "Amphigory", datePublished: "Fruehjahr 1991" }] }),
  ["datePublished=Fruehjahr 1991"],
);

/* ------------------------------------------------------------------ */
/* Die Ausnahme bleibt, wo sie hingehoert                              */
/* ------------------------------------------------------------------ */

gleich(
  "startDate ohne Tag faellt — auch im selben Graphen wie ein gueltiges Album",
  felder({
    "@graph": [
      { "@type": "MusicAlbum", name: "Amphigory", datePublished: "1991" },
      { "@type": "MusicEvent", name: "Weekender", startDate: "1991" },
    ],
  }),
  ["startDate=1991"],
);

gleich(
  "datePublished ohne Tag am Article faellt",
  felder({ "@graph": [{ "@type": "Article", headline: "Text", datePublished: "2026" }] }),
  ["datePublished=2026"],
);

gleich(
  "dateModified ohne Tag am MusicAlbum faellt — die Ausnahme gilt nur fuer datePublished",
  felder({ "@graph": [{ "@type": "MusicAlbum", name: "Amphigory", dateModified: "1991" }] }),
  ["dateModified=1991"],
);

gleich(
  "endDate und validThrough ohne Tag fallen ebenfalls",
  felder({
    "@graph": [
      { "@type": "MusicEvent", name: "Weekender", startDate: "2027-01-15", endDate: "2027" },
      { "@type": "Offer", price: "13", validThrough: "2027" },
    ],
  }),
  ["endDate=2027", "validThrough=2027"],
);

/* ------------------------------------------------------------------ */
/* Verschachtelung — der Fall, der real vorkommt                       */
/* ------------------------------------------------------------------ */

gleich(
  "MusicAlbum im album-Feld einer MusicGroup ist zulaessig",
  felder({
    "@graph": [
      {
        "@type": "MusicGroup",
        name: "Testband",
        album: [
          { "@type": "MusicAlbum", name: "Erstes", datePublished: "1988" },
          { "@type": "MusicAlbum", name: "Zweites", datePublished: "1990" },
        ],
      },
    ],
  }),
  [],
);

gleich(
  "ein Jahr an der MusicGroup selbst faellt — der Typ des Knotens entscheidet, nicht die Nachbarschaft",
  felder({
    "@graph": [
      {
        "@type": "MusicGroup",
        name: "Testband",
        datePublished: "1988",
        album: [{ "@type": "MusicAlbum", name: "Erstes", datePublished: "1988" }],
      },
    ],
  }),
  ["datePublished=1988"],
);

gleich(
  "typloses Zwischenobjekt erbt den Typ des umgebenden Knotens",
  felder({
    "@graph": [
      { "@type": "MusicAlbum", name: "Erstes", irgendwas: { datePublished: "1988" } },
      { "@type": "MusicEvent", name: "Weekender", irgendwas: { startDate: "1988" } },
    ],
  }),
  ["startDate=1988"],
);

/* ------------------------------------------------------------------ */
/* Randfaelle des Sammlers                                             */
/* ------------------------------------------------------------------ */

gleich(
  "Listen von Datumswerten werden einzeln geprueft",
  felder({ "@graph": [{ "@type": "MusicEvent", name: "Reihe", startDate: ["2027-01-15", "2027"] }] }),
  ["startDate=2027"],
);

gleich(
  "Nicht-Strings werden uebergangen — Zahlen und Date-Objekte faengt die Serialisierungspruefung",
  felder({ "@graph": [{ "@type": "MusicEvent", name: "Reihe", startDate: 2027 }] }),
  [],
);

gleich("leerer Graph ergibt keine Befunde", felder({ "@graph": [] }), []);

gleich(
  "alle fuenf Datumsfelder stehen unter Beobachtung",
  DATUMSFELDER,
  ["startDate", "endDate", "datePublished", "dateModified", "validThrough"],
);

/* ------------------------------------------------------------------ */
/* Positives Lebenszeichen: der Builder erzeugt das nackte Jahr wirklich */
/* ------------------------------------------------------------------ */

const band = {
  name: "Testband",
  aliases: [],
  kurzbeschreibung: "Testband ist eine erfundene Band, die es nur fuer diesen Test gibt und sonst nirgends.",
  status: "entwurf",
  erstelltAm: new Date("2026-01-01"),
  geprueftAm: new Date("2026-01-01"),
  typ: "band",
  gegruendet: 1987,
  aktiv: true,
  herkunftOrt: "Berlin",
  herkunftLand: "DE",
  genres: ["psychobilly"],
  besetzung: [],
  veroeffentlichungen: [{ titel: "Erstes Album", jahr: 1988, art: "album", label: "Testlabel" }],
  aehnlicheBands: [],
  quellen: [],
  bilder: [],
  faq: [],
  noindex: false,
  links: {},
};

const graph = buildGraph("bands", "testband", band as any);
const alben = JSON.stringify(graph).match(/"@type":"MusicAlbum"/g) ?? [];
pruefe("Bandbuilder erzeugt einen MusicAlbum-Knoten", alben.length === 1, `gefunden: ${alben.length}`);
pruefe(
  "Bandbuilder schreibt das Erscheinungsjahr als nacktes Jahr — ohne diesen Fall waere die Ausnahme gegenstandslos",
  JSON.stringify(graph).includes('"datePublished":"1988"'),
  "kein \"datePublished\":\"1988\" im Graphen",
);
gleich("und dieser real gebaute Graph loest keinen Datumsbefund aus", felder(graph), []);

/* ------------------------------------------------------------------ */
/* Urheberschaft am Article: benannter Autor oder das Register selbst  */
/* ------------------------------------------------------------------ */
/*
 * Derselbe Befund wie oben, an anderer Stelle: `PFLICHT` verlangt `author`
 * an jedem Article, `veroeffentlichungsreife` verlangt einen Autor erst bei
 * der Freigabe. Ein Entwurf ohne Autor erfüllte damit die eine Regel und
 * brach die andere — aufgefallen ist das erst am ersten Artikel.
 */

const artikel = (autor?: string) => ({
  name: "Testartikel",
  aliases: [],
  kurzbeschreibung: "Ein Testartikel ist ein Eintrag, den es nur fuer diesen Test gibt und sonst nirgends.",
  status: "entwurf",
  erstelltAm: new Date("2026-01-01"),
  geprueftAm: new Date("2026-01-01"),
  typ: "pillar",
  saeule: "musik",
  erwaehnteBegriffe: [],
  veroeffentlichtAm: new Date("2026-01-01"),
  ...(autor ? { autor } : {}),
  quellen: [],
  bilder: [],
  faq: [],
  noindex: false,
});

/** Der Article-Knoten eines gebauten Artikelgraphen. */
const articleKnoten = (autor?: string) =>
  (buildGraph("artikel", "testartikel", artikel(autor) as any)["@graph"] as any[]).find((k) =>
    [k["@type"]].flat().includes("Article"),
  );

const ohneAutor = articleKnoten();
pruefe("Artikelgraph enthaelt einen Article-Knoten", Boolean(ohneAutor), "kein Article im @graph");
gleich(
  "ohne autor traegt der Article die Organisation als author",
  ohneAutor?.author,
  { "@id": `${site.url}/#organization` },
);
gleich(
  "mit autor traegt der Article die Person",
  articleKnoten("markus")?.author,
  { "@id": `${site.url}/autoren/markus/#person` },
);
pruefe(
  "author bleibt in jedem Fall gesetzt — PFLICHT verlangt ihn am Article",
  ohneAutor?.author !== undefined && articleKnoten("markus")?.author !== undefined,
);

/* ------------------------------------------------------------------ */

if (fehler.length) {
  console.error(`\n${fehler.length} Prüfung(en) fehlgeschlagen:\n`);
  for (const f of fehler) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
console.log(`${bestanden} Prüfungen bestanden — Datumsregel und Urheberschaft im JSON-LD.`);
