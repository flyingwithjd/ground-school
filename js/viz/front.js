// Frontal cross-section in ink 3D (PHAK Ch 12): a slab of the atmosphere cut west to east. The frontal surface (blue) is the
// boundary between the air masses: a cold front's cold air wedges under steeply and shoves warm air up into cumulonimbus; a warm
// front's warm air slides up a shallow slope, so layered clouds run far ahead. Flows run continuously while on screen: air moving
// along the surface, rain, and the ground sliding west under the front (the front advancing east). Stand ahead of it, under it or
// behind it and both fronts are compared for that spot. Vertical scale is greatly exaggerated; distances are not to scale.
import { frame, chips } from "./base.js?v=x";
import { planeStage } from "./planestage.js?v=x";
import { reduced } from "../core/util.js?v=x";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
const WX = {
  cold: { before: { cl: "Cirriform or towering cumulus; cumulonimbus may develop", pr: "Rain showers may develop", vi: "–", wi: "–", te: "High dew point", ps: "Falling" },
    at: { cl: "Towering cumulus or cumulonimbus", pr: "Heavy rain showers; possible lightning, thunder, hail", vi: "Poor", wi: "Variable and gusty", te: "Temperature and dew point drop rapidly", ps: "Bottoms out, then starts to rise" },
    after: { cl: "Clouds dissipate to cumulus", pr: "Decreasing", vi: "Good", wi: "West-northwest", te: "Cooler", ps: "Continues to rise" } },
  warm: { before: { cl: "Cirriform or stratiform; fog", pr: "Light to moderate rain, sleet, snow or drizzle", vi: "Poor", wi: "South-southeast", te: "Cool or cold; dew point rising", ps: "Falling" },
    at: { cl: "Stratiform", pr: "Drizzle may be falling", vi: "Poor, improving", wi: "Variable", te: "Rising steadily; dew point steady", ps: "Levels off" },
    after: { cl: "Stratocumulus; rain showers possible", pr: "Showers possible", vi: "Improves; haze may linger", wi: "South-southwest", te: "Warming; dew point rises, then levels off", ps: "Slight rise, then falls" } } };
const ROWS = [["cl", "Clouds"], ["pr", "Precipitation"], ["vi", "Visibility"], ["wi", "Wind"], ["te", "Temperature"], ["ps", "Pressure"]];
const INK = 0xf2f1ec, ACC = 0x3b82f6, BODY = 0x111114, RED = 0xd9493e;
const XW = 46, ZD = 9, TOPY = 31;   // the slab: x from -XW (west) to +XW (east), z from -ZD to +ZD; y up
// frontal surface profiles (x at height y), ground contact at x = 0
const PROF = { cold: [[0, 0], [-3, 5], [-7, 10], [-14, 16], [-25, 21], [-40, 24.5]], warm: [[0, 0], [10, 2], [20, 4.3], [30, 7], [40, 10.5], [XW, 13]] };
// clouds: [x, y, z, radius] puffs; flat: vertical squash
const CLOUDS = {
  cold: [
    { name: "Cumulonimbus", tag: [5, 31, 0], puffs: [[2, 7, 0, 5], [6, 8, 2, 4.5], [3, 12, -1, 5], [6, 16, 1, 4.6], [4, 20, 0, 4.4], [6, 24, -1, 4], [5, 27.2, 0, 3.8], [9, 9, -2, 4]], anvil: [[0, 28.5, 0, 6], [8, 29, 0, 6.5], [16, 29.5, 0, 6], [23, 29.6, 0, 4.6]] },
    { name: "Towering cumulus", tag: [24, 18.5, 0], puffs: [[23, 6, 0, 3.2], [25, 8, 1, 3], [23.5, 11, 0, 2.8], [24.5, 13.5, 0, 2.4]] },
    { name: "Cumulus", tag: [-32, 13.5, 0], puffs: [[-34, 8, 0, 2.4], [-31, 8.5, 1, 2.6], [-32.5, 10, 0, 2.2]] } ],
  warm: [
    { name: "Nimbostratus", tag: [9, 10, 0], flat: 0.55, puffs: [[2, 4.6, 0, 4.6], [7, 5, 1, 5], [12, 5.4, -1, 4.6], [17, 5.9, 0, 4.2]] },
    { name: "Altostratus", tag: [27, 14.6, 0], flat: 0.42, puffs: [[23, 9.6, 0, 4], [28, 10.3, 0, 4.2], [33, 11, 0, 3.8]] },
    { name: "Cirrostratus", tag: [37, 19.4, 0], flat: 0.26, puffs: [[35, 15.8, 0, 3.8], [40, 16.4, 0, 3.8]] },
    { name: "Cirrus", tag: [40, 26, 0], wisps: [[37, 21.8], [41.5, 22.6]] } ] };
