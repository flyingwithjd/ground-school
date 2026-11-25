// Cost sharing for a private pilot (14 CFR 61.113(c); FAA legal interpretations on common purpose and holding out):
// set who's on board and the shareable cost; see the least you may pay. Static scene: redraws on input or resize.
import { slider, chips } from "./base.js?v=27c70f9d2b";
import { pxScene, T, R, C, L, P, wrapT, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=27c70f9d2b";
export function mount(host) {
  let n = 3, cost = 270, why = "trip";
  const S = pxScene(host, { corners: { tl: "Splitting a flight's cost", tr: "14 CFR 61.113(c)" } }, draw);
  slider(S.F.ctrl, { label: "On board, with you", min: 2, max: 4, step: 1, value: n, fmt: (v) => String(v), oninput: (v) => { n = v; S.redraw(); } });
  slider(S.F.ctrl, { label: "Shareable cost", min: 100, max: 600, step: 10, value: cost, fmt: (v) => "$" + v, oninput: (v) => { cost = v; S.redraw(); } });
  chips(S.F.ctrl, [["trip", "Friends, same trip"], ["ad", "Seats advertised online"]], why, (v) => { why = v; S.redraw(); }, { label: "Who's flying with you" });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 16, x1 = W - 16, hire = why === "ad", share = Math.ceil((cost / n) * 100) / 100, sh = "$" + (share % 1 ? share.toFixed(2) : share);
    // seats: 2 x 2 cabin from above
    const cx = W / 2, sy = top + 6, sw = ph ? Math.min(130, (W - 46) / 2) : 120, shh = ph ? 46 : 70, gx = 14;
    const seats = [[cx - sw - gx / 2, sy], [cx + gx / 2, sy], [cx - sw - gx / 2, sy + shh + 12], [cx + gx / 2, sy + shh + 12]];
    seats.forEach(([x, y], i) => { const used = i < n, you = i === 0;
      R(g, x, y, sw, shh, { stroke: !used ? DIM : you && !hire ? ACC : hire ? DIM : INK, sw: 1.5, fill: you && !hire ? ACCF : "#111113", rx: 8, dash: used ? null : "4 4" });
      if (used) { C(g, x + 18, y + shh / 2 - 4, 7, { stroke: you && !hire ? ACC : hire ? DIM : INK, sw: 1.5 }); P(g, `M${x + 8},${y + shh / 2 + 14} q10,-12 20,0`, { stroke: you && !hire ? ACC : hire ? DIM : INK, w: 1.5 });
        T(g, x + 34, y + shh / 2 - 6, you ? "YOU" : "PAX " + i, { size: 11, fill: you && !hire ? ACC : GRAY });
        T(g, x + 34, y + shh / 2 + 12, hire ? "—" : you ? "≥ " + sh : "THE REST", { size: ph ? 12 : 13, fill: hire ? DIM : you ? ACC : INK, weight: 600 }); }
      else T(g, x + sw / 2, y + shh / 2 + 4, "EMPTY", { size: 11, fill: DIM, anchor: "middle" });
    });
    // the bill as a bar split into equal shares
    const by = sy + 2 * shh + 12 + (ph ? 34 : 40), bw = x1 - x0;
    T(g, x0, by - 10, `TOTAL $${cost} ÷ ${n} PEOPLE`, { size: 11, fill: GRAY });
    for (let i = 0; i < n; i++) { const x = x0 + (bw / n) * i; R(g, x + 1, by, bw / n - 2, 22, { fill: hire ? "rgba(242,241,236,.05)" : i === 0 ? ACC : "rgba(242,241,236,.12)", stroke: hire ? DIM : "none", rx: 3 });
      T(g, x + bw / n / 2, by + 15, i === 0 ? "YOU" : "PAX", { size: 11, anchor: "middle", fill: hire ? DIM : i === 0 ? "#fff" : GRAY, weight: 600 }); }
    let y = by + (ph ? 44 : 50);
    const msg = hire ? ["Holding out: advertising seats to the public makes it a flight for hire, even split evenly. A private pilot can't do it."]
      : [`You pay at least your pro rata share, ${sh}. You may pay more, never less.`, "Not shareable: your time, or costs beyond fuel, oil, airport fees and rental."];
    msg.forEach((m, k) => wrapT(m, Math.floor((W - 32) / 7.4)).forEach((t) => { T(g, x0, y, t, { size: 14, fill: k ? GRAY : hire ? INK : INK, mono: false, weight: k ? 400 : 600 }); y += 20; }));
    if (hire) { R(g, x1 - 128, by - 30, 128, 22, { stroke: INK, sw: 1.5, rx: 3 }); T(g, x1 - 64, by - 15, "NOT ALLOWED", { size: 12, anchor: "middle", fill: INK, weight: 700 }); }
    S.F.caption(hire ? "Seats advertised" : `${n} on board · $${cost}`, hire ? "Flight for hire: not allowed" : `You pay at least ${sh}`);
    S.F.explain(`A private pilot may share only fuel, oil, airport expenditures and rental fees, and may not pay less than the pro rata share. FAA legal interpretations add that you and your passengers need a common purpose for the trip, and that holding out to the public turns it into a flight for hire. <span class="src">14 CFR 61.113(c) · FAA legal interpretations</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
