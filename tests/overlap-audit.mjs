// Usage: W=360 node tests/overlap-audit.mjs   — visits every route, and in every .viz checks that corner labels and caption text never overlap.
// In the 172S explorer it also taps every part button and checks exactly one is active.
// It also checks the lesson pager (PREVIOUS / NEXT cells never overlap or spill, labels never clip) and, in the fuselage
// construction visual, that no two SVG callouts overlap for every type (and the dent).
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core"); import { execSync } from "child_process";
const routes = execSync("node tests/routes.mjs", { cwd: "/workspace/pilot-ground-school" }).toString().trim().split("\n").filter((r) => r.startsWith("#/lesson/") || r.startsWith("#/module/"));
const w = +(process.env.W || 360), hh = +(process.env.H || 800);
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: w, height: hh } }); const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); /* entry gate */  const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
const check = () => pg.evaluate(() => { const out = [];
  document.querySelectorAll(".viz").forEach((v, vi) => { const boxes = [...v.querySelectorAll(".stage > .corner, .stage > .caption .label, .stage > .caption .big, .stage > .caption .spec")].filter((e) => e.textContent.trim() && e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.slice(0, 28), l: r.left, r: r.right, t2: r.top, b: r.bottom }; });
    const sr = v.querySelector(".stage").getBoundingClientRect();
    for (const a of boxes) if (a.r > sr.right + 1 || a.l < sr.left - 1) out.push(`viz${vi} "${a.t}" spills out of card`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], c = boxes[j]; if (a.l < c.r - 1 && c.l < a.r - 1 && a.t2 < c.b - 1 && c.t2 < a.b - 1) out.push(`viz${vi} "${a.t}" ⟂ "${c.t}"`); } });
  // lesson pager
  const pgs = [...document.querySelectorAll(".secnav .pg")].map((e) => ({ e, r: e.getBoundingClientRect() }));
  for (const { e, r } of pgs) { if (r.right > innerWidth + 1 || r.left < -1) out.push(`pager "${e.textContent}" spills off screen`);
    const l = e.querySelector(".pg-l"), t = e.querySelector(".pg-t"); if (l && l.scrollWidth > l.clientWidth + 1) out.push(`pager label "${l.textContent}" clipped`);
    if (t && t.getBoundingClientRect().bottom > r.bottom + 1) out.push(`pager title "${t.textContent}" runs out of its cell`); if (t && t.getBoundingClientRect().height < 10) out.push(`pager title "${t.textContent}" collapsed`); }
  for (let i = 0; i < pgs.length; i++) for (let j = i + 1; j < pgs.length; j++) { const a = pgs[i].r, c = pgs[j].r; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push("pager cells overlap"); }
  // fuselage construction callouts
  document.querySelectorAll(".viz.fus").forEach((v) => { const sr = v.querySelector(".stage").getBoundingClientRect(); const tx = [...v.querySelectorAll("svg text")].map((e) => ({ t: e.textContent, r: e.getBoundingClientRect() }));
    const hdr = [...v.querySelectorAll(".stage > .corner")].map((e) => ({ t: e.textContent, r: e.getBoundingClientRect() }));
    for (const a of tx) { if (a.r.right > sr.right + 1 || a.r.left < sr.left - 1) out.push(`fus "${a.t}" spills out of card`); if (a.r.height < 12) out.push(`fus "${a.t}" smaller than 10px`); }
    const all = tx.concat(hdr); for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i].r, c = all[j].r; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(`fus "${all[i].t}" ⟂ "${all[j].t}"`); } });
  return out; });
let bad = 0; const seen = new Set();
for (const r of routes) { await pg.goto("about:blank"); await pg.goto((process.env.BASE || "http://localhost:8765/index.html") + r); await pg.waitForTimeout(900);
  let ov = await check();
  if (await pg.locator(".viz .chip", { hasText: /^Ailerons$/ }).count()) { const chipsL = pg.locator(".viz").filter({ has: pg.locator(".chip", { hasText: /^Ailerons$/ }) }).first().locator(".chip");
    for (let i = 0; i < await chipsL.count(); i++) { const c = chipsL.nth(i); const name = await c.textContent(); await c.click(); await pg.waitForTimeout(250);
      const on = await pg.evaluate(() => [...document.querySelectorAll(".viz .chip")].filter((c) => c.closest(".viz").textContent.includes("Ailerons") && (c.classList.contains("on") || c.getAttribute("aria-pressed") === "true")).map((c) => c.textContent));
      if (on.length !== 1 || on[0] !== name) ov.push(`after tapping ${name}, active = ${JSON.stringify(on)}`); ov.push(...(await check()).map((x) => `[${name}] ` + x)); } }
  if (await pg.locator(".viz.fus").count()) { const fv = pg.locator(".viz.fus").first();
    for (const [nm, re] of [["Monocoque", /^Monocoque$/], ["Show a dent", /^Show a dent$/], ["Semimonocoque", /^Semimonocoque$/], ["Truss", /^Truss$/]]) { await fv.locator(".chip", { hasText: re }).click(); await pg.waitForTimeout(250); ov.push(...(await check()).map((x) => `[${nm}] ` + x)); } }
  ov = ov.filter((x) => !seen.has(r + x)); ov.forEach((x) => seen.add(r + x));
  if (ov.length) { bad++; console.log(r, "\n  " + ov.join("\n  ")); } }
console.log(`${w}px: ${routes.length} routes, ${bad} with problems`, errs.length ? "\nerrors: " + [...new Set(errs)].join("; ") : "");
await b.close();
