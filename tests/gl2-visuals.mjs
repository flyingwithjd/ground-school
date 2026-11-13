// GL2 systems visuals (V-g, ignition, fuel limits, carb ice, electrical, engine gauges, mixture, combustion, propeller, flap and tab types) at iPad 744x1133 (touch), phone 390x844
// and desktop 1440x900. For each visual: tap every control and check that no two SVG labels overlap, every label stays inside
// the stage, and labels are at least 11 px; the page never throws; once settled the visual draws zero frames (idle);
// and at iPad size a touch swipe that starts on the visual scrolls the page. Usage: node tests/gl2-visuals.mjs [sectionId ...]
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
const ALL = { catlim: "vg", ignition: "magcheck", fuellim: "fuellim", induct: "carbice", elec: "elecsys", oilcool: "enginegauges", mixture: "mixture", combust: "combustion", prop: "prop", secctl: "flaptypes", icing: "icing", oxygen: "hypoxia", koel: "koel", press: "pressurization", heat: "cabinheat", ap: "autopilot", airframe: "gear", starting: "starter" };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);
const SIZES = [[744, 1133, true], [390, 844, true], [1440, 900, false]];
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const overlaps = (pg, type) => pg.evaluate((type) => { const v = document.querySelector(`[data-viz="${type}"]`); if (!v) return ["visual not found"]; const out = [];
  const st = v.querySelector(".stage").getBoundingClientRect();
  const tx = [...v.querySelectorAll(".stage svg text")].filter((e) => e.textContent.trim() && e.getAttribute("opacity") !== "0").map((e) => ({ t: e.textContent, r: e.getBoundingClientRect(), fs: parseFloat(e.getAttribute("font-size") || "12") }));
  for (const a of tx) { if (a.r.right > st.right + 1 || a.r.left < st.left - 1 || a.r.top < st.top - 1 || a.r.bottom > st.bottom + 1) out.push(`"${a.t}" outside the stage`); if (a.fs < 11) out.push(`"${a.t}" font ${a.fs}px`); }
  const corners = [...v.querySelectorAll(".stage > .corner")].filter((e) => e.textContent.trim()).map((e) => ({ t: e.textContent, r: e.getBoundingClientRect() }));
  const all = tx.concat(corners);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i].r, c = all[j].r; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(`"${all[i].t}" overlaps "${all[j].t}"`); }
  return out; }, type);
for (const [w, h, touch] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch && w < 500 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} const raf = window.requestAnimationFrame.bind(window); window.__raf = 0; window.requestAnimationFrame = (f) => { window.__raf++; return raf(f); }; });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); const cdp = touch ? await ctx.newCDPSession(pg) : null;
  for (const sec of want) { const type = ALL[sec]; const tag = `${type} @ ${w}`;
    await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl2/" + sec); await pg.waitForTimeout(1200);
    await pg.evaluate((type) => { const v = document.querySelector(`[data-viz="${type}"]`); v && window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 70); }, type); await pg.waitForTimeout(900);
    const probs = new Set((await overlaps(pg, type)).map((p) => "[start] " + p));
    const n = await pg.evaluate((type) => [...document.querySelector(`[data-viz="${type}"]`).querySelectorAll(".ctrl button")].length, type);
    for (let i = 0; i < n; i++) { const name = await pg.evaluate(([type, i]) => { const bt = document.querySelector(`[data-viz="${type}"]`).querySelectorAll(".ctrl button")[i]; if (!bt || bt.disabled || !bt.offsetParent) return null; bt.click(); return bt.textContent.trim(); }, [type, i]);
      if (name == null) continue; await pg.waitForTimeout(type === "magcheck" ? 1900 : 450); for (const p of await overlaps(pg, type)) probs.add(`[${name}] ${p}`); }
    for (const p of probs) ok(false, `${tag}: ${p}`);
    // idle: back to a fresh mount, let it settle, then count animation frames
    await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl2/" + sec); await pg.waitForTimeout(1000);
    await pg.evaluate((type) => { const v = document.querySelector(`[data-viz="${type}"]`); v && window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 70); }, type);
    if (type === "carbice") await pg.evaluate(() => { const s = [...document.querySelectorAll('[data-viz="carbice"] input[type=range]')][1]; s.value = 30; s.dispatchEvent(new Event("input")); });
    await pg.waitForTimeout(type === "carbice" ? 3500 : 3000); const f0 = await pg.evaluate(() => window.__raf); await pg.waitForTimeout(1500); const f1 = await pg.evaluate(() => window.__raf);
    ok(f1 - f0 <= 1, `${tag}: idle visual still drew ${f1 - f0} frames in 1.5 s`);
    if (touch && w === 744) { const r = await pg.evaluate((type) => { const s = document.querySelector(`[data-viz="${type}"] .stage`).getBoundingClientRect(); return { x: s.left + s.width * 0.08, y: Math.min(s.top + s.height * 0.6, innerHeight - 260) }; }, type);
      const y0 = await pg.evaluate(() => scrollY); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: r.x, y: r.y }] });
      for (let k = 1; k <= 12; k++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: r.x, y: r.y - k * 20 }] }); await pg.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await pg.waitForTimeout(500);
      ok((await pg.evaluate(() => scrollY)) - y0 > 100, `${tag}: a swipe on the visual should scroll the page`); }
    console.log(`${tag}: ${probs.size ? probs.size + " layout problem(s)" : "ok"}`);
  }
  ok(!errs.length, `${w}: page errors: ${errs.slice(0, 3).join(" | ")}`); await ctx.close();
}
await b.close(); console.log(bad ? `${bad} problem(s)` : "gl2 visuals: all good"); process.exit(bad ? 1 : 0);
