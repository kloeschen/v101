---
name: Record Hop im Rathaus Friedrichshagen
aliases: [Record Hop Friedrichshagen, Tanztee im Rathaus Friedrichshagen]
kurzbeschreibung: Tanznachmittag mit DJ Capt'n K. im Rathaus Friedrichshagen in Berlin-Köpenick am 18. Oktober 2026, mit 50s Rock'n'Roll, Jump & Jive, Rhythm'n'Blues und Rockabilly.
status: veroeffentlicht
erstelltAm: 2026-09-24
geprueftAm: 2026-09-25
autor: markus
typ: tanzabend
beginn: 2026-10-18T16:00:00+02:00
ort: rathaus-friedrichshagen
region: berlin
djs: [Capt'n K.]
eintritt: beziffert
preise:
  - bezeichnung: Eintritt
    betrag: 10
    waehrung: EUR
genres: [rocknroll, rockabilly]
durchfuehrung: geplant
links:
  website: https://www.rockin-wildcat.com/rwc/events/record-hop-63
redaktionsnotiz: >-
  AKTUALITAETSBELEG: Drei Anzeichen, alle an derselben Quelle -- eine
  zweite gibt es fuer diesen Termin nicht, siehe unten. Erstens nennt die
  Detailseite im Fliesstext "So., 18. Oktober 2026", und der 18. Oktober
  2026 ist tatsaechlich ein Sonntag. Zweitens steht im JSON-LD
  eventStatus EventScheduled mit einem Datum in der Zukunft. Drittens
  liegt das hinterlegte Bild unter /2026/09/ und heisst
  TT__18terOkt__online.jpg -- Uploadmonat und Datum im Dateinamen passen
  zum Termin. Das Kuerzel "TT" deute ich nicht: Beim Record Hop in der
  Alten Feuerwache heisst das Bild "tanzteefeuerwache20260925.jpg", das
  legt Tanztee nahe, belegt es aber nicht. Fuer den Aktualitaetsbeleg
  zaehlt allein das Datum im Dateinamen.
  DIE DETAILADRESSE IST NICHT GERATEN, sondern aus dem Feld offers.url des
  JSON-LD im Gig Guide uebernommen. Bei nummerierten Reihen ist das
  Pflicht: Die Quelle fuehrt allein sechs Adressen der Form
  .../events/record-hop-NN, darunter eine ohne sprechenden Namen
  (.../events/27306). Wer die Nummer raet, landet zuverlaessig auf einer
  anderen Ausgabe.
  NUR EINE QUELLE. Der Spielort fuehrt den Termin nicht in seinem eigenen
  Kalender; dort stehen am 2026-09-24 nur ein Escape-Dinner und ein
  Varite-Dinner. Der Record Hop ist damit ausschliesslich durch Rockin'
  Wildcat belegt. Das ist kein Grund, den Eintrag wegzulassen -- aber es
  gehoert in den Fliesstext, und der Eintrag steht deshalb bewusst als
  Entwurf mit dieser Notiz zur Vorlage.
  ANFANGSZEIT 16:00 UND NICHT 18:00. Das JSON-LD nennt startDate
  2026-10-18T18:00:00+02:00. Das sichtbare Feld "Uhrzeit" nennt 16:00,
  der Kalenderlink dates=20261018T140000Z ebenfalls (14:00 UTC sind 16:00
  MESZ). Der Versatz ist bei dieser Quelle systematisch: Bei allen acht am
  2026-09-24 geprueften Terminen liegt das JSON-LD startDate genau um den
  UTC-Versatz spaeter als der Kalenderlink. Das Redaktionssystem schreibt
  die oertliche Uhrzeit in ein Feld, das als UTC gelesen wird. Aus dieser
  Quelle gilt deshalb die sichtbare Uhrzeit, nie das JSON-LD startDate.
  ENDE NICHT GESETZT. Der Kalenderlink endet auf 20261019T030000Z, also
  05:00 MESZ am Montagmorgen. Dieselbe Endzeit -- 05:00 oertlich -- steht
  bei sieben der acht am 2026-09-24 geprueften Termine dieser Quelle,
  unabhaengig von Anfangszeit, Spielort und Zeitzonenhaelfte; beim achten
  (jets-smokestack-lightnin) faellt das Ende mit dem Beginn zusammen, ist
  also gar keine Angabe. Ein Wert, der entweder konstant oder leer ist,
  ist ein Vorgabewert. Fuer einen Tanznachmittag, der um 16 Uhr
  beginnt, ist ein Ende um 5 Uhr frueh zusaetzlich unplausibel. Lieber
  keine Angabe als eine falsche.
  PREIS: 10 Euro, und hier ist die Quelle belastbar. Die Detailseite zeigt
  ein sichtbares Feld "Kosten" mit "10,00 EUR", und das JSON-LD nennt
  offers.price "10". Damit weicht dieser Eintrag bewusst vom Record Hop in
  der Alten Feuerwache ab, der auf `unveroeffentlicht` steht: Die dort
  festgehaltene Regel, offers.price sei bei dieser Quelle durchgaengig 0
  und damit immer ein Vorgabewert, ist gemessen falsch. Von den 24
  Terminen im Gig Guide tragen am 2026-09-24 fuenf einen Preis ungleich
  null: rocknroll-trio-8 mit 12, record-hop-63 mit 10, 27306 mit 10,
  record-hop-64 mit 10 und boppin-b-5 mit 25 Euro. Auf den acht
  geoeffneten Detailseiten faellt das sichtbare Feld "Kosten" genau mit
  diesem Fall zusammen: record-hop-63 traegt es und hat einen Preis, die
  uebrigen sieben tragen es nicht und haben price "0" -- acht von acht.
  Die verlaessliche Regel lautet damit: Das sichtbare Feld "Kosten"
  entscheidet. Steht es da, stimmt auch offers.price; fehlt es, bedeutet
  die Null "kein Preis hinterlegt".
  BEZEICHNUNG DES PREISES: "Eintritt". Die Quelle nennt weder Vorverkauf
  noch Abendkasse noch eine Ermaessigung, also auch keine Staffel.
  GENRES: Der Gig Guide fuehrt den Termin unter "50s Rock'n'Roll",
  "Jump & Jive", "Rhythm'n'Blues" und "Rockabilly". Nur zwei davon haben
  einen Lexikoneintrag. "Jump & Jive" ist wie beim Record Hop in der
  Alten Feuerwache bewusst NICHT auf `jump-blues` abgebildet -- Jive ist
  ein Tanz, und die Zusammenziehung im Ankuendigungstext sagt nicht, dass
  Jump Blues gemeint ist.
  QUELLENART: `aggregator` und nicht `offiziell`. Rockin' Wildcat ist ein
  Online-Magazin, das im Gig Guide fremde Ankuendigungen buendelt -- genau
  die Definition im Schema. Der Eintrag zum Record Hop in der Alten
  Feuerwache fuehrt dieselbe Quelle als `offiziell`; welche der beiden
  Einstufungen bleibt, gehoert vereinheitlicht und steht als Posten in
  OFFENE-PUNKTE.md.
  Nicht gefuellt: veranstalter (organizer im JSON-LD ist ein leeres
  Person-Objekt), ticketUrl, kapazitaet, ende, lineupWeitere (ein Record
  Hop hat keine Liveband).
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/record-hop-63
    titel: Record Hop, 18. Oktober 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-24
    felder: [beginn, ende, ort, djs, genres, eintritt, preise, name, kurzbeschreibung, durchfuehrung, body:termin, body:musik]
    art: aggregator
  - url: https://www.rockin-wildcat.com/rwc/guide
    titel: Berlin Gig Guide (Rockin' Wildcat)
    abgerufenAm: 2026-09-24
    felder: [beginn, ort, body:einordnung]
    art: aggregator
  - url: https://www.rathaus-friedrichshagen.de/veranstaltungen.php
    titel: Veranstaltungen (Rathaus Friedrichshagen)
    abgerufenAm: 2026-09-24
    felder: [ort, body:termin]
    art: offiziell
---

Der Record Hop im Rathaus Friedrichshagen ist ein Tanznachmittag am Sonntag, dem 18. Oktober 2026, ab 16 Uhr in Berlin-Köpenick. Aufgelegt wird von DJ Capt'n K.; angekündigt sind 50s [Rock'n'Roll](/lexikon/rocknroll/), Jump & Jive, Rhythm'n'Blues und [Rockabilly](/lexikon/rockabilly/). Der Eintritt kostet 10 Euro.

## Der Termin im Rathaus Friedrichshagen

Ein Record Hop ist ein Tanzabend ohne Liveband — die Musik kommt von Platten. Ungewöhnlich ist hier die Uhrzeit: Der Termin beginnt am Sonntagnachmittag um 16 Uhr und nicht am Abend.

Angekündigt ist der Nachmittag allein im Berliner Gig Guide von Rockin' Wildcat. Das [Rathaus Friedrichshagen](/locations/rathaus-friedrichshagen/) selbst führt ihn nicht in seinem Veranstaltungskalender, obwohl der eine eigene Kategorie für Tanz kennt. Wer hinfahren will, fragt deshalb besser vorher nach.

Die Anfangszeit steht auf der Seite nicht einheitlich: Die sichtbare Angabe und der Kalendereintrag nennen 16 Uhr, die maschinenlesbaren Daten derselben Seite 18 Uhr. Dieser Eintrag folgt den beiden übereinstimmenden Stellen — die Abweichung tritt bei dieser Quelle an jedem geprüften Termin auf und geht immer in dieselbe Richtung. Eine Endzeit nennt der Eintrag nicht: Der einzige Wert dazu lautet bei fast allen geprüften Terminen dieser Quelle gleich — fünf Uhr morgens —, unabhängig davon, wann der Termin anfängt.

## Die Musik beim Record Hop

Die vier genannten Stilrichtungen decken mehr ab als Rockabilly allein. Jump & Jive und Rhythm'n'Blues stehen für Tempi, die sich über einen ganzen Nachmittag durchhalten lassen; ein Tanznachmittag braucht anderes als ein Konzert, das auf Höhepunkte hinarbeitet.

## Einordnung des Record Hops in Berlin

Der Termin gehört zu einer Reihe: Derselbe Gig Guide nennt für dieses Haus drei Record Hops im Herbst 2026 — am 18. Oktober, am 8. November und am 6. Dezember. Damit ist das Rathaus neben der Alten Feuerwache, wo der [Record Hop am 25. September](/events/record-hop-alte-feuerwache-2026-09-25/) läuft, der zweite Ort in [Berlin](/regionen/berlin/), an dem diese Art Tanzveranstaltung regelmäßig stattfindet.
