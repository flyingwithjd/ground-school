// Cabin heat and carbon monoxide in 3D (x-ray of the 172's nose). Outside air enters the cowling, warms in a shroud around
// the exhaust muffler, goes through the cabin heat valve on the firewall and out of the floor outlets and the windshield
// defroster; the cabin air knob adds unheated fresh air. A cracked muffler lets exhaust (CO) into the heated air; the CO
// detector reads it. Run the CO checklist to clear it.
// Facts: PHAK 7 (Exhaust Heating Systems); C172S NAV III POH 3/7: cabin heat is ambient air heated in an exhaust shroud; a
// crack in the exhaust inside the shroud lets fumes into the cabin; CO LVL HIGH at 50 ppm or more; checklist: CABIN HT OFF,
// CABIN AIR ON, vents OPEN, windows OPEN (163 KIAS max), land as soon as practical if it stays on. The ppm values are
// illustrative; only the 50 ppm alarm point is from the POH. Duct routing and part positions are approximate.
import { frame, chips, row } from "./base.js?v=494609bb62";
import { h } from "../core/util.js?v=494609bb62";
import { planeStage } from "./planestage.js?v=494609bb62";
import { tags3d } from "./tags3d.js?v=494609bb62";
const ACC = 0x3b82f6, HOT = 0xf59e0b, RED = 0xef4444, OFF = 0x4b5160, ALARM = 50;
export function mount(host) {
  const F = frame(host, { cls: "heat3d capin", corners: { tl: "Cabin heat and CO", tr: "PHAK 7 · POH 3, 7" } });
  const S = planeStage(F.stage, { view: { tg: [4.0, 4.1, 0], az: -52, el: 18, d: 17 }, maxFps: 30 }), THREE = S.THREE, G = S.cueGroup;
  const topY = () => { const c = F.stage.querySelector(".corner.tl"), r = F.stage.querySelector(".corner.tr"); return Math.max(34, ...[c, r].filter(Boolean).map((e) => e.offsetTop + e.offsetHeight + 6)); };
  S.highlight([]); S.setInkOpacity(0.35);
  const xm = (c, op = 0.85) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthTest: false, depthWrite: false });
  const xl = (c) => new THREE.LineBasicMaterial({ color: c, transparent: true, depthTest: false });
  const solid = (geo, at, c, ec, rot) => { const g = new THREE.Group(), m = new THREE.Mesh(geo, xm(c)), e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), xl(ec)); g.add(m, e); g.position.set(...at); if (rot) g.rotation.set(...rot); m.renderOrder = 8; e.renderOrder = 9; G.add(g); return { g, m, e }; };
  const MUF = [5.3, 3.05, 0.35];
  const muff = solid(new THREE.CylinderGeometry(0.2, 0.2, 1.3, 14), MUF, 0x1a1a1c, 0x9ca3af, [0, 0, Math.PI / 2]);
  const shroud = solid(new THREE.CylinderGeometry(0.34, 0.34, 1.0, 16, 1, true), MUF, 0x3b2a0a, HOT, [0, 0, Math.PI / 2]); shroud.m.material.opacity = 0.35;
  const VALVE = [3.66, 3.55, 0.55], valve = solid(new THREE.BoxGeometry(0.12, 0.34, 0.34), VALVE, 0x0c2c6e, ACC), flap = solid(new THREE.BoxGeometry(0.04, 0.28, 0.02), VALVE, 0xffffff, 0xffffff);
  const AIRV = [3.66, 4.0, -0.6]; solid(new THREE.BoxGeometry(0.12, 0.3, 0.3), AIRV, 0x0c2c6e, ACC);
  const crackM = solid(new THREE.BoxGeometry(0.08, 0.42, 0.08), [MUF[0], MUF[1], MUF[2] + 0.22], RED, RED);
  // flows: dotted particles along paths
  const flows = [], flow = (pts, col, n, sz = 0.06) => { const l = S.cueLine(pts.length, { color: OFF, width: 2, opacity: 0.7 }); l.set(pts); l.obj.material.depthTest = false; l.obj.renderOrder = 7;
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0);
    const dots = Array.from({ length: n }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(sz, 6, 5), xm(col, 1)); d.renderOrder = 10; G.add(d); return d; });
    const o = { l, curve, dots, on: false, col }; flows.push(o); return o; };
  const fIn = flow([[6.85, 3.2, 0.7], [6.1, 3.1, 0.55], [MUF[0] + 0.5, MUF[1], MUF[2]]], ACC, 6);
  const fHeat = flow([[MUF[0] - 0.5, MUF[1], MUF[2]], [4.5, 3.3, 0.6], VALVE], HOT, 6);
  const fFloor = flow([VALVE, [3.0, 3.25, 0.5], [2.2, 3.05, 0.6], [1.2, 3.05, 0.7]], HOT, 7);
  const fDef = flow([VALVE, [3.2, 4.3, 0.4], [2.6, 5.3, 0.2], [2.2, 5.75, 0.0]], HOT, 6);
  const fAir = flow([[6.85, 4.0, -0.7], [5.3, 4.1, -0.65], AIRV, [2.6, 3.6, -0.7], [1.4, 3.6, -0.8]], ACC, 8);
  const fCO = flow([[MUF[0], MUF[1] + 0.2, MUF[2] + 0.2], [4.5, 3.4, 0.6], VALVE, [2.6, 3.4, 0.5], [1.3, 4.2, 0.2], [0.2, 4.8, -0.4]], RED, 8, 0.075);
  const TG = tags3d(F.stage), tM = TG.add("Muffler + heat shroud", { dx: 30, dy: 50 }), tV = TG.add("Cabin heat valve", { dx: -30, dy: -50 }), tD = TG.add("Defroster", { dx: -30, dy: -36 }), tA = TG.add("Cabin air", { dx: -34, dy: 40 }), tC = TG.add("Crack", { dx: 34, dy: -40 });
  // CO detector readout
  const ppmEl = h("b"), lab = h("small"), det = h("div", { class: "pr-t co-t" }, h("span", {}, "CO detector"), ppmEl, lab);
  let heat = true, air = false, vents = false, crack = false, ppm = 0;
  const hc = chips(row(F.ctrl, "Cabin heat"), [["on", "Heat on"], ["off", "Heat off"]], "on", (k) => { heat = k !== "off"; upd(); }, { label: "Cabin heat" });
  const ac = chips(row(F.ctrl, "Fresh air"), [["off", "Closed"], ["on", "Cabin air on"], ["all", "Plus vents and windows"]], "off", (k) => { air = k === "on" || k === "all"; vents = k === "all"; upd(); }, { label: "Fresh air" });
  const r3 = row(F.ctrl, "Muffler"); const g3 = h("div", { class: "chips", role: "group", "aria-label": "Muffler" }); r3.append(g3);
  const kb = h("button", { class: "chip", type: "button" }, "Crack the muffler"), cl = h("button", { class: "chip", type: "button" }, "Run CO checklist"); g3.append(kb, cl);
  F.ctrl.append(h("div", { class: "pr-p co-p" }, det));
  kb.onclick = () => { crack = !crack; upd(); };
  cl.onclick = () => { heat = false; air = true; vents = true; hc.set("off"); ac.set("all"); upd(); };
  const target = () => (crack && heat ? 140 * (air ? 0.7 : 1) * (vents ? 0.4 : 1) : crack ? (vents ? 4 : air ? 10 : 20) : 0);
  function upd() { kb.textContent = crack ? "Fix the muffler" : "Crack the muffler"; kb.classList.toggle("on", crack);
    fIn.on = true; fHeat.on = fFloor.on = fDef.on = heat; fAir.on = air; fCO.on = crack && heat; crackM.g.visible = crack;
    flap.g.rotation.y = heat ? Math.PI / 2 : 0; shroud.e.material.color.setHex(crack && heat ? RED : HOT);
    flows.forEach((o) => o.l.obj.material.color.setHex(o.on ? o.col : OFF)); const flowing = flows.some((o) => o.on); S.setFlow(flowing); if (flowing) F.root.dataset.live = "1"; }
  let last = performance.now(), ph = 0, capK = "";
  S.animate(() => { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; ph = (ph + dt * 0.45) % 1;
    const t = target(); ppm += (t - ppm) * Math.min(1, dt * 0.8); if (Math.abs(ppm - t) < 0.5) ppm = t;
    flows.forEach((o) => o.dots.forEach((d, i) => { d.visible = o.on; if (o.on) d.position.copy(o.curve.getPointAt(((i + ph) / o.dots.length) % 1)); }));
    const alarm = ppm >= ALARM; ppmEl.textContent = `${Math.round(ppm)} ppm`; lab.textContent = alarm ? "CO LVL HIGH" : `alarm at ${ALARM} ppm`; det.classList.toggle("bad", alarm);
    tC.on = crack; tA.on = air;
    TG.place([{ t: tM, q: S.project([MUF[0] + 0.3, MUF[1] - 0.3, MUF[2]]) }, { t: tV, q: S.project(VALVE) }, { t: tD, q: S.project([2.2, 5.75, 0]) }, { t: tA, q: S.project(AIRV) }, { t: tC, q: S.project([MUF[0], MUF[1] + 0.2, MUF[2] + 0.22]) }], topY());
    let cap;
    if (alarm) cap = ["Carbon monoxide", "Exhaust is leaking into the heated air. Heat off, cabin air on, vents and windows open."];
    else if (crack && heat) cap = ["CO rising", "A cracked muffler lets exhaust into the shroud air. Carbon monoxide has no smell or color."];
    else if (crack) cap = ["Heat off, air in", "Fresh air is flushing the cabin. If the alarm or the symptoms stay, land as soon as practical."];
    else if (heat) cap = ["Cabin heat on", "Outside air warms around the exhaust muffler, then flows into the cabin and the defroster."];
    else cap = ["Cabin heat off", "The cabin heat valve is closed. Fresh air still comes in through the cabin air knob and vents."];
    if (cap[0] !== capK) { capK = cap[0]; F.caption(cap[0], cap[1]); }
    return flows.some((o) => o.on) || Math.abs(ppm - t) >= 0.5; }, { idle: true });
  F.explain(`<p>Orange dots are heated air, blue is fresh outside air, red is exhaust. The alarm point is the G1000 172S POH's (50 ppm); the ppm readings are illustrations. Your airplane's POH has its own checklist. <span class="src">PHAK 7 · C172S POH 3, 7</span></p>`);
  upd();
  return { destroy() { S.destroy(); F.destroy(); } };
}
