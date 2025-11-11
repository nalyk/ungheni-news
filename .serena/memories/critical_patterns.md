# Critical Technical Patterns for Triunghi.md

These patterns are ESSENTIAL for correct operation. Violations will cause bugs.

## 1. Hugo Multilingual Taxonomy Pattern (CRITICAL)

### The Problem
Hugo's default taxonomy `.Pages` collection includes ALL languages, causing cross-language content bleed. Romanian category pages show Russian articles and vice versa.

### WRONG Approach ❌
```go
{{ $pages := where .Pages "Lang" .Site.Language.Lang }}
```
**Why it fails**: `.Pages` is already the global taxonomy collection. Filtering by language is too late.

### CORRECT Approach ✅
```go
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}
```

**Why it works**: 
1. Get the language-specific news section (`/ro/news` or `/ru/news`)
2. Get pages from that section only (language-isolated)
3. Filter those pages by taxonomy term

### Where to Apply
- `layouts/_default/taxonomy.html` - Main taxonomy template
- `layouts/categories/*.html` - Category-specific templates
- `layouts/tags/*.html` - Tag-specific templates
- `layouts/formats/*.html` - Format-specific templates
- Any template displaying taxonomy term listings

### Reference
See hugo-expert skill for detailed examples and variations.

---

## 2. Decap CMS OAuth Flow (CRITICAL)

### The Problem
Decap CMS expects a specific postMessage format for OAuth. Incorrect format causes silent failures - the popup closes, but no login occurs.

### WRONG Approach ❌
```javascript
// functions/api/auth.js
window.opener.postMessage({
  type: 'authorization_grant',
  token: accessToken
}, origin);
```
**Why it fails**: Decap CMS expects STRING format, not object. Missing handshake step.

### CORRECT Approach ✅
```javascript
// functions/api/auth.js

// Step 1: Handshake (MANDATORY)
window.opener.postMessage("authorizing:github", "https://triunghi.md");

// Step 2: Success (after brief delay)
setTimeout(() => {
  window.opener.postMessage(
    'authorization:github:success:' + JSON.stringify({
      token: accessToken,
      provider: 'github'
    }),
    'https://triunghi.md'  // Explicit origin, NEVER '*'
  );
}, 100);
```

**Why it works**:
1. Two-step handshake: "authorizing" then "success"
2. String format: `'authorization:github:success:' + JSON.stringify(...)`
3. Explicit origin: Security requirement, no wildcards
4. Brief delay: Ensures opener is ready to receive

### Where to Apply
- `functions/api/auth.js` - OAuth callback endpoint
- Any custom OAuth implementation for Decap CMS

### Security Notes
- Always validate origin before postMessage
- Never use `'*'` as target origin
- Verify state parameter to prevent CSRF

### Reference
See decap-cms-expert skill for complete OAuth implementation.

---

## 3. Hugo Pagination Context (CRITICAL)

### The Problem
Hugo's internal pagination template expects page context (`.`), not paginator object (`$p`). Passing wrong context causes error: "can't evaluate field PageNumber in type *page.Paginator"

### WRONG Approach ❌
```go
{{ $p := .Paginate $pages }}
<nav>
  {{ template "_internal/pagination.html" $p }}
</nav>
```
**Why it fails**: Internal pagination template needs access to full page context, not just paginator.

### CORRECT Approach ✅
```go
{{ $p := .Paginate $pages }}
<nav>
  {{ template "_internal/pagination.html" . }}
</nav>
```

**Why it works**: Page context (`.`) contains both `.Paginator` and other required fields.

### Where to Apply
- Any template using `{{ template "_internal/pagination.html" ... }}`
- List templates (`layouts/_default/list.html`)
- Taxonomy templates (`layouts/_default/taxonomy.html`)
- Custom pagination templates

---

## 4. Content Validation Rules (CRITICAL)

### Rule 1: No Draft with PublishDate
**Validation**: `scripts/validate_content.sh`

**Problem**: Setting `draft: true` with `publishDate` is contradictory. Scheduled content should have `draft: false`.

**WRONG** ❌:
```yaml
---
draft: true
publishDate: 2025-01-20T10:00:00+02:00
---
```

**CORRECT** ✅:
```yaml
---
draft: false
publishDate: 2025-01-20T10:00:00+02:00  # Future date = scheduled
---
```

### Rule 2: Cutia Ungheni for Non-Local Categories
**Validation**: `scripts/validate_content.sh`

**Problem**: National and EU news must explain local relevance to Ungheni.

**Categories requiring Cutia Ungheni**:
- `national` - Moldova-wide news
- `ue-romania` - EU and Romania news

