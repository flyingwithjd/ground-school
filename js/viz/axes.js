// Three axes through the CG: rotate the airplane about each, with the axis drawn in the accent.
// Cause, then effect: the control surface deflects first (exaggerated, tinted blue), then the airplane rotates.
// Model signs: ail>0 = right aileron TE up / left down (roll right); elev<0 = elevator TE up (nose up); rud>0 = rudder TE right (nose right).
import { frame, chips } from "./base.js?v=2492b958a0";
import { planeStage } from "./planestage.js?v=2492b958a0";
import { reduced } from "../core/util.js?v=2492b958a0";
const DEF = 28;   // visual surface deflection, deg. Exaggerated for clarity; real travel is smaller (see the POH).
const AX = {
  roll: { label: "Longitudinal axis · ailerons", dir: ["right", "left"], verb: "Rolling", held: "Banked", line: [[14, 0, 0], [-24, 0, 0]], att: "bank", amp: 30, hl: ["ailerons"], pose: (s) => ({ ail: s * DEF }),
    view: { tg: [-2, 3.4, 0], az: -150, el: 14, d: 56 },
    inp: (s) => (s > 0 ? "Yoke right" : "Yoke left"), say: (s) => (s > 0 ? "Right aileron UP · left aileron DOWN" : "Left aileron UP · right aileron DOWN"),
    tags: (s) => [[[-3.0, 6.97 + 0.55 * s, 13.4], s > 0 ? "▲ UP" : "▼ DOWN"], [[-3.0, 6.97 - 0.55 * s, -13.4], s > 0 ? "▼ DOWN" : "▲ UP"]], off: "Ailerons neutral · roll stops",
    text: "Turn the yoke right and the <b>right aileron goes up</b> while the <b>left aileron goes down</b>. The down aileron raises the angle of attack and lift on the left wing, the up aileron lowers it on the right wing, so the airplane rolls right about the longitudinal axis. Turn left and it is the mirror image. <span class=\"src\">PHAK 6</span>" },
  pitch: { label: "Lateral axis · elevator", dir: ["up", "down"], verb: "Pitching", held: "Nose", line: [[0, 0, -22], [0, 0, 22]], att: "pitch", amp: 14, hl: ["elevator"], pose: (s) => ({ elev: -s * DEF }),
    view: { tg: [-7, 4.8, 0], az: -58, el: 12, d: 50 },
    inp: (s) => (s > 0 ? "Yoke back" : "Yoke forward"), say: (s) => (s > 0 ? "Elevator trailing edge UP" : "Elevator trailing edge DOWN"),
    tags: (s) => [[[-17.7, 4.62 + 0.6 * s, -3.5], s > 0 ? "▲ UP" : "▼ DOWN"]], off: "Elevator neutral · pitch change stops",
    text: "Pull the yoke back and the <b>elevator trailing edge goes up</b>. That pushes the tail down, which rotates the nose up about the lateral axis. Push forward and the elevator goes down, the tail rises and the nose pitches down. <span class=\"src\">PHAK 6</span>" },
  yaw: { label: "Vertical axis · rudder", dir: ["right", "left"], verb: "Yawing", held: "Nose", line: [[0, -9, 0], [0, 12, 0]], att: "yaw", amp: 20, hl: ["rudder"], pose: (s) => ({ rud: s * DEF }),
    view: { tg: [-5, 4.8, 0], az: -125, el: 38, d: 50 },
    inp: (s) => (s > 0 ? "Right pedal" : "Left pedal"), say: (s) => (s > 0 ? "Rudder trailing edge RIGHT" : "Rudder trailing edge LEFT"),
    tags: (s) => [[[-19.1, 6.6, 0.6 * s], s > 0 ? "RIGHT" : "LEFT"]], off: "Rudder neutral · yaw stops",
    text: "Press the right rudder pedal and the <b>rudder deflects right</b>. Air pushes the tail left, so the nose yaws right about the vertical axis. Left pedal does the opposite. <span class=\"src\">PHAK 6</span>" },
};
// One loop of the demo: [seconds, surface from, to, attitude from, to] with surface and attitude as fractions (+1 = right / nose up).
const D1 = 0.7, ROT = 1.8, N = 0.5, HOLD = 0.8;
const SEQ = [[D1, 0, 1, 0, 0], [ROT, 1, 1, 0, 1], [N, 1, 0, 1, 1], [HOLD, 0, 0, 1, 1],
  [D1, 0, -1, 1, 1], [ROT * 2, -1, -1, 1, -1], [N, -1, 0, -1, -1], [HOLD, 0, 0, -1, -1],
  [D1, 0, 1, -1, -1], [ROT, 1, 1, -1, 0], [N, 1, 0, 0, 0], [HOLD, 0, 0, 0, 0]];
