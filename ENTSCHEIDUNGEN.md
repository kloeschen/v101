# Entscheidungsprotokoll

Warum etwas so ist, wie es ist. Neueste Einträge oben.

Dieses Protokoll ist die Brücke zum Strategie-Chat, der keinen Repo-Zugriff
hat und von Änderungen hier nichts mitbekommt. In zwölf Monaten ist es der
einzige Ort, an dem die Begründung noch steht — der Commit sagt, *was*
geändert wurde, nicht *warum* und schon gar nicht, *was verworfen wurde*.

Hinein gehören: geänderte Regeln, Felder im Datenvertrag, verworfene
Alternativen, Funde mit Folgen. Nicht hinein gehören: normale Commits,
Inhalte, Formulierungsarbeit. Zehn Zeilen pro Woche sind genug.

---

## 2026-09-04 — Die Lektionen ziehen aus `.claude/` nach `docs/`

**Fund:** Die Lektionensammlung lag in `.claude/rules/lektionen.md` und war
damit für Agenten gesperrt. Dreimal in einer Sitzung hat sich gezeigt, was
das heißt: Zwei Lektionen mussten als fertiger Text im Pull Request
übergeben werden, weil die Instanz, die sie aus ihren eigenen Fehlern
schreibt, sie nicht selbst ablegen konnte. Eine Sammlung von
Erfahrungssätzen, die nur ein Mensch fortschreiben kann, wächst so schnell
wie seine Zeit — nicht so schnell wie die Fehler.

**Entscheidung:** `.claude/rules/lektionen.md` wird zu `docs/lektionen.md`.
Das Verzeichnis `.claude/rules/` entfällt, es enthielt sonst nichts.

**Warum die Grenze dort liegt.** `.claude/` und `.github/` enthalten die
**Mechanik** der Absicherung: Hooks, Berechtigungen, Agentendefinitionen,
CI-Schritte. Was sich selbst absichert, darf sich nicht selbst ändern —
sonst ist die Sperre eine Bitte. **Text über** diese Mechanik ist etwas
anderes: Er beschreibt sie, führt sie nicht aus, und kann gepflegt werden,
ohne die Absicherung anzurühren. Er gehört nach `docs/`.

**Verworfen:** eine Ausnahme in `permissions.deny` für diese eine Datei.
Sie hätte die Sperre von einer Bedingung zu einer Liste gemacht, die man
pflegen muss, und die nächste Datei hätte dieselbe Diskussion ausgelöst.
Die Grenze zwischen Mechanik und Beschreibung ist die haltbarere Trennung
als eine Ausnahmeliste.

**Folge:** Lektion 18 bekommt den zweiten Teil — wer eine Datei in einen
gesperrten Bereich legt, sperrt sie für alle künftige Pflege mit. Vor dem
Ablegen ist deshalb zu fragen: Mechanik oder Text über Mechanik?
`CLAUDE.md` nennt jetzt den Grund für die Sperre, nicht nur die Sperre.
Zwei Prüfungen in `scripts/test-hooks.ts` halten den Zustand fest, statt
ihn der Erinnerung zu überlassen (Lektion 6).

**Nicht gebaut:** eine allgemeine Prüfung „jeder Pfad in Backticks
existiert". Der Prototyp meldete 60 von 108 Pfadangaben als tot — fast alle
zu Recht ungenannt, weil die Dokumentation bloße Dateinamen (`facetten.ts`)
und URL-Pfade (`/rss.xml`) in derselben Auszeichnung führt. Eine brauchbare
Fassung bräuchte Basisnamen-Auflösung und eine Ausnahmeliste für URLs; das
ist ein eigenes Vorhaben und nicht die Nebenwirkung eines Umzugs.

---

## 2026-09-04 — Der Eintritt hat drei Zustände, nicht zwei

**Fund:** Bei der Erprobung an fünf Events konnten zwei nicht eingetragen
werden. Weder der Record Hop in Berlin noch der Tanzabend auf der Burg
Perchtoldsdorf nennen einen Preis — und das Schema kannte nur
`eintrittFrei: true` oder eine bezifferte Preisliste. Der tatsächliche
Zustand, „der Veranstalter veröffentlicht keinen Preis", war nicht
ausdrückbar, und unter `--strict` wurde er zum Merge-Blocker.

**Entscheidung:** `eintrittFrei: boolean` wird ersetzt durch
`eintritt: "frei" | "beziffert" | "unveroeffentlicht"`, ohne Standardwert.

**Warum ein Enum und nicht ein zweites Boolean.** Ein Boolean trägt zwei
Zustände; die Sache hat drei. Ein zusätzliches `preisUnbekannt: boolean`
hätte vier Kombinationen erzeugt, von denen eine — frei **und**
unveröffentlicht — nichts bedeutet und die ein Validator hätte verbieten
müssen. Eine Darstellung, die Unsinn zulässt und ihn nachträglich
ausschließt, ist dieselbe Fehlerklasse wie `felder: ["alle"]`: Sie
verlagert die Bedeutung aus dem Datentyp in eine Regel, die man vergessen
kann.

**Warum ohne Standardwert.** Der Preis ist die meistgestellte Frage zu
einem Termin. Ein Standardwert würde sie unbeantwortet durchrutschen
lassen, und ein Standard von `unveroeffentlicht` wäre genau die bequeme
Ausrede, die es zu vermeiden gilt. Wer ein Event anlegt, entscheidet
bewusst.

**Der dritte Zustand braucht einen Beleg.** `unveroeffentlicht` ist eine
Aussage über die Quelle, nicht über die eigene Mühe. Deshalb verlangt
`event-preise` einen `quellen[]`-Eintrag, dessen `felder` `eintritt` oder
`preise` deckt — das heißt: „Diese Seite habe ich auf die Preisfrage hin
gelesen." Aussagen über Abwesenheit sind die am schwersten nachprüfbaren
überhaupt; ohne diese Bedingung wäre der Wert wertlos.

Die Ebene folgt der Hausregel: Warnung im Entwurf, Fehler bei
`status: veroeffentlicht`. In der CI ist beides blockierend, weil
`--strict` Warnungen zu Fehlern macht.

**Im JSON-LD entsteht kein `offers`-Knoten.** Ein Offer ohne Preis
behauptet ein Angebot, über das nichts bekannt ist, und ist damit
irreführender als gar keines. `isAccessibleForFree` steht auf `true` bei
frei, auf `false` bei beziffert und fehlt bei `unveroeffentlicht` — schema.org
kennt keinen Wert für „unbekannt", und ein `false` wäre dort eine
Behauptung. `check-jsonld` warnt deshalb nicht mehr über fehlende
Preisangaben, sondern meldet nur noch den Widerspruch: `false` ohne
`offers`.

**Im Faktenblock steht „Preis nicht veröffentlicht".** Das ist eine
Auskunft für den Leser, keine Leerstelle — und der Unterschied zwischen
„wir wissen es nicht" und „der Veranstalter sagt es nicht" ist genau der,
den ein Register liefern kann.

