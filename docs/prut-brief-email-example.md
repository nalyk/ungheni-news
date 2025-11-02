# Prut Brief Email - Example Content File

This example shows how to create a daily Prut Brief content file that uses the email template.

## File Location

```
content/ro/prut-brief/2025-01-15.md
```

## Front Matter Example

```yaml
---
title: "Prut Brief - 15 ianuarie 2025"
date: 2025-01-15T18:00:00+02:00
layout: prut-brief-email

# List of story slugs or paths to include
local_stories:
  - /ro/news/consiliul-local-dezbate-bugetul-2025
  - /ro/news/lucrari-strada-mihai-eminescu
  - /ro/news/incendiu-sector-industrial

national_stories:
  - /ro/news/legea-pensiilor-modificari-impact-ungheni
  - /ro/news/tarife-energie-cresc-februarie

international_stories:
  - /ro/news/ue-granturi-agricultura-moldova-ungheni

# Optional: Today's events
today_events:
  - time: "10:00"
    title: "Ședința Consiliului Local"
    location: "Primăria Ungheni"
  - time: "15:00"
    title: "Conferință de presă - Primarul Ungheni"
    location: "Sala de conferințe"
---

**Note:** The body content is not used in the email template. All content comes from the linked stories.
```

## How to Generate Email Content

### Method 1: Manual (Hugo CLI)

```bash
# Build the site
HUGO=/home/nalyk/bin/hugo make build

# Find the generated HTML file
# Location: public/ro/prut-brief/2025-01-15/index.html

# Copy the content and send via Buttondown dashboard
```

### Method 2: Automated (Cloudflare Worker)

Create a Cloudflare Worker that:
1. Fetches the latest Prut Brief content page
2. Renders it using Hugo
3. Sends via Buttondown API
4. Runs daily at 18:00

Example Worker code:

```javascript
// workers/prut-brief-sender.js

export default {
  async scheduled(event, env, ctx) {
    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // 2025-01-15

    // Fetch the Hugo-generated email content
    const contentUrl = `https://triunghi.md/ro/prut-brief/${today}/`;
    const response = await fetch(contentUrl);

    if (!response.ok) {
      console.error('Failed to fetch Prut Brief content');
      return;
    }

    const emailBody = await response.text();

    // Send via Buttondown API
    const buttondownResponse = await fetch('https://api.buttondown.email/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: `Prut Brief - ${new Date().toLocaleDateString('ro-RO')}`,
        body: emailBody,
        status: 'scheduled',
        publish_date: new Date().toISOString(), // Send immediately
      }),
    });

    if (buttondownResponse.ok) {
      console.log('Prut Brief sent successfully');
    } else {
      console.error('Failed to send Prut Brief');
    }
  },
};
```

### Method 3: GitHub Action (Recommended)

Create `.github/workflows/prut-brief.yml`:

```yaml
name: Send Daily Prut Brief

on:
  schedule:
    # Run daily at 18:00 Chisinau time (16:00 UTC)
    - cron: '0 16 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  send-newsletter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.127.0'

      - name: Build site
        run: hugo --minify

      - name: Get today's Prut Brief content
        id: get-content
        run: |
          TODAY=$(date +%Y-%m-%d)
          CONTENT_PATH="public/ro/prut-brief/${TODAY}/index.html"

          if [ -f "$CONTENT_PATH" ]; then
            CONTENT=$(cat "$CONTENT_PATH")
            echo "content<<EOF" >> $GITHUB_OUTPUT
            echo "$CONTENT" >> $GITHUB_OUTPUT
            echo "EOF" >> $GITHUB_OUTPUT
            echo "found=true" >> $GITHUB_OUTPUT
          else
            echo "found=false" >> $GITHUB_OUTPUT
            echo "No Prut Brief content for $TODAY"
          fi

      - name: Send via Buttondown
        if: steps.get-content.outputs.found == 'true'
        env:
          BUTTONDOWN_API_KEY: ${{ secrets.BUTTONDOWN_API_KEY }}
        run: |
          SUBJECT="Prut Brief - $(date +'%d %B %Y')"

          curl -X POST https://api.buttondown.email/v1/emails \
            -H "Authorization: Token $BUTTONDOWN_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
              \"subject\": \"$SUBJECT\",
              \"body\": $(echo '${{ steps.get-content.outputs.content }}' | jq -Rs .),
              \"status\": \"scheduled\",
              \"publish_date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }"
```

Don't forget to add `BUTTONDOWN_API_KEY` to GitHub Secrets:
- Go to repo Settings → Secrets and variables → Actions
- Add new secret: `BUTTONDOWN_API_KEY`

## Workflow for Editors

### Daily Prut Brief Creation

1. **Morning (8:00-10:00)**:
   - Review yesterday's published articles
   - Identify top 2-3 local stories
   - Identify 1-2 national stories with Cutia Ungheni
   - Identify 0-1 international stories (if relevant)

2. **Create Prut Brief File** (10:00-11:00):
   ```bash
   # Create today's brief
   TODAY=$(date +%Y-%m-%d)
   mkdir -p content/ro/prut-brief
   cp docs/prut-brief-template.md content/ro/prut-brief/$TODAY.md

   # Edit file and add story slugs
   nano content/ro/prut-brief/$TODAY.md
   ```

3. **Review & Commit** (11:00-12:00):
   - Build locally: `make build`
   - Check output: `public/ro/prut-brief/$(date +%Y-%m-%d)/index.html`
   - Commit and push

4. **Automated Send** (18:00):
   - GitHub Action runs automatically
   - Fetches content from deployed site
   - Sends via Buttondown
   - Newsletter delivered to subscribers

## Quality Checklist

Before publishing daily Prut Brief:

- [ ] 2-3 local stories included (60% of content)
- [ ] 1-2 national stories with Cutia Ungheni (30%)
- [ ] 0-1 international story with local impact (10%)
- [ ] All story slugs are correct and published
- [ ] Today's events section updated (if applicable)
- [ ] Date is correct in front matter
- [ ] Preview email in Buttondown before scheduling

## Metrics to Track

Monitor these KPIs weekly:

- **Open rate**: Target > 30%
- **Click-through rate**: Target > 5%
- **Unsubscribe rate**: Target < 1%
- **Subscriber growth**: Track weekly increase
- **Most clicked stories**: Understand audience interests

## Tips for Better Engagement

1. **Consistency**: Send every day at 18:00
2. **Local focus**: Always lead with local stories
3. **Clear summaries**: Write compelling 1-2 sentence summaries
4. **Actionable**: Include events, deadlines, practical info
5. **Mobile-friendly**: Keep paragraphs short, use bullets
6. **Personal tone**: Write like talking to a neighbor

## Troubleshooting

### Email not sending

1. Check GitHub Action logs
2. Verify Prut Brief file exists for today
3. Check Buttondown API key is valid
4. Verify stories referenced exist and are published

### Wrong stories appearing

1. Double-check story slugs in front matter
2. Ensure stories are published (not drafts)
3. Rebuild site and check output

### Subscribers not receiving

1. Check Buttondown dashboard for delivery status
2. Check spam filters
3. Verify subscribers confirmed email (if double opt-in enabled)
4. Check Buttondown sending domain is verified
