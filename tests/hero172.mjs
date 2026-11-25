// First-visit screen: Begin stays visible on a phone, the turning 172 draws at <= 30 fps on screen, 0 off screen, 0 with reduced motion.
// Usage: node tests/hero172.mjs
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } else console.log("   ok   " + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const init = () => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} window.__draws = 0; for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) if (C) { const f = C.prototype.clear; C.prototype.clear = function (...a) { window.__draws++; return f.apply(this, a); }; } };
for (const [w, hgt, rm] of [[390, 844, false], [360, 640, false], [1100, 800, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: hgt }, hasTouch: w < 700, isMobile: w < 700, reducedMotion: rm ? "reduce" : "no-preference" });
  const pg = await ctx.newPage(); await pg.addInitScript(init); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(BASE + "#/"); await pg.waitForSelector(".hero172 canvas", { timeout: 20000 }); await pg.waitForTimeout(2500);
  const L = `${w}x${hgt}${rm ? " reduced" : ""}`;
  const r = await pg.evaluate(() => { const b = document.getElementById("begin").getBoundingClientRect(), f = document.querySelector(".hero172").getBoundingClientRect(); return { bb: b.bottom, ih: innerHeight, ft: f.top, bt: b.top }; });
  ok(r.bt >= 0 && r.bb <= r.ih, `${L}: Begin visible without scrolling (bottom ${Math.round(r.bb)} of ${r.ih})`);
  ok(r.ft > r.bb, `${L}: model sits below the Begin button`);
  const d0 = await pg.evaluate(() => window.__draws); await pg.waitForTimeout(2000); const d1 = await pg.evaluate(() => window.__draws); const fps = (d1 - d0) / 2;
  if (rm) ok(d1 - d0 === 0, `${L}: still (${d1 - d0} draws in 2 s)`); else ok(fps >= 10 && fps <= 31, `${L}: on screen ${fps} draws/s (cap 30)`);
  await pg.evaluate(() => window.scrollTo(0, document.querySelector(".hero172").getBoundingClientRect().bottom + scrollY + 40)); await pg.waitForTimeout(700);
  const o0 = await pg.evaluate(() => window.__draws); await pg.waitForTimeout(1500); const o1 = await pg.evaluate(() => window.__draws);
  ok(o1 - o0 === 0 || rm, `${L}: off screen ${o1 - o0} draws in 1.5 s`);
  await pg.evaluate(() => (location.hash = "#/course")); await pg.waitForTimeout(800);
  const g0 = await pg.evaluate(() => window.__draws); await pg.waitForTimeout(1200); const g1 = await pg.evaluate(() => window.__draws);
  ok(g1 - g0 === 0, `${L}: after leaving home ${g1 - g0} draws`);
  ok(!errs.length, `${L}: no page errors ${errs.join(" | ")}`);
  await ctx.close();
}
await b.close(); console.log(bad ? `hero172: ${bad} problem(s)` : "hero172: all good"); process.exit(bad ? 1 : 0);
