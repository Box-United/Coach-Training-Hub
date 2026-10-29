// Did this coach clear the module's own quiz threshold? This is deliberately
// separate from the `passed` column, which stays false until everything else
// the module asks for, such as a document, is done too.
function quizPassedForModule(row, mod) {
  if (!row || !mod || !mod.quiz.length) return false;
  if (row.quiz_score === null || row.quiz_score === undefined) return false;
  return row.quiz_score >= mod.passThreshold;
}

// One label per coach, per module, shared by the table and the CSV export so
// the two can never drift apart. It needs the module as well as the progress
// row, because judging a quiz score means knowing that module's threshold.
function moduleCellLabel(p, mod) {
  if (!p) return "not started";
  // A module proved by uploading a document has no quiz score.
  if (p.passed) {
    return p.quiz_score === null || p.quiz_score === undefined ? "approved" : `passed ${p.quiz_score}%`;
  }

  // A module can ask for a quiz and a document. Judge the quiz on its own
  // threshold rather than on `passed`, which also waits on an admin approving
  // the document. Without this, a coach who aced the quiz and has simply not
  // uploaded yet reads as "failed", at the very score they passed with.
  const quizPassed = quizPassedForModule(p, mod);
  const quizFailed = p.quiz_attempts > 0 && !quizPassed
    && p.quiz_score !== null && p.quiz_score !== undefined;

  // A document waiting on review would otherwise hide an unpassed quiz.
  if (p.document_status === "pending") {
    return quizFailed ? `in review, quiz failed ${p.quiz_score}%` : "in review";
  }
  if (p.document_status === "rejected") return "rejected";
  if (quizPassed) return `quiz passed ${p.quiz_score}%, awaiting document`;
  if (quizFailed) return `failed ${p.quiz_score}%`;
  return "in progress";
}

// The same answer as moduleCellLabel, as a mark rather than a sentence. Ten
// sentences do not fit across a screen, and an admin reading the table is
// scanning for the module that is not done rather than reading every cell.
// The full wording stays on the cell's title, in the panel it opens, and in
// the CSV, which is where anyone reading closely ends up.
function moduleCellMark(p, mod) {
  if (!p) return { text: "&mdash;", cls: "faint" };
  if (p.passed) {
    const scored = p.quiz_score !== null && p.quiz_score !== undefined;
    return { text: scored ? `&check; ${p.quiz_score}%` : "&check;", cls: "ok" };
  }

  const quizPassed = quizPassedForModule(p, mod);
  const quizFailed = p.quiz_attempts > 0 && !quizPassed
    && p.quiz_score !== null && p.quiz_score !== undefined;

  if (p.document_status === "pending") return { text: "&hellip;", cls: "wait" };
  if (p.document_status === "rejected") return { text: "&times;", cls: "bad" };
  // Half done: the quiz is passed and the document has not arrived.
  if (quizPassed) return { text: `${p.quiz_score}% &hellip;`, cls: "wait" };
  if (quizFailed) return { text: `&times; ${p.quiz_score}%`, cls: "bad" };
  return { text: "&middot;", cls: "faint" };
}

