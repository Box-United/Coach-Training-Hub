function getModuleIdFromUrl() {
  return Number(new URLSearchParams(window.location.search).get("id"));
}

// A module carries either a single `youtubeId` or a `videos` array (see
// js/modules-data.js). Everything below works off the array, so normalize the
// shorthand into one rather than branching on shape all the way down.
function getModuleVideos(mod) {
  if (Array.isArray(mod.videos)) {
    return mod.videos.filter((v) => v && v.youtubeId);
  }
  return mod.youtubeId ? [{ youtubeId: mod.youtubeId, title: null }] : [];
}

// Positions are stored per video index in the `video_progress` jsonb column.
// Rows written before that column existed only have the single
// `video_furthest_seconds` int, which was always the first video's position.
function readVideoProgress(row) {
  if (!row) return {};
  if (row.video_progress && typeof row.video_progress === "object") {
    return { ...row.video_progress };
  }
  return row.video_furthest_seconds ? { 0: row.video_furthest_seconds } : {};
}

function sumVideoProgress(progressByIndex) {
  return Object.values(progressByIndex).reduce((total, s) => total + (Number(s) || 0), 0);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

(async function init() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  const moduleId = getModuleIdFromUrl();
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) {
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Module not found</h2><a class="btn btn-primary" href="training.html">Back to Training</a></div>`;
    return;
  }

  // Admins review content, so the sequential lock and the video gate both
  // stand aside for them. Wrapped because a missing coaches row should not
  // take the page down for an ordinary coach.
  let isAdmin = false;
  try {
    isAdmin = !!(await getMyCoachRow(session.user.id)).is_admin;
  } catch (err) {
    isAdmin = false;
  }

  const progressRows = await getMyProgress();
  const priorModule = MODULES.find((m) => m.id === moduleId - 1);
  const priorRow = priorModule ? progressRows.find((r) => r.module_id === priorModule.id) : null;
  // Mirrors can_write_module in supabase/schema.sql: a document still waiting
  // on review is enough to move on, so nobody is stuck behind an admin.
  const priorSatisfied = priorRow && (priorRow.passed || priorRow.document_status === "pending" || priorRow.document_status === "approved");
  if (priorModule && !priorSatisfied && !isAdmin) {
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Module Locked</h2><p>Finish "${priorModule.title}" first.</p><a class="btn btn-primary" href="training.html">Back to Training</a></div>`;
    return;
  }

  const myRow = progressRows.find((r) => r.module_id === moduleId) || null;
  const videos = getModuleVideos(mod);
  const videoProgress = readVideoProgress(myRow);

  // Mutable across retakes within a single page load. Reading these once and
  // deriving from them on every submit would keep rewriting the same attempt
  // count, and would let a failed retake erase an earlier pass.
  let attempts = myRow ? myRow.quiz_attempts : 0;
  let everPassed = myRow ? myRow.passed : false;
  let bestScore = myRow && myRow.quiz_score !== null ? myRow.quiz_score : null;
  let firstCompletedAt = myRow ? myRow.completed_at : null;

  let documentPath = myRow ? myRow.document_path : null;
  let documentStatus = (myRow && myRow.document_status) || "none";
  let documentUploadedAt = myRow ? myRow.document_uploaded_at : null;

  const hasVideos = videos.length > 0;
  const videosHtml = hasVideos
    ? videos.map((video, i) => `
        <div class="videoblock">
          ${videos.length > 1
            ? `<div class="videolabel"><span class="eyebrow">${video.title || "Video " + (i + 1)}</span><span class="videostate" id="videostate-${i}"></span></div>`
            : ""
          }
          <div class="videowrap"><div id="player-${i}"></div></div>
        </div>
      `).join("")
    : (mod.upload
        // An upload-only module has no video, and saying "no video set yet"
        // there would read as a fault rather than as the design.
        ? ""
        : '<div class="videowrap" style="display:flex;align-items:center;justify-content:center;color:var(--bu-stone);">No video set yet, add a youtubeId in js/modules-data.js.</div>');

  const showQuizCard = mod.quiz.length > 0 || !mod.upload;

  document.getElementById("app").innerHTML = `
    ${topbarHtml(session.user.email, "training")}
    <div class="wrap">
      <div class="crumb" id="backLink">&larr; Back to Training</div>
      ${isAdmin ? '<div class="adminnote">Viewing as an admin. Module locks and the watch-the-video gate are off for you, a coach would have to earn their way here.</div>' : ""}
      <div class="lessonhead">
        <div class="eyebrow">Module ${String(mod.id).padStart(2, "0")} of ${MODULES.length}</div>
        <h2>${mod.title}</h2>
        <p class="editorial">${mod.description}</p>
      </div>
      ${videosHtml}
      ${hasVideos ? '<p class="videocap">Scrubbing ahead of where you\'ve watched is disabled, we track how far you\'ve gotten, not just where you last paused. This is a good-faith limit, not a tamperproof one.</p>' : ""}
      ${mod.upload ? '<div class="quizcard" id="uploadcard"></div>' : ""}
      ${showQuizCard
        ? `<div class="quizcard" id="quizcard">${mod.quiz.length ? "" : '<p class="help">This module\'s quiz hasn\'t been written yet, add questions in js/modules-data.js.</p>'}</div>`
        : ""
      }
    </div>
  `;

  document.getElementById("signoutBtn").addEventListener("click", signOut);
  document.getElementById("backLink").addEventListener("click", () => { window.location.href = "training.html"; });

  // ------------------------------------------------------------- upload

  function renderUploadCard() {
    const card = document.getElementById("uploadcard");
    if (!card) return;
    const up = mod.upload;

    const statusLine = {
      none: '<span class="docstate">Nothing uploaded yet</span>',
      pending: `<span class="docstate is-pending">Uploaded ${formatDate(documentUploadedAt)}, waiting on review</span>`,
      approved: `<span class="docstate is-approved">Approved</span>`,
      rejected: '<span class="docstate is-rejected">Not accepted, please upload a replacement</span>'
    }[documentStatus] || "";

    card.innerHTML = `
      <div class="quizhead">
        <div class="eyebrow">Proof required</div>
        ${statusLine}
      </div>
      <p class="help">${up.prompt}</p>
      ${up.linkUrl
        ? `<p><a class="btn btn-outline btn-sm" href="${escapeAttr(up.linkUrl)}" target="_blank" rel="noopener noreferrer">${up.linkLabel || "Open the training"}</a></p>`
        : ""
      }
      ${documentStatus === "approved"
        ? '<p class="help">Your document has been approved, nothing further is needed here.</p>'
        : `
          <div class="uploadrow">
            <input type="file" id="docInput" accept="${up.accept || ""}">
            <button class="btn btn-primary btn-sm" id="docUploadBtn">${documentPath ? "Replace file" : "Upload"}</button>
          </div>
          <div class="help" id="docMsg"></div>
        `
      }
      ${documentPath ? '<p class="help"><a href="#" id="docViewLink">View what you uploaded</a></p>' : ""}
      ${documentStatus === "pending"
        ? '<p class="help">You can carry on to the next module while this is being reviewed. It will not show as complete until it has been approved.</p>'
        : ""
      }
    `;

    const viewLink = card.querySelector("#docViewLink");
    if (viewLink) {
      viewLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          window.open(await getDocumentUrl(documentPath, 300), "_blank", "noopener");
        } catch (err) {
          const msg = card.querySelector("#docMsg");
          if (msg) { msg.className = "error"; msg.textContent = "Could not open that file."; }
        }
      });
    }

    const btn = card.querySelector("#docUploadBtn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const input = card.querySelector("#docInput");
      const msg = card.querySelector("#docMsg");
      const file = input.files && input.files[0];
      msg.className = "help";
      if (!file) { msg.textContent = "Choose a file first."; return; }

      const problem = checkFileAgainstRules(file, up);
      if (problem) { msg.className = "error"; msg.textContent = problem; return; }

      btn.disabled = true;
      msg.textContent = "Uploading...";
      try {
        const path = await uploadModuleDocument(session.user.id, moduleId, file);
        const uploadedAt = new Date().toISOString();
        await upsertProgress(session.user.id, moduleId, {
          document_path: path,
          document_uploaded_at: uploadedAt,
          document_status: "pending"
        });
        documentPath = path;
        documentUploadedAt = uploadedAt;
        documentStatus = "pending";
        renderUploadCard();
      } catch (err) {
        // Say plainly that it did not save. A silent failure here would leave
        // a coach believing they had submitted their certificate.
        btn.disabled = false;
        msg.className = "error";
        msg.textContent = "That did not upload, so nothing was recorded. " + (err.message || "Please try again.");
      }
    });
  }

  renderUploadCard();

  // -------------------------------------------------------- video + quiz

  // Whether each video has been watched to the end. Seeded from the saved
  // position where we can, but a saved position alone is not enough to judge
  // completion, that needs the duration, which only arrives once a player
  // loads. So these start false and the players report in.
  const videoComplete = videos.map(() => false);
  const quizcard = document.getElementById("quizcard");
  let quizRendered = false;

  // A coach who already passed keeps access to the quiz for review. Locking
  // them back out because they have not re-watched would be a downgrade, and
  // would strand anyone whose video got swapped after they finished it.
  function quizIsUnlocked() {
    return isAdmin || everPassed || videos.length === 0 || videoComplete.every(Boolean);
  }

  function renderQuizLockedNotice() {
    if (!quizcard) return;
    const remaining = videoComplete.filter((done) => !done).length;
    quizcard.innerHTML = `
      <div class="quizhead">
        <div class="eyebrow">Quiz &middot; locked</div>
      </div>
      <p class="help">${videos.length > 1
        ? `Watch all ${videos.length} videos through to the end to unlock the quiz, ${remaining} still to go.`
        : "Watch the video through to the end to unlock the quiz."
      }</p>
    `;
  }

  function renderQuizIfUnlocked() {
    if (quizRendered || !quizcard || !mod.quiz.length || !quizIsUnlocked()) return;
    quizRendered = true;
    renderQuiz(quizcard, mod.quiz, mod.passThreshold, async ({ pct, passed }) => {
      attempts += 1;
      if (passed && !firstCompletedAt) firstCompletedAt = new Date().toISOString();
      everPassed = everPassed || passed;
      // Keep the best score, so a passed module never shows a failing score.
      if (bestScore === null || pct > bestScore) bestScore = pct;

      await upsertProgress(session.user.id, moduleId, {
        quiz_score: bestScore,
        quiz_attempts: attempts,
        passed: everPassed,
        completed_at: firstCompletedAt
      });
    });
  }

  function updateVideoStateLabel(i) {
    const el = document.getElementById(`videostate-${i}`);
    if (el) el.textContent = videoComplete[i] ? "Watched" : "Not finished";
  }

  if (mod.quiz.length && !quizIsUnlocked()) renderQuizLockedNotice();
  renderQuizIfUnlocked();

  videos.forEach((video, i) => {
    updateVideoStateLabel(i);
    const startFurthest = Number(videoProgress[i]) || 0;
    createVideoPlayer(`player-${i}`, video.youtubeId, startFurthest, ({ furthest, complete }) => {
      const wasComplete = videoComplete[i];
      videoComplete[i] = complete;
      if (wasComplete !== complete) updateVideoStateLabel(i);

      if (Number(videoProgress[i] || 0) !== furthest) {
        videoProgress[i] = furthest;
        upsertProgress(session.user.id, moduleId, {
          video_progress: videoProgress,
          // Kept in sync so the admin view, and any query written before the
          // jsonb column existed, still sees one meaningful number: total
          // seconds watched across this module.
          video_furthest_seconds: sumVideoProgress(videoProgress)
        }).catch(() => {});
      }

      if (quizRendered) return;
      if (quizIsUnlocked()) renderQuizIfUnlocked();
      else if (mod.quiz.length) renderQuizLockedNotice();
    }).catch(() => {});
  });
})();
