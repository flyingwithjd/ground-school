export default {
  sections: [
    { id: "start", label: "Before start · C172S POH 4", title: "Touch each item in order",
      body: `<p>Before Starting Engine sets up the cockpit: preflight and passenger briefing done, seats locked, brakes set, breakers in, electrical equipment and the [[avionics master|Avionics master]] off, [[fuel selector]] BOTH and [[fuel shutoff valve|Fuel shutoff valve]] ON. The avionics stay off during start to prevent possible damage. (In the [[G1000]] 172S the avionics switch has two halves, BUS 1 and BUS 2.) <span class="src">C172S POH 4</span></p>
<p>Learn the flow so the items get done quickly in a set order, then read the checklist to confirm nothing was missed. Memory alone breeds complacency. <span class="src">AFH 1</span></p>
<p class="note cfi">Steps follow the round-gauge Cessna 172S POH. Flying a G1000 (NAV III) 172S? Use the Panel switch: its checklist names the avionics as BUS 1 and 2 and adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["bstart", "start"] } },
      kdr: { k: "Use of appropriate checklists.", d: "Complete the appropriate checklist.", r: "Checklist usage.", codes: ["PA.II.B.K2", "PA.II.C.S2", "PA.II.B.S2"] } },
    { id: "sec", label: "Securing · C172S POH 4", title: "Leave it safe for the next pilot",
      body: `<p>Shut down in order: parking brake set, electrical equipment and avionics off, [[mixture]] to [[idle cutoff]] to stop the engine, then the ignition switch and master off (in the [[G1000]] 172S, also the [[standby battery]]). Install the [[control lock]] and set the fuel selector to LEFT or RIGHT to prevent crossfeeding. <span class="src">C172S POH 4</span></p>
<p class="note cfi">Steps follow the round-gauge Cessna 172S POH. Flying a G1000 (NAV III) 172S? Use the Panel switch: its checklist names the avionics as BUS 1 and 2 and adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["secure"] } },
      kdr: { k: "Shutdown, securing and postflight.", d: "Complete the securing checklist.", r: "Activities and distractions.", codes: ["PA.XII.A.K1", "PA.XII.A.S3", "PA.XII.A.R1"] } },
  ],
};
