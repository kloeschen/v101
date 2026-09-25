#!/usr/bin/env -S npx tsx
/**
 * pruefzettel.ts — ein Zettel zum Überfliegen vor der Freigabe.
 *
 * ANLASS: Markus hat am 2026-09-25 gesagt, wie er Inhalts-PRs tatsächlich
 * prüft: meist nur überfliegend, und wenn, dann Datum, Uhrzeit und Ort
 * gegen die Quelle sowie den Szenebezug. Ein Bericht, der alles aufzählt,
 * wird unter diesen Bedingungen nicht gelesen. Deshalb zeigt der Zettel je
 * Eintrag nur die harten Fakten — jeden mit einem Klick zur Quelle, die ihn
 * belegt — und darunter die Stellen, an denen sich Hinsehen lohnt.
 * Unauffällige Einträge stehen am Ende, eingeklappt.
 *
 * WAS ALS SIGNAL ZÄHLT, und warum jedes:
 *   - ein harter Fakt nur von einem Aggregator, Social-Profil oder
 *     „sonstige" belegt — die Quelle bündelt fremde Angaben;
 *   - der Beginn hängt an einer einzigen Quelle;
 *   - die Redaktionsnotiz spricht von einer Abweichung zwischen Quellen —
 *     der Record Hop (19 gegen 21 Uhr) ist so ein Fall;
 *   - der Termin ist nahe, eine Freigabe eilt;
 *   - der Ort entsteht im selben Änderungssatz — die Adresse ist neu;
 *   - keine Genres — der Szenebezug steht dann nur im Text;
 *   - eine Quelle ist alt.
 * Keines davon ist ein Fehler — Fehler fängt `validate-content`. Signale
 * sagen, wohin der Blick gehört.
 *
 *   npx tsx scripts/pruefzettel.ts                        # alle Entwürfe
 *   npx tsx scripts/pruefzettel.ts --basis origin/main    # nur, was dieser Zweig ändert
 *   npx tsx scripts/pruefzettel.ts --dateien a.md,b.md
 *   npx tsx scripts/pruefzettel.ts --basis origin/main --pr 69   # Vorschau-Links auf den PR
 *
 * Vorschau-Links: Ohne `--pr` zeigen sie auf die Branch-Vorschau
 * `vorschau--`, die `main` spiegelt. Dort sind Entwürfe erst nach dem Merge
 * zu sehen — für einen offenen PR führte der Link ins Leere (404, gefunden
 * am 2026-09-25 an #68 und #69). Mit `--pr` zeigen sie auf die
 * Deploy-Vorschau genau dieses PRs.
 *
 * Ausgabe: Markdown auf stdout, gedacht für die Beschreibung eines PR.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ladeAlle, type GeladenerEintrag } from "./_laden";
import { tageBis } from "../src/lib/datum";
import { site } from "../src/site.config";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Quellenarten, die fremde Angaben bündeln oder schwach sind. */
export const SCHWACHE_ARTEN = new Set(["aggregator", "social", "sonstige"]);
/** Ab so vielen Tagen bis zum Termin eilt die Freigabe. */
export const NAH_TAGE = 21;
/** Ab so vielen Tagen seit dem Abruf gilt eine Quelle als alt. */
export const ALT_TAGE = 14;
/** Wörter, mit denen Redaktionsnotizen eine Abweichung zwischen Quellen benennen. */
const ABWEICHUNG = /widersp|abweich|versatz|nicht einheitlich|uneinheitlich|weicht .{0,20}ab|stimmen nicht überein/i;

export interface Beleg { url: string; titel: string; art: string }
export interface Fakt { name: string; wert: string; belege: Beleg[] }
export interface Zettel { titel: string; pfad: string; fakten: Fakt[]; signale: string[] }

export interface Kontext {
  /** Alle geladenen Einträge, nach "collection/slug". */
  alle: Map<string, GeladenerEintrag>;
  /** Einträge, die im selben Änderungssatz als Entwurf entstehen. */
  neu: Set<string>;
  jetzt: Date;
}

const STRUKTUR = new Intl.DateTimeFormat("de-DE", {
  weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", timeZone: site.zeitzone,
});

export function belegeFuer(daten: Record<string, any>, feld: string): Beleg[] {
  return (daten.quellen ?? [])
    .filter((q: any) => (q.felder ?? []).includes(feld))
    .map((q: any) => ({ url: q.url, titel: q.titel ?? q.url, art: q.art ?? "sonstige" }));
}

