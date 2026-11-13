// Anti-ice vs deice on a wing leading edge. Fly into icing and watch ice build; pick the protection: none, pitot heat only,
// pneumatic deice boots (cycle them to crack the ice off), thermal (heated) anti-ice, or a weeping wing (antifreeze fluid).
// Facts, PHAK 7 (Anti-Ice and Deice Systems): anti-ice prevents ice, deice removes it; most light airplanes have only a
// heated pitot tube, aren't certified for flight in icing and must exit icing immediately; boots are rubber sheets inflated
// by a pneumatic pump to crack the ice off, some residual ice may remain, modern boots don't "bridge", so cycle them as soon
// as ice is seen; thermal anti-ice should be on before entering icing; a weeping wing pumps antifreeze through small holes
// to prevent ice and can also deice; the systems are not meant for long-term flight in icing. AC 91-74B: water that runs
// back past a heated area can refreeze behind it (runback ice). Ice growth rates and the lift/drag bars are illustrative.
import { chips, row } from "./base.js?v=da5a58a7ab";
import { h } from "../core/util.js?v=da5a58a7ab";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=da5a58a7ab";
import { anim, COL } from "./dial.js?v=da5a58a7ab";
const ICE = "#CFE6FF";
const SAY = {
  none: ["No protection", "Most trainers aren't certified for icing. If you meet it, exit at once: turn back or change altitude."],
  pitot: ["Pitot heat only", "It keeps the pitot tube clear so the airspeed indicator works. The wing still collects ice."],
  boots: ["Deice boots", "Boots remove ice after it forms: inflating them cracks it off. Cycle them as soon as you see ice."],
  heated: ["Thermal anti-ice", "Heat keeps ice from forming at all. Turn it on before you enter icing conditions."],
  weep: ["Weeping wing", "Antifreeze weeps out of tiny holes: it prevents ice and can also loosen ice that already formed."],
};
export function mount(host) {
  let prot = "none", icing = false, ice = 0, run = 0, boot = 0, pice = 0, cycled = false;
  const S = pxScene(host, { cls: "xtall icing", corners: { tl: "Anti-ice and deice", tr: "PHAK 7" } }, draw);
  const r0 = row(S.F.ctrl, "Protection"); chips(r0, [["none", "None"], ["pitot", "Pitot heat"], ["boots", "Boots"], ["heated", "Heated"], ["weep", "Weeping"]], prot, (k) => { prot = k || "none"; cycled = false; upd(); }, { label: "Protection" });
  const r1 = row(S.F.ctrl, "Fly"); const fg = h("div", { class: "chips", role: "group", "aria-label": "Fly" }); r1.append(fg);
  const ib = h("button", { class: "chip", type: "button" }, "Enter icing"), cb = h("button", { class: "chip", type: "button" }, "Cycle boots"), xb = h("button", { class: "chip", type: "button" }, "Start over"); fg.append(ib, cb, xb);
  ib.addEventListener("click", () => { icing = !icing; upd(); }); cb.addEventListener("click", () => { if (prot === "boots") { boot = 1; cycled = true; upd(); } });
  xb.addEventListener("click", () => { icing = false; ice = 0; run = 0; pice = 0; boot = 0; cycled = false; upd(); });
  const A = anim(S.F, (dt) => { let more = false;
    if (boot > 0) { boot = Math.max(0, boot - dt * 0.9); if (boot < 0.5 && ice > 0.12) ice = Math.max(0.1, ice * 0.15); more = true; }
    if (icing) { const prevent = prot === "heated" || prot === "weep";
      if (prevent) { if (ice > 0) { ice = Math.max(0, ice - dt * (prot === "weep" ? 0.25 : 0.5)); more = true; } if (prot === "heated" && run < 0.6) { run = Math.min(0.6, run + dt * 0.04); more = true; } }
      else if (ice < 1) { ice = Math.min(1, ice + dt * 0.08); more = true; }
      if (prot === "none" || prot === "boots") { if (pice < 1) { pice = Math.min(1, pice + dt * 0.12); more = true; } } else if (pice > 0) { pice = Math.max(0, pice - dt * 0.5); more = true; } }
    S.redraw(); return more; });
  function upd() { ib.textContent = icing ? "Exit icing" : "Enter icing"; ib.classList.toggle("on", icing); cb.disabled = prot !== "boots"; S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const wide = W >= 600, sc = Math.min(wide ? W * 0.62 : W * 0.86, 520), lx = wide ? 40 : 18, cy = top + (H - top) * (wide ? 0.42 : 0.36), th = sc * 0.2;
    // leading edge: a half-round nose blending into upper and lower skins
    const nose = (o) => `M${lx + sc},${cy - th / 2 - o} L${lx + th * 0.6},${cy - th / 2 - o} A${th / 2 + o},${th / 2 + o} 0 0 0 ${lx + th * 0.6},${cy + th / 2 + o} L${lx + sc},${cy + th / 2 + o}`;
    if (ice > 0.01) { const t = ice * th * 0.45, x = lx + th * 0.6 - th / 2 - t; P(g, `M${lx + th * 0.6 + th * 0.4},${cy - th / 2 - 2} Q${x - t * 0.6},${cy - th / 2 - t * 1.2} ${x},${cy} Q${x - t * 0.6},${cy + th / 2 + t * 1.2} ${lx + th * 0.6 + th * 0.4},${cy + th / 2 + 2} Z`, { fill: ICE, stroke: ICE, w: 1, op: 0.92 });
      if (ice > 0.5) [-1, 1].forEach((sd) => P(g, `M${x + 4},${cy + sd * th * 0.2} l${-t * 0.5},${sd * t * 0.25}`, { stroke: ICE, w: 4 })); }
    if (run > 0.02) R(g, lx + th * 1.6, cy - th / 2 - 3 - run * 8, run * th * 1.4, 3 + run * 8, { fill: ICE, op: 0.9 });
    const bi = boot > 0 ? Math.sin(Math.min(1, (1 - boot) * 2) * Math.PI) * th * 0.12 : 0;
    P(g, nose(0) + `L${lx + sc},${cy - th / 2}`, { stroke: INK, w: 2, fill: "#1a1a1c" });
    if (prot === "boots") P(g, `M${lx + th * 1.4},${cy - th / 2 - bi} L${lx + th * 0.6},${cy - th / 2 - bi} A${th / 2 + bi},${th / 2 + bi} 0 0 0 ${lx + th * 0.6},${cy + th / 2 + bi} L${lx + th * 1.4},${cy + th / 2 + bi}`, { stroke: bi > 0.5 ? ACC : GRAY, w: 5 });
    if (prot === "heated") P(g, `M${lx + th * 1.3},${cy - th / 2 + 3} L${lx + th * 0.6},${cy - th / 2 + 3} A${th / 2 - 3},${th / 2 - 3} 0 0 0 ${lx + th * 0.6},${cy + th / 2 - 3} L${lx + th * 1.3},${cy + th / 2 - 3}`, { stroke: COL.red, w: 3, dash: "6 4" });
    if (prot === "weep") for (let i = -3; i <= 3; i++) { const a = (i / 3.4) * Math.PI / 2, px = lx + th * 0.6 - Math.cos(a) * th / 2, py = cy + Math.sin(a) * th / 2; C(g, px - 6, py, 3, { fill: COL.cyan }); }
    // airflow
    for (let j = -1; j <= 1; j += 2) P(g, `M${lx - 30},${cy + j * th * 0.9} C${lx + th * 0.4},${cy + j * th * 0.9} ${lx + th},${cy + j * th * 0.75} ${lx + sc},${cy + j * th * 0.75}`, { stroke: ice > 0.5 && j < 0 ? COL.red : DIM, w: 1.2, dash: ice > 0.5 && j < 0 ? "4 4" : null });
    // labels
    const lab = { none: "", pitot: "", boots: "rubber boot", heated: "heated zone", weep: "antifreeze holes" }[prot];
    if (lab) T(g, lx + th * 0.9, cy + th / 2 + 26, lab, { size: 11, anchor: "middle", fill: prot === "heated" ? COL.red : prot === "weep" ? COL.cyan : ACC });
    if (ice > 0.05) T(g, lx + th * 0.1, cy - th / 2 - 22 - ice * 10, "ice", { size: 11, fill: ICE });
    if (run > 0.1) T(g, lx + th * 2.3, cy - th / 2 - 22, "runback ice", { size: 11, anchor: "middle", fill: ICE });
    // pitot tube and bars
    const px0 = wide ? W * 0.72 : 24, py0 = wide ? top + 30 : cy + th / 2 + 60, bw = wide ? W * 0.24 : W - 48;
    const ph = prot !== "none" && prot !== "boots";
    L(g, px0, py0 + 10, px0 + 60, py0 + 10, { stroke: ph ? COL.red : INK, w: 4 }); if (pice > 0.05) C(g, px0 - 2, py0 + 10, 3 + pice * 6, { fill: ICE });
    T(g, px0 + 70, py0 + 14, pice > 0.6 ? "pitot blocked" : "pitot clear", { size: 11, fill: pice > 0.6 ? COL.red : GRAY });
    const liftV = 1 - ice * 0.45, dragV = 0.3 + ice * 0.6;
    [["lift", liftV, ACC], ["drag", dragV, COL.yellow]].forEach(([t, v, col], i) => { const y = py0 + 40 + i * 34; T(g, px0, y, t, { size: 11, fill: GRAY }); R(g, px0, y + 8, bw, 8, { stroke: DIM, sw: 1 }); R(g, px0, y + 8, bw * Math.min(1, v), 8, { fill: col }); });
    let cap = SAY[prot];
    if (prot === "none" && ice > 0.05) cap = ["Ice building", "Ice adds drag and destroys lift. With no protection, leave icing now: turn back or change altitude."];
    if (prot === "boots" && cycled && boot === 0) cap = ["Boots cycled", "Inflating cracked the ice off. Some residual ice can stay; cycle again as more builds."];
    if (prot === "heated" && run > 0.1) cap = ["Runback ice", "Water can run back past the heated area and refreeze behind it. Leave icing conditions."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>Anti-ice prevents ice; deice removes it. None of these systems is meant for long flights in icing. Your airplane's POH says whether it is approved for known icing; most trainers aren't.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
