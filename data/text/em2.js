export default {
  sections: [
    { id: "eng", label: "Engine fire · C172S POH 3", title: "Starve it of fuel",
      body: `<p>Engine fires in flight are extremely rare. If one happens: mixture idle cutoff, fuel shutoff off, fuel pump off, master off, vents as needed, heat and air off, and 100 KIAS. If the fire continues, a higher speed within limits may give an incombustible mixture. Then make a forced landing. Don't try to restart. <span class="src">C172S POH 3</span></p>
<p>On the ground, start fires usually come from raw fuel in the exhaust after over-priming. The checklist has you keep cranking to start the engine. <span class="src">C172S POH 3</span></p>
<p class="note cfi">The drill follows the round-gauge Cessna 172S POH; its Panel switch shows the G1000 (NAV III) version, which adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["efire"] } },
      kdr: { k: "Causes and remedies for smoke or fire.", d: "Determine the right action and run the checklist.", r: "Checklist usage.", codes: ["PA.IX.C.K3", "PA.IX.C.S1", "PA.IX.C.R1"] } },
    { id: "elec", label: "Electrical fire · C172S POH 3", title: "Power off, air off",
      body: `<p>The first sign is usually the smell of burning insulation. Remove power (master off; in the G1000 172S, standby battery first), close vents and turn off heat and air to avoid drafts, use the extinguisher, then turn off avionics and every other switch except the ignition (magnetos). Only open vents once the fire is completely out. <span class="src">C172S POH 3</span></p>
<p>If you need power to reach an airport, check the circuit breakers but don't reset any that are open. Then bring systems back one at a time. <span class="src">C172S POH 3</span></p>
<p class="note cfi">The drill follows the round-gauge Cessna 172S POH; its Panel switch shows the G1000 (NAV III) version, which adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["elfire"] } },
      kdr: { k: "Electrical malfunctions and fire.", d: "Complete the checklist.", r: "Startle response.", codes: ["PA.IX.C.K2a", "PA.IX.C.K3", "PA.IX.C.S2", "PA.IX.C.R4"] } },
    { id: "chg", label: "Charging · C172S POH 3", title: "Shed load and land",
      body: `<p>HIGH VOLTS, or more than 40 amps of battery current: master ALT off, reduce electrical load, and land as soon as practical. LOW VOLTS at higher RPM: cycle the ALT side, check the ALT FIELD breaker, and if it stays on, shed load. When main bus voltage drops below 20 V, the standby battery powers the essential bus for at least 30 minutes. <span class="src">C172S POH 3</span></p>
<p>LOW VOLTS below 1,000 RPM on the ground: set 1,000 RPM and check that it goes off. <span class="src">C172S POH 3</span></p>
<p class="note cfi">Steps are from the Cessna 172S NAV III POH. Your airplane's checklist may differ.</p>`,
      kdr: { k: "Electrical malfunction.", d: "Respond to annunciators.", r: "Task prioritization.", codes: ["PA.IX.C.K2a", "PA.IX.C.S1", "PA.IX.C.R2"] } },
  ],
};
