-- Migration 006: who turned up to the in-person training.
--
-- Run this once in the Supabase SQL editor, after 005. Safe to run twice.
--
-- Deliberately NOT joined to the coaches table. Some people on this list have
-- not made an account yet, and a few never will, so tying attendance to
-- auth.uid() would mean they simply could not be recorded. The roster is
-- plain text: whatever an admin types is the key, and it stands on its own.
--
-- That does mean nothing stops two spellings of the same person existing as
-- two rows. Admins can delete a row from the page, which is the fix.

create table if not exists public.inperson_attendance (
  season     int  not null,
  person     text not null,
  status     text check (status in ('attended', 'excused')),
  updated_at timestamptz not null default now(),
  primary key (season, person)
);

alter table public.inperson_attendance enable row level security;

-- Admins only, for everything. A coach has no business reading the register,
-- let alone marking themselves present, so there is no coach-facing policy
-- here at all: with RLS on and no policy matching them, the table does not
-- exist as far as a coach's session is concerned.
create policy "Admins read attendance" on public.inperson_attendance
  for select using (public.is_admin());

create policy "Admins insert attendance" on public.inperson_attendance
  for insert with check (public.is_admin());

create policy "Admins update attendance" on public.inperson_attendance
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete attendance" on public.inperson_attendance
  for delete using (public.is_admin());

-- The roster as it stood for the Fall 2026 in-person training, unmarked.
-- Season 2026 is the 2026-27 year, matching public.current_season().
--
-- Status is left null on purpose: this seeds who is on the list, not who
-- turned up. Tick them off on admin.html.
insert into public.inperson_attendance (season, person) values
  (2026, 'pacanty'),
  (2026, 'kjeter'),
  (2026, 'sblackwell'),
  (2026, 'dlwhitlock'),
  (2026, 'alexisuribe'),
  (2026, 'huntleigh'),
  (2026, 'dzepeda'),
  (2026, 'jchacon'),
  (2026, 'mjscovic'),
  (2026, 'srnavarro'),
  (2026, 'bwaits'),
  (2026, 'gnewquist')
on conflict (season, person) do nothing;

-- Check it landed:
--   select person, status from public.inperson_attendance where season = 2026 order by person;
