# Code Style and Conventions for Triunghi.md

## EditorConfig Settings
All files follow these rules (from `.editorconfig`):
- **Charset**: UTF-8
- **End of line**: LF (Unix-style)
- **Indentation**: 2 spaces (no tabs)
- **Final newline**: Always insert
- **Trailing whitespace**: Always trim

## File Structure Conventions

### Content Files (Markdown)
- **Location**: `content/{language}/news/{slug}/index.md`
- **Format**: YAML front matter + Markdown body
- **Images**: Stored alongside `index.md` in page bundle
- **Naming**: Lowercase slug with hyphens (e.g., `article-title`)

### Hugo Templates
- **Location**: `layouts/` directory with organized subdirectories
- **Extension**: `.html`
- **Go Templates**: Use Hugo's template syntax
- **Partials**: Store in `layouts/partials/`

### Configuration Files
- **Format**: TOML for Hugo config (`config/_default/*.toml`)
- **Format**: YAML for data files (`data/*.yaml`)
- **Format**: YAML for i18n strings (`i18n/*.yaml`)

## Front Matter Schema (Required Fields)

```yaml
---
title: "Article Title"           # Required: Clear, descriptive
summary: "Brief description"     # Required: For SEO and previews
date: 2025-01-15T10:00:00+02:00  # Required: Publication datetime
publishDate: 2025-01-15T10:00:00+02:00  # Optional: Scheduled publish
draft: false                     # Required: Publishing status
categories: ["local"]            # Required: At least one category
formats: ["stire"]               # Required: Exactly one format
authors: ["author-slug"]         # Required: At least one author
tags: ["tag1", "tag2"]           # Optional: Topic tags
featured: false                  # Optional: Homepage feature flag
---
```

### Categories (Editorial Beats)
**Local** (no Cutia Ungheni required):
- `local` - General local news
- `frontiera-transport` - Border and transport
- `economie-zel` - Economy and environment
- `servicii-publice` - Public services
- `educatie-sanatate` - Education and health

**Non-Local** (Cutia Ungheni MANDATORY):
- `national` - Moldova-wide news
- `ue-romania` - EU and Romania news

### Formats (Article Types)
- `stire` - News/breaking news
- `analiza` - Analysis piece
- `explainer` - Explainer (What/Why/What's Next)
- `opinie` - Opinion (requires author)
- `factcheck` - Fact-check (requires sources + rating)

### Cutia Ungheni (for national/ue-romania)
```yaml
cutia_ungheni:
  impact_local: "How this affects Ungheni residents"
  ce_se_schimba: "What changes locally"
  termene: "Important deadlines/dates"
  unde_aplici: "Where to apply/get info (optional)"
```

## Hugo Template Patterns

### CRITICAL: Multilingual Taxonomy
**WRONG** (causes cross-language content bleed):
```go
{{ $pages := where .Pages "Lang" .Site.Language.Lang }}
```

**CORRECT** (language-specific section approach):
```go
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}
```

### Pagination Context
**WRONG**:
```go
{{ template "_internal/pagination.html" $p }}
```

**CORRECT** (pass page context `.`, not paginator):
```go
{{ template "_internal/pagination.html" . }}
```

### i18n Strings
Always use translation keys for user-facing text:
```go
{{ i18n "read_more" }}
{{ i18n "published_on" }}
```

## Git Commit Convention

### Commit Message Format
```
<type>: <subject>

<optional body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style/formatting (no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Test additions/changes
- `chore` - Build/tooling changes

### Examples
```
feat: add author biography to article pages

Implements author bio display with avatar and social links.
Uses Hugo's taxonomies to link all articles by same author.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Naming Conventions

### File and Directory Names
- Lowercase with hyphens: `article-title`, `author-slug`
- No spaces, no underscores in URLs
- Language code as suffix for i18n: `_index.ro.md`, `_index.ru.md`

### Hugo Variables and Functions
- Use descriptive names: `$all_lang_pages`, `$news_section`
- Follow Hugo's conventions: `.Params`, `.Site`, `.Page`

### CSS Classes (if applicable)
- BEM-style recommended: `.block__element--modifier`
- Semantic names: `.article-header`, `.author-bio`

## Critical Rules

1. **Always Read before Edit/Write** - Never modify files without reading first
2. **Validate before Build** - Run `make validate` to catch content issues
3. **Check before Production** - Run `make check` to catch template errors
4. **Run code-reviewer after changes** - MANDATORY for any code modifications
5. **No emojis in code** - Unless explicitly requested by user
6. **Ask before commit/push** - Always get user approval for git operations