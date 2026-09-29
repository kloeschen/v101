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

`mensch` **BWC Rock Dock Teddys, Boogie-Herbstparty: Datum strittig (06.11. oder 20.11.2026).**
Rest des Postens vom 2026-09-27; der Weihnachtsabend am 18.12.2026 ist
gebaut (`events/rock-this-christmas-perchtoldsdorf-2026-12-18`). Befund
vom 2026-09-29: boogie.at (/event/boogie-herbstparty, vom Verein selbst
eingetragen) nennt Fr., 06.11.2026, 18:30, Kulturzentrum Perchtoldsdorf.
Der Terminkalender der Vereinsseite
(http://www.rockdockteddys.at/0000019b6a0b14d0e/index.html, nur http,
Last-Modified 30.08.2026) nennt „HERBSTPARTY", Fr., 20.11.2026, Burg
Perchtoldsdorf, Einlass 18:30, Beginn 19:00, Ende 23:30, gleiches Motto
(Tracht/After Halloween/Pre Fasching), gleiche Musikspende 10 Euro. Keine
dritte Quelle (Tanzschule Schmid und Gemeinde führen den Abend nicht).
**Zu entscheiden:** (a) Markus fragt beim Verein nach (Kontakt im
Impressum der Vereinsseite) und trägt das Datum hier ein — dann wird der
Posten wieder `frei`, zwei Minuten plus eine Antwort; (b) liegen lassen und
ab dem 2026-10-20 erneut beide Seiten prüfen lassen — kostet einen Lauf,
löst sich nur, wenn der Verein eine Seite nachzieht; (c) streichen —
kostet einen Termin, der Weihnachtsabend steht ohnehin. Nicht nach boogie.at
allein bauen: Beim Ort gab der Abgleich mit dem Oktober-Ball einen Grund
zur Gewichtung, beim Datum gibt es keinen.

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

