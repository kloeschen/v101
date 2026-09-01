/**
 * Sperren für agentische Schreibzugriffe. Exit 2 blockiert den Tool-Aufruf,
 * stderr geht als Begründung an das Modell zurück.
 */
import { readFileSync } from "node:fs";

const eingabe = JSON.parse(readFileSync(0, "utf8") || "{}");
const datei = eingabe?.tool_input?.file_path ?? "";
const inhalt = eingabe?.tool_input?.content ?? eingabe?.tool_input?.new_string ?? "";

const verweigern = (grund) => {
  console.error(grund);
  process.exit(2);
};

const gesperrt = [
  {
    muster: /\/src\/content\/_schemas\.ts$/,
    grund:
      "src/content/_schemas.ts ist gesperrt. Schemaänderungen brauchen eine ausdrückliche menschliche Entscheidung — nicht als Nebenwirkung einer Recherche. Melde stattdessen, welches Feld fehlt.",
  },
  {
    muster: /\/src\/site\.config\.ts$/,
    grund: "src/site.config.ts ist gesperrt: Die Domain steckt in jeder @id des Wissensgraphen.",
  },
  { muster: /\/\.claude\//, grund: "Die Agenten-Konfiguration ist für Agenten gesperrt." },
  { muster: /\/\.github\//, grund: "CI-Konfiguration ist für Agenten gesperrt." },
];

for (const { muster, grund } of gesperrt) if (muster.test(datei)) verweigern(grund);

// Veröffentlichungsstatus setzt der Mensch. Ohne diese Sperre wandert früher
// oder später ein unbelegter Entwurf live — die Reputation eines Registers
// hängt daran, dass die Termine stimmen.
if (/\/src\/content\/.*\.md$/.test(datei) && /^status:[ \t]*veroeffentlicht[ \t]*$/m.test(inhalt)) {
  verweigern(
    "status: veroeffentlicht darf nur ein Mensch setzen. Lege den Eintrag mit status: entwurf an; die Freigabe läuft über die Review-Warteschlange (npm run stale).",
  );
}
