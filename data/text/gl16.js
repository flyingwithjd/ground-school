// GL16 lesson text · Aeronautical Decision Making. Sources: PHAK (FAA-H-8083-25C) Ch 2; Risk Management Handbook
// (FAA-H-8083-2A) Ch 4 and 6; AC 60-22. The ADM module units (AD1 IMSAFE/PAVE/attitudes, AD2 3P/DECIDE/scenarios) are part of this lesson.
export default {
  sections: [
    { id: "why", label: "What ADM is · PHAK 2 · AC 60-22", title: "Good judgment can be taught",
      body: `<p><strong>Aeronautical decision-making (ADM)</strong> is a systematic approach to the mental process pilots use to consistently find the best course of action for a given set of circumstances. <span class="src">PHAK 2 · AC 60-22</span></p>
<p><strong>Why it matters</strong>: the PHAK estimates that about <strong>80%</strong> of aviation accidents are related to human factors. Most happen during <strong>landing (24.1%)</strong> and <strong>takeoff (23.4%)</strong>, a small part of total flight time. <span class="src">PHAK 2, Fig 2-1</span></p>
<p><strong>History</strong>: <span class="src">PHAK 2</span></p>
<ul><li>The airlines developed the first ADM programs, as crew resource management (<strong>CRM</strong>).</li>
<li>FAA research led to six ADM manuals in <strong>1987</strong>.</li>
<li>Students trained with them made about <strong>10–50% fewer judgment errors</strong>.</li>
<li>One operator flying about 400,000 hours a year saw a <strong>54% drop</strong> in its accident rate.</li></ul>
<p>The lesson: judgment isn't just a by-product of experience. It can be trained.</p>
<p><strong>The ADM process</strong>: <span class="src">PHAK 2</span></p>
<ol><li>Identify hazardous attitudes.</li>
<li>Learn behavior-modification techniques.</li>
<li>Recognize and cope with stress.</li>
<li>Develop risk-assessment skills.</li>
<li>Use all resources.</li>
<li>Evaluate your own ADM.</li></ol>
<p class="note"><strong>Current reference:</strong> AC 60-22 (1991) is still the FAA's ADM advisory circular. The PHAK and the Risk Management Handbook (FAA-H-8083-2A) carry the newer material.</p>`,
      kdr: { k: "Definition and history of ADM; human factors in accidents.", d: "Explain why ADM is trained, not just learned by experience.", r: "Assuming experience alone produces good judgment.", codes: ["PA.I.H.K4"] } },
    { id: "risk", label: "Hazard, risk and the risk matrix · PHAK 2 · RMH 4", title: "A hazard is here now; risk is what it could do",
      body: `<p>A <strong>hazard</strong> is a present event, object or circumstance that could contribute to an undesired future event (a forecast of IMC, a tired pilot, a short runway). <strong>Risk</strong> is the future impact of a hazard that isn't controlled or eliminated. <span class="src">PHAK 2</span></p>
<p>The Risk Management Handbook rates risk by <strong>likelihood</strong> and <strong>severity</strong>. <span class="src">RMH 4</span></p>
<ul><li><strong>Likelihood</strong>: probable (may occur several times), occasional (may occur sometime), remote (unlikely but possible), improbable (highly unlikely).</li>
<li><strong>Severity</strong>: catastrophic (fatalities or total loss), critical (severe injury or major damage), marginal (minor injury or damage), negligible (less than minor).</li></ul>`,
      viz: { type: "riskmatrix" },
      body2: `<p><strong>Reading the result</strong>: high and serious mean <strong>no-go</strong>, unless you can lower the risk and a new assessment comes out medium or low. Medium means go, but mitigate where you can. Beware of skewing your inputs because you want to go. <span class="src">RMH 4</span></p>
<p><strong>The six-step process</strong> (PHAK Fig 2-3): <span class="src">PHAK 2</span></p>
<ol><li>Identify hazards.</li>
<li>Assess risks.</li>
<li>Analyze controls.</li>
<li>Make control decisions.</li>
<li>Use controls.</li>
<li>Monitor results.</li></ol>
<p><strong>Four principles</strong>: <span class="src">PHAK 2</span></p>
<ul><li>Accept no unnecessary risk.</li>
<li>Make risk decisions at the right level. You're PIC, so don't let ATC or passengers decide for you.</li>
<li>Accept risk when the benefits outweigh the costs.</li>
<li>Build risk management into every stage of planning and flight.</li></ul>`,
      kdr: { k: "Hazard versus risk; likelihood and severity; the risk management process.", d: "Rate a hazard on the matrix and pick controls.", r: "Skewing the assessment to justify going.", codes: ["PA.I.H.K4", "PA.II.B.S4", "PA.I.D.R4"] } },
    { id: "pave", label: "PAVE, personal minimums, external pressures · PHAK 2", title: "Find the hazards before you go",
      body: `<p>The four PAVE categories cover the whole flight. The <a href="#/lesson/ad1">Fitness and Risk</a> unit drills them; here's how they fit together. Set <strong>personal minimums</strong> for each one. Your limits come from your own experience and proficiency, not just what's legal. For example, if you've flown a 10-knot crosswind and the POH shows 15, your limit is 10 until more training with a CFI. <span class="src">PHAK 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "pave" } },
      body2: `<p>The PHAK calls <strong>external pressures</strong> the single most important key to risk management, because they can make you ignore all the other risks. Defuse them in advance with personal SOPs: <span class="src">PHAK 2</span></p>
<ul><li>Build in time for an extra fuel or weather stop.</li>
<li>Have a backup plan (an airline reservation, or time to drive).</li>
<li>Tell people at the destination you may be late, and how you'll let them know.</li>
<li>Carry an overnight kit so you're not pressured to get home.</li></ul>`,
      kdr: { k: "PAVE; personal minimums; managing external pressures.", d: "Write personal minimums and a personal SOP for external pressures.", r: "Get-there-itis overriding everything else.", codes: ["PA.II.A.R4", "PA.I.D.R4", "PA.I.H.S2"] } },
    { id: "three", label: "3P: Perceive, Process, Perform · PHAK 2", title: "PAVE, then CARE, then TEAM",
      body: `<p>The 3P model turns the six risk-management steps into a loop you can run in flight: <span class="src">PHAK 2</span></p>
<ol><li><strong>Perceive</strong> hazards with <strong>PAVE</strong>.</li>
<li><strong>Process</strong> them with <strong>CARE</strong>: Consequences, Alternatives, Reality, External factors.</li>
<li><strong>Perform</strong> with <strong>TEAM</strong>: Transfer, Eliminate, Accept, Mitigate.</li></ol>
<p>Then evaluate the result and start again, because your choice creates a new situation. A good rule of thumb: if you hear yourself say it will "probably" be okay, do a reality check. <span class="src">PHAK 2</span></p>`,
      viz: { type: "mnemo", opts: { sets: ["care", "team"] } },
      body2: `<p>Risk management happens on three timescales: <strong>strategic</strong> (long-term and complex), <strong>deliberate</strong> (planning, using experience and brainstorming) and <strong>time-critical</strong> (an on-the-fly mental review in flight). Most flight training happens in the time-critical timeframe. <span class="src">PHAK 2, Fig 2-10</span></p>`,
      kdr: { k: "3P with PAVE, CARE and TEAM.", d: "Run 3P on a scenario aloud.", r: "Deciding once and never re-evaluating.", codes: ["PA.I.H.K4", "PA.II.B.S4"] } },
    { id: "p5", label: "SRM and the 5P check · PHAK 2", title: "Five things, five times a flight",
      body: `<p><strong>CRM</strong> is the effective use of all available resources by a crew. <strong>Single-pilot resource management (SRM)</strong> applies the same idea to one pilot: managing all resources, on board and outside, before and during flight. SRM includes ADM, risk management, task management, automation management, CFIT awareness and situational awareness. <span class="src">PHAK 2</span></p>
<p>The <strong>5P</strong> check is a practical way to do SRM. Review the Plan, the Plane, the Pilot, the Passengers and the Programming at each of these points: <span class="src">PHAK 2</span></p>
<ul><li>preflight (the easiest place to cancel)</li>
<li>just before takeoff</li>
<li>midpoint of the flight, or hourly if the flight is longer than 2 hours</li>
<li>before descent</li>
<li>just before the final approach [[fix]], or before entering the traffic pattern if VFR</li></ul>`,
      viz: { type: "mnemo", opts: { set: "p5" } },
      body2: `<p>The PHAK warns that late nights, fatigue and sustained flight above 5,000 ft can make pilots less critical and more accepting, just as the hardest part of the flight arrives. Plan each arrival as if you might divert. <span class="src">PHAK 2</span></p>`,
      kdr: { k: "CRM and SRM; the 5P check and its decision points.", d: "Do a 5P review at each decision point.", r: "Sliding into acceptance mode late in a long flight.", codes: ["PA.I.H.K4", "PA.II.B.S4"] } },
    { id: "att", label: "Hazardous attitudes · PHAK 2, Fig 2-4", title: "Recognize, label, antidote",
      body: `<p>Five hazardous attitudes interfere with sound decisions. When you catch the thought, <strong>label it as hazardous</strong>, then say its <strong>antidote</strong>. <span class="src">PHAK 2</span></p>
<ul><li><strong>Anti-authority</strong>: "Don't tell me." Antidote: "Follow the rules. They are usually right."</li>
<li><strong>Impulsivity</strong>: "Do it quickly." Antidote: "Not so fast. Think first."</li>
<li><strong>Invulnerability</strong>: "It won't happen to me." Antidote: "It could happen to me."</li>
<li><strong>Macho</strong>: "I can do it." Antidote: "Taking chances is foolish."</li>
<li><strong>Resignation</strong>: "What's the use?" Antidote: "I'm not helpless. I can make a difference."</li></ul>
<p>Practice them in the <a href="#/lesson/ad1">Fitness and Risk</a> unit.</p>`,
      viz: { type: "attitude", opts: {} },
      kdr: { k: "The five hazardous attitudes and their antidotes.", d: "Name the attitude behind a statement and give its antidote.", r: "Acting on a hazardous attitude.", codes: ["PA.I.H.R2", "PA.I.H.K4"] } },
    { id: "hf", label: "Human factors and behavior · PHAK 2 · RMH 6", title: "Accidents are chains, not single mistakes",
      body: `<p><strong>Human factors</strong> are conditions like fatigue, complacency and stress, along with the science of human abilities and limits. They have been documented as a primary contributor to more than 70% of aircraft accidents. "Pilot error" is usually a <strong>chain</strong> of decisions, not one bad choice; break any link and the accident doesn't happen. <span class="src">PHAK 2</span></p>
<p>An FAA-supervised survey of over 4,000 pilots found five traits in accident-prone pilots: <span class="src">PHAK 2</span></p>
<ul><li>disdain for rules</li>
<li>driving-record violations that correlate with their accidents</li>
<li>thrill and adventure seeking</li>
<li>impulsive rather than methodical</li>
<li>underuse of outside information (instructors, ATC, flight service)</li></ul>
<p><strong>Stress</strong>: performance improves with some stress, peaks, then falls off fast. Stressors are environmental (heat, noise, vibration, lack of oxygen), physiological (fatigue, missed meals, illness) and psychological (life events, mental workload). The key is to stop, think and analyze before jumping to a conclusion. <span class="src">PHAK 2</span></p>
<p><strong>Bias</strong>: <span class="src">RMH 6</span></p>
<ul><li><strong>Expectation bias</strong>: you perceive what you expect, such as the usual taxi route or the runway you always use, even when the clearance or NOTAM says otherwise.</li>
<li><strong>Confirmation bias</strong>: you dismiss information that doesn't fit your plan.</li></ul>
<p>Fatigue makes both worse. Read clearances back and verify against the diagram.</p>`,
      kdr: { k: "Human factors; accident-prone traits; stress; expectation and confirmation bias.", d: "Recognize bias and stress in yourself and counter them.", r: "Expectation bias on taxi or approach.", codes: ["PA.I.H.R4", "PA.I.H.K1g", "PA.II.D.R2"] } },
    { id: "decide", label: "Decision-making models · PHAK 2", title: "Analytical when there's time, automatic when there isn't",
      body: `<p><strong>Analytical</strong> models such as <strong>DECIDE</strong> work when there's time: Detect, Estimate, Choose, Identify, Do, Evaluate. Watch out for misidentifying the problem. In the PHAK's twin example, the pilot feathered the wrong engine because he skipped "detect". <span class="src">PHAK 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "decide" } },
      body2: `<p><strong>Automatic or naturalistic</strong> decision-making is what experts do under time pressure: they recognize a familiar pattern and take the first workable option. It's built by training and experience, which is why you rehearse emergencies until the response is automatic. <span class="src">PHAK 2</span></p>
<p>The same problem can rate differently depending on context. The PHAK's example is a cabin door popping open: minor on a clear VFR day, serious in IMC with a new clearance coming. <span class="src">PHAK 2</span></p>`,
      kdr: { k: "Analytical (DECIDE) and automatic decision-making.", d: "Pick the right model for the time available.", r: "Acting before detecting the real problem.", codes: ["PA.I.H.K4"] } },
    { id: "pit", label: "Operational pitfalls · PHAK 2, Fig 2-15", title: "Traps that catch experienced pilots",
      body: `<p>The PHAK lists classic behavioral traps. Experienced pilots fall into them most, because they want to finish as planned, please passengers and meet schedules. Tap each one, then try recalling the list. <span class="src">PHAK 2</span></p>`,
      viz: { type: "mnemo", opts: { set: "pitfalls" } },
      body2: `<p>Examiners like scenario questions such as "the ceiling's lowering, you're 20 minutes from home and your passenger has a dinner reservation". Name the pitfall (get-there-itis, scud running, continued VFR into IMC), then give your alternative. <span class="src">PHAK 2</span></p>`,
      kdr: { k: "Operational pitfalls.", d: "Name the pitfall in a scenario and the way out.", r: "Scud running and continued VFR into IMC.", codes: ["PA.I.H.K4", "PA.I.D.R4"] } },
    { id: "sa", label: "Situational awareness and resources · PHAK 2", title: "Know what's happening and what's next",
      body: `<p><strong>Situational awareness</strong> is the accurate perception and understanding of everything affecting safety before, during and after the flight. That includes understanding <em>why</em> things are happening, for example why you're being vectored. <span class="src">PHAK 2</span></p>
<p><strong>What erodes it</strong>: fatigue, stress and work overload cause fixation. Distractions often start as minor problems (a misbehaving gauge) and become accidents when you stop flying the airplane to deal with them. <span class="src">PHAK 2</span></p>
<p><strong>Resources</strong>: <span class="src">PHAK 2</span></p>
<ul><li><em>Internal</em>: your knowledge and skill, checklists, the POH, and passengers, who can watch for traffic or read checklist items. Reading aloud and touching each control reinforces the action.</li>
<li><em>External</em>: ATC and flight service. ATC can give vectors and traffic advisories and help in emergencies.</li></ul>
<p>Brief passengers with <strong>SAFETY</strong>, and expect a <strong>sterile flight deck</strong> during departure and arrival.</p>`,
      viz: { type: "mnemo", opts: { set: "safety" } },
      body2: `<p class="note"><strong>Superseded:</strong> the PHAK still mentions "Flight Watch" (EFAS on 122.0 MHz). The FAA realigned EFAS into regular Flight Service in 2015 and ended the 122.0 frequency. Get in-flight weather from Flight Service on its published frequencies or 122.2 MHz. <span class="src">FAA Notice JO 7210.887 (2015)</span></p>`,
      kdr: { k: "Situational awareness; internal and external resources; passenger briefing.", d: "Use passengers, checklists, ATC and Flight Service as resources.", r: "Fixating on a minor problem and losing control.", codes: ["PA.I.H.R3", "PA.II.B.S4", "PA.VI.C.R5"] } },
    { id: "work", label: "Workload management · PHAK 2", title: "Do the work before you need to",
      body: `<p><strong>Workload management</strong> means planning, prioritizing and sequencing tasks so the essential ones get done. Prepare during low-workload periods for high-workload ones. <span class="src">PHAK 2</span></p>
<ul><li>Review the chart and set frequencies early.</li>
<li>Get ATIS, ASOS or AWOS, then monitor tower or CTAF.</li>
<li>Run checklists well ahead, especially before busy airspace.</li></ul>
<p>The first sign of overload is <strong>working harder but getting less done</strong>, then fixating on one item. Once you're task-saturated, decisions rest on incomplete information. The fix: stop, think, slow down, prioritize. Aviate, navigate, communicate. <span class="src">PHAK 2</span></p>`,
      viz: { type: "workload" },
      kdr: { k: "Workload management; task saturation.", d: "Front-load tasks and shed load when saturated.", r: "Task saturation in the terminal area.", codes: ["PA.I.H.R3", "PA.VI.A.R2"] } },
    { id: "auto", label: "Automation management · PHAK 2", title: "Fly the airplane, then the box",
      body: `<p>Automation (PFD, MFD, GPS and autopilot) is a huge safety advance, but it can hide errors, and it can lull pilots into complacency. Humans are poor passive monitors: the more reliable the system, the worse we watch it. Don't become the "passenger in command". <span class="src">PHAK 2</span></p>
<p><strong>Habits that work</strong>: <span class="src">PHAK 2</span></p>
<ul><li>Verify all programming before departure against a paper log.</li>
<li>Always know which autopilot modes are engaged and which are armed, and use callouts even when solo.</li>
<li>Use the VOR to back up GPS and vice versa.</li>
<li>Stop, look and read before pushing buttons.</li>
<li>Match automation use to your proficiency.</li></ul>
<p><strong>A known trap</strong>: on some systems, switching the navigation source while the autopilot is tracking in NAV mode drops it to wings-level (ROL) until you re-engage NAV. <span class="src">PHAK 2</span></p>
<p>Keep your stick-and-rudder skills sharp. Automation doesn't replace basic airmanship, and the PHAK says risk rises when pilots believe gadgets make up for skill. <span class="src">PHAK 2</span></p>`,
      kdr: { k: "Automation management; complacency; programming and mode awareness.", d: "Verify programming and call out mode changes.", r: "Complacency and mode confusion.", codes: ["PA.II.B.R1", "PA.II.B.S3"] } },
  ],
};
