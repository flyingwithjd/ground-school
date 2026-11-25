// The four forces in 3D on the 172 (GL1 "aero", GL3) as a scripted, step-by-step animation (PHAK Ch 5).
// Each first/then combination plays 3-4 captioned phases from steady cruise, with every arrow, the airspeed and the
// attitude easing smoothly between phases, then holds the end state (static scene, no frames while idle).
//  - Add power, hold altitude: thrust > drag, the airplane speeds up; parasite drag grows with speed until drag equals
//    thrust again at a higher speed. You lower the nose (trim) so lift stays equal to weight. Thrust and drag end LARGER.
//  - Add power, hands off: the extra speed makes extra lift, the nose rises and it settles into a climb at about the
//    original airspeed. Drag is back to about its old value; the extra thrust balances the part of weight that now acts
//    back along the climb path.
//  - Reduce power: the mirror image (hold altitude: slower, nose higher, thrust and drag SMALLER; hands off: descent at
//    about the same speed, part of weight now pulls forward along the path).
//  - Pitch up, no power change: angle of attack and lift rise, it climbs and airspeed bleeds off to a slower climb.
// Thrust acts along the propeller shaft (turns with the airplane); lift is perpendicular and drag parallel to the flight
// path; weight is always straight down. The camera is a near-side view so arrow lengths read true. Grey 'before'
// arrows beside the solid ones keep the steady-cruise length. Arrows show direction and relative change, not scale.
import { frame, chips, row } from "./base.js?v=4d40905da2";
import { h, reduced } from "../core/util.js?v=4d40905da2";
import { planeStage } from "./planestage.js?v=4d40905da2";
import { tags3d } from "./tags3d.js?v=4d40905da2";
import { INFO } from "./forces.js?v=4d40905da2";
const CG = [-1.2, 4.6, 0], D2R = Math.PI / 180, ACC = 0x3b82f6, GHOST = 0xA8ADB4, V0 = 105;
// anchor on the airframe (model ft), base length, ghost offset (world ft), tag offset dx, dy
// Drag is drawn aft from the wing's trailing edge, through the clear air above the tailcone, so the long side view fits a phone.
const BASE = { lift: [[-0.9, 7.5, 0], 5.0, [-1.6, 0], 24, -8], weight: [[-1.2, 3.0, 0], 5.0, null, 26, 10], thrust: [[7.05, 4.15, 0], 5.0, [0, -1.2], -10, -26], drag: [[-3.9, 7.0, 0], 5.0, [0, 1.25], 16, -26] };
const ST = { T: 1, D: 1, L: 1, V: V0, P: 0, G: 0, C: 0 };   // P pitch attitude (deg), G flight-path angle (deg), C the part of weight along the path (+ back in a climb)
// Each phase: [title, plain-language line, duration ms, target values]. Phase 0 is the steady start.
const START = ["Start: steady cruise", "Thrust = drag and lift = weight. Watch what changes.", 1100, {}];
const SCRIPT = {
  steady: [["Steady flight: forces balanced", "Thrust = drag and lift = weight: constant speed and altitude.", 1, {}]],
  "power-hold": [START,
    ["Thrust increases", "You add power. Thrust grows; drag hasn't changed yet.", 1800, { T: 1.4 }],
    ["Thrust > drag: speeding up", "The airplane accelerates. To stay level you ease the nose down and trim.", 2600, { V: 114, D: 1.18, P: -1.6 }],
    ["Drag grows with speed", "Parasite drag rises with airspeed until it catches up with thrust.", 2600, { V: 120, D: 1.4, P: -2.6 }],
    ["New balance at a higher speed", "Thrust = drag again, both larger than before. Lift still equals weight.", 1400, {}]],
  "power-hands": [START,
    ["Thrust increases", "You add power and let go. Thrust grows; drag hasn't changed yet.", 1800, { T: 1.4 }],
    ["Speed builds, lift grows", "Thrust > drag, so speed rises. More speed makes more lift than weight.", 2400, { V: 112, D: 1.14, L: 1.12, P: 3, G: 1.5, C: 0.1 }],
    ["The nose rises into a climb", "Lift > weight bends the path up. Climbing slows the airplane back down.", 2600, { V: 106, D: 1.02, L: 1.02, P: 6, G: 6, C: 0.38 }],
    ["Steady climb, same speed", "Drag + part of weight (dashed) = thrust. Lift ≈ weight again.", 1600, { V: 105, D: 1, L: 1, C: 0.4 }]],
  "idle-hold": [START,
    ["Thrust decreases", "You reduce power. Thrust shrinks; drag hasn't changed yet.", 1800, { T: 0.65 }],
    ["Drag > thrust: slowing down", "The airplane slows. To stay level you raise the nose and trim.", 2600, { V: 95, D: 0.83, P: 2.2 }],
    ["Drag shrinks with speed", "Parasite drag falls with airspeed until it matches the lower thrust.", 2600, { V: 88, D: 0.65, P: 3.6 }],
    ["New balance at a lower speed", "Thrust = drag again, both smaller than before. Lift still equals weight.", 1400, {}]],
  "idle-hands": [START,
    ["Thrust decreases", "You reduce power and let go. Thrust shrinks; drag hasn't changed yet.", 1800, { T: 0.65 }],
    ["Speed and lift fall", "Drag > thrust, so speed drops. Less speed makes less lift than weight.", 2400, { V: 98, D: 0.9, L: 0.9, P: -2.5, G: -1.5, C: -0.08 }],
    ["The nose drops into a descent", "Weight > lift bends the path down. Descending brings the speed back up.", 2600, { V: 104, D: 0.98, L: 0.98, P: -5, G: -5, C: -0.32 }],
    ["Steady descent, same speed", "Thrust + part of weight (dashed) = drag. Lift ≈ weight again.", 1600, { V: 105, D: 1, L: 1, C: -0.35 }]],
  slow: [START,
    ["Nose up: angle of attack rises", "No power change. More angle of attack makes more lift than weight.", 1800, { P: 7, L: 1.22, D: 1.08, G: 1, C: 0.02 }],
    ["Climbing, airspeed bleeds off", "Thrust is unchanged, so the climb and extra induced drag cost speed.", 2600, { V: 90, P: 9, G: 4, L: 1.06, D: 1.0, C: 0.08 }],
    ["Slower climb, new balance", "Drag + part of weight (dashed) = thrust. Pull more and the wing stalls.", 2400, { V: 80, P: 9.5, G: 4, L: 1, D: 0.88, C: 0.12 }]],
};
const TITLE = { steady: ["Steady flight", "Forces in balance"], "power-hold": ["Add power · hold altitude", "Faster, level: thrust and drag both larger"], "power-hands": ["Add power · hands off", "Climbs at about the same speed"],
  "idle-hold": ["Reduce power · hold altitude", "Slower, level: thrust and drag both smaller"], "idle-hands": ["Reduce power · hands off", "Descends at about the same speed"], slow: ["Pitch up, no extra power", "Climbs while airspeed bleeds off"] };
