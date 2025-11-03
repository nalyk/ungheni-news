---
name: decap-cms-expert
description: Use this skill when working with Decap CMS (formerly Netlify CMS) configuration, OAuth authentication, collection setup, or editorial workflow. Triggers include CMS configuration issues, GitHub backend authentication problems, collection schema design, field widget configuration, or media library integration. Critical for Triunghi.md's headless CMS architecture.
---

# Decap CMS Expert

## Overview

Provide specialized Decap CMS expertise for headless CMS configuration, GitHub backend integration, OAuth authentication flows, collection management, and editorial workflows. Handle complex Decap CMS challenges including OAuth postMessage patterns, multilingual collections, and field widget customization.

## Core Capabilities

### 1. OAuth Authentication Flow (CRITICAL)

**The Problem**: Decap CMS OAuth with GitHub requires precise postMessage communication. Incorrect message formats cause silent failures where the popup closes but login doesn't complete.

#### OAuth Setup Requirements

**GitHub OAuth App Configuration:**
```
Client ID: Ov23liSvb4wITabAOGoo
Homepage URL: https://triunghi.md/admin
Authorization Callback URL: https://triunghi.md/api/auth
```

**CRITICAL**: Callback URL must match EXACTLY.

**Cloudflare Environment Variables:**
```
Variable: GITHUB_CLIENT_SECRET
Type: Secret/Encrypted
Location: Dashboard → Project → Settings → Environment Variables
```

#### OAuth Endpoint Implementation

**File**: `functions/api/auth.js` (at project root, NOT in static/)

**INCORRECT postMessage (DOES NOT WORK)**:
```javascript
// ❌ Decap CMS ignores JSON objects
window.opener.postMessage({
  type: 'authorization_grant',
  token: 'xxx'
}, origin);
```

**CORRECT postMessage (String Format)**:
```javascript
// ✅ Decap CMS expects STRING format
window.opener.postMessage(
  'authorization:github:success:' + JSON.stringify({
    token: 'xxx',
    provider: 'github'
  }),
  'https://triunghi.md'
);
```

#### Two-Step Handshake (MANDATORY)

**Wrong**: Just sending success message
```javascript
// ❌ CMS ignores this - user stares at login button forever
window.opener.postMessage(
  'authorization:github:success:' + JSON.stringify({...}),
  'https://triunghi.md'
);
```

**Correct**: Handshake then success
```javascript
// ✅ Two-step handshake
// Step 1: Tell CMS auth flow started
window.opener.postMessage("authorizing:github", "https://triunghi.md");

// Step 2: Send success after small delay
setTimeout(() => {
  window.opener.postMessage(
    'authorization:github:success:' + JSON.stringify({
      token: accessToken,
      provider: 'github'
    }),
    'https://triunghi.md'
  );
  window.close();
}, 100);
```

#### Origin Handling

**Wrong**:
```javascript
// ❌ Using window.location.origin or '*'
window.opener.postMessage(message, window.location.origin);  // Fails
window.opener.postMessage(message, '*');  // Security risk
```

**Correct**:
```javascript
// ✅ Explicit domain origin
window.opener.postMessage(message, 'https://triunghi.md');
```

#### Complete OAuth Function

