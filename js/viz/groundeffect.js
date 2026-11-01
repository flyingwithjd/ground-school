// Ground effect: wing height vs induced drag. Reductions are PHAK Ch 5's figures at 1, 1/4 and 1/10 span. Labels in screen px.
import { chips } from "./base.js?v=b55f063b47";
import { pxScene, T, L, P, R, C, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=b55f063b47";
const H = { out: { f: 1.3, red: 0, lab: "> 1 span", cap: ["Out of ground effect", "Full-strength vortices"], t: "Well above the runway the wingtip vortices and downwash form freely. Induced drag is normal." },
  one: { f: 1, red: 1.4, lab: "1 span", cap: ["Height = one wingspan", "Induced drag −1.4%"], t: "At a height equal to its span, the wing's induced drag is only 1.4% lower: barely noticeable. <span class=\"src\">PHAK 5</span>" },
  qtr: { f: 0.25, red: 23.5, lab: "¼ span", cap: ["Height = ¼ wingspan", "Induced drag −23.5%"], t: "The ground squeezes the downwash and the vortices. Induced drag falls by about a quarter, so the airplane floats if you arrive fast. <span class=\"src\">PHAK 5</span>" },
  tenth: { f: 0.1, red: 47.6, lab: "⅒ span", cap: ["Height = ⅒ wingspan", "Induced drag −47.6%"], t: "Just above the runway, induced drag is nearly halved. The airplane can fly here below the speed it needs to climb away, so a too-early liftoff can't climb out of ground effect. <span class=\"src\">PHAK 5</span>" } };
export function mount(host) {
  let k = "qtr";
  const S = pxScene(host, { cls: "tall", corners: { tl: "Ground effect · from behind", tr: "PHAK 5" } }, draw);
  chips(S.F.ctrl, [["out", "Out of ground effect"], ["one", "1 span"], ["qtr", "¼ span"], ["tenth", "⅒ span"]], k, (v) => { k = v || k; S.redraw(); }, { label: "Wing height" });
  function draw(g, W, H0, top) {
    const ph = W < 520, c = H[k], gy = H0 - (ph ? 86 : 80), span = Math.min(W - 90, (gy - top - 40) / 1.3, 520), cx = W / 2 - (ph ? 12 : 0);
    const wy = gy - c.f * span; // true geometry: height drawn to the same scale as the span
    // runway
    L(g, 12, gy, W - 12, gy, { stroke: GRAY, w: 2 }); T(g, W - 14, gy + 16, "RUNWAY", { anchor: "end", size: 11, fill: GRAY });
    // airplane from behind: wing, fuselage circle, tail fin
    L(g, cx - span / 2, wy, cx + span / 2, wy, { stroke: INK, w: 3 }); C(g, cx, wy + 4, 9, { stroke: INK, sw: 2, fill: "#0A0A0B" }); L(g, cx, wy - 5, cx, wy - 26, { stroke: INK, w: 2.4 });
    // vortices: ellipses, flattened by the ground
    const room = gy - wy, rr = Math.max(6, Math.min(span * 0.16, room * 0.45)), sq = k === "tenth" ? 0.45 : k === "qtr" ? 0.75 : 1;
    for (const sd of [-1, 1]) { const vx = cx + sd * span / 2, vy = Math.min(wy + rr * sq * 0.6, gy - rr * sq - 2);
      for (const f of [1, 0.65, 0.35]) P(g, `M${vx + rr * f * 1.1},${vy} A${rr * f * 1.1},${rr * f * sq} 0 1 ${sd > 0 ? 1 : 0} ${vx - rr * f * 1.1},${vy} A${rr * f * 1.1},${rr * f * sq} 0 1 ${sd > 0 ? 1 : 0} ${vx + rr * f * 1.1},${vy}`, { stroke: f === 1 ? GRAY : DIM, w: 1.4 }); }
    T(g, cx - span / 2, wy - rr * sq - 10, "WINGTIP VORTEX", { anchor: "middle", size: 11, fill: GRAY });
    // downwash arrows
    const len = Math.min(56, room * 0.55); for (const i of [-1, 0, 1]) if (len > 14) L(g, cx + i * span * 0.22, wy + 14, cx + i * span * 0.22, wy + 14 + len, { stroke: DIM, w: 1.8, arrow: "kahg" });
    // height dimension
    if (k !== "out") { const hx = Math.min(W - 14, cx + span / 2 + rr * 1.2 + 14); L(g, hx, wy, hx, gy, { stroke: ACC, w: 2 }); T(g, hx - 6, wy - 8, c.lab, { anchor: "end", size: ph ? 12 : 13, fill: ACC, weight: 600 }); }
    // induced drag bar
    const by = H0 - 46, bx0 = 16, bx1 = W - 16, bw = bx1 - bx0;
    T(g, bx0, by - 10, "INDUCED DRAG", { size: 11, fill: GRAY });
    R(g, bx0, by, bw, 14, { stroke: DIM, sw: 1, rx: 3 }); R(g, bx0, by, bw * (1 - c.red / 100), 14, { fill: ACC, rx: 3 });
    T(g, bx1, by - 10, c.red ? `−${c.red}%` : "100%", { anchor: "end", size: 12, fill: INK, weight: 600 });
    S.F.caption(c.cap[0], c.cap[1]); S.F.explain(c.t);
  }
  return { destroy() { S.F.destroy(); } };
}
