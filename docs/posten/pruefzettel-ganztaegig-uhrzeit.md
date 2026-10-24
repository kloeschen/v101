---
marke: frei
titel: "Prüfzettel: ganztägige Termine zeigen 02:00 Uhr statt nur des Datums"
angelegt: 2026-10-24
---

Gefunden im Lauf vom 2026-10-24 (PR #245). `npm run pruefzettel` zeigt
bei ganztägigen Terminen mit reinem Datum (`beginn: 2027-06-04`,
`ganztaegig: true`) die Zeile „Fr., 04.06.2027, 02:00 Uhr", ebenso beim
`ende`. Betroffen in #245: Rockabilly Convention 2027 und Rock'n'Roll
Festival Ganderkesee 2027.

Ursache, soweit gelesen: `scripts/pruefzettel.ts` (`zettelFuer`) macht
aus dem Wert `new Date(d.beginn)`; ein reines Datum wird als UTC-
Mitternacht gelesen und von `STRUKTUR` (mit Uhrzeit, `site.zeitzone`) als
02:00 Sommerzeit ausgegeben. Das ist Regel 1 (Datum ohne explizite
Zeitzone) an einer Stelle, die `check:zeit` offenbar nicht erfasst.

Gerade der Zettel ist das, was Markus vor allem auf Datum und Uhrzeit
liest — eine erfundene Uhrzeit dort ist genau die Sorte Fehler, die er
fangen soll. Ziel: Bei reinem Datum oder `ganztaegig: true` nur Wochentag
und Datum ausgeben (ggf. „ganztägig"). Beleg: Negativtest in den Tests
des Prüfzettels mit einem ganztägigen Termin, der ohne die Korrektur
„02:00" (bzw. eine Uhrzeit) zeigt; Mutationsbeleg. Zusätzlich prüfen, ob
`check:zeit` diese Stelle hätte melden müssen, und wenn ja, warum nicht.
