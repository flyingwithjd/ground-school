// The four forces in 3D on the 172 (GL1 "aero", GL3), as a short playable animation. Steady is a balance.
// Add power: thrust jumps, airspeed climbs, drag grows with speed until it matches thrust (new balance at a
// higher speed). Then Hands off (lift grows with V², the nose comes up and you climb) or Hold altitude (lower
// the nose / trim, AOA drops, lift returns to equal weight at a faster cruise). Reduce power is the reverse
// (hands off, you descend). Pitch up: lift increases and the airplane climbs as airspeed bleeds off. Tappable
// labels on the model explain each force; there is no separate force-chip row. Arrows show direction and
// relative change, not scale. Sources: PHAK Ch 5.
import { frame, chips, row } from "./base.js?v=494609bb62";
import { h } from "../core/util.js?v=494609bb62";
import { planeStage } from "./planestage.js?v=494609bb62";
import { tags3d } from "./tags3d.js?v=494609bb62";
import { INFO } from "./forces.js?v=494609bb62";
const CG = [-1.2, 4.6, 0], D2R = Math.PI / 180, ACC = 0x3b82f6, V0 = 100;
// [start, direction, base length, label offset dx, dy]
const BASE = { lift: [[-0.6, 7.5, 0], [0, 1, 0], 5.2, 30, -10], weight: [[-1.2, 3.0, 0], [0, -1, 0], 5.2, 30, 14], thrust: [[6.6, 4.1, 0], [1, 0, 0], 4.4, -20, -34], drag: [[-19.4, 5.0, 0], [-1, 0, 0], 4.4, 16, -34] };
const ACT = {
  steady: { T: 1, name: "Steady" },
  power: { T: 1.5, name: "Add power" },
  idle: { T: 0.5, name: "Reduce power" },
  slow: { T: 1, name: "Pitch up" },
};
export function mount(host) {
  const F = frame(host, { cls: "forces3d capin", corners: { tl: "Four forces", tr: "Not to scale" } });
  F.root.insertBefore(F.root.querySelector(":scope > .caption"), F.explainEl);
  const VW = { tg: [-2.8, 4.4, 0], az: -56, el: 14, d: 43 };
  const S = planeStage(F.stage, { view: VW, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  const asi = h("div", { class: "f3-asi", "aria-live": "polite" }, h("span", {}, "Airspeed"), h("b", {}, "100 kt")); F.stage.append(asi);
  const TG = tags3d(F.stage), A = {}, tag = {};
  for (const [k, b] of Object.entries(BASE)) { A[k] = { ink: S.cueArrow({ width: 5, head: 1.6 }), blue: S.cueArrow({ color: ACC, width: 6.5, head: 1.9 }) };
    tag[k] = TG.add(INFO[k][0], { dx: b[3], dy: b[4] }); const el = tag[k].el; el.setAttribute("role", "button"); el.tabIndex = 0; el.classList.add("pick");
    const go = () => pickForce(sel === k ? null : k); el.addEventListener("click", go); el.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go())); }
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
    if (next === "steady") { T = 1; V = V0; aoa = 1; pT = 0; path = "hands"; }
    else if (next === "power") { T = ACT.power.T; /* V, aoa stay at current (usually cruise) so thrust jumps first */ pT = path === "hold" ? -6 : 0; }
    else if (next === "idle") { T = ACT.idle.T; pT = path === "hold" ? 6 : 0; }
    else { T = 1; aoa = 1.3; pT = 12; path = "hands"; }
    startSnap = snapshot();
    say(); syncUi(); S.kick();
  }
  function replay() { applySnap(startSnap); if (st === "slow") { aoa = 1.3; pT = 12; } say(); S.kick(); }
  function setPath(p) { path = p || "hands"; if (st === "power") pT = path === "hold" ? -6 : (forces().L > 1.06 ? 8 : 0);
    if (st === "idle") pT = path === "hold" ? 6 : (forces().L < 0.94 ? -8 : 0); say(); syncUi(); S.kick(); }
  const pick = chips(F.ctrl, [["steady", "Steady"], ["power", "Add power"], ["idle", "Reduce power"], ["slow", "Pitch up"]], "steady", (k) => begin(k || "steady"), { label: "Flight condition" });
  const thenRow = row(F.ctrl, "Then");
  const thenChips = chips(thenRow, [["hands", "Hands off"], ["hold", "Hold altitude"]], "hands", (k) => setPath(k || "hands"), { label: "Then" });
  const goRow = h("div", { class: "f3-row" }); const replayBtn = h("button", { type: "button", class: "btn pri f3-replay" }, "Replay"); goRow.append(replayBtn); F.ctrl.append(goRow);
  replayBtn.addEventListener("click", replay);
  const bars = h("div", { class: "f3-bars" });
  const mkBar = (a, b) => { const ia = h("i"), ib = h("i"); const el = h("div", { class: "f3-pair" }, h("div", { class: "f3-bar" }, h("span", {}, a), h("b", {}, ia)), h("div", { class: "f3-bar" }, h("span", {}, b), h("b", {}, ib))); bars.append(el); return [ia, ib]; };
  const [bT, bD] = mkBar("Thrust", "Drag"), [bL, bW] = mkBar("Lift", "Weight"); F.ctrl.append(bars);
  function syncUi() { pick.set(st); thenChips.set(path); thenRow.hidden = !(st === "power" || st === "idle"); }
  function pickForce(k) { sel = k; say(); S.kick(); }
  function say() {
    if (sel) { F.caption("Tap again to go back", INFO[sel][0]); F.explain(INFO[sel][1] + ' <span class="src">PHAK 5</span>'); return; }
    const { L, W, T: Th, D } = forces();
    const tdBal = Math.abs(Th - D) < 0.06, lwBal = Math.abs(L - W) < 0.06;
    let cap, body;
    if (st === "steady") { cap = ["Steady flight", "Forces in balance"]; body = "Opposing forces cancel: the airplane holds its speed and flight path. Lift and weight are much larger than thrust and drag. The arrows show direction and balance, not scale."; }
    else if (st === "power" && !tdBal) { cap = ["Add power", "Thrust exceeds drag"]; body = "The thrust arrow jumps up and the airplane speeds up. Drag grows with the square of airspeed until it catches thrust again."; }
    else if (st === "power" && path === "hands") { cap = ["New balance at a higher speed", "Lift exceeds weight — climbing"]; body = "Drag has caught up with thrust. You left the nose alone, so the extra speed made extra lift and the airplane climbs."; }
    else if (st === "power") { cap = ["New balance at a higher speed", "Lift equals weight at a faster cruise"]; body = "You lowered the nose and trimmed. Angle of attack dropped until lift equals weight again, now at a higher airspeed."; }
    else if (st === "idle" && !tdBal) { cap = ["Reduce power", "Drag exceeds thrust"]; body = "Thrust drops and the airplane slows. Drag shrinks with speed until it matches the lower thrust."; }
    else if (st === "idle" && path === "hands") { cap = ["New balance at a lower speed", "Weight exceeds lift — descending"]; body = "Hands off, lift fell with airspeed and the nose drops into a descent."; }
    else if (st === "idle") { cap = ["New balance at a lower speed", "Lift equals weight, slower cruise"]; body = "You raised the nose to hold altitude. Angle of attack rose until lift equals weight at a lower airspeed."; }
    else if (st === "slow" && V > V0 - 8) { cap = ["Pitch up, no extra power", "Lift rises, airspeed bleeds off"]; body = "Raising the nose increases angle of attack and lift, so you start to climb, but airspeed falls and induced drag grows."; }
    else { cap = ["Pitch up, no extra power", "Climbing as speed bleeds off"]; body = "You traded airspeed for altitude. Keep pitching up without adding power and the wing will reach its critical angle of attack."; }
    F.caption(cap[0], cap[1]); F.explain(body + ' <span class="dim">Tap a force\'s label to read about it.</span> <span class="src">PHAK 5</span>');
  }
  let last = performance.now();
  S.animate(() => {
    const now = performance.now(), dt = Math.min(0.08, (now - last) / 1000); last = now;
    const f = forces();
    // speed follows thrust vs drag
    if (st !== "steady") V = Math.max(45, Math.min(160, V + (f.T - f.D) * 22 * dt));
    else V += (V0 - V) * Math.min(1, 4 * dt);
    // path: hands off keeps cruise AOA (lift ~ V²); hold altitude trims AOA so lift returns to weight
    if (st === "power" || st === "idle") {
      if (path === "hold") { const need = 1 / Math.max(0.35, qv() * qv()); aoa += (need - aoa) * Math.min(1, 2.4 * dt); }
      else aoa += (1 - aoa) * Math.min(1, 2.2 * dt);
      const ff = forces();
      if (path === "hands") pT = ff.L - 1 > 0.06 ? 8 : ff.L - 1 < -0.06 ? -8 : 0;
    } else if (st === "slow") { /* aoa held high, pitch held */ }
    else aoa += (1 - aoa) * Math.min(1, 3 * dt);
    pitch += (pT - pitch) * Math.min(1, 3.2 * dt);
    S.setAttitude({ pitch, bank: 0, yaw: 0 });
    const want = forces();
    for (const k of ["lift", "weight", "thrust", "drag"]) drawn[k] += (want[{ lift: "L", weight: "W", thrust: "T", drag: "D" }[k]] - drawn[k]) * Math.min(1, 8 * dt);
    const items = [];
    for (const [k, [p0, d, L]] of Object.entries(BASE)) { const n = L * drawn[k], p1 = [p0[0] + d[0] * n, p0[1] + d[1] * n, p0[2]];
      const a = k === "thrust" ? p0 : keep(p0), b = k === "thrust" ? p1 : keep(p1); A[k].ink.set(a, b); A[k].blue.set(a, b);
      const win = !sel && ((k === "thrust" && want.T > want.D + 0.05) || (k === "drag" && want.D > want.T + 0.05) || (k === "lift" && want.L > want.W + 0.05) || (k === "weight" && want.W > want.L + 0.05));
      const on = sel ? sel === k : win; A[k].blue.opacity = on ? 1 : 0; A[k].ink.opacity = on ? 0 : 0.9;
      tag[k].el.classList.toggle("on", on); tag[k].ln.setAttribute("class", on ? "on" : ""); tag[k].dot.setAttribute("class", on ? "on" : ""); items.push({ t: tag[k], q: S.project(b) }); }
    TG.place(items, 30);
    const scale = 1.7; const pct = (x) => Math.max(8, Math.min(100, (x / scale) * 100));
    bT.style.width = pct(drawn.thrust) + "%"; bD.style.width = pct(drawn.drag) + "%"; bL.style.width = pct(drawn.lift) + "%"; bW.style.width = pct(drawn.weight) + "%";
    bT.parentElement.parentElement.classList.toggle("win", drawn.thrust > drawn.drag + 0.04);
    bD.parentElement.parentElement.classList.toggle("win", drawn.drag > drawn.thrust + 0.04);
    bL.parentElement.parentElement.classList.toggle("win", drawn.lift > drawn.weight + 0.04);
    bW.parentElement.parentElement.classList.toggle("win", drawn.weight > drawn.lift + 0.04);
    asi.querySelector("b").textContent = Math.round(V) + " kt";
    F.root.dataset.v = String(Math.round(V)); F.root.dataset.thrust = drawn.thrust.toFixed(2); F.root.dataset.drag = drawn.drag.toFixed(2);
    F.root.dataset.lift = drawn.lift.toFixed(2); F.root.dataset.weight = drawn.weight.toFixed(2); F.root.dataset.mode = st; F.root.dataset.path = path; F.root.dataset.pitch = pitch.toFixed(1);
    if (!sel) say();
    const kD = st === "slow" ? 1 + Math.max(0, aoa - 1) * 0.9 : 1;
    const Veq = st === "steady" ? V0 : V0 * Math.sqrt(Math.max(0.25, want.T / kD));
    if (st !== "steady" && Math.abs(V - Veq) < 6) V += (Veq - V) * Math.min(1, 8 * dt);
    const busy = Math.abs(pitch - pT) > 0.3 || Math.abs(V - (st === "steady" ? V0 : Veq)) > 1.6
      || Math.abs(drawn.thrust - want.T) > 0.02 || Math.abs(drawn.drag - want.D) > 0.02 || Math.abs(drawn.lift - want.L) > 0.02
      || (st === "power" || st === "idle") && path === "hold" && Math.abs(want.L - 1) > 0.05;
    F.root.dataset.busy = busy ? "1" : "0";
    return busy;
  }, { idle: true });
  F.explain(`<p>Opposing forces cancel in steady flight. Add or reduce power and watch drag catch up with thrust as airspeed changes; lift follows the square of airspeed unless you trim. <span class="src">PHAK 5</span></p>`);
  say(); syncUi();
  return { destroy() { S.destroy(); F.destroy(); } };
}
