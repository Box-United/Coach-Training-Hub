// The questions coaches ask most, taken from Appendix C of the in-person
// facilitator guide (Fall 2026). The answers there are drawn from the Box
// United Child Protection Policy and the coach contracts, so `source` on an
// item names where it comes from and should stay with the answer.
//
// Two things from the appendix were written for whoever runs the training
// rather than for coaches, and have been turned around to address the coach
// directly: the standing rule about never improvising on child safety, which
// is the `note` on the first group, and the closing line about routing
// anything unanswered to Box United.
//
// CHANGING AN ANSWER: these are policy, not copy. Anything touching child
// safety, pay, or gear eligibility should be changed only alongside the
// document it cites, or the hub and the policy drift apart and a coach acts
// on the wrong one. The DCFS number in particular is a legal reporting line,
// check it against the Child Protection Policy before touching it.
//
// A group can carry `note`, shown before its questions. `openByDefault` keeps
// a group expanded on load, which the child-safety group uses: those answers
// should not need a click to find.

const FAQ = {
  intro: "Answers to what coaches ask most, from the in-person training. If something here is not covered, or you are unsure about anything to do with your own contract, your taxes, or a child-safety situation, ask rather than guess.",

  groups: [
    {
      heading: "Child Safety and Reporting",
      openByDefault: true,
      note: "Never improvise on a child-safety question. If you are in any doubt, the answer is always the same: report to DCFS, and tell Box United.",
      items: [
        {
          q: "A girl tells me something that makes me worried she is being hurt or abused. What do I do?",
          a: [
            "Report it immediately. Every Box United coach is a mandated reporter under Illinois law. You do not decide whether it is &ldquo;credible enough&rdquo; first, that is not your job. If you have reasonable cause to suspect abuse or neglect, you report.",
            "Call the Illinois DCFS Hotline on <strong>1-800-252-2873</strong> (1-800-25-ABUSE), open 24 hours, or report through the DCFS online system. Then tell Box United at <a href=\"mailto:admin@boxunited.org\">admin@boxunited.org</a> the same day.",
            "Reporting to Box United does not replace your legal duty to report to DCFS. Both have to happen."
          ],
          source: "Child Protection Policy"
        },
        {
          q: "What if I am wrong and nothing was actually happening?",
          a: [
            "You are protected. Illinois law gives good-faith reporters immunity from liability, and Box United does not allow any retaliation against a coach who raises a concern in good faith. It is always better to report and be wrong than to stay silent."
          ],
          source: "Child Protection Policy"
        },
        {
          q: "Can I ever be alone with a girl, or text or DM a participant directly?",
          a: [
            "No. Box United follows a two-adult rule and does not allow one-on-one situations that another adult cannot observe. Keep communication group-based and on approved channels. Do not message participants privately or connect with them on personal social media."
          ],
          source: "Child Protection Policy"
        }
      ]
    },

    {
      heading: "Benchmarks and Gear",
      items: [
        {
          q: "What happened to the skill levels?",
          a: [
            "They are paused for both the fall and spring seasons, and come back in a later spring cycle. Nothing is expected of you on L1 to L4 this year: no level assessment at any point, no certificates, no patches. Attendance benchmarks take their place."
          ],
          source: "Curriculum update, Fall 2026"
        },
        {
          q: "A girl joined late. Can she still earn the gear?",
          a: [
            "Yes. The thresholds count sessions attended, not a percentage and not a start date. A girl who joins at session three can still reach four sessions by week eight. Get her onto the attendance sheet the day she arrives so her count is right."
          ],
          source: "Curriculum update, Fall 2026"
        },
        {
          q: "A girl missed the week 4 session but has attended two. Does she get the t-shirt?",
          a: [
            "Yes. She earned it on attendance, so give it to her at the next session she comes to. The week is when you hand out, not a deadline she can fail."
          ]
        },
        {
          q: "She earned her whole kit in the fall. Does she get another one in the spring?",
          a: [
            "No, one kit per girl. Her spring attendance still counts toward the gloves at twelve sessions, but the t-shirt, bra and shorts are earned once.",
            "Do not promise a second set to keep a girl coming. That turns gear into a lever, which is the one thing we never do."
          ]
        },
        {
          q: "How will I know who is eligible for what?",
          a: [
            "We tell you. Box United staff email every coach each week with exactly who is eligible for what, and when. That list is built from submitted attendance, so if your attendance is not in, the email cannot be right."
          ]
        },
        {
          q: "Can I hold back gear from a girl who is behaving badly?",
          a: [
            "No, and this is not a grey area. Gear is earned by attendance and is never a disciplinary lever. Behaviour is handled with the healing-centred approach: stay calm, do not shame, offer an alternative, pick your battles. Send anything you are unsure about to <a href=\"mailto:programs@boxunited.org\">programs@boxunited.org</a>."
          ]
        },
        {
          q: "How do sizes work, and what if something does not fit?",
          a: [
            "Collect sizes in week one, using the sizing sheet on the collateral site, and email them to <a href=\"mailto:programs@boxunited.org\">programs@boxunited.org</a>. Exchanges are fine, just ask and we will send a replacement."
          ]
        },
        {
          q: "Do the fall and spring counts really add up for the gloves?",
          a: [
            "Yes. Twelve sessions across both seasons combined, so a girl who attends six in the fall needs six in the spring. Tell her that number out loud in January, it is the single strongest retention tool we have."
          ]
        }
      ]
    },

    {
      heading: "Sessions, Scheduling, and the Program",
      items: [
        {
          q: "What if I have to miss a session, or the school cancels one?",
          a: [
            "Tell Box United as soon as you know, and work with your school contact to reschedule. Sessions cancelled by the school, or for anything outside your control, are not held against you. Rescheduling keeps the program whole and protects your sessions."
          ],
          source: "School Coach Contract"
        },
        {
          q: "What if a girl refuses to participate or shuts down?",
          a: [
            "Use the behaviour management module and the healing-centred approach: stay calm, do not shame her, pick your battles, and offer an alternative rather than a demand.",
            "A girl putting her head down is not an emergency. Acknowledge it, give her a way back in, and follow up privately when tensions are low."
          ],
          source: "Behaviour Management module, Site Visit Rubric"
        },
        {
          q: "Do I have to use the fighter journals?",
          a: [
            "Mostly, but not always. Five weeks in each season carry a set journal activity, which in Season 1 is weeks 3, 4, 6, 8 and 9. On those weeks the journal is listed in Materials and is not optional. The pre- and post-surveys are also printed in the journal, at weeks 1 and 10.",
            "On the other five weeks there is no journal activity and writing is not required."
          ],
          source: "Fighter&rsquo;s Mindset curriculum, Journals"
        },
        {
          q: "I keep running out of time. What am I allowed to cut?",
          a: [
            "Cut the review drill first, then any extra mitt rounds. Never cut the burnout or the shout-outs: those are the two blocks girls remember, and the burnout is where the assessments live. If an assessment or a survey falls that week, shorten training to make room."
          ],
          source: "Fighter&rsquo;s Mindset curriculum, Practice At A Glance"
        }
      ]
    },

    {
      heading: "Equipment and Space",
      items: [
        {
          q: "What if equipment is missing, or my space is not right for boxing?",
          a: [
            "You are responsible for the equipment issued to you and for returning it at the end of the season. If something is missing or damaged, or the space raises a safety concern, tell Box United promptly. Do not improvise around a safety risk. Physical safety is a scored part of every site visit."
          ],
          source: "Coach Contract, Site Visit Rubric"
        }
      ]
    },

    {
      heading: "Pay",
      note: "The answer depends on which kind of coach you are. If you are not sure which applies to you, ask rather than assume.",
      items: [
        {
          q: "How and when do I get paid? (1099 contract coaches)",
          a: [
            "If you are a paid Box United coach, you are paid a per-session rate set by the Coach Pay Table, as an independent contractor (1099). Payment goes through Bill.com by direct deposit, usually as a lump sum about two weeks after the season ends, based on your verified attendance records. Fall payday is Dec 1, 2026; spring payday is May 1, 2027.",
            "Your pay is tied to attendance saved in the attendance platform. If attendance is not recorded, payment is delayed."
          ],
          source: "School Coach Contract"
        },
        {
          q: "How does pay work for me? (school-paid, MOU coaches)",
          a: [
            "If you are a school-employed coach under a Memorandum of Understanding, Box United does not pay you directly. You are paid by your school or district through your existing employment. The MOU covers your role and responsibilities with Box United, not your pay."
          ],
          source: "Coach MOU"
        },
        {
          q: "Am I a Box United employee?",
          a: [
            "No. Paid coaches are independent contractors, not employees, and are responsible for their own taxes. MOU coaches stay employees of their school. Either way, Box United does not withhold taxes or provide employee benefits."
          ],
          source: "School Coach Contract, Coach MOU"
        }
      ]
    }
  ],

  // Adapted from the appendix's closing note to the facilitator.
  closing: "If your question is not here, especially anything specific to your own contract, your tax situation, or a child-safety scenario, do not guess and do not let anyone guess at you. Ask <a href=\"mailto:programs@boxunited.org\">programs@boxunited.org</a> and you will get the exact answer."
};
