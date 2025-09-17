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

1.  **Think Sequentially**: For any non-trivial task, I will use `sequentialthinking` to break down the problem into a clear, step-by-step plan. This is my primary method for structured problem-solving.
2.  **Execute & Verify**: I will execute the steps using the available tools (my own, native tools, mcp (eg:`hugo-mcp`), run shell commands, etc.).
3.  **Self-Correction**: If a step fails, I will analyze the error and revise my plan.

### Capabilities (MCPs)

I have access to the following toolsets (MCPs):
- `sequential-thinking`: For breaking down complex tasks.
- `hugo-mcp`: **DEPRECATED for this project, with the exception of `create_post`.** The project's `Makefile` is more reliable and specific for building and previewing the site. I will use `run_shell_command` with `make` for all Hugo-related tasks except for creating new posts.
- `playwright-extension`: For browser interaction. I have tested this tool and it appears to be functional in this environment.
- `cloudflare`: For searching Cloudflare documentation.

### Deployment
- Push to `main` branch triggers automatic Cloudflare Pages deployment
- Cloudflare Worker runs scheduled builds every 5 minutes
- Build command: `make build && make pagefind`

### Setup & Maintenance
- No repo-specific `make` setup commands are required beyond the build and validation tasks above.
- `scripts/cf_pages_setup.sh` - Automate Cloudflare Pages setup
- `scripts/cf_access_setup.sh` - Configure admin panel protection

Documentation updates are handled manually during feature work; coordinate with the team before changing shared docs.

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

## Decap CMS OAuth Authentication Setup

### Critical Implementation Details (HARD-LEARNED LESSONS)

This section documents the complete OAuth authentication implementation for Decap CMS with GitHub backend on Cloudflare Pages, including all the critical gotchas that MUST be avoided.

#### OAuth App Configuration (GitHub)
- **Client ID**: `Ov23liSvb4wITabAOGoo`
- **Homepage URL**: `https://triunghi.md/admin`
- **Authorization callback URL**: `https://triunghi.md/api/auth` ⚠️ **CRITICAL**: Must match exactly!

#### Environment Variables (Cloudflare Pages)
- **Variable**: `GITHUB_CLIENT_SECRET` (Type: Secret/Encrypted)
- **Location**: Dashboard → Project → Settings → Environment Variables

#### Cloudflare Pages Functions Implementation

**File Structure**: `functions/api/auth.js` at project root (NOT in static/)
- Cloudflare Pages automatically detects `/functions/` directory during build
- Creates `/api/auth` endpoint automatically via file-based routing
- Works perfectly with GitHub auto-deployment

#### OAuth Flow Implementation - THE CORRECT WAY

**CRITICAL MISTAKES TO AVOID**:

1. **❌ WRONG postMessage format**:
   ```javascript
   // This DOES NOT WORK - Decap CMS ignores JSON objects
   window.opener.postMessage({
     type: 'authorization_grant',
     token: 'xxx'
   }, origin);
   ```

2. **✅ CORRECT postMessage format**:
   ```javascript
   // This WORKS - Decap CMS expects STRING format
   window.opener.postMessage(
     'authorization:github:success:' + JSON.stringify({
       token: 'xxx',
       provider: 'github'
     }),
     'https://triunghi.md'
   );
   ```

3. **❌ WRONG: Missing handshake**
   - Just sending success message = CMS ignores it completely
   - User stares at login button forever

4. **✅ CORRECT: Two-step handshake**
   ```javascript
   // Step 1: Handshake (tells CMS auth flow started)
   window.opener.postMessage("authorizing:github", "https://triunghi.md");

   // Step 2: Success (after small delay)
   setTimeout(() => {
     window.opener.postMessage(
       'authorization:github:success:' + JSON.stringify({...}),
       'https://triunghi.md'
     );
   }, 100);
   ```

5. **❌ WRONG origin handling**:
   ```javascript
   // Using window.location.origin or '*' can fail
   window.opener.postMessage(message, window.location.origin); // ❌
   window.opener.postMessage(message, '*'); // ❌ Security risk
   ```

6. **✅ CORRECT origin**:
   ```javascript
   // Use explicit domain origin
   window.opener.postMessage(message, 'https://triunghi.md'); // ✅
   ```

#### Complete Working Flow

1. **User clicks "Login with GitHub" in `/admin/`**
2. **Decap CMS opens popup to `https://triunghi.md/api/auth`**
3. **Cloudflare function redirects popup to GitHub OAuth**
4. **GitHub redirects back to `https://triunghi.md/api/auth?code=...`**
5. **Function exchanges code for token via GitHub API**
6. **Function returns HTML with two-step postMessage:**
   - First: `"authorizing:github"` (handshake)
   - Second: `"authorization:github:success:{token data}"` (success)
