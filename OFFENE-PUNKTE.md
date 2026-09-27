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

`frei` **BWC Gmunden: 5 Termine anlegen (24.10.2026, 31.12.2026, 03.04.2027, 05.06.2027, 23.10.2027).**
Gesehen am 2026-09-27 auf https://boogie.at/ (Seiten `?page=1` bis
`?page=4`) und den Detailseiten dort (Herkunft: Suchlauf 2026-09-27). Dort
steht: „BWC Gmunden Herbst Boogie Party", Sa., 24.10.2026, 20:00, Gasthaus
Forstinger, Raiffeisenplatz 2, 4661 Roitham (/event/bwc-gmunden-herbst-boogie-party-0);
„BWC Gmuden Silvester Boogie Party" [sic], Do., 31.12.2026, 18:00, Dorfwirt
Fischlham, Thalheimerstr. 5, 4652 Fischlham, mit Empfangssekt, Buffet und
Mitternachtssekt, „Nähere Infos siehe Folder" (/event/bwc-gmuden-silvester-boogie-party);
„Frühjahrs Boogie Party BWC Gmunden", Sa., 03.04.2027, 20:00, Gasthaus
Forstinger Roitham (/event/fruehjahrs-boogie-party-bwc-gmunden); „Sommer
Boogie Party BWC Gmunden", Sa., 05.06.2027, 20:00, Gasthaus Kölblinger,
Hauptstraße 14, 4653 Eberstalzell (/event/sommer-boogie-party-bwc-gmunden);
„Herbst Boogie Party BWC Gmunden", Sa., 23.10.2027, 20:00, Gasthaus
Forstinger Roitham (/event/herbst-boogie-party-bwc-gmunden). Musik jeweils
„DJ.K Boogie Klaus", Platzreservierung telefonisch; einen Preis nennt keine
der Seiten. Beim Bauen: Vereinsseite http://www.bwc-gmunden.com (laut
boogie.at) als Veranstalterquelle öffnen, boogie.at ist nur Kalender.
Drei neue Locations (Roitham, Fischlham, Eberstalzell), Adresse nur aus
einer Quelle, die sie nennt — Region `oberoesterreich` gibt es. Den Folder
zur Silvesterparty suchen; ohne sichtbaren Preis `eintritt:
unveroeffentlicht`. Die Reservierungsnummer ist eine private Handynummer
und kommt nicht in den Text. Zeitzone: 24.10.2026 noch `+02:00`,
31.12. `+01:00`, 03.04.2027 und später `+02:00`.

