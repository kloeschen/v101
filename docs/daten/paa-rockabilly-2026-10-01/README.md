# PAA-Recherche Rockabilly, 2026-10-01

„People also ask"-Fragen aus der Google-Suche, Deutschland/de, abgefragt über
DataForSEO (Skill `paa-research`, auf Zuruf von Markus, Budget 2 $).
**Das hier sind Themenideen, keine Quelle.** Was daraus entsteht, wird
belegt wie jeder andere Eintrag.

## Lauf

- 95 Abfragen, 0,31 $. Drei Abfragen sind am API-Fehler gescheitert und
  wurden nicht wiederholt.
- Seeds: Rockabilly (+ Kleidung, Frisur, Musik, Tanz, Bands), 22
  Szenebegriffe (Psychobilly, Pin-up, Pompadour, Teddy Boys, Festival …),
  im zweiten Auftrag Vintage, Polka Dots und Petticoat (je mit
  Kleid-/Mode-Varianten). Die gefundenen Kernfragen liefen einmal als
  zweite Runde.
- 412 Fragen, 336 nach dem Zusammenfassen von Umformulierungen. Davon
  sind 128 brauchbar (Kern und Umfeld), sortiert in `fragen.csv`. Der Rest
  ist fachfremd und steht nur in `paa-export.xlsx`.
- Bei 41 der ersten 60 Suchen erschien eine KI-Übersicht. Am häufigsten
  zitiert wurden youtube.com, de.wikipedia.org, vintage-vogue.shop,
  facebook.com und impericon.com.

**Spalte `treffer`:** So oft ist die Frage (samt Umformulierungen) in
allen Suchergebnissen aufgetaucht. Das ist kein Suchvolumen, nur ein Hinweis
darauf, wie zentral die Frage im Themenfeld ist.

**Fallen beim Lesen:**
- „Polkadot" ist auch eine Kryptowährung. Zwei Fragen dazu sind aus
  `fragen.csv` entfernt.
- „Pin" ist auch die Geheimzahl, „Teddy" auch das Stofftier. Ohne
  Szenebezug sind diese Fragen nicht übernommen.
