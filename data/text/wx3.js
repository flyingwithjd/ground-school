export default {
  sections: [
    { id: "shear", label: "Low-level wind shear · PHAK 12", title: "Headwind first, then trouble",
      body: `<p>Wind shear is a sudden, drastic change in wind speed and/or direction over a small area. It is most dangerous low, and is associated with fronts, thunderstorms, temperature inversions and upper winds over 25 kt. A headwind turning to a tailwind drops airspeed and performance. <span class="src">PHAK Ch 12</span></p>
<p>A <strong>microburst</strong> is about 1–2 miles across, lasts 5–15 minutes and can produce downdrafts up to 6,000 fpm. On takeoff you first get a helpful headwind, then a downdraft, then a growing tailwind. Avoid them. <span class="src">PHAK Ch 12</span></p>`,
      kdr: { k: "Windshear and microbursts.", d: "Recognize and avoid conditions for wind shear.", r: "Windshear on approach and departure.", codes: ["PA.I.C.K3b", "PA.I.C.K3h", "PA.III.B.R3"] } },
    { id: "mech", label: "Obstructions · PHAK 12; AFH 8", title: "Buildings make gusts",
      body: `<p>Hangars, trees, bluffs and terrain break up the wind into gusts that change quickly in direction and speed, worst near the runway on landing. On the downwind side of a ridge the air follows the terrain down and becomes increasingly turbulent. <span class="src">PHAK Ch 12</span></p>
<p>In gusty air, a common practice is to add half the gust factor to the approach speed. With a 70 kt approach and 15 kt gusts, that's 77 kt. Stay within the POH recommendations. <span class="src">AFH 8</span></p>`,
      kdr: { k: "Turbulence; gusty wind technique.", d: "Adjust approach speed for gusts.", r: "Loss of control near the ground.", codes: ["PA.I.C.K3g", "PA.IV.B.S7"] } },
    { id: "wake", label: "Wake turbulence · AIM 7-4", title: "Heavy, clean and slow",
      body: `<p>Every wing makes two counter-rotating vortices, from rotation to touchdown. They are strongest behind an airplane that is <strong>heavy, clean and slow</strong>, and they sink several hundred feet per minute. The usual hazard is a roll that can exceed your aileron authority. <span class="src">AIM 7-4-2 to 7-4-4</span></p>
<p>Pick a situation below.</p>`,
      viz: { type: "wake", opts: { mode: "land" } },
      kdr: { k: "Wake turbulence avoidance.", d: "Plan a path that stays above a larger airplane's wake.", r: "Wake encounters close to the ground.", codes: ["PA.II.F.R3", "PA.III.B.R3"] } },
    { id: "scn", label: "Scenarios · ACS", title: "What would you do?",
      body: `<p>Two made-up situations, each with two decisions. Pick what you would do, then read why. There's often more than one safe answer; the card shows the best one and the reasons. <span class="src">FAA-S-ACS-6C · PHAK 2</span></p>`,
      viz: { type: "scenario", opts: { set: "wx3" } },
      body2: `<p>Talk each one through out loud, then ask your CFI to run a version at your own airport, with your airplane's POH numbers.</p>`,
      kdr: { k: "Wind shear and wake decisions.", d: "Recognize a microburst and avoid wake.", r: "Low-altitude wind shear and wake encounters.", codes: ["PA.III.B.R3", "PA.VII.A.R4"] } },
  ],
};
