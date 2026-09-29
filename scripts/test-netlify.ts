#!/usr/bin/env -S npx tsx
/**
 * test-netlify.ts — steht in `netlify.toml`, was die Site braucht?
 *
 * ANLASS: Vom 2026-09-03 bis 2026-09-28 war die Datei im Wurzelverzeichnis
 * auf die Umgebungsschalter gekürzt (Bearbeitung über die GitHub-Oberfläche).
 * Build-Befehl, Node-Pin und alle Header waren weg; die Produktion lieferte
 * `/api/events.json` ohne CORS-Header aus. Niemand hat es bemerkt, weil eine
 * vollständige zweite `netlify.toml` unter `src/` lag — die Netlify nie
 * gelesen hat (Basisverzeichnis der Site ist leer). Lektion 30.
 *
 * Geprüft wird die Datei selbst, nicht die Produktion: Jede Zusage, die
 * README und Lektion 8 machen, hat hier eine Zeile. Dazu: Es gibt genau eine
 * `netlify.toml` im Repo — eine zweite ist die Falle, aus der das kam.
 *
 *   npx tsx scripts/test-netlify.ts [pfad/zur/netlify.toml]
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import { parse } from "smol-toml";

const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATEI = path.resolve(process.argv[2] ?? path.join(PROJEKT, "netlify.toml"));

let bestanden = 0;
const fehler: string[] = [];
const pruefe = (name: string, ok: boolean, detail = "") => {
  ok ? bestanden++ : fehler.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

interface Konfig {
  build?: { command?: string; publish?: string; environment?: Record<string, string> };
  context?: Record<string, { environment?: Record<string, string> }>;
  headers?: { for: string; values: Record<string, string> }[];
}
const k = parse(readFileSync(DATEI, "utf8")) as Konfig;

/* --- Build ------------------------------------------------------------ */
pruefe("build.command ist npm run build", k.build?.command === "npm run build", String(k.build?.command));
pruefe("build.publish ist dist", k.build?.publish === "dist", String(k.build?.publish));
pruefe("Node ist gepinnt", /^\d+$/.test(k.build?.environment?.NODE_VERSION ?? ""), String(k.build?.environment?.NODE_VERSION));

/* --- Schalter je Kontext ---------------------------------------------- */
const env = (ctx: string) => k.context?.[ctx]?.environment ?? {};
pruefe("Produktion setzt PUBLIC_INDEXIERBAR ausdrücklich", typeof env("production").PUBLIC_INDEXIERBAR === "string");
pruefe("Produktion zeigt keine Entwürfe", env("production").PUBLIC_ENTWUERFE === "false", String(env("production").PUBLIC_ENTWUERFE));
for (const ctx of ["deploy-preview", "branch-deploy"]) {
  pruefe(`${ctx} bleibt unindexiert`, env(ctx).PUBLIC_INDEXIERBAR === "false", String(env(ctx).PUBLIC_INDEXIERBAR));
}

/* --- Header ------------------------------------------------------------ */
const header = (fuer: string) => k.headers?.find((h) => h.for === fuer)?.values ?? {};
pruefe("/api/* ist aus dem Browser lesbar (CORS)", header("/api/*")["Access-Control-Allow-Origin"] === "*");
pruefe("/kalender/* ist aus dem Browser lesbar (CORS)", header("/kalender/*")["Access-Control-Allow-Origin"] === "*");
pruefe("/kalender/* wird als Kalender ausgeliefert",
  /^text\/calendar\b/.test(header("/kalender/*")["Content-Type"] ?? ""), String(header("/kalender/*")["Content-Type"]));
pruefe("/* setzt nosniff", header("/*")["X-Content-Type-Options"] === "nosniff");
pruefe("/* setzt eine Referrer-Policy", Boolean(header("/*")["Referrer-Policy"]));

/* --- Genau eine Datei -------------------------------------------------- */
if (!process.argv[2]) {
  const alle = fg.sync("**/netlify.toml", { cwd: PROJEKT, ignore: ["node_modules/**", "dist/**", ".netlify/**"] });
  pruefe("es gibt genau eine netlify.toml, im Wurzelverzeichnis", alle.length === 1 && alle[0] === "netlify.toml", JSON.stringify(alle));
}

console.log(`${bestanden} Prüfungen bestanden, ${fehler.length} fehlgeschlagen`);
for (const f of fehler) console.log(`  FEHLER  ${f}`);
process.exit(fehler.length ? 1 : 0);
