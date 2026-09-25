# Entscheidungsprotokoll

Warum etwas so ist, wie es ist. Neueste Einträge oben.

Dieses Protokoll ist die Brücke zum Strategie-Chat, der keinen Repo-Zugriff
hat und von Änderungen hier nichts mitbekommt. In zwölf Monaten ist es der
einzige Ort, an dem die Begründung noch steht — der Commit sagt, *was*
geändert wurde, nicht *warum* und schon gar nicht, *was verworfen wurde*.

Hinein gehören: geänderte Regeln, Felder im Datenvertrag, verworfene
Alternativen, Funde mit Folgen. Nicht hinein gehören: normale Commits,
Inhalte, Formulierungsarbeit. Zehn Zeilen pro Woche sind genug.

---

## 2026-09-25 — Messung: Barrierefreiheit und Ladezeit sind kein Engpass

**Gemessen:** 15 Seiten, eine je Seitentyp, in Chromium bei 390 px Breite,
mit axe-core und den Regelsätzen WCAG 2.0/2.1 A und AA sowie Best Practice.
Geprüft wurde der Stand mit Entwürfen.

- **Barrierefreiheit:** 0 Verstöße auf allen 15 Seiten. Ein gemeldeter
  Verstoß auf `/kalender/` war ein Messfehler: Die Adresse hat keine
  eigene Seite, ausgewertet wurde die Verzeichnisliste des Testservers.
  Verlinkt ist `/kalender/` nirgends.
- **Ladezeit:** 6 bis 22 KB HTML je Seite, keine weiteren Anfragen (das
  CSS steckt in der Seite, es gibt keine Schriften und kein JavaScript
  außer dem Formularhelfer). DOMContentLoaded lag lokal bei 12 bis 42 ms.
- **Kein horizontales Scrollen** auf dem Handy.

**Folge:** Hier ist nichts zu bauen. Die Messung hat aber einen eigenen
Fehler gefunden: Der neue Footer mit Impressum und Datenschutz hatte kein
CSS, beide Links klebten zusammen. Er ist im selben PR behoben.

**Korrektur einer eigenen Aussage:** In der Qualitätsübersicht stand, die
Seite habe kein CSS. Das stimmte nicht. Das CSS liegt in `src/styles/`,
und Astro bettet es ins HTML ein. Die Suche nach `<style>` im Quellcode
hatte deshalb nichts gefunden.

---

## 2026-09-25 — Impressum und Datenschutz: Gerüst mit Go-Live-Sperre

**Anlass:** Beide Seiten sind Pflicht und fehlten. Markus: „kannst du schon
anlegen“. Die Angaben kommen von ihm.

**Gebaut:**
- `/impressum/` nach § 5 DDG und § 18 Abs. 2 MStV.
- `/datenschutz/` nach Art. 13 DSGVO.
- Links auf beide im Footer jeder Seite.
- Alle Angaben an einer Stelle, `src/lib/rechtliches.ts`. Was fehlt, ist
  `null` und erscheint auf der Seite als „[wird ergänzt: …]“.
- Beide Seiten sind `noindex`; sie haben keinen Suchwert.

**Die Sperre:** Fehlt noch eine Angabe oder ist ein Prüfpunkt offen, bricht
der Build ab, sobald `PUBLIC_INDEXIERBAR` auf `true` steht. Der Go-Live ist
genau diese Zeile. Ein halbes Impressum kann damit nicht mit ihm online
gehen, während die Platzhalter vorher niemanden stören.

**Die Datenschutzerklärung beschreibt, was der Code tatsächlich tut.** Am
selben Tag geprüft:
- keine Cookies und keine Reichweitenmessung;
- keine fremden Schriften, Skripte oder Einbettungen;
- das Vorschlagsformular über Netlify Forms mit Akismet.

**Fund mit Folge:** Das Repo ist öffentlich. Eingesandte Adressen und
Hinweise können als Arbeitsauftrag öffentlich in OFFENE-PUNKTE.md stehen.
Das steht jetzt in der Datenschutzerklärung und als Satz direkt über dem
Absenden-Knopf des Formulars („bitte keine persönlichen Angaben“).

**Nicht selbst beantwortet, sondern als Prüfpunkte offen gelassen:**
- DPF oder Standardvertragsklauseln und der Auftragsverarbeitungsvertrag
  (DPA) bei Netlify;
- die Speicherdauer der Logs;
- welche Daten an Akismet gehen;
- die Löschfrist der Einsendungen;
- die zuständige Aufsichtsbehörde.

Eine geratene Antwort in einer Datenschutzerklärung wäre schlimmer als eine
offene Frage. Beide Texte sind ein Entwurf und keine Rechtsberatung. Vor
dem Go-Live gehört ein fachkundiger Blick darauf.

**Belege:**
- `test-rechtliches`: 10 Prüfungen.
- Mutation „Sperre schweigt immer“: 4 fallen.
- Ein Build mit `PUBLIC_INDEXIERBAR=true` bricht mit der Liste der
  fehlenden Angaben ab (Exit 1). Der normale Build läuft durch.

---

## 2026-09-25 — Qualitätsrunde: Linkprüfung, Prüfzettel-Vorschau, doppelte Titel

**Anlass:** Markus fragte, was die Qualität der Seite verbessert. Gemessen
an der gebauten Seite (89 Seiten) und allen 162 externen Links, dann drei
kleine Punkte umgesetzt (Antwort „ja“).

**1. Linkprüfung: 8 von 8 „toten“ Links waren Bot-Abwehr.**
Nachgeprüft mit Browserkennung am selben Tag:
- **Reservix, 3 Links:** Die Seiten liefern HTTP 200 mit dem erwarteten
  Titel. Nur das Prüfskript bekommt 403.
- **Discogs, 2 Links:** Cloudflare-Browserprüfung, 403 auch mit
  Browserkennung.
- **Facebook, 2 Links:** 400 ohne Anmeldung.

Bei Discogs und Facebook lässt sich per Skript nicht feststellen, ob die
Seite existiert. Genau dafür ist die Warnung „bekannte Bot-Abwehr, von Hand
prüfen“ da. Alle drei Hosts stehen jetzt in `BOT_ABWEHR`, jeder mit
Begründung und Messdatum. Facebook sperrt mit 400 statt 403, deshalb hat
jeder Eintrag jetzt einen eigenen Status (Vorgabe 403). Das ist eine enge
Ausnahme: Der Status gilt nur für diesen Host, und 404 und 410 darf kein
Eintrag nennen. Der echte Bestand hat danach 0 tote Links und 10
auffällige, vorher waren es 8 tote.

Belege:
- `test-checklinks`: 10 neue Prüfungen.
- Mutation Statusliste ignoriert: 6 Behauptungen fallen, darunter „404 bei
  Bot-Abwehr bleibt ein Fehler“.
- Mutation Facebook ohne eigenen Status: 4 Behauptungen fallen.