**Fund beim Mutationsbeleg: eine Fixture hielt aus dem falschen Grund.**
Die Prüfung „dritter Zustand: kein Offer" lief mit einem Termin ohne
Preisangaben. Sie blieb deshalb auch dann grün, als die Abfrage auf
`eintritt` im Builder ganz entfernt wurde — `preise: []` ergibt eine leere
Offer-Liste, die ohnehin herausfällt. Beide Ursachen führen zum selben
Ergebnis, also belegt das Ergebnis keine von beiden. Trennen lassen sie
sich erst durch den widersprüchlichen Fall: Preise **an** einem Termin,
der keinen Preis veröffentlicht. Der Validator verbietet diese Kombination
— aber der Astro-Build prüft nur das Zod-Schema, nicht die Regeln, und die
Verteidigung im Builder verlässt sich deshalb nicht auf den Validator.
Dieselbe Fehlerklasse wie die Sortierprüfung aus M9, die unter Mutation
zufällig hielt: Eine Prüfung, deren beide möglichen Ursachen dasselbe
Ergebnis liefern, prüft nichts.

**Nebenbefund, nicht behoben:** Der Bash-Zweig von `guard.mjs` prüft auf
das Wort `veroeffentlicht` und schlägt deshalb auf dem neuen Wert
`unveroeffentlicht` an — jeder Shell-Schreibzugriff auf eine Eventdatei mit
diesem Wert wird als Statusänderung abgelehnt. Ein Fehlalarm, der bleibt,
bis jemand das Muster auf `status:\s*veroeffentlicht` oder eine
Wortgrenze verengt. `.claude/` ist für Agenten gesperrt (Lektion 16).

---

## 2026-09-04 — `preise` bleibt flach

**Fund:** Das Rock'n'Roll Festival Ganderkesee staffelt seine acht Preise
über zwei Achsen — Gültigkeitstag (3 Tage, Freitag, Samstag, Sonntag) mal
Kaufweg (Online, Tageskasse). Das Schema kennt je Preis nur
`bezeichnung`, `betrag`, `waehrung`, `gueltigBis` und `hinweis`. Beide
Achsen mussten in die `bezeichnung` gefaltet werden: „Tageskarte Samstag,
Online".

**Entscheidung: Das wird nicht ausgebaut.**

Ein zweidimensionales Preismodell wäre sauberer. Aber achtwertige Staffeln
sind in dieser Szene die Ausnahme — von fünf erprobten Events hatte eines
sie, drei hatten null bis drei Preise, eines gar keinen. Der Preis eines
Ausbaus wäre, dass jeder einfache Fall — ein Ticket, ein Preis — dieselbe
Struktur mitschleppt.

**Was das für die Schnittstelle heißt, und zwar ausdrücklich:** Wer die
Staffel im JSON-Feed maschinell auswerten will, kommt hier nicht weiter
und muss die Veranstalterseite lesen. Die `bezeichnung` ist Text für
Menschen, kein Schlüssel. Das ist eine bewusste Grenze der offenen
Schnittstelle, kein Versehen — und sie steht als Kommentar an `preise` im
Datenvertrag, damit sie beim Lesen des Schemas auffällt und nicht erst
beim Auswerten des Feeds.

---

## 2026-09-04 — Der Aktualitätsbeleg bekommt noch kein Feld

**Fund:** Die Erprobung an fünf Events hat gezeigt, dass sich die Frage
„gilt diese Angabe der kommenden Ausgabe?" beantworten lässt — zweimal hat
sie einen Fehler verhindert. Aber die tragfähigen Belege waren durchweg
**Nebenprodukte der Technik**, nicht Aussagen des Veranstalters:

| Event | Woran der Beleg hing |
| --- | --- |
| Record Hop Berlin | Uploadpfad `/2026/08/`, Datum im Dateinamen, hochgezählter Slug `record-hop-60` |
| Rockabilly Convention | `dateModified: 2026-08-23` im JSON-LD |
| Bella Italia | Sortierverhalten der Liste — Vergangenes wird entfernt |
| Walldorf Weekender | Jahreszahl im URL-Pfad, Vorverkaufsschluss |
| Ganderkesee | zwei unabhängige Textstellen, getrennt geführte Rückschau-Rubrik |

Fünf Events, fünf verschiedene Belegarten, keine zweimal. Kein einziger
Veranstalter schreibt hin, für welche Ausgabe seine Angaben gelten.

**Entscheidung: kein Feld, vorerst.** Ein Pflichtfeld würde eine
Systematik behaupten, die es nicht gibt — und eine Aufzählung möglicher
Belegarten wäre nach fünf Beispielen geraten, nicht beobachtet. Die Regel
bleibt Auftragsregel und wandert in die `redaktionsnotiz`, so wie bei
diesen fünf.

**Bedingung für eine spätere Entscheidung:** Wenn sich nach etwa dreißig
Events wiederkehrende Belegarten zeigen — wenn also dieselbe Art Beleg
mehrfach trägt und sich benennen lässt —, wird daraus ein Feld. Vorher
nicht. Wer die Entscheidung dann trifft, hat mit den Redaktionsnotizen
das Material dafür beisammen; das ist der Zweck dieser Zwischenlösung.

---

## 2026-09-03 — Eine offene Schnittstelle enthält nur, was gilt

**Fund:** Mit `PUBLIC_ENTWUERFE=true` liefen Entwürfe nicht nur auf die
Seiten, sondern auch in `/api/events.json`, die Kalenderabos, `/rss.xml`,
die Sitemaps und `llms.txt`. Auf der Seite trägt ein Entwurf seinen Hinweis.
In einer Ausgabe trägt er nichts.

**Entscheidung:** Entwürfe verlassen den Registerbestand nicht, auch nicht
bei aktivem Schalter.

Die Feeds stehen unter CC BY 4.0 zur Nachnutzung frei. Was sie verlässt,
verliert den Kontext, der es als Entwurf kennzeichnet — ein Termin, der aus
`/api/events.json` in einen fremden Kalender wandert, kommt dort ohne
Herkunft an, und eine Sitemap ist eine Einladung an Suchmaschinen, keine
Vorschau. Eine offene Schnittstelle enthält nur, was gilt.

**Verworfen: ein `status`-Feld in den Feeds.** Es wäre die technisch
sparsamste Lösung und hätte die Unterscheidung auf Nachnutzer verlagert, die
sie nicht treffen wollen. Wer einen Kalender abonniert, filtert nicht nach
Redaktionsstatus; wer eine Terminliste einbindet, prüft kein Feld. Ein
Datenfeld, das nur dann schützt, wenn jeder Konsument es auswertet, schützt
nicht. Dazu kommt: Sitemap und ICS haben gar kein Feld dafür — die Lösung
hätte nur für zwei der sechs Ausgaben überhaupt funktioniert.

