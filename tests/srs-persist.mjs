// Answers questions through the UI, reloads, and checks the SRS state survived. Optional SHOTDIR saves home-screen shots after seeding.
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core");
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 } }); const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); /* entry gate */ 
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto((process.env.BASE || "http://localhost:8765/index.html") + "#/practice/gl3"); await pg.waitForTimeout(1500);
const startBtn = pg.locator("button", { hasText: /^(Start|Practice ahead)$/ }); if (await startBtn.count()) { await startBtn.first().click(); await pg.waitForTimeout(400); }
let answered = 0;
for (let i = 0; i < 8; i++) {
  const ch = pg.locator(".choice:not([disabled])"); if (!(await ch.count())) break;
  await ch.nth(i % 2 ? 0 : (await ch.count()) - 1).click();
  const conf = pg.locator(".conf .chip"); if (await conf.count()) await conf.nth(i % 3).click(); else await pg.locator("button", { hasText: "Check" }).click();
  answered++; await pg.waitForTimeout(250);
  const nx = pg.locator("button", { hasText: /^(Next|Finish)$/ }); if (await nx.count()) await nx.first().click(); await pg.waitForTimeout(250);
}
await pg.waitForTimeout(500);
const before = await pg.evaluate(() => JSON.parse(localStorage.getItem("ppg.v1") || "{}"));
await pg.reload(); await pg.waitForTimeout(1200);
const after = await pg.evaluate(() => JSON.parse(localStorage.getItem("ppg.v1") || "{}"));
const items = (s) => Object.keys(s.items || s.cards || s.srs || {}).length;
console.log("answered", answered, "items before", items(before), "after reload", items(after), "identical", JSON.stringify(before) === JSON.stringify(after));
console.log("top-level keys", Object.keys(after).join(","));
await pg.goto((process.env.BASE || "http://localhost:8765/index.html") + "#/"); await pg.waitForTimeout(1500);
console.log("home:", (await pg.textContent("main"))?.replace(/\s+/g, " ").slice(0, 400));
await ctx.storageState({ path: "/tmp/seeded-state.json" });
console.log(errs.length ? errs.join("\n") : "no page errors"); await b.close();
