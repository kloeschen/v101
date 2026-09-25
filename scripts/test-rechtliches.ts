#!/usr/bin/env -S npx tsx
/**
 * test-rechtliches.ts — die Go-Live-Sperre für Impressum und Datenschutz.
 *
 * Die Sperre hat zwei Seiten, und beide müssen stimmen: Vor dem Go-Live
 * darf sie NICHT greifen (sonst bricht jeder Build, solange Angaben
 * fehlen), danach MUSS sie greifen, solange eine Angabe oder ein
 * Prüfpunkt offen ist. Dass die Seiten sie tatsächlich aufrufen, belegt
 * ein Build mit `PUBLIC_INDEXIERBAR=true` (ENTSCHEIDUNGEN.md, 2026-09-25).
 *
 *   npx tsx scripts/test-rechtliches.ts
 */
import { IMPRESSUM, PRUEFEN, fehlendeAngaben, goLiveSperre, type Angaben } from "../src/lib/rechtliches";

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") =>
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);

const VOLL: Angaben = {
  name: "Erika Muster", strasse: "Musterweg 1", plzOrt: "12345 Musterstadt", land: "Deutschland", email: "post@example.org",
};
const PUNKT = [{ thema: "Hosting", frage: "Ist ein DPA abgeschlossen?" }];

/* --- Vor dem Go-Live greift nichts ------------------------------------ */
pruefe("vor dem Go-Live: unvollständig blockiert nicht", goLiveSperre(false, { ...VOLL, strasse: null }, PUNKT) === null);

/* --- Nach dem Go-Live: jede Lücke blockiert --------------------------- */
const s1 = goLiveSperre(true, { ...VOLL, strasse: null }, []);
pruefe("Go-Live: fehlende Straße blockiert und wird genannt", !!s1?.includes("Straße und Hausnummer"), s1 ?? "keine Sperre");
const s2 = goLiveSperre(true, { ...VOLL, email: "  " }, []);
pruefe("Go-Live: leere E-Mail zählt als fehlend", !!s2?.includes("E-Mail-Adresse"), s2 ?? "keine Sperre");
const s3 = goLiveSperre(true, VOLL, PUNKT);
pruefe("Go-Live: offener Prüfpunkt blockiert und wird genannt", !!s3?.includes("DPA"), s3 ?? "keine Sperre");
pruefe("Gegenfall — Go-Live, alles vollständig: keine Sperre", goLiveSperre(true, VOLL, []) === null);

/* --- Freiwillige Felder: null ist offen, undefined gibt es nicht ------- */
pruefe("Telefon null ist eine Lücke", fehlendeAngaben({ ...VOLL, telefon: null }).some((f) => f.startsWith("Telefon")));
pruefe("Gegenfall — Telefon weggelassen ist keine Lücke", fehlendeAngaben({ ...VOLL }).length === 0);
pruefe("USt-IdNr. null ist eine Lücke", fehlendeAngaben({ ...VOLL, ustId: null }).some((f) => f.startsWith("USt")));

/* --- Der echte Stand ist in sich stimmig ------------------------------ */
// Nicht „der echte Stand ist unvollständig" — das wäre nach dem Ausfüllen
// falsch. Sondern: Die Sperre sagt genau dann nichts, wenn nichts offen ist.
const offen = fehlendeAngaben(IMPRESSUM).length + PRUEFEN.length;
pruefe(
  "echter Stand: Sperre genau dann still, wenn nichts offen ist",
  (goLiveSperre(true, IMPRESSUM, PRUEFEN) === null) === (offen === 0),
  `${offen} offen`,
);
pruefe("echter Stand: jeder Prüfpunkt hat Thema und Frage", PRUEFEN.every((p) => p.thema.trim() && p.frage.trim().endsWith("?")));

console.log(`\n${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
