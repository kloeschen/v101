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

`frei` **Artikel: Pillar „Der Rockabilly-Look" (Säule `mode`).**
Entscheidung Markus, 2026-10-01 (Pillar) und 2026-10-03 (frei). Vorschlag
A6 der PAA-Recherche (`docs/daten/paa-rockabilly-2026-10-01/`). `typ:
pillar`, Vorlage `src/content/artikel/_golden-example.md` und der Pillar
`artikel/hot-rod-und-kustom-kulture`. Beantwortet die meistgestellte Frage
zum Look, „Welcher Rock gehört zur Rockabilly-Szene?" (23 Treffer), dazu
„Was sollte man im Rockabilly-Stil anziehen?" (5), Rockabilly-Look/-Style
(3+3), Dresscode Polka Dots (6), Dresscode Vintage (6), „Wie zieht man
sich Vintage an?" (11). Die Fragen sind Themen, keine Quelle. Spokes per
`gehoertZu` darunter: `artikel/petticoat-reifrock-unterrock` (deren
Redaktionsnotiz wartet darauf) und `artikel/petticoat-tragen`. Verlinkt
die Lexikoneinträge der Säule (Petticoat, Bleistiftrock, Polka Dots,
Gingham, Creepers, Pin-up, Taillenmieder …). Ein Pillar beschreibt, er
schreibt nichts vor: Was „dazugehört", wird über Quellen zur Szene belegt,
nicht gesetzt. Achtung: Links auf Entwürfe (`pompadour`, `vintage`)
lassen den Artikel bei der Freigabe durchfallen, bis die Ziele mit
freigegeben sind (`link-auf-entwurf`). Also im Text verlinken, nur wenn
beide zusammen freigegeben werden sollen, und das im PR sagen.

`frei` **Artikel A4: Rockabilly oder Rock'n'Roll? (vergleich, Säule
`musik`).** Entscheidung Markus, 2026-10-03. Hauptentität
`lexikon/rockabilly`, Ausgangspunkt dessen `abgrenzung`. PAA-Fragen:
Unterschied Rockabilly/Rock'n'Roll (18), Welche Musikrichtung ist
Rockabilly? (13). Nicht doppeln: „Welcher Jahrgang ist Rockabilly?" und
„Ist Rockabilly 70er?" beantwortet seit dem 2026-10-02 die FAQ von
`lexikon/rockabilly`; der Artikel verlinkt dorthin, statt sie zu
wiederholen. Quellen zur Musikgeschichte (Nachschlagewerke, Britannica,
Fachliteratur), Widersprüche in den Text (Regel 5). Keine Songtexte.

`frei` **Artikel A7: Rockabilly-Frisuren (liste, Säule `frisur`).**
Entscheidung Markus, 2026-10-03. Fragen: Rockabilly-Frisur (2+1),
Pompadour (8+4+2+1), Elvis-Frisur. Baut auf den Lexikon-Entwürfen
`pompadour`, `ducktail`, `flat-top` und `teddy-boy` auf (seit dem
2026-10-02, noch nicht freigegeben). Die Liste beschreibt die Frisuren
knapp und verweist auf die Lexikoneinträge. Damenfrisuren der Szene
(Victory Rolls, Pin Curls, Bettie-Page-Pony u. a.) nur mit Quelle; jede
Zuordnung „gehört zum Rockabilly-Look" braucht einen Beleg aus der Szene,
nicht aus Händlertexten allein. Achtung `link-auf-entwurf`: Der Artikel
lässt sich erst zusammen mit den vier Lexikoneinträgen freigeben; das
im PR sagen. Die Widersprüche aus den Lexikoneinträgen (Pompadour und
Madame de Pompadour, Erfinder des Ducktail) nicht neu entscheiden,
sondern übernehmen, wie sie dort zugeordnet sind.

