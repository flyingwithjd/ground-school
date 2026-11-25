// Scenario cards, set 2 (same format as data/scenarios.js): ground lessons gl1, gl2, gl3, gl5, gl7, gl10, gl11, gl13, gl15.
export const SCEN2 = {
  gl1: [
    { id: "inop", t: "A light that doesn't work", acs: ["PA.II.B.R2", "PA.II.A.R2"], src: "14 CFR 91.205, 91.209, 91.213(d) · PHAK 9",
      set: "Preflight for a daytime local flight, not for hire. The landing light doesn't come on.",
      steps: [
        { q: "Can you go?", o: [
          ["Check whether it's required (91.205, the equipment list, any ADs). If not, it must be deactivated or removed and placarded \"Inoperative\" first.", "best", "91.213(d) lets you fly with inoperative equipment that isn't required, but only after you go through those steps. A pilot can placard; removing or deactivating may need a mechanic."],
          ["Go; it's daytime.", "poor", "Probably not required by day, but you still have to check and placard it before flight."],
          ["Cancel; nothing may be broken.", "ok", "Safe, but stricter than the rule. Many items can be legally deferred."]] },
        { q: "Now the anticollision (strobe) light doesn't work either.", o: [
          ["No-go until it's fixed: newer airplanes are required to have it for all flights.", "best", "91.205 requires an anticollision light system on airplanes certificated after March 11, 1996. If one fails in flight, 91.209 lets you continue to where it can be repaired, but you can't start a flight with it inoperative."],
          ["Placard it and go.", "poor", "You can only placard equipment that isn't required."],
          ["Turn on the beacon and position lights instead.", "poor", "Other lights don't stand in for a required anticollision system."]] }],
      deb: "Inoperative? Is it required? If not, deactivate and placard. If it is, no-go." },
    { id: "docs", t: "Paperwork check", acs: ["PA.II.A.R2"], src: "14 CFR 91.9, 91.203 · PHAK 9",
      set: "Before a solo flight, you check the documents on board.",
      steps: [
        { q: "The registration certificate isn't in the airplane.", o: [
          ["Don't fly until it, or the temporary authority, is on board.", "best", "91.203 requires the airworthiness and registration certificates on board. Missing registration grounds the airplane."],
          ["Fly; the FAA has it on file.", "poor", "The rule is about the paper being on board, not about the FAA's records."],
          ["Fly locally only.", "poor", "There's no local-flight exception."]] },
        { q: "The airworthiness certificate is there, but the weight-and-balance pages are missing from the POH.", o: [
          ["Find or replace them before flight.", "best", "Current weight-and-balance data and the operating limitations (91.9) must be in the airplane. That's the W in ARROW."],
          ["Use a weight from a similar airplane.", "poor", "Every airplane has its own empty weight and CG. Another airplane's numbers can be far off."],
          ["Go; you know the airplane well.", "poor", "It's still a required document, and without it you can't check your loading."]] }],
      deb: "ARROW: airworthiness, registration, radio license (international only), operating limitations, weight and balance." },
  ],
  gl2: [
    { id: "carb", t: "Rough running in cruise", acs: ["PA.I.G.R1", "PA.I.G.R2"], src: "PHAK 7 · AFH 18 · your airplane's POH",
      set: "A humid day around 15 °C. In cruise with a carbureted engine and fixed-pitch propeller, the RPM slowly drops and the engine starts running a little rough.",
      steps: [
        { q: "What's most likely, and what do you do?", o: [
          ["Carburetor ice. Apply full carburetor heat.", "best", "Carb ice is most likely below about 21 °C (70 °F) with high humidity, and it can form in warmer air too. A slow RPM drop in a fixed-pitch airplane is the classic sign."],
          ["Lean the mixture until it smooths out.", "poor", "Leaning doesn't remove ice. Fix the cause first."],
          ["Add throttle to hold the RPM.", "poor", "That hides the RPM drop while the ice keeps growing."]] },
        { q: "With full carb heat, the RPM drops further and it runs rougher for a moment.", o: [
          ["Leave the heat on. As the ice melts, the RPM rises again.", "best", "Heated air is less dense, and the melted ice passes through the engine. Both cause an initial drop. Turning heat off now lets the ice come back."],
          ["Turn carb heat off; it made it worse.", "poor", "The extra roughness is the ice melting. That's the sign it's working."],
          ["Leave it on and also start looking for a landing spot.", "ok", "Having a field in mind is always good, but give the heat time to work."]] }],
      deb: "RPM drop + humid air = carb heat, full, and leave it on." },
    { id: "vac", t: "The attitude indicator leans", acs: ["PA.I.G.R1", "PA.I.G.R2"], src: "PHAK 8 · AFH 18",
      set: "In clear weather, you notice the attitude indicator showing a slight bank while the wings are level with the horizon outside. The suction gauge reads low.",
      steps: [
        { q: "What do you do?", o: [
          ["Treat it as a vacuum failure: cover or ignore the attitude and heading indicators, and fly by the outside horizon and the turn coordinator.", "best", "A failing vacuum gyro winds down slowly and gives believable but wrong readings. The turn coordinator is usually electric."],
          ["Trust the attitude indicator; it's a gyro.", "poor", "With low suction the gyro is slowing down. It drifts without warning."],
          ["Tap the instrument and keep flying.", "poor", "Tapping doesn't fix a vacuum pump."]] },
        { q: "There are clouds ahead along your route.", o: [
          ["Stay well clear of clouds and land at a suitable airport to get it fixed.", "best", "Without the AI and heading indicator you've lost your best tools if you accidentally lose the horizon."],
          ["Continue; you're VFR and won't enter clouds.", "ok", "Legal, but a degraded airplane leaves less margin. Shorten the flight."],
          ["Fly through a thin layer; it's brief.", "poor", "Never, and especially not without working gyros."]] }],
      deb: "Cross-check gyros against the suction gauge and the real horizon." },
    { id: "fuel", t: "Topped off?", acs: ["PA.II.A.R2", "PA.I.G.R1"], src: "PHAK 7 · AFH 2 · your airplane's POH",
      set: "The line service says your airplane was topped off. You're running a bit late.",
      steps: [
        { q: "How do you check the fuel?", o: [
          ["Look in each tank yourself and sample every drain.", "best", "Verify quantity, type (color) and that there's no water or debris, every flight."],
          ["Trust the fuel gauges.", "poor", "Fuel gauges in light airplanes are only required to read accurately at empty."],
          ["Trust the line service; they said full.", "poor", "Misfueling and wrong tanks happen. Your eyes are the check."]] },
        { q: "The first sample from one tank has water in it.", o: [
          ["Keep sampling until it's clean. If water keeps coming, don't fly.", "best", "Water sinks to the low point. Several clean samples show it's gone. Persistent water needs a mechanic."],
          ["One sample is enough; it's out now.", "poor", "There may be more. Keep draining until it comes out clean."],
          ["Go, and use the other tank.", "poor", "Many airplanes feed from both tanks. Water in the engine can stop it."]] }],
      deb: "See the fuel, sample every drain, and keep going until it's clean." },
  ],
  gl3: [
    { id: "base", t: "Overshooting final", acs: ["PA.V.A.R5", "PA.VII.B.R5"], src: "AFH 4, 5, 8 · PHAK 5",
      set: "A tailwind on base pushes you through the extended centerline as you turn final.",
      steps: [
        { q: "What do you do?", o: [
          ["Accept the overshoot: shallow your bank, rejoin from the other side, or go around.", "best", "A wide final is harmless. Tightening the turn low and slow is not."],
          ["Steepen the bank to 45° to make the turn.", "poor", "Steeper bank raises the stall speed close to the ground."],
          ["Hold the bank and add inside rudder to swing the nose around.", "poor", "That's a skid: the classic setup for a cross-control stall and spin at pattern altitude."]] },
        { q: "Why is the skid so dangerous here?", o: [
          ["The inside wing goes slower and to a higher angle of attack. If it stalls first, the airplane rolls toward the ground with no altitude to recover.", "best", "Turning base to final is one of the most common places for stall-spin accidents."],
          ["It makes the airplane slip.", "poor", "Too much inside rudder is a skid, not a slip."],
          ["It wastes fuel.", "poor", "The problem is losing control, not fuel."]] }],
      deb: "A wide final is fine. A tight, skidding turn is a stall-spin trap." },
    { id: "turb", t: "Bumpy air, high speed", acs: ["PA.VII.A.R4", "PA.I.F.R2"], src: "PHAK 5 · your airplane's POH",
      set: "Cruising in the yellow arc, you hit moderate turbulence.",
      steps: [
        { q: "What do you do?", o: [
          ["Slow down to or below maneuvering speed (or the POH's turbulence speed).", "best", "Below VA, a hard gust stalls the wing before it can overstress the structure. The yellow arc is for smooth air only."],
          ["Hold your speed so you get through faster.", "poor", "In the yellow arc, a strong gust can exceed the load limit."],
          ["Climb fast to get above it.", "ok", "Maybe smoother higher, but slow down first."]] },
        { q: "You're light: only you and half fuel. Is the posted VA still right?", o: [
          ["No. VA goes down as weight goes down, so fly a bit slower than the max-weight figure.", "best", "A lighter airplane accelerates more in a gust, so it reaches the load limit at a lower speed."],
          ["Yes; it's on the placard.", "poor", "The placard figure is usually for maximum weight."],
          ["It goes up when you're lighter.", "poor", "It goes down. That catches many pilots."]] }],
      deb: "Turbulence: slow to VA, and lower still when light." },
  ],
  gl5: [
    { id: "over", t: "Three adults and full tanks", acs: ["PA.I.F.R1", "PA.I.F.R2"], src: "14 CFR 91.9 · PHAK 10 · your airplane's POH",
      set: "With full fuel, you, two adult passengers and bags, your calculation shows 120 lb over maximum takeoff weight. The runway is long.",
      steps: [
        { q: "What do you do?", o: [
          ["Take less fuel (keeping a proper reserve) or less baggage, or fewer people, until you're at or below max weight.", "best", "Max weight is a limitation. A long runway doesn't change what the wing and structure were certified for."],
          ["Go; the runway is long.", "poor", "Overweight hurts climb, stall speed and structural margins, not only takeoff distance."],
          ["Go; it's only about 5% over.", "poor", "Any amount over is illegal (91.9) and reduces your margins."]] },
        { q: "You drop 20 gallons. Weight is fine now.", o: [
          ["Recheck the CG at takeoff and at landing.", "best", "Removing fuel moves the CG, and fuel burn moves it again in flight. Both ends must stay in the envelope."],
          ["Weight is fine, so the CG must be too.", "poor", "Weight and CG are separate limits."],
          ["Check it at takeoff only.", "ok", "Better than nothing, but in many airplanes the landing CG is the one that ends up outside."]] }],
      deb: "Max weight is a limit, and CG must stay inside the envelope for the whole flight." },
    { id: "da", t: "Hot afternoon, high field", acs: ["PA.I.F.R1", "PA.I.F.R3"], src: "PHAK 11 · AFH 5 · your airplane's POH",
      set: "A 5,000 ft field on a 30 °C afternoon. The runway is 4,000 ft long. Your airplane is near max weight.",
      steps: [
        { q: "How do you decide?", o: [
          ["Work out takeoff distance and climb from the POH charts with the real pressure altitude and temperature, then add a healthy margin.", "best", "Density altitude here is roughly 8,000 ft or more. Charts assume a new airplane and a test pilot, so margin matters."],
          ["Use your usual sea-level numbers.", "poor", "Takeoff distance can double or more at high density altitude."],
          ["Go if the airplane gets off the ground in the first half of the runway.", "ok", "An abort point is a good idea, but compute first so you know what to expect."]] },
        { q: "The numbers are tight. What helps most?", o: [
          ["Wait for the cool early morning, lighten the load, and lean for best power as the POH directs.", "best", "Cooler air and less weight give the biggest gains. At high elevation, a full-rich mixture can rob you of power."],
          ["Use full flaps for takeoff.", "poor", "Unless the POH says so, extra flap adds drag and hurts the climb."],
          ["Take off with a slight tailwind on the longer runway.", "poor", "Even a few knots of tailwind adds a lot of distance."]] }],
      deb: "Hot, high, heavy: compute, add margin, or wait for cool air." },
    { id: "grass", t: "A short grass strip", acs: ["PA.I.F.R1", "PA.IV.C.R1"], src: "AFH 6 · your airplane's POH",
      set: "You're planning a takeoff from a 2,200 ft dry grass strip. The POH charts are for a paved, level runway.",
      steps: [
        { q: "How do you plan?", o: [
          ["Apply the POH's grass correction (often a percentage of the ground roll), then add your own safety margin.", "best", "Grass adds rolling resistance. The POH's notes under the chart tell you how much."],
          ["Use the paved numbers; grass is close enough.", "poor", "The difference can be significant, especially if the grass is long or wet."],
          ["Use the soft-field technique and skip the calculation.", "poor", "Technique helps, but it doesn't replace knowing whether the runway is long enough."]] },
        { q: "The wind is calm, but the strip slopes slightly uphill one way.", o: [
          ["Usually take off downhill with no wind, after checking the numbers both ways and obstacles at each end.", "best", "Downhill helps acceleration. Check the POH and local advice, and watch obstacles at the far end."],
          ["Always take off uphill.", "poor", "Uphill makes the roll longer."],
          ["It doesn't matter.", "poor", "Slope changes the ground roll noticeably."]] }],
      deb: "Correct the chart for the surface, the slope and the wind, then add margin." },
  ],
  gl7: [
    { id: "front", t: "A cold front this afternoon", acs: ["PA.I.C.R1"], src: "PHAK 12 · AWH 10",
      set: "A cold front with a line of building cumulus is forecast to pass your airport mid-afternoon. You planned a local flight at 2 p.m.",
      steps: [
        { q: "What do you expect and plan?", o: [
          ["Gusty, shifting winds and possible thunderstorms near the front. Fly in the morning or wait until well after it passes.", "best", "Cold fronts move fast and can bring a narrow band of storms, turbulence and a sharp wind shift."],
          ["Go before the front arrives, since it's forecast for later.", "ok", "Possible with a hard turnaround time, but fronts often arrive early."],
          ["Fronts are mostly a big-airplane problem.", "poor", "They hit small airplanes hardest."]] },
        { q: "The front has passed. What's typical behind it?", o: [
          ["Clearer, cooler air with gusty winds from a new direction. Check the crosswind against your limits.", "best", "Behind a cold front, visibility is often great but the wind can be gusty and turbulent."],
          ["Calm winds and fog.", "poor", "More typical of a stable, moist night, not right behind a cold front."],
          ["Low stratus all day.", "poor", "Low stratus is more typical ahead of a warm front."]] }],
      deb: "Cold front: storms and wind shift at the line, gusty and clear behind it." },
    { id: "wave", t: "Strong wind over a ridge", acs: ["PA.I.C.R1", "PA.I.D.R3"], src: "PHAK 12 · AWH 17",
      set: "Your route crosses a mountain ridge. Winds at ridge level are 30 knots, blowing straight across it, and you see smooth, lens-shaped clouds downwind.",
      steps: [
        { q: "What do those clouds tell you?", o: [
          ["Mountain wave: strong up- and downdrafts, and possibly severe turbulence (rotor) below the wave crests.", "best", "Lenticular clouds mark standing waves. Downdrafts on the downwind side can exceed a light airplane's climb rate."],
          ["Stable air, so a smooth ride.", "poor", "Smooth-looking lenticulars can sit above violent rotor turbulence."],
          ["Nothing; they're high clouds.", "poor", "They're a visible warning of the wave."]] },
        { q: "How do you plan the crossing?", o: [
          ["Don't cross today, or cross well above the ridge at an angle so you can turn away from it, approaching from the upwind side.", "best", "Approaching at an angle gives you an escape. Thousands of feet of clearance help in a downdraft."],
          ["Cross low through the pass to stay under the wind.", "poor", "The strongest downdrafts and turbulence are close to the terrain downwind."],
          ["Cross head-on at minimum altitude to save time.", "poor", "If a downdraft hits, you'd have no room to turn away."]] }],
      deb: "Strong wind across a ridge + lenticulars = stay away or stay very high." },
  ],
  gl10: [
    { id: "classb", t: "Talking to approach, near Class B", acs: ["PA.I.D.R3", "PA.VI.A.R1"], src: "14 CFR 91.131 · AIM 3-2-3",
      set: "You're VFR under a Class B shelf. Approach gives you a squawk code and says, \"Remain clear of Class Bravo airspace.\"",
      steps: [
        { q: "Can you climb into the Class B?", o: [
          ["No. You need to hear \"cleared into the Class Bravo airspace.\"", "best", "A squawk code or radar contact is not a clearance. Without the exact words, stay out."],
          ["Yes; you're talking to ATC and have a code.", "poor", "That's enough for Class C, but Class B needs an explicit clearance."],
          ["Yes, if you stay on your heading.", "poor", "Same problem: no clearance, no entry."]] },
        { q: "As a student pilot, what else do you need for Class B?", o: [
          ["Your instructor's specific endorsements, and you can't use certain busy primary airports at all.", "best", "61.95 requires endorsements for that airspace (and airport). Part 91 Appendix D lists airports where student solo operations aren't allowed."],
          ["Nothing extra.", "poor", "Student pilots need specific endorsements for Class B."],
          ["Only a transponder.", "poor", "The airplane needs a transponder with ADS-B Out, but the student needs endorsements too."]] }],
      deb: "Class B: exact words \"cleared into the Class Bravo,\" plus endorsements for students." },
    { id: "classd", t: "Calling the tower", acs: ["PA.I.D.R3", "PA.III.A.R1"], src: "14 CFR 91.129 · AIM 3-2-5",
      set: "You call a Class D tower 15 miles out. The reply: \"Aircraft calling tower, stand by.\"",
      steps: [
        { q: "Can you enter the Class D?", o: [
          ["No. They didn't use your call sign, so two-way communication isn't established.", "best", "You need the controller to answer with your call sign. Until then, stay outside."],
          ["Yes; they answered.", "poor", "Answering an unknown \"aircraft calling\" doesn't count."],
          ["Yes, if you stay low.", "poor", "Class D starts at the surface. Low is still inside."]] },
        { q: "A minute later: \"(Your call sign), stand by.\"", o: [
          ["Now you may enter, unless they tell you to remain outside.", "best", "Using your call sign establishes two-way communication, even with \"stand by.\""],
          ["Still wait for \"cleared into Class D.\"", "poor", "There's no such clearance for Class D. That's Class B."],
          ["Circle until they call again.", "ok", "Allowed, but not required. You may continue in."]] }],
      deb: "Class D and C: your call sign back means you may enter. Class B: you need a clearance." },
    { id: "tfr", t: "A TFR on your route", acs: ["PA.I.D.R3", "PA.II.A.R5"], src: "14 CFR 91.103, 91.137 · AIM 3-5-3, 5-6",
      set: "The night before a cross-country, you hear about a VIP visit near your route.",
      steps: [
        { q: "How do you plan?", o: [
          ["Check NOTAMs and the TFR graphic in your briefing, and plan around any active TFR.", "best", "91.103 requires you to know all available information. TFRs can pop up with short notice."],
          ["Fly the route; TFRs are only for airlines.", "poor", "VIP TFRs apply to almost all aircraft, and violations end in an intercept."],
          ["Fly lower to stay under it.", "poor", "Many TFRs start at the surface."]] },
        { q: "In flight, you realize you've entered a TFR.", o: [
          ["Contact ATC or Flight Service right away, leave by the most direct route, and monitor 121.5.", "best", "Talking to ATC immediately is the best way to resolve it. If intercepted, follow the AIM intercept procedures."],
          ["Turn off the transponder.", "poor", "That makes it worse."],
          ["Continue and hope no one notices.", "poor", "They will notice."]] }],
      deb: "Check TFRs before every flight. If you bust one, talk to ATC immediately." },
  ],
  gl11: [
    { id: "cur", t: "Taking a friend up", acs: ["PA.I.A.R1"], src: "14 CFR 61.57",
      set: "You haven't flown in four months. A friend wants to go for a ride this Saturday afternoon.",
      steps: [
        { q: "What do you need first?", o: [
          ["Three takeoffs and landings within the last 90 days in the same category and class before carrying passengers.", "best", "61.57(a). Do them solo or with an instructor first."],
          ["Nothing; you're certificated.", "poor", "Carrying passengers requires recent experience."],
          ["A flight review.", "ok", "Only if your last one was more than 24 calendar months ago. The 90-day landings are still needed."]] },
        { q: "Your friend asks to go after dark instead.", o: [
          ["You need three takeoffs and landings to a full stop between 1 hour after sunset and 1 hour before sunrise, in the last 90 days.", "best", "61.57(b). Night passenger currency is separate from day."],
          ["Your day landings cover it.", "poor", "Night needs its own landings to a full stop."],
          ["Touch-and-goes at dusk count.", "poor", "They must be to a full stop and in the night period defined in 61.57(b)."]] }],
      deb: "Legal is the minimum. Proficient is the goal." },
    { id: "share", t: "Who pays?", acs: ["PA.II.A.R4"], src: "14 CFR 61.113",
      set: "A friend wants to fly with you to the beach and offers to pay for the whole flight.",
      steps: [
        { q: "Can you accept?", o: [
          ["No. You may share operating expenses with passengers, but you have to pay at least your pro rata share.", "best", "61.113(c): fuel, oil, airport fees and rental, split, and you pay your part."],
          ["Yes; it's a friend.", "poor", "Being paid for the whole thing is compensation, which a private pilot can't receive for carrying passengers."],
          ["Yes, if it's just fuel.", "poor", "You still have to pay your share of the fuel."]] },
        { q: "Can you post online offering rides to the beach, costs shared?", o: [
          ["No. Advertising rides to the public is \"holding out,\" which turns it into a commercial operation.", "best", "Cost sharing applies to a flight you'd make anyway, with a common purpose, not to rides offered to the public."],
          ["Yes, as long as costs are split evenly.", "poor", "The way you find passengers matters too."],
          ["Yes, on a private social media group.", "poor", "Still holding out."]] }],
      deb: "Share the costs, pay your part, and don't advertise." },
    { id: "rev", t: "When was your flight review?", acs: ["PA.I.A.R1"], src: "14 CFR 61.56",
      set: "Your last flight review was 25 calendar months ago. You want to fly solo this weekend.",
      steps: [
        { q: "Can you act as pilot in command?", o: [
          ["No. Get a flight review first; you can fly with an instructor in the meantime.", "best", "61.56: a flight review within the preceding 24 calendar months is required to act as PIC."],
          ["Yes; it's only one month over.", "poor", "The rule has no grace period."],
          ["Yes, if you fly locally.", "poor", "There's no local exception."]] },
        { q: "What else counts instead of a flight review?", o: [
          ["A pilot proficiency check or a practical test for a new certificate or rating, among others in 61.56.", "best", "For example, passing an instrument rating checkride resets the 24 months."],
          ["Logging 10 hours solo.", "poor", "Hours alone don't count."],
          ["An online course only.", "ok", "Programs like FAA WINGS can count, but they include flight training, not just a course."]] }],
      deb: "Flight review every 24 calendar months, no grace period." },
  ],
  gl13: [
    { id: "static", t: "Altimeter frozen after takeoff", acs: ["PA.I.G.R1", "PA.I.G.R2"], src: "PHAK 8 · your airplane's POH",
      set: "On climbout after a cold, wet night outside, the altimeter is stuck at field elevation and the VSI shows zero.",
      steps: [
        { q: "What's likely, and what do you do?", o: [
          ["A blocked static port. Open the alternate static source.", "best", "Altimeter and VSI both use static pressure. A frozen altimeter plus zero VSI points straight at static."],
          ["A blocked pitot tube. Turn on pitot heat.", "ok", "Pitot heat won't hurt, but a pitot blockage affects only the airspeed."],
          ["Ignore it and use GPS altitude.", "poor", "GPS altitude can help as a cross-check, but fix the static source first."]] },
        { q: "With the alternate static open, the indications read a little high.", o: [
          ["Expected: cabin pressure is a bit lower. Use the POH's correction table.", "best", "Most airplanes show slightly higher airspeed and altitude on alternate static."],
          ["It's broken too. Close it.", "poor", "A small error is normal and documented."],
          ["Open a window to fix the reading.", "poor", "Ventilation changes cabin pressure and the error. Follow the POH."]] }],
      deb: "Altimeter and VSI frozen = static. Use alternate static and expect a small error." },
    { id: "pitot", t: "Airspeed goes to zero", acs: ["PA.I.G.R1", "PA.I.G.R2"], src: "PHAK 8 · AFH 18",
      set: "In cruise in light rain near freezing, the airspeed slowly drops to zero. The engine and the attitude look normal.",
      steps: [
        { q: "What do you do?", o: [
          ["Hold your known cruise attitude and power, and turn on pitot heat.", "best", "A blocked pitot with an open drain hole bleeds the pressure away. Pitch and power still give you the same speed."],
          ["Lower the nose to get the speed back.", "poor", "You'd dive at high speed chasing a broken instrument."],
          ["Raise the nose because you think you're slow.", "poor", "That could actually make you slow."]] },
        { q: "The airspeed doesn't come back. You land at the nearest airport.", o: [
          ["Fly the approach with known pitch and power settings and a small margin, and use the GPS groundspeed as a cross-check.", "best", "You know what your normal approach looks and sounds like. Use the wind to interpret the groundspeed."],
          ["Fly a much faster approach to be safe.", "poor", "Far too fast eats runway and makes landing harder."],
          ["Use the stall horn as your guide.", "poor", "Flying at the stall warning on purpose is not a plan."]] }],
      deb: "Pitch + power = performance, even when an instrument dies." },
  ],
  gl15: [
    { id: "dark", t: "The panel goes dark", acs: ["PA.XI.A.R7", "PA.IX.C.R1"], src: "PHAK 7 · AFH 11 · AIM 4-3-13",
      set: "At night, cruising toward a towered airport, the panel lights and radios die. The engine runs normally.",
      steps: [
        { q: "What first?", o: [
          ["Fly the airplane, grab your flashlight, and run the electrical failure checklist.", "best", "Carry two flashlights at night for exactly this. Keep flying first."],
          ["Turn back immediately in the dark without a light.", "poor", "Hold heading and altitude first, then decide with a light."],
          ["Descend to see the ground better.", "poor", "Lower at night means less margin over terrain and towers."]] },
        { q: "The power doesn't come back. You continue to the towered airport.", o: [
          ["Enter the pattern, watch the tower for light signals, and land on a steady green.", "best", "A steady green from the tower means cleared to land. At night you would normally blink your lights to acknowledge, which may not work now, so fly a normal, predictable pattern."],
          ["Land without looking for signals.", "poor", "Light signals are how the tower will sequence you."],
          ["Circle until the radio returns.", "poor", "It won't. Use the light signals."]] }],
      deb: "Two flashlights, checklist, then light-gun signals." },
    { id: "hole", t: "A dark approach over water", acs: ["PA.XI.A.R3"], src: "PHAK 17 · AFH 11 · AIM 2-1-2",
      set: "At night, you approach a lit runway across dark water with no lights on the ground before it.",
      steps: [
        { q: "What illusion is likely?", o: [
          ["The black hole illusion: you feel higher than you are and tend to fly a low approach.", "best", "With no ground references, your eyes misjudge height. Many night accidents happen short of the runway."],
          ["You'll feel lower than you are.", "poor", "It's the opposite."],
          ["No illusion if the runway is lit.", "poor", "A lit runway in a dark area is exactly the setup."]] },
        { q: "The PAPI shows four red lights.", o: [
          ["You're well below the glidepath: level off or climb until you see two white and two red.", "best", "Four red is too low. Two and two is on the path."],
          ["You're on the glidepath.", "poor", "On path is two white, two red."],
          ["You're too high: descend.", "poor", "That flies you lower still, possibly into the water."]] }],
      deb: "Dark approach: use the PAPI and altimeter, and expect to feel high." },
    { id: "nightwx", t: "The town lights fade", acs: ["PA.XI.A.R6", "PA.VIII.A.R1"], src: "PHAK 17 · AFH 11, 18",
      set: "On a night cross-country, the lights of the town ahead slowly blur and then disappear.",
      steps: [
        { q: "What's happening?", o: [
          ["You're likely flying into cloud or fog you can't see. Make a shallow 180° turn on instruments.", "best", "At night clouds are invisible until you're in them. Fading lights are often the only warning."],
          ["The town turned its lights off.", "poor", "Not likely. Treat it as weather."],
          ["Climb to get above it.", "poor", "Climbing into cloud without instrument skills risks disorientation."]] },
        { q: "How do you prevent this next time?", o: [
          ["Use higher weather minimums at night and check the temperature-dewpoint spread.", "best", "Many pilots add a large margin for night. A small spread warns of fog or low cloud."],
          ["Fly lower to stay under any clouds.", "poor", "Low at night is how CFIT accidents happen."],
          ["Only fly on full-moon nights.", "ok", "Moonlight helps, but it doesn't replace good weather planning."]] }],
      deb: "At night, fading lights mean weather. Turn around early." },
  ],
};
