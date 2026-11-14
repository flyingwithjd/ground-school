// Soft additive halo sprites for nav, beacon, strobe and landing lights (ink-3D).
// The texture is white; tint with the sprite's color. World-sized so the glow scales with the camera.
// tight: a smaller, sharper core so a nav light doesn't bloom into a blob or swallow a nearby strobe.
import { reduced } from "../core/util.js?v=093801d129";
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
