// FL9 lesson text · Steep turns. Sources: AFH FAA-H-8083-3C ch 10; PHAK FAA-H-8083-25C ch 5; ACS FAA-S-ACS-6C PA.V.A.
export default {
  sections: [
    { id: "forces", label: "Why it's harder · PHAK 5", title: "More bank, more G, higher stall speed",
      body: `<p>In any bank the lift tilts with the wings. Part of it now turns the airplane, so less is left to hold it up. To stay level, you raise the angle of attack until the <strong>vertical part of lift equals the weight</strong> again. Total lift, the <strong>load factor</strong>, grows as 1 ÷ cos(bank). <span class="src">PHAK 5</span></p>`,
      viz: { type: "steepturn" },
      body2: `<p>Stall speed rises with the square root of the load factor: about 19% higher at 45° and 41% higher at 60°. An airplane can stall at a speed that's perfectly safe in level flight. That's an <strong>accelerated stall</strong>. <span class="src">PHAK 5 · AFH 5</span></p>`,
      kdr: { k: "Load factor and stall speed in a bank; maneuvering speed.", d: "Explain why a steep turn needs back-pressure and power.", r: "Accelerated stall from excessive back-pressure.", codes: ["PA.V.A.K2d", "PA.V.A.K2c", "PA.V.A.K2e"] } },
    { id: "fly", label: "Flying it · AFH 10 · ACS PA.V.A", title: "Roll in, hold it, roll out on heading",
      body: `<p>Clear the area first with clearing turns. Set the entry speed from your airplane's POH, or a speed no higher than V<sub>A</sub>, the design maneuvering speed. Pick a heading and a landmark on the horizon. <span class="src">ACS PA.V.A · AFH 10</span></p>
<p>Roll smoothly into a coordinated turn of about <strong>45°</strong>. Past about 30°, add back-pressure to hold altitude and a little power to hold speed. Look outside: keep the nose's position on the horizon steady, with quick checks of the altimeter and airspeed. <span class="src">AFH 10</span></p>
<p>Start the rollout about half the bank angle before your entry heading (roughly 20°), release the back-pressure as the wings level so you don't climb, reduce the power, then do the same turn the other way. <span class="src">AFH 10</span></p>
<p>The test standard: a coordinated 360° turn at about 45°, bank held within ±5°, the entry altitude ±100 ft and airspeed ±10 kt, and a rollout on the entry heading ±10°; then the opposite direction. <span class="src">FAA-S-ACS-6C PA.V.A</span></p>`,
      kdr: { k: "Entry speed; coordination; rollout lead.", d: "Steep turns at about 45° to ACS standards in both directions.", r: "Fixation on instruments; failure to clear the area.", codes: ["PA.V.A.S1", "PA.V.A.S2", "PA.V.A.S3", "PA.V.A.S5"] } },
    { id: "risk", label: "Hazards · AFH 10", title: "Overbanking, spirals and the accelerated stall",
      body: `<p><strong>Overbanking tendency</strong>: in a steep turn the outside wing moves faster through the air than the inside wing, so it makes more lift and the bank tends to keep increasing. Hold a little aileron against the turn. <span class="src">AFH 10 · PHAK 5</span></p>
<p>If the nose drops and you start losing altitude, <strong>shallow the bank first</strong>, then raise the nose and steepen again. Pulling harder at a high bank only tightens the turn and can develop into a <strong>spiral</strong>. Too much back-pressure can also cause an accelerated stall. <span class="src">AFH 10</span></p>
<p>Steep turns are flown at a safe altitude your CFI chooses, well clear of traffic. <span class="src">AFH 10</span></p>`,
      kdr: { k: "Overbanking tendency; spiral; accelerated stall.", d: "Correct altitude loss by reducing bank first.", r: "Spiral or accelerated stall in a steep turn; collision hazards.", codes: ["PA.V.A.K2b", "PA.V.A.R3", "PA.V.A.R2", "PA.V.A.R5"] } },
  ],
  prep: {
    expect: ["Clearing turns, then a steep turn in each direction.", "Your CFI will demonstrate one first.", "Repeats until you can hold altitude and bank."],
    chairfly: ["Say: \"Clear, entry speed, heading and landmark, roll in, back-pressure, power, lead the rollout by 20°.\"", "Picture the nose's spot on the horizon staying put.", "Practice shallowing the bank before pulling when altitude drops."],
    mistakes: ["Losing altitude because back-pressure came too late.", "Climbing on the rollout by not releasing back-pressure.", "Letting the bank creep past 50°."],
    debrief: ["Did you stay within ±100 ft?", "Where did you start the rollout?", "Which direction was harder, and why?"],
  },
};
