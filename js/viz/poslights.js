// Position lights at night (AFH 11, 14 CFR 91.113): turn the other airplane and see which lights face you.
import { slider } from "./base.js?v=b01e5791a1";
import { pxScene, T, L, C, planeTop, ACC, INK, GRAY, DIM } from "./kit.js?v=b01e5791a1";
const RED = "#E5484D", GRN = "#30A46C";
export function mount(host) {
  let hdg = 270;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Position lights", tr: "AFH 11 · 91.113" } }, draw);
  slider(S.F.ctrl, { label: "Other airplane's heading", min: 0, max: 345, step: 15, value: hdg, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { hdg = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, mx = W / 2, my = top + (H - top) * 0.32, sz = ph ? 64 : 80, you = H - 46;
    // b = your bearing from the other airplane, measured clockwise from its nose (you are due south of it).
    // Each light shines over its own sector (red ahead-left, green ahead-right, white aft), so the colors you see tell its direction.
    const b = ((180 - hdg) % 360 + 360) % 360, head = b <= 5 || b >= 355;
    const seeGreen = head || (b > 0 && b < 110), seeRed = head || (b > 250 && b < 360), seeTail = !head && b >= 110 && b <= 250;
    let what, verdict;
    if (head) { what = "Red on your right, green on your left: coming toward you."; verdict = "Possible collision course. Head-on: both of you alter course to the right."; }
    else if (seeTail) { what = "Only white: you see its tail. Moving away."; verdict = "Overtaking? It has the right-of-way; pass well clear on the right."; }
    else if (seeRed) { what = "Only red: crossing from your right to your left."; verdict = "If you're converging, it's on your right: it has the right-of-way. Give way."; }
    else { what = "Only green: crossing from your left to your right."; verdict = "If you're converging, it's on your left: you have the right-of-way, but keep watching."; }
    // other airplane (screen: up = north)
    planeTop(g, mx, my, hdg, sz, { stroke: GRAY, w: 1.6 });
    const k = sz / 28, rt = (x, y) => { const a = (hdg * Math.PI) / 180; return [mx + (x * Math.cos(a) - y * Math.sin(a)) * k, my + (x * Math.sin(a) + y * Math.cos(a)) * k]; };
    const [lx, ly] = rt(-14, 1.2), [gx, gy] = rt(14, 1.2), [tx, ty] = rt(0, 12);
    C(g, lx, ly, 6, { fill: RED }); C(g, gx, gy, 6, { fill: GRN }); C(g, tx, ty, 5, { fill: INK });
    // you, looking north
    planeTop(g, mx, you, 0, ph ? 30 : 36, { stroke: ACC, w: 2 }); T(g, mx + 30, you + 4, "YOU", { size: 11, fill: ACC });
    L(g, mx, you - 24, mx, my + sz * 0.6, { stroke: DIM, dash: "3 6" });
    // what you see: a row of lights as seen from behind your windshield
    const vy = (my + you) / 2 + 6, items = [];
    const ang = (hdg * Math.PI) / 180, sx = (x) => x * Math.cos(ang); // projected left-right position as seen from the south
    if (seeRed) items.push([head ? 14 : sx(-14), RED, "RED"]);
    if (seeGreen) items.push([head ? -14 : sx(14), GRN, "GREEN"]);
    if (seeTail) items.push([sx(0), INK, "WHITE"]);
    T(g, 16, vy - 24, "WHAT YOU SEE", { size: 11, fill: GRAY });
    items.forEach(([x, c, n]) => { const X = mx + x * (ph ? 4 : 5); C(g, X, vy, 7, { fill: c }); T(g, X, vy + 24, n, { anchor: "middle", size: 11, fill: GRAY }); });
    S.F.caption("What you see", what.split(":")[0]);
    S.F.explain(`${what} ${verdict} Red left wingtip, green right, white tail. <span class="src">AFH 11 · 14 CFR 91.113</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
