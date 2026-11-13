// Fuel and oil at the walkaround (GL1 "walk"): sample cup, fuel nozzles, oil dipstick. Mode chips sit on top; each mode's
// buttons sit in a fixed bar under the stage, so nothing jumps. Sample: judge each cup Fly / Drain again / No-go.
// Sources: AFH Ch 2 (grade colors, water beads, specks, all-water sample, jet fuel, nozzles, JET-A placard, oil cold vs warm);
// C172S POH Sec 1, 2 (100LL or 100 grade fuel; oil 5 qt minimum, 8 qt capacity).
import { pxScene, T, R, L, P, C, INK, ACC, GRAY, DIM, ACCF } from "./kit.js?v=3c9cdbaed9";
import { chips } from "./base.js?v=3c9cdbaed9";
import { rich } from "../core/rich.js?v=3c9cdbaed9";
import { h } from "../core/util.js?v=3c9cdbaed9";
const RED = "#E5484D";
export const SAMPLES = [
  { c: "#4F8DF7", name: "Blue, gasoline smell", tag: "100LL", ans: "fly", why: "100LL is dyed blue and approved for the 172S. Clean, no water, no specks: good." },
  { c: "#4F8DF7", water: true, name: "Blue with beads at the bottom", tag: "Water", ans: "drain", why: "Water is heavier than fuel and sits as clear beads at the bottom. Keep sampling until none remains." },
  { c: "#E8DFB8", name: "Straw-colored, smells like kerosene, feels oily", tag: "Jet fuel", ans: "nogo", why: "That's [[jet fuel]]. A piston engine may start and take off on it, then fail. Don't fly; get the tanks drained." },
  { c: "#DCE4F0", allWater: true, name: "Clear all the way, no fuel smell", tag: "All water?", ans: "drain", why: "The whole cup may be water. Keep draining; if water keeps coming, maintenance must look before flight." },
  { c: "#4F8DF7", specks: true, name: "Blue with small dark specks", tag: "Sediment", ans: "drain", why: "Dark specks can be bits of seals or tank sealant. Drain until clean; if they keep coming, call maintenance." },
  { c: "#3FBF7F", name: "Green, gasoline smell", tag: "100 (green)", ans: "fly", why: "Green is 100-grade avgas, also approved for the 172S. Check your POH for your airplane." },
  { c: "#E5484D", name: "Red, gasoline smell", tag: "80/87", ans: "nogo", why: "Red is 80/87, a lower grade than the 172S needs. Never substitute a lower grade; it can cause detonation." },
];
const ANS = { fly: "Fly", drain: "Drain again", nogo: "No-go" };
export function mount(host) {
  let mode = "sample", si = 0, said = null, noz = "avgas", warm = false;
  const sc = pxScene(host, { cls: "fuelcheck", corners: { tl: "Fuel and oil", tr: "Sample" } }, draw);
  const { F } = sc; F.root.insertBefore(F.ctrl, F.stage);   // mode chips on top; the bar below the stage holds each mode's buttons
  const bar = h("div", { class: "fc-bar" }); F.stage.after(bar); F.root.insertBefore(F.root.querySelector(".caption"), bar.nextSibling);
  chips(F.ctrl, [["sample", "Fuel sample"], ["nozzle", "Nozzles"], ["oil", "Oil dipstick"]], mode, (v) => { mode = v; ui(); }, { label: "What to check" });
  function ui() { bar.innerHTML = "";
    if (mode === "sample") { const r1 = h("div", { class: "fc-row" }); Object.entries(ANS).forEach(([k, t]) => { const b = h("button", { type: "button", class: "btn ghost fc-ans" + (said === k ? " on" : "") }, t); b.disabled = !!said; b.onclick = () => { said = k; ui(); }; r1.append(b); });
      const nx = h("button", { type: "button", class: "btn ghost arrow" }, `Next sample (${si + 1} of ${SAMPLES.length})`); nx.onclick = () => { si = (si + 1) % SAMPLES.length; said = null; ui(); };
      bar.append(r1, h("div", { class: "fc-row" }, nx)); }
    else if (mode === "nozzle") chips(bar, [["avgas", "Avgas nozzle"], ["jet", "Jet nozzle"]], noz, (v) => { noz = v; ui(); }, { label: "Nozzle" });
    else chips(bar, [["cold", "Engine cold"], ["warm", "Just shut down"]], warm ? "warm" : "cold", (v) => { warm = v === "warm"; ui(); }, { label: "Engine" });
    text(); sc.redraw(); }
  function text() { F.corner("tr", { sample: "Sample", nozzle: "Misfueling", oil: "Sample marks" }[mode]);
    if (mode === "sample") { const s = SAMPLES[si];
      F.caption(`Sample ${si + 1} · your call`, said ? s.tag : s.name.split(",")[0]);
      F.explain(said ? `<b class="${said === s.ans ? "fc-yes" : "fc-no"}">${said === s.ans ? "Right" : "Not quite"}: ${ANS[s.ans]}.</b> ${rich(s.why)} <span class="src">AFH 2 · C172S POH 1</span>`
        : `${s.name}. Fly, drain again, or no-go? Sample every drain your POH lists, in its order.`); }
    else if (mode === "nozzle") { F.caption("Misfueling guard", noz === "avgas" ? "Straight avgas nozzle" : "Flared jet nozzle");
      F.explain(noz === "avgas" ? "Avgas nozzles are straight, one diameter all the way, and fit the 172's filler. Still watch the fueler: right grade, right amount, caps back on. <span class=\"src\">AFH 2</span>"
        : "Jet nozzles flare at the end so they won't go into an avgas filler. Jet trucks carry a JET-A placard, white letters on black. <span class=\"src\">AFH 2</span>"); }
    else { F.caption(warm ? "Right after a flight" : "Before the first flight", warm ? "Reads lower" : "Reads higher");
      F.explain(rich(`Same oil, two readings: cold, it has all drained into the sump; right after shutdown some is still up in the engine. 172S: never below 5 qt, 8 qt is full. Sample dipstick; yours may be marked differently. <span class="src">AFH 2 · C172S POH 2</span>`)); } }
  function draw(g, W, H, top) {
    const cx = W / 2, avail = H - top - 10;
    if (mode === "sample") { const s = SAMPLES[si]; const cw = Math.min(W * 0.5, avail * 0.62), ch = avail * 0.82, x0 = cx - cw / 2, y0 = top + 4;
      R(g, x0 - 14, y0, cw + 28, ch + 8, { fill: "#EDECE6", rx: 8 });                             // white card behind the cup
      const k = 0.14 * cw, lx = x0 + 8, rx = x0 + cw - 8, by = y0 + ch - 6, ty = y0 + 18, lvl = ty + (by - ty) * 0.18;
      const ins = (y) => (y - ty) / (by - ty) * k;                                                  // cup narrows toward the bottom
      P(g, `M${lx + ins(lvl)} ${lvl} L${rx - ins(lvl)} ${lvl} L${rx - k} ${by} L${lx + k} ${by} Z`, { fill: s.c, stroke: "none", op: s.allWater ? 0.35 : 0.8 });
      if (s.water) for (let i = 0; i < 7; i++) C(g, lx + k + 10 + i * ((rx - lx - 2 * k - 20) / 6), by - 7 - (i % 2) * 6, 4.5, { fill: "#F4F7FA", stroke: "#6B7480", sw: 1 });
      if (s.specks) for (let i = 0; i < 9; i++) C(g, lx + k + 8 + ((i * 37) % 100) / 100 * (rx - lx - 2 * k - 16), lvl + 12 + ((i * 53) % 100) / 100 * (by - lvl - 22), 1.8, { fill: "#2A2A2A" });
      P(g, `M${lx} ${ty} L${rx} ${ty} L${rx - k} ${by} L${lx + k} ${by} Z`, { stroke: "#1A1A1C", w: 2 });
      T(g, cx, y0 + ch + 30, said ? s.tag : "What do you see?", { anchor: "middle", fill: said ? ACC : GRAY, size: 13, weight: 600 }); return; }
    if (mode === "nozzle") { const y = top + avail * 0.3, len = Math.min(W * 0.62, 260), x1 = cx - len / 2, x2 = cx + len / 2;
      const neckX = x2 + 4, open = 16;                                                               // filler neck opening of an avgas tank
      R(g, neckX, y - 36, 12, 72, { fill: "#141416", stroke: INK, sw: 1.5 }); R(g, neckX - 1, y - open / 2, 14, open, { fill: "#0A0A0B" });
      T(g, neckX + 6, y + 50, "avgas filler", { anchor: "middle", fill: GRAY, size: 11 });
      const on = noz === "avgas", st = on ? ACC : INK;
      if (on) { R(g, x1, y - 6, len, 12, { stroke: st, sw: 2, rx: 3, fill: ACCF }); T(g, x1, y - 16, "Straight, one diameter: fits", { fill: INK, size: 12 }); }
      else { P(g, `M${x1} ${y - 6} L${x2 - 34} ${y - 6} L${x2 - 4} ${y - 15} L${x2 - 4} ${y + 15} L${x2 - 34} ${y + 6} L${x1} ${y + 6} Z`, { stroke: RED, w: 2, fill: "rgba(229,72,77,.12)" }); T(g, x1, y - 24, "Flared end: won't go in", { fill: INK, size: 12 }); }
      const py = top + avail * 0.68, pw = 112, ph = 38; R(g, cx - pw / 2, py, pw, ph, { fill: "#000", stroke: on ? DIM : INK, sw: 1.5, rx: 4 });
      T(g, cx, py + ph / 2 + 1, "JET-A", { anchor: "middle", base: "middle", fill: "#FFF", size: 18, weight: 700, op: on ? 0.45 : 1 });
      T(g, cx, py + ph + 18, "placard on jet fuel trucks", { anchor: "middle", fill: GRAY, size: 11 }); return; }
    // dipstick: quart marks 4..8, oil level in the accent
    const sx = Math.round(W * 0.36), y1 = top + 6, y2 = H - 14, q = (n) => y2 - (n - 3) / 5.5 * (y2 - y1), lvl = warm ? 5.5 : 6.5;
    R(g, sx, y1, 12, y2 - y1, { stroke: INK, sw: 1.5, rx: 6 }); R(g, sx + 1.5, q(lvl), 9, y2 - q(lvl) - 1.5, { fill: ACC, rx: 4, op: 0.85 });
    for (let n = 4; n <= 8; n++) { L(g, sx - 10, q(n), sx, q(n), { stroke: n === 5 ? RED : INK, w: 1.5 }); T(g, sx - 16, q(n) + 4, n === 8 ? "8 FULL" : n === 5 ? "5 MIN" : String(n), { anchor: "end", size: 12, fill: n === 5 ? RED : INK }); }
    L(g, sx + 16, q(lvl), sx + 34, q(lvl), { stroke: ACC, w: 2 }); T(g, sx + 40, q(lvl) + 4, `${lvl} qt`, { size: 14, fill: INK, weight: 600 });
    T(g, sx + 40, q(lvl) + 22, warm ? "oil still in the engine" : "all oil in the sump", { size: 11, fill: GRAY });
  }
  ui();
  return { destroy() { F.destroy(); } };
}
