/**
 * pruefung.ts — wann wurde ein Eintrag zuletzt geprüft, und muss er es noch?
 *
 * Zwei Abnehmer, eine Regel: `validate-content.ts` (Regel `pruefkadenz`) und
 * `stale-report.ts` (Abschnitt „Überfällige Prüfungen"). Bis zum 2026-10-12
 * rechneten beide getrennt, und sie liefen auseinander: Der Stale-Bericht
 * zählte seit dem 2026-10-03 die Nachprüfung eines Laufs (`abgerufenAm` einer
 * offiziellen Quelle), der Validator nur `geprueftAm`. Ein Lauf konnte einen
 * Termin also nachprüfen, und die CI blieb trotzdem rot.
 *
 * Kein Import aus registry.ts und kein `import.meta` (Lektion 2): Das Modul
 * läuft in Node-Skripten und im Build.
 */

/** Durchführungsstände, nach denen ein Termin nichts mehr zu prüfen hat. */
export const ABGESCHLOSSEN: ReadonlySet<string> = new Set(["stattgefunden", "abgesagt"]);

/**
 * Wann der Eintrag zuletzt gegen die Quelle geprüft wurde: das jüngere von
 * `geprueftAm` und dem jüngsten `abgerufenAm` einer offiziellen Quelle, die
 * `beginn` belegt. Entscheidung von Markus vom 2026-10-03 (ENTSCHEIDUNGEN.md):
 * `geprueftAm` heißt weiter „von Markus geprüft" und ändert sich nur bei der
 * Freigabe; eine Nachprüfung durch einen Lauf schreibt `abgerufenAm`. Nur
 * offizielle Quellen, weil nur der Veranstalter eine Absage verbindlich
 * ankündigt, und nur mit `beginn`, weil ein Abruf, der das Datum nicht
 * belegt, den Termin nicht geprüft hat. Für Einträge ohne `beginn` (Lexikon,
 * Orte, Bands …) bleibt es damit bei `geprueftAm`.
 */
export function letzteNachpruefung(d: Record<string, any>): Date {
  let juengste = new Date(d.geprueftAm);
  for (const q of (d.quellen ?? []) as { abgerufenAm: Date | string; felder?: string[]; art?: string }[]) {
    if (q.art !== "offiziell" || !q.felder?.includes("beginn")) continue;
    const abruf = new Date(q.abgerufenAm);
    if (abruf > juengste) juengste = abruf;
  }
  return juengste;
}

/**
 * Gilt die Prüfkadenz für diesen Eintrag? Nicht für Termine, die
 * stattgefunden haben oder abgesagt sind: An ihnen kann sich nichts mehr
 * ändern, was eine Nachprüfung fände. Anlass (2026-10-12): Vier vergangene
 * Termine überschritten die 30 Tage und färbten jede CI rot — einen
 * Abend vom 11. September erneut gegen seine Quelle zu prüfen, belegt nichts.
 */
export function kadenzGilt(collection: string, d: Record<string, any>): boolean {
  return !(collection === "events" && ABGESCHLOSSEN.has(d.durchfuehrung ?? ""));
}
