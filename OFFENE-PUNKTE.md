# Offene Punkte

Was ansteht, mit Begründung und Reihenfolge. Neues oben in der jeweiligen
Gruppe. Erledigtes wird gestrichen, nicht abgehakt — was erledigt ist,
steht in ENTSCHEIDUNGEN.md.

Nicht hier hinein gehört: Fehler (die gehören behoben oder in REVIEW.md),
Ideen ohne Entscheidung (die gehören in ein Gespräch), Erledigtes.

Bewusst vertagte Befunde aus dem Review stehen weiterhin in `REVIEW.md`,
Abschnitt 4 — sie werden hier nicht wiederholt, damit es nicht zwei Orte
für „nicht jetzt" gibt.

## Die Marken unter „Als Nächstes"

Seit dem 2026-09-20 nimmt sich ein täglicher unbeaufsichtigter Lauf seine
Aufgabe aus diesem Abschnitt. Damit ist er nicht mehr nur Prosa, sondern die
Eingabe eines Automaten, und jeder Posten dort trägt eine Marke:

- **`frei`** — ein Lauf darf das ohne Rückfrage bauen. Das Ergebnis ist
  immer ein Pull Request, Inhalte immer `status: entwurf`.
- **`mensch`** — gehört Markus: Ermessen, Zahlen, Semantik, oder der Posten
  liegt hinter einer Sperre (`.claude/`, `.github/`, Schema, `site.config`).

`npm run warteschlange` zeigt die Liste, `--check` scheitert bei einem
Posten ohne Marke. Es gibt bewusst **keine Voreinstellung**: Ohne Marke wäre
ein Ermessensposten entweder im Automaten oder stumm aus der Warteschlange
gefallen. Die Begründung steht im Kopf von `scripts/warteschlange.ts`.

Nur dieser Abschnitt trägt Marken. „Vor dem Go-Live" und „Später, mit
Bedingung" sind Rückstau, keine Warteschlange.

## Als Nächstes

