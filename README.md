# Datenvertrag, JSON-LD-Graph, Verlinkung und Prüfskripte

Getestet gegen echte Beispieldaten (Astro 7, Zod 4, tsx). Alle Regeln wurden
zusätzlich mit absichtlich kaputten Daten gegengeprüft; der Autolink hat
40 Behauptungen in `scripts/test-links.ts`.

```
astro.config.mjs                       Astro-Grundkonfiguration.
src/site.config.ts                     Domain, Marke, Zeitzone, Marken-sameAs.
src/content/_schemas.ts                Der Datenvertrag. Sechs Entitätstypen.
src/content.config.ts                  Dünner Astro-Wrapper.
src/lib/jsonld/shared.ts               IDs, Knotenfabriken, Mappings.
src/lib/jsonld/builders.ts             Ein Builder je Entitätstyp.
src/lib/jsonld/index.ts                buildGraph() + faktenblockFelder.
src/lib/links.ts                       Registry, Rückverweise, Autolink.
src/lib/registry.ts                    Gecachte Registry für den Build.
src/lib/faktenblock.ts                 Feldbeschriftung und -formatierung.
src/lib/facetten.ts                    Facettenbildung, Indexierungsschwelle.
src/lib/facetten-einleitungen.ts       Liest src/facetten/**/*.md (nur Vite).
src/lib/feeds.ts                       ICS, JSON, RSS, Sitemaps, robots, llms.
src/layouts/BasisLayout.astro          HTML-Rahmen, Meta, JSON-LD, Styles.
src/styles/tokens.css                  Der Design-Vertrag: nur Variablen.
src/styles/basis.css                   Grundgestaltung, nutzt nur Tokens.
src/layouts/EntitaetsLayout.astro      Das universelle Seitengerüst.
src/layouts/ListenLayout.astro         Gerüst für Übersicht und Facetten.
src/components/*.astro                 Faktenblock, FAQ, Quellen, Listen.
src/pages/[typ]/[slug].astro           Entitätsseiten, alle sechs Typen.
src/pages/[typ]/index.astro            Übersicht je Collection.
src/pages/[typ]/[facette]/[wert].astro Facetten- und Reihenseiten.
src/facetten/**/*.md                   Redaktionelle Facetten-Einleitungen.
src/pages/api/events.json.ts           Eventregister als JSON.
src/pages/kalender/[bereich].ics.ts    Kalenderabos, gesamt und je Region.
src/pages/rss.xml.ts                   Neuigkeiten.
src/pages/sitemap-*.xml.ts             Sitemaps je Typ plus Index.
src/pages/robots.txt.ts                Crawler-Freigaben.
src/pages/llms.txt.ts                  Kuratierter Einstiegsindex.
src/pages/daten.astro                  Schnittstellen, Lizenz, Bestand.
scripts/sync-autolinks.ts              Schreibt Lexikon-Links in die Quellen.
scripts/_laden.ts                      Gemeinsamer Content-Loader.
scripts/validate-content.ts            Prüft Frontmatter und Fließtext.
scripts/check-jsonld.ts                Prüft den generierten Graphen.
scripts/test-links.ts                  Sichert die Autolink-Kanten ab.
scripts/test-facetten.ts               Sichert die Indexierungsschwelle ab.
scripts/test-feeds.ts                  Sichert ICS-Kodierung und Feeds ab.
scripts/test-sync-autolinks.ts         Testet den Autolink-Sync in einer
                                       Wegwerf-Arbeitskopie (Idempotenz,
                                       Frontmatter-Unversehrtheit, dry-run).
.github/workflows/ci.yml               verify mit --strict, Autolink-Drift.
.github/workflows/linkcheck.yml        Wöchentlicher Linkcheck, Issue bei Fund.
package.json / tsconfig.json           Abhängigkeiten und Compiler-Basis.
scripts/check-links.ts                 Prüft externe Links, mit Cache und
                                       Warteschlange je Host.
scripts/check-zeitzonen.ts             Statischer Check gegen zonenlose
                                       Datumsverarbeitung.
scripts/stale-report.ts                Was ansteht: Entwürfe, Überfälliges,
                                       Reihen ohne Folgetermin.
scripts/archive-events.ts              Vergangene Termine auf stattgefunden.
.claude/settings.json + hooks/         Guardrails für agentische Zugriffe.
.github/workflows/pflege.yml           Wöchentliche Pflege als Pull Request.
netlify.toml                           Build, CORS- und Content-Type-Header.
src/content/events/_golden-example.md  Referenz-Eintrag (wird nicht gebaut).
```

