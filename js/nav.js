// The signed-in top bar, shared by every page so the navigation cannot drift
// apart between them. `current` is "home", "training", or omitted, and marks
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
      </nav>
      <div class="who">
        <span class="whoemail">${email}</span>
        <span class="signout" id="signoutBtn">Sign out</span>
      </div>
    </div>
  `;
}
