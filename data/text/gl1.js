// GL1 lesson text (lazy-loaded when the lesson opens)
export default {
  sections: [
    { id: "parts", label: "Five major components · PHAK 3", title: "Five parts make an airplane",
      body: `<p>Airplanes are built for different jobs, but most share the same five major components: the <strong>[[fuselage]]</strong>, the <strong>wings</strong>, the <strong>[[empennage]]</strong>, the <strong>landing gear</strong>, and the <strong>[[powerplant]]</strong>. <span class="src">PHAK 3</span></p>
      <p><strong>Fuselage.</strong> The central body. It carries the crew, passengers and cargo and is the structural link between the wings and the tail.</p>
      <p><strong>Wings.</strong> The main lifting surfaces. On the trailing edge of each wing are two movable surfaces: the [[aileron|ailerons]], from about mid-span out toward the tip, and the [[flaps]], from the fuselage out to about mid-span. Ailerons move in opposite directions to roll the airplane; flaps move down together to increase lift for takeoff and landing. <span class="src">PHAK 3</span></p>
      <p><strong>Empennage.</strong> The whole tail group. The fixed parts are the <strong>vertical stabilizer</strong> and <strong>horizontal stabilizer</strong>. The movable parts are the [[rudder]], the [[elevator]] and one or more [[trim tab|trim tabs]]. The rudder moves the nose left and right; the elevator moves it up and down. <span class="src">PHAK 3</span></p>
      <p><strong>Landing gear.</strong> The principal support on the ground. A nosewheel design is <strong>tricycle gear</strong>; a tailwheel design is <strong>conventional gear</strong>. <span class="src">PHAK 3</span></p>
      <p><strong>Powerplant.</strong> The engine and the propeller. The engine turns the propeller and also drives the electrical system and, in many airplanes, a vacuum source for some instruments. A [[firewall]] separates the engine compartment from the cabin. <span class="src">PHAK 3</span></p>
      <div class="why"><span class="label">Why it matters</span><p>Every later lesson, every checklist line and every radio call assumes you can find these parts instantly. During preflight you will be checking each one for damage, and the examiner will ask you what each does.</p></div>
      <p>Tap any part of the airplane below, or pick one from the list.</p>`,
      viz: { type: "plane3d", opts: { mode: "explore" } },
      kdr: { k: "Name the five major components and the movable surfaces on each.", d: "Point to and name each part during a walkaround.", r: "A part you cannot name is a part you will not inspect properly.", codes: "PA.I.G.K1a, PA.II.A.K3a" } },
    { id: "build", label: "Construction · PHAK 3", title: "Truss, shell, or both",
      body: `<p>Older airplanes used an open <strong>[[truss structure]]</strong>: tubes of wood, steel or aluminum called <strong>[[longeron|longerons]]</strong>, welded or braced into a rigid framework. It is strong but hard to streamline, so fabric or skin is stretched over formers to give shape. <span class="src">PHAK 3</span></p>
      <p>Most modern airplanes use <strong>stressed skin</strong>, where the skin itself carries load. <strong>[[Monocoque]]</strong> (French for "single shell") relies on the skin almost entirely. It is strong, but it does not tolerate deformation of the surface. <strong>[[Semimonocoque]]</strong> adds a substructure of <strong>[[bulkhead|bulkheads]]</strong>, formers and <strong>[[stringer|stringers]]</strong> to reinforce the skin. That is what you will find on almost every training airplane. <span class="src">PHAK 3</span></p>
      <p>The wing's principal structural parts are <strong>[[spar|spars]]</strong>, <strong>ribs</strong> and <strong>stringers</strong>. The ribs give the wing its airfoil shape. Fuel tanks are usually built into the wing structure or are flexible bladders inside it. <span class="src">PHAK 3</span></p>
      <p>High-wing airplanes often use <strong>struts</strong> that carry flight and landing loads to the fuselage. Because the strut attaches about halfway out, this is called a <strong>semi-cantilever</strong> wing. A full <strong>cantilever</strong> wing carries its loads internally with no external bracing. <span class="src">PHAK 3</span></p>`,
      viz: { type: "structure" },
      kdr: { k: "Explain truss, monocoque and semimonocoque construction and the main parts of a wing.", d: "On the walkaround, look for wrinkled skin, popped or loose rivets and dents, because the skin carries load.", r: "Damage to a stressed skin is structural damage, not cosmetic. Report it before flight.", codes: "PA.II.A.K3c" } },
    { id: "c172", label: "The trainer · C172S", title: "Meet the Cessna 172S",
      body: `<p>This course uses the Cessna 172S Skyhawk SP as its example airplane because it is one of the most common trainers in the world. The figures below are the manufacturer's published values, stated for study. Always check the POH for your own airplane, since equipment and serial numbers differ.</p>
      <div class="tablewrap"><table><tr><th>Feature</th><th>Cessna 172S</th></tr>
      <tr><td>Layout</td><td>All-metal, four seats, high wing, single engine</td></tr>
      <tr><td>Wing</td><td>Strut-braced, 174 sq ft, maximum wing loading 14.7 lb/sq ft</td></tr>
      <tr><td>Engine</td><td>Lycoming IO-360-L2A: four cylinders, horizontally opposed, air-cooled, fuel-injected, 180 hp at 2,700 RPM</td></tr>
      <tr><td>Propeller</td><td>Two blades, fixed pitch, 76 in diameter</td></tr>
      <tr><td>Oil</td><td>Wet sump, 8 quarts capacity. Do not operate with less than 5; fill to 8 for extended flight</td></tr>
      <tr><td>Fuel</td><td>Two vented integral wing tanks, 56.0 gal total, 53.0 gal usable</td></tr>
      <tr><td>Approved fuel</td><td>100LL (blue) or 100 grade (green) aviation gasoline</td></tr>
      <tr><td>Flaps</td><td>Electric, single-slot, stops at 10°, 20° and 30°</td></tr>
      <tr><td>Landing gear</td><td>Fixed tricycle: steerable nose wheel (about 10° each side via the rudder pedals), spring-steel main gear, air/oil nose strut</td></tr>
      <tr><td>Brakes</td><td>Hydraulic disc brakes on the main wheels, toe-operated</td></tr>
      <tr><td>Electrical</td><td>28-volt DC, 60-amp alternator, 24-volt battery</td></tr>
      <tr><td>Size</td><td>Span 36 ft 1 in; length 27 ft 2 in; wheelbase 65 in</td></tr></table></div>
      <p class="src">C172S POH Sec 1, 2, 7 (Information Manual)</p>
      <div class="note">Many 172S airplanes have the Garmin G1000 glass flight deck instead of the conventional "six-pack" instruments. The airframe, engine and limitations above are the same family, but instrument and electrical details differ. Learn the version you fly.</div>`,
      viz: { type: "plane3d", opts: { mode: "tour" } },
      kdr: { k: "State the engine, fuel, oil and flap facts for your trainer.", d: "Find each item on the airplane: oil dipstick, fuel caps and drains, flap lever and indicator.", r: "Wrong fuel grade or low oil are preflight catches, not in-flight discoveries.", codes: "PA.I.G.K1c, PA.I.G.K1e" } },
    { id: "axes", label: "Axes of flight · PHAK 3", title: "Three axes through one point",
      body: `<p>An airplane moves in three dimensions, and every movement is a rotation about one or more of three axes. All three pass through the <strong>[[center of gravity]]</strong> (CG). <span class="src">PHAK 3</span></p>
      <ul><li><strong>[[Longitudinal axis]]</strong>, nose to tail. Movement about it is <strong>roll</strong>, controlled by the ailerons.</li>
      <li><strong>[[Lateral axis]]</strong>, wingtip to wingtip. Movement about it is <strong>pitch</strong>, controlled by the elevator.</li>
      <li><strong>[[Vertical axis]]</strong>, top to bottom. Movement about it is <strong>yaw</strong>, controlled by the rudder.</li></ul>
      <p>A useful way to remember it: the control surface that moves about an axis is the one farthest from it. The ailerons at the wingtips roll about the axis running down the middle of the fuselage.</p>`,
      viz: { type: "axes" },
      kdr: { k: "Name each axis, the motion about it and the control that produces it.", d: "Describe which way the airplane moves for each control input.", r: "Confusing roll and yaw leads to uncoordinated flight, the setup for a stall-spin.", codes: "PA.I.G.K1a" } },
    { id: "cert", label: "The system · PHAK 1 · 14 CFR 61", title: "How you earn the certificate",
      body: `<p>Flight training happens under one of two rule sets. A <strong>[[Part 141]]</strong> school is certificated by the FAA and teaches an approved training course outline, with stage checks at the end of each stage. A <strong>Part 61</strong> program follows the same knowledge and experience requirements but is not required to use an approved syllabus. The minimum flight time for a private pilot certificate is 35 hours in a Part 141 school and 40 hours under Part 61, though most pilots need considerably more. <span class="src">PHAK 1</span></p>
      <p>This course follows the Part 141 approach: ground lessons, flight lessons that build on them, and a stage check that proves you are ready to move on. Stage 1 takes you to your first solo.</p>
      <h4>The milestones</h4>
      <ul><li><strong>Student pilot certificate.</strong> You must be at least 16 and able to read, speak, write and understand English. <span class="src">14 CFR 61.83</span></li>
      <li><strong>Pre-solo knowledge test and solo endorsement.</strong> Before solo you pass a knowledge test given by your instructor on Parts 61 and 91, local airspace and procedures, and your airplane. Your instructor reviews every miss with you. The endorsement to solo a make and model must be dated within the preceding 90 days. <span class="src">14 CFR 61.87</span></li>
      <li><strong>Private pilot certificate.</strong> You must be at least 17, pass the knowledge test, meet the experience requirements and pass the practical test. <span class="src">14 CFR 61.103</span> For a single-engine airplane: at least 40 hours, including 20 hours of instruction and 10 hours of solo. <span class="src">14 CFR 61.109(a)</span></li></ul>
      <h4>The standard you are held to</h4>
      <p>The practical test is graded against the <strong>[[Airman Certification Standards]]</strong> (ACS), currently FAA-S-ACS-6C for private pilot airplane. Every task lists what you must <strong>know</strong> (knowledge), how you <strong>manage the risk</strong> (risk management), and what you must <strong>do</strong> (skills). This course tags each section with the matching ACS elements.</p>`,
      kdr: { k: "Eligibility for student and private certificates, and what the ACS is.", d: "Get your student pilot certificate early, through IACRA with your instructor.", r: "Currency is not proficiency. Meeting minimums does not make you ready.", codes: "PA.I.A.K1, PA.I.A.R1" } },
  ],
};
