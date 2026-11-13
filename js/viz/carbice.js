// Carburetor ice and carburetor heat, on a 3D cutaway carburetor (planeStage): the venturi body sectioned in half, the float
// bowl with fuel, the nozzle and a butterfly throttle valve that turns with power; frost layers grow on the throat and valve.
// Under it, the icing-likelihood chart and the engine gauge. Set outside air temperature and humidity, pick the engine, and watch ice grow in the
// venturi and on the throttle valve as RPM (or manifold pressure) sags; then apply carb heat.
// Facts, PHAK 7 (Carburetor Icing, Carburetor Heat, Fig 7-12): ice most likely below 70 °F with humidity above 80%;
// possible with OAT as high as 100 °F and humidity as low as 50%; venturi temperature can drop 60-70 °F; first sign is an RPM
// drop with a fixed-pitch prop or a manifold pressure drop with a constant-speed prop; carb heat can cost up to 15% power;
// with ice, power drops then rises as it melts; without ice it drops and stays; full heat, not partial; especially dangerous
// at reduced power in a descent. C172S POH 7: a fuel-injected engine's spring-loaded alternate air door opens if the filter
// is blocked, costing about 10% power at full throttle. RPM and MP values shown are examples, not published numbers.
import { frame, chips, slider, row } from "./base.js?v=771fe5f0ea";
import { planeStage } from "./planestage.js?v=771fe5f0ea";
import { modelKit } from "./section-models.js?v=771fe5f0ea";
import { T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=771fe5f0ea";
import { dial, anim, toward, COL } from "./dial.js?v=771fe5f0ea";
import { s, h, reduced } from "../core/util.js?v=771fe5f0ea";
const ICE = "#CFE6FF", WARM = "#E0894A", D = Math.PI / 180;
export function risk(oat, rh) { if (oat < 70 && rh > 80) return 2; if (oat <= 100 && rh >= 50) return 1; return 0; }
// ---------- 3D model (arbitrary units, about inches/2): flow along +x, the cut plane is z = 0 and the back half (z < 0) is kept ----------
const FUEL_T = "#8fb3f0", X0 = -3.2, X1 = 3.4, R0 = 1.0, THR = 0.52, WV = 1.7, WT = 0.24, TVX = 2.35, BOWL = { x0: -1.5, x1: 1.0, y0: -1.3, y1: -3.2, z: 1.05 }, LEVEL = -2.35, NZX = 0.15;
export const hw = (x) => { const u = x / WV; return Math.abs(u) >= 1 ? R0 : R0 - (R0 - THR) * 0.5 * (1 + Math.cos(Math.PI * u)); };
function ring(x, r, n = 24) { return Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI / 2 + (Math.PI * i) / n; return [x, r * Math.sin(a), r * Math.cos(a)]; }); }   // back half: z <= 0
const polySegs = (pts) => { const sg = []; for (let i = 0; i + 1 < pts.length; i++) sg.push(...pts[i], ...pts[i + 1]); return sg; };
function openBox(THREE, x0, x1, y0, y1, z0, z1) { const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const gi = g.index.array, keep = []; g.groups.forEach((gr, k) => { if (k !== 4) for (let i = gr.start; i < gr.start + gr.count; i++) keep.push(gi[i]); }); g.setIndex(keep); g.clearGroups(); return g; }   // no +z face: the cut side is open
function carbModel(THREE) { const K = modelKit(THREE), carb = new THREE.Group(), inj = new THREE.Group(); K.root.add(carb, inj);
  // venturi body: a lathe of the wall section, back half only
  const xs = Array.from({ length: 41 }, (_, i) => X0 + ((X1 - X0) * i) / 40), prof = [...xs.map((x) => new THREE.Vector2(hw(x), x)), ...xs.slice().reverse().map((x) => new THREE.Vector2(R0 + WT, x))];
  const lg = new THREE.LatheGeometry(prof, 30, Math.PI / 2, Math.PI); lg.rotateZ(-Math.PI / 2);
  const bodySegs = []; for (const sg of [1, -1]) { bodySegs.push(...polySegs(xs.map((x) => [x, sg * hw(x), 0])), ...polySegs([[X0, sg * (R0 + WT), 0], [X1, sg * (R0 + WT), 0]]), X0, sg * hw(X0), 0, X0, sg * (R0 + WT), 0, X1, sg * hw(X1), 0, X1, sg * (R0 + WT), 0); }
  [-2.6, -1.25, -0.55, 0, 0.55, 1.25, TVX + 0.6].forEach((x) => bodySegs.push(...polySegs(ring(x, hw(x)))));
  [X0, X1].forEach((x) => bodySegs.push(...polySegs(ring(x, R0 + WT))));
  K.add("body", carb, lg, bodySegs);
  // float bowl (open on the cut side), fuel, float, nozzle
  const B = BOWL; const bowl = openBox(THREE, B.x0, B.x1, B.y1, B.y0, -B.z, 0), bs = [];
  const bx = [[B.x0, B.y0], [B.x1, B.y0], [B.x1, B.y1], [B.x0, B.y1]]; bx.forEach((p, i) => { const q = bx[(i + 1) % 4]; bs.push(p[0], p[1], 0, q[0], q[1], 0, p[0], p[1], -B.z, q[0], q[1], -B.z); bs.push(p[0], p[1], 0, p[0], p[1], -B.z); });
  K.add("bowl", carb, bowl, bs);
  const fuelM = new THREE.Mesh(new THREE.BoxGeometry(B.x1 - B.x0 - 0.08, LEVEL - B.y1 - 0.04, B.z - 0.04), new THREE.MeshBasicMaterial({ color: 0x1b3a78, transparent: true, opacity: 0.85, depthWrite: false }));
  fuelM.position.set((B.x0 + B.x1) / 2, (LEVEL + B.y1) / 2, -B.z / 2); carb.add(fuelM);
  // the float rides on the fuel: a hollow body (ink look), half submerged, with its hinge arm to the needle valve
  const fl = new THREE.BoxGeometry(0.8, 0.32, 0.6); fl.translate(B.x0 + 0.6, LEVEL + 0.05, -0.45);
  const flo = new THREE.Mesh(fl, new THREE.MeshBasicMaterial({ color: 0x0d0d10 })); carb.add(flo);
  K.add("float", carb, null, [...Array.from(new THREE.EdgesGeometry(fl, 30).attributes.position.array), B.x0 + 1.0, LEVEL + 0.1, -0.02, B.x0 + 1.35, B.y0 - 0.12, -0.02]);
  const nz = new THREE.CylinderGeometry(0.07, 0.07, -0.1 - (B.y1 + 0.25), 10, 1, true); nz.translate(NZX, (-0.1 + B.y1 + 0.25) / 2, -0.12);
  K.add("nozzle", carb, nz, polySegs([[NZX, B.y1 + 0.25, -0.05], [NZX, -0.1, -0.05], [NZX - 0.12, 0.02, -0.05]]));
  // butterfly throttle valve: half disc on a shaft along z; rotation.z = 0 is closed (across the bore), 90 deg is wide open
  const valve = new THREE.Group(); valve.position.set(TVX, 0, 0); carb.add(valve); const rv = hw(TVX) - 0.03;
  const dg = new THREE.CylinderGeometry(rv, rv, 0.06, 24, 1, false, Math.PI / 2, Math.PI); dg.rotateZ(Math.PI / 2);
  const ds = polySegs(ring(0, rv).map(([x, y, z]) => [x, y, z])); ds.push(0, rv, 0, 0, -rv, 0, 0, 0, 0, 0, 0, -(R0 + WT));
  K.add("valve", valve, dg, ds);
  // fuel-injected induction: a straight duct (back half), air filter, spring-loaded alternate air door, fuel/air control unit
  const dprof = [new THREE.Vector2(R0, X0), new THREE.Vector2(R0, X1), new THREE.Vector2(R0 + WT, X1), new THREE.Vector2(R0 + WT, X0)];
  const dgeo = new THREE.LatheGeometry(dprof, 30, Math.PI / 2, Math.PI); dgeo.rotateZ(-Math.PI / 2);
  const dsg = []; for (const sg of [1, -1]) dsg.push(X0, sg * R0, 0, X1, sg * R0, 0, X0, sg * (R0 + WT), 0, X1, sg * (R0 + WT), 0); [X0, -1.0, 0.6, X1].forEach((x) => dsg.push(...polySegs(ring(x, R0))));
  K.add("duct", inj, dgeo, dsg);
  const fg = new THREE.CylinderGeometry(R0 - 0.02, R0 - 0.02, 0.22, 24, 1, false, Math.PI / 2, Math.PI); fg.rotateZ(Math.PI / 2); fg.translate(-2.2, 0, 0);
  const fsg = []; for (let k = -4; k <= 4; k++) { const y = (k / 4.6) * R0, zz = -Math.sqrt(Math.max(0, R0 * R0 - y * y)); fsg.push(-2.2, y, 0, -2.2, y, zz); } fsg.push(...polySegs(ring(-2.2, R0 - 0.02)));
  K.add("filter", inj, fg, fsg);
  const door = new THREE.Group(); door.position.set(-0.6, R0 + WT, -0.55); inj.add(door); const dr = new THREE.BoxGeometry(1.1, 0.06, 0.9); dr.translate(0.55, 0, 0);
  const drm = new THREE.Mesh(dr, new THREE.MeshBasicMaterial({ color: 0x0d0d10 })); door.add(drm); K.add("door", door, null, Array.from(new THREE.EdgesGeometry(dr, 30).attributes.position.array));
  // fuel/air control unit: a block under the duct downstream of the filter, fuel lines out to the engine
  const fcu = new THREE.BoxGeometry(1.2, 0.8, 0.9); fcu.translate(2.0, -(R0 + WT) - 0.45, -0.45);
  inj.add(new THREE.Mesh(fcu, new THREE.MeshBasicMaterial({ color: 0x0d0d10 }))); K.add("fcu", inj, null, [...Array.from(new THREE.EdgesGeometry(fcu, 30).attributes.position.array), 2.0, -(R0 + WT), -0.02, 2.0, -(R0 + WT) - 0.05, -0.02, 2.6, -(R0 + WT) - 0.45, -0.02, 3.3, -(R0 + WT) - 0.45, -0.02]);
  return K.model({ carb, inj, valve, door, fuelM }); }
