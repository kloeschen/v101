---
marke: frei
titel: "Prüfzettel: ganztägige Termine zeigen eine falsche Uhrzeit (02:00 / 01:00 Uhr)"
angelegt: 2026-10-26
---

Gefunden im Tageslauf vom 2026-10-26 (PR #251). Ein Termin mit reinem
Datum, etwa `beginn: 2027-06-04` und `ganztaegig: true`, erscheint auf
dem Prüfzettel als „Fr., 04.06.2027, 02:00 Uhr“. Ganderkesee 2027 zeigt
für Beginn und Ende ebenfalls „02:00 Uhr“. Die Ursache steht in
`scripts/pruefzettel.ts`: Das YAML-Datum wird als Mitternacht UTC gelesen
(`new Date(d.beginn)`) und mit `STRUKTUR` in `site.zeitzone` formatiert,
und dieses Format schreibt immer eine Uhrzeit dazu. Im Winter stünde dort
01:00. Das gilt für `beginn` und für `ende`.

Das wiegt schwerer, als es aussieht: Der Prüfzettel ist die Stelle, an
der Markus Datum und Uhrzeit gegen die Quelle prüft (BETRIEB.md 2.5), und
er zeigt hier eine Uhrzeit, die keine Quelle nennt. Rechnet der Zettel in
einer anderen Zone als der Projektkonvention, kann sogar das Datum
kippen (Lektion 1, Zeitzonen).

Zu bauen: Bei `ganztaegig: true` oder einem Datum ohne Uhrzeit nur das
Datum ausgeben, ohne „Uhr“, und das Kalenderdatum aus dem Wert selbst
nehmen statt über eine Zonenumrechnung (wie das übrige Projekt
ganztägige Termine behandelt, steht bei `check:zeit` und in der
Event-Darstellung). Dazu ein Negativtest in `scripts/test-pruefzettel.ts`
für einen ganztägigen Termin: Es darf kein „Uhr“ erscheinen, und das
Datum muss stimmen. Den Mutationsbeleg führen, indem die Sonderbehandlung
entfernt wird, sodass genau dieser Test fällt.
