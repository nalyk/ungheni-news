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
- **Cloudflare Functions** - Serverless API endpoints (OAuth, Newsletter)
- **Cloudflare Workers** - Scheduled builds (every 5 minutes)
- **Pagefind** - Static search index generation
- **Buttondown** - Email newsletter service (Prut Brief)
- **Go 1.22** - For Hugo modules

## Key Features
- **Multilingual**: Romanian (primary) + Russian, with language-specific content isolation
- **Newsletter**: Prut Brief daily digest via Buttondown email service
- **Search**: Pagefind static search (generated post-build)
- **Dashboard**: Editorial analytics for 60/30/10 compliance, Cutia Ungheni tracking
- **Multimedia Embeds**: 13 platforms supported (YouTube, TikTok, Instagram, etc.)
- **Series System**: Multi-part investigative stories with navigation
- **Scheduled Publishing**: Automatic publication via Cloudflare Workers (5-min interval)
- **Validation**: Multi-layer content validation (CMS + build-time scripts)

## Hugo Binary Location
**CRITICAL**: Hugo is installed at `/home/nalyk/bin/hugo` (version 0.127.0)
- Always use Makefile commands, not direct `hugo` calls
- If calling make directly: `HUGO=/home/nalyk/bin/hugo make <target>`

## Languages
- **Romanian (ro)** - Default language, weight 1
- **Russian (ru)** - Secondary language, weight 2
- Timezone: `Europe/Chisinau` (+02:00 or +03:00 DST)