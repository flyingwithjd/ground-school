// Flap types ("More ways to shape the wing"): the drawn airflow and the words always agree. Many random sequences of chip
// taps and slider moves (some fired faster than the ease); after each step, mid-animation and once settled, the regime the
// drawing shows (figure data-flow-drawn: full wake = stalled, panel = spoiled, any separation = separating) must match the
// "airflow on top" readout, the headline must say "Stalled" exactly when the readout does, and once settled both must match
// flowState() of the slider and chip values. Usage: SEQ=40 STEPS=12 node tests/flap-stall.mjs
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html", SEQ = +(process.env.SEQ || 40), STEPS = +(process.env.STEPS || 12);
let bad = 0, checks = 0; const fail = (m) => { bad++; if (bad < 25) console.log("   FAIL " + m); };
let seed = +(process.env.SEED || 12345); const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto(BASE + "#/lesson/gl2/secctl"); await pg.waitForTimeout(1500);
await pg.evaluate(async () => { const src = [...document.querySelectorAll("script[type=module], link[rel=modulepreload]")].map((e) => e.src || e.href).find((u) => /app\.js/.test(u)); const v = (src || "").split("?v=")[1] || ""; window.__ft = await import("/js/viz/flaptypes.js?v=" + v); document.querySelector('[data-viz="flaptypes"]').scrollIntoView(); });
const read = () => pg.evaluate(() => { const v = document.querySelector('[data-viz="flaptypes"]'), f = v.querySelector("figure.viz"); const cells = v.querySelectorAll(".sec-read b");
  return { drawn: f.dataset.flowDrawn, text: cells[2] ? cells[2].textContent : "", cap: (v.querySelector(".caption .label") || {}).textContent || "", dev: (v.querySelector('.chips[aria-label="Wing"] .chip.on') || {}).dataset?.v || null,
    tail: !!v.querySelector('.chips[aria-label="Tail"] .chip.on'), k: +v.querySelectorAll('input[type="range"]')[0].value / 100, aoa: +v.querySelectorAll('input[type="range"]')[1].value }; });
const seen = {}; const check = async (tag, settled) => { const r = await read(); checks++; seen[r.tail ? "tail" : r.text] = (seen[r.tail ? "tail" : r.text] || 0) + 1;
  if (r.tail) { if (r.drawn !== "tail") fail(`${tag}: tail shown but drawing says ${r.drawn}`); return; }
  if (r.drawn !== r.text) fail(`${tag}: drawing shows "${r.drawn}" but the readout says "${r.text}" (${r.dev}, ${r.aoa}°, ${Math.round(r.k * 100)}%)`);
  if ((r.text === "stalled") !== (r.cap === "Stalled")) fail(`${tag}: readout "${r.text}" but headline "${r.cap}"`);
  if (settled) { const exp = await pg.evaluate((r) => window.__ft.flowState(r.dev, r.aoa, r.k).regime, r); if (exp !== r.text) fail(`${tag}: settled at ${r.dev}, ${r.aoa}°, ${Math.round(r.k * 100)}%: expected "${exp}", shows "${r.text}"`); } };
const act = () => pg.evaluate(([a, x, y]) => { const v = document.querySelector('[data-viz="flaptypes"]');
  if (a < 0.3) { const cs = [...v.querySelectorAll('.chips[aria-label="Wing"] .chip')]; cs[Math.floor(x * cs.length)].click(); }
  else if (a < 0.38) { const cs = [...v.querySelectorAll('.chips[aria-label="Tail"] .chip')]; cs[Math.floor(x * cs.length)].click(); }
  else { const i = a < 0.7 ? 1 : 0, s = v.querySelectorAll('input[type="range"]')[i]; if (s.disabled) return; s.value = Math.round(+s.min + y * (+s.max - +s.min)); s.dispatchEvent(new Event("input", { bubbles: true })); } }, [rnd(), rnd(), rnd()]);
for (let q = 0; q < SEQ; q++) {
  for (let i = 0; i < STEPS; i++) { await act(); await pg.waitForTimeout(Math.floor(rnd() * 120)); await check(`seq ${q} step ${i} (mid)`, false); }
  await pg.waitForTimeout(1400); await check(`seq ${q} (settled)`, true);
}
if (errs.length) fail("page errors: " + errs.slice(0, 2).join("; "));
await b.close(); console.log("states seen:", JSON.stringify(seen)); console.log(bad ? `${bad} problem(s) in ${checks} checks` : `flap stall: all ${checks} checks agree`); process.exit(bad ? 1 : 0);
