// The flight instruments in six-pack order plus tachometer and CDI, grouped the way PHAK Ch 3 groups them. Group chips light
// one group; situation chips change attitude or power: the control instruments (attitude, tachometer) move first and the
// performance instruments follow a moment later (PHAK 3 / AFH attitude flying). Readings are examples, not POH numbers.
// Faces are simplified from the PHAK Ch 8 figures and a round-gauge C172S panel.
// Airspeed markings reuse the V-speeds dial (C172S POH Fig 2-2); tachometer markings are C172S POH Fig 2-3 (sea-level green arc).
import { frame, chips, FAINT, FAINT2 } from "./base.js?v=716452685f";
import { s, h, reduced } from "../core/util.js?v=716452685f";
import { rich } from "../core/rich.js?v=716452685f";
const INK = "#F2F1EC", DIM = "rgba(242,241,236,.6)", FACE = "#111113";
const COL = { white: "#F2F1EC", green: "#3FA66B", yellow: "#D9B23A", red: "#D9493E", sky: "#2E4D6B", ground: "#634631" };
const P = (a, r) => { const t = (a * Math.PI) / 180; return [+(Math.sin(t) * r).toFixed(2), +(-Math.cos(t) * r).toFixed(2)]; };
const arc = (a0, a1, r) => { const [x1, y1] = P(a0, r), [x2, y2] = P(a1, r); return `M${x1},${y1} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x2},${y2}`; };
const txt = (g, x, y, t, o = {}) => { const e = s("text", { x, y, "text-anchor": "middle", "dominant-baseline": "central", fill: o.fill || DIM, "font-size": o.size || 14, "font-family": o.mono ? "IBM Plex Mono" : "Inter", "font-weight": o.w || 600, ...(o.attrs || {}) }, g); e.textContent = t; return e; };
const tick = (g, a, r1, r2, w = 1.6, col = FAINT2) => { const [x1, y1] = P(a, r1), [x2, y2] = P(a, r2); s("line", { x1, y1, x2, y2, stroke: col, "stroke-width": w }, g); };
function base(label) { const el = s("svg", { viewBox: "-100 -100 200 200", role: "img", "aria-label": label, class: "ip-svg" });
  s("circle", { r: 98, fill: "#0A0A0B", stroke: FAINT, "stroke-width": 1.5 }, el); s("circle", { r: 92, fill: FACE }, el); return el; }
const hub = (g) => { s("circle", { r: 6, fill: INK }, g); s("circle", { r: 2.2, fill: FACE }, g); };
// Numerals sit above the hands with a thin face-colored halo, so a hand pointing at a number never hides it.
const finish = (el) => { el.querySelectorAll(":scope > text").forEach((t) => { t.setAttribute("stroke", FACE); t.setAttribute("stroke-width", 3.2); t.setAttribute("paint-order", "stroke"); el.append(t); }); hub(el); return el; };
const needle = (g, a, len, w = 3.2) => { const n = s("g", { transform: `rotate(${a})` }, g); s("path", { d: `M${-w},14 L${-w * 0.7},${-len + 8} L0,${-len} L${w * 0.7},${-len + 8} L${w},14 Z`, fill: INK }, n); return n; };

// Airspeed: same geometry as the V-speeds dial (30–180 KIAS over ±150°)
const asA = (v) => -150 + ((v - 30) / 150) * 300;
function asi(v) { const el = base(`Airspeed indicator reading ${v} knots`);
  for (let k = 30; k <= 180; k += 5) tick(el, asA(k), k % 10 ? 86 : 82, 91, k % 20 === 0 ? 2 : 1.3);
  for (let k = 40; k <= 180; k += 20) { const [x, y] = P(asA(k), 56); txt(el, x, y, k, { size: 13 }); }
  s("path", { d: arc(asA(40), asA(85), 69), stroke: COL.white, "stroke-width": 5, fill: "none", opacity: 0.6 }, el);
  s("path", { d: arc(asA(48), asA(129), 76), stroke: COL.green, "stroke-width": 5, fill: "none", opacity: 0.6 }, el);
  s("path", { d: arc(asA(129), asA(163), 76), stroke: COL.yellow, "stroke-width": 5, fill: "none", opacity: 0.6 }, el);
  { const [x1, y1] = P(asA(163), 66), [x2, y2] = P(asA(163), 91); s("line", { x1, y1, x2, y2, stroke: COL.red, "stroke-width": 3, opacity: 0.75 }, el); }
  txt(el, 0, 34, "KNOTS", { size: 8, mono: true, w: 500, attrs: { "letter-spacing": 2 } });
  needle(el, asA(v), 84); return finish(el); }

