// Convective outlook reader (AWH 27; Storm Prediction Center): a made-up Day 1 categorical outlook with nested risk areas,
// TSTM through HIGH, in the SPC colors (color is the information). Pick a category to outline it and read what it means;
// a route A to B reports the highest risk it crosses. Static scene: draws only on change.
import { chips, row } from "./base.js?v=27c70f9d2b";
import { pxScene, T, L, C, P, R, hit, INK, GRAY } from "./kit.js?v=27c70f9d2b";
const K = [
  ["tstm", "T", "TSTM", "General thunderstorms", "#C1E9C1", 34, "10% or greater chance of thunderstorms, not expected to be severe. Still lightning, gusts, turbulence, heavy rain and possible hail: no place for a light airplane."],
  ["mrgl", "1", "MRGL", "Marginal risk", "#66A366", 25, "Severe storms possible, but isolated, short-lived or barely severe."],
  ["slgt", "2", "SLGT", "Slight risk", "#F6F67F", 18, "Organized severe storms expected, but in low coverage."],
  ["enh", "3", "ENH", "Enhanced risk", "#E6C27F", 12.5, "More organized severe storms, of varying intensity."],
  ["mdt", "4", "MDT", "Moderate risk", "#E67F7F", 7.5, "Widespread severe weather likely: several tornadoes and/or numerous severe storms, some intense."],
  ["high", "5", "HIGH", "High risk", "#FF7FFF", 3.6, "A severe outbreak expected: numerous intense tornadoes or a long-lived derecho. Rare."],
];
const CX = 60, CY = 30, rad = (r, a) => r * (1 + 0.13 * Math.sin(3 * a + 0.7) + 0.06 * Math.cos(5 * a));
const inside = (x, y, r) => { const dx = (x - CX) / 1.5, dy = y - CY, d = Math.hypot(dx, dy); return d < rad(r, Math.atan2(dy, dx)); };
export function mount(host) {
  let sel = "slgt";
  const S = pxScene(host, { cls: "cvo", corners: { tl: "Outlook (made up)", tr: "AWH 27" } }, draw);
  chips(row(S.F.ctrl), K.map((k) => [k[0], k[2]]), sel, (v) => { sel = v || sel; S.redraw(); }, { label: "Category" });
  function draw(g, W, H, top) {
    const ph = W < 520, k = Math.min((W - 8) / 100, (H - top - 6) / 60), ox = W / 2 - 50 * k, oy = top + 2, m = (x, y) => [ox + x * k, oy + y * k];
    const clip = `cvo${Math.round(Math.random() * 1e6)}`; const cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"); cp.id = clip;
    const cr = document.createElementNS("http://www.w3.org/2000/svg", "rect"); cr.setAttribute("x", ox); cr.setAttribute("y", oy); cr.setAttribute("width", 100 * k); cr.setAttribute("height", 60 * k); cp.append(cr); g.append(cp);
    const gg = document.createElementNS("http://www.w3.org/2000/svg", "g"); gg.setAttribute("clip-path", `url(#${clip})`); g.append(gg);
    const path = (r) => { let d = ""; for (let i = 0; i <= 72; i++) { const a = (i / 72) * 2 * Math.PI, rr = rad(r, a), [x, y] = m(CX + Math.cos(a) * rr * 1.5, CY + Math.sin(a) * rr); d += (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1); } return d + "Z"; };
    K.forEach((q) => { const on = q[0] === sel; const e = P(gg, path(q[5]), { fill: q[4], stroke: on ? "#FFFFFF" : "rgba(0,0,0,.55)", w: on ? 3 : 1, op: 1 }); e.setAttribute("fill-opacity", on ? 0.95 : 0.55); hit(gg, e, `${q[2]}: ${q[3]}`, () => { sel = q[0]; S.redraw(); }); });
    R(g, ox, oy, 100 * k, 60 * k, { stroke: "rgba(242,241,236,.25)", sw: 1 });
    // ring numbers along a ray to the upper left, between each boundary and the next
    K.forEach((q, i) => { const r0 = q[5], r1 = i < K.length - 1 ? K[i + 1][5] : 0, a = 1.15, rr = rad((r0 + r1) / 2, a); const [x, y] = m(CX + Math.cos(a) * rr * 1.5, CY + Math.sin(a) * rr);
      const t = T(g, x, y + 4, q[1], { size: 12, weight: 700, fill: "#0a0a0a", anchor: "middle" }); t.style.pointerEvents = "none"; });
    // route
    const A = [6, 52], B = [96, 6]; let worst = -1; for (let s = 0; s <= 80; s++) { const x = A[0] + (B[0] - A[0]) * s / 80, y = A[1] + (B[1] - A[1]) * s / 80; K.forEach((q, i) => { if (inside(x, y, q[5]) && i > worst) worst = i; }); }
    const [a1, b1] = m(...A), [a2, b2] = m(...B); L(g, a1, b1, a2, b2, { stroke: "#0a0a0a", w: 5, op: 0.6 }); L(g, a1, b1, a2, b2, { stroke: INK, w: 2.2, dash: "8 5" });
    C(g, a1, b1, 5, { fill: INK }); C(g, a2, b2, 5, { fill: INK });
    const lab = (x, y, s, anc) => { const t = T(g, x, y, s, { size: 12, weight: 700, fill: INK, anchor: anc }); t.setAttribute("stroke", "#0a0a0a"); t.setAttribute("stroke-width", 3); t.setAttribute("paint-order", "stroke"); };
    lab(a1 + 8, b1 + 4, "A", "start"); lab(a2 - 8, b2 + 4, "B", "end");
    const q = K.find((x) => x[0] === sel);
    S.F.caption(`${q[2]} · ${q[1] === "T" ? "light green" : "level " + q[1]} · A to B crosses ${worst < 0 ? "none" : K[worst][2]}`, q[3]);
    S.F.explain(`${q[6]} The Storm Prediction Center issues the Day 1 outlook five times a day (0600, 1300, 1630, 2000 and 0100 UTC), plus Day 2 and Day 3 outlooks, each with a text discussion. Categories describe <em>severe</em> storms; any thunderstorm can wreck a light airplane, so plan to stay well clear of every area you can't see around. Made up, never current weather. <span class="src">AWH 27 · spc.noaa.gov · AIM 7-1</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
