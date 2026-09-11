/**
 * Der Sitemap-Index. Genannt wird nur, was etwas enthaelt -- die Auswahl
 * trifft `sitemapDateien` in lib/feeds.ts, damit sie pruefbar ist.
 */
import type { APIRoute } from "astro";
import { holeFreigegebeneRegistry } from "../lib/registry";
import { sitemapIndexXml, sitemapDateien } from "../lib/feeds";

export const GET: APIRoute = async () =>
  new Response(sitemapIndexXml(sitemapDateien(await holeFreigegebeneRegistry())), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
