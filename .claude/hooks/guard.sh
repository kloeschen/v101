#!/usr/bin/env bash
#
# PreToolUse — was ein Agent nicht anfassen darf.
#
# Die Regeln stehen zusätzlich in CLAUDE.md. Dort sind sie eine Bitte, hier
# sind sie eine Bedingung. Der Unterschied zählt: Ein Modell, das gerade
# einen Schemafehler umgehen will, liest CLAUDE.md nicht noch einmal.
#
# Geparst wird mit node statt jq: node ist im Projekt ohnehin Voraussetzung,
# jq ist es nicht — ein Hook, der auf manchen Rechnern still mit "command
# not found" durchfällt, ist schlimmer als keiner.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"

exec node .claude/hooks/guard.mjs
