// The POH's nine sections (PHAK 9; GAMA Specification No. 1 layout): a closed book with tabs. Browse a tab to see what it
// holds, or switch to Find it and tap the tab where you'd look. Static scene: redraws only on a tap or a resize.
import { chips } from "./base.js?v=d5b31b47a9";
import { pxScene, T, R, P, L, C, hit, wrapT, BODY, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=d5b31b47a9";
// a small schematic of what each section looks like inside, drawn in the box x,y,w,h
function glyph(g, i, x, y, w, h) {
  const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h);
  const lines = (n, bold) => { for (let k = 0; k < n; k++) { const yy = y + 14 + k * (h - 20) / n; if (bold && k % 3 === 0) T(g, x, yy + 4, "▸ " + bold[k / 3 | 0], { size: 11, fill: INK, weight: 700 }); else { R(g, x + 16, yy - 4, 12, 12, { stroke: GRAY, sw: 1.2, rx: 2 }); L(g, x + 38, yy + 2, x + 38 + (w - 60) * (0.5 + ((k * 37) % 40) / 100), yy + 2, { stroke: DIM, w: 3 }); } } };
  if (i === 0) { const pw = m * 0.9, x0 = cx - pw / 2; P(g, `M${x0},${cy} h${pw} M${cx},${cy - m * 0.12} v${m * 0.32} M${cx - pw * 0.18},${cy + m * 0.2} h${pw * 0.36}`, { stroke: INK, w: 2 });
    L(g, x0, cy - m * 0.3, x0 + pw, cy - m * 0.3, { stroke: GRAY, arrow: "kahg" }); L(g, x0 + pw, cy - m * 0.3, x0, cy - m * 0.3, { stroke: GRAY, arrow: "kahg" }); T(g, cx, cy - m * 0.3 - 8, "WINGSPAN · LENGTH · CAPACITIES", { size: 11, anchor: "middle", fill: GRAY }); }
  else if (i === 1) { const r = m * 0.42, arc = (a0, a1, rr, st, ww) => { const p = (a) => [cx + rr * Math.cos(a), cy + r * 0.5 + rr * Math.sin(a)]; const [x1, y1] = p(a0), [x2, y2] = p(a1); P(g, `M${x1},${y1} A${rr},${rr} 0 0 1 ${x2},${y2}`, { stroke: st, w: ww }); };
    const A = (f) => Math.PI * (1 + f); arc(A(0.05), A(0.45), r - 10, INK, 4); arc(A(0.15), A(0.7), r, ACC, 6); arc(A(0.7), A(0.92), r, GRAY, 6);
    const rl = A(0.92); L(g, cx + (r - 12) * Math.cos(rl), cy + r * 0.5 + (r - 12) * Math.sin(rl), cx + (r + 10) * Math.cos(rl), cy + r * 0.5 + (r + 10) * Math.sin(rl), { stroke: INK, w: 3 });
    T(g, cx, cy + r * 0.5, "AIRSPEED MARKINGS", { size: 11, anchor: "middle", fill: GRAY }); }
  else if (i === 2) lines(6, ["ENGINE FAILURE", "FIRE IN FLIGHT"]);
  else if (i === 3) lines(6, ["PREFLIGHT", "BEFORE TAKEOFF"]);
  else if (i === 4) { R(g, x + 10, y + 6, w - 20, h - 26, { stroke: DIM, sw: 1 }); for (let k = 1; k < 5; k++) L(g, x + 10 + (w - 20) * k / 5, y + 6, x + 10 + (w - 20) * k / 5, y + h - 20, { stroke: "rgba(242,241,236,.08)", w: 1 });
    [0.15, 0.35, 0.55].forEach((o, k) => P(g, `M${x + 10},${y + h - 30 - (h - 40) * o} Q${cx},${y + h - 30 - (h - 40) * (o + 0.15)} ${x + w - 10},${y + 16 + (h - 40) * (0.4 - o * 0.6)}`, { stroke: k === 1 ? ACC : INK, w: 1.8 }));
    T(g, cx, y + h - 4, "TAKEOFF DISTANCE CHART", { size: 11, anchor: "middle", fill: GRAY }); }
  else if (i === 5) { const bw = m * 0.8, bh = m * 0.62, x0 = cx - bw / 2, y0 = cy - bh / 2 - 6; P(g, `M${x0 + bw * 0.2},${y0 + bh} L${x0},${y0 + bh * 0.45} L${x0 + bw * 0.25},${y0} L${x0 + bw},${y0} L${x0 + bw},${y0 + bh} Z`, { stroke: INK, w: 1.8 });
    C(g, x0 + bw * 0.55, y0 + bh * 0.4, 5, { fill: ACC }); T(g, cx, y0 + bh + 18, "CG ENVELOPE", { size: 11, anchor: "middle", fill: GRAY }); }
  else if (i === 6) { const tw = m * 0.28; R(g, cx - m * 0.45, y + 10, tw, 26, { stroke: INK, rx: 4 }); R(g, cx + m * 0.45 - tw, y + 10, tw, 26, { stroke: INK, rx: 4 });
    P(g, `M${cx - m * 0.45 + tw / 2},${y + 36} V${cy} H${cx} M${cx + m * 0.45 - tw / 2},${y + 36} V${cy} H${cx} M${cx},${cy} V${y + h - 40}`, { stroke: ACC, w: 2 }); C(g, cx, cy, 9, { stroke: INK, sw: 2, fill: BODY });
    R(g, cx - 30, y + h - 40, 60, 24, { stroke: INK, rx: 4 }); T(g, cx, y + h - 24, "ENGINE", { size: 11, anchor: "middle", fill: INK }); T(g, cx + 16, cy + 4, "SELECTOR", { size: 11, fill: GRAY }); }
  else if (i === 7) { ["100-HOUR / ANNUAL", "OIL AND FUEL SERVICING", "TOWING AND TIE-DOWN", "PILOT PREVENTIVE MAINT."].forEach((t, k) => { C(g, x + 22, y + 18 + k * 30, 4, { fill: GRAY }); T(g, x + 34, y + 22 + k * 30, t, { size: 11, fill: INK }); }); }
  else { ["S1 · GPS NAVIGATOR", "S2 · AUTOPILOT", "S3 · ..."].forEach((t, k) => { R(g, x + 10 + k * 12, y + 8 + k * 26, w - 60, h - 30 - k * 26, { stroke: k === 0 ? ACC : INK, sw: 1.4, fill: BODY, rx: 3 }); T(g, x + 22 + k * 12, y + 28 + k * 26, t, { size: 11, fill: k === 0 ? ACC : INK }); }); }
}
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
      T(g, bx + bw + 10, ty + th / 2 + 1, `${i + 1} ${s[0]}`, { size: ph ? 11 : 13, base: "middle", fill: on ? ACC : INK, weight: on ? 700 : 500 });
      hit(g, tab, `Section ${i + 1}, ${s[1]}`, () => { if (mode === "browse") sel = i; else if (ans == null) ans = i; else { qi = (qi + 1) % QUIZ.length; ans = null; } S.redraw(); });
    });
    const px = bx + 16, maxc = Math.floor((bw - 32) / (ph ? 7.4 : 8));
    if (mode === "browse") { const s = SEC[sel];
      T(g, px, by + 28, `SECTION ${sel + 1}`, { size: 11, fill: GRAY });
      let y = by + 54; wrapT(s[1], Math.floor((bw - 32) / 10)).forEach((t) => { T(g, px, y, t, { size: ph ? 17 : 24, fill: ACC, weight: 700, mono: false }); y += ph ? 22 : 30; });
      const bs = ph ? 14 : 17; y += 8; wrapT(s[2], Math.floor((bw - 32) / (bs * 0.52))).forEach((t) => { T(g, px, y, t, { size: bs, fill: INK, mono: false }); y += bs * 1.4; });
      const gy = y + 10, gh = by + bh - 44 - gy; if (gh > 90) glyph(g, sel, px, gy, bw - 32, Math.min(gh, 220));
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