function progressToCsv(coaches, season, inPerson) {
  const header = ["Season", "Email", "Name", "In person", ...MODULES.map((m) => `Module ${m.id}`)];
  const rows = coaches.map((c) => {
    const byModule = {};
    (c.progress || []).forEach((p) => { byModule[p.module_id] = p; });
    const cells = MODULES.map((m) => moduleCellLabel(byModule[m.id], m));
    return [seasonLabel(season), c.email, c.name || "", inPersonLabel(findInPersonRowForCoach(inPerson || [], c)), ...cells];
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

// The in-person column in a line, for the heading over the progress table.
// Counted over the coaches in the table rather than over the register, so the
// numbers add up to what is on screen. A register row matching no account is
// not counted, and is not shown anywhere: see the note in js/inperson.js.
function inPersonCountsLabel(coaches, rows) {
  const marks = coaches.map((coach) => {
    const row = findInPersonRowForCoach(rows || [], coach);
    return row ? row.status : null;
  });
  const attended = marks.filter((m) => m === "attended").length;
  const excused = marks.filter((m) => m === "excused").length;
  return `in person: ${attended} attended &middot; ${excused} excused &middot; ${marks.length - attended - excused} not marked`;
}

// Season 2026 runs Sept 2026 to Aug 2027, which everyone calls "2026-27".
function seasonLabel(season) {
  return `${season}-${String(season + 1).slice(-2)}`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// A module can carry a quiz as well as a document. Approving the document
// completes it only if the quiz has been passed too.
function quizSatisfiedFor(item) {
  const mod = item.module;
  if (!mod || !mod.quiz.length) return true;
  return quizPassedForModule(item.row, mod);
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
        ${quizSatisfiedFor(item) ? "" : '<div class="reviewwarn">Quiz not passed yet, so approving this will not complete the module.</div>'}
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

// A missing table means migration 006 has not been run. That is a setup step
// rather than a fault, so it says so and names the file, instead of showing
// an admin a Postgres error they cannot act on.
function inPersonUnavailableHtml(err) {
  const message = (err && err.message) || "";
  const notSetUp = /does not exist|schema cache|relation|42P01|PGRST205/i.test(message);
  return `
    <div class="sectiontitle" style="margin-top:28px;">
      <h3>In-Person Training</h3>
    </div>
    <div class="quizcard">
      ${notSetUp
        ? `<p>The register is not set up yet. Run <strong>supabase/migrations/006-inperson-attendance.sql</strong>
           in the Supabase SQL editor, then reload this page.</p>
           <p class="help" style="margin-top:10px;">Everything else on this page works without it.</p>`
        : `<p>The register could not be loaded.</p>`}
      ${message ? `<p class="help" style="margin-top:10px;">${message}</p>` : ""}
    </div>`;
}


// The screen an admin gets when something did not load. Deliberately does not
// assume the rest of the site is working: if nav.js is what failed, calling
// topbarHtml here would throw inside the error handler and blank the page,
// which is the exact thing this is here to prevent.
function adminErrorHtml(session, err, lead) {
  let bar = "";
  try {
    bar = topbarHtml(session.user.email);
  } catch (e) {
    bar = "";
  }
  const message = (err && err.message) || "No error message was given.";
  return bar + `
    <div class="centernote">
      <h2>Could not load the admin page</h2>
      <p>${lead}</p>
      <p class="help">${message}</p>
      <a class="btn btn-primary" href="training.html">Back to Training</a>
    </div>`;
}

function wireSignout() {
  const out = document.getElementById("signoutBtn");
  if (out) out.addEventListener("click", signOut);
}

(async function init() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = "./";
    return;
  }

  // Inside the net too: .single() throws when the row is missing or RLS
  // refuses it, and that was the last call here that could blank the page.
  let me;
  try {
    me = await getMyCoachRow(session.user.id);
  } catch (err) {
    document.getElementById("app").innerHTML = adminErrorHtml(session, err,
      "We could not look up your account, so there is nothing to show yet.");
    wireSignout();
    return;
  }

  if (!me.is_admin) {
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Not Authorized</h2><p>This page is restricted to Box United admins.</p><a class="btn btn-primary" href="training.html">Back to Training</a></div>`;
    return;
  }

  // Everything past this point talks to Supabase. Without a catch, any one of
  // those failing renders nothing at all, which is what a missing table used
  // to do here. An admin should be told what broke, not handed a blank page.
  try {
  const currentSeason = await getCurrentSeason();
  const seasons = await getSeasonsWithProgress();
  // Always offer the running season, even before anyone has started it.
  if (seasons.indexOf(currentSeason) === -1) seasons.unshift(currentSeason);

  const requested = Number(new URLSearchParams(window.location.search).get("season"));
  const season = seasons.indexOf(requested) !== -1 ? requested : currentSeason;

  const coaches = await getAllProgressForAdmin(season);
  const pending = pendingDocuments(coaches);
  // The register is one section of this page, so it must not be able to take
  // the whole thing down. Before migration 006 has been run the table is not
  // there at all, and an uncaught throw here left admins looking at a blank
  // page with no clue which part failed.
  let inPerson = [];
  let inPersonError = null;
  try {
    inPerson = await getInPersonAttendance(season);
  } catch (err) {
    inPersonError = err;
  }

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
        <span class="muted" id="ipcounts" style="font-size:12.5px">${inPersonError ? "in person: register not set up" : inPersonCountsLabel(coaches, inPerson)}</span>
        <button class="btn btn-outline btn-sm" id="exportBtn">Export CSV</button>
      </div>
      <div class="tablewrap">
        <table class="admintable">
          <thead><tr><th>Coach</th><th>In Person</th>${MODULES.map((m) => `<th>M${m.id}</th>`).join("")}</tr></thead>
          <tbody>
            ${coaches.map((c, i) => adminRowHtml(c, i, inPersonError ? null : inPerson)).join("")}
          </tbody>
        </table>
      </div>
      <p class="help tablenote">
        ${inPersonError ? "" : `<strong>In Person</strong> &check; attended, <strong>E</strong> excused;
        clicking the mark that is already on clears it.`}
        <strong>Modules</strong> <span class="ok">&check;</span> complete, with the quiz score where there is one;
        <span class="wait">&hellip;</span> waiting on an admin; <span class="wait">90% &hellip;</span> quiz passed,
        document still to come; <span class="bad">&times;</span> rejected or failed;
        <span class="faint">&middot;</span> started; <span class="faint">&mdash;</span> nothing yet.
        Hovering a cell spells it out, and an underlined one opens the documents that coach uploaded.
      </p>
      <p class="help tablemsg" id="tableMsg"></p>

      ${inPersonError ? inPersonUnavailableHtml(inPersonError) : ""}
    </div>
  `;

  document.getElementById("signoutBtn").addEventListener("click", signOut);
  document.getElementById("exportBtn").addEventListener("click", () => downloadCsv(progressToCsv(coaches, season, inPersonError ? [] : inPerson), season));
  document.getElementById("seasonPick").addEventListener("change", (e) => {
    window.location.search = "?season=" + e.target.value;
  });

  const tableMsg = document.getElementById("tableMsg");

  // Redraw the marks in place, so ticking somebody does not cost a page load
  // and lose the admin's place in a long table.
  function redrawInPerson() {
    coaches.forEach((coach, i) => {
      const cell = document.querySelector(`td.ipcell[data-ip-cell="${i}"]`);
      if (cell) cell.innerHTML = inPersonMarksHtml(i, findInPersonRowForCoach(inPerson, coach));
    });
    const counts = document.getElementById("ipcounts");
    if (counts) counts.innerHTML = inPersonCountsLabel(coaches, inPerson);
  }

  // Ticking a coach in the table. Somebody who is not on the register yet goes
  // on it with the mark in one call, so an admin never has to add a coach who
  // already has an account by hand.
  async function markCoachInPerson(btn) {
    const coach = coaches[Number(btn.dataset.ipCoach)];
    const wanted = btn.dataset.ipMark;
    const row = findInPersonRowForCoach(inPerson, coach);
    // Clicking the mark that is already on clears it, same as the list below.
    const next = row && row.status === wanted ? null : wanted;

    tableMsg.className = "help tablemsg";
    tableMsg.textContent = "";
    const before = row ? row.status : null;
    try {
      if (row) {
        await setInPersonStatus(season, row.person, next);
        row.status = next;
        row.updated_at = new Date().toISOString();
      } else {
        const name = await addInPersonPerson(season, inPersonNameForCoach(coach), next);
        inPerson.push({ person: name, status: next, updated_at: new Date().toISOString() });
        inPerson.sort((a, b) => a.person.localeCompare(b.person));
      }
      redrawInPerson();
    } catch (err) {
      // Put it back, or the table would show a mark that is not in the
      // database. A failed insert added nothing, so there is nothing to undo.
      if (row) row.status = before;
      redrawInPerson();
      tableMsg.className = "error tablemsg";
      tableMsg.textContent = "That did not save, so nothing changed. " + (err.message || "");
    }
  }

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
      await reviewModuleDocument({
        coachId: item.coach.id,
        moduleId: item.row.module_id,
        season: item.row.season,
        approved,
        adminId: session.user.id,
        completedAt: item.row.completed_at,
        quizSatisfied: quizSatisfiedFor(item)
      });
      window.location.reload();
    } catch (err) {
      // Without this an approval that hit an RLS failure would look like it
      // worked right up until the page was reloaded.
      msg.className = "error reviewmsg";
      msg.textContent = "That did not save, so nothing changed. " + (err.message || "");
    }
  });

  // Clicking a cell that has a document behind it opens what the coach
  // actually uploaded. Reviewing happens in the section above; this is for
  // looking at a module that has already been dealt with, which is most of
  // them by the time anybody asks what a coach sent in.
  const emailById = {};
  coaches.forEach((c) => { emailById[c.id] = c.email; });
  // Storage is asked once per module and the answer kept, so opening and
  // closing the same panel does not hit it again.
  const docsCache = {};
  let openDocs = null;

  function closeDocs() {
    if (openDocs === null) return;
    const prevBtn = document.querySelector(`button[data-docs="${openDocs}"]`);
    if (prevBtn) prevBtn.setAttribute("aria-expanded", "false");
    const prevRow = document.getElementById("docsrow-" + openDocs.split("-")[0]);
    if (prevRow) {
      prevRow.hidden = true;
      prevRow.firstElementChild.innerHTML = "";
    }
    openDocs = null;
  }

  document.querySelector(".admintable tbody").addEventListener("click", async (e) => {
    const markBtn = e.target.closest("button[data-ip-mark]");
    if (markBtn) {
      await markCoachInPerson(markBtn);
      return;
    }

    if (e.target.closest("button[data-docs-close]")) {
      closeDocs();
      return;
    }

    const openBtn = e.target.closest("button[data-doc-open]");
    if (openBtn) {
      const note = openBtn.closest(".docspanel").querySelector(".docsmsg");
      note.className = "help docsmsg";
      note.textContent = "";
      try {
        window.open(await getDocumentUrl(openBtn.dataset.docOpen, 300), "_blank", "noopener");
      } catch (err) {
        note.className = "error docsmsg";
        note.textContent = "Could not open that file. " + (err.message || "");
      }
      return;
    }

    const btn = e.target.closest("button[data-docs]");
    if (!btn) return;

    const key = btn.dataset.docs;
    // The same cell again closes the panel.
    if (openDocs === key) {
      closeDocs();
      return;
    }
    closeDocs();

    const coachIndex = Number(key.split("-")[0]);
    const moduleId = Number(key.split("-")[1]);
    const coach = coaches[coachIndex];
    const row = (coach.progress || []).find((p) => p.module_id === moduleId);
    if (!row) return;
    const mod = MODULES.find((m) => m.id === moduleId);
    const reviewer = emailById[row.document_reviewed_by];

    const detailRow = document.getElementById("docsrow-" + coachIndex);
    const detailCell = detailRow.firstElementChild;
    openDocs = key;
    btn.setAttribute("aria-expanded", "true");
    detailRow.hidden = false;
    detailCell.innerHTML = docsPanelHtml(coach, mod, row, reviewer,
      '<p class="help">Looking up the files...</p>');

    let body;
    if (docsCache[row.document_path]) {
      body = docFilesHtml(docsCache[row.document_path], row.document_path);
    } else {
      try {
        const files = await listModuleDocuments(row.document_path);
        docsCache[row.document_path] = files;
        body = docFilesHtml(files, row.document_path);
      } catch (err) {
        // Listing the folder is the extra; the document on the progress row is
        // the thing an admin came for, so a failure here still shows that.
        body = docsFallbackHtml(row, err);
      }
    }
    // An admin can click another cell while storage is still answering, and
    // the panel they are looking at now must not be overwritten by this one.
    if (openDocs !== key) return;
    detailCell.innerHTML = docsPanelHtml(coach, mod, row, reviewer, body);
  });

  } catch (err) {
    document.getElementById("app").innerHTML = adminErrorHtml(session, err,
      "Something this page needs did not come back from the database, so none of it is showing.");
    wireSignout();
    throw err;
  }
})();

