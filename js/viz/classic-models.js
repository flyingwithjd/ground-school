// Context airplanes for the fuselage-construction visual (GL1 "Truss, shell, or both"), drawn in the same thin-ink style as the 172.
// Units: feet. x forward, y up, z right; the model is built level and then set on its tailwheel (3-point attitude).
//   Piper J-3 Cub   (truss example): high wing braced by V-struts, welded steel-tube fuselage under fabric, tailwheel. Span 35 ft 3 in, length 22 ft 5 in.
//   Lockheed Vega   (monocoque example): high cantilever wing (no struts), round molded-plywood shell, cowled radial, wheel pants, tailwheel. Span 41 ft, length 27 ft 6 in.
// Dimensions are approximate (published span / length); shapes are simplified for teaching.
// Performance: everything is merged into four objects (dark faces, solid gray, ink lines, ghosted wing lines) = 4 draw calls.
export function buildClassic(THREE, kind, { WCUT = 8.75 } = {}) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z), clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, w) => a + (b - a) * w;
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => lerp(a, b, i / n));
  const cub = kind === "cub";
  // ---- fuselage sections: [x, half-width, y bottom, y top, superellipse exponent]
  const ST = cub
    ? [[5.45, 0.86, 2.75, 4.2, 2.4], [4.5, 1.12, 2.25, 4.6, 3.0], [3.2, 1.25, 1.9, 4.95, 3.4], [1.6, 1.3, 1.72, 5.72, 3.8], [-1.6, 1.3, 1.72, 5.78, 3.8], [-4.0, 1.14, 2.0, 5.45, 3.5], [-8.0, 0.8, 2.75, 4.95, 3.2], [-12.0, 0.46, 3.4, 4.62, 3.0], [-15.3, 0.16, 3.92, 4.42, 2.8]]
    : [[7.0, 2.0, 2.2, 6.2, 2], [5.8, 2.2, 2.0, 6.42, 2], [4.6, 2.18, 1.98, 6.5, 2], [2.0, 2.16, 1.95, 6.58, 2], [-1.0, 2.06, 2.05, 6.52, 2], [-5.0, 1.76, 2.45, 6.26, 2], [-10.0, 1.2, 3.15, 5.92, 2], [-15.0, 0.62, 3.9, 5.55, 2], [-18.6, 0.18, 4.5, 5.22, 2]];
  const XF = cub ? 3.2 : 4.6, XT = ST.at(-1)[0];
  const s5 = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const sec = (x) => { for (let k = 0; k < ST.length - 1; k++) if (x <= ST[k][0] && x >= ST[k + 1][0]) { const w = s5((ST[k][0] - x) / (ST[k][0] - ST[k + 1][0])); return [1, 2, 3, 4].map((c) => lerp(ST[k][c], ST[k + 1][c], w)); } return x > ST[0][0] ? ST[0].slice(1) : ST.at(-1).slice(1); };
  const surf = (x, th, off = 0) => { const [w, yb, yt, ne] = sec(x), yc = (yb + yt) / 2, hh = (yt - yb) / 2, c = Math.cos(th), s = Math.sin(th);
    return V(x, yc + (hh + off) * Math.sign(s) * Math.abs(s) ** (2 / ne), (w + off) * Math.sign(c) * Math.abs(c) ** (2 / ne)); };
  const TH = (j, n) => -Math.PI / 2 + (2 * Math.PI * j) / n;
  // ---- buffers: F = dark occluding faces, G = solid gray members, L = ink lines, W = ghosted wing lines
  const F = { p: [], i: [] }, G = { p: [], n: [], i: [] }, L = [], W = [], EXT = [];
  const addFaces = (geo, B = F) => { const g = geo.index ? geo : geo; const pa = g.attributes.position.array, o = B.p.length / 3; for (let k = 0; k < pa.length; k++) B.p.push(pa[k]);
    if (B.n) { if (!g.attributes.normal) g.computeVertexNormals(); const na = g.attributes.normal.array; for (let k = 0; k < na.length; k++) B.n.push(na[k]); }
    if (g.index) { const ia = g.index.array; for (let k = 0; k < ia.length; k++) B.i.push(ia[k] + o); } else for (let k = 0; k < pa.length / 3; k++) B.i.push(o + k); geo.dispose(); };
  const seg = (A, a, b) => A.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const poly = (A, pts, close = false) => { for (let i = 0; i < pts.length - (close ? 0 : 1); i++) seg(A, pts[i], pts[(i + 1) % pts.length]); };
  function loft(rings, closed = true, caps = false) { const n = rings[0].length, pos = [], idx = []; rings.forEach((r) => r.forEach((p) => pos.push(p.x, p.y, p.z)));
    for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < (closed ? n : n - 1); i++) { const a = k * n + i, b = k * n + (i + 1) % n, c = a + n, d = b + n; idx.push(a, b, d, a, d, c); }
    if (caps) [0, rings.length - 1].forEach((k) => { const c = V(0, 0, 0); rings[k].forEach((p) => c.add(p)); c.multiplyScalar(1 / n); const ci = pos.length / 3; pos.push(c.x, c.y, c.z); for (let i = 0; i < n; i++) idx.push(ci, k * n + i, k * n + (i + 1) % n); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g; }
  const ringLines = (rings, every, longs, A = L) => { rings.forEach((r, k) => { if (k % every === 0 || k === rings.length - 1) poly(A, r, true); }); longs.forEach((i) => { for (let k = 0; k < rings.length - 1; k++) seg(A, rings[k][i], rings[k + 1][i]); }); };
  const rod = (a, b, r, n = 6) => { const len = a.distanceTo(b); if (len < 1e-3) return; const g = new THREE.CylinderGeometry(r, r, len, n, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); addFaces(g, G); };
  // flat panel from an outline in a plane: "xz" at height y0 (horizontal tail) or "xy" at z0 (fin); faces + outline
  const panel = (pts, plane, k0, th = 0.12) => { pts = pts.filter((p, i) => { const q = pts[(i + pts.length - 1) % pts.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-3; }); const sh = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b))); const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -th / 2);
    if (plane === "xz") { g.rotateX(Math.PI / 2); g.translate(0, k0, 0); } else g.translate(0, 0, k0); addFaces(g);
    const P = pts.map(([a, b]) => (plane === "xz" ? V(a, k0, b) : V(a, b, k0))); poly(L, P, true); return P; };
  // rounded outline helper: quarter-ellipse arc from (cx + rx cos a0, ...)
  const arc = (cx, cy, rx, ry, a0, a1, n = 8) => range(a0, a1, n).map((a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  // wheel: a short cylinder along z; tyre outline rings + hub
  const wheel = (c, r, wdt) => { const g = new THREE.CylinderGeometry(r, r, wdt, 18, 1, false); g.rotateX(Math.PI / 2); g.translate(c.x, c.y, c.z); addFaces(g);
    for (const dz of [-wdt / 2, wdt / 2]) poly(L, range(0, Math.PI * 2, 18).map((a) => V(c.x + r * Math.cos(a), c.y + r * Math.sin(a), c.z + dz)), true);
    poly(L, range(0, Math.PI * 2, 10).map((a) => V(c.x + r * 0.35 * Math.cos(a), c.y + r * 0.35 * Math.sin(a), c.z + Math.sign(c.z || 1) * (wdt / 2 + 0.01))), true); EXT.push(V(c.x, c.y - r, c.z), V(c.x + r, c.y, c.z), V(c.x - r, c.y, c.z)); };
  // propeller: hub + two blades (flat, slightly twisted), vertical in the default pose
  const prop = (x, y, R, chord, hubR) => { const hub = new THREE.SphereGeometry(hubR, 12, 8); hub.scale(1.2, 1, 1); hub.translate(x + hubR * 0.4, y, 0); addFaces(hub);
    for (const sg of [1, -1]) { const rs = range(hubR * 0.8, R, 7), rings = rs.map((r) => { const u = (r - hubR) / (R - hubR), c = chord * (u > 0.8 ? Math.sqrt(Math.max(0.05, 1 - ((u - 0.8) / 0.2) ** 2)) : lerp(0.7, 1, Math.min(1, u * 3))), tw = lerp(0.9, 0.35, u);
        return [[-c / 2, -0.04], [c / 2, -0.04], [c / 2, 0.04], [-c / 2, 0.04]].map(([a, b]) => V(x + Math.sin(tw) * a + Math.cos(tw) * b, y + sg * r, sg * (Math.cos(tw) * a - Math.sin(tw) * b))); });
      addFaces(loft(rings, true, true)); ringLines(rings, 7, [0, 1]); }
    EXT.push(V(x, y + R, 0), V(x, y - R, 0), V(x + hubR * 1.6, y, 0)); };
  // wing: upper/lower airfoil loft between stations; lines only (ghosted), cut at WCUT
  const N4 = (u) => 0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1015 * u ** 4;
  const wingLines = (st, ribs) => { for (const sd of [1, -1]) { const ringAt = (z) => { const w = st(z), c = w.le - w.te, us = range(0, 1, 10).map((v) => v * v);
        const up = us.map((u) => V(w.le - u * c, w.y + w.t * 0.62 * N4(Math.max(u, 1e-4)) / 0.06, sd * z)), lo = us.slice(1, -1).reverse().map((u) => V(w.le - u * c, w.y - w.t * (w.flat ? 0.12 : 0.38) * N4(Math.max(u, 1e-4)) / 0.06, sd * z)); return [...up, ...lo]; };
      const rr = ribs.map(ringAt); ringLines(rr, 1, [0, 4, 10, 15], W); rr.forEach((r, k) => { if (k === rr.length - 1) poly(L, r, true); }); const e = st(WCUT); EXT.push(V(e.le, e.y, sd * WCUT), V(e.te, e.y, sd * WCUT)); } };
  // windows on the fuselage surface (ink)
  const win = (x0, x1, t0, t1, sd, off = 0.02) => { const T = (t) => (sd > 0 ? t : Math.PI - t), pts = [];
    range(x0, x1, 8).forEach((x) => pts.push(surf(x, T(t0), off))); range(t0, t1, 4).forEach((t) => pts.push(surf(x1, T(t), off)));
    range(x1, x0, 8).forEach((x) => pts.push(surf(x, T(t1), off))); range(t1, t0, 4).forEach((t) => pts.push(surf(x0, T(t), off))); poly(L, pts, true); };
  const NR = 24, ring = (x, off = 0) => Array.from({ length: NR }, (_, i) => surf(x, TH(i, NR), off));
  let tilt, pivot, partsInfo;
  if (cub) {
    // cowling (nose bowl ahead of the firewall) with the four cylinder heads of the little Continental poking out each side
    const cr = range(ST[0][0], XF, 6).map((x) => ring(x)); addFaces(loft(cr, true, true)); ringLines(cr, 3, [0, 6, 12, 18]);
    poly(L, range(0, Math.PI * 2, 16).map((a) => V(ST[0][0] + 0.02, 3.2 + 0.32 * Math.sin(a), 0.42 * Math.cos(a))), true);   // air intake
    for (const sd of [1, -1]) for (const x of [4.55, 3.75]) { const p = surf(x, sd > 0 ? 0.25 : Math.PI - 0.25, -0.15); const b = new THREE.BoxGeometry(0.55, 0.62, 0.5); b.translate(p.x, p.y, p.z + sd * 0.3); addFaces(b, G);
      for (const k of [0.1, 0.25, 0.4]) poly(L, [V(p.x - 0.3, p.y - 0.31, p.z + sd * (0.1 + k)), V(p.x - 0.3, p.y + 0.31, p.z + sd * (0.1 + k)), V(p.x + 0.3, p.y + 0.31, p.z + sd * (0.1 + k)), V(p.x + 0.3, p.y - 0.31, p.z + sd * (0.1 + k))], true); }
    prop(5.5, 3.45, 3.0, 0.42, 0.3);
    // side windows + windshield + door line
    for (const sd of [1, -1]) { win(1.5, -1.5, 0.45, 1.25, sd); win(-1.7, -3.2, 0.6, 1.2, sd); }
    win(2.9, 1.6, 0.85, Math.PI - 0.85, 1);
    // wing: constant chord 5 ft 3 in, flat-bottomed, on top of the cabin; ribs every ~1.2 ft (fabric over ribs)
    const wst = () => ({ le: 1.7, te: -3.55, t: 0.76, y: 5.86, flat: true });
    wingLines(wst, [0, 1.2, 2.4, 3.6, 4.8, 6.0, 7.2, 8.0, WCUT]);
    // V-struts (front + rear) from the lower longeron to the wing underside, clipped at the wing cut; jury struts
    for (const sd of [1, -1]) { const base = V(0.6, 1.85, sd * 1.2), wf = V(1.1, 5.86, sd * 10.6), wr = V(-2.5, 5.86, sd * 10.6);
      const cut = (a, b) => a.clone().lerp(b, (WCUT - Math.abs(a.z)) / (Math.abs(b.z) - Math.abs(a.z)));
      const f1 = cut(base, wf), r1 = cut(base, wr); rod(base, f1, 0.09); rod(base, r1, 0.08); seg(L, base, f1); seg(L, base, r1);
      const m = base.clone().lerp(wf, 0.62); rod(m, V(m.x, 5.86, m.z), 0.04); seg(L, m, V(m.x, 5.86, m.z)); }
    // main gear: V legs to the axle, bungee box; tailwheel on a leaf spring
    for (const sd of [1, -1]) { const ax = V(1.45, 0.9, sd * 3.0); rod(V(2.3, 1.8, sd * 0.95), ax, 0.07); rod(V(0.3, 1.8, sd * 0.95), ax, 0.07); seg(L, V(2.3, 1.8, sd * 0.95), ax); seg(L, V(0.3, 1.8, sd * 0.95), ax); wheel(V(1.45, 0.9, sd * 3.18), 0.85, 0.5); }
    rod(V(-14.6, 3.9, 0), V(-15.15, 2.95, 0), 0.05); wheel(V(-15.2, 2.82, 0), 0.26, 0.16);
    // tail: rounded Cub stabilizer + elevator, rounded fin + rudder
    const HY = 4.22;
    panel([[-12.9, 0.3], ...arc(-13.85, 3.4, 0.85, 1.0, 0, Math.PI, 8), [-14.75, 3.4], [-14.75, -3.4], ...arc(-13.85, -3.4, 0.85, 1.0, Math.PI, Math.PI * 2, 8), [-12.9, -0.3]], "xz", HY);
    panel([[-14.8, 3.6], [-15.6, 3.3], [-16.0, 2.0], [-16.1, 0.35], [-15.3, 0.25], [-15.3, -0.25], [-16.1, -0.35], [-16.0, -2.0], [-15.6, -3.3], [-14.8, -3.6]], "xz", HY, 0.08);
    panel([[-12.8, 4.45], [-14.0, 5.6], [-14.5, 6.4], [-14.9, 6.8], [-15.2, 6.88], [-15.2, 4.35]], "xy", 0, 0.1);
    panel([[-15.25, 6.88], [-15.7, 6.8], [-16.2, 6.4], [-16.5, 5.7], [-16.6, 5.0], [-16.45, 4.3], [-16.0, 3.75], [-15.25, 3.6]], "xy", 0, 0.08);
    EXT.push(V(-16.6, 5.5, 0), V(-15.3, 7.0, 0), V(-14.0, HY, 4.6), V(-14.0, HY, -4.6), V(-16.1, HY, 0));
    pivot = V(1.45, 0.05, 0); tilt = Math.atan2(2.56 - 0.05, 1.45 + 15.2);
    partsInfo = { name: "Piper J-3 Cub" };
  } else {
    // NACA-style cowling around the radial: outer shell + inner lip, nine cylinder heads visible in the opening
    const OUT = range(ST[0][0], XF, 6).map((x) => ring(x)); addFaces(loft(OUT, true, false)); ringLines(OUT, 3, [0, 6, 12, 18]);
    const yc = (ST[0][2] + ST[0][3]) / 2, rl = 1.55, lip = range(0, Math.PI * 2, 28).map((a) => V(ST[0][0], yc + rl * Math.sin(a), rl * Math.cos(a))); poly(L, lip, true);
    { const front = []; for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2; front.push([V(ST[0][0], yc + rl * Math.sin(a), rl * Math.cos(a)), surf(ST[0][0], a - Math.PI / 2)]); }
      addFaces(loft([front.map((p) => p[0]), front.map((p) => p[1])], false, false)); }
    { const back = new THREE.CircleGeometry(rl, 20); back.rotateY(Math.PI / 2); back.translate(ST[0][0] - 0.7, yc, 0); addFaces(back); }
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + Math.PI / 2, c = V(ST[0][0] - 0.35, yc + 1.08 * Math.sin(a), 1.08 * Math.cos(a)), b = new THREE.CylinderGeometry(0.2, 0.24, 0.62, 8, 1, false);
      b.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(0, Math.sin(a), Math.cos(a)))); b.translate(c.x, c.y, c.z); addFaces(b, G);
      poly(L, range(0, Math.PI * 2, 8).map((t) => c.clone().add(V(0.2 * Math.cos(t), 0, 0)).add(V(0, -Math.cos(a), Math.sin(a)).multiplyScalar(0.2 * Math.sin(t))).addScaledVector(V(0, Math.sin(a), Math.cos(a)), 0.31)), true); }
    prop(ST[0][0] + 0.1, yc, 4.3, 0.55, 0.42);
    // windshield + cabin windows (a row along each side) + cabin door
    win(3.9, 2.6, 0.95, Math.PI - 0.95, 1);
    for (const sd of [1, -1]) { for (const [a, b] of [[2.2, 0.6], [0.3, -1.3], [-1.6, -3.2]]) win(a, b, 0.42, 0.95, sd); }
    // cantilever wing: thick root, tapered, upper surface flush with the top of the fuselage (no struts)
    const wst = (z) => { const o = clamp(z / 20.5); return { le: lerp(3.4, 2.2, o), te: lerp(-4.4, -2.0, o), t: lerp(1.15, 0.6, o), y: 6.05, flat: false }; };
    wingLines(wst, [0, 1.4, 2.8, 4.2, 5.6, 7.0, WCUT]);
    // fixed main gear: splayed legs into teardrop wheel pants; small tailwheel
    for (const sd of [1, -1]) { const ax = V(3.1, -0.15, sd * 4.3); rod(V(3.4, 2.05, sd * 1.0), ax.clone().add(V(0, 0.9, 0)), 0.14); rod(V(0.9, 2.1, sd * 1.0), ax.clone().add(V(0, 0.9, 0)), 0.08);
      seg(L, V(3.4, 2.05, sd * 1.0), ax.clone().add(V(0, 0.9, 0))); seg(L, V(0.9, 2.1, sd * 1.0), ax.clone().add(V(0, 0.9, 0)));
      const prof = range(0, 1, 12).map((u) => new THREE.Vector2(Math.max(0.02, 1.0 * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.8 * (1 - 0.35 * u)), u)); const pg = new THREE.LatheGeometry(prof, 14);
      pg.scale(1, 3.4, 0.42); pg.rotateZ(Math.PI / 2); pg.translate(ax.x + 1.25, ax.y + 0.05, ax.z); addFaces(pg);
      const pr = range(0, 1, 12).map((u) => { const r = Math.max(0.02, Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.8 * (1 - 0.35 * u)); return range(0, Math.PI * 2, 14).map((a) => V(ax.x + 1.25 - u * 3.4, ax.y + 0.05 + r * Math.cos(a), ax.z + 0.42 * r * Math.sin(a))); });
      ringLines(pr.map((r) => r.slice(0, 14)), 4, [0, 3, 7, 10]); EXT.push(V(ax.x, ax.y - 1.0, ax.z), V(ax.x + 1.25, ax.y, ax.z), V(ax.x - 2.15, ax.y, ax.z)); }
    rod(V(-17.6, 4.55, 0), V(-17.9, 3.6, 0), 0.06); wheel(V(-17.95, 3.45, 0), 0.32, 0.2);
    // tail: elliptical stabilizer + elevator; tall rounded fin + balanced rudder
    const HY = 4.95;
    panel([...arc(-16.2, 0.3, 1.2, 5.6, 0, Math.PI * 0.5, 7), [-17.4, 5.9], [-17.4, -5.9], ...arc(-16.2, -0.3, 1.2, 5.6, -Math.PI * 0.5, 0, 7), [-15.0, -0.3]], "xz", HY);
    panel([[-17.45, 5.85], ...arc(-17.45, 0.3, 1.25, 5.55, Math.PI * 0.5, Math.PI * 0.95, 6), [-18.7, 0.3], [-18.7, -0.3], ...arc(-17.45, -0.3, 1.25, 5.55, Math.PI * 1.05, Math.PI * 1.5, 6), [-17.45, -5.85]], "xz", HY, 0.08);
    panel([...arc(-18.3, 5.3, 3.7, 3.1, 0, Math.PI * 0.5, 7), [-18.35, 8.4], [-18.35, 4.6], [-16.5, 4.7]], "xy", 0, 0.12);
    panel([[-18.4, 8.4], ...arc(-18.4, 6.4, 1.8, 2.0, Math.PI * 0.5, 0, 6), [-20.2, 5.0], ...arc(-19.3, 5.0, 0.9, 1.1, Math.PI, Math.PI * 1.5, 4).slice(1), [-18.4, 3.9]], "xy", 0, 0.1);
    EXT.push(V(-20.2, 6.0, 0), V(-18.4, 8.4, 0), V(-16.4, HY, 5.9), V(-16.4, HY, -5.9), V(-18.7, HY, 0));
    pivot = V(3.1, -1.15, 0); tilt = Math.atan2(3.13 - -1.15, 3.1 + 17.95);
    partsInfo = { name: "Lockheed Vega" };
  }
  // ---- assemble: 4 objects
  const root = new THREE.Group();
  const faceMat = new THREE.MeshBasicMaterial({ color: 0x0d0d10, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const solidMat = new THREE.MeshLambertMaterial({ color: 0x5c5b57, emissive: 0x141413 });
  const inkMat = new THREE.LineBasicMaterial({ color: 0xf2f1ec, transparent: true, opacity: 0.42 }), wingMat = new THREE.LineBasicMaterial({ color: 0xf2f1ec, transparent: true, opacity: 0.26 });
  const mk = (B, withN) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(B.p, 3)); if (withN) g.setAttribute("normal", new THREE.Float32BufferAttribute(B.n, 3)); g.setIndex(B.i); return g; };
  const lg = (A) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(A, 3)); return g; };
  root.add(new THREE.Mesh(mk(F, false), faceMat), new THREE.Mesh(mk(G, true), solidMat)); const l1 = new THREE.LineSegments(lg(L), inkMat), l2 = new THREE.LineSegments(lg(W), wingMat); l1.renderOrder = 5; l2.renderOrder = 5; root.add(l1, l2);
  // 3-point attitude: rotate nose-up about the main-wheel contact, which then sits at y = 0
  root.rotation.z = tilt; root.position.set(pivot.x - (pivot.x * Math.cos(tilt) - pivot.y * Math.sin(tilt)), -(pivot.x * Math.sin(tilt) + pivot.y * Math.cos(tilt)), 0); root.updateMatrixWorld(true);
  const dispose = () => root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return { root, surf, sec, XF, XT, ext: EXT, name: partsInfo.name, dispose, matrix: root.matrixWorld };
}
