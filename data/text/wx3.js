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
  ],
};
