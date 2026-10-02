# Design-Briefing — Vintage 101, das Vintage-Portal

*Dieses Dokument in Claude Design hochladen oder in den ersten Prompt einfügen.*

> **Neu seit 2026-10-02: Portal statt Register.** Markus hat die Richtung
> geändert: Die Site bleibt inhaltlich so klar und belegt wie bisher, soll
> aber als **Portal** auftreten, nicht als Verzeichnis. Gewählt ist die
> Richtung **„Plattenhülle"** (Abschnitt „Das Gestaltungssystem"). Die
> Entwürfe liegen auf der Zeichenfläche „Vintage 101 – Portal-Entwürfe"
> (claude.ai, privat): Startseite, Startseite auf dem Handy,
> Lexikoneintrag Petticoat, Eventseite Rockabilly Convention 2027 hell und
> dunkel. Was sich daraus für Markup und Regeln ändert, steht in den
> Abschnitten unten; was noch offen ist, in „Offene Fragen".
>
> **Stand der Messungen: 2026-09-16.** Alle Zahlen und Selektoren in diesem Dokument sind
> aus dem **tatsächlich erzeugten HTML** gezogen (`astro build`, einmal mit
> `PUBLIC_ENTWUERFE=false`, einmal mit `true`), nicht aus den Komponenten
> abgelesen. Wer es nachzieht, misst wieder — die erste Fassung entstand, als
> das Register leer war, und lag danach in fast jeder Zahl daneben.
>
> Stand des Bestands: 38 Inhaltsdateien, 62 gebaute Seiten, alles
> freigegeben. Sammlungen **Bands und Artikel sind leer** — davon hängt
> unten mehr ab, als man denkt.

---

## Was gestaltet wird

Ein deutschsprachiges **Portal** der Vintage- und Rockabilly-Szene im
DACH-Raum: Termine, Bands, Orte und Läden, Regionen, ein Lexikon und
Artikel. Statische Astro-Site. Das Logo trägt den Anspruch schon im Namen:
„Vintage 101 – Das neue Vintage Portal".

**Portal heißt nicht Magazin.** Es gibt keine Meldungen, die veralten, und
keinen Text, der nur der Stimmung dient. Was sich ändert, ist der Auftritt:
Die Startseite führt durch die Szene (Ressorts, Wochenende, Orte, Begriff
im Fokus), statt Sammlungen aufzuzählen, und die Seiten dürfen mehr
hermachen. Die inhaltliche Klarheit bleibt: Der häufigste Besuch dauert
vierzig Sekunden und beantwortet eine Frage — wann ist das Festival, wo
finde ich einen Barber in Bochum, was heißt Psychobilly. Der zweithäufigste
ist ein Sprachmodell, das eine Teilantwort sucht. Beides muss das Portal
weiterhin schneller bedienen als jedes Magazin.

## Was **nicht** verhandelbar ist

