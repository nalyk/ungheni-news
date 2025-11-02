---
name: ui-ux-verifier
description: Use this skill when implementing or verifying UI/UX changes on the Triunghi.md website. Triggers include layout modifications, CSS changes, responsive design work, accessibility improvements, or any visual/interactive updates. Essential for systematic verification of deployed changes through browser testing, screenshots, and multi-viewport validation.
---

# UI/UX Verifier

## Overview

Provide systematic UI/UX verification methodology for the Triunghi.md website using Chrome DevTools MCP. Handle complete verification workflows including deployment waiting, structural validation, visual testing across viewports, asset loading verification, performance tracing, and interaction testing. Ensure changes work correctly in production before considering tasks complete.

## Verification Protocol

This is the standard procedure for implementing and verifying ANY changes affecting website layout, UI, or UX.

### Step 1: Code Implementation

Make required changes to relevant files:
- HTML templates (`layouts/`)
- CSS stylesheets (`assets/css/`)
- JavaScript (`assets/js/`)
- Hugo configuration (`config/`)

### Step 2: Deployment

Commit and push changes to `main` branch:
```bash
git add .
git commit -m "Description of UI/UX changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

This triggers automatic Cloudflare Pages deployment.

### Step 3: Wait for Deployment

**CRITICAL**: Must wait for deployment to complete before verification.

Use deployment wait period (2-3 minutes):
```bash
# Wait 180 seconds for deployment
sleep 180
```

**Why**: Cloudflare Pages needs time to:
1. Build Hugo site
2. Generate Pagefind index
3. Deploy to CDN
4. Propagate changes globally

### Step 4: Verification (MOST CRITICAL)

Perform comprehensive verification using Chrome DevTools MCP tools.

#### 4.1 Structural Verification

Navigate to affected page and capture accessibility tree:

**Purpose**: Confirm HTML structure changed as expected

**Process**:
1. Navigate to page (e.g., `https://triunghi.md/ro/` or `https://triunghi.md/ro/categories/local/`)
2. Use `take_snapshot` to get DOM/accessibility tree
3. Analyze snapshot for expected structural changes

**Example**:
```
Expected: New article card with class "featured-article"
Actual: Snapshot shows article StaticText "Article Title" in article with role="article"
Result: ✅ Structure matches expectations
```

#### 4.2 Visual Verification

Capture screenshots for visual inspection:

**Purpose**: Visual confirmation of changes

**Process**:
1. Take screenshot of affected page
2. Save to `dev_screens/` directory (gitignored)
3. Present screenshot path to user for feedback

**Screenshot Storage**:
```
dev_screens/
├── homepage-desktop-20250115.png
├── category-mobile-20250115.png
└── article-tablet-20250115.png
```

**Why gitignored**: Prevents committing large image files to repository

#### 4.3 Responsive Design Verification

Test at multiple viewport sizes:

**Standard Viewports**:
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1440x900 (Standard desktop)

**Process**:
1. Use `resize_page` to set viewport dimensions
2. Take screenshot at each size
3. Verify layout adapts correctly

**Example**:
```javascript
// Mobile
resize_page({width: 375, height: 667});
take_screenshot({path: "dev_screens/mobile.png"});

// Tablet
resize_page({width: 768, height: 1024});
take_screenshot({path: "dev_screens/tablet.png"});

// Desktop
resize_page({width: 1440, height: 900});
take_screenshot({path: "dev_screens/desktop.png"});
```

**What to verify**:
- Text remains readable
- Images scale appropriately
- Navigation adapts (mobile menu vs desktop menu)
- Cards/grids reflow correctly
- No horizontal scrolling on mobile

#### 4.4 Asset Loading Verification

Check for 404 errors and loading issues:

**Purpose**: Ensure all assets load correctly

**Process**:
1. Use `list_network_requests` to capture network activity
2. Filter for failed requests (404, 500)
3. Identify missing or broken assets

**Common Issues**:
- Missing images (404)
- CSS file not found
- Font files failing to load
- JavaScript errors

**Example**:
```
Network requests:
✅ GET /css/main.min.css → 200 OK
❌ GET /images/logo.png → 404 Not Found
✅ GET /fonts/ibm-plex-sans.woff2 → 200 OK
```

**Action**: Fix 404s by:
1. Checking file paths in templates
2. Verifying file exists in `static/` or page bundle
3. Correcting typos in filenames

#### 4.5 Interaction Verification

Test interactive elements:

**Purpose**: Confirm functionality works

**Tools**:
- `click` - Click buttons, links, cards
- `hover` - Test hover states
- `fill` - Test form inputs
- `evaluate_script` - Run custom JavaScript for advanced interactions

**Common Interactions**:
- Click article card → Navigate to article
- Click category link → Navigate to category page
- Hover over navigation → Show dropdown
- Type in search → Show results
- Click language switcher → Change language

