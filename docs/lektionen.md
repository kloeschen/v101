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

## 15. Hooks dürfen nicht vom Dateimodus abhängen

Die drei Hooks lagen als `100644` im Git-Index — ohne Executable-Bit, und
zwar bereits im Commit. `settings.json` rief sie direkt als Programm auf
(`"command": ".../guard.sh"`). Auf einem frischen Klon endete das mit
`Permission denied` und Exitcode 126.

Ein Hook, dessen Start fehlschlägt, blockiert nichts. Er meldet sich auch
nicht: Der Schreibzugriff läuft durch, als gäbe es die Sperre nicht. Damit
waren gleichzeitig alle Sperren wirkungslos — `_schemas.ts`,
`site.config.ts`, `.claude/`, `.github/` und die Statussperre gegen
`status: veroeffentlicht`. Aufgefallen ist es nur, weil eine
Schemaänderung, die hätte blockiert werden müssen, kommentarlos
durchging und committet wurde.

**Regel:** Hooks werden über ihren Interpreter aufgerufen, nie über den
Dateimodus — `node ".../guard.mjs"`, `bash ".../validate-changed.sh"`.
Dann trägt die Sperre über Klone, Übergabearchive und Dateisysteme ohne
Modusbits hinweg. Das Executable-Bit im Index bleibt als zweite
Sicherung, ist aber nicht die Grundlage.

**Regel:** Der Negativtest gehört zur Einrichtung, nicht in die Zukunft.
Wer einen Hook konfiguriert, weist in derselben Sitzung nach, dass er
blockiert — mit einem echten Schreibversuch, der scheitern muss, und
einem, der durchgehen muss. Ein Hook, der noch nie angeschlagen hat, ist
eine Vermutung. Das ist Lektion 7, angewendet auf die Sperren selbst:
Hier war sogar die Prüfung der Prüfung nie gelaufen.


## 16. Sperren lassen sich nicht per Auftrag aufheben

`.claude/` und `.github/` sind für Agenten gesperrt, und die Sperre kennt
keine Ausnahme im Auftragstext. Dreimal probiert, dreimal blockiert: bei M8
sollte `.claude/` geändert werden, bei M10 `.github/`, und diese Lektion
hier scheiterte am selben Riegel — der Versuch, sie zu schreiben, endete mit
„File is in a directory that is denied by your permission settings".

Der Grund ist Bauart, nicht Zufall. Die Erlaubnis steht im Auftrag, die
Sperre in `permissions.deny` und `guard.mjs` — und beide liegen in
`.claude/`, das ebenfalls gesperrt ist. Ein Agent kann sich die Erlaubnis
also nicht selbst eintragen, ohne die Sperre zu umgehen, die er gerade
respektieren soll. Genau so ist es gedacht.

Eine dokumentierte Restlücke gibt es (siehe `guard.mjs`): Ein Interpreter,
der die Datei selbst öffnet, kommt an beiden Schichten vorbei. Sie zu
benutzen, um eine Sperre zu umgehen, macht sie zur Zierde — auch und gerade
mit Erlaubnis im Rücken. Eine Sperre, die für den Berechtigten nicht gilt,
ist keine.

**Regel:** Änderungen in `.claude/` und `.github/` macht der Mensch. Ein
Auftrag, der sie braucht, liefert den **fertigen Dateiinhalt** statt einer
Anweisung — kopierfertig, nicht als Beschreibung.

**Regel:** Der Rest des Auftrags wird trotzdem gebaut. Die zugehörige
Prüfung ist dann bis zum Commit des Menschen rot, und das ist der richtige
Zustand, kein Mangel: Bei M10 schlug `test-pruefkette` auf genau den drei
Punkten an, die der Befund beschreibt, und wurde mit dem Commit grün. Ein
Test, der den fehlenden Teil verschweigt, wäre schlechter als einer, der
ihn anzeigt.

**Regel:** Wer die Sperre baut, prüft, ob er selbst noch arbeiten kann.
Nach dem Einbau von `permissions.deny` war die Korrektur eines einzigen
Satzes in `guard.mjs` nicht mehr möglich — der Satz musste stattdessen wahr
gemacht werden, indem das darin versprochene Skript entstand. Das war hier
der bessere Ausgang, ist aber Glück gewesen, nicht Planung.

