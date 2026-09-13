// The training page: how far a coach has got, and the modules themselves.
// The welcome and key dates live on the home page (js/index-page.js), and the
// unlock rules in js/training-status.js, shared with the curriculum pages.

function moduleCardHtml(mod, row, status, isAdmin) {
  const num = `Module ${String(mod.id).padStart(2, "0")}`;
  if (status === "soon") {
    return `
      <div class="modcard is-locked">
        <div class="top"><span class="num">${num}</span><span class="badge badge-soon">Coming ${mod.comingSoon}</span></div>
        <div class="title">${mod.title}</div>
        <p class="desc">${mod.description}</p>
        <div class="bottom"><span class="lockrow">Not part of this season's training</span></div>
      </div>`;
  }
  if (status === "locked") {
    return `
      <div class="modcard is-locked">
        <div class="top"><span class="num">${num}</span><span class="badge badge-locked">Locked</span></div>
        <div class="title">${mod.title}</div>
        <p class="desc">${mod.description}</p>
        <div class="bottom">
          <span class="lockrow">Complete the module above first</span>
          ${isAdmin ? `<a class="btn btn-ghost" style="padding:0;font-size:13px;" href="module.html?id=${mod.id}">Preview &rarr;</a>` : ""}
        </div>
      </div>`;
  }
  if (status === "pending") {
    return `
      <div class="modcard">
        <div class="top"><span class="num">${num}</span><span class="badge badge-pending">In review</span></div>
        <div class="title">${mod.title}</div>
        <p class="desc">${mod.description}</p>
        <div class="bottom"><span class="lockrow">Waiting on approval</span><a class="btn btn-ghost" style="padding:0;font-size:13px;" href="module.html?id=${mod.id}">View &rarr;</a></div>
      </div>`;
  }
  if (status === "complete") {
    // A module proved by uploading a document has no quiz score to show.
    const scoreLabel = row.quiz_score === null || row.quiz_score === undefined
      ? "Approved"
      : `Passed &middot; ${row.quiz_score}%`;
    return `
      <div class="modcard">
        <div class="top"><span class="num">${num}</span><span class="badge badge-complete">Complete</span></div>
        <div class="title">${mod.title}</div>
        <p class="desc">${mod.description}</p>
        <div class="bottom"><span class="score">${scoreLabel}</span><a class="btn btn-ghost" style="padding:0;font-size:13px;" href="module.html?id=${mod.id}">Review &rarr;</a></div>
      </div>`;
  }
  return `
    <div class="modcard is-current">
      <div class="top"><span class="num">${num}</span><span class="badge badge-progress">Up Next</span></div>
      <div class="title">${mod.title}</div>
      <p class="desc">${mod.description}</p>
      <div class="bottom"><a class="btn btn-primary btn-sm" href="module.html?id=${mod.id}">Start Module</a></div>
    </div>`;
}

async function renderTraining(session) {
  // Admins can open any module to review it, so locked cards still get a way
  // in. Wrapped so a missing coaches row does not break the page.
  let isAdmin = false;
  try {
    isAdmin = !!(await getMyCoachRow(session.user.id)).is_admin;
  } catch (err) {
    isAdmin = false;
  }

  const progressRows = await getMyProgress();
  const statuses = computeModuleStatus(MODULES, progressRows);
  const completeCount = statuses.filter((s) => s.status === "complete").length;
  // A module that has not been built yet is not something a coach can finish,
  // so counting it would hold everyone below 100 percent forever.
  const countable = countableModules(MODULES).length;
  const scores = progressRows.filter((r) => r.quiz_score !== null).map((r) => r.quiz_score);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const pct = Math.round((completeCount / countable) * 100);

  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "training")}
    <div class="wrap">
      <div class="statrow">
        <div class="statcard"><div class="num">${completeCount} / ${countable}</div><div class="lbl">Modules complete</div></div>
        <div class="statcard"><div class="num">${avgScore === null ? "—" : avgScore + "%"}</div><div class="lbl">Average quiz score</div></div>
      </div>
      <div class="progressbar"><div class="fill" style="width:${pct}%"></div></div>
      <div class="progresscaption"><span>${pct}% of training complete</span><span>${countable - completeCount} modules to go</span></div>
      ${isAdmin ? '<div class="adminnote">Viewing as an admin, so every module is open to preview, including ones a coach has not unlocked. <a href="admin.html">Go to the admin page</a></div>' : ""}
      <div class="sectiontitle"><h3>Your Training Path</h3><span class="muted" style="font-size:12.5px">Modules unlock in order</span></div>
      <div class="modgrid">
        ${statuses.map(({ module, row, status }) => moduleCardHtml(module, row, status, isAdmin)).join("")}
      </div>
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
  renderTraining(session);
})();
