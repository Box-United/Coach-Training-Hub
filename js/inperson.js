// The in-person training register, for admin.html.
//
// This roster is plain text rather than a join onto the coaches table, because
// people turn up to the in-person training before they have made an account,
// and some never make one. See supabase/migrations/006-inperson-attendance.sql.
//
// Row Level Security restricts every query here to admins. A coach's session
// cannot read the table at all, so none of this needs a second check in the
// browser, and adding one would only make it look like the browser is what is
// protecting it.

const INPERSON_STATUSES = ["attended", "excused"];

// Whatever an admin typed is the key, so normalise it before it becomes one:
// trimmed, lowercased, and collapsed on whitespace. Without this "P Acanty "
// and "p acanty" are two different people on the register.
function normalisePerson(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

async function getInPersonAttendance(season) {
  const { data, error } = await supabaseClient
    .from("inperson_attendance")
    .select("person, status, updated_at")
    .eq("season", season)
    .order("person");
  if (error) throw error;
  return data;
}

// Null clears the mark, which is how a mis-click is undone. The row stays, so
// the person is still on the register, just unmarked.
async function setInPersonStatus(season, person, status) {
  const { error } = await supabaseClient
    .from("inperson_attendance")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("season", season)
    .eq("person", person);
  if (error) throw error;
}

async function addInPersonPerson(season, person) {
  const name = normalisePerson(person);
  if (!name) throw new Error("Type a name first.");
  const { error } = await supabaseClient
    .from("inperson_attendance")
    .insert({ season, person: name });
  if (error) {
    // 23505 is the primary key, so this is a name already on the list rather
    // than anything the admin needs to debug.
    if (error.code === "23505") throw new Error(`${name} is already on the list.`);
    throw error;
  }
  return name;
}

async function removeInPersonPerson(season, person) {
  const { error } = await supabaseClient
    .from("inperson_attendance")
    .delete()
    .eq("season", season)
    .eq("person", person);
  if (error) throw error;
}

function inPersonCounts(rows) {
  return {
    attended: rows.filter((r) => r.status === "attended").length,
    excused: rows.filter((r) => r.status === "excused").length,
    unmarked: rows.filter((r) => !r.status).length,
    total: rows.length
  };
}
