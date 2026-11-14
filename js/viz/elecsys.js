// The 172S electrical system in 3D (x-ray on the airplane, blue = powered): battery, belt-driven alternator, split master (BAT/ALT), ALT FLD breaker, bus bar, breakers,
// loads and the avionics master. Round-dial panel (ammeter + VOLTS light) or G1000 (M BUS / M BATT / S BATT, LOW VOLTS,
// HIGH VOLTS, STBY BATT). Pick a failure, then run the POH checklist one step at a time.
// Facts: C172S POH (round dial) Sec 3/7: 28 V, 60 A alternator, 24 V battery; VOLTS below 24.5 V; overvoltage sensor shuts the
// alternator down at about 31.5 V by opening ALT FLD; a nuisance trip may clear with the reset; VOLTS checklist steps 1-9;
// excess charge: alternator OFF (compass deviation up to 25 deg), nonessential OFF, terminate; low-RPM taxi VOLTS is normal.
// G1000 172S POH Sec 3/7: normal bus about 28.0 V; HIGH VOLTS above 32.0; LOW VOLTS below 24.5; LOW VOLTS checklist with
// M BUS 27.5 V minimum and M BATT charging; below 20 V on M BUS the standby battery powers the essential bus for at least 30 min.
// Amps and the battery-time bar are illustrative, not published values.
import { chips, row, frame } from "./base.js?v=714b944f7b";
import { planeStage } from "./planestage.js?v=714b944f7b";
import { tags3d } from "./tags3d.js?v=714b944f7b";
import { glowSprite, lightPulse } from "./lightglow.js?v=714b944f7b";
import { buildPitot } from "./pitot3d.js?v=714b944f7b";
import { rich } from "../core/rich.js?v=714b944f7b";
import { s as svgEl } from "../core/util.js?v=714b944f7b";
import { h } from "../core/util.js?v=714b944f7b";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC, ACCF } from "./kit.js?v=714b944f7b";
import { dial, eisCell, anim, COL } from "./dial.js?v=714b944f7b";
const CASES = { normal: "Normal", nuis: "Overvoltage trip", altfail: "Alternator failed", lowrpm: "Low-RPM taxi", sensor: "Too much charge" };
const LIST = {
  round: { volts: ["Avionics master OFF", "ALT FLD breaker CHECK IN", "Master switch OFF (both sides)", "Master switch ON", "VOLTS CHECK OFF", "Avionics master ON"],
    again: ["Alternator OFF", "Nonessential equipment OFF", "Land as soon as practical"], charge: ["Alternator OFF", "Nonessential equipment OFF", "Land as soon as practical"], rpm: ["Add RPM", "VOLTS CHECK OFF"] },
  g1000: { volts: ["MASTER (ALT only) OFF", "ALT FIELD breaker CHECK IN", "MASTER (ALT and BAT) ON", "LOW VOLTS CHECK OFF", "M BUS VOLTS CHECK 27.5 V min", "M BATT AMPS CHECK charging (+)"],
    again: ["MASTER (ALT only) OFF", "Reduce electrical load", "Land as soon as practical"], charge: ["MASTER (ALT only) OFF", "Reduce electrical load", "Land as soon as practical"], rpm: ["Throttle 1000 RPM", "LOW VOLTS CHECK OFF"] },
};
export function mount(host) {
  let panel = "round", fc = "normal", st;
  const fresh = () => ({ bat: true, alt: true, fld: true, avion: true, land: false, pitot: false, nav: true, beacon: true, strobes: false, rpm: false, cleared: false, charge: 1, list: null, step: 0, done: false });
  st = fresh();
  const F = frame(host, { cls: "elec3d capin", corners: { tl: "Electrical system · 28 V", tr: "POH 3, 7" } });
  const S3 = planeStage(F.stage, { view: { tg: [-2.6, 4.8, 0], az: -38, el: 24, d: 50 }, maxFps: 30 }), X = buildX(S3);
  const gsv = svgEl("svg", { class: "el-g", viewBox: "0 0 360 120", role: "img", "aria-label": "Electrical gauges" });
  const S = { F, redraw: () => render() };
  const r0 = row(F.ctrl, "Panel"); chips(r0, [["round", "Round dials"], ["g1000", "G1000"]], panel, (v) => { panel = v || "round"; setCase(fc); }, { label: "Panel" });
  const r1 = row(F.ctrl, "Case"); const cc = chips(r1, Object.entries(CASES), fc, (v) => setCase(v || "normal"), { label: "Case" });
  const r2 = row(F.ctrl, "Loads"); const ld = {}; const lg = h("div", { class: "chips", role: "group", "aria-label": "Loads" }); r2.append(lg);
  [["land", "Landing light"], ["pitot", "Pitot heat"], ["nav", "Nav lights"], ["beacon", "Beacon"], ["strobes", "Strobes"], ["avion", "Avionics"]].forEach(([k, t]) => { const b = h("button", { class: "chip", type: "button", "aria-pressed": "false" }, t); lg.append(b);
    ld[k] = { set(v) { b.classList.toggle("on", !!v); b.setAttribute("aria-pressed", v ? "true" : "false"); } }; ld[k].set(st[k]); b.addEventListener("click", () => { st[k] = !st[k]; ld[k].set(st[k]); upd(); }); });
  const r3 = row(F.ctrl, "Checklist"); const cg = h("div", { class: "chips", role: "group", "aria-label": "Checklist" }); r3.append(cg); const nb = h("button", { class: "chip", type: "button" }, "Next step"); const rb = h("button", { class: "chip", type: "button" }, "Start over");
  cg.append(nb, rb); nb.addEventListener("click", next); rb.addEventListener("click", () => setCase(fc));
  function setCase(k) { fc = k; cc.set(k); st = fresh(); if (k === "nuis" || k === "altfail") st.fld = false; for (const x in ld) ld[x].set(st[x]); upd(); }
  // electrical state from the switches
  function calc() { const altOK = st.alt && st.fld && fc !== "altfail" && (fc !== "nuis" || st.cleared), low = fc === "lowrpm" && !st.rpm;
    const n = 1 + (st.land ? 2 : 0) + (st.pitot ? 2 : 0) + (st.nav ? 1 : 0) + (st.beacon ? 1 : 0) + (st.strobes ? 1 : 0) + (st.avion ? 2 : 0);
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
    else if (t.startsWith("nonessential") || t.startsWith("reduce")) { st.land = false; st.pitot = false; st.nav = false; st.beacon = false; st.strobes = false; if (panel === "g1000") st.avion = false; }
    else if (t.startsWith("add rpm") || t.startsWith("throttle 1000")) st.rpm = true;
    for (const x in ld) ld[x].set(st[x]); }
  F.ctrl.prepend(gsv);
  let lastT = performance.now();
  S3.animate(() => { const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1000); lastT = now; const c = calc(); if (c.src === "bat" && st.charge > 0) { st.charge = Math.max(0, st.charge - dt * 0.004 * c.n); if (Math.random() < 0.1) render(); }
    const live = (st.nav || st.beacon || st.strobes || st.land) && c.v > 0;
    X.pulse(now / 1000, { land: st.land && c.v > 0, nav: st.nav && c.v > 0, beacon: st.beacon && c.v > 0, strobes: st.strobes && c.v > 0 });
    X.place(); S3.setFlow(live || (c.src === "bat" && st.charge > 0)); return live || (c.src === "bat" && st.charge > 0); }, { idle: true });
  const A = { kick() {}, stop() {} };
  let gauges = [];
  function upd() { S.redraw(); A.kick(); }
  function render() {
    const c = calc(), busLive = c.v > 0;
    X.set({ bat: c.src === "bat" || (st.bat && busLive), batSrc: c.src === "bat", alt: c.src === "alt", altBad: fc === "altfail" || (fc === "sensor" && c.src === "alt") || !st.fld, bus: busLive,
      land: st.land && busLive, nav: st.nav && busLive, beacon: st.beacon && busLive, strobes: st.strobes && busLive, pitot: st.pitot && busLive, avion: st.avion && busLive, charge: st.charge });
    // gauges (instrument faces)
    gsv.replaceChildren(); const g = svgEl("g", {}, gsv);
    if (panel === "round") { const am = dial(g, 70, 62, 48, { min: -60, max: 60, a0: -60, a1: 60, ticks: [-60, -30, 0, 30, 60], title: "AMPS", focus: true }); am.set(Math.max(-60, Math.min(60, c.amps * (c.amps > 30 ? 1.5 : 3))));
      T(g, 34, 66, "−", { size: 14, anchor: "middle", fill: GRAY }); T(g, 106, 66, "+", { size: 14, anchor: "middle", fill: GRAY });
      R(g, 160, 44, 90, 36, { rx: 4, fill: c.lowV ? COL.red : "#1a1a1c", stroke: GRAY, sw: 1 }); T(g, 205, 67, "VOLTS", { size: 13, anchor: "middle", fill: c.lowV ? "#fff" : DIM, weight: 700 });
      if (c.src === "bat") { T(g, 270, 50, "BATTERY", { size: 11, fill: GRAY }); R(g, 270, 58, 80, 8, { stroke: GRAY, sw: 1, rx: 3 }); R(g, 270, 58, 80 * st.charge, 8, { fill: st.charge < 0.25 ? COL.red : COL.yellow, rx: 3 }); }
    } else { eisCell(g, 8, 22, 190, { label: "M BUS VOLTS", min: 18, max: 34, reds: [24.5, 32], value: c.v || 18, fmt: (v) => (c.v ? v.toFixed(1) : "0.0"), focus: true });
      eisCell(g, 8, 60, 190, { label: "M BATT AMPS", min: -40, max: 40, value: c.amps, fmt: (v) => (v > 0 ? "+" : "") + v.toFixed(0) });
      eisCell(g, 8, 98, 190, { label: "S BATT AMPS", min: -10, max: 10, value: c.stby ? -4 : 0, fmt: (v) => (v > 0 ? "+" : "") + v.toFixed(0) });
      [["LOW VOLTS", c.lowV, COL.red], ["HIGH VOLTS", c.highV, COL.red], ["STBY BATT", c.stby, COL.yellow]].forEach(([t, lit, col], i) => {
        R(g, 230, 8 + i * 38, 120, 26, { rx: 3, fill: lit ? col : "#1a1a1c", stroke: GRAY, sw: 1 }); T(g, 290, 25 + i * 38, t, { size: 11, anchor: "middle", fill: lit ? "#000" : DIM, weight: 700 }); }); }
    // caption
    const k = listFor(), Lst = k && LIST[panel][k]; let cap;
    if (fc === "normal") cap = [busLive ? "Alternator carrying the load" : "No power", c.src === "alt" ? "About 28 volts on the bus; the battery is charging. Magnetos run the engine either way. Nav lights: red left, green right, white tail." : "Try the cases below."];
    else if (st.done) cap = c.lowV || c.src === "bat" ? ["On the battery", "Battery only: time is limited. Save it for flaps and lights, and land as soon as practical."] : ["Charging again", fc === "nuis" ? "It was a nuisance trip; the reset brought the alternator back." : "Back to normal."];
    else cap = [`Step ${st.step + 1} of ${Lst.length}: ${Lst[st.step]}`, st.list === "again" ? "VOLTS came back: the alternator has failed. Shed load." : fc === "lowrpm" ? (panel === "round" ? "VOLTS at low RPM with a load is normal. More RPM and it goes out; no master recycle." : "LOW VOLTS below 1000 RPM: bring it up to 1000 and check.") : fc === "sensor" ? (panel === "round" ? "Ammeter at full charge: the overvoltage sensor didn't trip. Alternator OFF can add up to 25° of compass deviation." : "HIGH VOLTS: the alternator is supplying too much voltage.") : (panel === "round" ? "VOLTS on, ammeter showing discharge. Tap Next step." : "LOW VOLTS on, M BATT showing discharge. Tap Next step.")];
    F.caption(cap[0], cap[1]); nb.disabled = !k || st.done;
  }
  F.explain(rich(`<p>Blue parts and wires are powered; grey ones are dead. [[Position lights|Nav lights]] are red on the left wingtip, green on the right and white on the tail (14 CFR 23.2530, 23.1385, 91.209). The [[Beacon|beacon]] on top of the fin flashes red; white [[Strobe lights|strobes]] flash at each wingtip. The landing light sits in the left wing leading edge. Locations follow the C172S POH Sec 7; wiring routes are schematic. The battery starts the engine; once running, the alternator carries every load and recharges the battery. The magnetos don't use the bus. Your airplane's POH has the exact checklist.</p>`));
  render();
  return { destroy: () => { S3.destroy(); F.destroy(); } };
}