`mensch` **Nachprüfung kurz vor dem Termin löscht den Stale-Posten nicht.**
Fund vom 2026-10-02: Boppin'B Barsinghausen (03.10.) wurde um 11:58 UTC
gegen die Quelle nachgeprüft (Redaktionsnotiz, `abgerufenAm` 2026-10-02),
`geprueftAm` blieb aber auf 2026-09-23 — auf freigegebenen Einträgen hat
das Feld bisher nur die Freigabe geändert. `stale` meldet den Termin
deshalb weiter als dringendsten Posten, und der Nachmittagslauf hat die
Quelle ein zweites Mal geöffnet (unverändert). Das trifft jeden Lauf mit
leerer Warteschlange, solange ein nachgeprüfter Termin im
14-Tage-Fenster liegt. Zu entscheiden: (1) Ein Lauf darf `geprueftAm`
eines freigegebenen Termins bei einer Nachprüfung setzen — einfach, aber
das Feld hieße dann nicht mehr „von Markus geprüft"; (2) `stale-report`
rechnet „termin-naht" vom jüngsten `abgerufenAm` einer `offiziell`-Quelle
mit `beginn` in `felder` — kein Schemaeingriff, ein Test plus Mutation,
die Freigabesemantik bleibt; (3) lassen — kostet höchstens einen leeren
Lauf pro Termin, solange die Warteschlange leer ist. Empfehlung: (2). Nachtrag
2026-10-03: Der Morgenlauf bekam Boppin'B am Konzerttag zum dritten Mal
als dringendsten Posten; die Ankündigung war unverändert (keine Absage),
der Lauf hat deshalb nichts eingetragen und den nächsten Stale-Posten
(The Sinners, 10.10.) nachgeprüft. Ab jetzt steht auch The Sinners
trotz Nachprüfung bis zum 10.10. in `stale` — bei drei Läufen am Tag
summiert sich (3) auf mehrere Doppelabrufe pro Termin.

`mensch` **Vintage freigeben.** Der Eintrag `lexikon/vintage` liegt seit
dem 2026-10-02 als Entwurf vor. Die Autolink-Frage ist entschieden
(Markus, 2026-10-02): „Vintage" wird nur von Hand verlinkt
(`NUR_VON_HAND` in `src/lib/links.ts`, ENTSCHEIDUNGEN.md). Nach der Freigabe
setzt ein Lauf die passenden Handlinks. Das sind die sieben Stellen, die in
der Simulation den Stil meinten (Vintage-Mode, -Garderobe, -Ästhetik,
-Outfit, dreimal Vintage-Markt). Nicht verlinkt werden Eigennamen
(„Vintage Rock", „Peggy Sue Vintage") und die Formel „Vintage- und
Rockabilly-Szene". Offen am Eintrag: „Wie erkennt man Vintage-Kleidung?"
(13 Treffer) bleibt unbeantwortet, weil keine geöffnete Quelle Kriterien
nennt. Das ist ein Kandidat für Artikel A2.

`mensch` **Belegpflicht für `faq` ist nirgends maschinell geprüft.** Fund
vom 2026-10-02 beim Bau der Lexikon-FAQs: `faq` steht in keiner Liste von
`belegpflichtigeFelder` (`_schemas.ts`), und `belegpflicht` prüft nur
diese. Eine FAQ ohne Quelle mit `felder: [faq]` fällt also weder im
Lexikon noch bei Artikeln auf; die Regel „nur Fragen, die eine Quelle
deckt" steht bisher nur in Prosa (Regel 3). Zu entscheiden: `faq` in die
Liste für lexikon und artikel aufnehmen (Schemaänderung, gesperrt) — mit
Negativtest — oder bewusst lassen, weil eine Antwort mehrere Quellen
mischt und die Prüfung nur das Vorhandensein irgendeiner `faq`-Quelle
sähe.

`mensch` **Tanz in `genres`?** Rest des Postens „Boogie Woogie in
Terminen" (Regel 2026-10-03, ENTSCHEIDUNGEN.md). Gemeint ist an
Tanzabenden der Tanz; `genres` führt aber bisher nur Musikeinträge, und
die Boogie-Abende in Österreich stehen deshalb mit leerem `genres`. Zu
entscheiden: dürfen `boogie-woogie-tanz` und `rocknroll-tanz` in
`genres` stehen (dann tauchen die Termine auf den Genre-Seiten der Tänze
auf), oder bleibt `genres` Musik und der Tanz steht nur im Text?

