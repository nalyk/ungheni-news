# Category Block Layouts System

## Overview

The homepage category blocks system provides a flexible, configuration-driven way to display category content with multiple layout types. Each category can be displayed with a different visual style, and blocks can be repeated as needed.

## Features

- **4 distinct layout types** (split-featured, list-image-first, text-only, horizontal)
- **Configuration-driven** via `data/homepage-blocks.yaml`
- **Repeatable blocks** - display the same category multiple times with different layouts
- **Parametrizable article counts** - control how many articles appear in each block
- **Multilingual support** - works with both RO and RU content

## Layout Types

### 1. Split-Featured Layout (`split-featured`)

Two-column layout with featured article (with image) on the left and text-only list on the right.

**Best for:** Categories where you want to highlight one main story while showing additional articles

**Features:**
- Left: ONE featured article with large image (16:10 aspect ratio) + title + summary
- Right: Configurable text-only list (limit minus 1) with compact styling
- 50/50 split on desktop, stacked on mobile
- Featured card has border hover effect
- List items have left border accent

**CSS Classes:**
- Container: `.category-split-container`
- Featured card: `.card-split-featured`
- List items: `.card-split-list-item`

**Recommended limit:** 5 (1 featured + 4 in list)

### 2. List with First Image (`list-image-first`)

First (most recent) article displays with image, rest are text-only items.

**Best for:** Categories where the latest story is most important

**Features:**
- Featured first card: horizontal layout with image + title + summary
- Rest: compact text-only cards with left border accent
- Clear visual hierarchy
- Efficient use of space

**CSS Classes:**
- First card: `.card-list-featured`
- Rest: `.card-list-text`

### 3. Text-Only List (`text-only`)


Compact list with no images, just titles and format icons.

**Best for:** Dense information display, secondary categories

**Features:**
- Minimal design with left border accent
- Compact spacing
- Format icons for quick scanning
- Hover effects with border color change

**CSS Class:** `.card-text-only`

### 4. Horizontal Layout (`horizontal`)

Each article displays as a horizontal card with image on left, content on right.

**Best for:** Balanced display with consistent visual weight

**Features:**
- Image left (4:3 aspect ratio)
- Title + summary on right
- Format icon in top-right of content
- Summary hidden on mobile

**CSS Class:** `.card-horizontal`

## Configuration

### Location

`data/homepage_blocks.yaml`

### Structure

```yaml
blocks:
  - category: local              # Category slug from data/categories.yaml
    layout: masonry              # Layout type (masonry, list-image-first, text-only, horizontal)
    limit: 6                     # Number of articles to display

  - category: frontiera-transport
    layout: horizontal
    limit: 4

  # ... more blocks
```

### Parameters

- **category** (required): Category slug (must match slug in `data/categories.yaml`)
- **layout** (required): Layout type - one of:
  - `split-featured`
  - `list-image-first`
  - `text-only`
  - `horizontal`
- **limit** (optional, default: varies by layout): Number of articles to display

### Default Limits

- `split-featured`: 5 articles (1 featured + 4 in list)
- `list-image-first`: 5 articles (1 with image + 4 text-only)
- `text-only`: 4 articles
- `horizontal`: 4 articles

## Implementation

### Router Pattern

The system uses a router pattern to delegate to the appropriate layout partial:

```
layouts/index.html
  └→ layouts/partials/home/category-block-router.html
       ├→ layouts/partials/home/category-split-featured.html
       ├→ layouts/partials/home/category-list-image-first.html
       ├→ layouts/partials/home/category-text-only.html
       └→ layouts/partials/home/category-horizontal.html
```

### Files

1. **Configuration:**
   - `data/homepage_blocks.yaml` - Block configuration (NOTE: underscore, not dash)

2. **Templates:**
   - `layouts/partials/home/category-block-router.html` - Routes to layout partials
   - `layouts/partials/home/category-split-featured.html` - Split-featured layout
   - `layouts/partials/home/category-list-image-first.html` - List with first image
   - `layouts/partials/home/category-text-only.html` - Text-only list
   - `layouts/partials/home/category-horizontal.html` - Horizontal cards
   - `layouts/partials/home/category-card.html` - Reusable card component

3. **Styles:**
   - `assets/css/_category-layouts.scss` - All layout styles
   - `assets/css/main.scss` - Imports category layouts

### Card Component

`layouts/partials/home/category-card.html` is a flexible component that adapts based on the `card_class` parameter:

