#!/usr/bin/env bash
set -euo pipefail

# Creates a Cloudflare Pages project (Direct Upload), a Deploy Hook, and prints the hook URL.
# Requires: CLOUDFLARE_API_TOKEN, CF_ACCOUNT_ID
# Optional: PROJECT_NAME (default: ungheni-news), PRODUCTION_BRANCH (default: main)

CF_API="https://api.cloudflare.com/client/v4"
ACCOUNT_ID="${CF_ACCOUNT_ID:-5b7ec8f8897cd3f68bbf624e60eb0a57}"
PROJECT_NAME="${PROJECT_NAME:-ungheni-news}"
PRODUCTION_BRANCH="${PRODUCTION_BRANCH:-main}"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN is not set. Skipping Pages setup." >&2
  exit 2
fi

auth=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")
json() { sed -n 's/.*"\(https:\/\/[^"}]*\)".*/\1/p'; }

echo "Ensuring Pages project: $PROJECT_NAME"
create_payload=$(cat <<JSON
{
  "name": "${PROJECT_NAME}",
  "production_branch": "${PRODUCTION_BRANCH}",
  "build_config": {"build_command": "make build && make pagefind", "destination_dir": "public"}
}
JSON
)
curl -fsS -X POST "$CF_API/accounts/$ACCOUNT_ID/pages/projects" \
  -H 'Content-Type: application/json' "${auth[@]}" \
  --data "$create_payload" >/dev/null || true

echo "Creating (or retrieving) Deploy Hook"
hook_resp=$(curl -fsS -X POST "$CF_API/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/hook" \
  -H 'Content-Type: application/json' "${auth[@]}" \
  --data '{"name":"cron-hook"}') || true

hook_url=$(echo "$hook_resp" | grep -o 'https://api.cloudflare.com/client/v4/pages/webhooks/deployhooks/[^"]*' || true)
if [[ -z "$hook_url" ]]; then
  # Try listing hooks and pick the first
  list_resp=$(curl -fsS -X GET "$CF_API/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/hooks" "${auth[@]}")
  hook_url=$(echo "$list_resp" | grep -o 'https://api.cloudflare.com/client/v4/pages/webhooks/deployhooks/[^"]*' | head -n1 || true)
fi

if [[ -n "$hook_url" ]]; then
  echo "Deploy Hook URL: $hook_url"
  echo "You can set this into wrangler.toml as BUILD_HOOK_URL."
else
  echo "Failed to obtain Deploy Hook URL. Check permissions (Pages:Edit) on API token." >&2
  exit 1
fi

