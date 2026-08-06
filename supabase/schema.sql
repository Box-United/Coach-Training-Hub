-- Box United Coach Training Hub — Supabase setup
-- Paste this whole file into the Supabase SQL editor (your project -> SQL Editor -> New query) and run it once.

create table public.coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.progress (
  coach_id uuid not null references public.coaches(id) on delete cascade,
  module_id int not null,
  video_furthest_seconds int not null default 0,
  quiz_score int,
  quiz_attempts int not null default 0,
  passed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (coach_id, module_id)
);

alter table public.coaches enable row level security;
alter table public.progress enable row level security;

-- Runs as the table owner, so it can check is_admin without re-triggering
-- RLS on the same call and causing infinite recursion.
create function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.coaches where id = auth.uid() and is_admin = true
  );
$$;

create policy "Coaches read own row" on public.coaches
  for select using (auth.uid() = id);
create policy "Coaches update own row" on public.coaches
  for update using (auth.uid() = id);
create policy "Admins read all coaches" on public.coaches
  for select using (public.is_admin());

-- RLS above only restricts *which row* a coach can update, not *which
-- column*. Without this, a coach could set is_admin = true on their own
-- row by calling the API directly. Column-level GRANT is what actually
-- stops that: only "name" is writable by a signed-in coach, no matter
-- what a client sends.
revoke update on public.coaches from authenticated;
grant update (name) on public.coaches to authenticated;

-- A coach can only write progress for module 1, or for a module whose
-- predecessor they've already passed. This is what actually enforces
-- sequential unlocking, the module-list UI hiding locked modules is
-- just a convenience on top of this, not the real gate.
create function public.can_write_module(target_coach_id uuid, target_module_id int)
returns boolean
language sql
security definer
stable
as $$
  select target_module_id <= 1 or exists (
    select 1 from public.progress
    where coach_id = target_coach_id
      and module_id = target_module_id - 1
      and passed = true
  );
$$;

create policy "Coaches read own progress" on public.progress
  for select using (auth.uid() = coach_id);
create policy "Coaches insert own progress" on public.progress
  for insert with check (auth.uid() = coach_id and public.can_write_module(coach_id, module_id));
create policy "Coaches update own progress" on public.progress
  for update using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id and public.can_write_module(coach_id, module_id));
create policy "Admins read all progress" on public.progress
  for select using (public.is_admin());

-- Creates a coaches row automatically the first time someone signs in.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.coaches (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- To make a coach an admin after they've signed in once:
-- update public.coaches set is_admin = true where email = 'coordinator@boxunited.org';
