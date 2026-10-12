---
marke: mensch
titel: "Prüfkadenz: Zeitzünder in der CI entschärfen"
angelegt: 2026-10-12
---

Vom 2026-10-10 bis zum 2026-10-12 war jede CI rot, weil Einträge durch
bloßen Zeitablauf die Prüfkadenz überschritten (ENTSCHEIDUNGEN.md,
2026-10-12). Vergangene Termine und die Nachprüfung sind inzwischen
berücksichtigt. Der Mechanismus bleibt aber: Ein künftiger Termin, den
30 Tage niemand nachprüft, macht `verify:ci` rot. Das trifft dann jeden
PR, auch einen reinen Code-PR.

Zu entscheiden ist, wie die CI damit umgeht. Drei Wege:

- **(a) Kadenz in der CI nur als Hinweis.** `--strict` blockiert sie
  nicht mehr, der Stale-Bericht und die Freigabe-Erinnerung melden sie
  weiter. Kostet: Eine überfällige Prüfung fällt nur noch dem auf, der
  den Bericht liest.
- **(b) Tageslauf Schritt 0 um die Nachprüfung erweitern.** Vor jedem
  Posten werden zuerst die überfälligen Termine nachgeprüft, so wie heute
  `archivieren` vor allem anderen läuft. Kostet: Läufe, in denen Quellen
  nicht erreichbar sind, bleiben trotzdem rot.
- **(c) Beides:** (b) als Pflicht, (a) als Netz.

Empfehlung: (c). Die Prüfung bleibt Pflicht, aber eine einzelne
unerreichbare Quelle legt nicht mehr das ganze Repository still.
