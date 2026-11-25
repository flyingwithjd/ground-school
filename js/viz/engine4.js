// Four-stroke cycle (PHAK 7): the combustion visual's 3D cutaway cylinder (combustion.js cylModel), stood upright, runs
// the cycle on its own while it is on screen: two turns of the crankshaft (0-720°) per cycle. Blue dots are the fuel-air
// mixture coming in through the intake valve; the spark plugs fire near the top of compression, the dots light (amber)
// and the burning gas expands and drives the piston down; the burned gas (gray) leaves through the exhaust valve.
// Valve timing is simplified to one valve per stroke (real engines open and close them a little before and after each
// stroke). Tapping a stroke, dragging the crank or tapping a term pauses; Play resumes. 30 fps cap; no frames when paused,
// off screen or in a hidden tab; reduced motion starts paused. Fixed camera (no orbit), so a swipe scrolls the page.
import { frame, chips, row, slider } from "./base.js?v=4e8c88b40f";
import { planeStage } from "./planestage.js?v=4e8c88b40f";
import { fitView } from "./section-models.js?v=4e8c88b40f";
import { cylModel, crownX, CYL } from "./combustion.js?v=4e8c88b40f";
import { h, s, reduced } from "../core/util.js?v=4e8c88b40f";
import { rich } from "../core/rich.js?v=4e8c88b40f";
import * as THREE from "three";
import { T, L, INK, GRAY, DIM } from "./kit.js?v=4e8c88b40f";
const { BR, CR, ROD, PIN, XC, BAR, domeX, PLUGS } = CYL, D = Math.PI / 180;
const STROKES = [
  { k: "Intake", t: "The [[piston]] moves down with the [[intake valve]] open, drawing the fuel-air [[mixture]] into the [[cylinder]].", focus: ["intake"] },
  { k: "Compression", t: "Both valves are closed. The [[piston]] moves back up and squeezes the [[mixture]], so it gives far more power when it burns.", focus: ["piston"] },
  { k: "Power", t: "Near the top, the [[spark plugs|spark plug]] fire. The burning gas expands and drives the [[piston]] down, turning the [[crankshaft]].", focus: ["plug1", "plug2", "piston"] },
  { k: "Exhaust", t: "The [[exhaust valve]] opens and the rising [[piston]] pushes the burned gas out of the [[cylinder]].", focus: ["exhaust"] },
];
const SPEED = 72, SPARK = 340, N = 72, CG = [5, 0, 0];
// the model is drawn with its cylinder axis along x (head at x < 0); the stage pitches it upright (head up), so world = (5 + y, 5 - x, z)
const W = (p) => [CG[0] + p[1], CG[1] + CG[0] - p[0], p[2] || 0];
const VY = { in: -1.15, ex: 1.15 };   // intake on the left of the picture, exhaust on the right
const LIFT = 0.42;
// port paths (model space): outside the head -> behind the valve -> past the open valve's edge into the chamber
const port = (vy, lift) => { const sg = Math.sign(vy); return [[-1.95, sg * (BR + 2.05), 0.06], [-1.35, vy + sg * 0.25, 0.06], [domeX(vy) + lift + 0.16, vy - sg * 0.98, 0.06]]; };
function along(pts, u) { u = Math.max(0, Math.min(1, u)); const seg = []; let tot = 0; for (let i = 0; i + 1 < pts.length; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); tot += l; }
  let d = u * tot; for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, d / seg[i]) : 0; return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * k); } d -= seg[i]; } return pts[pts.length - 1]; }
