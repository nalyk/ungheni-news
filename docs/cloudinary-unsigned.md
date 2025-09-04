# Cloudinary: Create an Unsigned Upload Preset

1) Create account (free tier) and note your `cloud name` and `API key`.
2) In Cloudinary Console → Settings → Upload → Upload presets → Add upload preset.
3) Set:
   - Signing mode: Unsigned (ON)
   - Folder: `newsroom` (optional)
   - Allowed formats: `jpg,jpeg,png,webp,avif` (as needed)
   - Access mode: Public
   - Delivery: `fetch_format=auto`, `quality=auto` (or leave blank; we also set default transformations in Decap)
4) Save the preset and copy its name.

Decap `admin/config.yml` media_library example:

media_library:
  name: cloudinary
  config:
    cloud_name: YOUR_CLOUD_NAME
    api_key: YOUR_API_KEY
    default_transformations:
      - - fetch_format: auto
        - quality: auto

Notes
- Unsigned uploads are scoped per preset; keep the preset name non-guessable.
- You can later switch to signed uploads without changing content URLs.

