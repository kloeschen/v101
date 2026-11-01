---
marke: frei
titel: "Wild at Heart Berlin: 4 Konzerte anlegen (15.01., 16.01., 29.01., 20.02.2027)"
angelegt: 2026-11-01
vorrang: 3
---

Gesehen am 2026-11-01 im Gig Guide von Rockin' Wildcat
(https://www.rockin-wildcat.com/rwc/guide, Detailseiten geöffnet) und im
Konzertkalender des Hauses (https://www.wildatheartberlin.de/concerts.php)
(Herkunft: Suchlauf 2026-11-01). Ort und Leseregeln stehen schon im
Register: Vorlage ist `events/grumpynators-wild-at-heart-2026-11-06`, Ort
`locations/wild-at-heart-kreuzberg`. Dort steht:

1. **Fr 15.01., Eight Piece Box** — nur beim Haus, nicht im Gig Guide:
   „Records Release Party on Smith & Miller Records ‚Eight Piece Box'
   (Pure Rock`n`Roll - CH/D) feat.: members of Chicken Reloaded + Tex
   Morton", dazu „Pornscars" (Garage-Punk - Berlin). Keine Jahreszahl,
   keine Uhrzeit. Der 15.01.2027 ist ein Freitag.
2. **Sa 16.01., The Zipheads** — Haus: „(Punkabilly - UK)" + Guest. Gig
   Guide (`/rwc/events/zipheads`): „Sa., 16. Januar 2027", „Uhrzeit
   20:00", Genre „Psychobilly".
3. **Fr 29.01., The Blue Velvets / Romp'n'Stomp** — Haus: „(Country
   Rock`n`Roll & Roots - Berlin)" und „(Neo-Rockabilly - Berlin)". Gig
   Guide (`/rwc/events/blue-velvets-rompnstomp`): „Fr., 29. Januar
   2027", „Uhrzeit 20:00", „Country Rockabilly".
4. **Sa 20.02., Phantom Rockers / The Ripmen** — Haus: „(Psychobilly -
   USA)" und „(Psychobilly - D)". Gig Guide
   (`/rwc/events/phantom-rockers-ripmen`): „Sa., 20. Februar 2027",
   „Uhrzeit 20:00", „Psychobilly".

Beim Bauen prüfen:

- **Rockin' Wildcat: drei Leseregeln.** Sichtbare Uhrzeit ist 20:00, das
  JSON-LD nennt 21:00 (Versatz, nicht übernehmen). Kein Feld „Kosten"
  gesehen: kein Preis aus `offers.price`. Kein `ende`.
- **Jahreszahl:** Der Kalender des Hauses nennt keine; für 16.01., 29.01.
  und 20.02. trägt sie der Gig Guide, für den 15.01. nur der Wochentag
  (und die Lage im Kalender zwischen Silvester und den anderen
  Januar-Terminen). Beides in die `redaktionsnotiz`. Reicht das nicht,
  den 15.01. mit Befund zurückgeben.
- **Uhrzeit am 15.01.:** Weder Haus noch Gig Guide nennen eine. Ohne
  Angabe einer Quelle zurückgeben, nicht die 20:00 der anderen Abende
  übernehmen.
- **Szenebezug:** Rock'n'Roll, Psychobilly, Neo-Rockabilly, Rockabilly
  haben Lexikoneinträge. „Punkabilly" (Haus) gegen „Psychobilly" (Gig
  Guide) bei den Zipheads: im Text beide nennen und zuordnen (Regel 5).
  Garage-Punk (Pornscars) nur im Line-up, nicht in `genres`.
- Alle Bands in `lineupWeitere`, keine Bandseiten anlegen.
- Zeitzone `+01:00`.

Verworfen in diesem Suchlauf: The Waltons am 28.11.2026 im selben Haus
(„Cowpunk", Gig Guide „Punk'n'Roll") — kein Szenebezug, siehe
ENTSCHEIDUNGEN.md vom 2026-09-27.
