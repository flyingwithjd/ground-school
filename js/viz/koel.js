// Kinds of operation: an example operating-limitations placard (tap each line) and a go/no-go check for a planned flight.
// Pick the flight (day VFR, night VFR, IFR, into known icing) and an inoperative item, and see whether the POH kinds of
// operation, the required equipment (14 CFR 91.205(b), (c), (d) and the equipment list/KOEL) and 91.213(d) allow it.
// Facts: a POH Section 2 lists the kinds of operation the airplane is approved for and whether flight into known icing is
// prohibited; the placard shows the kinds of operation as equipped at certification; approved is not the same as equipped
// (the equipment for that kind of flight must be installed and working). 91.205(c): position lights at night; 91.205(d):
// gyroscopic attitude indicator for IFR; 91.205(c)(4): a landing light only if operated for hire; 91.213(d): without an
// MEL, inoperative equipment not otherwise required must be removed or deactivated and placarded "Inoperative". The placard
// wording here is an example, not a copy of any airplane's placard.
import { chips, row } from "./base.js?v=2492b958a0";
import { pxScene, T, R, hit, INK, GRAY, DIM, ACC } from "./kit.js?v=2492b958a0";
import { COL } from "./dial.js?v=2492b958a0";
const LINES = [
  ["cat", "NORMAL CATEGORY: NO ACROBATIC", "MANEUVERS, INCLUDING SPINS, APPROVED", "Category limits come from Section 2 of your airplane's POH; the placard repeats the key ones."],
  ["kinds", "KINDS OF OPERATION:", "DAY · NIGHT · VFR · IFR", "What the airplane is approved for. Each kind also needs its required equipment installed and working."],
  ["ice", "FLIGHT INTO KNOWN ICING", "PROHIBITED", "Most trainers aren't certified for icing. If you meet it anyway, exit the icing conditions at once."],
];
const FLIGHT = { day: "Day VFR", night: "Night VFR", ifr: "IFR", ice: "Known icing" };
const ITEM = { none: "Nothing", land: "Landing light", pos: "Position lights", ai: "Attitude indicator" };
export function verdict(f, it) {
  if (f === "ice") return ["Prohibited", "The POH prohibits flight into known icing, whatever ice protection or equipment is installed."];
  if (it === "pos" && f !== "day") return ["No-go", "Position lights are required at night (91.205(c)). Fly by day instead, or get them fixed first."];
  if (it === "ai" && f === "ifr") return ["No-go", "IFR requires a gyroscopic attitude indicator (91.205(d)). Fly VFR instead, or get it fixed first."];
  if (it !== "none") return ["Go, if placarded", "If nothing lists it as required: deactivate or remove it and placard it Inoperative (91.213(d))."];
  return ["Go", "Approved in the POH, and all the equipment this flight requires is installed and working. Go."];
}
export function mount(host) {
  let fl = "day", it = "none", focus = null;
  const S = pxScene(host, { cls: "xtall koel", corners: { tl: "Kinds of operation", tr: "POH 2 · 14 CFR 91.205, 91.213" } }, draw);
  const r0 = row(S.F.ctrl, "Flight"); chips(r0, Object.entries(FLIGHT), fl, (k) => { fl = k || "day"; S.redraw(); }, { label: "Flight" });
  const r1 = row(S.F.ctrl, "Inoperative"); chips(r1, Object.entries(ITEM), it, (k) => { it = k || "none"; S.redraw(); }, { label: "Inoperative" });
  function draw(g, W, H, top) {
    const wide = W >= 600, px = wide ? 28 : 14, pw = Math.min(wide ? W * 0.5 : W - 28, 330), lh = 18, ph0 = 3 * (lh * 2 + 22) + 30, py = wide ? top + Math.max(10, (H - top - ph0) / 2 - 10) : top + 10;
    R(g, px, py, pw, 3 * (lh * 2 + 22) + 30, { fill: "#141416", stroke: GRAY, sw: 1.4, rx: 4 });
    T(g, px + pw / 2, py + 20, "OPERATING LIMITATIONS (EXAMPLE)", { size: 11, anchor: "middle", fill: GRAY });
    LINES.forEach(([k, a, b], i) => { const y = py + 30 + i * (lh * 2 + 22), on = focus === k || (k === "ice" && fl === "ice") || (k === "kinds" && fl !== "ice" && focus == null);
      const z = R(g, px + 8, y, pw - 16, lh * 2 + 14, { fill: on ? "rgba(59,130,246,.16)" : "transparent", stroke: on ? ACC : "none", sw: 1.2, rx: 4 });
      T(g, px + 16, y + 18, a, { size: 11, fill: on ? INK : GRAY, weight: 600 }); T(g, px + 16, y + 18 + lh, b, { size: 11, fill: on ? INK : GRAY, weight: 600 });
      hit(g, z, a + " " + b, () => { focus = focus === k ? null : k; S.redraw(); }); });
    // checklist for the planned flight
    const cx = wide ? px + pw + 28 : px, cy0 = wide ? py + 4 : py + 3 * (lh * 2 + 22) + 58, cw = wide ? W - cx - 20 : W - 28;
    const ok = (b) => (b ? COL.green : COL.red);
    const apr = fl !== "ice", req = !(it === "pos" && (fl === "night")) && !(it === "ai" && fl === "ifr");
    const rows = [["POH kinds of operation", apr ? "approved" : "prohibited", apr],
      ["Required equipment", { day: "91.205(b)", night: "91.205(b) + (c)", ifr: "91.205(b) + (d)", ice: "—" }[fl], apr],
      ["Inoperative item", it === "none" ? "none" : !apr ? "—" : req ? "placard it" : "required", it === "none" || req]];
    T(g, cx, cy0 + 12, FLIGHT[fl].toUpperCase(), { size: 12, fill: ACC, weight: 700 });
    rows.forEach(([a, b, good], i) => { const y = cy0 + 40 + i * 40; T(g, cx, y, a, { size: 11, fill: GRAY }); T(g, cx, y + 17, b, { size: 13, fill: ok(good), weight: 600 }); });
    const v = verdict(fl, it), L0 = focus ? LINES.find((l) => l[0] === focus) : null;
    S.F.caption(L0 ? "Placard" : v[0], L0 ? L0[3] : v[1]);
  }
  S.F.explain(`<p>Tap a placard line. Your airplane's POH Section 2 lists its approved kinds of operation, and its equipment list or KOEL says what each one needs.</p>`);
  return { destroy: () => S.F.destroy() };
}
