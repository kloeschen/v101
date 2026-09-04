---
name: Alte Feuerwache Friedrichshain
aliases: [Alte Feuerwache, Kulturhaus Alte Feuerwache]
kurzbeschreibung: Die Alte Feuerwache in Berlin-Friedrichshain ist ein Kulturhaus mit breitem Programm, in dem regelmaessig Record Hops der Berliner Rock-'n'-Roll-Szene stattfinden.
status: entwurf
erstelltAm: 2026-09-04
geprueftAm: 2026-09-04
autor: markus
typ: gemeindehaus
adresse:
  strasse: Marchlewskistraße 6
  plz: "10243"
  ort: Berlin
  land: DE
region: berlin
redaktionsnotiz: >-
  Traegereintrag fuer das Event "Record Hop" am 2026-09-25. Die Adresse
  stammt aus dem JSON-LD des Veranstaltungshinweises bei Rockin' Wildcat,
  wo sie als `location.address` in einer einzigen Zeichenkette steht
  ("Marchlewskistr. 6, 10243 Berlin-Friedrichshain"). Ich habe sie in die
  Felder des Schemas zerlegt und dabei die abgekuerzte Strassenform
  ausgeschrieben -- das ist eine Normalisierung, keine Recherche.
  "Berlin-Friedrichshain" ist als Ortsteil im Feld `ort` nicht abbildbar;
  dort steht Berlin, der Ortsteil steht im Fliesstext.
  Nicht gefuellt, weil an den geoeffneten Quellen nicht belegt:
  kapazitaet, tanzflaeche, barrierefrei, parken, oepnv, lat/lng. Gerade
  `tanzflaeche` waere fuer einen Tanzabend das interessanteste Feld des
  ganzen Eintrags und ist genau das, was keine der beiden Quellen sagt.
  Das Haus fuehrt sich selbst als "Kulturhaus"; im Schema gibt es dafuer
  keinen Wert. `gemeindehaus` ist die naechstliegende Wahl und trifft es
  nur ungefaehr.
quellen:
  - url: https://www.rockin-wildcat.com/rwc/events/record-hop-60
    titel: Record Hop, 25. September 2026 (Rockin' Wildcat)
    abgerufenAm: 2026-09-04
    felder: [adresse, name, body:haus]
    art: offiziell
  - url: https://www.alte-feuerwache-friedrichshain.de/
    titel: Alte Feuerwache — Kulturhaus Friedrichshain
    abgerufenAm: 2026-09-04
    felder: [name, typ, kurzbeschreibung, body:haus, body:programm]
    art: offiziell
---

Die Alte Feuerwache in Berlin-Friedrichshain ist ein Kulturhaus, das sich selbst so bezeichnet und ein Programm quer durch alle Sparten fährt. Für die Rock-'n'-Roll-Szene ist sie einer der Orte, an denen regelmäßig [Record Hops](/events/record-hop-alte-feuerwache-2026-09-25/) stattfinden — Tanzabende mit Plattenauflegern statt Livemusik.

## Das Haus

Das Haus liegt in der Marchlewskistraße 6 in 10243 Berlin. Die Adresse ist die einzige Angabe, die beide von mir geöffneten Quellen übereinstimmend nennen; die Terminliste von Rockin' Wildcat führt sie als Ortsangabe zum Record Hop, die Seite des Hauses selbst als Absender. Ein Bezirksname taucht nur in der Szene-Quelle auf, und zwar als Teil derselben Zeichenkette.

## Programm

Der eigene Veranstaltungskalender zeigt beim Abruf am 4. September 2026 ein Programm, das mit Rockabilly wenig zu tun hat: Gesprächsabende, Ausstellungen, Nachbarschaftsformate. Die Tanzabende sind ein Teil davon, kein Schwerpunkt. Für ein Register heißt das, dass dieser Ort über die Veranstalterlisten der Szene gefunden werden muss und nicht über das Haus — wer nur die eigene Seite liest, sieht die Szene dort nicht. Das ist bei Kulturhäusern in [Berlin](/regionen/berlin/) eher die Regel als die Ausnahme und einer der Gründe, warum Ortseinträge und Termine getrennt gepflegt werden.
