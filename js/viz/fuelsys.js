// 172S fuel system as a flow schematic (layout is generic, sequence per POH Sec 7).
// Choose selector and shutoff positions; fuel is drawn as moving points of light along the live path.
import { frame, chips, svg, loop, ACC, FAINT, FAINT2 } from "./base.js";
import { s } from "../core/util.js";
const NODES = {
  L: [200, 140, "Left tank", "Vented integral tank in the left wing. 28 gal total, 26.5 usable."],
  R: [1400, 140, "Right tank", "Vented integral tank in the right wing. 28 gal total, 26.5 usable."],
  sel: [800, 260, "Selector valve", "BOTH, LEFT or RIGHT. Takeoff and landing are normally on BOTH. Confirm with your POH."],
  res: [800, 380, "Reservoir tank", "Small tank below the selector that keeps the line full."],
  aux: [800, 480, "Auxiliary pump", "Electric pump for priming and as a backup to the engine-driven pump."],
  shut: [800, 580, "Shutoff valve", "Red knob. Pulled out, it stops fuel to the engine (engine fire, for example)."],
  str: [800, 680, "Fuel strainer", "Traps water and sediment. Sample its drain on preflight."],
  edp: [800, 780, "Engine-driven pump", "Normal source of fuel pressure once the engine runs."],
  fcu: [1020, 780, "Fuel/air control unit", "Meters fuel to match the airflow set by the throttle and mixture."],
  dist: [1250, 780, "Distribution valve", "Splits the metered fuel evenly among the four cylinders."],
  noz: [1250, 600, "Injector nozzles", "One per cylinder, spraying into the intake port."],
};
export function mount(host) {
  const F = frame(host, { corners: { tl: "Fuel system · schematic", tr: "C172S POH Sec 7" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  const seg = (a, b) => { const [x1, y1] = NODES[a], [x2, y2] = NODES[b]; return x1 === x2 || y1 === y2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} L${x1},${y2 - 0} L${x2},${y2}`; };
  const pathL = `M200,140 L200,260 L800,260`, pathR = `M1400,140 L1400,260 L800,260`;
  const trunk = ["sel", "res", "aux", "shut", "str", "edp", "fcu", "dist", "noz"]; let dTrunk = ""; for (let i = 0; i < trunk.length - 1; i++) dTrunk += seg(trunk[i], trunk[i + 1]) + " ";
  const base = (d) => s("path", { d, fill: "none", stroke: FAINT, "stroke-width": 3 }, g);
  base(pathL); base(pathR); base(dTrunk);
  const live = (d) => s("path", { d, fill: "none", stroke: ACC, "stroke-width": 3, "stroke-dasharray": "3 26", "stroke-linecap": "round", filter: "url(#gw)" }, g);
  const lL = live(pathL), lR = live(pathR), lT = live(dTrunk);
  const nodeEls = {};
  for (const [k, [x, y, name]] of Object.entries(NODES)) { const grp = s("g", { class: "tap", role: "button", tabindex: 0, "aria-label": name }, g);
    const isTank = k === "L" || k === "R"; const sh = isTank ? s("rect", { x: x - 150, y: y - 50, width: 300, height: 100, rx: 18, fill: "#0A0A0B", stroke: FAINT2, "stroke-width": 2 }, grp) : s("rect", { x: x - 18, y: y - 18, width: 36, height: 36, rx: 8, fill: "#0A0A0B", stroke: FAINT2, "stroke-width": 2 }, grp);
    const t = s("text", { x: isTank ? x : x + (x > 1200 ? 0 : -36), y: isTank ? y + 8 : y + 7, "text-anchor": isTank ? "middle" : x > 1200 ? "middle" : "end", fill: "rgba(242,241,236,.62)", "font-size": 22, "font-family": "IBM Plex Mono, monospace", "letter-spacing": 2 }, grp); t.textContent = name.toUpperCase();
    if (k === "fcu") { t.setAttribute("x", x); t.setAttribute("y", y + 52); t.setAttribute("text-anchor", "middle"); }
    if (k === "dist" || k === "noz") { t.setAttribute("x", x + 36); t.setAttribute("text-anchor", "start"); }
    grp.addEventListener("click", () => pick(k)); grp.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(k)); nodeEls[k] = sh; }
  let sel = "BOTH", shut = false, picked = null, off = 0;
  function pick(k) { picked = k; for (const [kk, e] of Object.entries(nodeEls)) e.setAttribute("stroke", kk === k ? ACC : FAINT2); F.caption("Fuel system", NODES[k][2]); F.explain(NODES[k][3]); }
  function upd() { const fromL = sel === "BOTH" || sel === "LEFT", fromR = sel === "BOTH" || sel === "RIGHT"; lL.style.display = fromL ? "" : "none"; lR.style.display = fromR ? "" : "none"; lT.style.display = shut ? "none" : "";
    if (!picked) { F.caption(shut ? "Shutoff valve closed" : `Selector ${sel}`, shut ? "No fuel to the engine" : "Gravity feed"); F.explain(shut ? "With the shutoff pulled, fuel stops at the valve. The engine runs until the lines downstream empty." : `Fuel flows by gravity from ${sel === "BOTH" ? "both tanks" : "the " + sel.toLowerCase() + " tank"} to the selector, then down through the pumps to the engine. Tap any component.`); } }
  chips(F.ctrl, [["BOTH", "Both"], ["LEFT", "Left"], ["RIGHT", "Right"]], "BOTH", (v) => { sel = v; picked = null; upd(); }, { label: "Fuel selector" });
  chips(F.ctrl, [["open", "Shutoff open"], ["closed", "Shutoff closed"]], "open", (v) => { shut = v === "closed"; picked = null; upd(); }, { label: "Shutoff valve" });
  loop(F, (now, dt) => { off -= dt * 0.06; [lL, lR, lT].forEach((p) => p.setAttribute("stroke-dashoffset", off)); });
  upd();
  return { destroy() { F.destroy(); } };
}
