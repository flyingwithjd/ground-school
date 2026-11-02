// Now page first visit: with no answers, one clear Begin above the fold (not under the bottom nav) and no empty progress cards.
// After one answered question, the progress layout (due / weakest / next lesson, readiness) shows.
// Usage: node tests/now-start.mjs [SHOTDIR]   (sizes 1440x900, 1024x768, 820x1180, 390x844)
import { createRequire } from "module";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/"; const shotDir = process.argv[2];
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const sizes = [[1440, 900], [1024, 768], [820, 1180], [390, 844]];
const mk = async (W, H) => { const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 1100, isMobile: W < 500 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); return { ctx, pg, errs }; };
const cards = (pg) => pg.evaluate(() => [...document.querySelectorAll("main .label")].map((e) => e.textContent.trim()).filter((t) => /Due for review|Weakest area|Next lesson|readiness/i.test(t)));
for (const [W, H] of sizes) {
  const { ctx, pg, errs } = await mk(W, H); await pg.goto(BASE + "#/"); await pg.waitForSelector("#begin"); await pg.waitForTimeout(900);
  const r = await pg.evaluate(() => { const b = document.getElementById("begin").getBoundingClientRect(); const n = document.getElementById("nav"); const nr = n ? n.getBoundingClientRect() : null;
    const bottomNav = nr && nr.top > innerHeight / 2 ? nr.top : innerHeight; return { top: b.top, bottom: b.bottom, h: b.height, limit: bottomNav, href: document.getElementById("begin").getAttribute("href"), txt: document.getElementById("begin").textContent.trim(), sy: scrollY, h1: document.querySelector("main h1").textContent.trim() }; });
  ok(r.sy === 0 && r.top > 0 && r.bottom <= r.limit - 8, `${W}x${H}: Begin not above the fold (bottom ${Math.round(r.bottom)} vs ${Math.round(r.limit)})`);
  ok(r.h >= 44, `${W}x${H}: Begin too small`); ok(r.txt === "Begin", `${W}x${H}: button text "${r.txt}"`); ok(r.href === "#/lesson/gl1/0", `${W}x${H}: Begin goes to ${r.href}`);
  ok(r.h1 === "Learn it. Squawk it.", `${W}x${H}: headline "${r.h1}"`);
  const c = await cards(pg); ok(!c.length, `${W}x${H}: progress cards shown on first visit: ${c.join(", ")}`);
  if (shotDir && (W === 1440 || W === 390)) await pg.screenshot({ path: `${shotDir}/now_fresh_${W}x${H}.png` });
  if (W === 1440) {
    await pg.click("#begin"); await pg.waitForTimeout(800); ok(/#\/lesson\/gl1\/0$/.test(pg.url()), "Begin did not open GL1 section 0: " + pg.url());
    // answer one question, then the progress layout comes back
    await pg.goto(BASE + "#/practice/gl1"); await pg.waitForTimeout(1200);
    const st = pg.locator("button", { hasText: /^(Start|Practice ahead)$/ }); if (await st.count()) { await st.first().click(); await pg.waitForTimeout(400); }
    await pg.locator(".choice:not([disabled])").first().click(); const conf = pg.locator(".conf .chip"); if (await conf.count()) await conf.first().click(); else await pg.locator("button", { hasText: "Check" }).click();
    await pg.waitForTimeout(500); await pg.goto(BASE + "#/"); await pg.reload(); await pg.waitForTimeout(1200);
    ok(await pg.evaluate(() => Object.values(JSON.parse(localStorage.getItem("ppg.v1")).items).some((i) => i.n > 0)), "answer not stored");
    const c2 = await cards(pg); ok(c2.some((t) => /Due for review/.test(t)) && c2.some((t) => /Weakest area/.test(t)) && c2.some((t) => /readiness/i.test(t)), "progress cards missing after an answer: " + c2.join(", "));
    ok(!(await pg.locator("#begin").count()), "first-visit hero still shown after an answer");
    if (shotDir) await pg.screenshot({ path: `${shotDir}/now_progress_${W}x${H}.png` });
  }
  ok(!errs.length, `${W}x${H}: page errors ${errs.join(" | ")}`); await ctx.close();
}
console.log("now-start: " + (fails.length ? "FAIL\n  " + fails.join("\n  ") : "ALL PASS")); await b.close(); process.exit(fails.length ? 1 : 0);
