---
marke: frei
titel: "Wild at Heart Berlin: 3 Termine anlegen (06.02., 12.03., 20.03.2027)"
angelegt: 2026-11-22
vorrang: 2
---

Gesehen am 2026-11-22 auf https://www.rockin-wildcat.com/rwc/guide und im
Konzertkalender des Hauses https://www.wildatheartberlin.de/concerts.php
(Herkunft: Suchlauf 2026-11-22). Vorlage für das Haus:
`events/klingonz-silvester-wild-at-heart-2026-12-31.md`.

**Abgrenzung zum offenen PR #285** (Suchlauf 2026-11-10, ungemergt): Dessen
Posten `wild-at-heart-berlin-2027-01.md` deckt 15.01., 16.01., 29.01. und
20.02.2027 ab und nennt den 06.02. ausdrücklich als „nicht in diesem
Posten". Wird #285 gemergt, gehören beide Posten zum selben Haus, aber zu
verschiedenen Terminen — nicht zusammenlegen, nicht doppelt bauen.

Dort steht:

1. **Sa 06.02.2027, Burnout Bash 3.** Gig Guide
   (`/rwc/events/burnout-bash-3`): „Sa., 6. Februar 2027, Uhrzeit 20:00",
   Country, Neorockabilly, Psychobilly, Rockabilly; „A Wild Night for
   Bruno — Live: Devil'n'Us, Blue Rockin', Roadkill Munchers — Record Hop
   w/ DJs Louie Wray & Peter". Haus: „Sa 06.02. Burnout Bash „The Devil N
   Us" (Devils Music - Berlin), „Blue Rockin" (Rockin-Boogie-Psycho-Trash
   - D), „Roadkill Munchers", aftershow mit: DJs Peter + Louie Wray".
2. **Fr 12.03.2027, South Sardinian Scum / Slackers Bunch.** Gig Guide
   (`/rwc/events/south-sardinian-scum-slackers-bunch`): „Fr., 12. März
   2027, Uhrzeit 20:00", Psychobilly. Haus: „Fr 12.03. South Sardinian
   Scum (50`s Psycho - Sardinia), Slackers Bunch (Hell-A-Billy -
   Sardinia)".
3. **Sa 20.03.2027, Andrew James SDG.** Gig Guide
   (`/rwc/events/andrew-james-sdg`): „Sa., 20. März 2027, Uhrzeit 20:00",
   Country; „Andrew James SDG alias Ski-King". Haus: „Sa 20.03. Andrew
   James SDG alias Ski-King (Country - D)".

Beim Bauen zu prüfen:

- **Jahreszahl:** Der Hauskalender nennt nur „Sa 06.02." ohne Jahr; das
  Jahr tragen der Gig Guide und der Wochentag (alle drei passen zu 2027).
- **Uhrzeit:** sichtbar im Gig Guide 20:00; `startDate` im JSON-LD sagt
  21:00 (UTC-Versatz, Leseregel). Der Hauskalender nennt keine Uhrzeit;
  `club.htm`/`info.htm` des Hauses gegenlesen, wie beim Silvestereintrag.
- **Preis:** Gig Guide ohne sichtbares Feld „Kosten" gesehen, Hauskalender
  ohne Preis — dann `eintritt: unveroeffentlicht`.
- **Szenebezug beim 20.03.:** Der Gig Guide ordnet nur „Country" zu.
  Ob das für das Register reicht (Lexikoneintrag zu Country/Western Swing
  vorhanden?), beim Bauen entscheiden; reicht es nicht, den Termin mit
  dieser Begründung zurückgeben statt ihn zu strecken.
- Bands ohne Bandseite in `lineupWeitere`. Den Gig-Guide-Text nicht
  übernehmen, selbst formulieren.
- Nicht aufgenommen: „Sa 13.03. Van Tastik (American Roots One-Man Band -
  USA)" — nur beim Haus, nicht im Gig Guide, Szenebezug unklar.
