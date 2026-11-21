// Step-by-step four-forces animation at GL1 aero (also on GL3). Usage: node tests/forces-anim.mjs
// For every first/then combination: plays from steady through captioned phases with no control moving, ends with the right
// physics (PHAK 5), and goes idle (no busy flag) at the end. Replay restarts at phase 0.
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } else console.log("   ok   " + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disk-cache-size=0"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage();
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
await pg.goto(BASE + (process.env.ROUTE || "#/lesson/gl1/aero"), { waitUntil: "domcontentloaded" }); await pg.waitForTimeout(1800);
await pg.evaluate(() => { const v = document.querySelector("[data-viz='forces3d']"); const tb = document.querySelector(".top"); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 8)); });
const click = (t) => pg.evaluate((t) => [...document.querySelectorAll("[data-viz=forces3d] button")].find((x) => x.textContent.trim() === t).click(), t);
const read = () => pg.evaluate(() => { const d = document.querySelector("figure.forces3d").dataset; return { V: +d.v, T: +d.thrust, D: +d.drag, L: +d.lift, P: +d.pitch, ph: +d.phase, busy: d.busy, step: document.querySelector(".f3-step b").textContent }; });
const tops = () => pg.evaluate(() => [...document.querySelectorAll("[data-viz=forces3d] button, .f3-bars")].map((e) => Math.round(e.getBoundingClientRect().top)).join(","));
const t0 = await tops();
const CASES = [
  ["Add power", "Hold altitude", (r) => r.V > 112 && r.T > 1.2 && Math.abs(r.T - r.D) < 0.02 && r.D > 1.2 && Math.abs(r.L - 1) < 0.02 && r.P < 0, "faster, level: T = D, both larger than before; L = W; nose lower"],
  ["Add power", "Hands off", (r) => Math.abs(r.V - 105) <= 2 && r.T > r.D && Math.abs(r.D - 1) < 0.03 && r.P > 2, "climbs at about the same speed; T > D (part of weight balances)"],
  ["Reduce power", "Hold altitude", (r) => r.V < 98 && Math.abs(r.T - r.D) < 0.02 && r.D < 0.8 && Math.abs(r.L - 1) < 0.02 && r.P > 0, "slower, level: T = D, both smaller; nose higher"],
  ["Reduce power", "Hands off", (r) => Math.abs(r.V - 105) <= 2 && r.T < r.D && r.P < -2, "descends at about the same speed"],
  ["Pitch up", null, (r) => r.V < 90 && r.P > 5 && Math.abs(r.L - 1) < 0.03, "slower climb, lift back to weight"],
];
for (const [a, t, fn, what] of CASES) { await click(a); if (t) { await pg.waitForTimeout(100); await click(t); }
  await pg.waitForTimeout(2600); const mid = await read(); ok(mid.busy === "1" && mid.ph >= 1, `${a}${t ? " + " + t : ""}: playing (phase ${mid.ph}: ${mid.step})`);
  if (a === "Add power" && t === "Hold altitude") ok(mid.T > mid.D, "  thrust > drag while it speeds up");
  await pg.waitForTimeout(8400); const r = await read(); ok(r.busy === "0" && fn(r), `${a}${t ? " + " + t : ""}: ${what} ${JSON.stringify(r)}`);
  await click("↻ Replay"); await pg.waitForTimeout(300); const rp = await read(); ok(rp.ph === 0 && rp.busy === "1", "  Replay restarts at phase 0"); }
await click("Steady"); await pg.waitForTimeout(600); const st = await read(); ok(st.T === 1 && st.D === 1 && st.busy === "0", "Steady: balanced and idle");
ok((await tops()) === t0, "no control moved"); ok(!errs.length, "page errors: " + errs.join(" | "));
await b.close(); console.log(bad ? `${bad} problem(s)` : "forces anim: all good"); process.exit(bad ? 1 : 0);
