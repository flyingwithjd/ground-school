export default {
  sections: [
    { id: "point", label: "Turns around a point · AFH 6", title: "Bank follows groundspeed",
      body: `<p>Pick a point and fly a circle of constant radius around it at 600 to 1,000 ft AGL. Wind pushes you around the circle, so you change bank to hold the track: <strong>steepest headed downwind</strong>, where groundspeed is highest, and shallowest headed upwind. <span class="src">AFH 6</span></p>
<p>Change the wind and watch the bank on the track.</p>`,
      viz: { type: "groundref", opts: { mode: "point" } },
      kdr: { k: "Wind effect on ground track; bank, groundspeed and radius.", d: "Hold altitude ±100 ft, airspeed ±10 kt.", r: "Division of attention; low-altitude maneuvering.", codes: ["PA.V.B.K2", "PA.V.B.K3", "PA.V.B.S7", "PA.V.B.R1"] } },
    { id: "rect", label: "Rectangular course · AFH 6", title: "A pattern without the runway",
      body: `<p>The rectangular course is a traffic pattern around a field. Enter at 45° to the downwind leg, at 600 to 1,000 ft AGL. Crab on each leg so the track stays parallel to the field's edges, and change bank in the corners for the groundspeed you have. <span class="src">ACS PA.V.B.S3a; AFH 6</span></p>`,
      viz: { type: "groundref", opts: { mode: "rect" } },
      body2: `<p>The same corrections fly the traffic pattern. <span class="src">ACS PA.V.B.K4</span></p>`,
      kdr: { k: "Relationship to the traffic pattern.", d: "Wind drift correction on each leg.", r: "Uncoordinated turns near the ground.", codes: ["PA.V.B.K4", "PA.V.B.S4", "PA.V.B.R5"] } },
    { id: "emer", label: "Simulated engine failure · POH 3", title: "Pitch for 68 knots",
      body: `<p>If the engine quits, the first job is the airspeed. Best glide in the 172S is 68 KIAS, the speed that gives the most distance. Minimum sink is a few knots slower and gives the most time, not the most distance. <span class="src">POH 3; AFH 3</span></p>
<p>Then choose a field within reach, preferably into the wind, since a headwind shortens your glide. Run the restart checklist if there is time, then the emergency landing checklist. <span class="src">AFH 3; POH 3</span> Many instructors teach the mnemonic ABCDE: airspeed, best field, checklist, declare, execute. It is a memory aid, not an FAA procedure. <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "Best glide vs minimum sink; wind effect on glide.", d: "Best glide ±10 kt; select a field.", r: "Glide distance; configuring the airplane.", codes: ["PA.IX.B.K2a", "PA.IX.B.K2b", "PA.IX.B.K2c", "PA.IX.B.S1", "PA.IX.B.R1"] } },
  ],
  prep: {
    expect: ["Rectangular course, S-turns and turns around a point at 600–1,000 ft AGL.", "A simulated engine failure: your instructor pulls the power and you fly best glide to a field.", "Pattern work may be included."],
    chairfly: ["Point at the wind and say where your steepest bank will be.", "Practice the engine-out flow with your hands: pitch, field, fuel, mixture, mags.", "Say \"68 knots\" out loud until it is automatic."],
    mistakes: ["Watching the point and losing altitude.", "Choosing a field too late or too far.", "Forgetting to look for traffic between maneuvers."],
    debrief: ["Where did your bank peak? Was it headed downwind?", "How long did it take to pitch for best glide after the power came out?", "Would you have made the field?"],
  },
};
