export default {
  sections: [
    { id: "types", label: "Runway types · AIM 2-3-3", title: "Paint matches the approach",
      body: `<p>Runway markings are white. How much paint a runway has depends on how it is used: <strong>visual</strong> runways need only a designation and centerline; <strong>nonprecision</strong> instrument runways add threshold and aiming point markings; <strong>precision</strong> runways add touchdown zone markings and side stripes. <span class="src">AIM 2-3-2; AIM 2-3-3, TBL 2-3-1</span></p>
<p>Switch types and tap any marking to isolate it.</p>`,
      viz: { type: "rwymarks", opts: { type: "prec" } },
      kdr: { k: "Runway markings by type.", d: "Identify the runway and touchdown zone from the air.", r: "Landing long, or short of the usable runway.", codes: ["PA.II.D.K3", "PA.III.B.S1", "PA.II.D.R2"] } },
    { id: "elem", label: "Distance coding · AIM 2-3-3", title: "Stripes measure the runway",
      body: `<p>The <strong>aiming point</strong> is two broad stripes about 1,000 ft from the threshold. <strong>Touchdown zone</strong> bars come in groups of three, two and one, coded in 500-ft increments. Threshold stripes tell the width: 4 stripes is 60 ft, 8 is 100 ft, 12 is 150 ft. <span class="src">AIM 2-3-3, TBL 2-3-3; AC 150/5340-1M 2.7</span></p>
<p>Spacing in this drawing follows AC 150/5340-1M but is simplified.</p>`,
      viz: { type: "rwymarks", opts: { type: "prec" } },
      kdr: { k: "Aiming point and touchdown zone markings.", d: "Select and hold a touchdown point.", r: "Fixating on the numbers; long landings.", codes: ["PA.III.B.S1", "PA.IV.B.R1"] } },
    { id: "disp", label: "Displaced threshold · AIM 2-3-3", title: "Arrows, chevrons and bars",
      body: `<p>Behind a <strong>displaced threshold</strong>, white arrows lead to a 10-ft white threshold bar. That pavement is usable for takeoff in either direction and for rollout from the other direction, but not for touching down from this side. <span class="src">AIM 2-3-3</span></p>
<p>Yellow <strong>chevrons</strong> mark a blast pad or stopway: not usable for landing, takeoff or taxiing. A yellow demarcation bar separates the runway from it. A <strong>relocated</strong> threshold closes the pavement behind it, usually by NOTAM. Closed runways get yellow crosses. <span class="src">AIM 2-3-3; AIM 2-3 FIG 2-3-22</span></p>`,
      viz: { type: "rwymarks", opts: { type: "disp" } },
      kdr: { k: "Displaced thresholds, blast pads, closed runways.", d: "Use the correct runway length for takeoff and landing.", r: "Touching down before a displaced threshold.", codes: ["PA.II.D.K3", "PA.II.D.R2", "PA.IV.B.R1"] } },
  ],
};