## Installation

```bash
npm i -D tsx fast-glob gray-matter zod@^3.24
```

```json
{
  "scripts": {
    "validate": "tsx scripts/validate-content.ts",
    "jsonld": "tsx scripts/check-jsonld.ts",
    "test:links": "tsx scripts/test-links.ts",
    "test:facetten": "tsx scripts/test-facetten.ts",
    "test:feeds": "tsx scripts/test-feeds.ts",
    "links:extern": "tsx scripts/check-links.ts",
    "autolink": "tsx scripts/sync-autolinks.ts",
    "verify": "astro check && npm run validate && npm run jsonld && npm run test:links && npm run test:facetten && npm run test:feeds && astro build"
  }
}
```

Als Erstes `src/site.config.ts` anpassen: `url`, `name`, `zeitzone`, `sameAs`.
Die Domain steckt in jedem `@id` — sie später zu ändern heißt, jeden
Knoten-Anker zu ändern.

## Die Seiten

Alle sechs Entitätstypen laufen über **eine** Route: `src/pages/[typ]/[slug].astro`.
Möglich, weil das URL-Präfix jeder Collection ihrem Namen entspricht — definiert
an genau einer Stelle (`urlPrefix` in `_schemas.ts`). Sechs fast identische
Routendateien wären sechs Stellen, an denen etwas auseinanderlaufen kann.

`EntitaetsLayout.astro` gibt die Reihenfolge vor, und die ist nicht
Geschmackssache, sondern die Extraktionsfläche:

```
H1
Antwortkapsel        ← erster Absatz des Fließtexts
Faktenblock          ← generiert aus faktenblockFelder
Inhalt               ← <slot /> mit dem gerenderten Markdown
FAQ                  ← aus dem Frontmatter, deckungsgleich mit dem JSON-LD
Abgeleitete Listen   ← Auftritte, Region, Line-up
Verwandtes
Belege               ← Quellen, Prüfstand, Autor
```

Der Faktenblock wird nicht von Hand geschrieben, sondern aus
`faktenblockFelder` erzeugt — derselben Liste, gegen die `check-jsonld.ts` die
Content Parity prüft. Damit kann er hinter dem JSON-LD nicht zurückbleiben.

Felder ohne Wert und Felder mit dem Wert `unbekannt` erscheinen nicht. Eine
leere Zeile ist keine Information, sondern Rauschen.

Neues Feld ergänzen heißt: Schema → Builder (`verwendeteFelder`) →
`faktenblockFelder` → gegebenenfalls `LABEL` und ein Formatierungsfall in
`src/lib/faktenblock.ts`. Vergisst man einen der mittleren Schritte, meldet
sich der Paritätstest.

## Rückverweise werden abgeleitet

Keine dieser Beziehungen wird im Frontmatter gepflegt:

| Seite | zeigt | aus |
|---|---|---|
| Band | Kommende und frühere Auftritte | `auftritte()` über `lineupBands` der Events |
| Region | Events, Bands, Locations der Region | `inRegion()` über das Feld `region` |
| Event | Bands mit eigenem Profil | `aufloesenViele()` |
| alle | Verwandtes | `verwandtes()`, ein- und ausgehende Kanten |

Ein Recherche-Agent, der ein Event anlegt, aktualisiert damit automatisch die
Band-, Location- und Regionsseiten. Keine doppelte Datenhaltung, kein
Auseinanderlaufen.

