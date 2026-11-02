// Course structure, in syllabus order: a 19-lesson, 4-stage private pilot ground course modeled on
// 14 CFR Part 141 Appendix B and keyed to the Private Pilot ACS (FAA-S-ACS-6C). Content lives in data/lessons and data/modules.
// Module units (Airport, Wind, Radio, Rules, Emergencies, Decisions, Flows) are taught inside the ground lesson listed in `partOf`.
export const STAGES = [
  { id: "s1", n: 1, title: "Stage 1", sub: "The airplane, aerodynamics, airports, weight and performance", ground: ["gl1", "gl2", "gl3", "gl4", "gl5", "gl6"], flight: ["fl1", "fl2", "fl3", "fl4", "fl5", "fl6", "fl7"] },
  { id: "s2", n: 2, title: "Stage 2", sub: "Weather, emergencies, airspace and the rules. Ends with the pre-solo written and first solo.", ground: ["gl7", "gl8", "gl9", "gl10", "gl11", "gl12"], flight: [] },
  { id: "s3", n: 3, title: "Stage 3", sub: "Instruments, navigation, night, decision making and aeromedical factors", ground: ["gl13", "gl14", "gl15", "gl16", "gl17", "gl18"], flight: [] },
  { id: "s4", n: 4, title: "Stage 4", sub: "End-of-course review and exam", ground: ["gl19"], flight: [] },
];
export const MODULES = [
  { id: "airport", title: "Airport", sub: "Runways, markings, signs, lights and the pattern", units: ["ap1", "ap2", "ap3", "ap4", "ap5", "ap6", "ap7"], partOf: "gl4" },
  { id: "wind", title: "Wind", sub: "Components, drift, shear, wake and density altitude", units: ["wx1", "wx2", "wx3", "wx4"], partOf: "gl4" },
  { id: "radio", title: "Radio", sub: "Phonetics, CTAF calls and a fill-in drill", units: ["rc1"], partOf: "gl4" },
  { id: "regs", title: "Regulations", sub: "Student limits, airworthiness, preflight rules", units: ["rg1", "rg2", "rg3"], partOf: "gl11" },
  { id: "emerg", title: "Emergencies", sub: "Engine failure, fire, electrical, chair-flying", units: ["em1", "em2"], partOf: "gl9" },
  { id: "adm", title: "Decisions", sub: "PAVE, IMSAFE, DECIDE, 3P and scenario drills", units: ["ad1", "ad2"], partOf: "gl16" },
  { id: "flows", title: "Flows", sub: "Checklists, flows and the order things happen", units: ["fw1"], partOf: "gl1" },
  { id: "vspeeds", title: "V-speeds", sub: "Every V-speed on the airspeed indicator, and the ones not on it", units: ["vs1"], partOf: "gl2" },
  { id: "mnemo", title: "Mnemonics", sub: "Memory aids and the reasoning behind them", units: ["mn1"] },
];
// Stage checks. Written: drawn across every lesson in the pool, weighted by bank size. Oral: ACS-style explain prompts, self-graded.
// The syllabus completion standard is 80% with every miss reviewed; misses feed the review schedule.
const S1 = ["gl1", "gl2", "vs1", "gl3", "gl4", "gl5", "fw1", "ap1", "ap2", "ap3", "ap4", "ap5", "ap6", "ap7", "wx1", "wx2", "wx3", "wx4", "rc1"];
const S2 = ["gl7", "gl8", "gl9", "gl10", "gl11", "em1", "em2", "rg1", "rg2", "rg3"];
const S3 = ["gl13", "gl14", "gl15", "gl16", "gl17", "ad1", "ad2", "mn1"];
export const STAGE_CHECK = {
  s1: { id: "gl6", title: "Stage 1 check", covers: "GL1–GL5", pool: [...S1, "gl6"], n: 40, minutes: 60, pass: 0.8, oralN: 12 },
  s2: { id: "gl12", title: "Stage 2 check", covers: "GL7–GL11", pool: [...S2, "gl12"], n: 40, minutes: 60, pass: 0.8, oralN: 12 },
  s3: { id: "gl18", title: "Stage 3 check", covers: "GL13–GL17", pool: [...S3, "gl18"], n: 40, minutes: 60, pass: 0.8, oralN: 12 },
  s4: { id: "gl19", title: "End-of-course exam", covers: "Stages 1–3", pool: [...S1, "gl6", ...S2, "gl12", ...S3, "gl18", "gl19"], n: 60, minutes: 120, pass: 0.8, oralN: 20 },
};
