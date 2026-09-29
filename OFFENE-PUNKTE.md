# Offene Punkte

Was ansteht, mit Begründung und Reihenfolge. Neues oben in der jeweiligen
Gruppe. Erledigtes wird gestrichen, nicht abgehakt — was erledigt ist,
steht in ENTSCHEIDUNGEN.md.

Nicht hier hinein gehört: Fehler (die gehören behoben oder in REVIEW.md),
Ideen ohne Entscheidung (die gehören in ein Gespräch), Erledigtes.

Bewusst vertagte Befunde aus dem Review stehen weiterhin in `REVIEW.md`,
Abschnitt 4 — sie werden hier nicht wiederholt, damit es nicht zwei Orte
für „nicht jetzt" gibt.

## Die Marken unter „Als Nächstes"

Seit dem 2026-09-20 nimmt sich ein täglicher unbeaufsichtigter Lauf seine
Aufgabe aus diesem Abschnitt. Damit ist er nicht mehr nur Prosa, sondern die
Eingabe eines Automaten, und jeder Posten dort trägt eine Marke:

- **`frei`** — ein Lauf darf das ohne Rückfrage bauen. Das Ergebnis ist
  immer ein Pull Request, Inhalte immer `status: entwurf`.
- **`mensch`** — gehört Markus: Ermessen, Zahlen, Semantik, oder der Posten
  liegt hinter einer Sperre (`.claude/`, `.github/`, Schema, `site.config`).

`npm run warteschlange` zeigt die Liste, `--check` scheitert bei einem
Posten ohne Marke. Es gibt bewusst **keine Voreinstellung**: Ohne Marke wäre
ein Ermessensposten entweder im Automaten oder stumm aus der Warteschlange
gefallen. Die Begründung steht im Kopf von `scripts/warteschlange.ts`.

Nur dieser Abschnitt trägt Marken. „Vor dem Go-Live" und „Später, mit
Bedingung" sind Rückstau, keine Warteschlange.

## Als Nächstes

`frei` **Haslinger Hof Kirchham, Boogie Mix: 2 Termine anlegen (13.11.2026, 11.12.2026).**
Gesehen am 2026-09-27 auf https://boogie.at/ (Seiten 0 bis 2) und der
Sammelseite https://boogie.at/event/boogie-mix-3 (Herkunft: Suchlauf
2026-09-27). Dort steht: „BOOGIE MIX", monatlich freitags 19:00, zuletzt
Fr., 13.11.2026 und Fr., 11.12.2026, Haslinger Hof, Ed 1, 94148
Kirchham, Link https://www.haslinger-hof.de; „Monatlicher Fifties Tanzmix
mit 100% Boogie Woogie, Rock'n' Roll, Rockabilly & Swing" von DJ Rockin'
Daddy. Kein Preis. Weitere Termine für 2027 stehen noch nicht dort. Beim
Bauen: Seite des Hauses öffnen und den Termin dort suchen — boogie.at ist
Kalender, nicht Veranstalter. Neue Location in Region `bayern`. Eine Reihe
mit `reihe` bietet sich an. DJ Rockin' Daddy legt auch bei der Rockabilly
Night in Pullman City (27.12.2026) auf; das ist ein eigener Fund für den
nächsten Suchlauf, nicht Teil dieses Postens. Zeitzone `+01:00`.

`frei` **Lexikon, Bündel Tanz: Rock'n'Roll-Tanz, Boogie-Woogie-Tanz, Jive.** Drei
Einträge in einem PR (Bündel-Posten seit dem 2026-09-25). Die drei gehören
zusammen: Sie grenzen sich gegeneinander und gegen Lindy Hop ab, und das
geht am besten in einem Zug. Einzelheiten je Begriff:

