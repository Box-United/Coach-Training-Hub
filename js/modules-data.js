// Add, edit, or reorder training modules here. Modules unlock in this array's
// order, a coach must pass module N's quiz before module N+1 unlocks.
//
// To add a module: copy an entry, give it the next `id`, paste your YouTube
// unlisted video ID, and write questions with `correctIndex` pointing at the
// right option (0-based). `passThreshold` is the percentage needed to pass.
//
// Video: a module can have one video or several. Both of these work:
//
//   youtubeId: "abc123"                       one video, shorthand
//   videos: [                                 several, played top to bottom
//     { youtubeId: "abc123", title: "Part 1 - The Mission" },
//     { youtubeId: "def456", title: "Part 2 - The Gym Rules" }
//   ]
//
// With several videos there is no gate between them, a coach can start any of
// them in any order. The quiz stays locked until every video on the module has
// been watched through to the end.
//
// Upload: a module can also require a document, for training that happens
// somewhere else (SafeSport, setting up a Ramp account). Add an `upload` block
// and the module page shows an upload control:
//
//   upload: {
//     prompt: "Upload your certificate.",   shown above the file picker
//     accept: ".pdf,.png,.jpg,.jpeg",       file types the picker allows
//     maxSizeMb: 10,                        rejected above this size
//     linkUrl: "https://...",               optional, link out to the training
//     linkLabel: "Start the training"
//   }
//
// Uploading lets a coach move on to the next module straight away, but the
// module only counts as complete once an admin approves the document on
// admin.html. A module can have an upload, a video, and a quiz, or any mix.

const MODULES = [
  {
    id: 1,
    title: "Welcome to Box United, Our Why",
    description: "The mission, the gym rules, and what makes Box United different.",
    videos: [
      { youtubeId: "nMWrlm9056g", title: "Part 1" }
      // To add a second video, uncomment the line below and paste its ID.
      // The quiz stays locked until every video listed here is watched to the
      // end, so do not leave an entry in with a placeholder ID in it.
      // , { youtubeId: "", title: "Part 2" }
    ],
    passThreshold: 80,
    quiz: [
      {
        question: "What is Box United's core belief about the girls it trains?",
        options: [
          "They need to be protected from competition.",
          "They are capable of far more than the world often expects from them.",
          "They should focus on boxing skills only, not leadership.",
          "They will naturally build confidence without any coaching."
        ],
        correctIndex: 1
      },
      {
        question: "What does Box United mean by \"Strong, not soft\"?",
        options: [
          "Coaches should be harsh and unforgiving.",
          "Girls who show emotion are not fighting hard enough.",
          "Discipline and welcome are not opposites, both belong in the gym.",
          "Only physical strength matters in training."
        ],
        correctIndex: 2
      },
      {
        question: "A new girl seems nervous on her first day. What's the on-brand move?",
        options: [
          "Let her sit out until she asks to join in.",
          "Welcome her in, and hold her to the same standard as everyone else.",
          "Pair her only with the most experienced boxer in the room.",
          "Tell her boxing might not be for her if she's nervous."
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 2,
    title: "Agreement and Pay",
    description: "What your agreement covers, how hours are logged, and when you get paid.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 3,
    title: "Ramp Set Up",
    description: "Setting up your Ramp payment account, and sending us proof it is done.",
    youtubeId: "",
    passThreshold: 80,
    quiz: [],
    upload: {
      prompt: "Upload a screenshot of your finished Ramp account setup, or a PDF from your school admin confirming they will be paying you.",
      accept: ".pdf,.png,.jpg,.jpeg",
      maxSizeMb: 10,
      linkUrl: "",
      linkLabel: ""
    }
  },
  {
    id: 4,
    title: "Child Protection Policy",
    description: "Keeping every girl safe, what the policy asks of you, and when to escalate.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 5,
    title: "Behavior Management",
    description: "Holding the standard without losing the room, and what to do when it slips.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 6,
    title: "Attendance System, Charity Rescue",
    description: "Taking attendance in Charity Rescue, and what to record each session.",
    youtubeId: "qaB8wG07aik",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 7,
    title: "2026-27 Schedule",
    description: "Term dates, session times, and how the year runs.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 8,
    title: "Equipment",
    description: "The kit, how to look after it, and what to check before every session.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 9,
    title: "SafeSport Training",
    description: "Complete SafeSport training, then upload your certificate here.",
    youtubeId: "",
    passThreshold: 80,
    quiz: [],
    upload: {
      prompt: "Upload your SafeSport certificate once you have finished the training.",
      accept: ".pdf,.png,.jpg,.jpeg",
      maxSizeMb: 10,
      linkUrl: "PASTE_SAFESPORT_LINK_HERE",
      linkLabel: "Start SafeSport Training"
    }
  },
  {
    id: 10,
    title: "Magic Moments in Fight Like a Girl",
    description: "The moments that keep the girls coming back and enjoying.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  }
];
