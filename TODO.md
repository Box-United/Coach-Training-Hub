# Punch List — Coach Training Hub

Working list of what's left. Last updated 2026-08-29.

Status key: **[ ]** not started · **[~]** in progress · **[x]** done

---

## Blocking Module 1

Module 1 is the test case for the whole flow. Nothing else can be properly tested until it's real.

- [x] **Module 1 video, Part 1** — `nMWrlm9056g`, "Box United Intro: GOA", 2m 16s. Confirmed unlisted, and verified embeddable against the YouTube player API.
- [x] **Module 1 video, Part 2** — `Y0aNlDOYW3w`, "Coach Welcome", 9m 26s. This is where most of Module 1's questions come from, so the module is now internally consistent. — record and upload as **Unlisted** (not Private, Private can't be embedded). Then paste the ID into the commented-out slot in `js/modules-data.js`.
- [x] **Module 1 quiz questions** — seven questions written from the coach onboarding transcript, replacing the scaffolding placeholders.
- [ ] **Run the database migrations** — in Supabase → SQL Editor → Run, in this order:
  1. `supabase/migrations/001-multi-video.sql` — per-video progress column.
  2. `supabase/migrations/002-document-uploads.sql` — document columns, the `coach-documents` storage bucket, and its policies.
  3. `supabase/migrations/003-training-seasons.sql` — the season stamp and the annual September reset. This one changes the `progress` primary key, so run it when nobody is mid-module.
  4. `supabase/migrations/004-admin-emails.sql` — makes `alexandra@boxunited.org` and `programs@boxunited.org` admins automatically on first sign-in.

  Neither is optional now: without 002, Modules 3 and 9 cannot accept uploads at all. Make sure you're in the **Coach Training Hub** project, not **Student Data**.
- [x] **SafeSport link and instructions** — in, with the enrollment key, the eight steps, and the note that an existing 2026 certificate can be uploaded without redoing the training.
- [x] **SafeSport renewals** — handled by the annual season reset. Everyone redoes the whole training each September, so certificates never go stale in place.
- [ ] **Confirm the season timezone.** `public.current_season()` starts September 1 at midnight **US Central**. If Box United runs on a different clock, change the timezone string in `supabase/schema.sql` and migration 003. Only matters at the 2027 rollover, so there's time.

### Check while writing Part 2

Module 1's description promises "the mission, the gym rules, and what makes Box United different." Part 1 is a 2m16s intro, which probably doesn't cover the gym rules. Either Part 2 covers the rest, or the module description needs to change to match what's actually on camera. The quiz has to match both videos, since the quiz doesn't unlock until both are watched.

---

## Coach home page

- [ ] **Rewrite the key dates for a coach audience.** The dates you sent were written for whoever registers a school, not for the coach reading them: "*your* coach completes it", "send us your coach's name in **step three**", "give us a time in **step four**". I rewrote them to address the coach directly and dropped the step references, since a coach has no form with steps in it. Two things to settle:
  - Does the coach need to do anything about the equipment drop-off time and the in-person training seat, or does their school contact handle both? If the coach does, they need real instructions in place of "step three" and "step four".
  - Should a coach even see the September 5 school-registration deadline? It is not something they can act on.
- [ ] **Review the welcome message.** `js/season-info.js` has my draft, written in the house voice. It is the first thing every coach reads, so it should be yours.
- [ ] **Update key dates each September.** They do not clear with the season rollover.
- [ ] **Decide about calendar links for the other four dates.** Only Sept 12 has one, so the rest cannot be added to a coach's calendar in one click. Send me the invite links and I'll paste them in, or say the word and I'll put the all-dates download button back.
- [ ] **`js/calendar.js` is now unused.** It built the .ics for the download button that was removed. Delete it, or keep it if the button might come back. Nothing references it either way.
- [x] **Admins reaching `admin.html`** — the training page now shows admins a note with a link to it.
- [ ] **`preview.html` is now publicly reachable** at https://box-united.github.io/Coach-Training-Hub/preview.html. Decide whether to keep it. It renders the pages with made-up data for looking at layout without signing in. It has no Supabase client on it so it cannot reach real data, but it will be publicly reachable on GitHub Pages if left in.

---

## Never tested end to end

The full coach journey has **never been run by a real signed-in user**. This is the biggest unknown in the project.

- [ ] **Sign in as a coach** and confirm the magic link arrives and works.
- [ ] **Watch Module 1** and confirm: both videos render, seek-blocking snaps back when you scrub ahead, and the quiz stays locked until both are finished.
- [ ] **Take the quiz** and confirm the score saves ("Result saved." appears, not the error).
- [ ] **Confirm Module 2 unlocks** after passing Module 1.
- [ ] **Check the admin view** shows your progress, and that CSV export works.
- [ ] **Test the Sept 12 calendar link** — confirm it opens the right event and adds it correctly.
- [ ] **Test the season rollover** — nothing should reset on 1 Sept 2026. Worth a sanity check after migration 003 runs, since the whole training year hangs off it.
- [ ] **Test the upload flow end to end** — upload a document on Module 3 or 9, confirm it appears in "Documents to Review" on `admin.html`, that "View file" opens it, and that approving flips the module to Complete.
- [ ] **Test that a coach cannot approve themselves** — the database triggers should force `approved` back to `pending` for a non-admin. Worth confirming once against the real database, since it's the guard that matters most on the SafeSport module.

