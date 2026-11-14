// The four forces in 3D on the 172 (GL1 "aero", GL3). Pick a flight condition: the arrows grow or shrink to show which
// force is winning (qualitative, not to scale) and the camera glides to a clear 3/4 view. Tap a force's label to light it
// and read what it does. Weight always points to the earth and lift and drag follow the relative wind, so on "Pitch up"
// they stay put while the nose (and thrust) rises. Text from forces.js. Sources: PHAK Ch 5.
import { frame, chips } from "./base.js?v=ac7792ed3c";
import { planeStage } from "./planestage.js?v=ac7792ed3c";
import { tags3d } from "./tags3d.js?v=ac7792ed3c";
import { INFO, STATES } from "./forces.js?v=ac7792ed3c";
const CG = [-1.2, 4.6, 0], D = Math.PI / 180, ACC = 0x3b82f6;
// [start, direction, base length, label offset dx, dy]
const BASE = { lift: [[-0.6, 7.5, 0], [0, 1, 0], 5.2, 30, -10], weight: [[-1.2, 3.0, 0], [0, -1, 0], 5.2, 30, 14], thrust: [[6.6, 4.1, 0], [1, 0, 0], 4.4, -20, -34], drag: [[-19.4, 5.0, 0], [-1, 0, 0], 4.4, 16, -34] };
const HL = { power: "thrust", idle: "thrust", slow: "drag" };
export function mount(host) {
  const F = frame(host, { cls: "forces3d capin", corners: { tl: "Four forces", tr: "Not to scale" } });
  F.root.insertBefore(F.root.querySelector(":scope > .caption"), F.explainEl);   // caption under the controls: never over the model, never moves the chips
  // a clear 3/4 view per condition; the camera glides between them, and every view keeps the whole airplane (span included) on a 390 px phone
  const VW = { steady: { tg: [-5.8, 4.2, 0], az: -50, el: 15, d: 46 }, power: { tg: [-5, 4.2, 0], az: -42, el: 13, d: 46 }, idle: { tg: [-5.8, 4.3, 0], az: -58, el: 19, d: 46 }, slow: { tg: [-6.4, 4.0, 0], az: -70, el: 9, d: 44 } };
  const S = planeStage(F.stage, { view: VW.steady, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  const TG = tags3d(F.stage), A = {}, tag = {};
  for (const [k, b] of Object.entries(BASE)) { A[k] = { ink: S.cueArrow({ width: 5, head: 1.6 }), blue: S.cueArrow({ color: ACC, width: 6.5, head: 1.9 }) };
    tag[k] = TG.add(INFO[k][0], { dx: b[3], dy: b[4] }); const el = tag[k].el; el.setAttribute("role", "button"); el.tabIndex = 0; el.classList.add("pick");
    const go = () => pickForce(sel === k ? null : k); el.addEventListener("click", go); el.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go())); }
  let st = "steady", sel = null, pitch = 0, pT = 0; const cur = { lift: 1, weight: 1, thrust: 1, drag: 1 };
  // counter-rotate a model point about the CG so it stays fixed in the world while the airplane pitches
  const keep = (p) => { const a = -pitch * D, x = p[0] - CG[0], y = p[1] - CG[1]; return [CG[0] + x * Math.cos(a) - y * Math.sin(a), CG[1] + x * Math.sin(a) + y * Math.cos(a), p[2]]; };
  function place() { const t = STATES[st], want = { lift: t.L, weight: t.W, thrust: t.T, drag: t.D };
    for (const k in cur) cur[k] += (want[k] - cur[k]) * 0.12; pitch += (pT - pitch) * 0.1; S.setAttitude({ pitch, bank: 0, yaw: 0 });
    const items = [];
    for (const [k, [p0, d, L]] of Object.entries(BASE)) { const n = L * cur[k], p1 = [p0[0] + d[0] * n, p0[1] + d[1] * n, p0[2]];
      const a = k === "thrust" ? p0 : keep(p0), b = k === "thrust" ? p1 : keep(p1); A[k].ink.set(a, b); A[k].blue.set(a, b);
      const on = sel ? sel === k : HL[st] === k; A[k].blue.opacity = on ? 1 : 0; A[k].ink.opacity = on ? 0 : 0.9;
      tag[k].el.classList.toggle("on", on); tag[k].ln.setAttribute("class", on ? "on" : ""); tag[k].dot.setAttribute("class", on ? "on" : ""); items.push({ t: tag[k], q: S.project(b) }); }
    TG.place(items, 30);
    let busy = Math.abs(pitch - pT) > 0.05;
    for (const k in cur) if (Math.abs(cur[k] - want[k]) > 0.005) busy = true;
    return busy; }
  S.animate(place, { idle: true });
  const say = () => { if (sel) { F.caption("Tap again to go back", INFO[sel][0]); F.explain(INFO[sel][1] + ' <span class="src">PHAK 5</span>'); return; }
    const s = STATES[st]; F.caption(s.cap[0], s.cap[1]); F.explain(s.t + ' <span class="dim">Tap a force\'s label to read about it.</span> <span class="src">PHAK 5</span>'); };
  function pickForce(k) { sel = k; say(); }
  chips(F.ctrl, [["steady", "Steady"], ["power", "Add power"], ["idle", "Reduce power"], ["slow", "Pitch up"]], "steady", (k) => { st = k; sel = null; pT = k === "slow" ? 12 : 0; S.setView(VW[k]); say(); }, { label: "Flight condition" });
  say();
  return { destroy() { S.destroy(); F.destroy(); } };
}
