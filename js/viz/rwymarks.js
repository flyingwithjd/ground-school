// Runway markings by runway type (AIM 2-3-3, TBL 2-3-1; AC 150/5340-1M). Pick a runway type, then tap a marking.
// Plan view, approach from the left. Lengths along the runway are roughly to scale; width is exaggerated for legibility.
import { frame, chips, row, svg, isolate, ACC, FAINT, FAINT2, INK } from "./base.js?v=c8494a91a9";
import { s } from "../core/util.js?v=c8494a91a9";
import { T } from "./shapes.js?v=c8494a91a9";
const K = 0.36, X0 = 360, CY = 360, HW = 120; // px per ft, threshold x, centerline y, half-width px
const fx = (ft) => X0 + ft * K;
const W = "rgba(242,241,236,.55)", Y = "rgba(242,241,236,.3)";
const INFO = {
  desig: ["Designation", "Magnetic heading ÷ 10", "The whole number nearest one-tenth of the magnetic azimuth, read from the approach direction. L, C, R tell parallels apart. White, like every runway marking. <span class=\"src\">AIM 2-3-3</span>"],
  center: ["Centerline", "Line up on it", "Uniformly spaced stripes and gaps that identify the center of the runway and give alignment guidance for takeoff and landing. <span class=\"src\">AIM 2-3-3</span>"],
  thresh: ["Threshold", "Beginning of the landing runway", "Longitudinal stripes that mark the start of the runway available for landing. The count tells the width: 4 = 60 ft, 6 = 75, 8 = 100, 12 = 150, 16 = 200. This one has 12: a 150-ft runway. Required on instrument runways; on visual runways only where international commercial transports use them. <span class=\"src\">AIM 2-3-3, TBL 2-3-1, TBL 2-3-2</span>"],
  aim: ["Aiming point", "About 1,000 ft in", "Two broad white stripes, one each side of the centerline, approximately 1,000 feet from the landing threshold: a visual aiming point. On a visual runway, required only on runways 4,000 ft or longer used by jets. <span class=\"src\">AIM 2-3-3, TBL 2-3-1</span>"],
  tdz: ["Touchdown zone", "Coded in 500-ft steps", "Groups of one, two and three bars in pairs about the centerline, coded to give distance in 500-foot increments. Precision instrument runways only. <span class=\"src\">AIM 2-3-3; AC 150/5340-1M 2.7</span>"],
  side: ["Side stripes", "The runway edge", "Continuous white stripes on each side delineate the edges and contrast the runway with the shoulders. Precision instrument runways. <span class=\"src\">AIM 2-3-3</span>"],
  disp: ["Displaced threshold", "Not for landing, this direction", "A threshold placed somewhere other than the start of the runway. The area behind it (white arrows on the centerline) is usable for takeoff in either direction and for landing rollout from the opposite direction. It is not for touching down from this direction. <span class=\"src\">AIM 2-3-3</span>"],
  bar: ["Threshold bar", "Landing starts here", "A 10-ft-wide white bar across the runway at a displaced threshold, preceded by white arrowheads. Plan your touchdown beyond it. <span class=\"src\">AIM 2-3-3</span>"],
  demarc: ["Demarcation bar", "Yellow: not runway", "A 3-ft yellow bar separating a runway with a displaced threshold from a blast pad, stopway or taxiway that precedes it. Yellow because it is not on the runway. <span class=\"src\">AIM 2-3-3</span>"],
  chev: ["Chevrons", "Unusable pavement", "Yellow chevrons mark pavement aligned with the runway that is unusable for landing, takeoff and taxiing, such as a blast pad or stopway. <span class=\"src\">AIM 2-3-3</span>"],
};
const ORDER = ["desig", "center", "thresh", "aim", "tdz", "side", "disp", "bar", "demarc", "chev"];
const HAS = { visual: ["desig", "center"], nonprec: ["desig", "center", "thresh", "aim"], prec: ["desig", "center", "thresh", "aim", "tdz", "side"], disp: ["chev", "demarc", "disp", "bar", "desig", "center", "thresh", "aim"] };
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Runway markings · plan view", tr: "AIM 2-3-3 · AC 150/5340-1M" } });
  const el = svg(F.stage, "0 0 1600 900"); const root = s("g", {}, el);
  let type = opts.type || "prec", sel = null, groups = {}, elChips;
  const rect = (g, x, y, w, hh, fill = W) => s("rect", { x, y, width: w, height: hh, fill, stroke: fill === "none" ? INK : "none", "data-ink": "none", "data-fillink": fill, "stroke-width": 1 }, g);
  function build() {
    root.innerHTML = ""; groups = {}; const has = HAS[type], D = type === "disp" ? 420 : 0; // displaced: threshold moved D ft
    const start = type === "disp" ? fx(-D) : X0;
    // pavement outline
    s("rect", { x: start, y: CY - HW, width: 1590 - start, height: HW * 2, fill: "none", stroke: FAINT2, "stroke-width": 2 }, root);
    T(root, 1580, CY - HW - 16, "runway continues →", { anchor: "end", size: 14, op: 0.4 });
    T(root, 60, CY + 6, "approach →", { size: 15, op: 0.5 });
    const G = (k) => (groups[k] = s("g", { class: "tap", role: "button", tabindex: 0, "aria-label": INFO[k][0] }, root));
    const thrX = X0; // landing threshold x (displaced or not, landing starts at X0)
    if (has.includes("chev")) { const g = G("chev"); s("rect", { x: start - 230, y: CY - HW, width: 230, height: HW * 2, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, g);
      for (let i = 0; i < 3; i++) { const x = start - 200 + i * 70; s("path", { d: `M${x},${CY - HW + 10} L${x + 50},${CY} L${x},${CY + HW - 10}`, fill: "none", stroke: Y, "stroke-width": 9, "data-ink": Y }, g); }
      T(g, start - 115, CY + HW + 34, "blast pad", { anchor: "middle", size: 14, op: 0.5 }); }
    if (has.includes("demarc")) { const g = G("demarc"); s("line", { x1: start, y1: CY - HW, x2: start, y2: CY + HW, stroke: Y, "stroke-width": 6, "data-ink": Y }, g); }
    if (has.includes("disp")) { const g = G("disp");
      for (let x = start + 30; x < thrX - 110; x += 90) s("path", { d: `M${x},${CY} L${x + 60},${CY} M${x + 44},${CY - 12} L${x + 60},${CY} L${x + 44},${CY + 12}`, fill: "none", stroke: W, "stroke-width": 5, "data-ink": W }, g);
      for (const dy of [-70, 0, 70]) s("path", { d: `M${thrX - 50},${CY + dy - 16} L${thrX - 22},${CY + dy} L${thrX - 50},${CY + dy + 16}`, fill: "none", stroke: W, "stroke-width": 5, "data-ink": W }, g);
      s("rect", { x: start + 4, y: CY - HW + 4, width: thrX - start - 8, height: HW * 2 - 8, fill: "transparent", stroke: "none" }, g); }
    if (has.includes("bar")) { const g = G("bar"); rect(g, thrX - 6, CY - HW, 7, HW * 2); }
    if (has.includes("thresh")) { const g = G("thresh"); const n = 6, sw = (HW - 22) / n; for (let i = 0; i < n; i++) for (const sg of [-1, 1]) rect(g, fx(20), CY + sg * (22 + i * sw) - (sg < 0 ? sw - 3 : 0), 150 * K, sw - 3); }
    if (has.includes("desig")) { const g = G("desig"); const x = has.includes("thresh") ? fx(230) : fx(60); const t = T(g, x, CY + 26, "9", { anchor: "middle", size: 92, op: 0.6, sans: true, weight: 800, upper: false }); t.setAttribute("transform", `rotate(90 ${x} ${CY})`); t.dataset.ink = "none"; t.dataset.fillink = W; t.setAttribute("fill", W);
      s("rect", { x: x - 50, y: CY - 40, width: 100, height: 80, fill: "transparent" }, g); }
    if (has.includes("center")) { const g = G("center"); const x1 = (has.includes("thresh") ? fx(340) : fx(160)); for (let x = x1; x < 1590; x += 200 * K) s("line", { x1: x, y1: CY, x2: Math.min(1590, x + 120 * K), y2: CY, stroke: W, "stroke-width": 5, "data-ink": W }, g);
      s("rect", { x: x1, y: CY - 14, width: 1590 - x1, height: 28, fill: "transparent" }, g); }
    if (has.includes("aim")) { const g = G("aim"); for (const sg of [-1, 1]) rect(g, fx(1020), CY + sg * 52 - (sg < 0 ? 26 : 0), 150 * K, 26); }
    if (has.includes("tdz")) { const g = G("tdz"); const grp = [[500, 3], [1500, 3], [2000, 2], [2500, 2], [3000, 1]];
      for (const [ft, n] of grp) for (const sg of [-1, 1]) for (let i = 0; i < n; i++) rect(g, fx(ft), CY + sg * (34 + i * 16) - (sg < 0 ? 9 : 0), 75 * K, 9);
      for (const [ft] of grp) T(root, fx(ft) + 12, CY + HW + 30, ft.toLocaleString(), { anchor: "middle", size: 13, op: 0.4 });
      T(root, fx(1020) + 25, CY + HW + 30, "1,000", { anchor: "middle", size: 13, op: 0.4 }); }
    if (has.includes("side")) { const g = G("side"); for (const sg of [-1, 1]) rect(g, X0, CY + sg * (HW - 6) - 3, 1590 - X0, 6); }
    for (const [k, g] of Object.entries(groups)) { g.addEventListener("click", () => pick(k)); g.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(k)); }
    elChips.set(null); elChips.enable(has); // every marking chip stays in place; the ones this runway type lacks are dimmed
    sel = null; isolate(groups, null);
    const names = { visual: "Visual runway", nonprec: "Nonprecision instrument", prec: "Precision instrument", disp: "Displaced threshold" };
    F.caption(names[type], "Tap a marking");
    F.explain(type === "disp" ? "A displaced threshold with a blast pad in front of it. Tap each marking to see what you may and may not do on it. <span class=\"src\">AIM 2-3-3</span>" : `A ${names[type].toLowerCase()} runway carries: ${has.map((k) => INFO[k][0].toLowerCase()).join(", ")}. Markings are white on runways; taxiway, holding and blast-pad markings are yellow. <span class="src">AIM 2-3-2, TBL 2-3-1</span>`);
  }
  function pick(k) { sel = k; elChips && elChips.set(k); isolate(groups, k); F.caption(INFO[k][0], INFO[k][1]); F.explain(INFO[k][2]); }
  chips(row(F.ctrl, "Runway"), [["visual", "Visual"], ["nonprec", "Nonprecision"], ["prec", "Precision"], ["disp", "Displaced threshold"]], type, (v) => { type = v; build(); }, { label: "Runway type" });
  elChips = chips(row(F.ctrl, "Markings"), ORDER.map((k) => [k, INFO[k][0]]), null, (k) => pick(k), { label: "Markings" });
  build();
  return { destroy: () => F.destroy() };
}
