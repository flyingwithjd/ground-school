// Flight controls on their hinges. Drag the drawn yoke (turn = roll, pull/push = pitch) and press the rudder pedals (yaw);
// the 3D airplane moves its surfaces and responds gently about each axis. Secondary mode: trim and flaps.
import { frame, chips, slider } from "./base.js?v=ab272ba69e";
import { planeStage } from "./planestage.js?v=ab272ba69e";
import { trimFlaps } from "./trimflaps.js?v=ab272ba69e";
import { h, s, clamp, reduced } from "../core/util.js?v=ab272ba69e";
// model signs: ail>0 = roll right; elev<0 = trailing edge up (nose up); rud>0 = right rudder; trim>0 = tab TE down (nose-up trim); steer>0 = nosewheel left
// Shared drag-and-spring behaviour for the drawn cockpit controls: drag moves them, release springs them back to neutral.
function springy(box, { get, set, fromDown, fromMove, keys }) {
  let drag = false, raf = 0, st0 = null;
  box.addEventListener("pointerdown", (e) => { e.stopPropagation(); drag = true; box.setPointerCapture(e.pointerId); cancelAnimationFrame(raf); st0 = { x: e.clientX, y: e.clientY, v: get() }; const v = fromDown && fromDown(e, st0); if (v) set(...v); });
  box.addEventListener("pointermove", (e) => { if (drag) set(...fromMove(e, st0)); });
  const release = () => { if (!drag) return; drag = false; if (reduced()) return set(0, 0); const v0 = get(), t0 = performance.now(); const step = (now) => { const k = Math.min(1, (now - t0) / 700), e = 1 - (1 - k) ** 3; set(v0[0] * (1 - e), v0[1] * (1 - e)); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
  box.addEventListener("pointerup", release); box.addEventListener("pointercancel", release); box.addEventListener("lostpointercapture", release);
  box.addEventListener("keydown", (e) => { const m = keys[e.key]; const v = get(); if (m) { e.preventDefault(); set(v[0] + m[0], v[1] + m[1]); } if (e.key === "0" || e.key === " " || e.key === "Escape") { e.preventDefault(); set(0, 0); } });
  return () => cancelAnimationFrame(raf);
}
const INKC = "rgba(242,241,236,", ACCC = "#3B82F6";
// A 172 yoke seen from the left seat. Drag left/right to turn it (roll); drag down to pull it toward you (nose up), up to push it (nose down).
function yokeCtl(parent, { onmove }) {
  const W = 220, H = 170, cx = 110, cy = 92;
  const box = h("div", { class: "pad pf-yoke", role: "slider", tabindex: "0", "aria-label": "Yoke. Left and right arrows roll, down arrow pulls back for nose up, up arrow pushes for nose down" });
  const sv = s("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" }, box);
  s("rect", { x: 0, y: 0, width: W, height: 26, fill: INKC + ".05)" }, sv); s("line", { x1: 0, y1: 26, x2: W, y2: 26, stroke: INKC + ".18)" }, sv);   // instrument panel edge
  const shaft = s("rect", { x: cx - 9, y: 26, width: 18, height: cy - 26, rx: 3, fill: INKC + ".14)", stroke: INKC + ".3)" }, sv);
  const g = s("g", {}, sv);
  s("path", { d: "M-78,-36 Q-86,4 -58,10 L58,10 Q86,4 78,-36", fill: "none", stroke: INKC + ".82)", "stroke-width": 15, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  s("rect", { x: -24, y: -6, width: 48, height: 26, rx: 8, fill: "#16171a", stroke: INKC + ".55)", "stroke-width": 1.5 }, g);
  s("circle", { cx: 0, cy: 7, r: 4.5, fill: ACCC }, g);
  let x = 0, y = 0;
  const draw = () => { const sc = 1 + 0.16 * y, hy = cy + 16 * y; g.setAttribute("transform", `translate(${cx},${hy}) rotate(${x * 40}) scale(${sc})`); shaft.setAttribute("height", Math.max(4, hy - 26)); shaft.setAttribute("width", 18 * sc); shaft.setAttribute("x", cx - 9 * sc); box.setAttribute("aria-valuetext", `roll ${x.toFixed(2)}, pitch ${(-y).toFixed(2)}`); };
  const set = (nx, ny) => { x = clamp(nx, -1, 1); y = clamp(ny, -1, 1); draw(); onmove(x, y); };
  const off = springy(box, { get: () => [x, y], set, fromMove: (e, s0) => { const r = box.getBoundingClientRect(); return [s0.v[0] + (e.clientX - s0.x) / (r.width * 0.42), s0.v[1] + (e.clientY - s0.y) / (r.height * 0.42)]; },
    keys: { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] } });
  parent.append(h("div", { class: "pf-item" }, box, h("span", { class: "pf-lab" }, "Yoke"))); draw(); return { set, destroy: off };
}
// Rudder pedals from the seat: press or drag toward a pedal to push it forward (the other comes back). Left pedal = left rudder.
function pedalsCtl(parent, { onmove }) {
  const W = 220, H = 100;
  const box = h("div", { class: "pad pf-pedals", role: "slider", tabindex: "0", "aria-label": "Rudder pedals. Left arrow pushes the left pedal, right arrow the right pedal", "aria-valuemin": "-1", "aria-valuemax": "1", "aria-valuenow": "0" });
  const sv = s("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" }, box);
  const pedal = (px) => { const g = s("g", {}, sv); const r = s("rect", { x: -27, y: -36, width: 54, height: 72, rx: 9, fill: "#16171a", stroke: INKC + ".6)", "stroke-width": 1.5 }, g);
    for (let i = -2; i <= 2; i++) s("line", { x1: -16, x2: 16, y1: i * 11, y2: i * 11, stroke: INKC + ".28)", "stroke-width": 2, "stroke-linecap": "round" }, g); return { g, r, px }; };
  const L = pedal(62), R = pedal(158);
  let x = 0;
  const draw = () => { [[L, -x], [R, x]].forEach(([p, k]) => { const f = Math.max(0, k), b = Math.max(0, -k); p.g.setAttribute("transform", `translate(${p.px},${52 - 14 * f + 8 * b}) scale(${1 - 0.14 * f + 0.06 * b})`); p.r.setAttribute("stroke", f > 0.15 ? ACCC : INKC + ".6)"); }); box.setAttribute("aria-valuenow", x.toFixed(2)); };
  const set = (nx) => { x = clamp(nx, -1, 1); draw(); onmove(x); };
  const at = (e) => { const r = box.getBoundingClientRect(); return [clamp((((e.clientX - r.left) / r.width) * 2 - 1) * 1.4, -1, 1), 0]; };
  const off = springy(box, { get: () => [x, 0], set: (a) => set(a), fromDown: at, fromMove: at, keys: { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0] } });
  parent.append(h("div", { class: "pf-item" }, box, h("span", { class: "pf-lab" }, "Rudder pedals"))); draw(); return { set, destroy: off };
}
// Vertical trim wheel, like the 172S: roll it forward (up) for nose down, back (down) for nose up. It stays where you leave it.
function trimWheel(parent, { onchange }) {
  const W = 64, H = 170, sx = 16, sw = 32, sy = 22, sh = H - 44;
  const box = h("div", { class: "pad trimwheel", role: "slider", tabindex: "0", "aria-label": "Trim wheel", "aria-valuemin": "-1", "aria-valuemax": "1", "aria-valuenow": "0" });
  const sv = s("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" }, box);
  const txt = (y, t) => { const e = s("text", { x: W / 2, y, "text-anchor": "middle", fill: "rgba(242,241,236,.55)", "font-size": 10, "font-family": "IBM Plex Mono, monospace", "letter-spacing": ".08em" }, sv); e.textContent = t; };
  txt(12, "NOSE DN"); txt(H - 4, "NOSE UP");
  s("rect", { x: sx, y: sy, width: sw, height: sh, rx: 10, fill: "none", stroke: "rgba(242,241,236,.25)" }, sv);
  const clipId = "tw" + Math.random().toString(36).slice(2, 7); const cp = s("clipPath", { id: clipId }, sv); s("rect", { x: sx + 2, y: sy + 2, width: sw - 4, height: sh - 4, rx: 8 }, cp);
  const g = s("g", { "clip-path": `url(#${clipId})` }, sv); const ridges = [];
  for (let i = -1; i <= Math.ceil(126 / 9) + 1; i++) ridges.push(s("line", { x1: sx + 5, x2: sx + sw - 5, y1: 0, y2: 0, stroke: "rgba(242,241,236,.35)", "stroke-width": 1.5 }, g));
  const idx = s("line", { x1: sx - 6, x2: sx + sw + 6, y1: 0, y2: 0, stroke: "#3B82F6", "stroke-width": 3, "stroke-linecap": "round" }, sv);
  let v = 0, drag = false, y0 = 0, v0 = 0;
  const draw = () => { const off = (((v * 60) % 9) + 9) % 9; ridges.forEach((r, i) => { const y = sy + (i - 1) * 9 + off; r.setAttribute("y1", y); r.setAttribute("y2", y); }); const iy = sy + sh / 2 + v * (sh / 2 - 8); idx.setAttribute("y1", iy); idx.setAttribute("y2", iy); box.setAttribute("aria-valuenow", v.toFixed(2)); };
  const set = (nv) => { v = clamp(Math.round(nv * 20) / 20, -1, 1); draw(); onchange(v); };   // v>0 = rolled back (down) = nose-up trim (trim>0)
  box.addEventListener("pointerdown", (e) => { e.stopPropagation(); drag = true; box.setPointerCapture(e.pointerId); y0 = e.clientY; v0 = v; });
  box.addEventListener("pointermove", (e) => { if (drag) set(v0 + (e.clientY - y0) / (sh / 2)); });
  const up = () => (drag = false); box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
  box.addEventListener("keydown", (e) => { const m = { ArrowUp: -0.1, ArrowDown: 0.1 }[e.key]; if (m) { e.preventDefault(); set(v + m); } if (e.key === "0") set(0); });
  parent.append(box); draw(); return { set };
}