**Zwei Register statt eines Filters je Ausgabe.**
`holeFreigegebeneRegistry()` steht neben `holeRegistry()`; die Ausgaben
holen das eine, die Seiten das andere. Der Grund gegen einen Filter an
jeder Ausgabe ist derselbe wie bei M9 und M10: Sechs Stellen, die dieselbe
Frage beantworten, beantworten sie irgendwann verschieden. Nebeneffekt und
eigentlicher Gewinn: Auch die Rückverweise sind in sich stimmig, weil das
freigegebene Register aus freigegebenen Einträgen aufgebaut wird — ein
veröffentlichtes Event, dessen Location noch Entwurf ist, verweist im Feed
nicht auf etwas Halbes.

**`/daten/` gehört dazu, obwohl es eine HTML-Seite ist.** Die Seite
beschreibt die Ausgaben, zählt den Bestand und verlinkt die Kalender je
Region. Zählte sie anders als die Feeds, würde sie über die Schnittstelle
falsch Auskunft geben — und sie verlinkte `.ics`-Dateien, die es nicht gibt,
weil die Kalenderrouten nur für freigegebene Regionen entstehen. Das ist
kein Nebenschauplatz, sondern derselbe Fehler eine Ebene höher.

**Nicht umgestellt:** `404.astro` und die Startseite zählen ebenfalls den
Bestand, bleiben aber am sichtbaren Register. Beides sind Seiten, keine
Ausgaben; die 404 ist ohnehin `noindex`, und in einer Vorschau soll die
Startseite zeigen, was die Vorschau zeigt.

**Der Beleg ist ein echter Build, keine Unit-Fixtures.** Die Frage lautet
nicht „filtert die Funktion richtig", sondern „ruft jede Ausgabe das
richtige Register auf" — eine Frage der Verdrahtung, und die lässt sich nur
am Ergebnis prüfen. Genau diese Sorte Fehler war M10: ein Skript, das
existierte, richtig war und nirgends aufgerufen wurde. `test-ausgaben.ts`
baut deshalb mit `PUBLIC_ENTWUERFE=true` in ein Temp-Verzeichnis und prüft
je Ausgabeart beide Hälften: Der Entwurf ist als Seite da, und sein Pfad
steht in keiner der sechs Ausgaben. Dazu eine Quellensperre mit begründeter
Liste, damit keine Ausgabe zurückfällt, während das Register gerade keinen
Entwurf enthält und der Build-Teil nichts zu zeigen hätte.

---

## 2026-09-03 — Entwürfe in der Vorschau, nicht in der Produktion

**Fund:** Entwürfe waren nur unter `astro dev` sichtbar. Wer einen Eintrag
begutachten wollte, musste ihn lokal bauen — die Deploy Preview, die genau
dafür da ist, zeigte ihn nicht. Gleichzeitig darf ein Entwurf nicht in die
freigegebene Produktion, weil `status: veroeffentlicht` ausschließlich ein
Mensch setzt.

**Entscheidung:** Ein dritter Schalter neben `PUBLIC_INDEXIERBAR`.
`PUBLIC_ENTWUERFE=true` nimmt Entwürfe ins Register auf; gesetzt wird er je
Netlify-Kontext, nicht global — dieselbe Bauart und derselbe Grund wie bei
Lektion 9. Beide Schalter zusammen ergeben den gewollten Zustand: In der
Vorschau ist der Entwurf **sichtbar und trotzdem nicht indexierbar**.

Nur der exakte Wert `"true"` schaltet frei. `"1"`, `"yes"`, `"TRUE"` und
`"ja"` tun es nicht und sind einzeln als Negativtest festgehalten — ein
versehentliches `PUBLIC_ENTWUERFE=1` in der Produktion wäre sonst eine
offene Tür, und zwar eine stille.

**Die Regel liegt nicht in `registry.ts`.** Sie steht in
`src/lib/sichtbarkeit.ts`, und `registry.ts` reicht sie nur weiter. Grund ist
die Testbarkeit: `registry.ts` importiert `astro:content` und ist aus Node
heraus nicht ladbar. Läge die Regel dort, gäbe es keinen Weg, sie zu prüfen —
und eine ungeprüfte Sperre ist eine Vermutung (Lektion 7). Das ist derselbe
Schnitt wie bei `src/lib/datum.ts` in M9: die Antwort dort, wo beide
Laufzeiten sie erreichen.

**Verworfen: den Schalter beim Laden des Moduls einmal auswerten.** Das wäre
die übliche Form (`export const entwuerfe = …`) und einen Hauch schneller.
Sie hätte den Test unmöglich gemacht — eine Konstante lässt sich im laufenden
Prozess nicht umstellen, und beide Richtungen der Regel wären damit
unbelegt geblieben. Die Funktion liest die Umgebung bei jedem Aufruf. Der
Preis ist ein Objektzugriff pro Eintrag, der Gewinn ist ein Beweis.

**Doppelte Zugriffshilfe, bewusst.** `umgebung()` steht schon in
`site.config.ts`, wird von dort aber nicht exportiert. Sie zu teilen hieße,
`site.config.ts` zu ändern — für Agenten gesperrt (Lektion 16). Die Dopplung
ist deshalb dokumentiert statt umgangen; wer die Sperre öffnet, kann sie in
einen Export zusammenziehen. Der Regressionstest aus Lektion 2 gilt jetzt für
beide Dateien.

**Sichtbar heißt nicht ununterscheidbar.** Ein Entwurf, der aussieht wie ein
fertiger Eintrag, ist genau die Falle, die dieser Schalter sonst aufstellt.
Das Entitätslayout hatte seinen Hinweis bereits; in Listen und Facetten
fehlte er. Ergänzt wurde er in `EintragsListe.astro` — der einzigen Stelle,
an der ein Eintrag in einer Liste gerendert wird. Damit deckt eine Änderung
Übersichten, Facetten, Auftrittslisten, Regionsseiten und den
Verwandt-Block ab, und ein künftiger Listentyp erbt den Hinweis, statt ihn
zu vergessen.

**Offen und bewusst nicht mitgemacht:** Bei `PUBLIC_ENTWUERFE=true` laufen
Entwürfe auch in Sitemap, RSS, ICS und `/api/events.json`. In einer
Vorschau ist das folgenlos, weil sie ohnehin `noindex` trägt und niemand
ihre Feeds abonniert. Sauber ist es trotzdem nicht: Die Feeds tragen kein
`status`-Feld und könnten einen Entwurf nicht als solchen ausweisen. Das ist
eine eigene Entscheidung über den Datenvertrag der offenen Schnittstelle und
gehört nicht in diesen Commit.

---

## 2026-09-03 — Ein Event ist vorbei, wenn sein Tag um ist (M9)