const EXPLAIN = { steady: "In steady flight the opposing forces cancel: thrust equals drag and lift equals weight, so speed and altitude stay constant. Lift and weight are really much larger than thrust and drag; the arrows show direction and relative change, not scale.",
  "power-hold": "More thrust than drag accelerates the airplane. Drag rises with airspeed until it equals the new thrust, so the airplane settles at a higher speed where thrust and drag are both larger than before. To hold altitude you lower the nose and trim: the same lift at a higher speed needs less angle of attack, so lift stays equal to weight.",
  "power-hands": "Left alone, a trimmed airplane given more power speeds up briefly, the extra lift raises the nose, and it settles into a climb at about the speed it was trimmed for. Lift is about equal to weight again; the extra thrust balances the part of weight that now acts back along the climb path.",
  "idle-hold": "Less thrust than drag slows the airplane. Drag falls with airspeed until it equals the new, smaller thrust. To hold altitude you raise the nose and trim: the same lift at a lower speed needs more angle of attack.",
  "idle-hands": "Left alone, a trimmed airplane given less power slows briefly, loses lift, lowers its nose and settles into a descent at about its trimmed speed. Part of weight now acts forward along the descent path, making up for the missing thrust.",
  slow: "Raising the nose without adding power increases angle of attack, so lift rises and the airplane climbs. Thrust hasn't changed, so the airplane trades airspeed for altitude and settles into a slower climb. Keep raising the nose and the wing reaches its critical angle of attack and stalls." };
