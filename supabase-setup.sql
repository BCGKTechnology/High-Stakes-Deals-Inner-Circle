-- ============================================================
--  High Stakes Deals Inner Circle — application intake
--  Full schema. Safe to run on a fresh project OR on top of the
--  earlier version: every add is IF NOT EXISTS / idempotent.
--  Supabase → SQL Editor → New query → Run
-- ============================================================

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  full_name     text not null check (char_length(full_name) between 1 and 120),
  email         text not null check (char_length(email)     between 3 and 160),
  phone         text        check (char_length(phone) <= 40),
  source        text        default 'high-stakes-landing',
  status        text        not null default 'new'
                            check (status in ('new','reviewing','called','accepted','declined'))
);

-- ── qualifying-application fields ───────────────────────────
alter table public.applications add column if not exists goals            text;
alter table public.applications add column if not exists owns_real_estate text;
alter table public.applications add column if not exists portfolio        text;
alter table public.applications add column if not exists ready_to_invest  text;
alter table public.applications add column if not exists capital          text;
alter table public.applications add column if not exists following        text;
alter table public.applications add column if not exists sms_consent      boolean default false;

-- legacy columns from the earlier multifamily version — kept nullable
alter table public.applications add column if not exists units_owned  text;
alter table public.applications add column if not exists target_units text;
alter table public.applications add column if not exists bottleneck   text;

create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_status_idx     on public.applications (status);

-- ── Row level security ──────────────────────────────────────
alter table public.applications enable row level security;

drop policy if exists "public can submit an application" on public.applications;
create policy "public can submit an application"
  on public.applications for insert to anon with check (true);

-- Uncomment to let signed-in teammates read submissions in-app:
-- drop policy if exists "team can read applications" on public.applications;
-- create policy "team can read applications"
--   on public.applications for select to authenticated using (true);

-- ── Verify ──────────────────────────────────────────────────
-- select column_name, data_type from information_schema.columns
--   where table_name = 'applications' order by ordinal_position;
