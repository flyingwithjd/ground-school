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
import { chips, slider, row } from "./base.js?v=e4c491e0c8";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=e4c491e0c8";
import { dial, anim, toward, COL } from "./dial.js?v=e4c491e0c8";
const RAD = 0.96, ST = [0.3, 0.6, 0.9], KT = 0.5144, D = Math.PI / 180, PITCH = 1.71, LOW = 10, HIGH = 38;
export const fixedRpm = (thr, v) => 600 + thr * (1750 + 2.2 * v) + v * 0.8; // thr 0-1, v knots
export const phi = (v, rpm, r) => Math.atan2(v * KT, (Math.max(rpm, 1) / 60) * 2 * Math.PI * r) / D;
export const betaFixed = (r, twist = true) => (twist ? Math.atan(PITCH / (2 * Math.PI * r)) : Math.atan(PITCH / (2 * Math.PI * 0.75 * RAD))) / D;
export function mount(host) {
  let mode = "fixed", twist = true, v = 0, thr = 1, set = 2400, b75 = betaFixed(0.75 * RAD), rpmCS = 2400;
  const S = pxScene(host, { cls: "xtall prop", corners: { tl: "Propeller", tr: "PHAK 7 · POH 2" } }, draw);
  const r0 = row(S.F.ctrl, "Prop"); chips(r0, [["fixed", "Fixed pitch"], ["cs", "Constant speed"]], mode, (k) => { mode = k || "fixed"; r4.style.display = mode === "cs" ? "" : "none"; b75 = targetB(); rpmCS = set; upd(); }, { label: "Prop" });
  const r1 = row(S.F.ctrl, "Blade"); chips(r1, [["tw", "Twisted"], ["flat", "No twist"]], "tw", (k) => { twist = k !== "flat"; upd(); }, { label: "Blade" });
  const r2 = row(S.F.ctrl, "Fly"); const sv = slider(r2, { label: "Airspeed", min: 0, max: 150, value: v, fmt: (x) => x + " KIAS", oninput: (x) => { v = x; pre.set(null); upd(); } });
  const st = slider(r2, { label: "Throttle", min: 0, max: 100, value: thr * 100, fmt: (x) => (x >= 100 ? "Full" : x <= 0 ? "Idle" : x + "%"), oninput: (x) => { thr = x / 100; pre.set(null); upd(); } });
  const r3 = row(S.F.ctrl, "Try"); const pre = chips(r3, [["static", "Full-throttle static"], ["climb", "Climb"], ["cruise", "Cruise"], ["dive", "Dive"]], "static", (k) => {
    if (!k) return; [v, thr] = { static: [0, 1], climb: [74, 1], cruise: [110, 0.85], dive: [145, 1] }[k]; sv.set(v, false); st.set(Math.round(thr * 100), false); upd(); }, { label: "Try", toggle: true });
  const r4 = row(S.F.ctrl, "Prop control"); slider(r4, { label: "RPM set", min: 2100, max: 2700, step: 50, value: set, fmt: (x) => x.toLocaleString("en-US") + " RPM", oninput: (x) => { set = x; upd(); } }); r4.style.display = "none";
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
  function draw(g, W, H, top) {
    const wide = W >= 600, [rpm, stop] = rpmNow(), cs = mode === "cs";
    const beta = (r) => (cs ? b75 + (betaFixed(r, twist) - betaFixed(0.75 * RAD, twist)) : betaFixed(r, twist));
    // three stations, side by side
    const n = 3, sx0 = 14, sx1 = W - 14, sw = (sx1 - sx0) / n, len = Math.min(sw * 0.36, wide ? 84 : 52), sy = top + len * 1.25 + 4;
    const stall = [];
    ST.forEach((f, i) => { const r = f * RAD, cx = sx0 + sw * i + sw / 2, ph = phi(v, rpm, r), be = beta(r), aoa = be - ph, bad = aoa > 15 || aoa < 0;
      stall.push(aoa);
      // rotation is to the left, airspeed is up the page: relative wind comes from ahead-left-above, drawn as an arrow toward the blade
      // relative wind blows from ahead (left, the way the blade turns) and above (the way the airplane flies)
      const wl = len * 0.8, wc = Math.cos(ph * D), ws = Math.sin(ph * D), lx = cx - Math.cos(be * D) * len * 0.62, ly = sy - Math.sin(be * D) * len * 0.62;
      L(g, cx - len * 1.05, sy, cx + len * 0.9, sy, { stroke: DIM, w: 1, dash: "3 4" });
      L(g, lx - wc * wl, ly - ws * wl, lx - wc * 6, ly - ws * 6, { stroke: GRAY, w: 1.4, arrow: "kahg" });
      const ca = Math.cos(be * D), sa = Math.sin(be * D);
      P(g, `M${cx - ca * len * 0.62},${sy - sa * len * 0.62} L${cx + ca * len * 0.38},${sy + sa * len * 0.38}`, { stroke: bad ? COL.red : INK, w: 5 });
      C(g, cx - ca * len * 0.62, sy - sa * len * 0.62, 3.5, { fill: bad ? COL.red : INK });
      T(g, cx, sy + len * 0.75 + 22, ["near hub", "mid-blade", "near tip"][i], { size: 11, anchor: "middle", fill: GRAY });
      T(g, cx, sy + len * 0.75 + 38, `AoA ${Math.round(aoa)}°`, { size: 12, anchor: "middle", fill: bad ? COL.red : INK, weight: 600 });
      T(g, cx, sy + len * 0.75 + 54, `blade ${Math.round(be)}°`, { size: 11, anchor: "middle", fill: GRAY }); });
    if (wide) T(g, sx0, sy + len * 0.75 + 76, "arrow: relative wind · dashed: plane of rotation", { size: 11, fill: DIM }); else { T(g, sx0, sy + len * 0.75 + 72, "arrow: relative wind", { size: 11, fill: DIM }); T(g, sx0, sy + len * 0.75 + 86, "dashed: plane of rotation", { size: 11, fill: DIM }); }
    // instruments
    const ix0 = 14, ix1 = W - 14, iy0 = sy + len * 0.75 + (wide ? 90 : 100), iy1 = H - 12, iw = ix1 - ix0, ih = iy1 - iy0;
    const gr = Math.min(ih * 0.42, iw * 0.18, 76), gx = ix0 + iw * 0.22, gy = iy0 + ih / 2;
    dial(g, gx, gy, gr, { min: 0, max: 3500, arcs: [[2100, 2500, "green"]], reds: [2700], ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500], nums: [[1000, "10"], [2000, "20"], [3000, "30"]], title: "RPM ×100", focus: true, value: rpm, fmt: (x) => String(Math.round(x / 10) * 10) });
    const bx = ix0 + iw * 0.78, by = gy;
    if (cs) { dial(g, bx, by, gr, { min: 10, max: 35, ticks: [10, 15, 20, 25, 30, 35], nums: [[15, "15"], [25, "25"]], title: "MAN PRESS", sub: "in. Hg", value: 12 + thr * 16 });
      // governor flyweights: tilt out on overspeed, in on underspeed
      const tilt = Math.max(-1, Math.min(1, (rpm - set) / 120)), fx = ix0 + iw * 0.5, fy = gy;
      L(g, fx, fy - 16, fx, fy + 16, { stroke: GRAY, w: 2 }); [-1, 1].forEach((sd) => { const a = (25 + tilt * 22) * D; const ex = fx + sd * Math.sin(a) * 26, ey = fy - 12 + Math.cos(a) * 26; L(g, fx, fy - 12, ex, ey, { stroke: Math.abs(tilt) > 0.15 ? ACC : INK, w: 2 }); C(g, ex, ey, 5, { fill: Math.abs(tilt) > 0.15 ? ACC : INK }); });
      T(g, fx, fy + 34, "governor", { size: 11, anchor: "middle", fill: GRAY }); }
    else T(g, ix0 + iw * 0.6, by + 4, rpm > 2700 ? "over the red line" : "tach = power", { size: 12, anchor: "middle", fill: rpm > 2700 ? COL.red : GRAY });
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
