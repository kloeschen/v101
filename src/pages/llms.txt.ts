/**
 * llms.txt — kuratierter Einstiegsindex.
 *
 * Erwartungshaltung ehrlich halten: Die großen KI-Crawler rufen diese Datei
 * derzeit praktisch nicht ab, sie holen HTML. Sie kostet aber nichts, und die
 * Feeds oben im Dokument sind ohnehin das, was Agenten wirklich brauchen.
 */
import type { APIRoute } from "astro";
import { holeRegistry } from "../lib/registry";
import { llmsTxt } from "../lib/feeds";

export const GET: APIRoute = async () => {
  const registry = await holeRegistry();
  return new Response(llmsTxt(registry), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
