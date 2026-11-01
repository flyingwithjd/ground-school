// Mnemonics with reasoning. Each item ties back to a rule or handbook; the mnemonic itself is just a memory aid.
const A = (id, t, q, c, why, src) => ({ id, t, q, c, a: 0, why, src });
export default [
  { id: "mn1", code: "MN1", stage: 1, kind: "module", title: "Mnemonics", short: "Memory aids, and the rule behind every letter",
    intro: "A mnemonic gets you to the list. The reason behind each item is what makes you a pilot rather than a reciter. Every letter here links to its source.",
    refs: ["14 CFR 91.203, 91.205, 91.207, 91.409–91.413", "PHAK Ch 2", "C172S POH 3"],
    topics: { "mn1.reg": "Regulatory mnemonics", "mn1.adm": "ADM mnemonics" },
    questions: [
      A("mn1-01", "mn1.reg", "In ATOMATOFLAMES, the first M stands for:", ["Manifold pressure gauge, for each altitude engine", "Magnetic compass", "Mixture control", "Magnetos"], "The second M is the magnetic direction indicator.", "14 CFR 91.205(b)"),
      A("mn1-02", "mn1.reg", "In ATOMATOFLAMES, the E stands for:", ["ELT, if required by 91.207", "Engine hour meter", "Elevator trim", "Exhaust gas temperature gauge"], "91.205(b)(15).", "14 CFR 91.205(b)"),
      A("mn1-03", "mn1.reg", "Which ATOMATOFLAMES items don't apply to a C172S?", ["Manifold pressure, liquid-coolant temperature and landing gear position", "Airspeed indicator and altimeter", "Oil pressure and oil temperature", "Fuel gauges and compass"], "Its engine is air-cooled and not an altitude engine, and its gear is fixed.", "14 CFR 91.205(b); C172S POH 1"),
      A("mn1-04", "mn1.reg", "In FLAPS, the S stands for:", ["An adequate source of electrical energy", "Strobe lights", "Seat belts", "Spare bulbs"], "91.205(c)(5).", "14 CFR 91.205(c)"),
      A("mn1-05", "mn1.reg", "In AV1ATE, the 1 stands for:", ["100-hour inspection, if used for hire or flight instruction for hire", "1 hour of ELT use", "1 calendar year", "One spare fuse"], "91.409(b).", "14 CFR 91.409(b)"),
      A("mn1-06", "mn1.reg", "In ARROW, which item is required only for international flights?", ["Radio station license", "Registration", "Airworthiness certificate", "Weight and balance"], "An FCC requirement.", "PHAK Ch 9"),
      A("mn1-07", "mn1.adm", "Which IMSAFE item asks \"Am I emotionally upset?\"", ["E", "S", "I", "F"], "Emotion.", "PHAK Ch 2"),
      A("mn1-08", "mn1.adm", "Which mnemonic is a common training aid that is not in the C172S POH?", ["ABCDE for engine failure", "The POH emergency landing checklist", "The restart checklist", "Engine fire in flight"], "ABCDE helps you remember the flow; the POH checklist is the authority.", "C172S POH 3"),
      A("mn1-09", "mn1.adm", "Which mnemonic helps you process hazards in the 3P model?", ["CARE", "PAVE", "TEAM", "IMSAFE"], "PAVE perceives, CARE processes, TEAM performs.", "PHAK Ch 2"),
      A("mn1-10", "mn1.adm", "The resignation attitude's antidote is:", ["I'm not helpless. I can make a difference.", "Follow the rules.", "Not so fast.", "It could happen to me."], "\"What's the use?\"", "PHAK Ch 2, Fig 2-4"),
    ],
    oral: [
      { id: "mn1-o1", t: "mn1.reg", acs: "PA.I.B.K3", q: "Your night flight's position light is burned out. Can you go?", a: "<p>No. Position lights are required for night VFR under 91.205(c)(2): the P in FLAPS. Day VFR doesn't require them, so a day flight may be possible if the inoperative equipment is handled properly; ask your CFI how your school does that. <span class=\"src\">14 CFR 91.205(c)</span></p>", src: "14 CFR 91.205" },
    ] },
];
