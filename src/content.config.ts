/**
 * Astro Content Collections (Astro 7, Zod 4).
 *
 * Bewusst dünn: die Schemas leben in src/content/_schemas.ts, damit Build,
 * Validator-Skripte, CI und Hooks dieselbe Definition verwenden.
 */

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { collectionSchemas, collectionNames, type CollectionName } from "./content/_schemas";

/** `_`-Präfix schließt Golden Examples und Schnipsel vom Build aus. */
const pattern = ["**/*.md", "!**/_*.md"];

function sammlung(name: CollectionName) {
  return defineCollection({
    loader: glob({ pattern, base: `./src/content/${name}` }),
    schema: collectionSchemas[name],
  });
}

export const collections = Object.fromEntries(
  collectionNames.map((name) => [name, sammlung(name)]),
) as Record<CollectionName, ReturnType<typeof sammlung>>;

/**
 * Hinweis zu `reference()`:
 * Astros reference() prüft Slugs zur Build-Zeit, kann aber keine
 * kollektionsübergreifenden Felder abbilden (artikel.hauptentitaet) und
 * liefert schlechtere Fehlermeldungen als der eigene Validator. Deshalb
 * laufen alle Referenzprüfungen zentral in scripts/validate-content.ts.
 * Wer für einzelne Felder trotzdem Build-Abbrüche will, überschreibt sie
 * hier gezielt, z. B.:
 *
 *   schema: collectionSchemas.events.extend({
 *     lineupBands: z.array(reference("bands")).default([]),
 *   })
 */
