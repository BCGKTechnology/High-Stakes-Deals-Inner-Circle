# High Stakes Deals Inner Circle — landing page

```
index.html            the page (application-first, black & gold)
assets/               the photos it uses
supabase-setup.sql    creates/updates the applications table + security
supabase/functions/   Edge Function that emails you each new application
EMAIL-SETUP.md        how to turn that email on
```

Static site — no build step. Deploy the whole folder (index.html at root, assets/ beside it) to Netlify, Vercel, Cloudflare Pages, or Hostinger.

## What changed in this version
- Renamed to **High Stakes Deals Inner Circle**.
- Restyled after hotelinvesting.com: black + gold, big serif display, cinematic.
- **Application-first**: the form is the hero. Everything else (founder, why-now, framework, results, team) sits below as supporting proof.
- **Price removed.** Instead of showing $12,500 the form qualifies the lead — goals, whether they own real estate, capital available, timeline — the same play the reference uses.
- The Supabase form now captures those extra qualifying fields.

## 1. Update the database
Supabase → SQL Editor → run `supabase-setup.sql`. It's idempotent: safe on a
fresh project or on top of the earlier table. It adds the new columns
(goals, capital, owns_real_estate, etc.) and keeps RLS locked to insert-only.

**You must run this** — the new form sends fields the old table didn't have.
Skip it and every submission fails with a 400 (the page will tell the visitor
to re-run the SQL).

## 2. Credentials already wired
Project `ishjibucgefymikiarko` and its anon public key are already in the
script at the bottom of `index.html`. Nothing to fill in.

## 3. Test
Open the page, submit the form, check Table Editor → applications. Every step
logs to the browser console with an `[apply]` prefix if anything fails.

## Email notifications
See **EMAIL-SETUP.md**. The included Edge Function emails you each new row.

## Still placeholder
- Footer social / Terms / Privacy links are `#`.
- Chuck, Kevin, Alex, Kory, Beverly use monogram tiles (no headshots yet).
  Kevin and Kory share a "K" tile — a real photo for either resolves it.
- Testimonials (Anthony / Shane / Gideon) are adapted from the reference
  structure — swap in real member quotes before launch.

## LA skyline backdrop
A generated night-skyline (SVG, embedded — no external file, not clickable)
sits fixed behind the whole page and drifts upward as you scroll. It shows
through most clearly in the open gaps and the framework / why-now bands, and
stays quiet behind text-heavy sections so copy remains readable.

Want it MORE visible? In index.html, in the `.skyline__wash` rule, lower the
three alpha values (e.g. change `.58 / .34 / .60` to `.40 / .18 / .42`).
Want it more subtle? Raise them toward `.75`.
The file `assets/skyline.svg` is the standalone art if you ever want to swap
in a real photo instead — replace the `url("data:image/svg+xml…")` in the
`.skyline__img` rule with `url("assets/your-photo.jpg")`.
