// Stage checks (written + oral), the pre-solo written practice exam, and the syllabus coverage checklist.
import { h, esc, shuffle } from "../core/util.js?v=58985d3f52";
import { S, save } from "../core/store.js?v=58985d3f52";
import { STAGES, STAGE_CHECK } from "../../data/course.js?v=58985d3f52";
import { LESSONS, QUESTIONS, ORAL, TOPICS, lessonItems } from "../../data/index.js?v=58985d3f52";
import { stats } from "../core/progress.js?v=58985d3f52";
import { session } from "./quiz.js?v=58985d3f52";
import { rich } from "../core/rich.js?v=58985d3f52";
const page = (host) => { const p = h("div", { class: "page" }); host.append(p); return p; };
const foot = `<div class="footer">Squawk School is a study aid. Your school's syllabus, your instructor and the FAA sources decide what a stage check covers and how it is graded.</div>`;
const sid = (k) => STAGES.find((s) => s.id === k);
// stratified draw: proportional to each lesson's bank, at least one from each
function draw(pool, n, filter = () => true) {
  const groups = pool.map((id) => shuffle((LESSONS[id]?.questions || []).filter(filter).map((q) => q.id))).filter((g) => g.length);
  const total = groups.reduce((a, g) => a + g.length, 0); let qs = [];
  groups.forEach((g) => qs.push(...g.slice(0, Math.max(1, Math.round((g.length / total) * n)))));
  return shuffle(qs).slice(0, n);
}
export function sim(host) { const p = page(host); const hist = (S().sims || []).slice(-6).reverse();
  p.innerHTML = `<section class="hero"><span class="label">Stage checks</span><h1>Prove it, then move on</h1><p>Each stage ends with a check by a different instructor. Practice both halves here: a timed written test with no hints, and an oral exam you answer out loud and grade honestly. The standard is 80%, and every miss is reviewed. Misses go straight into your review schedule.</p></section>
  <div class="grid g2">${Object.entries(STAGE_CHECK).map(([k, c]) => { const L = LESSONS[c.id]; const n = c.pool.flatMap((id) => (LESSONS[id]?.questions || [])).length; const o = c.pool.flatMap((id) => (LESSONS[id]?.oral || [])).length;
    return `<div class="cell"><span class="label">${esc(L ? L.code : "")} · covers ${esc(c.covers)}</span><h3>${esc(c.title)}</h3><p>Written: ${c.n} questions in ${c.minutes} minutes from a bank of ${n}. Oral: ${c.oralN} prompts from ${o}.</p><div class="btns"><a class="btn pri arrow" href="#/check/${k}/written">Written</a><a class="btn arrow" href="#/check/${k}/oral">Oral</a></div></div>`; }).join("")}</div>
  ${hist.length ? `<div class="list-head section-gap"><span class="label">Recent attempts</span><span class="label">Score</span></div>${hist.map((x) => `<div class="row"><span class="code">${new Date(x.t).toLocaleDateString()}</span><span><div class="t">${esc(x.title || "Stage 1 check")} · ${x.ok} of ${x.n}</div></span><span class="pct">${Math.round(x.score * 100)}%</span></div>`).join("")}` : ""}${foot}`; }
export function check(host, k, mode) { const c = STAGE_CHECK[k]; if (!c) { const p = page(host); p.innerHTML = "<h2>Not found.</h2>"; return; }
  if (!mode) { location.hash = "#/sim"; return; }
  const p = page(host); const oral = mode === "oral";
  p.innerHTML = `<section class="hero"><span class="label">${esc(c.title)} · ${oral ? "oral" : "written"} · covers ${esc(c.covers)}</span><h1>${oral ? "Answer out loud." : "No hints. Timed."}</h1><p>${oral
    ? `${c.oralN} open questions across ${esc(c.covers)}, like the table talk with a check instructor. Say your answer before you reveal the model answer, then grade yourself. "Partly" counts as a miss for the score. 80% passes, and every miss is listed at the end.`
    : `${c.n} questions across ${esc(c.covers)}, ${c.minutes} minutes, no feedback until the end. 80% passes. Then review every miss: the explanation, the source, and why the wrong answer looked right.`}</p></section>`;
  const b = h("button", { class: "btn pri arrow", type: "button" }, "Begin"); p.append(h("div", { class: "btns" }, b, h("a", { class: "btn ghost", href: "#/sim" }, "All checks")));
  b.onclick = () => { p.innerHTML = "";
    if (oral) { const ids = shuffle(c.pool.flatMap((id) => (LESSONS[id]?.oral || []).map((o) => o.id))).slice(0, c.oralN);
      session(p, { queue: ids, mode: "oral", check: true, passMark: c.pass, title: c.title + " · oral", label: c.title + " · oral", onExit: () => (location.hash = "#/sim"), onFinish: (r) => { S().sims.push({ t: Date.now(), n: r.total, ok: r.correct, score: r.score, title: c.title + " oral" }); save(); } }); }
    else session(p, { queue: draw(c.pool, c.n), mode: "exam", title: c.title, label: c.title + " · written", minutes: c.minutes, passMark: c.pass, onExit: () => (location.hash = "#/sim"), onFinish: (r) => { S().sims.push({ t: Date.now(), n: r.total, ok: r.correct, score: r.score, title: c.title }); save(); } }); };
}
// ---------- Pre-solo written (14 CFR 61.87(b)) ----------
// The regulation: the test covers the applicable sections of Parts 61 and 91, the airspace rules and procedures for the airport
// where the solo flight will be performed, and the flight characteristics and operational limitations of the make and model.
// It is given and graded by the instructor, who reviews every incorrect answer with the student before solo (61.87(b)).
export const PRESOLO_TOPICS = ["rg1.elig", "rg1.solo", "rg1.lim", "rg1.docs", "rg2.pic", "rg2.docs", "rg2.insp", "rg3.eq", "rg3.pre", "rg3.fuel", "rg3.alc", "rg3.alt",
  "gl10.class", "gl10.eg", "gl10.wx", "gl4.legs", "gl4.entry", "gl4.dir", "gl4.tower", "gl4.row", "ap4.mand", "ap7.ctaf", "ap6.gun", "gl2.lim", "em1.speed", "em1.to", "gl11.pic", "gl11.maint", "gl11.ntsb"];
