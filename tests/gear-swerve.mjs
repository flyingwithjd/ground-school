// "Start a swerve" on gear3d must actually yaw the model (GL1 parts page and GL2 gear types).
// Usage: node tests/gear-swerve.mjs
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } else console.log("   ok   " + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

async function run(label, route, { behindChip = "CG behind mains", sizes = [[390, 844], [1366, 1024]] }) {
  for (const [w, h] of sizes) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500 });
    const pg = await ctx.newPage();
    const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
    await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
    await pg.goto(BASE + route); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { const v = document.querySelector("[data-viz='gear3d']"); if (v) { const tb = document.querySelector(".top"); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 8)); } });
    await pg.waitForTimeout(400);
    const read = () => pg.evaluate(() => {
      const v = document.querySelector("[data-viz='gear3d']"), fig = v && v.querySelector("figure.viz");
      const btn = v && (v.querySelector("button.g3-go") || [...v.querySelectorAll("button")].find((x) => /swerve|Swerving|Reset/i.test(x.textContent)));
      const cap = v && v.querySelector(".caption");
      return { yaw: fig ? +fig.dataset.yaw : NaN, swerve: fig ? fig.dataset.swerve || "" : "", btn: btn ? btn.textContent.trim() : "", cap: cap ? cap.innerText.replace(/\s+/g, " ").trim() : "" };
    });
    const click = (re) => pg.evaluate((re) => { const v = document.querySelector("[data-viz='gear3d']"); const b = [...v.querySelectorAll("button")].find((x) => new RegExp(re, "i").test(x.textContent)); if (b) b.click(); return b ? b.textContent.trim() : null; }, re);
    const s0 = await read();
    ok(s0.btn === "Start a swerve", `${label} @${w}: start button is "${s0.btn}"`);
    ok(Math.abs(s0.yaw) < 0.2, `${label} @${w}: yaw starts near 0 (got ${s0.yaw})`);
    await click("Start a swerve");
    await pg.waitForTimeout(750);
    const mid = await read();
    ok(mid.btn === "Swerving…", `${label} @${w}: mid button is "${mid.btn}"`);
    ok(mid.yaw > 8, `${label} @${w}: yaw should rise past 8° by 0.75 s (got ${mid.yaw})`);
    ok(/Swerving/i.test(mid.cap), `${label} @${w}: mid caption is "${mid.cap}"`);
    await pg.waitForTimeout(3200);
    const end = await read();
    ok(end.btn === "Reset", `${label} @${w}: finished as "${end.btn}"`);
    ok(end.swerve === "done", `${label} @${w}: swerve state is "${end.swerve}"`);
    ok(Math.abs(end.yaw) < 0.6, `${label} @${w}: ahead case straightens (end yaw ${end.yaw})`);
    ok(/Straightens/i.test(end.cap), `${label} @${w}: end caption is "${end.cap}"`);
    // tailwheel / CG behind: swerve should grow, not come back
    const flipped = await click(behindChip.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    ok(!!flipped, `${label} @${w}: behind chip "${behindChip}" clicked (${flipped})`);
    await pg.waitForTimeout(300);
    await click("Start a swerve");
    await pg.waitForTimeout(2200);
    const loop = await read();
    ok(loop.yaw > 30, `${label} @${w}: behind/CG-behind yaw should grow (got ${loop.yaw} at 2.2 s)`);
    await pg.waitForTimeout(2000);
    const loopEnd = await read();
    ok(loopEnd.btn === "Reset", `${label} @${w}: behind finished as "${loopEnd.btn}"`);
    ok(loopEnd.yaw > 80, `${label} @${w}: ground loop holds a large yaw (got ${loopEnd.yaw})`);
    ok(/Ground loop/i.test(loopEnd.cap), `${label} @${w}: behind caption is "${loopEnd.cap}"`);
    ok(!errs.length, `${label} @${w}: page errors: ${errs.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }
}

await run("GL1 parts", "#/lesson/gl1/0", { behindChip: "CG behind mains" });
await run("GL2 types", "#/lesson/gl2/airframe", { behindChip: "Tailwheel", sizes: [[390, 844]] });
await b.close();
console.log(bad ? `${bad} problem(s)` : "gear swerve: all good");
process.exit(bad ? 1 : 0);
