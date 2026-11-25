// Scenario cards: short made-up situations at generic airports, two or three decisions each, every choice explained.
// Each option is [text, grade, why, next?]: grade "best" | "ok" | "poor"; next is the step index to go to (default: the
// following step; -1 ends). The best option is written first; the card shuffles the order on screen.
// acs: ACS FAA-S-ACS-6C risk-management (R) elements the scenario practices. src: the FAA references behind the answers.
import { SCEN3 } from "./scenarios3.js?v=680d64f417";
import { SCEN2 } from "./scenarios2.js?v=680d64f417";
export const SCEN = {
  gl4: [
    { id: "hold", t: "Traffic on final", acs: ["PA.III.B.R1", "PA.IV.A.R7"], src: "AIM 4-1-9 · AC 90-66C · AFH 7",
      set: "A non-towered field with a 3,000 ft runway. You've finished the run-up and are holding short. You heard no calls, but you see a landing light on about a 1-mile final.",
      steps: [
        { q: "What do you do?", o: [
          ["Stay behind the hold line and let it land.", "best", "Not every airplane has a radio, and some pilots don't call. Anything on final has the right of way over you on the ground (14 CFR 91.113(g))."],
          ["Announce that you're departing and go quickly.", "poor", "An airplane on short final is committed. If you're slow, it has to go around low and slow, right over you."],
          ["Taxi onto the runway and wait for a gap.", "poor", "Sitting on the runway with an airplane on final is how runway collisions happen. At a non-towered field, nobody is sequencing you."]] },
        { q: "It lands and clears. Now another pilot calls a 3-mile final. You're ready.", o: [
          ["Look at final and base both ways, announce 'departing runway', and go only if you're clearly well ahead of it.", "best", "A prompt takeoff ahead of an airplane at 3 miles is normal, if you look, announce and don't dawdle. If in doubt, wait."],
          ["Go without a call; it's far enough out.", "poor", "The radio call costs two seconds and tells the other pilot what you're doing. Always self-announce on the CTAF."],
          ["Wait until it lands, whatever the spacing.", "ok", "Safe, and never wrong. But at a busy field, a 3-mile gap is usually plenty when you're ready to roll."]] }],
      deb: "See and avoid first, radio second. At a non-towered field, you are your own controller." },
    { id: "taxi", t: "A runway you didn't expect", acs: ["PA.II.D.R2", "PA.II.D.R4"], src: "AIM 4-3-18 · AC 91-73B · PHAK 14",
      set: "A towered airport. You almost always depart on runway 27. Ground says: \"Runway 9, taxi via Bravo, hold short of runway 27.\"",
      steps: [
        { q: "How do you read it back?", o: [
          ["\"Runway 9, taxi via Bravo, hold short runway 27,\" then trace the route on the airport diagram.", "best", "Read back the runway, the route and every hold-short exactly. The diagram check catches the gap between what you heard and what you expected."],
          ["\"Taxi to 27 via Bravo.\"", "poor", "Expectation bias: you heard what you usually hear. Ground can't catch the mistake if you never say the hold-short."],
          ["\"Roger,\" and taxi the usual way.", "poor", "A hold-short instruction must always be read back, and 'the usual way' may cross a runway you weren't cleared to cross."]] },
        { q: "You reach a hold line and you aren't sure whether it's runway 27 or a taxiway marking.", o: [
          ["Stop before the line and ask Ground.", "best", "When in doubt, stop and ask. You need an explicit clearance to cross any runway, and the question costs seconds."],
          ["Cross; you were cleared to runway 9, which covers it.", "poor", "Not anymore: every runway crossing needs its own clearance. A taxi clearance to a runway no longer includes crossing others."],
          ["Cross slowly, watching for traffic.", "poor", "Looking isn't a clearance. Crossing a hold line without one is a runway incursion even if nothing happens."]] }],
      deb: "Write taxi instructions down, read back every hold-short, and stop when unsure." },
    { id: "wake", t: "Behind a larger airplane", acs: ["PA.III.B.R3"], src: "AIM 7-4 · PHAK 14 · AC 90-23G",
      set: "A towered airport, calm wind. Tower clears you to land number two, following a large jet on a 3-mile final to the same runway.",
      steps: [
        { q: "How do you fly the approach?", o: [
          ["Stay at or above the jet's approach path and plan to land beyond where it touched down.", "best", "Vortices sink and stay behind the jet. Above its path and past its touchdown point, you're clear of them."],
          ["Fly a lower, flatter approach to keep it in sight.", "poor", "Below its path is exactly where the vortices sink. That puts you in them close to the ground."],
          ["Land short of its touchdown point so you can turn off early.", "poor", "Before its touchdown point the jet was still flying and making vortices. Landing short of it puts you in them."]] },
        { q: "Calm wind is the worst case. Why?", o: [
          ["The vortices can sit on or drift slowly along the runway instead of being blown away.", "best", "A light crosswind or quartering tailwind can even hold one vortex over the runway. Calm or light wind means more caution, not less."],
          ["Calm air makes the jet's vortices stronger.", "ok", "Vortex strength depends on the jet's weight, speed and configuration (heavy, clean, slow is worst). The wind decides where they go."],
          ["It isn't; wind spreads them out across the airport.", "poor", "Wind moves vortices, it doesn't make them more dangerous. Calm air lets them linger."]] }],
      deb: "Above the path, beyond the touchdown point, and extra caution in light wind." },
  ],
  gl9: [
    { id: "eng", t: "Engine quits in cruise", acs: ["PA.IX.B.R1", "PA.IX.B.R6"], src: "AFH 18 · PHAK 17 · your airplane's POH",
      set: "3,000 ft above the ground over farmland, 15 NM from the nearest airport. The engine coughs and goes quiet.",
      steps: [
        { q: "First action?", o: [
          ["Pitch for best glide speed and trim.", "best", "Airspeed first. Every second at the wrong speed costs altitude you need for everything else."],
          ["Start troubleshooting right away.", "ok", "You'll do it, but only after the airplane is gliding at best glide. Altitude is your time budget; don't spend it on a slow airplane.", 1],
          ["Turn toward the airport 15 NM away.", "poor", "From 3,000 ft most trainers glide roughly 4–5 NM. Stretching for an airport out of reach is a leading cause of fatal engine-out accidents."]] },
        { q: "You're gliding. A long, smooth field is just off your left wing. A restart attempt fails.", o: [
          ["Commit to the field, fly a planned pattern to it, call for help if there's time, and secure the engine per the checklist.", "best", "Pick early, then fly the airplane to that field. Calls and checklists happen around the flying, never instead of it."],
          ["Keep trying restarts all the way down.", "poor", "Fixating on the engine is how pilots arrive at the field too high, too low or too fast. Set a cutoff altitude and then commit."],
          ["Look for a better field farther away.", "poor", "A good field within easy reach beats a perfect one you might not reach. Changing your mind low is dangerous."]] }],
      deb: "Airspeed, best field, checklist, then communicate. Aviate, navigate, communicate." },
    { id: "fire", t: "Smell of burning insulation", acs: ["PA.IX.C.R1", "PA.III.A.R2"], src: "PHAK 17 · AFH 18 · your airplane's POH",
      set: "Cruising at 4,500 ft, you smell hot electrical insulation and see a thin wisp of smoke from behind the panel.",
      steps: [
        { q: "What do you do?", o: [
          ["Run the electrical fire checklist from the POH. In many trainers it starts with the master switch off.", "best", "Removing power is what stops most electrical fires. The checklist also covers when to open vents: usually only after the fire is out."],
          ["Open all the vents and windows first.", "poor", "Fresh air can feed a fire. Most POHs say vents closed until the fire is out, then ventilate."],
          ["Continue to your destination, 40 minutes away, and have it checked there.", "poor", "Fire is the one emergency that never waits. Land at the nearest suitable airport."]] },
        { q: "With the master off, the smoke stops. The radios are dead.", o: [
          ["Leave the power off and land at the nearest suitable airport.", "best", "Don't test whether the fire comes back. If you must talk to a tower, the POH tells you whether you may restore power to one item at a time."],
          ["Turn the master back on to see if it was a fluke.", "poor", "If it wasn't a fluke, you've restarted a fire in a closed cabin."],
          ["Continue with no power to the original destination.", "poor", "A fire that stopped can restart, and you've lost lights, radios and maybe the flaps. Land soon."]] }],
      deb: "Fire: checklist, power off, land at the nearest suitable airport." },
    { id: "alt", t: "Alternator fails", acs: ["PA.I.G.R2", "PA.IX.C.R1"], src: "PHAK 7 · AFH 18 · your airplane's POH",
      set: "Daytime, 40 minutes from your destination inside Class C airspace. The low-voltage light comes on and the ammeter shows a discharge.",
      steps: [
        { q: "What do you do?", o: [
          ["Run the POH checklist (often: reset the alternator), and if it doesn't come back, shed electrical load and plan to land soon.", "best", "The battery alone lasts a limited time, maybe 30 minutes or less, and it shrinks with every load you leave on."],
          ["Ignore it; the battery has plenty of power.", "poor", "Unknown battery health plus full electrical load can mean dead radios and transponder well before your destination."],
          ["Turn everything off, including the radios, and press on.", "ok", "Shedding load is right, but you still need a plan: a closer airport, and a call to ATC before you lose the radio."]] },
        { q: "You decide to divert to a closer non-towered field. The radio is getting weak.", o: [
          ["Tell ATC now that you have an electrical failure and are diverting, then save the battery.", "best", "One short call while you still can lets ATC protect you and know why you vanished from their scope."],
          ["Squawk 7700 and say nothing.", "ok", "Not wrong, but a short radio call gives ATC far more information while you still have power."],
          ["Save the battery for landing and don't call anyone.", "poor", "If you simply disappear from radar, ATC may start a search. Use the radio once while you can."]] }],
      deb: "Checklist, shed load, land early, tell someone while you still have a radio." },
  ],
  gl8: [
    { id: "taf", t: "A TEMPO at arrival time", acs: ["PA.I.C.R1"], src: "AWH 24 · AIM 7-1 · PHAK 2",
      set: "Your destination TAF shows VFR, but with TEMPO 3SM BR OVC015 for the hour you plan to arrive. Your personal minimums are a 3,000 ft ceiling and 5 miles.",
      steps: [
        { q: "How do you plan?", o: [
          ["Treat the TEMPO as likely, plan a good alternate and a turn-back point, or delay.", "best", "TEMPO means those conditions are expected for part of that hour. It's below your minimums, so you need a plan that works if it happens."],
          ["Go; TEMPO means it probably won't happen.", "poor", "TEMPO is a forecast that it will happen, just not for the whole period. 'Probably not' is PROB30, and even that deserves a plan."],
          ["Go, and decide en route.", "ok", "Deciding en route is fine only with an alternate and fuel already picked. Without them it becomes hoping."]] },
        { q: "Halfway there, the clouds ahead are lower than forecast and the visibility is dropping.", o: [
          ["Turn back or divert now, while you still have good weather behind you.", "best", "The best time to turn around is the first time you think about it. Continued VFR into IMC is a leading cause of fatal accidents."],
          ["Descend to stay below the clouds.", "poor", "Scud running puts you lower, closer to towers and terrain, with less time to react. It ends badly often enough to have a name."],
          ["Climb above the clouds and descend at the destination.", "poor", "VFR on top of a layer with low ceilings below can trap you with no legal way down."]] }],
      deb: "Plan for the forecast that hurts you; turn around early." },
    { id: "storm", t: "A line of storms", acs: ["PA.I.C.R1", "PA.VI.C.R3"], src: "AIM 7-1-29 · AWH 19 · PHAK 12",
      set: "On a summer afternoon flight, your datalink weather shows a line of strong storms crossing your route about 40 NM ahead.",
      steps: [
        { q: "What's your plan?", o: [
          ["Stay at least 20 NM away: divert around the line, land and wait, or turn back.", "best", "Storms can throw hail and severe turbulence miles from the cell. Storms in a line often leave no safe gap for a small airplane."],
          ["Fly under the anvil where it looks lighter.", "poor", "Hail falls from the anvil, and the gust front below can bring severe turbulence and wind shear."],
          ["Pick the widest gap on the datalink image and go through.", "poor", "Datalink radar can be 15–20 minutes old. The 'gap' may have closed long before you get there."]] },
        { q: "You land at an airport along the way. Two hours later the line has passed.", o: [
          ["Get a new briefing before going on.", "best", "Storms often re-form behind a line or keep developing in the afternoon. The old briefing is history."],
          ["Leave right away: the bad weather is behind you now.", "poor", "Gust fronts, more cells and wet runways can follow a line. Check before you go."],
          ["Wait until tomorrow.", "ok", "Always a safe choice. But a fresh briefing might show a good window today."]] }],
      deb: "Twenty miles, old datalink, and a fresh briefing after waiting." },
    { id: "fog", t: "Evening arrival, narrowing spread", acs: ["PA.I.C.R1"], src: "AWH 16 · PHAK 12",
      set: "You'll arrive at a field near a river after sunset. The METAR shows a calm wind and a temperature-dewpoint spread of 2 °C, and the spread has narrowed every hour.",
      steps: [
        { q: "What do you expect?", o: [
          ["Radiation fog is likely as it cools after sunset. Pick an alternate away from the river, or leave earlier.", "best", "Clear sky, light wind and a small, shrinking spread are the textbook setup. Fog can form within minutes."],
          ["It's VFR now, so it'll stay VFR.", "poor", "A spread of 2 °C with temperatures still falling is a warning, not a guarantee of VFR."],
          ["Fog only happens in the morning.", "poor", "Radiation fog forms whenever the ground cools enough, often during the night. It's usually thickest near sunrise, but it can start soon after sunset."]] },
        { q: "Arriving, you see patches of fog forming near the runway.", o: [
          ["Go to your alternate while you can still see it.", "best", "Fog patches can merge quickly. Divert with daylight and fuel to spare."],
          ["Land fast before it gets worse.", "ok", "Sometimes possible, but a rushed approach at night with fog drifting across is a setup for a bad landing. The alternate is the plan."],
          ["Circle and wait for it to clear.", "poor", "Radiation fog usually thickens through the night. You'd just burn fuel in the dark."]] }],
      deb: "Small spread + clear night + calm wind = fog. Have the alternate ready." },
  ],
  gl14: [
    { id: "fuel", t: "Late at the checkpoint", acs: ["PA.VI.C.R3", "PA.I.D.R6"], src: "14 CFR 91.151 · PHAK 16",
      set: "Forty minutes into a planned 1.5-hour cross-country, you reach a checkpoint 8 minutes later than your nav log says. The headwind is stronger than forecast.",
      steps: [
        { q: "What do you do?", o: [
          ["Work out your actual groundspeed, recompute the time and fuel to destination, and check the reserve.", "best", "The nav log is a prediction. Checkpoints tell you what's really happening, so update the plan."],
          ["Press on; 8 minutes isn't much.", "poor", "8 minutes late at 40 minutes is 20% slow. Over the whole trip that can use much of your reserve."],
          ["Lean more aggressively to make up for it.", "ok", "Lean correctly by all means, but it doesn't fix a headwind. Recompute first."]] },
        { q: "The new numbers show you'd land with about 20 minutes of fuel. Daytime VFR requires 30.", o: [
          ["Divert to an airport on the way for fuel.", "best", "The 30-minute daytime reserve is the legal minimum, not a target. A fuel stop is cheap."],
          ["Continue and fly faster.", "poor", "More power burns more fuel per mile. You'd arrive with even less."],
          ["Continue; the gauges show more than that.", "poor", "Fuel gauges in light airplanes are only required to be accurate at empty. Trust time and burn rate."]] }],
      deb: "Checkpoints update the plan. Divert for fuel early, not late." },
    { id: "lost", t: "Nothing matches the chart", acs: ["PA.VI.C.R5", "PA.VI.D.R2"], src: "PHAK 16 · AIM 6-2",
      set: "Thirty minutes from your last sure checkpoint, the town and highway below don't match the chart.",
      steps: [
        { q: "What first?", o: [
          ["Climb if you can (better view and radio range), then communicate, confess and comply.", "best", "These are the classic lost-pilot steps. ATC or Flight Service can find you; asking early is good airmanship."],
          ["Keep flying the same heading until something matches.", "poor", "Each minute you go on, the search area grows and the fuel goes down."],
          ["Circle the town until you figure it out.", "ok", "Circling a landmark keeps you from getting more lost, but it burns fuel. Pair it with a call for help."]] },
        { q: "You've called ATC. They're working on finding you.", o: [
          ["Hold heading and altitude, and squawk the code they give you.", "best", "Help them help you: steady flight and the right squawk make you easy to find on radar."],
          ["Try to find it yourself, turning toward something familiar.", "poor", "Changing course while ATC is still working on finding you makes their job harder."],
          ["Descend to read the water tower's name.", "poor", "Going low over unfamiliar ground, possibly near towers, adds risk and costs radio range."]] }],
      deb: "Climb, communicate, confess, comply. Conserve fuel too." },
    { id: "gps", t: "The tablet goes dark", acs: ["PA.VI.B.R4", "PA.VI.B.R3"], src: "PHAK 16 · AIM 1-1",
      set: "Your tablet running the navigation app overheats and shuts down. You had stopped checking the paper chart an hour ago.",
      steps: [
        { q: "What do you do?", o: [
          ["Fly the planned heading, find your position on the paper chart from landmarks and elapsed time, then go on by pilotage and dead reckoning.", "best", "This is why you carry a chart and keep a running nav log: time, heading and checkpoints still work when the screen doesn't."],
          ["Reboot the tablet and wait.", "ok", "Fine to try, but an overheated tablet may stay off for a long time. Navigate while you wait."],
          ["Turn toward where you think home is.", "poor", "A guess turn without a known position is how pilots get truly lost."]] },
        { q: "Next time, how do you prepare?", o: [
          ["Keep the chart open and follow along, mark checkpoint times, and carry a backup (a second device or a panel GPS).", "best", "Automation is a tool, not a crutch. Staying in the loop means the failure is just an inconvenience."],
          ["Buy a better tablet.", "ok", "Helps, but any device can fail. You still need the skill and the habit."],
          ["Just fly familiar routes.", "poor", "Avoiding the problem limits you and doesn't help on the day something fails anyway."]] }],
      deb: "Stay in the loop: chart, clock and heading never run out of battery." },
  ],
  gl16: [
    { id: "press", t: "Passengers who need to be home", acs: ["PA.I.D.R4", "PA.I.H.R2"], src: "PHAK 2 · AC 60-22",
      set: "You're flying friends home for a family event tonight. The forecast is right at your personal minimums and getting worse later.",
      steps: [
        { q: "Your friend says, \"We have to make it. You've got this.\" What do you do?", o: [
          ["Stick to your minimums, and offer a backup (drive, airline, leave earlier or tomorrow).", "best", "External pressure is a classic hazard. Making the decision before the flight, with a backup ready, takes the pressure off the cockpit."],
          ["Go; you've flown in worse.", "poor", "That's the invulnerability or macho attitude talking. Past luck isn't a weather forecast."],
          ["Go, and turn back if it gets bad.", "ok", "A turn-back plan is good, but with passengers pushing, pilots often don't turn back. Decide on the ground."]] },
        { q: "You decide to leave earlier, before the weather worsens. On the ground you find a minor squawk: a landing light is out.", o: [
          ["Check whether it's required for this flight (91.205 requires one at night when flying for hire, and you'll arrive near sunset), and if in doubt, don't go.", "best", "Pressure makes squawks look smaller. Check 91.205 and the 91.213 inoperative-equipment rules, just as you would on any other day."],
          ["Go; it's just a light.", "poor", "Pressure turns 'probably fine' into 'fine.' Check the rule instead."],
          ["Ask a passenger to decide.", "poor", "You're pilot in command. The decision is yours alone (91.3)."]] }],
      deb: "Decide before the passengers decide for you. Always have a backup." },
    { id: "tired", t: "After a long day", acs: ["PA.I.D.R1", "PA.I.H.R1"], src: "PHAK 2, 17 · AIM 8-1-1",
      set: "You've worked a 12-hour day and slept 5 hours last night. The evening is clear and calm, and the airplane is booked.",
      steps: [
        { q: "Run IMSAFE. What do you decide?", o: [
          ["Don't fly; fatigue fails the F in IMSAFE.", "best", "Fatigue impairs judgment like alcohol does, and tired pilots rarely notice how impaired they are."],
          ["Fly a short local flight only.", "ok", "Better than a cross-country, but takeoffs and landings are where fatigue hurts most."],
          ["Fly; the weather is perfect.", "poor", "Perfect weather doesn't fix the pilot. Most accidents are pilot factors, not weather."]] },
        { q: "How do you avoid this next time?", o: [
          ["Set personal minimums for sleep and duty, and check them when you book the airplane.", "best", "Personal minimums decided in advance make the call easy when the day comes."],
          ["Drink coffee before the flight.", "poor", "Caffeine masks fatigue; it doesn't remove it."],
          ["Book later in the evening so you can nap.", "ok", "A nap helps a little, but a short night is still a short night."]] }],
      deb: "IMSAFE is a go/no-go check, not a formality." },
    { id: "dist", t: "Distracted on final", acs: ["PA.IV.B.R6", "PA.I.H.R3"], src: "AFH 8, 9 · PHAK 2",
      set: "On downwind with a talkative passenger, you realize you skipped the before-landing checklist. Now you're on a short final, fast, with no flaps set.",
      steps: [
        { q: "What do you do?", o: [
          ["Go around.", "best", "A go-around is a normal maneuver, not a failure. You get a fresh start and time for the checklist."],
          ["Put flaps down now and land.", "poor", "Configuring on short final while fast is how runway overruns and loss of control start."],
          ["Land fast without flaps; the runway is long.", "poor", "Maybe, but you're rushed and outside your normal picture. That's the setup for a bad landing."]] },
        { q: "How do you set up the next approach?", o: [
          ["Ask the passenger for quiet until you're on the ground (a 'sterile cockpit'), and run the checklist on downwind.", "best", "Brief passengers before the flight that you'll need quiet during takeoff and landing."],
          ["Turn up the radio to drown out the passenger.", "poor", "More noise is more distraction."],
          ["Skip the checklist; just fly carefully.", "poor", "Checklists exist because careful pilots forget things."]] }],
      deb: "Go around, then use a sterile cockpit." },
  ],
  gl17: [
    { id: "med", t: "Cold medicine", acs: ["PA.I.H.R1"], src: "14 CFR 61.53, 91.17 · AIM 8-1-1 · PHAK 17",
      set: "You took an over-the-counter antihistamine this morning for a stuffy nose. You feel fine and have a flight at noon.",
      steps: [
        { q: "Do you fly?", o: [
          ["No. Wait until it's fully out of your system: the FAA's guide is five times the maximum dosing interval. Ask an AME if unsure.", "best", "Sedating antihistamines slow reaction time even when you don't feel drowsy. 61.53 makes you responsible for knowing."],
          ["Yes; it's over the counter.", "poor", "Over the counter doesn't mean approved for flying. Many OTC drugs are disqualifying while you take them."],
          ["Yes, if you don't feel sleepy.", "poor", "Impairment from these drugs often isn't felt."]] },
        { q: "The stuffy nose itself: does it matter?", o: [
          ["Yes. Congestion can block your ears or sinuses on descent, which can be very painful.", "best", "Ear and sinus blocks happen mostly during descent. Flying with a cold is a risk in itself."],
          ["No; only the medication matters.", "poor", "The illness is part of IMSAFE too."],
          ["Use nasal spray and go.", "ok", "Sometimes acceptable, but ask an AME. It can wear off mid-flight."]] }],
      deb: "Illness and medication both count. When unsure, ask an AME." },
    { id: "alc", t: "The morning after", acs: ["PA.I.H.R1", "PA.I.H.R2"], src: "14 CFR 91.17 · AIM 8-1-1 · PHAK 17",
      set: "A party ended at 10 p.m. You had several drinks. Your flight is at 8 a.m.",
      steps: [
        { q: "Is it legal and safe?", o: [
          ["The 8 hours have passed, but you may still be over 0.04 or hung over. Wait longer.", "best", "91.17 has three tests: 8 hours, not under the influence, and below 0.04. Hangover effects can last much longer than 8 hours."],
          ["Yes: 10 hours is more than 8.", "poor", "8 hours is only one of the rules. Several drinks can leave you over 0.04 or impaired the next morning."],
          ["Yes, after coffee.", "poor", "Coffee doesn't lower blood alcohol or fix impairment."]] },
        { q: "What rule of thumb helps?", o: [
          ["Leave far more than 8 hours: the AIM suggests 12 to 24 hours between bottle and throttle, depending on how much you drank.", "best", "The 8 hours in 91.17 is the legal floor, not a safety margin."],
          ["8 hours from the last drink, always.", "poor", "That's the legal minimum, not a safety margin."],
          ["Sleep it off; one night is enough.", "ok", "Often, but not after heavy drinking. Be honest about how much."]] }],
      deb: "8 hours is the law's floor, not a safe margin." },
    { id: "dive", t: "Diving trip, flight home", acs: ["PA.I.H.R1"], src: "AIM 8-1-2 · PHAK 17",
      set: "You did two recreational dives today with no decompression stops. You'd like to fly home tonight, cruising at 6,500 ft.",
      steps: [
        { q: "When can you go?", o: [
          ["Wait at least 12 hours after the last dive (24 if it had decompression stops or you'll go above 8,000 ft).", "best", "Nitrogen absorbed while diving can form bubbles at lower cabin pressure. Waiting lets it leave your body."],
          ["Tonight; 6,500 ft is low.", "poor", "Decompression sickness can happen at quite low altitudes after diving."],
          ["Tonight, if you fly at 3,000 ft.", "ok", "Lower is better, but the guidance is still to wait. Plan the flight for tomorrow."]] },
        { q: "Your passenger dove too, and now has joint pain and tingling.", o: [
          ["Treat it as possible decompression sickness: get medical help, and don't fly them.", "best", "The treatment is 100% oxygen and a recompression chamber. Flying makes it worse."],
          ["Fly to the hospital quickly.", "poor", "Climbing makes the bubbles grow. Get medical help on the ground."],
          ["Wait to see if it passes.", "poor", "DCS can get worse fast. Get medical help."]] }],
      deb: "Dive today, fly tomorrow." },
  ],
};
Object.assign(SCEN, SCEN2, SCEN3);
