export default {
  sections: [
    { id: "fly", label: "First · C172S POH 3", title: "Keep flying the airplane",
      body: `<p>After an engine failure in flight, the most important task is to keep flying the airplane. Set best glide, 68 KIAS in the C172S, as quickly as possible. Then glide toward a suitable field while you look for the cause. <span class="src">C172S POH 3, Amplified Procedures</span></p>
<p class="note cfi">Steps are from the Cessna 172S NAV III POH. Your airplane's checklist may differ.</p>`,
      viz: { type: "mnemo", opts: { set: "abcde" } },
      kdr: { k: "Immediate action items; best glide speed.", d: "Establish best glide ±10 knots.", r: "Distraction and loss of control.", codes: ["PA.IX.B.K1", "PA.IX.B.K2a", "PA.IX.B.S1", "PA.IX.B.R6"] } },
    { id: "to", label: "Takeoff · C172S POH 3", title: "Low and slow: land ahead",
      body: `<p>On the takeoff roll, stop on the remaining runway. Immediately after takeoff, land straight ahead with only small changes in direction to avoid obstructions. The POH says altitude and airspeed are seldom enough for the 180° gliding turn back to the runway. <span class="src">C172S POH 3</span></p>
<p>Brief yourself before every takeoff: where you'll go if the engine quits at each point in the climb.</p>
<p class="note cfi">The drill follows the round-gauge Cessna 172S POH; its Panel switch shows the G1000 (NAV III) version, which adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["roll", "after"] } },
      kdr: { k: "Emergency procedures after takeoff.", d: "Select a landing area ahead.", r: "Low-altitude turns and stall/spin.", codes: ["PA.IX.B.K1", "PA.IX.B.S3", "PA.IX.B.R5"] } },
    { id: "restart", label: "In flight · C172S POH 3", title: "Fuel, mixture, spark",
      body: `<p>If time permits, try a restart: fuel shutoff on, selector both, fuel pump on, mixture rich, magnetos both, or start if the propeller has stopped. A windmilling propeller usually restarts on its own within a few seconds. <span class="src">C172S POH 3</span></p>
<p class="note cfi">The drill follows the round-gauge Cessna 172S POH; its Panel switch shows the G1000 (NAV III) version, which adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["restart"] } },
      kdr: { k: "Causes of power loss.", d: "Complete the restart checklist.", r: "Checklist usage.", codes: ["PA.IX.C.K1", "PA.IX.C.S2", "PA.IX.C.R1"] } },
    { id: "forced", label: "Forced landing · C172S POH 3", title: "Prepare the cabin, then land",
      body: `<p>If the engine won't restart, prepare for a forced landing. Transmit Mayday on 121.5 MHz with your location and intentions, and squawk 7700. Then run the emergency landing checklist: seats and belts, 70 KIAS flaps up or 65 flaps down, fuel and ignition off, flaps as required, master off when the landing is assured, doors unlatched, touchdown slightly tail low, brake heavily. <span class="src">C172S POH 3</span></p>
<p>With power available, a precautionary landing lets you fly over the field first at 65 KIAS with flaps 20° to inspect it. <span class="src">C172S POH 3</span></p>
<p class="note cfi">The drill follows the round-gauge Cessna 172S POH; its Panel switch shows the G1000 (NAV III) version, which adds the standby battery. Your airplane's checklist may differ.</p>`,
      viz: { type: "chairfly", opts: { drills: ["forced"] } },
      kdr: { k: "ELTs and ATC services to aircraft in distress.", d: "Configure the airplane per the POH.", r: "Configuring the airplane.", codes: ["PA.IX.B.K5", "PA.IX.B.K6", "PA.IX.B.S2", "PA.IX.B.R4"] } },
  ],
  prep: { expect: ["Your CFI will pull the power at a safe altitude and say \"simulated engine failure.\"", "You'll set best glide, pick a field and fly the checklist, touching each control."], chairfly: ["Sit in the airplane (or a chair) and touch each control in order for all four checklists.", "Say the Mayday call aloud."], mistakes: ["Looking for the field before setting best glide.", "Picking a field behind you, or one too far away.", "Rushing the restart and forgetting the fuel selector."], debrief: ["How long did it take to set 68 KIAS?", "Did you choose a field within gliding distance, into the wind?", "What would you do differently?"], note: "Confirm with your CFI and your aircraft's POH." },
};
