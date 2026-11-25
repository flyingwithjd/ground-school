// Today's 5 and the study plan (P1d, Nov 2026). Its own localStorage key, so ppg.v1 (progress) is never touched:
// sqs.today = { plan: { goal, mins, test }, days: { "YYYY-MM-DD": answered }, off: false }.
// The streak is quiet: dots for the last 7 days, one missed day a week is forgiven (a freeze), and no guilt messages.
const KEY = "sqs.today", GOAL = 5;
let st = load();
function load() { try { const o = JSON.parse(localStorage.getItem(KEY)); if (o && typeof o === "object") return { plan: null, days: {}, off: false, ...o }; } catch (e) {} return { plan: null, days: {}, off: false }; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const back = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
export const T5 = {
  GOAL,
  get plan() { return st.plan; },
  setPlan(p) { st.plan = { ...(st.plan || {}), ...p, at: Date.now() }; save(); },
  get off() { return !!st.off; }, setOff(v) { st.off = !!v; save(); },
  count(d = new Date()) { return st.days[dayKey(d)] || 0; },
  done(d = new Date()) { return this.count(d) >= GOAL; },
  answered() { const k = dayKey(); st.days[k] = (st.days[k] || 0) + 1;
    // keep about a year of days
    const ks = Object.keys(st.days).sort(); if (ks.length > 400) ks.slice(0, ks.length - 400).forEach((x) => delete st.days[x]); save(); },
  // last 7 days, oldest first: { key, label, done, today }
  week() { return [6, 5, 4, 3, 2, 1, 0].map((n) => { const d = back(n); return { key: dayKey(d), label: "SMTWTFS"[d.getDay()], done: this.done(d), today: n === 0 }; }); },
  // consecutive days done, ending today (or yesterday while today is still open); one missed day in any 7 is forgiven
  streak() { let n = 0, miss = [], i = this.done() ? 0 : 1;
    for (; i < 400; i++) { if (this.done(back(i))) { n++; continue; } miss = miss.filter((m) => i - m < 7); if (miss.length) break; miss.push(i); if (!this.done(back(i + 1))) break; }
    return n; },
  daysToTest() { const t = st.plan && st.plan.test; if (!t) return null; const [y, m, d] = t.split("-").map(Number); const td = new Date(y, m - 1, d, 12); return Math.round((td - back(0)) / 864e5); },
};
