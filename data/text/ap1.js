export default {
  sections: [
    { id: "num", label: "Runway numbers · AIM 4-3-6", title: "The number is the heading",
      body: `<p>A runway number is the whole number nearest one-tenth of the centerline's <strong>magnetic</strong> azimuth. A runway pointing 183° is 18; one pointing 87° is 9. The other end is 180° away, so its number differs by 18. <span class="src">AIM 4-3-6; AIM 2-3-3</span></p>
<p>Turn the heading below and watch both ends. Then tap <em>Quiz me</em>.</p>`,
      viz: { type: "compass", opts: { hdg: 183 } },
      kdr: { k: "Runway designators and how they relate to magnetic headings.", d: "Picture the runway, the wind and the pattern from the number alone.", r: "Lining up on the wrong runway.", codes: ["PA.III.B.S1", "PA.III.B.S4", "PA.II.D.R2"] } },
    { id: "par", label: "Parallel runways · AIM 2-3-3", title: "Left and right from the approach",
      body: `<p>Parallel runways add a letter: L and R for two, L, C and R for three. Letters are read left to right <strong>as seen from the approach</strong>, so 36L becomes 18R from the other end. <span class="src">AIM 2-3-3</span></p>
<p>Tower winds are magnetic too, which is why you can compare "wind 210 at 10" straight against runway 22. METAR and TAF winds are true. <span class="src">AIM 4-3-6</span></p>`,
      viz: { type: "compass", opts: { hdg: 360, map: "lr" } },
      kdr: { k: "Runway designators; wind references.", d: "Confirm the runway on the heading indicator before takeoff.", r: "Wrong-runway takeoffs at multi-runway airports.", codes: ["PA.III.B.S4", "PA.II.D.R2"] } },
    { id: "prep", label: "Before you taxi · ACS PA.II.D", title: "Brief the airport first",
      body: `<p>Look at the airport diagram before you move. Find your parking spot, the runway you expect and the route to it, every runway you must cross, and any [[hot spot|hot spot]] (circles or ellipses labeled HS 1, HS 2 and so on). The [[chart supplement]] lists them. <span class="src">ACS PA.II.D.S2; FAA Runway Safety: Hot Spots</span></p>
<p>The next lessons go through every line, sign and light you'll pass on the way. Confirm local procedures with your CFI.</p>`,
      kdr: { k: "Airport diagrams, hot spots and the Chart Supplement.", d: "Use an airport diagram and plan the taxi route.", r: "Incursions; distraction while taxiing.", codes: ["PA.II.D.K1", "PA.II.D.K6a", "PA.II.D.S2", "PA.II.D.R4"] } },
  ],
};
