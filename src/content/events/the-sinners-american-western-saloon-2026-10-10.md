---
name: The Sinners im American Western Saloon
aliases: [The Sinners Berlin 2026, The Sinners Western Saloon]
kurzbeschreibung: Konzert der Band The Sinners am Samstag, 10. Oktober 2026, im American Western Saloon in Berlin-Reinickendorf, mit 50s Rock'n'Roll, Doo Wop und Rockabilly.
status: entwurf
erstelltAm: 2026-09-24
geprueftAm: 2026-09-24
autor: markus
typ: konzert
beginn: 2026-10-10T20:00:00+02:00
ort: american-western-saloon-reinickendorf
region: berlin
lineupWeitere: [The Sinners]
eintritt: unveroeffentlicht
genres: [rocknroll, doo-wop, rockabilly]
durchfuehrung: geplant
links:
  website: https://www.rockin-wildcat.com/rwc/events/the-sinners
redaktionsnotiz: >-
  AKTUALITAETSBELEG: Drei unabhaengige Anzeichen. Erstens nennt die
  Detailseite von Rockin' Wildcat im Fliesstext "Sa., 10. Oktober 2026",
  und der 10. Oktober 2026 ist tatsaechlich ein Samstag. Zweitens steht im
  JSON-LD eventStatus EventScheduled mit einem Datum in der Zukunft.
  Drittens -- und das ist der eigentliche Beleg -- fuehrt das Haus selbst
  auf seiner Seite "Weekly Specials" den Flyer
  weeklyflyer/2026/10.10.2026Sinners.jpg. Datum und Bandname stehen im
  Dateinamen, die Seite traegt "aktualisiert am 18.09.2026". Damit belegt
  der Spielort den Termin unabhaengig vom Gig Guide. Gegenprobe: Auf
  derselben Seite liegt 7.11.2026AronKing.jpg, und der Gig Guide fuehrt
  Aron King & his Ferriday Rockers am 2026-11-07 im selben Haus. Die
  beiden Quellen stimmen also auch an einem zweiten Termin ueberein.
  ANFANGSZEIT 20:00 UND NICHT 22:00 -- das ist der wichtigste Fund dieses
  Eintrags. Das JSON-LD der Quelle nennt startDate
  2026-10-10T22:00:00+02:00. Zwei andere Stellen derselben Seite nennen
  20:00: das sichtbare Feld "Uhrzeit" und der Kalenderlink mit
  dates=20261010T180000Z, was 20:00 MESZ entspricht. Das Haus selbst
  schreibt unabhaengig davon "Einlass 18 Uhr - Live Music beginnt um 20
  Uhr". Drei Stellen gegen eine, davon eine ausserhalb der Quelle.
  Der Widerspruch ist kein Einzelfall, sondern systematisch: Bei allen
  acht am 2026-09-24 geprueften Terminen dieser Quelle liegt das JSON-LD
  startDate genau um den jeweiligen UTC-Versatz spaeter als der
  Kalenderlink (Sommerzeit zwei Stunden, Winterzeit eine). Beispiele:
  record-hop-66 Kalender 20260926T180000Z gegen JSON-LD 22:00+02:00,
  kitty-daisy-lewis-2 Kalender 20261026T190000Z gegen JSON-LD 21:00+01:00.
  Das Redaktionssystem schreibt die oertliche Uhrzeit in ein Feld, das als
  UTC gelesen wird -- genau der Fehler, den `npm run check:zeit` in diesem
  Repo verhindert. Fuer die Redaktion folgt daraus eine Regel: Aus dieser
  Quelle gilt die sichtbare Uhrzeit beziehungsweise der Kalenderlink,
  niemals das JSON-LD startDate.
  ENDE NICHT GESETZT, obwohl die Quelle eines liefert. Der Kalenderlink
  endet auf 20261011T030000Z, also 05:00 MESZ. Dieselbe Endzeit -- 05:00
  oertlich -- steht bei sieben der acht am 2026-09-24 geprueften Termine
  dieser Quelle, bei einem Tanztee um 16:00 ebenso wie bei einem Konzert
  um 20:00, in Sommer- wie in Winterzeit. Der achte
  (jets-smokestack-lightnin) traegt als Ende denselben Zeitpunkt wie als
  Beginn, also gar keine Angabe. Der Wert ist damit entweder konstant
  oder leer, nie terminbezogen -- ein Vorgabewert und keine Aussage. Die Oeffnungszeit des Hauses widerspricht ihm zudem: Freitag
  und Samstag hat der Saloon nach eigener Angabe bis 24 Uhr geoeffnet.
  Deshalb kein `ende` -- die Oeffnungszeit als Endzeit zu setzen waere
  ebenfalls geraten.
  EINTRITT: `unveroeffentlicht`, und diesmal mit einer starken Aussage
  ueber die Abwesenheit. Das JSON-LD nennt offers.price "0". Dieser Wert
  ist bei dieser Quelle nicht durchgaengig, wie bisher angenommen: Von den
  24 Terminen im Gig Guide tragen am 2026-09-24 fuenf einen Preis ungleich
  null (rocknroll-trio-8 mit 12, record-hop-63 mit 10, 27306 mit 10,
  record-hop-64 mit 10 und boppin-b-5 mit 25 Euro). Von den acht
  geoeffneten Detailseiten ist record-hop-63 die einzige mit einem Preis
  ungleich null -- und zugleich die einzige, die ein sichtbares Feld
  "Kosten" zeigt ("10,00 EUR"). Acht von acht stimmen darin ueberein:
  sichtbares Feld genau dann, wenn ein Preis hinterlegt ist. Die Null
  bedeutet damit "kein Preis hinterlegt" und nicht "freier Eintritt" --
  die Schlussfolgerung des Record-Hop-Eintrags bleibt richtig, ihre
  Begruendung ist jetzt aber gemessen statt vermutet. Das Haus selbst
  bestaetigt, dass es einen Eintritt gibt, ohne ihn zu beziffern:
  "Eintritt bei Live Music und Line Dance bitte nur in bar bezahlen."
  BAND NICHT ANGELEGT: The Sinners stehen in `lineupWeitere`. Der Gig
  Guide nennt als einzige Angabe zur Band die Adresse www.thesinners.de;
  Herkunft, Besetzung und Gruendungsjahr belegt keine der geoeffneten
  Quellen. Ob eine Bandseite entsteht, entscheidet der Mensch.
  GENRES: Der Gig Guide fuehrt den Termin unter "50s Rock'n'Roll",
  "DooWop" und "Rockabilly". Alle drei haben einen Lexikoneintrag.
  Nicht gefuellt: veranstalter (organizer im JSON-LD ist ein leeres
  Person-Objekt), ticketUrl, kapazitaet, barrierefrei, ende.
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/the-sinners
    titel: The Sinners, 10. Oktober 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-24
    felder: [beginn, ende, ort, lineupWeitere, genres, eintritt, name, kurzbeschreibung, durchfuehrung, body:termin, body:musik]
    art: aggregator
  - url: https://www.western-saloon.de/weeklyspecials.html
    titel: Weekly Specials (American Western Saloon Berlin)
    abgerufenAm: 2026-09-24
    felder: [beginn, ort, lineupWeitere, body:termin]
    art: offiziell
  - url: https://www.western-saloon.de/veranstaltungen.html
    titel: Veranstaltungen 2026 (American Western Saloon Berlin)
    abgerufenAm: 2026-09-24
    felder: [beginn, eintritt, body:termin]
    art: offiziell
  - url: https://www.western-saloon.de/
    titel: American Western Saloon Berlin, Startseite
    abgerufenAm: 2026-09-24
    felder: [eintritt, ende, body:termin, body:einordnung]
    art: offiziell
  - url: https://www.rockin-wildcat.com/rwc/guide
    titel: Berlin Gig Guide (Rockin' Wildcat)
    abgerufenAm: 2026-09-24
    felder: [beginn, ort, body:einordnung]
    art: aggregator
---

Das Konzert von The Sinners im [American Western Saloon](/locations/american-western-saloon-reinickendorf/) in Berlin-Reinickendorf ist für Samstag, den 10. Oktober 2026, ab 20 Uhr angekündigt. Gespielt werden 50s [Rock'n'Roll](/lexikon/rocknroll/), [Doo Wop](/lexikon/doo-wop/) und [Rockabilly](/lexikon/rockabilly/); Einlass ist ab 18 Uhr.

## Der Termin von The Sinners in Berlin

Den Termin belegen zwei voneinander unabhängige Quellen: der Berliner Gig Guide von Rockin' Wildcat und das Haus selbst, das den Abend unter seinen „Weekly Specials" führt. Die Anfangszeit steht bei Rockin' Wildcat nicht einheitlich — die sichtbare Angabe und der Kalendereintrag nennen 20 Uhr, die maschinenlesbaren Daten derselben Seite 22 Uhr. Dieser Eintrag folgt den 20 Uhr, und zwar nicht nur der Mehrheit wegen: Der Saloon schreibt selbst, dass die Live-Musik um 20 Uhr beginnt.

Einen Eintrittspreis nennt keine der Quellen. Dass Eintritt genommen wird, steht dagegen fest — das Haus bittet ausdrücklich darum, ihn bei Live-Musik in bar zu zahlen. Eine Endzeit gibt dieser Eintrag ebenfalls nicht an. Die einzige Angabe dazu lautet bei dieser Quelle an fast jedem Termin gleich — fünf Uhr morgens, gleichgültig wann der Termin anfängt — und sagt deshalb nichts über diesen Abend.

## Die Musik von The Sinners

Über die Band selbst geben die geöffneten Quellen wenig her: Der Gig Guide nennt neben den drei Stilrichtungen nur die Adresse der bandeigenen Website. Herkunft, Besetzung und Gründungsjahr bleiben deshalb offen, und The Sinners stehen in diesem Register bislang als Name im Line-up und nicht als eigener Eintrag.

Die Stilmischung passt zum Haus: Doo Wop und 50s Rock'n'Roll liegen nah an dem Country- und Western-Programm, das hier den Rest des Jahres läuft, und sind zugleich der Teil davon, der die Szene anzieht.

## Einordnung des Konzerts in Berlin

Für [Berlin](/regionen/berlin/) ist der Saloon ein Spielort abseits der üblichen Clubs. Er liegt im Norden der Stadt, hat eine Küche, eine Tanzfläche für Line Dance und ein Publikum, das wöchentlich kommt — das Konzert ist hier der Sonderfall im laufenden Betrieb und nicht der Zweck des Hauses. Wer die Berliner Termine sammelt, findet solche Orte nur über den Gig Guide, in dem auch der [Record Hop in der Alten Feuerwache](/events/record-hop-alte-feuerwache-2026-09-25/) steht.