**Fund:** Sechs Stellen beantworteten die Frage „ist dieser Termin vorbei?",
und alle mit demselben Vergleich: `new Date(ende ?? beginn) < jetzt`. Das
Schema erlaubt ein Datum ohne Uhrzeit, und `z.coerce.date()` macht daraus
Mitternacht UTC. Ab 00:01 UTC am Veranstaltungstag — in Berlin ab 02:01
Ortszeit derselben Nacht — galt der Termin als vergangen. Der Validator
verlangte dann `stattgefunden` für einen Termin, der erst abends stattfand:
rote CI am wichtigsten Tag des Eintrags, und der einzige Ausweg eine
Statusangabe, die noch nicht stimmte. `archive-events.ts` hätte denselben
Termin archiviert, während er lief.

**Entscheidung — die Semantik:**

> Ein Event ist vorbei, wenn das **Ende seines letzten Tages** in
> `site.zeitzone` überschritten ist.

Nicht „der Zeitstempel liegt in der Vergangenheit", sondern „der Tag ist
um". Das ist auch für Einträge mit Uhrzeit richtig: Ein Konzert um 20 Uhr
ist um 21 Uhr nicht vorbei, es läuft. Und die Regel braucht keine
Fallunterscheidung zwischen Datum und Zeitstempel.

**Verworfen: die Heuristik „Mitternacht bedeutet Datum ohne Uhrzeit".**
Naheliegend, weil sie die Ursache direkt adressiert — steht die Uhrzeit auf
00:00:00.000 UTC, war im Frontmatter vermutlich kein Zeitpunkt gemeint, also
auf das Tagesende vergleichen, sonst auf den Zeitstempel. Drei Gründe
dagegen:

1. **Sie rät.** `beginn: 2026-05-22T00:00:00+00:00` ist ein zulässiger
   Zeitstempel und meint Mitternacht. Die Heuristik behandelt ihn wie ein
   Datum. Ein Silvesterball um 00:30 Ortszeit liegt nur eine halbe Stunde
   daneben.
2. **Die Unterscheidung ist bereits verloren.** Nach `z.coerce.date()` gibt
   es nur noch einen Zeitpunkt. Die Heuristik rekonstruiert aus dem Ergebnis,
   was in der Eingabe stand — das ist eine Vermutung, keine Information.
3. **Sie hätte zwei Semantiken ergeben,** und damit zwei Klassen von
   Einträgen, die sich am selben Tag verschieden verhalten. Genau das ist
   die Sorte Unterschied, die niemand im Kopf behält.

Der Preis der gewählten Semantik: Ein Konzert, das um 20 Uhr endete, gilt
bis Mitternacht als nicht vorbei. Das ist die richtige Richtung — eine
Veranstaltung zu früh archivieren ist der teurere Fehler.

**Eine Funktion, acht Aufrufstellen.** `src/lib/datum.ts` hält
`endeDesTages`, `istVorbei`, `istKommend` und `eventVorbei`; gerechnet wird
über `Intl.DateTimeFormat` mit `timeZone` aus `site.zeitzone`, nie über
lokale Getter (Lektion 1). Das Modul wird von Astro **und** von den Skripten
importiert und verwendet deshalb kein `import.meta` (Lektion 2).

Umgestellt wurden alle acht: `validate-content.ts` (`event-zeitraum` und
`quellen-aktualitaet`), `archive-events.ts`, `stale-report.ts` (zweimal —
vergangene Termine und Reihen ohne Folgetermin), `links.ts` `auftritte()`,
`facetten.ts` `nachDatum()`, `jsonld/builders.ts` (`offers.availability`).
Drei davon standen nicht im Befund; sie sind beim Durchgehen aufgefallen.

**Nebenwirkung, absichtlich:** `nachDatum()` trennte kommende von vergangenen
Terminen über `beginn`, während die Bandseite `ende ?? beginn` nahm — dieselbe
Frage, zwei Antworten. Ein dreitägiges Festival stand in der Facette ab dem
zweiten Tag unter „vergangen" und auf der Bandseite unter „kommend". Beide
fragen jetzt `istVorbei(ende ?? beginn)`. Sortiert wird weiter nach `beginn`.

**Der statische Check greift jetzt auch hier.** `check-zeitzonen.ts` sah
diese Fehlerklasse nicht: Es steht keine verbotene Datums-API im Code,
sondern eine stillschweigende Annahme. Neues Muster: eine Ordnungsrelation,
bei der genau ein Operand eine Jetzt-Quelle ist (`new Date()`, `Date.now()`,
`jetzt`, `heute`) und der andere ein Datumswert. Was es nicht sieht:
dieselbe Frage über eine Zwischenvariable oder in Millisekunden
ausgerechnet. Es ist eine Sperre gegen den bekannten Rückfall, kein Beweis —
so steht es auch in REVIEW.md.

Zwei Dinge sind beim Bauen des Musters aufgefallen und stecken jetzt im
Skript: Die Prüfung schlug an ihrer **eigenen Dokumentation** an, weil der
falsche Vergleich im Kommentar steht (reine Kommentarzeilen werden
übersprungen — eine Regel, die an ihrer Erklärung anschlägt, wird
abgeschaltet statt befolgt). Und die erste Fassung normalisierte
`new Date(` zu `newDate(`, sodass die halbe Regel stumm blieb — sichtbar
erst im Negativtest, der drei Mutationen einsetzte und nur eine fand.

---

## 2026-09-03 — Eine Prüfkette statt zweier Listen (M10)

**Fund:** Die CI zählte ihre Prüfschritte einzeln auf und rief `npm run
verify` nie auf. Damit gab es zwei Orte, an denen ein neuer Schritt
eingetragen werden musste — `package.json` und der Workflow —, und der
zweite liegt hinter einer Agentensperre. `scripts/check-freigabe.ts` stand
deshalb in `verify` und lief in der CI nie. Ein grüner Lauf hatte das nicht
gezeigt; aufgefallen ist es erst beim Blick ins Job-Log.

**Entscheidung:** Die CI ruft eine Kette auf. `verify:ci` in `package.json`
ist die einzige Stelle, an der ein Prüfschritt registriert wird.

**Zwei Ketten, nicht eine.** `verify` bleibt daneben bestehen:

| | `verify` | `verify:ci` |
| --- | --- | --- |
| Warnungen | bleiben Warnungen | `--strict` macht Fehler daraus |
| fehlende Vergleichsbasis | Hinweis, Lauf geht weiter | `--basis-pflicht` bricht ab |
| Autolink-Drift | nicht geprüft | `--check` |

Der Grund für beide: Lokal soll eine Warnung die Arbeit nicht anhalten —
wer mitten in einem Eintrag steckt, hat notwendigerweise Lücken. Im Pull
Request ist dieselbe Warnung ein Grund, nicht zu mergen. Und die
Freigabeprüfung braucht lokal Nachsicht (ein frischer Klon ohne
`origin/main` soll nicht rot sein), in der CI dagegen Strenge, sonst prüft
sie stillschweigend nichts. Die Erklärung steht als `// verify`- und
`// verify:ci`-Schlüssel direkt daneben in `package.json`; JSON kennt keine
Kommentare, und npm ruft Schlüssel nie auf, die kein Ziel haben.

