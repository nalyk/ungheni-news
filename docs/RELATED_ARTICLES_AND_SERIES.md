# Related Articles & Series: Quick Editor Guide

**For**: Journalists and editors at Triunghi.md
**Purpose**: Help readers discover connected content and navigate multi-part investigations

---

## Related Articles

### What It Does
Shows 3-5 similar articles at the end of every story to keep readers engaged.

### How It Works
**Hybrid system**:
1. **Manual** (you pick) = Better quality, more relevant
2. **Automatic** (system picks) = Fills in gaps if you don't manually select enough

### When to Use Manual Selection
✅ **USE for**:
- Important investigative pieces
- Multi-part series (link between parts)
- Follow-up stories ("What happened since...")
- Complex topics that need context

❌ **SKIP for**:
- Simple daily news (auto works fine)
- One-off stories with no obvious connections

### How to Add Related Articles (CMS)

1. **Open article** in Decap CMS
2. **Scroll to** "🔗 Articole similare recomandate" / "🔗 Рекомендуемые похожие материалы"
3. **Click "Add"** and search by title/summary
4. **Select 3-5 articles** (system will auto-fill if you pick fewer)
5. **Save draft** → test → publish

**Tips**:
- Pick articles readers actually need (don't just fill slots)
- Mix old and new (context + latest updates)
- Language-specific (RO articles only show RO related, RU only RU)

---

## Series (Multi-Part Investigations)

### What It Does
Groups related articles into a numbered series with navigation between parts.

**Reader experience**:
- See "Part 2 of 5" at the top of article
- Click prev/next buttons to navigate
- Dropdown shows all parts
- Series landing page with progress tracking

### Three-Step Process

#### STEP 1: Create the Series (once)
1. **Go to**: CMS → "📚 Serii Investigative / Серии Расследования"
2. **Click**: "Gestionare Serii / Управление Сериями"
3. **Add new series** with:
   - **Slug**: `dosarul-fez-ungheni` (unique ID, lowercase, hyphens only)
   - **Status**: 🟢 În desfășurare (ongoing) / ✅ Finalizată (completed) / ⏸️ În pauză (paused)
   - **Featured**: Check if you want it on homepage
   - **Expected parts**: Total articles planned (e.g., 5)
   - **Romanian metadata**: Title, description, lead, cover image
   - **Russian metadata**: Same but translated

4. **Save** → series now exists, URL: `/ro/series/dosarul-fez-ungheni/`

#### STEP 2: Tag Each Article
For **every article** in the series:

1. **Open article** in CMS
2. **Scroll to** "📚 Parte dintr-o Serie" / "📚 Часть Серии"
3. **Fill in**:
   - **Slug Serie**: Type the series slug exactly (e.g., `dosarul-fez-ungheni`)
   - **Număr Parte**: 1, 2, 3, etc. (determines order)
   - **Total Părți**: Optional, shows "Part 2 of 5" (if empty, just "Part 2")
   - **Subtitlu Parte**: Optional, descriptive subtitle like "Promisiunile inițiale"
   - **Data Următoarei Părți**: Optional, for ongoing series ("Next part: May 15")

4. **Save** → article now part of series

#### STEP 3: Publish & Check

1. **Publish articles** in order (Part 1, then Part 2, etc.)
2. **Check series page**: Go to `/ro/series/dosarul-fez-ungheni/`
   - Should show all published parts
   - Progress bar updates automatically
3. **Check article navigation**: Open any part
   - See series widget at top
   - Prev/Next buttons work
   - Dropdown shows all parts

---

## Example Workflows

### Workflow 1: Five-Part Investigation
**Scenario**: Investigating FEZ Ungheni promises vs. reality

**Day 1**: Create series in CMS
- Slug: `dosarul-fez-ungheni`
- Status: Ongoing
- Expected parts: 5
- RO title: "Dosarul FEZ Ungheni: Promisiuni și Realitate"
- RU title: "Дело СЭЗ Унгены: Обещания и реальность"

**Day 2**: Publish Part 1
- Article: "Inaugurarea cu fast: Ce s-a promis în 2019"
- Series: `dosarul-fez-ungheni`
- Part: 1
- Total: 5
- Subtitle: "Promisiunile inițiale"
- Next date: May 10 (when Part 2 publishes)

**Day 7**: Publish Part 2
- Article: "Bilanțul după 3 ani: Cât s-a investit"
- Series: `dosarul-fez-ungheni`
- Part: 2
- Total: 5
- Next date: May 17
- **Related articles**: Manually link to Part 1

**Repeat** for Parts 3-5

**Final day**: Mark series complete
- Update series status → Completed
- Remove "next date" from final article

### Workflow 2: Two Follow-Up Stories
**Scenario**: Reported water outage, then resolution

**Article 1**: "Cartierul Cutia fără apă de 3 zile" (published Wed)
- Normal article, no series needed

**Article 2**: "Apă restabilită: Primăria explică cauza" (published Fri)
- Add to **Related Articles**: Link Article 1
- No series (only 2 parts, doesn't need full series treatment)

### Workflow 3: Ongoing Series (No End Date)
**Scenario**: Monthly "Bugetul Ungheni Explicat" series

**Create series**:
- Slug: `bugetul-ungheni`
- Status: Ongoing
- Expected parts: (leave empty, no specific count)
- Featured: Yes (show on homepage)

**Each month**: Publish new part
- January: Part 1, "Ianuarie 2025: Unde se duc banii"
- February: Part 2, "Februarie 2025: Proiectele mari"
- March: Part 3, "Martie 2025: Eficiența cheltuielilor"
- (continue indefinitely)

---

## Common Questions

**Q: Do I need a series for 2 articles?**
A: No. Use Related Articles to link them. Series is for 3+ parts.

**Q: Can one article be in multiple series?**
A: Technically yes (system supports it), but **don't**. Confuses readers.

**Q: What if I don't know total parts yet?**
A: Leave "Total Părți" empty. Shows "Part 2" instead of "Part 2 of 5".

**Q: Can I change series order after publishing?**
A: Yes. Edit article, change "Număr Parte", republish. Order updates automatically.

**Q: What if I forget to fill series slug correctly?**
A: Navigation won't appear. Double-check slug matches exactly (case-sensitive, no spaces).

**Q: Should every article have related articles?**
A: No need to force it. Auto-recommendations work well for most stories. Manual only when you know better connections.

**Q: Can I link RO article to RU article in related?**
A: No. System prevents cross-language links. Each language has own related articles.

**Q: Series landing page looks empty?**
A: Check that articles have the exact series slug in their front matter. Run build to regenerate pages.

---

## Technical Notes (for developers)

### Related Articles Logic
```
IF article has manual related_articles:
  → Show those first
ELSE:
  → Use Hugo .Related algorithm (tags 80%, categories 50%, date 10%)

ALWAYS: Fill to minimum 3 articles
ALWAYS: Filter by language (.Lang)
ALWAYS: Deduplicate
```

### Series URL Structure
- Series list: `/ro/series/` (all series)
- Series page: `/ro/series/dosarul-fez-ungheni/` (one series)
- Article in series: `/ro/news/inaugurarea-fez/` (with series navigation widget)

### Series Data Location
- Metadata: `data/series.yaml`
- Templates: `layouts/series/term.html`, `layouts/partials/series-navigation.html`
- Taxonomy config: `config/_default/config.toml` → `[taxonomies] series = "series"`

### Debugging
```bash
# Check if series exists in data
cat data/series.yaml

# Rebuild site
make build

# Check series page
open http://localhost:1313/ro/series/your-series-slug/

# Verify article front matter
cat content/ro/news/article-slug/index.md | grep -A5 "series:"
```

---

## Quick Reference Card

### Related Articles
| Field | Required | What |
|-------|----------|------|
| `related_articles` | No | List of article slugs (max 5) |

### Series
| Field | Required | What | Example |
|-------|----------|------|---------|
| `series` | No | Series slug | `["dosarul-fez"]` |
| `series_part` | If series | Part number | `2` |
| `series_total` | No | Total parts | `5` |
| `series_subtitle` | No | Descriptive subtitle | `"Promisiunile inițiale"` |
| `series_next_date` | No | Next part date | `2025-05-15` |

### Series Data (in CMS)
| Field | Required | What |
|-------|----------|------|
| `slug` | Yes | Unique ID |
| `status` | Yes | ongoing / completed / paused |
| `featured` | No | Show on homepage |
| `expected_parts` | No | Total planned parts |
| `ro.title` | Yes | Romanian title |
| `ro.description` | No | Romanian description |
| `ru.title` | Yes | Russian title |
| `ru.description` | No | Russian description |

---

**Questions?** Ask in editorial Slack or check `/docs/` folder for more guides.

**Last updated**: 2025-11-02
