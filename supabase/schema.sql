-- UAT Runner schema. Run once in the Supabase SQL editor for project
-- soobmldsdtrybhfjjpti (or via the CLI).

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client text not null,
  title text not null,
  prototype_url text not null,
  intro text,
  tasks jsonb not null default '[]', -- [{ title, instruction, focus: string[] }]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table rounds enable row level security;

-- Anyone (anon) can read rounds: the runner + landing are public.
drop policy if exists "public read" on rounds;
create policy "public read" on rounds
  for select
  using (true);

-- Only signed-in admins (Supabase Auth) can write. Provision admin users in
-- the dashboard under Authentication > Users; keep public sign-up disabled.
drop policy if exists "authenticated write" on rounds;
create policy "authenticated write" on rounds
  for all
  to authenticated
  using (true)
  with check (true);
