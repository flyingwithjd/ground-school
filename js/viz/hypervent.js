// Hypoxia vs hyperventilation (PHAK FAA-H-8083-25C ch 17): their symptoms overlap, so the situation decides what to do
// first. Drawn as two overlapping boxes (a square Venn). Static scene.
import { chips, row } from "./base.js?v=27c70f9d2b";
import { pxScene, T, R, ACC, INK, GRAY, ACCF } from "./kit.js?v=27c70f9d2b";
const COL = [["Hypoxia only", ["blue lips, nails", "headache", "euphoria", "slow reactions", "drowsy"]],
  ["Both", ["lightheaded", "tingling", "vision dims", "can pass out"]],
  ["Hyperventilation", ["fast breathing", "hot and cold", "muscle spasms"]]];
const SC = {
  calm: { n: "Anxious, low altitude", on: [1, 2], cap: "3,000 ft, nervous, breathing fast", big: "Likely hyperventilation", t: "At low altitude, hypoxia is unlikely for a healthy pilot. Slow your breathing: talk aloud, or breathe into a paper bag. Recovery is usually quick." },
  high: { n: "High, no oxygen", on: [0, 1], cap: "13,000 ft for an hour, no oxygen", big: "Suspect hypoxia", t: "Euphoria hides it. Use oxygen or descend now; then follow 91.211 and the AIM (oxygen above 10,000 ft by day, 5,000 ft at night)." },
  oxy: { n: "On oxygen, symptoms", on: [0, 1, 2], cap: "Using oxygen, tingling and lightheaded", big: "Check oxygen first", t: "It could be either. The PHAK says to check the oxygen equipment and flow rate first, then slow your breathing." },
};
export function mount(host) {
  let sc = "calm";
  const S = pxScene(host, { cls: "hvx", corners: { tl: "Symptoms overlap", tr: "PHAK 17" } }, draw);
  chips(row(S.F.ctrl), Object.entries(SC).map(([k, v]) => [k, v.n]), sc, (v) => { sc = v || sc; S.redraw(); }, { label: "Situation" });
  function draw(g, W, H, top) {
    const u = SC[sc], m = 10, hx = u.on.includes(0), vx = u.on.includes(2), ph = W < 520;
    const box = (x, y, w, hh, on, dash) => R(g, x, y, w, hh, { stroke: on ? ACC : "rgba(242,241,236,.3)", sw: on ? 2 : 1, fill: on ? ACCF : "none", rx: 10, dash });
    const item = (x, y, str, lit, anchor) => T(g, x, y, str, { size: 14, mono: false, weight: 500, fill: lit ? INK : "rgba(242,241,236,.45)", anchor });
    const head = (x, y, str, lit, anchor) => T(g, x, y, str, { size: 12, weight: 700, fill: lit ? INK : GRAY, anchor });
    if (ph) {
      // stacked bands: hypoxia box covers bands 1-2, hyperventilation box covers bands 2-3, the overlap is "Both"
      const y0 = top + 2, avail = H - y0 - 8, rows = [3, 2, 2], lh = 21, hb = rows.map((r) => 30 + r * lh), gap = (avail - hb.reduce((a, b) => a + b)) / 2;
      const ys = [y0, y0 + hb[0] + gap, y0 + hb[0] + hb[1] + 2 * gap];
      box(m, ys[0], W - 2 * m - 8, ys[1] + hb[1] - ys[0], hx); box(m + 8, ys[1] - 4, W - 2 * m - 8, ys[2] + hb[2] - ys[1] + 4, vx, "5 4");
      COL.forEach(([hd, items], i) => { const lit = u.on.includes(i), x0 = m + 22, cw = (W - 2 * m - 40) / 2;
        head(x0, ys[i] + 20, i === 1 ? "Both (the overlap)" : hd, lit);
        items.forEach((t, j) => item(x0 + (j % 2) * cw, ys[i] + 20 + lh * (1 + Math.floor(j / 2)), t, lit)); });
    } else {
      const cw = (W - 2 * m) / 3, y0 = top + 4, bh = H - y0 - 10;
      box(m, y0, cw * 2 - 4, bh, hx); box(m + cw + 4, y0 + 6, cw * 2 - 4, bh - 12, vx, "5 4");
      COL.forEach(([hd, items], i) => { const x = m + cw * i + cw / 2, lit = u.on.includes(i), lh = Math.min(23, (bh - 62) / 5);
        head(x, y0 + 26, hd, lit, "middle"); items.forEach((t, j) => item(x, y0 + 54 + j * lh, t, lit, "middle")); });
    }
    S.F.caption(u.cap, u.big);
    S.F.explain(`${u.t} Hypoxia is too little oxygen; hyperventilation is too much carbon dioxide breathed off, usually from stress. <span class="src">PHAK 17 · 14 CFR 91.211 · AIM 8-1-2</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
