# Code Review — Vintage & Rockabilly Szenen-Guide

Stand: 29. August 2026 · Geprüft: alles, was in dieser Session entstanden ist
(46 Dateien: Datenvertrag, Validatoren, JSON-LD-Graph, Verlinkung, Layouts,
Facetten, Feeds, Linkcheck).

**Vorgehen:** Jeder Verdacht wurde vor Aufnahme in diesen Bericht am laufenden
Code verifiziert — durch gezielte Testläufe, Negativtests oder Inspektion des
gebauten HTML. Befunde ohne Nachweis stehen nicht hier. Kritische und hohe
Befunde wurden im Zuge des Reviews behoben, jeweils mit Regressionstest;
mittlere und niedrige sind mit Empfehlung dokumentiert und offen.

Nach den Korrekturen: alle fünf Prüfskripte grün (42 + 23 + 47 Behauptungen
in den Testharnischen plus die zwei Validator-Suiten), Build mit 19 Seiten und
13 Feed-Dateien fehlerfrei.

---

## 1. Kritische Befunde — behoben

### K1 · `</script>` im Inhalt bricht aus dem JSON-LD aus

**Fundort:** `BasisLayout.astro` (`set:html={JSON.stringify(graph)}`)
**Nachweis:** `JSON.stringify` maskiert `<` nicht. Eine `definition` mit
`</script><b>x</b>` beendete im gebauten HTML das Script-Element mitten im
Graphen; der Rest wurde als HTML interpretiert.
**Warum das hier real ist:** Die Kurzbeschreibungen schreiben
Recherche-Agenten aus Webquellen ab. Ein Veranstaltertext mit HTML-Resten
reicht — das ist kein theoretischer Angreifer, sondern der normale Betrieb.
**Fix:** `jsonldSicher()` in `src/lib/jsonld/index.ts` maskiert `<`, `>`,
U+2028/U+2029 als Unicode-Escapes; das Layout verwendet ausschließlich diese
Funktion. Verifiziert im Build: Der Block bleibt intakt, `JSON.parse` liefert
den Text unverfälscht zurück. Regressionstest in `test-feeds.ts`.

### K2 · Events ohne explizite Region waren regional unsichtbar

**Fundort:** `links.ts` / `_schemas.ts`
**Nachweis:** Das Schema kommentiert bei `events.region` „wird sonst aus der
Location abgeleitet" — abgeleitet hat es niemand. Ein Event ohne das Feld
erschien weder auf der Regionsseite (`inRegion()`) noch im regionalen
ICS-Feed noch im `region`-Feld des JSON-Feeds.
**Warum das schwer wiegt:** Die Regionsseiten sind laut Architektur der
strategisch wertvollste Seitentyp, und der Fehler ist still — nichts bricht,
es fehlt nur etwas.
**Fix:** `buildRegistry()` löst das Versprechen jetzt ein: erste Passage
sammelt die Regionen der Locations, Events ohne `region` erben sie
(nicht-destruktiv, per Kopie der Daten). Damit ziehen Regionsseite,
Kalender-Feed und JSON-Feed automatisch nach. Zwei Regressionstests in
`test-links.ts`.

### K3 · `--changed` mit gelöschtem Pfad stürzt ab

**Fundort:** `scripts/_laden.ts`
**Nachweis:** `validate-content.ts --changed <gelöschte-datei>` endete mit
ungefangenem `readFileSync`-Fehler. Der ursprüngliche Loader hatte einen
`existsSync`-Filter; beim Refactoring auf den gemeinsamen Loader ist er
verloren gegangen — ein klassischer Refactoring-Regress, den kein Test hielt.
**Warum das zählt:** Genau dieser Aufrufpfad ist der PostToolUse-Hook. Ein
Hook, der bei Umbenennungen crasht, wird irgendwann abgeschaltet.
**Fix:** Explizit übergebene Pfade werden auf Existenz gefiltert;
nicht vorhandene Dateien sind „nichts zu prüfen", kein Fehler.

---

## 2. Hohe Befunde — behoben

### H1 · Jahresfacette rechnete in der Server-Zeitzone

