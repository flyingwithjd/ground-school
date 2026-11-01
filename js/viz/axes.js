// Three axes through the CG: rotate the airplane about each, with the axis drawn in the accent.
import { frame, chips } from "./base.js?v=c2a8eeaf64";
import { planeStage } from "./planestage.js?v=c2a8eeaf64";
import { reduced } from "../core/util.js?v=c2a8eeaf64";
const AX = { roll: { label: "Longitudinal axis · ailerons", big: "Roll", line: [[14, 0, 0], [-24, 0, 0]], att: "bank", amp: 30, hl: ["ailerons"], pose: (v) => ({ ail: v / 2.5 }) },
  pitch: { label: "Lateral axis · elevator", big: "Pitch", line: [[0, 0, -22], [0, 0, 22]], att: "pitch", amp: 14, hl: ["elevator"], pose: (v) => ({ elev: -v }) },
  yaw: { label: "Vertical axis · rudder", big: "Yaw", line: [[0, -9, 0], [0, 12, 0]], att: "yaw", amp: 20, hl: ["rudder"], pose: (v) => ({ rud: v }) } };
export function mount(host) {
  const F = frame(host, { corners: { tl: "Axes of flight", tr: "All three pass through the CG" } });
  const S = planeStage(F.stage, { view: "iso", orbit: true }); const T = S.THREE;
  // axis line in accent, drawn through the CG (scene coordinates)
  const mat = new T.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.95 }); const geo = new T.BufferGeometry(); const line = new T.Line(geo, mat); S.scene.add(line);
  const glow = new T.Line(geo, new T.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.25 })); S.scene.add(glow);
  let key = "roll";
  function set(k) { key = k; const A = AX[k]; const c = S.CG; const pts = A.line.map((p) => new T.Vector3(p[0] + c.x, p[1] + c.y, p[2] + c.z)); geo.setFromPoints(pts); S.highlight(A.hl); F.caption(A.label, A.big); if (still) pose(A.amp * 0.7); S.setView(k === "pitch" ? { tg: [-3, 4.6, 0], az: -55, el: 12, d: 54 } : k === "yaw" ? { tg: [-3, 4.6, 0], az: -40, el: 34, d: 54 } : "iso"); }
  const t0 = performance.now(); const still = reduced();
  const pose = (v) => { const A = AX[key]; S.setAttitude({ pitch: 0, bank: 0, yaw: 0, [A.att]: v }); S.pose(A.pose(Math.sign(v) * Math.min(Math.abs(v), 15))); };
  // Reduced motion: hold a fixed deflection instead of a continuous rock.
  if (!still) S.animate((now) => { const A = AX[key]; const v = Math.sin((now - t0) / 1600) * A.amp; S.setAttitude({ pitch: 0, bank: 0, yaw: 0, [A.att]: v }); S.pose(A.pose(Math.sign(v) * Math.min(Math.abs(v), 15))); });
  chips(F.ctrl, [["roll", "Roll"], ["pitch", "Pitch"], ["yaw", "Yaw"]], "roll", set, { label: "Axis" });
  F.explain("Each control surface rotates the airplane about one axis. The airplane always rotates about its center of gravity.");
  set("roll");
  return { destroy() { S.destroy(); F.destroy(); } };
}
