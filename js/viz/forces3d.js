// The four forces in 3D on the 172 (GL1 "aero"). Pick a flight condition: arrow lengths show which force is winning
// (qualitative, not to scale). Pick a force to light it and read what it does. Weight always points to the earth and lift
// and drag follow the relative wind, so on "Pitch up" they stay put while the nose (and thrust) rises. Sources: PHAK Ch 5.
import { frame, chips } from "./base.js?v=5436de0cbc";
import { planeStage } from "./planestage.js?v=5436de0cbc";
import { h } from "../core/util.js?v=5436de0cbc";
import { INFO, STATES } from "./forces.js?v=5436de0cbc";
const CG = [-1.2, 4.6, 0], D = Math.PI / 180, ACC = 0x3b82f6;
const BASE = { lift: [[-0.6, 7.5, 0], [0, 1, 0], 5.2], weight: [[-1.2, 3.0, 0], [0, -1, 0], 5.2], thrust: [[6.6, 4.1, 0], [1, 0, 0], 4.4], drag: [[-19.4, 5.0, 0], [-1, 0, 0], 4.4] };
export function mount(host) {
  const F = frame(host, { cls: "forces3d", corners: { tl: "Four forces", tr: "Not to scale" } });
  // a clear 3/4 view per condition; the camera glides between them, and every view keeps the whole airplane (span included) on a 390 px phone
  const VW = { steady: { tg: [-5.5, 3.4, 0], az: -52, el: 14, d: 54 }, power: { tg: [-4.5, 3.4, 0], az: -44, el: 12, d: 54 }, idle: { tg: [-5.5, 3.6, 0], az: -60, el: 18, d: 54 }, slow: { tg: [-6, 3.2, 0], az: -68, el: 8, d: 52 } };
  const S = planeStage(F.stage, { view: VW.steady, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  const A = {}, tag = {};
  for (const k of Object.keys(BASE)) { A[k] = { ink: S.cueArrow({ width: 5, head: 1.6 }), blue: S.cueArrow({ color: ACC, width: 6.5, head: 1.9 }) }; tag[k] = h("div", { class: "f3-tag" }, INFO[k][0]); F.stage.append(tag[k]); }
  let st = "steady", sel = null, pitch = 0, pT = 0, len = {}; const cur = { lift: 1, weight: 1, thrust: 1, drag: 1 };
  // counter-rotate a model point about the CG so it stays fixed in the world while the airplane pitches
  const keep = (p) => { const a = -pitch * D, x = p[0] - CG[0], y = p[1] - CG[1]; return [CG[0] + x * Math.cos(a) - y * Math.sin(a), CG[1] + x * Math.sin(a) + y * Math.cos(a), p[2]]; };
  function place() { const target = STATES[st]; const want = { lift: target.L, weight: target.W, thrust: target.T, drag: target.D };
    for (const k in cur) cur[k] += (want[k] - cur[k]) * 0.12; pitch += (pT - pitch) * 0.1; S.setAttitude({ pitch, bank: 0, yaw: 0 });
    for (const [k, [p0, d, L]] of Object.entries(BASE)) { const n = L * cur[k], p1 = [p0[0] + d[0] * n, p0[1] + d[1] * n, p0[2]];
      const a = k === "thrust" ? p0 : keep(p0), b = k === "thrust" ? p1 : keep(p1); A[k].ink.set(a, b); A[k].blue.set(a, b);
      const on = sel === k || (!sel && STATES[st].hl === k); A[k].blue.opacity = on ? 1 : 0; A[k].ink.opacity = on ? 0 : 0.85;
      const q = S.project(b), W = F.stage.clientWidth, tw = tag[k].offsetWidth; tag[k].classList.toggle("on", on);
      const x = Math.max(6, Math.min(W - tw - 6, q.x + (k === "drag" ? -tw : k === "thrust" ? 0 : 8))); tag[k].style.transform = `translate(${x}px, ${q.y + (k === "weight" ? -4 : k === "lift" ? -10 : -26)}px)`; } }
  S.animate(place);
  STATES.power.hl = "thrust"; STATES.idle.hl = "thrust"; STATES.slow.hl = "drag";
  const cond = chips(F.ctrl, [["steady", "Steady"], ["power", "Add power"], ["idle", "Reduce power"], ["slow", "Pitch up"]], "steady", (k) => { st = k; sel = null; force.set(null); pT = k === "slow" ? 12 : 0; S.setView(VW[k]); const s = STATES[k]; F.caption(s.cap[0], s.cap[1]); F.explain(s.t + ' <span class="src">PHAK 5</span>'); }, { label: "Flight condition" });
  const force = chips(F.ctrl, Object.keys(BASE).map((k) => [k, INFO[k][0]]), null, (k) => { sel = k || null; if (!sel) { const s = STATES[st]; F.caption(s.cap[0], s.cap[1]); F.explain(s.t + ' <span class="src">PHAK 5</span>'); return; } F.caption("The four forces", INFO[k][0]); F.explain(INFO[k][1] + ' <span class="src">PHAK 5</span>'); }, { label: "Light one force", toggle: true });
  const s0 = STATES.steady; F.caption(s0.cap[0], s0.cap[1]); F.explain(s0.t + ' <span class="src">PHAK 5</span>');
  return { destroy() { S.destroy(); F.destroy(); } };
}
