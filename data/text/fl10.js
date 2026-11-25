// FL10 lesson text · Stalls and spins in depth. Sources: AFH FAA-H-8083-3C ch 5; PHAK FAA-H-8083-25C ch 5;
// ACS FAA-S-ACS-6C PA.VII.B–D; generic POH wording.
export default {
  sections: [
    { id: "poweroff", label: "Power-off stalls · AFH 5 · ACS PA.VII.B", title: "The approach-to-landing stall",
      body: `<p>A <strong>power-off stall</strong> practices the stall you could meet on approach: slow, configured for landing, power reduced, often in a turn. Pick an entry altitude that lets you finish no lower than <strong>1,500 ft AGL</strong>, and clear the area first. <span class="src">ACS PA.VII.B · AFH 5</span></p>
<p>Configure for the approach or landing, set up a stabilized descent, then smoothly raise the nose to an attitude that induces the stall. Hold the heading within ±10°, or a bank of no more than 20° (±10°) if turning. Acknowledge the cues as they come: the stall warning, mushy controls, buffet. Then <strong>recover promptly after the full stall</strong>. <span class="src">ACS PA.VII.B.S3–S7</span></p>`,
      viz: { type: "aoa" },
      body2: `<p>Recovery, in the AFH's order: disconnect any autopilot; <strong>pitch nose-down</strong> until the stall warning stops; roll wings level; add power as needed; retract speed brakes if you have them; return to the desired flight path. Then configure as your airplane's POH says and accelerate to VX or VY. <span class="src">AFH 5 · ACS PA.VII.B.S8–S9</span></p>`,
      kdr: { k: "Power-off stall aerodynamics, cues and recovery.", d: "Power-off stalls to ACS standards, finishing above 1,500 ft AGL.", r: "Inadvertent stall on approach; stall warning limits.", codes: ["PA.VII.B.K1", "PA.VII.B.K4", "PA.VII.B.S2", "PA.VII.B.S7", "PA.VII.B.R1"] } },
    { id: "poweron", label: "Power-on stalls · AFH 5 · ACS PA.VII.C", title: "The departure stall",
      body: `<p>A <strong>power-on stall</strong> practices the stall you could meet on takeoff or a go-around: high power, high nose, low speed. Set the takeoff, departure or cruise configuration, slow to the speed your CFI assigns, then set power to <strong>no less than 65 percent</strong> and raise the nose to the stall attitude. <span class="src">ACS PA.VII.C.S3–S5</span></p>
<p>Expect a high nose and strong <strong>left-turning tendencies</strong>: hold right rudder to stay coordinated. If a wing drops, keep the ball centered with rudder; reducing the angle of attack fixes the stall. Recover promptly after the full stall, using the same steps. <span class="src">AFH 5 · ACS PA.VII.C.S7–S8</span></p>`,
      kdr: { k: "Power-on stall factors and recovery.", d: "Power-on stalls to ACS standards with at least 65% power.", r: "Departure stall; uncoordinated flight at high power.", codes: ["PA.VII.C.K3", "PA.VII.C.K4", "PA.VII.C.S4", "PA.VII.C.S7", "PA.VII.C.R1"] } },
    { id: "other", label: "Accelerated, cross-control, trim, secondary · AFH 5", title: "The stalls that catch pilots",
      body: `<p>These four are why stalls happen at "normal" speeds near the ground. The ACS expects you to know them; your CFI may demonstrate some. <span class="src">ACS PA.VII.C.R5 · AFH 5</span></p>
<ul><li><strong>Accelerated stall</strong>: load factor raises the stall speed. An abrupt pull, or a steep turn with too much back-pressure, stalls the wing well above the 1 G stall speed. Use the slider below.</li>
<li><strong>Cross-control stall</strong>: overshooting the turn to final, a pilot adds inside rudder to tighten it, holds opposite aileron against the steepening bank and pulls. The low wing stalls first and the airplane can roll under, toward a spin. Fix an overshoot with a go-around, never with rudder.</li>
<li><strong>Elevator trim stall</strong>: on a go-around with nose-up approach trim, full power pitches the nose up steeply. Hold firm forward pressure and retrim.</li>
<li><strong>Secondary stall</strong>: pulling out of a stall recovery too quickly, before the airplane has regained speed, stalls it again.</li></ul><span class="src">AFH 5</span>`,
      viz: { type: "steepturn" },
      kdr: { k: "Secondary, accelerated, elevator trim and cross-control stalls.", d: "Recognize the setups and avoid them.", r: "Low-altitude stall or spin in the pattern.", codes: ["PA.VII.B.R5", "PA.VII.C.R5", "PA.VII.B.R1"] } },
    { id: "spin", label: "Spin awareness · AFH 5 · ACS PA.VII.D", title: "Stalled, yawing, rotating",
      body: `<p>A <strong>spin</strong> is an aggravated stall with autorotation: one wing is more deeply stalled than the other, and the airplane rotates while it descends. It needs both a <strong>stall</strong> and <strong>yaw</strong>. Coordinated flight and a prompt stall recovery keep one from starting. <span class="src">AFH 5</span></p>`,
      viz: { type: "spin" },
      body2: `<p>The AFH's general recovery, unless your airplane's POH says otherwise: <strong>power</strong> to idle, <strong>ailerons</strong> neutral, full <strong>rudder</strong> opposite the rotation, then brisk forward <strong>elevator</strong> to break the stall. When the rotation stops, neutralize the rudder and ease out of the dive. <span class="src">AFH 5</span></p>
<p>Private pilot applicants need spin <em>awareness</em>, not spin training. Many trainers prohibit intentional spins, or allow them only in the utility category at limited weight and CG. Check your airplane's POH limitations and placards. <span class="src">ACS PA.VII.D · 14 CFR 91.9</span></p>`,
      kdr: { k: "Spin causes and phases; spin recovery.", d: "Explain spin entry, phases and the recovery steps.", r: "Inadvertent spin at low altitude; loss of control.", codes: ["PA.VII.D.K1", "PA.VII.D.K2", "PA.VII.D.K3", "PA.VII.D.R1"] } },
    { id: "scn", label: "Scenarios · ACS", title: "What would you do?",
      body: `<p>Two made-up situations, each with two decisions. Pick what you would do, then read why. There's often more than one safe answer; the card shows the best one and the reasons. <span class="src">FAA-S-ACS-6C · PHAK 2</span></p>`,
      viz: { type: "scenario", opts: { set: "fl10" } },
      body2: `<p>Talk each one through out loud, then ask your CFI to run a version at your own airport, with your airplane's POH numbers.</p>`,
      kdr: { k: "Spin and accelerated stall decisions.", d: "Recover with PARE and by unloading.", r: "Loss of control in a steep turn or stall.", codes: ["PA.VII.D.R1", "PA.VII.D.R3", "PA.VII.C.R5", "PA.V.A.R1"] } },
  ],
  prep: {
    expect: ["Clearing turns, then power-off and power-on stalls, straight and in shallow turns.", "Your CFI may demonstrate an accelerated, cross-control or trim stall.", "Recoveries until they're automatic."],
    chairfly: ["Say the recovery: \"Nose down until the warning stops, wings level, power, back to the flight path.\"", "Feel for right rudder in a power-on stall.", "Picture an overshoot on final and say \"Go around\", not \"more rudder\"."],
    mistakes: ["Rolling with aileron before reducing the angle of attack.", "Pulling up too soon and stalling again.", "Letting the ball slide out during the stall."],
    debrief: ["Which cues did you notice first?", "How much altitude did each recovery take?", "Did you stay coordinated?"],
  },
};
