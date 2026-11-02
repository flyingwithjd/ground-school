// Fuselage construction in 3D: truss, monocoque, semimonocoque (PHAK FAA-H-8083-25C Ch 3; AMT Airframe FAA-H-8083-31 Ch 1).
// A light high-wing airplane in 3/4 view (drag to turn it). The cowling, tail, gear and prop are solid context in thin ink;
// the wings are ghosted and cut off near the root so the fuselage stays the focus. Only the fuselage structure changes:
// blue = carries the load, gray = shape / covering only. Labels sit in the four corners of the stage (never over each other)
// with leader lines to the part they name.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildPlane } from "./c172-model.js?v=3358ab0706";
import { frame, chips } from "./base.js?v=3358ab0706";
import { h, s, reduced, clamp } from "../core/util.js?v=3358ab0706";

const ACC = 0x3b82f6, INK = 0xf2f1ec, BG = 0x0a0a0b, D = Math.PI / 180;
const TYPES = {
  truss: { big: "Truss", load: "The tube frame carries the load",
    text: "<b>What carries the load:</b> the welded steel-tube frame. Lengthwise tubes called <b>longerons</b> are tied together by vertical and horizontal struts, and <b>diagonal</b> struts make triangles so the frame resists loads from any direction. <b>Formers</b> and <b>stringers</b> only shape the <b>fabric covering</b>, which carries no structural load. Strong, but not streamlined: seen end-on the frame is square or rectangular. Older and simpler designs. <span class=\"src\">PHAK 3 · AMT Airframe 1</span>" },
  mono: { big: "Monocoque", load: "The skin alone carries the load",
    text: "<b>What carries the load:</b> the skin. Monocoque means “single shell”: a <b>stressed skin</b> supports almost all the loads, like an aluminum beverage can. <b>Formers</b> and <b>bulkheads</b> only give the shape. There are no lengthwise members, so it cannot tolerate deformation: a small <b>dent</b> lets the shell collapse under load. Tap <b>Show a dent</b>. <span class=\"src\">PHAK 3 · AMT Airframe 1</span>" },
  semi: { big: "Semimonocoque", load: "Skin and substructure share the load",
    text: "<b>What carries the load:</b> both. <b>Bulkheads</b> and <b>formers</b> give the shape; heavy <b>longerons</b> and lighter, more numerous <b>stringers</b> run lengthwise between them; the stressed <b>skin</b> is riveted to all of it. The substructure takes some of the bending, so a dent is no longer critical. Most modern airplanes use it, including the 172. Part of the skin is cut away here to show the inside. <span class=\"src\">PHAK 3 · AMT Airframe 1 · C172S POH Sec 7</span>" },
};
// Corner labels per type: [title, subtitle, focus?, anchor id]
// row: "t" = along the top edge, "b" = along the bottom edge
const LABELS = {
  truss: [["LONGERON", "main lengthwise tube", true, "lon", "t"], ["FABRIC COVERING", "carries no load", false, "fab", "t"], ["DIAGONAL STRUT", "makes triangles", true, "dia", "b"], ["VERTICAL STRUT", "ties the longerons", true, "vert", "b"]],
  mono: [["STRESSED SKIN", "carries the load", true, "skin", "t"], ["NO STRINGERS", "or longerons", false, null, "t"], ["BULKHEAD", "shape only", false, "bulk", "b"], ["FORMER", "shape only", false, "form", "b"]],
  semi: [["SKIN", "shares the load", true, "skin", "t"], ["STRINGER", "light, many", true, "str", "t"], ["LONGERON", "heavy, lengthwise", true, "lon", "b"], ["FORMER", "ring frame", true, "form", "b"]],
};
const DENT_LABEL = ["DENT", "shell can buckle", true, "dent", "t"];
const VIEW = { az: -62, el: 20, tg: [-5.2, 4.3, 0] };

