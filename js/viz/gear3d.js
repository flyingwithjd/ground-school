// Landing gear and the CG (GL1 "parts"), in 3D on the 172 model. Pick where the CG sits relative to the main wheels, then
// "Start a swerve": with the CG ahead of the mains (nosewheel airplanes) the swerve straightens out; with the CG behind the
// mains (tailwheel airplanes) it grows into a ground loop. The airplane yaws about its main wheels; the yellow CG mark,
// its drop line and the white main-axle line ride with it; the dashed white arrow is the direction of travel.
// Sources: PHAK Ch 3 (landing gear: tricycle, conventional / tailwheel; floats, skis); AFH Ch 14 (tailwheel airplanes: CG
// behind the main wheels, ground loops). The 172 shape is kept for both cases so only the CG changes.
import { frame, chips } from "./base.js?v=7109f603b7";
import { planeStage } from "./planestage.js?v=7109f603b7";
import { rich } from "../core/rich.js?v=7109f603b7";
import { h, reduced } from "../core/util.js?v=7109f603b7";
import { tags3d } from "./tags3d.js?v=7109f603b7";
const XM = -1.22, YEL = 0xffd23f, D = Math.PI / 180;
const CASE = {
  ahead: { x: 0.4, chip: "CG ahead of mains", cap: ["Nosewheel (tricycle) gear", "CG ahead of the main wheels"],
    text: "Like the 172. If the airplane starts to swerve, the CG, ahead of the wheels, pulls it back in line, so it tracks straight. Better forward view on the ground too.",
    end: "The swerve corrected itself: the CG ahead of the mains pulls the nose back in line." },
  behind: { x: -3.2, chip: "CG behind mains", cap: ["Tailwheel (conventional) gear", "CG behind the main wheels"],
    text: "Like a Piper Cub. If the airplane starts to swerve, the CG, behind the wheels, keeps pushing the swerve wider. Caught late, it becomes a [[ground loop]]. That is why tailwheel airplanes need quick, active feet.",
    end: "The swerve grew into a ground loop: with the CG behind the mains, a small swerve keeps getting bigger." },
};
export function mount(host, opts = {}) {
  const TYPES = !!opts.types;   // GL2: gear-type chips (tricycle, tailwheel, retractable, floats, skis); GL1: the CG chips only
  const F = frame(host, { cls: "gear3d capin", corners: { tl: TYPES ? "Landing gear" : "Landing gear · CG", tr: "" } });
  F.root.insertBefore(F.root.querySelector(":scope > .caption"), F.explainEl);   // caption under the controls: never over the model, never moves the chips
  const S = planeStage(F.stage, { view: { tg: [-2.5, 0, 0], az: 205, el: 62, d: 68 }, ground: true, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  S.highlight(["gear"]);
  let cs = "ahead", yaw = 0, t0 = 0, run = false;
  const drop = S.cueLine(2, { color: YEL, width: 1.6, opacity: 0.9, dash: [0.3, 0.22] }), ring = S.cueLine(33, { color: YEL, width: 2.6, opacity: 1 }), axle = S.cueLine(2, { width: 1.6, opacity: 0.75, dash: [0.35, 0.25] });
  const path = S.cueArrow({ width: 2, head: 0.9 });
  const TG = tags3d(F.stage), tag = TG.add("CG", { cls: "cg", dx: -46, dy: -40 }), atag = TG.add("Main wheels", { dx: 34, dy: 46 });
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
  const gearDz = gearObjs.map((o) => { const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); return Math.abs(c.z) > 1 ? -Math.sign(c.z) * (Math.abs(c.z) - 0.9) : 0; }); let retract = 0, retractTo = 0;
  const rot = (x, y, z) => { const a = yaw * D, dx = x - XM; return [XM + dx * Math.cos(a) + z * Math.sin(a), y, -dx * Math.sin(a) + z * Math.cos(a)]; };
  // cue lines live in the airplane's frame (they yaw with it); the travel arrow is counter-rotated so it stays put on the ground
  function cues() { const cx = CASE[cs].x, top = [cx, 4.3, 0];
    drop.set([top, [cx, 0.04, 0]]); ring.set(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + 0.55 * Math.cos(a), 0.04, 0.55 * Math.sin(a)]; }));
    axle.set([[XM, 0.04, -5.4], [XM, 0.04, 5.4]]); path.set(rot(5.5, 0.03, 0), rot(13.5, 0.03, 0));
    TG.place([{ t: tag, q: S.project(top) }, { t: atag, q: S.project([XM, 0.04, 4.1]) }], 34); }
  S.animate((now) => { if (run) { const t = (performance.now() - t0) / 1000;
      if (cs === "ahead") yaw = t < 0.6 ? 18 * Math.sin((t / 0.6) * Math.PI / 2) : 18 * Math.exp(-(t - 0.6) * 1.8) * Math.cos((t - 0.6) * 1.4);
      else yaw = t < 0.6 ? 18 * Math.sin((t / 0.6) * Math.PI / 2) : Math.min(140, 18 * Math.exp((t - 0.6) * 1.35));
      if (t > 3.2) { run = false; if (cs === "ahead") yaw = 0; done(); }
      S.setAttitude({ yaw, pitch: 0, bank: 0 }); }
    if (retract !== retractTo) { retract += Math.sign(retractTo - retract) * Math.min(Math.abs(retractTo - retract), 0.025); gearObjs.forEach((o, i) => { o.position.y = gearY[i] + retract * 2.3; o.position.z = gearZ[i] + retract * gearDz[i]; }); }
    F.root.dataset.yaw = yaw.toFixed(2); cues(); return run || retract !== retractTo; }, { idle: true });
  let gt = "tri"; const cgOn = () => !TYPES || gt === "tri" || gt === "tail";
  const pick = TYPES ? chips(F.ctrl, [["tri", "Tricycle"], ["tail", "Tailwheel"], ["retr", "Retractable"], ["float", "Floats"], ["ski", "Skis"]], gt, (v) => { gt = v; if (cgOn()) cs = v === "tri" ? "ahead" : "behind"; reset(); }, { label: "Gear type" })
    : chips(F.ctrl, Object.entries(CASE).map(([k, c]) => [k, c.chip]), cs, (v) => { cs = v; reset(); }, { label: "Where is the CG?" });
  const go = h("button", { type: "button", class: "btn pri g3-go" }, "Start a swerve"); F.ctrl.append(h("div", { class: "g3-row" }, go));
  go.onclick = () => { if (!cgOn()) { retractTo = retractTo ? 0 : 1; go.textContent = retractTo ? "Extend gear" : "Retract gear"; F.caption("Retractable gear", retractTo ? "Gear up: less drag in cruise" : "Gear down for landing"); S.kick(); return; }
    if (run) return; if (go.dataset.done) { reset(); return; } yaw = 0; t0 = performance.now(); run = true; go.textContent = "Swerving…"; F.caption("Swerving…", CASE[cs].cap[1]); F.root.dataset.swerve = "1";
    if (reduced()) { t0 -= 3300; } S.kick(); };
  function done() { go.dataset.done = "1"; go.textContent = "Reset"; F.root.dataset.swerve = "done"; F.root.dataset.yaw = yaw.toFixed(2); F.caption(cs === "ahead" ? "Straightens out" : "Ground loop", CASE[cs].cap[0]); F.explain(`<b>${CASE[cs].end}</b> ${rich(CASE[cs].text)} <span class="src">PHAK 3 · AFH 14</span>`); }
  const OTHER = { retr: ["Retractable gear", "Gear folds away", "The wheels fold into the airplane in cruise to cut drag. More to check, and gear-up landings happen. Tap <b>Retract gear</b> to see it.", { tg: [-3, 3.4, 0], az: -48, el: 6, d: 46 }],
    float: ["Floats", "Land on water", "[[Floats]] replace the wheels so the airplane can take off and land on water. Seaplane flying needs its own rating and training.", { tg: [-2.5, 3.0, 0], az: -42, el: 14, d: 52 }],
    ski: ["Skis", "Land on snow", "Skis let the airplane land on snow; on many installations they mount around the wheels. Fixed gear is simplest; each option trades simplicity for capability.", { tg: [-1.5, 2.4, 0], az: -44, el: 12, d: 44 }] };
  const CGV = { tg: [-2.5, 0, 0], az: 205, el: 62, d: 68 };
  function reset() { run = false; yaw = 0; F.root.dataset.yaw = "0"; F.root.dataset.swerve = ""; S.setAttitude({ yaw: 0, pitch: 0, bank: 0 }); delete go.dataset.done; pick.set(TYPES ? gt : cs);
    const on = cgOn(); [drop, ring, axle].forEach((l) => (l.opacity = on ? 0.9 : 0)); path.opacity = on ? 1 : 0; tag.on = atag.on = on;
    floats.visible = gt === "float"; skis.visible = gt === "ski"; gearObjs.forEach((o) => (o.visible = gt !== "float")); retractTo = 0; S.highlight(gt === "float" || gt === "ski" ? [] : ["gear"]);
    if (TYPES) S.setView(on ? CGV : OTHER[gt][3]);
    if (!on) { const [big, lab, txt] = OTHER[gt]; go.textContent = "Retract gear"; go.hidden = gt !== "retr"; F.caption(big, lab); F.corner("tr", ""); F.explain(`${rich(txt)} <span class="src">PHAK 7</span>`); S.kick(); return; }
    go.hidden = false; go.textContent = "Start a swerve";
    F.caption(CASE[cs].cap[0], CASE[cs].cap[1]); F.corner("tr", cs === "ahead" ? "e.g. Cessna 172" : "e.g. Piper Cub"); F.explain(`${rich(CASE[cs].text)} Tap <b>Start a swerve</b> to see it. <span class="src">PHAK 3 · AFH 14</span>`); }
  reset();
  return { destroy() { S.destroy(); F.destroy(); } };
}
