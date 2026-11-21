// CG and longitudinal stability as a seesaw, in ink 3D (PHAK Ch 5, 10). The airplane balances on the center of lift like a
// seesaw on its pivot: weight at the CG (blue) sits ahead of it and tips the nose down; the tail pushes down to balance. Slide the
// CG through the C172S range (FS 35.0 to 47.3, POH Sec 6) and past the aft limit; tap Gust to see the pitch response. Force sizes and
// the center-of-lift station are illustrative. Static scene: frames only while something moves.
import { frame, slider, readout } from "./base.js?v=x";
import { planeStage } from "./planestage.js?v=x";
import { h, reduced } from "../core/util.js?v=x";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
const XF = 3.62, X = (fs) => XF - fs / 12;          // model x (ft, +x nose) from a fuselage station in inches (firewall = FS 0)
const FS_FWD = 35.0, FS_AFT = 47.3, FS_COL = 50.5;   // CG limits (C172S, normal category); center of lift: illustrative, aft of the CG range
const XCOL = X(FS_COL), XV = (fs) => XCOL + (X(fs) - XCOL) * 3,   // CG travel drawn 3x for legibility
  YB = 4.6, XT = -16.0, YT = 4.62, ACC = 0x3b82f6;
export function mount(host) {
  const F = frame(host, { cls: "capin stab3d", corners: { tl: "CG and stability", tr: "PHAK 5 · POH 6" } });
  const S = planeStage(F.stage, { view: { tg: [-4.6, 4.2, 0], az: -90, el: 6, d: 46 }, orbit: true, maxFps: 30, cg: [XCOL, YB, 0], fov: 30 }); const T = S.THREE;
  // the pivot of the seesaw: a fixed ink wedge under the center of lift (drawn just in front of the airplane), and a level line
  const ZP = -6.5, res = new T.Vector2(1, 1), mats = [];
  const fat = (pairs, o) => { const m = new LineMaterial({ color: 0xf2f1ec, linewidth: 2, transparent: true, ...o }); mats.push(m); const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(pairs.flat(2))); const l = new LineSegments2(g, m); l.renderOrder = 9; l.frustumCulled = false; S.scene.add(l); return l; };
  const A0 = [XCOL, YB - 2.55, ZP], B0 = [XCOL - 1.2, YB - 4.6, ZP], C0 = [XCOL + 1.2, YB - 4.6, ZP];
  const tri = new T.Mesh(new T.BufferGeometry().setFromPoints([A0, B0, C0].map((q) => new T.Vector3(...q))), new T.MeshBasicMaterial({ color: 0x16161b, side: T.DoubleSide })); tri.renderOrder = 8; S.scene.add(tri);
  fat([[A0, B0], [B0, C0], [C0, A0]], { opacity: 0.95 }); fat([[[XT - 3, YB - 4.6, ZP], [9, YB - 4.6, ZP]]], { opacity: 0.25, linewidth: 1.2 });
  const aLift = S.cueArrow({ width: 6, head: 1.4 }), aW = S.cueArrow({ color: ACC, width: 7.5, head: 1.6 }), aT = S.cueArrow({ width: 6, head: 1.3 });
  const cgBall = new T.Mesh(new T.SphereGeometry(0.42, 20, 14), new T.MeshBasicMaterial({ color: ACC, depthTest: false })); cgBall.renderOrder = 8; S.cueGroup.add(cgBall);
  // tags
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:rgba(242,241,236,.85);background:rgba(10,10,11,.75);border:1px solid rgba(242,241,236,.22);border-radius:4px;padding:4px 6px;transform:translate(-50%,-50%)";
  const sty = document.createElement("style"); sty.textContent = ".st3-tag.acc{color:#bfdbfe!important;border-color:#3b82f6!important}@media (max-width:560px){.st3-tag{font-size:10px!important;padding:3px 5px!important;letter-spacing:.05em!important}}"; F.stage.append(sty);
  const tags = []; const tag = (text, cls = "", local = true) => { const e = document.createElement("div"); e.className = "st3-tag " + cls; e.style.cssText = TAG; e.textContent = text; e.setAttribute("aria-hidden", "true"); F.stage.append(e); const t = { e, at: [0, 0, 0], local }; tags.push(t); return t; };
  const tLift = tag("Lift"), tW = tag("Weight · CG", "acc"), tT = tag("Tail down-force"), tP = tag("Center of lift · pivot", "", false);
  tP.at = [XCOL, YB - 5.4, ZP];
  function placeTags() { const W = F.stage.clientWidth, H = F.stage.clientHeight, top = W < 560 ? 44 : 32, done = [];
    for (const t of tags) { const q = S.project(t.at, t.local); if (!t.w || t.e.dataset.txt !== t.e.textContent) { t.w = t.e.offsetWidth; t.h = t.e.offsetHeight; t.e.dataset.txt = t.e.textContent; } const w = t.w, hh = t.h;
      const x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, q.x)); let y = q.y;
      for (const k of [0, -1, 1, -2, 2]) { const yy = Math.max(top + hh / 2, Math.min(H - hh / 2 - 4, q.y + k * (hh + 3))); if (!done.some((r) => Math.abs(r.x - x) < (r.w + w) / 2 + 3 && Math.abs(r.y - yy) < (r.h + hh) / 2 + 2)) { y = yy; break; } }
      done.push({ x, y, w, h: hh }); t.e.style.left = Math.round(x) + "px"; t.e.style.top = Math.round(y) + "px"; } }
  // camera: frame the airplane, the pivot and the arrows on any stage
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 800);
  function fit() { const r = F.stage.getBoundingClientRect(); if (!r.width) return; cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); const tg = [-4.4, 4.4, 0], az = -90, el = 6;
    const pts = [[9.2, YB + 6.3], [9.2, YB - 5.9], [XT - 3.2, YB + 6.3], [XT - 3.2, YB - 5.9]].map(([x, y]) => new T.Vector3(x, y, 0)); let lo = 5, hi = 400;
    for (let it = 0; it < 28; it++) { const d = (lo + hi) / 2, e = (el * Math.PI) / 180, a = (az * Math.PI) / 180; cam.position.set(tg[0] + d * Math.cos(e) * Math.cos(a), tg[1] + d * Math.sin(e), tg[2] + d * Math.cos(e) * Math.sin(a)); cam.lookAt(...tg); cam.updateMatrixWorld();
      const ok = pts.every((c) => { const q = c.clone().project(cam); return Math.abs(q.x) < 0.97 && q.y < 0.78 && q.y > -0.95; }); if (ok) hi = d; else lo = d; }
    S.setView({ tg, az, el, d: hi }, 1); }
  new ResizeObserver(() => fit()).observe(F.stage);
  const set = readout(F.ctrl, [["s", "stall speed"], ["c", "cruise"], ["st", "stability"], ["e", "elevator force"]]);
  let cg = 0.4, t0 = null;
  const fsOf = (v) => FS_FWD + v * (FS_AFT - FS_FWD);
  function upd(v) { cg = v; const fs = fsOf(v), xc = XV(fs), arm = (X(fs) - XCOL) * 3;   // CG ahead of the pivot: positive arm
    // moments about the center of lift: weight x arm = tail force x tail arm (sizes illustrative, scaled for legibility)
    const Wlen = 4.2, tail = Math.max(0.35, (Wlen * arm) / (XCOL - XT) * 5.2), lift = Wlen + tail * 0.55;
    aW.set([xc, YB - 0.2, 0], [xc, YB - 0.2 - Wlen, 0]); cgBall.position.set(xc, YB, 0);
    aLift.set([XCOL, YB + 1.6, 0], [XCOL, YB + 1.6 + lift * 0.9, 0]); aT.set([XT, YT + 0.4, 0], [XT, YT + 0.4 - Math.min(5, tail), 0]);
    tLift.at = [XCOL + 1.9, YB + 1.6 + lift * 0.9, 0]; tW.at = [xc + 0.2, YB - Wlen - 1.1, 0]; tT.at = [XT - 0.2, YT - Math.min(5, tail) - 0.9, 0];
    const beyond = v > 1.02, fwd = v < 0.35, aft = v > 0.7;
    set("s", fwd ? "higher" : aft ? "lower" : "nominal"); set("c", fwd ? "slower" : aft ? "faster" : "nominal"); set("st", beyond ? "unstable" : fwd ? "strong" : aft ? "reduced" : "positive"); set("e", fwd ? "heavier" : aft ? "lighter" : "normal");
    F.caption(beyond ? "Aft of the aft limit" : fwd ? "Forward CG" : aft ? "Aft CG, within limits" : "Mid-range CG", beyond ? "Possibly uncontrollable" : fwd ? "Stable but heavy" : aft ? "Faster, less stable" : "Balanced");
    F.explain(beyond ? "The tail can no longer restore the nose. Stall and spin recovery may become impossible. Never fly outside the CG envelope. <span class=\"src\">PHAK 5, 10</span>"
      : fwd ? "The CG is far ahead of the center of lift, so the tail must push down hard, like a heavy child far out on a seesaw. The wing carries that extra load: higher stall speed, more drag, heavier elevator, and you may run out of up-elevator in the flare. <span class=\"src\">PHAK 5, 10</span>"
      : aft ? "Less tail-down force means less drag and a slightly lower stall speed, but the airplane is less stable and pitch forces are light. Stall recovery is harder. <span class=\"src\">PHAK 5, 10</span>"
      : "The airplane balances on the center of lift like a seesaw. The CG sits ahead of it and tips the nose down; the tail's downward force balances it. Tap <strong>Gust</strong> to disturb the pitch. <span class=\"src\">PHAK 5</span> <span class=\"dim\">Force sizes and the center-of-lift station are illustrative and CG travel is drawn 3× for clarity; the FS readout is the C172S normal-category range.</span>");
    if (t0 == null) S.setAttitude({ pitch: 0, bank: 0, yaw: 0 }); S.kick(); }
  slider(F.ctrl, { label: "CG · fwd → aft", min: 0, max: 1.15, step: 0.01, value: 0.4, fmt: (v) => (v > 1.02 ? "beyond aft" : `FS ${fsOf(v).toFixed(1)}`), oninput: upd });
  const gust = h("button", { class: "chip", type: "button" }, "Gust"); F.ctrl.append(gust);
  gust.addEventListener("click", () => { if (reduced()) { F.explain(cg > 1.02 ? "After a gust, the nose keeps rising: there is no restoring tendency." : cg < 0.35 ? "After a gust, the nose returns quickly with little overshoot." : "After a gust, the nose returns with a few gentle oscillations that die out: positive dynamic stability."); return; } t0 = performance.now(); S.kick(); });
  upd(0.4); fit();
  S.animate((now) => { if (t0 != null) { const t = (now - t0) / 1000, beyond = cg > 1.02, z = 0.55 - 0.45 * Math.min(cg, 1), w = 3.2 - 1.2 * Math.min(cg, 1);
        const pitch = beyond ? Math.min(22, 6 * Math.exp(0.7 * t)) : 8 * Math.exp(-z * w * t) * Math.cos(w * t); S.setAttitude({ pitch, bank: 0, yaw: 0 });
        if (beyond ? t > 3.5 : t > 9 || (t > 1 && Math.abs(pitch) < 0.05)) { t0 = null; if (!beyond) S.setAttitude({ pitch: 0, bank: 0, yaw: 0 }); } }
      const rr = S.renderer.getDrawingBufferSize(new T.Vector2()); if (rr.x !== res.x || rr.y !== res.y) { res.copy(rr); mats.forEach((m) => m.resolution.copy(res)); }
      placeTags(); return t0 != null; }, { idle: true });
  return { destroy() { tags.forEach((t) => t.e.remove()); S.destroy(); F.destroy(); } };
}
