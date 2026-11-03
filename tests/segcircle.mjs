// Usage: node tests/segcircle.mjs  — the segmented-circle visual (js/viz/segcircle.js), at 1440, 1024, 744 and 390 wide:
//  * sweeps wind direction 10..360 up and back down at several speeds (0..25 kt), sock and + tetrahedron
//  * controls (both sliders, the chip row, every readout cell, the caption's position and height) never move, not even 1px, across all values
//  * runway choice: the runway most nearly into the wind outside a +/-5 deg band around direct crosswind (wind 360/180);
//    inside the band the shown runway is kept (no flip-flop) and at most one change per one-way sweep
//  * caption and readouts agree with the computed components; calm and crosswind never claim "Runway N"
//  * SVG labels never overlap each other and stay inside the stage
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core");
const route = process.argv[2] || "#/lesson/ap6/0";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let bad = 0;
for (const [w, hh] of [[1440, 900], [1024, 768], [744, 1133], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, hasTouch: w < 1100, isMobile: w < 500, reducedMotion: "reduce" }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://localhost:8765/index.html" + route); await pg.waitForTimeout(1200);
  const res = await pg.evaluate(() => {
    const v = document.querySelector(".viz.segc"); if (!v) return { probs: ["no .viz.segc on the page"] };
    const probs = [], n180 = (a) => ((a % 360) + 540) % 360 - 180, D = Math.PI / 180;
    const inp = (k) => v.querySelector(`[data-k=${k}] input`), set = (k, x) => { const i = inp(k); i.value = x; i.dispatchEvent(new Event("input", { bubbles: true })); };
    const els = () => [...v.querySelectorAll(".slider, .chips, .seg-ro > div, .caption .label, .caption .big")];
    const rect = () => els().map((e) => { const r = e.getBoundingClientRect(); return [r.left + scrollX, r.top + scrollY, e.closest(".caption") ? 0 : r.width, r.height].map((q) => Math.round(q * 10) / 10).join(","); });
    const base = rect(); const sr = () => v.querySelector(".stage").getBoundingClientRect();
    const txt = (k) => v.querySelector(`.seg-ro [data-k=${k}] b`).textContent, lab = (k) => v.querySelector(`.seg-ro [data-k=${k}] span`).textContent;
    let checks = 0;
    const check = (wd, kt, tag) => { checks++;
      const now = rect(); now.forEach((r, i) => { if (r !== base[i]) probs.push(`${tag}: control ${els()[i].className || els()[i].tagName} moved ${base[i]} -> ${r}`); });
      const D27 = n180(wd - 270), rw = v.dataset.rw, state = v.dataset.state, big = v.querySelector(".caption .big").textContent;
      const d = rw === "27" ? D27 : n180(wd - 90), head = kt * Math.cos(d * D), cross = kt * Math.sin(d * D), hd = Math.round(head) || 0, xd = Math.round(Math.abs(cross));
      const want = kt === 0 ? "calm" : Math.abs(D27) < 85 ? "into" : Math.abs(D27) > 95 ? "into" : Math.abs(D27) === 90 ? "direct" : "near";
      if (state !== want) probs.push(`${tag}: state ${state}, expected ${want}`);
      if (want === "into" && rw !== (Math.abs(D27) < 85 ? "27" : "9")) probs.push(`${tag}: runway ${rw} is not the one most nearly into the wind`);
      if (want === "into" && head <= 0) probs.push(`${tag}: chosen runway has no headwind (${head.toFixed(2)})`);
      const side = rw === "27" ? "right" : "left";
      const bigWant = { calm: "Calm wind", direct: "Direct crosswind", near: "Nearly direct crosswind", into: `Runway ${rw} · ${side} traffic` }[want];
      if (big !== bigWant) probs.push(`${tag}: caption "${big}", expected "${bigWant}"`);
      if (want !== "into" && /Runway \d/.test(big)) probs.push(`${tag}: caption names a runway in ${want}`);
      const label = v.querySelector(".caption .label").textContent; if (kt === 0 ? label !== "Wind calm" : label !== `Wind ${String(wd).padStart(3, "0")}° at ${kt} kt`) probs.push(`${tag}: caption label "${label}"`);
      if (txt("rw") !== rw) probs.push(`${tag}: runway readout ${txt("rw")} vs ${rw}`);
      if (txt("hw") !== Math.abs(hd) + " kt" || lab("hw") !== (hd < 0 ? "tailwind" : "headwind")) probs.push(`${tag}: headwind readout ${txt("hw")} ${lab("hw")}, expected ${hd}`);
      if (txt("xw") !== xd + " kt") probs.push(`${tag}: crosswind readout ${txt("xw")}, expected ${xd} kt`);
      if (xd >= 1 && lab("xw") !== `crosswind · ${cross > 0 ? "right" : "left"}`) probs.push(`${tag}: crosswind side ${lab("xw")}`);
      if (txt("tp") !== (rw === "27" ? "Right" : "Left")) probs.push(`${tag}: pattern readout ${txt("tp")}`);
      const ex = v.querySelector(".explain").textContent; if (want !== "into" && /most nearly into the wind: runway/.test(ex)) probs.push(`${tag}: explain picks a runway by wind in ${want}`);
      if (want === "into" && !ex.includes(`runway ${rw}, ${hd} kt headwind`)) probs.push(`${tag}: explain does not match components`);
      // SVG labels: inside the stage, never overlapping
      const S = sr(), T = [...v.querySelectorAll("svg text")].filter((t) => t.textContent.trim() && getComputedStyle(t).display !== "none").map((t) => ({ t: t.textContent, r: t.getBoundingClientRect() }));
      for (const a of T) if (a.r.left < S.left - 1 || a.r.right > S.right + 1 || a.r.top < S.top - 1 || a.r.bottom > S.bottom + 1) probs.push(`${tag}: "${a.t}" outside stage`);
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const a = T[i].r, c = T[j].r; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) probs.push(`${tag}: "${T[i].t}" overlaps "${T[j].t}"`); }
      // corner labels vs SVG text
      for (const c of v.querySelectorAll(".stage > .corner")) { const a = c.getBoundingClientRect(); for (const t of T) { const q = t.r; if (a.left < q.right - 1 && q.left < a.right - 1 && a.top < q.bottom - 1 && q.top < a.bottom - 1) probs.push(`${tag}: corner "${c.textContent}" overlaps "${t.t}"`); } }
      return rw; };
    const dirs = []; for (let x = 10; x <= 360; x += 5) dirs.push(x);
    for (const tet of [false, true]) {
      if (tet) { v.querySelectorAll(".chip")[1].click(); }
      for (const kt of tet ? [0, 9, 25] : [0, 1, 2, 3, 9, 12, 15, 25]) { set("spd", kt);
        for (const seq of [dirs, [...dirs].reverse()]) { let prev = null, changes = 0;
          for (const wd of seq) { set("dir", wd); const before = prev; const rw = check(wd, kt, `${tet ? "tet " : ""}${wd}/${kt}`);
            const D27 = Math.abs(n180(wd - 270)); if (before && kt > 0 && D27 >= 85 && D27 <= 95 && rw !== before) probs.push(`${wd}/${kt}: runway flipped inside the crosswind band (${before} -> ${rw})`);
            if (before && rw !== before) changes++; prev = rw; }
          if (kt > 0 && changes > 1) probs.push(`${kt} kt sweep ${seq[0]}->${seq[seq.length - 1]}: runway changed ${changes} times`); } } }
    return { probs: [...new Set(probs)], checks };
  });
  if (errs.length) res.probs.push("page errors: " + errs.join("; "));
  console.log(`${w}px: ${res.checks} states, ${res.probs.length} problems` + (res.probs.length ? "\n  " + res.probs.slice(0, 15).join("\n  ") + (res.probs.length > 15 ? `\n  … ${res.probs.length - 15} more` : "") : ""));
  if (res.probs.length) bad++; await ctx.close();
}
await b.close(); process.exit(bad ? 1 : 0);