## 17. Ein Ergebnis mit zwei möglichen Ursachen belegt keine von beiden

**Zweimal in einer Sitzung passiert**, beide Male beim Mutationsbeleg für
die drei Preiszustände — einmal in einer Fixture, einmal im Beleg selbst.

**Erst die Fixture.** Die Prüfung „dritter Zustand: kein Offer" lief mit
einem Termin ohne Preisangaben. Sie blieb grün, als die Abfrage auf
`eintritt` im Builder ganz entfernt wurde: `preise: []` ergibt eine leere
Offer-Liste, die ohnehin herausfällt. Fehlende Abfrage und leere Preisliste
führen zum selben `offers: undefined` — also belegt dieses Ergebnis keine
von beiden Ursachen. Trennen lassen sie sich nur durch den Fall, in dem sie
auseinandergehen: Preise **an** einem Termin, der keinen Preis
veröffentlicht. Das ist genau die Kombination, die der Validator verbietet
— und deshalb war sie nicht in den Testdaten. Sie muss es trotzdem sein,
denn der Astro-Build prüft nur das Zod-Schema und keine Regeln; die
Verteidigung im Builder darf sich auf den Validator nicht verlassen.

Dasselbe Muster wie bei M9: Dort hielt `indexOf("heute") < indexOf("gestern")`
unter Mutation zufällig, weil vergangene Termine ohnehin absteigend
sortieren.

**Dann der Beleg.** Die Zeile mit der Statuseskalation
(`ebene: … ? "fehler" : "warnung"`) steht wortgleich in mehreren Regeln, in
`belegpflicht` sogar früher in der Datei. Ein `replace()` über den ganzen
Dateiinhalt traf deshalb die falsche Regel. Der Lauf wurde rot, die
Mutation galt als belegt — aber rot wurde er wegen einer Regel, die gar
nicht geprüft werden sollte. Ein Beleg, der nichts belegt, ist schlimmer
als keiner: Er schließt die Frage.

**Regel:** Eine Fixture, deren erwartetes Ergebnis auch aus einem anderen
Grund eintreten kann, prüft nichts. Vor jeder Behauptung „das hält, weil X"
die Gegenfrage stellen: Was noch könnte dasselbe Ergebnis erzeugen? Wenn es
etwas gibt, braucht es zusätzlich den Fall, in dem sich die Ursachen
unterscheiden — auch und gerade den, den eine andere Schicht verbietet.

**Regel:** Ein Mutationsbeleg grenzt die Mutation auf den Block der
geprüften Regel ein, nie über die ganze Datei. Und er prüft nicht bloß, ob
der Lauf rot wird, sondern ob **genau die erwarteten Behauptungen fallen**.
Ein roter Lauf ohne diese Zuordnung ist ein Gefühl, kein Nachweis.

**Erzwungen durch:** die Struktur des Belegskripts selbst — jede Mutation
trägt die Liste der Fixtures, die fallen müssen, und der Beleg gilt nur als
erbracht, wenn sie vollständig in der Ausgabe stehen. Das ist Lektion 7,
eine Ebene höher angewendet: Auch der Negativtest braucht einen Negativtest.

## 18. Sperren dürfen nicht auf Wortbestandteilen prüfen

**Zweimal in einer Sitzung passiert**, und zwar in der Sitzung, die das
auslösende Vokabular selbst eingeführt hat. Der Bash-Zweig von `guard.mjs`
prüfte den Befehlstext auf `/veroeffentlicht/` — den bloßen Teilstring. Der
neue dritte Preiszustand heißt `unveroeffentlicht` und enthält das Wort.
Jeder Shell-Schreibzugriff auf eine Eventdatei mit diesem Wert wurde
deshalb als Statusänderung abgelehnt, mit einer Begründung, die zur Lage
nicht passte: „status: veroeffentlicht darf nur ein Mensch setzen."

