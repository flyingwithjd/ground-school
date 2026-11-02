// Fuselage construction (PHAK FAA-H-8083-25C Ch 3, Fig 3-5 truss, Fig 3-14 monocoque / semimonocoque).
// 3/4 view of a tapered fuselage, nose left. Blue = carries the load, gray = shape / covering only.
// Each type has its own members, its own end view (cross-section) and a one-line load statement.
import { frame, chips, svg, drawOn, ACC, INK, FAINT, FAINT2 } from "./base.js?v=269fcd6a6e";
import { s } from "../core/util.js?v=269fcd6a6e";

const GRAY = "rgba(242,241,236,.34)", GRAY2 = "rgba(242,241,236,.16)", ACCF = "rgba(59,130,246,.42)";
const TYPES = {
  truss: { big: "Truss", load: "The tube frame carries the load",
    text: "<b>What carries the load:</b> the welded tube frame. Long tubes called <b>longerons</b> run nose to tail, tied together by vertical and horizontal struts, with diagonal struts making triangles so the frame resists loads from any direction. The <b>fabric covering</b> only gives the shape; formers and stringers just hold it out. End view: square or rectangular. Older and simpler designs, not streamlined. <span class=\"src\">PHAK 3, Fig 3-5</span>" },
  mono: { big: "Monocoque", load: "The skin alone carries the load",
    text: "<b>What carries the load:</b> the skin. Monocoque means “single shell”: a <b>stressed skin</b> supports almost all the loads, like an aluminum beverage can. <b>Formers</b> and <b>bulkheads</b> only give the shape. There are no lengthwise members, so it cannot tolerate deformation: a small <b>dent</b> lets the shell collapse under load. Tap <b>Show a dent</b>. <span class=\"src\">PHAK 3, Fig 3-14</span>" },
  semi: { big: "Semimonocoque", load: "Skin and substructure share the load",
    text: "<b>What carries the load:</b> both. A substructure of <b>bulkheads</b>, <b>formers</b> and lengthwise <b>stringers</b> is covered by a stressed <b>skin</b>; the substructure takes some of the bending, so a dent is no longer critical. Most modern airplanes use it, including the 172 (bulkhead, stringer and skin). <span class=\"src\">PHAK 3, Fig 3-14 · C172S POH Sec 7</span>" },
};

// ---------- geometry ----------
const VW = 1200, VH = 1000, LEN = 800;
const OX = 185, CY0 = 455, CY1 = 415, KX = 0.42, KY = 0.3;
const st = (t) => ({ x: t * LEN, w: 135 + (40 - 135) * t, h: 150 + (52 - 150) * t, cy: CY0 + (CY1 - CY0) * t });
// 3D (x along fuselage, y up, z away from viewer) -> screen; far side sits up and to the right.
const P = (x, y, z, cy) => [OX + x + z * KX, cy - y - z * KY];
const f = (n) => Math.round(n * 10) / 10;
const pt = (t, th, k = 1) => { const S = st(t); return P(S.x, S.h * k * Math.sin(th), S.w * k * Math.cos(th), S.cy); };
const ring = (t, k = 1, a0 = 0, a1 = Math.PI * 2, n = 48) => { let d = ""; for (let i = 0; i <= n; i++) { const th = a0 + (a1 - a0) * i / n; const [x, y] = pt(t, th, k); d += (i ? "L" : "M") + f(x) + "," + f(y); } return d; };
// silhouette of the tapered ellipse tube: highest / lowest projected point at each station
function hull(k = 1) { const top = [], bot = []; for (let i = 0; i <= 40; i++) { const t = i / 40; let lo = [0, 1e9], hi = [0, -1e9]; for (let j = 0; j < 72; j++) { const p = pt(t, j / 72 * Math.PI * 2, k); if (p[1] < lo[1]) lo = p; if (p[1] > hi[1]) hi = p; } top.push(lo); bot.push(hi); }
  return { top, bot, d: "M" + top.map((p) => f(p[0]) + "," + f(p[1])).join("L") + "L" + bot.reverse().map((p) => f(p[0]) + "," + f(p[1])).join("L") + "Z" }; }
const ln = (a, b) => `M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}`;