- Fragen nach Trends („Sind Polka Dots noch modern?", „Ist Vintage noch
  modern?") lassen sich nicht belegt beantworten. Sie zeigen Interesse,
  ergeben aber keinen Text.

## Was die Fragen zeigen, nach Bereich

| Bereich | brauchbare Fragen | stärkste Frage (treffer) | Wohin |
|---|---|---|---|
| Vintage | 32 | Ist Vintage noch modern? (15), Ab welchem Alter gilt Kleidung als Vintage? (14), Wie erkennt man Vintage-Kleidung? (13), Unterschied Retro und Vintage (10) | **Lexikon fehlt**, zwei Artikel |
| Rockabilly-Look | 14 | Welcher Rock gehört zur Rockabilly-Szene? (23), Was sollte man im Rockabilly-Stil anziehen? (5) | Tellerrock aus dem Vorrat, Artikel (Mode-Säule) |
| Polka Dots | 14 | Dresscode Polka Dots (6), Warum sagt man Polka Dots? (6), auf Deutsch (5) | Lexikon besteht, FAQ |
| Petticoat/Unterrock | 13 | Wie trägt man einen Petticoat richtig? (7), Darf er hervorschauen? (4) | Lexikon und Vergleich bestehen, Howto fehlt |
| Musik | 11 | Unterschied Rock'n'Roll und Rockabilly (18), bekannte Rockabilly-Songs (17), Welche Musikrichtung (13), Welcher Jahrgang (8) | Vergleich, Liste |
| Bands, Festivals | 8 | Welche deutsche Band spielt Rockabilly? (16), aktuell aktive Bands (10) | das Register selbst (Bands, Termine) |
| Frisur | 8 | Was heißt Pompadour? (8), Wie sieht ein Pompadour aus? (4) | Pompadour aus dem Vorrat, Artikel |
| Pin-up | 7 | Was bedeutet Pin-up? (4), Pin-up-Models/-Fotos (je 3), Pin-up-Tattoo (2) | Lexikon besteht, FAQ |
| 50er allgemein | 7 + Mode | Was trug die Frau in den 50er Jahren? (6) | Epochen-Eintrag „Fifties" (offene Ermessensfrage) |
| Tanz | 6 | Wie heißt der Rockabilly-Tanz? (2) | Lexikon (Jive, Boogie) besteht |
| Psychobilly | 4 | deutsche Psychobilly-Bands (4) | Lexikon besteht, Bands |
| Teddy Boys | 2 | Was bedeutet „Teddy Boy"? (4) | Lexikon-Posten steht schon (`frei`) |
| Grundlagen | 3 | Was ist typisch für Rockabilly? (31), Was heißt Rockabilly auf Deutsch? (16) | Lexikon besteht, FAQ |

Aus den verwandten Suchen ein Befund ohne Frage: **„Rockabilly politische
einstellung" und „Psychobilly rechts".** Das Thema wird gesucht, und das
Register hat dazu nichts. Heikel, deshalb Ermessensfrage (siehe unten).

## Eingeplant

In `OFFENE-PUNKTE.md` stehen seit dem 2026-10-01:

1. `frei` **Lexikon: Vintage**: der größte Block ohne Eintrag.
2. **Lexikon-Vorrat umgestellt:** Frisuren (Pompadour) und Rock- und
   Kleidformen (Tellerrock) stehen jetzt oben, der Suchlauf zieht sie als
   Nächstes nach.
3. `mensch` **Artikel aus der PAA-Recherche**: die Artikelvorschläge
   unten, zur Auswahl. Säulen und Pillars sind Strategiefragen.

## Artikelvorschläge

Je Vorschlag: Typ, Säule, Hauptentität und die Fragen, die er beantwortet.
Keiner ist angelegt.

| # | Arbeitstitel | Typ | Säule | Hauptentität | beantwortet | Voraussetzung |
|---|---|---|---|---|---|---|
| A1 | Vintage, Retro oder Secondhand? | vergleich | sammeln | `lexikon/vintage` | Unterschied Retro/Vintage (10), Secondhand (4+1), Vinted, Ab welchem Alter (14), Wann darf man Vintage sagen (8) | Lexikon Vintage |
| A2 | Vintage-Kleidung erkennen | howto | sammeln | `lexikon/vintage` | Wie erkennt man Vintage-Kleidung (13), Sind Vintage-Klamotten original (3), Warum so teuer (8+4) | Lexikon Vintage |
| A3 | Petticoat tragen | howto | mode | `lexikon/petticoat` | Wie trägt man einen Petticoat (7), Darf er hervorschauen (4), Petticoat-Kleid (4) | keine; Abgrenzung zum Vergleich `petticoat-reifrock-unterrock` (der beantwortet die Kaufentscheidung) |
| A4 | Rockabilly oder Rock'n'Roll? | vergleich | musik | `lexikon/rockabilly` | Unterschied (18), Welche Musikrichtung (13), Welcher Jahrgang (8), Ist Rockabilly 70er? | keine; `abgrenzung` in `lexikon/rockabilly` als Ausgangspunkt |
| A5 | Bekannte Rockabilly-Songs | liste | musik | `lexikon/rockabilly` | bekannte Songs (17) | Titel und Jahre belegen, **keine Songtexte** |
| A6 | Der Rockabilly-Look: was dazugehört | pillar oder praxis | mode | — | Welcher Rock (23), Was anziehen (5), Look/Style (3+3), Dresscode Vintage (6), Dresscode Polka Dots (6), Wie zieht man sich Vintage an (11) | Tellerrock; ob Pillar, entscheidet die Themenkarte |
| A7 | Rockabilly-Frisuren | liste | frisur | — | Rockabilly-Frisur (2+1), Pompadour (8+4+2+1), Elvis-Frisur | Lexikon Pompadour |
| A8 | Rockabilly und Politik | report | szene | `lexikon/rockabilly` | verwandte Suchen „politische Einstellung", „Psychobilly rechts" | heikel; Quellenlage vorher prüfen |

**FAQ statt Artikel:** Für Polka Dots (deutscher Name, Herkunft des Namens,
Dresscode, kombinieren), Pin-up (Models, Fotos, Magazin), Petticoat
(deutscher Name, Zeit) und Rockabilly (auf Deutsch, typisch, Jahrgang)
reichen FAQ-Einträge an den bestehenden Lexikonseiten. Das Schema erlaubt
`faq` auch dort. Bisher hat aber kein Lexikoneintrag eine, es wäre also ein
neues Muster.

**Nicht als Artikel:** Fragen nach Bands und Festivals beantwortet das
Register selbst (Bandseiten, Termine, Regionen, z. B. Bayern). Die 50er
allgemein hängen an der offenen Frage nach einem Epochen-Eintrag
„Fifties" (OFFENE-PUNKTE, Lexikon-Vorrat). Pin-up-Tattoo gehört später in
die Säule `tattoo`.

## Dateien

- `fragen.csv`: 128 brauchbare Fragen, nach Bereich und Treffern sortiert.
- `paa-export.xlsx`: vollständiger Export (alle Fragen, KI-Übersichten
  samt Quellen, verwandte Suchen, Seeds, Abfragen mit Kosten).
- `paa.config.json`: die Relevanzregeln des Laufs, als Vorlage für einen
  weiteren. Die Rohdaten (JSON je Abfrage) lagen nur in der Sitzung und
  sind nicht im Repo.