**Example**:
```javascript
// Test article card click
click({selector: ".article-card:first-child a"});
// Verify URL changed to article page

// Test search input
fill({selector: "#search-input", value: "Ungheni"});
// Verify search results appear
```

### Step 5: Analysis & Decision

Based on verification results:

**If Successful**:
- Document findings
- Report successful verification to user
- Provide screenshot paths for review
- Consider task complete

**If Unsuccessful**:
- Analyze errors (404s, structural mismatches, visual issues)
- Formulate fix plan
- Implement fixes
- Repeat verification cycle

### Step 6: Report & Handoff

Present comprehensive summary:

```markdown
## Verification Report

### Changes Implemented
- Modified: layouts/_default/taxonomy.html
- Updated: assets/css/main.scss

### Structural Verification
✅ Accessibility tree shows updated card structure
✅ Language-specific filtering working correctly

### Visual Verification
Screenshots saved:
- dev_screens/category-desktop-20250115.png
- dev_screens/category-mobile-20250115.png

### Asset Loading
✅ All CSS files loaded (200 OK)
✅ All images loaded successfully
✅ Fonts preloaded correctly

### Responsive Testing
✅ Desktop (1440px): Layout correct
✅ Tablet (768px): Cards reflow to 2 columns
✅ Mobile (375px): Single column, readable text

### Conclusion
All verifications passed. Changes deployed successfully.
```

## Common Verification Scenarios

### Scenario 1: Homepage Layout Change

```markdown
1. Implement: Modify layouts/index.html for new featured section
2. Deploy: Push to main, wait 3 minutes
3. Verify:
   - Navigate to https://triunghi.md/ro/
   - Snapshot: Confirm featured section structure
   - Screenshot: Visual confirmation at 1440px
   - Responsive: Test at 375px, 768px, 1440px
   - Assets: Check network requests for images
   - Interaction: Click featured article card
4. Report: Screenshot paths + verification results
```

### Scenario 2: Category Page Styling

```markdown
1. Implement: Update assets/css/main.scss for category cards
2. Deploy: Commit + push, wait 3 minutes
3. Verify:
   - Navigate to https://triunghi.md/ro/categories/local/
   - Snapshot: Confirm card structure unchanged
   - Screenshot: Verify new styling applied
   - Responsive: Test card layout at all viewports
   - Assets: Verify CSS file loaded with new fingerprint
   - Interaction: Hover over card, click category link
4. Report: Before/after screenshots if possible
```

### Scenario 3: Navigation Menu Update

```markdown
1. Implement: Modify layouts/partials/header.html
2. Deploy: Push changes, wait 3 minutes
3. Verify:
   - Navigate to https://triunghi.md/ro/
   - Snapshot: Confirm nav structure
   - Screenshot: Desktop nav bar
   - Responsive: Mobile hamburger menu at 375px
   - Interaction: Click menu items, test mobile toggle
   - Assets: Check for any icon/logo 404s
4. Report: Multi-viewport screenshots
```

### Scenario 4: Font Loading Optimization

```markdown
1. Implement: Update layouts/_default/baseof.html with preload tags
2. Deploy: Commit, wait 3 minutes
3. Verify:
   - Navigate to homepage
   - Network: Filter for font requests
   - Check: Preload hints in HTML head
   - Performance: Verify fonts load before render
   - Visual: Confirm no FOUT (flash of unstyled text)
4. Report: Network waterfall screenshot showing preload
```

## Viewport Standards

### Mobile (375px)
- **Device**: iPhone SE, iPhone 12/13 mini
- **Test**: Single column layout, touch targets ≥44px
- **Critical**: No horizontal scroll, readable text

### Tablet (768px)
- **Device**: iPad, iPad Mini
- **Test**: 2-column grids, medium font sizes
- **Critical**: Efficient use of space, no cramping

### Desktop (1440px)
- **Device**: Standard laptop/desktop
- **Test**: Multi-column layouts, hover states
- **Critical**: Max-width container, optimal line length

## Asset Verification Checklist

### CSS Files
- [ ] Main stylesheet loads (200 OK)
- [ ] Fingerprinted hash in URL
- [ ] Minified in production
- [ ] Source map available (if needed)

### JavaScript Files
- [ ] All scripts load successfully
- [ ] No console errors (check with `list_console_messages`)
- [ ] Deferred/async loading working
- [ ] ES modules loading correctly

**Console Verification**:
Use `list_console_messages` to check for:
- JavaScript errors (red)
- Warnings (yellow)
- Network failures
- Deprecation notices

**Example**:
```javascript
list_console_messages();
// Look for error/warning messages
// Investigate any unexpected console output
```

### Images
- [ ] Featured images load
- [ ] Correct sizes/formats (WebP fallback)
- [ ] Alt text present (accessibility)
- [ ] Lazy loading working

### Fonts
- [ ] WOFF2 files load from /fonts/
- [ ] Preload hints in HTML head
- [ ] Cyrillic characters render correctly
- [ ] font-display: swap preventing FOIT

