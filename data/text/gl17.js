// GL17 lesson text · Aeromedical Factors. Sources: PHAK (FAA-H-8083-25C) Ch 17; AIM 8-1; 14 CFR 61.23, 61.53, 61.113(i), 91.17, 91.211;
// FAA Aeromedical Advisory "A Pilot's Guide to Hypothermia and Hyperthermia" (FAA Safety Briefing).
export default {
  sections: [
    { id: "med", label: "Medical certificates · 14 CFR 61.23, 61.53", title: "Your medical: what you need and how long it lasts",
      body: `<p>To use student or private pilot privileges you need at least a <strong>third-class medical certificate</strong>, unless you fly under <strong>BasicMed</strong> (61.113(i)). An Aviation Medical Examiner (AME) issues it. <span class="src">14 CFR 61.23(a)(3)</span></p>
<p>For third-class privileges, a medical expires at the end of the <strong>60th calendar month</strong> after the exam month if you were <strong>under 40</strong> on the exam date, or the <strong>24th calendar month</strong> if you were <strong>40 or older</strong>. Calendar months means it runs to the <em>last day</em> of that month. <span class="src">14 CFR 61.23(d)</span></p>`,
      viz: { type: "medexpiry" },
      body2: `<p><strong>A medical isn't a free pass.</strong> You may not act as PIC (or required crew) while you know or have reason to know of a medical condition that would make you unable to meet the requirements of your medical certificate. You decide before every flight. <span class="src">14 CFR 61.53</span></p>
<p><strong>BasicMed</strong> is an alternative to the third-class medical. To use it you need: <span class="src">14 CFR 61.23(c)(3), 61.113(i)</span></p>
<ul><li>a valid US driver's license</li>
<li>to have held an FAA medical certificate at some time <strong>after July 14, 2006</strong> (so a brand-new student who has never held one must get one first)</li>
<li>your most recent medical not suspended or revoked, and any special issuance not withdrawn</li>
<li>a BasicMed medical education course within the last <strong>24 calendar months</strong>, and a comprehensive exam by a state-licensed physician within the last <strong>48 calendar months</strong></li></ul>
<p>Under BasicMed you may carry no more than <strong>6 passengers</strong> in an aircraft authorized for no more than <strong>7 occupants</strong> and a maximum takeoff weight of no more than <strong>12,500 lb</strong>, at or below <strong>18,000 ft MSL</strong>, no faster than <strong>250 KIAS</strong>, and within the United States unless the other country authorizes it. Keep the completed exam checklist and course certificate in your logbook. Student pilots may also use BasicMed. <span class="src">14 CFR 61.113(i), 61.89(d)</span></p>
<p class="note">The PHAK summarizes durations as "5 years / 2 years". Teach yourself the regulation's wording: calendar months, ending on the last day of the month.</p>`,
      kdr: { k: "Third-class medical, its duration, 61.53 and BasicMed.", d: "Work out when a given medical expires and whether BasicMed is available.", r: "Flying with a known condition; assuming BasicMed applies when it doesn't.", codes: ["PA.I.A.K3", "PA.I.A.K5", "PA.I.A.K1"] } },

    { id: "alc", label: "Alcohol and drugs · 14 CFR 91.17 · AIM 8-1-1", title: "Bottle to throttle, and what's in your medicine cabinet",
      body: `<p>No one may act as a crewmember: <span class="src">14 CFR 91.17(a)</span></p>
<ul><li>within <strong>8 hours</strong> after drinking any alcoholic beverage</li>
<li>while under the influence of alcohol</li>
<li>while using any drug that affects the faculties in any way contrary to safety</li>
<li>with a blood or breath alcohol concentration of <strong>0.04</strong> or more.</li></ul>
<p>8 hours is a legal minimum, not a safe number. The AIM recommends <strong>12 to 24 hours</strong> between "bottle and throttle", depending on how much you drank. <span class="src">AIM 8-1-1</span></p>`,
      body2: `<p><strong>How alcohol hurts you in the air</strong> <span class="src">PHAK 17</span></p>
<ul><li>The body needs about <strong>3 hours</strong> to clear the alcohol in one mixed drink or one beer, and considerable amounts can stay in the body for <strong>over 16 hours</strong>. A hangover still means you're under the influence.</li>
<li>Alcohol causes <strong>histotoxic hypoxia</strong>: the cells can't use oxygen properly. One ounce of alcohol can equal about <strong>2,000 ft</strong> of extra physiological altitude, and with altitude, two drinks may feel like three or four.</li></ul>
<p><strong>Medications.</strong> Prescription and over-the-counter drugs, and the conditions they treat, can degrade performance. Many sedating medicines (some antihistamines such as diphenhydramine, sleep aids, tranquilizers, cough suppressants) are a problem. Over-the-counter analgesics such as acetaminophen, aspirin and ibuprofen usually have few side effects at normal doses. After a medication with side effects, wait at least <strong>five times the dosing interval</strong> before flying, as a rule of thumb. Check with an AME before flying on a new medicine. <span class="src">PHAK 17 · AIM 8-1-1</span></p>
<p><strong>Marijuana</strong>: the FAA treats it as an illicit drug for pilots regardless of state law. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "91.17; how alcohol and drugs affect a pilot.", d: "Apply the rule and choose a safe personal limit.", r: "Flying legally but still impaired; overlooking OTC side effects.", codes: ["PA.I.H.K2", "PA.I.H.K3"] } },

    { id: "hyp", label: "Hypoxia · PHAK 17 · AIM 8-1-2 · 14 CFR 91.211", title: "Hypoxia: the higher you fly, the less you notice",
      body: `<p><strong>Hypoxia</strong> means not enough oxygen. Oxygen stays about <strong>21%</strong> of the air at every altitude, but its partial pressure falls as you climb, so each breath delivers less. <span class="src">AIM 8-1-2 · PHAK 17</span></p>
<p>Night vision starts to deteriorate as low as <strong>5,000 ft</strong> cabin altitude. Other significant effects usually don't appear in a healthy pilot below <strong>12,000 ft</strong>. From 12,000 to 15,000 ft, judgment, memory, alertness, coordination and calculation suffer, and performance can seriously deteriorate within 15 minutes at 15,000 ft. <span class="src">AIM 8-1-2</span></p>
<p>Drag the altitude to see the rule and the time of useful consciousness (TUC), the time you can still act sensibly without oxygen.</p>`,
      viz: { type: "hypoxia" },
      body2: `<p><strong>Symptoms vary from person to person</strong>, but common ones include cyanosis (blue fingernails and lips), headache, slower reactions, impaired judgment, euphoria, visual impairment, drowsiness, lightheadedness and tingling or numbness. The first symptoms can feel <em>pleasant</em>, which is why hypoxia is so dangerous. <span class="src">PHAK 17</span></p>
<p><strong>Treatment</strong>: descend to a lower altitude and/or use supplemental oxygen. <span class="src">PHAK 17</span></p>
<p><strong>The rule (91.211)</strong>: required crew must use oxygen after <strong>30 minutes</strong> above <strong>12,500 ft</strong> up to and including 14,000 ft cabin altitude, and at all times above <strong>14,000 ft</strong>. Above <strong>15,000 ft</strong>, every occupant must be provided with oxygen. The AIM recommends more: oxygen above <strong>10,000 ft by day</strong> and above <strong>5,000 ft at night</strong>. <span class="src">14 CFR 91.211 · AIM 8-1-2</span></p>
<p class="note">An altitude-chamber or ground-based hypoxia course teaches you <em>your own</em> symptoms. The FAA offers aviation physiology training at its Civil Aerospace Medical Institute (CAMI). <span class="src">AIM 8-1-2 · PHAK 17</span></p>`,
      kdr: { k: "Hypoxia symptoms, TUC, 91.211, and AIM recommendations.", d: "Recognize and correct hypoxia; plan oxygen.", r: "Euphoria hides the problem; night flying above 5,000 ft.", codes: ["PA.I.H.K1a", "PA.I.H.R1", "PA.I.H.S1"] } },

    { id: "types", label: "Four kinds of hypoxia · PHAK 17", title: "Same symptom, four causes",
      body: `<p>The PHAK sorts hypoxia by where the oxygen supply breaks down. Tap each one. <span class="src">PHAK 17</span></p>`,
      viz: { type: "mnemo", opts: { set: "hypoxia" } },
      body2: `<p>The same pilot can stack them: a smoker (hypemic, from CO) who had a drink last night (histotoxic) and flies at 10,000 ft (hypoxic) reaches a high physiological altitude well below the 12,500 ft rule. Smoking at sea level can produce effects similar to flying at <strong>8,000 ft</strong>. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Hypoxic, hypemic, stagnant and histotoxic hypoxia.", d: "Identify the type from a cause.", r: "Underestimating how factors add up.", codes: ["PA.I.H.K1a"] } },

    { id: "hv", label: "Hyperventilation · PHAK 17", title: "Breathing too much",
      body: `<p><strong>Hyperventilation</strong> is an excessive rate and depth of breathing that blows off too much carbon dioxide. It happens to pilots more often than people think, usually from stress or anxiety, and it can even lead to unconsciousness. <span class="src">PHAK 17</span></p>
<p>Its symptoms (lightheadedness, tingling, visual impairment) look a lot like hypoxia. So if you're using oxygen, <strong>first check the oxygen equipment and flow rate</strong>. <span class="src">PHAK 17</span></p>
<p><strong>Treatment</strong>: slow the breathing rate, for example by talking aloud, or by breathing into a paper bag. Recovery is usually rapid once breathing returns to normal. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Cause, symptoms and treatment of hyperventilation.", d: "Tell hyperventilation from hypoxia and treat it.", r: "Misdiagnosis.", codes: ["PA.I.H.K1b"] } },

    { id: "ears", label: "Ears and sinuses · PHAK 17 · AIM 8-1-2", title: "Trapped gas: ears and sinuses",
      body: `<p>When you climb or descend, gas in body cavities must equalize with the cabin. The <strong>Eustachian tube</strong> connects the middle ear to the throat. It normally opens when you swallow, chew or yawn. <span class="src">PHAK 17</span></p>
<ul><li><strong>Climbing</strong>: the expanding middle-ear air usually escapes on its own.</li>
<li><strong>Descending</strong>: the higher outside pressure pushes the eardrum inward, and the partial vacuum tends to hold the tube shut. That's harder to fix and more painful.</li></ul>
<p>To clear: swallow, yawn or tense your throat muscles. If that fails, close your mouth, pinch your nose and blow gently (the <strong>Valsalva maneuver</strong>). <span class="src">AIM 8-1-2 · PHAK 17</span></p>`,
      body2: `<p>A <strong>sinus block</strong> occurs most often during <strong>descent</strong>. It can cause excruciating pain above the eyebrows or in the cheeks (sometimes felt as a toothache). <span class="src">AIM 8-1-2</span></p>
<p>A cold, ear infection, sore throat or allergy can make equalizing impossible. The safe answer is not to fly with one. Nose drops or sprays may help with minor congestion, but ask an AME before using any medication. <span class="src">PHAK 17 · AIM 8-1-2</span></p>`,
      kdr: { k: "Middle ear and sinus problems.", d: "Prevent and clear an ear block.", r: "Flying with a cold.", codes: ["PA.I.H.K1c"] } },

    { id: "sd", label: "Spatial disorientation · PHAK 17", title: "When your inner ear lies",
      body: `<p>Your <strong>semicircular canals</strong> sense rotation and your <strong>otolith organs</strong> sense acceleration and tilt. Without a visible horizon they can give strong, wrong answers. <span class="src">PHAK 17</span></p>
<ul><li><strong>The leans</strong>, the most common illusion: a slow turn below about <strong>2°/s</strong> goes unnoticed, so when you level the wings you feel banked the other way and lean to "correct".</li>
<li><strong>Coriolis</strong>: after a prolonged turn, a head movement in a different plane (looking at something elsewhere in the cockpit) sets the fluid moving again and creates the illusion of turning or accelerating on an entirely different axis. Retrieve dropped items with minimal head movement.</li>
<li><strong>Graveyard spiral</strong>: in a prolonged coordinated turn you feel you've stopped turning. On leveling you feel a turn the other way and roll back in. Losing altitude, you pull back, which tightens the spiral.</li>
<li><strong>Somatogravic</strong>: rapid acceleration (takeoff) feels like nose-up, so you push over toward the ground. Rapid deceleration does the opposite.</li>
<li><strong>Inversion</strong>: an abrupt change from climb to level feels like tumbling backward, so you push nose-low.</li>
<li><strong>Elevator</strong>: an updraft feels like a climb, so you push nose-low; a downdraft does the opposite.</li></ul>
<p>Your <strong>postural</strong> ("seat of the pants") sense, from skin, joints and muscles, works with your eyes and inner ear. But in uncoordinated turns, climbing turns and turbulence, acceleration forces overpower gravity and it gives false signals too. <span class="src">PHAK 17</span></p>`,
      body2: `<p><strong>Coping</strong> (PHAK's list, shortened): understand the illusions and try them in a device; get and understand weather briefings; get instrument training before flying in marginal visibility (less than 3 miles) or without a horizon; don't fly into bad weather, dusk or darkness unless proficient on instruments; use only reliable, fixed outside references; avoid sudden head movements in takeoffs, turns and approaches; be rested and fed, since illness, medication, alcohol, fatigue and mild hypoxia all increase susceptibility; and above all, <strong>trust the instruments</strong>. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Vestibular illusions and how to cope.", d: "Name the illusion and the correct response.", r: "Continued VFR into IMC; head movements in turns.", codes: ["PA.I.H.K1d", "PA.I.H.R3"] } },

    { id: "opt", label: "Optical illusions · PHAK 17", title: "Illusions that change your approach",
      body: `<p>Most optical illusions matter on <strong>approach and landing</strong>. Try them below: each one changes what the "normal" picture looks like. <span class="src">PHAK 17</span></p>
<ul><li><strong>Narrow runway</strong>: you feel higher than you are, so you fly a <em>low</em> approach. A <strong>wide runway</strong> does the opposite (high approach).</li>
<li><strong>Upsloping</strong> runway or terrain: feels high, so you go low. <strong>Downsloping</strong>: the opposite.</li>
<li><strong>Featureless terrain</strong> (water, darkness, snow), the "black hole" approach: feels high, so you go low.</li>
<li><strong>Water refraction</strong> (rain on the windscreen): makes you feel higher, so you fly low.</li>
<li><strong>Haze</strong>: makes the runway seem farther away and you seem higher, so you fly low. Extremely clear air does the opposite (high approach). Flying into <strong>fog</strong> can feel like pitching up, so you steepen abruptly.</li>
<li><strong>Ground lighting</strong>: a road or lights can be mistaken for a runway; bright runway lights make it seem closer.</li></ul>`,
      viz: { type: "approachillusion" },
      body2: `<p><strong>Prevention</strong>: anticipate illusions at unfamiliar airports, especially at night or in bad weather; check airport information for slope, terrain and lighting; refer to the altimeter often; use VASI, PAPI or an electronic glideslope when available; recognize that emergencies and distractions raise the risk; and stay proficient at landings. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Visual illusions on approach and landing.", d: "Predict whether an illusion makes you high or low.", r: "Night and unfamiliar airports.", codes: ["PA.I.H.K1k"] } },

    { id: "mot", label: "Motion sickness and carbon monoxide · PHAK 17", title: "Queasy or poisoned?",
      body: `<p><strong>Motion sickness</strong> comes from conflicting messages between the inner ear, eyes and body. Symptoms: general discomfort, nausea, dizziness, paleness, sweating and vomiting. Open the fresh-air vents, look outside at a fixed point, and avoid unnecessary head movement. It usually goes away within the first few lessons, so tell your instructor if you're prone to it. Medications like Dramamine help passengers but are <strong>not recommended for pilots</strong> because they cause drowsiness. <span class="src">PHAK 17</span></p>`,
      body2: `<p><strong>Carbon monoxide</strong> is colorless and odorless. It attaches to hemoglobin about <strong>200 times</strong> more easily than oxygen (hypemic hypoxia), and the body needs up to <strong>48 hours</strong> to get rid of it. Heater and defrost vents can carry it into the cabin from a leaking exhaust (as with a muffler-shroud heater). Symptoms: headache, blurred vision, dizziness, drowsiness, loss of muscle power. <span class="src">PHAK 17</span></p>
<p>If you smell exhaust or feel any of these: <strong>heater off, fresh-air vents and windows open, oxygen if available</strong>, and land. Carry a CO detector, since dangerous levels can exist without any smell. <span class="src">PHAK 17</span></p>
<p><strong>Chemicals.</strong> Preflight means handling fuel, oil and sometimes hydraulic fluid. Know the first aid on each product's Safety Data Sheet (the PHAK calls it the MSDS). In general: flush eyes with clean water (fuel: at least 15 minutes, then medical attention right away), remove contaminated clothing and wash skin with mild soap and water, and move to fresh air if you breathe fumes. Seek medical attention if symptoms or irritation persist, and immediately if fuel or oil is swallowed. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Motion sickness and CO poisoning.", d: "Respond correctly to suspected CO.", r: "Using the cabin heat with an exhaust leak.", codes: ["PA.I.H.K1e", "PA.I.H.K1f"] } },

    { id: "stress", label: "Stress and fatigue · PHAK 17 · AIM 8-1-1", title: "Stress and fatigue",
      body: `<p><strong>Stress</strong> is the body's response to demands. <strong>Acute stress</strong> is an immediate threat response, and a little sharpens you. <strong>Chronic stress</strong> is unrelenting pressure (loneliness, money, relationships, work) that exceeds your ability to cope. Performance falls off sharply, and a pilot in that state shouldn't fly. <span class="src">PHAK 17</span></p>
<p><strong>Fatigue</strong> is one of the most treacherous hazards because you may not notice it until you make serious errors. <span class="src">AIM 8-1-1</span></p>
<ul><li><strong>Acute fatigue</strong> is short-term (exertion, excitement, lack of sleep) and is cured by rest and about 8 hours of sound sleep. <strong>Skill fatigue</strong> is a special kind: timing gets sloppy and attention narrows to the center while you neglect the periphery.</li>
<li><strong>Chronic fatigue</strong> lasts long, usually has psychological roots, and isn't fixed by diet and sleep alone. It needs a physician.</li></ul>
<p>If you're suffering from acute fatigue, stay on the ground. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Acute and chronic stress and fatigue.", d: "Recognize fatigue in yourself and ground yourself.", r: "Late-day flights; get-there-itis.", codes: ["PA.I.H.K1g", "PA.I.H.K1h"] } },

    { id: "dehyd", label: "Dehydration, heat, cold and nutrition · PHAK 17 · FAA Aeromedical Advisory", title: "Water, food and temperature",
      body: `<p><strong>Dehydration</strong> is a critical loss of water, from hot cockpits, wind, humidity and diuretics (coffee, tea, alcohol, caffeinated soda). Signs: headache, <strong>fatigue</strong> (the first noticeable effect), cramps, sleepiness, dizziness. <span class="src">PHAK 17</span></p>
<ul><li>Drink about <strong>2 to 4 quarts</strong> of water every 24 hours, as a guide.</li>
<li>Most people only feel thirst at about a <strong>1.5-quart deficit</strong> (2% of body weight), which is already too late.</li>
<li><strong>Heatstroke</strong> is the body's failure to control its temperature, and sometimes the first sign is collapse. Carry water and drink at intervals on long flights, about <strong>1 quart per hour</strong> in severe heat or <strong>1 pint per hour</strong> in moderate heat.</li></ul>
<p><span class="src">PHAK 17</span></p>`,
      body2: `<p><strong>Nutrition.</strong> Missing or postponing meals can cause low blood sugar: distraction, broken habit patterns and a short attention span. <span class="src">PHAK 17</span></p>
<p><strong>Hypothermia</strong> is a core body temperature that's too low. At first you only shiver, but as it falls you can be impaired while still feeling alert. Act early, even with a precautionary landing. Cabin heat helps but brings CO risk. Dress for the outside temperature and carry season-appropriate survival gear, since you may have to wait outside after a forced landing. <span class="src">FAA Aeromedical Advisory, FAA Safety Briefing</span></p>`,
      kdr: { k: "Dehydration, heatstroke, nutrition and hypothermia.", d: "Plan water, food and clothing for the flight.", r: "Summer heat; winter forced landing.", codes: ["PA.I.H.K1i", "PA.I.H.K1j"] } },

    { id: "eyes", label: "Vision in flight · PHAK 17 · AIM 8-1-6", title: "Seeing other airplanes",
      body: `<p>Vision is the most important sense for safe flight. Only a tiny central area of the retina, the <strong>fovea</strong>, sees sharp detail. An airplane you'd recognize at <strong>7 miles</strong> in foveal vision might have to be as close as <strong>0.7 miles</strong> before you'd spot it off to the side. <span class="src">AIM 8-1-6</span></p>
<p><strong>Scan</strong> in short, regular eye movements of <strong>no more than 10°</strong>, pausing <strong>at least 1 second</strong> on each area. Spend no more than about 4–5 seconds inside for every 16 seconds outside. <span class="src">AIM 8-1-6</span></p>
<ul><li><strong>Blind spot</strong>: where the optic nerve meets the retina, each eye has no rods or cones. Both eyes together cover it, but a windshield divider can hide a target from one eye while the blind spot hides it from the other. Move your head.</li>
<li><strong>Empty-field myopia</strong>: above clouds or in haze, with nothing to focus on, your eyes relax to 10–30 ft, so you look without seeing. Focus on distant objects or lights.</li>
<li>Day, dusk and night vision (photopic, mesopic and scotopic) are in the Night Operations lesson.</li></ul>
<p><span class="src">PHAK 17</span></p>`,
      body2: `<p><strong>Collision clues</strong>: a target with <strong>no relative motion</strong> that just grows larger is on a collision course. Clean the windshield, and remember most midair collisions happen in good weather, near airports and VORs. <span class="src">AIM 8-1-8</span></p>
<p><strong>Glare</strong>: sunglasses should pass about 15% of light (absorb at least 85%), with neutral color. <span class="src">AIM 8-1-6</span></p>`,
      kdr: { k: "Vision in flight, blind spot, empty-field myopia, scanning.", d: "Scan effectively and recognize a collision course.", r: "Heads-down time; haze; window posts.", codes: ["PA.I.H.K1k", "PA.I.H.R3"] } },

    { id: "dcs", label: "Scuba diving and DCS · PHAK 17 · AIM 8-1-2", title: "Diving, then flying",
      body: `<p>Diving pushes extra <strong>nitrogen</strong> into your tissues. Fly too soon and lower cabin pressure can let it come out as bubbles: <strong>decompression sickness</strong> (the bends: deep joint pain, tingling, and in serious cases neurological symptoms). <span class="src">PHAK 17</span></p>
<p>Wait before flying: <span class="src">PHAK 17 · AIM 8-1-2</span></p>
<ul><li>up to <strong>8,000 ft</strong> MSL: at least <strong>12 hours</strong> after a dive that didn't need a controlled ascent (non-decompression-stop), and at least <strong>24 hours</strong> after one that did</li>
<li>above <strong>8,000 ft</strong>: at least <strong>24 hours</strong> after any dive.</li></ul>
<p>These are actual flight altitudes, not cabin altitudes. Symptoms can appear even after you land. If DCS occurs in flight: 100% oxygen if available, emergency descent and land as soon as possible, and get medical evaluation even if the symptoms go away. <span class="src">PHAK 17</span></p>`,
      kdr: { k: "Dissolved nitrogen after scuba diving.", d: "Plan a flight after a dive.", r: "Flying home the same day as a dive trip.", codes: ["PA.I.H.K1l"] } },
  ],
};
