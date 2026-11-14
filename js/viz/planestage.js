// Live, interactive version of the C172S wireframe explainer scene.
// Thin ink lines over a solid dark body; only the named part is redrawn in the accent by a moving point of light.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { buildPlane } from "./c172-model.js?v=61cdb9ff8d";
import { reduced, clamp } from "../core/util.js?v=61cdb9ff8d";
const ACC = 0x3b82f6, INK = 0xf2f1ec, BG = 0x0a0a0b, D = Math.PI / 180;
const s5 = (t) => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
export const VIEWS = {
  iso: { tg: [-4.5, 4.2, 0], az: -32, el: 16, d: 52 }, side: { tg: [-4.5, 4.4, 0], az: -90, el: 2, d: 54 }, top: { tg: [-4.5, 4.2, 0], az: -90, el: 88.5, d: 62 },
  front: { tg: [-3, 5, 0], az: 0, el: 4, d: 52 }, rear: { tg: [-4, 5, 0], az: 180, el: 8, d: 52 }, tail: { tg: [-16.5, 5.6, 0], az: -150, el: 22, d: 24 }, tailR: { tg: [-16.8, 5.0, 1.2], az: 145, el: 24, d: 18 },
  nose: { tg: [5.5, 4, 0], az: -38, el: 16, d: 17 }, wingL: { tg: [-2, 6.4, -9], az: -130, el: 34, d: 30 }, wingR: { tg: [-2, 6.4, 9], az: 130, el: 34, d: 30 },
  gear: { tg: [0, 2.2, 0], az: -60, el: 6, d: 28 }, cabin: { tg: [-1, 5, 0], az: -70, el: 18, d: 26 }, strut: { tg: [-3, 4.6, 0], az: -18, el: -5, d: 42 } };
