---
name: hugo-expert
description: Use this skill when working with Hugo static site development, especially for multilingual sites with complex taxonomies. Triggers include template debugging, taxonomy issues, i18n configuration, page bundles, shortcodes, or any Hugo-specific build/rendering problems. Essential for this Triunghi.md project's Hugo architecture.
---

# Hugo Expert

## Overview

Provide specialized Hugo development expertise for multilingual static sites, focusing on template organization, taxonomy patterns, i18n configuration, and build optimization. Handle complex Hugo-specific challenges including multilingual taxonomy filtering, template debugging, and content structure.

## Core Capabilities

### 1. Multilingual Taxonomy Mastery

**CRITICAL PATTERN** for this project: Hugo's default taxonomy behavior includes content from ALL languages, causing cross-language content bleed.

**Problem Symptoms:**
- `/categories/local/` shows both RO and RU articles
- `/ru/categories/local/` shows no articles
- Taxonomy `.Pages` collection includes all languages by default

**INCORRECT Approach:**
```go
{{/* ❌ This does NOT work - filtering .Pages by language */}}
{{ $pages := where .Pages "Lang" .Site.Language.Lang }}
```

**CORRECT Solution:**
```go
{{/* ✅ Get language-specific content from the section */}}
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}
```

**Why This Works:**
1. Get the language-specific section path (e.g., `/ro/news`)
2. Access the section using `.Site.GetPage`
3. Filter the language-specific pages by taxonomy term
4. Ensures proper language isolation

Apply this pattern to ALL taxonomy templates: `layouts/_default/taxonomy.html`, `layouts/_default/term.html`, category/tag/format/author pages.

### 2. Pagination Context Fix

**Problem:** Pagination templates fail with "can't evaluate field PageNumber in type *page.Paginator"

**Solution:**
Pass the page context (`.`) instead of the paginator object (`$p`) to internal pagination templates.

**Before:**
```go
{{ $p := .Paginate $pages }}
...
<nav>
  {{ template "_internal/pagination.html" $p }}
</nav>
```

**After:**
```go
{{ $p := .Paginate $pages }}
...
<nav>
  {{ template "_internal/pagination.html" . }}
</nav>
```

Hugo's internal pagination template expects the page context, not the paginator directly.

### 3. Template Organization Patterns

**Base Templates:**
- `layouts/_default/baseof.html` - Base structure for all pages
- `layouts/_default/single.html` - Individual content pages
- `layouts/_default/list.html` - List/section pages
- `layouts/_default/taxonomy.html` - Taxonomy term lists

**Partials:**
- Keep reusable components in `layouts/partials/`
- Use descriptive names: `header.html`, `footer.html`, `article-card.html`
- Pass context explicitly: `{{ partial "article-card.html" (dict "Page" . "Featured" true) }}`

