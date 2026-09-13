# Box United — Coach Training Hub

**Live at [box-united.github.io/Coach-Training-Hub](https://box-united.github.io/Coach-Training-Hub/)**, served from `main` by GitHub Pages. Every push to `main` redeploys it.

A static coach training site: shared-codeword sign-in, a gated video-plus-quiz module for each week of training, the season's weekly session plans once that training is done, and an admin view of who's completed what. Hosted on GitHub Pages, backed by Supabase.

This first version has one module fully wired end to end (Module 1), so the whole flow, sign-in, video, quiz, Supabase write, admin view, can be tested before the remaining nine modules get their real videos and questions.

The season resource library from the original brief is now the weekly curriculum, see below. Still deferred to a follow-up phase: the dashboard overview page and the sidebar navigation explored in `design-mockup.html`. Those aren't part of the brief's core loop and can be added once this is live.

## Local preview

This is plain HTML/CSS/JS, no build step. Because it fetches from Supabase and loads the YouTube API, open it through a local server rather than double-clicking the file:

```bash
npx serve .
```

or, with Python installed:

```bash
python -m http.server 8000
```

Then visit the printed local address.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor -> New query**, paste in the entire contents of `supabase/schema.sql`, and run it. If your project predates these features, also run everything in `supabase/migrations/` in order (`001-multi-video.sql`, then `002-document-uploads.sql`), which brings an existing database up to date. That creates the `coaches` and `progress` tables, Row Level Security policies, and the trigger that adds a coach row the first time someone signs in.
3. Go to **Authentication -> Providers**, confirm **Email** is enabled, and **turn "Confirm email" off**. Sign-in is email plus a codeword, and a coach signing in for the first time has their account created on the spot. With confirmation on, that sign-up leaves them without a session and they bounce back to the form.
4. Go to **Authentication -> URL Configuration**. These two fields do different jobs and mixing them up is what sends people to localhost:

   - **Site URL** is the single fallback destination. Supabase uses it whenever a request does not name a redirect, or names one that is not allowed. It ships as `http://localhost:3000`, which is why an unconfigured project bounces sign-ins to a dead local address.
   - **Redirect URLs** is the allowlist. Anything the site asks for has to match an entry here or it is discarded, and Supabase falls back to the Site URL.

   Set Site URL to `https://programs.boxunited.org`, and add these to Redirect URLs:

   ```
   https://programs.boxunited.org/**
   https://box-united.github.io/Coach-Training-Hub/**
   http://localhost:8123/**
   ```

   The GitHub Pages entry is worth keeping while DNS settles, and the localhost one lets sign-in work when running the site locally. Codeword sign-in does not send email and so does not redirect at all, but password resets and any future email flow do, so these still need to be right.
5. Go to **Project Settings -> API** and copy your Project URL and `anon` `public` key.
6. Open `js/config.js` and paste those two values in. Never paste the `service_role` key anywhere in this repo, only the `anon` key belongs in client code.
7. **Create the admin accounts before anyone else signs in.** In **Authentication -> Users -> Add user**, add `alexandra@boxunited.org` and `programs@boxunited.org` with the admin codeword, and tick auto-confirm. This is not optional: a coach signing in for the first time has their account created with whatever codeword they typed, so if an admin address has no account yet, anyone knowing the coach codeword could create it and inherit admin rights over every coach's records and uploaded documents.

8. Admins are named in the `admin_emails` table, created by `supabase/migrations/004-admin-emails.sql`. `alexandra@boxunited.org`, `programs@boxunited.org` and `marykate@boxunited.org` (the last added by `005-add-marykate-admin.sql`) are in it already, and anyone on that list becomes an admin the first time they sign in, no manual step. **Create the Supabase account before adding the address**, for the reason in step 7: until the account exists, anyone with the coach codeword can create it and inherit admin rights. To add another:
   ```sql
   insert into public.admin_emails (email) values ('someone@boxunited.org');
   -- only needed if they have already signed in at least once:
   update public.coaches set is_admin = true where lower(email) = 'someone@boxunited.org';
   ```

## The coach codeword

Sign-in is email plus a codeword. The codeword is the account's Supabase password, so Supabase does the checking.

`COACH_CODEWORD` in `js/config.js` is checked **before** a new account is created. Without that check, a coach who mistypes on their first ever sign-in would have the typo saved as their password: they get in that day and are locked out on their next visit, with nothing explaining why.

That means the coach codeword sits in a public file. Treat it as a gate rather than a secret. What it protects is small: a stranger who found it could watch the training videos and nothing else, because Row Level Security keeps every coach to their own records and admins have a separate codeword on accounts that already exist. It is also going to forty people, so it was never going to stay private.

If you want it airtight, the alternative is to turn off public sign-up in Supabase and create every coach account yourself with the codeword. Then only addresses you have loaded can sign in at all, and nothing needs to live in this file. The cost is maintaining the roster by hand, including mid-season additions.

Rotate the codeword between seasons and update `js/config.js` when you do. The September reset is a natural moment.

## Email: set up custom SMTP before real coaches use this

Supabase's built-in email service is for testing only and allows just a few auth emails per hour project-wide. Past that, sign-in requests fail with `429 email rate limit exceeded` and coaches get no link. With a full roster signing in, you will hit this immediately.

Before launch, go to **Project Settings -> Authentication -> SMTP Settings** and connect a real sender. Using Resend:

1. Create a Resend account, then **Domains -> Add Domain**. Use a subdomain such as `send.boxunited.org` rather than the root. Resend recommends this to keep sending reputation separate, and it means you are not editing the SPF record your normal Box United mail depends on.
2. Add the DNS records Resend shows you (a return-path MX, an SPF TXT, and a DKIM TXT) wherever `boxunited.org` DNS is managed. Verification takes anywhere from a few minutes to a few hours.
3. **API Keys -> Create API Key**, with sending permission. It is shown once. It is a credential, so it belongs only in the Supabase SMTP form, not in this repo, not in chat, not in a doc.
4. Fill in Supabase's SMTP settings:

   | Field | Value |
   | --- | --- |
   | Host | `smtp.resend.com` |
   | Port | `465` (implicit SSL/TLS; `587` also works for STARTTLS) |
   | Username | `resend` |
   | Password | your Resend API key |
   | Sender email | an address at the verified domain, e.g. `noreply@send.boxunited.org` |
   | Sender name | `Box United` |

   The sender address has to be at the domain you verified. Anything else is rejected.
5. Then go to **Authentication -> Rate Limits** and raise the emails-per-hour limit. It stays low until custom SMTP is connected, and the default afterwards is still well below a full roster signing in at once.

A verified domain is not optional: Resend will not send from a shared or public domain. There is no way to skip step 2 and still email real coaches.

Until that is configured, expect to wait out the rate limit between test sign-ins.

## The pages

| Page | What it is |
| --- | --- |
| `index.html` | Signed out, the magic-link sign-in. Signed in, the home page: welcome and the season's key dates. |
| `training.html` | How far a coach has got, and the module list. |
| `module.html?id=N` | One module: its videos, its quiz, and any document it asks for. |
| `resources.html` | Training documents, handouts, and recruitment links. Open to anyone signed in. |
| `curriculum.html` | The season's ten session weeks. Opens once training is complete. |
| `week.html?n=N` | One week: its practice plan and what to bring. Videos here are open to every coach, gates or not. |
| `admin.html` | Documents waiting on review, and the progress table. Admins only. |

The magic link lands on `index.html`, so that is the page that redraws itself once a session appears. The top bar comes from `js/nav.js` so the navigation cannot drift between pages. It carries a link out to Charity Rescue, because attendance and the assessment results are required every season and both are done there rather than here, and `admin.html` is not linked from it, you reach it by URL or from the note on the training page.

**Admins see more.** For anyone with `is_admin`, the sequential lock and the watch-the-whole-video gate both stand aside, so every module can be opened and reviewed, including ones no coach has unlocked yet. Locked cards on the training page gain a "Preview" link. Both pages say plainly that what is on screen is not what a coach would see.

There used to be a `preview.html` that rendered every page with made-up data and no sign-in, for looking at layout before the database was set up. It was removed once sign-in worked, because it was publicly reachable and no longer needed: an admin can open every module through the real site, and a private window with a test account shows the coach view. It is in the git history if it is ever wanted back.

## The coach home page

Signed-in coaches land on a welcome, the season's key dates, and a button through to their training.

The home page also shows a month grid for the season, built by `js/calendar.js` from the `calendar` block in `js/season-info.js`. Days are shaded by which range they fall in, checked in order: `training`, then `noSession`, then `sessions`, so a day inside the training window stays marked as training rather than falling through. Dates are compared as plain `YYYY-MM-DD` strings rather than parsed into `Date` objects, because parsing drags the viewer's timezone in and the shading would slip by a day for anyone outside Central.

All of the copy lives in `js/season-info.js`: the welcome heading and paragraphs, the `calendar` block, the `keyDates` list, and a `resources` list.

Resources moved off the home page to `resources.html`, which reads `js/resources-data.js`, so there is one list to keep up rather than two. The home page links across to it. Nothing there is gated: a coach part-way through training still needs the flyers and handouts. Groups render in the order they are listed, and a group with no items shows to admins only, so coaches never meet an empty heading.

The old `resources` list in `js/season-info.js` is gone. It used to sit below the key dates.

### The in-person training deck

`assets/in-person-training/` is a Claude Design canvas export of the September 12 session, served as an ordinary page: `assets/in-person-training/` opens the slides in the browser with no download. It is self-contained (`support.js`, `deck-stage.js`, and the `_ds/` bundle sit alongside it), so nothing else in the site has to know about it.

**Only the deck's own dependencies were kept.** The export also shipped the handouts as `.dc.html`, a facilitator guide, a print list, a second copy of the curriculum PDF, and several unused images. Those were left out: the handouts are served as PDFs instead, and the rest was either a duplicate or unreferenced, which trimmed roughly 11 MB. If the deck is re-exported, check that every file it references comes across, since the unused ones are easy to drop by mistake.

The handouts are PDFs in `assets/in-person-training/handouts/`, named for what they are rather than by number alone, with the print quantity from each sheet's own header in its `detail` line.

```js
link: { url: "https://calendar.google.com/...", label: "Add to Google Calendar" }
```

The link shows under that date on the page. Use it for anything tied to one date: a calendar invite, a sign-up, a form. Only Sept 12 has one at the moment, so that is the only date a coach can add to their calendar in one click. Giving the others their own links is just a matter of pasting them in here.

Dates are not automatically cleared when a season rolls over, so `keyDates` needs updating each year alongside the modules.

`js/calendar.js` builds an .ics file covering every key date at once, and is no longer wired to anything. It was dropped in favour of per-date links. Delete it, or add a button back that calls `buildIcs` and `downloadIcs`, if you ever want the all-dates-at-once download again.

## Adding a module

Everything about a module lives in one place: `js/modules-data.js`. To fill one in:

1. Find its entry in the `MODULES` array.
2. Set `youtubeId` to the video's ID (the part after `v=` in a YouTube URL). Upload it to YouTube as **unlisted**, not Private, Private videos cannot be embedded and will not load for coaches. Check that "Allow embedding" is ticked under Show more.
3. Add questions to the `quiz` array. Each question needs a `question`, an `options` array, and a `correctIndex` (0 for the first option, 1 for the second, and so on).
4. Adjust `passThreshold` if 80% shouldn't be the bar for that module.

Modules unlock in the order they appear in that array, a coach must pass one before the next becomes available.

### Listing a module before it is built

Give it `comingSoon: "Spring 2027"`. It shows on the training page as planned but cannot be opened, nothing is gated behind it, and it is left out of the completion count so coaches can still reach 100%. Delete that line when the module is ready.

Put a `comingSoon` module **last**. Both `js/module-page.js` and `can_write_module` find the previous module by `id - 1`, so an unfinishable module in the middle would strand everything after it, and would do it inconsistently: the browser treats a missing predecessor as no lock at all and lets a coach in, while the database treats it as no match and refuses to save their progress.

### Modules with more than one video

A module can hold several videos. Swap `youtubeId` for a `videos` array:

```js
videos: [
  { youtubeId: "abc123", title: "Part 1 - The Mission" },
  { youtubeId: "def456", title: "Part 2 - The Gym Rules" }
],
```

`title` is optional and only shows when there is more than one video. Both forms work, a module with a single video can keep using plain `youtubeId`.

Videos run in order: the second does not open until the first has been watched to the end, and a locked one shows a panel in place of the player rather than mounting a player a coach could start through the browser tools. The quiz stays locked until every video has been finished. Each video's furthest-watched position is tracked separately, so finishing one does not let a coach skip another.

### Modules proved by uploading a document

Some training happens somewhere else: SafeSport certification, setting up a Ramp payment account. Those modules ask for a document instead of a quiz. Add an `upload` block:

```js
upload: {
  prompt: "Upload your SafeSport certificate once you have finished the training.",
  accept: ".pdf,.png,.jpg,.jpeg",
  maxSizeMb: 10,
  linkUrl: "https://...",            // optional, links out to the training
  linkLabel: "Start SafeSport Training"
}
```

A module can have an upload, a video, and a quiz, in any combination, and **it is complete only when every part it asks for is done**. On a module with both a quiz and an upload, passing the quiz does not complete it and neither does approving the document: it needs both. The module page tells the coach which half is outstanding, and the admin review queue warns you when approving a document will not complete the module because the quiz has not been passed.

Because the pass threshold lives in `js/modules-data.js` and not in the database, it is the browser that works out whether the quiz half is satisfied and tells `reviewModuleDocument`. That is the same trust model as the quiz itself, which has always been scored client-side.

**Uploading and completing are deliberately different things.** When a coach uploads, the module goes to `pending` and they can carry straight on to the next module, so nobody sits blocked waiting on an admin. But it shows as "In review", not "Complete", and it does not count toward their progress bar. Only an admin approving it on `admin.html` sets `passed` and marks it complete.

Rejecting a document blocks the modules after it again, until the coach uploads a replacement.

A coach cannot approve their own document. Row Level Security lets them write their own progress row, so the database triggers in `supabase/schema.sql` downgrade any attempt to set `approved` back to `pending`, on both insert and update. Only `is_admin` accounts can actually approve.

Files go to a private `coach-documents` bucket at `<coach_id>/module-<n>/<timestamp>-<filename>`. That path shape is not cosmetic: the storage policies key on the first segment to decide who can read what. A coach can only read their own files, admins can read all, and nothing is reachable without a short-lived signed URL. The bucket caps size and MIME type server-side, so the browser-side checks are just a friendlier error.

### Training seasons, and the September reset

Coaches redo the whole training every year, so every progress row is stamped with a **season**. A season is named for the year it starts in: season 2026 runs 1 September 2026 to 31 August 2027, which everyone calls "2026-27".

On 1 September a coach simply has no rows for the new season, so they start again from Module 1. **Nothing is deleted.** Last year's records stay on the table and stay queryable, which matters for safeguarding: "was this coach SafeSport certified during the 2026-27 season" needs to be answerable years later, and a reset that deleted rows would destroy exactly that evidence.

There is **no scheduled job**. The current season is derived from today's date by `public.current_season()`, so the rollover happens on its own with nothing to fail at 3am on 1 September.

Two things in that function are worth knowing before you change it:

- **Timezone.** September 1 has to begin somewhere, and it is set to US Central. If Box United is elsewhere, that string is the only place it appears.
- **The floor.** The hub launched in August 2026, and everything in it belongs to the 2026-27 season rather than a 2025-26 season that never existed here. `greatest(2026, ...)` pins that without a special case, and stops mattering once the date passes it. The practical effect: nothing resets on 1 September 2026, and the first real rollover is 1 September 2027.

Unlocking is per season too, so last year's pass does not open this year's Module 2. A coach cannot write into any season but the running one, enforced by database trigger, so they can neither rewrite history nor pre-pass a year that has not started.

The admin page has a season picker, and the CSV export is named and stamped by season.

### Swapping a video out later

Changing the link is one line in `js/modules-data.js` plus a version bump. But a coach's watched position is stored in the database, and it does not reset itself. Someone who watched twelve minutes of the old video can scrub twelve minutes into the new one, or skip it entirely if the new one is shorter.

The forward-only trigger in `supabase/schema.sql` deliberately refuses to let progress move backward from the browser, so the reset has to come from the Supabase SQL editor, where `auth.uid()` is null and the trigger stands aside.

To make everyone re-watch module 1's videos, leaving their quiz results alone:

```sql
update public.progress
set video_furthest_seconds = 0, video_progress = '{}'::jsonb
where module_id = 1;
```

If the questions changed too and you want coaches to retake the quiz:

```sql
update public.progress
set video_furthest_seconds = 0,
    video_progress = '{}'::jsonb,
    passed = false,
    quiz_score = null,
    quiz_attempts = 0,
    completed_at = null
where module_id = 1;
```

**Think twice before that second one.** Setting `passed = false` on a module re-locks every module after it, for every coach, until they pass it again. A coach who had finished five modules would be back at the start. If only the video changed and the quiz still tests the same material, reset the video columns and leave `passed` alone.

## The weekly curriculum

Separate from training. Training is what a coach does *before* the season; the curriculum is what they run in the gym each week once it has started.

Two gates stand between a coach and a week's plan, and both have to pass:

1. **Their training is complete.** Every countable module passed or approved. A module still `pending` an admin's approval is deliberately not enough: it lets a coach carry on through the remaining modules, but nobody has checked it yet, so it does not hand over the season's curriculum. The locked page says which it is, so a coach waiting on an approval is told to sit tight rather than sent back to hunt for something to do.
2. **The week has opened.** A week opens `CURRICULUM_RELEASE_LEAD_DAYS` before its session date, currently 14, so coaches get two weeks to read ahead.

Admins skip both, the same as the module lock, so a week can be checked before anyone is let into it. Locked weeks gain a "Preview" link and the week itself says plainly it is not open to coaches yet.

The unlock rules live in `js/training-status.js` and are shared with the training page, so the two cannot disagree about who has finished. `js/curriculum.js` holds the date rules, shared by both curriculum pages.

### The source material

The curriculum is *The Fighter's Mindset, Coach Curriculum Guide, Season One*. The original 63-page PDF is split one practice per week into `assets/curriculum/`, by `scripts/split-curriculum.py`:

| File | Source pages | What it is |
| --- | --- | --- |
| `coach-guide.pdf` | 1–12, 63 | How to read a practice plan, assessments, journals, the practice checklist, references |
| `week-01.pdf` … `week-10.pdf` | 14–60 | One practice each |
| `scenario-cards.pdf` | 61–62 | Week 7 cut-outs |

Each week's **assessment log travels with the practice it belongs to** (weeks 1, 2, 6 and 10), so a coach printing one file has everything for that session. The scenario cards are a separate file because week 7 needs them printed and cut up rather than read, and `coach-guide.pdf` is linked once under Coach Reference rather than repeated on every week.

To re-split after the guide is revised, drop the new PDF in and run:

```bash
python scripts/split-curriculum.py "path/to/Box United Curriculum Season 1.pdf"
```

The page ranges are constants at the top of that script. Check them against the contents page if the guide is re-paginated, the script prints the first line of every file it writes so a bad range is obvious.

### ⚠️ The practice plans are publicly reachable

**This is the one thing to decide before pushing.** The repo is public and served by GitHub Pages, so anything in `assets/` can be fetched by anyone who knows or guesses the URL, for example `programs.boxunited.org/assets/curriculum/week-01.pdf`. The sign-in gate is on the *page*, not on the files behind it, and committing them puts them in the git history permanently, where deleting them later does not take them back out.

The guide is marked © 2026 Box United, All Rights Reserved. That is the same good-faith limit as the unlisted YouTube videos (see "What isn't tamperproof"), and it may well be an acceptable trade for a static site. But it is a real decision, not an oversight.

To close it properly, move the PDFs into a Supabase Storage bucket with a Row Level Security policy that mirrors the training gate, and have `week.html` hand out short-lived signed URLs. That is real enforcement rather than an unguessable path, and is the natural follow-up if the exposure matters.

### Publishing a week

All of the content lives in `js/curriculum-data.js`. **A week goes live the moment it has at least one document** — adding the link *is* the publish step, there is no separate flag. Until then it is listed as coming soon, so coaches can see the shape of the season without being promised a plan that isn't written:

```js
{
  week: 3,
  date: "2026-09-28",                // the Monday that session week starts
  title: "Goal Setting",
  theme: "One team goal for the Show Off.",  // the guide's one-line description
  focus: "Growth mindset",           // which of the three pillars it builds
  keyPhrase: "Why not me?",          // repeated through the session
  journal: true,                     // journal week, shows a "bring them" note
  summary: [                         // paragraphs on the week's page
    "A paragraph setting up what the session is for."
  ],
  materials: ["Mitts & gloves"],     // what the coach brings
  deliverables: [],                  // what goes to Charity Rescue
  videos: { walkthrough: "abc123", burnout: "def456" },   // YouTube ids
  documents: [
    {
      label: "Week 3 practice plan",
      url: "assets/curriculum/week-03.pdf",
      detail: "Includes the punch count assessment log"   // optional
    }
  ]
}
```

Only `week`, `date` and `documents` do any work; everything else is copy. `journal: true` marks the five weeks (3, 4, 6, 8, 9) where the Fighter's Mindset journal is part of the practice and, per the guide, is not optional. `survey: true` marks weeks 1 and 10, which use the printed survey instead. Both produce a note on the week's page telling the coach to bring them.

A document `url` can be a path inside this repo, as above, or any full URL: a Google Doc, a Drive PDF, a Canva link. **If you use a link, set its sharing to "anyone with the link can view" first**, or coaches hit a permission wall with no way through and no idea why. Documents open in a new tab.

### What a week's page shows

The sections run in the order a coach actually needs them: **What To Bring**, then **Watch**, then **Session Plan**, then **Submit To Charity Rescue** — prepare, watch, run, hand in.

`materials` is transcribed from each practice's MATERIALS block in the guide. One thing to check: **the guide lists only "Mitts & gloves" for week 2**, even though that week runs the punch count assessment to a 160 BPM song and week 6's materials do list "Speaker · the Week 2 song". That looks like a gap in the guide rather than the hub. It is transcribed as written, so fix it in `js/curriculum-data.js` if the guide is wrong.

`deliverables` is what that week produces for Charity Rescue. Weeks 1, 2, 6 and 10 have one, the rest are empty and the page says so plainly rather than leaving a coach wondering whether they have missed a step:

| Week | Goes to Charity Rescue |
| --- | --- |
| 1 | Scanned pre-season surveys (journal pages 5–6), jump rope assessment log |
| 2 | Punch count assessment log |
| 6 | Punch count assessment log, midpoint |
| 10 | Jump rope log, punch count log, scanned end-of-season surveys |

Weeks 1 and 2 were confirmed directly; 6 and 10 are taken from the assessment logs printed in those practices, so check them against how Charity Rescue actually wants them filed.

### Videos

Every week shows the same video slots in the same order, so a coach learns where to look once. The slots are defined in one place, `CURRICULUM_VIDEO_SLOTS` at the top of `js/curriculum-data.js`:

```js
const CURRICULUM_VIDEO_SLOTS = [
  { key: "walkthrough", label: "Session walkthrough", hint: "How this week's practice runs, start to finish." },
  { key: "burnout",     label: "The burnout",         hint: "How to run this week's burnout." }
];
```

Adding a slot there adds it to all ten weeks at once. Fill a slot for one week by pasting a YouTube id against its key:

```js
videos: { walkthrough: "abc123", burnout: "def456" }
```

A bare id is enough; use `{ youtubeId, title }` if a video needs its own heading instead of the slot label.

**One video on every week.** If a video never changes — a generic burnout explainer, say — put its id on the slot itself rather than into ten weeks:

```js
{ key: "burnout", label: "The burnout", youtubeId: "def456", hint: "..." }
```

It then plays on every week that does not name its own, tagged *Season default* so an admin can see where it came from, and any week can still override it.

**Empty slots show to admins only**, holding their place in the layout with a note naming the field to paste into. Coaches see nothing there, so a week with no videos simply has no Watch section rather than two broken-looking boxes.

**Videos are not gated at all.** Two things follow from that, and they are the reason the week pages are built the way they are:

- **No seek-blocking, no tracking.** Unlike module videos nothing is written to the database, because a coach watching a walkthrough is preparing, not proving anything.
- **Neither gate applies to them.** Any coach can watch any week's videos at any time — weeks that have not opened yet, and before their own training is finished. Only the plan waits.

So a week's page has two shapes. With the plan unlocked it shows everything: What To Bring, Watch, Session Plan, Submit To Charity Rescue. With the plan locked it shows the header, the Watch section, and a line under Session Plan saying why the plan is not there yet — the videos still play. A week with neither an unlocked plan nor a video sends the coach back to the curriculum rather than rendering an empty page.

The curriculum list follows the same rule. A coach still in training now gets the full list of weeks with a banner explaining the plans are locked, rather than being stopped at the door, because they have to be able to reach a video. Cards read "Open →" when the plan is available, "Watch →" when only the videos are, and carry no link when there is nothing to see.

A week with no `title` falls back to "Session week N", so a half-filled entry never breaks the page.

Dates are compared as plain `YYYY-MM-DD` strings, never parsed into `Date` objects, for the same reason as the season calendar: parsing drags the viewer's timezone in and a week would open a day early or late for anyone outside Central.

Like `keyDates`, the weeks are not cleared automatically when a season rolls over. `CURRICULUM` needs its dates and documents updating each year alongside the modules.

### Important: bump the version after any edit

Browsers cache CSS and JS aggressively. After changing **any** file in `js/` or `css/`, including `modules-data.js`, open every `.html` file in the repo root and increment every `?v=` number by one (they should all match). Skip this and coaches will keep seeing the old quiz questions or the old video, with no clue anything changed.

## Publishing to GitHub Pages

Already done: the site is live at <https://box-united.github.io/Coach-Training-Hub/>, served from `main`. Pushing to `main` redeploys it, usually within a minute.

1. ~~Push this repo to GitHub.~~
2. ~~**Settings -> Pages**, Source set to `main`, root folder.~~
3. **Still to do:** add the live URL to Supabase's Redirect URLs (see step 4 above). Until that is set, the sign-in form on the live site will send links that bounce.
4. For a custom domain: add a `CNAME` file to the repo root containing just your domain, then point your DNS at GitHub Pages per [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Send me the domain when you've picked one and I'll add the file.

## What isn't tamperproof

Two things in here are good-faith limits, not real security:

- **Video seek-blocking** tracks the furthest point a coach has watched and snaps back if they scrub ahead, but someone editing the page or calling the YouTube API directly could get around it.
- **Sequential module unlocking** is enforced by Row Level Security at the database level (a coach's `progress` row can only be inserted/updated as their own), so this one *is* real, not just a UI check.
