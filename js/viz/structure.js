// Fuselage construction: truss vs monocoque vs semimonocoque, cross-section and side view drawn on by light.
import { frame, chips, svg, drawOn, ACC, FAINT, FAINT2 } from "./base.js?v=d0b3a92d56";
import { s } from "../core/util.js?v=d0b3a92d56";
const TYPES = {
  truss: { label: "Welded tube frame", big: "Truss", text: "Longerons run lengthwise; vertical and diagonal struts brace them into triangles. Fabric or skin over formers gives the shape but carries little load." },
  mono: { label: "Skin carries the load", big: "Monocoque", text: "A stressed shell with bulkheads only to hold its shape. Very strong, but a dent or wrinkle weakens it." },
  semi: { label: "Skin plus substructure", big: "Semimonocoque", text: "Bulkheads, formers and stringers reinforce the stressed skin, so loads have more than one path. Used on the 172 and most modern airplanes." },
};
export function mount(host) {
  const F = frame(host, { corners: { tl: "Fuselage construction", tr: "PHAK 3" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  // side view outline of a fuselage tube (generic)
  const top = (x) => 300 - 120 * Math.sin(Math.PI * Math.min(1, (x - 200) / 1000)) ** 0.6, bot = (x) => 600 + 60 * Math.sin(Math.PI * Math.min(1, (x - 200) / 1000)) ** 0.6;
  const X0 = 200, X1 = 1400; const tx = (x) => 300 + (x <= 1200 ? (x - 200) * 0 : 0);
  const outline = (yfn) => { let d = ""; for (let x = X0; x <= X1; x += 20) d += (x === X0 ? "M" : "L") + x + "," + yfn(x).toFixed(1); return d; };
  const T = (x) => 250 + (x - X0) / (X1 - X0) * 110, B = (x) => 540 - (x - X0) / (X1 - X0) * 140;
  function draw(type) { g.innerHTML = ""; const acc = [], ink = [];
    const P = (d, hl, w = 2) => { const p = s("path", { d, fill: "none", stroke: hl ? ACC : FAINT2, "stroke-width": hl ? w + 0.6 : w, "stroke-linecap": "round", filter: hl ? "url(#gw)" : "" }, g); (hl ? acc : ink).push(p); return p; };
    const n = 7; const xs = Array.from({ length: n }, (_, i) => X0 + (i * (X1 - X0)) / (n - 1));
    if (type === "truss") { P(outline(T), true, 3); P(outline(B), true, 3); xs.forEach((x) => P(`M${x},${T(x)} L${x},${B(x)}`, true, 2)); xs.slice(0, -1).forEach((x, i) => P(i % 2 ? `M${x},${T(x)} L${xs[i + 1]},${B(xs[i + 1])}` : `M${x},${B(x)} L${xs[i + 1]},${T(xs[i + 1])}`, true, 2)); }
    else if (type === "mono") { P(outline(T) + " " + outline(B).replace("M", "M"), false, 1.2); P(outline(T), true, 4); P(outline(B), true, 4); xs.filter((_, i) => i % 3 === 0).forEach((x) => P(`M${x},${T(x)} L${x},${B(x)}`, false, 1.5)); }
    else { P(outline(T), true, 3); P(outline(B), true, 3); xs.forEach((x) => P(`M${x},${T(x)} L${x},${B(x)}`, true, 2)); [0.25, 0.5, 0.75].forEach((f) => P(outline((x) => T(x) + (B(x) - T(x)) * f), true, 1.4)); }
    // cross-section inset
    const cx = 1430, cy = 170, r = 90; const ring = s("circle", { cx, cy, r, fill: "none", stroke: type === "truss" ? FAINT : ACC, "stroke-width": type === "mono" ? 5 : 3, filter: type === "truss" ? "" : "url(#gw)" }, g); (type === "truss" ? ink : acc).push(ring);
    if (type === "truss") { const sq = s("rect", { x: cx - 60, y: cy - 60, width: 120, height: 120, fill: "none", stroke: ACC, "stroke-width": 3, filter: "url(#gw)" }, g); acc.push(sq); [[cx - 60, cy - 60], [cx + 60, cy - 60], [cx - 60, cy + 60], [cx + 60, cy + 60]].forEach(([x, y]) => s("circle", { cx: x, cy: y, r: 7, fill: ACC }, g)); }
    if (type === "semi") for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; s("rect", { x: cx + Math.cos(a) * (r - 10) - 5, y: cy + Math.sin(a) * (r - 10) - 5, width: 10, height: 10, fill: ACC, transform: `rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * (r - 10)} ${cy + Math.sin(a) * (r - 10)})` }, g); }
    const lab = s("text", { x: cx, y: cy + r + 40, "text-anchor": "middle", fill: "rgba(242,241,236,.5)", "font-size": 20, "letter-spacing": "3" }, g); lab.textContent = "CROSS-SECTION";
    acc.forEach((p, i) => drawOn(p, { dur: 1400, delay: i * 70, light: i < 4 }));
    F.caption(TYPES[type].label, TYPES[type].big); F.explain(TYPES[type].text); }
  chips(F.ctrl, [["truss", "Truss"], ["mono", "Monocoque"], ["semi", "Semimonocoque"]], "truss", draw, { label: "Construction" });
  draw("truss");
  return { destroy() { F.destroy(); } };
}
