// Usage: [WIDTHS=1440,744] node tests/corner-clear.mjs [SHOTDIR] — in the 172S parts explorer and feature tour (GL1, found by content), the corner labels
// ("Cessna 172S", span/length, tour readouts) sit in a band above the 3D canvas, so they never cover the model: after every part button,
// every tour step and an orbit drag, at 1440, 1024, 820, 744 and 390. GL1 §2: the in-stage "Show a dent" button (Monocoque only) never covers
// the airplane or a label, toggles Show a dent / Hide dent and never moves. Also: no console errors.
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html", shotDir = process.argv[2];
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log("   FAIL", m); } };
// GL1 sections move when supplement sections are interleaved, so find the parts explorer and the feature tour by content, not index.
// Split long runs with WIDTHS=1440,1024 (default: all five) so each part finishes well within a 300 s timeout.
const ALLW = [[1440, 900], [1024, 768], [820, 1180], [744, 1133], [390, 844]], WANT = (process.env.WIDTHS || "").split(",").filter(Boolean).map(Number);
const SECS = await (async () => { const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const out = []; for (let i = 0; i < 20 && out.length < 2; i++) { await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl1/" + i); await pg.waitForTimeout(900);
    if (await pg.evaluate(() => !!document.querySelector('[data-viz="plane3d"] .stage[data-band]') && !!document.querySelector('[data-viz="plane3d"] .chip'))) out.push(i); }
  await pg.context().close(); return out; })();
