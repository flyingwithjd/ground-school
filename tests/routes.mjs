// Prints every route: top-level pages, every lesson section, every module, oral sets.
import { LESSONS } from "../data/index.js"; import { MODULES } from "../data/course.js";
const out = ["#/", "#/course", "#/review", "#/map", "#/tools", "#/glossary", "#/settings", "#/about", "#/oral", "#/oral/all", "#/sim"];
for (const id of Object.keys(LESSONS)) { out.push("#/lesson/" + id);
  try { const m = await import(`../data/text/${id}.js`); const t = m.default || m; (t.sections || []).forEach((_, i) => out.push(`#/lesson/${id}/${i}`)); } catch {} }
for (const m of MODULES || []) out.push("#/module/" + m.id);
console.log(out.join("\n"));
