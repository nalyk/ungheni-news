# Prut Brief Newsletter Setup Guide

This guide explains how to configure the Prut Brief newsletter system for Triunghi.md.

## Overview

The newsletter system consists of:
1. **Frontend**: Newsletter signup form (`layouts/partials/service-rail/prut-brief.html`)
2. **Backend**: Cloudflare Function (`functions/api/newsletter.js`)
3. **Email Service**: Buttondown (third-party service for email delivery)

## Step 1: Create Buttondown Account

1. Go to [https://buttondown.email](https://buttondown.email)
2. Sign up for an account (free plan supports up to 100 subscribers)
3. Confirm your email address

## Step 2: Configure Buttondown

### Newsletter Settings

1. Go to **Settings** → **Newsletter**
2. Configure basic settings:
   - **Newsletter name**: Prut Brief
   - **Description**: Newsletter local zilnic pentru Ungheni
   - **From email**: noreply@triunghi.md (or your domain)
   - **Reply-to email**: contact@triunghi.md

### Branding

1. Go to **Settings** → **Branding**
2. Upload logo (optional)
3. Set colors to match Triunghi.md brand

### Email Template

1. Go to **Settings** → **Email**
2. Configure email footer with:
   - Unsubscribe link (required by law)
   - Contact information
   - Physical address (if required by GDPR)

Example footer:
```
---
Primiți acest email pentru că v-ați abonat la Prut Brief de la Triunghi.md

Dezabonați-vă: {{ unsubscribe_url }}
Contact: contact@triunghi.md
Triunghi.md - Presă locală pentru Ungheni
```

## Step 3: Get API Key

1. Go to **Settings** → **Programming**
2. Copy your API key (starts with `bd_`)
3. Keep this secure - it provides full access to your subscribers

## Step 4: Add API Key to Cloudflare

### Via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your Triunghi.md project
3. Go to **Settings** → **Environment variables**
4. Add new variable:
   - **Name**: `BUTTONDOWN_API_KEY`
   - **Value**: Your Buttondown API key (from Step 3)
   - **Environment**: Production (and optionally Preview)
5. Click **Save**

### Via Command Line (Wrangler)

```bash
# Set for production
npx wrangler pages secret put BUTTONDOWN_API_KEY

# You'll be prompted to enter the value
```

## Step 5: Test the Integration

### Local Testing

1. Start Hugo dev server:
   ```bash
   make dev
   ```

2. The newsletter form will be visible on the homepage
3. Try subscribing with a test email
4. **Note**: API calls will fail locally unless you set up environment variables for local dev

### Production Testing

1. Deploy to Cloudflare Pages:
   ```bash
   git add .
   git commit -m "feat: add Prut Brief newsletter integration"
   git push
   ```

2. Wait 2-3 minutes for deployment
3. Visit https://triunghi.md
4. Test newsletter signup with your email
5. Check Buttondown dashboard to confirm subscriber was added

## Step 6: Create Email Template (Optional)

Buttondown supports custom email templates using Markdown. Create templates for:

### Daily Prut Brief Template

Create in Buttondown dashboard or via API:

```markdown
# Prut Brief - {{ date }}

Cele mai importante știri locale pentru Ungheni.

---

## 📍 Local

{{ local_section }}

---

## 🇲🇩 Național

{{ national_section }}

---

## 🌍 Internațional (cu impact local)

{{ international_section }}

---

**Mulțumim că citiți Prut Brief!**

*Triunghi.md - Local. Național. Internațional. În această ordine.*

[Vizitați site-ul](https://triunghi.md) · [Dezabonare]({{ unsubscribe_url }})
```

## Sending Newsletters

### Via Buttondown Dashboard

1. Go to **Emails** → **New Email**
2. Write your content using Markdown
3. Schedule or send immediately
4. Track opens and clicks in dashboard

### Via API (Automated)

For automated daily Prut Brief, you can use the Buttondown API:

```javascript
// Example: Send email via Buttondown API
const response = await fetch('https://api.buttondown.email/v1/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Prut Brief - ' + new Date().toLocaleDateString('ro-RO'),
    body: emailContent, // Markdown format
    status: 'draft' // or 'scheduled' with 'publish_date'
  })
});
```

## Monitoring & Analytics

### Subscriber Growth

- Check Buttondown dashboard for subscriber count
- Export subscriber list as CSV
- Monitor growth trends

### Email Performance

Buttondown tracks:
- **Open rate**: % of subscribers who opened
- **Click rate**: % who clicked links
- **Unsubscribe rate**: % who unsubscribed

**Target metrics** (from project_info.md):
- Open rate: > 30% for local audience
- Click-through rate: > 5%
- Unsubscribe rate: < 1%

## GDPR Compliance

Buttondown is GDPR-compliant by default:

✅ Double opt-in (optional but recommended)
✅ Easy unsubscribe link in every email
✅ Data export for subscribers
✅ Right to be forgotten (deletion)
✅ EU data centers available

### Enable Double Opt-In

1. Go to **Settings** → **Subscription**
2. Enable **Require confirmation**
3. Customize confirmation email

## Troubleshooting

### Newsletter signup fails with "Eroare de configurare"

**Cause**: `BUTTONDOWN_API_KEY` environment variable not set

**Fix**: Add API key to Cloudflare Pages environment variables (see Step 4)

### Subscribers not receiving emails

**Cause**: Email not verified in Buttondown

**Fix**:
1. Check Buttondown dashboard for verification status
2. Verify your sending email domain
3. Check spam folder

### "Already subscribed" message

**Cause**: Email already exists in Buttondown

**Fix**: This is normal behavior - user is already subscribed

### API returns 401 Unauthorized

**Cause**: Invalid API key

**Fix**:
1. Verify API key is correct
2. Check for extra spaces or characters
3. Regenerate key in Buttondown if needed

## Cost Considerations

Buttondown pricing (as of 2025):
- **Free**: Up to 100 subscribers
- **Standard**: $9/month for 1,000 subscribers
- **Professional**: $29/month for 10,000 subscribers

For Triunghi.md (target: ~2,000 local subscribers):
- Estimated cost: $9/month

## Alternative Email Services

If Buttondown doesn't fit, alternatives:

1. **ConvertKit**: More features, higher cost ($29/month)
2. **Mailchimp**: Free tier up to 500 subscribers, complex UI
3. **Sendy**: Self-hosted, one-time cost ($69), requires AWS SES
4. **Listmonk**: Open-source, self-hosted, free but requires server

**Recommendation**: Stick with Buttondown for simplicity and GDPR compliance.

## Next Steps

1. ✅ Set up Buttondown account and API key
2. ✅ Deploy updated code to production
3. ⏳ Create Prut Brief email template in Buttondown
4. ⏳ Set up automation for daily newsletter generation (see `docs/prut-brief-automation.md`)
5. ⏳ Promote newsletter on social media and in articles

## Support

- **Buttondown docs**: https://docs.buttondown.email
- **Buttondown support**: support@buttondown.email
- **Triunghi.md tech issues**: File issue in GitHub repo