**Taxonomy Templates:**
- Override defaults in `layouts/categories/`, `layouts/tags/`, etc.
- Use language-specific section approach (see #1 above)
- Apply consistent card/list rendering patterns

### 4. i18n Configuration

**Translation Strings:**
- Store in `i18n/ro.yaml` and `i18n/ru.yaml`
- Access with `{{ i18n "key" }}` or `{{ i18n "key" . }}` with context
- Keep keys descriptive: `read_more`, `published_on`, `category_label`

**Language-Aware URLs:**
```go
{{/* Get current page in other language */}}
{{ with .Translations }}
  {{ range . }}
    <link rel="alternate" hreflang="{{ .Language.Lang }}" href="{{ .Permalink }}" />
  {{ end }}
{{ end }}

{{/* Generate language-specific taxonomy URLs */}}
{{ $categoryPath := printf "/%s/categories/%s" .Site.Language.Lang (. | urlize) }}
```

**Language Configuration:**
- Primary: Romanian (`ro`) - weight 1
- Secondary: Russian (`ru`) - weight 2
- Timezone: `Europe/Chisinau` for publish dates

### 5. Page Bundles & Content Structure

**Structure:**
```
content/
├── ro/
│   └── news/
│       └── article-slug/
│           ├── index.md         # Content
│           └── featured.jpg     # Bundle resources
└── ru/
    └── news/
        └── article-slug/
            ├── index.md
            └── featured.jpg
```

**Front Matter Patterns:**
```yaml
title: "Article Title"
summary: "Brief description"
date: 2025-01-15T10:00:00+02:00
publishDate: 2025-01-15T10:00:00+02:00
draft: false
categories: ["local"]
formats: ["stire"]
authors: ["author-slug"]
tags: ["tag1", "tag2"]
featured: true
cutia_ungheni:
  impact_local: "Impact description"
  ce_se_schimba: "What changes"
  termene: "Deadlines and application info"
```

### 6. Shortcode Development

**Location:** `layouts/shortcodes/`

**Example - Alert Box:**
```go
{{/* layouts/shortcodes/alert.html */}}
<div class="alert alert-{{ .Get "type" | default "info" }}">
  {{ .Inner | markdownify }}
</div>
```

**Usage in Content:**
```markdown
{{< alert type="warning" >}}
Această secțiune necesită Cutia Ungheni.
{{< /alert >}}
```

### 7. Build & Configuration

**Hugo Version:** 0.127.0 (installed at `/home/nalyk/bin/hugo`)

**Configuration Split:**
```
config/_default/
├── config.yaml       # Main config
├── languages.yaml    # Language settings
├── menus.yaml        # Navigation
└── params.yaml       # Custom parameters
```

**Build Commands:**
- `make dev` - Development server with drafts
- `make build` - Production build with minification
- `make check` - Build with warnings exposed
- `make validate` - Content validation

**Always use `HUGO=/home/nalyk/bin/hugo` prefix** when calling Hugo directly.

### 8. Common Debugging Patterns

**Template Variables:**
```go
{{/* Debug current context */}}
{{ printf "%#v" . }}

{{/* Check page type */}}
{{ .Kind }} {{/* home, page, section, taxonomy, term */}}

{{/* Inspect params */}}
{{ range $key, $value := .Params }}
  {{ $key }}: {{ $value }}
{{ end }}
```

**Language Issues:**
```go
{{/* Current language */}}
{{ .Site.Language.Lang }}

{{/* Check if translation exists */}}
{{ if .IsTranslated }}
  {{ with .Translations }}
    ...
  {{ end }}
{{ end }}
```

**Taxonomy Debugging:**
```go
{{/* List all terms */}}
{{ range $taxonomy, $terms := .Site.Taxonomies }}
  {{ $taxonomy }}: {{ range $terms }}{{ .Page.Title }}, {{ end }}
{{ end }}
```

### 9. Performance Optimization

**Asset Processing:**
```go
{{/* CSS with fingerprinting */}}
{{ $css := resources.Get "css/main.scss" | toCSS | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">

{{/* Image optimization */}}
{{ $image := .Resources.GetMatch "featured.*" }}
{{ with $image }}
  {{ $resized := .Resize "800x" }}
  <img src="{{ $resized.RelPermalink }}" alt="{{ $.Title }}">
{{ end }}
```

**Font Preloading:**
```go
<link rel="preload" href="/fonts/ibm-plex-sans-regular.woff2" as="font" type="font/woff2" crossorigin>
```

## Resources

### references/

Contains Hugo-specific reference documentation:
- `hugo-multilingual-patterns.md` - Detailed multilingual taxonomy solutions
- `template-debugging.md` - Common template errors and fixes
- `front-matter-schema.md` - Complete front matter reference for this project

Consult these references when encountering complex Hugo issues or needing detailed examples.

## When to Use This Skill

Trigger this skill for:
- Template errors or rendering issues
- Multilingual taxonomy problems (cross-language content)
- i18n string management
- Page bundle organization
- Shortcode creation or modification
- Hugo configuration changes
- Build optimization
- Any Hugo-specific development task

This skill is essential for maintaining the Triunghi.md multilingual news site architecture.
