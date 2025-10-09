#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Starting content validation..."

# Fail if any content file sets publishDate and draft:true simultaneously.
violations=$(rg -n --no-heading -g 'content/**/index.*' -e '^draft:\s*true$' -C 4 | awk 'BEGIN{RS="--"} /publishDate/ && /draft: *true/ {print}') || true
if [ -n "$violations" ]; then
  echo "❌ Validation failed: Some posts have draft:true with publishDate set:" >&2
  echo "$violations" >&2
  exit 1
fi
echo "✅ Draft/PublishDate validation passed."

# Enhanced validation for Cutia Ungheni for non-local categories (national, ue-romania)
# Check front matter for categories mentioning national/ue-romania
# and require presence of a cutia_ungheni key in the same file's front matter.
missing_cutia=()
while IFS= read -r -d '' f; do
  # Extract first front matter block (YAML style)
  fm=$(awk 'BEGIN{fm=0} /^---/{fm++;next} fm==1{print}' "$f")
  # Skip if no YAML front matter
  [ -z "$fm" ] && continue
  
  # Check if file is in national or ue-romania category
  # Look for categories field containing national or ue-romania
  if echo "$fm" | grep -q 'categories:' && echo "$fm" | grep -E -i '\b(national|ue-romania)\b'; then
    # Check if cutia_ungheni is present and has content (either as string or as object with sub-fields)
    has_cutia_field=false
    
    # Check for cutia_ungheni as a string value
    cutia_line=$(echo "$fm" | grep "^cutia_ungheni:")
    if [ -n "$cutia_line" ]; then
      # Extract the value after the colon
      cutia_value=$(echo "$cutia_line" | sed 's/^cutia_ungheni:[[:space:]]*//' | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
      # Check if it's not empty
      if [ -n "$cutia_value" ] && [ "$cutia_value" != '""' ] && [ "$cutia_value" != "''" ] && [ "$cutia_value" != "{}" ]; then
        has_cutia_field=true
      fi
    fi
    
    # If not found as string, check for structured object format (with sub-fields)
    if [ "$has_cutia_field" = false ]; then
      if echo "$fm" | sed -n '/^cutia_ungheni:/,/^\([a-zA-Z_][a-zA-Z0-9_-]*:\|---\)/p' | grep -E "^\s*(impact_local|ce_se_schimba|termene|unde_aplici):" | grep -v -E ":\s*$" | grep -q .; then
        has_cutia_field=true
      fi
    fi
    
    if [ "$has_cutia_field" = false ]; then
      missing_cutia+=("$f")
    fi
  fi
done < <(find content -type f -name 'index.*' -print0)

if [ ${#missing_cutia[@]} -gt 0 ]; then
  echo "❌ Validation failed: Missing or empty 'cutia_ungheni' for national/ue-romania posts (must have at least one field filled):" >&2
  for f in "${missing_cutia[@]}"; do 
    echo " - $f" >&2
  done
  exit 1
fi

echo "✅ Cutia Ungheni validation passed."

# Validate fact-check articles have required fields
invalid_factchecks=()
while IFS= read -r -d '' f; do
  # Extract first front matter block (YAML style)
  fm=$(awk 'BEGIN{fm=0} /^---/{fm++;next} fm==1{print}' "$f")
  # Skip if no YAML front matter
  [ -z "$fm" ] && continue
  
  # Check if file is a factcheck - look for formats field containing factcheck
  if echo "$fm" | grep -q 'formats:' && echo "$fm" | grep -E -i '\b(factcheck)\b'; then
    has_sources=false
    has_rating=false
    
    # Check for sources in verification section
    if echo "$fm" | sed -n '/^verification:/,/^\([a-zA-Z_][a-zA-Z0-9_-]*:\|---\)/p' | grep -A20 "sources:" | grep -q "name:"; then
      has_sources=true
    fi
    
    # Check for fact_check_rating 
    if echo "$fm" | grep -q "fact_check_rating:" && [ -n "$(echo "$fm" | grep "fact_check_rating:" | grep -v "fact_check_rating:\s*$")" ]; then
      has_rating=true
    fi
    
    if [ "$has_sources" = false ] || [ "$has_rating" = false ]; then
      invalid_factchecks+=("$f")
    fi
  fi
done < <(find content -type f -name 'index.*' -print0)

if [ ${#invalid_factchecks[@]} -gt 0 ]; then
  echo "❌ Validation failed: Fact-check articles must have both sources and a rating:" >&2
  for f in "${invalid_factchecks[@]}"; do 
    echo " - $f" >&2
  done
  exit 1
fi

echo "✅ Fact-check validation passed."

# Validate opinion articles have author
invalid_opinions=()
while IFS= read -r -d '' f; do
  # Extract first front matter block (YAML style)
  fm=$(awk 'BEGIN{fm=0} /^---/{fm++;next} fm==1{print}' "$f")
  # Skip if no YAML front matter
  [ -z "$fm" ] && continue
  
  # Check if file is an opinion - look for formats field containing opinie
  if echo "$fm" | grep -q 'formats:' && echo "$fm" | grep -E -i '\b(opinie)\b'; then
    # Check for authors
    has_authors=false
    if echo "$fm" | grep -q "authors:" && [ -n "$(echo "$fm" | grep "authors:" | grep -v "authors:\s*$")" ]; then
      has_authors=true
    fi
    
    if [ "$has_authors" = false ]; then
      invalid_opinions+=("$f")
    fi
  fi
done < <(find content -type f -name 'index.*' -print0)

if [ ${#invalid_opinions[@]} -gt 0 ]; then
  echo "❌ Validation failed: Opinion articles must have at least one author:" >&2
  for f in "${invalid_opinions[@]}"; do 
    echo " - $f" >&2
  done
  exit 1
fi

echo "✅ Opinion article validation passed."

echo "🎉 All content validations passed!"