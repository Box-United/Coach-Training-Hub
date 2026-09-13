// Everything a coach might need to open that is not tied to one training
// module or one session week: training documents, handouts to print, and the
// recruitment links.
//
// Anything specific to a week belongs on that week instead, in
// js/curriculum-data.js, so a coach preparing a session finds it in one place
// rather than hunting through a general list.
//
// Groups render in this order. A group with no items yet shows to admins only,
// so coaches never see an empty heading, and it appears for everyone the
// moment it has something in it. That means adding an item IS the publish
// step, the same as a curriculum week.
//
// Each item takes a `label`, a `url`, and an optional `detail`. The url can be
// a path inside this repo, like assets/curriculum/coach-guide.pdf, or any full
// URL. If you use a link, set its sharing to "anyone with the link can view"
// first, or coaches hit a permission wall with no way through.

const RESOURCES = {
  intro: "Documents, handouts, and links you need now and then, rather than every week. Anything tied to a particular session lives on that week in the curriculum.",

  groups: [
    {
      key: "training",
      heading: "Training Documents",
      blurb: "Policies, guides, and anything you may need to refer back to after your training.",
      items: [
        {
          label: "Coach curriculum guide",
          url: "assets/curriculum/coach-guide.pdf",
          detail: "How to read a practice plan, the assessments, the journals, and the practice checklist."
        }
      ]
    },
    {
      key: "handouts",
      heading: "Handouts",
      blurb: "Things to print and take to the gym.",
      items: [
        {
          label: "Scenario cards, Week 7",
          url: "assets/curriculum/scenario-cards.pdf",
          detail: "Print and cut along the dashed lines, one card per round of Block That Thought."
        }
      ]
    },
    {
      key: "recruitment",
      heading: "Recruitment Resources",
      blurb: "For bringing fighters into the program.",
      items: [
        {
          label: "Principal Hub",
          url: "https://principals.boxunited.org/",
          detail: "Flyers and program materials you can print yourself."
        }
      ]
    }
  ]
};
