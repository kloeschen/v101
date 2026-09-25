# Betrieb: Go-Live und agentische Pflege

Was noch fehlt, um online zu gehen — und wie danach die Inhaltspflege läuft.

---

## Teil 1 — Go-Live

### 1.1 Was in dieser Sitzung dafür entstanden ist

| Baustein | Status |
|---|---|
| `netlify.toml` mit Build, Node-Pin, CORS- und Content-Type-Headern | **neu** |
| Globaler Indexierungsschalter `PUBLIC_INDEXIERBAR` | **neu** |
| `scripts/stale-report.ts` — was liegt an | **neu** |
| `scripts/archive-events.ts` — Statuspflege vergangener Termine | **neu** |
| `.claude/settings.json` + drei Hooks (Guard, Validierung, SessionStart) | **neu** |
| `.github/workflows/pflege.yml` — wöchentliche Pflege als PR | **neu** |

Zwei davon schließen echte Lücken, die beim Durchdenken auffielen und die ich
vorher am gebauten Output verifiziert habe:

**Die CORS-Header waren wirkungslos.** `events.json.ts` und
`[bereich].ics.ts` setzen `Access-Control-Allow-Origin`, aber im statischen
Build verwirft Astro Response-Header — `dist/` enthält nur die nackten
Dateien. Die als „offen" dokumentierte Schnittstelle wäre aus dem Browser
nicht nutzbar gewesen, und `.ics` wäre als Download statt als Kalenderabo
behandelt worden. Jetzt in `netlify.toml`.

**Es gab keinen Aufbaumodus.** Die Site wäre ab dem ersten Deploy voll
indexierbar gewesen. Ein Register mit zwanzig Einträgen erzeugt keine
Autorität, und der erste Eindruck bei Crawlern ist schwer zu korrigieren.
`PUBLIC_INDEXIERBAR=false` (Voreinstellung) setzt jetzt `noindex` auf jede
Seite und liefert eine `robots.txt`, die alles sperrt. Umgestellt wird über
die Umgebungsvariable in der Netlify-Oberfläche — kein Commit, kein
Zurückrollen, falls es zu früh war.

Beim Einbau des Schalters ist mir prompt derselbe Fehler unterlaufen wie
seinerzeit bei `facetten.ts`: `import.meta.env` direkt in `site.config.ts`,
was jedes Node-Skript zerschossen hat, weil die Datei von beiden Laufzeiten
importiert wird. Behoben mit einer Zugriffshilfe, die beide Quellen kennt —
und diesmal mit Regressionstest in `test-feeds.ts`, der eine
`import.meta.env`-Nutzung in dieser Datei künftig als Fehler meldet.

### 1.2 Was du besorgen musst

1. **Domain.** Die Entscheidung ist teurer als sie aussieht: Sie steckt in
   jeder `@id` des Wissensgraphen. Ein späterer Wechsel bedeutet, jeden
   Knoten-Anker zu ändern und alle externen `sameAs`-Verweise nachzuziehen.
   Deutsch, sprechend, kurz — und prüfen, ob sie nicht früher schon einmal
   für etwas anderes benutzt wurde (Wayback Machine).
2. **Netlify-Site**, verbunden mit dem GitHub-Repo. Build `npm run build`,
   Publish `dist`, Node 22 — steht in `netlify.toml`.
3. **`src/site.config.ts` ausfüllen:** `url`, `name`, `kurzbeschreibung`,
   `zeitzone`, `sameAs` (erst eintragen, wenn die Profile existieren — ein
   toter `sameAs`-Link schwächt die Entitätserkennung).
4. **GitHub-Repo** mit den beiden vorhandenen Workflows; Branch-Schutz auf
   `main`, sodass Merges nur mit grüner CI möglich sind.

### 1.5 Rechtliches — nicht optional

Für eine in Deutschland betriebene Seite:

- **Impressum** nach § 5 DDG, von jeder Seite aus erreichbar.
- **Datenschutzerklärung**, die tatsächlich beschreibt, was passiert:
  Netlify als Hoster (Server-Logs, Auftragsverarbeitung), eingebettete
  Karten oder Schriften (besser: keine — Fonts selbst hosten spart den
  ganzen Abschnitt), Analytics.
- **Analytics ohne Einwilligungsbanner** wählen, etwa Netlify Analytics
  (serverseitig, keine Cookies) oder Plausible. Ein Cookie-Banner auf einem
  Register kostet Nutzer und bringt nichts.
- **Kontaktmöglichkeit** — bei einem Register ohnehin nötig, weil
  Korrekturen von außen kommen.
- **Bildrechte**: Das Schema erzwingt einen Rechtenachweis, aber niemand
  prüft, ob er stimmt. Für den Start: nur eigene Fotos und ausdrücklich
  freigegebenes Pressematerial.

Dazu die **Methodik-Seite**: Wie wird recherchiert, geprüft, aufgenommen?
Gibt es bezahlte Einträge? Diese Seite wird selten gebaut und wirkt bei
einem Register stark — sie beantwortet genau die Frage, die ein
skeptischer Leser und ein bewertendes Modell gleichermaßen haben.

### 1.6 Die Startschwelle

Nicht mit leerem Register live gehen, sondern mit `PUBLIC_INDEXIERBAR=false`
deployen und in Ruhe füllen. Meine Empfehlung für die Umstellung:

- 80+ Veranstaltungen, davon die Mehrzahl in der Zukunft
- 5 Regionsseiten mit echter Einordnung, nicht nur Listen
- 80 Lexikonbegriffe (der Autolink braucht Masse, um zu wirken)
- 2 Säulen der Themenkarte vollständig, nicht zehn halb
- Impressum, Datenschutz, Methodik, `/daten/` fertig

Danach: Schalter um, Sitemap in der Search Console anmelden, Wikidata-Item
anlegen, Profile auf Discogs/MusicBrainz/Instagram mit konsistenter
Beschreibung.

---

## Teil 2 — Agentische Pflege

### 2.1 Das Grundprinzip

> **Agenten recherchieren und schlagen vor. Skripte rechnen. Menschen
> veröffentlichen.**

Jede der drei Rollen macht das, was sie zuverlässig kann. Die häufigste
Fehlkonstruktion ist, ein Modell Dinge tun zu lassen, die ein Skript
deterministisch erledigt — das kostet Geld, dauert länger und fügt eine
Fehlerquelle hinzu, wo keine nötig war.

**Deterministisch, ohne Modell:** vergangene Termine archivieren, Autolinks
setzen, Links prüfen, Sitemaps bauen, Berichte erzeugen, alles validieren.

**Agentisch, weil Urteilsvermögen nötig:** neue Veranstaltungen finden,
Fakten aus unstrukturierten Websites extrahieren, Bandprofile schreiben,
redaktionelle Einordnung formulieren, Widersprüche zwischen Quellen
auflösen.

**Menschlich, weil Verantwortung:** Freigabe, Schemaänderungen,
Aufnahmeentscheidungen, alles Rechtliche.

### 2.2 Die Guardrails stehen jetzt im Code

`.claude/settings.json` mit drei Hooks — alle vier Fälle einzeln getestet:

| Hook | Wirkung |
|---|---|
| `PreToolUse` → `guard.mjs` | Blockiert Schreibzugriffe auf `_schemas.ts`, `site.config.ts`, `.claude/`, `.github/` — **und jedes `status: veroeffentlicht` durch einen Agenten** |
| `PostToolUse` → `validate-changed.sh` | Validiert die eben geschriebene Datei und meldet Fehler zurück, solange der Agent noch weiß, was er wollte |
| `SessionStart` | `stale-report.ts --brief`: drei Zeilen, was ansteht |