Die Registry wird pro Build **einmal** aufgebaut (`src/lib/registry.ts`).
Ohne den Cache baut jede Seite den kompletten Index neu.

## Übersichts- und Facettenseiten

Ein Grundsatz nimmt hier die halbe Komplexität weg:

> **Wo eine Entität existiert, gibt es keine Facette.**

`/events/region/rhein-neckar/` wäre eine dünnere Kopie von
`/regionen/rhein-neckar/`, das über `inRegion()` ohnehin alles der Region
bündelt. Dasselbe gilt für Genres — die Lexikonseite ist die kanonische
Adresse des Begriffs. Übrig bleiben Facetten über Werte, die keine eigene
Entität sind:

| Route | Facette |
|---|---|
| `/events/jahr/2027/` | Jahresarchiv |
| `/events/typ/weekender/` | Veranstaltungsart |
| `/events/reihe/{slug}/` | Alle Ausgaben einer Reihe |
| `/lexikon/kategorie/mode/` | Lexikonkategorie |
| `/artikel/saeule/musik/` | Themenbereich |

Das Facettensegment liegt **zwischen** Collection und Wert. Damit kann sich
`/events/jahr/2027/` niemals mit `/events/{slug}/` überschneiden. Die
Segmentnamen stehen in `RESERVIERTE_SEGMENTE`, und `validate-content.ts`
lehnt einen Entitäts-Slug ab, der eines davon belegt.

Die Reihenseiten sind der Grund, warum das `superEvent` im JSON-LD auf
`/events/reihe/{slug}/` zeigt: Die Seite wird aus den Ausgaben generiert und
hat keine eigene Content-Datei.

### Der Indexierungs-Schwellenwert

Eine Facettenseite wird nur indexiert, wenn beides zutrifft:

1. mindestens `MIN_EINTRAEGE` Einträge (Voreinstellung 5, Jahresarchive 3,
   Reihen 2)
2. eine redaktionelle Einleitung mit mindestens 150 Wörtern unter
   `src/facetten/{collection}/{segment}/{wert}.md`

Punkt 2 ist **absichtlich nicht automatisierbar**. Eine generierte Einleitung
wäre genau der Thin Content, den der Schwellenwert verhindern soll. Bis
jemand sie schreibt, ist die Seite erreichbar, aber `noindex, follow` — sie
vererbt also Linkkraft weiter, ohne den Index zu verwässern. Reihenseiten
sind die einzige Ausnahme ohne Einleitungspflicht: Sie bestehen aus den
Ausgaben selbst, es gibt nichts zu erklären.

In der Entwicklungsansicht steht auf jeder noindex-Facette, was ihr fehlt —
etwa „nur 2 von 5 nötigen Einträgen" oder der Pfad der fehlenden
Einleitungsdatei.

Die Einleitungen sind bewusst **keine** Content Collection: Sie haben kein
Frontmatter, keine Belegkette und keinen Lebenszyklus und gehören deshalb
nicht in den Datenvertrag. Sie liegen in einem eigenen Modul, weil
`import.meta.glob` nur unter Vite existiert — so bleibt `facetten.ts` in
Node-Skripten und Tests importierbar. Das war kein Schönheitsproblem: ohne
die Trennung ließe sich der Schwellenwert nicht testen.

## Maschinenschnittstellen

Hier liegt der eigentliche Hebel, und zwar nicht der, den die GEO-Ratgeber
verkaufen. llms.txt wird von den großen KI-Crawlern derzeit praktisch nicht
abgerufen — sie holen HTML. Was Agenten und Nachnutzer wirklich verwerten
können, sind saubere, dokumentierte Feeds unter einer klaren Lizenz. Wer die
Daten nachnutzt, nennt die Quelle, und genau daraus entstehen die verteilten,
konsistenten Erwähnungen, aus denen Entitätsautorität wächst.

