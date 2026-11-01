export default {
  sections: [
    { id: "p3", label: "3P · PHAK Ch 2", title: "Perceive, Process, Perform",
      body: `<p>3P is a simple loop for every phase of flight. Perceive hazards with PAVE, process them with CARE, and perform with TEAM. Then evaluate, and go around again. Most flight training decisions are time-critical: a quick mental check, on the fly. <span class="src">PHAK Ch 2, Fig 2-10</span></p>`,
      viz: { type: "mnemo", opts: { set: "p3" } },
      kdr: { k: "ADM and single-pilot resource management.", d: "Manage risk with ADM.", r: "Distractions and loss of situational awareness.", codes: ["PA.I.H.K4", "PA.II.B.S4", "PA.I.H.R3"] } },
    { id: "dec", label: "DECIDE · PHAK Ch 2", title: "When something changes",
      body: `<p>DECIDE is a six-step loop for the moment something changes. The PHAK warns that overreacting and fixating can rule out a safe outcome, so estimate the need to react before you act. <span class="src">PHAK Ch 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "decide" } },
      kdr: { k: "ADM models.", d: "Use a structured decision process.", r: "Confirmation and expectation bias.", codes: ["PA.I.H.K4", "PA.I.H.R4"] } },
    { id: "sbt", label: "Scenarios", title: "Practice on the ground",
      body: `<p>Run each scenario in the questions through 3P. Then ask your CFI for one from your own airport: a real runway, real weather, real pressures. Talk it out loud. These scenarios are made-up examples.</p>`,
      kdr: { k: "Scenario-based decisions.", d: "Explain each decision.", r: "External pressures.", codes: ["PA.II.A.R4", "PA.II.B.S4"] } },
  ],
};
