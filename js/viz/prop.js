// The propeller as a rotating wing. Three blade stations (near the hub, mid-blade, near the tip) show the blade angle, the
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
import { chips, slider, row } from "./base.js?v=c8fe6c3cee";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=c8fe6c3cee";
import { dial, anim, toward, COL } from "./dial.js?v=c8fe6c3cee";
const RAD = 0.96, ST = [0.3, 0.6, 0.9], KT = 0.5144, D = Math.PI / 180, PITCH = 1.71, LOW = 10, HIGH = 38;
export const fixedRpm = (thr, v) => 600 + thr * (1750 + 2.2 * v) + v * 0.8; // thr 0-1, v knots
export const phi = (v, rpm, r) => Math.atan2(v * KT, (Math.max(rpm, 1) / 60) * 2 * Math.PI * r) / D;
export const betaFixed = (r, twist = true) => (twist ? Math.atan(PITCH / (2 * Math.PI * r)) : Math.atan(PITCH / (2 * Math.PI * 0.75 * RAD))) / D;
export function mount(host) {
  let mode = "fixed", twist = true, v = 0, thr = 1, set = 2400, b75 = betaFixed(0.75 * RAD), rpmCS = 2400;
  const S = pxScene(host, { cls: "xtall prop", corners: { tl: "Propeller", tr: "PHAK 7 · POH 2" } }, draw);
  const r0 = row(S.F.ctrl, "Prop"); chips(r0, [["fixed", "Fixed pitch"], ["cs", "Constant speed"]], mode, (k) => { mode = k || "fixed"; r4.classList.toggle("off", mode !== "cs"); rs.input.disabled = mode !== "cs"; b75 = targetB(); rpmCS = set; upd(); }, { label: "Prop" });
  const r1 = row(S.F.ctrl, "Blade"); chips(r1, [["tw", "Twisted"], ["flat", "No twist"]], "tw", (k) => { twist = k !== "flat"; upd(); }, { label: "Blade" });
  const r2 = row(S.F.ctrl, "Fly"); const sv = slider(r2, { label: "Airspeed", min: 0, max: 150, value: v, fmt: (x) => x + " KIAS", oninput: (x) => { v = x; pre.set(null); upd(); } });
  const st = slider(r2, { label: "Throttle", min: 0, max: 100, value: thr * 100, fmt: (x) => (x >= 100 ? "Full" : x <= 0 ? "Idle" : x + "%"), oninput: (x) => { thr = x / 100; pre.set(null); upd(); } });
  const r3 = row(S.F.ctrl, "Try"); const pre = chips(r3, [["static", "Full-throttle static"], ["climb", "Climb"], ["cruise", "Cruise"], ["dive", "Dive"]], "static", (k) => {
    if (!k) return; [v, thr] = { static: [0, 1], climb: [74, 1], cruise: [110, 0.85], dive: [145, 1] }[k]; sv.set(v, false); st.set(Math.round(thr * 100), false); upd(); }, { label: "Try", toggle: true });
  const r4 = row(S.F.ctrl, "Prop control"); const rs = slider(r4, { label: "RPM set", min: 2100, max: 2700, step: 50, value: set, fmt: (x) => x.toLocaleString("en-US") + " RPM", oninput: (x) => { set = x; upd(); } }); r4.classList.add("off"); rs.input.disabled = true;
  // constant speed: the blade angle (at 75% radius) the governor wants so the blade carries a load that matches the power
  function targetB() { return Math.max(LOW, Math.min(HIGH, phi(v, set, 0.75 * RAD) + 3 + 9 * thr)); }
  // returns [rpm, stop]: off the stops the governor holds the set RPM, and a blade angle still catching up shows as a brief
  // over- or underspeed; on a pitch stop the prop acts like a fixed-pitch prop
  function rpmNow() { if (mode === "fixed") return [fixedRpm(thr, v), null];
    const free = phi(v, set, 0.75 * RAD) + 3 + 9 * thr;
    if (free < LOW) return [Math.min(set, fixedRpm(thr, v) * 1.1), "low"]; if (free > HIGH) return [Math.max(set, fixedRpm(thr, v) * 0.9), "high"];
    return [set + (targetB() - b75) * 60, null]; }
  const A = anim(S.F, (dt) => { if (mode !== "cs") return false; let m; [b75, m] = toward(b75, targetB(), 1.6, dt, 0.02); S.redraw(); return m; });
  function upd() { S.redraw(); A.kick(); }
  // airfoil outline (chord 1, x 0-1) used for the three blade sections
  const FO = (() => { const U = [], Lo = []; for (let i = 0; i <= 30; i++) { const x = (1 - Math.cos((i / 30) * Math.PI)) / 2, yt = 5 * 0.12 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4), yc = x < 0.4 ? (0.04 / 0.16) * (0.8 * x - x * x) : (0.04 / 0.36) * (0.2 + 0.8 * x - x * x); U.push([x, yc + yt]); Lo.push([x, yc - yt]); } return [...U, ...Lo.reverse()]; })();
  function draw(g, W, H, top) {
    const wide = W >= 600, [rpm, stop] = rpmNow(), cs = mode === "cs";
    const beta = (r) => (cs ? b75 + (betaFixed(r, twist) - betaFixed(0.75 * RAD, twist)) : betaFixed(r, twist));
    const pad = 14, n = 3, sw = (W - pad * 2) / n;
    // 1) the blade seen from the front, hub at left: three stations marked where the sections below are cut
    const py = top + 16, bx0 = pad + 18, bx1 = W - pad - 6, bl = bx1 - bx0, cw = (f) => (wide ? 15 : 11) * (0.55 + 0.75 * Math.sin(Math.PI * Math.min(1, f * 0.95 + 0.05)) * (1 - 0.25 * f));
    const edge = (sg) => Array.from({ length: 25 }, (_, i) => { const f = 0.06 + (i / 24) * 0.94; return [bx0 + f * bl, py + sg * cw(f) * (sg < 0 ? 0.8 : 1.15)]; });
    const up = edge(-1), lo = edge(1).reverse(); P(g, "M" + [...up, [bx1 + 4, py], ...lo].map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L") + "Z", { fill: "#141417", stroke: INK, w: 1.4 });
    C(g, bx0, py, wide ? 13 : 10, { fill: "#141417", stroke: INK, sw: 1.4 }); C(g, bx0, py, 3, { fill: INK });
    const stX = ST.map((f, i) => pad + sw * i + sw / 2);
    ST.forEach((f, i) => { const x = bx0 + f * bl, cx = stX[i]; L(g, x, py - cw(f) - 5, x, py + cw(f) * 1.15 + 5, { stroke: ACC, w: 1.6 }); T(g, x, py + cw(f) * 1.15 + 18, String(i + 1), { size: 11, anchor: "middle", fill: ACC }); });
    // 2) a section at each station: the blade airfoil at its blade angle, the plane of rotation (dashed), the relative wind
    // (airspeed + rotation, gray arrow) and the angle of attack between them (blue arc). The blade turns to the left; the airplane flies up the page.
    const sTop = py + 40, sH = Math.min(sw * 0.82, wide ? 170 : 132), c = Math.min(sw * 0.5, wide ? 118 : 86);
    const stall = [];
    ST.forEach((f, i) => { const r = f * RAD, cx = stX[i], cy = sTop + sH * 0.56, ph = phi(v, rpm, r), be = beta(r), aoa = be - ph, bad = aoa > 15 || aoa < 0; stall.push(aoa);
      const cb = Math.cos(be * D), sb = Math.sin(be * D), le = [cx - cb * c * 0.42, cy - sb * c * 0.42];
      L(g, cx - sw * 0.46, cy, cx + sw * 0.46, cy, { stroke: DIM, w: 1, dash: "3 5" });
      const pts = FO.map(([x, y]) => [le[0] + cb * x * c + sb * y * c, le[1] + sb * x * c - cb * y * c]);
      P(g, "M" + pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L") + "Z", { fill: bad ? "rgba(217,73,62,.16)" : "#141417", stroke: bad ? COL.red : INK, w: 1.5 });
      // relative wind arrives at the leading edge from ahead (left) and above (the airplane is moving up)
      const wl = Math.min(sw * 0.42, c * 0.95), wc = Math.cos(ph * D), ws = Math.sin(ph * D);
      L(g, le[0] - wc * wl, le[1] - ws * wl, le[0] - wc * 5, le[1] - ws * 5, { stroke: GRAY, w: 1.5, arrow: "kahg" });
      // chord line ahead of the leading edge and the angle-of-attack arc between it and the wind
      L(g, le[0], le[1], le[0] - cb * wl * 0.75, le[1] - sb * wl * 0.75, { stroke: DIM, w: 1, dash: "2 3" });
      const ar = wl * 0.55, a0 = Math.PI + ph * D, a1 = Math.PI + be * D, p0 = [le[0] + Math.cos(a0) * ar, le[1] + Math.sin(a0) * ar], p1 = [le[0] + Math.cos(a1) * ar, le[1] + Math.sin(a1) * ar];
      if (Math.abs(aoa) > 0.6) P(g, `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${ar.toFixed(1)},${ar.toFixed(1)} 0 0 ${aoa > 0 ? 1 : 0} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`, { stroke: bad ? COL.red : ACC, w: 2.4 });
      const ly = sTop + sH + 4;
      T(g, cx, ly, ["1 · near hub", "2 · mid-blade", "3 · near tip"][i], { size: 11, anchor: "middle", fill: GRAY });
      T(g, cx, ly + 19, `AoA ${Math.round(aoa)}°`, { size: wide ? 15 : 13, anchor: "middle", fill: bad ? COL.red : ACC, weight: 600 });
      T(g, cx, ly + 36, `blade ${Math.round(be)}°`, { size: 11, anchor: "middle", fill: GRAY }); });
    // 3) instruments in their own strip: tachometer, then (constant speed) the governor and manifold pressure
    const iy0 = sTop + sH + 52, ih = H - iy0 - 8, gr = Math.max(50, Math.min(ih * 0.46, W * (wide ? 0.12 : 0.15), 70)), gy = iy0 + ih / 2;
    L(g, pad, iy0 - 4, W - pad, iy0 - 4, { stroke: "rgba(242,241,236,.08)", w: 1 });
    const gx = pad + Math.max(sw / 2, gr + 2), bx = pad + sw * 2.5, fx = pad + sw * 1.5;
    dial(g, gx, gy, gr, { min: 0, max: 3500, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", focus: true, value: rpm, fmt: (x) => String(Math.round(x / 10) * 10) });
    if (cs) { dial(g, bx, gy, gr, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", value: 12 + thr * 16 });
      // governor flyweights: tilt out on overspeed, in on underspeed
      const tilt = Math.max(-1, Math.min(1, (rpm - set) / 120)), fy = gy - 6, on = Math.abs(tilt) > 0.15;
      R(g, fx - 30, fy + 18, 60, 6, { fill: "#141417", stroke: GRAY, sw: 1, rx: 2 }); L(g, fx, fy - 18, fx, fy + 18, { stroke: GRAY, w: 2 });
      [-1, 1].forEach((sd) => { const a = (25 + tilt * 22) * D, ex = fx + sd * Math.sin(a) * 26, ey = fy - 12 + Math.cos(a) * 26; L(g, fx, fy - 12, ex, ey, { stroke: on ? ACC : INK, w: 2 }); C(g, ex, ey, 5.5, { fill: on ? ACC : INK }); });
      T(g, fx, fy + 42, on ? (tilt > 0 ? "flyweights out" : "flyweights in") : "governor", { size: 11, anchor: "middle", fill: on ? ACC : GRAY }); }
    else { T(g, fx + sw * 0.5 + (wide ? 0 : 14), gy - 4, rpm > 2700 ? "Over the red line" : "Tach = power", { size: 13, anchor: "middle", fill: rpm > 2700 ? COL.red : INK, weight: 600 }); (wide ? ["fixed pitch: RPM follows throttle and airspeed"] : ["RPM follows throttle", "and airspeed"]).forEach((s2, j) => T(g, fx + sw * 0.5 + (wide ? 0 : 14), gy + 14 + j * 14, s2, { size: 11, anchor: "middle", fill: GRAY })); }
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
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>Rotation speed grows toward the tip, so the relative wind there is flatter. The twist lowers the blade angle toward the tip to keep the angle of attack about the same along the blade. Your airplane's POH gives the static RPM range.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
