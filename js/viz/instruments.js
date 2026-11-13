// The six basic flight instruments grouped by power source. Fail a source and see what you lose.
import { frame, chips, svg, ACC, FAINT, FAINT2 } from "./base.js?v=da5a58a7ab";
import { s } from "../core/util.js?v=da5a58a7ab";
const INST = [
  { k: "asi", name: "Airspeed", src: "ps", t: "Pitot and static pressure. Compares ram pressure with static pressure." },
  { k: "ai", name: "Attitude", src: "vac", t: "Vacuum gyro, rigidity in space. Shows pitch and bank against an artificial horizon." },
  { k: "alt", name: "Altimeter", src: "ps", t: "Static pressure. Aneroid wafers expand as pressure drops. Set the local altimeter setting." },
  { k: "tc", name: "Turn coordinator", src: "elec", t: "Electric gyro. Shows rate of roll and turn; the ball shows coordination." },
  { k: "hi", name: "Heading", src: "vac", t: "Vacuum gyro. Drifts with precession: align it with the compass about every 15 minutes." },
  { k: "vsi", name: "Vertical speed", src: "ps", t: "Static pressure through a calibrated leak. Trend first, then rate after a few seconds of lag." },
];
const SRC = { ps: "Pitot-static", vac: "Vacuum", elec: "Electrical" };
export function mount(host) {
  const F = frame(host, { corners: { tl: "Six basic instruments", tr: "PHAK 8 · POH 7" } });
  const el = svg(F.stage, "0 0 1600 900"); const g = s("g", { transform: "translate(120 -10) scale(0.85)" }, el); const els = {};
  INST.forEach((I, i) => { const cx = 400 + (i % 3) * 400, cy = 260 + Math.floor(i / 3) * 330; const grp = s("g", { class: "tap", role: "button", tabindex: 0, "aria-label": I.name }, g);
    const c = s("circle", { cx, cy, r: 130, fill: "#0A0A0B", stroke: FAINT2, "stroke-width": 2 }, grp);
    // minimal face per instrument
    const f = s("g", { stroke: FAINT2, "stroke-width": 2, fill: "none" }, grp);
    if (I.k === "ai") { s("line", { x1: cx - 110, y1: cy, x2: cx + 110, y2: cy }, f); s("path", { d: `M${cx - 60},${cy + 10} L${cx - 20},${cy + 10} L${cx},${cy + 26} L${cx + 20},${cy + 10} L${cx + 60},${cy + 10}` }, f); }
    else if (I.k === "tc") { s("path", { d: `M${cx - 80},${cy} L${cx + 80},${cy} M${cx},${cy} L${cx},${cy - 20}` }, f); s("rect", { x: cx - 50, y: cy + 50, width: 100, height: 24, rx: 12 }, f); s("circle", { cx, cy: cy + 62, r: 9 }, f); }
    else if (I.k === "hi") { for (let a = 0; a < 360; a += 30) { const r = (a * Math.PI) / 180; s("line", { x1: cx + Math.sin(r) * 96, y1: cy - Math.cos(r) * 96, x2: cx + Math.sin(r) * 112, y2: cy - Math.cos(r) * 112 }, f); } s("path", { d: `M${cx},${cy - 50} L${cx},${cy + 40} M${cx - 34},${cy} L${cx + 34},${cy}` }, f); }
    else { for (let a = -140; a <= 140; a += 28) { const r = (a * Math.PI) / 180; s("line", { x1: cx + Math.sin(r) * 98, y1: cy - Math.cos(r) * 98, x2: cx + Math.sin(r) * 114, y2: cy - Math.cos(r) * 114 }, f); } s("line", { x1: cx, y1: cy, x2: cx + 60, y2: cy - 60 }, f); }
    const t = s("text", { x: cx, y: cy + 168, "text-anchor": "middle", fill: "rgba(242,241,236,.55)", "font-size": 20, "font-family": "IBM Plex Mono", "letter-spacing": 3 }, grp); t.textContent = I.name.toUpperCase();
    const x = s("path", { d: `M${cx - 70},${cy - 70} L${cx + 70},${cy + 70} M${cx + 70},${cy - 70} L${cx - 70},${cy + 70}`, stroke: "rgba(242,241,236,.5)", "stroke-width": 3, opacity: 0 }, grp);
    grp.addEventListener("click", () => pick(I.k)); grp.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && pick(I.k));
    els[I.k] = { c, f, x, grp }; });
  let fail = "none";
  function paint(focus) { INST.forEach((I) => { const E = els[I.k]; const dead = fail !== "none" && I.src === fail; const on = focus ? I.k === focus : fail === "none" ? false : false;
      E.c.setAttribute("stroke", on ? ACC : dead ? "rgba(242,241,236,.12)" : FAINT2); E.c.setAttribute("filter", on ? "url(#gw)" : ""); E.f.setAttribute("stroke", on ? ACC : FAINT2); E.f.setAttribute("opacity", dead ? 0.2 : 1); E.x.setAttribute("opacity", dead ? 1 : 0); }); }
  function pick(k) { const I = INST.find((x) => x.k === k); paint(k); F.caption(SRC[I.src], I.name); F.explain(I.t); }
  chips(F.ctrl, [["none", "All working"], ["vac", "Vacuum failure"], ["elec", "Electrical failure"], ["ps", "Static blocked"]], "none", (v) => { fail = v; paint(null);
    const msg = { none: ["Tap an instrument", "Three power sources", "The airplane spreads its instruments across three sources so one failure never takes everything."], vac: ["Vacuum failure", "Attitude and heading lost", "Cover the dead gyros and fly by the turn coordinator, altimeter, airspeed and compass. A vacuum failure is often slow, so cross-check."], elec: ["Electrical failure", "Turn coordinator lost", "Gyro-driven attitude and heading stay, as do the pitot-static instruments. Radios and lights go with the battery."], ps: ["Static blocked", "Altimeter and VSI frozen", "Airspeed is wrong too. Open the alternate static source."] }[v];
    F.caption(msg[0], msg[1]); F.explain(msg[2]); }, { label: "Failure" });
  paint(null); F.caption("Tap an instrument", "Three power sources"); F.explain("The airplane spreads its instruments across three sources so one failure never takes everything.");
  return { destroy() { F.destroy(); } };
}