const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
export function mount(host) {
  const F = frame(host, { cls: "forces3d capin", corners: { tl: "Four forces", tr: "Not to scale" } });
  F.root.insertBefore(F.root.querySelector(":scope > .caption"), F.explainEl);
  const VW = { tg: [-2.0, 5.7, 0], az: -83, el: 10, d: 37.5 };
  const S = planeStage(F.stage, { view: VW, maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);
  const asi = h("div", { class: "f3-asi", "aria-live": "off" }, h("span", {}, "Airspeed"), h("b", {}, V0 + " kt"), h("em", {}, "Level")); F.stage.append(asi);
  // step caption, right under the visual: fixed height so nothing below ever moves
  const stepN = h("span", { class: "f3-n" }, ""), stepT = h("b", {}, ""), stepX = h("p", {}, ""), prog = h("i");
  const replayBtn = h("button", { type: "button", class: "btn pri f3-replay" }, "↻ Replay");
  const step = h("div", { class: "f3-step", "aria-live": "polite" }, h("div", { class: "f3-sh" }, stepN, replayBtn), h("div", { class: "f3-prog" }, prog), stepT, stepX);
  F.root.insertBefore(step, F.ctrl);
  const TG = tags3d(F.stage), A = {}, Gh = {}, tag = {}, before = {};
  for (const [k, b] of Object.entries(BASE)) {
    A[k] = { ink: S.cueArrow({ width: 6, head: 1.6 }), blue: S.cueArrow({ color: ACC, width: 7.5, head: 1.9 }) };
    if (b[2]) { Gh[k] = S.cueArrow({ color: GHOST, width: 4, head: 1.3, opacity: 0.85 }); before[k] = TG.add("Before", { cls: "before", dx: k === "lift" ? -30 : k === "drag" ? 16 : 8, dy: k === "lift" ? 10 : k === "thrust" ? 14 : -6, tight: k !== "drag" }); }
    tag[k] = TG.add(INFO[k][0], { dx: b[3], dy: b[4] }); const el = tag[k].el; el.setAttribute("role", "button"); el.tabIndex = 0; el.classList.add("pick");
    const go = () => { sel = sel === k ? null : k; sayExplain(); S.kick(); };
    el.addEventListener("click", go); el.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
  }
  // the part of weight that acts along the flight path in a climb (backward) or descent (forward), dashed, end to end
  // with drag (climb) or thrust (descent) so the two together visibly match the opposite force
  const WC = S.cueArrow({ color: 0xC9CCD1, width: 4, head: 1.3, dash: [0.5, 0.35] }), wcTag = TG.add("Part of weight", { cls: "before", dx: 10, dy: -16, tight: true }); wcTag.el.style.opacity = 0;
  let st = "steady", path = "hold", sel = null, t0 = performance.now(), key = "steady", cur = { ...ST };
  const keyOf = () => (st === "power" || st === "idle" ? st + "-" + path : st);
  // where the timeline is at time ms: [phase index, state]
  function at(ms) { const ph = SCRIPT[key]; let a = { ...ST }, t = ms;
    for (let i = 0; i < ph.length; i++) { const b = { ...a, ...ph[i][3] }, d = ph[i][2];
      if (t < d || i === ph.length - 1) { const k = ease(Math.min(1, t / d)); const s = {}; for (const n in a) s[n] = a[n] + (b[n] - a[n]) * k; return [i, s, Math.min(1, t / d)]; }
      t -= d; a = b; } }
  const total = () => SCRIPT[key].reduce((s, p) => s + p[2], 0);
  const pick = chips(F.ctrl, [["steady", "Steady"], ["power", "Add power"], ["idle", "Reduce power"], ["slow", "Pitch up"]], "steady", (k) => { st = k || "steady"; play(); }, { label: "Flight condition" });
  const thenRow = row(F.ctrl, "Then");
  const thenChips = chips(thenRow, [["hold", "Hold altitude"], ["hands", "Hands off"]], "hold", (k) => { path = k || "hold"; play(); }, { label: "Then" });
  const bars = h("div", { class: "f3-bars" });
  const mkBar = (a, b) => { const ia = h("i"), ib = h("i"), ta = h("em", { class: "f3-tick" }), tb = h("em", { class: "f3-tick" });
    const el = h("div", { class: "f3-pair" }, h("div", { class: "f3-bar" }, h("span", {}, a), h("b", {}, ia, ta)), h("div", { class: "f3-bar" }, h("span", {}, b), h("b", {}, ib, tb)));
    bars.append(el); return [ia, ib, ta, tb, el]; };
  const [bT, bD, tT, tD, pTD] = mkBar("Thrust", "Drag"), [bL, bW, tL, tW, pLW] = mkBar("Lift", "Weight"); F.ctrl.append(bars);
  replayBtn.addEventListener("click", () => play());
  function play() { key = keyOf(); sel = null; t0 = performance.now() - (reduced() ? 1e6 : 0); last = -1;
    pick.set(st); thenChips.set(path); thenChips.enable(st === "power" || st === "idle" ? ["hold", "hands"] : []);
    thenRow.classList.toggle("off", !(st === "power" || st === "idle")); replayBtn.disabled = st === "steady";
    F.caption(...TITLE[key]); sayExplain(); S.kick(); }
  function sayExplain() { if (sel) { F.explain(INFO[sel][1] + ' <span class="dim">Tap the label again to go back.</span> <span class="src">PHAK 5</span>'); return; }
    F.explain(EXPLAIN[key] + ' <span class="dim">Tap a force\'s label to read about it.</span> <span class="src">PHAK 5</span>'); }
  // world-frame vector -> model frame (cue group turns with the airplane's pitch)
  const toM = (v, p) => { const a = -p * D2R; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), 0]; };
  const fromM = (q, p) => { const a = p * D2R, x = q[0] - CG[0], y = q[1] - CG[1]; return [CG[0] + x * Math.cos(a) - y * Math.sin(a), CG[1] + x * Math.sin(a) + y * Math.cos(a), q[2]]; };
  const keep = (q, p) => fromM(q, -p);   // a world point (about CG) expressed in the model frame
  let last = -1;
  S.animate(() => {
    const ms = performance.now() - t0, [pi, s, pk] = at(ms), ph = SCRIPT[key], done = pi === ph.length - 1 && pk >= 1;
    cur = s; S.setAttitude({ pitch: s.P, bank: 0, yaw: 0 });
    if (pi !== last) { last = pi; const n = ph.length - 1;
      stepN.textContent = key === "steady" ? "Steady" : pi === 0 ? "Start" : `Step ${pi} of ${n}`; stepT.textContent = ph[pi][0]; stepX.textContent = ph[pi][1]; }
    prog.style.width = (key === "steady" ? 100 : Math.min(100, (ms / total()) * 100)).toFixed(1) + "%";
    const g = s.G * D2R, dirs = { lift: [-Math.sin(g), Math.cos(g)], drag: [-Math.cos(g), -Math.sin(g)], weight: [0, -1] }, val = { lift: s.L, weight: 1, thrust: s.T, drag: s.D };
    const win = { thrust: s.T > s.D + s.C + 0.06, drag: s.D + s.C > s.T + 0.06, lift: s.L > 1.04, weight: s.L < 0.96 };
    const items = [];
    for (const [k, [p0, L0, goff]] of Object.entries(BASE)) {
      const n = L0 * val[k], m = k === "thrust" ? [1, 0, 0] : toM(dirs[k], s.P), p1 = [p0[0] + m[0] * n, p0[1] + m[1] * n, 0];
      A[k].ink.set(p0, p1); A[k].blue.set(p0, p1);
      const on = sel ? sel === k : win[k]; A[k].blue.opacity = on ? 1 : 0; A[k].ink.opacity = on ? 0 : 0.92;
      tag[k].el.classList.toggle("on", on); tag[k].ln.setAttribute("class", on ? "on" : ""); tag[k].dot.setAttribute("class", on ? "on" : "");
      items.push({ t: tag[k], q: S.project(p1) });
      if (Gh[k]) { // the steady-cruise arrow, beside the live one, where it was before anything changed
        const w0 = fromM(p0, 0), d0 = k === "thrust" ? [1, 0] : k === "lift" ? [0, 1] : [-1, 0];
        const ga = [w0[0] + goff[0], w0[1] + goff[1], 0], gb = [ga[0] + d0[0] * L0, ga[1] + d0[1] * L0, 0];
        const a = keep(ga, s.P), b = keep(gb, s.P); Gh[k].set(a, b);
        const vis = key !== "steady" && Math.abs(val[k] - 1) > 0.04 ? Math.min(1, (Math.abs(val[k] - 1) - 0.04) / 0.06) : 0;
        Gh[k].opacity = 0.85 * vis; before[k].on = vis > 0.5; items.push({ t: before[k], q: S.project(b) }); }
    }
    { const c = Math.abs(s.C), on = c > 0.03; WC.opacity = on ? Math.min(1, (c - 0.03) / 0.06) : 0; wcTag.on = on && c > 0.08;
      if (on) { const climb = s.C > 0, base = climb ? "drag" : "thrust", L0 = BASE[base][1], p0 = BASE[base][0];
        const m = base === "thrust" ? [1, 0, 0] : toM(dirs.drag, s.P), n0 = L0 * val[base], a = [p0[0] + m[0] * n0, p0[1] + m[1] * n0, 0];
        const md = climb ? m : toM([Math.cos(g), Math.sin(g)], s.P), b = [a[0] + md[0] * L0 * c, a[1] + md[1] * L0 * c, 0];
        WC.set(a, b); items.push({ t: wcTag, q: S.project(b) }); } else { wcTag.on = false; items.push({ t: wcTag, q: null }); } }
    TG.place(items, 30);
    const pct = (x) => Math.max(6, Math.min(100, (x / 1.6) * 100)) + "%";
    bT.style.width = pct(s.T); bD.style.width = pct(s.D); bL.style.width = pct(s.L); bW.style.width = pct(1);
    [tT, tD, tL, tW].forEach((e) => (e.style.left = pct(1)));
    pTD.classList.toggle("win", win.thrust || win.drag); pTD.classList.toggle("dwin", win.drag); pLW.classList.toggle("win", win.lift || win.weight); pLW.classList.toggle("dwin", win.weight);
    asi.querySelector("b").textContent = Math.round(s.V) + " kt"; asi.querySelector("em").textContent = s.G > 1 ? "Climbing" : s.G < -1 ? "Descending" : "Level";
    Object.assign(F.root.dataset, { v: String(Math.round(s.V)), thrust: s.T.toFixed(2), drag: s.D.toFixed(2), lift: s.L.toFixed(2), weight: "1.00", pitch: s.P.toFixed(1), mode: st, path, phase: String(pi), busy: done ? "0" : "1", settled: done ? "1" : "0" });
    return !done;
  }, { idle: true });
  play();
  return { destroy() { S.destroy(); F.destroy(); } };
}