export function mount(host) {
  const F = frame(host, { cls: "tall capin fus3d" });
  const stage = F.stage;
  const canvas = document.createElement("canvas"); stage.prepend(canvas);
  const PHONE = matchMedia("(max-width: 760px)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(PHONE ? 2 : 2, window.devicePixelRatio || 1)); renderer.setClearColor(BG, 1); renderer.localClippingEnabled = true; renderer.debug.checkShaderErrors = false;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 500);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1)); const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(14, 22, -18); scene.add(sun);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- context airplane (shared C172S geometry from the parts explorer) ----------
  const P = buildPlane(THREE); scene.add(P.root); P.root.updateMatrixWorld(true);
  const { surf, sec } = P; const XF = 3.62, XT = -17.3;   // firewall, tail-cone end
  const WCUT = 8.75; const clipW = [new THREE.Plane(V(0, 0, -1), WCUT), new THREE.Plane(V(0, 0, 1), WCUT)];
  const inkMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.4 });
  const wingInk = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.3, clippingPlanes: clipW });
  const HIDE = new Set(["fuselage", "fairing", "engine", "fuel", "propDim", "ailerons"]), GHOST = new Set(["wing", "flaps"]);
  for (const [name, part] of Object.entries(P.parts)) part.subs.forEach((sb) => {
    sb.obj.traverse((o) => { if (o.isMesh && o.userData.part === name) o.visible = !HIDE.has(name) && !GHOST.has(name); });
    if (!HIDE.has(name) && sb.segs.length) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(sb.segs, 3)); sb.obj.add(new THREE.LineSegments(g, GHOST.has(name) ? wingInk : inkMat)); } });
  // ---------- fuselage pieces (rebuilt for each type) ----------
  const grp = new THREE.Group(); scene.add(grp);
  const skinMat = (color, base, rim) => new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: base }, uF: { value: rim } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 uC; uniform float uA; uniform float uF; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uC, clamp(uA + uF * pow(f, 2.4), 0.0, 1.0)); }" });
  const reveal = new THREE.Plane(V(1, 0, 0), 99);   // sweeps nose -> tail when a type is chosen (the point-of-light draw-on, in 3D)
  const focusMat = new THREE.MeshLambertMaterial({ color: ACC, emissive: 0x0c2c6e, clippingPlanes: [reveal] });
  const focusThin = new THREE.MeshLambertMaterial({ color: 0x5f9bf8, emissive: 0x0a2050, clippingPlanes: [reveal] });
  const grayMat = new THREE.MeshLambertMaterial({ color: 0x7c7b77, emissive: 0x1a1a1a });
  const lineMat = (c, o) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o });
  const rod = (a, b, r, mat) => { const L = a.distanceTo(b); if (L < 1e-4) return; const g = new THREE.CylinderGeometry(r, r, L, 10, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    const m = new THREE.Mesh(g, mat); grp.add(m); const j = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 10, 6), mat); j.position.copy(a); grp.add(j); return m; };
  const tube = (pts, r, mat, closed = false) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), closed ? 96 : 64, r, 8, closed), mat); grp.add(m); return m; };
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  const TH = (j, n) => -Math.PI / 2 + (2 * Math.PI * j) / n;
  const angd = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  // near side faces the default camera (z < 0): th = PI on that side, PI/2 = top, -PI/2 = bottom
  const DENT = { x: -5.6, th: Math.PI - 0.1, dx: 0.85, dt: 0.3 };
  const CUT = { x0: 0.9, x1: -12.6, t0: Math.PI - 1.15, t1: Math.PI + 0.95 };
  const inCut = (x, th) => x <= CUT.x0 && x >= CUT.x1 && angd(th, Math.PI) >= CUT.t0 - Math.PI && angd(th, Math.PI) <= CUT.t1 - Math.PI;
  function skin(mat, { cut = false, dent = false, off = 0 } = {}) {
    const NX = 70, NT = 72, pos = [], idx = [];
    for (let i = 0; i <= NX; i++) { const x = XF + ((XT - XF) * i) / NX; for (let j = 0; j <= NT; j++) { const th = TH(j, NT);
      let o = off; if (dent) { const dx = x - DENT.x, dt = angd(th, DENT.th); o -= 0.42 * Math.exp(-((dx / DENT.dx) ** 2) - ((dt / DENT.dt) ** 2)); }
      const p = surf(x, th, o); pos.push(p.x, p.y, p.z); } }
    for (let i = 0; i < NX; i++) for (let j = 0; j < NT; j++) { const xm = XF + ((XT - XF) * (i + 0.5)) / NX, tm = TH(j + 0.5, NT); if (cut && inCut(xm, tm)) continue;
      const a = i * (NT + 1) + j, b = a + 1, c = a + NT + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.renderOrder = 4; grp.add(m); return m; }
  const ringPts = (x, off = -0.02, n = 72, t0 = 0, t1 = Math.PI * 2) => range(t0, t1, n).map((t) => surf(x, -Math.PI / 2 + t, off));
  const polyLine = (pts, mat) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); l.renderOrder = 5; grp.add(l); return l; };
  function windows(o = 0.5) { const m = lineMat(INK, o), T = (t, sd) => (sd > 0 ? t : Math.PI - t);
    const win = (x0, x1, t0, t1, sd) => { const pts = []; range(x0, x1, 8).forEach((x) => pts.push(surf(x, T(t0, sd), 0.02))); range(t0, t1, 4).forEach((t) => pts.push(surf(x1, T(t, sd), 0.02)));
      range(x1, x0, 8).forEach((x) => pts.push(surf(x, T(t1, sd), 0.02))); range(t1, t0, 4).forEach((t) => pts.push(surf(x0, T(t, sd), 0.02))); polyLine(pts, m); };
    for (const sd of [1, -1]) { win(1.25, -1.55, 0.3, 1.05, sd); win(-1.8, -3.8, 0.3, 0.95, sd); }
    win(3.3, 1.5, 0.62, Math.PI - 0.62, 1); win(-3.85, -6.0, 1.0, Math.PI - 1.0, 1); }
  function disc(x, mat, edge) { const pts = ringPts(x, -0.03, 48); const pos = [x, sec(x)[1] / 2 + sec(x)[2] / 2, 0]; pts.forEach((p) => pos.push(p.x, p.y, p.z)); const idx = []; for (let i = 1; i < pts.length; i++) idx.push(0, i, i + 1 > pts.length - 1 ? 1 : i + 1);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, mat); m.renderOrder = 3; grp.add(m); if (edge) polyLine(pts, edge); return m; }
  const anchors = {};
  // Truss: four longerons at the corners of a box section, verticals + horizontals at each station, diagonals in every bay.
  function buildTruss() {
    const ST = [XF, 1.6, -0.6, -3.0, -5.4, -7.8, -10.2, -12.6, -15.0, -17.0];
    const C = (x, up, sd) => { const [w, yb, yt] = sec(x), yc = (yb + yt) / 2, hh = (yt - yb) / 2; const ytop = x > -6 ? Math.min(yt - 0.35, yc + hh * 0.62) : yc + hh * 0.7; return V(x, up ? ytop : yb + hh * 0.16, sd * w * 0.86); };
    const R = 0.075, r = 0.055;
    for (const up of [1, 0]) for (const sd of [1, -1]) for (let i = 0; i < ST.length - 1; i++) rod(C(ST[i], up, sd), C(ST[i + 1], up, sd), R, focusMat);
    ST.forEach((x, i) => { for (const sd of [1, -1]) rod(C(x, 0, sd), C(x, 1, sd), r, focusMat); for (const up of [1, 0]) rod(C(x, up, -1), C(x, up, 1), r, focusMat);
      if (i < ST.length - 1) { const u = ST[i + 1], a = i % 2 === 0; for (const sd of [1, -1]) rod(a ? C(x, 0, sd) : C(x, 1, sd), a ? C(u, 1, sd) : C(u, 0, sd), r, focusMat);
        rod(C(x, 1, a ? -1 : 1), C(u, 1, a ? 1 : -1), r * 0.9, focusMat); rod(C(x, 0, a ? 1 : -1), C(u, 0, a ? -1 : 1), r * 0.9, focusMat); } });
    // formers over the top (turtle deck) and a few stringers: they only shape the fabric
    [-5.4, -7.8, -10.2, -12.6, -15.0].forEach((x) => tube(ringPts(x, -0.06, 24, Math.PI * 0.12, Math.PI * 0.88), 0.03, grayMat));
    [0.25, 0.5, 0.75].forEach((t) => tube(range(-5.4, -16.6, 10).map((x) => surf(x, Math.PI * (0.12 + 0.76 * t), -0.06)), 0.025, grayMat));
    skin(skinMat(INK, 0.025, 0.26)); windows(0.42);
    const s3 = [ST[3], ST[4]]; anchors.lon = C(0.5, 1, -1); anchors.dia = C(s3[0], 0, -1).lerp(C(s3[1], 1, -1), 0.5); anchors.vert = C(-10.2, 0, -1).lerp(C(-10.2, 1, -1), 0.4); anchors.fab = surf(-12.0, Math.PI * 0.55, 0);
  }
  function buildMono(dent) {
    disc(XF, new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }), lineMat(INK, 0.6));
    [1.4, -1.6, -4.2, -6.6, -9.0, -11.4, -13.8, -16.0].forEach((x) => tube(ringPts(x, -0.06), 0.035, grayMat, true));
    skin(skinMat(ACC, dent ? 0.045 : 0.06, dent ? 0.6 : 0.8), { dent }); windows(0.5);
    // skin seams so the shell reads as one surface
    anchors.skin = surf(-2.4, Math.PI * 0.62, 0); anchors.form = surf(-11.4, Math.PI * 1.25, -0.06); anchors.bulk = surf(XF, Math.PI * 0.9, -0.1).lerp(V(XF, 4.2, 0), 0.35);
    if (dent) { // dent outline + buckle lines on the skin
      const m = lineMat(INK, 0.95), rim = range(0, 2 * Math.PI, 40).map((a) => surf(DENT.x + 1.25 * DENT.dx * Math.cos(a), DENT.th + 1.25 * DENT.dt * Math.sin(a), -0.42 * Math.exp(-1.56) + 0.02)); polyLine(rim, m);
      const core = range(0, 2 * Math.PI, 30).map((a) => surf(DENT.x + 0.55 * DENT.dx * Math.cos(a), DENT.th + 0.55 * DENT.dt * Math.sin(a), -0.42 * Math.exp(-0.3) + 0.02)); polyLine(core, lineMat(INK, 0.6));
      for (const a of [0.5, 2.2, 3.7, 5.4]) polyLine(range(1.3, 2.4, 4).map((k) => surf(DENT.x + k * DENT.dx * Math.cos(a), DENT.th + k * DENT.dt * Math.sin(a), 0.02)), lineMat(INK, 0.55)); }
    anchors.dent = surf(DENT.x, DENT.th, -0.4);
  }
  function buildSemi() {
    disc(XF, new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }), lineMat(ACC, 0.9));
    const FR = range(1.6, -16.4, 12);
    FR.forEach((x) => tube(ringPts(x, -0.07), 0.04, focusMat, true));
    const NS = 18; for (let j = 0; j < NS; j++) { const th = TH(j + 0.5, NS); tube(range(XF, XT + 0.4, 20).map((x) => surf(x, th, -0.1)), 0.022, focusThin); }
    const LONG = [Math.PI * 0.5 - 0.62, Math.PI * 0.5 + 0.62, -Math.PI * 0.5 + 0.62, -Math.PI * 0.5 - 0.62];   // four heavy longerons near the corners
    LONG.forEach((th) => tube(range(XF, XT + 0.4, 24).map((x) => surf(x, th, -0.12)), 0.07, focusMat));
    skin(skinMat(ACC, 0.05, 0.7), { cut: true }); windows(0.5);
    // cut edge of the skin, drawn in the accent
    const e = [], m = lineMat(ACC, 0.95), tA = CUT.t0, tB = CUT.t1;
    range(CUT.x0, CUT.x1, 30).forEach((x) => e.push(surf(x, tA, 0.01))); range(tA, tB, 16).forEach((t) => e.push(surf(CUT.x1, t, 0.01)));
    range(CUT.x1, CUT.x0, 30).forEach((x) => e.push(surf(x, tB, 0.01))); range(tB, tA, 16).forEach((t) => e.push(surf(CUT.x0, t, 0.01))); polyLine(e, m);
    anchors.skin = surf(-0.6, Math.PI * 0.56, 0); anchors.form = surf(FR[8], Math.PI + 0.6, -0.07); anchors.str = surf(-11.0, TH(9.5, NS), -0.1); anchors.lon = surf(-4.0, LONG[3] + 2 * Math.PI, -0.12);
  }

  // ---------- labels: a row along the top and a row along the bottom of the stage, each label sitting over (or under) its part ----------
  // Row is chosen once per type (by where the part is on screen); along the row each label follows its part as you turn the
  // airplane and neighbours push apart, so labels never overlap each other. Leader lines are drawn in SVG under the labels.
  const ov = s("svg", { class: "fus-lead", "aria-hidden": "true" }); stage.append(ov);
  let cur = [];
  const tmp = new THREE.Vector3();
  const proj = (p) => { tmp.copy(p).project(camera); const r = stage.getBoundingClientRect(); return [(tmp.x * 0.5 + 0.5) * r.width, (-tmp.y * 0.5 + 0.5) * r.height]; };
  function setLabels(list) {
    ov.innerHTML = ""; cur.forEach((c) => c.e.remove());
    const r = stage.getBoundingClientRect();
    cur = list.map((L) => { const an = L[3] && anchors[L[3]] ? anchors[L[3]] : null; const e = h("div", { class: "fus-lab" + (L[2] ? "" : " dim") }); e.innerHTML = `<b>${L[0]}</b><span>${L[1]}</span>`; stage.append(e);
      let line = null, dot = null; if (an) { line = s("line", { class: L[2] ? "on" : "" }, ov); dot = s("circle", { r: 3.6, class: L[2] ? "on" : "" }, ov); }
      return { e, an, line, dot, w: 0, hgt: 0, top: true, x: 0 }; });
    cur.forEach((c, i) => { c.top = list[i][4] !== "b"; c.w = c.e.offsetWidth; c.hgt = c.e.offsetHeight; });
    place();
  }
  function place() { if (!cur.length) return; const r = stage.getBoundingClientRect(), pad = r.width < 500 ? 8 : 16, gap = 10;
    for (const top of [true, false]) { const row = cur.filter((c) => c.top === top);
      row.forEach((c) => { c.ax = c.an ? proj(c.an) : null; c.x = c.ax ? c.ax[0] - c.w / 2 : r.width - pad - c.w; });
      row.sort((a, b) => a.x - b.x);
      // push apart left -> right, then pull back inside the stage right -> left
      let edge = pad; row.forEach((c) => { c.x = Math.max(c.x, edge); edge = c.x + c.w + gap; });
      edge = r.width - pad; for (let i = row.length - 1; i >= 0; i--) { const c = row[i]; c.x = Math.min(c.x, edge - c.w); edge = c.x - gap; }
      row.forEach((c) => { c.x = Math.max(pad, c.x); const y = top ? pad : r.height - pad - c.hgt; c.e.style.left = c.x.toFixed(1) + "px"; c.e.style.top = y.toFixed(1) + "px"; c.e.classList.toggle("ra", false);
        if (c.ax) { const sx = clamp(c.ax[0], c.x + 6, c.x + c.w - 6), sy = top ? y + c.hgt + 2 : y - 2;
          c.line.setAttribute("x1", sx.toFixed(1)); c.line.setAttribute("y1", sy.toFixed(1)); c.line.setAttribute("x2", c.ax[0].toFixed(1)); c.line.setAttribute("y2", c.ax[1].toFixed(1));
          c.dot.setAttribute("cx", c.ax[0].toFixed(1)); c.dot.setAttribute("cy", c.ax[1].toFixed(1)); } }); } }

  // ---------- camera: orbit around the fuselage, distance fitted so the whole airplane is always in frame ----------
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = !reduced(); controls.dampingFactor = 0.08; controls.enablePan = false; controls.enableZoom = false; controls.rotateSpeed = 0.7;
  controls.minPolarAngle = 20 * D; controls.maxPolarAngle = 150 * D; controls.target.set(...VIEW.tg);
  // extremes of the visible airplane: spinner, prop tips, fin and rudder, stabilizer tips, cut wing ends, wheels
  const BOX = [V(8.1, 4.12, 0), V(7.4, 7.3, 0), V(7.4, 0.95, 0), V(7.4, 4.12, 3.17), V(7.4, 4.12, -3.17), V(-17.0, 8.9, 0), V(-18.6, 8.9, 0), V(-19.15, 5.0, 0), V(-15.0, 4.62, 5.67), V(-16.4, 4.62, 5.67), V(-17.5, 4.62, 5.67), V(-15.0, 4.62, -5.67), V(-17.5, 4.62, -5.67),
    V(1.6, 6.85, WCUT), V(-3.75, 6.85, WCUT), V(1.6, 6.85, -WCUT), V(-3.75, 6.85, -WCUT), V(-1.2, 0, 4.4), V(-1.2, 0, -4.4), V(4.2, 0, 0), V(-0.3, 0.2, 4.4), V(-0.3, 0.2, -4.4)];
  let FX = 0.9, FY = 0.72;
  function fit(az, el) { const r = stage.getBoundingClientRect(); FY = 1 - 2 * Math.min(0.2, (r.width < 500 ? 46 : 56) / Math.max(1, r.height)); FX = r.width < 500 ? 0.96 : 0.9; const dir = V(Math.cos(el * D) * Math.cos(az * D), Math.sin(el * D), Math.cos(el * D) * Math.sin(az * D)); let lo = 8, hi = 200;
    for (let k = 0; k < 26; k++) { const d = (lo + hi) / 2; camera.position.copy(controls.target).addScaledVector(dir, d); camera.lookAt(controls.target); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      const ok = BOX.every((p) => { tmp.copy(p).project(camera); return Math.abs(tmp.x) < FX && tmp.y < FY && tmp.y > -FY && tmp.z < 1; }); if (ok) hi = d; else lo = d; }
    camera.position.copy(controls.target).addScaledVector(dir, hi); camera.lookAt(controls.target); }
  const curAngles = () => { const o = camera.position.clone().sub(controls.target); const d = o.length(); return [Math.atan2(o.z, o.x) / D, Math.asin(clamp(o.y / d, -1, 1)) / D]; };
  let raf = 0, alive = true, visible = true, until = 0, sweep = null;
  function frameFn(now) { raf = 0; if (!alive) return; controls.update();
    if (sweep) { const k = clamp((now - sweep) / 1100, 0, 1), e = 1 - (1 - k) ** 3; reveal.constant = -(XF + 0.6 + (XT - 1 - XF - 0.6) * e); if (k >= 1) { sweep = null; reveal.constant = 99; } }
    renderer.render(scene, camera); stage.dataset.calls = renderer.info.render.calls; place(); if (now < until || sweep) raf = requestAnimationFrame(frameFn); }
  function kick(ms = 500) { until = Math.max(until, performance.now() + ms); if (!raf && alive && visible) raf = requestAnimationFrame(frameFn); }
  controls.addEventListener("change", () => kick(600)); controls.addEventListener("start", () => kick(2000));
  let lastW = 0;
  function resize() { const r = stage.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    const [az, el] = lastW ? curAngles() : [VIEW.az, VIEW.el]; fit(az, el); const first = !lastW; lastW = r.width; if (first) draw(true); else relabel(); kick(); }
  const ro = new ResizeObserver(resize); ro.observe(stage);
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }); io.observe(stage);

  let type = "truss", dent = false;
  function relabel() { const L = LABELS[type].slice(); if (type === "mono" && dent) L[3] = DENT_LABEL; setLabels(L); }
  function clear() { grp.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.isShaderMaterial) o.material.dispose(); }); grp.clear(); Object.keys(anchors).forEach((k) => delete anchors[k]); }
  function draw(animate = true) { clear();
    ({ truss: buildTruss, mono: () => buildMono(dent), semi: buildSemi })[type]();
    if (animate && !reduced() && type !== "mono") { sweep = performance.now(); reveal.constant = -(XF + 0.6); } else { sweep = null; reveal.constant = 99; }
    stage.dataset.type = type; relabel(); const T = TYPES[type]; F.caption(T.load, T.big); F.explain(`<p>${T.text} <span class="dim">Drag the airplane to turn it.</span></p>`);
    dentChip.el.style.display = type === "mono" ? "" : "none"; kick(1400); }
  chips(F.ctrl, [["truss", "Truss"], ["mono", "Monocoque"], ["semi", "Semimonocoque"]], type, (v) => { if (!v) return; type = v; dent = false; dentChip.set(null); draw(); }, { label: "Construction type" });
  const dentChip = chips(F.ctrl, [["dent", "Show a dent"]], null, (v) => { dent = v === "dent"; draw(false); }, { label: "Dent", toggle: true });
  dentChip.el.style.display = "none";
  F.caption(TYPES.truss.load, TYPES.truss.big);
  F.on(() => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); clear(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); });
  return { destroy() { F.destroy(); } };
}
