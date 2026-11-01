// GL3 supplement text: the atmosphere, Newton's laws and airfoil terms, wingtip vortices, planform and handling qualities, climbs and descents (PHAK 4, 5).
export default {
  sections: [
    { id: "atmo", at: "^", label: "The atmosphere · PHAK 4", title: "The air you fly in",
      body: `<p>The atmosphere is <strong>78% nitrogen, 21% oxygen and 1% other gases</strong>. Air has mass and weight, so it presses on everything with a force we call pressure, and it acts equally in all directions. <span class="src">PHAK 4</span></p>
<p>At sea level in the <strong>standard atmosphere</strong> (ISA), the temperature is <strong>15 °C (59 °F)</strong> and the pressure is <strong>29.92 "Hg (1,013.2 mb)</strong>, about 14.7 psi. Temperature drops about <strong>2 °C (3.5 °F) per 1,000 ft</strong> up to about 36,000 ft. Pressure drops about <strong>1 "Hg per 1,000 ft</strong> in the lower atmosphere, and at 18,000 ft it's about half of sea-level pressure. <span class="src">PHAK 4</span></p>
<p>Instruments are calibrated to the standard atmosphere, and performance charts are based on it, so pilots use two corrected altitudes: <span class="src">PHAK 4</span></p>
<ul><li><strong>Pressure altitude</strong>: the altitude shown with 29.92 set in the altimeter. It's the starting point for performance charts and for flight levels at and above 18,000 ft.</li>
<li><strong>Density altitude</strong>: pressure altitude corrected for nonstandard temperature, the altitude the airplane "feels". Thinner air means less engine power, less propeller thrust and less lift. GL5 shows how to compute it.</li></ul>`,
      viz: { type: "lapse" },
      kdr: { k: "State the standard atmosphere values and define pressure and density altitude.", d: "Find pressure altitude by setting 29.92, and estimate whether the day is hotter than standard.", r: "Higher density altitude means weaker performance.", codes: ["PA.I.F.K2a", "PA.I.C.K3a"] } },
    { id: "newton", at: "lift", label: "Newton and the airfoil · PHAK 4", title: "Three laws, one wing",
      body: `<p><strong>Newton's first law:</strong> an object stays at rest or keeps moving in a straight line unless a force changes that. An airplane on the ramp stays put until thrust overcomes its inertia. <span class="src">PHAK 4</span></p>
<p><strong>Second law:</strong> force equals mass times acceleration. A heavier airplane accelerates more slowly for the same thrust, which is one reason takeoff distance grows with weight. <span class="src">PHAK 4</span></p>
<p><strong>Third law:</strong> for every action there's an equal and opposite reaction. The propeller pushes air back and the air pushes the airplane forward; the wing deflects air down and the air pushes the wing up. <span class="src">PHAK 4</span></p>
<p><strong>Airfoil terms.</strong> The rounded front is the <strong>leading edge</strong>; the thin back is the <strong>trailing edge</strong>. The <strong>chord line</strong> is a straight line joining them. <strong>Camber</strong> is the curvature of the upper and lower surfaces (the upper is usually more curved), and the <strong>mean camber line</strong> runs halfway between them. Lift comes from both higher pressure under the wing and lower pressure above it. <span class="src">PHAK 4</span></p>`,
      kdr: { k: "State Newton's three laws and name the parts of an airfoil.", d: "Connect each law to something you see in flight: inertia on the takeoff roll, acceleration with weight, thrust from the propeller.", r: "Thinking a symmetrical airfoil can't lift. Angle of attack makes lift.", codes: ["PA.I.F.K3"] } },
    { id: "vortex", at: "drag", label: "Wingtip vortices · PHAK 5", title: "The price of lift, spinning behind you",
      body: `<p>When a wing makes lift, the pressure below it is higher than the pressure above. Air spills around the tips from bottom to top and combines with the downwash into a fast-spinning <strong>vortex</strong> trailing from each tip. That energy is induced drag. <span class="src">PHAK 5</span></p>
<p>Vortex strength grows with the generating aircraft's <strong>weight</strong> and falls with its <strong>wingspan and speed</strong>. They're strongest when the aircraft is <strong>heavy, clean and slow</strong>, which means at takeoff, climb and landing. <span class="src">PHAK 5</span></p>
<p>To avoid wake turbulence: <span class="src">PHAK 5</span></p>
<ul><li>Avoid flying through another aircraft's flight path, and avoid following one on a similar path within 1,000 ft below it.</li>
<li>Taking off behind a larger aircraft, rotate <strong>before</strong> the point where it rotated.</li>
<li>Landing behind one, stay <strong>above</strong> its approach path and touch down <strong>beyond</strong> its touchdown point.</li>
<li>Stay at least <strong>three rotor diameters</strong> from a hovering helicopter.</li></ul>
<p>More in the Shear, Turbulence &amp; Wake unit.</p>`,
      viz: { type: "wake", opts: { mode: "dep" } },
      kdr: { k: "Explain how vortices form and when they're strongest.", d: "Plan takeoffs and landings behind larger aircraft to stay above and away from their wake.", r: "Wake turbulence can roll a light airplane beyond its control authority.", codes: ["PA.III.B.R3", "PA.I.F.K3"] } },
    { id: "climb", at: "load", label: "Climbs and descents · PHAK 5", title: "Weight joins the drag",
      body: `<p>In a steady climb, lift is about the same as in level flight at the same airspeed. What changes is that part of the <strong>weight acts backward along the flight path</strong>, adding to drag. If you pitch up without adding power, the airspeed decays until thrust again balances drag plus that slice of weight. <span class="src">PHAK 5</span></p>
<p>Thrust required in a stabilized climb equals drag plus a share of weight that depends on the climb angle. A <strong>10° climb needs thrust equal to drag plus about 17% of weight</strong>. Climb performance depends on <strong>excess thrust</strong>; when there's none left, the airplane has reached its <strong>absolute ceiling</strong>. <span class="src">PHAK 5</span></p>
<p>In a descent, the reverse happens: part of the weight acts <strong>forward</strong> along the flight path. To descend at your cruise airspeed, reduce power as you lower the nose; otherwise the airplane speeds up. <span class="src">PHAK 5</span></p>`,
      kdr: { k: "Explain the force balance in climbs and descents.", d: "Add power when you raise the nose to climb at a given airspeed; reduce it when you descend.", r: "Pitching up without power bleeds airspeed toward the stall.", codes: ["PA.I.F.K3"] } },
    { id: "plan", at: "stab", label: "Planform and handling · PHAK 5", title: "Wing shape, stall pattern, feel",
      body: `<p>The <strong>planform</strong> is the wing's shape seen from above. Three design choices matter: <span class="src">PHAK 5</span></p>
<ul><li><strong>Aspect ratio</strong>: span compared with chord. A higher aspect ratio lowers drag, especially at high angles of attack, which helps climb, but a longer wing is heavier. Most trainers use fairly high aspect ratios.</li>
<li><strong>Taper</strong>: chord or thickness shrinking from root to tip. It reduces drag and saves weight.</li>
<li><strong>Sweepback</strong>: the rearward slant of a wing or tail.</li></ul>
<p>A <strong>rectangular wing tends to stall at the root first</strong>, so it gives good stall warning, keeps the ailerons effective, and is usually quite stable. That's why it's favored for low-cost, low-speed airplanes. <span class="src">PHAK 5</span></p>
<p>Two more handling qualities: <strong>maneuverability</strong> is how easily an airplane can be maneuvered and how well it withstands the stresses (set by weight, inertia, control size and location, structural strength and power). <strong>Controllability</strong> is how the airplane responds to your control inputs, regardless of its stability. A very stable airplane is less maneuverable. <span class="src">PHAK 5</span></p>`,
      kdr: { k: "Define aspect ratio, taper and sweep, and explain why a root-first stall helps.", d: "Notice the stall warning buffet in a trainer and how ailerons still work early in the stall.", r: "Aggressive aileron use near the stall can still drop a wing.", codes: ["PA.I.F.K3"] } },
  ],
};
