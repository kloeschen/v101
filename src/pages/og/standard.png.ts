/**
 * Das Vorschaubild für alle Seiten ohne eigenes: Start, Listen, Facetten,
 * Methodik. Zeigt die Wortmarke und den Satz, was das Register ist.
 */
import type { APIRoute } from "astro";
import { zeichne } from "../../lib/vorschaubild";

export const GET: APIRoute = async () => {
  const png = await zeichne({
    sammlung: "Register",
    titel: "Veranstaltungen, Bands, Orte und Begriffe der Vintage- und Rockabilly-Szene",
    zeile: "Recherchiert, belegt und laufend geprüft",
  });
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
