---
name: Record Hop in der Alten Feuerwache
aliases: [Record Hop Friedrichshain]
kurzbeschreibung: Tanzabend mit vier DJs in der Alten Feuerwache Berlin-Friedrichshain am 25. September 2026, mit 50s Rock'n'Roll, Jump & Jive, Rhythm'n'Blues und Rockabilly.
status: entwurf
erstelltAm: 2026-09-04
geprueftAm: 2026-09-10
geaendertAm: 2026-09-10
autor: markus
typ: tanzabend
beginn: 2026-09-25T19:00:00+02:00
ende: 2026-09-26T05:00:00+02:00
ort: alte-feuerwache-friedrichshain
region: berlin
eintritt: unveroeffentlicht
genres: [rockabilly]
djs: [Sweet Sue, Chrille, Raockin' Vagabond, Chill Bill]
durchfuehrung: geplant
links:
  website: https://www.rockin-wildcat.com/rwc/events/record-hop-60
redaktionsnotiz: >-
  AKTUALITAETSBELEG: Vier unabhaengige Anzeichen, dass diese Angabe der
  kommenden und nicht einer vergangenen Ausgabe gilt. Erstens steht im
  JSON-LD startDate 2026-09-25T21:00:00+02:00 und eventStatus
  EventScheduled -- ein Zeitpunkt in der Zukunft, maschinell ausgezeichnet.
  Zweitens traegt das hinterlegte Bild den Dateinamen
  tanzteefeuerwache20260925.jpg und liegt im Uploadpfad /2026/08/: Datum
  im Dateinamen und Uploadmonat stimmen mit dem Termin ueberein.
  Drittens laeuft die Adresse auf .../events/record-hop-60 -- eine
  hochgezaehlte Ausgabennummer. Zum Vergleich: .../record-hop-4 fuehrt auf
  denselben Veranstaltungstyp mit Datum 29. Januar 2023. Viertens nennt
  die Detailseite im Fliesstext "25. September 2026" und damit dasselbe
  Datum wie die strukturierten Daten.
  DAS HAETTE MICH FAST ERWISCHT: Ich habe die Detailadresse zuerst aus dem
  gekuerzten Listeneintrag geraten und bin bei record-hop-4 gelandet --
  einer Ausgabe von 2023, gleicher Name, gleicher Veranstalter, anderes
  Jahr. Erst der Abruf der URL aus dem JSON-LD-Feld offers.url hat das
  korrigiert. Geratene Detail-URLs sind bei nummerierten Reihen gefaehrlich.
  KEIN PREIS EINGETRAGEN, obwohl das JSON-LD offers.price "0" liefert.
  Der Wert steht bei allen achtzehn Terminen dieser Quelle auf 0, auch bei
  Gastspielen internationaler Bands in grossen Haeusern. Er ist damit
  erkennbar ein Vorgabewert des Redaktionssystems und keine Aussage ueber
  freien Eintritt. Der Eintrag steht deshalb auf `eintritt: unveroeffentlicht`
  mit leerem `preise` -- lieber keine Angabe als eine falsche Null.
  Der dritte Preiszustand ist genau fuer diesen Fall gebaut, und die
  Quelle deckt ihn: Der Eintrag `felder` der ersten Quelle nennt
  `eintritt`, weil ich diese Seite auf die Preisfrage hin gelesen habe.
  `ende` steht als reines Datum ohne Uhrzeit, so wie es die Quelle
  liefert (endDate 2026-09-26). Gemeint ist vermutlich das Ende in der
  Nacht; die Quelle sagt keine Uhrzeit, also erfinde ich keine.
  Nicht gefuellt: veranstalter (organizer im JSON-LD ist ein leeres
  Person-Objekt), kapazitaet, barrierefrei, genres.
  GENRES NACHGETRAGEN am 2026-09-10: Die Seite nennt "50s Rock'n'Roll,
  Jump & Jive, Rhythm'n'Blues, Rockabilly". Von diesen vier hat nur
  Rockabilly einen Lexikoneintrag; die uebrigen drei stehen weiter nur im
  Fliesstext. "Jump & Jive" ist bewusst NICHT auf `jump-blues`
  abgebildet -- Jive ist ein Tanz, und die Zusammenziehung im
  Ankuendigungstext sagt nicht, dass Jump Blues gemeint ist.
  KORREKTUR DER ANFANGSZEIT am 2026-09-10. Der Eintrag stand auf
  21:00 Uhr. Beim erneuten Abruf nennt die Quelle an zwei Stellen
  uebereinstimmend 19:00 Uhr: das sichtbare Feld "Uhrzeit" und der
  Kalenderlink mit startDate 20260925T170000Z, was 19:00 MESZ entspricht;
  dessen endDate 20260926T030000Z ergibt 05:00 MESZ am Folgetag, weshalb
  `ende` jetzt eine Uhrzeit traegt statt nur ein Datum.
  Ob die Seite sich seit dem Abruf am 2026-09-04 geaendert hat oder die
  erste Lesung falsch war, laesst sich von hier aus nicht entscheiden.
  Beide Lesarten stehen deshalb hier mit ihrem Datum. Was die Korrektur
  ausgeloest hat, ist bemerkenswert: Der Termin wurde nur deshalb erneut
  geoeffnet, weil auf derselben Seite nach Nachbarterminen gesucht wurde.
  Ohne diesen Zufall haette die Pruefkadenz von 30 Tagen den Fehler erst
  Anfang Oktober gefunden -- nach dem Termin.
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/record-hop-60
    titel: Record Hop, 25. September 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-04
    felder: [beginn, ende, ort, djs, eintritt, genres, name, kurzbeschreibung, durchfuehrung, body:abend, body:musik]
    art: offiziell
  - url: https://www.rockin-wildcat.com/rwc/guide
    titel: Berlin Gig Guide (Rockin' Wildcat)
    abgerufenAm: 2026-09-04
    felder: [beginn, ende, ort, body:einordnung]
    art: offiziell
---

Der Record Hop ist ein Tanzabend am 25. September 2026 ab 19 Uhr in der Alten Feuerwache in Berlin-Friedrichshain. Aufgelegt wird von vier DJs; gespielt werden nach Angabe der Veranstalter 50s Rock'n'Roll, Jump & Jive, Rhythm'n'Blues und [Rockabilly](/lexikon/rockabilly/).

## Der Abend

Ein Record Hop ist ein Tanzabend ohne Liveband — die Musik kommt von Platten, und das Programm hängt entsprechend an den Auflegenden. Für diesen Termin sind Sweet Sue, Chrille, Raockin' Vagabond und Chill Bill angekündigt.

Einen Eintrittspreis nennt die Quelle nicht. Das maschinenlesbare Angebot auf der Seite trägt zwar einen Preis von null Euro, dieser Wert steht dort aber bei jedem Termin gleich — auch bei Konzerten in großen Häusern. Er taugt deshalb nicht als Beleg für freien Eintritt, und dieser Eintrag macht dazu keine Angabe.

## Die Musik

Die genannten Stilrichtungen decken ein breiteres Feld ab als der Begriff Rockabilly allein. Jump & Jive und Rhythm'n'Blues sind für Tanzabende dieser Art typisch, weil sie Tempi liefern, die sich über einen ganzen Abend durchhalten lassen — anders als ein reines Konzertprogramm, das Höhepunkte setzt.

## Einordnung

Der Termin steht im Berliner Gig Guide von Rockin' Wildcat, einem seit 1998 laufenden Online-Magazin, das seine Veranstaltungshinweise vollständig als strukturierte Daten ausliefert. Für [Berlin](/regionen/berlin/) ist diese Liste die dichteste laufende Quelle: achtzehn Termine zwischen September 2026 und März 2027, verteilt auf rund acht Spielorte, darunter die [Alte Feuerwache](/locations/alte-feuerwache-friedrichshain/). Wer die Berliner Szene im Kalender abbilden will, kommt an ihr nicht vorbei.
