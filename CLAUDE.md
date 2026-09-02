# Vintage 101 — Register der Vintage- und Rockabilly-Szene

Astro 7 (SSG), Deployment über Netlify. Deutsch. Inhalte liegen als Markdown
mit Frontmatter in `src/content/`, geprüft gegen `src/content/_schemas.ts`.

## Absolute Regeln

- **Der Zod-Vertrag in `src/content/_schemas.ts` ist bindend.** Änderungen
  daran nur auf ausdrückliche Anweisung — nie, um einen Validierungsfehler
  loszuwerden. Fehlt ein Feld: melden, nicht anlegen. (Ein Hook blockiert
  Schreibzugriffe auf diese Datei.)
- **Kein Fakt ohne Quelle.** Jeder recherchierte Wert braucht einen Eintrag
  in `quellen[]`, dessen `felder` ihn abdeckt. Unbekannt heißt: Feld
  weglassen, nicht schätzen. Halluzinierte Termine und Eintrittspreise sind
  das realistischste Schadensszenario dieses Projekts.
- **Neue Einträge haben immer `status: entwurf`.** `veroeffentlicht` setzt
  ausschließlich ein Mensch nach Prüfung (ebenfalls per Hook erzwungen).
- **Vor dem Anlegen gegen Duplikate prüfen.** Namen und `aliases` bestehender
  Einträge vergleichen, bevor eine neue Entität entsteht.
- **Keine fremden Texte übernehmen.** Veranstalterankündigungen immer selbst
  formulieren — doppelter Nutzen: kein Duplicate Content, und der eigene Text
  ist der zitierbare.
- **Keine Songtexte, keine Bilder ohne dokumentierte Rechte.**
- **Bands aus Line-ups nicht nebenbei anlegen.** Ohne eigene Seite gehören
  sie in `lineupWeitere`; ob eine Bandseite entsteht, entscheidet der Mensch.

## Lexikoneinträge: Grounding-Page-Bausteine

Lexikoneinträge folgen dem Grounding Page Standard v1.6
(groundingpage.com/spec/de/). Vier Regeln werden vom Validator erzwungen:

1. **Der erste Satz nennt den Begriff** — Muster: „Rockabilly ist ein/e …".
   Isoliert extrahiert wäre er sonst nicht zuzuordnen.
2. **Der Lead hat mindestens zwei Sätze**: Definition und Einordnung,
   idealerweise plus Abgrenzung.
3. **Jede H2 trägt den Begriffsnamen** — „Merkmale von Rockabilly", nicht
   „Merkmale". Abschnitte werden einzeln extrahiert und verlieren sonst
   ihre Zuordnung.
4. **`abgrenzung` ist Pflicht vor Veröffentlichung** — wovon wird der
   Begriff häufig verwechselt? Falsche Zuordnung ist die häufigste
   Fehlerquelle bei Entitäten, nicht fehlende Fakten.

Vorlage: `src/content/lexikon/_golden-example.md`.

## Vor jedem Commit

```
npm run verify
```

Prüft Typen, Zeitzonenkonvention, Inhalte, JSON-LD, alle Tests und den Build.

## Wichtige Befehle

```
npm run stale         # was ansteht: Entwürfe, Überfälliges, Reihen ohne Folge
npm run autolink      # Lexikon-Links in die Quellen schreiben
npm run archivieren   # vergangene Termine auf "stattgefunden" setzen
npm run links:extern  # externe URLs prüfen
```

## Die sechs Regeln, an denen dieses Projekt hängt

Ausführlich mit den Fehlern, aus denen sie entstanden sind:
`.claude/rules/lektionen.md`. **Vor größeren Änderungen dort nachlesen.**

1. **Datumswerte nie ohne explizite Zeitzone** verarbeiten. Viermal
   passiert. `npm run check:zeit` erzwingt es.
2. **`import.meta` koppelt an Vite** und zerlegt jedes Node-Skript. Module,
   die beide Laufzeiten bedienen, brauchen eine Zugriffshilfe.
3. **Regeln, die zählen, gehören in Code.** Validator, Hook oder CI-Schritt —
   nicht in Prosa.
4. **Jede neue Regel braucht einen Negativtest.** Eine Prüfung, die nie
   angeschlagen hat, ist unbewiesen.
5. **Kein Fakt ohne Quelle.** Unbekannt heißt Feld weglassen, nicht schätzen.
6. **Sperren müssen bewiesen sein.** Ein Hook, der noch nie blockiert hat,
   ist wirkungslos, bis das Gegenteil gezeigt wurde — und er scheitert still.

## Orientierung

- Golden Examples: `src/content/*/_golden-example.md` — daran orientieren,
  nicht an Beschreibungen.
- Architektur, Verträge und Begründungen: `README.md`
- Betrieb, Go-Live, agentische Workflows: `BETRIEB.md`
- Bekannte offene Punkte: `REVIEW.md`
- Lektionen aus dem Aufbau: `.claude/rules/lektionen.md`
- Arbeitsteilung Cloud/Rechner/CI: `ARBEITSWEISE.md`

## Was hier nicht passiert

Keine Änderungen an `site.config.ts` (die Domain steckt in jeder `@id` des
Wissensgraphen), an `.claude/` oder an `.github/`.
