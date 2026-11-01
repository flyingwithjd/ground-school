// Angle of attack: drag the slider, watch the airflow follow (or leave) the wing and the lift curve respond.
// The airfoil, flow field and lift curve are illustrative, not data for any specific wing.
import { frame, slider, readout, svg, loop, ACC, FAINT, FAINT2 } from "./base.js?v=f687e808d6";
import { s, clamp } from "../core/util.js?v=f687e808d6";
import { T, arrow, setArrow } from "./shapes.js?v=f687e808d6";
const CRIT = 16, CH = 500, LE = -520, PIV = LE + CH * 0.25; // chord, leading edge x, quarter-chord pivot
function airfoil() { // NACA 2412-like outline
  const m = 0.02, p = 0.4, t = 0.12, up = [], lo = [];
  for (let i = 0; i <= 40; i++) { const b = (i / 40) * Math.PI, x = (1 - Math.cos(b)) / 2;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const yc = x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * x - x * x);
    up.push([LE + x * CH, -(yc + yt) * CH]); lo.push([LE + x * CH, -(yc - yt) * CH]); }
  return "M" + up.map((q) => q.join(",")).join(" L") + " L" + lo.reverse().map((q) => q.join(",")).join(" L") + " Z";
}
const CL = (a) => (a <= CRIT ? 0.105 * (a + 2) : 0.105 * (CRIT + 2) * (0.72 - 0.01 * (a - CRIT)));
export function mount(host) {
  const F = frame(host, { corners: { tl: "Angle of attack · illustrative airfoil", tr: "PHAK 4, 5" } });
  const el = svg(F.stage, "-800 -450 1600 900"); const root = s("g", {}, el); const g = s("g", { transform: "translate(0,-80)" }, root);
  const flow = s("g", {}, g), dots = s("g", {}, g);
  const wing = s("g", {}, g); const foil = s("path", { d: airfoil(), fill: "none", stroke: "#F2F1EC", "stroke-width": 2.5, opacity: 0.85 }, wing);
  const chord = s("line", { x1: LE - 60, y1: 0, x2: LE + CH + 60, y2: 0, stroke: FAINT2, "stroke-width": 1.5, "stroke-dasharray": "8 8" }, wing);
  T(wing, LE + CH + 70, 6, "chord line", { size: 15, op: 0.45 });
  // relative wind reference + AOA arc
  arrow(g, -790, 0, -610, 0, { w: 3 }); T(g, -790, -18, "relative wind", { size: 15, op: 0.55 });
  const arc = s("path", { fill: "none", stroke: ACC, "stroke-width": 3, filter: "url(#gw)" }, g);
  const arcT = T(g, 0, 0, "", { size: 18, op: 0.9, fill: ACC });
  const lift = arrow(g, PIV, -40, PIV, -300, { accent: true, w: 5 }); const liftT = T(g, PIV + 20, -300, "lift", { size: 18, op: 0.8, fill: ACC });
  // lift curve inset
  const ix = 180, iy = 400, iw = 520, ih = 140, ax = (a) => ix + ((a + 4) / 26) * iw, ay = (c) => iy - (c / 2.1) * ih;
  const ig = s("g", {}, root); s("path", { d: `M${ix},${iy - ih} L${ix},${iy} L${ix + iw},${iy}`, fill: "none", stroke: FAINT2, "stroke-width": 1.5 }, ig);
  let d = ""; for (let a = -4; a <= 22; a += 0.25) d += (d ? " L" : "M") + ax(a).toFixed(1) + "," + ay(CL(a)).toFixed(1);
  s("path", { d, fill: "none", stroke: FAINT2, "stroke-width": 2 }, ig);
  s("line", { x1: ax(CRIT), y1: iy, x2: ax(CRIT), y2: iy - ih, stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "5 6" }, ig);
  T(ig, ax(CRIT) + 8, iy - ih + 14, "critical AOA", { size: 13, op: 0.5 }); T(ig, ix, iy + 28, "angle of attack →", { size: 13, op: 0.5 }); T(ig, ix - 10, iy - ih - 12, "lift coefficient", { size: 13, op: 0.5 });
  const idot = s("circle", { r: 8, fill: ACC, filter: "url(#gw)" }, ig);
  // streamlines
  const Y0 = [-330, -245, -170, -105, 105, 165, 230]; const lines = Y0.map(() => s("path", { fill: "none", stroke: FAINT, "stroke-width": 1.5 }, flow));
  let A = 4; const XC = LE + CH * 0.4;
  const yAt = (x, y0, t) => { const k = Math.exp(-Math.abs(y0) / 380), stalled = A > CRIT, ae = stalled ? CRIT * 0.6 : A;
    let y = y0 + 3.4 * ae * Math.tanh((x - XC) / 230) * k; if (y0 < 0) y -= 46 * Math.exp(-(((x - XC) / 300) ** 2)) * Math.exp(-Math.abs(y0) / 160);
    if (stalled && y0 < 0 && Math.abs(y0) < 200 && x > LE + 60) { const sev = clamp((A - CRIT) / 4, 0.35, 1) * (1 - Math.abs(y0) / 220); y += sev * (Math.sin(x / 34 + t * 0.006 + y0) * 26 + Math.sin(x / 13 - t * 0.011) * 11) * clamp((x - LE - 60) / 200, 0, 1); }
    return y; };
  const P = []; Y0.forEach((y0, i) => { for (let j = 0; j < 7; j++) { const c = s("circle", { r: 3.2, fill: "#F2F1EC", opacity: 0.75 }, dots); P.push({ c, y0, x: -800 + j * (1600 / 7) + i * 37 }); } });
  const set = readout(F.ctrl, [["a", "angle of attack"], ["l", "lift (relative)"], ["f", "airflow"]]);
  function draw(t = 0) { for (let i = 0; i < Y0.length; i++) { let dd = ""; for (let x = -800; x <= 800; x += 20) dd += (dd ? " L" : "M") + x + "," + yAt(x, Y0[i], t).toFixed(1); lines[i].setAttribute("d", dd); } }
  function update(a) { A = a; wing.setAttribute("transform", `rotate(${-a} ${PIV} 0)`);
    const r = 300, rad = (a * Math.PI) / 180, x0 = PIV - 0; // arc drawn at the trailing side between wind line and chord
    const ex = PIV + r * Math.cos(rad), ey = -r * Math.sin(rad); arc.setAttribute("d", a >= 0 ? `M${PIV + r},0 A${r},${r} 0 0 0 ${ex.toFixed(1)},${ey.toFixed(1)}` : `M${PIV + r},0 A${r},${r} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}`);
    arcT.setAttribute("x", PIV + r + 16); arcT.setAttribute("y", -r * Math.sin(rad / 2) + 6); arcT.textContent = `${a}°`;
    const cl = CL(a), len = 40 + 130 * Math.max(0, cl); setArrow(lift, PIV, -50, PIV, -50 - len); liftT.setAttribute("y", -60 - len);
    idot.setAttribute("cx", ax(a)); idot.setAttribute("cy", ay(cl));
    set("a", `${a}°`); set("l", `${Math.round((cl / CL(CRIT)) * 100)}%`); set("f", a > CRIT ? "separated" : a >= CRIT - 3 ? "near critical" : "attached");
    if (a > CRIT) { F.caption("Past the critical angle", "Stalled"); F.explain("The airflow can no longer follow the curved upper surface. It separates and becomes turbulent, and lift drops sharply. The only cure is to <strong>reduce the angle of attack</strong>: release back pressure."); }
    else if (a >= CRIT - 3) { F.caption("Approaching the critical angle", "Lift near maximum"); F.explain("Lift is close to its peak. In the 172S the stall warning horn sounds 5 to 10 knots before the stall. A little more AOA and the flow separates."); }
    else if (a <= 0) { F.caption("Low angle of attack", "Little lift"); F.explain("This cambered wing still makes a little lift at 0°. At high cruise speed you fly at a low AOA because speed supplies the lift."); }
    else { F.caption("Normal flight", "Lift grows with AOA"); F.explain("More AOA turns the airflow more and lowers the pressure over the top. Lift rises roughly in a straight line until near the critical angle. <span class=\"dim\">Illustrative wing, not 172 data.</span>"); }
    draw(performance.now()); }
  slider(F.ctrl, { label: "Angle of attack", min: -4, max: 22, step: 1, value: 4, fmt: (v) => `${v}°`, oninput: update });
  update(4);
  loop(F, (now, dt) => { if (A > CRIT) draw(now);
    for (const p of P) { const k = Math.exp(-Math.abs(p.y0) / 200), fast = p.y0 < 0 ? 1 + 0.9 * k * Math.exp(-(((p.x - XC) / 320) ** 2)) : 1 - 0.25 * k * Math.exp(-(((p.x - XC) / 320) ** 2));
      p.x += dt * 0.32 * fast; if (p.x > 800) p.x -= 1600; p.c.setAttribute("cx", p.x.toFixed(1)); p.c.setAttribute("cy", yAt(p.x, p.y0, now).toFixed(1)); } });
  return { destroy() { F.destroy(); } };
}
