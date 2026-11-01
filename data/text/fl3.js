export default {
  sections: [
    { id: "slow", label: "Slow flight · AFH 5", title: "Flying on the edge",
      body: `<p>Slow flight is flown at an airspeed where any more angle of attack, load factor or power reduction would trigger the stall warning. <span class="src">ACS PA.VII.A.S3</span> It teaches what the airplane feels like near the critical angle: mushy controls, a high nose, lots of right rudder with power.</p>
<p>Drag the angle of attack toward the critical angle and watch the airflow separate.</p>`,
      viz: { type: "aoa" },
      body2: `<p>In slow flight you are behind the power curve: pitch holds the airspeed and power holds the altitude. Finish no lower than 1,500 ft AGL. Tolerances: altitude ±100 ft, heading ±10°, airspeed +10/−0 kt, bank ±10°. <span class="src">ACS PA.VII.A</span></p>`,
      kdr: { k: "Flight at high AOA; control effectiveness.", d: "Slow flight to ACS standards.", r: "Inadvertent slow flight leading to loss of control.", codes: ["PA.VII.A.S3", "PA.VII.A.S5", "PA.VII.A.R1"] } },
    { id: "stall", label: "Stalls · AFH 5", title: "Reduce the angle of attack",
      body: `<p>The stall horn in the 172S sounds 5 to 10 knots above the stall. <span class="src">POH 4</span> Learn the other cues too: control feel, the sound of the air, buffet and the seat-of-the-pants sense of sinking. <span class="src">AFH 5</span></p>
<p>Recovery: disconnect any autopilot, <strong>pitch nose-down</strong> until the stall warning stops, roll wings level, add power as needed, then return to the desired flight path. <span class="src">AFH 5</span></p>`,
      viz: { type: "loadfactor" },
      body2: `<p>Load factor raises stall speed, so a wing can stall above the published speed in a steep turn or a hard pull. That is an accelerated stall. <span class="src">PHAK 5</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "Stall aerodynamics and recovery fundamentals.", d: "Power-off and power-on stalls; recover at the full stall.", r: "Secondary, accelerated and cross-control stalls.", codes: ["PA.VII.B.K4", "PA.VII.C.K1", "PA.VII.B.R5"] } },
    { id: "spin", label: "Spin awareness · AFH 5, POH 4", title: "Stall plus yaw",
      body: `<p>A spin needs a stall and yaw. Keep the ball centered near the stall and a spin cannot develop. The dangerous case is a skidding turn near the ground, such as adding inside rudder to tighten an overshot turn to final while pulling back. <span class="src">AFH 5</span></p>
<p>172S POH recovery: throttle idle and ailerons neutral; full rudder opposite the rotation; just after the rudder reaches the stop, wheel briskly forward far enough to break the stall; hold until rotation stops; neutralize rudder and recover smoothly from the dive. <span class="src">POH 4</span> Intentional spins are approved only in the utility category. <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "Spin causes, phases and recovery.", d: "Explain spin recovery for your airplane.", r: "Cross-controlled flight at low altitude.", codes: ["PA.VII.D.K1", "PA.VII.D.K2", "PA.VII.D.K3"] } },
  ],
  prep: {
    expect: ["Clearing turns, then slow flight with turns, climbs and descents.", "Power-off stalls from an approach configuration; power-on stalls from a climb.", "Your instructor will set the standard: impending or full stall."],
    chairfly: ["Say the clearing turn, then each step of a power-off stall entry and recovery.", "Practice the recovery words: \"Pitch down. Wings level. Power. Climb.\"", "Picture where your feet go when the nose yaws."],
    mistakes: ["Recovering by rolling level before lowering the nose.", "Not enough right rudder in power-on stalls.", "Pulling too hard during recovery and causing a secondary stall."],
    debrief: ["Which cues came first: sound, feel, buffet or horn?", "How much altitude did each recovery take?", "Was the ball centered at the break?"],
  },
};
