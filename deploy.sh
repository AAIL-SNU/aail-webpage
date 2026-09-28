#!/usr/bin/env bash
# Build-check, commit everything, and push to main (GitHub Actions deploys from there).
# Usage: ./deploy.sh ["commit message"]
set -euo pipefail
cd "$(dirname "$0")"

msg="${1:-update site}"

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" != "main" ]]; then
  echo "✗ Not on main (current: $branch)." >&2
  exit 1
fi

echo "▸ Building..."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
if ! npx @11ty/eleventy --output="$tmp" --quiet; then
  echo "✗ Build failed. Nothing was committed." >&2
  exit 1
fi
echo "✓ Build OK ($(find "$tmp" -name '*.html' | wc -l | tr -d ' ') pages)"

git add -A
if git diff --cached --quiet; then
  echo "▸ No local changes to commit."
else
  git status --short
  git commit -q -m "$msg"
fi

git pull --rebase -q origin main
git push origin main
echo "✓ Pushed. Deploy status: https://github.com/AAIL-SNU/aail-webpage/actions"
