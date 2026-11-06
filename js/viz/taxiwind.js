// Taxiing in wind (nosewheel airplane): pick where the wind comes from; 3D wind streaks drift in from that side and the
// ailerons and elevator move to the AFH Fig 2-15 positions, with a drawn yoke beside the stage showing the matching input.
// Only the deflected surfaces are lit; everything else stays ink. Renders on demand, 30 fps cap: the streaks drift for a few
// seconds after each pick and then hold still, so an untouched view draws no frames. AFH Ch 2 (FAA-H-8083-3C), Fig 2-15.
import { frame, chips, row } from "./base.js?v=30bce312db";
import { planeStage } from "./planestage.js?v=30bce312db";
import { rich } from "../core/rich.js?v=30bce312db";
import { h, s, reduced, clamp } from "../core/util.js?v=30bce312db";
const D = Math.PI / 180, INKC = "rgba(242,241,236,", ACCC = "#3B82F6";
const AIL = 20, ELEV = 16;   // degrees shown, exaggerated for clarity. Model signs: ail>0 rolls right (left aileron down); elev>0 = trailing edge down.
// a = where the wind comes FROM, degrees clockwise from the nose. ail/elev = -1, 0, 1 (unit input), side = upwind wing.
const SRC = "AFH Ch 2, pp 2-19–2-20, Fig 2-15 (nosewheel airplane)";
// Explicit glossary links: visual explanations are deliberately excluded from app-wide acronym auto-linking.
const terms = (html) => rich(html.replace(/\b(upwind|downwind|ailerons|aileron|elevator|yoke|headwind|tailwind|tailwheel|nosewheel|prop blast)\b/gi,
  (t) => `[[${t}|${({ aileron: "Ailerons", tailwheel: "Conventional gear", nosewheel: "Tricycle gear", "prop blast": "Propeller slipstream" })[t.toLowerCase()] || t}]]`));
