-- Migration 004: name the admins up front.
--
-- Before this, is_admin had to be set by hand in the SQL editor after someone
-- had signed in at least once, which meant the first admin could not reach
-- admin.html until somebody ran a query for them.
--
-- Now the addresses live in a table, and a coach whose address is on it
-- becomes an admin the moment they first sign in. Adding an admin later is one
-- insert, no function editing.
--
-- Run this once in the Supabase SQL editor, after 001 to 003. Safe to run twice.

create table if not exists public.admin_emails (
  email text primary key
);

-- No policies, deliberately. RLS with no policy means no client, coach or
-- admin, can read or write this table through the API. Only the security
-- definer functions below can see it, and you, from the SQL editor.
alter table public.admin_emails enable row level security;

insert into public.admin_emails (email) values
  ('alexandra@boxunited.org'),
  ('programs@boxunited.org')
on conflict (email) do nothing;

-- Addresses are compared lowercased. Email local parts are technically
-- case-sensitive, but nobody treats them that way, and an admin locked out by
-- a capital letter would be a miserable thing to debug.
create or replace function public.email_is_admin(check_email text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(check_email)
  );
$$;

-- Creates the coaches row on first sign-in, now with admin already set.
create or replace function public.handle_new_user()
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

-- Anyone already signed in when this runs still needs upgrading, since the
-- trigger above only fires for new accounts.
update public.coaches c
set is_admin = true
where public.email_is_admin(c.email)
  and c.is_admin = false;

-- To add another admin later:
--   insert into public.admin_emails (email) values ('someone@boxunited.org');
--   update public.coaches set is_admin = true where lower(email) = 'someone@boxunited.org';
--
-- The second line is only needed if they have already signed in once.
