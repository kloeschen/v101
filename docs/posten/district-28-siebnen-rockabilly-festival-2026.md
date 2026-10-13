---
marke: frei
titel: "District 28 Siebnen (CH), 12. Rockabilly/Rock'n'Roll Festival: 1 Termin anlegen (28.11.2026)"
angelegt: 2026-10-13
vorrang: 1
---

Gesehen am 2026-10-13 auf https://www.district28.ch/ (Programm auf der
Startseite; Herkunft: Suchlauf 2026-10-13). Gefunden über die Seite von
Luzern Tourismus (`luzern.com/de/event/12-rockabilly/rocknroll-festival-2026`,
Daten von Guidle). Dort steht:

- **28.11.2026: 12. Rockabilly/Rock'n'Roll Festival** — „RESTLESS (UK),
  RED HOT ROCKETS (UK), THE GO GETTERS (SE), LOUIE & THE WOLF GANG (CH) &
  DJ ROCKIN' RUEDI (CH) Rockabilly/Rock'n'Roll“, Link „Vorverkauf“ auf
  Ticketino. Keine Uhrzeit, kein Preis auf der Startseite.
- Ticketino (`https://www.ticketino.com/de/Event/12-Rockabilly-Rock-n-Roll-Festival-2026/217449`):
  „4 Bands auf 2 Bühnen“, „Türöffnung 18:00 Beginn 18:00 Ende So
  29.11.2026, 02:00“, District 28, Fabrikstrasse 28, 8854 Siebnen,
  Schweiz. Die Preistabelle lädt per Skript, im Rohtext kein Betrag.
- Luzern Tourismus nennt „38.00 CHF“ — ein Sammler, als Preis nur mit
  einer Quelle des Hauses oder von Ticketino verwenden.
- Restless ist dort als „Exclusive Swiss Show 2026“ angekündigt.

Beim Bauen:
- **Erster Termin in der Schweiz.** Region und Ort fehlen: Siebnen liegt
  im Kanton Schwyz. Das Schema kennt `land: CH`, aber keine Ebene
  „Kanton“ (`land`, `bundesland`, `metropolregion`, `stadt`). Ob ein
  Kanton als `bundesland` geführt wird, ist eine Semantikfrage — ist sie
  nicht schon in ENTSCHEIDUNGEN.md beantwortet, den Posten mit genau
  dieser Frage zurückgeben, nicht selbst festlegen.
- Zeitzone `+01:00` (Europe/Zurich, Winterzeit). Ende laut Ticketino
  02:00 am Folgetag; ob das ein Vorgabewert des Portals ist, prüfen
  (Falle „Rockin' Wildcat: drei Leseregeln“ sinngemäß) — ohne zweite
  Angabe des Hauses kein `ende`.
- Preis aus der gerenderten Ticketino-Seite (Browser, Zeitzone
  Europe/Zurich) oder vom Haus; Ticketino ist `aggregator`, das Haus
  `offiziell`. Währung CHF.
- Veranstalter: Die Seite des Hauses und Ticketino („Website des
  Veranstalters“) nennen ihn nicht ausdrücklich — `veranstalter` nur aus
  einer Angabe, die es sagt.
- Alle fünf Acts in `lineupWeitere`, keine Bandseiten anlegen.
- „12.“ heißt: Es gab elf Ausgaben vorher. Ob es eine Reihe im Register
  werden soll, entscheidet der Mensch; hier nur der Termin.
