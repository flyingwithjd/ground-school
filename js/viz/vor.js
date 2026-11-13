// VOR and CDI (PHAK 16, AIM 1-1-3): tap where the airplane is and turn the OBS. The needle and TO/FROM depend on position, not heading.
import { slider } from "./base.js?v=681adac966";
import { pxScene, T, L, C, R, P, planeTop, ACC, INK, GRAY, DIM, ACCF, wrap } from "./kit.js?v=681adac966";
const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
export function mount(host) {
  let obs = 360, pos = { r: 30, d: 0.7 }; // airplane on the 030 radial, 70% of the plot radius
  const S = pxScene(host, { cls: "tall", corners: { tl: "VOR · tap to move the airplane", tr: "PHAK 16" } }, draw);
  slider(S.F.ctrl, { label: "OBS course", min: 5, max: 360, step: 5, value: obs, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { obs = v; S.redraw(); } });
  S.el.addEventListener("click", (e) => { const b = S.el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; const m = S._map; if (!m) return;
    const dx = x - m.cx, dy = y - m.cy, d = Math.hypot(dx, dy) / m.R; if (d > 1.05 || d < 0.08) return; pos = { r: wrap(deg(Math.atan2(dx, -dy)), 360), d: Math.min(1, d) }; S.redraw(); });
  function draw(g, W, H, top) {
    const ph = W < 520, cdiW = ph ? W - 32 : Math.min(260, W * 0.36);
    const mapW = ph ? W : W - cdiW - 30, Rr = Math.min(mapW * 0.42, (H - top - (ph ? 150 : 30)) * 0.48), cx = ph ? W / 2 : 16 + mapW / 2, cy = top + 10 + Rr;
    S._map = { cx, cy, R: Rr };
    // compass rose
    C(g, cx, cy, Rr, { stroke: DIM, sw: 1 });
    for (let a = 0; a < 360; a += 30) { const x = Math.sin(rad(a)), y = -Math.cos(rad(a)); L(g, cx + x * Rr, cy + y * Rr, cx + x * (Rr - 8), cy + y * (Rr - 8), { stroke: GRAY }); if (a % 90 === 0) T(g, cx + x * (Rr + 12), cy + y * (Rr + 12) + 4, ["N", "E", "S", "W"][a / 90], { anchor: "middle", size: 11, fill: GRAY }); }
    // selected course line through station
    const u = [Math.sin(rad(obs)), -Math.cos(rad(obs))];
    L(g, cx - u[0] * Rr, cy - u[1] * Rr, cx + u[0] * Rr, cy + u[1] * Rr, { stroke: ACC, w: 1.6, dash: "6 4" });
    T(g, cx + u[0] * (Rr - 22) + 8, cy + u[1] * (Rr - 22), String(obs % 360).padStart(3, "0") + "°", { size: 11, fill: ACC });
    C(g, cx, cy, 6, { stroke: INK, sw: 2 }); T(g, cx + 10, cy + 16, "VOR", { size: 11, fill: GRAY });
    const px = cx + Math.sin(rad(pos.r)) * pos.d * Rr, py = cy - Math.cos(rad(pos.r)) * pos.d * Rr;
    planeTop(g, px, py, obs, 24, { stroke: INK });
    // CDI math: along-track and cross-track of the airplane relative to the course line
    const p = [Math.sin(rad(pos.r)) * pos.d, Math.cos(rad(pos.r)) * pos.d], un = [Math.sin(rad(obs)), Math.cos(rad(obs))];
    const along = p[0] * un[0] + p[1] * un[1], lat = p[0] * un[1] - p[1] * un[0]; // lat > 0: right of course
    const dev = deg(Math.atan2(lat, Math.abs(along))), flag = Math.abs(along) < 0.12 * pos.d ? "OFF" : along > 0 ? "FROM" : "TO";
    const needle = Math.max(-10, Math.min(10, -dev)); // degrees, 2° per dot, full scale 10°
    // CDI
    const ix = ph ? W / 2 : W - 16 - cdiW / 2, iy = ph ? H - 78 : cy, iw = cdiW, dot = iw / 12;
    R(g, ix - iw / 2, iy - 40, iw, 80, { stroke: GRAY, sw: 1.4, rx: 10, fill: "rgba(242,241,236,.03)" });
    for (let i = -5; i <= 5; i++) if (i) C(g, ix + i * dot, iy + 8, 3, { stroke: GRAY, sw: 1.2 });
    L(g, ix + (needle / 2) * dot, iy - 30, ix + (needle / 2) * dot, iy + 30, { stroke: INK, w: 3 });
    T(g, ix + iw / 2 - 10, iy - 22, flag, { anchor: "end", size: 12, fill: flag === "OFF" ? GRAY : ACC, weight: 600 });
    T(g, ix - iw / 2 + 4, iy + 58, "CDI · 2° PER DOT · FULL SCALE 10°", { size: 11, fill: GRAY });
    const radial = Math.round(pos.r);
    S.F.caption(`On the ${String(radial).padStart(3, "0")} radial`, flag === "OFF" ? "Flag: abeam" : `${flag} · ${Math.abs(needle) < 1 ? "centered" : Math.abs(needle) >= 10 ? "full scale " + (needle < 0 ? "left" : "right") : Math.round(Math.abs(needle) / 2) + " dot" + (Math.round(Math.abs(needle) / 2) === 1 ? "" : "s") + " " + (needle < 0 ? "left" : "right")}`);
    S.F.explain(flag === "OFF" ? "You're abeam the station for this course, so the instrument can't say TO or FROM. Turn the OBS or move the airplane." : `Flying a heading near ${String(obs % 360).padStart(3, "0")}°, ${Math.abs(needle) < 1 ? "you're on course" : `the course is to your ${needle < 0 ? "left" : "right"}: fly toward the needle`}. ${flag} means the ${String(obs % 360).padStart(3, "0")}° course takes you ${flag === "TO" ? "to" : "away from"} the station. Your heading doesn't change the needle; your position does. <span class="src">PHAK 16</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
