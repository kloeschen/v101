/**
 * Die einzige Stelle, an der Domain, Marke und externe Identität stehen.
 * Wird von JSON-LD, Sitemaps, Feeds und Canonicals gelesen.
 */

export const site = {
  /** Ohne Slash am Ende. */
  url: "https://v101.de",
  name: "Vintage 101",
  kurzbeschreibung:
    "Vintage 101 ist das Register der Vintage- und Rockabilly-Szene im deutschsprachigen Raum: Veranstaltungen, Bands, Locations und Läden — recherchiert, belegt und laufend geprüft.",
  sprache: "de-DE",
  /** Für Event-Zeitstempel. Ortszeit mit Offset schlägt UTC. */
  zeitzone: "Europe/Berlin",
  logo: "/assets/logo.png",

  /**
   * Externe Identitäten der Marke. Wird zu Organization.sameAs.
   * Nur eintragen, was existiert und auflöst — ein toter sameAs-Link
   * schwächt die Entitätserkennung, statt sie zu stärken.
   */
  sameAs: [
    // "https://www.wikidata.org/wiki/Q000000",
    // "https://www.instagram.com/…",
  ] as string[],

  /** Gründungsdatum der Marke, nicht des Projekts im Kopf. */
  gegruendet: "2026",

  /** Lizenz für die offenen Datenfeeds. Steht auch auf /daten/. */
  datenLizenz: "https://creativecommons.org/licenses/by/4.0/",
} as const;

/**
 * Globaler Indexierungsschalter.
 *
 * Bis genug Substanz da ist, soll die Site erreichbar, aber unindexiert
 * sein: Der erste Eindruck bei Crawlern ist schwer zu korrigieren, und ein
 * Register mit zwanzig Einträgen erzeugt keine Autorität. Umgestellt wird
 * über die Umgebungsvariable PUBLIC_INDEXIERBAR=true (Netlify-UI oder
 * netlify.toml), nicht im Code — so braucht es keinen Commit für den
 * Schalter und kein Zurückrollen, falls es zu früh war.
 */
export const indexierbar = umgebung("PUBLIC_INDEXIERBAR") === "true";

/**
 * Umgebungsvariable aus beiden Welten lesen.
 *
 * `import.meta.env` existiert nur unter Vite/Astro, `process.env` nur in
 * Node. site.config.ts wird aber von beiden importiert — von den Layouts
 * UND von jedem Skript in scripts/. Ein direkter Zugriff auf eine der
 * beiden Quellen bricht jeweils die andere Seite (genau die Falle, die
 * schon einmal bei facetten.ts zugeschlagen hat).
 */
export function umgebung(name: string): string | undefined {
  const vite = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (vite && name in vite) return vite[name];
  return typeof process !== "undefined" ? process.env?.[name] : undefined;
}

/** Stabile @id-Anker auf Site-Ebene. Nie ändern. */
export const siteIds = {
  organization: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  /** Das Lexikon als Ganzes ist ein DefinedTermSet. */
  lexikonSet: `${site.url}/lexikon/#termset`,
} as const;
