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

**Nachtrag vom 2026-09-23, derselbe Fehler in einem Test:** Der Abschnitt
„Rückverweise gegen echte Daten" in `scripts/test-links.ts` lief vom ersten
Tag an nie. Er prüfte nur, wenn die Band `the-firebirds` im Register
stand, und die gab es nur im Golden Example, das der Loader überspringt.
Jeder Lauf druckte „Abschnitt übersprungen" und meldete trotzdem „45
Prüfungen bestanden". Das ist die zweite Regel oben in Testform: Ein Test,
der sich abschaltet, wenn sein Gegenstand fehlt, braucht für diesen Fall
einen *roten* Ausgang, keinen Hinweis. Seitdem hängt der Abschnitt an einem
echten Eintrag, und ein fehlender Anker ist ein Fehler.

---

## 20. Widersprüche zwischen Quellen gehören in den Text, nicht in die Auswahl

**Fund aus der ersten redaktionellen Durchsicht.** Der Bleistiftrock-Eintrag
trägt einen Widerspruch aus, statt ihn zu glätten. Die deutsche Wikipedia
führt die Form auf Christian Dior zurück (Bleistiftlinie, 1948); die übrigen
geöffneten Quellen bestätigen das nicht. Der Eintrag schreibt genau das hin:

> Diese Zuschreibung ließ sich an weiteren geöffneten Quellen nicht
> bestätigen und steht hier deshalb als Angabe der Wikipedia, nicht als
> gesicherter Befund.

Und er sagt, was stattdessen trägt: den DWDS-Erstbeleg von 1950, mit dem die
zeitliche Einordnung auch ohne die Dior-Zuschreibung steht. `herkunftsland`
bleibt leer, weil das einzige Argument dafür die unbestätigte Zuschreibung
wäre.

**Warum das keine Stilfrage ist.** Es gäbe drei bequemere Wege, und alle drei
sind schlechter:

1. **Die Zuschreibung übernehmen.** Der Eintrag behauptete dann etwas, das
   eine Quelle sagt und keine zweite stützt — formal belegt, inhaltlich
   ungedeckt. Das ist der bedgown-Fehler aus PR #3 in anderer Gestalt.
2. **Die schwächere Quelle stillschweigend weglassen.** Der Eintrag sähe
   sauber aus, und der Leser sähe nicht, dass eine Entscheidung getroffen
   wurde. Genau das ist der Schaden: Eine unsichtbare Auswahl ist eine
   Behauptung ohne Beleg — die Behauptung, es gebe nichts abzuwägen.
3. **Beides nebeneinanderstellen, ohne zu gewichten.** Dann trägt der Leser
   die Arbeit, die der Eintrag ihm abnehmen soll.

Der Wert eines Registers liegt nicht darin, mehr zu wissen als die Quellen,
sondern darin, ihre Belastbarkeit zu beurteilen und die Beurteilung
mitzuliefern. Wer die Abwägung wegkürzt, gibt genau das auf, was der Eintrag
gegenüber der Suchmaschine voraushat.

