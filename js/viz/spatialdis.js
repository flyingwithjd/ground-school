// Spatial disorientation (PHAK FAA-H-8083-25C ch 17; AIM 8-1-5): what the airplane is really doing beside what your
// inner ear tells you, for four vestibular illusions, with the wrong reaction and the fix. Static scene.
import { chips, row } from "./base.js?v=d5b31b47a9";
import { pxScene, T, L, C, P, ACC, INK, GRAY } from "./kit.js?v=d5b31b47a9";
const D = Math.PI / 180;
// view: "rear" (bank) or "side" (pitch). real/felt: angle in degrees (+ = right wing down, or nose up). note: small tag under the panel.
const IL = {
  leans: { n: "The leans", view: "rear", real: 0, felt: -15, rn: "wings level", fn: "banked left",
    cap: "You just rolled out of a slow turn", wrong: "You lean or roll right to “level” and start a turn again.",
    why: "A slow roll into a turn, below about 2° per second, never reached your inner ear. When you rolled level again, the ear only sensed that roll and reports a bank the other way." },
  spiral: { n: "Graveyard spiral", view: "rear", real: 30, felt: 0, rn: "30° bank, descending", fn: "wings level",
    cap: "Long coordinated turn: the turning feeling has faded", wrong: "You see altitude dropping and pull back, which only tightens the descending turn.",
    why: "After several seconds of steady turning, the fluid in the canals moves with you and the feeling stops. Level the wings by the attitude indicator first, then raise the nose." },
  coriolis: { n: "Coriolis", view: "rear", real: 20, felt: "tumble", rn: "steady 20° bank", fn: "tumbling on a new axis",
    cap: "Long turn, then you move your head", wrong: "Overwhelming tumbling feeling; you make large, wrong control inputs.",
    why: "A head movement in a different plane during a prolonged turn (reaching for a chart, looking down) sets the canal fluid moving on another axis. Keep head movements small in turns and fly the instruments." },
  somato: { n: "Somatogravic", view: "side", real: 0, felt: 15, rn: "level, speeding up", fn: "nose high",
    cap: "Fast acceleration, for example on a dark takeoff", wrong: "You push the nose down toward the ground to correct a climb that isn't there.",
    why: "The otolith organs can't tell acceleration from tilt: being pressed back in the seat feels like the nose coming up. Deceleration feels like nose down. Hold the takeoff attitude on the instruments." },
};
function plane(g, cx, cy, k, view, ang, col) {
  if (view === "rear") { const a = ang * D, ca = Math.cos(a), sa = Math.sin(a), r = (x, y) => [cx + x * ca - y * sa, cy + x * sa + y * ca];
    L(g, ...r(-k, 0), ...r(k, 0), { stroke: col, w: 3 }); C(g, cx, cy, k * 0.14, { fill: "#111113", stroke: col, sw: 2 });
    L(g, ...r(0, -k * 0.14), ...r(0, -k * 0.5), { stroke: col, w: 2.4 }); L(g, ...r(-k * 0.3, -k * 0.08), ...r(k * 0.3, -k * 0.08), { stroke: col, w: 1.6 }); return; }
  const a = -ang * D, ca = Math.cos(a), sa = Math.sin(a), r = (x, y) => [cx + x * ca - y * sa, cy + x * sa + y * ca], pt = (x, y) => r(x, y).map((v) => v.toFixed(1)).join(",");
  P(g, `M${pt(k, 0)} L${pt(k * 0.7, -k * 0.12)} L${pt(-k * 0.75, -k * 0.08)} L${pt(-k * 0.95, -k * 0.42)} L${pt(-k, -k * 0.42)} L${pt(-k, k * 0.04)} L${pt(k * 0.7, k * 0.1)} Z`, { stroke: col, w: 2, fill: "#111113" });
  L(g, ...r(-k * 0.1, 0), ...r(k * 0.3, 0), { stroke: col, w: 2.4 });
}
export function mount(host) {
  let il = "leans";
  const S = pxScene(host, { cls: "sdis", corners: { tl: "Real vs felt", tr: "PHAK 17" } }, draw);
  chips(row(S.F.ctrl), Object.entries(IL).map(([k, v]) => [k, v.n]), il, (v) => { il = v || il; S.redraw(); }, { label: "Illusion" });
  function draw(g, W, H, top) {
    const u = IL[il], ph = W < 520, pw = W / 2, k = Math.min(pw * 0.32, (H - top) * 0.3), cy = top + (H - top) * 0.5;
    L(g, W / 2, top, W / 2, H - 10, { stroke: "rgba(242,241,236,.15)", w: 1 });
    [["What the airplane is doing", u.rn, u.real, INK], ["What you feel", u.fn, u.felt, ACC]].forEach(([hd, nt, ang, col], i) => {
      const cx = pw * i + pw / 2;
      T(g, cx, top + 6, ph ? (i ? "You feel" : "Really") : hd, { size: 11, fill: GRAY, anchor: "middle" });
      L(g, cx - pw * 0.42, cy, cx + pw * 0.42, cy, { stroke: "rgba(242,241,236,.22)", w: 1, dash: "4 6" });
      if (ang === "tumble") { plane(g, cx, cy, k, "rear", -35, col);
        P(g, `M${cx - k * 0.9},${cy - k * 0.55} A${k * 1.05},${k * 0.8} 0 0 1 ${cx + k * 0.9},${cy - k * 0.55}`, { stroke: col, w: 1.6, arrow: true });
        P(g, `M${cx + k * 0.9},${cy + k * 0.55} A${k * 1.05},${k * 0.8} 0 0 1 ${cx - k * 0.9},${cy + k * 0.55}`, { stroke: col, w: 1.6, arrow: true }); }
      else plane(g, cx, cy, k, u.view, ang, col);
      if (i === 0 && il === "spiral") L(g, cx + k * 1.2, cy - k * 0.2, cx + k * 1.2, cy + k * 0.7, { stroke: INK, w: 1.6, arrow: "kahw" });
      if (i === 0 && il === "somato") L(g, cx - k * 0.3, cy + k * 0.55, cx + k * 0.6, cy + k * 0.55, { stroke: INK, w: 1.6, arrow: "kahw" });
      T(g, cx, H - 14, nt, { size: 11, fill: col === ACC ? INK : GRAY, anchor: "middle" });
    });
    S.F.caption(u.cap, u.n);
    S.F.explain(`<strong>Wrong reaction:</strong> ${u.wrong} ${u.why} <strong>The fix for all of them:</strong> believe the instruments, not your body. <span class="src">PHAK 17 · AIM 8-1-5</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
