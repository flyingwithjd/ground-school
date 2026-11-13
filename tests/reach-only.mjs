// Never asked about an unread page: a fresh learner who has opened only the first page of a lesson is asked only questions
// tagged with that page, in the lesson's Check yourself, practice, review, a topic drill and the stage-check written.
// Every answer shows the Guessed / Fairly sure / Certain step.  Usage: node tests/reach-only.mjs  (390x844 phone)
import { createRequire } from "module";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/"; const L = process.env.LESSON || "gl3";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--disable-gpu", "--renderer-process-limit=1"] });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); else console.log("  ok", m); };
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
const V = async () => pg.evaluate(() => document.querySelector('meta[name="build"]').content);
const cur = async () => pg.evaluate(async (v) => { const d = await import(`/data/index.js?v=${v}`); const el = document.querySelector(".qtext"); if (!el) return null; const txt = el.innerText.trim();
  const strip = (s) => { const e = document.createElement("div"); e.innerHTML = s.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1"); return e.innerText.trim(); };
  const q = Object.values(d.QUESTIONS).find((x) => strip(x.q) === txt); return q ? { id: q.id, page: d.secKey(q), type: q.type || "mc" } : { id: "?" + txt.slice(0, 40), page: null }; }, await V());
// answer whatever is on screen (first choice), always through the confidence step; returns the ids asked
async function runAll(max = 40) { const asked = []; let conf = 0;
  for (let i = 0; i < max && (await pg.locator(".qtext").count()); i++) { const c = await cur(); asked.push(c);
    if (c.type !== "order") await pg.locator(".choice:not([disabled])").first().click();
    const chips = pg.locator(".conf .chip"); conf += (await chips.count()) === 3 ? 1 : 0; await chips.nth(2).click(); await pg.waitForTimeout(80);
    const nx = pg.locator(".verdict button", { hasText: /^(Next|Finish)$/ }); if (await nx.count()) { await nx.first().click(); await pg.waitForTimeout(100); } }
  return { asked, conf }; }
await pg.goto(BASE + `#/lesson/${L}/0`); await pg.waitForTimeout(1200); const v0 = await V();
const pages = await pg.evaluate(async ({ v, L }) => {
  const d = await import(`/data/index.js?v=${v}`); const s = JSON.parse(localStorage.getItem("ppg.v1") || "{}"); const first = (s.lessons?.[L]?.read || [])[0];
  return { first, read: s.lessons?.[L]?.read || [], mine: Object.values(d.QUESTIONS).filter((q) => d.secKey(q) === `${L}/${first}`).length, all: d.lessonItems(L).length }; }, { v: v0, L });
ok(pages.read.length === 1, `only the first page is recorded as read (${pages.read.join(",")})`);
const page1 = `${L}/${pages.first}`; console.log(`  page 1 = ${page1}: ${pages.mine} questions of ${pages.all} in ${L}`);
// lesson Check yourself (jump straight there with the last step dash: pages in between stay unread)
await pg.locator(".steps button").last().click(); await pg.waitForTimeout(500);
const info = await pg.locator(".sec p.dim").first().innerText(); ok(new RegExp(`^${pages.mine} of ${pages.all} questions so far`).test(info), "Check yourself counts only page-1 questions: " + info.slice(0, 80));
await pg.locator("button", { hasText: /^(Start|Keep going)$/ }).click(); await pg.waitForSelector(".qtext");
let r = await runAll(); ok(r.asked.length > 0 && r.asked.every((c) => c.page === page1), `Check yourself asked ${r.asked.length}, all from ${page1}: ${[...new Set(r.asked.map((c) => c.page))].join(",")}`);
ok(r.conf === r.asked.length, `every answer showed the 3-choice confidence step (${r.conf}/${r.asked.length})`);
await pg.goto(BASE + `#/practice/${L}`); await pg.waitForTimeout(800); r = await runAll(); const r2 = await runAll();
ok([...r.asked, ...r2.asked].every((c) => c.page === page1), `practice asks only ${page1} (${r.asked.length + r2.asked.length})`);
await pg.goto(BASE + `#/review`); await pg.waitForTimeout(800); const rv = await runAll(15); ok(rv.asked.every((c) => c.page === page1), `review asks only ${page1} (${rv.asked.length})`);
// a topic from an unread page: the drill points back to the lesson instead of asking
const otherTopic = await pg.evaluate(async ({ v, L, page1 }) => { const d = await import(`/data/index.js?v=${v}`); return Object.values(d.QUESTIONS).find((q) => q.lesson === L && d.secKey(q) !== page1).t; }, { v: await V(), L, page1 });
await pg.goto(BASE + `#/drill/${otherTopic}`); await pg.waitForTimeout(800); const dr = await runAll(10);
ok(dr.asked.every((c) => c.page === page1), `drill on ${otherTopic} asks nothing from unread pages (${dr.asked.length} asked)`);
// stage-check written and pre-solo draw only from read pages too
await pg.goto(BASE + `#/check/s1/written`); await pg.waitForTimeout(700); const beg = pg.locator("button", { hasText: "Begin" });
if (await beg.count()) { await beg.click(); await pg.waitForSelector(".qtext"); const ex = await runAll(45); ok(ex.asked.every((c) => c.page === page1), `stage check asks only ${page1} (${ex.asked.length})`); ok(ex.conf === ex.asked.length, "the timed check also asks how sure you are"); }
else ok(true, "stage check has nothing to ask yet");
await pg.goto(BASE + `#/presolo`); await pg.waitForTimeout(600); ok(!(await pg.locator("button", { hasText: "Start the practice test" }).count()), "pre-solo practice test waits until its pages are read");
// opening page 2 adds exactly that page
await pg.goto(BASE + `#/lesson/${L}/1`); await pg.waitForTimeout(800); await pg.goto(BASE + `#/practice/${L}`); await pg.waitForTimeout(800); const r3 = await runAll(25);
const p2 = await pg.evaluate(({ L }) => JSON.parse(localStorage.getItem("ppg.v1")).lessons[L].read, { L });
ok(r3.asked.length > 0 && r3.asked.every((c) => p2.map((x) => `${L}/${x}`).includes(c.page)), `after opening page 2, ${r3.asked.length} questions come from ${p2.join(" + ")} only`);
ok(!errs.length, "no page errors " + errs.join(" | "));
await b.close();
if (fails.length) { console.log("FAIL\n  " + fails.join("\n  ")); process.exit(1); } console.log("reach only: all good");
