/**
 * Die Angaben für Impressum und Datenschutzerklärung — an einer Stelle.
 *
 * ANLASS: Beide Seiten sind in Deutschland Pflicht (Impressum nach § 5 DDG,
 * Verantwortlicher für journalistisch-redaktionelle Inhalte nach § 18
 * Abs. 2 MStV, Datenschutzerklärung nach Art. 13 DSGVO). Der Aufbau steht,
 * die Angaben kommen vom Menschen (Markus, 2026-09-25: „kannst du schon
 * anlegen"). Was noch fehlt, ist `null`.
 *
 * DIE SPERRE: Solange ein Feld `null` ist, zeigt die Seite einen sichtbaren
 * Platzhalter — und der Build bricht ab, sobald `PUBLIC_INDEXIERBAR` auf
 * `true` steht. Der Go-Live ist genau diese eine Zeile in `netlify.toml`;
 * mit ihr kann kein halbes Impressum online gehen. Vorher darf die Seite
 * Platzhalter zeigen: Die Produktion ist bis dahin nicht indexiert und
 * nicht verlinkt.
 *
 * KEINE RECHTSBERATUNG: Die Texte sind ein sorgfältiger Entwurf nach dem,
 * was die Seite tatsächlich tut (keine Cookies, keine Analyse, keine
 * externen Schriften oder Skripte, ein Formular). Vor dem Go-Live gehört
 * ein fachkundiger Blick darauf. Punkte, die nur Markus oder ein Anbieter
 * beantworten kann, stehen als `pruefen` unten und sperren ebenfalls.
 *
 * Kein `import.meta` hier — `scripts/test-rechtliches.ts` lädt das Modul in
 * Node (Lektion 2).
 */

export interface Angaben {
  /** Vollständiger Name der verantwortlichen Person. */
  name: string | null;
  /** Ladungsfähige Anschrift: Straße und Hausnummer. Kein Postfach. */
  strasse: string | null;
  plzOrt: string | null;
  land: string | null;
  /** Pflicht nach § 5 DDG: schnelle elektronische Kontaktaufnahme. */
  email: string | null;
  /** Freiwillig. Telefon oder ein zweiter unmittelbarer Kontaktweg. */
  telefon?: string | null;
  /** Nur falls vorhanden; sonst weglassen (undefined), nicht null. */
  ustId?: string | null;
}

export const IMPRESSUM: Angaben = {
  // Steht bereits auf /methodik/ als verantwortliche Redaktion.
  name: "Markus Klöschen",
  strasse: null,
  plzOrt: null,
  land: "Deutschland",
  email: null,
};

/**
 * Offene Prüfpunkte der Datenschutzerklärung. Jeder ist eine Frage, die
 * sich nicht aus dem Code beantworten lässt. Erledigt heißt: Eintrag
 * löschen und die Antwort in den Text der Seite übernehmen.
 */
export const PRUEFEN: { thema: string; frage: string }[] = [
  {
    thema: "Hosting",
    frage:
      "Rechtsgrundlage der Übermittlung an Netlify (USA): Ist Netlify unter dem EU-US Data Privacy Framework zertifiziert, oder gelten Standardvertragsklauseln? Ist ein Auftragsverarbeitungsvertrag (DPA) mit Netlify abgeschlossen?",
  },
  {
    thema: "Hosting",
    frage: "Wie lange speichert Netlify die Server-Logdateien?",
  },
  {
    thema: "Formular",
    frage:
      "Welche Daten gibt Netlify zur Spamprüfung an Akismet (Automattic Inc., USA) weiter — nur den Inhalt oder auch IP-Adresse und Browserkennung? Auf welcher Grundlage?",
  },
  {
    thema: "Formular",
    frage: "Nach welcher Frist werden verarbeitete Einsendungen im Netlify-Konto gelöscht?",
  },
  {
    thema: "Aufsicht",
    frage: "Welche Datenschutz-Aufsichtsbehörde ist zuständig (nach Bundesland des Wohnsitzes)?",
  },
];

/** Stand der Datenschutzerklärung. Bei jeder inhaltlichen Änderung setzen. */
export const DATENSCHUTZ_STAND = "2026-09-25";

/** Welche Pflichtangaben fehlen noch? Leere Liste = vollständig. */
export function fehlendeAngaben(a: Angaben): string[] {
  const pflicht: [keyof Angaben, string][] = [
    ["name", "Name"],
    ["strasse", "Straße und Hausnummer"],
    ["plzOrt", "PLZ und Ort"],
    ["land", "Land"],
    ["email", "E-Mail-Adresse"],
  ];
  const fehlt = pflicht.filter(([k]) => !a[k] || !String(a[k]).trim()).map(([, label]) => label);
  // `null` bei den freiwilligen Feldern heißt „noch offen", `undefined`
  // heißt „gibt es nicht" — nur das erste ist eine Lücke.
  if (a.telefon === null) fehlt.push("Telefon (oder Feld entfernen)");
  if (a.ustId === null) fehlt.push("USt-IdNr. (oder Feld entfernen)");
  return fehlt;
}

/**
 * Die Go-Live-Sperre. Gibt die Meldung zurück, mit der der Build abbricht,
 * oder `null`, wenn gebaut werden darf.
 */
export function goLiveSperre(indexierbar: boolean, angaben: Angaben, pruefen: typeof PRUEFEN): string | null {
  if (!indexierbar) return null;
  const offen = [...fehlendeAngaben(angaben), ...pruefen.map((p) => `Prüfpunkt ${p.thema}: ${p.frage}`)];
  if (offen.length === 0) return null;
  return (
    "PUBLIC_INDEXIERBAR ist true, aber Impressum oder Datenschutzerklärung sind unvollständig " +
    `(src/lib/rechtliches.ts):\n  - ${offen.join("\n  - ")}`
  );
}
