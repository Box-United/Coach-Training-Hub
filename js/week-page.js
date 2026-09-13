// One week of the season's curriculum: its plan documents, and anything a
// coach needs read before running the session. The list of weeks is on
// js/curriculum-page.js, the shared rules in js/curriculum.js.

function getWeekNumberFromUrl() {
  return Number(new URLSearchParams(window.location.search).get("n"));
}

function notFoundHtml(heading, body) {
  return `
    <div class="centernote">
      <h2>${heading}</h2>
      ${body ? `<p>${body}</p>` : ""}
      <a class="btn btn-primary" href="curriculum.html">Back to the curriculum</a>
    </div>`;
}

// The song an assessment is run to. A link rather than an embed, because a
// coach is going to play this off a phone through the gym speaker rather than
// from this page, and the note matters as much as the track.
//
// Sits below the videos, so it reads in the order the session runs: watch the
// burnout being demonstrated, then pick up the track it is run to.
function songsHtml(week) {
  const songs = weekSongs(week);
  if (!songs.length) return "";
  return `
    <div class="sectiontitle" style="margin-top:32px;">
      <h3>Music</h3>
    </div>
    <ul class="resourcelist">
      ${songs.map((song) => `
        <li class="resourceitem">
          <a href="https://www.youtube.com/watch?v=${escapeAttr(song.youtubeId)}" target="_blank" rel="noopener noreferrer">${song.label} &#8599;</a>
          ${song.note ? `<div class="resourcedetail">${song.note}</div>` : ""}
        </li>
      `).join("")}
    </ul>`;
}

// What the coach brings. Sits above the plan because it is the one thing that
// has to be sorted before leaving for the gym, not while standing in it.
function materialsHtml(week) {
  const materials = week.materials || [];
  if (!materials.length) return "";
  return `
    <div class="sectiontitle" style="margin-top:32px;">
      <h3>What To Bring</h3>
    </div>
    <ul class="weeklist">
      ${materials.map((item) => `<li>${item}</li>`).join("")}
    </ul>`;
}

// What the week produces for Charity Rescue. Most weeks produce nothing, and
// saying so plainly is better than leaving a coach wondering whether they have
// missed a step.
function deliverablesHtml(week) {
  const deliverables = week.deliverables || [];
  if (!deliverables.length) {
    return `
      <div class="sectiontitle" style="margin-top:12px;">
        <h3>Submit To Charity Rescue</h3>
      </div>
      <p class="faint" style="font-size:13.5px;margin-bottom:48px;">Nothing to submit this week beyond your usual attendance.</p>`;
  }
  return `
    <div class="sectiontitle" style="margin-top:12px;">
      <h3>Submit To Charity Rescue</h3>
    </div>
    <ul class="weeklist is-submit">
      ${deliverables.map((item) => `<li>${item}</li>`).join("")}
    </ul>
    <p style="margin:0 0 48px;">
      <a class="btn btn-outline btn-sm" href="https://charityrescue.io" target="_blank" rel="noopener noreferrer">Open Charity Rescue &#8599;</a>
    </p>`;
}

// Plain embeds, no seek-blocking and nothing written to the database. See the
// note on weekVideoSlots in js/curriculum.js.
//
// Every week shows the same slots in the same order, so a coach learns where
// to look once. An unfilled slot shows to admins only, holding its place in
// the layout with a note saying what to add, so a coach is never shown an
// empty box that looks broken.
function weekVideoHtml(week, isAdmin) {
  const slots = weekVideoSlots(week);
  const visible = isAdmin ? slots : slots.filter((s) => s.video);
  if (!visible.length) return "";

  return `
    <div class="sectiontitle" style="margin-top:32px;">
      <h3>Watch</h3>
    </div>
    ${visible.map((slot) => `
      <div class="videoblock">
        <div class="videolabel">
          <span class="eyebrow">${slot.video && slot.video.title ? slot.video.title : slot.label}</span>
          ${slot.isDefault ? '<span class="videostate">Season default</span>' : ""}
        </div>
        ${slot.video
          ? `<div class="videowrap">
               <iframe class="weekvideo"
                 src="https://www.youtube.com/embed/${escapeAttr(slot.video.youtubeId)}?rel=0&amp;modestbranding=1"
                 title="${escapeAttr(slot.video.title || slot.label + ", " + weekTitle(week))}"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowfullscreen></iframe>
             </div>`
          : `<div class="videowrap">
               <div class="videolocked">
                 <span>
                   ${slot.hint}<br>
                   Paste a YouTube id into <code>videos.${slot.key}</code>, week ${week.week}.
                 </span>
               </div>
             </div>`}
      </div>
    `).join("")}
    ${isAdmin && slots.some((s) => !s.video)
      ? `<p class="videocap">Empty slots show to admins only, coaches see nothing there until a video is added.
         To use one video on every week instead, put its id on the slot in CURRICULUM_VIDEO_SLOTS.</p>`
      : ""}`;
}

