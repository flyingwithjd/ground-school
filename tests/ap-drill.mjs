// Autopilot runaway-trim drill: numbered steps appear in order, none greyed before the drill.
// Usage: node tests/ap-drill.mjs
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } else console.log("   ok   " + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disk-cache-size=0"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const pg = await ctx.newPage();
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const cdp = await ctx.newCDPSession(pg); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await pg.goto(BASE + "#/lesson/gl2/21", { waitUntil: "domcontentloaded" });
await pg.waitForTimeout(1800);
await pg.evaluate(() => { const v = document.querySelector("[data-viz='ap3d']"); const tb = document.querySelector(".top"); if (v) window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 8)); });
await pg.waitForTimeout(400);

const state = () => pg.evaluate(() => {
  const v = document.querySelector("[data-viz='ap3d']");
  const vis = [...v.querySelectorAll("button, .chip")].filter((e) => e.offsetParent && !e.hidden).map((e) => ({ t: e.textContent.trim(), dis: !!e.disabled, on: e.classList.contains("on") }));
  return { vis, cap: v.querySelector(".caption")?.innerText.replace(/\s+/g, " ").trim() || "", labels: vis.map((x) => x.t) };
});
const click = (text) => pg.evaluate((text) => {
  const v = document.querySelector("[data-viz='ap3d']");
  const b = [...v.querySelectorAll("button, .chip")].find((x) => x.textContent.trim() === text && x.offsetParent && !x.hidden);
  if (b) b.click();
  return b ? b.textContent.trim() : null;
}, text);

const s0 = await state();
ok(s0.labels.includes("Runaway trim"), "Runaway trim is visible at rest");
ok(!s0.labels.some((t) => /^\d+\s*·/.test(t)), `no numbered drill steps visible before the drill (got ${s0.labels.join(", ")})`);

ok(await click("Runaway trim") === "Runaway trim", "clicked Runaway trim");
await pg.waitForTimeout(300);
const s1 = await state();
ok(s1.labels.includes("1 · Grasp wheel"), `step 1 visible (got ${s1.labels.join(", ")})`);
ok(!s1.labels.some((t) => /^[2-5]\s*·/.test(t)), "later steps hidden until they are next");
ok(/Runaway trim|pitching down|memory items/i.test(s1.cap), `start caption "${s1.cap}"`);
const step1 = s1.vis.find((x) => x.t.startsWith("1 ·"));
ok(step1 && !step1.dis, "step 1 is enabled, not greyed");

const seq = ["1 · Grasp wheel", "2 · Hold A/P DISC", "3 · Trim by hand", "4 · Pull AP breaker", "5 · Release DISC"];
const caps = [/wheel in hand|fly the airplane/i, /disconnect held/i, /retrimmed/i, /breaker out/i, /recovered|hand-fly/i];
for (let i = 0; i < seq.length; i++) {
  ok(await click(seq[i]) === seq[i], "clicked " + seq[i]);
  await pg.waitForTimeout(250);
  const s = await state();
  ok(caps[i].test(s.cap), `after ${seq[i]} caption "${s.cap}"`);
  if (i < seq.length - 1) ok(s.labels.includes(seq[i + 1]), `next step ${seq[i + 1]} appeared`);
}
const end = await state();
ok(end.labels.includes("Runaway trim"), "Runaway trim returns after recovery");
ok(!end.labels.some((t) => /^\d+\s*·/.test(t)), "steps hide again after recovery");
ok(!errs.length, "page errors: " + errs.slice(0, 2).join(" | "));
await ctx.close(); await b.close();
console.log(bad ? `${bad} problem(s)` : "ap drill: all good");
process.exit(bad ? 1 : 0);
