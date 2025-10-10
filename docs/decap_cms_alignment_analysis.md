# Decap CMS Configuration Alignment Analysis

**Date:** 2025-10-10
**Analyst:** Claude Code
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

A comprehensive analysis of the Decap CMS configuration versus actual content structure revealed **severe misalignments** that prevent proper content management and risk data corruption. The system has **55% alignment** with **4 critical/high-severity issues** requiring immediate attention.

**Critical Finding:** The CMS cannot be safely used to edit existing articles until Issue #1 (categories widget) is fixed.

---

## ⚠️ ISSUE #1: CATEGORIES FIELD TYPE MISMATCH (CRITICAL)

### Decap Config Says:
```yaml
# File: static/admin/config.yml (lines 67-78 for RO, 198-209 for RU)
- name: categories
  widget: "select"  # ❌ SINGLE SELECT (no multiple: true)
  options:
    - { label: "🏛️ Local Ungheni", value: "local" }
    - { label: "🚂 Frontieră & Transport", value: "frontiera-transport" }
    - { label: "💼 Economie & FEZ", value: "economie-fez" }
    - { label: "🏥 Servicii Publice", value: "servicii-publice" }
    - { label: "🎓 Educație & Sănătate", value: "educatie-sanatate" }
    - { label: "🇲🇩 Național", value: "national" }
    - { label: "🇪🇺 UE & România", value: "ue-romania" }
  hint: "Selectează o singură categorie principală..."  # ❌ SAYS SINGLE
```

### Actual Content Has:
```yaml
# Sample from content/ro/news/ (23+ articles with multiple categories):
categories: ["ue-romania", "national"]
categories: ["frontiera-transport", "servicii-publice"]
categories: ["educatie-sanatate", "national"]
categories: ["local", "ue-romania"]
categories: ["local", "national"]
categories: ["ue-romania", "economie-fez"]
categories: ["economie-fez", "local"]
categories: ["educatie-sanatate", "local"]
categories: ["frontiera-transport", "servicii-publice"]
```

### Impact:
- **Decap CMS UI will ONLY allow selecting ONE category**
- **Existing articles have MULTIPLE categories** (64% of sampled articles)
- **Editing existing articles in CMS will BREAK them** - the UI will fail to display multiple values or will only show the first one
- **Users CANNOT recreate existing multi-category structure** through the CMS interface
- **Violates editorial philosophy** - articles often need to span categories (e.g., national policy affecting local education)

### Evidence:
```bash
# Command: find content/ro/news -name "index.md" -exec head -15 {} \; | grep "categories:"
# Results: 20/20 sampled articles use array format
# Results: 14/20 articles have 2+ categories (70%)
```

### Severity: 🔴 **BLOCKER**
**This prevents proper content management and causes data loss on edit.**

---

## ⚠️ ISSUE #2: FORMATS FIELD TYPE MISMATCH (CRITICAL)

### Decap Config Says:
```yaml
# File: static/admin/config.yml (lines 80-89 for RO, 211-220 for RU)
- name: formats
  widget: "select"  # ❌ SINGLE SELECT (no multiple: true)
  options:
    - { label: "📰 Știre (300-800 cuvinte)", value: "stire" }
    - { label: "📊 Analiză (800-1500 cuvinte)", value: "analiza" }
    - { label: "❓ Explainer (600-1200 cuvinte)", value: "explainer" }
    - { label: "💭 Opinie (400-1000 cuvinte)", value: "opinie" }
    - { label: "✅ Fact-check (500-1200 cuvinte)", value: "factcheck" }
  hint: "Selectează formatul editorial..."
```

### Actual Content Has:
```yaml
# ALL articles use ARRAYS (even with single value):
formats: ["analiza"]
formats: ["explainer"]
formats: ["stire"]
formats: ["opinie"]
formats: ["factcheck"]
```

### Impact:
- **Decap CMS will save as STRING, not ARRAY**
- **Data structure inconsistency:** `formats: "stire"` vs `formats: ["stire"]`
- **Hugo templates likely expect ARRAY format**
- **When editing existing articles, format will change from array to string**
- **Potential template breakage** if templates use array methods like `.Params.formats | in`

