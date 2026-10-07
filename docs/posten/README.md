# Posten — die Warteschlange der Tagesläufe

Jede Datei in diesem Verzeichnis ist ein Posten: ein Arbeitsauftrag, den
ein Lauf oder Markus als Nächstes erledigt. Bis zum 2026-10-07 standen die
Posten als Absätze unter „Als Nächstes" in `OFFENE-PUNKTE.md`; dort
kollidierten parallele Läufe, weil sie benachbarte Zeilen derselben Datei
änderten (ENTSCHEIDUNGEN.md, 2026-10-07).

## Form

Dateiname: ein Slug, der den Posten benennt, etwa
`pullman-city-rockabilly-night-2026.md`. Der Dateiname ist die Identität
des Postens; über ihn erkennt `npm run warteschlange:belegt`, welcher
Posten auf einem offenen Zweig schon bearbeitet wird. Nicht umbenennen,
solange der Posten offen ist.

```
---
marke: frei
titel: "Pullman City: 1 Termin anlegen (27.12.2026, Rockabilly Night)"
angelegt: 2026-10-04
---

Der Auftrag als Fließtext: Herkunft, was die Quelle sagt, worauf beim
Bauen zu achten ist.
```

- **`marke`** — `frei`: ein Lauf darf das ohne Rückfrage bauen, das
  Ergebnis ist immer ein Pull Request, Inhalte immer `status: entwurf`.
  `mensch`: gehört Markus — Ermessen, Zahlen, Semantik, oder der Posten
  liegt hinter einer Sperre (`.claude/`, `.github/`, Schema,
  `site.config`).
- **`titel`** — eine Zeile. Lexikon-Posten beginnen mit „Lexikon: …" oder
  „Lexikon, Bündel …"; daran erkennt der Nachmittagslauf seinen Vorzug.
  Titel mit Doppelpunkt in Anführungszeichen.
- **`angelegt`** — der Tag, an dem der Posten in dieser Form entstand
  (`JJJJ-MM-TT`). Er bestimmt die Reihenfolge: neuester zuerst, bei
  gleichem Tag nach Dateiname. Ein zurückgegebener Rest bekommt den Tag
  der Rückgabe.

Keine Voreinstellung: Eine Datei ohne Marke, Titel, Tag oder Auftragstext
lässt `npm run warteschlange:check` scheitern, und der hängt in `verify`.
Die Begründung steht im Kopf von `scripts/warteschlange.ts`.

## Wer was tut

- **Tageslauf:** `npm run warteschlange:naechster` nennt Datei und
  Auftrag. Ist der Posten erledigt, wird **seine Datei gelöscht**. Bleibt
  ein Rest, wird die Datei auf den Rest gekürzt (und `angelegt` auf heute
  gesetzt) oder auf `mensch` gestellt — mit Begründung im Text. Andere
  Postendateien fasst der Lauf nicht an.
- **Suchlauf:** legt **neue Dateien** an, höchstens bis zur Obergrenze
  von zwölf `frei`-Posten (`npm run warteschlange:platz`).
- **Markus:** kann jede Datei ändern, umstellen oder löschen.

Diese README und Dateien mit `_` am Anfang sind keine Posten.
