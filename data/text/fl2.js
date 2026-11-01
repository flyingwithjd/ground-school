export default {
  sections: [
    { id: "att", label: "Attitude flying · AFH 3", title: "Outside, then inside",
      body: `<p>You fly the airplane by putting the nose and wings in a <strong>picture</strong> against the horizon. Then you glance at the instruments to confirm the result and go back outside. About 90% of your attention is outside. <span class="src">AFH 3</span></p>
<p>Each control moves the airplane about one axis. Drag the yoke and pedals below and watch which surface moves.</p>`,
      viz: { type: "controls", opts: { mode: "primary" } },
      body2: `<p>Set the attitude, let the airplane settle, then <strong>trim</strong> away the pressure. Attitude first, then trim; trim is not a steering control. <span class="src">AFH 3</span></p>`,
      kdr: { k: "Attitude, power and trim; integrated flight instruction.", d: "Hold altitude and heading by outside references.", r: "Fixating on the instruments.", codes: ["PA.I.F.K3"] } },
    { id: "turn", label: "Turns · AFH 3", title: "Bank, rudder, back pressure",
      body: `<p>A turn needs three things at once. Aileron sets the bank. Rudder cancels <strong>adverse yaw</strong>, the drag of the down aileron pulling the nose the wrong way. Back pressure adds lift, because tilted lift has to keep holding up the airplane. <span class="src">AFH 3</span></p>
<p>Shallow turns (under about 20°) tend to roll out; medium turns (20–45°) hold their bank; steep turns tend to keep steepening. Rotate the airplane about its axes below.</p>`,
      viz: { type: "axes" },
      kdr: { k: "Adverse yaw, overbanking, lift in a turn.", d: "Coordinated turns to a heading.", r: "Uncoordinated flight.", codes: ["PA.V.B.K3", "PA.V.B.R5"] } },
    { id: "climb", label: "Climbs and descents · AFH 3", title: "Pitch for speed, power for rate",
      body: `<p>To climb, raise the nose to the climb attitude, add full power and right rudder, then trim. In the 172S, VY is 74 KIAS and VX is 62 KIAS at sea level. <span class="src">POH 4</span></p>
<p>Lead the level-off by about 10% of the climb rate: 50 ft early at 500 fpm. Keep climb power until you reach cruise speed, then set cruise power and trim. To descend, reduce power and hold the attitude for the airspeed you want. <span class="src">AFH 3</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "Climb speeds; level-off lead; power vs pitch.", d: "Climbs and descents to an altitude at a target speed.", r: "Climbing turns without right rudder; poor lookout in a climb.", codes: ["PA.I.F.K3"] } },
  ],
  prep: {
    expect: ["Straight-and-level with the nose on a reference point.", "Medium turns left and right to headings.", "Climbs at VY and descents, with level-offs at assigned altitudes."],
    chairfly: ["Say each step of a turn entry: clear, aileron plus rudder, stop the roll, back pressure, hold the picture.", "Say a climb entry: pitch, power, right rudder, trim.", "Picture the level-off: 50 ft early at 500 fpm."],
    mistakes: ["Staring at the instruments instead of the horizon.", "No rudder in turns: the ball slides.", "Forgetting to trim, then fighting the yoke."],
    debrief: ["Where was the nose against the horizon in level flight?", "Which way did the ball go when you rolled into a left turn without rudder?", "How much did you lose or gain in altitude during turns?"],
  },
};
