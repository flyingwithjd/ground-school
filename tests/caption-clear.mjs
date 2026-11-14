// Usage: node tests/caption-clear.mjs [#/lesson/gl1/0 ...]  (default: every GL1 and GL2 page) at 390x844.
// For every 3D (canvas) visual whose caption sits over the stage, hide the caption and look at the canvas pixels under
// the caption box: any bright model line there means the caption would cover the airplane. Also checks that leader-line
// tags (.t3-tag), part labels (.fus-lab) and defect rings never overlap the caption box.
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
import { execSync } from "child_process";
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let routes = process.argv.slice(2);
if (!routes.length) routes = execSync("node tests/routes.mjs", { cwd: "/workspace/pilot-ground-school" }).toString().trim().split("\n").filter((r) => /^#\/lesson\/(gl1|gl2)\//.test(r));
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
let bad = 0, checked = 0;
for (const r of routes) { await pg.goto(BASE + r); await pg.reload(); await pg.waitForTimeout(1500);
  const n = await pg.evaluate(() => document.querySelectorAll(".viz").length);
  for (let i = 0; i < n; i++) {
    const box = await pg.evaluate((i) => { const v = document.querySelectorAll(".viz")[i]; const st = v.querySelector(".stage"); const cap = st && st.querySelector(":scope > .caption");
      if (!st || !st.querySelector("canvas") || !cap || !cap.textContent.trim() || getComputedStyle(cap).display === "none") return null;
      const tb = document.querySelector(".top"); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 0));
      return { type: v.closest("[data-viz]")?.dataset.viz || "?" }; }, i);
    if (!box) continue;
    const nChips = Math.min(10, await pg.evaluate((i) => document.querySelectorAll(".viz")[i].querySelectorAll(".chip, .fus-lab.pick").length, i));
    for (let c = -1; c < nChips; c++) {
    if (c >= 0) await pg.evaluate(([i, c]) => { const v = document.querySelectorAll(".viz")[i]; const ch = v.querySelectorAll(".chip, .fus-lab.pick")[c]; ch && ch.click(); const tb = document.querySelector(".top"); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 0)); }, [i, c]);
    const chipName = c < 0 ? "default" : await pg.evaluate(([i, c]) => document.querySelectorAll(".viz")[i].querySelectorAll(".chip, .fus-lab.pick")[c].textContent.trim().slice(0, 24), [i, c]);
    await pg.waitForTimeout(c < 0 ? 2000 : 1900); checked++;
    const res = await pg.evaluate((i) => { const v = document.querySelectorAll(".viz")[i]; const cap = v.querySelector(".stage > .caption"); const els = [cap.querySelector(".label"), cap.querySelector(".big")].filter(Boolean);
      const R = els.map((e) => e.getBoundingClientRect()).reduce((a, r) => ({ l: Math.min(a.l, r.left), t: Math.min(a.t, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
      const hits = [...v.querySelectorAll(".t3-tag, .fus-lab, .wk-mark")].filter((e) => getComputedStyle(e).opacity !== "0").map((e) => e.getBoundingClientRect()).filter((q) => q.width && q.left < R.r && R.l < q.right && q.top < R.b && R.t < q.bottom).length;
      cap.style.visibility = "hidden"; return { R, hits }; }, i);
    await pg.waitForTimeout(250);
    const png = await pg.screenshot({ clip: { x: res.R.l, y: res.R.t, width: Math.max(1, res.R.r - res.R.l), height: Math.max(1, res.R.b - res.R.t) } });
    await pg.evaluate((i) => { document.querySelectorAll(".viz")[i].querySelector(".stage > .caption").style.visibility = ""; }, i);
    const bright = await pg.evaluate(async (b64) => { const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode(); const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const x = c.getContext("2d"); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let k = 0; k < d.length; k += 4) if (d[k] + d[k + 1] + d[k + 2] > 300) n++; return n / (d.length / 4); }, png.toString("base64"));
    const fail = bright > 0.004 || res.hits; if (fail) bad++;
    console.log(`${fail ? "   FAIL" : "   ok  "} ${r} ${box.type} [${chipName}]: model pixels under caption ${(bright * 100).toFixed(2)}%, labels over caption ${res.hits}`); } } }
console.log(`caption clear: ${checked} canvas captions, ${bad} problems`); await b.close(); process.exit(bad ? 1 : 0);
