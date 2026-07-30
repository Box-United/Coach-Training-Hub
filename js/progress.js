// Row Level Security (see supabase/schema.sql) restricts every one of these
// queries to the signed-in coach's own rows, admins get the full table.

async function getMyProgress() {
  const { data, error } = await supabaseClient.from("progress").select("*");
  if (error) throw error;
  return data;
}

async function upsertProgress(coachId, moduleId, fields) {
  const { error } = await supabaseClient.from("progress").upsert(
    { coach_id: coachId, module_id: moduleId, updated_at: new Date().toISOString(), ...fields },
    { onConflict: "coach_id,module_id" }
  );
  if (error) throw error;
}

async function getMyCoachRow(userId) {
  const { data, error } = await supabaseClient.from("coaches").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

async function getAllProgressForAdmin() {
  const { data, error } = await supabaseClient
    .from("coaches")
    .select("id, email, name, progress(module_id, quiz_score, quiz_attempts, passed, completed_at, video_furthest_seconds)");
  if (error) throw error;
  return data;
}
