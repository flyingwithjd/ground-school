// See and avoid (AIM 8-1-6; PHAK 17): the view out the windshield split into 10° blocks. Step through the scan; only the
// block you're looking at is in sharp focus, so a distant airplane shows up only when your scan reaches it. Static scene.
import { slider, row } from "./base.js?v=4d40905da2";
import { pxScene, T, L, R, ACC, INK, GRAY, ACCF } from "./kit.js?v=4d40905da2";
const N = 9, TGT = 6;
export function mount(host) {
  let b = 1;
  const S = pxScene(host, { cls: "scanb", corners: { tl: "Block scan · 10° at a time", tr: "AIM 8-1-6" } }, draw);
  slider(row(S.F.ctrl), { label: "Looking at", min: 1, max: N, step: 1, value: b, fmt: (v) => `block ${v}`, oninput: (v) => { b = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const m = 10, bw = (W - 2 * m) / N, y0 = top + 6, y1 = H - 34, hy = y0 + (y1 - y0) * 0.55;
    R(g, m, y0, W - 2 * m, y1 - y0, { stroke: "rgba(242,241,236,.3)", sw: 1, rx: 12 });
    L(g, m, hy, W - m, hy, { stroke: "rgba(242,241,236,.35)", w: 1 });
    for (let i = 0; i < N; i++) { const x = m + i * bw, on = i + 1 === b;
      if (on) R(g, x, y0, bw, y1 - y0, { fill: ACCF, stroke: ACC, sw: 2 }); else if (i) L(g, x, y0, x, y1, { stroke: "rgba(242,241,236,.12)", w: 1 });
      T(g, x + bw / 2, y1 + 18, String(i + 1), { size: 11, anchor: "middle", fill: on ? INK : GRAY }); }
    const seen = b === TGT, tx = m + (TGT - 0.5) * bw, ty = hy - (y1 - y0) * 0.18;
    if (seen) { L(g, tx - 11, ty, tx + 11, ty, { stroke: INK, w: 2.4 }); L(g, tx, ty - 5, tx, ty + 3, { stroke: INK, w: 2 }); L(g, tx - 4, ty - 5, tx + 4, ty - 5, { stroke: INK, w: 1.6 }); T(g, tx, ty + 24, "traffic", { size: 11, anchor: "middle", fill: INK }); }
    else { const e = g.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "circle"); e.setAttribute("cx", tx); e.setAttribute("cy", ty); e.setAttribute("r", 1.6); e.setAttribute("fill", "rgba(242,241,236,.35)"); g.append(e); }
    S.F.caption(seen ? "Block 6: the traffic snaps into view" : `Block ${b}: nothing in sharp focus here`, seen ? "Traffic spotted" : "Keep scanning");
    S.F.explain(`Only the small central area of your eye sees fine detail. An airplane you'd spot at 7 miles straight ahead might have to be within 0.7 miles before you notice it off to the side. Move your eyes in steps of about 10°, pause at least a second on each block, and spend most of your time outside. A target with no relative motion that only grows larger is on a collision course. <span class="src">AIM 8-1-6, 8-1-8 · PHAK 17</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
