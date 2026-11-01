export default {
  sections: [
    { id: "hold", label: "Holding positions · AIM 2-3-5", title: "Solid side means stop",
      body: `<p>A runway holding position marking is four yellow lines: two solid and two dashed. Taxiing toward the runway you meet the solid lines; stop with no part of the airplane past them. At a towered airport you need a clearance to cross. At a nontowered airport you make sure the runway and its approaches are clear. <span class="src">AIM 2-3-5</span></p>
<p>Leaving the runway you meet the dashed side, and you are not clear until <strong>every part</strong> of the airplane has crossed. Toggle direction below and tap each marking.</p>`,
      viz: { type: "holdmarks" },
      kdr: { k: "Holding position markings; towered vs nontowered crossing.", d: "Hold short correctly; exit and clear the runway.", r: "Runway incursions.", codes: ["PA.II.D.K3", "PA.II.D.S8", "PA.II.D.R4"] } },
    { id: "twy", label: "Taxiway lines · AIM 2-3-4", title: "Yellow lines on the ground",
      body: `<p>Taxiway markings are yellow. Centered on the centerline you are on the path, but AIM says that <strong>doesn't guarantee wingtip clearance</strong>. Dashes on each side of the centerline (the enhanced centerline) warn of a runway hold line within 150 ft. A continuous double edge line means the pavement beyond isn't for aircraft; a dashed double line means it is. <span class="src">AIM 2-3-2; AIM 2-3-4</span></p>
<p>The ILS critical area hold looks like a ladder. A single dashed line holds you short of another taxiway. <span class="src">AIM 2-3-5</span></p>`,
      viz: { type: "holdmarks" },
      kdr: { k: "Taxiway markings and their meaning.", d: "Taxi on the centerline with wingtip clearance.", r: "Collision with obstacles or other aircraft.", codes: ["PA.II.D.K3", "PA.II.D.S7", "PA.II.D.R1"] } },
    { id: "hs", label: "Hot spots · FAA Runway Safety", title: "Where pilots get lost",
      body: `<p>A [[hot spot]] is a location on an airport movement area with a history or potential risk of collision or runway incursion, where pilots and drivers need extra attention. Hot spots are shown on airport diagrams as circles or ellipses and described in the [[chart supplement]]. <span class="src">FAA Runway Safety: Hot Spots</span></p>
<p>Write down the taxi instructions, read back every hold short, and save heads-down work for when you are stopped. If you're unsure, stop and ask. <span class="src">ACS PA.II.D</span></p>`,
      kdr: { k: "Hot spots; procedures to prevent incursions.", d: "Brief, read back and comply with taxi instructions.", r: "Distraction; incomplete readbacks.", codes: ["PA.II.D.K6a", "PA.II.D.S1", "PA.II.D.R4"] } },
  ],
};
