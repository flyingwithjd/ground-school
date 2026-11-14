// Shared building blocks for every visualization: frame, corner labels, caption, sliders, chips,
// and the signature "point of light" line draw (a bright head with a glowing tail lays the line down).
import { h, s, esc, ease, reduced, clamp } from "../core/util.js?v=098eade7ef";
export const ACC = "#3B82F6", INK = "#F2F1EC";
export const FAINT = "rgba(242,241,236,.22)", FAINT2 = "rgba(242,241,236,.4)";

export function frame(host, { cls = "", corners = {}, caption = null, explain = "" } = {}) {
  const root = h("figure", { class: "viz " + cls }); const stage = h("div", { class: "stage" }); root.append(stage);
  for (const k of ["tl", "tr", "bl", "br"]) if (corners[k]) stage.append(h("div", { class: "corner " + k }, corners[k]));
  const cap = h("div", { class: "caption" }); stage.append(cap);
  const ctrl = h("div", { class: "ctrl" }); const ex = h("div", { class: "explain" });
  root.append(ctrl, ex); if (cls.includes("capin")) root.insertBefore(cap, ctrl); host.append(root);
  const api = { root, stage, ctrl, explainEl: ex, cleanup: [],
    // update the caption text in place so the headline underline draws on once per visual, never again on a value or label change
    caption(label, big) { if (!label && !big) { cap.innerHTML = ""; return; } const l = cap.querySelector(".label"), b = cap.querySelector(".big"); if (!!l === !!label && !!b === !!big && (l || b)) { if (l && l.textContent !== label) l.textContent = label; if (b && b.textContent !== big) b.textContent = big; return; } cap.innerHTML = `${label ? `<span class="label">${esc(label)}</span>` : ""}${big ? `<span class="big">${esc(big)}</span>` : ""}`; },
    explain(html) { ex.innerHTML = html || ""; ex.style.display = html ? "" : "none"; },
    corner(k, text) { let c = stage.querySelector(".corner." + k); if (!c) { c = h("div", { class: "corner " + k }); stage.append(c); } c.textContent = text || ""; },
    on(fn) { api.cleanup.push(fn); }, destroy() { api.cleanup.forEach((f) => { try { f(); } catch (e) {} }); root.remove(); } };
  if (caption) api.caption(caption[0], caption[1]); api.explain(explain);
  if (!ctrl.childNodes.length) queueMicrotask(() => { if (!ctrl.childNodes.length) ctrl.style.display = "none"; });
  const vt = host.closest && host.closest("[data-viz]"); if (vt && LIVE_FIRST.has(vt.dataset.viz)) { root.classList.add("slfirst"); queueMicrotask(() => liveFirst(root, stage, ctrl, cap, ex)); }
  return api;
}
// Play-while-you-watch layout (GL2 systems visuals): the live sliders sit directly under the stage so the visual and every
// slider fit on one phone screen; then the option chips (compact, wrapping rows), then any strip, chart or readout drawn
// under the stage, and the headline last. Runs once after mount, when the controls exist; nothing moves afterwards.
export const LIVE_FIRST = new Set(["flaptypes", "prop", "mixture", "carbice", "combustion", "magcheck", "starter", "vg", "fuellim", "fuel3d", "elecsys", "enginegauges", "icing", "icing3d", "hypoxia", "koel", "pressurization", "press3d", "cabinheat", "heat3d", "autopilot", "ap3d", "gear", "gear3d", "certs"]);
function liveFirst(root, stage, ctrl, cap, ex) {
  const items = [...ctrl.children].filter((c) => c.classList.contains("slider") || (c.classList.contains("ctrl-row") && c.querySelector(".slider")));
  let live = null; if (items.length) { live = h("div", { class: "ctrl ctrl-live" }); items.forEach((c) => live.append(c)); stage.after(live); }
  if (!ctrl.children.length) ctrl.style.display = "none"; else (live || stage).after(ctrl);   // chips next, before any strip, chart or readout under the stage
  if (root.classList.contains("capin")) root.insertBefore(cap, ex);
}
// A control row that always takes its own full line in the controls bar, with a small mono label in front.
// Groups placed in separate rows never end up side by side, whatever the selection.
export function row(parent, label) { const r = h("div", { class: "ctrl-row" }); if (label) r.append(h("span", { class: "label ctrl-lab" }, label)); parent.append(r); return r; }
export function slider(parent, { label, min, max, step = 1, value, fmt = (v) => v, oninput, id }) {
  const uid = id || "s" + Math.random().toString(36).slice(2, 8);
  const inp = h("input", { type: "range", min, max, step, value, id: uid, "aria-label": label });
  const out = h("output", { for: uid }, fmt(+value));
  const w = h("div", { class: "slider" }, h("label", { for: uid }, label), inp, out); parent.append(w);
  const set = (v, fire = true) => { inp.value = v; out.textContent = fmt(+inp.value); fire && oninput && oninput(+inp.value); };
  inp.addEventListener("input", () => set(inp.value));
  return { el: w, input: inp, get value() { return +inp.value; }, set };
}
// toggle: tapping the active chip again clears it and calls onchange(null).
export function chips(parent, options, value, onchange, { label, toggle = false } = {}) {
  const wrap = h("div", { class: "chips", role: "group", "aria-label": label || "options" });
  const btns = options.map((o) => { const [v, t] = Array.isArray(o) ? o : [o, o]; const b = h("button", { class: "chip" + (v === value ? " on" : ""), type: "button", "aria-pressed": v === value ? "true" : "false" }, t);
    b.addEventListener("click", () => { const nv = toggle && String(value) === String(v) ? null : v; api.set(nv); onchange && onchange(nv); }); b.dataset.v = v; wrap.append(b); return b; });
  const api = { el: wrap, enable(keys) { const ok = new Set(keys.map(String)); btns.forEach((b) => { b.disabled = !ok.has(b.dataset.v); }); }, set(v) { value = v; btns.forEach((b) => { const on = b.dataset.v === String(v); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); }, get value() { return value; } };
  parent.append(wrap); return api;
}
export function readout(parent, items) { const w = h("div", { class: "readout" }); const els = {};
  items.forEach(([k, label]) => { const b = h("b", {}, "–"); w.append(h("div", {}, b, h("span", {}, label))); els[k] = b; }); parent.append(w);
  return (k, v) => { els[k].textContent = v; }; }

// ---------- SVG helpers ----------
export function svg(stage, vb, { cls = "full" } = {}) {
  const el = s("svg", { viewBox: vb, class: cls, preserveAspectRatio: "xMidYMid meet", role: "img" }); stage.prepend(el);
  const defs = s("defs", {}, el);
  // userSpaceOnUse so perfectly horizontal or vertical lines (zero-area bounding box) still glow
  const [vx, vy, vw, vh] = vb.split(/[ ,]+/).map(Number); const R = `filterUnits="userSpaceOnUse" x="${vx - vw}" y="${vy - vh}" width="${vw * 3}" height="${vh * 3}"`;
  defs.innerHTML = `<filter id="gw" ${R}><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="gw2" ${R}><feGaussianBlur stdDeviation="5"/></filter>
  <radialGradient id="dotg"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${ACC}"/><stop offset="1" stop-color="${ACC}" stop-opacity="0"/></radialGradient>
  <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/></marker>
  <marker id="ahw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>`;
  return el;
}
// Draw a path on with a moving point of light + glowing tail. Returns a cancel fn. Works for <path>, <line>, <polyline>, <circle>.
const running = new WeakMap();
export function drawOn(el, { dur = 1300, delay = 0, tail = 0.12, light = true, done } = {}) {
  if (running.has(el)) running.get(el)();
  let L = 0; try { L = el.getTotalLength(); } catch (e) {}
  if (!L || reduced()) { el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; done && done(); return () => {}; }
  el.style.strokeDasharray = `${L} ${L}`; el.style.strokeDashoffset = L;
  const parent = el.parentNode; let tailEl = null, dot = null;
  if (light) {
    tailEl = el.cloneNode(); tailEl.removeAttribute("id"); tailEl.removeAttribute("marker-end"); tailEl.removeAttribute("marker-start"); tailEl.setAttribute("stroke", "#cfe0ff"); tailEl.setAttribute("filter", "url(#gw)");
    tailEl.setAttribute("stroke-width", (parseFloat(el.getAttribute("stroke-width")) || 1.5) * 1.6); tailEl.style.opacity = 1; tailEl.setAttribute("fill", "none"); parent.appendChild(tailEl);
    dot = s("circle", { r: 7, fill: "url(#dotg)" }, parent);
  }
  let raf, t0 = null, stopped = false;
  const tl = Math.max(8, L * tail);
  const step = (ts) => { if (stopped) return; if (!el.isConnected) { cancel(); return; } /* scene was redrawn: drop the stale draw-on */ if (t0 == null) t0 = ts + delay; const k = clamp((ts - t0) / dur, 0, 1), p = ease(k), d = L * p;
    el.style.strokeDashoffset = L - d;
    if (light) { const seg = Math.min(tl, d); tailEl.style.strokeDasharray = `0 ${d - seg} ${seg} ${L + 10}`; tailEl.style.strokeDashoffset = 0; const pt = el.getPointAtLength(d); dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y); const o = Math.sin(Math.PI * p) ** 0.4; dot.style.opacity = o; tailEl.style.opacity = o; }
    if (k < 1) raf = requestAnimationFrame(step); else finish(); };
  const finish = () => { tailEl && tailEl.remove(); dot && dot.remove(); el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; running.delete(el); done && done(); };
  raf = requestAnimationFrame(step);
  const cancel = () => { stopped = true; cancelAnimationFrame(raf); tailEl && tailEl.remove(); dot && dot.remove(); el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; running.delete(el); };
  running.set(el, cancel); return cancel;
}
// Highlight one group in an SVG scene: everything else drops to faint wireframe; the chosen element is redrawn in the accent.
export function isolate(groups, key, { draw = true } = {}) {
  for (const [k, g] of Object.entries(groups)) { const on = k === key; g.classList.toggle("hl", on); g.style.opacity = key && !on ? 0.55 : 1;
    g.querySelectorAll("[data-ink]").forEach((p) => { p.setAttribute("stroke", on ? ACC : p.dataset.ink); if (p.dataset.fillink) p.setAttribute("fill", on ? ACC : p.dataset.fillink); p.setAttribute("filter", on ? "url(#gw)" : ""); });
    if (on && draw) g.querySelectorAll("[data-ink]").forEach((p, i) => drawOn(p, { dur: 1100, delay: i * 60, light: i < 3 })); }
}
// tween helper (rAF, eased). Uses GSAP when present for the ease curve.
export function tween(from, to, dur, onUpdate, done) {
  if (reduced()) { onUpdate(to, 1); done && done(); return () => {}; }
  let raf, t0; const keys = Object.keys(to); const st = (ts) => { t0 ??= ts; const k = clamp((ts - t0) / dur, 0, 1), e = ease(k); const v = {}; keys.forEach((kk) => (v[kk] = from[kk] + (to[kk] - from[kk]) * e)); onUpdate(v, k); if (k < 1) raf = requestAnimationFrame(st); else done && done(); };
  raf = requestAnimationFrame(st); return () => cancelAnimationFrame(raf);
}
export const fmt = { kt: (v) => `${Math.round(v)} kt`, deg: (v) => `${Math.round(v)}°`, ft: (v) => `${Math.round(v).toLocaleString()} ft`, lb: (v) => `${Math.round(v).toLocaleString()} lb` };
export const D2R = Math.PI / 180;

// Animation loop that only runs while the visual is on screen and motion is allowed.
// fn(now, dt) may return false to stop. Returns { start, stop }.
export function loop(F, fn, { always = false } = {}) {
  let raf = 0, vis = false, on = true, last = 0;
  const tick = (now) => { raf = 0; if (!on || !vis) return; const dt = last ? Math.min(64, now - last) : 16; last = now; if (fn(now, dt) === false) { on = false; return; } if (on && !raf) raf = requestAnimationFrame(tick); };   // never double-schedule if fn() called start()
  const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; last = 0; if (vis && on && !raf) raf = requestAnimationFrame(tick); });
  io.observe(F.stage);
  const api = { start() { if (!always && reduced()) { fn(performance.now(), 0); return; } on = true; if (vis && !raf) raf = requestAnimationFrame(tick); }, stop() { on = false; cancelAnimationFrame(raf); raf = 0; } };
  F.on(() => { api.stop(); io.disconnect(); });
  if (!always && reduced()) on = false;
  return api;
}
