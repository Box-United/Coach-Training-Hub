// The season calendar on the home page: a month grid per month, with the
// weeks that have sessions shaded.
//
// This file previously built an .ics download for the key dates. That button
// was removed in favour of per-date links, so the code went with it. It is in
// the git history if the all-dates-at-once download is ever wanted back.

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Dates are handled as plain YYYY-MM-DD strings and compared as strings.
// Parsing them into Date objects would drag the viewer's timezone in, and a
// coach in a different zone would see the shading slip by a day.
function isoFor(year, month, day) {
  return year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

function withinRange(iso, range) {
  return !!range && iso >= range.from && iso <= range.to;
}

// Checked in this order on purpose: a day inside the training window stays
// marked as training rather than falling through to the session shading.
function dayStateFor(iso, cal) {
  if (withinRange(iso, cal.training)) return "is-training";
  if ((cal.noSession || []).some((r) => withinRange(iso, r))) return "is-nosession";
  if (withinRange(iso, cal.sessions)) return "is-session";
  return "";
}

function monthGridHtml(yearMonth, cal) {
  const [year, month] = yearMonth.split("-").map(Number);
  // Day 0 of the next month is the last day of this one.
  const daysInMonth = new Date(year, month, 0).getDate();
  // Which weekday the 1st lands on, 0 = Sunday. Built from a local Date with
  // no time component, which is safe because only the weekday is read.
  const leadingBlanks = new Date(year, month - 1, 1).getDay();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push('<div class="calday is-blank"></div>');
  for (let day = 1; day <= daysInMonth; day++) {
    const state = dayStateFor(isoFor(year, month, day), cal);
    cells.push(`<div class="calday ${state}">${day}</div>`);
  }

  return `
    <div class="calmonth">
      <div class="calmonthname">${MONTH_NAMES[month - 1]} ${year}</div>
      <div class="calgrid">
        ${["S", "M", "T", "W", "T", "F", "S"].map((d) => `<div class="caldow">${d}</div>`).join("")}
        ${cells.join("")}
      </div>
    </div>
  `;
}

function seasonCalendarHtml(cal) {
  if (!cal || !cal.months || !cal.months.length) return "";

  const legend = [
    { cls: "is-session", label: (cal.sessions && cal.sessions.label) || "Session week" },
    { cls: "is-nosession", label: (cal.noSession && cal.noSession[0] && cal.noSession[0].label) || "No session" },
    { cls: "is-training", label: (cal.training && cal.training.label) || "Coach training" }
  ].filter((item) => item.label);

  return `
    <div class="calwrap">
      <div class="calhead">
        <h3>${cal.heading}</h3>
        ${cal.summary ? `<p class="calsummary">${cal.summary}</p>` : ""}
      </div>
      <div class="callegend">
        ${legend.map((item) => `<span class="callegenditem"><i class="calswatch ${item.cls}"></i>${item.label}</span>`).join("")}
      </div>
      <div class="calmonths">
        ${cal.months.map((m) => monthGridHtml(m, cal)).join("")}
      </div>
      ${cal.footnote ? `<p class="calfootnote">${cal.footnote}</p>` : ""}
    </div>
  `;
}
