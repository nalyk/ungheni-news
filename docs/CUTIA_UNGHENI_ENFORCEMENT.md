# Cutia Ungheni - Multi-Layer Enforcement Architecture

**Last Updated**: November 2, 2025
**Status**: Production-ready with backward compatibility

## Overview

"Cutia Ungheni" (Ungheni Box) is a mandatory editorial component for national and EU-related articles, explaining local impact to Ungheni residents. This document describes the professional, multi-layer enforcement system ensuring editors cannot publish non-compliant content.

## Editorial Policy

**Requirement**: All articles with categories `national` or `ue-romania` MUST include a filled Cutia Ungheni section.

**Rationale**: Triunghi.md serves local readers in Ungheni. National/EU news must answer: "Why does this matter to us?"

## Data Structure

### Current Simplified Structure (v2 - November 2025)

```yaml
cutia_ungheni:
  title: "Optional custom title"  # Optional, defaults to "De ce contează pentru Ungheni"
  content: |                      # Required: Rich markdown content
    - **Impact local**: Explanation of local effects
    - **Ce se schimbă**: What changes for residents
    - **Termene**: Important deadlines

    Supports **bold**, *italic*, [links](url), lists, headings, quotes.
```

**Benefits of v2**:
- Simpler editorial workflow (one field vs four)
- Rich formatting (markdown with toolbar)
- Editor decides content structure (no forced subsections)
- More natural writing flow

### Legacy Structure (v1 - Backward Compatible)

```yaml
cutia_ungheni:
  title: "Optional custom title"
  impact_local: "Text describing local impact"
  ce_se_schimba: "Text describing what changes"
  termene: "Text describing deadlines"
  unde_aplici: "Text describing where to apply"
```

**Backward Compatibility**: All existing articles with v1 structure continue to work. Validation and rendering layers support both formats.

## Enforcement Layers

### Layer 1: Visual Proximity (CMS UI)

**File**: `/static/admin/config.yml`
**Lines**: Cutia Ungheni field immediately follows categories field

**Mechanism**:
- Field placed right after categories selector
- `collapsed: false` - always visible, cannot be hidden
- Prominent label with emoji: `📦 Cutia Ungheni`
- Context hint: "OBLIGATORIU pentru articolele din categoria Național sau UE&România"

**Effect**: Physical proximity makes it impossible to miss. Editors see the requirement as they select triggering categories.

**Code**:
```yaml
- name: cutia_ungheni
  label: "📦 Cutia Ungheni"
  widget: "object"
  collapsed: false  # Critical: cannot be collapsed
  hint: "⚠️ OBLIGATORIU pentru articolele din categoria Național sau UE&România..."
  fields:
    - name: title
      widget: "string"
      required: false
    - name: content
      widget: "markdown"
      required: false
      buttons: ["bold", "italic", "link", "heading-three", "quote",
                "bulleted-list", "numbered-list"]
```

### Layer 2: Real-Time Preview Warnings (CMS)

**File**: `/static/admin/preview.js`
**Lines**: 24-38, 59-66, 135-142

**Mechanism**:
- Custom preview component renders article as editors type
- JavaScript checks: if categories include `national` OR `ue-romania`, validate Cutia presence
- Visual warning box appears in preview if missing

**Effect**: Immediate feedback loop. Editors see red warning box in preview panel while writing.

**Code**:
```javascript
// Check if article requires Cutia
const requiresCutia = categories && (
  categories.includes('national') ||
  categories.includes('ue-romania')
);

// Check if Cutia is filled (v2 or v1 structure)
const cutiaIsFilled = cutiaUngheni && (
  cutiaUngheni.get('content') ||           // v2: single content field
  cutiaUngheni.get('impact_local') ||      // v1: multi-field structure
  cutiaUngheni.get('ce_se_schimba') ||
  cutiaUngheni.get('termene')
);

const showCutiaWarning = requiresCutia && !cutiaIsFilled;

// Render big red warning in preview if missing
showCutiaWarning && h('div', {className: 'validation-warning validation-error'},
  h('div', {className: 'warning-icon'}, '⚠️'),
  h('div', {className: 'warning-content'},
    h('strong', {}, 'CUTIA UNGHENI LIPSEȘTE!'),
    h('p', {}, 'Acest articol are categoria "' + categories.first() +
              '" dar secțiunea "Cutia Ungheni" nu este completată...')
  )
)
```

