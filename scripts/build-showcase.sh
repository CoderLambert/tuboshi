#!/usr/bin/env bash
# Static export of the courier showcase. Output is ./out
# and is what you rsync to the VPS:
#   rsync -a --delete out/ user@vps:/srv/resume/current/dist/tubo-app/
set -euo pipefail
cd "$(dirname "$0")/.."

api_dir="src/app/api"
stash=""
if [[ -d "$api_dir" ]]; then
  stash="$(mktemp -d)"
  mv "$api_dir" "$stash/api"
fi

cleanup() {
  if [[ -n "$stash" && -d "$stash/api" ]]; then
    rm -rf "$api_dir"
    mv "$stash/api" "$api_dir"
  fi
  if [[ -n "$stash" ]]; then
    rm -rf "$stash"
  fi
}
trap cleanup EXIT

export STATIC_EXPORT=1
export NEXT_PUBLIC_NODE_BASE_PATH=/tubo-app

pnpm exec next build

# public/demo.mp3 and demo.mp4 are not referenced by the showcase.
# Leaving them in out/ would add ~30MB to the rsync.
rm -f out/demo.mp3 out/demo.mp4

echo
echo "Showcase export is in: $(pwd)/out"
echo "Rsync that directory onto the VPS path /srv/resume/current/dist/tubo-app/"
