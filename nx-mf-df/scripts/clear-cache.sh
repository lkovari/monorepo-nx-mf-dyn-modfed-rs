#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "nx-mf-df clear-cache (root: $ROOT)"

echo "-> nx reset"
pnpm exec nx reset

echo "-> rm -rf dist"
rm -rf dist

echo "-> rm -rf .nx/cache"
rm -rf .nx/cache

echo "-> rm -rf node_modules/.cache"
rm -rf node_modules/.cache

echo "-> rm -rf node_modules/.vite"
rm -rf node_modules/.vite

echo "Done. Restart nx serve processes. For browser cache: DevTools -> Application -> Clear site data on localhost:4200 and each remote port."
