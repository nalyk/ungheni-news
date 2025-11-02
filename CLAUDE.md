# Triunghi.md – Hugo/Decap CMS Multilingual News Site

**Mission**: Local news service for Ungheni, Moldova (RO/RU). 60% local, 30% national, 10% international. Editorial philosophy: Oameni + Documente + Date (triangulated sources). Every non-local article requires "Cutia Ungheni" (local impact box).

**Architecture**: Hugo 0.127.0 static site + Decap CMS (GitHub backend) + Cloudflare Pages deployment + Pagefind search. Automated builds every 5 minutes via Worker.

---

## Tool Ecosystem

### Native Tools
- **Bash**: System commands, git, make targets
- **Read/Write/Edit**: File operations (ALWAYS Read before Write/Edit)
- **Glob**: File pattern matching (`**/*.md`)
- **Grep**: Content search (ripgrep)

### MCPs (Model Context Protocol Servers)
- **hugo_docs**: Hugo documentation search/fetch
- **decap-cms_docs**: Decap CMS documentation search/fetch
- **chrome-devtools**: Browser automation, performance tracing, network inspection

### Skills (Knowledge Bases – Auto-loaded by Relevance)
- **hugo-expert**: Multilingual taxonomy patterns, template debugging, i18n, page bundles
- **decap-cms-expert**: OAuth authentication (critical postMessage patterns), collection config, field widgets
- **ui-ux-verifier**: Verification protocol using Chrome DevTools MCP, responsive testing, performance tracing

### Subagents (Parallel Workers via Task Tool)
- **site-builder**: Hugo/Decap implementation, feature development, CMS integration
- **ui-designer**: Visual optimization, UX improvements, design refinement
- **code-reviewer**: Code quality validation (MUST run after any code changes)
- **debugger**: Error resolution, build failures, issue diagnosis

---

## Decision Matrix: When to Use What

| Task Type | Tool/Agent | Rationale |
|-----------|------------|-----------|
| **Single file edit** | Edit tool + skill reference | Lightweight, no overhead |
| **Multi-file feature** | site-builder subagent | Parallel execution, context isolation |
| **Template syntax question** | hugo-expert skill | Quick pattern lookup |
| **OAuth debugging** | decap-cms-expert skill | Critical postMessage patterns |
| **UI verification** | ui-ux-verifier skill + chrome-devtools MCP | Systematic verification protocol |
| **Code changes** | Do work → THEN code-reviewer subagent | Mandatory quality check |
| **Build errors** | debugger subagent | Focused error investigation |
| **Complex orchestration** | Multiple subagents in sequence | site-builder → code-reviewer → ui-designer |
| **Parallel work** | Multiple subagents in parallel | Backend + Frontend simultaneously |

### Skill vs Subagent Quick Test
- **Use Skill Alone**: 1-2 file change, looking up pattern, quick verification
- **Use Subagent**: 3+ files, complex logic, requires focus, needs parallelization
- **Use Both**: Subagent loads skill knowledge for domain expertise

---

## Critical Technical Patterns

### 1. Hugo Multilingual Taxonomy (CRITICAL)

**Problem**: Hugo's default taxonomy `.Pages` includes ALL languages, causing cross-language content bleed.

**WRONG** ❌:
```go
{{ $pages := where .Pages "Lang" .Site.Language.Lang }}
```

**CORRECT** ✅:
```go
{{ $lang_news_path := printf "/%s/news" .Site.Language.Lang }}
{{ $news_section := .Site.GetPage $lang_news_path }}
{{ $all_lang_pages := $news_section.Pages }}
{{ $pages := where $all_lang_pages ".Params.categories" "intersect" (slice .Data.Term) }}
```

**Why**: Get content from language-specific section, not global taxonomy collection.
**Apply to**: ALL taxonomy templates (`layouts/_default/taxonomy.html`, `layouts/categories/*`, etc.)

### 2. Decap CMS OAuth Flow (CRITICAL)

**File**: `functions/api/auth.js`

**Problem**: Incorrect postMessage format causes silent failures (popup closes, no login).

**WRONG** ❌:
```javascript
window.opener.postMessage({type: 'authorization_grant', token: 'xxx'}, origin);
```