`new Date(beginn).getFullYear()` auf einem UTC-Runner steckt einen
Silvesterball (01.01., 00:30 Uhr Ortszeit) ins Vorjahr — nachgewiesen mit
`TZ=UTC`. Dritter Zeitzonenfehler derselben Klasse in dieser Codebasis
(nach JSON-LD-`startDate` und Faktenblock-Anzeige); das Muster ist
offensichtlich systematisch. **Fix:** Jahresermittlung über `Intl` in
`site.zeitzone`, Regressionstest läuft unter `TZ=UTC`.
**Empfehlung darüber hinaus:** eine Lint-Regel oder Konvention, die
`getFullYear`/`toLocaleString` ohne explizite Zeitzone im `src/`-Baum
verbietet — die vierte Instanz kommt sonst bestimmt.

### H2 · `nofollow` auf den eigenen Identitätslinks

Der Faktenblock setzte `rel="nofollow"` auf alle externen Links — also auch
auf offizielle Websites, Discogs, MusicBrainz, Wikidata. Das sind dieselben
URLs, die im JSON-LD als `sameAs` stehen: Sichtbar entwertet, was maschinell
behauptet wird, konterkariert die eigene Entitätsstrategie. **Fix:**
Faktenblock-Links tragen nur noch `noopener`; `nofollow` bleibt den
Belegquellen in `Quellen.astro` vorbehalten, wo es hingehört.

### H3 · Jede Seite verlinkte auf einen internen 404

`/autoren/{slug}/` existiert nicht, wurde aber aus Faktenblock, Quellen-Fußzeile
und als `url` im Person-Knoten verlinkt — ein toter interner Link auf jeder
einzelnen Seite, ausgerechnet am E-E-A-T-Signal. **Fix:** Autor wird als Text
gerendert, der Person-Knoten trägt nur noch die `@id` (eine URI muss nicht
auflösen, eine deklarierte `url` schon). Der richtige Fix bleibt die
Autoren-Collection; bis dahin ist kein Link ehrlicher als ein toter.

### H4 · Solokünstler bekamen ungültiges Markup

`typ: solo|dj` erzeugte `Person` mit `genre` — eine Eigenschaft, die
schema.org auf Person nicht kennt. Ausgerechnet die Kante ins Lexikon, die
den Genre-Graphen trägt, wäre bei Solokünstlern ungültig gewesen. **Fix:**
Durchgängig `MusicGroup` — schema.org definiert den Typ ausdrücklich
einschließlich Einzelmusiker. Im Build verifiziert.

### H5 · `accessibilityFeature` ist auf Place ungültig

CreativeWork-Eigenschaft, auf `MusicVenue` fehl am Platz. **Fix:**
`amenityFeature` mit `LocationFeatureSpecification` („Rollstuhlgerecht",
`value: true/false`), jetzt auch für `teilweise`. Im Build verifiziert.

---

## 3. Mittlere Befunde — mit Empfehlung (M0, M00 und M8 erledigt, Rest offen)

**M00 · `validate-content.ts` hat keinen Testharnisch.** — **erledigt am
2026-09-02.** `scripts/test-validate.ts` steht, als `npm run test:validate`
eingetragen und an `npm run test` gehängt: 62 Fixtures in einem
Temp-Register mit symlinkten `scripts` und `node_modules`, ein einziger
`--json --changed`-Lauf, 165 Behauptungen gegen `code` und `ebene`. Je Regel
ein anschlagender und ein sauberer Fall; wo die Ebene am `status` hängt,
werden beide geprüft. Mutationsbeleg nach Lektion 7: drei Regeln einzeln
deaktiviert, jeweils fielen die zugehörigen Prüfungen (3 / 1 / 2), danach
zurückgebaut. Protokoll in `ENTSCHEIDUNGEN.md`. Der ursprüngliche Befund:
`npm run test` deckt Links, Facetten, Feeds, Autolink und Hooks ab — die
Regelsammlung des Inhaltsvalidators nicht, obwohl dort inzwischen über
zwanzig Regeln stehen und sie die schärfsten des Projekts sind. Negativtests
nach Lektion 7 laufen deshalb von Hand und hinterlassen keine Spur; die
Prüfung der Prüfung existiert nicht. Zuletzt aufgefallen bei der Anpassung
von `interne-links` an den leeren Registerzustand. Empfehlung:
`scripts/test-validate.ts` nach dem Muster von `test-hooks.ts` — Regel,
absichtlich kaputter Eintrag, erwarteter Befund — und in `npm run test`
aufnehmen.

