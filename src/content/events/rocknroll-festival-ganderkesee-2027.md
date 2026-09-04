---
name: Rock'n'Roll Festival Ganderkesee 2027
aliases: [Rock'n'Roll Festival Ganderkesee, Festival Ganderkesee]
kurzbeschreibung: Dreitaegiges Rock-'n'-Roll-Festival vom 20. bis 22. August 2027 auf dem Flugplatz Ganderkesee bei Bremen, mit Livebands, Tanzkursen, Oldtimern und eigenem Campground.
status: entwurf
erstelltAm: 2026-09-04
geprueftAm: 2026-09-04
autor: markus
typ: festival
reihe: rocknroll-festival-ganderkesee
reiheName: Rock'n'Roll Festival Ganderkesee
beginn: 2027-08-20
ende: 2027-08-22
ganztaegig: true
ort: flugplatz-ganderkesee
region: niedersachsen
eintritt: beziffert
veranstalterUrl: https://rocknroll-festival.de
preise:
  - bezeichnung: 3-Tage-Festivalticket, Online
    betrag: 89
    waehrung: EUR
  - bezeichnung: 3-Tage-Festivalticket, Tageskasse
    betrag: 99
    waehrung: EUR
  - bezeichnung: Tageskarte Freitag, Online
    betrag: 31
    waehrung: EUR
  - bezeichnung: Tageskarte Freitag, Tageskasse
    betrag: 35
    waehrung: EUR
  - bezeichnung: Tageskarte Samstag, Online
    betrag: 49
    waehrung: EUR
  - bezeichnung: Tageskarte Samstag, Tageskasse
    betrag: 55
    waehrung: EUR
  - bezeichnung: Tageskarte Sonntag, Online
    betrag: 18
    waehrung: EUR
  - bezeichnung: Tageskarte Sonntag, Tageskasse
    betrag: 20
    waehrung: EUR
camping: ja
durchfuehrung: geplant
links:
  website: https://rocknroll-festival.de
redaktionsnotiz: >-
  DER LEHRREICHSTE FALL DER FUENF, weil die Seite sich selbst
  widerspricht. Der HTML-Titel lautet beim Abruf am 2026-09-04 noch
  "Rock'n'Roll Festival Ganderkesee - 21.-23.08.2026" -- ein Termin, der
  zu diesem Zeitpunkt zwoelf Tage vorbei war. Der sichtbare Inhalt
  derselben Seite nennt dagegen prominent "20. - 22. August 2027".
  Titel und Inhalt stammen erkennbar aus verschiedenen Pflegestaenden.
  AKTUALITAETSBELEG, warum 2027 gilt und nicht 2026: Erstens steht das
  Datum 2027 an der prominentesten Stelle der Seite, direkt ueber dem
  Ortsnamen, waehrend 2026 nur noch im Titel-Tag steht. Zweitens nennt
  der Campingabschnitt unabhaengig davon den Zeitraum
  "(20.08. - 23. 08. 2027)" -- eine zweite, inhaltlich andere Stelle mit
  demselben Jahr. Drittens fuehrt die Navigation eine Rubrik "So war"
  mit den Jahren 2018, 2023, 2024 und 2025, in der 2026 noch fehlt, und
  auf der Startseite stehen Aftermovies zu 2023, 2024 und 2025. Die
  Rueckschau ist also getrennt vom Ankuendigungsteil gefuehrt.
  WAERE DIE REGEL NICHT ANGEWENDET WORDEN, haette ich hier den Titel
  gelesen und ein vergangenes Festival als kommend eingetragen -- oder
  umgekehrt das Jahr 2027 fuer eine stehengebliebene Restangabe
  gehalten. Das ist der Fall, in dem die zweite Frage tatsaechlich einen
  Fehler verhindert hat.
  PREISSTAFFEL: Acht Preispunkte, im Fliesstext als Liste unter der
  Ueberschrift "Preisliste". Die Quelle staffelt zweidimensional --
  nach Gueltigkeitstag (3 Tage, Freitag, Samstag, Sonntag) und nach
  Kaufweg (Online, Tageskasse). Das Schema kennt nur `bezeichnung`,
  `betrag`, `waehrung`, `gueltigBis` und `hinweis`; eine zweite Dimension
  ist nicht vorgesehen. Ich habe beide Achsen in die `bezeichnung`
  gefaltet ("Tageskarte Samstag, Online"). Das ist auswertbar, aber nur
  ueber Textvergleich -- ein Feld `kaufweg` oder ein Flag
  `vorverkauf: true` waere hier das fehlende Stueck.
  Der Shuttlepreis von 5 Euro je Person und Fahrt ist kein Eintritt und
  steht deshalb nicht in `preise`, sondern im Fliesstext.
  Nicht gefuellt: veranstalter (die Seite nennt keinen Traegernamen im
  abgerufenen Text, nur die Domain), lineupBands, lineupWeitere (fuer
  2027 ist noch kein Line-up bekanntgegeben), kapazitaet,
  barrierefrei, genres.
  Die Selbstbeschreibung als groesstes Rock'n'Roll-Festival
  Norddeutschlands ist eine Werbeaussage des Veranstalters und im
  Fliesstext als solche gekennzeichnet.
