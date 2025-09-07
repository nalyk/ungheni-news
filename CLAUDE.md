# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Hugo-based multilingual news website** for Ungheni city, Moldova (Romanian/Russian, Triunghi.md) with Decap CMS for content management. 

---
Triunghi.md = presă locală pentru Ungheni cu minte rece și coloană vertebrală. “Tri” înseamnă trei axe non-negociabile:

Oameni + Documente + Date la fiecare subiect.

Local > Național > Internațional (60/30/10) cu “Cutia Ungheni” obligatorie pe orice piesă non-locală.

Distribuție: Direct + Căutare + Social-video, dar produsul rămâne util pe site, nu clickbait pe platforme.
Totul livrat cu design curat, etichete clare de format și zero bullshit.
---

The architecture combines static site generation with headless CMS editorial workflow, deployed on Cloudflare Pages with automated builds.

## Essential Commands

### Development
- `make dev` - Start development server with drafts enabled
- `make build` - Production build with minification and garbage collection
- `make pagefind` - Generate search index (run after content changes)
- `make check` - Build with warnings exposed for debugging
- `make validate` - Validate content rules (draft/publishDate conflicts)

**IMPORTANT**: Hugo is installed locally at `/home/nalyk/bin/hugo`. Always use this path when calling Hugo directly, or use the `HUGO=/home/nalyk/bin/hugo` prefix with make commands to ensure compatibility.

### Playwright MCP Setup
- **MCP Playwright** is installed via: `claude mcp add playwright npx '@playwright/mcp@latest'`
- **After restart**: MCP tools become available as `mcp__playwright__*`
- **Homepage modernization**: COMPLETED - Modern layout with improved hero section, cards, responsive grid, and animations
- **Development server**: Should be running on `http://localhost:1313/`
- **Next task after restart**: Take desktop homepage screenshot using `mcp__playwright__browser_navigate` to verify modern layout improvements

### Deployment
- Push to `main` branch triggers automatic Cloudflare Pages deployment
- Cloudflare Worker runs scheduled builds every 5 minutes
- Build command: `make build && make pagefind`

### Setup & Maintenance
- `make setup` - Install pre-commit hooks
- `make docs` - Auto-regenerate AGENTS.md documentation
- `scripts/cf_pages_setup.sh` - Automate Cloudflare Pages setup
- `scripts/cf_access_setup.sh` - Configure admin panel protection

## Architecture

### Core Technologies
- **Hugo 0.127.0** with Go 1.22 - static site generator
- **Decap CMS** - headless CMS with GitHub backend
- **Pagefind** - client-side static search
- **Cloudflare Pages** - primary hosting with automated builds
- **Self-hosted IBM Plex Sans/Serif** - typography with Cyrillic support

### Directory Structure
- `admin/` - Decap CMS configuration and interface
- `config/_default/` - Hugo configuration split by concern
- `content/ro/` & `content/ru/` - Multilingual content (page bundles)
- `data/` - Categories, site metadata, homepage rails configuration
- `i18n/` - Translation strings for templates
- `layouts/` - Hugo templates with modular partials
- `static/fonts/` - Self-hosted WOFF2 fonts with preloads
- `workers/cron.js` - Cloudflare Worker for scheduled builds

### Content Management
- **Admin interface**: `/admin/` (protected by Cloudflare Access)
- **Editorial workflow**: Draft → Review → Publish process
- **Page bundles**: Each article is `content/[lang]/news/[slug]/index.md`
- **Media**: Cloudinary integration with local fallback to `static/uploads/`
- **Taxonomies**: Categories (local focus), formats (news types), authors, tags

## Development Patterns

### Content Structure
- **Multilingual**: Parallel content in `ro/` and `ru/` directories
- **Categories**: Local news focus with special categories for Ungheni context
- **Formats**: `stire`, `analiza`, `explainer`, `opinie`, `factcheck`
- **Front matter**: Title, summary, categories, formats, authors, dates, featured status

### Styling Architecture
- **Main stylesheet**: `assets/css/main.scss` with modern CSS features
- **Typography system**: Serif headings (authority), sans-serif body text
- **Theme configuration**: Colors defined in `data/colors.yaml`
- **Container queries**: Modern responsive design patterns

### Template Organization
- **Base templates**: `layouts/_default/` for core page types
- **Partials**: Reusable components in `layouts/partials/`
- **Taxonomy templates**: Specialized layouts for categories, authors, tags
- **Multilingual**: Language-aware URL generation and content rendering

## Key Integrations

### Search Implementation
- **Pagefind**: Generates static search index post-build
- **Client-side**: No server required, works with static hosting
- **Rebuild required**: Run `make pagefind` after content changes

### Internationalization
- **Primary**: Romanian (`ro`) - weight 1
- **Secondary**: Russian (`ru`) - weight 2
- **Template strings**: `i18n/ro.yaml` and `i18n/ru.yaml`
- **Timezone**: Europe/Chisinau for publish dates

### Automation Features
- **Scheduled builds**: Every 5 minutes via Cloudflare Worker
- **Content validation**: Pre-commit hooks prevent invalid draft states
- **Documentation**: Auto-generated AGENTS.md reflects current state
- **Build optimization**: Hugo with garbage collection and minification

## Editorial Workflow

