// Question flow: no same-session re-ask, misses scheduled 12 h out as blind spots, fixed "Answered x / N" counter,
// end summary with Keep going, "All N questions" path that remembers its place, blind spots resurfacing (with badge)
// in a later lesson's session, and the Now page Blind spots card.  Usage: node tests/qflow.mjs [SHOTDIR]
import { createRequire } from "module";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/"; const shot = process.argv[2];
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--disable-gpu", "--renderer-process-limit=1"] });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); else console.log("  ok", m); };
const ctx = await b.newContext({ viewport: { width: 744, height: 1133 }, hasTouch: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
const V = async () => pg.evaluate(() => document.querySelector('meta[name="build"]').content);
// id and correct index of the question on screen, read from the app's own data module (same URL, same instance)
const cur = async () => pg.evaluate(async (v) => { const d = await import(`/data/index.js?v=${v}`); const m = await import(`/js/core/srs.js?v=${v}`);
  const txt = document.querySelector(".qtext").innerText.trim(); const strip = (s) => { const e = document.createElement("div"); e.innerHTML = s.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1"); return e.innerText.trim(); };
  const q = Object.values(d.QUESTIONS).find((x) => strip(x.q) === txt) || Object.values(d.ORAL).find((x) => strip(x.q) === txt);
  return q ? { id: q.id, right: q.c ? strip(q.c[q.a]) : null, type: q.type || (q.kind === "oral" ? "oral" : "mc"), badge: !!document.querySelector(".blind-tag"), counter: document.querySelector(".qhead .label:last-child").textContent } : null; }, await V());
const answer = async (miss, conf = 2) => { const c = await cur(); if (!c) return null;
  if (c.type === "mc") { const ch = pg.locator(".choice:not([disabled])"); const n = await ch.count(); let pick = 0;
    for (let k = 0; k < n; k++) { const t = (await ch.nth(k).innerText()).replace(/^[A-G]\s*/, "").trim(); if ((t === c.right) !== miss) { pick = k; break; } }
    await ch.nth(pick).click(); await pg.locator(".conf .chip").nth(conf).click(); }
  else if (c.type === "order") { await pg.locator(".conf .chip").nth(conf).click(); }
  else { await pg.locator("button", { hasText: "Show model answer" }).click(); await pg.locator(".chips .chip").nth(miss ? 0 : 3).click(); }
  await pg.waitForTimeout(120); return c; };
const nextQ = async () => { const nx = pg.locator(".verdict button", { hasText: /^(Next|Finish)$/ }); if (await nx.count()) { await nx.first().click(); await pg.waitForTimeout(150); return true; } return false; };
const state = () => pg.evaluate(() => JSON.parse(localStorage.getItem("ppg.v1") || "null"));

// ---- 1. a GL2 session: miss the first 3 (Certain), answer the rest right
await pg.goto(BASE + "#/practice/gl2"); await pg.waitForSelector(".qtext"); await pg.waitForTimeout(400);
const asked = []; const counters = []; let k = 0; const t0 = Date.now();
while (await pg.locator(".qtext").count()) { const c = await answer(k < 3); if (!c) break; asked.push(c.id); counters.push(c.counter); if (k === 0 && shot) await pg.screenshot({ path: shot + "/qf_01_miss_verdict.png" });
  k++; if (!(await nextQ())) break; if (k > 40) break; }
ok(asked.length === 12, `first session asks 12 questions (asked ${asked.length})`);
ok(new Set(asked).size === asked.length, "no question is asked twice in a session");
ok(counters.every((c, i) => c === `Answered ${i} / 12`), `counter is fixed: ${counters.slice(0, 4).join(", ")} …`);
let s = await state(); const missed = asked.slice(0, 3);
ok(missed.every((id) => s.blind[id] && !s.blind[id].done && s.blind[id].conf === "sure"), "the 3 Certain misses are open blind spots");
ok(missed.every((id) => Math.abs(s.items[id].due - (t0 + 12 * 36e5)) < 5 * 6e4), "misses are due 12 hours later");
ok(asked.slice(3).every((id) => !s.blind[id] && s.items[id].rw === 1), "correct Certain answers: no blind spot, readiness credit 1");
ok(s.v === 1, "progress stays under ppg.v1 with v:1");
// end summary
const sum = await pg.evaluate(() => { const v = document.querySelector(".verdict"); return { h2: v.querySelector("h2").textContent, cal: v.querySelector(".cal")?.textContent || "", btns: [...v.querySelectorAll(".next-btns button")].map((b) => [b.textContent, b.classList.contains("pri")]), miss: v.querySelectorAll(".miss").length, your: v.querySelectorAll(".miss .ans.no").length, why: v.querySelectorAll(".miss p.dim").length, pager: document.querySelectorAll(".secnav").length }; });
ok(sum.h2 === "9 of 12 correct", "summary score: " + sum.h2);
ok(/Certain 9\/12/.test(sum.cal), "calibration line: " + sum.cal);
ok(sum.btns[0] && /^Keep going · 10 more$/.test(sum.btns[0][0]) && sum.btns[0][1], "Keep going · 10 more is the primary button: " + JSON.stringify(sum.btns));
ok(sum.btns.some(([t]) => /^All \d+ questions$/.test(t)) && sum.btns.some(([t]) => t === "Done"), "All N and Done buttons present");
ok(sum.miss === 3 && sum.your === 3 && sum.why === 3, "3 missed cards with your answer, the correct one and the explanation");
if (shot) { await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(500); await pg.screenshot({ path: shot + "/qf_02_end_summary.png" }); }
// ---- 2. Keep going: 10 new questions, none repeated
await pg.locator(".next-btns button", { hasText: "Keep going" }).click(); await pg.waitForSelector(".qtext");
const c1 = await cur(); ok(c1.counter === "Answered 0 / 10", "Keep going counter: " + c1.counter);
const more = []; while (await pg.locator(".qtext").count()) { const c = await answer(false, 1); if (!c) break; more.push(c.id); if (!(await nextQ())) break; if (more.length > 12) break; }
ok(more.length === 10 && more.every((id) => !asked.includes(id)), "Keep going brings 10 questions not yet asked");
s = await state(); ok(more.every((id) => s.items[id].rw === 0.5), "Fairly sure answers get readiness credit 0.5");

// ---- 3. All N questions path remembers its place
await pg.goto(BASE + "#/lesson/gl2"); await pg.waitForTimeout(900);
for (let i = 0; i < 40 && !(await pg.locator("h2", { hasText: "Answer, then trust" }).count()); i++) { await pg.locator(".secnav .pg.next").click(); await pg.waitForTimeout(150); }
const allBtn = pg.locator("button", { hasText: /^All \d+ questions$/ }); ok(await allBtn.count() === 1, "lesson Check yourself offers All N questions");
const N = +(await allBtn.textContent()).match(/\d+/)[0]; await allBtn.click(); await pg.waitForSelector(".qtext");
let c2 = await cur(); ok(c2.counter === `Answered 0 / ${N}`, "All path counter: " + c2.counter);
for (let i = 0; i < 4; i++) { await answer(false); await nextQ(); }
c2 = await cur(); ok(c2.counter === `Answered 4 / ${N}`, "All path advances: " + c2.counter);
if (shot) await pg.screenshot({ path: shot + "/qf_03_all_path.png" });
await pg.goto(BASE + "#/lesson/gl2"); await pg.waitForTimeout(900);
for (let i = 0; i < 40 && !(await pg.locator("h2", { hasText: "Answer, then trust" }).count()); i++) { await pg.locator(".secnav .pg.next").click(); await pg.waitForTimeout(150); }
const resume = pg.locator("button", { hasText: /^All questions · 4 \/ \d+$/ }); ok(await resume.count() === 1, "All path remembers its place (All questions · 4 / N)");
await resume.click(); await pg.waitForSelector(".qtext"); c2 = await cur(); ok(c2.counter === `Answered 4 / ${N}`, "resumes at 4: " + c2.counter);
ok(!(await pg.locator(".secnav").count()), "no lesson pager under a running session");

// ---- 4. 12 hours later: blind spots come back inside a later lesson's session, with the badge, and on the Now page
// edit storage from a same-origin page without the app, so the running app cannot write its in-memory state back over it
await pg.goto(BASE + "robots.txt"); await pg.evaluate((ids) => { const s = JSON.parse(localStorage.getItem("ppg.v1")); for (const id of ids) s.items[id].due = Date.now() - 1000; localStorage.setItem("ppg.v1", JSON.stringify(s)); }, missed);
await pg.goto(BASE + "#/"); await pg.waitForTimeout(1000);
const card = await pg.evaluate(() => { const c = document.getElementById("blind-card"); return c ? { txt: c.innerText, num: c.querySelector(".num").textContent, pri: !!c.querySelector(".btn.pri") } : null; });
ok(card && /Blind spots/i.test(card.txt) && /^3/.test(card.num) && card.pri, "Now page shows the Blind spots card first: " + (card && card.txt.replace(/\s+/g, " ")));
ok(!(await pg.evaluate(() => /within minutes/.test(document.body.innerText))), "no 'within minutes' text on the Now page");
if (shot) await pg.screenshot({ path: shot + "/qf_04_now_blind_card.png" });
await pg.goto(BASE + "#/practice/gl3"); await pg.waitForSelector(".qtext"); await pg.waitForTimeout(300);
const seen3 = []; let badgeShot = false;
while (await pg.locator(".qtext").count()) { const c = await cur(); if (!c) break; seen3.push(c);
  if (c.badge && !badgeShot && shot) { await pg.screenshot({ path: shot + "/qf_05_blind_badge.png" }); badgeShot = true; }
  await answer(false); if (!(await nextQ())) break; if (seen3.length > 30) break; }
const back = seen3.filter((c) => missed.includes(c.id));
ok(back.length === 3 && back.every((c) => c.badge), `the 3 GL2 blind spots come back in GL3 with the badge (${back.length})`);
ok(seen3.filter((c) => c.badge).length === 3, "only blind spots carry the badge");
ok(seen3.findIndex((c) => missed.includes(c.id)) >= 2, "blind spots are spread through the session, not first");
const badgeTxt = await pg.evaluate(() => [...document.querySelectorAll(".blind-tag")].map((e) => e.textContent));
s = await state(); ok(missed.every((id) => s.blind[id].k === 0 || s.blind[id].k === 1), "a same-day correct answer does not clear a blind spot early");
ok(missed.every((id) => !s.blind[id].done), "blind spots stay open after one correct answer");
// ---- 5. Review page leads with ready blind spots; a readiness % is shown on the lesson
await pg.goto(BASE + "#/lesson/gl2"); await pg.waitForTimeout(900);
const hero = await pg.evaluate(() => document.querySelector(".hero .pct").textContent); ok(/readiness \d+%/.test(hero), "lesson shows a readiness %: " + hero);
if (shot) await pg.screenshot({ path: shot + "/qf_06_lesson_readiness.png" });
ok(!errs.length, "no page errors " + errs.join(" | "));
await b.close();
console.log(fails.length ? "FAIL\n" + fails.join("\n") : "PASS qflow"); process.exit(fails.length ? 1 : 0);
