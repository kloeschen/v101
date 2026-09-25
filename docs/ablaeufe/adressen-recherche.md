# Läden & Studios recherchieren

Wie Barbershops, Friseure, Tattoo-Studios, Vintage-Läden und
Oldtimer-Verleih ins Register kommen: was aufgenommen wird, was als Beleg
zählt und was bewusst fehlt. Die Sammlung heißt `adressen` und liegt unter
`/adressen/`. Die Vorlage ist `src/content/adressen/_golden-example.md`.

Diese Datei ist **Text über den Ablauf, nicht Mechanik** (Lektion 18). Die
Regeln, auf die es ankommt, stehen im Validator (`adressen-szenebeleg`,
`belegpflicht`) und gelten unabhängig von diesem Text.

Die Skills `barbershops-recherche` und `tattoo-recherche` aus dem
claude.ai-Konto stammen aus einem aufgegebenen Vorgängerprojekt und gelten
hier nicht, auch wenn ihr Auslöser passt.

## Das Aufnahmekriterium

Aufgenommen wird ein Anbieter, der **zwei Bedingungen** erfüllt
(Entscheidung Markus, 2026-09-25):

1. **Ein Ladenlokal mit Adresse.** Reine Online-Shops, mobile Barber
   ohne festen Ort und Studios, die nur „nach Vereinbarung irgendwo"
   arbeiten, kommen nicht hinein. Das Schema verlangt deshalb
   `adresse.strasse`.
2. **Der Szene-Schwerpunkt steht auf der eigenen Website oder dem eigenen
   Profil des Anbieters.** Das Angebot muss dort benannt sein: Rockabilly-
   Haarschnitte, 50er-Jahre-Frisuren, Traditional-Tattoos, Kleidung der
   40er und 50er, Verleih von Fahrzeugen aus der Zeit. Eine Deko mit
   Jukebox reicht nicht. Ein Satz wie „wer auf das Besondere steht, bekommt
   auch einen Rockabilly-Style" ist ein Grenzfall. Der gehört dem Menschen,
   als `mensch`-Posten.

Die zweite Bedingung prüft der Validator: `schwerpunkte` braucht eine Quelle
der Art `offiziell` oder `social`. Für einen freigegebenen Eintrag ist das
ein Fehler, für einen Entwurf eine Warnung (`adressen-szenebeleg`).

## Google Maps ist ein Suchhinweis, kein Beleg

Die Liste der alten Website stammte aus Google Maps und Google-
Unternehmensprofilen. Für dieses Register taugt das aus zwei Gründen nicht
als Beleg:

- **Es belegt den Schwerpunkt nicht.** Kategorie und Stichworte eines
  Profils setzt der Eintragende selbst oder ein Dritter. Wer dort
  „Rockabilly" findet, weiß noch nichts über das Angebot.
- **Die Nutzungsbedingungen** erlauben es nicht, Inhalte aus Maps
  abzuschreiben und in eine eigene Datenbank zu übernehmen.

Maps darf also zeigen, *wo* man suchen könnte. Dann wird die eigene Website
des Anbieters geöffnet, und nur was dort steht, kommt in den Eintrag.
Maps-Adressen (`google.*/maps`, `maps.app.goo.gl`, `goo.gl/maps`, `g.page`)
zählen für `adressen-szenebeleg` nie, auch wenn jemand sie als `offiziell`
einstuft. `links.googleMaps` bleibt als Wegweiser erlaubt, trägt aber
keinen Fakt.

## Felder

| Feld | Woher | Hinweis |
|---|---|---|
| `typ` | eigene Website | `barber` für Herrenschnitt und Bart, `friseur` für Salons mit Damen- und Herrenangebot, auch wenn der Name „Barber" trägt. Wenn es unklar ist: in der Redaktionsnotiz begründen |
| `schwerpunkte` | eigene Website oder eigenes Profil | kurze Nennungen in eigenen Worten, keine Werbesätze. Muss in `quellen[].felder` stehen |
| `adresse` | Impressum oder Kontaktseite | das Impressum ist die verlässlichste Stelle, weil es gesetzlich vorgeschrieben ist |
| `region` | aus der Adresse | fehlt die Region im Register, zuerst die Region anlegen |
| `barrierefrei` | nur wenn die Seite es sagt | sonst `unbekannt`, nie aus Fotos ableiten |
| `links` | eigene Website, eigene Profile | |

