-- Migration 002: modules that are proved by uploading a document.
--
-- Some training happens somewhere else (SafeSport, setting up a Ramp payment
-- account). For those modules a coach uploads a certificate or a screenshot
-- instead of taking a quiz.
--
-- Uploading lets the coach move straight on to the next module, but the module
-- does not count as complete until an admin approves the document. So
-- "unlocks the next module" and "is complete" stop being the same thing:
--   passed          = an admin approved it, this is what shows as Complete
--   document_status = where the document is up to, this is what unlocks
--
-- Run this once in the Supabase SQL editor. Safe to run twice.

-- ---------------------------------------------------------------- progress

alter table public.progress
  add column if not exists document_path text,
  add column if not exists document_uploaded_at timestamptz,
  add column if not exists document_status text not null default 'none',
  add column if not exists document_reviewed_at timestamptz,
  add column if not exists document_reviewed_by uuid references public.coaches(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'progress_document_status_check'
  ) then
    alter table public.progress
      add constraint progress_document_status_check
      check (document_status in ('none', 'pending', 'approved', 'rejected'));
  end if;
end;
$$;

-- ------------------------------------------------------------ unlock rule

-- A pending document is enough to move on. Waiting on an admin to review a
-- certificate should not stop a coach working through the rest of training.
-- A rejected one is not enough, so a coach who uploaded the wrong thing goes
-- back to being blocked until they replace it.
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
      and (passed = true or document_status in ('pending', 'approved'))
  );
$$;

-- ------------------------------------------------------- admins can review

-- Admins could already read every progress row, but not write one, so
-- approving a document from admin.html would have failed silently.
drop policy if exists "Admins update all progress" on public.progress;
create policy "Admins update all progress" on public.progress
  for update using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------- forward only

-- Extends migration 001's guard to cover uploaded documents, and stops a
-- coach approving their own certificate by calling the API directly.
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

-- The trigger above is BEFORE UPDATE, so it never sees a brand new row. This
-- covers the insert, otherwise a coach's very first write to a module could
-- claim 'approved' outright.
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
  return new;
end;
$$;

drop trigger if exists progress_guard_insert on public.progress;
create trigger progress_guard_insert
  before insert on public.progress
  for each row execute procedure public.guard_progress_insert();

-- ------------------------------------------------------------- storage

-- Private bucket. Nothing in here is reachable without a signed URL, which
-- only the owning coach or an admin can mint. Size and type are capped at the
-- bucket, so the browser-side checks are convenience, not the real limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-documents',
  'coach-documents',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Files are stored at <coach_id>/module-<n>/<timestamp>-<filename>, so the
-- first path segment is the owner and every policy below keys on it.
drop policy if exists "Coaches upload own documents" on storage.objects;
create policy "Coaches upload own documents" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coach-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Coaches read own documents" on storage.objects;
create policy "Coaches read own documents" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'coach-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "Coaches replace own documents" on storage.objects;
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
