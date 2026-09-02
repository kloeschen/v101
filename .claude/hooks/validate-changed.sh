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

npx tsx scripts/validate-content.ts --changed "$DATEI" || exit 2
npx tsx scripts/check-jsonld.ts    --changed "$DATEI" || exit 2
