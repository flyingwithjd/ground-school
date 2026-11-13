// Combustion: normal burn vs detonation vs preignition on a 3D cutaway of one horizontal cylinder (planeStage): head with
// intake and exhaust valves, two spark plugs (one per magneto), piston, rod and crank; a cylinder-pressure trace over crank
// angle sits in a strip under it. Tap a case to run one cycle (it stops by itself, no frames while idle); then respond.
// Facts, PHAK 7 (Detonation, Preignition): detonation is an uncontrolled, explosive ignition of the mixture in the
// combustion chamber; it causes excessive temperatures and pressures and can damage pistons, valves and rings. Causes:
// a lower fuel grade than specified, very high manifold pressure with low RPM, high power with an excessively lean
// mixture, and extended ground operation or steep climbs where cylinder cooling is reduced. Preventives: the right fuel
// grade, cowl flaps open on the ground, an enriched mixture and a shallow climb, and watching the engine instruments.
// Preignition is ignition before the normally timed spark, from residual hot spots: a carbon deposit on a spark plug, a
// cracked spark plug insulator or other cylinder damage; it causes power loss and high temperatures. The two can occur
// together, and one can cause the other. Spark timing, flame speeds and the pressure curves are illustrative.
import { frame, chips, row } from "./base.js?v=dc3bb5b371";
import { planeStage } from "./planestage.js?v=dc3bb5b371";
import { modelKit, fitView } from "./section-models.js?v=dc3bb5b371";
import { h, s, reduced } from "../core/util.js?v=dc3bb5b371";
import * as THREE from "three";
import { T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=dc3bb5b371";
import { anim, COL } from "./dial.js?v=dc3bb5b371";
const A0 = -90, A1 = 90, SPARK = -20, KNOCK = 14, HOT = -55;
// cylinder pressure (0-1 scale) at crank angle a (deg after top dead center) for each case
export function press(kind, a) {
  const comp = 0.18 + 0.32 * Math.exp(-((a / 38) ** 2)); // compression only (motoring)
  if (kind === "none") return comp;
  const burn = (st, pk, w, amp) => (a < st ? 0 : amp * Math.exp(-(((a - pk) / w) ** 2)) * Math.min(1, (a - st) / (pk - st + 1e-6) * 1.6));
  if (kind === "pre") return comp + burn(HOT, -4, 22, 0.62);
  const n = comp + burn(SPARK, 14, 20, 0.42); if (kind !== "det" || a < KNOCK) return n;
  const k = a - KNOCK; return n + 0.38 * Math.exp(-k / 7) * (0.6 + 0.4 * Math.cos(k * 1.9));
}
const SAY = {
  normal: ["Normal combustion", "The spark lights a flame front that sweeps smoothly across the cylinder."],
  det: ["Detonation", "The last unburned mixture explodes at once: a pressure spike, high temperature, damage."],
  pre: ["Preignition", "A hot spot lights the mixture before the spark, while the piston is still rising."],
  fixed: ["Responded", "Richer, cooler and less power: the burn is smooth again. Have the engine checked."],
};
const CAUSE = {
  normal: `<p>The spark plugs fire just before the piston reaches the top, and the flame front burns across the chamber in a controlled way, so pressure peaks just after the top of the stroke.</p>`,
  det: `<p><strong>Causes:</strong> a lower fuel grade than specified, very high manifold pressure with low RPM, high power with a mixture that is too lean, and long ground runs or steep climbs that cut cooling. <strong>Signs:</strong> high cylinder temperatures, roughness, power loss; often hard to detect. <strong>Respond:</strong> enrich, lower the nose for cooling air, reduce power.</p>`,
  pre: `<p><strong>Causes:</strong> a hot spot such as a carbon deposit on a spark plug, a cracked plug insulator or other damage in the cylinder. <strong>Signs:</strong> power loss and high operating temperatures, hard to tell from detonation, and one can cause the other. <strong>Respond</strong> as for detonation, and have the engine inspected.</p>`,
};
// ---------- 3D cylinder (inches; x along the cylinder axis, head at left, crank at right; y up; cut plane z = 0, back half kept) ----------
const BR = 2.56, CR = 2.19, ROD = 7.0, PIN = 1.8, CLR = 0.25, XC = CLR + PIN + ROD + CR, DOME = 0.9, BAR = 7.9, D = Math.PI / 180;
const domeX = (y) => -DOME * (1 - (y / BR) ** 2);                    // chamber roof (head) at height y
export const crownX = (a) => { const th = a * D, px = XC - CR * Math.cos(th), py = CR * Math.sin(th); return px - Math.sqrt(ROD * ROD - py * py) - PIN; };
const edges = (g, ang = 30) => Array.from(new THREE.EdgesGeometry(g, ang).attributes.position.array);
const half = (prof, segs = 32) => { const g = new THREE.LatheGeometry(prof.map(([r, x]) => new THREE.Vector2(r, x)), segs, Math.PI / 2, Math.PI); g.rotateZ(-Math.PI / 2); return g; };   // lathe about x, z <= 0
const cutFace = (pts, depth = 0.04) => { const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); g.translate(0, 0, -depth); return g; };
const PLUGS = [{ x: 0.35, y: 1, tip: [0.35, BR - 0.35, 0] }, { x: 0.35, y: -1, tip: [0.35, -BR + 0.35, 0] }];
function cylModel() { const K = modelKit(THREE), root = K.root, cutMat = new THREE.MeshBasicMaterial({ color: 0x1a1b20, side: THREE.DoubleSide });
  const addCut = (name, parent, pts) => { const g = cutFace(pts); const o = K.add(name, parent, null, edges(g, 20)); o.add(new THREE.Mesh(g, cutMat)); return o; };
  // barrel: bore surface (back half) and its cut walls with cooling fins
  K.add("barrel", root, half([[BR, 0], [BR, BAR]]), []);
  for (const sg of [1, -1]) { const w = [[0, sg * BR], [BAR, sg * BR], [BAR, sg * (BR + 0.42)]]; for (let x = BAR - 0.5; x > 0.2; x -= 0.62) { w.push([x + 0.12, sg * (BR + 0.42)], [x + 0.12, sg * (BR + 1.25)], [x - 0.12, sg * (BR + 1.25)], [x - 0.12, sg * (BR + 0.42)]); } w.push([0, sg * (BR + 0.42)]); addCut("barrel", root, w); }
  // the barrel's outside and its fins in 3D (back half), so the cut reads as a solid finned cylinder
  K.add("barrel", root, half([[BR + 0.42, 0], [BR + 0.42, BAR]]), []);
  for (let x = BAR - 0.5; x > 0.2; x -= 0.62) { const fg = half([[BR + 0.42, x - 0.12], [BR + 1.25, x - 0.12], [BR + 1.25, x + 0.12], [BR + 0.42, x + 0.12]], 28); const sgm = []; for (let i = 0; i < 28; i++) { const a0 = Math.PI / 2 + (i * Math.PI) / 28, a1 = Math.PI / 2 + ((i + 1) * Math.PI) / 28; sgm.push(x + 0.12, (BR + 1.25) * Math.sin(a0), (BR + 1.25) * Math.cos(a0), x + 0.12, (BR + 1.25) * Math.sin(a1), (BR + 1.25) * Math.cos(a1)); } K.add("barrel", root, fg, sgm); }
  { const hg = half([[BR + 0.6, 0], [BR + 1.6, -0.6], [BR + 1.6, -2.4], [0.4, -2.6]], 28); const sgm = []; for (let i = 0; i < 28; i++) { const a0 = Math.PI / 2 + (i * Math.PI) / 28, a1 = Math.PI / 2 + ((i + 1) * Math.PI) / 28; sgm.push(-0.6, (BR + 1.6) * Math.sin(a0), (BR + 1.6) * Math.cos(a0), -0.6, (BR + 1.6) * Math.sin(a1), (BR + 1.6) * Math.cos(a1)); } K.add("head", root, hg, sgm); }
  // head: domed chamber roof plus a finned head section; valve ports in the cut
  const roof = Array.from({ length: 17 }, (_, i) => { const y = -BR + (2 * BR * i) / 16; return [domeX(y), y]; });
  K.add("head", root, half(Array.from({ length: 9 }, (_, i) => { const y = (BR * i) / 8; return [y, domeX(y)]; }).reverse()), []);
  for (const sg of [1, -1]) { const w = [[0, sg * BR], [0, sg * (BR + 0.6)], [-0.6, sg * (BR + 1.6)], [-2.4, sg * (BR + 1.6)], [-2.6, sg * 0.4]];
    const rr = roof.filter(([, y]) => sg * y >= 0.35).sort((p, q) => sg * (q[1] - p[1])); w.push(...rr.reverse()); addCut("head", root, w.map(([x, y]) => [x, y])); }
  // valves (in the cut plane): intake on top, exhaust below; stems run out through the head to their springs
  const valves = [1, -1].map((sg) => { const g = new THREE.Group(); root.add(g); const vy = sg * 1.15;
    const disc = new THREE.CylinderGeometry(0.85, 0.55, 0.22, 24, 1, false, 0, Math.PI); disc.rotateY(Math.PI / 2); disc.rotateZ(Math.PI / 2); disc.translate(domeX(vy) - 0.02, vy, 0);
    const stem = new THREE.CylinderGeometry(0.11, 0.11, 3.6, 10, 1, false, 0, Math.PI); stem.rotateZ(Math.PI / 2); stem.translate(domeX(vy) - 1.85, vy, 0);
    K.add(sg > 0 ? "intake" : "exhaust", g, disc, edges(disc)); K.add(sg > 0 ? "intake" : "exhaust", g, stem, []);
    const coil = []; for (let i = 0; i < 64; i++) { const a0 = i * 0.5, a1 = (i + 1) * 0.5, x0 = -2.9 - i * 0.019, x1 = -2.9 - (i + 1) * 0.019; coil.push(x0, vy + 0.42 * Math.cos(a0), Math.min(0, 0.42 * Math.sin(a0)), x1, vy + 0.42 * Math.cos(a1), Math.min(0, 0.42 * Math.sin(a1))); }
    K.add(sg > 0 ? "intake" : "exhaust", g, null, coil); return g; });
  // spark plugs: radial through the head near the chamber, top and bottom; white insulator, electrode into the chamber
  const plugs = PLUGS.map((pl) => { const g = new THREE.Group(); root.add(g); const sg = pl.y;
    const body = new THREE.CylinderGeometry(0.42, 0.42, 1.0, 6, 1, false, 0, Math.PI); body.rotateY(-Math.PI / 2); body.translate(pl.x, sg * (BR + 1.1), 0);
    const ins = new THREE.CylinderGeometry(0.22, 0.28, 1.2, 16, 1, false, 0, Math.PI); ins.rotateY(-Math.PI / 2); ins.translate(pl.x, sg * (BR + 2.2), 0);
    const thr = new THREE.CylinderGeometry(0.24, 0.24, 0.9, 12, 1, false, 0, Math.PI); thr.rotateY(-Math.PI / 2); thr.translate(pl.x, sg * (BR + 0.2), 0);
    K.add("plug" + (sg > 0 ? 1 : 2), g, body, edges(body)); const im = new THREE.Mesh(ins, K.faceMat); g.add(im); K.add("plug" + (sg > 0 ? 1 : 2), g, null, edges(ins, 40));
    K.add("plug" + (sg > 0 ? 1 : 2), g, thr, [...edges(thr, 40), pl.x, sg * (BR - 0.25), 0, pl.x, sg * (BR - 0.42), 0, pl.x, sg * (BR - 0.42), 0, pl.x + 0.16, sg * (BR - 0.42), 0]); return g; });
  // piston: back-half skirt, crown, ring grooves, wrist pin; rod and crank
  const piston = new THREE.Group(); root.add(piston);
  K.add("piston", piston, half([[BR - 0.04, 0], [BR - 0.04, 3.0]]), [...[0.25, 0.55, 0.85].flatMap((x) => { const s2 = []; for (let i = 0; i < 24; i++) { const a0 = Math.PI / 2 + (i * Math.PI) / 24, a1 = Math.PI / 2 + ((i + 1) * Math.PI) / 24; s2.push(x, (BR - 0.04) * Math.sin(a0), (BR - 0.04) * Math.cos(a0), x, (BR - 0.04) * Math.sin(a1), (BR - 0.04) * Math.cos(a1)); } return s2; })]);
  addCut("piston", piston, [[0, BR - 0.04], [3.0, BR - 0.04], [3.0, BR - 0.3], [0.35, BR - 0.3], [0.35, -BR + 0.3], [3.0, -BR + 0.3], [3.0, -BR + 0.04], [0, -BR + 0.04]]);
  const crown = new THREE.Mesh(new THREE.CircleGeometry(BR - 0.04, 40, Math.PI / 2, Math.PI), cutMat); crown.rotation.y = Math.PI / 2; piston.add(crown);
  const wp = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 18); wp.rotateX(Math.PI / 2); wp.translate(PIN, 0, 0.02); K.add("piston", piston, wp, edges(wp));
  const rod = new THREE.Group(); root.add(rod); { const rg = cutFace([[0, -0.55], [ROD, -0.75], [ROD, 0.75], [0, 0.55]], 0.3); rg.translate(0, 0, 0.32); K.add("rod", rod, rg, edges(rg)); }
  const crank = new THREE.Group(); crank.position.set(XC, 0, 0); root.add(crank); { const cg = new THREE.CylinderGeometry(3.0, 3.0, 0.4, 40); cg.rotateX(Math.PI / 2); cg.translate(0, 0, -0.5); K.add("crank", crank, cg, edges(cg));
    const pg = new THREE.CylinderGeometry(0.75, 0.75, 0.9, 20); pg.rotateX(Math.PI / 2); pg.translate(-CR, 0, -0.1); K.add("crank", crank, pg, edges(pg)); }
  { const cc = []; for (let i = 0; i < 40; i++) { const a0 = -1.1 + (i * 2.2) / 40 + Math.PI, a1 = -1.1 + ((i + 1) * 2.2) / 40 + Math.PI; } const arc = []; for (let i = 0; i <= 48; i++) { const a = 0.9 + (i / 48) * (2 * Math.PI - 1.8); arc.push([XC + 4.1 * Math.cos(a - Math.PI) * -1, 4.1 * Math.sin(a), -0.7]); } for (let i = 0; i < arc.length - 1; i++) cc.push(...arc[i], ...arc[i + 1]); cc.push(BAR, BR + 0.42, -0.7, ...arc[0], BAR, -BR - 0.42, -0.7, ...arc[arc.length - 1]); K.add("case", root, null, cc); }
  // flame volumes: spheres clipped to the chamber (roof, piston crown, cut plane); the end-gas flash for detonation
  const clipCrown = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), clips = [new THREE.Plane(new THREE.Vector3(1, 0, 0), DOME), clipCrown, new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.01), new THREE.Plane(new THREE.Vector3(0, -1, 0), BR - 0.05), new THREE.Plane(new THREE.Vector3(0, 1, 0), BR - 0.05)];
  const fMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: clips, blending: THREE.AdditiveBlending });
  const flames = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), fMat(i === 2 ? 0xe0503e : 0xe8a83a, 0.34)); m.visible = false; root.add(m); return m; });
  const flash = new THREE.Mesh(half([[BR - 0.05, -DOME], [BR - 0.05, 9]], 32), fMat(0xff3b2b, 0)); root.add(flash);
  return K.model({ piston, rod, crank, valves, plugs, flames, flash, clipCrown, cutMat }); }
