// FL11 · Basic attitude instrument flying (briefing). Phase 2 flight unit, Stage 3: control and performance, the scan,
// the four basic maneuvers, unusual attitudes and the 180° turn out of clouds.
// Sources: FAA-H-8083-15B (Instrument Flying Handbook) ch 4–6; AFH FAA-H-8083-3C ch 18; ACS FAA-S-ACS-6C PA.VIII.
const Q = (id, t, sec, q, c, why, src) => ({ id, t, sec, q, c, a: 0, why, src });
export default {
  id: "fl11", code: "FL11", stage: 3, kind: "flight", title: "Basic Attitude Instrument Flying", short: "Control and performance, the scan, straight-and-level, climbs, descents and turns by instruments, unusual attitudes and the 180° turn out of clouds",
  intro: "If you lose the horizon, the instruments keep you upright. Set an attitude, check the result, and get back to visual conditions.",
  refs: ["FAA-H-8083-15B Ch 4–6", "AFH Ch 18", "ACS PA.VIII"],
  topics: { "fl11.cp": "Control and performance", "fl11.man": "Basic instrument maneuvers", "fl11.ua": "Unusual attitudes", "fl11.t180": "The 180° turn" },
  questions: [
    Q("fl11-01", "fl11.cp", "cp", "In the control and performance method, the control instruments are", ["The attitude indicator and the power gauge", "The altimeter and airspeed indicator", "The heading indicator and VSI", "The turn coordinator and compass"], "Set an attitude on the attitude indicator and a power setting on the tachometer or manifold pressure gauge; then read the result on the performance instruments.", "FAA-H-8083-15B ch 4"),
    Q("fl11-02", "fl11.cp", "cp", "Staring at one instrument while the others drift is called", ["Fixation", "Omission", "Emphasis", "Interpretation"], "Fixation is the classic scan error. Omission leaves an instrument out of the scan; emphasis relies on one instrument you trust most.", "FAA-H-8083-15B ch 4"),
    Q("fl11-03", "fl11.cp", "cp", "During the scan, which instrument do you look at most often?", ["The attitude indicator", "The magnetic compass", "The clock", "The tachometer"], "In the radial scan your eyes return to the attitude indicator between each check of another instrument.", "FAA-H-8083-15B ch 4"),
    Q("fl11-04", "fl11.man", "man", "The ACS tolerances for straight-and-level flight by instruments are", ["Altitude ±200 ft, heading ±20°, airspeed ±10 kt", "Altitude ±100 ft, heading ±10°, airspeed ±5 kt", "Altitude ±50 ft, heading ±5°, airspeed ±5 kt", "Altitude ±300 ft, heading ±30°, airspeed ±15 kt"], "PA.VIII.A.S2. Turns to headings add a rollout on the assigned heading ±10° at standard rate.", "ACS PA.VIII.A"),
    Q("fl11-05", "fl11.man", "man", "A standard-rate turn is", ["3° per second, 360° in 2 minutes", "1.5° per second", "6° per second", "A 30° bank at any speed"], "Standard rate is 3° per second; the turn coordinator's index marks show it. The bank it takes depends on airspeed.", "FAA-H-8083-15B ch 5"),
    Q("fl11-06", "fl11.ua", "ua", "Recovering from a nose-high unusual attitude, you first", ["Add power", "Pull back on the yoke", "Reduce power", "Level the wings"], "Nose high: add power, lower the nose to prevent a stall, then level the wings and return to the original attitude.", "FAA-H-8083-15B ch 5"),
    Q("fl11-07", "fl11.ua", "ua", "Recovering from a nose-low, banked unusual attitude, you", ["Reduce power, level the wings, then raise the nose", "Raise the nose first, then level the wings", "Add power and pull up", "Lower the nose further"], "Nose low: reduce power, level the wings with coordinated aileron and rudder, then raise the nose smoothly. Pulling while banked tightens a spiral.", "FAA-H-8083-15B ch 5"),
    Q("fl11-08", "fl11.t180", "t180", "Flying a 180° turn out of cloud without instrument training, the AFH advises", ["No more than 10° of bank, holding altitude", "A 45° bank to finish quickly", "A climbing turn at full power", "A steep descent below the clouds"], "Keep turns shallow and smooth, no more than 10° of bank, a few degrees at a time, and hold altitude.", "AFH 18"),
    Q("fl11-09", "fl11.t180", "t180", "At about 100 knots, a standard-rate turn needs a bank of about", ["15°", "5°", "30°", "45°"], "Bank for standard rate ≈ TAS ÷ 10 + 7, or 15–17° at 100 knots.", "FAA-H-8083-15B ch 5"),
  ],
};
