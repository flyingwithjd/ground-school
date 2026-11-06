// Wind components and wind correction angle. Runway (or course) always points up the screen.
// Headwind = V cos θ, crosswind = V sin θ (θ = wind direction minus runway heading). WCA = asin(XW / TAS).
// Wind is drawn as moving points of light. Sources: PHAK Ch 16 (wind triangle); AFH 9 (crosswind); C172S POH 4 (demonstrated crosswind).
import { frame, chips, slider, svg, readout, loop, ACC, FAINT, FAINT2, INK, D2R } from "./base.js?v=30bce312db";
import { s, reduced } from "../core/util.js?v=30bce312db";
import { T, topPlane } from "./shapes.js?v=30bce312db";
const RX = 470, RY0 = 120, RY1 = 720, VX = 1160, VY = 430, SC = 13;
export function mount(host, opts = {}) {
  const wca = opts.mode === "wca";
  const F = frame(host, { cls: "capin", corners: { tl: wca ? "Wind triangle · plan view" : "Wind components · plan view", tr: wca ? "PHAK 16" : "PHAK 16 · AFH 9" } });
  const el = svg(F.stage, "0 0 1600 900");
  const dots = s("g", {}, el), g = s("g", {}, el);
  // runway or course line
  if (!wca) { s("rect", { x: RX - 40, y: RY0, width: 80, height: RY1 - RY0, fill: "none", stroke: FAINT2, "stroke-width": 2 }, g);
    for (let y = RY0 + 110; y < RY1 - 110; y += 60) s("line", { x1: RX, y1: y, x2: RX, y2: y + 30, stroke: FAINT2, "stroke-width": 3 }, g); }
  else { s("line", { x1: RX, y1: RY0 - 20, x2: RX, y2: RY1, stroke: FAINT2, "stroke-width": 2, "stroke-dasharray": "10 10" }, g); }
  const num = T(g, RX, RY1 - 30, "", { anchor: "middle", size: 30, op: 0.85, sans: true, weight: 800 });
  const pl = s("g", {}, g); topPlane(pl, { stroke: INK, w: 26 });
  // vector diagram
  const vg = s("g", {}, el);
  s("circle", { cx: VX, cy: VY, r: 4, fill: INK }, vg);
  s("line", { x1: VX, y1: VY - 260, x2: VX, y2: VY + 260, stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "4 8" }, vg);
  s("line", { x1: VX - 260, y1: VY, x2: VX + 260, y2: VY, stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "4 8" }, vg);
  const wv = s("line", { stroke: ACC, "stroke-width": 5, "marker-end": "url(#ah)", filter: "url(#gw)" }, vg);
  const hv = s("line", { stroke: INK, "stroke-width": 3, "marker-end": "url(#ahw)" }, vg);
  const xv = s("line", { stroke: INK, "stroke-width": 3, "marker-end": "url(#ahw)" }, vg);
  const hl = T(vg, 0, 0, "", { size: 15, op: 0.8 }), xl = T(vg, 0, 0, "", { size: 15, op: 0.8 }), wl = T(vg, 0, 0, "", { size: 15, op: 1, fill: ACC });
  T(vg, VX, VY - 280, wca ? "course" : "runway heading", { anchor: "middle", size: 13, op: 0.5 });
  const ro = readout(F.ctrl, wca ? [["wca", "wind correction"], ["hdg", "heading"], ["gs", "groundspeed"], ["xw", "crosswind"]] : [["ang", "angle off"], ["hw", "head/tailwind"], ["xw", "crosswind"], ["lim", "C172S demo, flaps full"]]);
  let rh = opts.rwy ?? 270, wd = opts.wind ?? 310, wk = opts.kt ?? 15, tas = 110;
  const N = window.innerWidth < 700 ? 36 : 70, P = Array.from({ length: N }, () => ({ x: Math.random() * 1600, y: Math.random() * 900 }));
  const dEl = P.map(() => s("circle", { r: 2.6, fill: ACC, opacity: 0.7 }, dots));
  const L = (a, x1, y1, x2, y2) => { a.setAttribute("x1", x1); a.setAttribute("y1", y1); a.setAttribute("x2", x2); a.setAttribute("y2", y2); };
  const at = (t, x, y) => { t.setAttribute("x", x); t.setAttribute("y", y); };
  function comps() { const th = (((wd - rh) % 360) + 540) % 360 - 180; const hw = wk * Math.cos(th * D2R), xw = wk * Math.sin(th * D2R); return { th, hw, xw }; }
  const run = loop(F, (now, dt) => { const { th } = comps(); const vx = -Math.sin(th * D2R), vy = Math.cos(th * D2R), sp = (wk / 10) * dt * 0.12;
    P.forEach((p, i) => { p.x += vx * sp * 10; p.y += vy * sp * 10; if (p.x < 0) p.x += 1600; if (p.x > 1600) p.x -= 1600; if (p.y < 0) p.y += 900; if (p.y > 900) p.y -= 900;
      dEl[i].setAttribute("cx", p.x); dEl[i].setAttribute("cy", p.y); }); });
  function update() { const { th, hw, xw } = comps();
    // the wind vector points where the air goes (from θ to θ+180)
    const ux = Math.sin(th * D2R), uy = -Math.cos(th * D2R);
    L(wv, VX + ux * wk * SC, VY + uy * wk * SC, VX, VY); at(wl, VX + ux * (wk * SC + 24), VY + uy * (wk * SC + 24) + 5); wl.setAttribute("text-anchor", ux >= 0 ? "start" : "end"); wl.textContent = `wind ${String(wd).padStart(3, "0")}° / ${wk} kt`;
    L(hv, VX, VY - hw * SC, VX, VY); at(hl, VX - 14, VY - hw * SC / 2); hl.setAttribute("text-anchor", "end"); hl.textContent = hw >= 0 ? `headwind ${Math.round(hw)}` : `tailwind ${Math.round(-hw)}`;
    L(xv, VX + xw * SC, VY - hw * SC, VX, VY - hw * SC); at(xl, VX + xw * SC / 2, VY - hw * SC + (hw >= 0 ? -14 : 30)); xl.setAttribute("text-anchor", "middle"); xl.textContent = `crosswind ${Math.abs(Math.round(xw))}`;
    const r = Math.round(rh / 10) || 36; num.textContent = wca ? `course ${String(rh).padStart(3, "0")}°` : String(r).padStart(2, "0");
    if (wca) { const ratio = Math.max(-1, Math.min(1, xw / tas)), w = Math.asin(ratio) / D2R, gs = tas * Math.cos(w * D2R) - hw;
      pl.setAttribute("transform", `translate(${RX} 420) rotate(${w}) scale(.12)`);
      ro("wca", `${Math.abs(w).toFixed(0)}° ${w > 0.5 ? "right" : w < -0.5 ? "left" : ""}`); ro("hdg", String(Math.round(((rh + w) % 360 + 360) % 360)).padStart(3, "0") + "°"); ro("gs", Math.round(gs) + " kt"); ro("xw", Math.abs(Math.round(xw)) + " kt");
      F.caption(`Crab ${Math.abs(w).toFixed(0)}° into the wind`, `Heading ${String(Math.round(((rh + w) % 360 + 360) % 360)).padStart(3, "0")}°, GS ${Math.round(gs)} kt`);
      F.explain(`To hold the course, point the nose into the wind by the wind correction angle: WCA = arcsin(crosswind ÷ TAS). A ${Math.abs(Math.round(xw))} kt crosswind at ${tas} kt TAS needs about ${Math.abs(w).toFixed(0)}°. Headwind lowers groundspeed and tailwind raises it. Your E6B or flight computer solves the same triangle. <span class="src">PHAK Ch 16</span>`); }
    else { pl.setAttribute("transform", `translate(${RX} ${RY1 - 170}) scale(.075)`);
      ro("ang", Math.abs(Math.round(th)) + "°"); ro("hw", hw >= 0 ? Math.round(hw) + " kt head" : Math.round(-hw) + " kt tail"); ro("xw", Math.abs(Math.round(xw)) + " kt " + (xw > 0.5 ? "from right" : xw < -0.5 ? "from left" : ""));
      ro("lim", Math.abs(xw) > 15 ? "above 15 kt" : "15 kt");
      F.caption(`Runway ${String(r).padStart(2, "0")} · wind ${String(wd).padStart(3, "0")}/${wk}`, `${Math.abs(Math.round(xw))} kt crosswind`);
      F.explain(`Headwind = wind × cos(angle); crosswind = wind × sin(angle). At 30° off the runway the crosswind is half the wind; at 45° about 0.7; at 60° about 0.9. The C172S POH lists a maximum demonstrated crosswind of 15 kt for landing with full flaps (20 kt with flaps 10° or for takeoff). It is a demonstrated value, not a limitation. ${hw < 0 ? "<strong>This is a tailwind.</strong> Consider the other runway." : ""} <span class="src">PHAK Ch 16; C172S POH 1, 4</span>`); }
  }
  slider(F.ctrl, { label: wca ? "Course" : "Runway heading", min: 10, max: 360, step: 10, value: rh, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { rh = v; update(); } });
  slider(F.ctrl, { label: "Wind from", min: 0, max: 355, step: 5, value: wd, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { wd = v; update(); } });
  slider(F.ctrl, { label: "Wind speed", min: 0, max: 30, value: wk, fmt: (v) => v + " kt", oninput: (v) => { wk = v; update(); } });
  if (wca) slider(F.ctrl, { label: "True airspeed", min: 60, max: 140, step: 5, value: tas, fmt: (v) => v + " kt", oninput: (v) => { tas = v; update(); } });
  update(); if (reduced()) P.forEach((p, i) => { dEl[i].setAttribute("cx", p.x); dEl[i].setAttribute("cy", p.y); }); run.start();
  return { destroy: () => F.destroy() };
}
