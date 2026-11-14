// Playable four-forces animation at GL1 aero (also used on GL3). Usage: node tests/forces-anim.mjs
import { createRequire } from "module"; const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html";
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL " + m); } else console.log("   ok   " + m); };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disk-cache-size=0"] });

const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const pg = await ctx.newPage();
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
const cdp = await ctx.newCDPSession(pg); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
await pg.goto(BASE + "#/lesson/gl1/6", { waitUntil: "domcontentloaded" });
await pg.waitForTimeout(1800);
await pg.evaluate(() => { const v = document.querySelector("[data-viz='forces3d']"); const tb = document.querySelector(".top"); if (v) window.scrollTo(0, v.getBoundingClientRect().top + scrollY - (tb ? tb.getBoundingClientRect().height : 8)); });
await pg.waitForTimeout(400);

const read = () => pg.evaluate(() => {
  const fig = document.querySelector("figure.viz.forces3d");
  const v = document.querySelector("[data-viz='forces3d']");
  const cap = v && v.querySelector(".caption");
  const then = v && v.querySelector(".ctrl-row");
  const thenVisible = !![...v.querySelectorAll(".ctrl-row")].find((r) => /Then/i.test(r.textContent) && !r.hidden);
  const chips = [...v.querySelectorAll("button, .chip")].map((e) => e.textContent.trim());
  const forceChips = chips.filter((t) => /^(Lift|Weight|Thrust|Drag)$/i.test(t));
  return fig ? {
    v: +fig.dataset.v, T: +fig.dataset.thrust, D: +fig.dataset.drag, L: +fig.dataset.lift, W: +fig.dataset.weight,
    mode: fig.dataset.mode, path: fig.dataset.path, pitch: +fig.dataset.pitch, busy: fig.dataset.busy, ghost: fig.dataset.ghost, settled: fig.dataset.settled,
    cap: cap ? cap.innerText.replace(/\s+/g, " ").trim() : "", thenVisible, chips, forceChips,
    asi: v.querySelector(".f3-asi b")?.textContent.trim() || "",
  } : { missing: true };
});
const click = (text) => pg.evaluate((text) => {
  const v = document.querySelector("[data-viz='forces3d']");
  const b = [...v.querySelectorAll("button, .chip")].find((x) => x.textContent.trim() === text && x.offsetParent);
  if (b) b.click();
  return b ? b.textContent.trim() : null;
}, text);
const waitSettle = async (ms = 7000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const s = await read();
    if (s.busy === "0") return s;
    await pg.waitForTimeout(250);
  }
  return read();
};

const s0 = await read();
ok(!s0.missing, "forces visual mounted");
ok(s0.mode === "steady", `starts steady (got ${s0.mode})`);
ok(Math.abs(s0.v - 100) < 3, `cruise near 100 kt (got ${s0.v})`);
ok(Math.abs(s0.T - s0.D) < 0.08 && Math.abs(s0.L - s0.W) < 0.08, `steady T≈D and L≈W (T=${s0.T} D=${s0.D} L=${s0.L} W=${s0.W})`);
ok(!s0.thenVisible, "Hands off / Hold altitude hidden in Steady");
ok(s0.forceChips.length === 0, `no separate force chip row (got ${s0.forceChips.join(",")})`);
ok(/100 kt|99 kt|101 kt/.test(s0.asi), `ASI readout ${s0.asi}`);
ok(/Steady|balance/i.test(s0.cap), `steady caption "${s0.cap}"`);

ok(await click("Add power") === "Add power", "clicked Add power");
await pg.waitForTimeout(700);
const mid = await read();
ok(mid.T > mid.D + 0.1, `mid: thrust exceeds drag (T=${mid.T} D=${mid.D})`);
ok(mid.v > 102, `mid: airspeed rising (got ${mid.v})`);
ok(mid.thenVisible, "Then chips visible after Add power");
ok(/Thrust exceeds drag|Add power|speeds up/i.test(mid.cap), `mid caption "${mid.cap}"`);
ok(mid.L > mid.W, `mid hands off: lift growing past weight (L=${mid.L} W=${mid.W})`);

const settled = await waitSettle(8000);
ok(settled.busy === "0", `hands-off settled (busy=${settled.busy})`);
ok(Math.abs(settled.T - settled.D) < 0.08, `drag caught thrust (T=${settled.T} D=${settled.D})`);
ok(settled.v > 114, `new balance at a higher speed (got ${settled.v} kt)`);
ok(settled.T > 1.25 && settled.D > 1.25, `hands off: thrust and drag both larger than Steady (T=${settled.T} D=${settled.D})`);
ok(Math.abs(settled.L - settled.W) < 0.02 && Math.abs(settled.L - 1) < 0.02, `hands off settled: lift equals weight (L=${settled.L} W=${settled.W})`);
ok(settled.pitch > 3, `hands off: nose up / climb (pitch ${settled.pitch})`);
ok(settled.ghost === "1", "ghost arrows on when T/D changed");
ok(/Balanced again — thrust and drag are both larger/i.test(settled.cap), `settled caption "${settled.cap}"`);