**M0 · `felder: [alle]` schaltet die Belegpflicht komplett ab.** — **erledigt
am 2026-09-02.** `alle` ist ersatzlos gestrichen: Der Kurzschluss
`if (belegt.has("alle")) return []` ist aus `belegpflicht` entfernt, und die
neue Regel `quellen-felder-gueltig` erklärt den Wert für ungültig. Gültig ist
in `quellen[].felder` nur noch ein Feldname der jeweiligen Collection (aus
dem Schema gelesen, nicht als zweite Liste gepflegt) oder das Muster
`body:<abschnitt>` für Aussagen im Fließtext. Fehler bei `status:
veroeffentlicht`, sonst Warnung. Der Petticoat-Eintrag ist nachgezogen.
Negativtest nach Lektion 7 durchgeführt und in `ENTSCHEIDUNGEN.md`
protokolliert — inklusive des Nachweises, dass `belegpflicht` mit dem
Kurzschluss schwieg und ohne ihn anschlägt. Der ursprüngliche Befund:
`belegpflicht` in `validate-content.ts` steigt bei `if (belegt.has("alle"))
return []` sofort aus. Eine einzige Quelle mit `felder: [alle]` genügt also,
damit kein einziges belegpflichtiges Feld mehr geprüft wird — und `[alle]`
ist die Angabe, die ein Recherche-Agent schreibt, wenn er die Zuordnung
nicht leisten kann. Nachgewiesen am Lexikoneintrag „Petticoat", der mit
`[alle]` durch alle Prüfungen lief und dessen Quellen die Behauptungen
teilweise nicht deckten. Empfehlung: `[alle]` nur noch akzeptieren, wenn der
Eintrag genau eine Quelle hat, oder ganz streichen und die Felder immer
einzeln verlangen. Zusätzlich denkbar: `[alle]` bei `status:
veroeffentlicht` als Fehler werten. Vor der Umsetzung Negativtest nach
Lektion 7 — die Regel hat bisher nie angeschlagen.

**M10 · Die Freigabeprüfung läuft in der CI überhaupt nicht — aus zwei
unabhängigen Gründen.** `scripts/check-freigabe.ts` (Schicht 3 gegen M8) ist
im Pull Request wirkungslos, und zwar doppelt:

1. **Die CI ruft sie nicht auf.** `ci.yml` zählt seine Schritte einzeln auf
   (`npm run check`, `check-zeitzonen`, `validate-content --strict`,
   `check-jsonld --strict`, `npm test`, `sync-autolinks --check`,
   `npm run build`) und führt gerade **nicht** `npm run verify` aus. Die
   Prüfung hängt an `verify` und hat in der CI keinen Schritt.
   **Nachgewiesen** am Lauf zu diesem PR: Im Job-Log kommt das Wort
   „Freigabeprüfung" kein einziges Mal vor. `npm test` führt zwar
   `test:freigabe` aus — das ist aber der Test *der* Prüfung, nicht die
   Prüfung des Registers.
2. **Selbst mit Schritt fehlte die Basis.** `actions/checkout@v4` klont in
   der Standardtiefe 1. **Nachgewiesen:** `git clone --depth 1` auf dieses
   Repository liefert genau einen Commit, `origin/main~1` ist „not a valid
   object name".

Wirksam ist die Prüfung damit nur lokal, wo CLAUDE.md `npm run verify` vor
jedem Commit verlangt. Empfehlung, beides zusammen: `fetch-depth: 0` im
Checkout-Schritt und ein eigener Schritt
`npx tsx scripts/check-freigabe.ts --basis-pflicht`; die Flagge existiert
bereits und macht die fehlende Basis zum Fehler statt zum Hinweis. Nicht
mitbehoben, weil `.github/` für Agenten gesperrt ist — und diese Sperre ist
Gegenstand desselben Befunds, an dem gerade gearbeitet wurde. Negativtest
nach Lektion 7 liegt vor: `test-freigabe.ts` prüft beide Zweige (fehlende
Basis ohne Flagge = Exit 0 mit Hinweis, mit Flagge = Exit 1).

**Lehre daraus, über diesen Befund hinaus:** Dass `verify` und die CI
dieselben Schritte *aufzählen*, statt dass die CI `verify` aufruft, heißt,
dass jeder neue Prüfschritt an zwei Stellen eingetragen werden muss — und
der zweite Ort liegt hinter einer Sperre. Ein Schritt, der nur in `verify`
steht, sieht lokal grün aus und existiert in der CI nicht. Das ist die
gleiche Klasse wie Lektion 15: eine Prüfung, die nicht aufgerufen wird,
meldet ihr Schweigen nicht.

