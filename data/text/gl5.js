// GL5 lesson text
export default {
  sections: [
    { id: "terms", label: "Weight & balance terms · PHAK 10", title: "Weight, arm, moment",
      body: `<p>Every item in the airplane has a <strong>weight</strong> and an <strong>arm</strong>, its distance in inches from the [[datum]]. Multiply them and you get its [[moment]]. Add up the weights and the moments, divide, and you have the [[center of gravity]]. <span class="src">PHAK 10</span></p>
<p>In the 172S the datum is the lower front face of the firewall, so every arm is a positive number of inches aft of it. <span class="src">POH 2</span></p>
<ul><li><strong>Standard empty weight</strong>: airframe, engine, fixed equipment, unusable fuel and full oil.</li><li><strong>Basic empty weight</strong>: standard empty plus installed optional equipment. Your airplane's actual figure is in its weight and balance record.</li><li><strong>Useful load</strong>: everything you add (people, baggage, usable fuel). Maximum weight minus basic empty weight.</li></ul>
<p>Standard weights: gasoline 6 lb per gallon, oil 7.5 lb per gallon. Use actual weights when you have them. <span class="src">PHAK 10</span></p>`,
      kdr: { k: "Datum, arm, moment, CG; empty weight terms; useful load.", d: "Find your airplane's actual empty weight and moment in its records.", r: "Using a sample airplane's numbers instead of your own.", codes: ["PA.I.F.K2f"] } },
    { id: "calc", label: "Computing CG · POH 6", title: "Plot it on the envelope",
      body: `<p>Load the airplane below. The point is your takeoff weight and CG; slide the fuel burned to see where you will land. The envelope comes from the POH limits: forward 35.0 in at 1,950 lb or less, sloping to 41.0 in at 2,550 lb; aft 47.3 in at all weights. <span class="src">POH 2</span></p>`,
      viz: { type: "wb" },
      body2: `<p>Seat arms in the POH sample are 37 in for the front seats (they slide from 34 to 46) and 73 in for the rear. Baggage area A is at 95 in, area B at 123 in, and fuel at 48 in. <span class="src">POH 6</span></p>`,
      kdr: { k: "How to compute weight, moment and CG and read the envelope.", d: "Compute W&B before every flight, including the landing CG.", r: "Mental math and 'it's always fine' with full seats and baggage.", codes: ["PA.I.F.S1"] } },
    { id: "shift", label: "Moving weight · PHAK 10", title: "Move weight, move CG",
      body: `<p>When you move weight inside the airplane, total weight stays the same but the moment changes. A proportion gives the shift directly: <strong>weight moved ÷ total weight = CG change ÷ distance moved</strong>. <span class="src">PHAK 10</span></p>
<p>Example: in an 8,000 lb airplane, moving 100 lb back 120 in moves the CG 1.5 in aft. Adding weight works the same way, using the new total weight and the distance from the old CG.</p>
<p>Loading problems are usually fixed by moving baggage or a passenger, or by carrying less fuel.</p>`,
      kdr: { k: "Weight-shift and weight-change formulas.", d: "Correct an out-of-CG loading.", r: "Fixing weight by burning fuel you will need.", codes: ["PA.I.F.S1"] } },
    { id: "effects", label: "Effects of loading · PHAK 10", title: "Heavy flies worse",
      body: `<p>An overloaded airplane may not leave the ground, and if it does it may handle unexpectedly. The PHAK lists higher takeoff speed, a longer takeoff run, a lower rate and angle of climb, a lower maximum altitude, shorter range, lower cruise speed, reduced maneuverability, a higher stall speed, a higher approach and landing speed and a longer landing roll. <span class="src">PHAK 10</span></p>
<p>CG location matters as much as weight: see Stability in GL3. A forward CG raises stall speed and elevator forces; an aft CG reduces stability and makes stall recovery harder.</p>`,
      kdr: { k: "Effects of overweight and CG position.", d: "Leave weight behind when performance is marginal.", r: "Overweight takeoffs at high density altitude.", codes: ["PA.I.F.K2e"] } },
    { id: "da", label: "Density altitude · PHAK 4, 11", title: "The altitude the airplane feels",
      body: `<p>[[Pressure altitude]] is the altitude in the standard atmosphere for the pressure you have: set 29.92 in the altimeter, or add about 1,000 ft for each inch the setting is below 29.92. [[Density altitude]] is pressure altitude corrected for nonstandard temperature. <span class="src">PHAK 4, 11</span></p>
<p>Standard temperature is 15 °C at sea level and falls about 2 °C per 1,000 ft. Warmer than standard, the air is thinner and density altitude rises. Humidity lowers density a little more.</p>`,
      viz: { type: "densalt" },
      kdr: { k: "Pressure and density altitude; their effect on performance.", d: "Compute pressure altitude before using the POH tables.", r: "Hot, high and heavy takeoffs.", codes: ["PA.I.F.K2a"] } },
    { id: "perf", label: "Takeoff and landing · POH 5", title: "Will it fit the runway",
      body: `<p>The POH tables give the ground roll and the distance to clear a 50 ft obstacle for pressure altitude and temperature at maximum weight. Their notes adjust for wind and surface. Try a hot day at a high field, then add a tailwind.</p>`,
      viz: { type: "perf" },
      body2: `<p>Tables assume the technique in the POH, a new airplane, and a paved, level, dry runway. Slope, wet grass, soft ground, a tired engine or a late rotation all add distance that the chart does not show. Many instructors teach a personal margin on top of the book number. <span class="src">PHAK 11 · ACS PA.I.F.R3</span></p>`,
      kdr: { k: "Using performance tables and their notes.", d: "Compute takeoff and landing distance for the conditions.", r: "Differences between calculated and actual performance.", codes: ["PA.I.F.S2", "PA.I.F.R3"] } },
  ],
};
