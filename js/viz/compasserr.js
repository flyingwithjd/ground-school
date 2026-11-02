// Magnetic compass errors from dip (PHAK 8): northerly turning error and acceleration error (ANDS).
// Two dials: the heading indicator shows where the airplane really points; the compass shows what the magnet says.
// The turning-error size is schematic, scaled with the "15° plus half your latitude" rule of thumb (largest on north/south headings, zero on east/west).
import { chips, slider } from "./base.js?v=269fcd6a6e";
import { pxScene, T, L, C, ACC, INK, GRAY, DIM, wrap } from "./kit.js?v=269fcd6a6e";
const NAMES = { 0: "N", 90: "E", 180: "S", 270: "W" };
export function mount(host) {
  let mode = "turn", from = "n", spd = "acc", hdgEW = 90, prog = 20, lat = 44;
  const S = pxScene(host, { corners: { tl: "Compass errors", tr: "PHAK 8" } }, draw);
  const c1 = chips(S.F.ctrl, [["turn", "Turning"], ["speed", "Speed change"]], mode, (v) => { mode = v || mode; sync(); }, { label: "Error" });
  const c2 = chips(S.F.ctrl, [["n", "Turn right from north"], ["s", "Turn right from south"]], from, (v) => { from = v || from; sync(); }, { label: "Turn" });
  const s1 = slider(S.F.ctrl, { label: "Degrees turned", min: 0, max: 90, value: prog, fmt: (v) => v + "°", oninput: (v) => { prog = v; S.redraw(); } });
  const s2 = slider(S.F.ctrl, { label: "Latitude", min: 25, max: 49, value: lat, fmt: (v) => v + "° N", oninput: (v) => { lat = v; S.redraw(); } });
  const c3 = chips(S.F.ctrl, [["acc", "Accelerate"], ["dec", "Decelerate"]], spd, (v) => { spd = v || spd; S.redraw(); }, { label: "Speed" });
  const c4 = chips(S.F.ctrl, [[90, "Heading east"], [270, "Heading west"]], hdgEW, (v) => { hdgEW = +(v || hdgEW); S.redraw(); }, { label: "Heading" });
  function sync() { const t = mode === "turn"; [c2.el, s1.el, s2.el].forEach((e) => (e.style.display = t ? "" : "none")); [c3.el, c4.el].forEach((e) => (e.style.display = t ? "none" : "")); S.redraw(); }
  sync();
  function dial(g, cx, cy, r, hdg, title, hl) {
    C(g, cx, cy, r, { stroke: hl ? ACC : GRAY, sw: 1.5 });
    for (let d = 0; d < 360; d += 30) { const a = (d - 90) * Math.PI / 180, ri = d % 90 ? r - 6 : r - 10;
      L(g, cx + Math.cos(a) * ri, cy + Math.sin(a) * ri, cx + Math.cos(a) * r, cy + Math.sin(a) * r, { stroke: GRAY, w: 1.2 });
      if (NAMES[d]) T(g, cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20) + 4, NAMES[d], { anchor: "middle", size: 12, fill: INK }); }
    const a = (hdg - 90) * Math.PI / 180;
    L(g, cx, cy, cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4), { stroke: hl ? ACC : INK, w: 2.4, arrow: hl ? "kah" : "kahw" });
    C(g, cx, cy, 3, { fill: INK });
    T(g, cx, cy + r + 20, title, { anchor: "middle", size: 11, fill: GRAY });
    T(g, cx, cy + r + 38, String(Math.round(wrap(hdg, 360))).padStart(3, "0") + "°", { anchor: "middle", size: 14, fill: hl ? ACC : INK, weight: 500 });
  }
  function draw(g, W, H, top) {
    const ph = W < 520, room = H - top - 60, r = Math.max(52, Math.min(ph ? (W - 60) / 4 : 110, room / 2 - 6)), cy = top + r + 6;
    const xA = W / 2 - r - (ph ? 14 : 40), xB = W / 2 + r + (ph ? 14 : 40);
    let actual, shown, cap, sub, ex;
    if (mode === "turn") {
      const start = from === "n" ? 0 : 180, E = 15 + lat / 2; actual = start + prog;
      shown = actual - E * Math.cos(actual * Math.PI / 180) * (prog === 0 ? 0 : 1); // schematic: lags near north, leads near south, none on east/west
      const lag = from === "n";
      cap = lag ? "Turning from north" : "Turning from south";
      sub = prog === 0 ? "Wings level: no error" : lag ? (shown < 0 ? "It shows a turn the wrong way" : "The compass lags") : "The compass leads";
      ex = lag ? `Dip pulls the north end of the magnet down, so in a turn from north the card first swings the other way, then lags. Rolling out on a northerly heading, roll out <em>before</em> the compass reaches it, by about 15° plus half your latitude (${Math.round(E)}° here). <span class="src">PHAK 8 · rule of thumb</span>`
        : `Turning from south, the compass gets ahead of the turn. Rolling out on a southerly heading, roll out <em>after</em> the compass passes it, by about 15° plus half your latitude (${Math.round(E)}° here). On east and west headings the error is near zero. <span class="src">PHAK 8 · rule of thumb</span>`;
    } else {
      actual = hdgEW; const toN = spd === "acc"; const d = 20;
      shown = hdgEW === 90 ? (toN ? 90 - d : 90 + d) : (toN ? 270 + d : 270 - d);
      cap = `Straight and level, heading ${hdgEW === 90 ? "east" : "west"} · ANDS`;
      sub = toN ? "Accelerate: shows a turn north" : "Decelerate: shows a turn south";
      ex = `On an east or west heading, the compass's weight (offset to counter dip) lags when speed changes, tilting the card. Speeding up shows a turn toward north; slowing down shows a turn toward south. It goes away when speed is steady. The error is near zero on north and south headings. Size of the swing shown is schematic. <span class="src">PHAK 8</span>`;
    }
    dial(g, xA, cy, r, actual, "HEADING INDICATOR", false);
    dial(g, xB, cy, r, shown, "MAGNETIC COMPASS", true);
    T(g, W / 2, Math.min(H - 10, cy + r + 62), mode === "turn" ? "NORTHERN HEMISPHERE · ERROR SIZE SCHEMATIC" : "NORTHERN HEMISPHERE · SWING SIZE SCHEMATIC", { anchor: "middle", size: 11, fill: DIM });
    S.F.caption(cap, sub); S.F.explain(ex);
  }
  return { destroy() { S.F.destroy(); } };
}
