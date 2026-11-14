// Leader-line labels for planeStage visuals: each tag sits at a screen offset from its 3D anchor, joined by a thin leader
// line with a dot on the anchor. Tags are kept inside the stage and pushed apart so they never overlap each other or the
// caption band. Used by gear3d and forces3d.
import { h, s } from "../core/util.js?v=714b944f7b";
export function tags3d(stage) {
  const svg = s("svg", { class: "t3-lines", "aria-hidden": "true" }); stage.append(svg);
  const list = [];
  function add(text, { cls = "", dx = 40, dy = -40, extras = 0, extraCls = [] } = {}) { const el = h("div", { class: "t3-tag " + cls }, text); stage.append(el);
    const ln = s("line", { class: cls }, svg), dot = s("circle", { r: 3, class: cls }, svg);
    const extra = []; for (let i = 0; i < extras; i++) extra.push({ ln: s("line", { class: extraCls[i] || cls }, svg), dot: s("circle", { r: 3, class: extraCls[i] || cls }, svg) });
    const t = { el, ln, dot, dx, dy, on: true, extra }; list.push(t); return t; }
  // anchors: [{ t, q:{x,y,z}, qs?: extra anchors }]; top: px kept clear at the top (corner labels)
  function place(items, top = 30) { const W = stage.clientWidth, H = stage.clientHeight; const boxes = [];
    const lead = (ln, dot, q, x, y, w, hh, vis) => { const on = vis && q && q.z < 1; ln.style.opacity = dot.style.opacity = on ? 1 : 0; if (!on) return;
      const ex = Math.max(x, Math.min(x + w, q.x)), ey = q.y < y ? y : q.y > y + hh ? y + hh : y + hh / 2;
      ln.setAttribute("x1", q.x.toFixed(1)); ln.setAttribute("y1", q.y.toFixed(1)); ln.setAttribute("x2", ex.toFixed(1)); ln.setAttribute("y2", ey.toFixed(1));
      dot.setAttribute("cx", q.x.toFixed(1)); dot.setAttribute("cy", q.y.toFixed(1)); };
    for (const { t, q, qs } of items) { const vis = t.on && q && q.z < 1; t.el.style.opacity = vis ? 1 : 0; if (!vis) { t.ln.style.opacity = t.dot.style.opacity = 0; (t.extra || []).forEach((e) => { e.ln.style.opacity = e.dot.style.opacity = 0; }); continue; }
      const w = t.el.offsetWidth, hh = t.el.offsetHeight; let x = q.x + t.dx - (t.dx < 0 ? w : 0), y = q.y + t.dy - (t.dy < 0 ? hh : 0);
      x = Math.max(6, Math.min(W - w - 6, x)); y = Math.max(top, Math.min(H - hh - 6, y));
      for (let k = 0; k < 8; k++) { const hit = boxes.find((b) => x < b.x + b.w + 6 && b.x < x + w + 6 && y < b.y + b.h + 4 && b.y < y + hh + 4); if (!hit) break; y = t.dy < 0 ? hit.y - hh - 6 : hit.y + hit.h + 6; y = Math.max(top, Math.min(H - hh - 6, y)); }
      boxes.push({ x, y, w, h: hh }); t.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      lead(t.ln, t.dot, q, x, y, w, hh, true);
      (t.extra || []).forEach((e, i) => lead(e.ln, e.dot, (qs || [])[i], x, y, w, hh, true)); } }
  return { add, place };
}
