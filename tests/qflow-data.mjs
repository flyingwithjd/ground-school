// Question-flow data rules: the in-place ppg.v1 migration from an old save (and an old export), readiness weights,
// 12-hour scheduling of misses and correct guesses, blind-spot clearing, and practice-ahead.  Usage: node tests/qflow-data.mjs
import { createRequire } from "module";
const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--disable-gpu", "--renderer-process-limit=1"] });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); else console.log("  ok", m); };
const D = 864e5, NOW = Date.now();
const it = (h, x = {}) => ({ ef: 2.5, reps: 1, ivl: 1, due: NOW + D, lapses: 0, n: h.length, ok: h.filter((e) => e.ok).length, last: h.length ? h[h.length - 1].t : 0, h, ...x });
const e = (days, ok, c, s = "learn") => ({ t: NOW - days * D, ok, c, s });
// An old save, exactly as the previous build wrote it: no blind list, no rw, no q in history, 10-minute miss dues.
const OLD = { v: 1, created: NOW - 30 * D, items: {
  "gl2-01": it([e(3, false, "sure")], { reps: 0, ivl: 0, due: NOW - 3 * D + 6e5, lapses: 1 }),          // open, Certain
  "gl2-02": it([e(5, false, "unsure"), e(4, true, "sure"), e(3, true, "sure")], { lapses: 1 }),          // cleared: 2 days correct
  "gl2-03": it([e(5, false, "sure"), e(4, true, "sure"), e(3, true, "unsure")], { lapses: 1 }),          // open: Certain miss needs 3
  "gl2-04": it([e(40, true, "sure"), e(30, true, "sure")], { reps: 4, ivl: 30 }),                        // mastered, Certain
  "gl2-05": it([e(40, true, "sure"), e(30, true, "unsure")], { reps: 4, ivl: 30 }),                      // long interval but Fairly sure
  "gl2-06": it([e(2, true, "guess")]),
  "gl2-07": it([e(2, true, null, "exam")]),
  "gl2-08": it([e(4, false, "guess"), e(3, true, "guess")], { lapses: 1 }),                              // a guess never clears
  "zz-removed-9": it([e(2, false, "sure")], { reps: 0, ivl: 0 }) },
  lessons: { gl2: { visited: NOW - D, sec: 3, read: ["controls"], total: 14 } }, notes: { gl2: "my debrief" }, sims: [{ t: NOW - D, n: 40, ok: 33, score: 0.825, title: "Stage 1 Check" }],
  settings: { confidence: true, newPerSession: 6 }, presolo: { airport: "KXYZ", ans: { 0: "x" } } };
const ctx = await b.newContext({ viewport: { width: 744, height: 1133 } }); const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (x) => errs.push(x.message));
await pg.addInitScript((old) => { try { localStorage.setItem("sqs.access", "1"); if (!sessionStorage.getItem("seeded")) { localStorage.setItem("ppg.v1", old); sessionStorage.setItem("seeded", "1"); } } catch (x) {} }, JSON.stringify(OLD));
await pg.goto(BASE + "#/"); await pg.waitForTimeout(1500);
const r = await pg.evaluate(async ({ OLD, NOW, D }) => { const v = document.querySelector('meta[name="build"]').content; const imp = (p) => import(`/${p}?v=${v}`);
  const st = await imp("js/core/store.js"), srs = await imp("js/core/srs.js"), pr = await imp("js/core/progress.js"), data = await imp("data/index.js");
  const out = {}; st.save(true); const s = JSON.parse(localStorage.getItem("ppg.v1"));
  out.keys = Object.keys(localStorage).sort(); out.v = s.v; out.itemsSame = JSON.stringify(s.items) === JSON.stringify(OLD.items);
  out.kept = JSON.stringify([s.lessons, s.notes, s.sims, s.settings, s.presolo]) === JSON.stringify([OLD.lessons, OLD.notes, OLD.sims, OLD.settings, OLD.presolo]);
  out.blind = s.blind; out.blindInit = s.blindInit; out.blindList = pr.blindList();
  const N = data.lessonItems("gl2").length; out.ready = pr.lessonStats("gl2").readiness * N;
  out.lv = ["gl2-04", "gl2-05"].map((id) => srs.level(srs.get(id)));
  out.W = srs.READY_W; out.delay = srs.MISS_DELAY;
  // an old export imported again rebuilds the list
  st.importJSON(JSON.stringify({ app: "private-pilot-ground", state: OLD })); const s2 = st.S(); out.importBlind = JSON.stringify(s2.blind) === JSON.stringify(out.blind) && s2.blindInit === 1 && JSON.stringify(s2.items) === JSON.stringify(OLD.items);
  // scheduling and readiness credit
  const t = Date.now(); const near = (x, y) => Math.abs(x - y) < 6e4;
  let a = srs.review("gl3-01", { ok: true, conf: "guess", now: t }); out.guess = [a.rw, a.reps, near(a.due, t + 12 * 36e5), srs.isBlind("gl3-01")];
  a = srs.review("gl3-02", { ok: true, conf: "unsure", now: t }); out.unsure = [a.rw, near(a.due, t + D)];
  a = srs.review("gl3-03", { ok: true, conf: "sure", now: t }); out.sure = [a.rw, near(a.due, t + D)];
  a = srs.review("gl3-04", { ok: false, conf: "sure", now: t }); out.miss = [a.rw, near(a.due, t + 12 * 36e5), srs.isBlind("gl3-04"), st.S().blind["gl3-04"].conf];
  a = srs.review("gl3-03", { ok: true, conf: null, source: "exam", now: t + 2 * D }); out.examKeeps = a.rw;
  // practice ahead: a correct early answer never stretches the schedule; a correct guess pulls it in
  const due0 = srs.get("gl3-02").due; a = srs.review("gl3-02", { ok: true, conf: "sure", source: "ahead", now: t + 1000 }); out.ahead = [a.due === due0, a.rw];
  a = srs.review("gl3-02", { ok: true, conf: "guess", source: "ahead", now: t + 2000 }); out.aheadGuess = [near(a.due, t + 12 * 36e5), a.rw];
  // blind spot clearing: Certain miss needs 3 correct days; same-day repeats and guesses do not count
  const T = t + 10 * D; srs.review("gl3-05", { ok: false, conf: "sure", now: T });
  srs.review("gl3-05", { ok: true, conf: "sure", now: T + 60e3 }); const k0 = st.S().blind["gl3-05"].k;
  srs.review("gl3-05", { ok: true, conf: "sure", now: T + D }); srs.review("gl3-05", { ok: true, conf: "sure", now: T + D + 60e3 }); srs.review("gl3-05", { ok: true, conf: "guess", now: T + 2 * D });
  const mid = { ...st.S().blind["gl3-05"] }; srs.review("gl3-05", { ok: true, conf: "sure", now: T + 3 * D }); srs.review("gl3-05", { ok: true, conf: "unsure", now: T + 4 * D });
  out.clear = [k0, mid.k, !!mid.done, !!st.S().blind["gl3-05"].done];
  srs.review("gl3-06", { ok: false, conf: "unsure", now: T }); srs.review("gl3-06", { ok: true, conf: "unsure", now: T + D }); srs.review("gl3-06", { ok: true, conf: "sure", now: T + 2 * D }); out.clear2 = !!st.S().blind["gl3-06"].done;
  // a lesson is 100% only when every item's latest answer is Certain and correct
  const vs = data.lessonItems("vs1"); vs.forEach((id) => srs.review(id, { ok: true, conf: "sure", now: t })); out.full = pr.lessonStats("vs1").readiness;
  srs.review(vs[0], { ok: true, conf: "unsure", now: t + 1 }); out.notFull = pr.lessonStats("vs1").readiness; out.vsN = vs.length;
  return out; }, { OLD, NOW, D });
