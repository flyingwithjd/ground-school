export default {
  sections: [
    { id: "ctaf", label: "CTAF · AIM 4-1-9", title: "Everyone talks to everyone",
      body: `<p>Without an operating tower, pilots self-announce on the [[CTAF]]. It may be a [[UNICOM]], MULTICOM, FSS or tower frequency, shown on charts and in the [[chart supplement]]. With none of those, use MULTICOM 122.9. <span class="src">AIM 4-1-9</span></p>
<p>Inbound, call about 10 miles out, then entering downwind, base, final and leaving the runway. Start and end with the airport name. Say the runway number, not "active runway." "Traffic in the area, please advise" isn't a recognized phrase. <span class="src">AIM 4-1-9</span></p>
<p class="ex">Example call: "Strawn traffic, Apache two two five zulu, one zero miles south, descending through three thousand, landing Strawn."</p>`,
      kdr: { k: "CTAF, UNICOM and self-announce procedures.", d: "Make standard position reports.", r: "Missed or unclear position reports.", codes: ["PA.III.A.K1", "PA.III.A.S2", "PA.III.A.R1"] } },
    { id: "rwy", label: "Runway choice · AC 90-66C 11.5", title: "Most nearly into wind",
      body: `<p>Use the runway most nearly aligned into the wind. Determine the runway and pattern from above pattern altitude, then go well clear before descending to it. <span class="src">AC 90-66C 11.2, 11.5</span></p>`,
      viz: { type: "segcircle", opts: { wind: 300 } },
      kdr: { k: "Runway selection with wind.", d: "Select the runway with the most headwind.", r: "Tailwind or excess crosswind landings.", codes: ["PA.III.B.K1", "PA.III.B.S1", "PA.III.B.R2"] } },
    { id: "entry", label: "Pattern entry · AC 90-66C 11.3", title: "The 45 at pattern altitude",
      body: `<p>Enter the downwind on a 45° angle abeam the runway midpoint, level at pattern altitude. Hold pattern altitude until at least abeam the approach end, then turn base about 45° from it. A midfield crossing above pattern altitude is an alternative, but not when the pattern is congested. Straight-in VFR approaches are discouraged. <span class="src">AC 90-66C 11.3, 11.4, App A; AIM 4-1-9</span></p>
<p>Tap the entries and legs. Confirm local pattern altitude and procedures with your CFI and the Chart Supplement.</p>`,
      viz: { type: "pattern", opts: { entries: true } },
      kdr: { k: "Nontowered pattern procedures.", d: "Enter, fly and depart the pattern.", r: "Collision in the pattern.", codes: ["PA.III.B.K2", "PA.III.B.S2", "PA.III.B.R1"] } },
    { id: "twr", label: "Towered airports · AIM 4-3", title: "Ask, read back, comply",
      body: `<p>At a towered airport you need a clearance to taxi onto or cross a runway, take off and land. ATC may assign the runway, the pattern direction and the sequence. Read back runway assignments, hold short instructions and clearances to enter or cross. You still see and avoid. <span class="src">AIM 4-3; ACS PA.III.A</span></p>
<p>If the tower is part-time and closed, its frequency often becomes the CTAF. Check the Chart Supplement. <span class="src">AIM 4-1-9</span></p>`,
      kdr: { k: "Towered airport operations; ATC clearances.", d: "Comply with ATC; read back hold short instructions.", r: "Misunderstood clearances.", codes: ["PA.III.A.K2", "PA.II.D.S1", "PA.III.A.S3", "PA.III.A.R4"] } },
  ],
};
