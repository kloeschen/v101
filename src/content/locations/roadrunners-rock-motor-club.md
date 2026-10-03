---
name: Roadrunner's Rock & Motor Club
aliases: [Roadrunner's Berlin, Roadrunners Rock & Motor Club, Roadrunner's Club]
kurzbeschreibung: Der Roadrunner's Rock & Motor Club in der Saarbrücker Straße in Berlin-Prenzlauer Berg ist ein Club, in dem Rockabilly- und Rock'n'Roll-Konzerte der Berliner Szene stattfinden.
status: veroeffentlicht
erstelltAm: 2026-09-27
geprueftAm: 2026-09-29
autor: markus
typ: club
adresse:
  strasse: Saarbrücker Straße 24
  plz: "10405"
  ort: Berlin
  land: DE
region: berlin
redaktionsnotiz: >-
  Traegereintrag fuer das Konzert Jets / Smokestack Lightnin' am
  2026-10-03.
  ADRESSE: Rockin' Wildcat nennt sie im JSON-LD und auf der Detailseite
  des Termins als eine Zeichenkette ("Saarbruecker Str. 24, 10405
  Berlin-Prenzlauer Berg"); zerlegt und die Strassenform ausgeschrieben
  -- Normalisierung, keine Recherche. Der Posten verlangte eine zweite
  Quelle, weil die eigene Website am 2026-09-24 mit einem
  Zertifikatsfehler scheiterte. Befund vom 2026-09-27: Ueber https
  scheitert sie weiterhin (selbstsigniertes Zertifikat des Servers),
  ueber http ist sie erreichbar. Die Kontaktseite
  http://www.roadrunners-paradise.de/kontakt.html zeigt als Bild
  "ROADRUNNER'S PARADISE CLUB, Saarbruecker Strasse 24, 10405 Berlin",
  der Flyer zum 3. Oktober auf der Programmseite "Saarbrucker Str. 24 -
  10405 Berlin". Die Adresse ist damit vom Haus selbst bestaetigt.
  WARUM DIESE BESTAETIGUNG NICHT IN `quellen[]` STEHT: Das Schema laesst
  als Quellen-URL nur https zu, und die https-Fassung der Seite laesst
  sich nicht pruefen. Die http-Adresse einzutragen verstoesst gegen den
  Vertrag, die https-Adresse einzutragen behauptete einen Abruf, der nicht
  gelungen ist. Belegt im Sinne des Vertrags ist die Adresse deshalb
  allein durch Rockin' Wildcat; die Bestaetigung durch das Haus steht
  hier, damit sie beim Pruefen nachvollziehbar ist.
  NAME: Rockin' Wildcat und der Flyer des Hauses schreiben "Roadrunner's
  Rock & Motor Club", die Website selbst im Kopf "Roadrunner's Paradise
  Club". Der zweite Name steht bewusst NICHT in `aliases`, weil ihn nur
  die http-Fassung traegt; die Aliase sind Schreibvarianten des belegten
  Namens.
  TYP: `club` ist aus dem Namen und aus der Art der Termine abgeleitet und
  die schwaechste Angabe dieses Eintrags.
  KEIN `links.website`: Das Schema verlangt https, und genau die
  https-Fassung liefert ein Zertifikat, dem ein Browser nicht traut.
  Nicht gefuellt, weil nicht belegt: kapazitaet, tanzflaeche,
  barrierefrei, parken, oepnv, lat/lng.
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/jets-smokestack-lightnin
    titel: Jets / Smokestack Lightnin', 3. Oktober 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-27
    felder: [adresse, name, aliases, typ, kurzbeschreibung, body:haus, body:programm]
    art: aggregator
  - url: https://www.rockin-wildcat.com/rwc/guide
    titel: Berlin Gig Guide (Rockin' Wildcat)
    abgerufenAm: 2026-09-27
    felder: [adresse, name, body:programm]
    art: aggregator
---

Der Roadrunner's Rock & Motor Club ist ein Club in der Saarbrücker Straße 24 in Berlin-Prenzlauer Berg. Für die [Rockabilly](/lexikon/rockabilly/)- und [Rock-'n'-Roll](/lexikon/rocknroll/)-Szene in [Berlin](/regionen/berlin/) ist er einer der Orte, an denen Konzerte der Szene selbst stattfinden — etwa das Konzert von [The Jets und Smokestack Lightnin'](/events/jets-smokestack-lightnin-roadrunners-2026-10-03/) im Oktober 2026.

## Das Haus Roadrunner's

Die Adresse stammt aus dem Berliner Gig Guide von Rockin' Wildcat. Mehr als Name und Anschrift sagt diese Quelle über das Haus nicht; Kapazität, Tanzfläche und Barrierefreiheit bleiben deshalb offen. Die eigene Website des Clubs ist für diesen Eintrag nur eingeschränkt nutzbar, weil ihre verschlüsselte Fassung sich nicht prüfen lässt.

## Programm im Roadrunner's

Der Termin, für den dieser Eintrag angelegt ist, führt [Neorockabilly](/lexikon/neo-rockabilly/), Rockabilly, Roots und [Teddyboy](/lexikon/teddy-boy/)-Rock'n'Roll als Stilrichtungen. Anders als ein Haus mit breitem Programm, das der Szene einzelne Abende gibt, ist der Club schon dem Namen nach auf Rock 'n' Roll und Motoren ausgerichtet.
