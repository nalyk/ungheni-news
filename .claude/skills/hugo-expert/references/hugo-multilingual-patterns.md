# Hugo Multilingual Taxonomy Patterns

This document provides detailed solutions for handling multilingual taxonomies in Hugo, specifically addressing the cross-language content bleed issue.

## The Problem

Hugo's default taxonomy behavior creates global taxonomy collections that include content from ALL languages. This causes:

1. **Language Mixing**: `/categories/local/` shows both Romanian and Russian articles
2. **Empty Localized Pages**: `/ru/categories/local/` shows no content
3. **Broken Filtering**: Standard `where` filters on `.Pages` don't work as expected

## Root Cause

When Hugo builds taxonomies, it creates a single global `.Pages` collection per term. The language prefix in the URL (`/ru/`, `/ro/`) doesn't automatically filter this collection.

## Solution Pattern

Instead of filtering the taxonomy's `.Pages` collection, get language-specific content directly from the appropriate content section:

```go
{{/* Step 1: Build language-specific section path */}}
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}

{{/* Step 2: Get the section for current language */}}
{{ $news_section := .Site.GetPage $lang_news_path }}

{{/* Step 3: Get all pages from language-specific section */}}
{{ $all_lang_pages := $news_section.Pages }}

{{/* Step 4: Filter by current taxonomy term */}}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}
```

## Implementation Examples

### Taxonomy Template (layouts/_default/taxonomy.html)

```go
{{ define "main" }}
<div class="taxonomy-page">
  <h1>{{ .Title }}</h1>

  {{/* Get language-specific content */}}
  {{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
  {{ $news_section := .Site.GetPage $lang_news_path }}
  {{ $all_lang_pages := $news_section.Pages }}

  {{/* Filter by taxonomy term */}}
  {{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}

  {{/* Paginate */}}
  {{ $paginator := .Paginate $pages }}

  {{/* Render articles */}}
  {{ range $paginator.Pages }}
    {{ partial "article-card.html" . }}
  {{ end }}

  {{/* Pagination */}}
  <nav>
    {{ template "_internal/pagination.html" . }}
  </nav>
</div>
{{ end }}
```

### Term Template (layouts/_default/term.html)

```go
{{ define "main" }}
<div class="term-page">
  <h1>{{ .Data.Singular }}: {{ .Title }}</h1>

  {{/* Language-specific filtering */}}
  {{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
  {{ $news_section := .Site.GetPage $lang_news_path }}
  {{ $all_lang_pages := $news_section.Pages }}

  {{/* Filter by current term - adjust taxonomy name as needed */}}
  {{ $taxonomy := .Data.Plural }}
  {{ $pages := where $all_lang_pages (printf ".Params.%s" $taxonomy) "intersect" (slice .Data.Term) }}

  {{/* Sort and limit */}}
  {{ $pages = $pages.ByDate.Reverse }}

  {{ range $pages }}
    <article>
      <h2><a href="{{ .Permalink }}">{{ .Title }}</a></h2>
      <p>{{ .Summary }}</p>
    </article>
  {{ end }}
</div>
{{ end }}
```

### Category-Specific Template (layouts/categories/taxonomy.html)

```go
{{ define "main" }}
<div class="category-taxonomy">
  <header>
    <h1>{{ i18n "category" }}: {{ .Title }}</h1>
  </header>

  {{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
  {{ $news_section := .Site.GetPage $lang_news_path }}
  {{ $all_lang_pages := $news_section.Pages }}
  {{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}

  {{/* Sort by date and featured status */}}
  {{ $pages = $pages.ByDate.Reverse }}

  {{/* Separate featured articles */}}
  {{ $featured := where $pages ".Params.featured" true }}
  {{ $regular := where $pages ".Params.featured" "!=" true }}

  {{/* Featured section */}}
  {{ if $featured }}
  <section class="featured">
    {{ range first 3 $featured }}
      {{ partial "article-card-featured.html" . }}
    {{ end }}
  </section>
  {{ end }}

  {{/* Regular articles with pagination */}}
  {{ $paginator := .Paginate $regular }}
  <section class="articles">
    {{ range $paginator.Pages }}
      {{ partial "article-card.html" . }}
    {{ end }}
  </section>

  <nav>
    {{ template "_internal/pagination.html" . }}
  </nav>
</div>
{{ end }}
```

## Format Taxonomy (Special Case)

For the "formats" taxonomy (stire, analiza, explainer, opinie, factcheck):

```go
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.formats" "intersect" (slice .Data.Term) }}
```

## Author Taxonomy

For authors (which may have dedicated author pages):

```go
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.authors" "intersect" (slice .Data.Term) }}

{{/* Get author metadata if available */}}
{{ $authorPage := .Site.GetPage (printf "/%s/authors/%s" .Site.Language.Lang (.Data.Term | urlize)) }}
{{ with $authorPage }}
  <div class="author-bio">
    <h2>{{ .Title }}</h2>
    {{ .Content }}
  </div>
{{ end }}
```

## Testing Language Isolation

To verify language isolation works correctly:

1. **Check Romanian page**: `/ro/categories/local/` should show ONLY Romanian articles
2. **Check Russian page**: `/ru/categories/local/` should show ONLY Russian articles
3. **Verify counts**: Article counts should match language-specific content counts
4. **Test pagination**: Each language should paginate independently

## Common Mistakes to Avoid

### ❌ Don't filter `.Pages` directly
```go
{{ $pages := where .Pages "Lang" .Site.Language.Lang }}
```

### ❌ Don't use global taxonomy collections
```go
{{ range .Site.Taxonomies.categories }}
  {{/* This includes all languages */}}
{{ end }}
```

### ❌ Don't assume URL language prefix filters content
```go
{{/* URL being /ru/categories/local/ doesn't filter .Pages automatically */}}
{{ range .Pages }}
  {{/* This will include RO and RU content */}}
{{ end }}
```

### ✅ Always get content from language-specific sections
```go
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $pages := $news_section.Pages }}
```

## Debugging Language Issues

Add debug output to verify language filtering:

```go
{{/* Debug: Show current language */}}
<p>Current language: {{ .Site.Language.Lang }}</p>

{{/* Debug: Show page count before filtering */}}
<p>Total pages in taxonomy: {{ len .Pages }}</p>

{{/* Debug: Show page count after filtering */}}
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
<p>Pages in {{ .Site.Language.Lang }} section: {{ len $all_lang_pages }}</p>

{{/* Debug: List languages of all pages */}}
{{ range .Pages }}
  <li>{{ .Title }} ({{ .Lang }})</li>
{{ end }}
```

## Performance Considerations

This pattern is efficient because:
1. Section lookup is cached by Hugo
2. No cross-language filtering overhead
3. Natural content segregation matches Hugo's build model
4. Pagination works correctly with language-specific pages

## Summary

Always use the **language-specific section approach** for multilingual taxonomies:
1. Get section path for current language
2. Retrieve section using `.Site.GetPage`
3. Filter section pages by taxonomy term
4. Paginate and render as needed

This pattern ensures complete language isolation and prevents cross-language content bleed.