### Content Creation
1. Access `/admin/` interface (requires Cloudflare Access authentication)
2. Create content in appropriate language collection
3. Use page bundle structure for articles with media
4. Follow category system focused on local Ungheni coverage
5. Set appropriate formats and author attributions

### Publishing Process
- **Drafts**: Set `draft: true` for unpublished content
- **Scheduled**: Use `publishDate` for future publication
- **Validation**: Automated checks prevent conflicting states
- **Build triggers**: Manual, webhook, or scheduled (5-minute intervals)

## Performance Considerations

### Font Loading
- Self-hosted IBM Plex with WOFF2 format and Cyrillic support
- Preload directives for critical font files
- Font-display: swap for performance

### Asset Optimization
- CSS/JS minification with fingerprinting
- Image optimization via Cloudinary (auto format/quality)
- Static site benefits from CDN caching

### Build Performance
- Hugo with garbage collection enabled
- Pagefind indexing as separate post-build step
- Automated builds prevent stale content

## Security & Access Control

### Admin Protection
- Cloudflare Access guards `/admin/*` path
- GitHub OAuth integration for CMS authentication
- Environment separation for preview/production

### Content Security
- Git-based content storage with version control
- Automated validation prevents publishing errors
- Pre-commit hooks enforce content rules

## Autonomous Agent Orchestration

### Specialized Subagents (MUST BE USED PROACTIVELY)
This project leverages specialized Claude Code subagents in `.claude/agents/` for modular, context-isolated workflows:

- **site-builder** (RED): Use IMMEDIATELY for any Hugo site building, CMS configuration, layout creation, or deployment tasks
- **ui-designer** (BLUE): Use PROACTIVELY after any visual changes to optimize design and UX
- **code-reviewer** (GREEN): Use AUTOMATICALLY after writing/modifying code for quality assurance
- **debugger** (YELLOW): Use INSTANTLY when encountering build errors, test failures, or unexpected behavior

### Orchestration Patterns (2025 Best Practices)
**ULTRATHINK**: For complex multi-step tasks, Claude should "ultrathink" to allocate maximum reasoning budget before delegating.

**Hierarchical Delegation**:
1. Main Claude analyzes requirements and breaks down tasks
2. Delegates specific work to appropriate subagents in parallel
3. Synthesizes results and coordinates follow-up actions
4. Uses code-reviewer to validate all modifications

**Proactive Usage Triggers**:
- ANY code modification → code-reviewer agent
- ANY visual/UX work → ui-designer agent  
- ANY build/deployment → site-builder agent
- ANY errors/issues → debugger agent

### Context Isolation Benefits
- Each subagent operates in isolated context preventing "context pollution"
- Parallel processing enables 90%+ performance improvements
- Specialized prompts and tools for domain-specific expertise
- Reduced path dependency through independent investigations

### Automation Commands & Conflict Resolution

**Sequential Orchestration** (when agents overlap):
```
"Use the site-builder agent to implement [task], then AUTOMATICALLY use the code-reviewer agent to validate changes, then use the ui-designer agent to optimize visuals, then use the debugger agent to verify everything works."
```

**Parallel Orchestration** (independent tasks):
```
"Use the site-builder agent for backend implementation AND SIMULTANEOUSLY use the ui-designer agent for frontend styling."
```

### Overlapping Situation Handlers

**Code Changes (ANY source)**:
- site-builder modifies templates → AUTOMATICALLY trigger code-reviewer
- debugger fixes bugs → AUTOMATICALLY trigger code-reviewer  
- ui-designer changes CSS → AUTOMATICALLY trigger code-reviewer
- **Rule**: ALL code modifications must pass through code-reviewer regardless of source agent

**Build/Deployment Changes**:
- code-reviewer suggests structural changes → AUTOMATICALLY trigger site-builder
- ui-designer modifies assets → AUTOMATICALLY trigger site-builder for build testing
- debugger fixes build issues → AUTOMATICALLY trigger site-builder to verify
- **Rule**: ALL changes affecting build process must be validated by site-builder

**Visual/UX Impacts**:
- site-builder adds new pages/components → AUTOMATICALLY trigger ui-designer
- debugger fixes visual bugs → AUTOMATICALLY trigger ui-designer for optimization
- code-reviewer suggests UI improvements → AUTOMATICALLY trigger ui-designer
- **Rule**: ALL changes affecting user experience must be optimized by ui-designer

**Error/Issue Detection**:
- ANY agent encounters errors → IMMEDIATELY trigger debugger
- site-builder build failures → IMMEDIATELY trigger debugger
- code-reviewer finds critical issues → IMMEDIATELY trigger debugger
- **Rule**: ALL errors/failures must be resolved by debugger before proceeding

### Priority Cascade (when conflicts arise)
1. **debugger** = HIGHEST (resolve errors first)
2. **code-reviewer** = HIGH (ensure quality before proceeding)  
3. **site-builder** = MEDIUM (implement functionality)
4. **ui-designer** = LOW (polish after functionality works)

### File Conflict Resolution
- Multiple agents targeting same files → Use sequential execution in priority order
- Agent recommendations conflict → Higher priority agent wins, lower priority adapts
- Circular dependencies → Break cycle at ui-designer (lowest priority)

**Critical**: Never skip automatic triggers. Each agent's output must cascade to relevant dependent agents according to these rules.