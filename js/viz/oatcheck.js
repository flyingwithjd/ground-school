// The flight-instrument check from preflight to takeoff (PHAK FAA-H-8083-25C ch 8): pick a phase and the instruments to
// check light up in blue, each with what to look for. Static scene.
import { chips, row } from "./base.js?v=4d40905da2";
import { pxScene, T, R, C, ACC, INK, GRAY, ACCF } from "./kit.js?v=4d40905da2";
const INS = [["pitot", "Pitot"], ["asi", "Airspeed"], ["ai", "Attitude"], ["alt", "Altimeter"], ["tc", "Turn coord."], ["hi", "Heading"], ["vsi", "VSI"], ["comp", "Compass"], ["oat", "OAT"]];
const PH = {
  pre: ["Preflight", { pitot: "cover off, holes clear", oat: "reads about the air temp" }, "Walkaround: pitot cover off, pitot and static openings clear and undamaged."],
  taxi0: ["Before taxi", { alt: "set, within 75 ft of field elev.", vsi: "near zero", asi: "zero", comp: "full, swings, near heading" }, "Set the altimeter; it must read within 75 ft of field elevation. VSI near zero (or use its reading as zero)."],
  taxi: ["Taxi", { tc: "turns right way, ball opposite", hi: "turns correctly", comp: "turns correctly", ai: "steady, no odd sounds" }, "In turns the turn coordinator shows the turn and the ball goes the other way; headings change correctly; the attitude indicator stays steady. Suction in range."],
  roll: ["Takeoff roll", { asi: "comes alive, rising steadily" }, "The airspeed comes alive early and increases at a normal rate. If not, abort while you have runway."],
};
export function mount(host) {
  let ph = "pre";
  const S = pxScene(host, { cls: "oatchk", corners: { tl: "Instrument check", tr: "PHAK 8" } }, draw);
  chips(row(S.F.ctrl), Object.entries(PH).map(([k, v]) => [k, v[0]]), ph, (v) => { ph = v || ph; S.redraw(); }, { label: "Phase" });
  function draw(g, W, H, top) {
    const [n, on, t] = PH[ph], cols = 3, m = 10, gap = 8, cw = (W - 2 * m - gap * (cols - 1)) / cols, rh = (H - top - 8 - gap * 2) / 3;
    INS.forEach(([k, lab], i) => { const x = m + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (rh + gap), lit = k in on;
      R(g, x, y, cw, rh, { stroke: lit ? ACC : "rgba(242,241,236,.25)", sw: lit ? 2 : 1, fill: lit ? ACCF : "#0d0d0e", rx: 10 });
      C(g, x + 16, y + 18, 5, { fill: lit ? ACC : "rgba(242,241,236,.25)" });
      T(g, x + 28, y + 22, lab, { size: 12, weight: 700, fill: lit ? INK : GRAY });
      if (lit) { const words = on[k].split(" "), lines = []; let ln = ""; const maxc = Math.max(8, Math.floor((cw - 20) / 7.2));
        for (const w of words) { if ((ln + " " + w).trim().length > maxc) { lines.push(ln.trim()); ln = w; } else ln += " " + w; } lines.push(ln.trim());
        lines.slice(0, Math.max(1, Math.floor((rh - 34) / 16))).forEach((s, j) => T(g, x + 12, y + 42 + j * 16, s, { size: 12, mono: false, fill: INK })); } });
    S.F.caption(`${Object.keys(on).length} item${Object.keys(on).length > 1 ? "s" : ""} to check`, n);
    S.F.explain(`${t} <span class="src">PHAK 8</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
