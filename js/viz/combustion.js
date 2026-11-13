// Combustion: normal burn vs detonation vs preignition, shown as a cylinder cross-section and a cylinder-pressure trace
// over crank angle. Tap a case to run one cycle (it stops by itself); then respond.
// Facts, PHAK 7 (Detonation, Preignition): detonation is an uncontrolled, explosive ignition of the mixture in the
// combustion chamber; it causes excessive temperatures and pressures and can damage pistons, valves and rings. Causes:
// a lower fuel grade than specified, very high manifold pressure with low RPM, high power with an excessively lean
// mixture, and extended ground operation or steep climbs where cylinder cooling is reduced. Preventives: the right fuel
// grade, cowl flaps open on the ground, an enriched mixture and a shallow climb, and watching the engine instruments.
// Preignition is ignition before the normally timed spark, from residual hot spots: a carbon deposit on a spark plug, a
// cracked spark plug insulator or other cylinder damage; it causes power loss and high temperatures. The two can occur
// together, and one can cause the other. Spark timing, flame speeds and the pressure curves are illustrative.
import { chips, row } from "./base.js?v=c8fe6c3cee";
import { h, s } from "../core/util.js?v=c8fe6c3cee";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=c8fe6c3cee";
import { anim, COL } from "./dial.js?v=c8fe6c3cee";
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
let uid = 0;
export function mount(host) {
  let kind = "normal", fixed = false, a = A1; const id = "cmb" + ++uid;
  const S = pxScene(host, { cls: "xtall combustion", corners: { tl: "Combustion", tr: "PHAK 7" } }, draw);
  const r0 = row(S.F.ctrl, "Burn"); const kc = chips(r0, [["normal", "Normal"], ["det", "Detonation"], ["pre", "Preignition"]], kind, (v) => { kind = v || "normal"; kc.set(kind); fixed = false; run(); }, { label: "Burn" });
  const r1 = row(S.F.ctrl, "Respond"); const fg = h("div", { class: "chips", role: "group", "aria-label": "Respond" }); r1.append(fg);
  const fb = h("button", { class: "chip", type: "button" }, "–"), rb = h("button", { class: "chip", type: "button" }, "Run a cycle"); fg.append(fb, rb);
  fb.addEventListener("click", () => { if (kind !== "normal") { fixed = !fixed; run(); } }); rb.addEventListener("click", run);
  const A = anim(S.F, (dt) => { a = Math.min(A1, a + dt * 72); S.redraw(); return a < A1; });
  function run() { a = A0; upd(); A.kick(); }
  function upd() { fb.textContent = kind === "normal" ? "No response needed" : fixed ? "Undo" : "Enrich, reduce power"; fb.disabled = kind === "normal"; fb.classList.toggle("on", fixed);
    S.F.explain(CAUSE[fixed ? "normal" : kind]); S.redraw(); }
  function draw(g, W, H, top) {
    const wide = W >= 600, k = fixed ? "normal" : kind;
    // cylinder (head up), piston on a crank
    const cw = wide ? Math.min(W * 0.3, 210) : Math.min(W * 0.44, 170), cx = wide ? 30 + cw / 2 + 10 : W / 2, cy0 = top + 26, stroke = wide ? (H - top) * 0.3 : (H - top) * 0.2, hc = 26;
    const pos = (ang) => (1 - Math.cos(ang * Math.PI / 180)) / 2; // 0 at TDC
    const py = cy0 + hc + pos(a) * stroke, x0 = cx - cw / 2;
    const clip = s("clipPath", { id }, g); s("rect", { x: x0, y: cy0, width: cw, height: py - cy0 }, clip);
    R(g, x0, cy0, cw, py - cy0, { fill: "rgba(242,241,236,.04)" });
    const fl = s("g", { "clip-path": `url(#${id})` }, g);
    const plugs = [[x0 + cw * 0.22, cy0], [x0 + cw * 0.78, cy0]], hot = [x0 + cw * 0.5, cy0 + 4], far = Math.hypot(cw * 0.5, stroke);
    if (k !== "pre" && a >= SPARK) plugs.forEach(([x, y]) => C(fl, x, y, Math.min(far, (a - SPARK) * (cw / 60)), { fill: "rgba(217,178,58,.42)" }));
    if (k === "pre" && a >= HOT) C(fl, hot[0], hot[1], Math.min(far, (a - HOT) * (cw / 70)), { fill: "rgba(217,73,62,.4)" });
    if (k === "det" && a >= KNOCK) { const f = Math.max(0, 1 - (a - KNOCK) / 30); R(fl, x0, cy0, cw, py - cy0, { fill: `rgba(217,73,62,${(0.25 + 0.6 * f).toFixed(2)})` });
      for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, ex = x0 + cw * 0.5, ey = cy0 + (py - cy0) * 0.6; L(fl, ex, ey, ex + Math.cos(an) * cw * 0.3 * (0.4 + f), ey + Math.sin(an) * (py - cy0) * 0.6, { stroke: COL.red, w: 2 }); } }
    L(g, x0, cy0, x0, cy0 + hc + stroke + 26, { stroke: GRAY, w: 2 }); L(g, x0 + cw, cy0, x0 + cw, cy0 + hc + stroke + 26, { stroke: GRAY, w: 2 }); L(g, x0 - 8, cy0, x0 + cw + 8, cy0, { stroke: GRAY, w: 3 });
    plugs.forEach(([x, y]) => { R(g, x - 4, y - 16, 8, 16, { fill: "#0A0A0B", stroke: GRAY, sw: 1.2 }); if (k !== "pre" && a >= SPARK && a < SPARK + 8) C(g, x, y + 3, 5, { fill: INK }); });
    if (k === "pre") C(g, hot[0], hot[1] + 2, 4.5, { fill: COL.red, stroke: COL.yellow, sw: 1.4 });
    R(g, x0 + 3, py, cw - 6, 24, { fill: "#1a1a1c", stroke: k !== "normal" && a > -10 && a < 40 ? COL.red : INK, sw: 1.6, rx: 2 });
    const kr = Math.min(cw * 0.22, 30), kx = cx, ky = cy0 + hc + stroke + 26 + kr + 18, pin = [kx + Math.sin(a * Math.PI / 180) * kr, ky - Math.cos(a * Math.PI / 180) * kr];
    C(g, kx, ky, kr, { stroke: DIM, sw: 1.2 }); L(g, cx, py + 14, pin[0], pin[1], { stroke: INK, w: 3 }); C(g, pin[0], pin[1], 4, { fill: INK });
    if (k === "pre") T(g, cx, cy0 + 28, "hot spot", { size: 11, anchor: "middle", fill: COL.red });
    // pressure trace
    const gx0 = wide ? x0 + cw + 64 : 44, gx1 = W - 18, gy0 = wide ? top + 20 : ky + kr + 30, gy1 = H - 32;
    const X = (an) => gx0 + ((an - A0) / (A1 - A0)) * (gx1 - gx0), Y = (p) => gy1 - Math.min(1.36, p) / 1.36 * (gy1 - gy0) * 0.9;
    R(g, gx0, gy0, gx1 - gx0, gy1 - gy0, { stroke: DIM, sw: 1 }); L(g, X(0), gy0, X(0), gy1, { stroke: DIM, w: 1, dash: "3 4" });
    T(g, X(0), gy1 + 15, "top", { size: 11, anchor: "middle", fill: GRAY }); T(g, gx0, gy1 + 15, "compression", { size: 11, fill: DIM }); T(g, gx1, gy1 + 15, "power", { size: 11, anchor: "end", fill: DIM });
    T(g, gx0 + 6, gy0 + 16, "cylinder pressure", { size: 11, fill: GRAY });
    let m = ""; for (let an = A0; an <= A1; an += 2) m += (m ? "L" : "M") + X(an).toFixed(1) + "," + Y(press("none", an)).toFixed(1); P(g, m, { stroke: DIM, w: 1.2, dash: "4 4" });
    if (k !== "normal") { let n = ""; for (let an = A0; an <= A1; an += 2) n += (n ? "L" : "M") + X(an).toFixed(1) + "," + Y(press("normal", an)).toFixed(1); P(g, n, { stroke: GRAY, w: 1.2 }); }
    let p = ""; for (let an = A0; an <= a; an += 1) p += (p ? "L" : "M") + X(an).toFixed(1) + "," + Y(press(k, an)).toFixed(1);
    if (p) P(g, p, { stroke: k === "normal" ? ACC : COL.red, w: 2.4 }); C(g, X(a), Y(press(k, a)), 4.5, { fill: k === "normal" ? ACC : COL.red });
    if (k !== "pre") L(g, X(SPARK), gy1 - 10, X(SPARK), gy1, { stroke: COL.yellow, w: 2 }); if (k !== "pre") T(g, X(SPARK) - 4, gy1 - 14, "spark", { size: 11, anchor: "end", fill: COL.yellow });
    const say = fixed ? SAY.fixed : SAY[kind]; S.F.caption(say[0], say[1]);
  }
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