**2. Prüfzettel: Der Vorschau-Link führte bei offenen PRs ins Leere.** Er
zeigte auf `vorschau--`, und das spiegelt `main`. Ein Entwurf aus einem
offenen PR ist dort nicht zu sehen (404, gefunden an #68 und #69). Neu ist
`--pr <Nummer>`: Damit zeigt der Link auf die Deploy-Vorschau dieses PRs.
Der tägliche Lauf öffnet deshalb zuerst den PR und setzt den Zettel danach
ein; der Routine-Prompt ist angepasst. Belegt durch Test und Gegenfall, dazu
eine Mutation (1 Behauptung fällt).

**3. Doppelte Seitentitel.** „Mode“ gab es als Lexikon-Kategorie und als
Themenbereich der Artikel. „Kustom Kulture“ gab es als Lexikoneintrag und
als Themenbereich. Die Labels heißen jetzt „Mode im Lexikon“ und „Artikel zu
Mode“. Neue Prüfung in `test-facetten` am echten Bestand, Entwürfe
eingeschlossen: Kein Eintragsname und kein Facettenlabel darf zweimal
vorkommen, mit Lebenszeichen. Die Mutation (alte Labels) findet genau die
beiden Dopplungen.

**Nicht gebaut: Beschreibungen kürzen.** 30 Seiten haben eine meta
description über 170 Zeichen, meist aus der `kurzbeschreibung` (erlaubt bis
320). Kürzen würde Inhalt abschneiden, den das JSON-LD vollständig braucht.
Google schreibt Beschreibungen ohnehin häufig selbst. Eine Warnregel hätte
30 Befunde am ersten Tag und würde überlesen.

---

## 2026-09-25 — Läden & Studios in den Läufen; Grenzfall KS Barbershop aufgenommen

**Entscheidungen von Markus** auf die zwei `mensch`-Posten aus #67:

- **Der Suchlauf schreibt auch Adressen-Posten.** Höchstens zwei der zehn
  `frei`-Plätze, damit Termine nicht verdrängt werden. Ein Posten bündelt
  bis zu vier Anbieter derselben Region und desselben Typs.
  Aus der Begründung abgeleitet (nicht eigens entschieden): Termine haben
  Vorrang, und eine Adresse belegt nie den letzten freien Platz.
  Erste Quelle sind die Aussteller- und Händlerlisten der Weekender,
  beginnend mit Walldorfs Seite „Vintage Hair & Tattoo“.
  Ablauf und Postenformat stehen in `docs/ablaeufe/adressen-recherche.md`.
  Beide Routinen verweisen jetzt darauf.
- **KS Barbershop in Berlin-Steglitz wird aufgenommen.** Damit steht der
  Maßstab für Grenzfälle: Ein Szene-Angebot genügt, wenn es auf der
  eigenen Seite konkret benannt ist, auch wenn es nicht das einzige
  Angebot ist. Ein bloßes „bieten wir auch an“ ohne Konkretes bleibt ein
  `mensch`-Posten.

**Beim Bauen gefunden:**
- Das Impressum, das am Vormittag mit 503 antwortete, war am Nachmittag
  erreichbar.
- Für den laufenden Betrieb gibt es keinen Beleg nach Mai 2020. Das steht
  offen in der Redaktionsnotiz. `aktiv` bleibt auf dem Standardwert.

**Falle, im Ablauf festgehalten:** Ein Stand auf einem Weekender-Markt ist
kein Ladenlokal. Wer auf dem Markt frisiert oder tätowiert, braucht auf der
eigenen Website eine Ladenadresse, sonst wird er verworfen.

---

## 2026-09-25 — Steyrtal Boogie Party: erste Region Oberösterreich, Kalender-Vorgabewert nicht als Preis gelesen

**Anlass:** Posten aus dem Suchlauf vom 2026-09-24, gebaut im Lauf vom
2026-09-25. Angelegt: Termin, Ort (Zorba der Grieche, Sierning) und die
Region `oberoesterreich`, alle `entwurf`.

**Entschieden:**
- **`eintritt: unveroeffentlicht` statt leer.** Der Posten sagte „ohne
  Preisangabe bleibt `eintritt` leer" — das Feld ist Pflicht, der
  Schemawert für „die Quelle nennt keinen Preis" ist `unveroeffentlicht`.
  Gemeint war dasselbe.
- **`x-cost-type: free` im iCal-Export ist kein Preis.** Der Kalender des
  Vereins (All-in-One Event Calendar) trägt den Wert bei jedem Termin,
  auch bei einem, für den es laut Beschreibung Karten gibt. Er ist der
  Vorgabewert des Plugins. Als neue Falle in
  `docs/ablaeufe/termin-recherche.md` eingetragen.
- **`ende` gesetzt**, weil die sichtbare Terminseite des Vereins „bis
  18. Oktober 2026 um 1:30" nennt. Die Rockin'-Wildcat-Regel „kein `ende`
  übernehmen" betrifft einen Vorgabewert jener Quelle, nicht Enden
  überhaupt.
- **Ort nur einmal ausdrücklich belegt** (boogie.at); die Vereinsseite
  nennt beim Termin keinen Ort, hat aber unter derselben Anschrift ihre
  Kontaktadresse und ihr Training. Im Text benannt, nicht verschwiegen
  (Regel 5).
- **Sierning oder Neuzeug:** boogie.at schreibt Sierning, der Verein
  Neuzeug. Neuzeug ist eine Ortschaft der Marktgemeinde Sierning; die
  Adresse führt die Gemeinde, der Text beide Namen.
- **Keine `links.website` für das Lokal:** zorbadergrieche.at löste am
  2026-09-25 nicht auf.
- **Neue Quelle** crazy-boogiefreaks.at in die Quellentabelle der
  Termin-Recherche, mit iCal-Export.

**Verworfen:** `typ: kneipe` für das Lokal (Behauptung über den Charakter
des Hauses ohne Beleg, stattdessen `sonstiges`); `reihe` setzen (eine
Ausgabe im Register ergäbe eine leere Reihenseite, wie bei Mödling).

---

## 2026-09-25 — Neue Sammlung „Läden & Studios“ (`adressen`)

**Anlass:** Die alte Website führte echte Barber, Rockabilly-Friseure und
Oldtimer-Verleih. Markus wollte das wieder aufnehmen, dazu Tattoo-Studios
und Vintage-Läden. Die alte Liste gibt es nicht mehr. Ihre Quelle war
Google Maps.

**Entscheidungen von Markus:**
- Name „Läden & Studios“, URL `/adressen/`.
- Fünf Typen: `barber`, `friseur`, `tattoo`, `vintage-laden`,
  `oldtimer-verleih`.
- Nur mit Ladenlokal. Reine Online-Shops kommen nicht hinein, das Schema
  verlangt `adresse.strasse`.
- Aufnahmekriterium ist ein Szene-Schwerpunkt, belegt auf der eigenen
  Website oder dem eigenen Profil.
- Die Schemaänderung hat Markus ausdrücklich beauftragt und selbst
  eingespielt (`_schemas.ts`, Commit e9283ee). Der Vorschlag lag unter
  `docs/vorschlaege/`, weil der Guard Agenten den Schreibzugriff auf die
  Datei sperrt, auch mit Auftrag. So ist es gedacht.

**Neue Regel `adressen-szenebeleg`:** `belegpflicht` allein hätte das
Kriterium nicht geschützt. Ein Branchenverzeichnis mit dem Stichwort
„Rockabilly“ hätte als Quelle genügt, und so war die alte Liste
entstanden. Die neue Regel verlangt deshalb für `schwerpunkte` eine Quelle
der Art `offiziell` oder `social`. Google-Maps- und Unternehmensprofil-URLs
zählen nicht, auch wenn sie als `offiziell` eingestuft sind: Das Profil
setzt der Eintragende oder ein Dritter, und die Nutzungsbedingungen
verbieten es, Inhalte daraus in eine eigene Datenbank zu übernehmen.
Für Entwürfe ist ein Verstoß eine Warnung, für freigegebene Einträge ein
Fehler.

Belege:
- Sieben Fälle in `test-validate.ts`: eigene Seite, eigenes Profil, nur
  Verzeichnis, eigene Seite ohne `schwerpunkte`, drei Kartendienste und die
  Freigabe-Ebene.
- Zwei Mutationen: Ohne die Art-Prüfung fallen genau die drei
  Verzeichnisfälle, ohne die Kartenerkennung genau die drei Kartenfälle.
- Lebenszeichen am echten Eintrag: Mit der Quelle auf `aggregator`
  umgestellt, schlägt die Regel an. Mit der echten Quelle schweigt sie.

**Bewusst nicht erfasst: Öffnungszeiten und Preise.** Sie ändern sich ohne
Ankündigung. Schon der erste Eintrag bestätigt das: Die Startseite des
Salons nennt beides zweimal, und die Angaben stimmen nicht überein. Ein
Schemafeld gibt es dafür nicht, und es soll auch keines entstehen.

**Weitere Verdrahtung:**
- JSON-LD: `HairSalon`, `TattooParlor`, `ClothingStore` und `AutoRental`,
  sonst `LocalBusiness`. Pflichtfelder in `check-jsonld.ts` sind `name` und
  `address`.
- Facette nach Typ, Abschnitt in `llms.txt` und Faktenblock.
- Der Prüfzettel zeigt Adresse, Typ und Schwerpunkte als harte Fakten.
  Stehen die Schwerpunkte nur in einem Verzeichnis, gibt er ein Signal.

**Erster Eintrag:** Rockin' Barber in Berlin-Köpenick, zugleich die
Vorlage für das Golden Example. `typ: friseur` statt `barber` ist eine
offen begründete Abwägung. Ein zweiter Kandidat, KS Barbershop in
Steglitz, ist ein Grenzfall und steht als `mensch`-Posten in
`OFFENE-PUNKTE.md`. Ebenfalls offen und bei Markus: ob und wie die Läufe
Adressen-Posten bekommen.

**Verworfen:** Einträge ohne Ladenlokal und Google Maps als Beleg. Beides
ist oben begründet.

---

## 2026-09-25 — Mehr Durchsatz: Bündel-Posten und zwei Läufe am Tag

**Ausgangslage:** Die Startschwelle verlangt 80 Termine und 80
Lexikonbegriffe. Freigegeben waren 14 Termine, davon 10 kommend, und 23
Begriffe. Bei einem Posten pro Tag wäre die Schwelle in rund vier Monaten
erreicht, und in der Zeit verfallen Termine.

**Messung der Kosten:**
- 24.09., Opus 5, Berlin mit zwei Terminen und zwei Orten: 21,28 $, 36 min.
- 25.09., Opus 5.5, Mödling mit einem Termin und einem Ort: 1,88 $, 8 min.

Seit der Umstellung auf Opus 5.5 bremsen die Kosten den Durchsatz nicht
mehr. Die Grenze ist die Prüfzeit.

**Entscheidungen von Markus:**
- **Bündel-Posten:** Ein Posten deckt bis zu sechs Termine derselben
  Quelle oder Reihe ab, oder bis zu vier verwandte Begriffe. Der Lauf baut
  alles in einem PR. Der Prüfzettel (gleicher Tag) macht auch größere PRs
  überfliegbar.
- **Zwei Läufe am Tag:** Die bestehende Routine bekommt einen zweiten
  Zeitpunkt, 30 4,14 * * * (06:30 und 16:30 MESZ). Das ist bewusst keine
  zweite Routine, damit Repo-Anbindung und Werkzeugliste erhalten bleiben.
  Beim Suchlauf fehlten sie beim Anlegen per Werkzeug, und nur ein Mensch
  konnte sie nachtragen. Markus hat dabei bewusst die früher genannte
  Grenze von zehn Inhalts-PRs pro Woche überschritten.

**Abgeleitet:** Zwei Läufe am Tag verbrauchen rund 14 Posten pro Woche.
Deshalb läuft auch der Suchlauf zweimal pro Woche, sonntags und mittwochs,
und füllt jeweils auf zehn auf.

**Gleich umgesetzt:**
- Die drei Tanzbegriffe sind ein Bündel: Rock'n'Roll-Tanz,
  Boogie-Woogie-Tanz, Jive.
- Die beiden Boppin'B-Termine sind ein Bündel, Quelle ist die Live-Seite
  der Band.

**Auswertung:** ab dem 2026-10-09, als Posten unter „Später, mit
Bedingung“. Gemessen werden Einträge pro Woche, PRs pro Woche, Bündel
ganz, teilweise oder gescheitert, und die Kosten pro Lauf.

---

## 2026-09-25 — Prüfzettel statt Prüfbericht

**Anlass:** Die Vorbedingung des Postens „Prüfbericht für die Freigabe“
lautete: erst bauen, wenn klar ist, was beim Freigeben tatsächlich geprüft
wird. Markus hat am 2026-09-25 geantwortet:
- Inhalts-PRs werden **meist nur überflogen**.
- Wenn geprüft wird, dann **Datum, Uhrzeit und Ort gegen die Quelle**
  sowie der **Szenebezug**.

Ein vollständiger Bericht würde unter diesen Bedingungen nicht gelesen.

**Gebaut:** `scripts/pruefzettel.ts`, ein Zettel zum Überfliegen.
- Je Eintrag stehen die harten Fakten da: Beginn mit Wochentag in
  Berliner Zeit, Ort mit Adresse, Preis. Jeder Fakt verlinkt die Quellen,
  die ihn belegen, Aggregatoren sind markiert.
- Darunter stehen nur Signale, keine Fehler:
  - Fakt nur schwach belegt
  - Beginn an einer einzigen Quelle
  - Abweichung laut Redaktionsnotiz
  - Termin in weniger als 21 Tagen, oder vergangen
  - Ort neu im selben Änderungssatz
  - keine Genres
  - Quelle älter als 14 Tage
- Unauffällige Einträge stehen eingeklappt am Ende.
- Der tägliche Lauf schreibt den Zettel in jede Inhalts-PR-Beschreibung
  (Routine-Prompt, Schritt 4).

**Warum 21 und 14:** 21 ist der Mindestabstand des Suchlaufs, und darunter
eilt eine Freigabe tatsächlich. 14 ist die Grenze, ab der der Stale-Report
einen nahen Termin zur Nachprüfung vormerkt.

**Am Bestand erprobt:** Der Zettel meldete beim Record Hop Friedrichshagen,
dass Beginn und Preis nur von Aggregatoren belegt sind, bei der Mödlinger
Tanzparty „keine Genres“. Beides stimmt und ist genau die Art Stelle, an
der sich Hinsehen lohnt.

**Belege:**
- `test-pruefzettel`: 28 Prüfungen. Jedes Signal hat einen Fall, in dem
  es feuern muss, und einen Gegenfall. Dazu ein Lebenszeichen am echten
  Bestand.
- Mutationen:
  - Aggregator-Signal aus: 1 Prüfung fällt.
  - Nähe-Signal aus: 2 fallen.
  - Neuer-Ort-Signal aus: 1 fällt.
  - Abweichungs-Signal aus: 4 fallen.
  - Zeitzone entfernt: Der Beginn verrutscht um eine Stunde, 1 fällt
    (Regel 1).

**Bewusst nicht:**
- Sprunglinks auf die genaue Textstelle der Quelle (`#:~:text=`). Dafür
  müsste der Lauf die Belegstelle wörtlich festhalten, das wäre ein neues
  Schemafeld und eine Entscheidung für Markus.
- Eine Prüfansicht auf der Vorschau-Seite. Markus schaut in den PR, also
  gehört der Zettel dorthin.

---

## 2026-09-25 — Musik oder Tanz: eigene Tanzeinträge, mehrdeutige Wörter ohne Autolink

**Messung:** Von 35 Links auf die Musikeinträge Rock'n'Roll und
Boogie-Woogie meinten 9 den Tanz, 5 waren mehrdeutig, 21 richtig. Beispiele
für den Tanz: „Rock-'n'-Roll-Tanz“ beim Petticoat, der Boogie-Woogie-Club
in Perchtoldsdorf, die World Rock'n'Roll Confederation, das Tanzwochenende
in Pullman City. Ein Viertel der Links zeigte also falsch, und mit jedem
Termin der Boogie-Szene kamen weitere dazu.

**Entscheidung von Markus: Variante C.**
- Der Tanz bekommt eigene Einträge, **Rock'n'Roll-Tanz** und
  **Boogie-Woogie-Tanz**, nach dem Vorbild von Lindy Hop. Beide stehen als
  `frei`-Posten in der Warteschlange.
- Namen mit Bindestrich statt Klammerzusatz, damit sich der erste Satz
  natürlich liest.

**Autolink:**
- Trägt mehr als ein Lexikoneintrag dasselbe Wort, wird es nicht mehr
  automatisch verlinkt.
- Die Mehrdeutigkeit wird aus dem Bestand abgeleitet, nicht in einer Liste
  gepflegt (Lektion 14). Die Tanzeinträge tragen die kurzen Schreibweisen
  als Alias, daran erkennt der Autolink das Paar.
- Eindeutige Formen wie „Rock'n'Roll-Tanz“ bleiben verlinkbar. Mehrdeutige
  Stellen verlinkt, wer schreibt, von Hand. Bestehende Links sind geschützt.

**Fund beim Bau:** Am echten Bestand erkannte die erste Fassung sofort ein
mehrdeutiges Wort, nämlich „Petticoat“. Der Unterrock trägt es als
englische Bezeichnung, weil englisch *petticoat* Unterrock heißt. Nach der
einfachen Regel hätte der Petticoat seinen Autolink verloren. Deshalb zählt
jetzt der Rang: Name, Alias und deutsche Bezeichnung gehen der englischen
Bezeichnung vor. Mehrdeutig ist ein Wort nur, wenn zwei Einträge es auf
demselben Rang tragen. Der Bestand hat danach kein mehrdeutiges Wort, und
`autolink:check` meldet keine Drift.

**Belege:** `test-links` hat 13 neue Prüfungen, jede mit Gegenprobe, etwa
dass das Wort mit nur einem Träger weiter verlinkt wird.
- Mutation „Mehrdeutigkeit aus“: 5 Prüfungen fallen.
- Mutation „englische Bezeichnung gleichrangig“: 2 fallen.

**Verworfen:**
- Variante A, nichts tun: die falschen Links bleiben und werden mehr.
- Variante B, Sperrliste im Code ohne Tanzeinträge: Der Tanz hätte keinen
  Ort, und die Liste müsste von Hand gepflegt werden.
- Die Flexion („Rock'n'Roll-Tanzes“) auf mehrteilige Begriffe auszudehnen:
  Das wäre Raten wie bei „Wet Set“. Die neun falschen Links biegt ohnehin
  jemand von Hand um, sobald die Tanzeinträge freigegeben sind (Posten
  unter „Später, mit Bedingung“).

---

## 2026-09-25 — Vorschläge aus der Szene: Formular mit einer URL

**Grundsätze von Markus (2026-09-24):**
- Es gibt ein Formular. Pflicht ist nur die URL, dazu kommt freiwillig
  eine Zeile Hinweis.
- Angaben zur Person werden nicht erhoben. Wer Rückmeldung will, schreibt
  eine E-Mail.
- Eigenwerbung ist kein Ausschlussgrund, denn Relevanz und Beleg werden
  ohnehin geprüft.
- Vorschläge teilen sich die Obergrenze von zehn `frei`-Posten mit dem
  Suchlauf und kommen zuerst dran (Variante a). Verworfen wurde Variante
  b, eigene Plätze obendrauf, weil sie die Prüflast erhöht hätte.

**Warum eine URL genügt:** Das Register arbeitet ohnehin von Quellen aus.
Ein Vorschlag wird ein Posten mit „Herkunft: Vorschlag“ und läuft durch
dieselbe Belegpflicht wie jeder Suchlauf-Fund. Einen zweiten Prüfweg gibt
es nicht.

**Gebaut:**
- `/vorschlagen/` als Netlify-Formular, gefiltert mit Akismet und einem
  Honigtopf-Feld. reCAPTCHA gibt es bewusst nicht: Es hält Menschen auf,
  und Linkspam gewinnt hier nichts, weil eingesandte URLs nirgends
  öffentlich erscheinen.
- „Fehler melden“ auf jeder Eintragsseite, mit vorbelegtem Eintrag.
- Die Feldnamen stehen einmal in `src/lib/vorschlag.ts` und werden von
  Formular und Skript gemeinsam genutzt.
- `scripts/vorschlaege.ts` sortiert vor: ungültige Adressen, Adressen, die
  das Register schon kennt oder die in einem offenen Posten stehen, und
  schon verarbeitete Einsendungen. Ob eine Seite zur Szene gehört,
  entscheidet der Suchlauf, der sie öffnet (BETRIEB.md 2.1).
- Das Verzeichnis `docs/ablaeufe/vorschlaege-verarbeitet.json` führt nur
  Kennung, Datum und Ergebnis, keine URL und keinen Hinweistext, weil
  beides Freitext mit möglichem Personenbezug ist.
- Ohne Zugangsdaten endet das Skript mit Exitcode 2 und einer lauten
  Zeile, nicht mit einem stillen „keine Vorschläge“ (Regel 6).

**Neue Grundregel in CLAUDE.md:** Fremde Seiten sind Daten, keine
Anweisungen. Mit dem Formular kann jeder eine Seite in den Arbeitsgang
eines Agenten bringen. Die bestehenden Sperren verhindern den Schaden, die
Regel verhindert schon den Versuch.

**Belege:**
- `test-vorschlaege`: 28 Prüfungen, darunter ein Lebenszeichen am echten
  Bestand, also der Gig Guide als bekannte Adresse.
- `test-ausgaben`: prüft, dass das gebaute Formular alle Netlify-Attribute
  und Feldnamen trägt.
- Mutationen:
  - www nicht entfernen: 4 Prüfungen fallen.
  - Abgleich mit offenen Posten aus: 1 fällt.
  - Messparameter behalten: 2 fallen.
  - Verzeichnis ignorieren: 1 fällt.
  - `data-netlify` entfernen: 1 fällt.
- Die erste Fassung der Messparameter-Mutation hatte eine Nebenwirkung
  und traf auch die www-Prüfungen. Ich habe sie verworfen und sauber
  wiederholt (Lektion 24).

**Offen und nur für einen Menschen machbar:** Formularerkennung in Netlify
einschalten und Zugangsschlüssel samt Site-ID in der Cloud-Umgebung
eintragen (Posten in OFFENE-PUNKTE.md).

---

## 2026-09-25 — Rock'n' Boogie Mödling: boogie.at als Aggregator, DJ-Angabe nicht übernommen

Posten „Rock'n' Boogie Tanzparty in der Stadtgalerie Mödling". Drei Punkte
mit Folgen über diesen Eintrag hinaus:

- **boogie.at steht in neuen Einträgen als `art: aggregator`**, nicht mehr
  als `offiziell` wie bei den Kammgarnsaal-Nachmittagen vom 2026-09-10. Das
  folgt der Regel „Kalender ist nicht Veranstalter" aus
  `docs/ablaeufe/termin-recherche.md`; die Seite bündelt Einträge
  verschiedener Vereine und Häuser. Ältere Einträge ziehen bei ihrer
  nächsten Prüfung nach, wie bei Rockin' Wildcat.
- **Eine DJ-Angabe, die nur boogie.at trägt, bleibt aus `djs` heraus.**
  Das Haus nennt keinen DJ, nur die Reservierungsadresse derselben Person.
  Nach CLAUDE.md Regel 5 steht die Angabe im Text, benannt und boogie.at
  zugeordnet, das Feld bleibt leer. Verworfen: `djs` setzen, weil die
  E-Mail-Adresse die Person bestätigt — sie bestätigt die Organisation,
  nicht das Auflegen.
- **„Parkett" in einer Ankündigung ist kein Beleg für `tanzflaeche`.**
  „Das Tanzbein auf einem schönen Parkett schwingen" ist die Redewendung
  für die Tanzfläche, keine Angabe zum Belag. Als Falle in den Ablauf
  aufgenommen.

---

## 2026-09-24 — Methodik-Seite: drei Grundsatzantworten

`/methodik/` beschreibt, wie das Register arbeitet: Aufnahme, Recherche,
Belegpflicht, Widersprüche, Freigabe, Aktualität, eigene Texte,
Unabhängigkeit, offene Daten. Jede Aussage beschreibt einen Ablauf, den es
im Repo gibt. Der Kopfkommentar der Seite nennt die Stellen. Ändert sich
einer dieser Abläufe, muss die Seite mitgehen.

**Drei Antworten von Markus:**
- **Geld:** Keine bezahlten Einträge und keine Provisionen. Werbung ist
  später möglich, wird dann gekennzeichnet und hat keinen Einfluss auf
  Aufnahme und Darstellung.
- **KI:** Die Seite sagt ausdrücklich und konkret, dass Recherche und
  Entwürfe mit KI-Agenten entstehen. Veröffentlicht wird nur nach
  menschlicher Prüfung, und die Freigabe ist technisch gesperrt.
- **Redaktion:** Sie steht mit vollem Namen auf der Seite (Markus
  Klöschen), im JSON-LD als `editor`.

**Technik:**
- `publishingPrinciples` am Organisationsknoten zeigt auf die Seite. Damit
  steht sie in jedem Graphen der Site.
- Die Seite steht in `sitemap-seiten.xml`, und die Navigation verlinkt sie
  zusammen mit `/daten/`, das bisher nur über die Startseite erreichbar war.
- `test-ausgaben` prüft, dass sie gebaut wird und keinen Entwurfspfad
  enthält. Mutationsbeleg: Ohne die Seite fällt genau diese Behauptung
  (112/113).

**Bewusst offen:** Der Abschnitt „Vorschläge und Korrekturen“ sagt, dass
der Weg dafür gerade eingerichtet wird. Die Methode ist ein eigener
gemeinsamer Posten in OFFENE-PUNKTE.md. Bis dahin steht dort kein Kanal,
den es nicht gibt.

---

## 2026-09-24 — Neue Orte und Regionen ohne Rückfrage

Der erste Suchlauf (PR #58) gab einem Posten die Anweisung mit, für einen
Termin in Sierning die Region Oberösterreich neu anzulegen. Bisher hatte
jede neue Region ein Mensch beschlossen, eine Regel dazu gab es nicht.
**Markus am 2026-09-24:** Orte und Regionen, die ein Termin braucht, legt
der Lauf selbst an. Das Risiko ist gering: Eine neue Region bleibt unter
der Schwelle von drei Einträgen unsichtbar, und alles entsteht als
`entwurf` in einem Inhalts-PR, den ein Mensch merged. Festgehalten in
`docs/ablaeufe/termin-recherche.md`, Abschnitt „Fallen".

---

## 2026-09-24 — Rockin' Wildcat: drei Lesarten der Quelle, korrigiert und belegt

**Anlass:** Posten „Berlin: bis zu drei weitere Termine aus dem
Rockin'-Wildcat-Gig-Guide". Beim Bau wurden acht Detailseiten der Quelle
geöffnet statt der zwei, die für zwei Termine nötig gewesen wären. Das war
der Punkt, an dem die Annahmen gekippt sind.

**Fund 1 — das JSON-LD `startDate` dieser Quelle ist systematisch falsch.**
Bei allen acht geprüften Terminen liegt es genau um den UTC-Versatz später
als der Kalenderlink derselben Seite (Sommerzeit zwei Stunden, Winterzeit
eine). Beispiele: `record-hop-66` Kalender `20260926T180000Z` gegen JSON-LD
`22:00+02:00`; `kitty-daisy-lewis-2` Kalender `20261026T190000Z` gegen
JSON-LD `21:00+01:00`. Das Redaktionssystem schreibt die örtliche Uhrzeit
in ein Feld, das als UTC gelesen wird — Lektion 1, eine Ebene tiefer.
**Folge:** Aus dieser Quelle gilt die sichtbare Uhrzeit beziehungsweise der
Kalenderlink, nie das JSON-LD `startDate`. Der Record-Hop-Eintrag vom
2026-09-10 hatte diese Entscheidung schon getroffen, aber als Einzelfall
(„zwei von drei Stellen tragen 19:00"). Sie ist keiner.

**Fund 2 — `offers.price: "0"` ist kein durchgängiger Vorgabewert.** Die
bisherige Lesart („steht bei allen achtzehn Terminen auf 0") ist gemessen
falsch: Von den 24 Terminen im Gig Guide tragen am 2026-09-24 fünf einen
Preis ungleich null — `rocknroll-trio-8` mit 12, `record-hop-63` mit 10,
`27306` mit 10, `record-hop-64` mit 10 und `boppin-b-5` mit 25 Euro. Auf
den acht geöffneten Detailseiten fällt das sichtbare Feld „Kosten" genau
mit diesem Fall zusammen: `record-hop-63` trägt es und hat einen Preis, die
übrigen sieben tragen es nicht und haben `price: "0"` — acht von acht. **Die belastbare Regel lautet:** Das sichtbare
Feld „Kosten" entscheidet. Steht es da, stimmt auch `offers.price`; fehlt
es, heißt die Null „kein Preis hinterlegt". Die Schlussfolgerung des
Record-Hop-Eintrags bleibt damit richtig — ihre Begründung ist jetzt belegt
statt vermutet, und `record-hop-rathaus-friedrichshagen-2026-10-18` trägt
deshalb `eintritt: beziffert` mit 10 Euro.

**Fund 3 — die Endzeit dieser Quelle ist ein Vorgabewert.** Sieben der
acht geprüften Termine enden auf 05:00 Ortszeit, unabhängig von
Anfangszeit, Spielort und Zeitzonenhälfte: ein Tanztee um 16:00 ebenso wie
ein Konzert um 20:00. Beim achten (`jets-smokestack-lightnin`) fällt das
Ende mit dem Beginn zusammen, ist also gar keine Angabe. Der Wert ist damit
entweder konstant oder leer, nie terminbezogen. **Folge:** Neue Einträge
aus dieser Quelle bekommen kein `ende`.

**Was daraus nicht gebaut wurde.** Der veröffentlichte Eintrag
`record-hop-alte-feuerwache-2026-09-25` trägt `ende: 2026-09-26T05:00:00+02:00`
und führt Rockin' Wildcat als `art: offiziell`. Beides gehört nachgezogen —
aber es ist ein zweiter Posten, und ein Lauf baut einen. Steht in
OFFENE-PUNKTE.md.

**Zwei statt drei Termine, mit Begründung.** Der Posten erlaubt „bis zu
drei". Gebaut sind zwei; die drei nächstliegenden Termine sind bewusst
übersprungen:

| Termin | warum nicht |
|---|---|
| 25.09. Rock'n'Roll Trio, KulturMarktHalle | Ein Eintrag entsteht als `entwurf` und wird erst von einem Menschen freigegeben. Realistisch ist das frühestens am Folgetag — dann ist der Termin vorbei. Ein vergangener Termin mit `durchfuehrung: geplant` färbt zudem jeden Zweig rot, bis jemand `archivieren` läuft. |
| 26.09. Record Hop, Sixties Diner | dieselbe Begründung |
| 27.09. Record Hop, Zeesener Hof | Zeesen liegt in Brandenburg, nicht in Berlin. Der Eintrag bräuchte eine Region, die es nicht gibt. |

**Verworfen: Jets / Smokestack Lightnin' am 03.10. im Roadrunner's.** Der
Termin wäre der dritte gewesen. Die Website des Spielorts
(`roadrunners-paradise.de`) liefert am 2026-09-24 ein Zertifikat, das sich
nicht verifizieren lässt; über die Werkzeuge dieser Sitzung ist sie nicht
erreichbar. Damit hätte der Spielort als neue Entität allein auf einer
Zweitnennung im Gig Guide beruht. Lieber zwei belegte Einträge als drei,
von denen einer auf einer Adresse steht, die niemand gegengelesen hat.

**Quellenart `aggregator` statt `offiziell`.** Rockin' Wildcat ist ein
Online-Magazin, das im Gig Guide fremde Ankündigungen bündelt — genau die
Definition im Schema. Für den American Western Saloon steht daneben das
Haus selbst als `offiziell`.

**Belege:** `npm run verify` grün (0 Fehler, 0 Warnungen, 1077 Prüfungen in
18 Testläufen). Zehn Mutationen an den vier neuen Dateien, alle gefallen —
Referenzen, Belegpflicht, Preislogik, Zeitraum, interne Links,
Schemaaufzählung. Jede Mutation zeichengenau zurückgebaut (SHA-256 vorher
und nachher gleich).

**Gegenprobe mit Folge:** `npm run check:zeit` prüft `src/**/*.{ts,astro,mjs}`
und `scripts/**/*.ts` — **nicht** `src/content/`. Ein `beginn:
2026-10-18T16:00:00` ohne Zonenangabe läuft durch `check:zeit`, `validate`
und `jsonld` grün durch, wird aber von `z.coerce.date()` in der
Prozess-Zeitzone gelesen: `TZ=UTC` ergibt `16:00Z`, `TZ=Europe/Berlin`
ergibt `14:00Z`. Zwei Stunden Unterschied, je nachdem wo gebaut wird.
Lektion 1 hat unterhalb ihrer eigenen Prüfung eine Lücke. Posten in
OFFENE-PUNKTE.md.

---

## 2026-09-23 — Termin-Recherche: Ablauf im Repo, wöchentlicher Suchlauf, keine Konto-Skills

**Anlass:** Der offene Posten „Der Skill `events-recherche` passt nicht auf
dieses Repo". Durchgesehen wurden alle 19 Skills, die aus dem
claude.ai-Konto in jede Cloud-Sitzung geladen werden. Sechs stammen aus
dem Vorgängerprojekt „vintage-rockabilly-guide" (`events-recherche`,
`events-pflege`, `bands-recherche`, `barbershops-recherche`,
`tattoo-recherche`, `publish`), zwei aus der Weinmesse
(`festival-onboarding`, `winzer-event-discovery`). Keiner passt:
fremdes Frontmatter, keine Belegpflicht. `events-pflege` verschiebt
vergangene Termine nach `events/archiv/` und ändert damit URL und `@id`.
`publish` pusht auf `main`. Die Auslöser überschneiden sich mit
dem hiesigen Vokabular („mach einen Commit", „suche neue Events").

**Befund:** Was `events-recherche` inhaltlich kann, deckt das Repo längst
ab: Posten, Vorlage, Validator, Hooks, täglicher Lauf. Seine einzige echte
Leistung — selbst neue Termine finden — fehlt dagegen. `BETRIEB.md` 2.4
führte dafür „dein bestehender Skill" auf, den es für v101 nie gab.

**Messung:** Acht Quellen bisheriger Termine abgerufen. Maschinenlesbar
(JSON-LD) war eine: Rockin' Wildcat mit 24 Terminen. Fünf hatten weder
JSON-LD noch iCal, eine lief in einen Timeout, Reservix antwortete mit 403.
Die eine maschinenlesbare Quelle lag beim Record Hop bei der Anfangszeit
falsch.

**Entscheidungen (Markus, 2026-09-23):**

1. Der alte Guide ist aufgegeben, von ihm wird nichts behalten. Die sechs
   Skills entfernt Markus aus dem Konto. Bis dahin — und für die beiden
   Weinmesse-Skills dauerhaft — sagt CLAUDE.md, dass keiner davon hier
   gilt. Was aus ihnen brauchbar war (Länderkreis, Suchbegriffe,
   Tonregel), steht jetzt in `docs/ablaeufe/termin-recherche.md`.
2. **Der Ablauf wird Text in `docs/`, kein Skill unter `.claude/`.** Er
   wächst mit jeder gefundenen Falle. Unter `.claude/` bräuchte jede
   Ergänzung einen Menschen (Lektion 18).
3. **Wöchentlicher Suchlauf** als Routine: Er füllt die Warteschlange auf
   höchstens zehn `frei`-Posten auf und legt selbst keinen Inhalt an. Sein
   PR berührt nur `OFFENE-PUNKTE.md` und merged nach `automerge:erlaubt`
   selbst. Die Zahl zehn hat Markus als tragbare Prüflast genannt.

**Verworfen:**
- **Ein Skript, das JSON-LD sammelt.** Es deckt eine von acht Quellen ab
  und liefert selbst dort nur Kandidaten.
- **Eine Hook-Sperre gegen einzelne Skill-Namen.** Beweisbar wäre sie,
  aber am Ende steht ohnehin ein PR, den ein Mensch prüft. Der mögliche
  Schaden ist Verschwendung, nicht Stille.
- **Die Konto-Skills umschreiben.** Sie wären unversioniert, ungetestet
  und außerhalb des Repos.

**Gesetzte Zahlen, mit Rechnung:**
- **Mindestabstand 21 Tage bis zum Termin.** Zehn Posten bei einem Posten
  pro Tag sind zehn Tage, dazu kommen Prüfung und Freigabe.
- **Auswertung ab 2026-10-21, Schwelle: die Hälfte der Posten wird zum
  Eintrag.** Das ist ein Vorschlag, keine Messung. Er wird mit der
  Auswertung überprüft.

**Durchsatz:** Der tägliche Lauf baut sieben Posten pro Woche. Die
Obergrenze von zehn ist also ein Puffer, kein Wochenziel. Mehr Durchsatz
hieße einen zweiten Posten je Lauf, und das wäre eine eigene Entscheidung.

---

## 2026-09-23 — guard.mjs: Umleitungen nach ihrem Ziel beurteilen

**Anlass:** Posten „`guard.mjs` sperrt zu breit", fünf belegte Fälle, in
denen der Bash-Zweig reine Lesebefehle blockierte. Einer davon hat heute
einen Mutationsbeleg still entwertet. Ein sechster kam beim Bau dieses
Vorschlags dazu: ein `grep` mit `2>/dev/null` über mehrere Verzeichnisse,
darunter die CI-Konfiguration.

**Entscheidung von Markus:** Die Korrektur schreibe ich als fertigen Block,
eingesetzt wird sie von einem Menschen (`.claude/` ist für Agenten
gesperrt, Lektion 16). Der Vorschlag lag unter `docs/vorschlaege/guard.mjs`.
Markus hat ihn am 2026-09-23 eingesetzt (Commit `5fbbd4e`), die
Vorschlagsdatei ist danach gelöscht.

**Nachweis am eingesetzten Hook:** Die Datei war byte-gleich mit dem
Vorschlag (`cmp`). `test-hooks.ts` gegen den echten Hook ergab 125 von 125.
Live in der Sitzung: Ein `grep` mit `2>/dev/null` über `.github/`, vorher
blockiert, lief durch.

**Die Korrektur:**
- Umleitungen werden nach ihrem **Ziel** beurteilt: Jedes `>` liefert das
  Wort dahinter als Kandidatenziel, und gesperrt wird nur, wenn dieses Ziel
  ein gesperrter Pfad ist oder, für den Status, in `src/content/` liegt.
- Verben (`sed -i`, `cp`, `mv`, `tee` …) bleiben so grob wie bisher, weil
  ihr Pfad irgendwo im Befehl stehen kann.
- Die Statussperre bleibt in der Sache gleich, auch gegen den Rückweg per
  `sed -i` (fünfter Fall, bewusst weiter gesperrt).

**Fund beim Bau:** Der geltende Hook lässt `echo x >.claude/settings.json`
durch, eine Umleitung ohne Leerzeichen, weil das Pfadmuster vor `.claude/`
kein `>` erwartet. Der Vorschlag schließt die Lücke, weil er das Ziel
herauslöst (Lektion 29).

**Belege:**
- `test-hooks.ts` hat dreizehn neue Fälle:
  - fünf weitere Schreibweisen, die sperren müssen: Anführungszeichen,
    `2>`, `&>`, Umleitung neben `2>&1`, kein Leerzeichen
  - zwei Statusfälle, die gesperrt bleiben
  - sieben nachgebaute Fehlalarme, die durchgehen müssen
- Gegen den geltenden Hook fallen genau zehn Behauptungen: sieben
  Fehlalarme und die drei zur Lücke ohne Leerzeichen. Gegen den Vorschlag
  (`V101_GUARD=docs/vorschlaege/guard.mjs`) bestehen alle 125.

| Mutation am Vorschlag | fällt |
|---|---|
| Umleitungsziele nicht gegen gesperrte Pfade geprüft | 24 Behauptungen, alle Umleitungsfälle |
| Umleitung in `src/content/` zählt nicht als Schreiben | 10, Statuszeile per `>>`, awk mit Umleitung … |
| jede Umleitung zählt als Schreiben ins Register | Fall 3 und 4 (Fehlalarme kehren zurück) |
| Anführungszeichen ums Ziel nicht behandelt | „Umleitung mit Anführungszeichen um das Ziel" |
| Verben ignoriert | 21, `sed -i`, `cp`, `mv`, `tee`, `git checkout` … |
| alte Logik: Pfad irgendwo im Befehl | „Umleitung ohne Leerzeichen" (die Lücke kehrt zurück) |

Die erste Fassung unterschied echte Umleitungen von `=>`, `>=` und `2>&1`
per Look-arounds und filterte `/dev/null`. Drei Mutationen daran
überlebten: Mit der Zielprüfung sind diese Bausteine wirkungslos. Sie
sind entfernt, die Fassung ist entsprechend schlichter.

Bis der Block eingesetzt war, war die Prüfkette des Zweigs rot, an genau
den zehn Behauptungen, wie bei #36 gewollt.

Posten entfällt.

---

## 2026-09-23 — Band-Vorlage: ein echter Eintrag statt einer korrigierten Halbfiktion

**Anlass:** Posten „Das Golden Example der Bands nennt für The Firebirds
1985" (Wikipedia: Mai 1992). Die Vorlage war außerdem halb erfunden:
Leipziger Band mit Region Rhein-Neckar, „Beispiel Musiker" in der
Besetzung.

**Entscheidung von Markus:** Die Vorlage wird durch den Aufbau eines echten,
belegten Eintrags ersetzt, nicht korrigiert. Gewählt ist **Mad Sin**. Der
Eintrag zeigt alles, was eine Vorlage zeigen soll:
- eine Quelle je Feld
- zwei Widersprüche im Text statt in der Auswahl
- leere Felder mit Begründung (Label, Website)
- eine offizielle Seite, die sich nicht öffnen ließ und deshalb nicht als
  Quelle steht

**Eine Abweichung vom Original:** `status: entwurf`. Eine Vorlage zeigt, was
ein Agent schreibt, und neue Einträge sind immer Entwürfe. Mit
`veroeffentlicht` hätte die Vorlage genau den Wert vorgemacht, den nur ein
Mensch setzt. Ein YAML-Kommentar im Kopf nennt die Herkunft und den Stand;
weicht `mad-sin.md` später ab, gilt `mad-sin.md`.

**Fund mit Folgen:** Der Abschnitt „Rückverweise gegen echte Daten" in
`scripts/test-links.ts` ist seit dem 2026-09-01 nie gelaufen. Er hing an
`the-firebirds`, und die gab es nur in der Vorlage, die der Loader
überspringt. Sechs Prüfungen hatten nie etwas gesehen, jeder Lauf druckte
„übersprungen" und meldete Erfolg (Nachtrag zu Lektion 19).
- Jetzt hängt der Abschnitt an `bands/boppin-b` samt seinem
  Barsinghausen-Termin, und ein fehlender Anker ist ein Fehler.
- `test-links` hat jetzt 56 Prüfungen statt 45.
- **Belege:**
  - Anker auf eine Band, die es nicht gibt: vier Fehlschläge, keine
    stille Überspringung.
  - Anker auf Mad Sin (keine Auftritte im Register): „Auftritt fällt aus
    den Eventdaten heraus" fällt. Die Prüfung liest also wirklich die
    Eventdaten.

**Nicht angefasst:** Die Event- und die Lexikon-Vorlage nennen weiterhin The
Firebirds, als Line-up-Referenz bzw. als Link. Beide sind Formvorlagen,
die der Loader überspringt, und ihr Umbau ist eine eigene Entscheidung.
Für die Event-Vorlage steht dieselbe Frage schon in der Redaktionsnotiz des
echten Walldorf-Eintrags.

Posten entfällt.

---

## 2026-09-23 — Stale-Report: nahe Termine mit alter Prüfung

**Anlass:** Der Posten „Termine kurz vor dem Datum noch einmal anfassen"
wollte erst messen, wie oft sich Angaben kurz vor einem Termin ändern. Bei
neun Terminen lässt sich das nicht messen. Inzwischen gibt es aber zwei
belegte Fälle: die falsche Anfangszeit des Record Hop und das Line-up der
Rockabilly Convention, das ohne Bewegung im `dateModified` erschien.

**Entscheidung von Markus:** die einfache Fassung, als Posten im
Stale-Report und nicht als Regel im Validator. Ob sich eine Quelle
geändert hat, weiß erst, wer sie wieder öffnet. Ein blockierender Build
scheiterte an einem Datum, nicht an einem Fehler.

**Die Zahlen:** Beginn in höchstens **14** Kalendertagen, letzte Prüfung
älter als **7** Tage. Nur freigegebene Termine, nicht abgesagte, nicht
stattgefundene. Gewicht 260 plus Nähe, also über „Reihe ohne Folgetermin"
(250) und unter „vergangen" (300). Die Kurzfassung für den SessionStart
nennt die Zahl, wenn sie nicht null ist.

**Kalendertage in Ortszeit:** Neue Hilfsfunktion `tageBis` in
`src/lib/datum.ts`, über die Wanduhr gerechnet. Sie wird auch für das
Alter der Prüfung genutzt, statt `tage()` mit 24-Stunden-Blöcken. Sonst
zählte eine Prüfung von vor acht Tagen zwischen 00:00 und 02:00 Ortszeit
als sieben, und der Rand des Fensters wackelte.

**Erster echter Treffer beim Bau:** der Record Hop, in 2 Tagen, zuletzt vor
13 Tagen geprüft.

**Belege:**
- `test-datum` 33 → 40, darunter der 00:30-Rand und die Zeitumstellung.
  Beide laufen auch unter vier Prozess-Zeitzonen.
- `test-stale` 9 → 16, mit zehn Terminen in einem Lauf, jeder mit genau
  einer Abweichung. Das Lebenszeichen: Der Entwurf taucht als Entwurf auf,
  wurde also gelesen.

| Mutation | fällt |
|---|---|
| Freigabe-Bedingung entfernt | „genau die drei" (Entwurf rutscht hinein) |
| Abgesagt-Bedingung entfernt | „genau die drei" (Abgesagter rutscht hinein) |
| `<= 14` → `< 14` | „genau die drei", „der Rand nennt die Tage" |
| `> 7` → `>= 7` | „genau die drei" (Rand Sieben rutscht hinein) |
| `bis >= 0` entfernt | „genau die drei", „der nächste steht vorn", „heute heißt heute" (laufendes Festival) |
| Gewicht 260 → 200 | „alle nahen Termine stehen vor der Reihe" |
| `tageBis` über UTC-Tage | `test-datum`: 00:30-Rand und Zeitumstellung, unter allen vier Zonen |

**Eine Mutation überlebte:** `!vorbei` entfernt. Die Bedingung war neben
`bis >= 0` logisch wirkungslos, denn ein Termin, der heute oder später
beginnt, ist nicht vorbei. Sie ist deshalb entfernt, statt einen Test für
sie zu erfinden.

Posten entfällt.

---

## 2026-09-23 — `verweis-auf-entwurf`: Frontmatter-Verweise auf Entwürfe sind ein Fehler

**Anlass:** Beim Verlinken von Boppin'B schlug `link-auf-entwurf` an den
beiden Fließtext-Links an, der Verweis in `lineupBands` blieb stumm. Im
JSON-LD des freigegebenen Termins hätte eine `@id` auf eine Seite
gestanden, die die Produktion nicht baut. `refs()` filtert nicht, und
`check-jsonld.ts` sammelt die bekannten `@id`s aus dem ganzen Bestand,
Entwürfe eingeschlossen.

**Entscheidung von Markus: (a)**, eine Regel und Ebene `fehler`, analog zu
`link-auf-entwurf`. **Verworfen: (b)**, die Builder filtern auf
Freigegebenes und fallen auf eine benannte Gruppe zurück. Das machte den
Zustand unschädlich, aber unsichtbar.

**Umfang:** alle Felder aus `referenzFelder` plus `hauptentitaet`, nicht
nur die sechs, die heute ins JSON-LD gehen. Eine zweite Liste neben
`referenzFelder` veraltet still. Ein Ziel, das es gar nicht gibt, meldet
weiterhin nur `referenzen`.

**Freigabe:** Der Fixpunkt in `freigeben.ts` validiert regelunabhängig und
trägt die neue Regel ohne Änderung. Belegt am echten Bestand, mit Band und
Termin vorübergehend auf Entwurf:
- nur der Termin: abgelehnt, mit `verweis-auf-entwurf` und
  `link-auf-entwurf`
- Termin und Band zusammen: beide würden freigegeben

**Belege:** `test-validate` 226 → 245, sieben Fälle. Jede Bedingung der
Regel hat einen eigenen Fall, dazu ein Event (die echte Form der Lücke)
und `hauptentitaet` samt Gegenprobe. Das Lebenszeichen im echten Bestand:
Mit Boppin'B auf Entwurf meldet die Regel genau den `lineupBands`-Verweis
des Termins. Heute gibt es im Bestand null Funde, und keine
Test-Vorrichtung brach.

| Mutation (nur im Regelblock) | fällt |
|---|---|
| Statusprüfung der Quelle entfernt | „ein Entwurf darf auf einen Entwurf verweisen" |
| Freigabeprüfung des Ziels entfernt | „nur auf Freigegebenes schweigt", „hauptentitaet auf Freigegebenes schweigt" |
| Existenzprüfung entfernt | „ein Verweis ins Leere wird nicht doppelt gemeldet" |
| `hauptentitaet`-Zweig entfernt | „hauptentitaet auf einen Entwurf schlägt an" |
| Schleife über `referenzFelder` entfernt | „verweist in verwandt auf Entwurf", „Termin an einem Ort, der Entwurf ist" |

**Zwischenfall beim Beleg:** Der erste Mutationslauf war wertlos. Die
Schutzsperre hatte den Befehl blockiert, der Sicherung und
Mutationsskript anlegen sollte, weil das Statuswort in einem
`sed`-Muster stand. Die fünf „Mutationen" liefen danach gegen den
unveränderten Code und meldeten grün. Erkannt wurde das an der
Fehlermeldung von `cp`, verworfen und wiederholt. Der Fall steht jetzt
beim guard-Posten als fünfter Beleg.

Posten „Frontmatter-Verweise auf Entwürfe" entfällt.

---

## 2026-09-23 — Neo-Rockabilly: die Quelle, die den Begriff bestimmt

**Anlass:** Posten „Neo-Rockabilly: erst eine Quelle, dann ein Eintrag".
Er verlangte eine Quelle, die den Begriff bestimmt, nicht nur verwendet.

**Gefunden:** Der Feature-Artikel „The voices of neo-rockabilly" des
britischen Magazins Vintage Rock (22. Juni 2022). Er beschreibt Herkunft,
Szene, Labels und Bands und sagt ausdrücklich, dass schon der Begriff
umstritten ist. Der Eintrag `lexikon/neo-rockabilly` liegt als Entwurf
vor, mit drei Quellen.

**Der Widerspruch steht im Text (Regel 5):** Vintage Rock datiert die
Anfänge ans Ende der 1970er, die deutsche Wikipedia auf die 1980er. Die
englische Wikipedia überschreibt ihren Abschnitt mit „1990–present", nennt
darin aber Restless „since the early 1980s". `aeraVon` bleibt deshalb leer,
weil kein Jahr von mehr als einer Quelle getragen wird. Gesichert und im
Text: die britische Herkunft und die Hochphase in den frühen 1980ern.

**Zwei Nebenbefunde:**
- Der englische Stub „Neo-rockabilly", den der Posten nannte, leitet
  inzwischen auf den Abschnitt im Rockabilly-Artikel weiter.
- Der Posten sagte, die Unterscheidung stehe „bis dahin in der
  `abgrenzung` von Rockabilly und Psychobilly". Das stimmte nicht: Sie
  stand nur im Golden Example, das der Loader überspringt.

**Nicht als Alias:** „Neo", die Szenekurzform. Der Autolink würde es in
„Neo-Swing" und ähnliche Komposita setzen.

Posten entfällt.

---

## 2026-09-23 — Genres: Ein Tanzwort ist keine Musikangabe

**Anlass:** Posten „`genres` an den restlichen Events", offen waren noch
Bella Italia und das Rock'n'Roll Festival Ganderkesee.

**Entscheidung von Markus:** Beide bleiben leer. Die Linie, die schon für
„Boogie" galt, gilt auch für „Rock'n'Roll" und „Rockabilly", wenn sie als
Tanz gemeint sein können. Ein Szenewort, das zugleich einen Tanz
bezeichnet, trägt allein keine Zuordnung zu einem Lexikoneintrag, der
eine Musikrichtung beschreibt. Nötig ist eine Aussage über die Musik,
etwa „die Bands spielen …" oder eine Stilangabe am Line-up.

- **Bella Italia:** Die Quelle nennt nur „Finest Boogie & Swing".
  „Swing" hat keinen passenden Eintrag, der Termin ist vorbei, und die
  Quelle entfernt Vergangenes.
- **Ganderkesee:** Rock 'n' Roll ist dort Thema und Name, die Musik der
  Bands bleibt ungenannt. Rockabilly steht nur bei den Tanzkursen. Das
  Line-up 2027 ist „Coming soon". Der Fall steht in OFFENE-PUNKTE unter
  „Später, mit Bedingung".

**Verworfen:** `rocknroll` für Ganderkesee eintragen, weil Name und
Selbstbeschreibung als Beleg reichten. Vertretbar, aber die Zuordnung ginge
als `about` ins JSON-LD und behauptete eine Musikrichtung, die die Quelle
nicht nennt.

Posten entfällt.

---

## 2026-09-23 — `dateModified` belegt keinen unveränderten Inhalt

**Anlass:** Posten „Rockabilly Convention: die Oldtimer-Regelung fehlt".
Beim erneuten Abruf der Veranstalterseite standen dort nicht nur die
Oldtimer-Regelung und der kostenlose Parkplatz, sondern auch ein Line-up
mit Uhrzeiten und Bühnen: drei Bands am Freitag, eine am Samstag. Der
Eintrag sagte „Ein Line-up für 2027 nennt die Seite nicht". Das
`dateModified` im JSON-LD der Seite ist in beiden Abrufen dasselbe
(2026-08-23).

**Fund mit Folgen:** Die Redaktionsnotiz nannte diesen Termin den
„stärksten der fünf Fälle", weil die Quelle ihr eigenes Pflegedatum
mitliefert. Für das *Datum* des Termins stimmt das weiterhin. Aber ein
unverändertes `dateModified` belegt nicht, dass der übrige Inhalt
unverändert ist. Entweder wurden die Acts nachgetragen, ohne dass sich das
Datum bewegt hat (bei Seiten, die Unterobjekte wie Acts einbinden,
naheliegend), oder der erste Abruf hat die Tagesansicht nicht erfasst.
Entscheiden lässt sich das nicht. Beides steht im Eintrag.

**Konsequenz, ohne neue Regel:** Das Pflegedatum einer Seite taugt als
Aktualitätsbeleg für den Termin, nicht als Grund, sie nicht erneut zu
lesen. Das stützt den offenen `mensch`-Posten „Termine kurz vor dem Datum
noch einmal anfassen" mit einem zweiten Fall nach dem Record Hop.
Umgesetzt ist hier nur der Eintrag. Das Line-up ist als Stand vom
2026-09-23 formuliert, die Bands stehen in `lineupWeitere`.

---

## 2026-09-23 — `lexikon-schreibvarianten`: Komposita sind keine Schreibvarianten

**Anlass:** Der Posten „Zwei Altfunde der neuen Regel" ließ zwei Wege offen:
Bindestrichschreibung als Alias eintragen oder den Text angleichen. Beide
beruhten auf einer falschen Annahme. Alle vier Treffer waren Komposita mit
Pflicht-Bindestrich (Durchkopplung): „Custom-Car-Szene", „Custom-Car-Fans",
„Hot-Rod-Szene", „Hot-Rod- und Lowrider-Customizer". Ein Alias „Custom-Car"
wäre eine falsche Schreibung des Begriffs selbst und ginge als
`alternateName` ins JSON-LD. „Angleichen" ergäbe „Custom Car-Szene", und das
ist nach Duden falsch. Gemessen ohne Link-Adressen: Freistehend mit
Bindestrich steht keiner der mehrteiligen Begriffe im Bestand.

**Entscheidung von Markus:** Die Regel lässt Komposita aus und steigt auf
Warnung. Ein Treffer zählt nicht, wenn direkt ein Bindestrich folgt
(Fortsetzung oder Ergänzungsstrich). Ein vorangehender Bindestrich
(„Ur-Custom-Car") war schon vorher durch das Muster ausgeschlossen.
**Verworfen:** Den Autolink Komposita verlinken lassen
(„[Custom-Car](…)-Szene"). Das hätte vier Stellen erreicht, dafür aber
einen Eingriff in `sync-autolinks.ts` und eigene Tests gebraucht. **Und:**
So lassen. Eine Regel mit vier bekannten Fehlalarmen kann nie blockierend
werden.

**Folge:** Der Bestand hat null Funde, `validate --strict` hat zwei Hinweise
weniger (8 → 6). Solche Stellen bleiben unverlinkt, wie vorher.

**Belege:** Die Ebenenänderung allein lässt den bestehenden Fall an genau
seiner Erwartung scheitern („meldet Ebene hinweis — gemeldet: warnung").
Drei neue Fälle: Kompositum schweigt, Ergänzungsstrich schweigt, Kompositum
verdeckt die echte Variante nicht. Der letzte ist das Lebenszeichen, ohne
ihn bewiese „schweigt" auch eine tote Regel. `test-validate` 222 → 226.
Die neuen Fälle scheiterten zuerst an der eigenen Vorrichtung: Die Regel
zählt über den ganzen Test-Bestand, und das freistehende „Schwof-Tanz" eines
Nachbarfalls wurde mitgezählt. Jeder Fall hat jetzt einen eigenen Begriff
(Lektion 26).

| Mutation (nur im Regelblock) | fällt |
|---|---|
| Kompositum-Ausschluss entfernt | „Kompositum schweigt", „Ergänzungsstrich schweigt"; im echten Bestand zwei Warnungen (`custom-car`, `hot-rod`) |
| Ausschluss auf jedes folgende Trennzeichen erweitert | „ungedeckte Bindestrichschreibung gibt eine Warnung", „Kompositum verdeckt die echte Variante nicht" |
| Ebene zurück auf Hinweis | dieselben zwei, an der Ebene |

Posten entfällt (9 Posten, 3 frei).

---

## 2026-09-23 — `npm run verify` prüft den Autolink-Drift

**Anlass:** #39 war lokal grün und in der CI rot (Schritt 6/9,
Autolink-Drift). Die lokale Kette enthielt `autolink:check` nicht.

**Entscheidung:** `verify` ruft `autolink:check` auf, zwischen JSON-LD und
Freigabeprüfung. Kosten: unter einer Sekunde. Und `test-pruefkette.ts`
verlangt jetzt allgemein, dass `verify` jeden Schritt von `verify:ci`
erreicht, streng oder in einer ausdrücklich genannten milden Fassung
(`freigabe:ci`→`freigabe`, `validate:strict`→`validate`,
`jsonld:strict`→`jsonld`). Genau diese drei Unterschiede sind gewollt; jeder
weitere ist eine Lücke.

**Verworfen:** Nur die eine Zeile in `package.json` ergänzen. Das hätte den
Fall behoben, nicht die Ursache: Beim nächsten Schritt, der nur in
`verify:ci` eingetragen wird, entsteht dieselbe Lücke, und niemand merkt es
vor dem Push.

**Belege:** Vor der Korrektur scheitert der neue Test an genau einer
Behauptung (`verify erreicht den CI-Schritt "autolink:check"`), danach
63/63. Mutationen, jede nur an den Zeilen `verify` bzw. `verify:ci`:

| Mutation | fällt |
|---|---|
| neuer Schritt `lint:neu` nur in `verify:ci` | „verify erreicht den CI-Schritt lint:neu" |
| `validate` aus `verify` entfernt | „… validate:strict oder seine nachsichtige Fassung validate" |
| `validate:strict` in `verify:ci` durch `validate` ersetzt | die bestehende Behauptung „verify:ci erreicht validate:strict" und die neue „validate:strict ist wirklich ein Schritt von verify:ci" |
| `autolink:check` aus `verify` entfernt | „verify erreicht den CI-Schritt autolink:check" |

Lektion 27. Die Beschriftung im Kommentar zu `verify:ci` („und der
Autolink-Drift wird geprüft") ist entfernt; sie hatte die Lücke als
Strenge ausgegeben.

---

## 2026-09-23 — Zweiter Termin für Niedersachsen und Rhein-Neckar: die Häuser, nicht die Verzeichnisse

**Anlass:** Posten „Niedersachsen und Rhein-Neckar brauchen einen zweiten
Termin". Beide Regionen standen bei zwei von drei freigegebenen Einträgen.

**Ergebnis:** Vier Entwürfe, je Region ein Haus und ein Konzert:
`asb-bahnhof-barsinghausen` mit Boppin'B am 3. Oktober 2026 (Niedersachsen),
`cafe-central-weinheim` mit Long Tall Texans am 20. November 2026
(Rhein-Neckar). Nach der Freigabe stehen beide Regionen bei vier von drei.
Jeder Termin ist an zwei voneinander unabhängigen Stellen belegt: Seite des
Hauses und Ticketanbieter (Reservix bzw. loveyourartist).

### Funde mit Folgen

**Die Verzeichnisse sind der falsche Einstieg, die Häuser der richtige.**
livegigs.de antwortet mit 403, boogie-online.de mit 503, die Terminseite von
rock-and-roll-termine.de mit 404. Gefunden wurden beide Termine über die
Programmseiten der Häuser selbst und über den Terminkalender der Band beim
Ticketanbieter — der ist dann zugleich die zweite, unabhängige Quelle.
Für künftige Recherchen: zuerst Häuser mit Szeneprogramm suchen, dann deren
Kalender lesen.

**Das Café Central Weinheim verwendet alte Ankündigungstexte weiter.** Die
Detailseite zum Termin 2026 kündigt im Fließtext eine „Deutschlandtour im
Februar 2023" an, und unter `/konzert/rockabilly-mafia/` steht im selben
Seitenaufbau ein Termin von 2021. Auf der Startseite fehlen die Jahreszahlen
ganz. Termine dieses Hauses deshalb nur mit Jahreszahl aus der Datumszeile
der Detailseite übernehmen und gegen den Ticketanbieter halten. Der
Widerspruch steht im Eintrag, nicht nur hier (Regel 5).

**Die vier Entwürfe lassen sich nur gemeinsam freigeben.** Haus und Konzert
verlinken einander; einzeln scheitert jedes an `link-auf-entwurf`.
Belegt im Trockenlauf: `freigeben.ts --slugs cafe-central-weinheim
--dry-run` lehnt mit genau dieser Regel ab, alle vier zusammen gehen durch
(4 würden freigegeben, 0 abgelehnt). Das ist die Regel vom selben Tag im
ersten echten Einsatz — sie verlangt einen Freigabelauf mit allen vier
Slugs.

**Freigegeben am selben Tag** (#40, ein Lauf mit allen vier Slugs,
`verify:ci` im Workflow grün). Beleg über den Build mit
`PUBLIC_INDEXIERBAR=true`, vorher gegen nachher: Auf dem Stand vor #40
tragen `/regionen/niedersachsen/` und `/regionen/rhein-neckar/`
`noindex, follow` und fehlen in der Sitemap, `/regionen/berlin/` als
Gegenprobe nicht. Nach #40 sind alle drei ohne `noindex` und in der
Sitemap. `npm run stale` meldet keine Region mehr unter der Schwelle.

**Nicht gebaut:** Bandseiten für Boppin'B und Long Tall Texans. Beide stehen
in `lineupWeitere`; Boppin'B hat mit zwei Terminen im Register (Barsinghausen,
und laut Café Central Weinheim am 9. Januar 2027) die stärkste Grundlage.
Ob sie entstehen, entscheidet Markus. Verworfen für Rhein-Neckar: den
Swing-Social des TSV Mannheim aus seiner Wiederholungsregel (jeder zweite und
vierte Donnerstag) zu datieren — ein abgeleiteter Termin ist kein belegter.

---

## 2026-09-23 — Links entstehen erst mit der Freigabe

**Anlass:** Der Rock'n'Roll-Eintrag kam als Entwurf, der Autolink setzte ihn
in 20 freigegebene Seiten, und in der Produktion — die Entwürfe nicht baut —
zeigten alle 20 ins Leere. Die Prüfkette war grün: `interne-links` prüft
gegen den Bestand, und im Bestand stand der Entwurf.

**Entscheidung von Markus: (a)** — der Autolink verlinkt nur freigegebene
Ziele. **Verworfen: (b)**, Entwürfe mit `noindex` bauen. Das bräche die
Zusage in `netlify.toml` („Die Produktion zeigt ausschließlich, was ein
Mensch freigegeben hat") und stellte ungeprüfte Recherche live.
**Verworfen, der Vollständigkeit halber:** Links beim Rendern entfernen,
wenn das Ziel nicht gebaut wird. Das widerspricht dem Grund, aus dem der
Autolink in die Quelle schreibt (Kopf von `sync-autolinks.ts`): Links
sollen im Diff stehen, und die Linkzählung soll zur Seite passen.

### Drei Teile, und warum es drei sein mussten

**1. `sync-autolinks.ts` nimmt Ziele nur aus Freigegebenem.** Verlinkt
werden weiterhin alle Einträge — ein Entwurf darf auf Freigegebenes zeigen.
Heute null Änderungen, weil es keine Entwürfe gibt.

**2. `freigeben.ts` zieht den Autolink nach.** Das stand im Posten als
Handgriff — seit #36 wäre es mehr gewesen: Der Freigabe-Workflow lässt
`verify:ci` laufen, und das enthält `autolink:check`. Ein eben
freigegebener Begriff hätte Drift erzeugt, die Kette wäre rot geworden, und
es wäre **gar kein** Freigabe-PR entstanden. Jetzt entstehen die Links im
selben Lauf und damit im selben PR, der ihr Ziel veröffentlicht.

**3. Neue Regel `link-auf-entwurf`, Ebene `fehler`.** Ein freigegebener
Eintrag darf im Fließtext nicht auf einen Entwurf verlinken. (a) schließt
den Autolink als Quelle, aber ein von Hand geschriebener Link — auch von
einem unbeaufsichtigten Lauf — stellte denselben Zustand still wieder her.
Nur Fließtext: Frontmatter-Verweise löst der Faktenblock über die Registry
auf, die in der Produktion nur Freigegebenes enthält; unaufgelöst wird dort
Text statt Link.

### Ein Nebenfund, der den Umbau der Freigabe erzwungen hat

`freigeben.ts` gab Eintrag für Eintrag frei und prüfte jeden sofort. Mit der
neuen Regel hängt das Ergebnis an der Reihenfolge: Ein Artikel, der vor
seinem Begriff an der Reihe ist, wäre abgelehnt worden, weil der Begriff in
dem Moment noch Entwurf ist. **Die Freigabe vom 2026-09-22 wäre daran
gescheitert** — `hot-rod-und-kustom-kulture` verlinkt auf `hot-rod` und
`kustom-kulture`, alle drei im selben Lauf.

Jetzt: alle Kandidaten zugleich schreiben, prüfen, Durchgefallene
zurückrollen, **wiederholen bis zum Fixpunkt**. Die Wiederholung ist nötig:
Im ersten Durchgang ist ein Ziel noch mitfreigegeben, der Verweis darauf
also gültig — erst nach dem Zurückrollen zeigt er auf einen Entwurf.

### Und die Regel fand ihren Zustand zuerst in den Tests

Auf dem Register war sie sofort grün. In den Vorrichtungen schlug sie
zweimal an: eine Fixture in `test-validate.ts`, freigegeben, verlinkt auf
zwei Entwürfe; und die **ganze** Vorrichtung von `test-freigeben.ts`, in
der die Prüfeinträge aufeinander zeigten, auch auf solche, die nie
freigegeben werden — elf Behauptungen fielen. Umgebaut wurden die
Vorrichtungen, nicht die Regel: `test-freigeben.ts` hat jetzt drei feste,
freigegebene Anker als Linkziele. Lektion 26.

### Belege

| Prüfung | vorher | jetzt |
|---|---|---|
| `test-sync-autolinks.ts` | 9 | 13 |
| `test-freigeben.ts` | 24 | 37 |
| `test-validate.ts` | 207 | 222 |

Sieben Mutationen, je auf den Block begrenzt und zurückgebaut:

| Mutation | Was fällt |
|---|---|
| Autolink nimmt wieder alle Ziele | 2 — „ein Entwurf wird nicht verlinkt …" |
| `freigeben.ts` zieht den Autolink nicht nach | 2 — „die Freigabe setzt den Link im selben Lauf" |
| Regel abgeschaltet | 1 — „freigegeben verlinkt auf Entwurf schlägt an" |
| Regel prüft auch Entwürfe als Quelle | 1 — „ein Entwurf darf auf einen Entwurf zeigen" |
| Regel meldet auch nicht existierende Ziele | 1 — „ein toter Link wird nicht doppelt gemeldet" |
| Freigabe mit nur einem Durchgang | 2 — der Zeiger wird freigegeben, sein Ziel nicht: genau der tote Link |
| Freigabe wieder Eintrag für Eintrag | 2 — der Artikel vor seinem Begriff wird abgelehnt |

---

## 2026-09-23 — `main` ist geschützt, und der Schutz ist belegt

**Anlass:** Am 2026-09-21 gefunden: Die GitHub-API meldete für alle Branches
`protected: false`. Schritt 4 aus `SETUP.md` war nie umgesetzt. „Nie auf
`main` pushen" — der Satz, auf dem der tägliche unbeaufsichtigte Lauf ruht —
war eine Prompt-Regel, keine Sperre.

**Eingerichtet von Markus**, als Ruleset „main schützen": Active, nur der
Default-Branch, Löschen und Force-Push blockiert, Pull Request Pflicht mit
0 Genehmigungen, keine Status-Checks, **Umgehungsliste leer**.

### Die Entscheidung, die alles andere bestimmt: keine Ausnahme für den Admin

Die Agenten treten gegenüber GitHub als `kloeschen` auf — der tägliche Lauf
(PR #34 zeigt „kloeschen" als Autor) genauso wie die Sitzung über die
GitHub-Werkzeuge. **Wer den Admin auf die Umgehungsliste setzt, setzt damit
jeden Agenten mit diesem Token darauf.** Die Sperre hielte dann niemanden
auf, der sie betreffen soll.

Der Preis ist bewusst gezahlt: Auch der Mensch committet nicht mehr direkt
auf `main`. Die Freigaben vom 9. und 10. September, beide Direktcommits,
gingen so nicht mehr — und genau darum geht es.

**Verworfen:**
- *Status-Check `verify` als Pflicht.* Auf Freigabe-PRs läuft die CI nicht
  (Bot-Token) — sie wären nie mergebar. Seit PR #36 läuft die Kette im
  Freigabe-Workflow, bevor der PR entsteht.
- *Pflicht-Genehmigungen.* GitHub lässt niemanden die eigenen PRs
  genehmigen. In einem Repo mit einer Person sperrten sie den Menschen aus.
- *Ein Muster wie `*` statt nur `main`.* `vorschau.yml` pusht mit `--force`
  auf den Branch `vorschau`; der wäre mitgesperrt.

### Was der Schutz leistet, und was nicht

**Er leistet:** Kein Direktpush auf `main`, von niemandem, kein Force-Push,
kein Löschen.

**Er leistet nicht:** Einen Pull Request mergen kann ein Agent weiterhin —
er ist ja „kloeschen". Dass Inhalts-PRs auf den Menschen warten, bleibt eine
Regel in `automerge:erlaubt` und im Prompt. Das ist die Grenze dessen, was
sich in einem Repo mit einer Person und einer geteilten Identität sperren
lässt, und sie steht hier, damit niemand sie für geschlossen hält.

### Belege (Regel 6: Eine Sperre, die nie blockiert hat, ist unbewiesen)

**Die Probe:** ein leerer Commit, direkt auf `main` gepusht, mit dem Titel
„Sperrprobe: dieser Push muss abgelehnt werden".

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
 ! [remote rejected] HEAD -> main (push declined due to repository rule violations)
```

Exitcode 1, `origin/main` danach unverändert auf dem Merge von #36, kein
Commit „Sperrprobe" in der Historie.

**Die Gegenprobe:** Dieser Eintrag selbst kommt über einen Pull Request auf
`main`. Ginge das nicht, wäre die Sperre zu eng — ein Schutz, der auch den
legitimen Weg blockiert, wird ausgeschaltet statt beachtet. Dass der Merge
durchging, steht in der Historie unmittelbar nach diesem Commit.

Warum der Beleg nicht optional war: Bei einem privaten Repo ohne bezahlten
Plan legt GitHub ein Ruleset an und setzt es **nicht** durch. Die Oberfläche
sähe genauso aus. Nur ein abgelehnter Push unterscheidet eine Sperre von
einer Einstellung. (Dieses Repo ist öffentlich; geprüft wurde trotzdem.)

---

## 2026-09-23 — Der Freigabe-Workflow prüft sein Ergebnis selbst

**Anlass:** Der erste Freigabe-PR (#32) hätte `main` rot gemacht, und keine
Prüfung hätte es angezeigt. Der Posten dazu empfahl, die Kette in den
Freigabe-Workflow zu ziehen, und als Zwischenlösung, den CI-Lauf auf dem PR
von Hand freizugeben. **Beim Nachprüfen fiel die Zwischenlösung weg:** Auch
ein freigegebener CI-Lauf wäre an der Freigabeprüfung (Schritt 3 von 9)
stehengeblieben, bevor Tests und Build laufen — genau dort lag der Fehler.
Das erwartete Rot hätte das echte verdeckt. Lektion 25.

**Entscheidung von Markus:** Der Freigabe-Workflow lässt `npm run verify:ci`
auf seinem Ergebnis laufen, bevor er den Pull Request öffnet. Scheitert die
Kette, entsteht kein PR.

### Wie die Bestätigung in die Kette kommt

`verify:ci` ruft `freigabe:ci` als festen Schritt ohne Schalter auf. Damit
die Kette auf einem Freigabe-Ergebnis weiterläuft, liest `check-freigabe.ts`
die Bestätigung jetzt zusätzlich aus `FREIGABE_BESTAETIGT`.
`freigeben.ts` schreibt dafür die **tatsächlich** freigegebenen Slugs nach
`$GITHUB_OUTPUT` — nicht die Eingabe des Workflows, die eine ganze Collection
sein kann, und keine abgelehnten Einträge.

**Warum das die Prüfung nicht schwächt — und eine Korrektur dazu.** Der Kopf
von `check-freigabe.ts` nannte die Bestätigung „eine Handlung an der
Kommandozeile", die bewusst nicht im Repository steht. Das war nie ein
Beweis für einen Menschen: Am 2026-09-22 hat ein Agent sowohl den
Freigabe-Workflow per API ausgelöst als auch die Bestätigungszeile
ausgeführt. Was die Prüfung tatsächlich leistet, steht in ihrem eigenen
Kopf: Sie fängt die **unbeabsichtigte** Veröffentlichung, einen
Statuswechsel, der nebenbei in einem PR landet. Der Freigabe-Workflow ist
per Definition beabsichtigt.

**Damit eine liegengebliebene Variable nicht alles durchwinkt:** kein
Sammelwert (`*`, `alle` und Leerraum bestätigen nichts), jede Bestätigung
aus der Umgebung steht mit Herkunft im Bericht, und ein genannter Slug ohne
Statuswechsel wird auf stderr gemeldet.

**Verworfen:**
- *Die Kette im Workflow einzeln aufzählen und `freigabe:ci` weglassen.*
  `test-pruefkette.ts` verbietet das nur für `ci.yml`, erlaubt wäre es also.
  Aber es ist der M10-Fehler in neuer Datei: zwei Orte, an denen die Kette
  definiert ist.
- *`freigabe:ci` in der Kette nach hinten ziehen.* Tests und Build liefen
  dann, aber das Gesamtergebnis bliebe rot, und man müsste jedes Mal lesen,
  ob das Rot das erwartete ist. Das ist Lektion 25 in anderer Form.
- *Die Bestätigung im Commit lesen.* Dort kann sie jeder schreiben, der
  pushen kann — und sie gälte dann auch für jeden anderen PR.

### Der Schritt im Workflow, und warum er geprüft wird

Den Schritt in `.github/workflows/freigeben.yml` setzt ein Mensch ein;
`.github/` liegt hinter der Agentensperre. `test-pruefkette.ts` verlangt
jetzt, dass er dasteht, `npm run verify:ci` aufruft, die Slugs aus
`steps.lauf.outputs.slugs` weiterreicht, nach dem Freigabelauf und vor
`gh pr create` steht. **Ohne ihn ist die Kette rot** — gewollt: Der Pull
Request mit dieser Änderung ist erst mergebar, wenn der Schritt im selben
Zweig steht.

### Belege

| Prüfung | vorher | jetzt |
|---|---|---|
| `test-freigabe.ts` | 17 | 30 |
| `test-freigeben.ts` | 17 | 24 |
| `test-pruefkette.ts` | 38 | 46 |

`test-pruefkette.ts` in beide Richtungen: gegen den heutigen Workflow
**genau vier** Fehlschläge (die vier Behauptungen über den Kettenschritt),
die drei Lebenszeichen des Zerlegers bestehen. Gegen eine Kopie mit dem
eingesetzten Block **46/46**.

Sechs Mutationen, je auf den Block begrenzt und zurückgebaut:

| Mutation | Was fällt |
|---|---|
| Kettenschritt nach dem PR-Schritt | 1 — „bevor der Pull Request entsteht" |
| Kettenschritt ohne `FREIGABE_BESTAETIGT` | 1 — „bekommt die freigegebenen Slugs" |
| Umgebung wird ignoriert | 6, darunter „Bestätigung aus der Umgebung ergibt Exit 0" |
| Sammelwert eingeführt (`*`/`alle` decken alles) | 2 — genau die beiden Sammelwert-Fälle |
| Herkunftsvermerk fehlt | 2 |
| `freigeben.ts` gibt die Eingabe statt der Freigegebenen aus | 2, darunter „der abgelehnte Slug steht nicht darin" |

---

## 2026-09-23 — Der Rock'n'Roll-Eintrag, und was er über drei Prüfungen verrät

Der unbeaufsichtigte Lauf hat den obersten freien Posten gebaut: den
Lexikoneintrag zum Rock'n'Roll. Vier Quellen einzeln geöffnet (deutsche
Wikipedia, Britannica, DWDS, Duden), und aus dem Eintrag selbst sind drei
Funde gefallen, die über ihn hinausreichen.

### 1. `aeraVon`/`aeraBis` bleiben leer, weil sich die Quellen widersprechen

Alle vier datieren in Jahrzehnten, und zwar unterschiedlich: Duden „Anfang
der 50er-Jahre", Britannica „mid-1950s", die deutsche Wikipedia „1950er- und
frühe 1960er-Jahre", das DWDS schlicht „50er Jahre 20. Jh.". Keine nennt ein
Jahr für Anfang oder Ende. Jede Zahl in diesen Feldern wäre damit eine
Auslegung von „Anfang" oder „Mitte" — also geschätzt. Die Felder bleiben
leer, die Spannbreite bekommt einen eigenen Abschnitt im Text. Der Posten
hatte das vorhergesagt; die Messung hat es bestätigt und um den Duden
erweitert.

### 2. Zur Wortprägung widerspricht sich die Wikipedia selbst

Sie schreibt, der Begriff sei „vermutlich erstmals 1951 vom amerikanischen DJ
Alan Freed geprägt" worden, führt im nächsten Satz Gegenbelege von 1934
(Boswell Sisters) und 1951 (Eunice Davis) an, und datiert Freeds erste
Verwendung als Genrebezeichnung an anderer Stelle auf den **Herbst 1955**.
Drei Angaben, eine Quelle, kein Ausgleich — und der Artikel trägt einen
„Belege fehlen"-Baustein. Britannica stützt die Gegenseite: „For decades
African Americans had used the term rock and roll as a euphemism for sex",
und Freed erscheint dort als einer von drei Diskjockeys, die den Sound
verbreiteten. Nach Lektion 20 steht der Widerspruch im Text, benannt und
zugeordnet; gesichert übrig bleibt die schwächere Aussage, dass Freed den
Begriff durchgesetzt, nicht erfunden hat.

### 3. Neue Regel `lexikon-schreibvarianten` — weil die Prosa danebenlag

Der Posten nannte zwei Schreibungen im Bestand (`Rock'n'Roll` 77-mal,
`Rock-'n'-Roll` 15-mal) und verlangte beide als Alias. **Es sind drei:**
`Rock 'n' Roll` mit Leerzeichen steht viermal in drei Dateien. Ohne diesen
dritten Alias wären genau diese vier Stellen stumm unverlinkt geblieben —
fehlende Links zeigen nichts an, deshalb hätte es niemand gemerkt. Das ist
Regel 3 im Reinformat: Eine Anforderung, die zählt, stand in Prosa, und die
Prosa war unvollständig.

Die Regel meldet jetzt jede Trennzeichen-Schreibung eines Lexikonbegriffs,
die im freien Text des Bestands steht und die kein Name und kein Alias
literal deckt. Gemessen über den ganzen Bestand: drei Funde, null
Fehlalarme. Einen davon hat der Lauf gleich selbst behoben (das
Wikipedia-Lemma mit typografischen Apostrophen als vierten Alias), zwei
stehen als eigener `frei`-Posten offen.

**Verworfen: Ebene `warnung`.** Nach dem Kriterium im Kopf von
`validate-content.ts` — eine Warnung benennt etwas, das ein sorgfältiger
Eintrag beheben kann, ein Hinweis etwas, das er nur durch Erfinden beheben
kann — wäre eine Warnung richtig: Die Regel nennt eine Zeichenfolge, die
nachweislich im Bestand steht, es ist nichts zu erfinden. Blockierend wird
sie aber erst tragfähig, wenn die zwei Altfunde entschieden sind, und ob eine
Bindestrichschreibung einen Alias verdient, ist eine redaktionelle Frage an
freigegebenen Einträgen. Erst der Posten, dann die Ebene.

**Verworfen: die Messung über Wort-Tokens.** Der erste Entwurf zerlegte den
Fließtext in Tokens und verglich deren Normalform. Er fiel zweimal um, und
beide Male zeigte es der Mutationsbeleg, nicht der Code: Das Token-Muster
konnte weder zwei Trennzeichen hintereinander lesen (`Rock 'n' Roll`) noch
aufhören, gierig bis zum vierten Wort zu greifen (`Rock 'n' Roll war`). Die
tragfähige Fassung dreht die Richtung um: pro Begriff ein Muster, das seine
Bestandteile mit beliebigen Trennzeichen wieder zusammensetzt.

Zwischen den Bestandteilen steht `+` und nicht `*`, und das ist der einzige
Unterschied zwischen null und einem Fehlalarm: Mit `*` matchte
`Pork Pie Hat` auf „Porkpie hat" — ein deutsches Hilfsverb hinter einem Hut.
Belegt durch eine Mutation, deren erster Anlauf nicht fiel, weil der Testfall
`Hat` groß schrieb und damit nur die Groß-/Kleinschreibung prüfte.

### 4. Fund ohne Entscheidung: 20 freigegebene Seiten zeigen auf einen Entwurf

Der Autolink hat 20 Links in freigegebene Dateien geschrieben, deren Ziel
`status: entwurf` trägt. In der Produktion wird die Seite nicht gebaut —
`npm run build` ohne Vorschauschalter erzeugt 20 Dateien mit
`href="/lexikon/rocknroll/"` und keine Zielseite —, und die Prüfkette ist
dabei grün, weil `interne-links` gegen den Bestand prüft und nicht gegen den
Build. Den Zustand gibt es zum ersten Mal: Vor der Freigabe vom 2026-09-22
war kein Entwurf im Bestand, auf den eine freigegebene Seite zeigte
(nachgestellt gegen `d96c6b1^1`). Lektion 19, wörtlich eingetreten.

Hier wurde **nicht** gebaut, weil zwei vertretbare Wege offenstehen und die
Wahl eine Semantik ist: Entweder verlinkt der Autolink nur freigegebene
Ziele (dann wird `autolink:check` im Freigabe-PR rot, bis jemand
`npm run autolink` ausführt), oder Entwürfe werden mit `noindex` gebaut (dann
zeigt die Produktion unfreigegebene Inhalte, was `netlify.toml` ausdrücklich
ausschließt). Als `mensch`-Posten in OFFENE-PUNKTE.md, mit Empfehlung für den
ersten Weg — er hält beide bestehenden Zusagen.

---

## 2026-09-22 — Die erste Freigabe über den Knopf hätte `main` rot gemacht

Der Freigabe-Workflow lief am 2026-09-22 zum ersten Mal wirklich (die
bisherigen Freigaben waren Direktcommits vom 9. und 10. September). Er
arbeitete korrekt: sieben Einträge, jeder im freigegebenen Zustand gegen
`validate-content --strict` und `check-jsonld --strict` geprüft, Pull
Request geöffnet. Trotzdem war das Ergebnis nicht mergefähig, und zwar aus
zwei Gründen, die beide erst durch das Nachstellen des Merges sichtbar
wurden.

### Befund 1: Auf dem Freigabe-PR läuft die CI überhaupt nicht

Der CI-Lauf steht auf `action_required` — GitHub hält Workflows an, die ein
Bot-Token ausgelöst hat. **Das ist schlimmer als ein roter Haken.** Ein
roter Haken sagt, dass geprüft wurde und etwas nicht passt; hier wurde
nichts geprüft, und der Pull Request sieht unauffällig aus. Genau die
stille Voreinstellung, die dieses Projekt sonst überall vermeidet.

Die Vorhersage in diesem Protokoll vom Vortag — „ein Freigabe-PR wird die
CI rot machen, und zwar planmäßig" — war damit falsch, und zwar in der
gefährlicheren Richtung. Als eigener `mensch`-Posten in OFFENE-PUNKTE.md,
mit drei Wegen; Empfehlung ist, `verify:ci` in den Freigabe-Workflow zu
ziehen, statt sich auf einen Haken zu verlassen, der aus einem anderen
Grund fehlen kann.

### Befund 2: Vier Prüfungen hingen am Bestand statt an der Regel

`npm run test` fiel auf dem Merge-Ergebnis mit vier Fehlschlägen in
`test-anzeige.ts`. Alle vier benutzten **`bands` und `artikel` als Beispiel
für „leere Sammlung"**, fest verdrahtet — am Tag des Schreibens richtig,
und falsch in der Sekunde, in der der erste Bandeintrag freigegeben wurde.
Nach dieser Freigabe ist keine Sammlung mehr leer.

An der Anzeige war nichts kaputt. Die Prüfungen fielen, weil die Arbeit
gelungen ist.

**Das ist genau der Fehler, vor dem der Kopf von `warteschlange.ts`
ausdrücklich warnt:** „Ein Test, der an der echten Datei hängt, schlägt an,
sobald jemand einen Posten erledigt — und wird dann abgeschaltet statt
gelesen." Dort war die Warnung aufgeschrieben und befolgt; hier, zwei
Dateien weiter, war derselbe Fehler schon eingebaut. Eine Lektion schützt
nur die Stelle, an der jemand an sie gedacht hat.

**Entscheidung von Markus:** gegen den Bestand prüfen, kein dritter Build.
Die Navigation und der Sitemap-Index müssen **genau** die Sammlungen mit
Eintrag nennen — aus dem Register ermittelt, nicht aus dem Build, sonst
prüfte der Build gegen sich selbst. Beide Richtungen haben heute einen
lebenden Gegenstand.

**Verworfen:** ein dritter Build gegen ein Fixture-Register mit einer
absichtlich leeren Sammlung (das Muster gäbe es in `test-ausgaben.ts`). Er
könnte nie veralten, kostet aber einen weiteren vollständigen astro-Build
in einem ohnehin langsamen Test. Der leere Fall ist in `test-facetten.ts`
an `uebersichtIndexierbar(0)` einzeln belegt, wo er keinen Bestand braucht.

**Was der Verzicht kostet, steht im Code und in der Ausgabe:** Ist keine
Sammlung leer, schreibt der Test eine Zeile, die genau das sagt. Ein
wortlos ausgefallener Fall sähe aus wie ein bestandener.

### Der Nebenfund war der hübscheste

Die alte Prüfung lautete `/Derzeit \d+ Einträge/` und sah damit nur
Sammlungen mit **mehr als einem** Eintrag. Der Zweig `"Eintrag"` in
`faktenblock.ts` hatte deshalb nie einen Testgegenstand — `bands` mit genau
einem freigegebenen Eintrag ist der erste in der Geschichte des Registers.
Die neue Prüfung verlangt die zur Zahl passende Wortform.

### Belege

`npm run verify` grün, und zwar **in beiden Zuständen**: auf `main` (bands
und artikel leer, 49 Prüfungen) und auf dem nachgestellten Merge mit der
Freigabe (keine Sammlung leer, 49 Prüfungen). Dass dieselbe Datei beide
Bestände trägt, ist der eigentliche Beleg der Umstellung.

| Mutation | Was fällt |
|---|---|
| Startseite filtert leere Sammlungen nicht mehr weg | 1 — „keine Sammlungsadresse, die zu keiner gefüllten Sammlung gehört" |
| Sitemap-Index nennt auch leere Dateien | 3, darunter „jede genannte Sitemap enthält mindestens eine URL" — die bestandsunabhängige |
| Singular und Plural vertauscht | 6, darunter der Einzelfall `bands` |

Die zweite Mutation ist die wichtige: Die gefallene bestandsunabhängige
Behauptung greift auch bei vollem Register. Genau das war der Zweck der
Umstellung, und ohne diese Mutation wäre es eine Absichtserklärung
geblieben.


## 2026-09-22 — Die Autoseite bekommt ihre Entitäten

Vier Lexikoneinträge angelegt (`hot-rod`, `custom-car`, `rat-rod`,
`kustom-kulture`), die Autoseite damit verdrahtet. Damit ist die
Lexikonkategorie `auto` nicht mehr leer und der erste Artikel des Registers
trägt eine `hauptentitaet`.

**Der Fund, der über den Posten hinausgeht: `hauptentitaet` war ein blinder
Pfad.** Kein Artikel hat das Feld je getragen, also ist auch kein Codeweg je
damit gelaufen — und es hängen drei daran, jeder an anderer Stelle: `about`
im JSON-LD, der Rückverweis in `buildRegistry` (das einzige Referenzfeld, das
nicht in `referenzFelder` steht, weil es kollektionsübergreifend zeigt) und
die Zeile „Handelt von" im Faktenblock. Alle drei stehen jetzt unter
Negativtests, 13 neue Prüfungen in `test-links.ts` und 5 in `test-jsonld.ts`,
jede mit ihrem Gegenstück. Drei Mutationen belegen, dass genau die erwarteten
Behauptungen fallen. Das ist Lektion 19 als Suchheuristik: Wo eine Sammlung
oder ein Feld seinen ersten Wert bekommt, laufen Prüfungen zum ersten Mal.

Am härtesten wiegt dabei nicht, dass `about` gesetzt wird, sondern dass die
`@id` dieselbe ist, die der Lexikon-Builder für denselben Slug schreibt.
Liefen beide Seiten auseinander, wäre die Referenz im Projektgraphen ein
Verweis ins Leere. Der Test vergleicht deshalb gegen einen wirklich gebauten
Lexikonknoten und nicht gegen `entitaetsId` mit sich selbst.

**Verworfen: die Duplikatregel kollektionsübergreifend ziehen.** Der Artikel
trug „Kustom Kulture" als Alias, der neue Lexikoneintrag trägt den Namen —
zwei Entitäten, ein Name. Die Regel `duplikat` sieht das nicht, weil sie
innerhalb einer Collection prüft. Gemessen: Über den ganzen Bestand gibt es
heute **null** kollektionsübergreifende Namenskollisionen, die Regel ließe
sich also ohne einen einzigen Fehlalarm einschalten. Trotzdem nicht gebaut.
Eine Band darf legitim so heißen wie ein Lexikonbegriff („Petticoat"), und
unter `validate:strict` ist auch eine Warnung rot — die Regel würde beim
ersten solchen Eintrag zum Fehlalarm, und eine Prüfung mit Fehlalarmquote
wird nach zwei Wochen ignoriert. Gewählt wurde stattdessen die enge Lösung:
Der Alias am Artikel ist weg, weil der Begriff jetzt eine eigene Entität hat.

**Verworfen: `kustom-kulture` in die Kategorie `szene`.** Sie wäre genauer —
die Quelldefinition nennt vier Bereiche, von denen nur einer die Fahrzeuge
sind. Den Ausschlag gab, dass der offene Punkt alle vier Begriffe
ausdrücklich als Füllung der leeren Kategorie `auto` benennt, die Themensäule
ebenfalls `kustom-kulture` heißt und ein Einzeleintrag in einer sonst leeren
Kategorie den Begriff von den drei Fahrzeugeinträgen getrennt hätte, auf die
er sich bezieht. Die Alternative steht in der Redaktionsnotiz des Eintrags,
damit sie beim Prüfen sichtbar ist und nicht erst hier.

**Kein `aeraVon`/`aeraBis` an allen vier Einträgen.** Die Nachschlagewerke
datieren durchweg in Jahrzehnten („aus den 1920er bis 1940er Jahren", „in den
vierziger Jahren"). Die einzigen harten Jahreszahlen sind Baujahre und die
NHRA-Gründung im Mai 1951 — keine davon ist der Beginn einer Ära. Ein
Jahrzehnt in eine Jahreszahl umzumünzen wäre geschätzt; die Zahlen stehen
deshalb im Fließtext, wo sie sagen, was die Quelle sagt.

**Rock'n'Roll nicht mitgebaut, sondern als eigener Posten geführt.** Der
offene Punkt nannte ihn als Nebenbefund. Zwei Gründe, ihn zu trennen, beide
gemessen: Der Begriff kommt im Bestand 76-mal in 30 Dateien vor, ein
Lexikoneintrag dazu würde den Autolink also quer durch das ganze Register
schreiben — ein Diff, der neben vier Fahrzeugeinträgen nicht mehr prüfbar
ist. Und die naheliegende Quelle, der deutsche Wikipedia-Artikel, trägt einen
Belege-fehlen-Baustein. Für den Ursprungsbegriff der ganzen Szene ist das zu
dünn; der Posten verlangt jetzt ausdrücklich eine zweite Quelle.

---

## 2026-09-21 — Vier Entscheidungen nach zwei Tagen unbeaufsichtigtem Lauf

Erst gemessen, dann entschieden. Die Messung hat die Reihenfolge der
Dringlichkeit umgedreht.

**Der Befund, der alles andere überlagert.** Die Warteschlange wuchs in zwei
Läufen von 9 auf 16 Posten, die `mensch`-Posten von 5 auf 10. Ein Posten
abgearbeitet, acht erzeugt. Der Rückstau an **Entscheidungen** hat sich
verdoppelt, während der Rückstau an **Arbeit** um einen sank. Die Drosselung
auf einen Posten pro Tag wirkt auf die falsche Größe: Sie begrenzt den
Ausstoß, nicht den Rückstau. Ausführlich als Lektion 21.

### Die vier Entscheidungen

**1. Dublettenschutz: nicht gemergte Git-Refs statt offener Pull Requests.**
Beschlossen war, `--naechster` solle die GitHub-API befragen. Gebaut ist
etwas Äquivalentes, und der Unterschied ist eine Verbesserung, keine
Abkürzung: Gefragt wird nach Refs unter `refs/remotes/`, die nicht in der
Basis enthalten sind. **Verworfen** damit der Einwand, der gegen diese
Variante sprach — es braucht kein Token und keinen Netzaufruf im Skript, die
ganze Datei bleibt offline lauffähig, nicht nur `--check`. Zusätzlich zählt
ein Zweig schon, bevor ein Pull Request existiert; genau dieses Fenster war
der Zustand am 2026-09-20 abends. **Verworfen** außerdem Variante (c) aus dem
Posten (Marke im PR-Zweig umstellen): Sie legt die Buchführung dorthin, wo
der nächste Lauf sie nicht sieht, und löst den Fall gerade nicht.

**2. Die Eskalationsregel ist zu grob und wird verengt.** Bisher: „Ermessens­
frage → `mensch`". Ab jetzt darf ein Lauf eine **eng geführte Ausnahme**
selbst bauen — begrenzt auf ein Feld an einem Typ, mit Negativtest und
Mutationsbeleg. Zum Menschen geht erst das **Lockern der allgemeinen Regel**.
Der Unterschied ist prüfbar und nicht selbst wieder Ermessen: Die enge
Ausnahme belegt ihre eigenen Grenzen, die allgemeine Lockerung kann das
nicht.

Anlass ist der Doppellauf als unfreiwilliges Experiment — zwei Agenten,
derselbe Auftrag, dreimal direkt vergleichbar, **zweimal war die mutigere
Fassung die bessere**. Entscheidend der eine Fall, in dem die Vorsicht
griff: Ein Lauf entschied die `datePublished`-Frage selbst und lag richtig,
der andere eskalierte. Kosten: ein Tag und ein Bandeintrag ohne Werkliste.
Geschützt hat das Zögern nichts.

**3. `npm run archivieren` wird Schritt 0 des Laufs.** Am Morgen des
2026-09-21 war `npm run verify` auf `main` rot, ohne dass jemand etwas
geändert hatte. **Verworfen:** den Befund zur Warnung herabstufen — ein
Termin, der seit Wochen auf `geplant` steht, ist ein echter Fehler und soll
laut sein. **Verworfen:** der wöchentlichen Pflege überlassen — dann ist bis
zu sechs Tage lang jeder Zweig rot, auch einer, der mit Terminen nichts zu
tun hat. Schritt 0 braucht keine Änderung an `.github/` (gesperrt) und keine
Regeländerung.

**4. Einträge aus dem Lauf tragen `autor: markus`.** Die Zuschreibung meint
den verantwortlichen Herausgeber, nicht den Schreibenden, und spätestens mit
der Freigabe trifft sie zu; `veroeffentlichungsreife` verlangt sie dort
ohnehin. Der Rückfall auf die Organisation im `artikelBuilder` bleibt
trotzdem — er fängt den Entwurf ohne Autor ab, der ein zulässiger Zustand
ist, und `test-jsonld.ts` belegt ihn. `hot-rod-und-kustom-kulture.md` ist
angeglichen.

### Zwei Funde beim Bauen, beide teurer als der Auftrag

**Der erste Entwurf der Belegungsprüfung meldete drei Fehlalarme**, beim
allerersten Lauf gegen das echte Repository. Er prüfte nur „auf der Basis
`frei`, auf dem Zweig nicht mehr" — und `pflege/woechentlich` zweigte von
einem älteren Stand ab, auf dem es drei der Posten schlicht noch nicht gab.
„Steht da nicht" und „wurde dort abgearbeitet" sind verschiedene Dinge. Seit
der Korrektur zählt ein Posten nur, wenn er am **Abzweigpunkt** frei war und
an der **Spitze** nicht mehr. Lektion 22.

**Der oberste freie Posten war die Grundlage des Auftrags selbst** und wurde
deshalb mitgebaut: Ein Titel, der über zwei Zeilen umbricht, fiel stumm aus
der Warteschlange. Die neue Belegungsprüfung vergleicht Posten über ihren
Titel — auf einem Parser, der Titel verschluckt, wäre sie wertlos gewesen.
Bitter daran: Der Kopf der Datei begründete ausführlich, warum ein fehlender
Marker laut scheitern muss. Die Begründung war richtig und half nichts, weil
der Parser eine Zeile davor aufgab. Lektion 23.

### Belege

`npm run verify` grün. `test-warteschlange.ts` von 34 auf 58 Prüfungen.
Sechs Mutationen, je auf den betroffenen Block begrenzt:

| Mutation | gefallene Behauptungen |
|---|---|
| Abzweigbedingung entfernt | 5, darunter der Fehlalarm-Fall |
| Spitzenbedingung immer wahr | 6 |
| `mensch`-Posten nicht mehr übersprungen | 4 |
| gemergte Zweige nicht mehr übersprungen | live: 1 → 5 offene Zweige |
| Zusammenzug umgebrochener Titel abgeschaltet | 5 — exakt der Zustand vor der Reparatur |
| Leerzeile stoppt den Zusammenzug nicht mehr | 1 |

**Die dritte Mutation fiel beim ersten Versuch nicht** — die zugehörige
Prüfung bestand auch aus einem zweiten Grund und belegte damit keinen von
beiden (Regel 4). Die Vorrichtung wurde umgebaut, nicht die Behauptung
gestrichen; die Begründung steht im Test.

**Nebenbefund beim Mutationsbeleg:** Ein erwarteter, abgefangener
`git show`-Fehler schrieb sein `fatal:` trotzdem in die Ausgabe des Laufs,
weil `execFileSync` stderr durchreicht. Behoben — dieselbe stdout-Hygiene,
die `--json` schon verlangt.


## 2026-09-21 — Die ersten Einträge in bands/ und artikel/ — und was sie freilegten

Erster Posten des unbeaufsichtigten Laufs. Gebaut wurde, was der Posten
verlangte: je ein belegter Eintrag in den beiden leeren Sammlungen
(`bands/mad-sin.md`, `artikel/petticoat-reifrock-unterrock.md`, beide
`entwurf`). Was der Lauf nicht kann, ist die Freigabe — deshalb bleibt ein
Restposten (`mensch`) stehen, und `npm run stale` führt beide Sammlungen
bis dahin zu Recht weiter unter „ohne Eintrag". Interessant ist ohnehin
nicht der Inhalt, sondern was beim Bauen herausfiel.

**Die Schemafrage, an der der Posten hing, war längst erledigt.**
OFFENE-PUNKTE.md schrieb: „Für Bands hängt daran die Schemafrage unten."
Gemeint waren die drei Bands-Werte auf `min(1930)`. Die stehen seit dem
2026-09-11 auf `min(1900)` — der Verweis zeigte ins Leere und hätte den
Posten auf unbestimmte Zeit blockiert, wenn ihn jemand ernst genommen
hätte. Zeile ersatzlos gestrichen.

**Zwei Fehler wurden erst sichtbar, weil die Sammlungen nicht mehr leer
waren.** Beide sind Lektion 4 in Reinform — eine Prüfung, die nie gelaufen
ist, ist unbewiesen:

1. **Die Gegenprobe in `test-ausgaben.ts` war falsch.** Sie verlangt, dass
   jeder freigegebene Eintrag in der Sitemap seines Typs steht, kannte aber
   die beiden Ausnahmen nicht, die der Build selbst anwendet (`noindex`,
   `istDuenneRegion`). Niedersachsen und Rhein-Neckar sind freigegeben und
   stehen absichtlich nicht in der Sitemap — die Gegenprobe wurde daraufhin
   rot. Sie war seit ihrer Entstehung nie gelaufen: Der ganze Block
   übersprang sich, solange kein Entwurf im Register lag, und bis zu diesem
   Commit lag keiner darin. **Korrigiert und in beide Richtungen geprüft**
   — zurückgehalten heißt jetzt nachweislich *nicht* in der Sitemap, statt
   bloß „wird nicht gefragt". Zwei Mutationen belegen es (siehe unten).

2. **Der Bandbuilder und die Datumsprüfung widersprechen sich.**
   `bandBuilder` schreibt `datePublished: "1988"` je Album,
   `check-jsonld.ts` verlangt für Datumsfelder `YYYY-MM-TT`, und
   `MusicAlbum` führt `datePublished` als Pflichtfeld. Ergebnis: **Jede
   gefüllte `veroeffentlichungen`-Liste macht `npm run jsonld` rot.** Der
   Fehler steckt seit dem Bau des Builders drin und konnte nicht auffallen,
   weil es keine Band gab.

**Beim zweiten Punkt wurde bewusst nicht repariert.** Die Reparatur ist
eine Vertragsfrage mit zwei vertretbaren Antworten, und damit gehört sie
zum Menschen (BETRIEB 2.5):

- *Die Prüfung lockern.* ISO 8601 kennt die verkürzte Form, „1988" ist ein
  gültiges Datum, und `foundingDate` gibt im selben Builder längst bare
  Jahreszahlen aus, ohne dass es jemand prüft. Kosten: Eine blanke
  Lockerung erlaubt dann auch bei `Article` ein Datum ohne Tag, was Googles
  Vorgaben widerspricht. Sauber wäre die Regel je Knotentyp — eine
  Strukturänderung an `check-jsonld.ts`, für das es bisher **keinen
  eigenen Test in der Prüfkette gibt**.
- *Ein Datum erfinden.* Ausgeschlossen. „Unbekannt heißt Feld weglassen,
  nicht schätzen" gilt auch für den 1. Januar.

Solange das offen ist, trägt `mad-sin.md` **keine** `veroeffentlichungen`.
Die Diskografie steht vollständig und belegt im Fließtext — verloren geht
nichts außer der maschinenlesbaren Form. Der Posten steht als `mensch` in
OFFENE-PUNKTE.md.

**`typ: vergleich` statt `typ: pillar` beim ersten Artikel**, aus
demselben Grund. Ein Pillar legt die Struktur einer Säule der Themenkarte
fest, und die Themenkarte liegt nicht in diesem Repo. Ein Vergleich
beantwortet eine abgegrenzte Frage und lässt sich später über `gehoertZu`
unter einen Pillar hängen, ohne umgeschrieben zu werden. Die
zurückhaltende Variante kostet hier nichts und nimmt keine Entscheidung
vorweg.

**Nebenbefund, nicht gebaut:** `npm run verify` war auf `main` bereits rot,
bevor dieser Zweig entstand — die Boogie-Party vom 2026-09-20 stand noch
auf `geplant`. `npm run archivieren` hat sie umgestellt; das ist genau der
dafür vorgesehene Befehl und steckt hier mit drin, weil die Prüfkette sonst
nicht grün wird. Die Sache hat einen Haken, der einen eigenen Posten wert
wäre: Diese Prüfung wird durch bloßen Zeitablauf rot, ohne dass jemand
etwas committet.

**Zwei Befunde über den Lauf selbst, beide erst beim Abliefern aufgefallen
und beide teurer als der Posten:**

**Der Lauf hat denselben Posten zweimal gebaut.** PR #26 vom Vorabend hatte
„Bands und Artikel sind leer" bereits abgearbeitet — dieselbe Band, ein
anderer Artikel, dieselben zwei Funde, dort sogar mit fertiger Reparatur der
`datePublished`-Frage. Er war nur nicht gemerged, und `npm run
warteschlange` liest OFFENE-PUNKTE.md aus dem Arbeitsbaum: Dort stand der
Posten unverändert auf `frei`. Das ist kein Ausrutscher, sondern der
Regelfall — Inhalts-PRs warten absichtlich auf einen Menschen, also ist der
Vortags-PR beim nächsten Lauf fast immer noch offen. Drei mögliche Wege mit
ihren Kosten stehen als `mensch`-Posten in OFFENE-PUNKTE.md; keiner ist
offensichtlich richtig, deshalb hier nicht entschieden.

**Die Warteschlange verschluckt Posten mit umgebrochenem Titel.** Beim
Eintragen der neuen Posten fiel auf, dass zwei davon nicht mitgezählt
wurden. `MIT_MARKE` ist zeilenweise verankert und verlangt die schließenden
`**` in derselben Zeile wie die Marke; läuft der Titel um, greift auch
`OHNE_MARKE` nicht, weil die Folgezeile nicht mit `**` beginnt. Der Posten
fällt **stumm** heraus, und `--check` schweigt, weil er gar nicht gesehen
wird — genau der Zustand, den der Kopf von OFFENE-PUNKTE.md ausschließen
wollte. Minimalbeleg: `lies()` auf einem umgebrochenen Titel ergibt
`posten=0 ohneMarke=0`, derselbe Titel einzeilig `posten=1`. Eigene Titel
einzeilig gemacht, damit nichts verdeckt bleibt; der Fehler selbst steht als
`frei`-Posten drin, weil er kein Ermessen enthält und in einen eigenen Lauf
mit eigenem Negativtest gehört (ein Posten pro Lauf).

**Mutationsbelege** (jeweils auf den betroffenen Block begrenzt,
zeichengenau zurückgebaut):

| Mutation | Erwartung | Ergebnis |
|---|---|---|
| `istDuenneRegion` aus dem Sitemap-Filter entfernt | genau die beiden „Zurueckgehalten"-Behauptungen fallen | 2 von 80 gefallen, exakt diese |
| Sitemap-Filter wirft alles weg (`false &&`) | alle „Freigegeben"-Behauptungen fallen, die beiden zurückgehaltenen bleiben grün | 36 gefallen, die zwei blieben grün |
| eine `veroeffentlichung` mit `jahr: 1996` eingesetzt | `jsonld` meldet genau ein `datum`-Problem, `validate` meldet die fehlende Felddeckung | genau das, 1 Fehler + 1 Warnung |

---

## 2026-09-20 — Die ersten Band- und Artikeleinträge, und drei Regeln, die ihren Gegenstand nie gesehen hatten

Erster Lauf der täglichen Routine. Gebaut wurde der oberste freie Posten,
„Bands und Artikel sind leer": je ein belegter Eintrag. Das Ergebnis ist zur
Hälfte Inhalt und zur Hälfte ein Befund über die Prüfkette.

**Inhalt.** `bands/mad-sin.md` (Berlin, 1987, Psychobilly, fünf Quellen) und
`artikel/hot-rod-und-kustom-kulture.md` (Säule `kustom-kulture`, fünf
Quellen). Beide `status: entwurf` — den freigegebenen Status setzt ein
Mensch, und erst die Freigabe nimmt die beiden Sammlungen aus „Sammlungen
ohne Eintrag". Der Posten bleibt deshalb offen und trägt jetzt die Marke
`mensch`.

**Warum Mad Sin und nicht The Firebirds.** Die naheliegende Wahl wäre die
Band aus dem Golden Example gewesen. Sie scheitert an `genres`: Das Feld
verlangt mindestens einen Lexikonslug, die Quellen nennen The Firebirds
durchweg „Rock'n'Roll" — und einen Lexikoneintrag dazu gibt es nicht. Die
einzige Art, das Feld zu füllen, wäre eine Zuordnung ohne Beleg gewesen. Bei
Mad Sin steht „Psychobilly" im ersten Satz von drei unabhängigen Quellen.
**Der Fund dahinter:** Das Genrevokabular des Registers hat kein
Rock'n'Roll. Jede Band, deren Quellen genau das sagen, ist derzeit nicht
eintragbar.

**Warum die Säule `kustom-kulture`.** Sie ist die einzige, zu der das
Lexikon keinen einzigen Eintrag hat. Ein Artikel zu Mode oder Musik hätte
einen vorhandenen Lexikoneintrag in längerer Form wiederholt — die
bestehenden tragen 700 bis 770 Wörter und decken ihre Abgrenzung bereits ab.

### Drei Prüfungen, die erst mit dem ersten Eintrag ihren Gegenstand bekamen

Das ist der eigentliche Ertrag des Laufs, und es ist dreimal dasselbe Muster
(Lektion 19): Eine Regel, die nie angeschlagen hat, ist unbewiesen — und
eine Regel, die nie etwas zu prüfen hatte, ist es erst recht.

**1. `datePublished` am MusicAlbum.** Der Bandbuilder schreibt das
Erscheinungsjahr einer Platte als `"1988"`; `check-jsonld.ts` verlangte ein
volles Kalenderdatum und meldete zwölf Fehler. Beide Seiten hatten recht:
`veroeffentlichungen[].jahr` ist eine Zahl, weil die Quellen eine Zahl
nennen, und ISO 8601 lässt die verkürzte Form ausdrücklich zu. **Verworfen:**
im Builder einen 1. Januar ergänzen. Das wäre eine Genauigkeit, die keine
Quelle deckt — genau das, was hier nirgends passieren soll. Die Ausnahme
steht jetzt in `scripts/_jsonld-datum.ts` und ist eng geführt: nur
`datePublished`, nur am `MusicAlbum`. Ein `startDate` ohne Tag bleibt ein
Fehler.

**2. Die Urheberschaft am Article.** `PFLICHT` verlangt `author` an jedem
Article, `veroeffentlichungsreife` verlangt einen Autor erst bei der
Freigabe. Ein Entwurf ohne Autor erfüllte die eine Regel und brach die
andere. Der Artikel dieses Laufs hat keinen — er stammt nicht aus der Hand
eines Menschen, und `autor: markus` wäre eine erfundene Zuschreibung
gewesen. **Verworfen:** `author` aus `PFLICHT` streichen (schwächt eine
richtige Anforderung) und einen Namen eintragen (siehe oben). Gewählt: Ohne
benannten Autor fällt die Urheberschaft an die Organisation. Sie hat den
Text verantwortet.

**3. Die Gegenprobe in `test-ausgaben.ts` lief überhaupt nicht.** Der ganze
Build-Abschnitt überspringt sich, solange kein Entwurf im Register steht —
und bis heute stand keiner. Mit dem ersten Entwurf lief er und fiel sofort:
Niedersachsen und Rhein-Neckar sind freigegeben, stehen aber unter der
Bestandsschwelle und damit nicht in der Sitemap. Das ist beabsichtigt
(„Regionsschwelle über den Bestand", unten); die Gegenprobe wusste nur
nichts davon. Sie überspringt diese Regionen jetzt nicht, sondern prüft
andersherum — eine Ausnahme ohne Gegenbuchung wäre eine Lücke, durch die
auch ein kaputter Filter passt.

**Belege:** `npm run verify` grün. Acht Mutationen, je auf den betroffenen
Block begrenzt, mit zeichengenauem Rückbau: Typbedingung entfernt,
Feldbedingung entfernt, Ausnahme ganz entfernt, Builder schreibt einen
unzulässigen Wert, Autorenrückfall entfernt, Rückfall gilt immer,
Regionsschwelle in der Sitemap abgeschaltet, Sitemap wirft einen
freigegebenen Eintrag weg. Jede fiel mit genau den erwarteten Behauptungen.
Neu: `scripts/test-jsonld.ts` (23 Prüfungen), eingehängt in `npm test`.

### Was nicht gebaut wurde

Die Recherche zu Mad Sin hat zwei Angaben nicht hergegeben, und beide stehen
als solche im Eintrag statt als Schätzung: die aktuelle Besetzung (MusicBrainz
führt Gründungsgitarrist Stein als aktiv, laut.de nennt für das Album von 2020
zwei andere Gitarristen — `besetzung` führt ihn deshalb gar nicht) und die
offizielle Website (madsin.de liefert am 2026-09-20 ein abgelaufenes
Zertifikat, das Schema lässt nur https zu). Auch `aktiv: true` trägt nur
MusicBrainz; Songkick und Reservix meldeten am selben Tag keine Termine.
Eine Websuche hatte zwei kommende Konzerte angekündigt — beide
Anbieterseiten widerlegten das beim direkten Abruf. Erst messen, dann
eintragen, gilt auch für Suchergebnisse.

### Nachtrag vom 2026-09-21: zwei Läufe, ein Posten

Dieser Eintrag entstand am Vorabend und lag noch offen, als der planmäßige
Lauf denselben Posten erneut nahm — Ursache, Kosten und die drei möglichen
Abhilfen stehen als eigener `mensch`-Posten in OFFENE-PUNKTE.md. Beim
Zusammenführen galt eine Regel: **Übernommen wurde nur, was der jeweilige
Lauf mit selbst geöffneten Quellen belegt hatte.** Wo beide Läufe aus
derselben Beleglage verschieden entschieden haben (`besetzung`, `aliases`,
`einstieg`, `kurzbeschreibung`), gilt die bereits gemergte Fassung; eine
Mischung aus zwei Ermessensentscheidungen wäre von keiner der beiden
gedeckt gewesen.

Drei Dinge sind dadurch anders als oben beschrieben:

**Die Gegenprobe in `test-ausgaben.ts`** wurde von beiden Läufen gefunden
und verschieden repariert. Es gilt die gemergte Fassung, und zwar nicht aus
Vorrang, sondern weil sie die bessere ist: Der Build filtert
`!noindex && !istDuenneRegion`, sie bildet beide Hälften ab und ruft
dieselbe Hilfsfunktion. Die Fassung dieses Laufs deckte nur die
Regionsschwelle — der erste Eintrag mit `noindex: true` hätte sie mit
falscher Begründung rot gefärbt.

**`veroeffentlichungen` an Mad Sin ist jetzt gefüllt.** Der andere Lauf hat
die Datumsfrage nicht gelöst, sondern als Entscheidung mit zwei
vertretbaren Antworten notiert — (a) die Prüfung je Knotentyp auffächern,
(b) pauschal lockern — und dabei zur Bedingung gemacht, dass (a) einen
eigenen Test mitbringt, weil `check-jsonld.ts` bisher keinen hatte. Was
oben steht, **ist** (a) einschließlich dieses Tests. Der Posten entfällt
damit; die Diskografie steht im Feld statt im Fließtext.

**Die Urheberschaft bleibt offen, und zwar sichtbar.** Der Rückfall auf die
Organisation (Punkt 2 oben) bleibt, weil er einen zulässigen Zustand
abfängt und in `test-jsonld.ts` belegt ist. Der Bandeintrag trägt jedoch
`autor: markus` wie die übrigen 44 Einträge, der Artikel dieses Laufs
keinen Autor. Diese Uneinheitlichkeit wird nicht geglättet: Sie ist die
Entscheidung, die ansteht, und sie steht als Posten in OFFENE-PUNKTE.md.

---

## 2026-09-20 — Der unbeaufsichtigte Lauf steht, nach fünf Fehlstarts

Nachtrag zum Eintrag unten. Die Routine war angelegt, lief aber nicht: Jede
Sitzung brach nach drei bis vier Sekunden ab mit `error_kind: init_script`,
„Setup script failed", `recoverable: false` — ohne jede weitere Auskunft.

**Die Lösung brauchte zweierlei gleichzeitig:**

1. Ein **triviales Setup-Skript** (`echo setup ok`).
2. Ein **zugeordnetes Repository** in der Routine.

Fehlt eins von beiden, bricht der Start ab. Das erklärt, warum jeder Versuch,
nur eins zu ändern, wirkungslos blieb.

**`npm ci` gehört nicht ins Setup-Skript.** Im Container läuft es
einwandfrei — 302 Pakete in sechs Sekunden, nachgewiesen im Lauf selbst.
Dort verhinderte es jeden Start. Es spart eine Minute und kostete den
gesamten Lauf; jetzt steht es als Schritt 0 im Auftrag.

**Belegt ist der Lauf durch einen Handstart am 2026-09-20:** Repository da,
`npm ci` grün, `git push --dry-run` Exitcode 0, GitHub-Werkzeuge als
`kloeschen` authentifiziert. Recherchieren, bauen, pushen, PR öffnen —
alles möglich.

### Zwei Fehler in der Diagnose, beide meine

**Erstens: Ich habe geraten statt zu messen.** Vier Runden lang habe ich
Hypothesen zum Setup-Skript geschickt, und drei meiner Vorschläge trugen je
eine eigene neue Fehlerquelle (`[ -d v101 ] && cd v101` scheitert selbst;
`exec > /tmp/...` vermutlich ebenso). Der entscheidende Befund —
`echo setup ok` läuft, `npm ci` im Setup nicht — lag nach der zweiten Runde
vor. Statt ihn zu nutzen, habe ich weiter am Setup-Skript gebaut, obwohl es
dort gar nichts zu tun braucht.

**Zweitens: Ich habe eine Metadatenzeile falsch gelesen.** Das Feld
`turn_handoff.tools` listet nur die eingebauten Werkzeuge, nicht die aus
MCP-Servern. Daraus habe ich geschlossen, dem Lauf fehlten die
GitHub-Werkzeuge, und einen ganzen Ausweichpfad in den Auftrag gebaut
(„falls du keinen Pull Request öffnen kannst"). Tatsächlich sind sie da und
authentifiziert. Der Ausweichpfad bleibt als Fangnetz stehen, ist aber
unnötig.

**Was beide Fehler gemeinsam haben:** eine Behauptung aus einem Indiz
abgeleitet, statt sie zu prüfen. Genau das, wogegen dieses Projekt seine
Mutationsbelege hat. Bei einer fremden Infrastruktur ist die Versuchung
größer, weil das Messen teurer ist — es kostet eine Runde mit einem
Menschen. Genau dann lohnt es sich am meisten: Der Lauf, der die drei Fragen
endgültig beantwortet hat, kostete 0,29 $ und eine Minute.

---

## 2026-09-20 — Der Engpass war nicht die Freigabe, sondern der Sitzungsstart

**Anlass:** Markus' Eindruck, die Entwicklung sei schleppend und er selbst
der Engpass. Vor dem Umbau erhoben — und die Zahlen widersprechen der
Selbstdiagnose:

| Gemessen über 24 Pull Requests | |
|---|---|
| Median bis zum Merge | **27 Minuten** |
| unter einer Stunde gemerged | 17 von 24 |
| Median zwischen Merge und nächstem PR-Start | 24 Minuten |
| längste Lücken | **109 h** vor #24, **103 h** vor #14, 39 h vor #20 |

Die langen Lücken sind keine Genehmigungslücken. Es sind ganze Tage ohne
Sitzung: 32 Commits am 3. September, null am 6., null am 8., null vom 13.
bis 15., null vom 18. bis 20. **Wenn eine Sitzung läuft, hält niemand
jemanden auf. Ohne Sitzung fängt nichts an.**

Das ist ein Terminproblem, kein Freigabeproblem — und deshalb ändert die
Lösung keine einzige Sperre.

**Der Hebel steckte schon in Abschnitt 2.1 von BETRIEB.md:** `guard.mjs`
blockiert das Setzen des freigegebenen Status, nicht das Anlegen. Ein
unbeaufsichtigter Lauf kann also recherchieren, schreiben, validieren,
belegen und einen Pull Request öffnen; nur der letzte Schritt wartet. Für
ein anderes Projekt läuft dasselbe Muster seit Wochen wöchentlich.

**Entscheidungen des Menschen:** täglich ein Posten; Umfang Code, Recherche,
Doku und Pflege; Auto-Merge nur für reine Code-PRs.

### Zwei Regeln, und beide stehen in Code

**1. Die Warteschlange** (`scripts/warteschlange.ts`). `OFFENE-PUNKTE.md`
ist ab jetzt nicht mehr nur Prosa, sondern die Eingabe eines Automaten.
Jeder Posten unter „Als Nächstes" trägt `frei` oder `mensch`.

**Ein Posten ohne Marke ist ein Fehler**, keine Voreinstellung — und das ist
die eigentliche Entscheidung. Beide naheliegenden Voreinstellungen sind
falsch:

- *Ohne Marke = frei* lässt einen unmarkierten Ermessensposten in den
  Automaten laufen.
- *Ohne Marke = mensch* lässt ihn **stumm** aus der Warteschlange fallen.
  Der Lauf meldet „nichts zu tun", obwohl etwas dasteht, und niemand merkt
  es.

Die zweite ist die gefährlichere, weil sie niemandem auffällt (Lektion 19).
Also scheitert die Prüfkette laut. Aktueller Stand: 9 Posten, 4 frei.

**2. Die Auto-Merge-Grenze** (`scripts/automerge-erlaubt.ts`). Reine
Code-PRs dürfen bei grüner CI selbst mergen, alles unter `src/content/`
wartet auf einen Menschen.

**Der Grund für genau diese Grenze: Die Prüfkette beweist Struktur, nicht
Wahrheit.** Ein Tippfehler in einem Validator fällt in `npm run verify` auf,
eine falsch recherchierte Anfangszeit nicht. Beim Record Hop ist genau das
passiert — die Zeit war falsch, alle Prüfungen grün, gefunden wurde sie nur,
weil die Quelle aus einem anderen Grund noch einmal geöffnet wurde. Code
kann sich selbst beweisen, ein recherchierter Fakt nicht.

Die Liste führt außerdem die vier gesperrten Pfade, obwohl der Hook sie
ohnehin blockiert: Eine Sperre, die sich auf eine andere verlässt, ist eine
halbe.

**Beide Regeln liegen bewusst nicht im Prompt der Routine.** Im Prompt wären
sie eine Bitte an ein Modell; als Skript sind sie ein Exitcode. Das ist
Regel 3 des Projekts, angewendet auf den Automaten, der sie befolgen soll.

### Der Beleg fand einen Fehler im Beleg

**Der erste Mutationslauf scheiterte am Test selbst, nicht am Code.**
`u.gruende[0].grund` warf eine TypeError, sobald die mutierte Regel eine
leere Liste lieferte: Der Test **stürzte ab**, statt **fehlzuschlagen**, und
der Beleg sah null gefallene Behauptungen. Dieselbe Fehlerklasse wie in
`test-checklinks.ts` — zum zweiten Mal, jetzt mit Begründung im Dateikopf.

**Und er deckte eine schwache Vorrichtung auf.** Die Behauptung „der
Rückstau wird nicht mitgelesen" hielt auch dann, wenn die Abschnittsgrenze
mutiert war — weil der Rückstau im Harnisch nur einen *unmarkierten* Posten
enthielt, der in der Mängelliste landete statt in der Postenzahl. Behoben,
indem der Rückstau jetzt einen **markierten** Posten trägt. Erst damit misst
die Behauptung, was ihr Name sagt.

**8 Mutationen, alle belegt.** Drei davon schalten keine Regel ab, sondern
verschieben sie: die Abschnittsgrenze, die Sortierung der Pfadtreffer
(längster Treffer gewinnt, sonst trüge `_schemas.ts` den allgemeinen
Inhaltsgrund) und ein Präfix-Vergleich, der zum Teilstring wird. Eine
abgeschaltete Regel und eine falsch gezogene Grenze sind verschiedene Fehler.

### Was ausdrücklich nicht passiert ist

Die vier gesperrten Pfade und das Freigabetor bleiben, wie sie sind. Sie
waren nie der Engpass, und Lektion 16 gilt unverändert: Eine Sperre, die
sich per Auftrag lösen lässt, ist eine Bitte.

**Offen und bewusst so benannt:** Autonomie verschiebt den Engpass, sie
beseitigt ihn nicht. Erzeugt der Lauf schneller Entwürfe, als jemand sie
freigeben kann, ist die Freigabe der neue Engpass. Ein Posten pro Tag ist
deshalb niedrig angesetzt — höchstens ein Pull Request pro Morgen.

---

## 2026-09-16 — Zwei Entscheidungen zur Design-Dokumentation

Beides Folgeentscheidungen aus dem Nachziehen von `DESIGN-BRIEF.md`, beide
vom Menschen getroffen.

### 1. Die Reihenfolge bleibt, der Kommentar wird richtig

**Entschieden:** `EntitaetsLayout.astro` behält `H1 → Faktenblock → Inhalt`.
Der Kopfkommentar, der seit jeher `H1 → Antwortkapsel → Faktenblock →
Inhalt` behauptete, ist an den Code angeglichen worden — samt der
Begründung, warum der Faktenblock vorn gehört.

**Die Begründung:** Der Faktenblock ist der dichteste strukturierte Inhalt
der Seite. Wer wissen will, wann das Festival ist, findet es ohne Scrollen,
und ein extrahierendes Modell bekommt zuerst dt/dd-Paare statt Prosa. Die
Implementierung war hier besser als die dokumentierte Absicht — der Fehler
lag im Kommentar, nicht im Code.

**Zwei Alternativen verworfen, beide mit gemessenen Kosten:**

- *Faktenblock hinter den Fließtext* — das hätte der dokumentierten Absicht
  entsprochen. Auf `/lexikon/petticoat/` stünden damit **1177 Wörter vor den
  Fakten**. Der Vierzig-Sekunden-Besuch, für den dieses Register gebaut ist,
  scrollt dann an allem vorbei.
- *`kurzbeschreibung` zusätzlich als `.kapsel` über den Faktenblock rendern*,
  wie es die Übersichtsseiten tun. Dagegen spricht eine Messung: Die
  Überlappung zwischen `kurzbeschreibung` und dem ersten Absatz des
  Fließtexts liegt im Median bei 54 %, **bei Events und Locations aber bei
  80–91 %**. Dort stünde sichtbar zweimal fast dasselbe. Wörtlich identisch
  ist kein einziges Paar der 38 — es wäre also nicht einmal eine ehrliche
  Dopplung, sondern eine, die den Leser zum Vergleichen zwingt. Bei Lexikon
  und Regionen (18–36 %) wäre es unproblematisch gewesen; eine Regel, die
  nur für vier von sechs Collections trägt, ist keine.

**Was daraus für die Kapsel folgt und jetzt an drei Stellen steht:** Sie hat
kein eigenes Element. Sie ist `.inhalt > p:first-child`, und genau das prüft
`kapsel-vorhanden`. Der Kommentar sagt es, der Brief sagt es, und die
verworfenen Alternativen stehen hier.

### 2. Kennzahlen stehen nur noch an einer Stelle

**Entschieden:** Prompt 3 in `DESIGN-PROMPTING.md` nennt keine Zahlen mehr,
sondern verweist auf `DESIGN-BRIEF.md`, Abschnitt „Die sechs Bildschirme".
Der Brief wird ohnehin mit hochgeladen, die Vorlage bleibt also benutzbar.

**Der Grund ist derselbe wie bei Regel 3 des Projekts, nur für Dokumente:**
Zwei Orte für denselben Wert laufen auseinander. Genau das ist passiert —
die Vorlage beschrieb bis heute einen Lexikoneintrag mit „120 Wörtern", den
es nie gab, und eine Regionsseite mit sechs Listen, die drei hat.

**Dabei ein sachlicher Fehler mitkorrigiert, der keine veraltete Zahl war:**
Der dritte Härtetest-Fall hieß „eine abgesagte Veranstaltung: Hinweisbox
über dem Faktenblock". Den Fall gibt es nicht — eine Absage ist eine
Faktenzeile (`data-feld="durchfuehrung"`), keine Box. Ersetzt durch den
Entwurfszustand, der wirklich eine Box erzeugt und der härtere Test ist: Er
betrifft nicht eine Seite, sondern jede Liste, in der der Eintrag vorkommt.

Die Ausnahme des Auftrags („`DESIGN-PROMPTING.md` unverändert lassen — das
sind Prompt-Muster, keine Projektfakten") war richtig gedacht und traf hier
nur nicht zu: In den Vorlagen standen Projektfakten. Dass sie dort nicht
mehr stehen, macht die Ausnahme künftig wieder zutreffend.

---

## 2026-09-16 — DESIGN-BRIEF.md nachgezogen: gemessen statt geraten

**Anlass:** Der Brief entstand, als das Register leer war. Seine Zahlen
waren Schätzungen aus den Komponenten, und fast jede lag daneben, sobald
38 freigegebene Einträge dastanden.

**Methode, und sie ist der eigentliche Inhalt dieses Eintrags:** Alles neu
Aufgeschriebene stammt aus dem **erzeugten HTML**, nicht aus den
`.astro`-Dateien — zwei Builds, einmal `PUBLIC_ENTWUERFE=false`, einmal
`true`, dann ausgezählt. Ein Brief, der Komponenten paraphrasiert, behauptet
die Absicht; ein Brief, der das Ergebnis auszählt, beschreibt, was ein
Gestalter vor sich hat.

**Die Korrekturen, von der folgenreichsten abwärts:**

| Behauptung im alten Brief | gemessen |
|---|---|
| „H1 → Antwortkapsel → Faktenblock → Fließtext" | H1 → **Faktenblock** → Fließtext |
| `.kapsel` trägt die Antwortkapsel | auf Entitätsseiten **gibt es keine `.kapsel`** |
| `.inhalt` führt h2/h3, ul, table, blockquote | 126× H2, **0× alles andere** |
| Eventseite: 17 Faktenzeilen, Line-up, FAQ, mehrere Listen | max. 14 Zeilen, **eine** Liste, keine FAQ |
| Lexikon: „der ärmste Fall", 3 Zeilen, 120 Wörter | 6–10 Zeilen, 383–1177 Wörter |
| Regionsseite: vier bis sechs Listen | **drei** |
| Übersicht: Kapsel, Filterlinks, Liste | Kapsel, Liste, **dann** Filterlinks — und nur auf `/events/` |
| `/daten/`: Codepfade | **kein einziges `<code>`** |
| `.hinweis` trägt Entwurf, abgesagt, letzte Ausgabe | nur Entwurf und `noindex`; die anderen sind Faktenzeilen |

**Die Antwortkapsel ist der Kern der Verwirrung, und sie ist kein Fehler.**
Sie ist der erste Absatz des Fließtexts — genau das prüft die Regel
`kapsel-vorhanden` (25–90 Wörter). Ein eigenes Element hat sie nie gehabt.
Gestalterisch erreichbar nur über `.inhalt > p:first-child`. Wer das nicht
weiß, gestaltet eine Klasse, die auf 38 von 62 Seiten nicht vorkommt.

**Neun Selektoren waren nicht im Brief**, darunter die vom Auftrag genannten:
`.liste--knapp`, `.liste__entwurf`, `.trenner`, `.liste__datum`,
`.sammlungen*`, `.belege__stand`, `.belege__autor`, `.belege__quellen`,
`.belege__abgerufen`.

**Sieben davon haben bis heute keine einzige CSS-Regel** — sie stehen im
HTML und rendern als nackter Fließtext. Das steht jetzt in der
Selektorentabelle als eigene Spalte, weil es der Unterschied ist zwischen
„gestalte das um" und „gestalte das überhaupt erst".

**Der Token-Vertrag ist der einzige Teil, der unverändert galt:** 32 zu 32
gegen `tokens.css`, keine Abweichung. Drei Anmerkungen ergänzt:
`--farbe-flaeche`, `--farbe-akzent-text` und `--schatten` werden nirgends
per `var()` gelesen — sie zu setzen ändert heute nichts —, und
`--farbe-akzent-text` hat keine Dunkelmodus-Fassung (Weiß bliebe auf
`#e0705f` stehen). Solange der Token ungenutzt ist, fällt das nicht auf.

**Neu: ein Abschnitt, was ein Entwurf gestalterisch braucht.** Dafür gab es
bisher keine Vorgabe, obwohl der Zustand die gesamte Redaktionsarbeit trägt.
Gemessen wurde er, indem ein Eintrag kurzzeitig auf Entwurf gesetzt, die
Vorschau gebaut und die Datei zeichengenau zurückgebaut wurde — dieselbe
Disziplin wie ein Mutationsbeleg, per Hash belegt.

Drei Befunde daraus:

- Das Markup steht jetzt zeichengenau im Brief statt umschrieben.
- **Ein** Entwurf erzeugt den Listenmarker auf **sechs** Seiten. Er ist kein
  Sonderfall einer Seite, sondern läuft quer durch die Vorschau.
- **Der „offene Quellenblock" ist keine eigene Klasse.** Es ist derselbe
  `details.belege__quellen` mit dem Attribut `open` — gesetzt, wenn
  `PUBLIC_ENTWUERFE` gilt. Damit gehört er in dieselbe Familie wie Marker
  und Hinweiskasten: ein Vorschauzustand, kein neues Element. Gestalterisch
  folgt daraus, dass der aufgeklappte Zustand in der Vorschau der Normalfall
  ist und dort ordentlich aussehen muss.

**Verworfen: die Annahme des Auftrags, Bleistiftrock sei der reichste
Lexikonfall.** Gemessen ist er Mittelfeld (550 Wörter, 3 H2, 5 Quellen).
Der reichste ist **Petticoat** (1177 Wörter, 10 Quellen), der dünnste
**Boogie-Woogie** (383 Wörter, 8 Zeilen). Bleistiftrocks Reiz ist
redaktionell — er trägt den belegten Quellenwiderspruch aus Lektion 20 —,
nicht gestalterisch. Beide Fälle stehen jetzt als getrennte Bildschirme im
Brief, weil reich und arm verschiedene Dinge auf die Probe stellen.

**`DESIGN-PROMPTING.md` blieb unverändert**, wie beauftragt. Es enthält
allerdings dieselben veralteten Zahlen innerhalb seiner Prompt-Vorlagen —
festgehalten in OFFENE-PUNKTE.md statt stillschweigend mitgeändert.

---

## 2026-09-11 — Bands-Jahre: Untergrenze gesenkt, zwei Regeln dazugebaut

**Entscheidung des Menschen:** `gegruendet`, `aufgeloest` und das Jahr einer
Veröffentlichung im Bandschema von `min(1930)` auf `min(1900)`. Die Zeilen
sind vom Menschen committet, das Schema bleibt für Agenten gesperrt.

**1900 ist nicht gewählt, sondern abgelesen.** Es ist genau der früheste
Wert, den das Register selbst datiert: `boogie-woogie.md` trägt `aeraVon:
1900`. Eine Untergrenze für Bands, die später ansetzt als der früheste
Begriff im Lexikon, schließt etwas aus, das hier ausdrücklich dazugehört.

**Der Anlass war konkret, nicht theoretisch.** Der Boogie-Woogie-Eintrag
nennt Pinetop Smith, dem Britannica die Prägung des Begriffs zuschreibt.
Seine Aufnahme „Pinetop's Boogie Woogie" stammt von 1928 — unter `min(1930)`
ließ sich dieses Jahr in `veroeffentlichungen[].jahr` nicht eintragen. Der
Lindy Hop (`aeraVon: 1928`) hat dasselbe Problem.

**Die Untergrenze war aber die harmlose Hälfte.** Sie fängt einen Wert ab,
der zu FRÜH ist. Drei Fälle fängt sie strukturell nicht, und zwei davon
fing bisher auch sonst niemand:

| Fall | vorher | jetzt |
|---|---|---|
| Auflösung vor Gründung | `band-jahre` | unverändert |
| Jahr zu weit in der **Zukunft** | nichts | `band-jahre`, Fehler |
| Veröffentlichung **vor der Gründung** | nichts | `band-jahre`, Fehler |

**Die Zukunft ist der Fall, den das Schema nicht sehen kann.** `max(2100)`
lässt eine Gründung im Jahr 2062 durch, und der Zahlendreher aus 1962 ist
genau der Fehler, der beim Abtippen entsteht. Eine mitlaufende Obergrenze
gehört trotzdem nicht ins Schema: Zod hat dort keine Zeitzone, und ein
Schema, dessen Ergebnis von der Uhr des Servers abhängt, wäre die nächste
Fassung von Lektion 1. Im Validator ist die Zeitzone da.

**Die Grenze ist das Folgejahr, nicht das laufende.** Eine für nächstes Jahr
angekündigte Band und ein vorbestellbares Album sind beides normale
Einträge. Der Test hält beide Seiten: Folgejahr erlaubt, Jahr danach Fehler.

**Neu in `datum.ts`: `jahrIn(d, zone)`.** Das Jahr unmittelbar aus dem `Date`
zu lesen, gäbe das Jahr in der Zeitzone des Prozesses — auf einem UTC-Runner
ist der 1. Januar um 00:30 Berliner Zeit dort noch das Vorjahr. Die Funktion
geht denselben Weg wie der Rest des Moduls, über die Wanduhr.

**NICHT gebaut: Veröffentlichung nach der Auflösung.** Compilations und
Live-Mitschnitte erscheinen regelmäßig Jahrzehnte danach, und auch ein
Studioalbum kommt oft erst nach der Trennung heraus. Die Regel hätte eine
hohe Fehlalarmquote, und eine Rubrik, die dauerhaft Unerledigbares führt,
wird überlesen — dann ist sie ganz entwertet, nicht nur diese Zeile. Die
Entscheidung steht als Prüffall im Repo (`jahre-platte-posthum.md`,
`verboten: ["band-jahre"]`): Wer die Regel eines Tages doch baut, bringt
diesen Fall zu Fall und muss gegen die Begründung hier argumentieren.

**Die Untergrenze ist durch ein Grenzpaar belegt, nicht durch eine
Mutation — und das ist Absicht.** Es gibt null Bandeinträge; ein Lauf gegen
echte Daten kann über die Zahl nichts zeigen, `npm run verify` bliebe grün,
egal was dort steht. Vier Prüffälle halten sie stattdessen gegen das echte
Schema: `gegruendet: 1900` geht durch, `1899` fällt, `aufgeloest: 1899`
fällt, `veroeffentlichungen[].jahr: 1899` fällt. Dreht jemand auf 1930
zurück, fällt der erste Fall.

**Die Schemadatei wurde dafür bewusst nicht mutiert.** Der Guard-Hook sperrt
sie; ein Skript, das über Node daran vorbeischreibt, hätte vorgeführt, dass
die Sperre eine Bitte ist (Lektion 16). Gegenprobe stattdessen direkt an Zod
gelesen: `1899` meldet „Too small: expected number to be >=1900", `1928`
meldet zu diesem Feld nichts.

**Mutationsbeleg für die beiden neuen Regeln: 5 Mutationen, alle belegt**,
je genau eine Behauptung gefallen. Darunter zwei, die nicht die Regel
abschalten, sondern sie verschieben: die Grenze auf das laufende Jahr (der
Folgejahr-Fall fällt) und die nicht gebaute Nachher-Regel eingebaut (der
Posthum-Fall fällt). Eine abgeschaltete Regel und eine falsch gezogene
Grenze sind verschiedene Fehler und brauchen verschiedene Belege.

**NEBENBEFUND, und er betrifft die Absicherung selbst:** Der Bash-Zweig von
`guard.mjs` blockiert jeden Befehl, der den gesperrten Pfad nennt **und
irgendwo ein `>` enthält** — auch in einer Pfeilfunktion. Damit war ein
reiner **Lesezugriff** gesperrt (`npx tsx -e` mit `i => i.path[0]`). Erst
ohne Pfeilfunktion lief derselbe Befehl. Die Sperre ist dadurch nicht zu
schwach, sondern zu breit — aber eine Sperre, um die man täglich
herumformuliert, wird irgendwann umgangen statt beachtet. `.claude/` ist für
Agenten gesperrt; die Korrektur gehört zum Menschen und steht in
OFFENE-PUNKTE.md.

---

## 2026-09-11 — Die Eingangstür: Startseite, leere Sammlungen, Sitemap-Index

**Anlass, und er kam aus dem Build selbst.** Nach der Freigabe baute die Site
zum ersten Mal 62 Seiten statt 20. Dabei fielen drei Dinge auf, die vorher
nicht sichtbar sein konnten, weil es nichts anzuzeigen gab:

1. `/bands/` und `/artikel/` standen **indexierbar in der Sitemap**, mit null
   Einträgen — während die Regionsschwelle aus PR #17 eine Seite mit 258
   belegten Wörtern herausnahm, weil ihr der dritte Eintrag fehlte. Derselbe
   Grundsatz, zwei entgegengesetzte Antworten.
2. Die **Startseite** war ein Satz und eine Zahl („Aktuell 38 Einträge im
   Register") und enthielt außer der Navigation keinen einzigen Link. Die
   schwächste Seite der Site war zugleich die, auf der die meisten landen.
3. Die Kapsel jeder Übersichtsseite war eine **Zählung**: „Das Register
   enthält 10 Einträge in der Kategorie Lexikon". Als `meta description`
   sagt das einer Suchmaschine nichts über die Seite.

**Entschieden — leer heißt nicht in den Index.** `uebersichtIndexierbar(n)`
in `src/lib/facetten.ts`: ab einem Eintrag indexierbar, bei null nicht, mit
Grund. **Bewusst keine Mindestmenge wie bei Facetten (5) oder Regionen (3).**
Eine Übersichtsseite ist die kanonische Adresse ihrer Sammlung, keine Auswahl
aus einem Bestand — `/lexikon/` mit einem Begriff ist die richtige Adresse für
diesen Begriff, `/events/typ/festival/` mit einem Termin ist eine dünne Kopie
der Terminseite. Die Schwelle trennt „gibt es" von „gibt es nicht", nicht
„viel" von „wenig".

Die Seite bleibt erreichbar und `follow` — sie vererbt Linkkraft weiter,
verwässert aber den Index nicht. Dasselbe Muster wie bei den Facetten.

**Angeschlossen an vier Stellen** statt an einer, und jede ist eine eigene
Entscheidung:

| Stelle | Verhalten bei einer leeren Sammlung |
|---|---|
| `src/pages/[typ]/index.astro` | `noindex, follow`, Grund in der Entwicklungsansicht |
| `sitemapFuerCollection` | die Übersicht fehlt in der Sitemap |
| `sitemapDateien` (neu) | der **Sitemap-Index nennt die leere Datei nicht** |
| `stale-report.ts` | Posten „Sammlungen ohne Eintrag", Gewicht 130 |

**Der Sitemap-Index ist die Folgewirkung, und sie war zuerst übersehen.**
Nachdem die Übersicht aus `sitemap-bands.xml` verschwand, enthielt die Datei
null URLs — und stand weiter im Index. Das ist kein Fehler, aber eine Zeile
in der Search Console, die dauerhaft „0 entdeckte URLs" meldet; ein Bericht,
dessen Zeilen nichts bedeuten, wird nach zwei Wochen überlesen (Lektion 4 in
Berichtsform). Der Index nennt jetzt nur, was etwas enthält.

**Die Datei selbst wird weiter gebaut.** Ihre Adresse soll stabil sein, damit
sie nicht verschwindet und wiederkommt, sobald die Sammlung sich füllt.
Verworfen wurde deshalb, sie aus `getStaticPaths` zu nehmen: Das hätte einen
404 auf eine URL erzeugt, die jederzeit wieder existieren kann.

**Die Startseite beantwortet jetzt die Frage, mit der jemand kommt.** „Als
Nächstes": bis zu sechs kommende Termine mit Datum, chronologisch. Darunter
„Im Register": die Sammlungen mit Inhalt, mit Zahl und einem Satz, was darin
steht. 15 Links statt 5.

Kommend heißt `!istVorbei(ende ?? beginn)`, nicht `beginn >= jetzt` — ein
Termin heute Abend gehört unter „kommend", auch wenn seine Uhrzeit schon
vorbei ist, und ein dreitägiges Festival bleibt bis zum letzten Tag aktuell.
Die Regel steht seit M9 in `lib/datum.ts` und wird hier nur benutzt.

**Die Terminliste rendert `EintragsListe` und nicht eigenes Markup.** Diese
Komponente ist die einzige Stelle im Repo, an der ein Eintrag in einer Liste
gezeigt wird, und **nur solange das stimmt, kann kein Entwurf irgendwo
unmarkiert auftauchen**. Eine zweite Terminliste für die Startseite wäre
bequemer gewesen und hätte diese Zusage aufgegeben. Stattdessen zwei
Parameter: `datum` (Datum voranstellen) und `titel` optional.

**Die Navigation wird aus der Registry abgeleitet.** Ein Menüpunkt, der auf
eine leere Seite führt, ist kein Einstieg. Gezählt wird aus `holeRegistry` —
in der Vorschau also mit Entwürfen, in der Produktion ohne.

**Die Kapsel sagt zuerst, was die Sammlung ist, und nennt die Zahl danach.**
`SAMMLUNGSKAPSEL` in `faktenblock.ts` trägt je Sammlung einen Satz; bei null
Einträgen steht „Noch kein Eintrag." statt „0 Einträge". Die Überschrift
„Einträge" über der Liste ist ersatzlos entfallen — die Liste ist
offensichtlich die Liste.

**Ein Behelf ist entfallen.** `test-anzeige.ts` hat bisher für die Dauer
eines Builds einen Lexikoneintrag freigegeben und zeichengenau zurückgebaut,
weil der Produktionsbuild sonst keine einzige Entitätsseite enthielt und eine
Gegenprobe an einer nicht existierenden Seite keine ist (Lektion 19). Seit
der Freigabe vom 10. September ist das überflüssig — und damit die einzige
Stelle im Repo, die den Statusschutz umging. Das Lebenszeichen bleibt: Der
Test prüft, dass der Produktionsbuild die Probeseite tatsächlich enthält.

**Nebenbefund an der Prüfvorrichtung.** Die Event-Vorrichtung in
`test-facetten.ts` trug kein `geprueftAm`, obwohl das Schema es verlangt.
Aufgefallen ist es erst, als `sitemapDateien` über alle Sammlungen läuft und
das Feld liest — davor hat kein Test es je angefasst. Eine Vorrichtung, die
den Datenvertrag nicht erfüllt, prüft einen Fall, den es nicht gibt.

**Mutationsbeleg: 11 Mutationen, alle belegt** — je Regel eine, auf den
betroffenen Block begrenzt (Lektion 17), mit Prüfung auf zeichengenauen
Rückbau. Zwei davon sind Paare an derselben Zeile (Bericht meldet nie /
Bericht meldet immer), damit „nicht gemeldet" nicht auch aus einer
abgeschalteten Rubrik folgen kann.

Zwei Mutationen fällten **mehr** Behauptungen als erwartet: M1
(`uebersichtIndexierbar` sagt immer ja) und M2 (die Sitemap fragt die
Schwelle nicht) rissen zusätzlich die Index-Behauptung mit. Das ist kein
Nebeneffekt, sondern die Kette: Der Index fragt die Sitemap, die Sitemap
fragt die Schwelle. Die Erwartung war falsch, nicht der Code — festgehalten,
weil die naheliegende Reaktion gewesen wäre, die Mutation umzubauen, bis sie
zur Erwartung passt.

**Offen geblieben:** Die Seitenzahl der Startseite steht bei sechs Terminen
und ist geraten. Gemessen werden kann das erst, wenn es Zahlen gibt.

---

## 2026-09-11 — `aeraVon` auf 1400, vier Datierungen nachgetragen

**Entscheidung des Menschen:** `aeraVon`/`aeraBis` im Lexikonschema von
`min(1900)` auf `min(1400)`. Die Zeile ist vom Menschen committet, das Schema
bleibt für Agenten gesperrt.

**Nachgetragen sind vier Datierungen**, die bisher nur im Fließtext standen:

| Eintrag | `aeraVon` | worauf sich die Zahl bezieht |
|---|---|---|
| Reifrock | 1470 (+ `aeraBis` 1888) | konkrete Jahreszahlen der Quelle |
| Korsett | 1550 | Mitte des 16. Jahrhunderts — die **Vorläufer** |
| Unterrock | 1500 | Beginn des 16. Jahrhunderts — die **Verbreitung** |
| Pomade | 1700 | Beginn des 18. Jahrhunderts — die **Dokumentation** |

**Die Regel dahinter, einheitlich für alle vier:** `aeraVon` trägt das
früheste Jahr, das die Quelle nennt — bei einer Jahrhundertangabe gerundet
auf den Beginn oder die genannte Hälfte —, und die Redaktionsnotiz sagt,
worauf sich die Zahl bezieht. Die Quellen wurden dafür nicht erneut geöffnet;
`geprueftAm` blieb deshalb stehen, gesetzt ist nur `geaendertAm`. Eine
Prüfung zu behaupten, die nicht stattgefunden hat, wäre genau die Art Zahl,
die sich selbst erneuert.

**Zwei der vier Zahlen sind unschärfer, als die alte Redaktionsnotiz
annahm** — sichtbar erst beim Lesen des Fließtexts:

- *Korsett:* Die Quelle datiert auf die Jahrhundertmitte die Vorläufer,
  „anliegende, geschnürte Kleidungsstücke noch ohne innere Versteifung". Die
  Definition dieses Eintrags verlangt aber Stäbchen. Das älteste erhaltene
  versteifte Stück stammt aus dem Grab einer 1598 Verstorbenen — ein
  Fundjahr, kein Entstehungsjahr. 1550 datiert den Beginn der Ära, nicht den
  ersten Beleg der Bauform.
- *Pomade:* „im 18. Jahrhundert dokumentiert" ist ein Dokumentationsjahr. Das
  Wort führt über Salben aus Äpfeln weiter zurück.

Beides steht in der jeweiligen Redaktionsnotiz. Wer die Zahl im Faktenblock
liest, soll sie im Eintrag nachprüfen können.

**FUND, UND ER KORRIGIERT EINE ZUSAGE VON MIR:** Die Datierungen erscheinen
im Faktenblock — **im JSON-LD stehen sie nicht**, und das war noch nie so.
Auch `rockabilly` trägt seit dem 9. September `aeraVon: 1954`, und im Graph
steht die Zahl nirgends. Ich hatte im Chat angekündigt, die Werte stünden
danach „im Faktenblock und im JSON-LD"; die zweite Hälfte war falsch.

Die Auslassung ist inhaltlich richtig: `DefinedTerm` kennt keine Eigenschaft
für eine Zeitspanne, und `temporalCoverage` gehört zu `CreativeWork` — ein
Begriff ist kein Werk. Eine erfundene Zuordnung stünde maschinenlesbar da und
wäre falsch. Die Content-Parity-Prüfung schlägt zu Recht nicht an: Sie
verlangt Builder-Felder ⊆ Faktenblock-Felder, nicht umgekehrt. Ein Graph, der
mehr behauptet als die Seite zeigt, ist der Schaden; eine Seite, die mehr
zeigt, als sich auszeichnen lässt, ist es nicht.

**Was fehlte, war die Begründung.** Sie steht jetzt als Kommentar am
`lexikonBuilder` — samt `herkunftsland`, für das dasselbe gilt. Eine
Auslassung ohne Begründung ist von einer Vergesslichkeit nicht zu
unterscheiden, und die nächste Sitzung hätte wieder danach gesucht.

**Offen geblieben:** die drei Bands-Werte auf `min(1930)`. Vorschlag
`min(1900)` steht in OFFENE-PUNKTE.md.

---

## 2026-09-11 — Bot-Abwehr im Linkcheck: herabgestuft, nicht übersprungen

**Entscheidung des Menschen:** Britannica kommt in eine Hostliste.

**Das Problem:** `britannica.com` antwortet Prüfskripten mit HTTP 403, auch
nach dem GET-Nachfassen. Die Seite ist abrufbar und wurde gelesen; der Link
ist nicht tot, er ist für das Skript nur nicht sichtbar. Damit meldete
`linkcheck.yml` wöchentlich denselben Fehlalarm — und ein Bericht, der immer
dasselbe falsch meldet, erzieht zum Überlesen (Lektion 4). Die Quelle zu
streichen war keine Option: eine gute Quelle wegzuwerfen, weil ein Skript sie
nicht sehen darf, ist der falsche Weg herum.

**Gebaut:** `BOT_ABWEHR` in `scripts/check-links.ts`, eine Liste aus Host und
Begründung. Ein 403 von einem dieser Hosts wird zur **Warnung** mit eigenem
Code `bot-abwehr` — die URL bleibt im Bericht, mit der Begründung aus der
Liste, und unter `--strict` blockiert sie weiterhin. Übersprungen wird
nichts.

**Drei Schranken, weil eine Ausnahmeliste die Stelle ist, an der still Dinge
landen** — alle drei mit Gegenfall im Test belegt:

- *Nur 403.* Ein 404 desselben Hosts bleibt ein Fehler. Die Liste sagt „dieser
  Anbieter sperrt Roboter aus", nicht „diesem Anbieter glauben wir alles".
- *Host mit Wortgrenze.* Getroffen wird der Eintrag selbst und seine
  Subdomains; `notbritannica.com` fällt nicht darunter. Ein schlichtes
  `includes()` hätte den Fall durchgelassen — genau daran ist der Bash-Zweig
  von `guard.mjs` schon einmal gescheitert (Lektion 18).
- *Ohne Begründung keine Wirkung.* Ein Eintrag mit leerem `grund` hebt die
  Prüfung nicht auf. Das war zunächst ein Zufall der Falsy-Prüfung und steht
  jetzt als Regel in `botAbwehrGrund()`.

**`bewerte()` ist jetzt exportiert und getestet.** `check-links.ts` läuft
bewusst nicht in jedem Durchlauf — es ruft das Netz, und ein fremder Server,
der gerade hustet, ist kein Grund, einen Merge zu blockieren. Seine
Bewertungsfunktion ist aber rein und damit prüfbar: `scripts/test-checklinks.ts`
deckt sie vollständig ab, 27 Behauptungen, ohne Netz. Damit fällt eine der
Lücken weg, die der Review unter „Testabdeckung, ehrlich eingeordnet"
genannt hat. Nebenbei nötig: `main()` läuft nur noch beim direkten Aufruf,
sonst hätte der Import im Test einen Netzlauf gestartet.

**DER MUTATIONSBELEG HAT DREI DINGE GEFUNDEN, und zwei davon waren meine.**

1. *Der Test stürzte ab, statt fehlzuschlagen.* Ein `find(...)!` auf die Liste
   warf einen TypeError, sobald der Eintrag fehlte — und ein Lauf, der mit
   einem TypeError endet, hat keine Behauptung fallen lassen, sondern gar
   keine geprüft. Der Mutationsbeleg bekam nichts zu sehen. Behoben mit `?.`
   und einem Ersatzwert.
2. *Eine Behauptung war trivial erfüllbar.* `nachricht.includes(grund)` ist
   für eine leere Begründung immer wahr. Jetzt wird zusätzlich verlangt, dass
   die Begründung überhaupt Inhalt hat (Lektion 17).
3. *Eine meiner Mutationen mutierte nichts.* Sie ersetzte `"Antwortet…"` durch
   `"" + "Antwortet…"` — dieselbe Zeichenkette. Der Lauf blieb grün, und das
   war richtig so.

Dazu kam eine Formalie mit Folgen: Ein Behauptungsname enthielt einen
Gedankenstrich, und genau daran trennt der Mutationsbeleg Name von Detail.
Die Erwartung verglich sich mit einem abgeschnittenen Namen. Behauptungsnamen
tragen deshalb keinen Gedankenstrich mehr.

**Beleg:** 8 Mutationen, 0 offen. `npm run verify` grün.
`npm run links:extern` meldet jetzt **0 tot, 1 auffällig** — mit der
Begründung im Klartext neben der URL.

---

## 2026-09-10 — Drei Regionen über die Schwelle, und eine Korrektur

**Auftrag war:** ein zweites Event je Region, damit jede Region die
Bestandsschwelle von drei freigegebenen Einträgen erreicht.

**Erreicht bei drei von fünf.** Gezählt wird, was auf die Region zeigt:

| Region | vorher | jetzt | neu |
|---|---|---|---|
| Niederösterreich | 2 | 5 | zwei Ausgaben der Boogie-Party, Kammgarnsaal Traiskirchen |
| Berlin | 2 | 4 | Billy Childish / Trainwrecks, Lido |
| Bayern | 2 | 3 | Rock'n'Roll & Boogie Woogie Weekend, Pullman City |
| Niedersachsen | 2 | 2 | — |
| Rhein-Neckar | 2 | 2 | — |

Alle Einträge stehen auf `status: entwurf`; die Zahlen greifen erst mit der
Freigabe.

**Warum zwei Regionen offen blieben.** Für Niedersachsen liefert die einzige
belastbare Spur denselben Termin, der schon im Register steht — das Festival
in Ganderkesee, dessen Datum 2027-08-20 bis 2027-08-22 die Suche bestätigt
hat. Für Rhein-Neckar hat die Suche in Mannheim, Heidelberg und Ludwigshafen
nichts Belegbares in der Zukunft ergeben; die naheliegenden Verzeichnisse
(livegigs.de) antworten automatisierten Abrufen mit HTTP 403. Der Walldorf
Weekender, bislang der einzige Termin der Region, war 2026 ausdrücklich der
letzte. Kein Ersatz gefunden heißt hier: kein Eintrag, nicht ein schwacher.

**FUND: Die Anfangszeit des Record Hop war falsch.** Der Eintrag stand auf
21:00 Uhr. Beim erneuten Abruf am 2026-09-10 nennt die Quelle an zwei
unabhängigen Stellen 19:00 Uhr — das sichtbare Feld „Uhrzeit" und den
Kalenderlink mit `startDate 20260925T170000Z`, also 19:00 MESZ. Dessen
`endDate 20260926T030000Z` ergibt 05:00 MESZ am Folgetag, weshalb `ende`
jetzt eine Uhrzeit trägt statt nur ein Datum.

Ob sich die Seite seit dem 2026-09-04 geändert hat oder die erste Lesung
falsch war, lässt sich von hier aus nicht entscheiden; beide Lesarten stehen
mit ihrem Datum in der Redaktionsnotiz. Bemerkenswert ist, **wie** der Fehler
gefunden wurde: Die Seite wurde nur deshalb erneut geöffnet, weil auf ihr nach
Nachbarterminen gesucht wurde. Ohne diesen Zufall hätte die Prüfkadenz von
30 Tagen ihn erst Anfang Oktober gefunden — nach dem Termin. Das ist ein
Argument dafür, Termine kurz vor ihrem Datum noch einmal anzufassen, und
nicht nur nach Kadenz.

**`genres` nachgetragen, aber nicht überall.** Drei Entscheidungen, und die
mittlere ist die interessante:

- *Rockabilly Convention* → `[rockabilly, boogie-woogie]`. Beide stehen im
  Titel der Veranstaltung bei der Quelle.
- *Boogie-Party am Sonntagnachmittag* → **leer**, obwohl es eine Boogie-Party
  ist. `genres` verweist auf Lexikoneinträge, und `boogie-woogie` bezeichnet
  dort den Klavierstil. Getanzt wird auf solchen Nachmittagen aber gerade
  nicht dieser Stil, sondern Rock'n'Roll, Rockabilly, Jump Blues und Swing —
  das steht so in der Quelle zum Tanz. Ein `genres: [boogie-woogie]` würde
  genau die Verwechslung ins Register schreiben, vor der der Lexikoneintrag
  warnt. Der Eintrag, der letzte Woche geschrieben wurde, hat diese Woche eine
  Falschzuordnung verhindert.
- *Record Hop* → `[rockabilly]`. Die Quelle nennt vier Stilrichtungen, drei
  davon haben keinen Lexikoneintrag. „Jump & Jive" ist bewusst **nicht** auf
  `jump-blues` abgebildet: Jive ist ein Tanz, und die Zusammenziehung im
  Ankündigungstext sagt nicht, dass Jump Blues gemeint ist.

**Der Skill `events-recherche` passt nicht auf dieses Repo.** Er verweist auf
`/Users/…/vintage-rockabilly-guide/MEMORY.md` und auf ein Frontmatter mit
`title`, `datum`, `stadt`, `tags`, `wiederkehrend`. Keines dieser Felder
existiert in `src/content/_schemas.ts`, und das Schema ist `.strict()` — so
erzeugte Dateien würden nicht geparst. Vor allem fehlt ihm die Belegpflicht:
kein `quellen[]`, kein `felder`, kein `status: entwurf`. Er wurde deshalb
nicht ausgeführt; übernommen wurden nur Recherche-Regionen, Duplikatprüfung,
Zukunftsprüfung und Ton. Der Skill gehört angepasst oder auf das alte Projekt
beschränkt — er liegt unter `~/.claude/skills/`, also außerhalb dieses Repos
und außerhalb dessen, was ein Agent hier ändern darf.

**Nebenbefund:** `veranstalterUrl` bei beiden Pullman-City-Terminen auf die
www-Form gesetzt. Die Nicht-www-Form leitet dorthin weiter, und
`links:extern` meldete das als „umgezogen".

**Belege:** `npm run verify` grün, unter `--strict` null Warnungen. Von den
sechs neuen Quell-URLs sind alle erreichbar; `links:extern` meldet weiterhin
nur die bekannte Britannica-403.

---

## 2026-09-09 — Sieben Genres, und warum nicht acht

**Auftrag war:** Genres als nächste Lexikongruppe — Rockabilly, Psychobilly,
Neo-Rockabilly, Western Swing, Jump Blues, Doo Wop, Boogie Woogie, Lindy Hop.
Grund: Der Autolink griff in Eventtexten kein einziges Mal, weil zehn
Modebegriffe dort nicht vorkommen.

**Gebaut sind sieben.** `neo-rockabilly` fehlt, weil keine der geöffneten
Quellen den Begriff definiert. Die englische Wikipedia führt einen Stub, der
ihn auf „ab 1990" datiert und Kings of Leon und The Black Keys nennt; die
deutsche datiert Neo-Rockabilly im Rockabilly-Artikel auf die 1980er und die
Stray Cats; der Artikel zu Restless nennt die Band „pioneers of
neo-rockabilly", ohne zu sagen, was das ist. Zwei einander widersprechende
Datierungen und keine Definition tragen keinen Eintrag — die Unterscheidung
steht stattdessen in der `abgrenzung` von Rockabilly und Psychobilly, und der
Begriff steht als offener Punkt mit der Angabe, was ihm fehlt.

**Der Autolink greift jetzt.** Das war der eigentliche Zweck, und er ist
gemessen statt behauptet:

| Sammlung | `/lexikon/`-Links vorher | nachher |
|---|---|---|
| events | 0 | 4 |
| locations | 0 | 3 |
| regionen | 0 | 4 |

Dazu 12 neue Querverweise innerhalb des Lexikons. Insgesamt 36 gesetzte Links
in 20 Dateien, alle von `npm run autolink` erzeugt und nicht von Hand.

**Widersprüche stehen im Text, nicht in der Auswahl** (Regel 5 der
Lexikonregeln, Lektion 20). Vier der sieben Einträge tragen einen benannten
Quellenkonflikt:

- *Doo Wop:* Die deutsche Wikipedia führt die Verbreitung des Namens auf den
  Discjockey Gus Gossert ab 1969 zurück; die englische nennt einen älteren
  gedruckten Beleg (1961, Chicago Defender) und hält fest, dass die
  Zuschreibung an Gossert bestritten wurde. Gesichert ist beiden nur das
  Gefälle: Die Musik ist rund ein Jahrzehnt älter als ihr Name.
- *Western Swing:* Die englische Wikipedia führt ihn schlicht als
  Country-Untergenre, die deutsche nennt genau diese Einordnung umstritten
  und zitiert Musiker, die ihre Musik als jazznäher beschrieben. Beides steht
  da, samt der praktischen Folge für ein Register.
- *Rockabilly:* Erstbeleg (Billboard, 23. Juni 1956) und Durchsetzung des
  Wortes (Revival der frühen 1980er) fallen 25 Jahre auseinander. Kein
  Widerspruch, aber zwei verschiedene Fragen — im Text getrennt.
- *Psychobilly:* Vorgeschichte in New York gegen Gründung in London; beide
  Quellen einig nur bei The Meteors, 1980.

**Zwei Einordnungen, die nicht selbstverständlich sind.** `lindy-hop` bekommt
`kategorie: tanz` statt `genre` — er ist der einzige der Gruppe, der keine
Musikrichtung bezeichnet. Und `boogie-woogie` ist der Klavierstil, obwohl das
Wort in der deutschsprachigen Szene fast immer den Paartanz meint; die
Verwechslung ist so verbreitet, dass sie den ganzen Abgrenzungsabschnitt
trägt, samt der entscheidenden Auskunft: Zum Boogie-Woogie-Tanz läuft
Rock'n'Roll, Rockabilly, Jump Blues und Swing, gerade nicht die gleichnamige
Musik. Ob der Tanz einen eigenen Eintrag bekommt, entscheidet ein Mensch.

**Ein Prüfergebnis, das kein Fehler ist.** `npm run links:extern` meldet
`britannica.com/art/boogie-woogie` als tot (HTTP 403, auch nach dem
GET-Nachfassen), obwohl die Seite abrufbar ist und gelesen wurde — Britannica
weist automatisierte Abrufe ab. Der Beleg bleibt stehen: Eine gute Quelle zu
streichen, weil ein Prüfskript sie nicht sehen darf, ist der falsche Weg
herum. Damit meldet der wöchentliche Linkcheck aber dauerhaft einen
Fehlalarm, und Fehlalarme sind der Anfang vom Überlesen. Der Vorschlag — eine
benannte Hostliste in `check-links.ts`, deren 403 als „auffällig" statt „tot"
gilt, herabgestuft und nicht übersprungen — steht in OFFENE-PUNKTE.md und ist
nicht gebaut, weil er eine Regeländerung wäre.

**Alle sieben stehen auf `status: entwurf`.** Die Freigabe ist eine
menschliche Entscheidung; `npm run stale` führt sie in der Warteschlange.

---

## 2026-09-09 — Regionsschwelle: über den Bestand, nicht über den Text

**Auftrag war:** Dünne Regionsseiten aus dem Index nehmen. Schwelle: drei
Einträge ODER eigener Fließtext über der Mindestlänge, der mehr sagt als die
Kurzbeschreibung. Sonst `noindex, follow`, raus aus der Sitemap, erreichbar
und verlinkt bleiben, und als Posten in den Stale-Report.

**Gebaut ist der erste Arm. Der zweite ist verworfen**, weil er in diesem Repo
nicht falsch werden kann:

- `mindestlaenge` in `validate-content.ts` verlangt für Regionen **250 Wörter**
  Fließtext — als *Fehler*, für jeden Status, in jeder Sammlung. Belegt: eine
  auf 18 Wörter gekürzte `bayern.md` fällt mit genau dieser Meldung durch.
- `kapsel-vorhanden` deckelt die Antwortkapsel bei **90 Wörtern** (Warnung,
  unter `--strict` also in CI und bei der Freigabe blockierend).
- Daraus folgt zwingend: Jede Region, die die Prüfkette besteht, trägt
  **mindestens 160 Wörter** über die Kapsel hinaus. Der verlangte Textarm
  fragt nach 150. Er ist wahr für jede Region, die es überhaupt geben kann.

Ein ODER mit einem immer wahren Arm ergibt nie ein `noindex`. Die Regel wäre
eine Prüfung, die ihren Gegenstand nie zu sehen bekommt — die Bauart aus
Lektion 19, an der dieses Projekt schon zweimal hängengeblieben ist.

**Eine höhere Textgrenze hilft nicht.** Gemessen statt vermutet: Die fünf
Regionen tragen 239 bis 259 eigene Wörter, das Golden Example 229. Zwischen dem
erzwungenen Mindestmaß und der gelebten Praxis liegt kein Zahlenwert, der
Dünnes von Gutem trennt — jede Textgrenze, die anschlägt, verurteilt das Golden
Example mit.

**Der Bestandsarm allein war deshalb eine Entscheidung, keine Ableitung**, und
sie liegt beim Menschen. Sie ist so gefallen: Ja, mit dem Bestandsarm gehen
heute alle fünf Regionen auf `noindex` — und das kostet nichts, weil das
Register ohnehin vollständig auf `noindex` steht (`PUBLIC_INDEXIERBAR=false`)
und der dünne Bestand die Recherchelage abbildet, nicht ein Urteil über den
Text. Was die Regionsseiten heute sind, ist der Umweg zu je einem Termin. Die
kanonische Adresse der Sache ist die Eventseite.

**Gebaut:**

- `src/lib/regionen.ts` — `regionsBestand()`, `regionsIndexierbarkeit()`,
  `istDuenneRegion()`. Drei freigegebene Einträge, die auf die Region zeigen.
- `[typ]/[slug].astro` rechnet, `EntitaetsLayout.astro` bekommt `noindex` und
  `indexGrund` als Requisiten — dieselben zwei, die `ListenLayout.astro` schon
  von den Facetten kennt. Das Layout bekommt das Urteil, nicht die Rechnung.
- `sitemapFuerCollection()` lässt dünne Regionen fallen. Eine Sitemap, die eine
  noindex-Seite nennt, sendet zwei widersprüchliche Signale.
- `stale-report.ts` führt „Regionen unter der Indexschwelle" als Posten — die
  Gegenbuchung, ohne die das noindex eine stille Entscheidung wäre, die niemand
  zurücknimmt. Nur für freigegebene Regionen: Ein Entwurf steht ohnehin in der
  Warteschlange.

**Zwei Entscheidungen in der Zählung**, beide mit Gegenfall in
`scripts/test-regionen.ts` belegt:

- *Entwürfe zählen nicht mit.* Die Schwelle ist eine Aussage über den Index,
  und in den Index kommt nur, was freigegeben ist. Zählte die Vorschau anders,
  gäbe dieselbe Region je nach Umgebung zwei Antworten (Lektion 9). Der Grund
  nennt die Entwürfe trotzdem — „0 von 3 (2 als Entwurf vorhanden)" ist die
  Auskunft, die ein Redakteur braucht.
- *Die Region zählt sich nicht selbst.* Sie ist nicht *in* der Region, sie
  *ist* die Region; ein Selbstzähler wäre nur ein verschobener Schwellenwert.

**Die verworfene Alternative steht als Bedingung, nicht nur als Kommentar.**
`test-regionen.ts` liest `minWorte.regionen` und den Kapseldeckel aus ihren
Quellen und prüft, dass die Differenz über 150 bleibt. Sinkt eines von beiden,
wird der Lauf rot und sagt, dass ein Textarm wieder baubar und die Entscheidung
neu zu treffen ist. Ohne das verfiele die Begründung still, sobald jemand eine
der beiden Zahlen ändert.

**Beleg:** 13 Mutationen, 0 offen. Mutiert wurde die Regel, nicht der Inhalt —
die Daten stecken als Fixtures im Test, in beide Richtungen. Dazu zwei Belege
anderer Art: `stale-report.ts` druckt das Urteil tatsächlich (Befund M10), und
am gebauten Ergebnis trägt `dist/regionen/bayern/index.html` `noindex, follow`,
während Location und Event desselben Builds es nicht tun. Damit der Beitrag der
Schwelle sichtbar wird, nimmt dieser Beleg kurzzeitig die Entwurfsregel aus dem
Layout — sonst wäre jede Region ohnehin schon als Entwurf noindex, und das
Ergebnis hätte zwei mögliche Ursachen (Lektion 17).

---

## 2026-09-09 — Drei Dateien, drei Zuständigkeiten

**Fund beim Zusammenziehen der beiden Sitzungen.** `ENTSCHEIDUNGEN.md` hält
fest, was entschieden wurde, `docs/lektionen.md` was gelernt wurde — aber
was noch **offen** ist, stand nirgends im Repo. Es lebte im Strategie-Chat
und war damit an eine Sitzung gebunden.

**Entscheidung:** `OFFENE-PUNKTE.md` im Wurzelverzeichnis, mit drei Gruppen
(Als Nächstes, Vor dem Go-Live, Später mit Bedingung). Erledigtes wird
gestrichen, nicht abgehakt — wo etwas gelandet ist, steht in
`ENTSCHEIDUNGEN.md`.

Die Abgrenzung zu `REVIEW.md`: Dort stehen **Befunde aus dem Audit**, auch
die bewusst vertagten (Abschnitt 4). Hier steht **vorwärts gerichtete
Arbeit**. `OFFENE-PUNKTE.md` verweist einmal auf Abschnitt 4, damit es
nicht zwei Orte für „nicht jetzt" gibt.

**Zweitens: die Arbeitsweise steht jetzt im Repo.** Der Abschnitt „Wie hier
gearbeitet wird" in `CLAUDE.md` hält fest, was sich über die Sitzungen
eingespielt hat — unter anderem, dass ein Auftrag mit falscher Annahme
zurückkommen soll statt umgesetzt zu werden. Das ist mehrfach vorgekommen
und war jedes Mal der bessere Ausgang.

**Drittens: eine Prüfung für die Wegweiser.** Verlangt war „OFFENE-PUNKTE.md
muss existieren und darf nicht leer sein". Gebaut wurde das
Verallgemeinerte: **jedes** Dokument, das die Orientierungsliste in
`CLAUDE.md` nennt, muss existieren und Inhalt haben. Grund: Eine Prüfung
nur für die neue Datei hätte den Fall nicht gefangen, der tatsächlich
eingetreten ist — den Umzug von `lektionen.md` nach `docs/`, bei dem fünf
Verweise von Hand nachgezogen werden mussten.

Die Prüfung trägt ihr Lebenszeichen mit (Lektion 19): Sie verlangt, dass
die Liste **gefunden** wurde und die vier tragenden Dokumente nennt. Ohne
das wäre „alle Ziele existieren" auch dann wahr, wenn gar keine gefunden
wurden.

**Was nicht geprüft wird:** ob ein Punkt in `OFFENE-PUNKTE.md` noch aktuell
ist. Das weiß kein Skript, und eine Prüfung, die es vorgäbe, wäre schlimmer
als keine.

**Zwei Korrekturen an der Vorlage aus dem Strategie-Chat**, beide gegen den
Stand geprüft statt übernommen: Die Kapsel der Übersichtsseiten sitzt nicht
im Listenbauteil, sondern in `src/pages/[typ]/index.astro` — die Überschrift
„Einträge" dagegen in `ListenLayout.astro`, es sind zwei Stellen. Und der
`aeraVon`-Punkt bekommt die Bands-Schwelle `min(1930)` dazu, die aus
derselben Anfangszeit stammt.

**Nicht übernommen:** die Zahl „sechzehn Veranstalter-Websites" in der
Beschreibung der Erhebung. Sie ließ sich nicht belegen — die Erhebung ging
ausdrücklich nicht ins Register und existiert nur im Chatverlauf. Die
Aussage trägt auch ohne Zahl. Was dauerhaft im Repo steht, soll belegbar
sein.

---

## 2026-09-09 — Eine dritte Befundebene: Hinweis

**Fund aus dem Betrieb.** Neun von zehn Lexikoneinträgen ließen sich
freigeben, der zehnte hing an „Keine aliases" — ausgerechnet `petticoat`,
aus dem zwei unbelegbare Aliases **entfernt** worden waren. Die sorgfältige
Entscheidung wurde von der Regel bestraft.

**Die Diagnose war eine andere als die Vermutung.** Die Regel war bereits
eine Warnung. Blockierend wurde sie durch `--strict`, das `freigeben.ts` und
die CI benutzen. „Auf Warnung zurückstufen" wäre also ein Nulleingriff
gewesen — der Hebel liegt bei der Eskalation, nicht bei der Ebene.

**Entscheidung:** eine dritte Ebene. `fehler` blockiert immer, `warnung`
blockiert unter `--strict`, `hinweis` blockiert nie und ist trotzdem immer
sichtbar. Der Unterschied zwischen Warnung und Hinweis ist nicht die
Dringlichkeit, sondern die **Erfüllbarkeit**: Eine Warnung benennt etwas,
das ein sorgfältiger Eintrag beheben kann. Ein Hinweis benennt etwas, das er
womöglich nur beheben kann, indem er etwas erfindet.

**Verworfen:** den `aliases`-Befund ganz entfernen. Er ist eine nützliche
Auskunft — bei den meisten Begriffen gibt es eine Szene-Kurzform, und ihr
Fehlen ist ein Signal. Nur eben keines, das eine Freigabe aufhalten darf.

**Zwei Regeln fallen in diese Klasse**, nicht eine. Neben `aliases` auch
`artikel-faq` („Nur N FAQ-Einträge, Ziel M. Echte Fragen aus der
Prompt-Map nehmen."): Wenn es keine vier echten Fragen gibt, ist die
einzige Art, das Ziel zu erreichen, sich welche auszudenken — die Meldung
verlangt in derselben Zeile beides.

**Geprüft und behalten:** `autor` bleibt ein Fehler (einen Autor hat jeder
Eintrag, den ein Mensch freigibt). `interne-links` bleibt eine Warnung — sie
senkt ihr Ziel bereits, solange das Register klein ist, und ein Eintrag, der
sie nicht erfüllen kann, ist tatsächlich isoliert. `event-zeitraum` verlangt
bei „abgesagt" einen `durchfuehrungHinweis`; auch wenn die Quelle keinen
Grund nennt, lässt sich das wahrheitsgemäß hinschreiben. Alle übrigen
Warnungen sind durch Umschreiben erfüllbar.

**Folge:** `freigeben.ts` liest Hinweise weiter aus und zeigt sie im
Bericht, ohne sie als Ablehnungsgrund zu werten. Die Bilanzzeile des
Validators zählt Hinweise getrennt und sagt unter `--strict` ausdrücklich,
dass sie dort nicht blockieren.

---

## 2026-09-09 — Beendete Reihen sind kein offener Posten

**Fund:** Der Stale-Report führte den Walldorf Weekender seit 110 Tagen als
„Reihe ohne Folgetermin". Der Eintrag trägt `letzteAusgabe: true` — die
Reihe ist ausdrücklich beendet.

**Entscheidung:** Trägt die jüngste Ausgabe einer Reihe `letzteAusgabe`,
entfällt der Posten. Maßgeblich ist die jüngste Ausgabe: Die Reihe ist
beendet, wenn ihr letzter Termin sich als letzter ausweist.

**Warum das mehr ist als Kosmetik.** Ein Bericht ist so viel wert wie das
Vertrauen, dass jede Zeile darin eine Aufgabe ist. Führt er dauerhaft
Posten, die niemand erledigen kann, gewöhnt man sich daran, ihn zu
überlesen — und übersieht die Zeile, die zählt. Das ist Lektion 4 in der
Berichtsform: Ein voller Bericht muss etwas bedeuten.

**Belegt** durch `scripts/test-stale.ts` (neu): zwei Läufe über dieselbe
Datei, einzig `letzteAusgabe` wechselt. Das Paar ist das Lebenszeichen —
„nicht gemeldet" allein wäre auch wahr, wenn der Bericht die Reihe nie
gesehen hätte. Eine Zählung „Bericht nicht leer" taugt hier nicht: Bei
beendeter Reihe ist er tatsächlich leer, und genau das ist der gewünschte
Zustand.

---

## 2026-09-09 — Petticoat bleibt ohne aliases, jetzt mit Begründung

**Recherchiert**, nicht angenommen. Der Duden führt als Synonyme
„Unterrock, Halbrock, Unterkleid; (veraltet) zweites Kleid". Alle
gebräuchlichen davon bezeichnen das Kleidungsstück, von dem dieser Eintrag
den Petticoat ausdrücklich abgrenzt — „Halbrock" und „Unterkleid" stehen
bereits als `aliases` am Eintrag `unterrock`. Sie zu übernehmen hieße, die
eigene Abgrenzung im Namensindex wieder einzureißen und den Autolink
zweideutig zu machen.

„Halbunterrock", das die `abgrenzung` als Wörterbuchform nennt, ist im DWDS
kein Stichwort („nicht in unseren gegenwartssprachlichen lexikalischen
Quellen vorhanden") und steht dort nur im Fließtext der Etymologie. Die
deutsche Wikipedia nennt für den Petticoat selbst keine alternative
Bezeichnung. „Tüllrock" ist ein DWDS-Stichwort, meint aber Oberbekleidung.

**Ergebnis:** kein belegbarer Zweitname. Das Feld bleibt leer, die
Quellenlage steht in der Redaktionsnotiz. Nach der Ebenenkorrektur oben
geht der Eintrag trotzdem durch — im Trockenlauf bestätigt.

---

## 2026-09-07 — Drei Anzeigeentscheidungen aus der ersten Durchsicht

**1. Sprachzeilen, die nur den Namen wiederholen, verschwinden.** Bei einem
deutschen Begriff steht in `bezeichnungDe` derselbe Wert wie in `name` —
„Deutsch: Bleistiftrock" unter der Überschrift „Bleistiftrock" ist eine Zeile
ohne Information. Verglichen wird normalisiert (Groß-/Kleinschreibung,
Randleerraum), sonst nicht: „Pencil skirt" und „Pencil Skirt" sind dasselbe
Wort, „Reifrock" und „Reifröcke" sind es nicht.

**Und warum das die Content Parity nicht lockert.** Die Prüfung vergleicht
statische Listen — `verwendeteFelder` gegen `faktenblockFelder` —, eine
bedingte Zeile bricht sie formal also gar nicht. Die *Zusage* dahinter aber
schon: Ein `alternateName` im Graphen, der auf der Seite unterdrückt wird,
ist genau die Lücke, die sie meint. Statt die Prüfung anzufassen, trifft
jetzt **derselbe Vergleich beide Seiten**: `istNurDerName` in
`src/lib/jsonld/shared.ts`, benutzt vom Faktenblock und vom
Lexikon-Builder. Der Builder filterte vorher zeichengenau (`x !== d.name`)
und hätte bei abweichender Schreibweise auseinanderlaufen können.

**2. Die Verwandt-Liste am Fuß zeigt nur Namen.** Auf Übersichts- und
Facettenseiten sind Kurzbeschreibungen der Inhalt — dort entscheidet jemand
anhand des Satzes, ob er klickt. Im Fußbereich einer Entitätsseite stehen
sie neben einem Text, der dieselben Begriffe oft schon erklärt hat, und aus
zwölf Einträgen wird eine zweite Seite. Umgesetzt als Parameter `knapp` an
`EintragsListe.astro`, nicht als zweite Komponente: Die Entwurfsmarke bleibt
damit an genau einer Stelle, und kein Entwurf kann irgendwo unmarkiert
auftauchen.

**3. Der Quellenblock ist bei aktiven Entwürfen aufgeklappt.** Wer freigibt,
prüft genau diese Liste — und tut es nicht, wenn er dafür klicken muss. In
der Produktion bleibt er zu; dort ist er Beleg und nicht Arbeitsmaterial.

**Belegt am echten HTML, nicht an Einheitsprüfungen.**
`scripts/test-anzeige.ts` baut die Site zweimal wirklich und liest das
erzeugte Dokument. Für den Produktionsbuild wird ein Eintrag kurzzeitig
freigegeben und zeichengenau zurückgebaut — ohne das enthält er keine
einzige Entitätsseite, weil im Register (Stand heute) kein freigegebener
Eintrag steht, und eine Gegenprobe an einer Seite, die es nicht gibt, wäre
keine.

**Fund beim Bauen, gefunden vom eigenen Hook:** Die in der vorigen Runde
eingeführte Meldung „Aufruf ging ins Leere" hat auf
`_golden-example.md` angeschlagen. Die Datei liegt im Register und wird
trotzdem übersprungen — Golden Examples sind Vorlagen, keine Einträge. Die
Meldung verwechselte „außerhalb des Registers" mit „nicht geladen". Behoben
über `liegtImRegister()` in `_laden.ts`, mit Prüfung in beide Richtungen.

---

## 2026-09-07 — Quellenkritik bekommt keine Validator-Regel

**Entscheidung:** Die Erwartung, Widersprüche zwischen Quellen im Text zu
benennen statt sie durch Auswahl zu glätten, steht in `docs/lektionen.md`
(Lektion 20), in `CLAUDE.md` als fünfte Lexikonregel und im
Lexikon-Golden-Example. **Nicht** im Validator.

**Warum nicht.** Ob ein Widerspruch besteht und ob er benannt wurde, steht
in Sätzen, nicht in Feldern. Jede messbare Näherung — etwa „enthält der Text
das Wort 'unbestätigt'" — erzwänge eine Formulierung und keine Haltung, und
sie wäre schlimmer als keine Prüfung: Sie ließe glauben, die Frage sei
abgeräumt. Das ist Lektion 19 aus der anderen Richtung — eine Prüfung, die
ihren Gegenstand grundsätzlich nicht erreichen kann.

**Vorbild ist der Bleistiftrock-Eintrag:** Die deutsche Wikipedia führt die
Form auf Dior (1948) zurück, die übrigen geöffneten Quellen bestätigen das
nicht, und der Eintrag schreibt genau das hin — samt dem, was stattdessen
trägt (DWDS-Erstbeleg 1950). `herkunftsland` bleibt leer, weil das einzige
Argument dafür die unbestätigte Zuschreibung wäre.

---

## 2026-09-05 — Die Freigabe prüft den Zustand nach der Änderung

**Entscheidung:** `scripts/freigeben.ts` schreibt `status` und `geprueftAm`
zuerst, prüft dann, und rollt bei Befunden zurück. Es prüft nicht den
Entwurf und gibt ihn bei sauberem Ergebnis frei.

**Warum.** Die Regel `veroeffentlichungsreife` in `validate-content.ts`
beginnt mit `if (status !== "veroeffentlicht") return []`. Für einen Entwurf
meldet sie nichts — nicht „in Ordnung", sondern überhaupt nichts. Ein
Eintrag ohne `autor` hätte jede Vorabprüfung bestanden und wäre nach der
Freigabe fehlerhaft gewesen. Beim ersten Trockenlauf gegen den echten
Bestand hat die Regel prompt zugeschlagen: `petticoat` wurde abgelehnt, weil
`aliases` fehlt. Das ist kein Sonderfall, sondern die Regelklasse
„gilt erst ab Veröffentlichung", und sie ist genau die, die eine Freigabe
prüfen muss.

**Verworfen:** den Entwurf prüfen und danach schreiben. Bequemer, kein
Zurückrollen nötig — und blind für die einzige Regelklasse, die hier zählt.

**Zweite Entscheidung:** Ein bereits freigegebener Eintrag wird
übersprungen, nicht erneut angefasst. Sonst wanderte `geprueftAm` bei jedem
Lauf weiter, und die Prüfkadenz wäre eine Zahl, die sich selbst erneuert.

**Fund beim Mutationsbeleg.** Die Prüfung „zweiter Lauf lässt die Datei
zeichengenau unverändert" hielt zunächst auch ohne die Sprungmarke: Der
Eintrag war im selben Lauf freigegeben worden, `geprueftAm` stand also schon
auf heute, und ein erneutes Schreiben desselben Werts ändert nichts. Zwei
Ursachen, ein Ergebnis (Lektion 17/19). Die Fixture trägt jetzt ein altes
`geprueftAm` und einen bereits freigegebenen Status, damit die beiden Fälle
auseinandergehen.

**Offen gelassen, weil es eine Entscheidung ist und keine Nebensache:**
`check-freigabe.ts` (Befund M8) meldet jeden Statuswechsel, den niemand beim
Aufruf bestätigt hat — und wird deshalb in der CI **jedes** Freigabe-Pull-
Requests anschlagen. Die bequeme Abhilfe wäre, die Bestätigung als Trailer
in die Commit-Nachricht zu schreiben und `check-freigabe.ts` sie dort lesen
zu lassen. Das würde die dritte Schicht aus M8 schwächen: Ihre Stärke ist
gerade, dass die Bestätigung eine Handlung an der Kommandozeile ist und
nicht im Repository steht, wo sie jeder schreiben kann, der schreiben kann.
`freigeben.ts` gibt deshalb die passende `--freigabe`-Zeile aus, und
`BETRIEB.md` erklärt den roten Haken. Ob er auf Dauer bleibt, entscheidet
ein Mensch.

---

## 2026-09-04 — Der PostToolUse-Hook hat seit seiner Entstehung nichts geprüft

**Fund:** Zwei Prüfungen in `scripts/test-hooks.ts` waren auf dem Rechner des
Menschen rot, in der Cloud-Sitzung grün — und zwar nachweislich schon vor den
Änderungen, mit denen sie auffielen. Die Meldung lautete „Nichts zu prüfen"
bei Exitcode 0.

**Ursache**, reproduziert statt vermutet: `scripts/_laden.ts` verwarf jede
übergebene Datei, deren Pfad relativ zur Wurzel mit `..` beginnt. Die Wurzel
kommt aus `process.cwd()`, und das liefert Node **symlinkaufgelöst**; ein von
außen übergebener Dateipfad nicht. Der Hooktest baut sein Prüfprojekt unter
`os.tmpdir()` — auf macOS `/var/folders/…`, wobei `/var` auf `/private/var`
zeigt. Damit zeigten Ereignispfad und Wurzel auf dasselbe Verzeichnis in zwei
Schreibweisen, `path.relative()` ergab `..`, und die Datei fiel lautlos aus
der Liste. Auf Linux gibt es diesen Symlink nicht, deshalb lief dieselbe
Prüfung dort grün.

**Nicht die naheliegende Ursache.** Der Verdacht lag auf einem nicht
gesetzten Arbeitsverzeichnis im Test. Der Test setzt beides korrekt, `cwd`
und `CLAUDE_PROJECT_DIR`. Der Bruch lag eine Ebene tiefer, zwischen der
*Schreibweise* des Pfads und der *aufgelösten* Wurzel.

**Entscheidung:** Der Loader löst beide Seiten des Vergleichs auf. Das ist
kein reines Testproblem — wer sein Repo über einen Symlink erreicht, bekam
denselben stillen Durchlauf.

**Zweite Entscheidung, wichtiger als die erste:** „Nichts zu prüfen" bekommt
zwei getrennte Ausgänge. Ein leeres Register ist in Ordnung. Ein
`--changed`-Aufruf, dessen Dateien existieren und sämtlich außerhalb des
Registers liegen, ist ein Aufruf, der ins Leere ging — Exitcode 2, mit
Nennung der Pfade. Ohne diese Trennung hätte die Reparatur des Loaders den
nächsten Fall derselben Art wieder verschwiegen.

**Folge:** Lektion 19 — die gefährlichste Prüfung ist die, die nie etwas
gesehen hat, mit den drei Erkennungsfragen. Vierte Kernregel in `CLAUDE.md`
um das positive Lebenszeichen erweitert. Regressionstest in
`scripts/test-hooks.ts`: Der Hook fährt einmal über einen selbst gebauten
Symlink, und verlangt wird nicht der Exitcode, sondern dass der konkrete
Befund in der Begründung steht.

**Fund beim Mutationsbeleg:** Der Exitcode taugt hier nicht als Nachweis.
Seit der Validator den verfehlten Aufruf selbst mit 2 beendet, blockiert der
Hook auch dann, wenn er die Datei nie gesehen hat — zwei Ursachen, ein
Ergebnis (Lektion 17). Die Zusicherung, die tatsächlich misst, ist die auf
den Inhalt der Begründung. Die erste Fassung des Belegs erwartete beide und
war damit falsch.

---

## 2026-09-04 — Die Lektionen ziehen aus `.claude/` nach `docs/`

**Fund:** Die Lektionensammlung lag in `.claude/rules/lektionen.md` und war
damit für Agenten gesperrt. Dreimal in einer Sitzung hat sich gezeigt, was
das heißt: Zwei Lektionen mussten als fertiger Text im Pull Request
übergeben werden, weil die Instanz, die sie aus ihren eigenen Fehlern
schreibt, sie nicht selbst ablegen konnte. Eine Sammlung von
Erfahrungssätzen, die nur ein Mensch fortschreiben kann, wächst so schnell
wie seine Zeit — nicht so schnell wie die Fehler.

**Entscheidung:** `.claude/rules/lektionen.md` wird zu `docs/lektionen.md`.
Das Verzeichnis `.claude/rules/` entfällt, es enthielt sonst nichts.

**Warum die Grenze dort liegt.** `.claude/` und `.github/` enthalten die
**Mechanik** der Absicherung: Hooks, Berechtigungen, Agentendefinitionen,
CI-Schritte. Was sich selbst absichert, darf sich nicht selbst ändern —
sonst ist die Sperre eine Bitte. **Text über** diese Mechanik ist etwas
anderes: Er beschreibt sie, führt sie nicht aus, und kann gepflegt werden,
ohne die Absicherung anzurühren. Er gehört nach `docs/`.

**Verworfen:** eine Ausnahme in `permissions.deny` für diese eine Datei.
Sie hätte die Sperre von einer Bedingung zu einer Liste gemacht, die man
pflegen muss, und die nächste Datei hätte dieselbe Diskussion ausgelöst.
Die Grenze zwischen Mechanik und Beschreibung ist die haltbarere Trennung
als eine Ausnahmeliste.

**Folge:** Lektion 18 bekommt den zweiten Teil — wer eine Datei in einen
gesperrten Bereich legt, sperrt sie für alle künftige Pflege mit. Vor dem
Ablegen ist deshalb zu fragen: Mechanik oder Text über Mechanik?
`CLAUDE.md` nennt jetzt den Grund für die Sperre, nicht nur die Sperre.
Zwei Prüfungen in `scripts/test-hooks.ts` halten den Zustand fest, statt
ihn der Erinnerung zu überlassen (Lektion 6).

**Nicht gebaut:** eine allgemeine Prüfung „jeder Pfad in Backticks
existiert". Der Prototyp meldete 60 von 108 Pfadangaben als tot — fast alle
zu Recht ungenannt, weil die Dokumentation bloße Dateinamen (`facetten.ts`)
und URL-Pfade (`/rss.xml`) in derselben Auszeichnung führt. Eine brauchbare
Fassung bräuchte Basisnamen-Auflösung und eine Ausnahmeliste für URLs; das
ist ein eigenes Vorhaben und nicht die Nebenwirkung eines Umzugs.

---

## 2026-09-04 — Der Eintritt hat drei Zustände, nicht zwei

**Fund:** Bei der Erprobung an fünf Events konnten zwei nicht eingetragen
werden. Weder der Record Hop in Berlin noch der Tanzabend auf der Burg
Perchtoldsdorf nennen einen Preis — und das Schema kannte nur
`eintrittFrei: true` oder eine bezifferte Preisliste. Der tatsächliche
Zustand, „der Veranstalter veröffentlicht keinen Preis", war nicht
ausdrückbar, und unter `--strict` wurde er zum Merge-Blocker.

**Entscheidung:** `eintrittFrei: boolean` wird ersetzt durch
`eintritt: "frei" | "beziffert" | "unveroeffentlicht"`, ohne Standardwert.

**Warum ein Enum und nicht ein zweites Boolean.** Ein Boolean trägt zwei
Zustände; die Sache hat drei. Ein zusätzliches `preisUnbekannt: boolean`
hätte vier Kombinationen erzeugt, von denen eine — frei **und**
unveröffentlicht — nichts bedeutet und die ein Validator hätte verbieten
müssen. Eine Darstellung, die Unsinn zulässt und ihn nachträglich
ausschließt, ist dieselbe Fehlerklasse wie `felder: ["alle"]`: Sie
verlagert die Bedeutung aus dem Datentyp in eine Regel, die man vergessen
kann.

**Warum ohne Standardwert.** Der Preis ist die meistgestellte Frage zu
einem Termin. Ein Standardwert würde sie unbeantwortet durchrutschen
lassen, und ein Standard von `unveroeffentlicht` wäre genau die bequeme
Ausrede, die es zu vermeiden gilt. Wer ein Event anlegt, entscheidet
bewusst.

**Der dritte Zustand braucht einen Beleg.** `unveroeffentlicht` ist eine
Aussage über die Quelle, nicht über die eigene Mühe. Deshalb verlangt
`event-preise` einen `quellen[]`-Eintrag, dessen `felder` `eintritt` oder
`preise` deckt — das heißt: „Diese Seite habe ich auf die Preisfrage hin
gelesen." Aussagen über Abwesenheit sind die am schwersten nachprüfbaren
überhaupt; ohne diese Bedingung wäre der Wert wertlos.

Die Ebene folgt der Hausregel: Warnung im Entwurf, Fehler bei
`status: veroeffentlicht`. In der CI ist beides blockierend, weil
`--strict` Warnungen zu Fehlern macht.

**Im JSON-LD entsteht kein `offers`-Knoten.** Ein Offer ohne Preis
behauptet ein Angebot, über das nichts bekannt ist, und ist damit
irreführender als gar keines. `isAccessibleForFree` steht auf `true` bei
frei, auf `false` bei beziffert und fehlt bei `unveroeffentlicht` — schema.org
kennt keinen Wert für „unbekannt", und ein `false` wäre dort eine
Behauptung. `check-jsonld` warnt deshalb nicht mehr über fehlende
Preisangaben, sondern meldet nur noch den Widerspruch: `false` ohne
`offers`.

**Im Faktenblock steht „Preis nicht veröffentlicht".** Das ist eine
Auskunft für den Leser, keine Leerstelle — und der Unterschied zwischen
„wir wissen es nicht" und „der Veranstalter sagt es nicht" ist genau der,
den ein Register liefern kann.

**Fund beim Mutationsbeleg: eine Fixture hielt aus dem falschen Grund.**
Die Prüfung „dritter Zustand: kein Offer" lief mit einem Termin ohne
Preisangaben. Sie blieb deshalb auch dann grün, als die Abfrage auf
`eintritt` im Builder ganz entfernt wurde — `preise: []` ergibt eine leere
Offer-Liste, die ohnehin herausfällt. Beide Ursachen führen zum selben
Ergebnis, also belegt das Ergebnis keine von beiden. Trennen lassen sie
sich erst durch den widersprüchlichen Fall: Preise **an** einem Termin,
der keinen Preis veröffentlicht. Der Validator verbietet diese Kombination
— aber der Astro-Build prüft nur das Zod-Schema, nicht die Regeln, und die
Verteidigung im Builder verlässt sich deshalb nicht auf den Validator.
Dieselbe Fehlerklasse wie die Sortierprüfung aus M9, die unter Mutation
zufällig hielt: Eine Prüfung, deren beide möglichen Ursachen dasselbe
Ergebnis liefern, prüft nichts.

**Nebenbefund, nicht behoben:** Der Bash-Zweig von `guard.mjs` prüft auf
das Wort `veroeffentlicht` und schlägt deshalb auf dem neuen Wert
`unveroeffentlicht` an — jeder Shell-Schreibzugriff auf eine Eventdatei mit
diesem Wert wird als Statusänderung abgelehnt. Ein Fehlalarm, der bleibt,
bis jemand das Muster auf `status:\s*veroeffentlicht` oder eine
Wortgrenze verengt. `.claude/` ist für Agenten gesperrt (Lektion 16).

---

## 2026-09-04 — `preise` bleibt flach

**Fund:** Das Rock'n'Roll Festival Ganderkesee staffelt seine acht Preise
über zwei Achsen — Gültigkeitstag (3 Tage, Freitag, Samstag, Sonntag) mal
Kaufweg (Online, Tageskasse). Das Schema kennt je Preis nur
`bezeichnung`, `betrag`, `waehrung`, `gueltigBis` und `hinweis`. Beide
Achsen mussten in die `bezeichnung` gefaltet werden: „Tageskarte Samstag,
Online".

**Entscheidung: Das wird nicht ausgebaut.**

Ein zweidimensionales Preismodell wäre sauberer. Aber achtwertige Staffeln
sind in dieser Szene die Ausnahme — von fünf erprobten Events hatte eines
sie, drei hatten null bis drei Preise, eines gar keinen. Der Preis eines
Ausbaus wäre, dass jeder einfache Fall — ein Ticket, ein Preis — dieselbe
Struktur mitschleppt.

**Was das für die Schnittstelle heißt, und zwar ausdrücklich:** Wer die
Staffel im JSON-Feed maschinell auswerten will, kommt hier nicht weiter
und muss die Veranstalterseite lesen. Die `bezeichnung` ist Text für
Menschen, kein Schlüssel. Das ist eine bewusste Grenze der offenen
Schnittstelle, kein Versehen — und sie steht als Kommentar an `preise` im
Datenvertrag, damit sie beim Lesen des Schemas auffällt und nicht erst
beim Auswerten des Feeds.

---

## 2026-09-04 — Der Aktualitätsbeleg bekommt noch kein Feld

**Fund:** Die Erprobung an fünf Events hat gezeigt, dass sich die Frage
„gilt diese Angabe der kommenden Ausgabe?" beantworten lässt — zweimal hat
sie einen Fehler verhindert. Aber die tragfähigen Belege waren durchweg
**Nebenprodukte der Technik**, nicht Aussagen des Veranstalters:

| Event | Woran der Beleg hing |
| --- | --- |
| Record Hop Berlin | Uploadpfad `/2026/08/`, Datum im Dateinamen, hochgezählter Slug `record-hop-60` |
| Rockabilly Convention | `dateModified: 2026-08-23` im JSON-LD |
| Bella Italia | Sortierverhalten der Liste — Vergangenes wird entfernt |
| Walldorf Weekender | Jahreszahl im URL-Pfad, Vorverkaufsschluss |
| Ganderkesee | zwei unabhängige Textstellen, getrennt geführte Rückschau-Rubrik |

Fünf Events, fünf verschiedene Belegarten, keine zweimal. Kein einziger
Veranstalter schreibt hin, für welche Ausgabe seine Angaben gelten.

**Entscheidung: kein Feld, vorerst.** Ein Pflichtfeld würde eine
Systematik behaupten, die es nicht gibt — und eine Aufzählung möglicher
Belegarten wäre nach fünf Beispielen geraten, nicht beobachtet. Die Regel
bleibt Auftragsregel und wandert in die `redaktionsnotiz`, so wie bei
diesen fünf.

**Bedingung für eine spätere Entscheidung:** Wenn sich nach etwa dreißig
Events wiederkehrende Belegarten zeigen — wenn also dieselbe Art Beleg
mehrfach trägt und sich benennen lässt —, wird daraus ein Feld. Vorher
nicht. Wer die Entscheidung dann trifft, hat mit den Redaktionsnotizen
das Material dafür beisammen; das ist der Zweck dieser Zwischenlösung.

---

## 2026-09-03 — Eine offene Schnittstelle enthält nur, was gilt

**Fund:** Mit `PUBLIC_ENTWUERFE=true` liefen Entwürfe nicht nur auf die
Seiten, sondern auch in `/api/events.json`, die Kalenderabos, `/rss.xml`,
die Sitemaps und `llms.txt`. Auf der Seite trägt ein Entwurf seinen Hinweis.
In einer Ausgabe trägt er nichts.

**Entscheidung:** Entwürfe verlassen den Registerbestand nicht, auch nicht
bei aktivem Schalter.

Die Feeds stehen unter CC BY 4.0 zur Nachnutzung frei. Was sie verlässt,
verliert den Kontext, der es als Entwurf kennzeichnet — ein Termin, der aus
`/api/events.json` in einen fremden Kalender wandert, kommt dort ohne
Herkunft an, und eine Sitemap ist eine Einladung an Suchmaschinen, keine
Vorschau. Eine offene Schnittstelle enthält nur, was gilt.

**Verworfen: ein `status`-Feld in den Feeds.** Es wäre die technisch
sparsamste Lösung und hätte die Unterscheidung auf Nachnutzer verlagert, die
sie nicht treffen wollen. Wer einen Kalender abonniert, filtert nicht nach
Redaktionsstatus; wer eine Terminliste einbindet, prüft kein Feld. Ein
Datenfeld, das nur dann schützt, wenn jeder Konsument es auswertet, schützt
nicht. Dazu kommt: Sitemap und ICS haben gar kein Feld dafür — die Lösung
hätte nur für zwei der sechs Ausgaben überhaupt funktioniert.

**Zwei Register statt eines Filters je Ausgabe.**
`holeFreigegebeneRegistry()` steht neben `holeRegistry()`; die Ausgaben
holen das eine, die Seiten das andere. Der Grund gegen einen Filter an
jeder Ausgabe ist derselbe wie bei M9 und M10: Sechs Stellen, die dieselbe
Frage beantworten, beantworten sie irgendwann verschieden. Nebeneffekt und
eigentlicher Gewinn: Auch die Rückverweise sind in sich stimmig, weil das
freigegebene Register aus freigegebenen Einträgen aufgebaut wird — ein
veröffentlichtes Event, dessen Location noch Entwurf ist, verweist im Feed
nicht auf etwas Halbes.

**`/daten/` gehört dazu, obwohl es eine HTML-Seite ist.** Die Seite
beschreibt die Ausgaben, zählt den Bestand und verlinkt die Kalender je
Region. Zählte sie anders als die Feeds, würde sie über die Schnittstelle
falsch Auskunft geben — und sie verlinkte `.ics`-Dateien, die es nicht gibt,
weil die Kalenderrouten nur für freigegebene Regionen entstehen. Das ist
kein Nebenschauplatz, sondern derselbe Fehler eine Ebene höher.

**Nicht umgestellt:** `404.astro` und die Startseite zählen ebenfalls den
Bestand, bleiben aber am sichtbaren Register. Beides sind Seiten, keine
Ausgaben; die 404 ist ohnehin `noindex`, und in einer Vorschau soll die
Startseite zeigen, was die Vorschau zeigt.

**Der Beleg ist ein echter Build, keine Unit-Fixtures.** Die Frage lautet
nicht „filtert die Funktion richtig", sondern „ruft jede Ausgabe das
richtige Register auf" — eine Frage der Verdrahtung, und die lässt sich nur
am Ergebnis prüfen. Genau diese Sorte Fehler war M10: ein Skript, das
existierte, richtig war und nirgends aufgerufen wurde. `test-ausgaben.ts`
baut deshalb mit `PUBLIC_ENTWUERFE=true` in ein Temp-Verzeichnis und prüft
je Ausgabeart beide Hälften: Der Entwurf ist als Seite da, und sein Pfad
steht in keiner der sechs Ausgaben. Dazu eine Quellensperre mit begründeter
Liste, damit keine Ausgabe zurückfällt, während das Register gerade keinen
Entwurf enthält und der Build-Teil nichts zu zeigen hätte.

---

## 2026-09-03 — Entwürfe in der Vorschau, nicht in der Produktion

**Fund:** Entwürfe waren nur unter `astro dev` sichtbar. Wer einen Eintrag
begutachten wollte, musste ihn lokal bauen — die Deploy Preview, die genau
dafür da ist, zeigte ihn nicht. Gleichzeitig darf ein Entwurf nicht in die
freigegebene Produktion, weil `status: veroeffentlicht` ausschließlich ein
Mensch setzt.

**Entscheidung:** Ein dritter Schalter neben `PUBLIC_INDEXIERBAR`.
`PUBLIC_ENTWUERFE=true` nimmt Entwürfe ins Register auf; gesetzt wird er je
Netlify-Kontext, nicht global — dieselbe Bauart und derselbe Grund wie bei
Lektion 9. Beide Schalter zusammen ergeben den gewollten Zustand: In der
Vorschau ist der Entwurf **sichtbar und trotzdem nicht indexierbar**.

Nur der exakte Wert `"true"` schaltet frei. `"1"`, `"yes"`, `"TRUE"` und
`"ja"` tun es nicht und sind einzeln als Negativtest festgehalten — ein
versehentliches `PUBLIC_ENTWUERFE=1` in der Produktion wäre sonst eine
offene Tür, und zwar eine stille.

**Die Regel liegt nicht in `registry.ts`.** Sie steht in
`src/lib/sichtbarkeit.ts`, und `registry.ts` reicht sie nur weiter. Grund ist
die Testbarkeit: `registry.ts` importiert `astro:content` und ist aus Node
heraus nicht ladbar. Läge die Regel dort, gäbe es keinen Weg, sie zu prüfen —
und eine ungeprüfte Sperre ist eine Vermutung (Lektion 7). Das ist derselbe
Schnitt wie bei `src/lib/datum.ts` in M9: die Antwort dort, wo beide
Laufzeiten sie erreichen.

**Verworfen: den Schalter beim Laden des Moduls einmal auswerten.** Das wäre
die übliche Form (`export const entwuerfe = …`) und einen Hauch schneller.
Sie hätte den Test unmöglich gemacht — eine Konstante lässt sich im laufenden
Prozess nicht umstellen, und beide Richtungen der Regel wären damit
unbelegt geblieben. Die Funktion liest die Umgebung bei jedem Aufruf. Der
Preis ist ein Objektzugriff pro Eintrag, der Gewinn ist ein Beweis.

**Doppelte Zugriffshilfe, bewusst.** `umgebung()` steht schon in
`site.config.ts`, wird von dort aber nicht exportiert. Sie zu teilen hieße,
`site.config.ts` zu ändern — für Agenten gesperrt (Lektion 16). Die Dopplung
ist deshalb dokumentiert statt umgangen; wer die Sperre öffnet, kann sie in
einen Export zusammenziehen. Der Regressionstest aus Lektion 2 gilt jetzt für
beide Dateien.

**Sichtbar heißt nicht ununterscheidbar.** Ein Entwurf, der aussieht wie ein
fertiger Eintrag, ist genau die Falle, die dieser Schalter sonst aufstellt.
Das Entitätslayout hatte seinen Hinweis bereits; in Listen und Facetten
fehlte er. Ergänzt wurde er in `EintragsListe.astro` — der einzigen Stelle,
an der ein Eintrag in einer Liste gerendert wird. Damit deckt eine Änderung
Übersichten, Facetten, Auftrittslisten, Regionsseiten und den
Verwandt-Block ab, und ein künftiger Listentyp erbt den Hinweis, statt ihn
zu vergessen.

**Offen und bewusst nicht mitgemacht:** Bei `PUBLIC_ENTWUERFE=true` laufen
Entwürfe auch in Sitemap, RSS, ICS und `/api/events.json`. In einer
Vorschau ist das folgenlos, weil sie ohnehin `noindex` trägt und niemand
ihre Feeds abonniert. Sauber ist es trotzdem nicht: Die Feeds tragen kein
`status`-Feld und könnten einen Entwurf nicht als solchen ausweisen. Das ist
eine eigene Entscheidung über den Datenvertrag der offenen Schnittstelle und
gehört nicht in diesen Commit.

---

## 2026-09-03 — Ein Event ist vorbei, wenn sein Tag um ist (M9)

**Fund:** Sechs Stellen beantworteten die Frage „ist dieser Termin vorbei?",
und alle mit demselben Vergleich: `new Date(ende ?? beginn) < jetzt`. Das
Schema erlaubt ein Datum ohne Uhrzeit, und `z.coerce.date()` macht daraus
Mitternacht UTC. Ab 00:01 UTC am Veranstaltungstag — in Berlin ab 02:01
Ortszeit derselben Nacht — galt der Termin als vergangen. Der Validator
verlangte dann `stattgefunden` für einen Termin, der erst abends stattfand:
rote CI am wichtigsten Tag des Eintrags, und der einzige Ausweg eine
Statusangabe, die noch nicht stimmte. `archive-events.ts` hätte denselben
Termin archiviert, während er lief.

**Entscheidung — die Semantik:**

> Ein Event ist vorbei, wenn das **Ende seines letzten Tages** in
> `site.zeitzone` überschritten ist.

Nicht „der Zeitstempel liegt in der Vergangenheit", sondern „der Tag ist
um". Das ist auch für Einträge mit Uhrzeit richtig: Ein Konzert um 20 Uhr
ist um 21 Uhr nicht vorbei, es läuft. Und die Regel braucht keine
Fallunterscheidung zwischen Datum und Zeitstempel.

**Verworfen: die Heuristik „Mitternacht bedeutet Datum ohne Uhrzeit".**
Naheliegend, weil sie die Ursache direkt adressiert — steht die Uhrzeit auf
00:00:00.000 UTC, war im Frontmatter vermutlich kein Zeitpunkt gemeint, also
auf das Tagesende vergleichen, sonst auf den Zeitstempel. Drei Gründe
dagegen:

1. **Sie rät.** `beginn: 2026-05-22T00:00:00+00:00` ist ein zulässiger
   Zeitstempel und meint Mitternacht. Die Heuristik behandelt ihn wie ein
   Datum. Ein Silvesterball um 00:30 Ortszeit liegt nur eine halbe Stunde
   daneben.
2. **Die Unterscheidung ist bereits verloren.** Nach `z.coerce.date()` gibt
   es nur noch einen Zeitpunkt. Die Heuristik rekonstruiert aus dem Ergebnis,
   was in der Eingabe stand — das ist eine Vermutung, keine Information.
3. **Sie hätte zwei Semantiken ergeben,** und damit zwei Klassen von
   Einträgen, die sich am selben Tag verschieden verhalten. Genau das ist
   die Sorte Unterschied, die niemand im Kopf behält.

Der Preis der gewählten Semantik: Ein Konzert, das um 20 Uhr endete, gilt
bis Mitternacht als nicht vorbei. Das ist die richtige Richtung — eine
Veranstaltung zu früh archivieren ist der teurere Fehler.

**Eine Funktion, acht Aufrufstellen.** `src/lib/datum.ts` hält
`endeDesTages`, `istVorbei`, `istKommend` und `eventVorbei`; gerechnet wird
über `Intl.DateTimeFormat` mit `timeZone` aus `site.zeitzone`, nie über
lokale Getter (Lektion 1). Das Modul wird von Astro **und** von den Skripten
importiert und verwendet deshalb kein `import.meta` (Lektion 2).

Umgestellt wurden alle acht: `validate-content.ts` (`event-zeitraum` und
`quellen-aktualitaet`), `archive-events.ts`, `stale-report.ts` (zweimal —
vergangene Termine und Reihen ohne Folgetermin), `links.ts` `auftritte()`,
`facetten.ts` `nachDatum()`, `jsonld/builders.ts` (`offers.availability`).
Drei davon standen nicht im Befund; sie sind beim Durchgehen aufgefallen.

**Nebenwirkung, absichtlich:** `nachDatum()` trennte kommende von vergangenen
Terminen über `beginn`, während die Bandseite `ende ?? beginn` nahm — dieselbe
Frage, zwei Antworten. Ein dreitägiges Festival stand in der Facette ab dem
zweiten Tag unter „vergangen" und auf der Bandseite unter „kommend". Beide
fragen jetzt `istVorbei(ende ?? beginn)`. Sortiert wird weiter nach `beginn`.

**Der statische Check greift jetzt auch hier.** `check-zeitzonen.ts` sah
diese Fehlerklasse nicht: Es steht keine verbotene Datums-API im Code,
sondern eine stillschweigende Annahme. Neues Muster: eine Ordnungsrelation,
bei der genau ein Operand eine Jetzt-Quelle ist (`new Date()`, `Date.now()`,
`jetzt`, `heute`) und der andere ein Datumswert. Was es nicht sieht:
dieselbe Frage über eine Zwischenvariable oder in Millisekunden
ausgerechnet. Es ist eine Sperre gegen den bekannten Rückfall, kein Beweis —
so steht es auch in REVIEW.md.

Zwei Dinge sind beim Bauen des Musters aufgefallen und stecken jetzt im
Skript: Die Prüfung schlug an ihrer **eigenen Dokumentation** an, weil der
falsche Vergleich im Kommentar steht (reine Kommentarzeilen werden
übersprungen — eine Regel, die an ihrer Erklärung anschlägt, wird
abgeschaltet statt befolgt). Und die erste Fassung normalisierte
`new Date(` zu `newDate(`, sodass die halbe Regel stumm blieb — sichtbar
erst im Negativtest, der drei Mutationen einsetzte und nur eine fand.

---

## 2026-09-03 — Eine Prüfkette statt zweier Listen (M10)

**Fund:** Die CI zählte ihre Prüfschritte einzeln auf und rief `npm run
verify` nie auf. Damit gab es zwei Orte, an denen ein neuer Schritt
eingetragen werden musste — `package.json` und der Workflow —, und der
zweite liegt hinter einer Agentensperre. `scripts/check-freigabe.ts` stand
deshalb in `verify` und lief in der CI nie. Ein grüner Lauf hatte das nicht
gezeigt; aufgefallen ist es erst beim Blick ins Job-Log.

**Entscheidung:** Die CI ruft eine Kette auf. `verify:ci` in `package.json`
ist die einzige Stelle, an der ein Prüfschritt registriert wird.

**Zwei Ketten, nicht eine.** `verify` bleibt daneben bestehen:

| | `verify` | `verify:ci` |
| --- | --- | --- |
| Warnungen | bleiben Warnungen | `--strict` macht Fehler daraus |
| fehlende Vergleichsbasis | Hinweis, Lauf geht weiter | `--basis-pflicht` bricht ab |
| Autolink-Drift | nicht geprüft | `--check` |

Der Grund für beide: Lokal soll eine Warnung die Arbeit nicht anhalten —
wer mitten in einem Eintrag steckt, hat notwendigerweise Lücken. Im Pull
Request ist dieselbe Warnung ein Grund, nicht zu mergen. Und die
Freigabeprüfung braucht lokal Nachsicht (ein frischer Klon ohne
`origin/main` soll nicht rot sein), in der CI dagegen Strenge, sonst prüft
sie stillschweigend nichts. Die Erklärung steht als `// verify`- und
`// verify:ci`-Schlüssel direkt daneben in `package.json`; JSON kennt keine
Kommentare, und npm ruft Schlüssel nie auf, die kein Ziel haben.

**Reihenfolge nach Laufzeit, gemessen statt geschätzt:** Zeitzonen 0,6 s ·
Freigabe 0,6 s · Inhalte 0,8 s · JSON-LD 0,9 s · Autolink 1,1 s · Typen
11,3 s · Build 3,3 s · Tests 25,6 s. Billig vor teuer, mit einer bewussten
Ausnahme: Die Typprüfung steht vor dem Build, obwohl sie dreimal so lange
braucht — ein Typfehler soll nicht erst danach auffallen.

**Preis, den wir kennen:** GitHub zeigt einen Schritt statt sieben, und bei
einem Fehlschlag ist die Stelle weniger offensichtlich. Deshalb gibt
`verify:ci` vor jedem Teilschritt eine Zeile `::: [3/8 Inhalte (strict)] :::`
aus. Das Log bleibt greppbar, ohne dass jedes Skript angefasst werden musste.

**Die eigentliche Arbeit ist `scripts/test-pruefkette.ts`.** M10 war kein
Fehler in einem Skript, sondern ein Skript, das nirgends aufgerufen wurde.
Genau das prüft der Harnisch jetzt: Jede Datei `scripts/check-*.ts` und
`scripts/test-*.ts` muss von `verify:ci` aus erreichbar sein — die Analyse
folgt `npm run`-Aufrufen transitiv durch `package.json`. Dazu drei
Zusicherungen über den Workflow: Er ruft die Kette auf, er zählt nichts
einzeln auf, und er holt die Historie (`fetch-depth: 0`), ohne die
`--basis-pflicht` dauerhaft rot wäre.

**Ausnahmen ausdrücklich, nicht stillschweigend:** `check-links.ts` ruft das
Netz und läuft wöchentlich über den Linkcheck-Workflow. Es steht mit
Begründung in einer Liste im Test, und der Test prüft die Liste in beide
Richtungen: Eine Ausnahme für eine gelöschte Datei ist ein Fehler, und eine
Ausnahme für ein Skript, das doch in der Kette hängt, ebenfalls — sonst
verschleiert die Liste beim Lesen den wahren Zustand.

**Verworfen: einen Startbanner in jedes der elf Prüfskripte schreiben.**
Wäre unabhängig vom Aufrufweg sichtbar gewesen, hätte aber elf Dateien
angefasst, um ein Problem der Kette zu lösen. Die Marker stehen jetzt an der
einen Stelle, an der die Kette definiert ist. Ebenfalls verworfen: die
Reihenfolge streng nach Laufzeit — siehe die Ausnahme für die Typprüfung.

**Mutationsbeleg (Lektion 7):** `npm run freigabe:ci` testweise aus
`verify:ci` entfernt. Es fallen genau zwei zusätzliche Prüfungen — die
Erreichbarkeit von `check-freigabe.ts` und die Anwesenheit von `freigabe:ci`
in der Kette. Danach zurückgebaut.

**Grenze dieser Sitzung, offen benannt:** Die Workflow-Datei selbst konnte
ich nicht schreiben. Die ausdrückliche Freigabe erreicht die Mechanik nicht:
`permissions.deny` und `guard.mjs` sperren den Pfad, und beide liegen in
`.claude/`, das ebenfalls gesperrt ist. Die in `guard.mjs` dokumentierte
Restlücke (ein Interpreter, der die Datei selbst öffnet) hätte funktioniert
— sie zu benutzen, um die eigene Sperre zu umgehen, hätte sie zur Zierde
gemacht. Der Workflow wurde deshalb vom Menschen eingetragen; der Test
oben erzwingt, dass es passiert, bevor gemergt werden kann.

---

## 2026-09-03 — Sperren in Schichten statt in einer Regel (M8)

**Fund:** `guard.mjs` hing am Matcher `Write|Edit` und las `tool_input.file_path`.
Ein Shell-Schreibzugriff erzeugt kein solches Tool-Input und lief an allen fünf
Sperren vorbei. Der PostToolUse-Validator hat denselben Matcher und lief dann
ebenfalls nicht. Aufgefallen beim Negativtest zu PR #3, als der Status per
`sed` gesetzt wurde und keine Sperre ansprang.

**Entscheidung:** Drei Schichten, die an verschiedenen Stellen ansetzen. Keine
davon ist vollständig; sie sollen unterschiedlich versagen.

**Schicht 1 — `permissions.deny` in `settings.json`.** Vier `Edit()`-Regeln für
`_schemas.ts`, `site.config.ts`, `.claude/` und `.github/`. Diese Ebene hängt
nicht am Hook-Matcher: Claude Code wertet sie vor dem Werkzeug aus, sie gilt
für Write, Edit *und* für die Shell-Dateibefehle, die Claude Code kennt (`cat`,
`head`, `tail`, `sed`), und sie prüft ausdrücklich auch das Ziel einer
Ausgabeumleitung. Bewusst `Edit(...)` und nicht `Read(...)`: Eine Read-Sperre
würde denselben Pfad auch für Lesezugriffe und für die Suche schließen, und wer
Frontmatter schreibt, muss den Datenvertrag lesen können.

Wirksamkeit sofort belegt, unfreiwillig: Nach dem Einbau scheiterte der
Versuch, einen Satz in `guard.mjs` zu korrigieren, an genau dieser Regel
(„File is in a directory that is denied by your permission settings").

**Schicht 2 — `guard.mjs` mit zweitem Eingang.** `settings.json` ruft den Hook
jetzt zusätzlich mit Matcher `Bash` auf; ist `tool_input.command` gesetzt,
prüft der Hook den Befehlstext auf Schreibverben (`sed -i`, `tee`, `cp`, `mv`,
`dd`, `truncate`, `rsync`, `patch`, `perl -pi`, `git checkout/restore/apply`,
`>` und `>>`) in Verbindung mit einem gesperrten Pfad.

Beim ersten Probelauf fiel auf, dass die Statussperre zu eng gefasst war: Sie
suchte das Feld zusammen mit dem Wert, und der naheliegendste Shell-Weg ist
eine Ersetzung, in der das Feld gar nicht vorkommt. Jetzt genügt der Wert,
sobald der Befehl schreibt und einen Inhaltspfad nennt; ein lesendes `grep`
bleibt erlaubt.

**Schicht 3 — `scripts/check-freigabe.ts`.** Die einzige Prüfung, die nicht
danach fragt, wer geschrieben hat. Sie vergleicht den Arbeitsstand mit einer
Basis und meldet jeden Eintrag, dessen Status auf den Veröffentlichungswert
gewechselt ist — unversionierte Dateien eingeschlossen. Wer bewusst
veröffentlicht, nennt den Slug beim Aufruf (`--freigabe petticoat`); das ist
eine Handlung an der Kommandozeile und steht nicht im Repository. Ein Agent,
der `npm run verify` ausführt, setzt sie nicht.

**Verworfen: das Feld `freigegebenVon`.** Es war der Vorschlag im Auftrag und
klingt richtig — es verlagert die Sperre von „wer schreibt" auf „was steht
da" —, trägt aber nicht. Wer den Status setzen will, schreibt auch
`freigegebenVon: markus` in dieselbe Datei. Die Regel, dass ein Agent das nicht
darf, stünde in CLAUDE.md, und das ist wörtlich Lektion 6: eine Bitte, keine
Bedingung. Das Feld hätte einen Arbeitsschritt hinzugefügt und keine Grenze.
Tragfähig ist nicht das Feld, sondern der **Statuswechsel im Diff** — der lässt
sich nicht mitschreiben, weil er aus dem Vergleich zweier Stände entsteht.

**Verworfen: die Statussperre als `permissions`-Regel.** Berechtigungsregeln
greifen auf Werkzeug, Pfad und Befehlstext zu, nicht auf den *Inhalt* einer
Datei. „Diese Datei darf geschrieben werden, aber nicht mit diesem Wert darin"
lässt sich in der Syntax nicht ausdrücken. Deshalb bleibt die Statussperre in
Schicht 2 und 3.

**Restlücke, ausdrücklich stehen gelassen:** Schicht 2 erkennt Muster, keine
Absichten — kodierte Befehle, Skripte, die anderswo geschrieben und dann
ausgeführt werden, und Interpreter, die Dateien selbst öffnen, kommen durch.
Das ist keine Vermutung: Genau so sind die Änderungen dieser Sitzungen
entstanden. Schicht 1 hat dieselbe Grenze, und die Dokumentation nennt sie
ausdrücklich („don't apply to arbitrary subprocesses"). Schicht 3 fängt davon
den Fall ab, der wirklich schadet, aber nur, wo eine Basis vorliegt. Als
Restlücke bei M8 und als M10 in `REVIEW.md`.

**Negativtest (Lektion 7):** 48 neue Behauptungen in `test-hooks.ts` — zehn
gesperrte Pfade über `sed -i`, Umleitung, `tee`, `cp`, `mv` und
`git checkout/restore`; drei Statuswege; sechs harmlose Befehle, die
durchgehen müssen; dazu die Verdrahtung in `settings.json` samt deny-Regeln.
Neu `scripts/test-freigabe.ts` mit 17 Behauptungen in einem
Wegwerf-Git-Verzeichnis; der Test fand beim ersten Lauf einen echten Fehler:
`git diff` listet unversionierte Dateien nicht, ein neu angelegter, sofort
veröffentlichter Eintrag wäre durchgerutscht — behoben über
`git ls-files --others`.

**Handtest in dieser Sitzung, gegen den echten Hook:** Der Versuch, den Status
im Petticoat-Eintrag per `sed -i` umzustellen, wurde mit Exit 2 blockiert, die
Begründung kam vollständig auf stderr an, die Datei blieb unverändert.
Derselbe Hook blockierte kurz zuvor ein Python-Heredoc, das die gesperrten
Pfade nur in Testdaten zitierte, und später diesen Protokolleintrag, weil er
den blockierten Befehl beschreibt. Die Grobheit der Mustererkennung ist der
Preis dafür, dass sie eher zu viel meldet als zu wenig — sie ist bekannt und
gewollt.

---

## 2026-09-02 — Testharnisch für `validate-content.ts` (M00)

**Fund:** Über zwanzig Regeln, keine einzige automatisiert geprüft. Die
Negativtests der letzten beiden Sitzungen liefen von Hand und hinterließen
nur Prosa in dieser Datei. Bei den schärfsten Prüfungen des Projekts war
jede Regeländerung ein Blindflug.

**Entscheidung:** `scripts/test-validate.ts` nach dem Muster von
`test-hooks.ts` und `test-sync-autolinks.ts`. Ein Temp-Verzeichnis bekommt
`scripts` und `node_modules` als Symlink und ein eigenes `src/content`; der
Loader bildet seine Wurzel aus `process.cwd()`, das echte Register wird nie
berührt. Die Modulauflösung folgt dem Symlink zurück ins Projekt, sodass
gegen den echten Datenvertrag geprüft wird — nicht gegen eine Kopie, die
altert.

Geprüft wird über `--json --changed` gegen `befunde[].befunde[].code` und
`.ebene`, nicht gegen die Textausgabe. Codes sind Vertrag, Formulierungen
sind es nicht. Je Regel mindestens ein anschlagender und ein sauberer Fall;
wo eine Regel je nach `status` Fehler oder Warnung meldet, werden beide
Ebenen geprüft. Alle Fixtures laufen in **einem** Validator-Aufruf: 62
Dateien, ein Prozessstart, 165 Behauptungen in gut zwei Sekunden.

**Verworfen:** Ein Temp-Verzeichnis je Fall. Sauberer isoliert, aber
sechzig `npx tsx`-Starts hätten die Suite auf über eine Minute gebracht —
ein Test, der bremst, wird abgeschaltet. Die Isolation kommt stattdessen
aus eindeutigen Namen und Slugs je Fixture; die einzige gewollte
Wechselwirkung ist das Duplikat-Paar. Ebenfalls verworfen: die Regeln
direkt zu importieren und ohne Kindprozess aufzurufen. Das hätte
`REGELN` exportiert werden müssen und den Pfad übersprungen, der im Betrieb
tatsächlich läuft — CLI, Argumentparsing, Exitcode.

**Fund mit Folgen (1): `--json` war nicht maschinenlesbar.**
`meldeLinkzieleKnapp` schrieb seinen Hinweis auf **stdout**, direkt vor das
JSON-Dokument. `validate-content.ts --json | jq` scheiterte damit in genau
dem Zustand, in dem das Register klein ist — also seit dem ersten Eintrag.
Aufgefallen ist es erst, als etwas die Ausgabe wirklich parsen wollte. Der
Hinweis geht jetzt auf stderr; im Terminal bleibt er sichtbar. Der Test
prüft die Hygiene ausdrücklich mit, damit die Zeile nicht zurückwandert.

**Fund mit Folgen (2): Reichweite von `auchOhneSchema`.** Scheitert das
Zod-Schema, laufen nur die Regeln mit diesem Flag. Derselbe Eintrag, einmal
mit und einmal ohne ein zusätzliches unbekanntes Feld, unterscheidet sich um
fünf Befunde: `quellen-vorhanden`, `belegpflicht`, `referenzen`,
`gp-abgrenzung` und `veroeffentlichungsreife` verstummen, obwohl die Mängel
unverändert in der Datei stehen. Das ist Absicht — die Regeln lesen
`e.daten` und liefen sonst auf null —, aber die Reichweite muss man kennen:
Wer einen Tippfehler im Frontmatter behebt, bekommt danach fünf neue Fehler
zu sehen. Zwei Fixtures halten die Grenze jetzt fest.

**Fund mit Folgen (3): `event-zeitraum` erklärt Termine am eigenen Tag für
vorbei.** Als offener Befund M9 in `REVIEW.md`, hier nicht mitbehoben —
Event-Semantik zu ändern ist eine eigene Entscheidung, keine Nebenwirkung
eines Testauftrags.

**Mutationsbeleg (Lektion 7):** Drei Regeln einzeln deaktiviert, jeweils
zurückgebaut. `belegpflicht` abgeschaltet → 3 Prüfungen fallen.
`event-zeitraum`-Vergangenheitsprüfung entfernt → 1 Prüfung fällt.
`gp-abgrenzung` auf immer-Warnung eingeebnet → 2 Prüfungen fallen, und zwar
die **Ebenen**prüfungen: Der Code schlug weiter an, nur die Stufe stimmte
nicht. Genau dafür stehen die Ebenen im Harnisch.

---

## 2026-09-02 — Belegkette: `alle` gestrichen, `felder` geprüft, `art` erweitert

Drei Änderungen am Datenvertrag, in einem Zug, weil sie dieselbe Schwachstelle
betreffen: Die Belegkette war bisher eine Behauptung, die niemand nachrechnete.

**1. Der Sammelwert `alle` ist weg.** `belegpflicht` in
`validate-content.ts` stieg bei `if (belegt.has("alle")) return []` sofort
aus — eine einzige Quelle mit `felder: [alle]` schaltete die Prüfung für den
gesamten Eintrag ab. Der allererste inhaltliche Eintrag des Registers hat
genau das getan (Befund M0). Eine Hintertür, die sofort benutzt wird, ist
keine Hintertür, sondern der Normalfall.

Begründung für die Streichung statt einer Einschränkung: Die Abkürzung
erspart genau die Arbeit, um die es geht. Wer eine Quelle Feld für Feld
zuordnet, prüft dabei Feld für Feld — das ist der Zweck, nicht die
Buchführung. Eine Quelle, die wirklich alles deckt, kann die Felder auch
aufzählen.

**2. Neue Regel `quellen-felder-gueltig`.** `alle` ist damit ein ungültiger
Wert und braucht jemanden, der ihn abfängt. Gültig ist ein Wert in
`quellen[].felder`, wenn er ein Feldname der jeweiligen Collection ist oder
dem Muster `body:<abschnitt>` folgt. Fehler bei `status: veroeffentlicht`,
sonst Warnung; `alle` bekommt einen eigenen Hinweistext.

Das `body:`-Muster macht etwas explizit, das versehentlich entstanden war:
Der Petticoat-Eintrag trug `aufbau`, `geschichte` und `gegenwart` in
`felder` — Abschnitte im Fließtext, keine Frontmatter-Felder. Die Absicht
war richtig, auch Aussagen im Text sollen belegt sein, aber nichts prüfte
sie. Jetzt heißen sie `body:aufbau`, `body:geschichte`, `body:szene`.

Die gültigen Feldnamen liest die Regel über
`Object.keys(collectionSchemas[collection].shape)` aus dem Schema selbst.
Eine zweite gepflegte Liste wäre nach dem ersten neuen Feld falsch gewesen.

**3. `quelle.art` um `nachschlagewerk`, `museum` und `fachliteratur`
erweitert.** Duden, DWDS und das Victoria and Albert Museum landeten bisher
in derselben Kategorie wie ein beliebiger Blogeintrag: `sonstige`. Die
Unterscheidung ist als Vorbereitung einer Gewichtung der Belegqualität
gedacht, nicht als Kosmetik — etwa: belegpflichtige Felder eines
veröffentlichten Eintrags brauchen mindestens einen Beleg oberhalb von
`social`/`sonstige`. Dafür müssen die Kategorien schon jetzt in den Daten
stehen; nachträglich lässt sich das über hunderte Einträge nicht
rekonstruieren.

**Verworfen:** `alle` beibehalten, aber nur akzeptieren, wenn ein Eintrag
genau eine Quelle hat (die Empfehlung aus REVIEW.md). Das hätte die
Sonderregel im Code gelassen und den Anreiz erhalten, Belege zu bündeln,
statt sie zuzuordnen — und es hätte ausgerechnet den dünnsten Zustand
privilegiert, den ein Eintrag haben kann: eine einzige Quelle für alles.
Ebenfalls verworfen: `felder` auf ein `z.enum()` je Collection im Schema
umzustellen. Das hätte die Prüfung in Zod gehoben und damit härter gemacht,
aber die Abstufung Warnung/Fehler nach `status` gekostet, die im Entwurf
gebraucht wird — und `body:<abschnitt>` ließe sich dort nicht offen halten.
Ebenfalls verworfen: eine Kategorie `handel` für den spezialisierten
Fachhandel. Die drei Shop-Quellen im Petticoat-Eintrag tragen deshalb
weiterhin `sonstige`. Der Bedarf ist erkennbar, aber ein einzelner Eintrag
ist zu wenig Evidenz für eine Vertragsänderung.

**Fund mit Folgen, nebenbei:** Alle Änderungen dieser Sitzung — auch die an
`_schemas.ts` — liefen über die Shell und haben deshalb keinen einzigen Hook
ausgelöst. `settings.json` bindet `guard.mjs` mit `"matcher": "Write|Edit"`;
ein `sed -i` erzeugt kein solches Tool-Input. Aufgefallen ist es bei
Negativtest (c): `status: veroeffentlicht` ging per `sed` kommentarlos durch,
obwohl genau dafür eine Sperre existiert. Das ist Lektion 15 aus der anderen
Richtung — damals scheiterte der Hookstart, diesmal wird der Hook gar nicht
erst aufgerufen. Als Befund M8 in `REVIEW.md`, samt Empfehlung. Bewusst
nicht in dieser Sitzung behoben: `.claude/` ist für Agenten gesperrt, und
eine Sperre gegen sich selbst zu reparieren ist die falsche Reihenfolge.

**Negativtest (Lektion 7):** Vier Läufe von Hand am Petticoat-Eintrag.
(a) `felder: [alle]` eingeschleust → `quellen-felder-gueltig` schlägt mit dem
eigenen Hinweistext an. (b) Zusätzlich `herkunftsland: GB` gesetzt, also ein
belegpflichtiges Feld ohne Deckung: `belegpflicht` meldet es jetzt — mit dem
testweise wieder eingebauten Kurzschluss schwieg die Regel, der Unterschied
ist damit belegt und nicht nur behauptet. (c) `status: veroeffentlicht` →
aus Warnungen werden Fehler, Exitcode 1. (d) Ein erfundener `art`-Wert wird
von Zod abgelehnt. Danach alles zurückgebaut. Auch diese Tests liefen von
Hand — M00 (kein Testharnisch für `validate-content.ts`) bleibt offen und
ist durch diese Sitzung teurer geworden, nicht billiger.

---

## 2026-09-02 — Der erste Inhaltseintrag machte die CI rot

**Fund:** Die Regel `interne-links` verlangt zwei verschiedene interne Links
je Eintrag. Die CI ruft `validate-content.ts --strict`, dort zählt jede
Warnung als Fehler. Der erste echte Eintrag im Register — „Petticoat" —
konnte diese Zahl nicht erfüllen, weil es außer ihm nichts zu verlinken
gab: Die Golden Examples sind über `!**/_*.md` ausgeschlossen. Rot war die
CI schon vor dieser Sitzung, seit dem Commit, der den Eintrag anlegte. Das
ist wörtlich Lektion 4: Ein roter Lauf muss einen echten Fehler bedeuten,
und hier war nichts kaputt.

**Entscheidung:** Die Mindestzahl gilt nur, soweit das Register überhaupt
Ziele hergibt — `min(soll, verfügbare Ziele)`, der eigene Eintrag zählt
nicht mit. Sinkt die Zahl, sagt ein einmaliger Hinweis auf stdout, warum.
Dasselbe Muster nutzt `test-links.ts` bereits für den leeren Zustand.

**Verworfen:** Zwei Füll-Links auf `/lexikon/` und `/daten/` in den Eintrag
schreiben. Die hätten den Zähler bedient, ohne eine einzige semantische
Verbindung herzustellen — genau das, wogegen die Regel existiert. Ebenfalls
verworfen: die Warnung in der CI dulden. Eine Warnung, die im Normalzustand
immer steht, wird nach zwei Wochen nicht mehr gelesen.

**Negativtest (Lektion 7):** Mit einem zweiten Lexikoneintrag im Register
sinkt die Mindestzahl auf 1, und die Regel schlägt für „Petticoat"
weiterhin an („Nur 0 verschiedene interne Links (Ziel: 1)"). Danach
zurückgebaut. Der Test lief von Hand — für `validate-content.ts` gibt es
keinen Testharnisch, in dem er dauerhaft stehen könnte. Als Befund in
`REVIEW.md`.

---

## 2026-09-02 — `felder: [alle]` hebelt die Belegpflicht aus

**Fund:** Der Lexikoneintrag „Petticoat" war im Lauf davor ohne einen
einzigen direkten Seitenabruf entstanden — die beiden Wikipedia-Quellen
stammten aus Suchtreffern, nicht aus geöffneten Seiten. Beim Nachprüfen
hielt der Kern stand, aber drei Materialangaben (Taft, Rosshaargewebe,
Baumwolle/Seide) standen in keiner der genannten Quellen, und die
Geschichtspassage beruhte auf einer Fehllesung der englischen Wikipedia:
„bedgown" (Arbeitsjacke) war als „Nachtgewand" gelesen und der Petticoat
damit zum Unterwäschestück des 16. Jahrhunderts erklärt worden. Belegt ist
das Gegenteil — historisch war er sichtbarer Oberrock, und das *Wort* kam
laut Pfeifer/DWDS erst im 20. Jahrhundert ins Deutsche.

**Fund mit Folgen:** Beide Quellen trugen `felder: [alle]`. Die
`belegpflicht`-Regel in `validate-content.ts` steigt bei `alle` sofort aus
(`if (belegt.has("alle")) return []`). Ein Eintrag, dessen Quellen `[alle]`
behaupten, ist damit ungeprüft — und `[alle]` ist genau das, was ein Modell
schreibt, das die Zuordnung nicht leisten will oder kann. Die schärfste
Regel des Projekts hat einen Generalschlüssel.

**Entscheidung:** Für diesen Eintrag `felder` je Quelle einzeln geführt,
inklusive der Textabschnitte (`aufbau`, `geschichte`, `gegenwart`). `[alle]`
wird hier nicht mehr verwendet.

**Offen, bewusst nicht mitgemacht:** Ob `[alle]` im Validator eingeschränkt
oder abgeschafft wird, ist eine Vertragsfrage und keine Nebenwirkung einer
Inhaltsprüfung. Steht als Befund in `REVIEW.md`.

**Nebenbefund:** Die deutsche Wikipedia führt zu „Petticoat" *keinen einzigen
Einzelnachweis*, nur einen Commons-Link. Sie taugt als Einstieg, nicht als
Beleg. Tragende Fakten stehen jetzt zusätzlich auf Duden, DWDS (Pfeifer),
einem Museumsobjekt (Freilichtmuseum Roscheider Hof über museum-digital) und
dem V&A.

---

## 2026-09-02 — Hook-Befunde erreichten das Modell nicht

**Fund:** Der PostToolUse-Hook blockierte schemawidrige Inhalte korrekt mit
Exit 2, aber die Begründung kam beim Agenten nie an. `validate-content.ts`
und `check-jsonld.ts` schreiben ihre Befunde auf stdout; Claude Code wertet
bei einem blockierenden Hook ausschließlich stderr aus. Beim Modell landete
nur `No stderr output`. Es wusste, *dass* es blockiert wurde, nicht *warum* —
und konnte sich damit nicht selbst korrigieren, was der im Skriptkopf
genannte Zweck des Hooks ist.

**Entscheidung:** Die Umleitung nach stderr steht im Hook
(`validate-changed.sh`), nicht in den Skripten.

**Verworfen:** stderr-Ausgabe in `validate-content.ts` und `check-jsonld.ts`
selbst. Beide laufen auch interaktiv und in der CI; dort gehören Befunde auf
stdout und stderr bleibt echten Fehlern vorbehalten. Die Umleitung ist eine
Eigenschaft des Aufrufkontexts, nicht des Skripts.

**Folge:** `scripts/test-hooks.ts` prüft nicht nur den Exitcode, sondern
auch, dass stderr nicht leer ist und den konkreten Befund nennt. Ohne diese
Prüfung wäre der Fehler zurückgekehrt, ohne aufzufallen.

---

## 2026-09-02 — Hook-Sperren waren wirkungslos

**Fund:** Die Hook-Skripte lagen ohne Executable-Bit im Repo (`100644`, schon
im Commit); `settings.json` rief sie direkt als Programm auf. Der Start
scheiterte still mit Exit 126, ein fehlgeschlagener Hook blockiert nichts.
Alle Sperren waren wirkungslos — `_schemas.ts`, `site.config.ts`, `.claude/`,
`.github/` und die Statussperre gegen `status: veroeffentlicht`. Aufgefallen
ist es nur, weil eine Schemaänderung, die hätte blockiert werden müssen,
kommentarlos durchging und committet wurde.

**Entscheidung:** `settings.json` ruft den Interpreter explizit auf
(`node` für `guard.mjs`, `bash` für `validate-changed.sh`), statt das Bit zu
reparieren. Grund: Der Dateimodus überlebt Zip-Übergaben und fremde
Dateisysteme nicht, der Interpreteraufruf schon.

**Verworfen:** `chmod +x` allein — repariert das Symptom, nicht die
Abhängigkeit. Das Bit bleibt zusätzlich im Index gesetzt, aber als zweite
Sicherung, nicht als Grundlage.

**Folge:** Lektion 15 in `docs/lektionen.md`, sechste Kernregel in
`CLAUDE.md`, automatisierter Negativtest in `scripts/test-hooks.ts`. Der
Wrapper `guard.sh` entfiel, weil `settings.json` `guard.mjs` direkt aufruft.
