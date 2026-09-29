/**
 * _freigabelauf.ts — die Bestätigung eines Freigabe-PRs aus dem Lauf, der
 * ihn geöffnet hat.
 *
 * ANLASS (2026-09-29): Die CI auf einem Freigabe-PR endete jedes Mal rot an
 * Schritt 3, der Freigabeprüfung — planmäßig, denn im Diff stehen lauter
 * Statuswechsel, und beim Aufruf bestätigt sie niemand. Markus ist zweimal
 * darüber gestolpert; ein Rot, das man jedes Mal wegerklären muss, verdeckt
 * das Rot, das zählt, und Tests und Build dahinter liefen auf dem PR nie.
 *
 * Die Bestätigung gibt es aber schon: Der Freigabe-Workflow wird von Hand
 * gestartet, gibt frei und kennt danach genau die Slugs, die er freigegeben
 * hat. Er legt sie als Artefakt `freigabe-slugs` ab und benennt den Zweig
 * `freigabe/<Lauf-ID>`. Dieses Modul liest auf so einem PR genau diese
 * Liste — und nur, wenn der Lauf wirklich `freigeben.yml` war und von Hand
 * ausgelöst wurde (`workflow_dispatch`).
 *
 * WARUM DAS DIE PRÜFUNG NICHT SCHWÄCHT: Bestätigt wird nur, was ein Mensch
 * über den Workflow freigegeben hat, und nur für den Lauf, dessen Nummer im
 * Zweignamen steht. Jeder weitere Statuswechsel im selben PR bleibt ein
 * Fehler. Wer einen Zweig `freigabe/<fremde ID>` anlegt, erbt höchstens die
 * Slugs eines Laufs, den ein Mensch gestartet hat.
 *
 * FEHLER SCHLIESSEN, NICHT ÖFFNEN: Kein Token, kein `gh`, ein fremder
 * Workflow, ein fehlendes Artefakt — dann gibt es keine Bestätigung, und die
 * Prüfung bleibt rot wie vor diesem Modul. Die Meldung sagt, warum.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const ARTEFAKT = "freigabe-slugs";
export const ARTEFAKT_DATEI = "freigabe-slugs.txt";
export const WORKFLOW = ".github/workflows/freigeben.yml";

/** Der Zugriff auf GitHub — austauschbar, damit die Regel ohne Netz prüfbar ist. */
export interface GitHub {
  /** Workflow-Datei und Ereignis eines Laufs, oder null, wenn nicht lesbar. */
  lauf(repo: string, id: string): { pfad: string; ereignis: string } | null;
  /** Inhalt der Slug-Datei aus dem Artefakt des Laufs, oder null. */
  slugs(repo: string, id: string): string | null;
}

export interface Bestaetigung {
  slugs: Set<string>;
  /** Die Lauf-ID, wenn eine Bestätigung zustande kam. */
  lauf: string | null;
  /** Für den Bericht; null, wenn gar kein Freigabe-PR vorliegt. */
  meldung: string | null;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function bestaetigungAusFreigabelauf(env: NodeJS.ProcessEnv, github: GitHub): Bestaetigung {
  const leer = (meldung: string | null): Bestaetigung => ({ slugs: new Set(), lauf: null, meldung });

  const zweig = env.GITHUB_HEAD_REF ?? "";
  const treffer = /^freigabe\/(\d+)$/.exec(zweig);
  if (!treffer) return leer(null);
  const id = treffer[1]!;
  const ohne = (grund: string) => leer(`Freigabe-PR (Lauf ${id}), aber keine Bestätigung: ${grund}.`);

  const repo = env.GITHUB_REPOSITORY ?? "";
  if (!repo) return ohne("GITHUB_REPOSITORY fehlt");
  if (!env.GH_TOKEN && !env.GITHUB_TOKEN) return ohne("kein Token (GH_TOKEN) in der Umgebung");

  const lauf = github.lauf(repo, id);
  if (!lauf) return ohne("der Lauf ist nicht lesbar");
  // Die API nennt den Pfad, bei neueren Läufen mit angehängter Referenz
  // („…/freigeben.yml@refs/heads/main"). Verglichen wird nur der Pfad.
  const pfad = lauf.pfad.split("@")[0];
  if (pfad !== WORKFLOW) return ohne(`der Lauf gehört zu ${pfad || "(unbekannt)"}, nicht zu ${WORKFLOW}`);
  if (lauf.ereignis !== "workflow_dispatch") {
    return ohne(`der Lauf wurde durch „${lauf.ereignis}" ausgelöst, nicht von Hand (workflow_dispatch)`);
  }

  const text = github.slugs(repo, id);
  if (text === null) return ohne(`das Artefakt „${ARTEFAKT}" fehlt oder ist nicht lesbar`);
  const slugs = new Set(
    text
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => SLUG.test(s)),
  );
  if (slugs.size === 0) return ohne(`das Artefakt „${ARTEFAKT}" nennt keinen Slug`);

  return {
    slugs,
    lauf: id,
    meldung: `Bestätigung aus Freigabelauf ${id} (${WORKFLOW}, von Hand gestartet): ${[...slugs].join(", ")}.`,
  };
}

/** Die echte Anbindung über die GitHub-CLI, die auf den Runnern vorinstalliert ist. */
export const ghCli: GitHub = {
  lauf(repo, id) {
    try {
      const aus = execFileSync("gh", ["api", `repos/${repo}/actions/runs/${id}`, "--jq", '.path + "\\t" + .event'], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
      const [pfad, ereignis] = aus.split("\t");
      return pfad && ereignis ? { pfad, ereignis } : null;
    } catch {
      return null;
    }
  },
  slugs(repo, id) {
    const ziel = mkdtempSync(path.join(os.tmpdir(), "v101-freigabelauf-"));
    try {
      execFileSync("gh", ["run", "download", id, "--repo", repo, "--name", ARTEFAKT, "--dir", ziel], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      return readFileSync(path.join(ziel, ARTEFAKT_DATEI), "utf8");
    } catch {
      return null;
    } finally {
      rmSync(ziel, { recursive: true, force: true });
    }
  },
};