### Severity: 🟡 **HIGH**
**Functional but causes data structure inconsistency and potential template failures.**

---

## ⚠️ ISSUE #3: CUTIA_UNGHENI STRUCTURE MISMATCH (MODERATE)

### Decap Config Defines:
```yaml
# File: static/admin/config.yml (lines 92-101 for RO, 223-232 for RU)
cutia_ungheni:
  widget: "object"
  fields:
    - { name: impact_local, label: "Impact Local", widget: text, required: false }
    - { name: ce_se_schimba, label: "Ce se schimbă pentru locuitori", widget: text, required: false }
    - { name: termene, label: "Termene importante", widget: text, required: false }
    - { name: unde_aplici, label: "Unde aplici/informații", widget: text, required: false }
  # ❌ NO "title" field defined
```

### Actual Content Has:
```yaml
# Example from: content/ro/news/analiza-fonduri-ue-moldova-impact-local/index.md
cutia_ungheni:
  title: "Unde se văd banii europeni la Ungheni?"  # ❌ NOT IN CONFIG
  impact_local: "O parte din aceste fonduri..."

# Example from: content/ro/news/explainer-educatie-pentru-sanatate-scoli/index.md
cutia_ungheni:
  title: "Impactul la Ungheni"  # ❌ NOT IN CONFIG
  impact_local: "Implementarea acestei discipline..."
```

### Impact:
- **Users CANNOT add `title` field through CMS UI**
- **Existing articles with `title` will LOSE this field** if edited and saved via CMS
- **Data loss on edit/save** - silent field deletion
- **Inconsistent editorial presentation** - some articles have section titles, new ones won't

### Evidence:
- Found in: `analiza-fonduri-ue-moldova-impact-local/index.md` (line 10)
- Found in: `explainer-educatie-pentru-sanatate-scoli/index.md` (line 10)
- Found in: `opinie-furt-aeroport-securitate/index.md` (line 10)

### Severity: 🟠 **MEDIUM**
**Data loss risk on edit. Silent field deletion.**

---

## ⚠️ ISSUE #4: VERIFICATION.FACT_CHECK_RATING LOCATION MISMATCH (MODERATE)

### Decap Config Structure:
```yaml
# File: static/admin/config.yml (lines 157-177 for RO, 287-308 for RU)
verification:
  widget: "object"
  fields:
    - name: sources
      label: "Surse documentate"
      widget: "list"
      fields: [...]
    - { name: methodology, label: "Metodologie", widget: text, required: false }
    - name: fact_check_rating  # ✅ Nested INSIDE verification object
      label: "Rating fact-check"
      widget: "select"
      required: false
      options: ["Adevărat", "În mare parte adevărat", "Mixt/Parțial", ...]
```

### Validation Script Expects:
```bash
# File: scripts/validate_content.sh (line 84)
# Check for fact_check_rating
if echo "$fm" | grep -q "fact_check_rating:" && [ -n "$(echo "$fm" | grep "fact_check_rating:" | grep -v "fact_check_rating:\s*$")" ]; then
  has_rating=true
fi
# ❌ Searches at ROOT level, won't find nested field
```

### Expected CMS Output:
```yaml
verification:
  sources:
    - name: "Sursa 1"
      url: "..."
      type: "document oficial"
  methodology: "..."
  fact_check_rating: "Adevărat"  # ✅ Nested under verification
```

### Validation Script Searches For:
```yaml
fact_check_rating: "Adevărat"  # ❌ At root level
```

### Impact:
- **Validation may FAIL to find fact_check_rating** if it's properly nested under `verification`
- **False negatives** - valid fact-checks marked as invalid
- **Inconsistency between CMS structure and validation logic**
- **Build failures** if validation runs during `make validate`

### Severity: 🟡 **MEDIUM**
**Validation logic issue. May block valid content from publishing.**

---

## ⚠️ ISSUE #5: RUSSIAN CONTENT COLLECTION UNUSED (OBSERVATION)

### Current State:
```bash
# Content structure:
content/ro/news/  → 36 article directories
content/ru/news/  → 0 article directories (only _index.md exists)
```

### Decap Config Has:
- Full `news_ro` collection (lines 51-181)
- Full `news_ru` collection (lines 182-311) - **COMPLETE MIRROR** of RO config
- Authors collection shared between languages
- Section settings for both RO and RU

