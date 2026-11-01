// Frontal cross-section (PHAK Ch 12). Pick a cold or warm front, then stand ahead of it, under it or behind it
// and read what the PHAK says to expect. The frontal surface is drawn on by the point of light.
import { frame, chips, svg, drawOn, ACC, FAINT, FAINT2, INK } from "./base.js?v=54b9a323a1";
import { s } from "../core/util.js?v=54b9a323a1";
import { T } from "./shapes.js?v=54b9a323a1";
const WX = {
  cold: { before: { cl: "Cirriform or towering cumulus; cumulonimbus may develop", pr: "Rain showers may develop", vi: "–", wi: "–", te: "High dew point", ps: "Falling" },
    at: { cl: "Towering cumulus or cumulonimbus", pr: "Heavy rain showers; possible lightning, thunder, hail", vi: "Poor", wi: "Variable and gusty", te: "Temperature and dew point drop rapidly", ps: "Bottoms out, then starts to rise" },
    after: { cl: "Clouds dissipate to cumulus", pr: "Decreasing", vi: "Good", wi: "West-northwest", te: "Cooler", ps: "Continues to rise" } },
  warm: { before: { cl: "Cirriform or stratiform; fog", pr: "Light to moderate rain, sleet, snow or drizzle", vi: "Poor", wi: "South-southeast", te: "Cool or cold; dew point rising", ps: "Falling" },
    at: { cl: "Stratiform", pr: "Drizzle may be falling", vi: "Poor, improving", wi: "Variable", te: "Rising steadily; dew point steady", ps: "Levels off" },
    after: { cl: "Stratocumulus; rain showers possible", pr: "Showers possible", vi: "Improves; haze may linger", wi: "South-southwest", te: "Warming; dew point rises, then levels off", ps: "Slight rise, then falls" } } };
