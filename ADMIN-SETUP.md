# Backend / admin setup

You now have an editor at **/admin.html** where you (or anyone you give a login)
can change the webinar link, media, videos, testimonials, copy, and connect
HubSpot later — without touching code. The live site reads from Supabase, so
edits appear immediately.

## How it fits together
```
index.html   → reads content from Supabase table `site_content`
               (falls back to content.json if the table is empty)
admin.html   → login-gated editor that writes to `site_content`
               + uploads images to the `site-media` storage bucket
```

## One-time setup (≈5 min)

1. **Run the SQL.** Supabase → SQL Editor → run `supabase-content-setup.sql`.
   This creates the `site_content` table, the `site-media` storage bucket, and
   the access rules (public can read, only logged-in admins can write).

2. **Create your admin login.** Supabase → Authentication → Users → **Add user**.
   Enter your email + a password, tick **Auto Confirm User**. That's your login.
   - To stop anyone else signing up: Authentication → Providers → Email →
     turn **off** "Enable sign-ups".
   - To add a teammate later: just add another user the same way.

3. **Deploy** the whole folder to Netlify as usual. Visit `/admin.html`, sign in,
   and you'll see your current content loaded (seeded from content.json the first
   time). Edit, hit **Save changes** — the live site updates.

## Where's the login button?
Bottom-right corner of the site — a small gold dot. It's intentionally subtle.
It links to `/admin.html`. (You can also just go to yoursite.com/admin.html.)

## The webinar button
Under the testimonials. Edit it in admin → **Webinar** tab:
- toggle it on/off
- set the button label
- paste your **Kajabi** webinar URL (opens in a new tab)
- optional caption under the button

Until you set a URL there (or in content.json), the button stays hidden — it
never shows a broken link.

## Connecting HubSpot later (for whoever picks this up)
Nothing about HubSpot is wired into the live flow yet, so the site works
perfectly without it. When ready:

1. In admin → **HubSpot** tab, toggle **Send applications to HubSpot** on.
2. Paste the **Portal ID** and **Form GUID** (HubSpot → Marketing → Forms →
   your form → Share → Embed snippet contains both).
3. Save.

From then on, every application is saved to Supabase **and** mirrored to HubSpot.
The HubSpot call is fire-and-forget: if HubSpot is misconfigured or down, the
application is still saved and the visitor still sees success. Turning the toggle
back off instantly stops the mirroring. Map these HubSpot field names to capture
everything: `firstname, lastname, email, phone, goals, owns_real_estate, capital`.

## Uploading media
In the **Media** tab, each image has an Upload button. Files go to the
`site-media` bucket and the public URL is filled in for you. Hit Save afterward.
For the LA skyline, upload a real night photo (JPG, 2400px+ wide) — see
SETUP-MEDIA.md for free sources.

## Safety notes
- The anon key in both pages is public by design; the SQL policies are what
  protect writes (only authenticated users). Don't put the service_role key here.
- `content.json` stays as the built-in fallback. If you ever want to reset,
  clear the `site_content.data` row and the site reverts to the file.
- `assets/supabase.js` is the auth library, bundled locally so the admin page
  has no external dependency. Keep it in the folder.
