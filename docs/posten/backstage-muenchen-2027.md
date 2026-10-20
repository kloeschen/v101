---
marke: frei
titel: "Backstage München: 2 Termine anlegen (24.04.2027 Demented Are Go, 09.05.2027 Nikki Hill)"
angelegt: 2026-10-20
vorrang: 5
---

Gesehen am 2026-10-20 auf den Terminseiten des Backstage München
(Herkunft: Suchlauf 2026-10-20, Hinweis über die Bandsintown-Termine der
Bands). Neue Quelle. Dort steht:

- https://www.backstage.eu/event/283732e4-7b61-4ccf-bbc0-afc91d029ff0 —
  „DEMENTED ARE GO - Live 2027", „PSYCHOBILLY", „Veranstalter:
  MV-Concerts", „BACKSTAGE HALLE", „Einlass: 19:00", „SAMSTAG, 24. APRIL
  2027", „Beginn: 20:00", „Tickets bei unseren Partnern erhältlich ab
  29.00€" (Eventim, Münchenticket).
- https://www.backstage.eu/event/b3207e18-a424-4d2b-ab5f-2e8cd6d6e7b4 —
  „NIKKI HILL - European Tour 2027", „ROCK, SOUL", „BACKSTAGE CLUB",
  „Einlass: 19:00", „SONNTAG, 09. MAI 2027", „Beginn: 20:00", „presented
  by Jazzhaus Artists", „NORMALPREIS 26,00 € + 3,10 € GEBÜHR".

Haus: Backstage Concerts GmbH, Reitknechtstraße 6, 80639 München (laut
Impressum/Cookie-Hinweis der Seite; im Impressum gegenlesen).

Beim Bauen prüfen:
- **Die Seite rendert per Skript (Next.js)**; curl sieht nichts. Chromium
  mit `timezoneId: 'Europe/Berlin'`. Die alte Liste
  `/veranstaltungen/live.html` ist eine 404-Seite; Suche über
  `https://www.backstage.eu/events?search=<Name>`.
- Vorlagen: `events/demented-are-go-lido-2027-01-30` und
  `events/demented-are-go-psychobilly-osterfestival-cafe-central-2027-03-28`.
  Nikki Hill hat noch keinen Eintrag; der Berliner Termin am 11.05.2027
  wartet in `OFFENE-PUNKTE.md` auf das Quasimodo — der Münchner hängt
  daran nicht, das Haus nennt Uhrzeit und Preis selbst.
- Neuer Ort Backstage München; „Halle" und „Club" sind Säle desselben
  Hauses — ein Ort, Saal im Text.
- Preise: „ab 29.00€" bei Partnern gegen „26,00 € + 3,10 € Gebühr" —
  verschiedene Angaben, nicht verrechnen (Falle „ab"-Preise).
- Zeitzone: 24.04. und 09.05.2027 liegen in der Sommerzeit, `+02:00`.
- Region `bayern` (vorhanden).
