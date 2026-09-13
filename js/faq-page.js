// The FAQ page. Content lives in js/faq-data.js.
//
// Questions use <details>/<summary> so eighteen answers do not become a wall
// of text, and so the browser handles the open/close with no JavaScript. The
// child-safety group is marked openByDefault and so is expanded on arrival:
// nobody should have to click to find out how to report.
//
// Nothing here is gated. This is mostly policy and it is more useful the
// earlier a coach reads it.

function faqItemHtml(item, open) {
  return `
    <details class="faqitem"${open ? " open" : ""}>
      <summary>${item.q}</summary>
      <div class="faqanswer">
        ${item.a.map((para) => `<p>${para}</p>`).join("")}
        ${item.source ? `<p class="faqsource">Source: ${item.source}</p>` : ""}
      </div>
    </details>`;
}

function faqGroupHtml(group) {
  return `
    <div class="sectiontitle" style="margin-top:34px;">
      <h3>${group.heading}</h3>
    </div>
    ${group.note ? `<p class="modulenote" style="margin:0 0 14px;">${group.note}</p>` : ""}
    ${group.items.map((item) => faqItemHtml(item, !!group.openByDefault)).join("")}`;
}

function renderFaq(session) {
  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "faq")}
    <div class="wrap">
      <div class="infocard">
        <div class="eyebrow">${SEASON_INFO.seasonLabel} season</div>
        <h2>Questions</h2>
        <p class="prose">${FAQ.intro}</p>
      </div>

      ${FAQ.groups.map(faqGroupHtml).join("")}

      ${FAQ.closing ? `<p class="prose" style="margin:34px 0 48px;">${FAQ.closing}</p>` : ""}
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
  renderFaq(session);
})();
