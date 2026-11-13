// The learning flow inside a lesson: pages in groups of 2-3, a quick check after each group (drawn only from the pages just
// read), and a wrap-up across the lesson at the end. One pass asks about 20 questions (short units about 15-20, very long
// lessons up to 25): see budget() below. Checks are never a gate: "Skip for now" moves on, and a lesson counts as finished
// once its pages are read or its wrap-up is done or skipped.
// Progress lives in lessons[id] inside ppg.v1 (additive): cp[key] = { done, ok, n } or { skip }, fin = time finished.
import { get, isDue, isBlind } from "./srs.js?v=716452685f";
import { QUESTIONS, secKey, lessonItems } from "../../data/index.js?v=716452685f";
import { reachedSet, isReached, stats } from "./progress.js?v=716452685f";
import { S, save } from "./store.js?v=716452685f";
const HOUR = 36e5;
// Question ids by page key "lesson/sec", in bank order.
let BY = null; export function byPage() { if (BY) return BY; BY = {}; for (const q of Object.values(QUESTIONS)) { const k = secKey(q); if (k) (BY[k] ||= []).push(q.id); } return BY; }
export const pageIds = (lid, sid) => byPage()[lid + "/" + sid] || [];
export const pageStats = (lid, sid) => stats(pageIds(lid, sid));
export const pageBlind = (lid, sid) => pageIds(lid, sid).filter((id) => isBlind(id)).length;
// Split n pages into groups of 2-3 (3 pages: a check after the first 2; 1-2 pages: no quick check, only the wrap-up).
export function groups(n) { if (n === 3) return [[0, 1], [2]]; if (n < 3) return [Array.from({ length: n }, (_, i) => i)]; const k = Math.ceil(n / 3), base = Math.floor(n / k), extra = n % k; const out = []; let at = 0;
  for (let g = 0; g < k; g++) { const sz = base + (g < extra ? 1 : 0); out.push(Array.from({ length: sz }, (_, i) => at + i)); at += sz; } return out; }
// One pass through a lesson asks about PASS questions (PASS_LONG when a lesson has 6+ quick checks, like GL2). Quick checks
// get 3-6 each (2-3 when there are many), the wrap-up the rest (5-15), and nothing asks more than its pool holds.
export const PASS = 20, PASS_LONG = 25;
export function budget(checkPools, wrapPool) { const n = checkPools.length, B = Math.min(n >= 6 ? PASS_LONG : PASS, Math.max(wrapPool, 5)); let sizes = [];
  if (n) { const forChecks = B - 5, base = Math.floor(forChecks / n), extra = forChecks % n;
    sizes = checkPools.map((p, i) => Math.min(p, Math.min(6, Math.max(base >= 3 ? base : base + (i < extra ? 1 : 0), 2)))); }
  const used = sizes.reduce((a, b) => a + b, 0); return { checks: sizes, wrap: Math.min(wrapPool, Math.max(5, Math.min(15, B - used))) }; }
// Steps of a lesson: { kind: "sec" | "cp" | "prep" | "wrap", key, label }. Section keys stay their index so old links keep working.
export function plan(lid, sections, hasPrep) { const steps = []; let n = 0; const g = groups(sections.length);
  g.forEach((grp, gi) => { grp.forEach((si) => steps.push({ kind: "sec", si, key: String(si), label: sections[si].label }));
    if (gi < g.length - 1) { const pages = grp.map((si) => sections[si].id); const pool = pages.flatMap((sid) => pageIds(lid, sid));
      if (pool.length) { n++; steps.push({ kind: "cp", key: "check" + n, n, pages, from: grp[0], to: grp[grp.length - 1], pool: pool.length, label: `Quick check ${n}` }); } } });
  if (hasPrep) steps.push({ kind: "prep", key: "brief", label: "Briefing card" });
  const L = LESSONS[lid]; const cps = steps.filter((s) => s.kind === "cp"); const b = budget(cps.map((s) => s.pool), wrapPool(lid, sections, !!L && !L.includes).length);
  cps.forEach((s, i) => (s.size = b.checks[i]));
  steps.push({ kind: "wrap", key: "wrap", label: "Wrap-up", size: b.wrap }); return steps; }