quellen:
  - url: https://rocknroll-festival.de/
    titel: Rock'n'Roll Festival Ganderkesee
    abgerufenAm: 2026-09-04
    felder: [beginn, ende, ort, eintritt, preise, camping, veranstalterUrl, name, kurzbeschreibung, durchfuehrung, body:termin, body:gelaende, body:eintritt, body:anreise]
    art: offiziell
---

Das Rock'n'Roll Festival Ganderkesee 2027 ist ein dreitägiges Festival vom 20. bis 22. August 2027 auf dem Flugplatz Ganderkesee westlich von Bremen. Drei Tage lang gibt es Livemusik, Tanzkurse, Oldtimer, einen Vintage-Markt und Foodtrucks auf einem Freigelände mit eigenem Campground.

## Der Termin

Das Datum steht auf der Seite an zwei voneinander unabhängigen Stellen: als Kopfzeile über dem Ortsnamen und im Campingabschnitt, der den Zeitraum vom 20. bis 23. August 2027 für die Stellplätze nennt — einen Tag länger als das Programm, für die Abreise.

Wer die Seite maschinell liest, muss dabei aufpassen. Der Titel des Dokuments trug beim Abruf am 4. September 2026 noch den Termin der Ausgabe 2026, die zu diesem Zeitpunkt bereits vorbei war. Titel und Inhalt derselben Seite nennen also verschiedene Jahre.

## Das Gelände

Das Festival nutzt ein weitläufiges Areal des Flugplatzes einschließlich eines Hangars, den der Veranstalter mit 1200 Quadratmetern angibt. Zwischen den Besuchern stehen historische Flugzeuge — der Betreiber wirbt ausdrücklich mit diesem Bild und beschreibt das Wochenende als Ausflug in die fünfziger und sechziger Jahre. Der Campground liegt in unmittelbarer Nähe und bietet Toiletten und Duschen, aber keinen Strom- und Wasseranschluss an den Stellplätzen.

Der Veranstalter bezeichnet die Veranstaltung als das größte Rock'n'Roll Festival in Norddeutschland. Das ist eine Selbstauskunft; geprüft ist sie nicht.

## Eintritt

Die Preise sind zweifach gestaffelt — nach Gültigkeitsdauer und nach Kaufweg. Das Drei-Tage-Ticket kostet online 89 Euro und an der Tageskasse 99 Euro. Die Tageskarten liegen bei 31 Euro online für den Freitag, 49 Euro für den Samstag und 18 Euro für den Sonntag; an der Tageskasse jeweils 35, 55 und 20 Euro. Der Samstag ist damit der teuerste, der Sonntag der günstigste Tag.

## Anreise

Ein Shuttleverkehr eines örtlichen Taxiunternehmens verbindet das Gelände mit Ganderkesee, Hude, Dötlingen, einem Campingplatz am Falkensteinsee und Delmenhorst; er kostet fünf Euro je Person und Fahrt. Der Veranstalter bittet um frühzeitige telefonische Anmeldung. Für den [Flugplatz Ganderkesee](/locations/flugplatz-ganderkesee/) in [Niedersachsen](/regionen/niedersachsen/) ist das die einzige genannte Alternative zur Anreise mit dem eigenen Auto.
