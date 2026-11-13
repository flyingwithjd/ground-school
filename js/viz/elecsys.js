// The 172S electrical system: battery, belt-driven alternator, split master (BAT/ALT), ALT FLD breaker, bus bar, breakers,
// loads and the avionics master. Round-dial panel (ammeter + VOLTS light) or G1000 (M BUS / M BATT / S BATT, LOW VOLTS,
// HIGH VOLTS, STBY BATT). Pick a failure, then run the POH checklist one step at a time.
// Facts: C172S POH (round dial) Sec 3/7: 28 V, 60 A alternator, 24 V battery; VOLTS below 24.5 V; overvoltage sensor shuts the
// alternator down at about 31.5 V by opening ALT FLD; a nuisance trip may clear with the reset; VOLTS checklist steps 1-9;
// excess charge: alternator OFF (compass deviation up to 25 deg), nonessential OFF, terminate; low-RPM taxi VOLTS is normal.
// G1000 172S POH Sec 3/7: normal bus about 28.0 V; HIGH VOLTS above 32.0; LOW VOLTS below 24.5; LOW VOLTS checklist with
// M BUS 27.5 V minimum and M BATT charging; below 20 V on M BUS the standby battery powers the essential bus for at least 30 min.
// Amps and the battery-time bar are illustrative, not published values.
import { chips, row } from "./base.js?v=58985d3f52";
import { h } from "../core/util.js?v=58985d3f52";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC, ACCF } from "./kit.js?v=58985d3f52";
import { dial, eisCell, anim, COL } from "./dial.js?v=58985d3f52";
const CASES = { normal: "Normal", nuis: "Overvoltage trip", altfail: "Alternator failed", lowrpm: "Low-RPM taxi", sensor: "Too much charge" };
const LIST = {
  round: { volts: ["Avionics master OFF", "ALT FLD breaker CHECK IN", "Master switch OFF (both sides)", "Master switch ON", "VOLTS CHECK OFF", "Avionics master ON"],
    again: ["Alternator OFF", "Nonessential equipment OFF", "Land as soon as practical"], charge: ["Alternator OFF", "Nonessential equipment OFF", "Land as soon as practical"], rpm: ["Add RPM", "VOLTS CHECK OFF"] },
  g1000: { volts: ["MASTER (ALT only) OFF", "ALT FIELD breaker CHECK IN", "MASTER (ALT and BAT) ON", "LOW VOLTS CHECK OFF", "M BUS VOLTS CHECK 27.5 V min", "M BATT AMPS CHECK charging (+)"],
    again: ["MASTER (ALT only) OFF", "Reduce electrical load", "Land as soon as practical"], charge: ["MASTER (ALT only) OFF", "Reduce electrical load", "Land as soon as practical"], rpm: ["Throttle 1000 RPM", "LOW VOLTS CHECK OFF"] },
};
export function mount(host) {
  let panel = "round", fc = "normal", st;
  const fresh = () => ({ bat: true, alt: true, fld: true, avion: true, land: false, pitot: false, nav: true, rpm: false, cleared: false, charge: 1, list: null, step: 0, done: false });
  st = fresh();
  const S = pxScene(host, { cls: "xtall elecsys", corners: { tl: "Electrical system · 28 V", tr: "POH 3, 7" } }, draw);
  const r0 = row(S.F.ctrl, "Panel"); chips(r0, [["round", "Round dials"], ["g1000", "G1000"]], panel, (v) => { panel = v || "round"; setCase(fc); }, { label: "Panel" });
  const r1 = row(S.F.ctrl, "Case"); const cc = chips(r1, Object.entries(CASES), fc, (v) => setCase(v || "normal"), { label: "Case" });
  const r2 = row(S.F.ctrl, "Loads"); const ld = {}; const lg = h("div", { class: "chips", role: "group", "aria-label": "Loads" }); r2.append(lg);
  [["land", "Landing light"], ["pitot", "Pitot heat"], ["nav", "Nav lights"], ["avion", "Avionics"]].forEach(([k, t]) => { const b = h("button", { class: "chip", type: "button", "aria-pressed": "false" }, t); lg.append(b);
    ld[k] = { set(v) { b.classList.toggle("on", !!v); b.setAttribute("aria-pressed", v ? "true" : "false"); } }; ld[k].set(st[k]); b.addEventListener("click", () => { st[k] = !st[k]; ld[k].set(st[k]); upd(); }); });
  const r3 = row(S.F.ctrl, "Checklist"); const cg = h("div", { class: "chips", role: "group", "aria-label": "Checklist" }); r3.append(cg); const nb = h("button", { class: "chip", type: "button" }, "Next step"); const rb = h("button", { class: "chip", type: "button" }, "Start over");
  cg.append(nb, rb); nb.addEventListener("click", next); rb.addEventListener("click", () => setCase(fc));
  function setCase(k) { fc = k; cc.set(k); st = fresh(); if (k === "nuis" || k === "altfail") st.fld = false; for (const x in ld) ld[x].set(st[x]); upd(); }
  // electrical state from the switches
  function calc() { const altOK = st.alt && st.fld && fc !== "altfail" && (fc !== "nuis" || st.cleared), low = fc === "lowrpm" && !st.rpm;
    const n = 1 + (st.land ? 2 : 0) + (st.pitot ? 2 : 0) + (st.nav ? 1 : 0) + (st.avion ? 2 : 0);
    let v = 0, amps = 0, src = "none";
    if (altOK && !low) { v = fc === "sensor" ? (panel === "g1000" ? 32.5 : 31) : 28; amps = fc === "sensor" ? 40 : 2; src = "alt"; }
    else if (st.bat && st.charge > 0) { v = low ? 24.2 : st.charge > 0.12 ? 24 : 19.5; amps = -n * 1.6; src = "bat"; }
    const stby = panel === "g1000" && st.bat && v < 20 && v > 0 || (panel === "g1000" && src === "bat" && st.charge <= 0.12);
    return { v, amps, src, n, lowV: v > 0 && v < 24.5, highV: panel === "g1000" ? v > 32 : fc === "sensor" && src === "alt", stby }; }
  function listFor() { if (fc === "lowrpm") return "rpm"; if (fc === "sensor") return "charge"; if (fc === "normal") return null; return st.list || "volts"; }
  function next() { const k = listFor(); if (!k || st.done) return; const L0 = LIST[panel][k], s = L0[st.step]; if (!s) return; apply(s); st.step++;
    if (st.step >= L0.length) { if (k === "volts" && calc().lowV) { st.list = "again"; st.step = 0; } else st.done = true; } upd(); }
  function apply(s) { const t = s.toLowerCase();
    if (t.startsWith("avionics master off")) st.avion = false; else if (t.startsWith("avionics master on")) st.avion = true;
    else if (t.includes("check in")) st.fld = true;
    else if (t.includes("alt only) off") || t.startsWith("alternator off")) st.alt = false;
    else if (t.includes("off (both")) { st.alt = false; st.bat = false; }
    else if (t.startsWith("master switch on") || t.includes("(alt and bat) on")) { st.alt = true; st.bat = true; if (fc === "nuis" && st.fld) st.cleared = true; }
    else if (t.startsWith("nonessential") || t.startsWith("reduce")) { st.land = false; st.pitot = false; st.nav = false; if (panel === "g1000") st.avion = false; }
    else if (t.startsWith("add rpm") || t.startsWith("throttle 1000")) st.rpm = true;
    for (const x in ld) ld[x].set(st[x]); }
  const A = anim(S.F, (dt) => { const c = calc(); if (c.src !== "bat" || st.charge <= 0) return false; st.charge = Math.max(0, st.charge - dt * 0.004 * c.n); S.redraw(); return st.charge > 0; });
  let gauges = [];
  function upd() { S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const c = calc(), ph = S.phone, x0 = ph ? 10 : 24, y0 = top + 16, bx = ph ? W * 0.5 : W * 0.46, sh = Math.min(300, (H - top) * 0.56), on = (b) => (b ? ACC : DIM);
    const bw = ph ? 86 : 116, bh = 30;
    const box = (x, y, w, t, live, bad) => { R(g, x, y, w, bh, { fill: "#0A0A0B", rx: 6 }); R(g, x, y, w, bh, { stroke: bad ? COL.red : live ? ACC : GRAY, sw: live || bad ? 1.8 : 1.2, rx: 6, fill: live ? ACCF : "none" }); T(g, x + w / 2, y + 19, t, { size: 11, anchor: "middle", fill: bad ? COL.red : live ? INK : GRAY }); };
    // bus bar
    const busLive = c.v > 0; R(g, bx - 4, y0, 8, sh, { fill: busLive ? ACC : DIM, rx: 3 }); T(g, bx, y0 + sh + 16, "bus bar", { size: 11, anchor: "middle", fill: busLive ? INK : GRAY });
    // battery + BAT switch
    const yb = y0 + sh * 0.12, ya = y0 + sh * 0.55, sx = bx - (ph ? 42 : 70);
    box(x0, yb, bw, ph ? "battery" : "battery 24 V", c.src === "bat", false);
    const sw = (x, y, closed, lab) => { C(g, x - 14, y, 3, { fill: INK }); C(g, x + 14, y, 3, { fill: INK }); L(g, x - 14, y, closed ? x + 14 : x + 8, closed ? y : y - 12, { stroke: closed ? INK : GRAY, w: 2.4 }); T(g, x, y - 14, lab, { size: 11, anchor: "middle", fill: GRAY }); };
    L(g, x0 + bw, yb + bh / 2, sx - 14, yb + bh / 2, { stroke: on(st.bat && c.src !== "none"), w: 2 }); sw(sx, yb + bh / 2, st.bat, "BAT"); L(g, sx + 14, yb + bh / 2, bx - 4, yb + bh / 2, { stroke: on(st.bat && busLive), w: 2 });
    // alternator + ALT FLD + ALT switch
    box(x0, ya, bw, "alternator", c.src === "alt", fc === "altfail" || (fc === "sensor" && c.src === "alt"));
    const fx = x0 + bw + (sx - 14 - x0 - bw) / 2; L(g, x0 + bw, ya + bh / 2, sx - 14, ya + bh / 2, { stroke: on(c.src === "alt"), w: 2 });
    C(g, fx, ya + bh / 2, 7, { fill: "#0A0A0B", stroke: st.fld ? INK : COL.red, sw: 2 }); T(g, fx, ya + bh + 16, st.fld ? "ALT FLD" : "ALT FLD out", { size: 11, anchor: "middle", fill: st.fld ? GRAY : COL.red });
    sw(sx, ya + bh / 2, st.alt, "ALT"); L(g, sx + 14, ya + bh / 2, bx - 4, ya + bh / 2, { stroke: on(c.src === "alt"), w: 2 });
    if (!ph) T(g, x0 + bw / 2, ya - 8, "belt from engine", { size: 11, anchor: "middle", fill: DIM });
    // magnetos: independent
    const ym = y0 + sh * 0.86; box(x0, ym, bw, "magnetos", true, false); T(g, x0 + bw / 2, ym + bh + 15, "not on the bus", { size: 11, anchor: "middle", fill: GRAY });
    // loads
    const loads = [["land", "landing light"], ["pitot", "pitot heat"], ["nav", "nav lights"], ["avion", "avionics bus"]], lx = bx + (ph ? 26 : 40), lw = Math.min(150, W - lx - (ph ? 10 : 24));
    loads.forEach(([k, t], i) => { const y = y0 + sh * (0.06 + i * 0.22), live = st[k] && busLive; L(g, bx + 4, y + bh / 2, lx, y + bh / 2, { stroke: on(live), w: 2 });
      C(g, bx + (lx - bx) / 2 + 2, y + bh / 2, 4, { fill: "#0A0A0B", stroke: GRAY, sw: 1.2 }); box(lx, y, lw, t, live, false); });
    // instruments
    const gy = y0 + sh + 34, gh = H - gy - 8; gauges = [];
    if (panel === "round") { const r = Math.min(56, gh / 2 - 6, W * 0.15), gx = W * 0.3, cy = gy + gh / 2;
      const am = dial(g, gx, cy, r, { min: -60, max: 60, a0: -60, a1: 60, ticks: [-60, -30, 0, 30, 60], title: "AMPS", focus: true }); am.set(Math.max(-60, Math.min(60, c.amps * (c.amps > 30 ? 1.5 : 3))));
      T(g, gx - r * 0.75, cy + 4, "−", { size: 14, anchor: "middle", fill: GRAY }); T(g, gx + r * 0.75, cy + 4, "+", { size: 14, anchor: "middle", fill: GRAY });
      const ax = W * 0.62; R(g, ax, cy - 18, 90, 36, { rx: 4, fill: c.lowV ? COL.red : "#1a1a1c", stroke: GRAY, sw: 1 }); T(g, ax + 45, cy + 5, "VOLTS", { size: 13, anchor: "middle", fill: c.lowV ? "#fff" : DIM, weight: 700 });
    } else { const cw = Math.min(200, W * 0.4), gx = ph ? 14 : W * 0.12, y = gy + 12;
      eisCell(g, gx, y, cw, { label: "M BUS VOLTS", min: 18, max: 34, reds: [24.5, 32], value: c.v || 18, fmt: (v) => (c.v ? v.toFixed(1) : "0.0"), focus: true });
      eisCell(g, gx, y + 38, cw, { label: "M BATT AMPS", min: -40, max: 40, value: c.amps, fmt: (v) => (v > 0 ? "+" : "") + v.toFixed(0) });
      eisCell(g, gx, y + 76, cw, { label: "S BATT AMPS", min: -10, max: 10, value: c.stby ? -4 : 0, fmt: (v) => (v > 0 ? "+" : "") + v.toFixed(0) });
      const ax = gx + cw + (ph ? 18 : 40), aw = Math.min(110, W - ax - 10); [["LOW VOLTS", c.lowV, COL.red], ["HIGH VOLTS", c.highV, COL.red], ["STBY BATT", c.stby, COL.yellow]].forEach(([t, lit, col], i) => {
        R(g, ax, y - 8 + i * 38, aw, 26, { rx: 3, fill: lit ? col : "#1a1a1c", stroke: GRAY, sw: 1 }); T(g, ax + aw / 2, y + 9 + i * 38, t, { size: 11, anchor: "middle", fill: lit ? "#000" : DIM, weight: 700 }); }); }
    // battery bar when the battery carries the load
    if (c.src === "bat") { const tx = x0, tw = bw; R(g, tx, yb - 16, tw, 6, { stroke: GRAY, sw: 1, rx: 3 }); R(g, tx, yb - 16, tw * st.charge, 6, { fill: st.charge < 0.25 ? COL.red : COL.yellow, rx: 3 }); }
    // caption
    const k = listFor(), Lst = k && LIST[panel][k]; let cap;
    if (fc === "normal") cap = [busLive ? "Alternator carrying the load" : "No power", c.src === "alt" ? "About 28 volts on the bus; the battery is charging. Magnetos run the engine either way." : "Try the cases below."];
    else if (st.done) cap = c.lowV || c.src === "bat" ? ["On the battery", "Battery only: time is limited. Save it for flaps and lights, and land as soon as practical."] : ["Charging again", fc === "nuis" ? "It was a nuisance trip; the reset brought the alternator back." : "Back to normal."];
    else cap = [`Step ${st.step + 1} of ${Lst.length}: ${Lst[st.step]}`, st.list === "again" ? "VOLTS came back: the alternator has failed. Shed load." : fc === "lowrpm" ? (panel === "round" ? "VOLTS at low RPM with a load is normal. More RPM and it goes out; no master recycle." : "LOW VOLTS below 1000 RPM: bring it up to 1000 and check.") : fc === "sensor" ? (panel === "round" ? "Ammeter at full charge: the overvoltage sensor didn't trip. Alternator OFF can add up to 25° of compass deviation." : "HIGH VOLTS: the alternator is supplying too much voltage.") : (panel === "round" ? "VOLTS on, ammeter showing discharge. Tap Next step." : "LOW VOLTS on, M BATT showing discharge. Tap Next step.")];
    S.F.caption(cap[0], cap[1]); nb.disabled = !k || st.done;
  }
  S.F.explain(`<p>The battery starts the engine; once running, the alternator carries every load and recharges the battery. The magnetos don't use the bus. In the G1000 172S, if main bus voltage falls below 20 volts, a standby battery powers the essential bus for at least 30 minutes. Your airplane's POH has the exact checklist.</p>`);
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
