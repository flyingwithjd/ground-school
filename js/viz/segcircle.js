// Segmented circle at an example airport, seen from above. Set the wind; the wind sock swings and fills, the runway most
// nearly into the wind lights up with its traffic pattern indicator, and an airplane flies that runway's pattern.
// Facts: AIM 4-3-4 (sock, tetrahedron, segmented circle, landing strip + traffic pattern indicators, "mentally enlarge"),
// AIM 4-3-3 (legs), AC 90-66C (6/6/23) 9.11 traffic flow, 11.4 base turn, 11.5 runway most nearly into the wind,
// AC 150/5345-27F 3.2.2 (sock fully extends at 15 kt) and 3.5 (swings to the wind within 5 deg at 3 kt or more).
// Example airport: runway 9-27, left traffic for 9 and right traffic for 27, so both patterns are north of the runway.
// Runway choice has a dead band: within 5 deg of a direct crosswind the shown runway is kept (no flip-flop at 360/180).
import { frame, chips, slider, svg, loop, ACC, FAINT, FAINT2, INK } from "./base.js?v=dc3bb5b371";
import { h, s, reduced } from "../core/util.js?v=dc3bb5b371";
import { T } from "./shapes.js?v=dc3bb5b371";
const D2R = Math.PI / 180, BAND = 5;
// two compositions: wide (16:9 stage) and narrow (phones, taller stage); everything is placed from these numbers
const LAY = {
  wide: { W: 1600, H: 900, rx0: 440, rx1: 1160, ry: 400, rw: 56, dy: 130, bx0: 230, bx1: 1370, cr: 70, cx: 800, cy: 700, R: 96, gap: 16, lsi: 88, tpi: 58, iw: 13, num: 40, lab: 24, leg: 24, vs: 7, sockL: 82, tetS: 1 },
  narrow: { W: 1000, H: 880, rx0: 250, rx1: 750, ry: 375, rw: 52, dy: 135, bx0: 70, bx1: 930, cr: 56, cx: 500, cy: 670, R: 74, gap: 14, lsi: 70, tpi: 46, iw: 11, num: 38, lab: 30, leg: 30, vs: 6, sockL: 64, tetS: 0.85 },
};
const n180 = (a) => ((a % 360) + 540) % 360 - 180;           // -180..180
const pt = (b, r) => [Math.sin(b * D2R) * r, -Math.cos(b * D2R) * r];   // compass bearing -> screen vector
// pure logic, exported for tests: which runway to show, given the one shown now
export function choose(wdir, wkt, cur = "27") {
  const d27 = n180(wdir - 270), d9 = n180(wdir - 90);
  let use = cur, state = "into";
  if (wkt <= 0) state = "calm";
  else if (Math.abs(d27) < 90 - BAND) use = "27";
  else if (Math.abs(d9) < 90 - BAND) use = "9";
  else state = Math.abs(d27) === 90 ? "direct" : "near";
  const d = use === "27" ? d27 : d9; const head = wkt * Math.cos(d * D2R), cross = wkt * Math.sin(d * D2R); // cross > 0: from the right
  return { use, state, head, cross, hd: Math.round(head) || 0, xd: Math.round(Math.abs(cross)), side: cross > 0 ? "right" : "left" };
}
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "segc capin", corners: { tl: "Example airport", tr: "AIM 4-3-4" } });
  let wdir = ((opts.wind ?? 240) % 360) || 360, wkt = opts.speed ?? 12, showTet = false, use = choose(wdir, wkt, "27").use, st = null;
  const mq = window.matchMedia("(max-width: 700px)"); let L = null, el = null, E = {};
  // ---------- scene ----------
  function build() {
    L = mq.matches ? LAY.narrow : LAY.wide; if (el) el.remove(); el = svg(F.stage, `0 0 ${L.W} ${L.H}`); el.classList.add("seg-svg"); E = {};
    const cid = "segclip" + Math.random().toString(36).slice(2, 7); s("clipPath", { id: cid }, el.querySelector("defs")).appendChild(s("rect", { x: 0, y: 0, width: L.W, height: L.H }));
    const root = s("g", {}, el);
    // wind streamlines: short arrows in rows, rotated to the wind; one transform per frame drifts them downwind
    const wg = s("g", { "clip-path": `url(#${cid})` }, root); E.wrot = s("g", {}, wg); E.wmov = s("g", {}, E.wrot);
    const span = Math.hypot(L.W, L.H) / 2 + 240;
    let dd = ""; for (let y = -span; y <= span; y += 140) for (let x = -span - 220; x <= span; x += 220) { const o = (Math.round(y / 140) % 2) * 110 + x;
      dd += `M${o},${y}L${o + 64},${y}M${o + 54},${y - 7}L${o + 64},${y}L${o + 54},${y + 7}`; }
    s("path", { d: dd, fill: "none", stroke: INK, "stroke-opacity": 0.16, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, E.wmov);
    // runway 9-27: edges, threshold bars, numbers read by the pilot landing on each end, dashed centerline
    const { rx0, rx1, ry, rw } = L, g = s("g", {}, root);
    s("rect", { x: rx0, y: ry - rw / 2, width: rx1 - rx0, height: rw, fill: "#121214", stroke: FAINT2, "stroke-width": 2 }, g);
    for (const [x, k] of [[rx0 + 10, 1], [rx1 - 10, -1]]) for (let i = 0; i < 4; i++) { const yy = ry - rw / 2 + 7 + i * (rw - 14) / 3; s("line", { x1: x, y1: yy, x2: x + k * 18, y2: yy, stroke: FAINT2, "stroke-width": 3 }, g); }
    E.n9 = T(g, 0, 0, "9", { anchor: "middle", size: L.num, op: 1, sans: true, weight: 700 }); E.n9.setAttribute("dominant-baseline", "central"); E.n9.setAttribute("transform", `translate(${rx0 + 58} ${ry}) rotate(90)`);
    E.n27 = T(g, 0, 0, "27", { anchor: "middle", size: L.num, op: 1, sans: true, weight: 700 }); E.n27.setAttribute("dominant-baseline", "central"); E.n27.setAttribute("transform", `translate(${rx1 - 58} ${ry}) rotate(-90)`);
    s("line", { x1: rx0 + 96, y1: ry, x2: rx1 - 96, y2: ry, stroke: FAINT2, "stroke-width": 3, "stroke-dasharray": "34 26" }, g);
    // traffic pattern (active runway), leg labels, airplane
    E.pat = s("path", { d: "", fill: "none", stroke: ACC, "stroke-width": 3, "stroke-opacity": 0.75, "stroke-dasharray": "2 10", "stroke-linecap": "round" }, root);
    E.legs = {}; for (const k of ["downwind", "base", "final"]) E.legs[k] = T(root, 0, 0, k, { anchor: "middle", size: L.leg, op: 0.6 });
    // component vectors from midfield: wind (dashed), headwind along the runway, crosswind across it
    const vg = s("g", {}, root); const ar = (dash) => s("line", { x1: 0, y1: 0, x2: 0, y2: 0, stroke: INK, "stroke-width": 4, "stroke-linecap": "round", "marker-end": "url(#ahw)", ...(dash ? { "stroke-dasharray": "10 9", "stroke-opacity": 0.55 } : {}) }, vg);
    E.vW = ar(true); E.vH = ar(false); E.vX = ar(false); E.tH = T(vg, 0, 0, "", { anchor: "middle", size: L.lab, op: 0.85 }); E.tX = T(vg, 0, 0, "", { anchor: "start", size: L.lab, op: 0.85 });
    E.plane = s("g", {}, root); s("path", { d: "M22,0 L12,-3 L4,-3 L2,-22 L-4,-22 L-6,-3 L-16,-3 L-20,-9 L-24,-9 L-22,0 L-24,9 L-20,9 L-16,3 L-6,3 L-4,22 L2,22 L4,3 L12,3 Z", fill: ACC, stroke: "#cfe0ff", "stroke-width": 1.5, filter: "url(#gw)" }, E.plane).setAttribute("transform", `scale(${L.W > 1200 ? 1.25 : 1.35})`);
    // segmented circle: 12 segments, landing strip indicators in line with the runway, L-shaped traffic pattern indicators at the outer ends
    const { cx, cy, R } = L, c = s("g", {}, root);
    for (let i = 0; i < 12; i++) { const P = (a) => [cx + R * Math.sin(a * D2R), cy - R * Math.cos(a * D2R)]; const [x0, y0] = P(i * 30 + 4), [x1, y1] = P(i * 30 + 26);
      s("path", { d: `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`, stroke: FAINT2, "stroke-width": 11, fill: "none" }, c); }
    // AC 150/5340-5D Fig. 1: each landing strip indicator (16-24 ft) sits 4-12 ft outside the circle in line with the runway; the
    // traffic pattern indicator (12-20 ft, shorter) is joined at its outer end at a right angle, making an L. Mentally enlarged
    // (AIM 4-3-4), the long in-line arm is final and the short arm is base. 27's approach end is east and its base arm points
    // north (right traffic); 9's approach end is west and its base arm also points north (left traffic).
    E.ind = {}; for (const [k, sg] of [["27", 1], ["9", -1]]) { const gg = s("g", { "data-ind": k }, c), xi = cx + sg * (R + L.gap), xe = xi + sg * L.lsi, w = L.iw;
      E.ind[k] = [s("line", { x1: xi, y1: cy, x2: xe, y2: cy, stroke: FAINT2, "stroke-width": w, "data-arm": "lsi" }, gg), s("line", { x1: xe - sg * w / 2, y1: cy - w / 2, x2: xe - sg * w / 2, y2: cy - L.tpi, stroke: FAINT2, "stroke-width": w, "data-arm": "tpi" }, gg)];
      const xe2 = xe;
      E.ind[k].t = T(c, xe2 + sg * 22, cy + L.lab * 0.35, k === "27" ? "27 · right" : "9 · left", { anchor: sg > 0 ? "start" : "end", size: L.lab, op: 0.6 }); }
    // wind sock (big end into the wind, fills with speed) and tetrahedron (small end toward the landing direction)
    E.sock = s("g", {}, root); E.limp = s("circle", { r: 9, fill: "none", stroke: INK, "stroke-width": 3, "stroke-opacity": 0.7 }, E.sock);
    E.cone = s("g", {}, E.sock); E.coneP = s("path", { d: "", fill: "rgba(242,241,236,.12)", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, E.cone); E.stripes = s("path", { d: "", stroke: INK, "stroke-width": 2, "stroke-opacity": 0.6 }, E.cone);
    s("circle", { r: 5, fill: INK }, E.sock);
    E.tet = s("g", {}, root); s("path", { d: "M-34,-24 L44,0 L-34,24 Z M-34,0 L44,0", fill: "rgba(59,130,246,.18)", stroke: ACC, "stroke-width": 3, "stroke-linejoin": "round" }, E.tet);
    E.tetT = T(root, 0, 0, "tetrahedron", { anchor: "middle", size: L.lab * 0.8, op: 0.55 });
    // north arrow
    const nx = L.W - 50, ny = L.H - 60; s("line", { x1: nx, y1: ny + 30, x2: nx, y2: ny - 26, stroke: INK, "stroke-opacity": 0.5, "stroke-width": 3, "marker-end": "url(#ahw)" }, root); T(root, nx - 22, ny + 12, "N", { anchor: "end", size: L.lab, op: 0.5 });
    E.path = null; E.legNow = "";
  }
  // closed pattern for the active runway: final -> runway -> upwind -> crosswind -> downwind -> base, rounded corners
  function pattern(u) {
    const { bx0, bx1, ry, dy, cr } = L, P = u === "27" ? [[bx1, ry], [bx0, ry], [bx0, dy], [bx1, dy]] : [[bx0, ry], [bx1, ry], [bx1, dy], [bx0, dy]];
    const seg = []; let d = "";
    for (let i = 0; i < 4; i++) { const p0 = P[i], p1 = P[(i + 1) % 4], p2 = P[(i + 2) % 4]; const u1 = norm(p0, p1), v = norm(p1, p2);
      const a = [p0[0] + u1[0] * cr, p0[1] + u1[1] * cr], b = [p1[0] - u1[0] * cr, p1[1] - u1[1] * cr], e = [p1[0] + v[0] * cr, p1[1] + v[1] * cr], C = [b[0] + v[0] * cr, b[1] + v[1] * cr];
      seg.push({ t: "l", a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]), i });
      const t0 = Math.atan2(b[1] - C[1], b[0] - C[0]), t1 = Math.atan2(e[1] - C[1], e[0] - C[0]); let dt = t1 - t0; if (dt > Math.PI) dt -= 2 * Math.PI; if (dt < -Math.PI) dt += 2 * Math.PI;
      seg.push({ t: "a", C, t0, dt, len: Math.abs(dt) * cr, i });
      d += (i ? "L" : "M") + a.join(",") + "L" + b.join(",") + `A${cr},${cr} 0 0 ${dt > 0 ? 1 : 0} ${e.join(",")}`; }
    return { seg, d: d + "Z", len: seg.reduce((q, x) => q + x.len, 0), ax: u === "27" ? L.rx1 : L.rx0, dx: u === "27" ? L.rx0 : L.rx1, sg: u === "27" ? -1 : 1 };
  }
  function norm(p, q) { const l = Math.hypot(q[0] - p[0], q[1] - p[1]); return [(q[0] - p[0]) / l, (q[1] - p[1]) / l]; }
  function at(pth, dist) { dist = ((dist % pth.len) + pth.len) % pth.len;
    for (const sg of pth.seg) { if (dist <= sg.len) { let x, y, hd;
        if (sg.t === "l") { const f = dist / sg.len; x = sg.a[0] + (sg.b[0] - sg.a[0]) * f; y = sg.a[1] + (sg.b[1] - sg.a[1]) * f; hd = Math.atan2(sg.b[1] - sg.a[1], sg.b[0] - sg.a[0]); }
        else { const t = sg.t0 + sg.dt * (dist / sg.len); x = sg.C[0] + L.cr * Math.cos(t); y = sg.C[1] + L.cr * Math.sin(t); hd = t + Math.sign(sg.dt) * Math.PI / 2; }
        let leg = ["final", "crosswind", "downwind", "base"][sg.i];
        if (sg.i === 0) { const past = (x - pth.ax) * pth.sg; leg = past < 0 ? "final" : (x - pth.dx) * pth.sg <= 0 ? "runway" : "upwind"; }
        return { x, y, hd: hd / D2R, leg }; } dist -= sg.len; }
    return { x: 0, y: 0, hd: 0, leg: "" }; }
  // ---------- controls: fixed rows (readouts, sliders, chips) so nothing reflows as values change ----------
  const rowR = h("div", { class: "seg-ro" }), rowS = h("div", { class: "seg-sl" }), rowC = h("div", { class: "seg-ch" }); F.ctrl.append(rowR, rowS, rowC);
  const RO = {}; for (const k of ["rw", "hw", "xw", "tp"]) { const b = h("b", {}, "–"), sp = h("span", {}, ""); rowR.append(h("div", { "data-k": k }, b, sp)); RO[k] = (v, lab) => { if (b.textContent !== v) b.textContent = v; if (sp.textContent !== lab) sp.textContent = lab; }; }
  const sDir = slider(rowS, { label: "Wind from", min: 10, max: 360, step: 5, value: wdir, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { wdir = v; update(); } });
  const sSpd = slider(rowS, { label: "Wind speed", min: 0, max: 25, value: wkt, fmt: (v) => v + " kt", oninput: (v) => { wkt = v; update(); } });
  sDir.el.dataset.k = "dir"; sSpd.el.dataset.k = "spd";
  rowC.append(h("span", { class: "seg-lab" }, "Indicators"));
  chips(rowC, [["0", "Wind sock"], ["1", "+ Tetrahedron"]], "0", (v) => { showTet = v === "1"; update(); }, { label: "Indicators" });
  // ---------- update (on change only) ----------
  function update() {
    st = choose(wdir, wkt, use); use = st.use; const lab = st.use === "27" ? "right" : "left";
    F.root.dataset.rw = use; F.root.dataset.state = st.state; F.root.dataset.hd = st.hd; F.root.dataset.xd = st.xd;
    // highlight: active runway number + its indicator; everything else stays white
    E.n27.setAttribute("fill", use === "27" ? ACC : INK); E.n9.setAttribute("fill", use === "9" ? ACC : INK);
    for (const k of ["27", "9"]) { const on = k === use; E.ind[k].forEach((l) => { l.setAttribute("stroke", on ? ACC : FAINT2); on ? l.setAttribute("filter", "url(#gw)") : l.removeAttribute("filter"); }); E.ind[k].t.setAttribute("fill", on ? ACC : INK); E.ind[k].t.setAttribute("opacity", on ? 1 : 0.6); }
    if (!E.path || E.path.u !== use) { E.path = pattern(use); E.path.u = use; E.pat.setAttribute("d", E.path.d); placeLegs(); E.legNow = ""; }
    // sock + tetrahedron placement (tetrahedron takes the circle's center when shown)
    const sockAt = showTet ? [L.cx + L.R * 1.73, L.cy + L.R + 5] : [L.cx, L.cy];
    E.sock.setAttribute("transform", `translate(${sockAt[0]} ${sockAt[1]})`); drawSock(0);
    E.tet.style.display = E.tetT.style.display = showTet ? "" : "none";
    E.tet.setAttribute("transform", `translate(${L.cx} ${L.cy}) rotate(${use === "27" ? 180 : 0}) scale(${L.tetS})`); E.tetT.setAttribute("x", L.cx); E.tetT.setAttribute("y", L.cy + L.R + L.lab * 1.6);
    // wind: streamlines and component vectors
    E.wrot.style.display = wkt > 0 ? "" : "none"; E.wrot.setAttribute("transform", `translate(${L.W / 2} ${L.H / 2}) rotate(${wdir + 90})`);
    vectors(); readouts(lab); words(lab); if (!running || reduced()) frameFn(performance.now(), true);
  }
  function placeLegs() { const { bx0, bx1, ry, dy, rx0, rx1 } = L, east = use === "27";
    const bx = east ? bx1 : bx0, ax = east ? rx1 : rx0;
    set(E.legs.downwind, (bx0 + bx1) / 2, dy - L.leg * 0.9); set(E.legs.base, bx + (east ? -1 : 1) * L.leg * 1.0, (dy + ry) / 2); E.legs.base.setAttribute("text-anchor", east ? "end" : "start");
    set(E.legs.final, (bx + ax) / 2 + (east ? 18 : -18), ry + L.rw / 2 + L.leg * 1.4); }
  function set(t, x, y) { t.setAttribute("x", x); t.setAttribute("y", y); }
  function vectors() { const ox = (L.rx0 + L.rx1) / 2, oy = L.ry, [wx, wy] = pt(wdir + 180, wkt * L.vs);
    const line = (a, x2, y2, show) => { a.style.display = show ? "" : "none"; a.setAttribute("x1", ox); a.setAttribute("y1", oy); a.setAttribute("x2", x2); a.setAttribute("y2", y2); };
    line(E.vW, ox + wx, oy + wy, Math.hypot(wx, wy) > 16 && Math.abs(wx) > 8 && Math.abs(wy) > 8); line(E.vH, ox + wx, oy, Math.abs(wx) > 16); line(E.vX, ox, oy + wy, Math.abs(wy) > 16);
    const hl = st.hd < 0 ? `${-st.hd} kt tail` : `${st.hd} kt head`; E.tH.textContent = Math.abs(wx) > 16 ? hl : ""; E.tX.textContent = Math.abs(wy) > 16 ? `${st.xd} kt cross` : "";
    const below = wy < 0; set(E.tH, ox + wx / 2, below ? oy + L.rw / 2 + L.lab * 1.2 : oy - L.rw / 2 - L.lab * 0.6);
    E.tX.setAttribute("text-anchor", wx > 0 ? "end" : "start"); set(E.tX, ox + (wx > 0 ? -14 : 14), wy > 0 ? oy + Math.max(wy, L.rw / 2) + L.lab * 1.1 : oy + Math.min(wy, -L.rw / 2) - L.lab * 0.4); }
  function readouts(lab) {
    RO.rw(use, st.state === "into" ? "runway" : "runway shown");
    RO.hw(Math.abs(st.hd) + " kt", st.hd < 0 ? "tailwind" : "headwind");
    RO.xw(st.xd + " kt", st.xd >= 1 ? `crosswind · ${st.side}` : "crosswind");
    RO.tp(lab === "right" ? "Right" : "Left", "pattern");
  }
  function words(lab) { const dir = String(wdir).padStart(3, "0") + "°", src = `<span class="src">AIM 4-3-4; AC 90-66C 9.11, 11.5; AC 150/5340-5D; AC 150/5345-27F 3.2.2, 3.5</span>`;
    const shown = `Shown: runway ${use}, ${lab} traffic.`, light = wkt > 0 && wkt < 3 ? " Under 3 kt a wind sock is not required to swing to the wind, so don't trust its direction much." : "";
    const tet = showTet ? (wkt >= 3 ? " The tetrahedron's small end points in the direction of landing; it may be set by hand or left free-swinging, and pilots are cautioned against using it for wind direction." : " In calm or very light wind a tetrahedron may not point to the airport's calm-wind runway, so don't rely on it.") : "";
    if (st.state === "calm") { F.caption("Wind calm", "Calm wind");
      F.explain(`No wind, so no runway is favored and the sock hangs limp. Use the runway other traffic is already using, or the airport's designated calm-wind runway if it has one. ${shown}${tet} ${src}`); return; }
    if (st.state !== "into") { F.caption(`Wind ${dir} at ${wkt} kt`, st.state === "direct" ? "Direct crosswind" : "Nearly direct crosswind");
      F.explain(`The wind is ${st.state === "direct" ? "straight across" : "within 5° of straight across"} runway 9-27, so neither runway has a useful headwind: about ${st.xd} kt of crosswind either way. The wind doesn't pick; use the runway other traffic is already using, and make sure the crosswind is within your airplane's demonstrated crosswind velocity and your own limits. ${shown}${light}${tet} ${src}`); return; }
    F.caption(`Wind ${dir} at ${wkt} kt`, `Runway ${use} · ${lab} traffic`);
    F.explain(`The big end of the wind sock points into the wind. Land on the runway most nearly into the wind: runway ${use}, ${st.hd} kt headwind${st.xd ? `, ${st.xd} kt crosswind from the ${st.side}` : ""}. Mentally enlarge the L at runway ${use}'s approach end: its long arm, in line with the runway (the landing strip indicator), is final, and its short arm (the traffic pattern indicator) is base, so this airport flies ${lab} traffic for runway ${use}. All turns are left unless an indicator shows right turns.${light}${tet} ${src}`); }
  function drawSock(fl) { const ext = Math.min(1, wkt / 15);
    E.limp.style.display = wkt > 0 ? "none" : ""; E.cone.style.display = wkt > 0 ? "" : "none"; if (!wkt) return;
    const len = 16 + ext * (L.sockL - 16), w0 = 16, w1 = 6 + 4 * (1 - ext);
    E.coneP.setAttribute("d", `M0,${-w0} L${len},${-w1} L${len},${w1} L0,${w0} Z`);
    let d = ""; for (let i = 1; i < 5; i++) { const x = len * i / 5, w = w0 + (w1 - w0) * i / 5; d += `M${x},${-w}L${x},${w}`; } E.stripes.setAttribute("d", d);
    E.cone.setAttribute("transform", `rotate(${wdir + 90 + fl})`); }
  // ---------- animation: airplane + drifting streamlines + sock flutter, capped at 30 fps, paused offscreen (loop) ----------
  let running = false, lastDraw = 0;
  function frameFn(now, still) {
    if (!E.path) return; const lap = 16000, red = reduced();
    const p = at(E.path, red || still ? E.path.seg[0].len + E.path.seg[1].len + E.path.seg[2].len + E.path.seg[3].len + E.path.seg[4].len * 0.5 : (now % lap) / lap * E.path.len);
    E.plane.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.hd.toFixed(1)})`);
    if (p.leg !== E.legNow) { E.legNow = p.leg; for (const [k, t] of Object.entries(E.legs)) { const on = k === p.leg; t.setAttribute("fill", on ? ACC : INK); t.setAttribute("opacity", on ? 1 : 0.55); } }
    if (!red && wkt > 0) { const off = (now * wkt * 0.012) % 220; E.wmov.setAttribute("transform", `translate(${off.toFixed(1)} 0)`); drawSock(Math.sin(now / 170) * (1 + 3 * (1 - Math.min(1, wkt / 15)))); }
  }
  const run = loop(F, (now) => { if (!reduced()) running = true; if (now - lastDraw < 33) return; lastDraw = now; frameFn(now); });
  build(); update();
  const onMq = () => { build(); E.path = null; update(); }; mq.addEventListener("change", onMq); F.on(() => mq.removeEventListener("change", onMq));
  run.start();
  return { destroy: () => F.destroy() };
}
