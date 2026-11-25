// Pilot certificates as a staircase (14 CFR 61.5; PHAK 1 and its MOSAIC addendum): tap a step to see its age, minimum
// flight time, passengers and pay. Static scene: it redraws only on a tap or a resize.
import { pxScene, T, L, hit, block, wrapT, ACC, INK, GRAY, DIM } from "./kit.js?v=41a7119e32";
const C = [
  { k: "STUDENT", name: "Student pilot", age: "16", time: "None to start", pax: "None", pay: "No", lim: "Solo only, with your instructor's endorsements.", src: "14 CFR 61.83, 61.89" },
  { k: "SPORT", name: "Sport pilot", age: "17", time: "20 h", pax: "1", pay: "No (share costs, pay at least half)", lim: "Day, up to 10,000 ft MSL or 2,000 ft AGL. Airplanes with up to 4 seats and VS1 no more than 59 kt CAS (MOSAIC). A driver's license can stand in for a medical.", src: "14 CFR 61.313, 61.315, 61.316 · PHAK MOSAIC addendum" },
  { k: "REC", name: "Recreational pilot", age: "17", time: "30 h", pax: "1", pay: "No (share costs)", lim: "Day, within 50 NM of the departure airport, up to 4 seats and 180 hp. Endorsements lift some limits.", src: "14 CFR 61.99, 61.101" },
  { k: "PRIVATE", name: "Private pilot", age: "17", time: "40 h (35 in Part 141)", pax: "Yes", pay: "No (share costs)", lim: "Day or night, any airspace your airplane is equipped for. Share costs, never fly for hire. This is the one you're training for.", src: "14 CFR 61.103, 61.109, 61.113" },
  { k: "COMM", name: "Commercial pilot", age: "18", time: "250 h", pax: "Yes", pay: "Yes", lim: "You may be paid to fly. Carrying passengers or cargo for hire as a business also needs an operator certificate.", src: "14 CFR 61.123, 61.129, 61.133" },
  { k: "ATP", name: "Airline transport pilot", age: "23 (21 restricted)", time: "1,500 h", pax: "Yes", pay: "Yes", lim: "Required for airline captains and first officers.", src: "14 CFR 61.153, 61.159, 61.160" },
];
export function mount(host) {
  let sel = 3;
  const S = pxScene(host, { corners: { tl: "Pilot certificates", tr: "Tap a step" } }, draw);
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 16, d = ph ? 10 : 16, n = C.length, gap = ph ? 4 : 10;
    const bw = (W - 32 - d - gap * (n - 1)) / n, base = top + (H - top) * (ph ? 0.46 : 0.5), step = ((H - top) * (ph ? 0.3 : 0.34)) / n;
    C.forEach((c, i) => {
      const x = x0 + i * (bw + gap), hh = step * (i + 1.4), y = base - hh, on = i === sel;
      const b = block(g, x, y, bw, hh, d, { on });
      T(g, x + bw / 2, y - d * 0.6 - 7, c.k, { anchor: "middle", size: 11, fill: on ? ACC : GRAY, weight: on ? 700 : 500 });
      if (i === 3 && !on) T(g, x + bw / 2, base - 8, "YOU", { anchor: "middle", size: 11, fill: DIM });
      hit(g, b, c.name, () => { sel = i; S.redraw(); });
    });
    L(g, x0, base + 1, W - 16, base + 1, { stroke: DIM, w: 1 });
    // fact card for the selected step
    const c = C[sel], cy = base + 26, cols = ph ? 2 : 4, cw = (W - 32) / cols;
    T(g, x0, cy, c.name.toUpperCase(), { size: ph ? 14 : 16, fill: ACC, weight: 700 });
    const facts = [["MIN AGE", c.age], ["MIN TIME", c.time], ["PASSENGERS", c.pax], ["PAID TO FLY", c.pay.split(" (")[0]]];
    facts.forEach(([k, v], i) => { const cx = x0 + (i % cols) * cw, yy = cy + 24 + Math.floor(i / cols) * 40;
      T(g, cx, yy, k, { size: 11, fill: GRAY }); T(g, cx, yy + 18, v, { size: ph ? 13 : 14, fill: INK, weight: 600, mono: false }); });
    const ly = cy + 24 + Math.ceil(4 / cols) * 40 + 6, lines = wrapT(c.lim, ph ? Math.floor((W - 32) / 7.2) : Math.floor((W - 32) / 7.6));
    if (ly + (lines.length - 1) * 18 < H - 8) lines.forEach((t, i) => T(g, x0, ly + i * 18, t, { size: 13, fill: GRAY, mono: false }));
    S.F.caption(c.name, c.pax === "None" ? "No passengers" : c.pax === "1" ? "One passenger" : c.pay.startsWith("Yes") ? "Can be paid to fly" : "Passengers, never for hire");
    S.F.explain(`<b>${c.name}.</b> ${c.lim} ${c.pay.includes("half") ? "You may share costs with your passenger but must pay at least half." : ""} <span class="src">${c.src}</span>`);
  }
  return { destroy() { S.F.destroy(); } };
}
