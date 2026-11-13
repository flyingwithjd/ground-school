// Small 3D models in the same { root, parts, meshes } format as c172-model.js, for parts the 172 does not have
// (wing sections with other flap types, slats, spoilers, tail tabs, a twisted prop blade). planeStage({ model }) renders
// them with the exact look of the airplane: solid near-black faces, thin ink edges, blue accent and tint on the part in focus.
// Units: feet. x forward (leading edge toward +x), y up, z span.
export function airfoil(n = 40, t = 0.13, m = 0.02, p = 0.4) { const U = [], Lo = [];
  for (let i = 0; i <= n; i++) { const x = (1 - Math.cos((i / n) * Math.PI)) / 2, yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const yc = m ? (x < p ? (m / p ** 2) * (2 * p * x - x * x) : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x * x)) : 0; U.push([x, yc + yt]); Lo.push([x, yc - yt]); } return [U, Lo]; }
// pieces: [{ name, pts: [[x, y]...] closed outline in model feet, pivot: [x, y], parent: name|null, z: [z0, z1], ribs }]
export function sectionModel(THREE, pieces, { stations = 3, spanEvery = 4 } = {}) {
  const faceMat = new THREE.MeshBasicMaterial({ color: 0x0d0d10, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const root = new THREE.Group(), parts = {}, meshes = [], objs = {};
  for (const pc of pieces) {
    const [z0, z1] = pc.z || [-3, 3], pv = pc.pivot || [0, 0], par = pc.parent ? pieces.find((q) => q.name === pc.parent) : null, ppv = par ? par.pivot || [0, 0] : [0, 0];
    const o = new THREE.Group(); o.position.set(pv[0] - ppv[0], pv[1] - ppv[1], 0); (par ? objs[par.name] : root).add(o); objs[pc.name] = o;
    const loc = pc.pts.map(([x, y]) => [x - pv[0], y - pv[1]]), n = loc.length, pos = [], idx = [];
    // side walls (two rings) + flat end caps (fan from the centroid; outlines are near-convex sections)
    [z0, z1].forEach((z) => loc.forEach(([x, y]) => pos.push(x, y, z)));
    for (let i = 0; i < n; i++) { const a = i, b = (i + 1) % n; idx.push(a, b, b + n, a, b + n, a + n); }
    const cx = loc.reduce((s, q) => s + q[0], 0) / n, cy = loc.reduce((s, q) => s + q[1], 0) / n;
    [0, 1].forEach((k) => { const ci = pos.length / 3; pos.push(cx, cy, k ? z1 : z0); for (let i = 0; i < n; i++) idx.push(ci, k * n + i, k * n + (i + 1) % n); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const mesh = new THREE.Mesh(g, faceMat); mesh.userData.part = pc.name; mesh.userData.tag = pc.name; o.add(mesh); meshes.push(mesh);
    // ink: the section outline at both ends and at a few ribs, plus spanwise lines every few outline points
    const segs = [], zs = [z0, z1]; for (let k = 1; k <= (pc.ribs ?? stations) - 1; k++) zs.push(z0 + ((z1 - z0) * k) / (pc.ribs ?? stations));
    zs.forEach((z) => { for (let i = 0; i < n; i++) { const a = loc[i], b = loc[(i + 1) % n]; segs.push(a[0], a[1], z, b[0], b[1], z); } });
    const every = pc.spanEvery ?? spanEvery; for (let i = 0; i < n; i += every) segs.push(loc[i][0], loc[i][1], z0, loc[i][0], loc[i][1], z1);
    (parts[pc.name] ||= { name: pc.name, subs: [] }).subs.push({ obj: o, segs });
  }
  return { root, parts, meshes, objs, pose() {} };
}
// 2D transform helpers that mirror the three.js group transforms (rotation about z, CCW positive = trailing edge down for a
// section whose leading edge points to +x)
export const rotP = ([x, y], a, [cx, cy] = [0, 0]) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };
