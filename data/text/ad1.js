export default {
  sections: [
    { id: "fit", label: "IMSAFE · PHAK Ch 2", title: "Are you fit to fly?",
      body: `<p>You're one of the risk factors in every flight. Before each one, run IMSAFE. Tap each letter, then switch to Recall and say them from memory. <span class="src">PHAK Ch 2</span></p>
<p>Ask yourself each question. Illness: am I sick? Medication: am I taking any medicine that might affect my judgment or make me drowsy? Stress: am I under pressure from work, or worried about money, health or family? Alcohol: have I been drinking within 8 hours? Within 24 hours? Alcohol also makes you more prone to disorientation and [[hypoxia|Hypoxia]]. Fatigue: am I tired and not adequately rested? Emotion: am I emotionally upset? <span class="src">PHAK Ch 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "imsafe" } },
      kdr: { k: "Stress, fatigue and alcohol effects.", d: "Perform a self-assessment.", r: "Aeromedical issues.", codes: ["PA.I.H.K1g", "PA.I.H.K1h", "PA.I.H.S2", "PA.I.H.R1"] } },
    { id: "pave", label: "PAVE · PHAK Ch 2", title: "Four places risk hides",
      body: `<p>PAVE sorts the risks of a flight into four groups. Use it in preflight planning, and set personal minimums for each one. <span class="src">PHAK Ch 2</span></p>
<p>P is you, the pilot in command; A is the aircraft; V is the environment, such as weather, terrain and airports; E is external pressures. External pressures are influences outside the flight that push you to finish it, often at the expense of safety: someone waiting at the airport, a passenger you don't want to disappoint, the wish to show your skills or impress someone. The PHAK calls "Watch this!" probably the two most dangerous words in aviation. <span class="src">PHAK Ch 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "pave" } },
      body2: `<p>The PHAK's example: your POH shows a 15-knot demonstrated crosswind, but you've only flown 10. Until more training with a CFI, 10 knots is your limit. Legal isn't the same as smart. <span class="src">PHAK Ch 2</span></p>`,
      kdr: { k: "Pilot self-assessment and risk categories.", d: "Set personal minimums.", r: "Pilot, aircraft, environment and external pressures.", codes: ["PA.II.A.K1", "PA.II.A.R1", "PA.II.A.R3", "PA.II.A.R4"] } },
    { id: "att", label: "Attitudes · PHAK Ch 2, Fig 2-4", title: "Catch the thought, say the antidote",
      body: `<p>Five hazardous attitudes lead to poor judgment. Recognize the thought, label it hazardous, then say its antidote. Memorize the antidotes so they come to mind on their own. <span class="src">PHAK Ch 2</span></p>
<p>The five, with the thought that gives each away and its antidote. Anti-authority, "Don't tell me": Follow the rules. They are usually right. Impulsivity, "Do it quickly": Not so fast. Think first. Invulnerability, "It won't happen to me": It could happen to me. Macho, "I can do it": Taking chances is foolish. Resignation, "What's the use?": I'm not helpless. I can make a difference. <span class="src">PHAK Ch 2, Fig 2-4</span></p>`,
      viz: { type: "attitude", opts: {} },
      kdr: { k: "Hazardous attitudes.", d: "Identify and counter hazardous attitudes.", r: "Hazardous attitudes.", codes: ["PA.I.H.K4", "PA.I.H.R2"] } },
  ],
};
