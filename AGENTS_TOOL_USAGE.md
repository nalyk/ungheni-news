# AGENTS Tool Usage (AI-Only)

Purpose: Enable any AI agent to develop this Hugo + Decap CMS newsroom repo quickly and safely, using the available tools with minimal friction and zero guesswork.

Scope: Tool selection, invocation patterns, validation loops, and repo-specific conventions. This is for agents, not humans.

## Outcomes You Optimize For
- Correctness first: builds succeed; UI and content render as expected.
- Minimal diffs: surgical, low‑risk edits aligned with existing style.
- Fast iteration: targeted search, precise reads, and validated changes.
- Predictable deploys: pushes to `main` trigger Cloudflare Pages builds.

## Tool Inventory & When To Use

- `update_plan` (planning): Maintain a short, evolving plan for multi-step work. Exactly one step `in_progress` at a time.
  - Use for non-trivial changes, migrations, or multi-file refactors.

- `shell` (system commands):
  - Search: prefer `rg` for speed (`rg pattern -n path/`); list files with `rg --files`.
  - Read files in chunks: `sed -n '1,200p' path`; keep reads ≤250 lines.
  - Git: stage/commit/push; conventional commit messages.
  - Make: run `make build|check|validate|pagefind|dev`.
  - NEVER write large files via shell here; use `apply_patch` instead.

- `apply_patch` (file edits): Single source of truth for edits. Keep diffs focused and minimal. Follow 2‑space indentation, UTF‑8, LF.

- `playwright-extension` (browser): Use to verify UI flows after deploys or against a local dev server. Prefer `browser_snapshot` for structure, `browser_take_screenshot` for visuals; use `browser_resize` for responsive checks.

- `sequential-thinking` (reasoning): For complex tasks, create a step sequence; revise as needed; confirm solution before final output.

- `serena` project tools (code navigation/editing):
  - `serena__activate_project { project: "." }` to enable symbol ops if available.
  - `serena__find_symbol`, `serena__find_referencing_symbols`, `serena__insert_*`, `serena__replace_symbol_body` for precise edits.
  - Fallback to `rg` + `apply_patch` if no project context is registered.

- `context7` docs (library docs):
  - `resolve-library-id` → `get-library-docs` for exact framework/library APIs.
  - Use sparingly; prefer reading repo code and Hugo docs already embedded in templates.

- `tavily-mcp` (web search/crawl/extract/map): For external research when required. Not needed for core repo development.

## Project Knowledge (what matters for agents)

- Static site with Hugo 0.127.x; content is multilingual (RO/RU) and organized in page bundles: `content/[lang]/news/[slug]/index.md` with resources beside.
- Decap CMS (`static/admin/`) manages content via GitHub backend and a Cloudflare Function (`functions/api/auth.js`) for OAuth.
- Cloudflare Pages builds on push to `main`. Scheduled Worker (`workers/cron.js`) triggers builds every 5 minutes for scheduled posts.
- Search uses Pagefind; you must run `make pagefind` after `make build` so `/public/pagefind` exists in deploy.
- Critical templates live under `layouts/` and `layouts/partials/`. See `layouts/partials/head/seo.html`, `layouts/_default/*`, and `layouts/partials/search.html`.
- Data-driven UI in `data/*.yaml` (categories, rails, navigation, colors, site metadata).
- i18n under `i18n/ro.yaml` and `i18n/ru.yaml`.

## Command Cheatsheet (use Makefile only)

- `make dev` — local dev server with drafts.
- `make build` — production build with GC + minify.
- `make pagefind` — generate static search index from `public/`.
- `make check` — strict build; fails on warnings.
- `make validate` — content rule checks (e.g., draft vs publishDate).

Rule: Always prefer `make` over direct `hugo`; only call `hugo` directly if explicitly instructed and you know the correct binary path.

## High-ROI Workflows (step-by-step)

1) Add or update an article
- Search similar bundles: `rg -n "news/.*index.md" content/ro`.
- Create/edit `content/ro/news/<slug>/index.md` and mirror in `content/ru/news/<slug>/index.md` when applicable.
- Keep images as page resources in the same bundle directory; reference via `.Resources.Get` in templates.
- Validate/build: `make validate && make check && make build && make pagefind`.