### Layer 3: Pre-Publish JavaScript Validation (CMS)

**File**: `/static/admin/index.html`
**Lines**: Pre-publish event listener

**Mechanism**:
- Decap CMS `prePublish` event listener fires when editor clicks Publish
- JavaScript validator runs synchronously (blocks publish action)
- If validation fails: alert dialog + exception thrown (publish aborted)

**Effect**: Hard block. Cannot publish non-compliant article through CMS interface.

**Code**:
```javascript
CMS.registerEventListener({
  name: 'prePublish',
  handler: ({ entry }) => {
    const data = entry.get('data').toJS();
    const categories = data.categories || [];
    const cutiaUngheni = data.cutia_ungheni || {};

    // Check if Cutia required
    if (categories.some(cat => ['national', 'ue-romania'].includes(cat))) {
      // Check if any field is filled (v2 or v1)
      const isFilled = cutiaUngheni.content ||
                      cutiaUngheni.impact_local ||
                      cutiaUngheni.ce_se_schimba ||
                      cutiaUngheni.termene;

      if (!isFilled) {
        alert('❌ Cutia Ungheni lipsește pentru articol din categoria Național/UE!');
        throw new Error('Cutia Ungheni validation failed');
      }
    }
  }
});
```

**Limitation**: Only protects CMS workflow. Direct Git commits bypass this layer.

### Layer 4: Build-Time Shell Script Validation

**File**: `/scripts/validate_content.sh`
**Lines**: 15-68

**Mechanism**:
- Bash script runs during `make validate` and `make build`
- Parses YAML front matter of all `content/**/index.*` files
- For each file with `national` or `ue-romania` category:
  - Check for v2 structure: `cutia_ungheni.content` field with non-empty value
  - Check for v1 structure: any of `impact_local`, `ce_se_schimba`, `termene` fields
  - If neither found: add to violations array
- If violations exist: print list and `exit 1` (fails build)

**Effect**: Catches direct Git commits, manual file edits, and any CMS bypass. Build fails = deployment blocked.

**Code**:
```bash
missing_cutia=()
while IFS= read -r -d '' f; do
  # Extract YAML front matter
  fm=$(awk 'BEGIN{fm=0} /^---/{fm++;next} fm==1{print}' "$f")
  [ -z "$fm" ] && continue

  # Check if national or ue-romania category
  if echo "$fm" | grep -q 'categories:' &&
     echo "$fm" | grep -E -i '\b(national|ue-romania)\b'; then

    has_cutia_field=false

    # Check v2: cutia_ungheni.content field
    if echo "$fm" | sed -n '/^cutia_ungheni:/,/^[a-zA-Z]/p' |
       grep -E "^\s*content:" | grep -v -E ":\s*$" | grep -q .; then
      has_cutia_field=true
    fi

    # Check v1: old multi-field structure (backward compatibility)
    if [ "$has_cutia_field" = false ]; then
      if echo "$fm" | sed -n '/^cutia_ungheni:/,/^[a-zA-Z]/p' |
         grep -E "^\s*(impact_local|ce_se_schimba|termene|unde_aplici):" |
         grep -v -E ":\s*$" | grep -q .; then
        has_cutia_field=true
      fi
    fi

    # Add to violations if not found
    if [ "$has_cutia_field" = false ]; then
      missing_cutia+=("$f")
    fi
  fi
done < <(find content -type f -name 'index.*' -print0)

# Fail build if violations found
if [ ${#missing_cutia[@]} -gt 0 ]; then
  echo "❌ Validation failed: Missing Cutia Ungheni:" >&2
  for f in "${missing_cutia[@]}"; do
    echo " - $f" >&2
  done
  exit 1
fi

echo "✅ Cutia Ungheni validation passed."
```

**Integration**: Called by Makefile targets:
- `make validate` - explicit validation check
- `make build` - pre-build validation (blocks deployment)
- `make check` - strict mode (warnings as errors)

### Layer 5: Hugo Build Validation