function preisText(daten: Record<string, any>): string | undefined {
  const p = (daten.preise ?? []) as { bezeichnung?: string; betrag: number; waehrung?: string }[];
  if (p.length) return p.map((x) => `${x.bezeichnung ? `${x.bezeichnung} ` : ""}${x.betrag} ${x.waehrung ?? "EUR"}`).join(" · ");
  const lesbar: Record<string, string> = { frei: "Eintritt frei", unveroeffentlicht: "Preis nicht veröffentlicht" };
  if (daten.eintritt) return lesbar[daten.eintritt] ?? `Eintritt: ${daten.eintritt}`;
  return undefined;
}

function ortText(ort: GeladenerEintrag | undefined, slug: string): string {
  const d = ort?.daten;
  if (!d) return slug;
  const a = d.adresse;
  return a ? `${d.name}, ${[a.strasse, [a.plz, a.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}` : d.name;
}

export function zettelFuer(e: GeladenerEintrag, k: Kontext): Zettel {
  const d = e.daten ?? {};
  const pfad = `${e.collection}/${e.slug}`;
  const fakten: Fakt[] = [];
  const signale: string[] = [];

  const hart = (name: string, feld: string, wert: string | undefined) => {
    if (!wert) return;
    const belege = belegeFuer(d, feld);
    fakten.push({ name, wert, belege });
    if (belege.length === 0) signale.push(`**${name}** ist von keiner Quelle gedeckt.`);
    else if (belege.every((b) => SCHWACHE_ARTEN.has(b.art)))
      signale.push(`**${name}** steht nur in ${[...new Set(belege.map((b) => b.art))].join("/")}-Quellen.`);
  };

  if (e.collection === "events") {
    const beginn = d.beginn ? new Date(d.beginn) : undefined;
    hart("Beginn", "beginn", beginn ? `${STRUKTUR.format(beginn)} Uhr` : undefined);
    if (d.ende) hart("Ende", "ende", `${STRUKTUR.format(new Date(d.ende))} Uhr`);
    const ortSlug = typeof d.ort === "string" ? d.ort : undefined;
    if (ortSlug) {
      hart("Ort", "ort", ortText(k.alle.get(`locations/${ortSlug}`), ortSlug));
      if (k.neu.has(`locations/${ortSlug}`)) signale.push("Der **Ort ist neu** in diesem Änderungssatz — Adresse gegenlesen.");
    }
    hart("Preis", d.preise?.length ? "preise" : "eintritt", preisText(d));
    if (belegeFuer(d, "beginn").length === 1) signale.push("Der **Beginn hängt an einer einzigen Quelle**.");
    if (beginn) {
      const bis = tageBis(beginn, k.jetzt);
      if (bis >= 0 && bis < NAH_TAGE) signale.push(`Der Termin ist in **${bis} Tagen** — Freigabe eilt.`);
      if (bis < 0) signale.push("Der Termin **liegt in der Vergangenheit**.");
    }
    if (!(d.genres ?? []).length) signale.push("**Keine Genres** — der Szenebezug steht nur im Text.");
  } else if (e.collection === "locations" || e.collection === "adressen") {
    const a = d.adresse;
    if (a) hart("Adresse", "adresse", [a.strasse, [a.plz, a.ort].filter(Boolean).join(" ")].filter(Boolean).join(", "));
    if (d.typ) hart("Typ", "typ", String(d.typ));
    // Bei Läden & Studios ist der Szenebezug das Aufnahmekriterium.
    if ((d.schwerpunkte ?? []).length) hart("Schwerpunkte", "schwerpunkte", d.schwerpunkte.join(", "));
  } else {
    hart("Kurzbeschreibung", "kurzbeschreibung", d.kurzbeschreibung);
    if ((d.quellen ?? []).length === 1) signale.push("Der Eintrag stützt sich auf **eine einzige Quelle**.");
  }

  if (typeof d.redaktionsnotiz === "string" && ABWEICHUNG.test(d.redaktionsnotiz))
    signale.push("Die **Redaktionsnotiz nennt eine Abweichung zwischen Quellen** — dort nachlesen.");

  const alt = (d.quellen ?? [])
    .map((q: any) => ({ q, tage: -tageBis(q.abgerufenAm, k.jetzt) }))
    .filter((x: any) => x.tage > ALT_TAGE);
  if (alt.length) signale.push(`${alt.length} Quelle(n) vor mehr als ${ALT_TAGE} Tagen abgerufen.`);

  return { titel: d.name ?? e.slug, pfad, fakten, signale };
}

