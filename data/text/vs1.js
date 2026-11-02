// V-speeds: what each one means, why it exists, where it is on the dial, and the 172S number with its source.
// Numbers: C172S POH (NAV III, 172SPHBUS) Sec 2–5; the 1998 C172S Information Manual (Rev 5) lists the same values.
const NOTE = `<div class="note cfi">These are the Cessna 172S POH numbers (NAV III edition; the 1998 172S Information Manual lists the same speeds). Confirm with your CFI and N575Y's POH. Other 172 models and some POH revisions list different speeds.</div>`;
const V = (sub) => `V<sub>${sub}</sub>`;
// [symbol html, meaning, 172S value, where on the dial, source]
const ROWS = [
  [V("S0"), "Stall speed, landing configuration (flaps FULL, idle)", "40 KIAS at 2,550 lb", "White arc, bottom", "POH Fig 2-2; Sec 5 Stall Speeds"],
  [V("S1"), "Stall speed, flaps up", "48 KIAS at 2,550 lb, forward CG", "Green arc, bottom", "POH Fig 2-2; Sec 5 Stall Speeds"],
  [V("FE"), "Maximum flap extended speed", "110 KIAS with 10°; 85 KIAS with 10° to FULL", "White arc, top (85)", "POH Fig 2-1, 2-2"],
  [V("NO"), "Maximum structural cruising speed", "129 KIAS", "Green arc top, yellow arc start", "POH Fig 2-1, 2-2"],
  ["Yellow", "Caution range: smooth air only, with caution", "129–163 KIAS", "Yellow arc", "POH Fig 2-2"],
  [V("NE"), "Never-exceed speed", "163 KIAS", "Red line", "POH Fig 2-1, 2-2"],
  [V("A"), "Design maneuvering speed", "105 KIAS at 2,550 lb; 98 at 2,200; 90 at 1,900", "Not marked", "POH Fig 2-1; Sec 3"],
  [V("X"), "Best angle of climb (flaps up)", "62 KIAS at sea level; 67 at 10,000 ft", "Not marked", "POH Sec 4"],
  [V("Y"), "Best rate of climb (flaps up)", "74 KIAS at sea level; 72 at 10,000 ft", "Not marked", "POH Sec 4"],
  [V("R"), "Rotation speed (the POH prints no V<sub>R</sub>)", "Lift the nose wheel at 55 KIAS (normal takeoff)", "Not marked", "POH Sec 4 Normal Takeoff"],
  [V("G"), "Best glide (shorthand; not in 14 CFR 1.2)", "68 KIAS, flaps up", "Not marked", "POH Sec 3, Fig 3-1"],
  ["Approach", "Normal approach (no V<sub>REF</sub> published)", "60–70 KIAS flaps FULL; 65–75 flaps up; short field 61", "Not marked", "POH Sec 4"],
];
const TABLE = `<div class="vsref" data-noterms role="table" aria-label="172S V-speeds"><div class="r h" role="row"><span role="columnheader">Speed</span><span role="columnheader">Meaning</span><span role="columnheader">172S value</span><span role="columnheader">On the dial · source</span></div>
${ROWS.map(([sym, mean, val, where, src]) => `<div class="r" role="row"><span class="sym" role="rowheader">${sym}</span><span class="mean" role="cell">${mean}</span><span class="val" role="cell">${val}</span><span class="where" role="cell">${where}<span class="src">C172S ${src}</span></span></div>`).join("")}</div>`;
export default {
  sections: [
    { id: "dial", label: "V-speeds · 14 CFR 1.2", title: "Every V-speed, on one dial",
      body: `<p>A V-speed is an airspeed with a name: V for velocity, plus a subscript that says which speed. ${V("FE")} is the maximum flap extended speed; ${V("Y")} is the best rate of climb. 14 CFR 1.2 defines the symbols, and your airplane's POH gives the numbers. <span class="src">14 CFR 1.2 · C172S POH Sec 1</span></p>
<p>Some speeds are painted on the airspeed indicator as colored arcs and a red line. The rest are not on the dial; you carry them in your head. Tap a speed, or tap the dial, to see where it lives.</p>`,
      viz: { type: "vspeeds", after: "end", opts: {} },
      body2: `<p>The dial and almost every speed in the 172S POH are in <strong>KIAS</strong>, knots indicated airspeed: what the needle shows. The POH limitations table also lists KCAS, indicated airspeed corrected for instrument and position error. Near the stall the two differ most: the POH stall chart gives about 40 KIAS with full flaps, which is 48 KCAS. Fly the KIAS numbers. <span class="src">C172S POH Sec 1, Fig 2-1, Sec 5 Stall Speeds</span></p>
<p>On a G1000 airplane the same colors appear as bands on the airspeed tape, plus a red band from 20 to 40 KIAS as a low-airspeed warning. <span class="src">C172S POH (NAV III) Fig 2-2</span></p>${NOTE}`,
      kdr: { k: "A V-speed is a named airspeed. The arcs and red line mark the limits; the performance speeds are in the POH.", d: "Point to each end of each arc and say its V-speed and number.", r: "Reading KCAS from the POH table as if it were the needle.", codes: ["PA.I.F.K1", "PA.I.G.K1h"] } },
    { id: "marked", label: "Markings · POH Fig 2-2", title: "The speeds painted on the dial",
      body: `<p>Each arc end is a V-speed. Read the dial from slow to fast:</p>
<ul><li><strong>${V("S0")}, 40 KIAS</strong>, bottom of the white arc: the stall speed with full flaps and idle power, the landing configuration.</li>
<li><strong>${V("S1")}, 48 KIAS</strong>, bottom of the green arc: the stall speed with flaps up.</li>
<li><strong>${V("FE")}, 85 KIAS</strong>, top of the white arc: the fastest you may fly with flaps beyond 10°. With 10° the limit is 110 KIAS, which is not painted.</li>
<li><strong>${V("NO")}, 129 KIAS</strong>, top of the green arc: the maximum structural cruising speed. The yellow arc, 129 to 163, is for smooth air only, and then with caution.</li>
<li><strong>${V("NE")}, 163 KIAS</strong>, the red line: never exceed, in any operation.</li></ul>
<p class="src">C172S POH Fig 2-1, 2-2 · PHAK Ch 8</p>`,
      viz: { type: "vspeeds", opts: { focus: "vfe" } },
      body2: `<p><strong>Why the limits exist.</strong> The stall speeds are marked at maximum weight, 2,550 lb; lighter, the airplane stalls a little slower, and in a bank it stalls faster, because a wing stalls at its critical angle of attack, not at a speed. Flaps are built for slow-flight air loads, so above ${V("FE")} the load on them can damage them. Up to ${V("NO")} the structure is designed for strong gusts; above it, turbulence can overstress it. Above ${V("NE")}, structural damage or failure is possible. <span class="src">PHAK Ch 5, 8 · C172S POH Fig 2-2</span></p>${NOTE}`,
      kdr: { k: "White, green, yellow arcs and the red line, and the V-speed at each end.", d: "From memory: 40, 48, 85, 129, 163, and 110 for flaps 10°.", r: "Extending flaps above V<sub>FE</sub>; flying in the yellow arc in turbulence.", codes: ["PA.I.F.K1", "PA.I.F.R2", "PA.I.G.K1h"] } },
    { id: "unmarked", label: "In your head · POH Sec 3, 4", title: "The speeds that are not on the dial",
      body: `<p>These are not painted anywhere. Learn them from the POH:</p>
<ul><li><strong>Rotation, 55 KIAS.</strong> ${V("R")} is where you raise the nose to lift off. The 172S POH does not print a ${V("R")}; its normal takeoff checklist says lift the nose wheel at 55 KIAS.</li>
<li><strong>${V("X")}, 62 KIAS</strong>: best angle of climb, the most altitude in the shortest distance. Use it to clear an obstacle.</li>
<li><strong>${V("Y")}, 74 KIAS</strong>: best rate of climb, the most altitude in the least time.</li>
<li><strong>Best glide, 68 KIAS</strong>: engine out, flaps up, the speed that carries you farthest. Often written ${V("G")}, though 14 CFR 1.2 does not list that symbol.</li>
<li><strong>${V("A")}, 105 KIAS at 2,550 lb</strong>: maneuvering speed. The next section explains why it changes with weight.</li></ul>
<p class="src">C172S POH Sec 3, Sec 4 · 14 CFR 1.2 · AFH Ch 3, 6</p>`,
      viz: { type: "vspeeds", opts: { focus: "vy" } },
      body2: `<p><strong>Altitude moves the climb speeds.</strong> ${V("X")} rises from 62 KIAS at sea level to 67 at 10,000 ft, and ${V("Y")} falls from 74 to 72. The POH's normal climb is a little faster than ${V("Y")}: 75–85 KIAS at sea level. These speeds are for 2,550 lb, and the POH says they may be used at any lesser weight. <span class="src">C172S POH Sec 4 Airspeeds for Normal Operation</span></p>
<p><strong>Related emergency speeds:</strong> after an engine failure on takeoff, 70 KIAS flaps up and 65 KIAS with flaps 10° to FULL. <span class="src">C172S POH Sec 3</span></p>${NOTE}`,
      kdr: { k: "V<sub>X</sub>, V<sub>Y</sub>, best glide, rotation and V<sub>A</sub> are not marked.", d: "Say each speed and when you would use it.", r: "Using V<sub>X</sub> when V<sub>Y</sub> is wanted, or flying faster than best glide when the engine quits.", codes: ["PA.I.F.K1", "PA.IV.A.S9", "PA.IV.C.S10", "PA.IX.B.S1"] } },
    { id: "va", label: "Maneuvering speed · PHAK Ch 5", title: "Why maneuvering speed drops when you are lighter",
      body: `<p>At or below ${V("A")}, a full, abrupt control input stalls the wing before the load can exceed the airplane's limit load. The stall caps the load. <span class="src">14 CFR 1.2 · PHAK Ch 5</span></p>
<p>A lighter airplane stalls at a lower speed. So it reaches its limit load at a lower speed too, and ${V("A")} goes down with weight: 105 KIAS at 2,550 lb, 98 at 2,200 lb, 90 at 1,900 lb. The POH uses the same three numbers as its turbulent-air penetration speeds. <span class="src">C172S POH Fig 2-1; Sec 3, 4 · PHAK Ch 8</span></p>`,
      viz: { type: "vspeeds", opts: { focus: "va" } },
      body2: `<p><strong>What it does not protect you from.</strong> Below ${V("A")} you can still overstress the airplane with full inputs in more than one axis at once, or with repeated full inputs. ${V("A")} is not marked on the dial, which is one reason it is a favorite oral question. <span class="src">PHAK Ch 5</span></p>${NOTE}`,
      kdr: { k: "V<sub>A</sub> is the speed below which the wing stalls before the limit load is reached; it decreases with weight.", d: "Pick V<sub>A</sub> for today's weight; slow to it in turbulence.", r: "Assuming V<sub>A</sub> protects against combined or repeated full inputs.", codes: ["PA.I.F.K1", "PA.V.A.K2c"] } },
    { id: "approach", label: "Approach · AFH Ch 9", title: "Approach speeds, and what comes later",
      body: `<p>The 172S POH does not publish a ${V("REF")}, the reference landing speed in 14 CFR 1.2. It gives approach speeds instead: 60–70 KIAS with full flaps, 65–75 KIAS flaps up, and 61 KIAS for a short-field approach with full flaps. Use the POH speed. Only when the manufacturer gives none does the AFH say use not more than 1.3 ${V("S0")}, and the ACS holds you to the published speed, +10/−5 knots. <span class="src">C172S POH Sec 4 · AFH Ch 9 · ACS PA.IV.B.S7</span></p>
<p>In gusty air the AFH adds no more than half the gust factor. The POH's balked landing (go-around) speed is 60 KIAS with flaps 20°. <span class="src">AFH Ch 9 · C172S POH Sec 4</span></p>`,
      body2: `<p><strong>Later: multiengine and retractable gear.</strong> You will not use these in the 172S, but you will see the symbols:</p>
<ul><li>${V("YSE")}: best rate of climb with one engine inoperative. The blue line on a twin's airspeed indicator.</li>
<li>${V("MC")}: minimum control speed with the critical engine inoperative. The red radial line on a twin's indicator. (VMC also means visual meteorological conditions.)</li>
<li>${V("LE")} and ${V("LO")}: maximum speeds with the landing gear extended, and for raising or lowering it.</li></ul>
<p class="src">14 CFR 1.2 · PHAK Ch 8 · AFH Ch 13</p>${NOTE}`,
      kdr: { k: "Approach speeds come from the POH; not more than 1.3 V<sub>S0</sub> is the fallback.", d: "Fly 60–70 KIAS with full flaps; 61 for a short-field approach.", r: "An unstable, fast approach; ignoring gusts.", codes: ["PA.IV.B.S7", "PA.IV.D.S7"] } },
    { id: "table", label: "Reference · C172S POH", title: "All of them on one page",
      body: `<p>Every 172S V-speed in KIAS, with where it lives and where it comes from. Weight, altitude and flap setting change some of them, as noted.</p>${TABLE}`,
      body2: `${NOTE}`,
      kdr: { k: "The full V-speed list for the 172S.", d: "Cover the value column and recite.", r: "Using numbers from a different 172 model or POH.", codes: ["PA.I.F.K1"] } },
  ],
};
