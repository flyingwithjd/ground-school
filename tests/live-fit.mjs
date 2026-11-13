// Play-while-you-watch check for the GL2 systems visuals: at phone 390x844 and iPad 744x1133, with the visual's top at the
// top of the viewport (just under the sticky header), the stage and every live slider must be fully on screen at once
// (above the fixed bottom nav). Also checks that sliders come right after the stage, and that a vertical swipe starting
// on a horizontal chip row still scrolls the page. Usage: node tests/live-fit.mjs [sectionId ...]
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
const ALL = { secctl: "flaptypes", prop: "prop", mixture: "mixture", induct: "carbice", combust: "combustion", ignition: "magcheck", starting: "starter", catlim: "vg", fuellim: "fuellim", oxygen: "hypoxia", press: "pressurization" };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? "   ok   " : "   FAIL ") + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [w, hh] of [[390, 844], [744, 1133]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: w < 500 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); const cdp = await ctx.newCDPSession(pg);
  for (const sec of want) { const type = ALL[sec], tag = `${type} @ ${w}x${hh}`;
    await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl2/" + sec); await pg.waitForTimeout(1300);
    const r = await pg.evaluate((type) => { const v = document.querySelector(`[data-viz="${type}"]`); if (!v) return null; const fig = v.querySelector("figure.viz") || v;
      const top = document.querySelector(".top"), nav = document.querySelector(".nav"); const hb = top ? top.getBoundingClientRect().height : 0;
      window.scrollTo(0, fig.getBoundingClientRect().top + scrollY - hb);
      const navTop = nav && getComputedStyle(nav).position === "fixed" ? nav.getBoundingClientRect().top : innerHeight;
      const st = v.querySelector(".stage").getBoundingClientRect(), fr = fig.getBoundingClientRect();
      const sl = [...v.querySelectorAll('input[type="range"]')].map((e) => e.getBoundingClientRect()).filter((q) => q.height);
      const after = v.querySelector(".stage").nextElementSibling;
      return { hb, navTop, figTop: fr.top, stTop: st.top, stBot: st.bottom, sl: sl.map((q) => [q.top, q.bottom]), firstAfter: after ? after.className : "", n: sl.length }; }, type);
    if (!r) { ok(false, `${tag}: visual not found`); continue; }
    ok(Math.abs(r.figTop - r.hb) < 2 && r.stTop >= r.hb - 1 && r.stBot <= r.navTop + 1, `${tag}: stage on screen (${Math.round(r.stTop)}-${Math.round(r.stBot)} within ${Math.round(r.hb)}-${Math.round(r.navTop)})`);
    if (r.n) { const lo = Math.max(...r.sl.map((q) => q[1])); ok(lo <= r.navTop + 1, `${tag}: all ${r.n} slider(s) on screen with the stage (lowest ends ${Math.round(lo)}, room ${Math.round(r.navTop)})`); ok(/ctrl-live/.test(r.firstAfter), `${tag}: sliders come right after the stage`); }
    // a vertical swipe that starts on a chip row scrolls the page
    const chip = await pg.evaluate((type) => { const c = document.querySelector(`[data-viz="${type}"] .ctrl:not(.ctrl-live) .chips`); if (!c) return null; c.scrollIntoView({ block: "center" }); const q = c.getBoundingClientRect(); return { x: q.left + 30, y: q.top + q.height / 2, sy: scrollY }; }, type);
    if (chip) { await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: chip.x, y: chip.y }] }); for (let i = 1; i <= 8; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: chip.x, y: chip.y - i * 20 }] }); await pg.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await pg.waitForTimeout(500); const sy = await pg.evaluate(() => scrollY); ok(sy > chip.sy + 40, `${tag}: vertical swipe on a chip row scrolls the page (${Math.round(chip.sy)} -> ${Math.round(sy)})`); } }
  ok(!errs.length, `${w}: no page errors ${errs.slice(0, 2).join("; ")}`); await ctx.close(); }
await b.close(); console.log(bad ? `${bad} problem(s)` : "live fit: all good"); process.exit(bad ? 1 : 0);
