-- Migration 005: add marykate@boxunited.org as an admin.
--
-- Run this once in the Supabase SQL editor, after 004. Safe to run twice.
--
-- READ THIS FIRST IF THE ACCOUNT DOES NOT EXIST YET.
--
-- Being on admin_emails does not create the account, it only says that
-- whoever ends up holding that address is an admin. Sign-in creates an account
-- on the spot for anyone who types a valid coach codeword (see js/auth.js), so
-- between running this and Mary Kate actually signing in, anybody who knows
-- the coach codeword could create marykate@boxunited.org themselves and
-- inherit admin rights over every coach's records and uploaded documents.
--
-- So create the account first, in Authentication -> Users -> Add user, with
-- the ADMIN codeword and auto-confirm ticked. Then run this. Once the account
-- exists, sign-in checks the password and the hole closes.
--
-- This is the same warning as step 7 of the README, and it is the one step
-- that is genuinely not optional.

insert into public.admin_emails (email) values
  ('marykate@boxunited.org')
on conflict (email) do nothing;

-- Only does anything if the account already exists. The trigger from 004 sets
-- is_admin for accounts created after this point, but it cannot reach back to
-- one that signed in before the address was on the list.
update public.coaches
set is_admin = true
where lower(email) = 'marykate@boxunited.org'
  and is_admin = false;

-- Check it landed:
--   select email, is_admin from public.coaches where lower(email) like '%boxunited.org';
--   select * from public.admin_emails;
