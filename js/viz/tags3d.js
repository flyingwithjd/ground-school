// Leader-line labels for planeStage visuals: each tag sits at a screen offset from its 3D anchor, joined by a thin leader
// line with a dot on the anchor. Tags are kept inside the stage and pushed apart so they never overlap each other or the
// caption band. Used by gear3d and forces3d.
import { h, s } from "../core/util.js?v=6dadda2251";
export function tags3d(stage) {
  const svg = s("svg", { class: "t3-lines", "aria-hidden": "true" }); stage.append(svg);
  const list = [];
  function add(text, { cls = "", dx = 40, dy = -40 } = {}) { const el = h("div", { class: "t3-tag " + cls }, text); stage.append(el);
    const ln = s("line", { class: cls }, svg), dot = s("circle", { r: 3, class: cls }, svg); const t = { el, ln, dot, dx, dy, on: true }; list.push(t); return t; }
  // anchors: [{ t, q:{x,y,z} }]; top: px kept clear at the top (corner labels)
  function place(items, top = 30) { const W = stage.clientWidth, H = stage.clientHeight; const boxes = [];
    for (const { t, q } of items) { const vis = t.on && q && q.z < 1; t.el.style.opacity = vis ? 1 : 0; t.ln.style.opacity = t.dot.style.opacity = vis ? 1 : 0; if (!vis) continue;
      const w = t.el.offsetWidth, hh = t.el.offsetHeight; let x = q.x + t.dx - (t.dx < 0 ? w : 0), y = q.y + t.dy - (t.dy < 0 ? hh : 0);
      x = Math.max(6, Math.min(W - w - 6, x)); y = Math.max(top, Math.min(H - hh - 6, y));
      for (let k = 0; k < 6; k++) { const hit = boxes.find((b) => x < b.x + b.w + 6 && b.x < x + w + 6 && y < b.y + b.h + 4 && b.y < y + hh + 4); if (!hit) break; y = t.dy < 0 ? hit.y - hh - 6 : hit.y + hit.h + 6; y = Math.max(top, Math.min(H - hh - 6, y)); }
      boxes.push({ x, y, w, h: hh }); t.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      const ex = Math.max(x, Math.min(x + w, q.x)), ey = q.y < y ? y : q.y > y + hh ? y + hh : y + hh / 2;
      t.ln.setAttribute("x1", q.x.toFixed(1)); t.ln.setAttribute("y1", q.y.toFixed(1)); t.ln.setAttribute("x2", ex.toFixed(1)); t.ln.setAttribute("y2", ey.toFixed(1));
      t.dot.setAttribute("cx", q.x.toFixed(1)); t.dot.setAttribute("cy", q.y.toFixed(1)); } }
  return { add, place };
}
