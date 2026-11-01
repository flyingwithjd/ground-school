// Validates content: ACS codes exist, question shape, counts per lesson, glossary keys.
import fs from "fs";
const acs = JSON.parse(fs.readFileSync("/workspace/refs/acs_all.json", "utf8"));
const { LESSONS, QUESTIONS, ORAL } = await import("../data/index.js");
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
