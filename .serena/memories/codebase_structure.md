# Triunghi.md Codebase Structure

## Root Directory
```
ungheni-news/
├── .claude/              # Claude Code agents and skills
│   ├── agents/           # Subagent definitions (site-builder, ui-designer, etc.)
│   └── skills/           # Knowledge bases (hugo-expert, decap-cms-expert, ui-ux-verifier)
├── .github/              # GitHub workflows and actions
├── .serena/              # Serena MCP configuration and memories
├── assets/               # Hugo assets (processed by Hugo Pipes)
├── config/               # Hugo configuration (split by concern)
│   └── _default/         # Default configuration environment
│       ├── config.toml   # Main site config
│       └── languages.toml # Language configuration
├── content/              # Markdown content files
│   ├── ro/               # Romanian content
│   │   └── news/         # Romanian news articles (page bundles)
│   ├── ru/               # Russian content
│   │   └── news/         # Russian news articles (page bundles)
│   └── authors/          # Author profiles (multilingual)
├── data/                 # Data files for Hugo
│   ├── categories.yaml   # Category definitions
│   ├── rails.yaml        # Navigation rails
│   ├── navigation.yaml   # Main navigation
│   └── site.yaml         # Site-wide settings
├── docs/                 # Documentation
├── functions/            # Cloudflare Functions
│   └── api/              # API endpoints
│       ├── auth.js       # OAuth authentication (CRITICAL)
│       └── newsletter.js # Newsletter subscription
├── i18n/                 # Translation strings
│   ├── ro.yaml           # Romanian translations
│   └── ru.yaml           # Russian translations
├── layouts/              # Hugo templates
│   ├── _default/         # Default templates (single, list, taxonomy)
│   ├── partials/         # Reusable template partials
│   ├── shortcodes/       # Custom shortcodes
│   ├── categories/       # Category-specific templates
│   ├── formats/          # Format-specific templates
│   ├── authors/          # Author page templates
│   ├── tags/             # Tag page templates
│   ├── series/           # Series page templates
│   ├── dashboard/        # Dashboard templates
│   └── taxonomy-filter/  # Taxonomy filter templates
├── scripts/              # Build and utility scripts
│   └── validate_content.sh # Content validation script
├── static/               # Static files (copied as-is to public/)
│   ├── admin/            # Decap CMS admin interface
│   │   ├── config.yml    # CMS configuration (CRITICAL)
│   │   └── index.html    # CMS entry point
│   ├── fonts/            # Self-hosted fonts (IBM Plex WOFF2)
│   ├── img/              # Images
│   └── uploads/          # CMS uploaded media (fallback)
├── workers/              # Cloudflare Workers
│   └── cron.js           # Scheduled build trigger (every 5 min)
├── CLAUDE.md             # Project instructions for Claude Code
├── Makefile              # Build commands (ALWAYS use this)
├── go.mod                # Go module definition (Hugo modules)
├── wrangler.toml         # Cloudflare Workers configuration
├── pagefind.yml          # Pagefind search configuration
└── .editorconfig         # Editor configuration
```

## Key Directories Explained

### `/content/` - Markdown Content
**Structure**: Language-first organization
- `content/ro/news/` - Romanian articles
- `content/ru/news/` - Russian articles
- `content/authors/` - Author profiles (bilingual)

**Page Bundles**: Each article is a directory with `index.md` + media
```
content/ro/news/article-slug/
├── index.md              # Article content + front matter
├── featured.jpg          # Featured image
└── image-1.jpg           # Other images
```

### `/config/_default/` - Hugo Configuration
**Split configuration** for maintainability:
- `config.toml` - Main site config, taxonomies, related content
- `languages.toml` - Language definitions (ro, ru)
- Additional files possible: `menus.toml`, `params.toml`

### `/layouts/` - Hugo Templates
**Template Hierarchy**: Hugo follows lookup order
- `layouts/_default/single.html` - Default single page template
- `layouts/_default/list.html` - Default list page template
- `layouts/_default/taxonomy.html` - Default taxonomy term page
- `layouts/partials/` - Reusable components

