// Airspace in 3D (AIM 3-2, 14 CFR 71): an "upside-down wedding cake" Class B, a Class C, a Class D and a non-towered airport with a
// Class E surface area and a 700 ft AGL transition area, under the Class E blanket and Class A above. Horizontal distances are to
// scale with each other (standard or typical values, marked as such); heights are exaggerated about 17x. Airports sit at sea level
// so MSL and AGL match. Tap a shell or a chip to light a class up and see its altitudes. Static scene: draws only on change.
import { frame, chips } from "./base.js?v=x";
import { planeStage } from "./planestage.js?v=x";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
const INFO = {
  A: ["Class A", "18,000 ft MSL up to and including FL600", "IFR only. Not for VFR pilots.", "AIM 3-2-2"],
  B: ["Class B", "Generally surface to 10,000 ft MSL around the busiest airports, in layers like an upside-down wedding cake. Each one is tailored: the 10, 20 and 30 NM rings and 3,000/6,000 ft shelf floors shown are typical, not standard", "ATC clearance to enter. Transponder with altitude reporting and ADS-B Out within the 30 NM Mode C veil. Student pilots need specific training and an endorsement, and some Class B primary airports are off-limits to student solo.", "AIM 3-2-3 · 14 CFR 61.95, 91.131"],
  C: ["Class C", "Generally surface to 4,000 ft above the airport: a 5 NM surface area, plus a shelf out to 10 NM from 1,200 ft above the airport", "Two-way radio contact before entry. Transponder with altitude reporting and ADS-B Out.", "AIM 3-2-4"],
  D: ["Class D", "Generally surface to 2,500 ft above the airport, around airports with an operating control tower. The lateral size is tailored; about 4 NM is typical", "Two-way radio contact before entry.", "AIM 3-2-5"],
  E: ["Class E", "Controlled airspace that isn't A, B, C or D. Often begins at 700 ft AGL (magenta vignette) or 1,200 ft AGL (blue vignette), or at the surface around some airports; runs up to, not including, 18,000 ft MSL", "No ATC contact required for VFR. Weather minimums apply.", "AIM 3-2-6"],
  G: ["Class G", "Uncontrolled: whatever is left below Class E", "No ATC contact required. Lowest weather minimums.", "AIM 3-3"],
};
const INK = 0xf2f1ec, ACC = 0x3b82f6;
const NM = 0.5, Y = (ft) => (ft <= 10000 ? ft / 700 : 10000 / 700 + (ft - 10000) / 1600);   // 1 unit = 2 NM across; 700 ft up to 10,000 ft, compressed above
const GX = [-38, 25], GZ = [-17, 17];   // ground extent
// airports: [x, z]
const APT = { B: [-20, 0], C: [5, -8], D: [6, 9], E: [19, 1] };
// shells: [class, center, inner NM, outer NM, floor ft, top ft, faint?]
const SHELLS = [
  ["B", APT.B, 0, 10, 0, 10000], ["B", APT.B, 10, 20, 3000, 10000], ["B", APT.B, 20, 30, 6000, 10000],
  ["C", APT.C, 0, 5, 0, 4000], ["C", APT.C, 5, 10, 1200, 4000],
  ["D", APT.D, 0, 4, 0, 2500],
  ["E", APT.E, 0, 4, 0, 1200], ["E", APT.E, 4, 7, 700, 1200] ];
const TAGS = {
  A: [["18,000 MSL", [GX[1] - 6, Y(18000), GZ[1]]], ["Up to FL600 ↑", [GX[1] - 6, Y(21500), GZ[1]]]],
  B: [["10,000 MSL", [APT.B[0], Y(10000) + 1.5, APT.B[1]]], ["Floor 6,000 · typ.", [APT.B[0] - 12.5, Y(6000), APT.B[1] + 4]], ["Floor 3,000 · typ.", [APT.B[0] - 7.5, Y(3000), APT.B[1] + 4]], ["Surface", [APT.B[0], 0.4, APT.B[1] + 5]], ["10 · 20 · 30 NM · typ.", [APT.B[0], 0, APT.B[1] + 16.5]]],
  C: [["4,000 AGL", [APT.C[0], Y(4000) + 1.2, APT.C[1]]], ["Shelf 1,200 AGL", [APT.C[0] + 5, Y(1200), APT.C[1] + 4]], ["5 NM core · 10 NM shelf", [APT.C[0], 0, APT.C[1] + 6]]],
  D: [["2,500 AGL", [APT.D[0], Y(2500) + 1.2, APT.D[1]]], ["≈4 NM · typ.", [APT.D[0], 0, APT.D[1] + 3]]],
  E: [["Floor 1,200 AGL", [GX[0] + 4, Y(1200), GZ[1]]], ["700 AGL near the airport", [APT.E[0], Y(700), APT.E[1] + 4]], ["Up to 17,999 MSL", [GX[0] + 4, Y(17000), GZ[1]]], ["Surface area", [APT.E[0], 0, APT.E[1] + 3]]],
  G: [["Surface to 1,200 AGL", [GX[0] + 10, Y(600), GZ[1]]], ["Surface to 700 AGL", [APT.E[0] + 4, 0, APT.E[1] + 6]]] };
