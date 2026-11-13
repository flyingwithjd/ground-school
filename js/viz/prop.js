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
import { frame, chips, slider, row } from "./base.js?v=c8fe6c3cee";
import { planeStage } from "./planestage.js?v=c8fe6c3cee";
import { airfoil, loftGeo, loftSegs, modelKit } from "./section-models.js?v=c8fe6c3cee";
import { T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=c8fe6c3cee";
import { dial, anim, toward, COL } from "./dial.js?v=c8fe6c3cee";
import { s, h, reduced } from "../core/util.js?v=c8fe6c3cee";
const RAD = 0.96, ST = [0.3, 0.6, 0.9], KT = 0.5144, D = Math.PI / 180, PITCH = 1.71, LOW = 10, HIGH = 38;
export const fixedRpm = (thr, v) => 600 + thr * (1750 + 2.2 * v) + v * 0.8; // thr 0-1, v knots
export const phi = (v, rpm, r) => Math.atan2(v * KT, (Math.max(rpm, 1) / 60) * 2 * Math.PI * r) / D;
export const betaFixed = (r, twist = true) => (twist ? Math.atan(PITCH / (2 * Math.PI * r)) : Math.atan(PITCH / (2 * Math.PI * 0.75 * RAD))) / D;
// ---------- 3D propeller: feet; x forward (spinner tip +x), blades in the y-z plane, blade 1 along +y moving toward +z ----------
const RF = 38 / 12, F0 = 0.17, NR = 22;
const chordAt = (f) => 1.35 * (0.27 + 0.26 * Math.sin(Math.PI * Math.min(1, (f - F0) / (1 - F0) * 0.78 + 0.12)) - 0.12 * Math.max(0, (f - 0.9) / 0.1) ** 2);   // chord drawn about 1.35x for clarity
const ringAt = (f, be, grow = 1) => { const c = chordAt(f) * grow, [U, Lo] = airfoil(14, Math.max(0.085, 0.22 - 0.14 * f), 0.03), pts = [...U, ...Lo.slice(1, -1).reverse()], b = be * D, cd = [-Math.sin(b), -Math.cos(b)], nn = [Math.cos(b), -Math.sin(b)];
  return pts.map(([u, y]) => { const a = (u - 0.3) * c, t = y * c; return [a * cd[0] + t * nn[0], f * RF, a * cd[1] + t * nn[1]]; }); };
function propModel(THREE) { const K = modelKit(THREE), hub = new THREE.Group(); K.root.add(hub);
  // spinner: a short lathe pointing forward
  const prof = Array.from({ length: 12 }, (_, i) => { const u = i / 11; return new THREE.Vector2(0.46 * Math.sqrt(Math.max(0, 1 - u * u)) + 0.001, 0.95 * u - 0.25); });
  const sg = new THREE.LatheGeometry(prof, 28); sg.rotateZ(-Math.PI / 2); const sp = K.add("spinner", hub, sg, Array.from(new THREE.EdgesGeometry(sg, 25).attributes.position.array)); sp.position.x = 0.15;
  const blades = []; for (let b = 0; b < 2; b++) { const bg = new THREE.Group(); bg.rotation.x = b * Math.PI; hub.add(bg); const pg = new THREE.Group(); bg.add(pg);
    const vars = {}; for (const [key, tw] of [["tw", true], ["fl", false]]) { const vg = new THREE.Group(); pg.add(vg); vars[key] = vg;
      const fs = Array.from({ length: NR }, (_, i) => F0 + ((1 - F0) * i) / (NR - 1)), rings = fs.map((f) => ringAt(f, betaFixed(f * RAD, tw)));
      K.add(tw ? "blade" : "bladeFlat", vg, loftGeo(THREE, rings), loftSegs(rings, 3, [0, 7, 14, 21]));
      if (b === 0) ST.forEach((f, i) => { const r = ringAt(f, betaFixed(f * RAD, tw), 1.18), sgm = []; for (let j = 0; j < r.length; j++) sgm.push(...r[j], ...r[(j + 1) % r.length]); K.add((tw ? "st" : "sf") + (i + 1), vg, null, sgm); }); }
    blades.push({ pg, vars }); }
  return K.model({ hub, blades }); }
export function mount(host) {
  let mode = "fixed", twist = true, v = 0, thr = 1, set = 2400, b75 = betaFixed(0.75 * RAD), rpmCS = 2400;
  const F = frame(host, { cls: "capin sec3d prop3d", corners: { tl: "Propeller", tr: "PHAK 7 · POH 2" } });
  F.root.dataset.live = "1";   // the prop turns slowly while on screen; zero frames offscreen
  const S = planeStage(F.stage, { model: propModel, cg: [0, 0, 0], orbit: false, maxFps: 30, fov: 22, view: { tg: [0, 0, 0], az: 34, el: 12, d: 22, fov: 22 } });
  const M3 = S.P;
  // the propeller arc: a faint dashed circle at the tips (the disk the blades sweep)
  { const arc = S.cueLine(73, { dash: [0.35, 0.3], width: 1, opacity: 0.22 }); arc.set(Array.from({ length: 73 }, (_, i) => { const a = (i / 72) * 2 * Math.PI; return [0, Math.cos(a) * RF, Math.sin(a) * RF]; })); }
  const band = () => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 4 : 0);
    const r = F.stage.getBoundingClientRect(), Hh = Math.max(1, r.height - (+F.stage.dataset.band || 0)), TN = Math.tan(11 * D), d = Math.max(6.7 / (2 * TN), 7.8 / (2 * TN * (r.width / Hh))); S.setView({ tg: [0.2, 0, 0], az: 24, el: 50, d, fov: 22 }, 1); };   // from ahead and above, the disk reads as a wide ellipse that fills the stage
  const bro = new ResizeObserver(band); bro.observe(F.stage); F.on(() => bro.disconnect());
  // section insets + gauges: their own SVG strip under the stage, drawn in screen pixels
  const strip = h("div", { class: "vstrip" }); F.stage.after(strip);
  const svgEl = s("svg", { class: "full", role: "img" }, strip); s("defs", {}, svgEl).innerHTML = `<marker id="pkahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${GRAY}"/></marker>`;
  let gEl = s("g", {}, svgEl);
  const redraw = () => { const W = strip.clientWidth || 600; gEl.remove(); gEl = s("g", {}, svgEl); const H = draw(gEl, W); svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`); svgEl.setAttribute("height", H); strip.style.height = H + "px"; apply3d(); };
  const sro = new ResizeObserver(() => redraw()); sro.observe(strip); F.on(() => sro.disconnect());
  const S0 = { F, redraw };
  const r0 = row(F.ctrl, "Prop"); chips(r0, [["fixed", "Fixed pitch"], ["cs", "Constant speed"]], mode, (k) => { mode = k || "fixed"; r4.classList.toggle("off", mode !== "cs"); rs.input.disabled = mode !== "cs"; b75 = targetB(); rpmCS = set; upd(); }, { label: "Prop" });
  const r1 = row(F.ctrl, "Blade"); chips(r1, [["tw", "Twisted"], ["flat", "No twist"]], "tw", (k) => { twist = k !== "flat"; upd(); }, { label: "Blade" });
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
  let litTw = null;
  function apply3d() { const dB = mode === "cs" ? b75 - betaFixed(0.75 * RAD, twist) : 0;
    M3.blades.forEach((bl) => { bl.vars.tw.visible = twist; bl.vars.fl.visible = !twist; bl.pg.rotation.y = dB * D; });
    if (litTw !== twist) { const names = twist ? ["st1", "st2", "st3"] : ["sf1", "sf2", "sf3"]; if (litTw === null) S.highlight(names); else S.focus(names); litTw = twist; }
    S.kick(); }
  const spin = reduced() ? 0 : 0.2 * 2 * Math.PI;   // 0.2 rev/s: slow enough to follow the lit stations
  let t0 = null; S.setFlow(true, (now) => { t0 ??= now; M3.hub.rotation.x = ((now - t0) / 1000) * spin; });
  const FO = (() => { const [U, Lo] = airfoil(30, 0.12, 0.04); return [...U, ...Lo.slice(1, -1).reverse()]; })();
  function draw(g, W) {
    const wide = W >= 600, [rpm, stop] = rpmNow(), cs = mode === "cs";
    const beta = (r) => (cs ? b75 + (betaFixed(r, twist) - betaFixed(0.75 * RAD, twist)) : betaFixed(r, twist));
    const pad = 14, n = 3, sw = (W - pad * 2) / n, top = 14;
    // a section at each station: the airfoil at its blade angle, the plane of rotation (dashed), the relative wind (gray
    // arrow: airspeed + rotation) and the angle of attack between chord and wind (blue wedge). The blade turns to the left; the airplane flies up the page.
    const sH = wide ? Math.min(sw * 0.74, 150) : sw * 1.05, c = wide ? Math.min(sw * 0.52, 116) : sw * 0.62;
    const stall = [];
    ST.forEach((f, i) => { const r = f * RAD, cx = pad + sw * i + sw / 2, cy = top + sH * 0.6, ph = phi(v, rpm, r), be = beta(r), aoa = be - ph, bad = aoa > 15 || aoa < 0; stall.push(aoa);
      const col = bad ? COL.red : ACC, cb = Math.cos(be * D), sb = Math.sin(be * D), le = [cx - cb * c * 0.4, cy - sb * c * 0.4];
      if (i) L(g, pad + sw * i, top + 4, pad + sw * i, top + sH + 40, { stroke: "rgba(242,241,236,.07)", w: 1 });
      L(g, cx - sw * 0.46, cy, cx + sw * 0.46, cy, { stroke: DIM, w: 1, dash: "3 5" });
      // angle-of-attack wedge between the relative wind and the chord line, at the leading edge
      const wl = Math.min(sw * 0.4, c * 0.9), ar = wl * 0.7, a0 = Math.PI + ph * D, a1 = Math.PI + be * D, p0 = [le[0] + Math.cos(a0) * ar, le[1] + Math.sin(a0) * ar], p1 = [le[0] + Math.cos(a1) * ar, le[1] + Math.sin(a1) * ar];
      if (Math.abs(aoa) > 0.5) { const sweep = aoa > 0 ? 1 : 0; P(g, `M${le[0].toFixed(1)},${le[1].toFixed(1)} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${ar.toFixed(1)},${ar.toFixed(1)} 0 0 ${sweep} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z`, { fill: bad ? "rgba(217,73,62,.22)" : "rgba(59,130,246,.24)", stroke: "none" });
        P(g, `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${ar.toFixed(1)},${ar.toFixed(1)} 0 0 ${sweep} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`, { stroke: col, w: 2.6 }); }
      L(g, le[0], le[1], le[0] - cb * wl, le[1] - sb * wl, { stroke: "rgba(242,241,236,.5)", w: 1.1, dash: "4 3" });
      const pts = FO.map(([x, y]) => [le[0] + cb * x * c + sb * y * c, le[1] + sb * x * c - cb * y * c]);
      P(g, "M" + pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L") + "Z", { fill: "#141417", stroke: bad ? COL.red : INK, w: 1.8 });
      const wc = Math.cos(ph * D), ws = Math.sin(ph * D); L(g, le[0] - wc * wl * 1.15, le[1] - ws * wl * 1.15, le[0] - wc * 4, le[1] - ws * 4, { stroke: GRAY, w: 1.6, arrow: "pkahg" });
      const ly = top + sH + 8;
      T(g, cx, ly, ["1 · near hub", "2 · mid-blade", "3 · near tip"][i], { size: 11, anchor: "middle", fill: GRAY });
      T(g, cx, ly + 19, `AoA ${Math.round(aoa)}°`, { size: wide ? 15 : 13, anchor: "middle", fill: col, weight: 600 });
      T(g, cx, ly + 36, `blade ${Math.round(be)}°`, { size: 11, anchor: "middle", fill: GRAY }); });
    // instruments in their own strip: tachometer, then (constant speed) the governor and manifold pressure
    const iy0 = top + sH + 58, gr = wide ? 62 : 56, gy = iy0 + gr + 6, Hh = gy + gr + 14;
    L(g, pad, iy0 - 4, W - pad, iy0 - 4, { stroke: "rgba(242,241,236,.08)", w: 1 });
    const gx = pad + Math.max(sw / 2, gr + 2), bx = pad + sw * 2.5, fx = pad + sw * 1.5;
    dial(g, gx, gy, gr, { min: 0, max: 3500, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", focus: true, value: rpm, fmt: (x) => String(Math.round(x / 10) * 10) });
    if (cs) { dial(g, bx, gy, gr, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", value: 12 + thr * 16 });
      const tilt = Math.max(-1, Math.min(1, (rpm - set) / 120)), fy = gy - 6, on = Math.abs(tilt) > 0.15;
      R(g, fx - 30, fy + 18, 60, 6, { fill: "#141417", stroke: GRAY, sw: 1, rx: 2 }); L(g, fx, fy - 18, fx, fy + 18, { stroke: GRAY, w: 2 });
      [-1, 1].forEach((sd) => { const a = (25 + tilt * 22) * D, ex = fx + sd * Math.sin(a) * 26, ey = fy - 12 + Math.cos(a) * 26; L(g, fx, fy - 12, ex, ey, { stroke: on ? ACC : INK, w: 2 }); C(g, ex, ey, 5.5, { fill: on ? ACC : INK }); });
      T(g, fx, fy + 42, on ? (tilt > 0 ? "flyweights out" : "flyweights in") : "governor", { size: 11, anchor: "middle", fill: on ? ACC : GRAY }); }
    else { const tx = fx + sw * 0.5 + (wide ? 0 : 14); T(g, tx, gy - 4, rpm > 2700 ? "Over the red line" : "Tach = power", { size: 13, anchor: "middle", fill: rpm > 2700 ? COL.red : INK, weight: 600 });
      (wide ? ["fixed pitch: RPM follows throttle and airspeed"] : ["RPM follows throttle", "and airspeed"]).forEach((s2, j) => T(g, tx, gy + 14 + j * 14, s2, { size: 11, anchor: "middle", fill: GRAY })); }
    let cap;
    const worst = Math.max(...stall), neg = Math.min(...stall);
    if (!twist && neg < 0) cap = ["No twist", "Same blade angle everywhere: the hub has a negative angle of attack while the tip works hard."];
    else if (!cs && v < 5 && thr >= 0.99) cap = ["Static RPM", "Full throttle, no airspeed: the 172S should read 2,300 to 2,400 RPM. High angle of attack."];
    else if (!cs && rpm > 2700) cap = ["Overspeed", "Airspeed is driving the prop past the red line. Reduce the throttle."];
    else if (!cs) cap = ["Fixed pitch", "More airspeed lowers the angle of attack, so RPM rises. The tachometer shows power."];
    else if (stop === "low") cap = ["On the low-pitch stop", "Too little airspeed or power to hold the set RPM: it acts like a fixed-pitch prop."];
    else if (stop === "high") cap = ["On the high-pitch stop", "The blade can't take a bigger bite, so RPM rises above the setting. Slow down or reduce power."];
    else if (Math.abs(rpm - set) > 30) cap = [rpm > set ? "Overspeed, governor responding" : "Underspeed, governor responding", rpm > set ? "Flyweights swing out and the blade angle increases to slow the prop." : "Flyweights drop in and the blade angle decreases to let the prop speed up."];
    else cap = ["Constant speed", "The governor holds the RPM you set; the throttle sets manifold pressure."];
    F.caption(cap[0], cap[1]);
    return Hh;
  }
  F.explain(`<p>Rotation speed grows toward the tip, so the relative wind there is flatter. The twist lowers the blade angle toward the tip to keep the angle of attack about the same along the blade. On a constant-speed prop, watch both blades turn about their own axes as the governor changes the blade angle. Your airplane's POH gives the static RPM range.</p>`);
  band(); upd();
  return { destroy: () => { A.stop(); S.destroy(); F.destroy(); } };
}