let uid = 0;
export function mount(host) {
  let kind = "normal", fixed = false, a = A1;
  const F = frame(host, { cls: "capin sec3d cyl3d", corners: { tl: "Combustion", tr: "PHAK 7" } });
  const S = planeStage(F.stage, { model: cylModel, cg: [5, 0, 0], orbit: false, maxFps: 30, fov: 22, view: { tg: [5.5, 0, 0], az: 74, el: 16, d: 60, fov: 22 } });
  const M3 = S.P; S.renderer.localClippingEnabled = true;
  // camera: slightly from the front and above the cut; for detonation and preignition it glides square onto the cut so the chamber reads flat, framed to the whole cylinder, valve springs, plugs and crank
  const VZ = { az: 76, el: 14, fov: 22 }, FIT = [[-8.6, 0, 0], [-8.6, -1.6, 0], [0.35, BR + 2.85, 0], [0.35, -BR - 2.85, 0], [XC + 4.2, 0, -0.7], [XC, 4.2, -0.7], [XC, -4.2, -0.7], [BAR, BR + 1.3, 0], [BAR, -BR - 1.3, 0], [0, 0, -BR - 1.6]];
  const band = (dur = 1) => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); S.setTopBand(b ? b + 4 : 0);
    const Hh = Math.max(1, sr.height - (+F.stage.dataset.band || 0)); S.setView(fitView(THREE, FIT, VZ, sr.width / Hh, 0.84, 0.86), typeof dur === "number" ? dur : 1); lab.dirty = performance.now() + (typeof dur === "number" && dur > 1 ? dur + 200 : 400); S.kick(); };
  const bro = new ResizeObserver(() => band()); bro.observe(F.stage); F.on(() => bro.disconnect());
  // part labels projected from the model into an SVG over the stage
  const lab = s("svg", { class: "full lab3d", role: "img" }, F.stage); let lg = s("g", {}, lab); lab.dirty = 0;
  function labels() { const W = F.stage.clientWidth, H = F.stage.clientHeight, ph = W < 520, k = fixed ? "normal" : kind; lab.setAttribute("viewBox", `0 0 ${W} ${H}`); lg.remove(); lg = s("g", {}, lab);
    const at = (p, str, o = {}) => { const q = S.project(p); T(lg, Math.max(6, Math.min(W - 6, q.x + (o.dx || 0))), q.y + (o.dy || 0), str, { size: 11, anchor: o.anchor || "middle", fill: o.fill || GRAY }); };
    at([-4.25, 1.15, 0], ph ? "intake" : "intake valve", { anchor: "end", dx: -6, dy: 4 }); at([-4.25, -1.15, 0], ph ? "exhaust" : "exhaust valve", { anchor: "end", dx: -6, dy: 4 });
    at([0.6, BR + 2.6, 0], ph ? "left mag plug" : "spark plug · left magneto", { anchor: "start", dx: 8, dy: 4 }); at([0.6, -BR - 2.6, 0], ph ? "right mag plug" : "spark plug · right magneto", { anchor: "start", dx: 8, dy: 4 });
    at([crownX(a) + 2.0, 1.25, 0], "piston", { fill: INK }); if (k === "pre") at([PLUGS[1].tip[0] + 0.6, PLUGS[1].tip[1] + 0.3, 0], "hot spot", { anchor: "start", dx: 6, fill: COL.red }); }
  // strip under the stage: the cylinder-pressure trace
  const strip = h("div", { class: "vstrip" }); F.stage.after(strip); const sv = s("svg", { class: "full", role: "img" }, strip); let sg = s("g", {}, sv);
  const sro = new ResizeObserver(() => redraw()); sro.observe(strip); F.on(() => sro.disconnect());
  const r0 = row(F.ctrl, "Burn"); const kc = chips(r0, [["normal", "Normal"], ["det", "Detonation"], ["pre", "Preignition"]], kind, (v) => { kind = v || "normal"; kc.set(kind); fixed = false; VZ.az = kind === "normal" ? 76 : 84; VZ.el = kind === "normal" ? 14 : 6; band(1400); run(); }, { label: "Burn" });
  const r1 = row(F.ctrl, "Respond"); const fg = h("div", { class: "chips", role: "group", "aria-label": "Respond" }); r1.append(fg);
  const fb = h("button", { class: "chip", type: "button" }, "–"), rb = h("button", { class: "chip", type: "button" }, "Run a cycle"); fg.append(fb, rb);
  fb.addEventListener("click", () => { if (kind !== "normal") { fixed = !fixed; run(); } }); rb.addEventListener("click", run);
  // one cycle: frames only while it runs (S.animate), then the stage goes idle
  let last = 0; const step = (now) => { const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now; a = Math.min(A1, a + dt * 72); scene3d(); redraw(); if (a >= A1) { S.animate(null); last = 0; } };
  function run() { a = reduced() ? A1 : A0; last = 0; upd(); if (!reduced()) S.animate(step); }
  function scene3d() { const k = fixed ? "normal" : kind, cx = crownX(a), th = a * D;
    M3.piston.position.x = cx; M3.clipCrown.constant = cx;   // flame stops at the crown
    const pin = [XC - CR * Math.cos(th), CR * Math.sin(th)], wpn = [cx + PIN, 0]; M3.rod.position.set(wpn[0], 0, 0); M3.rod.rotation.z = Math.atan2(pin[1] - wpn[1], pin[0] - wpn[0]); M3.crank.rotation.z = -th;
    const far = 9, fade = Math.max(0, Math.min(1, 1 - (a - 45) / 45)); M3.flames.forEach((m) => (m.visible = false)); fronts.forEach((f2) => (f2.opacity = 0));
    if (k !== "pre" && a >= SPARK) PLUGS.forEach((pl, i) => { const m = M3.flames[i], r = Math.min(far, 0.25 + (a - SPARK) * 0.11); m.visible = true; m.position.set(...pl.tip); m.scale.setScalar(r); m.material.opacity = 0.55 * fade; m.material.color.set(k === "det" && a >= KNOCK ? 0xff7a3a : 0xffb347); front(i, pl.tip, r, fade, k === "det" && a >= KNOCK ? 0xff7a3a : 0xffd27a); });
    if (k === "pre" && a >= HOT) { const m = M3.flames[2], r = Math.min(far, 0.25 + (a - HOT) * 0.085); m.visible = true; m.position.set(PLUGS[1].tip[0] + 0.2, PLUGS[1].tip[1] + 0.25, 0); m.scale.setScalar(r); m.material.opacity = 0.6 * fade; front(2, m.position.toArray(), r, fade, 0xff6a4a); }
    const f = k === "det" && a >= KNOCK ? Math.max(0, 1 - (a - KNOCK) / 30) * (0.7 + 0.3 * Math.cos((a - KNOCK) * 1.9)) : 0; M3.flash.material.opacity = 0.75 * f; M3.flash.visible = f > 0.01;
    // spark: a bright point at each plug tip for a moment; preignition: the glowing deposit
    sparks.forEach((sp, i) => { const on = k !== "pre" && a >= SPARK && a < SPARK + 8; sp.opacity = on ? 1 : 0; sp.set([PLUGS[i].tip, [PLUGS[i].tip[0] + 0.16, PLUGS[i].tip[1] + (i ? 0.17 : -0.17), 0.02]]); });
    hotS.opacity = k === "pre" ? 1 : 0; hotS.set([[PLUGS[1].tip[0] - 0.1, PLUGS[1].tip[1] + 0.05, 0.03], [PLUGS[1].tip[0] + 0.3, PLUGS[1].tip[1] + 0.05, 0.03]]);
    shocks.forEach((sh2, j) => { const r = f > 0.01 ? 0.4 + ((a - KNOCK) * 0.12 + j * 0.7) % 2.4 : 0; sh2.opacity = f > 0.01 ? 0.9 * f : 0; if (f > 0.01) sh2.set(Array.from({ length: 33 }, (_, i) => { const an = (i / 32) * 2 * Math.PI; return [Math.max(domeX(0), Math.min(cx - 0.05, (cx - 0.2) * 0.62 + r * Math.cos(an))), Math.max(-BR + 0.1, Math.min(BR - 0.1, r * Math.sin(an))), 0.04]; })); });
    const dmg = k !== "normal" && a > -10 && a < 40; crownL.opacity = dmg ? 0.95 : 0; crownL.set([[cx + 0.02, BR - 0.1, 0.05], [cx + 0.02, -BR + 0.1, 0.05]]);
    labels(); S.kick(); }
  // the flame front in the cut plane: the sphere's edge, kept inside the chamber (roof, crown, bore)
  const fronts = [0, 1, 2].map(() => S.cueLine(49, { width: 2.4, opacity: 0, color: 0xffd27a }));
  const fcol = new THREE.Color();
  function front(i, c, r, op, col) { const cx = crownX(a), pts = []; for (let j = 0; j <= 48; j++) { const an = (j / 48) * 2 * Math.PI; let y = Math.max(-BR + 0.06, Math.min(BR - 0.06, c[1] + r * Math.sin(an))), x = c[0] + r * Math.cos(an); x = Math.max(domeX(y) + 0.04, Math.min(cx - 0.04, x)); pts.push([x, y, 0.05]); }
    fronts[i].set(pts); fronts[i].opacity = 0.95 * op; fronts[i].obj.material.color.set(fcol.set(col)); }
  const sparks = [0, 1].map(() => S.cueLine(2, { width: 4, opacity: 0, color: 0xffffff })), hotS = S.cueLine(2, { width: 6, opacity: 0, color: 0xff5a3c });
  const shocks = [0, 1, 2].map(() => S.cueLine(33, { width: 2, opacity: 0, color: 0xff5a4a })), crownL = S.cueLine(2, { width: 3.4, opacity: 0, color: 0xe0503e });
  function upd() { fb.textContent = kind === "normal" ? "No response needed" : fixed ? "Undo" : "Enrich, reduce power"; fb.disabled = kind === "normal"; fb.classList.toggle("on", fixed); F.explain(CAUSE[fixed ? "normal" : kind]); scene3d(); redraw(); }
  function redraw() { const W = strip.clientWidth || 600; sg.remove(); sg = s("g", {}, sv); const Hh = draw(sg, W); sv.setAttribute("viewBox", `0 0 ${W} ${Hh}`); sv.setAttribute("height", Hh); strip.style.height = Hh + "px"; }
  function draw(g, W) { const wide = W >= 600, k = fixed ? "normal" : kind, Hh = wide ? 170 : 186;
    const gx0 = wide ? 134 : 16, gx1 = W - 16, gy0 = 30, gy1 = Hh - 30;
    const X = (an) => gx0 + ((an - A0) / (A1 - A0)) * (gx1 - gx0), Y = (p) => gy1 - Math.min(1.36, p) / 1.36 * (gy1 - gy0) * 0.92;
    if (wide) { T(g, 16, 22, "Cylinder pressure", { size: 11, fill: INK, weight: 600 }); [["normal", "normal burn", k === "normal" ? ACC : GRAY, ""], ["this", k === "normal" ? "" : k === "det" ? "detonation" : "preignition", COL.red, ""], ["mot", "no burn", DIM, "4 4"]].forEach(([, nm, col, da], i) => { if (!nm) return; L(g, 16, 48 + i * 20, 36, 48 + i * 20, { stroke: col, w: 2, dash: da || undefined }); T(g, 42, 52 + i * 20, nm, { size: 11, fill: GRAY }); }); }
    else T(g, 16, 18, "Cylinder pressure", { size: 11, fill: INK, weight: 600 });
    R(g, gx0, gy0, gx1 - gx0, gy1 - gy0, { stroke: "rgba(242,241,236,.16)", sw: 1, fill: "#0d0d10" }); L(g, X(0), gy0, X(0), gy1, { stroke: DIM, w: 1, dash: "3 4" });
    for (let an = -60; an <= 60; an += 30) if (an) L(g, X(an), gy0, X(an), gy1, { stroke: "rgba(242,241,236,.06)", w: 1 });
    T(g, X(0), gy1 + 15, "top dead center", { size: 11, anchor: "middle", fill: GRAY }); T(g, gx0, gy1 + 15, "compression", { size: 11, fill: DIM }); T(g, gx1, gy1 + 15, "power", { size: 11, anchor: "end", fill: DIM });
    let m = ""; for (let an = A0; an <= A1; an += 2) m += (m ? "L" : "M") + X(an).toFixed(1) + "," + Y(press("none", an)).toFixed(1); P(g, m, { stroke: DIM, w: 1.2, dash: "4 4" });
    if (k !== "normal") { let n = ""; for (let an = A0; an <= A1; an += 2) n += (n ? "L" : "M") + X(an).toFixed(1) + "," + Y(press("normal", an)).toFixed(1); P(g, n, { stroke: GRAY, w: 1.2 }); }
    let p = ""; for (let an = A0; an <= a; an += 1) p += (p ? "L" : "M") + X(an).toFixed(1) + "," + Y(press(k, an)).toFixed(1);
    if (p) P(g, p, { stroke: k === "normal" ? ACC : COL.red, w: 2.4 }); C(g, X(a), Y(press(k, a)), 4.5, { fill: k === "normal" ? ACC : COL.red });
    if (k !== "pre") { L(g, X(SPARK), gy1 - 10, X(SPARK), gy1, { stroke: COL.yellow, w: 2 }); T(g, X(SPARK) - 4, gy1 - 6, "spark", { size: 11, anchor: "end", fill: COL.yellow }); }
    else { L(g, X(HOT), gy1 - 10, X(HOT), gy1, { stroke: COL.red, w: 2 }); T(g, X(HOT) + 4, gy1 - 6, "hot spot lights it", { size: 11, fill: COL.red }); }
    const say = fixed ? SAY.fixed : SAY[kind]; F.caption(say[0], say[1]); return Hh; }
  band(); upd();
  return { destroy: () => { S.animate(null); S.destroy(); F.destroy(); } };
}