// Altimeter: 0–9 around the dial; 100-ft (long), 1,000-ft (short, wide) and 10,000-ft (thin, triangle tip) hands
function alt(ft, setting) { const el = base(`Altimeter reading ${ft.toLocaleString("en-US")} feet, set to ${setting}`);
  for (let i = 0; i < 50; i++) tick(el, i * 7.2, i % 5 ? 84 : 78, 91, i % 5 ? 1.2 : 2);
  for (let i = 0; i < 10; i++) { const [x, y] = P(i * 36, 64); txt(el, x, y, i, { size: 16, fill: INK, w: 700 }); }
  s("rect", { x: 38, y: -7.5, width: 40, height: 15, rx: 2, fill: "#0A0A0B", stroke: FAINT, "stroke-width": 1 }, el);
  txt(el, 58, 0.5, setting, { size: 9, mono: true, w: 500, fill: INK });
  const g = s("g", { transform: `rotate(${(ft / 10000) * 36})` }, el); s("line", { x1: 0, y1: 10, x2: 0, y2: -80, stroke: INK, "stroke-width": 1.4 }, g); s("path", { d: "M-5,-80 L0,-90 L5,-80 Z", fill: INK }, g);
  const t = s("g", { transform: `rotate(${((ft % 10000) / 1000) * 36})` }, el); s("path", { d: "M-5,10 L-6,-34 L0,-46 L6,-34 L5,10 Z", fill: INK }, t);
  needle(el, ((ft % 1000) / 100) * 36, 82, 2.6); return finish(el); }

// Vertical speed: 0 at nine o'clock, up clockwise, down counterclockwise, ±2,000 fpm
const vsA = (fpm) => -90 + (fpm / 1000) * 85;
function vsi(fpm) { const el = base(`Vertical speed indicator reading ${fpm} feet per minute`);
  for (let f = -2000; f <= 2000; f += 100) tick(el, vsA(f), f % 500 ? 85 : 79, 91, f % 500 ? 1.2 : 2);
  for (const f of [500, 1000, 1500, 2000]) for (const sgn of [1, -1]) { const [x, y] = P(vsA(f * sgn), 64); txt(el, x, y, f / 100, { size: 14 }); }
  { const [x, y] = P(vsA(0), 64); txt(el, x, y, "0", { size: 14 }); }
  txt(el, -30, -32, "UP", { size: 9, mono: true, w: 500 }); txt(el, -30, 32, "DOWN", { size: 9, mono: true, w: 500 });
  txt(el, 30, 20, "100 FT", { size: 7.5, mono: true, w: 500 }); txt(el, 30, 30, "PER MIN", { size: 7.5, mono: true, w: 500 });
  needle(el, vsA(fpm), 82); return finish(el); }

// Compass card shared by the heading indicator and the course selector
const CARD = { 0: "N", 30: "3", 60: "6", 90: "E", 120: "12", 150: "15", 180: "S", 210: "21", 240: "24", 270: "W", 300: "30", 330: "33" };
function card(el, hdg, rT, rL, size) { const g = s("g", { transform: `rotate(${-hdg})` }, el);
  for (let a = 0; a < 360; a += 5) tick(g, a, a % 10 ? rT - 5 : rT - 9, rT, a % 30 === 0 ? 2 : 1.2);
  for (const [a, t] of Object.entries(CARD)) { const [x, y] = P(+a, rL); txt(g, x, y, t, { size, fill: /[NESW]/.test(t) ? INK : DIM, w: 700, attrs: { transform: `rotate(${a} ${x} ${y})` } }); }
  return g; }
