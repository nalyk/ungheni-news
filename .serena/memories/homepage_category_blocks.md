# Homepage Category Block Layouts

## Overview
Configuration-driven system for displaying category content blocks on homepage with 4 distinct layout types.

## Configuration File
**Location**: `data/homepage_blocks.yaml` (NOTE: underscore, not dash)

**Structure**:
```yaml
blocks:
  - category: local              # Category slug from data/categories.yaml
    layout: split-featured       # Layout type
    limit: 5                     # Number of articles
```

## Layout Types

### 1. Split-Featured (`split-featured`)
**Template**: `layouts/partials/home/category-split-featured.html`
**Best for**: Highlighting one main story with additional articles

**Features**:
- Left: 1 featured article with large image (16:10) + title + summary
- Right: Text-only list (limit - 1 articles)
- 50/50 split desktop, stacked mobile
- Featured card: `.card-split-featured`
- List items: `.card-split-list-item`

**Recommended limit**: 5 (1 featured + 4 list)

### 2. List-Image-First (`list-image-first`)
**Template**: `layouts/partials/home/category-list-image-first.html`
**Best for**: Latest story emphasis with space efficiency

**Features**:
- First article: horizontal layout with image + title + summary
- Rest: compact text-only with left border
- First card: `.card-list-featured`
- Rest: `.card-list-text`

**Recommended limit**: 5 (1 with image + 4 text)

### 3. Text-Only (`text-only`)
**Template**: `layouts/partials/home/category-text-only.html`
**Best for**: Dense information, secondary categories

**Features**:
- No images, just titles + format icons
- Left border accent (color: `--color-accent`)
- Minimal spacing
- Card class: `.card-text-only`

**Recommended limit**: 4

### 4. Horizontal (`horizontal`)
**Template**: `layouts/partials/home/category-horizontal.html`
**Best for**: Balanced display with consistent visual weight

**Features**:
- Image left (4:3 aspect, 180px desktop, 100px mobile)
- Title + summary right
- Format icon top-right of content
- Summary hidden on mobile
- Card class: `.card-horizontal`

**Recommended limit**: 4

## Router System
**Entry point**: `layouts/partials/home/category-block-router.html`
- Reads `data/homepage_blocks.yaml`
- Routes each block to appropriate layout partial
- Passes context, category slug, and limit

**Called from**: `layouts/index.html` → `{{ partial "home/category-block-router.html" . }}`

## Card Component
**Shared component**: `layouts/partials/home/category-card.html`

**Parameters**:
- `page` - Page object
- `card_class` - CSS class determining appearance

**Card Classes**:
- `card-split-featured` - Featured in split layout
- `card-split-list-item` - List items in split layout
- `card-list-featured` - Featured in list-image-first
- `card-list-text` - Text items in list-image-first
- `card-text-only` - Text-only layout cards
- `card-horizontal` - Horizontal layout cards

**Logic**:
- Conditionally shows/hides images based on card class
- Conditionally shows/hides summary based on card class
- Always shows title and format icon

## Styling
**Location**: `assets/css/_category-layouts.scss`

**Sections**:
1. Split-featured layout styles
2. List-image-first layout styles
3. Text-only layout styles
4. Horizontal layout styles
5. Shared category section styles

**Responsive**:
- Desktop (>768px): Full layouts as designed
- Mobile (<768px): Stacked/simplified layouts

## Example Configuration
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

## Best Practices
1. Alternate between image-heavy (split-featured, horizontal) and compact (text-only)
2. Use split-featured or list-image-first for most important categories
3. Don't exceed 5-7 blocks total (performance)
4. Keep limits reasonable (4-6 articles per block)
5. Test in both RO and RU languages
6. Test mobile responsiveness

## Multilingual Support
- Category titles from `data/categories.yaml` with language fallback
- Articles filtered by current language (`$currentLang`)
- Category links include language prefix (`/ro/categories/slug/`)

## Files Reference
**Configuration**:
- `data/homepage_blocks.yaml`

**Templates**:
- `layouts/partials/home/category-block-router.html`
- `layouts/partials/home/category-split-featured.html`
- `layouts/partials/home/category-list-image-first.html`
- `layouts/partials/home/category-text-only.html`
- `layouts/partials/home/category-horizontal.html`
- `layouts/partials/home/category-card.html`

**Styles**:
- `assets/css/_category-layouts.scss`

**Documentation**:
- `docs/category-blocks.md`