const LETTER = { A: [GX[0] + 10, Y(19750), 0], B: [APT.B[0], Y(8000), APT.B[1]], C: [APT.C[0], Y(2600), APT.C[1]], D: [APT.D[0], Y(1300), APT.D[1]], E: [2, Y(13000), 0], G: [-4, Y(600), GZ[1] - 2] };
export function mount(host) {
  let sel = "all";
  const AZ = 66;
  const F = frame(host, { cls: "capin as3d", corners: { tl: "Airspace · 3D", tr: "AIM 3-2" } });
  const empty = (THREE) => ({ root: new THREE.Group(), parts: {}, meshes: [], pose() {} });
  const S = planeStage(F.stage, { view: { tg: [0, 6, 0], az: AZ, el: 26, d: 150 }, orbit: true, maxFps: 30, model: empty, cg: [0, 0, 0], fov: 30 }); const T = S.THREE;
  const world = new T.Group(); S.scene.add(world);
  const res = new T.Vector2(1, 1), mats = [];
  const lm = (o) => { const m = new LineMaterial({ color: INK, linewidth: 1.2, transparent: true, opacity: 0.5, depthWrite: false, ...o }); mats.push(m); return m; };
  const segs = (pairs, mat) => { const g = new LineSegmentsGeometry(); g.setPositions(new Float32Array(pairs.flat(2))); const l = new LineSegments2(g, mat); if (mat.dashed) l.computeLineDistances(); l.frustumCulled = false; l.renderOrder = 4; world.add(l); return l; };
  const circ = (cx, cz, r, y, n = 72) => { const o = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2; o.push([[cx + r * Math.cos(a), y, cz + r * Math.sin(a)], [cx + r * Math.cos(b), y, cz + r * Math.sin(b)]]); } return o; };
  const box = (x0, x1, y0, y1, z0, z1) => { const c = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], o = []; for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; o.push([[a[0], y0, a[1]], [b[0], y0, b[1]]], [[a[0], y1, a[1]], [b[0], y1, b[1]]], [[a[0], y0, a[1]], [a[0], y1, a[1]]]); } return o; };
  // per class: line material + fill material, so a highlight is a colour/opacity change only
  const K = {}; const fill = (o) => new T.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.04, side: T.DoubleSide, depthWrite: false, ...o });
  for (const k of "ABCDEG") K[k] = { line: lm(k === "G" ? { dashed: true, dashSize: 1.2, gapSize: 1.2, opacity: 0.35 } : {}), fill: fill(), meshes: [] };
  const mesh = (k, geo) => { const m = new T.Mesh(geo, K[k].fill); m.userData.cls = k; m.renderOrder = 2; world.add(m); K[k].meshes.push(m); return m; };
  // ground: outline, faint grid, runway marks at each airport
  segs(box(GX[0], GX[1], 0, 0, GZ[0], GZ[1]).filter((_, i) => i % 3 !== 2), lm({ opacity: 0.8, linewidth: 1.4 }));
  const gl = []; for (let x = GX[0] + 7; x < GX[1]; x += 7) gl.push([[x, 0, GZ[0]], [x, 0, GZ[1]]]); for (let z = GZ[0] + 6; z < GZ[1]; z += 6) gl.push([[GX[0], 0, z], [GX[1], 0, z]]); segs(gl, lm({ opacity: 0.08 }));
  const rw = []; for (const k of "BCDE") { const [x, z] = APT[k], L = k === "B" ? 2.2 : 1.4; rw.push([[x - L, 0.02, z - 0.3], [x + L, 0.02, z + 0.3]]); if (k !== "E") rw.push([[x - 0.5, 0.02, z - L * 0.8], [x + 0.5, 0.02, z + L * 0.8]]); } segs(rw, lm({ opacity: 1, linewidth: 2.4 }));
  // Class A slab (18,000 MSL, cut off: it runs up to FL600), the Class E blanket and the Class G layer beneath it
  segs(box(GX[0], GX[1], Y(18000), Y(21500), GZ[0], GZ[1]), K.A.line); mesh("A", new T.BoxGeometry(GX[1] - GX[0], Y(3500), GZ[1] - GZ[0]).translate((GX[0] + GX[1]) / 2, Y(19750), 0)).userData.blanket = true;
  segs(box(GX[0], GX[1], Y(1200), Y(18000), GZ[0], GZ[1]), K.E.line); const eb = mesh("E", new T.BoxGeometry(GX[1] - GX[0], Y(16800), GZ[1] - GZ[0]).translate((GX[0] + GX[1]) / 2, Y(9600), 0)); eb.userData.blanket = true;
  segs(box(GX[0], GX[1], 0, Y(1200), GZ[0], GZ[1]).filter((_, i) => i % 3 !== 0), K.G.line); const gb = mesh("G", new T.BoxGeometry(GX[1] - GX[0], Y(1200), GZ[1] - GZ[0]).translate((GX[0] + GX[1]) / 2, Y(600), 0)); gb.userData.blanket = true;
  // the shells: open cylinders with ring caps; ink circles at floors and tops plus silhouette edges for the default view
  SHELLS.forEach(([k, [cx, cz], ri, ro, f, t]) => { const r0 = ri * NM, r1 = ro * NM, y0 = Y(f), y1 = Y(t), h = y1 - y0;
    mesh(k, new T.CylinderGeometry(r1, r1, h, 72, 1, true).translate(cx, y0 + h / 2, cz)); if (r0) mesh(k, new T.CylinderGeometry(r0, r0, h, 72, 1, true).translate(cx, y0 + h / 2, cz));
    for (const y of [y0, y1]) mesh(k, new T.RingGeometry(r0, r1, 72).rotateX(-Math.PI / 2).translate(cx, y, cz));
    const ls = [...circ(cx, cz, r1, y0), ...circ(cx, cz, r1, y1)]; if (r0) ls.push(...circ(cx, cz, r0, y0));
    for (const a of [AZ + 90, AZ - 90]) { const rad = (a * Math.PI) / 180; ls.push([[cx + r1 * Math.cos(rad), y0, cz + r1 * Math.sin(rad)], [cx + r1 * Math.cos(rad), y1, cz + r1 * Math.sin(rad)]]); }
    segs(ls, K[k].line); });
  // labels: a letter per class always; the selected class adds its altitudes and sizes
  const TAG = "position:absolute;left:0;top:0;z-index:3;pointer-events:none;white-space:nowrap;font:600 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#bfdbfe;background:rgba(10,10,11,.78);border:1px solid #3b82f6;border-radius:4px;padding:4px 6px;transform:translate(-50%,-50%)";
  const sty = document.createElement("style"); sty.textContent = ".as3-tag.let{font:600 15px/1 var(--sans,system-ui)!important;letter-spacing:0!important;text-transform:none!important;color:rgba(242,241,236,.8)!important;border:0!important;background:none!important;padding:2px!important;text-shadow:0 0 3px #000,0 0 6px #000,0 0 10px #000}.as3-tag.let.on{color:#fff!important;font-size:18px!important}@media (max-width:560px){.as3-tag{font-size:10px!important;padding:3px 5px!important;letter-spacing:.05em!important}}"; F.stage.append(sty);
  let tags = [];
  const tag = (text, at, cls = "") => { const e = document.createElement("div"); e.className = "as3-tag " + cls; e.style.cssText = TAG; e.textContent = text; e.setAttribute("aria-hidden", "true"); F.stage.append(e); const t = { e, at }; tags.push(t); return t; };
  const letters = Object.entries(LETTER).map(([k, at]) => tag(k, at, "let"));
  let sTags = [];
  function placeTags() { const W = F.stage.clientWidth, H = F.stage.clientHeight, top = W < 560 ? 44 : 32, done = [];
    for (const t of [...sTags, ...letters]) { const q = S.project(t.at, false); const off = q.z > 1 || q.x < 0 || q.x > W || q.y < top || q.y > H; t.e.style.visibility = off && letters.includes(t) ? "hidden" : ""; if (off && letters.includes(t)) continue; if (!t.w) { t.w = t.e.offsetWidth; t.h = t.e.offsetHeight; } const w = t.w, h = t.h; const x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, q.x)); let y = q.y;
      for (const k of [0, -1, 1, -2, 2, -3, 3]) { const yy = Math.max(top + h / 2, Math.min(H - h / 2 - 4, q.y + k * (h + 3))); if (!done.some((r) => Math.abs(r.x - x) < (r.w + w) / 2 + 3 && Math.abs(r.y - yy) < (r.h + h) / 2 + 2)) { y = yy; break; } }
      done.push({ x, y, w, h }); t.e.style.left = Math.round(x) + "px"; t.e.style.top = Math.round(y) + "px"; } }
  function apply() {
    for (const k of "ABCDEG") { const on = k === sel; K[k].line.color.setHex(on ? ACC : INK); K[k].line.opacity = on ? 1 : k === "E" || k === "A" ? 0.18 : 0.55; K[k].line.linewidth = on ? 2.2 : 1.2;
      K[k].fill.color.setHex(on ? ACC : INK); K[k].fill.opacity = on ? (k === "E" || k === "A" || k === "G" ? 0.1 : 0.22) : k === "E" ? 0 : k === "A" ? 0.025 : 0.05; }
    letters.forEach((t, i) => t.e.classList.toggle("on", Object.keys(LETTER)[i] === sel));
    sTags.forEach((t) => t.e.remove()); tags = tags.filter((t) => !sTags.includes(t)); sTags = (TAGS[sel] || []).map(([txt, at]) => tag(txt, at));
    fit(900); if (sel === "all") { F.caption("Airspace classes", "Tap a class to light it up."); F.explain(`Class B, C and D are the rooms around busier airports, Class E is the controlled blanket over most of the country, Class G is what's left underneath, and Class A starts at 18,000 ft MSL. Sizes shown are the standard or typical ones; real areas are tailored, so always check the sectional. <span class="src">AIM 3-2 · 14 CFR 71</span>`); S.kick(); return; }
    const I = INFO[sel]; F.caption(I[0], I[2].split(".")[0] + ".");
    F.explain(`<b>${I[0]}:</b> ${I[1]}. ${I[2]} <span class="src">${I[3]} · 14 CFR 71</span> <span class="src">Heights exaggerated about 17× up to 10,000 ft and compressed above; airports drawn at sea level so MSL equals AGL.</span>`); S.kick(); }
  const ch = chips(F.ctrl, [["all", "All"], ...["B", "C", "D", "E", "G", "A"].map((k) => [k, "Class " + k])], sel, (v) => { sel = v || sel; apply(); }, { label: "Airspace class" });
  // tap: the most specific shell under the finger wins (B/C/D/E-airport shells over the A/E/G blankets)
  const cv = S.renderer.domElement, ray = new T.Raycaster(), ndc = new T.Vector2(); let dn = null;
  const pick = [...Object.values(K).flatMap((k) => k.meshes)];
  cv.addEventListener("pointerdown", (e) => { dn = [e.clientX, e.clientY, performance.now()]; });
  cv.addEventListener("pointerup", (e) => { const d = dn; dn = null; if (!d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 8 || performance.now() - d[2] > 450) return; const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, S.camera); const hits = ray.intersectObjects(pick, false); if (!hits.length) return;
    const shell = hits.find((h) => !h.object.userData.blanket), k = (shell || hits[0]).object.userData.cls;
    sel = k; ch.set(k); apply(); });
  // camera: fit the whole cake on any stage
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 4000);
  // each class gets its own framing: B, C and D zoom in on their shells; E, G and A show the whole block
  const FOCUS = { B: [APT.B, 16, Y(10000) + 1.5], C: [APT.C, 9, Y(4000) + 2], D: [APT.D, 7, Y(2500) + 2] };
  function fit(dur = 1) { const r = F.stage.getBoundingClientRect(); if (!r.width) return; cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); const az = AZ, el = r.width < 560 ? 27 : 24;
    const fo = FOCUS[sel], pts = []; let tg;
    if (fo) { const [[cx, cz], R, yt] = fo; tg = [cx, yt * 0.42, cz]; for (const a of [0, 1, 2, 3, 4, 5, 6, 7]) for (const y of [0, yt]) pts.push(new T.Vector3(cx + R * Math.cos(a * Math.PI / 4), y, cz + R * Math.sin(a * Math.PI / 4))); }
    else { tg = [(GX[0] + GX[1]) / 2, Y(8000), 0]; for (const x of GX) for (const z of GZ) for (const y of [0, Y(21500)]) pts.push(new T.Vector3(x, y, z)); }
    let lo = 5, hi = 2000;
    for (let it = 0; it < 30; it++) { const d = (lo + hi) / 2, e = (el * Math.PI) / 180, a = (az * Math.PI) / 180; cam.position.set(tg[0] + d * Math.cos(e) * Math.cos(a), tg[1] + d * Math.sin(e), tg[2] + d * Math.cos(e) * Math.sin(a)); cam.lookAt(...tg); cam.updateMatrixWorld();
      const ok = pts.every((c) => { const q = c.clone().project(cam); return q.z < 1 && Math.abs(q.x) < 0.95 && q.y < 0.76 && q.y > -0.92; }); if (ok) hi = d; else lo = d; }
    S.setView({ tg, az, el, d: hi }, dur); }
  new ResizeObserver(() => fit()).observe(F.stage);
  apply(); fit(1);
  S.animate(() => { const r = S.renderer.getDrawingBufferSize(new T.Vector2()); if (r.x !== res.x || r.y !== res.y) { res.copy(r); mats.forEach((m) => m.resolution.copy(res)); } placeTags(); return false; }, { idle: true });
  return { destroy() { tags.forEach((t) => t.e.remove()); mats.forEach((m) => m.dispose()); S.destroy(); F.destroy(); } };
}
