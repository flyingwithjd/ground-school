// Usage: node tests/parts-ui.mjs <tag> [base]  — taps Ailerons then Fuselage in the 172S explorer at phone and iPad sizes,
// checks exactly one chip is active, checks caption/corner text never overlaps, and saves screenshots.
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core");
const tag = process.argv[2] || "check", base = process.argv[3] || "http://localhost:8765/index.html";
const OUT = "/workspace/pilot-ground-school/screenshots/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let fail = 0;
const sizes = (process.env.SIZES || "390x844@3,1366x1024@1").split(",");
for (const sz of sizes) { const [wh, dpr] = sz.split("@"); const [w, hh] = wh.split("x").map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, deviceScaleFactor: +dpr || 1, isMobile: w < 700, hasTouch: w < 700 }); const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); /* entry gate */  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await pg.goto(base + "#/lesson/gl1/0"); await pg.waitForTimeout(2500);
  const viz = pg.locator(".viz").first(); await viz.scrollIntoViewIfNeeded(); await pg.evaluate(() => { const v = document.querySelector(".viz"); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 70); });
  await pg.waitForTimeout(1500);
  for (const name of ["Ailerons", "Fuselage"]) { await viz.locator(".chip", { hasText: new RegExp("^" + name + "$") }).click(); await pg.waitForTimeout(1600); }
  const st = await pg.evaluate(() => { const v = document.querySelector(".viz");
    const on = [...v.querySelectorAll(".chip")].filter((c) => c.classList.contains("on") || c.getAttribute("aria-pressed") === "true").map((c) => c.textContent);
    const boxes = [...v.querySelectorAll(".stage .corner, .stage .caption .label, .stage .caption .big, .stage .caption .spec")].filter((e) => e.textContent.trim()).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.slice(0, 30), l: r.left, r: r.right, t2: r.top, b: r.bottom }; });
    const ov = []; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], c = boxes[j]; if (a.l < c.r - 1 && c.l < a.r - 1 && a.t2 < c.b - 1 && c.t2 < a.b - 1) ov.push(a.t + " ⟂ " + c.t); }
    return { on, big: v.querySelector(".caption .big")?.textContent, ov }; });
  const ok = st.on.length === 1 && st.on[0] === "Fuselage" && st.big === "Fuselage" && !st.ov.length;
  if (!ok) fail++;
  console.log(`${w}x${hh}`, ok ? "PASS" : "FAIL", JSON.stringify(st), errs.length ? "errors: " + errs.join("; ") : "no errors");
  await viz.screenshot({ path: `${OUT}${tag}_parts-explorer_${w}x${hh}.png` });
  { // every part you can tap on the model has a button too (Cowling, Engine, stabilizers), and picking one works like a tap
    const texts = await viz.locator(".chip").allTextContents();
    const need = ["Fuselage", "Wings", "Landing gear", "Ailerons", "Flaps", "Fuel tanks", "Horizontal stabilizer", "Elevator", "Trim tab", "Vertical stabilizer", "Rudder", "Engine", "Cowling", "Propeller"];
    const miss = need.filter((n) => !texts.includes(n)); if (miss.length) fail++; console.log("  ", miss.length ? "FAIL" : "PASS", "buttons for every tappable part", miss.length ? "missing " + miss : "");
    const rowsBefore = await viz.locator(".chips").evaluateAll((g) => g.map((e) => Math.round(e.getBoundingClientRect().top)));
    await viz.locator(".chip", { hasText: /^Cowling$/ }).click(); await pg.waitForTimeout(1800);
    const c = await pg.evaluate(() => { const v = document.querySelector(".viz"); return { on: [...v.querySelectorAll(".chip")].filter((c) => c.classList.contains("on")).map((c) => c.textContent), big: v.querySelector(".caption .big")?.textContent, label: v.querySelector(".caption .label")?.textContent }; });
    const rowsAfter = await viz.locator(".chips").evaluateAll((g) => g.map((e) => Math.round(e.getBoundingClientRect().top)));
    const cok = c.on.join() === "Cowling" && c.big === "Cowling" && c.label === "Powerplant" && rowsBefore.join() === rowsAfter.join(); if (!cok) fail++;
    console.log("  ", cok ? "PASS" : "FAIL", "Cowling button", JSON.stringify(c), rowsBefore.join() === rowsAfter.join() ? "rows fixed" : "rows moved");
    await viz.screenshot({ path: `${OUT}${tag}_parts-cowling_${w}x${hh}.png` });
    await viz.locator(".chip", { hasText: /^Cowling$/ }).click(); await pg.waitForTimeout(1200); }
  if (process.env.DESELECT) { // tap active chip again -> default; tap empty canvas -> default; orbit drag keeps selection
    const state = () => pg.evaluate(() => { const v = document.querySelector(".viz"); return { on: [...v.querySelectorAll(".chip")].filter((c) => c.classList.contains("on") || c.getAttribute("aria-pressed") === "true").map((c) => c.textContent), big: v.querySelector(".caption .big")?.textContent }; });
    const chip = (n) => viz.locator(".chip", { hasText: new RegExp("^" + n + "$") });
    const box = await viz.locator(".stage").boundingBox(); const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
    const isDefault = (st) => st.on.length === 0 && st.big === "Tap a part";
    const res = [];
    await chip("Wings").click(); await pg.waitForTimeout(1200); const a1 = await state(); await chip("Wings").click(); await pg.waitForTimeout(1800); const a2 = await state();
    res.push(["Wings, Wings again -> default", a1.big === "Wings" && a1.on.join() === "Wings" && isDefault(a2), a1, a2]);
    await chip("Ailerons").click(); await pg.waitForTimeout(1800); const b1 = await state();
    const [ex, ey] = at(0.5, 0.06); if (w < 700) await pg.touchscreen.tap(ex, ey); else await pg.mouse.click(ex, ey); await pg.waitForTimeout(1800); const b2 = await state();
    res.push(["Ailerons, tap empty canvas -> default", b1.big === "Ailerons" && isDefault(b2), b1, b2]);
    await chip("Wings").click(); await pg.waitForTimeout(1800);
    const [sx, sy] = at(0.3, 0.5); await pg.mouse.move(sx, sy); await pg.mouse.down(); for (let i = 1; i <= 12; i++) { await pg.mouse.move(sx + i * 12, sy + i * 3); await pg.waitForTimeout(16); } await pg.mouse.up(); await pg.waitForTimeout(1200); const c1 = await state();
    res.push(["Wings, orbit drag -> stays", c1.big === "Wings" && c1.on.join() === "Wings", c1]);
    await viz.screenshot({ path: `${OUT}${tag}_parts-explorer-after-orbit_${w}x${hh}.png` });
    await chip("Wings").click(); await pg.waitForTimeout(1800); await viz.screenshot({ path: `${OUT}${tag}_parts-explorer-cleared_${w}x${hh}.png` });
    for (const [n, ok, ...x] of res) { if (!ok) fail++; console.log("  ", ok ? "PASS" : "FAIL", n, ok ? "" : JSON.stringify(x)); } }
  await ctx.close(); }
await b.close(); process.exit(fail ? 1 : 0);
