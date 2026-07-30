// Requires the Supabase JS CDN script and config.js to be loaded first.
let supabaseClient = null;
if (!SUPABASE_URL || SUPABASE_URL.indexOf("PASTE_") === 0) {
  document.getElementById("app").innerHTML = `
    <div class="centernote">
      <h2>Supabase Not Set Up Yet</h2>
      <p>This page needs a Supabase project connected before it can sign anyone in. Paste your project URL and anon key into <code>js/config.js</code>, see the README's Supabase setup section for the exact steps.</p>
    </div>`;
} else {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
