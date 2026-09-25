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

`mensch` **Läden & Studios in die Läufe aufnehmen?** Die Sammlung steht
seit dem 2026-09-25, mit einem Eintrag (Rockin' Barber, Berlin). Suchlauf
und täglicher Lauf kennen bisher nur Termine und Begriffe. Offen sind drei
Fragen:
(1) Soll der Suchlauf auch Adressen-Posten schreiben, und mit welchem Anteil
an den zehn Plätzen? Vorschlag: höchstens zwei, damit Termine nicht
verdrängt werden.
(2) Wie groß darf ein Bündel sein? Vorschlag: bis zu vier Anbieter derselben
Region und desselben Typs, analog zu den Begriffen.
(3) Welche Quellen soll der Suchlauf absuchen? Vorschlag: die Aussteller-
und Händlerlisten der Weekender. Walldorf führt eine eigene Seite
„Vintage Hair & Tattoo“
(https://www.walldorf-weekender.net/deutsch/50s-markt/vintage-hair-tattoo-2024/).
Die Liste ist nur ein Hinweis. Belegt wird immer über die eigene Seite des
Anbieters (`docs/ablaeufe/adressen-recherche.md`).

`mensch` **KS Barbershop Berlin-Steglitz — aufnehmen?** Das ist ein
Grenzfall des Aufnahmekriteriums. Die Seite https://www.ks-barbershop.de/
nennt ein Ladenlokal (Gardeschützenweg 65, 12203 Berlin) und unter
„Leistungen“: „wer auf das Besondere steht, bekommt auch einen Rockabilly
Style oder einen Fiftie Haircut“. Eine Unterseite
(https://www.ks-barbershop.de/fifties-haircuts-und-oldtimer/) sagt „Wir
lieben Rock ’n‘ Roll und Oldtimer“ und nennt Flat Tops, Crew Cuts und
Pompadour. Sie ist nach dem Bildnamen wohl von 2017. Die letzte Meldung
unter „News“ stammt von 2020. Zu entscheiden ist, ob das ein
Szene-Schwerpunkt ist oder ein Nebenangebot. Wenn ja, wird der Posten
`frei`. Beim Bauen dann prüfen, ob der Laden noch betrieben wird: Das
Impressum antwortete am 2026-09-25 mit 503.

`frei` **Steyrtal Boogie Party in Sierning am 17. Oktober 2026 anlegen.**
Gesehen am 2026-09-24 auf https://boogie.at/ (Herkunft: Suchlauf
2026-09-24), Detailseite https://boogie.at/event/steyrtal-boogie-party-1.
Dort steht: „Sa., 17.10.2026 - 19:00", Zorba der Grieche,
Wilhelm-von-Auersperg-Straße 2, 4523 Sierning; Person/Organisation „Crazy
Boogiefreaks"; Link auf http://zorbadergrieche.at; kein Preis angegeben.
Beim Bauen prüfen: eine zweite Quelle beim Verein Crazy Boogiefreaks
suchen (Kontaktadresse auf der Detailseite deutet auf
crazy-boogiefreaks.at); ohne Preisangabe bleibt `eintritt` leer.
Oberösterreich hat noch keine Region im Register — `oberoesterreich` als
Region (`ebene: bundesland`, aufgebaut wie
`src/content/regionen/niederoesterreich.md`) muss mit angelegt werden, bevor die Location
entstehen kann. Termin liegt nahe: Wird der Posten erst nach dem
2026-10-10 gebaut, überspringen und zurückgeben. Zeitzone `+02:00`.

`frei` **Zeitzonenprüfung deckt `src/content/` nicht ab.** `check-zeitzonen.ts`
liest `src/**/*.{ts,astro,mjs}` und `scripts/**/*.ts`, also nur Code. Ein
Frontmatter-Wert mit Uhrzeit, aber ohne Zonenangabe — `beginn:
2026-10-18T16:00:00` — läuft am 2026-09-24 durch `check:zeit`, `validate`
und `jsonld` grün durch. `z.coerce.date()` liest ihn dann in der
Prozess-Zeitzone: `TZ=UTC` ergibt `16:00Z`, `TZ=Europe/Berlin` ergibt
`14:00Z`. Zwei Stunden Unterschied, je nachdem wo gebaut wird — und das ist
genau die Fehlerklasse aus Lektion 1, eine Ebene unterhalb ihrer eigenen
Prüfung. Zu bauen: eine Regel, die in `validate-content.ts` oder in
`check-zeitzonen.ts` jeden Datumswert im Frontmatter ablehnt, der eine
Uhrzeit trägt, aber keinen Offset. Reine Datumswerte (`erstelltAm`,
`geprueftAm`) bleiben erlaubt, sonst fallen alle bestehenden Einträge.
Negativtest und Mutationsbeleg gehören dazu; der Gegenbeleg oben ist die
Vorlage.

`frei` **Record Hop in der Alten Feuerwache nachziehen.** Zwei Felder des
veröffentlichten Eintrags `record-hop-alte-feuerwache-2026-09-25.md` stehen
auf einer Lesart, die am 2026-09-24 widerlegt wurde (ENTSCHEIDUNGEN,
2026-09-24). Erstens `ende: 2026-09-26T05:00:00+02:00`: Sieben der acht
geprüften Termine dieser Quelle enden auf 05:00 Ortszeit, unabhängig von
Anfangszeit und Spielort; beim achten fällt das Ende mit dem Beginn
zusammen. Entweder konstant oder leer — ein Vorgabewert, kein Fakt. Das Feld gehört
entfernt, die Begründung in die Redaktionsnotiz und in den Fließtext.
Zweitens `art: offiziell` für Rockin' Wildcat: Der Gig Guide bündelt fremde
Ankündigungen, das ist `aggregator` nach der Definition im Schema. Die
beiden neuen Berliner Einträge vom 2026-09-24 führen die Quelle bereits so.
Der Eintrag ist veröffentlicht, der Termin am 2026-09-25 vorbei — also erst
nach `npm run archivieren` anfassen und die Änderung als Korrektur mit
Datum in die Redaktionsnotiz schreiben, nicht stillschweigend.

`frei` **Berlin: die nächsten Termine aus dem Rockin'-Wildcat-Gig-Guide.**
Nachfolger des am 2026-09-24 erledigten Postens; zwei Termine sind
angelegt (The Sinners 10.10., Record Hop Rathaus Friedrichshagen 18.10.).
Als Nächstes anstehen: Jets / Smokestack Lightnin' am 03.10.2026 im
Roadrunner's Rock & Motor Club (Saarbrücker Str. 24, 10405 Berlin), The
Sinners' Nachbartermine im American Western Saloon (Aron King & his
Ferriday Rockers am 07.11., De Waltons am 21.11.) und die beiden weiteren
Record Hops im Rathaus Friedrichshagen (08.11., 06.12.). **Vorsicht beim
Roadrunner's:** Die Website `roadrunners-paradise.de` lieferte am
2026-09-24 ein Zertifikat, das sich nicht verifizieren ließ; der Spielort
war deshalb nicht gegenzulesen und wurde nicht angelegt. Erst erneut
versuchen, und wenn sie weiter nicht erreichbar ist, eine zweite Quelle für
die Adresse suchen, bevor die Location entsteht. Für die Quelle selbst
gelten seit dem 2026-09-24 drei belegte Regeln (ENTSCHEIDUNGEN): sichtbare
Uhrzeit statt JSON-LD `startDate`, sichtbares Feld „Kosten" entscheidet
über den Preis, kein `ende` übernehmen. Detail-URLs immer aus
`offers.url` des JSON-LD, nie raten. Bands in `lineupWeitere`. Termine, die
vor der nächsten Freigabe vorbei wären, überspringen.

`frei` **Boppin'B, Bündel: 2 Termine anlegen (26.12.2026 Colos-Saal Aschaffenburg, 9.1.2027 Café Central Weinheim).**
Beide stehen auf der Live-Seite der Band (`bands/boppin-b`, `links.website`)
und werden dort gegengelesen; je Termin zusätzlich die Seite des Hauses.
Einzelheiten je Termin:

- **Boppin'B im Colos-Saal Aschaffenburg am 26. Dezember 2026 anlegen.**
Die Terminliste der Band bei Reservix
(https://www.reservix.de/tickets-boppinb/t3454) nennt „Sa. 26.12.2026,
20:00 Uhr, Aschaffenburg, Colos-Saal, ab 24,10 €". Die Seite des Hauses als
zweite Quelle öffnen, den Colos-Saal als Location anlegen (Region `bayern`,
Adresse nur mit Beleg) und den Termin mit `lineupBands: [boppin-b]`. Die
Band ist freigegeben, der Verweis ist also erlaubt. Zeitzone im Dezember:
`+01:00`.
- **Boppin'B im Café Central Weinheim am 9. Januar 2027 anlegen.** Die
Detailseite https://cafecentral.de/konzert/goppin-b/ nennt „Sa 9.1.2027",
Einlass 19 Uhr, Beginn 20 Uhr. Der Ticketshop (loveyourartist, Profil
„Cafe Central/TocopillA Events") nennt 22 €. Haus und Band sind
freigegeben. Zeitzone `+01:00`. Vorsicht: Das Haus verwendet alte
Ankündigungstexte weiter, das Datum also nur aus der Datumszeile der
Detailseite übernehmen und gegen den Ticketshop halten (ENTSCHEIDUNGEN,
2026-09-23).

`frei` **Lexikon, Bündel Tanz: Rock'n'Roll-Tanz, Boogie-Woogie-Tanz, Jive.** Drei
Einträge in einem PR (Bündel-Posten seit dem 2026-09-25). Die drei gehören
zusammen: Sie grenzen sich gegeneinander und gegen Lindy Hop ab, und das
geht am besten in einem Zug. Einzelheiten je Begriff:

- **Rock'n'Roll-Tanz.** Entscheidung Markus 2026-09-25: Der Tanz
bekommt einen eigenen Eintrag neben der Musik (`lexikon/rocknroll`), nach dem
Vorbild von `lexikon/lindy-hop`. Slug `rocknroll-tanz`, Name
„Rock'n'Roll-Tanz", `kategorie: tanz`; erster Satz „Der Rock'n'Roll-Tanz
ist ein …". **Aliases:** die Schreibweisen, die auch der Musikeintrag trägt
(„Rock'n'Roll", „Rock-'n'-Roll", „Rock 'n' Roll", „Rock ’n’ Roll") — daran
erkennt der Autolink seit dem 2026-09-25 das Wort als mehrdeutig und
verlinkt es nicht mehr automatisch; weitere Namen wie „Akrobatischer
Rock'n'Roll" nur mit Quelle. `abgrenzung` gegen die Musik, gegen Lindy Hop
und gegen Boogie-Woogie als Tanz; Turnierwesen (World Rock'n'Roll
Confederation, im Musikeintrag schon genannt) mit Quelle. Im Musikeintrag
den Abgrenzungsabschnitt auf den neuen Eintrag verlinken.

- **Boogie-Woogie-Tanz.** Wie der Posten davor: Slug
`boogie-woogie-tanz`, Name „Boogie-Woogie-Tanz", `kategorie: tanz`, erster
Satz „Der Boogie-Woogie-Tanz ist ein …". Aliases „Boogie-Woogie" und
„Boogie Woogie" (die Schreibweisen des Musikeintrags). Der Musikeintrag
`lexikon/boogie-woogie` beschreibt den Tanz bisher in einem eigenen
Abschnitt samt Quellen — die dortigen Belege sind der Ausgangspunkt, der
Abschnitt wird danach auf einen Verweis gekürzt. Abgrenzung gegen die
Musik, gegen Lindy Hop und gegen den Rock'n'Roll-Tanz. Im
deutschsprachigen Raum meint das Wort fast immer den Tanz — das gehört mit
Quelle in den Text, nicht als Behauptung.
- **Jive.** Steht in fünf Texten, unter anderem bei den
Tanzkursen in Ganderkesee, und hat keinen Eintrag. Jive ist ein Tanz ohne
gleichnamige Musikrichtung, das Wort ist also nicht mehrdeutig. `kategorie: tanz`. Die Abgrenzung gegen den
Lindy Hop und gegen den Rock'n'Roll-Tanz gehört in den Text, mit Quelle;
steht der Eintrag `rocknroll-tanz` schon, dorthin verlinken.

`frei` **Lexikon: Teddy Boy.** Der Begriff steht in vier Texten des Registers
(unter anderem Neo-Rockabilly) und hat keinen Eintrag. Es geht um die
britische Jugendkultur der 1950er, auf die sich die Rockabilly-Szene in
Großbritannien bis heute bezieht. Quellen öffnen (Wikipedia de/en,
Vintage Rock, ein Nachschlagewerk zur Mode), Widersprüche in den Text.
`abgrenzung` gegen Rockabilly als Musik und gegen die Mods. Danach
`npm run autolink`.

`frei` **Psychobilly-Osterfestival im Café Central Weinheim.** Die Startseite
nennt „Frenzy — Psychobilly Oster Festival, Sa 27.03." und „Demented Are
Go, So 28.03." ohne Jahr (Detailseiten /konzert/frenzy/ und
/konzert/demented-are-go/). Nur anlegen, wenn eine Detailseite oder der
Ticketshop das Jahr nennt. Sonst den Posten mit genau diesem Befund
zurückgeben, nicht schätzen. Achtung Zeitzone: Am 28.03.2027 beginnt die
Sommerzeit, der Samstag hat `+01:00`, der Sonntagabend `+02:00`.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

## Vor dem Go-Live

**Impressum und Datenschutzerklärung.** In Deutschland Pflicht. Inhalt
kommt vom Menschen, Struktur kann vorbereitet werden. Die Datenschutzerklärung
muss das Vorschlagsformular (Netlify Forms, Spamprüfung über Akismet)
nennen — Personendaten fragt es nicht ab, verarbeitet werden aber
technische Daten der Einsendung.

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

**Durchsatz messen — ab dem 2026-10-09.** Seit dem 2026-09-25 zwei Läufe am
Tag und Bündel-Posten (bis sechs Termine, vier Begriffe). Nach zwei Wochen
zählen: freigegebene Einträge pro Woche, Inhalts-PRs pro Woche, wie viele
Bündel ganz, teilweise oder gar nicht durchkamen, Kosten pro Lauf. Daran
entscheidet sich, ob Bündelgröße oder Laufzahl nachjustiert wird.

**Neun Tanz-Links umbiegen — sobald beide Tanzeinträge freigegeben sind.**
Gezählt am 2026-09-25: Diese Links zeigen auf einen Musikeintrag, meinen
aber den Tanz. Sie sind geschützt und ändern sich nicht von selbst.
`lexikon/petticoat` und `artikel/petticoat-reifrock-unterrock`
(„Rock-'n'-Roll-Tanzes"), `lexikon/lindy-hop` (Boogie-Woogie und
akrobatischer Rock'n'Roll als Nachfolgetänze, zwei Links),
`lexikon/boogie-woogie` („World Rock'n'Roll Confederation"),
`events/bella-italia-perchtoldsdorf-2026-09-11` („Boogie-Woogie-Club"),
`events/rocknroll-boogie-woogie-weekend-2027-01-15` (Tanzwochenende, zwei
Links), `regionen/niederoesterreich` („Boogie- und Rock-'n'-Roll-Abende"
der Tanzszene). Mehrdeutig und bewusst beim Musikeintrag belassen: die
Festivalnamen Ganderkesee und Walldorf, `regionen/niedersachsen`,
`locations/asb-bahnhof-barsinghausen`, der Boogie-Woogie-Link der
Rockabilly Convention. Einfach als `frei`-Posten nach oben ziehen, wenn
die Bedingung erfüllt ist.

**Suchlauf auswerten — ab dem 2026-10-21.** Seit dem 2026-09-23 füllt ein
wöchentlicher Suchlauf die Warteschlange auf höchstens zehn `frei`-Posten
auf (`docs/ablaeufe/termin-recherche.md`). Nach vier Wochen zählen: Wie
viele Posten tragen „Herkunft: Suchlauf", wie viele wurden zu einem
Eintrag, wie viele kamen zurück und warum. Führt weniger als die Hälfte zu
einem Eintrag, wird der Suchlauf abgestellt oder umgebaut (Routine
„v101 — wöchentlicher Suchlauf"), Begründung nach ENTSCHEIDUNGEN.md.

**Genres für das Ganderkesee-Festival — sobald das Line-up 2027 steht.**
Am 2026-09-23 bewusst leer gelassen: Die Seite nennt Rock 'n' Roll als
Thema, nicht als Musik der Bands, und das Wort ist zugleich ein Tanz
(Begründung in der Redaktionsnotiz des Eintrags). Mit Bands und
Stilangaben wird die Zuordnung belegbar.

**Aktualitätsbeleg als Schemafeld — nach etwa dreißig Events.** Die Regel
greift (sie hat zweimal vor einem Fehler bewahrt), aber die tragfähigen
Belege waren durchweg Nebenprodukte der Technik: Uploadpfad, Slug-Nummer,
`dateModified`, Sortierverhalten einer Liste. Kein Veranstalter sagt
selbst, für welche Ausgabe seine Angaben gelten. Ein Pflichtfeld würde
eine Systematik behaupten, die es nicht gibt. Wenn sich nach dreißig
Events wiederkehrende Belegarten zeigen, wird daraus ein Feld — vorher
nicht.

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
