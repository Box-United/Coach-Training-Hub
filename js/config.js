// Paste your Supabase project URL and public anon key below.
// Both come from Supabase: Project Settings -> API.
// The anon key is safe to expose in client code, Row Level Security in
// supabase/schema.sql is what actually protects the data.
// Never put your service_role key here, or anywhere in this repo.

const SUPABASE_URL = "https://zceydcttzaxhokrbrypu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZXlkY3R0emF4aG9rcmJyeXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzk4NDQsImV4cCI6MjEwMTYxNTg0NH0.TlUsFWuiTSlbwdifBzy0ZZbJSZJ7c1qwD8Bsi1tc0WA";

// The coach codeword. Checked before a new account is created, so a coach who
// mistypes it is told so rather than silently getting an account with their
// typo as its password, which would lock them out on their next visit.
//
// This file is public, so treat this as a gate rather than a secret: it stops
// mistakes and casual passers-by, not a determined reader. What it protects is
// small, a stranger could watch the training videos. It gets them nothing else:
// Row Level Security keeps every coach to their own records, and admins have a
// separate codeword on accounts that already exist.
//
// Rotate it between seasons, and change it here when you do.
const COACH_CODEWORD = "Fightl1ke8girl!";
