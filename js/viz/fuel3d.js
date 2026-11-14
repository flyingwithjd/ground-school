// 172S fuel system in 3D (x-ray, blue = fuel that is flowing). Sequence per C172S POH Sec 7: fuel flows by gravity from the
// two vented integral wing tanks to the three-position selector valve, then through a reservoir tank, the electric
// auxiliary pump, the fuel shutoff valve, the fuel strainer, the engine-driven pump, the fuel/air control unit, the
// distribution valve (manifold) and the injector nozzles. Locations are approximate; routing is schematic.
// opts.limits: the POH Sec 2 fuel limitations (fuelState() from fuellim.js): 28 gal per tank, 1.5 unusable each;
// BOTH for takeoff and landing; LEFT/RIGHT for level flight only; one tank dry: slips/skids 30 s max; engine-driven pump
// failure stops the engine until the aux pump is ON (POH 3).
import { frame, chips, slider, row } from "./base.js?v=ac7792ed3c";
import { h } from "../core/util.js?v=ac7792ed3c";
import { rich } from "../core/rich.js?v=ac7792ed3c";
import { planeStage } from "./planestage.js?v=ac7792ed3c";
import { tags3d } from "./tags3d.js?v=ac7792ed3c";
import { fuelState } from "./fuellim.js?v=ac7792ed3c";
const ACC = 0x3b82f6, OFF = 0x4b5160, RED = 0xef4444, CAP = 28, UNUSE = 1.5;
const NODES = [
  ["tank", "Wing tanks", "Vented integral tanks in each wing: 28 gal each, 26.5 usable. Fuel flows to the selector by gravity.", { tg: [0.2, 5.6, 0], az: -32, el: 30, d: 30 }],
  ["sel", "Selector valve", "BOTH, LEFT or RIGHT. Takeoff and landing are normally on BOTH. Confirm with your POH.", { tg: [0.6, 3.4, 0], az: -48, el: 30, d: 11 }],
  ["res", "Reservoir tank", "Small tank below the selector that keeps the line full.", { tg: [0.6, 3.1, 0], az: -48, el: 26, d: 11 }],
  ["aux", "Auxiliary pump", "Electric pump for priming and as a backup to the engine-driven pump.", { tg: [1.8, 3.2, 0], az: -50, el: 24, d: 11 }],
  ["shut", "Shutoff valve", "Red knob. Pulled out, it stops fuel to the engine (engine fire, for example).", { tg: [2.8, 3.3, 0], az: -50, el: 24, d: 11 }],
  ["str", "Fuel strainer", "Traps water and sediment. Sample its drain on preflight.", { tg: [4.0, 3.4, 0], az: -50, el: 20, d: 11 }],
  ["edp", "Engine-driven pump", "Normal source of fuel pressure once the engine runs.", { tg: [4.6, 3.8, 0], az: -46, el: 22, d: 11 }],
  ["fcu", "Fuel/air control unit", "Meters fuel to match the airflow set by the throttle and mixture.", { tg: [5.0, 3.6, 0], az: -46, el: 18, d: 11 }],
  ["dist", "Distribution valve", "Splits the metered fuel evenly among the four cylinders.", { tg: [5.1, 4.4, 0], az: -42, el: 34, d: 11 }],
  ["noz", "Injector nozzles", "One per cylinder, spraying into the intake port.", { tg: [5.1, 4.4, 0], az: -42, el: 34, d: 11 }],
];
const P = { sel: [0.4, 3.25, 0], res: [0.4, 2.8, 0], aux: [1.6, 2.95, 0.25], shut: [2.8, 3.05, 0.25], str: [3.85, 3.25, -0.3], edp: [4.3, 3.95, 0.35], fcu: [5.0, 3.2, 0], dist: [5.2, 4.75, 0] };
const NOZ = [[4.55, 4.35, -1.05], [5.55, 4.35, -1.05], [4.55, 4.35, 1.05], [5.55, 4.35, 1.05]];
const TK = (s) => ({ x: 0.2, y: 6.72, z: s * 5.15 });
export function mount(host, opts = {}) {
  const LIM = !!opts.limits;
  const F = frame(host, { cls: LIM ? "fuel3d lim capin" : "fuel3d capin", corners: { tl: LIM ? "Fuel limitations · 172S" : "Fuel system · 172S", tr: LIM ? "POH 2, 3" : "C172S POH 7" } });
  const OV = LIM ? { tg: [0.8, 5.0, 0], az: -14, el: 26, d: 41 } : { tg: [0.6, 4.9, 0], az: -36, el: 30, d: 34 };
  const S = planeStage(F.stage, { view: OV, maxFps: 30 }), THREE = S.THREE, G = S.cueGroup;
  const topY = () => { const c = F.stage.querySelector(".corner.tl"), r = F.stage.querySelector(".corner.tr"); return Math.max(34, ...[c, r].filter(Boolean).map((e) => e.offsetTop + e.offsetHeight + 6)); };
  S.highlight([]); S.setInkOpacity(0.4);
  const xm = (c, op = 0.9) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthTest: false, depthWrite: false });
  const xl = (c) => new THREE.LineBasicMaterial({ color: c, transparent: true, depthTest: false });
  const solid = (geo, at, c = 0x0c2c6e) => { const g = new THREE.Group(), m = new THREE.Mesh(geo, xm(c, 0.85)), e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), xl(ACC)); g.add(m, e); g.position.set(...at); m.renderOrder = 8; e.renderOrder = 9; G.add(g); return { g, m, e }; };
  // tanks with a fill level
  const tanks = {}; [["L", -1], ["R", 1]].forEach(([k, sd]) => { const t = TK(sd), shell = new THREE.BoxGeometry(2.3, 0.42, 5.6), o = solid(shell, [t.x, t.y, t.z]); o.m.material.opacity = 0.18;
    const fg = new THREE.BoxGeometry(2.24, 1, 5.54); fg.translate(0, 0.5, 0); const fill = new THREE.Mesh(fg, xm(ACC, 0.6)); fill.position.set(t.x, t.y - 0.21, t.z); fill.renderOrder = 8; G.add(fill); tanks[k] = { o, fill }; });
  // components
  const comp = { sel: solid(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 18), P.sel), res: solid(new THREE.BoxGeometry(0.5, 0.3, 0.4), P.res), aux: solid(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 12), P.aux),
    shut: solid(new THREE.BoxGeometry(0.22, 0.22, 0.22), P.shut, 0x5a1010), str: solid(new THREE.CylinderGeometry(0.13, 0.13, 0.36, 12), P.str), edp: solid(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 12), P.edp),
    fcu: solid(new THREE.BoxGeometry(0.42, 0.3, 0.36), P.fcu), dist: solid(new THREE.CylinderGeometry(0.16, 0.12, 0.16, 12), P.dist) };
  comp.aux.g.rotation.z = Math.PI / 2; comp.str.g.rotation.z = 0; comp.edp.g.rotation.z = Math.PI / 2;
  const ptr = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.06), xm(0xffffff, 1)); ptr.position.set(P.sel[0], P.sel[1] + 0.08, P.sel[2]); ptr.renderOrder = 10; G.add(ptr);
  const noz = NOZ.map((p) => solid(new THREE.SphereGeometry(0.08, 10, 8), p));
  // fuel lines with moving fuel
  const lines = [], line = (pts) => { const l = S.cueLine(pts.length, { color: OFF, width: 2.6, opacity: 1 }); l.set(pts); l.obj.material.depthTest = false; l.obj.renderOrder = 7;
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0), len = curve.getLength(), n = Math.max(2, Math.round(len / 0.7));
    const dots = Array.from({ length: n }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), xm(0xbfdbfe, 1)); d.renderOrder = 10; G.add(d); return d; });
    const o = { l, curve, dots, on: false }; lines.push(o); return o; };
  const L = { L: line([[0.9, 6.55, -2.4], [1.3, 6.3, -1.85], [1.2, 3.7, -1.75], [0.55, 3.3, -0.3], P.sel]), R: line([[0.9, 6.55, 2.4], [1.3, 6.3, 1.85], [1.2, 3.7, 1.75], [0.55, 3.3, 0.3], P.sel]),
    main: line([P.sel, P.res, [1.0, 2.85, 0.2], P.aux, P.shut, [3.4, 3.1, 0], P.str, [4.1, 3.6, 0.3], P.edp, [4.7, 3.5, 0.2], P.fcu, [5.4, 3.9, 0.2], P.dist]) };
  const spider = NOZ.map((p) => line([P.dist, [(P.dist[0] + p[0]) / 2, 4.7, p[2] * 0.6], p]));
  const TG = tags3d(F.stage), tPart = TG.add("", {}), tL = TG.add("Left tank", { dx: -30, dy: -40 }), tR = TG.add("Right tank", { dx: 30, dy: -40 });
  let sel = "BOTH", shut = false, step = -1, qL = 20, qR = 20, flight = "level", edp = true, aux = false, t = 0;
  const pickSel = chips(row(F.ctrl, "Selector"), [["BOTH", "Both"], ["LEFT", "Left"], ["RIGHT", "Right"]], sel, (v) => { sel = v || "BOTH"; t = 0; upd(); }, { label: "Fuel selector" });
  if (!LIM) {
    chips(row(F.ctrl, "Shutoff"), [["open", "Shutoff open"], ["closed", "Shutoff closed"]], "open", (v) => { shut = v === "closed"; upd(); }, { label: "Shutoff valve" });
    const prev = h("button", { type: "button", class: "chip", "aria-label": "Previous part" }, "‹"), next = h("button", { type: "button", class: "btn pri fu-next" }, "Follow the fuel ›"), lab = h("span", { class: "fu-step" }, "");
    F.ctrl.append(h("div", { class: "fu-row" }, prev, next, lab));
    const go = (d) => { step = Math.max(-1, Math.min(NODES.length - 1, step + d)); if (step === NODES.length - 1 && d > 0 && lab.dataset.end) { step = -1; delete lab.dataset.end; } else if (step === NODES.length - 1) lab.dataset.end = 1; else delete lab.dataset.end;
      next.textContent = step === NODES.length - 1 ? "Start over" : step < 0 ? "Follow the fuel ›" : "Next ›"; lab.textContent = step < 0 ? "" : `${step + 1} / ${NODES.length}`; prev.disabled = step < 0; S.setView(step < 0 ? OV : NODES[step][3]); upd(); };
    prev.onclick = () => go(-1); prev.disabled = true; next.onclick = () => go(step === NODES.length - 1 ? 1 : 1);
  } else {
    chips(row(F.ctrl, "Flight"), [["to", "Takeoff, landing"], ["level", "Level cruise"], ["slip", "Slip or skid"]], flight, (v) => { flight = v || "level"; t = 0; upd(); }, { label: "Flight" });
    const r2 = row(F.ctrl, "Fuel"); slider(r2, { label: "Left tank", min: 0, max: CAP, step: 0.5, value: qL, fmt: (v) => v.toFixed(1) + " gal", oninput: (v) => { qL = v; t = 0; upd(); } });
    slider(r2, { label: "Right tank", min: 0, max: CAP, step: 0.5, value: qR, fmt: (v) => v.toFixed(1) + " gal", oninput: (v) => { qR = v; t = 0; upd(); } });
    const r3 = row(F.ctrl, "Pumps"); chips(r3, [["fail", "Engine pump fails"]], null, (v) => { edp = v !== "fail"; upd(); }, { label: "Engine-driven pump", toggle: true });
    chips(r3, [["on", "Aux pump ON"]], null, (v) => { aux = v === "on"; upd(); }, { label: "Aux fuel pump", toggle: true });
  }
  let st = null, last = performance.now(), ph = 0, capK = "";
  function upd() { pickSel.set(sel);
    st = LIM ? fuelState({ qL, qR, sel, flight, edp, aux, t }) : { feed: sel === "BOTH" ? ["L", "R"] : [sel[0]], run: !shut, warn: null };
    const run = st.run, feeds = (k) => st.feed.includes(k) && (!LIM || (k === "L" ? qL : qR) > UNUSE);
    L.L.on = feeds("L") && run; L.R.on = feeds("R") && run; L.main.on = run; spider.forEach((s) => (s.on = run));
    lines.forEach((o) => { o.l.obj.material.color.setHex(o.on ? ACC : OFF); });
    ptr.rotation.y = sel === "BOTH" ? Math.PI / 2 : sel === "LEFT" ? 0 : Math.PI;
    comp.shut.e.material.color.setHex(shut ? RED : ACC); comp.edp.e.material.color.setHex(LIM && !edp ? RED : ACC); comp.aux.m.material.color.setHex(LIM && aux ? ACC : 0x0c2c6e);
    ["L", "R"].forEach((k) => { const q = LIM ? (k === "L" ? qL : qR) : 20, f = tanks[k].fill; f.scale.y = Math.max(0.005, (q / CAP) * 0.42); f.material.color.setHex(feeds(k) && run ? ACC : q > UNUSE ? 0x6b7280 : RED); tanks[k].o.e.material.color.setHex(feeds(k) && run ? ACC : OFF); f.material.opacity = feeds(k) && run ? 0.6 : 0.35; });
    Object.entries(comp).forEach(([k, o]) => { const on = step >= 0 && NODES[step][0] === k; o.g.scale.setScalar(on ? 1.5 : 1); });
    noz.forEach((o) => o.g.scale.setScalar(step >= 0 && NODES[step][0] === "noz" ? 1.6 : 1));
    caption(); S.kick(); }
  function caption() { let c, ex;
    if (LIM) { c = st.warn ? st.warn.slice(1) : sel === "BOTH" ? ["Within limits", "BOTH feeds from both tanks. Use it for takeoff, landing and maneuvering."] : ["Within limits", "One tank in level flight is fine. Watch the balance between tanks."];
      ex = `Each tank holds 28 gallons; 1.5 gallons in each can't be used (below the gauge's red 0). Grades: 100LL (blue) or 100 (green). Your airplane's POH has the limits for its tanks. <span class="src">C172S POH 2, 3</span>`; }
    else if (step >= 0) { const n = NODES[step]; c = [`Step ${step + 1}: ${n[1]}`, shut && step >= 4 ? "Shutoff closed: no fuel gets here" : n[1]]; ex = `<b>${n[1]}.</b> ${rich(n[2])} <span class="src">C172S POH 7</span>`; }
    else { c = shut ? ["Shutoff closed", "Fuel stops at the shutoff valve"] : [sel === "BOTH" ? "Selector on BOTH" : `Selector on ${sel}`, sel === "BOTH" ? "Both tanks feed the engine" : `Only the ${sel.toLowerCase()} tank feeds`];
      ex = `Tap <b>Follow the fuel</b> to trace it from the wing tanks to the cylinders, one part at a time. <span class="src">C172S POH 7</span>`; }
    const k = c.join("|") + ex; if (k !== capK) { capK = k; F.caption(c[0], c[1]); F.explain(ex); } }
  S.animate(() => { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; ph = (ph + dt * 0.5) % 1;
    if (LIM && st && st.warn && st.warn[0] === "dry" && t < 30) { t = Math.min(30, t + dt); upd(); }
    lines.forEach((o) => o.dots.forEach((d, i) => { d.visible = o.on; if (o.on) d.position.copy(o.curve.getPointAt(((i + ph * 1.0) / o.dots.length) % 1)); }));
    const items = [];
    if (step >= 0) { const k = NODES[step][0]; tPart.el.textContent = NODES[step][1]; tPart.on = true; const at = k === "tank" ? [TK(-1).x, TK(-1).y, TK(-1).z] : k === "noz" ? NOZ[0] : P[k]; items.push({ t: tPart, q: S.project(at) }); tPart.dx = -40; tPart.dy = 46; } else tPart.on = false;
    const showT = step <= 0; tL.on = tR.on = showT && (LIM || step === 0);
    if (LIM) { tL.el.textContent = `Left: ${Math.max(0, qL - UNUSE).toFixed(1)} gal usable`; tR.el.textContent = `Right: ${Math.max(0, qR - UNUSE).toFixed(1)} gal usable`; tL.dx = 10; tL.dy = 50; tR.dx = -10; tR.dy = 50; }
    items.push({ t: tL, q: S.project([TK(-1).x, TK(-1).y, TK(-1).z - 1.5]) }, { t: tR, q: S.project([TK(1).x, TK(1).y, TK(1).z + 1.5]) });
    TG.place(items, topY());
    return lines.some((o) => o.on) || (LIM && st && st.warn && st.warn[0] === "dry" && t < 30); }, { idle: true });
  upd();
  return { destroy() { S.destroy(); F.destroy(); } };
}
