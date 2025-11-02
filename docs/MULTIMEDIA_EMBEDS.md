# Multimedia Embeds - Complete Guide

**Last Updated**: November 2, 2025
**Status**: Production-ready

## Overview

Triunghi.md supports professional multimedia embeds from 12+ platforms with responsive design, privacy-friendly loading, and optimal performance. All embeds are implemented as Hugo shortcodes that editors can use directly in markdown articles.

## Supported Platforms

### Video Platforms
- **YouTube** - Privacy-enhanced (youtube-nocookie.com), lazy loading
- **TikTok** - Vertical video, centered, responsive
- **Vimeo** - Professional video hosting
- **Facebook Video** - Social video embeds

### Social Media
- **Instagram** - Posts, Reels, Stories
- **Twitter/X** - Tweet embeds
- **Facebook Posts** - Public post embeds
- **Telegram** - Channel/group posts

### Audio
- **Spotify** - Podcasts, music tracks, albums, playlists
- **SoundCloud** - Audio tracks and playlists

### Data Visualization
- **Datawrapper** - Interactive charts and maps
- **Flourish** - Data visualizations and stories

### Maps
- **Google Maps** - Location embeds

### Fallback
- **Generic Embed** - For any platform not covered above

---

## Usage Guide

### YouTube

**Shortcode**: `youtube`

**Syntax**:
```
{{< youtube "VIDEO_ID" >}}
```

**Example**:
```
{{< youtube "dQw4w9WgXcQ" >}}
```

**How to get Video ID**:
- From URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID is: `dQw4w9WgXcQ`

**Features**:
- Privacy-friendly (uses `youtube-nocookie.com`)
- Lazy loading for performance
- 16:9 responsive
- No related videos from other channels (`rel=0`)
- Minimal branding (`modestbranding=1`)

---

### TikTok

**Shortcode**: `tiktok`

**Syntax**:
```
{{< tiktok "VIDEO_ID" >}}
```

**Example**:
```
{{< tiktok "7234567890123456789" >}}
```

**How to get Video ID**:
- From URL: `https://www.tiktok.com/@username/video/7234567890123456789`
- Video ID is: `7234567890123456789`

**Features**:
- Vertical format (9:16 aspect ratio)
- Centered on page
- Responsive from 325px to 605px width
- Native TikTok player with controls

---

### Instagram

**Shortcode**: `instagram`

**Syntax**:
```
{{< instagram "POST_CODE" >}}
```

**Example**:
```
{{< instagram "C1234567890" >}}
```

**How to get Post Code**:
- From URL: `https://www.instagram.com/p/C1234567890/`
- Post code is: `C1234567890`
- Works for: Posts, Reels, Carousels

**Features**:
- Native Instagram embed
- Preserves original formatting
- Shows caption, likes, comments
- Responsive 326px-540px

---

### Facebook

**Shortcode**: `facebook`

**Syntax**:
```
{{< facebook "FULL_POST_URL" "TYPE" >}}
```

**Content Types**:
- `post` (default) - Regular posts, photos, text, mixed content
- `video` - Horizontal video (traditional landscape format)
- `video-vertical` - Vertical video (Reels, Stories-style format)

**Examples**:
```
{{< facebook "https://www.facebook.com/username/posts/123456789" >}}
{{< facebook "https://www.facebook.com/username/posts/123456789" "post" >}}
{{< facebook "https://www.facebook.com/username/videos/987654321" "video" >}}
{{< facebook "https://www.facebook.com/username/videos/456789123" "video-vertical" >}}
```

**How to get Post/Video URL**:
- Click on post/video timestamp
- Copy full URL from browser
- For videos: check if it's horizontal (landscape) or vertical (portrait/Reels)

**Features**:
- **Smart responsive design**: Adapts container to content type
- **Horizontal videos**: 16:9 responsive (like YouTube)
- **Vertical videos**: 9:16 responsive (like TikTok/Reels)
- **Posts**: Native height with text, photos, engagement
- Respects privacy settings

**Important**:
- Only works with PUBLIC posts/videos!
- For best results, specify type (`video` or `video-vertical`) when embedding videos
- If type not specified, defaults to `post` format

---

### Twitter/X

**Shortcode**: `twitter`

**Syntax**:
```
{{< twitter "USERNAME" "TWEET_ID" >}}
```

**Example**:
```
{{< twitter "elonmusk" "1234567890123456789" >}}
```

**How to get Tweet ID**:
- From URL: `https://twitter.com/elonmusk/status/1234567890123456789`
- Username: `elonmusk`
- Tweet ID: `1234567890123456789`

