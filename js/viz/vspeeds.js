// V-speeds on the C172S airspeed indicator. Tap a speed (or the dial) and only that arc or line lights up;
// speeds that are not painted on the dial get an accent tick. Every number is from the C172S POH (NAV III, 172SPHBUS),
// which matches the 1998 C172S Information Manual. Arc colors are the real instrument colors, muted (the color is the message).
import { frame, ACC, FAINT, FAINT2, svg, drawOn, tween } from "./base.js?v=783be66232";
import { s, h, esc, reduced } from "../core/util.js?v=783be66232";
const MIN = 30, MAX = 180, A0 = -150, A1 = 150;
const ang = (v) => A0 + ((Math.max(MIN, Math.min(MAX, v)) - MIN) / (MAX - MIN)) * (A1 - A0);
const COL = { white: "#F2F1EC", green: "#3FA66B", yellow: "#D9B23A", red: "#D9493E" };
const ARC = { white: { r: 300, from: 40, to: 85 }, green: { r: 332, from: 48, to: 129 }, yellow: { r: 332, from: 129, to: 163 } };
const SRC2 = "C172S POH Fig 2-1, 2-2 · 14 CFR 1.2 · PHAK Ch 8";
export const VS = {
  vs0: { sub: "S0", name: "Stall speed, landing configuration", v: 40, arc: "white", where: "White arc · bottom end",
    means: "The stall speed, or slowest steady flight, with full flaps and power at idle: the landing configuration.",
    why: "It is the floor under every approach speed. With no published approach speed, the AFH says fly not more than 1.3 V<sub>S0</sub>; the 172S POH publishes its own (60–70 KIAS with full flaps).",
    vary: "Marked for maximum weight, 2,550 lb. Lighter, it stalls slower; in a bank it stalls faster. The POH stall chart gives about 40 KIAS (48 KCAS) wings level, flaps FULL.", src: "C172S POH Fig 2-2; Sec 5 Stall Speeds · 14 CFR 1.2 · AFH Ch 9" },
  vs1: { sub: "S1", name: "Stall speed, flaps up", v: 48, arc: "green", where: "Green arc · bottom end",
    means: "The stall speed in a stated configuration. On the dial it is the clean airplane: flaps up, power at idle.",
    why: "Fly near it and you are close to the critical angle of attack. A wing stalls at an angle, not a speed, so a pull or a bank raises it.",
    vary: "Marked for maximum weight at the most forward CG. The POH stall chart gives about 48 KIAS (53 KCAS) wings level, flaps up.", src: "C172S POH Fig 2-2; Sec 5 Stall Speeds · 14 CFR 1.2 · PHAK Ch 8" },
  vfe: { sub: "FE", name: "Maximum flap extended speed", arc: "white", variants: { label: "Flaps", def: "full", opts: [["10", "10°", 110, "Not marked · above the white arc"], ["full", "10° to FULL", 85, "White arc · top end"]] },
    means: "The fastest you may fly with the flaps down. Extend them below it and keep them below it.",
    why: "Flaps are built for the gentle air loads of slow flight. Above V<sub>FE</sub> the air load on the flaps and their tracks can bend or damage them.",
    vary: "Depends on the flap setting: 110 KIAS with 10°, 85 KIAS from 10° to FULL. Only 85 is painted on the dial, as the top of the white arc.", src: SRC2 + ", 11" },
  vno: { sub: "NO", name: "Maximum structural cruising speed", v: 129, arc: "green", hi: "yellow", where: "Green arc top · yellow arc start",
    means: "The top of the normal operating range. Above it you are in the caution range.",
    why: "Up to V<sub>NO</sub> the structure is designed to take strong gusts. Faster, a gust can overstress it, so go above only in smooth air, and then with caution.",
    vary: "One number, any weight: 129 KIAS (126 KCAS).", src: SRC2 },
  yel: { label: "Yellow arc", name: "Caution range", v: [129, 163], arc: "yellow", where: "Yellow arc · 129 to 163",
    means: "Between V<sub>NO</sub> and V<sub>NE</sub>. Smooth air only, and then with caution.",
    why: "There is less margin against gust loads here. If you hit turbulence in the yellow arc, slow down.",
    vary: "", src: "C172S POH Fig 2-2 · PHAK Ch 8" },
  vne: { sub: "NE", name: "Never-exceed speed", v: 163, arc: "red", where: "Red line · 163",
    means: "The speed limit for every operation, including descents.",
    why: "Faster than V<sub>NE</sub>, structural damage or failure is possible. It is a hard limit, not a target.",
    vary: "One number: 163 KIAS (160 KCAS). The maximum window-open speed is also 163 KIAS.", src: SRC2 },
  vr: { sub: "R", name: "Rotation speed", v: 55, where: "Not on the dial",
    means: "The speed where you raise the nose wheel to lift off.",
    why: "It is the planned moment to change from rolling to flying. The 172S POH does not print a V<sub>R</sub>; its normal takeoff checklist says lift the nose wheel at 55 KIAS.",
    vary: "Short-field takeoff uses flaps 10° and 56 KIAS at 50 feet instead.", src: "C172S POH Sec 4 Normal Takeoff · 14 CFR 1.2 · AFH Ch 6" },
  vx: { sub: "X", name: "Best angle of climb", where: "Not on the dial", variants: { label: "Altitude", def: "sl", opts: [["sl", "Sea level", 62], ["10k", "10,000 ft", 67]] },
    means: "The speed that gives the most altitude in the shortest distance.",
    why: "Use it to clear an obstacle after takeoff, like trees past the end of a short runway. It is slower than V<sub>Y</sub>.",
    vary: "Flaps up. It rises with altitude: 62 KIAS at sea level, 67 KIAS at 10,000 ft.", src: "C172S POH Sec 4 Airspeeds for Normal Operation · PHAK Ch 8" },
  vy: { sub: "Y", name: "Best rate of climb", where: "Not on the dial", variants: { label: "Altitude", def: "sl", opts: [["sl", "Sea level", 74], ["10k", "10,000 ft", 72]] },
    means: "The speed that gives the most altitude in the least time.",
    why: "Use it to get away from the ground quickly once obstacles are clear. The POH's normal enroute climb is a little faster, 75–85 KIAS at sea level.",
    vary: "Flaps up. It falls with altitude: 74 KIAS at sea level, 72 KIAS at 10,000 ft.", src: "C172S POH Sec 4 Airspeeds for Normal Operation · PHAK Ch 8" },
  vg: { label: "Best glide", sub: "G", name: "Best glide (maximum glide)", v: 68, where: "Not on the dial",
    means: "With the engine out, the speed that carries you the farthest for the altitude you have.",
    why: "It gives you the most choices of where to land. Pitch for it first, then trim. Faster or slower, you come down short.",
    vary: "The POH glide chart is for flaps up, propeller windmilling and zero wind. V<sub>G</sub> is common shorthand; 14 CFR 1.2 does not list it.", src: "C172S POH Sec 3, Fig 3-1 · AFH Ch 3" },
  va: { sub: "A", name: "Design maneuvering speed", where: "Not on the dial", variants: { label: "Weight", def: "2550", opts: [["2550", "2,550 lb", 105], ["2200", "2,200 lb", 98], ["1900", "1,900 lb", 90]] },
    means: "At or below it, a full, abrupt control input stalls the wing before the load can exceed the airplane's limit load.",
    why: "A stall caps the load. A lighter airplane stalls at a lower speed, so it reaches its limit load at a lower speed too: V<sub>A</sub> goes down as weight goes down.",
    vary: "105 KIAS at 2,550 lb, 98 at 2,200 lb, 90 at 1,900 lb. Below V<sub>A</sub> you are still not protected from full inputs in more than one axis, or repeated full inputs.", src: "C172S POH Fig 2-1 · 14 CFR 1.2 · PHAK Ch 5, 8" },
};
const ON = ["vs0", "vs1", "vfe", "vno", "yel", "vne"], OFF = ["vr", "vx", "vy", "vg", "va"];
const symHtml = (k) => (VS[k].label ? esc(VS[k].label) : `V<sub>${VS[k].sub}</sub>`);
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "vspd", corners: { tl: "Airspeed indicator · C172S", tr: "POH Sec 2" } });
  F.explain(""); F.ctrl.remove();
  const dial = h("div", { class: "vs-dial" }); const panel = h("div", { class: "vs-panel" }); F.stage.append(dial, panel);
  const el = svg(dial, "-450 -450 900 900", { cls: "vs-svg" }); el.setAttribute("aria-label", "Airspeed indicator, 30 to 180 knots, with the 172S markings");
  const g = s("g", {}, el); const pt = (v, r) => { const a = (ang(v) * Math.PI) / 180; return [Math.sin(a) * r, -Math.cos(a) * r]; };
  s("circle", { r: 420, fill: "none", stroke: FAINT, "stroke-width": 2 }, g);
  for (let v = 30; v <= 180; v += 5) { const big = v % 20 === 0, mid = v % 10 === 0; const [x1, y1] = pt(v, 366), [x2, y2] = pt(v, big ? 400 : mid ? 390 : 380); s("line", { x1, y1, x2, y2, stroke: FAINT2, "stroke-width": big ? 3 : 2 }, g);
    if (big) { const [tx, ty] = pt(v, 262); const t = s("text", { x: tx, y: ty + 11, "text-anchor": "middle", fill: "rgba(242,241,236,.55)", "font-size": 32, "font-family": "Inter", "font-weight": 600 }, g); t.textContent = v; } }
  const arcD = (from, to, r) => { const [x1, y1] = pt(from, r), [x2, y2] = pt(to, r); return `M${x1},${y1} A${r},${r} 0 ${ang(to) - ang(from) > 180 ? 1 : 0} 1 ${x2},${y2}`; };
  const marks = {};
  for (const [k, a] of Object.entries(ARC)) marks[k] = s("path", { d: arcD(a.from, a.to, a.r), fill: "none", stroke: COL[k], "stroke-width": 16, "stroke-linecap": "butt" }, g);
  { const [x1, y1] = pt(163, 290), [x2, y2] = pt(163, 400); marks.red = s("line", { x1, y1, x2, y2, stroke: COL.red, "stroke-width": 8 }, g); }
  const kn = s("text", { x: 0, y: -118, "text-anchor": "middle", fill: "rgba(242,241,236,.45)", "font-size": 22, "font-family": "IBM Plex Mono", "letter-spacing": 4 }, g); kn.textContent = "KNOTS";
  const tick = s("line", { stroke: ACC, "stroke-width": 7, "stroke-linecap": "round", filter: "url(#gw)", opacity: 0 }, g);
  const needle = s("g", { opacity: 0.9 }, g); s("path", { d: "M-7,40 L-4,-340 L0,-352 L4,-340 L7,40 Z", fill: "#F2F1EC" }, needle); s("circle", { r: 18, fill: "#F2F1EC" }, g); s("circle", { r: 6, fill: "#0A0A0B" }, g);
  const val = s("text", { x: 0, y: 178, "text-anchor": "middle", fill: "#F2F1EC", "font-size": 88, "font-family": "Inter", "font-weight": 800 }, g);
  const unit = s("text", { x: 0, y: 226, "text-anchor": "middle", fill: "rgba(242,241,236,.55)", "font-size": 22, "font-family": "IBM Plex Mono", "letter-spacing": 4 }, g);
  let cur = 30, stopTw = () => {};
  const setNeedle = (v) => { stopTw(); const from = cur; cur = v; stopTw = tween({ v: from }, { v }, 700, (o) => needle.setAttribute("transform", `rotate(${ang(o.v)})`)); };
  needle.setAttribute("transform", `rotate(${ang(30)})`);
  // panel: chip groups, then the detail card
  const groups = h("div", { class: "vs-groups" }); panel.append(groups); const btn = {};
  const grp = (label, keys) => { const w = h("div", { class: "vs-grp" }); w.append(h("span", { class: "label" }, label)); const c = h("div", { class: "chips", role: "group", "aria-label": label }); keys.forEach((k) => { const b = h("button", { class: "chip vs-chip", type: "button", "aria-pressed": "false" }); b.innerHTML = symHtml(k); b.onclick = () => pick(k === cur_k ? null : k); btn[k] = b; c.append(b); }); w.append(c); groups.append(w); };
  grp("On the dial", ON); grp("Not on the dial", OFF);
  const card = h("div", { class: "vs-card", "aria-live": "polite" }); panel.append(card);
  let cur_k = null; const varSel = {};
  function paint(focusArc, hiArc, any) { for (const [k, m] of Object.entries(marks)) { const on = k === focusArc || k === hiArc; m.style.opacity = !focusArc && !hiArc ? (any ? 0.2 : 0.42) : on ? 1 : 0.12; m.setAttribute("stroke-width", k === "red" ? (on ? 12 : 8) : on ? 24 : 16); } }
  function showTick(v) { if (v == null) { tick.setAttribute("opacity", 0); return; } const [x1, y1] = pt(v, 280), [x2, y2] = pt(v, 412); Object.entries({ x1, y1, x2, y2 }).forEach(([a, b]) => tick.setAttribute(a, b)); tick.setAttribute("opacity", 1); drawOn(tick, { dur: 600, light: false }); }
  function pick(k) {
    cur_k = k; Object.entries(btn).forEach(([kk, b]) => { b.classList.toggle("on", kk === k); b.setAttribute("aria-pressed", kk === k); });
    if (!k) { paint(null); showTick(null); setNeedle(30); val.textContent = ""; unit.textContent = "";
      card.innerHTML = `<span class="label">Tap a speed</span><p class="vs-lead">Colored arcs and the red line are painted on the dial. The rest are only in the POH, so you carry them in your head.</p><p class="src">C172S POH Sec 2, Sec 4</p>`; return; }
    const d = VS[k]; let v = d.v, where = d.where, vh = "";
    if (d.variants) { const sel = varSel[k] || d.variants.def; const o = d.variants.opts.find((x) => x[0] === sel); v = o[2]; if (o[3]) where = o[3];
      vh = `<div class="vs-var"><span class="label">${esc(d.variants.label)}</span><div class="chips" role="group" aria-label="${esc(d.variants.label)}">${d.variants.opts.map((x) => `<button type="button" class="chip${x[0] === sel ? " on" : ""}" aria-pressed="${x[0] === sel}" data-var="${esc(x[0])}">${esc(x[1])}</button>`).join("")}</div></div>`; }
    const range = Array.isArray(v); const arcOn = d.arc && !(k === "vfe" && v === 110) ? d.arc : null;
    paint(arcOn, d.hi, true); showTick(range ? null : v); setNeedle(range ? (v[0] + v[1]) / 2 : v);
    val.textContent = range ? `${v[0]}–${v[1]}` : v; val.setAttribute("font-size", range ? 64 : 88); unit.textContent = "KIAS";
    if (arcOn && marks[arcOn].tagName === "path") drawOn(marks[arcOn], { dur: 800, light: false });
    card.innerHTML = `<span class="label">${esc(where)}</span><div class="vs-head"><span class="vs-sym">${symHtml(k)}</span><span class="vs-val">${range ? `${v[0]}–${v[1]}` : v}<small>KIAS</small></span></div><div class="vs-name">${esc(d.name)}</div>${vh}
      <dl class="vs-dl"><dt>Means</dt><dd>${d.means}</dd><dt>Why</dt><dd>${d.why}</dd>${d.vary ? `<dt>Varies</dt><dd>${d.vary}</dd>` : ""}</dl><p class="src">${esc(d.src)}</p>`;
    card.querySelectorAll("[data-var]").forEach((b) => (b.onclick = () => { varSel[k] = b.dataset.var; pick(k); }));
  }
  // tap the dial itself: the nearest marked speed in that band
  el.addEventListener("click", (e) => { const r = el.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 900 - 450, y = ((e.clientY - r.top) / r.height) * 900 - 450; const rad = Math.hypot(x, y); if (rad < 270 || rad > 430) return;
    const a = (Math.atan2(x, -y) * 180) / Math.PI; if (a < A0 - 4 || a > A1 + 4) return; const v = MIN + ((a - A0) / (A1 - A0)) * (MAX - MIN);
    let k = null; if (Math.abs(v - 163) < 5) k = "vne"; else if (v > 129) k = "yel"; else if (rad < 316 && v >= 36 && v <= 89) k = v < 62 ? "vs0" : "vfe"; else if (v >= 44) k = v < 88 ? "vs1" : "vno";
    if (k) { if (k === "vfe") varSel.vfe = "full"; pick(k); } });
  pick(opts.focus || null);
  return { destroy() { stopTw(); F.destroy(); } };
}