`frei` **Boogie Lions Spillern: 6 Termine anlegen (31.10.2026, 28.11.2026, 09.01.2027, 20.02.2027, 06.03.2027, 01.05.2027).**
Gesehen am 2026-09-27 auf https://boogie.at/ (Seiten `?page=1` bis
`?page=3`) und den Detailseiten dort (Herkunft: Suchlauf 2026-09-27). Dort
steht: „‚HAPPY HALLOWEEN' Boogie Party", Sa., 31.10.2026, 20:00, Festsaal
Wiemex Spillern, Schulgasse 1, 2104 Spillern (/event/happy-halloween-boogie-party-0,
Beschreibung „Infos folgen"); „Boogie Party" am Sa., 28.11.2026
(/event/boogie-party-44), Sa., 09.01.2027 (/event/boogie-party-53),
Sa., 20.02.2027 und Sa., 06.03.2027 (Liste), Sa., 01.05.2027
(/event/boogie-party-56, eine Sammelseite mit weiteren Terminen bis
27.11.2027), jeweils 20:00, gleicher Saal, Veranstalter „Boogie Lions".
Kein Preis, keine Musikangabe. Beim Bauen: Vereinsseite
https://www.boogielions.at (laut boogie.at) und die Saalseite
https://www.wiemex.at/ öffnen; boogie.at ist nur Kalender. Neue Location
Festsaal Wiemex (Region `niederoesterreich`). Eine Reihe mit `reihe`
bietet sich an, der erste Termin ist die Vorlage für die übrigen.
Zeitzone: alle Termine `+01:00` (31.10. liegt nach der Umstellung am
25.10.), außer 01.05.2027 `+02:00`.

`frei` **BWC Rock Dock Teddys, Perchtoldsdorf: 2 Termine anlegen (06.11.2026, 18.12.2026).**
Folgetermine des Vereins hinter `events/bella-italia-perchtoldsdorf-2026-09-11`
(Vorlage). Gesehen am 2026-09-27 auf https://boogie.at/ (`?page=1`,
`?page=2`) und den Detailseiten dort (Herkunft: Suchlauf 2026-09-27). Dort
steht: „Boogie-Herbstparty", Fr., 06.11.2026, 18:30, Kulturzentrum
Perchtoldsdorf, Beatrixgasse 5A, 2380 Perchtoldsdorf, in Kooperation mit
der Tanzschule Schmid, DJane Edith & DJ Andreas, „Musikspende pro Person:
EUR 10,--", Dresscode Tracht/After-Halloween/Pre-Fasching
(/event/boogie-herbstparty); „Rock this Christmas! Swing this Christmas!",
Fr., 18.12.2026, 18:30, gleicher Ort, gleiche DJs, gleiche Musikspende,
Platzreservierung „erforderlich" (/event/rock-christmas-swing-christmas-2).
Beim Bauen: Vereinsseite http://www.rockdockteddys.at gegenlesen.
Achtung: anderer Ort als die Vorlage — Kulturzentrum Perchtoldsdorf ist
neu, nicht `locations/burg-perchtoldsdorf`. Ob „Musikspende" als Eintritt
gilt, wie beim Bella-Italia-Eintrag entscheiden. Reservierungsnummer ist
eine Handynummer, nicht in den Text. Zeitzone `+01:00`.

`frei` **Haslinger Hof Kirchham, Boogie Mix: 2 Termine anlegen (13.11.2026, 11.12.2026).**
Gesehen am 2026-09-27 auf https://boogie.at/ (Seiten 0 bis 2) und der
Sammelseite https://boogie.at/event/boogie-mix-3 (Herkunft: Suchlauf
2026-09-27). Dort steht: „BOOGIE MIX", monatlich freitags 19:00, zuletzt
Fr., 13.11.2026 und Fr., 11.12.2026, Haslinger Hof, Ed 1, 94148
Kirchham, Link https://www.haslinger-hof.de; „Monatlicher Fifties Tanzmix
mit 100% Boogie Woogie, Rock'n' Roll, Rockabilly & Swing" von DJ Rockin'
Daddy. Kein Preis. Weitere Termine für 2027 stehen noch nicht dort. Beim
Bauen: Seite des Hauses öffnen und den Termin dort suchen — boogie.at ist
Kalender, nicht Veranstalter. Neue Location in Region `bayern`. Eine Reihe
mit `reihe` bietet sich an. DJ Rockin' Daddy legt auch bei der Rockabilly
Night in Pullman City (27.12.2026) auf; das ist ein eigener Fund für den
nächsten Suchlauf, nicht Teil dieses Postens. Zeitzone `+01:00`.

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

**Datenschutzerklärung: drei offene Prüfpunkte.** Impressum und Aufsicht
sind seit dem 2026-09-27 vollständig (`src/lib/rechtliches.ts`). Offen sind
noch drei Punkte (`PRUEFEN`):
- **Log-Speicherdauer:** Wie lange speichert Netlify die Server-Logs? Die
  Datenschutzerklärung von Netlify nennt keine Frist, also beim Support
  nachfragen.
- **Akismet:** Welche Daten gehen zur Spamprüfung an Akismet? Die Doku sagt
  es nicht, ebenfalls beim Support nachfragen.
- **Löschfrist:** Nach welcher Frist löschen wir verarbeitete Einsendungen?
  Das entscheidet Markus.

Solange ein Punkt offen ist, bricht der Build mit `PUBLIC_INDEXIERBAR=true`
ab. Vor dem Go-Live gehört ein fachkundiger Blick auf beide Texte. Sie sind
ein Entwurf, keine Rechtsberatung.

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
