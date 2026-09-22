#!/usr/bin/env bash
#
# check-env.sh — asserts every contracted env-var NAME resolves, in the host
# env store (Vercel) or the local .env.local copy. Reports names/status only;
# never prints values. This is the sanctioned path for asserting env state —
# sessions never read .env* files directly (see specs/stack-profile.md Q12).
#
# Usage: scripts/check-env.sh
# Exit 0 = every contracted var resolves. Non-zero = at least one is missing.

set -euo pipefail
cd "$(dirname "$0")/.."

VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
)

fail=0

if command -v vercel >/dev/null 2>&1 || command -v npx >/dev/null 2>&1; then
  remote="$(npx --yes vercel env ls development 2>/dev/null || true)"
else
  remote=""
fi

local_env=""
if [ -f .env.local ]; then
  local_env="$(cut -d= -f1 .env.local | sed '/^#/d;/^$/d')"
fi

for var in "${VARS[@]}"; do
  if echo "$remote" | grep -q "^ *$var "; then
    echo "check-env: OK (host env store) — $var"
  elif echo "$local_env" | grep -qx "$var"; then
    echo "check-env: OK (.env.local) — $var"
  else
    echo "check-env: MISSING — $var" >&2
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "check-env: PASS — all contracted vars resolve"
  exit 0
fi
echo "check-env: FAIL — one or more contracted vars missing" >&2
exit 1
