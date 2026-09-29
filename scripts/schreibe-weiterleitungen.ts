#!/usr/bin/env -S npx tsx
/**
 * schreibe-weiterleitungen.ts — ergänzt `dist/_redirects` nach dem Build um
 * die 301-Regeln für alte Pfade von v101.de, deren Sache es jetzt gibt.
 *
 * ANLASS: Entscheidung Markus, 2026-09-29: Alte Kategorie-, Themen- und
 * Jahrzehntseiten bleiben 404, bis es einen Eintrag zu derselben Sache gibt
 * — dann sollen sie „automatisch richtig weiterleiten". Von Hand gepflegt
 * würde die Weiterleitung beim Freigeben vergessen; deshalb entsteht sie
 * hier, bei jedem Build, aus dem, was gebaut ist.
 *
 * Die Regel: Ein alter Pfad `/c/<x>`, `/c/<kategorie>/<x>`, `/thema/<x>`
 * oder `/jahrzehnt/<x>` zeigt auf `/lexikon/<slug>/`, wenn
 *   - `<x>` der Slug oder ein Alias (in Slug-Form) genau eines
 *     Lexikoneintrags ist, oder in `ZUORDNUNG` steht, und
 *   - der Build diese Seite hat. In der Produktion baut Astro nur
 *     Freigegebenes; ein Entwurf leitet dort also nicht um.
 * Tiefere Pfade (Kombinationen mit Schlagwort oder Jahrzehnt, Folgeseiten)
 * leiten nie weiter — sie tragen 410 aus `public/_redirects`.
 *
 * Gleicher Name heißt hier gleiche Sache. Wo das nicht stimmt, gehört der
 * Pfad in `AUSGESCHLOSSEN`, mit Grund; wo die Sache gleich ist, der Name aber
 * nicht, in `ZUORDNUNG`.
 *
 *   npx tsx scripts/schreibe-weiterleitungen.ts [dist]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ladeAlle } from "./_laden";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ALTLISTE = path.join(PROJEKT, "docs/daten/v101-alte-urls.txt");
export const MARKE = "# --- automatisch: schreibe-weiterleitungen.ts ---";

/** Gleiche Sache, anderer Name. Alter Pfad → Lexikon-Slug. */
export const ZUORDNUNG: Record<string, string> = {
  // Plural der Shop-Kategorie; der Eintrag führt keinen Alias „Petticoats".
  "/c/petticoats": "petticoat",
  // Entscheidung Markus, 2026-09-29. Das Schlagwort trug auch Kleider in
  // Bleistiftform; die Sache ist die Silhouette, und die erklärt der Eintrag.
  "/thema/pencil": "bleistiftrock",
};

/** Gleicher Name, andere Sache — nie automatisch weiterleiten. Pfad → Grund. */
export const AUSGESCHLOSSEN: Record<string, string> = {};

/** Slug-Form wie in den Pfaden der alten Seite: klein, Umlaute ausgeschrieben. */
export function slugForm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Der Schlüssel eines alten Pfads, oder null, wenn er nie weiterleitet. */
export function schluessel(pfad: string): string | null {
  const s = pfad.split("/").filter(Boolean);
  if (s[0] === "c" && (s.length === 2 || s.length === 3)) return s[s.length - 1];
  if ((s[0] === "thema" || s[0] === "jahrzehnt") && s.length === 2) return s[1];
  return null;
}

export interface Begriff {
  slug: string;
  aliases: string[];
}

export interface Ergebnis {
  regeln: { von: string; nach: string; grund: string }[];
  /** Zuordnungen, deren Ziel (noch) nicht gebaut ist. */
  wartend: string[];
  /** Pfade, deren Schlüssel mehrere Einträge trifft — bewusst ohne Regel. */
  mehrdeutig: string[];
}

