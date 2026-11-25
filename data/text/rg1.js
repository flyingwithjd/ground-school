export default {
  sections: [
    { id: "elig", label: "Eligibility · 14 CFR 61.83, 61.23", title: "Sixteen, English and a medical",
      body: `<p>For airplanes, you must be at least 16 and able to read, speak, write and understand English. <span class="src">14 CFR 61.83</span> To act as pilot in command, you need at least a third-class medical certificate, unless you fly under the BasicMed conditions of 61.113(i). Under 40, a third class lasts 60 calendar months; at 40 or older, 24. <span class="src">14 CFR 61.23</span></p>
<p>Your student pilot certificate and medical must be on you or readily accessible in the aircraft. <span class="src">14 CFR 61.3</span></p>`,
      kdr: { k: "Certification requirements and medical certificates.", d: "Present your certificate and medical.", r: "Flying without valid documents.", codes: ["PA.I.A.K1", "PA.I.A.K3", "PA.I.A.K4"] } },
    { id: "solo", label: "Solo · 14 CFR 61.87", title: "Three gates before you solo",
      body: `<p><b>Knowledge.</b> Your instructor gives a test on Parts 61 and 91, the solo airport's airspace and procedures, and your airplane's flight characteristics and limits. Your instructor then reviews every wrong answer with you. <span class="src">61.87(b)</span></p>
<p><b>Training.</b> You receive and log the 15 pre-solo items in 61.87(d): from flight preparation and runups through stalls, emergencies, slips and go-arounds. <span class="src">61.87(c), (d)</span></p>
<p><b>Endorsement.</b> Your logbook gets an endorsement for the make and model from an instructor who trained you within the last 90 days. It must be renewed every 90 days. Night solo needs its own training and endorsement. <span class="src">61.87(n), (o), (p)</span></p>`,
      kdr: { k: "Solo requirements and endorsements.", d: "Check that your endorsements are current.", r: "Proficiency versus currency.", codes: ["PA.I.A.K1", "PA.I.A.K2", "PA.I.A.R1"] } },
    { id: "lim", label: "Limits · 14 CFR 61.89", title: "What a student can't do",
      body: `<p>Tap each item. In Recall mode, say the item before you tap it. <span class="src">14 CFR 61.89(a)</span></p>`,
      viz: { type: "mnemo", opts: { set: "limits" } },
      body2: `<p>On a solo cross-country, carry your logbook and your student pilot certificate. The FAA, the NTSB and law enforcement may ask to see them. <span class="src">14 CFR 61.51(i)</span></p>`,
      kdr: { k: "Student privileges and limitations.", d: "Plan flights that stay within your limits.", r: "Flying outside your endorsed limits.", codes: ["PA.I.A.K2", "PA.I.A.K4", "PA.I.A.R1"] } },
    { id: "scn", label: "Scenarios · ACS", title: "What would you do?",
      body: `<p>Two made-up situations, each with two decisions. Pick what you would do, then read why. There's often more than one safe answer; the card shows the best one and the reasons. <span class="src">FAA-S-ACS-6C · PHAK 2</span></p>`,
      viz: { type: "scenario", opts: { set: "rg1" } },
      body2: `<p>Talk each one through out loud, then ask your CFI to run a version at your own airport, with your airplane's POH numbers.</p>`,
      kdr: { k: "Student pilot rule decisions.", d: "Apply 61.87 and 61.89 to your next solo.", r: "Solo outside your limits.", codes: ["PA.II.A.R4", "PA.I.D.R1", "PA.I.D.R3", "PA.I.C.R1"] } },
  ],
};
