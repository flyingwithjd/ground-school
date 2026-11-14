// Pressurization in 3D: the cabin as a pressure vessel inside the fuselage (x-ray, blue), conditioned air flowing in at
// the front, the outflow valve at the rear pressure bulkhead closing as the differential builds. Rapid or explosive
// decompression vents the cabin to the outside air. The 172 shape is a stand-in: a 172 is not pressurized.
// Numbers: an example airplane holds an 8,000 ft cabin until it reaches its maximum differential (6.1 psid, the PHAK
// example), then the cabin climbs with the airplane. Facts and pressure table: see pressurization.js (PHAK 7, Fig 7-41;
// TUC PHAK Fig 17-1). Decompression durations are illustrative.
import { frame, slider, chips, row } from "./base.js?v=43931b26b4";
import { h } from "../core/util.js?v=43931b26b4";
import { planeStage } from "./planestage.js?v=43931b26b4";
import { tags3d } from "./tags3d.js?v=43931b26b4";
import { psi, cabin } from "./pressurization.js?v=43931b26b4";
import { TUC } from "./hypoxia.js?v=43931b26b4";
const ACC = 0x3b82f6, RED = 0xef4444, MAXD = 6.1, SEL = 8000, TOP = 30000;
const tucAt = (a) => { let t = null; for (const [hh, x] of TUC) if (a >= hh) t = [hh, x]; return t; };
const ft = (v) => (Math.round(v / 100) * 100).toLocaleString() + " ft";
export function mount(host) {
  const F = frame(host, { cls: "press3d capin", corners: { tl: "Pressurization (example)", tr: "PHAK 7" } });
  const S = planeStage(F.stage, { view: { tg: [-1.2, 4.7, 0], az: -62, el: 16, d: 30 }, maxFps: 30 }), THREE = S.THREE, G = S.cueGroup;
  const topY = () => { const c = F.stage.querySelector(".corner.tl"), r = F.stage.querySelector(".corner.tr"); return Math.max(34, ...[c, r].filter(Boolean).map((e) => e.offsetTop + e.offsetHeight + 6)); };
  S.highlight([]); S.setInkOpacity(0.35);
  const xm = (c, op) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthTest: false, depthWrite: false });
  const xl = (c) => new THREE.LineBasicMaterial({ color: c, transparent: true, depthTest: false });
  const put = (o) => { o.renderOrder = 8; G.add(o); return o; };
  // the pressure vessel: cabin from the firewall to the rear pressure bulkhead
  const cg = new THREE.BoxGeometry(7.6, 3.1, 3.5); cg.translate(-0.6, 4.75, 0); const vesM = xm(ACC, 0.3), ves = put(new THREE.Mesh(cg, vesM)); const vesE = put(new THREE.LineSegments(new THREE.EdgesGeometry(cg), xl(ACC)));
  // outflow valve at the rear bulkhead: a ring with a butterfly plate
  const OV = [-4.42, 3.7, 0.9], ring = put(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 6, 20), xm(0xffffff, 1))); ring.position.set(...OV); ring.rotation.y = Math.PI / 2;
  const plate = put(new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), xm(ACC, 0.95))); plate.position.set(...OV);
  // air in (front) and out (valve); decompression vents out of a failed side window
  const inA = S.cueArrow({ color: ACC, width: 4, head: 0.6 }), outA = S.cueArrow({ color: ACC, width: 3, head: 0.5 }), leak = [0, 1, 2].map(() => S.cueArrow({ color: RED, width: 4, head: 0.6 }));
  [inA, outA, ...leak].forEach((a) => { const o = a.obj || null; if (o) { o.renderOrder = 9; } });
  const WIN = [0.3, 5.4, -1.78];
  const TG = tags3d(F.stage), tVes = TG.add("Pressurized cabin", { dx: 30, dy: -56 }), tOV = TG.add("Outflow valve", { dx: -36, dy: 46 }), tIn = TG.add("Air in", { dx: 30, dy: 40 }), tLeak = TG.add("Failed window", { dx: -30, dy: -48 });
  // readouts like a cabin pressure panel
  const tile = (t) => { const v = h("b"), s = h("small"); const el = h("div", { class: "pr-t" }, h("span", {}, t), v, s); return { el, v, s }; };
  const tA = tile("Airplane"), tC = tile("Cabin altitude"), tD = tile("Differential"); const dbar = h("i"); tD.s.append(h("em", {}, dbar));
  const panel = h("div", { class: "pr-p" }, tA.el, tC.el, tD.el);
  let a = 20000, mode = "ok", cab = cabin(a).alt, dur = 3;
  slider(row(F.ctrl, "Altitude"), { label: "Aircraft altitude", min: 0, max: TOP, step: 500, value: a, fmt: (x) => x.toLocaleString() + " ft", oninput: (x) => { a = x; if (mode === "ok") cab = cabin(a).alt; S.kick(); } });
  chips(row(F.ctrl, "Cabin"), [["ok", "Pressurized"], ["rapid", "Rapid decompression"], ["expl", "Explosive decompression"]], mode, (k) => { mode = k || "ok"; dur = mode === "expl" ? 0.4 : 3; if (mode === "ok") cab = cabin(a).alt; S.kick(); }, { label: "Cabin" });
  F.ctrl.append(panel);
  let last = performance.now(), ph = 0;
  S.animate(() => { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; ph = (ph + dt * 0.8) % 1;
    if (mode !== "ok" && cab < a) cab = Math.min(a, cab + (dt / dur) * Math.max(1500, a - SEL));
    const d = mode === "ok" ? cabin(a).d : Math.max(0, psi(cab) - psi(a)), open = mode === "ok" ? Math.max(0.1, 1 - (d / MAXD) * 0.9) : 1, venting = mode !== "ok" && cab < a - 1;
    vesM.opacity = 0.08 + 0.32 * (d / MAXD); vesE.material.color.setHex(mode === "ok" ? ACC : RED); plate.rotation.set(0, Math.PI / 2 - open * 1.3, 0);
    const s = 0.6 + 0.4 * Math.sin(ph * Math.PI * 2);
    inA.set([6.2, 4.4, 0.6], [3.2, 4.6, 0.6]); inA.opacity = mode === "ok" && a > 0 ? 1 : 0.15;
    outA.set([OV[0], OV[1], OV[2]], [OV[0] - 1.4 * open - 0.2, OV[1] - 0.2, OV[2]]); outA.opacity = mode === "ok" ? 0.4 + 0.6 * open : 0;
    leak.forEach((l, i) => { const ang = (i - 1) * 0.45; l.set(WIN, [WIN[0] + Math.sin(ang) * 2.6, WIN[1] + (i - 1) * 0.5, WIN[2] - 2.4 * s]); l.opacity = venting ? 1 : 0; });
    tLeak.on = mode !== "ok"; tIn.on = mode === "ok";
    TG.place([{ t: tVes, q: S.project([-2.4, 6.25, -1.75]) }, { t: tOV, q: S.project(OV) }, { t: tIn, q: S.project([4.4, 4.5, 0.6]) }, { t: tLeak, q: S.project(WIN) }], topY());
    tA.v.textContent = ft(a); tA.s.textContent = psi(a).toFixed(1) + " psi outside"; tC.v.textContent = ft(cab); tC.el.classList.toggle("bad", mode !== "ok");
    const t = tucAt(cab); tC.s.textContent = mode !== "ok" && t ? "useful consciousness " + t[1] : psi(cab).toFixed(1) + " psi inside";
    tD.v.textContent = d.toFixed(1) + " psid"; dbar.style.width = `${Math.min(100, (d / 7) * 100)}%`; dbar.classList.toggle("max", d >= MAXD - 0.01);
    caption(d);
    const flowing = mode === "ok" ? a > 0 : cab < a; S.setFlow(flowing); if (flowing) F.root.dataset.live = "1";
    return flowing; }, { idle: true });
  let capK = "";
  function caption(d) { let cap;
    if (mode !== "ok" && cab >= a - 1) cap = ["Cabin equals airplane altitude", "The cabin is now at " + ft(cab) + ", the same as the airplane. Oxygen mask on, then descend."];
    else if (mode === "expl") cap = ["Explosive decompression", "Faster than your lungs can empty, under half a second: noise, fog, flying debris. Oxygen mask on now."];
    else if (mode === "rapid") cap = ["Rapid decompression", "The cabin climbs to the airplane's altitude in seconds. Oxygen mask on first, then descend."];
    else if (a <= SEL) cap = ["Below the cabin setting", "The outflow valve is open, so the cabin climbs with the airplane until the set cabin altitude."];
    else if (d >= MAXD - 0.01) cap = ["Maximum differential", "The structure can't hold more pressure difference, so above this the cabin climbs with you."];
    else cap = ["Cabin held at 8,000 ft", "The outflow valve closes as you climb, holding the cabin while the pressure difference builds."];
    const k = cap[0] + cap[1]; if (k !== capK) { capK = k; F.caption(cap[0], cap[1]); } }
  F.explain(`<p>An example airplane with a 6.1 psid limit and the cabin set to 8,000 ft, drawn on the 172's shape (a 172 is not pressurized). Air is pumped into the sealed cabin and the <b>outflow valve</b> at the rear bulkhead lets it out at a controlled rate; closing it holds the cabin lower than the airplane. Your airplane's POH gives its own limits. Decompression speeds are illustrations. <span class="src">PHAK 7 · PHAK 17</span></p>`);
  return { destroy() { S.destroy(); F.destroy(); } };
}
