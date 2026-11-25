// Phase 2 batches (Nov 2026): new pages' topics and questions, merged into their lessons by data/index.js. Ids are permanent.
// GL14 calc: time, speed, distance and fuel; the 91.151 reserve; flight computers at the knowledge test.
// Sources: PHAK FAA-H-8083-25C ch 16; 14 CFR 91.151; FAA-G-ACS-2 (acceptable test materials).
const Q = (id, t, sec, q, c, why, src) => ({ id, t, sec, q, c, a: 0, why, src });
export default {
  topics: {
    gl14: { "gl14.calc": "Time, speed, distance and fuel" },
  },
  questions: {
    gl14: [
      Q("gl14p-01", "gl14.calc", "calc", "How long will 135 NM take at a groundspeed of 90 knots?", ["1 hour 30 minutes", "1 hour 15 minutes", "1 hour 45 minutes", "2 hours 5 minutes"], "Time = distance ÷ groundspeed: 135 ÷ 90 = 1.5 hours, which is 1 hour 30 minutes.", "PHAK 16"),
      Q("gl14p-02", "gl14.calc", "calc", "You pass two checkpoints 24 NM apart in 16 minutes. Your groundspeed is", ["90 knots", "96 knots", "80 knots", "150 knots"], "Groundspeed = distance ÷ time: 16 minutes is 16/60 of an hour, and 24 ÷ (16/60) = 90 knots.", "PHAK 16"),
      Q("gl14p-03", "gl14.calc", "calc", "A leg takes 1 hour 20 minutes at a fuel burn of 9 gallons per hour. How much fuel does it use?", ["12 gallons", "10.8 gallons", "11 gallons", "13.5 gallons"], "Fuel = time × burn: 1 h 20 min is 1.33 hours, and 1.33 × 9 = 12 gallons.", "PHAK 16"),
      Q("gl14p-04", "gl14.calc", "calc", "Flying VFR by day, how much fuel beyond what reaches your first point of intended landing must you plan for?", ["Enough for 30 minutes at normal cruise", "Enough for 45 minutes at normal cruise", "Enough to reach an alternate airport", "Enough for 1 hour at normal cruise"], "91.151: by day, enough to fly after that for at least 30 minutes at normal cruising speed; at night, 45 minutes. An alternate is an IFR requirement.", "14 CFR 91.151"),
      Q("gl14p-05", "gl14.calc", "calc", "A night VFR trip needs 14 gallons to reach the destination at 8 gallons per hour. The least fuel you must plan for is", ["20 gallons", "18 gallons", "22 gallons", "16 gallons"], "At night the reserve is 45 minutes: 0.75 h × 8 gal/h = 6 gallons, so 14 + 6 = 20 gallons.", "14 CFR 91.151"),
      Q("gl14p-06", "gl14.calc", "calc", "Your true airspeed is 110 knots with a 20-knot headwind. How long will a 75 NM leg take?", ["50 minutes", "41 minutes", "38 minutes", "56 minutes"], "Use groundspeed, not true airspeed: 110 − 20 = 90 knots, and 75 ÷ 90 = 0.83 h ≈ 50 minutes. Using 110 knots gives 41 minutes, which is wrong.", "PHAK 16"),
      Q("gl14p-07", "gl14.calc", "calc", "On the E6B's computer side, the rate arrow (60) is set under the groundspeed. You then read", ["Minutes on the inner scale, under each distance", "Fuel on the inner scale, under the true airspeed", "The wind correction angle, under the true course", "Distance on the inner scale, under the groundspeed"], "The rate arrow marks one hour. With it under the groundspeed, each distance on the outer scale lines up with its time in minutes on the inner scale.", "PHAK 16"),
      Q("gl14p-08", "gl14.calc", "calc", "Which aid may you use at the FAA knowledge test?", ["A flight computer, its memory cleared first", "An E6B app on your phone, in airplane mode", "Your own printed sheet of formulas", "A tablet with an EFB app and no signal"], "Navigation computers and aviation calculators are allowed if their memory is erased in front of the proctor. Phones, tablets and your own written notes are not.", "FAA-G-ACS-2"),
    ],
  },
};
