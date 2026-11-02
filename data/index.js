// Gathers every lesson/module file into lookup tables used by the learning engine.
import { STAGES, MODULES } from "./course.js?v=e7b6cbaa08";
import gl1 from "./lessons/gl1.js?v=e7b6cbaa08"; import gl2 from "./lessons/gl2.js?v=e7b6cbaa08"; import gl3 from "./lessons/gl3.js?v=e7b6cbaa08"; import gl4 from "./lessons/gl4.js?v=e7b6cbaa08"; import gl5 from "./lessons/gl5.js?v=e7b6cbaa08"; import gl6 from "./lessons/gl6.js?v=e7b6cbaa08";
import fl1 from "./lessons/fl1.js?v=e7b6cbaa08"; import fl2 from "./lessons/fl2.js?v=e7b6cbaa08"; import fl3 from "./lessons/fl3.js?v=e7b6cbaa08"; import fl4 from "./lessons/fl4.js?v=e7b6cbaa08"; import fl5 from "./lessons/fl5.js?v=e7b6cbaa08"; import fl6 from "./lessons/fl6.js?v=e7b6cbaa08"; import fl7 from "./lessons/fl7.js?v=e7b6cbaa08";
import gl7 from "./lessons/gl7.js?v=e7b6cbaa08"; import gl8 from "./lessons/gl8.js?v=e7b6cbaa08"; import gl9 from "./lessons/gl9.js?v=e7b6cbaa08"; import gl10 from "./lessons/gl10.js?v=e7b6cbaa08"; import gl11 from "./lessons/gl11.js?v=e7b6cbaa08"; import gl12 from "./lessons/gl12.js?v=e7b6cbaa08";
import gl13 from "./lessons/gl13.js?v=e7b6cbaa08"; import gl14 from "./lessons/gl14.js?v=e7b6cbaa08"; import gl15 from "./lessons/gl15.js?v=e7b6cbaa08"; import gl16 from "./lessons/gl16.js?v=e7b6cbaa08"; import gl17 from "./lessons/gl17.js?v=e7b6cbaa08"; import gl18 from "./lessons/gl18.js?v=e7b6cbaa08"; import gl19 from "./lessons/gl19.js?v=e7b6cbaa08";
// Supplements: new sections' questions for the original GL1–GL8, merged into those lessons (item ids stay stable).
import x1 from "./lessons/x/gl1.js?v=e7b6cbaa08"; import x2 from "./lessons/x/gl2.js?v=e7b6cbaa08"; import x3 from "./lessons/x/gl3.js?v=e7b6cbaa08"; import x4 from "./lessons/x/gl4.js?v=e7b6cbaa08"; import x5 from "./lessons/x/gl5.js?v=e7b6cbaa08"; import x6 from "./lessons/x/gl6.js?v=e7b6cbaa08"; import x7 from "./lessons/x/gl7.js?v=e7b6cbaa08"; import x8 from "./lessons/x/gl8.js?v=e7b6cbaa08";
// Coverage batches: extra questions that close syllabus items (see data/coverage.json).
import c1 from "./lessons/c/gl1.js?v=e7b6cbaa08"; import c2 from "./lessons/c/gl2.js?v=e7b6cbaa08"; import c3 from "./lessons/c/gl3.js?v=e7b6cbaa08"; import c4 from "./lessons/c/gl4.js?v=e7b6cbaa08"; import c5 from "./lessons/c/gl5.js?v=e7b6cbaa08"; import c7 from "./lessons/c/gl7.js?v=e7b6cbaa08"; import c8 from "./lessons/c/gl8.js?v=e7b6cbaa08"; import c9 from "./lessons/c/gl9.js?v=e7b6cbaa08"; import c10 from "./lessons/c/gl10.js?v=e7b6cbaa08"; import c11 from "./lessons/c/gl11.js?v=e7b6cbaa08"; import c13 from "./lessons/c/gl13.js?v=e7b6cbaa08"; import c14 from "./lessons/c/gl14.js?v=e7b6cbaa08"; import c15 from "./lessons/c/gl15.js?v=e7b6cbaa08"; import c16 from "./lessons/c/gl16.js?v=e7b6cbaa08"; import c17 from "./lessons/c/gl17.js?v=e7b6cbaa08";
import airport from "./modules/airport.js?v=e7b6cbaa08"; import wind from "./modules/wind.js?v=e7b6cbaa08"; import radio from "./modules/radio.js?v=e7b6cbaa08"; import regs from "./modules/regs.js?v=e7b6cbaa08";
import emerg from "./modules/emerg.js?v=e7b6cbaa08"; import adm from "./modules/adm.js?v=e7b6cbaa08"; import flows from "./modules/flows.js?v=e7b6cbaa08"; import mnemo from "./modules/mnemo.js?v=e7b6cbaa08"; import vspeeds from "./modules/vspeeds.js?v=e7b6cbaa08";
const SUPP = { gl1: x1, gl2: x2, gl3: x3, gl4: x4, gl5: x5, gl6: x6, gl7: x7, gl8: x8 };
for (const [id, X] of Object.entries(SUPP)) { const L = { gl1, gl2, gl3, gl4, gl5, gl6, gl7, gl8 }[id];
  if (L.__merged) continue; L.__merged = true;   // idempotent even if this module is ever evaluated twice
  L.topics = { ...(L.topics || {}), ...(X.topics || {}) }; L.questions = [...(L.questions || []), ...(X.questions || [])]; L.oral = [...(L.oral || []), ...(X.oral || [])];
  for (const k of ["title", "short", "intro", "refs", "includes", "stage"]) if (X[k]) L[k] = X[k];
  if (X.textx) L.textx = true; }
