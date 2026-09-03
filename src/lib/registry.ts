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
import { istSichtbar } from "./sichtbarkeit";

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

let cache: Registry | null = null;

export async function holeRegistry(): Promise<Registry> {
  if (cache) return cache;

  const eingaben: RegistryEingabe[] = [];
  for (const name of collectionNames) {
    const eintraege = await getCollection(name as CollectionName);
    for (const e of eintraege) {
      if (!istSichtbar(e.data as any)) continue;
      eingaben.push({ collection: name, slug: e.id, daten: e.data as Record<string, any> });
    }
  }

  cache = buildRegistry(eingaben);
  return cache;
}
