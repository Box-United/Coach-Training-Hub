// Builds an .ics file for the season's key dates so a coach can add them all
// at once. Generated in the browser and downloaded straight to their machine,
// nothing is sent anywhere and no calendar account is involved, which is why
// this works the same in Google Calendar, Apple Calendar, and Outlook.

// RFC 5545 treats backslash, semicolon and comma as special inside TEXT
// values, and newlines have to be written as a literal \n. An unescaped comma
// in a title is enough to corrupt the rest of the line.
function icsEscape(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// Lines are limited to 75 octets, continued with a leading space. Plenty of
// clients cope without this, some quietly drop the overflow.
function icsFoldLine(line) {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(" " + rest);
  return parts.join("\r\n");
}

function toIcsDate(isoDate) {
  return String(isoDate).replace(/-/g, "");
}

// All-day events are half open: DTEND is the morning after. Without this a
// one-day event shows as zero length, or vanishes entirely in some clients.
function icsNextDay(isoDate) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return toIcsDate(d.toISOString().slice(0, 10));
}

function buildIcs(calendarName, events) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Box United//Coach Training Hub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:" + icsEscape(calendarName)
  ];

  events.forEach((ev, i) => {
    lines.push("BEGIN:VEVENT");
    // Stable per date and position, so re-importing updates the same entry
    // rather than stacking duplicates on a coach's calendar.
    lines.push(`UID:boxunited-${toIcsDate(ev.date)}-${i}@boxunited.org`);
    lines.push("DTSTAMP:" + stamp);
    lines.push("DTSTART;VALUE=DATE:" + toIcsDate(ev.date));
    lines.push("DTEND;VALUE=DATE:" + icsNextDay(ev.date));
    lines.push("SUMMARY:" + icsEscape(ev.title));
    if (ev.detail) lines.push("DESCRIPTION:" + icsEscape(ev.detail));
    if (ev.location) lines.push("LOCATION:" + icsEscape(ev.location));
    if (ev.link && ev.link.url) lines.push("URL:" + icsEscape(ev.link.url));
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  // CRLF throughout, which the spec requires and some clients enforce.
  return lines.map(icsFoldLine).join("\r\n") + "\r\n";
}

function downloadIcs(filename, contents) {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
