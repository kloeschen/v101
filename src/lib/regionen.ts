/**
 * regionen.ts — wann eine Regionsseite in den Index gehört.
 *
 * Regionsseiten entstehen in diesem Register selten aus einem Vorsatz, sondern
 * aus einer Schemafolge: `ort` ist im Eventschema Pflicht und zeigt auf
 * `locations`, dort ist `region` wieder Pflicht. Ein einziger neuer Termin
 * zieht also zwangsläufig eine Location und eine Region nach. Alle fünf heute
 * angelegten Regionen sind so entstanden und nennen sich in ihrer
 * Redaktionsnotiz selbst „Trägereintrag".
 *
 * Für den Leser ist so eine Seite kein Schaden: Sie sammelt, was in der Region
 * liegt, und bleibt der Einstieg dorthin. Für den Index ist sie einer, solange
 * sie auf einen einzigen Termin zeigt — dann ist sie der Umweg zu diesem
 * Termin, und die kanonische Adresse der Sache ist die Eventseite.
 *
 * DIE SCHWELLE ZÄHLT DEN BESTAND, NICHT DEN TEXT. Wer sie nicht erreicht,
 * bekommt `noindex, follow` und fällt aus der Sitemap. Erreichbar bleibt die
 * Seite, verlinkt bleibt sie auch, und ihre Linkkraft gibt sie weiter — sie
 * steht nur nicht im Index. Dieselbe Konstruktion wie bei den Facetten
 * (`facetten.ts`), nur an einer Entität statt an einer Facette.
 *
 * WARUM KEIN ZWEITER ARM ÜBER DEN TEXT. Vorgesehen war ursprünglich ein ODER:
 * drei Einträge oder eigener Fließtext über der Mindestlänge. Der zweite Arm
 * lässt sich hier nicht als Regel bauen, weil er nie falsch werden kann:
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
 * Ein ODER mit einem immer wahren Arm ergibt nie ein noindex — eine Prüfung,
 * die ihren Gegenstand nie zu sehen bekommt (Lektion 19). Und eine höhere
 * Textgrenze hilft nicht: Gemessen tragen die fünf Regionen 239 bis 259 eigene
 * Wörter, das Golden Example 229. Jede Grenze, die anschlägt, verurteilt das
 * Golden Example mit. Ausführlich in ENTSCHEIDUNGEN.md.
 *
 * `scripts/test-regionen.ts` hält diese Begründung als Bedingung fest: Sinkt
 * das erzwungene Mindestmaß, wird der Lauf rot und sagt, dass ein Textarm
 * wieder baubar und die Entscheidung neu zu treffen ist.
 *
 * ZWEI ENTSCHEIDUNGEN IN DER ZÄHLUNG, beide mit Gegenfall im Test belegt:
 *
 * **Entwürfe zählen nicht mit.** Die Schwelle ist eine Aussage über den Index,
 * und in den Index kommt nur, was freigegeben ist. Zählte sie, was in der
 * Vorschau sichtbar ist, gäbe dieselbe Region in Vorschau und Produktion zwei
 * verschiedene Antworten — und die Vorschau verspräche eine Indexierbarkeit,
 * die die Produktion nicht einlöst (Lektion 9). Damit die Zahl in der Vorschau
 * nicht rätselhaft wirkt, nennt der Grund die Entwürfe ausdrücklich: Er sagt,
 * wie viele Freigaben fehlen, nicht nur, dass welche fehlen.
 *
 * **Die Region zählt sich nicht selbst.** Gezählt wird, was auf sie zeigt. Sie
 * selbst ist nicht *in* der Region, sie *ist* die Region; ein Selbstzähler
 * wäre nur ein verschobener Schwellenwert.
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
 * Diese Zahl entscheidet nichts, sie erklärt: Sie steht im Grund neben der
 * Bestandslücke, damit sichtbar bleibt, dass der Seite Bestand fehlt und nicht
 * Text — und die Abhilfe damit Recherche ist, nicht Schreiben.
 */
export function eigenerText(body = ""): string {
  const absaetze = body.trim().split(/\n\s*\n/);
  return absaetze.slice(1).join("\n\n");
}

/**
 * Was zeigt auf diese Region — und was davon ist freigegeben?
 *
 * Beide Zahlen, weil der Grund beide braucht. „0 von 3" allein ließe einen
 * Redakteur ratlos vor einer Seite stehen, auf der in der Vorschau zwei
 * Einträge stehen.
 */
export function regionsBestand(
  registry: Registry,
  slug: string,
): { alle: EintragMeta[]; freigegeben: EintragMeta[] } {
  const alle = eingehendeVerweise(registry, "regionen", slug, { nurFeld: "region" }).map((v) => v.von);
  return { alle, freigegeben: alle.filter((e) => istFreigegeben(e.daten)) };
}

/**
 * Gehört diese Regionsseite in den Index?
 *
 * Gleiche Form wie `indexierbarkeit()` in facetten.ts: Der Grund ist Teil der
 * Antwort, nicht nur das Urteil. Er erscheint in der Entwicklungsansicht und
 * im Bericht von `npm run stale` — sonst wäre das noindex eine stille
 * Entscheidung, die niemand zurücknimmt.
 *
 * `body` ist optional und ändert das Urteil nicht. Er reichert nur den Grund
 * an: Wer die Seite vor sich hat, soll sehen, dass ihr Bestand fehlt und nicht
 * Text. Die Sitemap hat keinen Rumpf zur Hand und braucht ihn auch nicht.
 */
export function regionsIndexierbarkeit(
  registry: Registry,
  slug: string,
  body?: string,
): { indexierbar: boolean; grund?: string } {
  const { alle, freigegeben } = regionsBestand(registry, slug);
  if (freigegeben.length >= MIN_REGION_EINTRAEGE) return { indexierbar: true };

  const entwuerfe = alle.length - freigegeben.length;
  const worte = body === undefined ? null : zaehleWorte(eigenerText(body));
  return {
    indexierbar: false,
    grund:
      `${freigegeben.length} von ${MIN_REGION_EINTRAEGE} freigegebenen Einträgen` +
      (entwuerfe > 0 ? ` (${entwuerfe} als Entwurf vorhanden)` : "") +
      (worte === null ? "" : ` — die Seite trägt ${worte} eigene Wörter, ihr fehlt Bestand, nicht Text`),
  };
}

/**
 * Fällt dieser Eintrag als Region unter der Schwelle aus dem Index?
 *
 * Für alles, was keine Region ist, immer `false`. So lässt sich die Frage an
 * Stellen stellen, die über alle Collections laufen — die Sitemap etwa —, ohne
 * dass dort eine Fallunterscheidung entsteht.
 */
export function istDuenneRegion(registry: Registry, eintrag: EintragMeta): boolean {
  if (eintrag.collection !== "regionen") return false;
  return !regionsIndexierbarkeit(registry, eintrag.slug).indexierbar;
}
