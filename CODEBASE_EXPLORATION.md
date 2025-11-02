# Triunghi.md Codebase Exploration Report

## 1. EXISTING TAXONOMIES

### 1.1 Hugo Taxonomies (config/_default/config.toml)
```toml
[taxonomies]
  tag = "tags"
  author = "authors"
  category = "categories"
  format = "formats"
```

Four taxonomies are configured:

#### Categories (7 main + subsections)
File: `data/categories.yaml`

**Local Categories (60% content)**
- `local` - Ungheni local news
  - Subsections: Administrație, Infrastructură, Comunitate & Evenimente, Siguranță, Cultură & Sport
- `frontiera-transport` - Border & Transport
  - Subsections: Trafic Vamal, Căi Ferate, Drumuri & rute
- `economie-fez` - Economy & FEZ
  - Subsections: FEZ Ungheni-Business, IMM-uri, Locuri de muncă
- `servicii-publice` - Public Services
  - Subsections: Întreruperi (apă/energie), Salubritate, Programări, Hărți utile
- `educatie-sanatate` - Education & Health

**Non-Local Categories (require "Cutia Ungheni")**
- `national` - National news (30% content)
- `ue-romania` - EU & Romania (10% content)
  - Subsections: Proiecte RO-MD, Granturi UE, Mobilitate muncă

**Current Usage**: Each article uses 1 category (enforced by CMS: `max: 1` in config.yml)

#### Formats (5 types)
File: `data/formats.yaml`

1. **Știre** (News) - Blue, newspaper icon
   - Length: 300-800 words
   - Sources required: 2
   - Verification: Standard
   
2. **Analiză** (Analysis) - Purple, bar-chart icon
   - Length: 800-1500 words
   - Sources required: 3
   - Verification: Enhanced
   
3. **Explainer** - Green, help-circle icon
   - Length: 600-1200 words
   - Sources required: 2
   - Verification: Standard
   - Visual elements required
   
4. **Opinie** (Opinion) - Orange, message-square icon
   - Length: 400-1000 words
   - Sources required: 1
   - Verification: Minimal
   - Author byline required
   - Disclaimer required
   
5. **Factcheck** - Red, check-circle icon
   - Length: 500-1200 words
   - Sources required: 3
   - Verification: Maximum
   - Rating required
   - Methodology required

**Current Usage**: Each article uses 1 format (enforced by CMS: `max: 1`)

#### Tags
- **NOT CURRENTLY USED** in any articles examined
- Taxonomy configured but no front matter usage found
- Could be leveraged for series, themes, or cross-cutting topics

#### Authors
- **Legacy system**: Simple slug references in `authors` field
- **New system**: Advanced `contributors` field with roles (Decap CMS config shows roles: jurnalist, redactor, fotograf, cameraman, traducator, editor, grafician, analist, corespondent)
- **Current usage**: All articles use `authors: ["redactia"]` (editorial)
- **Structure**: `content/authors/` folder (not yet created in repo)

### 1.2 Multilingual Handling
- **Languages**: Romanian (RO, weight 1) + Russian (RU, weight 2)
- **Content structure**: Separate folders `content/ro/news/` and `content/ru/news/`
- **Current state**: Russian section has only `_index.md`, no articles yet

---

## 2. FRONT MATTER FIELDS (CURRENT USAGE)

### Standard Article Fields
```yaml
---
title: "Article Title"
date: 2025-10-08T15:00:00+03:00
slug: "article-slug"
summary: "Brief description (1-2 sentences)"
categories: ["local"]           # ALWAYS 1 category
formats: ["analiza"]            # ALWAYS 1 format
authors: ["redactia"]           # ALWAYS at least 1 (currently all "redactia")
draft: false
---
```

### Optional Fields (Rarely/Never Used)
- `publishDate` - Scheduled publishing (CMS supports, not used in articles)
- `expiryDate` - Content expiration (CMS supports, not used)
- `featured` - Homepage promotion (CMS supports, not used)
- `cover` - Hero image (CMS supports, not found in articles)
- `cover_alt` - Alt text for cover (CMS supports)
- `gallery` - Image gallery (CMS supports, not found)
- `contributors` - Advanced authorship with roles (CMS supports, NOT used yet)

### Special Fields (Used When Needed)

#### Cutia Ungheni (Local Context Box)
**Required for**: `national` and `ue-romania` categories

```yaml
cutia_ungheni:
  title: "Optional custom title"
  content: "Markdown content explaining local impact"
  # OR legacy format:
  impact_local: "Short text about local impact"
  ce_se_schimba: "What changes"
  termene: "Deadlines"
```