const RAIN = { cold: [-1, 10, 6, 1.6, "Heavy showers"], warm: [1, 19, 3, 0.7, "Steady rain"] };   // x0, x1, top y, streak speed scale, label
const YOU = { cold: { before: 34, at: 5, after: -38 }, warm: { before: 40, at: 5, after: -34 } };
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin fr3d", corners: { tl: "Cold front ▶", tr: "Not to scale" } });
  const still = reduced();
  const empty = (THREE) => ({ root: new THREE.Group(), parts: {}, meshes: [], pose() {} });
  const S = planeStage(F.stage, { view: { tg: [0, 13, 0], az: 98, el: 14, d: 170 }, orbit: true, maxFps: 30, model: empty, cg: [0, 0, 0], fov: 30 }); const T = S.THREE;
  const world = new T.Group(); S.scene.add(world); let dyn = new T.Group(); world.add(dyn);
  const res = new T.Vector2(1, 1), mats = [];
  const lm = (color, width, opacity, dash) => { const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false, dashed: !!dash, dashSize: dash ? dash[0] : 1, gapSize: dash ? dash[1] : 1 }); mats.push(m); return m; };
  const segs = (pairs, mat, parent = world) => { const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(pairs.flat(2))); const l = new LineSegments2(g, mat); if (mat.dashed) l.computeLineDistances(); l.frustumCulled = false; l.renderOrder = 4; parent.add(l); return l; };
  const poly = (pts) => { const out = []; for (let i = 0; i + 1 < pts.length; i++) out.push([pts[i], pts[i + 1]]); return out; };
  // ground slab: outline, faint cross lines, and ground lines that slide west under the front (= the front moving east)
  const mInk = lm(INK, 1.3, 0.7), mFaint = lm(INK, 1, 0.12), mSlide = lm(INK, 1.2, 0.3, [2.2, 5]);
  segs([[[-XW, 0, -ZD], [XW, 0, -ZD]], [[-XW, 0, ZD], [XW, 0, ZD]], [[-XW, 0, -ZD], [-XW, 0, ZD]], [[XW, 0, -ZD], [XW, 0, ZD]], [[-XW, -2, ZD], [XW, -2, ZD]], [[-XW, 0, ZD], [-XW, -2, ZD]], [[XW, 0, ZD], [XW, -2, ZD]]], mInk);
  const fl = []; for (let x = -XW + 10; x < XW; x += 10) fl.push([[x, 0, -ZD], [x, 0, ZD]]); segs(fl, mFaint);
  const slide = []; for (const z of [-ZD * 0.6, 0, ZD * 0.6]) slide.push([[XW, 0.05, z], [-XW, 0.05, z]]); segs(slide, mSlide);
  // materials for solid bodies: near-black faces with a white back-face outline (ink silhouette from any angle)
  const body = new T.MeshBasicMaterial({ color: BODY, transparent: true, opacity: 0.92 }), outline = new T.MeshBasicMaterial({ color: INK, side: T.BackSide, transparent: true, opacity: 0.7 });
  const coldFill = new T.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0.1, side: T.DoubleSide, depthWrite: false });
  const surfMat = new T.MeshBasicMaterial({ color: 0x1b3a73, transparent: true, opacity: 0.28, side: T.DoubleSide, depthWrite: false });
  const merge = (geos) => { const arrs = geos.map((g) => { const n = g.index ? g.toNonIndexed() : g; const a = n.attributes.position.array; g.dispose(); if (n !== g) n.dispose(); return a; });
    const pos = new Float32Array(arrs.reduce((k, a) => k + a.length, 0)); let o = 0; for (const a of arrs) { pos.set(a, o); o += a.length; } const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos, 3)); return g; };
  function cloud(c) { const inner = [], outer = [];
    const add = ([x, y, z, r], sq = 1) => { for (const [arr, k] of [[inner, 1], [outer, 1.07]]) { const g = new T.SphereGeometry(r * k, 14, 10); g.scale(1, sq, 1); g.translate(x, y * ys, z); arr.push(g); } };
    (c.puffs || []).forEach((p) => add(p, c.flat || 1)); (c.anvil || []).forEach((p) => add(p, 0.28));
    const m1 = new T.Mesh(merge(inner), body), m2 = new T.Mesh(merge(outer), outline); m1.renderOrder = 1; m2.renderOrder = 0; dyn.add(m2, m1); }
  // labels (HTML, projected each frame)
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 11px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:rgba(242,241,236,.85);background:rgba(10,10,11,.7);border:1px solid rgba(242,241,236,.22);border-radius:4px;padding:4px 6px;transform:translate(-50%,-50%)";
  const sty = document.createElement("style"); sty.textContent = ".fr3-tag.big{font-size:12.5px!important;letter-spacing:.16em!important;border-color:transparent!important;background:none!important}.fr3-tag.acc{color:#bfdbfe!important;border-color:#3b82f6!important}.fr3-tag.you{color:#0a0a0b!important;background:#f2f1ec!important}"; F.stage.append(sty);
  let tags = [];
  const tag = (text, at, cls = "") => { const e = document.createElement("div"); e.className = "fr3-tag " + cls; e.style.cssText = TAG; e.textContent = text; e.setAttribute("aria-hidden", "true"); F.stage.append(e); tags.push({ e, at }); return e; };
  // place each tag at its projected point, then nudge it up or down (in priority order) until it clears the ones already placed
  function placeTags() { const W = F.stage.clientWidth, H = F.stage.clientHeight, top = W < 560 ? 50 : 34, done = [];
    tags.forEach((t) => { const q = S.project([t.at[0], t.at[1] * ys, t.at[2]], false); if (!t.w) { t.w = t.e.offsetWidth; t.h = t.e.offsetHeight; } const w = t.w, h = t.h;
      const x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, q.x)); let y = q.y;
      for (const k of [0, -1, 1, -2, 2, -3, 3]) { const yy = Math.max(top + h / 2, Math.min(H - h / 2 - 4, q.y + k * (h + 3))); if (!done.some((r) => Math.abs(r.x - x) < (r.w + w) / 2 + 4 && Math.abs(r.y - yy) < (r.h + h) / 2 + 2)) { y = yy; break; } }
      done.push({ x, y, w, h }); t.e.style.left = Math.round(x) + "px"; t.e.style.top = Math.round(y) + "px"; }); }
  // flows: dashed lines that drift along their direction while the flow runs
  let ys = 1.5, rain = null, rainArr = null, rainN = 0, rainSeed = [], you = null;
  let kind = opts.kind || "cold", pos = "before";
  const mSurf = lm(ACC, 3, 1), mSurfF = lm(ACC, 1.2, 0.45), mWarm = lm(RED, 2, 0.8, [2.6, 3.4]), mCold = lm(0x7fb0ff, 2, 0.8, [2.6, 3.4]), mRain = lm(0x9fc3ff, 1.6, 0.85), mYou = lm(INK, 2, 1), mSym = lm(ACC, 2, 1), mSymR = lm(RED, 2, 1);
  const symFill = new T.MeshBasicMaterial({ color: ACC }), symFillR = new T.MeshBasicMaterial({ color: RED });
  function build() { world.remove(dyn); dyn.traverse((o) => o.geometry && o.geometry.dispose()); dyn = new T.Group(); world.add(dyn); tags.forEach(({ e }) => e.remove()); tags = [];
    const P0 = PROF[kind], P = P0.map(([x, y]) => [x, y * ys]), sy = (pts) => pts.map(([x, y, z]) => [x, y * ys, z]);
    // the frontal surface, extruded across the slab, with the blue profile on both faces
    const g = new T.BufferGeometry(), vs = []; for (let i = 0; i + 1 < P.length; i++) { const [a, b] = [P[i], P[i + 1]]; vs.push(a[0], a[1], -ZD, b[0], b[1], -ZD, b[0], b[1], ZD, a[0], a[1], -ZD, b[0], b[1], ZD, a[0], a[1], ZD); }
    g.setAttribute("position", new T.Float32BufferAttribute(vs, 3)); const sm = new T.Mesh(g, surfMat); sm.renderOrder = 2; dyn.add(sm);
    // the cold-air wedge: a faint blue fill of the cross-section under the frontal surface, on both faces
    const sh = new T.Shape(); sh.moveTo(0, 0); P.forEach(([x, y]) => sh.lineTo(x, y)); const end = P[P.length - 1]; sh.lineTo(end[0] < 0 ? -XW : XW, end[1]); sh.lineTo(end[0] < 0 ? -XW : XW, 0); sh.lineTo(0, 0);
    for (const z of [ZD, -ZD]) { const m = new T.Mesh(new T.ShapeGeometry(sh), coldFill); m.position.z = z; m.renderOrder = 2; dyn.add(m); }
    segs(poly(P.map(([x, y]) => [x, y, ZD])), mSurf, dyn); segs(poly(P.map(([x, y]) => [x, y, -ZD])), mSurfF, dyn);
    const zs = []; for (let i = 1; i < P.length; i++) zs.push([[P[i][0], P[i][1], -ZD], [P[i][0], P[i][1], ZD]]); segs(zs, mSurfF, dyn);
    // weather-map symbol along the front on the ground: blue triangles (cold) pointing east, red half-circles (warm)
    const sym = []; for (let z = -ZD + 3; z <= ZD - 3; z += 6) { if (kind === "cold") { const t = new T.BufferGeometry(); t.setAttribute("position", new T.Float32BufferAttribute([0, 0.1, z - 1.6, 2.6, 0.1, z, 0, 0.1, z + 1.6], 3)); const m = new T.Mesh(t, symFill); m.material.side = T.DoubleSide; dyn.add(m); }
      else { const c = new T.CircleGeometry(1.6, 16, -Math.PI / 2, Math.PI); c.rotateX(-Math.PI / 2); c.translate(0, 0.1, z); const m = new T.Mesh(c, symFillR); m.material.side = T.DoubleSide; dyn.add(m); } }
    segs([[[0, 0.08, -ZD], [0, 0.08, ZD]]], kind === "cold" ? mSym : mSymR, dyn);
    CLOUDS[kind].forEach((c) => { if (c.wisps) { const w = []; c.wisps.forEach(([x, y]) => { w.push(sy([[x - 3, y, 0], [x + 2, y + 1.2, 0]]), sy([[x + 2, y + 1.2, 0], [x + 3.5, y + 0.4, 0]])); }); segs(w, lm(INK, 1.6, 0.7), dyn); } else cloud(c); tag(c.name, c.tag); });
    // air flow along the surface: warm air (red dashes) and cold air (blue dashes) near the ground
    const fy = (x) => { for (let i = 0; i + 1 < P0.length; i++) { const [a, b] = [P0[i], P0[i + 1]]; if ((x - a[0]) * (x - b[0]) <= 0) return a[1] + (b[1] - a[1]) * ((x - a[0]) / (b[0] - a[0] || 1)); } return P0[P0.length - 1][1]; };
    if (kind === "cold") {
      segs(poly(sy([[30, 1.5, ZD], [15, 2, ZD], [7, 4, ZD], [4, 9, ZD], [3, 16, ZD], [5, 25, ZD]])), mWarm, dyn);   // warm air shoved up at the steep nose
      segs(poly(sy([[-44, 1.2, ZD], [-24, 1.2, ZD], [-10, 1.4, ZD], [-2.5, 1.6, ZD]])), mCold, dyn); segs(poly(sy([[-44, 4, ZD], [-24, 4.5, ZD], [-12, 4.5, ZD]])), mCold, dyn);
      tag("Steep frontal surface", [-27, 25.5, 0], "acc"); tag("Warm, moist air", [30, 25, 0], "big"); tag("Cold air", [-20, 2.5, ZD], "big");
    } else {
      segs(poly(sy([[-44, 3, ZD], [-20, 4, ZD], [2, 3, ZD], [16, fy(16) + 2, ZD], [30, fy(30) + 2, ZD], [44, fy(44) + 2, ZD]])), mWarm, dyn);   // warm air slides up and over
      segs(poly(sy([[44, 1.2, ZD], [26, 1.2, ZD], [8, 1.2, ZD]])), mCold, dyn);   // retreating cold air at the surface
      tag("Shallow frontal surface", [31, 2.6, ZD], "acc"); tag("Warm air", [-26, 16, 0], "big"); tag("Cold air", [40, 0.4, ZD], "big");
    }
    F.corner("tl", kind === "cold" ? "Cold front ▶" : "Warm front ▶");
    // rain streaks under the main cloud: short lines that fall and wrap
    const [r0, r1] = RAIN[kind]; rainN = 44; rainSeed = Array.from({ length: rainN }, (_, i) => [r0 + Math.random() * (r1 - r0), Math.random(), (Math.random() * 2 - 1) * ZD * 0.8]);
    rain = segs(Array.from({ length: rainN }, () => [[0, 0, 0], [0, 1, 0]]), mRain, dyn); rainArr = rain.geometry.attributes.instanceStart.data;
    // you: a person standing at the chosen spot
    const xu = YOU[kind][pos]; you = segs([[[xu, 0, ZD], [xu, 3, ZD]], [[xu, 3, ZD], [xu - 1, 1.6, ZD]], [[xu, 3, ZD], [xu + 1, 1.6, ZD]], [[xu - 0.6, 4.2, ZD], [xu + 0.6, 4.2, ZD]]], mYou, dyn); tag("You", [xu, -3, ZD + 2], "you");
    fit(); }
  const rainUpd = (now) => { if (!rainArr) return; const [, , top0, sp] = RAIN[kind], top = top0 * ys; const t = still ? 0.4 : now / 1000; for (let i = 0; i < rainN; i++) { const [x, ph, z] = rainSeed[i]; const f = (ph + t * 0.55 * sp) % 1, y = top * (1 - f); rainArr.array.set([x - 0.3, y, z, x, Math.max(0, y - 1.3), z], i * 6); } rainArr.needsUpdate = true; };
  // camera: fit the slab and the tallest cloud on any stage size
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 4000);
  function fit(dur = 1) { const r = F.stage.getBoundingClientRect(); if (!r.width) return; const asp = r.width / Math.max(1, r.height - 34);  
    const tg = [0, TOPY * ys * 0.46, 0], az = 96, el = 10;
    const pts = []; for (const x of [-XW, XW]) for (const z of [-ZD, ZD]) for (const y of [-4, TOPY * ys]) pts.push(new T.Vector3(x, y, z)); cam.aspect = asp; cam.updateProjectionMatrix(); let lo = 30, hi = 2000;
    for (let it = 0; it < 30; it++) { const d = (lo + hi) / 2, e = el * Math.PI / 180, a = az * Math.PI / 180; cam.position.set(tg[0] + d * Math.cos(e) * Math.cos(a), tg[1] + d * Math.sin(e), tg[2] + d * Math.cos(e) * Math.sin(a)); cam.lookAt(...tg); cam.updateMatrixWorld();
      const ok = pts.every((c) => { const q = c.clone().project(cam); return Math.abs(q.x) < 0.98 && q.y < 0.8 && q.y > -0.95; }); if (ok) hi = d; else lo = d; }
    S.setView({ tg, az, el, d: hi }, dur); }
  const ysFor = () => { const r = F.stage.getBoundingClientRect(); const asp = r.width / Math.max(1, r.height - 34); return Math.round(Math.max(1.15, Math.min(2.1, (2 * XW) / (TOPY * asp * 1.05))) * 20) / 20; };
  new ResizeObserver(() => { const n = ysFor(); if (Math.abs(n - ys) > 0.01) { ys = n; build(); } else fit(); }).observe(F.stage);
  const panel = document.createElement("div"); panel.className = "fr-cmp";
  function draw() { build();
    const C = WX.cold[pos], Wm = WX.warm[pos], on = (k2) => (k2 === kind ? ' class="on"' : "");
    panel.innerHTML = `<table><thead><tr><th></th><th${on("cold")}>Cold front</th><th${on("warm")}>Warm front</th></tr></thead><tbody>${ROWS.filter(([k2]) => C[k2] !== "–" || Wm[k2] !== "–").map(([k2, l]) => `<tr><th>${l}</th><td${on("cold")}>${C[k2]}</td><td${on("warm")}>${Wm[k2]}</td></tr>`).join("")}</tbody></table>`;
    F.caption(`${kind === "cold" ? "Cold" : "Warm"} front · ${pos === "before" ? "ahead of it" : pos === "at" ? "passing overhead" : "after it passes"}`, kind === "cold" ? "Fast, steep, narrow band of violent weather" : "Slow, shallow, wide band of steady weather");
    F.explain(kind === "cold" ? `Cold, dense air plows under the warm air and forces it up fast. Expect a narrow band of showers and thunderstorms right at the front. A fast-moving cold front can bring a squall line along or ahead of it. Behind it the sky clears, but winds are gusty and turbulent. <span class="src">PHAK Ch 12</span> <span class="src">Vertical scale greatly exaggerated.</span>` : `Warm air slides up over the cold air on a gentle slope, so clouds show up hundreds of miles ahead: cirrus, then cirrostratus, altostratus and nimbostratus. Expect low ceilings, poor visibility and steady precipitation over a wide area. In summer, thunderstorms can be embedded. <span class="src">PHAK Ch 12</span> <span class="src">Vertical scale greatly exaggerated.</span>`); }
  chips(F.ctrl, [["cold", "Cold front"], ["warm", "Warm front"]], kind, (v) => { kind = v || kind; draw(); }, { label: "Front" });
  chips(F.ctrl, [["before", "Ahead"], ["at", "Passing"], ["after", "Behind"]], pos, (v) => { pos = v || pos; draw(); }, { label: "Where you are" });
  F.ctrl.append(panel); ys = ysFor(); draw();
  S.animate((now) => { const r = S.renderer.getDrawingBufferSize(new T.Vector2()); if (r.x !== res.x || r.y !== res.y) { res.copy(r); mats.forEach((m) => m.resolution.copy(res)); }
      // the drifting dashes: shift every dashed material each frame (the slide lines move west, the flows along their direction)
      if (!still) { const ph = now / 900; mats.forEach((m) => { if (m.dashed) m.dashOffset = -ph * (m.dashSize + m.gapSize); }); }
      rainUpd(now); placeTags(); return !still; }, { idle: still });
  return { destroy() { tags.forEach(({ e }) => e.remove()); mats.forEach((m) => m.dispose()); S.destroy(); F.destroy(); } };
}
