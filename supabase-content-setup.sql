-- ============================================================
--  High Stakes Deals — editable site content + admin access
--  Run in Supabase → SQL Editor AFTER supabase-setup.sql
-- ============================================================

-- One row holds the whole site content as JSON (id = 'main').
create table if not exists public.site_content (
  id          text primary key default 'main',
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- seed the single row if absent
insert into public.site_content (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- keep updated_at fresh
create or replace function public.touch_site_content()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_touch_site_content on public.site_content;
create trigger trg_touch_site_content
  before update on public.site_content
  for each row execute function public.touch_site_content();

-- ── Row level security ──────────────────────────────────────
-- PUBLIC (anon) may READ content so the live site can render it.
-- Only AUTHENTICATED users (your admin login) may WRITE.
alter table public.site_content enable row level security;

drop policy if exists "anyone can read site content" on public.site_content;
create policy "anyone can read site content"
  on public.site_content for select to anon, authenticated using (true);

drop policy if exists "authenticated can update site content" on public.site_content;
create policy "authenticated can update site content"
  on public.site_content for update to authenticated using (true) with check (true);

drop policy if exists "authenticated can insert site content" on public.site_content;
create policy "authenticated can insert site content"
  on public.site_content for insert to authenticated with check (true);

-- ── Storage bucket for editable media (photos/posters) ──────
-- Public read so the site can show images; authenticated write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 209715200,
        array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
              'video/mp4','video/webm','video/quicktime'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read site media" on storage.objects;
create policy "public read site media"
  on storage.objects for select
  using ( bucket_id = 'site-media' );

drop policy if exists "authenticated manage site media" on storage.objects;
create policy "authenticated manage site media"
  on storage.objects for all to authenticated
  using ( bucket_id = 'site-media' )
  with check ( bucket_id = 'site-media' );

-- ── Create your admin user ──────────────────────────────────
-- Supabase dashboard → Authentication → Users → Add user.
-- Use email + password, tick "Auto Confirm". That's your login.
-- (Optional) lock signups off under Authentication → Providers → Email.

-- ── Verify ──────────────────────────────────────────────────
-- select id, updated_at from public.site_content;
-- select policyname, cmd, roles from pg_policies where tablename='site_content';
