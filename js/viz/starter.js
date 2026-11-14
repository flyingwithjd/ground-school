// Starting system: battery -> battery contactor (MASTER) -> bus -> starter contactor (key at START) -> starter motor.
// Hold START to crank; a timer shows the 172S starter duty cycle. A "Starter stays engaged" case shows the warning signs.
// Facts: PHAK 7 (Starting System): battery switch energizes the bus through the battery solenoid (contactor); the starter
// draws from the bus but runs only when the starter switch at START energizes the starter solenoid; releasing START removes
// power; a clutch keeps the running engine from driving the starter. C172S POH 7: MAGNETOS switch spring-loaded START
// with MASTER ON closes the starter contactor; it returns to BOTH when released. C172S POH 4 (NAV III): recommended starter
// duty cycle 10 s cranking then 20 s cool down, repeat two more times, then 10 minutes cool down. AFH 2: a starter that stays
// engaged shows a continuous, very high current draw on the ammeter (some airplanes have a starter-engaged light): shut down.
// The cranking time before the engine catches and the amps are illustrative.
import { chips, row } from "./base.js?v=61cdb9ff8d";
import { h, s } from "../core/util.js?v=61cdb9ff8d";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=61cdb9ff8d";
import { anim, COL } from "./dial.js?v=61cdb9ff8d";
const CASES = { normal: "Normal start", nostart: "Won't start", stuck: "Starter stays engaged" };
export function mount(host) {
  let cs = "normal", master = false, hold = false, crank = 0, cool = 0, cycles = 0, running = false, spun = 0, t = 0, over = false;
  const S = pxScene(host, { cls: "tall starter", corners: { tl: "Starting system", tr: "PHAK 7 · POH 4, 7" } }, draw);
  chips(row(S.F.ctrl, "Case"), Object.entries(CASES), cs, (k) => { cs = k || "normal"; reset(); }, { label: "Case" });
  const r1 = row(S.F.ctrl, "Switches"); const g1 = h("div", { class: "chips", role: "group", "aria-label": "Switches" }); r1.append(g1);
  const mb = h("button", { class: "chip", type: "button" }, "Master ON"), sb = h("button", { class: "chip", type: "button" }, "Hold START"), xb = h("button", { class: "chip", type: "button" }, "Shut down / reset");
  g1.append(mb, sb, xb);
  mb.addEventListener("click", () => { master = !master; if (!master) { hold = false; latched = false; } upd(); });
  let latched = false;
  const down = (e) => { e.preventDefault(); if (sb.disabled) return;
    if (latched) { latched = false; hold = false; if (crank > 0) { cycles++; cool = 20; } upd(); return; }
    hold = true; latched = false; upd(); };
  const up = () => { if (!hold || latched) return;
    // A tap is too short to crank; latch the hold so the starter keeps running until the next tap (or the engine catches).
    if (crank < 0.25 && !running) { latched = true; upd(); return; }
    hold = false; if (crank > 0) { cycles++; cool = 20; } upd(); };
  let fromPointer = false;
  sb.addEventListener("pointerdown", (e) => { fromPointer = true; down(e); });
  ["pointerup", "pointercancel"].forEach((ev) => sb.addEventListener(ev, up));
  sb.addEventListener("pointerleave", (e) => { if (latched) return; up(e); });
  sb.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { fromPointer = true; down(e); } });
  sb.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") up(); });
  // A synthesized click (or a tap that only fires click) should still crank: latch the hold until the next tap, or the engine catches.
  sb.addEventListener("click", () => {
    if (fromPointer) { fromPointer = false; return; }
    if (sb.disabled) return;
    if (hold) { hold = false; latched = false; if (crank > 0) { cycles++; cool = 20; } upd(); return; }
    hold = true; latched = true; upd();
  });
  xb.addEventListener("click", () => reset());
  function reset() { master = false; hold = false; latched = false; crank = 0; cool = 0; cycles = 0; running = false; spun = 0; over = false; upd(); }
  const A = anim(S.F, (dt) => { t += dt; let more = false;
    if (hold && master) { crank += dt; spun += dt; more = true; if (crank > 10) over = true;
      if (cs !== "nostart" && spun > 2.5) { running = true; if (cs !== "stuck") { hold = false; latched = false; cycles++; crank = 0; } } }
    else if (cool > 0) { cool = Math.max(0, cool - dt); if (cool === 0) { crank = 0; over = false; } more = true; }
    if (running && cs === "stuck" && master) more = true;
    S.redraw(); return more; });
  function upd() { mb.classList.toggle("on", master); mb.textContent = master ? "Master ON" : "Master OFF"; sb.classList.toggle("on", hold); S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const wide = W >= 600; sb.disabled = !master || running || cool > 0 || cycles >= 3;
    const stuck = cs === "stuck" && running && master, starterOn = (hold && master) || stuck, busOn = master;
    if (!g.ownerSVGElement.querySelector("#stglow")) g.ownerSVGElement.insertAdjacentHTML("afterbegin", `<defs><filter id="stglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>`);
    const flow = (-(t * 46) % 24).toFixed(1);
    // a wire: dim when dead; energized = blue with a soft glow and current dashes drifting along it
    const wire = (pts, on, heavy = true) => { const d = "M" + pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L");
      if (!on) { s("path", { d, fill: "none", stroke: "rgba(242,241,236,.22)", "stroke-width": heavy ? 2.2 : 1.2, "stroke-linejoin": "round" }, g); return; }
      s("path", { d, fill: "none", stroke: ACC, "stroke-width": heavy ? 9 : 5, opacity: 0.45, filter: "url(#stglow)" }, g);
      s("path", { d, fill: "none", stroke: ACC, "stroke-width": heavy ? 3.2 : 1.8, "stroke-linejoin": "round" }, g);
      s("path", { d, fill: "none", stroke: "#dbe8ff", "stroke-width": heavy ? 1.4 : 1, "stroke-dasharray": "3 21", "stroke-dashoffset": flow, "stroke-linecap": "round", opacity: 0.9 }, g); };
    const label = (x, y, a, b, on, anchor = "middle") => { T(g, x, y, a, { size: 11, anchor, fill: on ? INK : GRAY, weight: 600 }); if (b) T(g, x, y + 14, b, { size: 11, anchor, fill: DIM }); };
    const ground = (x, y) => { L(g, x, y, x, y + 8, { stroke: GRAY, w: 1.4 }); [12, 8, 4].forEach((hw, i) => L(g, x - hw, y + 8 + i * 4, x + hw, y + 8 + i * 4, { stroke: GRAY, w: 1.4 })); };
    // node positions: one row on wide screens; on phones a two-row snake through the bus
    const yA = top + (wide ? 70 : 62), yB = wide ? yA : top + 186;
    const N = wide ? { bat: [58, yA], c1: [176, yA], bus: [300, yA], c2: [424, yA], mot: [536, yA] } : { bat: [34, yA], c1: [138, yA], bus: [W - 40, yA], c2: [W - 122, yB], mot: [62, yB] };
    const busY0 = wide ? yA - 40 : yA - 26, busY1 = wide ? yA + 40 : yB + 26;
    // main cables
    wire([[N.bat[0] + 14, N.bat[1]], [N.c1[0] - 24, N.c1[1]]], true); wire([[N.c1[0] + 24, N.c1[1]], [N.bus[0] - 5, N.bus[1]]], busOn);
    if (wide) wire([[N.bus[0] + 5, yB], [N.c2[0] - 24, yB]], busOn); else wire([[N.bus[0] - 5, yB], [N.c2[0] + 24, yB]], busOn);
    if (wide) wire([[N.c2[0] + 24, yB], [N.mot[0] - 20, yB]], starterOn); else wire([[N.c2[0] - 24, yB], [N.mot[0] + 20, yB]], starterOn);
    // battery: cells with + and -, grounded
    { const [x, y] = N.bat; for (let i = 0; i < 3; i++) { const cx = x - 12 + i * 10; L(g, cx, y - 15, cx, y + 15, { stroke: INK, w: 2 }); L(g, cx + 5, y - 8, cx + 5, y + 8, { stroke: INK, w: 3.4 }); }
      T(g, x + 22, y - 12, "+", { size: 12, fill: GRAY }); L(g, x - 12, y + 15, x - 12, y + 26, { stroke: GRAY, w: 1.4 }); ground(x - 12, y + 26); label(x + 2, y - 44, "BATTERY", "24 V", true); }
    // contactor: two terminals, a bar that closes when its coil is energized; the coil sits below on the control circuit
    const contactor = (x, y, closed, on, a, b) => { R(g, x - 26, y - 18, 52, 36, { fill: "#101013", stroke: on ? ACC : "rgba(242,241,236,.4)", sw: 1.4, rx: 7 });
      C(g, x - 15, y, 3.4, { fill: on ? ACC : INK }); C(g, x + 15, y, 3.4, { fill: on ? ACC : INK });
      if (closed) L(g, x - 15, y - 4, x + 15, y - 4, { stroke: on ? ACC : INK, w: 3 }); else L(g, x - 15, y - 4, x + 13, y - 13, { stroke: GRAY, w: 3 });
      const cy = y + 32; P(g, `M${x - 12},${cy} ` + [0, 1, 2, 3].map((k) => `a3,3 0 0 1 6,0`).join(" "), { stroke: closed ? ACC : GRAY, w: 1.6 }); L(g, x, y + 18, x, cy - 3, { stroke: closed ? ACC : "rgba(242,241,236,.3)", w: 1.2, dash: "2 2" });
      label(x, y - 44, a, b, on); };
    contactor(...N.c1, busOn, busOn, "BATTERY", "CONTACTOR"); contactor(...N.c2, starterOn, starterOn, "STARTER", "CONTACTOR");
    // bus bar
    R(g, N.bus[0] - 5, busY0, 10, busY1 - busY0, { fill: busOn ? ACC : "#1c1c20", stroke: busOn ? ACC : "rgba(242,241,236,.35)", sw: 1.2, rx: 2 });
    if (busOn) R(g, N.bus[0] - 9, busY0 - 4, 18, busY1 - busY0 + 8, { fill: ACC, opacity: 0.25 }).setAttribute("filter", "url(#stglow)");
    T(g, N.bus[0] + (wide ? 0 : -14), busY0 - (wide ? 10 : 4), "BUS", { size: 11, anchor: wide ? "middle" : "end", fill: busOn ? INK : GRAY, weight: 600 });
    // control circuit: MASTER switch grounds the battery-contactor coil; key at START feeds the starter-contactor coil from the bus
    const sw = (x, y, closed, txt) => { C(g, x - 12, y, 3, { fill: closed ? ACC : GRAY }); C(g, x + 12, y, 3, { fill: closed ? ACC : GRAY }); L(g, x - 12, y, closed ? x + 12 : x + 8, closed ? y - 2 : y - 13, { stroke: closed ? ACC : INK, w: 2.4 }); T(g, x, y + 20, txt, { size: 11, anchor: "middle", fill: closed ? INK : GRAY, weight: 600 }); };
    { const [x, y] = N.c1, cy = y + 32, my = y + (wide ? 92 : 58); wire([[x + 12, cy], [x + 20, cy], [x + 20, my]], master, false); sw(x + 20 - 12, my, master, "MASTER"); wire([[x - 4 - 12, my], [x - 28, my], [x - 28, cy], [x - 12, cy]], master, false); }
    { const [x, y] = N.c2, cy = y + 32, ky = y + (wide ? 92 : 78), kx = wide ? x - 56 : x + 40; const keyOn = hold && master;
      wire(wide ? [[N.bus[0], busY1], [N.bus[0], ky], [kx - 12, ky]] : [[N.bus[0], busY1], [N.bus[0], ky], [kx + 12, ky]], busOn, false); sw(kx, ky, keyOn || stuck, "KEY AT START");
      wire(wide ? [[kx + 12, ky], [x, ky], [x, cy + 3]] : [[kx - 12, ky], [x, ky], [x, cy + 3]], keyOn || stuck, false); }
    // starter motor and the Bendix: the pinion slides into the engine's ring gear while the starter turns
    const [mx, my2] = N.mot; C(g, mx, my2, 20, { fill: "#101013", stroke: starterOn ? ACC : "rgba(242,241,236,.5)", sw: 2 }); T(g, mx, my2 + 5, "M", { size: 14, anchor: "middle", fill: starterOn ? INK : GRAY, weight: 700 });
    if (starterOn) C(g, mx, my2, 26, { stroke: ACC, sw: 6, opacity: 0.3 }).setAttribute("filter", "url(#stglow)");
    L(g, mx, my2 + 20, mx, my2 + 26, { stroke: GRAY, w: 1.4 }); ground(mx, my2 + 26);
    label(mx, my2 - 44, "STARTER", "MOTOR", starterOn);
    const engaged = starterOn, rp = wide ? 12 : 10, Rr = wide ? 62 : 44, sx2 = wide ? mx + 48 : mx + 62, gearY = wide ? my2 + 44 : my2 + 46;
    const rot = (running ? t * 3 : 0) + (starterOn ? t * 1.2 : 0), prot = rot * (Rr / rp);
    L(g, mx + 20, my2, sx2, my2, { stroke: GRAY, w: 3 });   // motor shaft
    const teeth = (cx, cy, r, n, ang, on, depth) => { let d = ""; for (let i = 0; i < n; i++) { const a0 = ang + (i / n) * 2 * Math.PI, a1 = a0 + (0.5 / n) * 2 * Math.PI; [[a0, r], [a0, r + depth], [a1, r + depth], [a1, r]].forEach(([a2, rr], j) => { d += (i === 0 && j === 0 ? "M" : "L") + (cx + Math.cos(a2) * rr).toFixed(1) + "," + (cy + Math.sin(a2) * rr).toFixed(1); }); } P(g, d + "Z", { fill: "#141417", stroke: on ? ACC : "rgba(242,241,236,.55)", w: 1.3 }); };
    const ringC = [sx2, gearY + rp + 4 + Rr];
    s("path", { d: `M${ringC[0] - Rr * 0.95},${ringC[1] - Rr * 0.3} A${Rr},${Rr} 0 0 1 ${ringC[0] + Rr * 0.95},${ringC[1] - Rr * 0.3}`, fill: "none", stroke: "none" }, g);
    const cp = s("clipPath", { id: "stclip" + W }, g); s("rect", { x: ringC[0] - Rr - 10, y: ringC[1] - Rr - 8, width: 2 * Rr + 20, height: Rr * 0.72 }, cp);
    const gg = s("g", { "clip-path": `url(#stclip${W})` }, g); { const g0 = g; g = gg; teeth(ringC[0], ringC[1], Rr, 64, rot, running || starterOn, 4); C(g, ringC[0], ringC[1], Rr - 10, { stroke: "rgba(242,241,236,.2)", sw: 1 }); g = g0; }
    const py = engaged ? gearY : gearY - 12; teeth(sx2, py, rp, 9, -prot, engaged, 3.4); C(g, sx2, py, 3, { fill: engaged ? ACC : GRAY });
    if (wide) { T(g, sx2 + rp + 8, py - 2, "pinion", { size: 11, fill: engaged ? INK : GRAY }); if (engaged) T(g, sx2 + rp + 8, py + 12, "engaged", { size: 11, fill: INK }); } else T(g, sx2 + rp + 10, py + 4, engaged ? "pinion engaged" : "pinion", { size: 11, fill: engaged ? INK : GRAY }); T(g, ringC[0], ringC[1] - Rr * 0.28 + 8, "engine ring gear", { size: 11, anchor: "middle", fill: DIM });
    // duty-cycle bars and status
    const bsp = wide ? 36 : 32, by = wide ? yA + 172 : yB + 118, bw = wide ? Math.min(W - 64, 600) * 0.62 : W - 64, sx = 32;
    const amps = stuck ? 1 : starterOn ? 0.85 : running ? 0.15 : 0;
    const bar = (y, name, val, frac, col) => { T(g, sx, y, name, { size: 11, fill: GRAY }); T(g, sx + bw, y, val, { size: 11, anchor: "end", fill: frac > 0 ? INK : DIM }); R(g, sx, y + 7, bw, 8, { fill: "#141417", stroke: "rgba(242,241,236,.14)", sw: 1, rx: 4 }); if (frac > 0) R(g, sx, y + 7, Math.max(8, bw * Math.min(1, frac)), 8, { fill: col, rx: 4 }); };
    bar(by, "STARTER CURRENT", stuck ? "very high, continuous" : starterOn ? "high" : running ? "charging" : "none", amps, stuck ? COL.red : ACC);
    bar(by + bsp, "CRANKING (10 s max)", crank > 0 ? crank.toFixed(1) + " s" : "–", crank / 10, over ? COL.red : COL.green);
    bar(by + 2 * bsp, "COOL DOWN (20 s)", cool > 0 ? Math.ceil(cool) + " s" : "–", cool / 20, COL.cyan);
    const stx = wide ? sx + bw + 36 : sx, sty = wide ? by + 4 : by + 3 * bsp + 6;
    T(g, stx, sty, running ? "ENGINE RUNNING" : "ENGINE STOPPED", { size: 12, weight: 700, fill: running ? COL.green : GRAY }); T(g, stx, sty + (wide ? 20 : 0) , wide ? `try ${Math.min(cycles, 3)} of 3` : "", { size: 11, fill: GRAY });
    if (!wide) T(g, W - sx, sty, `try ${Math.min(cycles, 3)} of 3`, { size: 11, anchor: "end", fill: GRAY });
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
