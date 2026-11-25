// Scenario cards, set 3 (same format as data/scenarios.js): flight lessons and modules.
export const SCEN3 = {
  fl1: [
    { id: "mag", t: "A big drop on the mag check", acs: ["PA.II.B.R2", "PA.II.A.R2"], src: "AFH 2 · PHAK 7 · your airplane's POH",
      set: "During the run-up, the RPM drops 250 on the left magneto. Your POH allows much less.",
      steps: [
        { q: "What do you do?", o: [
          ["Try the POH's procedure for clearing a fouled plug, if it has one, then recheck.", "best", "A rough drop is often a lead-fouled plug, which can sometimes be burned off. The POH decides how."],
          ["Go; the right mag is fine.", "poor", "Out of limits is out of limits. Both magnetos must work for redundancy."],
          ["Switch to BOTH and go.", "poor", "BOTH hides the bad mag; it doesn't fix it."]] },
        { q: "After trying, the drop is still out of limits.", o: [
          ["Taxi back and have maintenance look at it.", "best", "A failed run-up check is a no-go. That's what the run-up is for."],
          ["Try it again at full power.", "poor", "Repeated tries at high power don't make it airworthy."],
          ["Do a short flight around the pattern to see.", "poor", "Testing a known defect in flight is a test pilot's job."]] }],
      deb: "Run-up out of limits = taxi back." },
    { id: "taxiw", t: "Windy taxi", acs: ["PA.II.D.R1", "PA.II.A.R3"], src: "AFH 2 · PHAK 14",
      set: "Taxiing a high-wing trainer on a windy day. The wind is a strong quartering tailwind from your left rear.",
      steps: [
        { q: "How do you hold the controls?", o: [
          ["Elevator forward and the yoke turned right, away from the wind: \"dive away\" from a tailwind.", "best", "That puts the left aileron down so the wind can't get under the left wing, and the elevator down so it can't flip the tail up."],
          ["Yoke full back and turned left.", "poor", "That's for a quartering headwind from the left. With a tailwind it lets the wind lift the tail and wing."],
          ["Controls neutral; the wind isn't that strong.", "poor", "A strong quartering tailwind is the most dangerous taxi wind for a high-wing airplane."]] },
        { q: "You turn, and now the wind is a quartering headwind from the right.", o: [
          ["Yoke turned right, into the wind, with the elevator neutral.", "best", "\"Climb into\" a headwind: the upwind aileron goes up to hold that wing down. Neutral elevator keeps the nosewheel loaded."],
          ["Yoke turned left, away from the wind.", "poor", "That raises the right wing's lift. Turn into a headwind."],
          ["Yoke forward and turned right.", "ok", "The aileron is right; for a tricycle gear airplane, neutral elevator is the usual advice for a quartering headwind."]] }],
      deb: "Climb into a headwind, dive away from a tailwind." },
  ],
  fl3: [
    { id: "horn", t: "Stall horn on climbout", acs: ["PA.VII.A.R1", "PA.VII.C.R3"], src: "AFH 5 · PHAK 5",
      set: "Climbing out after takeoff while answering a passenger's question, you hear the stall horn and feel a buffet.",
      steps: [
        { q: "What do you do?", o: [
          ["Lower the nose to reduce the angle of attack, keep full power, and level the wings.", "best", "Angle of attack causes stalls. Reducing it is always the first step."],
          ["Pull back to climb away from the ground.", "poor", "More back pressure deepens the stall."],
          ["Add right rudder and keep the pitch.", "poor", "Coordination matters, but the pitch must come down."]] },
        { q: "How do you avoid it next time?", o: [
          ["Set and trim the climb attitude, check airspeed often, and tell passengers you'll answer once you're level.", "best", "Distraction plus a high pitch attitude is a common stall setup."],
          ["Climb at a slower speed for more altitude.", "poor", "Below Vx or Vy you lose performance and margin."],
          ["Turn off the stall horn.", "poor", "Never."]] }],
      deb: "Stall: reduce angle of attack first. Then fix the distraction." },
    { id: "wingdrop", t: "A wing drops in a stall", acs: ["PA.VII.B.R4", "PA.VII.B.R5"], src: "AFH 5 · FAA-S-ACS-6C",
      set: "Practicing a power-off stall at a safe altitude, the left wing drops sharply as the stall breaks.",
      steps: [
        { q: "What's the correct order?", o: [
          ["Reduce angle of attack first, then level the wings with coordinated aileron and rudder.", "best", "Trying to lift a stalled wing with aileron alone can deepen the stall on that wing and start a spin."],
          ["Full right aileron right away.", "poor", "Aileron on a stalled wing can make it worse. Unload first."],
          ["Hold back pressure and add power.", "poor", "Power helps, but holding back pressure keeps it stalled."]] },
        { q: "How high should you practice stalls?", o: [
          ["High enough to recover no lower than 1,500 ft above the ground.", "best", "That's the ACS and AFH standard, with room to spare if it goes wrong."],
          ["Pattern altitude is fine.", "poor", "Far too low to recover from a spin."],
          ["As low as 500 ft over flat terrain.", "poor", "Not nearly enough margin."]] }],
      deb: "Unload, then level the wings. Practice high." },
  ],
  fl4: [
    { id: "rwy", t: "Airplane on the runway", acs: ["PA.IV.N.R1", "PA.IV.N.R4"], src: "AFH 9",
      set: "On a short final at a non-towered field, an airplane taxis onto the runway and stops.",
      steps: [
        { q: "What do you do?", o: [
          ["Go around now: full power, pitch for climb, and sidestep to one side so you can see the traffic.", "best", "Decide early. Offsetting lets you keep the other airplane in view and avoid climbing over it if it takes off."],
          ["Land long beyond it.", "poor", "You don't know if it'll start rolling. Landing over an airplane on the runway is not an option."],
          ["Slow down and wait for it to move.", "poor", "Low and slow on final is how stalls happen."]] },
        { q: "You have full flaps out. How do you retract them?", o: [
          ["In stages, as the POH says, once you're climbing.", "best", "Dumping all the flaps at once at low speed can cause a sudden loss of lift and a sink."],
          ["All at once to reduce drag.", "poor", "That's the classic go-around mistake."],
          ["Leave them all out until pattern altitude.", "poor", "Full flaps hurt your climb. Retract them in stages."]] }],
      deb: "Go around early, offset to see traffic, and retract flaps in stages." },
    { id: "bounce", t: "A bounce", acs: ["PA.IV.N.R2", "PA.IV.N.R3"], src: "AFH 9",
      set: "You flare a bit high and the airplane bounces back up about 10 ft.",
      steps: [
        { q: "What do you do?", o: [
          ["Go around: full power, hold a safe pitch, and climb.", "best", "A big bounce means you're slow and high with little control. A go-around is the safe fix."],
          ["Push the nose down to get back on the runway.", "poor", "That's how porpoising starts, and it can collapse the nose gear."],
          ["Pull back hard to cushion it.", "poor", "Already slow, pulling back can stall you several feet up."]] },
        { q: "Next time, it's just a small, gentle bounce.", o: [
          ["Hold the landing attitude, add a little power to soften the touchdown, and go around if in doubt.", "best", "A small bounce can be saved if you keep the attitude. When unsure, go around."],
          ["Push forward to stick it on.", "poor", "Pushing forward is always wrong on a bounce."],
          ["Cut all power and hope.", "poor", "You may drop hard."]] }],
      deb: "Big bounce, go around. Never push forward." },
  ],
  fl8: [
    { id: "xw", t: "Gusty crosswind", acs: ["PA.IV.B.R1", "PA.IV.B.R2"], src: "AFH 8 · PHAK 4 · your airplane's POH",
      set: "The wind is 15 gusting 25 knots, 60° off the runway. Your airplane's demonstrated crosswind is 15 knots, and your personal limit is 10.",
      steps: [
        { q: "What's the crosswind, and do you land?", o: [
          ["About 13 knots steady, about 22 in gusts. That's over your limit: use another runway or airport, or wait.", "best", "At 60°, the crosswind is about 90% of the wind. Gusts count."],
          ["15 knots is the demonstrated limit, so it's fine.", "poor", "The gust component is well over it, and your personal limit is 10."],
          ["Land with extra speed.", "ok", "A gust additive is right, but it doesn't fix a crosswind beyond your limits."]] },
        { q: "At a better runway, the wind is 10 gusting 20, nearly straight down it. What approach speed?", o: [
          ["Your normal approach speed plus half the gust factor: plus 5 knots.", "best", "The gust factor is 10 knots, and half of it gives margin against a sudden drop in airspeed."],
          ["Plus 20 knots.", "poor", "Far too fast. You'll float and use too much runway."],
          ["Normal speed.", "poor", "A gust drop at normal speed can leave you near the stall."]] }],
      deb: "Know the components, respect the limits, add half the gust factor." },
    { id: "stab", t: "Not stabilized", acs: ["PA.IV.M.R9", "PA.IV.N.R1"], src: "AFH 8, 9",
      set: "At 300 ft above the ground on final you're 15 knots fast, high, and descending at 1,200 feet per minute.",
      steps: [
        { q: "What do you do?", o: [
          ["Go around.", "best", "An unstable approach this low rarely fixes itself. Go-arounds are cheap."],
          ["Slip to lose altitude and land.", "ok", "A slip can fix being high, but fast and steep at 300 ft is too much to fix safely."],
          ["Force it onto the runway.", "poor", "Landing fast and steep leads to bounces, porpoising and overruns."]] },
        { q: "What's a reasonable stabilized-approach target for VFR?", o: [
          ["Stabilized (on speed, on path, configured) by about 500 ft above the field; if not, go around.", "best", "Picking a gate in advance makes the go-around decision automatic."],
          ["By 50 ft.", "poor", "Far too late."],
          ["No gate; just judge it.", "poor", "Without a gate, the decision gets made too late."]] }],
      deb: "Set a stabilized-approach gate. Not stable by the gate? Go around." },
    { id: "short", t: "Trees off the end", acs: ["PA.IV.F.R1", "PA.IV.F.R5"], src: "AFH 6 · your airplane's POH",
      set: "A short-field takeoff with 50-ft trees past the end of the runway.",
      steps: [
        { q: "What climb speed do you use?", o: [
          ["Vx until clear of the obstacle, then accelerate to Vy.", "best", "Vx gives the most altitude per distance; Vy gives the most per minute."],
          ["Vy right away.", "poor", "Vy climbs faster per minute but covers more ground, which may not clear the trees."],
          ["Slower than Vx for a steeper climb.", "poor", "Below Vx the climb angle gets worse and you're closer to a stall."]] },
        { q: "What flap setting?", o: [
          ["What the POH says for a short-field takeoff.", "best", "Many trainers use 10°. More flap adds drag."],
          ["Full flaps for the most lift.", "poor", "Full flaps add so much drag the climb suffers."],
          ["Always flaps up.", "ok", "Some airplanes do; follow the POH."]] }],
      deb: "Vx to clear, then Vy, with POH flaps." },
  ],
  fl10: [
    { id: "spinrec", t: "An accidental spin", acs: ["PA.VII.D.R1", "PA.VII.D.R3"], src: "AFH 5 · your airplane's POH",
      set: "During stall practice, a wing drops and the airplane starts to rotate.",
      steps: [
        { q: "What do you do?", o: [
          ["Power idle, ailerons neutral, full rudder opposite the rotation, then elevator forward, unless the POH says otherwise.", "best", "PARE: power, ailerons, rudder, elevator. Your POH's spin recovery comes first."],
          ["Opposite aileron to stop the roll.", "poor", "Aileron can make a spin worse."],
          ["Pull back to stop the descent.", "poor", "That keeps the wing stalled."]] },
        { q: "The rotation stops.", o: [
          ["Neutralize the rudder and recover smoothly from the dive without overstressing the airplane.", "best", "Pulling too hard can cause a secondary stall or exceed the load limit."],
          ["Pull back hard to level off.", "poor", "Risks a secondary stall or overstress."],
          ["Keep the rudder in.", "poor", "That can start a spin the other way."]] }],
      deb: "PARE, then a smooth pull-out." },
    { id: "accel", t: "Buffet in a steep turn", acs: ["PA.VII.C.R5", "PA.V.A.R1"], src: "AFH 5, 10 · PHAK 5",
      set: "Losing altitude in a 50° bank, you pull hard and feel a buffet at a speed well above the normal stall speed.",
      steps: [
        { q: "What's happening, and what do you do?", o: [
          ["An accelerated stall. Release back pressure, then roll toward level.", "best", "Load factor raises the stall speed. Unloading lowers the angle of attack right away."],
          ["Pull harder to hold altitude.", "poor", "That deepens the stall."],
          ["Add full power and keep pulling.", "poor", "Power doesn't fix a high angle of attack."]] },
        { q: "Why does it stall above the normal stall speed?", o: [
          ["In a 60° bank, the load factor is 2 and the stall speed rises about 41%.", "best", "Stall speed goes up with the square root of the load factor."],
          ["Because the engine loses power in a turn.", "poor", "It's load factor, not power."],
          ["It doesn't; you misread the airspeed.", "poor", "Accelerated stalls are real and happen at higher speeds."]] }],
      deb: "Steep bank + pull = accelerated stall. Unload first." },
  ],
  fl11: [
    { id: "imc", t: "The horizon disappears", acs: ["PA.VIII.A.R1", "PA.VIII.A.R2"], src: "AFH 18 · FAA-H-8083-15B",
      set: "In thickening haze, you lose sight of the horizon.",
      steps: [
        { q: "What do you do?", o: [
          ["Trust the instruments: wings level on the attitude indicator, then a shallow 180° turn back to where it was clear.", "best", "Your inner ear will lie. Small, smooth inputs on the instruments keep you upright."],
          ["Climb steeply to get above it.", "poor", "Steep maneuvers without a horizon invite spatial disorientation."],
          ["Look outside harder until you see something.", "poor", "Head down and out without a horizon is how disorientation starts. Fly the instruments."]] },
        { q: "You're still not sure where clear air is.", o: [
          ["Ask ATC for help. Declare an emergency if you need to.", "best", "ATC can give headings to better weather and altitudes clear of terrain."],
          ["Keep trying alone.", "poor", "Help is one call away."],
          ["Descend until you see the ground.", "poor", "That risks hitting terrain or towers."]] }],
      deb: "Instruments, 180°, and ask for help early." },
    { id: "fix", t: "Fixation", acs: ["PA.VIII.A.R5", "PA.VIII.A.R6"], src: "FAA-H-8083-15B ch 4–5",
      set: "Practicing with a view-limiting device, you hold the wings level perfectly, but the altitude has drifted 200 ft high.",
      steps: [
        { q: "What went wrong?", o: [
          ["Fixation: staring at one instrument. Use a radial scan: attitude indicator in the center, out to one instrument and back.", "best", "The AI is the hub, but the altimeter and others confirm what it's doing."],
          ["The altimeter is broken.", "poor", "First suspect your scan."],
          ["Your trim is wrong; that's all.", "ok", "Trim helps, but you'd still miss drifts without a good scan."]] },
        { q: "How do you fix the 200 ft?", o: [
          ["A small pitch change, a degree or two on the AI, then hold it and let the altitude come back.", "best", "Small, smooth corrections. Large ones lead to overshooting."],
          ["Push the nose well down.", "poor", "Big inputs cause big overshoots."],
          ["Pull the power to idle.", "poor", "Too much. Small changes."]] }],
      deb: "Scan, don't stare. Correct small." },
  ],
  wx3: [
    { id: "micro", t: "A sudden gain on final", acs: ["PA.III.B.R3", "PA.VII.A.R4"], src: "PHAK 12 · AIM 7-1 · AWH 19",
      set: "On final with virga and a building shower near the field, the airspeed suddenly jumps 15 knots and the airplane balloons up.",
      steps: [
        { q: "What may be coming next?", o: [
          ["A microburst: after the headwind comes a strong downdraft and a tailwind. Go around now with full power.", "best", "The gain is the warning. In a microburst, the performance loss can exceed a light airplane's climb."],
          ["Free speed: reduce power and land.", "poor", "Reducing power right before the downdraft is the worst possible setup."],
          ["Hold everything and see.", "poor", "Waiting costs the altitude you need."]] },
        { q: "How do you avoid it?", o: [
          ["Delay the approach or go elsewhere when there are showers, virga or storms near the field.", "best", "Microbursts usually last only 15 minutes or so. Waiting it out is cheap."],
          ["Fly faster on every approach.", "poor", "Speed alone doesn't overcome a microburst."],
          ["Fly lower on final.", "poor", "Lower means less room."]] }],
      deb: "Showers near the field + sudden speed gain = go around and wait." },
    { id: "wake2", t: "Departing after a landing jet", acs: ["PA.III.B.R3"], src: "AIM 7-4 · AC 90-23G",
      set: "A large jet has just landed on your runway. You're cleared for takeoff.",
      steps: [
        { q: "Where do you rotate?", o: [
          ["Beyond the point where the jet touched down.", "best", "The jet stopped making vortices when it touched down. Past that point, you're clear."],
          ["Before its touchdown point.", "poor", "That's where the vortices from its approach are."],
          ["Anywhere; landing jets don't leave wake.", "poor", "They make vortices until they touch down."]] },
        { q: "Later, a helicopter is hovering near the taxiway.", o: [
          ["Stay well clear: at least three rotor diameters.", "best", "Hovering helicopters make strong downwash and vortices."],
          ["Taxi close behind it.", "poor", "Rotor wash can roll a light airplane."],
          ["Helicopters don't make wake.", "poor", "They do, and it's strong."]] }],
      deb: "Know where the wake is: before a landing jet's touchdown, around a hovering helicopter." },
  ],
  rc1: [
    { id: "nordo", t: "Radio dies near the tower", acs: ["PA.III.A.R1", "PA.III.A.R2"], src: "AIM 4-3-13, 6-4-2",
      set: "Ten miles from a towered airport, your radio fails. The transponder still works.",
      steps: [
        { q: "What do you do?", o: [
          ["Squawk 7600, remain outside or above Class D until you see the traffic, and watch the tower for light signals.", "best", "7600 tells ATC you've lost communications. Then join the flow and look for signals."],
          ["Squawk 7700.", "ok", "Use 7700 if there's an emergency, but plain lost communications is 7600."],
          ["Land without telling anyone.", "poor", "Tell them with 7600 and follow light signals."]] },
        { q: "In the air, you see a steady red light from the tower.", o: [
          ["Give way to other aircraft and continue circling.", "best", "Steady red in flight: give way, keep circling. Flashing red: airport unsafe, don't land."],
          ["Land; red means stop on the runway.", "poor", "That's on the ground. In the air, steady red means give way."],
          ["Leave the area.", "poor", "That's not what it means; keep circling."]] }],
      deb: "7600, then light signals: steady green is cleared to land." },
    { id: "say", t: "An unclear instruction", acs: ["PA.III.A.R1", "PA.III.A.R4"], src: "AIM 4-2 · AIM Pilot/Controller Glossary",
      set: "On a busy frequency, the tower gives you an instruction you only half heard.",
      steps: [
        { q: "What do you say?", o: [
          ["\"Say again\" with your call sign.", "best", "Never guess. A short request for a repeat is standard."],
          ["\"Roger.\"", "poor", "Roger only means 'I received your transmission.' You didn't."],
          ["Do what you think they said.", "poor", "Guessing is how pilots end up in the wrong place."]] },
        { q: "The frequency is busy. How do you make your next call?", o: [
          ["Listen first, plan the call, then say who you're calling, who you are, where you are and what you want.", "best", "A short, organized call is easier for everyone."],
          ["Start talking as soon as there's a gap.", "poor", "You may step on a reply."],
          ["Wait until it's quiet, however long.", "ok", "Sometimes, but a short planned call fits most gaps."]] }],
      deb: "Don't guess. Say again, and plan every call." },
  ],
  rg1: [
    { id: "pax", t: "A friend wants a ride", acs: ["PA.II.A.R4", "PA.I.D.R1"], src: "14 CFR 61.87, 61.89",
      set: "You've just soloed. A friend asks to come along on your next solo flight.",
      steps: [
        { q: "Can you take them?", o: [
          ["No. A student pilot may not carry passengers.", "best", "61.89(a)(1). Wait until you have your certificate."],
          ["Yes, if they're a pilot too.", "poor", "Any person on board who isn't required crew is a passenger."],
          ["Yes, on a short local flight.", "poor", "No exceptions."]] },
        { q: "Your solo endorsement was given 95 days ago.", o: [
          ["You need a new 90-day solo endorsement before flying solo.", "best", "61.87(n): the solo endorsement is good for 90 days."],
          ["It's fine for a year.", "poor", "90 days."],
          ["You can fly to the practice area only.", "poor", "No solo at all without a current endorsement."]] }],
      deb: "No passengers, and keep your 90-day endorsement current." },
    { id: "vis", t: "Solo visibility", acs: ["PA.I.D.R3", "PA.I.C.R1"], src: "14 CFR 61.89",
      set: "It's daytime. Reported visibility is 4 miles in haze.",
      steps: [
        { q: "Can you fly solo?", o: [
          ["The rule allows it (at least 3 miles by day), but check your endorsement's limits; your CFI may have set stricter ones.", "best", "61.89 sets the minimum; your endorsement limitations may be higher."],
          ["No; students need 5 miles by day.", "poor", "5 miles is the night requirement for students."],
          ["Yes, whatever your endorsement says.", "poor", "Endorsement limits are binding."]] },
        { q: "En route, the haze drops visibility to 2 miles.", o: [
          ["Turn back or land at the nearest suitable airport.", "best", "Below 3 miles you're below student minimums and losing your references."],
          ["Continue; it was 4 at departure.", "poor", "Conditions now are what count."],
          ["Climb above the haze.", "poor", "You might lose sight of the ground, which a student must not do."]] }],
      deb: "Student minimums: 3 miles day, 5 night, and always see the surface." },
  ],
  rg3: [
    { id: "night45", t: "Night fuel", acs: ["PA.I.D.R6", "PA.VI.A.R3"], src: "14 CFR 91.151",
      set: "A night VFR trip of 1 hour 30 minutes. Your airplane has 2 hours of usable fuel on board.",
      steps: [
        { q: "Is it legal?", o: [
          ["No. Night VFR needs enough fuel to reach the destination plus 45 minutes. You'd have only 30.", "best", "91.151: 30 minutes by day, 45 at night."],
          ["Yes; 30 minutes of reserve is the rule.", "poor", "That's the day rule."],
          ["Yes, if the wind is calm.", "poor", "Calm or not, the reserve is short."]] },
        { q: "What would be a good personal minimum?", o: [
          ["Land with at least an hour of fuel.", "best", "Many pilots plan a one-hour reserve. Winds and diversions eat fuel."],
          ["The legal minimum is enough.", "ok", "Legal, but with little margin."],
          ["Land with whatever is left.", "poor", "Fuel exhaustion is a common, preventable accident cause."]] }],
      deb: "Day 30, night 45, and plan for more." },
    { id: "eltx", t: "Out-of-date checks", acs: ["PA.II.B.R2", "PA.II.A.R2"], src: "14 CFR 91.207, 91.413, 91.215",
      set: "Looking through the logbooks before a flight, you find two items past due.",
      steps: [
        { q: "The ELT battery replacement date passed last month.", o: [
          ["No-go until it's replaced (with narrow exceptions).", "best", "91.207: batteries must be replaced by the date marked."],
          ["Go; ELTs are only for emergencies.", "poor", "It's still required equipment."],
          ["Go, but turn it off.", "poor", "That doesn't make it legal."]] },
        { q: "The transponder check was 25 months ago.", o: [
          ["You can't use the transponder, so you can't fly where one is required.", "best", "91.413: the check is due every 24 calendar months. No transponder means no Class B, C, or Mode C veil, among others."],
          ["Fine; it still works.", "poor", "Working isn't the same as checked."],
          ["Fine within 10 NM of home.", "poor", "No such exception."]] }],
      deb: "Check the logbooks: ELT battery, transponder, annual." },
  ],
  ad1: [
    { id: "attitude", t: "Talking yourself into it", acs: ["PA.I.H.R2"], src: "PHAK 2",
      set: "Weather is deteriorating near your destination. You notice your own thoughts.",
      steps: [
        { q: "You think, \"Nothing I do will change it anyway.\" What attitude is that?", o: [
          ["Resignation. Antidote: \"I'm not helpless. I can make a difference.\"", "best", "Resignation leads pilots to stop acting. You still have options: divert, turn back, ask for help."],
          ["Invulnerability.", "poor", "That's \"it won't happen to me.\""],
          ["Macho.", "poor", "That's \"I can do it.\""]] },
        { q: "Then you think, \"Just get it done, quickly.\" Which antidote fits?", o: [
          ["\"Not so fast. Think first.\"", "best", "That's impulsivity. Slow down and run through your options."],
          ["\"Follow the rules.\"", "ok", "That's the antidote for anti-authority."],
          ["\"Taking chances is foolish.\"", "poor", "That's the antidote for macho."]] }],
      deb: "Name the attitude, say the antidote." },
    { id: "pave", t: "Risks that add up", acs: ["PA.I.D.R1", "PA.I.D.R4"], src: "PHAK 2 · AC 60-22",
      set: "You slept badly, the airplane has a minor squawk you're not sure about, the weather is marginal, and your passenger needs to be home tonight.",
      steps: [
        { q: "What does PAVE tell you?", o: [
          ["Each risk is small, but together they add up. Fix some or don't go.", "best", "Pilot, aircraft, environment and external pressures all point the same way."],
          ["Each risk is small, so go.", "poor", "Accidents usually come from several small risks, not one big one."],
          ["Go if the weather is legal.", "poor", "Legal weather doesn't cancel the rest."]] },
        { q: "How can you lower the risk?", o: [
          ["Rest, get the squawk checked, wait for better weather, and give the passenger a backup plan.", "best", "Fixing even two of the four makes a different flight."],
          ["Fly faster to beat the weather.", "poor", "Speed adds pressure, not safety."],
          ["Skip the passenger briefing to save time.", "poor", "Rushing adds risk."]] }],
      deb: "PAVE: small risks stack. Reduce them, or don't go." },
  ],
  ap6: [
    { id: "gun", t: "Light signals on the ground", acs: ["PA.III.A.R1", "PA.II.D.R4"], src: "AIM 4-3-13 · 14 CFR 91.125",
      set: "Your radio has failed while you're taxiing at a towered airport.",
      steps: [
        { q: "The tower shows a flashing green.", o: [
          ["You're cleared to taxi.", "best", "On the ground, flashing green means cleared to taxi. Steady green means cleared for takeoff."],
          ["You're cleared for takeoff.", "poor", "That's steady green."],
          ["Return to the ramp.", "poor", "That's flashing white."]] },
        { q: "Later you see a flashing red while you're on the runway.", o: [
          ["Taxi clear of the runway in use.", "best", "Flashing red on the ground means taxi clear of the runway. Steady red means stop."],
          ["Stop where you are.", "poor", "That's steady red."],
          ["Take off now.", "poor", "Definitely not."]] }],
      deb: "Learn the light-gun table cold, ground and air." },
    { id: "circle", t: "The segmented circle", acs: ["PA.III.B.R1"], src: "AIM 4-3-3, 4-3-4",
      set: "Arriving at an unfamiliar non-towered field, you see a segmented circle with traffic pattern indicators.",
      steps: [
        { q: "The indicator for your runway shows right traffic.", o: [
          ["Fly a right-hand pattern for that runway.", "best", "Pattern indicators show the turns; other pilots will expect it."],
          ["Fly left traffic; it's standard.", "poor", "Left is standard only when nothing says otherwise."],
          ["Overfly the field and choose.", "poor", "The indicator has already chosen."]] },
        { q: "The windsock is fully extended.", o: [
          ["Expect wind of about 15 knots or more.", "best", "A windsock fully extended usually means at least 15 knots."],
          ["The wind is calm.", "poor", "Calm makes it hang limp."],
          ["The wind is light and variable.", "poor", "That makes it droop and swing."]] }],
      deb: "Read the field from above: pattern direction, wind and runway." },
  ],
};
