---
marke: mensch
titel: "Gasthaus Keferfeld: 2 freigegebene Termine laut boogie.at abgesagt (06.11.2026, 05.12.2026)"
angelegt: 2026-10-08
vorrang: 6
---

Gesehen am 2026-10-08 auf https://boogie.at/ (Übersicht und `?page=1`)
(Herkunft: Suchlauf 2026-10-08). Dort steht: „November Jive Night
(abgesagt)", Fr. 06.11.2026, 20.00 Uhr, und „Christmas Boogie & Swing
Night (abgesagt)", Sa. 05.12.2026, 20.00 Uhr, beide ohne Ort. Die
Detailseiten sind umgezogen: https://boogie.at/event/november-jive-night-abgesagt
und https://boogie.at/event/christmas-boogie-swing-night-abgesagt nennen
nur Titel mit „(abgesagt)", Kategorie und Datumszeile, keinen Grund und
keine Beschreibung. Die bisherigen Adressen
`https://boogie.at/event/november-jive-night` und
`https://boogie.at/event/christmas-boogie-swing-night`, die beide
Einträge als `links.website` und einzige Quelle führen, antworten mit
„Seite nicht gefunden 404".

Betroffen: `events/november-jive-night-keferfeld-2026-11-06` und
`events/christmas-boogie-swing-night-keferfeld-2026-12-05`, beide
`status: veroeffentlicht`, `durchfuehrung: geplant`. Warum `mensch`: Die
Einträge sind freigegeben; der Hook lässt keinen Lauf eine Datei mit
`status: veroeffentlicht` schreiben. Zu tun: `durchfuehrung: abgesagt`
mit `durchfuehrungHinweis` (die Quelle nennt keinen Grund — so
hinschreiben, Regel `event-zeitraum`), neue Quelle mit `durchfuehrung`
in `felder`, `links.website` auf die neue Adresse oder entfernen. Die
Seite des Gasthauses (nur http) führte schon am 2026-10-02 keinen der
beiden Abende; eine zweite Bestätigung gibt es bisher nicht.
