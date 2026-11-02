// Mastery, readiness and blind-spot analytics, all derived from per-item SRS state.
import { get, recall, level, isDue, recentAcc, overconfident, DAY } from "./srs.js?v=167338b5e8";
import { LESSONS, QUESTIONS, ORAL, TOPICS, ORDER, item, lessonItems } from "../../data/index.js?v=167338b5e8";
import { S } from "./store.js?v=167338b5e8";
export const allIds = () => [...Object.keys(QUESTIONS), ...Object.keys(ORAL)];
export function stats(ids, now = Date.now()) {
  let seen = 0, R = 0, ok = 0, n = 0, due = 0, over = 0, lapses = 0, mastered = 0; const lv = [0, 0, 0, 0, 0];
  for (const id of ids) { const it = get(id); const l = level(it); lv[l]++; if (it && it.n) { seen++; n += it.n; ok += it.ok; lapses += it.lapses; if (isDue(it, now)) due++; if (overconfident(it)) over++; if (l === 4) mastered++; } R += recall(it, now); }
  const total = ids.length;
  return { total, seen, due, over, lapses, mastered, levels: lv, readiness: total ? R / total : 0, coverage: total ? seen / total : 0, acc: n ? ok / n : null, attempts: n };
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
// Build a study queue: due first (most overdue), then weakest seen items, then a few new ones, interleaved.
export function buildQueue(pool, { max = 20, newMax = S().settings.newPerSession, includeOral = false, now = Date.now() } = {}) {
  pool = pool.filter((id) => includeOral || !ORAL[id]);
  const due = pool.filter((id) => isDue(get(id), now)).sort((a, b) => get(a).due - get(b).due);
  const fresh = pool.filter((id) => !get(id) || !get(id).n);
  const rest = pool.filter((id) => get(id) && get(id).n && !isDue(get(id), now)).sort((a, b) => recall(get(a), now) - recall(get(b), now));
  let q = due.slice(0, max);
  if (q.length < max) q = q.concat(fresh.slice(0, Math.min(newMax, max - q.length)));
  return { queue: q, extra: rest, dueCount: due.length, newCount: fresh.length };
}
export { item };
