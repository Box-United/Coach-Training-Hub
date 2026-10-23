-- Migration 007: make dorothy@boxunited.org an admin.
--
-- Run this once in the Supabase SQL editor, after 006. Safe to run twice.
--
-- Unlike 005, this is for an account that ALREADY EXISTS. Dorothy signed up as
-- a coach, so there is no window in which somebody could create the address
-- themselves, and the warning in 005 does not apply here.
--
-- A different one does. READ THE NEXT PART BEFORE RUNNING THIS.
--
-- ------------------------------------------------- reset the password first
--
-- The codeword IS the account's Supabase password (see js/auth.js). Coaches
-- share one, admins have their own, and that separation is the only thing
-- stopping somebody who knows the coach codeword from reaching every coach's
-- records and uploaded documents.
--
-- The coach codeword lives in js/config.js, which is served to the browser and
-- sits in a public repo. So an account created through the coach sign-up path
-- has a password that anybody can read. Flipping is_admin on it, and nothing
-- else, would leave an admin account protected by a publicly known password:
-- the exact hole the two-codeword design exists to prevent.
--
-- So in Authentication -> Users, find dorothy@boxunited.org and change her
-- password to the ADMIN codeword. Then run this. Tell her the new codeword,
-- since the one she has been using will stop working.
--
-- ------------------------------------------------- check the address first
--
-- Both statements below key on the exact address. If the account Dorothy
-- actually signed up with is spelled differently, they will match nothing and
-- report success anyway. Confirm it before running:
--
--   select id, email, is_admin from public.coaches where email ilike '%dorothy%';
--
-- If it comes back as something other than dorothy@boxunited.org, use that
-- address in both statements instead.

-- Keeps the admins in one place, as 004 intended, so the list stays the
-- answer to "who is an admin" and a rebuilt account picks it up on sign-in.
insert into public.admin_emails (email) values
  ('dorothy@boxunited.org')
on conflict (email) do nothing;

-- The actual change. 004's trigger only sets is_admin for accounts created
-- after the address is listed, so an existing account has to be flipped here.
update public.coaches
set is_admin = true
where lower(email) = 'dorothy@boxunited.org'
  and is_admin = false;

-- Check it landed. The first should show Dorothy with is_admin true:
--   select email, is_admin from public.coaches where lower(email) like '%boxunited.org';
--   select * from public.admin_emails;
