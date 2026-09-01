// The home page: signed out it is the sign-in form, signed in it is the
// welcome and the season's key dates. The modules themselves live on the
// training page (js/training-page.js).

// Everything in this site links to "./" rather than index.html, but somebody
// arriving from a bookmark or an old link can still land on /index.html.
// Tidy the address bar rather than redirecting: replaceState leaves no extra
// history entry, so Back still goes where the coach expects.
(function tidyUrl() {
  if (!location.pathname.endsWith("/index.html")) return;
  const clean = location.pathname.slice(0, -"index.html".length) + location.search + location.hash;
  history.replaceState(null, "", clean);
})();

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
            <input class="input" id="email" type="email" autocomplete="email" placeholder="you@example.org" required>
          </div>
          <div class="field">
            <label class="lbl" for="codeword">Codeword</label>
            <input class="input" id="codeword" type="password" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="loginBtn">Sign In</button>
          <div class="foot" id="loginMsg" style="text-align:center"></div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = "Signing in...";
    msg.className = "foot";
    msg.textContent = "";
    try {
      await signIn(
        document.getElementById("email").value.trim(),
        document.getElementById("codeword").value
      );
      // onAuthStateChange redraws the page once the session lands.
    } catch (err) {
      // Say what actually went wrong. A generic message here would leave a
      // coach retyping a correct codeword against a mistyped address.
      msg.className = "error";
      msg.textContent = (err && err.message) || "We could not sign you in, try again.";
      btn.disabled = false;
      btn.textContent = "Sign In";
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

      ${(SEASON_INFO.resources || []).length ? `
        <div class="sectiontitle">
          <h3>Resources</h3>
        </div>
        <ul class="resourcelist">
          ${SEASON_INFO.resources.map((r) => `
            <li class="resourceitem">
              <a href="${escapeAttr(r.url)}" target="_blank" rel="noopener noreferrer">${r.label} &#8599;</a>
              ${r.detail ? `<div class="resourcedetail">${r.detail}</div>` : ""}
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
  if (session) {
    renderHome(session);
  } else {
    renderLoggedOut();
  }
  // Redraw once the session lands, rather than leaving the sign-in form on
  // screen after a successful sign-in.
  supabaseClient.auth.onAuthStateChange((_event, newSession) => {
    if (newSession) renderHome(newSession);
  });
})();
