// Usage: W=1440 node tests/stable-controls.mjs [route ...]
// In every interactive visual, clicks each button (chips, sub-chips, toggles) and asserts that every control group stays in its
// own area: a group (chip row, slider, button set) may shift a little (a row wrapping, a caption growing), but it must not jump
// sideways, move more than about a row, or end up beside a group it used to sit below. Groups may appear or disappear.
// Each visual type + options is checked once (on the first route that shows it). Exit code 1 on any problem.
import { createRequire } from "module"; const require = createRequire("/workspace/pgs-build/");
const { chromium } = require("playwright-core"); import { execSync } from "child_process";
const argv = process.argv.slice(2);
const routes = argv.length ? argv : execSync("node tests/routes.mjs", { cwd: "/workspace/pilot-ground-school" }).toString().trim().split("\n").filter((r) => r.startsWith("#/lesson/") || r.startsWith("#/module/") || r.startsWith("#/tools"));
const w = +(process.env.W || 1440), hh = +(process.env.H || 900), TOL = 1.5;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: w, height: hh }, hasTouch: w < 1100, isMobile: w < 500, reducedMotion: "reduce" }); const pg = await ctx.newPage();
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
// snapshot: every visible control group in visual #vi (chip group, slider, or the parent of a lone button), page coordinates
const snap = (vi) => pg.evaluate((vi) => { const v = document.querySelectorAll("[data-viz]")[vi]; if (!v) return null; const G = new Map();
  v.querySelectorAll("button, input, select").forEach((e) => { if (!e.offsetParent || e.closest("svg")) return; const r = e.getBoundingClientRect(); if (!r.width) return;
    const g = e.closest('[role=group], .chips, .slider') || e.parentElement; const u = G.get(g) || [1e9, 1e9, -1e9, -1e9];
    G.set(g, [Math.min(u[0], r.left + scrollX), Math.min(u[1], r.top + scrollY), Math.max(u[2], r.right + scrollX), Math.max(u[3], r.bottom + scrollY)]); });
  const out = {}, n = {}; for (const [g, r] of G) { let k = g.getAttribute("aria-label") || ((g.className || g.tagName) + ":" + ((g.querySelector("button, input, select") || {}).textContent || "").trim().slice(0, 24)); n[k] = (n[k] || 0) + 1; out[k + "#" + n[k]] = r; } return out; }, vi);
const ROW = 70, SIDE = 32;
const seen = new Set(); let bad = 0, nviz = 0, nclick = 0; const report = {};
for (const r of routes) {
  await pg.goto("about:blank"); await pg.goto((process.env.BASE || "http://localhost:8765/index.html") + r); await pg.waitForTimeout(1000);
  const list = await pg.evaluate(() => [...document.querySelectorAll("[data-viz]")].map((v, i) => ({ i, type: v.dataset.viz, sig: v.dataset.viz + "|" + [...v.querySelectorAll("button")].map((b) => b.textContent.trim()).join(",").slice(0, 300) })));
  for (const V of list) { if (seen.has(V.sig)) continue; seen.add(V.sig); nviz++;
    const labels = await pg.evaluate((vi) => [...document.querySelectorAll("[data-viz]")[vi].querySelectorAll("button")].filter((b) => b.offsetParent && !b.closest("svg")).map((b, j) => j), V.i);
    const probs = [];
    for (const j of labels.slice(0, 40)) {
      const before = await snap(V.i); if (!before) break;
      const name = await pg.evaluate(([vi, j]) => { const bs = [...document.querySelectorAll("[data-viz]")[vi].querySelectorAll("button")].filter((b) => b.offsetParent && !b.closest("svg")); const b = bs[j]; if (!b || b.disabled) return null; b.click(); return (b.getAttribute("aria-label") || b.textContent).trim().replace(/\s+/g, " ").slice(0, 30); }, [V.i, j]);
      if (name == null) continue; nclick++; await pg.waitForTimeout(260);
      if (!(await pg.evaluate(() => location.hash)).startsWith(r.split("?")[0].slice(0, 12))) { await pg.goBack(); await pg.waitForTimeout(800); continue; }
      const after = await snap(V.i); if (!after) break;
      for (const [k, a] of Object.entries(before)) { const c = after[k]; if (!c) continue; const lab = k.replace(/#1$/, "");
        if (Math.abs(c[0] - a[0]) > SIDE) probs.push(`[${name}] group "${lab}" jumped sideways ${Math.round(c[0] - a[0])}px`);
        if (Math.abs(c[1] - a[1]) > ROW) probs.push(`[${name}] group "${lab}" moved ${Math.round(c[1] - a[1])}px vertically`);
        for (const [k2, a2] of Object.entries(before)) { const c2 = after[k2]; if (k2 === k || !c2) continue;
          const below0 = a[1] >= a2[3] - 2, beside1 = c[1] < c2[3] - 2 && c2[1] < c[3] - 2; if (below0 && beside1) probs.push(`[${name}] group "${lab}" moved up beside "${k2.replace(/#1$/, "")}"`); } }
    }
    if (probs.length) { bad++; const u = [...new Set(probs)]; report[V.type + " @ " + r] = u; console.log(`${V.type} @ ${r}\n  ` + u.slice(0, 12).join("\n  ") + (u.length > 12 ? `\n  … ${u.length - 12} more` : "")); }
  }
}
console.log(`${w}px: ${nviz} visuals, ${nclick} clicks, ${bad} with moving controls`, errs.length ? "\nerrors: " + [...new Set(errs)].slice(0, 5).join("; ") : "");
await b.close(); process.exit(bad ? 1 : 0);
