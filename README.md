# Box United — Coach Training Hub

A static coach training site: magic-link sign-in, a gated video-plus-quiz module for each week of training, and an admin view of who's completed what. Hosted on GitHub Pages, backed by Supabase.

This first version has one module fully wired end to end (Module 1), so the whole flow, sign-in, video, quiz, Supabase write, admin view, can be tested before the remaining nine modules get their real videos and questions.

Not built yet, deferred to a follow-up phase: the season resource library, the dashboard overview page, and the sidebar navigation explored in `design-mockup.html`. Those aren't part of the brief's core loop and can be added once this is live.

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
2. Open **SQL Editor -> New query**, paste in the entire contents of `supabase/schema.sql`, and run it. That creates the `coaches` and `progress` tables, Row Level Security policies, and the trigger that adds a coach row the first time someone signs in.
3. Go to **Authentication -> Providers**, confirm **Email** is enabled, and turn off "Confirm email" if you want the magic link to sign someone in immediately (otherwise they'll get a confirmation step first). Magic link is on by default with the Email provider.
4. Go to **Authentication -> URL Configuration** and add your GitHub Pages URL (and custom domain, once you have one) to the Redirect URLs list, otherwise the magic link will bounce.
5. Go to **Project Settings -> API** and copy your Project URL and `anon` `public` key.
6. Open `js/config.js` and paste those two values in. Never paste the `service_role` key anywhere in this repo, only the `anon` key belongs in client code.
7. To make yourself an admin (for the CSV export / progress table page), sign in once through the real site first (so your `coaches` row exists), then run in the SQL Editor:
   ```sql
   update public.coaches set is_admin = true where email = 'you@boxunited.org';
   ```

## Adding a module

Everything about a module lives in one place: `js/modules-data.js`. To fill one in:

1. Find its entry in the `MODULES` array.
2. Set `youtubeId` to the video's ID (the part after `v=` in a YouTube URL). Upload it to YouTube as **unlisted**.
3. Add questions to the `quiz` array. Each question needs a `question`, an `options` array, and a `correctIndex` (0 for the first option, 1 for the second, and so on).
4. Adjust `passThreshold` if 80% shouldn't be the bar for that module.

Modules unlock in the order they appear in that array, a coach must pass one before the next becomes available.

## Publishing to GitHub Pages

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In the repo, go to **Settings -> Pages**, set Source to the `main` branch, root folder.
3. Once it's live, add that URL to Supabase's Redirect URLs (see step 4 above).
4. For a custom domain: add a `CNAME` file to the repo root containing just your domain, then point your DNS at GitHub Pages per [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Send me the domain when you've picked one and I'll add the file.

## What isn't tamperproof

Two things in here are good-faith limits, not real security:

- **Video seek-blocking** tracks the furthest point a coach has watched and snaps back if they scrub ahead, but someone editing the page or calling the YouTube API directly could get around it.
- **Sequential module unlocking** is enforced by Row Level Security at the database level (a coach's `progress` row can only be inserted/updated as their own), so this one *is* real, not just a UI check.
