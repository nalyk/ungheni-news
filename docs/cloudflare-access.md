# Cloudflare Access: Gate `/admin/*`

- Application type: Self-hosted
- Application domain/path: `https://<your-domain>/admin/*`
- Policies:
  - Action: Allow
  - Include: Email (your newsroom emails) or Access Groups
  - Exclude: Service tokens, non-org emails
  - Require: Email one-time pin or IdP (Google/Microsoft)

Example policy (Terraform-style pseudocode)

application "decap-admin" {
  domain = "newsroom.example.org/admin/*"
  session_duration = "24h"
}

policy "allow-newsroom" {
  application = application.decap-admin.id
  decision    = "allow"
  include     = [ emails("*@yournewsroom.md"), group("Editors") ]
  require     = [ login_method("google"), email_domain("yournewsroom.md") ]
}

Notes
- Keep `/admin` on the same site; Access only protects the admin path.
- Add at least two admin accounts; enable bypass URL for emergencies.
- Test from an incognito window to verify the gate.