Der Fehlalarm ist die harmlose Hälfte. Die andere ist, was er mit dem
Arbeiten macht: Der Mutationsbeleg für dieselben Preiszustände musste über
ein Node-Skript laufen statt über Shell-Befehle, und Werte wurden in
Testdateien aus Fragmenten zusammengesetzt (`["veroeffent", "licht"].join("")`),
nur um an der Sperre vorbeizukommen. Eine Sperre, die zum Ausweichen
zwingt, erzieht zum Ausweichen.

**Warum es nicht mit „Feldnamen verlangen" getan ist.** Die naheliegende
Korrektur — `status:` davor fordern — hätte eine bestehende Abdeckung
fallen lassen. Der Befehl, der beim allerersten Probelauf dieses Hooks
durchging, nennt das Feld gar nicht: `sed -i 's/entwurf/veroeffentlicht/'`.
`scripts/test-hooks.ts` hält diesen Fall seit damals fest. Geprüft werden
deshalb zwei Formen, beide mit Wortgrenze: der Feldname davor **oder** das
Wort als Ziel einer Ersetzung.

**Regel:** Prüfmuster in Sperren werden gegen Feldnamen und Wortgrenzen
formuliert, nie gegen Wortbestandteile. `\bwort\b` statt `wort`.

**Regel:** Wer neues Fachvokabular einführt — einen Enum-Wert, einen
Feldnamen, einen Statuswert —, prüft, ob es ein bestehendes Prüfmuster
streift. Ein Wert, der einen anderen als Teilwort enthält, ist der
Regelfall, nicht die Ausnahme: `unveroeffentlicht` enthält `veroeffentlicht`,
`entwurfsfassung` enthielte `entwurf`.

**Regel:** Eine Verengung braucht beide Richtungen als Test. Der Fall „darf
durchgehen" ist hier der eigentliche Regressionsschutz — er schlägt an,
sobald jemand wieder auf Teilstring-Prüfung zurückfällt. Der Fall „muss
weiterhin blockieren" verhindert, dass die Verengung nebenbei ein Loch
reißt.

**Erzwungen durch:** `scripts/test-hooks.ts`, Abschnitt „Der Fehlalarm auf
dem Preiszustand" — fünf Befehle mit dem Preiszustand, die durchgehen
müssen, gegen zehn Schreibweisen des Statuswechsels, die blockieren müssen.

**Die Sperre gilt dem Verzeichnis, nicht der Datei.** Beim Versuch, diese
Lektion abzulegen, kam der Nebenbefund heraus: `.claude/` ist als Ganzes
gesperrt. Auch `lektionen.md` lag darin — eine Sammlung von
Erfahrungssätzen hinter einer Sperre, die für Mechanik gedacht ist. Die
Instanz, die diese Sätze aus ihren eigenen Fehlern schreibt, konnte sie
nicht selbst ablegen; zweimal in derselben Sitzung mussten sie als fertiger
Text im Pull Request übergeben werden. Die Datei liegt deshalb jetzt hier,
in `docs/`.

**Regel:** Wer eine Datei in einen gesperrten Bereich legt, sperrt sie für
alle künftige Pflege mit — nicht nur für sich, sondern dauerhaft. Vor dem
Ablegen deshalb die Frage: Ist das **Mechanik** (Hook, Berechtigung,
Agentendefinition, CI-Schritt) oder **Text über Mechanik**? Mechanik gehört
nach `.claude/` oder `.github/` und darf sich nicht selbst ändern. Text
darüber gehört nach `docs/` und muss sich ändern lassen, sonst veraltet er
genau dort, wo er am meisten wehtut.

**Erzwungen durch:** zwei Prüfungen in `scripts/test-hooks.ts`, Abschnitt
„Die Grenze" — `docs/lektionen.md` muss existieren, `.claude/rules/` darf
nicht wieder entstehen.

---

## 19. Die gefährlichste Prüfung ist die, die nie etwas gesehen hat

**Dreimal in einer Sitzung passiert**, in drei verschiedenen Gestalten.
Erst als der dritte Fall auftauchte, wurde das Muster sichtbar.

