// Time zones and UTC (PHAK 16): the earth turns 15° an hour; convert local clock time to Zulu.
import { slider, chips } from "./base.js?v=961b79525f";
import { pxScene, T, L, R, ACC, INK, GRAY, DIM, ACCF, ACCM, fmtTime } from "./kit.js?v=961b79525f";
const Z = [["E", "Eastern", 5, 75], ["C", "Central", 6, 90], ["M", "Mountain", 7, 105], ["P", "Pacific", 8, 120]];
export function mount(host) {
  let zi = 2, dst = false, t = 14 * 60;
  const S = pxScene(host, { corners: { tl: "Local time to UTC", tr: "PHAK 16" } }, draw);
  chips(S.F.ctrl, Z.map((z, i) => [String(i), z[1]]), String(zi), (v) => { if (v != null) { zi = +v; S.redraw(); } }, { label: "Time zone" });
  chips(S.F.ctrl, [["s", "Standard"], ["d", "Daylight saving"]], "s", (v) => { dst = v === "d"; S.redraw(); }, { label: "Season" });
  slider(S.F.ctrl, { label: "Local time", min: 0, max: 1425, step: 15, value: t, fmt: (v) => fmtTime(v), oninput: (v) => { t = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 14, x1 = W - 14, lo0 = 135, lo1 = 60, X = (lo) => x0 + ((lo0 - lo) / (lo0 - lo1)) * (x1 - x0);
    const by = top + 20, bh = Math.min(70, (H - top) * 0.3);
    T(g, x0, by - 8, "LONGITUDE (°W)", { size: 11, fill: GRAY });
    Z.forEach((z, i) => { const xa = X(z[3] + 7.5), xb = X(z[3] - 7.5), on = i === zi;
      R(g, xa, by, xb - xa - 2, bh, { fill: on ? ACCM : "rgba(242,241,236,.05)", stroke: on ? ACC : DIM, sw: on ? 2 : 1, rx: 4 });
      T(g, (xa + xb) / 2, by + bh / 2 + 5, z[0], { anchor: "middle", size: ph ? 14 : 16, fill: on ? INK : GRAY });
      L(g, X(z[3]), by + bh, X(z[3]), by + bh + 6, { stroke: GRAY }); T(g, X(z[3]), by + bh + 20, z[3] + "°", { anchor: "middle", size: 11, fill: GRAY });
    });
    T(g, x1, by + bh + 38, "15° = 1 HOUR", { anchor: "end", size: 11, fill: ACC });
    const off = Z[zi][2] - (dst ? 1 : 0), u = t + off * 60, cy = by + bh + (ph ? 86 : 90);
    const day = u >= 1440 ? " +1 day" : "";
    T(g, W * 0.27, cy, fmtTime(t), { anchor: "middle", size: ph ? 26 : 32, fill: INK, mono: false, weight: 800 });
    T(g, W * 0.27, cy + 20, "LOCAL", { anchor: "middle", size: 11, fill: GRAY });
    T(g, W * 0.5, cy - 8, `+${off} h`, { anchor: "middle", size: 12, fill: ACC }); L(g, W * 0.42, cy, W * 0.58, cy, { stroke: ACC, w: 2, arrow: "kah" });
    T(g, W * 0.73, cy, fmtTime(u) + "Z", { anchor: "middle", size: ph ? 26 : 32, fill: ACC, mono: false, weight: 800 });
    T(g, W * 0.73, cy + 20, "UTC" + day.toUpperCase(), { anchor: "middle", size: 11, fill: GRAY });
    S.F.caption(`${Z[zi][1]} ${dst ? "daylight" : "standard"}`, `${fmtTime(t)} local = ${fmtTime(u)}Z`);
    S.F.explain(`Add ${Z[zi][2]} hours to ${Z[zi][1]} standard time${dst ? `, one less (${off}) during daylight saving time` : ""}. Past midnight Zulu it's already tomorrow's date in UTC. <span class="src">PHAK 16</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
