// 172S fuel system as a flow schematic (layout is generic, sequence per POH Sec 7). Labels in screen px.
// Choose selector and shutoff positions; fuel moves along the live path. Tap a component to read what it does.
import { chips, loop } from "./base.js?v=30bce312db";
import { reduced } from "../core/util.js?v=30bce312db";
import { pxScene, T, L, P, R, C, hit, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=30bce312db";
const NODES = [
  ["sel", "Selector valve", "BOTH, LEFT or RIGHT. Takeoff and landing are normally on BOTH. Confirm with your POH."],
  ["res", "Reservoir tank", "Small tank below the selector that keeps the line full."],
  ["aux", "Auxiliary pump", "Electric pump for priming and as a backup to the engine-driven pump."],
  ["shut", "Shutoff valve", "Red knob. Pulled out, it stops fuel to the engine (engine fire, for example)."],
  ["str", "Fuel strainer", "Traps water and sediment. Sample its drain on preflight."],
  ["edp", "Engine-driven pump", "Normal source of fuel pressure once the engine runs."],
  ["fcu", "Fuel/air control unit", "Meters fuel to match the airflow set by the throttle and mixture."],
  ["dist", "Distribution valve", "Splits the metered fuel evenly among the four cylinders."],
  ["noz", "Injector nozzles", "One per cylinder, spraying into the intake port."],
];
const TANK = "Vented integral tank in the wing. 28 gal total, 26.5 usable.";
export function mount(host) {
  let sel = "BOTH", shut = false, picked = null, off = 0, live = [];
  const S = pxScene(host, { cls: "xtall", corners: { tl: "Fuel system · schematic", tr: "C172S POH 7" } }, draw);
  chips(S.F.ctrl, [["BOTH", "Both"], ["LEFT", "Left"], ["RIGHT", "Right"]], "BOTH", (v) => { if (v) { sel = v; picked = null; S.redraw(); } }, { label: "Fuel selector" });
  chips(S.F.ctrl, [["open", "Shutoff open"], ["closed", "Shutoff closed"]], "open", (v) => { shut = v === "closed"; picked = null; S.redraw(); }, { label: "Shutoff valve" });
  function draw(g, W, H, top) {
    const ph = W < 520, tx = ph ? W * 0.3 : W * 0.42, tw = ph ? (W - 40) / 2 - 6 : 150, ty = top + 8, th = 40;
    const y0 = ty + th + 34, y1 = H - 22, dy = (y1 - y0) / (NODES.length - 1);
    const fromL = sel !== "RIGHT", fromR = sel !== "LEFT";
    const lx = ph ? 16 : tx - 40 - tw, rx = ph ? W - 16 - tw : tx + 40;
    const base = (d) => P(g, d, { stroke: DIM, w: 3 }), flow = (d, on) => { if (on) { const p = P(g, d, { stroke: ACC, w: 3, dash: "3 14" }); live.push(p); } };
    live = [];
    const dL = `M${lx + tw / 2},${ty + th} L${lx + tw / 2},${y0 - 14} L${tx},${y0 - 14} L${tx},${y0}`, dR = `M${rx + tw / 2},${ty + th} L${rx + tw / 2},${y0 - 14} L${tx},${y0 - 14}`;
    const dTrunk = `M${tx},${y0} L${tx},${y1}`, dPre = `M${tx},${y0} L${tx},${y0 + 3 * dy}`, dPost = `M${tx},${y0 + 3 * dy} L${tx},${y1}`;
    base(dL); base(dR); base(dTrunk);
    flow(dL, fromL); flow(dR, fromR); flow(dPre, true); flow(dPost, !shut);
    // tanks
    [["L", lx, "LEFT TANK", fromL], ["R", rx, "RIGHT TANK", fromR]].forEach(([k, x, n, on]) => {
      const r = R(g, x, ty, tw, th, { stroke: picked === k ? ACC : on ? GRAY : DIM, sw: picked === k ? 2.4 : 1.5, rx: 10, fill: on ? ACCF : "#0A0A0B" });
      T(g, x + tw / 2, ty + th / 2 + 4, n, { anchor: "middle", size: ph ? 11 : 12, fill: on ? INK : GRAY });
      hit(g, r, n, () => { picked = k; S.redraw(); });
    });
    NODES.forEach(([k, n], i) => { const y = y0 + i * dy, on = picked === k, dead = shut && i > 3;
      const r = R(g, tx - 11, y - 11, 22, 22, { rx: 5, fill: "#0A0A0B", stroke: on ? ACC : k === "shut" && shut ? ACC : GRAY, sw: on ? 2.6 : 1.6 });
      if (k === "shut" && shut) L(g, tx - 7, y, tx + 7, y, { stroke: ACC, w: 3 });
      const lab = T(g, tx + 22, y + 4, n.toUpperCase(), { size: ph ? 11 : 12, fill: on ? INK : dead ? DIM : GRAY });
      hit(g, r, n, () => { picked = k; S.redraw(); }); hit(g, lab, n, () => { picked = k; S.redraw(); });
    });
    if (picked) { const nd = NODES.find((x) => x[0] === picked); S.F.caption("Fuel system", nd ? nd[1] : picked === "L" ? "Left tank" : "Right tank"); S.F.explain((nd ? nd[2] : TANK) + " <span class=\"src\">C172S POH 7</span>"); }
    else { S.F.caption(shut ? "Shutoff valve closed" : `Selector ${sel}`, shut ? "No fuel to the engine" : `Feeding from ${sel === "BOTH" ? "both tanks" : "the " + sel.toLowerCase() + " tank"}`);
      S.F.explain(shut ? "With the shutoff pulled, fuel stops at the valve. The engine runs until the lines downstream empty." : `Fuel flows by gravity from ${sel === "BOTH" ? "both tanks" : "the " + sel.toLowerCase() + " tank"} to the selector, then down through the pumps to the engine. Tap any component. Confirm the details with your CFI and your aircraft's POH. <span class="src">C172S POH 7</span>`); }
    live.forEach((p) => p.setAttribute("stroke-dashoffset", off));
  }
  if (!reduced()) loop(S.F, (now, dt) => { off -= dt * 0.05; live.forEach((p) => p.setAttribute("stroke-dashoffset", off.toFixed(1))); });
  return { destroy() { S.F.destroy(); } };
}
