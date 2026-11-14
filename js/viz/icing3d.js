// Anti-ice vs deice, in 3D on the 172's left wing. Fly into icing and watch ice build on the leading edge and pitot tube;
// pick the protection: none, pitot heat only, pneumatic deice boots (cycle them to crack the ice off), thermal (heated)
// anti-ice, or a weeping wing (antifreeze fluid). The 172 itself has only pitot heat; boots, heat and weeping-wing panels
// are drawn on it to show where they go on airplanes that have them.
// Facts, PHAK 7 (Anti-Ice and Deice Systems): anti-ice prevents ice, deice removes it; most light airplanes have only a
// heated pitot tube, aren't certified for flight in icing and must exit icing immediately; boots are rubber sheets inflated
// by a pneumatic pump to crack the ice off, some residual ice may remain; cycle them as soon as ice is seen (modern boots
// don't "bridge"); thermal anti-ice should be on before entering icing; a weeping wing pumps antifreeze through small
// holes to prevent ice and can also deice; none is meant for long flight in icing. AC 91-74B: water that runs back past a
// heated area can refreeze behind it (runback ice). Ice growth rates and the lift/drag meters are illustrative.
import { frame, chips, row } from "./base.js?v=5436de0cbc";
import { h } from "../core/util.js?v=5436de0cbc";
import { planeStage } from "./planestage.js?v=5436de0cbc";
import { tags3d } from "./tags3d.js?v=5436de0cbc";
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
  const S = planeStage(F.stage, { view: { tg: [0.6, 6.4, -9.5], az: -38, el: 9, d: 24 }, maxFps: 30 }), THREE = S.THREE, G = S.cueGroup;
  const topY = () => { const c = F.stage.querySelector(".corner.tl"), r = F.stage.querySelector(".corner.tr"); return Math.max(34, ...[c, r].filter(Boolean).map((e) => e.offsetTop + e.offsetHeight + 6)); };
  S.highlight([]);
  const mat = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op });
  const curve = (a0, a1, dx = 0, dy = 0) => new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => { const p = LE(a0 + ((a1 - a0) * i) / 8); return new THREE.Vector3(p[0] + dx, p[1] + dy, p[2]); }));
  const tube = (c, r, m) => { const o = new THREE.Mesh(new THREE.TubeGeometry(c, 24, r, 8, false), m); G.add(o); return o; };
  // protection hardware (shown per choice)
  const boot = tube(curve(2.2, 15.5, -0.02), 0.2, mat(0x0c2c6e)), bootE = new THREE.LineSegments(new THREE.EdgesGeometry(boot.geometry, 40), new THREE.LineBasicMaterial({ color: ACC })); boot.add(bootE);
  const heat = tube(curve(2.2, 17.3, -0.02), 0.19, mat(HEAT, 0.75));
  const weep = new THREE.Group(); G.add(weep); for (let i = 0; i < 22; i++) { const p = LE(2.4 + i * 0.68); const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(FLUID)); d.position.set(p[0] - 0.33, p[1], p[2]); weep.add(d); }
  const panel = tube(curve(2.2, 17.3, -0.02), 0.17, mat(0x0e3a44, 0.9)); panel.add(new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry, 40), new THREE.LineBasicMaterial({ color: FLUID })));
  // pitot tube: under the left wing, pointing forward
  const PIT = [2.2, 6.25, -11.8], pit = new THREE.Group(); G.add(pit);
  const pg = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 10); pg.rotateZ(Math.PI / 2); pg.translate(PIT[0] - 0.4, PIT[1], PIT[2]); const pm = new THREE.Mesh(pg, mat(0x0a0a0b)); pit.add(pm);
  const pe = new THREE.LineSegments(new THREE.EdgesGeometry(pg, 30), new THREE.LineBasicMaterial({ color: 0xffffff })); pit.add(pe);
  const sg = new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6); sg.translate(PIT[0] - 0.9, PIT[1] + 0.21, PIT[2]); pit.add(new THREE.Mesh(sg, mat(0x0a0a0b)), new THREE.LineSegments(new THREE.EdgesGeometry(sg, 30), pe.material));
  const pIce = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mat(ICE, 0.9)); pIce.position.set(PIT[0] + 0.25, PIT[1], PIT[2]); G.add(pIce);
  // ice on the leading edge and runback ice behind a heated strip
  const iceM = mat(ICE, 0.88); let iceMesh = null, iceR = -1, runMesh = null, runR = -1;
  const TG = tags3d(F.stage), tIce = TG.add("Ice", { dx: -40, dy: -46 }), tProt = TG.add("Rubber boot", { dx: 30, dy: 52 }), tPit = TG.add("Pitot tube", { dx: 34, dy: 34 }), tRun = TG.add("Runback ice", { dx: 30, dy: -50 });
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
    if (r !== iceR) { iceR = r; if (iceMesh) { G.remove(iceMesh); iceMesh.geometry.dispose(); iceMesh = null; } if (r > 0.02) { iceMesh = tube(curve(1.6, 17.6, -0.1 - r * 0.18), 0.06 + r * 0.26, iceM); iceMesh.scale.set(1, 1, 1); } }
    const rr = Math.round(run * 20) / 20;
    if (rr !== runR) { runR = rr; if (runMesh) { G.remove(runMesh); runMesh.geometry.dispose(); runMesh = null; } if (rr > 0.02) runMesh = tube(curve(2.4, 16.5, -1.15, 0.36), 0.03 + rr * 0.1, iceM); }
    const inf = bootT > 0 ? Math.sin(Math.min(1, (1 - bootT) * 2) * Math.PI) : 0; boot.scale.set(1, 1, 1); boot.material.color.setHex(inf > 0.3 ? 0x1d4ed8 : 0x0c2c6e); bootE.material.color.setHex(inf > 0.3 ? 0xffffff : ACC);
    boot.position.set(-inf * 0.12, inf * 0.03, 0);
    pIce.visible = pice > 0.05; pIce.scale.setScalar(0.08 + pice * 0.22); pe.material.color.setHex(prot !== "none" ? HEAT : 0xffffff);
    const liftV = 1 - ice * 0.45 - run * 0.2, dragV = 0.3 + ice * 0.6 + run * 0.3; mLift.style.width = `${Math.round(liftV * 100)}%`; mDrag.style.width = `${Math.round(Math.min(1, dragV) * 100)}%`;
    tIce.on = ice > 0.05; tRun.on = run > 0.1; tProt.on = prot === "boots" || prot === "heated" || prot === "weep";
    tProt.el.textContent = { boots: "Rubber boot", heated: "Heated leading edge", weep: "Antifreeze holes" }[prot] || "";
    TG.place([{ t: tIce, q: S.project([...LE(14)].map((v, i) => (i === 0 ? v - 0.3 : v))) }, { t: tProt, q: S.project(LE(5.5)) }, { t: tPit, q: S.project([PIT[0] - 0.2, PIT[1], PIT[2]]) }, { t: tRun, q: S.project([LE(9)[0] - 1.15, LE(9)[1] + 0.4, -9]) }], topY());
    caption();
    const prevent = prot === "heated" || prot === "weep";
    const iceMoving = icing && (prevent ? (ice > 0 || (prot === "heated" && run < 0.6)) : ice < 1);
    const piceMoving = icing && (prot === "none" ? pice < 1 : pice > 0);
    return bootT > 0 || iceMoving || piceMoving; }, { idle: true });
  let capK = "";
  function caption() { let cap = SAY[prot];
    if (prot === "none" && ice > 0.05) cap = ["Ice building", "Ice adds drag and destroys lift, and it blocks the pitot tube. With no protection, leave icing now."];
    if (prot === "pitot" && ice > 0.05) cap = ["Wing icing up", "Pitot heat keeps the airspeed working, but the wing still ices. Leave icing conditions."];
    if (prot === "boots" && cycled && bootT === 0) cap = ["Boots cycled", "Inflating cracked the ice off. Some residual ice can stay; cycle again as more builds."];
    if (prot === "heated" && run > 0.1) cap = ["Runback ice", "Water can run back past the heated area and refreeze behind it. Leave icing conditions."];
    const k = cap.join("|"); if (k !== capK) { capK = k; F.caption(cap[0], cap[1]); } }
  function upd() { ib.textContent = icing ? "Exit icing" : "Enter icing"; ib.classList.toggle("on", icing); cb.disabled = prot !== "boots"; pick.set(prot);
    boot.visible = prot === "boots"; heat.visible = prot === "heated"; weep.visible = panel.visible = prot === "weep"; S.kick(); }
  F.explain(`<p>Anti-ice prevents ice; deice removes it. None of these systems is meant for long flights in icing. Your airplane's POH says whether it is approved for known icing; most trainers, including the 172, have only pitot heat. The boots, heat and weeping-wing panels are drawn on the 172's wing just to show where they go. <span class="src">PHAK 7 · AC 91-74B</span></p>`);
  upd();
  return { destroy() { S.destroy(); F.destroy(); } };
}