**File**: Hugo's built-in build process
**Command**: `hugo --panicOnWarning`

**Mechanism**:
- If templates reference undefined fields/methods, Hugo prints warnings
- `--panicOnWarning` flag converts warnings to fatal errors
- Build fails if template logic is broken

**Effect**: Final safety net. Even if content passes validation, broken templates fail deployment.

**Integration**: Used in `make check` and CI/CD pipelines.

## Rendering

### Hugo Partial Template

**File**: `/layouts/partials/cutia-ungheni.html`

**Logic**:
1. Check if `cutia_ungheni` param exists (if not, render nothing)
2. Render title (custom or default: "De ce contează pentru Ungheni")
3. If v2 structure (`.content` field): render as single markdown block
4. If v1 structure (no `.content`): render subsections with labels

**Code**:
```html
{{ with .Params.cutia_ungheni }}
<aside class="cutia-ungheni">
  <!-- Title -->
  {{ if .title }}
    <h2 class="cutia-title">{{ .title }}</h2>
  {{ else }}
    <h2 class="cutia-title">De ce contează pentru Ungheni</h2>
  {{ end }}

  <!-- v2: Single content field -->
  {{ if .content }}
    <div class="cutia-content">
      {{ .content | markdownify }}
    </div>
  {{ else }}
    <!-- v1: Multi-field structure (backward compatibility) -->
    <div class="cutia-content">
      {{ with .impact_local }}
        <div class="cutia-section">
          <h3>Impact Local</h3>
          <p>{{ . | markdownify }}</p>
        </div>
      {{ end }}
      <!-- ... other v1 fields ... -->
    </div>
  {{ end }}
</aside>
{{ end }}
```

**Styling**: Golden gradient box with high visual prominence (defined in site CSS).

### CMS Preview Rendering

**File**: `/static/admin/preview.js`
**Lines**: 113-142

**Logic**: Mirrors Hugo partial logic in JavaScript/React:
- Checks for v2 `.content` field first
- Falls back to v1 multi-field rendering if no `.content`
- Uses `dangerouslySetInnerHTML` for markdown (Decap renders markdown to HTML)

**Benefit**: Editors see accurate preview matching live site rendering.

## Testing Validation

### Manual Testing Checklist

1. **CMS Visual Check**:
   - Log into `/admin/`
   - Create new article, select `national` category
   - Verify Cutia Ungheni field is visible immediately below categories
   - Verify `collapsed: false` works (cannot hide field)

2. **Preview Warning**:
   - Create article with `national` category
   - Leave Cutia Ungheni empty
   - Check preview panel shows red warning box
   - Fill Cutia Ungheni with content
   - Verify warning disappears

3. **Pre-Publish Block**:
   - Create article with `ue-romania` category
   - Leave Cutia empty
   - Click Publish button
   - Verify alert dialog appears
   - Verify publish action is blocked

4. **Build Validation**:
   - Create article with `national` category and empty Cutia (commit directly via Git)
   - Run `make validate`
   - Verify script fails with error message listing file path
   - Add Cutia content
   - Verify script passes

5. **Backward Compatibility**:
   - Find existing article with v1 Cutia structure (e.g., `content/ro/news/analiza-fonduri-ue-moldova-impact-local/index.md`)
   - Run `make build`
   - Verify build succeeds
   - Check rendered HTML shows Cutia with subsection labels

### Automated Testing

**Command**: `make validate && make check && make build`

**Expected Output**:
```
🔍 Starting content validation...
✅ Draft/PublishDate validation passed.
✅ Cutia Ungheni validation passed.
✅ Fact-check validation passed.
✅ Opinion article validation passed.
🎉 All content validations passed!

Start building sites …
Total in 206 ms
```

**Failure Example**:
```
❌ Validation failed: Missing or empty 'cutia_ungheni' for national/ue-romania posts:
 - content/ro/news/some-article/index.md
make: *** [Makefile:21: validate] Error 1
```

## Migration Guide

### Updating Existing Article to v2

**Before (v1)**:
```yaml
cutia_ungheni:
  title: "Impact la nivel local"
  impact_local: "Residents in Ungheni will see..."
  ce_se_schimba: "The municipality will implement..."
  termene: "Deadline: December 31, 2025"
```

