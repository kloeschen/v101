/**
 * sichtbarkeit.ts — wer kommt ins Register, und wer nicht.
 *
 * Die Frage wird an zwei Orten gestellt, die verschiedene Laufzeiten haben:
 * von `registry.ts` im Astro-Build und von den Tests in `scripts/`. Deshalb
 * liegt die Antwort hier und nicht dort — `registry.ts` importiert
 * `astro:content` und ist damit aus Node heraus nicht ladbar. Eine Regel,
 * die sich nicht testen lässt, ist eine Behauptung (Lektion 7).
 *
 * Drei Zustände, absichtlich in dieser Reihenfolge:
 *
 *   1. `astro dev` — alles sichtbar. Wer schreibt, muss sehen, was er
 *      schreibt.
 *   2. `PUBLIC_ENTWUERFE=true` — alles sichtbar. Das ist der Zustand von
 *      Deploy Previews und Branch-Deploys: Ein Entwurf soll begutachtet
 *      werden können, bevor ihn ein Mensch freigibt.
 *   3. sonst — nur `status: veroeffentlicht`. Das ist die Produktion.
 *
 * Der Schalter heißt `PUBLIC_ENTWUERFE` und nicht etwa `ENTWUERFE`, weil
 * Vite nur `PUBLIC_`-Variablen in den Client-Build durchreicht — dieselbe
 * Konvention wie bei `PUBLIC_INDEXIERBAR`.
 *
 * Beide Schalter zusammen ergeben den gewollten Zustand: In der Vorschau ist
 * der Entwurf sichtbar (`PUBLIC_ENTWUERFE=true`) und trotzdem nicht
 * indexierbar (`PUBLIC_INDEXIERBAR=false`, Lektion 9).
 */

/**
 * Umgebungsvariable aus beiden Welten lesen.
 *
 * `import.meta.env` existiert nur unter Vite/Astro, `process.env` nur in
 * Node — und dieses Modul wird von beiden importiert. Ein direkter Zugriff
 * auf eine der beiden Quellen bricht jeweils die andere Seite (Lektion 2,
 * zweimal passiert: erst bei `facetten.ts`, dann bei `site.config.ts`).
 *
 * Dieselbe Hilfe steht in `site.config.ts` und wird von dort nicht
 * exportiert. Sie zu teilen hieße, `site.config.ts` zu ändern, und diese
 * Datei ist für Agenten gesperrt (Lektion 16). Die Dopplung ist damit
 * bewusst und nicht übersehen; wer die Sperre aufhebt, kann sie zu einem
 * Export zusammenziehen.
 */
function umgebung(name: string): unknown {
  const vite = (import.meta as unknown as { env?: Record<string, unknown> }).env;
  if (vite && name in vite) return vite[name];
  return typeof process !== "undefined" ? process.env?.[name] : undefined;
}

/**
 * Wahrheitswert einer Umgebungsvariablen.
 *
 * Beide Schreibweisen sind nötig: `import.meta.env.DEV` liefert einen
 * echten Boolean, `process.env.PUBLIC_ENTWUERFE` immer eine Zeichenkette.
 * Ein reiner `=== "true"`-Vergleich hätte den Entwicklungsmodus stumm
 * verschluckt.
 */
function fahne(name: string): boolean {
  const wert = umgebung(name);
  return wert === true || wert === "true";
}

/** Sollen Entwürfe sichtbar sein? Vorschau und Branch-Deploy sagen ja. */
export function entwuerfeSichtbar(): boolean {
  return fahne("PUBLIC_ENTWUERFE");
}

/** Läuft gerade `astro dev`? In Node ist das nie der Fall. */
export function istEntwicklung(): boolean {
  return fahne("DEV");
}

/**
 * Gehört dieser Eintrag ins Register?
 *
 * Bewusst kein Sonderfall für einzelne Collections: Ein Entwurf ist ein
 * Entwurf, egal ob Event, Band oder Lexikoneintrag.
 */
export function istSichtbar(daten: { status?: string }): boolean {
  if (istEntwicklung()) return true;
  if (entwuerfeSichtbar()) return true;
  return daten.status === "veroeffentlicht";
}

/**
 * Ist dieser Eintrag ein Entwurf — also etwas, das als solches gekennzeichnet
 * werden muss?
 *
 * Getrennt von `istSichtbar`, weil die beiden Fragen auseinanderlaufen: Ein
 * Entwurf kann sichtbar sein. Genau dann braucht er den Hinweis, sonst sieht
 * er aus wie ein fertiger Eintrag — und das ist die Falle, die dieser
 * Schalter sonst aufstellt.
 */
export function istEntwurf(daten: { status?: string } | undefined | null): boolean {
  return daten?.status !== "veroeffentlicht";
}
