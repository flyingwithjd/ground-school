export default {
  sections: [
    { id: "wca", label: "Wind triangle · PHAK 16", title: "Point into the wind",
      body: `<p>To fly a course over the ground in a crosswind, turn the nose into the wind by the <strong>wind correction angle</strong>. The triangle gives WCA ≈ arcsin(crosswind ÷ true airspeed). The slower you fly, the bigger the angle for the same wind. <span class="src">PHAK Ch 16</span></p>`,
      viz: { type: "xwind", opts: { mode: "wca", rwy: 360, wind: 60, kt: 20 } },
      kdr: { k: "Wind correction and groundspeed.", d: "Hold a ground track by crabbing.", r: "Drifting off course.", codes: ["PA.III.B.S3", "PA.I.C.K3b"] } },
    { id: "crab", label: "Crab vs slip · AFH 9", title: "Crab first, then slip",
      body: `<p>On final you can <strong>crab</strong> (heading into the wind, wings level) or use the <strong>wing-low</strong> sideslip (upwind wing down, opposite rudder, nose on the centerline). The crab is easier to hold, but you must take it out right before touchdown. The AFH recommends the wing-low method in most cases; many pilots crab on final and change to wing-low before the roundout. <span class="src">AFH 9</span></p>`,
      viz: { type: "slip", opts: { mode: "crab" } },
      kdr: { k: "Crosswind approach techniques.", d: "Touch down aligned with no drift.", r: "Side loads on touchdown; loss of control.", codes: ["PA.IV.B.K3", "PA.IV.B.R1"] } },
    { id: "pat", label: "Drift in the pattern · AFH 7, 8", title: "Square over the ground",
      body: `<p>In the pattern, each leg has a different wind. Crab into the wind on each leg to keep a rectangle over the ground. Turns need more bank where groundspeed is highest and less where it is lowest. A tailwind on base pushes you through final, so start the turn earlier. <span class="src">AFH 7, 8</span></p>`,
      viz: { type: "groundref", opts: { mode: "rect" } },
      kdr: { k: "Wind drift correction in the pattern.", d: "Fly a rectangular track around the runway.", r: "Overshooting final; steep turns low.", codes: ["PA.III.B.S3", "PA.III.B.R2"] } },
  ],
};
