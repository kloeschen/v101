/**
 * Vorschaubild je Eintrag: /og/{collection}/{slug}.png
 *
 * Dieselbe Auswahl wie die Eintragsseiten selbst (`holeRegistry`): In der
 * Vorschau entstehen Bilder auch für Entwürfe, in der Produktion nur für
 * Freigegebenes. Was das Bild zeigt, steht in `src/lib/vorschaubild.ts`.
 */
import type { APIRoute } from "astro";
import { holeRegistry } from "../../../lib/registry";
import { SAMMLUNGSNAME } from "../../../lib/faktenblock";
import { vorschauFuer, zeichne } from "../../../lib/vorschaubild";
import { aufloesen, type EintragMeta } from "../../../lib/links";
import type { CollectionName } from "../../../content/_schemas";

export async function getStaticPaths() {
  const registry = await holeRegistry();
  return [...registry.eintraege.values()].map((e) => ({
    params: { typ: e.collection, slug: e.slug },
    props: { eintrag: e },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const e = props.eintrag as EintragMeta;
  const registry = await holeRegistry();
  const namen = (collection: string, slug: string) => aufloesen(registry, collection as CollectionName, slug)?.name;
  const png = await zeichne(vorschauFuer(e, SAMMLUNGSNAME[e.collection], namen));
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
