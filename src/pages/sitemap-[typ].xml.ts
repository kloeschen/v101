/**
 * Eine Sitemap je Entitätstyp statt einer großen.
 *
 * Zwei Gründe: Die Search Console meldet Indexierungsprobleme pro Sitemap-
 * Datei, was die Fehlersuche erheblich verkürzt. Und ein Register wächst
 * ungleichmäßig — Events im Wochentakt, das Lexikon in Schüben.
 */
import type { APIRoute } from "astro";
import { holeFreigegebeneRegistry } from "../lib/registry";
import { sitemapXml, sitemapFuerCollection } from "../lib/feeds";
import { collectionNames, type CollectionName } from "../content/_schemas";

export async function getStaticPaths() {
  return collectionNames.map((typ) => ({ params: { typ } }));
}

export const GET: APIRoute = async ({ params }) => {
  const registry = await holeFreigegebeneRegistry();
  const eintraege = sitemapFuerCollection(registry, params.typ as CollectionName);
  return new Response(sitemapXml(eintraege), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