`frei` **Boogie Lions Spillern: 5 Termine anlegen (28.11.2026, 09.01.2027, 20.02.2027, 06.03.2027, 01.05.2027).**
Rest des Bündels vom 2026-09-28; der Halloween-Termin am 31.10.2026 ist
gebaut (`events/boogie-lions-halloween-spillern-2026-10-31`, Vorlage für
diese fünf, samt Reihe `boogie-lions-boogie-party` und Location
`festsaal-wiemex-spillern`). **Befund, warum sie fehlen:** Die
Veranstaltungsliste des Vereins (https://www.boogielions.at/veranstaltungen)
nennt nur Datum und Titel: „28.11.2026 - Boogie Abend mit DJ Sascha",
„09.01.2027 - Happy New Year", „20.02.2027", „06.03.2027", „01.05.2027 -
Boogieabend". Uhrzeit und Ort nennt für diese Termine nur boogie.at
(/event/boogie-party-44, /event/boogie-party-53, /event/boogie-party-56),
und jeder Abruf von boogie.at brach am 2026-09-28 aus der Arbeitsumgebung
ab (Verbindungsabbruch, WebFetch 503). 20:00 und „gleicher Saal" aus der
Gewohnheit zu übernehmen wäre geschätzt. Beim Bauen: boogie.at zuerst
öffnen; ist es wieder nicht erreichbar, den Posten liegen lassen, bis der
Verein eigene Ankündigungen veröffentlicht (er tut das etwa einen Monat
vorher). Dieselbe Hürde trifft die beiden anderen boogie.at-Posten oben.
Nebenbei gesehen, nicht im Posten: Die Vereinsliste führt am 19.12.2026
eine „Weihnachtsfeier" — ob die öffentlich ist, sagt sie nicht.
Zeitzone: alle `+01:00`, außer 01.05.2027 `+02:00`.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

## Vor dem Go-Live

**Datenschutzerklärung: zwei offene Prüfpunkte.** Impressum und Aufsicht
sind seit dem 2026-09-27 vollständig (`src/lib/rechtliches.ts`). Offen sind
noch zwei Punkte (`PRUEFEN`):
- **Log-Speicherdauer:** Wie lange speichert Netlify die Server-Logs? Die
  Datenschutzerklärung von Netlify nennt keine Frist, also beim Support
  nachfragen.
- **Akismet:** Welche Daten gehen zur Spamprüfung an Akismet? Die Doku sagt
  es nicht, ebenfalls beim Support nachfragen.

Solange ein Punkt offen ist, bricht der Build mit `PUBLIC_INDEXIERBAR=true`
ab. Vor dem Go-Live gehört ein fachkundiger Blick auf beide Texte. Sie sind
ein Entwurf, keine Rechtsberatung.

**Analytics ohne Einwilligungsbanner.** Netlify Analytics (serverseitig,
keine Cookies) oder Plausible. Ein Cookie-Banner auf einem Register kostet
Nutzer und bringt nichts.

**Alte URLs von v101.de: 387 Pfade noch ohne Entscheidung.** Seit dem
2026-09-28 regelt `public/_redirects` die Altlasten des Preisvergleichs
(Liste: `docs/daten/v101-alte-urls.txt`, 1434 Pfade). 7 bekommen 301, weil
die alte Kategorie genau einen freigegebenen Lexikonbegriff meinte
(bleistiftrock, korsett, petticoats, pomade, strapsguertel, taillenmieder,
thema/rockabilly), 1037 bekommen 410 (Kombinationen, Produkte, Suche,
WordPress), 3 sind neu belegt. Offen, also 404: 110 Kategorien, 133
Unterkategorien, 136 Themenseiten, 7 Jahrzehntseiten, `/favicon.ico`.
Die Schätzung „rund 75 Weiterleitungen" setzte Ziele voraus, die es noch
nicht gibt. Zu entscheiden: die Offenen jetzt mit 410 abmelden, oder bei
404 lassen und je Begriff weiterleiten, sobald sein Eintrag freigegeben
ist (etwa `thema/pin-up`, `thema/burlesque`, `thema/pencil` →
`lexikon/bleistiftrock`?). `npm run check:weiterleitungen` zählt nach
jedem Build mit.

**Startschwelle prüfen.** Vor `PUBLIC_INDEXIERBAR=true`: 80+
Veranstaltungen mit Mehrzahl in der Zukunft, 5 Regionsseiten mit echter
Einordnung, 80 Lexikonbegriffe, zwei Säulen der Themenkarte vollständig.

## Später, mit Bedingung

**Oberösterreich-Texte nachziehen — sobald die BWC-Gmunden-Einträge freigegeben sind.**
Drei freigegebene Texte sagen „bisher": `locations/zorba-der-grieche-sierning`
(„bisher der einzige Ort des Registers in Oberösterreich"),
`regionen/oberoesterreich` („bisher über einen einzigen Verein") und
`events/steyrtal-boogie-party-sierning-2026-10-17` („der erste Termin").
Mit den fünf Terminen und drei Orten des BWC Gmunden (Lauf 2026-09-28,
Entwurf) stimmen die ersten beiden nicht mehr, sobald die neuen Einträge
sichtbar werden. Vorher angepasst, würden sie auf Entwürfe verweisen.

**Boppin'B-Termine verlinken — sobald sie freigegeben sind.** Die Seiten
`bands/boppin-b` (Abschnitt „Live") und `locations/cafe-central-weinheim`
nennen die Konzerte in Aschaffenburg (26.12.2026) und Weinheim (9.1.2027)
nur als Text bzw. über die Bandseite; `link-auf-entwurf` verbietet den
Link auf die Entwürfe `events/boppin-b-colos-saal-2026-12-26` und
`events/boppin-b-cafe-central-2027-01-09`. Nach der Freigabe dort
verlinken (ENTSCHEIDUNGEN, 2026-09-27).

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
