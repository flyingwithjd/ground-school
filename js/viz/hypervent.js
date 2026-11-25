// Hypoxia vs hyperventilation (PHAK FAA-H-8083-25C ch 17): their symptoms overlap, so the situation decides what to do
// first. Drawn as two overlapping boxes (a square Venn). Static scene.
import { chips, row } from "./base.js?v=d5b31b47a9";
import { pxScene, T, R, ACC, INK, GRAY, ACCF } from "./kit.js?v=d5b31b47a9";
const COL = [["Hypoxia only", ["blue lips", "headache", "euphoria", "slow reactions", "drowsy"]],
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
    const u = SC[sc], m = 10, cw = (W - 2 * m) / 3, y0 = top + 4, bh = H - y0 - 10;
    const hx = u.on.includes(0), vx = u.on.includes(2);
    R(g, m, y0, cw * 2 - 4, bh, { stroke: hx ? ACC : "rgba(242,241,236,.3)", sw: hx ? 2 : 1, fill: hx ? ACCF : "none", rx: 10 });
    R(g, m + cw + 4, y0 + 6, cw * 2 - 4, bh - 12, { stroke: vx ? ACC : "rgba(242,241,236,.3)", sw: vx ? 2 : 1, fill: vx ? ACCF : "none", rx: 10, dash: "5 4" });
    COL.forEach(([hd, items], i) => { const x = m + cw * i + cw / 2, lit = u.on.includes(i), sz = W < 520 ? 11 : 12;
      T(g, x, y0 + 26, i === 2 && W < 520 ? "Hypervent." : hd, { size: 11, weight: 700, fill: lit ? INK : GRAY, anchor: "middle" });
      const lh = Math.min(sz + 9, (bh - 62) / 5); items.forEach((s, j) => T(g, x, y0 + 50 + j * lh, s, { size: sz, fill: lit ? INK : "rgba(242,241,236,.4)", anchor: "middle" })); });
    S.F.caption(u.cap, u.big);
    S.F.explain(`${u.t} Hypoxia is too little oxygen; hyperventilation is too much carbon dioxide breathed off, usually from stress. <span class="src">PHAK 17 · 14 CFR 91.211 · AIM 8-1-2</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
