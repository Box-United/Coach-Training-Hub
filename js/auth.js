async function sendMagicLink(email) {
  return supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname }
  });
}

async function getCurrentSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}
