---
marke: frei
titel: "Prüfzettel: ganztägige Termine ohne erfundene Uhrzeit anzeigen"
angelegt: 2026-10-16
---

Fund aus dem Lauf vom 2026-10-16 (PR #234, Vintage-Handlinks). Der
Prüfzettel zeigt bei ganztägigen Terminen (`ganztaegig: true`, `beginn`
und `ende` als reines Datum) eine Uhrzeit, die nirgends steht:
`events/rocknroll-festival-ganderkesee-2027` erscheint als
„Fr., 20.08.2027, 02:00 Uhr" bis „So., 22.08.2027, 02:00 Uhr".
Ursache in `scripts/pruefzettel.ts` (um Z. 112): `new Date("2027-08-20")`
ist Mitternacht UTC, `STRUKTUR` formatiert mit Stunde und Minute in
`site.zeitzone`, also 02:00 Sommerzeit. Die Seite selbst ist richtig
(„20. August 2027", JSON-LD `startDate` ohne Uhrzeit), falsch ist nur der
Zettel. Das ist genau das Feld, das Markus auf dem Zettel liest:
Datum und Uhrzeit gegen die Quelle. Betroffen sind derzeit drei Termine
mit `ganztaegig: true`.

Zu bauen: Bei ganztägigen Terminen (oder `beginn` ohne Uhrzeitanteil)
nur das Datum formatieren, ohne „Uhr", und das Datum ohne Umrechnung
aus dem Wert lesen (Zeitzonenregel, Lektion 1; `npm run check:zeit`).
Negativtest in den Tests des Prüfzettels: ein ganztägiger Termin darf
keine Uhrzeit tragen, ein Termin mit Uhrzeit muss sie weiter tragen
(Lebenszeichen). Mutationsbeleg: Die Sonderbehandlung entfernen, genau
die neue Prüfung fällt. Reiner Code-PR.
