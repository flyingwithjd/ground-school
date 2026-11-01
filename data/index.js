// Gathers every lesson/module file into lookup tables used by the learning engine.
import { STAGES, MODULES } from "./course.js?v=053e7723ad";
import gl1 from "./lessons/gl1.js?v=053e7723ad"; import gl2 from "./lessons/gl2.js?v=053e7723ad"; import gl3 from "./lessons/gl3.js?v=053e7723ad"; import gl4 from "./lessons/gl4.js?v=053e7723ad"; import gl5 from "./lessons/gl5.js?v=053e7723ad"; import gl6 from "./lessons/gl6.js?v=053e7723ad";
import fl1 from "./lessons/fl1.js?v=053e7723ad"; import fl2 from "./lessons/fl2.js?v=053e7723ad"; import fl3 from "./lessons/fl3.js?v=053e7723ad"; import fl4 from "./lessons/fl4.js?v=053e7723ad"; import fl5 from "./lessons/fl5.js?v=053e7723ad"; import fl6 from "./lessons/fl6.js?v=053e7723ad"; import fl7 from "./lessons/fl7.js?v=053e7723ad";
import gl7 from "./lessons/gl7.js?v=053e7723ad"; import gl8 from "./lessons/gl8.js?v=053e7723ad";
import airport from "./modules/airport.js?v=053e7723ad"; import wind from "./modules/wind.js?v=053e7723ad"; import radio from "./modules/radio.js?v=053e7723ad"; import regs from "./modules/regs.js?v=053e7723ad";
import emerg from "./modules/emerg.js?v=053e7723ad"; import adm from "./modules/adm.js?v=053e7723ad"; import flows from "./modules/flows.js?v=053e7723ad"; import mnemo from "./modules/mnemo.js?v=053e7723ad";
const ALL = [gl1, gl2, gl3, gl4, gl5, gl6, fl1, fl2, fl3, fl4, fl5, fl6, fl7, gl7, gl8, ...airport, ...wind, ...radio, ...regs, ...emerg, ...adm, ...flows, ...mnemo];
export const LESSONS = {}; export const QUESTIONS = {}; export const ORAL = {}; export const TOPICS = {};
for (const L of ALL) {
  if (LESSONS[L.id]) console.error("duplicate lesson", L.id); LESSONS[L.id] = L;
  for (const [tid, title] of Object.entries(L.topics || {})) TOPICS[tid] = { id: tid, title, lesson: L.id };
  for (const q of L.questions || []) { if (QUESTIONS[q.id]) console.error("duplicate question id", q.id); if (!TOPICS[q.t]) console.warn("unknown topic", q.t, q.id); QUESTIONS[q.id] = { ...q, lesson: L.id }; }
  for (const o of L.oral || []) { if (ORAL[o.id]) console.error("duplicate oral id", o.id); ORAL[o.id] = { ...o, lesson: L.id, kind: "oral" }; }
}
for (const m of MODULES) for (const u of m.units) if (LESSONS[u]) LESSONS[u].module = m.id;
export const SYLLABUS = STAGES.flatMap((s) => [...s.ground, ...s.flight].map((id) => ({ id, stage: s.id })));
// Recommended order interleaves ground and flight like a Part 141 syllabus: each flight lesson follows the ground it depends on.
export const ORDER = ["gl1", "fl1", "gl2", "gl3", "fl2", "fl3", "gl4", "ap1", "ap2", "ap3", "ap4", "ap5", "ap6", "ap7", "wx1", "wx2", "wx3", "fl4", "fl5", "gl5", "wx4", "fl6", "rg1", "rg2", "rg3", "rc1", "em1", "em2", "ad1", "ad2", "fw1", "mn1", "gl6", "fl7", "gl7", "gl8"];
export const item = (id) => QUESTIONS[id] || ORAL[id];
export function lessonItems(id, { deep = true, oral = true } = {}) { const L = LESSONS[id]; if (!L) return [];
  let ids = (L.questions || []).map((q) => q.id); if (oral) ids = ids.concat((L.oral || []).map((o) => o.id));
  if (deep && L.includes) L.includes.forEach((u) => (ids = ids.concat(lessonItems(u, { deep, oral })))); return ids; }