ok(await click("Replay") === "Replay", "clicked Replay");
await pg.waitForTimeout(500);
const rep = await read();
ok(rep.v < settled.v - 5 && rep.T > rep.D + 0.08, `replay restarts the imbalance (v=${rep.v} T=${rep.T} D=${rep.D})`);

ok(await click("Hold altitude") === "Hold altitude", "clicked Hold altitude");
const hold = await waitSettle(8000);
ok(Math.abs(hold.T - hold.D) < 0.08, `hold: drag caught thrust (T=${hold.T} D=${hold.D})`);
ok(hold.v > 114, `hold: still a higher speed (got ${hold.v})`);
ok(hold.T > 1.25 && hold.D > 1.25, `hold: thrust and drag both larger than Steady (T=${hold.T} D=${hold.D})`);
ok(Math.abs(hold.L - hold.W) < 0.02 && Math.abs(hold.L - 1) < 0.02, `hold: lift equals weight exactly (L=${hold.L} W=${hold.W})`);
ok(hold.pitch < 0, `hold: nose lowered (pitch ${hold.pitch})`);
ok(hold.ghost === "1", "hold shows ghost arrows");
ok(/Balanced again — thrust and drag are both larger/i.test(hold.cap), `hold caption "${hold.cap}"`);
ok(hold.settled === "1", "hold is marked settled");

ok(await click("Steady") === "Steady", "clicked Steady");
await pg.waitForTimeout(600);
const st = await read();
ok(st.mode === "steady" && Math.abs(st.v - 100) < 4, `back to steady (~100 kt, got ${st.v})`);
ok(!st.thenVisible, "Then chips hidden again on Steady");

ok(await click("Reduce power") === "Reduce power", "clicked Reduce power");
await pg.waitForTimeout(700);
const rmid = await read();
ok(rmid.D > rmid.T + 0.1, `reduce mid: drag exceeds thrust (T=${rmid.T} D=${rmid.D})`);
ok(rmid.v < 98, `reduce mid: slowing (got ${rmid.v})`);
const rset = await waitSettle(8000);
ok(rset.v < 85, `new balance at a lower speed (got ${rset.v})`);
ok(Math.abs(rset.T - rset.D) < 0.1, `reduce: drag shrank to match (T=${rset.T} D=${rset.D})`);
ok(rset.T < 0.75 && rset.D < 0.75, `reduce: thrust and drag both smaller than Steady (T=${rset.T} D=${rset.D})`);
ok(Math.abs(rset.L - rset.W) < 0.02 && Math.abs(rset.L - 1) < 0.02, `hands off reduce settled: lift equals weight (L=${rset.L} W=${rset.W})`);
ok(rset.pitch < -3, `hands off reduce: nose down (pitch ${rset.pitch})`);
ok(/Balanced again — thrust and drag are both smaller/i.test(rset.cap), `reduce caption "${rset.cap}"`);

ok(await click("Steady") === "Steady", "reset before reduce-hold");
await pg.waitForTimeout(400);
ok(await click("Reduce power") === "Reduce power", "clicked Reduce power for hold");
ok(await click("Hold altitude") === "Hold altitude", "clicked Hold altitude on reduce");
await pg.waitForTimeout(300);
const rhold = await waitSettle(8000);
ok(rhold.T < 0.75 && rhold.D < 0.75 && Math.abs(rhold.T - rhold.D) < 0.1, `reduce+hold: T and D both smaller and equal (T=${rhold.T} D=${rhold.D})`);
ok(Math.abs(rhold.L - rhold.W) < 0.02 && Math.abs(rhold.L - 1) < 0.02, `reduce+hold: lift equals weight exactly (L=${rhold.L} W=${rhold.W})`);
ok(rhold.settled === "1", "reduce+hold is marked settled");
ok(rhold.pitch > 3, `reduce+hold: nose up (pitch ${rhold.pitch})`);
ok(/both smaller/i.test(rhold.cap), `reduce+hold caption "${rhold.cap}"`);

ok(await click("Steady") === "Steady", "reset before pitch up");
await pg.waitForTimeout(400);
ok(await click("Pitch up") === "Pitch up", "clicked Pitch up");
await pg.waitForTimeout(900);
const pu = await read();
ok(pu.pitch > 6, `pitch up raises the nose (pitch ${pu.pitch})`);
ok(pu.v < 98, `pitch up bleeds airspeed (got ${pu.v})`);
ok(pu.L > pu.W, `pitch up: lift up at first (L=${pu.L} W=${pu.W})`);

ok(!errs.length, "page errors: " + errs.slice(0, 2).join(" | "));
await ctx.close(); await b.close();
console.log(bad ? `${bad} problem(s)` : "forces anim: all good");
process.exit(bad ? 1 : 0);
