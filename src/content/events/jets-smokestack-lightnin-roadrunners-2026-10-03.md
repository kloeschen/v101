---
name: The Jets und Smokestack Lightnin' im Roadrunner's
aliases: [Jets / Smokestack Lightnin', 40 Jahre Louisiana Rebs, The Jets Berlin 2026]
kurzbeschreibung: Konzert von The Jets und Smokestack Lightnin' zum 40-jährigen Bestehen der Louisiana Rebs am Samstag, 3. Oktober 2026, im Roadrunner's Rock & Motor Club in Berlin-Prenzlauer Berg, mit Record Hop.
status: entwurf
erstelltAm: 2026-09-27
geprueftAm: 2026-09-27
autor: markus
typ: konzert
beginn: 2026-10-03T20:00:00+02:00
ort: roadrunners-rock-motor-club
region: berlin
lineupWeitere: [The Jets, Smokestack Lightnin']
eintritt: unveroeffentlicht
genres: [neo-rockabilly, rockabilly]
durchfuehrung: geplant
links:
  website: https://www.rockin-wildcat.com/rwc/events/jets-smokestack-lightnin
redaktionsnotiz: >-
  TERMIN SEHR NAH: Angelegt am 2026-09-27 fuer den 2026-10-03, sechs Tage
  Vorlauf. Gebaut, weil der Posten ihn ausdruecklich nennt und die
  bisherigen Berliner Eintraege einen Tag nach dem Anlegen geprueft waren.
  Liegt die Freigabe nach dem 3. Oktober, stellt `npm run archivieren`
  den Eintrag auf `stattgefunden`, und er kann ebenso gut geloescht
  werden.
  AKTUALITAETSBELEG: Die Detailseite nennt "Sa., 3. Oktober 2026", und der
  3. Oktober 2026 ist ein Samstag. Das Bild liegt unter /2026/04/. Das
  Haus selbst fuehrt den Abend auf seiner Programmseite
  (http://www.roadrunners-paradise.de/programm.html, abgerufen am
  2026-09-27) als "Samstag 3. Oktober: 40 Jahre Louisiana Rebs Berlin",
  der Flyer dort heisst flyerWEB_40Years_Rebs_03OCT2026.jpg und nennt
  "SAT 3RD OCT 2026". Diese Seite steht NICHT in `quellen[]`: Sie ist nur
  ueber http erreichbar, das Schema verlangt https, und die https-Fassung
  scheitert an einem selbstsignierten Zertifikat (Einzelheiten im
  Eintrag des Spielorts). Belegt im Sinne des Vertrags ist der Termin
  damit allein durch Rockin' Wildcat.
  ANFANGSZEIT 20:00. Das sichtbare Feld "Uhrzeit" nennt 20:00, der
  Kalenderlink dates=20261003T180000Z ebenfalls (18:00 UTC = 20:00 MESZ).
  Das JSON-LD nennt 22:00 -- der bekannte systematische Versatz dieser
  Quelle um den UTC-Abstand (ENTSCHEIDUNGEN, 2026-09-24). Das Haus
  schreibt auf der http-Seite "Einlass: 20:00", der Flyer "DOORS: 8PM".
  20 Uhr ist damit der Einlass; wann die erste Band spielt, nennt keine
  der Quellen. Im Text steht deshalb nur "ab 20 Uhr".
  ENDE: nicht gesetzt. Der Kalenderlink traegt als Ende denselben
  Zeitpunkt wie als Beginn -- keine Angabe.
  EINTRITT: `unveroeffentlicht`. Rockin' Wildcat zeigt kein Feld "Kosten",
  offers.price ist "0" und heisst bei dieser Quelle "kein Preis
  hinterlegt". Das Haus verweist fuer den Vorverkauf auf eventim-light;
  die Ticketseite antwortete am 2026-09-27 mit 403, ein Preis war dort
  nicht abzulesen. Deshalb auch kein `ticketUrl`: Die Adresse stammt nur
  von der http-Seite und liess sich nicht oeffnen.
  DJ NICHT GESETZT: Die Detailseite nennt "Record Hop", aber keinen
  Namen. "The Louisiana Wax Team" steht nur auf der http-Seite und dem
  Flyer des Hauses. `djs` bleibt deshalb leer; der Record Hop steht im
  Text.
  VERANSTALTER NICHT GESETZT: Anlass ist das 40-jaehrige Bestehen der
  Louisiana Rebs Berlin (so auf der Detailseite: "40 Jahre Louisiana
  Rebs"). Dass die Rebs den Abend auch veranstalten, legt der Text der
  http-Seite nahe ("Seit mehreren Jahrzehnten veranstalten die Lousies
  ..."), das JSON-LD von Rockin' Wildcat fuehrt als organizer aber ein
  leeres Objekt. Ohne https-Quelle bleibt das Feld leer.
  BANDS NICHT ANGELEGT: The Jets und Smokestack Lightnin' stehen in
  `lineupWeitere`. Die Detailseite nennt zu beiden nur die Websites
  (thejets.co.uk, smokestacklightnin.de); Herkunft und Geschichte
  beschreibt allein die http-Seite des Hauses. Ob Bandseiten entstehen,
  entscheidet der Mensch.
  GENRES: Die Detailseite fuehrt "Neorockabilly", "Rockabilly",
  "Roots / Americana" und "Teddyboy R'n'R". Die ersten beiden haben
  einen Lexikoneintrag, die anderen beiden nicht; sie stehen im Text.
  Nicht gefuellt: veranstalter, ticketUrl, kapazitaet, djs, ende.
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/jets-smokestack-lightnin
    titel: Jets / Smokestack Lightnin', 3. Oktober 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-27
    felder: [beginn, ort, lineupWeitere, genres, eintritt, name, aliases, kurzbeschreibung, durchfuehrung, body:termin, body:musik]
    art: aggregator
  - url: https://www.rockin-wildcat.com/rwc/guide
    titel: Berlin Gig Guide (Rockin' Wildcat)
    abgerufenAm: 2026-09-27
    felder: [beginn, ort, body:einordnung]
    art: aggregator
---

Das Konzert von The Jets und Smokestack Lightnin' im [Roadrunner's Rock & Motor Club](/locations/roadrunners-rock-motor-club/) in Berlin-Prenzlauer Berg ist für Samstag, den 3. Oktober 2026, ab 20 Uhr angekündigt. Anlass ist das 40-jährige Bestehen der Louisiana Rebs; zum Abend gehört neben den beiden Bands ein Record Hop.

## Der Termin von The Jets und Smokestack Lightnin'

Angekündigt ist der Abend im Berliner Gig Guide von Rockin' Wildcat. Die Anfangszeit steht dort nicht einheitlich — die sichtbare Angabe und der Kalendereintrag nennen 20 Uhr, die maschinenlesbaren Daten derselben Seite 22 Uhr. Dieser Eintrag folgt den 20 Uhr; die Abweichung tritt bei dieser Quelle an jedem geprüften Termin auf und geht immer in dieselbe Richtung. Wann die erste Band auf die Bühne geht, nennt die Quelle nicht.

Einen Eintrittspreis nennt der Gig Guide nicht, eine Endzeit ebenfalls nicht.

## Die Musik beim Konzert von The Jets

Die Ankündigung führt vier Stilrichtungen: [Neo-Rockabilly](/lexikon/neo-rockabilly/), [Rockabilly](/lexikon/rockabilly/), Roots und Americana sowie Teddyboy-Rock'n'Roll. Damit reicht der Abend von der britischen Spielart der Achtziger bis zu amerikanischer Wurzelmusik. The Jets und Smokestack Lightnin' stehen in diesem Register bislang als Namen im Line-up und nicht als eigene Einträge.

## Einordnung des Konzerts in Berlin

Ein Vereinsjubiläum als Anlass für ein Konzert mit zwei Bands und Plattenauflegern ist typisch für eine Szene, die sich über Clubs und Freundeskreise organisiert. Für [Berlin](/regionen/berlin/) ist es neben dem Konzert von [The Sinners im American Western Saloon](/events/the-sinners-american-western-saloon-2026-10-10/) einer der Termine, die der Gig Guide für den Oktober 2026 führt.