Die Schema-Sperre ist die wichtigste. Ein Modell, das an einem
Validierungsfehler hängt, kommt irgendwann auf die Idee, das Schema
anzupassen — und hebelt damit genau das aus, was es geschützt hat. In
CLAUDE.md ist das eine Bitte, im Hook eine Bedingung.

Geparst wird mit Node statt `jq`: Node ist im Projekt ohnehin Voraussetzung,
`jq` nicht. Ein Hook, der auf manchen Rechnern still mit „command not found"
durchfällt, ist schlimmer als keiner — im Container hier war genau das der
Fall.

### 2.3 Der Kreislauf

```
  stale-report.ts              →  sagt, was ansteht
        ↓
  Agent (Cowork oder Claude Code)
    recherchiert, schreibt status: entwurf, Belege pflicht
        ↓
  PostToolUse-Hook             →  validiert sofort, Agent korrigiert
        ↓
  Pull Request                 →  CI: verify --strict
        ↓
  Mensch prüft gebündelt       →  Freigabe = status: veroeffentlicht
        ↓
  Merge → Netlify deployt
        ↓
  Wöchentliche Pflege (deterministisch, als PR)
```

**Nie direkt auf `main`.** Ein Agent arbeitet auf einem Branch und öffnet
einen PR; die CI ist das Tor. Das gilt auch für die deterministische Pflege
— `pflege.yml` erzeugt bewusst einen PR statt eines Direktcommits, damit
Änderungen im Verlauf sichtbar bleiben.

**Gebündelt prüfen, nicht einzeln.** Zwanzig Einträge in einer Sitzung
freigeben ist schneller und konsistenter als zwanzigmal einzeln. Der
Stale-Report liefert die Warteschlange.

### 2.4 Die geplanten Läufe

| Wann | Was | Womit |
|---|---|---|
| montags 05:00 | Termine archivieren, Autolinks, Bericht → PR | `pflege.yml` (fertig) |
| montags 06:00 | Externe Links, Issue bei Funden | `linkcheck.yml` (fertig) |
| sonntags 04:30 | Suchlauf: zuerst Vorschläge aus dem Formular (`npm run vorschlaege`), dann die Quellenliste nach neuen Terminen absuchen, Warteschlange auf höchstens zehn `frei`-Posten auffüllen, Posten-PR selbst mergen | Routine, Ablauf in `docs/ablaeufe/termin-recherche.md` |
| monatlich | Zitations-Check gegen ein festes Prompt-Set | noch zu bauen |
| monatlich | Bot-Log-Auswertung aus den Netlify-Logs | noch zu bauen |
| laufend | Recherche neuer Entitäten | Cowork, aus dem Stale-Report gesteuert |

### 2.5 Der tägliche unbeaufsichtigte Lauf

Eingerichtet am 2026-09-20. Entstanden aus einer Messung, nicht aus einem
Wunsch.

> **STAND 2026-09-20: Die Routine läuft.** Belegt durch einen Lauf von Hand
> am selben Tag: Sitzung startet, Repository ist da, `npm ci` zieht 302
> Pakete in sechs Sekunden, `git push --dry-run` liefert Exitcode 0, und die
> GitHub-Werkzeuge sind als `kloeschen` authentifiziert. Recherchieren,
> bauen, pushen und einen Pull Request öffnen ist damit alles möglich.
>
> **Der Weg dahin ging über fünf gescheiterte Läufe, und die Lehre daraus
> steht in ENTSCHEIDUNGEN.md:** Es brauchte zweierlei gleichzeitig — ein
> **triviales Setup-Skript** (`echo setup ok`) und ein **zugeordnetes
> Repository**. Fehlt eins von beidem, bricht die Sitzung nach drei bis vier
> Sekunden mit `error_kind: init_script`, „Setup script failed" ab, ohne
> jede weitere Auskunft.
>
> **`npm ci` gehört deshalb nicht ins Setup-Skript, sondern in den Auftrag.**
> Im Container läuft es einwandfrei; im Setup-Skript ließ es die Sitzung
> jedes Mal abbrechen. Es spart dort eine Minute und kostet den ganzen Lauf.