export function automatischeRegeln(
  alt: string[],
  begriffe: Begriff[],
  gebaut: (pfad: string) => boolean,
): Ergebnis {
  const nachSchluessel = new Map<string, Set<string>>();
  for (const b of begriffe) {
    for (const k of [b.slug, ...b.aliases.map(slugForm)]) {
      if (!k) continue;
      if (!nachSchluessel.has(k)) nachSchluessel.set(k, new Set());
      nachSchluessel.get(k)!.add(b.slug);
    }
  }
  const regeln: Ergebnis["regeln"] = [];
  const wartend: string[] = [];
  const mehrdeutig: string[] = [];
  const gesehen = new Set<string>();

  for (const roh of alt) {
    const pfad = "/" + roh.split("/").filter(Boolean).join("/");
    if (gesehen.has(pfad) || AUSGESCHLOSSEN[pfad]) continue;
    gesehen.add(pfad);

    let slug: string | undefined;
    let grund = "";
    if (ZUORDNUNG[pfad]) {
      slug = ZUORDNUNG[pfad];
      grund = "Zuordnung";
    } else {
      const k = schluessel(pfad);
      const treffer = k ? nachSchluessel.get(k) : undefined;
      if (!treffer) continue;
      if (treffer.size > 1) {
        mehrdeutig.push(`${pfad} → ${[...treffer].join(", ")}`);
        continue;
      }
      slug = [...treffer][0];
      grund = "gleicher Name";
    }
    const nach = `/lexikon/${slug}/`;
    if (gebaut(nach)) regeln.push({ von: pfad, nach, grund });
    else if (grund === "Zuordnung") wartend.push(`${pfad} → ${nach}`);
  }
  return { regeln, wartend, mehrdeutig };
}

/** Die Zeilen, die vor den Inhalt von `public/_redirects` kommen. */
export function alsText(regeln: Ergebnis["regeln"]): string {
  const von = Math.max(0, ...regeln.map((r) => r.von.length)) + 2;
  const nach = Math.max(0, ...regeln.map((r) => r.nach.length)) + 2;
  return [
    MARKE,
    "# 301 für alte Pfade, deren Sache das Lexikon jetzt führt. Entsteht bei",
    "# jedem Build aus dem, was gebaut ist — nicht von Hand bearbeiten.",
    ...regeln.map((r) => `${r.von.padEnd(von)}${r.nach.padEnd(nach)}301   # ${r.grund}`),
    "# --- Ende automatisch ---",
    "",
  ].join("\n");
}

function main() {
  const dist = path.resolve(process.argv[2] ?? "dist");
  const ziel = path.join(dist, "_redirects");
  if (!existsSync(ziel)) {
    console.error(`${ziel} fehlt — Astro kopiert public/_redirects; wurde gebaut?`);
    process.exit(1);
  }
  const statisch = readFileSync(ziel, "utf8");
  if (statisch.includes(MARKE)) {
    console.error(`${ziel} ist schon ergänzt — zweimal aufgerufen?`);
    process.exit(1);
  }
  const alt = readFileSync(ALTLISTE, "utf8").split("\n").map((z) => z.trim()).filter((z) => z && !z.startsWith("#"));
  const begriffe = ladeAlle({ collection: "lexikon" })
    .filter((e) => !e.slug.startsWith("_"))
    .map((e) => ({ slug: e.slug, aliases: ((e.roh.aliases as string[] | undefined) ?? []).map(String) }));
  const gebaut = (p: string) => existsSync(path.join(dist, p, "index.html"));

  const e = automatischeRegeln(alt, begriffe, gebaut);
  writeFileSync(ziel, alsText(e.regeln) + "\n" + statisch);
  console.log(`dist/_redirects: ${e.regeln.length} automatische 301 vor ${statisch.split("\n").length} Zeilen aus public/_redirects`);
  for (const w of e.wartend) console.log(`  wartet   ${w} (Ziel nicht gebaut)`);
  for (const m of e.mehrdeutig) console.log(`  HINWEIS  mehrdeutig, keine Regel: ${m}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
