// Starting system: battery -> battery contactor (MASTER) -> bus -> starter contactor (key at START) -> starter motor.
// Hold START to crank; a timer shows the 172S starter duty cycle. A "Starter stays engaged" case shows the warning signs.
// Facts: PHAK 7 (Starting System): battery switch energizes the bus through the battery solenoid (contactor); the starter
// draws from the bus but runs only when the starter switch at START energizes the starter solenoid; releasing START removes
// power; a clutch keeps the running engine from driving the starter. C172S POH 7: MAGNETOS switch spring-loaded START
// with MASTER ON closes the starter contactor; it returns to BOTH when released. C172S POH 4 (NAV III): recommended starter
// duty cycle 10 s cranking then 20 s cool down, repeat two more times, then 10 minutes cool down. AFH 2: a starter that stays
// engaged shows a continuous, very high current draw on the ammeter (some airplanes have a starter-engaged light): shut down.
// The cranking time before the engine catches and the amps are illustrative.
import { chips, row } from "./base.js?v=c8fe6c3cee";
import { h } from "../core/util.js?v=c8fe6c3cee";
import { pxScene, T, L, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=c8fe6c3cee";
import { anim, COL } from "./dial.js?v=c8fe6c3cee";
const CASES = { normal: "Normal start", nostart: "Won't start", stuck: "Starter stays engaged" };
export function mount(host) {
  let cs = "normal", master = false, hold = false, crank = 0, cool = 0, cycles = 0, running = false, spun = 0, t = 0, over = false;
  const S = pxScene(host, { cls: "tall starter", corners: { tl: "Starting system", tr: "PHAK 7 · POH 4, 7" } }, draw);
  chips(row(S.F.ctrl, "Case"), Object.entries(CASES), cs, (k) => { cs = k || "normal"; reset(); }, { label: "Case" });
  const r1 = row(S.F.ctrl, "Switches"); const g1 = h("div", { class: "chips", role: "group", "aria-label": "Switches" }); r1.append(g1);
  const mb = h("button", { class: "chip", type: "button" }, "Master ON"), sb = h("button", { class: "chip", type: "button" }, "Hold START"), xb = h("button", { class: "chip", type: "button" }, "Shut down / reset");
  g1.append(mb, sb, xb);
  mb.addEventListener("click", () => { master = !master; if (!master) hold = false; upd(); });
  const down = (e) => { e.preventDefault(); if (sb.disabled) return; hold = true; upd(); }, up = () => { if (!hold) return; hold = false; if (crank > 0) { cycles++; cool = 20; } upd(); };
  sb.addEventListener("pointerdown", down); ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => sb.addEventListener(ev, up));
  sb.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) down(e); }); sb.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") up(); });
  xb.addEventListener("click", () => reset());
  function reset() { master = false; hold = false; crank = 0; cool = 0; cycles = 0; running = false; spun = 0; over = false; upd(); }
  const A = anim(S.F, (dt) => { t += dt; let more = false;
    if (hold && master) { crank += dt; spun += dt; more = true; if (crank > 10) over = true;
      if (cs !== "nostart" && spun > 2.5) { running = true; if (cs !== "stuck") { hold = false; cycles++; crank = 0; } } }
    else if (cool > 0) { cool = Math.max(0, cool - dt); if (cool === 0) { crank = 0; over = false; } more = true; }
    if (running && cs === "stuck" && master) more = true;
    S.redraw(); return more; });
  function upd() { mb.classList.toggle("on", master); mb.textContent = master ? "Master ON" : "Master OFF"; sb.classList.toggle("on", hold); S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const wide = W >= 600, y0 = top + (wide ? 60 : 40), sx = wide ? 40 : 36, span = (wide ? Math.min(W - 80, 640) : W - 72), dx = span / 4;
    sb.disabled = !master || running || cool > 0 || cycles >= 3;
    const stuck = cs === "stuck" && running && master, starterOn = (hold && master) || stuck, busOn = master;
    const nodes = [["BATTERY", "24 V"], ["BATTERY", "CONTACTOR"], ["BUS", ""], ["STARTER", "CONTACTOR"], ["STARTER", "MOTOR"]];
    const live = [true, busOn, busOn, starterOn, starterOn];
    nodes.forEach(([a, b], i) => { const x = sx + i * dx, on = live[i];
      if (i) L(g, x - dx + 22, y0, x - 22, y0, { stroke: on ? ACC : DIM, w: on ? 3 : 1.5 });
      C(g, x, y0, 20, { stroke: on ? ACC : GRAY, sw: 2, fill: "#141416" });
      if (i === 4) { const ang = starterOn ? t * 20 : 0; L(g, x, y0, x + Math.cos(ang) * 14, y0 + Math.sin(ang) * 14, { stroke: on ? ACC : GRAY, w: 2 }); }
      if (i === 1 || i === 3) L(g, x - 10, y0 + (on ? 0 : -6), x + 10, y0, { stroke: on ? ACC : GRAY, w: 2 });
      T(g, x, y0 + 40, a, { size: 11, anchor: "middle", fill: GRAY }); if (b) T(g, x, y0 + 55, b, { size: 11, anchor: "middle", fill: GRAY }); });
    T(g, sx + dx, y0 - 32, "MASTER", { size: 11, anchor: "middle", fill: master ? ACC : DIM }); T(g, sx + 3 * dx, y0 - 32, "KEY AT START", { size: 11, anchor: "middle", fill: hold ? ACC : DIM });
    // ammeter-style load and the duty-cycle bars
    const by = y0 + 90, bw = Math.min(span, 420);
    const amps = stuck ? 1 : starterOn ? 0.85 : running ? 0.15 : 0;
    T(g, sx, by, "STARTER CURRENT", { size: 11, fill: GRAY }); R(g, sx, by + 8, bw, 10, { stroke: DIM, sw: 1 }); R(g, sx, by + 8, bw * amps, 10, { fill: stuck ? COL.red : ACC });
    T(g, sx, by + 44, "CRANKING (10 s max)", { size: 11, fill: GRAY }); R(g, sx, by + 52, bw, 10, { stroke: DIM, sw: 1 }); R(g, sx, by + 52, bw * Math.min(1, crank / 10), 10, { fill: over ? COL.red : COL.green });
    T(g, sx, by + 88, "COOL DOWN (20 s)", { size: 11, fill: GRAY }); R(g, sx, by + 96, bw, 10, { stroke: DIM, sw: 1 }); R(g, sx, by + 96, bw * (cool / 20), 10, { fill: COL.cyan });
    T(g, sx + bw, by + 88, `cycle ${Math.min(cycles, 3)} of 3`, { size: 11, anchor: "end", fill: GRAY });
    T(g, sx, by + 130, running ? "ENGINE RUNNING" : "ENGINE STOPPED", { size: 12, weight: 700, fill: running ? COL.green : GRAY });
    let cap;
    if (stuck) cap = ["Starter stays engaged", "A continuous, very high current on the ammeter after start means the starter is still engaged: shut down now."];
    else if (over) cap = ["Past 10 seconds", "Release START. The starter isn't built for long cranking: let it cool 20 seconds before the next try."];
    else if (cycles >= 3 && !running) cap = ["Three tries", "After three 10-second tries, let the starter cool for ten minutes. If it still won't start, find the cause."];
    else if (cool > 0 && !running) cap = ["Cooling down", "Let the starter cool 20 seconds between tries. Starters overheat quickly when cranked for a long time."];
    else if (running) cap = ["Engine running", "You released START, the key sprang back to BOTH and the starter contactor opened. A clutch protects the starter."];
    else if (hold) cap = ["Cranking", "Key at START closes the starter contactor, and current from the bus spins the starter motor and the engine."];
    else if (master) cap = ["Master on", "The battery contactor connects the battery to the bus. The starter still needs the key at START to run."];
    else cap = ["Master off", "Nothing is powered. Turn the master on, clear the prop, then press and hold START to crank the engine."];
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>The duty cycle is the 172S POH's: 10 seconds of cranking, 20 seconds of cooling, three times, then ten minutes. Your airplane's POH may differ. Currents and the time to start are illustrations.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
