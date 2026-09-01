// The signed-in top bar, shared by every page so the navigation cannot drift
// apart between them. Charity Rescue and Ramp are here because the things
// coaches are actually held to, attendance, assessments and getting paid, all
// happen over there rather than in this hub. `current` is "home", "training", or omitted, and marks
// which link to highlight.
//
// The caller is responsible for wiring #signoutBtn, since the pages render
// their own markup around this.

// "./" rather than "index.html" so the address bar shows the folder. The
// current-page highlight keys off `current`, not the href, so it is unaffected.
function topbarHtml(email, current) {
  const link = (href, label, key) =>
    `<a href="${href}"${current === key ? ' class="is-current"' : ""}>${label}</a>`;

  return `
    <div class="topbar">
      <div class="brand"><img src="assets/logos/box_united_stone.svg" alt="Box United" style="height:20px;width:auto;"></div>
      <nav class="topnav">
        ${link("./", "Home", "home")}
        ${link("training.html", "Training", "training")}
        <a class="is-external" href="https://charityrescue.io" target="_blank" rel="noopener noreferrer">Charity Rescue &#8599;</a>
        <a class="is-external" href="https://app.ramp.com/sign-in" target="_blank" rel="noopener noreferrer">Ramp &#8599;</a>
      </nav>
      <div class="who">
        <span class="whoemail">${email}</span>
        <span class="signout" id="signoutBtn">Sign out</span>
      </div>
    </div>
  `;
}