- **Rock'n'Roll-Tanz.** Entscheidung Markus 2026-09-25: Der Tanz
bekommt einen eigenen Eintrag neben der Musik (`lexikon/rocknroll`), nach dem
Vorbild von `lexikon/lindy-hop`. Slug `rocknroll-tanz`, Name
„Rock'n'Roll-Tanz", `kategorie: tanz`; erster Satz „Der Rock'n'Roll-Tanz
ist ein …". **Aliases:** die Schreibweisen, die auch der Musikeintrag trägt
(„Rock'n'Roll", „Rock-'n'-Roll", „Rock 'n' Roll", „Rock ’n’ Roll") — daran
erkennt der Autolink seit dem 2026-09-25 das Wort als mehrdeutig und
verlinkt es nicht mehr automatisch; weitere Namen wie „Akrobatischer
Rock'n'Roll" nur mit Quelle. `abgrenzung` gegen die Musik, gegen Lindy Hop
und gegen Boogie-Woogie als Tanz; Turnierwesen (World Rock'n'Roll
Confederation, im Musikeintrag schon genannt) mit Quelle. Im Musikeintrag
den Abgrenzungsabschnitt auf den neuen Eintrag verlinken.

- **Boogie-Woogie-Tanz.** Wie der Posten davor: Slug
`boogie-woogie-tanz`, Name „Boogie-Woogie-Tanz", `kategorie: tanz`, erster
Satz „Der Boogie-Woogie-Tanz ist ein …". Aliases „Boogie-Woogie" und
„Boogie Woogie" (die Schreibweisen des Musikeintrags). Der Musikeintrag
`lexikon/boogie-woogie` beschreibt den Tanz bisher in einem eigenen
Abschnitt samt Quellen — die dortigen Belege sind der Ausgangspunkt, der
Abschnitt wird danach auf einen Verweis gekürzt. Abgrenzung gegen die
Musik, gegen Lindy Hop und gegen den Rock'n'Roll-Tanz. Im
deutschsprachigen Raum meint das Wort fast immer den Tanz — das gehört mit
Quelle in den Text, nicht als Behauptung.
- **Jive.** Steht in fünf Texten, unter anderem bei den
Tanzkursen in Ganderkesee, und hat keinen Eintrag. Jive ist ein Tanz ohne
gleichnamige Musikrichtung, das Wort ist also nicht mehrdeutig. `kategorie: tanz`. Die Abgrenzung gegen den
Lindy Hop und gegen den Rock'n'Roll-Tanz gehört in den Text, mit Quelle;
steht der Eintrag `rocknroll-tanz` schon, dorthin verlinken.

`frei` **Lexikon, Bündel Bildwelt: Pin-up, Burlesque.** Zwei Einträge in
einem PR. Beide Wörter waren Themenseiten der früheren Domain
(`/thema/pin-up`, `/thema/burlesque`); mit der Freigabe leiten diese alten
Pfade automatisch auf die Einträge weiter (`schreibe-weiterleitungen.ts`,
gleicher Slug). Einzelheiten:

