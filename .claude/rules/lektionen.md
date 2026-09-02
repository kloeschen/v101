# Lektionen aus dem Aufbau

Fehler, die in diesem Projekt tatsächlich passiert sind — jeweils mit der
Regel, die daraus folgt. Wer hier liest, muss sie nicht wiederholen.

Diese Datei ist keine Stilsammlung. Jeder Eintrag hat einen Fehler als
Ursache, und die meisten sind erst beim Ausführen aufgefallen, nicht beim
Nachdenken.

---

## 1. Zeitzonen: nie ohne explizite Zone rechnen oder formatieren

**Viermal passiert.** `startDate` im JSON-LD kam als UTC statt Ortszeit. Der
Faktenblock formatierte in der Zeitzone des Build-Servers — aus 18 Uhr wurde
auf einem UTC-Runner 16 Uhr. Die Jahresfacette steckte einen Silvesterball
ins Vorjahr. Und das Prüfdatum in der Quellen-Fußzeile hatte denselben
Fehler.

**Regel:** Keine lokalen Datums-Getter (`getFullYear` und Verwandte), kein
`toLocaleString`, kein `Intl.DateTimeFormat` ohne `timeZone`. Erlaubt sind
UTC-explizite Methoden und `Intl` mit gesetzter Zone aus `site.zeitzone`.
Ausnahmen brauchen einen `zeitzone-ok`-Kommentar mit Begründung.

**Erzwungen durch:** `scripts/check-zeitzonen.ts`, Teil von `npm run verify`
und der CI. Er fand die vierte Instanz beim allerersten Lauf.

## 2. `import.meta` koppelt an Vite und zerlegt alle Node-Skripte

**Zweimal passiert.** `import.meta.glob` in `facetten.ts` machte die
Facettenlogik außerhalb von Astro unimportierbar und damit untestbar. Später
brach `import.meta.env` in `site.config.ts` jedes Skript in `scripts/`, weil
diese Datei von beiden Laufzeiten importiert wird.

**Regel:** Module, die sowohl Astro als auch Skripte importieren, dürfen
`import.meta` nicht ungeschützt verwenden. Entweder eine Zugriffshilfe, die
`import.meta.env` und `process.env` kennt, oder die Vite-Abhängigkeit in ein
eigenes Modul auslagern, das nur Astro importiert.

**Erzwungen durch:** Regressionstest in `scripts/test-feeds.ts`, der
`site.config.ts` auf direkten `import.meta.env`-Zugriff prüft.

## 3. Das ausgelieferte Artefakt testen, nicht die Arbeitskopie

Die `package.json` im ersten Übergabearchiv war eine von npm überschriebene
Fassung ohne `build`, `dev`, `validate` und alle Testbefehle. In der
Arbeitskopie lief alles; das Archiv wäre beim ersten Befehl gescheitert.

**Regel:** Vor jeder Übergabe das Archiv in ein leeres Verzeichnis entpacken,
`npm install`, `npm run verify`. Was nicht so getestet wurde, gilt als
ungetestet.

## 4. Auch den leeren Zustand testen

Zwei Testsuiten prüften gegen die Beispieldaten und wären auf einem frischen
Klon rot gewesen — beim allerersten Push, obwohl nichts kaputt war.

**Regel:** Tests, die auf Inhalte zugreifen, überspringen ihren Abschnitt mit
sichtbarem Hinweis, wenn das Register leer ist. Ein roter Lauf muss einen
echten Fehler bedeuten.

## 5. CI liest Exitcodes, keine Prosa

Der Autolink-Drift-Check suchte in der Textausgabe nach „0 Datei(en) würden
geändert". Bei leerem Register bricht das Skript vorher mit einer anderen
Meldung ab — Fehlalarm im Normalzustand eines frischen Repos.

**Regel:** Prüfschritte liefern ihr Ergebnis als Exitcode. Skripte, die in
der CI laufen, bekommen dafür einen `--check`-Modus.

## 6. Regeln, die zählen, gehören in Code

