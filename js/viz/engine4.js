// Four-stroke cycle: drag the crank through 720° and watch valves, spark and piston.
import { frame, slider, chips, svg, loop, ACC, FAINT, FAINT2 } from "./base.js?v=b55f063b47";
import { s, reduced } from "../core/util.js?v=b55f063b47";
const STROKES = [
  { k: "Intake", t: "Piston moves down with the intake valve open, drawing the fuel-air mixture into the cylinder." },
  { k: "Compression", t: "Both valves closed. The piston moves up and squeezes the mixture." },
  { k: "Power", t: "The spark plugs fire near the top. The burning gas expands and drives the piston down. The only stroke that makes power." },
  { k: "Exhaust", t: "The exhaust valve opens and the rising piston pushes the burned gas out." },
];
export function mount(host) {
  const F = frame(host, { cls: "tall", corners: { tl: "Four-stroke cycle", tr: "PHAK 7" } });
  const el = svg(F.stage, "0 0 1200 900");
  const g = s("g", { transform: "translate(600 0)" }, el);
  const L = (d, a = {}) => s("path", { d, fill: "none", stroke: FAINT2, "stroke-width": 2, "stroke-linejoin": "round", ...a }, g);
  // cylinder walls and head
  L("M-130,640 L-130,250 L-60,250 M60,250 L130,250 L130,640");
  L("M-60,250 L-60,170 L-200,170 M60,250 L60,170 L200,170", { stroke: FAINT });
  const lab = (x, y, t, a = "middle") => { const e = s("text", { x, y, "text-anchor": a, fill: "rgba(242,241,236,.5)", "font-size": 22, "letter-spacing": "3", "font-family": "IBM Plex Mono, monospace" }, g); e.textContent = t; return e; };
  lab(-230, 160, "INTAKE", "end"); lab(230, 160, "EXHAUST", "start");
  const vin = s("path", { "stroke-width": 6, stroke: FAINT2, fill: "none", "stroke-linecap": "round" }, g), vex = s("path", { "stroke-width": 6, stroke: FAINT2, fill: "none", "stroke-linecap": "round" }, g);
  const plug = s("path", { d: "M0,170 L0,248", stroke: FAINT2, "stroke-width": 6 }, g); const spark = s("circle", { cx: 0, cy: 262, r: 0, fill: ACC, filter: "url(#gw2)" }, g); const sparkCore = s("circle", { cx: 0, cy: 262, r: 0, fill: "#cfe0ff" }, g);
  const gas = s("rect", { x: -128, y: 252, width: 256, height: 10, fill: ACC, opacity: 0.12 }, g);
  const piston = s("rect", { x: -124, width: 248, height: 90, rx: 6, fill: "none", stroke: ACC, "stroke-width": 3, filter: "url(#gw)" }, g);
  const rod = s("line", { stroke: ACC, "stroke-width": 4, filter: "url(#gw)" }, g);
  s("circle", { cx: 0, cy: 760, r: 70, fill: "none", stroke: FAINT, "stroke-width": 2 }, g); const pin = s("circle", { r: 9, fill: ACC }, g); const arm = s("line", { x1: 0, y1: 760, stroke: FAINT2, "stroke-width": 4 }, g);
  const flowIn = s("path", { d: "M-200,190 L-60,190 L-40,300", fill: "none", stroke: ACC, "stroke-width": 3, "stroke-dasharray": "6 22", opacity: 0 }, g);
  const flowEx = s("path", { d: "M40,300 L60,190 L200,190", fill: "none", stroke: ACC, "stroke-width": 3, "stroke-dasharray": "6 22", opacity: 0 }, g);
  let ang = 0, dash = 0, raf = 0;
  function draw(a) { ang = ((a % 720) + 720) % 720; const th = (ang * Math.PI) / 180; const r = 70, len = 300;
    const cx = Math.sin(th) * r, cy = 760 - Math.cos(th) * r; const py = cy - Math.sqrt(len * len - cx * cx); // wrist pin
    const top = py - 70; piston.setAttribute("y", top); rod.setAttribute("x1", 0); rod.setAttribute("y1", py); rod.setAttribute("x2", cx); rod.setAttribute("y2", cy); pin.setAttribute("cx", cx); pin.setAttribute("cy", cy); arm.setAttribute("x2", cx); arm.setAttribute("y2", cy);
    gas.setAttribute("height", Math.max(0, top - 252));
    const k = Math.floor(ang / 180); const S0 = STROKES[k];
    const inOpen = k === 0 ? Math.sin((ang / 180) * Math.PI) : 0, exOpen = k === 3 ? Math.sin(((ang - 540) / 180) * Math.PI) : 0;
    vin.setAttribute("d", `M-60,${170 + inOpen * 34} L-60,${250 + inOpen * 34} M-95,${250 + inOpen * 34} L-25,${250 + inOpen * 34}`); vin.setAttribute("stroke", inOpen > 0.05 ? ACC : FAINT2);
    vex.setAttribute("d", `M60,${170 + exOpen * 34} L60,${250 + exOpen * 34} M25,${250 + exOpen * 34} L95,${250 + exOpen * 34}`); vex.setAttribute("stroke", exOpen > 0.05 ? ACC : FAINT2);
    const sp = ang >= 350 && ang <= 400 ? 1 - Math.abs(ang - 370) / 30 : 0; spark.setAttribute("r", Math.max(0, sp) * 40); sparkCore.setAttribute("r", Math.max(0, sp) * 10);
    gas.setAttribute("opacity", k === 2 ? 0.28 : k === 1 ? 0.18 : k === 3 ? 0.08 : 0.12);
    flowIn.setAttribute("opacity", inOpen > 0.05 ? 0.9 : 0); flowEx.setAttribute("opacity", exOpen > 0.05 ? 0.9 : 0);
    F.caption(`Stroke ${k + 1} of 4 · crank ${Math.round(ang)}°`, S0.k); F.explain(S0.t + (k === 2 ? " Two plugs per cylinder, one fired by each magneto." : ""));
    strokes.set(String(k)); }
  loop(F, (now, dt) => { dash -= dt * 0.07; flowIn.setAttribute("stroke-dashoffset", dash); flowEx.setAttribute("stroke-dashoffset", dash); });
  const strokes = chips(F.ctrl, STROKES.map((x, i) => [String(i), x.k]), "0", (v) => { sl.set(+v * 180 + 90); }, { label: "Stroke" });
  const sl = slider(F.ctrl, { label: "Crankshaft", min: 0, max: 720, step: 1, value: 0, fmt: (v) => `${v}°`, oninput: draw });
  draw(0);
  return { destroy() { F.destroy(); } };
}
