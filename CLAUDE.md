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

Eine fünfte Regel wird **nicht** vom Validator erzwungen, gilt aber genauso:

5. **Widersprüche zwischen Quellen gehören in den Text, nicht in die
   Auswahl.** Eine Zuschreibung, die nur eine Quelle trägt, wird benannt und
   zugeordnet („steht in X, an weiteren Quellen nicht bestätigt") — samt
   dem, was stattdessen gesichert ist. Wer die schwächere Quelle
   stillschweigend weglässt, trifft eine Entscheidung, die der Leser nicht
   sehen kann. Ein Feld, dessen einziges Argument eine unbestätigte
   Zuschreibung wäre, bleibt leer, mit Begründung in der Redaktionsnotiz.
   Beispiel: `src/content/lexikon/bleistiftrock.md` (Dior 1948 gegen den
   DWDS-Erstbeleg 1950). Ausführlich: Lektion 20.

Vorlage: `src/content/lexikon/_golden-example.md`.

## Wie hier gearbeitet wird

**Ein Auftrag nennt vier Dinge:** das Ziel (nicht die Handgriffe), einen
konkreten Verweis zur Orientierung (das Golden Example schlägt jede
Beschreibung), die Grenzen, und wie das Ergebnis zu belegen ist. Der
letzte Punkt wird am ehesten weggelassen und am meisten gebraucht.

**Belege sind Mutationsbelege.** Eine Prüfung, die nie angeschlagen hat,
ist unbewiesen. Nach jeder neuen Regel absichtlich kaputte Daten
einschleusen, zeigen dass genau die erwarteten Behauptungen fallen, und
zurückbauen. Die Mutation auf den betroffenen Block begrenzen — wortgleiche
Zeilen anderswo erzeugen sonst einen Beleg, der nichts belegt.

**Widersprich, statt auszuführen.** Ein Auftrag, der auf einer falschen
Annahme beruht, soll zurückkommen — nicht umgesetzt werden. Das ist
mehrfach vorgekommen und war jedes Mal der bessere Ausgang: `aliases` war
bereits eine Warnung, `registry.ts` ist aus Node nicht ladbar, die
Vorabprüfung bei der Freigabe wäre blind gewesen.

**Frag bei Ermessensfragen.** Zahlen, Semantik, Abwägungen zwischen
vertretbaren Wegen gehören zum Menschen. Leg die Alternativen mit
Begründung daneben und bau erst danach.

**Erst messen, dann entscheiden.** Vor einer Regeländerung, die auf einer
Vermutung über die Wirklichkeit beruht: erheben. Die Erhebung über die
Veranstalter-Websites hat drei von drei Vermutungen widerlegt und ein
Problem gefunden, das niemand auf dem Schirm hatte.

**Nicht bauen ist eine Option.** Eine Prüfung mit hoher Fehlalarmquote
wird nach zwei Wochen ignoriert. Wenn etwas nicht tragfähig gebaut werden
kann, gehört die Begründung nach ENTSCHEIDUNGEN.md statt einer halbgaren
Fassung ins Repo.

**Offene Punkte gehören nach OFFENE-PUNKTE.md**, Entscheidungen nach
ENTSCHEIDUNGEN.md, Gelerntes nach docs/lektionen.md. Was in keiner der
drei steht, existiert nach der Sitzung nicht mehr.

## Vor jedem Commit

```
npm run verify
```

Prüft Typen, Zeitzonenkonvention, Inhalte, JSON-LD, Autolink-Drift, alle
Tests und den Build — jeden Schritt der CI-Kette, teils milder (Lektion 27).

Architekturentscheidungen, geänderte Regeln und Funde mit Folgen gehören
als Eintrag in `ENTSCHEIDUNGEN.md` — neueste oben.

## Wichtige Befehle

```
npm run stale         # was ansteht: Entwürfe, Überfälliges, Reihen ohne Folge
npm run autolink      # Lexikon-Links in die Quellen schreiben
npm run archivieren   # vergangene Termine auf "stattgefunden" setzen
npm run links:extern  # externe URLs prüfen
```

## Die sechs Regeln, an denen dieses Projekt hängt

Ausführlich mit den Fehlern, aus denen sie entstanden sind:
`docs/lektionen.md`. **Vor größeren Änderungen dort nachlesen.**

1. **Datumswerte nie ohne explizite Zeitzone** verarbeiten. Viermal
   passiert. `npm run check:zeit` erzwingt es.
2. **`import.meta` koppelt an Vite** und zerlegt jedes Node-Skript. Module,
   die beide Laufzeiten bedienen, brauchen eine Zugriffshilfe.
3. **Regeln, die zählen, gehören in Code.** Validator, Hook oder CI-Schritt —
   nicht in Prosa.
4. **Jede neue Regel braucht einen Negativtest.** Eine Prüfung, die nie
   angeschlagen hat, ist unbewiesen — und ein Ergebnis, das auch aus einem
   zweiten Grund eintreten könnte, belegt keinen von beiden. Jede Prüfung
   braucht ein positives Lebenszeichen ihres Gegenstands; „kein Fehler" ist
   keines.
5. **Kein Fakt ohne Quelle.** Unbekannt heißt Feld weglassen, nicht schätzen.
6. **Sperren müssen bewiesen sein.** Ein Hook, der noch nie blockiert hat,
   ist wirkungslos, bis das Gegenteil gezeigt wurde — und er scheitert still.

## Orientierung

- Golden Examples: `src/content/*/_golden-example.md` — daran orientieren,
  nicht an Beschreibungen.
- Termine finden und anlegen: `docs/ablaeufe/termin-recherche.md` —
  Quellenliste, Suchlauf, gesammelte Fallen.
- Architektur, Verträge und Begründungen: `README.md`
- Betrieb, Go-Live, agentische Workflows: `BETRIEB.md`
- Was als Nächstes ansteht: `OFFENE-PUNKTE.md`
- Befunde aus dem Review, auch die vertagten: `REVIEW.md`
- Warum etwas so ist, samt verworfener Alternativen: `ENTSCHEIDUNGEN.md`
- Lektionen aus dem Aufbau: `docs/lektionen.md`
- Arbeitsteilung Cloud/Rechner/CI: `ARBEITSWEISE.md`

## Was hier nicht passiert

Keine Änderungen an `site.config.ts` (die Domain steckt in jeder `@id` des
Wissensgraphen), an `.claude/` oder an `.github/`.

**Keine Recherche-Skills aus dem claude.ai-Konto.** events-recherche,
events-pflege, bands-recherche, barbershops-recherche, tattoo-recherche und
publish stammen aus einem aufgegebenen Vorgängerprojekt, festival-onboarding
und winzer-event-discovery aus der Weinmesse. Keiner davon gilt hier, auch
wenn sein Auslöser passt: fremdes Frontmatter, keine Belegpflicht, Push auf
`main`. Termine laufen über `docs/ablaeufe/termin-recherche.md`.

**Warum diese beiden Verzeichnisse.** Dort liegt die Mechanik der
Absicherung: Hooks, Berechtigungen, Agentendefinitionen, CI-Schritte. Was
sich selbst absichert, darf sich nicht selbst ändern — sonst ist die Sperre
eine Bitte. Die Erlaubnis stünde im Auftrag, die Sperre steht in
`permissions.deny` und `guard.mjs`, und beide liegen hinter derselben
Sperre. Genau so ist es gedacht (Lektion 16).

**Dokumentation über diese Mechanik ist etwas anderes** und liegt in
`docs/`. Sie beschreibt die Absicherung, sie führt sie nicht aus — und sie
lässt sich pflegen, ohne die Sperre anzurühren. Wer eine Datei anlegt,
entscheidet vorher: Mechanik oder Text über Mechanik? Was in `.claude/`
landet, ist damit für alle künftige Pflege mitgesperrt (Lektion 18).