```javascript
// functions/api/auth.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Redirect to GitHub OAuth
    const clientId = 'Ov23liSvb4wITabAOGoo';
    const redirectUri = 'https://triunghi.md/api/auth';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    return Response.redirect(githubAuthUrl, 302);
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: 'Ov23liSvb4wITabAOGoo',
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code
    })
  });

  const tokenData = await tokenResponse.json();

  // Return HTML with two-step postMessage
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head><title>Authentication Success</title></head>
    <body>
      <p>Authentication successful. Closing window...</p>
      <script>
        (function() {
          // Step 1: Handshake
          window.opener.postMessage("authorizing:github", "https://triunghi.md");

          // Step 2: Success
          setTimeout(function() {
            window.opener.postMessage(
              'authorization:github:success:' + JSON.stringify({
                token: '${tokenData.access_token}',
                provider: 'github'
              }),
              'https://triunghi.md'
            );
            window.close();
          }, 100);
        })();
      </script>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

#### Debugging OAuth

Add to `static/admin/index.html`:
```javascript
window.addEventListener('message', function(event) {
  console.log('🎯 CMS: Received postMessage from:', event.origin);
  console.log('🔍 CMS: Message data:', event.data);
  console.log('🔍 CMS: Message type:', typeof event.data);
});
```

**Common Failure Symptoms:**
- Popup closes, but user still sees login screen = **Message format issue**
- No postMessage received = **Origin mismatch**
- Console shows messages but CMS doesn't respond = **Missing handshake**

### 2. Collection Configuration

#### Multilingual Collections

**Pattern**: Separate collections for each language

```yaml
collections:
  # Romanian News
  - name: "news_ro"
    label: "Știri (RO)"
    folder: "content/ro/news"
    create: true
    slug: "{{slug}}"
    path: "{{slug}}/index"
    media_folder: ""
    public_folder: ""
    format: "frontmatter"
    extension: "md"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Summary", name: "summary", widget: "text"}
      - {label: "Publish Date", name: "publishDate", widget: "datetime"}
      - {label: "Draft", name: "draft", widget: "boolean", default: false}
      - label: "Categories"
        name: "categories"
        widget: "select"
        multiple: true
        options: ["local", "frontiera-transport", "economie-zel", "servicii-publice", "educatie-sanatate", "national", "ue-romania"]
      - label: "Formats"
        name: "formats"
        widget: "select"
        multiple: false
        options: ["stire", "analiza", "explainer", "opinie", "factcheck"]
      - label: "Body"
        name: "body"
        widget: "markdown"

  # Russian News
  - name: "news_ru"
    label: "Новости (RU)"
    folder: "content/ru/news"
    # ... similar structure
```

#### Page Bundles

For media with articles:
```yaml
folder: "content/ro/news"
path: "{{slug}}/index"        # Creates article-slug/index.md
media_folder: ""              # Media in same folder as index.md
public_folder: ""
```

#### Nested Objects

For Cutia Ungheni:
```yaml
- label: "Cutia Ungheni"
  name: "cutia_ungheni"
  widget: "object"
  required: false
  fields:
    - {label: "Impact Local", name: "impact_local", widget: "text"}
    - {label: "Ce se schimbă", name: "ce_se_schimba", widget: "text"}
    - {label: "Termene", name: "termene", widget: "text"}
```

#### List Fields

For authors:
```yaml
- label: "Authors"
  name: "authors"
  widget: "list"
  allow_add: true
  field: {label: "Author", name: "author", widget: "string"}
```

### 3. Field Widgets

#### Common Widgets

**String**: Single-line text
```yaml
- {label: "Title", name: "title", widget: "string", required: true}
```

**Text**: Multi-line text
```yaml
- {label: "Summary", name: "summary", widget: "text", required: true}
```

**Markdown**: Rich text editor
```yaml
- {label: "Body", name: "body", widget: "markdown"}
```

**DateTime**: Date/time picker
```yaml
- label: "Publish Date"
  name: "publishDate"
  widget: "datetime"
  format: "YYYY-MM-DDTHH:mm:ssZ"
  dateFormat: "DD.MM.YYYY"
  timeFormat: "HH:mm"
  pickerUtc: false
```

**Boolean**: Checkbox
```yaml
- {label: "Draft", name: "draft", widget: "boolean", default: false}
- {label: "Featured", name: "featured", widget: "boolean", default: false}
```

**Select**: Dropdown (single)
```yaml
- label: "Format"
  name: "formats"
  widget: "select"
  multiple: false
  options: ["stire", "analiza", "explainer", "opinie", "factcheck"]
```

**Select**: Multi-select
```yaml
- label: "Categories"
  name: "categories"
  widget: "select"
  multiple: true
  options: ["local", "national", "ue-romania"]