ok(r.v === 1 && r.keys.join() === "ppg.v1,sqs.access", "still one progress key ppg.v1 with v:1 (" + r.keys + ")");
ok(r.itemsSame, "old item state and question ids are untouched by the migration");
ok(r.kept, "lessons, notes, sims, settings and pre-solo answers are kept");
ok(r.blindInit === 1, "migration marks itself done");
const B = r.blind; ok(B["gl2-01"] && !B["gl2-01"].done && B["gl2-01"].conf === "sure", "a Certain miss in history becomes an open Certain blind spot");
ok(B["gl2-02"] && B["gl2-02"].done, "a miss later answered right on 2 different days is cleared");
ok(B["gl2-03"] && !B["gl2-03"].done && B["gl2-03"].k === 2, "a Certain miss needs 3 days (2 so far)");
ok(B["gl2-08"] && !B["gl2-08"].done && B["gl2-08"].k === 0, "a correct guess does not count toward clearing");
ok(!B["gl2-04"] && !B["gl2-05"] && !B["gl2-06"] && !B["gl2-07"], "questions never missed are not blind spots");
ok(!r.blindList.includes("zz-removed-9") && r.blindList.join() === "gl2-03,gl2-01,gl2-08", "open list: Certain first, oldest first, unknown ids skipped (" + r.blindList + ")");
ok(Math.abs(r.ready - 3.5) < 1e-9, "old-save readiness credit for GL2 = 3.5 (1 + 0.5 + 0 + 0.5 + 1 + 0.5 + 0 + 0); got " + r.ready);
ok(r.lv[0] === 4 && r.lv[1] === 2, "Mastered needs a Certain latest answer (levels " + r.lv + ")");
ok(JSON.stringify(r.W) === JSON.stringify({ guess: 0, unsure: 0.5, sure: 1 }) && r.delay === 12 * 36e5, "weights constant {guess 0, unsure 0.5, sure 1}, miss delay 12 h");
ok(r.importBlind, "importing an old export rebuilds the same blind spots and keeps items");
ok(r.guess.join() === "0,0,true,false", "correct + Guessed: credit 0, back in 12 h, not a blind spot (" + r.guess + ")");
ok(r.unsure.join() === "0.5,true", "correct + Fairly sure: credit 0.5");
ok(r.sure.join() === "1,true", "correct + Certain: credit 1");
ok(r.miss.join() === "0,true,true,sure", "miss: credit 0, back in 12 h, Certain blind spot (" + r.miss + ")");
ok(r.examKeeps === 1, "an exam answer without a rating keeps the earlier Certain credit");
ok(r.ahead.join() === "true,1", "practice ahead never stretches the schedule");
ok(r.aheadGuess.join() === "true,0", "a correct guess while ahead pulls the review in to 12 h");
ok(r.clear.join() === "0,1,false,true", "blind clearing: same-day and guesses ignored, Certain miss clears on the 3rd day (" + r.clear + ")");
ok(r.clear2, "a non-Certain miss clears after 2 correct days");
ok(r.full === 1 && r.notFull < 1 && Math.abs(r.notFull - (r.vsN - 0.5) / r.vsN) < 1e-9, `lesson readiness 100% only when all Certain (${r.full}, then ${r.notFull.toFixed(3)})`);
ok(!errs.length, "no page errors " + errs.join(" | "));
await b.close();
console.log(fails.length ? "FAIL\n" + fails.join("\n") : "PASS qflow-data"); process.exit(fails.length ? 1 : 0);