export const CASES = {
  hl: { a: -45, name: "Left quartering headwind", ail: -1, elev: 0, yoke: "Turned left, toward the wind", surf: "Left aileron up, right aileron down · elevator neutral",
    why: "Wind from ahead and to the left tends to lift the <b>left</b> wing. With the left aileron <b>up</b>, the wind has less to lift; the right aileron goes down at the same time, adding a little lift and drag on the right wing, which also resists the left wing rising. In a nosewheel airplane the elevator stays <b>neutral</b>." },
  head: { a: 0, name: "Headwind", ail: 0, elev: 0, yoke: "Centered", surf: "Ailerons neutral · elevator neutral",
    why: "Straight down the nose, neither wing is upwind, so the ailerons stay <b>neutral</b>. A strong headwind or prop blast lifts the tail surfaces; in a nosewheel airplane the AFH says hold the elevator <b>neutral</b>. (A tailwheel airplane holds it full aft, unless a very strong headwind calls for a position closer to neutral.)" },
  hr: { a: 45, name: "Right quartering headwind", ail: 1, elev: 0, yoke: "Turned right, toward the wind", surf: "Right aileron up, left aileron down · elevator neutral",
    why: "The mirror image: wind from ahead and to the right tends to lift the <b>right</b> wing, so turn toward it. Right aileron <b>up</b>, left aileron down, elevator <b>neutral</b>." },
  tl: { a: -135, name: "Left quartering tailwind", ail: 1, elev: 1, yoke: "Turned right, away from the wind, and pushed forward", surf: "Left aileron down, right aileron up · elevator down",
    why: "Wind from behind and to the left can get under the tail and the left wing and nose the airplane over. Hold the <b>left (upwind) aileron down</b> and the <b>elevator down</b>: yoke forward and turned away from the wind." },
  tail: { a: 180, name: "Tailwind", ail: 0, elev: 1, yoke: "Centered, pushed forward", surf: "Ailerons neutral · elevator down",
    why: "Both tailwind quarters in the AFH figure call for <b>elevator down</b>, to reduce the tendency of wind to get under the tail. With the wind dead astern neither wing is upwind, so the ailerons stay <b>neutral</b>. Downwind you need little power; keep it low rather than riding the brakes." },
  tr: { a: 135, name: "Right quartering tailwind", ail: -1, elev: 1, yoke: "Turned left, away from the wind, and pushed forward", surf: "Right aileron down, left aileron up · elevator down",
    why: "The mirror image: wind from behind and to the right. Hold the <b>right (upwind) aileron down</b> and the <b>elevator down</b>: yoke forward and turned away from the wind." },
};
// A 172 yoke seen from the left seat, for display only: turn = aileron input, smaller and higher = pushed forward.
function yokeView(parent) {
  const W = 220, H = 170, cx = 110, cy = 92;
  const box = h("div", { class: "pf-yoke tw-yoke", role: "img", "aria-label": "Yoke position" });
  const sv = s("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" }, box);
  s("rect", { x: 0, y: 0, width: W, height: 26, fill: INKC + ".05)" }, sv); s("line", { x1: 0, y1: 26, x2: W, y2: 26, stroke: INKC + ".18)" }, sv);
  const shaft = s("rect", { x: cx - 9, y: 26, width: 18, height: cy - 26, rx: 3, fill: INKC + ".14)", stroke: INKC + ".3)" }, sv);
  const g = s("g", {}, sv);
  const horns = s("path", { d: "M-78,-36 Q-86,4 -58,10 L58,10 Q86,4 78,-36", fill: "none", stroke: INKC + ".82)", "stroke-width": 15, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  s("rect", { x: -24, y: -6, width: 48, height: 26, rx: 8, fill: "#16171a", stroke: INKC + ".55)", "stroke-width": 1.5 }, g);
  s("circle", { cx: 0, cy: 7, r: 4.5, fill: ACCC }, g);
  const lab = h("span", { class: "pf-lab" }, "Yoke"), txt = h("span", { class: "tw-ytxt", "aria-live": "polite" });
  parent.append(h("div", { class: "pf-item" }, box, lab, txt));
  // x: -1 left .. 1 right; y: -1 pushed forward .. 1 pulled back
  return { set(x, y) { const sc = 1 + 0.16 * y, hy = cy + 16 * y; g.setAttribute("transform", `translate(${cx},${hy}) rotate(${x * 40}) scale(${sc})`); shaft.setAttribute("height", Math.max(4, hy - 26)); shaft.setAttribute("width", 18 * sc); shaft.setAttribute("x", cx - 9 * sc);
      horns.setAttribute("stroke", Math.abs(x) > 0.05 || Math.abs(y) > 0.05 ? ACCC : INKC + ".82)"); },
    text(t) { txt.textContent = t; } };
}
export function mount(host, { start = "hl" } = {}) {
  const F = frame(host, { cls: "tall tf pf tw" });
  const S = planeStage(F.stage, { view: "rear", orbit: true, ground: true, maxFps: 30 });
  // layout like the flight-controls visual: title band, then the yoke beside the stage (below it on phones), then the wind picker and the result line
  const title = h("div", { class: "tf-title" }), tName = h("span", {}), tSub = h("span", { class: "tf-sub" }, "AFH Fig 2-15"); title.append(tName, tSub);
  const body = h("div", { class: "pf-body" }), col = h("div", { class: "pf-ctl" }), chain = h("p", { class: "tf-chain", "aria-live": "polite" });
  F.root.insertBefore(title, F.stage); F.root.insertBefore(body, F.stage); body.append(col, F.stage); F.ctrl.after(chain);
  const yoke = yokeView(col);
  // fixed camera: from behind and a little left and above, so left is left and both ailerons and the elevator read clearly; orbit stays free
  const view = () => { const r = F.stage.getBoundingClientRect(), asp = r.width / Math.max(1, r.height); return { tg: [-5, 4.2, 0], az: -168, el: 24, d: clamp(78 / Math.min(1.5, Math.max(0.75, asp)), 52, 104) }; };
  queueMicrotask(() => S.setView(view(), 1));
  // 3D wind: dashed streaks upwind of the airplane at three heights, plus one arrow aimed at it. Model space (ft): x fwd, y up, z right.
  const C = [-4.5, 4.4, 0], R0 = 33, R1 = 21, OFF = [-13, -6.5, 0, 6.5, 13], YS = [2.2, 5.6, 9.0];
  const streaks = []; OFF.forEach((o, i) => YS.forEach((y, j) => { if ((i + j) % 2) return; streaks.push({ o, y, l: S.cueLine(2, { color: 0xf2f1ec, width: 1.6, opacity: 0, dash: [1.6, 1.4] }) }); }));
  const arrow = S.cueArrow({ color: 0xf2f1ec, width: 3.2, head: 2.2 });
  let dir = 0;
  const placeWind = (a, op) => { const f = [Math.cos(a * D), 0, Math.sin(a * D)], p = [-f[2], 0, f[0]];
    const at = (R, o, y) => [C[0] + f[0] * R + p[0] * o, y, C[2] + f[2] * R + p[2] * o];
    streaks.forEach((st) => { st.l.set([at(R0, st.o, st.y), at(R1, st.o, st.y)]); st.l.opacity = 0.5 * op; });
    arrow.set(at(R0 + 4, 0, 11.5), at(R1 - 2, 0, 8.5)); arrow.opacity = op; };
  // state
  let cur = null, first = true, v = { ail: 0, elev: 0, op: 0 }, flowT = 0;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const apply = () => { S.pose({ ail: v.ail * AIL, elev: v.elev * ELEV }); yoke.set(v.ail, -v.elev); placeWind(dir, v.op); };
  function pick(key) { const K = CASES[key]; if (!K) return; cur = key; rowH.set(key in { hl: 1, head: 1, hr: 1 } ? key : null); rowT.set(key in { tl: 1, tail: 1, tr: 1 } ? key : null);
    tName.textContent = K.name; yoke.text(K.yoke); chain.textContent = K.surf;
    F.explain(terms(K.why) + ` Confirm with your ${rich("[[CFI]]")} and your airplane's ${rich("[[POH]]")}. <span class="src">${SRC}. Surface movement exaggerated for clarity; wind streaks are an illustration. They move for six seconds after each choice, then pause to save power.</span>`);
    const lit = [K.ail && "ailerons", K.elev && "elevator"].filter(Boolean);
    if (first) { S.highlight(lit); first = false; } else S.focus(lit); S.tint(lit);
    const from = { ...v }, to = { ail: K.ail, elev: K.elev }, a0 = dir, a1 = K.a, t0 = performance.now(), dur = reduced() ? 1 : 1100;
    S.animate((now) => { const k = Math.min(1, (now - t0) / dur), e = ease(k);
      v.ail = from.ail + (to.ail - from.ail) * e; v.elev = from.elev + (to.elev - from.elev) * e;
      // the old streaks fade out, then the new ones fade in from the new side
      if (e < 0.4) v.op = from.op * (1 - e / 0.4); else { dir = a1; v.op = (e - 0.4) / 0.6; }
      apply(); if (k >= 1) S.animate(null); });
    // streaks drift for a few seconds, then hold still so an untouched view stops drawing
    clearTimeout(flowT); S.setFlow(false); if (!reduced()) { S.setFlow(true); flowT = setTimeout(() => S.setFlow(false), 6000); }
    if (a0 === a1 && from.op > 0.99) { v.op = 1; } }
  const r1 = row(F.ctrl, "Headwind"), r2 = row(F.ctrl, "Tailwind");
  const rowH = chips(r1, [["hl", "From the left"], ["head", "Straight ahead"], ["hr", "From the right"]], null, (k) => pick(k), { label: "Headwind" });
  const rowT = chips(r2, [["tl", "From the left"], ["tail", "Straight behind"], ["tr", "From the right"]], null, (k) => pick(k), { label: "Tailwind" });
  // Read-only diagnostics used by the regression test (actual posed mesh transforms, not just the requested input).
  F.stage.__taxi = () => {
    const quat = (part) => S.P.parts[part].subs.map((p) => p.obj.parent.quaternion.toArray());
    const pts = [], pt = new S.THREE.Vector3(); S.P.root.updateMatrixWorld(true);
    S.P.meshes.filter(m=>m.visible).forEach(m => { const a = m.geometry.attributes.position; if (!a) return; for (let i=0;i<a.count;i++) { pt.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld); pts.push(S.project(pt.toArray(),false)); } });
    return { cur, ...v, dir, quats: { ailerons: quat("ailerons"), elevator: quat("elevator") },
      bounds: [Math.min(...pts.map(p=>p.x)),Math.min(...pts.map(p=>p.y)),Math.max(...pts.map(p=>p.x)),Math.max(...pts.map(p=>p.y))],
      frames: S.renderer.info.render.frame, memory: { ...S.renderer.info.memory } };
  };
  pick(start);
  return { destroy() { clearTimeout(flowT); delete F.stage.__taxi; S.destroy(); F.destroy(); }, _state: () => ({ cur, ...v, dir }) };
}
