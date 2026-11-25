// FL8 lesson text · Takeoffs and landings. Sources: AFH FAA-H-8083-3C ch 6, 9; ACS FAA-S-ACS-6C PA.IV; generic POH wording.
export default {
  sections: [
    { id: "normal", label: "Normal takeoff and climb · AFH 6 · ACS PA.IV.A", title: "Full power, right rudder, rotate, climb",
      body: `<p>A takeoff has three parts: the <strong>ground roll</strong>, the <strong>liftoff</strong> and the <strong>initial climb</strong>. Before you roll, know your plan if the engine quits on the runway or in the climb. <span class="src">AFH 6</span></p>
<p>Line up on the centerline and add full power smoothly. Check that the engine gauges are in the green and the airspeed is alive. The high power at low speed yaws the nose left, so hold <strong>right rudder</strong>. <span class="src">AFH 6</span></p>`,
      viz: { type: "fieldprof", opts: { phase: "to", tech: "normal" } },
      body2: `<p>At the rotation speed in your airplane's POH, raise the nose to the liftoff attitude and let the airplane fly off. Then pitch for <strong>VY</strong>, the best rate of climb, and hold it. On the practical test that's VY +10/−5 kt, with wind-drift correction to stay over the extended centerline. <span class="src">ACS PA.IV.A</span></p>
<p><strong>Reject the takeoff</strong> if anything looks wrong on the roll: power to idle, keep it straight, brake as needed. Decide on an abort point before you start. <span class="src">AFH 6</span></p>`,
      kdr: { k: "Effects of wind and density altitude on takeoff; VX and VY.", d: "Normal takeoff and climb at VY +10/−5 kt.", r: "Abort criteria; engine failure after takeoff; low-altitude stall.", codes: ["PA.IV.A.K1", "PA.IV.A.K2", "PA.IV.A.S11", "PA.IV.A.R1"] } },
    { id: "xwind", label: "Crosswind takeoffs and landings · AFH 6, 9", title: "Into the wind with aileron, straight with rudder",
      body: `<p>In a crosswind, the wind tries to lift the upwind wing and push the airplane sideways. On the takeoff roll start with <strong>full aileron into the wind</strong> and ease it off as speed builds. Keep straight with rudder. <span class="src">AFH 6</span></p>
<p>On final, two methods keep you over the centerline: <strong>crab</strong> (turn the nose into the wind) and <strong>wing-low</strong> (lower the upwind wing with aileron and hold the nose straight with opposite rudder). Most instructors teach a crab on final, then a change to wing-low before touchdown so the wheels touch with no side drift. <span class="src">AFH 9</span></p>`,
      viz: { type: "xwind", opts: { rwy: 270, wind: 310, kt: 15 } },
      body2: `<p>Touch down on the <strong>upwind main wheel</strong> first, then keep adding aileron into the wind as you slow. Your POH's <strong>maximum demonstrated crosswind</strong> is a tested value, not a limit. Your own limit, set with your CFI, may be lower. <span class="src">AFH 9 · PHAK 11</span></p>`,
      kdr: { k: "Crosswind components; crab and wing-low methods.", d: "Keep the airplane aligned with no side drift at touchdown.", r: "Crosswind beyond your skill or the POH's demonstrated value.", codes: ["PA.IV.A.K3", "PA.IV.B.K3", "PA.IV.B.S8", "PA.IV.B.R2a"] } },
    { id: "stab", label: "Stabilized approach and normal landing · AFH 9 · ACS PA.IV.B", title: "Stable by 500 ft, or go around",
      body: `<p>A <strong>stabilized approach</strong> is one where the airplane is configured, trimmed, on speed and on a constant glidepath, needing only small corrections. In VMC, a typical light airplane should be stabilized by <strong>500 ft above the airport</strong>; if it isn't, or becomes unstabilized lower, go around. <span class="src">AFH 9</span></p>
<p>Use your POH's approach speed, or no more than 1.3 times V<sub>S0</sub>, the stall speed in the landing configuration (+10/−5 kt, with half the gust factor added). Pitch and power work together: change one and you'll usually adjust the other. <span class="src">ACS PA.IV.B · AFH 9</span></p>`,
      viz: { type: "fieldprof", opts: { phase: "ld", tech: "normal" } },
      body2: `<p>Pick an <strong>aim point</strong> and keep it fixed in the windshield. If it moves up, you'll land short; if it slides down, you'll land long. About 10–20 ft above the runway, start the <strong>round out</strong>: raise the nose smoothly as you reduce power, then hold it off until the main wheels touch. <span class="src">AFH 9</span></p>
<p>On the test, touch down within <strong>400 ft</strong> beyond or on the point, at a proper pitch attitude, with no drift and the airplane aligned with the runway. <span class="src">ACS PA.IV.B.S10</span></p>`,
      kdr: { k: "A stabilized approach and energy management.", d: "Fly a stabilized approach; touch down within 400 ft of the point.", r: "Unstable approach pressed to a landing; landing expectancy.", codes: ["PA.IV.B.K1", "PA.IV.B.S7", "PA.IV.B.S10", "PA.IV.B.R3a"] } },
    { id: "short", label: "Short-field takeoff and landing · AFH 6, 9 · ACS PA.IV.E, F", title: "Every foot counts",
      body: `<p>A <strong>short-field takeoff</strong> gets the airplane off the shortest runway and over a 50-ft obstacle. Use the whole runway, set the flaps your airplane's POH calls for, hold the brakes, apply full power, then release. Rotate at the POH speed and climb at <strong>VX</strong> until the obstacle is cleared or you're 50 ft up, then accelerate to <strong>VY</strong>. <span class="src">AFH 6 · ACS PA.IV.E</span></p>`,
      viz: { type: "fieldprof", opts: { phase: "to", tech: "short" } },
      body2: `<p>A <strong>short-field landing</strong> is a steeper, precise approach over the obstacle, usually with full flaps at the POH short-field approach speed. There's little float. Touch down within <strong>200 ft</strong> beyond or on the point at minimum speed, then brake as needed. <span class="src">AFH 9 · ACS PA.IV.F</span></p>
<p>Check the POH's takeoff and landing distance charts first, and add a margin for a less-than-perfect technique. <span class="src">AFH 6 · PHAK 11</span></p>`,
      kdr: { k: "Short-field performance; VX and VY.", d: "Short-field takeoff at VX then VY; landing within 200 ft of the point.", r: "Runway too short for the conditions; slow approach speed near the stall.", codes: ["PA.IV.E.K1", "PA.IV.E.S10", "PA.IV.F.S10", "PA.IV.F.R1"] } },
    { id: "soft", label: "Soft-field takeoff and landing · AFH 6, 9 · ACS PA.IV.C, D", title: "Get the weight off the wheels",
      body: `<p>Grass, mud, sand or snow drag on the wheels. On a <strong>soft-field takeoff</strong>, keep moving as you line up, with the flaps the POH calls for and full back-pressure to lift the nose wheel. Let the airplane lift off at the lowest possible speed, then <strong>level off in ground effect</strong> to accelerate before climbing at VX or VY. <span class="src">AFH 6 · ACS PA.IV.C</span></p>`,
      viz: { type: "fieldprof", opts: { phase: "to", tech: "soft" } },
      body2: `<p>On a <strong>soft-field landing</strong>, touch down as slowly as possible, often with a little power through the flare. Keep the nose wheel off the ground as long as you can, then keep it light, and keep the airplane moving. Avoid hard braking. <span class="src">AFH 9 · ACS PA.IV.D</span></p>`,
      kdr: { k: "Ground effect; soft-surface technique.", d: "Lift off at the lowest speed and accelerate in ground effect; land at minimum speed.", r: "Climbing out of ground effect too early; bogging down.", codes: ["PA.IV.C.K1", "PA.IV.C.S8", "PA.IV.D.S9", "PA.IV.C.R1"] } },
    { id: "scn", label: "Scenarios · ACS", title: "What would you do?",
      body: `<p>Three made-up situations, each with two decisions. Pick what you would do, then read why. There's often more than one safe answer; the card shows the best one and the reasons. <span class="src">FAA-S-ACS-6C · PHAK 2</span></p>`,
      viz: { type: "scenario", opts: { set: "fl8" } },
      body2: `<p>Talk each one through out loud, then ask your CFI to run a version at your own airport, with your airplane's POH numbers.</p>`,
      kdr: { k: "Takeoff and landing decisions: gusty crosswinds, unstable approaches and obstacles.", d: "Apply crosswind limits, a stabilized-approach gate and Vx/Vy.", r: "Unstable approaches and crosswinds beyond your limits.", codes: ["PA.IV.B.R1", "PA.IV.B.R2", "PA.IV.M.R9", "PA.IV.N.R1", "PA.IV.F.R1", "PA.IV.F.R5"] } },
  ],
  prep: {
    expect: ["Normal takeoffs and landings in the pattern, many times each flight.", "Crosswind practice when the wind allows.", "Short-field and soft-field demonstrations, then your own tries."],
    chairfly: ["Say the takeoff: \"Full power, gauges green, airspeed alive, right rudder, rotate, pitch for VY.\"", "Picture the aim point staying fixed in the windshield.", "Rehearse the go-around: power, attitude, configuration."],
    mistakes: ["Not enough right rudder on the roll.", "Chasing the airspeed instead of holding an attitude.", "Flaring too high or too late."],
    debrief: ["Were you stabilized by 500 ft?", "Did the aim point stay fixed?", "Where did you touch down compared with your point?"],
  },
};
