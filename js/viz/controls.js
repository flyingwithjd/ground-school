// Flight controls on their hinges. Drag the yoke pad (roll + pitch) and the pedal bar (yaw);
// the 3D airplane moves its surfaces and responds gently about each axis. Secondary mode: trim and flaps.
import { frame, chips, slider } from "./base.js?v=715aa408ea";
import { planeStage } from "./planestage.js?v=715aa408ea";
import { h, s, clamp, reduced } from "../core/util.js?v=715aa408ea";
// model signs: ail>0 = roll right; elev<0 = trailing edge up (nose up); rud>0 = right rudder; trim>0 = tab TE down (nose-up trim); steer>0 = nosewheel left
function pad(parent, { label, w = 180, hgt = 180, axes = "xy", onmove }) {
  const box = h("div", { class: "pad", role: "slider", tabindex: "0", "aria-label": label, style: `width:${w}px;height:${hgt}px` });
  const sv = s("svg", { viewBox: `0 0 ${w} ${hgt}`, width: w, height: hgt }, box);
  s("rect", { x: 1, y: 1, width: w - 2, height: hgt - 2, rx: 14, fill: "none", stroke: "rgba(242,241,236,.18)" }, sv);
  if (axes.includes("x")) s("line", { x1: 12, y1: hgt / 2, x2: w - 12, y2: hgt / 2, stroke: "rgba(242,241,236,.12)" }, sv);
  if (axes.includes("y")) s("line", { x1: w / 2, y1: 12, x2: w / 2, y2: hgt - 12, stroke: "rgba(242,241,236,.12)" }, sv);
  const knob = s("circle", { cx: w / 2, cy: hgt / 2, r: 15, fill: "#3B82F6", filter: "" }, sv);
  const cap = h("span", { class: "label" }, label); const wrap = h("div", { class: "padwrap" }, box, cap); parent.append(wrap);
  let x = 0, y = 0, drag = false, raf = 0;
  const set = (nx, ny) => { x = clamp(nx, -1, 1); y = clamp(ny, -1, 1); knob.setAttribute("cx", w / 2 + x * (w / 2 - 20)); knob.setAttribute("cy", hgt / 2 + y * (hgt / 2 - 20)); onmove(x, y); };
  const fromEv = (e) => { const r = box.getBoundingClientRect(); return [axes.includes("x") ? ((e.clientX - r.left) / r.width) * 2 - 1 : 0, axes.includes("y") ? ((e.clientY - r.top) / r.height) * 2 - 1 : 0]; };
  box.addEventListener("pointerdown", (e) => { drag = true; box.setPointerCapture(e.pointerId); cancelAnimationFrame(raf); set(...fromEv(e)); });
  box.addEventListener("pointermove", (e) => drag && set(...fromEv(e)));
  const release = () => { if (!drag) return; drag = false; if (reduced()) return set(0, 0); const x0 = x, y0 = y, t0 = performance.now(); const step = (now) => { const k = Math.min(1, (now - t0) / 700), e = 1 - (1 - k) ** 3; set(x0 * (1 - e), y0 * (1 - e)); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
  box.addEventListener("pointerup", release); box.addEventListener("pointercancel", release);
  box.addEventListener("keydown", (e) => { const d = 0.25; const m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key]; if (m) { e.preventDefault(); set(x + m[0], y + m[1]); } if (e.key === "0" || e.key === " ") set(0, 0); });
  return { set, destroy() { cancelAnimationFrame(raf); } };
}
// Vertical trim wheel, like the 172S: roll it forward (up) for nose down, back (down) for nose up. It stays where you leave it.
function trimWheel(parent, { onchange }) {
  const W = 64, H = 170, sx = 16, sw = 32, sy = 22, sh = H - 44;
  const box = h("div", { class: "pad trimwheel", role: "slider", tabindex: "0", "aria-label": "Trim wheel", "aria-valuemin": "-1", "aria-valuemax": "1", "aria-valuenow": "0", style: `width:${W}px;height:${H}px` });
  const sv = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, box);
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
  box.addEventListener("pointerdown", (e) => { drag = true; box.setPointerCapture(e.pointerId); y0 = e.clientY; v0 = v; });
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
    S.setView({ tg: [-5, 5, 0], az: -150, el: 16, d: 50 });
    S.highlight(["ailerons", "elevator", "rudder"]);
    const row = h("div", { class: "pads" }); F.ctrl.append(row);
    const words = () => { const p = []; if (Math.abs(st.ail) > 0.15) p.push(`Right aileron ${st.ail > 0 ? "up" : "down"}, left ${st.ail > 0 ? "down" : "up"}: roll ${st.ail > 0 ? "right" : "left"}`); if (Math.abs(st.elev) > 0.15) p.push(`Elevator trailing edge ${st.elev < 0 ? "up" : "down"}: nose ${st.elev < 0 ? "up" : "down"}`); if (Math.abs(st.rud) > 0.15) p.push(`Rudder ${st.rud > 0 ? "right" : "left"}: nose yaws ${st.rud > 0 ? "right" : "left"}`); return p; };
    let lastTint = "";   // blue fill on whichever surfaces are deflected
    let upd = () => { S.pose({ ail: st.ail * 28, elev: st.elev * 28, rud: st.rud * 28, steer: -st.rud * 10 }); const big = Math.abs(st.ail) > Math.max(Math.abs(st.elev), Math.abs(st.rud)) ? (st.ail > 0 ? "Roll right" : "Roll left") : Math.abs(st.elev) >= Math.abs(st.rud) && Math.abs(st.elev) > 0.15 ? (st.elev < 0 ? "Pitch up" : "Pitch down") : Math.abs(st.rud) > 0.15 ? (st.rud > 0 ? "Yaw right" : "Yaw left") : "Neutral"; F.caption(words()[0] ? "Control input" : "Hands off", big); const tn = [Math.abs(st.ail) > 0.15 && "ailerons", Math.abs(st.elev) > 0.15 && "elevator", Math.abs(st.rud) > 0.15 && "rudder"].filter(Boolean).join(); if (tn !== lastTint) { lastTint = tn; S.tint(tn ? tn.split(",") : []); }
      F.explain(words().join(". ") + (words().length ? ". <span class=\"src\">Surface movement exaggerated for clarity.</span>" : "Drag the yoke pad left and right to roll, down (pull back) for nose up, up (push forward) for nose down. Use the pedal bar for rudder.")); };
    const yoke = pad(row, { label: "Yoke · drag down (pull) = nose up", axes: "xy", onmove: (x, y) => { st.ail = x; st.elev = -y; upd(); } });
    const ped = pad(row, { label: "Rudder pedals", w: 220, hgt: 64, axes: "x", onmove: (x) => { st.rud = x; upd(); } });
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
    const TRIMV = { tg: [-17.3, 4.5, 1.8], az: 100, el: 10, d: 7 }; S.setView(TRIMV, 1); S.highlight(["trimtab"]); S.tint(["trimtab"]);
    let trim = 0, flap = 0, flapShown = 0, lastTT = "trimtab";
    // flaps travel smoothly to the new setting (the motor runs the flaps; no redraw)
    const flapTo = (to) => { if (to === flapShown) return; if (reduced()) { flapShown = to; S.pose({ flap: to }); return; } const from = flapShown, t0 = performance.now(), dur = 300 + Math.abs(to - from) * 40;
      S.animate((now) => { const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; flapShown = from + (to - from) * e; S.pose({ flap: flapShown }); if (k >= 1) { flapShown = to; S.animate(null); } }); };
    let showChips = null;   // keep the "Show" buttons in step when the trim wheel or flap lever switches the view
    let cur = "trim"; const show = (what) => { showChips && showChips.set(what); if (what === cur) return; cur = what; if (what === "trim") { S.highlight(["trimtab"]); S.setView(TRIMV); } else { S.highlight(["flaps"]); S.setView("wingL"); } lastTT = what === "trim" ? "trimtab" : ""; S.tint(lastTT ? [lastTT] : []); };
    const upd = () => { // hands off: the tab's aerodynamic force holds the elevator opposite the tab
      S.pose({ trim: trim * 20 }); flapTo(flap); const tt = cur === "trim" ? "trimtab" : ""; if (tt !== lastTT) { lastTT = tt; S.tint(tt ? [tt] : []); }
      F.caption(trim === 0 ? "Trim neutral" : `Trim tab trailing edge ${trim > 0 ? "down" : "up"}`, trim > 0 ? "Nose-up trim" : trim < 0 ? "Nose-down trim" : flap ? `Flaps ${flap}°` : "Trim neutral"); };
    showChips = chips(F.ctrl, [["trim", "Elevator trim"], ["flaps", "Flaps"]], "trim", show, { label: "Show" });
    trimWheel(F.ctrl, { onchange: (v) => { trim = v; show("trim"); upd(); F.explain("The trim wheel moves <b>only the tab</b>. In flight, air pushing on the deflected tab holds the elevator the <b>opposite</b> way, so you can relax pressure on the yoke. In the 172S, roll the wheel forward to trim nose down. <span class=\"src\">Tab movement exaggerated for clarity.</span>"); } });
    const fl = chips(F.ctrl, [["0", "0°"], ["10", "10°"], ["20", "20°"], ["30", "30°"]], "0", (v) => { flap = +v; show("flaps"); upd(); F.caption(flap ? `Max ${flap === 10 ? "110" : "85"} KIAS with this setting` : "Flaps up", `Flaps ${flap}°`); F.explain(flap ? "Both flaps move down together, adding lift and drag so you can fly slower and descend more steeply." : "Retracted. The 172S flap motor has stops at 10°, 20° and 30°."); }, { label: "Flap lever" });
    upd(); F.explain("Move the trim wheel, then switch to the flaps.");
  }
  return { destroy() { cleanup.forEach((f) => f()); S.destroy(); F.destroy(); } };
}
