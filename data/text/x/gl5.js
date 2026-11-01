// GL5 supplement text: climb performance and V-speeds, cruise/range/endurance, stall speed chart, runway factors (PHAK 11; C172S POH Sec 4, 5).
export default {
  sections: [
    { id: "speeds", at: "da", label: "Performance speeds · PHAK 11", title: "Vx, Vy and the ceiling",
      body: `<p><strong>V<sub>X</sub></strong>, best angle of climb, gives the most altitude in a given <strong>distance</strong>, so use it to clear obstacles. <strong>V<sub>Y</sub></strong>, best rate of climb, gives the most altitude in a given <strong>time</strong>. As altitude rises, V<sub>X</sub> normally increases slightly and V<sub>Y</sub> decreases slightly. <span class="src">PHAK 11</span></p>
<p>In the 172S at 2,550 lb: <strong>V<sub>X</sub> 62 KIAS</strong> at sea level (67 at 10,000 ft); <strong>V<sub>Y</sub> 74 KIAS</strong> at sea level (72 at 10,000 ft). A normal climb is 75–85 KIAS. <span class="src">POH 4</span></p>
<p>Climb comes from excess power and thrust. More weight, higher altitude, or extended flaps or gear all reduce it. The 172S full-throttle climb chart shows about 785 fpm at sea level and 0 °C, but only about 300 fpm at 10,000 ft and 0 °C. <span class="src">PHAK 11 · POH 5</span></p>
<p>The <strong>service ceiling</strong> is where the airplane can no longer climb faster than <strong>100 fpm</strong>. At the <strong>absolute ceiling</strong> the rate of climb is zero: V<sub>X</sub> and V<sub>Y</sub> converge, and only one speed holds level flight. <span class="src">PHAK 11</span></p>
<p><strong>Time, fuel and distance to climb.</strong> From sea level to 6,000 ft at 2,550 lb on a standard day the 172S table gives 10 minutes, 2.2 gallons and 13 NM. Add 1.4 gallons for start, taxi and takeoff, and 10% to time, fuel and distance for each 10 °C above standard. <span class="src">POH 5</span></p>`,
      kdr: { k: "Define Vx, Vy, service ceiling and absolute ceiling, and read the climb charts.", d: "Use Vx to clear an obstacle and Vy to reach altitude quickly.", r: "A hot, heavy, high climb may be far weaker than you expect.", codes: ["PA.I.F.K1", "PA.I.F.K2c", "PA.I.F.R1"] } },
    { id: "cruise", at: "speeds", label: "Cruise, range, endurance · PHAK 11 · POH 5", title: "Farthest or longest",
      body: `<p><strong>Range</strong> is distance: maximum range is flown near <strong>L/D<sub>MAX</sub></strong>, the best ratio of speed to fuel flow. <strong>Endurance</strong> is time aloft: maximum endurance is flown at the speed for <strong>minimum power required</strong>, the lowest fuel flow, which is slower than best-range speed. <span class="src">PHAK 11</span></p>
<p>The 172S <strong>cruise performance table</strong> is entered with pressure altitude, RPM and temperature (20 °C below standard, standard, 20 °C above). It gives percent power, KTAS and fuel flow at 2,550 lb with the recommended lean mixture. Example: 6,000 ft, standard temperature, 2,400 RPM gives 57% power, 108 KTAS and 8.2 GPH. <span class="src">POH 5</span></p>
<ul><li>Maximum cruise power with the recommended lean mixture is <strong>75%</strong>; above that, use full rich.</li>
<li>Speeds assume wheel fairings; without them, subtract 2 knots.</li>
<li>The range and endurance profiles assume 53 gallons usable and a 45-minute reserve, and already include start, taxi, takeoff and climb.</li></ul>
<p>Leave margin: the POH data comes from flight tests with the airplane and engine in good condition, using average piloting technique. Your airplane on your day may do worse. <span class="src">POH 5</span></p>
<p><strong>Region of reversed command</strong>: below the minimum-drag speed, induced drag rises so fast that flying slower takes more power, not less. There, raising the nose alone makes you slower and sink faster; you need power. It matters most on a slow, low final approach. <span class="src">PHAK 5 · AFH</span></p>`,
      kdr: { k: "Explain range versus endurance and read the cruise table.", d: "Choose a power setting from the table and plan fuel with reserve.", r: "Planning fuel with no margin for wind, leaning or a diversion.", codes: ["PA.I.F.K1", "PA.I.D.K3c", "PA.I.D.R6"] } },
    { id: "stallchart", at: "cruise", label: "Stall speed chart · POH 5", title: "What changes the stall speed",
      body: `<p>Stall speed charts give stall speed for <strong>flap setting, bank angle</strong> and sometimes <strong>CG</strong> and power. In the 172S at 2,550 lb, power off, rear CG: <span class="src">POH 5</span></p>
<ul><li>Flaps up, wings level: <strong>48 KIAS</strong> (53 KCAS). At 60° bank: 68 KIAS.</li>
<li>Flaps 30°, wings level: <strong>40 KIAS</strong> (48 KCAS). At 60° bank: 57 KIAS.</li></ul>
<p>Notice the pattern: flaps lower the stall speed, bank raises it (load factor), and at low speed the indicated airspeed reads lower than calibrated. The forward-CG column is equal or slightly higher. Altitude loss in a stall recovery may be as much as <strong>230 ft</strong>, and the stall horn sounds <strong>5–10 knots</strong> above the stall. <span class="src">POH 4, 5</span></p>
<p>Weight matters too: the published speeds are at maximum weight, and a lighter airplane stalls at a lower indicated airspeed. <span class="src">PHAK 5</span></p>`,
      viz: { type: "loadfactor" },
      kdr: { k: "Read the stall speed chart and explain the effect of flaps, bank, CG and weight.", d: "Add margin in turns near the ground, especially base to final.", r: "A steep, slow turn to final can stall at a much higher speed than the 1G number.", codes: ["PA.I.F.K1", "PA.I.F.K3"] } },
    { id: "runway", at: "perf", label: "Runway and takeoff factors · PHAK 11", title: "What the chart assumes",
      body: `<p>Charts assume a <strong>paved, level, smooth and dry</strong> runway. Grass, gravel, mud, snow or standing water lengthen the takeoff roll. The Chart Supplement lists each runway's surface and slope. <span class="src">PHAK 11</span></p>
<ul><li><strong>Upslope</strong> lengthens the takeoff run but shortens the landing roll; <strong>downslope</strong> does the reverse. A 3% gradient means 3 ft of rise per 100 ft.</li>
<li><strong>Weight</strong>: a 10% increase raises takeoff speed about 5% and takeoff distance at least 21%.</li>
<li><strong>Extra speed</strong>: distance varies with the square of lift-off speed, so 10% too fast adds about 21%.</li>
<li><strong>Wind</strong>: a headwind 10% of takeoff speed cuts distance about 19%; a tailwind of 10% adds about 21%.</li>
<li><strong>Density altitude</strong>: same indicated airspeed, higher true airspeed and groundspeed, less thrust.</li>
<li><strong>Wet runway</strong>: dynamic hydroplaning can begin at about <strong>9 × √(tire pressure)</strong> knots; 36 psi gives 54 knots. Once started it can continue well below that speed.</li></ul>
<p><strong>Wind components</strong>: the POH notes use the headwind or tailwind component along the runway, not the reported wind. A wind component chart splits the wind: enter with the angle between the wind and the runway and the wind speed, then read the headwind and crosswind components. Example: 15 knots at 30° off the runway is about 13 knots of headwind and 7.5 knots of crosswind. Compare the crosswind with the 172S's demonstrated 15 knots, which is not a limitation. <span class="src">PHAK 11 · C172S POH Sec 4, 5</span></p>`,
      kdr: { k: "List the factors that change takeoff and landing distance.", d: "Correct the chart numbers for surface, slope, wind and weight, and add a margin.", r: "Hydroplaning or a soft surface with no room to stop.", codes: ["PA.I.F.K1", "PA.I.F.K2b", "PA.I.F.K2c", "PA.I.F.K2d"] } },
  ],
};