2) Modify templates/styles/JS safely
- Locate templates: `layouts/_default`, key partials in `layouts/partials/`.
- Read target file in chunks. Edit with `apply_patch` keeping changes minimal.
- Build and verify: `make check` → `make build` → `make pagefind`.
- Optional: Use `playwright-extension` to snapshot affected pages after deploy.

3) Update data-driven UI
- Edit `data/*.yaml` (e.g., `data/navigation.yaml`, `data/rails.yaml`, `data/categories.yaml`).
- Build + check search: `make build && make pagefind`.

4) OAuth/Decap CMS debugging
- Key files: `functions/api/auth.js`, `static/admin/index.html`, `static/admin/config.yml`.
- Verify the two-step `postMessage` sequence in `auth.js` and explicit origin.
- Build, deploy, then verify `/admin/` flow using `playwright-extension` if needed.

## Search, Read, Edit Patterns (Fast + Safe)

- Find files: `rg --files` or restrict to a directory.
- Find content: `rg -n "pattern" path/` (anchor patterns; avoid greedy matches).
- Read chunks: `sed -n '1,200p' path` then continue: `sed -n '201,400p' path`.
- Edit via `apply_patch` only. Keep hunks tight and avoid unrelated changes.

## Validation Loop (don’t skip)

1. `make validate` (content rules)
2. `make check` (strict warnings)
3. `make build && make pagefind` (production + search)
4. Inspect console output; address warnings/errors before pushing.

## Git & Deploy

- Commit: conventional messages (e.g., `feat:`, `fix:`, `chore:`). Keep subject ≤72 chars; body lists key changes.
- Push to `main` to trigger Cloudflare Pages deploy.
- Scheduled Worker builds run every 5 minutes regardless of commits, to publish scheduled content.

## Browser Verification (optional but powerful)

- After deploy: use `playwright-extension` to:
  - `browser_snapshot` key pages for structure checks.
  - `browser_take_screenshot` and store in a dev-only folder (not committed) for visual diffs.
  - `browser_resize` to validate mobile/tablet/desktop.
  - `browser_network_requests` to catch 404s (especially the Pagefind assets).

## Guardrails (Hard Rules)

- Do not reintroduce any automation that auto-generates documentation. Keep docs manual unless explicitly instructed otherwise.
- Respect 2-space indentation and existing style.
- Avoid broad refactors without explicit instruction and plan agreement.
- Keep edits localized; don’t rename or move files unless necessary and agreed.
- Never commit secrets; `.env` for local only.

## Quick Decision Tree

- Content or data change? → Edit `content/` or `data/`; run `make validate/check/build/pagefind`.
- Template/CSS/JS change? → Edit in `layouts/` or `assets/`; build and verify.
- Build/search failing? → Run `make check`; inspect errors; fix templates or content; regenerate with `make pagefind`.
- OAuth/CMS issue? → Inspect `functions/api/auth.js` and admin assets; ensure two-step postMessage and explicit origin.
- External docs needed? → Use `context7` tools; otherwise prefer local code/doc reading.

## Minimal Example: Template Tweak

1) Plan
- `update_plan`: ["Identify target partial", "Patch partial", "Build + validate"]

2) Search
- `shell`: `rg -n "seo" layouts/partials`

3) Read
- `shell`: `sed -n '1,200p' layouts/partials/head/seo.html`

4) Edit
- `apply_patch`: modify small section; keep surrounding context.

5) Validate
- `shell`: `make check && make build && make pagefind`

6) Commit/Push
- `shell`: `git add -A && git commit -m "feat: improve SEO meta tags" && git push`

## Minimal Example: New RO/RU Post

1) Create bundles
- `shell`: create `content/ro/news/my-slug/index.md` and mirror `content/ru/news/my-slug/index.md` if available.

2) Front matter
- Include title, summary, categories, formats, authors, dates; set `slug` explicitly; add page resources (images) next to `index.md`.

3) Build + index
- `shell`: `make validate && make build && make pagefind`

4) Verify
- Open local `public/` or wait for Pages; ensure the page renders and appears in search.

---

Operate with discipline: plan, search, read minimally, patch surgically, validate, and only then push. This yields fast, correct, and low-risk changes for this project.

