---
marke: frei
titel: "Berlin, Rockin' Wildcat: 6 Termine anlegen (14.11., 04.12., 05.12., 12.12., 18.12., 23.12.2026)"
angelegt: 2026-10-11
vorrang: 5
---

Gesehen am 2026-10-11 im Gig Guide https://www.rockin-wildcat.com/rwc/guide
und auf den Detailseiten (Adresse jeweils aus `offers.url` des JSON-LD;
Herkunft: Suchlauf 2026-10-11). Dort steht, sichtbar auf der Detailseite:

1. **Dominic Moews**, Sa., 14. November 2026, 20:00, Eiche Casino,
   Wendenschloßstr. 6, 12559 Berlin–Köpenick; Stil „50s Rock'n'Roll,
   Rockabilly“; „Record Hop w/ DJ Mattie Moore“; kein Feld „Kosten“.
   `/rwc/events/dominic-moews-2`
2. **Record Hop**, Fr., 4. Dezember 2026, 22:00, Kino Union, Bölschestr.
   69, 12587 Berlin-Friedrichshagen; „50s Rock'n'Roll, Jump & Jive,
   Rhythm'n'Blues, Rockabilly“; „DJs DJ Hari-Bo & Johnny Burnette“; kein
   Feld „Kosten“. `/rwc/events/record-hop-68`
3. **Cat Lee King and his Cocks**, Sa., 5. Dezember 2026, 20:00, Eiche
   Casino (wie oben); „50s Rock'n'Roll, Blues, Jump & Jive,
   Rhythm'n'Blues“; kein Feld „Kosten“.
   `/rwc/events/cat-lee-king-and-his-cocks`
4. **Doc Horn & The Hornbabes**, Sa., 12. Dezember 2026, 20:00,
   Roadrunner's Rock & Motor Club, Saarbrücker Str. 24, 10405
   Berlin-Prenzlauer Berg; „50s Rock'n'Roll, Jump & Jive“; kein Feld
   „Kosten“. `/rwc/events/doc-horn-the-hornbabes-4`
5. **Big Sandy & the Fly-Rite Boys / Round Up Boys**, Fr., 18. Dezember
   2026, 20:00, Roadrunner's (wie oben); „50s Rock'n'Roll, Country,
   Rockabilly“; „Record Hop w/ DJ Don Arnoldo“; kein Feld „Kosten“.
   `/rwc/events/big-sandy-the-fly-rite-boys-round-up-boys`
6. **La Mafia del Baile / Fastlane Drifters**, Mi., 23. Dezember 2026,
   21:00, Frannz, Schönhauser Allee 36, 10435 Berlin-Prenzlauer Berg;
   „Psychobilly, Punk'n'Roll“; „Kosten 15,00 €“; „Record Hop w/ DJ
   Hari-Bo“. `/rwc/events/la-mafia-del-baile-fastlane-drifters`

Beim Bauen:
- **Drei Leseregeln des Gig Guides** (Fallen): sichtbare Uhrzeit, nie
  `startDate` — am 2026-10-11 stand für Dominic Moews im JSON-LD 21:00,
  sichtbar 20:00; „Kosten“ entscheidet über den Preis; kein `ende`.
- **Gegen das Haus lesen** (Falle „Rockin' Wildcat gegen das Haus“).
  Eiche Casino: `https://www.eichecasino.de/` lieferte am 2026-10-11 ein
  abgelaufenes Zertifikat, die http-Fassung zeigte auf der Startseite
  keinen der beiden Abende (Falle „Seiten, die nur über http erreichbar
  sind“). Roadrunner's: dieselbe Lage wie bisher, Vorlage
  `events/jets-smokestack-lightnin-roadrunners-2026-10-03`. Kino Union
  (`https://www.kino-union.de/`) und Frannz (`https://frannz.eu/`)
  antworteten, nannten die Abende auf der Startseite aber nicht —
  Programmseiten suchen. Weicht das Haus ab, folgt der Eintrag dem Haus.
- **Neue Orte:** Eiche Casino, Kino Union und Frannz stehen noch nicht
  in `src/content/locations/`; `roadrunners-rock-motor-club` gibt es.
- **Record Hop** im Kino Union ist nicht die Reihe im Rathaus
  Friedrichshagen (andere DJs, anderer Ort, gleiche Straße). Nicht als
  Folgetermin führen, ohne dass eine Quelle das trägt.
- „Record Hop w/ DJ …“ bei den Konzerten ist der DJ, kein eigener Termin.
- Bands in `lineupWeitere`, keine Bandseiten anlegen. Zeitzone `+01:00`.
- Der Gig Guide führt außerdem Explosion Rockets / Ike & the Capers am
  09.01.2027 im Roadrunner's (`/rwc/events/explosion-rockets-ike-the-capers`)
  — der siebte Termin, nicht in diesem Posten; der nächste Suchlauf
  nimmt ihn auf. Nicht aufgenommen: Waltons (28.11., siehe
  ENTSCHEIDUNGEN 2026-09-27) und Nikki Hill (Bedingung in
  OFFENE-PUNKTE.md).
