import type { APIRoute } from "astro";
import { holeFreigegebeneRegistry } from "../lib/registry";
import { rssFeed } from "../lib/feeds";

export const GET: APIRoute = async () => {
  const registry = await holeFreigegebeneRegistry();
  return new Response(rssFeed(registry), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
