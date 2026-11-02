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
  const state = () => pg.evaluate(() => { const v = document.querySelector('[data-viz="structure"] .viz'), st = v.querySelector(".stage"), sr = st.getBoundingClientRect();
    const row = v.querySelector('[aria-label="Construction type"]').getBoundingClientRect();
    const labs = [...st.querySelectorAll(".fus-lab")].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent, l: r.left, r: r.right, tp: r.top, b: r.bottom }; });
    const ov = []; for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++) { const a = labs[i], c = labs[j]; if (a.l < c.r - 1 && c.l < a.r - 1 && a.tp < c.b - 1 && c.tp < a.b - 1) ov.push(a.t + " ⟂ " + c.t); }
    const out = labs.filter((a) => a.l < sr.left - 1 || a.r > sr.right + 1 || a.tp < sr.top - 1 || a.b > sr.bottom + 1).map((a) => a.t);
    return { type: st.dataset.type, calls: +st.dataset.calls || 0, canvas: !!st.querySelector("canvas"), row: [row.left, row.top, row.width].map(Math.round), labs: labs.length, ov, out, big: v.querySelector(".caption .big")?.textContent,
      on: [...v.querySelectorAll('[aria-label="Construction type"] .chip.on')].map((c) => c.textContent) }; });
  const s0 = await state(); let row0 = s0.row; const res = [];
  ok(s0.canvas && s0.calls > 10, `${w}: 3D stage rendered (${s0.calls} draw calls)`);
  for (const [chip, key, big] of [["Monocoque", "mono", "Monocoque"], ["Semimonocoque", "semi", "Semimonocoque"], ["Truss", "truss", "Truss"]]) {
    await viz.locator('[aria-label="Construction type"] .chip', { hasText: new RegExp("^" + chip + "$") }).click(); await pg.waitForTimeout(1800);
    const s1 = await state(); res.push([chip, s1]);
    ok(s1.type === key && s1.big === big && s1.on.join() === chip, `${w} ${chip}: switched (type ${s1.type}, caption ${s1.big}, on ${s1.on})`);
    ok(s1.row.every((v, i) => Math.abs(v - row0[i]) <= 1), `${w} ${chip}: chip row stayed put ${JSON.stringify(row0)} -> ${JSON.stringify(s1.row)}`);
    ok(s1.labs >= 3 && !s1.ov.length && !s1.out.length, `${w} ${chip}: ${s1.labs} labels, overlaps ${JSON.stringify(s1.ov)}, outside ${JSON.stringify(s1.out)}`);
    ok(s1.calls > 10, `${w} ${chip}: rendered`);
    if (shotDir) { const bb = await viz.boundingBox(); await pg.screenshot({ path: `${shotDir}/fuselage_${key}_${w}x${hh}.png`, clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, hh - bb.y) } }); }
  }
  // dent toggle (monocoque only) keeps the type row in place
  await viz.locator(".chip", { hasText: /^Monocoque$/ }).click(); await pg.waitForTimeout(800); await viz.locator(".chip", { hasText: /^Show a dent$/ }).click(); await pg.waitForTimeout(900);
  { const s2 = await state(); ok(s2.row.every((v, i) => Math.abs(v - row0[i]) <= 1) && !s2.ov.length && !s2.out.length && /DENT/.test(JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll(".fus-lab")].map((e) => e.textContent)))), `${w} dent: row fixed, DENT label, no overlap`); }
  // drag turns the airplane (labels follow, still no overlap)
  const st = await viz.locator(".stage").boundingBox(); const before = await pg.evaluate(() => [...document.querySelectorAll(".fus-lead line")].map((l) => l.getAttribute("x2")).join());
  await pg.mouse.move(st.x + st.width * 0.5, st.y + st.height * 0.5); await pg.mouse.down(); for (let i = 1; i <= 12; i++) { await pg.mouse.move(st.x + st.width * 0.5 - i * 10, st.y + st.height * 0.5); await pg.waitForTimeout(16); } await pg.mouse.up(); await pg.waitForTimeout(1200);
  const after = await pg.evaluate(() => [...document.querySelectorAll(".fus-lead line")].map((l) => l.getAttribute("x2")).join()); const s3 = await state();
  ok(before !== after && !s3.ov.length && !s3.out.length, `${w} drag: view turned (${before !== after}), overlaps ${JSON.stringify(s3.ov)}`);
  ok(!errs.length, `${w}: console errors ${errs.join("; ")}`);
  console.log(`${w}x${hh}`, res.map(([c, s]) => `${c}:${s.labs} labels`).join(" "), errs.length ? "errors" : "no errors");
  await ctx.close(); }
await b.close(); console.log(fail ? `FAIL (${fail})` : "PASS"); process.exit(fail ? 1 : 0);
