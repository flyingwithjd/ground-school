// Mastery, readiness and blind-spot analytics, all derived from per-item SRS state.
import { get, recall, level, isDue, recentAcc, readyW, blindIds, DAY } from "./srs.js?v=ff9d939563";
import { LESSONS, QUESTIONS, ORAL, TOPICS, ORDER, item, lessonItems } from "../../data/index.js?v=ff9d939563";
import { S } from "./store.js?v=ff9d939563";
export const allIds = () => [...Object.keys(QUESTIONS), ...Object.keys(ORAL)];
// Readiness = average readiness credit per item from its latest graded answer (READY_W in srs.js):
// Certain and correct = 1, Fairly sure and correct = 0.5, a guess or a miss = 0, unseen = 0. 100% only when every item is Certain and correct.
// `over` counts open blind spots that were missed while marked Certain.
export function stats(ids, now = Date.now()) {
  let seen = 0, R = 0, ok = 0, n = 0, due = 0, over = 0, lapses = 0, mastered = 0, blind = 0; const lv = [0, 0, 0, 0, 0]; const B = S().blind || {};
  for (const id of ids) { const it = get(id); const l = level(it); lv[l]++; const b = B[id]; if (b && !b.done) { blind++; if (b.conf === "sure") over++; }
    if (it && it.n) { seen++; n += it.n; ok += it.ok; lapses += it.lapses; if (isDue(it, now)) due++; if (l === 4) mastered++; } R += readyW(it); }
  const total = ids.length;
  return { total, seen, due, over, blind, lapses, mastered, levels: lv, readiness: total ? R / total : 0, coverage: total ? seen / total : 0, acc: n ? ok / n : null, attempts: n };
}
export function topicIds(tid) { return [...Object.values(QUESTIONS), ...Object.values(ORAL)].filter((q) => q.t === tid).map((q) => q.id); }
export function topicList() { return Object.values(TOPICS).map((t) => ({ ...t, ids: topicIds(t.id) })).filter((t) => t.ids.length); }
export const lessonStats = (id) => stats(lessonItems(id));
// A topic is weak when recent accuracy is low after real attempts, or when items keep lapsing.
export function classify(t, st = stats(t.ids)) {
  if (!st.seen) return "unseen";
  if (st.over) return "over";
  const recent = t.ids.map((id) => recentAcc(get(id))).filter((x) => x != null); const ra = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 1;
  if ((st.attempts >= 3 && ra < 0.7) || st.lapses >= 2 + Math.floor(st.total / 6)) return "weak";
  const fading = t.ids.some((id) => { const it = get(id); return it && it.reps >= 2 && Date.now() - it.due > 2 * DAY; });
  if (fading) return "fading";
  if (st.readiness >= 0.8 && st.coverage >= 0.9) return "strong";
  return "building";
}
export function dueIds(now = Date.now()) { return allIds().filter((id) => isDue(get(id), now)).sort((a, b) => get(a).due - get(b).due); }
export function nextDue() { let m = Infinity; for (const id of allIds()) { const it = get(id); if (it && it.n && it.due < m) m = it.due; } return m; }
export function lessonDone(id) { const L = LESSONS[id]; const ls = S().lessons[id]; return !!(ls && L && ls.total && ls.read && ls.read.length >= ls.total); }
export function nextLesson() { for (const id of ORDER) { if (!LESSONS[id]) continue; if (!lessonDone(id)) return id; const st = lessonStats(id); if (st.coverage < 0.5) return id; } return null; }
export function weakest(k = 3) {
  return topicList().map((t) => { const st = stats(t.ids); return { t, st, c: classify(t, st) }; }).filter((x) => x.st.seen && ["weak", "over", "fading", "building"].includes(x.c))
    .sort((a, b) => score(a) - score(b)).slice(0, k);
  function score(x) { const pri = { over: -1, weak: 0, fading: 0.3, building: 0.6 }[x.c]; return pri + x.st.readiness * 0.4; }
}
// Open blind spots that exist in the question bank, Certain misses first. `ready` = only those whose 12-hour wait is over.
export function blindList({ ready = false, includeOral = true, now = Date.now() } = {}) {
  return blindIds().filter((id) => item(id) && (includeOral || !ORAL[id]) && (!ready || !get(id) || get(id).due <= now)); }
// Build a study queue: due first (most overdue), then a few new ones, with up to `blindMax` ready blind spots from
// anywhere in the course spread through it. Nothing in `exclude` (already answered this sitting) is ever repeated.
export function buildQueue(pool, { max = 20, newMax = S().settings.newPerSession, includeOral = false, blindMax = 0, exclude = null, now = Date.now() } = {}) {
  const skip = (id) => exclude && exclude.has(id);
  pool = pool.filter((id) => (includeOral || !ORAL[id]) && !skip(id));
  const due = pool.filter((id) => isDue(get(id), now)).sort((a, b) => get(a).due - get(b).due);
  const fresh = pool.filter((id) => !get(id) || !get(id).n);
  const rest = pool.filter((id) => get(id) && get(id).n && !isDue(get(id), now)).sort((a, b) => readyW(get(a)) - readyW(get(b)) || recall(get(a), now) - recall(get(b), now));
  let q = due.slice(0, max);
  if (q.length < max) q = q.concat(fresh.slice(0, Math.min(newMax, max - q.length)));
  const inQ = new Set(q); const bl = blindMax ? blindList({ ready: true, includeOral, now }).filter((id) => !inQ.has(id) && !skip(id)).slice(0, blindMax) : [];
  return { queue: spread(q, bl), extra: rest, dueCount: due.length, newCount: fresh.length, blindCount: bl.length };
}
// Insert `b` evenly through `q` (first one after the second question), so blind spots never bunch at the start.
export function spread(q, b) { if (!b.length) return q; const out = q.slice(); const step = Math.max(2, Math.floor((q.length + b.length) / (b.length + 1)));
  b.forEach((id, k) => out.splice(Math.min(out.length, (k + 1) * step), 0, id)); return out; }
// The next `n` questions to keep going with: due first, then never seen in bank order, then the weakest seen ones.
export function nextChunk(pool, exclude, n = 10, now = Date.now()) {
  pool = pool.filter((id) => !ORAL[id] && !exclude.has(id));
  const due = pool.filter((id) => isDue(get(id), now)).sort((a, b) => get(a).due - get(b).due);
  const fresh = pool.filter((id) => !get(id) || !get(id).n);
  const rest = pool.filter((id) => get(id) && get(id).n && !isDue(get(id), now)).sort((a, b) => readyW(get(a)) - readyW(get(b)) || recall(get(a), now) - recall(get(b), now));
  return [...due, ...fresh, ...rest].slice(0, n); }
export { item };
