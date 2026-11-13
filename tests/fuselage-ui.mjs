// Usage: node tests/fuselage-ui.mjs [SHOTDIR] — GL1 "Truss, shell, or both": the 3D fuselage renders, the three type chips switch
// the structure, the chip row never moves between types, labels stay inside the stage and never overlap each other,
// a drag turns the airplane, and there are no console errors. Sizes 1440x900 and 390x844.
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html", shotDir = process.argv[2];
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log("   FAIL", m); } };
for (const [w, hh] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, deviceScaleFactor: w < 700 ? 2 : 1, isMobile: w < 700, hasTouch: w < 700 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await pg.goto(BASE + "#/lesson/gl1/2"); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { const v = document.querySelector('[data-viz="structure"] .viz'); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 90); }); await pg.waitForTimeout(1500);
  const viz = pg.locator('[data-viz="structure"] .viz');
  const shot = async (name) => { await pg.evaluate(() => document.querySelectorAll("body *").forEach((e) => { const p = getComputedStyle(e).position; if ((p === "fixed" || p === "sticky") && !e.closest(".viz")) e.style.visibility = "hidden"; }));
    const bb = await viz.boundingBox(); const sy = await pg.evaluate(() => scrollY); await pg.screenshot({ path: `${shotDir}/${name}.png`, fullPage: true, clip: { x: bb.x, y: bb.y + sy, width: bb.width, height: bb.height } });
    await pg.evaluate(() => document.querySelectorAll("body *").forEach((e) => { if (e.style.visibility === "hidden") e.style.visibility = ""; })); };
  const state = () => pg.evaluate(() => { const v = document.querySelector('[data-viz="structure"] .viz'), st = v.querySelector(".stage"), sr = st.getBoundingClientRect();
    const row0 = v.querySelector('[aria-label="Construction type"]').getBoundingClientRect(), row = { left: row0.left, top: row0.top + scrollY, width: row0.width };
    const labs = [...st.querySelectorAll(".fus-lab")].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent, l: r.left, r: r.right, tp: r.top, b: r.bottom }; });
    const ov = []; for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++) { const a = labs[i], c = labs[j]; if (a.l < c.r - 1 && c.l < a.r - 1 && a.tp < c.b - 1 && c.tp < a.b - 1) ov.push(a.t + " ⟂ " + c.t); }
    const out = labs.filter((a) => a.l < sr.left - 1 || a.r > sr.right + 1 || a.tp < sr.top - 1 || a.b > sr.bottom + 1).map((a) => a.t);
    return { type: st.dataset.type, calls: +st.dataset.calls || 0, canvas: !!st.querySelector("canvas"), row: [row.left, row.top, row.width].map(Math.round), labs: labs.length, ov, out, big: v.querySelector(".caption .big")?.textContent,
      on: [...v.querySelectorAll('[aria-label="Construction type"] .chip.on')].map((c) => c.textContent) }; });
  const s0 = await state(); let row0 = s0.row; const res = [];
  ok(s0.canvas && s0.calls >= 5, `${w}: 3D stage rendered (${s0.calls} draw calls)`);
  for (const [chip, key, big] of [["Monocoque", "mono", "Monocoque"], ["Semimonocoque", "semi", "Semimonocoque"], ["Truss", "truss", "Truss"]]) {
    await viz.locator('[aria-label="Construction type"] .chip', { hasText: new RegExp("^" + chip + "$") }).click(); await pg.waitForTimeout(1800);
    const s1 = await state(); res.push([chip, s1]);
    ok(s1.type === key && s1.big === big && s1.on.join() === chip, `${w} ${chip}: switched (type ${s1.type}, caption ${s1.big}, on ${s1.on})`);
    ok(s1.row.every((v, i) => Math.abs(v - row0[i]) <= 1), `${w} ${chip}: chip row stayed put ${JSON.stringify(row0)} -> ${JSON.stringify(s1.row)}`);
    ok(s1.labs >= 3 && !s1.ov.length && !s1.out.length, `${w} ${chip}: ${s1.labs} labels, overlaps ${JSON.stringify(s1.ov)}, outside ${JSON.stringify(s1.out)}`);
    ok(s1.calls >= 5 && s1.calls <= 60 /* +3 for the wing spars, ribs and stringers on the 172 */, `${w} ${chip}: rendered within the draw-call budget (${s1.calls})`);
    { const ex = await viz.locator(".fus-ex").textContent(); const want = { mono: "Lockheed Vega", semi: "Cessna 172", truss: "Piper J-3 Cub" }[key]; ok(ex === "Example: " + want, `${w} ${chip}: example label "${ex}"`); }
    if (shotDir) await shot(`fuselage_${key}_${w}x${hh}`);
  }
  // part isolation: tap a label or a part chip -> that part alone in blue; tap again (or All) -> everything; rows never move
  const rows = () => pg.evaluate(() => { const v = document.querySelector('[data-viz="structure"] .viz'); const r = (q) => { const e = v.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY)]; };
    return { mode: r('[aria-label="Construction type"]'), part: r('.fus-parts') }; });
  const iso = () => pg.evaluate(() => { const v = document.querySelector('[data-viz="structure"] .viz'), st = v.querySelector(".stage");
    return { sel: st.dataset.sel, chip: [...v.querySelectorAll('[aria-label="Part"] .chip.on')].map((c) => c.textContent).join(), lab: [...st.querySelectorAll(".fus-lab.on")].map((e) => e.dataset.k).join(), big: v.querySelector(".caption .big").textContent, desc: v.querySelector(".fus-desc").textContent }; });
  const r0 = await rows();
  for (const [mode, labKey, labName, chipName, chipKey] of [["Truss", "lon", "Longerons", "Diagonals", "dia"], ["Semimonocoque", "str", "Stringers", "Formers", "form"], ["Monocoque", "skin", "Stressed skin", "Bulkhead", "bulk"]]) {
    await viz.locator('[aria-label="Construction type"] .chip', { hasText: new RegExp("^" + mode + "$") }).click(); await pg.waitForTimeout(1500);
    let s = await iso(); ok(s.sel === "all" && s.chip === "All" && !s.lab, `${w} ${mode}: starts on All ${JSON.stringify(s)}`);
    const partChips = await viz.locator('[aria-label="Part"] .chip').allTextContents(); ok(partChips[0] === "All" && partChips.includes(labName) && partChips.includes(chipName), `${w} ${mode}: part chips ${partChips}`);
    await viz.locator(`.fus-lab[data-k="${labKey}"]`).click(); await pg.waitForTimeout(500); s = await iso();
    ok(s.sel === labKey && s.lab === labKey && s.chip === labName && s.big === labName && s.desc.length > 40, `${w} ${mode}: label isolates ${labKey} ${JSON.stringify(s)}`);
    if (shotDir && ((mode === "Truss" && w === 1440) || (mode === "Semimonocoque") )) await shot(`fuselage_${mode === "Truss" ? "truss_longeron" : "semi_stringer"}_${w}x${hh}`);
    if (mode === "Semimonocoque") { await viz.locator('[aria-label="Part"] .chip', { hasText: /^Stringers$/ }).click(); await pg.waitForTimeout(300); s = await iso(); ok(s.sel === "all" && s.chip === "All", `${w} ${mode}: re-tap chip -> All ${JSON.stringify(s)}`);
      await viz.locator(`.fus-lab[data-k="${labKey}"]`).click(); await pg.waitForTimeout(300); }
    await viz.locator(`.fus-lab[data-k="${labKey}"]`).click(); await pg.waitForTimeout(400); s = await iso(); ok(s.sel === "all" && s.chip === "All" && !s.lab, `${w} ${mode}: re-tap label -> All ${JSON.stringify(s)}`);
    await viz.locator('[aria-label="Part"] .chip', { hasText: new RegExp("^" + chipName + "$") }).click(); await pg.waitForTimeout(400); s = await iso();
    ok(s.sel === chipKey && s.chip === chipName && s.big === chipName, `${w} ${mode}: chip isolates ${chipKey} ${JSON.stringify(s)}`);
    await viz.locator('[aria-label="Part"] .chip', { hasText: /^All$/ }).click(); await pg.waitForTimeout(400); s = await iso(); ok(s.sel === "all" && s.chip === "All", `${w} ${mode}: All chip resets ${JSON.stringify(s)}`);
    await viz.locator('[aria-label="Part"] .chip', { hasText: new RegExp("^" + chipName + "$") }).click(); await pg.waitForTimeout(300);
    const r1 = await rows(); ok(JSON.stringify(r1.mode) === JSON.stringify(r0.mode) && Math.abs(r1.part[1] - r0.part[1]) <= 1 && Math.abs(r1.part[0] - r0.part[0]) <= 1, `${w} ${mode}: rows stayed ${JSON.stringify(r0)} -> ${JSON.stringify(r1)}`);
    const st2 = await state(); ok(!st2.ov.length && !st2.out.length, `${w} ${mode}: labels ok while isolated ${JSON.stringify(st2.ov)}`);
  }
  // switching modes resets to All
  await viz.locator('[aria-label="Construction type"] .chip', { hasText: /^Truss$/ }).click(); await pg.waitForTimeout(1200); { const s = await iso(); ok(s.sel === "all" && s.chip === "All", `${w}: mode switch resets to All ${JSON.stringify(s)}`); }
  const top = () => pg.evaluate(() => { const v = document.querySelector('[data-viz="structure"] .viz'); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 90); });
  await top(); await pg.waitForTimeout(300);
  // dent toggle (monocoque only) keeps the type row in place
  await viz.locator(".chip", { hasText: /^Monocoque$/ }).click(); await pg.waitForTimeout(800); await viz.locator(".fus-dent", { hasText: /Show a dent/ }).click(); await pg.waitForTimeout(900);
  { const s2 = await state(); ok(s2.row.every((v, i) => Math.abs(v - row0[i]) <= 1) && !s2.ov.length && !s2.out.length && /DENT/.test(JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll(".fus-lab")].map((e) => e.textContent)))), `${w} dent: row fixed, DENT label, no overlap`); }
  await top(); await pg.waitForTimeout(400);
  // drag turns the airplane (labels follow, still no overlap)
  const st = await viz.locator(".stage").boundingBox(); const before = await pg.evaluate(() => [...document.querySelectorAll(".fus-lead line")].map((l) => l.getAttribute("x2")).join());
  await pg.mouse.move(st.x + st.width * 0.5, st.y + st.height * 0.5); await pg.mouse.down(); for (let i = 1; i <= 12; i++) { await pg.mouse.move(st.x + st.width * 0.5 - i * 10, st.y + st.height * 0.5); await pg.waitForTimeout(16); } await pg.mouse.up(); await pg.waitForTimeout(1200);
  const after = await pg.evaluate(() => [...document.querySelectorAll(".fus-lead line")].map((l) => l.getAttribute("x2")).join()); const s3 = await state();
  ok(before !== after && !s3.ov.length && !s3.out.length, `${w} drag: view turned (${before !== after}), overlaps ${JSON.stringify(s3.ov)}`);
  ok(!errs.length, `${w}: console errors ${errs.join("; ")}`);
  console.log(`${w}x${hh}`, res.map(([c, s]) => `${c}:${s.labs} labels`).join(" "), errs.length ? "errors" : "no errors");
  await ctx.close(); }
await b.close(); console.log(fail ? `FAIL (${fail})` : "PASS"); process.exit(fail ? 1 : 0);
