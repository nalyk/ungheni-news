# Category Blocks System for Homepage

## System Overview

The homepage uses a **configuration-driven category blocks system** with 4 distinct layout types that can be mixed and repeated.

## Architecture

**Router Pattern:**
- `layouts/index.html` calls `category-block-router.html`
- Router reads `data/homepage-blocks.yaml` configuration
- Routes each block to appropriate layout partial
- Layouts use shared `category-card.html` component

## Configuration File

**Location:** `data/homepage-blocks.yaml`

**Structure:**
```yaml
blocks:
  - category: local              # Category slug
    layout: masonry              # Layout type
    limit: 6                     # Article count
```

**Layout Types:**
1. `masonry` - Pinterest-style grid, all cards with images
2. `list-image-first` - First card with image, rest text-only
3. `text-only` - Compact text list, no images
4. `horizontal` - Image left, content right

## File Structure

**Templates:**
- `layouts/partials/home/category-block-router.html` - Main router
- `layouts/partials/home/category-masonry.html` - Masonry layout
- `layouts/partials/home/category-list-image-first.html` - List with first image
- `layouts/partials/home/category-text-only.html` - Text-only layout
- `layouts/partials/home/category-horizontal.html` - Horizontal layout
- `layouts/partials/home/category-card.html` - Reusable card component

**Styles:**
- `assets/css/_category-layouts.scss` - All layout styles
- Imported in `assets/css/main.scss` (line 2030)

**Data:**
- `data/homepage-blocks.yaml` - Block configuration

**Documentation:**
- `docs/category-blocks.md` - Full system documentation

## Card Classes

The `category-card.html` component accepts these card classes:

- `card-masonry` - Masonry grid cards (with image)
- `card-list-featured` - Featured first card (with image + summary)
- `card-list-text` - Compact text card (no image)
- `card-text-only` - Minimal text card (no image)
- `card-horizontal` - Horizontal card (image left)

## Key Logic in category-card.html

```go
{{ $text_only_cards := slice "card-list-text" "card-text-only" }}
{{ $show_image := not (in $text_only_cards $card_class) }}

{{ $no_summary_cards := slice "card-featured" "card-hero-main" "card-hero-sub" "card-list-text" "card-text-only" }}
{{ $show_summary := not (in $no_summary_cards $card_class) }}
```

## Multilingual Support

All layouts automatically:
1. Get category name from `data/categories.yaml` with language fallback
2. Filter articles by current language (`$currentLang`)
3. Use language-specific section path (`/ro/news` or `/ru/news`)

## Common Patterns

### Get Articles for Category in Current Language

```go
{{ $currentLang := $context.Language.Lang }}
{{ $lang_news_path := printf "/%s/news" $currentLang }}
{{ $news_section := $context.Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice $category_slug) }}
{{ $pages = first $limit $pages }}
```

### Get Category Display Name

```go
{{ $category_list := where $context.Site.Data.categories "slug" $category_slug }}
{{ $category_data := index $category_list 0 }}
{{ $category_name := index $category_data $currentLang | default $category_data.ro }}
```

## Usage Examples

### Varied Homepage

```yaml
blocks:
  - category: local
    layout: masonry
    limit: 6
  - category: frontiera-transport
    layout: horizontal
    limit: 4
  - category: servicii-publice
    layout: text-only
    limit: 4
```

### Repeated Category

```yaml
blocks:
  - category: local
    layout: masonry
    limit: 6
  - category: local
    layout: text-only
    limit: 3
```

## Responsive Behavior

**Masonry:**
- Desktop: Multi-column grid
- Mobile: Single column

**List-image-first:**
- Desktop: 200px featured image, full content
- Mobile: 120px featured image, reduced padding

**Text-only:**
- Consistent across all sizes

**Horizontal:**
- Desktop: 180px image + summary
- Mobile: 100px image, no summary

## Adding New Layout

1. Create `layouts/partials/home/category-[name].html`
2. Add case to router: `{{ else if eq $layout "[name]" }}`
3. Define card class behavior in `category-card.html`
4. Add styles to `_category-layouts.scss`
5. Update documentation

## Critical Hugo Patterns

**ALWAYS use language-specific section for filtering:**
```go
{{ $news_section := $context.Site.GetPage $lang_news_path }}
{{ $pages := $news_section.Pages }}
```

**NEVER use global taxonomy pages (causes cross-language bleed):**
```go
{{ $pages := where .Pages "Lang" .Site.Language.Lang }}  <!-- WRONG -->
```

## Styling CSS Variables

Uses design tokens from `main.scss`:
- `--space-*` for spacing
- `--color-surface`, `--color-border` for cards
- `--color-primary`, `--color-accent` for accents
- `--font-size-*` for typography
- `--radius-*` for borders

## Build and Deployment

After modifying configuration:
```bash
make build    # Build site
make pagefind # Update search index (if needed)
```

No Hugo restart needed for config changes - just rebuild.

## Performance Notes

- All images use `loading="lazy"` and `decoding="async"`
- Masonry uses CSS Grid (no JavaScript)
- Card hover effects use CSS transitions
- Responsive images handled by Hugo image processing

## Testing Checklist

- [ ] Test in RO and RU languages
- [ ] Verify all layout types display correctly
- [ ] Check responsive behavior (mobile/tablet/desktop)
- [ ] Confirm category links work
- [ ] Validate format icons appear
- [ ] Test hover effects
- [ ] Check empty category behavior
