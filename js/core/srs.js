// Spaced repetition: SM-2 (Wozniak 1990) with confidence-aware grading.
// One correct answer is never "mastered": an item only reaches MASTERED after its interval grows past 21 days
// and its latest answer was Certain and correct. A miss, or a correct guess, comes back 12 hours later (never in the
// same session) and resets the interval. Every miss also opens a blind spot (S().blind) that resurfaces in later sessions.
import { item, setItem, S, migrate } from "./store.js?v=ac7792ed3c";
export const DAY = 864e5, MIN = 6e4, HOUR = 36e5;
export const CONF = { guess: { q: 3, label: "Guessed" }, unsure: { q: 4, label: "Fairly sure" }, sure: { q: 5, label: "Certain" } };
// Readiness credit for a question, from its latest graded answer. A miss is always 0. Tune here only.
export const READY_W = { guess: 0, unsure: 0.5, sure: 1 };
// A missed (or guessed-right) question returns after this delay: long enough to be out of short-term memory.
export const MISS_DELAY = 12 * HOUR;
// A blind spot clears after this many correct answers (not guesses) on separate days; more if the miss was Certain.
export const BLIND_CLEAR = { sure: 3, other: 2 };
export const LEVELS = ["New", "Learning", "Reviewing", "Strong", "Mastered"];
const fresh = () => ({ ef: 2.5, reps: 0, ivl: 0, due: 0, lapses: 0, n: 0, ok: 0, last: 0, h: [] });
export function get(id) { return item(id) || null; }
// quality 5/4/3 = Certain / Fairly sure / Guessed. No confidence (old answers, timed exams) = 4.
const confOf = (q) => (q >= 5 ? "sure" : q === 4 ? "unsure" : "guess");
// grade: q 0-5 (SM-2). ok: boolean, conf: 'guess'|'unsure'|'sure'|null. source: the session mode ("learn", "review", "ahead", "exam", ...)
export function review(id, { ok, conf = null, q = null, now = Date.now(), source = "quiz" }) {
  const it = { ...fresh(), ...(item(id) || {}) };
  if (q == null) q = ok ? (conf ? CONF[conf].q : 4) : (conf === "sure" ? 0 : 1);
  const prevW = it.n ? readyW(it) : null;
  it.n++; if (ok) it.ok++;
  it.h = [...it.h, { t: now, ok: !!ok, c: conf, s: source, q }].slice(-12);
  // Readiness credit from this answer. An old exam answer saved without a confidence rating keeps an earlier rating's credit.
  it.rw = !ok || q < 3 ? 0 : conf ? READY_W[conf] ?? 0 : source === "exam" && prevW != null ? prevW : READY_W[confOf(q)];
  blindUpdate(id, { t: now, ok: !!ok, c: conf, q });
  // Practicing ahead of schedule: a correct early answer is logged but does not stretch the interval (that would fake retention).
  // A correct guess still pulls the next review in.
  if (source === "ahead" && ok && it.n > 1 && it.due > now) { if (q <= 3) it.due = Math.min(it.due, now + MISS_DELAY); it.last = now; setItem(id, it); return it; }
  it.ef = Math.max(1.3, it.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  if (q <= 3) { it.reps = 0; it.ivl = 0; if (q < 3) it.lapses += it.n > 1 || !ok ? 1 : 0; it.due = now + MISS_DELAY; }   // miss or guess: back in 12 h
  else {
    it.reps++;
    const ivl = it.reps === 1 ? 1 : it.reps === 2 ? 3 : Math.round(it.ivl * it.ef);
    it.ivl = Math.min(ivl, 365); it.due = now + it.ivl * DAY;
  }
  it.last = now; setItem(id, it); return it;
}
// Readiness credit of one item's latest graded answer (0..1). Older saves have no `rw`, so it is read from the last history entry.
export function readyW(it) {
  if (!it || !it.n) return 0; if (typeof it.rw === "number") return it.rw;
  const e = it.h && it.h[it.h.length - 1]; if (!e) return 0; if (!e.ok) return 0;
  if (e.c) return READY_W[e.c] ?? 0; if (typeof e.q === "number") return e.q < 4 ? 0 : READY_W[confOf(e.q)];
  return READY_W.unsure;   // old answer with no confidence recorded
}
// Strong and Mastered need a Certain, correct latest answer; otherwise an item tops out at Reviewing.
export function level(it) { if (!it || !it.n) return 0; if (it.reps === 0) return 1; if (it.ivl < 7 || readyW(it) < 1) return 2; if (it.ivl < 21) return 3; return 4; }
// Estimated recall now: 90% at one interval after the last review (forgetting curve), floor for unseen = 0. Used to order practice.
export function recall(it, now = Date.now()) {
  if (!it || !it.n) return 0;
  if (it.reps === 0) return 0.25;
  const el = Math.max(0, (now - it.last) / DAY); return Math.pow(0.9, el / Math.max(it.ivl, 0.5));
}
export const isDue = (it, now = Date.now()) => it && it.n > 0 && it.due <= now;
export function recentAcc(it) { if (!it || !it.h.length) return null; const h = it.h.slice(-6); return h.filter((x) => x.ok).length / h.length; }
export const allItems = () => S().items;

// ---------- Blind spots ----------
// S().blind[id] = { t: first miss, last: last miss, conf: 'sure' if any miss was Certain, n: misses, k: correct days since last miss, kd: day of the last counted event, done: cleared time | null }
const dayKey = (t) => { const d = new Date(t); return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate(); };
function applyBlind(B, id, e) {
  let b = B[id];
  if (!e.ok) { b = B[id] = b && !b.done ? b : { t: e.t, n: 0, conf: null }; b.last = e.t; b.n++; b.k = 0; b.kd = dayKey(e.t); b.done = null; if (e.c === "sure") b.conf = "sure"; return; }
  if (!b || b.done) return;
  const guess = e.c === "guess" || (typeof e.q === "number" && e.q <= 3); if (guess) return;
  const d = dayKey(e.t); if (d === b.kd) return;   // only one correct answer per day counts
  b.k++; b.kd = d; if (b.k >= (b.conf === "sure" ? BLIND_CLEAR.sure : BLIND_CLEAR.other)) b.done = e.t;
}
function blindUpdate(id, e) { const s = S(); s.blind ||= {}; applyBlind(s.blind, id, e); }
// Rebuild blind spots from answer history (old saves). Pure: reads items, returns a new map; never touches items.
export function blindFromHistory(items) { const B = {};
  for (const [id, it] of Object.entries(items || {})) for (const e of (it && it.h) || []) applyBlind(B, id, e);
  return B; }
export const isBlind = (id) => { const b = (S().blind || {})[id]; return !!(b && !b.done); };
// Open blind-spot ids; Certain misses first, then the oldest.
export function blindIds() { const B = S().blind || {};
  return Object.keys(B).filter((id) => !B[id].done).sort((a, b) => (B[a].conf === "sure" ? 0 : 1) - (B[b].conf === "sure" ? 0 : 1) || B[a].t - B[b].t); }
// In-place, backward-compatible migration inside ppg.v1 (runs once per save, and again after importing an older export):
// older saves have no blind-spot list, so it is rebuilt from each item's answer history. Item state and ids are never changed.
migrate((s) => { if (s.blindInit) return; s.blind = blindFromHistory(s.items); s.blindInit = 1; });
