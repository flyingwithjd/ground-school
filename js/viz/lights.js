// Airport lighting (AIM 2-1; PHAK Ch 14). Beacon, runway and taxiway lights, PAPI (fly the slider), 2-bar VASI, and
// pilot-controlled lighting (key the mic). Light colors are real because the color is the message.
import { frame, chips, slider, svg, loop, readout, FAINT, FAINT2, INK, ACC } from "./base.js?v=2481aa7edd";
import { s, h, reduced } from "../core/util.js?v=2481aa7edd";
import { T } from "./shapes.js?v=2481aa7edd";
const C = { w: "#FFF7E0", g: "#39D98A", r: "#FF4D4D", y: "#FFC93C", b: "#4D8DFF" };
const dot = (p, x, y, c, r = 7, op = 1) => s("circle", { cx: x, cy: y, r, fill: C[c] || c, opacity: op }, p);
export function mount(host, opts = {}) {
  const F = frame(host, { corners: { tl: "Airport lighting · night view", tr: "AIM 2-1 · PHAK Ch 14" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el); const extra = h("div", { class: "lt-extra" }); F.ctrl.after(extra);
  let mode = opts.mode || "papi", anim = null, sub = null; const clean = () => { anim && anim.stop(); anim = null; extra.innerHTML = ""; sub && sub.el.remove(); sub = null; g.innerHTML = ""; };
  const MODES = {
    beacon() { const types = { land: ["w", "g"], water: ["w", "y"], heli: ["g", "y", "w"], mil: ["w2", "g"] };
      let ty = "land"; s("path", { d: "M800,720 L780,420 L820,420 Z M760,420 L840,420", stroke: FAINT2, "stroke-width": 2, fill: "none" }, g); s("line", { x1: 400, y1: 720, x2: 1200, y2: 720, stroke: FAINT, "stroke-width": 1.5 }, g);
      const lamp = s("circle", { cx: 800, cy: 395, r: 26, fill: C.w }, g), halo = s("circle", { cx: 800, cy: 395, r: 90, fill: C.w, opacity: 0.12, filter: "url(#gw2)" }, g);
      const set = (c, o) => { const col = C[c.replace("2", "")]; lamp.setAttribute("fill", col); halo.setAttribute("fill", col); lamp.setAttribute("opacity", o); halo.setAttribute("opacity", o * 0.25); };
      const info = { land: ["Lighted land airport", "White and green"], water: ["Lighted water airport", "White and yellow"], heli: ["Lighted heliport", "Green, yellow, white"], mil: ["Military airport", "Two quick whites, then green"] };
      const show = () => { F.caption(info[ty][0], info[ty][1]); F.explain(`Airport beacons flash 24 to 30 times per minute (heliports 30 to 45). Military beacons put two quick white flashes between the green ones. In Class B, C, D or E surface areas, a beacon running in daylight often means visibility under 3 miles and/or ceiling under 1,000 ft, but don't rely on it: check the weather. <span class="src">AIM 2-1-9</span>`); };
      sub = chips(F.ctrl, [["land", "Land"], ["water", "Water"], ["heli", "Heliport"], ["mil", "Military"]], ty, (v) => { ty = v; t0 = 0; show(); }, { label: "Beacon type" });
      let t0 = 0; // 27 flashes/min ≈ 2.2 s per flash; military: dual-peaked white
      anim = loop(F, (now) => { t0 ||= now; const seq = types[ty], per = ty === "heli" ? 1600 : 2200, t = (now - t0) % (per * seq.length), i = Math.floor(t / per), ph = (t % per) / per;
        const c = seq[i]; let o = Math.max(0, 1 - Math.abs(ph - 0.2) / 0.16); if (c === "w2") o = Math.max(0, 1 - Math.abs(ph - 0.12) / 0.05, 1 - Math.abs(ph - 0.28) / 0.05); set(c, 0.08 + o * 0.92); });
      if (reduced()) set("w", 1); anim.start(); show(); },
    runway() { const X0 = 160, X1 = 1500, Yt = 300, Yb = 520; let inst = true;
      const draw = () => { g.innerHTML = ""; s("rect", { x: X0, y: Yt, width: X1 - X0, height: Yb - Yt, fill: "none", stroke: FAINT, "stroke-width": 1 }, g);
        const caut = X1 - Math.min(2000 * 0.24, (X1 - X0) / 2);
        for (let x = X0 + 40; x < X1 - 10; x += 60) for (const y of [Yt - 12, Yb + 12]) dot(g, x, y, inst && x > caut ? "y" : "w", 6);
        for (let y = Yt + 10; y <= Yb - 10; y += 30) { dot(g, X0 - 14, y, "g", 6); dot(g, X1 + 14, y, "r", 6); }
        const r1 = dot(g, X0 - 14, Yt - 40, "w", 10), r2 = dot(g, X0 - 14, Yb + 40, "w", 10);
        T(g, X0 - 14, Yt - 70, "REIL", { anchor: "middle", size: 14, op: 0.6 }); T(g, X0 + 30, Yb + 70, "threshold: green toward you", { size: 14, op: 0.6 }); T(g, X1 - 10, Yb + 70, "far end: red toward the runway", { anchor: "end", size: 14, op: 0.6 });
        if (inst) T(g, (caut + X1) / 2, Yt - 40, "yellow: caution zone", { anchor: "middle", size: 14, op: 0.6 });
        T(g, 60, 420, "→", { size: 40, op: 0.5 });
        anim && anim.stop(); anim = loop(F, (now) => { const o = (now % 1000) < 90 ? 1 : 0.06; r1.setAttribute("opacity", o); r2.setAttribute("opacity", o); }); anim.start();
        F.caption("Runway lights", inst ? "Instrument runway" : "Visual runway");
        F.explain(`Edge lights (HIRL, MIRL or LIRL) are white${inst ? "; on an instrument runway, yellow replaces white on the last 2,000 ft or half the runway, whichever is less, as a caution zone" : ""}. End lights show green outward to landing aircraft and red toward the runway to departing ones. REILs are a synchronized flashing pair at the threshold for quick identification. <span class="src">AIM 2-1-3, 2-1-4</span>`); };
      sub = chips(F.ctrl, [["1", "Instrument runway"], ["0", "Visual runway"]], "1", (v) => { inst = v === "1"; draw(); }, { label: "Runway" }); draw(); },
    taxi() { const TX = 800; s("rect", { x: 40, y: 120, width: 1520, height: 150, fill: "none", stroke: FAINT, "stroke-width": 1 }, g); T(g, 60, 108, "runway", { size: 14, op: 0.45 });
      for (let y = 300; y < 740; y += 50) { dot(g, TX - 70, y, "b", 6); dot(g, TX + 70, y, "b", 6); } for (let y = 400; y < 740; y += 40) dot(g, TX, y, "g", 5);
      const bar = []; for (let x = TX - 56; x <= TX + 56; x += 16) bar.push(dot(g, x, 330, "r", 5)); const gl = [dot(g, TX - 100, 330, "y", 9), dot(g, TX + 100, 330, "y", 9)];
      T(g, TX - 120, 336, "runway guard lights", { anchor: "end", size: 14, op: 0.6 }); T(g, TX + 120, 336, "stop bar (when lit)", { size: 14, op: 0.6 }); T(g, TX + 90, 560, "blue edges", { size: 14, op: 0.6 }); T(g, TX - 90, 520, "green centerline", { anchor: "end", size: 14, op: 0.6 });
      anim = loop(F, (now) => { const a = Math.floor(now / 500) % 2; gl[0].setAttribute("opacity", a ? 1 : 0.1); gl[1].setAttribute("opacity", a ? 0.1 : 1); }); anim.start();
      F.caption("Taxiway lights", "Blue edges, green center"); F.explain("Taxiway edge lights are blue; centerline lights are steady green. Runway guard lights flash yellow at the holding position to make a runway intersection conspicuous. A lit red stop bar across the taxiway: <b>never cross it</b>, even with a clearance. <span class=\"src\">AIM 2-1-10</span>"); },
    papi() { const GX = 1250, GY = 640; s("line", { x1: 120, y1: GY, x2: 1540, y2: GY, stroke: FAINT2, "stroke-width": 2 }, g); s("rect", { x: GX - 20, y: GY - 6, width: 300, height: 6, fill: INK, opacity: 0.5 }, g);
      const ref = s("line", { x1: GX, y1: GY, x2: GX - 1100, y2: GY - 1100 * Math.tan(3 * Math.PI / 180), stroke: FAINT, "stroke-width": 1.5, "stroke-dasharray": "6 8" }, g); T(g, 200, GY - 1000 * Math.tan(3 * Math.PI / 180) + 28, "3° glidepath", { size: 14, op: 0.45 });
      const path = s("line", { x1: GX, y1: GY, x2: 260, y2: GY, stroke: ACC, "stroke-width": 3, filter: "url(#gw)" }, g); const pl = s("path", { d: "M-24,0 L24,0 M-6,-14 L-2,0 M8,0 L-2,-2", stroke: INK, "stroke-width": 3, fill: "none" }, g);
      const box = s("rect", { x: 980, y: 90, width: 440, height: 120, rx: 14, fill: "none", stroke: FAINT, "stroke-width": 1.5 }, g); T(g, 1200, 240, "PAPI · what you see", { anchor: "middle", size: 14, op: 0.5 });
      const L = [0, 1, 2, 3].map((i) => dot(g, 1050 + i * 100, 150, "w", 24)); const thr = [2.5, 2.83, 3.17, 3.5]; // outer (left) to inner (nearest runway)
      const ro = readout(F.ctrl, [["a", "glidepath"], ["s", "lights"]]);
      const set = (a) => { const x = 300, y = GY - (GX - x) * Math.tan(a * Math.PI / 180); path.setAttribute("x2", x); path.setAttribute("y2", y); pl.setAttribute("transform", `translate(${x} ${y}) rotate(${a})`);
        const wh = thr.map((t) => a > t); L.forEach((c, i) => c.setAttribute("fill", wh[i] ? C.w : C.r)); const nW = wh.filter(Boolean).length;
        const name = ["Low", "Slightly low", "On glidepath", "Slightly high", "High"][nW]; ro("a", a.toFixed(1) + "°"); ro("s", `${nW} white · ${4 - nW} red`);
        F.caption("PAPI", name); F.explain(`Four lights in a row, normally on the left side. Two white and two red is on a typical 3° glidepath; three white is slightly high (3.2°), four white is high (more than 3.5°); three red is slightly low (2.8°), four red is low (less than 2.5°). Start descending on it only once you are aligned with the runway. Safe obstacle clearance is within ±10° of the centerline out to 3.4 NM. <span class="src">PHAK Fig 14-30; AIM 2-1-2</span>`); };
      sub = slider(F.ctrl, { label: "Your glidepath", min: 2, max: 4.2, step: 0.05, value: 3, fmt: (v) => v.toFixed(2) + "°", oninput: set }); set(3); },
    vasi() { const X = 800; T(g, X, 120, "far bar", { anchor: "middle", size: 14, op: 0.5 }); T(g, X, 420, "near bar", { anchor: "middle", size: 14, op: 0.5 });
      const far = [0, 1].map((i) => dot(g, X - 60 + i * 120, 220, "r", 30)), near = [0, 1].map((i) => dot(g, X - 60 + i * 120, 520, "w", 30));
      const ST = { below: ["r", "r", "Below glidepath", "Both bars red: you are low."], on: ["r", "w", "On glidepath", "Far bar red over near bar white. \"Red over white, you're all right.\""], above: ["w", "w", "Above glidepath", "Both bars white: you are high."] };
      const set = (k) => { far.forEach((c) => c.setAttribute("fill", C[ST[k][0]])); near.forEach((c) => c.setAttribute("fill", C[ST[k][1]])); F.caption("2-bar VASI", ST[k][2]);
        F.explain(`${ST[k][3]} Each unit projects white in the upper part of its beam and red in the lower part. A 2-bar VASI gives one glidepath, normally 3°, with obstacle clearance within ±10° of the centerline to 4 NM. <span class="src">AIM 2-1-2; PHAK Fig 14-29</span>`); };
      sub = chips(F.ctrl, [["below", "Low"], ["on", "On"], ["above", "High"]], "on", set, { label: "Position" }); set("on"); },
    pcl() { const X0 = 200, X1 = 1400, Yt = 360, Yb = 520; const lights = []; for (let x = X0; x <= X1; x += 60) for (const y of [Yt, Yb]) lights.push(dot(g, x, y, "w", 6, 0.06));
      s("rect", { x: X0, y: Yt, width: X1 - X0, height: Yb - Yt, fill: "none", stroke: FAINT, "stroke-width": 1 }, g); const tm = T(g, 800, 640, "lights off", { anchor: "middle", size: 18, op: 0.6 });
      const mic = h("button", { class: "chip on mic", type: "button" }, "Key the mic"); extra.append(mic); const cnt = h("span", { class: "hint" }, " 0 clicks"); extra.append(cnt);
      let clicks = [], timer = 0; const lvl = { 7: [1, "High intensity"], 5: [0.6, "Medium intensity"], 3: [0.32, "Low intensity"] };
      mic.addEventListener("click", () => { const t = performance.now(); clicks = clicks.filter((c) => t - c < 5000); clicks.push(t); cnt.textContent = ` ${clicks.length} click${clicks.length > 1 ? "s" : ""} in 5 s`;
        clearTimeout(timer); timer = setTimeout(() => { const n = clicks.length >= 7 ? 7 : clicks.length >= 5 ? 5 : clicks.length >= 3 ? 3 : 0; clicks = [];
          if (!n) { F.caption("Pilot-controlled lighting", "Nothing happened"); cnt.textContent = " try 7, 5 or 3 clicks"; return; }
          lights.forEach((l) => l.setAttribute("opacity", lvl[n][0])); tm.textContent = "on for 15 min from this activation"; F.caption(`${n} clicks`, lvl[n][1]); }, 1600); });
      F.on(() => clearTimeout(timer));
      F.caption("Pilot-controlled lighting", "Key 7 times first"); F.explain("On the published frequency (in the Chart Supplement; often the CTAF), key the mic 7 times within 5 seconds for the highest intensity, then 5 for medium or 3 for low if you want. Lights stay on for 15 minutes from the most recent activation, so key again when you arrive even if they are already on. <span class=\"src\">AIM 2-1-8</span>"); },
  };
  chips(F.ctrl, [["papi", "PAPI"], ["vasi", "VASI"], ["runway", "Runway"], ["taxi", "Taxiway"], ["beacon", "Beacon"], ["pcl", "Pilot-controlled"]], mode, (v) => { mode = v; clean(); F.ctrl.querySelectorAll(".readout").forEach((r) => r.remove()); MODES[v](); }, { label: "Lighting" });
  MODES[mode]();
  return { destroy: () => F.destroy() };
}
