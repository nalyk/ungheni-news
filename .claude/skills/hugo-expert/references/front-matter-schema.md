# Front Matter Schema for Triunghi.md

Complete front matter reference for news articles in the Triunghi.md Hugo site.

## Standard News Article

```yaml
---
title: "Article Title in Current Language"
summary: "Brief 1-2 sentence summary for cards and SEO"
date: 2025-01-15T10:00:00+02:00           # Creation date
publishDate: 2025-01-15T10:00:00+02:00   # Publication date (for scheduling)
draft: false                              # true for unpublished content
categories:                               # REQUIRED - at least one
  - "local"                               # Primary category
formats:                                  # REQUIRED - exactly one
  - "stire"                               # Format type
authors:                                  # REQUIRED - at least one
  - "author-slug"
tags:                                     # Optional
  - "tag1"
  - "tag2"
featured: false                           # Homepage feature flag
---
```

## Categories (Primary Taxonomy)

### Local Categories
- `local` - Local Ungheni news (60% of content)
- `frontiera-transport` - Border & transport
- `economie-fez` - Economy & FEZ
- `servicii-publice` - Public services
- `educatie-sanatate` - Education & health

### Non-Local Categories (Require Cutia Ungheni)
- `national` - National news with local impact
- `ue-romania` - EU & Romania news with local impact

## Formats (Content Type)

- `stire` - News/breaking news
- `analiza` - Analysis piece
- `explainer` - Explainer (3-step: What/Why/What's Next)
- `opinie` - Opinion (requires author attribution)
- `factcheck` - Fact-check (requires sources and rating)

## Cutia Ungheni (Required for National/UE content)

For articles in `national` or `ue-romania` categories:

```yaml
---
title: "National Policy Change"
categories:
  - "national"
formats:
  - "explainer"
cutia_ungheni:
  impact_local: "Detailed description of how this affects Ungheni residents"
  ce_se_schimba: "Concrete changes: prices, services, requirements"
  termene: "Deadlines, application process, where to apply in Ungheni"
---
```

### Cutia Ungheni Fields

- **impact_local**: Local impact description (2-3 sentences)
- **ce_se_schimba**: What changes concretely (bullet points or paragraph)
- **termene**: Deadlines and practical application info

**Validation**: Articles in `national` or `ue-romania` **MUST** have complete `cutia_ungheni` data. Builds will fail without it.

## Fact-Check Articles

```yaml
---
title: "Fact-Check: Claim About Local Issue"
formats:
  - "factcheck"
factcheck:
  sources:
    - "Source 1: Government document link"
    - "Source 2: Expert interview"
    - "Source 3: Statistical data"
  rating: "fals"  # Options: adevarat, fals, partial, neprovetit
---
```

### Fact-Check Ratings
- `adevarat` - True
- `fals` - False
- `partial` - Partially true
- `neprovetit` - Unverified

## Opinion Articles

```yaml
---
title: "Opinion: Local Development Strategy"
formats:
  - "opinie"
authors:
  - "author-slug"  # REQUIRED for opinion pieces
opinion_disclaimer: true  # Auto-adds disclaimer
---
```

## Dates & Scheduling

### Date Fields
```yaml
date: 2025-01-15T10:00:00+02:00          # Creation timestamp
publishDate: 2025-01-15T14:00:00+02:00   # When to publish
```

### Timezone
Always use Europe/Chisinau timezone (`+02:00` or `+03:00` depending on DST).

### Scheduling Future Content
```yaml
draft: false
publishDate: 2025-01-20T09:00:00+02:00   # Will publish on Jan 20 at 9 AM
```

### Draft vs PublishDate Conflicts
**Invalid** (caught by validation):
```yaml
draft: true
publishDate: 2025-01-15T10:00:00+02:00   # CONFLICT: can't be draft with publish date
```

**Valid**:
```yaml
# Unpublished (no publish date set)
draft: true

# Scheduled for future
draft: false
publishDate: 2025-01-20T09:00:00+02:00

# Published immediately
draft: false
publishDate: 2025-01-15T10:00:00+02:00  # Past date
```

## Media & Resources

### Featured Image (Page Bundle)
```
content/ro/news/article-slug/
├── index.md
└── featured.jpg          # Auto-detected as featured image
```

### Cloudinary Image
```yaml
featured_image: "https://res.cloudinary.com/account/image/upload/v123/image.jpg"
```

### Image Alt Text
```yaml
featured_image_alt: "Description of featured image for accessibility"
```

## SEO & Social

```yaml
---
title: "Article Title"
summary: "SEO-friendly summary (150-160 chars)"
description: "Optional: Override summary for meta description"
keywords:
  - "keyword1"
  - "keyword2"
social_image: "https://cloudinary.url/social-card.jpg"  # Override featured image for social
---
```

## Multilingual Linking

Hugo automatically links translations by matching file structure:

```
content/
├── ro/news/article-slug/index.md
└── ru/news/article-slug/index.md
```

No front matter needed - Hugo links by path convention.

## Homepage Rails

Control homepage placement:

```yaml
featured: true           # Appears in featured section
rail: "service"          # Appears in service rail (alerts, interruptions)
rail_priority: 1         # Higher = appears first in rail
```

### Rail Types
- `service` - Service alerts (interruptions, schedules)
- `breaking` - Breaking news
- `featured` - Featured content (default when `featured: true`)

## Author Attribution

```yaml
authors:
  - "ion-popescu"         # Slug matching data/authors/ion-popescu.yaml
  - "maria-ionescu"
```

Author data stored in `data/authors/`:

```yaml
# data/authors/ion-popescu.yaml
name: "Ion Popescu"
title: "Reporter"
bio: "Bio text"
email: "ion@triunghi.md"
social:
  facebook: "ionpopescu"
  twitter: "ionpopescu"
```

## Complete Example

```yaml
---
title: "Primăria Ungheni Anunță Modernizare Stradă Ștefan cel Mare"
summary: "Consiliul local a aprobat proiectul de modernizare a străzii centrale, lucrările vor începe în martie 2025"
date: 2025-01-15T10:30:00+02:00
publishDate: 2025-01-15T14:00:00+02:00
draft: false

categories:
  - "local"

formats:
  - "stire"

authors:
  - "ion-popescu"

tags:
  - "infrastructura"
  - "consiliu-local"
  - "stefan-cel-mare"

featured: true
featured_image_alt: "Strada Ștefan cel Mare înainte de modernizare"

social_image: "https://res.cloudinary.com/triunghi/image/upload/v1/stefan-social.jpg"
---

Content starts here...
```

## Validation Rules

Content validation runs during build (`make validate`):

1. ✅ All articles have required fields: `title`, `categories`, `formats`, `authors`
2. ✅ National/UE articles have complete `cutia_ungheni`
3. ✅ Fact-check articles have `sources` and `rating`
4. ✅ Opinion articles have `authors`
5. ✅ No `draft: true` with future `publishDate`
6. ✅ Dates use correct timezone format

Validation failures block builds to prevent publishing incomplete content.
