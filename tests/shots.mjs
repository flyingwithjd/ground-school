// Final screenshot set. Uses /tmp/seeded-state.json (from srs-persist.mjs) so Home and Blind spots show real progress.
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core"); import fs from "fs";
const OUT = "/workspace/pilot-ground-school/screenshots/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const storageState = fs.existsSync("/tmp/seeded-state.json") ? "/tmp/seeded-state.json" : undefined;
const shots = [
  ["ipad-portrait-1024x1366_home.png", 1024, 1366, "#/"],
  ["ipad-portrait-1024x1366_lesson-forces.png", 1024, 1366, "#/lesson/gl3/0", { viz: 1 }],
  ["ipad-landscape-1366x1024_metar-decoder.png", 1366, 1024, "#/lesson/gl8/1", { viz: 1, tap: 6 }],
  ["ipad-landscape-1366x1024_course.png", 1366, 1024, "#/course"],
  ["phone-390x844_cold-front.png", 390, 844, "#/lesson/gl7/5", { viz: 1 }],
  ["phone-390x844_quiz.png", 390, 844, "#/practice/gl4", { quiz: 1 }],
  ["phone-390x844_home.png", 390, 844, "#/"],
  ["desktop-1440x900_3d-airplane.png", 1440, 900, "#/lesson/gl1/0", { viz: 1, wait: 3500 }],
  ["desktop-1440x900_blind-spots.png", 1440, 900, "#/map"],
];
for (const [name, w, hh, r, o = {}] of shots) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, storageState }); const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); /* entry gate */  const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto("http://localhost:8765/index.html" + r); await pg.waitForTimeout(o.wait || 2000);
  if (o.viz) { await pg.evaluate(() => { const v = document.querySelector(".viz"); if (v) window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 70); }); await pg.waitForTimeout(2200); }
  if (o.tap) { const t = pg.locator(".mt-tok"); for (let i = 0; i < o.tap; i++) { await t.nth(i).click(); await pg.waitForTimeout(150); } }
  if (o.quiz) { const s = pg.locator("button", { hasText: /^(Start|Practice ahead)$/ }); if (await s.count()) { await s.first().click(); await pg.waitForTimeout(500); } await pg.locator(".choice").first().click(); await pg.waitForTimeout(300); }
  await pg.screenshot({ path: OUT + name }); console.log(name, errs.length ? errs.join("; ") : "ok"); await ctx.close(); }
await b.close();
