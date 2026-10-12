---
marke: mensch
titel: "Prüfkadenz: CI rot durch Zeitablauf, auch bei vergangenen Terminen"
angelegt: 2026-10-12
---

Gefunden am 2026-10-12 (PR #198). `validate:strict` in `verify:ci` lässt
Warnungen zu Fehlern werden, und die Regel `pruefkadenz`
(`scripts/validate-content.ts`) warnt ab 30 Tagen seit `geprueftAm` und
wirft ab 60 Tagen einen Fehler. Seit heute haben sechs Einträge mit
`geprueftAm: 2026-09-10` diese Grenze überschritten, und damit ist **jeder**
Zweig rot, `main` eingeschlossen. Vier dieser sechs Einträge sind vergangene
Abende (`durchfuehrung: stattgefunden`): `bella-italia-perchtoldsdorf-2026-09-11`,
`billy-childish-trainwrecks-lido-2026-09-11`,
`boogie-party-sonntagnachmittag-2026-09-20`, `walldorf-weekender-2026`. Zwei
sind geplant: `boogie-party-sonntagnachmittag-2026-10-31` und
`rocknroll-boogie-woogie-weekend-2027-01-15`.

Zu entscheiden:

1. **Sofort:** Die sechs Einträge nachprüfen und freigeben, sodass
   `geprueftAm` neu gesetzt wird. Das kann nur Markus. Kosten: einmal
   Freigabe. Die nächste Welle kommt mit jedem Freigabetag, der 30 Tage
   zurückliegt.
2. **Regel:** Soll die Kadenz für `stattgefunden` (und `abgesagt`)
   ausgesetzt werden? Bei einem vergangenen Abend kann eine Nachprüfung
   nichts mehr ändern, die Warnung erzeugt nur Freigabearbeit.
   - (a) ausnehmen: eine eng geführte Ausnahme an einem Feld eines Typs,
     mit Negativtest und Mutationsbeleg. Kosten: wenige Zeilen.
   - (b) lassen: Jede Freigabe muss auch vergangene Termine erneut
     freigeben, sonst wird `main` alle 30 Tage rot.
   - (c) die Kadenz nur außerhalb von `--strict` warnen lassen. Das wäre
     eine allgemeine Lockerung, die auch künftige Termine betrifft.

Empfehlung: zuerst 1, dann 2(a). Nach der Eskalationsregel dürfte ein
Lauf 2(a) selbst bauen. Weil die Regel aber den Freigabeprozess berührt,
gehört die Entscheidung hierher.