const TOTAL = SEQ.reduce((a, s) => a + s[0], 0);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
function at(t) { if (t < 0) return { s: 0, a: 0, ds: 0, da: 0, s1: 0, a1: 0 }; t %= TOTAL; for (const [d, s0, s1, a0, a1] of SEQ) { if (t <= d) { const e = ease(t / d); return { s: s0 + (s1 - s0) * e, a: a0 + (a1 - a0) * e, ds: s1 - s0, da: a1 - a0, s1, a1 }; } t -= d; } return { s: 0, a: 0, ds: 0, da: 0, s1: 0, a1: 0 }; }
export function mount(host) {
  const F = frame(host, { corners: { tl: "Axes of flight", tr: "All three pass through the CG" } });
  const S = planeStage(F.stage, { view: "iso", orbit: true }); const T = S.THREE;
  // axis in accent, through the CG: a thin solid rod with arrowheads at both ends (WebGL ignores lineWidth, so it is a mesh) plus a soft glow sleeve.
  // One merged geometry each, rebuilt only when the axis changes: two draw calls, as before.
  const mat = new T.MeshBasicMaterial({ color: 0x5b9bff });
  const gmat = new T.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2, depthWrite: false, depthTest: false });   // the glow shows through the airplane, so the axis reads as one line through the CG
  const line = new T.Mesh(new T.BufferGeometry(), mat), glow = new T.Mesh(new T.BufferGeometry(), gmat); line.renderOrder = 2; glow.renderOrder = 3; S.scene.add(line, glow);
  const Y = new T.Vector3(0, 1, 0);
  const rodGeo = (a, b, r, head) => { const L = a.distanceTo(b), parts = [new T.CylinderGeometry(r, r, L - (head ? 2 * head[1] : 0), 12, 1, !head)];
    if (head) for (const sg of [1, -1]) { const c = new T.ConeGeometry(head[0], head[1], 16); if (sg < 0) c.rotateX(Math.PI); c.translate(0, sg * (L / 2 - head[1] / 2), 0); parts.push(c); }
    const arrs = parts.map((g) => { const n = g.index ? g.toNonIndexed() : g; const a = n.attributes.position.array; g.dispose(); if (n !== g) n.dispose(); return a; });
    const pos = new Float32Array(arrs.reduce((k, a) => k + a.length, 0)); let o = 0; for (const a of arrs) { pos.set(a, o); o += a.length; }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos, 3));
    g.applyQuaternion(new T.Quaternion().setFromUnitVectors(Y, b.clone().sub(a).normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return g; };
  const setAxis = (a, b) => { line.geometry.dispose(); glow.geometry.dispose(); line.geometry = rodGeo(a, b, 0.17, [0.62, 1.7]); glow.geometry = rodGeo(a, b, 0.48, null); };
  let first = true, key = "roll", t0 = performance.now(), lastCap = "", tinted = null; const still = reduced();
  const caption = (label, big) => { const k = label + "|" + big; if (k !== lastCap) { lastCap = k; F.caption(label, big); } };
  // tint the surface only while it is deflected, so the blue fill tracks the cause
  const tintOn = (on) => { if (on !== tinted) { tinted = on; S.tint(on ? AX[key].hl : []); } };
  // Small labels pinned to each deflected trailing edge (positioned in the same frame as the render, no extra loop).
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 10px/1 var(--mono);letter-spacing:.12em;color:#bfdbfe;background:rgba(10,10,11,.78);border:1px solid #3b82f6;border-radius:4px;padding:4px 6px;opacity:0;will-change:transform";
  const tagEls = [0, 1].map(() => { const e = document.createElement("div"); e.className = "axtag"; e.setAttribute("aria-hidden", "true"); e.style.cssText = TAG; F.stage.append(e); return e; });
  function tags(st) { const A = AX[key], sg = st.s1 || Math.sign(st.s), on = Math.abs(st.s) > 0.05, list = on ? A.tags(sg) : [];
    tagEls.forEach((e, i) => { const t = list[i]; if (!t) { e.style.opacity = "0"; return; } const p = S.project(t[0]); if (e.textContent !== t[1]) e.textContent = t[1];
      e.style.opacity = String(Math.min(1, Math.abs(st.s) * 2)); e.style.transform = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px) translate(-50%,-140%)`; }); }
  function apply(st) { const A = AX[key]; S.setAttitude({ pitch: 0, bank: 0, yaw: 0, [A.att]: st.a * A.amp }); S.pose({ ail: 0, elev: 0, rud: 0, ...A.pose(st.s) }); tintOn(Math.abs(st.s) > 0.05); tags(st);
    const side = (v) => A.dir[v > 0 ? 0 : 1];
    if (st.s1 !== 0 && st.ds !== 0) caption(A.say(st.s1), A.inp(st.s1));            // cause: the surface moves first
    else if (st.s1 !== 0) caption(A.say(st.s1), `${A.verb} ${side(st.da || st.s1)}`);   // effect: the airplane rotates
    else caption(A.off, Math.abs(st.a) > 0.05 ? `${A.held} ${side(st.a)}` : "Level"); }
  function set(k) { key = k; const A = AX[k]; const c = S.CG; const pts = A.line.map((p) => new T.Vector3(p[0] + c.x, p[1] + c.y, p[2] + c.z)); setAxis(pts[0], pts[1]); S.highlight(A.hl); tinted = null; lastCap = "";
    F.explain(`${A.text} <br><span class="src">${A.label}. Surface movement exaggerated for clarity.</span>`); S.setView(A.view, first ? 1 : 1600); t0 = performance.now() + (first ? 300 : 1300); first = false;   // let the camera arrive before the demo starts
    // Reduced motion: snap to one held pose (surface deflected, airplane rotated) instead of animating.
    if (still) apply({ s: 1, a: 0.7, ds: 0, da: 1, s1: 1, a1: 1 }); else apply(at(-1)); }
  if (!still) S.animate((now) => apply(at((now - t0) / 1000)));
  chips(F.ctrl, [["roll", "Roll"], ["pitch", "Pitch"], ["yaw", "Yaw"]], "roll", set, { label: "Axis" });
  set("roll");
  return { destroy() { line.geometry.dispose(); glow.geometry.dispose(); mat.dispose(); gmat.dispose(); S.destroy(); F.destroy(); } };
}
