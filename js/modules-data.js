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
// Coming soon: a module can be listed before it is built by giving it
// `comingSoon: "Spring 2027"`. It shows on the training page as planned, but
// nothing is gated behind it and it does not count toward completion, so
// coaches can still reach 100 percent. Delete the line when it is ready.
//
// Note: any module can carry a `note`, a short line shown under the video and
// above the quiz, for something a coach has to do that the hub itself does
// not handle:
//
//   note: "You will sign the acknowledgment in the Charity Rescue platform."
//
// Upload: a module can also require a document, for training that happens
// somewhere else (SafeSport, setting up a Ramp account). Add an `upload` block
// and the module page shows an upload control:
//
//   upload: {
//     prompt: "Upload your certificate.",   lead line above everything else
//     note: "Already got one? Skip ahead.",  optional, called out before steps
//     steps: ["Do this", "Then this"],      optional, numbered instructions
//     code: { label: "Enrollment key",      optional, shown in a copy button
//             value: "abc123" },
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
      { youtubeId: "nMWrlm9056g", title: "Part 1 — Who We Are" },
      { youtubeId: "Y0aNlDOYW3w", title: "Part 2 — Coach Welcome" }
    ],
    passThreshold: 80,
    quiz: [
      {
        question: "Roughly what share of girls drop out of sports by age 14, and what is the number one reason given?",
        options: [
          "About 25 percent, mostly because of the cost of taking part.",
          "About 45 percent, roughly twice the rate of boys, and the top reason is low body confidence.",
          "About 45 percent, and the top reason is injuries.",
          "About 60 percent, and the top reason is a lack of time."
        ],
        correctIndex: 1
      },
      {
        question: "What sits at the core of Fight Like a Girl?",
        options: [
          "Boxing skill, with social-emotional learning added where there is time.",
          "Social-emotional learning, with boxing used as a warm-up.",
          "Boxing and social-emotional well-being together, not one or the other.",
          "Preparing girls for competitive boxing."
        ],
        correctIndex: 2
      },
      {
        question: "What are the three pillars that show up in every single session?",
        options: [
          "Strength, speed, and endurance.",
          "Self-confidence, healthy habits, and growth mindset.",
          "Discipline, respect, and teamwork.",
          "Boxing, nutrition, and recovery."
        ],
        correctIndex: 1
      },
      {
        question: "Box United wants every lesson to be inspirational and thought-provoking. What else does it have to be?",
        options: [
          "Different from the week before, so it never repeats.",
          "Focused mainly on boxing technique.",
          "Connected to a takeaway a student can actually use.",
          "Finished inside the session, with nothing carried over."
        ],
        correctIndex: 2
      },
      {
        question: "How is the programming year structured?",
        options: [
          "Ten weeks, once a year.",
          "Ten weeks per season, two seasons a year.",
          "Twenty weeks running straight through.",
          "It varies from site to site."
        ],
        correctIndex: 1
      },
      {
        question: "Two things are required from you every season and are named as deliverables in your contract. What are they?",
        options: [
          "Weekly lesson plans and an end-of-season report.",
          "Daily attendance and your survey and assessment results, both through Charity Rescue.",
          "Photos from each session and a final showcase.",
          "A monthly newsletter and a site visit write-up."
        ],
        correctIndex: 1
      },
      {
        question: "You have a question in the middle of the season. Where should it go?",
        options: [
          "To whichever member of the Box United team you know best.",
          "To programs@boxunited.org, so it does not get lost.",
          "Into the coach group chat.",
          "Save it for the next time somebody visits your site."
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
    youtubeId: "Xp1lpQ-Z8gg",
    passThreshold: 100,
    quiz: [
      {
        question: "Where do your bank details belong?",
        options: [
          "In an email to your program lead.",
          "In Ramp, under Vendor Profile → Payment Details.",
          "Written on a direct deposit sheet provided by Box United."
        ],
        correctIndex: 1
      },
      {
        question: "Which parts of the Ramp setup guide do you actually have to finish?",
        options: [
          "All of it, including inviting team members and your company profile.",
          "Payment details and tax details. The rest is optional.",
          "Just payment details. Tax details can wait until April."
        ],
        correctIndex: 1
      },
      {
        question: "Who checks your tax details before your 1099 is generated?",
        options: [
          "Box United's finance team reviews them first.",
          "Ramp's support team verifies them.",
          "Nobody. The form is built from exactly what you entered."
        ],
        correctIndex: 2
      },
      {
        question: "Which email address should your Ramp account use?",
        options: [
          "Your school or team address, so it stays official.",
          "A personal address you will still have next year.",
          "It does not matter, support can always look you up."
        ],
        correctIndex: 1
      }
    ],
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
    youtubeId: "vvCS1KZQVVw",
    note: "To finish this module you will also sign the Child Protection Policy Acknowledgment. That happens in the Charity Rescue platform, not here.",
    passThreshold: 100,
    quiz: [
      {
        question: "A participant tells you that during the program she developed a crush on you, and asks to connect on social media. You are not interested in her romantically. What does the policy require?",
        options: [
          "It is fine to connect as long as nothing romantic happens, since you are not interested.",
          "Decline. A romantic or sexual relationship with a participant is never acceptable, and electronic communication must stay about program activities only.",
          "Connect privately but keep the conversation appropriate.",
          "Ask a Box United staffer whether this particular participant is an exception."
        ],
        correctIndex: 1
      },
      {
        question: "Practice has ended and one girl's ride is late. Everyone else has left and your co-coach needs to leave too. What is the right move?",
        options: [
          "Wait alone with her until her ride comes.",
          "Offer her a ride home yourself so she is not waiting.",
          "Keep another approved adult present until she is picked up, and never be one-on-one or transport her yourself.",
          "Let her wait outside alone since practice is over."
        ],
        correctIndex: 2
      },
      {
        question: "A girl says something that makes you suspect she may be abused at home, but you are not sure it is serious and you do not want to get it wrong. What should you do?",
        options: [
          "Wait and watch for more evidence before deciding.",
          "Ask other coaches whether they think it is credible first.",
          "Report to the Illinois DCFS hotline immediately, then notify Box United. Do not evaluate credibility first.",
          "Only tell Box United and let staff decide whether to call DCFS."
        ],
        correctIndex: 2
      },
      {
        question: "True or false: if you report a concern in good faith and it turns out to be unfounded, you could be punished or held liable.",
        options: [
          "True — you can be held liable for a wrong report.",
          "False — Illinois gives good-faith reporters immunity, and Box United prohibits any retaliation for a good-faith report."
        ],
        correctIndex: 1
      },
      {
        question: "Which of these correctly completes the acknowledgment you are agreeing to?",
        options: [
          "I will report suspected abuse only if I am certain it happened.",
          "I have read and understood the Child Protection Policy, I understand I am a mandated reporter, and I agree to report any suspected child abuse or neglect immediately under Illinois law and Box United procedures.",
          "I agree to follow the policy only during scheduled sessions.",
          "I will handle any concerns internally without involving outside authorities."
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 5,
    title: "Attendance System, Charity Rescue",
    description: "Taking attendance in Charity Rescue, and what to record each session.",
    youtubeId: "qaB8wG07aik",
    passThreshold: 80,
    quiz: [
      {
        question: "A family tells you in advance that their daughter will miss Thursday's session. What do you mark her as?",
        options: [
          "Absent, since she was not there.",
          "Excused. An excused absence is left out of the attendance calculation entirely, while a plain absence counts against the rate.",
          "Present, since she had a good reason.",
          "Leave it blank so it does not count either way."
        ],
        correctIndex: 1
      },
      {
        question: "The school closes for weather and you need to call off a session. Which option do you choose?",
        options: [
          "Delete, so it is removed cleanly from the calendar.",
          "Mark as cancelled. It keeps the session visible and emails the families of every participant at that site.",
          "Either one. Both notify families the same way.",
          "Neither. Message your admin and let them handle it."
        ],
        correctIndex: 1
      },
      {
        question: "A young person who is not on your roster turns up to a session. What do you do?",
        options: [
          "Add them to the roster yourself from the attendance screen.",
          "Turn them away until an admin has enrolled them.",
          "Run the session, take their name and their guardian's phone number on paper, and send it to your admin.",
          "Mark them present as a walk-in and sort the paperwork out later."
        ],
        correctIndex: 2
      },
      {
        question: "A volunteer arrives who did not sign up for that session. What do you do?",
        options: [
          "Send them home, since volunteer spots are booked in advance.",
          "Message your admin to add them.",
          "Use the Add walk-in picker in the volunteer section. They are added and marked present.",
          "Record their hours on paper and submit them later."
        ],
        correctIndex: 2
      },
      {
        question: "Which of these can you change yourself on a participant's profile?",
        options: [
          "Their site and their grade.",
          "Their date of birth and their enrollment.",
          "Their name, their guardian's phone and email, their T-shirt size, and their medical notes.",
          "Everything on the profile."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 6,
    title: "2026-27 Schedule",
    description: "Term dates, session times, and how the year runs.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 7,
    title: "Equipment",
    description: "The kit, how to look after it, and what to check before every session.",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  },
  {
    id: 8,
    title: "SafeSport Training",
    description: "Complete SafeSport training on their site, then upload your certificate.",
    youtubeId: "",
    passThreshold: 80,
    quiz: [],
    upload: {
      prompt: "SafeSport training happens on SafeSport's own site, not here. It takes about 90 minutes.",
      note: "Already have a 2026 SafeSport certificate? You do not need to do the training again. Skip straight to uploading it below.",
      steps: [
        "Open SafeSport using the button below, then sign up or log in.",
        "Use a personal email address and your own personal details.",
        "Set your role to Coach.",
        "The link carries the enrollment key with it, so it should already be filled in. If you are asked for it, it is shown below.",
        "Your training is already paid for. You should never be asked to pay, and if you are, stop and check with Box United before going further.",
        "Work through the training, which takes about 90 minutes.",
        "When you finish, download your certificate of completion from SafeSport.",
        "Upload that certificate here. Once it has been approved, this module is complete."
      ],
      code: { label: "Enrollment key", value: "fj7Pkjsu41mjsd7WeX_X" },
      accept: ".pdf,.png,.jpg,.jpeg",
      maxSizeMb: 10,
      linkUrl: "https://safesporttrained.org/?keyname=fj7Pkjsu41mjsd7WeX_X",
      linkLabel: "Start SafeSport Training"
    }
  },
  {
    id: 9,
    title: "Magic Moments in Fight Like a Girl",
    description: "The moments that keep the girls coming back and enjoying.",
    videos: [
      { youtubeId: "bwcyXcOpWVs", title: "Part 1 — Great Hospitality" },
      { youtubeId: "lzeC9tVF7eo", title: "Part 2 — Magic Moments" }
    ],
    passThreshold: 80,
    quiz: [
      {
        question: "In the hospitality video, four guests were heading to the airport having eaten at the city's best restaurants, but had never tried a New York street hot dog. What did the restaurant do?",
        options: [
          "Comped them a bottle of vintage champagne and a bucket of caviar.",
          "Ran out to a street cart, bought a two-dollar hot dog, and served it plated as a course before their final dish.",
          "Gave them a tour of the kitchen and a signed cookbook.",
          "Sent them to the airport with a packed picnic."
        ],
        correctIndex: 1
      },
      {
        question: "How much magic moments money does your site get, and how often?",
        options: [
          "Two hundred dollars per coach, per year.",
          "Two hundred dollars per site, per year.",
          "Two hundred dollars per site, per session.",
          "Two hundred dollars per site, each month of the season."
        ],
        correctIndex: 1
      },
      {
        question: "Which of these could you spend the magic moments money on?",
        options: [
          "New gloves for yourself, since yours wore out coaching.",
          "Hygiene products for a girl who is hesitant to come to a session without them.",
          "A dinner for the coaching staff at the end of the season.",
          "A gift for a student at your school who is not in the FLAG group."
        ],
        correctIndex: 1
      },
      {
        question: "A student at your school is struggling, but she is not in your FLAG group. Can you spend magic moments money on her?",
        options: [
          "Yes, as long as you keep the receipt.",
          "Yes, if she is at the same school.",
          "No. The money is for the girls in your FLAG group.",
          "Yes, up to half of the total."
        ],
        correctIndex: 2
      },
      {
        question: "You have an idea and you are not sure it counts. What are you asked to do?",
        options: [
          "Skip it, to stay on the safe side.",
          "Spend it and explain afterwards if anyone asks.",
          "Ask first. Box United would rather answer a question than have you sit on a good idea.",
          "Check with another coach and go with whatever they say."
        ],
        correctIndex: 2
      },
      {
        question: "What does Box United ask for in return for the money?",
        options: [
          "A budget submitted before you spend anything.",
          "That you keep your receipts, take the picture, and send the story of what you noticed and what you did about it.",
          "Nothing at all, it is unconditional.",
          "That anything unspent is returned at the end of the season."
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 10,
    title: "Behavior Management",
    description: "Holding the standard without losing the room, and what to do when it slips.",
    // Listed so coaches know it is coming, but not built yet. `comingSoon`
    // keeps it out of the unlock chain and out of the completion count, so
    // nobody is blocked by it and nobody is stuck short of 100 percent.
    // Remove this line when the module is ready.
    comingSoon: "Spring 2027",
    youtubeId: "",
    passThreshold: 80,
    quiz: []
  }
];
