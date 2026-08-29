// Row Level Security (see supabase/schema.sql) restricts every one of these
// queries to the signed-in coach's own rows, admins get the full table.
//
// Coaches redo their training every year, so every progress row belongs to a
// season (see supabase/migrations/003-training-seasons.sql). The database owns
// the rule for which season is running and the browser asks for it, rather
// than working it out a second time here where the two could drift apart.

let cachedSeason = null;

async function getCurrentSeason() {
  if (cachedSeason !== null) return cachedSeason;
  const { data, error } = await supabaseClient.rpc("current_season");
  if (error) throw error;
  cachedSeason = data;
  return cachedSeason;
}

async function getMyProgress() {
  const season = await getCurrentSeason();
  const { data, error } = await supabaseClient
    .from("progress")
    .select("*")
    .eq("season", season);
  if (error) throw error;
  return data;
}

async function upsertProgress(coachId, moduleId, fields) {
  const season = await getCurrentSeason();
  const { error } = await supabaseClient.from("progress").upsert(
    { coach_id: coachId, module_id: moduleId, season, updated_at: new Date().toISOString(), ...fields },
    { onConflict: "coach_id,module_id,season" }
  );
  if (error) throw error;
}

async function getMyCoachRow(userId) {
  const { data, error } = await supabaseClient.from("coaches").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

// Every season that has any progress recorded against it, newest first, so the
// admin page can offer past years without guessing which ones exist.
async function getSeasonsWithProgress() {
  const { data, error } = await supabaseClient.from("progress").select("season");
  if (error) throw error;
  const seasons = Array.from(new Set(data.map((r) => r.season)));
  seasons.sort((a, b) => b - a);
  return seasons;
}

// Coaches and progress are fetched separately and joined here rather than as
// one nested query. Filtering an embedded resource by season would drop any
// coach with no rows for that season, which is exactly the coach an admin most
// needs to see in September.
async function getAllProgressForAdmin(season) {
  const [coachesResult, progressResult] = await Promise.all([
    supabaseClient.from("coaches").select("id, email, name"),
    supabaseClient
      .from("progress")
      .select("coach_id, module_id, season, quiz_score, quiz_attempts, passed, completed_at, video_furthest_seconds, document_path, document_status, document_uploaded_at")
      .eq("season", season)
  ]);
  if (coachesResult.error) throw coachesResult.error;
  if (progressResult.error) throw progressResult.error;

  const byCoach = {};
  progressResult.data.forEach((row) => {
    (byCoach[row.coach_id] = byCoach[row.coach_id] || []).push(row);
  });
  return coachesResult.data.map((c) => ({ ...c, progress: byCoach[c.id] || [] }));
}
