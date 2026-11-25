// First-visit screen: the same C172S wireframe used in the lessons, turning slowly.
// Render on demand through planeStage: capped at 30 fps, no frames off screen or in a hidden tab, still for reduced motion.
import { reduced } from "../core/util.js?v=eb00616c11";
export async function mountHero172(host) {
  const fig = document.createElement("figure"); fig.className = "hero172"; fig.setAttribute("aria-label", "Cessna 172S wireframe model, turning slowly");
  const stage = document.createElement("div"); stage.className = "hero172-stage"; fig.append(stage);
  const cap = document.createElement("figcaption"); cap.textContent = "Cessna 172S · the airplane you meet first"; fig.append(cap);
  host.append(fig);
  let S; try { const { planeStage } = await import("../viz/planestage.js?v=eb00616c11"); if (!fig.isConnected) return; S = planeStage(stage, { view: { tg: [-2.5, 4.4, 0], az: -32, el: 16, d: 44 }, orbit: false, maxFps: 30 }); }
  catch (e) { fig.remove(); return; }
  if (reduced()) { S.kick(); return S; }
  fig.dataset.live = "1"; let last = 0;
  S.animate((now) => { if (!fig.isConnected) { S.destroy(); return false; } const dt = last ? Math.min(100, now - last) : 0; last = now; S.pivot.rotation.y += dt * 0.00035; return true; }, { idle: true });
  const mo = new MutationObserver(() => { if (!fig.isConnected) { mo.disconnect(); S.destroy(); } }); mo.observe(document.body, { childList: true, subtree: true });
  return S;
}
