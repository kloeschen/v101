---
marke: frei
titel: "Lexikon, Bündel Epoche: Fifties, Wirtschaftswunder, Mid-Century Modern"
angelegt: 2026-10-15
vorrang: 1
---

Aus dem Lexikon-Vorrat in `OFFENE-PUNKTE.md` nach oben gezogen (Herkunft:
Lexikon-Vorrat 2026-10-15). Auswahl Markus vom 2026-10-09. Abgrenzungen
laut Vorrat:

- **Fifties** — gegen „50er" als bloße Jahreszahl. Alter Pfad
  `/jahrzehnt/50s`. **Nur von Hand verlinken:** „50er" steht laut Vorrat
  97-mal in 48 Dateien. Beim Bauen den Slug in `NUR_VON_HAND`
  (`src/lib/links.ts`) eintragen, mit Negativtest wie bei „Vintage".
- **Wirtschaftswunder** — im Vorrat ohne eigene Abgrenzung genannt; die
  Abgrenzung beim Bauen aus den Quellen gewinnen, nicht erfinden.
- **Mid-Century Modern** — gegen Vintage. Nachbar: `lexikon/vintage`.

Beim Bauen: Aliases gegen die genannten Nachbarn prüfen, nichts
überschneiden. `npm run autolink` danach laufen lassen und die Drift
prüfen; für Fifties muss der Negativtest zeigen, dass „50er" nicht
automatisch verlinkt wird.

Mit diesem Bündel ist der Lexikon-Vorrat leer. Neue Begriffe wählt
Markus aus.