**CORRECT** ✅:
```javascript
// Step 1: Handshake (MANDATORY)
window.opener.postMessage("authorizing:github", "https://triunghi.md");

// Step 2: Success (after 100ms delay)
setTimeout(() => {
  window.opener.postMessage(
    'authorization:github:success:' + JSON.stringify({
      token: accessToken,
      provider: 'github'
    }),
    'https://triunghi.md'  // Explicit origin, never '*'
  );
}, 100);
```

**Why**: Decap CMS expects STRING format with two-step handshake. Must use explicit origin.

### 3. Pagination Context

**Problem**: `can't evaluate field PageNumber in type *page.Paginator`

**Solution**: Pass page context (`.`) not paginator object (`$p`) to internal pagination:
```go
{{ $p := .Paginate $pages }}
<nav>
  {{ template "_internal/pagination.html" . }}  <!-- NOT $p -->
</nav>
```

### 4. UI/UX Verification Protocol

**After ANY visual change**:
1. Deploy to Cloudflare Pages (push to `main`)
2. Wait 2-3 minutes for deployment
3. Use chrome-devtools MCP:
   - `navigate_page` to affected URL
   - `take_snapshot` for structure verification
   - `take_screenshot` for visual confirmation
   - `resize_page` + screenshot at 375px, 768px, 1440px
   - `list_network_requests` to catch 404s
   - `list_console_messages` for JS errors
4. For performance: `performance_start_trace` → navigate → `performance_stop_trace` → `performance_analyze_insight`

---

## Commands (Use Makefile Only)

```bash
make dev           # Local dev server with drafts
make build         # Production build (GC + minify)
make pagefind      # Generate search index (REQUIRED after build)
make check         # Strict build (fails on warnings)
make validate      # Content validation (draft/publishDate conflicts, Cutia Ungheni)
```

**Hugo Binary**: `/home/nalyk/bin/hugo` (v0.127.0)
**IMPORTANT**: Use `HUGO=/home/nalyk/bin/hugo make <target>` when calling make directly.

**Never call `hugo` directly** unless explicitly instructed. Always use Makefile.

---

## Directory Structure

```
.
├── .claude/
│   ├── agents/              # Subagent definitions
│   │   ├── site-builder.md
│   │   ├── ui-designer.md
│   │   ├── code-reviewer.md
│   │   └── debugger.md
│   └── skills/              # Skill knowledge bases
│       ├── hugo-expert/
│       ├── decap-cms-expert/
│       └── ui-ux-verifier/
├── config/_default/         # Hugo config (split by concern)
│   ├── config.yaml
│   ├── languages.yaml
│   ├── menus.yaml
│   └── params.yaml
├── content/
│   ├── ro/news/            # Romanian articles (page bundles)
│   └── ru/news/            # Russian articles (page bundles)
├── data/                   # Data-driven UI
│   ├── categories.yaml
│   ├── rails.yaml
│   ├── navigation.yaml
│   └── site.yaml
├── functions/api/          # Cloudflare Functions
│   └── auth.js             # OAuth endpoint (CRITICAL)
├── i18n/                   # Translation strings
│   ├── ro.yaml
│   └── ru.yaml
├── layouts/                # Hugo templates
│   ├── _default/
│   └── partials/
├── static/
│   ├── admin/              # Decap CMS
│   │   ├── config.yml
│   │   └── index.html
│   └── fonts/              # Self-hosted IBM Plex (WOFF2)
└── workers/
    └── cron.js             # Scheduled builds (5-min interval)
```

---

## Workflows

### Add/Edit Article

1. **Create page bundle**:
   ```bash
   # Romanian
   mkdir -p content/ro/news/article-slug
   # Russian (if applicable)
   mkdir -p content/ru/news/article-slug
   ```

2. **Write content** (`index.md`):
   ```yaml
   ---
   title: "Article Title"
   summary: "Brief description"
   date: 2025-01-15T10:00:00+02:00
   publishDate: 2025-01-15T10:00:00+02:00
   draft: false
   categories: ["local"]
   formats: ["stire"]
   authors: ["author-slug"]
   # For national/ue-romania categories (MANDATORY):
   cutia_ungheni:
     impact_local: "Local impact description"
     ce_se_schimba: "What changes"
     termene: "Deadlines"
   ---
   Content...
   ```

3. **Validate and build**:
   ```bash
   make validate && make build && make pagefind
   ```

### Modify Templates/Layouts