// Every question a lesson's wrap-up can draw from: questions tagged with its pages plus its own bank (stage reviews point at earlier pages).
export function wrapPool(lid, sections, deep = false) { return [...new Set([...sections.flatMap((s) => pageIds(lid, s.id)), ...lessonItems(lid, { deep })])]; }
const last = (id) => { const it = get(id); const h = it && it.h; return h && h.length ? h[h.length - 1] : null; };
// A question may be asked now unless it was missed or guessed less than 12 hours ago (it comes back after the wait), or
// answered in the last hour (no repeats from the check you just did).
function askable(id, now) { const it = get(id); if (!it || !it.n) return true; const e = last(id); const shaky = e && (!e.ok || e.c === "guess");
  if (shaky) return isDue(it, now); return now - ((e && e.t) || 0) > HOUR || isDue(it, now); }
// Rank: quick checks prefer never-seen, then missed, then low confidence; the wrap-up prefers missed, then low confidence, then
// never-seen. Within a rank the pages take turns, so a check covers each page it draws from.
function score(id, wrap) { const it = get(id); if (!it || !it.n) return wrap ? 3 : 0; const e = last(id); if (e && !e.ok) return wrap ? 0 : 1; const c = e && e.c; return c === "guess" ? (wrap ? 1 : 2) : c === "sure" ? 4 : wrap ? 2 : 3; }
export function pick(pool, n, { wrap = false, now = Date.now() } = {}) {
  const R = reachedSet(); const ids = [...new Set(pool)].filter((id) => QUESTIONS[id] && isReached(id, R));
  const per = {}; ids.forEach((id) => (per[secKey(QUESTIONS[id])] ||= []).push(id)); const pos = {}; const order = Object.keys(per);
  for (const k of order) per[k].map((id, b) => [id, score(id, wrap), b]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).forEach(([id], p) => (pos[id] = p));
  const rank = (id) => [score(id, wrap), pos[id], order.indexOf(secKey(QUESTIONS[id]))];
  const sorted = ids.slice().sort((a, b) => { const A = rank(a), B = rank(b); return A[0] - B[0] || A[1] - B[1] || A[2] - B[2]; });
  const ok = sorted.filter((id) => askable(id, now)); return ok.slice(0, n); }
export const cpState = (lid, key) => ((S().lessons[lid] || {}).cp || {})[key] || null;
export function cpMark(lid, key, v) { const ls = (S().lessons[lid] ||= { visited: 0, sec: 0, read: [] }); (ls.cp ||= {})[key] = { ...v, t: Date.now() }; save(); }
export function finish(lid) { const ls = (S().lessons[lid] ||= { visited: 0, sec: 0, read: [] }); if (!ls.fin) { ls.fin = Date.now(); save(); } }
// The one next step for the Now page: a quick check whose pages are read but which was neither done nor skipped, else the
// lesson in progress (most recently opened, not finished), else the next lesson in course order.
import PI from "../../data/pageindex.js?v=716452685f";
import { LESSONS, ORDER } from "../../data/index.js?v=716452685f";
import { lessonDone, nextLesson } from "./progress.js?v=716452685f";
export const pagesOf = (lid) => (PI.lessons[lid] || []).map(([id, label, title]) => ({ id, label, title }));
export const pageIndex = () => PI;
export function nextStep() { const ls = S().lessons || {};
  const going = Object.entries(ls).filter(([lid, x]) => LESSONS[lid] && x && (x.read || []).length && !lessonDone(lid)).sort((a, b) => (b[1].visited || 0) - (a[1].visited || 0));
  if (going.length) { const [lid, x] = going[0]; const secs = pagesOf(lid); const steps = plan(lid, secs, !!LESSONS[lid].prep); const read = new Set(x.read);
    let left = 0; const cp = steps.find((s) => s.kind === "cp" && s.pages.every((p) => read.has(p)) && !cpState(lid, s.key) && (left = pick(s.pages.flatMap((p) => pageIds(lid, p)), s.size).length));
    const nRead = secs.filter((s) => read.has(s.id)).length;
    if (cp) return { kind: "cp", lid, href: `#/lesson/${lid}/${cp.key}`, step: cp, left, nRead, nPages: secs.length };
    return { kind: "continue", lid, href: `#/lesson/${lid}`, nRead, nPages: secs.length }; }
  const nl = nextLesson(); if (nl) return { kind: "begin", lid: nl, href: `#/lesson/${nl}`, nRead: ((ls[nl] || {}).read || []).length, nPages: pagesOf(nl).length };
  return { kind: "exam", href: "#/check/s4" }; }
