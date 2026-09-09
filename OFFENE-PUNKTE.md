# Offene Punkte

Was ansteht, mit Begründung und Reihenfolge. Neues oben in der jeweiligen
Gruppe. Erledigtes wird gestrichen, nicht abgehakt — was erledigt ist,
steht in ENTSCHEIDUNGEN.md.

Nicht hier hinein gehört: Fehler (die gehören behoben oder in REVIEW.md),
Ideen ohne Entscheidung (die gehören in ein Gespräch), Erledigtes.

Bewusst vertagte Befunde aus dem Review stehen weiterhin in `REVIEW.md`,
Abschnitt 4 — sie werden hier nicht wiederholt, damit es nicht zwei Orte
für „nicht jetzt" gibt.

## Als Nächstes

**Regionsschwelle bauen.** Entschieden, noch nicht gebaut: drei Einträge
ODER eigener Fließtext über der Mindestlänge, der mehr sagt als die
Kurzbeschreibung. Gezählt wird der gesamte Registerbestand einer Region,
nicht nur Events. Dünne Regionen bekommen `noindex, follow`, fallen aus der
Sitemap, bleiben aber erreichbar und verlinkt. Und sie erscheinen als Posten
im Stale-Report — sonst ist das noindex eine stille Entscheidung, die
niemand zurücknimmt.

Zwei Fragen sind beim Bau noch zu klären und gehören zum Menschen: ob
Entwürfe beim Zählen mitzählen (in der Produktion existieren sie nicht, in
der Vorschau schon), und ob die Region sich selbst mitzählt oder nur, was
auf sie verweist. Das Gerüst steht: `ListenLayout.astro` kennt `noindex`
und `indexGrund` bereits von den Facetten.

**Genres als nächste Lexikongruppe.** Rockabilly, Psychobilly,
Neo-Rockabilly, Western Swing, Jump Blues, Doo Wop, Boogie Woogie, Lindy
Hop. Grund: Der Autolink greift in Eventtexten kein einziges Mal — in
Events, Locations und Regionen steht bis heute kein einziger
`/lexikon/`-Link, weil zehn Mode-Begriffe dort nicht vorkommen. `genres`
bleibt bei allen fünf Events leer, und das Register hat außerhalb des
Golden Example keinen einzigen Eintrag der Kategorie `genre`. Erst mit den
Genres verzahnen sich Lexikon, Bands und Events.

**Kapsel und Überschrift auf Übersichtsseiten.** „Das Register enthält 10
Einträge in der Kategorie Lexikon" ist eine Zählung, keine Auskunft. Die
Überschrift „Einträge" darüber trägt nichts bei — die Liste ist
offensichtlich die Liste. Betrifft alle sechs Übersichten, sitzt aber an
**zwei** Stellen: die Kapsel in `src/pages/[typ]/index.astro`, die
Überschrift in `src/layouts/ListenLayout.astro`.

**`aeraVon` auf 1400 senken.** Untergrenze steht bei 1900, war für
Veranstaltungen gedacht. Genau vier Lexikoneinträge nennen diese Grenze als
Grund dafür, dass ihre belegte Datierung nur im Fließtext steht und nicht
im Faktenblock oder JSON-LD: Reifrock (ab 1470), Korsett (16. Jahrhundert),
Unterrock (16. Jahrhundert), Pomade (18. Jahrhundert).

Bei der Gelegenheit die übrigen Schwellenwerte aus der Anfangszeit prüfen.
Aufgefallen ist bereits: `gegruendet`, `aufgeloest` und das Jahr einer
Veröffentlichung stehen bei Bands auf `min(1930)` — Western Swing ab 1934
passt knapp, ein Jazzorchester der zwanziger Jahre nicht.

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
