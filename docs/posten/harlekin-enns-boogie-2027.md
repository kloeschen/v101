---
marke: frei
titel: "Tanzclub Harlekin Enns: 3 Termine anlegen (08.01.2027, 23.01.2027, 13.02.2027)"
angelegt: 2026-10-18
vorrang: 3
---

Gesehen am 2026-10-18 auf https://www.tanzclub-harlekin.at/veranstaltungen
und boogie.at (Herkunft: Suchlauf 2026-10-18). Dort steht:

- **Fr 08.01.2027, Boogie trifft Schlager** (Verein): „Boogie trifft
  schlager 📆 Freitag 08.01.2027 im großem Saal mit DJ Klaus & DJ Walter
  Boogie & Schlagerparty im Harlekin", darunter der Textbaustein „DISCOFOX,
  SCHLAGER, OLDIES, BOOGIE, EVERGREENS … 20:00 bis 03:00 Uhr". boogie.at
  führt diesen Abend **nicht**; dort steht stattdessen „Harlekin, Sa.,
  09.01.2027 - 20:00" (`/event/harlekin-5`, nur „Einlass: 19:00 Uhr
  Beginn: 20:00 Uhr"), während der Verein für den 09.01. nur „der
  harlekin tanzt wieder" nennt.
- **Sa 23.01.2027, Harlekin Boogie Fever 2027** (Verein): „harlekin
  boogie fever 2027 📅 Samstag, 23. Jänner 2027 🕒 20:00 bis 03:00 Uhr im
  großen Saal mit DJ Daddy C DIE ERSTE GROSSE BOOGIE-PARTY IM NEUEN
  JAHR! 🎟 Eintritt: € 7,– 🔞 Zutritt ab 18 Jahren". Auf boogie.at nicht
  gefunden.
- **Sa 13.02.2027, Harlekin Rockin' Valentine Swing** (Verein):
  „Samstag, 13. Februar 2027 🕒 20:00 bis 03:00 Uhr im großen Saal mit
  DJ Daddy C GROSSE BOOGIE-PARTY mit vielen anderen Stilen und
  Musikwünschen 🎟 Eintritt: € 7,–". boogie.at: „Harlekin, Sa.,
  13.02.2027 - 20:00" ohne weiteren Text.

Beim Bauen prüfen:
- Vorlagen: `events/boogie-trifft-schlager-harlekin-enns-2027-02-05`
  (Reihe `harlekin-boogie-trifft-schlager`) für den 08.01.;
  `events/boogie-meets-golden-dance-night-harlekin-enns-2026-11-14`
  (Reihe `harlekin-boogie-meets`, DJ Daddy C) für die beiden anderen —
  ob „Boogie Fever" und „Rockin' Valentine Swing" zur Reihe „Boogie
  meets" gehören, sagt die Seite nicht; nur mit Beleg zuordnen.
- 08.01. gegen 09.01.: Verein und boogie.at widersprechen sich im Datum.
  Ein strittiges Datum geht an den Menschen zurück (Falle „boogie.at
  gegen die Vereinsseite"), außer eine dritte Angabe (Flyer, Facebook
  des Vereins) entscheidet es.
- Zeitangabe „20:00 bis 03:00" ist beim 08.01. der Textbaustein (Falle
  „Tanzclub Harlekin"): `ende` leer lassen. Beim 23.01. und 13.02. steht
  sie im eigenen Block des Abends.
- 23.01.2027 und 13.02.2027 sind Samstage, 08.01.2027 ein Freitag.
- Genre nach der Regel „Boogie Woogie an einem Tanzabend meint den
  Tanz": `boogie-woogie-tanz`.