Note: multi-video rendering and the quiz gate are written but unverified in a real session — reaching `module.html` requires a magic-link sign-in, which can't be done from the dev environment.

---

## Content for Modules 2–10

All nine are titled and described in `js/modules-data.js` but have no video and no questions.

- [ ] Module 2 — Agreement and Pay
- [~] Module 3 — Ramp Set Up — upload is in. Will also have a video and questions, both still needed.
- [x] Module 4 — Child Protection Policy — video (`vvCS1KZQVVw`, 10m 27s) and all five knowledge checks from the script, set to require 100%.
- [x] **Module 4 acknowledgment** — signed in the Charity Rescue platform, not here. The module page now says so. Note that the hub does not track whether it was actually signed, so Module 4 completes on the quiz alone.
- [x] Module 9 — SafeSport Training — complete, needs no video or quiz.
- [x] Module 6 — Attendance System, Charity Rescue — video (`qaB8wG07aik`, 9m 14s) and five questions from the staff training script, at the default 80% (4 of 5).
- [x] Module 6 — 2026-27 Schedule — video (`MqW9l5pXYlM`, 2m 23s) and five questions.
- [x] Module 7 — Equipment — video (`2e8OAbL1Hug`, 2m 9s) and five questions.
- [ ] Module 10 — Behavior Management — listed as coming Spring 2027. It sits last, blocks nothing, and is excluded from the completion count, so coaches can still reach 100%. Delete the `comingSoon` line in `js/modules-data.js` when it is built.
- [ ] Module 9 — Monitoring and Evaluation
- [x] Module 10 — Magic Moments in Fight Like a Girl — both videos in (Guidara TED talk, then the announcement) and five questions across the pair. — first video in (`bwcyXcOpWVs`, 13m 54s, the Will Guidara TED talk). Needs a second video and quiz questions.

- [ ] **Confirm two module descriptions.** Titles are exactly as given, and descriptions are written for all nine. Two are deliberately vague because the topic wasn't clear enough to write honestly:
  - **Module 3, "Ramp Set Up"** — is "ramp" a physical ramp, ramping *up* a new coach or intake, or the RAMP warm-up protocol (Raise, Activate, Mobilise, Potentiate)? Each needs a different description.
  - **Module 6, "Charity Rescue"** — the video is titled "Charity Rescue: Staff Training", so I've assumed Charity Rescue is the attendance system itself rather than a separate topic, and rewritten the description to match. Confirm, or correct me.

---

## Before real coaches use it

- [ ] **URGENT: extend magic link expiry to 24 hours.** Supabase Dashboard → Authentication → Providers → Email → **Email OTP Expiration** (in some dashboard versions this lives under Authentication → Emails). Default is 3600 seconds (1 hour). Set it to **86400**, which is 24 hours and also the maximum Supabase permits.
- [ ] **URGENT: custom SMTP — this is now blocking testing.** The built-in service has already been rate limited once during setup. Supabase's built-in email allows only a few auth emails per hour *project-wide*. With a full roster signing in, you'll hit the limit immediately and coaches will get no link at all. Set up Resend / SendGrid / Postmark / Mailgun / Google Workspace under Project Settings → Authentication → SMTP Settings, with a Box United sender address.
- [x] **Published to GitHub Pages** — live at https://box-united.github.io/Coach-Training-Hub/, served from `main`. Every push redeploys.
- [ ] **URGENT: add the live URL to Supabase Redirect URLs.** Authentication → URL Configuration → add `https://box-united.github.io/Coach-Training-Hub/`. The site is live and its sign-in form works, so until this is set, anyone who tries to sign in gets a link that bounces.
- [ ] **Make yourself an admin** — sign in through the real site once so your `coaches` row exists, then run:
      `update public.coaches set is_admin = true where email = 'you@boxunited.org';`
- [ ] **Custom domain** (optional) — add a `CNAME` file, point DNS, then add the domain to Supabase Redirect URLs too.
- [ ] **Bump `?v=` before deploying.** Currently at `v=4` locally; `v=3` is what's committed. Browsers cache JS and CSS hard — skip this and coaches keep seeing old questions with no clue anything changed.

---

## Known limits, decided and accepted

Not bugs, just things to be aware of.

- **Seek-blocking is good faith, not tamperproof.** It stops casual scrubbing. Someone editing the page or calling the YouTube API directly can bypass it. Sequential module unlocking *is* real — it's enforced by Row Level Security in the database.
- **Unlisted YouTube links are public to anyone holding the URL.** If a coach forwards a link, it's out. Accepted in exchange for free, adaptive-quality hosting — see the Supabase Storage comparison we did on 2026-08-29.
- **Swapping a video after coaches have watched it needs a manual reset.** Watched position is stored per coach and doesn't clear itself. See "Swapping a video out later" in the README for the SQL, including the warning that resetting `passed` re-locks every downstream module.

---

## Nice to have, not urgent

- [ ] **Throttle video progress writes.** Currently one database write per second per playing video (~136 writes for the Part 1 intro alone). Harmless at this scale but wasteful; batching to every 5–10 seconds would cut it by an order of magnitude.
- [ ] **Deferred from the original brief:** the season resource library, the dashboard overview page, and the sidebar navigation explored in `design-mockup.html`.