| Endpunkt | Inhalt |
|---|---|
| `/api/events.json` | Vollständiges Eventregister, CORS offen |
| `/kalender/alle.ics` | Alle Termine zum Abonnieren |
| `/kalender/{region}.ics` | Termine je Region |
| `/rss.xml` | Zuletzt erfasst und aktualisiert |
| `/sitemap-index.xml` | Verweist auf eine Sitemap je Entitätstyp |
| `/robots.txt` | KI-Crawler ausdrücklich erlaubt |
| `/llms.txt` | Kuratierter Index, Feeds zuerst |
| `/daten/` | Schnittstellen, Lizenz, Bestand, Nutzungshinweise |

Die Sitemap ist bewusst **nach Typ getrennt**: Die Search Console meldet
Indexierungsprobleme pro Datei, was die Fehlersuche erheblich verkürzt.
`sitemap-seiten.xml` enthält nur Facetten, die den Indexierungs-Schwellenwert
bestehen — eine Sitemap, die noindex-Seiten listet, sendet widersprüchliche
Signale.

Das JSON-Feed-Format ist bewusst flach und benutzt keine internen Feldnamen,
die sich noch ändern können. Eine öffentliche Schnittstelle ist ein
Versprechen.

### Warum ICS eigene Tests bekommt

`scripts/test-feeds.ts` prüft die iCalendar-Kodierung mit 44 Behauptungen,
und das ist keine Überversicherung. Feeds werden von fremden Programmen
gelesen, die keine Nachsicht kennen:

- Ein nicht maskiertes Komma in `LOCATION` zerlegt das Feld.
- Zeilen über 75 Oktette müssen nach RFC 5545 gefaltet werden — und zwar
  nach **Bytes**, nicht nach Zeichen. Wer nach Zeichen faltet, zerschneidet
  irgendwann einen Umlaut mitten in seiner UTF-8-Sequenz.
- `DTEND` ist bei ganztägigen Terminen **exklusiv**, also der Folgetag. Wer
  das übersieht, zeigt jedes Festival einen Tag zu kurz an.

Der Kerntest faltet das Ergebnis wieder auf, entmaskiert es und vergleicht es
Zeichen für Zeichen mit dem Original. Genau dort fällt ein zerschnittener
Umlaut auf und sonst nirgends — im Browser sieht man davon nichts.

## Externe Links prüfen

Interne Referenzen prüft `validate-content.ts` zur Build-Zeit. Externe kann
nur das Netz beantworten, deshalb ein eigenes Skript mit Cache,
Nebenläufigkeit und Höchstalter-Regel. Ein Lauf, der zehn Minuten dauert,
wird nicht ausgeführt.

```bash
npm run links:extern                        # nutzt .cache/link-check.json
npm run links:extern -- --max-age 7         # Cache-Alter in Tagen
npm run links:extern -- --no-cache --strict # in der CI
```

Die Bewertung ist absichtlich abgestuft, weil ein einzelner Timeout keinen
Build brechen darf:

| Befund | Ebene | Begründung |
|---|---|---|
| 4xx | Fehler | Die Seite ist weg |
| 5xx, 429, Timeout, DNS | Warnung | Vorübergehend oder Bot-Abwehr |
| Weiterleitung auf anderen Host | Warnung | Domain verkauft, Veranstalter aufgegeben, Shop übernommen — immer ansehen |
| http → https (gleicher Host) | Warnung | Kein Umzug — Link direkt auf https umstellen |

`--concurrency` steuert die Zahl gleichzeitig bearbeiteter **Hosts**; je Host
läuft eine eigene Warteschlange mit Pause (`--pause`, Standard 250 ms) —
acht parallele Anfragen an denselben Server wären bei 500 Discogs-Links
keine Prüfung mehr, sondern ein kleiner Angriff.

### Zeitzonen-Konvention

