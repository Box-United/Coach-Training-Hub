// Which modules a coach has finished, and whether their training is done.
//
// This sits apart from the training page because the curriculum pages need the
// same answer: the weekly curriculum only opens once training is complete.
// Working it out a second time over there would let the two drift, and these
// rules already mirror can_write_module in supabase/schema.sql.

function computeModuleStatus(modules, progressRows) {
  const byModule = {};
  progressRows.forEach((row) => { byModule[row.module_id] = row; });

  let unlocked = true;
  return modules.map((mod) => {
    // Listed but not built yet. It never blocks what follows it, and a coach
    // cannot open it, so it sits outside the chain entirely.
    if (mod.comingSoon) return { module: mod, row: null, status: "soon" };

    const row = byModule[mod.id];
    const passed = !!(row && row.passed);
    const awaitingReview = !!(row && row.document_status === "pending");

    // Mirrors can_write_module in supabase/schema.sql. A document still
    // waiting on an admin lets a coach carry on with training, but the module
    // itself is not complete until it has actually been approved. A rejected
    // document does not open anything, so they go back to being blocked.
    const opensNext = passed || awaitingReview;

    let status;
    if (passed) status = "complete";
    else if (awaitingReview) status = "pending";
    else if (unlocked) status = "current";
    else status = "locked";

    if (!opensNext) unlocked = false;
    return { module: mod, row, status };
  });
}

// The modules a coach is actually expected to finish. One listed with
// `comingSoon` has not been built, so counting it would hold everybody short
// of complete forever.
function countableModules(modules) {
  return modules.filter((m) => !m.comingSoon);
}

// Training is done only when every countable module has been passed or
// approved. A document still sitting in review is deliberately not enough:
// it lets a coach carry on through the remaining modules, but it has not been
// checked by anyone yet, so it does not hand over the season's curriculum.
function isTrainingComplete(statuses) {
  const countable = statuses.filter((s) => s.status !== "soon");
  return countable.length > 0 && countable.every((s) => s.status === "complete");
}

// What a coach still has to do, for the message on a locked curriculum page.
// "Pending" is counted separately because the coach has already done their
// part there and only needs to wait, which is a very different thing to be
// told than "go and finish four modules".
function trainingRemaining(statuses) {
  const countable = statuses.filter((s) => s.status !== "soon");
  return {
    outstanding: countable.filter((s) => s.status !== "complete" && s.status !== "pending").length,
    pending: countable.filter((s) => s.status === "pending").length
  };
}