Eine Regel in CLAUDE.md ist eine Bitte. Ein Hook oder Validator ist eine
Bedingung. Ein Modell, das gerade einen Schemafehler umgehen will, liest
CLAUDE.md nicht noch einmal.

**Regel:** Wenn ein Regelverstoß ärgern würde, ist die Regel ein Validator,
ein Hook oder ein CI-Schritt. Dokumentation ergänzt das, ersetzt es nie.

## 7. Jede Regel braucht einen Negativtest

Eine Prüfung, die nie angeschlagen hat, ist unbewiesen. Mehrfach hat sich
gezeigt, dass Regeln stumm blieben — die Pflichtfeldprüfung im JSON-LD
erfasste verschachtelte Knoten überhaupt nicht, die Einträge für `Offer` und
`Person` waren totes Gewicht.

**Regel:** Nach jeder neuen Regel absichtlich kaputte Daten einschleusen und
belegen, dass sie anschlägt — danach zurückbauen.

## 8. Astro verwirft Response-Header im statischen Build

`Access-Control-Allow-Origin` aus den Endpunkt-Dateien landet nicht im
Output. Die als offen dokumentierte Schnittstelle wäre aus dem Browser nicht
nutzbar gewesen, `.ics` als Download statt als Kalenderabo behandelt.

**Regel:** Header gehören in `netlify.toml`. Bei einem Hosterwechsel dort neu
setzen, sonst ist die Schnittstelle stillschweigend zu.

## 9. Deploy Previews erben die Produktionsumgebung

Nach dem Go-Live wäre jede Vorschau indexierbar gewesen — Duplicate Content
gegen die eigene Domain, erzeugt von der eigenen Qualitätssicherung.

**Regel:** `PUBLIC_INDEXIERBAR` wird je Netlify-Kontext gesetzt. Vorschauen
und Branch-Deploys bleiben dauerhaft auf `false`.

## 10. Golden Examples schlagen Regelbeschreibungen

„Baue es wie `_golden-example.md`" führt zuverlässiger zum Ziel als drei
Absätze Prosa. Die Beispiele aktuell halten.

## 11. Kein Fakt ohne Quelle

Halluzinierte Termine und Eintrittspreise sind das realistischste
Schadensszenario. Deshalb deckt `quellen[].felder` jedes belegpflichtige Feld
ab, und der Validator prüft das.

**Regel:** Unbekannt heißt Feld weglassen, nicht schätzen. „Unbekannt" ist
keine Aussage und landet auch nicht im JSON-LD.

## 12. Major-Upgrades früh machen

Astro 5 → 7 samt Zod 3 → 4 kostete einen Testlauf und keine Codezeile. Mit
500 Inhaltsdateien und gewachsenem Schema wäre es Arbeit gewesen. Auffällig
dabei: Der Build lief unter Astro 7 mit Zod 3 weiter, meldete aber für jede
Collection einen Fehler und fuhr **ohne Schemaprüfung** fort — eine still
degradierte Validierung.

**Regel:** Nach jedem Upgrade nicht nur prüfen, ob es läuft, sondern ob die
Prüfungen noch greifen. Negativtest nicht vergessen.

## 13. Wo eine Entität existiert, gibt es keine Facette

`/events/region/x/` wäre eine dünnere Kopie von `/regionen/x/`. Der Grundsatz
hat die Facettenlogik halbiert.

## 14. Beziehungen ableiten, nicht pflegen

Auftritte einer Band fallen aus den Eventdaten heraus; die Regionsseite
bündelt über das `region`-Feld. Keine doppelte Datenhaltung, kein
Auseinanderlaufen — und ein Agent, der ein Event anlegt, aktualisiert damit
drei andere Seiten.

**Achtung:** Ein Versprechen im Schemakommentar ist keine Implementierung.
Die Ableitung der Region aus der Location war dokumentiert, aber nicht
gebaut — Events ohne explizites `region`-Feld waren regional unsichtbar.