**Current implementation**:
- File: `layouts/partials/cutia-ungheni.html`
- Displayed in article template
- Some articles use structured fields (title/content), some use legacy format (impact_local/ce_se_schimba/termene)

#### Fact-Check Rating
**Used in factcheck format articles**

```yaml
# Not shown in front matter inspection, but template references:
# .Params.rating, .Params.methodology
```

- File: `layouts/partials/fact-check-rating.html`
- Shows rating badge (True/False/Partial)

#### Opinion Disclaimer
**Used when format contains "opinie"**

- File: `layouts/partials/opinion-disclaimer.html`
- Auto-triggered based on format field

### Analysis of Front Matter Patterns
1. **Categories**: Always single-select (no multi-category articles)
2. **Formats**: Always single-select (no cross-format articles)
3. **Tags**: Taxonomy exists but NO articles use tags
4. **Authors**: Legacy system (simple strings), not connected to author profiles
5. **Contributors**: Advanced CMS field (roles + author references) NOT YET USED
6. **Series/Related**: NO EXISTING FIELDS for series, collections, or related articles

**Front Matter Field Count**: ~15-20 fields (if contributors + cutia fields expanded)

---

## 3. TAXONOMY TEMPLATE STRUCTURE

### Template Files Location
- **Default taxonomy**: `layouts/_default/taxonomy.html`
- **Categories (custom)**: `layouts/taxonomy/categories.html`
- **Authors (custom)**: `layouts/authors/term.html` (single author page), `layouts/authors/terms.html` (author list)

### Template Logic

#### Main Taxonomy Template (`layouts/_default/taxonomy.html`)
```go
{{/* Language-safe taxonomy filtering */}}
{{ $lang := .Site.Language.Lang }}
{{ $lang_news_path := printf "/%s/news" $lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}
{{ $p := .Paginate $pages }}
```

**Pattern**: Gets language-specific section first, then filters by taxonomy term
**Purpose**: Prevents cross-language content bleed
**Pagination**: Uses Hugo's internal pagination template

#### Categories Template (`layouts/taxonomy/categories.html`)
```go
{{/* Alternative implementation using Scratch */}}
{{ $lang := .Site.Language.Lang }}
{{ $.Scratch.Set "_tp" (slice) }}
{{ range .Pages }}
  {{ $p := .Page }}
  {{ if eq $p.Lang $lang }}
    {{ $.Scratch.Add "_tp" (slice $p) }}
  {{ end }}
{{ end }}
{{ $pages := $.Scratch.Get "_tp" }}
{{ $p := .Paginate $pages }}
```

**Pattern**: Manual filtering using Scratch (older approach)
**Note**: Both templates achieve same result, default is preferred

#### Author Pages (`layouts/authors/term.html`)
- Not examined but likely follows similar pattern
- Related: `layouts/partials/byline.html` shows professional author display with avatars, bios, social links

### Card Partial (`layouts/partials/card.html`)
- Renders article preview with category, format, title, summary, date
- Gets category name from `data/categories.yaml`
- Gets format name from `data/formats.yaml`
- Used in list pages and category pages

### Pagination
- Default size: 12 articles per page (config.toml: `pagerSize = 12`)
- Uses Hugo's internal pagination template

---

## 4. PARTIALS & COMPONENTS

### Article Display Partials
1. **byline.html** - Author/contributor display
   - Modern: Contributors with roles (jurnalist, redactor, fotograf, etc.)
   - Legacy: Simple author list
   - Includes avatar, bio, email, Twitter, Facebook links

2. **card.html** - Article preview card
   - Category, format tags
   - Title, summary truncation
   - Date display
   - Links to full article

3. **cutia-ungheni.html** - Local context box
   - Styled informational box
   - Appears below opinion disclaimer in articles

4. **opinion-disclaimer.html** - Opinion article notice
   - Auto-triggered when format = "opinie"

5. **fact-check-rating.html** - Fact-check verdict display
   - Shows rating badge
   - Triggers on factcheck format

6. **verification-box.html** - Sources and methodology
   - Professional journalism attribution
   - Lists sources, methodology, fact-check notes

### Home Page Partials
- hero.html, modern-hero.html - Featured articles
- latest-news.html - Latest articles section
- category-rail.html, category-card.html, category-block.html - Category showcases
- breaking.html - Breaking news section

### Sidebar & Navigation
- sidebar.html - Sidebar with widgets
- sidebar/latest-news.html - Latest news in sidebar
- service-rail/ - Special service sections (border-wait, outages, roadworks, prut-brief)

