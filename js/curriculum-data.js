// The weekly session curriculum: what a coach runs in the gym each week, as
// opposed to the training they complete before the season starts.
//
// The content is The Fighter's Mindset, Coach Curriculum Guide, Season One,
// split one practice per week into assets/curriculum/. Each week's assessment
// log travels with the practice it belongs to, so a coach printing one file
// has everything for that session. The scenario cards are their own file
// because week 7 needs them printed and cut up rather than read.
//
// Two gates stand between a coach and a week's PLAN, and both have to pass:
//
//   1. Their training is complete. Every module passed or approved.
//   2. The week has opened. A week opens CURRICULUM_RELEASE_LEAD_DAYS before
//      its session date, so coaches can read ahead and prepare. Nothing needs
//      unlocking by hand, the date does it.
//
// Admins skip both, the same way they skip the module lock, so the curriculum
// can be checked before anyone is let into it.
//
// A single week can be opened to everyone with `alwaysOpen: true`, which
// skips both gates for that week alone. Weeks 1 and 2 carry it, so a coach
// still finishing their training can run the first two sessions of the season
// rather than turning up to week 1 with no plan.
//
// The VIDEOS sit outside both gates. Any coach can watch any week's videos at
// any time, including weeks that have not opened and before their own training
// is done, because watching is how they prepare and there is nothing in it to
// hold back. Only the plan itself, the documents, materials and deliverables,
// waits for the gates.
//
// PUBLISHING A WEEK
//
// A week goes live the moment it has at least one document. Until then it is
// listed on the curriculum page as coming soon, so coaches can see the shape
// of the season without being promised a plan that is not written yet. That
// means adding the document IS the publish step, there is no separate flag.
//
// `url` may be a path inside this repo, as below, or any full URL: a Google
// Doc, a Drive PDF, a Canva link. If you use a link, set its sharing to
// "anyone with the link can view" first, or coaches hit a permission wall
// with no way through and no idea why.
//
// `materials` is what the coach brings, transcribed from the practice's
// MATERIALS block. `deliverables` is what that week produces for Charity
// Rescue, the assessment logs and the scanned surveys; most weeks produce
// nothing and carry an empty list.
//
// `videos` fills the slots defined in CURRICULUM_VIDEO_SLOTS below, which is
// just the session walkthrough:
//
//   videos: { walkthrough: "abc123" }
//
// A bare id is enough. Use an object if the video needs its own title:
//
//   videos: { walkthrough: { youtubeId: "abc123", title: "Running week one" } }
//
// `exercises` is the burnout, named from CURRICULUM_EXERCISES, in the order
// the burnout works through them:
//
//   exercises: ["jumpRope", "mountainClimbers", "plank"]
//
// Unlike a training module none of this is gated or tracked, so paste an id in
// and it plays. An empty walkthrough slot shows only to admins, never to
// coaches, and a week with no exercises simply has no burnout section.
//
// Everything except `week`, `date` and `documents` is optional. `theme` is the
// one-line description from the guide, `focus` is which of the three pillars
// the practice builds, `keyPhrase` is the phrase repeated through the session,
// `summary` is a list of paragraphs, `journal` marks a week where the
// Fighter's Mindset journal is part of the practice and is not optional, and
// `survey` marks the two weeks that use the printed journal survey.
//
// A week with no `title` falls back to "Session week N", so a half-filled
// entry never breaks the page.

// How far ahead of its session date a week opens. One week.
//
// This is the whole schedule. Every week's open date is worked out from its
// own `date` minus this, every time the page loads, so nothing has to be
// unlocked by hand as the season runs. Changing this one number moves all ten.
//
// Weeks carrying `alwaysOpen` ignore it and are open from the start.
const CURRICULUM_RELEASE_LEAD_DAYS = 7;

// The tracks the burnouts are run to. They live here rather than on each week
// because the same track is reused, which on the assessment weeks is the whole
// point: a fighter's Week 6 punch count only means something against her Week
// 2 number if the track has not changed. Swap one here and it changes on every
// week that uses it.
//
// Not every week that uses a track is an assessment. Weeks 3, 7 and 9 borrow
// one for an ordinary burnout, which is why the labels do not say assessment
// and the notes name the weeks that are.
//
// Each week names the ones it needs in `songs`. The assessment log asks which
// song was used, so a coach who swaps one has somewhere to record it.
const CURRICULUM_SONGS = {
  jumpRope: {
    label: "Jump rope track",
    youtubeId: "ZaI2IlHwmgQ",
    note: "Listen through before the session. This one runs a little fast, so if your fighters cannot hold the pace, pick something slower. Weeks 1 and 10 are the jump rope assessment, and those two have to be the same track or the numbers cannot be compared."
  },
  punchCount: {
    label: "Punch count track",
    youtubeId: "PWgvGjAhvIw",
    note: "Around 160 BPM, which is what the practice plan asks for. Weeks 2, 6 and 10 are the punch count assessment, and those three have to be the same track so each fighter is measured against her own number."
  }
};

