// Screenshot a GL2 visual with its top at the top of the screen: node tests/fitshot.mjs <sectionId> <vizType> <out.png> [w] [h] [js-before-shot]
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const [sec, type, out, w = 390, hh = 844, pre] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: +w, height: +hh }, hasTouch: true, isMobile: +w < 500, deviceScaleFactor: 2 }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await pg.goto((process.env.BASE || "http://localhost:8765/index.html") + "#/lesson/gl2/" + sec); await pg.waitForTimeout(1500);
const top = () => pg.evaluate((t) => { const v = document.querySelector(`[data-viz="${t}"]`); const f = v.querySelector("figure.viz") || v; const tb = document.querySelector(".top"); window.scrollTo(0, f.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 0)); }, type);
await top(); await pg.waitForTimeout(800);
if (pre) { await pg.evaluate(pre); await pg.waitForTimeout(+process.env.WAIT || 1800); await top(); await pg.waitForTimeout(600); }
await pg.screenshot({ path: out }); console.log(out, errs.join("; ") || "ok"); await b.close();
