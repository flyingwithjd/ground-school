// Cloud base from the temperature / dew point spread (PHAK Ch 12). A lifted, unsaturated parcel cools about 5.4 °F
// per 1,000 ft while its dew point falls about 1 °F per 1,000 ft, so they close at 4.4 °F per 1,000 ft. Where they meet, cloud.
import { frame, slider, svg, readout, drawOn, ACC, FAINT, FAINT2, INK } from "./base.js?v=522c4707bc";
import { s } from "../core/util.js?v=522c4707bc";
import { T } from "./shapes.js?v=522c4707bc";
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin", corners: { tl: "Rising air · estimate", tr: "PHAK Ch 12" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  const X0 = 220, X1 = 1460, Y0 = 800, Y1 = 90, AMAX = 12000, TMIN = 20, TMAX = 110;
  const xT = (t) => X0 + ((t - TMIN) / (TMAX - TMIN)) * (X1 - X0), yA = (a) => Y0 - (a / AMAX) * (Y0 - Y1);
  for (let a = 0; a <= AMAX; a += 2000) { s("line", { x1: X0, y1: yA(a), x2: X1, y2: yA(a), stroke: FAINT, "stroke-width": 1 }, g); T(g, X0 - 16, yA(a) + 5, (a / 1000) + "k ft", { anchor: "end", size: 14, op: 0.5 }); }
  for (let t = 30; t <= 110; t += 20) T(g, xT(t), Y0 + 34, t + " °F", { anchor: "middle", size: 14, op: 0.5 });
  const tl = s("line", { stroke: INK, "stroke-width": 3 }, g), dl = s("line", { stroke: FAINT2, "stroke-width": 3, "stroke-dasharray": "10 8" }, g);
  const base = s("line", { x1: X0, x2: X1, stroke: ACC, "stroke-width": 3, filter: "url(#gw)" }, g);
  const cl = s("path", { fill: "none", stroke: ACC, "stroke-width": 2.5 }, g);
  const tLab = T(g, 0, 0, "temperature −5.4 °F / 1,000 ft", { size: 14, op: 0.8 }), dLab = T(g, 0, 0, "dew point −1 °F / 1,000 ft", { size: 14, op: 0.6 });
  const ro = readout(F.ctrl, [["sp", "spread"], ["b", "cloud base AGL"]]);
  let t = opts.t ?? 85, d = opts.d ?? 71, first = true;
  function update() { if (d > t) d = t; const sp = t - d, b = (sp / 4.4) * 1000, aTop = Math.min(AMAX, Math.max(b, 2000));
    tl.setAttribute("x1", xT(t)); tl.setAttribute("y1", Y0); tl.setAttribute("x2", xT(t - 5.4 * aTop / 1000)); tl.setAttribute("y2", yA(aTop));
    dl.setAttribute("x1", xT(d)); dl.setAttribute("y1", Y0); dl.setAttribute("x2", xT(d - aTop / 1000)); dl.setAttribute("y2", yA(aTop));
    const yb = yA(Math.min(b, AMAX)); base.setAttribute("y1", yb); base.setAttribute("y2", yb); base.setAttribute("opacity", b <= AMAX ? 1 : 0);
    const cx = xT(d - b / 1000); cl.setAttribute("d", `M${cx - 120},${yb} Q${cx - 120},${yb - 60} ${cx - 50},${yb - 50} Q${cx},${yb - 110} ${cx + 50},${yb - 50} Q${cx + 120},${yb - 60} ${cx + 120},${yb} Z`); cl.setAttribute("opacity", b <= AMAX ? 1 : 0);
    tLab.setAttribute("x", xT(t) + 16); tLab.setAttribute("y", Y0 - 24); dLab.setAttribute("x", xT(d) - 16); dLab.setAttribute("y", Y0 - 56); dLab.setAttribute("text-anchor", "end");
    ro("sp", sp + " °F"); ro("b", b > AMAX ? "above 12,000 ft" : Math.round(b).toLocaleString("en-US") + " ft");
    F.caption("Spread ÷ 4.4 × 1,000", b < 1000 ? "Under 1,000 ft: fog or low cloud likely" : (b > AMAX ? "Base above 12,000 ft" : `Base ≈ ${(Math.round(b / 10) * 10).toLocaleString("en-US")} ft AGL`));
    F.explain(`Lifted, unsaturated air cools about 5.4 °F per 1,000 ft while its dew point drops about 1 °F, so they converge at about 4.4 °F per 1,000 ft. ${sp} ÷ 4.4 × 1,000 ≈ ${Math.round(b).toLocaleString("en-US")} ft. It's an estimate for clouds formed by rising air, not a forecast. Read the reported ceiling. <span class="src">PHAK Ch 12</span>`);
    if (first) { first = false; drawOn(tl, { dur: 1200 }); drawOn(dl, { dur: 1200, delay: 200, light: false }); drawOn(base, { dur: 1100, delay: 1200 }); } }
  const sd = slider(F.ctrl, { label: "Dew point", min: 20, max: 100, value: d, fmt: (v) => v + " °F", oninput: (v) => { d = Math.min(v, t); if (v > t) sd.set(t, false); update(); } });
  slider(F.ctrl, { label: "Temperature", min: 30, max: 105, value: t, fmt: (v) => v + " °F", oninput: (v) => { t = v; if (d > t) { d = t; sd.set(t, false); } update(); } });
  update();
  return { destroy: () => F.destroy() };
}
