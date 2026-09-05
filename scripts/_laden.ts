/**
 * Gemeinsamer Loader für alle Skripte in scripts/.
 * Astro liest den Content über seine Collections; die CLI-Skripte lesen ihn
 * hier — beide gegen dieselben Schemas aus src/content/_schemas.ts.
 */

import { readFileSync, existsSync, realpathSync } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { collectionSchemas, collectionNames, type CollectionName } from "../src/content/_schemas";

export const WURZEL = path.resolve(process.cwd(), "src/content");

/**
 * Symlinkaufgelöst, soweit der Pfad existiert — sonst unverändert.
 *
 * `process.cwd()` liefert den aufgelösten Pfad, ein von außen übergebener
 * Dateipfad nicht. Beide Schreibweisen desselben Verzeichnisses ergeben in
 * `path.relative()` ein `..`, und die Datei fällt unten aus der Liste — und
 * zwar lautlos, mit der Meldung „Nichts zu prüfen".
 *
 * Genau das ist passiert: Der PostToolUse-Test baut sein Prüfprojekt unter
 * `os.tmpdir()`. Auf macOS ist das `/var/folders/…`, und `/var` zeigt auf
 * `/private/var`. Der Hook hat deshalb seit seiner Entstehung nichts geprüft
 * und Erfolg gemeldet. Auf Linux fiel es nicht auf, weil es dort keinen
 * solchen Symlink gibt.
 *
 * Es ist kein reines Testproblem: Wer sein Repo über einen Symlink erreicht,
 * bekommt denselben stillen Durchlauf.
 */
function echterPfad(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
}

const WURZEL_ECHT = echterPfad(WURZEL);

export interface GeladenerEintrag {
  datei: string;
  collection: CollectionName;
  slug: string;
  /** Ungeprüftes Frontmatter — immer vorhanden. */
  roh: Record<string, unknown>;
  /** Geprüftes Frontmatter — null, wenn das Schema fehlschlug. */
  daten: Record<string, any> | null;
  body: string;
}

export function ladeAlle(optionen: { collection?: CollectionName; dateien?: string[] } = {}): GeladenerEintrag[] {
  const dateien = optionen.dateien?.length
    ? optionen.dateien
        .map((d) => path.resolve(d))
        // Hooks und CI reichen auch Pfade gelöschter oder verschobener
        // Dateien durch — das darf kein Absturz sein, sondern ist schlicht
        // nichts zu prüfen.
        .filter((d) => existsSync(d))
    : fg.sync(`${optionen.collection ?? "*"}/**/*.md`, {
        cwd: WURZEL,
        absolute: true,
        ignore: ["**/_*.md"],
      });

  const aus: GeladenerEintrag[] = [];
  for (const datei of dateien) {
    const rel = path.relative(WURZEL_ECHT, echterPfad(datei));
    if (rel.startsWith("..")) continue;
    const collection = rel.split(path.sep)[0] as CollectionName;
    if (!collectionNames.includes(collection)) continue;
    if (path.basename(datei).startsWith("_")) continue;

    const roh = matter(readFileSync(datei, "utf8"));
    const parsed = collectionSchemas[collection].safeParse(roh.data);
    aus.push({
      datei,
      collection,
      slug: path.basename(datei, ".md"),
      roh: roh.data as Record<string, unknown>,
      daten: parsed.success ? (parsed.data as Record<string, any>) : null,
      body: roh.content,
    });
  }
  return aus;
}

/** Nur die schemakonformen Einträge, im Format der Registry. */
export function alsRegistryEingaben(eintraege: GeladenerEintrag[]) {
  return eintraege
    .filter((e) => e.daten !== null)
    .map((e) => ({ collection: e.collection, slug: e.slug, daten: e.daten! }));
}
