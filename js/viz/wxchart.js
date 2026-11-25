// Surface analysis and prog chart reader (AWH 25.2, 27.9; PHAK 12): a made-up chart with highs, lows, isobars every 4 mb,
// cold, warm, occluded and stationary fronts, a trough, and on the prog chart, precipitation shading. Tap a symbol to read it.
// Front colors are kept because the color is the information; the symbol you pick is drawn bold and labeled. Static scene.
import { chips, row } from "./base.js?v=d4d14c5a28";
import { pxScene, T, L, C, P, hit, INK, GRAY } from "./kit.js?v=d4d14c5a28";
const CB = "#60A5FA", WR = "#F87171", OC = "#C084FC", TR = "#D6A35C", GR = "rgba(74,222,128,";
const IT = {
  cold: ["Cold front", "Blue, triangles point the way it moves", "Cold, dense air pushes under the warm air like a wedge. Expect a narrow band of cumuliform clouds, showers or thunderstorms and gusty, turbulent wind along it. After it passes: a wind shift, falling temperature and dew point, rising pressure and good visibility."],
  warm: ["Warm front", "Red, semicircles on the side it moves toward", "Warm air slides up over the colder air ahead of it. Clouds and rain can spread hundreds of miles ahead: stratus, low ceilings, steady rain or drizzle, and fog. It moves more slowly than a cold front."],
  occl: ["Occluded front", "Purple, triangles and semicircles together", "A faster cold front has caught up with the warm front and lifted the warm air off the ground. Expect a mix of both fronts' weather near the low."],
  stat: ["Stationary front", "Alternating red and blue, on opposite sides", "Neither air mass is pushing the other. Weather along it is often like a warm front's and can linger for days."],
  hi: ["High pressure", "H · 1028 mb at the center", "Air sinks and spreads out of a high, clockwise in the Northern Hemisphere. Sinking air warms and dries, so highs usually bring fair weather, but haze and poor visibility can collect under them."],
  lo: ["Low pressure", "L · 996 mb at the center", "Air flows in toward a low, counterclockwise in the Northern Hemisphere, and rises. Rising air cools, so lows bring clouds, precipitation and wind. Fronts usually meet at lows."],
  iso: ["Isobars", "Lines of equal pressure, every 4 mb", "Each line joins points of equal sea-level pressure, drawn every 4 mb (…1000, 1004, 1008…). The closer together they are, the steeper the pressure change and the stronger the wind."],
  trof: ["Trough", "Dashed line: a stretched-out low", "An elongated area of relatively low pressure. Air converges and rises along it, so it often brings clouds and showers, even without a front."],
  chance: ["Chance of precipitation", "Pale shading: a chance (25 to under 55%)", "On a prog chart, light green shading (pale here) marks where precipitation has a chance (25 to under 55%) of occurring at the valid time."],
  likely: ["Precipitation likely", "Solid shading: likely (55% or more)", "Dark green shading (solid here) marks where precipitation is likely (55% or more) at the valid time.."],
};
export function mount(host) {
  let mode = "sfc", sel = "cold";
  const S = pxScene(host, { cls: "wxc", corners: { tl: "Weather chart (made up)", tr: "AWH 25, 27" } }, draw);
  chips(row(S.F.ctrl), [["sfc", "Surface analysis"], ["prog", "12-hour prog"]], mode, (v) => { mode = v || mode; if (mode === "sfc" && (sel === "chance" || sel === "likely")) sel = "cold"; S.redraw(); }, { label: "Chart" });
  function draw(g, W, H, top) {
    const ph = W < 520, k = Math.min((W - 8) / 100, (H - top - 6) / 60), ox = W / 2 - 50 * k, oy = top + 2, dx = mode === "prog" ? 7 : 0;
    const m = (x, y) => [ox + (x + dx) * k, oy + y * k], ms = (x, y) => [ox + x * k, oy + y * k];
    const on = (key) => sel === key;
    const halo = (e) => { e.setAttribute("stroke", "#000"); e.setAttribute("stroke-width", "4"); e.setAttribute("paint-order", "stroke"); return e; };
    const taps = [];
    const pathD = (pts, f = m) => "M" + pts.map((p) => f(...p).join(",")).join(" L");
    // precipitation shading (prog only)
    if (mode === "prog") {
      const blob = (cx, cy, rx, ry, rot) => { const pts = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * 2 * Math.PI, w = 1 + 0.12 * Math.sin(3 * a); const x = Math.cos(a) * rx * w, y = Math.sin(a) * ry * w; pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return pts; };
      const lp = blob(70, 30, 20, 9, 0.2), dp = blob(48, 40, 11, 4.5, -1.1);
      const e1 = P(g, pathD(lp) + " Z", { fill: GR + (on("chance") ? ".2)" : ".1)"), stroke: on("chance") ? INK : GR + ".6)", w: 1.2, dash: "4 3" }); taps.push(["chance", e1]);
      const e2 = P(g, pathD(dp) + " Z", { fill: GR + (on("likely") ? ".7)" : ".5)"), stroke: on("likely") ? INK : "none", w: 1.2 }); taps.push(["likely", e2]);
    }
    // isobars around the low (996 center) and the high (1028 center)
    const ring = (cx, cy, r, sq) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * 2 * Math.PI; pts.push([cx + Math.cos(a) * r * (1 + 0.1 * Math.sin(2 * a + sq)), cy + Math.sin(a) * r * 0.8]); } return pts; };
    const isoCol = on("iso") ? INK : "rgba(242,241,236,.35)", isoW = on("iso") ? 1.6 : 1;
    [[1000, 7], [1004, 13], [1008, 19]].forEach(([p, r], i) => { const pts = ring(50, 22, r, 0.6); const e = P(g, pathD(pts), { stroke: isoCol, w: isoW }); taps.push(["iso", e]); if (!ph || i === 1) { const [a, b] = m(50 - r * 0.2, 22 - r * 0.8); halo(T(g, a, b + 4, String(p), { size: 11, fill: on("iso") ? INK : GRAY, anchor: "middle" })); } });
    [[1024, 7], [1020, 13]].forEach(([p, r], i) => { const pts = ring(14, 24, r, 2); const e = P(g, pathD(pts, ms), { stroke: isoCol, w: isoW }); taps.push(["iso", e]); if (!ph || i === 1) { const [a, b] = ms(14, 24 - r * 0.8); halo(T(g, a, b + 4, String(p), { size: 11, fill: on("iso") ? INK : GRAY, anchor: "middle" })); } });
    // fronts with their symbols
    const front = (pts, kinds, side, key, f = m) => {   // kinds: "tri" | "semi" | "alt"; side: +1 / -1 (left/right of travel along pts)
      const sp = pts.map((p) => f(...p)); const col = key === "cold" ? CB : key === "warm" ? WR : key === "occl" ? OC : null, sw = on(key) ? 4 : 2.6;
      if (key === "stat") { for (let i = 1; i < sp.length; i++) { const [x0, y0] = sp[i - 1], [x1, y1] = sp[i]; L(g, x0, y0, x1, y1, { stroke: i % 2 ? WR : CB, w: sw }); } }
      else P(g, "M" + sp.map((p) => p.join(",")).join(" L"), { stroke: col, w: sw });
      let acc = 0, n = 0; const step = ph ? 20 : 26;
      for (let i = 1; i < sp.length; i++) { const [x0, y0] = sp[i - 1], [x1, y1] = sp[i], len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy * side, ny = ux * side;
        for (let d = step / 2 - acc; d < len; d += step) { const x = x0 + ux * d, y = y0 + uy * d, sz = on(key) ? 7 : 6; n++;
          const kind = kinds === "alt" ? (n % 2 ? "tri" : "semi") : kinds === "both" ? (n % 2 ? "tri" : "semi") : kinds;
          const s2 = kinds === "alt" && kind === "semi" ? -1 : 1, c = kinds === "alt" ? (kind === "tri" ? CB : WR) : col;
          if (kind === "tri") P(g, `M${x - ux * sz},${y - uy * sz} L${x + nx * s2 * sz * 1.3},${y + ny * s2 * sz * 1.3} L${x + ux * sz},${y + uy * sz} Z`, { fill: c, stroke: c, w: 1 });
          else { const r = sz; P(g, `M${x - ux * r},${y - uy * r} A${r},${r} 0 0,${(side * s2) > 0 ? 0 : 1} ${x + ux * r},${y + uy * r} Z`, { fill: c, stroke: c, w: 1 }); } }
        acc = (acc + len) % step; }
      const hitp = P(g, "M" + sp.map((p) => p.join(",")).join(" L"), { stroke: "rgba(0,0,0,0)", w: 22 }); hitp.style.pointerEvents = "stroke"; taps.push([key, hitp]);
    };
    front([[50, 22], [58, 30]], "both", -1, "occl");
    front([[58, 30], [52, 40], [44, 50], [36, 58]], "tri", -1, "cold");
    front([[58, 30], [70, 33], [80, 36], [90, 41]], "semi", -1, "warm");
    front([[64, 4], [74, 6], [84, 7], [96, 6]], "alt", 1, "stat", ms);
    { const pts = [[76, 47], [84, 52], [92, 58]]; const e = P(g, pathD(pts, ms), { stroke: TR, w: on("trof") ? 3.4 : 2.2, dash: "7 5" }); taps.push(["trof", e]); }
    // pressure centers
    const ctr = (x, y, ch, pr, key, col, f) => { const [a, b] = f(x, y); halo(T(g, a, b + 10, ch, { size: 28, weight: 800, anchor: "middle", fill: on(key) ? INK : col, mono: false })); halo(T(g, a, b + 26, pr, { size: 11, weight: 600, anchor: "middle", fill: on(key) ? INK : GRAY })); const d = C(g, a, b + 4, 20, { fill: "rgba(0,0,0,0)" }); d.style.pointerEvents = "all"; taps.push([key, d]); };
    ctr(14, 24, "H", "1028", "hi", CB, ms); ctr(50, 22, "L", "996", "lo", WR, m);
    // label for the picked symbol, near it
    const LAB = { cold: [44, 50, ms], warm: [80, 36, m], occl: [54, 26, m], stat: [90, 7, ms], trof: [84, 52, ms], iso: [50, 41, m], chance: [82, 27, m], likely: [34, 47, m] };
    if (LAB[sel]) { const [x, y, f] = LAB[sel], [a, b] = (f === ms ? ms : m)(x, y); const txt = { cold: "cold front", warm: "warm front", occl: "occluded", stat: "stationary", trof: "trough", iso: "isobar", chance: "chance", likely: "likely", hi: "", lo: "" }[sel]; const tw = txt.length * 6.9, anc = sel === "cold" ? "end" : a + 12 + tw < W - 4 ? "start" : "end"; /* cold: west of the line, away from its triangles */ halo(T(g, a + (anc === "end" ? -12 : 12), b + (sel === "stat" ? 16 : -10), txt, { size: 11, weight: 700, fill: INK, anchor: anc })); }
    for (const [key, e] of taps) hit(g, e, IT[key][0], () => { sel = key; S.redraw(); });
    halo(T(g, 8, top + 14, mode === "prog" ? (ph ? "forecast +12 h" : "forecast, valid in 12 h: fronts moved east") : (ph ? "observed" : "observed now"), { size: 11, fill: GRAY }));
    const it = IT[sel]; S.F.caption(it[1], it[0]);
    S.F.explain(`${it[2]} Tap any symbol to read it. This chart is made up, never current weather. <span class="src">AWH 25.2, 27.9 · PHAK 12</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
