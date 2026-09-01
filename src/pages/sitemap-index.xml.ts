import type { APIRoute } from "astro";
import { sitemapIndexXml } from "../lib/feeds";
import { collectionNames } from "../content/_schemas";

export const GET: APIRoute = () =>
  new Response(
    sitemapIndexXml([
      ...collectionNames.map((t) => `/sitemap-${t}.xml`),
      "/sitemap-seiten.xml",
    ]),
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
