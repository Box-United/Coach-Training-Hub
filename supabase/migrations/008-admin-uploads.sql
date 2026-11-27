-- Migration 008: let an admin upload a document on a coach's behalf.
--
-- Run this once in the Supabase SQL editor, after 007. Safe to run twice.
--
-- Coaches sometimes email their proof (a Ramp screenshot, a SafeSport
-- certificate) instead of uploading it. Until now the only way to record that
-- was by hand in Storage and the SQL editor, because the storage policies let
-- a coach write only into their own folder and nobody else, admins included.
-- admin.html now has an upload control in each upload module's panel, and it
-- needs two things it could not do before:
--
--   1. Put a file into another coach's folder in coach-documents.
--   2. Create a progress row for a coach who has not started that module yet.
--      Updating an existing row was already allowed ("Admins update all
--      progress"), but a coach who emails proof before opening the module has
--      no row to update.
--
-- Neither touches what a coach can do. Both key on public.is_admin(), the
-- same check every other admin policy uses, and the insert/update triggers
-- already stand aside for admins, so an admin's 'approved' stays approved.

drop policy if exists "Admins upload coach documents" on storage.objects;
create policy "Admins upload coach documents" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'coach-documents'
    and public.is_admin()
  );

drop policy if exists "Admins insert progress" on public.progress;
create policy "Admins insert progress" on public.progress
  for insert with check (public.is_admin());
