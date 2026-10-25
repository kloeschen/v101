---
marke: frei
titel: "Aufriss Mainburg (Hofstetten): 6 Boogie-Partys anlegen (08.01., 05.02., 13.03., 10.04., 07.05., 19.06.2027)"
angelegt: 2026-10-25
vorrang: 1
---

Gesehen am 2026-10-25 auf https://boogie.at/ (Listenseiten `?page=0` bis
`?page=4`) und in der Terminliste des Hauses
http://www.aufriss.net/eventtermine/ (Herkunft: Suchlauf 2026-10-25).
Folgetermine einer Reihe, von der schon ein Abend im Register steht:
Vorlage ist `events/boogie-party-aufriss-hofstetten-2026-12-12` (gleiche
DJs, gleiche Quellenlage, gleiche Falle mit der http-Liste).

Dort steht:

- **Fr. 08.01.2027, 20:00, Boogieparty** — boogie.at
  `/event/boogieparty-21`: „Fr., 08.01.2027 - 20:00", Aufriss Mainburg,
  Mainburgstrasse 8, 3202 Hofstetten. Haus: „08.01.2027 Boogie-Party,
  Beginn: 20:00 Uhr – mit DJ Pete und DJ Franz".
- **Fr. 05.02.2027, 20:00, Boogie Gschnas** — boogie.at
  `/event/boogie-gschnas-4`: „Fr., 05.02.2027 - 20:00", gleicher Ort.
  Haus: „05.02.2027 Boogie-Gschnas, Beginn: 20:00 Uhr – mit DJ Pete und
  DJ Franz". (Am Tag danach, 06.02., steht beim Haus ein „Hausgschnas"
  mit einem anderen DJ — anderer Abend, nicht Teil des Postens.)
- **Sa. 13.03.2027, 20:00, Boogieparty** — boogie.at führt den Abend
  **zweimal**, unter `/event/boogieparty-22` und `/event/boogieparty-23`,
  beide „Sa., 13.03.2027 - 20:00", gleicher Ort. Haus: „13.03.2027
  Boogie-Party, Beginn: 20:00 Uhr – mit DJ Pete und DJ Franz". Ein Termin,
  nicht zwei.
- **Sa. 10.04.2027, 20:00, Boogieparty** — boogie.at
  `/event/boogieparty-24`, gleicher Ort. Haus: „10.04.2027 Boogie-Party,
  Beginn: 20:00 Uhr – mit DJ Pete und DJ Franz".
- **Fr. 07.05.2027, 20:00, Boogieparty** — boogie.at
  `/event/boogieparty-25`: „Fr., 07.05.2027 - 20:00", **ohne Ort**
  (Eintrag am 2026-10-25 frisch angelegt). Haus: „07.05.2027
  Boogie-Party, Beginn: 20:00 Uhr – mit DJ Pete und DJ Franz".
- **Sa. 19.06.2027, 20:00, Boogieparty** — boogie.at
  `/event/boogieparty-26`: „Sa., 19.06.2027 - 20:00", Ort
  „Pielachtanzterasse, Mainburgerstrasse 8, 3202 Hofstetten". Haus:
  „**19.06.2026** Boogie-Party, Beginn: 20:00 Uhr – mit DJ Pete und DJ
  Franz", einsortiert zwischen den Terminen von Mai und Juni 2027.

Beim Bauen prüfen:
- **Die Hausliste zählt nicht als Quelle** (nur über http erreichbar,
  Falle „Aufriss Mainburg"); sie bestätigt Jahr und DJs nur in der
  `redaktionsnotiz`. Tragende Quelle ist boogie.at; Flyer auf den
  Detailseiten waren am 2026-10-25 keine zu sehen — erneut nachsehen,
  ein Flyer trägt oft Preis und DJs.
- **DJs** nennt am 2026-10-25 nur die Hausliste, nicht boogie.at. Ohne
  zitierbare Quelle `djs` leer lassen und das im Text sagen.
- **13.03.2027:** einer der beiden boogie.at-Einträge ist eine Dublette;
  beide URLs in `quellen[]` sind unnötig, eine genügt, die zweite in die
  `redaktionsnotiz`.
- **07.05.2027:** Ort nur über die Hausliste und die Reihe — trägt
  boogie.at beim Bauen weiterhin keinen Ort, den Termin zurückgeben.
- **19.06.2027:** Jahr widersprüchlich (Haus 2026, boogie.at 2027). Der
  19.06.2026 war ein Freitag und ist vorbei, der 19.06.2027 ist ein
  Samstag wie bei boogie.at — trotzdem ein Widerspruch, im Text nennen.
  Ob die „Pielachtanzterasse" derselbe Ort ist (gleiche Anschrift,
  vermutlich die Terrasse des Hauses) oder ein eigener Ort, ist am
  Haus zu prüfen; ohne Beleg den bestehenden Ort `aufriss-mainburg-hofstetten`
  verwenden und die Bezeichnung im Text nennen.
- **Eintritt:** bisher nennt keine Quelle einen Preis.
- Zeitzone: `+01:00` bis 13.03., `+02:00` ab 10.04.2027 (Sommerzeit ab
  28.03.2027).