// How a coach's in-person attendance reads, shared with the CSV export.
function inPersonLabel(row) {
  if (!row) return "not on the register";
  if (row.status === "attended") return "attended";
  if (row.status === "excused") return "excused";
  return "not marked";
}

// Two marks, a tick and an E, each its own toggle. A coach who is not on the
// register yet has no mark on either, and clicking one puts them on it.
function inPersonMarksHtml(coachIndex, row) {
  const status = row ? row.status : null;
  const mark = (value, glyph, label) => `
    <button class="ipmark${status === value ? " is-on" : ""}" type="button"
            data-ip-mark="${value}" data-ip-coach="${coachIndex}"
            aria-pressed="${status === value}">
      <span aria-hidden="true">${glyph}</span><span class="sronly">${label}</span>
    </button>`;
  return mark("attended", "&check;", "Attended in person") + mark("excused", "E", "Excused from in-person training");
}

function inPersonCellHtml(coachIndex, row) {
  return `<td class="ipcell" data-ip-cell="${coachIndex}">${inPersonMarksHtml(coachIndex, row)}</td>`;
}

function adminRowHtml(coach, coachIndex, inPerson) {
  // Without the register (migration 006 not run yet) the column is still
  // there, so no other column shifts, but marks that could only fail to save
  // would be worse than no marks at all.
  const inPersonCell = inPerson
    ? inPersonCellHtml(coachIndex, findInPersonRowForCoach(inPerson, coach))
    : '<td class="faint">&mdash;</td>';
  const byModule = {};
  (coach.progress || []).forEach((p) => { byModule[p.module_id] = p; });
  const cells = MODULES.map((m) => {
    const p = byModule[m.id];
    const mark = moduleCellMark(p, m);
    const full = moduleCellLabel(p, m);
    // A module proved by uploading something (SafeSport, Ramp) keeps every
    // file the coach sent. Once there is one, the cell opens that trail, which
    // otherwise can only be seen while the document is still awaiting review.
    if (!p || !p.document_path) {
      return `<td class="modcell ${mark.cls}" title="${escapeAttr(full)}">${mark.text}</td>`;
    }
    // The mark is hidden from screen readers and the full wording given
    // instead, because a tick on its own tells somebody who cannot see the
    // colour nothing at all.
    return `<td class="modcell ${mark.cls}">
      <button class="celldocs" type="button" aria-expanded="false"
              data-docs="${coachIndex}-${m.id}" title="${escapeAttr(full)}">
        <span aria-hidden="true">${mark.text}</span><span class="sronly">${full}, see the documents</span>
      </button>
    </td>`;
  });
  // The panel opens into a row of its own rather than inside the cell, so a
  // list of file names cannot stretch one column of an already wide table.
  return `<tr><td>${coach.email}</td>${inPersonCell}${cells.join("")}</tr>
    <tr class="docsrow" id="docsrow-${coachIndex}" hidden><td colspan="${MODULES.length + 2}"></td></tr>`;
}


