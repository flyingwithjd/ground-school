// Side-view trim tab explainer (nose to the left, like the PHAK trim tab figure).
// The wheel moves only the tab. In flight the chain plays out in order, each link lagging the one before:
// tab deflects -> air pushes on the tab -> elevator swings the opposite way -> tail force changes -> airplane pitches.
import { h, s, clamp, reduced } from "../core/util.js?v=074f6ea36d";
const ACC = "#3B82F6", INK = "#F2F1EC", FAINT = "rgba(242,241,236,.22)";
const Y0 = 160, HX = 160, EL = 95, TL = 38;      // chord line, elevator hinge x, elevator and tab lengths (viewBox units)
const TAB_MAX = 36, ELEV_MAX = 20, PITCH_MAX = 12; // exaggerated for clarity
const R = Math.PI / 180;
export function trimExplainer(parent) {
  const root = h("div", { class: "trimx" });
  const head = h("div", { class: "trimx-head" }); const big = h("span", { class: "trimx-big" }); head.append(big);
  const sv = s("svg", { viewBox: "0 0 320 280", class: "trimx-svg", role: "img", "aria-label": "Side view of the horizontal tail: stabilizer, elevator and trim tab, with airflow" });
  const chain = h("p", { class: "trimx-chain", "aria-live": "polite" });
  root.append(head, sv, chain); parent.append(root);
  const uid = Math.random().toString(36).slice(2, 7);
  const defs = s("defs", {}, sv);
  defs.innerHTML = `<marker id="txw${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker>
  <marker id="txa${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/></marker>`;
  const T = (x, y, txt, a = {}) => { const e = s("text", { x, y, fill: "rgba(242,241,236,.55)", "font-size": 13, "font-family": "IBM Plex Mono, monospace", "letter-spacing": ".08em", ...a }, sv); e.textContent = txt; return e; };
  // --- airplane inset (top band) ---
  s("line", { x1: 60, x2: 300, y1: 40, y2: 40, stroke: FAINT, "stroke-dasharray": "3 5" }, sv);
  const noseArc = s("path", { fill: "none", stroke: INK, "stroke-width": 2, "marker-end": `url(#txw${uid})`, opacity: 0 }, sv);   // nose arrow
  const plane = s("g", { transform: "translate(180 40)" }, sv);
  s("path", { d: "M-58,1 C-58,-5 -50,-8 -36,-9 L-14,-12 L6,-12 L52,-4 L60,-20 L67,-20 L66,-2 L60,3 L-36,8 C-50,8 -58,6 -58,1 Z", fill: "rgba(242,241,236,.10)", stroke: INK, "stroke-width": 1.4, "stroke-linejoin": "round" }, plane);
  s("line", { x1: -20, x2: 12, y1: -12, y2: -12, stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, plane);   // high wing
  s("line", { x1: 52, x2: 72, y1: -1, y2: -1, stroke: ACC, "stroke-width": 2.4, "stroke-linecap": "round" }, plane);   // horizontal tail
  const tailArrowS = s("line", { stroke: ACC, "stroke-width": 2, "marker-end": `url(#txa${uid})`, opacity: 0 }, plane);
  s("line", { x1: 0, x2: 320, y1: 76, y2: 76, stroke: "rgba(242,241,236,.10)" }, sv);
  // --- tail band ---
  const airLbl = T(312, 96, "AIRFLOW →", { "text-anchor": "end" });
  const flows = [[-22, 1], [-42, 0.55], [22, 1], [42, 0.55]].map(([d, w]) => ({ d, w, el: s("path", { class: "trimx-flow", fill: "none", stroke: "rgba(242,241,236,.5)", "stroke-width": 1.2, "stroke-dasharray": "6 6", opacity: 0 }, sv) }));
  // neutral ghost of the elevator and tab, so the swing is obvious
  const ghost = s("path", { d: `M${HX},155 L${HX + EL},159 L${HX + EL + TL},160 L${HX + EL},161 L${HX},165 Z`, fill: "none", stroke: "rgba(242,241,236,.35)", "stroke-dasharray": "3 3", opacity: 0 }, sv);
  s("path", { d: `M30,${Y0} C30,151 46,151 70,151 L${HX - 3},155 L${HX - 3},165 L70,169 C46,169 30,169 30,${Y0} Z`, fill: "rgba(242,241,236,.08)", stroke: "rgba(242,241,236,.55)", "stroke-width": 1.2 }, sv);
  const elevG = s("g", {}, sv);
  s("path", { d: `M${HX},155 L${HX + EL},158.5 L${HX + EL},161.5 L${HX},165 Z`, fill: "rgba(242,241,236,.22)", stroke: INK, "stroke-width": 1.3, "stroke-linejoin": "round" }, elevG);
  const tabG = s("g", {}, elevG);
  s("path", { d: `M${HX + EL},158 L${HX + EL + TL},159.3 L${HX + EL + TL},160.7 L${HX + EL},162 Z`, fill: ACC, stroke: ACC, "stroke-width": 1.4, "stroke-linejoin": "round" }, tabG);
  s("circle", { cx: HX + EL, cy: Y0, r: 2.2, fill: "#0A0A0B", stroke: ACC, "stroke-width": 1.2 }, elevG);
  s("circle", { cx: HX, cy: Y0, r: 3, fill: "#0A0A0B", stroke: INK, "stroke-width": 1.3 }, sv);
  const arc = s("path", { fill: "none", stroke: "rgba(242,241,236,.8)", "stroke-width": 1.6, "marker-end": `url(#txw${uid})`, opacity: 0 }, sv);
  const tabF = s("line", { stroke: INK, "stroke-width": 2.4, "marker-end": `url(#txw${uid})`, opacity: 0 }, sv);
  const tailF = s("line", { stroke: ACC, "stroke-width": 3, "marker-end": `url(#txa${uid})`, opacity: 0 }, sv);
  s("line", { x1: HX, x2: HX, y1: 214, y2: 236, stroke: "rgba(242,241,236,.2)" }, sv);
  T(HX, 252, "HINGE", { "text-anchor": "middle", "font-size": 14 }); T(232, 272, "ELEVATOR", { "text-anchor": "middle", "font-size": 14 }); T(312, 272, "TAB", { "text-anchor": "end", "font-size": 14, fill: ACC });
  // --- state: each value chases its target; the chain order gives the staging ---
  let trim = 0, air = "flight", raf = 0, last = 0, chainKey = "";
  const v = { tab: 0, push: 0, elev: 0, lift: 0, pitch: 0, flow: 0 };
  const tau = { tab: 120, push: 320, elev: 450, lift: 320, pitch: 500, flow: 260 };
  const targets = () => { const fl = air === "flight"; const tg = { tab: trim * TAB_MAX, flow: fl ? 1 : 0 };
    tg.push = fl ? v.tab / TAB_MAX : 0;            // tab down (+) -> air pushes it up; strength follows the tab
    tg.elev = fl ? -v.push * ELEV_MAX : 0;         // elevator swings opposite the tab (+ = trailing edge down)
    tg.lift = fl ? v.elev / ELEV_MAX : 0;          // elevator down (+) -> more upward tail force
    tg.pitch = fl ? -v.lift * PITCH_MAX : 0;       // tail up -> nose down (- = nose down)
    return tg; };
  const camber = (x) => { const e = v.elev * R, a = (v.elev + v.tab) * R, tx = HX + EL * Math.cos(e), ty = Y0 + EL * Math.sin(e);
    if (x <= HX) return Y0; if (x <= tx) return Y0 + (x - HX) * Math.tan(e);
    const ex = tx + TL * Math.cos(a), ey = ty + TL * Math.sin(a); if (x <= ex) return ty + (x - tx) * Math.tan(a);
    return ey + (x - ex) * Math.tan(a) * Math.exp(-(x - ex) / 22); };
  const flowPath = (d, w) => { const pts = []; for (let x = -4; x <= 326; x += 6) pts.push([x, camber(x)]);
    const sm = pts.map((p, i) => { let acc = 0, n = 0; for (let k = -3; k <= 3; k++) { const q = pts[i + k]; if (q) { const wt = 4 - Math.abs(k); acc += q[1] * wt; n += wt; } } return [p[0], Y0 + (acc / n - Y0) * w + d]; });
    return "M" + sm.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L"); };
  const render = () => {
    elevG.setAttribute("transform", `rotate(${v.elev.toFixed(2)} ${HX} ${Y0})`); tabG.setAttribute("transform", `rotate(${v.tab.toFixed(2)} ${HX + EL} ${Y0})`);
    flows.forEach((f) => { f.el.setAttribute("d", flowPath(f.d, f.w)); f.el.setAttribute("opacity", (0.85 * v.flow).toFixed(3)); });
    airLbl.textContent = air === "ground" ? "NO AIRFLOW" : "AIRFLOW →";
    ghost.setAttribute("opacity", Math.abs(v.elev) > 1 ? 0.9 : 0);
    // air force on the tab: drawn from outside the tab onto its face
    const e = v.elev * R, a = (v.elev + v.tab) * R, tx = HX + EL * Math.cos(e), ty = Y0 + EL * Math.sin(e);
    const mx = tx + (TL / 2) * Math.cos(a), my = ty + (TL / 2) * Math.sin(a), ux = Math.sin(a), uy = -Math.cos(a);   // upper-surface normal
    const p = v.push, sg = p > 0 ? -1 : 1, L = 8 + 30 * Math.abs(p);   // push up (+): arrow comes from below
    tabF.setAttribute("x1", (mx + ux * sg * (L + 5)).toFixed(1)); tabF.setAttribute("y1", (my + uy * sg * (L + 5)).toFixed(1)); tabF.setAttribute("x2", (mx + ux * sg * 5).toFixed(1)); tabF.setAttribute("y2", (my + uy * sg * 5).toFixed(1));
    tabF.setAttribute("opacity", clamp(Math.abs(p) * 2.2, 0, 1).toFixed(3));
    // swing arc around the hinge, from neutral to where the elevator is now
    const rr = 62, ae = v.elev * R; arc.setAttribute("d", `M${HX + rr},${Y0} A${rr},${rr} 0 0 ${v.elev > 0 ? 1 : 0} ${(HX + rr * Math.cos(ae)).toFixed(1)},${(Y0 + rr * Math.sin(ae)).toFixed(1)}`);
    arc.setAttribute("opacity", Math.abs(v.elev) > 2.5 ? clamp((Math.abs(v.elev) - 2.5) / 5, 0, 1).toFixed(3) : 0);
    // tail force: up when the elevator is down
    const px = HX + 52 * Math.cos(e), py = Y0 + 52 * Math.sin(e), lf = v.lift, dir = lf > 0 ? -1 : 1, LL = 10 + 42 * Math.abs(lf);
    tailF.setAttribute("x1", px.toFixed(1)); tailF.setAttribute("x2", px.toFixed(1)); tailF.setAttribute("y1", (py + dir * 8).toFixed(1)); tailF.setAttribute("y2", (py + dir * (8 + LL)).toFixed(1));
    tailF.setAttribute("opacity", clamp(Math.abs(lf) * 2.2, 0, 1).toFixed(3));
    tailArrowS.setAttribute("x1", 62); tailArrowS.setAttribute("x2", 62); tailArrowS.setAttribute("y1", dir * 4); tailArrowS.setAttribute("y2", dir * (6 + 16 * Math.abs(lf)));
    tailArrowS.setAttribute("opacity", clamp(Math.abs(lf) * 2.2, 0, 1).toFixed(3));
    plane.setAttribute("transform", `translate(180 40) rotate(${v.pitch.toFixed(2)})`);   // nose on the left: a positive (clockwise) rotate lifts it
    // light the chain links as each stage arrives (the inset's words switch with the last link)
    const prog = [Math.abs(v.tab) / TAB_MAX, Math.abs(v.push), Math.abs(v.elev) / ELEV_MAX, Math.abs(v.lift), Math.abs(v.pitch) / PITCH_MAX], k = Math.abs(trim) || 1;
    chain.querySelectorAll("[data-i]").forEach((el) => { const i = +el.dataset.i; el.classList.toggle("on", air === "ground" ? true : prog[i] / k > 0.55); });
    const pitched = air === "flight" && trim !== 0 && prog[4] / k > 0.55 && Math.sign(-v.pitch) === Math.sign(trim) * -1;
    // nose arrow: a short curved arrow just ahead of the nose, showing which way it is going
    const pr = v.pitch * R, nx = 180 - 62 * Math.cos(pr), ny = 40 - 62 * Math.sin(pr), sd = v.pitch < 0 ? 1 : -1;
    noseArc.setAttribute("d", `M${(nx - 6).toFixed(1)},${(ny - sd * 4).toFixed(1)} Q${(nx - 15).toFixed(1)},${(ny + sd * 4).toFixed(1)} ${(nx - 10).toFixed(1)},${(ny + sd * 15).toFixed(1)}`);
    noseArc.setAttribute("opacity", pitched ? 1 : 0); noseArc.style.transition = reduced() ? "" : "opacity 300ms";
  };
  const setChain = () => { const key = air + Math.sign(trim); if (key === chainKey) return; chainKey = key;
    const seg = (i, t) => `<span data-i="${i}">${t}</span>`, ar = '<span class="ar" aria-hidden="true">→</span>';
    if (!trim) { chain.innerHTML = "Roll the wheel up for nose down, down for nose up."; big.textContent = "Trim neutral"; return; }
    const up = trim < 0;   // tab trailing edge up = nose-down trim
    big.textContent = up ? "Nose-down trim" : "Nose-up trim";
    chain.innerHTML = air === "ground" ? [seg(0, `Tab ${up ? "up" : "down"}`), seg(1, "no air, elevator stays put")].join(` ${ar} `)
      : [seg(0, `Tab ${up ? "up" : "down"}`), seg(1, `air pushes ${up ? "down" : "up"}`), seg(2, `elevator ${up ? "down" : "up"}`), seg(4, `nose ${up ? "down" : "up"}`)].join(` ${ar} `); };
  const step = (now) => { const dt = Math.min(64, now - (last || now)); last = now; let busy = false;
    const tg = targets(); for (const k in v) { const d = tg[k] - v[k]; if (Math.abs(d) < 0.002 * (k === "tab" || k === "elev" || k === "pitch" ? 10 : 1)) v[k] = tg[k]; else { v[k] += d * Math.min(1, dt / tau[k]); busy = true; } }
    render(); if (busy) raf = requestAnimationFrame(step); else { raf = 0; last = 0; } };
  const settle = () => { for (let i = 0; i < 6; i++) Object.assign(v, targets()); render(); };
  const go = () => { setChain(); if (reduced()) return settle(); if (!raf) { last = 0; raf = requestAnimationFrame(step); } };
  render(); setChain();
  return { el: root, set(t, a) { trim = t; air = a; go(); }, destroy() { cancelAnimationFrame(raf); root.remove(); } };
}
