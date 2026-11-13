// GL6 lesson text · Stage 1 check. Structure: 14 CFR Part 141 App. B; ACS FAA-S-ACS-6C.
export default {
  sections: [
    { id: "what", label: "Stage check · 14 CFR 141", title: "What a stage check is",
      body: `<p>A Part 141 course is split into stages. At the end of each, a different instructor (often the chief instructor or a check instructor) confirms you met the stage objectives before you move on. <span class="src">14 CFR Part 141 App. B</span></p>\n<p>Stage 1 covers the airplane, its systems and limits, aerodynamics, airport operations, weight and balance and performance, plus basic rules for student pilots. The check usually has a knowledge test and an oral discussion.</p>`,
      kdr: { k: "Everything in GL1–GL5 and the Stage 1 units.", d: "Explain it in your own words and apply it to a scenario.", r: "Knowing answers without knowing why.", codes: ["PA.I.F.K1", "PA.I.G.K1"] } },
    { id: "how", label: "How to use this", title: "Practice like the real one",
      body: `<p><strong>Timed written.</strong> <a href="#/check/s1/written">Start the Stage 1 written</a>: 40 questions from every Stage 1 lesson and unit, 60 minutes. <strong>80% passes.</strong> There's no feedback until the end; then every miss is listed with its explanation and source, and fed into your review schedule.</p>
<p><strong>Rate every answer.</strong> After each question, tap how sure you were. A miss you were Certain about becomes a blind spot right away, so the check shows where you are overconfident, not just what you missed.</p>
<p><strong>Mixed questions.</strong> The next step mixes topics on purpose, the way an examiner connects them. Mixed practice feels harder than lesson-by-lesson practice, and that's what makes it stick.</p>
<p class="note">Your school's syllabus sets the real format and who gives the check. Use this to find your weak spots first.</p>`,
      kdr: { k: "Your blind spots.", d: "Score 80% or better on the timed written, then review every miss.", r: "Over-confidence: check the progress map for topics marked confident but wrong.", codes: ["PA.I.H.R4"] } },
  ],
};
