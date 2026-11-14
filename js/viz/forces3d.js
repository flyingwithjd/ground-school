// The four forces in 3D on the 172 (GL1 "aero", GL3), as a short playable animation. Steady is a balance
// at cruise. Add power: thrust jumps, airspeed climbs, drag grows with V² until it matches the new thrust —
// both larger than at Steady. Hands off: lift briefly exceeds weight and you start to climb; in a steady
// climb lift is about equal to weight again (extra thrust is what keeps you climbing). Hold altitude: you
// lower the nose / trim, AOA drops, lift returns to equal weight at a faster cruise; thrust and drag stay
// larger. Reduce power is the reverse (both smaller). Pitch up: lift rises briefly, speed bleeds off.
// A dim grey 'before' arrow, offset beside the solid one, and a tick on the shaft mark the Steady length
// of a force that has changed; bar ticks mark the Steady level. Settled hold-altitude snaps lift exactly
// to weight (and thrust to drag) so the bars match and are not highlighted.
// Tappable labels on the model explain each force; no separate force-chip row. Arrows show direction and
// relative change, not the real lift-vs-thrust scale. Sources: PHAK Ch 5.
import { frame, chips, row } from "./base.js?v=093801d129";
import { h } from "../core/util.js?v=093801d129";
import { planeStage } from "./planestage.js?v=093801d129";
import { tags3d } from "./tags3d.js?v=093801d129";
import { INFO } from "./forces.js?v=093801d129";
const CG = [-1.2, 4.6, 0], D2R = Math.PI / 180, ACC = 0x3b82f6, V0 = 100, STEADY = 1;
// [start, direction, base length, label offset dx, dy]
const BASE = { lift: [[-0.6, 7.5, 0], [0, 1, 0], 5.2, 30, -10], weight: [[-1.2, 3.0, 0], [0, -1, 0], 5.2, 30, 14], thrust: [[6.6, 4.1, 0], [1, 0, 0], 4.4, -20, -34], drag: [[-19.4, 5.0, 0], [-1, 0, 0], 4.4, 16, -34] };
const ACT = { steady: { T: 1 }, power: { T: 1.5 }, idle: { T: 0.5 }, slow: { T: 1 } };
export function mount(host) {
  const F = frame(host, { cls: "forces3d capin", corners: { tl: "Four forces", tr: "Not to scale" } });
  F.root.insertBefore(F.root.querySelector(":scope > .caption"), F.explainEl);
  const VW = { tg: [-2.8, 4.4, 0], az: -56, el: 14, d: 43 };
  const S = planeStage(F.stage, { view: VW, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  const asi = h("div", { class: "f3-asi", "aria-live": "polite" }, h("span", {}, "Airspeed"), h("b", {}, "100 kt")); F.stage.append(asi);
  const TG = tags3d(F.stage), A = {}, G = {}, TK = {}, before = {}, tag = {};
  const GHOST_COL = 0xA8ADB4, OFF = 1.25;
  for (const [k, b] of Object.entries(BASE)) {
    A[k] = { ink: S.cueArrow({ width: 5, head: 1.6 }), blue: S.cueArrow({ color: ACC, width: 6.5, head: 1.9 }) };
    G[k] = S.cueArrow({ color: GHOST_COL, width: 4.2, head: 1.45, opacity: 0.9 });
    TK[k] = { dark: S.cueLine(2, { color: 0x0A0A0B, width: 5.6, opacity: 1 }), light: S.cueLine(2, { color: 0xF2F1EC, width: 2.6, opacity: 1 }) };
    tag[k] = TG.add(INFO[k][0], { dx: b[3], dy: b[4] }); const el = tag[k].el; el.setAttribute("role", "button"); el.tabIndex = 0; el.classList.add("pick");
    const go = () => pickForce(sel === k ? null : k); el.addEventListener("click", go); el.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
    if (k !== "weight") before[k] = TG.add("Before", { cls: "before", dx: k === "lift" ? -34 : 10, dy: k === "lift" ? 12 : 20 });
  }
  let st = "steady", path = "hands", sel = null;
  let V = V0, aoa = 1, pitch = 0, pT = 0, T = 1, drawn = { lift: 1, weight: 1, thrust: 1, drag: 1 };
  const qv = () => V / V0;
  const forces = () => { const D = qv() * qv() * (st === "slow" ? 1 + Math.max(0, aoa - 1) * 0.9 : 1); const L = aoa * qv() * qv(); return { L, W: 1, T, D }; };
  const keep = (p) => { const a = -pitch * D2R, x = p[0] - CG[0], y = p[1] - CG[1]; return [CG[0] + x * Math.cos(a) - y * Math.sin(a), CG[1] + x * Math.sin(a) + y * Math.cos(a), p[2]]; };
  function snapshot() { return { V, aoa, pitch, pT, T, st, path }; }
  let startSnap = snapshot();
  function applySnap(s) { V = s.V; aoa = s.aoa; pitch = s.pitch; pT = s.pT; T = s.T; }
  function begin(next) {
    st = next; sel = null;
    // each action starts from cruise so Replay and re-tapping always show the change from Steady
    V = V0; aoa = 1; pitch = 0;
    if (next === "steady") { T = 1; pT = 0; path = "hands"; }
    else if (next === "power") { T = ACT.power.T; pT = path === "hold" ? -6 : 0; }
    else if (next === "idle") { T = ACT.idle.T; pT = path === "hold" ? 6 : 0; }
    else { T = 1; aoa = 1.3; pT = 12; path = "hands"; }
    startSnap = snapshot();
    F.root.dataset.busy = "1"; say(); syncUi(); S.kick();
  }
  function replay() { applySnap(startSnap); if (st === "slow") { aoa = 1.3; pT = 12; } F.root.dataset.busy = "1"; say(); S.kick(); }
  function setPath(p) { path = p || "hands"; if (st === "power") pT = path === "hold" ? -6 : 8;
    if (st === "idle") pT = path === "hold" ? 6 : -8; F.root.dataset.busy = "1"; say(); syncUi(); S.kick(); }
  const pick = chips(F.ctrl, [["steady", "Steady"], ["power", "Add power"], ["idle", "Reduce power"], ["slow", "Pitch up"]], "steady", (k) => begin(k || "steady"), { label: "Flight condition" });
  const thenRow = row(F.ctrl, "Then");
  const thenChips = chips(thenRow, [["hands", "Hands off"], ["hold", "Hold altitude"]], "hands", (k) => setPath(k || "hands"), { label: "Then" });
  const goRow = h("div", { class: "f3-row" }); const replayBtn = h("button", { type: "button", class: "btn pri f3-replay" }, "Replay"); goRow.append(replayBtn); F.ctrl.append(goRow);
  replayBtn.addEventListener("click", replay);
  const bars = h("div", { class: "f3-bars" });
  const mkBar = (a, b) => {
    const ia = h("i"), ib = h("i"), ta = h("em", { class: "f3-tick" }), tb = h("em", { class: "f3-tick" });
    const el = h("div", { class: "f3-pair" },
      h("div", { class: "f3-bar" }, h("span", {}, a), h("b", {}, ia, ta)),
      h("div", { class: "f3-bar" }, h("span", {}, b), h("b", {}, ib, tb)));
    bars.append(el); return [ia, ib, ta, tb];
  };
  const [bT, bD, tT, tD] = mkBar("Thrust", "Drag"), [bL, bW, tL, tW] = mkBar("Lift", "Weight"); F.ctrl.append(bars);
  function syncUi() { pick.set(st); thenChips.set(path); thenRow.hidden = !(st === "power" || st === "idle"); }
  function pickForce(k) { sel = k; say(); S.kick(); }
  function say() {
    if (sel) { F.caption("Tap again to go back", INFO[sel][0]); F.explain(INFO[sel][1] + ' <span class="src">PHAK 5</span>'); return; }
    const { L, W, T: Th, D } = forces();
    const tdBal = Math.abs(Th - D) < 0.05 && Math.abs(drawn.thrust - drawn.drag) < 0.03;
    const lwBal = Math.abs(L - W) < 0.05 && Math.abs(drawn.lift - drawn.weight) < 0.03;
    let cap, body;
    if (st === "steady") { cap = ["Steady flight", "Forces in balance"]; body = "Opposing forces cancel: the airplane holds its speed and flight path. Lift and weight are much larger than thrust and drag. The arrows show direction and relative change, not the real scale."; }
    else if (st === "power" && !tdBal) { cap = ["Add power", "Thrust exceeds drag"]; body = "The thrust arrow jumps up and the airplane speeds up. Drag grows with the square of airspeed until it catches the new, larger thrust."; }
    else if (st === "power" && path === "hands" && !lwBal) { cap = ["Add power", "Lift exceeds weight — starting to climb"]; body = "Extra speed has made extra lift, so you start to climb. In a steady climb, lift will settle back to about equal weight."; }
    else if (st === "power" && path === "hands") { cap = ["Balanced again — thrust and drag are both larger", "Steady climb at a higher speed"]; body = "Drag has caught up with the new thrust. In a steady climb, lift is about equal to weight again. The extra thrust is what keeps you climbing. The grey 'before' arrows, and the tick on each shaft, mark the old (steady) lengths."; }
    else if (st === "power" && !lwBal) { cap = ["Add power", "Trimming — lift is returning to weight"]; body = "You lowered the nose. Angle of attack is dropping so lift can match weight again at this higher speed. The grey arrows mark the old (steady) lengths."; }
    else if (st === "power") { cap = ["Balanced again — thrust and drag are both larger", "Lift equals weight at a faster cruise"]; body = "You lowered the nose and trimmed. Angle of attack dropped until lift equals weight again, now at a higher airspeed. Thrust and drag are both larger than in steady cruise. The grey 'before' arrows, and the tick on each shaft, mark the old lengths."; }
    else if (st === "idle" && !tdBal) { cap = ["Reduce power", "Drag exceeds thrust"]; body = "Thrust drops and the airplane slows. Drag shrinks with speed until it matches the new, smaller thrust."; }
    else if (st === "idle" && path === "hands" && !lwBal) { cap = ["Reduce power", "Weight exceeds lift — starting to descend"]; body = "Less speed has cut lift, so you start to descend. In a steady descent, lift will settle back to about equal weight."; }
    else if (st === "idle" && path === "hands") { cap = ["Balanced again — thrust and drag are both smaller", "Steady descent at a lower speed"]; body = "Drag has shrunk to match the lower thrust. In a steady descent, lift is about equal to weight again. The lower thrust is what lets you descend. The grey 'before' arrows, and the tick on each shaft, mark the old (steady) lengths."; }
    else if (st === "idle" && !lwBal) { cap = ["Reduce power", "Trimming — lift is returning to weight"]; body = "You raised the nose. Angle of attack is rising so lift can match weight again at this lower speed. The grey arrows mark the old (steady) lengths."; }
    else if (st === "idle") { cap = ["Balanced again — thrust and drag are both smaller", "Lift equals weight at a slower cruise"]; body = "You raised the nose to hold altitude. Angle of attack rose until lift equals weight at a lower airspeed. Thrust and drag are both smaller than in steady cruise. The grey 'before' arrows, and the tick on each shaft, mark the old lengths."; }
    else if (st === "slow" && V > V0 - 8) { cap = ["Pitch up, no extra power", "Lift rises, airspeed bleeds off"]; body = "Raising the nose increases angle of attack and lift, so you start to climb, but airspeed falls and induced drag grows. The grey 'before' arrow is the old (steady) length."; }
    else { cap = ["Pitch up, no extra power", "Climbing as speed bleeds off"]; body = "You traded airspeed for altitude. Thrust has not changed, so as induced drag grows you keep slowing. Keep pitching up without adding power and the wing will reach its critical angle of attack."; }
    F.caption(cap[0], cap[1]); F.explain(body + ' <span class="dim">Tap a force\'s label to read about it.</span> <span class="src">PHAK 5</span>');
  }
  let last = performance.now();
  S.animate(() => {
    const now = performance.now(), dt = Math.min(0.08, (now - last) / 1000); last = now;
    const f = forces();
    if (st !== "steady") V = Math.max(45, Math.min(160, V + (f.T - f.D) * 22 * dt));
    else V += (V0 - V) * Math.min(1, 4 * dt);
    if (st === "power" || st === "idle") {
      const accelerating = Math.abs(f.T - f.D) > 0.08;
      if (path === "hold") {
        const need = STEADY / Math.max(0.35, qv() * qv());
        aoa += (need - aoa) * Math.min(1, 2.4 * dt);
        pT = st === "power" ? -6 : 6;
      } else if (accelerating) {
        // hands off: keep cruise AOA while speed changes so lift briefly exceeds (or falls below) weight
        aoa += (1 - aoa) * Math.min(1, 2.2 * dt);
        const ff = forces();
        pT = ff.L - 1 > 0.06 ? 8 : ff.L - 1 < -0.06 ? -8 : 0;
      } else {
        // established climb or descent: lift returns to about equal weight; extra (or missing) thrust holds the path
        const need = STEADY / Math.max(0.35, qv() * qv());
        aoa += (need - aoa) * Math.min(1, 1.8 * dt);
        pT = st === "power" ? 7 : -7;
      }
    } else if (st === "slow") { /* aoa held high, pitch held */ }
    else aoa += (1 - aoa) * Math.min(1, 3 * dt);
    pitch += (pT - pitch) * Math.min(1, 3.2 * dt);
    S.setAttitude({ pitch, bank: 0, yaw: 0 });
    const want = forces();
    for (const k of ["lift", "weight", "thrust", "drag"]) drawn[k] += (want[{ lift: "L", weight: "W", thrust: "T", drag: "D" }[k]] - drawn[k]) * Math.min(1, 8 * dt);
    const kD = st === "slow" ? 1 + Math.max(0, aoa - 1) * 0.9 : 1;
    const Veq = st === "steady" ? V0 : V0 * Math.sqrt(Math.max(0.25, want.T / kD));
    if (st !== "steady" && Math.abs(V - Veq) < 6) V += (Veq - V) * Math.min(1, 8 * dt);
    if ((st === "power" || st === "idle") && Math.abs(want.L - 1) < 0.15 && (path === "hold" || Math.abs(want.T - want.D) <= 0.08)) {
      const need = STEADY / Math.max(0.35, qv() * qv()); aoa += (need - aoa) * Math.min(1, 10 * dt);
    }
    // Once the new path is established, snap to exact T=D and L=W so bars and captions agree.
    const tdClose = Math.abs(want.T - want.D) <= 0.08, vClose = Math.abs(V - Veq) < 3;
    const pathSet = path === "hold" || !acceleratingNow(want);
    let settled = false;
    if (st === "steady" && Math.abs(V - V0) < 2 && Math.abs(pitch) < 0.4) {
      V = V0; aoa = 1; T = 1; pitch = 0; drawn.lift = drawn.weight = drawn.thrust = drawn.drag = 1; settled = true;
    } else if ((st === "power" || st === "idle") && tdClose && vClose && pathSet && Math.abs(want.L - 1) < 0.12) {
      V = Veq; aoa = STEADY / Math.max(0.35, (V / V0) * (V / V0));
      const snap = forces();
      drawn.lift = 1; drawn.weight = 1; drawn.thrust = snap.T; drawn.drag = snap.T; settled = true;
    }
    const show = settled ? forces() : want;
    const items = [];
    const THREE = S.THREE;
    for (const [k, [p0, d, L0]] of Object.entries(BASE)) {
      const n = L0 * drawn[k], p1 = [p0[0] + d[0] * n, p0[1] + d[1] * n, p0[2]];
      const a0 = k === "thrust" ? p0 : keep(p0), b1 = k === "thrust" ? p1 : keep(p1);
      A[k].ink.set(a0, b1); A[k].blue.set(a0, b1);
      const dir = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const mid = new THREE.Vector3((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2);
      const view = new THREE.Vector3().subVectors(S.camera.position, mid);
      let side = new THREE.Vector3().crossVectors(dir, view);
      if (side.lengthSq() < 1e-8) side.crossVectors(dir, new THREE.Vector3(0, 1, 0));
      side.normalize(); if (side.y < 0) side.negate();
      const gN = L0 * STEADY, g0 = [p0[0] + side.x * OFF, p0[1] + side.y * OFF, p0[2] + side.z * OFF];
      const g1 = [g0[0] + d[0] * gN, g0[1] + d[1] * gN, g0[2] + d[2] * gN];
      const ga = k === "thrust" ? g0 : keep(g0), gb = k === "thrust" ? g1 : keep(g1);
      G[k].set(ga, gb);
      const sN = L0 * STEADY, sP = [p0[0] + d[0] * sN, p0[1] + d[1] * sN, p0[2] + d[2] * sN];
      const tickAt = (half) => {
        const t0 = [sP[0] - side.x * half, sP[1] - side.y * half, sP[2] - side.z * half];
        const t1 = [sP[0] + side.x * half, sP[1] + side.y * half, sP[2] + side.z * half];
        return k === "thrust" ? [t0, t1] : [keep(t0), keep(t1)];
      };
      TK[k].dark.set(tickAt(0.82)); TK[k].light.set(tickAt(0.55));
      const changed = Math.abs(drawn[k] - STEADY) > 0.06 && k !== "weight";
      const showG = st !== "steady" && changed;
      G[k].opacity = showG ? 0.92 : 0; TK[k].dark.opacity = showG ? 1 : 0; TK[k].light.opacity = showG ? 1 : 0;
      if (before[k]) before[k].on = showG;
      const win = !sel && !settled && ((k === "thrust" && show.T > show.D + 0.10) || (k === "drag" && show.D > show.T + 0.10) || (k === "lift" && show.L > show.W + 0.10) || (k === "weight" && show.W > show.L + 0.10));
      const on = sel ? sel === k : win; A[k].blue.opacity = on ? 1 : 0; A[k].ink.opacity = on ? 0 : 0.9;
      tag[k].el.classList.toggle("on", on); tag[k].ln.setAttribute("class", on ? "on" : ""); tag[k].dot.setAttribute("class", on ? "on" : ""); items.push({ t: tag[k], q: S.project(b1) });
      if (before[k]) items.push({ t: before[k], q: S.project(gb) });
    }
    TG.place(items, 30);
    const scale = 1.7; const pct = (x) => Math.max(8, Math.min(100, (x / scale) * 100));
    bT.style.width = pct(drawn.thrust) + "%"; bD.style.width = pct(drawn.drag) + "%"; bL.style.width = pct(drawn.lift) + "%"; bW.style.width = pct(drawn.weight) + "%";
    const tick = pct(STEADY) + "%"; tT.style.left = tick; tD.style.left = tick; tL.style.left = tick; tW.style.left = tick;
    const tdIm = drawn.thrust - drawn.drag, lwIm = drawn.lift - drawn.weight;
    bT.parentElement.parentElement.classList.toggle("win", !settled && tdIm > 0.10);
    bD.parentElement.parentElement.classList.toggle("win", !settled && tdIm < -0.10);
    bL.parentElement.parentElement.classList.toggle("win", !settled && lwIm > 0.10);
    bW.parentElement.parentElement.classList.toggle("win", !settled && lwIm < -0.10);
    asi.querySelector("b").textContent = Math.round(V) + " kt";
    F.root.dataset.v = String(Math.round(V)); F.root.dataset.thrust = drawn.thrust.toFixed(2); F.root.dataset.drag = drawn.drag.toFixed(2);
    F.root.dataset.lift = drawn.lift.toFixed(2); F.root.dataset.weight = drawn.weight.toFixed(2); F.root.dataset.mode = st; F.root.dataset.path = path; F.root.dataset.pitch = pitch.toFixed(1);
    F.root.dataset.ghost = (st !== "steady" && (Math.abs(drawn.thrust - 1) > 0.06 || Math.abs(drawn.drag - 1) > 0.06 || Math.abs(drawn.lift - 1) > 0.06)) ? "1" : "0";
    F.root.dataset.settled = settled ? "1" : "0";
    if (!sel) say();
    const poseBusy = Math.abs(pitch - pT) > 0.3;
    const forceBusy = !settled && (Math.abs(V - (st === "steady" ? V0 : Veq)) > 1.6
      || Math.abs(drawn.thrust - want.T) > 0.02 || Math.abs(drawn.drag - want.D) > 0.02 || Math.abs(drawn.lift - want.L) > 0.02
      || ((st === "power" || st === "idle") && Math.abs(want.L - 1) > 0.04 && (path === "hold" || !acceleratingNow(want))));
    const busy = poseBusy || forceBusy;
    F.root.dataset.busy = busy ? "1" : "0";
    return busy;
  }, { idle: true });
  function acceleratingNow(w) { return Math.abs(w.T - w.D) > 0.08; }
  F.explain(`<p>Opposing forces cancel in steady flight. Add or reduce power and watch drag catch up with thrust as airspeed changes; the grey 'before' arrows (and the tick on each shaft) mark the old (steady) lengths, so you can see that both grew or both shrank. Lift follows the square of airspeed unless you trim. <span class="src">PHAK 5</span></p>`);
  say(); syncUi();
  return { destroy() { S.destroy(); F.destroy(); } };
}
