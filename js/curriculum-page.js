// The curriculum page: the season's ten session weeks, and which are open.
// One week's plan lives on js/week-page.js. The rules both pages share, who
// gets in and when a week opens, are in js/curriculum.js.

// The badge and the note describe the plan, which is the thing the gates hold
// back. The link is worked out separately, because a week whose plan is locked
// is still worth opening when it has videos on it.
function weekCardHtml(week, today, access) {
  // The pillar rides along with the week number rather than taking its own
  // row, so a coach can see the three-pillar arc down the grid at a glance
  // without the card growing another line.
  const num = weekNumLabel(week) + (week.focus ? ` &middot; ${week.focus}` : "");
  const when = `<div class="weekwhen">Session ${formatWeekDate(week.date)}</div>`;
  const status = weekStatus(week, today);
  const current = isCurrentWeek(week, today);
  const theme = week.theme ? `<p class="desc">${week.theme}</p>` : "";
  const hasVideos = weekHasVideos(week);

  // What a coach would see, so an admin is never told a locked week is open.
  const coachPlanOpen = access.trainingComplete && status === "open";
  const planOpen = isPlanUnlocked(week, access, today);

  let badge;
  if (status === "soon") badge = { cls: "badge-soon", text: "Coming soon" };
  else if (!coachPlanOpen) badge = { cls: "badge-locked", text: "Locked" };
  else badge = current
    ? { cls: "badge-progress", text: "This week" }
    : { cls: "badge-complete", text: "Open" };

  let note;
  if (coachPlanOpen) {
    const count = week.documents.length;
    note = `<span class="score">${count === 1 ? "1 document" : count + " documents"}</span>`;
  } else if (status === "soon") {
    note = '<span class="lockrow">Not written yet</span>';
  } else if (!access.trainingComplete) {
    note = '<span class="lockrow">Plan opens when training is done</span>';
  } else {
    note = `<span class="lockrow">Plan opens ${formatWeekDate(weekOpensOn(week))}</span>`;
  }

  // An admin gets in everywhere. Everyone else gets in when the plan is open,
  // or when there is a video to watch.
  let action = "";
  if (planOpen) {
    action = `<a class="btn btn-ghost" style="padding:0;font-size:13px;" href="week.html?n=${week.week}">${coachPlanOpen ? "Open" : "Preview"} &rarr;</a>`;
  } else if (hasVideos) {
    action = `<a class="btn btn-ghost" style="padding:0;font-size:13px;" href="week.html?n=${week.week}">Watch &rarr;</a>`;
  }

  return `
    <div class="modcard${current && coachPlanOpen ? " is-current" : ""}${coachPlanOpen ? "" : " is-locked"}">
      <div class="top"><span class="num">${num}</span><span class="badge ${badge.cls}">${badge.text}</span></div>
      <div class="title">${weekTitle(week)}</div>
      ${when}
      ${theme}
      <div class="bottom">${note}${action}</div>
    </div>`;
}

function renderCurriculum(session, access) {
  const today = todayIso();
  const weeks = CURRICULUM.weeks;
  const openCount = weeks.filter((w) => access.trainingComplete && weekStatus(w, today) === "open").length;
  const current = weeks.find((w) => isCurrentWeek(w, today));

  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "curriculum")}
    <div class="wrap">
      <div class="infocard">
        <div class="eyebrow">${CURRICULUM.seasonLabel} curriculum</div>
        <h2>${current ? "You are in week " + current.week : "Your session plans"}</h2>
        <p class="editorial">${CURRICULUM.intro}</p>
      </div>

      ${access.isAdmin && !access.trainingComplete
        ? '<div class="adminnote">Viewing as an admin, so every plan is open even though your own training is not complete. A coach would see the plans locked here, though the videos stay open to them.</div>'
        : ""}

      ${!access.trainingComplete && !access.isAdmin
        ? trainingLockedBannerHtml(access.remaining)
        : ""}

      <div class="sectiontitle">
        <h3>Session Weeks</h3>
        <span class="muted" style="font-size:12.5px">${openCount} of ${weeks.length} open</span>
      </div>
      <div class="modgrid">
        ${weeks.map((w) => weekCardHtml(w, today, access)).join("")}
      </div>

      ${(CURRICULUM.guides || []).length ? `
        <div class="sectiontitle">
          <h3>Coach Reference</h3>
        </div>
        <ul class="resourcelist">
          ${CURRICULUM.guides.map((g) => `
            <li class="resourceitem">
              <a href="${escapeAttr(g.url)}" target="_blank" rel="noopener noreferrer">${g.label} &#8599;</a>
              ${g.detail ? `<div class="resourcedetail">${g.detail}</div>` : ""}
            </li>
          `).join("")}
        </ul>
      ` : ""}
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

  // No wall here any more. A coach still in training gets the week list, and
  // a banner saying the plans are locked, because the videos are open to them
  // and they have to be able to reach one.
  renderCurriculum(session, await getCurriculumAccess(session));
})();
