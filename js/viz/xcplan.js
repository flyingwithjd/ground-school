// Cross-country planner capstone (PHAK 16; 14 CFR 91.103, 91.151, 91.159; AWH; AIM 7-1): one made-up trip, Ashford to
// Bramble Valley, planned step by step: route and altitude, nav log, weight and balance, takeoff performance, weather,
// airspace and NOTAMs, then a go/no-go call. Each step shows its made-up data and asks one question. Controls sit on
// top so the growing answer text below never moves them. Not for navigation; use your airplane's POH.
import { frame, chips, row } from "./base.js?v=680d64f417";
import { h } from "../core/util.js?v=680d64f417";
const STEPS = [
  { k: "route", n: "Route", t: "1 · Route and altitude",
    d: ["Ashford (KXAF) → Bramble Valley (KXBV)", "True course 072° · 86 NM", "Variation 8° W → magnetic course 080°", "Checkpoints: Long Lake 18 NM · Fenwick 41 NM · BRM VOR 63 NM", "Highest obstacle near the route: 3,900 ft MSL"],
    q: "Which VFR cruising altitude fits this course above 3,000 ft AGL?", c: ["4,500 ft", "5,500 ft", "6,000 ft"], a: 1,
    w: "Below 18,000 ft MSL and more than 3,000 ft AGL, a magnetic course of 0–179° takes odd thousands plus 500 ft. 080° is eastbound, so 5,500 ft; it also clears the 3,900 ft obstacle. (14 CFR 91.159)" },
  { k: "log", n: "Nav log", t: "2 · Navigation log",
    d: ["Winds aloft at 6,000 ft: 3015 (300° at 15 kt), made up", "True airspeed 110 kt · true course 072°", "Wind from behind and to the left", "Cruise fuel burn 8.5 gal/h (use your POH)"],
    q: "About what groundspeed and heading do you plan?", c: ["101 kt, true heading 078°", "110 kt, true heading 072°", "119 kt, true heading 066°"], a: 2,
    w: "The wind is 132° off the nose from the left: about 10 kt of tailwind and 11 kt of crosswind. Correct about 6° left into it: true heading 066°, magnetic 074°. Groundspeed ≈ 119 kt, so 86 NM takes about 43 min and 6.1 gal, plus your POH's start, taxi and climb allowance. (PHAK 16)" },
  { k: "wb", n: "W&B", t: "3 · Weight and balance",
    d: ["Empty airplane: 1,680 lb at 39.8 in", "Pilot and passenger: 340 lb at 37.0 in", "Fuel, 40 gal: 240 lb at 48.0 in", "Baggage: 40 lb at 95.0 in", "Made-up limits: 2,550 lb max, CG 35.0–47.3 in"],
    q: "What are the takeoff weight and CG?", c: ["2,300 lb, CG 41.2 in", "2,300 lb, CG 39.8 in", "2,060 lb, CG 41.2 in"], a: 0,
    w: "Moments: 66,864 + 12,580 + 11,520 + 3,800 = 94,764 lb-in. Weight 2,300 lb. CG = 94,764 ÷ 2,300 = 41.2 in: inside the limits. With fuel burned the CG moves slightly forward; check landing too. (FAA-H-8083-1B)" },
  { k: "perf", n: "Performance", t: "4 · Takeoff performance",
    d: ["Field elevation 2,400 ft · 25 °C · altimeter 29.82", "Runway 09: 4,200 ft, paved, dry", "Made-up chart at your weight:", "  ground roll 1,250 ft · over a 50 ft obstacle 2,250 ft"],
    q: "About what are the pressure and density altitudes?", c: ["2,300 ft and 2,300 ft", "2,500 ft and 4,300 ft", "2,400 ft and 3,100 ft"], a: 1,
    w: "Pressure altitude = 2,400 + (29.92 − 29.82) × 1,000 = 2,500 ft. Standard there is about 10 °C, so it's 15 °C hot: about 120 ft per degree adds 1,800 ft, for 4,300 ft density altitude. The 2,250 ft obstacle distance fits 4,200 ft with margin. (PHAK 4, 11)" },
  { k: "wx", n: "Weather", t: "5 · Weather (made up)",
    d: ["METAR KXAF 241653Z 31008KT 10SM SCT060 25/08 A2982", "TAF KXBV 241130Z 2412/2512 30010KT P6SM SCT050", "     FM242100 27015G25KT 5SM -TSRA BKN040CB", "Convective outlook: TSTM area over Bramble Valley after 21Z", "Planned departure 1700Z · ETA about 1750Z"],
    q: "At your ETA, which TAF period applies?", c: ["The first period: VFR", "FM2100: thunderstorms", "Neither; the TAF expired"], a: 0,
    w: "1750Z is before the FM242100 group, so the first period is in effect: wind 300° at 10, visibility more than 6 SM, scattered at 5,000 ft. Storms are forecast from 2100Z, only about three hours later. Note that margin. (AIM 7-1 · AWH 27)" },
  { k: "air", n: "Airspace", t: "6 · Airspace and NOTAMs",
    d: ["Fenwick Class C outer shelf: 41/25 (2,500–4,100 ft MSL)", "NOTAM: !XBV RWY 09/27 CLSD 1600-2000Z", "KXBV also has runway 15/33: 3,100 ft, paved", "Made-up landing distance over 50 ft: 1,350 ft"],
    q: "What does the plan need to change?", c: ["Nothing; ignore NOTAMs at a destination", "Plan to land on runway 33", "Call Fenwick Approach for a clearance"], a: 1,
    w: "At 5,500 ft you pass above the Class C shelf, so no contact is needed, though ADS-B Out and a transponder are required above Class C up to 10,000 ft. Runway 09/27 is closed at your ETA; 15/33 is long enough and runway 33 lines up well with a 300° wind. (14 CFR 91.103, 91.215, 91.225)" },
  { k: "go", n: "Go / no-go", t: "7 · The call",
    d: ["A maintenance squawk delays you three hours.", "New departure 2000Z · new ETA about 2050Z", "TAF at KXBV: thunderstorms from 2100Z", "No other airport near the destination fits your plan"],
    q: "What's the best decision?", c: ["Go; you'll land 10 minutes early", "Go and dodge cells on datalink", "Delay or cancel; storms are due"], a: 2,
    w: "Ten minutes is no margin: forecast timing is approximate and storms can arrive early, with gusts, wind shear and lightning far ahead of the cells. Datalink weather is minutes old and is for avoiding storms, not picking through them. Wait until tomorrow or replan. (AIM 7-1 · PHAK 2, 12)" },
];
export function mount(host) {
  const F = frame(host, { cls: "xcp capin ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);
  const wrap = h("div", { class: "mt-wrap xcp-wrap" }); F.stage.prepend(wrap);
  let cur = 0; const done = new Set();
  chips(row(F.ctrl, "Step"), STEPS.map((s, i) => [String(i), String(i + 1)]), "0", (v) => { if (v != null) { cur = +v; show(); } });
  function map(k) {   // tiny ink route diagram; the part this step is about is blue
    const on = (x) => (x === k ? "#3B82F6" : "#F2F1EC"), dim = "rgba(242,241,236,.4)";
    const cp = [[60, 70, "Long Lake"], [150, 60, "Fenwick"], [235, 52, "BRM"]];
    return `<svg class="xcp-map" viewBox="0 0 360 104" role="img" aria-label="Made-up route from Ashford to Bramble Valley">
<circle cx="150" cy="60" r="34" fill="none" stroke="${k === "air" ? "#3B82F6" : "#C084FC"}" stroke-width="${k === "air" ? 2.5 : 1.2}" opacity="${k === "air" ? 1 : 0.6}"/>
<line x1="16" y1="78" x2="330" y2="40" stroke="${on(k === "route" || k === "log" ? k : "")}" stroke-width="${k === "route" || k === "log" ? 3 : 2}" stroke-dasharray="7 5"/>
${cp.map(([x, y, n]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${dim}"/><text x="${x}" y="${y + 18}" text-anchor="middle" font-size="11" fill="${dim}" font-family="var(--mono)">${n}</text>`).join("")}
<circle cx="16" cy="78" r="6" fill="${on(k === "wb" || k === "perf" ? k : "")}"/><text x="16" y="99" font-size="11" fill="#F2F1EC" font-family="var(--mono)">KXAF</text>
<circle cx="330" cy="40" r="6" fill="${on(k === "wx" || k === "go" ? k : "")}"/><text x="344" y="24" text-anchor="end" font-size="11" fill="#F2F1EC" font-family="var(--mono)">KXBV</text>
<g transform="translate(300,86)"><line x1="-14" y1="-7" x2="14" y2="7" stroke="${k === "log" ? "#3B82F6" : dim}" stroke-width="2"/><path d="M14 7 l-9 -1 M14 7 l-5 -7" stroke="${k === "log" ? "#3B82F6" : dim}" stroke-width="2" fill="none"/><text x="-22" y="4" text-anchor="end" font-size="11" fill="${dim}" font-family="var(--mono)">wind 300/15</text></g>
</svg>`; }
  function show() {
    const s = STEPS[cur]; wrap.innerHTML = "";
    const tag = h("div", { class: "mt-tag" }, "Made up · not for navigation · use your POH");
    const m = h("div", { class: "xcp-mapbox" }); m.innerHTML = map(s.k);
    const dat = h("pre", { class: "xcp-data" }, s.d.join("\n"));
    const q = h("div", { class: "wg-q" }, s.q), out = h("div", { class: "mt-det", "aria-live": "polite" });
    const ab = h("div", { class: "chips xcp-ans", role: "group", "aria-label": "answers" });
    const btns = s.c.map((c, i) => { const b = h("button", { class: "chip", type: "button" }, c); b.addEventListener("click", () => answer(i)); ab.append(b); return b; });
    wrap.append(tag, h("h4", { class: "xcp-t" }, s.t), m, dat, q, ab, out);
    out.innerHTML = `<p class="dim">Work it out, then pick an answer.</p>`;
    function answer(i) { btns.forEach((b, j) => { b.disabled = true; if (j === s.a) b.classList.add("on"); else if (j === i) b.classList.add("wrong"); });
      const good = i === s.a; if (good) done.add(cur);
      out.innerHTML = `<span class="label">${good ? "Right" : "Not quite"}</span><p>${s.w}</p>${cur < STEPS.length - 1 ? `<p class="dim">Next: step ${cur + 2}, ${STEPS[cur + 1].n}, in the row above.</p>` : ""}`;
      cap(); }
    cap();
  }
  function cap() { F.caption(`Step ${cur + 1} of 7 · ${done.size} right so far`, STEPS[cur].n); }
  F.explain(`A capstone trip that puts the course together: chart, nav log, weight and balance, performance, the weather brief, airspace and NOTAMs, then the go/no-go decision 14 CFR 91.103 makes yours. Every number here is made up; plan real trips with current charts, weather and your airplane's POH, and review them with your CFI. <span class="src">PHAK 16 · 14 CFR 91.103, 91.151, 91.159 · AIM 7-1</span>`);
  show();
  return { destroy() { F.destroy && F.destroy(); } };
}
