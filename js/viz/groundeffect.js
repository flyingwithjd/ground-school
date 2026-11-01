// Ground effect: wing height vs induced drag. Reductions are PHAK Ch 5's figures at 1, 1/4 and 1/10 span.
import { frame, chips, readout, svg, loop, ACC, FAINT, FAINT2 } from "./base.js?v=715aa408ea";
import { s } from "../core/util.js?v=715aa408ea";
import { rearPlane, T } from "./shapes.js?v=715aa408ea";
const SC = 0.42, SPAN = 900 * SC, GY = 210;
const H = { out: { f: 1.15, r: "≈ 0%", cap: ["Out of ground effect", "Full-strength vortices"], t: "Well above the runway the wingtip vortices and downwash form freely. Induced drag is normal." },
  one: { f: 1, r: "1.4%", cap: ["Height = one wingspan", "Barely noticeable"], t: "At a height equal to its span, the wing's induced drag is only 1.4% lower. <span class=\"src\">PHAK 5</span>" },
  qtr: { f: 0.25, r: "23.5%", cap: ["Height = ¼ wingspan", "Induced drag −23.5%"], t: "The ground squeezes the downwash and the vortices. Induced drag falls by about a quarter: the airplane floats if you arrive fast. <span class=\"src\">PHAK 5</span>" },
  tenth: { f: 0.1, r: "47.6%", cap: ["Height = ⅒ wingspan", "Induced drag −47.6%"], t: "Just above the runway, induced drag is nearly halved. The airplane can fly here below the speed it needs to climb away, and the static source may read slightly low. <span class=\"src\">PHAK 5</span>" } };
export function mount(host) {
  const F = frame(host, { corners: { tl: "Ground effect · view from behind", tr: "PHAK 5" } });
  const el = svg(F.stage, "-800 -450 1600 900"); const g = s("g", {}, el);
  s("line", { x1: -780, y1: GY, x2: 780, y2: GY, stroke: "#F2F1EC", "stroke-width": 2, opacity: 0.5 }, g); T(g, 780, GY + 32, "runway", { anchor: "end", size: 14, op: 0.45 });
  const pg = s("g", {}, g); rearPlane(pg, { w: 2 / SC });
  const span = s("g", {}, g); const sl = s("line", { stroke: FAINT2, "stroke-width": 1.5, "stroke-dasharray": "5 7" }, span); const hl = s("line", { stroke: ACC, "stroke-width": 2.5, filter: "url(#gw)" }, span); const hT = T(span, 0, 0, "", { size: 15, op: 0.9, fill: ACC });
  const vort = s("g", {}, g); const P = []; for (const side of [-1, 1]) for (let i = 0; i < 18; i++) P.push({ side, a: (i / 18) * Math.PI * 2, rr: 0.3 + (i % 6) / 7, c: s("circle", { r: 3, fill: "#F2F1EC", opacity: 0.7 }, vort) });
  const dw = s("g", {}, g);
  const set = readout(F.ctrl, [["h", "height"], ["r", "induced drag reduction"]]);
  let k = "out", y = 0, R = 60;
  function upd(key) { k = key; const c = H[key], wingY = GY - c.f * SPAN; y = wingY;
    pg.setAttribute("transform", `translate(0 ${wingY + 57 * SC}) scale(${SC})`);
    const x = SPAN / 2 + 70; sl.setAttribute("x1", -SPAN / 2); sl.setAttribute("x2", SPAN / 2); sl.setAttribute("y1", wingY - 40); sl.setAttribute("y2", wingY - 40);
    hl.style.display = key === "out" ? "none" : ""; hl.setAttribute("x1", x); hl.setAttribute("x2", x); hl.setAttribute("y1", wingY); hl.setAttribute("y2", GY); hT.setAttribute("x", x + 14); hT.setAttribute("y", (wingY + GY) / 2 + 5); hT.textContent = key === "out" ? "" : key === "one" ? "1 span" : key === "qtr" ? "¼ span" : "⅒ span";
    R = Math.min(70, Math.max(10, (GY - wingY) * 0.42)); dw.innerHTML = ""; const len = Math.min(120, (GY - wingY) * 0.6);
    for (let i = -2; i <= 2; i++) s("line", { x1: i * 60, y1: wingY + 30, x2: i * 60, y2: wingY + 30 + len * 0.75, stroke: "rgba(242,241,236,.45)", "stroke-width": 2.5, "marker-end": "url(#ahw)" }, dw);
    set("h", key === "out" ? "> 1 span" : hT.textContent); set("r", c.r); F.caption(c.cap[0], c.cap[1]); F.explain(c.t); draw(0); }
  function draw(dt) { for (const p of P) { p.a += dt * 0.004 * p.side; const cx = p.side * (SPAN / 2), cy = y - 6; const r = R * p.rr;
    p.c.setAttribute("cx", (cx + Math.cos(p.a) * r * 1.1).toFixed(1)); p.c.setAttribute("cy", Math.min(GY - 4, cy + Math.sin(p.a) * r * (k === "tenth" ? 0.55 : 1)).toFixed(1)); } }
  chips(F.ctrl, [["out", "Out of ground effect"], ["one", "1 span"], ["qtr", "¼ span"], ["tenth", "⅒ span"]], "out", upd, { label: "Wing height" });
  upd("out"); loop(F, (now, dt) => draw(dt));
  return { destroy() { F.destroy(); } };
}
