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
| wöchentlich | Discovery: Veranstalter-Websites nach neuen Terminen absuchen | dein bestehender Skill, noch als Cron einzurichten |
| monatlich | Zitations-Check gegen ein festes Prompt-Set | noch zu bauen |
| monatlich | Bot-Log-Auswertung aus den Netlify-Logs | noch zu bauen |
| laufend | Recherche neuer Entitäten | Cowork, aus dem Stale-Report gesteuert |

### 2.5 Was für den agentischen Teil noch fehlt

1. **Das Plugin.** Deine Recherche-Skills, die Subagent-Definitionen und die
   Hooks als versioniertes Bündel unter `.claude/skills/` im Repo — dann
   sehen Cowork und dein lokales Claude Code dasselbe. Aktuell liegen die
   Hooks im Repo, die Skills aber nur in deinem Konto.
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

### 2.6 Kostendisziplin

Recherche mit Subagenten ist der teuerste Teil. Was hilft:

- Jeder Agent bekommt `maxTurns` und ein enges Werkzeugset.
- Deterministisches nie an ein Modell geben (siehe 2.1).
- Discovery-Läufe crawlen zuerst mit einem Skript und lassen das Modell nur
  die gefundenen Kandidaten bewerten — nicht das Modell selbst crawlen.
- Der Stale-Report begrenzt den Umfang: Ein Agent bekommt die zehn
  dringendsten Posten, nicht den Auftrag „finde alles".

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
