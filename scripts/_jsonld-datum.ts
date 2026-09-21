/**
 * _jsonld-datum.ts — die Datumsprüfung des JSON-LD-Checks, als eigenes Modul.
 *
 * Warum getrennt: `check-jsonld.ts` ruft am Dateiende `main()` auf und ist
 * damit nicht importierbar, ohne den kompletten Bestand zu prüfen und
 * `process.exit` auszulösen. Ein Test dieser Prüfung müsste sonst über die
 * CLI gehen — und der Fall, der hier zählt, lässt sich über Inhalte gar
 * nicht herstellen: Jedes Datumsfeld im Frontmatter geht durch
 * `z.coerce.date()` und kommt als volles Datum heraus. Ein Jahr allein
 * entsteht erst im Builder. Geprüft wird deshalb die Funktion, nicht der
 * Umweg.
 *
 * Die Regel: Datumswerte im Graphen sind volle ISO-8601-Daten. Genau eine
 * Ausnahme ist zugelassen, und sie ist eng geführt — siehe unten.
 */

/** Volles Kalenderdatum, optional mit Zeitanteil. */
const VOLLES_DATUM = /^\d{4}-\d{2}-\d{2}(T[\d:.+\-Z]+)?$/;

/** Verkürzte ISO-8601-Form: Jahr, optional mit Monat. */
const NUR_JAHR = /^\d{4}(-\d{2})?$/;

/** Felder, die im Graphen ein Datum tragen. */
export const DATUMSFELDER = ["startDate", "endDate", "datePublished", "dateModified", "validThrough"];

export interface DatumsBefund {
  /** Der Schlüssel, an dem der Wert hing, z. B. "startDate". */
  feld: string;
  /** Der beanstandete Wert, unverändert. */
  wert: string;
}

/**
 * Ist dieser Wert an dieser Stelle zulässig?
 *
 * DIE EINE AUSNAHME: `datePublished` an einem `MusicAlbum` darf verkürzt
 * sein. Das Erscheinungsjahr einer Platte ist im Register ein Jahr und sonst
 * nichts — `veroeffentlichungen[].jahr` ist eine Zahl, weil die Quellen eine
 * Zahl nennen. ISO 8601 lässt die verkürzte Form ausdrücklich zu, und
 * schema.org nimmt sie für `datePublished` an. Die Alternative wäre, im
 * Builder einen 1. Januar zu ergänzen: eine Genauigkeit, die keine Quelle
 * deckt, und damit genau das, was in diesem Projekt nirgends passieren soll.
 *
 * Eng geführt heißt: nur dieses Feld, nur an diesem Typ. Ein `startDate`
 * ohne Tag bleibt ein Fehler — ein Termin, der nur ein Jahr kennt, ist kein
 * Termin. Ein `datePublished` ohne Tag am Article-Knoten bleibt ebenfalls
 * ein Fehler: Dort ist das volle Datum belegt (`veroeffentlichtAm`), ein
 * Jahr wäre Datenverlust.
 */
function zulaessig(feld: string, wert: string, typen: string[]): boolean {
  if (VOLLES_DATUM.test(wert)) return true;
  return feld === "datePublished" && typen.includes("MusicAlbum") && NUR_JAHR.test(wert);
}

function typenVon(knoten: Record<string, unknown>): string[] {
  const t = knoten["@type"];
  return Array.isArray(t) ? (t as string[]) : t ? [t as string] : [];
}

/**
 * Alle unzulässigen Datumswerte eines Graphen, in Fundreihenfolge.
 *
 * Typbewusst statt über einen flachen Wertesammler: Der weiß nicht, an
 * welchem Knoten ein Wert hängt, und eine Ausnahme ohne Knotentyp wäre keine
 * Ausnahme, sondern eine Lockerung für den ganzen Graphen. `umgebenderTyp`
 * trägt den Typ des nächsten übergeordneten Knotens weiter, damit auch Werte
 * in typlosen Zwischenobjekten zugeordnet bleiben.
 */
export function datumsBefunde(wert: unknown, umgebenderTyp: string[] = [], aus: DatumsBefund[] = []): DatumsBefund[] {
  if (Array.isArray(wert)) {
    for (const v of wert) datumsBefunde(v, umgebenderTyp, aus);
    return aus;
  }
  if (!wert || typeof wert !== "object") return aus;

  const knoten = wert as Record<string, unknown>;
  const typen = "@type" in knoten ? typenVon(knoten) : umgebenderTyp;

  for (const [k, v] of Object.entries(knoten)) {
    if (!DATUMSFELDER.includes(k)) {
      datumsBefunde(v, typen, aus);
      continue;
    }
    const werte = (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === "string");
    for (const w of werte) {
      if (!zulaessig(k, w, typen)) aus.push({ feld: k, wert: w });
    }
  }
  return aus;
}
