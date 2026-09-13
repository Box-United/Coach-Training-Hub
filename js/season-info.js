// The welcome, the season calendar, and the key dates a coach sees before
// they start the modules. All of this copy lives here, nowhere else.
//
// `date` is ISO, `label` is what the page prints. Add, remove, or reorder
// freely, the page reads straight from this list.
//
// Resources moved to js/resources-data.js, which the resources page reads, so
// there is one list to keep up rather than two.
//
// A date can also carry its own `link`, for anything a coach needs to open for
// that specific date, a sign-up, a meeting, a calendar invite:
//
//   link: { url: "https://...", label: "Add to Google Calendar" }

const SEASON_INFO = {
  seasonLabel: "2026-27",

  welcome: {
    heading: "Welcome to the season",
    body: [
      "You're coaching with Box United this year, and this is where your training lives. Work through the modules in order, at your own pace, each one unlocks the next.",
      "Most of it is short videos with a few questions at the end. Two modules ask you to upload something instead: your SafeSport certificate, and proof your payment account is set up."
    ]
  },

  // The month grid on the home page. Days are shaded by which range they fall
  // in, checked in this order: training, then noSession, then sessions. So a
  // day inside the training window stays marked as training even though the
  // session range has not started yet.
  calendar: {
    heading: "Fall Season 2026",
    summary: "Ten sessions, the week of Sept 14 through the week of Nov 16.",
    footnote: "No session the week of Nov 23. Thanksgiving break.",
    months: ["2026-09", "2026-10", "2026-11"],
    training: { from: "2026-09-01", to: "2026-09-13", label: "Coach training, Sept 1 to Sept 13" },
    sessions: { from: "2026-09-14", to: "2026-11-21", label: "Session week" },
    noSession: [
      { from: "2026-11-22", to: "2026-11-28", label: "No session" }
    ]
  },

  // Who a coach contacts, and for what. The DCFS line is a legal reporting
  // duty rather than a Box United process: a coach is a mandated reporter
  // under Illinois law, calling DCFS comes first, and telling Box United does
  // not replace it. Both have to happen. Check any edit here against the
  // Child Protection Policy, see the FAQ in js/faq-data.js.
  contacts: {
    heading: "Who To Contact",

    general: {
      email: "programs@boxunited.org",
      lead: "Everything program. If you are not sure who to ask, ask here.",
      covers: [
        "Curriculum and lessons",
        "Scheduling and cancellations",
        "Equipment and space",
        "Benchmarks and gear sizing",
        "Attendance and assessment logs"
      ]
    },

    incidents: {
      email: "admin@boxunited.org",
      lead: "Incidents. Report anything that happens on your watch here."
    },

    urgent: {
      label: "Illinois DCFS Hotline",
      phone: "1-800-252-2873",
      phoneHref: "tel:+18002522873",
      alsoKnownAs: "1-800-25-ABUSE",
      lead: "If you have reasonable cause to suspect abuse or neglect, call DCFS. Every Box United coach is a mandated reporter under Illinois law, and the line is open 24 hours.",
      after: "Then tell Box United at admin@boxunited.org the same day. Telling Box United does not replace reporting to DCFS, both have to happen."
    }
  },

  keyDates: [
    {
      date: "2026-09-01",
      label: "Sept 1",
      title: "Fall virtual training opens",
      detail: "Work through it in your own time. It needs to be finished before the in-person training on September 12."
    },
    {
      date: "2026-09-11",
      label: "Sept 8-11",
      title: "Equipment arrives at your site",
      detail: "It turns up on its own, nothing for you to arrange. If you would rather collect it yourself, you can pick it up at coach training instead."
    },
    {
      date: "2026-09-12",
      label: "Sept 12",
      title: "Fall in-person coach training",
      detail: "10am to 1pm at Chicago Youth Boxing Club. Required, no exceptions.",
      location: "Chicago Youth Boxing Club",
      link: {
        url: "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=NWJpM2pxMjNzNDFibDlhaHV0YjEwbG1kczUgY19hZWQ3YjZmNWVhNWNmNGNmMDhjYmI2NDExOGFhMTc3ZmEyNWZiN2M5MDNlMTYxYjFmODBjZmIxMGE5ZWQ4ZDNjQGc&tmsrc=c_aed7b6f5ea5cf4cf08cbb64118aa177fa25fb7c903e161b1f80cfb10a9ed8d3c%40group.calendar.google.com",
        label: "Add to Google Calendar"
      }
    },
    {
      date: "2026-09-14",
      label: "Sept 14",
      title: "Fall session 1",
      detail: "The first week of programming."
    },
    {
      date: "2026-11-16",
      label: "Nov 16",
      title: "Fall session 10",
      detail: "The last week of the fall season."
    },
    {
      date: "2026-11-23",
      label: "Nov 23",
      title: "No session, Thanksgiving break",
      detail: "This week is already accounted for in your ten sessions."
    },
    {
      date: "2026-12-01",
      label: "Dec 1",
      title: "Payday, fall season"
    }
  ]
};
