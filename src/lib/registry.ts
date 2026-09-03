/**
 * Die Registry für den Astro-Build — einmal aufgebaut, dann wiederverwendet.
 *
 * Ohne den Cache baut jede der potenziell tausenden Seiten den kompletten
 * Index neu. Top-Level-Await in einem Modul reicht dafür: Vite lädt das Modul
 * einmal pro Build-Prozess.
 */

import { getCollection } from "astro:content";
import { buildRegistry, type Registry, type RegistryEingabe } from "./links";
import { collectionNames, type CollectionName } from "../content/_schemas";
import { istSichtbar, istFreigegeben } from "./sichtbarkeit";

/**
 * Im Build erscheinen nur veröffentlichte Einträge. Ausnahmen: die
 * Entwicklung (`astro dev`) und Umgebungen mit `PUBLIC_ENTWUERFE=true`, also
 * Deploy Previews und Branch-Deploys — dort sollen Entwürfe begutachtet
 * werden können.
 *
 * Die Regel selbst steht in `sichtbarkeit.ts` und wird von hier nur
 * weitergereicht. Grund: Dieses Modul importiert `astro:content` und ist
 * damit aus Node heraus nicht ladbar; die Regel wäre sonst nicht testbar
 * (siehe scripts/test-facetten.ts).
 */
export { istSichtbar };

let cacheSichtbar: Registry | null = null;
let cacheFreigegeben: Registry | null = null;

async function baue(nimm: (daten: { status?: string }) => boolean): Promise<Registry> {
  const eingaben: RegistryEingabe[] = [];
  for (const name of collectionNames) {
    const eintraege = await getCollection(name as CollectionName);
    for (const e of eintraege) {
      if (!nimm(e.data as any)) continue;
      eingaben.push({ collection: name, slug: e.id, daten: e.data as Record<string, any> });
    }
  }
  return buildRegistry(eingaben);
}

/**
 * Das Register für die gerenderten Seiten. Folgt `istSichtbar` und zeigt
 * damit in Vorschau und Branch-Deploy auch Entwürfe — gekennzeichnet durch
 * den Hinweis in EintragsListe.astro und im Entitätslayout.
 */
export async function holeRegistry(): Promise<Registry> {
  cacheSichtbar ??= await baue(istSichtbar);
  return cacheSichtbar;
}

/**
 * Das Register für alles, was den Bestand verlässt: JSON-Schnittstelle,
 * Kalenderabos, RSS, Sitemaps, llms.txt — und die Datenseite, die diese
 * Ausgaben beschreibt und verlinkt.
 *
 * Hier gilt ausschließlich `status: veroeffentlicht`, und zwar unabhängig
 * von PUBLIC_ENTWUERFE. Der Grund steht in ENTSCHEIDUNGEN.md: Die Feeds
 * stehen unter CC BY 4.0 frei zur Nachnutzung. Was sie verlässt, verliert
 * den Kontext, der es als Entwurf kennzeichnet — ein Termin, der aus
 * /api/events.json in einen fremden Kalender wandert, trägt keinen Hinweis
 * mehr. Eine offene Schnittstelle enthält nur, was gilt.
 *
 * Zwei Register statt eines Filters an jeder Ausgabe: So sind auch die
 * Rückverweise in sich stimmig. Ein veröffentlichtes Event, dessen Location
 * noch Entwurf ist, verweist im Feed auf nichts Halbes.
 */
export async function holeFreigegebeneRegistry(): Promise<Registry> {
  cacheFreigegeben ??= await baue(istFreigegeben);
  return cacheFreigegeben;
}
