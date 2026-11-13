// Shared pieces for the GL2 systems visuals: round instrument dials in screen px, a G1000-style EIS strip cell,
// and an animation driver capped at 30 fps that stops itself (zero frames) as soon as nothing is moving.
import { loop } from "./base.js?v=da5a58a7ab";
import { s, reduced } from "../core/util.js?v=da5a58a7ab";
import { T, P, L, C, R, INK, GRAY, DIM, ACC, r1 } from "./kit.js?v=da5a58a7ab";
export const COL = { white: "#F2F1EC", green: "#3FA66B", yellow: "#D9B23A", red: "#D9493E", cyan: "#4FC3E0" };
const D2R = Math.PI / 180;
// step(dt) returns true while something is still changing; the loop sleeps when it returns false and wakes on kick().
export function anim(F, step) {
  let acc = 0, awake = false;
  const lp = loop(F, (now, dt) => { acc += dt; if (acc < 33) return true; const d = Math.min(acc, 100); acc = 0; const more = step(d / 1000); if (!more) { awake = false; return false; } return true; });
  return { kick() { if (reduced()) { for (let i = 0; i < 400 && step(0.1); i++); return; } if (!awake) { awake = true; acc = 33; lp.start(); } }, stop() { awake = false; lp.stop(); } };
}
// ease a value toward a target at a rate (fraction of the gap per second); returns [value, stillMoving]
export function toward(v, target, rate, dt, eps = 1e-3) { const nv = v + (target - v) * Math.min(1, rate * dt); return Math.abs(target - nv) < eps ? [target, false] : [nv, true]; }
// Round dial. Angles: 0 = straight up, clockwise. Returns { set(v) } to move the needle without a redraw.
export function dial(g, cx, cy, r, o) {
  const { min, max, a0 = -130, a1 = 130, arcs = [], reds = [], ticks = [], nums = [], title = "", sub = "", focus = false, dim = false, fmt = null } = o;
  const clampv = (v) => Math.min(max, Math.max(min, v)); const ang = (v) => a0 + ((a1 - a0) * (clampv(v) - min)) / (max - min);
  const pt = (a, rr) => [cx + Math.sin(a * D2R) * rr, cy - Math.cos(a * D2R) * rr];
  const gg = s("g", { opacity: dim ? 0.45 : 1 }, g);
  C(gg, cx, cy, r, { fill: "#0A0A0B", stroke: focus ? ACC : GRAY, sw: focus ? 2.4 : 1.4 });
  arcs.forEach(([f, t, col]) => { const A = ang(f), B = ang(t), rr = r - 7; const [x0, y0] = pt(A, rr), [x1, y1] = pt(B, rr);
    P(gg, `M${r1(x0)},${r1(y0)} A${rr},${rr} 0 ${B - A > 180 ? 1 : 0} 1 ${r1(x1)},${r1(y1)}`, { stroke: COL[col] || col, w: 5 }); });
  reds.forEach((v) => { const a = ang(v), [x0, y0] = pt(a, r - 15), [x1, y1] = pt(a, r - 1); L(gg, x0, y0, x1, y1, { stroke: COL.red, w: 3 }); });
  ticks.forEach((v) => { const a = ang(v), [x0, y0] = pt(a, r - 12), [x1, y1] = pt(a, r - 3); L(gg, x0, y0, x1, y1, { stroke: DIM, w: 1.2 }); });
  if (r >= 46) nums.forEach(([v, t]) => { const [x, y] = pt(ang(v), r - 24); T(gg, x, y + 4, t, { size: 11, anchor: "middle", fill: GRAY }); });
  if (title) T(gg, cx, cy + r * 0.56, title, { size: 11, anchor: "middle", fill: focus ? INK : GRAY });
  if (sub) T(gg, cx, cy + r * 0.56 + 14, sub, { size: 11, anchor: "middle", fill: DIM });
  const nd = s("g", {}, gg); L(nd, cx, cy + 8, cx, cy - (r - 14), { stroke: focus ? ACC : INK, w: 2.4 }); C(nd, cx, cy, 4.5, { fill: INK });
  const val = fmt ? T(gg, cx, cy + r * 0.3, "", { size: 11, anchor: "middle", fill: INK }) : null;
  const api = { gg, ang, set(v) { nd.setAttribute("transform", `rotate(${r1(ang(v))} ${r1(cx)} ${r1(cy)})`); if (val) val.textContent = fmt(v); } };
  if (o.value != null) api.set(o.value); return api;
}
// G1000-style EIS cell: label, digital value, and a horizontal scale with colored bands and a pointer.
export function eisCell(g, x, y, w, o) {
  const { label, min, max, bands = [], reds = [], fmt = (v) => String(Math.round(v)), focus = false } = o; const sx = (v) => x + ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * w;
  const gg = s("g", {}, g); T(gg, x, y, label, { size: 11, fill: focus ? INK : GRAY }); const vt = T(gg, x + w, y, "", { size: 12, anchor: "end", fill: INK, weight: 600 });
  bands.forEach(([f, t, col]) => R(gg, sx(f), y + 8, Math.max(1, sx(t) - sx(f)), 5, { fill: COL[col] || col }));
  R(gg, x, y + 8, w, 5, { stroke: DIM, sw: 1 }); reds.forEach((v) => L(gg, sx(v), y + 5, sx(v), y + 16, { stroke: COL.red, w: 2.4 }));
  const ptr = P(gg, "", { fill: focus ? ACC : INK, stroke: "none" });
  const api = { gg, set(v) { const px = sx(v); ptr.setAttribute("d", `M${r1(px)},${y + 14} l-5,7 l10,0 z`); vt.textContent = fmt(v); } };
  if (o.value != null) api.set(o.value); return api;
}
