// GL3 lesson text
export default {
  sections: [
    { id: "forces", label: "The four forces · PHAK 4, 5", title: "Four forces, one balance",
      body: `<p>[[Lift]] opposes [[weight]]; [[thrust]] opposes [[drag]]. In steady flight (climbing, level or descending at constant speed) the opposing forces cancel. That does not make all four equal: lift and weight are many times larger than thrust and drag. <span class="src">PHAK 5</span></p>
<p>Change one force and the airplane accelerates until a new balance is reached. Add power and the airplane speeds up or climbs; raise the nose without power and it slows.</p>`,
      viz: { type: "forces" },
      kdr: { k: "The four forces and how they balance in steady flight.", d: "Use pitch and power together to change speed or altitude.", r: "Pitch without power trades airspeed for altitude, toward the stall.", codes: ["PA.I.G.K1a"] } },
    { id: "lift", label: "Lift and angle of attack · PHAK 5", title: "Angle of attack makes lift",
      body: `<p>[[Angle of attack]] is the angle between the wing's [[chord line]] and the [[relative wind]], the airflow meeting the wing. It is not the pitch attitude: a wing can be at a high AOA with the nose level, for example when slow or heavily loaded. <span class="src">PHAK 5</span></p>
<p>Air flowing over the curved upper surface speeds up and its pressure drops ([[Bernoulli's principle]]); the wing also turns the airflow downward, and the reaction pushes the wing up (Newton's third law). Both describe the same lift. <span class="src">PHAK 4</span></p>
<p>Lift grows with AOA, with the square of airspeed, with air density and with wing area. Slow down and you need more AOA for the same lift. Past the [[critical angle of attack]] the flow can no longer follow the upper surface, separates, and lift collapses: a [[stall]]. In the 172S a pneumatic stall warning horn sounds 5 to 10 knots above the stall in all configurations. <span class="src">POH 4, 7</span></p>`,
      viz: { type: "aoa" },
      kdr: { k: "AOA vs pitch; what lift depends on; the critical AOA.", d: "Feel AOA rise as you slow: more back pressure, quieter air, stall horn.", r: "A stall can happen at any airspeed or attitude.", codes: ["PA.VII.C.K1"] } },
    { id: "drag", label: "Drag · PHAK 5", title: "Two drags, one sweet spot",
      body: `<p>[[Parasite drag]] (form, friction, interference) grows with the square of airspeed. [[Induced drag]] is the cost of making lift: it is greatest at low speed and high AOA, where the wingtip vortices are strongest. <span class="src">PHAK 5</span></p>
<p>Add them and total drag has a minimum where the two are equal. That point is [[L/D max]]: the most lift for the least drag. Flying near it gives the best glide (68 KIAS in the 172S). <span class="src">POH 3</span></p>
<p>Below that speed, slowing down <em>increases</em> drag, so holding altitude takes more thrust. Slow further, below the speed for minimum power required, and you are in the [[region of reversed command]]: a lower airspeed needs a <em>higher</em> power setting to hold altitude. It matters in slow flight and on a low, slow final. <span class="src">PHAK 11</span></p>`,
      viz: { type: "dragcurve" },
      kdr: { k: "Parasite vs induced drag; L/D max; best glide.", d: "Hold 68 KIAS for best glide in the 172S.", r: "On the back side of the curve, pulling up without power makes things worse.", codes: ["PA.I.G.K1a"] } },
    { id: "load", label: "Stalls and load factor · PHAK 5", title: "Bank raises the stall",
      body: `<p>In a level turn, lift tilts with the wings. Only its vertical part holds the airplane up, so the wing has to make more total lift. The ratio of lift to weight is the [[load factor]]: 1/cos(bank). It is 2 G at 60°, and climbs steeply past 45–50°. <span class="src">PHAK 5</span></p>
<p>Stall speed rises with the square root of load factor. Drag the bank below and compare with the 172S figures. <span class="src">POH 5</span></p>`,
      viz: { type: "loadfactor" },
      body2: `<p>Maneuvering speed ties this together. At or below [[VA|maneuvering speed]], a full abrupt control input stalls the wing before it can exceed the limit load. Above it, the same input can bend the airplane. <span class="src">PHAK 5 · POH 2</span></p>`,
      kdr: { k: "Load factor in turns; stall speed vs load factor; VA.", d: "Hold altitude in a 45° steep turn without exceeding limits (later stages).", r: "Steep, uncoordinated turns at low altitude cause stall-spin accidents.", codes: ["PA.VII.C.K1"] } },
    { id: "left", label: "Left-turning tendencies · PHAK 5", title: "Why the nose goes left",
      body: `<p>Seen from the cockpit, the 172's propeller turns clockwise. Four effects follow from that, and all four push the nose left at high power and low airspeed: takeoff and climb. <span class="src">PHAK 5</span></p>`,
      viz: { type: "leftturn" },
      body2: `<p>The fix for all four is the same: <strong>right rudder</strong>, enough to keep the ball centered and the nose tracking straight.</p>`,
      kdr: { k: "Torque, spiraling slipstream, P-factor, gyroscopic precession.", d: "Hold right rudder on the takeoff roll and in the climb.", r: "Uncorrected yaw at low speed leads to uncoordinated stalls.", codes: ["PA.IV.C.K6"] } },
    { id: "stab", label: "Stability · PHAK 5", title: "Center of gravity sets stability",
      body: `<p>A stable airplane returns toward its trimmed attitude after a disturbance. [[Static stability]] is the initial tendency; [[dynamic stability]] is what happens over time. <span class="src">PHAK 5</span></p>
<p>The CG sits ahead of the center of lift, so the wing tries to pitch the nose down and the horizontal tail pushes down to balance it. Move the CG and that balance changes.</p>`,
      viz: { type: "stability" },
      kdr: { k: "Static vs dynamic stability; CG effects on stall speed, cruise and control.", d: "Load within CG limits and recognize heavier or lighter pitch forces.", r: "Aft of the aft limit, stall and spin recovery may be impossible.", codes: ["PA.I.F.K1"] } },
    { id: "ge", label: "Ground effect · PHAK 5", title: "The runway changes lift",
      body: `<p>Close to the ground the wingtip vortices and the downwash are squeezed, so induced drag drops. At one wingspan up the reduction is 1.4%; at a quarter span 23.5%; at a tenth of span 47.6%. <span class="src">PHAK 5</span></p>
<p>Two consequences: on landing, excess speed makes the airplane <strong>float</strong>. On takeoff, the airplane can lift off before it can really climb, then sink back when it leaves ground effect. That is why soft-field technique accelerates in ground effect before climbing.</p>`,
      viz: { type: "groundeffect" },
      kdr: { k: "What ground effect does to induced drag and to the airspeed indication.", d: "Hold the airplane in ground effect to accelerate on a soft-field takeoff.", r: "Lifting off too slowly can leave you unable to climb out of ground effect.", codes: ["PA.IV.C.K4"] } },
  ],
};
