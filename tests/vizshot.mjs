// Screenshot one lesson section's viz at a given viewport: node tests/vizshot.mjs <route> <out.png> [w] [h] [js-before-shot]
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const [route, out, w = 744, hh = 1133, pre] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: +w, height: +hh }, hasTouch: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto("http://localhost:8765/index.html" + route); await pg.waitForTimeout(1500);
await pg.evaluate(() => { const v = document.querySelector(".viz"); if (v) window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 70); }); await pg.waitForTimeout(1200);
if (pre) { await pg.evaluate(pre); await pg.waitForTimeout(+process.env.WAIT || 1500); }
await pg.screenshot({ path: out }); console.log(out, errs.join("; ") || "ok"); await b.close();