#### Was der Lauf tut

0. `npm run archivieren`. **Steht vor allem anderen**, weil die Prüfkette
   sonst durch bloßen Zeitablauf rot wird: Ein Termin, der gestern vorbei
   ging und noch auf `geplant` steht, ist für `validate-content.ts` zu Recht
   ein Fehler — und färbt dann jeden Zweig rot, auch einen, der mit Terminen
   nichts zu tun hat. Am 2026-09-21 genau so passiert. Ergibt sich eine
   Änderung, gehört sie in denselben Pull Request.
1. Nimmt den **obersten freien Posten** aus `OFFENE-PUNKTE.md`
   (`npm run warteschlange:naechster`). Genau einen. Posten, die ein noch
   offener Zweig bereits bearbeitet, überspringt das Skript von selbst —
   Voraussetzung ist ein `git fetch origin` davor, denn gelesen werden die
   vorhandenen Refs und nicht das Netz.
2. Ist keiner frei: den dringendsten Posten aus `npm run stale`.
3. Baut ihn vollständig nach den Regeln aus `CLAUDE.md` — `npm run verify`
   grün, Mutationsbeleg für jede neue Regel, Eintrag in `ENTSCHEIDUNGEN.md`.
4. Öffnet einen Pull Request. **Nie direkt auf `main`.**
5. Merged selbst, wenn `npm run automerge:erlaubt` es erlaubt und die CI
   grün ist. Sonst bleibt der PR liegen.
6. Stößt er auf eine **Ermessensfrage**, baut er nicht: Er markiert den
   Posten als `mensch`, schreibt hin, was zu entscheiden ist, und meldet.
   **Was keine Ermessensfrage ist** (Entscheidung vom 2026-09-21): eine eng
   geführte Ausnahme von einer bestehenden Regel — begrenzt auf ein Feld an
   einem Typ, mit Negativtest und Mutationsbeleg. Die baut der Lauf selbst.
   Zum Menschen geht erst das Lockern der allgemeinen Regel. Der Anlass
   steht unten unter „Was der Doppellauf gezeigt hat".

#### Die zwei Regeln, die das tragen

**Die Warteschlange** (`scripts/warteschlange.ts`). Jeder Posten unter
„Als Nächstes" trägt `frei` oder `mensch`. Ein Posten ohne Marke ist ein
Fehler in der Prüfkette — nicht stillschweigend das eine oder andere.
Beide naheliegenden Voreinstellungen wären falsch, und die Begründung steht
im Kopf der Datei.

Seit dem 2026-09-21 überspringt `--naechster` zusätzlich jeden Posten, den
ein **noch nicht gemergter Zweig** bereits bearbeitet (`npm run
warteschlange:belegt` zeigt, welche das sind). Gefragt wird nach
Git-Refs, nicht nach Pull Requests: Das braucht kein Token und keinen
Netzaufruf, die Prüfkette bleibt offline, und ein Zweig zählt auch dann
schon, wenn noch gar kein Pull Request offen ist — genau das Fenster, in
dem der Doppellauf entstand. Als bearbeitet gilt ein Posten nur, wenn er am
**Abzweigpunkt** des Zweigs frei war und an dessen Spitze nicht mehr. Ohne
diese zweite Bedingung meldet ein Zweig, der bloß hinterherhinkt, alles als
bearbeitet, was nach seinem Abzweig dazukam — beim ersten Lauf gegen das
echte Repository prompt passiert.

**Die Auto-Merge-Grenze** (`scripts/automerge-erlaubt.ts`). Reine Code-PRs
dürfen bei grüner CI selbst mergen; alles unter `src/content/` wartet auf
einen Menschen.

