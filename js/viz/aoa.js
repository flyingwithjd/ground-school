// Angle of attack in ink 3D: a wing section in a smoke tunnel. Drag the slider and the wing pitches against a fixed relative wind;
// streamlines flow continuously (faster and closer together over the top: lower pressure, Bernoulli), the lift arrow and the lift
// curve respond, and past the critical angle the upper flow separates into a churning wake. Illustrative airfoil (NACA 2412-like)
// and an illustrative lift curve, not data for any specific wing. PHAK Ch 4, 5.
import { frame, slider, readout } from "./base.js?v=x";
import { planeStage } from "./planestage.js?v=x";
import { reduced, clamp } from "../core/util.js?v=x";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
const CRIT = 16, CH = 5, LE = -3.2, PIV = LE + CH * 0.25, XC = LE + CH * 0.4, SPAN = 6, ZF = SPAN / 2 + 0.25;   // chord 5 units
const INK = 0xf2f1ec, ACC = 0x3b82f6;
const CL = (a) => (a <= CRIT ? 0.105 * (a + 2) : 0.105 * (CRIT + 2) * (0.72 - 0.01 * (a - CRIT)));
function foil() { const m = 0.02, p = 0.4, t = 0.12, up = [], lo = [];
  for (let i = 0; i <= 48; i++) { const b = (i / 48) * Math.PI, x = (1 - Math.cos(b)) / 2;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const yc = x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * x - x * x);
    up.push([LE + x * CH, (yc + yt) * CH]); lo.push([LE + x * CH, (yc - yt) * CH]); }
  return { up, lo }; }
