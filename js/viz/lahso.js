// Land and hold short (AIM 4-3-11): plan view of a runway with a crossing runway. Set the landing distance your POH gives
// for today and who's flying; see whether it fits the Available Landing Distance (ALD) to the hold-short point.
// Schematic, not to scale; the 2,800 ft ALD is an example (real ALDs are in the Chart Supplement). Static scene.
import { slider, chips } from "./base.js?v=c153ca6f67";
import { pxScene, T, L, R, P, planeTop, wrapT, ACC, INK, GRAY, DIM, ACCF } from "./kit.js?v=c153ca6f67";
const ALD = 2800, RWY = 6000;
export function mount(host) {
  let dist = 1900, who = "pvt";
  const S = pxScene(host, { cls: "tall", corners: { tl: "Land and hold short", tr: "Example ALD 2,800 ft" } }, draw);
  slider(S.F.ctrl, { label: "Stop distance", min: 1200, max: 4000, step: 100, value: dist, fmt: (v) => v.toLocaleString() + " ft", oninput: (v) => { dist = v; S.redraw(); } });
  chips(S.F.ctrl, [["pvt", "Rated pilot, knows LAHSO"], ["stu", "Student pilot"]], who, (v) => { who = v; S.redraw(); }, { label: "Who's flying" });
  function draw(g, W, H, top) {
    const ph = W < 520, rw = ph ? 40 : 52, rx = ph ? W * 0.3 : W * 0.32, y1 = H - 20, y0 = top + 6, Y = (ft) => y1 - (ft / RWY) * (y1 - y0);
    const stu = who === "stu", fits = dist <= ALD, ok = !stu && dist <= ALD - 300, hy = Y(ALD), xy = Y(ALD + 450);
    // crossing runway, then the landing runway on top
    R(g, 16, xy - rw / 2, W - 32, rw, { fill: "#141416", stroke: INK, sw: 1.3 });
    R(g, rx - rw / 2, y0, rw, y1 - y0, { fill: "#141416", stroke: INK, sw: 1.5 });
    for (let f = 300; f < RWY - 200; f += 400) if (Math.abs(Y(f) - xy) > rw / 2 + 8) L(g, rx, Y(f), rx, Y(f + 200), { stroke: DIM, w: 2 });
    T(g, rx + rw / 2 + 10, y1 - 4, "LANDING RWY", { size: 11, fill: GRAY }); T(g, W - 20, xy - rw / 2 - 8, "CROSSING RWY", { size: 11, anchor: "end", fill: GRAY });
    // taxiway exit before the hold-short point
    const ty = Y(2000); P(g, `M${rx + rw / 2},${ty + 14} L${rx + rw / 2 + 56},${ty - 10} M${rx + rw / 2},${ty - 4} L${rx + rw / 2 + 50},${ty - 26}`, { stroke: GRAY, w: 1.4 }); T(g, rx + rw / 2 + 62, ty - 12, "TWY", { size: 11, fill: GRAY });
    // hold-short bar (blue = the focus) and the ALD bracket
    R(g, rx - rw / 2, hy - 4, rw, 8, { fill: ACC });
    T(g, rx + rw / 2 + 10, hy + 4, "HOLD SHORT", { size: 11, fill: ACC, weight: 700 });
    const bx = rx - rw / 2 - 14; L(g, bx, y1 - 4, bx, hy, { stroke: ACC, w: 1.5 }); L(g, bx - 5, hy, bx + 5, hy, { stroke: ACC, w: 1.5 }); L(g, bx - 5, y1 - 4, bx + 5, y1 - 4, { stroke: ACC, w: 1.5 });
    const ly = (hy + y1) / 2; T(g, bx - 8, ly, "ALD", { size: 11, anchor: "end", fill: ACC, weight: 700 }); T(g, bx - 8, ly + 15, "2,800", { size: 11, anchor: "end", fill: ACC });
    // the landing: touchdown near the threshold, roll to the stop point
    const td = 300, sy = Y(dist);
    L(g, rx, Y(td), rx, sy, { stroke: stu ? DIM : fits ? INK : GRAY, w: 2.5, dash: fits ? null : "6 5" });
    planeTop(g, rx, sy - 4, 0, ph ? 26 : 32, { stroke: stu ? DIM : fits ? INK : GRAY, fill: "#0A0A0B" });
    planeTop(g, W - 50, xy, -90, ph ? 24 : 30, { stroke: GRAY, fill: "#0A0A0B" });
    // verdict card on the right
    const cx = rx + rw / 2 + (ph ? 18 : 40), cw = W - 16 - cx, cy = top + 4;
    const head = stu ? "Say \u201Cunable\u201D" : ok ? "You may accept" : "Say \u201Cunable\u201D";
    const body = stu ? "Student pilots should not take part in LAHSO. Ask for the full length or another runway." : ok ? "Read back \u201Chold short of\u201D the runway. Exit at the first convenient taxiway, or stop at the bar." : fits ? "" : "You'd roll past the hold-short point. Ask for the full length, ideally before the clearance.";
    const b2 = !stu && !ok && fits ? "Too tight to be sure. Decline unless you know you can stop." : body;
    T(g, cx, cy + 14, head, { size: ph ? 15 : 17, fill: ok ? ACC : INK, weight: 700, mono: false });
    wrapT(b2, Math.max(14, Math.floor(cw / 7.2))).slice(0, 7).forEach((t, i) => T(g, cx, cy + 38 + i * 18, t, { size: 13, fill: GRAY, mono: false }));
    S.F.caption(`${dist.toLocaleString()} ft vs ALD 2,800 ft`, stu ? "Students: decline" : ok ? "Fits: you may accept" : fits ? "Too tight: decline" : "Doesn't fit: decline");
    S.F.explain(`Accept a LAHSO clearance only if you, as pilot in command, are sure you can land and stop within the ALD, which the Chart Supplement publishes and the controller gives on request. You may always decline; once accepted, comply unless you get an amended clearance or have an emergency. A go-around is still allowed. Leave a margin: POH figures come from a new airplane in ideal conditions. <span class="src">AIM 4-3-11 · PHAK 11</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
