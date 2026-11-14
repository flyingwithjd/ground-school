// Soft additive halo sprites for nav, beacon, strobe and landing lights (ink-3D).
// The texture is white; tint with the sprite's color. World-sized so the glow scales with the camera.
// tight: a smaller, sharper core so a nav light doesn't bloom into a blob or swallow a nearby strobe.
import { reduced } from "../core/util.js?v=43931b26b4";
const TEX = { soft: null, tight: null };
function glowTex(THREE, tight) {
  const key = tight ? "tight" : "soft"; if (TEX[key]) return TEX[key];
  const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  if (tight) {
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.16, "rgba(255,255,255,.75)");
    g.addColorStop(0.38, "rgba(255,255,255,.12)"); g.addColorStop(0.7, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,0)");
  } else {
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.22, "rgba(255,255,255,.85)");
    g.addColorStop(0.55, "rgba(255,255,255,.28)"); g.addColorStop(1, "rgba(255,255,255,0)");
  }
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  TEX[key] = new THREE.CanvasTexture(c); TEX[key].needsUpdate = true; return TEX[key];
}
export function glowSprite(S, { color = 0xffffff, size = 2.8, tight = false } = {}) {
  const THREE = S.THREE;
  const mat = new THREE.SpriteMaterial({ map: glowTex(THREE, tight), color, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const sp = new THREE.Sprite(mat); sp.scale.set(size, size, 1); sp.renderOrder = 12; sp.visible = false; S.cueGroup.add(sp);
  return {
    obj: sp,
    set(p, intensity) {
      sp.position.set(...p);
      const on = intensity > 0.02; sp.visible = on; mat.opacity = on ? Math.min(1, intensity) : 0;
      const s = tight ? size * (0.95 + 0.12 * Math.min(1, intensity)) : size * (0.8 + 0.45 * Math.min(1, intensity));
      sp.scale.set(s, s, 1);
    }
  };
}
export const preferStill = () => reduced();
// Beacon: a smooth red pulse at about 45 flashes per minute. Strobes: a short white double-flash.
// Strobe windows are ~90 ms so a 30 fps loop still catches a crisp on-frame.
export function lightPulse(t, kind) {
  if (preferStill()) return kind === "strobe" ? 0 : 0.7;
  if (kind === "beacon") { const p = (t % 1.33) / 1.33; return 0.22 + 0.78 * Math.pow(Math.sin(Math.PI * p), 1.4); }
  if (kind === "strobe") { const p = t % 1.15; return (p < 0.09 || (p > 0.16 && p < 0.25)) ? 1 : 0; }
  return 1;
}

// Soft forward landing-light shaft (two crossed additive planes) plus a faint ground pool.
// Static geometry: no per-frame update. origin is the left-wing leading-edge lamp; the beam
// runs mostly +X (forward) and slightly down. Off when intensity is ~0.
const BEAM = { shaft: null, pool: null };
function shaftTex(THREE) {
  if (BEAM.shaft) return BEAM.shaft;
  const w = 64, h = 256, c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), img = x.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const along = Math.pow(1 - y / (h - 1), 1.35);
    for (let u = 0; u < w; u++) {
      const across = Math.pow(Math.max(0, 1 - Math.abs((u / (w - 1)) * 2 - 1)), 2.15);
      const i = (y * w + u) * 4, a = Math.round(255 * along * across);
      img.data[i] = 255; img.data[i + 1] = 244; img.data[i + 2] = 196; img.data[i + 3] = a;
    }
  }
  x.putImageData(img, 0, 0);
  BEAM.shaft = new THREE.CanvasTexture(c); BEAM.shaft.needsUpdate = true; return BEAM.shaft;
}
function poolTex(THREE) {
  if (BEAM.pool) return BEAM.pool;
  const s = 128, c = document.createElement("canvas"); c.width = c.height = s;
  const x = c.getContext("2d"), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,236,190,.7)"); g.addColorStop(0.35, "rgba(255,228,170,.28)");
  g.addColorStop(0.7, "rgba(255,220,150,.08)"); g.addColorStop(1, "rgba(255,220,150,0)");
  x.fillStyle = g; x.fillRect(0, 0, s, s);
  BEAM.pool = new THREE.CanvasTexture(c); BEAM.pool.needsUpdate = true; return BEAM.pool;
}
export function landingBeam(S, { dir = [1, -0.14, 0], length = 28, width = 5.5 } = {}) {
  const THREE = S.THREE, group = new THREE.Group(); group.visible = false; S.cueGroup.add(group);
  const d = new THREE.Vector3(...dir).normalize();
  const shaftMap = shaftTex(THREE);
  const planes = [0, Math.PI / 2].map((roll) => {
    const mat = new THREE.MeshBasicMaterial({ map: shaftMap, color: 0xfff3d0, transparent: true, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), mat);
    mesh.renderOrder = 11; mesh.frustumCulled = false; group.add(mesh);
    mesh.userData.roll = roll; mesh.userData.mat = mat; return mesh;
  });
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex(THREE), color: 0xffe9b0, transparent: true, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0, toneMapped: false });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), poolMat);
  pool.rotation.x = -Math.PI / 2; pool.position.y = 0.04; pool.renderOrder = 10; group.add(pool);
  function orient(mesh, p, mid) {
    const up = d, z = new THREE.Vector3(0, 1, 0).cross(up);
    if (z.lengthSq() < 1e-6) z.set(0, 0, 1); z.normalize();
    const x = up.clone().cross(z).normalize();
    const c = Math.cos(mesh.userData.roll), s = Math.sin(mesh.userData.roll);
    const xr = x.clone().multiplyScalar(c).add(z.clone().multiplyScalar(s));
    const zr = z.clone().multiplyScalar(c).sub(x.clone().multiplyScalar(s));
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xr, up, zr));
    mesh.position.copy(mid);
  }
  return {
    obj: group,
    set(p, intensity) {
      const on = intensity > 0.02; group.visible = on;
      const op = on ? Math.min(1, intensity) : 0;
      planes.forEach((m) => { m.userData.mat.opacity = 0.66 * op; });
      if (!on) { poolMat.opacity = 0; return; }
      const origin = new THREE.Vector3(...p), mid = origin.clone().addScaledVector(d, length / 2);
      planes.forEach((m) => orient(m, p, mid));
      // Faint pool where the beam axis meets y = 0, or under the far end if it hasn't reached the ground.
      const tHit = d.y < -0.02 ? -origin.y / d.y : Infinity;
      const t = Math.min(Math.max(tHit, 0), length * 1.15);
      const hit = origin.clone().addScaledVector(d, t); hit.y = 0.04;
      pool.position.copy(hit);
      const reach = tHit <= length * 1.2 && tHit > 0;
      const span = reach ? 7 + t * 0.18 : 5.5;
      pool.scale.set(span * 0.72, span, 1);
      poolMat.opacity = 0.45 * op * (reach ? 1 : 0.4);
    }
  };
}

