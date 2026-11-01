export default {
  sections: [
    { id: "eq", label: "Equipment · 14 CFR 91.205", title: "Day: ATOMATOFLAMES. Night: FLAPS.",
      body: `<p>For day VFR, 91.205(b) lists the required instruments and equipment. Night VFR adds 91.205(c). Several items apply only to some airplanes, like manifold pressure for altitude engines or a gear indicator for retractable gear. Tap through both lists. <span class="src">14 CFR 91.205</span></p>`,
      viz: { type: "mnemo", opts: { sets: ["atomato", "flaps"] } },
      body2: `<p>If something isn't working and it isn't on these lists, you still need a legal way to fly without it: an approved MEL, or the inoperative-equipment rules. Ask your CFI how your school handles this. <span class="src">ACS PA.I.B.K3a</span></p>`,
      kdr: { k: "Equipment requirements for day and night VFR.", d: "Determine whether required equipment works.", r: "Inoperative equipment.", codes: ["PA.I.B.K3", "PA.I.B.K3a", "PA.II.B.R2"] } },
    { id: "pre", label: "Preflight action · 14 CFR 91.103", title: "Know everything about the flight",
      body: `<p>Before every flight, become familiar with all available information. For any flight, that includes runway lengths and takeoff and landing distances. For a flight under IFR or away from the airport, add weather reports and forecasts, fuel requirements, alternatives and known ATC delays. <span class="src">14 CFR 91.103</span></p>`,
      kdr: { k: "Preflight action.", d: "Gather the information for the flight.", r: "Departing without key information.", codes: ["PA.I.C.K1", "PA.II.A.K4", "PA.II.A.R3"] } },
    { id: "fuel", label: "Fuel · 14 CFR 91.151", title: "Land with fuel left over",
      body: `<p>Day VFR: enough fuel to reach your first point of intended landing, then fly 30 more minutes at normal cruise. At night: 45 minutes. Wind and forecast weather count. These are legal minimums. <span class="src">14 CFR 91.151</span></p>`,
      kdr: { k: "Fuel requirements.", d: "Plan fuel with reserves.", r: "Fuel exhaustion.", codes: ["PA.I.F.K2a", "PA.II.A.R2"] } },
    { id: "alc", label: "Alcohol · 14 CFR 91.17", title: "Eight hours is the minimum",
      body: `<p>No acting as a crewmember within 8 hours of drinking alcohol, while under the influence, at 0.04 or more, or while using any drug that affects your faculties. Don't carry a passenger who appears intoxicated, except in an emergency. <span class="src">14 CFR 91.17</span></p>
<p>The PHAK's IMSAFE checklist asks about the last 24 hours, because as little as one beer can impair flying skills. <span class="src">PHAK Ch 2</span></p>`,
      kdr: { k: "Alcohol and drug regulations.", d: "Assess your own fitness.", r: "Impairment.", codes: ["PA.I.H.K2", "PA.I.H.K3", "PA.I.H.S2"] } },
    { id: "alt", label: "Minimum altitudes · 14 CFR 91.119", title: "Always leave room to glide",
      body: `<p>Anywhere: high enough to make an emergency landing without undue hazard if the engine quits. Over congested areas: 1,000 ft above the highest obstacle within 2,000 ft. Elsewhere: 500 ft above the surface; over open water or sparsely populated areas, no closer than 500 ft to any person, vessel, vehicle or structure. Takeoff and landing are excepted. <span class="src">14 CFR 91.119</span></p>`,
      kdr: { k: "Minimum safe altitudes.", d: "Plan altitudes that leave a place to land.", r: "Low-altitude maneuvering.", codes: ["PA.IX.B.R1", "PA.IX.B.R5"] } },
  ],
};
