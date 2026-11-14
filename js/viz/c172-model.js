import { buildPitot } from "./pitot3d.js?v=714b944f7b";
// Cessna 172S, minimal technical model (v4: separated control surfaces, trim tab, IO-360 engine, fuel tank outlines, nose steering).
// Cessna 172S, minimal technical model. Units: feet. x forward (spinner tip x=+8.0), y up (ground y=0), z right.
// Sourced: span 36 ft 1 in, length 27 ft 2 in, height 8 ft 11 in, horizontal tail span 11 ft 4 in, wheelbase 65 in,
// prop 76 in 2-blade fixed pitch, prop ground clearance 11.25 in, 4 seats (Textron 172S spec / 172S Information Manual / AOPA).
export const FT_SPAN = 36 + 1 / 12, FT_LEN = 27 + 2 / 12, FT_H = 8 + 11 / 12;
export function buildPlane(THREE, opts = {}) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, w) => a + (b - a) * w;
  const faceMat = new THREE.MeshBasicMaterial({ color: 0x0d0d10, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const parts = {}, meshes = [];
  const part = (name) => (parts[name] ||= { name, subs: [] });
  // sub = one object3D carrying faces + its own line segments (local coords)
  let TAG = null; const tag = (t) => (TAG = t);
  function addSub(name, parent, geo, segs, obj) { const o = obj || new THREE.Group(); if (!obj) parent.add(o);
    if (geo) { const m = new THREE.Mesh(geo, faceMat); o.add(m); meshes.push(m); m.userData.part = name; m.userData.tag = TAG || name; }
    const s = segs || (geo ? Array.from(new THREE.EdgesGeometry(geo, 22).attributes.position.array) : []);
    part(name).subs.push({ obj: o, segs: s }); return o; }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // ---------- loft helper: rings[k] = array of Vector3 (same count) ----------
  function loft(rings, closed = true, caps = true) {
    const n = rings[0].length, pos = [], idx = []; rings.forEach((r) => r.forEach((p) => pos.push(p.x, p.y, p.z)));
    for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < (closed ? n : n - 1); i++) { const a = k * n + i, b = k * n + (i + 1) % n, c = a + n, d = b + n; idx.push(a, b, d, a, d, c); }
    if (caps) [0, rings.length - 1].forEach((k) => { const c = new THREE.Vector3(); rings[k].forEach((p) => c.add(p)); c.multiplyScalar(1 / n); const ci = pos.length / 3; pos.push(c.x, c.y, c.z);
      for (let i = 0; i < n; i++) idx.push(ci, k * n + i, k * n + (i + 1) % n); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const segLines = (rings, ringEvery, longIdx, closed = true) => { const s = []; const push = (a, b) => s.push(a.x, a.y, a.z, b.x, b.y, b.z);
    rings.forEach((r, k) => { if (k % ringEvery === 0 || k === rings.length - 1) for (let i = 0; i < (closed ? r.length : r.length - 1); i++) push(r[i], r[(i + 1) % r.length]); });
    longIdx.forEach((i) => { for (let k = 0; k < rings.length - 1; k++) push(rings[k][i], rings[k + 1][i]); }); return s; };
  const polyl = (pts, close) => { const s = []; for (let i = 0; i < pts.length - (close ? 0 : 1); i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s.push(a.x, a.y, a.z, b.x, b.y, b.z); } return s; };

  // ---------- fuselage + cowling (superellipse sections) ----------
  const ST = [[7.35, 0.64, 3.5, 4.74, 2.2], [6.2, 1.5, 2.85, 5.0, 2.6], [4.6, 1.8, 2.35, 5.15, 3.0], [3.4, 1.87, 2.1, 5.35, 3.6], [1.6, 1.9, 2.0, 6.36, 4.6], [-1.0, 1.9, 2.0, 6.38, 4.8],
    [-3.75, 1.8, 2.2, 6.36, 4.4], [-6.5, 1.25, 2.68, 5.5, 3.2], [-10, 0.78, 3.1, 5.12, 2.6], [-14, 0.47, 3.6, 5.0, 2.4], [-17.3, 0.25, 4.0, 4.9, 2.2]];
  const s5 = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const sec = (x) => { for (let k = 0; k < ST.length - 1; k++) if (x <= ST[k][0] && x >= ST[k + 1][0]) { const w = s5((ST[k][0] - x) / (ST[k][0] - ST[k + 1][0])); return [1, 2, 3, 4].map((c) => lerp(ST[k][c], ST[k + 1][c], w)); } return x > ST[0][0] ? ST[0].slice(1) : ST.at(-1).slice(1); };
  const NE = 2.7, NR = 24;
  const surf = (x, th, off = 0) => { const [w, yb, yt, ne] = sec(x), yc = (yb + yt) / 2, hh = (yt - yb) / 2, c = Math.cos(th), s = Math.sin(th);
    return V(x, yc + (hh + off) * Math.sign(s) * Math.abs(s) ** (2 / ne), (w + off) * Math.sign(c) * Math.abs(c) ** (2 / ne)); };
  const ring = (x) => Array.from({ length: NR }, (_, i) => surf(x, -Math.PI / 2 + (2 * Math.PI * i) / NR));
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => lerp(a, b, i / n));
  const XF = 3.62;   // firewall = POH datum FS 0 (Fig 6-1): spinner tip FS -53, MAC LE FS 25.9
  const cowlR = range(7.35, XF, 8).map(ring), fusR = range(XF, -17.3, 44).map(ring);
  tag("cowling"); const cowlG = loft(cowlR, true, false); addSub("cowling", body, cowlG, [...segLines(cowlR, 2, [0, 3, 6, 9, 12, 15, 18, 21]),
    ...[1, -1].flatMap((sd) => polyl(range(0, 1, 10).map((u) => { const a = u * 2 * Math.PI; return surf(6.75 + 0.22 * Math.cos(a), (sd > 0 ? 0.55 : Math.PI - 0.55) + 0.12 * Math.sin(a), 0.02); }), true))]);
  const L8 = [0, 3, 6, 9, 12, 15, 18, 21];
  const win = (x0, x1, t0, t1, sd) => { const T = (t) => (sd > 0 ? t : Math.PI - t), pts = [];
    range(x0, x1, 8).forEach((x) => pts.push(surf(x, T(t0), 0.02))); range(t0, t1, 4).forEach((t) => pts.push(surf(x1, T(t), 0.02)));
    range(x1, x0, 8).forEach((x) => pts.push(surf(x, T(t1), 0.02))); range(t1, t0, 4).forEach((t) => pts.push(surf(x0, T(t), 0.02))); return polyl(pts, true); };
  const ws = []; for (const sd of [1, -1]) ws.push(...win(1.25, -1.55, 0.3, 1.05, sd), ...win(-1.8, -3.8, 0.3, 0.95, sd));
  ws.push(...win(3.3, 1.5, 0.62, Math.PI - 0.62, 1), ...win(-3.85, -6.0, 1.0, Math.PI - 1.0, 1));
  tag("fuselage"); addSub("fuselage", body, loft(fusR, true, true), [...segLines(fusR, 4, L8), ...ws]);
  // ---------- propeller: spinner + 2 blades (76 in dia, ground clearance 11.25 in) ----------
  const PROP_Y = 4.12, prop = new THREE.Group(); prop.position.set(7.32, PROP_Y, 0); body.add(prop);
  const sp = new THREE.LatheGeometry(range(0, 1, 7).map((u) => new THREE.Vector2(0.63 * Math.sqrt(Math.max(0, 1 - u ** 1.7)) + 0.001, u * 0.72)), 14); sp.rotateZ(-Math.PI / 2);
  const bladeG = (sgn) => { const rs = range(0.45, 3.167, 9), rings = rs.map((r) => { const u = (r - 0.45) / 2.72, c = lerp(0.42, 0.26, u) * (u > 0.85 ? Math.sqrt(1 - ((u - 0.85) / 0.152) ** 2 * 0.9) : 1), th = 0.06,
      phi = Math.atan(5.0 / (2 * Math.PI * r)); const cd = [Math.sin(phi), Math.cos(phi)], nd = [Math.cos(phi), -Math.sin(phi)];
      return [[-c / 2, -th / 2], [c / 2, -th / 2], [c / 2, th / 2], [-c / 2, th / 2]].map(([a, b]) => V(0.15 + cd[0] * a + nd[0] * b, sgn * r, sgn * (cd[1] * a + nd[1] * b))); });
    return { g: loft(rings, true, true), s: segLines(rings, 3, [0, 1, 2, 3]) }; };
  const pspin = new THREE.Group(); prop.add(pspin);
  const spinSub = new THREE.Group(); pspin.add(spinSub); tag("spinner"); addSub("propeller", null, sp, null, spinSub);
  { const bp = new THREE.CylinderGeometry(0.63, 0.63, 0.03, 18); bp.rotateZ(Math.PI / 2); bp.translate(0.015, 0, 0); const o = new THREE.Group(); pspin.add(o); tag("spinner"); addSub("propeller", null, bp, [], o); }   // spinner bulkhead (blade/hub mount)
  [1, -1].forEach((sg) => { const b = bladeG(sg), o = new THREE.Group(); pspin.add(o); tag("blade"); addSub("propeller", null, b.g, b.s, o); });
  // ---------- wing: high wing, 1.73 deg dihedral, constant-chord inboard, tapered outboard; flaps + ailerons on hinges ----------
  const DIH = Math.tan((1.73 * Math.PI) / 180), N = (u) => (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1015 * u ** 4) / 0.06 * 0.12 / 0.12 / 1.0;
  const Nn = (u) => N(u) / N(0.3), HF = 0.75;
  const wst = (a) => { const o = clamp((a - 7.5) / (FT_SPAN / 2 - 7.5)); return { le: lerp(1.6, 1.15, o), te: lerp(-3.75, -2.40, o), t: lerp(0.7, 0.45, clamp((a - 1.9) / (FT_SPAN / 2 - 1.9))), y: 6.62 + Math.max(0, a - 1.9) * DIH }; };
  const wingRing = (a, sd) => { const w = wst(a), c = w.le - w.te, us = range(0, 1, 9).map((v) => HF * (v * v)), up = us.map((u) => V(w.le - u * c, w.y + 0.6 * w.t * Nn(Math.max(u, 1e-4)), sd * a)),
      lo = us.slice(1, -1).reverse().map((u) => V(w.le - u * c, w.y - 0.4 * w.t * Nn(Math.max(u, 1e-4)), sd * a)); return [...up, ...lo]; };
  const pivots = {};
  for (const sd of [1, -1]) {
    const as = [0, 1.9, 3.5, 5.5, 7.2, 8.6, 10.5, 12.5, 14.5, 16.5, FT_SPAN / 2 - 0.25, FT_SPAN / 2], rr = as.map((a) => wingRing(a, sd));
    tag(sd > 0 ? "wingR" : "wingL"); addSub("wing", body, loft(rr, true, true), segLines(rr, 1, [0, 4, 9, 13]));
    const surface = (name, a0, a1) => { const h0 = wst(a0), h1 = wst(a1), hp = (w) => V(w.le - HF * (w.le - w.te), w.y + 0.1 * w.t * Nn(HF), 0);
      const p0 = hp(h0); p0.z = sd * a0; const p1 = hp(h1); p1.z = sd * a1; const pv = new THREE.Group(); pv.position.copy(p0); body.add(pv);
      const axis = p1.clone().sub(p0).normalize(); if (axis.z < 0) axis.negate(); pv.userData.axis = axis;
      const cs = (a) => { const w = wst(a), c = w.le - w.te, xh = w.le - HF * c, tu = 0.6 * w.t * Nn(HF), tl = 0.4 * w.t * Nn(HF);
        return [V(xh + 0.05, w.y + 0.1 * w.t, sd * a), V(xh - 0.02, w.y + tu * 0.96, sd * a), V(w.te, w.y + 0.02, sd * a), V(xh - 0.02, w.y - tl * 0.96, sd * a)].map((p) => p.sub(p0)); };
      const rs = range(a0, a1, 4).map(cs); const o = new THREE.Group(); pv.add(o); tag(name + (sd > 0 ? "R" : "L")); addSub(name, null, loft(rs, true, true), segLines(rs, 4, [0, 1, 2, 3]), o);
      (pivots[name] ||= []).push({ pv, sd }); };
    { const te = (a) => { const w = wst(a), c = w.le - w.te, xh = w.le - HF * c, tu = 0.6 * w.t * Nn(HF), tl = 0.4 * w.t * Nn(HF);   // fixed full-chord centre section over the cabin
        return [V(xh + 0.05, w.y + 0.1 * w.t, sd * a), V(xh - 0.02, w.y + tu * 0.98, sd * a), V(w.te, w.y + 0.02, sd * a), V(xh - 0.02, w.y - tl * 0.98, sd * a)]; };
      const rs = [0, 1.0, 1.98].map(te); tag(sd > 0 ? "wingR" : "wingL"); addSub("wing", body, loft(rs, true, true), segLines(rs, 2, [1, 2, 3])); }
    surface("flaps", 2.0, 9.4); surface("ailerons", 9.6, 17.2);
    // strut (fuselage lower side -> wing underside)
    const a = surf(-0.3, sd > 0 ? -0.55 : Math.PI + 0.55, -0.04), b = V(-0.75, wst(8.4).y - 0.25, sd * 8.4), L = a.distanceTo(b), sg = new THREE.CylinderGeometry(0.1, 0.1, L, 8);
    sg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize())); sg.translate(...a.clone().add(b).multiplyScalar(0.5).toArray()); sg.scale(1, 1, 1);
    tag(sd > 0 ? "strutR" : "strutL"); addSub("struts", body, sg, polyl([a, b], false));
  }
  // wing root fairing: fills cabin roof -> wing underside along the whole root chord (windshield sweeps into the LE, rear window into the TE)
  { const w0 = wst(0), c0 = w0.le - w0.te, lowerY = (x) => { const u = (w0.le - x) / c0; if (u <= 0.5) return w0.y + 0.1 * w0.t * Nn(Math.max(u, 1e-4)) - 0.03; if (u <= 0.68) return w0.y + 0.08; if (u <= 0.8) return w0.y + 0.19; if (u <= 0.9) return w0.y + 0.08;
      const tl = 0.4 * w0.t * Nn(HF) * 0.98, f = (u - HF) / (1 - HF); return w0.y - 0.01; };
    const roofY = (x, z) => { let best = null; for (let i = 0; i <= 60; i++) { const p = surf(x, (Math.PI * i) / 60); if (best === null || Math.abs(p.z - z) < Math.abs(best.z - z)) best = p; } return best.y; };
    const zs = range(-1.95, 1.95, 12), xs = range(w0.le - 0.02, w0.te + 0.05, 16);
    const rings = xs.map((x) => [...zs.map((z) => V(x, lowerY(x) + 0.03, z)), ...zs.slice().reverse().map((z) => V(x, roofY(x, z) - 0.06, z))]);
    tag("fairing"); addSub("fairing", body, loft(rings, true, true), segLines(rings, 16, [0, 12, 13, 25])); }
  // ---------- tail: horizontal stab (11 ft 4 in span) + elevator with trim tab; swept fin + rudder ----------
  const flat = (pts, th, planeXZ, y0 = 0) => { const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); g.translate(0, 0, -th / 2);
    if (planeXZ) { g.rotateX(Math.PI / 2); g.translate(0, y0, 0); } return g; };
  const HY = 4.62, HS = 11 + 4 / 12, hz = HS / 2;
  tag("hstab"); addSub("hstab", body, flat([[-15.0, -hz], [-14.1, -0.4], [-14.1, 0.4], [-15.0, hz], [-16.4, hz], [-16.4, -hz]], 0.2, true, HY));
  const epv = new THREE.Group(); epv.position.set(-16.4, HY, 0); epv.userData.axis = V(0, 0, 1); body.add(epv);
  // elevator with a trailing-edge cutout on the right side for the trim tab (POH p.7-6); the tab is its own hinged piece
  const ETE = (z) => -17.85 + ((z - 0.45) * (-17.5 + 17.85)) / (hz - 0.45), TZ0 = 0.5, TZ1 = 3.0, TX = -17.32;   // v4.1: tab ~44% of the right elevator half-span from the root, ~1/3 elevator chord (sized from photos; no dimension in POH/web)
  const eg = flat([[-16.4, -hz], [-16.4, hz], [-17.5, hz], [ETE(TZ1), TZ1], [TX, TZ1], [TX, TZ0], [ETE(TZ0), TZ0], [-17.85, 0.45], [-17.4, 0.3], [-17.4, -0.3], [-17.85, -0.45], [-17.5, -hz]], 0.12, true, HY); eg.translate(16.4, -HY, 0);
  const eo = new THREE.Group(); epv.add(eo); tag("elevatorSurf"); addSub("elevator", null, eg, null, eo);
  const tpv = new THREE.Group(); tpv.position.set(TX - 0.02 + 16.4, 0, 0); tpv.userData.axis = V(0, 0, 1); eo.add(tpv);
  const tg = flat([[TX - 0.02, TZ0 + 0.04], [TX - 0.02, TZ1 - 0.04], [ETE(TZ1 - 0.04), TZ1 - 0.04], [ETE(TZ0 + 0.04), TZ0 + 0.04]], 0.08, true, HY); tg.translate(-(TX - 0.02), -HY, 0);
  const to = new THREE.Group(); tpv.add(to); tag("trimTab"); addSub("trimtab", null, tg, null, to);
  pivots.elevator = [{ pv: epv, sd: 1 }];
  tag("fin"); addSub("fin", body, flat([[-10.8, 4.98], [-13.4, 5.42], [-16.95, 8.85], [-17.75, 8.85], [-17.45, 4.75], [-14.5, 4.9]], 0.3, false));
  const rh0 = V(-17.47, 4.75, 0), rh1 = V(-17.77, 8.85, 0), rpv = new THREE.Group(); rpv.position.copy(rh0); rpv.userData.axis = rh1.clone().sub(rh0).normalize(); body.add(rpv);
  const rg = flat([[-17.47, 4.75], [-17.77, 8.85], [-18.5, FT_H], [-19.0, 7.3], [-19.15, 5.0], [-18.7, 4.75]], 0.18, false); rg.translate(17.47, -4.75, 0);
  const ro = new THREE.Group(); rpv.add(ro); tag("rudderSurf"); addSub("rudder", null, rg, null, ro); pivots.rudder = [{ pv: rpv, sd: 1 }];
  // ---------- fixed tricycle gear with fairings (wheelbase 65 in) ----------
  const gear = new THREE.Group(); root.add(gear);   // stays on the ground while the body compresses
  const XN = XF + 7 / 12, XM = XN - 65 / 12, TR = 4.1, RW = 17.5 / 24;   // nose wheel FS ~-7, mains FS ~58 (Fig 6-1); tire ODs 17.5/14 in ASSUMED (6.00x6 / 5.00x5)
  const steer = new THREE.Group(); steer.position.set(XN, 0, 0); gear.add(steer);   // nose wheel steers about a vertical axis (POH p.7-12: ~10 deg each side with the pedals)
  const WHEELS = [];   // hub groups: pose({wheel}) spins each one (rad of roll = distance / radius)
  const wheelSet = (x, z, r, pantL, par = gear, ox = 0) => { const w = new THREE.CylinderGeometry(r, r, 0.4, 14); w.rotateX(Math.PI / 2); const hub = new THREE.Group(); hub.position.set(x - ox, r, z); hub.userData.r = r; par.add(hub); WHEELS.push(hub);
    const spokes = [-1, 1].flatMap((f) => [...polyl([V(-r * 0.8, 0, f * 0.205), V(r * 0.8, 0, f * 0.205)], false), ...polyl([V(0, -r * 0.8, f * 0.205), V(0, r * 0.8, f * 0.205)], false)]);
    tag("wheel" + z); addSub("gear", null, w, [...Array.from(new THREE.EdgesGeometry(w, 22).attributes.position.array), ...spokes], hub);
    const p = new THREE.SphereGeometry(1, 14, 7); p.scale(pantL, r * 0.82, 0.3); p.translate(x - 0.12 - ox, r + 0.06, z); tag("pant" + z); addSub("gear", par, p); };
  wheelSet(XM, TR, RW, 1.25); wheelSet(XM, -TR, RW, 1.25); wheelSet(XN, 0, 14 / 24, 1.0, steer, XN);
  const leg = (a, b, r) => { const L = a.distanceTo(b), g = new THREE.CylinderGeometry(r, r * 1.4, L, 8); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), a.clone().sub(b).normalize())); g.translate(...a.clone().add(b).multiplyScalar(0.5).toArray()); return g; };
  const legs = new THREE.Group(); body.add(legs);
  [1, -1].forEach((sd) => tag("leg" + sd * 4.1) && addSub("gear", legs, leg(surf(XM + 0.1, sd > 0 ? -0.9 : Math.PI + 0.9, -0.04), V(XM, RW + 0.1, sd * (TR - 0.25)), 0.09)));
  tag("leg0"); addSub("gear", legs, leg(V(XN - 0.35, 2.85, 0), V(XN, 14 / 24 + 0.12, 0), 0.11));
  // ---------- Lycoming IO-360-L2A (POH p.1-4 / 7-19: horizontally opposed, 4 cylinders, fuel injected, wet sump p.7-21). Minimal, schematic. ----------
  const engine = new THREE.Group(); body.add(engine); const CY = PROP_Y + 0.03;
  const box = (x0, x1, y0, y1, hz2) => { const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, 2 * hz2); g.translate((x0 + x1) / 2, (y0 + y1) / 2, 0); return g; };
  const tube = (pts, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, r, 6, false);
  tag("crankcase"); addSub("engine", engine, box(4.25, 6.45, 3.62, 4.58, 0.5));
  { const g = new THREE.CylinderGeometry(0.28, 0.32, 0.88, 16); g.rotateZ(Math.PI / 2); g.translate(6.89, PROP_Y, 0); tag("propHub"); addSub("engine", engine, g); }
  const CYLS = [[5.85, 1], [4.85, 1], [5.45, -1], [4.45, -1]];   // 2 per side, staggered
  CYLS.forEach(([xc, sd], k) => { const g = new THREE.CylinderGeometry(0.27, 0.27, 0.72, 16, 1, false); g.rotateX(Math.PI / 2); g.translate(xc, CY, sd * 0.86);
      const fins = []; for (let j = 0; j < 8; j++) { const z = sd * (0.58 + j * 0.085); fins.push(...polyl(range(0, 1, 16).map((u) => V(xc + 0.36 * Math.cos(u * 2 * Math.PI), CY + 0.36 * Math.sin(u * 2 * Math.PI), z)), false)); }
      tag("cyl" + (k + 1)); addSub("engine", engine, g, [...Array.from(new THREE.EdgesGeometry(g, 22).attributes.position.array), ...fins]);
      const h = box(xc - 0.31, xc + 0.31, CY - 0.3, CY + 0.32, 0.14); h.translate(0, 0, sd * 1.24); tag("head" + (k + 1)); addSub("engine", engine, h); });
  tag("sump"); addSub("engine", engine, box(4.4, 5.95, 3.12, 3.62, 0.42));
  [[3.7, 0.45], [3.7, -0.45], [4.5, 0.45], [4.5, -0.45]].forEach(([y, z]) => { tag("mount"); addSub("engine", engine, tube([V(XF + 0.02, y + (y > 4 ? 0.2 : -0.2), z * 1.6), V(3.95, y + (y > 4 ? 0.1 : -0.1), z * 1.3), V(4.3, y, z)], 0.04)); });
  tag("intake"); addSub("engine", engine, box(5.95, 6.45, 2.95, 3.38, 0.28));   // fuel/air control unit + air inlet at the front of the sump
  CYLS.forEach(([xc, sd]) => { tag("intake"); addSub("engine", engine, tube([V(xc, 3.45, sd * 0.4), V(xc, 3.55, sd * 0.85), V(xc, CY - 0.33, sd * 1.2)], 0.07)); });
  CYLS.forEach(([xc, sd]) => { tag("exhaust"); addSub("engine", engine, tube([V(xc - 0.18, CY - 0.3, sd * 1.3), V(xc - 0.25, 3.1, sd * 1.25), V(4.1, 2.9, sd * 0.95)], 0.07)); });
  { const g = new THREE.CylinderGeometry(0.17, 0.17, 2.0, 12); g.rotateX(Math.PI / 2); g.translate(4.0, 2.85, 0); tag("exhaust"); addSub("engine", engine, g);
    tag("exhaust"); addSub("engine", engine, tube([V(4.0, 2.75, 0.45), V(3.9, 2.45, 0.45), V(3.72, 2.2, 0.45)], 0.08)); }
  // ---------- fuel: one integral tank in each wing (POH p.7-23); outline drawn on the upper skin, inboard (extent schematic) ----------
  for (const sd of [1, -1]) { const up = (a, u) => { const w = wst(a), c = w.le - w.te; return V(w.le - u * c, w.y + 0.6 * w.t * Nn(Math.max(u, 1e-4)) + 0.03, sd * a); };
    const pts = [...range(2.3, 7.2, 10).map((a) => up(a, 0.06)), ...range(0.06, 0.5, 6).map((u) => up(7.2, u)), ...range(7.2, 2.3, 10).map((a) => up(a, 0.5)), ...range(0.5, 0.06, 6).map((u) => up(2.3, u))];
    tag(sd > 0 ? "tankR" : "tankL"); addSub("fuel", body, null, polyl(pts, true)); }
  // ---------- pitot: short L under the left wing, just outboard of the strut (POH 7) ----------
  { const pit = buildPitot(THREE, { style: "model", fill: faceMat, parent: body }); tag("pitot"); addSub("pitot", body, null, pit.segs, pit.group); }
  // ---------- 76 in propeller diameter dimension (lines only) ----------
  { const R = 38 / 12, xd = 8.45; tag("propDim"); addSub("propDim", body, null, [...polyl([V(xd, PROP_Y - R, 0), V(xd, PROP_Y + R, 0)], false), ...polyl([V(7.6, PROP_Y + R, 0), V(xd + 0.15, PROP_Y + R, 0)], false), ...polyl([V(7.6, PROP_Y - R, 0), V(xd + 0.15, PROP_Y - R, 0)], false)]); }
  // ---------- animation (pure function of t) ----------
  const rot = (pv, ang) => pv.quaternion.setFromAxisAngle(pv.userData.axis, ang);
  function pose(a) { pspin.rotation.x = a.prop || 0; (pivots.flaps || []).forEach((p) => rot(p.pv, a.flap || 0)); (pivots.ailerons || []).forEach((p) => rot(p.pv, (a.ail || 0) * (p.sd < 0 ? 1 : -1)));
    rot(epv, a.elev || 0); rot(tpv, a.trim || 0); rot(rpv, a.rud || 0); steer.rotation.y = a.steer || 0; WHEELS.forEach((h, i) => (h.rotation.z = -((i < 2 ? a.wheel : a.wheelN) || 0) / h.userData.r)); body.position.y = -(a.squat || 0); root.updateMatrixWorld(true); }
  pose({});
  return { root, parts, meshes, pose, PROP_Y, surf, sec };
}
