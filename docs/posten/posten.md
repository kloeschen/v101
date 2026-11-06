---
marke: mensch
titel: "Nachprüfung (0b): 16 kommende Termine haben keine offizielle Quelle mit beginn — wie nachprüfen?"
angelegt: 2026-11-06
---

**Gefunden im Tageslauf am 2026-11-06 (Pflege, Schritt 0b).** Die
Nachprüfung zählt nur den Abruf einer Quelle mit `art: offiziell`, deren
`felder` `beginn` enthalten (`letzteNachpruefung` in
`src/lib/pruefung.ts`). Ein Abruf eines Aggregators zählt nicht. 16
kommende Termine haben aber gar keine solche Quelle. Ihren Termin trägt
allein Rockin' Wildcat oder boogie.at, die Seite des Hauses führt ihn
nicht oder ohne Datum. Schritt 0b kann sie deshalb nie erledigen. Sie
bleiben überfällig, bis die Freigabe `geprueftAm` setzt. Weil 0b „die
nächsten zuerst" nimmt, verbrauchen sie die fünf Plätze je Lauf: Am
2026-11-06 waren 4 der 7 nächsten überfälligen Termine solche Fälle.

Betroffen (Stand 2026-11-06, nicht abgeschlossen):
big-sandy-roadrunners-2026-12-18,
boogie-party-sonntagnachmittag-2026-11-21,
boogie-swing-ball-hippmann-wels-2027-01-16,
boogie-trifft-schlager-harlekin-enns-2027-02-05, -04-17, -06-19,
cat-lee-king-eiche-casino-2026-12-05,
doc-horn-hornbabes-roadrunners-2026-12-12,
dominic-moews-eiche-casino-2026-11-14,
explosion-rockets-ike-capers-roadrunners-2027-01-09,
gmundner-boogie-party-eberstalzell-2027-06-05,
gmundner-boogie-party-roitham-2027-04-03, -2027-10-23,
record-hop-rathaus-friedrichshagen-2026-11-08, -2026-12-06,
record-hop-zeesener-hof-2026-11-22.

Zu entscheiden: Was gilt bei diesen Terminen als Nachprüfung?

- **A — 0b überspringt sie, Markus prüft sie bei der Freigabe.** Der
  Stale-Bericht führt sie in einer eigenen Gruppe („nur über Freigabe
  nachprüfbar"), 0b nimmt nur Termine, die es erledigen kann.
  Kosten: kleine Skriptänderung mit Negativtest. Die Kadenz dieser
  Termine trägt dann allein Markus, wie bei Lexikon und Orten.
- **B — Enge Ausnahme: Der Aggregator zählt, wenn er die einzige Quelle
  für `beginn` ist.** Kosten: Das lockert die Regel „Absagen kündigt der
  Veranstalter an“ genau dort, wo kein Veranstalter etwas ankündigt. Eine
  Absage, die nur das Haus bekannt gibt, fiele nicht auf. Für Rockin'
  Wildcat und boogie.at belegt das Register nicht, ob die Veranstalter
  ihre Einträge dort selbst pflegen. Bei der Herbstparty der Rock Dock
  Teddys war das so; bei den Record Hops weiß es niemand.
- **C — Je Termin eine offizielle Quelle suchen und nachtragen.** Das ist
  Recherche, je Termin ein Posten. Bei mehreren gibt es keine solche
  Quelle: Das Rathaus Friedrichshagen führt die Record Hops am
  2026-11-06 wieder nicht.

Empfehlung des Laufs: A, weil sie nichts lockert. B nur für einzelne
Quellen, deren Pflege durch den Veranstalter belegt ist.

Sonderfall Archivkopie (nicht in der Liste oben):
`herbstparty-rock-dock-teddys-perchtoldsdorf-2026-11-20` hat eine
offizielle Quelle mit `beginn`, aber das ist eine Wayback-Kopie vom
2026-09-29. Ein neuer Abruf ändert ihren Inhalt nicht. Die Live-Seite ist
nur über http erreichbar und deshalb nicht zitierfähig (Schema verlangt
https). Derselbe Weg wie oben (A oder B) sollte auch diesen Fall regeln.
