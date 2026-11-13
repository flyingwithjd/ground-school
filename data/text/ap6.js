export default {
  sections: [
    { id: "seg", label: "Segmented circle · AIM 4-3-4", title: "The ground tells the wind",
      body: `<p>The big end of a wind sock points into the wind. A tetrahedron's small end points the direction of landing, but it can be set by hand, so trust the sock. A [[segmented circle]] adds landing strip indicators (runway alignment) and traffic pattern indicators: mentally enlarge one and its short arm is the base leg. Without one, turns are left. <span class="src">AIM 4-3-4; PHAK Ch 14; 14 CFR 91.126</span></p>
<p>Drag the wind and see which runway and pattern you would choose.</p>`,
      viz: { type: "segcircle", opts: { wind: 240 } },
      kdr: { k: "Wind indicators and traffic pattern indicators.", d: "Select the runway from wind indicators.", r: "Landing downwind or flying the wrong pattern.", codes: ["PA.II.D.K4", "PA.III.B.K1", "PA.III.B.S1"] } },
    { id: "gun", label: "Light gun · AIM 4-3-13", title: "No radio, still cleared",
      body: `<p>If your radio fails at a towered airport, the tower can still talk to you with a light gun. Green is permission, red is stop or give way, and flashing white means return to the start (on the ground only). Alternating red and green means extreme caution. <span class="src">AIM 4-3-13</span></p>
<p>Switch between ground and flight and tap each signal.</p>
<p>The full table: steady green is cleared for takeoff on the ground and cleared to land in the air. Flashing green is cleared to taxi on the ground and return for landing in the air. Steady red is stop on the ground; in the air it means give way to other aircraft and keep circling. Flashing red on the ground means taxi clear of the runway in use; in the air it means the airport is unsafe, do not land. Acknowledge by moving the ailerons or rudder in daylight, or by blinking the landing or navigation lights at night. <span class="src">AIM 4-3-13, TBL 4-3-1</span></p>`,
      viz: { type: "lightgun", opts: { where: "air" } },
      kdr: { k: "Light gun signals; lost communication.", d: "Respond to light signals.", r: "Communication failure in the pattern.", codes: ["PA.III.A.K3", "PA.III.A.K5"] } },
  ],
};
