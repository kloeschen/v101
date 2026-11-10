---
marke: frei
titel: "Wild at Heart Berlin: 4 Termine anlegen (15.01., 16.01., 29.01., 20.02.2027)"
angelegt: 2026-11-10
vorrang: 5
---

Gesehen am 2026-11-10 auf https://www.rockin-wildcat.com/rwc/guide und
im Konzertkalender des Hauses https://www.wildatheartberlin.de/concerts.php
(Herkunft: Suchlauf 2026-11-10). Vorlage für das Haus:
`events/klingonz-silvester-wild-at-heart-2026-12-31.md`.

Dort steht:

1. **Fr 15.01.2027, Eight Piece Box / Pornscars.** Nur beim Haus, nicht
   im Gig Guide: „Fr 15.01. Records Release Party on Smith & Miller
   Records, Eight Piece Box (Pure Rock`n`Roll - CH/D) feat.: members of
   Chicken Reloaded + Tex Morton, Pornscars (Garage-Punk - Berlin),
   aftershow mit: DJ Lobotomy".
2. **Sa 16.01.2027, The Zipheads.** Gig Guide
   (`/rwc/events/zipheads`): „Sa., 16. Januar 2027, Uhrzeit 20:00",
   Psychobilly, Wild at Heart, Wiener Str. 20, 10999 Berlin-Kreuzberg.
   Haus: „Sa 16.01. The Zipheads (Punkabilly - UK), +Guest, aftershow
   mit: DJ Basurilla".
3. **Fr 29.01.2027, The Blue Velvets / Romp'n'Stomp.** Gig Guide
   (`/rwc/events/blue-velvets-rompnstomp`): „Fr., 29. Januar 2027,
   Uhrzeit 20:00", Country, Rockabilly. Haus: „Fr 29.01. The Blue Velvets
   (Country Rock`n`Roll & Roots - Berlin), Romp`n`Stomp (Neo-Rockabilly -
   Berlin), aftershow mit: DJ Louie Wray".
4. **Sa 20.02.2027, Phantom Rockers / The Ripmen.** Gig Guide
   (`/rwc/events/phantom-rockers-ripmen`): „Sa., 20. Februar 2027,
   Uhrzeit 20:00", Psychobilly. Haus: „Sa 20.02. Phantom Rockers
   (Psychobilly - USA), The Ripmen (Psychobilly - D)".

Beim Bauen zu prüfen:

- **Jahreszahl:** Der Hauskalender nennt nur „Sa 16.01." ohne Jahr; das
  Jahr tragen der Gig Guide und der Wochentag (alle vier passen zu 2027).
  Beim 15.01. gibt es keinen Gig-Guide-Eintrag: Jahr nur über Wochentag
  und die Stellung in der Liste (nach „Do 31.12. WAH Silvester") — in die
  `redaktionsnotiz`, oder mit Befund zurückgeben.
- **Uhrzeit:** sichtbar im Gig Guide 20:00; `startDate` im JSON-LD sagt
  21:00 (UTC-Versatz, Leseregel). Der Hauskalender nennt keine Uhrzeit;
  `club.htm`/`info.htm` des Hauses gegenlesen, wie beim Silvestereintrag.
- **Preis:** Der Gig Guide zeigt bei allen vier kein Feld „Kosten";
  Hauskalender ohne Preis. Dann `eintritt: unveroeffentlicht`.
- Bands ohne Bandseite in `lineupWeitere`. Szenebezug beim 15.01.:
  „Pure Rock`n`Roll" (`lexikon/rocknroll`); die Pornscars sind
  Garage-Punk.
- Weitere Wild-at-Heart-Abende mit Szenebezug, nicht in diesem Posten:
  „Sa 06.02. Burnout Bash, The Devil N Us, Blue Rockin
  (Rockin-Boogie-Psycho-Trash - D), Roadkill Munchers".