**WRONG** ❌:
```yaml
---
categories: ["national"]
# Missing cutia_ungheni!
---
```

**CORRECT** ✅:
```yaml
---
categories: ["national"]
cutia_ungheni:
  impact_local: "How this affects Ungheni residents"
  ce_se_schimba: "What changes locally"
  termene: "Important deadlines or dates"
---
```

### Rule 3: Fact-Check Requirements
**Validation**: `scripts/validate_content.sh`

**Problem**: Fact-checks must cite sources and provide rating.

**WRONG** ❌:
```yaml
---
formats: ["factcheck"]
# Missing verification!
---
```

**CORRECT** ✅:
```yaml
---
formats: ["factcheck"]
verification:
  fact_check_rating: "fals"  # Or: adevarat, partial_adevarat, inselator, etc.
  sources:
    - name: "Source Name"
      url: "https://example.com"
      type: "official"  # Or: media, expert, document
---
```

### Rule 4: Opinion Authorship
**Validation**: `scripts/validate_content.sh`

**Problem**: Opinion articles must attribute authorship for accountability.

**WRONG** ❌:
```yaml
---
formats: ["opinie"]
# Missing authors!
---
```

**CORRECT** ✅:
```yaml
---
formats: ["opinie"]
authors: ["author-slug"]
---
```

---

## 5. Page Bundle Media Configuration (CRITICAL)

### The Problem
Decap CMS default media configuration stores uploads in global folder, breaking Hugo page bundles.

### WRONG Approach ❌
```yaml
# static/admin/config.yml
collections:
  - name: "news_ro"
    folder: "content/ro/news"
    # Uses global media_folder from top level
```
**Why it fails**: Images go to `/static/uploads/`, not alongside `index.md`.

### CORRECT Approach ✅
```yaml
# static/admin/config.yml
collections:
  - name: "news_ro"
    folder: "content/ro/news"
    media_folder: ""        # Empty = same directory as content
    public_folder: ""       # Empty = relative paths
    path: "{{slug}}/index"  # Creates page bundle structure
```

**Why it works**: 
- Images stored with content: `content/ro/news/slug/image.jpg`
- Hugo can process images: `.Resources.GetMatch "*.jpg"`
- Simplified media management

---

## 6. Hugo Build Environment (CRITICAL)

### The Problem
Hugo binary location is non-standard. Direct `hugo` calls may use wrong version or fail.

### WRONG Approach ❌
```bash
hugo build --minify
```
**Why it fails**: May use different Hugo version or not find binary.

### CORRECT Approach ✅
```bash
# ALWAYS use Makefile
make build

# If calling make directly with HUGO override:
HUGO=/home/nalyk/bin/hugo make build

# If absolutely must call hugo directly:
/home/nalyk/bin/hugo --version
```

**Why it works**: 
- Makefile handles binary location: `HUGO ?= hugo`
- Consistent across environments
- Includes validation and environment setup

### Where to Apply
- All build commands
- CI/CD pipelines
- Development workflow
- Documentation examples

---

## 7. Search Index Generation (CRITICAL)

### The Problem
Site search won't work without regenerating Pagefind index after content changes.

### WRONG Approach ❌
```bash
make build
git push  # Forgot make pagefind!
```
**Why it fails**: Search results are stale or missing new content.

### CORRECT Approach ✅
```bash
make build && make pagefind
# Now safe to push
```

**Why it works**: Pagefind indexes `public/` directory after build.

### When to Run
- **ALWAYS** after `make build`
- After ANY content changes
- Before committing to git
- Part of every deployment workflow

---

## 8. Language Switcher URL Detection (CRITICAL)

### The Problem
Language switcher must work on both dynamic Hugo pages and static pages (like Pagefind search results).

### Pattern Required
- For Hugo pages: Use `.AlternateLanguagePages` (Hugo's built-in)
- For static pages: Use URL-based detection (check `/ro/` or `/ru/` in path)
- Fallback to content parity detection (check if translation exists)

### Implementation
See recent commits for language switcher implementation:
- URL-based detection for static pages
- Content parity checks
- Intelligent fallback behavior

---

## Quick Reference: Pattern Checklist

When working on:

- **Taxonomy templates** → Use language-specific section approach (#1)
- **OAuth/Decap CMS** → Two-step handshake, string format (#2)
- **Pagination** → Pass `.` context to internal template (#3)
- **Content creation** → Validate required fields (#4)
- **CMS collections** → Empty media_folder for page bundles (#5)
- **Build commands** → Always use Makefile (#6)
- **After builds** → Always run make pagefind (#7)
- **Language switching** → URL-based + content parity (#8)

These patterns are documented in CLAUDE.md and enforced by validation scripts and code review processes.