// Construction close-ups (GL1 "build"), beside the 3D fuselage explorer: a composite skin with the tap test, the wing's
// structural parts, and wing layout (placement and bracing). Mode chips on top; each mode's buttons sit in a fixed bar
// under the stage. Sources: PHAK Ch 3 (composites: fibers in a resin matrix, honeycomb sandwich, hidden low-energy impact
// damage, heat above 150 °F, lightning mesh; wing spars, ribs, stringers; high/mid/low, mono/biplane, semi-cantilever);
// AFH Ch 2 (tap test: a change in sound when gently tapping with a fingertip).
import { pxScene, T, R, L, P, C, hit, INK, ACC, GRAY, DIM, ACCF } from "./kit.js?v=7534528db0";
import { chips } from "./base.js?v=7534528db0";
import { rich } from "../core/rich.js?v=7534528db0";
import { h } from "../core/util.js?v=7534528db0";
const LAYERS = [
  { k: "paint", n: "Paint", hh: 0.08, d: "Often white: many epoxy resins weaken above about 150 °F, and a dark skin in the sun gets much hotter." },
  { k: "mesh", n: "Lightning mesh", hh: 0.07, d: "A fine aluminum or copper mesh bonded at the surface carries a lightning strike's current, because fiberglass doesn't conduct and carbon fiber conducts poorly." },
  { k: "outer", n: "Outer plies", hh: 0.2, d: "Fiberglass or carbon-fiber cloth set in a resin matrix (usually epoxy). Plies laid at different angles carry loads in different directions." },
  { k: "core", n: "Honeycomb core", hh: 0.35, d: "Thin skins over a honeycomb core make a stiff sandwich, but a puncture lets water in." },
  { k: "inner", n: "Inner plies", hh: 0.18, d: "The inner skin. Damage from a small bump can spread here, out of sight, while the paint looks fine." },
];
const WING = { spar: ["Spars", "The main spanwise beams. They carry most of the wing's bending loads into the fuselage."], rib: ["Ribs", "Chordwise pieces that give the wing its airfoil shape and thickness."], str: ["Stringers", "Light spanwise members that stiffen the skin between the ribs."], skin: ["Skin", "Riveted to all of it, the skin carries load too, which is why a dent or ripple matters."] };
const LAY = { high: ["High wing, strut-braced", "A strut about halfway out carries loads into the fuselage: a semi-cantilever wing, like the 172."], low: ["Low wing, cantilever", "No outside braces: the wing carries its loads inside. Most low-wing airplanes are built this way."], mid: ["Mid wing", "The wing joins the middle of the fuselage. Common on aerobatic and military designs."], bi: ["Biplane", "Two sets of wings, braced to each other with struts and wires. One set makes a monoplane."] };
export function mount(host) {
  let mode = "comp", layer = null, tap = null, wp = "spar", lay = "high";
  const sc = pxScene(host, { cls: "buildparts", corners: { tl: "Up close", tr: "PHAK 3" } }, draw);
  const { F } = sc; F.root.insertBefore(F.ctrl, F.stage);
  const bar = h("div", { class: "fc-bar" }); F.stage.after(bar); F.root.insertBefore(F.root.querySelector(".caption"), bar.nextSibling);
  chips(F.ctrl, [["comp", "Composite skin"], ["wing", "Wing parts"], ["lay", "Wing layout"]], mode, (v) => { mode = v; ui(); }, { label: "Close-up" });
  function ui() { bar.innerHTML = "";
    if (mode === "comp") { const r = h("div", { class: "fc-row" });
      [["good", "Tap a sound spot"], ["bad", "Tap the bubbled spot"]].forEach(([k, t]) => { const b = h("button", { type: "button", class: "btn ghost fc-ans" + (tap === k ? " on" : "") }, t); b.dataset.k = k; b.onclick = () => { tap = k; layer = null; refresh(); }; r.append(b); });
      bar.append(r, h("p", { class: "aw-hint" }, "Or tap a layer to name it.")); }
    else if (mode === "wing") chips(bar, Object.entries(WING).map(([k, v]) => [k, v[0]]), wp, (v) => { wp = v; refresh(); }, { label: "Wing part" });
    else chips(bar, Object.entries(LAY).map(([k, v]) => [k, v[0].split(",")[0]]), lay, (v) => { lay = v; refresh(); }, { label: "Layout" });
    refresh(); }
  function refresh() { bar.querySelectorAll(".fc-ans").forEach((b) => b.classList.toggle("on", b.dataset.k === tap)); text(); sc.redraw(); }
  function text() {
    if (mode === "comp") { const L0 = LAYERS.find((x) => x.k === layer);
      if (L0) { F.caption("Composite layer", L0.n); F.explain(rich(L0.d) + ' <span class="src">PHAK 3</span>'); }
      else if (tap === "good") { F.caption("Tap test", "Sharp click: bonded"); F.explain(rich("A crisp, solid sound means the layers are bonded. On the walkaround, tap gently with a fingertip and listen for any change. <span class=\"src\">AFH 2</span>")); }
      else if (tap === "bad") { F.caption("Tap test", "Dull thud: delamination"); F.explain(rich("A dull, flat sound over a bubble means the plies have separated ([[delamination]]). Whitish areas are another sign. Don't fly; have a mechanic who knows composites look. <span class=\"src\">AFH 2 · PHAK 3</span>")); }
      else { F.caption("Composite skin", "Smooth, light, no corrosion"); F.explain(rich("[[Composite]] skins are smooth, light and don't corrode, but damage can hide: a small bump may leave no mark outside and a wide [[delamination]] inside. Most fuel and oil spills don't hurt modern epoxy composites if they don't attack the paint. <span class=\"src\">PHAK 3</span>")); } }
    else if (mode === "wing") { F.caption("Wing structure", WING[wp][0]); F.explain(rich(WING[wp][1] + ' <span class="src">PHAK 3</span>')); }
    else { F.caption("Wing layout", LAY[lay][0]); F.explain(rich(LAY[lay][1] + ' <span class="src">PHAK 3</span>')); } }
  function draw(g, W, H, top) { const avail = H - top - 10, x0 = 18, x1 = W - 18;
    if (mode === "comp") { let y = top + 6; const hh = avail * 0.8, spot = tap === "bad" ? (x1 - 130) * 0.62 : (x1 - 130) * 0.3;
      LAYERS.forEach((Lr) => { const lh = Lr.hh * hh, on = layer === Lr.k, st = on ? ACC : INK, fill = on ? ACCF : "#141416";
        const r = R(g, x0, y, x1 - x0, lh, { fill, stroke: st, sw: on ? 2 : 1 });
        if (Lr.k === "mesh") for (let x = x0 + 4; x < x1 - 130; x += 9) L(g, x, y + 1, x + 6, y + lh - 1, { stroke: on ? ACC : GRAY, w: 1 });
        if (Lr.k === "outer" || Lr.k === "inner") for (let i = 1; i < 3; i++) L(g, x0, y + (lh * i) / 3, x1, y + (lh * i) / 3, { stroke: DIM, w: 1 });
        if (Lr.k === "core") for (let x = x0 + 10; x < x1 - 140; x += 22) P(g, `M${x} ${y + 2} L${x + 6} ${y + lh / 2} L${x} ${y + lh - 2} M${x + 6} ${y + lh / 2} L${x + 16} ${y + lh / 2}`, { stroke: on ? ACC : GRAY, w: 1 });
        T(g, x1 - 6, y + lh / 2 + 4, Lr.n, { anchor: "end", size: 11, fill: on ? INK : GRAY });
        hit(g, r, Lr.n, () => { layer = Lr.k; tap = null; refresh(); });
        Lr.y = y; Lr.h = lh; y += lh; });
      if (tap) { const sy = top + 6, o = LAYERS[2];
        if (tap === "bad") { P(g, `M${spot - 40} ${o.y + o.h * 0.5} Q${spot} ${o.y + o.h * 0.5 - 14} ${spot + 40} ${o.y + o.h * 0.5}`, { stroke: "#E5484D", w: 2, fill: "rgba(229,72,77,.18)" }); T(g, spot, o.y + o.h + 16, "gap between plies", { anchor: "middle", size: 11, fill: "#F2B8BA" }); }
        const n = tap === "good" ? 3 : 1; for (let i = 0; i < n; i++) C(g, spot, sy - 2, 10 + i * 9, { stroke: tap === "good" ? ACC : GRAY, sw: tap === "good" ? 2 : 4, op: tap === "good" ? 1 - i * 0.25 : 0.5, dash: tap === "good" ? null : "2 5" });
        P(g, `M${spot} ${sy - 30} L${spot} ${sy - 8}`, { stroke: INK, w: 3 }); }
      return; }
    if (mode === "wing") { const wy = top + avail * 0.12, wh = avail * 0.62, tip = x1 - 4, root = x0 + 4, cy = (y) => wy + y * wh;
      const hl = (k) => (wp === k ? { stroke: ACC, w: 2.4 } : { stroke: k === "skin" ? INK : GRAY, w: k === "spar" ? 2 : 1.2 });
      P(g, `M${root} ${cy(0)} L${tip} ${cy(0.12)} L${tip} ${cy(0.88)} L${root} ${cy(1)} Z`, { ...hl("skin"), fill: wp === "skin" ? ACCF : "none" });
      for (let i = 1; i < 7; i++) { const x = root + ((tip - root) * i) / 7, f = (x - root) / (tip - root); L(g, x, cy(0.12 * f) + 2, x, cy(1 - 0.12 * f) - 2, hl("rib")); }
      [0.4, 0.55, 0.85].forEach((t) => L(g, root, cy(t * 0.98 + 0.01), tip, cy(0.12 + t * 0.76), hl("str")));
      [0.25, 0.7].forEach((t) => L(g, root, cy(t), tip, cy(0.12 + t * 0.76), hl("spar")));
      T(g, root, cy(1) + 22, "root (fuselage)", { size: 11, fill: GRAY }); T(g, tip, cy(1) + 22, "tip", { size: 11, fill: GRAY, anchor: "end" }); T(g, root, wy - 8, "leading edge ↑", { size: 11, fill: GRAY }); return; }
    // wing layout, front view
    const cx = W / 2, fy = top + avail * 0.5, fr = Math.min(avail * 0.16, 34), span = Math.min((x1 - x0) * 0.48, 200);
    C(g, cx, fy, fr, { stroke: INK, sw: 1.6, fill: "#141416" }); C(g, cx, fy + fr + 34, 7, { stroke: GRAY, sw: 1.5 }); L(g, cx, fy + fr, cx, fy + fr + 27, { stroke: GRAY, w: 1.5 });
    const wing = (y, braced) => { L(g, cx - span, y, cx + span, y, { stroke: ACC, w: 4 }); if (braced) [-1, 1].forEach((s) => L(g, cx + s * fr * 0.8, fy + fr * 0.55, cx + s * span * 0.5, y, { stroke: INK, w: 2 })); };
    if (lay === "high") wing(fy - fr, true); else if (lay === "low") wing(fy + fr * 0.85, false); else if (lay === "mid") wing(fy, false);
    else { wing(fy - fr - 30, false); wing(fy + fr * 0.85, false); [-1, 1].forEach((s) => [0.45, 0.85].forEach((k) => L(g, cx + s * span * k, fy - fr - 30, cx + s * span * k, fy + fr * 0.85, { stroke: INK, w: 1.6 }))); }
    T(g, cx, H - 10, "front view", { anchor: "middle", size: 11, fill: GRAY });
  }
  ui();
  return { destroy() { F.destroy(); } };
}
