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

`mensch` **Das Golden Example der Bands nennt für The Firebirds 1985.** Die
deutsche Wikipedia datiert die Bandgründung auf Mai 1992; 1985 war das erste
musikalische Zusammentreffen zweier späterer Mitglieder. Die Datei ist eine
Vorlage und wird vom Loader übersprungen, richtet also keinen Schaden im
Register an — aber sie ist das, woran sich jeder neue Eintrag orientiert, und
sie behauptet über eine reale Band eine falsche Jahreszahl. Ob die Vorlage
auf eine erfundene Band umgestellt oder die Zahl korrigiert wird, ist eine
Entscheidung über die Vorlage selbst.

`mensch` **`guard.mjs` sperrt zu breit — und nur ein Mensch kann es ändern.** Der
Bash-Zweig blockiert jeden Befehl, der die gesperrte Schemadatei nennt und
irgendwo ein `>` enthält. Das trifft `2>&1` genauso wie eine Pfeilfunktion
`i => i.path[0]` — also auch reine **Lesezugriffe**. Belegt am 2026-09-11:
derselbe `npx tsx -e`-Befehl lief erst, nachdem die Pfeilfunktion durch
`function` ersetzt war. Zu breit ist besser als zu schmal, aber eine Sperre,
um die man täglich herumformuliert, wird irgendwann umgangen statt beachtet.
Naheliegend: den Schreibverben ein Wortgrenzen-Muster geben, statt auf das
bloße Zeichen `>` zu prüfen — dieselbe Korrektur wie damals beim
Statuswort (Lektion 18). `.claude/` ist für Agenten gesperrt, auch für diese
Änderung.
**Dritter belegter Fall am 2026-09-21**, und diesmal ohne `>`: Ein reines
`grep -l "^status: …"` über den Bestand wurde blockiert, weil der Befehl das
Statuswort *enthielt*. Kein Schreibzugriff, keine Umleitung — nur das Wort.
Die Auszählung des Bestands lief erst, nachdem die Zeichenkette zur Laufzeit
zusammengesetzt war. Damit trifft die Sperre inzwischen regelmäßig
Lesevorgänge, und das ist die Sorte Sperre, um die herumformuliert statt
beachtet wird.
**Vierter belegter Fall am 2026-09-23**, gleiche Bauart wie der dritte: Ein
`git worktree`-Vergleich gegen einen älteren Stand wurde blockiert, weil der
Befehl das Statuswort in einem Shell-Vergleich (`[ "$st" = … ]`) enthielt —
ein reiner Lesevorgang über einen Detached-Worktree, der nicht einmal in den
Arbeitsbaum schreiben konnte. Auch hier lief er erst, nachdem das Wort zur
Laufzeit zusammengesetzt war. Die Häufigkeit nimmt zu, weil die Läufe
zunehmend den Bestand auszählen, und genau dafür braucht man das Wort.
**Fünfter belegter Fall am 2026-09-23**, und diesmal in die harmlose
Richtung: Ein Mutationsbeleg sollte einen freigegebenen Eintrag
vorübergehend auf `entwurf` *zurücksetzen*. Blockiert, weil das Statuswort
im Suchmuster von `sed` stand. Das kostete nicht nur einen Umweg: Der
blockierte Befehl hatte auch die Sicherung und das Mutationsskript
anlegen sollen, und die folgenden fünf „Mutationen" liefen unbemerkt gegen
den unveränderten Code. Aufgefallen ist es nur an der Fehlermeldung von
`cp`. Eine Sperre, die Belege still entwertet, ist teurer als eine, die
nur stört.

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

`mensch` **Termine kurz vor dem Datum noch einmal anfassen.** Die Prüfkadenz für
Events steht auf 30 Tagen und hätte die falsche Anfangszeit des Record Hop
beinahe bis nach den Termin getragen; gefunden wurde sie nur, weil die Seite
aus einem anderen Grund erneut geöffnet wurde. Zu entscheiden: ob
`stale-report.ts` einen Posten „Termin steht bevor, letzte Prüfung liegt
zurück" bekommt. Vorher messen, wie oft sich Angaben in den letzten Tagen vor
einem Termin tatsächlich ändern — bei sieben Events ist das noch nicht
beantwortbar.

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
