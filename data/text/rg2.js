export default {
  sections: [
    { id: "pic", label: "PIC · 14 CFR 91.3, 91.7", title: "You are the final authority",
      body: `<p>The pilot in command is directly responsible for the flight and is its final authority. In an emergency that needs immediate action, you may deviate from any Part 91 rule as needed; the FAA may ask for a written report. <span class="src">14 CFR 91.3</span></p>
<p>You decide whether the airplane is in condition for safe flight, and you discontinue the flight when it isn't. A signed annual doesn't make that decision for you. <span class="src">14 CFR 91.7</span></p>`,
      kdr: { k: "Pilot-in-command responsibilities.", d: "Determine the airplane is airworthy.", r: "Accepting an unairworthy airplane.", codes: ["PA.I.B.K1e", "PA.I.B.S2", "PA.II.A.K2"] } },
    { id: "docs", label: "Documents · ARROW", title: "Paper in the airplane",
      body: `<p>ARROW lists what must be on board. Tap each letter for the rule behind it. <span class="src">14 CFR 91.203, 91.9; PHAK Ch 9</span></p>`,
      viz: { type: "mnemo", opts: { set: "arrow" } },
      kdr: { k: "Location and expiration of required certificates.", d: "Locate the airworthiness and registration documents.", r: "Missing documents.", codes: ["PA.I.B.K1a", "PA.I.B.S1", "PA.I.B.K4"] } },
    { id: "insp", label: "Inspections · AV1ATE", title: "What the logbooks must show",
      body: `<p>AV1ATE lists the inspections. For VFR in a training airplane, the annual, 100-hour, transponder and ELT apply. The VOR and altimeter/static checks are for IFR. <span class="src">14 CFR 91.207, 91.409, 91.411, 91.413</span></p>`,
      viz: { type: "mnemo", opts: { set: "av1ate" } },
      body2: `<p>Ask to see the logbooks, or the school's status sheet, before you fly. Your CFI will show you where each entry is.</p>`,
      kdr: { k: "Required inspections and logbook documentation.", d: "Verify the inspections are current.", r: "Flying an airplane with lapsed inspections.", codes: ["PA.I.B.K1b", "PA.I.B.S2", "PA.II.A.R2"] } },
  ],
};
