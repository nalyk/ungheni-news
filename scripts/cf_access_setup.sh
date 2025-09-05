#!/usr/bin/env bash
set -euo pipefail

# Creates a Cloudflare Access application to protect /admin/*.
# Requires: CLOUDFLARE_API_TOKEN, CF_ACCOUNT_ID, ZONE_ID, APP_DOMAIN
# Example: APP_DOMAIN="newsroom.example.org"

CF_API="https://api.cloudflare.com/client/v4"
ACCOUNT_ID="${CF_ACCOUNT_ID:-5b7ec8f8897cd3f68bbf624e60eb0a57}"
ZONE_ID="${ZONE_ID:-247cc9eb7e5a364180af335719b0bb49}"
APP_DOMAIN="${APP_DOMAIN:-}"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "$APP_DOMAIN" ]]; then
  echo "Set CLOUDFLARE_API_TOKEN and APP_DOMAIN (e.g., site.example.org)." >&2
  exit 2
fi

auth=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

payload=$(cat <<JSON
{
  "name": "Decap Admin",
  "domain": "${APP_DOMAIN}/admin/*",
  "session_duration": "24h",
  "destinations": [{"pattern": "${APP_DOMAIN}/admin/*", "origin": "https://${APP_DOMAIN}"}],
  "policies": [
    {
      "decision": "allow",
      "include": [{"email_domain": {"domain": "yournewsroom.md"}}],
      "require": [{"login_method": {"id": "google"}}]
    }
  ]
}
JSON
)

curl -fsS -X POST "$CF_API/accounts/$ACCOUNT_ID/access/apps" \
  -H 'Content-Type: application/json' "${auth[@]}" \
  --data "$payload" | sed -n '1,120p'

echo "Created Access application targeting https://${APP_DOMAIN}/admin/*"