**Features**:
- Native Twitter card
- Shows full thread context
- Preserves media (photos, videos, GIFs)
- Do Not Track mode enabled (`data-dnt="true"`)

---

### Telegram

**Shortcode**: `telegram`

**Syntax**:
```
{{< telegram "CHANNEL_NAME" "MESSAGE_ID" >}}
```

**Example**:
```
{{< telegram "durov" "123" >}}
```

**How to get Message ID**:
- From URL: `https://t.me/durov/123`
- Channel: `durov`
- Message ID: `123`

**Features**:
- Native Telegram widget
- Shows full message with media
- Responsive width
- Works for channels and public groups

**Important**: Only works with PUBLIC channels!

---

### Spotify

**Shortcode**: `spotify`

**Syntax**:
```
{{< spotify "TYPE" "ID" >}}
```

**Types**: `track`, `album`, `playlist`, `episode`, `show`

**Examples**:
```
{{< spotify "track" "3n3Ppam7vgaVa1iaRUc9Lp" >}}
{{< spotify "episode" "7makk4oTQel546B0PZlDM5" >}}
{{< spotify "show" "4rOoJ6Egrf8K2IrywzwOMk" >}}
```

**How to get Spotify URI**:
- From URL: `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp`
- Type: `track`
- ID: `3n3Ppam7vgaVa1iaRUc9Lp`

**Features**:
- Native Spotify player
- Adaptive height (152px for tracks/episodes, 352px for albums/playlists)
- Rounded corners (brand-compliant)
- Full playback controls

---

### SoundCloud

**Shortcode**: `soundcloud`

**Syntax**:
```
{{< soundcloud "TRACK_URL" >}}
```

**Example**:
```
{{< soundcloud "https://soundcloud.com/artist-name/track-name" >}}
```

**Features**:
- Native SoundCloud player
- Waveform visualization
- Comments timeline
- Fixed height 166px

---

### Vimeo

**Shortcode**: `vimeo`

**Syntax**:
```
{{< vimeo "VIDEO_ID" >}}
```

**Example**:
```
{{< vimeo "123456789" >}}
```

**How to get Video ID**:
- From URL: `https://vimeo.com/123456789`
- Video ID is: `123456789`

**Features**:
- Privacy-friendly (`dnt=1` - Do Not Track)
- 16:9 responsive
- High-quality player
- Professional controls

---

### Datawrapper

**Shortcode**: `datawrapper`

**Syntax**:
```
{{< datawrapper "CHART_ID" "HEIGHT" >}}
```

**Example**:
```
{{< datawrapper "abc123" "600" >}}
```

**How to get Chart ID**:
- From Datawrapper publish panel
- URL format: `https://datawrapper.dwcdn.net/abc123/`
- Chart ID is: `abc123`

**Features**:
- Fully interactive charts
- Auto-responsive height (script-controlled)
- Accessible data tables
- Print-friendly fallbacks

**Height**: Optional, defaults to 400px. Datawrapper's script will override for responsive behavior.

---

### Flourish

**Shortcode**: `flourish`

**Syntax**:
```
{{< flourish "VISUALIZATION_ID" >}}
```

**Example**:
```
{{< flourish "12345678" >}}
```

**How to get Visualization ID**:
- From Flourish publish panel
- URL format: `https://public.flourish.studio/visualisation/12345678/`
- ID is: `12345678`

**Features**:
- Interactive data visualizations
- Responsive sizing
- Animated transitions
- Accessible narratives

---

### Google Maps

**Shortcode**: `maps`

**Syntax**:
```
{{< maps "EMBED_URL" >}}
```

**Example**:
```
{{< maps "https://www.google.com/maps/embed?pb=!1m18!1m12..." >}}
```

**How to get Embed URL**:
1. Open Google Maps
2. Search for location
3. Click "Share" button
4. Click "Embed a map" tab
5. Copy the URL from the `<iframe src="...">` code

**Features**:
- 4:3 responsive aspect ratio
- Interactive map controls
- Street View integration
- Directions support

---

### Generic Embed (Fallback)

**Shortcode**: `embed`

**Syntax**:
```
{{< embed `FULL_IFRAME_CODE` >}}
```

**Example**:
```
{{< embed `<iframe src="https://example.com/embed/123" width="600" height="400"></iframe>` >}}
```

