# Repository Guidelines

## Project Structure & Module Organization
- Hugo newsroom with i18n and Decap CMS.
- Key paths:
  - `config/_default/` — Hugo config (languages, permalinks, timezone).
  - `content/ro|ru/news/` — language sections using page bundles (`…/post/index.md`).
  - `content/authors/` — author taxonomy pages (`/authors/`).
  - `layouts/` + `layouts/partials/` — templates; SEO in `partials/head/seo.html`.
  - `layouts/partials/search.html` — Pagefind search UI.
  - `admin/` — Decap CMS (`index.html`, `config.yml`); media in `static/uploads/`.
  - `workers/`, `wrangler.toml` — Cloudflare Worker cron; `data/`, `i18n/` — metadata/translations.
  - `scripts/`, `Makefile`, `.env.example`, `CODEOWNERS`, `docs/`.

## Build, Test, and Development Commands
- `make dev` — run Hugo locally with drafts.
- `make build` — production build with GC and minify (outputs `public/`).
- `make check` — build with warnings surfaced (panic on warning).
- `make validate` — fail if `draft: true` conflicts with `publishDate`.
- `make pagefind` — generate static search index from `public/`.
- `make docs` — regenerate this guide; `make setup` installs pre-commit hook.
- Deploy (Cloudflare Pages): `make build && make pagefind` → `public/`; Hugo bin: `HUGO=/home/nalyk/bin/hugo`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF‑8; LF (see `.editorconfig`).
- Front matter: set explicit `slug` (ASCII), mirror content in `ro/` and `ru/`.
- Media: prefer Cloudinary via Decap; keep repo images small in `static/uploads`.
- Authors: `authors: ["Name"]` in posts.

## Testing Guidelines
- No unit tests; rely on `make check` and `make validate`.
- Run `make pagefind` for previews/deploys so search works.

## Commit & Pull Request Guidelines
- Use Conventional Commits; reference issues (e.g., `fix: title typo, fixes #123`).
- PRs: include description, Cloudflare preview URL, and respect `CODEOWNERS`.

## Security & Configuration Tips
- Protect `/admin/*` with Cloudflare Access; never commit secrets (use `.env`).
- Timezone: `Europe/Chisinau`; Worker cron posts deploy hook every 5 minutes.
- Decap OAuth: `functions/api/auth.js` (GitHub backend); set `GITHUB_CLIENT_SECRET` in CF Pages.

## Agent-Specific Instructions
- Use `apply_patch`; keep diffs focused. Update via `make docs` (CI checks).
- Avoid deprecated MCP Playwright tools; test manually or ask user.

## Editorial Conventions
- Local‑first: 60/30/10 (Local/National/International) with mandatory “Cutia Ungheni” for all non‑local pieces.
- Formats: Știre, Analiză, Explainer, Opinie, Fact‑check. Use format labels (not new categories); display consistently.
- Categories: Local; Frontieră & Transport; Economie & FEZ; Servicii publice; Educație & Sănătate; Național; UE & România.
- Verification: aim for Oameni + Documente + Date (≥2/3 to publish); add “Cum am verificat” box on major pieces.
