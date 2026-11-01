// Usage: node tests/smoke.mjs [route ...]  (needs playwright-core from /workspace/pgs-build and a local server on :8765)
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core");
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["#/"];
const vp = { width: +(process.env.W || 1366), height: +(process.env.H || 1024) };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errs = []; let pg; const fresh = async () => { if (pg) await pg.close().catch(() => {}); pg = await b.newPage({ viewport: vp, deviceScaleFactor: 1 }); pg.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); }); pg.on("pageerror", (e) => errs.push("pageerror: " + e.message)); };
for (const r of routes) { await fresh(); await pg.goto("http://localhost:8765/index.html" + r); await pg.waitForTimeout(+(process.env.WAIT || 2500));
  if (process.env.VIZ) { await pg.evaluate(() => { const v = document.querySelector(".viz"); if (v) window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 20); }); await pg.waitForTimeout(1800); }
  if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT.replace("%", r.replace(/[^\w]+/g, "_")), fullPage: !!process.env.FULL });
  console.log("ROUTE", r, "title:", (await pg.textContent("h1").catch(() => "-"))?.slice(0, 60)); }
console.log(errs.length ? errs.join("\n") : "no console errors"); await b.close();
