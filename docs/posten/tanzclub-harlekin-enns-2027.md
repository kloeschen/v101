---
marke: frei
titel: "Tanzclub Harlekin Enns: 6 Termine anlegen (08.01., 23.01., 13.02., 13.03., 10.04., 08.05.2027)"
angelegt: 2026-11-10
vorrang: 3
---

Gesehen am 2026-11-10 auf https://boogie.at/ (Listenseiten `?page=1` bis
`?page=3`) und https://www.tanzclub-harlekin.at/veranstaltungen
(Herkunft: Suchlauf 2026-11-10). Zwei Reihen desselben Hauses, ein
Posten, weil Quelle, Ort und Leseregeln dieselben sind.

Dort steht:

1. **Boogie trifft Schlager, Fr 08.01.2027.** boogie.at
   (`/event/boogie-und-discofox`, Titel „Boogie und Discofox"):
   „Fr., 08.01.2027, 20.00 Uhr", „DJ. K.". Verein: „Boogie trifft
   schlager 📆 Freitag 08.01.2027 Boogie & Schlagerparty im Harlekin …
   DISCOFOX, SCHLAGER, OLDIES, BOOGIE, EVERGREENS….. 🕒 20:00 bis 03:00
   Uhr". Folgetermin der Reihe, Vorlage:
   `events/boogie-trifft-schlager-harlekin-enns-2027-02-05.md`.
2. **Boogie Fever 2027, Sa 23.01.2027.** boogie.at
   (`/event/boogie-fever-2027`): „Sa., 23.01.2027 - 20:00, Tanzclub
   HARLEKIN, Dragoner-Straße 4, 4470 Enns", „Mit DJ Daddy C",
   Musik: Boogie Woogie, Swing & Jump Blues, Rock'n'Roll & Rockabilly,
   Discofox & Oldies. Flyer:
   `/sites/default/files/medien/event/2026/27-01-23%20Boogie%20Fever%202027.png`.
3. **Rockin' Valentine Swing, Sa 13.02.2027.** boogie.at
   (`/event/rockin-valentine-swing`): „Sa. 13.02.2027, 20.00 Uhr",
   „DJ Daddy C". Flyer:
   `/sites/default/files/medien/event/2026/27-02-13%20Rockin%20Valentine%20Swing.png`.
4. **Rock Around Spring, Sa 13.03.2027.** boogie.at
   (`/event/rock-around-spring`): „Sa. 13.03.2027, 20.00 Uhr", „DJ Daddy C".
5. **Jukebox Boogie Party, Sa 10.04.2027.** boogie.at
   (`/event/jukebox-boogie-party`): „Sa. 10.04.2027, 20.00 Uhr",
   „DJ Daddy C".
6. **Boogie in Paradise, Sa 08.05.2027.** boogie.at
   (`/event/boogie-paradise`): „Sa. 08.05.2027, 20.00 Uhr", „DJ Daddy C".

Nicht in diesem Posten, für den nächsten: Route 66 Boogie Cruise
(12.06.2027), Boogie Beach Party (10.07.), Sea Cruise Boogie Night
(14.08.), Golden Boogie Nights (11.09.), Rockin' Halloween Boogie
(09.10.), Jump, Jive & Boogie Night (13.11.), Santa's Rock'n'Roll
Christmas (11.12.2027), alle boogie.at, DJ Daddy C. Dazu „Boogie trifft
Schlager" am 17.04. und 19.06.2027 — die stehen schon im Register.

Beim Bauen zu prüfen:

- **Widerspruch Verein gegen boogie.at.** Die Veranstaltungsseite des
  Vereins reichte am 2026-11-10 bis zum 26.02.2027, führte den 08.01.
  und den 05.02. („Boogie trifft schlager"), aber **weder den 23.01.
  noch den 13.02.**; am 22.01. steht dort „der harlekin tanzt wieder".
  Das ist ein Widerspruch, keine Lücke (Falle „Programme, die erst im
  Browser vollständig sind"). Seite vollständig laden und die
  Kalenderseite des Vereins mit öffnen. Bleibt es dabei: der Abend steht
  nur auf boogie.at, eingetragen offenbar vom DJ — im Text zuordnen, und
  `veranstalter` nur aus einer ausdrücklichen Angabe (Falle
  „Person/Organisation kann der DJ sein").
- **Flyer öffnen** (volle Größe ohne `styles/olivero_hero/public/`):
  Einlass, Beginn, Preis.
- **Zeitangabe des Vereins ist ein Textbaustein** („20:00 bis 03:00 Uhr",
  Falle „Tanzclub Harlekin"): `ende` leer lassen.
- **Tanz, nicht Musik:** „Boogie" in der Aufzählung meint den Tanz
  (`boogie-woogie-tanz`). Bei Boogie Fever nennt die Beschreibung aber
  Musikstile („BOOGIE WOOGIE – vom gemütlichen Shuffle bis zum fetzigen
  Power-Boogie", „ROCK'N'ROLL & ROCKABILLY – der … Sound") — dann ist die
  Musik gemeint; je Abend nach der Regel entscheiden.
- Ort: `locations/tanzclub-harlekin-enns` gibt es schon. Vorlage DJ Daddy C
  im Harlekin: `events/boogie-meets-golden-dance-night-harlekin-enns-2026-11-14.md`.
- Auffällig: boogie.at führt den 12.12.2026 jetzt als „Harlekin Christmas
  Boogie Night", 19.00 Uhr; im Register steht er als „Boogie meets
  Christmas Dance Revival", 20:00 (Verein: Einlass 19:00, Beginn 20:00).
  Nicht Teil dieses Postens, nur zur Kenntnis.
