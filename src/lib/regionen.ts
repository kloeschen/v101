/**
 * regionen.ts — der Bestand einer Region, und warum daraus kein noindex wird.
 *
 * Regionsseiten entstehen in diesem Register selten aus einem Vorsatz, sondern
 * aus einer Schemafolge: `ort` ist im Eventschema Pflicht und zeigt auf
 * `locations`, dort ist `region` wieder Pflicht. Ein einziger neuer Termin
 * zieht also zwangsläufig eine Location und eine Region nach. Alle fünf heute
 * angelegten Regionen sind so entstanden und nennen sich in ihrer
 * Redaktionsnotiz selbst „Trägereintrag".
 *
 * DIE SCHWELLE, DIE HIER STEHEN SOLLTE, IST NICHT GEBAUT. Verlangt war: drei
 * Einträge ODER eigener Fließtext über der Mindestlänge, sonst `noindex,
 * follow`. Der zweite Arm lässt sich in diesem Repo nicht als Regel bauen,
 * weil er nie falsch werden kann:
 *
 *   - `mindestlaenge` in validate-content.ts verlangt für Regionen 250 Wörter
 *     Fließtext, als Fehler, für jeden Status. Belegt: eine auf 18 Wörter
 *     gekürzte Regionsdatei fällt mit genau dieser Meldung durch.
 *   - `kapsel-vorhanden` deckelt die Antwortkapsel bei 90 Wörtern (Warnung,
 *     unter `--strict` also in CI und Freigabe blockierend).
 *   - Daraus folgt zwingend: Jede Region, die die Prüfkette besteht, trägt
 *     mindestens 160 Wörter über die Kapsel hinaus. Der zweite Arm fragt nach
 *     150. Er ist für jede Region wahr, die es überhaupt geben kann.
 *
 * Ein ODER, dessen zweiter Arm immer wahr ist, ergibt nie ein noindex. Die
 * Regel wäre eine Prüfung, die ihren Gegenstand nie zu sehen bekommt — genau
 * die Bauart, an der dieses Projekt schon zweimal hängengeblieben ist
 * (Lektion 19). Gemessen statt vermutet: Die fünf Regionen tragen 239 bis 259
 * eigene Wörter, das Golden Example 229. Es gibt zwischen dem erzwungenen
 * Mindestmaß und der gelebten Praxis keinen Zahlenwert, der Dünnes von Gutem
 * trennt — jede Grenze, die anschlägt, verurteilt das Golden Example mit.
 *
 * Bleibt der erste Arm allein. Der schlägt heute bei allen fünf Regionen an
 * und würde damit genau die Seiten aus dem Index nehmen, die den meisten
 * eigenen, belegten Regionaltext im Register tragen. Das ist die Umkehrung
 * dessen, was die Schwelle bewirken sollte, und keine Entscheidung, die
 * nebenbei fällt. Ausführlich in ENTSCHEIDUNGEN.md.
 *
 * WAS STATTDESSEN GEBAUT IST: dieselbe Zählung, aber als redaktioneller
 * Posten statt als Indexentscheidung. „Diese Region führt einen einzigen
 * freigegebenen Eintrag" ist eine brauchbare Aufgabe — sie sagt, wo Recherche
 * fehlt. „Diese Region gehört nicht in den Index" ist eine Behauptung über
 * Thin Content, die die Messung nicht trägt.
 */

import type { EintragMeta, Registry } from "./links";
import { eingehendeVerweise } from "./links";
import { zaehleWorte } from "./facetten";
import { istFreigegeben } from "./sichtbarkeit";

/**
 * Ab wann trägt sich eine Regionsseite aus ihrem Bestand?
 *
 * Drei, nicht fünf wie bei den Facetten. Eine Facette ist eine Auswahl aus
 * einem Bestand und braucht eine Menge, um überhaupt eine Auswahl zu sein.
 * Eine Region ist ein Ort — drei belegte Einträge dort sind bereits eine
 * Auskunft, die es sonst nirgends gibt.
 */
export const MIN_REGION_EINTRAEGE = 3;

/**
 * Der Fließtext ohne die Antwortkapsel.
 *
 * Die Kapsel ist der erste Absatz und per Konvention die ausformulierte
 * `kurzbeschreibung` — sie steht dort für die Extraktion, nicht als Inhalt.
 * Was danach kommt, ist der eigene Beitrag der Seite.
 *
 * Diese Zahl entscheidet nichts (siehe oben), sie erklärt: Sie steht im
 * Bericht neben der Bestandslücke, damit sichtbar ist, dass eine Region mit
 * wenig Bestand trotzdem etwas zu sagen haben kann.
 */
export function eigenerText(body = ""): string {
  const absaetze = body.trim().split(/\n\s*\n/);
  return absaetze.slice(1).join("\n\n");
}

/**
 * Was zeigt auf diese Region — und was davon ist freigegeben?
 *
 * Beide Zahlen, weil die Auskunft beide braucht. „Ein Eintrag" allein ließe
 * einen Redakteur ratlos vor einer Seite stehen, auf der in der Vorschau drei
 * stehen.
 *
 * Gezählt wird, was auf die Region zeigt — die Region selbst nicht. Sie ist
 * nicht *in* der Region, sie *ist* die Region; ein Selbstzähler wäre nur ein
 * verschobener Schwellenwert.
 *
 * Und gezählt wird nur, was freigegeben ist. Der Bestand einer Region ist
 * das, was ein Leser tatsächlich vorfindet, und in der Produktion existieren
 * Entwürfe nicht. Zählte die Vorschau anders, gäbe dieselbe Region je nach
 * Umgebung zwei verschiedene Antworten (Lektion 9).
 */
export function regionsBestand(
  registry: Registry,
  slug: string,
): { alle: EintragMeta[]; freigegeben: EintragMeta[] } {
  const alle = eingehendeVerweise(registry, "regionen", slug, { nurFeld: "region" }).map((v) => v.von);
  return { alle, freigegeben: alle.filter((e) => istFreigegeben(e.daten)) };
}

/**
 * Führt diese Region zu wenig, um mehr zu sein als der Umweg zu einem Termin?
 *
 * Ein redaktioneller Posten, keine Indexentscheidung: Die Antwort landet in
 * `npm run stale` und sonst nirgends. Sie wird nur für freigegebene Regionen
 * gestellt — solange die Region selbst noch Entwurf ist, steht sie ohnehin in
 * der Warteschlange, und zwei Posten für denselben Zustand machen den Bericht
 * nur länger.
 */
export function bestandsLuecke(
  eintrag: { collection: string; slug: string; daten: Record<string, any> | null; body: string },
  registry: Registry,
): { luecke: boolean; grund?: string } {
  if (eintrag.collection !== "regionen") return { luecke: false };
  if (!eintrag.daten || !istFreigegeben(eintrag.daten)) return { luecke: false };

  const { alle, freigegeben } = regionsBestand(registry, eintrag.slug);
  if (freigegeben.length >= MIN_REGION_EINTRAEGE) return { luecke: false };

  const entwuerfe = alle.length - freigegeben.length;
  const worte = zaehleWorte(eigenerText(eintrag.body));
  return {
    luecke: true,
    grund:
      `${freigegeben.length} von ${MIN_REGION_EINTRAEGE} freigegebenen Einträgen` +
      (entwuerfe > 0 ? ` (${entwuerfe} als Entwurf vorhanden)` : "") +
      ` — die Seite trägt ${worte} eigene Wörter, ihr fehlt Bestand, nicht Text`,
  };
}
