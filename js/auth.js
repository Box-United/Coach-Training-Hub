async function sendMagicLink(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname }
  });
  // supabase-js resolves with an error object instead of throwing, so without
  // this check a rejected request still looks like a sent email.
  if (error) throw error;
}

async function getCurrentSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}