### Media & Utility
- responsive-image.html - Lazy-loaded image handling
- pills.html - Tag-like pills for content categorization
- dedupe.html - Content deduplication utility

**Key Finding**: NO existing "related articles" or "series" partials

---

## 5. DATA FILES STRUCTURE

### data/categories.yaml
- **Purpose**: Metadata for 7 main categories with subsections
- **Structure**: Each category has slug, RO name, RU name, optional subsections
- **Usage**: Referenced in card.html, taxonomy templates, navigation

### data/formats.yaml
- **Purpose**: Complete editorial guidelines and format definitions
- **Structure**: 5 formats with weights, colors, icons, RO/RU names, editorial requirements (length, sources, verification levels)
- **Content**: Guidelines, editorial principles, format hierarchy, visual requirements
- **Usage**: Referenced in card.html, article validation

### data/rails.yaml
- **Purpose**: Homepage content sections configuration
- **Content**: 7 rails defined (latest_news + 6 category-specific rails)
- **Structure**: key, category, limit (6), type (latest)
- **Usage**: Powers homepage article sliders/rails

### data/navigation.yaml
- **Purpose**: Complete site navigation, formats menu, editorial principles
- **Content**: 
  - Main menu (7 categories with weights, icons, RO/RU names)
  - Secondary menu (despre, contact, arhiva)
  - Formats menu (5 formats)
  - Social links (Telegram, Facebook, Email)
  - Editorial principles (Cutia Ungheni requirements)

### data/site.yaml
- **Purpose**: Site-level branding
- **Content**: Publisher name, logo path

### data/colors.yaml
- **Not examined** but likely contains color definitions for format badges, categories, etc.

**Key Finding**: NO data files for series, collections, or related content metadata

---

## 6. EXISTING RELATED CONTENT / SERIES FUNCTIONALITY

### Current State: NONE
- **No series field** in front matter
- **No related articles** partial or template
- **No collection metadata** in data files
- **No cross-linking** between articles
- **Tags taxonomy exists** but is unused

### Why Gaps Exist
1. Site is relatively new (launched 2025)
2. Focus on core editorial categories and formats first
3. Tags reserved for future use (mentioned in config but no implementation)
4. Contributor system not yet activated (CMS supports but no articles use it)

---

## 7. LANGUAGE & MULTIINGUAL CONSIDERATIONS

### Current Setup
- **Primary language**: Romanian (RO)
- **Secondary language**: Russian (RU)
- **Content structure**: Separate folders (`content/ro/news/`, `content/ru/news/`)
- **Separate taxonomies**: Languages are handled at folder level, not within articles

### Implications for Series/Related
1. **Series metadata** must be language-agnostic (shared between RO/RU articles)
2. **Series index pages** need RO/RU variants
3. **Related articles** should respect language boundaries (RO articles link to RO articles, RU to RU)
4. **Taxonomy pages** use language-specific section approach (see Template Logic section)

---

## 8. DECAP CMS CONFIGURATION

### Collection Structure (config.yml)
**News Collection** (`news_ro`, `news_ru`)
- Folder: `content/ro/news/`, `content/ru/news/`
- Create: true (editors can add articles)
- Path: `{{slug}}/index` (page bundles)
- Fields: 20+ fields including future extensibility
- Media folder: "" (local page bundle resources)

### Field Types Used
- String (title, slug, summary, etc.)
- Text (longer content)
- Datetime (date, publishDate, expiryDate)
- Boolean (draft, featured)
- Image (cover, gallery)
- Select (categories, formats - single select only)
- Relation (authors, contributors)
- Object (cutia_ungheni with nested fields)
- List (contributors - array of objects, gallery - array of images)

### Extensibility
- CMS config allows adding new fields easily (consistent with Hugo front matter)
- Contributors field shows professional system ready to implement
- No content versioning or scheduling currently used

---

## SUMMARY: WHAT EXISTS vs. WHAT'S NEEDED

### WHAT EXISTS ✓
- 7 well-defined categories with subsections
- 5 editorial formats with guidelines
- 4 taxonomies (categories, formats, tags, authors)
- Sophisticated article templates with language safety
- Professional byline system with roles (ready but unused)
- Cutia Ungheni mandatory local context boxes
- Decap CMS with editorial workflow
- Pagination and content filtering
- Data-driven UI (rails, navigation, editorial principles)

