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

/**
 * Im Build erscheinen nur veröffentlichte Einträge. In der Entwicklung ist
 * alles sichtbar, damit Entwürfe überhaupt begutachtet werden können.
 */
export function istSichtbar(daten: { status?: string }): boolean {
  if (import.meta.env.DEV) return true;
  return daten.status === "veroeffentlicht";
}

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
