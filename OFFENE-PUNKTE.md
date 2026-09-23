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

`frei` **Berlin: bis zu drei weitere Termine aus dem Rockin'-Wildcat-Gig-Guide.**
Der Guide (https://www.rockin-wildcat.com/rwc/guide) führte am 2026-09-04
achtzehn Termine bis März 2027, jeweils mit JSON-LD; im Register stehen
zwei, einer davon vorbei. Die nächsten kommenden Termine mit Szenebezug
übernehmen, je Termin die Detailseite öffnen und den Aktualitätsbeleg wie
beim Record Hop führen (JSON-LD, Datum im Fließtext, keine geratenen
Detail-URLs). Fehlt der Spielort, ihn mit anlegen und im selben PR lassen,
denn Termin und Ort gehen nur gemeinsam durch die Freigabe
(`verweis-auf-entwurf`). Bands in `lineupWeitere`. Der Preis `0` im
JSON-LD dieser Quelle ist ein Vorgabewert, kein freier Eintritt.

`frei` **Boppin'B im Colos-Saal Aschaffenburg am 26. Dezember 2026 anlegen.**
Die Terminliste der Band bei Reservix
(https://www.reservix.de/tickets-boppinb/t3454) nennt „Sa. 26.12.2026,
20:00 Uhr, Aschaffenburg, Colos-Saal, ab 24,10 €". Die Seite des Hauses als
zweite Quelle öffnen, den Colos-Saal als Location anlegen (Region `bayern`,
Adresse nur mit Beleg) und den Termin mit `lineupBands: [boppin-b]`. Die
Band ist freigegeben, der Verweis ist also erlaubt. Zeitzone im Dezember:
`+01:00`.

`frei` **Boppin'B im Café Central Weinheim am 9. Januar 2027 anlegen.** Die
Detailseite https://cafecentral.de/konzert/goppin-b/ nennt „Sa 9.1.2027",
Einlass 19 Uhr, Beginn 20 Uhr. Der Ticketshop (loveyourartist, Profil
„Cafe Central/TocopillA Events") nennt 22 €. Haus und Band sind
freigegeben. Zeitzone `+01:00`. Vorsicht: Das Haus verwendet alte
Ankündigungstexte weiter, das Datum also nur aus der Datumszeile der
Detailseite übernehmen und gegen den Ticketshop halten (ENTSCHEIDUNGEN,
2026-09-23).

`frei` **Lexikon: Teddy Boy.** Der Begriff steht in vier Texten des Registers
(unter anderem Neo-Rockabilly) und hat keinen Eintrag. Es geht um die
britische Jugendkultur der 1950er, auf die sich die Rockabilly-Szene in
Großbritannien bis heute bezieht. Quellen öffnen (Wikipedia de/en,
Vintage Rock, ein Nachschlagewerk zur Mode), Widersprüche in den Text.
`abgrenzung` gegen Rockabilly als Musik und gegen die Mods. Danach
`npm run autolink`.

`frei` **Lexikon: Jive.** Steht in fünf Texten, unter anderem bei den
Tanzkursen in Ganderkesee, und hat keinen Eintrag. Jive ist ein Tanz ohne
gleichnamige Musikrichtung, also nicht betroffen von der offenen Frage
„Boogie-Woogie als Tanz". `kategorie: tanz`. Die Abgrenzung gegen den
Lindy Hop und gegen den Rock'n'Roll als Turniertanz gehört in den Text,
mit Quelle.

`frei` **Psychobilly-Osterfestival im Café Central Weinheim.** Die Startseite
nennt „Frenzy — Psychobilly Oster Festival, Sa 27.03." und „Demented Are
Go, So 28.03." ohne Jahr (Detailseiten /konzert/frenzy/ und
/konzert/demented-are-go/). Nur anlegen, wenn eine Detailseite oder der
Ticketshop das Jahr nennt. Sonst den Posten mit genau diesem Befund
zurückgeben, nicht schätzen. Achtung Zeitzone: Am 28.03.2027 beginnt die
Sommerzeit, der Samstag hat `+01:00`, der Sonntagabend `+02:00`.

`mensch` **Kopfkommentar im Hook `guard.mjs` noch vom Vorschlag.** Der am
2026-09-23 eingesetzte Hook ist byte-gleich mit dem Vorschlag, einschließlich
dessen Kopf: Die Zeilen 2 bis 13 („VORSCHLAG — wird nicht ausgeführt …" bis
zur Trennlinie aus Bindestrichen samt der Leerzeile danach) beschreiben jetzt
etwas Falsches. Sie gehören gelöscht, sodass auf `/**` direkt „Sperren für
agentische Schreibzugriffe …" folgt. Rein kosmetisch, ohne Wirkung auf die
Sperre. Nur ein Mensch kann es ändern, weil der Hook im gesperrten
Agentenverzeichnis liegt.

`mensch` **Wie viele Termine auf die Startseite?** Sie zeigt sechs, und die Zahl ist
geraten — sie war die, bei der die Liste in einer Bildschirmhöhe bleibt.
Entscheidbar wird das erst mit Zahlen: wie viele Termine dauerhaft in der
Zukunft liegen, und ob jemand über die Startseite oder direkt auf einer
Terminseite einsteigt. Vorher nicht anfassen (erst messen, dann entscheiden).

`mensch` **Der Skill `events-recherche` passt nicht auf dieses Repo.** Er verweist auf
ein anderes Projektverzeichnis und auf ein Frontmatter mit `title`, `datum`,
`stadt`, `tags`, `wiederkehrend` — keines dieser Felder existiert hier, und
das Schema ist `.strict()`. Vor allem fehlt ihm die Belegpflicht: keine
Quellen, keine Felderdeckung, kein Entwurfsstatus. Er wurde deshalb nicht
ausgeführt. Er liegt im Skill-Verzeichnis des Benutzers und damit außerhalb
dieses Repos; anpassen oder auf das alte Projekt beschränken kann ihn nur
ein Mensch. Dasselbe dürfte für die übrigen mitgelieferten Recherche-Skills
gelten (`bands-recherche`, `barbershops-recherche`, `tattoo-recherche`) —
geprüft ist bisher nur dieser eine.

`mensch` **Boogie-Woogie als Tanz: eigener Eintrag oder nicht?** Im deutschsprachigen
Raum meint das Wort fast immer den Paartanz und nicht den Klavierstil, und
getanzt wird dazu Rock'n'Roll, Rockabilly, Jump Blues und Swing — gerade
nicht die gleichnamige Musik. Derzeit trägt der Musikeintrag die
Unterscheidung in `abgrenzung` und einem eigenen Abschnitt. Ob daraus ein
zweiter Eintrag `boogie-woogie-tanz` wird, ist eine Ermessensfrage: Zwei
Einträge sind sauberer, ein Slug mit Klammerzusatz ist hässlich, und der
Autolink kann zwei gleichnamige Begriffe nicht auseinanderhalten.
**Seit dem 2026-09-23 stellt sich dieselbe Frage ein zweites Mal**, und
damit ist sie keine Einzelfallfrage mehr: Rock'n'Roll heißt genauso beides,
die Musik und der aus dem Lindy Hop hervorgegangene Turniertanz. Der neue
Lexikoneintrag behandelt die Musik und trennt beides in `abgrenzung` und im
Abgrenzungsabschnitt — dieselbe Lösung wie beim Boogie-Woogie. Sichtbare
Folge: Der Autolink verlinkt jetzt auch Stellen auf den Musikeintrag, die
den Tanz meinen (`lexikon/petticoat.md` und
`artikel/petticoat-reifrock-unterrock.md`, beide „Rock-'n'-Roll-Tanz").
Irreführend ist das nicht — der Eintrag sagt im ersten Absatz, dass er die
Musik beschreibt —, aber es ist auch nicht das beste Ziel. Wer die Frage
entscheidet, entscheidet sie besser für beide Begriffe zugleich.

## Vor dem Go-Live

**Impressum und Datenschutzerklärung.** In Deutschland Pflicht. Inhalt
kommt vom Menschen, Struktur kann vorbereitet werden.

**Methodik-Seite.** Wie wird recherchiert, geprüft, aufgenommen? Gibt es
bezahlte Einträge? Wird selten gebaut und wirkt bei einem Register stark —
sie beantwortet die Frage, die ein skeptischer Leser und ein bewertendes
Modell gleichermaßen haben.

**Analytics ohne Einwilligungsbanner.** Netlify Analytics (serverseitig,
keine Cookies) oder Plausible. Ein Cookie-Banner auf einem Register kostet
Nutzer und bringt nichts.

**Alte URLs von v101.de.** Die Domain trug bis 2024 ein
Preisvergleichssystem, 1447 URLs sind in der Wayback Machine erfasst.
Weiterleiten lohnt nur für rund 75 davon: 48 szenenahe `/c/`-Kategorien,
17 `/thema/`-Seiten mit Bezug (rockabilly, pin-up, burlesque, bettie-page,
elvis, polka-dots, charleston, gatsby, oldschool, cherry, anker) und die
zwölf `/jahrzehnt/`-Seiten. Der Rest — 953 Kategorie-mal-Tag-Kombinationen
und Produktseiten — bekommt 410. Eine Weiterleitung ohne thematische
Entsprechung ist für Google ein Soft-404 und vererbt nichts.

**Startschwelle prüfen.** Vor `PUBLIC_INDEXIERBAR=true`: 80+
Veranstaltungen mit Mehrzahl in der Zukunft, 5 Regionsseiten mit echter
Einordnung, 80 Lexikonbegriffe, zwei Säulen der Themenkarte vollständig.

## Später, mit Bedingung

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

**Prüfbericht für die Freigabe — wenn die Handarbeit zu viel wird.** Bei
zehn Einträgen genügt Lesen. Bei sechzig braucht es ein Werkzeug, das je
Eintrag zeigt, welche Behauptung an welcher Quelle hängt. Erst bauen, wenn
klar ist, was beim Freigeben tatsächlich geprüft wird.

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
