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

`mensch` **Belegpflicht für `faq` ist nirgends maschinell geprüft.** Fund
vom 2026-10-02 beim Bau der Lexikon-FAQs: `faq` steht in keiner Liste von
`belegpflichtigeFelder` (`_schemas.ts`), und `belegpflicht` prüft nur
diese. Eine FAQ ohne Quelle mit `felder: [faq]` fällt also weder im
Lexikon noch bei Artikeln auf; die Regel „nur Fragen, die eine Quelle
deckt" steht bisher nur in Prosa (Regel 3). Zu entscheiden: `faq` in die
Liste für lexikon und artikel aufnehmen (Schemaänderung, gesperrt) — mit
Negativtest — oder bewusst lassen, weil eine Antwort mehrere Quellen
mischt und die Prüfung nur das Vorhandensein irgendeiner `faq`-Quelle
sähe.

`mensch` **„Boogie Woogie" in Terminen: Klavierstil oder Tanz?** Gefunden
am 2026-10-02 beim Entwurf der Eventseite; derselbe Fall wie beim
Rock'n'Roll & Boogie Woogie Weekend (am 2026-10-01 auf `genres:
[rocknroll]` korrigiert). `lexikon/boogie-woogie` ist der Klavierstil, der
Tanz ist `lexikon/boogie-woogie-tanz`. **`genres` mit `boogie-woogie`:**
`events/rockabilly-convention-2027` (Quelle: „Rockabilly Convention meets
Rock'n'Roll & Boogie Woogie" — hier kann wirklich die Musik gemeint sein),
`events/boogie-mix-haslinger-hof-2026-11-13` und `…-2026-12-11` (Flyer
nennt „Boogie Woogie, Rock'n'Roll, Rockabilly, Swing" für einen
Tanzabend). **Fließtext-Links auf den Klavierstil:** dieselben drei plus
`…-2027-01-08`, `herbstparty-rock-dock-teddys-perchtoldsdorf-2026-11-20`
(„laufen Boogie Woogie, Swing und Standard-Latein" — klingt nach Tänzen)
und `rock-this-christmas-perchtoldsdorf-2026-12-18` („Titel für Boogie
Woogie, Rock'n'Roll und Swing" — Musik zum Tanzen). Richtig verlinkt ist
`boogie-party-sonntagnachmittag-2026-09-20`, das den Unterschied eigens
erklärt. Zu entscheiden: (1) eine Regel — nennt ein Tanzabend „Boogie
Woogie", ist der Tanz gemeint, außer die Quelle spricht von Musik oder
Klavier?; (2) ob der Tanz in `genres` stehen darf (bisher steht dort nie
ein Tanzeintrag) oder `genres` dann ohne Boogie bleibt; (3) die
Convention einzeln, gegen die Quelle. Danach baut ein Lauf die Stellen um
und prüft jede gegen ihre Quelle.

`frei` **Lexikon: Vintage.** Der größte Fragenblock der PAA-Recherche vom
2026-10-01 ohne eigenen Eintrag: 32 Fragen, darunter „Ab welchem Alter gilt
Kleidung als Vintage?" (14 Treffer), „Wie erkennt man Vintage-Kleidung?"
(13), „Was heißt Vintage auf Deutsch übersetzt?" (12), „Was ist der
Unterschied zwischen Retro und Vintage?" (10)
(`docs/daten/paa-rockabilly-2026-10-01/fragen.csv`). Der Begriff kommt in
23 Texten des Registers vor (48 Stellen). Quellen öffnen (Duden,
DWDS, Wikipedia de/en, ein Nachschlagewerk zur Mode). Die Altersgrenze
(„20 Jahre", „vor 1980" …) schwankt vermutlich zwischen den Quellen: Die
Widersprüche gehören in den Text (Regel 5), es wird keine Zahl ausgewählt.
`abgrenzung` gegen Retro (neu im alten Stil), Secondhand (gebraucht,
gleich welchen Alters), Antiquität, Vintage beim Wein (Jahrgang) und
Shabby Chic. Duplikatprüfung: Bisher hat kein Eintrag „Vintage" als Name
oder Alias. Danach `npm run autolink` — Vorsicht, „Vintage" kommt sehr
oft vor; die Drift-Prüfung zeigt, ob das tragbar ist.

`frei` **Bad Blumau, Swinging Wellness Tanzwochenende: 1 Termin anlegen (06.–08.11.2026).**
Gesehen am 2026-10-01 auf https://boogie.at/?page=1 (Herkunft: Suchlauf
2026-10-01). Dort steht (/event/swinging-wellness-tanzwochenende-10-jaehriges-jubilaeum):
Fr. 06.11., Sa. 07.11., So. 08.11.2026, je 09:00, Rogner Bad Blumau, Bad
Blumau 100, 8283 Bad Blumau; „10 Jahre"; Boogie Woogie, Lindy Hop, West
Coast Swing, Balboa; 18 Tanzeinheiten; Freitag Dinner & Dance Party mit
Robert Shumy, Samstag Party mit Live-Musik von The Ridin Dudes; Anmeldung
über https://www.erleebnisse.at/Meine-Events-Termine/Swinging-Wellness/index.php/.
Beim Bauen: die Veranstalterseite öffnen (Preis, Ablauf, Veranstalter);
Early-Bird-Angaben auf boogie.at beziehen sich auf eine Frist im März 2026.
Typ Workshop-Wochenende. Region Steiermark gibt es noch nicht (nach Muster
anlegen, `entwurf`). Zeitzone `+01:00`.

`frei` **Stadtgalerie Mödling: Boogieball am 13.11.2026 anlegen (Folgetermin der Rock'n' Boogie Tanzparty).**
Gesehen am 2026-10-01 auf https://www.stadtgaleriekultur.info/events/kalender/
(Herkunft: Suchlauf 2026-10-01). Dort steht: „Boogieball '26",
„Tanzabend", „Freitag, 13. November 2026", „20:00 Uhr". boogie.at
(/event/boogieball-0) nennt dazu: Stadtgalerie Mödling, live Junior and
the Mad Cats („vormals The Juke Joint Royals"), Hannes Otahal, DJ Sascha;
Tickets über Kartenbüro und Ticketshop. Beim Bauen: Vorlage
`events/rockn-boogie-tanzparty-moedling-2026-10-16`; dessen
Redaktionsnotiz sagt, `reihe` gehöre gesetzt, sobald eine zweite Ausgabe
angelegt wird — das ist sie. Preis und Dresscode laut Vorlage eigens
angekündigt, auf der Detailseite des Hauses prüfen. „Parkett" auf
boogie.at ist eine Redewendung (Falle). Zeitzone `+01:00`.

`frei` **Tanzschule Hippmann, Wels und Regau: 4 Termine anlegen (14.11.2026, 05.12.2026, 16.01.2027, 13.03.2027).**
Gesehen am 2026-10-01 auf https://boogie.at/ (Seiten 1 bis 3) (Herkunft:
Suchlauf 2026-10-01). Dort steht: „BIG BOOGIE & SWING PARTY + FOX", Sa.,
14.11.2026, Tanzschule Hippmann, Pollheimerstraße 7, 4600 Wels, „Einlass
ab 19.30 Uhr - Musikbeginn 20.15 Uhr", Boogie-, Lindy-Hop- und
Swing-Floor live mit The 6 Fireballs (Tschechien) und DJ Rockin' Daddy,
Discofox-Floor, Tickets über https://www.tanzschule.at/newsbeitrag/boogiefox2026/
(/event/big-boogie-swing-party-fox); „Chrismas Big Boogie und Discofox
Party", Sa., 05.12.2026, 20:00, Hippmann Starmovie Regau, Betriebsstrasse
15, 4844 Regau, „2 Dj's 2 Floors" (/event/chrismas-big-boogie-und-discofox-party);
„BOOGIE & SWINGBALL 2027", Sa., 16.01.2027, 20:00, Tanzschule Hippmann
Wels, live Ray Collins Hot Club, DJ Rockin' Daddy, „Tickets: ab 35 €"
(/event/boogie-swingball-2027); „Big Boogie und Discofox Party", Sa.,
13.03.2027, 20:00, Regau, DJ.K. am Boogie-Floor (/event/big-boogie-und-discofox-party-2).
Beim Bauen: die Seiten der Tanzschule (tanzschule.at) öffnen — ob Regau
derselbe Veranstalter ist, sagt boogie.at nicht ausdrücklich. Zwei
Spielorte neu. Region `oberoesterreich`. Zeitzone überall `+01:00`.

`frei` **Kammgarnsaal Traiskirchen: Boogie-Party am 21.11.2026 anlegen (Folgetermin der Reihe).**
Gesehen am 2026-10-01 auf https://boogie.at/event/boogie-cats-union-tanzsport-verein-moellersdorf
(Herkunft: Suchlauf 2026-10-01). Dort steht in der Datumszeile „Sa.,
21.11.2026 - 17:00" als letzter von sechs Terminen, Kammgarnsaal,
Wolfstraße 18d, 2514 Traiskirchen; der Beschreibungstext nennt derzeit
nur die Halloween-Ausgabe („Beginn 17.00, Einlass 16.30"). Beim Bauen:
Vorlage `events/boogie-party-sonntagnachmittag-2026-10-31` (Reihe
`boogie-party-sonntagnachmittag`). Preise und DJs der Vorlage nicht
übernehmen, wenn die Seite sie für diesen Termin nicht nennt. Der 21.11.
ist wieder ein Samstag. Zeitzone `+01:00`.


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
vorher). Dieselbe Hürde trifft die beiden anderen boogie.at-Posten oben. Am 2026-10-01 war
boogie.at wieder erreichbar, alle fünf Seiten der Liste (Suchlauf).
Nebenbei gesehen, nicht im Posten: Die Vereinsliste führt am 19.12.2026
eine „Weihnachtsfeier" — ob die öffentlich ist, sagt sie nicht.
Zeitzone: alle `+01:00`, außer 01.05.2027 `+02:00`.

`mensch` **Creepers und Pomade: zwei ungeprüfte Teddy-Boy-Angaben aus der
deutschen Wikipedia.** Gefunden am 2026-10-02 beim Entwurf
`lexikon/teddy-boy`. Die veröffentlichten Einträge `lexikon/creepers`
(Abschnitt „Creepers in der Szene") und `lexikon/pomade` (Abschnitt
„Pomade in der Szene") übernehmen aus der deutschen Wikipedia, dass die
Teds der 1950er „die Elvis-Tolle" trugen, `creepers` außerdem, dass das
Revival Mitte der 1970er Jahre „unter anderem die Stray Cats" trugen.
Beides widerspricht den Quellen, die `lexikon/teddy-boy` geöffnet hat:
Die ersten Teds gab es vor Elvis und vor dem Rock 'n' Roll (englische
Wikipedia „Teddy Boys", Vintage Rock 2021), die Stray Cats wurden 1979
gegründet (englische Wikipedia), und Teds rissen ihre Aufnäher ab, weil
die Band als Punk galt (Vintage Rock 2022). Zu entscheiden: die beiden
Stellen nach Regel 5 umschreiben (Angabe der Wikipedia benennen, das
Gesicherte daneben) — Änderung an Freigegebenem, also über die normale
Freigabe — oder bis zur Freigabe von `teddy-boy` warten und dann in
einem Zug.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

`mensch` **Gegenleser ist für Artikel blind.** Gefunden am 2026-10-02 beim
ersten Artikel seit Einführung des Gegenlesers (`artikel/petticoat-tragen`,
PR #122): `belegpflichtigeFelder.artikel` ist leer, also erzeugt
`gegenlesen --auftrag` 0 Prüfpunkte, und der Abschnitt meldet „0
Abweichungen", obwohl nichts gelesen wurde. Lexikon trifft es fast genauso
(nur Ära und Herkunftsland). Zu entscheiden: (a) so lassen und den Abschnitt
bei 0 Prüfpunkten „nicht anwendbar" statt „0 Abweichungen" melden lassen —
klein, ehrlich, prüft aber weiter nichts; (b) `kurzbeschreibung` und `faq`
für Artikel belegpflichtig machen — Schemaänderung, der Gegenleser prüft
dann die Kernaussagen, Belegpflicht-Warnungen an bestehenden Artikeln
möglich; (c) den Gegenleser `body:`-Abschnitte prüfen lassen — deckt den
Fließtext ab, ist aber das größte Stück Arbeit. Empfehlung: (a) sofort,
(b) danach.

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

**Analytics ohne Einwilligungsbanner — Empfehlung: Netlify Web
Analytics, zum Go-Live einschalten.** Verglichen am 2026-09-29 mit
Primärquellen (Preisseiten, Doku, DSK-Orientierungshilfe Digitale Dienste,
EDSA-Leitlinien 2/2023):
- *Netlify Web Analytics:* aus den Server-Logs, kein Code im Browser, kein
  Cookie — § 25 TDDDG ist nicht berührt, kein neuer Empfänger. Misst
  Aufrufe, Besucher, Top-Seiten, Referrer und die häufigsten 404 (nützlich
  für die alten Pfade von v101.de). Füllt 30 Tage rückwirkend, zeigt
  höchstens 30 Tage. Kosten je nach Kontoart: Legacy-Plan $9 je Site und
  Monat; auf den Credit-Plänen zeigt Free nur einen Tag, Pro ab $20.
- *Plausible:* 9 im Monat, Server in Deutschland, drei Jahre Rückblick —
  aber ein Skript im Browser. Nach EDSA 2/2023 fällt das unter die
  Endgeräte-Regel, und die DSK sieht bloße Reichweitenmessung nicht per se
  als ausgenommen. Ohne Banner vertretbar, aber angreifbar; über einen
  Netlify-Proxy ungeprüft, ob die IP-Adresse durchgereicht wird.
- *Pirsch* ($6, Hetzner): dieselbe Skript-Frage, ohne Skript nur über eine
  Edge Function, die die Seite bisher nicht hat.
Zu klären, bevor es losgeht: Ist das Netlify-Konto ein Legacy- oder ein
Credit-Plan (davon hängen $9 oder $20 ab; ein Wechsel ist nicht
umkehrbar)? Reichen 30 Tage Rückblick? Die Datenschutzerklärung sagt
heute „misst keine Reichweite" — der Satz fällt dann weg, ein Absatz zur
Auswertung der Server-Logs kommt dazu, `DATENSCHUTZ_STAND` neu.

**Startschwelle prüfen.** Vor `PUBLIC_INDEXIERBAR=true`: 80+
Veranstaltungen mit Mehrzahl in der Zukunft, 5 Regionsseiten mit echter
Einordnung, 80 Lexikonbegriffe, zwei Säulen der Themenkarte vollständig.

## Später, mit Bedingung

**Lexikon-Vorrat — der Suchlauf zieht von oben nach, sobald weniger als
zwei Lexikon-Posten frei sind.** Recherchiert am 2026-09-29
(Startschwelle: 80 Begriffe; Stand 23). Seit Weg A (2026-09-29) zieht der
Suchlauf Bündel von oben nach unten nach, bis drei Lexikon-Posten frei
sind, innerhalb der Obergrenze von zwölf (`npm run warteschlange:platz`,
Ablauf in `docs/ablaeufe/termin-recherche.md`, Schritt 1a). Ein
nachgezogenes Bündel wird hier gestrichen. Ist der Vorrat leer, wählt der
Mensch die nächsten Begriffe aus.
Je Bündel gleiche Kategorie, Abgrenzung in Klammern:
Reihenfolge am 2026-10-01 nach der PAA-Recherche umgestellt: Frisuren und
Rock- und Kleidformen nach oben. „Was heißt Pompadour?" und „Wie sieht ein
Pompadour aus?" kamen auf zusammen 12 Treffer, „Welcher Rock gehört zur
Rockabilly-Szene?" auf 23 — die meistgestellte Frage zum Look
(`docs/daten/paa-rockabilly-2026-10-01/`). Das Frisuren-Bündel ist seit
dem 2026-10-02 als Entwurf angelegt (`lexikon/pompadour`,
`lexikon/ducktail`, `lexikon/flat-top`) und hier gestrichen.
- *Rock- und Kleidformen:* Tellerrock (Glockenrock, Petticoat), Etuikleid
  (Bleistiftrock, Wiggle Dress), Neckholder (Racerback). Alte Pfade vorhanden.
- *Genres:* Rhythm and Blues (heutiges R&B), Hillbilly (Country,
  Schimpfwort, Bluegrass). Swing ist seit dem 2026-09-29 ein Entwurf
  (`lexikon/swing`).
- *Schuhe:* Saddle Shoes (Two-Tone, Budapester), Peep Toe (Slingback),
  Stiletto (Kitten Heel, das Messer), Keilabsatz (Plateausohle). Alte
  Pfade: `/thema/peep-toe`, `/thema/stiletto`, `/thema/keilabsatz`, eine
  Unterkategorie `…/saddle-shoes`.
- *Wäsche:* Corsage (Korsett, Bustier, die Ansteckblume), Hüfthalter
  (vorher gegen die Aliases von `strapsguertel` prüfen), Nahtstrümpfe.
- *Instrument und Klang:* Slap-Bass (Slap am E-Bass; gegen `kontrabass`
  abgrenzen, seit dem 2026-09-29 ein Entwurf), Slapback-Echo (Hall, Tape
  Delay).
- *Autos:* Pinstriping (Nadelstreifen am Stoff), Lowrider, Lead Sled.
- *Szene:* Halbstarke (Teddy Boys, Rocker, der Film von 1956) — an
  `lexikon/teddy-boy` anschließen (Entwurf seit dem 2026-10-02).
Bewusst nicht: Personen (`/thema/elvis`), Marken (`lindy-bop`),
`/thema/country` (meinte Landhausmode). Ob `/jahrzehnt/50s` einen
Epochen-Eintrag „Fifties" bekommt, ist eine Ermessensfrage (der Autolink
würde „50er" sehr oft verlinken).

**Portal-Gestaltung „Plattenhülle" umsetzen — in der Sitzung mit Markus,
nicht im Tageslauf.** Vorfragen entschieden am 2026-10-02
(`DESIGN-BRIEF.md`, „Entschieden am 2026-10-02"). Gebaut sind Etappe 1
(Farben, Dunkelmodus, Schriften, H1 als Plakatzeile) und Etappe 2
(Seitenkopf mit Logo, Ressortleiste, „Termin melden", Suche mit Pagefind).
Etappe 3 (Entitätsseiten über CSS) und Etappe 4 (Startseite) sind gebaut.
Katalognummer und Kategoriewerte sind nachgebaut. Das Line-up als
Zeitplan ist gebaut (Feld `programm`, ENTSCHEIDUNGEN.md vom 2026-10-02),
das erste Programm trägt das Rock'n'Roll & Boogie Woogie Weekend. Offen auf der Startseite: das Monogramm im Block „Jede Angabe
belegt" (wartet auf das Original-Logo). **Für Markus:** Die Antwortkapsel
der Startseite kommt aus `site.kurzbeschreibung` und sagt noch „das
Register der Vintage- und Rockabilly-Szene" — `site.config.ts` ist für
Agenten gesperrt; ob dort „Portal" stehen soll, entscheidest du.

**Pillar „Der Rockabilly-Look" (Säule `mode`) — als Erstes nach oben
holen, sobald die Obergrenze Platz hat.** Entscheidung Markus, 2026-10-01:
Vorschlag A6 der PAA-Recherche wird der Pillar der Säule `mode`
(`typ: pillar`, Vorlage `src/content/artikel/_golden-example.md` und der
Pillar `artikel/hot-rod-und-kustom-kulture`). Er beantwortet die
meistgestellte Frage zum Look, „Welcher Rock gehört zur Rockabilly-Szene?"
(23 Treffer), dazu „Was sollte man im Rockabilly-Stil anziehen?" (5),
Rockabilly-Look/-Style (3+3), Dresscode Polka Dots (6), Dresscode Vintage
(6), „Wie zieht man sich Vintage an?" (11)
(`docs/daten/paa-rockabilly-2026-10-01/fragen.csv`). Spokes, die schon
stehen oder geplant sind und per `gehoertZu` darunter gehören:
`artikel/petticoat-reifrock-unterrock` (deren Redaktionsnotiz wartet
darauf), A3 „Petticoat tragen". Verlinkt die Lexikoneinträge der Säule
(Petticoat, Bleistiftrock, Polka Dots, Gingham, Creepers, Pin-up,
Taillenmieder …). Hilfreich, aber keine Bedingung: Tellerrock aus dem
Lexikon-Vorrat und `lexikon/pompadour` (Entwurf seit dem 2026-10-02). Wartet nur, weil am 2026-10-01 zwölf
von zwölf Posten `frei` sind. Ein Pillar beschreibt, er schreibt nichts
vor: Was „dazugehört", wird über Quellen zur Szene belegt, nicht gesetzt.

**Artikel-Vorrat aus der PAA-Recherche — Auswahl Markus.** Noch nicht
gewählt, nicht abgelehnt (Einzelheiten in
`docs/daten/paa-rockabilly-2026-10-01/README.md`): A2 „Vintage-Kleidung
erkennen" (howto, `sammeln`, nach `lexikon/vintage`), A4 „Rockabilly oder
Rock'n'Roll?" (vergleich, `musik`), A5 „Bekannte Rockabilly-Songs" (liste,
`musik`, keine Songtexte), A7 „Rockabilly-Frisuren" (liste, `frisur`,
nach Pompadour; Pompadour, Ducktail und Flat Top stehen seit dem
2026-10-02 als Entwurf). Ein Lauf baut davon nichts, solange Markus keinen auf
`frei` setzt.

**Artikel A1 „Vintage, Retro oder Secondhand?" — sobald
`lexikon/vintage` als Entwurf steht.** Gewählt von Markus am 2026-10-01
(PAA-Recherche, `docs/daten/paa-rockabilly-2026-10-01/README.md`).
`typ: vergleich`, Säule `sammeln`, `hauptentitaet: lexikon/vintage`.
Beantwortet „Was ist der Unterschied zwischen Retro und Vintage?" (10
Treffer), „Ab welchem Alter gilt Kleidung als Vintage?" (14), „Wann darf
man Vintage sagen?" (8), Vintage und Secondhand (4+1), Vinted. Wartet,
weil der Vergleich auf der Abgrenzung des Lexikoneintrags aufbaut und
nicht vorher eine eigene Altersgrenze setzen darf. Dann als `frei`-Posten
nach oben holen, wenn die Obergrenze Platz hat.

**Gegenleser auswerten — ab dem 2026-10-14.** Seit dem 2026-09-30 liest
ein Subagent jeden Inhalts-PR des Tageslaufs blind gegen die Quellen
(`scripts/gegenlesen.ts`, `docs/ablaeufe/gegenlesen.md`). Nach zwei
Wochen zählen: gemeldete Abweichungen, davon echt und Fehlalarm (Markus'
Urteil am PR), Sichtprüfungen, nicht prüfbare Punkte und warum, Kosten je
Lauf. Danach entscheiden: Bleibt er, werden Sichtprüfungen zu Vergleichen
(Adressen, Bands, Lexikon-Jahre), oder fällt er weg.

**Swing von Hand verlinken — sobald `lexikon/swing` freigegeben ist.** Der
Autolink setzt „Swing" nie selbst (`NUR_VON_HAND` in `src/lib/links.ts`,
Entscheidung Markus 2026-09-29). Gemessen am selben Tag meinen diese
Stellen die Musik und bekommen einen Handlink auf `/lexikon/swing/`:
`lexikon/jump-blues` („Saxofonspiels der Swing-Ära"), `lexikon/lindy-hop`
(„Musik der Swing-Big-Bands"), `adressen/rockin-barber-koepenick` („in der
Swing- und Rock'n'Roll-Band"), `events/boogie-party-sonntagnachmittag-2026-09-20`
(„Jump Blues und Swing" als getanzte Musik) und `lexikon/kontrabass`
(„traditionellen Jazz und Swing"). Nicht verlinken: Bella Italia, die
Herbstparty, Rock this Christmas und „Familie der Swing-Tänze" im
Boogie-Woogie-Eintrag — dort ist der Tanz oder ein Name gemeint. Vorher
mit `grep -rn "Swing" src/content` auf neue Stellen prüfen.

**Idee: Themen und Regionen abonnieren (Markus, 2026-09-29).** Leser
abonnieren eine Region, einen Begriff oder eine Sammlung und bekommen eine
Mail bei neuen Terminen, neuen Läden oder geänderten Einträgen. Was es
schon gibt: je Region ein Kalenderabo (`/kalender/<region>.ics`) und
`/rss.xml`. Naheliegender Weg: Feeds je Region und Sammlung erzeugen und
einen RSS-zu-Mail-Dienst daran hängen, statt selbst Mails zu verschicken.
Offen: Dienst und Kosten, Double-Opt-in und Datenschutzerklärung (eine
Mailadresse ist das erste personenbezogene Datum, das die Seite dauerhaft
hält), wie „geändert" definiert ist (Freigabe? `geprueftAm`?), Taktung
(sofort oder wöchentlich gebündelt). Voraussetzung: Go-Live und genug
Termine je Region, dass sich ein Abo lohnt.

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
entscheidet sich, ob Bündelgröße oder Laufzahl nachjustiert wird. Seit dem
2026-09-29 gelten Weg B (Termine morgens und mittags, Lexikon nachmittags),
Weg A (drei Läufe am Tag, Suchlauf dreimal die Woche, Obergrenze 12,
Lexikon-Nachschub aus dem Vorrat) und die abendliche Freigabe-Erinnerung.
Deshalb zusätzlich zählen: Lexikon-Einträge pro Woche, die Liegezeit vom
Entwurf bis zur Freigabe und wie viele Inhalts-PRs gleichzeitig auf Markus
warten. Staut es sich dort, ist der dritte Lauf der erste, der wieder
wegfällt.

**Suchlauf auswerten — ab dem 2026-10-21.** Seit dem 2026-09-23 füllt ein
Suchlauf die Warteschlange auf, seit dem 2026-09-29 dreimal die Woche und
auf höchstens zwölf `frei`-Posten (`docs/ablaeufe/termin-recherche.md`).
Nach vier Wochen zählen: Wie
viele Posten tragen „Herkunft: Suchlauf", wie viele wurden zu einem
Eintrag, wie viele kamen zurück und warum. Führt weniger als die Hälfte zu
einem Eintrag, wird der Suchlauf abgestellt oder umgebaut (Routine
„v101 — Suchlauf"), Begründung nach ENTSCHEIDUNGEN.md.

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
