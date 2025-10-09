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

# Enforce Cutia Ungheni for non-local categories (national, ue-romania)
# Simple heuristic: search front matter for categories mentioning national/ue-romania
# and require presence of a cutia_ungheni key in the same file's front matter.
missing_cutia=()
while IFS= read -r -d '' f; do
  # Extract first front matter block (YAML style)
  fm=$(awk 'BEGIN{fm=0} /^---/{fm++;next} fm==1{print}' "$f")
  # Skip if no YAML front matter
  [ -z "$fm" ] && continue
  if echo "$fm" | rg -U -qi '^(categories:.*(national|ue-romania))|(^categories:\s*$.*(national|ue-romania))|\[(?:[^\]]*\b(national|ue-romania)\b)[^\]]*\]'; then
    if ! echo "$fm" | rg -q "^cutia_ungheni\s*:\s*"; then
      missing_cutia+=("$f")
    fi
  fi
done < <(find content -type f -name 'index.*' -print0)

if [ ${#missing_cutia[@]} -gt 0 ]; then
  echo "Validation failed: Missing 'cutia_ungheni' for national/ue-romania posts:" >&2
  for f in "${missing_cutia[@]}"; do echo " - $f" >&2; done
  exit 1
fi

echo "Cutia Ungheni validation passed."