Bis zum 2026-10-01 galt: Das HTML steht, gestaltet wird nur über Tokens und
CSS. Für den Portal-Auftritt reicht das auf der **Startseite und im
Seitenkopf** nicht mehr — dort entstehen neue Bausteine (Abschnitt „Neue
Bausteine"). Auf den **Entitätsseiten** gilt die alte Regel weiter: Sie
werden über Tokens und CSS umgestellt, das Markup bleibt. Unverhandelbar
bleiben überall die Entscheidungen, die an Struktur hängen:

- Der Textinhalt steht **früh** im DOM; die Hauptnavigation kommt bewusst
  **nach** `</main>`, ganz am Ende des `<body>`.
- Der Faktenblock ist eine `<dl>`. Die dt/dd-Beziehung muss in jeder
  Bildschirmbreite erhalten bleiben.
- Kein Inhalt, der erst durch JavaScript entsteht. KI-Crawler rendern es
  unzuverlässig.
- Keine `localStorage`/`sessionStorage`-Nutzung.

Auf Entitätsseiten also kein neues Markup. Der Faktenblock darf optisch als
Seitenspalte neben dem Text stehen (so im Entwurf), bleibt im DOM aber vor
dem Fließtext.

---

## Das Gestaltungssystem: Plattenhülle

Anleihen bei Plattenhüllen und Katalogen der Fünfziger, gesetzt mit
heutiger Typografie. Entschieden am 2026-10-02 (Markus), aus drei
Richtungen (Plattenhülle, Programmheft, Nachtausgabe).

**Logo.** Das bestehende Logo „Vintage 101 – Das neue Vintage Portal"
(Pinselschrift, „101" in Rosé) und das Monogramm „V101". Das Logo ist das
**einzige** Element in Schwungschrift; alles andere bleibt klar gesetzt.
Für dunkle Flächen gibt es eine helle Fassung (im Entwurf aus dem Original
umgefärbt, muss vom Original nachgezogen werden). Die vorliegenden Dateien
sind 300 × 120 px — für die Site braucht es SVG oder mindestens die
doppelte Auflösung.

**Farben.** Papier `#F5F4EF`, Tinte `#1C1C1E`, leise `#4A4F59`, Linie
`#D6D3CA`, Rosé aus dem Logo `#9A4A53`. Gemessen: Weiß auf Rosé 6,0:1,
Rosé auf Papier 5,5:1. **Rosé bedeutet „jetzt / demnächst"** und sonst
nichts: Wochenende, Datumsziffern, Regionsbalken, der Navigationspunkt
„Termine". Ressorts, Artikel und Lexikon bleiben Tinte und Papier.
Dunkelmodus: Grund `#16151A`, Feld `#1F1E24`, Text `#EEEBE4`, leise
`#B3AEA4`, Linie `#38363E`, Rosé als Schrift `#D68C94`, Rosé als Fläche
`#8C3F48`.

**Schrift.** Archivo (variabel, schmal bis 62 %) für Plakatzeilen,
Datumsziffern, Etiketten und Bedienelemente; Newsreader für Fließtext und
die ruhigen Abschnittsüberschriften. **Nur ein lautes Element je
Abschnitt:** schmale fette Großbuchstaben für Aufmacher, Ressortnamen,
Datumsziffern und die H1 — Abschnittsüberschriften in normaler
Schreibweise in Newsreader. Die H1 passt sich der Breite an
(`clamp()`) und darf trennen, damit auch „Taillenmieder" passt.

**Katalognummern.** Jedes Ressort trägt eine Nummer wie auf einem
Plattenlabel: V101-01 Musik, -02 Mode, -03 Tanz, -04 Autos, -05 Frisur,
-06 Szene. Sie steht über Artikeln und Lexikoneinträgen des Ressorts.

**Linien statt Kästen**, 3 px Tinte als Abschnittskante, 1 px als
Trennlinie. Flächen nur für den Wochenend-Block (Rosé), den Begriff im
Fokus und den Oldtimer-Hinweis (Tinte) und die Ressort-Kacheln
(Schachbrett Tinte/Papier).

## Neue Bausteine

Neu im Markup, Stand der Entwürfe:

- **Seitenkopf vor `<main>`:** Logo, Suchfeld, „Termin melden",
  Ressortleiste (Termine, Musik, Mode, Tanz, Autos, Frisur, Szene, Orte &
  Läden, Regionen). Die vollständige Hauptnavigation bleibt nach
  `</main>`. Der Kopf muss kurz bleiben, damit der Textinhalt weiter früh
  im DOM steht.
- **Startseite:** Aufmacher (ein Artikel), „Dieses Wochenende" (nur Samstag
  und Sonntag; leer → „Als Nächstes"), Kalender ab dem Ende des
  Wochenendes ohne Doppelungen, sechs Ressort-Kacheln, „Wohin, mit wem, zu
  wem" (Orte, Bands, Läden), Begriff im Fokus, Termine je Region,
  Artikel, „Jede Angabe belegt" mit Monogramm und Meldeaufruf.
- **Querverweis Band ↔ Termin:** Hat eine Band im Line-up eine eigene
  Seite, zeigt der Termin „Band im Portal" und die Band „Live am …".
- **Eventseite:** große Datumsfläche in Rosé neben der H1; Line-up als
  Zeitplan, Preise als Tabelle — beides aus Feldern, die es schon gibt.
- **Zählungen überall gleich:** „36 kommende Termine" heißt kommende, nicht
  alle Dateien.

---

## Das Gerüst einer Entitätsseite

So sieht es wirklich aus — abgenommen von `/lexikon/petticoat/`:

```
body
  main
    nav[aria-label="Brotkrumen"]
    article
      h1
      p.hinweis                 ← nur bei Entwurf, siehe unten
      dl.fakten
        div.fakten__zeile[data-feld]   (dt + dd, dd ggf. mit span.trenner)
        …
      div.inhalt                ← Fließtext; SEIN ERSTER ABSATZ IST DIE KAPSEL
        h2 … p …
      section.faq               ← existiert, wird derzeit nirgends erzeugt
      section.liste             ← abgeleitete Listen, je mit h2
      section.liste.liste--knapp     ("Verwandt mit …")
      footer.belege
        p.belege__stand > span.belege__autor
        details.belege__quellen > summary + ul > li > span.belege__abgerufen
  nav[aria-label="Hauptnavigation"]
```

**Zwei Dinge daran überraschen und sind trotzdem so gewollt:**

1. **Der Faktenblock steht VOR dem Fließtext.** Die alte Fassung dieses
   Briefs behauptete die Reihenfolge „H1 → Antwortkapsel → Faktenblock →
   Fließtext". Das stimmt nicht und hat nie gestimmt.
2. **Auf Entitätsseiten gibt es keine `.kapsel`.** Die Antwortkapsel ist
   der erste Absatz innerhalb von `.inhalt` — ein gewöhnliches `<p>` ohne
   eigene Klasse. Gestalterisch erreichbar nur als `.inhalt > p:first-child`.
   `.kapsel` als Klasse gibt es ausschließlich auf Übersichts-,
   Facetten- und Startseite sowie auf `/daten/`.

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

**Gegen `src/styles/tokens.css` abgeglichen: 32 zu 32, keine Abweichung.**
Der Vertrag ist als einziger Teil des alten Briefs unverändert gültig. Drei
Anmerkungen, die man beim Belegen braucht:

- **Drei Token sind deklariert, aber werden nirgends per `var()` gelesen:**
  `--farbe-flaeche`, `--farbe-akzent-text`, `--schatten`. Sie zu setzen
  ändert heute nichts. Sie stehen als Reserve im Vertrag — wer sie benutzen
  will, braucht CSS, das sie liest.
- **`--farbe-akzent-text` hat keine Dunkelmodus-Fassung.** Im Hellmodus
  steht Weiß auf `#8c2f24`, im Dunkelmodus bliebe Weiß auf `#e0705f` — das
  reicht nicht. Solange der Token ungenutzt ist, fällt es nicht auf; wer ihn
  in Gebrauch nimmt, muss ihn im Dunkelmodus mitbelegen.
- Ein Dunkelmodus über `prefers-color-scheme` ist vorgesehen, vorhanden und
  soll mitkommen. Er belegt zehn der elf Farbtoken neu.

## Die Selektoren

Vollständig, aus dem Produktionsbuild gezogen, mit der Häufigkeit über alle
62 Seiten. **„kein CSS" heißt: die Klasse steht im HTML, `basis.css` hat
aber keine Regel dafür** — sie rendert heute als nackter Fließtext.

| Selektor | × | Was es ist |
|---|---|---|
| `.fakten` / `.fakten__zeile` | 38 / 242 | `<dl>` Faktenblock; jede Zeile trägt `data-feld` |
| `.trenner` | 51 | **kein CSS** — `<span>, </span>` zwischen mehreren Werten in einem `dd` |
| `.inhalt` | 38 | Fließtext aus Markdown |
| `.liste` | 69 | abgeleitete Listen und Übersichtslisten |
| `.liste--knapp` | 39 | **kein CSS** — Modifikator, unterdrückt die Kurzbeschreibungen |
| `.liste__beschreibung` | 98 | Kurzbeschreibung hinter einem Listeneintrag |
| `.liste__datum` | 6 | Datum vor einem Termin (nur Startseite) |
| `.liste__entwurf` | 0 | **kein CSS**, nur in der Vorschau — siehe eigener Abschnitt |
| `.kapsel` | 24 | Antwortkapsel — **nur** Übersichten, Facetten, Start, `/daten/` |
| `.belege` | 38 | Fußbereich |
| `.belege__stand` | 38 | **kein CSS** — „Zuletzt redaktionell geprüft am …" |
| `.belege__autor` | 38 | **kein CSS** — der Name im Prüfsatz |
| `.belege__quellen` | 38 | **kein CSS** — `<details>` mit `<summary>Quellen (n)</summary>` |
| `.belege__abgerufen` | 113 | Abrufdatum je Quelle |
| `.facetten` | 1 | Filterlinks — **nur auf `/events/`** |
| `.sammlungen` + `__anzahl` + `__beschreibung` | 1 / 4 / 4 | Sammlungsliste der Startseite |
| `.hinweis` | 0 | Statuskasten — Entwurf und `noindex`, sonst nichts |
| `.faq` / `.faq__eintrag` | 0 / 0 | Komponente existiert, **kein Eintrag hat FAQ-Daten** |
| `nav[aria-label="Brotkrumen"]` | 38 | über der H1 |
| `nav[aria-label="Hauptnavigation"]` | 62 | nach `</main>` |

`data-feld` erlaubt gezielte Auszeichnung einzelner Faktenzeilen ohne
Markup-Änderung. Tatsächlich vorkommende Werte, nach Häufigkeit: `verwandt`,
`kategorie`, `definition`, `abgrenzung` (je 17), `typ`, `region` (16),
`aeraVon` (12), `herkunftsland` (10), `ort`, `links`, `durchfuehrung`,
`bezeichnungEn`, `beginn` (9), dann absteigend bis zu Einzelfällen wie
`camping`, `oepnv`, `ticketUrl`, `letzteAusgabe`.

### Was `.inhalt` heute wirklich enthält

Die alte Fassung nannte „h2/h3, p, ul, table, blockquote". Gezählt über alle
38 Inhaltsdateien:

```
H2   126        H3   0        Liste   0        Tabelle   0        Zitat   0
```

**Nur Überschriften der zweiten Ebene und Absätze.** Wer H3, Listen,
Tabellen oder Zitate gestaltet, gestaltet etwas, das auf keiner Seite steht.
Sie bleiben möglich und sollten nicht kaputt aussehen — aber sie sind kein
Bildschirm, an dem sich die Gestaltung beweisen muss.

---

## Was ein Entwurf gestalterisch braucht

Das ist die Lücke, für die es bisher keine Vorgabe gab.

**Wo er erscheint.** Ausschließlich dort, wo `PUBLIC_ENTWUERFE=true` gilt:
in den Netlify Deploy Previews jedes Pull Requests und unter der stabilen
Adresse `vorschau--v101s.netlify.app`. Die Produktion baut Entwürfe gar
nicht erst. Beide Markierungen sind damit **Werkzeuge der Redaktion, nicht
Teil der öffentlichen Site**.

**Wie er aussieht.** Zeichengenau so — gemessen, indem ein Eintrag
kurzzeitig auf Entwurf gesetzt, die Vorschau gebaut und die Datei
zeichengenau zurückgebaut wurde:

```html
<!-- auf der Entitätsseite, zwischen <h1> und <dl class="fakten"> -->
<p class="hinweis"><strong>Entwurf</strong> — noch nicht redaktionell freigegeben.</p>

<!-- in jeder Liste, zwischen dem Link und der Kurzbeschreibung -->
<span class="liste__entwurf" title="Noch nicht redaktionell freigegeben"> [Entwurf]</span>
```

**Wie weit er streut.** *Ein* Entwurf erzeugte den Listenmarker auf **sechs
Seiten**: seiner Übersicht, seiner Kategoriefacette und den
Verwandt-Listen anderer Einträge. Der Marker ist also kein Sonderfall einer
Seite, sondern ein Element, das quer durch die Vorschau läuft.

**Der Stand heute: `.liste__entwurf` hat keine einzige CSS-Regel.** Das
`[Entwurf]` steht in Fließtextgröße und Textfarbe direkt hinter dem
Eintragsnamen — in einer Liste aus zwölf fertigen Einträgen übersieht man
es. Genau das ist die Falle, die der Marker verhindern soll.

**Die Anforderung, in vier Sätzen:**

1. **Eindeutig auf einen Blick.** Wer eine Liste überfliegt, um freizugeben,
   muss den Entwurf finden, ohne zu suchen. Ein Etikett, das mitliest — nicht
   eine Farbe allein, denn Farbe allein ist keine Auszeichnung.
2. **Ohne die Seite zu verunstalten.** Die Vorschau ist die Fassung, an der
   redaktionell geurteilt wird: Sieht der Text gut aus, stimmt die Länge,
   trägt die Kapsel? Ein Marker, der die Zeile sprengt oder das Layout
   verschiebt, macht genau diese Beurteilung unmöglich. Der Entwurf muss
   aussehen wie die fertige Seite plus eine Markierung, nicht wie eine
   andere Seite.
3. **Der Hinweiskasten gehört nicht dem Entwurf allein.** `.hinweis` trägt
   auch die `noindex`-Begründung im Entwicklungsmodus. Die Klasse darf also
   nicht als „Entwurfsbanner" gestaltet werden; sie ist der allgemeine
   Statuskasten, und der Entwurf ist einer von zwei Fällen. Die
   Unterscheidung trägt das `<strong>` am Anfang.
4. **Kein Gestaltungsschuld in der Produktion.** Beide Elemente fehlen dort
   vollständig. Was immer sie an Raum beanspruchen, darf keine Lücke
   hinterlassen, wenn es wegfällt — also kein reservierter Platz, keine
   Spalte, die nur in der Vorschau gefüllt ist.

**Der offene Quellenblock gehört in dieselbe Familie** und wurde bisher für
eine eigene Klasse gehalten. Er ist keine: Es ist derselbe
`details.belege__quellen`, der in der Vorschau das Attribut `open` trägt und
in der Produktion nicht.

```html
Produktion   <details class="belege__quellen"><summary>Quellen (5)</summary>…
Vorschau     <details class="belege__quellen" open><summary>Quellen (5)</summary>…
```

Der Grund steht in der Komponente: Wer freigibt, prüft genau diese Liste —
und tut es nicht, wenn er dafür klicken muss. Gestalterisch heißt das: Der
aufgeklappte Zustand ist in der Vorschau der **Normalfall** und muss dort
ordentlich aussehen, während er in der Produktion der Ausnahmefall nach
einem Klick ist. Ein Quellenblock, der zugeklappt gut und aufgeklappt
unfertig aussieht, ist für die Redaktionsarbeit der falsche Weg herum.

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

Das liest sich wie ein Themenrestaurant, nicht wie ein Portal mit Anspruch — und
es kostet genau die Glaubwürdigkeit, die eine Szene-Ressource braucht. Dazu
ist fast jedes dieser Mittel schlecht lesbar.

Die tragfähige Richtung ist **zeitgenössisch und periodenkundig, nicht
nachgestellt**: Anleihen bei gut gesetzten Drucksachen der Zeit — Katalogen,
Plattenhüllen, Programmheften, Tourpostern —, umgesetzt mit den Mitteln
heutiger Typografie. Gedeckte Farben mit einem einzigen kräftigen Akzent,
klare Raster, Linien statt Kästen, Zurückhaltung bei Effekten.

Faustregel für jede Entscheidung: **Würde das in einem Diner-Menü stehen
oder in einem sorgfältig gesetzten Katalog?** Der Katalog gewinnt.

**Die eine Ausnahme ist das Logo.** Seine Pinselschrift ist Markenzeichen,
nicht Stilmittel; sie wird nirgends sonst verwendet, auch nicht für
Überschriften.

## Bilder

Die Site funktioniert **ohne Bilder** und muss das auch. Band- und
Festivalfotos sind fast nie frei lizenziert; ein Entwurf, der auf große
Heldenbilder baut, ist nicht umsetzbar. Typografie und Raster müssen die
Arbeit machen. Wo Bilder vorkommen, sind es einzelne, kleinformatige eigene
Aufnahmen mit Bildunterschrift und Urhebernennung.

## Technische Grenzen

- **Schriften selbst hosten**, keine Google-Fonts-Einbindung (die Entwürfe
  laden Google Fonts nur zur Vorschau). Maximal zwei Familien. Die
  Plattenhülle braucht Archivo in drei Gewichten bei schmaler Laufweite und
  Newsreader in zwei — mehr als die bisherige Grenze von drei Schnitten,
  siehe „Offene Fragen".
- Kein CSS-Framework, keine Utility-Klassen. Reines CSS gegen die Selektoren
  oben; Astro bündelt es automatisch und inlined es bei geringer Größe. Das
  gesamte CSS steht derzeit als ein `<style>`-Block im `<head>` jeder Seite.
- `prefers-reduced-motion` respektieren.
- Bei 200 % Zoom und 320 px Breite muss alles lesbar und bedienbar bleiben.
- Fokusindikatoren sichtbar lassen.

---

## Die sechs Bildschirme, die gebraucht werden

Mehr nicht — wenn diese stehen, steht die Site. Zu jedem ist die konkrete
Seite genannt, an der er sich messen lässt, mit gezählten Werten.

**1. Eventseite — `/events/rockabilly-convention-2027/`**
14 Faktenzeilen (der Höchstwert; das Mittel liegt bei 12), Fließtext,
**eine** abgeleitete Liste („Verwandt mit …"), Belege mit Quellenblock.
*Achtung:* Die alte Fassung versprach „17 Faktenzeilen, Line-up, FAQ,
mehrere abgeleitete Listen". Line-up-Listen entstehen erst, wenn es
Bandeinträge gibt — die Sammlung ist leer —, und FAQ-Daten hat kein
einziger Eintrag. Beides ist vorgesehen, aber heute nicht zu sehen.

**2. Lexikoneintrag, reicher Fall — `/lexikon/petticoat/`**
1177 Wörter Fließtext, 4 H2, 6 Faktenzeilen, **10 Quellen** im
aufklappbaren Block. Der Quellenblock ist hier so lang wie mancher
Abschnitt — das ist der Fall, an dem sich zeigt, ob der Fußbereich trägt.
*Nicht Bleistiftrock:* der hat 550 Wörter, 3 H2 und 5 Quellen und liegt
damit im Mittelfeld. Sein Reiz ist redaktionell (er trägt einen belegten
Quellenwiderspruch im Text), nicht gestalterisch.

**3. Lexikoneintrag, dünner Fall — `/lexikon/boogie-woogie/`**
383 Wörter, 3 H2, 8 Faktenzeilen, 3 Quellen. Der dünnste vorhandene
Eintrag auf jeder Achse — und immer noch dreimal so lang wie die „120
Wörter", die die alte Fassung annahm. Muss vollständig wirken, nicht wie
eine leere Vorlage. Knapp dahinter liegt `/lexikon/jump-blues/` mit 392
Wörtern; unter 380 geht im Lexikon derzeit nichts.

**4. Regionsseite — `/regionen/bayern/`**
**Drei** gestapelte Listen, nicht vier bis sechs: „Events in …",
„Locations in …", „Verwandt mit …". Weitere kommen dazu, sobald Bands
existieren. Hier entscheidet sich, ob die Gestaltung Struktur hält, wenn
gleichartige Blöcke unterschiedlicher Länge aufeinanderfolgen.
Zwei der fünf Regionen stehen unter der Indexschwelle — ohne sichtbaren
Unterschied, das ist nur ein Meta-Tag.

**5. Übersichtsseite — `/events/`**
H1 → `.kapsel` → **Liste** → `.facetten` unter einer H2 „Nach Kriterium".
Die Filterlinks stehen **unter** der Liste, nicht darüber, und es ist die
**einzige** Seite der ganzen Site mit `.facetten`. Die übrigen fünf
Übersichten sind Kapsel plus Liste, und zwei davon (`/bands/`, `/artikel/`)
sind leer und tragen nur den Satz „Noch kein Eintrag."

**6. Startseite — `/`**
Seit dem 2026-10-02 neu gebaut statt nur neu gestaltet; Aufbau siehe „Neue
Bausteine". Der Stand bis dahin: H1 → `.kapsel` → `.liste.liste--knapp`
„Als Nächstes" mit sechs Terminen → `.sammlungen` „Im Register". Die
`.kapsel` muss im neuen Aufbau erhalten bleiben (sie ist die Antwort für
Sprachmodelle), auch wenn sie optisch zurücktritt.

**Nicht mehr in dieser Liste: `/daten/`.** Die Seite ist Kapsel, fünf H2,
eine `<dl>` mit vier Einträgen und drei `<ul>` — und enthält entgegen der
alten Annahme **kein einziges `<code>` oder `<pre>`**. Sie braucht keine
eigene Gestaltungsentscheidung; was für `.inhalt` und `.kapsel` gilt, trägt
sie mit.

---

## Offene Fragen (Stand 2026-10-02)

Nicht entschieden, vor dem Umbau zu klären:

1. **Suche auf einer statischen Site.** Ein Suchfeld braucht einen Index
   (etwa Pagefind, beim Build erzeugt). Die Ergebnisse entstehen per
   JavaScript — das ist kein Inhalt, also mit der JS-Regel vereinbar, aber
   ein neues Werkzeug im Build.
2. **Begriff im Fokus.** Die Seite wird beim Build erzeugt; der Begriff
   wechselt also nur mit einem Build. Feste Auswahl je Kalenderwoche, oder
   an die Termine gebunden (Genre des Wochenendes)?
3. **Schriftschnitte.** Fünf Schnitte statt drei, oder Archivo als eine
   variable Datei (größer, aber eine Anfrage)? Erst messen.
4. **Logo-Dateien** als SVG oder in doppelter Auflösung, dazu eine
   offizielle helle Fassung.
5. **Ressort Frisur** hat einen Begriff. Entschieden: bleibt; die Lücken
   werden vor dem Go-Live geschlossen, sonst wird nachgesteuert.