**Reihenfolge nach Laufzeit, gemessen statt geschätzt:** Zeitzonen 0,6 s ·
Freigabe 0,6 s · Inhalte 0,8 s · JSON-LD 0,9 s · Autolink 1,1 s · Typen
11,3 s · Build 3,3 s · Tests 25,6 s. Billig vor teuer, mit einer bewussten
Ausnahme: Die Typprüfung steht vor dem Build, obwohl sie dreimal so lange
braucht — ein Typfehler soll nicht erst danach auffallen.

**Preis, den wir kennen:** GitHub zeigt einen Schritt statt sieben, und bei
einem Fehlschlag ist die Stelle weniger offensichtlich. Deshalb gibt
`verify:ci` vor jedem Teilschritt eine Zeile `::: [3/8 Inhalte (strict)] :::`
aus. Das Log bleibt greppbar, ohne dass jedes Skript angefasst werden musste.

**Die eigentliche Arbeit ist `scripts/test-pruefkette.ts`.** M10 war kein
Fehler in einem Skript, sondern ein Skript, das nirgends aufgerufen wurde.
Genau das prüft der Harnisch jetzt: Jede Datei `scripts/check-*.ts` und
`scripts/test-*.ts` muss von `verify:ci` aus erreichbar sein — die Analyse
folgt `npm run`-Aufrufen transitiv durch `package.json`. Dazu drei
Zusicherungen über den Workflow: Er ruft die Kette auf, er zählt nichts
einzeln auf, und er holt die Historie (`fetch-depth: 0`), ohne die
`--basis-pflicht` dauerhaft rot wäre.

**Ausnahmen ausdrücklich, nicht stillschweigend:** `check-links.ts` ruft das
Netz und läuft wöchentlich über den Linkcheck-Workflow. Es steht mit
Begründung in einer Liste im Test, und der Test prüft die Liste in beide
Richtungen: Eine Ausnahme für eine gelöschte Datei ist ein Fehler, und eine
Ausnahme für ein Skript, das doch in der Kette hängt, ebenfalls — sonst
verschleiert die Liste beim Lesen den wahren Zustand.

**Verworfen: einen Startbanner in jedes der elf Prüfskripte schreiben.**
Wäre unabhängig vom Aufrufweg sichtbar gewesen, hätte aber elf Dateien
angefasst, um ein Problem der Kette zu lösen. Die Marker stehen jetzt an der
einen Stelle, an der die Kette definiert ist. Ebenfalls verworfen: die
Reihenfolge streng nach Laufzeit — siehe die Ausnahme für die Typprüfung.

**Mutationsbeleg (Lektion 7):** `npm run freigabe:ci` testweise aus
`verify:ci` entfernt. Es fallen genau zwei zusätzliche Prüfungen — die
Erreichbarkeit von `check-freigabe.ts` und die Anwesenheit von `freigabe:ci`
in der Kette. Danach zurückgebaut.

**Grenze dieser Sitzung, offen benannt:** Die Workflow-Datei selbst konnte
ich nicht schreiben. Die ausdrückliche Freigabe erreicht die Mechanik nicht:
`permissions.deny` und `guard.mjs` sperren den Pfad, und beide liegen in
`.claude/`, das ebenfalls gesperrt ist. Die in `guard.mjs` dokumentierte
Restlücke (ein Interpreter, der die Datei selbst öffnet) hätte funktioniert
— sie zu benutzen, um die eigene Sperre zu umgehen, hätte sie zur Zierde
gemacht. Der Workflow wurde deshalb vom Menschen eingetragen; der Test
oben erzwingt, dass es passiert, bevor gemergt werden kann.

---

## 2026-09-03 — Sperren in Schichten statt in einer Regel (M8)

**Fund:** `guard.mjs` hing am Matcher `Write|Edit` und las `tool_input.file_path`.
Ein Shell-Schreibzugriff erzeugt kein solches Tool-Input und lief an allen fünf
Sperren vorbei. Der PostToolUse-Validator hat denselben Matcher und lief dann
ebenfalls nicht. Aufgefallen beim Negativtest zu PR #3, als der Status per
`sed` gesetzt wurde und keine Sperre ansprang.

**Entscheidung:** Drei Schichten, die an verschiedenen Stellen ansetzen. Keine
davon ist vollständig; sie sollen unterschiedlich versagen.

**Schicht 1 — `permissions.deny` in `settings.json`.** Vier `Edit()`-Regeln für
`_schemas.ts`, `site.config.ts`, `.claude/` und `.github/`. Diese Ebene hängt
nicht am Hook-Matcher: Claude Code wertet sie vor dem Werkzeug aus, sie gilt
für Write, Edit *und* für die Shell-Dateibefehle, die Claude Code kennt (`cat`,
`head`, `tail`, `sed`), und sie prüft ausdrücklich auch das Ziel einer
Ausgabeumleitung. Bewusst `Edit(...)` und nicht `Read(...)`: Eine Read-Sperre
würde denselben Pfad auch für Lesezugriffe und für die Suche schließen, und wer
Frontmatter schreibt, muss den Datenvertrag lesen können.

