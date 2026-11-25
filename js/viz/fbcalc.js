// Winds aloft (FB) to groundspeed: pick the altitude with the best wind for your true course (PHAK 13; AWH).
// Made-up forecast in the real format, never current weather. Static scene: redraws only on input or resize.
import { slider, row } from "./base.js?v=179674840b";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY } from "./kit.js?v=179674840b";
const FB = [[12000, "2742-03"], [9000, "2728+03"], [6000, "2615+09"], [3000, "9900"]];
function dec(code) { if (code.startsWith("9900")) return { d: 0, s: 0, t: null, lv: true };
  let d = +code.slice(0, 2) * 10, s = +code.slice(2, 4); if (d > 360) { d -= 500; s += 100; }
  return { d, s, t: code.length > 4 ? +code.slice(4) : null }; }
const rad = (a) => (a * Math.PI) / 180;
export function mount(host) {
  let tc = 90, tas = 110;
  const S = pxScene(host, { cls: "fbc", corners: { tl: "Winds aloft → groundspeed", tr: "PHAK 13" } }, draw);
  slider(row(S.F.ctrl), { label: "True course", min: 0, max: 355, step: 5, value: tc, fmt: (x) => String(x).padStart(3, "0") + "°", oninput: (x) => { tc = x; S.redraw(); } });
  slider(row(S.F.ctrl), { label: "True airspeed", min: 90, max: 140, step: 5, value: tas, fmt: (x) => `${x} kt`, oninput: (x) => { tas = x; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = ph ? 14 : 28, x1 = W - (ph ? 14 : 28), rh = (H - top - 10) / FB.length;
    const rows = FB.map(([alt, code]) => { const w = dec(code), rel = rad(w.d - tc), head = w.s * Math.cos(rel), cross = w.s * Math.sin(rel);
      const gs = Math.sqrt(Math.max(0, tas * tas - cross * cross)) - head; return { alt, code, w, head, gs }; });
    const best = rows.reduce((a, b) => (b.gs > a.gs ? b : a));
    const cAlt = x0, cCode = x0 + (ph ? 58 : 92), cRose = cCode + (ph ? 102 : 244), bar0 = cRose + (ph ? 26 : 40), gsMax = 170;
    rows.forEach((r, i) => {
      const y = top + 6 + i * rh, ym = y + rh / 2, on = r === best;
      if (i) L(g, x0, y, x1, y, { stroke: "rgba(242,241,236,.12)", w: 1 });
      T(g, cAlt, ym - 2, ph ? r.alt / 1000 + "k" : r.alt.toLocaleString(), { size: ph ? 13 : 15, fill: on ? ACC : INK, weight: 600 });
      T(g, cAlt, ym + 15, "ft", { size: 11, fill: GRAY });
      T(g, cCode, ym - 2, r.code, { size: ph ? 13 : 15, fill: on ? ACC : INK, weight: 600 });
      const isa = 15 - (2 * r.alt) / 1000;
      T(g, cCode, ym + 15, r.w.lv ? (ph ? "light/var" : "light and variable") : `${String(r.w.d).padStart(3, "0")}° ${r.w.s} kt${ph || r.w.t == null ? "" : ` · ${r.w.t} °C (ISA ${r.w.t - isa >= 0 ? "+" : ""}${Math.round(r.w.t - isa)})`}`, { size: 11, fill: GRAY });
      // little rose: course up (white), wind from its true direction relative to the course (blue)
      const rr = Math.min(ph ? 14 : 18, rh / 2 - 10); C(g, cRose, ym, rr, { stroke: "rgba(242,241,236,.4)", sw: 1 });
      P(g, `M${cRose - 4},${ym - rr - 1} L${cRose},${ym - rr - 8} L${cRose + 4},${ym - rr - 1} Z`, { fill: INK, stroke: INK, w: 1 });   // your course, always up
      if (!r.w.lv) { const a = rad(r.w.d - tc); L(g, cRose + Math.sin(a) * rr * 0.95, ym - Math.cos(a) * rr * 0.95, cRose - Math.sin(a) * rr * 0.55, ym + Math.cos(a) * rr * 0.55, { stroke: ACC, w: 2, arrow: true }); }
      else C(g, cRose, ym, 2.5, { fill: GRAY });
      const bw = ((x1 - bar0 - (ph ? 0 : 6)) * Math.max(0, r.gs)) / gsMax, bh = Math.min(22, rh * 0.4);
      R(g, bar0, ym - bh / 2, bw, bh, { fill: on ? ACC : "rgba(242,241,236,.18)", stroke: on ? "none" : "rgba(242,241,236,.5)", sw: 1, rx: 3 });
      const lab = `${Math.round(r.gs)} kt`, inside = bw > 60;
      T(g, inside ? bar0 + bw - 6 : bar0 + bw + 6, ym + 4, lab, { size: 12, anchor: inside ? "end" : "start", fill: on ? (inside ? "#0a0a0a" : ACC) : INK, weight: 600 });
      if (!ph) T(g, bar0, ym - bh / 2 - 6, r.w.lv ? "no wind effect" : r.head >= 0.5 ? `${Math.round(r.head)} kt headwind` : r.head <= -0.5 ? `${Math.round(-r.head)} kt tailwind` : "pure crosswind", { size: 11, fill: GRAY });
    });
    S.F.caption(`True course ${String(tc).padStart(3, "0")}° · TAS ${tas} kt · groundspeed`, `Best: ${best.alt.toLocaleString()} ft, ${Math.round(best.gs)} kt`);
    S.F.explain(`Decode each level: the first two digits × 10 are the true direction the wind blows from, the next two the speed, then the temperature. 9900 is light and variable. Lay that wind against your <strong>true</strong> course (FB winds are true) and compare groundspeeds. Higher isn't always better: count the climb, the clouds and the freezing level too. The forecast here is made up, never current weather. <span class="src">PHAK 13 · AWH</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