**Regel:** Widersprüche zwischen Quellen und Zuschreibungen, die nur eine
Quelle trägt, gehören in den Fließtext — benannt, zugeordnet („steht in X"),
und mit dem, was stattdessen gesichert ist. Nicht in die Auswahl.

**Regel:** Ein Feld, dessen einziges Argument eine unbestätigte Zuschreibung
ist, bleibt leer. Die Begründung dafür gehört in die Redaktionsnotiz — sonst
trägt die nächste Session es nach.

**Nicht erzwungen durch eine Regel im Validator.** Quellenkritik lässt sich
nicht messen: Ob ein Widerspruch besteht und ob er benannt wurde, steht in
Sätzen, nicht in Feldern. Eine Prüfung, die es vorgäbe — etwa „enthält der
Text das Wort 'unbestätigt'" —, würde eine Formulierung erzwingen und keine
Haltung, und sie wäre schlimmer als keine: Sie ließe glauben, die Frage sei
abgeräumt (Lektion 19 aus der anderen Richtung — eine Prüfung, die ihren
Gegenstand gar nicht erreichen kann). Diese Erwartung steht deshalb in
`CLAUDE.md` und im Golden Example, wo Menschen und Modelle sie lesen.

---

## 21. Eine Warteschlange, die nur ein Mensch leeren darf, füllt sich schneller als sie sich leert

**Der Fehler:** Der tägliche unbeaufsichtigte Lauf bekam am 2026-09-20 die
Regel „stößt du auf eine Ermessensfrage, baue nicht — markiere den Posten
als `mensch` und melde". Die Regel ist richtig gemeint und war zwei Tage
später der Engpass.

**Gemessen nach zwei Läufen:**

| | vorher | nachher |
|---|---|---|
| Posten unter „Als Nächstes" | 9 | 16 |
| davon `frei` | 4 | 6 |
| davon `mensch` | 5 | **10** |

Zwei Läufe haben **einen** Posten abgearbeitet und **acht** erzeugt. Der
Rückstau an Entscheidungen hat sich verdoppelt, während der Rückstau an
Arbeit um einen Posten sank.

**Warum das kein Zufall ist:** Ein Lauf, der gut arbeitet, findet unterwegs
mehr, als er abarbeitet — das ist der Ertrag, nicht der Defekt. Funde sind
billig zu erzeugen und teuer zu entscheiden. Solange jede Unsicherheit zum
Menschen wandert, wächst die Warteschlange proportional zur Qualität der
Arbeit. Die Drosselung auf einen Posten pro Tag begrenzt den Ausstoß, nicht
den Rückstau; sie wirkt auf die falsche Größe.

**Was der Doppellauf dazu zeigte.** Am 2026-09-20/21 nahmen zwei Läufe
versehentlich denselben Posten — und lieferten damit den Vergleich, den
niemand geplant hatte. Dreimal direkt vergleichbar, zweimal war die
mutigere Fassung die bessere. Entscheidend ist der eine Fall, in dem die
Vorsicht griff: Ein Lauf entschied eine Vertragsfrage selbst und lag
richtig, der andere eskalierte sie. Kosten der Eskalation: ein Tag und ein
Bandeintrag, der seine Diskografie deshalb nicht trug. Geschützt hat das
Zögern nichts — die Frage war entscheidbar, und die Begründung des
entscheidenden Laufs stand fertig im Code.

**Regel:** Eine **eng geführte Ausnahme** von einer bestehenden Regel —
begrenzt auf ein Feld an einem Typ, mit Negativtest und Mutationsbeleg —
darf ein unbeaufsichtigter Lauf selbst bauen. Zum Menschen geht erst das
**Lockern der allgemeinen Regel**. Der Unterschied ist prüfbar und nicht
Ermessen: Die enge Ausnahme belegt ihre eigenen Grenzen, die allgemeine
Lockerung kann das nicht.

**Regel:** Wer einem Automaten eine Eskalationsregel gibt, misst nach zwei
Wochen, wie viele Eskalationen sie erzeugt hat und wie viele davon der
Mensch anders entschieden hat als der Automat vorgeschlagen hätte. Eine
Eskalationsquote ohne Widerspruchsquote sagt nichts.

---

## 22. Zwei Automaten, die sich nicht sehen, sind kein Automat, sondern ein Konflikt

**Der Fehler:** Die Warteschlange (`OFFENE-PUNKTE.md`) wird aus dem
Arbeitsbaum gelesen. Ein Lauf, der einen Posten abarbeitet, markiert ihn auf
**seinem Zweig** um — auf `main` steht er unverändert auf `frei`. Der
nächste Lauf startet von `main`, sieht ihn als frei und nimmt ihn erneut.
Ergebnis am 2026-09-21: zwei Pull Requests, dieselbe Band, zwei
Artikelentwürfe zu verschiedenen Themen, zwei Fassungen derselben Funde und
ein garantierter Konflikt in drei Dateien.

**Und es waren nicht zwei, sondern drei.** Derselbe Tag brachte einen
dritten Pull Request, vom wöchentlichen Pflege-Workflow, mit genau der einen
Zeile, die einer der Tagesläufe vier Stunden später ebenfalls änderte.
`pflege.yml`, der Tageslauf und die interaktive Sitzung öffnen alle Pull
Requests, ohne voneinander zu wissen. Wer nur die zwei zählt, die kollidiert
sind, repariert die Hälfte.

**Was daran allgemein ist:** Zustand, der die Arbeitsteilung steuert, darf
nicht in derselben Datei liegen wie die Arbeit selbst — sonst wandert er mit
dem Zweig mit und ist genau dort unsichtbar, wo er gebraucht wird. Das ist
dieselbe Form wie Lektion 2 (`import.meta` koppelt an eine Laufzeit): eine
Abhängigkeit, die im Normalfall nicht auffällt und im Grenzfall alles
zerlegt.

**Die Reparatur, und warum sie anders aussieht als geplant.** Beschlossen
war, `--naechster` solle die offenen Pull Requests abfragen. Gebaut ist
etwas Äquivalentes, das weniger kostet: Gefragt wird nach **nicht gemergten
Git-Refs**, nicht nach Pull Requests. Kein Token, kein Netzaufruf im Skript,
die Prüfkette bleibt offline — der Einwand, der gegen diese Variante sprach,
entfällt damit ganz. Und ein Zweig zählt schon, bevor ein Pull Request
existiert: genau das Fenster, in dem der Doppellauf entstand.

**Regel:** Als „wird schon bearbeitet" gilt ein Posten nur, wenn er am
**Abzweigpunkt** des Zweigs frei war und an dessen **Spitze** nicht mehr.
Die erste Fassung prüfte nur die zweite Hälfte und meldete beim ersten Lauf
gegen das echte Repository prompt drei Fehlalarme: Ein Zweig, der von einem
älteren Stand abzweigte, „bearbeitete" alles, was nach seinem Abzweig
dazugekommen war. **„Steht da nicht" und „wurde dort abgearbeitet" sind
verschiedene Dinge** — und ein Zweig, der hinterherhinkt, sieht ohne diese
Unterscheidung aus wie einer, der arbeitet.

---

## 23. Ein stumm verschluckter Posten ist schlimmer als ein falsch gelesener

**Der Fehler:** `MIT_MARKE` in `scripts/warteschlange.ts` war zeilenweise
verankert und verlangte die schließenden `**` in derselben Zeile wie die
Marke. Bricht ein fetter Titel über zwei Zeilen um — bei 79 Zeichen
Zeilenlänge der Normalfall für einen langen Titel —, greift weder `MIT_MARKE`
noch `OHNE_MARKE`, denn die Folgezeile beginnt nicht mit `**`.

Der Posten fiel damit **stumm** aus der Liste. `--check` schlug nicht an —
nicht weil es ihn durchwinkte, sondern weil es ihn nie sah. Minimalbeleg:
`lies()` auf einem umgebrochenen Titel ergibt `posten=0 ohneMarke=0`, auf
demselben Titel einzeilig `posten=1`.

**Die Folgen liefen in beide Richtungen.** Ein `frei`-Posten, den niemand
sieht, wird nie gebaut. Ein `mensch`-Posten, den niemand sieht, gilt als
erledigt. Und seit der Belegungsprüfung aus Lektion 22 kommt eine dritte
hinzu: Posten werden über ihren Titel verglichen, ein verschluckter Titel
hieße also „nicht belegt", obwohl ein Zweig ihn schon bearbeitet.

**Das Bittere:** Genau dieser Zustand war im Kopf der Datei ausdrücklich
ausgeschlossen worden. Dort stand, warum ein fehlender Marker laut
scheitern muss und nicht stillschweigend als `mensch` gelten darf — „eine
Voreinstellung, die man nicht sieht, ist die schlechtere von beiden". Die
Begründung war richtig und vollständig. Sie half nichts, weil der Parser
eine Zeile davor aufgab.

**Regel:** Wer begründet, warum ein Fall laut scheitern muss, prüft im
selben Zug, ob der Fall überhaupt bis zur Prüfung kommt. Eine Fehlermeldung
schützt nur, was der Parser gesehen hat — und was er nicht sieht, meldet
keine Regel, sondern fällt in die Lücke zwischen zweien.

**Regel:** Ein Negativtest für „wird gemeldet" braucht den Zwilling „wird
überhaupt gefunden". Beide zusammen schließen die Lücke; einer allein lässt
sie offen (dieselbe Form wie Lektion 19, eine Ebene tiefer).

## 24. Der Mutationsbeleg prüft zuerst die Vorrichtung, nicht den Code

**Am 2026-09-23 zweimal in derselben Stunde passiert**, beim Beleg für die
neue Regel `lexikon-schreibvarianten`. Beide Male fiel eine Mutation nicht,
die hätte fallen müssen — und beide Male lag es an der Prüfvorrichtung, nicht
am Prüfling. Lektion 17 und 23 haben dieselbe Form; hier kommt die Variante
dazu, die beim *Belegen* auftritt statt beim Prüfen.

**Erster Fall: die Messung sah ihren Gegenstand nicht.** Die erste Fassung
suchte ungedeckte Schreibvarianten, indem sie den Fließtext in Wort-Tokens
zerlegte und deren Normalform verglich. Danach wurde der Alias `Rock 'n' Roll`
absichtlich entfernt. Die Messung meldete: null Funde. Das sah wie ein
sauberer Bestand aus und war ein blindes Muster — `[ '’-][\p{L}]+` liest
genau *ein* Trennzeichen, `Rock 'n' Roll` hat an jeder Fuge zwei
(Leerzeichen plus Apostroph). Das Token endete nach „Rock".

**Zweiter Fall: dasselbe Muster war zu gierig.** Mit `{1,3}` auf dem
Trennzeichen las es die Fuge, griff dafür aber über vier Wörter:
`Rock 'n' Roll war` — Normalform `rocknrollwar`, kein Treffer. Die Messung
meldete wieder null, diesmal aus dem entgegengesetzten Grund. Zwei
verschiedene Ursachen, identische Ausgabe, und die Ausgabe war beide Male die
beruhigende.

**Dritter Fall, eine Ebene weiter: der Testfall prüfte etwas anderes als
sein Name.** Der Fall „Treffer mit weniger Bestandteilen ist kein Fehlalarm"
blieb grün, als die Trennzeichen im Muster von `+` auf `*` mutiert wurden —
also gerade dann, wenn der Schutz weg ist. Grund: Die Fixture schrieb den
letzten Bestandteil `Hat` groß, der Prosatext `hat` klein. Der Fall fiel
nicht über die Zahl der Bestandteile, sondern über die
Groß-/Kleinschreibung. Er prüfte eine Behauptung, die niemand aufgestellt
hatte, und die, um die es ging, gar nicht. Erst mit kleingeschriebenem
Bestandteil — wie im echten Fund `Pork pie hat` — fiel die Mutation.

**Regel:** Fällt eine Mutation nicht, ist das zuerst ein Befund über die
Vorrichtung. Die Vorrichtung umbauen, bis die Mutation fällt — nicht die
Behauptung streichen, und schon gar nicht die grüne Ausgabe als Beleg
nehmen. „Null Funde" ist kein Lebenszeichen (Lektion 19); beim Belegen ist
es die wahrscheinlichste Form des Selbstbetrugs.

**Regel:** Eine Fixture muss den echten Fund nachbauen, nicht nur seine
Form. Der echte Fehlalarm hieß `Pork pie hat`, klein geschrieben, und genau
darauf hing er. Wer ihn beim Nachbauen „aufräumt", baut einen anderen Fall.

---

## 25. Ein erwartetes Rot versteckt das echte

**Der Fehler:** Auf einem Freigabe-Pull-Request schlägt die Freigabeprüfung
planmäßig an — sie meldet jeden Statuswechsel, den niemand beim Aufruf
bestätigt hat, und ein Freigabe-PR besteht aus nichts anderem. Das war
bekannt, dokumentiert und als „roter Haken, der so gehört" beschrieben.

Übersehen war, was dieses Rot mit dem Rest der Kette macht. `verify:ci` ist
eine `&&`-Kette; die Freigabeprüfung ist Schritt 3 von 9. Tests (9) und
Build (8) stehen dahinter. **Auf einem Freigabe-PR liefen sie also nie.**

Am 2026-09-22 lag genau dort ein echter Fehler: Vier Prüfungen in
`test-anzeige.ts` hingen an einer fest verdrahteten leeren Sammlung, und die
Freigabe füllte sie. Hätte die CI auf dem PR gelaufen — sie lief aus einem
zweiten Grund gar nicht —, wäre sie bei Schritt 3 stehengeblieben, mit dem
Rot, das alle erwartet hatten. Der echte Fehler wäre dahinter nicht zu sehen
gewesen. Gefunden hat ihn nur ein von Hand nachgestellter Merge.

**Was daran allgemein ist:** Ein Signal, das in einem bekannten Fall immer
rot ist, trägt in diesem Fall keine Information mehr — weder über sich noch
über das, was es verdeckt. „Rot, aber erwartet" ist in einer `&&`-Kette
gleichbedeutend mit „der Rest wurde nicht geprüft". Wer einen Schritt als
planmäßig rot beschreibt, beschreibt zugleich alle nachfolgenden als
planmäßig ungeprüft, ob er es merkt oder nicht.

**Regel:** Eine Prüfung, die in einem bekannten Fall anschlagen soll, braucht
für diesen Fall einen Weg, auf dem sie bestätigt statt übergangen wird —
sodass die Kette weiterläuft und der Rest wirklich geprüft ist. Im Projekt:
`FREIGABE_BESTAETIGT`, gesetzt vom Freigabe-Workflow mit genau den Slugs,
die er freigegeben hat.

**Regel:** „Kein Haken" ist kein Ergebnis. Ein CI-Lauf ohne einen einzigen
Job, der nach dem Merge als „failure" stehen bleibt, sieht in der Übersicht
aus wie jeder andere alte Lauf. Wo die Prüfung nicht dort laufen kann, wo man
sie erwartet, muss sie dorthin verlegt werden, wo sie laufen kann — und ihr
Platz dort braucht selbst eine Prüfung, sonst verschwindet er beim nächsten
Umbau unbemerkt (`test-pruefkette.ts`, Abschnitt `freigeben.yml`).

---

## 26. Eine neue Regel findet ihren verbotenen Zustand zuerst in den eigenen Vorrichtungen

**Der Fund:** Die Regel `link-auf-entwurf` — ein freigegebener Eintrag darf
im Fließtext nicht auf einen Entwurf zeigen — war auf dem echten Register
sofort grün. Es gab dort keinen einzigen Entwurf. In den Tests schlug sie
dagegen zweimal an, bevor sie überhaupt ihren eigenen Negativtest bestand:

- In `test-validate.ts` war die Fixture „sonst sauberer Eintrag, nur ohne
  aliases" freigegeben und verlinkte auf `tellerrock` und `bolero` — beide
  im Test-Register Entwürfe.
- In `test-freigeben.ts` war die **ganze Vorrichtung** so gebaut: `sauber`
  zeigte auf `kaputt` (fällt durch, bleibt Entwurf) und auf `trocken` (wird
  nie freigegeben). Elf Behauptungen fielen, ohne dass an der Freigabelogik
  etwas falsch war.

**Warum gerade dort:** Vorrichtungen sind der einzige Ort, an dem
absichtlich Zustände gebaut werden, die im echten Bestand nicht vorkommen
sollen — ein Eintrag ohne Autor, ein toter Link, ein Entwurf neben einem
freigegebenen. Wer sie baut, achtet auf die Eigenschaft, die er gerade
prüfen will, und nimmt den Rest, wie er sich ergibt. Eine neue Regel über
genau diesen Rest trifft deshalb zuerst die Vorrichtungen, nicht das
Register. Das ist kein Unfall, sondern die Regel: Was nie verboten war,
wurde nebenbei gebaut.

**Die Gefahr darin:** Der naheliegende Reflex ist, die Regel für die
Vorrichtung abzuschwächen oder den Fall aus der Prüfung zu nehmen — „der
Test ist doch nur ein Test". Damit prüft die Vorrichtung aber weiter gegen
einen Zustand, den es nicht mehr geben darf, und jede Aussage aus ihr gilt
für ein Register, das so nicht existieren kann.

**Regel:** Schlägt eine neue Regel in einer Vorrichtung an, wird die
Vorrichtung umgebaut, nicht die Regel. Und bevor eine neue Invariante
eingeführt wird, lohnt der gezielte Blick: Welche Vorrichtung baut den
Zustand, den sie verbietet, nebenbei mit?

## 27. Die lokale Kette darf nachsichtiger sein als die CI, aber nicht lückenhafter

**Was passiert ist:** PR #39 (zwei neue Häuser, zwei Konzerte) war lokal
grün — `npm run verify` ohne Befund — und in der CI rot, an Schritt 6 von 9:
Autolink-Drift. Der Text des ASB-Bahnhofs nannte „Rock'n'Roll", der Begriff
war freigegeben, und der Autolink hätte ihn verlinkt. `verify:ci` prüft
das, `verify` prüfte es nicht. Der Fehler fiel erst nach dem Push auf.

**Warum das mehr ist als ein vergessener Schritt:** Die beiden Ketten sind
absichtlich verschieden. `verify` ist nachsichtig — Warnungen bleiben
Warnungen, die Freigabeprüfung überspringt sich ohne Basis —, weil lokal
nicht jede Voraussetzung der CI da ist. Diese Unterscheidung ist
begründet und im Kommentar in `package.json` festgehalten. Aber im selben
Kommentar zu `verify:ci` stand „und der Autolink-Drift wird geprüft", als
wäre das eine weitere Strenge. Das war es nicht: Autolink-Drift ist kein
Schwellenwert, den man lokal milder fassen kann, sondern ein Zustand, der
entweder synchron ist oder nicht. Eine Lücke, die als Nachsicht beschriftet
war.

**Was jetzt gilt:** `test-pruefkette.ts` verlangt, dass `verify` jeden
Schritt von `verify:ci` erreicht — selbst oder in einer ausdrücklich
genannten milden Fassung (`freigabe`, `validate`, `jsonld`). Ein neuer
Schritt, der nur in die CI-Kette eingetragen wird, macht den Test rot.

**Regel:** Wo zwei Ketten dasselbe absichern sollen, wird ihre Differenz
aufgezählt, nicht beschrieben. Was nicht auf der Liste steht, ist eine
Lücke — egal, wie es im Kommentar heißt.

## 28. Eine Zusammenfassung ist keine Quelle

**Was passiert ist:** An einem Tag, bei drei Recherchen, hat die
maschinelle Zusammenfassung einer Seite dreimal etwas behauptet, das auf
der Seite nicht stand:

- Die Website von Boppin'B sollte „Solid as a Rock" auf 2024 datieren. Die
  Seite selbst sagt 26.09.2025.
- laut.de sollte Markus Gleim als „ursprüngliche Stimme" ab 1989 nennen,
  was nach einem Widerspruch zur Wikipedia aussah. Im Originaltext steht
  „kurz darauf" nach dem Album von 1989, deckungsgleich mit Wikipedia und
  Bandwebsite.
- Die Suchzusammenfassung zu Neo-Rockabilly schrieb der englischen
  Wikipedia den Satz zu, der Begriff sei eine Journalistenprägung. Der
  Satz steht in einem Magazinartikel, als Zitat eines Musikers, und nicht
  in der Wikipedia.

**Warum das gefährlich ist:** Keiner der drei Fehler war abwegig. Jeder
hätte einen Eintrag ergeben, der plausibel aussieht und eine Quelle nennt,
die ihn nicht trägt. Der zweite hätte sogar einen Widerspruch zwischen
Quellen erzeugt, den es nicht gibt, und Regel 5 hätte ihn gewissenhaft in
den Text geschrieben.

**Regel:** Zahlen, Daten, Namen und Zuschreibungen werden am Rohtext der
Quelle geprüft, bevor sie in ein Feld oder in den Text gehen. Die
Zusammenfassung dient zum Finden, nicht zum Belegen. Ein Widerspruch
zwischen Quellen wird erst notiert, wenn er in beiden Originaltexten
steht.

## 29. Eine Sperre, die nach dem Zeichen urteilt statt nach dem Ziel, ist zugleich zu breit und zu schmal

**Was passiert ist:** Der Bash-Zweig von `guard.mjs` las jedes `>` als
Umleitung und ließ danach einen gesperrten Pfad *irgendwo* im Befehl
genügen. Sechsmal blockierte er reine Lesebefehle: eine Pfeilfunktion (`=>`),
ein `2>&1`, ein `2>/dev/null` neben einem `grep`, einen Shell-Vergleich mit
Ausgabe nach /tmp, eine Suche mit `2>/dev/null` über mehrere Verzeichnisse.
Einmal entwertete er dabei still einen Mutationsbeleg,
weil der blockierte Befehl auch die Vorbereitung enthielt. Als die
Fehlalarme als Testfälle nachgebaut wurden, fiel ein weiterer Fall auf, in
die andere Richtung: `echo x >.claude/settings.json`, eine Umleitung
**ohne Leerzeichen**, ging durch. Das Pfadmuster erwartete vor `.claude/`
ein Leerzeichen, ein Anführungszeichen, `=` oder `/`, aber kein `>`.

**Warum beides dieselbe Ursache hat:** Die Sperre fragte „steht hier ein
Schreibzeichen, und steht irgendwo ein gesperrter Pfad?", statt „wohin wird
geschrieben?". Zeichen und Pfad wurden getrennt gesucht und nie
zusammengebracht. Das Ergebnis traf Befehle, die nichts schrieben, und
verfehlte einen, der genau in den gesperrten Pfad schrieb.

**Was jetzt gilt (seit dem 2026-09-23, eingesetzt von Markus):** Jedes
`>` liefert ein Kandidatenziel, und nur das Ziel entscheidet. Ob das `>`
„wirklich" eine Umleitung ist, muss niemand mehr entscheiden. Die erste
Fassung versuchte es mit Look-arounds und einem /dev/null-Filter, und der
Mutationsbeleg zeigte alle drei als wirkungslos: Bei `=>` ist das Ziel ein
harmloses Wort. Die schlichtere Fassung ist die richtigere.

**Regel:** Eine Sperre fragt nach dem, was sie schützt, nicht nach dem
Werkzeug. Wer nach Zeichen sucht, sucht nach dem falschen Ding und findet
dabei zu viel und zu wenig.

