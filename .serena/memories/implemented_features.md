# Implemented Features in Triunghi.md

This memory documents **verified, production-ready features** in the codebase. Used to distinguish between implemented functionality and aspirational/planned features from temporary development docs.

**Last verified**: Based on codebase analysis as of current state

---

## ✅ Newsletter Integration (Prut Brief)

**Status**: IMPLEMENTED
**Files**:
- `functions/api/newsletter.js` - Cloudflare Function for subscriptions
- `layouts/partials/service-rail/prut-brief.html` - Frontend signup form

**Service**: Buttondown email service
**Functionality**:
- Email validation (client + server)
- Subscriber management via Buttondown API
- Duplicate detection
- Metadata tracking (source, tags)
- CORS support for development

**Required Configuration**:
- Environment variable: `BUTTONDOWN_API_KEY` (Cloudflare Pages)

**Documentation**: `docs/prut-brief-setup.md`, `docs/prut-brief-email-example.md`

---

## ✅ Editorial Dashboard

**Status**: IMPLEMENTED
**Files**:
- `static/js/dashboard.js` - Analytics and metrics
- `layouts/dashboard/single.html` - Dashboard template
- `content/ro/dashboard/_index.md` - Dashboard page

**Features**:
- 60/30/10 ratio tracker (Local/National/International)
- Cutia Ungheni compliance monitoring
- Format distribution analyzer
- Scheduled content calendar
- Recent activity feed
- Editorial health score (0-100 grading)
- Time range filters (7/30/90 days, all time)

**Access**: `/ro/dashboard/`

