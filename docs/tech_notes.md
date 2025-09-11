# Tech Notes (2025 refresh)

- Responsive images: use `layouts/partials/media/image.html`.
  - Prefer page resources named `featured*` inside bundles.
  - Front matter `cover:` or `image:` falls back to Cloudinary (if configured) or static.
  - Configure `params.cloudinary_url` in `config/_default/config.toml` to enable Cloudinary responsive variants.

- Search UX: header autocomplete now integrates Pagefind.
  - Runs only when typing (2+ chars), falls back to popular terms if Pagefind not present.
  - Ensure `make pagefind` runs on deploy so `/pagefind/pagefind.js` exists.

- SEO: added WebSite + SearchAction JSON‑LD and Organization schema on homepage.

- Visual adjustments: toned hover/animation for a more sober newsroom feel.

