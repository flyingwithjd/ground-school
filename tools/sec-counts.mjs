// Questions per lesson (unit) and per page (section), counted by each question's page tag (secKey), plus the gap list:
// units under 20 questions and pages under 3. A stage-check review question counts toward the page it was tagged with.
// Usage: node tools/sec-counts.mjs [--md]   (--md prints markdown tables)
const ow = console.warn; console.warn = () => {};
const { LESSONS, QUESTIONS, ORDER, secKey, lessonItems } = await import("../data/index.js"); const { mergeSections } = await import("../js/views/merge-sections.js");
console.warn = ow;
const UNIT = 20, PAGE = 3; const REVIEW = new Set(["gl6", "gl12", "gl18", "gl19", "fl7"]);
const by = {}; for (const q of Object.values(QUESTIONS)) { const k = secKey(q); by[k] = (by[k] || 0) + 1; }
const units = [...ORDER, ...Object.keys(LESSONS).filter((id) => !ORDER.includes(id) && !LESSONS[id].parent)];
const rows = []; const gapsU = [], gapsP = [];
for (const lid of units) { let t; try { t = (await import(`../data/text/${lid}.js`)).default; } catch { continue; } let x = null; try { x = (await import(`../data/text/x/${lid}.js`)).default; } catch {}
  const secs = x ? mergeSections(t.sections || [], x.sections || x) : t.sections || [];
  const per = secs.map((s) => [s.id, s.label || s.title || s.id, by[`${lid}/${s.id}`] || 0]); const n = per.reduce((a, p) => a + p[2], 0);
  rows.push({ lid, title: LESSONS[lid].title, n, asked: lessonItems(lid).length, per, review: REVIEW.has(lid) });
  if (n < UNIT && !REVIEW.has(lid)) gapsU.push(`${lid} ${n}/${UNIT} (+${UNIT - n})`);
  for (const p of per) if (p[2] < PAGE && !REVIEW.has(lid)) gapsP.push(`${lid}/${p[0]} "${p[1]}" ${p[2]} (+${PAGE - p[2]})`); }
for (const r of rows) console.log(`${r.lid.padEnd(5)} ${String(r.n).padStart(4)} on its pages · ${String(r.asked).padStart(4)} in its practice${r.review ? " (stage review)" : ""}  ${r.title}\n      ` + r.per.map((p) => `${p[0]}:${p[2]}`).join("  "));
console.log(`\nUnits under ${UNIT} (review lessons excluded): ${gapsU.length}\n  ` + gapsU.join("\n  "));
console.log(`\nPages under ${PAGE}: ${gapsP.length} (short ${gapsP.reduce((a, g) => a + +g.match(/\+(\d+)\)$/)[1], 0)} questions)\n  ` + gapsP.join("\n  "));