1. **Find template**: Use Glob (`**/*.html` in `layouts/`)
2. **Read file**: Use Read tool (entire file or chunks)
3. **Edit**: Use Edit tool (MUST Read first)
4. **Build**: `make check` (catches errors early)
5. **Full build**: `make build && make pagefind`
6. **MANDATORY**: Use code-reviewer subagent after changes

### Update CMS Configuration

1. **Edit**: `static/admin/config.yml`
2. **Test locally**: Access `/admin/` on dev server
3. **OAuth verification**: Check `functions/api/auth.js` for two-step postMessage
4. **Build**: `make build`

### Deploy Changes

1. **Commit**:
   ```bash
   git add .
   git commit -m "feat: description

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

2. **Push**: `git push` (triggers Cloudflare Pages deployment)

3. **Verify**: Use ui-ux-verifier skill + chrome-devtools MCP after 2-3 min

---

## Mandatory Rules (Non-Negotiable)

### 1. Approval Required for Git Operations
**⚠️ CRITICAL**: NEVER commit or push without EXPLICIT user approval.
- Ask: "Can I commit and push these changes?"
- Wait for confirmation
- Violation risks site-wide issues

### 2. File Operations
- **MUST Read before Write/Edit**: Never Write/Edit without prior Read
- **Edit over Write**: Prefer Edit for existing files
- **No emoji**: Don't add emojis unless user explicitly requests

### 3. Build Validation
After code changes:
```bash
make validate  # Content rules
make check     # Warnings as errors
make build     # Production build
make pagefind  # Search index (REQUIRED)
```

### 4. Code Quality
- **MANDATORY**: After ANY code modification → code-reviewer subagent
- **No exceptions**: Template, CSS, JS, config changes ALL require review

### 5. Subagent Orchestration
- **One task in_progress**: TodoWrite tracks exactly ONE task as in_progress
- **Sequential when dependent**: site-builder → code-reviewer → ui-designer
- **Parallel when independent**: Backend + Frontend simultaneously
- **Auto-trigger cascades**:
  - site-builder modifies code → AUTOMATICALLY code-reviewer
  - Any errors → IMMEDIATELY debugger
  - Visual changes → ui-designer for polish

### 6. Hugo Specifics
- **Multilingual taxonomy**: ALWAYS use language-specific section approach
- **Pagination**: Pass `.` not `$p` to internal pagination template
- **i18n**: Use `{{ i18n "key" }}` for all translatable strings
- **Timezone**: `Europe/Chisinau` (+02:00 or +03:00 DST)

### 7. Decap CMS
- **OAuth**: Two-step handshake, string format, explicit origin
- **Collections**: Separate for RO/RU (`news_ro`, `news_ru`)
- **Page bundles**: `path: "{{slug}}/index"`, `media_folder: ""`

### 8. Content Validation
- **Cutia Ungheni**: MANDATORY for `national` and `ue-romania` categories
- **No draft/publishDate conflicts**: Validation catches these
- **Formats**: Single value (stire, analiza, explainer, opinie, factcheck)
- **Categories**: At least one required

---

## Quick Reference

### Front Matter Schema
```yaml
title: "Required"
summary: "Required for SEO"
date: 2025-01-15T10:00:00+02:00
publishDate: 2025-01-15T10:00:00+02:00
draft: false
categories: ["local"]           # Required, at least one
formats: ["stire"]              # Required, exactly one
authors: ["author-slug"]        # Required, at least one
tags: ["tag1", "tag2"]          # Optional
featured: false                 # Homepage feature flag
cutia_ungheni:                  # MANDATORY for national/ue-romania
  impact_local: "..."
  ce_se_schimba: "..."
  termene: "..."
```

### Categories
- **Local**: `local`, `frontiera-transport`, `economie-fez`, `servicii-publice`, `educatie-sanatate`
- **Non-local** (require Cutia Ungheni): `national`, `ue-romania`

### Formats
- `stire`: News/breaking
- `analiza`: Analysis
- `explainer`: 3-step (What/Why/What's Next)
- `opinie`: Opinion (requires author)
- `factcheck`: Fact-check (requires sources + rating)

### Chrome DevTools MCP Tools
- **Navigation**: `navigate_page`, `new_page`, `select_page`, `close_page`
- **Inspection**: `take_snapshot`, `take_screenshot`, `list_console_messages`
- **Interaction**: `click`, `hover`, `fill`, `press_key`
- **Network**: `list_network_requests`, `get_network_request`
- **Performance**: `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`
- **Viewport**: `resize_page`, `emulate`

### Common Viewport Sizes
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1440x900

### MCP Documentation Queries
```bash
# Hugo docs
mcp__hugo_docs__search_hugoDocs_documentation query="multilingual taxonomy"
mcp__hugo_docs__fetch_hugoDocs_documentation

