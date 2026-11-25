// The ASRS penalty waiver as four gates (AC 00-46F para 12; 14 CFR 91.25): set each condition and see whether the FAA
// waives the civil penalty or certificate suspension. Static scene.
import { chips, slider, row } from "./base.js?v=4d40905da2";
import { pxScene, T, L, C, P, wrapT, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=4d40905da2";
export function mount(host) {
  let inad = true, clean = true, prior = true, days = 3;
  const S = pxScene(host, { cls: "short", corners: { tl: "NASA ASRS · waiver", tr: "All four must pass" } }, draw);
  slider(row(S.F.ctrl), { label: "Filed after", min: 0, max: 20, step: 1, value: days, fmt: (v) => (v === 0 ? "Same day" : v + (v === 1 ? " day" : " days")), oninput: (v) => { days = v; S.redraw(); } });
  chips(row(S.F.ctrl, "Violation"), [["y", "Inadvertent"], ["n", "Deliberate"]], "y", (v) => { inad = v === "y"; S.redraw(); }, { label: "The violation was" });
  chips(row(S.F.ctrl, "Event"), [["y", "Neither"], ["n", "Accident or crime"]], "y", (v) => { clean = v === "y"; S.redraw(); }, { label: "Accident or criminal offense" });
  chips(row(S.F.ctrl, "Record"), [["y", "Clean 5 years"], ["n", "Prior violation"]], "y", (v) => { prior = v === "y"; S.redraw(); }, { label: "Prior record" });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 16, x1 = W - 16, gates = [[["HONEST", "MISTAKE"], inad], [["NO ACCIDENT", "OR CRIME"], clean], [["CLEAN", "5 YEARS"], prior], [["FILED IN", "10 DAYS"], days <= 10]];
    const all = gates.every((x) => x[1]), cy = top + (H - top) * 0.32, n = gates.length, sp = (x1 - x0 - 24) / n;
    let broke = gates.findIndex((x) => !x[1]); if (broke < 0) broke = n;
    L(g, x0, cy, broke < n ? x0 + sp * broke + sp / 2 : x1 - 8, cy, { stroke: ACC, w: 3 });
    if (broke < n) L(g, x0 + sp * broke + sp / 2, cy, x1 - 16, cy, { stroke: DIM, w: 2, dash: "4 5" });
    gates.forEach(([lab, ok], i) => { const x = x0 + sp * i + sp / 2;
      C(g, x, cy, ph ? 15 : 18, { stroke: ok ? ACC : INK, sw: 2, fill: ok ? ACCF : "#111113" });
      if (ok) P(g, `M${x - 6},${cy} l4,5 l8,-10`, { stroke: ACC, w: 2.4 }); else { P(g, `M${x - 6},${cy - 6} l12,12 M${x + 6},${cy - 6} l-12,12`, { stroke: INK, w: 2.2 }); }
      lab.forEach((t, k) => T(g, x, cy + (ph ? 34 : 40) + k * 15, t, { size: 11, anchor: "middle", fill: ok ? INK : GRAY, mono: false, weight: 600 }));
      T(g, x, cy - (ph ? 24 : 28), String(i + 1), { size: 11, anchor: "middle", fill: GRAY });
    });
    // end node
    const ex = x1 - 8; C(g, ex, cy, 8, { fill: all ? ACC : "none", stroke: all ? ACC : DIM, sw: 2 });
    const msg = all ? "Penalty waived. The FAA can still find the violation, but no fine or suspension." : broke === 3 ? "Too late for the waiver: it needs a report within 10 days." : broke === 1 ? "No waiver: accidents and crimes are wholly excluded. An accident still goes to the NTSB." : "No waiver for this one. Filing still helps safety and stays confidential.";
    let y = cy + (ph ? 92 : 96); wrapT(msg, Math.floor((W - 32) / 7.6)).forEach((t) => { T(g, x0, y, t, { size: 14, fill: all ? ACC : INK, weight: 600, mono: false }); y += 20; });
    S.F.caption("ASRS report", all ? "Penalty waived" : "No waiver");
    S.F.explain(`The FAA treats a timely NASA report as a constructive attitude. It won't impose a civil penalty or suspension when the violation was inadvertent, involved no criminal offense, accident or lack of competency, you have no violation found in the previous 5 years, and you filed within 10 days of the event or of when you became aware of it. The FAA can't use the report itself in enforcement. <span class="src">AC 00-46F · 14 CFR 91.25</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
