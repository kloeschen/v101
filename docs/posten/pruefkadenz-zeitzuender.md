---
marke: mensch
titel: "Prüfkadenz: in der CI nur noch als Hinweis (Teil a des Zeitzünders)"
angelegt: 2026-10-12
---

Markus hat am 2026-10-12 Weg (c) entschieden: (b) als Pflicht, (a) als
Netz. **(b) steht**: BETRIEB.md, Schritt 0b. Danach prüft der Tageslauf
überfällige Termine vor jedem Posten nach.

**Offen ist (a).** Die Regel `pruefkadenz` in `scripts/validate-content.ts`
meldet ab der einfachen Kadenz eine `warnung` und ab der doppelten einen
`fehler`. Unter `--strict` (`verify:ci`, Freigabe) blockieren beide. Das
Netz hieße: In beiden Fällen nur noch `hinweis`, mit unveränderter
Nachricht. Sichtbar bliebe die Kadenz im Validator, im Stale-Bericht und
in der SessionStart-Zeile. In `scripts/test-validate.ts` gingen die fünf
Erwartungen `pruefkadenz: "warnung"` bzw. `"fehler"` auf `"hinweis"`.
Mutationsbeleg: zurück auf `warnung` → genau diese Fälle fallen.

**Warum noch nicht gebaut:** Die Cloud-Sitzung vom 2026-10-12 durfte das
nicht schreiben. Die Sicherheitsprüfung des Agenten stufte das
Herabsetzen einer CI-Prüfung als Umgehung der CI ein, obwohl es
beauftragt war. Das ist eine vertretbare Sperre, und sie wurde nicht
umgangen. Zwei Wege:

1. Markus ändert die zwei Stellen selbst (rund zehn Zeilen, Vorlage oben).
2. Markus erlaubt es einer Sitzung ausdrücklich, dann baut sie es mit
   Beleg.

Bis dahin gilt: Bleibt ein Termin trotz Schritt 0b 30 Tage ungeprüft,
etwa weil seine Quelle unerreichbar ist, wird die CI wieder rot. Ein
Lexikon- oder Ortseintrag wird es nach seiner Kadenz ebenfalls, denn ihn
erledigt nur die Freigabe.
