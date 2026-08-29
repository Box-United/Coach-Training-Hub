// The welcome and the key dates a coach sees before they start the modules.
// All of this copy lives here, nowhere else.
//
// `date` is ISO so the calendar file can use it directly, `label` is what the
// page prints. Add, remove, or reorder freely, the page and the .ics download
// both read straight from this list.
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

  calendarName: "Box United 2026-27 Key Dates",

  keyDates: [
    {
      date: "2026-09-01",
      label: "Sept 1",
      title: "Virtual coach training opens",
      detail: "Work through it in your own time. Due by September 14."
    },
    {
      date: "2026-09-05",
      label: "Sept 5",
      title: "Hard deadline to add a school",
      detail: "The last day a school can be added for the fall season."
    },
    {
      date: "2026-09-11",
      label: "Sept 11",
      title: "Last day for equipment drop-off",
      detail: "The window is September 8 to 11. September 7 is Labor Day."
    },
    {
      date: "2026-09-12",
      label: "Sept 12",
      title: "In-person coach training",
      detail: "At Chicago Youth Boxing Club.",
      location: "Chicago Youth Boxing Club",
      link: {
        url: "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=NWJpM2pxMjNzNDFibDlhaHV0YjEwbG1kczUgY19hZWQ3YjZmNWVhNWNmNGNmMDhjYmI2NDExOGFhMTc3ZmEyNWZiN2M5MDNlMTYxYjFmODBjZmIxMGE5ZWQ4ZDNjQGc&tmsrc=c_aed7b6f5ea5cf4cf08cbb64118aa177fa25fb7c903e161b1f80cfb10a9ed8d3c%40group.calendar.google.com",
        label: "Add to Google Calendar"
      }
    },
    {
      date: "2026-09-14",
      label: "Sept 14",
      title: "Virtual training due, programming begins",
      detail: "Your virtual coach training must be finished, and the first week of programming starts."
    }
  ]
};