ok(SECS.length === 2, "found the GL1 parts explorer and feature tour sections: " + JSON.stringify(SECS)); console.log("GL1 sections with corner bands:", SECS.join(", "));
for (const [w, hh] of ALLW.filter(([w]) => !WANT.length || WANT.includes(w))) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, isMobile: w < 700, hasTouch: w < 1100 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  let checks = 0;
  for (const sec of SECS) {
    await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl1/" + sec); await pg.waitForTimeout(2200);
    const viz = pg.locator(".viz").filter({ has: pg.locator(".stage[data-band]") }).first();
    await viz.evaluate((v) => window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 90)); await pg.waitForTimeout(600);
    const check = async (what) => { checks++; const r = await viz.evaluate((v) => { const st = v.querySelector(".stage"), cv = st.querySelector("canvas").getBoundingClientRect(), sr = st.getBoundingClientRect();
        return [...st.querySelectorAll(".corner")].filter((c) => c.textContent.trim() && c.getBoundingClientRect().height).map((c) => { const r = c.getBoundingClientRect(); return { t: c.textContent, over: r.bottom > cv.top + 0.5 && r.top < cv.bottom, out: r.left < sr.left - 1 || r.right > sr.right + 1 || r.top < sr.top - 1 }; }); });
      const bad = r.filter((x) => x.over || x.out); ok(r.length && !bad.length, `${w} §${sec} ${what}: ${JSON.stringify(bad.length ? bad : r)}`); };
    await check("default");
    const n = await viz.locator(".chip").count();
    for (let i = 0; i < n; i++) { const c = viz.locator(".chip").nth(i); const t = (await c.textContent()).trim(); await c.click(); await pg.waitForTimeout(sec === SECS[1] ? 900 : 700); await check(t);
      if (shotDir && w === 1440 && sec === SECS[0] && (t === "Cowling" || t === "Rudder")) { await pg.waitForTimeout(1200); const bb = await viz.boundingBox(); await pg.screenshot({ path: `${shotDir}/parts_${t.toLowerCase()}_1440x900.png`, clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, hh - bb.y) } }); } }
    const cv = await viz.locator(".stage canvas").boundingBox(); const sx = cv.x + cv.width * 0.3, sy = cv.y + cv.height * 0.5;
    await pg.mouse.move(sx, sy); await pg.mouse.down(); for (let i = 1; i <= 14; i++) { await pg.mouse.move(sx + i * 14, sy - i * 6); await pg.waitForTimeout(16); } await pg.mouse.up(); await pg.waitForTimeout(900); await check("after orbit");
  }
  // GL1 §2 fuselage: the in-stage "Show a dent" button (Monocoque only) never covers the airplane or a label, and stays put when toggled
  if (w !== 1024) for (const _ of [0]) {
    await pg.goto("about:blank"); await pg.goto(BASE + "#/lesson/gl1/2"); await pg.waitForTimeout(2200);
    const fv = pg.locator('[data-viz="structure"] .viz'); await fv.evaluate((v) => window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 90)); await pg.waitForTimeout(500);
    const dchk = async (what, wantText) => { checks++; const r = await fv.evaluate((v) => { const st = v.querySelector(".stage"), sr = st.getBoundingClientRect(), b = st.querySelector(".fus-dent");
        if (!b || b.hidden || !b.offsetParent) return { vis: false }; const br = b.getBoundingClientRect(), [ml, mt, mr, mb] = (st.__mbox ? st.__mbox() : [0, 0, 0, 9999]);
        const hit = [...st.querySelectorAll(".fus-lab")].filter((e) => e.offsetParent).filter((e) => { const r = e.getBoundingClientRect(); return r.left < br.right - 1 && br.left < r.right - 1 && r.top < br.bottom - 1 && br.top < r.bottom - 1; }).map((e) => e.textContent);
        return { vis: true, text: b.textContent.trim(), pressed: b.getAttribute("aria-pressed"), x: Math.round(br.left - sr.left), y: Math.round(br.top - sr.top), w: Math.round(br.width), inside: br.left >= sr.left && br.right <= sr.right && br.top >= sr.top && br.bottom <= sr.bottom, under: st.__under ? st.__under(br.left - sr.left, br.right - sr.left) : mb, mb, hit }; });
      ok(r.vis && r.text === wantText && r.inside && !(r.y < r.under - 0.5) && !r.hit.length, `${w} dent ${what}: ${JSON.stringify(r)}`); return r; };
    for (const t of ["Truss", "Semimonocoque"]) { await fv.locator('[aria-label="Construction type"] .chip', { hasText: new RegExp("^" + t + "$") }).click(); await pg.waitForTimeout(600);
      checks++; ok(!(await fv.locator(".fus-dent").isVisible()), `${w} dent button hidden in ${t}`); }
    await fv.locator('[aria-label="Construction type"] .chip', { hasText: /^Monocoque$/ }).click(); await pg.waitForTimeout(1200);
    const a = await dchk("shown", "Show a dent");
    if (shotDir && (w === 1440 || w === 744)) { await pg.waitForTimeout(600); const bb = await fv.boundingBox(); await pg.screenshot({ path: `${shotDir}/dent_overlay_${w}x${hh}.png`, clip: { x: bb.x, y: Math.max(0, bb.y), width: bb.width, height: Math.min(bb.height, hh - Math.max(0, bb.y)) } }); }
    await fv.locator(".fus-dent").click(); await pg.waitForTimeout(900); const c = await dchk("on", "Hide dent");
    ok(c.pressed === "true" && /DENT/.test(await fv.locator(".stage").textContent()), `${w} dent on: pressed + DENT label`); ok(a.x === c.x && a.y === c.y && a.w === c.w, `${w} dent button did not move ${JSON.stringify([a, c])}`);
    if (shotDir && (w === 1440 || w === 744)) { await pg.waitForTimeout(600); const bb = await fv.boundingBox(); await pg.screenshot({ path: `${shotDir}/dent_overlay_on_${w}x${hh}.png`, clip: { x: bb.x, y: Math.max(0, bb.y), width: bb.width, height: Math.min(bb.height, hh - Math.max(0, bb.y)) } }); }
    for (const k of ["skin", "bulk", "form"]) { const l = fv.locator(`.fus-lab[data-k="${k}"]`); if (await l.count()) { await l.click(); await pg.waitForTimeout(400); await dchk("isolated " + k, "Hide dent"); await l.click(); await pg.waitForTimeout(300); } }
    const cv = await fv.locator(".stage canvas").boundingBox(); const sx = cv.x + cv.width * 0.5, sy = cv.y + cv.height * 0.45;
    for (const dir of [1, -1]) { await pg.mouse.move(sx, sy); await pg.mouse.down(); for (let i = 1; i <= 14; i++) { await pg.mouse.move(sx + dir * i * 16, sy); await pg.waitForTimeout(16); } await pg.mouse.up(); await pg.waitForTimeout(1000); await dchk("after orbit " + dir, "Hide dent"); }
    await fv.locator(".fus-dent").click(); await pg.waitForTimeout(800); const d = await dchk("off again", "Show a dent"); ok(d.pressed === "false" && !/DENT/.test(await fv.locator(".stage").textContent()), `${w} dent off: no DENT label`);
  }
  ok(!errs.length, `${w}: console errors ${errs.join("; ")}`); console.log(`${w}x${hh}: ${checks} states checked`, errs.length ? "errors" : "no errors"); await ctx.close(); }
await b.close(); console.log(fail ? `FAIL (${fail})` : "PASS"); process.exit(fail ? 1 : 0);
