---
name: Record Hop in der Alten Feuerwache
aliases: [Record Hop Friedrichshain]
kurzbeschreibung: Tanzabend mit vier DJs in der Alten Feuerwache Berlin-Friedrichshain am 25. September 2026, mit 50s Rock'n'Roll, Jump & Jive, Rhythm'n'Blues und Rockabilly.
status: veroeffentlicht
erstelltAm: 2026-09-04
geprueftAm: 2026-09-23
geaendertAm: 2026-09-26
autor: markus
typ: tanzabend
beginn: 2026-09-25T19:00:00+02:00
ort: alte-feuerwache-friedrichshain
region: berlin
eintritt: unveroeffentlicht
genres: [rockabilly]
djs: [Sweet Sue, Chrille, Raockin' Vagabond, Chill Bill]
durchfuehrung: stattgefunden
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
  ERNEUT GEPRUEFT am 2026-09-23, zwei Tage vor dem Termin (Stale-Posten
  "Termin naht, Pruefung liegt zurueck"): Seite erreichbar, eventStatus
  weiter EventScheduled, Datum und DJs unveraendert. Die Anfangszeit steht
  weiter widerspruechlich in der Quelle: sichtbares Feld "Uhrzeit" 19:00
  und Kalenderlink 20260925T170000Z (19:00 MESZ) gegen JSON-LD startDate
  21:00. Zwei von drei Stellen tragen 19:00, dabei bleibt es. Der
  Widerspruch steht jetzt auch im Fliesstext (Regel 5), weil er fuer
  Besucher zaehlt: Wer der maschinenlesbaren Angabe folgt, kommt zwei
  Stunden zu spaet.
  KORREKTUR am 2026-09-26, nach dem Termin, zwei Felder. Beide standen
  auf einer Lesart der Quelle, die am 2026-09-24 an acht Detailseiten
  derselben Quelle widerlegt wurde (ENTSCHEIDUNGEN.md, 2026-09-24,
  "Rockin' Wildcat: drei Lesarten der Quelle").
  Erstens `ende` ENTFERNT. Es stand seit dem 2026-09-10 auf
  2026-09-26T05:00:00+02:00, abgeleitet aus dem endDate des
  Kalenderlinks. Sieben der acht geprueften Termine dieser Quelle enden
  auf 05:00 Ortszeit, unabhaengig von Anfangszeit und Spielort -- ein
  Tanztee um 16:00 ebenso wie ein Konzert um 20:00; beim achten faellt
  das Ende mit dem Beginn zusammen. Der Wert ist ein Vorgabewert des
  Redaktionssystems, keine Aussage ueber diesen Abend. Die Quelle nennt
  damit kein Ende, und der Eintrag auch nicht. `ende` ist deshalb auch
  aus den `felder` beider Quellen gestrichen, die es fuehrten.
  Zweitens `art: aggregator` statt `offiziell` fuer alle drei
  Quelleneintraege. Rockin' Wildcat ist ein Online-Magazin, das im Gig
  Guide fremde Ankuendigungen buendelt, nicht der Veranstalter dieses
  Abends -- `aggregator` nach der Definition im Schema. Die Berliner
  Eintraege vom 2026-09-24 fuehren die Quelle bereits so.
  Folge der Korrektur: Ohne `ende` misst `npm run archivieren` am
  Beginn, der Eintrag steht deshalb im selben Zug auf
  `durchfuehrung: stattgefunden`. Das ist eine Ableitung aus dem
  Kalender, kein Beleg, dass der Abend tatsaechlich stattfand. Die
  Anfangszeit bleibt 19:00; der Befund vom 2026-09-24, dass das
  JSON-LD startDate dieser Quelle systematisch um den UTC-Versatz zu
  spaet liegt, erklaert die 21:00 und stuetzt die gewaehlte Lesart.
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/record-hop-60
    titel: Record Hop, 25. September 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-04
    felder: [beginn, ort, djs, eintritt, genres, name, kurzbeschreibung, durchfuehrung, body:abend, body:musik]
    art: aggregator
  - url: https://www.rockin-wildcat.com/rwc/events/record-hop-60
    titel: Record Hop, 25. September 2026 (Rockin' Wildcat), erneuter Abruf
    abgerufenAm: 2026-09-23
    felder: [beginn, djs, durchfuehrung, body:abend]
    art: aggregator
  - url: https://www.rockin-wildcat.com/rwc/guide
    titel: Berlin Gig Guide (Rockin' Wildcat)
    abgerufenAm: 2026-09-04
    felder: [beginn, ort, body:einordnung]
    art: aggregator
---

Der Record Hop ist ein Tanzabend am 25. September 2026 ab 19 Uhr in der Alten Feuerwache in Berlin-Friedrichshain. Aufgelegt wird von vier DJs; gespielt werden nach Angabe der Veranstalter 50s [Rock'n'Roll](/lexikon/rocknroll/), Jump & Jive, Rhythm'n'Blues und [Rockabilly](/lexikon/rockabilly/).

## Der Abend

Ein Record Hop ist ein Tanzabend ohne Liveband — die Musik kommt von Platten, und das Programm hängt entsprechend an den Auflegenden. Für diesen Termin sind Sweet Sue, Chrille, Raockin' Vagabond und Chill Bill angekündigt.

Die Anfangszeit steht auf der Seite nicht einheitlich: Die sichtbare Angabe und der Kalendereintrag nennen 19 Uhr, die maschinenlesbaren Daten derselben Seite 21 Uhr. Dieser Eintrag folgt den beiden übereinstimmenden Stellen; wer sichergehen will, fragt beim Veranstalter nach.

Eine Endzeit nennt dieser Eintrag nicht. Die Quelle trägt zwar 5 Uhr früh am Folgetag, aber dieselbe Uhrzeit steht dort bei fast jedem Termin, gleich ob Tanztee am Nachmittag oder Konzert am Abend. Sie sagt deshalb nichts darüber, wann dieser Abend endet.

Einen Eintrittspreis nennt die Quelle nicht. Das maschinenlesbare Angebot auf der Seite trägt zwar einen Preis von null Euro, dieser Wert steht dort aber bei jedem Termin gleich — auch bei Konzerten in großen Häusern. Er taugt deshalb nicht als Beleg für freien Eintritt, und dieser Eintrag macht dazu keine Angabe.

## Die Musik

Die genannten Stilrichtungen decken ein breiteres Feld ab als der Begriff Rockabilly allein. Jump & Jive und Rhythm'n'Blues sind für Tanzabende dieser Art typisch, weil sie Tempi liefern, die sich über einen ganzen Abend durchhalten lassen — anders als ein reines Konzertprogramm, das Höhepunkte setzt.

## Einordnung

Der Termin steht im Berliner Gig Guide von Rockin' Wildcat, einem seit 1998 laufenden Online-Magazin, das seine Veranstaltungshinweise vollständig als strukturierte Daten ausliefert. Für [Berlin](/regionen/berlin/) ist diese Liste die dichteste laufende Quelle: achtzehn Termine zwischen September 2026 und März 2027, verteilt auf rund acht Spielorte, darunter die [Alte Feuerwache](/locations/alte-feuerwache-friedrichshain/). Wer die Berliner Szene im Kalender abbilden will, kommt an ihr nicht vorbei.
