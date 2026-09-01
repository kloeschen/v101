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

## Orientierung

- Golden Examples: `src/content/*/_golden-example.md` — daran orientieren,
  nicht an Beschreibungen.
- Architektur, Verträge und Begründungen: `README.md`
- Betrieb, Go-Live, agentische Workflows: `BETRIEB.md`
- Bekannte offene Punkte: `REVIEW.md`

## Was hier nicht passiert

Keine Änderungen an `site.config.ts` (die Domain steckt in jeder `@id` des
Wissensgraphen), an `.claude/` oder an `.github/`.
