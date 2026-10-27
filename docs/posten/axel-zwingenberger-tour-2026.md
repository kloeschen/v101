---
marke: frei
titel: "Axel Zwingenberger, Tourdaten: 6 Termine anlegen (19.11., 20.11., 21.11., 02.12., 20.12., 23.12.2026)"
angelegt: 2026-10-27
vorrang: 1
---

Gesehen am 2026-10-27 auf https://www.boogiewoogie.net/tour, der Tourseite
des Boogie-Woogie-Pianisten Axel Zwingenberger (Herkunft: Suchlauf
2026-10-27). Die Liste lädt erst im Browser vollständig; curl sieht nur
den Seitenrahmen. Szenebezug über `lexikon/boogie-woogie` (Klavierstil,
nicht der Tanz). Dort steht:

1. **19.11.26, Do, 19:30**, Mönchengladbach: „Axel Zwingenberger & Joja
   Wendt — Boogie Woogie Legends", Theater im Gründungshaus, Eickener
   Straße 88, 41061 Mönchengladbach. Ticketlink auf Eventim.
2. **20.11.26, Fr, 19:30**, Leverkusen: „Axel Zwingenberger & Joja Wendt —
   Boogie Woogie Legends", Bayer Erholungshaus, Nobelstraße 37, 51373
   Leverkusen. Ticketlink auf Regioactive.
3. **21.11.26, Sa, 20:00**, Traun (AT): „Stars Of Boogie Woogie",
   Spinnerei, Obere Dorfstraße 5, 4050 Traun. Ticketlink auf
   `spinnerei.kulturpark.at`.
4. **02.12.26, Mi, 20:00**, Hamburg: „Axel Zwingenberger solo —
   Boogie Woogie-Piano Solo", Alma Hoppes Lustspielhaus, Ludolfstraße 53,
   20249 Hamburg.
5. **20.12.26, So, 20:00**, München: „Axel Zwingenberger solo —
   Boogie Woogie-Piano Solo", Lustspielhaus München, Occamstraße 8,
   80802 München.
6. **23.12.26, Mi, 20:00**, Wien (AT): „Axel Zwingenberger solo —
   Boogie Woogie-Piano Solo", Stadtsaal Wien, Mariahilfer Str. 81,
   1060 Wien. Ticketlink auf oeticket („Boogie for Real").

Schon im Suchlauf gegengelesen: Die Spinnerei Traun führt den 21.11. selbst
(`/programm/veranstaltung-details/?id=3398`): „Stars of Boogie Woogie mit
Daniel Ecklbauer", Sa. 21.11., 20:00, Großer Saal, Vorverkauf € 40,00
(erm. € 38,00), Abendkassa € 42,00 (erm. € 40,00). Zwingenberger spielt im
ersten Teil mit Richie Loidl und Clemens Vogler; weiter genannt sind
Christoph Steinbach, Philipp Kopmajer und Gernot Haslauer. Für Traun ist
die Seite des Hauses also die Hauptquelle, nicht die Tourseite.

Beim Bauen prüfen:

- **Jedes Haus einzeln öffnen**, Uhrzeit und Preis folgen dem Haus
  (Falle „Rockin' Wildcat gegen das Haus" gilt sinngemäß für Tourseiten).
  Die Tourseite nennt nur eine Uhrzeit, ohne Einlass, und keinen Preis.
- **Abrufhürden:** Das Lustspielhaus München zeigte am 2026-10-27 eine
  Cloudflare-Prüfseite („Sicherheitsüberprüfung wird durchgeführt"), auch
  im Browser; erst mit `xvfb-run` versuchen (Falle „Häuser ohne erreichbare
  eigene Seite"). Eventim und Regioactive sind aus der Cloud unzuverlässig
  bzw. antworten Skripten mit 403. Der Stadtsaal Wien führt den Abend auf
  der Startseite nicht verlinkt; im Spielplan suchen. Die Ticketseite bei
  Alma Hoppe (`almahoppe.de/Tickets?id=207875`) zeigte ohne Skript nur die
  Kassenzeiten.
- **Joja Wendt** und die Mitwirkenden in Traun haben keine Bandseite:
  `lineupWeitere`, keine neuen Bandseiten (CLAUDE.md). Ob Axel
  Zwingenberger eine eigene Seite bekommt, entscheidet Markus — bis dahin
  ebenfalls `lineupWeitere`.
- **Alle sechs Häuser sind als Orte neu**, ebenso die Regionen
  Nordrhein-Westfalen und Hamburg, falls noch nicht vorhanden. Adresse nur
  aus einer Quelle, die sie nennt.
- Zeitzone durchgehend `+01:00` (nach dem Ende der Sommerzeit).
- Ist ein Termin bis zum Bau nicht mehr mindestens einige Tage entfernt
  oder führt das Haus ihn nicht, diesen Termin mit Befund zurückgeben,
  nicht aus der Tourseite allein bauen.

Nicht in diesen Posten aufgenommen: 28.10. Baden-Baden, 01.11. Bremen
(zwei Konzerte) und 06.11. Hamburg (Friedrich-Ebert-Halle) liegen vor der
21-Tage-Grenze.

**Nicht verwechseln:** boogie.at führt am 19.12.2026, 19:30, in der Burg
Perchtoldsdorf ein Konzert „Axel Zeingenber & Michael Pewny" („Christmas
Piano Boogie Woogie Dream", `/event/axel-zeingenber-michael-pewny`). Die
Tourseite von Axel Zwingenberger nennt diesen Abend nicht, der
Veranstaltungskalender der Burg (Gemeinde Perchtoldsdorf) ebenfalls nicht
(Dezember dort bis 15.12.). Er gehört nicht in diesen Posten.