// The burnout demonstrations. Exercises repeat across the season, jump rope
// and fast feet and squats all turn up in more than one week, so they live
// here once and weeks name the ones they need. Swap a demo here and it
// changes on every week that uses it.
//
// These are demonstrations of the movement, not a video of the burnout being
// run. A week can have any number, in the order the burnout works through
// them.
const CURRICULUM_EXERCISES = {
  jumpRope:          { label: "Jump rope",           youtubeId: "u3zgHI8QnqE" },
  mountainClimbers:  { label: "Mountain climbers",   youtubeId: "cnyTQDSE884" },
  plank:             { label: "Plank",               youtubeId: "pvIjsG5Svck" },
  fastFeet:          { label: "Fast feet",           youtubeId: "fz59j4a3QMQ" },
  squats:            { label: "Squats",              youtubeId: "xqvCmoLULNY" },
  skaters:           { label: "Skaters",             youtubeId: "5gtLC5BgN7Q" },
  burpees:           { label: "Burpees",             youtubeId: "qLBImHhCXSw" },
  plankShoulderTaps: { label: "Plank shoulder taps", youtubeId: "gKA5LBy7WAI" }
};

// The video slots every week's page shows, in this order. They live here
// rather than on each week so the labels cannot drift apart between weeks.
//
// A slot can carry its own `youtubeId`, which becomes the season-wide default:
// it plays on every week that does not name its own. Use that for anything
// that does not change week to week, and override it on the weeks that differ.
//
// Adding a slot here adds it to all ten weeks at once. The burnout used to
// be a slot, but a burnout runs through several exercises, so those moved to
// CURRICULUM_EXERCISES above and each week lists the ones it works through.
const CURRICULUM_VIDEO_SLOTS = [
  {
    key: "walkthrough",
    label: "Session walkthrough",
    hint: "How this week's practice runs, start to finish."
  }
];

