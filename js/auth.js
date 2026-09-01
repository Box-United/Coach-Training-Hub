// Sign-in is email plus a shared codeword rather than a magic link.
//
// There is no separate password store. The codeword IS the account's Supabase
// password, so Supabase does the checking and nothing secret lives in this
// repo. Coaches share one codeword. Admins have their own, which is what stops
// somebody who knows the coach codeword from typing an admin address and
// reaching every coach's records and uploaded documents.
//
// That protection depends on the admin accounts already existing. See the
// README: create them in Supabase before anyone else signs in, or the sign-up
// path below will happily create them with whatever codeword was typed.

async function signIn(email, codeword) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password: codeword });
  if (!error) return;

  // Supabase returns the same "invalid login credentials" whether the account
  // does not exist or the codeword is wrong, so the only way to tell them
  // apart is to try creating it.
  if (!/invalid login credentials/i.test(error.message || "")) throw error;

  const { error: signUpError } = await supabaseClient.auth.signUp({ email, password: codeword });

  if (signUpError) {
    if (/already registered|already exists/i.test(signUpError.message || "")) {
      throw new Error("That codeword is not right for this email address.");
    }
    throw signUpError;
  }

  // With "Confirm email" switched on, sign-up succeeds but leaves no session,
  // so the coach would be bounced back to this form with no explanation.
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    throw new Error("Your account was created but needs confirming by email. Contact Box United, this should not happen.");
  }
}

async function getCurrentSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}
