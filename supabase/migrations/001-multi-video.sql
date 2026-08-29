-- Migration 001: let a module hold more than one video.
--
-- Run this once in the Supabase SQL editor (SQL Editor -> New query) if your
-- project was created before this change. A project set up fresh from
-- supabase/schema.sql already includes everything here, skip it.
--
-- Safe to run twice.

-- Furthest second watched per video, keyed by the video's index within the
-- module. video_furthest_seconds stays as the total across them, so the admin
-- view keeps working unchanged.
alter table public.progress
  add column if not exists video_progress jsonb not null default '{}'::jsonb;

-- Existing rows predate multi-video modules, so whatever they tracked was
-- always the first video.
update public.progress
set video_progress = jsonb_build_object('0', video_furthest_seconds)
where video_furthest_seconds > 0
  and video_progress = '{}'::jsonb;

-- Replace the forward-only guard with the version that also protects each
-- video's position. The trigger already refers to this function by name, so
-- it does not need recreating.
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

  return new;
end;
$$;
