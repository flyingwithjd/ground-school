export default {
  sections: [
    { id: "da", label: "Density altitude · PHAK 4", title: "The altitude the airplane feels",
      body: `<p>[[Density altitude]] is [[pressure altitude]] corrected for nonstandard temperature. High elevation, low pressure, high temperature and high humidity all raise it. Standard is 15 °C at sea level, decreasing about 2 °C per 1,000 ft. Water vapor is lighter than dry air, so humid air is a little less dense. <span class="src">PHAK Ch 4</span></p>`,
      viz: { type: "densalt" },
      kdr: { k: "Atmospheric conditions and performance.", d: "Compute density altitude.", r: "Hot, high and heavy.", codes: ["PA.I.F.K2a", "PA.IV.A.K1"] } },
    { id: "eff", label: "Performance · PHAK 11; POH 5", title: "Same IAS, longer roll",
      body: `<p>At high density altitude the engine makes less power and the propeller less thrust, and the wing needs more true airspeed for the same indicated airspeed. You rotate at the same indicated speed but at a higher groundspeed, so the takeoff roll is longer and the climb is weaker. <span class="src">PHAK Ch 11</span></p>
<p>Check the POH Section 5 charts for the actual pressure altitude and temperature, then apply the wind and surface notes. Lean as the POH directs for high elevations. Confirm with your CFI and your aircraft's POH.</p>`,
      viz: { type: "perf" },
      kdr: { k: "Takeoff and landing performance.", d: "Use the POH charts.", r: "Calculated vs actual performance.", codes: ["PA.I.F.K1", "PA.I.F.R3"] } },
  ],
};