- **Pin-up.** Slug `pin-up`, `kategorie: szene` (Bildgattung und Stil, auf
den sich die Szene bezieht; trägt keine der Quellen den Begriff als
Szene, im PR begründen). `abgrenzung`: das Modell gegen die Illustration
(Elvgren, Vargas) und gegen Glamourfotografie. Quellen öffnen: Britannica,
DWDS („Pin-up-Girl"), ein Museum mit Pin-up-Sammlung.
- **Burlesque.** Slug `burlesque`. `abgrenzung`: die Burleske als
literarische und musikalische Gattung, Striptease, Varieté. „Burleske"
darf **kein** Alias werden — es ist eine andere Sache mit eigenem Wort;
der Autolink würde sonst Texte über die Gattung falsch verlinken. Quellen:
Britannica („burlesque show"), DWDS.

Danach `npm run autolink`.

`frei` **Lexikon, Bündel Muster: Polka Dots, Hahnentritt, Gingham, Nadelstreifen.**
Vier Einträge, `kategorie: mode`, in einem PR; sie grenzen sich
gegeneinander ab. Alle vier waren Themenseiten der früheren Domain und
leiten nach der Freigabe automatisch weiter (`/thema/polka-dots`,
`/thema/hahnentritt`, `/thema/gingham`, `/thema/nadelstreifen`;
`/thema/houndstooth` über den Alias „Houndstooth"). Einzelheiten:

- **Polka Dots** (`polka-dots`), Alias „Tupfen". `abgrenzung`: Streumuster;
der Name kommt vom Tanz, gemeint ist kein Tanz. „Punkte" ist ein
Allerweltswort und kein Alias (`/thema/punkte` bleibt 404).
- **Hahnentritt** (`hahnentritt`), Alias „Houndstooth". `abgrenzung`:
Pepita, Glencheck.
- **Gingham** (`gingham`), Alias „Vichykaro" nur mit Quelle. `abgrenzung`:
Madras, Tartan.
- **Nadelstreifen** (`nadelstreifen`). `abgrenzung`: Kreidestreifen — und
Pinstriping am Auto, das trotz des englischen Namens etwas anderes ist.

Quellen öffnen: DWDS, Britannica, eine Textil- oder Modesammlung (V&A,
Loschek). Danach `npm run autolink`.

`frei` **Lexikon: Teddy Boy.** Der Begriff steht in vier Texten des Registers
(unter anderem Neo-Rockabilly) und hat keinen Eintrag. Es geht um die
britische Jugendkultur der 1950er, auf die sich die Rockabilly-Szene in
Großbritannien bis heute bezieht. Quellen öffnen (Wikipedia de/en,
Vintage Rock, ein Nachschlagewerk zur Mode), Widersprüche in den Text.
`abgrenzung` gegen Rockabilly als Musik und gegen die Mods. Danach
`npm run autolink`.

`frei` **Psychobilly-Osterfestival im Café Central Weinheim.** Die Startseite
nennt „Frenzy — Psychobilly Oster Festival, Sa 27.03." und „Demented Are
Go, So 28.03." ohne Jahr (Detailseiten /konzert/frenzy/ und
/konzert/demented-are-go/). Nur anlegen, wenn eine Detailseite oder der
Ticketshop das Jahr nennt. Sonst den Posten mit genau diesem Befund
zurückgeben, nicht schätzen. Achtung Zeitzone: Am 28.03.2027 beginnt die
Sommerzeit, der Samstag hat `+01:00`, der Sonntagabend `+02:00`.

`frei` **Boogie Lions Spillern: 5 Termine anlegen (28.11.2026, 09.01.2027, 20.02.2027, 06.03.2027, 01.05.2027).**
Rest des Bündels vom 2026-09-28; der Halloween-Termin am 31.10.2026 ist
gebaut (`events/boogie-lions-halloween-spillern-2026-10-31`, Vorlage für
diese fünf, samt Reihe `boogie-lions-boogie-party` und Location
`festsaal-wiemex-spillern`). **Befund, warum sie fehlen:** Die
Veranstaltungsliste des Vereins (https://www.boogielions.at/veranstaltungen)
nennt nur Datum und Titel: „28.11.2026 - Boogie Abend mit DJ Sascha",
„09.01.2027 - Happy New Year", „20.02.2027", „06.03.2027", „01.05.2027 -
Boogieabend". Uhrzeit und Ort nennt für diese Termine nur boogie.at
(/event/boogie-party-44, /event/boogie-party-53, /event/boogie-party-56),
und jeder Abruf von boogie.at brach am 2026-09-28 aus der Arbeitsumgebung
ab (Verbindungsabbruch, WebFetch 503). 20:00 und „gleicher Saal" aus der
Gewohnheit zu übernehmen wäre geschätzt. Beim Bauen: boogie.at zuerst
öffnen; ist es wieder nicht erreichbar, den Posten liegen lassen, bis der
Verein eigene Ankündigungen veröffentlicht (er tut das etwa einen Monat
vorher). Dieselbe Hürde trifft die beiden anderen boogie.at-Posten oben.
Nebenbei gesehen, nicht im Posten: Die Vereinsliste führt am 19.12.2026
eine „Weihnachtsfeier" — ob die öffentlich ist, sagt sie nicht.
Zeitzone: alle `+01:00`, außer 01.05.2027 `+02:00`.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

## Vor dem Go-Live

**Datenschutzerklärung: zwei offene Prüfpunkte.** Impressum und Aufsicht
sind seit dem 2026-09-27 vollständig (`src/lib/rechtliches.ts`). Offen sind
noch zwei Punkte (`PRUEFEN`):
- **Log-Speicherdauer:** Wie lange speichert Netlify die Server-Logs? Die
  Datenschutzerklärung von Netlify nennt keine Frist, also beim Support
  nachfragen.
- **Akismet:** Welche Daten gehen zur Spamprüfung an Akismet? Die Doku sagt
  es nicht, ebenfalls beim Support nachfragen.

Solange ein Punkt offen ist, bricht der Build mit `PUBLIC_INDEXIERBAR=true`
ab. Vor dem Go-Live gehört ein fachkundiger Blick auf beide Texte. Sie sind
ein Entwurf, keine Rechtsberatung.

**Analytics ohne Einwilligungsbanner — Empfehlung: Netlify Web
Analytics, zum Go-Live einschalten.** Verglichen am 2026-09-29 mit
Primärquellen (Preisseiten, Doku, DSK-Orientierungshilfe Digitale Dienste,
EDSA-Leitlinien 2/2023):
- *Netlify Web Analytics:* aus den Server-Logs, kein Code im Browser, kein
  Cookie — § 25 TDDDG ist nicht berührt, kein neuer Empfänger. Misst
  Aufrufe, Besucher, Top-Seiten, Referrer und die häufigsten 404 (nützlich
  für die alten Pfade von v101.de). Füllt 30 Tage rückwirkend, zeigt
  höchstens 30 Tage. Kosten je nach Kontoart: Legacy-Plan $9 je Site und
  Monat; auf den Credit-Plänen zeigt Free nur einen Tag, Pro ab $20.
- *Plausible:* 9 im Monat, Server in Deutschland, drei Jahre Rückblick —
  aber ein Skript im Browser. Nach EDSA 2/2023 fällt das unter die
  Endgeräte-Regel, und die DSK sieht bloße Reichweitenmessung nicht per se
  als ausgenommen. Ohne Banner vertretbar, aber angreifbar; über einen
  Netlify-Proxy ungeprüft, ob die IP-Adresse durchgereicht wird.
- *Pirsch* ($6, Hetzner): dieselbe Skript-Frage, ohne Skript nur über eine
  Edge Function, die die Seite bisher nicht hat.
Zu klären, bevor es losgeht: Ist das Netlify-Konto ein Legacy- oder ein
Credit-Plan (davon hängen $9 oder $20 ab; ein Wechsel ist nicht
umkehrbar)? Reichen 30 Tage Rückblick? Die Datenschutzerklärung sagt
heute „misst keine Reichweite" — der Satz fällt dann weg, ein Absatz zur
Auswertung der Server-Logs kommt dazu, `DATENSCHUTZ_STAND` neu.

**Startschwelle prüfen.** Vor `PUBLIC_INDEXIERBAR=true`: 80+
Veranstaltungen mit Mehrzahl in der Zukunft, 5 Regionsseiten mit echter
Einordnung, 80 Lexikonbegriffe, zwei Säulen der Themenkarte vollständig.

## Später, mit Bedingung

**Lexikon-Vorrat — ein Bündel nach oben ziehen, sobald keiner der
Lexikon-Posten unter „Als Nächstes" mehr frei ist.** Recherchiert am
2026-09-29 (Startschwelle: 80 Begriffe; Stand 23). Nicht alle auf einmal:
Der Suchlauf füllt nur bis zehn freie Posten auf, und Termine gehen vor.
Je Bündel gleiche Kategorie, Abgrenzung in Klammern:
- *Genres:* Rhythm and Blues (heutiges R&B), Swing (Rhythmusgefühl,
  Western Swing, Swing-Tänze; fehlt laut ENTSCHEIDUNGEN 2026-09-23),
  Hillbilly (Country, Schimpfwort, Bluegrass).
- *Schuhe:* Saddle Shoes (Two-Tone, Budapester), Peep Toe (Slingback),
  Stiletto (Kitten Heel, das Messer), Keilabsatz (Plateausohle). Alte
  Pfade: `/thema/peep-toe`, `/thema/stiletto`, `/thema/keilabsatz`, eine
  Unterkategorie `…/saddle-shoes`.
- *Rock- und Kleidformen:* Tellerrock (Glockenrock, Petticoat), Etuikleid
  (Bleistiftrock, Wiggle Dress), Neckholder (Racerback). Alte Pfade vorhanden.
- *Wäsche:* Corsage (Korsett, Bustier, die Ansteckblume), Hüfthalter
  (vorher gegen die Aliases von `strapsguertel` prüfen), Nahtstrümpfe.
- *Frisuren:* Pompadour (Quiff, Tolle, die Tasche), Ducktail, Flat Top
  (Crew Cut, Bürstenschnitt).
- *Instrument und Klang:* Kontrabass (E-Bass), Slap-Bass (Slap am E-Bass),
  Slapback-Echo (Hall, Tape Delay).
- *Autos:* Pinstriping (Nadelstreifen am Stoff), Lowrider, Lead Sled.
- *Szene:* Halbstarke (Teddy Boys, Rocker, der Film von 1956) — an den
  Posten „Teddy Boy" anschließen.
Bewusst nicht: Personen (`/thema/elvis`), Marken (`lindy-bop`),
`/thema/country` (meinte Landhausmode). Ob `/jahrzehnt/50s` einen
Epochen-Eintrag „Fifties" bekommt, ist eine Ermessensfrage (der Autolink
würde „50er" sehr oft verlinken).

**Idee: Themen und Regionen abonnieren (Markus, 2026-09-29).** Leser
abonnieren eine Region, einen Begriff oder eine Sammlung und bekommen eine
Mail bei neuen Terminen, neuen Läden oder geänderten Einträgen. Was es
schon gibt: je Region ein Kalenderabo (`/kalender/<region>.ics`) und
`/rss.xml`. Naheliegender Weg: Feeds je Region und Sammlung erzeugen und
einen RSS-zu-Mail-Dienst daran hängen, statt selbst Mails zu verschicken.
Offen: Dienst und Kosten, Double-Opt-in und Datenschutzerklärung (eine
Mailadresse ist das erste personenbezogene Datum, das die Seite dauerhaft
hält), wie „geändert" definiert ist (Freigabe? `geprueftAm`?), Taktung
(sofort oder wöchentlich gebündelt). Voraussetzung: Go-Live und genug
Termine je Region, dass sich ein Abo lohnt.

**Oberösterreich-Texte nachziehen — sobald die BWC-Gmunden-Einträge freigegeben sind.**
Drei freigegebene Texte sagen „bisher": `locations/zorba-der-grieche-sierning`
(„bisher der einzige Ort des Registers in Oberösterreich"),
`regionen/oberoesterreich` („bisher über einen einzigen Verein") und
`events/steyrtal-boogie-party-sierning-2026-10-17` („der erste Termin").
Mit den fünf Terminen und drei Orten des BWC Gmunden (Lauf 2026-09-28,
Entwurf) stimmen die ersten beiden nicht mehr, sobald die neuen Einträge
sichtbar werden. Vorher angepasst, würden sie auf Entwürfe verweisen.

**Boppin'B-Termine verlinken — sobald sie freigegeben sind.** Die Seiten
`bands/boppin-b` (Abschnitt „Live") und `locations/cafe-central-weinheim`
nennen die Konzerte in Aschaffenburg (26.12.2026) und Weinheim (9.1.2027)
nur als Text bzw. über die Bandseite; `link-auf-entwurf` verbietet den
Link auf die Entwürfe `events/boppin-b-colos-saal-2026-12-26` und
`events/boppin-b-cafe-central-2027-01-09`. Nach der Freigabe dort
verlinken (ENTSCHEIDUNGEN, 2026-09-27).

**Durchsatz messen — ab dem 2026-10-09.** Seit dem 2026-09-25 zwei Läufe am
Tag und Bündel-Posten (bis sechs Termine, vier Begriffe). Nach zwei Wochen
zählen: freigegebene Einträge pro Woche, Inhalts-PRs pro Woche, wie viele
Bündel ganz, teilweise oder gar nicht durchkamen, Kosten pro Lauf. Daran
entscheidet sich, ob Bündelgröße oder Laufzahl nachjustiert wird. Seit dem
2026-09-29 laufen außerdem Termine morgens und Lexikon nachmittags (Weg B)
und die abendliche Freigabe-Erinnerung. Deshalb zusätzlich zählen:
Lexikon-Einträge pro Woche und die Liegezeit vom Entwurf bis zur Freigabe.
Erst danach entscheiden, ob Weg A nötig ist (drei Läufe am Tag, Suchlauf
dreimal die Woche, Obergrenze 12).

**Neun Tanz-Links umbiegen — sobald beide Tanzeinträge freigegeben sind.**
Gezählt am 2026-09-25: Diese Links zeigen auf einen Musikeintrag, meinen
aber den Tanz. Sie sind geschützt und ändern sich nicht von selbst.
`lexikon/petticoat` und `artikel/petticoat-reifrock-unterrock`
(„Rock-'n'-Roll-Tanzes"), `lexikon/lindy-hop` (Boogie-Woogie und
akrobatischer Rock'n'Roll als Nachfolgetänze, zwei Links),
`lexikon/boogie-woogie` („World Rock'n'Roll Confederation"),
`events/bella-italia-perchtoldsdorf-2026-09-11` („Boogie-Woogie-Club"),
`events/rocknroll-boogie-woogie-weekend-2027-01-15` (Tanzwochenende, zwei
Links), `regionen/niederoesterreich` („Boogie- und Rock-'n'-Roll-Abende"
der Tanzszene). Mehrdeutig und bewusst beim Musikeintrag belassen: die
Festivalnamen Ganderkesee und Walldorf, `regionen/niedersachsen`,
`locations/asb-bahnhof-barsinghausen`, der Boogie-Woogie-Link der
Rockabilly Convention. Einfach als `frei`-Posten nach oben ziehen, wenn
die Bedingung erfüllt ist.

**Suchlauf auswerten — ab dem 2026-10-21.** Seit dem 2026-09-23 füllt ein
wöchentlicher Suchlauf die Warteschlange auf höchstens zehn `frei`-Posten
auf (`docs/ablaeufe/termin-recherche.md`). Nach vier Wochen zählen: Wie
viele Posten tragen „Herkunft: Suchlauf", wie viele wurden zu einem
Eintrag, wie viele kamen zurück und warum. Führt weniger als die Hälfte zu
einem Eintrag, wird der Suchlauf abgestellt oder umgebaut (Routine
„v101 — wöchentlicher Suchlauf"), Begründung nach ENTSCHEIDUNGEN.md.

**Genres für das Ganderkesee-Festival — sobald das Line-up 2027 steht.**
Am 2026-09-23 bewusst leer gelassen: Die Seite nennt Rock 'n' Roll als
Thema, nicht als Musik der Bands, und das Wort ist zugleich ein Tanz
(Begründung in der Redaktionsnotiz des Eintrags). Mit Bands und
Stilangaben wird die Zuordnung belegbar.

**Aktualitätsbeleg als Schemafeld — nach etwa dreißig Events.** Die Regel
greift (sie hat zweimal vor einem Fehler bewahrt), aber die tragfähigen
Belege waren durchweg Nebenprodukte der Technik: Uploadpfad, Slug-Nummer,
`dateModified`, Sortierverhalten einer Liste. Kein Veranstalter sagt
selbst, für welche Ausgabe seine Angaben gelten. Ein Pflichtfeld würde
eine Systematik behaupten, die es nicht gibt. Wenn sich nach dreißig
Events wiederkehrende Belegarten zeigen, wird daraus ein Feld — vorher
nicht.

**Preisstaffeln zweidimensional — wenn achtwertige Staffeln häufig
werden.** Derzeit werden Tag und Kaufweg in die `bezeichnung` gefaltet,
maschinell nicht auswertbar. Bewusste Grenze der Schnittstelle, in
ENTSCHEIDUNGEN.md begründet.

**Subagenten für Events.** Sinnvoll bei strukturierter Extraktion aus
einer Quelle — wenig Prosa, Qualitätskontrolle durch das Schema. Nicht
sinnvoll für Lexikonartikel: dort gibt es keinen ersten Eintrag, der den
Ton setzt. Vorher belegen, dass die PostToolUse-Hooks auch bei
Schreibzugriffen aus Subagenten feuern. Agentendefinitionen gehören nach
`.claude/agents/` und müssen deshalb vom Menschen eingestellt werden.