**M8 · Die Hook-Sperren greifen nur bei `Write`/`Edit`, nicht bei Bash.** —
**behoben am 2026-09-03, mit dokumentierter Restlücke.** Die Absicherung
liegt jetzt in drei Schichten, die unterschiedlich versagen:

1. **`permissions.deny` in `settings.json`** — vier `Edit()`-Regeln für
   `_schemas.ts`, `site.config.ts`, `.claude/` und `.github/`. Sie hängen
   nicht am Hook-Matcher, gelten auch für die Shell-Dateibefehle, die Claude
   Code kennt (`cat`, `head`, `tail`, `sed`), und prüfen das Ziel einer
   Ausgabeumleitung mit. Bewusst `Edit(...)`, nicht `Read(...)`: Eine
   Read-Sperre würde den Datenvertrag auch fürs Lesen und für die Suche
   schließen.
2. **`guard.mjs` mit Matcher `Bash`** — prüft `tool_input.command` auf
   Schreibverben (`sed -i`, `tee`, `cp`, `mv`, `dd`, `truncate`, `rsync`,
   `patch`, `perl -pi`, `git checkout/restore/apply`, `>`, `>>`) an
   gesperrten Pfaden, und den Veröffentlichungsstatus zusammen mit einem
   Pfad unter `src/content/`.
3. **`scripts/check-freigabe.ts`** — fragt nicht, wer geschrieben hat,
   sondern was dasteht: Statuswechsel gegen die Basis, unversionierte
   Dateien eingeschlossen. Teil von `npm run verify`.

