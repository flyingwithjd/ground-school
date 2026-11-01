// Validates content: ACS codes exist, question shape, counts per lesson, glossary keys,
// unique question ids, known topics, the syllabus coverage map and the pre-solo topic list. Exits 1 on any problem.
import fs from "fs";
const warns = []; const ow = console.warn, oe = console.error; console.warn = (...a) => warns.push(a.join(" ")); console.error = (...a) => warns.push(a.join(" "));
const acs = JSON.parse(fs.readFileSync("/workspace/refs/acs_all.json", "utf8"));
const { LESSONS, QUESTIONS, ORAL, TOPICS } = await import("../data/index.js");
console.warn = ow; console.error = oe;
const G0 = (await import("../data/glossary.js")).default || {}; const nk = (k) => k.toLowerCase().replace(/[’']/g, "'").trim();
const G = Object.fromEntries(Object.keys(G0).map((k) => [nk(k), 1])); const hasG = (k) => [k, k.replace(/s$/, ""), k.replace(/es$/, ""), k.replace(/ies$/, "y")].some((x) => G[x]);
let bad = 0; const missingG = new Set(); const report = [];
const chk = (c, where) => { if (!acs[c]) { console.log("BAD ACS", c, where); bad++; } };
for (const id of Object.keys(LESSONS)) {
  const L = LESSONS[id]; let t = null; try { t = (await import(`../data/text/${id}.js`)).default; } catch (e) { console.log("NO TEXT", id, e.message); }
  for (const o of L.oral || []) chk(o.acs, id + " oral " + o.id);
  for (const q of L.questions || []) { if (q.type === "order") { if (!q.items || q.items.length < 3) { console.log("BAD ORDER", q.id); bad++; } } else if (!q.c || q.c.length < 2 || q.a !== 0 || !q.why || !q.src) { console.log("BAD Q", q.id); bad++; } }
  if (t) for (const s of t.sections || []) { [].concat(s.kdr?.codes || []).flatMap((x) => String(x).split(/,\s*/)).filter(Boolean).forEach((c) => chk(c, id + " " + s.id)); const txt = (s.body || "") + (s.body2 || ""); for (const m of txt.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) { const k = nk(m[2] || m[1]); if (!hasG(k)) missingG.add(k); } }
  report.push([id, (L.questions || []).length, (L.oral || []).length, t ? (t.sections || []).length : 0]);
}
console.table(report.map(([id, q, o, s]) => ({ id, q, o, s })));
console.log("questions", Object.keys(QUESTIONS).length, "oral", Object.keys(ORAL).length, "bad", bad);
console.log("missing glossary", [...missingG].sort().join(" | "));

// Unique ids and known topics (index.js warns while merging).
for (const w of warns) { console.log("INDEX", w); bad++; }
const seen = new Set();
for (const L of Object.values(LESSONS)) for (const q of L.questions || []) { if (seen.has(q.id)) { console.log("DUP Q", q.id); bad++; } seen.add(q.id); if (TOPICS && !TOPICS[q.t]) { console.log("BAD TOPIC", q.t, q.id); bad++; } }
// Coverage: data/coverage.json must exist, be built from the current map, and every link must resolve to a real section.
const cvPath = new URL("../data/coverage.json", import.meta.url);
if (!fs.existsSync(cvPath)) { console.log("NO data/coverage.json (run node tools/build-coverage.mjs)"); bad++; }
else { const cv = JSON.parse(fs.readFileSync(cvPath, "utf8")); const { COVERAGE } = await import("../data/coverage-src.js");
  const nItems = Object.values(COVERAGE).reduce((a, l) => a + l.items.length, 0); const got = cv.lessons.reduce((a, l) => a + l.items.length, 0);
  if (nItems !== got) { console.log("COVERAGE STALE", nItems, "items in map,", got, "in coverage.json"); bad++; }
  for (const l of cv.lessons) for (const it of l.items) { if (it.status === "missing") { console.log("COVERAGE MISSING", l.lesson, it.item); bad++; }
    for (const w of it.where || []) { let t = null; try { t = (await import(`../data/text/${w.lesson}.js`)).default; } catch {}
      const secs = [...(t?.sections || [])]; try { secs.push(...((await import(`../data/text/x/${w.lesson}.js`)).default.sections || [])); } catch {}
      if (!secs.some((s) => s.id === w.sec)) { console.log("COVERAGE BAD LINK", l.lesson, it.item, w.lesson + "/" + w.sec); bad++; } } }
  console.log("coverage", JSON.stringify(cv.totals)); }
// Pre-solo written pool: every topic must have questions.
const src = fs.readFileSync(new URL("../js/views/checks.js", import.meta.url), "utf8"); const pm = src.match(/PRESOLO_TOPICS = (\[[^\]]*\])/);
const PT = pm ? JSON.parse(pm[1]) : []; if (!PT.length) { console.log("NO PRESOLO_TOPICS"); bad++; }
for (const t of PT) if (!Object.values(QUESTIONS).some((q) => q.t === t)) { console.log("PRESOLO TOPIC WITHOUT QUESTIONS", t); bad++; }
console.log(bad ? `FAIL ${bad}` : "OK");
process.exit(bad ? 1 : 0);
