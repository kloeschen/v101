# Design-Briefing — Vintage & Rockabilly Szenen-Guide

*Dieses Dokument in Claude Design hochladen oder in den ersten Prompt einfügen.*

---

## Was gestaltet wird

Ein deutschsprachiges **Nachschlagewerk und Register** der Vintage- und
Rockabilly-Szene im DACH-Raum: Veranstaltungen, Bands, Locations, Regionen,
ein Lexikon und Erklärartikel. Statische Astro-Site, sechs Seitentypen.

Es ist **kein Magazin und kein Shop.** Der häufigste Besuch dauert vierzig
Sekunden und beantwortet eine Frage: Wann ist das Festival, wo finde ich
einen Barber in Bochum, was heißt Psychobilly. Der zweithäufigste ist ein
Sprachmodell, das eine Teilantwort sucht.

## Was **nicht** gestaltet wird

Das HTML steht bereits und ist nicht verhandelbar. Es trägt Entscheidungen,
die an Struktur hängen, nicht an Optik:

- Reihenfolge im Quelltext: H1 → Antwortkapsel → Faktenblock → Fließtext →
  FAQ → abgeleitete Listen → Belege. Der Textinhalt muss **früh** im DOM
  stehen; Navigation kommt bewusst nach `<main>`.
- Der Faktenblock ist eine `<dl>`. Die dt/dd-Beziehung muss in jeder
  Bildschirmbreite erhalten bleiben.
- Kein Inhalt, der erst durch JavaScript entsteht. KI-Crawler rendern es
  unzuverlässig.
- Keine `localStorage`/`sessionStorage`-Nutzung.

**Bitte also kein neues Markup entwerfen.** Gesucht ist eine Gestaltung, die
sich an das vorhandene Markup bindet: Werte für den Token-Vertrag unten plus
CSS gegen die genannten Selektoren.

---

## Der Token-Vertrag

Die Komponenten greifen ausschließlich auf diese Variablen zu. Eine
Gestaltung besteht darin, sie zu belegen — und nur sie.

```
Farbe    --farbe-grund --farbe-flaeche --farbe-text --farbe-text-leise
         --farbe-linie --farbe-akzent --farbe-akzent-text --farbe-link
         --farbe-link-besucht --farbe-hinweis-grund --farbe-hinweis-linie
Schrift  --schrift-text --schrift-titel --schrift-ui
         --groesse-basis --groesse-klein --groesse-h1 --groesse-h2
         --groesse-h3 --zeilenhoehe --zeilenhoehe-titel
Raum     --raum-1 … --raum-6 --zeilenlaenge --inhalt-breite
Form     --radius --linie --schatten
```

Ein Dunkelmodus über `prefers-color-scheme` ist vorgesehen und soll mitkommen.

## Die Selektoren

```
.kapsel               Antwortkapsel, erster Absatz, trägt die Antwort
.fakten               <dl> Faktenblock
.fakten__zeile        <div> je Zeile, trägt data-feld="beginn|ort|preise|…"
.inhalt               Fließtext aus Markdown (h2/h3, p, ul, table, blockquote)
.faq / .faq__eintrag  Häufige Fragen
.liste                Abgeleitete Listen (Auftritte, Region, Verwandtes)
.liste__beschreibung  Kurzbeschreibung hinter jedem Listeneintrag
.facetten             Filterlinks auf Übersichtsseiten
.belege               Fußbereich: Prüfdatum, Autor, Quellen (<details>)
.hinweis              Statusmeldungen (Entwurf, abgesagt, letzte Ausgabe)
nav[aria-label="Brotkrumen"] / nav[aria-label="Hauptnavigation"]
```

`data-feld` erlaubt gezielte Auszeichnung einzelner Faktenzeilen (etwa
Preise oder Termin hervorheben) ohne Markup-Änderung.

---

## Publikum und Ton

- **Altersspanne von 20 bis 70+**, Schwerpunkt 35–60. Kleine Schrift und
  dünne Graustufen fallen hier sofort durch. Grundgröße nicht unter 17px,
  Fließtextkontrast deutlich über der Mindestanforderung.
- Die Szene ist **selbstironisch, aber nicht albern**. Sie erkennt sofort,
  ob jemand dazugehört oder Kostüm trägt.
- Viele Besuche vom Handy, unterwegs, oft auf Festivalgelände mit schlechtem
  Empfang. Gewicht der Seite zählt.

## Die Kitsch-Falle — der wichtigste Punkt

Das naheliegende Rockabilly-Design ist auch das falsche: Schachbrettmuster,
Schwungschriften wie Lobster oder Pacifico, Kirschrot auf Türkis, Würfel,
Flammen, Neonschilder, künstliche Vintage-Vergilbung.

Das liest sich wie ein Themenrestaurant, nicht wie ein Nachschlagewerk — und
es kostet genau die Glaubwürdigkeit, die eine Szene-Ressource braucht. Dazu
ist fast jedes dieser Mittel schlecht lesbar.

Die tragfähige Richtung ist **zeitgenössisch und periodenkundig, nicht
nachgestellt**: Anleihen bei gut gesetzten Drucksachen der Zeit — Katalogen,
Plattenhüllen, Programmheften, Tourpostern —, umgesetzt mit den Mitteln
heutiger Typografie. Gedeckte Farben mit einem einzigen kräftigen Akzent,
klare Raster, Linien statt Kästen, Zurückhaltung bei Effekten.

Faustregel für jede Entscheidung: **Würde das in einem Diner-Menü stehen
oder in einem sorgfältig gesetzten Katalog?** Der Katalog gewinnt.

## Bilder

Die Site funktioniert **ohne Bilder** und muss das auch. Band- und
Festivalfotos sind fast nie frei lizenziert; ein Entwurf, der auf große
Heldenbilder baut, ist nicht umsetzbar. Typografie und Raster müssen die
Arbeit machen. Wo Bilder vorkommen, sind es einzelne, kleinformatige eigene
Aufnahmen mit Bildunterschrift und Urhebernennung.

## Technische Grenzen

- **Schriften selbst hosten**, keine Google-Fonts-Einbindung. Maximal zwei
  Familien, maximal drei Schnitte — jeder weitere kostet Ladezeit für nichts.
- Kein CSS-Framework, keine Utility-Klassen. Reines CSS gegen die Selektoren
  oben; Astro bündelt es automatisch und inlined es bei geringer Größe.
- `prefers-reduced-motion` respektieren.
- Bei 200 % Zoom und 320 px Breite muss alles lesbar und bedienbar bleiben.
- Fokusindikatoren sichtbar lassen.

---

## Die sechs Bildschirme, die gebraucht werden

Mehr nicht — wenn diese stehen, steht die Site.

1. **Eventseite** — der reichste Fall: 17 Faktenzeilen, Line-up, FAQ,
   mehrere abgeleitete Listen, Belege.
2. **Lexikoneintrag** — der ärmste Fall: Definition, drei Faktenzeilen, 120
   Wörter. Muss trotzdem vollständig wirken, nicht wie eine leere Vorlage.
3. **Regionsseite** — vier bis sechs gestapelte Listen unterschiedlicher
   Länge. Hier entscheidet sich, ob die Gestaltung Struktur hält.
4. **Übersichts-/Facettenseite** — Kapsel, Filterlinks, lange Liste.
5. **`/daten/`** — Definitionslisten, Codepfade, Lizenztext.
6. **Startseite** — der einzige Bildschirm mit Gestaltungsfreiheit.
