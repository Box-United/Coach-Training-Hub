-- Migration 003: training seasons, so coaches redo their training every year.
--
-- Coaches recertify annually (SafeSport expires yearly), so every September 1
-- everyone starts the training over. Rather than deleting last year's records,
-- each progress row is stamped with the season it belongs to. Come September a
-- coach simply has no rows for the new season, so they start from Module 1,
-- and every previous year stays on the table.
--
-- That matters for safeguarding: "was this coach SafeSport certified during
-- the 2026-27 season" has to be answerable years later. A reset that deleted
-- rows would destroy exactly the evidence you would need.
--
-- There is deliberately no scheduled job. The current season is derived from
-- today's date, so the rollover happens on its own and there is nothing to
-- fail at 3am on September 1.
--
-- Run this once in the Supabase SQL editor, after 001 and 002. Safe to run twice.

-- ------------------------------------------------------------- the season

-- A season is named for the calendar year it starts in: season 2026 runs from
-- 1 September 2026 to 31 August 2027, and is what people call "2026-27".
--
-- Two things worth knowing before changing this:
--
--   Timezone. September 1 has to begin somewhere. It is set to US Central
--   below, so the rollover happens at midnight Central. If Box United is
--   somewhere else, change the timezone string, it is the only place it
--   appears.
--
--   The floor. The hub launched partway through August 2026, and everything
--   in it belongs to the 2026-27 season rather than to a 2025-26 season that
--   never existed here. greatest() pins that without special-casing: before
--   1 September 2026 the calculation gives 2025 and the floor lifts it to
--   2026, and from that date on the calculation takes over on its own. It
--   never needs revisiting.
create or replace function public.current_season()
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

-- ------------------------------------------------------------- progress

alter table public.progress add column if not exists season int;

-- Anything already on the table was written during the build, which belongs
-- to the launch season.
update public.progress set season = 2026 where season is null;

alter table public.progress alter column season set not null;
alter table public.progress alter column season set default public.current_season();

-- A coach works through the modules once per season, so the same module can
-- appear more than once per coach and the season has to be part of the key.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'progress_pkey' and conrelid = 'public.progress'::regclass
  ) then
    alter table public.progress drop constraint progress_pkey;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'progress_season_pkey' and conrelid = 'public.progress'::regclass
  ) then
    alter table public.progress
      add constraint progress_season_pkey primary key (coach_id, module_id, season);
  end if;
end;
$$;

create index if not exists progress_season_idx on public.progress (season);

-- ------------------------------------------------------------ unlock rule

-- Unchanged signature, so none of the RLS policies that call it need
-- rewriting. It now only looks at the season in progress: last year's pass
-- must not unlock this year's Module 2.
create or replace function public.can_write_module(target_coach_id uuid, target_module_id int)
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

-- --------------------------------------------------------------- guards

-- Adds season handling to migration 002's guard. A coach must not be able to
-- write into a season other than the one running: backdating would rewrite
-- history, and post-dating would pre-pass a year that has not started.
create or replace function public.guard_progress_insert()
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

create or replace function public.protect_progress_record()
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

-- Lets the browser ask which season is running without duplicating the rule.
grant execute on function public.current_season() to authenticated, anon;
