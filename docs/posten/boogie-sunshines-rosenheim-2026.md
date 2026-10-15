---
marke: frei
titel: "Boogie Sunshines Rosenheim: 2 Termine anlegen (08.11.2026, 30.12.2026)"
angelegt: 2026-10-15
vorrang: 2
---

Gesehen am 2026-10-15 im Terminkalender des Vereins, https://bwcro.de/events
(Schnittstelle von „The Events Calendar":
`https://bwcro.de/wp-json/tribe/events/v1/events?start_date=2026-10-15`),
gefunden über boogie.at (`/event/vorsilvester-bei-den-boogie-sunshines-rosenheim-bayern`;
Herkunft: Suchlauf 2026-10-15). Veranstalter laut Flyern: 1. Boogie Woogie
Club Rosenheim 2000 e.V. („Boogie Sunshines Rosenheim"). Neue Quelle, Region
Bayern. Dort steht:

1. **Offenes Tanztraining der Boogie Sunshines**, So 08.11.2026,
   16:00–20:00, Gasthaus Höhensteiger. Detailseite
   https://bwcro.de/event/offenes-tanztraining-der-boogie-sunshines-5/:
   „Offenes Tanztraining der Boogie Sunshines mit DJ Opa Franz. Eintritt
   frei – Spenden erwünscht!" Flyer
   (`/wp-content/uploads/2026/08/20260821-2.jpg`): „08. November 2026 von
   16 - 20 Uhr", „Boogie Woogie - Rock'n'Roll Swing - Rockabilly Jive",
   „Gasthaus Höhensteiger, Westerndorfer Str. 101, 83024 Rosenheim".
2. **Vorsilvester Party**, Mi 30.12.2026, 19:00–23:30, Gasthaus
   Höhensteiger. Detailseite https://bwcro.de/event/vorsilvester-party/
   ohne Text, nur Flyer
   (`/wp-content/uploads/2026/10/Vorsilvester_2026-quer-V2-2.jpg`):
   „30. 12. 2026", „Beginn 19:00 Uhr", „Einlass 18:00 Uhr", „Eintritt:
   18 Euro", „DJ's Ronny & Helmut", Anmeldung per Mail, „Anmeldung ist
   erst nach Zahlungseingang gültig", Ort „Gasthof Höhensteiger,
   Westerndorfer Str. 101, 83024 Rosenheim". boogie.at nennt dasselbe
   (19:00, Einlass 18:00, 18 €, DJs Helmut und Ronny).

Beim Bauen:
- **Ort neu anlegen:** Gasthof/Gasthaus Höhensteiger — die Vereinsseite
  schreibt „Gasthaus", der Flyer „Gasthof"; Adresse aus dem Flyer bzw.
  boogie.at, besser aus einer Seite des Hauses
  (boogie.at verlinkt `http://www.gasthofhoehensteiger.de`, nur http —
  Falle „Seiten, die nur über http erreichbar sind"). Region `bayern`
  gibt es.
- **Ende:** Die Kalenderschnittstelle nennt 20:00 bzw. 23:30. Beim
  Tanztraining nennt der Flyer „16 - 20 Uhr" selbst; bei der
  Vorsilvester Party steht 23:30 nur im Kalender, nicht auf dem Flyer —
  ob das ein Vorgabewert des Plugins ist, prüfen, im Zweifel `ende`
  leer lassen.
- **Kategorie Tanztraining:** offen für alle, mit DJ, Eintritt frei —
  eher `tanzabend` als `workshop`; die Wahl in der `redaktionsnotiz`
  begründen. Die Endung `-5` der Detailseite zeigt eine Reihe; frühere
  Ausgaben sind vorbei.
- **Genres:** Tänze laut Flyer (Boogie Woogie, Rock'n'Roll, Swing, Jive)
  meinen beim Tanzabend den Tanz (Falle „Boogie Woogie an einem
  Tanzabend"); Rockabilly auf dem Flyer ist Musik. Bei der Vorsilvester
  Party nennt der Flyer keine Musikrichtung; nur „Boogie Sunshines" —
  nichts dazudichten.
- Nicht aufgenommen: „Warm-Up Party" 30.10. und „Boogie Workshop" 31.10.
  (zu nah, „Weitere Infos folgen"), „Weihnachtsfeier" 05.12. (Vereinsfeier,
  ob öffentlich ist nicht gesagt), Trainings und Kurse.
- Zeitzone `+01:00` (beide nach dem 25.10.).
