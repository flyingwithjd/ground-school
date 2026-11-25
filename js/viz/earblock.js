// Ear block (PHAK FAA-H-8083-25C ch 17; AIM 8-1-2): a simple ear cross-section. Climbing, the middle-ear air vents
// through the Eustachian tube on its own; descending, higher outside pressure pushes the eardrum in and holds the tube
// shut; the Valsalva maneuver pushes air up the tube to equalize. Static scene.
import { chips, row } from "./base.js?v=4d40905da2";
import { pxScene, T, L, P, C, ACC, INK, GRAY } from "./kit.js?v=4d40905da2";
const M = {
  climb: ["Climbing", "Air escapes on its own", "As you climb, outside pressure drops. The higher pressure in the middle ear vents out through the Eustachian tube, usually without you noticing."],
  desc: ["Descending", "Eardrum pushed in, tube held shut", "Outside pressure rises and pushes the eardrum inward. The lower pressure in the middle ear tends to hold the tube closed, so this is the painful direction. Swallow, yawn or tense your throat early and often."],
  vals: ["Valsalva", "Air pushed up the tube", "Close your mouth, pinch your nose and blow gently. Air is forced up the Eustachian tube into the middle ear and equalizes it. If that doesn't work, a cold or allergy may be blocking the tube."],
};
export function mount(host) {
  let mo = "desc";
  const S = pxScene(host, { cls: "ear", corners: { tl: "Middle ear · simplified", tr: "PHAK 17 · AIM 8-1-2" } }, draw);
  chips(row(S.F.ctrl), Object.entries(M).map(([k, v]) => [k, v[0]]), mo, (v) => { mo = v || mo; S.redraw(); }, { label: "Phase" });
  function draw(g, W, H, top) {
    const ph = W < 520, cx = W * (ph ? 0.56 : 0.42), cy = top + (H - top) * 0.4, k = Math.min(W * (ph ? 0.15 : 0.12), (H - top) * 0.26);
    // ear canal (left), eardrum, middle ear chamber, Eustachian tube down to the throat
    P(g, `M${cx - k * 2.6},${cy - k * 0.35} H${cx - k * 0.75} M${cx - k * 2.6},${cy + k * 0.35} H${cx - k * 0.75}`, { stroke: INK, w: 2 });
    T(g, cx - k * 2.6, cy - k * 0.5, "ear canal", { size: 11, fill: GRAY });
    const bow = mo === "desc" ? k * 0.28 : mo === "climb" ? -k * 0.12 : 0;
    P(g, `M${cx - k * 0.7},${cy - k * 0.55} Q${cx - k * 0.7 + bow * 2},${cy} ${cx - k * 0.7},${cy + k * 0.55}`, { stroke: ACC, w: 3.2 });
    T(g, cx - k * 0.1, cy - k * 1.05, "eardrum", { size: 11, fill: INK, anchor: "end" });
    P(g, `M${cx - k * 0.7},${cy - k * 0.55} Q${cx},${cy - k * 1.1} ${cx + k * 0.8},${cy - k * 0.4} Q${cx + k * 1.0},${cy + k * 0.4} ${cx + k * 0.25},${cy + k * 0.6} L${cx - k * 0.7},${cy + k * 0.55}`, { stroke: INK, w: 2, fill: "rgba(242,241,236,.04)" });
    T(g, cx + k * 0.95, cy - k * 0.5, "middle ear", { size: 11, fill: GRAY });
    const open = mo !== "desc";
    P(g, `M${cx + k * 0.25},${cy + k * 0.6} Q${cx + k * 0.6},${cy + k * 1.4} ${cx + k * 1.4},${cy + k * 1.9}`, { stroke: INK, w: 2, dash: open ? null : "2 6" });
    P(g, `M${cx + k * 0.55},${cy + k * 0.55} Q${cx + k * 0.9},${cy + k * 1.25} ${cx + k * 1.65},${cy + k * 1.7}`, { stroke: INK, w: 2, dash: open ? null : "2 6" });
    T(g, cx + k * 1.65, cy + k * 2.15, "Eustachian tube → throat", { size: 11, fill: GRAY, anchor: "end" });
    if (mo === "climb") P(g, `M${cx + k * 0.45},${cy + k * 0.75} Q${cx + k * 0.8},${cy + k * 1.35} ${cx + k * 1.4},${cy + k * 1.65}`, { stroke: ACC, w: 2, arrow: true });
    if (mo === "vals") P(g, `M${cx + k * 1.4},${cy + k * 1.65} Q${cx + k * 0.8},${cy + k * 1.35} ${cx + k * 0.45},${cy + k * 0.75}`, { stroke: ACC, w: 2, arrow: true });
    if (mo === "desc") { for (const dy of [-0.25, 0, 0.25]) L(g, cx - k * 1.9, cy + dy * k, cx - k * 1.0, cy + dy * k, { stroke: ACC, w: 2, arrow: true }); T(g, cx - k * 2.6, cy + k * 1.0, "higher pressure", { size: 11, fill: INK }); }
    S.F.caption(M[mo][1], M[mo][0]);
    S.F.explain(`${M[mo][2]} <span class="src">PHAK 17 · AIM 8-1-2</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
