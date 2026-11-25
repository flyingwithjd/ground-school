// E6B computer side, simplified (PHAK 16; the E6B is a circular slide rule): the inner disk turns so its rate arrow (60)
// sits under the speed or fuel burn on the outer scale; then every outer number lines up with its inner partner.
// Two modes: time from distance and groundspeed, and fuel from time and fuel burn (plus the 91.151 day reserve).
// Static scene: redraws only on input or resize.
import { slider, chips, row } from "./base.js?v=124d9a2f12";
import { pxScene, T, C, L, P, wrapT, ACC, INK, GRAY, DIM, BODY } from "./kit.js?v=124d9a2f12";
const LAB = [10, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];
const frac = (v) => { const l = Math.log10(v); return l - Math.floor(l); };
const digits = (v) => { let d = v; while (d >= 100) d /= 10; while (d < 10) d *= 10; return d; };
const ang = (v) => frac(v) * 2 * Math.PI;                       // 10 at the top, clockwise
const hm = (m) => { m = Math.round(m); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`; };
export function mount(host) {
  let mode = "time", gs = 100, dist = 120, gph = 8.5, mins = 72;
  const S = pxScene(host, { corners: { tl: "Flight computer (E6B)", tr: "PHAK 16" } }, draw);
  chips(row(S.F.ctrl), [["time", "Time en route"], ["fuel", "Fuel needed"]], mode, (v) => { mode = v; setup(); S.redraw(); }, { label: "Solve for" });
  const r2 = row(S.F.ctrl), a = slider(r2, { label: "Groundspeed", min: 60, max: 160, step: 5, value: gs, oninput: (v) => { mode === "time" ? (gs = v) : (gph = v); S.redraw(); } });
  const r3 = row(S.F.ctrl), b = slider(r3, { label: "Distance", min: 20, max: 200, step: 5, value: dist, oninput: (v) => { mode === "time" ? (dist = v) : (mins = v); S.redraw(); } });
  // same two sliders in both modes (relabelled), so the controls never move
  function re(sl, label, min, max, step, v, fmt) { sl.el.querySelector("label").textContent = label; sl.input.setAttribute("aria-label", label); Object.assign(sl.input, { min, max, step }); sl.fmt = fmt; sl.input.value = v; sl.el.querySelector("output").textContent = fmt(v); }
  const fA = () => (mode === "time" ? `${a.value} kt` : `${(+a.value).toFixed(1)} gal/h`), fB = () => (mode === "time" ? `${b.value} NM` : `${b.value} min`);
  a.input.addEventListener("input", () => (a.el.querySelector("output").textContent = fA())); b.input.addEventListener("input", () => (b.el.querySelector("output").textContent = fB()));
  function setup() { if (mode === "time") { re(a, "Groundspeed", 60, 160, 5, gs, (v) => `${v} kt`); re(b, "Distance", 20, 200, 5, dist, (v) => `${v} NM`); }
    else { re(a, "Fuel burn", 6, 12, 0.5, gph, (v) => `${(+v).toFixed(1)} gal/h`); re(b, "Time", 15, 180, 5, mins, (v) => `${v} min`); } }
  setup();
  function draw(g, W, H, top) {
    const ph = W < 520, fuel = mode === "fuel";
    const rate = fuel ? gph : gs, given = fuel ? mins : dist;            // rate arrow under `rate`; `given` read on the matching scale
    const ans = fuel ? (mins / 60) * gph : (dist / gs) * 60;          // gallons, or minutes
    // dial: left half on wide screens, left part on a phone
    const R = Math.max(60, Math.min((H - top - 12) / 2, ph ? W * 0.27 : W * 0.24)), cx = (ph ? 10 : 24) + R, cy = top + (H - top - 6) / 2, ri = R - 24;
    const rot = ang(rate) - ang(60), tg = fuel ? ang(given) + rot : ang(given);   // fuel: time on the inner disk; time: distance on the outer scale
    const near = (t) => { const d = Math.abs(((t - tg) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return d < 30 / ri; };   // keep the blue answer clear of a gray label
    C(g, cx, cy, R + 2, { stroke: INK, sw: 1.5, fill: "#0c0c0e" });
    // outer scale (fixed): distance or fuel
    for (let v = 10; v < 100; v += v < 20 ? 1 : v < 50 ? 2 : 5) { const t = ang(v), big = LAB.includes(v); L(g, cx + Math.sin(t) * R, cy - Math.cos(t) * R, cx + Math.sin(t) * (R - (big ? 7 : 4)), cy - Math.cos(t) * (R - (big ? 7 : 4)), { stroke: GRAY, w: 1 }); }
    const show = ph ? [10, 15, 20, 30, 40, 50, 60, 80] : LAB;
    for (const v of show) { const t = ang(v); if (near(t)) continue; T(g, cx + Math.sin(t) * (R - 15), cy - Math.cos(t) * (R - 15) + 4, String(v), { size: 11, anchor: "middle", fill: GRAY }); }
    // inner disk (turns): minutes; its rate arrow (60) sits under the rate on the outer scale
    C(g, cx, cy, ri, { stroke: INK, sw: 1.5, fill: BODY });
    for (let v = 10; v < 100; v += v < 20 ? 1 : v < 50 ? 2 : 5) { const t = ang(v) + rot, big = LAB.includes(v); L(g, cx + Math.sin(t) * ri, cy - Math.cos(t) * ri, cx + Math.sin(t) * (ri - (big ? 7 : 4)), cy - Math.cos(t) * (ri - (big ? 7 : 4)), { stroke: DIM, w: 1 }); }
    for (const v of show) { if (v === 60) continue; const t = ang(v) + rot; if (near(t)) continue; T(g, cx + Math.sin(t) * (ri - 15), cy - Math.cos(t) * (ri - 15) + 4, String(v), { size: 11, anchor: "middle", fill: DIM }); }
    // rate arrow (blue triangle at inner 60)
    { const t = ang(60) + rot, x = cx + Math.sin(t) * (ri - 2), y = cy - Math.cos(t) * (ri - 2), nx = Math.sin(t), ny = -Math.cos(t), px = -ny, py = nx;
      P(g, `M${x},${y} L${x - nx * 12 + px * 6},${y - ny * 12 + py * 6} L${x - nx * 12 - px * 6},${y - ny * 12 - py * 6} Z`, { stroke: ACC, fill: ACC, w: 1 }); }
    // the reading: given on one scale, answer on the other, along one radius
    L(g, cx + Math.sin(tg) * (ri - 4), cy - Math.cos(tg) * (ri - 4), cx + Math.sin(tg) * (R + 2), cy - Math.cos(tg) * (R + 2), { stroke: ACC, w: 2 });
    // both numbers of the reading in blue: outer (distance or gallons) and inner (minutes), on one radius
    const blue = (r, v) => { const e = T(g, cx + Math.sin(tg) * r, cy - Math.cos(tg) * r + 4, String(Math.round(digits(v))), { size: 12, anchor: "middle", fill: ACC, weight: 700 }); e.setAttribute("stroke", "#0c0c0e"); e.setAttribute("stroke-width", "5"); e.setAttribute("paint-order", "stroke"); };
    blue(R - 15, fuel ? ans : dist); blue(ri - 15, fuel ? mins : ans);
    C(g, cx, cy, 4, { fill: INK });
    // the arithmetic, beside the dial
    const x0 = cx + R + (ph ? 14 : 30), wcol = W - x0 - 10, n = Math.max(14, Math.floor(wcol / 7.6));
    let y = top + (ph ? 6 : 14);
    const line = (s, o = {}) => { for (const t of wrapT(s, o.n || n)) { T(g, x0, y, t, { size: o.size || 12, fill: o.fill || GRAY, weight: o.w || 500, mono: o.mono !== false }); y += (o.lh || 17); } };
    line(fuel ? "TIME × FUEL BURN" : "DISTANCE ÷ GROUNDSPEED", { size: 11, fill: GRAY });
    line(fuel ? `${mins} min × ${gph.toFixed(1)} gal/h` : `${dist} NM ÷ ${gs} kt`, { fill: INK, size: ph ? 12 : 13 });
    y += ph ? 9 : 14; line(fuel ? `= ${ans.toFixed(1)} gal` : `= ${hm(ans)}`, { fill: ACC, size: ph ? 16 : 22, w: 700, lh: ph ? 22 : 30 });
    if (fuel) { const res = Math.round(gph * 5) / 10, tot = Math.round(ans * 10) / 10 + res; line(`+ day reserve, 30 min: ${res.toFixed(1)} gal`, { size: 12 }); line(`= ${tot.toFixed(1)} gal minimum`, { fill: INK, size: 12, w: 600 }); }
    else line(`${(ans / 60).toFixed(2)} h`, { size: 12 });
    y += ph ? 4 : 10; line(fuel ? "OUTER: GALLONS · INNER: MINUTES" : "OUTER: NM · INNER: MINUTES", { size: 11, fill: GRAY, lh: 16 });
    y += ph ? 4 : 8;
    if (!ph || H - y > 60) line(fuel ? `On the dial: ▲ under ${gph.toFixed(1)} (read as ${Math.round(digits(gph))}); above ${mins} on the disk, read ${ans.toFixed(1)}.` : `On the dial: ▲ under ${gs}; under ${dist} on the outside, read ${Math.round(ans)} min.`, { size: 12, mono: false, n: Math.floor(wcol / 6.6), lh: 16 });
    S.F.caption(fuel ? `${mins} min at ${gph.toFixed(1)} gal/h` : `${dist} NM at ${gs} kt`, fuel ? `${ans.toFixed(1)} gal + reserve` : `ETE ${hm(ans)}`);
    S.F.explain(`The E6B's computer side is a circular slide rule. Put the <strong>rate arrow</strong> (60, one hour) under the groundspeed or fuel burn on the outer scale; then distance on the outside lines up with minutes on the inside, and minutes on the inside line up with gallons on the outside. The dial only shows digits, so you place the decimal point with a quick estimate. <span class="src">PHAK 16 · 14 CFR 91.151</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
