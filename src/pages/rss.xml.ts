import type { APIRoute } from "astro";
import { holeRegistry } from "../lib/registry";
import { rssFeed } from "../lib/feeds";

export const GET: APIRoute = async () => {
  const registry = await holeRegistry();
  return new Response(rssFeed(registry), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