// model: optional small model in the same { root, parts, meshes } format (section views, see section-models.js)
export function planeStage(stage, { view = "iso", orbit = true, onPick = null, ortho = false, ground = false, maxFps = 64, model = null, cg = null, fov = 34 } = {}) {
  const canvas = document.createElement("canvas"); stage.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !matchMedia("(max-width: 760px)").matches, alpha: false, powerPreference: "low-power" });
  const PHONE = matchMedia("(max-width: 760px)").matches; renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));   // retina / iPad: 1.5x (+ MSAA on larger screens) looks the same as 2x and fills ~45% fewer pixels renderer.setClearColor(BG, 1); renderer.debug.checkShaderErrors = false;   // skip the synchronous shader-log readback (a stall on first draw of each program)
  const scene = new THREE.Scene(); const res = new THREE.Vector2(1, 1);
  const camera = new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 800);
  const P = model ? model(THREE) : buildPlane(THREE); const pivot = new THREE.Group(); scene.add(pivot);
  const CG = cg ? new THREE.Vector3(...cg) : new THREE.Vector3(-1.2, 4.6, 0); P.root.position.sub(CG); pivot.position.copy(CG); pivot.add(P.root);
  const inkMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.5 });
  const coreMat = new LineMaterial({ color: ACC, linewidth: 2.4, resolution: res }), glowMat = new LineMaterial({ color: ACC, linewidth: PHONE ? 6 : 9, transparent: true, opacity: PHONE ? 0.15 : 0.22, depthWrite: false, blending: THREE.AdditiveBlending, resolution: res });
  const INKLESS = new Set(["fuel", "propDim"]); const ACCENT = {}; const inkLines = {};
  P.root.updateMatrixWorld(true);
  for (const [name, part] of Object.entries(P.parts)) {
    inkLines[name] = [];
    if (!INKLESS.has(name)) part.subs.forEach((sb) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(sb.segs, 3)); const l = new THREE.LineSegments(g, inkMat); sb.obj.add(l); inkLines[name].push(l); });
    const box = new THREE.Box3(), wp = []; part.subs.forEach((sb, si) => { for (let k = 0; k + 5 < sb.segs.length; k += 6) { const m = new THREE.Vector3((sb.segs[k] + sb.segs[k + 3]) / 2, (sb.segs[k + 1] + sb.segs[k + 4]) / 2, (sb.segs[k + 2] + sb.segs[k + 5]) / 2).applyMatrix4(sb.obj.matrixWorld); wp.push([si, k, m]); box.expandByPoint(m); } });
    if (!wp.length) continue;
    const sz = box.getSize(new THREE.Vector3()), ax = sz.x >= sz.y && sz.x >= sz.z ? "x" : sz.z >= sz.y ? "z" : "y", lo = box.min[ax], span = Math.max(1e-6, sz[ax]);
    const key = (m) => (name === "propeller" ? Math.abs(m.y + CG.y - P.PROP_Y) / 3.2 : ["wing", "flaps", "ailerons", "elevator", "hstab", "fuel", "trimtab"].includes(name) ? Math.abs(m.z) / Math.max(1e-6, Math.max(Math.abs(box.min.z), Math.abs(box.max.z))) : name === "engine" ? (box.max.x - m.x) / sz.x : (m[ax] - lo) / span);
    ACCENT[name] = part.subs.map((sb, si) => { const items = wp.filter((w) => w[0] === si).map((w) => ({ k: key(w[2]), seg: sb.segs.slice(w[1], w[1] + 6) })).sort((a, b) => a.k - b.k);
      if (!items.length) return null; const g1 = new LineSegmentsGeometry().setPositions(items.flatMap((i) => i.seg)), g2 = new LineSegmentsGeometry().setPositions(items.flatMap((i) => i.seg));
      const c = new LineSegments2(g1, coreMat), gl = new LineSegments2(g2, glowMat); c.renderOrder = 2; gl.renderOrder = 3; c.visible = gl.visible = false; sb.obj.add(c, gl); return { obj: sb.obj, items, c, gl }; }).filter(Boolean);
  }
  const dotTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(59,130,246,0.9)"); g.addColorStop(1, "rgba(59,130,246,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const lights = [0, 1, 2, 3].map(() => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, sizeAttenuation: false, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); sp.scale.set(0.035, 0.035, 1); sp.renderOrder = 5; sp.visible = false; scene.add(sp); return sp; });
  // optional faint ground grid (supporting object, never competes)
  let grid = null; if (ground) { grid = new THREE.GridHelper(140, 28, INK, INK); grid.material.transparent = true; grid.material.opacity = 0.07; grid.position.y = 0; scene.add(grid); }
  let hl = [], prog = 0, progT0 = 0, drawDur = reduced() ? 1 : 1300;
  const frontV = new THREE.Vector3();
  function setAccent(name, p, light) { let front = null, fk = -1;
    (ACCENT[name] || []).forEach((sb) => { let n = 0; while (n < sb.items.length && sb.items[n].k <= p * 1.0001 + 1e-6) n++; sb.c.visible = sb.gl.visible = n > 0; sb.c.geometry.instanceCount = n; sb.gl.geometry.instanceCount = n;
      if (n > 0 && sb.items[n - 1].k > fk) { fk = sb.items[n - 1].k; const q = sb.items[n - 1].seg; front = frontV.set(q[3], q[4], q[5]).applyMatrix4(sb.obj.matrixWorld); } });
    if (light) { const on = p > 0.001 && p < 0.999 && front; light.visible = !!on; if (on) { light.position.copy(front); light.material.opacity = Math.sin(Math.PI * p) ** 0.5; } } }
  function highlight(names) { names = [].concat(names || []).filter((n) => ACCENT[n]); Object.keys(ACCENT).forEach((n) => { if (!names.includes(n)) ACCENT[n].forEach((sb) => (sb.c.visible = sb.gl.visible = false)); }); hl = names; progT0 = performance.now(); prog = 0; kick(); }
  // Switch which parts are accented WITHOUT replaying the draw-on: the new set appears complete and the shared accent
  // materials fade in over a moment. Use after the one-time highlight() when the focus moves between parts.
  const glowOp = glowMat.opacity; coreMat.transparent = true; let fadeT0 = -1e9, fadeDur = 1;
  function focus(names, dur = 320) { names = [].concat(names || []).filter((n) => ACCENT[n]); Object.keys(ACCENT).forEach((n) => { if (!names.includes(n)) ACCENT[n].forEach((sb) => (sb.c.visible = sb.gl.visible = false)); });
    const now = performance.now(); hl = names; progT0 = now - drawDur - 1; fadeT0 = now; fadeDur = reduced() ? 1 : dur; kick(dur + 60); }
  // Blue fill on the faces of the named parts (e.g. a deflected control surface), on top of the accent lines. Pass [] to clear.
  const tintMat = P.meshes[0] ? P.meshes[0].material.clone() : null; if (tintMat) tintMat.color.setHex(0x2b63d6);
  function tint(names) { names = [].concat(names || []); P.meshes.forEach((m) => { m.userData.mat0 ||= m.material; m.material = tintMat && names.includes(m.userData.part) ? tintMat : m.userData.mat0; }); kick(); }
  // camera state (spherical around a target), eased transitions
  const V0 = typeof view === "string" ? VIEWS[view] : view; const cs = { ...V0, tg: [...V0.tg] }; let camTw = null;
  function applyCam() { const az = cs.az * D, el = cs.el * D; camera.position.set(cs.tg[0] + cs.d * Math.cos(el) * Math.cos(az), cs.tg[1] + cs.d * Math.sin(el), cs.tg[2] + cs.d * Math.cos(el) * Math.sin(az)); camera.lookAt(...cs.tg); if (controls) controls.target.set(...cs.tg); }
  function setView(v, dur = 1600) { const to = typeof v === "string" ? VIEWS[v] : v; if (!to) return; if (controls) syncFromControls();
    const from = { ...cs, tg: [...cs.tg] }; let daz = to.az - from.az; while (daz > 180) daz -= 360; while (daz < -180) daz += 360;
    const f0 = camera.fov, f1 = to.fov || fov;   // optional narrower lens for flat, profile-like side views
    const t0 = performance.now(), dd = reduced() ? 1 : dur; camTw = (now) => { const k = s5((now - t0) / dd); cs.az = from.az + daz * k; cs.el = from.el + (to.el - from.el) * k; cs.d = Math.exp(Math.log(from.d) + (Math.log(to.d) - Math.log(from.d)) * k); cs.tg = from.tg.map((x, i) => x + (to.tg[i] - x) * k); if (f0 !== f1) { camera.fov = f0 + (f1 - f0) * k; camera.updateProjectionMatrix(); } applyCam(); if (k >= 1) camTw = null; }; kick(); }
  let controls = null;
  function syncFromControls() { const o = camera.position.clone().sub(controls.target); cs.d = o.length(); cs.el = Math.asin(clamp(o.y / cs.d, -1, 1)) / D; cs.az = Math.atan2(o.z, o.x) / D; cs.tg = controls.target.toArray(); }
  if (orbit) { controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false; controls.minDistance = 8; controls.maxDistance = 240; controls.rotateSpeed = 0.6; controls.zoomSpeed = 0.6;
    controls.addEventListener("start", () => { camTw = null; kick(); }); controls.addEventListener("change", kick); }
  applyCam();
  // attitude (deg) and control surface pose (deg)
  const att = { pitch: 0, bank: 0, yaw: 0 }; let poseA = {};
  function setAttitude(a) { Object.assign(att, a); pivot.rotation.set(0, 0, 0); pivot.rotation.order = "YZX"; pivot.rotation.y = -att.yaw * D; pivot.rotation.z = att.pitch * D; pivot.rotation.x = att.bank * D; kick(); }
  function pose(a) { poseA = { ...poseA, ...a }; const r = {}; for (const [k, v] of Object.entries(poseA)) r[k] = k === "prop" || k === "wheel" || k === "wheelN" ? v : v * D; P.pose(r); kick(); }
  // picking
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let downAt = null;
  const pickable = P.meshes;
  // A pick is a quick single-finger tap: under 8 px of travel and 450 ms. Orbit drags, long presses and pinches never pick.
  const down = new Set(); let multi = false;
  canvas.addEventListener("pointerdown", (e) => { down.add(e.pointerId); if (down.size > 1) multi = true; else { multi = false; downAt = [e.clientX, e.clientY, performance.now()]; } });
  const lift = (e) => { down.delete(e.pointerId); }; canvas.addEventListener("pointercancel", (e) => { lift(e); downAt = null; });
  canvas.addEventListener("pointerup", (e) => { lift(e); const d = downAt; if (down.size === 0) downAt = null; if (!onPick || !d || multi) return; if (Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 8 || performance.now() - d[2] > 450) return; const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(pickable, false)[0]; onPick(hit ? hit.object.userData.part : null, hit ? hit.object.userData.tag : null); });
  // project a model-space point (feet) to stage pixels, for SVG overlays
  const tmp = new THREE.Vector3();
  const cueMats = [];
  function project(p, local = true) { tmp.set(p[0], p[1], p[2]); if (local) { tmp.sub(CG); tmp.applyEuler(pivot.rotation); tmp.add(CG); } tmp.project(camera); const r = canvas.getBoundingClientRect(); return { x: (tmp.x * 0.5 + 0.5) * r.width, y: topBand + (-tmp.y * 0.5 + 0.5) * r.height, z: tmp.z }; }
  // Optional title band: the canvas starts below it, so corner labels in the band never sit over the model at any camera angle.
  let topBand = 0; function setTopBand(px) { px = Math.max(0, Math.round(px)); if (px === topBand) return; topBand = px; canvas.style.top = px + "px"; stage.dataset.band = px; canvas.style.height = px ? `calc(100% - ${px}px)` : ""; resize(); }
  function resize() { const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); const pr = renderer.getPixelRatio(); res.set(r.width * pr, r.height * pr); cueMats.forEach((m) => m.resolution.copy(res)); coreMat.resolution.copy(res); glowMat.resolution.copy(res); kick(); }
  const ro = new ResizeObserver(resize); ro.observe(stage);
  // ONE render loop per stage. kick() only schedules a frame when none is pending and we are not inside loop();
  // calls made during a frame (pose, setAttitude, OrbitControls "change") just extend idleUntil, and loop() decides
  // once, at its end, whether to continue. (Bug fixed 2026-10-31: kick() inside loop() used to schedule a second
  // loop while the tail scheduled another, doubling the live loops every frame during any part switch or animation.)
  let raf = 0, alive = true, visible = true, pageVisible = !document.hidden, idleUntil = 0, extra = null, inLoop = false;
  let extraIdle = false, quiet = false;   // animate(fn, { idle: true }): fn returns true while it still needs frames; kicks from inside it don't by themselves keep the loop alive
  function kick(ms = 400) { if (!quiet) idleUntil = Math.max(idleUntil, performance.now() + ms); if (!raf && !inLoop && alive && visible && pageVisible) raf = requestAnimationFrame(loop); }
  // Frame cap: 120 Hz displays (ProMotion Mac / iPad) would otherwise draw every animation twice as often for no visible gain.
  let lastDraw = 0; const MIN_DT = maxFps === 30 ? 1000 / 30 - 0.4 : 1000 / maxFps;   // sub-ms tolerance prevents missing the next 30 Hz slot due to rAF timestamp rounding
  // keepGoing: idle extras that return true (and setFlow / non-idle extras / camera tweens) must schedule the next
  // frame directly. A 50 ms idleUntil window used to die after one hitch or a slow 30 fps frame, which froze swerve, fuel flow, and similar animations.
  function loop(now) { raf = 0; if (!alive || !visible || !pageVisible) return; if (now - lastDraw < MIN_DT && visible) { raf = requestAnimationFrame(loop); return; } lastDraw = now; inLoop = true; let keepGoing = false;
    try {
      if (camTw) camTw(now); if (camTw) keepGoing = true; if (controls) controls.update();
      if (extra) { quiet = extraIdle; let more = false; try { more = extra(now); } finally { quiet = false; }
        if (!extraIdle || more) keepGoing = true; }
      lights.forEach((l) => (l.visible = false));
      { const k = clamp((now - fadeT0) / fadeDur, 0, 1); coreMat.opacity = k; glowMat.opacity = glowOp * k; if (k < 1) keepGoing = true; }
      if (hl.length) { prog = clamp((now - progT0) / drawDur, 0, 1); const p = s5(prog); hl.forEach((n, i) => setAccent(n, p, lights[i % 4])); if (prog < 1) keepGoing = true; }
      if (flowOn && !reduced()) { keepGoing = true; flowPhase = (now / 900) % 1000; cueMats.forEach((m) => { if (m.dashed) m.dashOffset = -flowPhase * (m.dashSize + m.gapSize); }); canvas._flowPhase = flowPhase; }   // airflow dashes drift aft
      if (flowOn && flowUpdate) flowUpdate(now);
      renderer.render(scene, camera);
    } finally { inLoop = false; }
    if (alive && visible && pageVisible && !raf && (keepGoing || now < idleUntil)) raf = requestAnimationFrame(loop); }
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; } }); io.observe(stage);
  // Continuous airflow: while flow is on, the loop keeps drawing as long as the stage is on screen (independent of the
  // surface tweens and of animate()). Off-screen the IntersectionObserver stops it; a hidden tab gets no frames at all;
  // coming back kicks it again. Reduced motion: dashes stay put and no extra frames are drawn.
  let flowOn = false, flowPhase = 0, flowUpdate = null; const onVis = () => { pageVisible = !document.hidden; if (pageVisible) kick(); else { cancelAnimationFrame(raf); raf = 0; } }; document.addEventListener("visibilitychange", onVis);
  function setFlow(on, update) { flowOn = !!on; if (update !== undefined) flowUpdate = update;
    const fig = stage.closest("figure"); if (on && fig) fig.dataset.live = "1";   // gl2-visuals: on-screen frames are expected; off-screen must still go idle
    kick(); }
  resize();
  // Warm up the accent-line and light-sprite shader programs now. They start hidden, so the first tap used to stall
  // ~100 ms compiling and linking them. One invisible draw (0 instances, 0 opacity) links every program up front.
  { const tmp = []; scene.traverse((o) => { if (!o.visible && (o.isLineSegments2 || o.isSprite)) { tmp.push([o, o.isSprite ? o.material.opacity : o.geometry.instanceCount]); o.visible = true; if (o.isSprite) o.material.opacity = 0; else o.geometry.instanceCount = 0; } });
    try { renderer.render(scene, camera); } catch (e) {}
    tmp.forEach(([o, v]) => { o.visible = false; if (o.isSprite) o.material.opacity = v; else o.geometry.instanceCount = v; }); }
  kick(1000);
  // 3D cues (airflow lines, force arrows) in MODEL space under the pivot: they are real scene objects, so they stay glued to
  // the airplane through every camera move, orbit and pitch change. Drawn on top (no depth test) so the near-side cues
  // are never hidden by the airframe. Polylines keep a fixed point count and are rewritten in place (no per-frame buffers).
  const cueG = new THREE.Group(); cueG.position.copy(CG).negate(); pivot.add(cueG);
  const cueMat = (color, width, opacity, dash) => { const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthTest: false, depthWrite: false, dashed: !!dash, dashSize: dash ? dash[0] : 1, gapSize: dash ? dash[1] : 1 }); m.resolution.copy(res); cueMats.push(m); return m; };
  const segsOf = (pts) => { const a = new Float32Array((pts.length - 1) * 6); for (let i = 0; i + 1 < pts.length; i++) a.set([...pts[i], ...pts[i + 1]], i * 6); return a; };
  function cueLine(n, { color = INK, width = 1.4, opacity = 0.6, dash = null } = {}) {
    const geo = new LineSegmentsGeometry(); geo.setPositions(segsOf(Array.from({ length: n }, (_, i) => [i * 0.01, 0, 0]))); const mat = cueMat(color, width, opacity, dash);
    const l = new LineSegments2(geo, mat); l.renderOrder = 6; l.frustumCulled = false; cueG.add(l); if (dash) l.computeLineDistances();
    return { obj: l, set(pts) { const st = geo.attributes.instanceStart.data; st.array.set(segsOf(pts)); st.needsUpdate = true;
        if (dash) { const dd = geo.attributes.instanceDistanceStart.data, arr = dd.array; let acc = 0; for (let i = 0; i + 1 < pts.length; i++) { arr[i * 2] = acc; acc += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]); arr[i * 2 + 1] = acc; } dd.needsUpdate = true; }
        kick(); },
      set opacity(o) { mat.opacity = o; l.visible = o > 0.004; }, set visible(v) { l.visible = v; } };
  }
  const UPV = new THREE.Vector3(0, 1, 0);
  function cueArrow({ color = INK, width = 2.6, head = 0.3, dash = null, opacity = 1 } = {}) {
    const ln = cueLine(2, { color, width, opacity, dash }), hm = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, depthWrite: false, opacity });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(head * 0.42, head, 14), hm); cone.renderOrder = 7; cone.frustumCulled = false; cueG.add(cone); let hd = head, vis = true, op = 1;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), dv = new THREE.Vector3();
    return { set(p0, p1) { a.set(...p0); b.set(...p1); dv.subVectors(b, a); const L = dv.length(); if (L < 1e-5) return; dv.divideScalar(L); const h = Math.min(hd, L * 0.6);
        ln.set([p0, b.clone().addScaledVector(dv, -h * 0.85).toArray()]); cone.scale.setScalar(h / hd); cone.quaternion.setFromUnitVectors(UPV, dv); cone.position.copy(b).addScaledVector(dv, -h / 2); kick(); },
      set opacity(o) { op = o; ln.opacity = o; hm.opacity = o; cone.visible = vis && o > 0.004; }, set visible(v) { vis = v; ln.visible = v && op > 0.004; cone.visible = v && op > 0.004; kick(); } };
  }
  return { THREE, P, scene, camera, renderer, pivot, CG, highlight, focus, tint, setView, setAttitude, pose, project, kick, setTopBand, parts: Object.keys(P.parts), inkLines, cueLine, cueArrow, cueGroup: cueG,
    animate(fn, { idle = false } = {}) { extra = fn; extraIdle = idle; kick(); }, setFlow, flowPhase: () => flowPhase, setInkOpacity(o) { inkMat.opacity = o; kick(); },
    destroy() { alive = false; document.removeEventListener("visibilitychange", onVis); cancelAnimationFrame(raf); raf = 0; ro.disconnect(); io.disconnect(); controls && controls.dispose();
      // Dispose GPU resources as well as the renderer; shared geometries/materials are released just once.
      const geometries = new Set(), materials = new Set(), textures = new Set();
      scene.traverse((o) => { if (o.geometry) geometries.add(o.geometry); for (const m of [].concat(o.material || [])) materials.add(m); });
      if (tintMat) materials.add(tintMat); materials.add(inkMat); materials.add(coreMat); materials.add(glowMat);
      materials.forEach((m) => { for (const v of Object.values(m)) if (v && v.isTexture) textures.add(v); m.dispose(); });
      geometries.forEach((g) => g.dispose()); textures.forEach((t) => t.dispose()); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); canvas.remove(); } };
}
