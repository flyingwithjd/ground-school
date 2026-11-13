// Tags every question with the lesson section (page) it comes from, so practice can draw only from pages the
// learner has reached. Writes data/qsec.js: { questionId: "sectionId" } (same lesson) or "lessonId/sectionId" (a stage
// check's mixed review question points at the page that teaches it). A `sec` field written on a question itself wins.
// Method: a question's topic usually names its page ("gl3.lift" -> section "lift"). Where it doesn't (or the words fit a
// different page much better), the page whose text shares the most distinctive words with the question, its answer and
// its explanation is used. Run: node tools/tag-sections.mjs [--check]   (--check: report only, write nothing)
import fs from "fs";
globalThis.window ||= { addEventListener() {} }; globalThis.localStorage ||= { getItem() { return null; }, setItem() {} };
const R = new URL("..", import.meta.url).pathname;
const D = await import(R + "data/index.js");
const { mergeSections } = await import(R + "js/views/merge-sections.js");
const REVIEW = new Set(["gl6", "gl12", "gl18", "gl19", "fl7"]);   // stage-check prep lessons: their questions review earlier lessons
// reviewed by hand: the topic's own page is right even though the words point elsewhere
const KEEP = new Set(["gl1c-07", "gl3-03", "em1-03", "gl5c-19", "gl1x-25"]);
const STOP = new Set("the a an of to and or in on at for is are be it its this that with as by from your you what which when how do does if not no can will than then into each one two about after before more most less only also should would could must may any all over under".split(" "));
const tok = (s) => ((s || "").toLowerCase().replace(/<[^>]+>/g, " ").replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1").match(/[a-z0-9][a-z0-9'-]*/g) || []).filter((w) => !STOP.has(w) && w.length > 2);
const secText = (s) => [s.title, s.label, s.body, s.body2, s.kdr && [s.kdr.k, s.kdr.d, s.kdr.r].join(" ")].join(" ");
const qText = (q) => [q.q, (q.c || []).join(" "), q.c && q.a != null ? (q.c[q.a] + " ").repeat(2) : "", q.why].join(" ");
export async function lessonSections(id) { const L = D.LESSONS[id];
  const m = await import(R + `data/text/${id}.js`); const xf = R + `data/text/x/${id}.js`; const x = L.textx && fs.existsSync(xf) ? await import(xf) : null;
  return mergeSections(m.default.sections || [], x ? x.default.sections || [] : []); }
const SECS = {}; for (const id of Object.keys(D.LESSONS)) SECS[id] = await lessonSections(id);
// document frequencies over every page in the course
const pages = []; for (const [lid, ss] of Object.entries(SECS)) ss.forEach((s, i) => pages.push({ lid, sid: s.id, i, tf: count(tok(secText(s))) }));
function count(ws) { const m = new Map(); ws.forEach((w) => m.set(w, (m.get(w) || 0) + 1)); return m; }
const df = new Map(); pages.forEach((p) => p.tf.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1)));
const idf = (w) => Math.log((pages.length + 1) / ((df.get(w) || 0) + 1));
pages.forEach((p) => { let n = 0; p.tf.forEach((c, w) => (n += ((1 + Math.log(c)) * idf(w)) ** 2)); p.norm = Math.sqrt(n) || 1; });
function score(qws, p) { let s = 0; const seen = new Set(); for (const w of qws) { if (seen.has(w)) continue; seen.add(w); const c = p.tf.get(w); if (c) s += (1 + Math.log(c)) * idf(w) * idf(w); } return s / p.norm; }
const order = D.ORDER.filter((id) => D.LESSONS[id]); const pos = (id) => { const L = D.LESSONS[id]; const k = order.indexOf(id); return k >= 0 ? k : order.indexOf(L.parent); };
const out = {}, why = { topic: 0, words: 0, cross: 0, inline: 0 };
for (const L of Object.values(D.LESSONS)) for (const q of L.questions || []) {
  if (q.sec) { why.inline++; continue; }
  const qws = tok(qText(q));
  if (REVIEW.has(L.id)) {   // best page among lessons that come earlier in the course
    const before = new Set(order.slice(0, Math.max(0, pos(L.id)))); let best = null, bs = -1;
    for (const p of pages) if (before.has(p.lid) && !REVIEW.has(p.lid)) { const s = score(qws, p); if (s > bs) { bs = s; best = p; } }
    out[q.id] = `${best.lid}/${best.sid}`; why.cross++; continue; }
  const mine = pages.filter((p) => p.lid === L.id); const suf = (q.t || "").split(".").slice(1).join(".");
  // pages with no topic of their own were added later; their questions were filed under an older topic
  const named = new Set(Object.keys(L.topics || {}).map((t) => t.split(".").slice(1).join("."))); const orphan = mine.filter((p) => !named.has(p.sid));
  const top = mine.find((p) => p.sid === suf); const pool = top ? orphan : mine;
  const sc = pool.map((p) => [score(qws, p), p]).sort((a, b) => b[0] - a[0]);
  // the topic's page wins unless a page without its own topic fits clearly better
  if (top && (KEEP.has(q.id) || !(sc.length && sc[0][0] > 2 * score(qws, top)))) { out[q.id] = top.sid; why.topic++; }
  else { out[q.id] = sc[0][1].sid; why.words++; if (process.env.DBG && (top || process.env.DBG === "all")) console.log(L.id, q.id, (top ? top.sid : "-") + " -> " + out[q.id], "|", q.q.slice(0, 90)); } }
if (process.argv.includes("--check")) { console.log(JSON.stringify(why)); process.exit(0); }
const lines = Object.entries(out).map(([k, v]) => `"${k}":"${v}"`);
fs.writeFileSync(R + "data/qsec.js", `// Generated by tools/tag-sections.mjs: the lesson section (page) each question comes from. "sec" or "lesson/sec".\n// Edit a question's own \`sec\` field to override; rerun the tool after adding questions.\nexport default {\n${lines.join(",\n")}\n};\n`);
console.log("tagged", lines.length, JSON.stringify(why));
