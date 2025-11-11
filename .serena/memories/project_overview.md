# Triunghi.md Project Overview

## Purpose
Triunghi.md is a local news service for Ungheni, Moldova, providing bilingual (Romanian/Russian) news coverage with an editorial philosophy of "Oameni + Documente + Date" (triangulated sources).

## Editorial Focus
- **60% local** news (Ungheni-specific)
- **30% national** news (Moldova-wide)
- **10% international** news

## Key Requirement
Every non-local article (categories: `national`, `ue-romania`) MUST include "Cutia Ungheni" - a local impact box explaining relevance to Ungheni residents.

## Tech Stack
- **Hugo 0.127.0** - Static site generator
- **Decap CMS** (formerly Netlify CMS) - Content management with GitHub backend
- **Cloudflare Pages** - Hosting and deployment
- **Cloudflare Workers** - Scheduled builds (every 5 minutes)
- **Pagefind** - Search functionality
- **Go 1.22** - For Hugo modules

## Hugo Binary Location
**CRITICAL**: Hugo is installed at `/home/nalyk/bin/hugo` (version 0.127.0)
- Always use Makefile commands, not direct `hugo` calls
- If calling make directly: `HUGO=/home/nalyk/bin/hugo make <target>`

## Languages
- **Romanian (ro)** - Default language, weight 1
- **Russian (ru)** - Secondary language, weight 2
- Timezone: `Europe/Chisinau` (+02:00 or +03:00 DST)