// Spaced repetition: SM-2 (Wozniak 1990) with confidence-aware grading.
// One correct answer is never "mastered": an item only reaches MASTERED after its interval grows past 21 days,
// which takes several spaced, successful recalls. Misses come back in 10 minutes and reset the interval.
import { item, setItem, S } from "./store.js?v=25fe20f25f";
export const DAY = 864e5, MIN = 6e4;
export const CONF = { guess: { q: 3, label: "Guessed" }, unsure: { q: 4, label: "Fairly sure" }, sure: { q: 5, label: "Certain" } };
export const LEVELS = ["New", "Learning", "Reviewing", "Strong", "Mastered"];
const fresh = () => ({ ef: 2.5, reps: 0, ivl: 0, due: 0, lapses: 0, n: 0, ok: 0, last: 0, h: [] });
export function get(id) { return item(id) || null; }
// grade: q 0-5 (SM-2). ok: boolean, conf: 'guess'|'unsure'|'sure'|null
export function review(id, { ok, conf = null, q = null, now = Date.now(), source = "quiz" }) {
  const it = { ...fresh(), ...(item(id) || {}) };
  if (q == null) q = ok ? (conf ? CONF[conf].q : 4) : (conf === "sure" ? 0 : 1);
  it.n++; if (ok) it.ok++;
  it.h = [...it.h, { t: now, ok: !!ok, c: conf, s: source }].slice(-12);
  // Practicing ahead of schedule: a correct early answer is logged but does not stretch the interval (that would fake retention).
  if (source === "ahead" && ok && it.n > 1 && it.due > now) { it.last = it.last || now; setItem(id, it); return it; }
  it.ef = Math.max(1.3, it.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  if (q < 3) { it.reps = 0; it.ivl = 0; it.lapses += it.n > 1 || !ok ? 1 : 0; it.due = now + 10 * MIN; }
  else {
    it.reps++;
    let ivl = it.reps === 1 ? 1 : it.reps === 2 ? 3 : Math.round(it.ivl * it.ef);
    if (q === 3) ivl = Math.max(1, Math.round(ivl * 0.6));       // guessed right: shorter interval
    it.ivl = Math.min(ivl, 365); it.due = now + it.ivl * DAY;
  }
  it.last = now; setItem(id, it); return it;
}
export function level(it) { if (!it || !it.n) return 0; if (it.reps === 0) return 1; if (it.ivl < 7) return 2; if (it.ivl < 21) return 3; return 4; }
// Estimated recall now: 90% at one interval after the last review (forgetting curve), floor for unseen = 0.
export function recall(it, now = Date.now()) {
  if (!it || !it.n) return 0;
  if (it.reps === 0) return 0.25;
  const el = Math.max(0, (now - it.last) / DAY); return Math.pow(0.9, el / Math.max(it.ivl, 0.5));
}
export const isDue = (it, now = Date.now()) => it && it.n > 0 && it.due <= now;
export function recentAcc(it) { if (!it || !it.h.length) return null; const h = it.h.slice(-6); return h.filter((x) => x.ok).length / h.length; }
export const overconfident = (it) => !!it && it.h.slice(-8).some((x) => !x.ok && x.c === "sure");
export const allItems = () => S().items;
