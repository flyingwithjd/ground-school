export default {
  sections: [
    { id: "dec", label: "The decision · AFH 9", title: "Decide early",
      body: `<p>Any approach can end in a go-around. The dangerous part is waiting. Two things delay the decision: <strong>landing expectancy</strong>, the belief that it will work out, and <strong>pride</strong>, the feeling that going around is a failure. <span class="src">AFH 9</span></p>
<p>Typically, go around if the approach is not stabilized by 500 ft above the airport in VMC, and right away if it becomes unstabilized below 300 ft AGL. <span class="src">AFH 9</span></p>`,
      kdr: { k: "Stabilized approach; reasons to go around.", d: "Make a timely decision.", r: "Delayed recognition; landing expectancy.", codes: ["PA.IV.N.K1", "PA.IV.N.S3", "PA.IV.N.R1"] } },
    { id: "exec", label: "Execution · AFH 9, POH 4", title: "Power, attitude, configuration",
      body: `<p><strong>Power:</strong> full, smoothly, without hesitation. <strong>Attitude:</strong> the trim is set for a slow glide, so the nose will rise and yaw left. Hold forward pressure and right rudder, then rough-trim. <strong>Configuration:</strong> raise the flaps in steps. <span class="src">AFH 9</span></p>
<p>Watch what full power does to the nose in the visual below.</p>`,
      viz: { type: "leftturn" },
      body2: `<p>172S balked landing: throttle full; flaps to 20°; climb at 60 KIAS; flaps 10° until obstacles are cleared; flaps up after a safe altitude and 65 KIAS. <span class="src">POH 4</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "Power effects; flap retraction.", d: "Apply power and pitch for VX or VY +10/−5.", r: "Power application; configuring the airplane.", codes: ["PA.IV.N.S4", "PA.IV.N.S5", "PA.IV.N.R3", "PA.IV.N.R4"] } },
    { id: "after", label: "After the go-around · AFH 8", title: "Side-step and climb",
      body: `<p>Once you are climbing, move to the side of the runway if needed to see and avoid departing traffic. The AFH suggests a shallow turn to the upwind side. Hold VY +10/−5 knots to a safe altitude, keep wind-drift correction, make your radio call and rejoin the pattern. <span class="src">ACS PA.IV.N.S6–S8; AFH 8</span></p>
<p>Low go-arounds happen in ground effect. The airplane feels like it is floating on a cushion, but that performance is borrowed and repaid as you climb. <span class="src">AFH 9</span></p>`,
      kdr: { k: "Wind and density altitude on climb performance.", d: "Maneuver to the side; hold VY.", r: "Collision hazards; low-altitude stall.", codes: ["PA.IV.N.K2", "PA.IV.N.S6", "PA.IV.N.S7", "PA.IV.N.R5"] } },
  ],
  prep: {
    expect: ["Go-arounds at altitude first, then in the pattern from short final.", "Your instructor may call \"Go around\" at any point on final.", "Radio calls after each go-around at a non-towered field."],
    chairfly: ["Say \"Power, attitude, configuration\" and move your hands: throttle, yoke, flap switch.", "Practice the balked landing callouts with 60 KIAS and flaps 20°.", "Picture moving to the side of the runway."],
    mistakes: ["Raising the flaps all at once.", "Letting the nose rise too high with full power.", "Hesitating while trying to save a bad approach."],
    debrief: ["How fast did you decide when your instructor called the go-around?", "Did the nose rise and yaw? How much right rudder did you need?", "Did you hold VY +10/−5?"],
  },
};
