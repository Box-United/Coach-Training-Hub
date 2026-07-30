function computeModuleStatus(modules, progressRows) {
  const byModule = {};
  progressRows.forEach((row) => { byModule[row.module_id] = row; });

  let unlocked = true;
  return modules.map((mod) => {
    const row = byModule[mod.id];
    const passed = !!(row && row.passed);
    const status = passed ? "complete" : unlocked ? "current" : "locked";
    if (!passed) unlocked = false;
    return { module: mod, row, status };
  });
}

function renderLoggedOut() {
  document.getElementById("app").innerHTML = `
    <div class="loginhero">
      <div class="panel">
        <img class="wordmark" src="assets/logos/box_united_stone.svg" alt="Box United" style="height:24px;width:auto;">
        <div>
          <div class="eyebrow" style="color:var(--bu-blue)">Coach Training Hub</div>
          <h2 style="margin-top:10px;">Train Your Body.<br>Strengthen Your Mind.</h2>
          <p class="editorial" style="margin-top:10px;">Sign in to pick up your training right where you left off.</p>
        </div>
        <form id="loginForm">
          <div class="field">
            <label class="lbl" for="email">Email</label>
            <input class="input" id="email" type="email" placeholder="you@boxunited.org" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Send My Magic Link</button>
          <div class="foot" id="loginMsg" style="text-align:center"></div>
        </form>
      </div>
    </div>
  `;
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const msg = document.getElementById("loginMsg");
    msg.textContent = "Sending...";
    try {
      await sendMagicLink(email);
      msg.textContent = "Check your email for a sign-in link.";
    } catch (err) {
      msg.textContent = "Something went wrong, try again.";
    }
  });
}

async function renderLoggedIn(session) {
  const progressRows = await getMyProgress();
  const statuses = computeModuleStatus(MODULES, progressRows);
  const completeCount = statuses.filter((s) => s.status === "complete").length;
  const scores = progressRows.filter((r) => r.quiz_score !== null).map((r) => r.quiz_score);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const pct = Math.round((completeCount / MODULES.length) * 100);

  document.getElementById("app").innerHTML = `
    <div class="topbar">
      <div class="brand"><img src="assets/logos/box_united_stone.svg" alt="Box United" style="height:20px;width:auto;"></div>
      <div class="who">
        <span>${session.user.email}</span>
        <span class="signout" id="signoutBtn">Sign out</span>
      </div>
    </div>
    <div class="wrap">
      <div class="statrow">
        <div class="statcard"><div class="num">${completeCount} / ${MODULES.length}</div><div class="lbl">Modules complete</div></div>
        <div class="statcard"><div class="num">${avgScore === null ? "—" : avgScore + "%"}</div><div class="lbl">Average quiz score</div></div>
      </div>
      <div class="progressbar"><div class="fill" style="width:${pct}%"></div></div>
      <div class="progresscaption"><span>${pct}% of training complete</span><span>${MODULES.length - completeCount} modules to go</span></div>
      <div class="sectiontitle"><h3>Your Training Path</h3><span class="muted" style="font-size:12.5px">Modules unlock in order</span></div>
      <div class="modgrid">
        ${statuses.map(({ module, row, status }) => moduleCardHtml(module, row, status)).join("")}
      </div>
    </div>
  `;
  document.getElementById("signoutBtn").addEventListener("click", signOut);
}

function moduleCardHtml(mod, row, status) {
  const num = `Module ${String(mod.id).padStart(2, "0")}`;
  if (status === "locked") {
    return `
      <div class="modcard is-locked">
        <div class="top"><span class="num">${num}</span><span class="badge badge-locked">Locked</span></div>
        <div class="title">${mod.title}</div>
        <p class="desc">${mod.description}</p>
        <div class="bottom"><span class="lockrow">Complete the module above first</span></div>
      </div>`;
  }
  if (status === "complete") {
    return `
      <div class="modcard">
        <div class="top"><span class="num">${num}</span><span class="badge badge-complete">Complete</span></div>
        <div class="title">${mod.title}</div>
        <p class="desc">${mod.description}</p>
        <div class="bottom"><span class="score">Passed &middot; ${row.quiz_score}%</span><a class="btn btn-ghost" style="padding:0;font-size:13px;" href="module.html?id=${mod.id}">Review &rarr;</a></div>
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

(async function init() {
  const session = await getCurrentSession();
  if (session) {
    renderLoggedIn(session);
  } else {
    renderLoggedOut();
  }
  supabaseClient.auth.onAuthStateChange((_event, newSession) => {
    if (newSession) renderLoggedIn(newSession);
  });
})();