**IMPORTANT**: Use **backticks** (`) not regular quotes!

**Use for**:
- Platforms not covered by specific shortcodes
- Custom iframe embeds
- Third-party widgets
- Legacy embed codes

**Features**:
- Accepts any iframe HTML
- Automatic responsive container
- Centered placement

---

## Best Practices

### Editorial Guidelines

1. **Relevance First**
   - Only embed multimedia that adds value to the story
   - Don't embed just because you can
   - Consider: Does this help readers understand better?

2. **Context Required**
   - Always introduce embeds with context in surrounding text
   - Example: "Iată momentul accidentului, filmat de martori:"
   - Don't drop embeds without explanation

3. **Privacy Considerations**
   - YouTube uses privacy-enhanced mode automatically
   - Twitter uses Do Not Track mode
   - Consider GDPR compliance for EU audience
   - Warn readers about third-party tracking where relevant

4. **Performance**
   - All embeds use lazy loading (load when scrolled into view)
   - Don't overload articles with too many embeds
   - Recommended max: 3-4 embeds per article

5. **Accessibility**
   - Add descriptive text before embeds for screen readers
   - Ensure embeds are keyboard-navigable
   - Consider users with limited data (mobile)

6. **Copyright & Attribution**
   - Always verify you have right to embed content
   - Most platforms' embed codes include attribution automatically
   - Add manual credit if needed

### Technical Guidelines

1. **Testing Before Publish**
   - Preview article to verify embed renders correctly
   - Check on mobile device
   - Test with ad blockers (some users have them)

2. **Fallback Content**
   - Embeds may fail (ad blockers, privacy extensions, slow connections)
   - Always provide context text so article makes sense without embed
   - Example: "În videoclipul de mai jos..." → article still readable if video doesn't load

3. **Load Times**
   - Each embed adds external scripts
   - Multiple embeds from same platform share scripts (efficient)
   - Mix platforms sparingly to avoid script bloat

4. **Mobile Optimization**
   - All embeds are responsive
   - Vertical embeds (TikTok) stay narrow on mobile
   - Maps become interactive touch interfaces

---

## Troubleshooting

### Embed Doesn't Show

**Check**:
1. Is the content public? (Facebook, Telegram, Instagram must be public)
2. Did you use correct syntax? (Check quotes, backticks for generic embed)
3. Is the ID correct? (Copy-paste carefully)
4. Is URL encoded properly? (Facebook, SoundCloud need full URLs)

**Common Mistakes**:
- Facebook: Using private post URL
- Twitter: Forgetting username parameter
- Spotify: Wrong type (track vs album vs playlist)
- Generic embed: Using quotes instead of backticks

### Embed Shows But Looks Broken

**Check**:
1. Clear browser cache and hard reload (Ctrl+Shift+R)
2. Check browser console for errors (F12 → Console tab)
3. Verify external scripts aren't blocked (ad blockers, privacy extensions)
4. Test in incognito mode

### Embed Works Locally But Not on Live Site

**Check**:
1. Did you run `make build`? (Embeds need production build)
2. Is Cloudflare Pages deployment complete? (Wait 2-3 minutes)
3. Check CSP headers (Content Security Policy may block embeds)
4. Verify HTTPS (some embeds require secure connection)

### Performance Issues

**Solutions**:
1. Reduce number of embeds per article
2. Use pagination for long articles with many embeds
3. Consider static screenshots linking to full embed
4. Optimize surrounding content (images, etc.)

---

## Technical Implementation

### File Structure

```
layouts/shortcodes/
  ├── youtube.html        # YouTube embeds
  ├── tiktok.html         # TikTok embeds
  ├── instagram.html      # Instagram embeds
  ├── facebook.html       # Facebook embeds
  ├── twitter.html        # Twitter/X embeds
  ├── telegram.html       # Telegram embeds
  ├── spotify.html        # Spotify embeds
  ├── soundcloud.html     # SoundCloud embeds
  ├── vimeo.html          # Vimeo embeds
  ├── datawrapper.html    # Datawrapper charts
  ├── flourish.html       # Flourish visualizations
  ├── maps.html           # Google Maps
  └── embed.html          # Generic fallback

assets/css/_embeds.scss   # Responsive embed styles
assets/css/main.scss      # Imports _embeds.scss
```

### CSS Classes

All embeds use `.embed-responsive` base class with platform-specific variants:

- `.embed-youtube` - 16:9 video
- `.embed-tiktok` - 9:16 vertical video
- `.embed-instagram` - Native sizing
- `.embed-facebook` - Native sizing
- `.embed-twitter` - Native sizing
- `.embed-telegram` - Native sizing
- `.embed-spotify` - Fixed height
- `.embed-soundcloud` - Fixed height 166px
- `.embed-datawrapper` - Auto height
- `.embed-flourish` - Native responsive
- `.embed-maps` - 4:3 aspect ratio
- `.embed-generic` - Flexible

### Responsive Breakpoints

```scss
// Mobile: Full width bleeding
@media (max-width: 640px) { }

// Tablet: 90% width
@media (min-width: 641px) and (max-width: 1024px) { }

// Desktop: 800px max width (optimal reading)
@media (min-width: 1025px) { }
```

### Lazy Loading

All video embeds use `loading="lazy"` attribute:
- Embeds load only when scrolled into viewport
- Reduces initial page load time
- Saves bandwidth for users
- Improves Core Web Vitals scores

### Privacy Features

- **YouTube**: `youtube-nocookie.com` domain (no tracking cookies until play)
- **Twitter**: `data-dnt="true"` (Do Not Track)
- **Vimeo**: `dnt=1` parameter
- **All embeds**: `referrerpolicy="strict-origin-when-cross-origin"`

---

## Examples in Context

### News Article with Multiple Embeds

```markdown
---
title: "Protest la Chișinău: Mii de oameni cer demisia guvernului"
date: 2025-11-02
categories: ["national"]
---

Peste 5.000 de persoane au participat astăzi la protestul din Piața Marii Adunări Naționale...

## Momentul protestului

Iată imagini aeriene ale manifestației, filmate de jurnaliști:

{{< youtube "abc123def45" >}}

Organizatorii protestului au publicat pe Telegram un mesaj către participanți:

{{< telegram "protest_md" "789" >}}

## Reacții pe rețelele sociale

Liderii opoziției au comentat evenimentul pe Twitter:

{{< twitter "politician_name" "1234567890" >}}

Pe Instagram, cetățenii au împărtășit imagini din mulțime:

{{< instagram "C9876543210" >}}
```

### Data Journalism Article

```markdown
---
title: "Evoluția prețurilor la gaze în Moldova: Analiză 2020-2025"
date: 2025-11-02
categories: ["analiza"]
formats: ["analiza"]
---

Datele arată o creștere constantă a tarifelor...

{{< datawrapper "xyz123" "600" >}}

Pentru context european, comparăm cu țările vecine:

{{< flourish "87654321" >}}
```

### Cultural Article with Audio

```markdown
---
title: "Interviu: Poet laureate despre identitate și limbă"
date: 2025-11-02
categories: ["cultura"]
---

Am stat de vorbă cu poetul... Ascultați interviul complet:

{{< spotify "episode" "abc123xyz789" >}}

Poezia discutată în interviu poate fi ascultată și pe SoundCloud:

{{< soundcloud "https://soundcloud.com/poet-name/poem-title" >}}
```

---

## Future Enhancements

### Planned Features

1. **Embed Analytics**
   - Track which embeds are viewed
   - Measure engagement time
   - Optimize platform mix

2. **Consent Management**
   - GDPR-compliant consent prompts
   - User choice before loading embeds
   - Privacy-first approach

3. **Offline Fallbacks**
   - Static thumbnails for PWA mode
   - Cached metadata
   - "View online" links

4. **Additional Platforms**
   - LinkedIn posts
   - Threads (Meta)
   - BlueSky
   - Mastodon
   - Peertube (decentralized video)

5. **Smart Embeds**
   - Auto-detect platform from URL
   - One shortcode for all: `{{< embed "URL" >}}`
   - Intelligent parsing

### Maintenance

- **Review quarterly**: Check if platform embed APIs changed
- **Test on updates**: After Hugo version upgrades
- **Monitor performance**: Track Core Web Vitals impact
- **Update privacy**: Adapt to GDPR/privacy law changes

---

## Support & Resources

### Platform Documentation

- YouTube IFrame API: https://developers.google.com/youtube/iframe_api_reference
- TikTok Embed: https://developers.tiktok.com/doc/embed-videos
- Instagram oEmbed: https://developers.facebook.com/docs/instagram/oembed
- Facebook SDK: https://developers.facebook.com/docs/plugins/embedded-posts
- Twitter Widgets: https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets
- Telegram Widgets: https://core.telegram.org/widgets/post
- Spotify Embed: https://developer.spotify.com/documentation/embeds
- Datawrapper: https://academy.datawrapper.de/article/129-how-to-embed-a-chart-in-your-website
- Flourish: https://help.flourish.studio/article/66-embed-a-flourish-visualisation

### Hugo Shortcodes

- Hugo Shortcodes Docs: https://gohugo.io/content-management/shortcodes/
- Hugo Params & Context: https://gohugo.io/templates/shortcode-templates/

### Testing Tools

- Responsive Test: http://responsivetesttool.com/
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- PageSpeed Insights: https://pagespeed.web.dev/
- Core Web Vitals: https://web.dev/vitals/

---

**Maintained by**: Claude Code (AI Assistant)
**Review frequency**: Quarterly or when platforms update APIs
**Status**: Living document