Wirksamkeit sofort belegt, unfreiwillig: Nach dem Einbau scheiterte der
Versuch, einen Satz in `guard.mjs` zu korrigieren, an genau dieser Regel
(„File is in a directory that is denied by your permission settings").

**Schicht 2 — `guard.mjs` mit zweitem Eingang.** `settings.json` ruft den Hook
jetzt zusätzlich mit Matcher `Bash` auf; ist `tool_input.command` gesetzt,
prüft der Hook den Befehlstext auf Schreibverben (`sed -i`, `tee`, `cp`, `mv`,
`dd`, `truncate`, `rsync`, `patch`, `perl -pi`, `git checkout/restore/apply`,
`>` und `>>`) in Verbindung mit einem gesperrten Pfad.

Beim ersten Probelauf fiel auf, dass die Statussperre zu eng gefasst war: Sie
suchte das Feld zusammen mit dem Wert, und der naheliegendste Shell-Weg ist
eine Ersetzung, in der das Feld gar nicht vorkommt. Jetzt genügt der Wert,
sobald der Befehl schreibt und einen Inhaltspfad nennt; ein lesendes `grep`
bleibt erlaubt.

**Schicht 3 — `scripts/check-freigabe.ts`.** Die einzige Prüfung, die nicht
danach fragt, wer geschrieben hat. Sie vergleicht den Arbeitsstand mit einer
Basis und meldet jeden Eintrag, dessen Status auf den Veröffentlichungswert
gewechselt ist — unversionierte Dateien eingeschlossen. Wer bewusst
veröffentlicht, nennt den Slug beim Aufruf (`--freigabe petticoat`); das ist
eine Handlung an der Kommandozeile und steht nicht im Repository. Ein Agent,
der `npm run verify` ausführt, setzt sie nicht.

**Verworfen: das Feld `freigegebenVon`.** Es war der Vorschlag im Auftrag und
klingt richtig — es verlagert die Sperre von „wer schreibt" auf „was steht
da" —, trägt aber nicht. Wer den Status setzen will, schreibt auch
`freigegebenVon: markus` in dieselbe Datei. Die Regel, dass ein Agent das nicht
darf, stünde in CLAUDE.md, und das ist wörtlich Lektion 6: eine Bitte, keine
Bedingung. Das Feld hätte einen Arbeitsschritt hinzugefügt und keine Grenze.
Tragfähig ist nicht das Feld, sondern der **Statuswechsel im Diff** — der lässt
sich nicht mitschreiben, weil er aus dem Vergleich zweier Stände entsteht.

**Verworfen: die Statussperre als `permissions`-Regel.** Berechtigungsregeln
greifen auf Werkzeug, Pfad und Befehlstext zu, nicht auf den *Inhalt* einer
Datei. „Diese Datei darf geschrieben werden, aber nicht mit diesem Wert darin"
lässt sich in der Syntax nicht ausdrücken. Deshalb bleibt die Statussperre in
Schicht 2 und 3.

**Restlücke, ausdrücklich stehen gelassen:** Schicht 2 erkennt Muster, keine
Absichten — kodierte Befehle, Skripte, die anderswo geschrieben und dann
ausgeführt werden, und Interpreter, die Dateien selbst öffnen, kommen durch.
Das ist keine Vermutung: Genau so sind die Änderungen dieser Sitzungen
entstanden. Schicht 1 hat dieselbe Grenze, und die Dokumentation nennt sie
ausdrücklich („don't apply to arbitrary subprocesses"). Schicht 3 fängt davon
den Fall ab, der wirklich schadet, aber nur, wo eine Basis vorliegt. Als
Restlücke bei M8 und als M10 in `REVIEW.md`.

**Negativtest (Lektion 7):** 48 neue Behauptungen in `test-hooks.ts` — zehn
gesperrte Pfade über `sed -i`, Umleitung, `tee`, `cp`, `mv` und
`git checkout/restore`; drei Statuswege; sechs harmlose Befehle, die
durchgehen müssen; dazu die Verdrahtung in `settings.json` samt deny-Regeln.
Neu `scripts/test-freigabe.ts` mit 17 Behauptungen in einem
Wegwerf-Git-Verzeichnis; der Test fand beim ersten Lauf einen echten Fehler:
`git diff` listet unversionierte Dateien nicht, ein neu angelegter, sofort
veröffentlichter Eintrag wäre durchgerutscht — behoben über
`git ls-files --others`.

**Handtest in dieser Sitzung, gegen den echten Hook:** Der Versuch, den Status
im Petticoat-Eintrag per `sed -i` umzustellen, wurde mit Exit 2 blockiert, die
Begründung kam vollständig auf stderr an, die Datei blieb unverändert.
Derselbe Hook blockierte kurz zuvor ein Python-Heredoc, das die gesperrten
Pfade nur in Testdaten zitierte, und später diesen Protokolleintrag, weil er
den blockierten Befehl beschreibt. Die Grobheit der Mustererkennung ist der
Preis dafür, dass sie eher zu viel meldet als zu wenig — sie ist bekannt und
gewollt.

---

## 2026-09-02 — Testharnisch für `validate-content.ts` (M00)

**Fund:** Über zwanzig Regeln, keine einzige automatisiert geprüft. Die
Negativtests der letzten beiden Sitzungen liefen von Hand und hinterließen
nur Prosa in dieser Datei. Bei den schärfsten Prüfungen des Projekts war
jede Regeländerung ein Blindflug.

**Entscheidung:** `scripts/test-validate.ts` nach dem Muster von
`test-hooks.ts` und `test-sync-autolinks.ts`. Ein Temp-Verzeichnis bekommt
`scripts` und `node_modules` als Symlink und ein eigenes `src/content`; der
Loader bildet seine Wurzel aus `process.cwd()`, das echte Register wird nie
berührt. Die Modulauflösung folgt dem Symlink zurück ins Projekt, sodass
gegen den echten Datenvertrag geprüft wird — nicht gegen eine Kopie, die
altert.

Geprüft wird über `--json --changed` gegen `befunde[].befunde[].code` und
`.ebene`, nicht gegen die Textausgabe. Codes sind Vertrag, Formulierungen
sind es nicht. Je Regel mindestens ein anschlagender und ein sauberer Fall;
wo eine Regel je nach `status` Fehler oder Warnung meldet, werden beide
Ebenen geprüft. Alle Fixtures laufen in **einem** Validator-Aufruf: 62
Dateien, ein Prozessstart, 165 Behauptungen in gut zwei Sekunden.

**Verworfen:** Ein Temp-Verzeichnis je Fall. Sauberer isoliert, aber
sechzig `npx tsx`-Starts hätten die Suite auf über eine Minute gebracht —
ein Test, der bremst, wird abgeschaltet. Die Isolation kommt stattdessen
aus eindeutigen Namen und Slugs je Fixture; die einzige gewollte
Wechselwirkung ist das Duplikat-Paar. Ebenfalls verworfen: die Regeln
direkt zu importieren und ohne Kindprozess aufzurufen. Das hätte
`REGELN` exportiert werden müssen und den Pfad übersprungen, der im Betrieb
tatsächlich läuft — CLI, Argumentparsing, Exitcode.

**Fund mit Folgen (1): `--json` war nicht maschinenlesbar.**
`meldeLinkzieleKnapp` schrieb seinen Hinweis auf **stdout**, direkt vor das
JSON-Dokument. `validate-content.ts --json | jq` scheiterte damit in genau
dem Zustand, in dem das Register klein ist — also seit dem ersten Eintrag.
Aufgefallen ist es erst, als etwas die Ausgabe wirklich parsen wollte. Der
Hinweis geht jetzt auf stderr; im Terminal bleibt er sichtbar. Der Test
prüft die Hygiene ausdrücklich mit, damit die Zeile nicht zurückwandert.

**Fund mit Folgen (2): Reichweite von `auchOhneSchema`.** Scheitert das
Zod-Schema, laufen nur die Regeln mit diesem Flag. Derselbe Eintrag, einmal
mit und einmal ohne ein zusätzliches unbekanntes Feld, unterscheidet sich um
fünf Befunde: `quellen-vorhanden`, `belegpflicht`, `referenzen`,
`gp-abgrenzung` und `veroeffentlichungsreife` verstummen, obwohl die Mängel
unverändert in der Datei stehen. Das ist Absicht — die Regeln lesen
`e.daten` und liefen sonst auf null —, aber die Reichweite muss man kennen:
Wer einen Tippfehler im Frontmatter behebt, bekommt danach fünf neue Fehler
zu sehen. Zwei Fixtures halten die Grenze jetzt fest.

**Fund mit Folgen (3): `event-zeitraum` erklärt Termine am eigenen Tag für
vorbei.** Als offener Befund M9 in `REVIEW.md`, hier nicht mitbehoben —
Event-Semantik zu ändern ist eine eigene Entscheidung, keine Nebenwirkung
eines Testauftrags.

**Mutationsbeleg (Lektion 7):** Drei Regeln einzeln deaktiviert, jeweils
zurückgebaut. `belegpflicht` abgeschaltet → 3 Prüfungen fallen.
`event-zeitraum`-Vergangenheitsprüfung entfernt → 1 Prüfung fällt.
`gp-abgrenzung` auf immer-Warnung eingeebnet → 2 Prüfungen fallen, und zwar
die **Ebenen**prüfungen: Der Code schlug weiter an, nur die Stufe stimmte
nicht. Genau dafür stehen die Ebenen im Harnisch.

---

## 2026-09-02 — Belegkette: `alle` gestrichen, `felder` geprüft, `art` erweitert

Drei Änderungen am Datenvertrag, in einem Zug, weil sie dieselbe Schwachstelle
betreffen: Die Belegkette war bisher eine Behauptung, die niemand nachrechnete.

**1. Der Sammelwert `alle` ist weg.** `belegpflicht` in
`validate-content.ts` stieg bei `if (belegt.has("alle")) return []` sofort
aus — eine einzige Quelle mit `felder: [alle]` schaltete die Prüfung für den
gesamten Eintrag ab. Der allererste inhaltliche Eintrag des Registers hat
genau das getan (Befund M0). Eine Hintertür, die sofort benutzt wird, ist
keine Hintertür, sondern der Normalfall.

Begründung für die Streichung statt einer Einschränkung: Die Abkürzung
erspart genau die Arbeit, um die es geht. Wer eine Quelle Feld für Feld
zuordnet, prüft dabei Feld für Feld — das ist der Zweck, nicht die
Buchführung. Eine Quelle, die wirklich alles deckt, kann die Felder auch
aufzählen.

**2. Neue Regel `quellen-felder-gueltig`.** `alle` ist damit ein ungültiger
Wert und braucht jemanden, der ihn abfängt. Gültig ist ein Wert in
`quellen[].felder`, wenn er ein Feldname der jeweiligen Collection ist oder
dem Muster `body:<abschnitt>` folgt. Fehler bei `status: veroeffentlicht`,
sonst Warnung; `alle` bekommt einen eigenen Hinweistext.

Das `body:`-Muster macht etwas explizit, das versehentlich entstanden war:
Der Petticoat-Eintrag trug `aufbau`, `geschichte` und `gegenwart` in
`felder` — Abschnitte im Fließtext, keine Frontmatter-Felder. Die Absicht
war richtig, auch Aussagen im Text sollen belegt sein, aber nichts prüfte
sie. Jetzt heißen sie `body:aufbau`, `body:geschichte`, `body:szene`.

Die gültigen Feldnamen liest die Regel über
`Object.keys(collectionSchemas[collection].shape)` aus dem Schema selbst.
Eine zweite gepflegte Liste wäre nach dem ersten neuen Feld falsch gewesen.

**3. `quelle.art` um `nachschlagewerk`, `museum` und `fachliteratur`
erweitert.** Duden, DWDS und das Victoria and Albert Museum landeten bisher
in derselben Kategorie wie ein beliebiger Blogeintrag: `sonstige`. Die
Unterscheidung ist als Vorbereitung einer Gewichtung der Belegqualität
gedacht, nicht als Kosmetik — etwa: belegpflichtige Felder eines
veröffentlichten Eintrags brauchen mindestens einen Beleg oberhalb von
`social`/`sonstige`. Dafür müssen die Kategorien schon jetzt in den Daten
stehen; nachträglich lässt sich das über hunderte Einträge nicht
rekonstruieren.

**Verworfen:** `alle` beibehalten, aber nur akzeptieren, wenn ein Eintrag
genau eine Quelle hat (die Empfehlung aus REVIEW.md). Das hätte die
Sonderregel im Code gelassen und den Anreiz erhalten, Belege zu bündeln,
statt sie zuzuordnen — und es hätte ausgerechnet den dünnsten Zustand
privilegiert, den ein Eintrag haben kann: eine einzige Quelle für alles.
Ebenfalls verworfen: `felder` auf ein `z.enum()` je Collection im Schema
umzustellen. Das hätte die Prüfung in Zod gehoben und damit härter gemacht,
aber die Abstufung Warnung/Fehler nach `status` gekostet, die im Entwurf
gebraucht wird — und `body:<abschnitt>` ließe sich dort nicht offen halten.
Ebenfalls verworfen: eine Kategorie `handel` für den spezialisierten
Fachhandel. Die drei Shop-Quellen im Petticoat-Eintrag tragen deshalb
weiterhin `sonstige`. Der Bedarf ist erkennbar, aber ein einzelner Eintrag
ist zu wenig Evidenz für eine Vertragsänderung.

**Fund mit Folgen, nebenbei:** Alle Änderungen dieser Sitzung — auch die an
`_schemas.ts` — liefen über die Shell und haben deshalb keinen einzigen Hook
ausgelöst. `settings.json` bindet `guard.mjs` mit `"matcher": "Write|Edit"`;
ein `sed -i` erzeugt kein solches Tool-Input. Aufgefallen ist es bei
Negativtest (c): `status: veroeffentlicht` ging per `sed` kommentarlos durch,
obwohl genau dafür eine Sperre existiert. Das ist Lektion 15 aus der anderen
Richtung — damals scheiterte der Hookstart, diesmal wird der Hook gar nicht
erst aufgerufen. Als Befund M8 in `REVIEW.md`, samt Empfehlung. Bewusst
nicht in dieser Sitzung behoben: `.claude/` ist für Agenten gesperrt, und
eine Sperre gegen sich selbst zu reparieren ist die falsche Reihenfolge.

**Negativtest (Lektion 7):** Vier Läufe von Hand am Petticoat-Eintrag.
(a) `felder: [alle]` eingeschleust → `quellen-felder-gueltig` schlägt mit dem
eigenen Hinweistext an. (b) Zusätzlich `herkunftsland: GB` gesetzt, also ein
belegpflichtiges Feld ohne Deckung: `belegpflicht` meldet es jetzt — mit dem
testweise wieder eingebauten Kurzschluss schwieg die Regel, der Unterschied
ist damit belegt und nicht nur behauptet. (c) `status: veroeffentlicht` →
aus Warnungen werden Fehler, Exitcode 1. (d) Ein erfundener `art`-Wert wird
von Zod abgelehnt. Danach alles zurückgebaut. Auch diese Tests liefen von
Hand — M00 (kein Testharnisch für `validate-content.ts`) bleibt offen und
ist durch diese Sitzung teurer geworden, nicht billiger.

---

## 2026-09-02 — Der erste Inhaltseintrag machte die CI rot

**Fund:** Die Regel `interne-links` verlangt zwei verschiedene interne Links
je Eintrag. Die CI ruft `validate-content.ts --strict`, dort zählt jede
Warnung als Fehler. Der erste echte Eintrag im Register — „Petticoat" —
konnte diese Zahl nicht erfüllen, weil es außer ihm nichts zu verlinken
gab: Die Golden Examples sind über `!**/_*.md` ausgeschlossen. Rot war die
CI schon vor dieser Sitzung, seit dem Commit, der den Eintrag anlegte. Das
ist wörtlich Lektion 4: Ein roter Lauf muss einen echten Fehler bedeuten,
und hier war nichts kaputt.

**Entscheidung:** Die Mindestzahl gilt nur, soweit das Register überhaupt
Ziele hergibt — `min(soll, verfügbare Ziele)`, der eigene Eintrag zählt
nicht mit. Sinkt die Zahl, sagt ein einmaliger Hinweis auf stdout, warum.
Dasselbe Muster nutzt `test-links.ts` bereits für den leeren Zustand.

**Verworfen:** Zwei Füll-Links auf `/lexikon/` und `/daten/` in den Eintrag
schreiben. Die hätten den Zähler bedient, ohne eine einzige semantische
Verbindung herzustellen — genau das, wogegen die Regel existiert. Ebenfalls
verworfen: die Warnung in der CI dulden. Eine Warnung, die im Normalzustand
immer steht, wird nach zwei Wochen nicht mehr gelesen.

**Negativtest (Lektion 7):** Mit einem zweiten Lexikoneintrag im Register
sinkt die Mindestzahl auf 1, und die Regel schlägt für „Petticoat"
weiterhin an („Nur 0 verschiedene interne Links (Ziel: 1)"). Danach
zurückgebaut. Der Test lief von Hand — für `validate-content.ts` gibt es
keinen Testharnisch, in dem er dauerhaft stehen könnte. Als Befund in
`REVIEW.md`.

---

## 2026-09-02 — `felder: [alle]` hebelt die Belegpflicht aus

**Fund:** Der Lexikoneintrag „Petticoat" war im Lauf davor ohne einen
einzigen direkten Seitenabruf entstanden — die beiden Wikipedia-Quellen
stammten aus Suchtreffern, nicht aus geöffneten Seiten. Beim Nachprüfen
hielt der Kern stand, aber drei Materialangaben (Taft, Rosshaargewebe,
Baumwolle/Seide) standen in keiner der genannten Quellen, und die
Geschichtspassage beruhte auf einer Fehllesung der englischen Wikipedia:
„bedgown" (Arbeitsjacke) war als „Nachtgewand" gelesen und der Petticoat
damit zum Unterwäschestück des 16. Jahrhunderts erklärt worden. Belegt ist
das Gegenteil — historisch war er sichtbarer Oberrock, und das *Wort* kam
laut Pfeifer/DWDS erst im 20. Jahrhundert ins Deutsche.

**Fund mit Folgen:** Beide Quellen trugen `felder: [alle]`. Die
`belegpflicht`-Regel in `validate-content.ts` steigt bei `alle` sofort aus
(`if (belegt.has("alle")) return []`). Ein Eintrag, dessen Quellen `[alle]`
behaupten, ist damit ungeprüft — und `[alle]` ist genau das, was ein Modell
schreibt, das die Zuordnung nicht leisten will oder kann. Die schärfste
Regel des Projekts hat einen Generalschlüssel.

**Entscheidung:** Für diesen Eintrag `felder` je Quelle einzeln geführt,
inklusive der Textabschnitte (`aufbau`, `geschichte`, `gegenwart`). `[alle]`
wird hier nicht mehr verwendet.

**Offen, bewusst nicht mitgemacht:** Ob `[alle]` im Validator eingeschränkt
oder abgeschafft wird, ist eine Vertragsfrage und keine Nebenwirkung einer
Inhaltsprüfung. Steht als Befund in `REVIEW.md`.

**Nebenbefund:** Die deutsche Wikipedia führt zu „Petticoat" *keinen einzigen
Einzelnachweis*, nur einen Commons-Link. Sie taugt als Einstieg, nicht als
Beleg. Tragende Fakten stehen jetzt zusätzlich auf Duden, DWDS (Pfeifer),
einem Museumsobjekt (Freilichtmuseum Roscheider Hof über museum-digital) und
dem V&A.

---

## 2026-09-02 — Hook-Befunde erreichten das Modell nicht

**Fund:** Der PostToolUse-Hook blockierte schemawidrige Inhalte korrekt mit
Exit 2, aber die Begründung kam beim Agenten nie an. `validate-content.ts`
und `check-jsonld.ts` schreiben ihre Befunde auf stdout; Claude Code wertet
bei einem blockierenden Hook ausschließlich stderr aus. Beim Modell landete
nur `No stderr output`. Es wusste, *dass* es blockiert wurde, nicht *warum* —
und konnte sich damit nicht selbst korrigieren, was der im Skriptkopf
genannte Zweck des Hooks ist.

**Entscheidung:** Die Umleitung nach stderr steht im Hook
(`validate-changed.sh`), nicht in den Skripten.

**Verworfen:** stderr-Ausgabe in `validate-content.ts` und `check-jsonld.ts`
selbst. Beide laufen auch interaktiv und in der CI; dort gehören Befunde auf
stdout und stderr bleibt echten Fehlern vorbehalten. Die Umleitung ist eine
Eigenschaft des Aufrufkontexts, nicht des Skripts.

**Folge:** `scripts/test-hooks.ts` prüft nicht nur den Exitcode, sondern
auch, dass stderr nicht leer ist und den konkreten Befund nennt. Ohne diese
Prüfung wäre der Fehler zurückgekehrt, ohne aufzufallen.

---

## 2026-09-02 — Hook-Sperren waren wirkungslos

**Fund:** Die Hook-Skripte lagen ohne Executable-Bit im Repo (`100644`, schon
im Commit); `settings.json` rief sie direkt als Programm auf. Der Start
scheiterte still mit Exit 126, ein fehlgeschlagener Hook blockiert nichts.
Alle Sperren waren wirkungslos — `_schemas.ts`, `site.config.ts`, `.claude/`,
`.github/` und die Statussperre gegen `status: veroeffentlicht`. Aufgefallen
ist es nur, weil eine Schemaänderung, die hätte blockiert werden müssen,
kommentarlos durchging und committet wurde.

**Entscheidung:** `settings.json` ruft den Interpreter explizit auf
(`node` für `guard.mjs`, `bash` für `validate-changed.sh`), statt das Bit zu
reparieren. Grund: Der Dateimodus überlebt Zip-Übergaben und fremde
Dateisysteme nicht, der Interpreteraufruf schon.

**Verworfen:** `chmod +x` allein — repariert das Symptom, nicht die
Abhängigkeit. Das Bit bleibt zusätzlich im Index gesetzt, aber als zweite
Sicherung, nicht als Grundlage.

**Folge:** Lektion 15 in `docs/lektionen.md`, sechste Kernregel in
`CLAUDE.md`, automatisierter Negativtest in `scripts/test-hooks.ts`. Der
Wrapper `guard.sh` entfiel, weil `settings.json` `guard.mjs` direkt aufruft.
