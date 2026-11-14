// Landing gear and the CG (GL1 "parts", GL2 "airframe"), in 3D on the 172 model. Default view is a low 3/4 front-side
// so the nosewheel and both mains are visible; an overhead view is used only while a swerve plays, then it returns.
// Pick where the CG sits relative to the main wheels, then "Start a swerve": with the CG ahead of the mains (nosewheel
// airplanes) the swerve straightens out; with the CG behind the mains (tailwheel airplanes) it grows into a ground loop.
// The airplane yaws about its main wheels; the yellow CG mark, its drop line and the white main-axle line ride with it;
// the dashed white arrow is the direction of travel. Retractable gear cycles up and down on its own while on screen.
// Sources: PHAK Ch 3 (landing gear: tricycle, conventional / tailwheel; floats, skis); PHAK 7 (retractable gear); AFH Ch 14
// (tailwheel airplanes: CG behind the main wheels, ground loops). The 172 shape is kept for both CG cases so only the CG changes.
import { frame, chips } from "./base.js?v=964a60d052";
import { planeStage } from "./planestage.js?v=964a60d052";
import { rich } from "../core/rich.js?v=964a60d052";
import { h, reduced } from "../core/util.js?v=964a60d052";
import { tags3d } from "./tags3d.js?v=964a60d052";
const XM = -1.22, XN = 4.2, YEL = 0xffd23f, D = Math.PI / 180;
const CASE = {
  ahead: { x: 0.4, chip: "CG ahead of mains", cap: ["Nosewheel (tricycle) gear", "CG ahead of the main wheels"],
    text: "Like the 172. If the airplane starts to swerve, the CG, ahead of the wheels, pulls it back in line, so it tracks straight. Better forward view on the ground too.",
    end: "The swerve corrected itself: the CG ahead of the mains pulls the nose back in line." },
  behind: { x: -3.2, chip: "CG behind mains", cap: ["Tailwheel (conventional) gear", "CG behind the main wheels"],
    text: "Like a Piper Cub. If the airplane starts to swerve, the CG, behind the wheels, keeps pushing the swerve wider. Caught late, it becomes a [[ground loop]]. That is why tailwheel airplanes need quick, active feet.",
    end: "The swerve grew into a ground loop: with the CG behind the mains, a small swerve keeps getting bigger." },
};
// Low 3/4 front-side views: whole airplane in frame, gear visible. Overhead is reserved for the swerve.
// Low, nearly side-on from the front-left (~22° off the side), just above wheel height, close enough that all three wheels read clearly.
const VIEW = {
  tri:   { tg: [-1.4, 1.55, 0], az: -68, el: 6, d: 50 },
  tail:  { tg: [-2.0, 1.55, 0], az: -68, el: 6, d: 50 },
  retr:  { tg: [-1.4, 2.0, 0], az: -68, el: 8, d: 50 },
  float: { tg: [-2.0, 1.8, 0], az: -68, el: 8, d: 54 },
  ski:   { tg: [-1.4, 1.45, 0], az: -68, el: 6, d: 50 }
};
const SWERVEV = { tg: [-2.5, 0, 0], az: 205, el: 62, d: 78 };
const RET_PERIOD = 6.4, RET_UP = 1.7, RET_HOLD = 1.45;
const ease = (u) => u * u * (3 - 2 * u);
function retractAt(now, t0) {
  const t = ((now - t0) / 1000) % RET_PERIOD;
  if (t < RET_UP) return ease(t / RET_UP);
  if (t < RET_UP + RET_HOLD) return 1;
  if (t < RET_UP + RET_HOLD + RET_UP) return 1 - ease((t - RET_UP - RET_HOLD) / RET_UP);
  return 0;
}
export function mount(host, opts = {}) {
  const TYPES = !!opts.types;   // GL2: gear-type chips (tricycle, tailwheel, retractable, floats, skis); GL1: the CG chips only
  const F = frame(host, { cls: "gear3d capin", corners: { tl: TYPES ? "Landing gear" : "Landing gear · CG", tr: "" } });
  F.root.insertBefore(F.root.querySelector(":scope > .caption"), F.explainEl);   // caption under the controls: never over the model, never moves the chips
  const S = planeStage(F.stage, { view: TYPES ? VIEW.tri : VIEW.tri, ground: true, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  S.highlight(["gear"]);
  let cs = "ahead", gt = "tri", yaw = 0, t0 = 0, run = false, retract = 0, retrCap = "", retrT0 = 0;
  const drop = S.cueLine(2, { color: YEL, width: 1.6, opacity: 0.9, dash: [0.3, 0.22] }), ring = S.cueLine(33, { color: YEL, width: 2.6, opacity: 1 }), axle = S.cueLine(2, { width: 1.6, opacity: 0.75, dash: [0.35, 0.25] });
  const path = S.cueArrow({ width: 2, head: 0.9 });
  const TG = tags3d(F.stage), tag = TG.add("CG", { cls: "cg", dx: -46, dy: -40 }), atag = TG.add("Main wheels", { dx: 56, dy: 36, extras: 1 }), ntag = TG.add("Nosewheel", { dx: -72, dy: 22 }), ftag = TG.add("Floats", { dx: -36, dy: 48 }), stag = TG.add("Skis", { dx: 40, dy: 36 });
  // ---- GL2 extras: floats and skis (simple 3D attachments, blue = the focus), and a retract animation ----
  const THREE = S.THREE, XG = S.cueGroup, ACC = 0x3b82f6, NX = 4.2;
  const body = new THREE.MeshBasicMaterial({ color: 0x0a0a0b, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }), edgeM = new THREE.LineBasicMaterial({ color: ACC });
  const addSolid = (geo, grp, thr = 1) => { grp.add(new THREE.Mesh(geo, body)); grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, thr), edgeM)); };
  const floats = new THREE.Group(), skis = new THREE.Group(); floats.visible = skis.visible = false; XG.add(floats, skis);
  const prof = Array.from({ length: 17 }, (_, i) => { const t = i / 16; return new THREE.Vector2(Math.max(0.02, 0.95 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.55) * (t > 0.92 ? 1 - (t - 0.92) * 6 : 1)), t * 19); });
  [-3.5, 3.5].forEach((z) => { const g = new THREE.LatheGeometry(prof, 10); g.rotateZ(-Math.PI / 2); g.scale(1, 0.85, 0.75); g.translate(-11.0, 0.95, z); addSolid(g, floats, 10);
    [[1.6, 1.0], [-3.6, 0.6]].forEach(([x, k]) => { const a = new THREE.Vector3(x, 1.7, z), b = new THREE.Vector3(x - 0.3, 3.0, z * 0.28); const c = new THREE.CylinderGeometry(0.06, 0.06, a.distanceTo(b), 6); c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())); c.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); addSolid(c, floats, 30); }); });
  [[XM, -4.1], [XM, 4.1], [NX, 0]].forEach(([x, z]) => { const g = new THREE.BoxGeometry(3.2, 0.08, 0.75); g.translate(x - 0.3, 0.04, z); addSolid(g, skis, 30); const tip = new THREE.BoxGeometry(0.7, 0.08, 0.75); tip.rotateZ(0.5); tip.translate(x + 1.55, 0.2, z); addSolid(tip, skis, 30); });
  const gearObjs = S.P.parts.gear.subs.map((sb) => sb.obj), gearY = gearObjs.map((o) => o.position.y), gearZ = gearObjs.map((o) => o.position.z);
  const gearDz = gearObjs.map((o) => { const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); return Math.abs(c.z) > 1 ? -Math.sign(c.z) * (Math.abs(c.z) - 0.9) : 0; });
  const rot = (x, y, z) => { const a = yaw * D, dx = x - XM; return [XM + dx * Math.cos(a) + z * Math.sin(a), y, -dx * Math.sin(a) + z * Math.cos(a)]; };
  const applyRetract = (r) => { retract = r; gearObjs.forEach((o, i) => { o.position.y = gearY[i] + r * 3.4; o.position.z = gearZ[i] + r * gearDz[i]; }); };
  // cue lines live in the airplane's frame (they yaw with it); the travel arrow is counter-rotated so it stays put on the ground
  function cues() { const cx = CASE[cs].x, top = [cx, 4.3, 0];
    drop.set([top, [cx, 0.04, 0]]); ring.set(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + 0.55 * Math.cos(a), 0.04, 0.55 * Math.sin(a)]; }));
    axle.set([[XM, 0.04, -5.4], [XM, 0.04, 5.4]]); path.set(rot(5.5, 0.03, 0), rot(13.5, 0.03, 0)); path.opacity = cgOn() && run ? 1 : 0;
    const liftY = retract * 3.4, mainR = [XM, 0.2 + liftY, 4.1 + retract * -3.2], mainL = [XM, 0.2 + liftY, -4.1 + retract * 3.2], nose = [XN, 0.35 + liftY, 0];
    const items = [];
    if (tag.on) items.push({ t: tag, q: S.project(top) });
    if (atag.on) items.push({ t: atag, q: S.project(mainR), qs: [S.project(mainL)] });
    if (ntag.on) items.push({ t: ntag, q: S.project(nose) });
    if (ftag.on) items.push({ t: ftag, q: S.project([-8.0, 1.0, 3.5]) });
    if (stag.on) items.push({ t: stag, q: S.project([XM, 0.08, 4.1]) });
    TG.place(items, 34);
    [tag, atag, ntag, ftag, stag].filter((t) => !t.on).forEach((t) => TG.place([{ t, q: null }])); }
  S.animate((now) => { if (run) { const t = (performance.now() - t0) / 1000;
      if (cs === "ahead") yaw = t < 0.6 ? 18 * Math.sin((t / 0.6) * Math.PI / 2) : 18 * Math.exp(-(t - 0.6) * 1.8) * Math.cos((t - 0.6) * 1.4);
      else yaw = t < 0.6 ? 18 * Math.sin((t / 0.6) * Math.PI / 2) : Math.min(140, 18 * Math.exp((t - 0.6) * 1.35));
      if (t > 3.2) { run = false; if (cs === "ahead") yaw = 0; done(); }
      S.setAttitude({ yaw, pitch: 0, bank: 0 }); }
    if (gt === "retr" && !reduced()) {
      applyRetract(retractAt(now, retrT0));
      const up = retract > 0.55, k = up ? "up" : "down";
      if (k !== retrCap) { retrCap = k; F.caption(up ? "Gear up" : "Gear down", up ? "The wheels fold away to cut drag in cruise." : "The wheels extend for takeoff and landing."); }
    }
    F.root.dataset.yaw = yaw.toFixed(2); cues(); return run || (gt === "retr" && !reduced()); }, { idle: true });
  const cgOn = () => !TYPES || gt === "tri" || gt === "tail";
  const viewFor = () => { if (run) return SWERVEV; if (!TYPES) return cs === "ahead" ? VIEW.tri : VIEW.tail; return VIEW[gt]; };
  const pick = TYPES ? chips(F.ctrl, [["tri", "Tricycle"], ["tail", "Tailwheel"], ["retr", "Retractable"], ["float", "Floats"], ["ski", "Skis"]], gt, (v) => { gt = v; if (cgOn()) cs = v === "tri" ? "ahead" : "behind"; reset(); }, { label: "Gear type" })
    : chips(F.ctrl, Object.entries(CASE).map(([k, c]) => [k, c.chip]), cs, (v) => { cs = v; reset(); }, { label: "Where is the CG?" });
  const go = h("button", { type: "button", class: "btn pri g3-go" }, "Start a swerve"); F.ctrl.append(h("div", { class: "g3-row" }, go));
  go.onclick = () => { if (!cgOn() || run) return; if (go.dataset.done) { reset(); return; } yaw = 0; t0 = performance.now(); run = true; go.textContent = "Swerving…"; F.caption("Swerving…", CASE[cs].cap[1]); F.root.dataset.swerve = "1";
    S.setView(SWERVEV); tagsFor(); if (reduced()) { t0 -= 3300; } S.kick(); };
  function done() { go.dataset.done = "1"; go.textContent = "Reset"; F.root.dataset.swerve = "done"; F.root.dataset.yaw = yaw.toFixed(2); F.caption(cs === "ahead" ? "Straightens out" : "Ground loop", CASE[cs].cap[0]); F.explain(`<b>${CASE[cs].end}</b> ${rich(CASE[cs].text)} <span class="src">PHAK 3 · AFH 14</span>`); S.setView(viewFor()); tagsFor(); S.kick(); }
  const OTHER = { retr: ["Retractable gear", "Watch it cycle", "The wheels fold into the airplane in cruise to cut drag, then extend for landing. Watch the cycle: more to check on preflight, and gear-up landings happen."],
    float: ["Floats", "Land on water", "[[Floats]] replace the wheels so the airplane can take off and land on water. Seaplane flying needs its own rating and training."],
    ski: ["Skis", "Land on snow", "Skis let the airplane land on snow; on many installations they mount around the wheels. Fixed gear is simplest; each option trades simplicity for capability."] };
  function tagsFor() { const on = cgOn();
    tag.on = on; atag.on = on || gt === "retr"; ntag.on = (gt === "tri" || gt === "retr" || (!TYPES && cs === "ahead")) && !run; ftag.on = gt === "float"; stag.on = gt === "ski";
    ntag.el.textContent = "Nosewheel"; }
  function reset() { run = false; yaw = 0; F.root.dataset.yaw = "0"; F.root.dataset.swerve = ""; S.setAttitude({ yaw: 0, pitch: 0, bank: 0 }); delete go.dataset.done; pick.set(TYPES ? gt : cs);
    const on = cgOn(); [drop, ring, axle].forEach((l) => (l.opacity = on ? 0.9 : 0)); path.opacity = on && run ? 1 : 0;
    floats.visible = gt === "float"; skis.visible = gt === "ski"; gearObjs.forEach((o) => (o.visible = gt !== "float")); applyRetract(0); retrCap = ""; retrT0 = performance.now();
    S.highlight(gt === "float" || gt === "ski" ? [] : ["gear"]);
    tagsFor(); S.setView(viewFor()); S.setFlow(gt === "retr" && !reduced());
    if (!on) { const [big, lab, txt] = OTHER[gt]; go.hidden = true; F.caption(big, lab); F.corner("tr", ""); F.explain(`${rich(txt)} <span class="src">PHAK 7</span>`); S.kick(); return; }
    go.hidden = false; go.textContent = "Start a swerve";
    F.caption(CASE[cs].cap[0], CASE[cs].cap[1]); F.corner("tr", cs === "ahead" ? "e.g. Cessna 172" : "e.g. Piper Cub"); F.explain(`${rich(CASE[cs].text)} Tap <b>Start a swerve</b> to see it. <span class="src">PHAK 3 · AFH 14</span>`); }
  reset();
  return { destroy() { S.destroy(); F.destroy(); } };
}
