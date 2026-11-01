// Basic VFR weather minimums (14 CFR 91.155): pick the airspace and day or night; the cloud-clearance box and visibility redraw.
import { chips } from "./base.js?v=a81f689fed";
import { pxScene, T, L, R, P, C, planeTop, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=a81f689fed";
// [vis SM, below ft, above ft, horizontal label, clearOfClouds]
const M = {
  B: { n: "Class B", day: [3, 0, 0, "", true] },
  CDE: { n: "C, D, E below 10,000 MSL", day: [3, 500, 1000, "2,000 ft"] },
  E10: { n: "E at/above 10,000 MSL", day: [5, 1000, 1000, "1 SM"] },
  G12: { n: "G, 1,200 AGL or below", day: [1, 0, 0, "", true], night: [3, 500, 1000, "2,000 ft"] },
  Gmid: { n: "G, above 1,200 AGL, below 10,000 MSL", day: [1, 500, 1000, "2,000 ft"], night: [3, 500, 1000, "2,000 ft"] },
  G10: { n: "G, above 1,200 AGL and at/above 10,000 MSL", day: [5, 1000, 1000, "1 SM"] },
};
export function mount(host) {
  let a = "CDE", night = false;
  const S = pxScene(host, { cls: "tall", corners: { tl: "VFR weather minimums", tr: "14 CFR 91.155" } }, draw);
  chips(S.F.ctrl, Object.entries(M).map(([k, v]) => [k, v.n]), a, (v) => { a = v || a; S.redraw(); }, { label: "Airspace" });
  chips(S.F.ctrl, [["d", "Day"], ["n", "Night"]], "d", (v) => { night = v === "n"; S.redraw(); }, { label: "Day or night" });
  function draw(g, W, H, top) {
    const m = M[a], r = (night && m.night) || m.day, [vis, below, above, horiz, coc] = r, ph = W < 520;
    const cx = W * (ph ? 0.5 : 0.42), cy = top + (H - top) * 0.48, cw = Math.min(W * 0.36, 230), chh = Math.min((H - top) * 0.22, 70);
    // cloud
    const cl = `M${cx - cw / 2},${cy + chh / 2} q${-cw * 0.08},${-chh * 0.9} ${cw * 0.2},${-chh * 0.8} q${cw * 0.1},${-chh * 0.55} ${cw * 0.32},${-chh * 0.3} q${cw * 0.22},${-chh * 0.45} ${cw * 0.4},${chh * 0.05} q${cw * 0.22},${chh * 0.25} ${cw * 0.08},${chh * 1.05} Z`;
    P(g, cl, { stroke: INK, w: 1.6, fill: "rgba(242,241,236,.10)" });
    if (coc) {
      T(g, cx, cy + chh / 2 + 34, "CLEAR OF CLOUDS", { anchor: "middle", size: ph ? 12 : 14, fill: ACC });
      planeTop(g, cx + cw / 2 + 40, cy + chh / 2 + 4, 90, 26, { stroke: INK });
    } else {
      const bx0 = cx - cw / 2 - (ph ? 40 : 70), bx1 = cx + cw / 2 + (ph ? 40 : 70), by0 = cy - chh / 2 - (above >= 1000 ? 44 : 30), by1 = cy + chh / 2 + (below >= 1000 ? 44 : 26);
      R(g, bx0, by0, bx1 - bx0, by1 - by0, { stroke: ACC, sw: 2, fill: ACCF, dash: "6 5", rx: 6 });
      T(g, cx, by0 - 8, `${above.toLocaleString()} ft above`, { anchor: "middle", size: ph ? 12 : 13, fill: INK });
      T(g, cx, by1 + 18, `${below.toLocaleString()} ft below`, { anchor: "middle", size: ph ? 12 : 13, fill: INK });
      L(g, cx + cw / 2 + 4, cy, bx1 - 2, cy, { stroke: ACC, w: 1.6, arrow: "kah" });
      const hx = bx1 + 6, hstr = `${horiz} horiz.`;
      if (hx + hstr.length * 7.6 < W - 6) T(g, hx, cy + 4, hstr, { size: ph ? 12 : 13, fill: INK });
      else T(g, bx1 - 4, by1 + 36, hstr, { anchor: "end", size: 12, fill: INK });
    }
    // visibility bar along the bottom
    const vy = H - 30, vx0 = 16, vx1 = W - 16, vmax = 5;
    L(g, vx0, vy, vx1, vy, { stroke: DIM, w: 6 });
    L(g, vx0, vy, vx0 + (vx1 - vx0) * (vis / vmax), vy, { stroke: ACC, w: 6 });
    for (const sm of [1, 3, 5]) T(g, vx0 + (vx1 - vx0) * (sm / vmax), vy + 18, sm + " SM", { anchor: sm === 5 ? "end" : "middle", size: 11, fill: sm === vis ? INK : GRAY });
    T(g, vx0, vy - 12, "FLIGHT VISIBILITY", { size: 11, fill: GRAY });
    S.F.caption(m.n + (m.night ? (night ? " · night" : " · day") : ""), coc ? `${vis} SM, clear of clouds` : `${vis} SM · ${below}/${above.toLocaleString()}/${horiz}`);
    let ex = coc ? `Stay clear of clouds with at least ${vis} SM flight visibility.` : `Keep ${vis} SM flight visibility and stay ${below} ft below, ${above.toLocaleString()} ft above and ${horiz} horizontally from clouds.`;
    if (a === "G12" && night) ex += " Exception: at night within ½ mile of the runway in the traffic pattern, 1 SM and clear of clouds.";
    if (a === "CDE") ex += " Inside a surface area you also need a 1,000 ft ceiling, and 3 SM ground visibility to take off, land or enter the pattern.";
    if (!m.night && night) ex += " Same at night.";
    S.F.explain(ex + " Student solo: at least 3 SM by day and 5 SM at night, and your endorsement limits come first. <span class=\"src\">14 CFR 91.155 · 61.89</span>");
  }
  return { destroy() { S.F.destroy(); } };
}
