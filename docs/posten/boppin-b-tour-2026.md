---
marke: mensch
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

**Befund 2026-10-11 (Morgenlauf, ~04:50 UTC):** Wieder nicht erreichbar,
diesmal mit anderem Bild. curl auf die Shop-URL bekommt jetzt zuerst
`302` auf einen Queue-it-Warteraum (`eventimlight.queue-it.net/?c=eventimlight&e=shopde…`),
mit Browser-Kennung `403 Access Denied` (Akamai). Chromium (Playwright,
`--disable-http2`, Europe/Berlin, 12 s Wartezeit) erhält auf Shop,
Startseite und den Queue-it-Link `ERR_EMPTY_RESPONSE`, ohne
`--disable-http2` `ERR_HTTP2_PROTO`. Bandsintown nennt den Termin
unverändert (2026-10-31T20:30, Irish House Kaiserslautern). Nicht gebaut.
Für den nächsten Versuch: nicht morgens um 4–5 Uhr UTC allein probieren —
der erfolgreiche Abruf vom 2026-10-10 lag später am Tag.

**Befund 2026-10-11 (Mittagslauf, ~09:45 UTC):** Der empfohlene spätere
Versuch, wieder ohne Erfolg. Chromium (Playwright, Europe/Berlin, 12 s
Wartezeit) bekam auf den Shop mit und ohne `--disable-http2` `502` mit
„upstream request failed“; curl mit Browser-Kennung auf die Terminseite
vom 13.03.2027 `403 Access Denied` (Akamai), WebFetch auf den Shop `403`.
Die Startseite `eventim-light.com/de/` antwortete curl dagegen mit `200`.
Nicht gebaut. Zwei Läufe an zwei Tageszeiten sind gescheitert; liegt bis
etwa 25.10. kein Abruf vor, lohnt der Termin den Aufwand kaum noch.

**Befund 2026-10-11 (Nachmittagslauf, ~14:45 UTC):** Dritter Versuch
am selben Tag, dasselbe Bild. curl: `302` auf den Queue-it-Warteraum,
dem gefolgt `403`. Chromium (Playwright, Europe/Berlin, 15 s Wartezeit,
mit und ohne `--disable-http2`): `502` „upstream request failed" auf
Shop und Startseite. Bandsintown nennt den Termin weiter
(2026-10-31T20:30). Nicht gebaut.

**Deshalb auf `mensch` gestellt** (Nachmittagslauf 2026-10-11). Keine
Ermessensfrage, sondern eine Abrufsperre, die drei Läufe zu drei
Tageszeiten nicht überwunden haben; als `frei` nähme jeder weitere Lauf
den Posten wieder zuerst und verbrauchte sich daran. Zu entscheiden,
eine von drei Möglichkeiten:

1. **Terminseite von Hand holen** (rund zwei Minuten): den Shop
   `https://www.eventim-light.com/de/a/6141d3a4a7dca437d10f1139` im
   eigenen Browser öffnen, zum 31.10. scrollen, die URL der Terminseite
   (`…/e/<id>`) hier eintragen und `marke: frei` zurücksetzen. Ein Lauf
   kann dann gezielt diese Seite abrufen — ob das am Warteraum
   vorbeikommt, ist offen.
2. **Ohne Quelle des Hauses bauen** — nicht empfohlen: Die Uhrzeit trüge
   allein Bandsintown, und das reicht nach der Falle „Band-Websites mit
   Bandsintown-Widget" nicht (zwei von vier Abweichungen).
3. **Löschen.** Der Termin ist nah (31.10.); ein Entwurf, der erst kurz
   davor freigegeben wird, bringt wenig.
