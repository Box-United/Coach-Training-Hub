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
          <button type="submit" class="btn btn-primary btn-block" id="loginBtn">Send My Magic Link</button>
          <div class="foot" id="loginMsg" style="text-align:center"></div>
        </form>
      </div>
    </div>
  `;
  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMsg");

  // Sending is rate limited per project, not per person, so one coach
  // pressing the button repeatedly can use up everyone's allowance for the
  // hour. Hold the button down for a minute after a successful send.
  function holdButton(seconds) {
    btn.disabled = true;
    let left = seconds;
    btn.textContent = `Sent, wait ${left}s`;
    const tick = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(tick);
        btn.disabled = false;
        btn.textContent = "Send My Magic Link";
        return;
      }
      btn.textContent = `Sent, wait ${left}s`;
    }, 1000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = "Sending...";
    msg.className = "foot";
    msg.textContent = "";
    try {
      await sendMagicLink(document.getElementById("email").value);
      msg.textContent = "Check your email for a sign-in link. It can take a minute to arrive.";
      holdButton(60);
    } catch (err) {
      // Show what Supabase actually said, a generic message here hid a
      // rate-limit rejection and made a failed send look successful. The
      // rate limit is the one coaches will actually hit, so name it plainly
      // rather than leaving them staring at API wording.
      const text = String((err && err.message) || "");
      msg.className = "error";
      msg.textContent = /rate limit/i.test(text)
        ? "Too many sign-in emails have been sent from this site in the last hour, which is a limit on our end, not yours. Please wait and try again, or contact Box United."
        : text || "We could not send the link, try again.";
      btn.disabled = false;
      btn.textContent = "Send My Magic Link";
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

      ${seasonCalendarHtml(SEASON_INFO.calendar)}

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
