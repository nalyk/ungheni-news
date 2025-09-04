#!/usr/bin/env bash
set -euo pipefail

root_dir=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$root_dir"

# Detect key paths
have() { [ -d "$1" ] && echo "$1"; }

paths=(
  $(have config/_default)
  $(have content)
  $(have layouts)
  $(have layouts/partials)
  $(have admin)
  $(have static/uploads)
  $(have workers)
  $(have scripts)
  $(have docs)
)

# Parse Makefile targets (top-level, simple targets)
targets=$(awk -F: '/^[a-zA-Z0-9_.-]+:/{print $1}' Makefile | grep -E '^(dev|build|pagefind|check|validate|docs|setup)$' | sort -u)

# Map target descriptions
describe_target() {
  case "$1" in
    dev) echo "Run Hugo locally with drafts." ;;
    build) echo "Production build with GC and minify." ;;
    pagefind) echo "Generate static search index from public/." ;;
    check) echo "Build with warnings surfaced (panic on warning)." ;;
    validate) echo "Fail if publishDate conflicts with draft:true." ;;
    docs) echo "Regenerate AGENTS.md from repo state." ;;
    setup) echo "Install pre-commit hook to auto-update AGENTS.md." ;;
    *) echo "" ;;
  esac
}

# Compose AGENTS.md
tmp=$(mktemp)
{
  echo "# Repository Guidelines"
  echo
  echo "Note: This file is auto-generated. Edit source config/files; run \`make docs\` to refresh."
  echo
  echo "## Project Structure & Module Organization"
  echo "- Hugo newsroom with i18n and Decap CMS. Key paths:"
  [ -d config/_default ] && echo "  - \`config/_default/\`: Hugo config, languages, permalinks, timezone."
  [ -d content ] && echo "  - \`content/ro|ru/news/\`: language sections using page bundles (…/post/index.md)."
  [ -d content/authors ] && echo "  - \`content/authors/\`: author taxonomy pages (\`authors\`)."
  [ -d layouts ] && echo "  - \`layouts/\` (+ \`layouts/partials/\`): templates; SEO in \`partials/head/seo.html\`."
  [ -f layouts/partials/search.html ] && echo "  - \`layouts/partials/search.html\`: Pagefind-based search UI."
  [ -d admin ] && echo "  - \`admin/\`: Decap CMS (\`index.html\`, \`config.yml\`)."
  [ -d static ] && echo "  - \`static/uploads/\`: small fallback uploads (prefer external media)."
  [ -d workers ] && echo "  - \`workers/\` + \`wrangler.toml\`: Cloudflare Worker cron (5‑min scheduled builds)."
  [ -d scripts ] && echo "  - \`scripts/\`, \`Makefile\`, \`.env.example\`, \`CODEOWNERS\`."
  [ -d docs ] && echo "  - \`docs/\`: operations notes (Cloudflare Access, Cloudinary unsigned preset)."
  echo
  echo "## Build, Test, and Development Commands"
  for t in $targets; do
    desc=$(describe_target "$t")
    echo "- \`make $t\`: $desc"
  done
  echo "- Cloudflare Pages: build with \`make build && make pagefind\`; output \`public/\`."
  echo
  echo "## Coding Style & Naming Conventions"
  echo "- Indentation: 2 spaces; UTF‑8; LF (see \`.editorconfig\`)."
  echo "- Front matter: set explicit \`slug\`; prefer ASCII slugs; mirror content in \`ro/\` and \`ru/\`."
  echo "- Media: use Cloudinary via Decap (free tier) or keep repo images small in \`static/uploads\`."
  echo "- Authors: set \`authors: [\"Name\"]\` in posts; taxonomy pages are under \`/authors/\`."
  echo
  echo "## Testing Guidelines"
  echo "- Content rule: \`make validate\` rejects \`draft:true\` + \`publishDate\`."
  echo "- Build sanity: \`make check\` surfaces warnings; verify PR preview renders key pages."
  echo "- Search: run \`make pagefind\` so the Pagefind index exists for previews/deploys."
  echo
  echo "## Commit & Pull Request Guidelines"
  echo "- Conventional Commits; reference issues (e.g., \`fixes #123\`)."
  echo "- Include Cloudflare preview URL in PR; respect \`CODEOWNERS\`."
  echo
  echo "## Security & Configuration Tips"
  echo "- Protect \`/admin/*\` with Cloudflare Access; never commit secrets; use \`.env\`."
  echo "- Scheduling: \`timeZone = \"Europe/Chisinau\"\`; Worker cron POSTs the Pages Deploy Hook every 5 minutes."
  echo
  echo "## Agent-Specific Instructions"
  echo "- Use \`apply_patch\` for changes; keep diffs focused."
  echo "- Update this file via \`make docs\`; CI guards divergence on PRs."
} > "$tmp"

# Replace only if changed
if ! cmp -s "$tmp" AGENTS.md 2>/dev/null; then
  mv "$tmp" AGENTS.md
  echo "AGENTS.md updated"
else
  rm -f "$tmp"
  echo "AGENTS.md already up to date"
fi
