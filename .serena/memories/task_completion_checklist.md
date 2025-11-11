# Task Completion Checklist for Triunghi.md

## When a Task is Completed

Follow these steps in order before considering a task complete:

### 1. Content Validation
```bash
make validate
```
- Checks draft/publishDate conflicts
- Validates Cutia Ungheni for national/ue-romania articles
- Ensures fact-checks have sources + rating
- Ensures opinions have authors

**If validation fails**: Fix the issues before proceeding.

### 2. Build Check (Strict Mode)
```bash
make check
```
- Runs Hugo with `--panicOnWarning`
- Catches template errors, i18n warnings
- Fails fast on any build issues

**If check fails**: Review error messages, fix template/config issues.

### 3. Production Build
```bash
make build
```
- Includes validation (step 1)
- Builds with production environment
- Applies garbage collection and minification
- Outputs to `public/` directory

**If build fails**: Check Hugo error messages, fix and retry.

### 4. Search Index Generation (REQUIRED)
```bash
make pagefind
```
- **CRITICAL**: Always run after successful build
- Generates search index from `public/` directory
- Site search will not work without this step

### 5. Code Quality Review (MANDATORY for code changes)
If you modified any code (templates, JS, CSS, config):
- **MUST** use code-reviewer subagent to validate changes
- Reviews for quality, security, maintainability
- Checks Hugo-specific patterns (multilingual taxonomy, pagination)
- Verifies Decap CMS patterns (OAuth, collection config)

**Command**: Launch code-reviewer subagent via Task tool

### 6. Visual Verification (for UI changes)
If you modified layouts, styles, or visual elements:
- Deploy to Cloudflare Pages (push to main)
- Wait 2-3 minutes for deployment
- Use ui-ux-verifier skill + chrome-devtools MCP:
  - Navigate to affected pages
  - Take screenshots at multiple viewport sizes (375px, 768px, 1440px)
  - Check network requests for 404s
  - Check console for JavaScript errors
  - Verify responsive behavior

### 7. Git Operations (User Approval Required)
**NEVER commit or push without explicit user approval.**

Ask the user:
> "Can I commit and push these changes?"

Wait for confirmation, then:

```bash
# Stage changes
git add <relevant-files>

# Commit with proper format
git commit -m "$(cat <<'EOF'
<type>: <subject>

<optional body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to main (triggers deployment)
git push
```

### 8. Post-Deployment Verification
After pushing to `main`:
- Cloudflare Pages builds automatically
- Wait 2-3 minutes for build to complete
- Verify changes on production site (https://triunghi.md)
- Use chrome-devtools MCP if systematic verification needed

## Quick Reference: Complete Workflow

```bash
# For content changes
make validate && make build && make pagefind

# For code changes
make validate && make check && make build && make pagefind
# THEN: code-reviewer subagent (MANDATORY)

# For UI/template changes
make validate && make check && make build && make pagefind
# THEN: code-reviewer subagent (MANDATORY)
# THEN: ui-designer subagent (optional polish)
# THEN: Deploy and use ui-ux-verifier skill
```

## Error Handling

### Build Fails
1. Read error message carefully
2. Check affected template/config file
3. Refer to hugo-expert skill for Hugo-specific patterns
4. Fix issue and re-run build

### Validation Fails
1. Read which rule was violated
2. Open affected content file
3. Add missing fields (e.g., Cutia Ungheni)
4. Re-run validation

### OAuth Issues (Decap CMS)
1. Check `functions/api/auth.js`
2. Refer to decap-cms-expert skill for two-step handshake pattern
3. Verify postMessage format (string, not object)
4. Test in `/admin/` interface

## Special Cases

### Adding New Articles
1. Create page bundle: `content/{lang}/news/{slug}/index.md`
2. Write content with all required front matter
3. Add images to same directory if needed
4. Run full workflow (validate → check → build → pagefind)

### Modifying Templates
1. Read current template file
2. Make targeted edits (prefer Edit tool over Write)
3. Test with `make check` first
4. Run full workflow
5. MANDATORY: code-reviewer subagent

### Updating CMS Config
1. Edit `static/admin/config.yml`
2. Test in local `/admin/` interface
3. Verify collection structure matches content
4. Run full workflow
5. MANDATORY: code-reviewer subagent

## Final Checklist (Before Considering Task Done)

- [ ] Content validated (`make validate` passes)
- [ ] Build check passes (`make check` passes)
- [ ] Production build succeeds (`make build` passes)
- [ ] Search index generated (`make pagefind` succeeds)
- [ ] Code reviewed by code-reviewer subagent (if code changed)
- [ ] User approved commit/push
- [ ] Changes committed with proper format
- [ ] Changes pushed to main
- [ ] Deployment verified (if critical changes)