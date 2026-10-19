#!/bin/sh
set -eu
sheet="${CODEX_HOME:-$HOME/.codex}/pstack-models.md"
root="${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:?plugin root is required}}"
if [ -f "$sheet" ] && [ -r "$sheet" ] && normalized=$(sh "$root/skills/setup-pstack/scripts/read-sheet.sh" "$sheet"); then
  if printf '%s\n' "$normalized" | grep -qx 'session hook: off'; then
    exit 0
  fi
fi
cat "$root/hooks/session-start-context.md"
