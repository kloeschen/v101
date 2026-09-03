/**
 * Kalenderabos: /kalender/alle.ics und je Region /kalender/{region}.ics
 *
 * Eigener Pfad statt /regionen/{slug}/events.ics, damit sich die Route nicht
 * mit den Entitätsseiten überschneidet.
 */
import type { APIRoute } from "astro";
import { holeFreigegebeneRegistry } from "../../lib/registry";
import { icsKalender } from "../../lib/feeds";
import { site } from "../../site.config";

export async function getStaticPaths() {
  const registry = await holeFreigegebeneRegistry();
  const regionen = [...registry.eintraege.values()].filter((e) => e.collection === "regionen");
  return [
    { params: { bereich: "alle" }, props: { region: null } },
    ...regionen.map((r) => ({ params: { bereich: r.slug }, props: { region: r } })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const registry = await holeFreigegebeneRegistry();
  const region = (props as any).region;

  const events = [...registry.eintraege.values()]
    .filter((e) => e.collection === "events")
    .filter((e) => !region || e.daten.region === region.slug)
    .sort((a, b) => +new Date(a.daten.beginn) - +new Date(b.daten.beginn));

  const titel = region ? `${site.name} — ${region.name}` : site.name;

  return new Response(icsKalender(registry, events, titel), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