# Decap CMS docs
mcp__decap-cms_docs__search_decap_website_docs query="oauth github"
mcp__decap-cms_docs__fetch_decap_website_documentation
```

---

## Skill Loading (Automatic)

Skills load automatically based on task context. Reference explicitly when needed:

**Hugo template work**:
- Multilingual taxonomy issues → hugo-expert skill has solutions
- Front matter questions → hugo-expert/references/front-matter-schema.md

**Decap CMS work**:
- OAuth debugging → decap-cms-expert skill has critical postMessage patterns
- Collection config → decap-cms-expert skill has examples

**UI/UX verification**:
- After deployment → ui-ux-verifier skill has systematic protocol
- Performance analysis → ui-ux-verifier skill references Chrome DevTools MCP

---

## Subagent Invocation Patterns

### Simple Delegation
```
Use site-builder subagent to implement new category page with Hugo templates and Decap CMS collection.
```

### Sequential Cascade
```
Use site-builder to implement feature, THEN AUTOMATICALLY use code-reviewer to validate changes, THEN use ui-designer to optimize visuals.
```

### Parallel Execution
```
Use site-builder for backend Hugo templates AND SIMULTANEOUSLY use ui-designer for CSS styling.
```

### Error Handling
```
If encountering build errors, IMMEDIATELY use debugger subagent to investigate and resolve.
```

---

## Performance Optimization

### Font Loading
- Self-hosted IBM Plex (WOFF2) in `/static/fonts/`
- Preload critical fonts in `<head>`
- `font-display: swap` prevents FOIT

### Asset Processing
```go
{{ $css := resources.Get "css/main.scss" | toCSS | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">
```

### Image Optimization
- Cloudinary for external images (auto format/quality)
- Page bundle resources: `.Resources.GetMatch "featured.*"`
- Lazy loading below fold

### Core Web Vitals Targets
- **LCP**: < 2.5s (optimize featured images)
- **FID**: < 100ms (minimize JavaScript)
- **CLS**: < 0.1 (reserve space for images, no layout shifts)

---

## Debugging Decision Tree

**Build fails?**
→ `make check` → Read error → Fix template/config → Rebuild

**Template rendering wrong?**
→ Check hugo-expert skill for multilingual patterns → Apply correct approach

**OAuth not working?**
→ Check decap-cms-expert skill for two-step handshake → Verify `functions/api/auth.js`

**Visual issues after deploy?**
→ Use ui-ux-verifier skill protocol → chrome-devtools MCP verification

**404 errors?**
→ `list_network_requests` → Check file paths → Verify `static/` or page bundle

**Performance slow?**
→ `performance_start_trace` → navigate → `performance_stop_trace` → `performance_analyze_insight`

**Content validation fails?**
→ `make validate` → Read error → Fix front matter → Check Cutia Ungheni for national/UE

---

## Context Management

**When context gets too large**:
1. Summarize completed work
2. Close current conversation
3. Start new conversation with summary
4. Reference this CLAUDE.md (auto-loaded)
5. Load relevant skills (auto-loaded by context)

**Progressive disclosure**:
- Skills load metadata first (~100 words)
- Full skill loads when triggered
- Subagents get fresh isolated context
- No context pollution between agents

---

## Git Workflow

**Commit Message Format**:
```
<type>: <subject>

<body (optional)>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Branch**: `main` (deployment branch, protected)

**Deployment**:
- Push to `main` → Cloudflare Pages build
- Scheduled Worker builds every 5 minutes (publishes scheduled content)

---

## Final Checklist

Before ANY push to `main`:

- [ ] Code changes reviewed by code-reviewer subagent
- [ ] `make validate` passes
- [ ] `make check` passes
- [ ] `make build && make pagefind` succeeds
- [ ] User approved commit/push
- [ ] Commit message follows format
- [ ] Plan to verify deployment (ui-ux-verifier + chrome-devtools)

**Remember**: One task `in_progress` at a time. Complete before moving to next.
