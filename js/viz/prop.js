// The propeller as a rotating wing, on a 3D two-blade propeller (planeStage) that turns slowly while on screen, with the
// three blade stations lit on one blade; under it, a section inset for each station and the gauges strip. Three blade stations (near the hub, mid-blade, near the tip) show the blade angle, the
// relative wind made by airspeed plus rotation, and the angle of attack between them. Fixed pitch: airspeed and throttle
// set the RPM. Constant speed: the governor changes the blade angle to hold the RPM set with the prop control, and the
// throttle sets manifold pressure. A "No twist" toggle shows why blades are twisted.
// Facts, PHAK 7 (Propeller): a propeller is a rotating airfoil; blade angle is greatest at the hub and smallest at the
// tip because the tip travels faster; without twist the inner blade would have a negative angle of attack while the tip
// stalled. Fixed pitch: efficient at one airspeed/RPM combination, the tachometer shows power, RPM rises with airspeed
// at a fixed throttle. Constant speed: once an RPM is set, the governor raises blade angle when airspeed rises (or load
// falls) and lowers it when airspeed falls (or load rises); manifold pressure shows power; at the pitch stops it acts
// like a fixed-pitch propeller. C172S POH 2: static full-throttle RPM 2,300-2,400, red line 2,700.
// RPM and manifold pressure values, blade pitch and pitch stops are illustrative, not published numbers.
import { frame, chips, slider, row } from "./base.js?v=ff9d939563";
import { planeStage } from "./planestage.js?v=ff9d939563";
import { airfoil, loftGeo } from "./section-models.js?v=ff9d939563";
import { buildPlane } from "./c172-model.js?v=ff9d939563";
import { T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=ff9d939563";
import { dial, anim, toward, COL } from "./dial.js?v=ff9d939563";
import { s, h, reduced } from "../core/util.js?v=ff9d939563";
import * as THREE from "three";
const RAD = 0.96, ST = [0.3, 0.6, 0.9], KT = 0.5144, D = Math.PI / 180, PITCH = 1.71, LOW = 10, HIGH = 38;
export const fixedRpm = (thr, v) => 600 + thr * (1750 + 2.2 * v) + v * 0.8; // thr 0-1, v knots
export const phi = (v, rpm, r) => Math.atan2(v * KT, (Math.max(rpm, 1) / 60) * 2 * Math.PI * r) / D;
export const betaFixed = (r, twist = true) => (twist ? Math.atan(PITCH / (2 * Math.PI * r)) : Math.atan(PITCH / (2 * Math.PI * 0.75 * RAD))) / D;
// ---------- 3D propeller on the nose of the C172 model (feet; x forward, y up, z right). Only the cowling and engine are
// kept from the airplane; the propeller is the model's own (see propModel). ----------
const RF = 38 / 12, F0 = 0.17, NR = 30, PX = 7.36, PY = 4.12;
const chordAt = (f) => 1.15 * (0.27 + 0.26 * Math.sin(Math.PI * Math.min(1, (f - F0) / (1 - F0) * 0.78 + 0.12)) - 0.12 * Math.max(0, (f - 0.9) / 0.1) ** 2);   // chord drawn a little wide for clarity
const ringAt = (f, be, grow = 1) => { const c = chordAt(f) * grow, [U, Lo] = airfoil(16, Math.max(0.085, 0.22 - 0.14 * f) * (grow > 1 ? 1.25 : 1), 0.03), pts = [...U, ...Lo.slice(1, -1).reverse()], b = be * D, cd = [-Math.sin(b), -Math.cos(b)], nn = [Math.cos(b), -Math.sin(b)];
  return pts.map(([u, y]) => { const a = (u - 0.3) * c, t = y * c; return [a * cd[0] + t * nn[0], f * RF, a * cd[1] + t * nn[1]]; }); };
// motion blur: a soft wedge trailing each blade, drawn once into a texture that turns with the hub
function blurTex(THREE) { const N = 256, cv = document.createElement("canvas"); cv.width = cv.height = N; const cx = cv.getContext("2d"), im = cx.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * 2 - 1, y = 1 - (j + 0.5) / N * 2, r = Math.hypot(x, y); if (r > 1 || r < F0) continue;
    const th = Math.atan2(x, y); let a = 0.05; for (const b0 of [0, Math.PI]) { let dl = ((b0 - th) % (2 * Math.PI) + 4 * Math.PI) % (2 * Math.PI); a += 0.32 * Math.exp(-dl / 0.55) * (dl > 0.04 ? 1 : 0); }
    const edge = Math.min(1, (1 - r) / 0.05) * Math.min(1, (r - F0) / 0.08); const k = (j * N + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = 225; im.data[k + 3] = Math.round(255 * Math.min(0.6, a) * edge * (0.55 + 0.45 * r)); }
  cx.putImageData(im, 0, 0); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx; }
// the airplane's own propeller (c172-model.js) in the standard ink look: its blades turn via pose({ prop }) and are lit in
// the accent; the three station bands are thin white overlays on one blade; the governor's pitch change turns each blade
// about its own axis.
function propModel(THREE) { const P = buildPlane(THREE), blades = [], bands = [], band = new THREE.MeshBasicMaterial({ color: 0xf2f1ec });
  P.parts.propeller.subs.forEach((sb) => { let bl = false; sb.obj.traverse((o) => { if (o.isMesh && o.userData.tag === "blade") bl = true; }); if (bl) blades.push({ pg: sb.obj, vars: { tw: new THREE.Group(), fl: new THREE.Group() } }); });
  const hub = blades[0].pg.parent;
  // station r (ft) on the model's blade: chord lerp(0.42, 0.26), blade angle atan(5 / 2 pi r), 0.15 ft ahead of the hub plane
  ST.forEach((f, i) => { const r = 0.45 + f * 2.72, c = (0.42 - 0.16 * f) * 1.25, ph = Math.atan(5.0 / (2 * Math.PI * r));
    const m = new THREE.Mesh(new THREE.BoxGeometry(c, 0.07, 0.09), band); m.position.set(0.15, r, 0); m.rotation.y = Math.atan2(-Math.cos(ph), Math.sin(ph)); m.userData.st = i; blades[0].pg.add(m); bands.push(m); });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(RF, 72), new THREE.MeshBasicMaterial({ map: blurTex(THREE), transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
  disc.rotation.y = Math.PI / 2; disc.position.x = 0.17; hub.add(disc);
  return Object.assign(P, { hub, blades, bands, disc }); }
export function mount(host) {
  let mode = "fixed", twist = true, v = 0, thr = 1, set = 2400, b75 = betaFixed(0.75 * RAD), rpmCS = 2400;
  const F = frame(host, { cls: "capin sec3d prop3d", corners: { tl: "Propeller", tr: "PHAK 7 · POH 2" } });
  F.root.dataset.live = "1";   // the prop turns slowly while on screen; zero frames offscreen
  const S = planeStage(F.stage, { model: propModel, cg: [PX, PY, 0], orbit: false, maxFps: 30, fov: 24, view: { tg: [PX - 1, PY, 0], az: -42, el: 12, d: 20, fov: 24 } });
  const M3 = S.P; S.highlight(["propeller"]);
  // camera: three-quarter front from the left so the twist from hub to tip reads; framed to the propeller disk and the cowling
  const VZ = { az: -54, el: 14, fov: 24 }, fitPts = []; { for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI; fitPts.push([PX, PY + Math.cos(a) * RF, Math.sin(a) * RF]); }
    M3.meshes.forEach((m) => { if (m.userData.part !== "cowling" && !["wheel0", "pant0", "leg0"].includes(m.userData.tag)) return; m.updateWorldMatrix(true, false); const pa = m.geometry.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < pa.count; i += 3) { v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); if (v.x > 2.2) fitPts.push(v.toArray()); } }); }
  function fit(aspect) { const cam = new THREE.PerspectiveCamera(VZ.fov, aspect, 0.1, 500), tg = new THREE.Vector3(PX - 1.2, PY, 0); let d = 20;
    for (let it = 0; it < 6; it++) { const az = VZ.az * D, el = VZ.el * D; cam.position.set(tg.x + d * Math.cos(el) * Math.cos(az), tg.y + d * Math.sin(el), tg.z + d * Math.cos(el) * Math.sin(az)); cam.lookAt(tg); cam.updateMatrixWorld();
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9; const v3 = new THREE.Vector3(); fitPts.forEach((q) => { v3.set(...q).project(cam); x0 = Math.min(x0, v3.x); x1 = Math.max(x1, v3.x); y0 = Math.min(y0, v3.y); y1 = Math.max(y1, v3.y); });
      const k = Math.max((x1 - x0) / 2 / 0.92, (y1 - y0) / 2 / 0.9); // ~4% margin each side
      // re-center: move the target by the screen offset (in world units at the target's depth)
      const half = d * Math.tan((VZ.fov / 2) * D), right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      tg.addScaledVector(right, ((x0 + x1) / 2) * half * aspect).addScaledVector(up, ((y0 + y1) / 2) * half); d *= k; }
    return { tg: tg.toArray(), az: VZ.az, el: VZ.el, d, fov: VZ.fov }; }
  const band = (dur = 1) => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 4 : 0);
    const Hh = Math.max(1, sr.height - (+F.stage.dataset.band || 0)); S.setView(fit(sr.width / Hh), typeof dur === "number" ? dur : 1); };
  // camera glides to the angle that shows the current choice best: down the blade from the tip for twist, front three-quarter for pitch change
  const glide = (az, el) => { VZ.az = az; VZ.el = el; band(1400); };
  const bro = new ResizeObserver(() => band()); bro.observe(F.stage); F.on(() => bro.disconnect());
  // station numbers ride on the blade: projected each frame next to the lit band
  const lab = s("svg", { class: "full lab3d", role: "img" }, F.stage); let lg = s("g", {}, lab);
  const wp = new THREE.Vector3();
  function labels() { const r = F.stage.getBoundingClientRect(); lab.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`); lg.remove(); lg = s("g", {}, lab);
    M3.bands.forEach((m, i) => { m.updateWorldMatrix(true, false); m.geometry.boundingSphere || m.geometry.computeBoundingSphere(); wp.copy(m.geometry.boundingSphere.center).applyMatrix4(m.matrixWorld); const q = S.project([wp.x, wp.y, wp.z], false), c0 = S.project([PX, PY, 0], false);
      const dx = q.x - c0.x, dy = q.y - c0.y, n = Math.hypot(dx, dy) || 1, ox = (-dy / n) * 15, oy = (dx / n) * 15;
      const tx = T(lg, q.x + ox, q.y + oy + 4, String(i + 1), { size: 12, anchor: "middle", fill: "#ffffff", weight: 700 }); tx.setAttribute("stroke", "#000"); tx.setAttribute("stroke-width", "3"); tx.setAttribute("paint-order", "stroke"); }); }
  // section insets + gauges: their own SVG strip under the stage, drawn in screen pixels
  const strip = h("div", { class: "vstrip" }); F.stage.after(strip);
  const svgEl = s("svg", { class: "full", role: "img" }, strip); s("defs", {}, svgEl).innerHTML = `<marker id="pkahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${GRAY}"/></marker>`;
  let gEl = s("g", {}, svgEl);
  const redraw = () => { const W = strip.clientWidth || 600; gEl.remove(); gEl = s("g", {}, svgEl); const H = draw(gEl, W); svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`); svgEl.setAttribute("height", H); strip.style.height = H + "px"; apply3d(); };
  const sro = new ResizeObserver(() => redraw()); sro.observe(strip); F.on(() => sro.disconnect());
  const S0 = { F, redraw };
  const r0 = row(F.ctrl, "Prop"); chips(r0, [["fixed", "Fixed pitch"], ["cs", "Constant speed"]], mode, (k) => { mode = k || "fixed"; glide(mode === "cs" ? -28 : -54, mode === "cs" ? 18 : 14); r4.classList.toggle("off", mode !== "cs"); rs.input.disabled = mode !== "cs"; b75 = targetB(); rpmCS = set; upd(); }, { label: "Prop" });
  const r1 = row(F.ctrl, "Blade"); chips(r1, [["tw", "Twisted"], ["flat", "No twist"]], "tw", (k) => { twist = k !== "flat"; glide(twist ? -54 : -40, twist ? 14 : 26); upd(); }, { label: "Blade" });
  const r2 = row(F.ctrl, "Fly"); const sv = slider(r2, { label: "Airspeed", min: 0, max: 150, value: v, fmt: (x) => x + " KIAS", oninput: (x) => { v = x; pre.set(null); upd(); } });
  const st = slider(r2, { label: "Throttle", min: 0, max: 100, value: thr * 100, fmt: (x) => (x >= 100 ? "Full" : x <= 0 ? "Idle" : x + "%"), oninput: (x) => { thr = x / 100; pre.set(null); upd(); } });
  const r3 = row(F.ctrl, "Try"); const pre = chips(r3, [["static", "Full-throttle static"], ["climb", "Climb"], ["cruise", "Cruise"], ["dive", "Dive"]], "static", (k) => {
    if (!k) return; [v, thr] = { static: [0, 1], climb: [74, 1], cruise: [110, 0.85], dive: [145, 1] }[k]; sv.set(v, false); st.set(Math.round(thr * 100), false); upd(); }, { label: "Try", toggle: true });
  const r4 = row(F.ctrl, "Prop control"); const rs = slider(r4, { label: "RPM set", min: 2100, max: 2700, step: 50, value: set, fmt: (x) => x.toLocaleString("en-US") + " RPM", oninput: (x) => { set = x; upd(); } }); r4.classList.add("off"); rs.input.disabled = true;
  // constant speed: the blade angle (at 75% radius) the governor wants so the blade carries a load that matches the power
  function targetB() { return Math.max(LOW, Math.min(HIGH, phi(v, set, 0.75 * RAD) + 3 + 9 * thr)); }
  function targetB() { return Math.max(LOW, Math.min(HIGH, phi(v, set, 0.75 * RAD) + 3 + 9 * thr)); }
  function rpmNow() { if (mode === "fixed") return [fixedRpm(thr, v), null];
    const free = phi(v, set, 0.75 * RAD) + 3 + 9 * thr;
    if (free < LOW) return [Math.min(set, fixedRpm(thr, v) * 1.1), "low"]; if (free > HIGH) return [Math.max(set, fixedRpm(thr, v) * 0.9), "high"];
    return [set + (targetB() - b75) * 60, null]; }
  const A = anim(F, (dt) => { if (mode !== "cs") return false; let m; [b75, m] = toward(b75, targetB(), 1.6, dt, 0.02); redraw(); return m; });
  function upd() { redraw(); A.kick(); }
  // 3D: twist variant, and on a constant-speed prop the governor's blade-angle change turns both blades about their own axes
  function apply3d() { const dB = mode === "cs" ? b75 - betaFixed(0.75 * RAD, twist) : 0;
    M3.blades.forEach((bl) => { bl.vars.tw.visible = twist; bl.vars.fl.visible = !twist; bl.pg.rotation.y = dB * D; }); S.kick(); }
  const spin = reduced() ? 0 : 0.2 * 2 * Math.PI;   // 0.2 rev/s: slow enough to follow the lit stations; the blur disc stands in for the real speed
  M3.disc.visible = spin > 0;
  let t0 = null; S.setFlow(true, (now) => { t0 ??= now; M3.pose({ prop: ((now - t0) / 1000) * spin }); labels(); });
  const FO = (() => { const [U, Lo] = airfoil(30, 0.12, 0.04); return [...U, ...Lo.slice(1, -1).reverse()]; })();
  function draw(g, W) {
    const wide = W >= 600, [rpm, stop] = rpmNow(), cs = mode === "cs";
    const beta = (r) => (cs ? b75 + (betaFixed(r, twist) - betaFixed(0.75 * RAD, twist)) : betaFixed(r, twist));
    // wide: the three insets and a gauge column share one row; phone: bigger insets, then a compact gauge row
    const pad = 14, n = 3, gcw = wide ? Math.max(150, W * 0.25) : 0, sw = (W - pad * 2 - gcw) / n, top = 14;
    // a section at each station: the airfoil at its blade angle, the plane of rotation (dashed), the relative wind (gray
    // arrow: airspeed + rotation) and the angle of attack between chord and wind (blue wedge). The blade turns to the left; the airplane flies up the page.
    const sH = wide ? (cs ? 166 : Math.min(sw * 0.86, 140)) : sw * 1.12, c = wide ? Math.min(sw * 0.56, 112) : sw * 0.64;
    const stall = [];
    ST.forEach((f, i) => { const r = f * RAD, cx = pad + sw * i + sw / 2, cy = top + sH * 0.6, ph = phi(v, rpm, r), be = beta(r), aoa = be - ph, bad = aoa > 15 || aoa < 0; stall.push(aoa);
      const col = bad ? COL.red : ACC, cb = Math.cos(be * D), sb = Math.sin(be * D), le = [cx - cb * c * 0.4, cy - sb * c * 0.4];
      if (i) L(g, pad + sw * i, top + 4, pad + sw * i, top + sH + 40, { stroke: "rgba(242,241,236,.07)", w: 1 });
      L(g, cx - sw * 0.46, cy, cx + sw * 0.46, cy, { stroke: DIM, w: 1, dash: "3 5" });
      // angle-of-attack wedge between the relative wind and the chord line, at the leading edge
      const wl = Math.min(sw * 0.4, c * 0.9), ar = Math.min(wl * 0.7, (le[1] - top + 4) * 0.9), a0 = Math.PI + ph * D, a1 = Math.PI + be * D, p0 = [le[0] + Math.cos(a0) * ar, le[1] + Math.sin(a0) * ar], p1 = [le[0] + Math.cos(a1) * ar, le[1] + Math.sin(a1) * ar];
      if (Math.abs(aoa) > 0.5) { const sweep = aoa > 0 ? 1 : 0; P(g, `M${le[0].toFixed(1)},${le[1].toFixed(1)} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${ar.toFixed(1)},${ar.toFixed(1)} 0 0 ${sweep} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z`, { fill: bad ? "rgba(217,73,62,.22)" : "rgba(59,130,246,.24)", stroke: "none" });
        P(g, `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${ar.toFixed(1)},${ar.toFixed(1)} 0 0 ${sweep} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`, { stroke: col, w: 2.6 }); }
      const roof = (k, sn) => Math.min(k, (le[1] - top + 8) / Math.max(0.05, sn));   // keep the lines inside the strip at steep angles
      L(g, le[0], le[1], le[0] - cb * roof(wl, sb), le[1] - sb * roof(wl, sb), { stroke: "rgba(242,241,236,.5)", w: 1.1, dash: "4 3" });
      const pts = FO.map(([x, y]) => [le[0] + cb * x * c + sb * y * c, le[1] + sb * x * c - cb * y * c]);
      P(g, "M" + pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L") + "Z", { fill: "#141417", stroke: bad ? COL.red : INK, w: 1.8 });
      const wc = Math.cos(ph * D), ws = Math.sin(ph * D); L(g, le[0] - wc * roof(wl * 1.15, ws), le[1] - ws * roof(wl * 1.15, ws), le[0] - wc * 4, le[1] - ws * 4, { stroke: GRAY, w: 1.6, arrow: "pkahg" });
      const ly = top + sH + 14;
      T(g, cx, ly, wide ? ["1 · near hub", "2 · mid-blade", "3 · near tip"][i] : ["1 · hub", "2 · mid", "3 · tip"][i], { size: wide ? 11 : 12, anchor: "middle", fill: GRAY });
      T(g, cx, ly + 20, `AoA ${Math.round(aoa)}°`, { size: 15, anchor: "middle", fill: col, weight: 600 });
      T(g, cx, ly + 37, `blade ${Math.round(be)}°`, { size: wide ? 11 : 12, anchor: "middle", fill: GRAY }); });
    T(g, pad, top + sH + 68, "blade and wind angles are illustrative", { size: 11, fill: DIM });
    // instruments: tachometer, and on a constant-speed prop manifold pressure plus what the governor is doing
    const tilt = cs ? Math.max(-1, Math.min(1, (rpm - set) / 120)) : 0, gov = Math.abs(tilt) > 0.15 ? (tilt > 0 ? "flyweights out: more pitch" : "flyweights in: less pitch") : "governor holding RPM";
    const tach = (x, y, r) => dial(g, x, y, r, { min: 0, max: 3500, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", focus: true, value: rpm, fmt: (x2) => String(Math.round(x2 / 10) * 10) });
    const mp = (x, y, r) => dial(g, x, y, r, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", value: 12 + thr * 16 });
    const note = (x, y, anchor) => { if (cs) T(g, x, y, gov, { size: 11, anchor, fill: Math.abs(tilt) > 0.15 ? ACC : GRAY });
      else T(g, x, y, rpm > 2700 ? "Over the red line" : "Tach = power", { size: 12, anchor, fill: rpm > 2700 ? COL.red : INK, weight: 600 }); };
    let Hh;
    if (wide) { const gx0 = W - pad - gcw, gxc = gx0 + gcw / 2; L(g, gx0, top + 4, gx0, top + sH + 44, { stroke: "rgba(242,241,236,.07)", w: 1 });
      if (cs) { const r = 56, y1 = top + r + 2; tach(gxc, y1, r); mp(gxc, y1 + 2 * r + 16, r); Hh = y1 + 3 * r + 34; note(gxc, Hh - 8, "middle"); Hh = Math.max(Hh, top + sH + 76); }
      else { const r = Math.min(64, gcw / 2 - 8), y1 = top + 8 + r; tach(gxc, y1, r); note(gxc, y1 + r + 26, "middle"); Hh = Math.max(top + sH + 76, y1 + r + 40); } }
    else { const iy0 = top + sH + 78, r = 56, gy = iy0 + r + 6; L(g, pad, iy0 - 4, W - pad, iy0 - 4, { stroke: "rgba(242,241,236,.08)", w: 1 });
      if (cs) { tach(pad + r + 2, gy, r); mp(W - pad - r - 2, gy, r); Hh = gy + r + 32; note(W / 2, Hh - 10, "middle"); }
      else { tach(pad + r + 2, gy, r); const tx = pad + 2 * r + 20; note(tx, gy - 4, "start"); ["fixed pitch: RPM follows", "throttle and airspeed"].forEach((s2, j) => T(g, tx, gy + 14 + j * 15, s2, { size: 11, fill: GRAY })); Hh = gy + r + 12; } }
    let cap;
    const worst = Math.max(...stall), neg = Math.min(...stall);
    if (!twist && neg < 0) cap = ["No twist", "Same blade angle everywhere: the hub has a negative angle of attack while the tip works hard."];
    else if (!cs && v < 5 && thr >= 0.99) cap = ["Static RPM", "Full throttle, no airspeed: the 172S POH gives a static RPM range of 2,300 to 2,400 RPM. High angle of attack."];
    else if (!cs && rpm > 2700) cap = ["Overspeed", "Airspeed is driving the prop past the red line. Reduce the throttle."];
    else if (!cs) cap = ["Fixed pitch", "More airspeed lowers the angle of attack, so RPM rises. The tachometer shows power."];
    else if (stop === "low") cap = ["On the low-pitch stop", "Too little airspeed or power to hold the set RPM: it acts like a fixed-pitch prop."];
    else if (stop === "high") cap = ["On the high-pitch stop", "The blade can't take a bigger bite, so RPM rises above the setting. Slow down or reduce power."];
    else if (Math.abs(rpm - set) > 30) cap = [rpm > set ? "Overspeed, governor responding" : "Underspeed, governor responding", rpm > set ? "Flyweights swing out and the blade angle increases to slow the prop." : "Flyweights drop in and the blade angle decreases to let the prop speed up."];
    else cap = ["Constant speed", "The governor holds the RPM you set; the throttle sets manifold pressure."];
    F.caption(cap[0], cap[1]);
    return Hh;
  }
  F.explain(`<p>The numbered white bands on the blue blade are the three stations in the insets below. The spin is slowed way down so you can follow them; the soft disc shows the area the blades sweep. Rotation speed grows toward the tip, so the relative wind there is flatter. The twist lowers the blade angle toward the tip to keep the angle of attack about the same along the blade. On a constant-speed prop, watch both blades turn about their own axes as the governor changes the blade angle. Your airplane's POH gives the static RPM range.</p>`);
  band(); upd();
  return { destroy: () => { A.stop(); S.destroy(); F.destroy(); } };
}
