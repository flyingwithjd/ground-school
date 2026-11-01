export default {
  sections: [
    { id: "what", label: "Stage check · 14 CFR 141", title: "What to expect",
      body: `<p>The Stage 1 check flight confirms you can fly the maneuvers from FL1 to FL6 safely and explain them. A check instructor, not your regular one, flies with you. Expect a short oral first, then the flight: preflight and taxi, the four fundamentals, slow flight and stalls, ground reference maneuvers, a go-around, slips and a simulated engine failure. <span class="src">14 CFR Part 141 App. B</span></p>
<p>Your school's syllabus sets the exact items and standards. The ACS tolerances in these lessons show what "good" looks like at the end of training. <span class="src">FAA-S-ACS-6C</span></p>`,
      kdr: { k: "Each FL1–FL6 maneuver: purpose, procedure, errors.", d: "Fly them safely with your instructor's standards.", r: "Rushing the preflight on check day.", codes: ["PA.II.A.K3", "PA.VII.A.K1"] } },
    { id: "talk", label: "Oral practice", title: "Say it out loud",
      body: `<p>Examiners ask "why" and "what if." Answer out loud in full sentences. Then compare with the model answer and rate yourself honestly. Open the <a href="#/oral/fl7">oral practice for this lesson</a>, or the <a href="#/oral">full Stage 1 oral</a>.</p>
<p>The scenario questions in the next step test judgment. Most have one clearly safest answer. If two look right, choose the one that keeps the airplane under control first.</p>`,
      kdr: { k: "Model answers for each maneuver.", d: "Explain while flying (talk the flow).", r: "Freezing on an unexpected question: fly the airplane, then think.", codes: ["PA.IV.N.R1", "PA.IX.B.K1"] } },
  ],
  prep: {
    expect: ["A brief oral, then a flight with a check instructor.", "Every Stage 1 maneuver, in an order you may not expect.", "A simulated engine failure and a go-around when you least expect them."],
    chairfly: ["Fly the whole check flight in your chair: preflight to shutdown.", "Say each maneuver's entry, standards and recovery out loud.", "Run the engine-failure and balked-landing flows with your hands."],
    mistakes: ["Skipping clearing turns.", "Forgetting the checklist under pressure.", "Not saying when you are unsure. Asking is safe and expected."],
    debrief: ["Which maneuver felt weakest?", "Which oral question surprised you?", "What will you practice before Stage 2?"],
  },
};
