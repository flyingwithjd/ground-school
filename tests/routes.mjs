// Prints every route: top-level pages, every lesson section, every module, oral sets.
import { LESSONS } from "../data/index.js"; import { MODULES } from "../data/course.js";
const out = ["#/", "#/course", "#/review", "#/map", "#/tools", "#/glossary", "#/settings", "#/about", "#/oral", "#/oral/all", "#/sim", "#/coverage", "#/presolo",
  ...["s1", "s2", "s3", "s4"].flatMap((s) => [`#/check/${s}`, `#/check/${s}/written`, `#/check/${s}/oral`])];
for (const id of Object.keys(LESSONS)) { out.push("#/lesson/" + id);
  try { const m = await import(`../data/text/${id}.js`); const t = m.default || m; let n = (t.sections || []).length; try { n += ((await import(`../data/text/x/${id}.js`)).default.sections || []).length; } catch {}
    for (let i = 0; i < n; i++) out.push(`#/lesson/${id}/${i}`); } catch {} }
for (const m of MODULES || []) out.push("#/module/" + m.id);
console.log(out.join("\n"));
