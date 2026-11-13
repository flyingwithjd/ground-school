// Runway numbering on a compass rose (AIM 4-3-6, AIM 2-3-3). Turn the runway; read both numbers;
// add parallels to see L/C/R swap ends; then quiz yourself on which way a runway points.
import { frame, chips, slider, svg, drawOn, ACC, FAINT, FAINT2, INK } from "./base.js?v=ff9d939563";
import { s, h, shuffle } from "../core/util.js?v=ff9d939563";
import { T } from "./shapes.js?v=ff9d939563";
const CX = 1060, CY = 440, R = 330, D2R = Math.PI / 180;
const pt = (a, r) => [CX + r * Math.sin(a * D2R), CY - r * Math.cos(a * D2R)];
export const rwyNum = (hdg) => { let n = Math.round(((hdg % 360) + 360) % 360 / 10); if (n === 0) n = 36; return n; };
const card = (a) => ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"][Math.round((((a % 360) + 360) % 360) / 45) % 8];
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Runway numbering · magnetic", tr: "AIM 4-3-6 · AIM 2-3-3" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  // rose
  for (let a = 0; a < 360; a += 5) { const big = a % 30 === 0, mid = a % 10 === 0; const [x1, y1] = pt(a, R), [x2, y2] = pt(a, R - (big ? 26 : mid ? 16 : 8));
    s("line", { x1, y1, x2, y2, stroke: big ? FAINT2 : FAINT, "stroke-width": big ? 2 : 1.2 }, g);
    if (big) { const [tx, ty] = pt(a, R + 30); const lab = { 0: "N", 90: "E", 180: "S", 270: "W" }[a] ?? String(a / 10); T(g, tx, ty + 7, lab, { anchor: "middle", size: 18, op: 0.55 }); } }
  s("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, g);
  const rw = s("g", {}, g), arrowG = s("g", {}, g);
  const big1 = T(g, 110, 300, "", { size: 150, op: 1, sans: true, weight: 800, upper: false });
  const sub1 = T(g, 116, 350, "", { size: 17, op: 0.6 });
  const big2 = T(g, 110, 560, "", { size: 90, op: 0.45, sans: true, weight: 800, upper: false });
  const sub2 = T(g, 116, 600, "", { size: 17, op: 0.5 });
  let hdg = opts.hdg ?? 274, par = "1";
  function draw(anim) { rw.innerHTML = ""; arrowG.innerHTML = "";
    const n = rwyNum(hdg), m = rwyNum(hdg + 180), L = 520, W = 54;
    const offs = par === "1" ? [0] : par === "2" ? [-1, 1] : [-1, 0, 1], gap = 96;
    const lettersA = par === "1" ? [""] : par === "2" ? ["L", "R"] : ["L", "C", "R"];
    offs.forEach((o, i) => { // o<0 is to the left when looking along hdg (approach for runway n)
      const gg = s("g", { transform: `rotate(${hdg} ${CX} ${CY}) translate(${o * gap} 0)` }, rw);
      const r = s("rect", { x: CX - W / 2, y: CY - L / 2, width: W, height: L, fill: "none", stroke: i === 0 && par !== "1" ? INK : INK, "stroke-width": 2, opacity: 0.85 }, gg);
      s("line", { x1: CX, y1: CY - L / 2 + 70, x2: CX, y2: CY + L / 2 - 70, stroke: INK, "stroke-width": 2, "stroke-dasharray": "16 14", opacity: 0.45 }, gg);
      // threshold for runway n sits at the far-from-heading end (y = CY + L/2), reading "up" the runway
      const la = lettersA[i], lb = lettersA[lettersA.length - 1 - i];
      const tA = T(gg, CX, CY + L / 2 - 22, String(n) + la, { anchor: "middle", size: 22, op: 1, sans: true, weight: 700, upper: false });
      const tB = T(gg, CX, CY - L / 2 + 22, String(m) + lb, { anchor: "middle", size: 22, op: 0.7, sans: true, weight: 700, upper: false }); tB.setAttribute("transform", `rotate(180 ${CX} ${CY - L / 2 + 15})`);
      if (i === 0 && anim) drawOn(r, { dur: 1200 }); });
    // approach arrow for runway n: from outside the far end, pointing along hdg
    const [ax, ay] = pt(hdg + 180, R + 64), [bx, by] = pt(hdg + 180, 276);
    const a = s("line", { x1: ax, y1: ay, x2: bx, y2: by, stroke: ACC, "stroke-width": 4, "marker-end": "url(#ah)", filter: "url(#gw)" }, arrowG);
    const [hx, hy] = pt(hdg, R - 2); s("circle", { cx: hx, cy: hy, r: 8, fill: ACC, filter: "url(#gw)" }, arrowG);
    if (anim) drawOn(a, { dur: 900 });
    big1.textContent = String(n); sub1.textContent = `land heading ${String(Math.round(hdg) % 360 || 360).padStart(3, "0")}° · ${card(hdg)}`;
    big2.textContent = String(m); sub2.textContent = `the other end · heading ${String(Math.round(hdg + 180) % 360 || 360).padStart(3, "0")}°`;
    const five = Math.round(hdg) % 10 === 5;
    F.caption("Runway " + n, five ? "Ends in 5: could be either" : `${n} and ${m}: 180° apart`);
    F.explain(`A runway's number is its magnetic heading rounded to the nearest 10°, with the last zero dropped: ${Math.round(hdg)}° becomes <b>${n}</b>. The other end is 180° away, so its number differs by 18: <b>${m}</b>.${five ? " A heading ending in 5 could be numbered either way." : ""}${par !== "1" ? " Parallels get L, C, R, read left to right <b>as you approach</b>, so the left runway from one end is the right runway from the other." : ""} <span class="src">AIM 4-3-6; AIM 2-3-3</span>`); }
  const sl = slider(F.ctrl, { label: "Magnetic heading", min: 1, max: 360, value: hdg, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { hdg = v; draw(false); } });
  chips(F.ctrl, [["1", "Single"], ["2", "L / R"], ["3", "L / C / R"]], par, (v) => { par = v; draw(true); }, { label: "Parallel runways" });
  // quiz
  const qb = h("button", { class: "chip", type: "button" }, "Quiz me"); F.ctrl.append(qb); const qWrap = h("div", { class: "quizrow", style: "flex-basis:100%;display:none" }); F.ctrl.append(qWrap);
  qb.addEventListener("click", () => { const n = 1 + Math.floor(Math.random() * 36); const right = n * 10;
    const opts = shuffle([right, (right + 180) % 360 || 360, (right + 90) % 360 || 360, (right + 270) % 360 || 360]);
    qWrap.style.display = ""; qWrap.innerHTML = ""; qWrap.append(h("p", { style: "margin:0 0 10px" }, `Cleared to land runway ${n}. Which way will you be pointing?`));
    chips(qWrap, opts.map((o) => [String(o), `${String(o).padStart(3, "0")}° ${card(o)}`]), null, (v) => { const ok = +v === right; hdg = right; sl.set(right, false); draw(true);
      F.explain(`${ok ? "<b>Correct.</b>" : "<b>Not quite.</b>"} Runway ${n} points about ${String(right).padStart(3, "0")}° magnetic: add a zero. ${ok ? "" : "The reciprocal, " + rwyNum(right + 180) + ", is the other end."} <span class="src">AIM 4-3-6</span>`); }, { label: "Answer" }); });
  draw(true);
  return { destroy: () => F.destroy() };
}
