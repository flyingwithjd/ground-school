// Usage: node tests/corner-clear.mjs [SHOTDIR] — in the 172S parts explorer (GL1 §0) and feature tour (GL1 §3), the corner labels
// ("Cessna 172S", span/length, tour readouts) sit in a band above the 3D canvas, so they never cover the model: after every part button,
// every tour step and an orbit drag, at 1440, 1024, 820 and 390. Also: no console errors.
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html", shotDir = process.argv[2];
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log("   FAIL", m); } };
for (const [w, hh] of [[1440, 900], [1024, 768], [820, 1180], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, isMobile: w < 700, hasTouch: w < 1100 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  let checks = 0;
  for (const sec of [0, 3]) {
    await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl1/" + sec); await pg.waitForTimeout(2200);
    const viz = pg.locator(".viz").filter({ has: pg.locator(".stage[data-band]") }).first();
    await viz.evaluate((v) => window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 90)); await pg.waitForTimeout(600);
    const check = async (what) => { checks++; const r = await viz.evaluate((v) => { const st = v.querySelector(".stage"), cv = st.querySelector("canvas").getBoundingClientRect(), sr = st.getBoundingClientRect();
        return [...st.querySelectorAll(".corner")].filter((c) => c.textContent.trim() && c.getBoundingClientRect().height).map((c) => { const r = c.getBoundingClientRect(); return { t: c.textContent, over: r.bottom > cv.top + 0.5 && r.top < cv.bottom, out: r.left < sr.left - 1 || r.right > sr.right + 1 || r.top < sr.top - 1 }; }); });
      const bad = r.filter((x) => x.over || x.out); ok(r.length && !bad.length, `${w} §${sec} ${what}: ${JSON.stringify(bad.length ? bad : r)}`); };
    await check("default");
    const n = await viz.locator(".chip").count();
    for (let i = 0; i < n; i++) { const c = viz.locator(".chip").nth(i); const t = (await c.textContent()).trim(); await c.click(); await pg.waitForTimeout(sec === 3 ? 900 : 700); await check(t);
      if (shotDir && w === 1440 && sec === 0 && (t === "Cowling" || t === "Rudder")) { await pg.waitForTimeout(1200); const bb = await viz.boundingBox(); await pg.screenshot({ path: `${shotDir}/parts_${t.toLowerCase()}_1440x900.png`, clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, hh - bb.y) } }); } }
    const cv = await viz.locator(".stage canvas").boundingBox(); const sx = cv.x + cv.width * 0.3, sy = cv.y + cv.height * 0.5;
    await pg.mouse.move(sx, sy); await pg.mouse.down(); for (let i = 1; i <= 14; i++) { await pg.mouse.move(sx + i * 14, sy - i * 6); await pg.waitForTimeout(16); } await pg.mouse.up(); await pg.waitForTimeout(900); await check("after orbit");
  }
  ok(!errs.length, `${w}: console errors ${errs.join("; ")}`); console.log(`${w}x${hh}: ${checks} states checked`, errs.length ? "errors" : "no errors"); await ctx.close(); }
await b.close(); console.log(fail ? `FAIL (${fail})` : "PASS"); process.exit(fail ? 1 : 0);
