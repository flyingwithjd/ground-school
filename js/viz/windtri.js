// Wind triangle (PHAK 16 example: TC 090°, TAS 120 kt, wind 045° at 40 kt → WCA 14° left, TH 076°, GS ≈ 88 kt).
import { slider } from "./base.js?v=f59a9336fd";
import { pxScene, T, L, C, planeTop, ACC, INK, GRAY, DIM, wrap } from "./kit.js?v=f59a9336fd";
const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
export function mount(host) {
  let tc = 90, tas = 120, wd = 45, ws = 40;
  const S = pxScene(host, { cls: "tall", corners: { tl: "Wind triangle", tr: "PHAK 16" } }, draw);
  slider(S.F.ctrl, { label: "Wind from", min: 0, max: 355, step: 5, value: wd, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { wd = v; S.redraw(); } });
  slider(S.F.ctrl, { label: "Wind speed", min: 0, max: 60, step: 5, value: ws, fmt: (v) => v + " kt", oninput: (v) => { ws = v; S.redraw(); } });
  slider(S.F.ctrl, { label: "True course", min: 0, max: 355, step: 5, value: tc, fmt: (v) => String(v).padStart(3, "0") + "°", oninput: (v) => { tc = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, a = rad(wd - tc), x = (ws * Math.sin(a)) / tas;
    if (Math.abs(x) > 1) { S.F.caption("No solution", "Wind too strong"); return; }
    const wca = deg(Math.asin(x)), th = wrap(tc + wca, 360), gs = tas * Math.cos(rad(wca)) - ws * Math.cos(a);
    // vectors in screen coords: north up. start at A, TAS along TH, then wind (blowing toward wd+180), ends on course line.
    // fit the triangle to the stage
    const u = (d, m) => [m * Math.sin(rad(d)), -m * Math.cos(rad(d))], q = [[0, 0], u(th, tas), u(tc, gs)];
    const mnx = Math.min(...q.map((p) => p[0])), mxx = Math.max(...q.map((p) => p[0])), mny = Math.min(...q.map((p) => p[1])), mxy = Math.max(...q.map((p) => p[1]));
    const k = Math.min(2.4, (W - (ph ? 90 : 200)) / Math.max(1, mxx - mnx), (H - top - 90) / Math.max(1, mxy - mny));
    const v = (d, m) => [m * k * Math.sin(rad(d)), -m * k * Math.cos(rad(d))];
    const [hx, hy] = v(th, tas), [wx, wy] = v(wd + 180, ws), [gx, gy] = [hx + wx, hy + wy];
    const ax = W / 2 - k * (mnx + mxx) / 2, ay = (top + 20 + H - 40) / 2 - k * (mny + mxy) / 2;
    L(g, ax - v(tc, 30)[0], ay - v(tc, 30)[1], ax + gx + v(tc, 30)[0], ay + gy + v(tc, 30)[1], { stroke: DIM, dash: "5 5" });
    L(g, ax, ay, ax + hx, ay + hy, { stroke: INK, w: 2.2, arrow: "kahw" });
    if (ws) L(g, ax + hx, ay + hy, ax + gx, ay + gy, { stroke: GRAY, w: 2, arrow: "kahg" });
    L(g, ax, ay, ax + gx, ay + gy, { stroke: ACC, w: 2.6, arrow: "kah" });
    planeTop(g, ax, ay, th, 26);
    const lab = (x, y, s, f, an = "middle") => T(g, x, y, s, { anchor: an, size: ph ? 11 : 12, fill: f });
    lab(ax + hx / 2 - (gy > 0 ? 12 : -12) * Math.sign(hx || 1), ay + hy / 2 - 12, `TAS ${tas} · TH ${String(Math.round(th)).padStart(3, "0")}°`, INK, hx >= 0 ? "end" : "start");
    if (ws) lab(ax + hx + wx / 2 + 10, ay + hy + wy / 2, `WIND ${ws}`, GRAY, "start");
    lab(ax + gx / 2, ay + gy / 2 + 22, `GS ${Math.round(gs)} · TC ${String(tc).padStart(3, "0")}°`, ACC);
    // north arrow
    L(g, W - 24, top + 30, W - 24, top + 6, { stroke: GRAY, arrow: "kahg" }); T(g, W - 24, top + 46, "N", { anchor: "middle", size: 11, fill: GRAY });
    const side = Math.abs(wca) < 0.5 ? "none" : wca < 0 ? "left" : "right";
    S.F.caption("Wind correction", side === "none" ? `0° · GS ${Math.round(gs)} kt` : `${Math.abs(Math.round(wca))}° ${side} · GS ${Math.round(gs)} kt`);
    S.F.explain(`Wind from the ${side === "left" ? "left: subtract" : side === "right" ? "right: add" : "nose or tail: no"} correction. TC ${String(tc).padStart(3, "0")}° ${side === "left" ? "−" : "+"} ${Math.abs(Math.round(wca))}° = TH ${String(Math.round(th)).padStart(3, "0")}°. Groundspeed ${Math.round(gs)} kt. PHAK's example is 045° at 40 kt on TC 090°: 14° left, TH 076°, about 88 kt. <span class="src">PHAK 16</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