**Der Sortiervergleich (M9).** `indexOf("heute") < indexOf("gestern")`
sollte belegen, dass kommende Termine vor vergangenen stehen. Der Vergleich
hielt unter Mutation — aber weil vergangene Termine ohnehin absteigend
sortieren, wäre er auch ohne die geprüfte Logik wahr gewesen.

**Die Offer-Fixture.** „Dritter Preiszustand: kein Offer" lief mit einem
Termin ohne Preisangaben. `preise: []` ergibt eine leere Offer-Liste, die
ohnehin herausfällt — die Prüfung blieb grün, als die geprüfte Abfrage ganz
entfernt wurde.

**Der PostToolUse-Zweig.** Der Hooktest baute sein Prüfprojekt unter
`os.tmpdir()`. Auf macOS ist das `/var/folders/…`, und `/var` zeigt auf
`/private/var`; `process.cwd()` löst das auf, der übergebene Dateipfad
nicht. Der Loader verwarf die Datei mit `path.relative(…).startsWith("..")`
und meldete „Nichts zu prüfen" bei Exitcode 0. Der Hook hat seit seiner
Entstehung nichts geprüft und dabei Erfolg gemeldet. Auf Linux fiel es nie
auf — dort gibt es den Symlink nicht.

**Was die drei gemeinsam haben.** In allen drei Fällen war das beobachtete
Ergebnis mit *zwei* Zuständen der Welt verträglich: „die Regel greift" und
„die Regel wurde nie erreicht". Der Unterschied zu Lektion 17 ist der Ort:
Dort lag die Zweideutigkeit in den Daten, hier im Aufbau — die Prüfung kam
gar nicht bis zur Sache.

**Woran man sie erkennt.** Drei Fragen, die alle drei Fälle gefunden hätten:

1. **Woher weiß ich, dass die Prüfung ihren Gegenstand erreicht hat?** Nicht
   „ist der Lauf grün", sondern: Steht in der Ausgabe etwas, das nur
   entstehen kann, wenn die Sache tatsächlich angefasst wurde? Ein Exitcode
   ist dafür der schwächste Zeuge, weil ihn viele Wege erzeugen.
2. **Was wäre die Ausgabe, wenn der Gegenstand fehlte?** Sieht sie genauso
   aus wie jetzt, prüft nichts. „Nichts zu prüfen", „0 Dateien", „keine
   Treffer", eine leere Liste — jede dieser Meldungen bei Exitcode 0 ist
   verdächtig, solange nicht klar ist, dass sie den leeren Zustand meint und
   nicht den verfehlten.
3. **Hängt das Ergebnis an etwas, das die Prüfung nicht kontrolliert?** Ein
   Symlink im temporären Verzeichnis, eine Umgebungsvariable, die
   Sortierreihenfolge echter Daten, die Zeitzone des Rechners. Wenn ja,
   misst sie woanders etwas anderes — und genau dort schweigt sie.

**Regel:** Jede Prüfung braucht ein **positives Lebenszeichen** ihres
Gegenstands: eine Behauptung, die nur wahr sein kann, wenn die Sache
wirklich angefasst wurde. Die Abwesenheit eines Fehlers ist kein
Lebenszeichen.

**Regel:** Meldungen der Form „nichts gefunden" bekommen zwei getrennte
Ausgänge — leerer Zustand (in Ordnung) und verfehlter Aufruf (Fehler). Wer
mit einer Dateiliste aufgerufen wird und nichts davon sieht, hat nichts zu
melden außer diesem Umstand. Das ist Lektion 4 in ihrer schärferen Form:
Ein *grüner* Lauf muss ebenso etwas bedeuten wie ein roter.

**Erzwungen durch:** `scripts/_laden.ts` löst beide Seiten des
Pfadvergleichs symlinkfrei auf; `scripts/validate-content.ts` beendet einen
`--changed`-Aufruf, dessen Dateien sämtlich außerhalb des Registers liegen,
mit Exitcode 2 und nennt sie; `scripts/test-hooks.ts` fährt den Hook einmal
über einen selbst gebauten Symlink und verlangt, dass der konkrete Befund in
der Begründung steht — nicht bloß, dass blockiert wurde.
