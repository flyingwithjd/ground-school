// Course structure, in syllabus order. Content lives in data/lessons and data/modules.
// To add Stage 2-4 later: write lesson files with the same schema, import them in data/index.js, and list their ids here.
export const STAGES = [
  { id: "s1", n: 1, title: "Stage 1", sub: "Pre-solo foundations", ground: ["gl1", "gl2", "gl3", "gl4", "gl5", "gl6"], flight: ["fl1", "fl2", "fl3", "fl4", "fl5", "fl6", "fl7"] },
  { id: "s2", n: 2, title: "Stage 2", sub: "Weather foundations. Preview: more of Stage 2 arrives later.", ground: ["gl7", "gl8"], flight: [], preview: true },
];
export const MODULES = [
  { id: "airport", title: "Airport", sub: "Runways, markings, signs, lights and the pattern", units: ["ap1", "ap2", "ap3", "ap4", "ap5", "ap6", "ap7"], partOf: "gl4" },
  { id: "wind", title: "Wind", sub: "Components, drift, shear, wake and density altitude", units: ["wx1", "wx2", "wx3", "wx4"] },
  { id: "radio", title: "Radio", sub: "Phonetics, CTAF calls and a fill-in drill", units: ["rc1"] },
  { id: "regs", title: "Regulations", sub: "Student limits, airworthiness, preflight rules", units: ["rg1", "rg2", "rg3"] },
  { id: "emerg", title: "Emergencies", sub: "Engine failure, fire, electrical, chair-flying", units: ["em1", "em2"] },
  { id: "adm", title: "Decisions", sub: "PAVE, IMSAFE, DECIDE, 3P and scenario drills", units: ["ad1", "ad2"] },
  { id: "flows", title: "Flows", sub: "Checklists, flows and the order things happen", units: ["fw1"] },
  { id: "mnemo", title: "Mnemonics", sub: "Memory aids and the reasoning behind them", units: ["mn1"] },
];
export const STAGE_CHECK = { s1: { id: "gl6", pool: ["gl1", "gl2", "gl3", "gl4", "gl5", "ap1", "ap2", "ap3", "ap4", "ap5", "ap6", "ap7", "wx1", "wx2", "wx3", "wx4", "rg1", "rg2", "rg3"], n: 40, minutes: 60, pass: 0.7 } };