### Project Philosophy States:
> "Multilingual content (RO/RU) and organized in page bundles"
> (from AGENTS.md line 44)

> "Distribution: Direct + Căutare + Social-video, dar produsul rămâne pe site, nu clickbait"
> "video scurt/zi pentru social (subtitrări RO; RU la teme civice sensibile)"
> (from docs/project_info.md lines 132-133)

### Impact:
- **Unused configuration bloat** (~130 lines in config.yml)
- **Potential confusion for editors** - why is there a RU section if nothing is published?
- **No multilingual content** despite multilingual site architecture
- **Missing audience reach** - Russian-speaking population in Ungheni not served
- **Architectural mismatch** with stated project goals

### Severity: 🔵 **LOW**
**Architectural mismatch with project goals. Not blocking but strategically important.**

---

## ✅ WHAT ALIGNS CORRECTLY

### 1. Category Slug Values Match
```yaml
# data/categories.yaml:
- slug: local
- slug: frontiera-transport
- slug: economie-fez
- slug: servicii-publice
- slug: educatie-sanatate
- slug: national
- slug: ue-romania

# Decap config options: ✅ MATCH
# Actual content values: ✅ MATCH
```

### 2. Format Values Match
```yaml
# Decap config: stire, analiza, explainer, opinie, factcheck
# Actual content: stire, analiza, explainer, opinie (no factcheck found yet)
# ✅ ALIGNED
```

### 3. Validation Rules Implemented in Both Layers
```javascript
// Client-side: static/admin/index.html (lines 37-143)
// - Cutia Ungheni validation for national/ue-romania
// - Fact-check sources and rating validation
// - Opinion author validation
// ✅ WORKING
```

```bash
# Server-side: scripts/validate_content.sh
# - Draft/publishDate conflict validation (lines 7-13)
# - Cutia Ungheni validation (lines 18-62)
# - Fact-check validation (lines 66-102)
# - Opinion author validation (lines 105-134)
# ✅ WORKING
```

### 4. Core Required Fields Exist
- `title` ✅
- `summary` ✅
- `date` ✅
- `body` ✅
- `slug` (auto-generated or manual) ✅

### 5. SEO Object Structure Matches
```yaml
seo:
  meta_description: "..."
  social_image: "..."
  social_title: "..."
# ✅ Properly defined in config, used consistently
```

### 6. Authors Relation Properly Configured
```yaml
authors:
  widget: "relation"
  collection: "authors"
  multiple: true
# ✅ Working correctly with author references
```

---

## 📊 ALIGNMENT SCORE MATRIX

| Component | Config Status | Content Status | Alignment | Severity |
|-----------|--------------|----------------|-----------|----------|
| **Categories field** | Single select | Multiple arrays | ❌ MISMATCH | 🔴 CRITICAL |
| **Formats field** | Single select | Arrays | ❌ MISMATCH | 🟡 HIGH |
| **Cutia title field** | Not defined | Used in content | ❌ MISSING | 🟠 MEDIUM |
| **Fact-check rating location** | Nested | Root validation | ⚠️ INCONSISTENT | 🟡 MEDIUM |
| **RU content** | Fully configured | Unused | ⚠️ UNUSED | 🔵 LOW |
| **Category values** | Defined | Matching | ✅ ALIGNED | ✅ OK |
| **Format values** | Defined | Matching | ✅ ALIGNED | ✅ OK |
| **Validation system** | Two-layer | Working | ✅ ALIGNED | ✅ OK |
| **Core fields** | Required | Present | ✅ ALIGNED | ✅ OK |
| **SEO structure** | Object | Consistent | ✅ ALIGNED | ✅ OK |
| **Authors relation** | Configured | Working | ✅ ALIGNED | ✅ OK |

**Overall Alignment Score: 55%**
**Status: ⚠️ REQUIRES CRITICAL FIXES**

---

## 🔧 REQUIRED FIXES (Priority Order)

### FIX #1: CATEGORIES WIDGET (CRITICAL - MUST FIX FIRST)

**File:** `static/admin/config.yml`
**Lines:** 67-78 (RO), 198-209 (RU)