function hi(hdg) { const el = base(`Heading indicator reading ${hdg} degrees`); card(el, hdg, 90, 68, 15);
  for (const a of [45, 135, 225, 315]) { const [x, y] = P(a, 93); s("circle", { cx: x, cy: y, r: 2, fill: FAINT2 }, el); }
  s("path", { d: "M0,-74 L-5,-86 L5,-86 Z", fill: INK }, el); // lubber line
  s("path", { d: "M0,-30 L0,26 M-24,-2 L24,-2 M-10,22 L10,22", stroke: INK, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, el); return el; }

// Turn coordinator: miniature airplane (wings level), level and standard-rate index marks, inclinometer ball
function tc() { const el = base("Turn coordinator, wings level, ball centered");
  for (const sgn of [-1, 1]) { tick(el, 90 * sgn, 70, 88, 3, INK); tick(el, (90 + 20) * sgn, 70, 88, 3, INK); }
  txt(el, -50, 44, "L", { size: 14, fill: INK, w: 700 }); txt(el, 50, 44, "R", { size: 14, fill: INK, w: 700 });
  s("path", { d: "M-62,0 L62,0", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, el); s("circle", { r: 9, fill: INK }, el); s("path", { d: "M0,-8 L0,-20", stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, el);
  s("path", { d: "M-38,52 Q0,70 38,52", stroke: "#2A2A2D", "stroke-width": 15, "stroke-linecap": "round", fill: "none" }, el);
  s("line", { x1: -9, y1: 54, x2: -9, y2: 70, stroke: FAINT2, "stroke-width": 1.4 }, el); s("line", { x1: 9, y1: 54, x2: 9, y2: 70, stroke: FAINT2, "stroke-width": 1.4 }, el);
  s("circle", { cx: 0, cy: 61, r: 6.2, fill: INK }, el);
  txt(el, 0, 82, "2 MIN", { size: 8, mono: true, w: 500 }); return el; }

// Attitude indicator: muted sky and ground, pitch lines every 5°, bank marks 10, 20, 30, 60, 90 on the case
function ai(pitch = 0) { const el = base(`Attitude indicator, wings level, pitch ${pitch > 0 ? pitch + " degrees up" : pitch < 0 ? -pitch + " degrees down" : "level"}`); const id = "aic" + Math.random().toString(36).slice(2, 7);
  s("clipPath", { id }, s("defs", {}, el)).append(s("circle", { r: 84 }));
  const m0 = s("g", { "clip-path": `url(#${id})` }, el), m = s("g", { transform: `translate(0 ${pitch * 3})` }, m0); s("rect", { x: -90, y: -140, width: 180, height: 140, fill: COL.sky }, m); s("rect", { x: -90, y: 0, width: 180, height: 140, fill: COL.ground }, m);
  s("line", { x1: -90, y1: 0, x2: 90, y2: 0, stroke: INK, "stroke-width": 1.6 }, m);
  for (const p of [5, 10, 15, 20]) for (const sgn of [-1, 1]) { const w = p % 10 ? 10 : 20; s("line", { x1: -w, y1: -sgn * p * 3, x2: w, y2: -sgn * p * 3, stroke: "rgba(242,241,236,.75)", "stroke-width": 1.3 }, m); }
  s("path", { d: "M0,-82 L-6,-70 L6,-70 Z", fill: INK }, m); // bank pointer on the moving card
  for (const b of [10, 20, 30, 60, 90]) for (const sgn of [-1, 1]) tick(el, b * sgn, 86, b % 30 ? 92 : 96, b % 30 ? 1.6 : 2.6, INK);
  s("path", { d: "M0,-86 L-5,-95 L5,-95 Z", fill: "none", stroke: INK, "stroke-width": 1.4 }, el);
  s("path", { d: "M-56,4 L-20,4 L-10,14 L0,4 L10,14 L20,4 L56,4", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round", "stroke-linecap": "round", fill: "none" }, el);
  s("circle", { cy: 4, r: 3.6, fill: INK }, el); return el; }

// Tachometer: RPM x 100, green arc 2,100–2,500 (sea level), red line 2,700 (POH Fig 2-3)
const tA = (rpm) => -135 + (rpm / 3500) * 270;
function tach(rpm) { const el = base(`Tachometer reading ${rpm} RPM`);
  for (let r = 0; r <= 3500; r += 100) tick(el, tA(r), r % 500 ? 85 : 79, 91, r % 500 ? 1.2 : 2);
  for (let r = 0; r <= 3500; r += 500) { const [x, y] = P(tA(r), 64); txt(el, x, y, r / 100, { size: 13 }); }
  s("path", { d: arc(tA(2100), tA(2500), 76), stroke: COL.green, "stroke-width": 5, fill: "none", opacity: 0.6 }, el);
  { const [x1, y1] = P(tA(2700), 70), [x2, y2] = P(tA(2700), 91); s("line", { x1, y1, x2, y2, stroke: COL.red, "stroke-width": 3, opacity: 0.75 }, el); }
  txt(el, 0, 36, "RPM", { size: 8, mono: true, w: 500, attrs: { "letter-spacing": 2 } }); txt(el, 0, 48, "×100", { size: 8, mono: true, w: 500 });
  needle(el, tA(rpm), 84); return finish(el); }

// Course deviation indicator (VOR): course card under the top index, needle centered, five dots each side, TO flag
function cdi(crs) { const el = base(`Course deviation indicator, course ${crs}, needle centered, TO`); card(el, crs, 91, 76, 11);
  s("path", { d: "M0,-62 L-5,-70 L5,-70 Z", fill: INK }, el);
  s("circle", { r: 58, fill: "#0A0A0B", stroke: FAINT, "stroke-width": 1 }, el);
  for (let i = 1; i <= 5; i++) for (const sgn of [-1, 1]) s("circle", { cx: sgn * i * 9.5, cy: 0, r: 2, fill: "none", stroke: DIM, "stroke-width": 1.2 }, el);
  s("circle", { r: 5, fill: "none", stroke: DIM, "stroke-width": 1.2 }, el);
  s("line", { x1: 0, y1: -52, x2: 0, y2: 52, stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, el);
  s("path", { d: "M26,-22 L19,-12 L33,-12 Z", fill: INK }, el); txt(el, 26, -32, "TO", { size: 8, mono: true, w: 500 });
  return el; }

// Situations: control instruments change first, performance instruments follow (example readings).
const SIT = {
  level: { cap: "Level cruise", ctl: { pitch: 0, rpm: 2300 }, perf: { kt: 100, ft: 4500, fpm: 0 }, t: "Level cruise: set the attitude and power, then the performance instruments settle and confirm it." },
  nose: { cap: "Raise the nose", ctl: { pitch: 5, rpm: 2300 }, perf: { kt: 85, ft: 4560, fpm: 500 }, t: "Nose up, same power: the attitude indicator shows it at once; then airspeed bleeds off, the VSI shows a climb and the altimeter starts to wind up." },
  power: { cap: "Add power, hold altitude", ctl: { pitch: -1, rpm: 2500 }, perf: { kt: 110, ft: 4500, fpm: 0 }, t: "More power on the tachometer, with the nose eased down a touch to stay level: the airspeed rises; altitude and VSI stay put." },
  less: { cap: "Less power, descend", ctl: { pitch: -3, rpm: 1900 }, perf: { kt: 100, ft: 4440, fpm: -500 }, t: "Power back and nose down a little to keep 100 knots: the VSI shows a descent and the altimeter unwinds, airspeed holds." },
};
const CELLS = [
  ["asi", "Airspeed", "perf", (v) => asi(v.kt), (v) => `${v.kt} KIAS`], ["ai", "Attitude", "ctl", (v) => ai(v.pitch), (v) => v.pitch ? `${Math.abs(v.pitch)}° ${v.pitch > 0 ? "up" : "down"}` : "Level"],
  ["alt", "Altimeter", "perf", (v) => alt(v.ft, "29.92"), (v) => `${v.ft.toLocaleString("en-US")} ft`], ["tc", "Turn coord.", "perf", () => tc(), () => "Wings level"],
  ["hi", "Heading", "perf", () => hi(120), () => "120°"], ["vsi", "Vert. speed", "perf", (v) => vsi(v.fpm), (v) => `${v.fpm > 0 ? "+" : ""}${v.fpm} fpm`],
  ["tach", "Tachometer", "ctl", (v) => tach(v.rpm), (v) => `${v.rpm.toLocaleString("en-US")} RPM`], ["cdi", "VOR / CDI", "nav", () => cdi(120), () => "Course 120"],
];
const GNAME = { perf: ["Performance", "What the airplane is doing"], ctl: ["Control", "Attitude and power: set these"], nav: ["Navigation", "Where you are relative to a [[fix]]"] };
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "instp ipx capin", corners: { tl: "Round gauges", tr: "Example readings" } }); F.root.insertBefore(F.ctrl, F.stage);   // chips on top: nothing below can move them
  let grp = null, sit = "level", v = { ...SIT.level.ctl, ...SIT.level.perf }, tmr = 0;
  const grid = h("div", { class: "ip-grid" }); F.stage.append(grid); const cells = {};
  for (const [k, name, g] of CELLS) { const c = h("div", { class: "ip-cell", "data-g": g }); c.append(h("div", { class: "ip-face" }), h("div", { class: "ip-name" }, name), h("div", { class: "ip-read" }, "")); grid.append(c); cells[k] = c; }
  const paint = (keys) => { for (const [k, , , fn, rd] of CELLS) if (!keys || keys.includes(k)) { const c = cells[k]; c.querySelector(".ip-face").replaceChildren(fn(v)); c.querySelector(".ip-read").textContent = rd(v); if (keys) { c.classList.remove("chg"); void c.offsetWidth; c.classList.add("chg"); } } };
  const light = () => { for (const [k, , g] of CELLS) { cells[k].classList.toggle("on", grp === g); cells[k].classList.toggle("off", !!grp && grp !== g); }
    if (grp) F.explain(`<p><b>${GNAME[grp][0]}:</b> ${rich(GNAME[grp][1])}.</p>` + notes); else F.explain(`<p>${SIT[sit].t}</p>` + notes); };
  chips(F.ctrl, [["perf", "Performance"], ["ctl", "Control"], ["nav", "Navigation"]], null, (g) => { grp = g; light(); }, { label: "Instrument group", toggle: true });
  chips(F.ctrl, Object.entries(SIT).map(([k, o]) => [k, o.cap]), "level", (k) => { if (!k) return; sit = k; clearTimeout(tmr); const S = SIT[k];
    Object.assign(v, S.ctl); paint(["ai", "tach"]); F.caption("First: control instruments", S.cap);
    tmr = setTimeout(() => { Object.assign(v, S.perf); paint(["asi", "alt", "vsi"]); F.caption("Then: performance instruments follow", S.cap); }, reduced() ? 0 : 1100); grp = null; light(); }, { label: "Situation" });
  F.ctrl.append(h("p", { class: "ip-hint" }, "Pick a group to light it, or a situation to watch the gauges respond."));
  const notes = [].concat(opts.note || []).map((n) => `<p class="ip-note">${n}</p>`).join("");
  paint(); F.caption("Six-pack plus power and navigation", "Level cruise"); light();
  F.on(() => clearTimeout(tmr));
  return { destroy: () => F.destroy() };
}
