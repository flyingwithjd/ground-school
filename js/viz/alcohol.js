// Bottle to throttle (14 CFR 91.17; AIM 8-1-1; PHAK 17): slide the hours since your last drink and see the legal 8-hour
// floor against the AIM's 12–24 hours. Pick one drink or several. No blood-alcohol numbers are computed. Static scene.
import { slider, chips, row } from "./base.js?v=4d40905da2";
import { pxScene, T, L, R, ACC, INK, GRAY, ACCF } from "./kit.js?v=4d40905da2";
export function mount(host) {
  let hrs = 8, many = true;
  const S = pxScene(host, { cls: "alc", corners: { tl: "Hours since the last drink", tr: "14 CFR 91.17 · AIM 8-1-1" } }, draw);
  chips(row(S.F.ctrl), [["1", "One drink"], ["n", "Several drinks"]], "n", (v) => { many = (v || "n") === "n"; S.redraw(); }, { label: "How much" });
  slider(row(S.F.ctrl), { label: "Hours", min: 0, max: 24, step: 1, value: hrs, fmt: (v) => `${v} h`, oninput: (v) => { hrs = +v; S.redraw(); } });
  function draw(g, W, H, top) {
    const m = 18, x0 = m, x1 = W - m, X = (h) => x0 + (h / 24) * (x1 - x0), by = top + (H - top) * 0.42, bh = 26;
    R(g, x0, by, x1 - x0, bh, { stroke: "rgba(242,241,236,.3)", sw: 1, rx: 6 });
    R(g, X(0), by, X(8) - X(0), bh, { fill: "rgba(239,68,68,.22)", rx: 6 });
    R(g, X(12), by, X(24) - X(12), bh, { fill: ACCF, rx: 6 });
    R(g, X(0), by + bh + 8, X(many ? 16 : 3) - X(0), 8, { fill: "rgba(251,191,36,.6)", rx: 4 });
    L(g, X(8), by - 10, X(8), by + bh + 20, { stroke: INK, w: 2 });
    for (const h of [0, 8, 12, 24]) T(g, X(h), by - 16, `${h}h`, { size: 11, anchor: h === 0 ? "start" : h === 24 ? "end" : "middle", fill: GRAY });
    T(g, X(4), by + bh / 2 + 4, "illegal", { size: 11, anchor: "middle", fill: INK });
    T(g, X(18), by + bh / 2 + 4, "AIM: 12–24 h", { size: 11, anchor: "middle", fill: INK });
    T(g, x0, by + bh + 34, many ? "alcohol can linger 16+ h" : "about 3 h to clear one drink", { size: 11, fill: "#fbbf24" });
    L(g, X(hrs), by - 4, X(hrs), by + bh + 4, { stroke: ACC, w: 4 });
    const legal = hrs >= 8, aim = hrs >= (many ? 24 : 12);
    S.F.caption(legal ? (aim ? "Past the 8-hour rule and the AIM's guidance" : "Past the 8 hours, but short of the AIM's guidance") : "Inside 8 hours: you may not fly", legal ? (aim ? "Better margin" : "Legal, maybe not fit") : "No-go");
    S.F.explain(`The 8 hours is only one of four tests in 91.17: you also can't be under the influence, using a drug that impairs you, or at 0.04 or more. ${many ? "After several drinks, alcohol and hangover effects can last well past 16 hours." : "One drink takes the body about 3 hours to clear."} The AIM suggests 12 to 24 hours between bottle and throttle, depending on how much you drank. <span class="src">14 CFR 91.17 · AIM 8-1-1 · PHAK 17</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
