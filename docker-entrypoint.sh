#!/bin/sh
set -eu

if [ ! -f /app/build/index.js ]; then
  echo "[entrypoint] No build found, running pnpm build with current env..."
  pnpm run build
else
  echo "[entrypoint] Existing build found, skipping rebuild."
fi

exec node build/index.js
