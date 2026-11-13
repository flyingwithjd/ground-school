// Play-while-you-watch check for the GL2 systems visuals: at phone 390x844 and iPad 744x1133, with the visual's top at the
// top of the viewport (just under the sticky header), the stage and every live slider must be fully on screen at once
// (above the fixed bottom nav), and so must every chip button, with no chip text cut off or scrolled sideways. Also checks that sliders come right after the stage, and that a vertical swipe starting
// on a horizontal chip row still scrolls the page. Usage: node tests/live-fit.mjs [sectionId ...]
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
const ALL = { catlim: "vg", ignition: "magcheck", fuellim: "fuellim", induct: "carbice", elec: "elecsys", oilcool: "enginegauges", mixture: "mixture", combust: "combustion", prop: "prop", secctl: "flaptypes", icing: "icing", oxygen: "hypoxia", koel: "koel", press: "pressurization", heat: "cabinheat", ap: "autopilot", airframe: "gear", starting: "starter" };
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
      // every chip button: fully on screen with the stage, and its text not cut off (no sideways scroll, no overflow)
      const cb = [...fig.querySelectorAll(".ctrl:not(.ctrl-live) .chip")].filter((e) => e.getBoundingClientRect().height);
      const offs = [], clip = [];
      cb.forEach((e) => { const q = e.getBoundingClientRect(), t = e.textContent.trim().slice(0, 24);
        if (q.top < hb - 1 || q.bottom > navTop + 1 || q.left < -1 || q.right > innerWidth + 1) offs.push(`${t} (${Math.round(q.top)}-${Math.round(q.bottom)})`);
        const par = e.parentElement.getBoundingClientRect();
        if (e.scrollWidth > e.clientWidth + 1 || q.right > par.right + 1 || q.left < par.left - 1) clip.push(t); });
      const rows = [...fig.querySelectorAll(".ctrl:not(.ctrl-live) .chips")].filter((c) => c.scrollWidth > c.clientWidth + 1).length;
      const live = v.querySelector(".ctrl-live"), chipCtrl = v.querySelector(".ctrl:not(.ctrl-live)");
      const chipsNext = !chipCtrl || getComputedStyle(chipCtrl).display === "none" || (live ? live.nextElementSibling === chipCtrl : after === chipCtrl);
      return { hb, navTop, figTop: fr.top, stTop: st.top, stBot: st.bottom, sl: sl.map((q) => [q.top, q.bottom]), firstAfter: after ? after.className : "", n: sl.length, nc: cb.length, offs, clip, rows, chipsNext }; }, type);
    if (!r) { ok(false, `${tag}: visual not found`); continue; }
    ok(Math.abs(r.figTop - r.hb) < 2 && r.stTop >= r.hb - 1 && r.stBot <= r.navTop + 1, `${tag}: stage on screen (${Math.round(r.stTop)}-${Math.round(r.stBot)} within ${Math.round(r.hb)}-${Math.round(r.navTop)})`);
    if (r.n) { const lo = Math.max(...r.sl.map((q) => q[1])); ok(lo <= r.navTop + 1, `${tag}: all ${r.n} slider(s) on screen with the stage (lowest ends ${Math.round(lo)}, room ${Math.round(r.navTop)})`); ok(/ctrl-live/.test(r.firstAfter), `${tag}: sliders come right after the stage`); }
    if (r.nc) { ok(!r.offs.length, `${tag}: all ${r.nc} chip(s) on screen with the stage${r.offs.length ? " — off: " + r.offs.slice(0, 4).join(", ") : ""}`);
      ok(!r.clip.length && !r.rows, `${tag}: no chip text cut off${r.clip.length ? " — " + r.clip.slice(0, 4).join(", ") : ""}${r.rows ? `, ${r.rows} sideways-scrolling row(s)` : ""}`); }
    ok(r.chipsNext, `${tag}: chip groups come right after the sliders (before any chart or readout)`);
    // a vertical swipe that starts on a chip row scrolls the page
    const chip = await pg.evaluate((type) => { const c = document.querySelector(`[data-viz="${type}"] .ctrl:not(.ctrl-live) .chips`); if (!c) return null; c.scrollIntoView({ block: "center" }); const q = c.getBoundingClientRect(); return { x: q.left + 30, y: q.top + q.height / 2, sy: scrollY }; }, type);
    if (chip) { await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: chip.x, y: chip.y }] }); for (let i = 1; i <= 8; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: chip.x, y: chip.y - i * 20 }] }); await pg.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await pg.waitForTimeout(500); const sy = await pg.evaluate(() => scrollY); ok(sy > chip.sy + 40, `${tag}: vertical swipe on a chip row scrolls the page (${Math.round(chip.sy)} -> ${Math.round(sy)})`); } }
  ok(!errs.length, `${w}: no page errors ${errs.slice(0, 2).join("; ")}`); await ctx.close(); }
await b.close(); console.log(bad ? `${bad} problem(s)` : "live fit: all good"); process.exit(bad ? 1 : 0);
