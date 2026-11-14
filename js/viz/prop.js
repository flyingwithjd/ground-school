// The propeller as a rotating wing, on a 3D two-blade propeller (planeStage) that turns slowly while on screen, with the
// chosen blade station (hub, mid, tip) lit as a white band on one blade; under the controls, one big blade section at that
// station: blade speed + airspeed make the relative wind, and the angle of attack is the arc between it and the chord. Fixed pitch: airspeed and throttle
// set the RPM. Constant speed: the governor changes the blade angle to hold the RPM set with the prop control, and the
// throttle sets manifold pressure. A "No twist" toggle shows why blades are twisted.
// Facts, PHAK 7 (Propeller): a propeller is a rotating airfoil; blade angle is greatest at the hub and smallest at the
// tip because the tip travels faster; without twist the inner blade would have a negative angle of attack while the tip
// stalled. Fixed pitch: efficient at one airspeed/RPM combination, the tachometer shows power, RPM rises with airspeed
// at a fixed throttle. Constant speed: once an RPM is set, the governor raises blade angle when airspeed rises (or load
// falls) and lowers it when airspeed falls (or load rises); manifold pressure shows power; at the pitch stops it acts
// like a fixed-pitch propeller. C172S POH 2: static full-throttle RPM 2,300-2,400, red line 2,700.
// RPM and manifold pressure values, blade pitch and pitch stops are illustrative, not published numbers.
import { frame, chips, slider, row } from "./base.js?v=0134b87946";
import { planeStage } from "./planestage.js?v=0134b87946";
import { airfoil, loftGeo } from "./section-models.js?v=0134b87946";
import { buildPlane } from "./c172-model.js?v=0134b87946";
import { T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=0134b87946";
import { dial, anim, toward, COL } from "./dial.js?v=0134b87946";
import { s, h, reduced } from "../core/util.js?v=0134b87946";
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
  let stn = 2, mode = "fixed", twist = true, v = 0, thr = 1, set = 2400, b75 = betaFixed(0.75 * RAD), rpmCS = 2400;
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
    M3.bands.forEach((m, i) => { if (i !== stn) return; m.updateWorldMatrix(true, false); m.geometry.boundingSphere || m.geometry.computeBoundingSphere(); wp.copy(m.geometry.boundingSphere.center).applyMatrix4(m.matrixWorld); const q = S.project([wp.x, wp.y, wp.z], false), c0 = S.project([PX, PY, 0], false);
      const dx = q.x - c0.x, dy = q.y - c0.y, n = Math.hypot(dx, dy) || 1, ox = (-dy / n) * 22, oy = (dx / n) * 22;
      const tx = T(lg, q.x + ox, q.y + oy + 4, ["hub", "mid", "tip"][i], { size: 12, anchor: "middle", fill: "#ffffff", weight: 700 }); tx.setAttribute("stroke", "#000"); tx.setAttribute("stroke-width", "3"); tx.setAttribute("paint-order", "stroke"); }); }
  const showBand = () => { M3.bands.forEach((m, i) => { m.visible = i === stn; }); S.kick(); };
  // the blade section + gauges: their own SVG strip under the controls, drawn in screen pixels
  const strip = h("div", { class: "vstrip" }); F.stage.after(strip);
  const svgEl = s("svg", { class: "full", role: "img" }, strip); s("defs", {}, svgEl).innerHTML = `<marker id="pkahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${GRAY}"/></marker><marker id="pkahw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>`;
  let gEl = s("g", {}, svgEl);
  const redraw = () => { const W = strip.clientWidth || 600; gEl.remove(); gEl = s("g", {}, svgEl); const H = draw(gEl, W); svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`); svgEl.setAttribute("height", H); strip.style.height = H + "px"; apply3d(); };
  const sro = new ResizeObserver(() => redraw()); sro.observe(strip); F.on(() => sro.disconnect());
  const S0 = { F, redraw };
  const r0 = row(F.ctrl, "Prop"); chips(r0, [["fixed", "Fixed pitch"], ["cs", "Constant speed"]], mode, (k) => { mode = k || "fixed"; glide(mode === "cs" ? -28 : -54, mode === "cs" ? 18 : 14); r4.classList.toggle("off", mode !== "cs"); rs.input.disabled = mode !== "cs"; b75 = targetB(); rpmCS = set; upd(); }, { label: "Prop" });
  const r1 = row(F.ctrl, "Blade"); chips(r1, [["tw", "Twisted"], ["flat", "No twist"]], "tw", (k) => { twist = k !== "flat"; glide(twist ? -54 : -40, twist ? 14 : 26); upd(); }, { label: "Blade" });
  const r5 = row(F.ctrl, "Station"); chips(r5, [["0", "Hub"], ["1", "Mid"], ["2", "Tip"]], String(stn), (k) => { if (k == null) return; stn = +k; showBand(); redraw(); }, { label: "Blade station" });
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
    return [set + Math.max(-400, Math.min(400, (targetB() - b75) * 60)), null]; }
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
    const stall = ST.map((f0) => beta(f0 * RAD) - phi(v, rpm, f0 * RAD));
    const pad = 14, gcw = wide ? Math.max(170, W * 0.26) : 0, pw = W - pad * 2 - gcw, x0 = pad, top = 14;
    // One big blade section at the chosen station (PHAK 7). The blade moves left along the plane of rotation (blade speed,
    // which grows toward the tip) and forward with the airplane (airspeed, up the page); the air meets it from the opposite
    // direction (relative wind). Angle of attack = blade angle minus the angle of the relative wind. Same scale at every station.
    const r = ST[stn] * RAD, u = (Math.max(rpm, 1) / 60) * 2 * Math.PI * r, va = v * KT, ph = phi(v, rpm, r), be = beta(r), aoa = be - ph, bad = aoa > 15 || aoa < 0, col = bad ? COL.red : ACC;
    const hv = Math.min(110, pw * 0.3), k = Math.min((pw * 0.56) / u, va > 1 ? hv / va : 9), c = Math.min(pw * 0.34, 170), le = [x0 + pw * 0.62, top + 40 + hv + 14];   // each station fills the panel; the angles are true
    const cb = Math.cos(be * D), sb = Math.sin(be * D), f2 = (n) => n.toFixed(1), rot = (el, x, y, a) => el.setAttribute("transform", `rotate(${f2(a)} ${f2(x)} ${f2(y)})`);
    T(g, x0, top + 8, ["Near the hub", "Mid-blade", "Near the tip"][stn], { size: 13, weight: 600 });
    T(g, x0, top + 25, `blade angle ${Math.round(be)}°`, { size: 11.5, fill: GRAY });
    T(g, x0 + pw, top + 8, `angle of attack ${Math.round(aoa)}°`, { size: 13, weight: 600, anchor: "end", fill: col });
    if (bad) T(g, x0 + pw, top + 25, aoa < 0 ? "negative: no useful thrust" : "very high: may stall", { size: 11.5, anchor: "end", fill: COL.red });
    L(g, x0, le[1], x0 + pw, le[1], { stroke: DIM, w: 1, dash: "3 5" }); T(g, x0, le[1] + 32, "plane of rotation", { size: 11, fill: DIM });
    // the velocity triangle: blade speed (left), airspeed (up), and the relative wind that results, pointing at the blade
    const qx = le[0] - u * k, qy = le[1] - va * k, hyp = Math.hypot(u, va) * k, ah = va * k; let rw = null;
    if (ah > 5) {
      L(g, le[0], le[1], qx + 3, le[1], { stroke: GRAY, w: 1.8, arrow: "pkahg" }); T(g, le[0] - 8, le[1] + 17, "blade speed", { size: 11, anchor: "end", fill: GRAY });
      L(g, qx, le[1], qx, qy + 3, { stroke: GRAY, w: 1.8, arrow: "pkahg" });
      const amy = ah >= 56 ? (le[1] + qy) / 2 : le[1] - 28;   // a short arrow: the label stands on the base line
      if (ah >= 56 || qx - x0 < 62) rot(T(g, qx - 6, amy, "airspeed", { size: 11, anchor: "middle", fill: GRAY }), qx - 6, amy, -90);
      else if (qx - x0 >= 62) T(g, qx - 6, (le[1] + qy) / 2 + 8, "airspeed", { size: 11, anchor: "end", fill: GRAY });
      const ex = le[0] - (le[0] - qx) * 5 / hyp, ey = le[1] - (le[1] - qy) * 5 / hyp; L(g, qx, qy, ex, ey, { stroke: INK, w: 2.4, arrow: "pkahw" });
      const mx = qx + 0.4 * (le[0] - qx), my = qy + 0.4 * (le[1] - qy), nx = (le[1] - qy) / hyp, ny = -(le[0] - qx) / hyp;
      const sd = aoa < 0 ? -1 : 1, lx = mx - sd * nx * (sd > 0 ? 7 : 5), ly = my - sd * ny * (sd > 0 ? 7 : 5) + (sd > 0 ? 9 : 0);   // on the side away from the angle-of-attack wedge
      if (hyp >= 120 && ah >= 40) rot(T(g, lx, ly, "relative wind", { size: 11.5, anchor: "middle", fill: INK }), lx, ly, ph);
      else if (ah < 40) { const ry = Math.min(qy - 16, le[1] - 62); T(g, qx - 4, ry, "relative wind", { size: 11.5, fill: INK }); rw = [qx - 4, ry - 12, qx + 92, ry + 3]; }   // thin triangle: over the tail
      else T(g, qx - 6, qy + 4, "relative wind", { size: 11.5, anchor: "end", fill: INK });
    } else { L(g, qx, le[1], le[0] - 5, le[1], { stroke: INK, w: 2.4, arrow: "pkahw" }); T(g, le[0] - 8, le[1] + 17, "relative wind", { size: 11.5, anchor: "end", fill: INK }); }
    // the blade section, its chord line run forward, and the angle of attack between chord and relative wind
    const roof = Math.min(1, (le[1] - top - 36) / Math.max(1, c * 1.05 * sb)), ext = c * 1.05 * roof, ar = Math.max(44, Math.min(c * 0.95, ext * 0.92, 130));
    L(g, le[0], le[1], le[0] - cb * ext, le[1] - sb * ext, { stroke: "rgba(242,241,236,.6)", w: 1.2, dash: "5 4" });
    if (hyp < ar + 12) { const wc = Math.cos(ph * D), ws = Math.sin(ph * D); L(g, le[0], le[1], le[0] - wc * (ar + 12), le[1] - ws * (ar + 12), { stroke: "rgba(242,241,236,.4)", w: 1, dash: "2 4" }); }
    const pts = FO.map(([x, y]) => [le[0] + cb * x * c + sb * y * c, le[1] + sb * x * c - cb * y * c]);
    P(g, "M" + pts.map((q) => f2(q[0]) + "," + f2(q[1])).join("L") + "Z", { fill: "#141417", stroke: bad ? COL.red : INK, w: 1.8 });
    L(g, le[0], le[1], le[0] + cb * c, le[1] + sb * c, { stroke: "rgba(242,241,236,.35)", w: 1, dash: "3 3" });
    T(g, Math.min(le[0] + cb * c + 6, x0 + pw - 46), le[1] + sb * c + 14, "chord", { size: 11, fill: GRAY });
    const a0 = Math.PI + ph * D, a1 = Math.PI + be * D;
    if (Math.abs(aoa) > 0.4) { const p0 = [le[0] + Math.cos(a0) * ar, le[1] + Math.sin(a0) * ar], p1 = [le[0] + Math.cos(a1) * ar, le[1] + Math.sin(a1) * ar], sw = aoa > 0 ? 1 : 0;
      P(g, `M${f2(le[0])},${f2(le[1])} L${f2(p0[0])},${f2(p0[1])} A${f2(ar)},${f2(ar)} 0 0 ${sw} ${f2(p1[0])},${f2(p1[1])} Z`, { fill: bad ? "rgba(217,73,62,.3)" : "rgba(59,130,246,.34)", stroke: "none" });
      P(g, `M${f2(p0[0])},${f2(p0[1])} A${f2(ar)},${f2(ar)} 0 0 ${sw} ${f2(p1[0])},${f2(p1[1])}`, { stroke: col, w: 3.4 }); }
    // the number by the arc (the header carries it too); left out if it would sit on the relative-wind label
    const la = Math.PI + (be + (aoa < 0 ? -6 : 6)) * D, nx0 = le[0] + Math.cos(la) * (ar + 2), ny0 = le[1] + Math.sin(la) * (ar + 2), nw = 9 * String(Math.round(aoa)).length + 10;
    if (!rw || nx0 < rw[0] - 2 || nx0 - nw > rw[2] + 2 || ny0 < rw[1] - 2 || ny0 - 13 > rw[3] + 2) { const lt = T(g, nx0, ny0, `${Math.round(aoa)}°`, { size: 13, anchor: "end", fill: col, weight: 700 });
      lt.setAttribute("stroke", "#0A0A0B"); lt.setAttribute("stroke-width", "4"); lt.setAttribute("paint-order", "stroke"); }
    // one line on what the station shows
    const by = Math.max(le[1] + 56, le[1] + sb * c + 38), spread = Math.max(...stall) - Math.min(...stall);
    const l1 = !twist ? "No twist: the same blade angle at every station." : ["Slowest part of the blade: steepest blade angle.", "Middle speed: middle blade angle.", "Fastest part of the blade: flattest blade angle."][stn];
    const l2 = twist && spread < 7 && Math.max(...stall) <= 15 ? "Twist keeps the angle of attack about the same." : !twist && Math.min(...stall) < 0 ? "So the hub meets the air at a negative angle." : "";
    T(g, x0, by, l1, { size: 13, fill: INK, mono: false }); if (l2) T(g, x0, by + 18, l2, { size: 12, fill: GRAY, mono: false });
    T(g, x0, by + (l2 ? 36 : 18), "angles illustrative", { size: 11, fill: DIM });
    const sH = by + (l2 ? 36 : 18) + 4 - top;
    // instruments: tachometer, and on a constant-speed prop manifold pressure plus what the governor is doing
    const tilt = cs ? Math.max(-1, Math.min(1, (rpm - set) / 120)) : 0, gov = Math.abs(tilt) > 0.15 ? (tilt > 0 ? "flyweights out: more pitch" : "flyweights in: less pitch") : "governor holding RPM";
    const tach = (x, y, r) => dial(g, x, y, r, { min: 0, max: 3500, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", focus: true, value: rpm, fmt: (x2) => String(Math.round(x2 / 10) * 10) });
    const mp = (x, y, r) => dial(g, x, y, r, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", value: 12 + thr * 16 });
    const note = (x, y, anchor) => { if (cs) T(g, x, y, gov, { size: 11, anchor, fill: Math.abs(tilt) > 0.15 ? ACC : GRAY });
      else T(g, x, y, rpm > 2700 ? "Over the red line" : "Tach = power", { size: 12, anchor, fill: rpm > 2700 ? COL.red : INK, weight: 600 }); };
    let Hh;
    if (wide) { const gx0 = W - pad - gcw, gxc = gx0 + gcw / 2; L(g, gx0, top + 4, gx0, top + sH, { stroke: "rgba(242,241,236,.07)", w: 1 });
      if (cs) { const r = 56, y1 = top + r + 2; tach(gxc, y1, r); mp(gxc, y1 + 2 * r + 16, r); Hh = y1 + 3 * r + 34; note(gxc, Hh - 8, "middle"); Hh = Math.max(Hh, top + sH + 10); }
      else { const r = Math.min(64, gcw / 2 - 8), y1 = top + 8 + r; tach(gxc, y1, r); note(gxc, y1 + r + 26, "middle"); Hh = Math.max(top + sH + 10, y1 + r + 40); } }
    else { const iy0 = top + sH + 18, r = 56, gy = iy0 + r + 6; L(g, pad, iy0 - 4, W - pad, iy0 - 4, { stroke: "rgba(242,241,236,.08)", w: 1 });
      if (cs) { tach(pad + r + 2, gy, r); mp(W - pad - r - 2, gy, r); Hh = gy + r + 32; note(W / 2, Hh - 10, "middle"); }
      else { tach(pad + r + 2, gy, r); const tx = pad + 2 * r + 20; note(tx, gy - 4, "start"); ["fixed pitch: RPM follows", "throttle and airspeed"].forEach((s2, j) => T(g, tx, gy + 14 + j * 15, s2, { size: 11, fill: GRAY })); Hh = gy + r + 12; } }
    let cap;
    const neg = Math.min(...stall);
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
  F.explain(`<p>Pick a station: the white band on the blue blade shows where the section below is cut. A propeller blade is a wing turning in a circle, so it meets the air from two motions at once: forward with the airplane (airspeed) and around the hub (blade speed). Together they make the relative wind, and the angle of attack is the angle between it and the blade's chord. The tip travels much farther each turn than the hub, so the blade is twisted to a flatter angle there; that keeps the angle of attack about the same from hub to tip. On a fixed-pitch prop, more airspeed tilts the relative wind and shrinks the angle of attack, so the prop speeds up: that's why RPM rises in a dive. A constant-speed prop changes the blade angle instead, to hold the RPM you set. The spin is slowed way down. Your airplane's POH gives the static RPM range.</p>`);
  showBand(); band(); upd();
  return { destroy: () => { A.stop(); S.destroy(); F.destroy(); } };
}