```

**Relation**: Reference other content
```yaml
- label: "Author"
  name: "author"
  widget: "relation"
  collection: "authors"
  searchFields: ["name"]
  valueField: "slug"
  displayFields: ["name"]
```

**Image**: Image upload
```yaml
- {label: "Featured Image", name: "featured_image", widget: "image"}
```

**List**: Array of items
```yaml
- label: "Tags"
  name: "tags"
  widget: "list"
  allow_add: true
  field: {label: "Tag", name: "tag", widget: "string"}
```

**Object**: Nested fields
```yaml
- label: "Author Info"
  name: "author_info"
  widget: "object"
  fields:
    - {label: "Name", name: "name", widget: "string"}
    - {label: "Email", name: "email", widget: "string"}
```

### 4. Media Library Integration

#### Cloudinary Configuration

```yaml
media_library:
  name: cloudinary
  config:
    cloud_name: your_cloud_name
    api_key: your_api_key
```

#### Local Media Fallback

```yaml
media_folder: "static/uploads"
public_folder: "/uploads"
```

#### Per-Collection Media

```yaml
collections:
  - name: "news_ro"
    folder: "content/ro/news"
    media_folder: ""           # Store in page bundle
    public_folder: ""
```

### 5. Editorial Workflow

#### Enable Workflow

```yaml
publish_mode: editorial_workflow
```

**Workflow States:**
1. **Draft** - Work in progress
2. **In Review** - Ready for review
3. **Ready** - Approved for publishing

#### Workflow Configuration

```yaml
publish_mode: editorial_workflow
# Creates PR branches: cms/collection-name/slug
```

**GitHub Backend:**
- Draft = New branch created
- In Review = PR opened
- Ready = Ready to merge
- Publish = PR merged to main

### 6. Backend Configuration

#### GitHub Backend

```yaml
backend:
  name: github
  repo: owner/repo-name
  branch: main
  base_url: https://triunghi.md
  auth_endpoint: /api/auth
```

**Key Fields:**
- `repo`: GitHub repository (format: `owner/repo`)
- `branch`: Target branch for commits
- `base_url`: Site URL for OAuth redirect
- `auth_endpoint`: Custom OAuth endpoint path

### 7. Validation & Previews

#### Field Validation

```yaml
- label: "Email"
  name: "email"
  widget: "string"
  pattern: ['^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', 'Must be a valid email']
```

#### Custom Previews

```yaml
# static/admin/index.html
<script>
CMS.registerPreviewStyle("/admin/preview.css");
CMS.registerPreviewTemplate("news_ro", NewsPreview);
</script>
```

### 8. Common Issues & Solutions

#### Issue: Login popup closes but no login
**Cause**: Incorrect postMessage format
**Solution**: Use string format with two-step handshake (see OAuth section)

#### Issue: Collections not showing
**Cause**: Incorrect folder path or missing content
**Solution**: Verify `folder` path matches actual content directory

#### Issue: Media not uploading
**Cause**: Cloudinary config missing or incorrect
**Solution**: Check `media_library` configuration and API keys

#### Issue: Changes not appearing on site
**Cause**: Commit succeeded but build didn't trigger
**Solution**: Check Cloudflare Pages deployment logs

#### Issue: DateTime timezone issues
**Cause**: UTC vs local time mismatch
**Solution**: Set `pickerUtc: false` and use `Europe/Chisinau` timezone

## Resources

### references/

Contains Decap CMS reference documentation:
- `oauth-flow-complete.md` - Complete OAuth implementation guide
- `collection-examples.md` - Collection configuration patterns
- `widget-reference.md` - All field widget types and options

## When to Use This Skill

Trigger this skill for:
- OAuth authentication issues
- Collection configuration
- Field widget setup
- Media library integration
- Editorial workflow configuration
- GitHub backend setup
- Custom preview templates
- Decap CMS debugging
- Any CMS-related development task

Essential for maintaining the Triunghi.md headless CMS editorial system.
