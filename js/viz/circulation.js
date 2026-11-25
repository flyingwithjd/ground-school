// Wind around a high and a low, Northern Hemisphere, top view (PHAK 12). Aloft, Coriolis balances the pressure force and
// the wind blows along the isobars: clockwise around a high, counterclockwise around a low. Near the surface, friction slows
// it, so it crosses the isobars: spiraling out of the high and into the low. Continuous animation, on screen only, 30 fps cap.
import { chips, row, loop } from "./base.js?v=d5b31b47a9";
import { pxScene, T, L, C, P, ACC, INK, GRAY } from "./kit.js?v=d5b31b47a9";
const N = 22;
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const PTS = [0, 1].map(() => Array.from({ length: N }, () => ({ a: rnd() * 2 * Math.PI, r: rnd(), w: 0.8 + rnd() * 0.4 })));
export function mount(host) {
  let mode = "sfc", t = 0, last = 0;
  const S = pxScene(host, { cls: "circ", corners: { tl: "N. Hemisphere · top view", tr: "PHAK 12" } }, draw);
  chips(row(S.F.ctrl), [["aloft", "Aloft: above friction"], ["sfc", "Near the surface"]], mode, (v) => { mode = v || mode; S.redraw(); }, { label: "Level" });
  const run = loop(S.F, (now) => { if (now - last < 33) return; last = now; t = now / 1000; S.redraw(); }); run.start();
  function draw(g, W, H, top) {
    const ph = W < 520, cy = top + (H - top) / 2 - 2, R = Math.min(W * 0.21, (H - top) / 2 - 24), sys = [[W * 0.27, "H", 1], [W * 0.73, "L", -1]];
    const sfc = mode === "sfc";
    sys.forEach(([cx, lab, dir], si) => {
      for (const f of [0.38, 0.66, 0.94]) P(g, ellipse(cx, cy, R * f, R * f * 0.86), { stroke: "rgba(242,241,236,.28)", w: 1.2 });
      T(g, cx, cy + 9, lab, { size: 26, weight: 700, anchor: "middle", fill: INK, mono: false });
      T(g, cx, cy - R * 0.86 - 8, lab === "H" ? (ph ? "high" : "high pressure") : (ph ? "low" : "low pressure"), { size: 11, fill: GRAY, anchor: "middle" });
      // particles: angle advances (clockwise round the high, counterclockwise round the low); at the surface they also drift out of the high / into the low
      for (const p of PTS[si]) {
        const a = p.a + dir * t * 0.5 * p.w, fr = sfc ? ((p.r + (dir > 0 ? 1 : -1) * t * 0.06 * p.w) % 1 + 1) % 1 : p.r;
        const rr = R * (0.22 + 0.74 * fr), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.86;
        const ta = a + dir * Math.PI / 2 + (sfc ? -0.5 : 0);   // tangent; friction turns it ~30° toward low pressure
        const len = ph ? 10 : 13, op = sfc ? Math.min(1, fr * 5, (1 - fr) * 5) : 1, ux = Math.cos(ta), uy = Math.sin(ta) * 0.86, n = Math.hypot(ux, uy), dx = ux / n, dy = uy / n;
        L(g, x - dx * len, y - dy * len, x, y, { stroke: ACC, w: 1.8, op: 0.9 * op });
        P(g, `M${x + dx * 4},${y + dy * 4} L${x - dx * 2 - dy * 3.2},${y - dy * 2 + dx * 3.2} L${x - dx * 2 + dy * 3.2},${y - dy * 2 - dx * 3.2} Z`, { fill: ACC, stroke: ACC, w: 1, op: 0.9 * op });
      }
      T(g, cx, cy + R * 0.86 + 18, lab === "H" ? (sfc ? "clockwise, out" : "clockwise") : (sfc ? "counterclockwise, in" : "counterclockwise"), { size: 11, fill: INK, anchor: "middle" });
    });
    S.F.caption(sfc ? "Friction slows the wind near the ground" : "Above the friction layer", sfc ? "Wind crosses the isobars toward the low" : "Wind blows along the isobars");
    S.F.explain(`Air is pushed from high pressure toward low, and the Earth's rotation (the Coriolis force) deflects it to the right in the Northern Hemisphere. ${sfc ? "Within about 2,000 ft of the ground, friction slows the wind, Coriolis weakens, and the wind angles across the isobars: out of the high and into the low. Converging air in a low rises, which is why lows bring clouds and weather; air sinking out of a high brings fair skies." : "Above about 2,000 ft the two forces balance and the wind flows parallel to the isobars, clockwise around a high and counterclockwise around a low. Closer isobars mean stronger wind."} <span class="src">PHAK 12</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
function ellipse(cx, cy, rx, ry) { return `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0`; }
