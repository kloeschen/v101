# Claude Design für den Szenen-Guide — Prompting-Anleitung

---

## Die eine Weichenstellung

Deine Site ist kein leeres Blatt. Das Markup steht und trägt Entscheidungen,
die nicht optischer Natur sind: Reihenfolge im DOM, Definitionsliste für den
Faktenblock, kein JavaScript-abhängiger Inhalt, Content Parity zum JSON-LD.

Wenn du Claude Design bittest, „eine Website für eine Rockabilly-Datenbank"
zu gestalten, bekommst du einen überzeugenden Prototypen mit **eigenem**
Markup. Und dann hast du die schlechteste Variante: Entweder du übernimmst
ihn und zerstörst die Struktur, oder du baust ihn mühsam zurück.

Die richtige Bitte lautet deshalb nicht „gestalte eine Website", sondern:

> **Belege diesen Token-Vertrag und schreibe CSS gegen diese Selektoren.**

Dafür liegt jetzt alles bereit: `src/styles/tokens.css` definiert die
Variablen, `src/styles/basis.css` ist ein funktionierender, absichtlich
nüchterner Ausgangszustand, und `DESIGN-BRIEF.md` fasst Auftrag und Grenzen
zusammen. Eine neue Gestaltung ist damit ein Austausch dieser zwei Dateien —
kein Umbau.

## Erst das Repo verbinden, dann prompten

Claude Design kann ein Code-Repository einbinden, damit es die vorhandenen
Komponenten, die Architektur und die Styling-Muster kennt; laut Anthropic
werden Prototypen dadurch von Anfang an produktionsnäher. Für dich ist das
der größte Einzelhebel — mit Repo-Zugriff gestaltet Claude gegen dein echtes
Markup statt gegen eine Vorstellung davon.

Ergänzend hochladen: `DESIGN-BRIEF.md` und ein, zwei **Screenshots des
aktuellen Zustands** (ungestylt ist völlig in Ordnung — sie zeigen die reale
Informationsmenge, und genau daran scheitern hübsche Entwürfe).

Wenn du eine Richtung im Kopf hast, lade Referenzen hoch: fotografierte
Plattenhüllen, Programmhefte, Katalogseiten. Bilder sind hier
erstklassiger Input, kein Beiwerk — „mach es wie das hier" funktioniert
besser als jede Adjektivkette.

---

## Prompt 1 — Kickoff

```
Ich gestalte ein deutschsprachiges Nachschlagewerk zur Vintage- und
Rockabilly-Szene. Das Markup steht bereits und ist nicht verhandelbar —
siehe DESIGN-BRIEF.md, das ich hochgeladen habe.

Deine Aufgabe: Werte für den Token-Vertrag in tokens.css plus CSS gegen die
dort genannten Selektoren. Bitte kein neues HTML entwerfen.

Zeig mir zuerst die Eventseite — das ist der dichteste Fall mit 17
Faktenzeilen, Line-up, FAQ und drei abgeleiteten Listen. Wenn die trägt,
tragen die anderen fünf auch.

Wichtig: Das ist ein Nachschlagewerk, kein Themenrestaurant. Kein
Schachbrett, keine Schwungschrift, kein Kirschrot-auf-Türkis. Die Richtung
ist eine gut gesetzte Drucksache der Zeit — Katalog, Plattenhülle,
Programmheft —, umgesetzt mit heutiger Typografie.

Das Publikum ist 35 bis 60 Jahre alt. Lesbarkeit vor Effekt.
```

Der letzte Absatz ist kein Beiwerk. Ohne ihn landet fast jedes Modell beim
Diner-Klischee, weil das die häufigste Assoziation zum Stichwort ist.

## Prompt 2 — Richtungen erkunden

Claude Design ist ausdrücklich dafür gedacht, viele Richtungen schnell zu
erzeugen. Nutze das, aber gib den Richtungen Namen und Thesen, sonst bekommst
du dreimal dieselbe mit anderen Farben:

```
Zeig mir drei deutlich verschiedene Richtungen für dieselbe Eventseite,
jeweils mit einer These in einem Satz:

A "Katalog" — Serifen, schmale Spalte, viel Weißraum, Linien statt Flächen,
  ein einziger Akzent. Wirkt wie ein sorgfältig gesetztes Verzeichnis.
B "Programmheft" — kräftige Grotesk in den Titeln, engere Zeilen, Akzent als
  Fläche, Faktenblock als abgesetzter Kasten. Wirkt wie ein Festivalheft.
C "Archiv" — nüchtern, fast technisch, monospace für Daten und Uhrzeiten,
  sehr ruhige Farbigkeit. Wirkt wie eine Datenbank, die jemand liebevoll pflegt.

Alle drei mit demselben Markup und demselben Inhalt.
```

Danach entscheidest du **eine** Richtung und verfeinerst nur noch die.
Mischen führt zuverlässig zu Beliebigkeit.