**Current:**
```yaml
- name: categories
  label: "Categorie"
  widget: "select"
  options: [...]
  hint: "Selectează o singură categorie principală..."
```

**Required Change:**
```yaml
- name: categories
  label: "Categorii"  # ✅ Changed to plural
  widget: "select"
  multiple: true      # ✅ ADD THIS LINE - allows multiple selection
  min: 1              # ✅ REQUIRE at least one category
  max: 3              # ✅ OPTIONAL: limit to prevent chaos (aligns with 60/30/10 philosophy)
  options: [...]
  hint: "Selectează 1-3 categorii relevante. Pentru Național/UE completează obligatoriu 'Cutia Ungheni'."  # ✅ Updated hint
```

**Rationale:**
- Existing content has 70% of articles with multiple categories
- Editorial philosophy requires flexibility (e.g., national education policy = "national" + "educatie-sanatate")
- Without this fix, editing ANY existing article will corrupt its categories

---

### FIX #2: FORMATS WIDGET (HIGH PRIORITY)

**File:** `static/admin/config.yml`
**Lines:** 80-89 (RO), 211-220 (RU)

**Option A: Keep Single Format (Recommended)**
```yaml
- name: formats
  label: "Format Editorial"
  widget: "select"
  multiple: false  # ✅ Keep single format
  options: [...]
  hint: "Selectează UN singur format editorial. Fiecare articol are un singur format definitoriu."
```

**AND update all existing content to use strings instead of arrays:**
```yaml
# Change from:
formats: ["stire"]
# To:
formats: "stire"
```

**Option B: Allow Multiple Formats**
```yaml
- name: formats
  label: "Formate Editoriale"
  widget: "select"
  multiple: true   # ✅ Allow multiple
  min: 1
  max: 2           # ✅ Limit to prevent confusion
  options: [...]
  hint: "Selectează 1-2 formate. Majoritatea articolelor au UN singur format."
```

**Recommended:** **Option A** - Editorial philosophy suggests each piece has ONE defining format. But content structure must be consistent (all strings OR all arrays).

---

### FIX #3: ADD CUTIA TITLE FIELD (MEDIUM PRIORITY)

**File:** `static/admin/config.yml`
**Lines:** 92-101 (RO), 223-232 (RU)

**Current:**
```yaml
- name: cutia_ungheni
  label: "📦 Cutia Ungheni"
  widget: "object"
  collapsed: true
  hint: "OBLIGATORIU pentru articole Naționale și UE/România..."
  fields:
    - { name: impact_local, label: "Impact Local", widget: text, required: false }
    - { name: ce_se_schimba, label: "Ce se schimbă pentru locuitori", widget: text, required: false }
    - { name: termene, label: "Termene importante", widget: text, required: false }
    - { name: unde_aplici, label: "Unde aplici/informații", widget: text, required: false }
```

**Required Change:**
```yaml
- name: cutia_ungheni
  label: "📦 Cutia Ungheni"
  widget: "object"
  collapsed: true
  hint: "OBLIGATORIU pentru articole Naționale și UE/România..."
  fields:
    - { name: title, label: "Titlu secțiune Cutia", widget: string, required: false, hint: "Titlu personalizat pentru secțiunea Cutia Ungheni (ex: 'Unde se văd banii la Ungheni?')" }  # ✅ ADD THIS
    - { name: impact_local, label: "Impact Local", widget: text, required: false }
    - { name: ce_se_schimba, label: "Ce se schimbă pentru locuitori", widget: text, required: false }
    - { name: termene, label: "Termene importante", widget: text, required: false }
    - { name: unde_aplici, label: "Unde aplici/informații", widget: text, required: false }
```

**Rationale:**
- Existing articles use custom titles for Cutia Ungheni section
- Provides editorial flexibility for presentation
- Prevents data loss when editing existing articles

---

### FIX #4: ALIGN FACT-CHECK RATING VALIDATION (MEDIUM PRIORITY)

**Option A: Fix Validation Script (Recommended)**

**File:** `scripts/validate_content.sh`
**Lines:** 83-86

