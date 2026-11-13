// C172S airspeed indicator: tap an arc or line to read its meaning (values from POH Sec 2; unmarked speeds from Sec 4).
import { frame, chips, svg, drawOn, ACC, FAINT, FAINT2 } from "./base.js?v=5436de0cbc";
import { s } from "../core/util.js?v=5436de0cbc";
const MIN = 30, MAX = 180, A0 = -150, A1 = 150; // dial range (illustrative layout)
const ang = (v) => A0 + ((v - MIN) / (MAX - MIN)) * (A1 - A0);
const MARKS = {
  white: { r: 300, from: 40, to: 85, name: "White arc · 40–85 KIAS", big: "Flap range", t: "Full-flap operating range. Bottom: VSO, stall speed in landing configuration at max weight. Top: VFE, the highest speed with flaps beyond 10° (110 KIAS is allowed with 10°)." },
  green: { r: 330, from: 48, to: 129, name: "Green arc · 48–129 KIAS", big: "Normal range", t: "Normal operating range. Bottom: VS1, stall speed flaps up at max weight and most forward CG. Top: VNO, maximum structural cruising speed." },
  yellow: { r: 330, from: 129, to: 163, name: "Yellow arc · 129–163 KIAS", big: "Caution range", t: "Smooth air only, and then with caution. Turbulence here can overstress the airframe." },
  red: { r: 330, from: 163, to: 163.8, name: "Red line · 163 KIAS", big: "VNE", t: "Never exceed speed: maximum for all operations." },
};
const UNMARKED = [["62", "VX", "Best angle of climb, sea level"], ["74", "VY", "Best rate of climb, sea level"], ["68", "Best glide", "Maximum glide, engine out"], ["105", "VA", "Maneuvering speed at 2,550 lb (98 at 2,200 lb, 90 at 1,900 lb)"]];
export function mount(host) {
  const F = frame(host, { cls: "square", corners: { tl: "Airspeed indicator · C172S", tr: "POH Sec 2" } });
  const el = svg(F.stage, "-450 -450 900 900"); const g = s("g", {}, el);
  const pt = (v, r) => { const a = (ang(v) * Math.PI) / 180; return [Math.sin(a) * r, -Math.cos(a) * r]; };
  s("circle", { r: 400, fill: "none", stroke: FAINT, "stroke-width": 2 }, g);
  for (let v = 40; v <= 180; v += 10) { const [x1, y1] = pt(v, 360), [x2, y2] = pt(v, v % 20 === 0 ? 384 : 374); s("line", { x1, y1, x2, y2, stroke: FAINT2, "stroke-width": 2 }, g);
    if (v % 20 === 0) { const [tx, ty] = pt(v, 250); const t = s("text", { x: tx, y: ty + 10, "text-anchor": "middle", fill: "rgba(242,241,236,.55)", "font-size": 30, "font-family": "Inter", "font-weight": 600 }, g); t.textContent = v; } }
  const arc = (from, to, r) => { const [x1, y1] = pt(from, r), [x2, y2] = pt(to, r); const large = ang(to) - ang(from) > 180 ? 1 : 0; return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`; };
  const els = {};
  for (const [k, m] of Object.entries(MARKS)) { const d = k === "red" ? (() => { const [x1, y1] = pt(163, 300), [x2, y2] = pt(163, 390); return `M${x1},${y1} L${x2},${y2}`; })() : arc(m.from, m.to, m.r);
    const vis = s("path", { d, fill: "none", stroke: FAINT2, "stroke-width": k === "red" ? 6 : 14, "stroke-linecap": "butt" }, g);
    const hit = s("path", { d, fill: "none", stroke: "transparent", "stroke-width": 50, class: "tap", role: "button", tabindex: 0, "aria-label": m.name }, g);
    hit.addEventListener("click", () => pick(k)); hit.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(k)); els[k] = vis; }
  const lab = s("text", { x: 0, y: 120, "text-anchor": "middle", fill: "rgba(242,241,236,.5)", "font-size": 24, "font-family": "IBM Plex Mono", "letter-spacing": 4 }, g); lab.textContent = "KNOTS";
  const needle = s("line", { x1: 0, y1: 0, x2: 0, y2: -330, stroke: "#F2F1EC", "stroke-width": 5, "stroke-linecap": "round", opacity: 0.8 }, g); s("circle", { r: 14, fill: "#F2F1EC", opacity: 0.8 }, g);
  const tick = s("line", { stroke: ACC, "stroke-width": 6, "stroke-linecap": "round", filter: "url(#gw)", opacity: 0 }, g);
  const setNeedle = (v) => needle.setAttribute("transform", `rotate(${ang(v)})`);
  function pick(k) { for (const [kk, e] of Object.entries(els)) { e.setAttribute("stroke", kk === k ? ACC : FAINT2); e.setAttribute("filter", kk === k ? "url(#gw)" : ""); } tick.setAttribute("opacity", 0);
    const m = MARKS[k]; drawOn(els[k], { dur: 900 }); setNeedle((m.from + m.to) / 2); F.caption(m.name, m.big); F.explain(m.t); chipU.set(null); }
  function unmarked(v) { const u = UNMARKED.find((x) => x[0] === v); for (const e of Object.values(els)) { e.setAttribute("stroke", FAINT2); e.setAttribute("filter", ""); }
    const [x1, y1] = pt(+v, 300), [x2, y2] = pt(+v, 400); tick.setAttribute("x1", x1); tick.setAttribute("y1", y1); tick.setAttribute("x2", x2); tick.setAttribute("y2", y2); tick.setAttribute("opacity", 1); setNeedle(+v);
    F.caption(`${u[1]} · not marked on the dial`, `${v} KIAS`); F.explain(u[2] + "."); }
  const chipU = chips(F.ctrl, UNMARKED.map((u) => [u[0], u[1]]), null, unmarked, { label: "Unmarked speeds" });
  setNeedle(30); F.caption("Tap an arc", "Read the dial"); F.explain("Each color band marks a range the manufacturer certified. Tap one, or pick a speed that is not marked.");
  return { destroy() { F.destroy(); } };
}