**After (v2)**:
```yaml
cutia_ungheni:
  title: "Impact la nivel local"
  content: |
    - **Impact local**: Residents in Ungheni will see...
    - **Ce se schimbă**: The municipality will implement...
    - **Termene**: Deadline: December 31, 2025
```

**Note**: v1 continues to work. Migration is optional.

### Creating New Article with v2

In CMS:
1. Select category `national` or `ue-romania`
2. Scroll to Cutia Ungheni field (visible immediately below categories)
3. Add optional title if needed
4. Use markdown toolbar to write rich content:
   - Bold/italic for emphasis
   - Headings for structure
   - Lists for multiple points
   - Links to relevant resources
5. Preview updates in real-time

## Troubleshooting

### "Validation passed but article published without Cutia"

**Cause**: Article was committed with non-triggering category, then category changed post-build.

**Solution**: Re-run `make validate && make build` after any category changes.

### "CMS preview shows warning but validation script passes"

**Cause**: JavaScript and Bash logic slightly differ in edge cases.

**Solution**: Check field values for whitespace-only content (counted as filled by one layer but not the other).

### "Old article suddenly fails validation"

**Cause**: Category was changed to `national`/`ue-romania` but article predates Cutia requirement.

**Solution**: Add Cutia Ungheni section explaining local relevance. This aligns with editorial policy.

### "Build passes but Hugo template errors on deployment"

**Cause**: Template logic expects field structure that doesn't exist.

**Solution**: Verify `/layouts/partials/cutia-ungheni.html` handles both v1 and v2 structures. Use `{{ with .field }}` patterns for safe field access.

## Technical Debt and Future Improvements

### Current Limitations

1. **CMS bypass**: Direct Git commits can bypass Layers 1-3 (mitigated by Layer 4)
2. **Whitespace edge cases**: Empty strings vs whitespace-only content handling varies by layer
3. **No semantic validation**: System checks presence, not quality of content
4. **Manual testing**: No automated UI tests for CMS preview warnings

### Potential Enhancements

1. **Git hooks**: Add pre-commit hook running `make validate` to catch violations before push
2. **CI/CD integration**: GitHub Actions workflow blocking merges if validation fails
3. **Content quality scoring**: NLP analysis checking if Cutia actually explains local impact
4. **Automated screenshot tests**: Playwright tests capturing preview warnings
5. **Analytics**: Track Cutia completion rate, average length, editor compliance

### Migration Path to v2-Only

If decision made to deprecate v1 structure:
1. Create migration script converting all v1 articles to v2
2. Update validation script to reject v1 format
3. Update preview.js to render only v2
4. Update Hugo partial to remove v1 fallback
5. Document breaking change in release notes

**Recommendation**: Keep backward compatibility for at least 1 year post-v2 launch.

## Maintenance Checklist

When modifying Cutia Ungheni enforcement:

- [ ] Update all 5 enforcement layers consistently
- [ ] Test both v1 and v2 structure backward compatibility
- [ ] Verify CMS preview matches Hugo rendered output
- [ ] Run `make validate && make check && make build` on test content
- [ ] Update this documentation with changes
- [ ] Test with real editor workflow (CMS UI, not just CLI)

## Related Documentation

- **CLAUDE.md**: Project overview and critical technical patterns
- **CMS_WORKFLOW_AND_VALIDATION_ANALYSIS.md**: General CMS validation strategy
- **IMPLEMENTATION_SUMMARY.md**: Recent implementation changes
- **scripts/validate_content.sh**: Full validation script source code
- **static/admin/config.yml**: Complete CMS configuration

## Changelog

### November 2, 2025 - v2 Structure Launch
- Simplified from 4 fields to title + single content field
- Added rich markdown support (formatting, links, lists, headings, quotes)
- Maintained full backward compatibility with v1 structure
- Updated all 5 enforcement layers
- Tested production build and validation

### October 2025 - v1 Structure
- Initial implementation with 4 separate text fields
- Basic validation at build time
- CMS pre-publish validation added
- Preview warnings implemented

---

**Maintained by**: Claude Code (AI Assistant)
**Review frequency**: On each Cutia Ungheni modification
**Status**: Living document