**Documentation**: `docs/IMPLEMENTATION_SUMMARY.md` (Recommendation #7)

---

## ✅ Multimedia Embeds

**Status**: IMPLEMENTED
**Files**: `layouts/shortcodes/*.html` (13 shortcodes)

**Supported Platforms**:
1. **Video**: YouTube, TikTok, Vimeo, Facebook Video
2. **Social**: Instagram, Twitter/X, Facebook Posts, Telegram
3. **Audio**: Spotify, SoundCloud
4. **Data Viz**: Datawrapper, Flourish
5. **Maps**: Google Maps
6. **Fallback**: Generic iframe embed

**Features**:
- Privacy-friendly (YouTube nocookie, Vimeo DNT)
- Lazy loading for performance
- Responsive design (16:9, 9:16, native aspect ratios)
- Markdown shortcode syntax

**Documentation**: `docs/MULTIMEDIA_EMBEDS.md` (complete guide)

---

## ✅ Series & Related Articles

**Status**: IMPLEMENTED

### Series System
**Files**:
- `layouts/partials/series-navigation.html` - Navigation widget
- `data/series.yaml` - Series metadata
- `layouts/series/term.html` - Series landing pages

**Features**:
- Multi-part investigative stories
- Prev/Next navigation between parts
- Progress tracking (Part X of Y)
- Series landing pages with metadata
- Status tracking (ongoing/completed/paused)

### Related Articles
**Files**: Hugo's built-in related content (`.Related`) + manual overrides

**Features**:
- Hybrid: Manual selection + automatic recommendations
- Language-specific filtering
- Minimum 3 articles guaranteed

**Documentation**: `docs/RELATED_ARTICLES_AND_SERIES.md`

---

## ✅ Content Validation System

**Status**: IMPLEMENTED
**File**: `scripts/validate_content.sh`

**Validations**:
1. **Draft/PublishDate Conflict**: Prevents `draft: true` + `publishDate` combination
2. **Cutia Ungheni Requirement**: Enforces for `national` and `ue-romania` categories
   - Supports v2 structure (title + markdown content)
   - Supports v1 structure (impact_local, ce_se_schimba, termene, unde_aplici)
   - Backward compatible
3. **Fact-Check Requirements**: Validates sources + rating for fact-checks
4. **Opinion Authorship**: Requires author attribution for opinion articles

**Integration**: `Makefile` targets (`make validate`, `make build`)

**Documentation**: `docs/CUTIA_UNGHENI_ENFORCEMENT.md` (detailed multi-layer enforcement)

---

## ✅ Decap CMS Configuration

**Status**: IMPLEMENTED (with fixes applied)
**File**: `static/admin/config.yml`

**Collections**:
- `news_ro` - Romanian articles
- `news_ru` - Russian articles
- `authors` - Author profiles (multilingual)
- `section_settings` - Section page configuration

**Key Fixes Applied** (vs. Oct 2025 analysis):
- ✅ Categories field: `multiple: true, min: 1, max: 1` (outputs arrays)
- ✅ Formats field: `multiple: true, min: 1, max: 1` (outputs arrays)
- ✅ Cutia Ungheni: v2 structure (title + markdown content)
- ✅ Page bundles: `media_folder: ""`, `public_folder: ""`

**OAuth**: Two-step handshake via `functions/api/auth.js`

**Documentation**: Critical patterns documented in `critical_patterns` memory

---

## ✅ Multilingual Architecture

**Status**: IMPLEMENTED
**Languages**: Romanian (ro, weight 1), Russian (ru, weight 2)

**Content Organization**:
- Language-first directory structure (`content/ro/`, `content/ru/`)
- Page bundles for media co-location
- i18n translation strings (`i18n/ro.yaml`, `i18n/ru.yaml`)

**Critical Pattern**: Language-specific section approach for taxonomies
- See `critical_patterns` memory, Pattern #1

**Timezone**: Europe/Chisinau (+02:00 or +03:00 DST)

---

## ✅ Search Functionality

**Status**: IMPLEMENTED
**Tool**: Pagefind (static search index)

**Integration**:
- Build command: `make pagefind` (after `make build`)
- Search index location: `public/pagefind/`
- Frontend: Search interface on site

**Critical**: Must regenerate index after every content change

---

## ✅ Scheduled Publishing

**Status**: IMPLEMENTED
**Mechanism**: Cloudflare Worker + Pages deploy hook

**Files**:
- `workers/cron.js` - Scheduled build trigger
- Cloudflare Worker runs every 5 minutes

**Functionality**:
- Automatically publishes content with future `publishDate`
- Triggers Cloudflare Pages deployment
- No manual intervention required

---

## ✅ Build & Deployment

**Status**: IMPLEMENTED

**Build Tools**:
- Hugo 0.127.0 (location: `/home/nalyk/bin/hugo`)
- Makefile commands (ALWAYS use these, never direct hugo calls)

**Commands**:
- `make dev` - Local development server
- `make build` - Production build (GC + minify)
- `make pagefind` - Generate search index
- `make check` - Strict build (fails on warnings)
- `make validate` - Content validation

**Deployment**:
- Platform: Cloudflare Pages
- Trigger: Git push to `main` branch
- Functions: Cloudflare Functions (OAuth, Newsletter)

---

## ❌ NOT YET IMPLEMENTED

### Live Publications Panel
**Status**: ASPIRATIONAL (design doc only)
**Doc**: `docs/CMS_WORKFLOW_AND_VALIDATION_ANALYSIS.md`
**Description**: Proposed solution for editorial feedback loop showing per-publication build status
**Why not implemented**: Requires Cloudflare + GitHub API integration, token management

### Analytics Integration
**Status**: PLANNED
**Doc**: References in `IMPLEMENTATION_SUMMARY.md` (Recommendation #1)
**Description**: Plausible or GoatCounter for user tracking
**Why not implemented**: External service integration pending

### Errata System
**Status**: PLANNED
**Doc**: `IMPLEMENTATION_SUMMARY.md` (Recommendation #3)
**Description**: Timestamp-based update tracking with visible errata
**Why not implemented**: Template and workflow not yet created

---

## Verification Checklist

When updating this memory, verify features by:
1. ✅ File existence check (Read tool, find_file)
2. ✅ Code inspection (actual implementation vs docs)
3. ✅ Build success (make validate && make build)
4. ✅ Cross-reference with other memories (critical_patterns, codebase_structure)

**Rule**: If a feature exists in `/docs/` but not in code → mark as aspirational, NOT implemented.

---

## Related Memories

- **critical_patterns** - Technical implementation patterns for features
- **codebase_structure** - File locations and architecture
- **code_style_conventions** - Front matter schemas, naming conventions
- **project_overview** - High-level project description

---

**Maintenance**: Update this memory when:
- New features are fully implemented and tested
- Features move from planned → implemented
- Implementation status changes (e.g., partial → complete)
- User asks "Is X implemented?" and answer is unclear
