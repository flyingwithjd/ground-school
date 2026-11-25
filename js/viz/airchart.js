// Airspace as it looks on a sectional chart (FAA Aeronautical Chart User's Guide; AIM 3-2; PHAK 15). A made-up chart:
// Class B (solid blue shelves), Class C (solid magenta), Class D (dashed blue), Class E surface area (dashed magenta)
// with a magenta vignette (Class E from 700 ft AGL), and Class G underneath. Chart colors are kept because the color is
// the information; the class you pick is drawn bold and the others fade. Its link opens the 3D wedding cake on the
// overview page with the same class lit. Static scene: draws only on change.
import { chips, row } from "./base.js?v=d4d14c5a28";
import { pxScene, T, L, C, P, hit, INK, GRAY } from "./kit.js?v=d4d14c5a28";
const MAG = "#D946EF", BLU = "#60A5FA";
const IT = {
  B: ["Class B", "Solid blue: shelves 100/SFC, 100/30, 100/60", `<strong>Solid blue lines</strong> outline each Class B shelf. The numbers are ceiling over floor in hundreds of feet MSL: <strong>100/SFC</strong> is surface to 10,000 ft, <strong>100/30</strong> is 3,000 to 10,000 ft. Under a shelf you're outside it. You need an ATC clearance to enter, and student pilots need an endorsement. The thin magenta circle is the <strong>30 NM Mode C veil</strong>: inside it, a transponder with altitude reporting and ADS-B Out are required.`, "AIM 3-2-3 · 14 CFR 91.131, 91.215"],
  C: ["Class C", "Solid magenta: 40/SFC core, 40/12 shelf", `<strong>Solid magenta lines</strong> mark Class C. The inner core, <strong>40/SFC</strong>, runs from the surface to 4,000 ft MSL; the outer shelf, <strong>40/12</strong>, from 1,200 to 4,000 ft MSL. Establish two-way radio communication with approach before you enter: they must say your call sign back. A transponder with altitude reporting and ADS-B Out are required in it and above it.`, "AIM 3-2-4 · 14 CFR 91.130"],
  D: ["Class D", "Dashed blue: [25] ceiling 2,500 ft MSL", `A <strong>dashed blue line</strong> marks Class D around a towered airport. The boxed number is its ceiling in hundreds of feet MSL: <strong>[25]</strong> is surface to 2,500 ft MSL. Establish two-way radio communication with the tower before you enter. When the tower closes, the airspace usually becomes Class E or G: check the Chart Supplement.`, "AIM 3-2-5 · 14 CFR 91.129"],
  E: ["Class E", "Dashed magenta: surface · shading: 700 AGL", `A <strong>dashed magenta line</strong> is a Class E surface area: Class E starts at the ground. Inside the <strong>magenta vignette</strong> (the shaded band, fading inward), Class E starts at <strong>700 ft AGL</strong>. Where nothing is shaded, Class E usually starts at <strong>1,200 ft AGL</strong>. A blue vignette, mostly in the West, marks where the floor jumps from 1,200 ft AGL to 14,500 ft MSL. Class E needs no ATC contact for VFR.`, "AIM 3-2-6 · Chart User's Guide"],
  G: ["Class G", "No line: whatever lies under Class E", `<strong>Class G has no line</strong>. It's the airspace under the Class E floor: up to <strong>700 ft AGL</strong> inside the magenta shading, up to <strong>1,200 ft AGL</strong> elsewhere, and up to 14,500 ft MSL beyond a blue vignette. No ATC contact is needed, and the VFR weather minimums are lowest here, especially close to the ground.`, "AIM 3-3 · 14 CFR 91.155"],
};
export function mount(host) {
  let sel = "B";
  host.addEventListener("click", (e) => { if (e.target.closest && e.target.closest('a[href*="gl10/overview"]')) try { sessionStorage.setItem("air.sel", sel); } catch (x) {} });   // the 3D cake opens on this class
  const S = pxScene(host, { cls: "achart", corners: { tl: "Airspace on a chart (made up)", tr: "Chart User's Guide" } }, draw);
  const ch = chips(row(S.F.ctrl), ["B", "C", "D", "E", "G"].map((k) => [k, "Class " + k]), sel, (v) => set(v || sel), { label: "Airspace class" });
  function set(v) { sel = v; ch.set(v); S.redraw(); }
  function draw(g, W, H, top) {
    const ph = W < 520, UH = ph ? 82 : 58, k = Math.min((W - 8) / 100, (H - top - 6) / UH), ox = W / 2 - 50 * k, oy = top + 2;
    // layout in chart units (100 wide): phones get a taller sheet so the Class B shelves have room for their labels
    const Q = ph ? { B: [36, 31, [9, 17, 25], 33], C: [78, 68, [6, 12]], D: [86, 16, 5.5], E: [33, 70, 4, 8] }
                 : { B: [26, 29, [7, 13, 19], 27], C: [72, 19, [6, 12]], D: [89, 42, 5.5], E: [54, 41, 4, 8] };
    const m = (x, y) => [ox + x * k, oy + y * k];
    const op = (key) => (sel === key ? 1 : 0.35), bw = (key, w) => (sel === key ? w * 1.9 : w);
    const halo = (e) => { e.setAttribute("stroke", "#000"); e.setAttribute("stroke-width", "4"); e.setAttribute("paint-order", "stroke"); e.setAttribute("stroke-linejoin", "round"); return e; };
    const labp = (a, b, s, col, key, o = {}) => { const e = halo(T(g, a, b, s, { size: 11, weight: 600, anchor: "middle", fill: sel === key ? INK : col, ...o })); e.setAttribute("opacity", sel === key ? 1 : 0.55); return e; };
    const lab = (x, y, s, col, key, o = {}) => { const [a, b] = m(x, y); return labp(a, b, s, col, key, o); };
    const frac = (x, y, c, f, col, key) => { const [a, b] = m(x, y); labp(a, b - 3, c, col, key); L(g, a - 10, b, a + 10, b, { stroke: sel === key ? INK : col, w: 1.2, op: sel === key ? 1 : 0.55 }); labp(a, b + 12, f, col, key); };
    const apt = (x, y, col, key) => { const [a, b] = m(x, y); C(g, a, b, 6, { stroke: col, sw: 2, op: op(key) }); L(g, a - 3.5, b + 3.5, a + 3.5, b - 3.5, { stroke: col, w: 2.2, op: op(key) }); };
    const ring = (x, y, r, col, key, o = {}) => { const [a, b] = m(x, y); return C(g, a, b, r * k, { stroke: col, sw: bw(key, o.w || 1.5), dash: o.dash, op: op(key) }); };
    // Class B with its three shelves, and the 30 NM Mode C veil around it
    { const [x, y, rs, mc] = Q.B; ring(x, y, mc, MAG, "B", { w: 0.8 }); lab(x + mc * 0.72, y - mc * 0.7, ph ? "MODE C" : "MODE C 30 NM", MAG, "B", { anchor: "start", dy: -2 });
      rs.forEach((r) => ring(x, y, r, BLU, "B")); apt(x, y, BLU, "B");
      const ang = Math.PI, mids = [(rs[0] + 2.2) / 2, (rs[0] + rs[1]) / 2, (rs[1] + rs[2]) / 2];
      [["100", "SFC"], ["100", "30"], ["100", "60"]].forEach(([c, f], i) => { const an = ang + (i - 1) * 0.5; frac(x + Math.cos(an) * mids[i], y + Math.sin(an) * mids[i], c, f, BLU, "B"); });
      lab(x, y + rs[2] + 4.2, "METRO (B)", BLU, "B"); }
    // Class C
    { const [x, y, rs] = Q.C; rs.forEach((r) => ring(x, y, r, MAG, "C")); apt(x, y, MAG, "C");
      frac(x, y + (rs[0] + 1.8) / 2 + 0.6, "40", "SFC", MAG, "C"); frac(x, y - (rs[0] + rs[1]) / 2 - 0.6, "40", "12", MAG, "C");
      lab(x, y + rs[1] + 4.2, "BAYPORT (C)", MAG, "C"); }
    // Class D
    { const [x, y, r] = Q.D; ring(x, y, r, BLU, "D", { dash: "7 5" }); apt(x, y, BLU, "D");
      const [a, b] = m(x, y - r); const e = halo(T(g, a, b - 4, "[25]", { size: 12, weight: 700, anchor: "middle", fill: sel === "D" ? INK : BLU })); e.setAttribute("opacity", sel === "D" ? 1 : 0.55);
      lab(x, y + r + 4.2, "FORT (D)", BLU, "D"); }
    // Class E surface area + magenta vignette: Class E from 700 ft AGL inside the shading
    { const [x, y, r, v] = Q.E, [a, b] = m(x, y), hi = sel === "E" || sel === "G";
      [[v, 0.45], [v - 0.6, 0.25], [v - 1.2, 0.12]].forEach(([rr, o]) => C(g, a, b, rr * k, { stroke: MAG, sw: 0.6 * k, op: o * (hi ? 1.5 : 0.7) }));
      ring(x, y, r, MAG, "E", { dash: "6 4" }); C(g, a, b, 5, { stroke: MAG, sw: 2, op: op("E") });
      lab(x, y + v + 4, "ELM (E)", MAG, "E");
      const tl = [4, ph ? 4.5 : 6];
      if (sel === "E") { lab(ph ? x + v + 1.5 : x + v * 0.75, ph ? y + 1 : y - v - 1.5, "700 AGL", INK, "E", { anchor: "start" }); lab(tl[0], tl[1], ph ? "E from 1,200 AGL" : "elsewhere: E from 1,200 AGL", INK, "E", { anchor: "start" }); }
      if (sel === "G") { lab(ph ? x + v + 1.5 : x + v * 0.75, ph ? y + 1 : y - v - 1.5, "G: SFC–700 AGL", INK, "G", { anchor: "start" }); lab(tl[0], tl[1], ph ? "G: SFC–1,200 AGL" : "elsewhere: G from SFC to 1,200 AGL", INK, "G", { anchor: "start" }); } }
    // taps
    const taps = [["B", Q.B[0], Q.B[1], Q.B[2][2]], ["C", Q.C[0], Q.C[1], 12], ["D", Q.D[0], Q.D[1], Q.D[2]], ["E", Q.E[0], Q.E[1], Q.E[3]]];
    for (const [key, x, y, r] of taps) { const [a, b] = m(x, y); const d = C(g, a, b, Math.max(16, r * k), { fill: "rgba(0,0,0,0)" }); d.style.pointerEvents = "all"; hit(g, d, IT[key][0], () => set(key)); }
    const it = IT[sel];
    S.F.caption(it[1], it[0]);
    S.F.explain(`${it[2]} <a href="#/lesson/gl10/overview">See ${it[0]} in the 3D wedding cake</a>. This chart is made up and not to scale: not for navigation. <span class="src">${it[3]}</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
