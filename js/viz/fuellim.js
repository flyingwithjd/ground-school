// Fuel limitations, 172S POH Sec 2 (standard tanks): 28.0 gal per tank, 26.5 usable, 1.5 unusable each (3.0 total);
// take off and land on BOTH; LEFT or RIGHT for level flight only; with one tank dry, slips or skids 30 s max;
// at 1/4 tank or less, no prolonged uncoordinated flight on LEFT or RIGHT; fuel below the gauge's red 0 can't be used.
// POH Sec 3/4: an engine-driven pump failure drops fuel flow to zero and the engine quits even with fuel; aux pump ON restores it.
import { chips, slider, row } from "./base.js?v=0134b87946";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC, ACCF } from "./kit.js?v=0134b87946";
import { anim, COL } from "./dial.js?v=0134b87946";
const CAP = 28, UNUSE = 1.5, Q = (CAP - UNUSE) / 4;
// pure: what the pilot sees for a configuration
export function fuelState({ qL, qR, sel, flight, edp, aux, t = 0 }) {
  const feed = sel === "BOTH" ? ["L", "R"] : [sel[0]], q = { L: qL, R: qR }, wet = feed.filter((k) => q[k] > UNUSE + 0.01);
  const pump = edp || aux, run = wet.length > 0 && pump;
  let warn = null;
  if (!wet.length) warn = ["starve", "Engine quit: fuel starvation", "The selected tank is at its unusable fuel. Switch to a tank with fuel."];
  else if (!pump) warn = ["edp", "Engine quit: fuel flow zero", "The engine-driven pump failed. Aux fuel pump ON restores fuel flow; land as soon as practical."];
  else if (flight === "to" && sel !== "BOTH") warn = ["both", "Limitation: BOTH for takeoff and landing", "Set the selector to BOTH."];
  else if (sel !== "BOTH" && flight !== "level") warn = ["level", "Limitation: LEFT or RIGHT for level flight only", flight === "slip" && q[sel[0]] - UNUSE <= Q ? "And with 1/4 tank or less, prolonged uncoordinated flight on one tank is prohibited." : "Go back to BOTH for climbs, descents and maneuvering."];
  else if (flight === "slip" && sel === "BOTH" && (qL <= UNUSE + 0.01 || qR <= UNUSE + 0.01)) warn = t >= 30 ? ["dry", "30 seconds: limit reached", "With one tank dry, slips and skids are limited to 30 seconds. Coordinate now."] : ["dry", "One tank dry, slipping", "Limit: 30 seconds. The timer is running."];
  return { feed, wet, run, warn };
}
export function mount(host) {
  let qL = 20, qR = 20, sel = "BOTH", flight = "level", edp = true, aux = false, t = 0;
  const S = pxScene(host, { cls: "xtall fuellim", corners: { tl: "Fuel limitations · 172S", tr: "POH 2, 3" } }, draw);
  const r0 = row(S.F.ctrl, "Selector"); chips(r0, ["BOTH", "LEFT", "RIGHT"], sel, (v) => { sel = v || "BOTH"; upd(); }, { label: "Selector" });
  const r1 = row(S.F.ctrl, "Flight"); chips(r1, [["to", "Takeoff, landing"], ["level", "Level cruise"], ["slip", "Slip or skid"]], flight, (v) => { flight = v || "level"; t = 0; upd(); }, { label: "Flight" });
  const r2 = row(S.F.ctrl, "Fuel"); slider(r2, { label: "Left tank", min: 0, max: CAP, step: 0.5, value: qL, fmt: (v) => v.toFixed(1) + " gal", oninput: (v) => { qL = v; t = 0; upd(); } });
  slider(r2, { label: "Right tank", min: 0, max: CAP, step: 0.5, value: qR, fmt: (v) => v.toFixed(1) + " gal", oninput: (v) => { qR = v; t = 0; upd(); } });
  const r3 = row(S.F.ctrl, "Pumps"); chips(r3, [["fail", "Engine pump fails"]], null, (v) => { edp = v !== "fail"; upd(); }, { label: "Engine-driven pump", toggle: true });
  chips(r3, [["on", "Aux pump ON"]], null, (v) => { aux = v === "on"; upd(); }, { label: "Aux fuel pump", toggle: true });
  const A = anim(S.F, (dt) => { const st = fuelState({ qL, qR, sel, flight, edp, aux, t }); if (!(st.warn && st.warn[0] === "dry") || t >= 30) return false; t = Math.min(30, t + dt); S.redraw(); return t < 30; });
  function upd() { S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const ph = S.phone, st = fuelState({ qL, qR, sel, flight, edp, aux, t }), w = st.warn ? st.warn[0] : null;
    const tw = Math.min(110, W * 0.2), ty = top + 26, th = Math.min(190, (H - top) * 0.42, H - ty - 66 - 22 - 40 - 88 - 40), cx = W / 2;
    const tank = (k, x, q) => { const on = st.feed.includes(k), fy = (v) => ty + th - (v / CAP) * th;
      T(g, x + tw / 2, ty - 10, k === "L" ? "Left tank" : "Right tank", { size: 11, anchor: "middle", fill: on ? INK : GRAY });
      R(g, x, ty, tw, th, { stroke: on ? INK : GRAY, sw: 1.4, rx: 6 });
      R(g, x + 2, fy(q), tw - 4, Math.max(0, ty + th - 2 - fy(q)), { fill: q > UNUSE ? (on ? "rgba(59,130,246,.35)" : "rgba(242,241,236,.12)") : "rgba(242,241,236,.08)" });
      for (let i = 0; i < 6; i++) L(g, x + 4 + i * ((tw - 8) / 6), ty + th - 2, x + 4 + (i + 1) * ((tw - 8) / 6), fy(UNUSE), { stroke: DIM, w: 1 });
      L(g, x - 6, fy(UNUSE), x + tw + 6, fy(UNUSE), { stroke: COL.red, w: 2 }); L(g, x - 6, fy(UNUSE + Q), x + 4, fy(UNUSE + Q), { stroke: GRAY, w: 1.4 });
      T(g, k === "L" ? x - 10 : x + tw + 10, fy(UNUSE) + 4, "0", { size: 11, anchor: k === "L" ? "end" : "start", fill: COL.red });
      T(g, k === "L" ? x - 10 : x + tw + 10, fy(UNUSE + Q) + 4, "¼", { size: 11, anchor: k === "L" ? "end" : "start", fill: GRAY });
      T(g, x + tw / 2, ty + th + 18, "usable " + Math.max(0, q - UNUSE).toFixed(1), { size: 11, anchor: "middle", fill: q > UNUSE ? INK : COL.red });
      return [x + tw / 2, ty + th]; };
    const pad = ph ? 22 : 44, [lx, lb] = tank("L", pad, qL), [rx] = tank("R", W - pad - tw, qR);
    // selector valve
    const sy = ty + th + 66, sr = 22; const fl = (k) => st.feed.includes(k) && (k === "L" ? qL : qR) > UNUSE;
    P(g, `M${lx},${lb} L${lx},${sy} L${cx - sr},${sy}`, { stroke: fl("L") && st.run ? ACC : DIM, w: fl("L") && st.run ? 3 : 1.5 });
    P(g, `M${rx},${lb} L${rx},${sy} L${cx + sr},${sy}`, { stroke: fl("R") && st.run ? ACC : DIM, w: fl("R") && st.run ? 3 : 1.5 });
    C(g, cx, sy, sr, { fill: "#0A0A0B", stroke: INK, sw: 1.6 }); const pa = sel === "BOTH" ? 0 : sel === "LEFT" ? -90 : 90;
    const pr = (pa * Math.PI) / 180; L(g, cx, sy, cx + Math.sin(pr) * (sr - 5), sy - Math.cos(pr) * (sr - 5), { stroke: ACC, w: 4 });
    T(g, cx, sy - sr - 8, sel, { size: 11, anchor: "middle", fill: ACC, weight: 700 });
    // pumps and engine chain
    const yAux = sy + sr + 40, yEdp = yAux + 44, yEng = yEdp + 44, bw = Math.min(170, W * 0.42);
    const box = (y, label, on, bad) => { R(g, cx - bw / 2, y - 14, bw, 28, { fill: "#0A0A0B", rx: 6 }); R(g, cx - bw / 2, y - 14, bw, 28, { stroke: bad ? COL.red : on ? ACC : GRAY, sw: on || bad ? 2 : 1.2, rx: 6, fill: on ? ACCF : "none" }); T(g, cx, y + 4, label, { size: 11, anchor: "middle", fill: bad ? COL.red : on ? INK : GRAY }); };
    L(g, cx, sy + sr, cx, yEng - 14, { stroke: st.run ? ACC : DIM, w: st.run ? 3 : 1.5 });
    box(yAux, aux ? "aux pump ON" : "aux pump off", aux, false);
    box(yEdp, edp ? "engine-driven pump" : "engine pump failed", edp && st.run, !edp);
    box(yEng, st.run ? "engine running" : "engine stopped", st.run, !st.run);
    // slip ball + timer
    if (flight === "slip") { const bx = ph ? pad + 30 : pad + tw / 2, by = yEdp; P(g, `M${bx - 34},${by - 8} Q${bx},${by + 14} ${bx + 34},${by - 8}`, { stroke: GRAY, w: 1.4 });
      C(g, bx + 18, by + 0, 7, { fill: INK }); T(g, bx, by + 32, "slip", { size: 11, anchor: "middle", fill: GRAY });
      if (w === "dry") { const tx = ph ? W - pad - 30 : W - pad - tw / 2, rr = 22, a = (t / 30) * 2 * Math.PI; C(g, tx, by, rr, { stroke: DIM, sw: 3 });
        if (t > 0) P(g, `M${tx},${by - rr} A${rr},${rr} 0 ${a > Math.PI ? 1 : 0} 1 ${tx + Math.sin(a) * rr},${by - Math.cos(a) * rr}`, { stroke: t >= 30 ? COL.red : COL.yellow, w: 3 });
        T(g, tx, by + 4, Math.floor(t) + " s", { size: 11, anchor: "middle", fill: INK }); } }
    const cap = st.warn ? st.warn.slice(1) : sel === "BOTH" ? ["Within limits", "BOTH feeds from both tanks. Use it for takeoff, landing and maneuvering."] : ["Within limits", "One tank in level flight is fine. Watch the balance between tanks."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>Each tank holds 28 gallons; the hatched 1.5 gallons below the red 0 line are unusable. Grades: 100LL (blue) or 100 (green). Your airplane's POH has the limits for its tanks.</p>`);
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
