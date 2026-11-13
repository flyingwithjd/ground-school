export default {
  sections: [
    { id: "start", label: "Before start · C172S POH 4", title: "Touch each item in order",
      body: `<p>Before Starting Engine sets up the cockpit: preflight and passenger briefing done, seats locked, brakes set, breakers in, electrical and [[avionics master|Avionics master]] off, [[fuel selector]] BOTH and [[fuel shutoff valve|Fuel shutoff valve]] ON. The avionics stay off during start to prevent possible damage. <span class="src">C172S POH 4</span></p>
<p class="note cfi">Steps are from the Cessna 172S NAV III POH. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["bstart"] } },
      kdr: { k: "Use of appropriate checklists.", d: "Complete the appropriate checklist.", r: "Checklist usage.", codes: ["PA.II.B.K2", "PA.II.C.S2", "PA.II.B.S2"] } },
    { id: "sec", label: "Securing · C172S POH 4", title: "Leave it safe for the next pilot",
      body: `<p>Shut down in order: brake set, idle, electrical and avionics off, [[mixture]] to [[idle cutoff]] to stop the engine, then magnetos, master and [[standby battery]] off. Install the [[control lock]] and set the fuel selector to LEFT or RIGHT to prevent crossfeeding. <span class="src">C172S POH 4</span></p>
<p class="note cfi">Steps are from the Cessna 172S NAV III POH. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["secure"] } },
      kdr: { k: "Shutdown, securing and postflight.", d: "Complete the securing checklist.", r: "Activities and distractions.", codes: ["PA.XII.A.K1", "PA.XII.A.S3", "PA.XII.A.R1"] } },
  ],
};
