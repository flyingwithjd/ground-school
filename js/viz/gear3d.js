// Landing gear and the CG (GL1 "parts"), in 3D on the 172 model. Pick where the CG sits relative to the main wheels, then
// "Start a swerve": with the CG ahead of the mains (nosewheel airplanes) the swerve straightens out; with the CG behind the
// mains (tailwheel airplanes) it grows into a ground loop. The airplane yaws about its main wheels; the yellow CG mark,
// its drop line and the white main-axle line ride with it; the dashed white arrow is the direction of travel.
// Sources: PHAK Ch 3 (landing gear: tricycle, conventional / tailwheel; floats, skis); AFH Ch 14 (tailwheel airplanes: CG
// behind the main wheels, ground loops). The 172 shape is kept for both cases so only the CG changes.
import { frame, chips } from "./base.js?v=7534528db0";
import { planeStage } from "./planestage.js?v=7534528db0";
import { rich } from "../core/rich.js?v=7534528db0";
import { h, reduced } from "../core/util.js?v=7534528db0";
const XM = -1.22, YEL = 0xffd23f, D = Math.PI / 180;
const CASE = {
  ahead: { x: 0.4, chip: "CG ahead of mains", cap: ["Nosewheel (tricycle) gear", "CG ahead of the main wheels"],
    text: "Like the 172. If the airplane starts to swerve, the CG, ahead of the wheels, pulls it back in line, so it tracks straight. Better forward view on the ground too.",
    end: "The swerve corrected itself: the CG ahead of the mains pulls the nose back in line." },
  behind: { x: -3.2, chip: "CG behind mains", cap: ["Tailwheel (conventional) gear", "CG behind the main wheels"],
    text: "Like a Piper Cub. If the airplane starts to swerve, the CG, behind the wheels, keeps pushing the swerve wider. Caught late, it becomes a [[ground loop]]. That is why tailwheel airplanes need quick, active feet.",
    end: "The swerve grew into a ground loop: with the CG behind the mains, a small swerve keeps getting bigger." },
};
export function mount(host) {
  const F = frame(host, { cls: "gear3d", corners: { tl: "Landing gear · CG", tr: "" } });
  const S = planeStage(F.stage, { view: { tg: [-6.5, 0.5, 0], az: 180, el: 56, d: 60 }, ground: true, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  S.highlight(["gear"]);
  let cs = "ahead", yaw = 0, t0 = 0, run = false;
  const drop = S.cueLine(2, { color: YEL, width: 1.6, opacity: 0.9, dash: [0.3, 0.22] }), ring = S.cueLine(33, { color: YEL, width: 2.6, opacity: 1 }), axle = S.cueLine(2, { width: 1.6, opacity: 0.75, dash: [0.35, 0.25] });
  const path = S.cueArrow({ width: 2, head: 0.9 });
  const tag = h("div", { class: "g3-tag" }, "CG"), atag = h("div", { class: "g3-tag ax" }, "main wheels"); F.stage.append(tag, atag);
  const rot = (x, y, z) => { const a = yaw * D, dx = x - XM; return [XM + dx * Math.cos(a) + z * Math.sin(a), y, -dx * Math.sin(a) + z * Math.cos(a)]; };
  // cue lines live in the airplane's frame (they yaw with it); the travel arrow is counter-rotated so it stays put on the ground
  function cues() { const cx = CASE[cs].x, top = [cx, 4.3, 0];
    drop.set([top, [cx, 0.04, 0]]); ring.set(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + 0.55 * Math.cos(a), 0.04, 0.55 * Math.sin(a)]; }));
    axle.set([[XM, 0.04, -5.4], [XM, 0.04, 5.4]]); path.set(rot(5.5, 0.03, 0), rot(13.5, 0.03, 0));
    const q = S.project(top), qa = S.project([XM, 0.04, -5.4]);
    tag.style.transform = `translate(${q.x - 12}px, ${q.y - 26}px)`; atag.style.transform = `translate(${qa.x - 40}px, ${qa.y + 6}px)`; }
  S.animate((now) => { if (run) { const t = (performance.now() - t0) / 1000;
      if (cs === "ahead") yaw = t < 0.6 ? 18 * Math.sin((t / 0.6) * Math.PI / 2) : 18 * Math.exp(-(t - 0.6) * 1.8) * Math.cos((t - 0.6) * 1.4);
      else yaw = t < 0.6 ? 18 * Math.sin((t / 0.6) * Math.PI / 2) : Math.min(140, 18 * Math.exp((t - 0.6) * 1.35));
      if (t > 3.2) { run = false; if (cs === "ahead") yaw = 0; done(); }
      S.setAttitude({ yaw, pitch: 0, bank: 0 }); }
    cues(); });
  const pick = chips(F.ctrl, Object.entries(CASE).map(([k, c]) => [k, c.chip]), cs, (v) => { cs = v; reset(); }, { label: "Where is the CG?" });
  const go = h("button", { type: "button", class: "btn g3-go" }, "Start a swerve"); F.ctrl.append(h("div", { class: "g3-row" }, go));
  go.onclick = () => { if (run) return; if (go.dataset.done) { reset(); return; } yaw = 0; t0 = performance.now(); run = true; go.disabled = true; F.caption("Swerving…", CASE[cs].cap[1]);
    if (reduced()) { t0 -= 3300; } };
  function done() { go.disabled = false; go.dataset.done = "1"; go.textContent = "Reset"; F.caption(cs === "ahead" ? "Straightens out" : "Ground loop", CASE[cs].cap[0]); F.explain(`<b>${CASE[cs].end}</b> ${rich(CASE[cs].text)} <span class="src">PHAK 3 · AFH 14</span>`); }
  function reset() { run = false; yaw = 0; S.setAttitude({ yaw: 0, pitch: 0, bank: 0 }); delete go.dataset.done; go.textContent = "Start a swerve"; go.disabled = false; pick.set(cs);
    F.caption(CASE[cs].cap[0], CASE[cs].cap[1]); F.corner("tr", cs === "ahead" ? "e.g. Cessna 172" : "e.g. Piper Cub"); F.explain(`${rich(CASE[cs].text)} Tap <b>Start a swerve</b> to see it. <span class="src">PHAK 3 · AFH 14</span>`); }
  reset();
  return { destroy() { S.destroy(); F.destroy(); } };
}
