# Übergabe an die Cloud-Session

Zwei Teile: der einmalige Nachtrag der offenen Änderungen, und das Muster
für alles Weitere.

---

## Teil 1 — Die offenen Änderungen

Seit deinem letzten Push (Zod 4 / CI-Drift) sind neun Dateien dazugekommen
oder geändert. Zwei Wege, sie ins Repo zu bringen.

### Weg A: einmal lokal committen (empfohlen für diesen Stapel)

Zwei Minuten, kein Risiko, dass etwas anders umgesetzt wird als geprüft:

```bash
cd ~/Documents/Dev/v101
unzip -o ~/Downloads/v101.zip
npm run verify
git status --short
git add -A
git commit -m "Lexikon nach Grounding Page v1.6, Lektionen und Projektanweisungen"
git push
```

Ich empfehle diesen Weg, weil der Code hier bereits gebaut und mit
Negativtests belegt wurde. Eine Neuimplementierung in der Cloud-Session wäre
funktional gleichwertig, aber nicht dieselbe — und für einen Stapel, der
schon geprüft ist, ist das unnötiges Risiko.

Danach brauchst du den Rechner für dieses Projekt praktisch nicht mehr.

### Weg B: die Cloud-Session umsetzen lassen

Wenn du den Rechner gar nicht mehr anfassen willst, gib der Session diesen
Auftrag. Er ist so präzise formuliert, dass das Ergebnis dem geprüften Stand
entspricht.

```
Setze die folgenden Änderungen um. Arbeite auf einem Branch und öffne einen
Pull Request. Vor dem Commit muss `npm run verify` grün sein.

Hintergrund: Lexikoneinträge folgen ab jetzt dem Grounding Page Standard
v1.6 (groundingpage.com/spec/de/). Vier Bausteine werden erzwungen.

1) scripts/validate-content.ts — vier neue Regeln, nur für die Collection
   "lexikon", eingefügt vor der bestehenden Regel "lexikon-definition":

   - gp-erstsatz-nennt-begriff (auchOhneSchema): Der erste Satz des Body
     muss den Begriffsnamen oder einen Alias enthalten (normalisiert
     vergleichen). Sonst Fehler mit dem Hinweis auf das Muster
     "<Name> ist ein/e …" und der Begründung, dass der Satz isoliert
     extrahiert sonst nicht zuzuordnen ist.

   - gp-lead (auchOhneSchema): Der Absatz vor der ersten Überschrift soll
     mindestens zwei Sätze mit je über 15 Zeichen haben. Sonst Warnung:
     Der Standard sieht Definition, Einordnung und Abgrenzung vor.

   - gp-h2-nennt-begriff (auchOhneSchema): Jede H2 im Body muss den
     Begriffsnamen oder einen Alias enthalten. Codeblöcke überspringen.
     Bei status "veroeffentlicht" Fehler, sonst Warnung. Meldung nennt die
     betroffenen Überschriften und ein Beispiel ("Merkmale von <Name>").

   - gp-abgrenzung: Feld `abgrenzung` muss gesetzt sein. Bei status
     "veroeffentlicht" Fehler, sonst Warnung. Begründung: Falsche Zuordnung
     ist die häufigste Fehlerquelle bei Entitäten, nicht fehlende Fakten.

2) src/lib/jsonld/builders.ts — im lexikonBuilder:
   - "abgrenzung" in verwendeteFelder aufnehmen
   - im Knoten `disambiguatingDescription: d.abgrenzung` ergänzen,
     direkt nach `description`
   (faktenblockFelder enthält "abgrenzung" bereits, die Paritätsprüfung
   bleibt also grün.)

3) src/components/Quellen.astro — Label ändern zu
   "Zuletzt redaktionell geprüft am". Grund: "verifiziert" soll vermieden
   werden, damit nicht der Eindruck externer Zertifizierung entsteht.

4) src/layouts/EntitaetsLayout.astro — die Verwandtes-Liste bekommt den
   Titel `Verwandt mit ${daten.name}` statt "Verwandtes".

5) src/pages/[typ]/[slug].astro — die abgeleiteten Listen tragen den
   Entitätsnamen: "Kommende Auftritte von X", "Frühere Auftritte von X",
   "<Sammlung> in X", "Bands im Line-up von X".

   Grund für 4 und 5: Abschnitte werden einzeln extrahiert; eine
   Überschrift ohne Entitätsnamen verliert isoliert ihre Zuordnung.

Danach: Belege mit Negativtests, dass alle vier neuen Regeln anschlagen —
kaputte Daten einschleusen, Meldung zeigen, zurückbauen. Berichte das
Ergebnis.
```