export const AIRPORT_Q = [
  ["Airport name and identifier", "Chart Supplement"], ["Field elevation, and traffic pattern altitude (MSL)", "Chart Supplement; AC 90-66C"],
  ["Runways: numbers, length and width; which ones use right traffic", "Chart Supplement; sectional"], ["Airspace class over the airport, its floor and ceiling, and when it changes (part-time towers)", "Sectional; Chart Supplement"],
  ["Tower hours, tower and ground frequencies, or the CTAF if non-towered", "Chart Supplement"], ["ATIS / AWOS / ASOS frequency or phone number", "Chart Supplement"],
  ["What you must do before entering the airspace (two-way radio? clearance?) and how you'll leave it", "14 CFR 91.126–91.131"], ["Hot spots and the runway crossings on your taxi route", "Airport diagram; Chart Supplement"],
  ["Noise abatement procedures and local practice areas", "Chart Supplement; your school"], ["Nearby airspace you could blunder into: Class B/C shelves, restricted areas, TFRs", "Sectional; NOTAMs"],
  ["Lost-communication plan for this airport (light gun signals if towered)", "AIM 4-2-13, 4-3-13"], ["Your solo limitations as endorsed: wind, visibility, ceiling, runways", "Your instructor's endorsement (61.87(n))"],
];
export function presolo(host) { const p = page(host); const st = S(); st.presolo ||= { airport: "", ans: {} };
  const pool = Object.values(QUESTIONS).filter((q) => PRESOLO_TOPICS.includes(q.t)).map((q) => q.id);
  p.innerHTML = `<section class="hero"><span class="label">Pre-solo written · 14 CFR 61.87(b)</span><h1>Before your first solo</h1><p>Before you solo, your instructor must give you a knowledge test on the applicable parts of 14 CFR 61 and 91, the airspace rules and procedures at the airport where you will solo, and the flight characteristics and operational limitations of your airplane. Your instructor grades it and reviews every incorrect answer with you. This is practice for it. <span class="src">14 CFR 61.87(b)</span></p></section>`;
  const c1 = h("div", { class: "card" }); c1.innerHTML = `<span class="label">Your solo airport</span><p class="dim mt" style="font-size:16px">Type the airport where you will solo. It's saved only in this browser and fills in the worksheet below. The practice test stays generic, because only your instructor and the current Chart Supplement can answer the local questions.</p>`;
  const inp = h("input", { type: "text", value: st.presolo.airport, placeholder: "e.g. airport name or identifier", "aria-label": "Solo airport", maxlength: 60 }); c1.append(h("div", { class: "field mt", style: "max-width:28rem" }, inp)); p.append(c1);
  const c2 = h("div", { class: "card mt" }); p.append(c2);
  const drawWS = () => { const ap = st.presolo.airport.trim() || "your airport"; c2.innerHTML = `<span class="label">Local worksheet · ${esc(ap)}</span><p class="dim mt" style="font-size:16px">Answer each from current sources, then go over it with your instructor. Answers are saved here.</p>`;
    AIRPORT_Q.forEach(([q, src], i) => { const ta = h("textarea", { "aria-label": q, rows: 2, placeholder: "Your answer" }); ta.value = st.presolo.ans[i] || ""; ta.oninput = () => { st.presolo.ans[i] = ta.value; save(); };
      const wrap = h("div", { class: "mt" }); wrap.innerHTML = `<p style="margin:0 0 6px;font-weight:600">${i + 1}. ${esc(q.replace(/your airport/g, ap))}</p><p class="src" style="margin:0 0 8px">${esc(src)}</p>`; wrap.append(ta); c2.append(wrap); }); };
  inp.oninput = () => { st.presolo.airport = inp.value; save(); clearTimeout(inp._t); inp._t = setTimeout(drawWS, 400); }; drawWS();
  const c3 = h("div", { class: "card mt" }); c3.innerHTML = `<span class="label">Practice test · ${Math.min(30, pool.length)} questions</span><p class="dim mt" style="font-size:16px">Drawn from ${pool.length} questions on student pilot rules, airworthiness and equipment, airspace and weather minimums, pattern and airport procedures, and the 172S's limitations. No timer. Aim for 100% after review: that is the real standard.</p>`;
  const b = h("button", { class: "btn pri arrow", type: "button" }, "Start the practice test"); c3.append(h("div", { class: "btns mt" }, b)); p.append(c3);
  b.onclick = () => { p.innerHTML = ""; session(p, { queue: shuffle(pool).slice(0, 30), mode: "exam", passMark: 0.8, title: "Pre-solo written (practice)", label: "Pre-solo written · practice", onExit: () => (location.hash = "#/presolo"), onFinish: (r) => { S().sims.push({ t: Date.now(), n: r.total, ok: r.correct, score: r.score, title: "Pre-solo written" }); save(); } }); };
  p.insertAdjacentHTML("beforeend", foot); }
