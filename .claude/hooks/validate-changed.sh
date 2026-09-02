#!/usr/bin/env bash
#
# PostToolUse — sofortige Rückmeldung statt später Überraschung.
#
# Der Agent korrigiert seinen eigenen Fehler in derselben Sitzung, solange er
# noch weiß, was er tun wollte. Ohne den Hook fällt derselbe Fehler erst beim
# Build auf, dann fehlt der Kontext.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"

DATEI=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s||"{}")?.tool_input?.file_path??"")}catch{}})')

case "$DATEI" in
  *"/src/content/"*.md) ;;
  *) exit 0 ;;
esac

[ -f "$DATEI" ] || exit 0

# Die Umleitung nach stderr steht hier und nicht in den Skripten: Claude Code
# wertet bei einem blockierenden Hook (Exit 2) ausschliesslich stderr aus.
# Ohne >&2 landet die Befundliste auf stdout, der Agent bekommt nur ein
# nacktes "No stderr output" und weiss nicht, was er falsch gemacht hat --
# damit ist der Zweck des Hooks verfehlt. In den Skripten selbst waere stdout
# richtig: Sie laufen auch interaktiv und in der CI, wo Befunde auf stdout
# gehoeren und stderr echten Fehlern vorbehalten bleibt.
npx tsx scripts/validate-content.ts --changed "$DATEI" >&2 || exit 2
npx tsx scripts/check-jsonld.ts    --changed "$DATEI" >&2 || exit 2
