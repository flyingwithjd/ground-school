// FL11 lesson text · Basic attitude instrument flying. Sources: FAA-H-8083-15B (Instrument Flying Handbook) ch 4–6;
// AFH FAA-H-8083-3C ch 18; ACS FAA-S-ACS-6C PA.VIII.
export default {
  sections: [
    { id: "cp", label: "Control and performance · FAA-H-8083-15B ch 4", title: "Set an attitude, check the result",
      body: `<p>Flying by instruments works the same way as flying by the outside view: <strong>attitude plus power equals performance</strong>. The <strong>control instruments</strong>, the attitude indicator and the power gauge, are what you set. The <strong>performance instruments</strong>, airspeed, altimeter, vertical speed, heading and turn coordinator, show the result. <span class="src">FAA-H-8083-15B ch 4</span></p>
<p>Your eyes move in a <strong>scan</strong>: out to one performance instrument, back to the attitude indicator, out to the next. Three errors to avoid: <strong>fixation</strong> (staring at one instrument), <strong>omission</strong> (leaving one out) and <strong>emphasis</strong> (trusting one too much). <span class="src">FAA-H-8083-15B ch 4</span></p>`,
      viz: { type: "instpanel" },
      body2: `<p>Make small pitch changes, about a bar width or a degree or two at a time, and trim off the control pressure so the airplane holds the attitude by itself. <span class="src">FAA-H-8083-15B ch 5</span></p>`,
      kdr: { k: "Instrument cross-check; control and performance instruments.", d: "Fly by attitude and power, confirming with the performance instruments.", r: "Fixation, omission and emphasis.", codes: ["PA.VIII.A.K1d", "PA.VIII.A.R5", "PA.VIII.A.R6", "PA.VIII.A.R8"] } },
    { id: "man", label: "The basic maneuvers · ACS PA.VIII.A–D", title: "Level, climb, descend, turn",
      body: `<p>The ACS asks for four maneuvers by reference to instruments, usually wearing a view-limiting device: <strong>straight-and-level</strong>, <strong>constant-airspeed climbs</strong>, <strong>constant-airspeed descents</strong>, and <strong>turns to headings</strong>. Hold altitude ±200 ft, heading ±20° and airspeed ±10 kt; turns are at standard rate, rolling out on the assigned heading ±10°. <span class="src">ACS PA.VIII.A–D</span></p>
<p>A <strong>standard-rate turn</strong> is 3° per second, a full circle in 2 minutes. The turn coordinator's index marks show it. The bank it takes depends on speed: roughly true airspeed ÷ 10, plus 7, or about 15° at 100 knots. <span class="src">FAA-H-8083-15B ch 5</span></p>`,
      viz: { type: "attind", opts: { mode: "ai" } },
      kdr: { k: "Attitude indications; standard-rate turns.", d: "Straight-and-level, climbs, descents and turns to ACS standards by instruments.", r: "Control application by instruments alone.", codes: ["PA.VIII.A.S2", "PA.VIII.B.S3", "PA.VIII.C.S3", "PA.VIII.A.R7"] } },
    { id: "ua", label: "Unusual attitudes · FAA-H-8083-15B ch 5 · ACS PA.VIII.E", title: "Recognize it, then recover in order",
      body: `<p>An <strong>unusual attitude</strong> is any attitude you didn't intend, usually from distraction or disorientation. Identify it first from the instruments: is the nose high (airspeed falling) or low (airspeed building)? Then recover in the right order. <span class="src">FAA-H-8083-15B ch 5 · ACS PA.VIII.E</span></p>`,
      viz: { type: "attind", opts: { mode: "unusual" } },
      body2: `<p>Nose high: <strong>power, pitch, bank</strong>. Nose low: <strong>power off, bank, pitch</strong>. In both, the aim is to stop the trend before you reach a stall or an overspeed. If the attitude indicator disagrees with the other instruments, suspect it has failed. <span class="src">FAA-H-8083-15B ch 5</span></p>`,
      kdr: { k: "Procedures for recovery from unusual attitudes.", d: "Identify and recover from nose-high and nose-low attitudes.", r: "Control input errors; assessing the attitude.", codes: ["PA.VIII.E.K2", "PA.VIII.E.S1", "PA.VIII.E.R8", "PA.VIII.E.R9"] } },
    { id: "t180", label: "The 180° turn out of clouds · AFH 18", title: "Turn back the way you came",
      body: `<p>If you fly into cloud by accident, the way out you know is the way you came. Note your heading, then make a <strong>shallow, level turn</strong> to the reciprocal: no more than about 10° of bank for a pilot without instrument training, small smooth inputs, and the attitude indicator at the center of your scan. <span class="src">AFH 18</span></p>`,
      viz: { type: "turn180" },
      body2: `<p>Hold altitude: don't climb into more cloud or descend toward terrain. Tell ATC you're a VFR pilot in IMC and ask for help. Better still, turn around early, while you can still see. <span class="src">AFH 18 · AIM 6-2</span></p>`,
      kdr: { k: "Procedures to regain VMC after inadvertent IMC.", d: "Fly a level 180° turn by instruments and roll out on the reciprocal heading.", r: "Spatial disorientation; loss of control.", codes: ["PA.VIII.E.K3", "PA.VIII.A.R1", "PA.VIII.A.R2"] } },
  ],
  prep: {
    expect: ["Flying under a view-limiting device while your CFI watches outside.", "Straight-and-level first, then climbs, descents and turns to headings.", "Unusual attitudes: your CFI sets one up while your eyes are closed, then hands you the controls."],
    chairfly: ["Say the scan: \"Attitude, airspeed, attitude, altimeter, attitude, heading.\"", "Say the recoveries: \"Nose high: power, pitch, bank. Nose low: power off, bank, pitch.\"", "Rehearse a 180: note the heading, 10° of bank, hold altitude, roll out on the reciprocal."],
    mistakes: ["Fixating on the altimeter while the heading wanders.", "Big pitch changes instead of a degree or two.", "Pulling before leveling the wings in a nose-low attitude."],
    debrief: ["Which instrument did you fixate on?", "Did you hold ±200 ft and ±20°?", "How did the unusual attitude feel compared with what the instruments showed?"],
  },
};
