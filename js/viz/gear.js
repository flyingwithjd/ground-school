// Landing gear types, side view: tricycle, tailwheel (conventional), retractable, floats and skis. The CG marker shows why a
// tailwheel airplane can ground loop. GL1 covers the parts and the walkaround; this is the systems view.
// Facts: PHAK 7 (Landing Gear): wheels, floats or skis; tricycle advantages (harder braking without nosing over, better
// forward view, CG ahead of the mains resists ground loops); nosewheel steerable or castering; tailwheel: mains ahead of
// the CG, more prop clearance, better on rough fields, CG behind the mains makes ground control harder (ground loop) and
// forward view is poorer, so specific training is required (14 CFR 61.31(i)); fixed gear is simple and low maintenance;
// retractable gear streamlines the airplane in cruise.
import { chips, row } from "./base.js?v=ff9d939563";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=ff9d939563";
import { COL } from "./dial.js?v=ff9d939563";
const TYPES = { tri: "Tricycle", tail: "Tailwheel", retr: "Retractable", float: "Floats", ski: "Skis" };
const SAY = {
  tri: ["Tricycle gear", "The CG is ahead of the main wheels, so it tracks straight, brakes hard and gives a good view ahead."],
  tail: ["Tailwheel gear", "The CG is behind the mains: more prop clearance, but it can swap ends in a ground loop. Get trained."],
  retr: ["Retractable gear", "The wheels fold into the airplane in cruise to cut drag. More to check, and gear-up landings happen."],
  float: ["Floats", "Floats let the airplane land on water. Seaplane flying needs its own rating and training."],
  ski: ["Skis", "Skis let the airplane land on snow. Fixed gear is simplest; each option trades simplicity for capability."],
};
export function mount(host) {
  let ty = "tri", up = false;
  const S = pxScene(host, { cls: "gear", corners: { tl: "Landing gear", tr: "PHAK 7" } }, draw);
  chips(row(S.F.ctrl, "Gear"), Object.entries(TYPES), ty, (k) => { ty = k || "tri"; S.redraw(); }, { label: "Gear" });
  function draw(g, W, H, top) {
    const wide = W >= 600, L0 = Math.min(W * (wide ? 0.6 : 0.86), 460), x0 = (W - L0) / 2, gy = top + (H - top) * 0.72, tail = ty === "tail";
    const nose = x0, tailx = x0 + L0, fy = gy - L0 * (tail ? 0.2 : 0.16), tilt = tail ? L0 * 0.1 : 0;
    const yAt = (x) => fy + ((x - nose) / L0) * tilt;
    // fuselage and wing
    P(g, `M${nose},${yAt(nose)} Q${nose + L0 * 0.1},${yAt(nose) - L0 * 0.1} ${nose + L0 * 0.35},${yAt(nose + L0 * 0.35) - L0 * 0.1} L${tailx - L0 * 0.08},${yAt(tailx) - L0 * 0.04} L${tailx},${yAt(tailx) - L0 * 0.14} L${tailx},${yAt(tailx) + 4} L${nose + L0 * 0.3},${yAt(nose + L0 * 0.3) + L0 * 0.05} Q${nose + L0 * 0.05},${yAt(nose) + L0 * 0.05} ${nose},${yAt(nose)} Z`, { stroke: INK, w: 1.6, fill: "#18181a" });
    L(g, nose + L0 * 0.25, yAt(nose + L0 * 0.25) - L0 * 0.1, nose + L0 * 0.45, yAt(nose + L0 * 0.45) - L0 * 0.1, { stroke: INK, w: 4 });
    L(g, nose - 4, yAt(nose) - L0 * 0.08, nose - 4, yAt(nose) + L0 * 0.08, { stroke: GRAY, w: 3 });
    L(g, 10, gy, W - 10, gy, { stroke: ty === "float" ? COL.cyan : ty === "ski" ? INK : DIM, w: ty === "float" ? 2 : 1, dash: ty === "ski" ? "2 3" : null });
    const wr = L0 * 0.035, mainX = tail ? nose + L0 * 0.24 : nose + L0 * 0.4, cgX = nose + L0 * 0.32;
    const leg = (x, r) => { L(g, x, yAt(x) + L0 * 0.04, x, gy - r, { stroke: GRAY, w: 2 }); if (ty === "ski") R(g, x - r * 2.2, gy - 4, r * 4.4, 4, { fill: INK, rx: 2 }); else C(g, x, gy - r, r, { stroke: INK, sw: 2, fill: "#0A0A0B" }); };
    if (ty === "float") { R(g, nose + L0 * 0.05, gy - L0 * 0.06, L0 * 0.55, L0 * 0.05, { rx: 8, stroke: INK, sw: 1.6, fill: "#18181a" }); L(g, nose + L0 * 0.2, yAt(nose + L0 * 0.2) + L0 * 0.04, nose + L0 * 0.2, gy - L0 * 0.06, { stroke: GRAY, w: 2 }); L(g, nose + L0 * 0.45, yAt(nose + L0 * 0.45) + L0 * 0.04, nose + L0 * 0.45, gy - L0 * 0.06, { stroke: GRAY, w: 2 }); }
    else if (tail) { leg(mainX, wr); L(g, tailx - 10, yAt(tailx - 10) + 2, tailx - 8, gy - wr, { stroke: GRAY, w: 2 }); C(g, tailx - 8, gy - wr * 0.5, wr * 0.5, { stroke: INK, sw: 2 }); }
    else { leg(mainX, wr); leg(nose + L0 * 0.08, wr * 0.8); if (ty === "retr") T(g, mainX + wr + 10, gy - wr + 4, "folds up in cruise", { size: 11, fill: GRAY }); }
    if (ty === "retr") { [mainX, nose + L0 * 0.08].forEach((x) => C(g, x, yAt(x) + L0 * 0.02, wr * 0.8, { stroke: ACC, sw: 1.2, dash: "3 3" })); }
    // CG marker and the main-wheel line
    const cy = yAt(cgX) - L0 * 0.02; C(g, cgX, cy, 7, { stroke: COL.yellow, sw: 2 }); L(g, cgX - 7, cy, cgX + 7, cy, { stroke: COL.yellow, w: 1.5 }); L(g, cgX, cy - 7, cgX, cy + 7, { stroke: COL.yellow, w: 1.5 });
    T(g, cgX, cy - 14, "CG", { size: 11, anchor: "middle", fill: COL.yellow });
    if (ty !== "float") { L(g, mainX, gy + 6, mainX, gy + 22, { stroke: ACC, w: 1.5 }); T(g, mainX, gy + 36, cgX > mainX ? "mains ahead of CG" : "mains behind CG", { size: 11, anchor: "middle", fill: cgX > mainX ? COL.red : ACC }); }
    S.F.caption(SAY[ty][0], SAY[ty][1]);
  }
  S.F.explain(`<p>Simplified side views. GL1 covers the gear parts and how to inspect them.</p>`);
  return { destroy: () => S.F.destroy() };
}
