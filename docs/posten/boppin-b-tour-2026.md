---
marke: frei
titel: "Boppin'B, Tour: 1 Termin anlegen (31.10.2026, Irish House Kaiserslautern)"
angelegt: 2026-10-11
---

Rest des Bündels vom 2026-10-04 (Herkunft: Suchlauf 2026-10-04). Die
übrigen fünf Termine (Bonn, Dortmund, Donauwörth, Künzell, Michelstadt)
sind am 2026-10-10 als Entwurf gebaut.

**Boppin'B, 31.10.2026, Irish House, Eselsfürth 11, Kaiserslautern.**
Bandsintown (https://rest.bandsintown.com/artists/id_310419/events?app_id=js_www.boppinb.de,
am 2026-10-10 noch gelistet) nennt 20:30. Ort `irish-house-kaiserslautern`
gibt es schon, Vorlage ist `events/boppin-b-irish-house-kaiserslautern-2027-03-13`.

**Befund 2026-10-10:** Das Haus hat keine erreichbare eigene Website;
Uhrzeit, Preis und Veranstalter stehen nur im Eventim-Light-Shop des
Hauses (`https://www.eventim-light.com/de/a/6141d3a4a7dca437d10f1139`).
Der antwortete am 2026-10-10 vormittags auf jeden Abruf mit Chromium
(mit und ohne `--disable-http2`, Zeitzone Europe/Berlin, 15 s Wartezeit)
nur mit „upstream request failed", auch die Startseite
`eventim-light.com/de/`; curl bekommt 403. Am selben Tag hatte ein
früherer Lauf den Shop noch erreicht. Songkick und regioactive nennen den
Termin, sind aber Sammler und tragen die Uhrzeit nicht (Falle
„Häuser ohne erreichbare eigene Seite"). Beim Bauen: zuerst den Shop
erneut abrufen und die Terminseite zum 31.10. suchen (Liste lädt beim
Scrollen nach). Ist er wieder nicht erreichbar, gilt dasselbe: nicht
bauen. Der Termin liegt nah — ist er bis zum Bau vorbei, Datei löschen.

**Befund 2026-10-11 (Nachmittagslauf, 14:45 UTC):** wieder nicht
erreichbar, jetzt mit anderem Bild. curl bekommt vom Shop ein 302 auf
einen Warteraum (`eventimlight.queue-it.net/?c=eventimlight&e=shopde…`),
dem gefolgt ein 403. Chromium (Playwright, Zeitzone Europe/Berlin, mit
und ohne `--disable-http2`, 15 s Wartezeit) bekommt für Shop und
Startseite 502 „upstream request failed". Bandsintown nennt den Termin
unverändert (2026-10-31T20:30, Irish House Kaiserslautern). Nicht
gebaut. Zweiter gescheiterter Abruf in Folge; gelingt auch der nächste
nicht, lohnt ein Blick von Markus im eigenen Browser auf die
Terminseite zum 31.10. — deren URL hier eintragen, dann kann ein Lauf
sie gezielt abrufen.
