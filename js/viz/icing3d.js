// Anti-ice vs deice, in 3D on the 172's left wing. Fly into icing and watch ice build on the leading edge and pitot tube;
// C172S POH 7: a heated pitot tube is mounted on the lower surface of the left wing; the model's lift-strut wing attach is at
// 8.4 ft span, so the pitot sits just outboard of that (mid-span), hanging under the wing with its tip ahead of the leading edge.
// pick the protection: none, pitot heat only, pneumatic deice boots (cycle them to crack the ice off), thermal (heated)
// anti-ice, or a weeping wing (antifreeze fluid). The 172 itself has only pitot heat; boots, heat and weeping-wing panels
// are drawn on it to show where they go on airplanes that have them.
// Facts, PHAK 7 (Anti-Ice and Deice Systems): anti-ice prevents ice, deice removes it; most light airplanes have only a
// heated pitot tube, aren't certified for flight in icing and must exit icing immediately; boots are rubber sheets inflated
// by a pneumatic pump to crack the ice off, some residual ice may remain; cycle them as soon as ice is seen (modern boots
// don't "bridge"); thermal anti-ice should be on before entering icing; a weeping wing pumps antifreeze through small
// holes to prevent ice and can also deice; none is meant for long flight in icing. AC 91-74B: water that runs back past a
// heated area can refreeze behind it (runback ice). Ice growth rates and the lift/drag meters are illustrative.
import { frame, chips, row } from "./base.js?v=494609bb62";
import { h } from "../core/util.js?v=494609bb62";
import { planeStage } from "./planestage.js?v=494609bb62";
import { tags3d } from "./tags3d.js?v=494609bb62";
const ACC = 0x3b82f6, ICE = 0xd6ecff, HEAT = 0xef4444, FLUID = 0x22d3ee, DIH = Math.tan(1.73 * Math.PI / 180);
const SAY = {
  none: ["No protection", "Most trainers aren't certified for icing. If you meet it, exit at once: turn back or change altitude."],
  pitot: ["Pitot heat only", "It keeps the pitot tube clear so the airspeed indicator works. The wing still collects ice."],
  boots: ["Deice boots", "Boots remove ice after it forms: inflating them cracks it off. Cycle them as soon as you see ice."],
  heated: ["Thermal anti-ice", "Heat keeps ice from forming at all. Turn it on before you enter icing conditions."],
  weep: ["Weeping wing", "Antifreeze weeps out of tiny holes: it prevents ice and can also loosen ice that already formed."],
};
const LE = (a) => { const o = Math.min(1, Math.max(0, (a - 7.5) / 10.54)); return [1.6 + (1.15 - 1.6) * o, 6.62 + Math.max(0, a - 1.9) * DIH, -a]; };
export function mount(host) {
  const F = frame(host, { cls: "icing3d capin", corners: { tl: "Anti-ice and deice", tr: "PHAK 7" } });
  // 3/4 view of the mid-span leading edge and pitot, high enough to see runback ice sitting aft on the upper surface
  const S = planeStage(F.stage, { view: { tg: [1.15, 6.35, -8.6], az: -40, el: 20, d: 15.5 }, maxFps: 30 }), THREE = S.THREE, G = S.cueGroup;
  const topY = () => { const c = F.stage.querySelector(".corner.tl"), r = F.stage.querySelector(".corner.tr"); return Math.max(34, ...[c, r].filter(Boolean).map((e) => e.offsetTop + e.offsetHeight + 6)); };
  const band = () => S.setTopBand(topY()); band(); requestAnimationFrame(band);
  S.highlight([]);
  const mat = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op });
  const curve = (a0, a1, dx = 0, dy = 0) => new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => { const p = LE(a0 + ((a1 - a0) * i) / 8); return new THREE.Vector3(p[0] + dx, p[1] + dy, p[2]); }));
  const tube = (c, r, m) => { const o = new THREE.Mesh(new THREE.TubeGeometry(c, 24, r, 8, false), m); G.add(o); return o; };
  // protection hardware (shown per choice)
  const boot = tube(curve(2.2, 15.5, -0.02), 0.2, mat(0x0c2c6e)), bootE = new THREE.LineSegments(new THREE.EdgesGeometry(boot.geometry, 40), new THREE.LineBasicMaterial({ color: ACC })); boot.add(bootE);
  const heat = tube(curve(2.2, 17.3, -0.02), 0.19, mat(HEAT, 0.75));
  const weep = new THREE.Group(); G.add(weep); for (let i = 0; i < 22; i++) { const p = LE(2.4 + i * 0.68); const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(FLUID)); d.position.set(p[0] - 0.33, p[1], p[2]); weep.add(d); }
  const panel = tube(curve(2.2, 17.3, -0.02), 0.17, mat(0x0e3a44, 0.9)); panel.add(new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry, 40), new THREE.LineBasicMaterial({ color: FLUID })));
  // pitot: just outboard of the strut (8.4 ft), under the left wing, tip clearly ahead of the leading edge (POH 7)
  const STA = 9.0, leP = LE(STA), mastX = leP[0] - 0.06, mastY0 = leP[1] - 0.18, tipY = mastY0 - 0.42, tipX = leP[0] + 1.7;
  const PIT = [tipX, tipY, leP[2]], pit = new THREE.Group(); G.add(pit);
  const mastG = new THREE.CylinderGeometry(0.04, 0.05, mastY0 - tipY, 8); mastG.translate(mastX, (mastY0 + tipY) / 2, leP[2]);
  const tubeLen = tipX - mastX, tubeG = new THREE.CylinderGeometry(0.045, 0.055, tubeLen, 10); tubeG.rotateZ(Math.PI / 2); tubeG.translate(mastX + tubeLen / 2, tipY, leP[2]);
  const inkP = new THREE.LineBasicMaterial({ color: 0xffffff });
  pit.add(new THREE.Mesh(mastG, mat(0x0a0a0b)), new THREE.LineSegments(new THREE.EdgesGeometry(mastG, 30), inkP));
  pit.add(new THREE.Mesh(tubeG, mat(0x0a0a0b)), new THREE.LineSegments(new THREE.EdgesGeometry(tubeG, 30), inkP));
  const pe = inkP;   // used below to flash the tube when pitot heat is on
  const pIce = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mat(ICE, 0.9)); pIce.position.set(PIT[0], PIT[1], PIT[2]); G.add(pIce);
  // ice on the leading edge and runback ice behind a heated strip
  const iceM = mat(ICE, 0.95); iceM.depthTest = false; iceM.depthWrite = false; let iceMesh = null, iceR = -1, runMesh = null, runR = -1;
  const TG = tags3d(F.stage), tIce = TG.add("Ice", { dx: -42, dy: -56 }), tProt = TG.add("Rubber boot", { dx: -78, dy: 58 }), tPit = TG.add("Pitot tube", { dx: 64, dy: 46 }), tRun = TG.add("Runback ice", { dx: 8, dy: -62 });
  // meters
  const meters = h("div", { class: "ice-m" }); const mk = (t, cls) => { const b = h("i"); meters.append(h("div", { class: "ice-r " + cls }, h("span", {}, t), h("b", {}, b))); return b; };
  const mLift = mk("Lift", "lift"), mDrag = mk("Drag", "drag");
  let prot = "none", icing = false, ice = 0, run = 0, bootT = 0, pice = 0, cycled = false;
  const r0 = row(F.ctrl, "Protection"); const pick = chips(r0, [["none", "None"], ["pitot", "Pitot heat"], ["boots", "Boots"], ["heated", "Heated"], ["weep", "Weeping"]], prot, (k) => { prot = k || "none"; cycled = false; upd(); }, { label: "Protection" });
  const r1 = row(F.ctrl, "Fly"); const fg = h("div", { class: "chips", role: "group", "aria-label": "Fly" }); r1.append(fg);
  const ib = h("button", { class: "chip", type: "button" }, "Enter icing"), cb = h("button", { class: "chip", type: "button" }, "Cycle boots"), xb = h("button", { class: "chip", type: "button" }, "Start over"); fg.append(ib, cb, xb);
  F.ctrl.append(meters);
  ib.onclick = () => { icing = !icing; upd(); }; cb.onclick = () => { if (prot === "boots") { bootT = 1; cycled = true; upd(); } };
  xb.onclick = () => { icing = false; ice = 0; run = 0; pice = 0; bootT = 0; cycled = false; upd(); };
  let last = performance.now();
  S.animate(() => { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (bootT > 0) { bootT = Math.max(0, bootT - dt * 0.9); if (bootT < 0.5 && ice > 0.12) ice = Math.max(0.1, ice * 0.15); }
    if (icing) { const prevent = prot === "heated" || prot === "weep";
      if (prevent) { if (ice > 0) ice = Math.max(0, ice - dt * (prot === "weep" ? 0.25 : 0.5)); if (prot === "heated" && run < 0.6) run = Math.min(0.6, run + dt * 0.08); }
      else if (ice < 1) ice = Math.min(1, ice + dt * 0.16);
      if (prot === "none") pice = Math.min(1, pice + dt * 0.25); else pice = Math.max(0, pice - dt * 0.5); }
    // geometry follows the state
    const r = Math.round(ice * 20) / 20;
    if (r !== iceR) { iceR = r; if (iceMesh) { G.remove(iceMesh); iceMesh.traverse((o) => o.geometry && o.geometry.dispose()); iceMesh = null; }
      if (r > 0.02) { iceMesh = new THREE.Group(); G.add(iceMesh); iceMesh.add(tube(curve(2.2, 15.8, 0.1 + r * 0.12, 0), 0.10 + r * 0.30, iceM));
        for (let i = 0; i < 7; i++) { const p = LE(3.0 + i * 1.7); const s = new THREE.Mesh(new THREE.SphereGeometry(0.11 + r * 0.26, 8, 6), iceM); s.position.set(p[0] + 0.18 + r * 0.28, p[1], p[2]); s.scale.set(1.7, 0.75, 0.85); iceMesh.add(s); } } }
    const rr = Math.round(run * 20) / 20;
    // runback sits on the upper surface just aft of the heated leading-edge strip (not above or ahead of the LE)
    if (rr !== runR) { runR = rr; if (runMesh) { G.remove(runMesh); runMesh.geometry.dispose(); runMesh = null; } if (rr > 0.02) runMesh = tube(curve(3.2, 15.2, -1.05 - rr * 0.2, 0.28), 0.08 + rr * 0.16, iceM); }
    const inf = bootT > 0 ? Math.sin(Math.min(1, (1 - bootT) * 2) * Math.PI) : 0; boot.scale.set(1, 1, 1); boot.material.color.setHex(inf > 0.3 ? 0x1d4ed8 : 0x0c2c6e); bootE.material.color.setHex(inf > 0.3 ? 0xffffff : ACC);
    boot.position.set(-inf * 0.12, inf * 0.03, 0);
    pIce.visible = pice > 0.05; pIce.scale.setScalar(0.07 + pice * 0.16); pe.color.setHex(prot === "pitot" ? HEAT : 0xffffff);
    const liftV = 1 - ice * 0.45 - run * 0.2, dragV = 0.3 + ice * 0.6 + run * 0.3; mLift.style.width = `${Math.round(liftV * 100)}%`; mDrag.style.width = `${Math.round(Math.min(1, dragV) * 100)}%`;
    tIce.on = ice > 0.05; tRun.on = run > 0.1; tProt.on = prot === "boots" || prot === "heated" || prot === "weep"; tPit.on = true;
    tProt.el.textContent = { boots: "Rubber boot", heated: "Heated leading edge", weep: "Antifreeze holes" }[prot] || "";
    const heatAt = LE(3.4), runAt = LE(10.4); TG.place([{ t: tIce, q: S.project(LE(12.4)) }, { t: tProt, q: S.project(heatAt) }, { t: tPit, q: S.project(PIT) }, { t: tRun, q: S.project([runAt[0] - 1.2, runAt[1] + 0.32, runAt[2]]) }], topY());
    caption();
    const prevent = prot === "heated" || prot === "weep";
    const iceMoving = icing && (prevent ? (ice > 0 || (prot === "heated" && run < 0.6)) : ice < 1);
    const piceMoving = icing && (prot === "none" ? pice < 1 : pice > 0);
    return bootT > 0 || iceMoving || piceMoving; }, { idle: true });
  let capK = "";
  function caption() { let cap = SAY[prot];
    if (!icing && (ice > 0.05 || pice > 0.05 || run > 0.05)) cap = ["Left icing conditions", "Ice already on the wing stays until it melts or you deice it. It still adds drag and cuts lift."];
    if (icing && prot === "none" && ice > 0.05) cap = ["Ice building", "Ice adds drag and destroys lift, and it blocks the pitot tube. With no protection, leave icing now."];
    if (icing && prot === "pitot" && ice > 0.05) cap = ["Wing icing up", "Pitot heat keeps the airspeed working, but the wing still ices. Leave icing conditions."];
    if (icing && prot === "boots" && cycled && bootT === 0) cap = ["Boots cycled", "Inflating cracked the ice off. Some residual ice can stay; cycle again as more builds."];
    if (icing && prot === "heated" && run > 0.1) cap = ["Runback ice", "Water can run back past the heated area and refreeze behind it, on the upper surface. Leave icing conditions."];
    const k = cap.join("|"); if (k !== capK) { capK = k; F.caption(cap[0], cap[1]); } }
  function upd() { ib.textContent = icing ? "Exit icing" : "Enter icing"; ib.classList.toggle("on", icing); cb.hidden = prot !== "boots"; cb.disabled = false; pick.set(prot);
    boot.visible = prot === "boots"; heat.visible = prot === "heated"; weep.visible = panel.visible = prot === "weep"; S.kick(); }
  F.explain(`<p>Anti-ice prevents ice; deice removes it. None of these systems is meant for long flights in icing. Your airplane's POH says whether it is approved for known icing; most trainers, including the 172, have only pitot heat. The boots, heat and weeping-wing panels are drawn on the 172's wing just to show where they go. <span class="src">PHAK 7 · AC 91-74B</span></p>`);
  upd();
  return { destroy() { S.destroy(); F.destroy(); } };
}
