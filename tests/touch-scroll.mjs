// Touch scrolling over visuals (iPad 744x1133, touch emulation).
// Part 1: real touch swipes (CDP Input.dispatchTouchEvent, which goes through the browser's touch-action handling) must scroll the page when they start
//         on static visuals: the GL2 airspeed dial, the blank area beside the chair-fly buttons, and the pitot-static trainer.
// Part 2 (--audit): every route, every element whose computed touch-action blocks vertical panning must be a real drag surface:
//         an OrbitControls canvas or a .pad control. Anything else is reported.
import { createRequire } from "module"; import { execSync } from "child_process";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 744, height: 1133 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const cdp = await ctx.newCDPSession(pg); let bad = 0; const ok = (c, m) => { console.log((c ? "   ok   " : "   FAIL ") + m); if (!c) bad++; };
async function swipeFrom(x, y) { const y0 = await pg.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 12; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - i * 20 }] }); await pg.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await pg.waitForTimeout(500);
  return (await pg.evaluate(() => scrollY)) - y0; }
async function open(route, sel) { await pg.goto(BASE + route); await pg.waitForTimeout(1500); await pg.waitForSelector(sel, { timeout: 8000 });
  await pg.evaluate((s) => { const v = document.querySelector(s); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 120); }, sel); await pg.waitForTimeout(700); }
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
if (!process.argv.includes("--audit-only")) {
  // GL2 "The numbers on the dial": swipe up starting on the dial face
  await open("#/lesson/gl2/limits", ".viz.vspd .stage");
  let r = await pg.locator(".viz.vspd .stage").boundingBox(); ok((await swipeFrom(r.x + r.width / 2, r.y + Math.min(r.height * 0.45, 500))) > 100, "GL2 airspeed dial (vspeeds): swipe on the dial scrolls the page");
  // Before start: blank stage area right of the item buttons
  await open("#/lesson/fw1/start", ".viz.chairfly .stage");
  const pt = await pg.evaluate(() => { const st = document.querySelector(".viz.chairfly .stage"), R = st.getBoundingClientRect();
    for (let y = R.top + 20; y < Math.min(R.bottom, innerHeight) - 20; y += 12) for (let x = R.right - 20; x > R.left + 20; x -= 12) { const e = document.elementFromPoint(x, y); if (e && !e.closest("button,a,input,[role=slider]")) return [x, y]; } return null; });
  ok(!!pt, "Before start: found blank area in the chair-fly visual"); if (pt) ok((await swipeFrom(pt[0], pt[1])) > 100, `Before start: swipe on blank area (${pt.map(Math.round)}) scrolls the page`);
  // Pitot-static trainer gauges
  await open("#/lesson/gl2/pitot", ".viz.px .stage");
  r = await pg.locator(".viz.px .stage").boundingBox(); ok((await swipeFrom(r.x + r.width / 2, r.y + r.height * 0.3)) > 100, "GL2 pitot-static: swipe on the gauges scrolls the page");
  // A real 3D orbit view still captures the drag on its canvas, while its title band scrolls
  await open("#/lesson/gl1/0", ".viz canvas");
  const orb = await pg.evaluate(() => { const c = [...document.querySelectorAll(".viz canvas")].find((c) => c.style.touchAction === "none"); if (!c) return null; const R = c.getBoundingClientRect(), S = c.closest(".stage").getBoundingClientRect(); return { cx: R.left + R.width / 2, cy: R.top + R.height / 2, band: R.top - S.top, sx: S.left + 30, sy: S.top + 8 }; });
  ok(!!orb, "GL1 3D airplane: orbit canvas keeps touch-action:none");
  if (orb) { ok(Math.abs(await swipeFrom(orb.cx, orb.cy)) < 20, "GL1 3D airplane: swipe on the model orbits instead of scrolling"); }
}
if (process.argv.includes("--audit") || process.argv.includes("--audit-only")) {
  const routes = execSync("node tests/routes.mjs", { cwd: new URL("..", import.meta.url).pathname }).toString().trim().split("\n");
  const found = new Map();
  for (const rt of routes) {
    try { await pg.goto(BASE + rt); await pg.waitForTimeout(900);
      // bring each visual on screen so lazily mounted ones start
      const n = await pg.evaluate(() => document.querySelectorAll(".viz").length);
      for (let i = 0; i < n; i++) { await pg.evaluate((i) => document.querySelectorAll(".viz")[i]?.scrollIntoView({ block: "center" }), i); await pg.waitForTimeout(350); }
      const hits = await pg.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => { const t = getComputedStyle(e).touchAction; if (!t || t === "auto" || t === "manipulation" || /pan-y/.test(t)) return false; const R = e.getBoundingClientRect(); return R.width > 0 && R.height > 0; })
        .filter((e) => !(e.tagName === "CANVAS" && e.style.touchAction === "none") && !e.classList.contains("pad") && !e.closest(".pad"))
        .map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join(".")} [${getComputedStyle(e).touchAction}] in ${e.closest(".viz")?.className || "page"}`));
      for (const hh of hits) { if (!found.has(hh)) found.set(hh, []); found.get(hh).push(rt); }
    } catch (e) { console.log("   route error", rt, String(e.message).slice(0, 80)); }
  }
  console.log(`audited ${routes.length} routes`); for (const [k, v] of found) { bad++; console.log("   BLOCKS SCROLL", k, "on", v.slice(0, 6).join(" "), v.length > 6 ? `(+${v.length - 6})` : ""); }
}
ok(!errs.length, "no page errors" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
await b.close(); console.log(bad ? `${bad} problem(s)` : "touch scroll: all good"); process.exit(bad ? 1 : 0);
