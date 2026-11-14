// Continuous-flow visuals (fuel, cabin heat, pressurization) must keep drawing while on screen and stop once scrolled off.
// Usage: node tests/idle-flow.mjs
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } else console.log("   ok   " + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} const raf = window.requestAnimationFrame.bind(window); window.__raf = 0; window.requestAnimationFrame = (f) => { window.__raf++; return raf(f); }; });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));

async function check(label, route, type) {
  await pg.goto(BASE + route); await pg.waitForTimeout(1500);
  await pg.evaluate((type) => { const v = document.querySelector(`[data-viz="${type}"]`); const tb = document.querySelector(".top"); if (v) window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 8)); }, type);
  // past the old "idle after a couple of seconds" failure: wait, then count frames
  await pg.waitForTimeout(3000);
  const on0 = await pg.evaluate(() => window.__raf); await pg.waitForTimeout(1500); const on1 = await pg.evaluate(() => window.__raf);
  const onFrames = on1 - on0;
  ok(onFrames >= 20, `${label}: on-screen after settle drew ${onFrames} frames in 1.5 s (need ≥ 20)`);
  await pg.evaluate((type) => { const v = document.querySelector(`[data-viz="${type}"]`); window.scrollTo(0, v.getBoundingClientRect().bottom + scrollY + 80); }, type);
  await pg.waitForTimeout(700);
  const off0 = await pg.evaluate(() => window.__raf); await pg.waitForTimeout(1500); const off1 = await pg.evaluate(() => window.__raf);
  ok(off1 - off0 <= 2, `${label}: off-screen drew ${off1 - off0} frames in 1.5 s`);
}

await check("fuel", "#/lesson/gl2/fuel", "fuel3d");
await check("heat", "#/lesson/gl2/heat", "heat3d");
await check("press", "#/lesson/gl2/press", "press3d");
ok(!errs.length, "page errors: " + errs.slice(0, 3).join(" | "));
await b.close();
console.log(bad ? `${bad} problem(s)` : "idle flow: all good");
process.exit(bad ? 1 : 0);
