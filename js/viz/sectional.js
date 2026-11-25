// A fictional sectional chart snippet (FAA Aeronautical Chart User's Guide; PHAK 16): tap a symbol to read it.
// Chart colors are kept on purpose (blue = towered, magenta = nontowered), because that color is the information.
// Scale toggle: sectional 1:500,000 or terminal area chart 1:250,000 (twice the size). Static scene.
import { chips, row } from "./base.js?v=c153ca6f67";
import { pxScene, T, L, C, P, R, hit, ACC, INK, GRAY, DIM } from "./kit.js?v=c153ca6f67";
const MAG = "#D946EF", BLU = "#60A5FA";
// [key, short name, caption, explanation]
const IT = {
  twr: ["Towered airport", "Blue: control tower", "Blue means the airport has a control tower. The circle with runways inside: hard-surfaced runways 1,500 to 8,069 ft. Ticks around it: fuel available. The star on top: a rotating beacon from dusk to dawn. <strong>CT – 119.2★ⓒ</strong>: tower on 119.2, part-time (★), and that frequency is the CTAF (ⓒ) when it's closed. <strong>1043 L 55 122.95</strong>: field elevation 1,043 ft MSL, runway lights sunset to sunrise, longest runway 5,500 ft, UNICOM 122.95."],
  clsd: ["Class D airspace", "Dashed blue: Class D", "A dashed blue line marks Class D airspace around a towered airport. <strong>[30]</strong> is its ceiling in hundreds of feet MSL: surface to 3,000 ft MSL. Talk to the tower before you enter."],
  ntw: ["Nontowered airport", "Magenta: no tower", "Magenta means no control tower. <strong>122.8ⓒ</strong>: UNICOM, and the ⓒ shows it's also the CTAF, so you announce your position there. <strong>1240 L 32</strong>: elevation 1,240 ft MSL, lights sunset to sunrise, longest runway 3,200 ft."],
  soft: ["Soft-surface airport", "Open circle: not paved", "An open circle with no runway inside means the runways aren't hard-surfaced (turf or gravel). <strong>1610 – 22</strong>: elevation 1,610 ft MSL, a dash for no runway edge lights, so plan to be down before dark, and a 2,200 ft longest runway."],
  vor: ["VORTAC", "Blue rose: VOR navaid", "A VORTAC, with a compass rose aligned to magnetic north so you can read radials off the chart. The box gives its name, frequency (112.4) and identifier (STN). You'll fly radials in the VOR page."],
  obs: ["Obstacle", "Tower: MSL over AGL", "A tower under 1,000 ft tall. The bold number is its top in feet MSL (<strong>1549</strong>); the number in parentheses is its height above the ground (<strong>(512)</strong>). Compare MSL with your altitude."],
  mef: ["Maximum elevation figure", "MEF: 1,700 ft MSL", "The big number in each quadrant is the Maximum Elevation Figure: the highest known terrain or obstacle in that quadrant with an allowance added, in thousands and hundreds of feet MSL. <strong>1⁷</strong> = 1,700 ft, set by the 1,549 ft tower."],
  iso: ["Isogonic line", "Magenta dashes: variation", "Dashed magenta isogonic lines join points of equal magnetic variation. Here it's <strong>6°E</strong>: subtract 6° from a true course to get magnetic (east is least)."],
  wpt: ["VFR waypoint", "Magenta star: VFR waypoint", "A magenta four-point star is a VFR waypoint, with a five-letter ident starting with VP that you can load into a GPS. Many sit over a landmark you can see, like this lake."],
};
export function mount(host) {
  let sel = "twr", tac = false; const cid = "secclip" + Math.random().toString(36).slice(2, 7);
  const S = pxScene(host, { corners: { tl: "Sectional snippet (fictional)", tr: "Chart User's Guide" } }, draw);
  chips(row(S.F.ctrl), [["sec", "Sectional 1:500,000"], ["tac", "Terminal area 1:250,000"]], "sec", (v) => { tac = v === "tac"; S.redraw(); }, { label: "Scale" });
  function draw(g, W, H, top) {
    const ph = W < 520, bot = ph ? 40 : 30, k0 = Math.min((W - 8) / 100, (H - top - bot) / 56), k = tac ? k0 * 2 : k0;
    const ox = W / 2 - (tac ? 32 : 50) * k, oy = top + (H - top - bot) / 2 - (tac ? 28 : 28) * k;
    const m = (x, y) => [ox + x * k, oy + y * k], on = (x, y, pad = 0) => { const [a, b] = m(x, y); return a > -pad && a < W + pad && b > top - pad && b < H - bot + pad; };
    const halo = (e) => { e.setAttribute("stroke", "#000"); e.setAttribute("stroke-width", "4"); e.setAttribute("paint-order", "stroke"); e.setAttribute("stroke-linejoin", "round"); return e; };
    const tx = (x, y, s, o = {}) => { const [a, b] = m(x, y); const w = s.length * (o.size || 11) * 0.62; let anc = o.anchor || "start", xa = a + (o.dx || 0);
      if (anc === "start" && xa + w > W - 4) { anc = "end"; xa = a - (o.dx || 0); } if (anc === "end" && xa - w < 4) { anc = "start"; xa = a - (o.dx || 0); }
      const yy = b + (o.dy || 0); if (yy < top + 6 || yy > H - bot + 2) return null; return halo(T(G, xa, yy, s, { size: 11, ...o, anchor: anc })); };
    // chart layer, clipped to the map area so the terminal-area zoom never spills over the scale bar
    const ns = "http://www.w3.org/2000/svg", defs = S.el.querySelector("defs"); let cp = defs.querySelector("#" + cid); if (!cp) { cp = document.createElementNS(ns, "clipPath"); cp.id = cid; cp.append(document.createElementNS(ns, "rect")); defs.append(cp); }
    Object.entries({ x: 0, y: top - 4, width: W, height: H - bot - top + 4 }).forEach(([a, v]) => cp.firstChild.setAttribute(a, v));
    const G = document.createElementNS(ns, "g"); G.setAttribute("clip-path", `url(#${cid})`); g.append(G);
    // terrain, water, a quadrant line
    const path = (pts, o) => P(G, "M" + pts.map(([x, y]) => m(x, y).join(",")).join(" L"), o);
    for (const [r, op] of [[9, 0.5], [6, 0.7], [3, 0.9]]) { const c = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * 2 * Math.PI; c.push([80 + Math.cos(a) * r * 1.5, 46 + Math.sin(a) * r * 0.8]); } path(c, { stroke: "rgba(242,241,236,.16)", w: 1 }); }
    { const rv = []; for (let i = 0; i <= 30; i++) { const t = i / 30; rv.push([t * 40, 25 - t * 25 + Math.sin(t * 9) * 2.2]); } path(rv, { stroke: "rgba(96,165,250,.35)", w: 1.5 }); }   // a river
    { const c = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * 2 * Math.PI; c.push([14 + Math.cos(a) * 5 * (1 + 0.2 * Math.sin(3 * a)), 50 + Math.sin(a) * 3]); } path(c, { stroke: "rgba(96,165,250,.6)", w: 1.2, fill: "rgba(96,165,250,.08)" }); }
    path([[50, 0], [50, 56]], { stroke: "rgba(242,241,236,.18)", w: 1, dash: "2 6" });
    const S_ = (key) => sel === key;
    const items = [];   // [key, x, y, r(px)] for taps
    // isogonic line
    path([[11, 0], [5, 56]], { stroke: MAG, w: S_("iso") ? 2.5 : 1.5, dash: "8 5" }); tx(8.6, 18, "6°E", { fill: MAG, anchor: "end", dx: -6, size: 12, weight: 600 }); items.push(["iso", 9, 14, 18]);
    // MEF: left quadrant and right quadrant
    const mef = (x, y, a, b, key) => { const [px, py] = m(x, y); const big = ph && !tac ? 20 : 26; const e1 = halo(T(G, px, py, a, { size: big, fill: S_(key) ? INK : "rgba(96,165,250,.75)", weight: 700, anchor: "end" })); halo(T(G, px + 1, py - big * 0.45, b, { size: Math.round(big * 0.6), fill: S_(key) ? INK : "rgba(96,165,250,.75)", weight: 700 })); };
    if (on(22, 10)) mef(22, 10, "1", "7", "mef"); items.push(["mef", 22.5, 8.5, 20]);
    if (on(88, 52)) { mef(88, 52, "3", "4", "mef"); items.push(["mef", 88.5, 50.5, 20]); }
    if (on(80, 44)) { const [a, b] = m(80, 44); C(G, a, b, 1.6, { fill: GRAY }); tx(80, 44, "3218", { dx: 5, dy: 4, fill: GRAY }); }
    // obstacle
    { const [a, b] = m(40, 13), hi = S_("obs"); P(G, `M${a - 5},${b + 6} L${a},${b - 8} L${a + 5},${b + 6}`, { stroke: hi ? INK : MAG, w: hi ? 2.2 : 1.5 }); C(G, a, b + 6, 1.5, { fill: hi ? INK : MAG });
      tx(40, 13, "1549", { anchor: "middle", dy: -25, fill: hi ? INK : MAG, weight: 700 }); tx(40, 13, "(512)", { anchor: "middle", dy: -11, fill: hi ? INK : MAG }); items.push(["obs", 40, 11, 18]); }
    // Class D around the towered airport, ceiling [30]
    { const [a, b] = m(32, 28); C(G, a, b, 10 * k, { stroke: BLU, sw: S_("clsd") ? 2.6 : 1.4, dash: "7 5" }); const ty = b - 10 * k; if (ty > top + 10) { halo(T(G, a, ty + 4, "[30]", { size: 12, anchor: "middle", fill: S_("clsd") ? INK : BLU, weight: 700 })); } items.push(["clsd", 32 + 7.07, 28 + 7.07, 16]); }
    // towered airport: circle, runways, fuel ticks, beacon star
    const apt = (x, y, col, { rw = true, ticks = true, star = false, key }) => { const [a, b] = m(x, y), r = 7, hi = S_(key);
      if (hi) C(G, a, b, r + 6, { stroke: INK, sw: 1.2, dash: "3 3" });
      if (rw) { C(G, a, b, r, { stroke: col, sw: 2 }); L(G, a - 4, b + 4, a + 4, b - 4, { stroke: col, w: 2.4 }); L(G, a - 5, b - 1, a + 5, b - 1, { stroke: col, w: 2.4 }); }
      else C(G, a, b, r - 1, { stroke: col, sw: 2.2 });
      if (ticks) for (let i = 0; i < 6; i++) { const t = (i / 6) * 2 * Math.PI + Math.PI / 6; L(G, a + Math.cos(t) * r, b + Math.sin(t) * r, a + Math.cos(t) * (r + 3.5), b + Math.sin(t) * (r + 3.5), { stroke: col, w: 2 }); }
      if (star) { const sy = b - r - 7; P(G, `M${a},${sy - 4} L${a + 1.3},${sy - 1.2} L${a + 4},${sy - 1} L${a + 2},${sy + 1} L${a + 2.6},${sy + 4} L${a},${sy + 2.4} L${a - 2.6},${sy + 4} L${a - 2},${sy + 1} L${a - 4},${sy - 1} L${a - 1.3},${sy - 1.2} Z`, { stroke: col, fill: col, w: 0.8 }); }
      items.push([key, x, y, 16]); };
    // a data block: one left edge for all its lines, kept inside the stage
    const block = (x, y, lines, col, key, o = {}) => { if (ph && !tac && !S_(key)) return; if (!on(x, y, 40)) return; const [a, b] = m(x, y), wmax = Math.max(...lines.map((l) => l.length)) * 11 * 0.62;
      const dx = o.dx ?? 12, R0 = a + dx, L0 = a - dx - wmax; let left = o.center && ph ? a - wmax / 2 : o.anchor === "end" ? (L0 >= 4 ? L0 : R0) : (R0 + wmax <= W - 4 ? R0 : L0); left = Math.max(4, Math.min(W - 4 - wmax, left));
      lines.forEach((s2, i) => { const yy = b + (ph && o.phDy != null ? o.phDy : o.dy || 0) + i * 13; if (yy > top + 6 && yy < H - bot + 2) halo(T(G, left, yy, s2, { size: 11, fill: S_(key) ? INK : col, weight: i ? 500 : 700 })); }); };
    if (on(32, 28, 20)) { apt(32, 28, BLU, { star: true, key: "twr" }); block(32, 28, ["RIVERTON (X21)", "CT – 119.2★ⓒ", "1043 L 55 122.95"], BLU, "twr", { anchor: "end", dx: 14, dy: 22, center: true }); }
    if (on(78, 14, 20)) { apt(78, 14, MAG, { key: "ntw" }); block(78, 14, ["CEDAR FLAT (X34)", "1240 L 32 122.8ⓒ"], MAG, "ntw", { dx: 14, dy: -2 }); }
    if (on(90, 27, 20)) { apt(90, 27, MAG, { rw: false, ticks: false, key: "soft" }); block(90, 27, ["HILLTOP (X47)", "1610 – 22 122.9ⓒ"], MAG, "soft", { anchor: "end", dx: 18, dy: -20 }); }
    // VORTAC with its compass rose and box
    if (on(62, 38, 60)) { const [a, b] = m(62, 38), rr = Math.max(26, 8 * k), hi = S_("vor"), col = hi ? INK : BLU;
      C(G, a, b, rr, { stroke: col, sw: hi ? 1.8 : 1.1 }); const vr = 6 * Math.PI / 180;   // rose aligned to magnetic north (6°E variation)
      for (let d = 0; d < 360; d += 10) { const t = d * Math.PI / 180 - vr, l = d % 30 ? 4 : 8; L(G, a + Math.sin(t) * rr, b - Math.cos(t) * rr, a + Math.sin(t) * (rr - l), b - Math.cos(t) * (rr - l), { stroke: col, w: 1 }); }
      L(G, a + Math.sin(-vr) * rr, b - Math.cos(-vr) * rr, a + Math.sin(-vr) * (rr + 8), b - Math.cos(-vr) * (rr + 8), { stroke: col, w: 1.6, arrow: hi ? "kahw" : undefined });
      P(G, [0, 1, 2, 3, 4, 5].map((i) => { const t = (i / 6) * 2 * Math.PI; return (i ? "L" : "M") + (a + Math.cos(t) * 5) + "," + (b + Math.sin(t) * 5); }).join(" ") + " Z", { stroke: col, w: 1.4 }); C(G, a, b, 1.3, { fill: col });
      if (!ph || tac || hi) { const bx = b + rr + 16; if (bx < H - bot - 2) { const tt = "STONE 112.4 STN", w = tt.length * 6.9 + 10; R(G, a - w / 2, bx - 12, w, 17, { stroke: col, sw: 1.2, fill: "#000" }); T(G, a, bx, tt, { size: 11, anchor: "middle", fill: col, weight: 600 }); } }
      items.push(["vor", 62, 38, 20]); }
    // VFR waypoint over the lake
    if (on(22, 48, 10)) { const [a, b] = m(22, 48), hi = S_("wpt"), col = hi ? INK : MAG; P(G, `M${a},${b - 8} L${a + 2},${b - 2} L${a + 8},${b} L${a + 2},${b + 2} L${a},${b + 8} L${a - 2},${b + 2} L${a - 8},${b} L${a - 2},${b - 2} Z`, { stroke: col, fill: hi ? INK : "none", w: 1.4 });
      tx(22, 48, "VPLKE", { dx: 11, dy: 4, fill: col, weight: 600 }); items.push(["wpt", 22, 48, 16]); }
    // scale bar: 10 NM. Sectional 1 inch ≈ 6.86 NM; terminal area chart 1 inch ≈ 3.43 NM (here 10 NM = 25 units at 1:500,000)
    { const len = 25 * k, x0 = 12, y = H - bot + (ph ? 22 : 18); L(g, x0, y, x0 + len, y, { stroke: INK, w: 2 }); L(g, x0, y - 4, x0, y + 4, { stroke: INK, w: 1.5 }); L(g, x0 + len, y - 4, x0 + len, y + 4, { stroke: INK, w: 1.5 });
      T(g, x0 + len + 8, y + 4, `10 NM · ${tac ? "1:250,000" : "1:500,000"}`, { size: 11, fill: GRAY }); }
    // taps: invisible discs over each symbol
    for (const [key, x, y, r] of items) { if (!on(x, y)) continue; const [a, b] = m(x, y); const d = C(g, a, b, Math.max(r, 16), { fill: "rgba(0,0,0,0)" }); d.style.pointerEvents = "all"; hit(g, d, IT[key][0], () => { sel = key; S.redraw(); }); }
    const it = IT[sel] || IT.twr;
    S.F.caption(it[0], it[1]);
    S.F.explain(it[2] + ` Tap another symbol to read it. This chart is made up: not for navigation. <span class="src">FAA Aeronautical Chart User's Guide · PHAK 16</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
