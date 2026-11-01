// GL15 lesson text · Night Operations. Sources: AFH (FAA-H-8083-3C) Ch 11; PHAK Ch 17 (vision); AIM 2-1, 4-3-24;
// 14 CFR 1.1, 61.57(b), 61.87(o), 61.109(a)(2), 91.205(c), 91.209; C172S POH Sec 3, 4, 7 (facts only).
const CFI = `<p class="note"><strong>In the airplane:</strong> confirm the details with your CFI and your aircraft's POH.</p>`;
export default {
  sections: [
    { id: "def", label: "What counts as night · 14 CFR 1.1, 61.57, 91.209", title: "Three clocks for one sunset",
      body: `<p>The rules use three different definitions of "night", so learn which rule uses which: <span class="src">AFH 11 · 14 CFR 1.1, 61.57(b), 91.209</span></p>
<ul><li><strong>Lights on</strong> (91.209): position lights from <strong>sunset to sunrise</strong>.</li>
<li><strong>Night</strong> (1.1), which is used for night equipment (91.205(c)) and logging night time: from the <strong>end of evening civil twilight</strong> to the <strong>beginning of morning civil twilight</strong>. Civil twilight ends when the center of the sun is 6° below the horizon.</li>
<li><strong>Passenger currency</strong> (61.57(b)): from <strong>1 hour after sunset to 1 hour before sunrise</strong>. To carry passengers in that window you need 3 takeoffs and 3 landings <em>to a full stop</em> in that window within the preceding 90 days, as sole manipulator of the controls, in the same category, class and type (if a type rating is required).</li></ul>`,
      viz: { type: "nightclock" },
      body2: `<p><strong>Training</strong>: for the private certificate, 61.109(a)(2) requires 3 hours of night flight training, including one cross-country flight of over 100 NM total distance and 10 takeoffs and 10 landings to a full stop, each with a flight in the traffic pattern. (61.110 has an Alaska-resident exception.) <span class="src">14 CFR 61.109(a)(2), 61.110</span></p>
<p><strong>Student solo at night</strong> (61.87(o)) requires night training at the solo airport (takeoffs, approaches, landings and go-arounds), night navigation training nearby, and a logbook endorsement for that make and model, given within the preceding 90 days by the instructor who gave the training. <span class="src">14 CFR 61.87(o)</span></p>
<p class="note">Currency is the legal minimum, not proficiency. Examiners like to ask you to separate the two (ACS "night currency versus proficiency").</p>`,
      kdr: { k: "The three definitions of night; 61.57(b) currency; night training requirements.", d: "Say which definition a given rule uses and whether you are current to carry passengers.", r: "Confusing currency with proficiency.", codes: ["PA.I.A.K1", "PA.XI.A.R5"] } },
    { id: "vision", label: "Night vision · AFH 11 · PHAK 17", title: "Look beside it, not at it",
      body: `<p>The retina has two kinds of receptors: <span class="src">AFH 11 · PHAK 17</span></p>
<ul><li><strong>Cones</strong> are packed in the center (the fovea is all cones). They give color, detail and day vision.</li>
<li><strong>Rods</strong> are mostly in the periphery. They are far more sensitive to dim light, but they give no color and little detail.</li></ul>
<p>That gives three kinds of vision. <strong>Photopic</strong> (day) uses cones. <strong>Mesopic</strong> (dawn, dusk, full moon) uses both, and the PHAK calls it the most dangerous period for viewing. <strong>Scotopic</strong> (night) uses rods only. <span class="src">PHAK 17 · AFH 11</span></p>
<p>Because the fovea has no rods, there's a <strong>night blind spot</strong> covering the central 5–10° of your view. An object you look straight at can fade away. <span class="src">AFH 11 · PHAK 17</span></p>`,
      viz: { type: "nightvision" },
      body2: `<p><strong>Technique</strong>: <span class="src">PHAK 17</span></p>
<ul><li><strong>Off-center viewing</strong>: look about 10° above, below or beside an object.</li>
<li>Don't hold any one stop for more than 2–3 seconds. The image fades as the rods saturate.</li>
<li>Scan in sectors about 30° wide, and overlap each stop by 10°.</li></ul>
<p><strong>Dark adaptation</strong>: <span class="src">PHAK 17 · AFH 11</span></p>
<ul><li>The rods need about <strong>30 minutes</strong> to adapt fully.</li>
<li>Anticollision flashes are short (under 1 second) and don't impair adaptation. Exposure to a bright light for 1 second or more does. If it's safe, close one eye to protect it.</li>
<li>Keep cockpit lighting as low as practical. Red light keeps your adaptation, but it distorts chart colors (magenta and yellow both look red), so use dim white light to read charts.</li>
<li>Neutral-density (N-15) sunglasses during a bright day before a night flight speed adaptation later.</li></ul>
<p><strong>Oxygen</strong>: the PHAK says night vision declines measurably above about <strong>4,000 ft</strong> pressure altitude without supplemental oxygen, and the AFH notes hypoxia risk above 5,000 ft at night. Smoking lowers night vision too. <span class="src">PHAK 17 · AFH 11</span></p>`,
      kdr: { k: "Rods and cones; night blind spot; off-center viewing; dark adaptation; oxygen and night vision.", d: "Scan in 10° steps, avoid bright light, and keep cockpit lighting dim.", r: "Staring at a light until it fades; losing adaptation to a bright light.", codes: ["PA.XI.A.K1", "PA.XI.A.K5", "PA.XI.A.R3"] } },
    { id: "illus", label: "Night illusions · AFH 11 · PHAK 17", title: "When the lights lie",
      body: `<p><strong>False horizon</strong>: ground lights and stars blend together, or a sloping cloud bank or patterns of ground lights suggest a horizon that isn't level. <strong>Autokinesis</strong>: a stationary light you stare at for many seconds appears to move. Both affect vision only, and both can lead to loss of control. Keep scanning, and trust the attitude indicator. <span class="src">AFH 11 · PHAK 17</span></p>
<p><strong>Approach illusions</strong> push you high or low:</p>`,
      viz: { type: "approachillusion" },
      body2: `<ul><li><strong>Black hole / featureless terrain</strong> (over water or dark land, only runway lights visible) makes you think you're higher than you are, so you fly <strong>low</strong>. In the worst case you land short.</li>
<li><strong>Bright runway and approach lights</strong> with little else lit make the runway look closer, so you fly <strong>high</strong>.</li>
<li><strong>Narrow or upsloping runway</strong> also makes you feel high, so you fly <strong>low</strong>. A wide or downsloping runway does the opposite.</li>
<li><strong>Roads and trains</strong>: a line of lights can be mistaken for a runway.</li></ul>
<p><strong>Defenses</strong>: study the airport diagram and Chart Supplement, fly the VASI or PAPI, cross-check the altimeter, and go around whenever your position or altitude relative to the runway is in doubt. <span class="src">AFH 11 · PHAK 17</span></p>`,
      kdr: { k: "False horizon, autokinesis, black hole and other approach illusions.", d: "Name the illusion and the error it causes; use a VASI or PAPI and the altimeter.", r: "Landing short on a black-hole approach.", codes: ["PA.XI.A.K8", "PA.XI.A.R3", "PA.I.H.K1k"] } },
    { id: "equip", label: "Pilot and airplane equipment · AFH 11 · 14 CFR 91.205(c), 91.209", title: "What you carry, what the airplane needs",
      body: `<p><strong>You</strong>: at least one reliable flashlight (white for preflight; red or dim white in the cockpit) with spare batteries; charts for the route and the <em>adjacent</em> charts, because towns show up far away at night; an organized cockpit with everything within reach before you taxi. Set any EFB's brightness low. <span class="src">AFH 11</span></p>
<p><strong>The airplane</strong>: day VFR equipment (91.205(b)) <em>plus</em> 91.205(c), which you can remember as <strong>FLAPS</strong>:</p>`,
      viz: { type: "mnemo", opts: { set: "flaps" } },
      body2: `<p><strong>Lights</strong>: <span class="src">14 CFR 91.209 · AIM 4-3-24 · C172S POH 7</span></p>
<ul><li>Position lights are required from sunset to sunrise.</li>
<li>An anticollision system, if installed, must be on, but the PIC may turn it off when it would be a hazard to safety (for example, strobes flashing back from cloud).</li>
<li>The C172S POH warns that strobes and beacon reflected from clouds, especially at night, can produce vertigo. It also recommends using only the <em>taxi</em> light for visibility in the pattern or en route, to extend the landing light's life.</li></ul>${CFI}`,
      kdr: { k: "Personal equipment; 91.205(c) night equipment; 91.209 lights.", d: "Brief the flashlight, charts and the airplane's night equipment.", r: "Discovering an inoperative position light after dark.", codes: ["PA.XI.A.K3", "PA.XI.A.K4", "PA.I.B.K3", "PA.XI.A.R7"] } },
    { id: "poslights", label: "Reading position lights · AFH 11", title: "Red, green and white tell you which way it's going",
      body: `<p>Position lights are arranged like a ship's: <strong>red on the left wingtip, green on the right, white on the tail</strong>. From another airplane's lights you can tell its general direction: <span class="src">AFH 11</span></p>
<ul><li><strong>Red on your left and green on your right</strong>: it's going the same way as you.</li>
<li><strong>Red on your right and green on your left</strong>: it's coming toward you, so it could be on a collision course.</li>
<li><strong>Only red</strong>: it's crossing from right to left in front of you. <strong>Only green</strong>: it's crossing left to right.</li>
<li><strong>Only white</strong>: you see its tail, so it's moving away.</li></ul>`,
      viz: { type: "poslights" },
      body2: `<p>Then apply right-of-way (91.113). If you're converging and you see only its <strong>red</strong> light, it's crossing from your right, so <em>it</em> has the right-of-way and you give way. If you see only its <strong>green</strong> light, it's on your left and you have the right-of-way, but keep watching. Never assume the other pilot sees you. Aircraft lights blend with stars and city lights unless you work at the scan. <span class="src">AFH 11 · 14 CFR 91.113</span></p>`,
      kdr: { k: "Interpreting another aircraft's position lights.", d: "Say which way the other airplane is going and who must give way.", r: "Collision hazard from a misread light picture.", codes: ["PA.XI.A.K7", "PA.XI.A.R1"] } },
    { id: "apt", label: "Airport lighting · AIM 2-1 · AFH 11", title: "Find it, then read it",
      body: `<p><strong>Rotating beacons</strong> (24–30 flashes per minute for airports): <span class="src">AIM 2-1-9</span></p>
<ul><li>White and green: lighted land airport.</li>
<li>White and yellow: water airport.</li>
<li>Two quick white flashes, then green: military airport.</li>
<li>Green, yellow and white: heliport.</li></ul>
<p>In Class B, C, D or E surface areas, a beacon on during the day <em>often</em> means the weather is below 3 SM visibility or a 1,000 ft ceiling. Don't rely on it alone. <span class="src">AIM 2-1-9</span></p>`,
      viz: { type: "lights", opts: { mode: "beacon" } },
      body2: `<ul><li><strong>Runway edge lights</strong>: white. On instrument runways, yellow replaces white on the last 2,000 ft or half the runway length, whichever is less: a caution zone.</li>
<li><strong>Runway ends</strong>: green toward arriving aircraft (threshold) and red toward departing aircraft (end).</li>
<li><strong>Taxiway edges</strong>: blue.</li>
<li><strong>Obstructions</strong>: steady or flashing red; high-intensity flashing white on tall structures and some power-line supports.</li></ul>
<p><strong>Pilot-controlled lighting</strong>: key the mic <strong>7 times within 5 seconds</strong> for the highest intensity, then 5 or 3 times to step down where available. The lights stay on 15 minutes from the last activation, so key again just before entering final. Check the Chart Supplement and NOTAMs for each destination's lighting. <span class="src">AIM 2-1 · AFH 11</span></p>`,
      kdr: { k: "Beacons, runway, taxiway and obstruction lights; pilot-controlled lighting.", d: "Identify an airport by its beacon and turn on its lights.", r: "Mistaking a highway for a runway; lights timing out on short final.", codes: ["PA.XI.A.K2"] } },
    { id: "prep", label: "Preparation and preflight · AFH 11", title: "Plan for what you can't see",
      body: `<p><strong>Weather</strong>: watch the <strong>temperature/dew point spread</strong>. A small spread that is narrowing as the air cools after sunset means fog or low cloud may form. You can't see clouds well at night, and you can't feel the wind as easily as by day, so look hard at winds too. <span class="src">AFH 11 · PHAK 12</span></p>
<p><strong>Charts</strong>: draw course lines in <strong>black</strong> so they show under dim light. Good night checkpoints are airport beacons, lighted obstructions, towns and highway traffic. If you use GPS, load and check the waypoints and database before takeoff. <span class="src">AFH 11</span></p>
<p><strong>Preflight</strong>: use a white flashlight for the walk-around. Switch every exterior light on briefly, and tap the position-light fixtures: a flicker means a loose connection, so fix it before flight. Sweep the ramp with the flashlight for chocks, ladders and holes. <span class="src">AFH 11</span></p>
<p><strong>Training</strong>: practice basic maneuvers at night, including some with the cockpit lights <em>off</em> (blackout practice) to rehearse an electrical or panel-light failure. Practice unusual-attitude recovery only with an instructor. <span class="src">AFH 11</span></p>`,
      kdr: { k: "Weather factors at night; chart preparation; night preflight.", d: "Plan checkpoints that show up at night; check every light.", r: "Fog forming after dark on a small temperature/dew point spread.", codes: ["PA.XI.A.R6", "PA.XI.A.K5"] } },
    { id: "ground", label: "Start, taxi and run-up · AFH 11 · AIM 4-3-24", title: "Slow, lit and sure of where you are",
      body: `<p><strong>Start</strong>: organize the cockpit first. Clear the propeller area with special care: turn the beacon on or flash the position lights, but also look methodically. Leave unnecessary electrical equipment off until the engine is running. <span class="src">AFH 11</span></p>
<p><strong>Taxi</strong>: <span class="src">AFH 11 · AIM 4-3-24</span></p>
<ul><li>Turn on the navigation and anticollision lights before you move. Use the taxi light while moving, and consider turning it off when stopped, so you don't blind others.</li>
<li>Taxi slowly and follow the painted lines.</li>
<li>Do the instrument checks while you taxi.</li>
<li>Confirm the airplane's position, taxi route and runway match what you expect from the diagram, signs and markings. If anything conflicts, stop. Wrong-surface takeoffs and incursions are easier at night.</li></ul>
<p><strong>Run-up</strong>: at night you may not notice the airplane creeping forward. Hold the brakes firmly and watch for movement. <span class="src">AFH 11</span></p>${CFI}`,
      kdr: { k: "Night start, taxi and run-up; runway incursion avoidance.", d: "Clear the prop, taxi slowly with lights, and verify the runway.", r: "Runway incursion or wrong-surface takeoff in the dark.", codes: ["PA.XI.A.K6", "PA.XI.A.R4", "PA.XI.A.R2"] } },
    { id: "climb", label: "Takeoff, climb and navigation · AFH 11", title: "Instruments earn their keep",
      body: `<p><strong>Takeoff</strong>: <span class="src">AFH 11</span></p>
<ul><li>Dim the panel lights to the lowest usable level; this also cuts windshield reflections.</li>
<li>Line up on the centerline and check the heading indicator against the runway.</li>
<li>Keep the airplane between and parallel to the edge lights, and check the instruments often.</li></ul>
<p>With nothing visible ahead, inexperienced pilots tend to relax <strong>right rudder</strong> and drift left after liftoff. After liftoff, confirm a positive climb on the attitude indicator, VSI and altimeter at the climb airspeed. Don't turn until you reach a safe maneuvering altitude. Turn the landing light off once the climb is well established (it reflects off haze), unless you're using it to be seen. <span class="src">AFH 11</span></p>
<p><strong>En route</strong>: <span class="src">AFH 11</span></p>
<ul><li>The first sign of reduced visibility is usually that ground lights gradually <strong>disappear</strong>.</li>
<li>A <strong>halo or glow</strong> around ground lights indicates ground fog.</li>
<li>Looking forward through haze, you see much less than looking straight down.</li>
<li>Over water, stars reflected on the surface can hide the horizon.</li></ul>
<p>Avoid VFR night flight if conditions below VFR minimums are expected. <span class="src">AFH 11</span></p>`,
      kdr: { k: "Night takeoff and climb; orientation and navigation; inadvertent IMC cues.", d: "Fly the climb on instruments and recognize vanishing ground lights.", r: "Flying into cloud you can't see; drifting left after liftoff.", codes: ["PA.XI.A.K5", "PA.XI.A.R2", "PA.XI.A.R6"] } },
    { id: "land", label: "Approach and landing · AFH 11", title: "Normal approach, more instrument cross-checks",
      body: `<p><strong>Finding the airport</strong>: <span class="src">AFH 11</span></p>
<ul><li>Fly toward the beacon until you can pick out the runway lights.</li>
<li>Positively identify the threshold and edge lights before you set up the pattern, then keep them in sight.</li>
<li>Set the heading bug to the runway heading as a pattern reference.</li></ul>
<p>Distance, height and speed are hard to judge at night, so lean on the <strong>altimeter and airspeed indicator</strong>. A low, shallow approach is definitely inappropriate. Use the VASI or PAPI when available, and cross-check the altimeter and VSI against your position on base and final.</p>`,
      viz: { type: "lights", opts: { mode: "papi" } },
      body2: `<p>Fly the same speeds and flap settings as by day. Turn the landing light on about halfway down final. <span class="src">AFH 11</span></p>
<p><strong>Round out</strong>: <span class="src">AFH 11</span></p>
<ul><li>With the landing light: begin when its beam reflects on the runway and you can clearly see the tire marks. Inexperienced pilots tend to round out too high.</li>
<li><strong>Without the landing light</strong>: begin when the far-end runway lights appear to rise above the nose. Then feel for the runway with small pitch and power changes.</li></ul>
<p>Blackout (no-light) landings belong in night training as an emergency procedure. When in doubt, go around.</p>${CFI}`,
      kdr: { k: "Night traffic pattern, approach and landing; landing with and without a landing light.", d: "Identify the runway, fly a stabilized approach on the VASI or PAPI, and round out at the right height.", r: "Low, shallow approach; rounding out too high.", codes: ["PA.XI.A.K5", "PA.XI.A.R3", "PA.XI.A.K8"] } },
    { id: "emerg", label: "Night emergencies · AFH 11 · C172S POH 3", title: "Engine or electrical failure in the dark",
      body: `<p><strong>Engine failure at night</strong> (AFH): <span class="src">AFH 11</span></p>
<ul><li>Fly the airplane at best glide, and turn toward an airport or away from congested areas.</li>
<li>Look for the cause (fuel selector, magnetos, primer) and restart if you can.</li>
<li>Declare the emergency. If you're already talking to a facility, stay on that frequency unless told to change.</li>
<li>If you know the terrain is suitable, aim for an <strong>unlighted</strong> part of it. If you can, choose a spot close to public access so rescuers can reach you.</li>
<li>Land into the wind.</li>
<li>Run the before-landing checklist. Check the landing light at altitude, and turn it on in time to light up the terrain.</li>
<li>Touch down at the slowest possible airspeed in a normal landing attitude. If you have no light and no outside reference, hold a level-landing attitude until you touch down.</li>
<li>After landing, turn off all switches and get out quickly.</li></ul>`,
      viz: { type: "emergflow", opts: { set: "night" } },
      body2: `<p><strong>Electrical problems</strong>: the C172S POH says to conserve battery power for the flaps and, at night, for the landing lights during landing. Keep the flashlight within easy reach. A spatial disorientation episode at night is an emergency: trust the attitude indicator. <span class="src">C172S POH 3 · PHAK 17</span></p>
<p>The AFH notes that continued flight into adverse weather and poor judgment cause more serious accidents than engine failures. The best night emergency plan is a conservative go/no-go decision. <span class="src">AFH 11</span></p>${CFI}`,
      kdr: { k: "Night engine failure and electrical failure procedures.", d: "Brief a night engine-out plan and how you'd conserve battery power.", r: "Landing in the dark with no plan; draining the battery.", codes: ["PA.IX.B.K1", "PA.IX.C.K1", "PA.XI.A.R2"] } },
  ],
};
