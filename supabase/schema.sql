-- Box United Coach Training Hub — Supabase setup
-- Paste this whole file into the Supabase SQL editor (your project -> SQL Editor -> New query) and run it once.

create table public.coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Coaches redo their training every year, so every progress row belongs to a
-- season. A season is named for the calendar year it starts in: season 2026
-- runs 1 September 2026 to 31 August 2027, what people call "2026-27". On
-- 1 September a coach simply has no rows for the new season and starts from
-- Module 1, while every previous year stays on the table. There is no
-- scheduled job, the rollover falls out of the date.
--
-- Timezone: September 1 has to begin somewhere, and it is US Central below.
-- If Box United is elsewhere, this is the only place it appears.
--
-- The floor: the hub launched partway through August 2026 and everything in
-- it belongs to the 2026-27 season, not to a 2025-26 season that never
-- existed here. greatest() pins that without a special case, and stops
-- mattering once the date passes it on its own.
create function public.current_season()
returns int
language sql
stable
as $$
  select greatest(
    2026,
    case
      when extract(month from (now() at time zone 'America/Chicago')) >= 9
        then extract(year from (now() at time zone 'America/Chicago'))::int
      else extract(year from (now() at time zone 'America/Chicago'))::int - 1
    end
  );
$$;

grant execute on function public.current_season() to authenticated, anon;

create table public.progress (
  coach_id uuid not null references public.coaches(id) on delete cascade,
  module_id int not null,
  video_furthest_seconds int not null default 0,
  -- Furthest second watched, keyed by the video's index within the module
  -- (see `videos` in js/modules-data.js), e.g. {"0": 412, "1": 96}.
  -- video_furthest_seconds above is kept as the total across them.
  video_progress jsonb not null default '{}'::jsonb,
  quiz_score int,
  quiz_attempts int not null default 0,
  passed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  -- Some modules are proved by uploading a document (SafeSport certificate,
  -- Ramp account setup) rather than by a quiz. Uploading unlocks the next
  -- module immediately, but only an admin's approval sets passed = true, so
  -- "can move on" and "is complete" are deliberately different things.
  document_path text,
  document_uploaded_at timestamptz,
  document_status text not null default 'none'
    check (document_status in ('none', 'pending', 'approved', 'rejected')),
  document_reviewed_at timestamptz,
  document_reviewed_by uuid references public.coaches(id),
  season int not null default public.current_season(),
  -- A coach works the modules once per season, so the same module appears
  -- more than once per coach and the season is part of the key.
  primary key (coach_id, module_id, season)
);

create index progress_season_idx on public.progress (season);

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
      and season = public.current_season()
      and (passed = true or document_status in ('pending', 'approved'))
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
-- Admins could otherwise read every progress row but not write one, so
-- approving a document would fail silently.
create policy "Admins update all progress" on public.progress
  for update using (public.is_admin())
  with check (public.is_admin());

