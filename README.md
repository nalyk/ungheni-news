# Ungheni News — PoC (Hugo + Decap + Cloudflare Pages)

Quick start
- Local dev: `make dev` (visit http://localhost:1313)
- Build: `make build` (outputs to `public/`)
- Search index: `make pagefind` (generates Pagefind index in `public/`)

Cloudflare Pages
1) Connect this repo to Cloudflare Pages (Project name: `ungheni-news`).
   - Build command: `make build && make pagefind`
   - Output directory: `public`
2) Create a Deploy Hook and copy its URL.
3) Paste the hook into `wrangler.toml` as `BUILD_HOOK_URL` and deploy the Worker cron:
   - `npm i -g wrangler` (or use GitHub Action)
   - `wrangler deploy` (requires Cloudflare auth)

Automation scripts (optional)
- `scripts/cf_pages_setup.sh`: Creates a Pages project and deploy hook via API.
  - Requires env: `CLOUDFLARE_API_TOKEN`, `CF_ACCOUNT_ID` (defaults to provided one).
- `scripts/cf_access_setup.sh`: Creates a Cloudflare Access app for `/admin/*`.
  - Requires env: `CLOUDFLARE_API_TOKEN`, `CF_ACCOUNT_ID`, `APP_DOMAIN`.

Decap CMS
- Admin UI: `/admin/` (protect with Cloudflare Access)
- GitHub backend repo: `nalyk/ungheni-news` (set in `admin/config.yml`)
- Media: Cloudinary (free tier) via `admin/config.yml` or use `static/uploads` for small files.

Docs
- Cloudflare Access policy: `docs/cloudflare-access.md`
- Cloudinary unsigned preset: `docs/cloudinary-unsigned.md`

