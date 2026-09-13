// Shared rules for the weekly curriculum, used by both the list of weeks
// (js/curriculum-page.js) and a single week (js/week-page.js).
//
// Dates are handled as plain YYYY-MM-DD strings and compared as strings, the
// same as js/calendar.js. Parsing them into local Date objects would drag the
// viewer's timezone in and a coach outside Central would see a week open a day
// early or late.

// Today, as the viewer's own calendar day.
//
// Built from the local date fields rather than toISOString(), which converts
// to UTC first, so a coach in Chicago looking at this after 7pm would be
// handed tomorrow's date and a week that has not opened yet.
function todayIso() {
  const now = new Date();
  return now.getFullYear() +
    "-" + String(now.getMonth() + 1).padStart(2, "0") +
    "-" + String(now.getDate()).padStart(2, "0");
}

// A date shifted by whole days, in and out as YYYY-MM-DD. The arithmetic runs
// in UTC so it cannot land on a different day for different viewers, and the
// result is read back with the UTC getters to match.
function isoShiftDays(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d) + days * 86400000);
  return shifted.getUTCFullYear() +
    "-" + String(shifted.getUTCMonth() + 1).padStart(2, "0") +
    "-" + String(shifted.getUTCDate()).padStart(2, "0");
}

function weekOpensOn(week) {
  return isoShiftDays(week.date, -CURRICULUM_RELEASE_LEAD_DAYS);
}

// Having a document IS being published, see the note in js/curriculum-data.js.
function weekHasContent(week) {
  return !!(week.documents && week.documents.length);
}

// One video entry, however it was written. A slot can be filled with a bare
// id or an object, so both of these mean the same thing:
//
//   burnout: "abc123"
//   burnout: { youtubeId: "abc123", title: "The five-station circuit" }
//
// Anything empty comes back null, so a slot left as "" renders as an empty
// slot rather than a broken player.
function normaliseVideo(value) {
  if (!value) return null;
  if (typeof value === "string") return { youtubeId: value, title: null };
  return value.youtubeId ? { youtubeId: value.youtubeId, title: value.title || null } : null;
}

// Every week shows the same video slots in the same order, defined once in
// CURRICULUM_VIDEO_SLOTS. A slot's own `youtubeId` is a season-wide default,
// used on every week that does not name its own, so a video that never
// changes is pasted in one place instead of ten.
//
// Unlike a training module these are not gated or tracked. A coach watching a
// walkthrough is preparing, not proving anything, so there is no seek-blocking
// and nothing is written to the database.
function weekVideoSlots(week) {
  const chosen = week.videos || {};
  return CURRICULUM_VIDEO_SLOTS.map((slot) => {
    const video = normaliseVideo(chosen[slot.key]) || normaliseVideo(slot.youtubeId);
    return {
      key: slot.key,
      label: slot.label,
      hint: slot.hint,
      // A season-wide default is worth flagging, so an admin editing one week
      // can see at a glance that the video is not coming from this week.
      isDefault: !normaliseVideo(chosen[slot.key]) && !!video,
      video: video
    };
  });
}

// "soon"   nothing written for it yet
// "locked" written, but still more than two weeks out
// "open"   ready to read
//
// "soon" wins over "locked" on purpose: telling a coach a week opens on a date
// would promise a plan that might not be written by then.
function weekStatus(week, today) {
  if (!weekHasContent(week)) return "soon";
  return weekOpensOn(week) <= today ? "open" : "locked";
}

// The session week being run right now, the seven days from its Monday. Used
// to mark one card so a coach landing mid-season sees where they are.
function isCurrentWeek(week, today) {
  return today >= week.date && today <= isoShiftDays(week.date, 6);
}

function findWeek(number) {
  return CURRICULUM.weeks.find((w) => w.week === number);
}

function weekNumLabel(week) {
  return "Week " + String(week.week).padStart(2, "0");
}

// A week with no title yet still needs something to print.
function weekTitle(week) {
  return week.title || "Session week " + week.week;
}

// Read back in UTC so the printed day matches the string it came from.
function formatWeekDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });
}

function weekHasVideos(week) {
  return weekVideoSlots(week).some((slot) => slot.video);
}