7. **Popup closes, CMS receives messages and completes login**

#### Debugging OAuth Issues

**Essential debugging setup** in `/admin/index.html`:
```javascript
window.addEventListener('message', function(event) {
  console.log('🎯 CMS: Received postMessage from:', event.origin);
  console.log('🔍 CMS: Message data:', event.data);
  console.log('🔍 CMS: Message type:', typeof event.data);
});
```

**Common failure symptoms**:
- Popup opens, closes successfully, but user still sees login screen = **Message format issue**
- No postMessage received = **Origin mismatch issue**
- Console shows messages received but CMS doesn't respond = **Missing handshake**

#### Security Considerations

- ✅ Use specific origins, never `'*'` in production
- ✅ Validate GitHub token and user permissions server-side
- ✅ Check repository access (owner/collaborator only)
- ✅ Environment variables for secrets (never hardcode)

#### File Locations Summary

```
functions/api/auth.js          # OAuth endpoint (server-side)
static/admin/index.html        # CMS interface with debug logging
static/admin/config.yml        # CMS config with auth_endpoint
```

### Deployment Notes

- Push to `main` triggers automatic CF Pages build
- CF Pages detects `/functions/` and creates endpoints automatically
- No additional configuration needed once environment variables are set
- OAuth flow works immediately after deployment

### Performance Impact

- OAuth popup flow adds ~2-3 seconds to login process
- No impact on static site performance
- Token exchange happens server-side (secure)
- Debugging logs can be removed in production for cleaner console

**LESSON LEARNED**: The devil is in the details with OAuth flows. Every character in the postMessage format matters, and the two-step handshake is absolutely critical for Decap CMS recognition.

## UI/UX Development and Verification Protocol

This protocol is my standard procedure for implementing and verifying any changes that affect the website's layout, UI, or UX.

1.  **Code Implementation:** I will make the required changes to the relevant HTML, CSS, and/or JavaScript files.
2.  **Deployment:** I will commit and push the changes to the `main` branch, which will trigger a Cloudflare Pages deployment.
3.  **Wait for Deployment:** I will use the `browser_wait_for` tool to pause for a reasonable amount of time (e.g., 2-3 minutes) to allow the deployment to complete.
4.  **Verification:** This is the most critical step. I will perform a series of checks to verify the deployment and the changes.
    *   **Structural Verification:** I will navigate to the affected page and use `browser_snapshot` to get the new accessibility tree. I will analyze this snapshot to confirm that the HTML structure has changed as expected.
    *   **Visual Verification:** I will use `browser_take_screenshot` to capture a visual representation of the changes. I will then present the path to this screenshot to you for visual feedback. This is how I will "see" the result through your eyes.
    *   **Screenshot Storage:** All screenshots will be saved in the `dev_screens/` directory within the project repository. This directory is included in `.gitignore` to prevent committing images to the repository.
    *   **Responsive Design Verification:** For any significant layout changes, I will use `browser_resize` to test the page at different viewport sizes (e.g., 375px for mobile, 768px for tablet, 1440px for desktop). I will take screenshots at each size to verify the responsiveness.
    *   **Asset Loading Verification:** I will use `browser_network_requests` to check for any 404 errors, ensuring that all new assets (images, CSS, JS) are loading correctly. This would have caught the issue with the image in our previous interaction.
    *   **Interaction Verification:** For changes involving interactive elements (buttons, forms, etc.), I will use tools like `browser_click`, `browser_hover`, and `browser_type` to test their functionality.
5.  **Analysis and Decision:** Based on the results of the verification steps, I will determine if the change was successful.
    *   If successful, I will report my findings and the successful verification to you.
    *   If unsuccessful, I will analyze the errors (e.g., 404s in network requests, incorrect structure in the snapshot) and formulate a plan to fix the issue.
6.  **Report and Handoff:** I will present a summary of my actions, the verification results (including screenshot paths), and my conclusion to you for final approval or further feedback.

Final Instructions

- **Prioritize `make`**: Always use the `Makefile` commands. Do not run `hugo` directly unless necessary.
- **Hugo Installation**: The required Hugo version `v0.127.0` is installed at `~/bin/hugo`.
- **Acknowledge Limitations**: I do not have sub-agents. I will use sequential thinking to manage complexity.
- **Playwright is Functional**: The `playwright-extension` has been tested and is functional in this environment.