const s5 = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * k * (k * (k * 6 - 15) + 10); };
export function mount(host) {
  const F = frame(host, { cls: "capin sec3d eng4", corners: { tl: "Four-stroke cycle", tr: "PHAK 7" } });
  const S = planeStage(F.stage, { model: () => cylModel(THREE, { swap: true }), cg: CG, orbit: false, maxFps: 30, fov: 22, view: { tg: [5, 0, 0], az: 80, el: 12, d: 80, fov: 22 } });
  const M3 = S.P; S.setAttitude({ pitch: -90, bank: 0, yaw: 0 });
  const valveOf = (vy) => M3.valves.find((g) => Math.sign(g.userData.vy) === Math.sign(vy));
  const vIn = valveOf(VY.in), vEx = valveOf(VY.ex);
  const plugTip = (sg) => PLUGS.find((p) => Math.sign(p.y) === sg).tip;
  // fixed camera, framed to the whole upright cylinder: valve springs, both plugs, ports and the crank
  const VZ = { az: 80, el: 12, fov: 22 };
  const FITM = [[-4.3, -1.6, 0], [-4.3, 1.6, 0], [0.35, BR + 2.85, 0], [0.35, -BR - 2.85, 0], [-1.95, BR + 2.1, 0], [-1.95, -BR - 2.1, 0], [BAR, BR + 1.3, 0], [BAR, -BR - 1.3, 0], [XC + 3.1, 0, -0.5], [XC, 3.1, -0.5], [XC, -3.1, -0.5], [XC + 3.1, 0, 0.3]];
  const band = () => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 4 : 0);
    const Hh = Math.max(1, sr.height - (+F.stage.dataset.band || 0)), ph = sr.width < 520; S.setView(fitView(THREE, FITM.map(W), VZ, sr.width / Hh, ph ? 0.62 : 0.7, 0.94), 1); scene(); };
  const bro = new ResizeObserver(() => band()); bro.observe(F.stage); F.on(() => bro.disconnect());
  // labels projected from the model into an SVG over the stage, with a short leader to the part
  const lab = s("svg", { class: "full lab3d", role: "img", "aria-hidden": "true" }, F.stage); let lg = s("g", {}, lab);
  function labels(cx, pin) { const Wd = F.stage.clientWidth, Hd = F.stage.clientHeight, ph = Wd < 520; lab.setAttribute("viewBox", `0 0 ${Wd} ${Hd}`); lg.remove(); lg = s("g", {}, lab);
    const tag = (part, at, str, side, fill = GRAY) => { const q = S.project(part), a = S.project(at), x = Math.max(6, Math.min(Wd - 6, a.x));
      L(lg, side < 0 ? x + 4 : x - 4, a.y - 4, q.x, q.y, { stroke: DIM, w: 1 }); T(lg, x, a.y, str, { size: 11, anchor: side < 0 ? "end" : "start", fill }); };
    const on = (n) => curFocus.includes(n);
    tag([-3.5, VY.in - 0.42, 0], [-3.5, -BR - 1.0, 0], ph ? "intake" : "intake valve", -1, on("intake") ? INK : GRAY);
    tag([-3.5, VY.ex + 0.42, 0], [-3.5, BR + 1.0, 0], ph ? "exhaust" : "exhaust valve", 1, on("exhaust") ? INK : GRAY);
    tag([0.35, BR + 2.75, 0], [-0.6, BR + 3.4, 0], "spark plug", 1, on("plug1") ? INK : GRAY);
    tag([cx + 1.5, -BR + 0.3, 0], [cx + 1.5, -BR - 1.65, 0], "piston", -1, on("piston") ? INK : GRAY);
    const rm = [(cx + PIN + pin[0]) / 2, pin[1] / 2, 0.3]; tag(rm, [XC - 2.2, -BR - 1.65, 0], ph ? "rod" : "connecting rod", -1);
    tag([XC + 0.6, 2.6, -0.5], [XC + 0.6, BR + 1.65, 0], "crankshaft", 1); }
  // particles: the gas in the cylinder (blue mixture, amber burning, gray burned), one point each
  const tex = (() => { const c = document.createElement("canvas"); c.width = c.height = 32; const x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.45, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pr = S.renderer.getPixelRatio(), small = F.stage.clientWidth < 520;
  const pmat = new THREE.PointsMaterial({ size: (small ? 7 : 9) * pr, sizeAttenuation: false, map: tex, vertexColors: true, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, pmat); pts.renderOrder = 5; pts.frustumCulled = false; S.cueGroup.add(pts);
  const HOME = Array.from({ length: N }, (_, i) => [(0.5 + 0.7548776662 * i) % 1, ((0.5 + 0.5698402910 * i) % 1) * 2 - 1, Math.random() * 6.28]);
  const BLUE = [0.33, 0.58, 1], AMB = [1, 0.7, 0.32], GRY = [0.42, 0.42, 0.4];
  const spark = [1, -1].flatMap(() => [0, 1, 2].map(() => S.cueLine(2, { width: 3, opacity: 0, color: 0xeef4ff })));
  const flowIn = S.cueLine(3, { width: 1.6, opacity: 0, color: 0x3b82f6, dash: [0.22, 0.26] }), flowEx = S.cueLine(3, { width: 1.6, opacity: 0, color: 0xf2f1ec, dash: [0.22, 0.26] });
  let ang = reduced() ? 90 : 0, playing = !reduced(), last = 0, kPrev = -1, fPrev = null, tNow = 0, curFocus = [];
  function home(i, cx, t) { const [u, v, ph] = HOME[i], y = v * (BR - 0.32), xr = domeX(y) + 0.14, xc = cx - 0.14, wob = t ? 0.05 * Math.sin(t * 3 + ph) : 0; return [xr + u * (xc - xr) + wob, y + wob, 0.06]; }
  function scene() { const th = ang * D, cx = crownX(ang), k = Math.floor(ang / 180) % 4, t = (ang % 180) / 180;
    // piston, rod, crank (same linkage as the combustion visual: the rod joins the wrist pin to the crank pin)
    M3.piston.position.x = cx; const pin = [XC - CR * Math.cos(th), CR * Math.sin(th)], wp = [cx + PIN, 0];
    M3.rod.position.set(wp[0], 0, 0); M3.rod.rotation.z = Math.atan2(pin[1] - wp[1], pin[0] - wp[0]); M3.crank.rotation.z = -th;
    // valves: intake lifts only on intake, exhaust only on exhaust; both shut on compression and power
    const li = k === 0 ? LIFT * Math.sin(Math.PI * t) ** 0.6 : 0, le = k === 3 ? LIFT * Math.sin(Math.PI * t) ** 0.6 : 0;
    vIn.position.x = li; vEx.position.x = le;
    const pIn = port(VY.in, li), pEx = port(VY.ex, le); flowIn.set(pIn); flowEx.set(pEx); flowIn.opacity = li > 0.05 ? 0.75 : 0; flowEx.opacity = le > 0.05 ? 0.45 : 0;
    // spark: both plugs, a short bright arc at the tips just before the top of compression
    const sp = ang >= SPARK && ang < SPARK + 14, sk = sp ? 0.25 + 0.75 * Math.sin(((ang - SPARK) / 14) * Math.PI) : 0;
    spark.forEach((l, j) => { const sg = j < 3 ? 1 : -1, tp = plugTip(sg), off = ((j % 3) - 1) * 0.7, r = 0.6 * sk; l.opacity = sp ? 1 : 0; l.set([[tp[0], tp[1], 0.08], [tp[0] + r * Math.sin(off), tp[1] - sg * r * Math.cos(off), 0.08]]); });
    for (let i = 0; i < N; i++) { let p = home(i, cx, k === 2 ? tNow : 0), c = BLUE, vis = true; const e = 0.08 + (0.8 * i) / N;
      if (k === 0) { const G = pIn[2]; if (t < e - 0.14) vis = false; else if (t < e) p = along(pIn, (t - (e - 0.14)) / 0.14); else { const q = s5((t - e) / 0.14); p = G.map((g, j) => g + (p[j] - g) * q); } }
      if (ang >= SPARK && ang < 540) { const tp = plugTip(p[1] >= 0 ? 1 : -1), d = Math.hypot(p[0] - tp[0], p[1] - tp[1]), aIg = SPARK + 4 + d * 9;
        if (ang >= aIg) { const f = Math.min(1, (ang - aIg) / 120); c = AMB.map((a, j) => a + (GRY[j] - a) * f); } }
      if (k === 3) { c = GRY; const G = pEx[2]; if (t >= e + 0.24) vis = false; else if (t >= e + 0.1) p = along([...pEx].reverse(), (t - e - 0.1) / 0.14); else if (t >= e) { const q = s5((t - e) / 0.1); p = p.map((v, j) => v + (G[j] - v) * q); } }
      pos.set(vis ? p : [0, 0, 0], i * 3); col.set(vis ? c : [0, 0, 0], i * 3); }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    const fk = k === 1 && ang >= SPARK - 8 ? "spark" : String(k); if (fk !== fPrev) { const first = fPrev == null; fPrev = fk; const fo = fk === "spark" ? ["plug1", "plug2"] : STROKES[k].focus; curFocus = fo; if (first) S.highlight(fo); else S.focus(fo); }
    if (k !== kPrev) { kPrev = k; strokes.set(String(k)); F.caption(`Stroke ${k + 1} of 4`, STROKES[k].k); say.innerHTML = rich(STROKES[k].t); }
    sl.set(Math.round(ang), false); labels(cx, pin); S.kick(); }
  function setPlay(on) { playing = on; play.textContent = on ? "❚❚ Pause" : "▶ Play"; play.setAttribute("aria-pressed", String(on)); play.classList.toggle("on", on); F.root.dataset.live = on ? "1" : ""; F.root.dataset.playing = on ? "1" : "0";
    if (on) { last = 0; S.animate(step); } else S.animate(null); }
  const step = (now) => { const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; tNow = now / 1000; ang = (ang + dt * SPEED) % 720; scene(); };
  // controls: Play/Pause and the crank slider right under the stage, the four strokes below; the caption and the stroke's sentence under them
  const r0 = row(F.ctrl, "Crank"); const play = h("button", { class: "chip e4-play", type: "button" }, "❚❚ Pause"); r0.append(play);
  const sl = slider(r0, { label: "Crank", min: 0, max: 720, step: 1, value: ang, fmt: (v) => `${v}°`, oninput: (v) => { setPlay(false); ang = v % 720; scene(); } });
  play.addEventListener("click", () => setPlay(!playing));
  const r1 = row(F.ctrl, "Stroke"); const strokes = chips(r1, STROKES.map((x, i) => [String(i), x.k]), "0", (v) => { setPlay(false); ang = +v * 180 + 90; scene(); }, { label: "Stroke" });
  F.caption("Stroke 1 of 4", "Intake"); const cap = F.root.querySelector(".caption");
  const say = h("p", { class: "e4-say" }); cap.append(say);
  // a term tapped (or hovered) while it runs: hold the picture so the sentence under the finger does not change
  const hold = (e) => { if (e.target.closest && e.target.closest(".gl") && playing) setPlay(false); };
  say.addEventListener("pointerdown", hold); say.addEventListener("mouseover", hold); say.addEventListener("focusin", hold);
  F.explain(rich(`<p>Blue dots are the fuel-air [[mixture]]; amber is the burning gas, gray the burned gas. One [[four-stroke cycle]] takes two turns of the [[crankshaft]] (720°), and only the power stroke pushes. Each cylinder has two [[spark plugs|spark plug]], one fired by each [[magneto|magnetos]]. At 2,400 [[RPM]] each cylinder fires 20 times a second; in the 172S's four cylinders each is on a different stroke. Simplified: real engines open and close the valves a little before and after each stroke. <span class="src">PHAK 7</span></p>`));
  scene(); band(); setPlay(playing);
  return { destroy() { S.animate(null); S.destroy(); F.destroy(); } };
}