### WHAT'S MISSING ✗
**For Related Articles Feature:**
- No "related" field in front matter
- No "related articles" partial or template
- No algorithm/query for finding related articles (by category, format, tags, etc.)
- No sidebar widget or in-article related articles section

**For Series/Collections Feature:**
- No "series" or "collection" field in front matter
- No series index/landing page template
- No series navigation (prev/next articles)
- No series metadata in data files
- No series list partial
- Tags taxonomy unused (potential series tag system)

**For Cross-Language Series:**
- No mechanism to link RO and RU articles in same series
- No "translation_of" or "original_language" field

---

## TECHNICAL RECOMMENDATIONS

### For Related Articles
1. Add `related` field to article front matter (optional, array of article slugs)
2. Create `layouts/partials/related-articles.html`
3. Implement two strategies:
   - Explicit: Use `related` field if provided
   - Implicit: Query articles by shared category + similar date range (fallback)
4. Add to single.html template before footer

### For Article Series
1. Add `series` field to front matter (optional, single string)
2. Add series metadata to `data/series.yaml`:
   ```yaml
   - slug: "vama-sculeni-investigation"
     ro:
       name: "Seria: Problema Vămii Sculeni"
       description: "Investigație în 4 parti"
     ru:
       name: "Серия: Проблема таможни Скулень"
     articles: ["article-1-slug", "article-2-slug", "article-3-slug"]
   ```
3. Create `layouts/partials/series-nav.html` for prev/next navigation
4. Create `layouts/series/single.html` for series landing page
5. Add series list template for browsing all series
6. Add CMS collection for series metadata (optional editorial management)

### For Tags Implementation
1. Start using tags in articles (optional, array of strings)
2. Create `layouts/tags/term.html` for tag pages
3. Use tags for cross-cutting themes (e.g., "corruption", "transport-crisis", "eu-grants")
4. Could evolve into informal series system

---

## ARTICLE STATISTICS (from ro/news examination)

- **Total Romanian articles**: ~36 examined
- **Article count by format**:
  - Știre (News): 15
  - Explainer: 7
  - Analiză: 7
  - Opinie: 6
  - Factcheck: 0

- **Article count by category**:
  - Educație & Sănătate: 5
  - UE & România: 5
  - Servicii Publice: 5
  - Economie & FEZ: 5
  - Frontieră & Transport: 5
  - Local: 5
  - Național: 5

- **Author usage**: All articles use `authors: ["redactia"]` (editorial team)
- **Contributors field**: 0 articles (system ready but unused)
- **Tags**: 0 articles use tags
- **Series field**: Does not exist

---

## FILE PATHS REFERENCE

### Key Config Files
- `/home/nalyk/gits/ungheni-news/config/_default/config.toml` - Hugo config
- `/home/nalyk/gits/ungheni-news/config/_default/languages.toml` - Language config
- `/home/nalyk/gits/ungheni-news/static/admin/config.yml` - Decap CMS config

### Key Data Files
- `/home/nalyk/gits/ungheni-news/data/categories.yaml` - Category definitions
- `/home/nalyk/gits/ungheni-news/data/formats.yaml` - Format guidelines
- `/home/nalyk/gits/ungheni-news/data/navigation.yaml` - Navigation & menus
- `/home/nalyk/gits/ungheni-news/data/rails.yaml` - Homepage sections
- `/home/nalyk/gits/ungheni-news/data/site.yaml` - Branding

### Key Template Files
- `/home/nalyk/gits/ungheni-news/layouts/_default/taxonomy.html` - Taxonomy pages
- `/home/nalyk/gits/ungheni-news/layouts/taxonomy/categories.html` - Category pages
- `/home/nalyk/gits/ungheni-news/layouts/_default/single.html` - Article page
- `/home/nalyk/gits/ungheni-news/layouts/_default/list.html` - Archive pages
- `/home/nalyk/gits/ungheni-news/layouts/partials/card.html` - Article card
- `/home/nalyk/gits/ungheni-news/layouts/partials/byline.html` - Author display

### Content
- `/home/nalyk/gits/ungheni-news/content/ro/news/` - Romanian articles (36 examined)
- `/home/nalyk/gits/ungheni-news/content/ru/news/` - Russian articles (_index.md only)

---

## NEXT STEPS

1. **Related Articles**: Create simple implicit matching (same category + recent)
2. **Series System**: Add series field, create series.yaml, add navigation
3. **Tags Usage**: Activate tags for thematic grouping (supplement series)
4. **Contributors**: Activate CMS contributor field with role-based display
5. **Series Landing Pages**: Create collection landing pages with article list + navigation

