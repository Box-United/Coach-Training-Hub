function getModuleIdFromUrl() {
  return Number(new URLSearchParams(window.location.search).get("id"));
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
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Module not found</h2><a class="btn btn-primary" href="index.html">Back to Modules</a></div>`;
    return;
  }

  const progressRows = await getMyProgress();
  const priorModule = MODULES.find((m) => m.id === moduleId - 1);
  const priorRow = priorModule ? progressRows.find((r) => r.module_id === priorModule.id) : null;
  if (priorModule && !(priorRow && priorRow.passed)) {
    document.getElementById("app").innerHTML = `<div class="centernote"><h2>Module Locked</h2><p>Finish "${priorModule.title}" first.</p><a class="btn btn-primary" href="index.html">Back to Modules</a></div>`;
    return;
  }

  const myRow = progressRows.find((r) => r.module_id === moduleId) || null;
  const startFurthest = myRow ? myRow.video_furthest_seconds : 0;

  // Mutable across retakes within a single page load. Reading these once and
  // deriving from them on every submit would keep rewriting the same attempt
  // count, and would let a failed retake erase an earlier pass.
  let attempts = myRow ? myRow.quiz_attempts : 0;
  let everPassed = myRow ? myRow.passed : false;
  let bestScore = myRow && myRow.quiz_score !== null ? myRow.quiz_score : null;
  let firstCompletedAt = myRow ? myRow.completed_at : null;

  document.getElementById("app").innerHTML = `
    <div class="topbar">
      <div class="brand"><img src="assets/logos/box_united_stone.svg" alt="Box United" style="height:20px;width:auto;"></div>
      <div class="who"><span>${session.user.email}</span><span class="signout" id="signoutBtn">Sign out</span></div>
    </div>
    <div class="wrap">
      <div class="crumb" id="backLink">&larr; Back to Modules</div>
      <div class="lessonhead">
        <div class="eyebrow">Module ${String(mod.id).padStart(2, "0")} of ${MODULES.length}</div>
        <h2>${mod.title}</h2>
        <p class="editorial">${mod.description}</p>
      </div>
      <div class="videowrap"><div id="player"></div></div>
      <p class="videocap">Scrubbing ahead of where you've watched is disabled, we track how far you've gotten, not just where you last paused. This is a good-faith limit, not a tamperproof one.</p>
      <div class="quizcard" id="quizcard">
        ${mod.quiz.length
          ? ""
          : '<p class="help">This module\'s quiz hasn\'t been written yet, add questions in js/modules-data.js.</p>'
        }
      </div>
    </div>
  `;

  document.getElementById("signoutBtn").addEventListener("click", signOut);
  document.getElementById("backLink").addEventListener("click", () => { window.location.href = "index.html"; });

  if (mod.youtubeId) {
    initVideoPlayer("player", mod.youtubeId, startFurthest, (furthest) => {
      upsertProgress(session.user.id, moduleId, { video_furthest_seconds: furthest }).catch(() => {});
    });
  } else {
    document.getElementById("player").outerHTML = '<div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;color:var(--bu-stone);">No video set yet, add a youtubeId in js/modules-data.js.</div>';
  }

  if (mod.quiz.length) {
    renderQuiz(document.getElementById("quizcard"), mod.quiz, mod.passThreshold, async ({ pct, passed }) => {
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
})();