const ROWS = [["cl", "Clouds"], ["pr", "Precipitation"], ["vi", "Visibility"], ["wi", "Wind"], ["te", "Temperature"], ["ps", "Pressure"]];
export function mount(host, opts = {}) {
  const k = (host.clientWidth || 800) < 600 ? 1.8 : 1, TT = (g, x, y, txt, o = {}) => T(g, x, y, txt, { ...o, size: (o.size || 13) * k });
  const F = frame(host, { cls: "capin", corners: { tl: "Front · generalized", tr: "PHAK Ch 12" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", {}, el);
  const GY = 760; s("line", { x1: 80, y1: GY, x2: 1520, y2: GY, stroke: FAINT2, "stroke-width": 2 }, g);
  const surf = s("path", { d: "", fill: "none", stroke: ACC, "stroke-width": 4, filter: "url(#gw)" }, g);
  const clouds = s("g", {}, g), labels = s("g", {}, g), me = s("g", {}, g), arrows = s("g", {}, g);
  s("line", { x1: 0, y1: 0, x2: 0, y2: -60, stroke: INK, "stroke-width": 3 }, me); s("circle", { cx: 0, cy: -72, r: 10, fill: "none", stroke: INK, "stroke-width": 3 }, me);
  const meT = TT(me, 0, 40, "YOU", { anchor: "middle", size: 14, op: 0.8 });
  const panel = document.createElement("div"); panel.className = "readout fr-ro"; F.ctrl.append(panel);
  let kind = opts.kind || "cold", pos = "before";
  const cloud = (x, y, w, hh, label) => { const c = s("path", { d: `M${x - w / 2},${y} Q${x - w / 2},${y - hh} ${x - w / 4},${y - hh * 0.8} Q${x},${y - hh * 1.3} ${x + w / 4},${y - hh * 0.8} Q${x + w / 2},${y - hh} ${x + w / 2},${y} Z`, fill: "none", stroke: FAINT2, "stroke-width": 2 }, clouds); if (label) TT(labels, x, y + 26, label, { anchor: "middle", size: 13, op: 0.55 }); return c; };
  function draw(anim) { clouds.innerHTML = ""; labels.innerHTML = ""; arrows.innerHTML = "";
    // the front moves left to right (west to east). Ahead = right of the surface position at the ground.
    const X0 = 760;
    if (kind === "cold") { surf.setAttribute("d", `M${X0},${GY} Q${X0 - 60},${GY - 200} ${X0 - 420},${GY - 330}`);
      TT(labels, 330, 735, "COLD AIR", { anchor: "middle", size: 22, op: 0.9 }); TT(labels, 1300, 200, "WARM AIR", { anchor: "middle", size: 22, op: 0.6 });
      const cb = s("path", { d: `M${X0 - 70},${GY - 60} L${X0 - 40},${GY - 420} L${X0 - 180},${GY - 470} L${X0 + 260},${GY - 470} L${X0 + 120},${GY - 420} L${X0 + 150},${GY - 60} Z`, fill: "none", stroke: INK, "stroke-width": 2.5 }, clouds);
      TT(labels, X0 + 40, GY - 490, "CUMULONIMBUS", { anchor: "middle", size: 14, op: 0.7 }); cloud(X0 + 420, GY - 330, 160, 70, "towering cumulus"); cloud(X0 - 380, GY - 250, 160, 50, "cumulus");
      s("path", { d: `M220,${GY - 90} L520,${GY - 90}`, stroke: FAINT2, "stroke-width": 3, "marker-end": "url(#ahw)" }, arrows); TT(arrows, 370, GY - 110, "cold air advances, wedging under", { anchor: "middle", size: 13, op: 0.6 });
      s("path", { d: `M${X0 + 150},${GY - 120} Q${X0 + 60},${GY - 220} ${X0 + 30},${GY - 380}`, stroke: FAINT2, "stroke-width": 3, "marker-end": "url(#ahw)", fill: "none" }, arrows);
      TT(labels, X0 - 330, GY - 410, "steep frontal surface", { anchor: "middle", size: 13, op: 0.55 });
      if (anim) drawOn(cb, { dur: 1600, delay: 700 });
    } else { surf.setAttribute("d", `M${X0},${GY} Q${X0 + 400},${GY - 120} ${X0 + 760},${GY - 360}`);
      TT(labels, 1250, 700, "COLD AIR", { anchor: "middle", size: 22, op: 0.6 }); TT(labels, 360, 420, "WARM AIR", { anchor: "middle", size: 22, op: 0.9 });
      const ns = s("path", { d: `M${X0 - 180},${GY - 70} L${X0 + 260},${GY - 70} L${X0 + 380},${GY - 150} L${X0 + 300},${GY - 230} L${X0 - 160},${GY - 230} Z`, fill: "none", stroke: INK, "stroke-width": 2.5 }, clouds);
      TT(labels, X0 + 60, GY - 150, "NIMBOSTRATUS", { anchor: "middle", size: 14, op: 0.7 });
      s("path", { d: `M${X0 + 280},${GY - 290} L${X0 + 560},${GY - 330}`, stroke: FAINT2, "stroke-width": 8, "stroke-linecap": "round" }, clouds); TT(labels, X0 + 420, GY - 345, "altostratus", { anchor: "middle", size: 13, op: 0.55 });
      s("path", { d: `M${X0 + 540},${GY - 430} L${X0 + 740},${GY - 470}`, stroke: FAINT2, "stroke-width": 4, "stroke-linecap": "round" }, clouds); TT(labels, X0 + 640, GY - 490, "cirrostratus", { anchor: "middle", size: 13, op: 0.55 });
      s("path", { d: `M${X0 + 690},${GY - 560} q30,-20 60,-10 m10,30 q30,-20 60,-10`, stroke: FAINT2, "stroke-width": 2, fill: "none" }, clouds); TT(labels, X0 + 760, GY - 600, "cirrus", { anchor: "middle", size: 13, op: 0.55 });
      s("path", { d: `M200,${GY - 300} L560,${GY - 380}`, stroke: FAINT2, "stroke-width": 3, "marker-end": "url(#ahw)" }, arrows); TT(arrows, 360, GY - 370, "warm air slides up and over", { anchor: "middle", size: 13, op: 0.6 });
      TT(labels, X0 + 520, GY - 60, "shallow frontal surface · clouds far ahead", { anchor: "middle", size: 13, op: 0.55 });
      if (anim) drawOn(ns, { dur: 1600, delay: 700 });
    }
    s("path", { d: `M${X0 - 40},${GY + 50} L${X0 + 140},${GY + 50}`, stroke: ACC, "stroke-width": 3, "marker-end": "url(#ah)" }, arrows); TT(arrows, X0 + 50, GY + 90, "front moves this way", { anchor: "middle", size: 13, op: 0.7 });
    const mx = pos === "before" ? (kind === "cold" ? 1250 : 1420) : pos === "at" ? X0 + 20 : 300; me.setAttribute("transform", `translate(${mx} ${GY})`);
    if (anim) drawOn(surf, { dur: 1500 });
    const W = WX[kind][pos]; panel.innerHTML = ROWS.filter(([k]) => W[k] !== "–").map(([k, l]) => `<div><b>${W[k]}</b><span>${l}</span></div>`).join("");
    F.caption(`${kind === "cold" ? "Cold" : "Warm"} front · ${pos === "before" ? "ahead of it" : pos === "at" ? "passing overhead" : "after it passes"}`, kind === "cold" ? "Fast, steep, narrow band of violent weather" : "Slow, shallow, wide band of steady weather");
    F.explain(kind === "cold" ? `Cold, dense air plows under the warm air and forces it up fast. Expect a narrow band of showers and thunderstorms right at the front. A fast-moving cold front can bring a squall line along or ahead of it. Behind it the sky clears, but winds are gusty and turbulent. <span class="src">PHAK Ch 12</span>` : `Warm air slides up over the cold air on a gentle slope, so clouds show up hundreds of miles ahead: cirrus, then cirrostratus, altostratus and nimbostratus. Expect low ceilings, poor visibility and steady precipitation over a wide area. In summer, thunderstorms can be embedded. <span class="src">PHAK Ch 12</span>`); }
  chips(F.ctrl, [["cold", "Cold front"], ["warm", "Warm front"]], kind, (v) => { kind = v; draw(true); }, { label: "Front" });
  chips(F.ctrl, [["before", "Ahead"], ["at", "Passing"], ["after", "Behind"]], pos, (v) => { pos = v; draw(false); }, { label: "Where you are" });
  F.ctrl.append(panel); draw(true);
  return { destroy: () => F.destroy() };
}
