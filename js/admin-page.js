function progressToCsv(coaches) {
  const header = ["Email", "Name", ...MODULES.map((m) => `Module ${m.id}`)];
  const rows = coaches.map((c) => {
    const byModule = {};
    (c.progress || []).forEach((p) => { byModule[p.module_id] = p; });
    const cells = MODULES.map((m) => {
      const p = byModule[m.id];
      if (!p) return "not started";
      if (p.passed) return `passed ${p.quiz_score}%`;
      if (p.quiz_attempts > 0) return `failed ${p.quiz_score}%`;
      return "in progress";
    });
    return [c.email, c.name || "", ...cells];
  });
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

function downloadCsv(csv) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "coach-training-progress.csv";
  a.click();
  URL.revokeObjectURL(url);
}

(async function init() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  const me = await getMyCoachRow(session.user.id);
  if (!me.is_admin) {
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Not Authorized</h2><p>This page is restricted to Box United admins.</p><a class="btn btn-primary" href="index.html">Back to Modules</a></div>`;
    return;
  }

  const coaches = await getAllProgressForAdmin();

  document.getElementById("app").innerHTML = `
    <div class="topbar">
      <div class="brand"><img src="assets/logos/box_united_stone.svg" alt="Box United" style="height:20px;width:auto;"></div>
      <div class="who"><span>${session.user.email}</span><span class="signout" id="signoutBtn">Sign out</span></div>
    </div>
    <div class="wrap">
      <div class="sectiontitle" style="margin-top:28px;">
        <h3>Coach Progress</h3>
        <button class="btn btn-outline btn-sm" id="exportBtn">Export CSV</button>
      </div>
      <div class="tablewrap">
        <table class="admintable">
          <thead><tr><th>Coach</th>${MODULES.map((m) => `<th>M${m.id}</th>`).join("")}</tr></thead>
          <tbody>
            ${coaches.map((c) => adminRowHtml(c)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("signoutBtn").addEventListener("click", signOut);
  document.getElementById("exportBtn").addEventListener("click", () => downloadCsv(progressToCsv(coaches)));
})();

function adminRowHtml(coach) {
  const byModule = {};
  (coach.progress || []).forEach((p) => { byModule[p.module_id] = p; });
  const cells = MODULES.map((m) => {
    const p = byModule[m.id];
    if (!p) return '<td class="faint">&mdash;</td>';
    if (p.passed) return `<td>${p.quiz_score}%</td>`;
    if (p.quiz_attempts > 0) return `<td class="faint">${p.quiz_score}% (retry)</td>`;
    return '<td class="faint">in progress</td>';
  });
  return `<tr><td>${coach.email}</td>${cells.join("")}</tr>`;
}
