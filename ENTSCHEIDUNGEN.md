# Entscheidungsprotokoll

Warum etwas so ist, wie es ist. Neueste Einträge oben.

Dieses Protokoll ist die Brücke zum Strategie-Chat, der keinen Repo-Zugriff
hat und von Änderungen hier nichts mitbekommt. In zwölf Monaten ist es der
einzige Ort, an dem die Begründung noch steht — der Commit sagt, *was*
geändert wurde, nicht *warum* und schon gar nicht, *was verworfen wurde*.

Hinein gehören: geänderte Regeln, Felder im Datenvertrag, verworfene
Alternativen, Funde mit Folgen. Nicht hinein gehören: normale Commits,
Inhalte, Formulierungsarbeit. Zehn Zeilen pro Woche sind genug.

---

## 2026-09-02 — Hook-Befunde erreichten das Modell nicht

**Fund:** Der PostToolUse-Hook blockierte schemawidrige Inhalte korrekt mit
Exit 2, aber die Begründung kam beim Agenten nie an. `validate-content.ts`
und `check-jsonld.ts` schreiben ihre Befunde auf stdout; Claude Code wertet
bei einem blockierenden Hook ausschließlich stderr aus. Beim Modell landete
nur `No stderr output`. Es wusste, *dass* es blockiert wurde, nicht *warum* —
und konnte sich damit nicht selbst korrigieren, was der im Skriptkopf
genannte Zweck des Hooks ist.

**Entscheidung:** Die Umleitung nach stderr steht im Hook
(`validate-changed.sh`), nicht in den Skripten.

**Verworfen:** stderr-Ausgabe in `validate-content.ts` und `check-jsonld.ts`
selbst. Beide laufen auch interaktiv und in der CI; dort gehören Befunde auf
stdout und stderr bleibt echten Fehlern vorbehalten. Die Umleitung ist eine
Eigenschaft des Aufrufkontexts, nicht des Skripts.

**Folge:** `scripts/test-hooks.ts` prüft nicht nur den Exitcode, sondern
auch, dass stderr nicht leer ist und den konkreten Befund nennt. Ohne diese
Prüfung wäre der Fehler zurückgekehrt, ohne aufzufallen.

---

## 2026-09-02 — Hook-Sperren waren wirkungslos

**Fund:** Die Hook-Skripte lagen ohne Executable-Bit im Repo (`100644`, schon
im Commit); `settings.json` rief sie direkt als Programm auf. Der Start
scheiterte still mit Exit 126, ein fehlgeschlagener Hook blockiert nichts.
Alle Sperren waren wirkungslos — `_schemas.ts`, `site.config.ts`, `.claude/`,
`.github/` und die Statussperre gegen `status: veroeffentlicht`. Aufgefallen
ist es nur, weil eine Schemaänderung, die hätte blockiert werden müssen,
kommentarlos durchging und committet wurde.

**Entscheidung:** `settings.json` ruft den Interpreter explizit auf
(`node` für `guard.mjs`, `bash` für `validate-changed.sh`), statt das Bit zu
reparieren. Grund: Der Dateimodus überlebt Zip-Übergaben und fremde
Dateisysteme nicht, der Interpreteraufruf schon.

**Verworfen:** `chmod +x` allein — repariert das Symptom, nicht die
Abhängigkeit. Das Bit bleibt zusätzlich im Index gesetzt, aber als zweite
Sicherung, nicht als Grundlage.

**Folge:** Lektion 15 in `.claude/rules/lektionen.md`, sechste Kernregel in
`CLAUDE.md`, automatisierter Negativtest in `scripts/test-hooks.ts`. Der
Wrapper `guard.sh` entfiel, weil `settings.json` `guard.mjs` direkt aufruft.
