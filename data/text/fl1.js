export default {
  sections: [
    { id: "pre", label: "Preflight · AFH 2", title: "Know why you check",
      body: `<p>The checklist tells you what to look at. The ACS asks you to know <strong>why</strong>, how a defect would show up, and which rule applies. <span class="src">ACS PA.II.A.K3</span></p>
<p>Start inside: documents, master on for fuel quantity and lights, then off. Then walk around in the order your checklist gives. Drain every fuel sump and check for water, sediment and grade. Check oil (5 quarts minimum in the 172S). Look at control surfaces, hinges and hardware, the pitot tube and static port, tires and brakes, and the propeller. <span class="src">POH 4</span></p>`,
      viz: { type: "plane3d", opts: { mode: "explore" } },
      body2: `<p>Compare the fuel gauges with a visual check of the tanks. <span class="src">AFH 2</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "What each preflight item checks and why.", d: "Complete the inspection with a checklist.", r: "Rushing or skipping items when you are late.", codes: ["PA.II.A.K3", "PA.II.A.S1"] } },
    { id: "crm", label: "Flight deck · AFH 1", title: "Who is flying",
      body: `<p>Before every flight, agree how controls change hands: "You have the flight controls." "I have the flight controls." "You have the flight controls." Then look to make sure. <span class="src">AFH 1</span></p>
<p>Brief your passengers on seat belts and shoulder harnesses (required by 14 CFR 91.107), doors, and what to do in an emergency. Secure loose items. <span class="src">ACS PA.II.B</span></p>`,
      kdr: { k: "Positive exchange of controls; passenger briefing.", d: "Brief and secure the cabin.", r: "Confusion over who is flying.", codes: ["PA.II.B.K1", "PA.II.B.S1"] } },
    { id: "taxi", label: "Taxi · AFH 2", title: "Climb into the wind",
      body: `<p>Taxi slowly enough that closing the throttle stops you promptly. Test the brakes as soon as you start moving. Keep your eyes outside. <span class="src">AFH 2</span></p>
<p>In a quartering <strong>headwind</strong>, turn the yoke toward the wind (upwind aileron up) so the wind cannot lift that wing. In a quartering <strong>tailwind</strong>, push the yoke forward and turn it away from the wind (upwind aileron down) so the wind cannot get under the tail and wing. Pilots remember it as "climb into, dive away from." <span class="src">AFH 2</span></p>`,
      kdr: { k: "Taxi control positions for wind.", d: "Brake check; control taxi speed; hold the centerline.", r: "Runway incursions; heads-down taxi.", codes: ["PA.II.D.S3", "PA.II.D.S5", "PA.II.D.R4"] } },
    { id: "run", label: "Before takeoff · POH 4", title: "What the runup tests",
      body: `<p>At 1,800 RPM, check each magneto alone. A small drop is normal because one set of plugs is doing the work. Too big a drop, or too big a difference between the two, means an ignition problem. No drop at all can mean a magneto is not grounding, which is dangerous if someone moves the propeller. <span class="src">POH 4</span></p>
<p>Also check the engine and electrical indications, flight controls free and correct, trim set for takeoff, and brief the departure, including what you will do if the engine fails. Review takeoff performance. <span class="src">ACS PA.II.F</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "Reasons for each runup item; detecting malfunctions.", d: "Complete the before-takeoff checklist.", r: "Accepting a marginal runup result.", codes: ["PA.II.F.K1a", "PA.II.F.K1b", "PA.II.F.S1"] } },
  ],
  prep: {
    expect: ["Your instructor will walk the preflight with you, then let you lead it.", "You will start the engine, taxi and do the runup with coaching.", "You may fly the airplane for part of the flight to feel the controls."],
    chairfly: ["Sit with the checklist and touch each control in order, saying each item out loud.", "Picture the taxi route from the ramp to the runway on the airport diagram.", "Say the exchange of controls out loud three times."],
    mistakes: ["Taxiing too fast and riding the brakes.", "Looking at the checklist while the airplane is moving.", "Forgetting to check the fuel sumps or the oil cap."],
    debrief: ["Which preflight items could you explain, and which ones could you only point at?", "How did the airplane respond to wind while taxiing?", "What would you do with a 200 RPM magneto drop?"],
    note: "Follow your school's checklist and your instructor's procedures. This briefing is a study aid.",
  },
};