**Restlücke — bitte nicht überschätzen:** Schicht 2 erkennt Muster, keine
Absichten. Kodierte Befehle, Skripte, die anderswo geschrieben und dann
ausgeführt werden, Interpreter, die Dateien selbst öffnen (`python3 - <<EOF`,
`node schreib.mjs`), Pfade über Variablen oder Symlinks — all das kommt
durch. Das ist kein hypothetischer Angreifer: Genau so sind die Änderungen
der letzten drei Sitzungen entstanden. Schicht 1 hat dieselbe Grenze, und die
Dokumentation von Claude Code benennt sie ausdrücklich („don't apply to
arbitrary subprocesses"); für Durchsetzung auf Betriebssystemebene verweist
sie auf die Sandbox. Schicht 3 fängt davon den Fall ab, der wirklich schadet
— die unbeabsichtigte Veröffentlichung —, aber nur, wo eine Basis vorliegt,
und das ist in der CI derzeit nicht der Fall (M10).

**Zweitwirkung, die man kennen muss:** Die Mustererkennung ist grob und
meldet lieber zu viel. In der Sitzung, die sie gebaut hat, blockierte sie
dreimal legitime Arbeit: ein Testskript, das die gesperrten Pfade nur in
Fixture-Strings zitiert, diesen Review-Eintrag und den Eintrag in
`ENTSCHEIDUNGEN.md`, weil beide den blockierten Befehl beschreiben. Der
Ausweg ist jeweils das dateibasierte Werkzeug (`Write`/`Edit`) statt der
Shell; in `test-hooks.ts` sind die Pfade deshalb aus Fragmenten
zusammengesetzt. Wer die Sperre lockert, verliert genau die Grobheit, die
`sed -i s/entwurf/…/` gefangen hat.

Der ursprüngliche Befund:
`settings.json` bindet `guard.mjs` mit `"matcher": "Write|Edit"`, und der
Hook liest ausschließlich `tool_input.file_path` und `tool_input.content`.
Ein Schreibzugriff über die Shell — `sed -i`, ein Python-Einzeiler, ein
Heredoc — erzeugt kein solches Tool-Input und läuft an allen fünf Sperren
vorbei: `_schemas.ts`, `site.config.ts`, `.claude/`, `.github/` und der
Statussperre gegen `status: veroeffentlicht`. Auch der PostToolUse-Validator
(`validate-changed.sh`) hat denselben Matcher und läuft dann nicht mit.
**Nachweis:** In der Sitzung vom 2026-09-02 wurde `status: veroeffentlicht`
per `sed -i` in `src/content/lexikon/petticoat.md` gesetzt (als Negativtest
für die Belegregeln) — kein Hook meldete sich, der Schreibzugriff ging
kommentarlos durch. Dieselbe Sitzung änderte `_schemas.ts` über Python,
ebenfalls ohne Auslösen der Sperre; die menschliche Freigabe dafür lag zwar
vor, der Hook hat sie aber nicht geprüft, weil er gar nicht lief.
Das ist Lektion 15 ein zweites Mal, aus einer anderen Richtung: Damals
scheiterte der Start der Hooks, diesmal werden sie schlicht nicht
aufgerufen. Eine Sperre, die einen Schreibweg abdeckt und den zweiten offen
lässt, ist keine Sperre, sondern eine Konvention — und Agenten, die
angewiesen sind, bevorzugt über die Shell zu arbeiten, nehmen zwangsläufig
den offenen Weg. Empfehlung: `Bash` in den Matcher aufnehmen und im Hook
zusätzlich `tool_input.command` auswerten (Dateipfade und
`status: veroeffentlicht` im Kommandotext erkennen), oder — robuster, weil
unabhängig vom Kommandotext — die Sperren zusätzlich als
`pre-commit`-Prüfung und als CI-Schritt führen, der die geschützten Pfade
im Diff gegen die Basis prüft. Vorher der Negativtest nach Lektion 7 für
beide Schreibwege, mit einem Versuch, der scheitern muss.

**M9 · `event-zeitraum` erklärt Termine am eigenen Tag für vorbei.**
`const vorbei = new Date(ende ?? beginn) < ctx.heute` vergleicht einen
Zeitpunkt mit „jetzt". Trägt ein Event nur ein Datum statt eines
Zeitstempels — was das Schema erlaubt (`z.coerce.date()`) und was für
`ganztaegig: true` die natürliche Schreibweise ist —, wird daraus Mitternacht
UTC. Ab 00:01 UTC am Veranstaltungstag gilt der Termin als vergangen.
**Nachweis:** Ein Event mit `beginn: <heute>` und `durchfuehrung: geplant`
liefert `fehler` „Termin ist vorbei, Status steht noch auf ‚geplant'" — am
Morgen des Tages, an dem es stattfindet. Für einen veröffentlichten Eintrag
heißt das: rote CI am wichtigsten Tag des Eintrags, und der einzige Weg
heraus ist eine Statusangabe, die noch nicht stimmt.
`scripts/archive-events.ts` teilt die Vergleichslogik
(`new Date(d.ende ?? d.beginn) >= jetzt`) und würde denselben Termin
archivieren, während er läuft. Im Alltag fällt es nicht auf, weil das Golden
Example volle Zeitstempel mit Offset schreibt (`2026-05-22T18:00:00+02:00`)
— die Lücke trifft genau die Einträge, die den bequemen erlaubten Weg
nehmen. Empfehlung: Für Werte ohne Tageszeit auf das **Tagesende** in
`site.zeitzone` vergleichen statt auf den Zeitpunkt, in Validator und
Archivierer gemeinsam; das ist Lektion 1 an einer Stelle, die
`check-zeitzonen.ts` nicht sieht, weil hier keine verbotene Datums-API
steht, sondern eine stillschweigende Annahme. Negativtest nach Lektion 7 vor
der Umsetzung; der Harnisch aus M00 nimmt ihn jetzt auf. Bewusst nicht im
Zuge des Testauftrags mitbehoben: Event-Semantik zu ändern ist eine eigene
Entscheidung.

**M1 · `sync-autolinks` ersetzt den Body über einen fragilen Index.**
`roh.indexOf(parsed.content, …)` funktioniert, kippt aber bei leerem Body
(`indexOf("")` liefert die Suchposition) und theoretisch, wenn der
Body-Anfang wörtlich im Frontmatter vorkommt. Empfehlung: den
Frontmatter-Block per Regex `^---\r?\n[\s\S]*?\r?\n---\r?\n` abtrennen und
dahinter ersetzen. Klein, aber das Skript schreibt in Quelldateien —
da ist „funktioniert meistens" die falsche Kategorie.

**M2 · `check-jsonld` prüft nur die oberste Graph-Ebene.**
`@type`/`@id`/Pflichtfelder werden je Knoten in `@graph` geprüft;
verschachtelte Knoten (Offers, Member-Personen, `foundingLocation`) nie.
Die `PFLICHT`-Einträge für `Offer` und `Person` sind dadurch faktisch tote
Tabellenzeilen — der Offer-Preis wird nur von der separaten Event-Regel
erfasst. Empfehlung: rekursive Knotenprüfung (Objekt mit `@type` = Knoten)
oder die toten Tabellenzeilen streichen, damit die Tabelle nicht mehr
Abdeckung suggeriert, als existiert.

**M3 · Mindestlink-Regel zählt Duplikate.**
Dreimal derselbe interne Link erfüllt `interne-links` (Ziel: 5). Empfehlung:
über `new Set(pfade)` zählen.

**M4 · Linkcheck meldet `http→https` als „fremde Domain".**
Der Origin-Vergleich schlägt bei reinem Schema-Upgrade an; die Meldung
(„Domain verkauft, Veranstalter aufgegeben") ist dann irreführend.
Empfehlung: Hostname statt Origin vergleichen und Schema-Upgrades als
eigenen, milden Hinweis führen („Quelle auf https umstellen").

**M5 · Linkcheck ohne Drosselung pro Host.**
Acht parallele Anfragen können denselben Host treffen. Bei den heutigen
Mengen egal, bei 500 Discogs-Links nicht mehr — und 429-Antworten
verfälschen dann den Bericht. Empfehlung: Warteschlange je Hostname.

**M6 · Kalender-Route: Regions-Slug `alle` würde kollidieren.**
`/kalender/alle.ics` ist reserviert, aber nirgends erzwungen — eine Region
mit Slug `alle` überschriebe den Gesamtfeed. Empfehlung: `alle` in
`RESERVIERTE_SEGMENTE` aufnehmen (die Validator-Regel greift dann mit).

**M7 · Begriffs-Deduplizierung hängt an der Dateireihenfolge.**
Tragen zwei Lexikoneinträge denselben Alias, „gewinnt der erste" — und
erster heißt: Reihenfolge von `fast-glob`. Praktisch stabil, aber nicht
garantiert. Empfehlung: Alias-Kollisionen zwischen Lexikoneinträgen im
Validator als Fehler melden (die Duplikatprüfung tut das bereits innerhalb
der Collection — dieser Fall ist damit abgedeckt, sobald beide Begriffe
denselben Alias führen; der stille Fall „Name des einen = Alias des
anderen" läuft durch die Normalisierung ebenfalls hinein). Kurz geprüft:
abgedeckt — verbleibendes Restrisiko ist nur die Reihenfolge bei bewusst
gleichnamigen Begriffen, akzeptabel.

---

## 4. Niedrige Befunde — dokumentiert

- **RSS:** sortiert nach `veroeffentlichtAm ?? erstelltAm`; „aktualisierte
  Einträge" (llms.txt-Text) stimmt damit nur halb. Entweder `geaendertAm`
  einbeziehen oder die Beschreibung präzisieren.
- **`sitemapXml` escapet `loc` nicht.** Derzeit sicher, weil Slugs auf
  `[a-z0-9-]` beschränkt sind — der Schutz liegt also im Zod-Regex, nicht in
  der Funktion. Ein Kommentar dort sollte diese Abhängigkeit benennen.
- **FAQ-Markup:** Googles FAQ-Rich-Results sind seit 2023 auf Behörden- und
  Gesundheitsseiten beschränkt. Das Markup bleibt für Verständnis und andere
  Konsumenten sinnvoll — nur keine Rich-Result-Erwartung daran knüpfen.
- **Sub-Feld-Parität:** `preise[].gueltigBis` fließt als `validThrough` ins
  JSON-LD, der Faktenblock zeigt es nicht. Die Paritätsprüfung arbeitet auf
  Feldebene und sieht das nicht. Bekannte, bewusste Granularitätsgrenze —
  im Code dokumentieren.
- **`marked` rendert Facetten-Einleitungen ohne Sanitizer.** Vertretbar,
  weil es redaktionelle Repo-Dateien sind — aber sobald ein Agent diese
  Dateien schreibt, gilt K1 sinngemäß auch hier.
- **`herkunftLand` ist bei Bands Pflicht.** Für DJs mit unklarer Herkunft
  womöglich zu streng; bei der ersten echten Reibung optional machen statt
  Fantasiewerte zu provozieren.
- **Astro-Log zeigt dynamische Endpunkte mit Schrägstrich** — kosmetisch,
  Dateien sind korrekt; als Stolperfalle im README erwähnenswert.

---

## 5. Strukturelle Bewertung

**Was trägt:** Der zentrale Zod-Vertrag mit `.strict()` überall; die
maschinelle Content-Parität (Builder-Felder ⊆ Faktenblock, im Negativtest
nachgewiesen); abgeleitete statt gepflegte Rückverweise; der
Indexierungs-Schwellenwert als Funktion; Slug-Referenzen mit zentraler
Prüfung statt verstreuter `reference()`-Aufrufe; die konsequente
Trennung Vite-gebundener Module (`facetten-einleitungen.ts`), ohne die
die Facettenlogik untestbar wäre.

**Was fehlt oder schwächelt:**

1. **Kein `package.json`, kein `tsconfig.json`, keine CI-Datei im
   Deliverable.** Der Plan nannte `.github/workflows/ci.yml`; die
   npm-Skripte existieren nur im README. `astro check` im `verify`-Skript
   setzt zudem `@astrojs/check` + `typescript` voraus — nirgends erwähnt.
   Das ist die größte Lücke zwischen Plan und Lieferung.
2. **Handgerollter Testharness.** Fünfmal dieselben `pruefe`/`gleich`-Helfer.
   Für die Projektgröße in Ordnung, aber beim nächsten Skript in ein
   gemeinsames `scripts/_test.ts` ziehen — oder gleich Vitest, das mit Astro
   gut zusammenspielt und Watch-Mode mitbringt.
3. **Doppelte Ladewege.** Astro lädt über Collections, die Skripte über
   `_laden.ts`. Architektonisch begründet (Node vs. Vite), aber die
   Filterlogik (`_`-Präfix, Collection-Erkennung) existiert zweimal —
   `content.config.ts` und `_laden.ts` müssen synchron gehalten werden.
   Ein gemeinsames Konstanten-Modul für Pattern und Präfixregeln würde die
   Drift-Gefahr nehmen.
4. **`validate-content` lädt im Volllauf alles doppelt** (`ladeEintraege` +
   `baueKontext`). Bei sechs Dateien egal, bei zweitausend nicht — der
   Kontextaufbau sollte die bereits geladenen Einträge wiederverwenden.
5. **Zeitzonenfehler als Serienfehler** (drei Instanzen, siehe H1). Die
   Konvention „nie ohne explizite Zone formatieren oder rechnen" gehört in
   CLAUDE.md *und* als grep-basierter Check in die Validator-Suite.

**Testabdeckung, ehrlich eingeordnet:** 112 Behauptungen plus zwei
Regel-Suiten klingen gut, decken aber vor allem `lib/` ab. Ungetestet sind:
die Astro-Komponenten selbst (nur indirekt über den Build verifiziert),
`sync-autolinks` (manuell geprüft, kein automatisierter Idempotenztest),
`check-links` (manuell gegen das echte Netz). Die beiden letzten sind die
Skripte, die in Quelldateien schreiben bzw. in der CI laufen sollen —
dort wären automatisierte Tests am wertvollsten.

---

## 6. Empfohlene Reihenfolge der offenen Punkte

1. `package.json`, `tsconfig.json`, CI-Workflow nachliefern (Lücke Nr. 1) —
   inklusive `--strict` für die Prüfskripte in der CI.
2. M1 (`sync-autolinks`-Splice) — schreibt in Quelldateien, vor dem ersten
   großen Autolink-Lauf beheben.
3. M6 (`alle` reservieren) — eine Zeile, verhindert eine stille Kollision.
4. M2 (rekursive Knotenprüfung oder tote Tabellenzeilen streichen).
5. Zeitzonen-Konvention festschreiben (H1-Empfehlung).
6. M3–M5 bei Gelegenheit; Rest wie dokumentiert.

Nichts davon blockiert die inhaltliche Arbeit — die Reihenfolge im
ursprünglichen Plan (Phase 0/1 abschließen, dann Content) bleibt richtig.

---

## Nachtrag — Punkte 1–3 der Empfehlungsliste umgesetzt

**Zu 1 (Projektgerüst):** `package.json` (inkl. `@astrojs/check`,
`typescript` und `@types/node` — ohne Letzteres meldet `astro check` 40
Scheinfehler in den Skripten), `tsconfig.json` auf Astros strict-Preset,
sowie zwei Workflows: `ci.yml` fährt `verify` mit `--strict` und bricht
zusätzlich ab, wenn `sync-autolinks --dry-run` Änderungen melden würde —
Autolink-Drift fällt damit im PR auf, nicht im Betrieb. `linkcheck.yml`
läuft wöchentlich, getrennt von der CI (das Netz ist kein Grund, einen Merge
zu blockieren), und eröffnet bei toten Links ein Issue mit dem Bericht.
`astro check` deckte dabei einen weiteren kleinen Fehler auf: `rel="author"`
auf einem `<span>` ist ungültig — entfernt.

**Zu 2 (M1):** `sync-autolinks` trennt das Frontmatter jetzt per Regex ab
statt über `indexOf` des Body-Texts. Dazu die im Review geforderte
Testabdeckung: `test-sync-autolinks.ts` lässt das Skript als Kind-Prozess in
einer Wegwerf-Arbeitskopie laufen und prüft neun Behauptungen — darunter die
nachgestellte M1-Falle (Body beginnt wörtlich mit der `kurzbeschreibung`,
ein YAML-Wert enthält `---`), byteidentisches Frontmatter, Idempotenz des
zweiten Laufs und dass `--dry-run` nie schreibt.

**Zu 3 (M6):** `alle` steht in `RESERVIERTE_SEGMENTE`; die bestehende
Validator-Regel verhindert damit den Regions-Slug, der den Gesamtfeed
`/kalender/alle.ics` überschreiben würde.

Stand danach: `astro check` 0 Fehler, sechs Suiten grün (121 Behauptungen),
Build fehlerfrei, Autolink-Drift-Prüfung im Trockenlauf sauber.

**Zu 4 (M2):** `check-jsonld.ts` prüft den Graphen jetzt rekursiv.
`sammleKnoten()` erfasst jedes Objekt mit `@type`, egal wie tief; die
`PFLICHT`-Tabelle gilt damit auch für Offers, Bandmitglieder, Adressen,
Geokoordinaten, FAQ-Fragen und die `EventSeries`. Verschachtelte Knoten
dürfen ohne `@id` bleiben (Blank Nodes) — tragen sie eine, gelten dieselben
Regeln wie oben (Eindeutigkeit, eigene Domain, keine Wissensbasis-URL).
Fehlermeldungen nennen jetzt den Pfad im Graphen (`[5].offers[0]`). Die
Tabelle wurde dabei kontextneutral gestellt: `Organization` verlangt nur noch
`name` (ein verschachtelter Veranstalter braucht keine URL — die des
Site-Knotens garantiert `organisationsKnoten()`), `Person` nichts (der
Autoren-Knoten trägt bis zur Autoren-Collection bewusst nur die `@id`), und
`Offer` verlangt nun auch `availability`, wodurch die frühere Doppelwarnung
in der Eventregel entfallen konnte. Nachgewiesen mit drei verschachtelten
Negativtests: Offer ohne `priceCurrency`, `EventSeries` ohne `name` und eine
Wikidata-URL als `@id` eines Mitglieds — alle drei schlagen mit präzisem
Pfad an; der Lauf auf den echten Daten bleibt sauber.

**Zu 5 (Zeitzonen-Konvention) und M3–M5 — Restliste abgeschlossen:**

- **Zeitzonen-Check** (`check-zeitzonen.ts`): verbietet lokale Datums-Getter,
  `toLocaleString`-Formatierung und `Intl.DateTimeFormat` ohne `timeZone` in
  `src/` und `scripts/`; Ausnahmen per begründetem `zeitzone-ok`-Kommentar,
  Tests ausgenommen. In `verify` und CI verankert. Der erste Lauf fand die
  **vierte Instanz** der Fehlerklasse (`Quellen.astro`, „Zuletzt geprüft am"
  ohne `timeZone`) — behoben; die beiden Zahlenformatierungs-Treffer wurden
  auf `Intl.NumberFormat` umgestellt statt Ausnahmen zu markieren.
- **M3:** Die Mindestlink-Regel zählt eindeutige Ziele (`new Set`), nicht
  Vorkommen; Meldung entsprechend präzisiert.
- **M4:** Der Linkcheck vergleicht Hostnamen statt Origins. Ein
  `http→https`-Redirect auf demselben Host meldet jetzt eigenständig „Link
  direkt auf https umstellen" statt fälschlich „fremde Domain" — gegen das
  echte Netz verifiziert (http://de.wikipedia.org → Warnung `[http]`).
- **M5:** `--concurrency` steuert gleichzeitig bearbeitete Hosts; je Host
  arbeitet eine serielle Warteschlange mit `--pause` (Standard 250 ms).

Endstand: sieben Suiten bzw. Checks grün (validate, jsonld, zeitzonen, vier
Testharnische mit 121 Behauptungen), `astro check` 0 Fehler, Build mit 19
Seiten und 13 Feed-Dateien fehlerfrei. Aus dem Review offen bleiben nur noch
die dokumentierten niedrigen Befunde (Abschnitt 4) — alle bewusst vertagt.