`frei` **Die Warteschlange verschluckt Posten mit umgebrochenem Titel.** Am
2026-09-21 an zwei eigenen Posten dieses Laufs aufgefallen, beide erst nach
dem Zählen. `MIT_MARKE` in `scripts/warteschlange.ts` ist zeilenweise
verankert und verlangt die schließenden `**` in derselben Zeile wie die
Marke. Läuft der fette Titel über zwei Zeilen um — bei 79 Zeichen Zeilenlänge
der Normalfall für einen langen Titel —, greift weder `MIT_MARKE` noch
`OHNE_MARKE` (die Folgezeile beginnt nicht mit `**`). Der Posten fällt
**stumm** aus der Liste: Minimalbeleg `lies()` auf einem umgebrochenen Titel
ergibt `posten=0 ohneMarke=0`, auf demselben Titel einzeilig `posten=1`.
Das ist genau der Zustand, den der Kopf dieser Datei ausschließen wollte
(„stumm aus der Warteschlange gefallen") — und `--check` schlägt nicht an,
weil der Posten gar nicht erst gesehen wird. Ein `frei`-Posten, den niemand
sieht, wird nie gebaut; ein `mensch`-Posten, den niemand sieht, gilt als
erledigt.
Kein Ermessen dabei: Der Titel muss bis zu den schließenden `**` gelesen
werden, auch über den Zeilenumbruch hinweg. Zwei Negativtests gehören dazu —
umgebrochener Titel wird gefunden, und eine Fettschrift ohne Marke landet
weiterhin in `ohneMarke` statt unbemerkt durchzugehen.

`mensch` **Der Lauf baut denselben Posten zweimal.** Am 2026-09-21 passiert und der teuerste Befund
dieses Laufs: PR #26 vom Vorabend hatte den Posten „Bands und Artikel sind
leer" bereits abgearbeitet, war aber noch nicht gemerged. `npm run
warteschlange` liest OFFENE-PUNKTE.md aus dem Arbeitsbaum, und dort stand
der Posten unverändert auf `frei` — also nahm ihn der nächste Lauf erneut.
Ergebnis: zwei Pull Requests, dieselbe Band (Mad Sin), zwei verschiedene
Artikel, zwei Fassungen derselben Funde, und ein garantierter Konflikt in
OFFENE-PUNKTE.md und ENTSCHEIDUNGEN.md.
Das wiederholt sich jeden Tag, an dem der Vortags-PR nicht gemerged ist —
und genau dieser Fall ist der Regelfall, weil Inhalts-PRs absichtlich auf
einen Menschen warten (`automerge:erlaubt`). Die Kosten wachsen mit dem
Rückstau, nicht mit der Zeit.
Zu entscheiden ist, woran der Lauf den Rückstau erkennen soll. **(a)
`warteschlange.ts` fragt die offenen PRs ab** und überspringt Posten, für
die schon einer offen ist — genau, aber das Skript bräuchte Netzzugriff und
ein Token und wäre damit in der Prüfkette nicht mehr offline lauffähig.
**(b) Der Lauf prüft vor Schritt 1 selbst, ob ein offener PR aus einer
früheren Runde existiert** — kostet keine Änderung am Skript, steht aber im
Prompt und ist damit eine Bitte an ein Modell statt ein Exitcode (genau das,
was bei Warteschlange und Auto-Merge-Grenze bewusst vermieden wurde).
**(c) Der Posten wird beim Öffnen des PR umgehend auf `mensch` gesetzt** —
billig und im Code nachvollziehbar, verlagert die Buchführung aber in den
PR-Zweig, wo der nächste Lauf sie nicht sieht, solange er von `main`
startet. Keine der drei ist offensichtlich richtig.

`mensch` **Bands und Artikel: drei Entwürfe stehen, die Freigabe fehlt.** Rest des
an zwei aufeinanderfolgenden Tagen abgearbeiteten Postens, und er gehört von
vornherein zum Menschen. `bands/mad-sin.md`,
`artikel/petticoat-reifrock-unterrock.md` und
`artikel/hot-rod-und-kustom-kulture.md` sind belegt und geprüft, aber
`entwurf` — ein Lauf darf den freigegebenen Status nicht setzen. Solange das
so ist, führt `npm run stale` beide Sammlungen weiter unter „Sammlungen ohne
Eintrag": Der Bericht zählt freigegebene Einträge, und das ist richtig so,
denn im Index steht nichts. Mit der Freigabe erledigt sich dieser Posten und
die Meldung gleich mit.
**Was beim Prüfen besonders hinzusehen ist**, jeweils in der
Redaktionsnotiz begründet: Bei Mad Sin steht `aktiv: true` auf seinem
Vorgabewert — Songkick führte die Band am 2026-09-20 als „off tour", Reservix
meldete keine Termine, das letzte Album ist von 2020. Zwei Widersprüche
zwischen Quellen stehen bewusst im Text statt im Feld (das Album „Babylon
Reloaded", der Austritt von Gitarrist Stein). Und die offizielle Website war
an beiden Recherchetagen nicht abrufbar, der Eintrag stützt sich also
ausschließlich auf Fremdbeschreibungen.

`mensch` **Trägt ein Eintrag aus dem Lauf einen Autorennamen oder nicht?** Zwei
unbeaufsichtigte Läufe haben das an einem Tag gegensätzlich entschieden, und
der Zustand ist jetzt uneinheitlich: `bands/mad-sin.md` trägt `autor: markus`
wie die übrigen 44 Einträge, `artikel/hot-rod-und-kustom-kulture.md` trägt
keinen. Dafür spricht jeweils etwas. **Für den Namen:** Die Zuschreibung ist
die des verantwortlichen Herausgebers, nicht die des Schreibenden, und jeder
Eintrag des Registers hält es so. **Gegen den Namen:** Der Text stammt nicht
aus der Hand dieses Menschen, und eine Zuschreibung, die niemand getragen
hat, ist genau die Sorte Behauptung, die hier nirgends vorkommen soll. Der
Rückfall im `artikelBuilder` (ohne `autor` verantwortet die Organisation)
bleibt in jedem Fall richtig — er fängt einen zulässigen Zustand ab und ist
in `test-jsonld.ts` belegt. Zu entscheiden ist nur, welcher der beiden
Zustände der Normalfall ist; danach wird der andere Eintrag angeglichen.

`frei` **Die Autoseite hat einen Artikel, aber keine Entitäten.** Der Artikel
`hot-rod-und-kustom-kulture` trägt keine `hauptentitaet`, weil es keine gibt:
Die Lexikonkategorie `auto` ist leer. Es fehlen Hot Rod, Custom Car, Kustom
Kulture und Rat Rod — vier Begriffe, die der Artikel erklärt, ohne dass die
Entität dahinter existiert. Quellenlage ist gut (deutsche Wikipedia zu allen
drei Hauptbegriffen, am 2026-09-20 geöffnet). Sobald sie stehen, bekommt der
Artikel seine `hauptentitaet`, und `erwaehnteBegriffe` wächst über Rockabilly
und Psychobilly hinaus. Dabei ebenfalls zu prüfen, weil derselbe Fund: Dem
Register fehlt ein Lexikoneintrag zu **Rock'n'Roll**. Bands, deren Quellen
genau dieses Wort nennen — The Firebirds etwa —, sind derzeit nicht
eintragbar, weil `genres` mindestens einen Lexikonslug verlangt.

`frei` **Rockabilly Convention: die Oldtimer-Regelung fehlt im Eintrag.** Die
Veranstalterseite nennt am 2026-09-20 eine konkrete Bedingung, die im
Registereintrag nicht steht: Fahrerinnen und Fahrer von Fahrzeugen der 50er
und 60er Jahre haben freien Eintritt und dürfen in der Westernstadt parken
und durchfahren, Einfahrt Freitag und Samstag ab 10 Uhr. Das ist genau die
Art Angabe, für die jemand ein Register aufsucht. Gefunden beim Beleg für den
Kustom-Kulture-Artikel, nicht nebenbei mitgebaut.

`mensch` **Das Golden Example der Bands nennt für The Firebirds 1985.** Die
deutsche Wikipedia datiert die Bandgründung auf Mai 1992; 1985 war das erste
musikalische Zusammentreffen zweier späterer Mitglieder. Die Datei ist eine
Vorlage und wird vom Loader übersprungen, richtet also keinen Schaden im
Register an — aber sie ist das, woran sich jeder neue Eintrag orientiert, und
sie behauptet über eine reale Band eine falsche Jahreszahl. Ob die Vorlage
auf eine erfundene Band umgestellt oder die Zahl korrigiert wird, ist eine
Entscheidung über die Vorlage selbst.

`mensch` **Die Prüfkette wird durch bloßen Zeitablauf rot.** Am 2026-09-21 war
`npm run verify` auf `main` rot, ohne dass jemand etwas geändert hatte: Die
Boogie-Party vom 2026-09-20 stand noch auf `durchfuehrung: geplant`, und
`validate-content.ts` macht daraus zu Recht einen Fehler. `npm run
archivieren` stellt es in einem Befehl um — aber bis das jemand aufruft, ist
jeder Zweig rot, auch einer, der mit Terminen nichts zu tun hat. Zu
entscheiden: ob die wöchentliche Pflege (`.github/workflows/pflege.yml`)
dafür reicht, ob `archivieren` in die Kette gehört, oder ob der Befund für
noch nicht archivierte Termine eine Warnung statt eines Fehlers sein sollte.
Alle drei sind vertretbar und haben unterschiedliche Nebenwirkungen; die
Datei liegt zudem hinter der `.github/`-Sperre.

`mensch` **`guard.mjs` sperrt zu breit — und nur ein Mensch kann es ändern.** Der
Bash-Zweig blockiert jeden Befehl, der die gesperrte Schemadatei nennt und
irgendwo ein `>` enthält. Das trifft `2>&1` genauso wie eine Pfeilfunktion
`i => i.path[0]` — also auch reine **Lesezugriffe**. Belegt am 2026-09-11:
derselbe `npx tsx -e`-Befehl lief erst, nachdem die Pfeilfunktion durch
`function` ersetzt war. Zu breit ist besser als zu schmal, aber eine Sperre,
um die man täglich herumformuliert, wird irgendwann umgangen statt beachtet.
Naheliegend: den Schreibverben ein Wortgrenzen-Muster geben, statt auf das
bloße Zeichen `>` zu prüfen — dieselbe Korrektur wie damals beim
Statuswort (Lektion 18). `.claude/` ist für Agenten gesperrt, auch für diese
Änderung.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

`frei` **Niedersachsen und Rhein-Neckar brauchen einen zweiten Termin.** Drei der
fünf Regionen haben jetzt drei bis fünf Verweise und kommen mit der Freigabe
über die Bestandsschwelle. Diese beiden stehen weiter bei zwei. Für
Niedersachsen führt jede Spur auf das Festival in Ganderkesee zurück, das
schon erfasst ist. Für Rhein-Neckar war der Walldorf Weekender 2026
ausdrücklich die letzte Ausgabe, und es wurde kein Ersatz gefunden; die
naheliegenden Verzeichnisse (livegigs.de) antworten automatisierten Abrufen
mit HTTP 403. Beides braucht entweder eine andere Quelle oder eine Recherche
von Hand.

`mensch` **Der Skill `events-recherche` passt nicht auf dieses Repo.** Er verweist auf
ein anderes Projektverzeichnis und auf ein Frontmatter mit `title`, `datum`,
`stadt`, `tags`, `wiederkehrend` — keines dieser Felder existiert hier, und
das Schema ist `.strict()`. Vor allem fehlt ihm die Belegpflicht: keine
Quellen, keine Felderdeckung, kein Entwurfsstatus. Er wurde deshalb nicht
ausgeführt. Er liegt im Skill-Verzeichnis des Benutzers und damit außerhalb
dieses Repos; anpassen oder auf das alte Projekt beschränken kann ihn nur
ein Mensch. Dasselbe dürfte für die übrigen mitgelieferten Recherche-Skills
gelten (`bands-recherche`, `barbershops-recherche`, `tattoo-recherche`) —
geprüft ist bisher nur dieser eine.

`frei` **`genres` an den restlichen Events.** Nachgetragen sind Rockabilly
Convention, Record Hop und die beiden neuen Termine. Offen bleiben Bella
Italia und das Ganderkesee-Festival. Es ist kein Formalakt: Jede Zuordnung
ist eine Behauptung über die Veranstaltung und braucht einen Beleg in deren
eigener Quellenlage. Wo die Quelle schweigt, bleibt das Feld leer — und bei
Boogie-Tanzabenden bleibt es leer, auch wenn die Quelle „Boogie" sagt, weil
der Lexikoneintrag den Klavierstil bezeichnet und nicht den Tanz.

`mensch` **Termine kurz vor dem Datum noch einmal anfassen.** Die Prüfkadenz für
Events steht auf 30 Tagen und hätte die falsche Anfangszeit des Record Hop
beinahe bis nach den Termin getragen; gefunden wurde sie nur, weil die Seite
aus einem anderen Grund erneut geöffnet wurde. Zu entscheiden: ob
`stale-report.ts` einen Posten „Termin steht bevor, letzte Prüfung liegt
zurück" bekommt. Vorher messen, wie oft sich Angaben in den letzten Tagen vor
einem Termin tatsächlich ändern — bei sieben Events ist das noch nicht
beantwortbar.

`frei` **Neo-Rockabilly: erst eine Quelle, dann ein Eintrag.** Der Begriff war als
achter der Gruppe vorgesehen und ist nicht angelegt, weil ihn keine der
geöffneten Quellen definiert. Die englische Wikipedia führt einen Stub, der
das Genre auf „ab 1990" datiert und Kings of Leon und The Black Keys nennt;
die deutsche Wikipedia datiert Neo-Rockabilly im Rockabilly-Artikel auf die
1980er Jahre und die Stray Cats. Der Artikel zu Restless nennt die Band
„pioneers of neo-rockabilly", ohne zu sagen, was das ist. Zwei einander
widersprechende Datierungen und keine Definition tragen keinen Eintrag.
Nötig wäre eine Quelle, die den Begriff bestimmt — Fachliteratur oder ein
Szenemagazin. Bis dahin steht die Unterscheidung in der `abgrenzung` von
Rockabilly und Psychobilly.

`mensch` **Boogie-Woogie als Tanz: eigener Eintrag oder nicht?** Im deutschsprachigen
Raum meint das Wort fast immer den Paartanz und nicht den Klavierstil, und
getanzt wird dazu Rock'n'Roll, Rockabilly, Jump Blues und Swing — gerade
nicht die gleichnamige Musik. Derzeit trägt der Musikeintrag die
Unterscheidung in `abgrenzung` und einem eigenen Abschnitt. Ob daraus ein
zweiter Eintrag `boogie-woogie-tanz` wird, ist eine Ermessensfrage: Zwei
Einträge sind sauberer, ein Slug mit Klammerzusatz ist hässlich, und der
Autolink kann zwei gleichnamige Begriffe nicht auseinanderhalten.

## Vor dem Go-Live

**Impressum und Datenschutzerklärung.** In Deutschland Pflicht. Inhalt
kommt vom Menschen, Struktur kann vorbereitet werden.

**Methodik-Seite.** Wie wird recherchiert, geprüft, aufgenommen? Gibt es
bezahlte Einträge? Wird selten gebaut und wirkt bei einem Register stark —
sie beantwortet die Frage, die ein skeptischer Leser und ein bewertendes
Modell gleichermaßen haben.

**Analytics ohne Einwilligungsbanner.** Netlify Analytics (serverseitig,
keine Cookies) oder Plausible. Ein Cookie-Banner auf einem Register kostet
Nutzer und bringt nichts.

**Alte URLs von v101.de.** Die Domain trug bis 2024 ein
Preisvergleichssystem, 1447 URLs sind in der Wayback Machine erfasst.
Weiterleiten lohnt nur für rund 75 davon: 48 szenenahe `/c/`-Kategorien,
17 `/thema/`-Seiten mit Bezug (rockabilly, pin-up, burlesque, bettie-page,
elvis, polka-dots, charleston, gatsby, oldschool, cherry, anker) und die
zwölf `/jahrzehnt/`-Seiten. Der Rest — 953 Kategorie-mal-Tag-Kombinationen
und Produktseiten — bekommt 410. Eine Weiterleitung ohne thematische
Entsprechung ist für Google ein Soft-404 und vererbt nichts.

**Startschwelle prüfen.** Vor `PUBLIC_INDEXIERBAR=true`: 80+
Veranstaltungen mit Mehrzahl in der Zukunft, 5 Regionsseiten mit echter
Einordnung, 80 Lexikonbegriffe, zwei Säulen der Themenkarte vollständig.

## Später, mit Bedingung

**Aktualitätsbeleg als Schemafeld — nach etwa dreißig Events.** Die Regel
greift (sie hat zweimal vor einem Fehler bewahrt), aber die tragfähigen
Belege waren durchweg Nebenprodukte der Technik: Uploadpfad, Slug-Nummer,
`dateModified`, Sortierverhalten einer Liste. Kein Veranstalter sagt
selbst, für welche Ausgabe seine Angaben gelten. Ein Pflichtfeld würde
eine Systematik behaupten, die es nicht gibt. Wenn sich nach dreißig
Events wiederkehrende Belegarten zeigen, wird daraus ein Feld — vorher
nicht.

**Prüfbericht für die Freigabe — wenn die Handarbeit zu viel wird.** Bei
zehn Einträgen genügt Lesen. Bei sechzig braucht es ein Werkzeug, das je
Eintrag zeigt, welche Behauptung an welcher Quelle hängt. Erst bauen, wenn
klar ist, was beim Freigeben tatsächlich geprüft wird.

**Preisstaffeln zweidimensional — wenn achtwertige Staffeln häufig
werden.** Derzeit werden Tag und Kaufweg in die `bezeichnung` gefaltet,
maschinell nicht auswertbar. Bewusste Grenze der Schnittstelle, in
ENTSCHEIDUNGEN.md begründet.

**Subagenten für Events.** Sinnvoll bei strukturierter Extraktion aus
einer Quelle — wenig Prosa, Qualitätskontrolle durch das Schema. Nicht
sinnvoll für Lexikonartikel: dort gibt es keinen ersten Eintrag, der den
Ton setzt. Vorher belegen, dass die PostToolUse-Hooks auch bei
Schreibzugriffen aus Subagenten feuern. Agentendefinitionen gehören nach
`.claude/agents/` und müssen deshalb vom Menschen eingestellt werden.
