// CG and longitudinal stability (qualitative, PHAK 5). Slide the CG; tap Gust to see the response.
import { frame, slider, readout, svg, loop, ACC, FAINT, FAINT2 } from "./base.js?v=f413a64fe0";
import { s, h, reduced } from "../core/util.js?v=f413a64fe0";
import { sidePlane, T, arrow, setArrow } from "./shapes.js?v=f413a64fe0";
const COL = 10; // center of lift x (illustrative)
export function mount(host) {
  const F = frame(host, { corners: { tl: "CG and stability · qualitative", tr: "PHAK 5" } });
  const el = svg(F.stage, "-800 -450 1600 900"); const g = s("g", {}, el);
  const body = s("g", {}, g); sidePlane(body, { w: 2 });
  const lift = arrow(body, COL, -80, COL, -300, { w: 4 }); T(body, COL + 14, -290, "lift", { size: 16, op: 0.6 }); s("circle", { cx: COL, cy: -70, r: 6, fill: "none", stroke: "#F2F1EC", "stroke-width": 2 }, body);
  const wt = arrow(body, 0, 0, 0, 220, { accent: true, w: 5 }); const cgDot = s("circle", { r: 9, fill: ACC, filter: "url(#gw)" }, body); const cgT = T(body, 0, 250, "CG · weight", { size: 16, op: 0.9, fill: ACC });
  const tail = arrow(body, 300, -10, 300, 120, { w: 4 }); const tailT = T(body, 320, 80, "tail-down force", { size: 15, op: 0.6 });
  s("line", { x1: -780, y1: 330, x2: 780, y2: 330, stroke: FAINT, "stroke-width": 1 }, g);
  const set = readout(F.ctrl, [["s", "stall speed"], ["c", "cruise"], ["st", "stability"], ["e", "elevator force"]]);
  let cg = 0.4, pitch = 0, t0 = null;
  const cgx = () => -110 + cg * 110; // -110 forward limit, 0 aft limit, beyond >0
  function upd(v) { cg = v; const x = cgx(); setArrow(wt, x, 0, x, 220); cgDot.setAttribute("cx", x); cgT.setAttribute("x", x - 50);
    const tf = Math.max(0, COL - x) * 1.1 + 12; setArrow(tail, 300, -6, 300, -6 + tf); tailT.setAttribute("y", Math.min(-6 + tf, 120));
    const beyond = cg > 1.02, fwd = cg < 0.35, aft = cg > 0.7;
    set("s", fwd ? "higher" : aft ? "lower" : "nominal"); set("c", fwd ? "slower" : aft ? "faster" : "nominal"); set("st", beyond ? "unstable" : fwd ? "strong" : aft ? "reduced" : "positive"); set("e", fwd ? "heavier" : aft ? "lighter" : "normal");
    F.caption(beyond ? "Aft of the aft limit" : fwd ? "Forward CG" : aft ? "Aft CG, within limits" : "Mid-range CG", beyond ? "Possibly uncontrollable" : fwd ? "Stable but heavy" : aft ? "Faster, less stable" : "Balanced");
    F.explain(beyond ? "The tail can no longer restore the nose. Stall and spin recovery may become impossible. Never fly outside the CG envelope. <span class=\"src\">PHAK 5, 10</span>"
      : fwd ? "The CG is far ahead of the center of lift, so the tail must push down hard. The wing carries that extra load: higher stall speed, more drag, heavier elevator, and you may run out of up-elevator in the flare."
      : aft ? "Less tail-down force means less drag and a slightly lower stall speed, but the airplane is less stable and pitch forces are light. Stall recovery is harder."
      : "The tail's downward force balances the nose-down moment from the CG sitting ahead of the center of lift. Tap <strong>Gust</strong> to disturb the pitch."); }
  slider(F.ctrl, { label: "CG position · forward → aft", min: 0, max: 1.15, step: 0.01, value: 0.4, fmt: (v) => (v > 1.02 ? "beyond aft" : v < 0.05 ? "fwd limit" : v > 0.97 ? "aft limit" : `${Math.round(v * 100)}%`), oninput: upd });
  const gust = h("button", { class: "chip", type: "button" }, "Gust"); F.ctrl.append(gust);
  const L = loop(F, (now) => { if (t0 == null) return false; const t = (now - t0) / 1000, beyond = cg > 1.02;
    const z = 0.55 - 0.45 * Math.min(cg, 1), w = 3.2 - 1.2 * Math.min(cg, 1);
    pitch = beyond ? Math.min(22, 6 * Math.exp(0.7 * t)) : 8 * Math.exp(-z * w * t) * Math.cos(w * t);
    body.setAttribute("transform", `rotate(${-pitch} ${cgx()} 0)`);
    if (beyond ? t > 3.5 : t > 9 || (t > 1 && Math.abs(pitch) < 0.05)) { t0 = null; if (!beyond) body.setAttribute("transform", ""); return false; } }, { always: true });
  gust.addEventListener("click", () => { if (reduced()) { F.explain(cg > 1.02 ? "After a gust, the nose keeps rising: there is no restoring tendency." : cg < 0.35 ? "After a gust, the nose returns quickly with little overshoot." : "After a gust, the nose returns with a few gentle oscillations that die out: positive dynamic stability."); return; } t0 = performance.now(); L.start(); });
  upd(0.4);
  return { destroy() { F.destroy(); } };
}