Vier Fehler derselben Klasse in einer Codebasis sind kein Zufall. Die Regel
steht deshalb als Check, nicht als Merksatz: `check-zeitzonen.ts` verbietet
lokale Datums-Getter (`getFullYear` & Co.), `toLocaleString`-Formatierung
und `Intl.DateTimeFormat` ohne `timeZone` in `src/` und `scripts/`
(Test-Dateien ausgenommen — dort ist `TZ=UTC` teils Absicht). Bewusste
Ausnahmen markiert ein `zeitzone-ok`-Kommentar auf der Zeile, mit Begründung.
Der Check läuft in `verify` und in der CI — und fand beim allerersten Lauf
prompt die vierte Instanz (Quellen.astro, „Zuletzt geprüft am").

Für ein Register ist das kein Nebenschauplatz: Es lebt von Verweisen auf
Veranstalter-, Band- und Ticketseiten, und genau die verschwinden. Tote
Weblinks sind der sichtbarste Verfall eines Verzeichnisses.

## Autolink: in die Quelle, nicht beim Rendern

`scripts/sync-autolinks.ts` schreibt die Lexikon-Verlinkung in die
Markdown-Dateien, statt sie beim Rendern einzusetzen. Drei Gründe:

- Die Links stehen im Git-Diff und sind vor dem Deploy überprüfbar. Eine
  automatische Verlinkung, die niemand zu Gesicht bekommt, verlinkt irgendwann
  etwas Dummes und keiner merkt es.
- Astros Markdown-Pipeline bleibt unangetastet.
- `validate-content.ts` zählt interne Links im Quelltext. Nach dem Lauf stimmt
  diese Zählung mit dem überein, was die Seite zeigt. Die frühere
  Wechselwirkung zwischen Autolink und Linkzählung entfällt damit.

Der Lauf ist idempotent — bestehende Links sind geschützt und sperren ihr
Ziel. Wächst das Lexikon, kommen beim nächsten Lauf neue Links dazu. Nur der
Body wird ersetzt, das Frontmatter bleibt zeichengenau erhalten.

```bash
npm run autolink -- --dry-run     # zeigen, was passieren würde
npm run autolink                  # schreiben
npm run autolink -- --max 8       # Linkbudget je Dokument
```

Sinnvoll als Schritt vor `npm run verify`, nicht als Hook nach jedem
Schreibvorgang: Sonst ändert sich eine Datei, während der Agent noch an ihr
arbeitet.

## Aufrufe

```bash
npm run validate
npm run jsonld
npm run test:links
npx tsx scripts/check-jsonld.ts --print events/walldorf-weekender-2026   # Graph ansehen
npx tsx scripts/validate-content.ts --changed src/content/events/x.md    # für Hooks
npx tsx scripts/check-jsonld.ts --collection bands --strict --json
```

Exit 0 = sauber, 1 = Fehler. `--strict` macht Warnungen zu Fehlern (für CI).

## Als PostToolUse-Hook

`.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "\"${CLAUDE_PROJECT_DIR}\"/scripts/hooks/validate-changed.sh" }
        ]
      }
    ]
  }
}
```

`scripts/hooks/validate-changed.sh` (`chmod +x`):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"
DATEI=$(jq -r '.tool_input.file_path // empty')
case "$DATEI" in
  *"/src/content/"*.md) ;;
  *) exit 0 ;;
