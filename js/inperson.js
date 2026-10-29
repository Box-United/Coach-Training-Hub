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

// `status` is for marking somebody who is not on the register yet, which is
// what happens when an admin ticks a coach on the progress table: they go on
// the register and get their mark in one go rather than in two steps.
async function addInPersonPerson(season, person, status) {
  const name = normalisePerson(person);
  if (!name) throw new Error("Type a name first.");
  const { error } = await supabaseClient
    .from("inperson_attendance")
    .insert({ season, person: name, status: status || null });
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

// The register is plain text and the coaches table has accounts, so matching
// the two is guesswork rather than a join: see the note at the top of
// supabase/migrations/006-inperson-attendance.sql. The seeded names are of the
// form "pacanty", which is what an email local part looks like with the
// punctuation taken out, so that is tried as well as the coach's own name.
//
// A name nobody matches is not a fault. It is somebody with no account, which
// is the whole reason this table is not joined to coaches.
function inPersonKeysForCoach(coach) {
  const keys = [];
  if (coach.name) keys.push(normalisePerson(coach.name));
  const local = String(coach.email || "").split("@")[0];
  if (local) {
    keys.push(normalisePerson(local));
    keys.push(normalisePerson(local).replace(/[._-]/g, ""));
  }
  return keys.filter(Boolean);
}

function findInPersonRowForCoach(rows, coach) {
  const keys = inPersonKeysForCoach(coach);
  return rows.find((row) => keys.indexOf(normalisePerson(row.person)) !== -1) || null;
}

// The name a coach goes on the register under when an admin ticks them in the
// progress table. Their own name if we have one, so the register stays
// readable, and their email local part if we do not.
function inPersonNameForCoach(coach) {
  return normalisePerson(coach.name || String(coach.email || "").split("@")[0]);
}

// Everybody on the register who matches no account. They are the ones the
// register still has to list on its own.
function inPersonWithoutAccount(rows, coaches) {
  const claimed = new Set();
  coaches.forEach((coach) => {
    const row = findInPersonRowForCoach(rows, coach);
    if (row) claimed.add(row.person);
  });
  return rows.filter((row) => !claimed.has(row.person));
}
