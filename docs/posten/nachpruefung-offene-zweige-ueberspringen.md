---
marke: frei
titel: "Nachprüfung (0b): Termine überspringen, die ein offener Zweig schon nachgeprüft hat"
angelegt: 2026-10-25
---

Befund aus dem Lauf vom 2026-10-25 (morgens): Dieselben drei überfälligen
Termine (Long Tall Texans Weinheim, Rockabilly Convention 2027,
Rock'n'Roll Festival Ganderkesee 2027) wurden in drei Läufen hintereinander
nachgeprüft — PR #245 (2026-10-24 morgens), PR #246 (2026-10-24
nachmittags) und der Lauf vom 2026-10-25. Alle drei setzen `abgerufenAm`
in derselben Zeile derselben Quelle und kollidieren deshalb miteinander.
Solange Markus keinen davon gemergt hat, steht der Termin auf `main`
weiter als überfällig, und jeder Lauf des Tages macht die Arbeit noch
einmal.

Für Posten löst `warteschlange:naechster` genau dieses Problem über die
Git-Refs (`belegt`). Für die Nachprüfung in Schritt 0b fehlt das
Gegenstück.

Auftrag: `npm run stale` (oder ein eigener Schalter dafür) soll im
Abschnitt „Überfällige Prüfungen" Termine kennzeichnen, deren Datei ein
offener, nicht gemergter Zweig gegenüber seinem Abzweigpunkt schon mit
einem neueren `abgerufenAm` versehen hat — mit dem Namen des Zweigs, nach
derselben Ref-Logik wie `scripts/warteschlange.ts --belegt` (offline, kein
Token). Der Lauf überspringt die gekennzeichneten.

Achtung, Wechselwirkung mit der CI: Ein übersprungener Termin bleibt auf
dem neuen Zweig überfällig, und wenn die Kadenz in `verify` als Fehler
zählt, wird der Zweig rot. Vor dem Bauen nachsehen, ob die Kadenz in
`validate-content.ts` ein Fehler oder nur ein Stale-Hinweis ist. Ist sie
ein Fehler, muss die Kennzeichnung entweder auch dort greifen (eng geführt:
nur `abgerufenAm` an Terminen, nur bei einem offenen Zweig mit neuerem
Abruf), oder das ist eine Frage an Markus — dann diesen Posten auf
`mensch` stellen und die beiden Wege nebeneinanderlegen.

Negativtest und Mutationsbeleg wie üblich: ein Zweig mit neuerem
`abgerufenAm` kennzeichnet, ein Zweig ohne (oder mit älterem) nicht.