// `planOpen` false renders the week as videos only: the header and the Watch
// section, with a line saying why the plan is not there. The videos are never
// gated, so this is the view a coach gets on a week that has not opened, or
// while their own training is unfinished.
function renderWeek(session, week, isAdmin, isLockedPreview, planOpen, lockReason) {
  const today = todayIso();
  const current = isCurrentWeek(week, today);

  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "curriculum")}
    <div class="wrap">
      <div class="lessonhead">
        <a class="crumb" href="curriculum.html">&larr; ${CURRICULUM.seasonLabel} curriculum</a>
        <div class="eyebrow">${weekNumLabel(week)}${current ? " &middot; This week" : ""}</div>
        <h2>${weekTitle(week)}</h2>
        <p class="weekwhen">Session ${formatWeekDate(week.date)}</p>
        ${week.theme ? `<p class="editorial">${week.theme}</p>` : ""}
      </div>

      ${isLockedPreview
        ? `<div class="adminnote">Viewing as an admin. This week does not open to coaches until ${formatWeekDate(weekOpensOn(week))}.</div>`
        : ""}

      ${week.focus || week.keyPhrase ? `
        <div class="weekmeta">
          ${week.focus ? `<div class="weekmetaitem"><span class="lbl">Focus</span><span>${week.focus}</span></div>` : ""}
          ${week.keyPhrase ? `<div class="weekmetaitem"><span class="lbl">Key phrase</span><span>&ldquo;${week.keyPhrase}&rdquo;</span></div>` : ""}
        </div>` : ""}

      ${(week.summary || []).map((para) => `<p class="prose">${para}</p>`).join("")}

      ${planOpen && (week.journal || week.survey) ? `
        <p class="modulenote" style="margin-top:22px;">${week.journal
          ? "Bring the Fighter&rsquo;s Mindset journals. This is a journal week, the prompt is printed on the page and it is not optional."
          : "Bring the Fighter&rsquo;s Mindset journals. Fighters complete the printed survey during this session."}</p>` : ""}

      ${planOpen ? materialsHtml(week) : ""}

      ${weekVideoHtml(week, isAdmin)}

      ${planOpen ? songsHtml(week) : ""}

      ${planOpen ? `
        <div class="sectiontitle" style="margin-top:28px;">
          <h3>Session Plan</h3>
        </div>
        <ul class="resourcelist">
          ${week.documents.map((doc) => `
            <li class="resourceitem">
              <a href="${escapeAttr(doc.url)}" target="_blank" rel="noopener noreferrer">${doc.label} &#8599;</a>
              ${doc.detail ? `<div class="resourcedetail">${doc.detail}</div>` : ""}
            </li>
          `).join("")}
        </ul>

        ${deliverablesHtml(week)}
      ` : `
        <div class="sectiontitle" style="margin-top:32px;">
          <h3>Session Plan</h3>
        </div>
        <div class="lockbanner" style="margin-bottom:48px;">
          <div>${lockReason}</div>
          <a class="btn btn-outline btn-sm" href="curriculum.html">Back to the curriculum</a>
        </div>
      `}
    </div>
  `;
  document.getElementById("signoutBtn").addEventListener("click", signOut);
}

(async function init() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = "./";
    return;
  }

  const week = findWeek(getWeekNumberFromUrl());
  const access = await getCurriculumAccess(session);

  const app = document.getElementById("app");
  const shell = (html) => {
    app.innerHTML = topbarHtml(session.user.email, "curriculum") + html;
    document.getElementById("signoutBtn").addEventListener("click", signOut);
  };

  if (!week) {
    shell(notFoundHtml("Week not found", "That week is not part of this season."));
    return;
  }

  const today = todayIso();
  const status = weekStatus(week, today);
  const planOpen = isPlanUnlocked(week, access, today);

  // Why the plan is not on the page, in the order the reasons actually bite.
  let lockReason = "";
  if (status === "soon") {
    lockReason = access.isAdmin
      ? "Nothing has been written for this week yet. Add a document in js/curriculum-data.js to publish it."
      : "The plan for this week has not been published yet.";
  } else if (!access.trainingComplete) {
    lockReason = "The practice plans open once your training is complete. "
      + trainingRemainingText(access.remaining);
  } else {
    lockReason = `This week's plan opens on ${formatWeekDate(weekOpensOn(week))}.`;
  }

  // An admin always has the plan, except on a week nobody has written.
  const showPlan = planOpen && status !== "soon";

  // With no plan and no video there is nothing on the page worth showing, so
  // send them back rather than rendering an empty shell.
  if (!showPlan && !weekHasVideos(week)) {
    shell(notFoundHtml(weekTitle(week), lockReason));
    return;
  }

  renderWeek(session, week, access.isAdmin, showPlan && status === "locked", showPlan, lockReason);
})();
