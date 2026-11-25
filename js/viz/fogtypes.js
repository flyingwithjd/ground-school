// Fog types, side view (PHAK 12): what makes each one form and what clears it. The process that forms it (cooling, wind,
// lift) is drawn in blue; the fog is white. Static scene: draws only on change.
import { chips, row } from "./base.js?v=d4d14c5a28";
import { pxScene, T, L, C, P, ACC, INK, GRAY } from "./kit.js?v=d4d14c5a28";
const FT = {
  rad: ["Radiation fog", "Clear, calm night: the ground cools the air", "On a clear night with little or no wind, the ground radiates its heat away and cools the air touching it to its dew point. The fog pools in low spots. It burns off as the sun warms the ground, and a breeze speeds that up."],
  adv: ["Advection fog", "Moist air blown over a colder surface", "Warm, moist air moves over a colder surface, often onshore along a coast, and is cooled from below. It needs wind, can form day or night and can last for days. Above about 15 kt it tends to lift into low stratus."],
  up: ["Upslope fog", "Wind pushes moist, stable air uphill", "Wind pushes moist, stable air up rising terrain. As it rises it expands and cools to its dew point. Upslope fog is often dense and can reach well up the slope, hiding high ground."],
  steam: ["Steam fog", "Cold air moving over warmer water", "Cold, dry air moves over warmer water. Moisture evaporates into it and condenses right away, rising like smoke. Expect low-level turbulence and icing in it."],
  ice: ["Ice fog", "Very cold air: vapor turns straight to ice", "In very cold air, usually −25 °F or colder, water vapor turns directly into tiny ice crystals. It's common in polar regions, and looking toward the sun through it can cut visibility to almost nothing."],
};
export function mount(host) {
  let sel = "rad"; const fid = "fogblur" + Math.random().toString(36).slice(2, 7);
  const S = pxScene(host, { cls: "fogt", corners: { tl: "Fog types · side view", tr: "PHAK 12" } }, draw);
  chips(row(S.F.ctrl), [["rad", "Radiation"], ["adv", "Advection"], ["up", "Upslope"], ["steam", "Steam"], ["ice", "Ice"]], sel, (v) => { sel = v || sel; S.redraw(); }, { label: "Fog type" });
  function draw(g, W, H, top) {
    const ph = W < 520, gy = H - (ph ? 30 : 36), x0 = 10, x1 = W - 10, mid = W / 2;
    const defs = S.el.querySelector("defs"); if (!defs.querySelector("#" + fid)) { const ns = "http://www.w3.org/2000/svg", f = document.createElementNS(ns, "filter"); f.id = fid; f.setAttribute("x", "-20%"); f.setAttribute("y", "-40%"); f.setAttribute("width", "140%"); f.setAttribute("height", "180%"); const b = document.createElementNS(ns, "feGaussianBlur"); b.setAttribute("stdDeviation", ph ? "4" : "6"); f.append(b); defs.append(f); }
    const fog = (pts, op = 0.32) => { const e = P(g, "M" + pts.map((p) => p.join(",")).join(" L") + " Z", { fill: `rgba(242,241,236,${Math.min(0.75, op * 1.6)})`, stroke: "none" }); e.setAttribute("filter", `url(#${fid})`); return e; };   // soft-edged fog
    const wavy = (x, y, len) => { let d = `M${x},${y}`; for (let i = 1; i <= 8; i++) d += ` L${x + (i % 2 ? 4 : -4)},${y - (len * i) / 8}`; P(g, d, { stroke: ACC, w: 1.8 }); P(g, `M${x - 4},${y - len + 6} L${x},${y - len - 2} L${x + 4},${y - len + 6}`, { stroke: ACC, w: 1.8 }); };
    const arrow = (xa, ya, xb, yb) => { L(g, xa, ya, xb, yb, { stroke: ACC, w: 2.4 }); const a = Math.atan2(yb - ya, xb - xa); P(g, `M${xb - 9 * Math.cos(a - 0.45)},${yb - 9 * Math.sin(a - 0.45)} L${xb},${yb} L${xb - 9 * Math.cos(a + 0.45)},${yb - 9 * Math.sin(a + 0.45)}`, { stroke: ACC, w: 2.4 }); };
    const lab = (x, y, s, o = {}) => T(g, x, y, s, { size: 11, fill: GRAY, ...o });
    const hgt = gy - top - 10;
    if (sel === "rad") {
      const vy = gy, hill = [[x0, gy - hgt * 0.45], [W * 0.22, gy - hgt * 0.3], [W * 0.38, vy], [W * 0.62, vy], [W * 0.78, gy - hgt * 0.32], [x1, gy - hgt * 0.5]];
      fog([[W * 0.26, gy - hgt * 0.26], [W * 0.74, gy - hgt * 0.27], [W * 0.64, vy], [W * 0.36, vy]], 0.45);
      P(g, "M" + hill.map((p) => p.join(",")).join(" L"), { stroke: INK, w: 2 });
      C(g, W * 0.82, top + 22, 9, { fill: "rgba(242,241,236,.85)" }); for (const [sx, sy] of [[0.12, 30], [0.3, 18], [0.55, 34], [0.68, 16], [0.92, 44]]) C(g, W * sx, top + sy, 1.4, { fill: INK });
      for (const f of [0.18, 0.84]) wavy(W * f, gy - hgt * (f < 0.5 ? 0.38 : 0.42) - 6, hgt * 0.32);
      lab(mid, gy - hgt * 0.3 - 8, "fog pools in the valley", { anchor: "middle", fill: INK });
      lab(x0 + 4, top + 14, ph ? "clear, calm" : "clear sky, calm wind");
      lab(W * 0.18 + 10, gy - hgt * 0.62, ph ? "heat out" : "ground loses heat", { fill: ACC });
    } else if (sel === "adv") {
      P(g, `M${x0},${gy} L${mid},${gy}`, { stroke: "rgba(96,165,250,.6)", w: 3 }); P(g, `M${mid},${gy} L${x1},${gy}`, { stroke: INK, w: 2 });
      lab(x0 + 4, gy + 16, ph ? "warm sea" : "warmer water", { fill: GRAY }); lab(x1 - 4, gy + 16, ph ? "cold land" : "colder land or water", { anchor: "end" });
      fog([[mid - 20, gy - hgt * 0.32], [x1, gy - hgt * 0.38], [x1, gy], [mid - 30, gy]], 0.4);
      for (const yy of [0.62, 0.46]) arrow(x0 + 20, gy - hgt * yy, mid + (ph ? 10 : 40), gy - hgt * yy);
      lab(x0 + 4, top + 14, ph ? "moist air, wind" : "warm, moist air blown inland", { fill: ACC });
      lab(mid + (x1 - mid) / 2, gy - hgt * 0.15, "fog", { anchor: "middle", fill: INK, size: 13 });
    } else if (sel === "up") {
      const sl = [[x0, gy], [W * 0.25, gy], [x1, top + hgt * 0.15]]; P(g, "M" + sl.map((p) => p.join(",")).join(" L"), { stroke: INK, w: 2 });
      const yAt = (x) => (x < W * 0.25 ? gy : gy - ((x - W * 0.25) / (x1 - W * 0.25)) * (gy - top - hgt * 0.15));
      fog([[W * 0.58, yAt(W * 0.58) - 10], [W * 0.75, yAt(W * 0.75) - hgt * 0.22], [x1 - 6, yAt(x1) - hgt * 0.26], [x1 - 6, yAt(x1 - 6) + 4], [W * 0.56, yAt(W * 0.56) + 4]], 0.42);
      arrow(x0 + 14, gy - 22, W * 0.3, gy - 22); arrow(W * 0.32, yAt(W * 0.32) - 22, W * 0.55, yAt(W * 0.55) - 22);
      lab(x0 + 4, top + 14, ph ? "wind pushes air uphill" : "wind pushes moist, stable air uphill", { fill: ACC });
      lab(ph ? W * 0.5 : W * 0.66, yAt(ph ? W * 0.5 : W * 0.66) + 18, ph ? "cools as it rises" : "it cools as it rises", { fill: INK });
    } else if (sel === "steam") {
      P(g, `M${x0},${gy} L${x1},${gy}`, { stroke: "rgba(96,165,250,.6)", w: 3 }); lab(x0 + 4, gy + 16, ph ? "warm water" : "warmer water (lake, river, sea)");
      for (const yy of [0.62, 0.42]) arrow(x0 + 20, gy - hgt * yy, x1 - 30, gy - hgt * yy);
      for (let i = 0; i < (ph ? 7 : 11); i++) { const x = x0 + 30 + (i * (x1 - x0 - 60)) / (ph ? 6 : 10); let d = `M${x},${gy - 2}`; for (let k = 1; k <= 5; k++) d += ` Q${x + (k % 2 ? 6 : -6)},${gy - 2 - k * 6 + 3} ${x},${gy - 2 - k * 6}`; P(g, d, { stroke: "rgba(242,241,236,.7)", w: 1.6 }); }
      lab(x0 + 4, top + 14, ph ? "cold, dry air" : "cold, dry air moving over it", { fill: ACC });
      lab(x1 - 4, gy - 40, "steam fog", { anchor: "end", fill: INK });
    } else {
      P(g, `M${x0},${gy} L${x1},${gy}`, { stroke: INK, w: 2 }); lab(x0 + 4, gy + 16, ph ? "frozen ground" : "snow-covered ground");
      fog([[x0, gy - hgt * 0.4], [x1, gy - hgt * 0.36], [x1, gy], [x0, gy]], 0.3);
      for (let i = 0; i < 26; i++) { const x = x0 + 14 + ((i * 37) % 100) / 100 * (x1 - x0 - 28), y = gy - 10 - ((i * 53) % 100) / 100 * hgt * 0.32; L(g, x - 3, y, x + 3, y, { stroke: ACC, w: 1.4 }); L(g, x, y - 3, x, y + 3, { stroke: ACC, w: 1.4 }); }
      lab(x0 + 4, top + 14, ph ? "−25 °F or colder" : "very cold: usually −25 °F or colder", { fill: ACC });
      lab(x1 - 4, gy - hgt * 0.4 - 8, "ice crystals", { anchor: "end", fill: INK });
    }
    const f = FT[sel]; S.F.caption(f[1], f[0]);
    S.F.explain(`${f[2]} All fog forms when air cools to its dew point, or gains moisture until it's saturated, right at the surface. Watch a narrowing temperature–dew point spread. <span class="src">PHAK 12</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
