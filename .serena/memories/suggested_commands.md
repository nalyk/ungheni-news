# Suggested Commands for Triunghi.md Development

## Primary Development Commands (via Makefile)

### Development Server
```bash
make dev
```
- Starts Hugo development server with drafts enabled
- Live reload on file changes
- Access at http://localhost:1313

### Production Build
```bash
make build
```
- Runs `make validate` first (content validation)
- Builds with `HUGO_ENV=production`
- Enables garbage collection (`--gc`) and minification (`--minify`)
- Output to `public/` directory

### Search Index Generation
```bash
make pagefind
```
- **REQUIRED after every build**
- Generates Pagefind search index from `public/` directory
- Uses npm cache at `.cache/npm` to speed up execution
- Excludes nav, header, footer, sidebar from indexing

### Build Validation
```bash
make check
```
- Strict build mode
- Prints i18n warnings
- Fails on any warnings (`--panicOnWarning`)
- Use before production builds to catch issues early

### Content Validation
```bash
make validate
```
- Validates content files against editorial rules:
  - No `draft:true` with `publishDate` set simultaneously
  - `national` and `ue-romania` articles must have `cutia_ungheni` field
  - Fact-check articles must have sources and rating
  - Opinion articles must have at least one author
- Runs automatically as part of `make build`

## Complete Build Workflow
```bash
make validate && make check && make build && make pagefind
```
- Validates content
- Checks for warnings
- Builds production site
- Generates search index

## System Commands

### Git Operations
```bash
git status
git add <files>
git commit -m "feat: description"
git push
```
- Push to `main` triggers Cloudflare Pages deployment
- **IMPORTANT**: Always ask user for approval before committing/pushing

### Directory Operations
```bash
ls -la                    # List files with details
find <path> -name <pattern>  # Find files
grep -r <pattern> <path>  # Search in files
cd <directory>            # Change directory
```

### Hugo-Specific Commands (when needed)
```bash
# Create new content (use Makefile or direct Hugo)
HUGO=/home/nalyk/bin/hugo hugo new content/ro/news/article-slug/index.md

# Check Hugo version
HUGO=/home/nalyk/bin/hugo hugo version
```

## Development Workflow

### Complete Task Checklist
1. Make code/content changes
2. Run `make validate` - Check content rules
3. Run `make check` - Catch build warnings
4. Run `make build` - Production build
5. Run `make pagefind` - Generate search index
6. Review changes with code-reviewer subagent (MANDATORY for code changes)
7. Test locally if needed
8. Commit and push (with user approval)
9. Verify deployment after 2-3 minutes using ui-ux-verifier skill

### Quick Local Test
```bash
make dev
# Visit http://localhost:1313
# Make changes and see live reload
```

### Production-Ready Build
```bash
make build && make pagefind
# Ready to commit and push
```