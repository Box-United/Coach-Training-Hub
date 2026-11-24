// What a coach is owed for their training, in hours.
//
// Three things make up the total:
//
//   in person    3 hours    for the in-person training day
//   SafeSport    1.5 hours  for the course on SafeSport's own site, once an
//                           admin has approved the certificate
//   the videos   1.5 hours  for the whole run of module videos
//
// So a coach who finishes everything and was in the room is paid for 6 hours,
// which is the figure the training is described by.
//
// The videos are credited at 1.5 hours rather than the 72 minutes they
// actually run to. That rounding is deliberate: 6 hours is what coaches are
// told the training takes, and paying 5.7 because the videos came in short
// would be a worse answer than paying the stated figure.
//
// Somebody part way through is paid the share of that 1.5 matching how much
// of the run they have watched, so two modules in does not pay the same as
// eight. Excused counts as nothing for the in-person day: it says they were
// not there, which is a different thing from being paid for it.

const IN_PERSON_HOURS = 3;
const SAFESPORT_HOURS = 1.5;
const VIDEO_RUN_HOURS = 1.5;
const SAFESPORT_MODULE_ID = 8;

// How long each module's videos run, in seconds, keyed by module id.
//
// Nothing in the hub stores a video's length. YouTube reports it to the player
// at play time and only the furthest second watched is written down (see
// js/video-player.js). But a module's quiz stays locked until every video on
// it has been watched to the end, so a coach who has passed a module has a
// saved position equal to the full run. Reading the lengths back off passed
// rows needs no hard-coded table and stays right when a video is replaced.
//
// Before anybody has passed a module there is nothing to read it off, so it
// falls back to the furthest anyone has reached. That can read short while the
// first coach is still working through it, which would flatter them a little.
// It corrects itself as soon as somebody passes, and the alternative, a table
// of lengths kept by hand, goes wrong quietly and stays wrong.
function videoRunSeconds(coaches) {
  const fromPassed = {};
  const fromAnyone = {};

  coaches.forEach((coach) => {
    (coach.progress || []).forEach((row) => {
      const seconds = row.video_furthest_seconds || 0;
      if (!seconds) return;
      const id = row.module_id;
      fromAnyone[id] = Math.max(fromAnyone[id] || 0, seconds);
      if (row.passed) fromPassed[id] = Math.max(fromPassed[id] || 0, seconds);
    });
  });

  // Only modules that are actually part of this season's training and
  // actually have a video. A `comingSoon` module is not expected of anybody,
  // and SafeSport has no video here at all.
  const runs = {};
  countableModules(MODULES).forEach((mod) => {
    const videoCount = mod.videos ? mod.videos.length : (mod.youtubeId ? 1 : 0);
    if (!videoCount) return;
    const seconds = fromPassed[mod.id] || fromAnyone[mod.id] || 0;
    if (seconds) runs[mod.id] = seconds;
  });
  return runs;
}

// The seconds of video this coach has watched, counted only against modules
// that are part of the training. Capped per module, because the run length can
// be read off a part-watched row early in a season and nobody should come out
// at more than 100 percent of it.
function videoSecondsWatched(coach, runs) {
  let total = 0;
  (coach.progress || []).forEach((row) => {
    const run = runs[row.module_id];
    if (!run) return;
    total += Math.min(row.video_furthest_seconds || 0, run);
  });
  return total;
}

// Every hours figure for one coach, as numbers. Rounding is left to whoever
// displays it, so the parts always add up to the total.
function trainingHoursForCoach(coach, inPersonRow, runs) {
  const attended = !!(inPersonRow && inPersonRow.status === "attended");

  const safeSportRow = (coach.progress || [])
    .find((row) => row.module_id === SAFESPORT_MODULE_ID);
  const safeSportDone = !!(safeSportRow && safeSportRow.passed);

  const runTotal = Object.keys(runs).reduce((sum, id) => sum + runs[id], 0);
  const watched = videoSecondsWatched(coach, runs);
  const share = runTotal ? watched / runTotal : 0;

  const inPerson = attended ? IN_PERSON_HOURS : 0;
  const safeSport = safeSportDone ? SAFESPORT_HOURS : 0;
  const video = share * VIDEO_RUN_HOURS;

  return {
    inPerson,
    safeSport,
    video,
    total: inPerson + safeSport + video,
    videoShare: share,
    videoSecondsWatched: watched,
    videoRunSeconds: runTotal
  };
}
