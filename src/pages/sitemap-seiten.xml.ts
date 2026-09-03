/**
 * Statische Seiten und indexierbare Facetten.
 *
 * Nur was tatsächlich in den Index darf: Eine Sitemap, die noindex-Seiten
 * listet, sendet widersprüchliche Signale und kostet Crawl-Budget.
 */
import type { APIRoute } from "astro";
import { holeFreigegebeneRegistry } from "../lib/registry";
import { sammleFacetten, indexierbarkeit } from "../lib/facetten";
import { einleitungFuer } from "../lib/facetten-einleitungen";
import { sitemapXml } from "../lib/feeds";

export const GET: APIRoute = async () => {
  const registry = await holeFreigegebeneRegistry();
  const facetten = sammleFacetten(registry)
    .filter((f) => indexierbarkeit(f, einleitungFuer(f)).indexierbar)
    .map((f) => ({ pfad: f.pfad }));

  return new Response(sitemapXml([{ pfad: "/" }, { pfad: "/daten/" }, ...facetten]), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
