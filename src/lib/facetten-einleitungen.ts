/**
 * Redaktionelle Einleitungen für Facettenseiten.
 *
 * Bewusst keine Content Collection: Diese Texte haben kein Frontmatter, keine
 * Belegkette und keinen Lebenszyklus — sie gehören nicht in den Datenvertrag.
 * Eine Datei unter src/facetten/{collection}/{segment}/{wert}.md genügt.
 *
 * Eigenes Modul, weil `import.meta.glob` nur unter Vite existiert. So bleibt
 * facetten.ts in Node-Skripten und Tests importierbar.
 */

import type { Facettenseite } from "./facetten";

const EINLEITUNGEN = import.meta.glob<string>("/src/facetten/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export function einleitungFuer(seite: Facettenseite): string | undefined {
  return EINLEITUNGEN[`/src/facetten/${seite.collection}/${seite.segment}/${seite.wert}.md`];
}
