#!/usr/bin/env bash
set -euo pipefail

# Fail if any content file sets publishDate and draft:true simultaneously.
violations=$(rg -n --no-heading -g 'content/**/index.*' -e '^draft:\s*true$' -C 4 | awk 'BEGIN{RS="--"} /publishDate/ && /draft: *true/ {print}') || true
if [ -n "$violations" ]; then
  echo "Validation failed: Some posts have draft:true with publishDate set:" >&2
  echo "$violations" >&2
  exit 1
fi
echo "Content validation passed."

