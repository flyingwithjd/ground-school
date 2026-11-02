// Airspace cross-section (AIM 3-2): tap a class to see its typical floor, ceiling and what it asks of a VFR pilot.
import { pxScene, T, TL, L, R, P, hit, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=4258458bcd";
import { chips } from "./base.js?v=4258458bcd";
const INFO = {
  A: ["Class A", "18,000 ft MSL up to and including FL600", "IFR only. Not for VFR pilots.", "AIM 3-2-2"],
  B: ["Class B", "Surface to typically 10,000 ft MSL, in layers like an upside-down wedding cake, around the busiest airports", "ATC clearance to enter. Transponder with altitude reporting and ADS-B Out within the 30 NM Mode C veil. Student pilots need specific training and an endorsement, and some Class B primary airports are off-limits to student solo.", "AIM 3-2-3 · 14 CFR 61.95, 91.131"],
  C: ["Class C", "Surface to 4,000 ft above the airport: a 5 NM core, plus a 10 NM shelf from 1,200 ft", "Two-way radio contact before entry. Transponder with altitude reporting and ADS-B Out.", "AIM 3-2-4"],
  D: ["Class D", "Surface to 2,500 ft above the airport, around towered airports", "Two-way radio contact before entry.", "AIM 3-2-5"],
  E: ["Class E", "Controlled airspace that isn't A, B, C or D. Often begins at 700 ft AGL (magenta vignette) or 1,200 ft AGL (blue vignette), or at the surface around some airports; runs up to, not including, 18,000 ft MSL", "No ATC contact required for VFR. Weather minimums apply.", "AIM 3-2-6"],
  G: ["Class G", "Uncontrolled: whatever is left below Class E", "No ATC contact required. Lowest weather minimums.", "AIM 3-3"],
};
export function mount(host) {
  let sel = "C";
  const S = pxScene(host, { cls: "tall", corners: { tl: "Airspace cross-section", tr: "AIM 3-2 · not to scale" } }, draw);
  const ch = chips(S.F.ctrl, ["A", "B", "C", "D", "E", "G"].map((k) => [k, "Class " + k]), sel, (v) => { sel = v || sel; S.redraw(); }, { label: "Airspace class" });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 8, x1 = W - 8, gy = H - 24, fs = ph ? 11 : 12;
    // schematic heights (not to scale): ground .. 1,200/700 AGL floors .. Class D/C tops .. Class B top .. 18,000 MSL
    const span = gy - top, yA = top + 6, y18 = top + span * 0.2, yB = top + span * 0.34;
    const yC = gy - span * 0.34, yCs = gy - span * 0.16, yD = gy - span * 0.26, y12 = gy - span * 0.1, y7 = gy - span * 0.055;
    const X = (f) => x0 + (x1 - x0) * f, BG = "#0A0A0B";
    const bS = [yB, yB + (gy - yB) * 0.3, yB + (gy - yB) * 0.6];
    const shapes = {
      A: `M${X(0)},${yA} H${X(1)} V${y18} H${X(0)} Z`,
      // Class E: everything between its floor (1,200 AGL; 700 AGL near X .76-.96; surface at X .84-.88) and 18,000 MSL
      E: `M${X(0)},${y18} H${X(1)} V${y12} H${X(0.96)} V${y7} H${X(0.88)} V${gy} H${X(0.84)} V${y7} H${X(0.76)} V${y12} H${X(0)} Z`,
      G: `M${X(0)},${y12} H${X(0.76)} V${y7} H${X(0.84)} V${gy} H${X(0)} Z M${X(0.88)},${y7} H${X(0.96)} V${y12} H${X(1)} V${gy} H${X(0.88)} Z`,
      B: `M${X(0.01)},${bS[0]} H${X(0.31)} V${bS[1]} H${X(0.25)} V${bS[2]} H${X(0.2)} V${gy} H${X(0.12)} V${bS[2]} H${X(0.07)} V${bS[1]} H${X(0.01)} Z`,
      C: `M${X(0.35)},${yC} H${X(0.59)} V${yCs} H${X(0.52)} V${gy} H${X(0.42)} V${yCs} H${X(0.35)} Z`,
      D: `M${X(0.64)},${yD} H${X(0.73)} V${gy} H${X(0.64)} Z`,
    };
    for (const k of ["A", "G", "E", "B", "C", "D"]) {
      const on = k === sel, solid = "BCD".includes(k);
      if (solid) P(g, shapes[k], { fill: BG, w: 0 });
      const p = P(g, shapes[k], { stroke: on ? ACC : k === "G" ? DIM : GRAY, w: on ? 2.4 : 1.2, dash: k === "G" && !on ? "4 4" : null, fill: on ? ACCM : k === "A" ? "rgba(242,241,236,.07)" : k === "E" ? "rgba(242,241,236,.03)" : solid ? "rgba(242,241,236,.06)" : "rgba(0,0,0,0)" });
      hit(g, p, "Class " + k, () => { sel = k; ch.set(k); S.redraw(); });
    }
    L(g, x0, gy, x1, gy, { stroke: GRAY, w: 2 });
    const lab = (k, x, y) => T(g, x, y, k, { anchor: "middle", size: ph ? 14 : 16, fill: k === sel ? INK : GRAY, weight: 500 });
    lab("A", X(0.5), (yA + y18) / 2 + 5); lab("B", X(0.16), (yB + bS[1]) / 2 + 5); lab("C", X(0.47), (yC + yCs) / 2 + 5); lab("D", X(0.685), (yD + gy) / 2 + 5); lab("E", X(0.62), (y18 + yC) / 2 + 5); lab("G", X(0.32), (y12 + gy) / 2 + 5);
    T(g, X(0.99), y18 - 6, "18,000 MSL", { anchor: "end", size: 11, fill: GRAY });
    T(g, X(0.995), y12 - 6, "1,200 AGL", { anchor: "end", size: 11, fill: GRAY });
    T(g, X(0.92), y7 - 6, "700", { anchor: "middle", size: 11, fill: GRAY });
    for (const f of [0.16, 0.47, 0.685, 0.86]) R(g, X(f) - 8, gy - 3, 16, 3, { fill: INK });
    T(g, X(0.86), gy + 16, ph ? "E sfc" : "E surface area", { anchor: "middle", size: 11, fill: GRAY });
    T(g, X(0.16), gy + 16, "B", { anchor: "middle", size: 11, fill: GRAY }); T(g, X(0.47), gy + 16, "C", { anchor: "middle", size: 11, fill: GRAY }); T(g, X(0.685), gy + 16, "D", { anchor: "middle", size: 11, fill: GRAY });
    const I = INFO[sel]; S.F.caption(I[0], I[2].split(".")[0] + ".");
    S.F.explain(`<b>${I[0]}:</b> ${I[1]}. ${I[2]} <span class="src">${I[3]}</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
