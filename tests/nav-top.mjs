// Every new page starts at the top: at phone 390x844, scroll to the bottom of a lesson section, tap Next (or Previous, or a
// step dash), and check the page is at scrollY 0 once it settles; also for hash routes (course -> lesson, lesson -> lesson).
// A deliberate in-page glossary jump (#/glossary/<term>) still scrolls to its row. Usage: node tests/nav-top.mjs [lessonId ...]
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
const want = process.argv.slice(2).length ? process.argv.slice(2) : ["gl1", "gl2", "fw1"];
let bad = 0, n = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log("   FAIL " + m); } };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
const y = () => pg.evaluate(() => Math.round(scrollY));
const bottom = () => pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
for (const id of want) {
  await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/" + id + "/0"); await pg.waitForTimeout(1200);
  const steps = await pg.evaluate(() => document.querySelectorAll(".steps button").length);
  for (let i = 0; i < Math.min(steps - 1, 8); i++) {
    await bottom(); await pg.waitForTimeout(250);
    const nx = pg.locator(".pg-next, [class*=next]").filter({ hasText: /Next/ }).first(); if (!(await nx.count())) { ok(false, `${id} ${i}: no Next button`); break; }
    await nx.click(); for (const t of [60, 400, 1200]) { await pg.waitForTimeout(t === 60 ? 60 : t - 60); }
    const sy = await y(); ok(sy === 0, `${id}: after Next from section ${i}, scrollY ${sy}`);
  }
  // Previous and a step dash
  await bottom(); await pg.waitForTimeout(250); const pv = pg.locator("[class*=prev]").filter({ hasText: /Previous/ }).first();
  if (await pv.count()) { await pv.click(); await pg.waitForTimeout(1200); const sy = await y(); ok(sy === 0, `${id}: after Previous, scrollY ${sy}`); }
  await bottom(); await pg.waitForTimeout(250); await pg.evaluate(() => document.querySelectorAll(".steps button")[1].click()); await pg.waitForTimeout(1200); ok((await y()) === 0, `${id}: after a step dash, scrollY ${await y()}`);
  // hash route change from the bottom of a page
  await bottom(); await pg.waitForTimeout(250); await pg.evaluate(() => { location.hash = "#/course"; }); await pg.waitForTimeout(1000); ok((await y()) === 0, `${id}: lesson -> course, scrollY ${await y()}`);
  await bottom(); await pg.waitForTimeout(250); await pg.evaluate((id) => { location.hash = "#/lesson/" + id + "/2"; }, id); await pg.waitForTimeout(1200); ok((await y()) === 0, `${id}: course -> lesson section 2, scrollY ${await y()}`);
  // back button
  await bottom(); await pg.waitForTimeout(250); await pg.goBack(); await pg.waitForTimeout(1000); ok((await y()) === 0, `${id}: browser Back, scrollY ${await y()}`);
}
// deliberate in-page jump still works
await pg.goto(BASE + "#/glossary/Blade-angle"); await pg.waitForTimeout(1800); ok((await y()) > 100, `glossary deep link still scrolls to its entry (scrollY ${await y()})`);
ok(!errs.length, "no page errors " + errs.slice(0, 2).join("; "));
await b.close(); console.log(bad ? `${bad} of ${n} problem(s)` : `nav top: all ${n} good`); process.exit(bad ? 1 : 0);
