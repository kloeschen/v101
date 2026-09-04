---
name: Bayern
aliases: [Freistaat Bayern]
kurzbeschreibung: Bayern ist das flaechengroesste Bundesland Deutschlands; fuer die Vintage-Szene zaehlen hier vor allem mehrtaegige Veranstaltungen abseits der grossen Staedte.
status: entwurf
erstelltAm: 2026-09-04
geprueftAm: 2026-09-04
autor: markus
ebene: bundesland
land: DE
redaktionsnotiz: >-
  Traegereintrag fuer die Rockabilly Convention in Eging am See. Die
  Ebene ist bewusst das Bundesland und nicht der Regierungsbezirk
  Niederbayern, in dem der Ort tatsaechlich liegt: Das Schema kennt fuer
  `ebene` nur land, bundesland, metropolregion und stadt. Ein
  Regierungsbezirk passt in keine dieser Schubladen, und ein zu grosser
  Zuschnitt ist ehrlicher als ein falsch benannter.
  schwerpunkt bleibt auf dem Standardwert false: Ob Bayern ein
  Szeneschwerpunkt ist, laesst sich aus einer einzigen Veranstalterquelle
  nicht ableiten. lat/lng ungesetzt, weil nicht belegt.
quellen:
  - url: https://de.wikipedia.org/wiki/Bayern
    titel: Bayern (Wikipedia)
    abgerufenAm: 2026-09-04
    felder: [ebene, land, kurzbeschreibung, body:eckdaten]
    art: nachschlagewerk
  - url: https://www.pullmancity.de/events-shows-musik/events/rockabilly-convention
    titel: Rockabilly Convention (Pullman City)
    abgerufenAm: 2026-09-04
    felder: [body:szene]
    art: offiziell
---

Bayern ist das flächengrößte Bundesland Deutschlands und für die Vintage- und Rockabilly-Szene vor allem über mehrtägige Veranstaltungen präsent, die nicht in den großen Städten stattfinden, sondern auf Geländen im ländlichen Raum.

## Eckdaten zu Bayern

Der Freistaat umfasst nach Angaben der Wikipedia 70.541,57 Quadratkilometer und hatte am 31. Dezember 2025 rund 13,25 Millionen Einwohner, was einer Bevölkerungsdichte von 188 Einwohnern je Quadratkilometer entspricht. Landeshauptstadt ist München. Als Freistaat besteht Bayern seit dem 14. August 1919; die heutige Verfassung trat am 8. Dezember 1946 in Kraft, seit dem 23. Mai 1949 ist es Land der Bundesrepublik. Der ISO-Code lautet DE-BY.

## Szene in Bayern

Die Fläche erklärt eine Eigenheit, die für ein Terminregister praktisch folgenreich ist: Die niedrige Bevölkerungsdichte bedeutet, dass ein Publikum für ein mehrtägiges Format über weite Strecken anreist und deshalb Übernachtung braucht. Entsprechend sind die Veranstaltungen, die hier Bestand haben, eher Conventions und Festivals mit eigenem Gelände als Clubkonzerte mit Feierabendpublikum.

Ein Beispiel dafür ist die [Rockabilly Convention](/events/rockabilly-convention-2027/) in der Westernstadt [Pullman City](/locations/pullman-city/) in Eging am See, einem Ort im Landkreis Passau. Sie findet auf dem Gelände eines ganzjährig geöffneten Themenparks statt, der Eintritt, Parkplatz und Übernachtung selbst organisiert — ein Zuschnitt, den es in einer Großstadt so nicht gibt.

## Zuschnitt dieser Region

Dieser Eintrag führt Bayern als Ganzes, obwohl Eging am See in Niederbayern liegt. Das ist eine Entscheidung gegen einen falschen Zuschnitt und nicht für einen guten: Regierungsbezirke sind im Datenmodell dieses Registers nicht vorgesehen, und eine Region, die halb Bayern umfasst, sagt über die Anreise wenig. Wer den Eintrag später verfeinert, sollte bei Niederbayern oder beim Landkreis ansetzen — nicht bei einer weiteren Ebene über dem Bundesland.
