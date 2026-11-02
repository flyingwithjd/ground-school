// Kit for the newer visuals: SVG drawn in real screen pixels, so every label is a true 11–14 px on any device,
// plus small HTML building blocks (step lists, decision cards). Each scene redraws itself when the stage resizes.
import { frame, ACC, INK, FAINT, FAINT2 } from "./base.js?v=b44a743634";
import { s, h } from "../core/util.js?v=b44a743634";
export { ACC, INK, FAINT, FAINT2 };
export const GRAY = "rgba(242,241,236,.55)", DIM = "rgba(242,241,236,.3)", ACCF = "rgba(59,130,246,.16)", ACCM = "rgba(59,130,246,.45)";
export const MONO = "IBM Plex Mono, ui-monospace, Menlo, monospace", SANS = "Inter, system-ui, sans-serif";

// Frame + full-stage SVG in pixel units. draw(g, W, H) is called on every meaningful resize and on redraw().
export function pxScene(host, { corners = {}, cls = "", explain = "", caption = null } = {}, draw) {
  const F = frame(host, { cls: "capin px " + cls, corners, explain, caption });
  const el = s("svg", { class: "full", role: "img" }); F.stage.prepend(el);
  const defs = s("defs", {}, el);
  defs.innerHTML = `<marker id="kah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/></marker>
  <marker id="kahw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>
  <marker id="kahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${GRAY}"/></marker>`;
  let g = s("g", {}, el), W = 0, H = 0;
  const api = { F, el, get W() { return W; }, get H() { return H; },
    redraw() { W = F.stage.clientWidth || 640; H = F.stage.clientHeight || 400; el.setAttribute("viewBox", `0 0 ${W} ${H}`); g.remove(); g = s("g", {}, el);
      // content starts below the HTML corner labels, which can wrap to two lines on a phone
      const top = Math.max(30, ...[...F.stage.querySelectorAll(".corner.tl, .corner.tr")].map((c) => c.offsetTop + c.offsetHeight)) + 12;
      draw(g, W, H, top); },
    get phone() { return W < 520; } };
  let lw = 0, lh = 0; const ro = new ResizeObserver(() => { const w = F.stage.clientWidth, hh = F.stage.clientHeight; if (Math.abs(w - lw) > 4 || Math.abs(hh - lh) > 4) { lw = w; lh = hh; api.redraw(); } });
  ro.observe(F.stage); F.on(() => ro.disconnect());
  queueMicrotask(() => api.redraw());
  return api;
}
// Text in screen px. size >= 11 always.
export function T(g, x, y, str, { size = 12, anchor = "start", fill = INK, weight = 500, mono = true, ls, base = "auto", op } = {}) {
  const e = s("text", { x: r1(x), y: r1(y), "text-anchor": anchor, "font-family": mono ? MONO : SANS, "font-size": Math.max(11, size), "font-weight": weight, fill, "dominant-baseline": base }, g);
  if (mono) e.setAttribute("letter-spacing", ls ?? (size <= 12 ? 0.6 : 0.3)); if (op != null) e.setAttribute("opacity", op);
  e.textContent = str; return e;
}
// Multi-line text, returns height used.
export function TL(g, x, y, lines, o = {}) { const size = Math.max(11, o.size || 12), lh = o.lh || size * 1.3; lines.forEach((t, i) => T(g, x, y + i * lh, t, { ...o, fill: i ? (o.sub || GRAY) : (o.fill || INK), size })); return lines.length * lh; }
export const tw = (str, size = 12, mono = true) => String(str).length * size * (mono ? 0.62 : 0.55);
export const r1 = (n) => Math.round(n * 10) / 10;
export const L = (g, x1, y1, x2, y2, { stroke = GRAY, w = 1.5, dash, arrow, op } = {}) => { const e = s("line", { x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), stroke, "stroke-width": w, "stroke-linecap": "round" }, g); if (dash) e.setAttribute("stroke-dasharray", dash); if (arrow) e.setAttribute("marker-end", `url(#${arrow === true ? "kah" : arrow})`); if (op != null) e.setAttribute("opacity", op); return e; };
export const P = (g, d, { stroke = GRAY, w = 1.5, fill = "none", dash, arrow, op } = {}) => { const e = s("path", { d, stroke, "stroke-width": w, fill, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); if (dash) e.setAttribute("stroke-dasharray", dash); if (arrow) e.setAttribute("marker-end", `url(#${arrow === true ? "kah" : arrow})`); if (op != null) e.setAttribute("opacity", op); return e; };
export const R = (g, x, y, w, hh, { stroke = "none", sw = 1.5, fill = "none", rx = 0, dash, op } = {}) => { const e = s("rect", { x: r1(x), y: r1(y), width: r1(Math.max(0, w)), height: r1(Math.max(0, hh)), rx, fill, stroke, "stroke-width": sw }, g); if (dash) e.setAttribute("stroke-dasharray", dash); if (op != null) e.setAttribute("opacity", op); return e; };
export const C = (g, cx, cy, r, { stroke = "none", sw = 1.5, fill = "none", dash, op } = {}) => { const e = s("circle", { cx: r1(cx), cy: r1(cy), r: r1(Math.max(0, r)), fill, stroke, "stroke-width": sw }, g); if (dash) e.setAttribute("stroke-dasharray", dash); if (op != null) e.setAttribute("opacity", op); return e; };
// Tappable SVG hit area with keyboard support.
export function hit(g, el, label, fn) { el.setAttribute("tabindex", "0"); el.setAttribute("role", "button"); el.setAttribute("aria-label", label); el.style.cursor = "pointer";
  el.addEventListener("click", fn); el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); return el; }
// Simple top-down airplane silhouette centered at 0,0 pointing up, ~sz px span.
export function planeTop(g, x, y, rot, sz = 28, { stroke = INK, fill = "none", w = 1.6 } = {}) {
  const k = sz / 28, gg = s("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${r1(k * 100) / 100})` }, g);
  P(gg, "M0,-13 L1.6,-9 L1.6,-3 L14,0 L14,2.4 L1.6,1.6 L1.2,8 L5,10 L5,12 L0,11.2 L-5,12 L-5,10 L-1.2,8 L-1.6,1.6 L-14,2.4 L-14,0 L-1.6,-3 L-1.6,-9 Z", { stroke, fill, w: w / k });
  return gg;
}
// ---------- HTML helpers ----------
export function htmlScene(host, { corners = {}, cls = "", explain = "", caption = null } = {}) {
  const F = frame(host, { cls: "capin hv " + cls, corners, explain, caption }); const body = h("div", { class: "hv-body" }); F.stage.append(body); return { F, body };
}
export const wrap = (a, b) => ((a % b) + b) % b;
export const fmtTime = (m) => { m = wrap(Math.round(m), 1440); return String(Math.floor(m / 60)).padStart(2, "0") + String(m % 60).padStart(2, "0"); };
