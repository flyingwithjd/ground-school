// Taxiing in wind (nosewheel airplane): pick where the wind comes from; 3D wind streaks drift in from that side and the
// ailerons and elevator move to the AFH Fig 2-15 positions, with a drawn yoke beside the stage showing the matching input.
// Only the deflected surfaces are lit; everything else stays ink. Continuous camera-facing wind ribbons at 30 fps while visible; offscreen/hidden tabs pause rendering. AFH Ch 2 (FAA-H-8083-3C), Fig 2-15.
import { frame, chips, row } from "./base.js?v=0134b87946";
import { planeStage } from "./planestage.js?v=0134b87946";
import { rich } from "../core/rich.js?v=0134b87946";
import { h, s, reduced, clamp } from "../core/util.js?v=0134b87946";
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
  // Camera-facing wind ribbons: one instanced draw, not thin world-space lines that disappear end-on.
  // Paths go past both sides of the airplane at wing height. Curves are illustrative, not aerodynamic simulation.
  const T = S.THREE, C = [-4.5, 6.8, 0], lanes = [-20,-14,-8,0,8,14,20];
  const texCanvas = document.createElement("canvas"); texCanvas.width = 128; texCanvas.height = 32;
  const ctx = texCanvas.getContext("2d"), grad = ctx.createLinearGradient(0,0,128,0);
  grad.addColorStop(0,"rgba(255,255,255,0)"); grad.addColorStop(.45,"rgba(255,255,255,.6)"); grad.addColorStop(.9,"white"); grad.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(0,5,128,22,11); ctx.fill();
  const texture = new T.CanvasTexture(texCanvas), material = new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.82,depthWrite:false,depthTest:true});
  const N = lanes.length * 2 * 3, wind = new T.InstancedMesh(new T.PlaneGeometry(1,1), material, N);
  wind.frustumCulled = false; wind.instanceMatrix.setUsage(T.DynamicDrawUsage); S.scene.add(wind);
  const matrix = new T.Matrix4(), pos = new T.Vector3(), scale = new T.Vector3(), rot = new T.Quaternion(), turn = new T.Quaternion(), Z = new T.Vector3(0,0,1);
  let dir = 0, windTick = 0;
  // A bold direction arrow in its own reserved band is never clipped by orbit or hidden behind the airplane.
  // It points in the projected airflow direction; end-on views use the standard into/out-of-screen dot/cross cue.
  S.setTopBand(54);
  const hud = s("svg", {class:"tw-wind-hud",height:"54",width:"100%","aria-label":"Wind direction"},F.stage);
  const arrowG = s("g",{},hud), stem = s("path",{d:"M-25,0 H23 M10,-12 L25,0 10,12",fill:"none",stroke:"#f2f1ec","stroke-width":5,"stroke-linecap":"round","stroke-linejoin":"round"},arrowG);
  const endOn = s("g",{},hud); s("circle",{cx:43,cy:27,r:14,fill:"none",stroke:"#f2f1ec","stroke-width":3},endOn);
  const endMark = s("path",{fill:"none",stroke:"#f2f1ec","stroke-width":4,"stroke-linecap":"round"},endOn);
  const label = s("text",{x:86,y:31,fill:"#f2f1ec","font-size":12,"font-family":"IBM Plex Mono,monospace"},hud);
  const directionNames = {hl:"left front",hr:"right front",head:"ahead",tl:"left rear",tr:"right rear",tail:"behind"};
  const updateWind = (now) => {
    const f = [Math.cos(dir*D),Math.sin(dir*D)], perp = [-f[1],f[0]], center = S.project(C,false);
    const origin = S.project([C[0]+f[0]*15,C[1],f[1]*15],false), dx = center.x-origin.x, dy = center.y-origin.y;
    const len = Math.hypot(dx,dy), angle = Math.atan2(dy,dx), flat = len < 13;
    arrowG.style.display = flat ? "none" : ""; endOn.style.display = flat ? "" : "none";
    arrowG.setAttribute("transform",`translate(43,27) rotate(${angle/D})`);
    const toward = S.camera.position.x*f[0]+S.camera.position.z*f[1] > 0;
    endMark.setAttribute("d",toward ? "M36,20 L50,34 M50,20 L36,34" : "M42,27 h2");
    label.textContent = `Wind from ${directionNames[cur] || "left front"}`;
    hud.setAttribute("aria-label",label.textContent+(flat ? (toward ? "; away from you" : "; toward you") : ""));
    const phase = reduced() ? .35 : (now/6000)%1; windTick = phase;
    let i=0;
    lanes.forEach((lane,j) => [5.5,8.5].forEach((y,k) => { for(let n=0;n<3;n++) {
      const t = ((phase+n/3+j*.071+k*.13)%1), along = 26-52*t;
      // Inner lanes peel around the fuselage; outer lanes show wind passing beside the wings.
      const offset = lane+(lane<0?-1:1)*Math.exp(-along*along/90)*(Math.abs(lane)<9?4:1.5);
      pos.set(C[0]+f[0]*along+perp[0]*offset,y,f[1]*along+perp[1]*offset);
      rot.copy(S.camera.quaternion); turn.setFromAxisAngle(Z,-angle); rot.multiply(turn);
      // Fixed minimum screen size, even looking directly along the wind.
      const distance = pos.distanceTo(S.camera.position), pixel = 2*distance*Math.tan(S.camera.fov*D/2)/Math.max(1,F.stage.clientHeight-54);
      const fade = Math.min(1,t*10,(1-t)*10);
      scale.set(pixel*(flat?11:23)*fade,pixel*(flat?7:4)*fade,1); matrix.compose(pos,rot,scale); wind.setMatrixAt(i++,matrix);
    }}));
    material.opacity = .82*v.op; wind.instanceMatrix.needsUpdate = true;
  };
  // state
  let cur = null, first = true, v = { ail: 0, elev: 0, op: 0 };
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const apply = () => { S.pose({ ail: v.ail * AIL, elev: v.elev * ELEV }); yoke.set(v.ail, -v.elev);  };
  function pick(key) { const K = CASES[key]; if (!K) return; cur = key; rowH.set(key in { hl: 1, head: 1, hr: 1 } ? key : null); rowT.set(key in { tl: 1, tail: 1, tr: 1 } ? key : null);
    tName.textContent = K.name; yoke.text(K.yoke); chain.textContent = K.surf;
    F.explain(terms(K.why) + ` Confirm with your ${rich("[[CFI]]")} and your airplane's ${rich("[[POH]]")}. <span class="src">${SRC}. Surface movement exaggerated for clarity; wind streaks are an illustration.</span>`);
    const lit = [K.ail && "ailerons", K.elev && "elevator"].filter(Boolean);
    if (first) { S.highlight(lit); first = false; } else S.focus(lit); S.tint(lit);
    const from = { ...v }, to = { ail: K.ail, elev: K.elev }, a0 = dir, a1 = K.a, t0 = performance.now(), dur = reduced() ? 1 : 1100;
    S.animate((now) => { const k = Math.min(1, (now - t0) / dur), e = ease(k);
      v.ail = from.ail + (to.ail - from.ail) * e; v.elev = from.elev + (to.elev - from.elev) * e;
      // the old streaks fade out, then the new ones fade in from the new side
      if (e < 0.4) v.op = from.op * (1 - e / 0.4); else { dir = a1; v.op = (e - 0.4) / 0.6; }
      apply(); if (k >= 1) S.animate(null); });
    S.setFlow(true, updateWind);
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
      windTick, ribbons: N, camera: S.camera.position.toArray(), frames: S.renderer.info.render.frame, memory: { ...S.renderer.info.memory } };
  };
  pick(start);
  // Read-only camera controls for angle/visibility regression, not an extra render loop.
  F.stage.__taxiView = (az,el) => S.setView({...view(),az,el,d:Math.max(view().d,68)},1);
  return { destroy() { delete F.stage.__taxi; delete F.stage.__taxiView; S.destroy(); F.destroy(); }, _state: () => ({ cur, ...v, dir }) };
}