export function mount(host) {
  const F = frame(host, { cls: "tall capin fus", corners: { tl: "Construction", tr: "PHAK 3" } });
  const el = svg(F.stage, `0 0 ${VW} ${VH}`);
  const g = s("g", {}, el);
  let type = "truss", dent = false, fs = 30, cancels = [];

  const P_ = (d, a, parent = g) => s("path", Object.assign({ d, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, a), parent);
  const anim = (p, i, light = true) => cancels.push(drawOn(p, { dur: 1100, delay: 120 + i * 260, light }));
  // labels are sized in screen pixels (about 11.5px) whatever the stage width, so they stay legible on a phone
  function label(lines, tx, ty, ax, ay, { anchor = "start", color = INK, sub = GRAY } = {}) {
    const lh = fs * 1.25, gl = s("g", { class: "callout" }, g);
    const tb = s("text", { x: tx, y: ty, "text-anchor": anchor, "font-family": "IBM Plex Mono, ui-monospace, monospace", "font-size": f(fs), "letter-spacing": f(fs * 0.08), fill: color }, gl);
    lines.forEach((t, i) => { const sp = s("tspan", { x: tx, dy: i ? lh : 0, fill: i ? sub : color, "font-weight": i ? 400 : 500 }, tb); sp.textContent = t; });
    if (ax != null) { const ly = ay < ty ? ty - fs * 1.05 : ty + lh * (lines.length - 1) + fs * 0.45; s("line", { x1: tx, y1: ly, x2: ax, y2: ay, stroke: GRAY, "stroke-width": 1.6 }, gl); s("circle", { cx: ax, cy: ay, r: 6, fill: color === INK ? INK : color }, gl); }
    return gl;
  }

  function endView(kind) {
    const cx = 200, cy = 852, gv = s("g", {}, g);
    s("text", { x: cx, y: cy + 92 + fs * 1.15, "text-anchor": "middle", "font-family": "IBM Plex Mono, monospace", "font-size": f(fs), "letter-spacing": f(fs * 0.14), fill: GRAY }, gv).textContent = "END VIEW";
    if (kind === "truss") {
      const a = 74; P_(`M${cx - a},${cy - a}H${cx + a}V${cy + a}H${cx - a}Z`, { stroke: ACC, "stroke-width": 7 }, gv);
      P_(`M${cx - a},${cy + a}L${cx + a},${cy - a}`, { stroke: ACC, "stroke-width": 4 }, gv);
      for (const [x, y] of [[-a, -a], [a, -a], [a, a], [-a, a]]) s("circle", { cx: cx + x, cy: cy + y, r: 13, fill: ACC }, gv);
      P_(`M${cx - a - 22},${cy - a + 20}Q${cx - a - 26},${cy - a - 26} ${cx - a + 20},${cy - a - 22}H${cx + a - 20}Q${cx + a + 26},${cy - a - 26} ${cx + a + 22},${cy - a + 20}V${cy + a - 20}Q${cx + a + 26},${cy + a + 26} ${cx + a - 20},${cy + a + 22}H${cx - a + 20}Q${cx - a - 26},${cy + a + 26} ${cx - a - 22},${cy + a - 20}Z`, { stroke: GRAY, "stroke-width": 2.5, "stroke-dasharray": "10 9" }, gv);
    } else {
      const rx = 74, ry = 90;
      s("ellipse", { cx, cy, rx, ry, fill: kind === "mono" ? "rgba(59,130,246,.12)" : "none", stroke: ACC, "stroke-width": kind === "mono" ? 9 : 5 }, gv);
      if (kind === "mono" && dent) P_(`M${cx - rx - 2},${cy - 30}Q${cx - rx + 30},${cy} ${cx - rx - 2},${cy + 30}`, { stroke: INK, "stroke-width": 7 }, gv);
      if (kind === "semi") for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; s("circle", { cx: f(cx + (rx - 12) * Math.cos(a)), cy: f(cy + (ry - 12) * Math.sin(a)), r: 8.5, fill: ACC }, gv); }
      if (kind === "semi") s("ellipse", { cx, cy, rx: rx - 22, ry: ry - 22, fill: "none", stroke: ACCF, "stroke-width": 3 }, gv);
    }
  }
  function legend(grayLabel) {
    const x = 420, y = 820, gl = s("g", {}, g), gap = fs * 1.9;
    s("line", { x1: x, y1: y, x2: x + 70, y2: y, stroke: ACC, "stroke-width": 7, "stroke-linecap": "round" }, gl);
    s("line", { x1: x, y1: y + gap, x2: x + 70, y2: y + gap, stroke: GRAY, "stroke-width": 3, "stroke-dasharray": "10 9", "stroke-linecap": "round" }, gl);
    const t = (yy, txt, c) => { const e = s("text", { x: x + 92, y: yy + fs * 0.36, "font-family": "IBM Plex Mono, monospace", "font-size": f(fs), "letter-spacing": f(fs * 0.08), fill: c }, gl); e.textContent = txt; };
    t(y, "CARRIES THE LOAD", INK); if (grayLabel) t(y + gap, grayLabel, GRAY); else gl.children[1].remove();
  }

  function drawTruss() {
    const S = [0, 0.18, 0.36, 0.54, 0.72, 0.88, 1];
    const fabric = hull(1.12); P_(fabric.d, { fill: "rgba(242,241,236,.035)", stroke: GRAY, "stroke-width": 2.5, "stroke-dasharray": "12 10" });
    for (const t of [0.27, 0.63]) P_(ring(t, 1.12, Math.PI * 0.05, Math.PI * 0.95), { stroke: GRAY2, "stroke-width": 2 });   // formers that only shape the fabric
    const C = (t, sy, sz) => { const q = st(t); return P(q.x, sy * q.h * 0.92, sz * q.w * 0.92, q.cy); };
    let far = "", near = "", lon = "", dia = "";
    for (const [sy, sz] of [[1, 1], [-1, 1]]) far += ln(C(0, sy, sz), C(1, sy, sz));
    S.forEach((t, i) => { far += ln(C(t, 1, 1), C(t, -1, 1)); near += ln(C(t, 1, -1), C(t, -1, -1)) + ln(C(t, 1, -1), C(t, 1, 1)) + ln(C(t, -1, -1), C(t, -1, 1));
      if (i < S.length - 1) { const u = S[i + 1], up = i % 2 === 0; dia += up ? ln(C(t, -1, -1), C(u, 1, -1)) : ln(C(t, 1, -1), C(u, -1, -1)); far += up ? ln(C(t, -1, 1), C(u, 1, 1)) : ln(C(t, 1, 1), C(u, -1, 1)); dia += up ? ln(C(t, 1, -1), C(u, 1, 1)) : ln(C(t, 1, 1), C(u, 1, -1)); } });
    for (const [sy, sz] of [[1, -1], [-1, -1]]) lon += ln(C(0, sy, sz), C(1, sy, sz));
    P_(far, { stroke: ACCF, "stroke-width": 3 });
    const pn = P_(near, { stroke: ACC, "stroke-width": 4 }), pd = P_(dia, { stroke: ACC, "stroke-width": 4.5 }), pl = P_(lon, { stroke: ACC, "stroke-width": 9 });
    anim(pl, 0); anim(pn, 1, false); anim(pd, 2);
    const a1 = C(0.27, 1, -1), a2 = C(0.45, 0, -1), a3 = C(0.72, 0.4, -1), a4 = pt(0.8, Math.PI * 0.5, 1.12);
    label(["LONGERON", "nose to tail"], 60, 175, a1[0], a1[1]);
    label(["DIAGONAL STRUT", "makes triangles"], 290, 712, a2[0], a2[1]);
    label(["VERTICAL STRUT"], 1160, 712, a3[0], a3[1], { anchor: "end" });
    label(["FABRIC COVERING", "not structural"], 1160, 175, a4[0], a4[1], { anchor: "end", color: GRAY, sub: GRAY });
    endView("truss"); legend("SHAPE / COVERING ONLY");
  }
  function drawMono() {
    const H = hull(1);
    P_(H.d, { fill: dent ? "rgba(59,130,246,.06)" : "rgba(59,130,246,.13)", stroke: "none" });
    P_(ring(0), { fill: "rgba(242,241,236,.06)", stroke: GRAY, "stroke-width": 4 });                    // bulkhead (solid wall)
    for (const t of [0.3, 0.58, 0.82]) P_(ring(t, 0.97), { stroke: GRAY, "stroke-width": 3 });        // formers (rings only)
    P_(ring(1, 1), { stroke: GRAY, "stroke-width": 3 });
    const sk = "M" + H.top.map((p) => f(p[0]) + "," + f(p[1])).join("L") + "M" + H.bot.map((p) => f(p[0]) + "," + f(p[1])).join("L");
    const ps = P_(sk, Object.assign({ stroke: ACC, "stroke-width": 9 }, dent ? { "stroke-dasharray": "26 16", opacity: 0.6 } : {})); if (!dent) anim(ps, 0);
    if (dent) { const [dx, dy] = pt(0.46, Math.PI * 0.08), r = 46;
      s("ellipse", { cx: dx, cy: dy + 6, rx: r, ry: r * 0.55, transform: `rotate(-8 ${dx} ${dy})`, fill: "rgba(0,0,0,.55)", stroke: INK, "stroke-width": 3, "stroke-dasharray": "7 6" }, g);
      P_(`M${dx - r * 0.8},${dy + 2}Q${dx},${dy + 34} ${dx + r * 0.8},${dy + 4}`, { stroke: INK, "stroke-width": 6 });
      P_(`M${dx - 30},${dy - 60}L${dx - 10},${dy - 12}M${dx + 28},${dy - 58}L${dx + 10},${dy - 10}M${dx - 70},${dy + 50}L${dx - 30},${dy + 18}M${dx + 74},${dy + 46}L${dx + 32},${dy + 16}`, { stroke: INK, "stroke-width": 3, opacity: 0.7 });
      label(["DENT", "shell can buckle"], 1160, 175, dx + 20, dy + 20, { anchor: "end" }); }
    const a1 = pt(0.2, Math.PI * 0.5), a2 = pt(0, -Math.PI * 0.75), a3 = pt(0.58, -Math.PI * 0.55, 0.97);
    label(["STRESSED SKIN", "carries the load"], 60, 175, a1[0], a1[1]);
    label(["BULKHEAD"], 60, 712, a2[0], a2[1]);
    label(["FORMER", "shape only"], 1160, 712, a3[0], a3[1], { anchor: "end", color: GRAY });
    if (!dent) label(["no lengthwise", "members"], 1160, 175, null, null, { anchor: "end", color: GRAY });
    endView("mono"); legend("SHAPE ONLY");
  }
  function drawSemi() {
    const H = hull(1);
    P_(H.d, { fill: "rgba(59,130,246,.07)", stroke: "none" });
    let back = "", front = "";
    for (let i = 0; i < 14; i++) { const th = i / 14 * Math.PI * 2 + 0.11, d = ln(pt(0, th, 0.97), pt(1, th, 0.97)); if (Math.cos(th) > 0.05) back += d; else front += d; }
    P_(back, { stroke: ACCF, "stroke-width": 2.5 });
    const rings = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => P_(ring(t, 0.97), { stroke: i === 0 ? ACC : ACCF, "stroke-width": i === 0 ? 5 : 3.5 }));
    const pf = P_(front, { stroke: ACC, "stroke-width": 4 });
    const sk = "M" + H.top.map((p) => f(p[0]) + "," + f(p[1])).join("L") + "M" + H.bot.map((p) => f(p[0]) + "," + f(p[1])).join("L");
    const ps = P_(sk, { stroke: ACC, "stroke-width": 6 });
    anim(ps, 0); anim(pf, 1); rings.forEach((r, i) => i && cancels.push(drawOn(r, { dur: 700, delay: 600 + i * 120, light: false })));
    const a1 = pt(0.14, Math.PI * 0.5), a2 = pt(0.62, Math.PI * 0.62, 0.97), a3 = pt(0.4, -Math.PI * 0.6, 0.97), a4 = pt(0, -Math.PI * 0.8, 0.97);
    label(["SKIN", "shares the load"], 60, 175, a1[0], a1[1]);
    label(["STRINGERS", "run lengthwise"], 1160, 175, a2[0], a2[1], { anchor: "end" });
    label(["FORMER"], 700, 712, a3[0], a3[1], { anchor: "middle" });
    label(["BULKHEAD"], 60, 712, a4[0], a4[1]);
    endView("semi"); legend(null); { const e = s("text", { x: 420, y: f(820 + fs * 1.9 + fs * 0.36), "font-family": "IBM Plex Mono, monospace", "font-size": f(fs), "letter-spacing": f(fs * 0.08), fill: GRAY }, g); e.textContent = "USED ON THE 172"; }
  }

  function draw(animate = true) {
    cancels.forEach((c) => c()); cancels = []; g.innerHTML = "";
    const w = F.stage.clientWidth || VW;
    // stage is letterboxed by "meet": use the limiting scale
    const sc = Math.min(w / VW, (F.stage.clientHeight || VH) / VH); fs = Math.max(19, Math.min(40, 11.5 / sc));
    ({ truss: drawTruss, mono: drawMono, semi: drawSemi })[type]();
    if (!animate) cancels.forEach((c) => c()), cancels = [], g.querySelectorAll("path").forEach((p) => { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; });
    const T = TYPES[type]; F.caption(T.load, T.big); F.explain(`<p>${T.text}</p>`);
    dentChip.el.style.display = type === "mono" ? "" : "none";
  }
  chips(F.ctrl, [["truss", "Truss"], ["mono", "Monocoque"], ["semi", "Semimonocoque"]], type, (v) => { type = v; dent = false; dentChip.set(null); draw(); }, { label: "Construction type" });
  const dentChip = chips(F.ctrl, [["dent", "Show a dent"]], null, (v) => { dent = v === "dent"; draw(false); }, { label: "Dent", toggle: true });
  let lastW = 0; const ro = new ResizeObserver(() => { const w = F.stage.clientWidth; if (Math.abs(w - lastW) > 8) { const first = !lastW; lastW = w; draw(first); } });
  ro.observe(F.stage); F.on(() => { ro.disconnect(); cancels.forEach((c) => c()); });
  return { destroy() { F.destroy(); } };
}