**Bewusst nicht erfasst:** Öffnungszeiten und Preise. Beides ändert sich
ohne Ankündigung, und schon der erste Eintrag zeigte, dass eine Seite beides
zweimal nennen kann, ohne dass die Angaben übereinstimmen. Ein
Adressregister mit falschen Öffnungszeiten schickt Leute vor verschlossene
Türen. Der Text verweist auf die Website des Anbieters.

## Vor dem Anlegen

- **Duplikate prüfen.** Die Namen und `aliases` der Einträge in
  `src/content/adressen/` vergleichen. Ein Laden mit zwei Filialen ergibt
  zwei Einträge, weil jeder eine Adresse hat.
- **Personen.** Inhaber werden nur genannt, wenn die eigene Seite sie
  nennt. Private Adressen, Handynummern und E-Mail-Adressen von Personen
  kommen nicht in den Text.
- **Bands aus dem Umfeld** (etwa die Band eines Inhabers) stehen nur im
  Text. Ob eine Bandseite entsteht, entscheidet der Mensch.
- **Eigene Worte.** Selbstbeschreibungen werden umformuliert. Ein kurzes,
  gekennzeichnetes Zitat ist erlaubt, wenn es den Schwerpunkt belegt.

## Adressen im Suchlauf

Seit dem 2026-09-25 schreibt der Suchlauf auch Adressen-Posten
(Entscheidung Markus). Termine bleiben die Hauptsache, deshalb gelten drei
Grenzen:

- **Höchstens zwei Adressen-Posten** unter den zehn `frei`-Plätzen. Stehen
  schon zwei da, sucht der Suchlauf keine weiteren.
- **Ein Posten, bis zu vier Anbieter** derselben Region und desselben Typs.
  Der tägliche Lauf baut sie in einem PR.
- **Vorrang haben Termine.** Adressen füllen nur Plätze, für die der
  Suchlauf keinen Termin gefunden hat, und nie den letzten freien Platz.

### Quellen

| Quelle | Region | Hinweis |
|---|---|---|
| [Walldorf Weekender, „Vintage Hair & Tattoo“](https://www.walldorf-weekender.net/deutsch/50s-markt/vintage-hair-tattoo-2024/) | überregional | Barber, Vintage-Friseure und Tätowierer auf dem Markt, jeweils mit eigener Website. Die URL trägt ein altes Jahr, der Seitentitel das aktuelle |
| Händler- und Ausstellerlisten anderer Weekender und Festivals im Register | je nach Veranstaltung | über `links.website` der Events und Reihen |
| Einsendungen über das Formular | beliebig | wie Termin-Vorschläge: Seite öffnen, Kriterium prüfen |

Eine neue Quelle kommt als Zeile in diese Tabelle, im selben PR wie die
Posten, die aus ihr entstanden sind.

**Falle: Ein Marktstand ist kein Ladenlokal.** Wer auf einem Weekender
frisiert oder tätowiert, hat nicht unbedingt einen festen Laden. Der
Suchlauf öffnet deshalb schon die eigene Website und nimmt nur Anbieter
auf, die dort eine Ladenadresse nennen. Mobile Anbieter werden verworfen,
mit Grund im Bericht.

### Das Postenformat

```
`frei` **Läden & Studios: <n> <Typ> in <Region> anlegen (<Name>, <Name> …).**
Gesehen am JJJJ-MM-TT auf <URL der Liste> (Herkunft: Suchlauf JJJJ-MM-TT).
Je Anbieter: eigene Website <URL>; dort steht zum Schwerpunkt: „<kurzes
Zitat>“; Ladenadresse laut Website: <Adresse>. <Was beim Bauen zu prüfen
ist.> Ablauf: docs/ablaeufe/adressen-recherche.md.
```

Das Zitat zum Schwerpunkt ist Pflicht. Ohne Zitat ist es kein Posten,
sondern eine Vermutung. Ist das Zitat schwach („bietet auch … an“), wird
der Posten `mensch` statt `frei` geschrieben, mit dem Zitat als Frage.

## Kandidaten, die auf eine Entscheidung warten

Grenzfälle kommen als `mensch`-Posten nach `OFFENE-PUNKTE.md`, mit dem
Zitat, an dem die Entscheidung hängt. Der erste Grenzfall, KS Barbershop
in Berlin-Steglitz, wurde aufgenommen (Markus, 2026-09-25): Er bot
Fifties-Schnitte als Angebot neben regulären Schnitten an, auf einer
eigenen Unterseite ausdrücklich benannt. Daran lassen sich künftige
Grenzfälle messen. Ein Szene-Angebot, das auf der eigenen Seite konkret
benannt ist, genügt, auch wenn es nicht das einzige Angebot ist.