// ---- the documents behind a cell in the progress table ----

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// What has happened to the current document, in a line. The reviewer is a
// coach id on the row, which only means something next to the coaches the page
// has already loaded, so it is passed in rather than looked up here.
function documentStatusLine(row, reviewerEmail) {
  const when = row.document_reviewed_at ? " " + formatDate(row.document_reviewed_at) : "";
  const by = reviewerEmail ? ` by ${reviewerEmail}` : "";
  if (row.document_status === "approved") return `approved${when}${by}`;
  if (row.document_status === "rejected") return `rejected${when}${by}, waiting on a replacement`;
  if (row.document_status === "pending") return "waiting on review";
  return "no document recorded";
}

function docsPanelHtml(coach, mod, row, reviewerEmail, body) {
  return `
    <div class="docspanel">
      <div class="docshead">
        <div>
          <div class="docstitle">${mod ? mod.title : "Module " + row.module_id}</div>
          <div class="docswho">${coach.email} &middot; ${documentStatusLine(row, reviewerEmail)}</div>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" data-docs-close="1">Close</button>
      </div>
      ${body}
      <p class="help docsmsg"></p>
    </div>`;
}

function docFileHtml(name, meta, path, isCurrent) {
  return `
    <li class="docfile">
      <div class="docfilewho">
        <div class="docname">${name}</div>
        <div class="docmeta">${meta}${isCurrent ? '<span class="doctag">current submission</span>' : ""}</div>
      </div>
      <button class="btn btn-outline btn-sm" type="button" data-doc-open="${escapeAttr(path)}">Open</button>
    </li>`;
}

