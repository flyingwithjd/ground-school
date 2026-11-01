export default {
  sections: [
    { id: "fit", label: "IMSAFE · PHAK Ch 2", title: "Are you fit to fly?",
      body: `<p>You're one of the risk factors in every flight. Before each one, run IMSAFE. Tap each letter, then switch to Recall and say them from memory. <span class="src">PHAK Ch 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "imsafe" } },
      kdr: { k: "Stress, fatigue and alcohol effects.", d: "Perform a self-assessment.", r: "Aeromedical issues.", codes: ["PA.I.H.K1g", "PA.I.H.K1h", "PA.I.H.S2", "PA.I.H.R1"] } },
    { id: "pave", label: "PAVE · PHAK Ch 2", title: "Four places risk hides",
      body: `<p>PAVE sorts the risks of a flight into four groups. Use it in preflight planning, and set personal minimums for each one. <span class="src">PHAK Ch 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "pave" } },
      body2: `<p>The PHAK's example: your POH shows a 15-knot demonstrated crosswind, but you've only flown 10. Until more training with a CFI, 10 knots is your limit. Legal isn't the same as smart. <span class="src">PHAK Ch 2</span></p>`,
      kdr: { k: "Pilot self-assessment and risk categories.", d: "Set personal minimums.", r: "Pilot, aircraft, environment and external pressures.", codes: ["PA.II.A.K1", "PA.II.A.R1", "PA.II.A.R3", "PA.II.A.R4"] } },
    { id: "att", label: "Attitudes · PHAK Ch 2, Fig 2-4", title: "Catch the thought, say the antidote",
      body: `<p>Five hazardous attitudes lead to poor judgment. Recognize the thought, label it hazardous, then say its antidote. Memorize the antidotes so they come to mind on their own. <span class="src">PHAK Ch 2</span></p>`,
      viz: { type: "attitude", opts: {} },
      kdr: { k: "Hazardous attitudes.", d: "Identify and counter hazardous attitudes.", r: "Hazardous attitudes.", codes: ["PA.I.H.K4", "PA.I.H.R2"] } },
  ],
};