**Critical Templates**:
- All taxonomy templates MUST use language-specific section approach
- Pagination templates MUST pass `.` context (not `$p` paginator)

### `/static/admin/` - Decap CMS
**CMS Interface**: Git-based content management
- `config.yml` - Collection definitions, field widgets, OAuth config
- `index.html` - CMS app entry point

**Key Configuration**:
- Backend: GitHub (repo: nalyk/ungheni-news)
- Auth endpoint: `/api/auth` (Cloudflare Function)
- Collections: `news_ro`, `news_ru`, `authors`

### `/functions/api/` - Cloudflare Functions
**Serverless Functions**: API endpoints
- `auth.js` - **CRITICAL**: OAuth authentication for Decap CMS
  - Two-step handshake required
  - String format postMessage (not object)
  - Explicit origin (never '*')

### `/i18n/` - Translation Strings
**Internationalization**: Template translations
- `ro.yaml` - Romanian UI strings
- `ru.yaml` - Russian UI strings
- Used in templates: `{{ i18n "key" }}`

### `/data/` - Data Files
**Data-Driven UI**: YAML data for Hugo templates
- `categories.yaml` - Category metadata (colors, descriptions)
- `navigation.yaml` - Navigation structure
- Accessed in templates: `.Site.Data.categories`

### `/scripts/` - Build Scripts
**Automation**: Validation and build helpers
- `validate_content.sh` - Content validation rules:
  - Draft/publishDate conflicts
  - Cutia Ungheni for national/ue-romania
  - Fact-check sources + rating
  - Opinion author requirement

### `/workers/` - Cloudflare Workers
**Scheduled Tasks**: Cron-triggered builds
- `cron.js` - Triggers Cloudflare Pages deploy hook every 5 minutes
- Purpose: Publish scheduled content automatically

## Content Organization Patterns

### Multilingual Content
**Language-specific directories**:
```
content/
├── ro/                   # Romanian
│   └── news/
│       └── article-slug/
│           └── index.md
└── ru/                   # Russian
    └── news/
        └── article-slug/
            └── index.md
```

**Taxonomy translations**:
```
content/authors/
└── author-slug/
    ├── _index.ro.md      # Romanian profile
    └── _index.ru.md      # Russian profile
```

### Page Bundle Assets
**Media co-location**: Images stored with content
- Simplifies media management
- Enables Hugo's image processing
- CMS configuration: `media_folder: ""`, `public_folder: ""`

## Build Output

### `/public/` - Generated Site
**Build output**: Created by `make build`
- Static HTML files
- Processed assets (minified CSS/JS)
- Copied static files
- RSS feeds
- Sitemap

### `/public/pagefind/` - Search Index
**Generated by**: `make pagefind`
- Search index files
- Required for site search functionality
- Must regenerate after every content change

## Critical Files

1. **Makefile** - ALWAYS use for builds (never call `hugo` directly)
2. **functions/api/auth.js** - OAuth endpoint (Decap CMS login)
3. **static/admin/config.yml** - CMS configuration
4. **scripts/validate_content.sh** - Content validation rules
5. **CLAUDE.md** - Project instructions and patterns
6. **config/_default/config.toml** - Hugo site configuration

## File Patterns to Know

### Configuration Files
- `*.toml` - Hugo configuration (TOML format)
- `*.yaml` / `*.yml` - Data files, i18n strings, CMS config

### Content Files
- `index.md` - Page bundle leaf pages (articles)
- `_index.md` - Branch pages (section indexes)
- `_index.{lang}.md` - Language-specific taxonomy terms

### Template Files
- `*.html` - Hugo templates (Go template syntax)
- `baseof.html` - Base template (if using blocks)

### Asset Files
- `*.scss` - Sass stylesheets (processed by Hugo Pipes)
- `*.js` - JavaScript (can be processed by Hugo Pipes)
- `*.woff2` - Web fonts (self-hosted)