function kurzTitel(b: Beleg): string {
  try {
    return new URL(b.url).hostname.replace(/^www\./, "");
  } catch {
    return b.titel;
  }
}

/** Wo die Seiten eines Eintrags vor der Freigabe zu sehen sind. */
export function vorschauBasis(pr?: number): string {
  return pr ? `https://deploy-preview-${pr}--v101s.netlify.app` : "https://vorschau--v101s.netlify.app";
}

export function alsMarkdown(zettel: Zettel[], optionen: { pr?: number } = {}): string {
  if (zettel.length === 0) return "## Prüfzettel\n\nKeine Inhalte zu prüfen.\n";
  const auffaellig = zettel.filter((z) => z.signale.length);
  const ruhig = zettel.filter((z) => !z.signale.length);
  const block = (z: Zettel) => {
    const zeilen = z.fakten.map(
      (f) => `| ${f.name} | ${f.wert} | ${f.belege.map((b) => `[${kurzTitel(b)}](${b.url})${SCHWACHE_ARTEN.has(b.art) ? ` _(${b.art})_` : ""}`).join(" · ") || "—"} |`,
    );
    const tabelle = zeilen.length ? `| Fakt | Wert | Quelle |\n|---|---|---|\n${zeilen.join("\n")}\n` : "";
    const hinsehen = z.signale.length ? `\n**Hinsehen:**\n${z.signale.map((s) => `- ${s}`).join("\n")}\n` : "";
    return `### ${z.titel}\n\`${z.pfad}\` · [Vorschau](${vorschauBasis(optionen.pr)}/${z.pfad}/)\n\n${tabelle}${hinsehen}`;
  };
  let md = `## Prüfzettel\n\n${auffaellig.length} von ${zettel.length} Einträgen mit Hinweisen. Geprüft werden sollten vor allem Datum, Uhrzeit und Ort gegen die verlinkte Quelle.\n\n`;
  md += auffaellig.map(block).join("\n");
  if (ruhig.length) md += `\n<details><summary>${ruhig.length === 1 ? "1 unauffälliger Eintrag" : `${ruhig.length} unauffällige Einträge`}</summary>\n\n${ruhig.map(block).join("\n")}\n</details>\n`;
  return md;
}

/* ------------------------------------------------------------------ */

function main() {
  const argv = process.argv.slice(2);
  const wert = (n: string) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined);
  const alle = ladeAlle();
  const nachPfad = new Map(alle.map((e) => [`${e.collection}/${e.slug}`, e]));

  let auswahl: GeladenerEintrag[];
  const basis = wert("--basis");
  const dateien = wert("--dateien");
  if (basis || dateien) {
    const liste = dateien
      ? dateien.split(",")
      : execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", `${basis}...HEAD`], { cwd: PROJEKT, encoding: "utf8" })
          .split("\n")
          .filter((f) => /^src\/content\/[^/]+\/[^_][^/]*\.md$/.test(f));
    const gewaehlt = new Set(liste.map((f) => path.resolve(PROJEKT, f)));
    auswahl = alle.filter((e) => gewaehlt.has(e.datei));
  } else {
    auswahl = alle.filter((e) => e.daten?.status === "entwurf");
  }

  const neu = new Set(auswahl.filter((e) => e.daten?.status === "entwurf").map((e) => `${e.collection}/${e.slug}`));
  const kontext: Kontext = { alle: nachPfad, neu, jetzt: new Date() };
  // Termine zuerst, dann Orte, dann der Rest — die Reihenfolge, in der Fehler teuer sind.
  const rang = (c: string) => ["events", "locations"].indexOf(c) === -1 ? 9 : ["events", "locations"].indexOf(c);
  auswahl.sort((a, b) => rang(a.collection) - rang(b.collection) || a.slug.localeCompare(b.slug));
  const pr = wert("--pr") ? Number(wert("--pr")) : undefined;
  if (pr !== undefined && !(Number.isInteger(pr) && pr > 0)) {
    console.error(`--pr erwartet eine PR-Nummer, bekam "${wert("--pr")}".`);
    process.exit(2);
  }
  console.log(alsMarkdown(auswahl.map((e) => zettelFuer(e, kontext)), { pr }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
