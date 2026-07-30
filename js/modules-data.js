// Add, edit, or reorder training modules here. Modules unlock in this array's
// order, a coach must pass module N's quiz before module N+1 unlocks.
//
// To add a module: copy an entry, give it the next `id`, paste your YouTube
// unlisted video ID, and write questions with `correctIndex` pointing at the
// right option (0-based). `passThreshold` is the percentage needed to pass.

const MODULES = [
  {
    id: 1,
    title: "Welcome to Box United, Our Why",
    description: "The mission, the gym rules, and what makes Box United different.",
    youtubeId: "PASTE_YOUTUBE_UNLISTED_ID_HERE",
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
    title: "Creating a Safe, Structured Gym",
    description: "Setting the floor, the schedule, and the standard before class starts.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 3,
    title: "Coaching Stance, Guard & Footwork",
    description: "The fundamentals every fighter builds on, and how to correct them fast.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 4,
    title: "Safe Sparring & Spotting",
    description: "Protocols for pads, partner drills, and knowing when to step in.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 5,
    title: "Building the Fighter's Mindset",
    description: "Give her the mental tools to reset after a tough round, in the gym and in life.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 6,
    title: "Confidence Cues That Land",
    description: "What to say instead of \"good job,\" and why the wording matters.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 7,
    title: "Handling Big Emotions in the Gym",
    description: "Reading frustration early, and de-escalating without softening the standard.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 8,
    title: "Nutrition & Recovery Basics",
    description: "Simple, age-appropriate fueling and rest guidance for young athletes.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 9,
    title: "Talking With Parents & Guardians",
    description: "Framing progress in a way that builds trust, not just updates.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 10,
    title: "Season Wrap-Up: Tracking Growth",
    description: "Closing out the season by measuring growth, not just wins.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  }
];