// The two gates cover the practice plan, not the videos.
//
// A coach can watch any week's videos whenever they like, including weeks that
// have not opened and before their own training is finished: watching is how
// they prepare, and there is nothing to protect in it. What the gates hold
// back is the plan itself, the documents, materials and deliverables, which is
// the thing that should not be run early or by somebody still in training.
//
// Admins see the plan everywhere, so a week can be checked before it opens.
function isPlanUnlocked(week, access, today) {
  return access.isAdmin || isPlanOpenForCoach(week, access, today);
}

// What a coach sees, admin rights aside. Kept separate so an admin previewing
// a locked week is never told it is open.
//
// `alwaysOpen` on a week skips both gates for that week alone, for the first
// weeks of the season that a coach has to be able to run whatever else is
// outstanding. A week with nothing written is still not open, since there
// would be nothing to show.
function isPlanOpenForCoach(week, access, today) {
  if (weekStatus(week, today) === "soon") return false;
  if (week.alwaysOpen) return true;
  return access.trainingComplete && weekStatus(week, today) === "open";
}

// The assessment songs a week needs, looked up in CURRICULUM_SONGS. An unknown
// key is dropped rather than rendering a broken row.
function weekSongs(week) {
  return (week.songs || []).map((key) => CURRICULUM_SONGS[key]).filter(Boolean);
}

// One sentence naming what is still outstanding, for the banners that explain
// why a plan is locked. Kept apart from the markup because the curriculum page
// and a week's page word the surrounding sentence differently.
function trainingRemainingText(remaining) {
  const parts = [];
  if (remaining.outstanding) {
    parts.push(remaining.outstanding === 1
      ? "one module left to finish"
      : remaining.outstanding + " modules left to finish");
  }
  if (remaining.pending) {
    parts.push(remaining.pending === 1
      ? "a document waiting on approval"
      : remaining.pending + " documents waiting on approval");
  }
  return parts.length ? "You have " + parts.join(", and ") + "." : "";
}

// Whether this coach can see the curriculum at all, and what is left if not.
// Both curriculum pages open with this, so the two cannot disagree about who
// is let in.
async function getCurriculumAccess(session) {
  // Wrapped because a missing coaches row should leave a coach looking at the
  // ordinary page, not an error.
  let isAdmin = false;
  try {
    isAdmin = !!(await getMyCoachRow(session.user.id)).is_admin;
  } catch (err) {
    isAdmin = false;
  }

  const statuses = computeModuleStatus(MODULES, await getMyProgress());
  const remaining = trainingRemaining(statuses);
  return {
    isAdmin,
    trainingComplete: isTrainingComplete(statuses),
    remaining
  };
}

// The banner above the week list when training is not finished. It says what
// is actually outstanding rather than just "locked", because a coach waiting
// on a document approval has already done everything they can and should be
// told that instead of being sent back to the training page to hunt for it.
//
// This is a banner rather than a wall: the weeks are still listed underneath
// and the videos still play, only the plans are held back.
function trainingLockedBannerHtml(remaining) {
  const detail = trainingRemainingText(remaining);

  // Naming the weeks that are open anyway matters more than the lock does: a
  // coach reading this the week before the season starts needs to know the
  // first sessions are already there.
  const open = (CURRICULUM.weeks || []).filter((w) => w.alwaysOpen && weekHasContent(w));
  const openList = open.length === 1
    ? `Week ${open[0].week} is`
    : `Weeks ${open.slice(0, -1).map((w) => w.week).join(", ")} and ${open[open.length - 1].week} are`;

  return `
    <div class="lockbanner">
      <div>
        <strong>The rest of the practice plans open once your training is complete.</strong>
        ${detail ? " " + detail : ""}
        ${open.length ? ` ${openList} open already, so you can run the start of the season either way.` : ""}
        You can watch the videos for any week while you finish.
        ${remaining.pending && !remaining.outstanding
          ? " Approvals are done by hand, so this can take a day or two. Nothing more is needed from you."
          : ""}
      </div>
      ${remaining.outstanding
        ? '<a class="btn btn-primary btn-sm" href="training.html">Go to your training</a>'
        : ""}
    </div>
  `;
}
