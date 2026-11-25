// The POH's nine sections (PHAK 9; GAMA Specification No. 1 layout): a closed book with tabs. Browse a tab to see what it
// holds, or switch to Find it and tap the tab where you'd look. Static scene: redraws only on a tap or a resize.
import { chips } from "./base.js?v=bcb0f9d34d";
import { pxScene, T, R, P, hit, wrapT, BODY, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=bcb0f9d34d";
const SEC = [
  ["GEN", "General", "Dimensions, engine and propeller, approved fuel and oil grades, capacities, and the symbols and terms the book uses."],
  ["LIM", "Limitations", "FAA-approved airspeed limits and instrument markings, engine limits, weight and CG limits, load factors, approved maneuvers and the required placards."],
  ["EMER", "Emergency procedures", "Short checklists first (engine failure, fire, forced landing), then amplified procedures that explain them."],
  ["NORM", "Normal procedures", "Checklists from preflight to securing the airplane, and the speeds for normal operations."],
  ["PERF", "Performance", "Takeoff, climb, cruise, range and landing charts and tables, stall speeds and the crosswind component chart."],
  ["W&B", "Weight and balance, equipment list", "This airplane's empty weight and CG, loading charts, the CG envelope and the installed equipment."],
  ["SYS", "Airplane and systems description", "How the airframe, flight controls, fuel, electrical, avionics and other systems work."],
  ["SERV", "Handling, service and maintenance", "Inspection periods, ground handling, servicing, and the preventive maintenance a pilot may do."],
  ["SUPP", "Supplements", "Equipment that isn't part of the basic airplane, such as a GPS or autopilot, each with its own limitations and procedures."],
];
const QUIZ = [["The never-exceed speed (VNE)", 1], ["The checklist for an engine fire in flight", 2], ["Takeoff distance over a 50 ft obstacle", 4], ["This airplane's basic empty weight", 5],
  ["How the fuel system's selector works", 6], ["Limits for an autopilot installed later", 8], ["Approved oil grades and capacity", 0], ["The before-takeoff checklist", 3], ["How often the airplane needs an inspection", 7], ["The crosswind component chart", 4]];
export function mount(host) {
  let sel = 4, mode = "browse", qi = 0, ans = null;
  const S = pxScene(host, { cls: "tall", corners: { tl: "POH · 9 sections", tr: "Same order in every POH" } }, draw);
  chips(S.F.ctrl, [["browse", "Browse"], ["quiz", "Find it"]], mode, (v) => { mode = v; ans = null; S.redraw(); }, { label: "Mode" });
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 16, tabW = ph ? 62 : 90, d = ph ? 8 : 12, bx = x0, bw = W - 32 - tabW - d, by = top + d * 0.6 + 4, bh = H - by - 14;
    // book: back edge (pages) then cover
    P(g, `M${bx},${by} l${d},${-d * 0.6} h${bw} l${-d},${d * 0.6} Z`, { stroke: INK, w: 1.3, fill: "#1A1A1D" });
    R(g, bx, by, bw, bh, { stroke: INK, sw: 1.6, fill: BODY });
    const th = bh / 9;
    SEC.forEach((s, i) => { const on = mode === "browse" ? i === sel : ans != null && (i === ans || i === QUIZ[qi][1]);
      const good = mode === "quiz" && ans != null && i === QUIZ[qi][1], ty = by + i * th;
      const tab = R(g, bx + bw, ty + 2, tabW, th - 4, { stroke: on ? ACC : DIM, sw: 1.4, fill: on && (mode === "browse" || good) ? ACCF : "#0E0E10", rx: 4 });
      T(g, bx + bw + 10, ty + th / 2 + 1, `${i + 1} ${s[0]}`, { size: 11, base: "middle", fill: on ? ACC : INK, weight: on ? 700 : 500 });
      hit(g, tab, `Section ${i + 1}, ${s[1]}`, () => { if (mode === "browse") sel = i; else if (ans == null) ans = i; else { qi = (qi + 1) % QUIZ.length; ans = null; } S.redraw(); });
    });
    const px = bx + 16, maxc = Math.floor((bw - 32) / (ph ? 7.4 : 8));
    if (mode === "browse") { const s = SEC[sel];
      T(g, px, by + 28, `SECTION ${sel + 1}`, { size: 11, fill: GRAY });
      let y = by + 54; wrapT(s[1], Math.floor((bw - 32) / 10)).forEach((t) => { T(g, px, y, t, { size: ph ? 17 : 20, fill: ACC, weight: 700, mono: false }); y += ph ? 22 : 26; });
      y += 8; wrapT(s[2], maxc).forEach((t) => { T(g, px, y, t, { size: 14, fill: INK, mono: false }); y += 20; });
      if (sel === 1 || sel === 4 || sel === 5) T(g, px, by + bh - 18, sel === 1 ? "FAA APPROVED · 14 CFR 91.9" : "USE YOUR AIRPLANE'S OWN BOOK", { size: 11, fill: GRAY });
      S.F.caption(`Section ${sel + 1}`, s[1]);
    } else { const [q, a] = QUIZ[qi];
      T(g, px, by + 28, `FIND IT · ${qi + 1} OF ${QUIZ.length}`, { size: 11, fill: GRAY });
      let y = by + 54; wrapT(q, Math.floor((bw - 32) / 9.5)).forEach((t) => { T(g, px, y, t, { size: ph ? 17 : 19, fill: INK, weight: 700, mono: false }); y += ph ? 22 : 25; });
      y += 10;
      if (ans == null) T(g, px, y, "Tap the tab where you'd look.", { size: 14, fill: GRAY, mono: false });
      else { const ok = ans === a; T(g, px, y, ok ? "Yes." : `Not section ${ans + 1}.`, { size: 15, fill: ok ? ACC : INK, weight: 700, mono: false }); y += 22;
        wrapT(`It's in section ${a + 1}, ${SEC[a][1]}.`, maxc).forEach((t) => { T(g, px, y, t, { size: 14, fill: INK, mono: false }); y += 20; });
        T(g, px, by + bh - 18, "TAP ANY TAB FOR THE NEXT ONE", { size: 11, fill: GRAY }); }
      S.F.caption("Find it", ans == null ? "Where would you look?" : ans === a ? "Found it" : `Section ${a + 1}`);
    }
    S.F.explain(`Every POH written to the industry standard layout uses these nine sections in this order, so you can find a limit, a checklist or a chart in any airplane's book. Section 2 is FAA-approved and part of the operating limitations you must follow. Use the book for your airplane's serial number, with its supplements. <span class="src">PHAK 9 · 14 CFR 91.9</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