**Card Classes:**
- `card-split-featured` - Featured card in split layout (left side with image)
- `card-split-list-item` - List items in split layout (right side, text-only)
- `card-list-featured` - Featured card with image (first in list-image-first)
- `card-list-text` - Text-only card (rest of list-image-first)
- `card-text-only` - Text-only cards (text-only layout)
- `card-horizontal` - Horizontal cards with image left

**Parameters:**
- `page` - The page object
- `card_class` - CSS class determining appearance

## Usage Examples

### Basic Configuration

Display 5 categories with different layouts:

```yaml
blocks:
  - category: local
    layout: horizontal
    limit: 5

  - category: frontiera-transport
    layout: split-featured
    limit: 5

  - category: economie-zel
    layout: list-image-first
    limit: 5

  - category: servicii-publice
    layout: text-only
    limit: 4

  - category: educatie-sanatate
    layout: horizontal
    limit: 3
```

### Repeating Blocks

Show the same category twice with different layouts:

```yaml
blocks:
  - category: local
    layout: split-featured
    limit: 5

  - category: local
    layout: text-only
    limit: 3
```

### Mixed Layout Homepage

Alternate between visual and compact layouts:

```yaml
blocks:
  - category: local
    layout: split-featured
    limit: 5

  - category: frontiera-transport
    layout: text-only
    limit: 4

  - category: economie-zel
    layout: horizontal
    limit: 4

  - category: servicii-publice
    layout: text-only
    limit: 4
```

## Styling

### CSS Variables Used

- `--space-*` - Spacing scale
- `--color-surface` - Card background
- `--color-border` - Card borders
- `--color-primary` - Accent color
- `--color-accent` - Secondary accent
- `--color-text` - Primary text
- `--color-text-secondary` - Secondary text
- `--color-hover` - Hover background
- `--font-size-*` - Typography scale
- `--radius-*` - Border radius scale

### Responsive Behavior

All layouts are fully responsive:

**Desktop (>768px):**
- Split-featured: 50/50 two-column layout
- List-image-first: Full-width cards
- Text-only: Full-width list
- Horizontal: 180px image + content

**Mobile (<768px):**
- Split-featured: Stacked (featured on top, list below)
- List-image-first: Smaller featured image (120px)
- Text-only: Full-width compact
- Horizontal: 100px image, no summary

## Multilingual Support

All layouts automatically work with the multilingual system:

1. Category titles are pulled from `data/categories.yaml` with language fallback
2. Articles are filtered by current language
3. Links include language prefix (`/ro/` or `/ru/`)

## Customization

### Adding a New Layout Type

1. Create new partial in `layouts/partials/home/category-[name].html`
2. Add routing case in `category-block-router.html`
3. Add new card class in `category-card.html` if needed
4. Add styles in `assets/css/_category-layouts.scss`
5. Update this documentation

### Modifying Existing Layouts

All layout styles are in `assets/css/_category-layouts.scss`. Each layout section is clearly marked with comments.

## Troubleshooting

### Block Not Showing

- Verify category slug exists in `data/categories.yaml`
- Check that category has articles in current language
- Confirm layout type is valid
- Run `make build` to see any template errors

### Styling Issues

- Clear Hugo cache: `rm -rf resources public`
- Rebuild: `make build`
- Check browser console for CSS loading errors
- Verify `_category-layouts.scss` is imported in `main.scss`

### Content Issues

- Ensure articles have required front matter (categories, formats)
- Check `make validate` for content validation errors
- Verify articles are not drafts
- Confirm publishDate is not in future

## Best Practices

1. **Visual variety:** Alternate between image-heavy (split-featured, horizontal) and compact (text-only) layouts
2. **Hierarchy:** Use split-featured or list-image-first for most important categories
3. **Performance:** Don't display too many blocks (5-7 recommended)
4. **Article limits:** Keep limits reasonable (4-6 articles per block)
5. **Testing:** Always test in both RO and RU, and on mobile
6. **Split-featured usage:** Best with 5+ articles (1 featured + 4+ list items)

## Migration from Old System

The previous system used hardcoded partials in `layouts/index.html`:

```html
<!-- OLD -->
{{ partial "home/category-hero.html" (dict "context" . "category" "local" "limit" 5) }}
{{ partial "home/category-featured.html" (dict "context" . "category" "frontiera-transport" "limit" 4) }}
```

New system uses single router call:

```html
<!-- NEW -->
{{ partial "home/category-block-router.html" . }}
```

Configuration moved to `data/homepage-blocks.yaml` for easy editing without touching templates.
