// Learning flow (step B): quick checks after every 2-3 pages drawn only from those pages, Skip for now, the wrap-up, a
// Certain miss becoming a blind spot at once, the Review blind spots lesson, Course search and filters, the Now page's
// one next step, and old lesson links. Usage: node tests/learnflow.mjs   (390x844 phone; SHOTS=dir saves screenshots)
import { createRequire } from "module";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/"; const SHOTS = process.env.SHOTS || "";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--disable-gpu", "--renderer-process-limit=1"] });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); else console.log("  ok", m); };
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const pg = await ctx.newPage();
await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} }); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
const shot = async (n) => { if (!SHOTS) return; await pg.waitForTimeout(900); await pg.screenshot({ path: `${SHOTS}/${n}.png` }); };
const V = async () => pg.evaluate(() => document.querySelector('meta[name="build"]').content);
const D = async (fn, arg) => pg.evaluate(async ([v, src, arg]) => { const d = await import(`/data/index.js?v=${v}`); const pi = (await import(`/data/pageindex.js?v=${v}`)).default; return new Function("d", "pi", "arg", src)(d, pi, arg); }, [await V(), fn, arg]);
const st = async () => (await pg.waitForTimeout(300), pg.evaluate(() => JSON.parse(localStorage.getItem("ppg.v1") || "{}")));
const cur = async () => pg.evaluate(async (v) => { const d = await import(`/data/index.js?v=${v}`); const el = document.querySelector(".qtext"); if (!el) return null; const txt = el.innerText.trim();
  const strip = (s) => { const e = document.createElement("div"); e.innerHTML = String(s).replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1"); return e.innerText.trim(); };
  const q = Object.values(d.QUESTIONS).find((x) => strip(x.q) === txt); return q ? { id: q.id, page: d.secKey(q), type: q.type || "mc", right: q.c ? strip(q.c[q.a]) : null } : { id: "?" + txt.slice(0, 40) }; }, await V());
// answer what is on screen; wrong = pick a wrong choice; conf 0 guess, 1 fairly sure, 2 certain
async function answer({ wrong = false, conf = 2 } = {}) { const c = await cur();
  if (c.type !== "order") { const ch = pg.locator(".choice:not([disabled])"); const n = await ch.count(); let k = 0; for (let i = 0; i < n; i++) { const t = (await ch.nth(i).locator("span").last().innerText()).trim(); if ((t === c.right) !== wrong) { k = i; break; } } await ch.nth(k).click(); }
  const chips = pg.locator(".conf .chip"); c.conf = await chips.count(); await chips.nth(conf).click(); await pg.waitForTimeout(80); return c; }
async function runSession(o = {}) { const asked = []; for (let i = 0; i < 30 && (await pg.locator(".qtext").count()); i++) { asked.push(await answer(typeof o === "function" ? o(i) : o));
  const nx = pg.locator(".verdict button", { hasText: /^(Next|Finish)$/ }); if (await nx.count()) { await nx.first().click(); await pg.waitForTimeout(100); } else break; } return asked; }
const next = async () => { await pg.locator(".secnav .pg.next").click(); await pg.waitForTimeout(250); };
const L = "gl3"; const pages = await (async () => { await pg.goto(BASE + "#/"); await pg.waitForTimeout(800); return D("return pi.lessons[arg].map(x => x[0])", L); })();
const plan = await D("return null"); // warm
// ---------- new user: one clear Begin ----------
ok(await pg.locator("#begin").count() === 1 && (await pg.locator("#begin").innerText()).trim() === "Begin", "a brand-new user sees one Begin button");
await shot("learnB-now-new");
// ---------- quick check 1 sits after page 3 of 12 and asks only pages 1-3 ----------
await pg.goto(BASE + `#/lesson/${L}/0`); await pg.waitForTimeout(1000);
const dashes = await pg.evaluate(() => [...document.querySelectorAll(".steps button")].map((b) => (b.classList.contains("cp") ? "C" : "p")).join(""));
ok(dashes === "pppCpppCpppppC" || /^(p{2,3}C)+p{2,3}C$/.test(dashes), `checks every 2-3 pages, wrap-up last (${dashes})`);
for (let i = 0; i < 3; i++) await next();
ok(/#\/lesson\/gl3\/check1$/.test(pg.url()), "after page 3 comes Quick check 1: " + pg.url());
ok(await pg.locator(".skip-now", { hasText: "Skip for now" }).count() === 1, "the quick check offers a small Skip for now");
await pg.locator(".cp-btns .btn.pri").click(); await pg.waitForSelector(".qtext");
let asked = await runSession((i) => ({ wrong: i === 0, conf: 2 }));
const want = new Set(pages.slice(0, 3).map((s) => `${L}/${s}`));
ok(asked.length >= 4 && asked.length <= 5, `quick check asks 4-5 (${asked.length})`); ok(asked.every((c) => want.has(c.page)), `all from pages 1-3: ${[...new Set(asked.map((c) => c.page))]}`);
ok(asked.every((c) => c.conf === 3), "every answer had the confidence step");
let s = await st(); const miss = asked[0].id;
ok(s.blind && s.blind[miss] && !s.blind[miss].done && s.blind[miss].conf === "sure", "a wrong answer marked Certain is a blind spot at once, mid-lesson");
ok(s.lessons[L].cp && s.lessons[L].cp.check1 && s.lessons[L].cp.check1.done, "quick check 1 recorded as done");
const cont = pg.locator(".next-btns button", { hasText: /^Continue · / }); ok(await cont.count() === 1, "quick check ends with one Continue button");
await cont.click(); await pg.waitForTimeout(400); ok(/#\/lesson\/gl3\/3$/.test(pg.url()), "Continue opens page 4: " + pg.url());
// ---------- skip ----------
for (let i = 0; i < 3; i++) await next(); ok(/check2$/.test(pg.url()), "after page 6 comes Quick check 2"); await shot("learnB-checkpoint");
await pg.locator(".cp-btns .btn.pri").click(); await pg.waitForSelector(".qtext"); await answer({ conf: 1 }); await shot("learnB-checkpoint-q"); await pg.goto(BASE + `#/lesson/${L}/check2`); await pg.reload(); await pg.waitForTimeout(900);
await pg.locator(".skip-now").click(); await pg.waitForTimeout(400); s = await st();
ok(/#\/lesson\/gl3\/6$/.test(pg.url()) && s.lessons[L].cp.check2.skip, "Skip for now moves on to page 7 and remembers the skip");
// ---------- per-page readiness ----------
await pg.locator("details.pagelist summary").click(); await pg.waitForTimeout(200);
const rows = await pg.evaluate(() => [...document.querySelectorAll(".pagelist .prow:not(.chk)")].map((r) => r.querySelector(".r").innerText.trim()));
ok(rows.length === 12 && /%/.test(rows[0]) && /not read/.test(rows[11]), `page list shows readiness per page (${rows[0]} … ${rows[11]})`);
ok(await pg.locator(".pagelist .prow").first().locator(".tag", { hasText: /^Blind spot$/ }).count() === 1, "page 1 carries a plain Blind spot badge");
// ---------- wrap-up ----------
// let the Certain miss's 12 hours pass, then the wrap-up leads with it
// (the edit is written after the app's own save, and further writes from this page are blocked so the reload keeps it)
const patch = async (fn, arg) => { await pg.waitForTimeout(300); await pg.evaluate(([src, arg]) => { const s = JSON.parse(localStorage.getItem("ppg.v1")); new Function("s", "arg", src)(s, arg); localStorage.setItem("ppg.v1", JSON.stringify(s)); Storage.prototype.setItem = function () {}; }, [fn, arg]); };
await patch("const it = s.items[arg]; it.due = Date.now() - 1000; it.h[it.h.length - 1].t = Date.now() - 13 * 36e5;", miss);
await pg.goto(BASE + `#/lesson/${L}/wrap`); await pg.reload(); await pg.waitForTimeout(900);
ok(await pg.locator("h2", { hasText: "Wrap-up" }).count() === 1, "the last step is the Wrap-up");
await pg.locator(".cp-btns .btn.pri").click(); await pg.waitForSelector(".qtext");
const first = await cur(); ok(first.id === miss, `the wrap-up starts with the missed question (${first.id} vs ${miss})`);
const reached = new Set((await st()).lessons[L].read.map((x) => `${L}/${x}`));
asked = await runSession({ conf: 1 }); ok(asked.length >= 5 && asked.length <= 6, `wrap-up asks 5-6 (${asked.length})`); ok(asked.every((c) => reached.has(c.page)), "wrap-up asks only pages opened");
await shot("learnB-wrapup"); s = await st();
ok(s.lessons[L].fin && (await pg.locator(".card.finished", { hasText: "Lesson finished" }).count()) === 1 && /readiness/.test(await pg.locator(".card.finished").innerText()), "lesson marked finished with readiness shown");
await pg.locator(".card.finished").scrollIntoViewIfNeeded(); await shot("learnB-finished");
// ---------- Review blind spots lesson ----------
await pg.goto(BASE + "#/"); await pg.waitForTimeout(900);
const order = await pg.evaluate(() => [...document.querySelectorAll("#next-step, #blind-card, #due-card")].map((e) => e.id).join(","));
ok(/^next-step,blind-card/.test(order), "Now: next step first, then Review blind spots (" + order + ")"); await shot("learnB-now-progress");
await pg.locator("#blind-card").click(); await pg.waitForTimeout(700); ok(/#\/blindspots$/.test(pg.url()), "blind spot card opens the lesson");
const bl = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem("ppg.v1")); return Object.keys(s.blind).filter((k) => !s.blind[k].done); });
const blPages = await D("return arg.map(id => d.secKey(d.QUESTIONS[id]))", bl);
const listed = await pg.locator(".blind-lesson .prow").count(); ok(listed === new Set(blPages).size, `overview lists the ${listed} page(s) behind ${bl.length} blind spot(s)`);
await shot("learnB-blindlesson");
await pg.locator("#bl-read").click(); await pg.waitForTimeout(900);
const t1 = await D("const [l,s]=arg.split('/'); return pi.lessons[l].find(x=>x[0]===s)[2]", [...new Set(blPages)].sort()[0]);
ok(await pg.locator(".blind-lesson .sec h2").count() === 1, "the first blind-spot page is shown in full (" + (await pg.locator(".blind-lesson .sec h2").innerText()) + ")");
await shot("learnB-blindlesson-page");
await pg.goto(BASE + "#/blindspots/quiz"); await pg.waitForTimeout(700);
// make every blind spot ready (12 hours passed), then the quiz asks exactly those
await patch("for (const k of Object.keys(s.blind)) if (!s.blind[k].done && s.items[k]) s.items[k].due = Date.now() - 1000;");
await pg.reload(); await pg.waitForTimeout(900); await pg.locator("#bl-start").click(); await pg.waitForSelector(".qtext");
asked = await runSession({ conf: 2 }); ok(asked.length && asked.every((c) => bl.includes(c.id)) && asked.length === bl.length, `blind spot quiz asks only the ${bl.length} blind spot(s) (${asked.length})`);
// ---------- Course search and filters ----------
await pg.goto(BASE + "#/course"); await pg.waitForTimeout(800);
const target = await D("return pi.lessons.gl3[6]"); await pg.fill("#cq", target[2]); await pg.waitForTimeout(300);
const hit = pg.locator("#clist a.row", { hasText: target[2] }).first(); ok(await hit.count() === 1 && (await hit.getAttribute("href")) === `#/lesson/gl3/${target[0]}`, `search finds the page "${target[2]}"`);
await shot("learnB-course-search");
await hit.click(); await pg.waitForTimeout(900); ok((await pg.locator(".sec h2").first().innerText()).trim() === target[2], "the search hit opens that page");
await pg.goto(BASE + "#/course"); await pg.waitForTimeout(600); await pg.fill("#cq", "wind shear"); await pg.waitForTimeout(300);
ok(await pg.locator("#clist a.row", { hasText: "Wind shear" }).count() >= 1, "search finds a glossary term");
await pg.fill("#cq", ""); await pg.waitForTimeout(200);
const listIds = async () => pg.evaluate(() => [...document.querySelectorAll("#clist a.row")].map((a) => a.getAttribute("href").split("/")[2]));
const rects = () => pg.evaluate(() => [...document.querySelectorAll(".finder .chip, #cq")].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)].join(","); }).join("|"));
const r0 = await rects(); await pg.locator("#cf-stage .chip", { hasText: /^Stage 1$/ }).click(); await pg.waitForTimeout(200); const r1 = await rects(); await pg.locator("#cf-stage .chip", { hasText: /^Stage 1$/ }).click(); await pg.waitForTimeout(200);
ok(r0 === r1, "filter chips stay put when one is toggled");
await pg.locator("#cf-subj .chip", { hasText: /^Weather$/ }).click(); await pg.waitForTimeout(250); let ids = await listIds();
const wx = await pg.evaluate(async (v) => (await import(`/data/course.js?v=${v}`)).SUBJECTS.find((s) => s.id === "weather").lessons, await V());
ok(ids.length === wx.length && ids.every((i) => wx.includes(i)), `Weather filter shows the ${wx.length} weather lessons`); await shot("learnB-course-filter");
await pg.locator("#cf-stage .chip", { hasText: /^Stage 2$/ }).click(); await pg.waitForTimeout(250); ids = await listIds();
ok(ids.length && ids.every((i) => ["gl7", "gl8"].includes(i)), `Weather + Stage 2 = ${ids}`);
await pg.locator("#cf-stage .chip", { hasText: /^All$/ }).click(); await pg.waitForTimeout(250);
await pg.locator("#cf-stage .chip", { hasText: /^Not started$/ }).click(); await pg.waitForTimeout(250); ids = await listIds(); ok(ids.length > 10 && !ids.includes("gl3"), "Not started hides GL3");
await pg.locator("#cf-stage .chip", { hasText: /^Weak$/ }).click(); await pg.waitForTimeout(250); ids = await listIds(); ok(ids.includes("gl3") || !(await st()).blind, `Weak lists GL3 (${ids})`);
await pg.locator("#cf-stage .chip", { hasText: /^All$/ }).click();
// ---------- old links ----------
await pg.goto(BASE + "#/lesson/gl3/3"); await pg.waitForTimeout(900); ok(/gl3\/3$/.test(pg.url()) && (await pg.locator(".sec .label").first().innerText()).length > 0 && !(await pg.locator(".cp-intro").count()), "old link #/lesson/gl3/3 still opens page 4");
await pg.goto(BASE + `#/lesson/gl3/${pages.length}`); await pg.waitForTimeout(900); ok(await pg.locator("h2", { hasText: "Wrap-up" }).count() === 1, "old Check yourself link (one past the pages) opens the wrap-up");
await pg.goto(BASE + "#/lesson/gl3/lift"); await pg.waitForTimeout(900); ok(/gl3\/2$/.test(pg.url()) || (await pg.locator(".steps button.on").count()) === 1, "a page-id link still opens its page");
ok(!errs.length, "no page errors " + errs.join(" | "));
await b.close();
if (fails.length) { console.log("FAIL\n  " + fails.join("\n  ")); process.exit(1); } console.log("learnflow: all good");
