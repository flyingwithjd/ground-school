export default {
  sections: [
    { id: "comp", label: "Components · PHAK 16", title: "Along it and across it",
      body: `<p>Split the wind into two parts. The part along the runway is <strong>headwind</strong> (or tailwind): wind × cos(angle). The part across it is <strong>crosswind</strong>: wind × sin(angle). At 30° off, the crosswind is half the wind; at 45°, about 0.7; at 60°, about 0.9. <span class="src">PHAK Ch 16</span></p>
<p>Move the wind and watch the points of light and the vectors.</p>`,
      viz: { type: "xwind", opts: { rwy: 270, wind: 300, kt: 20 } },
      kdr: { k: "Wind effects on takeoff and landing.", d: "Compute the crosswind before every takeoff and landing.", r: "Crosswind beyond your ability.", codes: ["PA.IV.A.K1", "PA.IV.B.K3", "PA.IV.A.R2a"] } },
    { id: "lim", label: "Demonstrated crosswind · C172S POH 1, 4", title: "A number, not a limit",
      body: `<p>The C172S maximum demonstrated crosswind is 15 kt for landing with full flaps and 20 kt for takeoff or landing with flaps 10°. The POH defines it as the crosswind for which adequate control was demonstrated in certification, and says it is <strong>not considered limiting</strong>. Your skill, your solo endorsement and your personal minimums set your real limit. <span class="src">C172S POH 1, 4; 14 CFR 61.87</span></p>`,
      viz: { type: "xwind", opts: { rwy: 180, wind: 240, kt: 18 } },
      kdr: { k: "Airplane limitations and personal minimums.", d: "Choose the runway with the least crosswind.", r: "Selecting a runway beyond the airplane's or pilot's capability.", codes: ["PA.IV.A.R1", "PA.I.H.S2"] } },
    { id: "perf", label: "Wind and distance · C172S POH 5", title: "Tailwinds cost a lot",
      body: `<p>The C172S takeoff and landing charts say: decrease distances 10% for each 9 kt of headwind; with tailwinds up to 10 kt, increase distances 10% for each 2 kt. A small tailwind costs much more than the same headwind saves. <span class="src">C172S POH 5</span></p>`,
      viz: { type: "perf" },
      kdr: { k: "Using performance charts with wind.", d: "Apply the wind corrections.", r: "Tailwind takeoffs on short runways.", codes: ["PA.I.F.K1", "PA.I.F.K2a"] } },
  ],
};
