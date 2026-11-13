// Wind drawn as drifting points of light. Top view, north up. Pauses off screen; static streaks under reduced motion.
import { loop } from "./base.js?v=771fe5f0ea";
import { s, reduced } from "../core/util.js?v=771fe5f0ea";
export function windField(F, parent, { x = 0, y = 0, w = 1600, h = 900, n = 60, from = 270, kt = 10, op = 0.55 } = {}) {
  const g = s("g", { opacity: op }, parent); let rnd = 7; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const P = Array.from({ length: n }, () => ({ x: x + R() * w, y: y + R() * h, ph: R(), el: s("line", { stroke: "#3B82F6", "stroke-width": 2.2, "stroke-linecap": "round" }, g) }));
  let vx = 0, vy = 0, k = kt;
  function set(f, speed) { from = f; k = speed; const to = ((f + 180) * Math.PI) / 180; vx = Math.sin(to); vy = -Math.cos(to); g.style.display = speed > 0 ? "" : "none"; draw(0); }
  function draw(dt) { const sp = k * 0.06 * dt, tail = 8 + k * 1.6;
    for (const p of P) { p.x += vx * sp; p.y += vy * sp;
      if (p.x < x) p.x += w; if (p.x > x + w) p.x -= w; if (p.y < y) p.y += h; if (p.y > y + h) p.y -= h;
      p.el.setAttribute("x1", p.x); p.el.setAttribute("y1", p.y); p.el.setAttribute("x2", p.x - vx * tail); p.el.setAttribute("y2", p.y - vy * tail); p.el.setAttribute("opacity", 0.25 + 0.75 * p.ph); } }
  const L = loop(F, (now, dt) => draw(dt)); set(from, kt); L.start();
  return { set, g };
}
