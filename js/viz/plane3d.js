// 3D part explorer and feature tour for the C172S wireframe.
import { frame, chips } from "./base.js?v=f95c6a1467";
import { planeStage } from "./planestage.js?v=f95c6a1467";
import { h, reduced } from "../core/util.js?v=f95c6a1467";
import { mount as taxiWind } from "./taxiwind.js?v=f95c6a1467";
import { mount as walkaround } from "./walkaround.js?v=f95c6a1467";
import { systems } from "./systems3d.js?v=f95c6a1467";
import { tags3d } from "./tags3d.js?v=f95c6a1467";
// Pose sign conventions (model): ail>0 rolls right, elev<0 = trailing edge up (nose up), rud>0 = right rudder, steer>0 = nose wheel left.
const PARTS = {
  fuselage: { name: "Fuselage", group: "Major component", hl: ["fuselage", "fairing"], view: "iso", text: "The central body. Carries crew, passengers and cargo, and joins the wings and tail. Semimonocoque aluminum on the 172." },
  // Major components follow PHAK Ch 3 (FAA-H-8083-25C): each lights every sub-part it contains. Part buttons light only that part.
  wing: { name: "Wings", group: "Major component", hl: ["wing", "ailerons", "flaps", "fuel", "struts"], view: "wingL", pose: { ail: 18, flap: 20 }, text: "The main lifting surfaces, including the <b>ailerons</b> (outboard) and <b>flaps</b> (inboard) hinged to the trailing edge and the <b>fuel tanks</b> built into each wing. Strut-braced (semi-cantilever) on the 172S." },
  ailerons: { name: "Ailerons", group: "Wings · primary control", hl: ["ailerons"], view: "wingL", pose: { ail: 25 }, text: "Outboard trailing edge. They move opposite each other to <b>roll</b> the airplane about its longitudinal axis: one goes up while the other goes down. Shown deflected (exaggerated) for clarity." },
  flaps: { name: "Flaps", group: "Wings · secondary control", hl: ["flaps"], view: "wingL", pose: { flap: 30 }, text: "Inboard trailing edge. Both move down together to add lift and drag for takeoff and landing. 172S: 10°, 20°, 30°." },
  struts: { name: "Lift struts", group: "Wings · structure", hl: ["struts"], view: "strut", text: "One strut on each side runs from the lower fuselage to about halfway out the wing. It carries flight and landing loads into the fuselage, which makes this a <b>semi-cantilever</b> wing. PHAK 3; C172S POH 7." },
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
const MAP = { fuselage: "fuselage", fairing: "fuselage", wing: "wing", ailerons: "ailerons", flaps: "flaps", struts: "struts", fuel: "fuel", fin: "fin", hstab: "hstab", rudder: "rudder", elevator: "elevator", trimtab: "trimtab", gear: "gear", engine: "engine", propeller: "propeller", cowling: "cowling" };
const TOUR = [
  { key: "fuselage", label: "Four seats · high wing", big: "Cessna 172S", hl: ["fuselage", "fairing", "wing", "flaps", "ailerons", "struts", "cowling", "propeller", "gear", "fin", "rudder", "hstab", "elevator", "trimtab"], view: "iso" },
  { key: "wing", label: "Strut-braced · 174 sq ft", big: "High wing", hl: ["wing", "flaps", "ailerons", "struts"], view: "wingL" },
  { key: "engine", label: "4 cylinders · fuel injected", big: "180 HP", hl: ["engine"], view: "nose", hideCowl: true },
  { key: "propeller", label: "Two blades · fixed pitch", big: "76 in prop", hl: ["propeller", "propDim"], view: "front", spin: true },
  { key: "flaps", label: "Single-slot · 10° · 20° · 30°", big: "Electric flaps", hl: ["flaps"], view: "wingL", flapCycle: true },
  { key: "fuel", label: "Two wing tanks · 53 usable", big: "56 gallons", hl: ["fuel"], view: "top" },
  { key: "gear", label: "Steerable nose wheel", big: "Tricycle gear", hl: ["gear"], view: "gear", steerCycle: true },
];
export function mount(host, opts = {}) {
  const { mode = "explore" } = opts;
  if (mode === "taxi") return taxiWind(host, opts);   // taxiing in wind: control positions on the same 3D airplane (AFH Ch 2)
  if (mode === "walk") return walkaround(host, opts);   // walkaround stations with Spot the defect (AFH Ch 2)
  // Dimensions sit top-right on two lines, clear of the part title at bottom-left at every width.
  const SPEC = "Span 36 ft 1 in\nLength 27 ft 2 in".replace(/ /g, "\u00a0");   // each line stays whole on narrow phones
  const F = frame(host, { cls: "capin p3cap", corners: { tl: "Cessna 172S", tr: SPEC } });   // caption under the stage, so it never covers the model on a phone
  let cur = null, anim = null, ti = 0; const groups = [];
  // Tap a part on the model to select it; tap empty space to clear back to the default view.
  const S = planeStage(F.stage, { view: "iso", maxFps: mode === "systems" ? 30 : 64, onPick: mode === "explore" ? (p) => (p && MAP[p] ? select(MAP[p]) : !p && cur && reset()) : null });
  // Corner labels (type top-left, dimensions top-right) live in a band above the canvas, never over the model.
  let bandW = 0, bandB = 0;   // the band only grows at a given width (a shorter tour label must not resize the canvas)
  const band = () => { const sr = F.stage.getBoundingClientRect(); if (!sr.height) return; let b = 0; F.stage.querySelectorAll(".corner.tl, .corner.tr").forEach((c) => { if (c.textContent.trim()) b = Math.max(b, c.getBoundingClientRect().bottom - sr.top); }); if (sr.width !== bandW) { bandW = sr.width; bandB = 0; } bandB = Math.max(bandB, b ? b + 8 : 0); S.setTopBand(bandB); };
  band(); const bandRO = new ResizeObserver(band); bandRO.observe(F.stage); F.stage.querySelectorAll(".corner.tl, .corner.tr").forEach((c) => bandRO.observe(c)); F.on && F.on(() => bandRO.disconnect());
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  function animatePose(to, dur = reduced() ? 1 : 1400) { const from = { ...curPose }; const t0 = performance.now(); S.animate((now) => { const k = Math.min(1, (now - t0) / dur), e = ease(k); const p = {}; for (const key of new Set([...Object.keys(from), ...Object.keys(to)])) p[key] = (from[key] || 0) + ((to[key] || 0) - (from[key] || 0)) * e; curPose = p; S.pose(p); if (k >= 1) S.animate(null); }); }
  let curPose = {};
  // Cowling: solid (default), wire = outline only so the engine shows through (faces hidden), or hidden entirely.
  // Accent lines (LineSegments2 are meshes too) are left to highlight(), which runs right after.
  function cowl(show, wire = false) { (S.inkLines.cowling || []).forEach((l) => (l.visible = show || wire)); S.P.parts.cowling.subs.forEach((sb) => sb.obj.traverse((o) => o.isMesh && !o.isLineSegments2 && (o.visible = show && !wire))); S.kick(); }
  // Every part you can tap on the model has its own button (MAP targets = the Parts row + Fuselage / Wings / Landing gear).
  // Both button rows act as one set: exactly one button (or none, for parts without a button) is lit, matching the view.
  // Five major components first; a component's own parts appear in the second row only once it (or one of its parts) is picked.
  const SUBS = { wing: ["ailerons", "flaps", "struts", "fuel"], empennage: ["hstab", "elevator", "trimtab", "fin", "rudder"], powerplant: ["engine", "cowling", "propeller"] };
  const PARENT = {}; for (const [k, v] of Object.entries(SUBS)) v.forEach((c) => (PARENT[c] = k));
  let subHint = null;
  function showSubs(major) { const g = groups[1]; if (!g) return; const list = SUBS[major] || []; g.el.querySelectorAll(".chip").forEach((b) => (b.style.display = list.includes(b.dataset.v) ? "" : "none"));
    if (subHint) subHint.textContent = !major ? "Pick a component to see its parts" : list.length ? "" : "Tap another component to see its parts"; if (subHint) subHint.style.display = subHint.textContent ? "" : "none"; }
  const markChip = (key) => { const major = key ? PARENT[key] || key : null; if (groups[0]) groups[0].set(major); if (groups[1]) groups[1].set(PARENT[key] ? key : null); showSubs(major); };
  const INTRO = ["Five major components", "Tap a part", "Drag to orbit. Tap a component, on the airplane or below, to light it up; its own parts then appear in the second row. Tap the same button again, or empty space, to clear it."];
  function reset() { cur = null; markChip(null); cowl(true); S.highlight([]); S.setView("iso"); animatePose({}); F.caption(INTRO[0], INTRO[1]); F.explain(INTRO[2]); }
  function select(key) { const P = PARTS[key]; if (!P) return; cur = key; markChip(key); cowl(!P.hideCowl && !P.cowlWire, P.cowlWire); S.highlight(P.hl); S.setView(P.view); animatePose(P.pose || {}); F.caption(P.group, P.name); F.explain(P.text); }
  if (mode === "explore") {
    groups.push(chips(F.ctrl, [["fuselage", "Fuselage"], ["wing", "Wings"], ["empennage", "Empennage"], ["gear", "Landing gear"], ["powerplant", "Powerplant"]], null, (k) => (k ? select(k) : reset()), { label: "Major components", toggle: true }));
    const r2 = h("div", { class: "p3subs" }); F.ctrl.append(r2); groups.push(chips(r2, [["ailerons", "Ailerons"], ["flaps", "Flaps"], ["struts", "Lift struts"], ["fuel", "Fuel tanks"], ["hstab", "Horizontal stabilizer"], ["elevator", "Elevator"], ["trimtab", "Trim tab"], ["fin", "Vertical stabilizer"], ["rudder", "Rudder"], ["engine", "Engine"], ["cowling", "Cowling"], ["propeller", "Propeller"]], null, (k) => (k ? select(k) : cur && PARENT[cur] ? select(PARENT[cur]) : reset()), { label: "Parts", toggle: true }));
    subHint = h("span", { class: "label p3hint" }); r2.prepend(subHint);
    markChip(null);   // the parts row sits under the components row, so the component buttons never move when it changes
    F.caption(INTRO[0], INTRO[1]); F.explain(INTRO[2]);
  } else if (mode === "systems") {
    const stop = systems(S, F, { cowl, animatePose, setPoseNow: (p) => { S.animate(null); curPose = { ...p }; S.pose(curPose); } }); F.on(stop);
  } else {
    // "tour": the 172's key facts all at once, as labels on one view (gl1-fix13: replaces a 7-stop click-through tour that
    // repeated the spec table on the same page). Static scene: no frames while idle.
    const TG = tags3d(F.stage), SPECS = [["High wing · struts", [-1.6, 7.25, -12.5], -24, -34], ["180 hp engine", [5.2, 5.0, -1.0], 14, -40], ["76 in prop", [7.25, 7.4, 0], 22, -22],
      ["Electric flaps", [-3.75, 6.7, -5.8], -36, 30], ["56 gal in wings", [-0.4, 7.0, 7.5], 28, -28], ["Tricycle gear", [5.7, 0.45, 0], 22, 26]];
    const L3 = SPECS.map(([t, at, dx, dy]) => ({ t: TG.add(t, { dx, dy }), at }));
    S.highlight([]); S.setView({ tg: [-3.4, 4.4, 0], az: -38, el: 20, d: 46 }, 1);
    // each label goes outward from the airplane's middle, so they fan out around it instead of stacking
    const place = () => { const qs = L3.map((l) => S.project(l.at)), c = S.project([-3.4, 4.4, 0]);
      L3.forEach((l, i) => { const vx = qs[i].x - c.x, vy = qs[i].y - c.y, n = Math.hypot(vx, vy) || 1; l.t.dx = (vx / n) * 26 + (vx < 0 ? -6 : 6); l.t.dy = (vy / n) * 30 + (vy < 0 ? -8 : 8); });
      TG.place(L3.map((l, i) => ({ t: l.t, q: qs[i] })), 34); };
    S.animate(() => { place(); return false; }, { idle: true });
    F.caption("Four seats · high wing", "Cessna 172S"); F.explain("The 172S's key facts on one view; the table below has the details. Drag to orbit.");
  }
  return { destroy() { S.destroy(); F.destroy(); } };
}
