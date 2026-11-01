// 3D part explorer and feature tour for the C172S wireframe.
import { frame, chips } from "./base.js?v=6932bc693e";
import { planeStage } from "./planestage.js?v=6932bc693e";
import { h, reduced } from "../core/util.js?v=6932bc693e";
// Pose sign conventions (model): ail>0 rolls right, elev<0 = trailing edge up (nose up), rud>0 = right rudder, steer>0 = nose wheel left.
const PARTS = {
  fuselage: { name: "Fuselage", group: "Major component", hl: ["fuselage", "fairing"], view: "iso", text: "The central body. Carries crew, passengers and cargo, and joins the wings and tail. Semimonocoque aluminum on the 172." },
  // Major components follow PHAK Ch 3 (FAA-H-8083-25C): each lights every sub-part it contains. Part buttons light only that part.
  wing: { name: "Wings", group: "Major component", hl: ["wing", "ailerons", "flaps", "fuel"], view: "wingL", pose: { ail: 18, flap: 20 }, text: "The main lifting surfaces, including the <b>ailerons</b> (outboard) and <b>flaps</b> (inboard) hinged to the trailing edge and the <b>fuel tanks</b> built into each wing. Strut-braced (semi-cantilever) on the 172S." },
  ailerons: { name: "Ailerons", group: "Wings · primary control", hl: ["ailerons"], view: "wingL", pose: { ail: 25 }, text: "Outboard trailing edge. They move opposite each other to <b>roll</b> the airplane about its longitudinal axis: one goes up while the other goes down. Shown deflected (exaggerated) for clarity." },
  flaps: { name: "Flaps", group: "Wings · secondary control", hl: ["flaps"], view: "wingL", pose: { flap: 30 }, text: "Inboard trailing edge. Both move down together to add lift and drag for takeoff and landing. 172S: 10°, 20°, 30°." },
  fuel: { name: "Fuel tanks", group: "Wings · fuel system", hl: ["fuel"], view: "top", text: "One vented integral tank in each wing, 56 gal total, 53 usable. Outline drawn schematically." },
  empennage: { name: "Empennage", group: "Major component", hl: ["fin", "hstab", "rudder", "elevator", "trimtab"], view: "tail", pose: { elev: -18, trim: 10, rud: 18 }, text: "The entire tail group. Fixed surfaces: the <b>vertical stabilizer</b> and <b>horizontal stabilizer</b>. Movable surfaces: the <b>rudder</b>, the <b>elevator</b> and the elevator <b>trim tab</b> (the 172S has no rudder trim tab). The tail cone they mount on is part of the fuselage. PHAK 3." },
  fin: { name: "Vertical stabilizer", group: "Empennage · fixed", hl: ["fin"], view: "tail", text: "Fixed fin. Gives directional (yaw) stability, like the feathers on an arrow." },
  hstab: { name: "Horizontal stabilizer", group: "Empennage · fixed", hl: ["hstab"], view: "tail", text: "Fixed surface that gives pitch stability. The elevator is hinged to its trailing edge." },
  rudder: { name: "Rudder", group: "Empennage · primary control", hl: ["rudder"], view: "tail", pose: { rud: 25 }, text: "Hinged to the fin. Yaws the nose left and right about the vertical axis. Controlled by the rudder pedals." },
  elevator: { name: "Elevator", group: "Empennage · primary control", hl: ["elevator"], view: "tail", pose: { elev: -25 }, text: "Hinged to the horizontal stabilizer. Pitches the nose up and down about the lateral axis. Back pressure raises it." },
  trimtab: { name: "Trim tab", group: "Empennage · secondary control", hl: ["trimtab"], view: "tailR", pose: { trim: 12 }, text: "Small tab on the elevator's trailing edge. Holds the elevator where you want it so you do not have to. Manual trim wheel on the 172S." },
  gear: { name: "Landing gear", group: "Major component", hl: ["gear"], view: "gear", pose: { steer: 10 }, text: "Fixed tricycle gear: two spring-steel <b>main gear</b> legs and a steerable <b>nose gear</b> on an air/oil strut, each wheel with a <b>wheel fairing</b>. Disc brakes on the mains." },
  powerplant: { name: "Powerplant", group: "Major component", hl: ["engine", "cowling", "propeller"], view: "nose", cowlWire: true, text: "The <b>engine</b>, its <b>cowling</b> and the <b>propeller</b>, ahead of the firewall that separates them from the cabin. Lycoming IO-360-L2A, 180 hp, turning a two-blade fixed-pitch prop. Cowling drawn as an outline so you can see the engine inside." },
  engine: { name: "Engine", group: "Powerplant", hl: ["engine"], view: "nose", hideCowl: true, text: "Four cylinders, horizontally opposed, air-cooled, fuel-injected. Shown schematically inside the cowling." },
  propeller: { name: "Propeller", group: "Powerplant", hl: ["propeller"], view: "front", text: "Two blades, fixed pitch, 76 in diameter. A rotating airfoil: it makes thrust the same way a wing makes lift." },
  cowling: { name: "Cowling", group: "Powerplant", hl: ["cowling"], view: "nose", text: "Streamlined cover for the engine. It also routes cooling air across the cylinders." },
};
const MAP = { fuselage: "fuselage", fairing: "fuselage", wing: "wing", ailerons: "ailerons", flaps: "flaps", fuel: "fuel", fin: "fin", hstab: "hstab", rudder: "rudder", elevator: "elevator", trimtab: "trimtab", gear: "gear", engine: "engine", propeller: "propeller", cowling: "cowling" };
const TOUR = [
  { key: "fuselage", label: "Four seats · high wing", big: "Cessna 172S", hl: ["fuselage", "fairing"], view: "iso" },
  { key: "wing", label: "Strut-braced · 174 sq ft", big: "High wing", hl: ["wing"], view: "wingL" },
  { key: "engine", label: "4 cylinders · fuel injected", big: "180 HP", hl: ["engine"], view: "nose", hideCowl: true },
  { key: "propeller", label: "Two blades · fixed pitch", big: "76 in prop", hl: ["propeller", "propDim"], view: "front", spin: true },
  { key: "flaps", label: "Single-slot · 10° · 20° · 30°", big: "Electric flaps", hl: ["flaps"], view: "wingL", flapCycle: true },
  { key: "fuel", label: "Two wing tanks · 53 usable", big: "56 gallons", hl: ["fuel"], view: "top" },
  { key: "gear", label: "Steerable nose wheel", big: "Tricycle gear", hl: ["gear"], view: "gear", steerCycle: true },
];
export function mount(host, { mode = "explore" } = {}) {
  // Dimensions sit top-right on two lines, clear of the part title at bottom-left at every width.
  const SPEC = "Span 36 ft 1 in\nLength 27 ft 2 in".replace(/ /g, "\u00a0");   // each line stays whole on narrow phones
  const F = frame(host, { corners: { tl: "Cessna 172S", tr: SPEC } });
  let cur = null, anim = null, ti = 0; const groups = [];
  // Tap a part on the model to select it; tap empty space to clear back to the default view.
  const S = planeStage(F.stage, { view: "iso", onPick: mode === "explore" ? (p) => (p && MAP[p] ? select(MAP[p]) : !p && cur && reset()) : null });
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  function animatePose(to, dur = reduced() ? 1 : 1400) { const from = { ...curPose }; const t0 = performance.now(); S.animate((now) => { const k = Math.min(1, (now - t0) / dur), e = ease(k); const p = {}; for (const key of new Set([...Object.keys(from), ...Object.keys(to)])) p[key] = (from[key] || 0) + ((to[key] || 0) - (from[key] || 0)) * e; curPose = p; S.pose(p); if (k >= 1) S.animate(null); }); }
  let curPose = {};
  // Cowling: solid (default), wire = outline only so the engine shows through (faces hidden), or hidden entirely.
  // Accent lines (LineSegments2 are meshes too) are left to highlight(), which runs right after.
  function cowl(show, wire = false) { (S.inkLines.cowling || []).forEach((l) => (l.visible = show || wire)); S.P.parts.cowling.subs.forEach((sb) => sb.obj.traverse((o) => o.isMesh && !o.isLineSegments2 && (o.visible = show && !wire))); S.kick(); }
  // Both button rows act as one set: exactly one button (or none, for parts without a button) is lit, matching the view.
  const markChip = (key) => groups.forEach((g) => g.set(key));
  const INTRO = ["Five major components", "Tap a part", "Drag to orbit. Tap the airplane or a button to isolate a part. Tap the same button again, or empty space, to clear it."];
  function reset() { cur = null; markChip(null); cowl(true); S.highlight([]); S.setView("iso"); animatePose({}); F.caption(INTRO[0], INTRO[1]); F.explain(INTRO[2]); }
  function select(key) { const P = PARTS[key]; if (!P) return; cur = key; markChip(key); cowl(!P.hideCowl && !P.cowlWire, P.cowlWire); S.highlight(P.hl); S.setView(P.view); animatePose(P.pose || {}); F.caption(P.group, P.name); F.explain(P.text); }
  if (mode === "explore") {
    groups.push(chips(F.ctrl, [["fuselage", "Fuselage"], ["wing", "Wings"], ["empennage", "Empennage"], ["gear", "Landing gear"], ["powerplant", "Powerplant"]], null, (k) => (k ? select(k) : reset()), { label: "Major components", toggle: true }));
    groups.push(chips(F.ctrl, [["ailerons", "Ailerons"], ["flaps", "Flaps"], ["elevator", "Elevator"], ["rudder", "Rudder"], ["trimtab", "Trim tab"], ["propeller", "Propeller"], ["fuel", "Fuel tanks"]], null, (k) => (k ? select(k) : reset()), { label: "Parts", toggle: true }));
    F.caption(INTRO[0], INTRO[1]); F.explain(INTRO[2]);
  } else {
    const prev = h("button", { class: "btn ghost", type: "button" }, "←"), next = h("button", { class: "btn pri arrow", type: "button" }, "Next");
    const dots = chips(F.ctrl, TOUR.map((t, i) => [String(i), t.big]), "0", (v) => show(+v), { label: "Tour stops" }); F.ctrl.append(h("div", { class: "btns" }, prev, next));
    prev.onclick = () => show((ti + TOUR.length - 1) % TOUR.length); next.onclick = () => show((ti + 1) % TOUR.length);
    function show(i) { ti = i; dots.set(String(i)); const T = TOUR[i]; cowl(!T.hideCowl); S.highlight(T.hl); S.setView(T.view); F.caption(T.label, T.big); F.explain("");
      const t0 = performance.now(); curPose = {};
      if (T.spin) S.animate((now) => S.pose({ prop: ((now - t0) / 1000) * 0.9 }));
      else if (T.flapCycle) S.animate((now) => { const t = ((now - t0) / 1000) % 8; const st = [0, 10, 20, 30, 30, 0]; const k = Math.min(Math.floor(t / 1.4), 5); const f = st[k] + ((st[Math.min(k + 1, 5)] - st[k]) * ease(Math.min(1, (t - k * 1.4) / 0.9))) ; S.pose({ flap: f }); F.corner("tr", `Flaps ${Math.round(st[Math.min(k + 1, 5)] === st[k] ? st[k] : f)}°`); });
      else if (T.steerCycle) S.animate((now) => S.pose({ steer: Math.sin((now - t0) / 900) * 10 }));
      else { S.animate(null); S.pose({}); F.corner("tr", SPEC); } }
    show(0);
  }
  return { destroy() { S.destroy(); F.destroy(); } };
}
