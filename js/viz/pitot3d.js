// C172S heated pitot tube (POH 7): a short L hanging from the lower surface of the LEFT wing,
// just outboard of the lift-strut attach (8.4 ft span). A small mounting plate, a stubby
// vertical mast, then a short forward-pointing tube whose tip stays under the wing, only
// slightly ahead of the mast — not a long rod past the leading edge.
// Units: feet. Model axes: +X forward, +Y up, +Z right. wst() matches c172-model.js.
const FT_SPAN = 36 + 1 / 12, DIH = Math.tan((1.73 * Math.PI) / 180);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, w) => a + (b - a) * w;
const N = (u) => (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1015 * u ** 4) / 0.06;
const Nn = (u) => N(u) / N(0.3);

export function pitotLayout() {
  const sta = 9.0, u = 0.28;
  const o = clamp((sta - 7.5) / (FT_SPAN / 2 - 7.5));
  const le = lerp(1.6, 1.15, o), te = lerp(-3.75, -2.40, o);
  const t = lerp(0.7, 0.45, clamp((sta - 1.9) / (FT_SPAN / 2 - 1.9)));
  const y = 6.62 + Math.max(0, sta - 1.9) * DIH, chord = le - te;
  const mastX = le - u * chord, skinY = y - 0.4 * t * Nn(Math.max(u, 1e-4)), z = -sta;
  const mastLen = 0.34, tubeLen = 0.50, tipLen = 0.11;
  return {
    sta, z, le, te, chord, y, mastX, skinY, mastLen, tubeLen, tipLen,
    mastR: 0.08, tubeR: 0.055, plateR: 0.15,
    plate: [mastX, skinY, z],
    elbow: [mastX, skinY - mastLen, z],
    tip: [mastX + tubeLen + tipLen, skinY - mastLen, z]
  };
}

function geos(THREE, L) {
  const out = [];
  const plate = new THREE.CylinderGeometry(L.plateR, L.plateR, 0.03, 16);
  plate.translate(L.mastX, L.skinY - 0.01, L.z); out.push(plate);
  const collar = new THREE.CylinderGeometry(0.10, 0.11, 0.05, 12);
  collar.translate(L.mastX, L.skinY - 0.04, L.z); out.push(collar);
  const mast = new THREE.CylinderGeometry(L.mastR * 0.92, L.mastR, L.mastLen - 0.06, 12);
  mast.translate(L.mastX, L.skinY - 0.06 - (L.mastLen - 0.06) / 2, L.z); out.push(mast);
  const elbow = new THREE.SphereGeometry(L.mastR * 1.05, 12, 8);
  elbow.translate(L.elbow[0], L.elbow[1], L.elbow[2]); out.push(elbow);
  const tube = new THREE.CylinderGeometry(L.tubeR, L.tubeR, L.tubeLen, 12);
  tube.rotateZ(Math.PI / 2); tube.translate(L.mastX + L.tubeLen / 2, L.elbow[1], L.z); out.push(tube);
  const tip = new THREE.ConeGeometry(L.tubeR, L.tipLen, 12);
  tip.rotateZ(-Math.PI / 2); tip.translate(L.mastX + L.tubeLen + L.tipLen / 2, L.elbow[1], L.z); out.push(tip);
  return out;
}

function edgeSegs(THREE, list) {
  const s = [];
  list.forEach((g) => { const a = new THREE.EdgesGeometry(g, 25).attributes.position.array; for (let i = 0; i < a.length; i++) s.push(a[i]); });
  return s;
}

// style "model": faces only (uses the airplane face material); segs feed the model's ink pass.
// style "cue": independent fill + ink lines, optionally with depthTest false so they sit on top of the skin.
export function buildPitot(THREE, opts = {}) {
  const L = pitotLayout(), gList = geos(THREE, L), segs = edgeSegs(THREE, gList);
  const group = new THREE.Group(), parts = [];
  const model = opts.style === "model";
  const fill = opts.fill || new THREE.MeshBasicMaterial({
    color: opts.fillColor ?? 0x0a0a0b,
    transparent: opts.depthTest === false,
    opacity: opts.opacity ?? (opts.depthTest === false ? 0.92 : 1),
    depthTest: opts.depthTest !== false,
    depthWrite: opts.depthTest !== false
  });
  const edge = model ? null : (opts.edge || new THREE.LineBasicMaterial({
    color: opts.inkColor ?? 0xf2f1ec,
    transparent: opts.depthTest === false,
    depthTest: opts.depthTest !== false
  }));
  gList.forEach((geo) => {
    const m = new THREE.Mesh(geo, fill);
    if (opts.renderOrder != null) m.renderOrder = opts.renderOrder;
    group.add(m);
    if (edge) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edge);
      if (opts.renderOrder != null) e.renderOrder = opts.renderOrder;
      group.add(e);
      parts.push({ fill, edge, mesh: m });
    } else parts.push({ fill, edge: null, mesh: m });
  });
  if (opts.parent) opts.parent.add(group);
  return { group, layout: L, parts, fill, edge, segs, tip: L.tip, plate: L.plate, elbow: L.elbow };
}
