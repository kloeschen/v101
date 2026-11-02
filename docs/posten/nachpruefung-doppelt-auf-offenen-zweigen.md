---
marke: mensch
titel: "Nachprüfung (0b): Läufe prüfen dieselben Termine doppelt, solange die PRs offen liegen"
angelegt: 2026-11-02
---

Gefunden am 2026-11-02 morgens. `npm run stale` liest nur den Stand von
`main`. Eine Nachprüfung, die auf einem offenen Zweig liegt, sieht der
nächste Lauf deshalb nicht und prüft dieselben Termine noch einmal. Am
2026-11-02 meldete `npm run konflikte`, dass Aron King (7.11.) schon auf
vier offenen Zweigen nachgeprüft ist (`7smb4h`, `ozxzrz`, `we3wxk` und
dieser), Grumpynators und Boogie Mix November auf zwei (`7l9d6l` und
dieser). Jeder dieser Zweige ändert dieselbe Zeile `abgerufenAm`. Das
kostet Abrufe und erzeugt Konflikte zwischen den Zweigen. Wer als Zweiter
mergt, muss nachziehen.

Zu entscheiden ist eine Regel für 0b. Sie steht im Prompt des Laufs und
in BETRIEB.md, und beide gehören Markus.

- **A: Termine überspringen, deren Datei ein offener Zweig schon
  ändert** (wie `warteschlange:belegt` es für Posten tut). Weniger Abrufe,
  keine Konflikte. Kosten: Ein Zweig, der lange offen liegt, hält eine
  veraltete Prüfung fest. Eine Absage zwischen seinem Abruf und dem Merge
  bliebe ungesehen.
- **B: wie bisher, jeder Lauf prüft.** Die jüngste Prüfung gewinnt.
  Kosten: Doppelarbeit, und bei jedem Merge sind die Konflikte von Hand zu
  lösen.
- **C: wie A, aber nur, wenn der Zweig höchstens N Tage alt ist** (etwa
  3). Zu entscheiden wäre dann der Wert von N.

Am schnellsten wirkt keine Regel, sondern das Mergen der offenen
Pflege-PRs.
