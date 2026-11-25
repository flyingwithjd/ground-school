// Airspace as it looks on a sectional chart (FAA Aeronautical Chart User's Guide; AIM 3-2; PHAK 15). A made-up chart:
// Class B (solid blue shelves), Class C (solid magenta), Class D (dashed blue), Class E surface area (dashed magenta)
// with a magenta vignette (Class E from 700 ft AGL), and Class G underneath. Chart colors are kept because the color is
// the information; the class you pick is drawn bold and the others fade. Picking a class also preselects it in the 3D
// wedding cake on the overview page. Static scene: draws only on change.
import { chips, row } from "./base.js?v=4e8c88b40f";
import { pxScene, T, L, C, P, hit, INK, GRAY } from "./kit.js?v=4e8c88b40f";
const MAG = "#D946EF", BLU = "#60A5FA";
const IT = {
  B: ["Class B", "Solid blue: shelves 100/SFC, 100/30, 100/60", `<strong>Solid blue lines</strong> outline each Class B shelf. The numbers are ceiling over floor in hundreds of feet MSL: <strong>100/SFC</strong> is surface to 10,000 ft, <strong>100/30</strong> is 3,000 to 10,000 ft. Under a shelf you're outside it. You need an ATC clearance to enter, and student pilots need an endorsement. The thin magenta circle is the <strong>30 NM Mode C veil</strong>: inside it, a transponder with altitude reporting and ADS-B Out are required.`, "AIM 3-2-3 · 14 CFR 91.131, 91.215"],
  C: ["Class C", "Solid magenta: 40/SFC core, 40/12 shelf", `<strong>Solid magenta lines</strong> mark Class C. The inner core, <strong>40/SFC</strong>, runs from the surface to 4,000 ft MSL; the outer shelf, <strong>40/12</strong>, from 1,200 to 4,000 ft MSL. Establish two-way radio communication with approach before you enter: they must say your call sign back. A transponder with altitude reporting and ADS-B Out are required in it and above it.`, "AIM 3-2-4 · 14 CFR 91.130"],
  D: ["Class D", "Dashed blue: [25] ceiling 2,500 ft MSL", `A <strong>dashed blue line</strong> marks Class D around a towered airport. The boxed number is its ceiling in hundreds of feet MSL: <strong>[25]</strong> is surface to 2,500 ft MSL. Establish two-way radio communication with the tower before you enter. When the tower closes, the airspace usually becomes Class E or G: check the Chart Supplement.`, "AIM 3-2-5 · 14 CFR 91.129"],
  E: ["Class E", "Dashed magenta: surface · shading: 700 AGL", `A <strong>dashed magenta line</strong> is a Class E surface area: Class E starts at the ground. Inside the <strong>magenta vignette</strong> (the shaded band, fading inward), Class E starts at <strong>700 ft AGL</strong>. Where nothing is shaded, Class E usually starts at <strong>1,200 ft AGL</strong>. A blue vignette, mostly in the West, marks where the floor jumps from 1,200 ft AGL to 14,500 ft MSL. Class E needs no ATC contact for VFR.`, "AIM 3-2-6 · Chart User's Guide"],
  G: ["Class G", "No line: whatever lies under Class E", `<strong>Class G has no line</strong>. It's the airspace under the Class E floor: up to <strong>700 ft AGL</strong> inside the magenta shading, up to <strong>1,200 ft AGL</strong> elsewhere, and up to 14,500 ft MSL beyond a blue vignette. No ATC contact is needed, and the VFR weather minimums are lowest here, especially close to the ground.`, "AIM 3-3 · 14 CFR 91.155"],
};
export function mount(host) {
  let sel = "B"; try { sessionStorage.setItem("air.sel", sel); } catch (e) {}
  const S = pxScene(host, { cls: "achart", corners: { tl: "Airspace on a sectional (made up)", tr: "Chart User's Guide" } }, draw);
  const ch = chips(row(S.F.ctrl), ["B", "C", "D", "E", "G"].map((k) => [k, "Class " + k]), sel, (v) => set(v || sel), { label: "Airspace class" });
  function set(v) { sel = v; ch.set(v); try { sessionStorage.setItem("air.sel", v); } catch (e) {} S.redraw(); }
  function draw(g, W, H, top) {
    const ph = W < 520, k = Math.min((W - 8) / 100, (H - top - 6) / 58), ox = W / 2 - 50 * k, oy = top + 2;
    const m = (x, y) => [ox + x * k, oy + y * k];
    const op = (key) => (sel === key ? 1 : 0.35), bw = (key, w) => (sel === key ? w * 1.9 : w);
    const halo = (e) => { e.setAttribute("stroke", "#000"); e.setAttribute("stroke-width", "4"); e.setAttribute("paint-order", "stroke"); e.setAttribute("stroke-linejoin", "round"); return e; };
    const lab = (x, y, s, col, key, o = {}) => { const [a, b] = m(x, y); const e = halo(T(g, a, b, s, { size: 11, weight: 600, anchor: "middle", fill: sel === key ? INK : col, ...o })); e.setAttribute("opacity", sel === key ? 1 : 0.55); return e; };
    const frac = (x, y, c, f, col, key) => { lab(x, y - 1.2, c, col, key); const [a, b] = m(x, y); L(g, a - 9, b, a + 9, b, { stroke: sel === key ? INK : col, w: 1.2, op: sel === key ? 1 : 0.55 }); lab(x, y + 4.2, f, col, key); };
    const apt = (x, y, col, key) => { const [a, b] = m(x, y); C(g, a, b, 6, { stroke: col, sw: 2, op: op(key) }); L(g, a - 3.5, b + 3.5, a + 3.5, b - 3.5, { stroke: col, w: 2.2, op: op(key) }); };
    const ring = (x, y, r, col, key, o = {}) => { const [a, b] = m(x, y); return C(g, a, b, r * k, { stroke: col, sw: bw(key, o.w || 1.5), dash: o.dash, op: op(key) }); };
    // Mode C veil (30 NM around the Class B primary airport): only its arc on the map
    ring(26, 30, 27, MAG, "B", { w: 0.8 }); lab(26 + 27 * 0.74, 30 - 27 * 0.62, ph ? "MODE C" : "MODE C 30 NM", MAG, "B", { anchor: "start", dy: -2 });
    // Class B: three shelves
    for (const r of [7, 13, 19]) ring(26, 30, r, BLU, "B");
    apt(26, 30, BLU, "B");
    const ang = (-140 * Math.PI) / 180;
    [[4.2, "100", "SFC"], [10, "100", "30"], [16, "100", "60"]].forEach(([r, c, f]) => frac(26 + Math.cos(ang) * r, 30 + Math.sin(ang) * r, c, f, BLU, "B"));
    lab(26, 30 + 19 + 4.5, "METRO (Class B)", BLU, "B");
    // Class C
    ring(72, 20, 6, MAG, "C"); ring(72, 20, 12, MAG, "C"); apt(72, 20, MAG, "C");
    const a2 = (-40 * Math.PI) / 180; frac(72 + Math.cos(a2) * 3.9 + 0.6, 20 + Math.sin(a2) * 3.9 - 0.4, "40", "SFC", MAG, "C"); frac(72 + Math.cos(a2) * 9.2, 20 + Math.sin(a2) * 9.2, "40", "12", MAG, "C");
    lab(72, 20 + 12 + 4.5, "BAYPORT (C)", MAG, "C");
    // Class D
    ring(89, 46, 5.5, BLU, "D", { dash: "7 5" }); apt(89, 46, BLU, "D");
    { const [a, b] = m(89, 46 - 5.5); const e = halo(T(g, a, b + 4, "[25]", { size: 12, weight: 700, anchor: "middle", fill: sel === "D" ? INK : BLU })); e.setAttribute("opacity", sel === "D" ? 1 : 0.55); }
    lab(89, 46 + 5.5 + 4.5, "FORT (D)", BLU, "D");
    // Class E surface area + magenta vignette (700 ft AGL floor inside it)
    { const [a, b] = m(55, 46); [[10, 0.5], [9.3, 0.3], [8.6, 0.18], [7.9, 0.08]].forEach(([r, o]) => C(g, a, b, r * k, { stroke: MAG, sw: 0.75 * k, op: o * (sel === "E" || sel === "G" ? 1.6 : 0.8) })); }
    ring(55, 46, 4, MAG, "E", { dash: "6 4" });
    { const [a, b] = m(55, 46); C(g, a, b, 5, { stroke: MAG, sw: 2, op: op("E") }); }
    lab(55, 46 + 10 + 3, "ELM (E sfc)", MAG, "E");
    if (sel === "E") { lab(55 + 7.5, 46 - 9.5, "700 AGL", INK, "E", { anchor: "start" }); lab(4, 6, "1,200 AGL", INK, "E", { anchor: "start" }); }
    if (sel === "G") { lab(55 + 7.5, 46 - 9.5, "G: SFC–700 AGL", INK, "G", { anchor: ph ? "middle" : "start" }); lab(4, 6, "G: SFC–1,200 AGL", INK, "G", { anchor: "start" }); }
    // taps
    const taps = [["B", 26, 30, 19], ["C", 72, 20, 12], ["D", 89, 46, 5.5], ["E", 55, 46, 9]];
    for (const [key, x, y, r] of taps) { const [a, b] = m(x, y); const d = C(g, a, b, Math.max(16, r * k), { fill: "rgba(0,0,0,0)" }); d.style.pointerEvents = "all"; hit(g, d, IT[key][0], () => set(key)); }
    const it = IT[sel];
    S.F.caption(it[1], it[0]);
    S.F.explain(`${it[2]} <a href="#/lesson/gl10/overview">See ${it[0]} in the 3D wedding cake</a>. This chart is made up and not to scale: not for navigation. <span class="src">${it[3]}</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
