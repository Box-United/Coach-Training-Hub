// One label per coach, per module, shared by the table and the CSV export so
// the two can never drift apart.
function moduleCellLabel(p) {
  if (!p) return "not started";
  // A module proved by uploading a document has no quiz score.
  if (p.passed) {
    return p.quiz_score === null || p.quiz_score === undefined ? "approved" : `passed ${p.quiz_score}%`;
  }
  if (p.document_status === "pending") return "in review";
  if (p.document_status === "rejected") return "rejected";
  if (p.quiz_attempts > 0) return `failed ${p.quiz_score}%`;
  return "in progress";
}

function progressToCsv(coaches, season) {
  const header = ["Season", "Email", "Name", ...MODULES.map((m) => `Module ${m.id}`)];
  const rows = coaches.map((c) => {
    const byModule = {};
    (c.progress || []).forEach((p) => { byModule[p.module_id] = p; });
    const cells = MODULES.map((m) => moduleCellLabel(byModule[m.id]));
    return [seasonLabel(season), c.email, c.name || "", ...cells];
  });
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

function downloadCsv(csv, season) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // Named by season, so exports from different years do not overwrite
  // each other in a downloads folder.
  a.download = `coach-training-progress-${seasonLabel(season)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Everything a coach has uploaded that nobody has looked at yet.
function pendingDocuments(coaches) {
  const out = [];
  coaches.forEach((coach) => {
    (coach.progress || []).forEach((row) => {
      if (row.document_status === "pending" && row.document_path) {
        out.push({ coach, row, module: MODULES.find((m) => m.id === row.module_id) });
      }
    });
  });
  // Oldest first, so nobody waits longest by accident.
  out.sort((a, b) => String(a.row.document_uploaded_at).localeCompare(String(b.row.document_uploaded_at)));
  return out;
}

// Season 2026 runs Sept 2026 to Aug 2027, which everyone calls "2026-27".
function seasonLabel(season) {
  return `${season}-${String(season + 1).slice(-2)}`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function reviewListHtml(pending) {
  if (!pending.length) {
    return '<p class="help">Nothing waiting on review.</p>';
  }
  return pending.map((item, i) => `
    <div class="reviewrow" data-index="${i}">
      <div class="reviewwho">
        <div class="reviewcoach">${item.coach.email}</div>
        <div class="reviewmod">${item.module ? item.module.title : "Module " + item.row.module_id} &middot; uploaded ${formatDate(item.row.document_uploaded_at)}</div>
      </div>
      <div class="reviewactions">
        <button class="btn btn-outline btn-sm" data-act="view" data-index="${i}">View file</button>
        <button class="btn btn-primary btn-sm" data-act="approve" data-index="${i}">Approve</button>
        <button class="btn btn-ghost btn-sm" data-act="reject" data-index="${i}">Reject</button>
      </div>
      <div class="help reviewmsg" id="reviewmsg-${i}"></div>
    </div>
  `).join("");
}

(async function init() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  const me = await getMyCoachRow(session.user.id);
  if (!me.is_admin) {
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Not Authorized</h2><p>This page is restricted to Box United admins.</p><a class="btn btn-primary" href="training.html">Back to Training</a></div>`;
    return;
  }

  const currentSeason = await getCurrentSeason();
  const seasons = await getSeasonsWithProgress();
  // Always offer the running season, even before anyone has started it.
  if (seasons.indexOf(currentSeason) === -1) seasons.unshift(currentSeason);

  const requested = Number(new URLSearchParams(window.location.search).get("season"));
  const season = seasons.indexOf(requested) !== -1 ? requested : currentSeason;

  const coaches = await getAllProgressForAdmin(season);
  const pending = pendingDocuments(coaches);

  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email)}
    <div class="wrap">
      <div class="sectiontitle" style="margin-top:28px;">
        <h3>Training Season</h3>
        <select class="input seasonpick" id="seasonPick">
          ${seasons.map((s) => `<option value="${s}"${s === season ? " selected" : ""}>${seasonLabel(s)}${s === currentSeason ? " (current)" : ""}</option>`).join("")}
        </select>
      </div>
      ${season !== currentSeason
        ? `<p class="help">Viewing a past season. Coaches are working through ${seasonLabel(currentSeason)}.</p>`
        : ""
      }

      <div class="sectiontitle" style="margin-top:28px;">
        <h3>Documents to Review</h3>
        <span class="muted" style="font-size:12.5px">${pending.length} waiting</span>
      </div>
      <div class="quizcard" id="reviewlist">${reviewListHtml(pending)}</div>

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
  document.getElementById("exportBtn").addEventListener("click", () => downloadCsv(progressToCsv(coaches, season), season));
  document.getElementById("seasonPick").addEventListener("change", (e) => {
    window.location.search = "?season=" + e.target.value;
  });

  document.getElementById("reviewlist").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const item = pending[Number(btn.dataset.index)];
    const msg = document.getElementById("reviewmsg-" + btn.dataset.index);
    const act = btn.dataset.act;

    if (act === "view") {
      try {
        window.open(await getDocumentUrl(item.row.document_path, 300), "_blank", "noopener");
      } catch (err) {
        msg.className = "error reviewmsg";
        msg.textContent = "Could not open that file. " + (err.message || "");
      }
      return;
    }

    const approved = act === "approve";
    if (!approved && !window.confirm(`Reject ${item.coach.email}'s document for "${item.module ? item.module.title : "this module"}"? They will be blocked from later modules until they upload a replacement.`)) {
      return;
    }

    msg.className = "help reviewmsg";
    msg.textContent = approved ? "Approving..." : "Rejecting...";
    try {
      await reviewModuleDocument(
        item.coach.id,
        item.row.module_id,
        item.row.season,
        approved,
        session.user.id,
        item.row.completed_at
      );
      window.location.reload();
    } catch (err) {
      // Without this an approval that hit an RLS failure would look like it
      // worked right up until the page was reloaded.
      msg.className = "error reviewmsg";
      msg.textContent = "That did not save, so nothing changed. " + (err.message || "");
    }
  });
})();

function adminRowHtml(coach) {
  const byModule = {};
  (coach.progress || []).forEach((p) => { byModule[p.module_id] = p; });
  const cells = MODULES.map((m) => {
    const p = byModule[m.id];
    if (!p) return '<td class="faint">&mdash;</td>';
    return `<td class="${p.passed ? "" : "faint"}">${moduleCellLabel(p)}</td>`;
  });
  return `<tr><td>${coach.email}</td>${cells.join("")}</tr>`;
}
