// The home page: signed out it is the magic-link form, signed in it is the
// welcome and the season's key dates. The modules themselves live on the
// training page (js/training-page.js).

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
    msg.className = "foot";
    msg.textContent = "Sending...";
    try {
      await sendMagicLink(email);
      msg.textContent = "Check your email for a sign-in link.";
    } catch (err) {
      // Show what Supabase actually said, a generic message here hid a
      // rate-limit rejection and made a failed send look successful.
      msg.className = "error";
      msg.textContent = err.message || "We could not send the link, try again.";
    }
  });
}

function renderHome(session) {
  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "home")}
    <div class="wrap">
      <div class="infocard">
        <div class="eyebrow">${SEASON_INFO.seasonLabel} season</div>
        <h2>${SEASON_INFO.welcome.heading}</h2>
        ${SEASON_INFO.welcome.body.map((para) => `<p class="editorial">${para}</p>`).join("")}
        <p style="margin-top:18px;"><a class="btn btn-primary" href="training.html">Go to your training</a></p>
      </div>

      <div class="sectiontitle">
        <h3>Key Dates</h3>
      </div>
      <ol class="datelist">
        ${SEASON_INFO.keyDates.map((d) => `
          <li class="dateitem">
            <div class="datewhen">${d.label}</div>
            <div class="datewhat">
              <div class="datetitle">${d.title}</div>
              ${d.detail ? `<div class="datedetail">${d.detail}</div>` : ""}
              ${d.link ? `<a class="datelink" href="${escapeAttr(d.link.url)}" target="_blank" rel="noopener noreferrer">${d.link.label || "Open"} &rarr;</a>` : ""}
            </div>
          </li>
        `).join("")}
      </ol>
    </div>
  `;
  document.getElementById("signoutBtn").addEventListener("click", signOut);
}

(async function init() {
  const session = await getCurrentSession();
  if (session) {
    renderHome(session);
  } else {
    renderLoggedOut();
  }
  // The magic link lands here, so the page has to redraw once the session
  // arrives rather than leaving the sign-in form on screen.
  supabaseClient.auth.onAuthStateChange((_event, newSession) => {
    if (newSession) renderHome(newSession);
  });
})();
