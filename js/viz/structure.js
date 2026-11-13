// Fuselage construction in 3D: truss, monocoque, semimonocoque (PHAK FAA-H-8083-25C Ch 3; AMT Airframe FAA-H-8083-31 Ch 1).
// A light high-wing airplane in 3/4 view (drag to turn it). The cowling, tail, gear and prop are solid context in thin ink;
// the wings are ghosted and cut off near the root so the fuselage stays the focus. Only the fuselage structure changes:
// blue = carries the load, gray = shape / covering only. Labels sit in the four corners of the stage (never over each other)
// with leader lines to the part they name.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildPlane } from "./c172-model.js?v=3bad3dc1c8";
import { buildClassic } from "./classic-models.js?v=3bad3dc1c8";
import { frame, chips } from "./base.js?v=3bad3dc1c8";
import { h, s, reduced, clamp } from "../core/util.js?v=3bad3dc1c8";

const ACC = 0x3b82f6, INK = 0xf2f1ec, BG = 0x0a0a0b, D = Math.PI / 180;
const TYPES = {
  truss: { big: "Truss", ex: "Piper J-3 Cub", load: "The tube frame carries the load",
    text: "<b>What carries the load:</b> the welded steel-tube frame. Lengthwise tubes called <b>longerons</b> are tied together by vertical and horizontal struts, and <b>diagonal</b> struts make triangles so the frame resists loads from any direction. <b>Formers</b> and <b>stringers</b> only shape the <b>fabric covering</b>, which carries no structural load. Strong, but not streamlined: seen end-on the frame is square or rectangular. Older and simpler designs. <span class=\"src\">PHAK 3 · AMT Airframe 1</span>" },
  mono: { big: "Monocoque", ex: "Lockheed Vega", load: "The skin alone carries the load",
    text: "<b>What carries the load:</b> the skin. Monocoque means “single shell”: a <b>stressed skin</b> supports almost all the loads, like an aluminum beverage can. <b>Formers</b> and <b>bulkheads</b> only give the shape. There are no lengthwise members, so it cannot tolerate deformation: a small <b>dent</b> lets the shell collapse under load. Tap <b>Show a dent</b>. <span class=\"src\">PHAK 3 · AMT Airframe 1</span>" },
  semi: { big: "Semimonocoque", ex: "Cessna 172", load: "Skin and substructure share the load",
    text: "<b>What carries the load:</b> both. <b>Bulkheads</b> and <b>formers</b> give the shape; heavy <b>longerons</b> and lighter, more numerous <b>stringers</b> run lengthwise between them; the stressed <b>skin</b> is riveted to all of it. The substructure takes some of the bending, so a dent is no longer critical. Most modern airplanes use it, including the 172. Part of the skin is cut away here to show the inside. <span class=\"src\">PHAK 3 · AMT Airframe 1 · C172S POH Sec 7</span>" },
};
// Labels on the drawing per type: [title, subtitle, focus?, part key (tap to isolate; null = not a part), row "t" top / "b" bottom]
const LABELS = {
  truss: [["LONGERON", "main lengthwise tube", true, "lon", "t"], ["FABRIC COVERING", "carries no load", false, "fab", "t"], ["DIAGONAL", "makes triangles", true, "dia", "b"], ["STRUT", "ties the longerons", true, "strut", "b"]],
  mono: [["STRESSED SKIN", "carries the load", true, "skin", "t"], ["NO STRINGERS", "or longerons", false, null, "t"], ["BULKHEAD", "shape only", false, "bulk", "b"], ["FORMER", "shape only", false, "form", "b"]],
  semi: [["SKIN", "shares the load", true, "skin", "t"], ["STRINGER", "light, many", true, "str", "t"], ["LONGERON", "heavy, lengthwise", true, "lon", "b"], ["FORMER", "ring frame", true, "form", "b"]],
};
// Parts per type: [key, chip name, one-line description] (PHAK 3 · AMT Airframe 1). Tapping a label or chip isolates the part.
const PARTS = {
  truss: [["lon", "Longerons", "The main lengthwise members: four steel tubes at the corners of the frame. With the struts and diagonals they carry the loads."],
    ["strut", "Struts", "Vertical and horizontal struts tie the longerons together at each station, dividing the frame into bays."],
    ["dia", "Diagonals", "Diagonal struts brace every bay into triangles, so the frame resists loads from any direction."],
    ["shape", "Formers & stringers", "Light formers and stringers over the frame give the fabric its rounded shape. They carry no structural load."],
    ["fab", "Fabric covering", "Fabric stretched over the frame and formers. It makes the shape smooth but carries no structural load."]],
  mono: [["skin", "Stressed skin", "The shell itself carries nearly all the loads, like an aluminum can. With nothing lengthwise to back it up, a dent can let it buckle."],
    ["form", "Formers", "Ring frames that give the fuselage its cross-section shape. In a monocoque they carry no main loads."],
    ["bulk", "Bulkhead", "A former that is also a wall across the fuselage. The firewall is the bulkhead between the engine and the cabin."]],
  semi: [["skin", "Skin", "Stressed skin riveted to the formers, stringers and longerons. It shares the loads with them."],
    ["lon", "Longerons", "Heavy lengthwise members, usually four. Together with the skin they carry most of the bending loads."],
    ["str", "Stringers", "Lighter, more numerous lengthwise members. They stiffen the skin, help it keep its shape and carry some of the load."],
    ["form", "Formers", "Ring frames spaced along the fuselage. They give the shape and tie the stringers and longerons together."],
    ["bulk", "Bulkhead", "A former that is also a wall across the fuselage, like the firewall between the engine and the cabin."]],
};
const ALL_DESC = "Blue carries the load. Tap a label or a part to see it on its own.";
const DENT_LABEL = ["DENT", "shell can buckle", true, "dent", "t"];
const VIEW = { az: -62, el: 20, tg: [-5.2, 4.3, 0] };