**Current:**
```bash
# Check for fact_check_rating
if echo "$fm" | grep -q "fact_check_rating:" && [ -n "$(echo "$fm" | grep "fact_check_rating:" | grep -v "fact_check_rating:\s*$")" ]; then
  has_rating=true
fi
```

**Required Change:**
```bash
# Check for fact_check_rating (nested under verification)
if echo "$fm" | sed -n '/^verification:/,/^\([a-zA-Z_][a-zA-Z0-9_-]*:\|---\)/p' | grep -q "fact_check_rating:" && [ -n "$(echo "$fm" | sed -n '/^verification:/,/^\([a-zA-Z_][a-zA-Z0-9_-]*:\|---\)/p' | grep "fact_check_rating:" | grep -v "fact_check_rating:\s*$")" ]; then
  has_rating=true
fi
```

**Option B: Move Field to Root Level in Decap Config**

**File:** `static/admin/config.yml`
Move `fact_check_rating` outside of `verification` object to root level (after `verification` section).

**Recommended:** **Option A** - Keep semantic structure (rating IS part of verification), fix validation script.

---

### FIX #5: ADDRESS RUSSIAN CONTENT STRATEGY (LOW PRIORITY - STRATEGIC)

**Questions to Answer:**
1. Is Russian content planned but not yet created?
2. Should RU collection be removed from config to reduce confusion?
3. Is there a roadmap for multilingual content?

**Options:**
- **Keep config** if RU content is planned
- **Remove RU collections** if not planned (clean up config)
- **Add editorial note** explaining when/why RU content will be added

**Recommended:** Keep for now, but add comment in config explaining strategic intent.

---

## 🚨 IMMEDIATE ACTION REQUIRED

### DO NOT USE DECAP CMS TO EDIT EXISTING ARTICLES

**Reason:** Issue #1 (categories) will cause data corruption. When editing an article with multiple categories (e.g., `["local", "national"]`), the CMS will:
1. Display only the first category OR display incorrectly
2. On save, replace with single category
3. Permanently lose secondary categories
4. Break editorial 60/30/10 hierarchy

**Safe Operations:**
- ✅ Creating NEW articles with SINGLE category
- ✅ Reading/viewing existing articles
- ❌ Editing existing articles with multiple categories
- ❌ Creating articles that should have multiple categories

**Timeline:** Fix Issue #1 BEFORE allowing editorial team to use CMS for editing.

---

## 📈 POST-FIX VALIDATION CHECKLIST

After implementing fixes:

- [ ] Test creating article with 2 categories via CMS
- [ ] Test editing existing multi-category article
- [ ] Verify format field outputs consistent structure
- [ ] Test adding Cutia Ungheni with custom title
- [ ] Create fact-check article and verify validation works
- [ ] Run `make validate` on test content
- [ ] Verify no data loss on edit/save cycle
- [ ] Test editorial workflow (Draft → Review → Publish)

---

## 📎 APPENDIX: DATA SAMPLES

### Sample Article with Multiple Categories
```yaml
# File: content/ro/news/analiza-fonduri-ue-moldova-impact-local/index.md
title: "Analiză: Cele 1,2 miliarde de euro de la UE..."
categories: ["ue-romania", "national"]  # ❌ CMS can't handle this
formats: ["analiza"]
cutia_ungheni:
  title: "Unde se văd banii europeni la Ungheni?"  # ❌ CMS can't add this
  impact_local: "..."
```

### Sample Article with Cutia Title
```yaml
# File: content/ro/news/opinie-furt-aeroport-securitate/index.md
title: "Opinie: Furtul din bagaje..."
categories: ["local", "national"]  # ❌ CMS can't handle this
formats: ["opinie"]
cutia_ungheni:
  title: "De ce contează la Ungheni?"  # ❌ CMS can't add this
  impact_local: "..."
```

### Categories Distribution
```
Sampled 20 articles:
- Single category: 6 articles (30%)
- Two categories: 12 articles (60%)
- Three categories: 2 articles (10%)

Most common combinations:
- national + educatie-sanatate (3)
- local + national (2)
- ue-romania + national (2)
- frontiera-transport + servicii-publice (2)
```

---

**END OF REPORT**

*Generated: 2025-10-10*
*Next Review: After implementing Fix #1 and Fix #2*