## Prompt 3 — Der Härtetest

Bevor du dich festlegst, lass dieselbe Gestaltung auf den Grenzfällen laufen.
Hier scheitern Entwürfe, nicht auf der Vorzeigeseite:

```
Wende Richtung A unverändert auf drei weitere Fälle an:

1. Ein Lexikoneintrag: Definition, drei Faktenzeilen, 120 Wörter Text,
   keine FAQ, keine Bilder. Soll vollständig wirken, nicht wie eine
   halb ausgefüllte Vorlage.
2. Eine Regionsseite: sechs gestapelte Listen mit 2 bis 40 Einträgen.
3. Eine abgesagte Veranstaltung: Hinweisbox über dem Faktenblock,
   Vergangenheitsform, Preise ausgegraut.

Wenn eine davon bricht, will ich das lieber jetzt sehen.
```

## Prompt 4 — Verfeinern

Verfeinert wird über Gespräch, Inline-Kommentare, direkte Änderungen und
Regler, die Claude für Farbe, Abstand und Layout selbst erzeugt.

Was gut funktioniert, sind **relative Anweisungen mit Begründung**:

- „Dichter — die Faktenzeilen brauchen weniger Luft als der Fließtext,
  sie werden überflogen, nicht gelesen."
- „Der Akzent ist zu präsent. Er soll nur Links und den aktiven Zustand
  tragen, sonst nichts."
- „Die Kurzbeschreibungen in den Listen konkurrieren mit den Titeln.
  Kleiner und leiser."
- „Das Prüfdatum im Fußbereich soll auffindbar sein, aber nicht mit dem
  Inhalt konkurrieren — es ist ein Vertrauenssignal, keine Information."

Was schlecht funktioniert: „moderner", „hochwertiger", „mehr Wow". Solche
Anweisungen erzeugen Zufall.

Für Einzelstellen sind die Inline-Kommentare direkt am Element präziser als
jede Beschreibung im Chat.

## Prompt 5 — Tokens herausziehen

Der Schritt, der die Übernahme einfach macht:

```
Fasse die finale Gestaltung als vollständige tokens.css und basis.css
zusammen — genau die Variablennamen aus dem Briefing, keine zusätzlichen,
keine festen Farbwerte außerhalb von tokens.css.

Dazu: den Dunkelmodus-Block über prefers-color-scheme, und die
Schrifteinbindung als @font-face für selbst gehostete Dateien, nicht als
Google-Fonts-Link.
```

---

## Zurück nach Astro

1. `tokens.css` und `basis.css` im Repo ersetzen. Das Markup nicht anfassen.
2. Schriftdateien nach `public/fonts/` legen, `@font-face` mit
   `font-display: swap` und `preload` für den Fließtextschnitt.
3. `npm run verify` — der Lauf prüft weiterhin Inhalt, JSON-LD, Zeitzonen
   und Feeds. Eine Gestaltung darf davon nichts berühren; wenn doch,
   wurde am Markup gearbeitet.
4. Die sechs Bildschirme im Browser gegenprüfen: 320 px Breite, 200 % Zoom,
   Dunkelmodus, Tastaturnavigation.
5. Erst dann committen.

Alternativ gibt es die Übergabe von Claude Design an Claude Code — sinnvoll,
wenn die Gestaltung neue Komponenten mitbringt. Für einen reinen
Token-Austausch ist der manuelle Weg schneller und du behältst die Kontrolle
darüber, was ins Repo wandert.

---

## Was du Claude Design nicht überlassen solltest

- **Markup-Änderungen.** Sie sehen harmlos aus und kippen die Reihenfolge,
  an der Extrahierbarkeit hängt. Der Test danach ist immer:
  `npx tsx scripts/check-jsonld.ts`.
- **Heldenbilder.** Ein Entwurf, der große Fotos braucht, ist bei diesem
  Thema nicht umsetzbar — die Rechte gibt es nicht.
- **Interaktive Filter.** Die Facettenlogik hängt am
  Indexierungs-Schwellenwert und wird beim Build entschieden, nicht im
  Browser. Ein hübscher Filter-Prototyp führt hier in die Irre.
- **Die Startseite zuerst.** Sie ist der einzige Bildschirm mit Freiheit und
  deshalb der verführerischste — und der am wenigsten aussagekräftige. Wer
  mit ihr anfängt, gestaltet an den echten Seiten vorbei.

## Eine Erwartung zum Schluss

Claude Design ist als Research Preview eingestuft und darauf ausgelegt, den
Weg zum ersten Entwurf zu verkürzen — nicht, den letzten Schliff zu
liefern. Für dein Vorhaben passt das gut: Du brauchst keine
Designabteilung, sondern eine tragfähige, lesbare Grundgestaltung, die dem
Thema gerecht wird, ohne ins Kostüm zu rutschen. Rechne mit drei bis fünf
Runden für die Eventseite, danach geht der Rest schnell.
