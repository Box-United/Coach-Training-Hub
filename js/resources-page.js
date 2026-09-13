// The resources page: documents, handouts, and links that are not tied to one
// training module or one session week. The content lives in
// js/resources-data.js.
//
// Nothing here is gated. A coach part-way through their training still needs
// the recruitment flyers and the handouts, so this page opens to anyone signed
// in, the same as the home page.

function resourceGroupHtml(group) {
  return `
    <div class="sectiontitle" style="margin-top:34px;">
      <h3>${group.heading}</h3>
    </div>
    ${group.blurb ? `<p class="groupblurb">${group.blurb}</p>` : ""}
    <ul class="resourcelist">
      ${group.items.map((item) => `
        <li class="resourceitem">
          <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">${item.label} &#8599;</a>
          ${item.detail ? `<div class="resourcedetail">${item.detail}</div>` : ""}
        </li>
      `).join("")}
    </ul>`;
}

// An empty group would read to a coach as something missing rather than
// something not written yet, so it shows to admins only, with the file to add
// it in named.
function emptyGroupHtml(group) {
  return `
    <div class="sectiontitle" style="margin-top:34px;">
      <h3>${group.heading}</h3>
    </div>
    ${group.blurb ? `<p class="groupblurb">${group.blurb}</p>` : ""}
    <div class="lockbanner">
      <div>Nothing here yet. Add an item to the <code>${group.key}</code> group in
      js/resources-data.js and it appears for everyone. Coaches do not see this heading until then.</div>
    </div>`;
}

function renderResources(session, isAdmin) {
  const groups = RESOURCES.groups || [];
  const filled = groups.filter((g) => (g.items || []).length);
  const empty = groups.filter((g) => !(g.items || []).length);

  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "resources")}
    <div class="wrap">
      <div class="infocard">
        <div class="eyebrow">${SEASON_INFO.seasonLabel} season</div>
        <h2>Resources</h2>
        <p class="prose">${RESOURCES.intro}</p>
      </div>

      ${isAdmin && empty.length
        ? '<div class="adminnote">Headings with nothing in them show here because you are an admin. Coaches see only the ones that have something to open.</div>'
        : ""}

      ${filled.map(resourceGroupHtml).join("")}
      ${isAdmin ? empty.map(emptyGroupHtml).join("") : ""}

      ${!filled.length && !isAdmin
        ? '<p class="prose" style="margin-top:34px;">Nothing has been added here yet. Check back once your training is under way.</p>'
        : ""}
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

  // Wrapped so a missing coaches row leaves a coach on the ordinary page
  // rather than an error, the same as everywhere else.
  let isAdmin = false;
  try {
    isAdmin = !!(await getMyCoachRow(session.user.id)).is_admin;
  } catch (err) {
    isAdmin = false;
  }

  renderResources(session, isAdmin);
})();