// Merge coverage batches into their ground lessons (questions and orals only; topics must already exist).
const COV = { gl1: [gl1, c1], gl2: [gl2, c2], gl3: [gl3, c3], gl4: [gl4, c4], gl5: [gl5, c5], gl7: [gl7, c7], gl8: [gl8, c8], gl9: [gl9, c9], gl10: [gl10, c10], gl11: [gl11, c11], gl13: [gl13, c13], gl14: [gl14, c14], gl15: [gl15, c15], gl16: [gl16, c16], gl17: [gl17, c17] };
for (const [L, C] of Object.values(COV)) { if (L.__cmerged) continue; L.__cmerged = true;
  L.questions = [...(L.questions || []), ...(C.questions || [])]; L.oral = [...(L.oral || []), ...(C.oral || [])]; }
const ALL = [gl1, gl2, gl3, gl4, gl5, gl6, fl1, fl2, fl3, fl4, fl5, fl6, fl7, gl7, gl8, gl9, gl10, gl11, gl12, gl13, gl14, gl15, gl16, gl17, gl18, gl19, ...airport, ...wind, ...radio, ...regs, ...emerg, ...adm, ...flows, ...mnemo, ...vspeeds];
export const LESSONS = {}; export const QUESTIONS = {}; export const ORAL = {}; export const TOPICS = {};
for (const L of ALL) {
  if (LESSONS[L.id]) console.error("duplicate lesson", L.id); LESSONS[L.id] = L;
  for (const [tid, title] of Object.entries(L.topics || {})) TOPICS[tid] = { id: tid, title, lesson: L.id };
  for (const q of L.questions || []) { if (QUESTIONS[q.id]) console.error("duplicate question id", q.id); if (!TOPICS[q.t]) console.warn("unknown topic", q.t, q.id); QUESTIONS[q.id] = { ...q, lesson: L.id }; }
  for (const o of L.oral || []) { if (ORAL[o.id]) console.error("duplicate oral id", o.id); ORAL[o.id] = { ...o, lesson: L.id, kind: "oral" }; }
}
for (const m of MODULES) for (const u of m.units) if (LESSONS[u]) LESSONS[u].module = m.id;
// A module unit belongs to the stage of the ground lesson that includes it.
for (const L of Object.values(LESSONS)) for (const u of L.includes || []) if (LESSONS[u]) { LESSONS[u].parent = L.id; LESSONS[u].stage = L.stage; }
export const SYLLABUS = STAGES.flatMap((s) => [...s.ground, ...s.flight].map((id) => ({ id, stage: s.id })));
// Recommended order interleaves ground and flight like a Part 141 syllabus: each flight lesson follows the ground it depends on.
export const ORDER = ["gl1", "fw1", "fl1", "gl2", "vs1", "gl3", "fl2", "fl3", "gl4", "ap1", "ap2", "ap3", "ap4", "ap5", "ap6", "ap7", "rc1", "wx1", "wx2", "wx3", "fl4", "fl5", "gl5", "wx4", "fl6", "gl6", "fl7",
  "gl7", "gl8", "gl9", "em1", "em2", "gl10", "gl11", "rg1", "rg2", "rg3", "gl12",
  "gl13", "gl14", "gl15", "gl16", "ad1", "ad2", "gl17", "mn1", "gl18", "gl19"];
export const item = (id) => QUESTIONS[id] || ORAL[id];
export function lessonItems(id, { deep = true, oral = true } = {}) { const L = LESSONS[id]; if (!L) return [];
  let ids = (L.questions || []).map((q) => q.id); if (oral) ids = ids.concat((L.oral || []).map((o) => o.id));
  if (deep && L.includes) L.includes.forEach((u) => (ids = ids.concat(lessonItems(u, { deep, oral })))); return ids; }
