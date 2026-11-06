// Shared low-detail wireframe silhouettes (generic high-wing trainer, not traced from any drawing).
import { s } from "../core/util.js?v=c64a1f77b5";
import { FAINT2 } from "./base.js?v=c64a1f77b5";
// Side view, nose left. Origin near the CG; length ~600 units.
export function sidePlane(parent, { stroke = FAINT2, w = 2, prop = true } = {}) {
  const g = s("g", { fill: "none", stroke, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, parent);
  const P = (d) => s("path", { d, "data-ink": stroke }, g);
  P("M-300,8 L-282,-14 L-205,-24 L-150,-30 L-92,-60 L40,-60 L250,-18 L300,-20 L300,0 L250,8 L-80,34 L-205,34 L-284,26 Z");
  P("M-112,-60 Q-104,-74 -64,-75 L52,-67 L52,-60");
  P("M-150,-30 L-92,-30 L-92,-60"); P("M-80,-30 L20,-30 L20,-58");
  P("M250,-18 L282,-112 L318,-112 L312,-20"); P("M246,-12 L332,-12");
  P("M-46,-60 L-6,30"); P("M-18,34 L-36,78"); s("circle", { cx: -38, cy: 84, r: 12, "data-ink": stroke }, g);
  P("M-232,34 L-232,74"); s("circle", { cx: -232, cy: 82, r: 10, "data-ink": stroke }, g);
  if (prop) P("M-303,-62 L-303,78");
  return g;
}
// Rear view (looking forward from behind). Origin at fuselage center; span ~ 900.
export function rearPlane(parent, { stroke = FAINT2, w = 2 } = {}) {
  const g = s("g", { fill: "none", stroke, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, parent);
  const P = (d) => s("path", { d, "data-ink": stroke }, g);
  P("M-450,-62 L450,-62 L450,-52 L-450,-52 Z"); P("M-40,-60 L40,-60 L46,30 L-46,30 Z");
  P("M-140,-10 L140,-10"); P("M0,-62 L0,-150"); P("M-150,-54 L-40,24 M150,-54 L40,24");
  P("M-40,30 L-90,80 M40,30 L90,80"); s("circle", { cx: -94, cy: 88, r: 11 }, g); s("circle", { cx: 94, cy: 88, r: 11 }, g);
  return g;
}
// Top view, nose up. Origin at the wing quarter chord; length ~600.
export function topPlane(parent, { stroke = FAINT2, w = 2 } = {}) {
  const g = s("g", { fill: "none", stroke, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, parent);
  const P = (d) => s("path", { d, "data-ink": stroke }, g);
  P("M0,-300 L22,-284 L38,-200 L38,-60 L16,250 L-16,250 L-38,-60 L-38,-200 L-22,-284 Z");
  P("M-450,-80 L450,-80 L450,-6 L-450,-6 Z"); P("M-140,210 L140,210 L140,262 L-140,262 Z"); P("M0,200 L0,300");
  P("M-80,-304 L80,-304");
  return g;
}
// Text helper
export function T(parent, x, y, str, { anchor = "start", size = 18, op = 0.6, fill = "#F2F1EC", sans = false, weight, upper = true } = {}) {
  const t = s("text", { x, y, "text-anchor": anchor, fill, opacity: op, "font-size": size, "font-family": sans ? "Inter" : "IBM Plex Mono", "letter-spacing": sans ? 0 : size * 0.14, ...(weight ? { "font-weight": weight } : {}) }, parent);
  t.textContent = sans || !upper ? str : String(str).toUpperCase(); return t;
}
// Arrow (line with marker). accent=true uses accent + glow.
export function arrow(parent, x1, y1, x2, y2, { accent = false, w = 4 } = {}) {
  return s("line", { x1, y1, x2, y2, stroke: accent ? "#3B82F6" : "rgba(242,241,236,.55)", "stroke-width": w, "stroke-linecap": "round", "marker-end": accent ? "url(#ah)" : "url(#ahw)", ...(accent ? { filter: "url(#gw)" } : {}) }, parent);
}
export function setArrow(a, x1, y1, x2, y2) { a.setAttribute("x1", x1); a.setAttribute("y1", y1); a.setAttribute("x2", x2); a.setAttribute("y2", y2); }
export function accentize(a, on) { a.setAttribute("stroke", on ? "#3B82F6" : "rgba(242,241,236,.55)"); a.setAttribute("marker-end", on ? "url(#ah)" : "url(#ahw)"); on ? a.setAttribute("filter", "url(#gw)") : a.removeAttribute("filter"); }
