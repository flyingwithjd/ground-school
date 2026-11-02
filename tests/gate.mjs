// Entry gate: blocks every route (deep links too) until the access code is entered, then remembers this device.
// Usage: node tests/gate.mjs [width height] [shot.png]
import { createRequire } from "module"; import { readFileSync, readdirSync } from "fs";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const [w = 1440, hh = 900, shot] = process.argv.slice(2); const W = +w, H = +hh;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 1100, isMobile: W < 500 }); const pg = await ctx.newPage();
const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const vis = (sel) => pg.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0; }, sel);
// first paint: the gate is there and nothing else is (checked as soon as the DOM exists, before modules run)
await pg.goto("http://localhost:8765/#/lesson/gl1/2", { waitUntil: "commit" }); await pg.waitForSelector("#gate", { state: "attached" });
ok(await pg.evaluate(() => document.documentElement.classList.contains("locked")), "html not locked at first paint");
await pg.waitForLoadState("load"); await pg.waitForTimeout(500);
ok(await vis("#gate"), "gate not visible"); ok(!(await vis("#main")), "main visible while locked"); ok(!(await vis("#nav")), "nav visible while locked");
ok(await pg.evaluate(() => !document.getElementById("main").children.length), "route rendered behind the gate");
ok(await pg.evaluate(() => document.activeElement && document.activeElement.id === "gate-code"), "input not focused");
ok(await pg.evaluate(() => parseFloat(getComputedStyle(document.getElementById("gate-code")).fontSize) >= 16), "input font < 16px (iOS zoom)");
ok(await pg.evaluate(() => !!document.querySelector('meta[name=robots][content*=noindex]')), "no robots noindex meta");
await pg.fill("#gate-code", "nope"); await pg.press("#gate-code", "Enter"); await pg.waitForTimeout(200);
ok((await pg.textContent(".gate-err")).trim().length > 0, "no error on wrong code"); ok(await vis("#gate"), "wrong code unlocked");
ok(await pg.evaluate(() => localStorage.getItem("sqs.access") == null), "flag set on wrong code");
await pg.fill("#gate-code", "  TestPilot "); await pg.press("#gate-code", "Enter"); await pg.waitForTimeout(800);
ok(!(await vis("#gate")), "gate still visible after right code"); ok(await vis("#main") && await vis("#nav"), "site not shown after unlock");
ok(await pg.evaluate(() => location.hash === "#/lesson/gl1/2" && document.getElementById("main").children.length > 0), "deep link not rendered after unlock");
ok(await pg.evaluate(() => localStorage.getItem("sqs.access") === "1"), "flag not stored");
await pg.reload(); await pg.waitForTimeout(800); ok(!(await vis("#gate")) && await vis("#main"), "asked again after reload");
// the plain code never ships as a readable string
const files = ["index.html", ...readdirSync("js", { recursive: true }).filter((f) => f.endsWith(".js")).map((f) => "js/" + f)];
ok(!files.some((f) => /testpilot/i.test(readFileSync(f, "utf8"))), "plain access code found in shipped files");
if (shot) { const p2 = await (await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 1100, isMobile: W < 500 })).newPage(); await p2.goto("http://localhost:8765/"); await p2.waitForTimeout(700); await p2.screenshot({ path: shot }); }
ok(!errs.length, "page errors: " + errs.join(" | "));
console.log(`${W}px gate: ` + (fails.length ? "FAIL\n  " + fails.join("\n  ") : "ALL PASS")); await b.close(); process.exit(fails.length ? 1 : 0);