export function mount(host) {
  let oat = 60, rh = 85, eng = "fp", pwr = "cruise", heat = false, filt = false, ice = 0, pen = 0, melt = 0;
  const F = frame(host, { cls: "capin sec3d carb3d", corners: { tl: "Carburetor ice", tr: "PHAK 7 · POH 7" } });
  F.root.dataset.live = "1";   // the airflow drifts while on screen; zero frames offscreen
  const S = planeStage(F.stage, { model: carbModel, cg: [0, 0, 0], orbit: false, maxFps: 30, fov: 20, view: { tg: [0.1, -0.9, 0], az: 104, el: 24, d: 30, fov: 20 } });
  const M3 = S.P;
  // labels for the parts sit in an SVG over the stage, placed by projecting fixed model points (the camera never moves)
  const lab = s("svg", { class: "full lab3d", role: "img" }); F.stage.append(lab); let lg = s("g", {}, lab);
  const band = () => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 4 : 0);
    const Hh = Math.max(1, sr.height - (+F.stage.dataset.band || 0)), TN = Math.tan(10 * D), dd = Math.max(5.6 / (2 * TN), (sr.width < 600 ? 9.8 : 8.4) / (2 * TN * (sr.width / Hh))); const fi = eng === "fi", d2 = fi ? Math.max(4.9 / (2 * TN), 8.4 / (2 * TN * (sr.width / Hh))) : dd;
    S.setView(fi ? { tg: [0.1, -0.15, -0.2], az: 102, el: 24, d: d2, fov: 20 } : { tg: [0.1, -1.0, -0.2], az: 102, el: 24, d: dd, fov: 20 }, viewDur); labUntil = performance.now() + (viewDur > 1 ? viewDur + 300 : 400); viewDur = 1;
    S.kick(); };
  let viewDur = 1, focusSet = null, labUntil = 0;
  const bro = new ResizeObserver(band); bro.observe(F.stage); F.on(() => bro.disconnect());
  function labels() { const W = F.stage.clientWidth, H = F.stage.clientHeight; lab.setAttribute("viewBox", `0 0 ${W} ${H}`); lg.remove(); lg = s("g", {}, lab); const fi = eng === "fi", rk = risk(oat, rh), ph = W < 520;
    const at = (p, str, o = {}) => { const q = S.project(p); T(lg, Math.max(6, Math.min(W - 6, q.x + (o.dx || 0))), q.y + (o.dy || 0), str, { size: 11, anchor: o.anchor || "middle", fill: o.fill || GRAY }); };
    if (!fi) { at([0, R0 + WT, 0], ph ? "venturi: up to 70 °F colder" : "venturi: up to 70 °F colder", { dy: -12, fill: rk ? COL.cyan : GRAY });
      at([X0, 0, 0], heat ? "heated air" : `air ${oat} °F`, { dy: -10, anchor: "start", dx: -4, fill: heat ? WARM : INK });
      at([(BOWL.x0 + BOWL.x1) / 2, BOWL.y1, 0], "float bowl", { dy: 16 }); if (ph) at([NZX, LEVEL + 0.45, 0], "nozzle", { anchor: "start", dx: 5, dy: 4, fill: FUEL_T }); else at([NZX + 0.14, (BOWL.y0 + LEVEL) / 2 + 0.05, 0], "fuel nozzle", { anchor: "start", dx: 8, dy: 4, fill: FUEL_T });
      at([TVX, -(R0 + WT), 0], "throttle valve", ph ? { dy: 16, anchor: "start", dx: -14 } : { dy: 18 }); }
    else { at([-2.2, -(R0 + WT), 0], filt ? "filter iced" : "air filter", { dy: 16, fill: filt ? ICE : GRAY }); if (ph) at([0.75, R0 + WT + 0.3, 0], filt ? "alt air door open" : "alt air door", { anchor: "start", dx: 8, dy: 0, fill: filt ? ACC : GRAY }); else at([-0.75, R0 + WT + 0.3, 0], filt ? "alternate air door open" : "alternate air door", { anchor: "end", dx: -6, dy: 0, fill: filt ? ACC : GRAY });
      at([2.0, -(R0 + WT) - 0.85, 0], "fuel/air control unit", { dy: 18 }); at([X0, 0, 0], "air", { dy: -10, anchor: "start", dx: -4, fill: INK }); } }
  // ---------- 3D cues: streamlines, frost layers, inlet and outlet arrows ----------
  const NP = 46, xsF = Array.from({ length: NP }, (_, i) => X0 - 0.9 + ((X1 + 1.2 - (X0 - 0.9)) * i) / (NP - 1));
  const sl = [-0.62, -0.28, 0.28, 0.62].map((f) => ({ f, base: S.cueLine(NP, { width: 1, opacity: 0.16 }), dash: S.cueLine(NP, { dash: [0.36, 0.3], width: 1.4, opacity: 0.6 }), cold: S.cueLine(18, { dash: [0.36, 0.3], width: 1.6, opacity: 0.9, color: 0x4fc3e0 }) }));
  const frost = Array.from({ length: 10 }, () => S.cueLine(26, { width: 2.2, opacity: 0, color: 0xcfe6ff })), frostV = [0, 1].map(() => S.cueLine(2, { width: 3, opacity: 0, color: 0xcfe6ff })), frostR = [0, 1].map(() => S.cueLine(25, { width: 1.6, opacity: 0, color: 0xcfe6ff }));
  const inA = S.cueArrow({ color: 0xf2f1ec, width: 2.6, head: 0.36 }), outA = S.cueArrow({ color: 0xf2f1ec, width: 2.2, head: 0.3 });
  // fuel: up the nozzle from below the float-bowl level into the throat, where the low pressure draws it out as spray
  const fuelL = S.cueLine(3, { width: 3, opacity: 0.95, color: 0x5b8fe8 }), spray = [0, 1, 2].map(() => S.cueLine(2, { dash: [0.12, 0.1], width: 1.6, opacity: 0.8, color: 0x8fb3f0 }));
  fuelL.set([[NZX, LEVEL - 0.25, 0.04], [NZX, -0.12, 0.04], [0.02, 0.0, 0.04]]);
  const valveAng = () => (pwr === "cruise" ? 62 : 14);   // degrees open from closed: cruise well open, low power nearly closed
  function scene3d() { const fi = eng === "fi", rk = risk(oat, rh), cold = !fi && rk > 0, R = (x) => (fi ? R0 : hw(x));
    M3.carb.visible = !fi; M3.inj.visible = fi; fuelL.opacity = fi ? 0 : 0.95;
    spray.forEach((sp, j) => { const a = (j - 1) * 0.16; sp.set([[0.05, 0, 0.045], [0.05 + 0.85 * Math.cos(a), 0.85 * Math.sin(a), 0.045]]); sp.opacity = fi ? 0 : 0.8; }); M3.valve.rotation.z = valveAng() * D; M3.door.rotation.z = filt ? 52 * D : 0;
    sl.forEach((l) => { const pts = xsF.map((x) => [x, l.f * R(Math.max(X0, Math.min(X1, x))), 0.03]); l.base.set(pts); l.dash.set(pts); l.dash.opacity = 0.6;
      const cp = Array.from({ length: 18 }, (_, i) => { const x = -WV * 0.8 + (WV * 2.1 * i) / 17; return [x, l.f * R(x), 0.04]; }); l.cold.set(cp); l.cold.opacity = cold ? 0.9 : 0; });
    // frost: layered contours inside the throat (both walls in the cut plane), plus rings at the throat and on the valve
    const th = !fi ? ice * THR * 0.42 : 0;
    frost.forEach((fr, j) => { const sg = j < 5 ? 1 : -1, k = ((j % 5) + 1) / 5; if (th < 0.01) { fr.opacity = 0; return; }
      fr.set(Array.from({ length: 26 }, (_, i) => { const u = i / 25, x = -WV * 0.6 + WV * 1.75 * u, env = Math.sin(Math.PI * u) ** 0.7, bump = 0.8 + 0.2 * Math.sin(i * 2.1 + j); return [x, sg * (hw(x) - th * k * env * bump), 0.05]; })); fr.opacity = 0.35 + 0.55 * k; });
    frostR.forEach((fr, j) => { if (th < 0.01) { fr.opacity = 0; return; } const x = j ? 0.5 : -0.25; fr.set(ring(x, hw(x) - th * 0.8)); fr.opacity = 0.6; });
    const a = valveAng() * D, rv = hw(TVX) - 0.05, ex = Math.sin(a) * rv, ey = Math.cos(a) * rv;   // valve edge in the cut plane
    frostV.forEach((fr, j) => { if (fi || ice < 0.3) { fr.opacity = 0; return; } const o = (j ? -1 : 1) * 0.06; fr.set([[TVX - ex + o, ey, 0.05], [TVX + ex + o, -ey, 0.05]]); fr.opacity = 0.75 * ice; });
    inA.set([X0 - 1.5, 0, 0.05], [X0 - 0.3, 0, 0.05]); outA.set([X1 + 0.3, 0, 0.05], [X1 + 1.3, 0, 0.05]); S.kick(); }
  // in carb heat, the inlet arrow turns warm: rebuild it in the warm color only when the state flips
  let warmA = null; const warm = (on) => { if (on && !warmA) { warmA = S.cueArrow({ color: 0xe0894a, width: 2.8, head: 0.38 }); } if (warmA) { warmA.set([X0 - 1.5, 0, 0.06], [X0 - 0.3, 0, 0.06]); warmA.opacity = on ? 1 : 0; } inA.opacity = on ? 0 : 1; };
  // ---------- strip under the stage: likelihood chart (carburetor engines) or the induction summary (fuel injected), and the gauge ----------
  const strip = h("div", { class: "vstrip" }); F.stage.after(strip); const sv = s("svg", { class: "full", role: "img" }, strip); let sg = s("g", {}, sv);
  const r0 = row(F.ctrl, "Engine"); chips(r0, [["fp", "Carb, fixed pitch"], ["cs", "Carb, constant speed"], ["fi", "Fuel injected"]], eng, (v) => { eng = v || "fp"; ice = 0; heat = false; filt = false; hc.set("off"); fc.set(null); syncRows(); upd(); }, { label: "Engine" });
  const r1 = row(F.ctrl, "Air"); slider(r1, { label: "Outside air", min: 20, max: 110, value: oat, fmt: (v) => v + " °F", oninput: (v) => { oat = v; upd(); } });
  slider(r1, { label: "Humidity", min: 30, max: 100, value: rh, fmt: (v) => v + "%", oninput: (v) => { rh = v; upd(); } });
  const r2 = row(F.ctrl, "Power"); chips(r2, [["cruise", "Cruise"], ["desc", "Descent, low power"]], pwr, (v) => { pwr = v || "cruise"; upd(); }, { label: "Power" });
  const r3 = row(F.ctrl, "Carb heat"); const hc = chips(r3, [["off", "Off"], ["on", "Full on"]], "off", (v) => { heat = v === "on"; hc.set(heat ? "on" : "off"); upd(); }, { label: "Carb heat" });
  const r4 = row(F.ctrl, "Air filter"); const fc = chips(r4, [["blk", "Filter blocked by ice"]], null, (v) => { filt = v === "blk"; upd(); }, { label: "Air filter", toggle: true });
  function syncRows() { const fi = eng === "fi"; r3.classList.toggle("off", fi); r4.classList.toggle("off", !fi); r3.querySelectorAll("button").forEach((b) => (b.disabled = fi)); r4.querySelectorAll("button").forEach((b) => (b.disabled = !fi)); }
  syncRows();
  let gauge = null;
  const base = () => (pwr === "cruise" ? 1 : 0.62);
  function target() { const b = base(); let p = b * (1 - 0.3 * ice) - pen; if (eng === "fi" && filt) p = b * 0.9; return p; }
  let shown = 1;
  const A = anim(F, (dt) => { let more = false;
    if (eng !== "fi") { const rk = risk(oat, rh); if (heat) { if (ice > 0) { ice = Math.max(0, ice - 0.07 * dt); melt = ice > 0 ? 1 : 0; more = true; } else melt = 0; }
      else if (rk && ice < 1) { ice = Math.min(1, ice + (rk === 2 ? 0.045 : 0.018) * (pwr === "desc" ? 1.6 : 1) * dt); more = true; } }
    let m; [pen, m] = toward(pen, eng !== "fi" && heat ? 0.08 * base() : 0, 2.2, dt, 1e-4); more = more || m;
    [shown, m] = toward(shown, target(), 2.5, dt, 1e-4); more = more || m; redraw(); return more; });
  function upd() { redraw(); A.kick(); }
  function drawStrip(g, W) { const fi = eng === "fi", rk = risk(oat, rh), wide = W >= 600, pad = 16, Hh = wide ? 236 : 214;
    const cw = wide ? W * 0.62 : W * 0.6, gx0 = pad + (wide ? 50 : 40), gy0 = 34, gw = cw - gx0 - 8, gh = Hh - gy0 - 48;
    if (!fi) {
      const X = (tt) => gx0 + ((tt - 20) / 90) * gw, Y = (hh) => gy0 + gh - ((hh - 30) / 70) * gh;
      if (wide) { T(g, pad, 18, "Carburetor icing likelihood", { size: 11, fill: INK, weight: 600 }); T(g, cw, 18, "PHAK Ch 7", { size: 11, anchor: "end", fill: DIM }); }
      else T(g, pad, 18, "Icing likelihood · PHAK 7", { size: 11, fill: INK, weight: 600 });
      R(g, gx0, gy0, gw, gh, { fill: "#0d0d10", stroke: "rgba(242,241,236,.16)", sw: 1 });
      R(g, X(20), Y(100), X(100) - X(20), Y(50) - Y(100), { fill: rk === 1 ? "rgba(217,178,58,.30)" : "rgba(217,178,58,.13)" });
      R(g, X(20), Y(100), X(70) - X(20), Y(80) - Y(100), { fill: rk === 2 ? "rgba(217,73,62,.50)" : "rgba(217,73,62,.2)" });
      for (let tt = 30; tt < 110; tt += 10) L(g, X(tt), gy0, X(tt), gy0 + gh, { stroke: "rgba(242,241,236,.07)", w: 1 });
      for (let hh = 40; hh < 100; hh += 10) L(g, gx0, Y(hh), gx0 + gw, Y(hh), { stroke: "rgba(242,241,236,.07)", w: 1 });
      // region names sit on the side away from the plotted point so they never cover it
      const pt = Math.max(20, Math.min(110, oat));
      T(g, pt > 45 ? X(20) + 6 : X(70) - 6, Y(90) + 4, "likely", { size: 11, anchor: pt > 45 ? "start" : "end", fill: INK, weight: 600 }); T(g, pt < 66 ? X(100) - 6 : X(20) + 6, Y(65) + 4, "possible", { size: 11, anchor: pt < 66 ? "end" : "start", fill: INK });
      (wide ? [20, 40, 60, 80, 100] : [20, 60, 100]).forEach((tt) => T(g, X(tt), gy0 + gh + 14, String(tt), { size: 11, anchor: "middle", fill: GRAY }));
      [40, 50, 80, 100].forEach((hh) => T(g, gx0 - 5, Y(hh) + 4, String(hh), { size: 11, anchor: "end", fill: GRAY }));
      T(g, gx0 + gw / 2, gy0 + gh + 32, "Temperature °F", { size: 11, anchor: "middle", fill: GRAY });
      const yl = T(g, 0, 0, wide ? "Relative humidity %" : "Humidity %", { size: 11, anchor: "middle", fill: GRAY }); yl.setAttribute("transform", `translate(${pad + 4} ${gy0 + gh / 2}) rotate(-90)`); yl.setAttribute("dominant-baseline", "middle");
      const px = X(Math.min(110, Math.max(20, oat))), py = Y(Math.max(30, Math.min(100, rh)));
      L(g, px, py, px, gy0 + gh, { stroke: ACC, w: 1, dash: "3 3", op: 0.7 }); L(g, gx0, py, px, py, { stroke: ACC, w: 1, dash: "3 3", op: 0.7 });
      C(g, px, py, 11, { fill: "rgba(59,130,246,.28)" }); C(g, px, py, 6, { fill: ACC, stroke: INK, sw: 1.6 });
    } else {
      // wide: key left, value right on one line; phone: key over value so the narrow column never collides
      if (wide) { T(g, pad, 18, "Fuel-injected induction", { size: 11, fill: INK, weight: 600 }); T(g, cw, 18, "POH 7", { size: 11, anchor: "end", fill: DIM }); }
      else T(g, pad, 18, "Fuel injection · POH 7", { size: 11, fill: INK, weight: 600 });
      const rowsI = [["Carburetor ice", wide ? "none: no venturi, no carburetor" : "none: no venturi", INK], ["Impact ice", filt ? (wide ? "has blocked the air filter" : "blocked the filter") : (wide ? "can still block the air filter" : "can block the filter"), filt ? ICE : GRAY], ["Alternate air door", filt ? "open (suction)" : "closed", filt ? ACC : GRAY], ["Full-throttle power", filt ? "about 10% less" : "normal", filt ? INK : GRAY]];
      rowsI.forEach(([k, v2, col], i) => { if (wide) { const y = 50 + i * ((Hh - 70) / 4); L(g, pad, y + 16, cw, y + 16, { stroke: "rgba(242,241,236,.07)", w: 1 }); T(g, pad, y, k, { size: 11, fill: GRAY }); T(g, cw, y, v2, { size: 13, anchor: "end", fill: col, weight: 600 }); }
        else { const y = 42 + i * 43; T(g, pad, y, k, { size: 10, fill: GRAY }); T(g, pad, y + 16, v2, { size: 12, fill: col, weight: 600 }); if (i < 3) L(g, pad, y + 25, cw, y + 25, { stroke: "rgba(242,241,236,.07)", w: 1 }); } }); }
    const gr = Math.min(wide ? 74 : 60, (W - cw - 24) / 2 - 4), gcx = cw + (W - cw) / 2, gcy = Hh / 2 + 2;
    if (eng === "cs") gauge = dial(g, gcx, gcy, gr, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", focus: true, value: 10 + shown * 14 });
    else gauge = dial(g, gcx, gcy, gr, { min: 0, max: 3000, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [500, 1000, 1500, 2000, 2500], nums: [[1000, "10"], [2000, "20"]], title: "RPM ×100", focus: true, value: 2400 * shown });
    return Hh; }
  let lastLab = "";
  function redraw() { const W = strip.clientWidth || 600; sg.remove(); sg = s("g", {}, sv); const Hh = drawStrip(sg, W); sv.setAttribute("viewBox", `0 0 ${W} ${Hh}`); sv.setAttribute("height", Hh); strip.style.height = Hh + "px";
    scene3d(); warm(heat && eng !== "fi");
    // accent: the throttle valve on a carburetor; the filter and alternate air door when fuel injected
    const fk = eng === "fi" ? (filt ? "fi+" : "fi") : "carb"; if (fk !== focusSet) { const nm = fk === "carb" ? ["valve"] : fk === "fi+" ? ["door", "filter"] : ["filter"]; if (focusSet === null) S.highlight(nm); else S.focus(nm); if ((focusSet || "").slice(0, 2) !== fk.slice(0, 2) && focusSet !== null) { viewDur = 1200; band(); } focusSet = fk; } const key = [eng, heat, filt, oat, risk(oat, rh)].join(); if (key !== lastLab) { lastLab = key; labels(); }
    const rk = risk(oat, rh);
    let cap;
    if (eng === "fi") cap = filt ? ["Alternate air", "The filter is blocked, so engine suction opened the alternate air door. Expect about 10% less power at full throttle."] : ["Fuel injected", "No venturi, so no carburetor ice, but impact ice can still block the air filter."];
    else if (heat && melt) cap = ["Carb heat on, ice melting", (eng === "cs" ? "Manifold pressure" : "RPM") + " dropped, and now rises as the ice melts. Keep full heat on until it's gone."];
    else if (heat && ice <= 0) cap = ["Carb heat on, no ice", "Power dropped and stays down: no ice. Carb heat costs up to 15% power, so don't use it for takeoff."];
    else if (ice > 0.05) cap = ["Ice building", (eng === "cs" ? "Manifold pressure drops; RPM stays the same. Apply full carb heat." : "RPM drops, maybe with roughness. Apply full carb heat.") + (pwr === "desc" ? " Low power in a descent is the most dangerous time." : "")];
    else cap = [rk === 2 ? "Icing likely" : rk ? "Icing possible" : "Icing unlikely", rk ? "Worst below 70 °F and above 80% humidity; possible up to 100 °F and down to 50%." : "Outside the chart. Still watch for symptoms."];
    F.caption(cap[0], cap[1]); }
  const sro = new ResizeObserver(() => redraw()); sro.observe(strip); F.on(() => sro.disconnect());
  // labels follow the camera while it settles after a resize or a view change, then stay put
  S.setFlow(true, (now) => { if (now < labUntil) labels(); });
  F.explain(`<p>Evaporating fuel and expanding air cool the venturi, so ice can form on a warm, humid day. Use full carb heat, never partial, and apply it before you reduce power for a descent. Your airplane's POH says when to use it.</p>`);
  band(); upd();
  return { destroy: () => { A.stop(); S.destroy(); F.destroy(); } };
}