-- A completion record should only ever move forward. Enforcing this in the
-- database, not the browser, means stale JavaScript or a hand-written API
-- call cannot wipe out a pass a coach already earned.
-- auth.uid() is null for direct SQL and service_role, so an admin can still
-- reset someone deliberately from the SQL editor.
create function public.protect_progress_record()
returns trigger
language plpgsql
security definer
as $$
declare
  video_key text;
  old_seconds int;
  new_seconds int;
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- A row belongs to the season it was created in, permanently.
  new.season := old.season;

  if old.passed and not new.passed then
    new.passed := true;
    new.completed_at := old.completed_at;
  end if;

  if old.quiz_score is not null
     and (new.quiz_score is null or new.quiz_score < old.quiz_score) then
    new.quiz_score := old.quiz_score;
  end if;

  if new.video_furthest_seconds < old.video_furthest_seconds then
    new.video_furthest_seconds := old.video_furthest_seconds;
  end if;

  -- The same forward-only rule, applied per video. Guarding only the total
  -- above is not enough once a module holds several videos: one video's
  -- position could still be rewound as long as another's rose by more.
  if new.video_progress is null then
    new.video_progress := old.video_progress;
  end if;
  for video_key in select jsonb_object_keys(old.video_progress) loop
    old_seconds := coalesce((old.video_progress ->> video_key)::int, 0);
    new_seconds := coalesce((new.video_progress ->> video_key)::int, 0);
    if new_seconds < old_seconds then
      new.video_progress := jsonb_set(new.video_progress, array[video_key], to_jsonb(old_seconds));
    end if;
  end loop;

  -- Approval is an admin's judgement, never a coach's claim about themselves.
  -- Admins return above, so anything reaching here is a coach, and a coach
  -- asking for 'approved' only ever gets 'pending'.
  if new.document_status = 'approved' and old.document_status is distinct from 'approved' then
    new.document_status := 'pending';
  end if;

  -- An uploaded document should not vanish because of a stale page.
  if old.document_path is not null and new.document_path is null then
    new.document_path := old.document_path;
    new.document_uploaded_at := old.document_uploaded_at;
    new.document_status := old.document_status;
  end if;

  -- Review metadata belongs to whoever reviewed it.
  new.document_reviewed_at := old.document_reviewed_at;
  new.document_reviewed_by := old.document_reviewed_by;

  return new;
end;
$$;

create trigger progress_only_moves_forward
  before update on public.progress
  for each row execute procedure public.protect_progress_record();

-- The forward-only trigger is BEFORE UPDATE, so it never sees a brand new
-- row. This covers the insert, otherwise a coach's first write to a module
-- could claim 'approved' outright.
create function public.guard_progress_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if new.document_status = 'approved' then
    new.document_status := 'pending';
  end if;
  new.document_reviewed_at := null;
  new.document_reviewed_by := null;
  new.season := public.current_season();
  return new;
end;
$$;

create trigger progress_guard_insert
  before insert on public.progress
  for each row execute procedure public.guard_progress_insert();

-- Who gets admin. Anyone on this list becomes an admin the first time they
-- sign in, so the first admin does not need somebody to run a query for them.
create table public.admin_emails (
  email text primary key
);

-- No policies, deliberately. RLS with no policy means no client, coach or
-- admin, can read or write this table through the API. Only the security
-- definer functions can see it, and you, from the SQL editor.
alter table public.admin_emails enable row level security;

insert into public.admin_emails (email) values
  ('alexandra@boxunited.org'),
  ('programs@boxunited.org');

-- Compared lowercased. Email local parts are technically case-sensitive, but
-- nobody treats them that way, and an admin locked out by a capital letter
-- would be a miserable thing to debug.
create function public.email_is_admin(check_email text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_emails where lower(email) = lower(check_email)
  );
$$;

-- Creates a coaches row automatically the first time someone signs in.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.coaches (id, email, is_admin)
  values (new.id, new.email, public.email_is_admin(new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage for module documents: SafeSport certificates, Ramp account proof.
-- Private bucket, so nothing here is reachable without a signed URL that only
-- the owning coach or an admin can mint. Size and type are capped at the
-- bucket itself, the browser-side checks are convenience, not the real limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-documents',
  'coach-documents',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- Files live at <coach_id>/module-<n>/<timestamp>-<filename>, so the first
-- path segment is the owner and every policy below keys on it.
create policy "Coaches upload own documents" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Coaches read own documents" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "Coaches replace own documents" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Deliberately no delete policy. A coach who uploads the wrong file uploads
-- another one, and the progress row points at the newest. Keeping the old
-- files leaves a trail of what was actually submitted and when.

-- To add another admin later:
--   insert into public.admin_emails (email) values ('someone@boxunited.org');
-- and, only if they have already signed in once:
--   update public.coaches set is_admin = true where lower(email) = 'someone@boxunited.org';