const Y0 = [2.9, 2.0, 1.3, 0.72, -0.62, -1.2, -1.85], X0 = -8, X1 = 8, NS = 80;
export function mount(host) {
  const F = frame(host, { cls: "capin aoa3d", corners: { tl: "Angle of attack", tr: "PHAK 4, 5" } });
  const still = reduced();
  const empty = (THREE) => ({ root: new THREE.Group(), parts: {}, meshes: [], pose() {} });
  const S = planeStage(F.stage, { view: { tg: [0, 0, 0], az: 78, el: 10, d: 30 }, orbit: true, maxFps: 30, model: empty, cg: [0, 0, 0], fov: 30 }); const T = S.THREE;
  const res = new T.Vector2(1, 1), mats = [];
  const lm = (o) => { const m = new LineMaterial({ color: INK, linewidth: 1.4, transparent: true, opacity: 0.6, depthWrite: false, ...o }); mats.push(m); return m; };
  const segs = (pairs, mat, parent) => { const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(pairs.flat(2))); const l = new LineSegments2(g, mat); if (mat.dashed) l.computeLineDistances(); l.frustumCulled = false; l.renderOrder = 4; parent.add(l); return l; };
  // the wing: extruded airfoil with near-black faces and white ink edges, pitching about the quarter chord
  const pivot = new T.Group(); pivot.position.set(PIV, 0, 0); S.scene.add(pivot); const wing = new T.Group(); wing.position.set(-PIV, 0, 0); pivot.add(wing);
  const { up, lo } = foil(); const sh = new T.Shape(); sh.moveTo(...up[0]); up.slice(1).forEach((q) => sh.lineTo(...q)); [...lo].reverse().forEach((q) => sh.lineTo(...q));
  const eg = new T.ExtrudeGeometry(sh, { depth: SPAN, bevelEnabled: false, curveSegments: 1 }); eg.translate(0, 0, -SPAN / 2);
  const body = new T.Mesh(eg, new T.MeshBasicMaterial({ color: 0x0e0e11, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })); wing.add(body);
  const eGeo = new T.EdgesGeometry(eg, 25), ep = eGeo.attributes.position.array, ePairs = []; for (let i = 0; i < ep.length; i += 6) ePairs.push([[ep[i], ep[i + 1], ep[i + 2]], [ep[i + 3], ep[i + 4], ep[i + 5]]]); eGeo.dispose();
  segs(ePairs, lm({ opacity: 0.95, linewidth: 1.8 }), wing);
  const sp = []; for (const f of [0.1, 0.3, 0.55, 0.8]) { const i = Math.round(f * 48); sp.push([[up[i][0], up[i][1], -SPAN / 2], [up[i][0], up[i][1], SPAN / 2]]); } segs(sp, lm({ opacity: 0.25, linewidth: 1 }), wing);
  segs([[[LE - 0.8, 0, ZF], [LE + CH + 0.8, 0, ZF]]], lm({ dashed: true, dashSize: 0.18, gapSize: 0.14, opacity: 0.5, linewidth: 1.2 }), wing);   // chord line
  // fixed references: relative wind arrow, AOA arc, lift arrow
  const fixed = new T.Group(); S.scene.add(fixed);
  segs([[[-5.9, 0, ZF], [-4.3, 0, ZF]], [[-4.3, 0, ZF], [-4.55, 0.13, ZF]], [[-4.3, 0, ZF], [-4.55, -0.13, ZF]]], lm({ opacity: 0.9, linewidth: 2 }), fixed);
  const mArc = lm({ color: ACC, opacity: 1, linewidth: 2.6 }); let arc = null;
  const mLift = lm({ color: ACC, opacity: 1, linewidth: 4 }); let lift = null;
  // streamlines in the plane just in front of the wing: dashes drift with the flow, faster above (lower pressure) than below
  const mUp = lm({ dashed: true, dashSize: 0.34, gapSize: 0.22, opacity: 0.75 }), mLo = lm({ dashed: true, dashSize: 0.34, gapSize: 0.22, opacity: 0.55 });
  const flow = new T.Group(); S.scene.add(flow);
  const lines = Y0.map((y0) => { const pts = []; for (let i = 0; i < NS; i++) pts.push([[0, 0, ZF], [0, 0, ZF]]); const l = segs(pts, y0 > 0 ? mUp : mLo, flow); return { l, y0, arr: l.geometry.attributes.instanceStart.data }; });
  let A = 4;
  // streamline model (illustrative): each line rides over/under the rotated airfoil with a smooth envelope, crowding above the wing
  // (faster flow, lower pressure) and spreading a little below; downwash trails behind in proportion to AOA. Past the critical
  // angle the upper lines lift off the surface and churn.
  const TE = LE + CH, XM = LE + 0.33 * CH, HU = 0.5, HL = -0.12;
  // smooth stand-ins for the rotated upper and lower surfaces, so lines arch over the wing without kinks; nose-up tilts them
  const tilt = (x) => -(x - PIV) * Math.tan((A * Math.PI) / 180) * Math.exp(-(((x - (LE + TE) / 2) / (CH * 0.75)) ** 2));
  const yAt = (x, y0, t) => { const upper = y0 > 0, stalled = A > CRIT, ae = stalled ? CRIT * 0.55 : A, k = Math.exp(-Math.abs(y0) / 2.6), b = Math.exp(-(((x - XM) / (CH * 0.5)) ** 2));
    let y = y0 * (1 - (upper ? 0.22 : -0.08) * b * k * (0.4 + Math.max(0, ae) / 14)) + ((upper ? HU : HL) * b + tilt(x)) * k;
    y += -0.05 * ae * k * (Math.tanh((x - XC) / 1.8) + 1) * 0.5 * (upper ? 1 : 0.8) + 0.02 * ae * k * Math.exp(-(((x - LE + 1.5) / 1.6) ** 2));   // upwash ahead, downwash behind
    if (stalled && upper && y0 < 2.2 && x > LE + 1) { const sev = clamp((A - CRIT) / 4, 0.35, 1) * (1 - y0 / 2.6), g = clamp((x - LE - 1) / 1.6, 0, 1);
      y += sev * g * (0.5 + Math.sin(x / 0.42 + t * 0.006 + y0 * 9) * 0.28 + Math.sin(x / 0.16 - t * 0.011) * 0.1); }
    return y; };
  function drawFlow(t) { for (const L of lines) { const a = L.arr.array; let px = X0, py = yAt(X0, L.y0, t);
      for (let i = 0; i < NS; i++) { const x = X0 + ((i + 1) / NS) * (X1 - X0), y = yAt(x, L.y0, t); a.set([px, py, ZF, x, y, ZF], i * 6); px = x; py = y; } L.arr.needsUpdate = true; } }
  // labels
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:rgba(242,241,236,.8);background:rgba(10,10,11,.72);border:1px solid rgba(242,241,236,.2);border-radius:4px;padding:4px 6px;transform:translate(-50%,-50%)";
  const sty = document.createElement("style"); sty.textContent = ".ao3-tag.acc{color:#bfdbfe!important;border-color:#3b82f6!important}.ao3-tag.warn{color:#0a0a0b!important;background:#f2f1ec!important}@media (max-width:560px){.ao3-tag{font-size:10px!important;padding:3px 5px!important;letter-spacing:.05em!important}}"; F.stage.append(sty);
  const tags = []; const tag = (text, cls = "") => { const e = document.createElement("div"); e.className = "ao3-tag " + cls; e.style.cssText = TAG; e.textContent = text; e.setAttribute("aria-hidden", "true"); F.stage.append(e); const t = { e, at: [0, 0, 0], show: true }; tags.push(t); return t; };
  const tWind = tag("Relative wind"), tChord = tag("Chord line"), tLift = tag("Lift", "acc"), tA = tag("4°", "acc"), tLow = tag("Faster flow · lower pressure"), tHigh = tag("Slower flow · higher pressure"), tSep = tag("Separated, turbulent flow", "warn");
  tWind.at = [-5.1, -0.5, ZF];
  function placeTags() { const W = F.stage.clientWidth, H = F.stage.clientHeight, top = W < 560 ? 44 : 32, done = [];
    for (const t of tags) { t.e.style.visibility = t.show ? "" : "hidden"; if (!t.show) continue; const q = S.project(t.at, false); if (!t.w || t.e.dataset.txt !== t.e.textContent) { t.w = t.e.offsetWidth; t.h = t.e.offsetHeight; t.e.dataset.txt = t.e.textContent; } const w = t.w, h = t.h;
      const x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, q.x)); let y = q.y;
      for (const k of [0, -1, 1, -2, 2]) { const yy = Math.max(top + h / 2, Math.min(H - h / 2 - 4, q.y + k * (h + 3))); if (!done.some((r) => Math.abs(r.x - x) < (r.w + w) / 2 + 3 && Math.abs(r.y - yy) < (r.h + h) / 2 + 2)) { y = yy; break; } }
      done.push({ x, y, w, h }); t.e.style.left = Math.round(x) + "px"; t.e.style.top = Math.round(y) + "px"; } }
  const set = readout(F.ctrl, [["a", "angle of attack"], ["l", "lift (relative)"], ["f", "airflow"]]);
  // a small lift curve under the readout: the dot rides it as you move the slider
  const NSs = "http://www.w3.org/2000/svg", cv = document.createElementNS(NSs, "svg"); cv.setAttribute("viewBox", "0 0 340 104"); cv.setAttribute("class", "ao3-curve"); cv.setAttribute("aria-hidden", "true"); cv.style.cssText = "width:100%;max-width:420px;display:block;margin:6px 0 2px";
  const ax = (a) => 34 + ((a + 4) / 26) * 290, ay = (c) => 84 - (c / 2.1) * 70; let dd = ""; for (let a = -4; a <= 22; a += 0.25) dd += (dd ? " L" : "M") + ax(a).toFixed(1) + "," + ay(CL(a)).toFixed(1);
  cv.innerHTML = `<path d="M34,10 V84 H326" fill="none" stroke="rgba(242,241,236,.3)"/><path d="${dd}" fill="none" stroke="rgba(242,241,236,.7)" stroke-width="2"/><line x1="${ax(CRIT)}" x2="${ax(CRIT)}" y1="84" y2="10" stroke="rgba(242,241,236,.35)" stroke-dasharray="4 4"/>
    <text x="${ax(CRIT) + 5}" y="20" fill="rgba(242,241,236,.6)" font-size="11" font-family="var(--mono)">CRITICAL AOA</text><text x="34" y="100" fill="rgba(242,241,236,.6)" font-size="11" font-family="var(--mono)">ANGLE OF ATTACK →</text><text x="40" y="12" fill="rgba(242,241,236,.6)" font-size="11" font-family="var(--mono)">LIFT</text><circle r="6" fill="#3b82f6"/>`;
  const dot = cv.querySelector("circle");
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 400);
  function fit(dur = 1) { const r = F.stage.getBoundingClientRect(); if (!r.width) return; cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); const narrow = r.width < 560;
    const xs = narrow ? [-6, 4.9] : [-7.8, 7.6], tg = [(xs[0] + xs[1]) / 2, 0.5, 0], az = 80, el = 8, pts = []; for (const x of xs) for (const y of narrow ? [-2.3, 3.5] : [-2.6, 3.9]) pts.push(new T.Vector3(x, y, ZF));
    let lo = 2, hi = 200; for (let it = 0; it < 28; it++) { const d = (lo + hi) / 2, e = (el * Math.PI) / 180, a = (az * Math.PI) / 180; cam.position.set(tg[0] + d * Math.cos(e) * Math.cos(a), tg[1] + d * Math.sin(e), tg[2] + d * Math.cos(e) * Math.sin(a)); cam.lookAt(...tg); cam.updateMatrixWorld();
      const ok = pts.every((c) => { const q = c.clone().project(cam); return Math.abs(q.x) < 0.98 && q.y < 0.8 && q.y > -0.95; }); if (ok) hi = d; else lo = d; }
    S.setView({ tg, az, el, d: hi }, dur); }
  new ResizeObserver(() => fit()).observe(F.stage);
  function update(a) { A = a; pivot.rotation.z = (-a * Math.PI) / 180;
    const rad = (-a * Math.PI) / 180, R = 3.2, n = Math.max(2, Math.ceil(Math.abs(a))), pa = []; for (let i = 0; i < n; i++) { const t0 = (i / n) * rad, t1 = ((i + 1) / n) * rad; pa.push([[PIV + R * Math.cos(t0), R * Math.sin(t0), ZF], [PIV + R * Math.cos(t1), R * Math.sin(t1), ZF]]); }
    if (arc) { fixed.remove(arc); arc.geometry.dispose(); } arc = segs(pa, mArc, fixed); arc.visible = a !== 0;
    const cl = CL(a), len = 0.5 + 1.7 * Math.max(0, cl); if (lift) { fixed.remove(lift); lift.geometry.dispose(); }
    lift = segs([[[PIV, 0.5, ZF], [PIV, 0.5 + len, ZF]], [[PIV, 0.5 + len, ZF], [PIV - 0.16, 0.5 + len - 0.28, ZF]], [[PIV, 0.5 + len, ZF], [PIV + 0.16, 0.5 + len - 0.28, ZF]]], mLift, fixed);
    tLift.at = [PIV - 0.7, 0.6 + len, ZF]; tA.e.textContent = `${a}°`; tA.at = [PIV + R + 0.6, R * Math.sin(rad / 2), ZF];
    const c = Math.cos(rad), s2 = Math.sin(rad), cx = LE + CH + 0.5 - PIV; tChord.at = [PIV + cx * c + 0.4, cx * s2 - 0.42, ZF];
    const stalled = a > CRIT; tLow.at = [XC + 0.6, 3.75, ZF]; tHigh.at = [XC + 0.4, -2.75, ZF]; tSep.at = [2.6, 1.3, ZF]; tSep.show = stalled; tLow.show = !stalled; tHigh.show = true;
    mUp.opacity = stalled ? 0.6 : 0.8;
    dot.setAttribute("cx", ax(a)); dot.setAttribute("cy", ay(cl));
    set("a", `${a}°`); set("l", `${Math.round((cl / CL(CRIT)) * 100)}%`); set("f", stalled ? "separated" : a >= CRIT - 3 ? "near critical" : "attached");
    if (stalled) { F.caption("Past the critical angle", "Stalled"); F.explain("The airflow can no longer follow the curved upper surface. It separates and becomes turbulent, and lift drops sharply. The only cure is to <strong>reduce the angle of attack</strong>: release back pressure. <span class=\"src\">PHAK Ch 5</span>"); }
    else if (a >= CRIT - 3) { F.caption("Approaching the critical angle", "Lift near maximum"); F.explain("Lift is close to its peak. In the 172S the stall warning horn sounds 5 to 10 knots before the stall. A little more AOA and the flow separates. <span class=\"src\">PHAK Ch 5</span>"); }
    else if (a <= 0) { F.caption("Low angle of attack", "Little lift"); F.explain("This cambered wing still makes a little lift at 0°. At high cruise speed you fly at a low AOA because speed supplies the lift. <span class=\"src\">PHAK Ch 4</span>"); }
    else { F.caption("Normal flight", "Lift grows with AOA"); F.explain("More AOA turns the airflow more and speeds it up over the top, where the streamlines crowd together: faster air, lower pressure (Bernoulli). Lift rises roughly in a straight line until near the critical angle. <span class=\"src\">PHAK Ch 4, 5</span> <span class=\"dim\">Illustrative wing, not 172 data.</span>"); }
    drawFlow(performance.now()); lines.forEach((L) => L.l.computeLineDistances()); S.kick(); }
  slider(F.ctrl, { label: "Angle of attack", min: -4, max: 22, step: 1, value: 4, fmt: (v) => `${v}°`, oninput: update });
  F.ctrl.append(cv);
  update(4); fit();
  let ph = 0, last = performance.now();
  S.animate((now) => { const r = S.renderer.getDrawingBufferSize(new T.Vector2()); if (r.x !== res.x || r.y !== res.y) { res.copy(r); mats.forEach((m) => m.resolution.copy(res)); }
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (!still) { ph += dt; const sU = A > CRIT ? 0.9 : 1 + 0.06 * Math.max(0, A), sL = 1 - 0.02 * Math.max(0, A); mUp.dashOffset = -ph * 2.2 * sU; mLo.dashOffset = -ph * 2.2 * sL; if (A > CRIT) drawFlow(now); }
      placeTags(); return !still; }, { idle: still });
  return { destroy() { tags.forEach((t) => t.e.remove()); mats.forEach((m) => m.dispose()); S.destroy(); F.destroy(); } };
}