function docFilesHtml(files, currentPath) {
  if (!files.length) {
    return '<p class="help">The progress row points at a document, but the folder holding it is empty.</p>';
  }
  const items = files.map((f) => {
    const meta = [f.uploadedAt ? "uploaded " + formatDate(f.uploadedAt) : "", formatFileSize(f.size)]
      .filter(Boolean).join(" &middot; ");
    return docFileHtml(f.name, meta, f.path, f.path === currentPath);
  }).join("");
  // Nothing deletes an old file, so more than one here is a coach who replaced
  // what they first sent. Worth saying, because the extra files are not a
  // fault and the newest is the one that was reviewed.
  const note = files.length > 1
    ? `<p class="help">${files.length} files, newest first. A coach who uploads again does not erase what they sent before.</p>`
    : "";
  return `<ul class="doclist">${items}</ul>${note}`;
}

// Storage would not list the folder. The document named on the progress row
// can still be opened, which is the one an admin most often wants.
function docsFallbackHtml(row, err) {
  const name = String(row.document_path).split("/").pop().replace(/^\d+-/, "");
  const meta = row.document_uploaded_at ? "uploaded " + formatDate(row.document_uploaded_at) : "";
  return `<ul class="doclist">${docFileHtml(name, meta, row.document_path, true)}</ul>
    <p class="help">Earlier files could not be listed, so only the current document is shown here. ${err.message || ""}</p>`;
}
