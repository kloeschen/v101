/**
 * Das Eventregister als JSON. CORS offen, damit es tatsächlich nachnutzbar
 * ist — eine Schnittstelle, die niemand abrufen kann, ist Dekoration.
 */
import type { APIRoute } from "astro";
import { holeRegistry } from "../../lib/registry";
import { eventFeed } from "../../lib/feeds";

export const GET: APIRoute = async () => {
  const registry = await holeRegistry();
  return new Response(JSON.stringify(eventFeed(registry), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
