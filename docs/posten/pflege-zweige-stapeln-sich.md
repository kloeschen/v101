---
marke: mensch
titel: "Pflege-PRs stapeln sich: 13 offene Zweige archivieren und prüfen dieselben Termine nach"
angelegt: 2026-11-26
---

**Gefunden am 2026-11-26 (Tageslauf, vormittags).** Seit dem 2026-11-19
liegt kein freier Posten mehr vor, der nicht schon auf einem offenen
Zweig steht. Jeder Lauf macht deshalb nur Schritt 0/0b: `archivieren`
(heute dieselben 23 Termine wie in den Zweigen vom 24. und 25.11.) und
die Nachprüfung der nächsten überfälligen Termine. Weil keiner dieser
Inhalts-PRs gemergt wird, sieht jeder Lauf dieselben Termine als
überfällig an. `npm run konflikte` meldet am 2026-11-26 15 offene Zweige
und 31 paarweise Kollisionen, fast alle an denselben fünf Terminen
(Regau 05.12., Guana Batz 05.12., Boogie Mix 11.12., Boogielicious
12.12., Boppin'B Colos-Saal 26.12.).

Zu entscheiden: Wie soll das künftig laufen?

- **A — Markus mergt den jüngsten Pflege-PR und schließt die älteren.**
  Keine Codeänderung. Kostet einmalig ein paar Minuten; das Stapeln
  beginnt neu, sobald wieder mehrere Tage lang nichts gemergt wird.
- **B — Automerge für reine Pflege-Diffs.** `automerge:erlaubt` lässt
  einen Inhalts-PR durch, wenn sich nur `durchfuehrung: geplant →
  stattgefunden` und `abgerufenAm` geändert haben (enge Ausnahme mit
  Negativtest). Kosten: eine Codeänderung an der Auto-Merge-Grenze. Die
  steht in BETRIEB.md als bewusste Regel („alles unter `src/content/`
  wartet auf einen Menschen"), deshalb nicht im Lauf entschieden.
- **C — 0b überspringt Termine, die ein offener Zweig schon
  nachgeprüft hat**, so wie `warteschlange:naechster` Posten überspringt.
  Kosten: Codeänderung in `stale-report.ts`. Das Stapeln selbst bleibt
  dann bestehen, nur mit weniger Kollisionen.

Empfehlung des Laufs: A sofort, dazu B.