Die neuen Dokumentationsdateien (`docs/lektionen.md`,
`PROJEKTANWEISUNGEN.md`, das aktualisierte `CLAUDE.md` und das
Lexikon-Golden-Example) lassen sich nicht sinnvoll als Auftrag beschreiben —
sie sind Prosa. Die kommen über Weg A oder du lädst sie in der Session als
Dateien hoch.

---

## Teil 2 — Das Muster ab jetzt

Ab hier ändert sich, was in diesem Chat entsteht: **keine Dateien mehr,
sondern Aufträge.**

Der Grund ist nicht Bequemlichkeit. Dateien, die hier entstehen und dort
eingespielt werden, erzeugen zwei Wahrheiten — und irgendwann weicht das
Repo von dem ab, was ich glaube, das darin steht. Ein Auftrag lässt das Repo
die einzige Quelle bleiben.

### Was hier passiert

Strategie, Themenkarten, Prompt-Map, Redaktionsentscheidungen, Textarbeit,
Bewertung von Ergebnissen. Und: das Formulieren präziser Aufträge.

### Was dort passiert

Alles, was ins Repo schreibt. Auf einem Branch, mit Pull Request, mit
grünem `npm run verify`.

### Wie ein guter Auftrag aussieht

Er nennt vier Dinge, und zwar in dieser Reihenfolge:

1. **Was erreicht werden soll** — das Ziel, nicht die Handgriffe.
2. **Woran es sich orientieren soll** — das Golden Example, die bestehende
   Regel, die Datei mit demselben Muster. Konkreter Verweis schlägt
   Beschreibung.
3. **Die Grenzen** — was nicht angefasst werden darf, welche Prüfung grün
   sein muss.
4. **Wie das Ergebnis zu belegen ist** — Negativtest, Build, Stichprobe im
   gebauten HTML.

Punkt 4 ist der, den man am ehesten weglässt und am meisten braucht. Fast
jeder echte Fehler in diesem Projekt kam heraus, weil etwas ausgeführt statt
nur durchdacht wurde.

### Beispiel für einen guten Auftrag

```
Lege die ersten zehn Lexikoneinträge aus der Kategorie Mode an.
Begriffe: Petticoat, Wiggle Dress, Bullet Bra, Nahtstrümpfe, Creepers,
Bowling Shirt, Pork Pie Hat, Victory Rolls, Pomade, Bandana.

Orientiere dich an src/content/lexikon/_golden-example.md — Struktur,
Länge, Tonfall.

Regeln: status bleibt entwurf. Jeder Fakt braucht eine Quelle in quellen[]
mit den abgedeckten Feldern. Abgrenzung ist Pflicht. Jede H2 trägt den
Begriffsnamen. Keine fremden Texte übernehmen.

Wenn du zu einem Begriff keine belastbare Quelle findest, lass ihn aus und
sag mir, welchen.

Danach: npm run verify muss grün sein. Öffne einen PR und berichte, welche
Begriffe du angelegt hast und wo du unsicher warst.
```

### Was du dabei behältst

Die Freigabe. `npm run stale` zeigt die Warteschlange, du prüfst gebündelt,
`status: veroeffentlicht` setzt nur ein Mensch — der Hook blockiert es für
Agenten.
