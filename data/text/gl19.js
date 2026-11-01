// GL19 lesson text · Stage 4 check. Structure: 14 CFR Part 141 App. B; ACS FAA-S-ACS-6C.
export default {
  sections: [
    { id: "what", label: "Stage check · 14 CFR 141", title: "What the end-of-course test is",
      body: `<p>The end-of-course test covers the whole ground course. Part 141 courses end with a final knowledge test and, at many schools, an oral review. Its purpose is to get you ready for the FAA private pilot knowledge test and the oral part of the practical test, which follows the ACS. <span class="src">14 CFR Part 141 App. B · FAA-S-ACS-6C</span></p>\n<p>To take the FAA knowledge test you need an endorsement from an authorized instructor certifying you completed the required ground training or home study and are prepared. The FAA sets the minimum passing grade. Aim for 80% or better here, then review every miss. <span class="src">14 CFR 61.35</span></p>`,
      kdr: { k: "Everything in the whole course (Stages 1–3).", d: "Explain it in your own words and apply it to a scenario.", r: "Knowing answers without knowing why.", codes: ["PA.I.A.K1", "PA.I.H.K4"] } },
    { id: "how", label: "How to use this", title: "Practice like the real one",
      body: `<p><strong>Timed written.</strong> <a href="#/check/s4/written">Start the end-of-course written</a>: 60 questions across the whole course, 120 minutes. <strong>80% passes.</strong> There's no feedback until the end; then every miss is listed with its explanation and source, and fed into your review schedule.</p>
<p><strong>Oral.</strong> <a href="#/check/s4/oral">Start the oral</a>: 20 ACS-keyed prompts. Answer out loud before you reveal the model answer, then grade yourself honestly. "Partly" counts as a miss.</p>
<p><strong>Mixed questions.</strong> The next step mixes topics on purpose, the way an examiner connects them. Mixed practice feels harder than lesson-by-lesson practice, and that's what makes it stick.</p>
<p class="note">Your school's syllabus sets the real format and who gives the check. Use this to find your weak spots first.</p>`,
      kdr: { k: "Your blind spots.", d: "Score 80% or better on the timed written, then review every miss.", r: "Over-confidence: check the progress map for topics marked confident but wrong.", codes: ["PA.I.H.R4"] } },
  ],
};