const CURRICULUM = {
  seasonLabel: "Fall 2026",

  intro: "The Fighter's Mindset, season one. Each week's practice plan opens the week before you run it, so there is always time to read ahead and get what you need together.",

  // Season-wide reference, not tied to any one week.
  guides: [
    {
      label: "Coach curriculum guide",
      url: "assets/curriculum/coach-guide.pdf",
      detail: "How to read a practice plan, the assessments, the journals, and the practice checklist. Worth reading once before week 1."
    }
  ],

  weeks: [
    {
      week: 1,
      date: "2026-09-14",
      title: "Fighting Like A Girl",
      theme: "Welcome, expectations, and the first jab.",
      focus: "Growth mindset",
      keyPhrase: "Why not me?",
      survey: true,
      summary: [
        "Introduces fighters to Fight Like A Girl, sets program expectations, and builds team cohesion through introductions. The group discusses what Fighting Like A Girl means, then partners use fist bumps and questions to get to know each other.",
        "Training covers stance, reinforces it with the Stance Check music game, introduces the jab, and ends with Boxing Tag. Closes with the jump rope assessment, the baseline every later week is measured against."
      ],
      alwaysOpen: true,
      videos: { walkthrough: "OuOzPdT2J2w" },
      exercises: ["jumpRope"],
      songs: ["jumpRope"],
      materials: [
        "Mitts & gloves",
        "Jump ropes",
        "Speaker",
        "Fighter journals, one per fighter",
        "Writing utensils"
      ],
      deliverables: [
        "Scanned pre-season surveys, journal pages 5 and 6",
        "Jump rope assessment log"
      ],
      documents: [
        { label: "Week 1 practice plan", url: "assets/curriculum/week-01.pdf", detail: "Includes the jump rope assessment log" }
      ]
    },
    {
      week: 2,
      date: "2026-09-21",
      title: "Persistence",
      theme: "Mental toughness is trained, not born.",
      focus: "Growth mindset",
      keyPhrase: "Why not me?",
      summary: [
        "Connects a physical moment of discomfort with the emotional experience of persistence, then asks fighters to translate that skill to real-life challenges. It opens with a Stand Your Ground debate on mental toughness, effort, and confidence.",
        "Training reviews movement and the jab, introduces the cross, and works 1 · 2 on command with mitts. Closes with the punch count assessment: 100 clean punches before one song ends."
      ],
      alwaysOpen: true,
      videos: { walkthrough: "2JTO-I_QdYU" },
      songs: ["punchCount"],
      materials: [
        "Mitts & gloves",
        "Speaker, for the punch count song"
      ],
      deliverables: [
        "Punch count assessment log"
      ],
      documents: [
        { label: "Week 2 practice plan", url: "assets/curriculum/week-02.pdf", detail: "Includes the punch count assessment log" }
      ]
    },
    {
      week: 3,
      date: "2026-09-28",
      title: "Goal Setting",
      theme: "One team goal for the Show Off.",
      focus: "Growth mindset",
      keyPhrase: "Why not me?",
      journal: true,
      summary: [
        "Teaches fighters to build a team SMART goal for the Show Off. The coach explains each component, then guides the team to shape one collective goal for the weeks ahead.",
        "Training introduces the slip, a reaction drill, and a no-contact slip-then-jab partner drill, then works 1 · 2 with slip-2 on the mitts and closes with Footwork Freeze."
      ],
      videos: { walkthrough: "" },
      songs: ["punchCount"],
      materials: [
        "Fighter's Mindset journal",
        "Mitts & gloves",
        "Chart paper or poster board",
        "Writing utensils"
      ],
      deliverables: [],
      documents: [
        { label: "Week 3 practice plan", url: "assets/curriculum/week-03.pdf" }
      ]
    },
    {
      week: 4,
      date: "2026-10-05",
      title: "Importance Of Preparation",
      theme: "The first step to being successful is preparing to be.",
      focus: "Healthy habits",
      keyPhrase: "Be unrealistic.",
      journal: true,
      summary: [
        "Teaches fighters that preparation is the foundation of success in boxing and in life. Fighters build a personal checklist in their journals covering required gear and a personal routine, and intentions revisits the team SMART goal from last week.",
        "Training introduces the hooks, builds speed with rapid shadow rounds, works the 1 · 2 · 3 and 1 · 2 · 3 · 4 combinations on the mitts, and finishes with a partner call-out round. The burnout is a five-station circuit."
      ],
      videos: { walkthrough: "" },
      exercises: ["jumpRope", "mountainClimbers", "plank", "fastFeet"],
      materials: [
        "Fighter's Mindset journal",
        "Mitts & gloves",
        "Writing utensils",
        "Poster board with last week's team SMART goal"
      ],
      deliverables: [],
      documents: [
        { label: "Week 4 practice plan", url: "assets/curriculum/week-04.pdf" }
      ]
    },
    {
      week: 5,
      date: "2026-10-12",
      title: "Food Is Fuel",
      theme: "Your body cannot run without the right food.",
      focus: "Healthy habits",
      keyPhrase: "Be unrealistic.",
      summary: [
        "Focuses on eating as preparation for training. The coach leads a This or That activity where fighters choose between food options, then explains that whole foods give steady energy while sugary snacks cause a burst and a crash.",
        "Training introduces the uppercuts, adds 20-second speed bursts, works 5 · 6 to the body on the mitts, and builds a combination pyramid."
      ],
      videos: { walkthrough: "" },
      exercises: ["squats", "skaters", "fastFeet"],
      materials: [
        "Mitts & gloves"
      ],
      deliverables: [],
      documents: [
        { label: "Week 5 practice plan", url: "assets/curriculum/week-05.pdf" }
      ]
    },
    {
      week: 6,
      date: "2026-10-19",
      title: "Sleep Is Strength",
      theme: "Sleep is one of the most powerful tools a boxer has.",
      focus: "Healthy habits",
      keyPhrase: "Be unrealistic.",
      journal: true,
      summary: [
        "Focuses on sleep as a driver of performance and wellbeing. A True or False activity debunks common sleep myths, then fighters build a realistic three-step sleep routine for the week.",
        "Training is a Simon Says round through every punch and the slip, then combination prep on the mitts. The burnout repeats the Week 2 assessment, so each fighter compares against her own number."
      ],
      videos: { walkthrough: "" },
      songs: ["punchCount"],
      materials: [
        "Fighter's Mindset journal",
        "Mitts & gloves",
        "Speaker, the Week 2 song",
        "Writing utensils"
      ],
      deliverables: [
        "Punch count assessment log, midpoint"
      ],
      documents: [
        { label: "Week 6 practice plan", url: "assets/curriculum/week-06.pdf", detail: "Includes the midpoint punch count log" }
      ]
    },
    {
      week: 7,
      date: "2026-10-26",
      title: "Block That Thought",
      theme: "Preparing the mind for hard work.",
      focus: "Confidence",
      keyPhrase: "I am enough.",
      summary: [
        "Focuses on positive thinking and applying it to effort. The coach explains that a positive mindset is mental preparation for hard work, then runs the Block That Thought activity, where teams take a scenario with a negative thinking trap and flip it into a positive thought.",
        "Training introduces the roll, a reaction drill, and a no-contact roll-then-combo partner drill, then adds the roll between combinations on the mitts."
      ],
      videos: { walkthrough: "" },
      songs: ["jumpRope"],
      materials: [
        "Mitts & gloves",
        "Jump ropes",
        "Scenario cards",
        "Writing utensils, for the scenario cards"
      ],
      deliverables: [],
      documents: [
        { label: "Week 7 practice plan", url: "assets/curriculum/week-07.pdf" },
        { label: "Scenario cards", url: "assets/curriculum/scenario-cards.pdf", detail: "Print and cut along the dashed lines, one card per round" }
      ]
    },
    {
      week: 8,
      date: "2026-11-02",
      title: "Talking To Others",
      theme: "Feedback is a gift.",
      focus: "Confidence",
      keyPhrase: "I am enough.",
      journal: true,
      summary: [
        "Teaches fighters to give and receive feedback using the C.A.P. formula. The coach explains each part with examples of what to do and what to avoid, then runs a role-play where fighters respond to common mistakes with C.A.P. feedback.",
        "Training opens with a shuttle race, reviews every punch and defensive move, builds freestyle four-punch combinations on the mitts, and closes with a C.A.P. partner feedback round and a ladder burnout."
      ],
      videos: { walkthrough: "" },
      exercises: ["burpees", "plankShoulderTaps", "squats"],
      materials: [
        "Fighter's Mindset journal",
        "Mitts & gloves",
        "Writing utensils"
      ],
      deliverables: [],
      documents: [
        { label: "Week 8 practice plan", url: "assets/curriculum/week-08.pdf" }
      ]
    },
    {
      week: 9,
      date: "2026-11-09",
      title: "Combination Prep",
      theme: "The last day to work toward the team goal.",
      focus: "Confidence",
      keyPhrase: "I am enough.",
      journal: true,
      summary: [
        "The last practice before the Show Off. The coach reminds fighters this is their final chance to work toward the Week 3 team goal, then reviews how to build a strong combination.",
        "Training is given over to the 10-move combination, run for speed and form, with peer mitt-holding."
      ],
      videos: { walkthrough: "" },
      songs: ["punchCount"],
      materials: [
        "Fighter's Mindset journal",
        "Mitts & gloves",
        "Writing utensils"
      ],
      deliverables: [],
      documents: [
        { label: "Week 9 practice plan", url: "assets/curriculum/week-09.pdf" }
      ]
    },
    {
      week: 10,
      date: "2026-11-16",
      title: "Show Off",
      theme: "Today is your day.",
      focus: "Confidence",
      keyPhrase: "I am enough.",
      survey: true,
      summary: [
        "The Show Off, where fighters demonstrate their skills for their peers. The coach reminds them it is okay if the combination is not perfect, and encourages them to cheer on their teammates.",
        "Training reviews punches 1 through 6, adds the slip and roll, runs the basic combinations, then duos show off. The season closes with both post assessments, a group shout-out, and the post-survey as the last activity."
      ],
      videos: { walkthrough: "" },
      songs: ["jumpRope", "punchCount"],
      materials: [
        "Mitts & gloves",
        "Jump ropes",
        "Speaker, the Week 1 and Week 2 songs",
        "Fighter journals, one per fighter",
        "Writing utensils"
      ],
      deliverables: [
        "Jump rope assessment log, post-season",
        "Punch count assessment log, post-season",
        "Scanned end-of-season surveys"
      ],
      documents: [
        { label: "Week 10 practice plan", url: "assets/curriculum/week-10.pdf", detail: "Includes both post-assessment logs" }
      ]
    }
  ]
};
