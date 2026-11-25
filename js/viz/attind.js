// Attitude indicator (PHAK 8; FAA-H-8083-15B Instrument Flying Handbook ch 4–6). drawAI() is shared with other visuals.
// Modes: "ai" (GL13) pitch and bank sliders with the bank scale read out; "unusual" (FL11) nose-high and nose-low unusual
// attitudes with the recovery steps in order. Sky blue and ground brown are kept: the color is the information. Static scene.
import { slider, chips, row } from "./base.js?v=eb00616c11";
import { pxScene, T, L, C, P, ACC, INK, GRAY } from "./kit.js?v=eb00616c11";
const D = Math.PI / 180;
let uid = 0;
export function drawAI(g, cx, cy, r, pitch, bank) {
  const id = `ai${++uid}`, NS = "http://www.w3.org/2000/svg";
  const cp = document.createElementNS(NS, "clipPath"); cp.id = id; const cc = document.createElementNS(NS, "circle"); cc.setAttribute("cx", cx); cc.setAttribute("cy", cy); cc.setAttribute("r", r * 0.86); cp.append(cc); g.append(cp);
  const inner = document.createElementNS(NS, "g"); inner.setAttribute("clip-path", `url(#${id})`); g.append(inner);
  const rg = document.createElementNS(NS, "g"); rg.setAttribute("transform", `rotate(${-bank} ${cx} ${cy})`); inner.append(rg);
  const pp = r * 0.035, hy = cy + pitch * pp;   // pixels per degree of pitch
  P(rg, `M${cx - 3 * r},${hy - 3 * r} H${cx + 3 * r} V${hy} H${cx - 3 * r} Z`, { fill: "#2f5f8f", stroke: "none" });
  P(rg, `M${cx - 3 * r},${hy} H${cx + 3 * r} V${hy + 3 * r} H${cx - 3 * r} Z`, { fill: "#6b4a2b", stroke: "none" });
  L(rg, cx - 3 * r, hy, cx + 3 * r, hy, { stroke: "#fff", w: 2 });
  for (const p of [-20, -10, 10, 20]) { const y = hy - p * pp, w = r * (Math.abs(p) === 10 ? 0.22 : 0.34); L(rg, cx - w, y, cx + w, y, { stroke: "#fff", w: 1.4 }); }
  C(g, cx, cy, r * 0.86, { stroke: INK, sw: 2 });
  // bank scale (fixed) and pointer (rotates with the horizon)
  for (const b of [-60, -30, -20, -10, 0, 10, 20, 30, 60]) { const a = (-90 + b) * D, r1 = r * 0.88, r2 = r * (Math.abs(b) % 30 === 0 ? 1.0 : 0.95); L(g, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, { stroke: INK, w: b === 0 ? 3 : 1.6 }); }
  const pa = (-90 - bank) * D, pr = r * 0.8; P(g, `M${cx + Math.cos(pa) * pr},${cy + Math.sin(pa) * pr} l${Math.cos(pa + 2.6) * 9},${Math.sin(pa + 2.6) * 9} l${Math.cos(pa - 2.6) * 9 - Math.cos(pa + 2.6) * 9},${Math.sin(pa - 2.6) * 9 - Math.sin(pa + 2.6) * 9} Z`, { fill: "#fff", stroke: "none" });
  // miniature airplane, fixed to the case
  P(g, `M${cx - r * 0.5},${cy} H${cx - r * 0.16} L${cx - r * 0.08},${cy + r * 0.08} M${cx + r * 0.5},${cy} H${cx + r * 0.16} L${cx + r * 0.08},${cy + r * 0.08}`, { stroke: "#FBBF24", w: 3.2 });
  C(g, cx, cy, 3, { fill: "#FBBF24" });
}
const UN = {
  high: { n: "Nose high", p: 15, b: 30, steps: ["Add power", "Lower the nose to the horizon", "Level the wings", "Back to your heading and altitude"], why: "The airspeed is falling. Power and a lower nose head off a stall; level the wings once the nose is coming down." },
  low: { n: "Nose low", p: -15, b: 40, steps: ["Reduce power", "Level the wings", "Raise the nose to the horizon", "Back to your heading and altitude"], why: "The airspeed is building fast. Level the wings first: pulling while banked only tightens a spiral and loads the airframe." },
};
export function mount(host, opts = {}) {
  const mode = opts.mode || "ai"; let pitch = 0, bank = 0, un = "high";
  const S = pxScene(host, { cls: "attind", corners: { tl: mode === "ai" ? "Attitude indicator" : "Unusual attitude", tr: mode === "ai" ? "PHAK 8" : "FAA-H-8083-15B" } }, draw);
  if (mode === "ai") { slider(row(S.F.ctrl), { label: "Bank", min: -60, max: 60, step: 5, value: 0, fmt: (v) => (v ? `${Math.abs(v)}° ${v > 0 ? "right" : "left"}` : "level"), oninput: (v) => { bank = +v; S.redraw(); } });
    slider(row(S.F.ctrl), { label: "Pitch", min: -15, max: 15, step: 5, value: 0, fmt: (v) => (v ? `${Math.abs(v)}° ${v > 0 ? "up" : "down"}` : "level"), oninput: (v) => { pitch = +v; S.redraw(); } }); }
  else chips(row(S.F.ctrl), [["high", "Nose high"], ["low", "Nose low"]], un, (v) => { un = v || un; S.redraw(); }, { label: "Attitude" });
  function draw(g, W, H, top) {
    const ph = W < 520, avail = H - top - 12, r = Math.min(avail * 0.48, ph ? W * 0.36 : W * 0.2);
    const cx = mode === "ai" || ph ? W / 2 : W * 0.3, cy = top + avail / 2 + 4;
    if (mode === "ai") { drawAI(g, cx, cy, r, pitch, bank);
      S.F.caption(bank === 0 && pitch === 0 ? "Wings level, nose on the horizon" : `Pointer on the ${Math.abs(bank)}° mark · ${pitch ? Math.abs(pitch) + "° nose " + (pitch > 0 ? "up" : "down") : "level pitch"}`, bank ? `${Math.abs(bank)}° bank ${bank > 0 ? "right" : "left"}` : pitch ? `${Math.abs(pitch)}° ${pitch > 0 ? "climb" : "descent"} attitude` : "Straight and level");
      S.F.explain(`The miniature airplane is fixed to the case; the horizon card behind it is held level by a gyro. Bank marks sit at 10°, 20°, 30° and 60°; the pitch lines are 10° apart here. Read bank from the pointer at the top, not by guessing the horizon's tilt. The AI is the one instrument that shows pitch and bank directly, so it's the center of your scan. <span class="src">PHAK 8 · FAA-H-8083-15B</span>`); return; }
    const u = UN[un]; drawAI(g, cx, cy, r, u.p, u.b);
    if (!ph) u.steps.forEach((s, i) => { const y = top + 24 + i * 30; C(g, W * 0.56, y - 4, 10, { fill: "#0a0a0a", stroke: i === 0 ? ACC : INK, sw: 1.6 }); T(g, W * 0.56, y, String(i + 1), { size: 11, weight: 700, anchor: "middle" }); T(g, W * 0.56 + 18, y, s, { size: 12, fill: i === 0 ? INK : GRAY }); });
    S.F.caption(`${u.n} and banked · first: ${u.steps[0].toLowerCase()}`, u.n);
    S.F.explain(`${ph ? `<ol class="fp-steps">${u.steps.map((s) => `<li>${s}</li>`).join("")}</ol>` : ""}${u.why} Use the attitude indicator, but cross-check it: if it disagrees with the airspeed, altimeter and turn coordinator, it may have failed. <span class="src">FAA-H-8083-15B ch 5 · FAA-S-ACS-6C PA.VIII.E</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
