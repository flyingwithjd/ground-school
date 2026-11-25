// Turn coordinator and ball (PHAK FAA-H-8083-25C ch 8): bank slider sets a right turn at 90 knots; chips choose a
// coordinated turn, a slip or a skid. The miniature airplane shows rate of turn; the ball shows coordination. Static scene.
import { slider, chips, row } from "./base.js?v=680d64f417";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY } from "./kit.js?v=680d64f417";
const D = Math.PI / 180, TAS = 90;
const K = { coord: [1, 0, "Coordinated"], slip: [0.7, 1, "Slip"], skid: [1.3, -1, "Skid"] };
export function mount(host) {
  let bank = 15, co = "coord";
  const S = pxScene(host, { cls: "tcoord", corners: { tl: "Turn coordinator · right turn", tr: "PHAK 8" } }, draw);
  chips(row(S.F.ctrl), Object.entries(K).map(([k, v]) => [k, v[2]]), co, (v) => { co = v || co; S.redraw(); }, { label: "Rudder" });
  slider(row(S.F.ctrl), { label: "Bank", min: 0, max: 30, step: 5, value: bank, fmt: (v) => `${v}°`, oninput: (v) => { bank = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, [kf, bs] = K[co], rate = (1091 * Math.tan(bank * D) / TAS) * (bank ? kf : 1), ball = bank ? bs : 0;
    const r = Math.min((H - top) * 0.46, ph ? W * 0.4 : W * 0.22), cx = ph ? W / 2 : W * 0.3, cy = top + (H - top) / 2;
    C(g, cx, cy, r, { stroke: INK, sw: 2, fill: "#0d0d0e" });
    // index marks: wings level and standard rate (3°/s) about 20° down each side
    for (const a of [0, -20]) { const t = (180 + a) * D, u = -a * D; L(g, cx + Math.cos(t) * r * 0.78, cy + Math.sin(t) * r * 0.78, cx + Math.cos(t) * r * 0.95, cy + Math.sin(t) * r * 0.95, { stroke: INK, w: 2.4 }); L(g, cx + Math.cos(u) * r * 0.78, cy + Math.sin(u) * r * 0.78, cx + Math.cos(u) * r * 0.95, cy + Math.sin(u) * r * 0.95, { stroke: INK, w: 2.4 }); }
    T(g, cx - r * 0.72, cy + r * 0.42, "L", { size: 12, anchor: "middle", fill: GRAY }); T(g, cx + r * 0.72, cy + r * 0.42, "R", { size: 12, anchor: "middle", fill: GRAY });
    T(g, cx, cy - r * 0.5, "2 MIN", { size: 11, anchor: "middle", fill: GRAY });
    const tilt = Math.min(rate / 3, 1.8) * 20, a = tilt * D, ca = Math.cos(a), sa = Math.sin(a), rt = (x, y) => [cx + x * ca - y * sa, cy + x * sa + y * ca];
    L(g, ...rt(-r * 0.72, 0), ...rt(r * 0.72, 0), { stroke: "#fff", w: 3.5 }); C(g, cx, cy, r * 0.08, { fill: "#fff" }); L(g, ...rt(0, -r * 0.08), ...rt(0, -r * 0.22), { stroke: "#fff", w: 3 });
    // inclinometer
    const tw = r * 0.9, ty = cy + r * 0.55; R(g, cx - tw / 2, ty - 9, tw, 18, { stroke: INK, sw: 1.4, rx: 9, fill: "#1a1a1c" });
    L(g, cx - 11, ty - 9, cx - 11, ty + 9, { stroke: GRAY, w: 1 }); L(g, cx + 11, ty - 9, cx + 11, ty + 9, { stroke: GRAY, w: 1 });
    C(g, cx + ball * tw * 0.3, ty, 8, { fill: ball ? ACC : INK });
    const fix = ball > 0 ? "Step on the ball: more right rudder" : ball < 0 ? "Step on the ball: less right rudder (or left)" : "Ball centered";
    if (!ph) { const x = W * 0.6; [["Rate of turn", `${rate.toFixed(1)}°/s`], ["Time for 360°", bank ? `${Math.round(360 / rate)} s` : "-"], ["Ball", ball > 0 ? "inside (right)" : ball < 0 ? "outside (left)" : "centered"]].forEach(([k, v], i) => { T(g, x, top + 30 + i * 46, k, { size: 11, fill: GRAY }); T(g, x, top + 50 + i * 46, v, { size: 14, fill: INK }); }); }
    S.F.caption(`${bank}° bank at ${TAS} knots · ${rate.toFixed(1)}°/s${ph && bank ? ` · 360° in ${Math.round(360 / rate)} s` : ""}`, bank ? (co === "coord" ? (Math.abs(rate - 3) < 0.45 ? "Standard rate, coordinated" : "Coordinated turn") : co === "slip" ? "Slipping: ball to the inside" : "Skidding: ball to the outside") : "Wings level");
    S.F.explain(`${bank ? fix + ". " : ""}The miniature airplane shows rate of turn, not bank: on the mark is a standard-rate turn, 3° per second, 360° in 2 minutes. In a slip the turn is too slow for the bank and the ball falls inside; in a skid the turn is too fast and the ball slides outside. A skid at low altitude is the setup for a cross-control stall. <span class="src">PHAK 8 · AFH 4</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