esac
npx tsx scripts/validate-content.ts --changed "$DATEI" || exit 1
npx tsx scripts/check-jsonld.ts    --changed "$DATEI" || exit 1
```

## Die tragenden Entscheidungen

**Schemas leben außerhalb von `astro:content`.** `zod` wird direkt importiert,
damit Build, CLI, CI und Hooks dieselbe Definition nutzen.

**Referenzen sind Slug-Strings, nicht `reference()`.** Astros `reference()`
kann `artikel.hauptentitaet` (variable Ziel-Collection) nicht abbilden. Alle
Referenzprüfungen laufen zentral in den Skripten.

**`@id` liegt immer auf der eigenen Domain.** Wikidata und Wikipedia
ausschließlich in `sameAs`. `check-jsonld.ts` erzwingt das.

**Content Parity ist maschinell geprüft.** Jeder Builder deklariert
`verwendeteFelder`; `faktenblockFelder` listet, was sichtbar gerendert wird.
`check-jsonld.ts` bildet die Differenz. Layouts sollten den Faktenblock aus
`faktenblockFelder` generieren, statt Felder von Hand auszugeben.

**Rückverweise werden abgeleitet, nicht gepflegt.** Die Bandseite zeigt ihre
Auftritte, weil `auftritte()` sie aus den Eventdaten zieht. Die Regionsseite
bündelt alles über `inRegion()`. Keine doppelte Datenhaltung, kein
Auseinanderlaufen.

## Der Autolink

Verlinkt jeden Lexikonbegriff genau einmal pro Dokument, beim **frühesten**
Vorkommen im freien Text. Das ist der größte Einzelhebel für semantische
Dichte: Über hunderte Artikel entsteht eine vollständige, konsistente interne
Verlinkung, um die sich beim Schreiben niemand kümmern muss.

Abgesichert in `scripts/test-links.ts`:

| Fall | Verhalten |
|---|---|
| Codeblock, Inline-Code, HTML-Tag | unangetastet |
| Überschrift | nicht verlinkt |
| Bestehender manueller Link | sperrt das Ziel, verbraucht kein Kontingent |
| Nackte URL | unangetastet |
| Tabellentrennzeile | unangetastet, Zellen aber schon |
| Zweites Vorkommen | nicht verlinkt |
| Alias und Name | ein Link, beim frühesten Vorkommen |
| `Neo-Rockabilly` | verlinkt den langen Begriff, nicht den kurzen |
| `Rockabilly-Weekender` | verlinkt `Rockabilly` |
| `Rockabillymusik` | kein Treffer im Wortinneren |
| `Petticoats` | Flexionsendung wird mitgenommen |
| Eigene Lexikonseite | keine Selbstverlinkung |
| `maxLinks` | gilt über Segmentgrenzen hinweg |

Die Wortgrenzen sind asymmetrisch, und das mit Absicht: Ein **vorangehender**
Bindestrich blockiert, ein **folgender** nicht. Deutsche Komposita hängen sich
hinten an. Umlaute funktionieren, weil statt `\b` Unicode-Lookarounds
verwendet werden.

Zwei Stellschrauben in `src/lib/links.ts`: `FLEXION` (welche Endungen dürfen
folgen — nur bei einteiligen Begriffen) und `maxLinks` (Voreinstellung 12,
gegen Link-Soup).

## Was die Prüfskripte abdecken

**`check-jsonld.ts`** — Serialisierbarkeit, `@context`, `@type`/`@id` je
Knoten, ID-Eindeutigkeit, ID auf eigener Domain, Hauptknoten vorhanden,
Pflichtfelder je schema.org-Typ, Auflösung jeder `@id`-Referenz, `sameAs`
(https, absolut, keine Dubletten, nie die eigene Domain), ISO-8601-Daten,
absolute URLs, Event-Zeitraum, Offer-Preis und -Verfügbarkeit,
Breadcrumb-Positionen, Content Parity.

**`validate-content.ts`** — Zod-Vertrag (`.strict()`), Antwortkapsel,
Überschriftenhierarchie, Mindestlänge, Platzhalter, Belegkette,
Quellenaktualität, Referenzintegrität, tote interne Links, Event-Zeitraum und
-Status, Preiswidersprüche, Bandjahre, Reihenname, Lexikon-Definition,
FAQ-Mindestzahl, HowTo-Vollständigkeit, Bildrechte, Veröffentlichungsreife,
Prüfkadenz, Namens- und Alias-Duplikate, verwaiste Bands aus Line-ups.

## Eine Wechselwirkung, die du kennen solltest

Die Regel `interne-links` in `validate-content.ts` zählt die Links im
**Quelltext**. Der Autolink setzt seine Links erst beim Rendern. Eine Seite
kann also die Warnung auslösen und im Ergebnis trotzdem gut verlinkt sein.
Zwei Wege: den Schwellenwert senken, oder die Regel gegen
`autolink(...).verlinkt.length + interneLinks(...).length` prüfen lassen. Ich
würde Letzteres tun, sobald das Lexikon über etwa 50 Begriffe hinaus ist —
vorher ist der Autolink noch zu dünn, um sich darauf zu verlassen.

## Modellierungsentscheidungen, die im Code stecken

**Line-up zweigeteilt.** `lineupBands` (eigene Seite) wird zur `@id`-Referenz,
`lineupWeitere` zu einem benannten `MusicGroup`-Knoten ohne ID. Beides ist
wahr, nur unterschiedlich tief modelliert — und Recherche-Agenten legen keine
Bandseiten im Vorbeigehen an.

**Reihen sind generierte Seiten.** `/events/{reihe}/` entsteht aus allen
Ausgaben, ohne eigene Content-Datei. Deshalb ist `superEvent` ein
vollständiger `EventSeries`-Knoten und keine Referenz — und `reiheName` ist
Pflicht, sobald `reihe` gesetzt ist.

**Ortszeit statt UTC.** `startDate` wird als `2026-05-22T18:00:00+02:00`
ausgegeben, nicht als `16:00:00Z`. Ein Event beginnt um 18 Uhr vor Ort.

**Offizielle Website in `sameAs`.** Bei fremden Entitäten ist `url` unsere
Seite über die Entität; die offizielle Domain ist das stärkste
Identitätssignal.

**„unbekannt" erzeugt keine Aussage.** `barrierefrei: unbekannt` landet nicht
im Graphen. Ein leeres Feld ist ehrlicher als ein falsches.

## Verifiziert

Der komplette Stand wurde in einer echten Astro-5.18-Installation gebaut:
19 Seiten plus 13 Feed-Dateien aus 6 Fixtures, alle fünf Prüfskripte grün,
JSON-LD im ausgelieferten HTML, Faktenblock und abgeleitete Listen im
gerenderten Markup, Autolink-Sync zweimal hintereinander ohne Änderung im
zweiten Lauf, Facettenseiten korrekt auf `noindex, follow` mit gerenderter
Einleitung. Der externe Linkcheck lief gegen das echte Netz — inklusive
Negativtest mit einer 404-URL und Nachweis, dass der Cache im zweiten Lauf
greift.

Drei Fehler sind dabei aufgefallen und behoben: Der Faktenblock formatierte
Uhrzeiten in der Zeitzone des Build-Servers statt der der Site (aus 18 Uhr
wurde auf einem UTC-Runner 16 Uhr), der Autolink griff wegen einer zu
strengen Wortgrenze bei keinem einzigen deutschen Kompositum, und die
Facettenlogik war zunächst an `import.meta.glob` gekettet und damit außerhalb
von Astro weder importierbar noch testbar.

## Was noch fehlt

1. **Design.** `BasisLayout.astro` ist absichtlich nackt — dort gehört
   Gestaltung hin, keine Logik.
2. **Paginierung** auf Übersichtsseiten. Das Segment `seite` ist bereits
   reserviert, die Logik fehlt. Relevant ab etwa 200 Einträgen je Collection.
3. **Autoren-Collection.** `autor` ist ein ungeprüfter Slug; `check-jsonld.ts`
   lässt `/autoren/*` deshalb bewusst durch.
5. **Impressum und Datenschutz** — in Deutschland Pflicht und zugleich ein
   Vertrauenssignal. Dazu die Methodik-Seite: Wie wird recherchiert, geprüft,
   aufgenommen? Gibt es bezahlte Einträge? Diese Seite wird selten gebaut und
   wirkt stark.
6. **`inRegion()`** um untergeordnete Regionen erweitern, sobald die Hierarchie
   mehr als eine Ebene hat.
7. **Startwerte anpassen**: `minWorte`, `pruefKadenzTage`,
   `belegpflichtigeFelder`, `maxLinks` sind Vorschläge, keine Wahrheit.
