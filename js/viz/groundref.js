// Ground reference maneuvers (AFH 6): fly a fixed ground track in wind. Bank, crab and groundspeed are computed from the wind triangle
// for a 90 KTAS airplane; bank uses tan(bank) = GS^2 * curvature / g. Illustrative model, not a procedure.
import { frame, slider, chips, readout, svg, loop, ACC, FAINT, FAINT2 } from "./base.js?v=b01e5791a1";
import { s, reduced } from "../core/util.js?v=b01e5791a1";
import { T, topPlane } from "./shapes.js?v=b01e5791a1";
import { windField } from "./windfield.js?v=b01e5791a1";
const TAS = 90, G = 32.174, KT = 1.68781, SC = 0.17; // SVG units per foot
function course(mode) { const pts = []; const R = 1300; // ft
  if (mode === "point") { for (let i = 0; i < 360; i++) { const a = (i / 360) * Math.PI * 2; pts.push({ x: Math.cos(a) * R, y: -Math.sin(a) * R, tx: -Math.sin(a), ty: -Math.cos(a), k: 1 / R }); } return pts; }
  const A = 1600, B = 500; // half-lengths of the straight legs (ft): rounded rectangle flown counterclockwise
  const seg = []; const leg = (x0, y0, dx, dy, L) => seg.push({ L, f: (u) => ({ x: x0 + dx * u, y: y0 + dy * u, tx: dx, ty: dy, k: 0 }) });
  const arc = (cx, cy, a0) => seg.push({ L: (Math.PI / 2) * R, f: (u) => { const a = a0 + u / R; return { x: cx + Math.cos(a) * R, y: cy - Math.sin(a) * R, tx: -Math.sin(a), ty: -Math.cos(a), k: 1 / R }; } });
  // top leg westbound, left side southbound, bottom eastbound, right side northbound (screen y down): a left-hand circuit
  leg(A, -(B + R), -1, 0, 2 * A); arc(-A, -B, Math.PI / 2); leg(-A - R, -B, 0, 1, 2 * B); arc(-A, B, Math.PI); leg(-A, B + R, 1, 0, 2 * A); arc(A, B, (3 * Math.PI) / 2); leg(A + R, B, 0, -1, 2 * B); arc(A, -B, 0);
  const tot = seg.reduce((a, q) => a + q.L, 0), N = 480; let si = 0, acc = 0;
  for (let i = 0; i < N; i++) { const d = (i / N) * tot; while (d > acc + seg[si].L) { acc += seg[si].L; si++; } pts.push(seg[si].f(d - acc)); } return pts; }
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Ground reference · top view", tr: "AFH 6 · model" } });
  const el = svg(F.stage, "0 0 1600 900"); const CX = 800, CY = 400;
  const wf = windField(F, el, { n: 70, op: 0.35 });
  const g = s("g", {}, el); const trackG = s("g", {}, g);
  const ref = s("g", {}, g); const plane = s("g", {}, g); topPlane(plane, { stroke: ACC, w: 22 }); plane.setAttribute("filter", "url(#gw)");
  const hdgLine = s("line", { stroke: "#F2F1EC", "stroke-width": 2, opacity: 0.6, "stroke-dasharray": "6 6" }, g);
  const label = T(g, 0, 0, "", { size: 16, op: 0.85, fill: ACC });
  T(el, 1540, 60, "N ↑", { anchor: "end", size: 16, op: 0.5 });
  const st = { mode: opts.mode || "point", from: 270, kt: 15, u: 0, fly: true }; let P = [], data = [];
  const set = readout(F.ctrl, [["gs", "groundspeed"], ["crab", "wind correction"], ["bank", "bank needed"], ["leg", "headed"]]);
  function solve() { const to = ((st.from + 180) * Math.PI) / 180, wx = Math.sin(to) * st.kt, wy = -Math.cos(to) * st.kt;
    data = P.map((p) => { const tw = p.tx * wx + p.ty * wy, cross = wx * wx + wy * wy - tw * tw, gs = tw + Math.sqrt(Math.max(0, TAS * TAS - cross));
      const ax = gs * p.tx - wx, ay = gs * p.ty - wy; const hdg = (Math.atan2(ax, -ay) * 180) / Math.PI, trk = (Math.atan2(p.tx, -p.ty) * 180) / Math.PI;
      let crab = hdg - trk; crab = ((crab + 540) % 360) - 180; const v = gs * KT; const bank = (Math.atan((v * v * p.k) / G) * 180) / Math.PI;
      return { gs, crab, bank, hdg, tw }; });
    trackG.innerHTML = ""; const maxB = Math.max(...data.map((d) => d.bank), 1);
    for (let i = 0; i < P.length; i += 2) { const a = P[i], b = P[(i + 2) % P.length], d = data[i];
      s("line", { x1: CX + a.x * SC, y1: CY + a.y * SC, x2: CX + b.x * SC, y2: CY + b.y * SC, stroke: d.bank > 0.5 ? ACC : "#F2F1EC", "stroke-width": d.bank > 0.5 ? 2 + (d.bank / maxB) * 8 : 2, opacity: d.bank > 0.5 ? 0.25 + 0.75 * (d.bank / maxB) : 0.45, "stroke-linecap": "round" }, trackG); }
    const iMax = data.reduce((m, d, i) => (d.bank > data[m].bank ? i : m), 0);
    if (st.kt > 0) { const p = P[iMax]; const nr = Math.hypot(p.x, p.y) || 1; T(trackG, CX + p.x * SC + (p.x / nr) * 40, CY + p.y * SC + (p.y / nr) * 40 + 6, `steepest ${Math.round(data[iMax].bank)}°`, { anchor: p.x < 0 ? "end" : "start", size: 15, op: 0.8 }); } }
  function place() { const n = P.length, i = Math.floor(st.u * n) % n, p = P[i], d = data[i]; const x = CX + p.x * SC, y = CY + p.y * SC;
    const bk = (d.bank * Math.PI) / 180; plane.setAttribute("transform", `translate(${x},${y}) rotate(${d.hdg}) scale(${0.09 * Math.cos(bk) ** 0.5},0.09)`);
    const r = (d.hdg * Math.PI) / 180; hdgLine.setAttribute("x1", x); hdgLine.setAttribute("y1", y); hdgLine.setAttribute("x2", x + Math.sin(r) * 120); hdgLine.setAttribute("y2", y - Math.cos(r) * 120);
    label.setAttribute("x", x + 40); label.setAttribute("y", y - 40); label.textContent = `${Math.round(d.bank)}° bank`;
    const side = d.crab > 0.5 ? "right" : d.crab < -0.5 ? "left" : ""; set("gs", `${Math.round(d.gs)} kt`); set("crab", side ? `${Math.abs(Math.round(d.crab))}° ${side}` : "none"); set("bank", `${Math.round(d.bank)}°`);
    const rel = st.kt ? d.tw / st.kt : 0; set("leg", st.kt === 0 ? "no wind" : rel > 0.7 ? "downwind" : rel < -0.7 ? "upwind" : "crosswind");
    const straight = p.k === 0; F.caption(st.mode === "point" ? "Turns around a point" : "Rectangular course", st.kt === 0 ? "No wind, no correction" : straight ? (rel > 0.7 ? "Downwind leg: fastest" : rel < -0.7 ? "Upwind leg: slowest" : "Crosswind leg: crab") : rel > 0.7 ? "Downwind: steepest bank" : rel < -0.7 ? "Upwind: shallowest bank" : "Crosswind: most crab"); }
  function build() { P = course(st.mode); ref.innerHTML = "";
    if (st.mode === "point") { s("circle", { cx: CX, cy: CY, r: 7, fill: "#F2F1EC", opacity: 0.8 }, ref); T(ref, CX + 14, CY + 28, "reference point", { size: 14, op: 0.5 }); }
    else { s("rect", { x: CX - 1600 * SC, y: CY - 500 * SC, width: 3200 * SC, height: 1000 * SC, fill: "none", stroke: FAINT2, "stroke-width": 1.5, "stroke-dasharray": "4 8" }, ref); T(ref, CX, CY + 6, "field boundary", { anchor: "middle", size: 14, op: 0.45 }); }
    solve(); place(); }
  F.explain(`The track stays fixed over the ground; the wind does not. Wind changes your <b>groundspeed</b>, so the bank needed to hold the same ground radius changes too: steepest when headed downwind (fastest), shallowest upwind. On straight legs, crab into the wind. The thick bright segments are where bank is steepest. <span class="src">AFH 6 · ACS PA.V.B.K2, K3</span> Model: 90 KTAS, about 1,300 ft radius.`);
  chips(F.ctrl, [["point", "Turns around a point"], ["rect", "Rectangular course"]], st.mode, (v) => { st.mode = v; build(); }, { label: "Maneuver" });
  slider(F.ctrl, { label: "Wind from", min: 0, max: 350, step: 10, value: st.from, fmt: (v) => `${String(v).padStart(3, "0")}°`, oninput: (v) => { st.from = v; wf.set(st.from, st.kt); solve(); place(); } });
  slider(F.ctrl, { label: "Wind speed", min: 0, max: 25, step: 1, value: st.kt, fmt: (v) => `${v} kt`, oninput: (v) => { st.kt = v; wf.set(st.from, st.kt); solve(); place(); } });
  const pos = slider(F.ctrl, { label: "Position", min: 0, max: 0.999, step: 0.002, value: 0, fmt: (v) => `${Math.round(v * 100)}%`, oninput: (v) => { st.u = v; L.stop(); if (!reduced()) btn.textContent = "Fly"; place(); } });
  const btn = document.createElement("button"); btn.className = "btn"; btn.type = "button"; btn.textContent = reduced() ? "Step" : "Pause"; F.ctrl.append(btn);
  const L = loop(F, (now, dt) => { st.u = (st.u + dt / 26000) % 1; pos.set(st.u, false); place(); });
  btn.onclick = () => { if (reduced()) { st.u = (st.u + 1 / 16) % 1; pos.set(st.u, false); place(); return; } if (btn.textContent === "Pause") { L.stop(); btn.textContent = "Fly"; } else { L.start(); btn.textContent = "Pause"; } };
  wf.set(st.from, st.kt); build(); L.start();
  return { destroy() { F.destroy(); } };
}