// ---- 3D x-ray of the electrical system (positions as in systems3d.js, per C172S POH 7) ----
function buildX(S) {
  const THREE = S.THREE, G = S.cueGroup, ACCH = 0x3b82f6, OFFH = 0x4b5160, REDH = 0xef4444;
  S.highlight([]); S.setInkOpacity(0.5);
  const parts = {}, wires = {};
  const mk = (k, geo, at, rot) => { const fill = new THREE.MeshBasicMaterial({ color: 0x0c2c6e, transparent: true, opacity: 0.85, depthTest: false, depthWrite: false }), edge = new THREE.LineBasicMaterial({ color: ACCH, transparent: true, depthTest: false });
    const m = new THREE.Mesh(geo, fill), e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edge); [m, e].forEach((o) => { o.position.set(...at); if (rot) o.rotation.set(...rot); o.renderOrder = 9; G.add(o); }); (parts[k] ||= []).push({ fill, edge, mesh: m }); };
  const wire = (k, pts, w = 2.2) => { const l = S.cueLine(pts.length, { color: ACCH, width: w, opacity: 0.95 }); l.set(pts); l.obj.material.depthTest = false; l.obj.renderOrder = 8; (wires[k] ||= []).push(l); };
  const BAT = [3.95, 4.2, -0.95], ALT = [6.7, 4.35, -0.65], BUS = [2.15, 4.55, -1.05], AV = [2.15, 5.35, 0];
  const LDG = [1.62, 6.72, -7.6], TIPL = [0.1, 7.12, -18.0], TIPR = [0.1, 7.12, 18.0], TAIL = [-18.95, 8.55, 0], BCN = [-17.75, 9.05, 0];
  const STL = [-0.35, 7.22, -18.2], STR = [-0.35, 7.22, 18.2], MAG = [3.9, 4.3, 0.55];   // landing light: left wing LE (C172S POH 7); strobes just aft of the tip
  mk("bat", new THREE.BoxGeometry(0.75, 0.6, 0.45), BAT); mk("alt", new THREE.CylinderGeometry(0.28, 0.28, 0.32, 16), ALT, [Math.PI / 2, 0, 0]); mk("bus", new THREE.BoxGeometry(0.12, 0.42, 1.2), BUS); mk("avion", new THREE.BoxGeometry(0.12, 0.5, 0.9), AV);
  mk("land", new THREE.SphereGeometry(0.24, 12, 8), LDG);
  mk("navL", new THREE.SphereGeometry(0.22, 12, 8), TIPL); mk("navR", new THREE.SphereGeometry(0.22, 12, 8), TIPR); mk("navT", new THREE.SphereGeometry(0.2, 12, 8), TAIL);
  mk("beacon", new THREE.SphereGeometry(0.24, 12, 8), BCN);
  mk("strobes", new THREE.SphereGeometry(0.16, 10, 8), STL); mk("strobes", new THREE.SphereGeometry(0.16, 10, 8), STR);
  const pitot = buildPitot(THREE, { parent: G, depthTest: false, renderOrder: 9, fillColor: 0x0c2c6e, inkColor: ACCH, opacity: 0.85 });
  const PIT = pitot.tip; (parts.pitot ||= []).push(...pitot.parts);
  mk("mag", new THREE.CylinderGeometry(0.16, 0.16, 0.3, 12), MAG, [0, 0, Math.PI / 2]); mk("mag", new THREE.CylinderGeometry(0.16, 0.16, 0.3, 12), [MAG[0], MAG[1], -MAG[2]], [0, 0, Math.PI / 2]);
  const FW = (z, y = 4.6) => [3.55, y, z];
  wire("bat", [BAT, FW(-0.95, 4.3), BUS]); wire("alt", [ALT, [5.2, 4.6, -0.8], FW(-0.8), BUS]); wire("avion", [BUS, AV], 1.8);
  wire("land", [BUS, [1.4, 6.3, -1.1], [1.55, 6.7, -3.5], LDG], 1.8);
  wire("nav", [BUS, [1.4, 6.3, -1.1], [0.9, 6.9, -9], [0.4, 7.05, -14], TIPL], 1.6);
  wire("nav", [[1.4, 6.3, -1.1], [1.4, 6.3, 1.0], [0.6, 6.8, 6], [0.4, 7.0, 12], TIPR], 1.6);
  wire("nav", [BUS, [0.5, 3.6, -0.6], [-12, 4.6, 0], [-17.2, 6.0, 0], TAIL], 1.6);
  wire("beacon", [[-17.2, 6.0, 0], [-17.5, 8.2, 0], BCN], 1.6);
  wire("strobes", [[0.4, 7.05, -14], STL], 1.5); wire("strobes", [[0.4, 7.0, 12], STR], 1.5);
  wire("pitot", [[1.55, 6.7, -3.5], [1.4, 6.5, -7.2], pitot.plate], 1.6);
  const NAVCOL = { navL: 0xff2a2a, navR: 0x22c55e, navT: 0xf2f1ec };
  const glows = {
    land: glowSprite(S, { color: 0xfff4d4, size: 3.2 }),
    navL: glowSprite(S, { color: 0xff2a2a, size: 3.4 }),
    navR: glowSprite(S, { color: 0x22c55e, size: 3.4 }),
    navT: glowSprite(S, { color: 0xf2f1ec, size: 2.8 }),
    beacon: glowSprite(S, { color: 0xff2a2a, size: 3.8 }),
    strobesL: glowSprite(S, { color: 0xffffff, size: 3.6 }),
    strobesR: glowSprite(S, { color: 0xffffff, size: 3.6 })
  };
  const TG = tags3d(S.renderer.domElement.parentElement), T = {
    bat: [TG.add("Battery", { dx: -30, dy: 44 }), BAT], alt: [TG.add("Alternator", { dx: 30, dy: 44 }), ALT], bus: [TG.add("Bus + breakers", { dx: -40, dy: -44 }), BUS],
    land: [TG.add("Landing light", { dx: -72, dy: 20 }), LDG],
    nav: [TG.add("Nav lights", { dx: -24, dy: -28, extras: 2, cls: "nav-l", extraCls: ["nav-r", "nav-w"] }), TIPL],
    beacon: [TG.add("Beacon", { dx: 48, dy: 24 }), BCN],
    strobes: [TG.add("Strobes", { dx: 62, dy: 36, extras: 1, cls: "strobe", extraCls: ["strobe"] }), STL],
    pitot: [TG.add("Pitot heat", { dx: 36, dy: 52 }), PIT], mag: [TG.add("Magnetos (own circuit)", { dx: -10, dy: 52 }), MAG] };
  const paint = (k, on, lit, hex) => { (parts[k] || []).forEach((p) => { p.edge.color.setHex(on ? (hex || lit || ACCH) : OFFH); p.fill.color.setHex(on ? (hex || (lit ? 0x0c2c6e : 0x1a1d24)) : 0x1a1d24); p.fill.opacity = on && hex ? 0.95 : 0.85; }); (wires[k] || []).forEach((l) => { l.obj.material.color.setHex(on ? ACCH : OFFH); l.opacity = on ? 0.95 : 0.55; }); };
  paint("mag", true, ACCH, 0xffffff);
  let st = { land: false, nav: false, beacon: false, strobes: false };
  return {
    set(o) { paint("bat", o.bat, ACCH); paint("alt", o.alt || o.altBad, o.altBad ? REDH : ACCH, o.altBad ? 0x4a0d0d : 0x0c2c6e); paint("bus", o.bus, ACCH); paint("avion", o.avion, ACCH); paint("pitot", o.pitot, ACCH); paint("land", o.land, ACCH, o.land ? 0xfff4d4 : 0);
      paint("nav", o.nav, ACCH); paint("navL", o.nav, ACCH, o.nav ? NAVCOL.navL : 0); paint("navR", o.nav, ACCH, o.nav ? NAVCOL.navR : 0); paint("navT", o.nav, ACCH, o.nav ? NAVCOL.navT : 0);
      paint("beacon", o.beacon, ACCH, o.beacon ? 0xff2a2a : 0); paint("strobes", o.strobes, ACCH, o.strobes ? 0xf2f1ec : 0);
      st = { land: !!o.land, nav: !!o.nav, beacon: !!o.beacon, strobes: !!o.strobes };
      T.alt[0].el.classList.toggle("bad", !!o.altBad); S.kick(); },
    pulse(t, on = st) {
      glows.land.set(LDG, on.land ? 0.85 : 0);
      glows.navL.set(TIPL, on.nav ? 0.95 : 0); glows.navR.set(TIPR, on.nav ? 0.95 : 0); glows.navT.set(TAIL, on.nav ? 0.8 : 0);
      glows.beacon.set(BCN, on.beacon ? lightPulse(t, "beacon") : 0);
      const fl = on.strobes ? lightPulse(t, "strobe") : 0; glows.strobesL.set(STL, fl); glows.strobesR.set(STR, fl);
    },
    place() { const stg = S.renderer.domElement.parentElement, top = Math.max(34, ...[...stg.querySelectorAll(".corner")].map((e) => e.offsetTop + e.offsetHeight + 6));
      TG.place([
        { t: T.bat[0], q: S.project(BAT) }, { t: T.alt[0], q: S.project(ALT) }, { t: T.bus[0], q: S.project(BUS) },
        { t: T.land[0], q: S.project(LDG) },
        { t: T.nav[0], q: S.project(TIPL), qs: [S.project(TIPR), S.project(TAIL)] },
        { t: T.beacon[0], q: S.project(BCN) },
        { t: T.strobes[0], q: S.project(STL), qs: [S.project(STR)] },
        { t: T.pitot[0], q: S.project(PIT) }, { t: T.mag[0], q: S.project(MAG) }
      ], top); }
  };
}
