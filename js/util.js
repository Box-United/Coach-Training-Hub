// Small helpers shared by every page.

// URLs and text go into attributes via innerHTML, where a bare & starts an
// HTML entity. Nothing in today's links trips it, but a query parameter named
// copy, reg or amp would silently mangle the URL, and that is a horrible
// thing to debug later.
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