// ---------- Syllabus coverage checklist ----------
let COV = null;
export function coverage(host) { const p = page(host); p.innerHTML = `<p class="dim">Loading the checklist…</p>`;
  (COV ? Promise.resolve(COV) : fetch("data/coverage.json").then((r) => r.json()).then((j) => (COV = j))).then((cv) => { if (!p.isConnected) return; const st = S(); st.cov ||= {};
    const all = cv.lessons.flatMap((l) => l.items); const done = all.filter((it) => st.cov[it.key]).length;
    p.innerHTML = `<section class="hero"><span class="label">Syllabus checklist</span><h1>Every item, ticked off</h1><p>The content items of a full Part 141 private pilot ground course, lesson by lesson. Tap an item's link to study it, then tick it when you can explain it. Each lesson's standard is 80% on its quiz; each stage check is 80% with every miss reviewed.</p>
      <div class="btns mt" style="gap:22px"><span class="pct">${done} of ${all.length} ticked</span><span class="pct">${all.filter((x) => x.status === "good").length} taught in depth</span></div></section><div class="cov"></div>${foot}`;
    const box = p.querySelector(".cov");
    for (const S0 of STAGES) { const ls = cv.lessons.filter((l) => l.stage === S0.n); if (!ls.length) continue;
      box.insertAdjacentHTML("beforeend", `<h2 class="section-gap">${esc(S0.title)}</h2><p class="dim" style="font-size:15.5px">${esc(S0.sub)}</p>`);
      for (const l of ls) { const L = LESSONS[l.lesson]; const st2 = stats(lessonItems(l.lesson)); const n = l.items.filter((it) => st.cov[it.key]).length;
        const d = h("details", { class: "covl" }); d.innerHTML = `<summary><span class="code">${esc(l.code)}</span><span class="t">${esc(l.title)}</span><span class="pct">${n}/${l.items.length}</span></summary>
          <p class="dim" style="font-size:15px;margin:8px 0 4px">${esc(l.refs || "")}${L ? ` · <a href="#/lesson/${l.lesson}">Open lesson</a> · <a href="#/practice/${l.lesson}">Quiz</a> · readiness ${Math.round(st2.readiness * 100)}%` : ""}</p>`;
        const ul = h("ul", { class: "covlist" });
        l.items.forEach((it) => { const li = h("li", { class: "covi" + (st.cov[it.key] ? " on" : "") }); const cb = h("button", { type: "button", class: "tick", role: "checkbox", "aria-checked": st.cov[it.key] ? "true" : "false", "aria-label": "Tick " + it.item });
          cb.onclick = () => { st.cov[it.key] = !st.cov[it.key]; if (!st.cov[it.key]) delete st.cov[it.key]; save(); li.classList.toggle("on", !!st.cov[it.key]); cb.setAttribute("aria-checked", st.cov[it.key] ? "true" : "false"); d.querySelector("summary .pct").textContent = `${l.items.filter((x) => st.cov[x.key]).length}/${l.items.length}`; };
          const links = (it.where || []).map((w) => `<a href="#/lesson/${w.lesson}/${w.sec}">${esc(w.label)}</a>`).join(" · ");
          const body = h("div"); body.innerHTML = `<div class="ci">${esc(it.item)}${it.status !== "good" ? ` <span class="tag">${esc(it.status)}</span>` : ""}</div><div class="cw">${links}${it.nq ? ` <span class="pct">${it.nq} q</span>` : ""}${it.viz && it.viz.length ? ` <span class="pct">· visual</span>` : ""}${it.note ? `<div class="dim" style="font-size:14px">${esc(it.note)}</div>` : ""}</div>`;
          li.append(cb, body); ul.append(li); });
        d.append(ul); box.append(d); } } })
    .catch((e) => { p.innerHTML = `<h2>Could not load the checklist.</h2><p class="dim">${esc(e.message)}</p>`; }); }