Der Grund für genau diese Grenze: **Die Prüfkette beweist Struktur, nicht
Wahrheit.** Ein Tippfehler in einem Validator fällt in `npm run verify` auf,
eine falsch recherchierte Anfangszeit nicht. Beim Record Hop ist genau das
passiert — die Zeit war falsch, alle Prüfungen grün, gefunden wurde sie nur
durch Zufall. Code kann sich selbst beweisen, ein recherchierter Fakt nicht.

Beide Regeln stehen in Code und nicht im Prompt der Routine. Im Prompt wären
sie eine Bitte an ein Modell; als Skript sind sie ein Exitcode, und
`scripts/test-warteschlange.ts` belegt beide Richtungen (58 Prüfungen,
14 Mutationen).

#### Was der Lauf nicht darf

Unverändert und ausdrücklich: den freigegebenen Status setzen, eine der
vier gesperrten Dateien anfassen, auf `main` pushen, einen Inhalts-PR
mergen, oder einen `mensch`-Posten bauen. Die ersten beiden blockiert der
Hook. **Den Push auf `main` blockiert seit dem 2026-09-23 GitHub selbst**
(Ruleset „main schützen", siehe unten). Die übrigen sind Regeln mit Prüfung.

**Was der Branch-Schutz leistet, und was er nicht leisten kann.** Die
Agenten — der tägliche Lauf wie die interaktive Sitzung — treten gegenüber
GitHub als `kloeschen` auf, mit derselben Identität wie der Mensch. Daraus
folgen zwei Dinge:

- Die Umgehungsliste des Rulesets ist **leer**, auch für Admins. Stünde der
  Admin darauf, dürfte jeder Agent mit dessen Token direkt pushen, und die
  Sperre hielte niemanden auf. Der Preis: Auch der Mensch committet nicht
  mehr direkt auf `main`.
- Einen Pull Request mergen kann ein Agent weiterhin, denn er ist ja
  „kloeschen". Dass Inhalts-PRs auf den Menschen warten, bleibt deshalb eine
  Regel in `automerge:erlaubt` und im Prompt, keine Sperre. Pflicht-
  Genehmigungen würden das ändern, aber GitHub lässt niemanden die eigenen
  PRs genehmigen — in einem Repo mit einer Person sperrten sie den Menschen
  mit aus.

Das Ruleset verlangt **keine** Status-Checks: Auf Freigabe-PRs läuft die CI
nicht (Bot-Token), sie wären sonst nie mergebar. Die Kette läuft dort im
Freigabe-Workflow selbst, bevor der PR entsteht.

#### Was das kostet, und was es nicht löst

**Autonomie verschiebt den Engpass, sie beseitigt ihn nicht.** Erzeugt der
Lauf schneller Entwürfe, als jemand sie freigeben kann, ist die
Warteschlange vor der Freigabe der neue Engpass. Ein Posten pro Tag ist
bewusst niedrig angesetzt: Es soll höchstens ein Pull Request pro Morgen
dastehen.

**Unbeaufsichtigte Recherche liegt gelegentlich plausibel daneben.** Die
Belegpflicht erzwingt eine Quelle, nicht deren Richtigkeit. Mehr Durchsatz
heißt mehr davon — das ist der Preis, und er ist der Grund, warum Inhalt
nicht selbst merged.

**Und gemessen nach zwei Tagen:** Die Warteschlange wuchs von 9 auf 16
Posten, die `mensch`-Posten von 5 auf 10. Zwei Läufe haben einen Posten
abgearbeitet und acht erzeugt. Das ist kein Argument gegen die Läufe — die
Funde waren gut —, sondern dagegen, jede Unsicherheit zum Menschen zu
schicken. Die Verengung der Eskalationsregel in Schritt 6 ist die Antwort
darauf; ob sie reicht, zeigt die nächste Messung.

#### Was der Doppellauf gezeigt hat

Am 2026-09-20/21 nahmen zwei Läufe denselben Posten — ein Unfall, aber
nebenbei der bisher beste Vergleich zweier Arbeitsweisen unter identischem
Auftrag. Dreimal direkt vergleichbar, und **zweimal war die mutigere
Fassung die bessere**:

| | Ergebnis |
|---|---|
| `datePublished` | Lauf A entschied selbst und lag richtig; Lauf B eskalierte — Kosten: ein Tag und eine Werkliste, die der Eintrag deshalb nicht trug |
| Sitemap-Gegenprobe | Lauf B reparierte besser (beide Hälften des Filters statt einer) |
| Bandeintrag | Lauf A öffnete fünf Quellen statt zwei — und die drei zusätzlichen schwächten eine Angabe, fanden also ein echtes Problem |

Daraus folgt nicht „immer selbst entscheiden". Es folgt, dass „im Zweifel
eskalieren" zu grob war: Der eine Fall, in dem die Vorsicht griff, war
entscheidbar, und das Zögern hat nichts geschützt.

**Beide Läufe fanden unabhängig voneinander dieselbe blinde Prüfung** — die
Sitemap-Gegenprobe, die ihren Gegenstand nie gesehen hatte. Lektion 19 ist
damit nicht nur eine Warnung, sondern eine Suchheuristik: Wenn eine Sammlung
ihren ersten Eintrag bekommt, laufen Prüfungen zum ersten Mal. Dort ist mit
Funden zu rechnen.

### 2.6 Was für den agentischen Teil noch fehlt

1. ~~Das Plugin.~~ **Entschieden am 2026-09-23: kein Plugin, keine
   Konto-Skills.** Die Recherche-Skills im Konto stammten aus einem
   aufgegebenen Vorgängerprojekt und passten nicht auf dieses Schema. Der
   Ablauf steht jetzt als Text in `docs/ablaeufe/termin-recherche.md` —
   dort und nicht unter `.claude/skills/`, weil er ständig wächst und ein
   Agent ihn pflegen können soll (Lektion 18).
2. **Die Subagent-Definitionen** (`event-rechercheur` und Geschwister) mit
   `disallowedTools: Edit`, damit ein Recherche-Agent nur anlegt und nie
   Bestehendes überschreibt.
3. **Ein Freigabe-Skript** (`promote.ts`), das nach menschlicher Prüfung
   `status` setzt und `geprueftAm` aktualisiert — von Hand editieren führt
   irgendwann zu Tippfehlern im Frontmatter.
4. **Secrets für die CI**, falls ein Workflow ein Modell aufrufen soll:
   `ANTHROPIC_API_KEY` als Repository-Secret, mit Budgetgrenze. Die
   deterministischen Läufe brauchen keinen.
5. **CLAUDE.md** — existiert bisher nur als Skelett im Umsetzungsplan.
   Sollte die Guardrails spiegeln, damit ein Agent gar nicht erst versucht,
   was der Hook ohnehin blockiert.

### 2.7 Kostendisziplin

Recherche mit Subagenten ist der teuerste Teil. Was hilft:

- Jeder Agent bekommt `maxTurns` und ein enges Werkzeugset.
- Deterministisches nie an ein Modell geben (siehe 2.1).
- Discovery-Läufe crawlen zuerst mit einem Skript und lassen das Modell nur
  die gefundenen Kandidaten bewerten — nicht das Modell selbst crawlen.
  **Gemessen am 2026-09-23 trägt das noch nicht:** Von acht Quellen führte
  eine ihre Termine maschinenlesbar (Rockin' Wildcat, JSON-LD), und auch
  die lag bei einer Anfangszeit falsch. Der Suchlauf liest die Seiten
  deshalb vorerst mit dem Modell, begrenzt durch die Quellenliste und die
  Obergrenze von zehn Posten.
- Der Stale-Report begrenzt den Umfang: Ein Agent bekommt die zehn
  dringendsten Posten, nicht den Auftrag „finde alles".

---

## Vorschau und Freigabe

Zwei Dinge, die zusammen die Redaktionsarbeit erst möglich machen: ein Ort,
an dem Entwürfe aussehen wie fertige Seiten, und ein Weg, sie freizugeben,
ohne in Dateien zu greifen.

### Die Vorschau

Der Branch `vorschau` wird bei jedem Push auf `main` mitgezogen
(`.github/workflows/vorschau.yml`). Netlify baut ihn als Branch-Deploy, und
Branch-Deploys laufen laut `netlify.toml` mit `PUBLIC_ENTWUERFE = "true"` —
dort sind also auch Entwürfe zu sehen, jeder mit dem Kennzeichen
`[Entwurf]` in Listen und Facetten.

    https://vorschau--v101s.netlify.app

Die Adresse ist stabil, anders als die wechselnden Deploy-Preview-Links
eines Pull Requests. `PUBLIC_INDEXIERBAR` steht dort auf `"false"`: Die
Vorschau ist für Menschen mit dem Link, nicht für Suchmaschinen.

Was dort **nicht** auftaucht, auch nicht mit aktiven Entwürfen: die Feeds,
der Kalender, die Sitemaps. Was den Registerbestand verlässt, enthält nur,
was gilt — siehe `ENTSCHEIDUNGEN.md`.

### Die Freigabe

Über **Actions → Freigeben → Run workflow**. Zwei Felder: die Slugs
(kommagetrennt) und optional die Collection. Der Lauf ruft

    npm run freigeben -- --slugs <slugs>

setzt bei jedem Eintrag `status` auf den freigegebenen Wert und `geprueftAm`
auf heute, und öffnet einen Pull Request mit dem Bericht als Beschreibung.

Ein Eintrag wird nur freigegeben, wenn er im **freigegebenen Zustand**
`validate-content --strict` und `check-jsonld --strict` besteht. Geprüft
wird also nicht der Entwurf, sondern das, was entstehen soll: Die Regel
`veroeffentlichungsreife` meldet für einen Entwurf überhaupt nichts, ein
Eintrag ohne `autor` käme sonst durch. Fällt ein Eintrag durch, wird er
zurückgerollt, im Bericht mit Grund genannt — und der Lauf macht mit den
übrigen weiter.

**Seit dem 2026-09-23 gibt `freigeben.ts` gemeinsam frei**: alle Kandidaten
zugleich schreiben, dann prüfen, Durchgefallene zurückrollen, wiederholen,
bis nichts mehr kippt. Ein Artikel und der Begriff, auf den er verlinkt,
gehen also im selben Lauf durch, egal in welcher Reihenfolge. Fällt der
Begriff durch, fällt der Artikel mit — er zeigte sonst in der Produktion
ins Leere (`link-auf-entwurf`). Dasselbe gilt für Verweise im Frontmatter,
etwa einen Termin und die Band in seinem Line-up (`verweis-auf-entwurf`,
seit demselben Tag). Danach zieht das Skript den Autolink nach:
Der verlinkt nur freigegebene Ziele, ein eben freigegebener Begriff wird
also erst jetzt verlinkt, und zwar im selben Pull Request.

Bereits freigegebene Einträge werden übersprungen, nicht erneut angefasst.
Sonst wanderte `geprueftAm` bei jedem Lauf weiter und behauptete eine
Prüfung, die niemand vorgenommen hat.

**Der Prüfzettel** (`npm run pruefzettel`, seit dem 2026-09-25) ist für
genau diesen Blick gebaut. Er steht in der Beschreibung jedes Inhalts-PR des
täglichen Laufs und zeigt je Eintrag Beginn, Ort und Preis mit einem Klick
zur belegenden Quelle, darunter nur die Stellen, an denen sich Hinsehen
lohnt: Fakt nur von Aggregatoren belegt, Beginn an einer einzigen Quelle,
Abweichung laut Redaktionsnotiz, Termin nahe, Ort neu, keine Genres, alte
Quellen. Unauffällige Einträge stehen eingeklappt am Ende. Ohne Argument
listet er alle Entwürfe, mit `--basis origin/main` nur, was ein Zweig
ändert.

**Die Prüfung ist die Bedingung, der Klick ist die Entscheidung.** Das
Skript kann nur verhindern, dass etwas Fehlerhaftes freigegeben wird. Ob
ein fehlerfreier Eintrag *richtig* ist — ob der Termin stattfindet, ob der
Preis stimmt, ob die Quelle trägt —, sieht keine Regel. Das bleibt beim
Menschen, und deshalb steht am Ende ein Pull Request und kein Push auf
`main`.

### Wo die Prüfkette läuft, und warum nicht auf dem Pull Request

**Seit dem 2026-09-23 prüft der Freigabe-Workflow sein Ergebnis selbst**,
bevor er den Pull Request öffnet: Nach `freigeben.ts` läuft `npm run
verify:ci` auf dem Arbeitsstand mit den freigegebenen Einträgen, also die
ganze Kette mit Tests und Build. Scheitert sie, entsteht **kein** Pull
Request; der Bericht liegt trotzdem als Artefakt am Lauf.

Die Bestätigung, die `check-freigabe.ts` verlangt, kommt dabei aus
`FREIGABE_BESTAETIGT` — und zwar genau die Slugs, die `freigeben.ts` eben
tatsächlich freigegeben hat, nicht die Eingabe des Workflows. Abgelehnte
Einträge stehen nicht darin.

**Warum nicht einfach die CI auf dem Pull Request?** Aus zwei Gründen, die
beide am 2026-09-22 beim ersten echten Lauf sichtbar wurden:

1. **Sie läuft dort gar nicht.** Ein Pull Request, den ein Workflow mit
   seinem Bot-Token öffnet, bekommt einen CI-Lauf, der auf eine manuelle
   Freigabe wartet — und nach dem Merge als „failure" ohne einen einzigen
   Job stehen bleibt. Ein fehlender Haken sieht auf den ersten Blick aus wie
   einer ohne Befund.
2. **Liefe sie, endete sie zu früh.** `verify:ci` ist eine `&&`-Kette, die
   Freigabeprüfung ist Schritt 3 von 9, und auf einem Freigabe-Ergebnis
   schlägt sie planmäßig an. Tests und Build stehen dahinter und liefen nie.
   Genau dort lag beim ersten Mal der echte Fehler — hinter dem erwarteten
   Rot versteckt (Lektion 25).

Dass der Workflow-Schritt noch dasteht, prüft `test-pruefkette.ts`: Er muss
`npm run verify:ci` aufrufen, die Slugs aus `steps.lauf.outputs.slugs`
weiterreichen, nach dem Freigabelauf und vor `gh pr create` stehen.
`.github/` liegt hinter der Agentensperre — ohne diese Prüfung wüsste
niemand, ob ein Mensch den Schritt beim nächsten Umbau versehentlich
entfernt.

**Was das für dich beim Mergen heißt:** Ist der Freigabe-PR da, ist die
Kette gelaufen. Der CI-Eintrag am PR bleibt leer bzw. „failure ohne Jobs" —
das ist kein Befund. Die Prüfung, die zählt, steht im Lauf des Workflows
„Freigeben".

Von Hand geht es wie bisher: `freigeben.ts` gibt am Ende die
Bestätigungszeile aus.

    npx tsx scripts/check-freigabe.ts --freigabe petticoat --freigabe korsett

---

## Reihenfolge

1. Domain, Netlify, `site.config.ts` — dann steht die Site (unindexiert).
2. Impressum, Datenschutz, Methodik.
3. CLAUDE.md schreiben, Skills und Subagents als Plugin ins Repo.
4. Golden Examples für deine echten Starttypen, dann Prompt-Map.
5. Inhalte füllen, bis die Startschwelle erreicht ist.
6. `PUBLIC_INDEXIERBAR=true`, Search Console, Wikidata, Profile.
7. Erst danach: Zitations-Monitoring und Bot-Log-Auswertung.

Punkt 5 ist der lange. Alles davor ist in ein bis zwei Wochenenden machbar.