`mensch` **Creepers und Pomade: zwei ungeprüfte Teddy-Boy-Angaben aus der
deutschen Wikipedia.** Gefunden am 2026-10-02 beim Entwurf
`lexikon/teddy-boy`. Die veröffentlichten Einträge `lexikon/creepers`
(Abschnitt „Creepers in der Szene") und `lexikon/pomade` (Abschnitt
„Pomade in der Szene") übernehmen aus der deutschen Wikipedia, dass die
Teds der 1950er „die Elvis-Tolle" trugen, `creepers` außerdem, dass das
Revival Mitte der 1970er Jahre „unter anderem die Stray Cats" trugen.
Beides widerspricht den Quellen, die `lexikon/teddy-boy` geöffnet hat:
Die ersten Teds gab es vor Elvis und vor dem Rock 'n' Roll (englische
Wikipedia „Teddy Boys", Vintage Rock 2021), die Stray Cats wurden 1979
gegründet (englische Wikipedia), und Teds rissen ihre Aufnäher ab, weil
die Band als Punk galt (Vintage Rock 2022). Zu entscheiden: die beiden
Stellen nach Regel 5 umschreiben (Angabe der Wikipedia benennen, das
Gesicherte daneben) — Änderung an Freigegebenem, also über die normale
Freigabe — oder bis zur Freigabe von `teddy-boy` warten und dann in
einem Zug.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

`mensch` **Gegenleser ist für Artikel blind.** Gefunden am 2026-10-02 beim
ersten Artikel seit Einführung des Gegenlesers (`artikel/petticoat-tragen`,
PR #122): `belegpflichtigeFelder.artikel` ist leer, also erzeugt
`gegenlesen --auftrag` 0 Prüfpunkte, und der Abschnitt meldet „0
Abweichungen", obwohl nichts gelesen wurde. Lexikon trifft es fast genauso
(nur Ära und Herkunftsland). Zu entscheiden: (a) so lassen und den Abschnitt
bei 0 Prüfpunkten „nicht anwendbar" statt „0 Abweichungen" melden lassen —
klein, ehrlich, prüft aber weiter nichts; (b) `kurzbeschreibung` und `faq`
für Artikel belegpflichtig machen — Schemaänderung, der Gegenleser prüft
dann die Kernaussagen, Belegpflicht-Warnungen an bestehenden Artikeln
möglich; (c) den Gegenleser `body:`-Abschnitte prüfen lassen — deckt den
Fließtext ab, ist aber das größte Stück Arbeit. Empfehlung: (a) sofort,
(b) danach.

`mensch` **Agenten-Arbeitskopien liegen unter dem gesperrten `.claude/`.**
Befund vom 2026-10-02, ausführlich in `docs/lektionen.md`, Lektion 31.
Das Agent-Werkzeug legt Arbeitskopien unter `.claude/worktrees/` an, und
`permissions.deny` sperrt dort jedes Schreiben. Zu entscheiden, beides in
`.claude/` und damit nur von Markus änderbar:
(1) die Arbeitskopien woanders anlegen lassen oder `.claude/worktrees/`
von der Sperre ausnehmen; (2) `guard.mjs` Schreibziele gegen das
Arbeitsverzeichnis auflösen lassen. Bisher sieht er relative Pfade nicht,
wenn die Sitzung selbst unter `.claude/` steht, und er blockiert Befehle,
die den Text `.claude/` nur als Inhalt in eine andere Datei schreiben.
Bis dahin gilt der Umweg: eigener Klon je Agent im Scratchpad, Patch,
Übernahme durch die Hauptsitzung. `.claude/worktrees/` steht seit dem
2026-10-02 in `.gitignore`, damit der Stop-Hook die Kopien nicht als
unversionierte Dateien meldet.

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

**Lexikon-Vorrat — der Suchlauf zieht von oben nach, sobald weniger als
zwei Lexikon-Posten frei sind.** Recherchiert am 2026-09-29
(Startschwelle: 80 Begriffe; Stand 23). Seit Weg A (2026-09-29) zieht der
Suchlauf Bündel von oben nach unten nach, bis drei Lexikon-Posten frei
sind, innerhalb der Obergrenze von zwölf (`npm run warteschlange:platz`,
Ablauf in `docs/ablaeufe/termin-recherche.md`, Schritt 1a). Ein
nachgezogenes Bündel wird hier gestrichen. Ist der Vorrat leer, wählt der
Mensch die nächsten Begriffe aus.
Je Bündel gleiche Kategorie, Abgrenzung in Klammern:
Reihenfolge am 2026-10-01 nach der PAA-Recherche umgestellt: Frisuren und
Rock- und Kleidformen nach oben. „Was heißt Pompadour?" und „Wie sieht ein
Pompadour aus?" kamen auf zusammen 12 Treffer, „Welcher Rock gehört zur
Rockabilly-Szene?" auf 23 — die meistgestellte Frage zum Look
(`docs/daten/paa-rockabilly-2026-10-01/`). Das Frisuren-Bündel ist seit
dem 2026-10-02 als Entwurf angelegt (`lexikon/pompadour`,
`lexikon/ducktail`, `lexikon/flat-top`) und hier gestrichen.
- *Rock- und Kleidformen:* Tellerrock (Glockenrock, Petticoat), Etuikleid
  (Bleistiftrock, Wiggle Dress), Neckholder (Racerback). Alte Pfade vorhanden.
- *Genres:* Rhythm and Blues (heutiges R&B), Hillbilly (Country,
  Schimpfwort, Bluegrass). Swing ist seit dem 2026-09-29 ein Entwurf
  (`lexikon/swing`).
- *Schuhe:* Saddle Shoes (Two-Tone, Budapester), Peep Toe (Slingback),
  Stiletto (Kitten Heel, das Messer), Keilabsatz (Plateausohle). Alte
  Pfade: `/thema/peep-toe`, `/thema/stiletto`, `/thema/keilabsatz`, eine
  Unterkategorie `…/saddle-shoes`.
- *Wäsche:* Corsage (Korsett, Bustier, die Ansteckblume), Hüfthalter
  (vorher gegen die Aliases von `strapsguertel` prüfen), Nahtstrümpfe.
- *Instrument und Klang:* Slap-Bass (Slap am E-Bass; gegen `kontrabass`
  abgrenzen, seit dem 2026-09-29 ein Entwurf), Slapback-Echo (Hall, Tape
  Delay).
- *Autos:* Pinstriping (Nadelstreifen am Stoff), Lowrider, Lead Sled.
- *Szene:* Halbstarke (Teddy Boys, Rocker, der Film von 1956) — an
  `lexikon/teddy-boy` anschließen (Entwurf seit dem 2026-10-02).
Bewusst nicht: Personen (`/thema/elvis`), Marken (`lindy-bop`),
`/thema/country` (meinte Landhausmode). Ob `/jahrzehnt/50s` einen
Epochen-Eintrag „Fifties" bekommt, ist eine Ermessensfrage (der Autolink
würde „50er" sehr oft verlinken).

**Portal-Gestaltung „Plattenhülle" umsetzen — in der Sitzung mit Markus,
nicht im Tageslauf.** Vorfragen entschieden am 2026-10-02
(`DESIGN-BRIEF.md`, „Entschieden am 2026-10-02"). Gebaut sind Etappe 1
(Farben, Dunkelmodus, Schriften, H1 als Plakatzeile) und Etappe 2
(Seitenkopf mit Logo, Ressortleiste, „Termin melden", Suche mit Pagefind).
Etappe 3 (Entitätsseiten über CSS) und Etappe 4 (Startseite) sind gebaut.
Katalognummer und Kategoriewerte sind nachgebaut. Das Line-up als
Zeitplan ist gebaut (Feld `programm`, ENTSCHEIDUNGEN.md vom 2026-10-02),
das erste Programm trägt das Rock'n'Roll & Boogie Woogie Weekend. Offen auf der Startseite: das Monogramm im Block „Jede Angabe
belegt" (wartet auf das Original-Logo). **Für Markus:** Die Antwortkapsel
der Startseite kommt aus `site.kurzbeschreibung` und sagt noch „das
Register der Vintage- und Rockabilly-Szene" — `site.config.ts` ist für
Agenten gesperrt; ob dort „Portal" stehen soll, entscheidest du.

**Artikel-Vorrat aus der PAA-Recherche — Auswahl Markus.** Noch nicht
gewählt, nicht abgelehnt (Einzelheiten in
`docs/daten/paa-rockabilly-2026-10-01/README.md`): A2 „Vintage-Kleidung
erkennen" (howto, `sammeln`, nach `lexikon/vintage`), A5 „Bekannte
Rockabilly-Songs" (liste, `musik`, keine Songtexte). Ein Lauf baut davon
nichts, solange Markus keinen auf `frei` setzt. Pillar, A4 und A7 sind
seit dem 2026-10-03 `frei` (oben unter „Als Nächstes").

**Artikel A1 „Vintage, Retro oder Secondhand?" — sobald
`lexikon/vintage` als Entwurf steht.** Gewählt von Markus am 2026-10-01
(PAA-Recherche, `docs/daten/paa-rockabilly-2026-10-01/README.md`).
`typ: vergleich`, Säule `sammeln`, `hauptentitaet: lexikon/vintage`.
Beantwortet „Was ist der Unterschied zwischen Retro und Vintage?" (10
Treffer), „Ab welchem Alter gilt Kleidung als Vintage?" (14), „Wann darf
man Vintage sagen?" (8), Vintage und Secondhand (4+1), Vinted. Wartet,
weil der Vergleich auf der Abgrenzung des Lexikoneintrags aufbaut und
nicht vorher eine eigene Altersgrenze setzen darf. Dann als `frei`-Posten
nach oben holen, wenn die Obergrenze Platz hat.

**Gegenleser auswerten — ab dem 2026-10-14.** Seit dem 2026-09-30 liest
ein Subagent jeden Inhalts-PR des Tageslaufs blind gegen die Quellen
(`scripts/gegenlesen.ts`, `docs/ablaeufe/gegenlesen.md`). Nach zwei
Wochen zählen: gemeldete Abweichungen, davon echt und Fehlalarm (Markus'
Urteil am PR), Sichtprüfungen, nicht prüfbare Punkte und warum, Kosten je
Lauf. Danach entscheiden: Bleibt er, werden Sichtprüfungen zu Vergleichen
(Adressen, Bands, Lexikon-Jahre), oder fällt er weg.

**Swing von Hand verlinken — sobald `lexikon/swing` freigegeben ist.** Der
Autolink setzt „Swing" nie selbst (`NUR_VON_HAND` in `src/lib/links.ts`,
Entscheidung Markus 2026-09-29). Gemessen am selben Tag meinen diese
Stellen die Musik und bekommen einen Handlink auf `/lexikon/swing/`:
`lexikon/jump-blues` („Saxofonspiels der Swing-Ära"), `lexikon/lindy-hop`
(„Musik der Swing-Big-Bands"), `adressen/rockin-barber-koepenick` („in der
Swing- und Rock'n'Roll-Band"), `events/boogie-party-sonntagnachmittag-2026-09-20`
(„Jump Blues und Swing" als getanzte Musik) und `lexikon/kontrabass`
(„traditionellen Jazz und Swing"). Nicht verlinken: Bella Italia, die
Herbstparty, Rock this Christmas und „Familie der Swing-Tänze" im
Boogie-Woogie-Eintrag — dort ist der Tanz oder ein Name gemeint. Vorher
mit `grep -rn "Swing" src/content` auf neue Stellen prüfen.

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
2026-09-29 gelten Weg B (Termine morgens und mittags, Lexikon nachmittags),
Weg A (drei Läufe am Tag, Suchlauf dreimal die Woche, Obergrenze 12,
Lexikon-Nachschub aus dem Vorrat) und die abendliche Freigabe-Erinnerung.
Deshalb zusätzlich zählen: Lexikon-Einträge pro Woche, die Liegezeit vom
Entwurf bis zur Freigabe und wie viele Inhalts-PRs gleichzeitig auf Markus
warten. Staut es sich dort, ist der dritte Lauf der erste, der wieder
wegfällt.

**Suchlauf auswerten — ab dem 2026-10-21.** Seit dem 2026-09-23 füllt ein
Suchlauf die Warteschlange auf, seit dem 2026-09-29 dreimal die Woche und
auf höchstens zwölf `frei`-Posten (`docs/ablaeufe/termin-recherche.md`).
Nach vier Wochen zählen: Wie
viele Posten tragen „Herkunft: Suchlauf", wie viele wurden zu einem
Eintrag, wie viele kamen zurück und warum. Führt weniger als die Hälfte zu
einem Eintrag, wird der Suchlauf abgestellt oder umgebaut (Routine
„v101 — Suchlauf"), Begründung nach ENTSCHEIDUNGEN.md.

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
