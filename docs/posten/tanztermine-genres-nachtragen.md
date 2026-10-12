---
marke: frei
titel: "Tanztermine: `genres` nachtragen (Rest: 12 Termine)"
angelegt: 2026-10-12
---

Rest des Postens vom 2026-10-03. Entscheidung Markus vom 2026-10-03
(ENTSCHEIDUNGEN.md, „Tänze in genres"): An Tanzabenden, Workshops und
Weekendern dürfen Tanzeinträge in `genres` stehen (`boogie-woogie-tanz`,
`rocknroll-tanz`, `jive`, `lindy-hop`); Musik (Kategorie `genre`) wie
bisher. Die Regel `genres-kategorie` prüft das, der Faktenblock zeigt
Musik und Tanz getrennt.

Erledigt am 2026-10-12 (erster PR): Hippmann Wels und Regau (4), alle elf
künftigen Abende der Boogie Lions Spillern (auch die fünf, die erst nach
dem Posten angelegt wurden und auf ihn verweisen), Boogie-Party
Sonntagnachmittag (2). Vorgehen dort als Muster: je Termin die Quelle neu
öffnen, die Quelle mit dem Zitat bekommt `genres` in `felder` und
`abgerufenAm` auf den Tag des Abrufs — dann aber auch die übrigen Felder
dieser Quelle gegenlesen —, die Redaktionsnotiz das Zitat, „genres" aus
„Nicht gefuellt" streichen.

Noch offen, je Termin gegen seine Quelle: Mödling
(`boogieball-stadtgalerie-moedling-2026-11-13`,
`rockn-boogie-tanzparty-moedling-2026-10-16`); Gmundner Boogie Party
(`gmundner-boogie-party-eberstalzell-2027-06-05`, `…-roitham-2026-10-24`,
`…-roitham-2027-04-03`, `…-roitham-2027-10-23`,
`gmundner-silvester-boogie-party-fischlham-2026-12-31`); Rock Dock Teddys
(`herbstparty-rock-dock-teddys-perchtoldsdorf-2026-11-20`,
`rock-this-christmas-perchtoldsdorf-2026-12-18`);
`steyrtal-boogie-party-sierning-2026-10-17`,
`swinging-wellness-bad-blumau-2026-11-06`,
`boogie-mix-haslinger-hof-2027-01-08`. Leseregel aus
`docs/ablaeufe/termin-recherche.md` (Falle „Boogie Woogie an einem
Tanzabend"): Tanz, außer die Quelle spricht von der Musik selbst; dann
der Musikeintrag (beim Haslinger Hof der Fall, wie bei den beiden
Vorgängerterminen). Nur eintragen, was die Quelle nennt. Ein Tanz ohne
Lexikoneintrag (Discofox, West Coast Swing, Balboa, Swing als Tanz)
bleibt im Text. Mödling (16.10.) und Steyrtal (17.10.) liegen nahe; wird
der Rest erst danach gebaut, sind sie archiviert und fallen weg.
Geändert wird Freigegebenes, also wartet der PR auf Markus.
