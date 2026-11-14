// Cabin heat and carbon monoxide: outside air flows through a shroud around the exhaust muffler, through the cabin heat
// valve and into the cabin and the windshield defroster; the cabin air knob adds fresh air. A cracked muffler lets exhaust
// into the heated air; a CO detector reads it. Run the CO checklist to clear it.
// Facts: PHAK 7 (Exhaust Heating Systems): simplest heating system, used on most light aircraft; a defective exhaust heating
// system risks CO poisoning. C172S NAV III POH 3/7: cabin heat is ambient air heated in an exhaust shroud; a crack in the
// exhaust inside the shroud lets fumes into the cabin; CO LVL HIGH comes on at 50 ppm or more; checklist: CABIN HT OFF, CABIN
// AIR ON, vents OPEN, windows OPEN (163 KIAS max), and if it stays on, land as soon as practical. The ppm values are
// illustrative; only the 50 ppm alarm point is from the POH.
import { chips, row } from "./base.js?v=093801d129";
import { h } from "../core/util.js?v=093801d129";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=093801d129";
import { anim, COL } from "./dial.js?v=093801d129";
const ALARM = 50;
export function mount(host) {
  let heat = true, air = false, vents = false, crack = false, ppm = 0;
  const S = pxScene(host, { cls: "tall cabinheat", corners: { tl: "Cabin heat and CO", tr: "PHAK 7 · POH 3, 7" } }, draw);
  const hc = chips(row(S.F.ctrl, "Cabin heat"), [["on", "Heat on"], ["off", "Heat off"]], "on", (k) => { heat = k !== "off"; upd(); }, { label: "Cabin heat" });
  const ac = chips(row(S.F.ctrl, "Fresh air"), [["off", "Closed"], ["on", "Cabin air on"], ["all", "Plus vents and windows"]], "off", (k) => { air = k === "on" || k === "all"; vents = k === "all"; upd(); }, { label: "Fresh air" });
  const r3 = row(S.F.ctrl, "Muffler"); const g3 = h("div", { class: "chips", role: "group", "aria-label": "Muffler" }); r3.append(g3);
  const kb = h("button", { class: "chip", type: "button" }, "Crack the muffler"), cl = h("button", { class: "chip", type: "button" }, "Run CO checklist"); g3.append(kb, cl);
  kb.addEventListener("click", () => { crack = !crack; upd(); });
  cl.addEventListener("click", () => { heat = false; air = true; vents = true; hc.set("off"); ac.set("all"); upd(); });
  const target = () => (crack && heat ? 140 * (air ? 0.7 : 1) * (vents ? 0.4 : 1) : crack ? (vents ? 4 : air ? 10 : 20) : 0);
  const A = anim(S.F, (dt) => { const t = target(); if (Math.abs(ppm - t) < 0.5) { ppm = t; S.redraw(); return false; } ppm += (t - ppm) * Math.min(1, dt * 0.8); S.redraw(); return true; });
  function upd() { kb.textContent = crack ? "Fix the muffler" : "Crack the muffler"; kb.classList.toggle("on", crack); S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const wide = W >= 600, x0 = wide ? 30 : 12, w = W - 2 * x0, y = top + (wide ? 70 : 50), bh = wide ? 56 : 48, gap = w / 4;
    const box = (i, a, b, on, col) => { const x = x0 + i * gap + 4, bw = gap - (wide ? 30 : 14); R(g, x, y, bw, bh, { rx: 6, stroke: on ? col : DIM, sw: 1.5, fill: "#141416" }); T(g, x + bw / 2, y + bh / 2 - 2, a, { size: 11, anchor: "middle", fill: on ? INK : GRAY }); if (b) T(g, x + bw / 2, y + bh / 2 + 13, b, { size: 11, anchor: "middle", fill: GRAY }); return x + bw; };
    const hot = COL.yellow, bad = crack && heat;
    const e0 = box(0, "OUTSIDE", "AIR", true, ACC), e1 = box(1, "MUFFLER", "SHROUD", heat, bad ? COL.red : hot), e2 = box(2, wide ? "CABIN HEAT" : "HEAT", heat ? "OPEN" : "SHUT", heat, bad ? COL.red : hot), e3 = box(3, "CABIN", "", true, ACC);
    [[e0, 1, heat], [e1, 2, heat], [e2, 3, heat]].forEach(([xa, i, on]) => L(g, xa + 2, y + bh / 2, x0 + i * gap + 2, y + bh / 2, { stroke: on ? (bad && i > 1 ? COL.red : i > 1 ? hot : ACC) : DIM, w: on ? 3 : 1.2, arrow: on }));
    // exhaust pipe through the shroud, with an optional crack
    const mx = x0 + gap + 4, mw = gap - (wide ? 30 : 14); L(g, mx + 6, y + bh + 14, mx + mw - 6, y + bh + 14, { stroke: GRAY, w: 6 }); T(g, mx + mw / 2, y + bh + 36, "exhaust", { size: 11, anchor: "middle", fill: GRAY });
    if (crack) { P(g, `M${mx + mw / 2 - 6},${y + bh + 10} l4,4 l-3,3 l5,4`, { stroke: COL.red, w: 2 }); }
    if (bad) { for (let i = 0; i < 2; i++) { const x = x0 + (i + 2) * gap - 13; C(g, x, y + bh / 2 - 12, 3, { fill: COL.red }); C(g, x - 7, y + bh / 2 - 18, 2.5, { fill: COL.red }); } for (let i = 0; i < 3; i++) C(g, x0 + 3 * gap + 18 + i * 10, y + bh - 10 - (i % 2) * 5, 2.5, { fill: COL.red }); }
    // fresh air and defrost
    const cx = x0 + 3 * gap + 4, cw = gap - (wide ? 30 : 14);
    L(g, cx + cw / 2, y - 36, cx + cw / 2, y - 4, { stroke: air ? ACC : DIM, w: air ? 3 : 1.2, arrow: air }); T(g, wide ? cx + cw / 2 : cx + cw, y - 42, air ? "fresh air" : "cabin air closed", { size: 11, anchor: wide ? "middle" : "end", fill: air ? ACC : GRAY });
    L(g, cx + cw / 2, y + bh + 4, cx + cw / 2, y + bh + 30, { stroke: heat ? hot : DIM, w: heat ? 2 : 1, arrow: heat }); T(g, cx + cw / 2, y + bh + 44, "defroster", { size: 11, anchor: "middle", fill: GRAY });
    // CO detector
    const dy = y + bh + 74, alarm = ppm >= ALARM, dw = Math.min(w, 300);
    R(g, x0, dy, dw, 60, { rx: 8, fill: "#0A0A0B", stroke: alarm ? COL.red : GRAY, sw: 1.4 });
    T(g, x0 + 12, dy + 20, "CO DETECTOR", { size: 11, fill: GRAY }); T(g, x0 + 12, dy + 46, `${Math.round(ppm)} ppm`, { size: 18, weight: 700, fill: alarm ? COL.red : INK, mono: false });
    if (alarm) T(g, x0 + dw - 12, dy + 46, "CO LVL HIGH", { size: 12, weight: 700, anchor: "end", fill: COL.red });
    T(g, x0 + dw + 14, dy + 46, wide ? `alarm at ${ALARM} ppm` : "", { size: 11, fill: GRAY });
    let cap;
    if (alarm) cap = ["Carbon monoxide", "Exhaust is leaking into the heated air. Heat off, cabin air on, vents and windows open."];
    else if (crack && heat) cap = ["CO rising", "A cracked muffler lets exhaust into the shroud air. Carbon monoxide has no smell or color."];
    else if (crack) cap = ["Heat off, air in", "Fresh air is flushing the cabin. If the alarm or the symptoms stay, land as soon as practical."];
    else if (heat) cap = ["Cabin heat on", "Outside air warms around the exhaust muffler, then flows into the cabin and the defroster."];
    else cap = ["Cabin heat off", "The cabin heat valve is closed. Fresh air still comes in through the cabin air knob and vents."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>The alarm point is the G1000 172S POH's (50 ppm); the ppm readings are illustrations. Your airplane's POH has its own checklist.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
