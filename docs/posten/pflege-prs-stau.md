---
marke: mensch
titel: "Betrieb: 25 offene Pflege-PRs seit dem 29.10. — jeder Lauf baut denselben nach"
angelegt: 2026-11-10
---

**Gefunden am 2026-11-10 (Tageslauf, nachmittags).** Seit dem 2026-10-29
ist kein Pflege-PR mehr gemergt worden (`main` steht auf #252). Offen sind
#256 bis #284 — 25 Pflege-PRs der Tagesläufe. Weil die Warteschlange
keinen freien Posten hat, liefert jeder Lauf nur noch Schritt 0 und 0b,
und weil keiner davon auf `main` landet, wiederholt jeder die Arbeit der
vorigen: `npm run archivieren` stellt bei jedem Lauf dieselben zehn
Termine um, und die Nachprüfung beginnt jedes Mal beim nächsten
überfälligen Termin — der Boogie Mix am 13.11. ist auf 17 offenen Zweigen
nachgeprüft, Guana Batz auf 7. Die Konfliktvorschau von #284 zählte 115
kollidierende Zweigpaare. Inhalts-PRs darf der Lauf nicht selbst mergen;
das ist richtig so, erzeugt aber genau diesen Stau, wenn niemand
freigibt.

Der Lauf vom 2026-11-10 nachmittags hat deshalb nur Termine nachgeprüft,
die noch auf keinem offenen Zweig angefasst waren.

**Zu entscheiden:**

- **A — Den jüngsten Pflege-PR mergen, die übrigen schließen.** #284
  (oder der jüngste zum Zeitpunkt der Entscheidung) enthält die
  Archivierung vollständig; die älteren sind überholt. Ihre gemeldeten
  Abweichungen stehen in den PR-Beschreibungen und gingen beim Schließen
  nicht verloren, müssten aber einmal gesammelt gelesen werden. Kosten:
  einmal etwa eine Stunde Sichtung.
- **B — Archivierung von der Mergegrenze ausnehmen.** Ein PR, dessen
  einzige Inhaltsänderung `durchfuehrung`/Status von `geplant` auf
  `stattgefunden` bei vergangenen Terminen ist, darf bei grüner CI selbst
  mergen (enge Ausnahme in `scripts/automerge-erlaubt.ts`, mit
  Negativtest). Nachprüfungen (`abgerufenAm`) blieben beim Menschen.
  Kosten: eine Codeänderung; lockert die Regel „Inhalt wartet auf einen
  Menschen" — deshalb hier und nicht im Lauf entschieden.
- **C — Läufe ohne freien Posten liefern keinen neuen PR,** solange ein
  älterer Pflege-PR offen ist, sondern melden nur. Kosten: Änderung am
  Prompt der Routine; Nachprüfungen bleiben dann liegen, bis jemand
  mergt.

Empfehlung des Laufs: A sofort, dazu B oder C, damit der Stau nicht
wiederkommt.
