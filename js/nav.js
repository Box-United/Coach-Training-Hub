// The signed-in top bar, shared by every page so the navigation cannot drift
// apart between them. Charity Rescue is here because attendance and the
// assessment results are the two things required every season, and they are
// both done over there rather than in this hub. `current` is "home", "training", or omitted, and marks
// which link to highlight.
//
// The caller is responsible for wiring #signoutBtn, since the pages render
// their own markup around this.

function topbarHtml(email, current) {
  const link = (href, label, key) =>
    `<a href="${href}"${current === key ? ' class="is-current"' : ""}>${label}</a>`;

  return `
    <div class="topbar">
      <div class="brand"><img src="assets/logos/box_united_stone.svg" alt="Box United" style="height:20px;width:auto;"></div>
      <nav class="topnav">
        ${link("index.html", "Home", "home")}
        ${link("training.html", "Training", "training")}
        <a class="is-external" href="https://charityrescue.io" target="_blank" rel="noopener noreferrer">Charity Rescue &#8599;</a>
      </nav>
      <div class="who">
        <span class="whoemail">${email}</span>
        <span class="signout" id="signoutBtn">Sign out</span>
      </div>
    </div>
  `;
}
