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

`frei` **Niederösterreich, boogie.at: 4 Termine anlegen (05.05.2027, 29.05.2027, 21.08.2027, 20.11.2027).**
Gesehen am 2026-10-06 auf https://boogie.at/?page=3 (Herkunft: Suchlauf
2026-10-06). Dort steht: „Boogie Party", Mi., 05.05.2027, 20:00,
Mostlandhof, Schauboden 4, 3251 Purgstall, „Music by DJ.K Boogie
Klaus", „Folder und nähere Informationen folgen", Organisation „DJ. K."
(/event/boogie-party-51); „Tanzschuh-Party", Sa., 29.05.2027, 19:30,
Aufriss Mainburg – das Eventlokal im Pielachtal, Mainburgstrasse 8, 3202
Hofstetten, DJ, 50er-Jahre-Kleidung, „Rock'n'Roll, Boogie & Swing"
(/event/tanzschuh-party-10); „Tanzschuh-Party" („Summer
Tanzschuhparty an der Pielach"), Sa., 21.08.2027, 20:00, gleicher Ort,
„Boogie, Rock'n'Roll & jede Menge Tanz" (/event/tanzschuh-party-11);
„Tanzschuh-Party", Sa., 20.11.2027, 19:30, gleicher Ort, letzte
Tanzschuhparty des Jahres, DJ (/event/tanzschuh-party-12). Kein Preis.
Beim Bauen: boogie.at ist nur Kalender; aufriss.net ist nur über http
angegeben (Falle „Seiten nur über http"), für Purgstall eine Seite des
Hauses oder des DJs suchen. Boogie Woogie und Rock'n'Roll meinen an
diesen Abenden den Tanz (Regel 2026-10-03). Die Aufriss-Reihe beginnt
im Register erst mit dem Posten „Niederösterreich, boogie.at" vom
2026-10-04 (21.11. und 12.12.2026, gleicher Ort) — ist der gebaut, ist
er die Vorlage. Purgstall: „nähere Informationen folgen" — fehlt beim
Bauen eine zweite Angabe zu Uhrzeit oder Ort, den Termin mit Befund
zurückgeben.

`frei` **Lexikon, Bündel Genres: Rhythm and Blues, Hillbilly.**
Aus dem Lexikon-Vorrat nach oben gezogen (Herkunft: Lexikon-Vorrat
2026-10-04). Abgrenzungen laut Vorrat: Rhythm and Blues (gegen das
heutige R&B), Hillbilly (gegen Country, gegen den Gebrauch als
Schimpfwort, gegen Bluegrass). Swing ist seit dem 2026-09-29 ein Entwurf
(`lexikon/swing`) und gehört nicht in dieses Bündel.

`frei` **Lexikon, Bündel Schuhe: Saddle Shoes, Peep Toe, Stiletto, Keilabsatz.**
Aus dem Lexikon-Vorrat nach oben gezogen (Herkunft: Lexikon-Vorrat
2026-10-04). Abgrenzungen laut Vorrat: Saddle Shoes (gegen Two-Tone und
Budapester), Peep Toe (gegen Slingback), Stiletto (gegen Kitten Heel und
gegen das Messer), Keilabsatz (gegen Plateausohle). Alte Pfade:
`/thema/peep-toe`, `/thema/stiletto`, `/thema/keilabsatz`, eine
Unterkategorie `…/saddle-shoes`. Beim Bauen gegen `lexikon/creepers`
abgrenzen, falls sich Überschneidungen zeigen.

`frei` **Niederösterreich, boogie.at: 4 Termine anlegen (21.11.2026, 12.12.2026, 19.12.2026, 31.12.2026).**
Gesehen am 2026-10-04 auf https://boogie.at/?page=1 und ?page=2
(Herkunft: Suchlauf 2026-10-04). Dort steht: „Tanzschuh-Party", Sa.,
21.11.2026, 19:30, Aufriss Mainburg – das Eventlokal im Pielachtal,
Mainburgstrasse 8, 3202 Hofstetten, Link http://aufriss.net,
Beschreibung nennt die letzte Tanzschuhparty 2026 in einem Lokal, „wo
Boogie-Woogie mitlerweile schon zuhause ist" (/event/tanzschuh-party-9);
„Boogieparty", Sa., 12.12.2026, 20:00, gleicher Ort, ohne Beschreibung
(/event/boogieparty-20); „JUKEBOX CHRISTMAS PARTY-NIGHT 2026", Sa.,
19.12.2026, 19:30, Gemeindesaal Matzendorf-Hölles, Badenerstraße 19, 2751
Matzendorf-Hölles, Party „im Stil der 50er & 60er Jahre" mit den Jukebox
Bandits, Rock'n'Roll und Boogie Woogie, DJ Matthias & DomyLee, Link auf
die Veranstaltungsseite der Gemeinde (/event/jukebox-christmas-party-night-2026);
„Silvester Boogie Night 2026", Do., 31.12.2026, 19:00, Volkshaus,
Loosdorfer Straße 15, 3243 St. Leonhard, Organisation „FIVES ★ Boogie,
Swing & Rock'n'Roll Tanzsport", Tickets https://fives.at/event/silvester-boogie-night-2026
(/event/silvester-boogie-night-2026). Beim Bauen: boogie.at ist nur
Kalender; je Termin die Seite des Veranstalters bzw. Hauses öffnen
(aufriss.net — nur http angegeben, Falle „Seiten nur über http";
Gemeindeseite Matzendorf-Hölles; fives.at), Flyer öffnen, wenn einer
beiliegt. Boogie Woogie meint an diesen Abenden den Tanz (Regel
2026-10-03); bei der Jukebox-Party spielt eine Band, dort prüfen, ob die
Quelle die Musik meint. Alle drei Orte sind neu. Die Aufriss-Reihe hat
weitere Tanzschuh-Partys 2027 (29.05., 21.08., 20.11.) — Kandidaten für
einen späteren Posten.

`frei` **Boppin'B, Tour: 6 Termine anlegen (31.10.2026, 04.11.2026, 13.11.2026, 21.11.2026, 04.12.2026, 11.12.2026).**
Gesehen am 2026-10-04 über das Bandsintown-Widget der Live-Seite
https://www.boppinb.de/live, Datensatz
https://rest.bandsintown.com/artists/id_310419/events?app_id=js_www.boppinb.de
(Herkunft: Suchlauf 2026-10-04). Dort steht: 31.10.2026, 20:30, Irish
House, Kaiserslautern; 04.11.2026, 20:00, Harmonie, Bonn; 13.11.2026,
20:30, Musiktheater Piano, Dortmund; 21.11.2026, 20:00, Doubles
Starclub, Donauwörth; 04.12.2026, 20:00, Alte Piesel, Künzell;
11.12.2026, 20:00, Eventlokal Hüttenwerk, Michelstadt. Folgetermine
einer Band mit eigener Seite (`bands/boppin-b`, `lineupBands`); Vorlage
z. B. `events/boppin-b-colos-saal-2026-12-26`. Beim Bauen: je Termin die
Seite des Hauses bzw. das Ticketportal öffnen — die Uhrzeit aus
Bandsintown allein trägt nicht (Falle „Bandsintown-Widget"), Adressen
nur aus einer Quelle, die sie nennt. Alle sechs Orte sind neu; Regionen
Rheinland-Pfalz, Nordrhein-Westfalen und Hessen gibt es noch nicht
(Donauwörth: `bayern`). Weitere Termine im selben Datensatz (28.12.
Hamburg, 31.12. Dreieich, 2027 Düsseldorf, Wiesbaden, Kaiserslautern,
Erfurt, Lübeck, Köln, Münster, Idstein) sind Kandidaten für einen
späteren Posten.

`frei` **Pullman City: 1 Termin anlegen (27.12.2026, Rockabilly Night).**
Gesehen am 2026-10-04 auf https://www.pullmancity.de/events-shows-musik/events
und der Detailseite https://www.pullmancity.de/events-shows-musik/events/rockabilly-night
(Herkunft: Suchlauf 2026-10-04). Dort steht: „Rockabilly Night",
„Boogie Woogie meets Wild West", 27. Dezember 2026, Abend mit dem
„Lebensgefühl der 50er Jahre", Tanzfläche für Rock'n'Roll- und
Boogie-Woogie-Fans; Programm des Tages: 17:00 DJ Rockin' Daddy (Music
Hall), 20:30 The Ridin' Dudes (AT) (Music Hall), 21:00 DJane Angy Blue
(Pina Colada Bar); Tageskarte Erwachsene 13,00 €, Kind 4–14 Jahre
5,00 €. Beim Bauen: Die Preise sind die allgemeinen Tageskarten der
Westernstadt, kein Konzertpreis — Hinweis „Jahreskarte … ausgenommen
Konzerte/Sonderevents" beachten; die Tagesansicht nennt sonst
Weihnachtsprogramm (Special Christmas Week), nur der Abend in der Music
Hall gehört in den Eintrag. Ort und Veranstalter im Register (Vorlage
`events/rockabilly-convention-2027`). `programm` nur mit den
Uhrzeiten der Quelle. Zeitzone `+01:00`.

`frei` **Café Central Weinheim: 1 Termin anlegen (29.01.2027, The Flames).**
Gesehen am 2026-10-04 auf https://cafecentral.de/ (Herkunft: Suchlauf
2026-10-04). Dort steht: „Fr 29.01. | rockabilly | the flames | Café
Central Weinheim | Einlass: 19.00 Uhr | Beginn: 20.00 Uhr" — **ohne
Jahreszahl** und ohne eigene `/konzert/`-Seite. Das Jahr steht beim
Ticketanbieter des Hauses: https://loveyourartist.com/de/profiles/cafe-central-tocopilla-events-QVVS7L/events
führt „The Flames am 29. Jan. 2027 in Weinheim"
(/events/the-flames-weinheim-EDRZCH3); der Wochentag passt zu 2027. Beim
Bauen: Ticketseite öffnen und gegen das Haus lesen (Falle „Ticketseite
gegen das Haus"); kein Preis auf der Startseite. Welche Band „The
Flames" ist, sagt keine der Seiten — nicht raten, in `lineupWeitere`.
Ort und Region im Register (Vorlage `events/long-tall-texans-cafe-central-2026-11-20`).

`frei` **Tanztermine: `genres` nachtragen (26 Termine).** Entscheidung
Markus vom 2026-10-03 (ENTSCHEIDUNGEN.md, „Tänze in genres"): An
Tanzabenden, Workshops und Weekendern dürfen Tanzeinträge in `genres`
stehen (`boogie-woogie-tanz`, `rocknroll-tanz`, `jive`, `lindy-hop`);
Musik (Kategorie `genre`) wie bisher. Die Regel `genres-kategorie` prüft
das, der Faktenblock zeigt Musik und Tanz getrennt. Nachzutragen bei den
freigegebenen künftigen Tanzterminen ohne `genres`, je Termin gegen seine
Quelle: Hippmann Wels und Regau (`big-boogie-swing-party-hippmann-wels-2026-11-14`,
`boogie-discofox-party-hippmann-regau-2026-12-05`, `…-2027-03-13`,
`boogie-swing-ball-hippmann-wels-2027-01-16`); Boogie Lions Spillern
(`boogie-lions-halloween-spillern-2026-10-31`, `boogie-lions-spillern-2026-11-28`,
`…-2027-01-09`, `…-2027-02-20`, `…-2027-03-06`, `…-2027-05-01`);
Boogie-Party Sonntagnachmittag (`…-2026-10-31`, `…-2026-11-21`); Mödling
(`boogieball-stadtgalerie-moedling-2026-11-13`,
`rockn-boogie-tanzparty-moedling-2026-10-16`); Keferfeld Linz
(`christmas-boogie-swing-night-keferfeld-2026-12-05`,
`november-jive-night-keferfeld-2026-11-06`); Gmundner Boogie Party
(`gmundner-boogie-party-eberstalzell-2027-06-05`, `…-roitham-2026-10-24`,
`…-roitham-2027-04-03`, `…-roitham-2027-10-23`,
`gmundner-silvester-boogie-party-fischlham-2026-12-31`); Rock Dock Teddys
(`herbstparty-rock-dock-teddys-perchtoldsdorf-2026-11-20`,
`rock-this-christmas-perchtoldsdorf-2026-12-18`);
`steyrtal-boogie-party-sierning-2026-10-17`,
`swinging-wellness-bad-blumau-2026-11-06`,
`boogie-mix-haslinger-hof-2027-01-08`. Leseregel aus
`docs/ablaeufe/termin-recherche.md` (Falle „Boogie Woogie an einem
Tanzabend"): Tanz, außer die Quelle spricht von der Musik selbst; dann
der Musikeintrag (beim Haslinger Hof der Fall, wie bei den beiden
Vorgängerterminen). Nur eintragen, was die Quelle nennt; die Quelle
bekommt `genres` in `felder`, die Redaktionsnotiz das Zitat. Ein Tanz
ohne Lexikoneintrag (Discofox, West Coast Swing, Balboa) bleibt im Text.
Bei Bedarf in zwei PRs teilen; geändert wird Freigegebenes, also wartet
jeder PR auf Markus.

`frei` **Vintage: sieben Handlinks setzen.** `lexikon/vintage` ist seit
der Freigabe #143 (2026-10-03) veröffentlicht. „Vintage" wird nur von
Hand verlinkt (`NUR_VON_HAND`, Entscheidung 2026-10-02). Zu verlinken
sind die sieben Stellen, die in der Simulation den Stil meinten
(Vintage-Mode, -Garderobe, -Ästhetik, -Outfit, dreimal Vintage-Markt);
nicht Eigennamen („Vintage Rock", „Peggy Sue Vintage") und nicht die
Formel „Vintage- und Rockabilly-Szene". Die Stellen per `grep -rn
"Vintage-"` in `src/content/` suchen, jede einzeln im Satz prüfen, im PR
auflisten. Offen am Eintrag bleibt „Wie erkennt man Vintage-Kleidung?"
(13 Treffer) — Kandidat für Artikel A2, nicht Teil dieses Postens.

`frei` **Boppin'B, Irish House Kaiserslautern: 1 Termin anlegen (13.03.2027), sobald eine Quelle des Hauses gefunden ist.**
Aus dem Bündel „Boppin'B, Tour (Fortsetzung)" (2026-10-06) zurückgegeben,
die übrigen fünf Termine sind gebaut. Bandsintown
(https://rest.bandsintown.com/artists/id_310419/events?app_id=js_www.boppinb.de)
nennt 2027-03-13T20:30, Irish House, Eselsfürth 11, 67657
Kaiserslautern. BEFUND: Das Haus hat keine erreichbare eigene Seite.
`irishhouse.de` antwortet per https mit TLS-Fehler, per http mit einer
Weiterleitung auf `irishhouse.kunstgriff-event.de` (falsches Zertifikat,
http zeigt nur die Plesk-Standardseite); `kunstgriff-event.de` leitet
auf `pfalzdigital.de/kunstgriff-event/` weiter, wo nichts zum Termin
stand. Ein Eventim-Light-Shop
(https://www.eventim-light.com/de/a/6141d3a4a7dca437d10f1139, Treffer
der Websuche zum Haus) war aus der Cloud nicht abrufbar
(ERR_HTTP2_PROTOCOL_ERROR), ebenso eventim.de und westticket.de. Was
fehlt: eine Quelle des Hauses oder des Ticketverkaufs mit Uhrzeit und
Adresse — Bandsintown allein trägt die Uhrzeit nicht (Falle
„Bandsintown-Widget"). Beim Bauen zuerst den Eventim-Light-Shop öffnen
(sieht nach dem Shop des Hauses aus, Veranstalter dort prüfen), sonst
nach dem Haus suchen. Dasselbe Problem hat der Termin am 31.10.2026 im
Posten „Boppin'B, Tour: 6 Termine" weiter oben. Die Region
Rheinland-Pfalz gibt es noch nicht. Weitere Termine im Datensatz (2027:
Erfurt 20.03., Lübeck 09.04., Köln 17.04., Münster 30.04., Idstein
05.11.) sind Kandidaten für einen späteren Suchlauf.

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

**Berlin, Quasimodo: Nikki Hill am 11.05.2027 anlegen, sobald das Haus den Abend führt.**
Aus dem Bündel „Berlin, Rockin' Wildcat" (2026-10-05) zurückgegeben, die
übrigen drei Termine sind gebaut. Datum und Ort sind belegt: Rockin'
Wildcat (`/rwc/events/nikki-hill-3`) nennt Di., 11. Mai 2027, Quasimodo,
Kantstr. 12a, 10623 Berlin-Charlottenburg; die Tourseite der Musikerin
(https://nikkihillrocks.com/tour, Bandsintown) nennt „Tuesday, May 11,
2027 @ 10:00PM, Quasimodo, Berlin". **Die Uhrzeit nicht:** Rockin'
Wildcat sichtbar 21:00, die Tourseite 22:00. Das Quasimodo selbst führt
den Abend noch nicht (Programm am 2026-10-05 bis Januar 2027, kein Treffer
für „nikki"); seine Konzerte nennen sonst „Einlass 21:00, Beginn 22:00"
(Otis Kane 8.10., Ella Eyre 26.10. mit 22:30, Nighthawks 6.11. mit 20:30
Einlass). Die 21:00 des Gig Guides sind also wahrscheinlich der Einlass,
wie beim Lido — aber das ist ein Muster, kein Beleg für diesen Abend,
und die Bandsintown-Uhrzeit trägt laut Falle nicht allein. **Bedingung:**
Das Quasimodo hat eine Seite unter `quasimodo.club/events/…` für den
Abend. Dann als `frei`-Posten nach oben ziehen; `beginn` folgt dem Haus.
Beim Bauen: Quasimodo ist als Ort neu (Adresse vom Haus), Zeitzone
`+02:00`, `genres` leer bis zum Lexikoneintrag Rhythm and Blues (Bündel
oben), Szenebezug im Text über Rhythm and Blues und Soul.

**ItemList für Listenartikel.** Entscheidung vom 2026-10-04: Listen
(`typ: liste`) bekommen im JSON-LD nur `Article`. Bedingung für die
Wiedervorlage: ein Listenartikel, dessen Einträge alle eine eigene Seite
im Register haben (etwa Festivals oder Bands). Dann `ItemList` mit
`itemListElement` aus `ListItem` mit `position` und `url` — die Einträge
kämen aus einem neuen Frontmatter-Feld (Schemaänderung).

**Wie viele Termine auf die Startseite?** Entscheidung vom 2026-10-03:
bei sechs bleiben. Gemessen: 51 freigegebene künftige Termine, davon 3
in den nächsten 14 und 12 in den nächsten 30 Tagen — sechs decken gut
zwei Wochen. Bedingung für die Wiedervorlage: nach dem Go-Live, mit
Zahlen dazu, ob Besucher über die Startseite oder direkt auf einer
Terminseite einsteigen.

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
`lexikon/ducktail`, `lexikon/flat-top`) und hier gestrichen. Rock- und
Kleidformen, Genres und Schuhe hat der Suchlauf am 2026-10-04 nach oben
gezogen.
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

**Artikel-Vorrat aus der PAA-Recherche — Auswahl Markus.** Noch nicht
gewählt, nicht abgelehnt (Einzelheiten in
`docs/daten/paa-rockabilly-2026-10-01/README.md`): A2 „Vintage-Kleidung
erkennen" (howto, `sammeln`, nach `lexikon/vintage`), A5 „Bekannte
Rockabilly-Songs" (liste, `musik`, keine Songtexte). Ein Lauf baut davon
nichts, solange Markus keinen auf `frei` setzt. A4 ist als
`artikel/rockabilly-oder-rocknroll` gebaut, A7 als
`artikel/rockabilly-frisuren` (Entwurf, 2026-10-04), der Pillar als
`artikel/der-rockabilly-look`.

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