export function mount(host) {
  const F = frame(host, { cls: "tall capin fus3d" });
  const stage = F.stage;
  const canvas = document.createElement("canvas"); stage.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));   // retina/iPad: 1.5x + MSAA looks the same and fills ~45% fewer pixels than 2x
  renderer.setClearColor(BG, 1); renderer.localClippingEnabled = true; renderer.debug.checkShaderErrors = false;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 500);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1)); const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(14, 22, -18); scene.add(sun);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- context airplane (shared C172S geometry from the parts explorer) ----------
  // Each construction type is shown on an airplane actually built that way: Truss = Piper J-3 Cub, Monocoque = Lockheed Vega,
  // Semimonocoque = the 172. All three are built once at mount (4-8 draw calls each); only the current one is visible.
  const P = buildPlane(THREE); scene.add(P.root); P.root.updateMatrixWorld(true);
  const WCUT = 8.75;
  const CUB = buildClassic(THREE, "cub", { WCUT }), VEGA = buildClassic(THREE, "vega", { WCUT }); scene.add(CUB.root, VEGA.root);
  VEGA.root.position.y += 1.1; VEGA.root.updateMatrixWorld(true); CUB.root.updateMatrixWorld(true);   // the Vega sits a little higher so its wheel pants stay clear of the dent button when orbited
  const MODELS = { truss: { m: CUB, root: CUB.root, surf: CUB.surf, sec: CUB.sec, XF: CUB.XF, XT: CUB.XT },
    mono: { m: VEGA, root: VEGA.root, surf: VEGA.surf, sec: VEGA.sec, XF: VEGA.XF, XT: VEGA.XT }, semi: { m: null, root: P.root, surf: P.surf, sec: P.sec, XF: 3.62, XT: -17.3 } };
  let surf = P.surf, sec = P.sec, XF = 3.62, XT = -17.3;   // firewall, tail-cone end of the current model (local coords)
  const clipW = [new THREE.Plane(V(0, 0, -1), WCUT), new THREE.Plane(V(0, 0, 1), WCUT)];
  const inkMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.4 });
  const wingInk = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.3, clippingPlanes: clipW });
  const HIDE = new Set(["fuselage", "fairing", "engine", "fuel", "propDim", "ailerons"]), GHOST = new Set(["wing", "flaps", "struts"]);
  for (const [name, part] of Object.entries(P.parts)) part.subs.forEach((sb) => {
    sb.obj.traverse((o) => { if (o.isMesh && o.userData.part === name) o.visible = !HIDE.has(name) && !GHOST.has(name); });
    if (!HIDE.has(name) && sb.segs.length) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(sb.segs, 3)); sb.obj.add(new THREE.LineSegments(g, GHOST.has(name) ? wingInk : inkMat)); } });
  // ---------- fuselage pieces (rebuilt for each type) ----------
  // Performance: every member of one part type (all longerons, all diagonals, ...) is merged into ONE mesh with its own
  // material, so a whole mode draws in a handful of calls and isolating a part is a material colour swap, not a rebuild.
  const grp = new THREE.Group(); scene.add(grp);   // takes the current model's transform (the Cub and Vega sit on their tailwheels)
  const RN = new THREE.Vector3(); let RK = 0;   // reveal plane in world space for the current model: normal RN, local x -> constant offset RK
  const skinMat = (color, base, rim) => new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: base }, uF: { value: rim } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 uC; uniform float uA; uniform float uF; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uC, clamp(uA + uF * pow(f, 2.4), 0.0, 1.0)); }" });
  const reveal = new THREE.Plane(V(1, 0, 0), 99);   // sweeps nose -> tail when a type is chosen (the point-of-light draw-on, in 3D)
  // member looks: blue = carries the load, gray = shape only, white = the rest of the structure while one part is isolated
  const LOOK = { blue: [ACC, 0x0c2c6e], thin: [0x5f9bf8, 0x0a2050], gray: [0x7c7b77, 0x1a1a1a], white: [0xb9b8b2, 0x262624] };
  const lineMat = (c, o) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o });
  const mats = [];   // every material made for the current mode (disposed with it)
  const M = (m) => (mats.push(m), m);
  // geometry buckets: key -> { geos, look }, merged into one mesh per key in finish()
  let buckets = {}; const parts = {};   // parts[key] = { meshes: [...], set(state) }   state: "def" | "on" | "off"
  const put = (key, look, g) => { (buckets[key] ||= { look, geos: [] }).geos.push(g); };
  function merge(geos) { let nv = 0, ni = 0; geos.forEach((g) => { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = new (nv > 65535 ? Uint32Array : Uint16Array)(ni); let ov = 0, oi = 0;
    geos.forEach((g) => { const n = g.attributes.position.count; pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3);
      if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) idx[oi + i] = a[i] + ov; oi += a.length; } else { for (let i = 0; i < n; i++) idx[oi + i] = ov + i; oi += n; } ov += n; g.dispose(); });
    const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1)); return out; }
  function addPart(key, objs, set) { const p = (parts[key] ||= { objs: [], sets: [] }); p.objs.push(...objs); p.sets.push(set); }
  function finish() { for (const [key, b] of Object.entries(buckets)) { const def = LOOK[b.look];
      const mat = M(new THREE.MeshLambertMaterial({ color: def[0], emissive: def[1], clippingPlanes: [reveal] })); const mesh = new THREE.Mesh(merge(b.geos), mat); grp.add(mesh);
      addPart(key, [mesh], (st) => { const c = st === "def" ? def : st === "on" ? LOOK.blue : LOOK.white; mat.color.setHex(c[0]); mat.emissive.setHex(c[1]); }); }
    buckets = {}; }
  const rod = (key, look, a, b, r) => { const L = a.distanceTo(b); if (L < 1e-4) return; const g = new THREE.CylinderGeometry(r, r, L, 8, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); put(key, look, g);
    const j = new THREE.SphereGeometry(r * 1.15, 8, 5); j.translate(a.x, a.y, a.z); put(key, look, j); };
  const tube = (key, look, pts, r, closed = false) => put(key, look, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), closed ? 72 : 48, r, 6, closed));
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  const TH = (j, n) => -Math.PI / 2 + (2 * Math.PI * j) / n;
  const angd = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  // near side faces the default camera (z < 0): th = PI on that side, PI/2 = top, -PI/2 = bottom
  const DENT = { x: -6.9, th: Math.PI - 0.1, dx: 0.95, dt: 0.3 };   // on the Vega's shell, behind the cabin
  const CUT = { x0: 0.9, x1: -12.6, t0: Math.PI - 1.15, t1: Math.PI + 0.95 };
  const inCut = (x, th) => x <= CUT.x0 && x >= CUT.x1 && angd(th, Math.PI) >= CUT.t0 - Math.PI && angd(th, Math.PI) <= CUT.t1 - Math.PI;
  // skin: [base, rim] for default / isolated / dimmed (white)
  // on / dim: [colour, fill, rim] when this part is isolated / another part is. The fill is a uniform alpha so a skin still reads face-on (side view), the rim draws its silhouette.
  function skin(key, color, look, { cut = false, dent = false, off = 0, on = [ACC, 0.06, 0.8], dim = [INK, 0.02, 0.2] } = {}) {
    const NX = 56, NT = 56, pos = [], idx = [];
    for (let i = 0; i <= NX; i++) { const x = XF + ((XT - XF) * i) / NX; for (let j = 0; j <= NT; j++) { const th = TH(j, NT);
      let o = off; if (dent) { const dx = x - DENT.x, dt = angd(th, DENT.th); o -= 0.42 * Math.exp(-((dx / DENT.dx) ** 2) - ((dt / DENT.dt) ** 2)); }
      const p = surf(x, th, o); pos.push(p.x, p.y, p.z); } }
    for (let i = 0; i < NX; i++) for (let j = 0; j < NT; j++) { const xm = XF + ((XT - XF) * (i + 0.5)) / NX, tm = TH(j + 0.5, NT); if (cut && inCut(xm, tm)) continue;
      const a = i * (NT + 1) + j, b = a + 1, c = a + NT + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const mat = M(skinMat(color, look[0], look[1])); const m = new THREE.Mesh(g, mat); m.renderOrder = 4; grp.add(m);
    addPart(key, [m], (st) => { const [c, a, f] = st === "def" ? [color, look[0], look[1]] : st === "on" ? on : dim; mat.uniforms.uC.value.setHex(c); mat.uniforms.uA.value = a; mat.uniforms.uF.value = f; });
    return m; }
  const ringPts = (x, off = -0.02, n = 72, t0 = 0, t1 = Math.PI * 2) => range(t0, t1, n).map((t) => surf(x, -Math.PI / 2 + t, off));
  // all polylines that share one material go into one LineSegments
  const lineBuckets = new Map();
  const polyLine = (pts, mat) => { let a = lineBuckets.get(mat); if (!a) lineBuckets.set(mat, (a = [])); for (let i = 0; i + 1 < pts.length; i++) a.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z); return mat; };
  function flushLines() { for (const [mat, a] of lineBuckets) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3)); const l = new THREE.LineSegments(g, mat); l.renderOrder = 5; grp.add(l); } lineBuckets.clear(); }
  function windows(o = 0.5) { const m = M(lineMat(INK, o)), T = (t, sd) => (sd > 0 ? t : Math.PI - t);
    const win = (x0, x1, t0, t1, sd) => { const pts = []; range(x0, x1, 8).forEach((x) => pts.push(surf(x, T(t0, sd), 0.02))); range(t0, t1, 4).forEach((t) => pts.push(surf(x1, T(t, sd), 0.02)));
      range(x1, x0, 8).forEach((x) => pts.push(surf(x, T(t1, sd), 0.02))); range(t1, t0, 4).forEach((t) => pts.push(surf(x0, T(t, sd), 0.02))); polyLine(pts, m); };
    for (const sd of [1, -1]) { win(1.25, -1.55, 0.3, 1.05, sd); win(-1.8, -3.8, 0.3, 0.95, sd); }
    win(3.3, 1.5, 0.62, Math.PI - 0.62, 1); win(-3.85, -6.0, 1.0, Math.PI - 1.0, 1); }
  // firewall bulkhead: a filled disc + its rim line; def = [colour, fill opacity, rim opacity]
  function disc(key, x, def) { const pts = ringPts(x, -0.03, 48); const pos = [x, sec(x)[1] / 2 + sec(x)[2] / 2, 0]; pts.forEach((p) => pos.push(p.x, p.y, p.z)); const idx = []; for (let i = 1; i < pts.length; i++) idx.push(0, i, i + 1 > pts.length - 1 ? 1 : i + 1);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const fm = M(new THREE.MeshBasicMaterial({ color: def[0], transparent: true, opacity: def[1], side: THREE.DoubleSide, depthWrite: false })), m = new THREE.Mesh(g, fm); m.renderOrder = 3; grp.add(m);
    const lm = M(lineMat(def[0], def[2])); polyLine(pts, lm);
    addPart(key, [m], (st) => { const [c, a, b] = st === "def" ? def : st === "on" ? [ACC, 0.16, 0.95] : [INK, 0.08, 0.5]; fm.color.setHex(c); fm.opacity = a; lm.color.setHex(c); lm.opacity = b; }); }
  const anchors = {};
  // Truss: four longerons at the corners of a box section, verticals + horizontals at each station, diagonals in every bay.
  function buildTruss() {
    const ST = range(XF, XT + 0.3, 9);   // ten stations, nine bays (J-3 Cub: welded 4130 steel tube)
    const C = (x, up, sd) => { const [w, yb, yt] = sec(x), yc = (yb + yt) / 2, hh = (yt - yb) / 2; const ytop = x > XF - 7 ? Math.min(yt - 0.35, yc + hh * 0.62) : yc + hh * 0.7; return V(x, up ? ytop : yb + hh * 0.16, sd * w * 0.86); };
    const R = 0.075, r = 0.055;
    for (const up of [1, 0]) for (const sd of [1, -1]) for (let i = 0; i < ST.length - 1; i++) rod("lon", "blue", C(ST[i], up, sd), C(ST[i + 1], up, sd), R);
    ST.forEach((x, i) => { for (const sd of [1, -1]) rod("strut", "blue", C(x, 0, sd), C(x, 1, sd), r); for (const up of [1, 0]) rod("strut", "blue", C(x, up, -1), C(x, up, 1), r);
      if (i < ST.length - 1) { const u = ST[i + 1], a = i % 2 === 0; for (const sd of [1, -1]) rod("dia", "blue", a ? C(x, 0, sd) : C(x, 1, sd), a ? C(u, 1, sd) : C(u, 0, sd), r);
        rod("dia", "blue", C(x, 1, a ? -1 : 1), C(u, 1, a ? 1 : -1), r * 0.9); rod("dia", "blue", C(x, 0, a ? 1 : -1), C(u, 0, a ? -1 : 1), r * 0.9); } });
    // formers over the top (turtle deck) and a few stringers: they only shape the fabric
    ST.slice(4, 9).forEach((x) => tube("shape", "gray", ringPts(x, -0.06, 24, Math.PI * 0.12, Math.PI * 0.88), 0.03));
    [0.25, 0.5, 0.75].forEach((t) => tube("shape", "gray", range(ST[4], XT + 0.6, 10).map((x) => surf(x, Math.PI * (0.12 + 0.76 * t), -0.06)), 0.025));
    // fabric: a soft veil with a rim silhouette, plus rib-stitch rows at each station and tapes along the seams, so its surface reads side-on too
    skin("fab", INK, [0.05, 0.3], { on: [ACC, 0.24, 0.9], dim: [INK, 0.015, 0.14] });
    const fl = M(lineMat(INK, 0.2)), fo = 0.025;
    ST.slice(1, -1).forEach((x) => { const rg = range(0, Math.PI * 2, 64).map((t) => surf(x, t, fo)); for (let k = 0; k + 1 < rg.length; k += 2) polyLine([rg[k], rg[k + 1]], fl); });   // stitches
    [Math.PI * 0.5, Math.PI * 0.8, Math.PI, Math.PI * 1.25, -Math.PI * 0.5, Math.PI * 0.2, 0, -Math.PI * 0.25].forEach((t) => polyLine(range(XF - 0.1, XT + 0.2, 36).map((x) => surf(x, t, fo)), fl));   // tapes
    addPart("fab", [], (st) => { fl.color.setHex(st === "on" ? ACC : INK); fl.opacity = st === "def" ? 0.2 : st === "on" ? 0.8 : 0.07; });
    anchors.lon = C(XF - 2.6, 1, -1); anchors.dia = C(ST[3], 0, -1).lerp(C(ST[4], 1, -1), 0.5); anchors.strut = C(ST[6], 0, -1).lerp(C(ST[6], 1, -1), 0.4); anchors.fab = surf(ST[7] - 0.8, Math.PI * 0.55, 0);
  }
  function buildMono(dent) {
    disc("bulk", XF, [INK, 0.1, 0.6]);
    const FR = range(XF - 2.4, XT + 1.4, 7); FR.forEach((x) => tube("form", "gray", ringPts(x, -0.06), 0.035, true));
    skin("skin", ACC, dent ? [0.045, 0.6] : [0.06, 0.8], { dent, on: [ACC, 0.16, 0.9] });
    anchors.skin = surf(XF - 7.4, Math.PI * 0.62, 0); anchors.form = surf(FR[5], Math.PI * 1.25, -0.06); anchors.bulk = surf(XF, Math.PI * 0.9, -0.1).lerp(V(XF, 4.2, 0), 0.35);
    if (dent) { // dent outline + buckle lines on the skin
      const m = M(lineMat(INK, 0.95)), m2 = M(lineMat(INK, 0.6)), m3 = M(lineMat(INK, 0.55));
      polyLine(range(0, 2 * Math.PI, 40).map((a) => surf(DENT.x + 1.25 * DENT.dx * Math.cos(a), DENT.th + 1.25 * DENT.dt * Math.sin(a), -0.42 * Math.exp(-1.56) + 0.02)), m);
      polyLine(range(0, 2 * Math.PI, 30).map((a) => surf(DENT.x + 0.55 * DENT.dx * Math.cos(a), DENT.th + 0.55 * DENT.dt * Math.sin(a), -0.42 * Math.exp(-0.3) + 0.02)), m2);
      for (const a of [0.5, 2.2, 3.7, 5.4]) polyLine(range(1.3, 2.4, 4).map((k) => surf(DENT.x + k * DENT.dx * Math.cos(a), DENT.th + k * DENT.dt * Math.sin(a), 0.02)), m3); }
    anchors.dent = surf(DENT.x, DENT.th, -0.4);
  }
  function buildSemi() {
    disc("bulk", XF, [ACC, 0.12, 0.9]);
    const FR = range(1.6, -16.4, 12);
    FR.forEach((x) => tube("form", "blue", ringPts(x, -0.07), 0.04, true));
    const NS = 18; for (let j = 0; j < NS; j++) { const th = TH(j + 0.5, NS); tube("str", "thin", range(XF, XT + 0.4, 20).map((x) => surf(x, th, -0.1)), 0.022); }
    const LONG = [Math.PI * 0.5 - 0.62, Math.PI * 0.5 + 0.62, -Math.PI * 0.5 + 0.62, -Math.PI * 0.5 - 0.62];   // four heavy longerons near the corners
    LONG.forEach((th) => tube("lon", "blue", range(XF, XT + 0.4, 24).map((x) => surf(x, th, -0.12)), 0.07));
    skin("skin", ACC, [0.05, 0.7], { cut: true, on: [ACC, 0.16, 0.9] }); windows(0.5);
    // cut edge of the skin, drawn in the accent (part of the skin)
    const e = [], m = M(lineMat(ACC, 0.95)), tA = CUT.t0, tB = CUT.t1;
    range(CUT.x0, CUT.x1, 30).forEach((x) => e.push(surf(x, tA, 0.01))); range(tA, tB, 16).forEach((t) => e.push(surf(CUT.x1, t, 0.01)));
    range(CUT.x1, CUT.x0, 30).forEach((x) => e.push(surf(x, tB, 0.01))); range(tB, tA, 16).forEach((t) => e.push(surf(CUT.x0, t, 0.01))); polyLine(e, m);
    addPart("skin", [], (st) => { m.color.setHex(st === "off" ? INK : ACC); m.opacity = st === "off" ? 0.45 : 0.95; });
    anchors.skin = surf(-0.6, Math.PI * 0.56, 0); anchors.form = surf(FR[8], Math.PI + 0.6, -0.07); anchors.str = surf(-11.0, TH(9.5, NS), -0.1); anchors.lon = surf(-4.0, LONG[3] + 2 * Math.PI, -0.12);
  }

  // ---------- labels: a row along the top and a row along the bottom of the stage, each label sitting over (or under) its part ----------
  // Along the row each label follows its part as you turn the airplane and neighbours push apart, so labels never overlap each other.
  // Leader lines are drawn in SVG under the labels. Labels that name a part are buttons: tap to isolate that part.
  const ov = s("svg", { class: "fus-lead", "aria-hidden": "true" }); stage.append(ov);
  let cur = [], SW = 1, SH = 1;   // stage size, cached at resize (no layout reads per frame)
  const tmp = new THREE.Vector3();
  const proj = (p, out) => { tmp.copy(p).project(camera); out[0] = (tmp.x * 0.5 + 0.5) * SW; out[1] = (-tmp.y * 0.5 + 0.5) * SH; return out; };   // writes into out (no per-frame allocation)
  let rowT = [], rowB = []; const LL = [], RR = [];
  function setLabels(list) {
    ov.textContent = ""; cur.forEach((c) => c.e.remove());
    cur = list.map((L) => { const an = L[3] && anchors[L[3]] ? anchors[L[3]] : null, key = L[3] && parts[L[3]] ? L[3] : null;
      const e = h(key ? "button" : "div", { class: "fus-lab" + (L[2] ? "" : " dim") + (key ? " pick" : "") }); if (key) { e.type = "button"; e.dataset.k = key; e.setAttribute("aria-pressed", "false"); e.addEventListener("click", () => isolate(sel === key ? null : key)); }
      e.innerHTML = `<b>${L[0]}</b><span>${L[1]}</span>`; stage.insertBefore(e, stage.querySelector(".fus-dentbox"));   /* labels before the dent button in DOM order */
      let line = null, dot = null; if (an) { line = s("line", { class: L[2] ? "on" : "" }, ov); dot = s("circle", { r: 3.6, class: L[2] ? "on" : "" }, ov); }
      return { e, an, key, line, dot, w: 0, hgt: 0, top: true, x: 0, ax: an ? [0, 0] : null }; });
    cur.forEach((c, i) => { c.top = list[i][4] !== "b"; c.w = c.e.offsetWidth; c.hgt = c.e.offsetHeight; }); rowT = cur.filter((c) => c.top); rowB = cur.filter((c) => !c.top);
    markLabels(); place();
  }
  function markLabels() { cur.forEach((c) => { if (!c.key) return; const on = sel === c.key; c.e.classList.toggle("on", on); c.e.setAttribute("aria-pressed", on ? "true" : "false"); c.e.classList.toggle("off", !!sel && !on); }); }
  // keep a row inside [lo, hi]: push apart left -> right, then pull back inside right -> left
  function pack(row, lo, hi, gap) { let edge = lo; row.forEach((c) => { c.x = Math.max(c.x, edge); edge = c.x + c.w + gap; });
    edge = hi; for (let i = row.length - 1; i >= 0; i--) { const c = row[i]; c.x = Math.min(c.x, edge - c.w); edge = c.x - gap; } row.forEach((c) => { c.x = Math.max(lo, c.x); }); }
  function place() { if (!cur.length) return; const pad = SW < 500 ? 8 : 16, gap = 10;
    for (let ti = 0; ti < 2; ti++) { const top = ti === 0, row = top ? rowT : rowB;
      for (const c of row) { if (c.ax) proj(c.an, c.ax); c.x = c.ax ? c.ax[0] - c.w / 2 : SW - pad - c.w; }
      row.sort(byX);
      if (!top && dentOn()) { // the dent button owns the bottom-centre slot: labels split to its left and right, never over it
        const b0 = (SW - dentW) / 2 - gap, b1 = (SW + dentW) / 2 + gap, mid = SW / 2; LL.length = 0; RR.length = 0; for (const c of row) (c.x + c.w / 2 < mid ? LL : RR).push(c);
        const fits = (g, lo, hi) => { let a = -gap; for (const c of g) a += c.w + gap; return a <= hi - lo; };
        while (LL.length && !fits(LL, pad, b0)) RR.unshift(LL.pop()); while (RR.length && !fits(RR, b1, SW - pad)) LL.push(RR.shift());
        pack(LL, pad, b0, gap); pack(RR, b1, SW - pad, gap); }
      else pack(row, pad, SW - pad, gap);
      row.forEach((c) => { const y = top ? pad : SH - pad - c.hgt; c.e.style.transform = `translate(${c.x.toFixed(1)}px,${y.toFixed(1)}px)`;
        if (c.ax) { const sx = clamp(c.ax[0], c.x + 6, c.x + c.w - 6), sy = top ? y + c.hgt + 2 : y - 2;
          c.line.setAttribute("x1", sx.toFixed(1)); c.line.setAttribute("y1", sy.toFixed(1)); c.line.setAttribute("x2", c.ax[0].toFixed(1)); c.line.setAttribute("y2", c.ax[1].toFixed(1));
          c.dot.setAttribute("cx", c.ax[0].toFixed(1)); c.dot.setAttribute("cy", c.ax[1].toFixed(1)); } }); }
  }
  const byX = (a, b) => a.x - b.x;
  // test hook: on-screen bounds of the current airplane's extreme points [left, top, right, bottom] (never called per frame)
  // test hook: lowest point of the model's convex hull (stage px) over the x-range [x0,x1], so a control can be checked against the airplane's outline, not its bounding box
  stage.__under = (x0, x1) => { const P = (MB[type] || BOX).map((p) => { const o = [0, 0]; proj(p, o); return o; }).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const H = [];
    for (const p of P) { while (H.length > 1 && (H[H.length - 1][0] - H[H.length - 2][0]) * (p[1] - H[H.length - 2][1]) - (H[H.length - 1][1] - H[H.length - 2][1]) * (p[0] - H[H.length - 2][0]) >= 0) H.pop(); H.push(p); }
    let y = -1e9; for (let i = 0; i + 1 < H.length; i++) { const [ax, ay] = H[i], [bx, by] = H[i + 1]; const l = Math.max(ax, x0), r = Math.min(bx, x1); if (l > r) continue; for (const x of [l, r]) y = Math.max(y, bx === ax ? Math.max(ay, by) : ay + (by - ay) * (x - ax) / (bx - ax)); } return y; };
  stage.__mbox = () => { let t = 1e9, b = -1e9, l = 1e9, r = -1e9; const o = [0, 0]; (MB[type] || BOX).forEach((p) => { proj(p, o); t = Math.min(t, o[1]); b = Math.max(b, o[1]); l = Math.min(l, o[0]); r = Math.max(r, o[0]); }); return [l, t, r, b]; };

  // ---------- camera: orbit around the fuselage, distance fitted so the whole airplane is always in frame ----------
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = !reduced(); controls.dampingFactor = 0.08; controls.enablePan = false; controls.enableZoom = false; controls.rotateSpeed = 0.7;
  controls.minPolarAngle = 20 * D; controls.maxPolarAngle = 150 * D; controls.target.set(...VIEW.tg);
  // extremes of the visible airplane: spinner, prop tips, fin and rudder, stabilizer tips, cut wing ends, wheels
  const BOX = [V(8.1, 4.12, 0), V(7.4, 7.3, 0), V(7.4, 0.95, 0), V(7.4, 4.12, 3.17), V(7.4, 4.12, -3.17), V(-17.0, 8.9, 0), V(-18.6, 8.9, 0), V(-19.15, 5.0, 0), V(-15.0, 4.62, 5.67), V(-16.4, 4.62, 5.67), V(-17.5, 4.62, 5.67), V(-15.0, 4.62, -5.67), V(-17.5, 4.62, -5.67),
    V(1.6, 6.85, WCUT), V(-3.75, 6.85, WCUT), V(1.6, 6.85, -WCUT), V(-3.75, 6.85, -WCUT), V(-1.2, 0, 4.4), V(-1.2, 0, -4.4), V(4.2, 0, 0), V(-0.3, 0.2, 4.4), V(-0.3, 0.2, -4.4)];
  // per-model extremes in world space; the camera is fitted to all three at once, so switching type never moves or rescales the view
  const MB = { semi: BOX.slice(), truss: CUB.ext.map((p) => p.clone().applyMatrix4(CUB.root.matrixWorld)), mono: VEGA.ext.map((p) => p.clone().applyMatrix4(VEGA.root.matrixWorld)) };
  BOX.push(...MB.truss, ...MB.mono);
  let FX = 0.9, FY = 0.72;
  function fit(az, el) { FY = 1 - 2 * Math.min(0.2, (SW < 500 ? 46 : 56) / Math.max(1, SH)); FX = SW < 500 ? 0.96 : 0.9; const dir = V(Math.cos(el * D) * Math.cos(az * D), Math.sin(el * D), Math.cos(el * D) * Math.sin(az * D)); let lo = 8, hi = 200;
    // the bottom band (labels + the dent button) has to stay clear at every azimuth the user can drag to, so the distance is the worst case over a full turn
    const fy = FY, d2 = V();
    const clearAt = (d, a) => { d2.set(Math.cos(el * D) * Math.cos(a * D), Math.sin(el * D), Math.cos(el * D) * Math.sin(a * D)); camera.position.copy(controls.target).addScaledVector(d2, d); camera.lookAt(controls.target); camera.updateMatrixWorld();
      return BOX.every((p) => { tmp.copy(p).project(camera); return tmp.y > -fy && tmp.z < 1; }); };
    for (let k = 0; k < 26; k++) { const d = (lo + hi) / 2; camera.position.copy(controls.target).addScaledVector(dir, d); camera.lookAt(controls.target); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      let ok = BOX.every((p) => { tmp.copy(p).project(camera); return Math.abs(tmp.x) < FX && tmp.y < FY && tmp.y > -FY && tmp.z < 1; });
      for (let a = 0; ok && a < 360; a += 15) ok = clearAt(d, a); if (ok) hi = d; else lo = d; }
    camera.position.copy(controls.target).addScaledVector(dir, hi); camera.lookAt(controls.target); }
  const curAngles = () => { const o = camera.position.clone().sub(controls.target); const d = o.length(); return [Math.atan2(o.z, o.x) / D, Math.asin(clamp(o.y / d, -1, 1)) / D]; };
  // Render on demand only: a frame is drawn when something changed (drag, damping, the reveal sweep, a part tap), never idle.
  let memDirty = true, raf = 0, alive = true, visible = !document.hidden, until = 0, sweep = null, dirty = true;
  let lastDraw = 0; const MIN_DT = 1000 / 64;   // cap at ~60 fps on 120 Hz displays
  function frameFn(now) { raf = 0; if (!alive) return; if (now - lastDraw < MIN_DT && visible) { raf = requestAnimationFrame(frameFn); return; } lastDraw = now; const moved = controls.update();
    if (sweep) { const k = clamp((now - sweep) / 1100, 0, 1), e = 1 - (1 - k) ** 3; reveal.constant = -(XF + 0.6 + (XT - 1 - XF - 0.6) * e + RK); if (k >= 1) { sweep = null; reveal.constant = 99; } dirty = true; }
    if (moved || dirty) { renderer.render(scene, camera); stage.dataset.calls = renderer.info.render.calls; stage.dataset.tris = renderer.info.render.triangles; place(); dirty = false;
      if (memDirty) { memDirty = false; stage.dataset.mem = renderer.info.memory.geometries + "," + renderer.info.memory.textures + "," + mats.length; } }
    if (visible && (now < until || sweep)) raf = requestAnimationFrame(frameFn); }
  function kick(ms = 300) { dirty = true; until = Math.max(until, performance.now() + ms); if (!raf && alive && visible) raf = requestAnimationFrame(frameFn); }
  controls.addEventListener("change", () => kick(controls.enableDamping ? 400 : 60)); controls.addEventListener("start", () => kick(400));
  let lastW = 0;
  function resize() { const r = stage.getBoundingClientRect(); if (!r.width || !r.height) return; SW = r.width; SH = r.height; renderer.setSize(SW, SH, false); camera.aspect = SW / SH; camera.updateProjectionMatrix();
    const [az, el] = lastW ? curAngles() : [VIEW.az, VIEW.el]; fit(az, el); if (!dentBtn.hidden) dentW = dentBtn.offsetWidth; const first = !lastW; lastW = SW; if (first) draw(true); else relabel(); fitPartsRow(); kick(); }
  const ro = new ResizeObserver(resize); ro.observe(stage);
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting && !document.hidden; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; } }); io.observe(stage);
  const onVis = () => { visible = !document.hidden; if (visible) kick(); }; document.addEventListener("visibilitychange", onVis);

  let type = "truss", dent = false, sel = null, dentW = 0; const dentOn = () => type === "mono" && dentW > 0;
  function relabel() { const L = LABELS[type].slice(); if (type === "mono" && dent) L[1] = DENT_LABEL; /* the dent takes the place of "no stringers" (same top row) */ setLabels(L); }
  function clear() { grp.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); mats.forEach((m) => m.dispose()); mats.length = 0; grp.clear(); Object.keys(anchors).forEach((k) => delete anchors[k]); Object.keys(parts).forEach((k) => delete parts[k]); }
  // isolate one part type (blue) with the rest of this mode's structure white; null = everything in its normal colours
  function isolate(key) { sel = key && parts[key] ? key : null;
    for (const [k, p] of Object.entries(parts)) p.sets.forEach((f) => f(!sel ? "def" : k === sel ? "on" : "off"));
    partChips && partChips.set(sel || "all"); markLabels();
    const P = sel && PARTS[type].find((x) => x[0] === sel); const T = TYPES[type];
    F.caption(P ? T.big + " · part" : T.load, P ? P[1] : T.big); desc.textContent = P ? P[2] : ALL_DESC; stage.dataset.sel = sel || "all"; kick(); }
  // switch the context airplane + the frame the structure is built in (local coords of that model)
  function useModel() { const Mo = MODELS[type]; ({ surf, sec, XF, XT } = Mo); for (const k in MODELS) MODELS[k].root.visible = k === type;
    grp.position.copy(Mo.root.position); grp.rotation.copy(Mo.root.rotation); grp.updateMatrixWorld(true);
    RN.set(Math.cos(Mo.root.rotation.z), Math.sin(Mo.root.rotation.z), 0); reveal.normal.copy(RN); RK = RN.dot(Mo.root.position); const ex = "Example: " + TYPES[type].ex; if (exEl.textContent !== ex) exEl.textContent = ex; }
  function draw(animate = true) { clear(); useModel();
    ({ truss: buildTruss, mono: () => buildMono(dent), semi: buildSemi })[type](); finish(); flushLines(); memDirty = true;
    for (const k in anchors) anchors[k].applyMatrix4(grp.matrixWorld);   // label anchors in world space
    if (animate && !reduced() && type !== "mono") { sweep = performance.now(); reveal.constant = -(XF + 0.6 + RK); } else { sweep = null; reveal.constant = 99; }
    stage.dataset.type = type; dentUI(); relabel(); const T = TYPES[type]; F.explain(`<p>${T.text} <span class="dim">Drag the airplane to turn it.</span></p>`);
    isolate(null); kick(1400); }
  chips(F.ctrl, [["truss", "Truss"], ["mono", "Monocoque"], ["semi", "Semimonocoque"]], type, (v) => { if (!v) return; type = v; dent = false; makePartChips(); draw(); }, { label: "Construction type" });
  // part chips, directly under the type row; the row is rebuilt per type in a wrapper that keeps the tallest type's height (never jumps)
  const partsWrap = h("div", { class: "fus-parts" }); F.ctrl.append(partsWrap); let partChips = null;
  function makePartChips() { partsWrap.textContent = ""; partChips = chips(partsWrap, [["all", "All"], ...PARTS[type].map((p) => [p[0], p[1]])], sel || "all", (v) => isolate(!v || v === "all" ? null : v), { label: "Part", toggle: true }); }
  function fitPartsRow() { const keep = type; partsWrap.style.minHeight = ""; let mh = 0; for (const t of Object.keys(PARTS)) { type = t; makePartChips(); mh = Math.max(mh, partsWrap.offsetHeight); } type = keep; makePartChips(); partsWrap.style.minHeight = mh + "px"; }
  // "Show a dent" lives inside the stage (bottom centre, between the bottom labels), only in Monocoque. Fixed width, so it never shifts when it flips to "Hide dent".
  const dentBtn = h("button", { class: "fus-dent", type: "button", "aria-pressed": "false", hidden: "" }); stage.append(h("div", { class: "fus-dentbox" }, dentBtn));
  const dentIco = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.6 7.4 Q10 11.6 14.4 7.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function dentUI() { dentBtn.hidden = type !== "mono"; dentBtn.classList.toggle("on", dent); dentBtn.setAttribute("aria-pressed", dent ? "true" : "false"); const dt = dent ? "Hide dent" : "Show a dent"; if (dentBtn.dataset.t !== dt) { dentBtn.dataset.t = dt; dentBtn.innerHTML = dentIco + `<span>${dt}</span>`; } if (!dentBtn.hidden) dentW = dentBtn.offsetWidth; }
  dentBtn.addEventListener("pointerdown", (e) => e.stopPropagation()); dentBtn.addEventListener("click", () => { dent = !dent; draw(false); });
  F.caption(TYPES.truss.load, TYPES.truss.big);
  const desc = h("p", { class: "fus-desc", "aria-live": "polite" }); desc.textContent = ALL_DESC; F.root.insertBefore(desc, F.ctrl);
  const exEl = h("p", { class: "fus-ex" }); exEl.textContent = "Example: " + TYPES.truss.ex; F.root.insertBefore(exEl, desc);
  makePartChips();
  F.on(() => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); controls.dispose(); clear(); CUB.dispose(); VEGA.dispose(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); });
  return { destroy() { F.destroy(); } };
}