export function mount(host, { mode = "primary" } = {}) {
  const F = frame(host, { cls: "tall", corners: { tl: mode === "primary" ? "Primary flight controls" : "Trim and flaps", tr: mode === "primary" ? "Drag the yoke and pedals" : "PHAK 6 · POH 7" } });
  const S = planeStage(F.stage, { view: mode === "primary" ? "rear" : "tailR", orbit: true });
  let st = { ail: 0, elev: 0, rud: 0 }, att = { pitch: 0, bank: 0, yaw: 0 };
  const cleanup = [];
  if (mode === "primary") {
    const pv = () => { const r = F.stage.getBoundingClientRect(); return { tg: [-5, 5, 0], az: -150, el: 16, d: r.width < 560 ? 60 : 42 }; };
    queueMicrotask(() => S.setView(pv(), 1));
    S.highlight(["ailerons", "elevator", "rudder"]);
    // title band above, the 3D view with the cockpit controls right beside it (below it on phones), words band under them
    F.root.classList.add("tf", "pf");
    const title = h("div", { class: "tf-title" }), chain = h("p", { class: "tf-chain", "aria-live": "polite" });
    const body = h("div", { class: "pf-body" }), col = h("div", { class: "pf-ctl" });
    F.root.insertBefore(title, F.stage); F.root.insertBefore(body, F.stage); body.append(col, F.stage); body.after(chain);
    const words = () => { const p = []; if (Math.abs(st.ail) > 0.15) p.push(`Right aileron ${st.ail > 0 ? "up" : "down"}, left ${st.ail > 0 ? "down" : "up"}: roll ${st.ail > 0 ? "right" : "left"}`); if (Math.abs(st.elev) > 0.15) p.push(`Elevator ${st.elev < 0 ? "up" : "down"}: nose ${st.elev < 0 ? "up" : "down"}`); if (Math.abs(st.rud) > 0.15) p.push(`Rudder ${st.rud > 0 ? "right" : "left"}: nose yaws ${st.rud > 0 ? "right" : "left"}`); return p; };
    let lastTint = "", lastWords = "";   // blue fill on whichever surfaces are deflected
    let upd = () => { S.pose({ ail: st.ail * 28, elev: st.elev * 28, rud: st.rud * 28, steer: -st.rud * 10 }); const acts = [[Math.abs(st.ail), st.ail > 0 ? "roll right" : "roll left"], [Math.abs(st.elev), st.elev < 0 ? "pitch up" : "pitch down"], [Math.abs(st.rud), st.rud > 0 ? "yaw right" : "yaw left"]].filter((a) => a[0] > 0.15).sort((p, q) => q[0] - p[0]).slice(0, 2).map((a) => a[1]);
      const big = acts.length ? (acts.join(" + ")).replace(/^./, (c) => c.toUpperCase()) : "Hands off";
      if (title.textContent !== big) title.textContent = big; const wd = words().join(" · ") || "Drag the yoke or press a pedal."; if (wd !== lastWords) { lastWords = wd; chain.textContent = wd; }
      const tn = [Math.abs(st.ail) > 0.15 && "ailerons", Math.abs(st.elev) > 0.15 && "elevator", Math.abs(st.rud) > 0.15 && "rudder"].filter(Boolean).join(); if (tn !== lastTint) { lastTint = tn; S.tint(tn ? tn.split(",") : []); } };
    F.explain("Turn the yoke left or right to roll. Pull it toward you (drag down) for nose up, push it (drag up) for nose down. Push the left pedal for left yaw, the right pedal for right yaw. Keyboard: focus a control and use the arrow keys; 0 centers it. <span class=\"src\">PHAK Ch 6, flight controls. Surface movement exaggerated for clarity.</span>");
    const yoke = yokeCtl(col, { onmove: (x, y) => { st.ail = x; st.elev = -y; upd(); } });
    const ped = pedalsCtl(col, { onmove: (x) => { st.rud = x; upd(); } });
    cleanup.push(() => yoke.destroy(), () => ped.destroy());
    // gentle attitude response so the surface-to-motion link is visible (illustrative rates)
    let running = false;
    const step = () => { att.bank = clamp(att.bank + st.ail * 0.5 - att.bank * 0.01, -35, 35); att.pitch = clamp(att.pitch + -st.elev * 0.2 - att.pitch * 0.02, -12, 12); att.yaw = clamp(att.yaw + st.rud * 0.25 - att.yaw * 0.02, -15, 15); S.setAttitude(att);
      // stop rendering once controls are neutral and the airplane has settled
      if (Math.abs(st.ail) + Math.abs(st.elev) + Math.abs(st.rud) < 0.01 && Math.abs(att.bank) + Math.abs(att.pitch) + Math.abs(att.yaw) < 0.3) { running = false; S.animate(null); } };
    const wake = () => { if (!running && !reduced()) { running = true; S.animate(step); } };
    const upd0 = upd; upd = () => { upd0(); wake(); };
    upd();
  } else {
    // trim and flaps share this one 3D stage; the trim wheel sits on its left
    const off = trimFlaps({ ...F, chipsApi: (opts, val, fn, label) => chips(F.ctrl, opts, val, fn, { label }) }, S, { wheel: (fn) => trimWheel(F.stage, { onchange: fn }) });
    cleanup.push(off);
  }
  return { destroy() { cleanup.forEach((f) => f()); S.destroy(); F.destroy(); } };
}
