# Media setup — skyline photo, intro video, playlist, testimonials

Everything dynamic on the page now reads from **content.json**. Edit that one
file (or, once the CMS is built, edit through the dashboard) and the page
updates — no HTML editing.

---

## 1. Hyperrealistic LA skyline backdrop

The backdrop currently uses `assets/skyline.svg` (an illustration). For a real
photo, pick one of these free, commercial-use, no-attribution images from
Unsplash, download the **full resolution**, and use it:

- Downtown LA at night, long exposure — https://unsplash.com/photos/rZ2x7KDF1v8
- LA skyline "Blade Runner edition" (hazy, cinematic) — https://unsplash.com/photos/M94UCAMycqA
- Beautiful view of LA at night — https://unsplash.com/photos/Nh5kav7oSzg
- City skyline at night (DTLA) — https://unsplash.com/photos/ns1L9pmeDw0

On each page click **Download free** (top-right). You'll get a ~4000px JPG.

**To use it — two options:**

a) **Drop it in the folder.** Save as `assets/skyline.jpg`, then in
   `content.json` set:
   ```json
   "skyline": { "type": "image", "src": "assets/skyline.jpg" }
   ```

b) **Serve from Supabase Storage** (better for the CMS). Upload to a public
   bucket, copy the public URL, and set `src` to that URL.

Keep it large — 2400px wide minimum for crisp display on big screens. JPEG
quality ~80 keeps it under ~500KB. The page dims and parallaxes it
automatically; you don't need to darken the photo yourself.

> Why not baked in already? Image downloads are blocked from this build
> environment, so I can't fetch the photo for you — but the swap is one line.

## 2. Brandon's welcome video (full-screen, top of page)

The welcome video now fills the entire first screen — visitors watch (or scroll
past) it before reaching the application. Same config as before:

In `content.json` → `introVideo`:
```json
"introVideo": {
  "enabled": true,
  "provider": "youtube",     // or "vimeo"
  "id": "PASTE_VIDEO_ID",    // the part after watch?v=  (or the Vimeo number)
  "title": "Watch Brandon's 90-second intro",
  "poster": "assets/hero.jpg"
}
```
Leave `id` empty and the slot shows the poster with a "coming soon" badge —
so the page never looks broken before the video exists. YouTube/Vimeo stream
at up to 4K automatically; nothing to configure for 1080p.

## 3. High Stakes Deals video playlist

In `content.json` → `playlist.videos`, one object per video:
```json
{ "id": "YOUTUBE_ID", "title": "Episode title", "duration": "18:24" }
```
First video shows as a clickable thumbnail; clicking any item swaps the main
player. Empty `id` = a "coming soon" tile. Add or remove list items freely.

## 4. Testimonials

In `content.json` → `testimonials`:
```json
{ "name": "Anthony", "handle": "Member since 2024",
  "photo": "", "stars": 5,
  "quote": "Short punchy line.", "body": "The longer story." }
```
`photo` empty = a gold monogram of their first initial. Add as many as you
like; they flow 3-across on desktop, 1-up on mobile.

---

## Notes for hosting on Netlify + Supabase
- `content.json` is fetched at page load, so it must sit next to `index.html`
  at the site root. Netlify serves it fine.
- Because it's fetched (not inlined), **you can't preview via file://** — open
  through a server or the live Netlify URL. Opening index.html directly will
  fall back to the built-in defaults, which is harmless.
- The coming CMS will write to this same `content.json` (or a Supabase table
  the page reads instead) — the render code already keys off these exact
  field names, so the dashboard is a thin editor on top.

## Welcome video — YouTube link OR your own file
The welcome video (and every playlist video) now accepts either:
- **YouTube / Vimeo** — paste the full link *or* just the ID. A pasted
  `https://www.youtube.com/watch?v=XXXX` now works directly (previous versions
  needed the bare ID and would throw a playback error — fixed).
- **Your own file** — in the admin Video tab, choose "Upload a file (MP4)" and
  upload. It goes to Supabase Storage and plays as a native HTML5 video.

MP4, 1080p, under ~200MB is the sweet spot. Bigger than that, host it on
YouTube/Vimeo instead — self-hosting very large files gets slow and eats
Supabase bandwidth. The storage bucket is capped at 200MB per file by
supabase-content-setup.sql.
