// Uploading proof for modules that are completed somewhere else, like the
// SafeSport certificate or a Ramp account screenshot.
//
// Files go to a private bucket at <coach_id>/module-<n>/<timestamp>-<filename>.
// That first path segment is what the storage policies in
// supabase/schema.sql key on, so the shape here is not cosmetic, changing it
// breaks who can read what.

const DOCUMENTS_BUCKET = "coach-documents";

// A coach's file can be named anything at all, and storage keys tolerate far
// less than a filesystem does. Keep the tail rather than the head, so the
// extension survives a very long name.
function sanitizeFileName(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

// The season is in the path so a coach recertifying next year does not
// overwrite the certificate that proved they were covered this year.
function buildDocumentPath(coachId, season, moduleId, fileName) {
  return `${coachId}/${season}/module-${moduleId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}

// Checked again by the bucket itself (file_size_limit and allowed_mime_types),
// so this is a fast, friendly message rather than the actual limit.
function checkFileAgainstRules(file, upload) {
  const maxMb = upload.maxSizeMb || 10;
  if (file.size > maxMb * 1024 * 1024) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB, and the limit is ${maxMb} MB.`;
  }
  const accepted = String(upload.accept || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (accepted.length) {
    const ext = "." + String(file.name).split(".").pop().toLowerCase();
    if (accepted.indexOf(ext) === -1) {
      return `That file type is not accepted. Please upload one of: ${accepted.join(", ")}.`;
    }
  }
  return null;
}

async function uploadModuleDocument(coachId, moduleId, file) {
  const season = await getCurrentSeason();
  const path = buildDocumentPath(coachId, season, moduleId, file.name);
  const { error } = await supabaseClient.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

// The bucket is private, so anything that opens a document needs a short-lived
// signed URL. A coach can only sign their own file and an admin can sign any,
// both enforced by the storage policies rather than by this function.
async function getDocumentUrl(path, expiresInSeconds) {
  const { data, error } = await supabaseClient.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds || 300);
  if (error) throw error;
  return data.signedUrl;
}

// Called by an admin from admin.html. `passed` is what shows a module as
// complete, so it moves only here, on a real person's decision, never on the
// upload itself.
async function reviewModuleDocument(coachId, moduleId, season, approved, adminId, existingCompletedAt) {
  const now = new Date().toISOString();
  const { error } = await supabaseClient
    .from("progress")
    .update({
      document_status: approved ? "approved" : "rejected",
      document_reviewed_at: now,
      document_reviewed_by: adminId,
      passed: approved,
      completed_at: approved ? (existingCompletedAt || now) : null,
      updated_at: now
    })
    .eq("coach_id", coachId)
    .eq("module_id", moduleId)
    // Without this the update would hit every season's row for this coach and
    // module, rewriting past years as a side effect of approving this one.
    .eq("season", season);
  if (error) throw error;
}