## Accessibility Verification

### Semantic HTML
- [ ] Headings hierarchical (h1 → h2 → h3)
- [ ] Landmarks (header, nav, main, footer)
- [ ] Lists use ul/ol properly
- [ ] Buttons vs links used correctly

### ARIA & Labels
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] ARIA roles where needed
- [ ] Focus visible on interactive elements

### Keyboard Navigation
- [ ] Tab order logical
- [ ] All interactive elements reachable
- [ ] Skip links for navigation
- [ ] Enter/Space activate buttons

## Performance Checks

### Core Web Vitals Awareness
- **LCP (Largest Contentful Paint)**: Ensure featured images optimized
- **FID (First Input Delay)**: Test interactive elements respond quickly
- **CLS (Cumulative Layout Shift)**: Verify no layout shifts during load

### Loading Optimization
- [ ] Critical CSS inlined or preloaded
- [ ] Fonts preloaded
- [ ] Images lazy-loaded below fold
- [ ] JavaScript deferred or async

## Performance Tracing (Chrome DevTools MCP)

Chrome DevTools MCP provides native performance tracing capabilities for in-depth analysis.

### When to Use Performance Tracing

- Page feels slow or unresponsive
- Investigating Core Web Vitals issues
- Optimizing initial load time
- Debugging layout shifts or paint issues
- Analyzing JavaScript execution time

### Performance Tracing Workflow

**Step 1: Start Trace**
```javascript
performance_start_trace();
```

**Step 2: Perform Actions**
- Navigate to page
- Interact with elements
- Scroll, click, type
- Let page fully load

**Step 3: Stop Trace**
```javascript
performance_stop_trace();
```

**Step 4: Analyze Insights**
```javascript
performance_analyze_insight();
```

### What Performance Insights Reveal

- **Loading Performance**: Time to First Byte, DOM Content Loaded, Load events
- **Rendering Performance**: Paint times, layout shifts, reflows
- **JavaScript Performance**: Long tasks, script execution time
- **Network Performance**: Resource loading waterfall, blocking resources
- **Core Web Vitals**: LCP, FID, CLS measurements

### Example: Homepage Performance Check

```markdown
1. Start performance trace
2. Navigate to https://triunghi.md/ro/
3. Wait for full page load (3-5 seconds)
4. Stop performance trace
5. Analyze insights:
   - Check LCP < 2.5s
   - Verify no layout shifts (CLS < 0.1)
   - Identify blocking resources
   - Review long tasks (>50ms)
6. Report findings with optimization recommendations
```

### Performance Optimization Triggers

Use performance tracing when:
- Adding new JavaScript features
- Implementing lazy loading
- Optimizing font loading
- Adding third-party scripts
- Investigating user-reported slowness

## Screenshot Organization

```
dev_screens/
├── homepage/
│   ├── desktop-20250115-1440px.png
│   ├── tablet-20250115-768px.png
│   └── mobile-20250115-375px.png
├── categories/
│   ├── local-desktop.png
│   └── local-mobile.png
└── articles/
    └── single-article-responsive.png
```

**Naming Convention**: `{page}-{viewport}-{date}-{width}px.png`

## When to Use This Skill

Trigger this skill for:
- Any HTML template changes
- CSS styling modifications
- Layout/grid adjustments
- Responsive design work
- Navigation updates
- Font/typography changes
- Interactive element additions
- Accessibility improvements
- Performance optimizations affecting UX
- Any visual change requiring verification

**Critical**: Use this skill AFTER every UI/UX change to ensure production deployment succeeded and works correctly.

## Tools Reference

### Chrome DevTools MCP

**Navigation & Page Management**:
- `navigate_page` - Navigate to URL
- `new_page` - Create new browser tab
- `select_page` - Switch between tabs
- `close_page` - Close specific tab
- `list_pages` - View all open tabs

**Inspection & Debugging**:
- `take_snapshot` - Get DOM/accessibility tree
- `take_screenshot` - Capture visual screenshot
- `list_console_messages` - View console logs
- `get_console_message` - Inspect specific log

**Interaction**:
- `click` - Click element
- `hover` - Trigger hover states
- `fill` - Fill form inputs
- `fill_form` - Complete entire forms
- `press_key` - Send keyboard input
- `drag` - Drag elements

**Network & Performance**:
- `list_network_requests` - View HTTP activity
- `get_network_request` - Inspect request details
- `performance_start_trace` - Begin performance recording
- `performance_stop_trace` - End performance recording
- `performance_analyze_insight` - Extract performance insights

**Viewport & Emulation**:
- `resize_page` - Change viewport dimensions
- `emulate` - Simulate devices/conditions

**Advanced**:
- `evaluate_script` - Execute custom JavaScript
- `upload_file` - Handle file uploads
- `handle_dialog` - Manage browser dialogs
- `wait_for` - Wait for conditions

All screenshots save to `dev_screens/` (gitignored).
