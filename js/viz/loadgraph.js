// FAA-style weight and balance drill, redrawn in ink (PHAK 10; the knowledge test uses a loading graph and a
// center-of-gravity moment envelope). Set the loads: each one is read off its station line as a moment, the moments
// are added to the empty airplane's, and the total weight and moment are plotted on the envelope.
// A sample airplane only (172-like arms and envelope); always use your airplane's POH and its actual empty weight.
// Static scene: redraws only on input or resize.
import { slider, chips, row } from "./base.js?v=0a2a439800";
import { pxScene, T, L, C, P, R, ACC, INK, GRAY, DIM } from "./kit.js?v=0a2a439800";
const EW = 1642, EM = 62.6, MAXW = 2550;
const ST = [["front", "Pilot + front seat", 37, 400], ["rear", "Rear seats", 73, 400], ["fuel", "Fuel", 48, 318], ["bag", "Baggage", 95, 120]];
const ENV = [[35, 1500], [35, 1950], [41, 2550], [47.3, 2550], [47.3, 1500]];                 // CG in, weight lb
const inEnv = (cg, w) => { if (w > MAXW || w < 1500 || cg > 47.3) return false; const fwd = w <= 1950 ? 35 : 35 + ((w - 1950) / 600) * 6; return cg >= fwd; };
export function mount(host) {
  const V = { front: 340, rear: 170, fuel: 40, bag: 60 }; let view = "both";
  const S = pxScene(host, { cls: "wbg", corners: { tl: "Loading graph and envelope · sample airplane", tr: "PHAK 10" } }, draw);
  const vchips = chips(row(S.F.ctrl), [["load", "1 · Loading graph"], ["env", "2 · Envelope"]], "load", (v) => { view = v; S.redraw(); }, { label: "Show" });
  vchips.el.classList.add("phone-only");
  for (const [k, lab, , max] of ST) slider(row(S.F.ctrl), { label: lab, min: 0, max: k === "fuel" ? 53 : max, step: k === "fuel" ? 1 : 10, value: V[k], fmt: (v) => (k === "fuel" ? `${v} gal` : `${v} lb`), oninput: (v) => { V[k] = v; S.redraw(); } });
  function draw(g, W, H, top) {
    const ph = W < 520, lb = { front: V.front, rear: V.rear, fuel: V.fuel * 6, bag: V.bag };
    const mom = Object.fromEntries(ST.map(([k, , arm]) => [k, (lb[k] * arm) / 1000]));
    const tw = EW + Object.values(lb).reduce((a, b) => a + b, 0), tm = EM + Object.values(mom).reduce((a, b) => a + b, 0), cg = (tm * 1000) / tw, ok = inEnv(cg, tw);
    const showL = !ph || view !== "env", showE = !ph || view === "env";
    const bot = ph ? 40 : 34, gap = 46, pw = ph ? W - 70 : (W - 70 - gap - 40) / 2;
    // ---- loading graph: load (lb) up, moment/1000 across
    if (showL) { const x0 = 52, y0 = H - bot - 22, y1 = top + 14, x1 = x0 + pw, MX = 30, MY = 400;
      const X = (m) => x0 + (m / MX) * (x1 - x0), Y = (w) => y0 - (w / MY) * (y0 - y1);
      for (let m = 0; m <= MX; m += 5) { L(g, X(m), y0, X(m), y1, { stroke: "rgba(242,241,236,.08)", w: 1 }); T(g, X(m), y0 + 15, String(m), { size: 11, fill: GRAY, anchor: "middle" }); }
      for (let w = 0; w <= MY; w += 100) { L(g, x0, Y(w), x1, Y(w), { stroke: "rgba(242,241,236,.08)", w: 1 }); T(g, x0 - 6, Y(w) + 4, String(w), { size: 11, fill: GRAY, anchor: "end" }); }
      T(g, x0, y1 - 6, "LOAD lb", { size: 11, fill: GRAY }); T(g, x1, y0 + 30, "MOMENT ÷ 1000", { size: 11, fill: GRAY, anchor: "end" });
      ST.forEach(([k, lab, arm, max], i) => { const mm = Math.min(MX, (MY * arm) / 1000), ww = (mm * 1000) / arm;
        L(g, X(0), Y(0), X(mm), Y(ww), { stroke: INK, w: 1.4 });
        // short station name just above the top end of its line (the ends are far enough apart not to collide)
        const short = ["FRONT", "FUEL", "REAR", "BAG"][["front", "fuel", "rear", "bag"].indexOf(k)], ex = X(mm), ey = Y(ww);
        T(g, ex, ey - 6, short, { size: 11, fill: GRAY, anchor: ex > x1 - 20 ? "end" : "middle" });
        if (lb[k] > 0) { const px = X(mom[k]), py = Y(lb[k]); L(g, x0, py, px, py, { stroke: ACC, w: 1.2, dash: "3 3" }); L(g, px, py, px, y0, { stroke: ACC, w: 1.2, dash: "3 3" }); C(g, px, py, 3.5, { fill: ACC }); } });
      if (ph) T(g, x0, H - 12, "Across to the line, down to the moment", { size: 11, fill: GRAY }); }
    // ---- moment envelope: weight up, moment/1000 across
    if (showE) { const x0 = ph ? 52 : 52 + pw + gap + 30, y0 = H - bot - 22, y1 = top + 14, x1 = x0 + pw, M0 = 50, M1 = 125, W0 = 1500, W1 = 2600;
      const X = (m) => x0 + ((m - M0) / (M1 - M0)) * (x1 - x0), Y = (w) => y0 - ((w - W0) / (W1 - W0)) * (y0 - y1);
      for (let m = 50; m <= 125; m += ph ? 25 : 15) T(g, X(m), y0 + 15, String(m), { size: 11, fill: GRAY, anchor: "middle" });
      for (let w = 1600; w <= 2600; w += 200) { L(g, x0, Y(w), x1, Y(w), { stroke: "rgba(242,241,236,.08)", w: 1 }); T(g, x0 - 6, Y(w) + 4, w.toLocaleString(), { size: 11, fill: GRAY, anchor: "end" }); }
      L(g, x0, y0, x1, y0, { stroke: "rgba(242,241,236,.3)", w: 1 });
      T(g, x0, y1 - 6, "WEIGHT lb", { size: 11, fill: GRAY }); T(g, x1, y0 + 30, "MOMENT ÷ 1000", { size: 11, fill: GRAY, anchor: "end" });
      P(g, "M" + ENV.map(([c, w]) => `${X((c * w) / 1000)},${Y(w)}`).join(" L") + " Z", { stroke: INK, w: 2, fill: "rgba(242,241,236,.04)" });
      T(g, X((44 * 2550) / 1000), Y(2550) - 6, "MAX 2,550", { size: 11, fill: GRAY, anchor: "middle" });
      const px = Math.max(x0, Math.min(x1, X(tm))), py = Math.max(y1, Math.min(y0, Y(tw)));
      L(g, x0, py, px, py, { stroke: ok ? ACC : INK, w: 1.2, dash: "3 3" }); L(g, px, py, px, y0, { stroke: ok ? ACC : INK, w: 1.2, dash: "3 3" });
      C(g, px, py, 6, { fill: ok ? ACC : "#000", stroke: ok ? ACC : INK, sw: 2 }); if (!ok) { L(g, px - 4, py - 4, px + 4, py + 4, { stroke: INK, w: 2 }); L(g, px - 4, py + 4, px + 4, py - 4, { stroke: INK, w: 2 }); }
      if (ph) T(g, x0, H - 12, `${tw.toLocaleString()} lb at ${tm.toFixed(1)}: ${ok ? "inside, OK to fly" : "outside the envelope"}`, { size: 11, fill: ok ? ACC : INK }); }
    if (!ph) T(g, 52, H - 12, `MOMENTS: empty ${EM} + ${mom.front.toFixed(1)} + ${mom.rear.toFixed(1)} + ${mom.fuel.toFixed(1)} + ${mom.bag.toFixed(1)} = ${tm.toFixed(1)}`, { size: 11, fill: GRAY });
    S.F.caption(`${tw.toLocaleString()} lb · moment ${tm.toFixed(1)} · CG ${cg.toFixed(1)} in`, tw > MAXW ? "Over max weight" : ok ? "Inside the envelope" : "CG out of limits");
    S.F.explain(`Read each load across to its station line and down to its moment (÷ 1000). Add them to the empty airplane's ${EW} lb and ${EM}, then plot total weight against total moment: inside the envelope is within limits. Fuel is 6 lb per gallon. This is a sample airplane; use your airplane's POH and its actual empty weight and moment. <span class="src">PHAK 10 · FAA-H-8083-1B</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
