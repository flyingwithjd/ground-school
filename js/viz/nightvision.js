// The night blind spot (AFH 11, PHAK 17): the fovea has no rods, so a dim light you stare at can vanish. Look about 10° off center.
import { chips } from "./base.js?v=da5a58a7ab";
import { pxScene, T, L, C, R, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=da5a58a7ab";
export function mount(host) {
  let look = "at";
  const S = pxScene(host, { corners: { tl: "Night blind spot", tr: "AFH 11 · PHAK 17" } }, draw);
  chips(S.F.ctrl, [["at", "Look straight at it"], ["off", "Look 10° beside it"]], look, (v) => { look = v || look; S.redraw(); }, { label: "Where you look" });
  function draw(g, W, H, top) {
    const ph = W < 520, cy = (top + H) / 2, lx = W * 0.56, deg = Math.min(W, H - top) / 44; // px per degree (schematic)
    // night sky
    R(g, 0, top - 6, W, H - top + 6, { fill: "rgba(0,0,0,.25)" });
    for (let i = 0; i < 26; i++) { const x = ((i * 97) % 100) / 100 * W, y = top + ((i * 53) % 100) / 100 * (H - top - 10); C(g, x, y, 1.2, { fill: "rgba(242,241,236,.35)" }); }
    const gx = look === "at" ? lx : lx - 10 * deg, gy = cy;
    // blind spot: central ~5–10°
    C(g, gx, gy, 5 * deg, { stroke: ACC, sw: 1.6, dash: "4 4", fill: "rgba(10,10,11,.75)" });
    T(g, gx, gy - 5 * deg - 8, "BLIND SPOT 5–10°", { anchor: "middle", size: 11, fill: ACC });
    // the other airplane's light
    const vis = look !== "at";
    C(g, lx, cy, 5, { fill: vis ? INK : "rgba(242,241,236,.08)" });
    T(g, lx + 12, cy + 4, vis ? "TRAFFIC" : "GONE", { size: 11, fill: vis ? INK : GRAY });
    // gaze cross
    L(g, gx - 9, gy, gx + 9, gy, { stroke: INK, w: 1.6 }); L(g, gx, gy - 9, gx, gy + 9, { stroke: INK, w: 1.6 });
    T(g, gx, gy + 5 * deg + 18, "WHERE YOU LOOK", { anchor: "middle", size: 11, fill: GRAY });
    if (vis) { L(g, gx + 12, gy + 26, lx - 8, cy + 26, { stroke: GRAY, w: 1.2 }); T(g, (gx + lx) / 2, gy + 42, "≈ 10°", { anchor: "middle", size: 11, fill: GRAY }); }
    S.F.caption(vis ? "Off-center viewing" : "Staring", vis ? "Rods pick it up" : "It fades away");
    S.F.explain(vis ? "Looking about 10° beside the light puts it on rods, which are far more sensitive in the dark. Keep moving: an image fades after 2–3 seconds on one spot. <span class=\"src\">PHAK 17</span>" : "The fovea, at the center of your view, has only cones, so it's blind in dim light. A light you look straight at can disappear. <span class=\"src\">AFH 11 · PHAK 17</span>");
  }
  return { destroy() { S.F.destroy(); } };
}
