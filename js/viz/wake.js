// Wake turbulence (AIM 7-4). Side view: a larger airplane's vortices sink behind and below its path, so stay at or above it.
// Rear view: near the ground the vortices spread out at 2-3 kt; a light crosswind can hold the upwind vortex over the runway.
// Schematic, not to scale.
import { frame, chips, slider, svg, loop, ACC, FAINT, FAINT2, INK } from "./base.js?v=02247193df";
import { s } from "../core/util.js?v=02247193df";
import { T } from "./shapes.js?v=02247193df";
const GY = 700;
const MODES = {
  land: { cap: "Landing behind a larger airplane", big: "Stay at or above its path. Land beyond its touchdown point.",
    ex: `Vortices form from rotation to touchdown and sink several hundred feet per minute behind the airplane that made them. On the same runway, stay at or above the larger airplane's final approach path, note its touchdown point, and land beyond it. <span class="src">AIM 7-4-4, 7-4-6</span>` },
  dep: { cap: "Departing behind a larger airplane", big: "Rotate before its rotation point.",
    ex: `Note where the larger airplane rotated. Lift off before that point, then keep climbing above its climb path until you turn clear of its wake. Avoid later headings that cross below and behind it. <span class="src">AIM 7-4-6</span>` },
  xw: { cap: "Rear view · near the ground", big: "A light crosswind holds one vortex in place.",
    ex: `Within 100 to 200 ft of the ground, vortices spread outward at 2 to 3 kt. A crosswind slows the upwind vortex and speeds the downwind one, so a 1 to 5 kt cross component can leave the upwind vortex in the touchdown zone. A light quartering tailwind needs maximum caution. Wait at least 2 minutes after a larger airplane's low approach or touch-and-go. <span class="src">AIM 7-4-4, 7-4-6</span>` },
};
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin", corners: { tl: "Wake turbulence · schematic", tr: "AIM 7-4" } });
  const el = svg(F.stage, "0 0 1600 900"); let g = s("g", {}, el), mode = opts.mode || "land", xwk = 3, t0 = 0, parts = [];
  const vort = (parent) => { const vg = s("g", {}, parent); const pts = Array.from({ length: 10 }, (_, i) => s("circle", { r: 3, fill: ACC, opacity: 0.25 + i * 0.07 }, vg)); s("circle", { r: 26, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, vg); return { vg, pts }; };
  function build() { g.remove(); g = s("g", {}, el); parts = []; t0 = performance.now();
    s("line", { x1: 80, y1: GY, x2: 1520, y2: GY, stroke: FAINT2, "stroke-width": 2 }, g);
    if (mode === "xw") { s("rect", { x: 560, y: GY, width: 480, height: 14, fill: "none", stroke: FAINT2, "stroke-width": 2 }, g); T(g, 800, GY + 48, "runway, seen from behind", { anchor: "middle", size: 14, op: 0.5 });
      parts = [vort(g), vort(g)]; T(g, 1420, 360, "crosswind →", { anchor: "end", size: 16, op: 0.7, fill: ACC }); return; }
    // larger airplane path (side view), touchdown or rotation point
    const tx = mode === "land" ? 900 : 700;
    const path = mode === "land" ? `M120,300 L${tx},${GY}` : `M${tx},${GY} L1500,330`;
    s("path", { d: path, stroke: INK, "stroke-width": 3, fill: "none" }, g);
    s("path", { d: mode === "land" ? `M180,330 L${tx},${GY + 40}` : `M${tx},${GY} L1500,${GY - 30}`, stroke: FAINT, "stroke-width": 26, fill: "none", "stroke-linecap": "round" }, g);
    T(g, mode === "land" ? 240 : 1380, mode === "land" ? 280 : 310, "larger airplane", { size: 14, op: 0.6, anchor: mode === "land" ? "start" : "end" });
    T(g, mode === "land" ? 600 : 1150, mode === "land" ? 640 : 690, "wake sinks below the path", { size: 13, op: 0.5, anchor: "middle" });
    s("line", { x1: tx, y1: GY - 18, x2: tx, y2: GY + 18, stroke: INK, "stroke-width": 3 }, g); T(g, tx, GY + 50, mode === "land" ? "its touchdown" : "its rotation", { anchor: "middle", size: 14, op: 0.7 });
    const you = mode === "land" ? `M120,240 L1100,${GY}` : `M300,${GY} L560,${GY} L1500,200`;
    const yp = s("path", { d: you, stroke: ACC, "stroke-width": 4, fill: "none", filter: "url(#gw)", "stroke-dasharray": "14 10" }, g);
    T(g, mode === "land" ? 1100 : 560, GY + 50, mode === "land" ? "you: beyond it" : "you: before it", { anchor: "middle", size: 14, op: 1, fill: ACC });
    for (let i = 0; i < 4; i++) parts.push(vort(g));
  }
  const run = loop(F, (now) => { const t = (now - t0) / 1000;
    if (mode === "xw") { const base = 2.5, d = t % 14; // two vortices spread outward; crosswind adds to the downwind one
      const up = Math.max(0, base - xwk), dn = base + xwk; const xs = [800 - 60 - up * d * 9, 800 + 60 + dn * d * 9];
      parts.forEach((p, k) => { p.vg.setAttribute("transform", `translate(${Math.max(90, Math.min(1510, xs[k]))} ${GY - 90})`); spin(p, t, k ? 1 : -1); });
      return; }
    parts.forEach((p, i) => { const f = ((t * 0.12 + i / parts.length) % 1); const tx = mode === "land" ? 900 : 700;
      const x = mode === "land" ? 160 + f * (tx - 160) : tx + f * 780, y0 = mode === "land" ? 300 + (x - 120) / (tx - 120) * (GY - 300) : GY - (x - tx) / 800 * (GY - 330);
      const sink = Math.min(GY - 60 - y0, 30 + f * 120); p.vg.setAttribute("transform", `translate(${x} ${y0 + Math.max(0, sink)})`); spin(p, t, 1); }); });
  function spin(p, t, dir) { p.pts.forEach((c, j) => { const a = dir * t * 4 + j * 0.62, r = 6 + j * 2; c.setAttribute("cx", r * Math.cos(a)); c.setAttribute("cy", r * Math.sin(a)); }); }
  function update() { const m = MODES[mode]; F.caption(m.cap, m.big); F.explain(m.ex); }
  chips(F.ctrl, [["land", "Landing behind"], ["dep", "Departing behind"], ["xw", "Crosswind near ground"]], mode, (v) => { mode = v; build(); update(); sl.el.style.display = v === "xw" ? "" : "none"; }, { label: "Situation" });
  const sl = slider(F.ctrl, { label: "Crosswind", min: 0, max: 8, value: xwk, fmt: (v) => v + " kt", oninput: (v) => { xwk = v; t0 = performance.now(); } });
  sl.el.style.display = mode === "xw" ? "" : "none";
  build(); update(); run.start();
  return { destroy: () => F.destroy() };
}
