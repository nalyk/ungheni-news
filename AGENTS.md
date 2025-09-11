# Repository Guidelines

Note: This file is auto-generated. Edit source config/files; run `make docs` to refresh.

## Project Structure & Module Organization
- Hugo newsroom with i18n and Decap CMS. Key paths:
  - `config/_default/`: Hugo config, languages, permalinks, timezone.
  - `content/ro|ru/news/`: language sections using page bundles (…/post/index.md).
  - `content/authors/`: author taxonomy pages (`authors`).
  - `layouts/` (+ `layouts/partials/`): templates; SEO in `partials/head/seo.html`.
  - `layouts/partials/search.html`: Pagefind-based search UI.
  - `static/uploads/`: small fallback uploads (prefer external media).
  - `workers/` + `wrangler.toml`: Cloudflare Worker cron (5‑min scheduled builds).
  - `scripts/`, `Makefile`, `.env.example`, `CODEOWNERS`.
  - `docs/`: operations notes (Cloudflare Access, Cloudinary unsigned preset).

## Build, Test, and Development Commands
- `make build`: Production build with GC and minify.
- `make check`: Build with warnings surfaced (panic on warning).
- `make dev`: Run Hugo locally with drafts.
- `make docs`: Regenerate AGENTS.md from repo state.
- `make pagefind`: Generate static search index from public/.
- `make setup`: Install pre-commit hook to auto-update AGENTS.md.
- `make validate`: Fail if publishDate conflicts with draft:true.
- Cloudflare Pages: build with `make build && make pagefind`; output `public/`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF‑8; LF (see `.editorconfig`).
- Front matter: set explicit `slug`; prefer ASCII slugs; mirror content in `ro/` and `ru/`.
- Media: use Cloudinary via Decap (free tier) or keep repo images small in `static/uploads`.
- Authors: set `authors: ["Name"]` in posts; taxonomy pages are under `/authors/`.

## Testing Guidelines
- Content rule: `make validate` rejects `draft:true` + `publishDate`.
- Build sanity: `make check` surfaces warnings; verify PR preview renders key pages.
- Search: run `make pagefind` so the Pagefind index exists for previews/deploys.

## Commit & Pull Request Guidelines
- Conventional Commits; reference issues (e.g., `fixes #123`).
- Include Cloudflare preview URL in PR; respect `CODEOWNERS`.

## Security & Configuration Tips
- Protect `/admin/*` with Cloudflare Access; never commit secrets; use `.env`.
- Scheduling: `timeZone = "Europe/Chisinau"`; Worker cron POSTs the Pages Deploy Hook every 5 minutes.

## Agent-Specific Instructions
- Use `apply_patch` for changes; keep diffs focused.
- Update this file via `make docs`; CI guards divergence on PRs.
