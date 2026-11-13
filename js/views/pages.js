import { h, esc, pct, fmtDue, toast, download, shuffle } from "../core/util.js?v=c8fe6c3cee";
import { S, save, exportJSON, importJSON, reset } from "../core/store.js?v=c8fe6c3cee";
import { get } from "../core/srs.js?v=c8fe6c3cee";
import { STAGES, MODULES, STAGE_CHECK } from "../../data/course.js?v=c8fe6c3cee";
import { LESSONS, QUESTIONS, ORAL, TOPICS, ORDER, lessonItems } from "../../data/index.js?v=c8fe6c3cee";
import { stats, lessonStats, classify, topicList, dueIds, nextDue, nextLesson, weakest, buildQueue, lessonDone, blindList } from "../core/progress.js?v=c8fe6c3cee";
import { session, practiceSet } from "./quiz.js?v=c8fe6c3cee";
import { G, rich } from "../core/rich.js?v=c8fe6c3cee";
const page = (host) => { const p = h("div", { class: "page" }); host.append(p); return p; };
const meter = (x, big) => `<div class="meter${big ? " big" : ""}"><i style="width:${Math.round(x * 100)}%"></i></div>`;
const stageLessons = (s) => [...s.ground, ...s.flight].flatMap((id) => [id, ...((LESSONS[id] && LESSONS[id].includes) || [])]);
const stageIds = (s) => stageLessons(s).flatMap((id) => lessonItems(id, { deep: false }));
const allCourseIds = () => [...new Set([...STAGES.flatMap(stageIds), ...MODULES.flatMap((m) => m.units).flatMap((id) => lessonItems(id, { deep: false }))])];
const curStage = () => { const nl = nextLesson(); const L = nl && LESSONS[nl]; return STAGES.find((s) => s.n === ((L && L.stage) || 1)) || STAGES[0]; };
const foot = () => `<div class="footer">Squawk School is a study aid for ground training. It does not replace instruction from an authorized instructor, the FAA handbooks, the regulations, or your aircraft's Pilot's Operating Handbook. Figures for the Cessna 172S are stated from the manufacturer's published limitations for study; always use the POH for the airplane you fly. <a href="#/about">Sources and licenses</a></div>`;

export function home(host) {
  const p = page(host); const CS = curStage(); const st = stats(stageIds(CS)); const due = dueIds(); const weak = weakest(3); const nl = nextLesson(); const L = nl && LESSONS[nl];
  // No progress = no question or oral item answered yet. Until then the page is just a clear way in: no empty progress cards.
  const answered = Object.values(S().items).some((it) => it && it.n > 0);
  if (!answered) {
    const started = Object.keys(S().lessons).length > 0 && L;
    const go = started ? `#/lesson/${L.id}` : `#/lesson/${ORDER.find((id) => LESSONS[id])}/0`;
    p.innerHTML = `<section class="hero hero-start"><span class="label">Private pilot ground school</span><h1>Learn it. Squawk it.</h1>
  <p>Short lessons, visuals you can play with, and questions that come back right before you would forget them.</p>
  <div class="btns start-btns"><a class="btn pri arrow" id="begin" href="${go}">${started ? `Continue ${esc(L.code)}` : "Begin"}</a><a class="btn ghost" href="#/course">Browse the course</a></div></section>
  <section class="start-about"><span class="label">How it works</span><p>Squawk School is built on the FAA handbooks, the Airman Certification Standards and 14 CFR. Read a lesson, try the visuals, then answer. Every question is scheduled for review and the ones you are losing come back, so one right answer never counts as knowing it. Your review queue and weakest areas show up here once you have answered a few questions.</p></section>`;
    p.insertAdjacentHTML("beforeend", foot()); return;
  }
  p.innerHTML = `<section class="hero"><span class="label">${esc(CS.title)} · ${esc(CS.sub)}</span><h1>What to work on now</h1>
  <p>Reviews that are due come first, then the areas you are weakest in, then new material.</p></section>`;
  // Cards appear only when they have something in them. The first card's button is the primary one.
  const open = blindList(); const ready = blindList({ ready: true }); const cells = [];
  const openSet = new Set(open); const dueOther = due.filter((id) => !openSet.has(id));   // ready blind spots are counted on their own card
  const nextBlind = () => Math.min(...open.map((id) => (get(id) ? get(id).due : Infinity)));
  if (open.length) cells.push((pri) => `<a class="cell" href="#/blindspots" id="blind-card"><span class="label">Blind spots</span><div class="num">${open.length}<small>${open.length === 1 ? "question" : "questions"}</small></div><p>${ready.length ? `Questions you missed, back for another try. ${ready.length === open.length ? "All ready now." : `${ready.length} ready now.`}` : `Questions you missed. The next one is back ${fmtDue(nextBlind())}.`}</p><span class="go btn ${pri ? "pri" : ""} arrow">${ready.length ? "Review blind spots" : "Open blind spots"}</span></a>`);
  if (dueOther.length) cells.push((pri) => `<a class="cell" href="#/review"><span class="label">Due for review</span><div class="num">${dueOther.length}<small>${dueOther.length === 1 ? "item" : "items"}</small></div><p>Answer these before they fade.</p><span class="go btn ${pri ? "pri" : ""} arrow">Start review</span></a>`);
  if (weak.length) cells.push((pri) => `<a class="cell" href="#/drill/${weak[0].t.id}"><span class="label">Weakest area</span><h3>${esc(weak[0].t.title)}</h3><p>${{ over: "You answered certain and were wrong here. Fix this first.", weak: "Recent accuracy is low or items keep slipping.", fading: "You knew this, but reviews are overdue.", building: "Still early. A few more spaced reviews will lock it in." }[weak[0].c]} ${LESSONS[weak[0].t.lesson].code}.</p>${meter(weak[0].st.readiness)}<span class="go btn ${pri ? "pri" : ""} arrow">Drill it</span></a>`);
  cells.push((pri) => L ? `<a class="cell" href="#/lesson/${L.id}"><span class="label">Next lesson · ${esc(L.code)}</span><h3>${esc(L.title)}</h3><p>${esc(L.short || "")}</p><span class="go btn ${pri ? "pri" : ""} arrow">${S().lessons[L.id] ? "Continue" : "Begin"}</span></a>` : `<a class="cell" href="#/check/s4"><span class="label">Next</span><h3>End-of-course exam</h3><p>Every lesson is read. Take the mixed written and oral exam.</p><span class="go btn ${pri ? "pri" : ""} arrow">Start</span></a>`);
  // primary: ready blind spots, else due reviews, else the next lesson
  const priAt = open.length && ready.length ? 0 : dueOther.length ? (open.length ? 1 : 0) : cells.length - 1;
  const g = h("div", { class: "grid " + (cells.length === 3 ? "g3" : cells.length === 1 ? "" : "g2") }); p.append(g);
  g.innerHTML = cells.map((c, k) => c(k === priAt)).join("");
  const r = h("section", { class: "section-gap" }); p.append(r);
  r.innerHTML = `<div class="list-head"><span class="label">${esc(CS.title)} readiness</span><span class="pct">${pct(st.readiness)}</span></div>${meter(st.readiness, true)}
  <div class="grid g3 mt"><div class="cell"><span class="label">Seen</span><div class="num">${st.seen}<small>of ${st.total}</small></div><p>Questions and oral items you have answered at least once.</p></div>
  <div class="cell"><span class="label">Mastered</span><div class="num">${st.mastered}</div><p>Recalled correctly across spaced reviews until the next review is three weeks or more away.</p></div>
  <a class="cell" href="#/map"><span class="label">Certain but wrong</span><div class="num">${st.over}</div><p>Open blind spots you had marked Certain. These are the dangerous ones.</p><span class="go btn ghost arrow" style="padding:0">Blind spots</span></a></div>
  <p class="dim mt" style="font-size:15px">Readiness counts each question by your latest answer: Certain and correct counts fully, Fairly sure counts half, and a guess, a miss or an unseen question counts zero. <a href="#/coverage">Syllabus checklist</a></p>`;
  p.insertAdjacentHTML("beforeend", foot());
}
function row(L) { const st = lessonStats(L.id); const done = lessonDone(L.id);
  return `<a class="row" href="#/lesson/${L.id}"><span class="code">${esc(L.code)}</span><span><div class="t">${esc(L.title)}${L.kind === "module" ? ' <span class="tag">Unit</span>' : ""}</div><div class="s">${esc(L.short || "")}${done ? " · read" : ""}</div></span><span><div class="meter"><i style="width:${Math.round(st.readiness * 100)}%"></i></div></span></a>`; }
export function course(host) {
  const p = page(host);
  const inc = (L) => (L.includes || []).map((u) => LESSONS[u]).filter(Boolean);
  const stageBlock = (S0) => `<section class="section-gap"><div class="list-head"><span class="label">${esc(S0.title)} · ground</span><span class="label">Readiness</span></div>
    <p class="dim" style="font-size:15.5px;margin:10px 6px 6px">${esc(S0.sub)}</p>
    ${S0.ground.map((id) => { const L = LESSONS[id]; const kids = inc(L); return row(L) + (kids.length ? `<div class="subrows">${kids.map((U) => row(U)).join("")}</div>` : ""); }).join("")}
    ${S0.flight.length ? `<div class="list-head section-gap"><span class="label">${esc(S0.title)} · flight lesson briefings</span><span class="label">Readiness</span></div>${S0.flight.map((id) => row(LESSONS[id])).join("")}` : ""}</section>`;
  p.innerHTML = `<section class="hero"><span class="label">Course</span><h1>Four stages, nineteen ground lessons</h1><p>Sequenced like a Part 141 private pilot syllabus and keyed to the Private Pilot ACS. Indented rows are units taught inside the lesson above them. The bar on each row is readiness: what you would recall today.</p>
  <div class="btns mt"><a class="btn pri arrow" href="#/coverage">Syllabus checklist</a><a class="btn arrow" href="#/presolo">Pre-solo written</a></div></section>
  ${STAGES.map(stageBlock).join("")}
  <div class="list-head section-gap"><span class="label">Modules · the same units grouped by subject</span><span class="label">Readiness</span></div>
  ${MODULES.map((m) => { const st = stats(m.units.flatMap((u) => lessonItems(u))); return `<a class="row" href="#/module/${m.id}"><span class="code">${esc(m.id.toUpperCase().slice(0, 6))}</span><span><div class="t">${esc(m.title)}</div><div class="s">${esc(m.sub)}</div></span><span><div class="meter"><i style="width:${Math.round(st.readiness * 100)}%"></i></div></span></a>`; }).join("")}
  ${foot()}`;
}
export function moduleView(host, id) { const m = MODULES.find((x) => x.id === id); const p = page(host); if (!m) { p.innerHTML = "<h2>Module not found.</h2>"; return; }
  const ids = m.units.flatMap((u) => lessonItems(u));
  p.innerHTML = `<section class="hero"><span class="label">Module${m.partOf ? " · part of " + LESSONS[m.partOf].code : ""}</span><h1>${esc(m.title)}</h1><p>${esc(m.sub)}. Each unit stands alone and has its own questions in your review schedule.</p><div class="btns mt"><a class="btn pri arrow" href="#/practice/mod-${m.id}">Practice this module</a></div></section>
  <div class="list-head"><span class="label">Units</span><span class="label">Readiness</span></div>${m.units.map((u) => row(LESSONS[u])).join("")}${foot()}`; }
function runSession(host, opts) { const p = page(host); const s = session(p, { ...opts, onExit: opts.onExit || (() => history.length > 1 ? history.back() : (location.hash = "#/")) }); return s; }
export function review(host) { const due = dueIds(); const pool = allCourseIds();
  const seen = pool.filter((id) => get(id) && get(id).n).sort((a, b) => (get(a).ivl - get(b).ivl));
  const b = new Set(blindList({ ready: true })); const queue = [...due.filter((id) => b.has(id)).slice(0, 10), ...due.filter((id) => !b.has(id))].slice(0, 25);
  return runSession(host, { queue, more: (ex) => [...due, ...seen].filter((id) => !ex.has(id)).slice(0, 10), mode: "review", title: "Review", label: `Review · ${due.length} due`, intro: due.length ? "" : (seen.length ? `Next review ${fmtDue(nextDue())}. You can keep going ahead of schedule; early correct answers do not stretch your schedule.` : "Nothing is scheduled yet. Open a lesson and answer its questions to start your review schedule."), onExit: () => (location.hash = "#/") }); }
// Every open blind spot whose 12-hour wait is over, Certain misses first.
export function blindspots(host) { const open = blindList(); const ready = () => blindList({ ready: true });
  const next = Math.min(...open.map((id) => (get(id) ? get(id).due : Infinity)));
  return runSession(host, { queue: ready().slice(0, 25), more: (ex) => ready().filter((id) => !ex.has(id)).slice(0, 10), mode: "review", title: "Blind spots", label: `Blind spots · ${open.length}`,
    intro: open.length ? `Your ${open.length} blind spot${open.length > 1 ? "s are" : " is"} waiting out the 12 hours. The next one is back ${fmtDue(next)}.` : "No blind spots right now. A question you miss lands here and comes back 12 hours later.", onExit: () => (location.hash = "#/") }); }
export function practice(host, id) {
  let ids, title;
  if (id.startsWith("mod-")) { const m = MODULES.find((x) => "mod-" + x.id === id); if (!m) return; ids = m.units.flatMap((u) => lessonItems(u, { oral: false })); title = m.title; }
  else { const L = LESSONS[id]; if (!L) return; ids = lessonItems(id, { oral: false, deep: !L.includes }); title = `${L.code} · ${L.title}`; }
  const p = page(host); return practiceSet(p, { ids, key: id, title, label: title, onExit: () => (location.hash = id.startsWith("mod-") ? "#/module/" + id.slice(4) : "#/lesson/" + id) }); }
export function drill(host, tid) { const t = TOPICS[tid]; const ids = topicList().find((x) => x.id === tid)?.ids || [];
  const sorted = ids.slice().sort((a, b) => { const A = get(a), B = get(b); return (A ? A.ivl : -1) - (B ? B.ivl : -1); });
  const due = sorted.filter((id) => !get(id) || !get(id).n || get(id).due <= Date.now() || get(id).reps === 0);
  return runSession(host, { queue: (due.length ? due : sorted).slice(0, 15), more: (ex) => sorted.filter((id) => !ex.has(id) && !ORAL[id]).slice(0, 10), mode: due.length ? "learn" : "ahead", title: t ? t.title : "Drill", label: `Drill · ${t ? t.title : ""}`, onExit: () => (location.hash = "#/map") }); }
export function map(host) {
  const p = page(host); const tl = topicList().filter((t) => LESSONS[t.lesson]); const rows = tl.map((t) => { const st = stats(t.ids); return { t, st, c: classify(t, st) }; });
  const by = (c) => rows.filter((r) => r.c === c);
  const tile = (r) => `<a class="tile ${r.c === "weak" ? "weak" : r.c === "over" ? "over" : ""}" href="#/drill/${r.t.id}"><span class="label">${esc(LESSONS[r.t.lesson].code)}</span><span class="t">${esc(r.t.title)}</span><span class="f"><span class="pct">${r.st.seen ? pct(r.st.readiness) : "unseen"}</span><span class="tag ${r.c === "over" ? "acc" : ""}">${{ over: "certain, wrong", weak: "weak", fading: "fading", strong: "strong", building: "building", unseen: "never seen" }[r.c]}</span></span>${meter(r.st.readiness)}</a>`;
  const block = (title, sub, list) => list.length ? `<section class="section-gap"><div class="list-head"><span class="label">${title}</span><span class="pct">${list.length}</span></div><p class="dim" style="font-size:15.5px;margin:12px 0 18px">${sub}</p><div class="heat">${list.map(tile).join("")}</div></section>` : "";
  const any = rows.some((r) => r.st.seen);
  p.innerHTML = `<section class="hero"><span class="label">Blind-spot map</span><h1>Where you are weak</h1><p>Every topic in the course, sorted by what needs you most. A topic is weak when recent answers are mostly wrong or items keep slipping. Certain-but-wrong means you tapped certain and missed it, which is the most dangerous kind of gap in an airplane.</p></section>
  ${blindList().length ? `<div class="card" id="blind-open"><div class="list-head" style="margin:0"><span class="label">Open blind spots</span><span class="pct">${blindList().length}</span></div><p class="dim mt" style="font-size:16px">Questions you missed. Each comes back 12 hours after the miss and clears after a few correct answers on different days.</p><div class="btns mt"><a class="btn pri arrow" href="#/blindspots">Review blind spots</a></div></div>` : ""}
  ${any ? "" : `<div class="card"><h3>No answers yet.</h3><p class="dim mt">Answer a few questions in any lesson and this map fills in. Tap "How sure are you?" honestly; it is how the map finds overconfidence.</p></div>`}
  ${block("Certain but wrong", "You were sure and you were wrong. Drill these first.", by("over"))}
  ${block("Weak", "Low recent accuracy or repeated lapses.", by("weak"))}
  ${block("Fading", "You knew these; reviews are overdue, so recall is dropping.", by("fading"))}
  ${block("Building", "Seen, not yet secure. Spaced reviews will carry these to strong.", by("building"))}
  ${block("Strong", "High estimated recall across nearly all items. They still come back for review.", by("strong"))}
  ${block("Never seen", "Topics you have not answered anything in yet.", by("unseen"))}
  ${foot()}`;
}
export function tools(host) { const p = page(host); const sims = S().sims || [];
  p.innerHTML = `<section class="hero"><span class="label">Tools</span><h1>Test yourself honestly</h1><p>Oral exam practice, a timed stage check, the glossary, and your saved progress.</p></section>
  <div class="grid g2"><a class="cell" href="#/oral"><span class="label">Oral exam</span><h3>Questions an examiner asks</h3><p>Open questions keyed to ACS elements. Answer out loud, compare with the model answer, and grade yourself. Your grade feeds the review schedule.</p><span class="go btn arrow">Start</span></a>
  <a class="cell" href="#/sim"><span class="label">Stage checks</span><h3>Written and oral, 80% to pass</h3><p>Stage 1, 2 and 3 checks and the end-of-course exam. Timed written tests with no hints, and oral exams you grade yourself. Every miss is reviewed and goes into your review schedule.${sims.length ? ` Last score ${Math.round(sims[sims.length - 1].score * 100)}%.` : ""}</p><span class="go btn arrow">Start</span></a>
  <a class="cell" href="#/presolo"><span class="label">Pre-solo written · 14 CFR 61.87(b)</span><h3>Before your first solo</h3><p>A practice pre-solo knowledge test on Parts 61 and 91, airspace and procedures at your airport, and the airplane's limits. Plus a worksheet for your own airport.</p><span class="go btn arrow">Open</span></a>
  <a class="cell" href="#/coverage"><span class="label">Syllabus checklist</span><h3>Every item, ticked off</h3><p>All 19 ground lessons and every content item, with links to where each one is taught. Tick items as you finish them.</p><span class="go btn arrow">Open</span></a>
  <a class="cell" href="#/lesson/vs1"><span class="label">V-speeds · POH Sec 2</span><h3>What V<sub>FE</sub>, V<sub>NO</sub> and V<sub>Y</sub> mean</h3><p>Every V-speed on the 172S airspeed indicator and the ones that are not on it. Tap a speed to light up its arc or line.</p><span class="go btn arrow">Open</span></a>
  <a class="cell" href="#/glossary"><span class="label">Glossary</span><h3>${Object.keys(G).length} terms</h3><p>Every underlined term in a lesson opens its definition. Browse or search them all here.</p><span class="go btn arrow">Open</span></a>
  <a class="cell" href="#/settings"><span class="label">Progress and settings</span><h3>Your data stays here</h3><p>Progress is saved only in this browser. Export it to a file to move devices or keep a backup.</p><span class="go btn arrow">Open</span></a></div>${foot()}`; }
export function oral(host, lid) {
  const pool = Object.values(ORAL).filter((o) => (lid && lid !== "all" ? o.lesson === lid : true)).map((o) => o.id);
  if (!lid) { const p = page(host); const lessonsWithOral = [...new Set(Object.values(ORAL).map((o) => o.lesson))];
    p.innerHTML = `<section class="hero"><span class="label">Oral exam</span><h1>Say it out loud</h1><p>An examiner asks open questions and follows up. Answer aloud as if at the table, then compare with the model answer. Grade yourself honestly; "partly" schedules it sooner.</p></section>
    <div class="btns"><a class="btn pri arrow" href="#/oral/all">Everything · ${pool.length}</a>${STAGES.slice(0, 3).map((s) => `<a class="btn arrow" href="#/check/${s.id}/oral">${esc(s.title)} oral check</a>`).join("")}</div><div class="list-head section-gap"><span class="label">By lesson</span><span class="label">Items</span></div>
    ${lessonsWithOral.map((id) => `<a class="row" href="#/oral/${id}"><span class="code">${esc(LESSONS[id].code)}</span><span><div class="t">${esc(LESSONS[id].title)}</div></span><span class="pct">${Object.values(ORAL).filter((o) => o.lesson === id).length}</span></a>`).join("")}${foot()}`; return; }
  const ids = lid === "all" ? pool.concat() : Object.values(ORAL).filter((o) => o.lesson === lid).map((o) => o.id);
  const { queue, extra } = buildQueue(ids, { includeOral: true, max: 12, newMax: 12 });
  return runSession(host, { queue: queue.length ? queue : shuffle(ids).slice(0, 10), extra, mode: "oral", title: "Oral exam", label: "Oral exam" + (lid !== "all" ? " · " + LESSONS[lid].code : ""), onExit: () => (location.hash = "#/oral") });
}
export { sim, check } from "./checks.js?v=c8fe6c3cee";
export function glossary(host, focus) { const p = page(host); const keys = Object.keys(G).sort(); const slug = (k) => k.replace(/\s+/g, "-");
  p.innerHTML = `<section class="hero"><span class="label">Glossary</span><h1>Terms, plainly</h1><p>Every underlined term in a lesson opens its definition. Airspeed symbols like V<sub>FE</sub> are explained with the dial in <a href="#/lesson/vs1">V-speeds</a>.</p></section>`;
  const inp = h("input", { type: "search", placeholder: "Search terms", "aria-label": "Search terms" }); p.append(h("div", { class: "field", style: "max-width:28rem" }, inp)); const list = h("div", { class: "mt" }); p.append(list);
  const draw = () => { const q = inp.value.trim().toLowerCase(); list.innerHTML = keys.filter((k) => !q || k.includes(q) || G[k].def.toLowerCase().includes(q)).map((k) => `<div class="row grow" id="g-${esc(slug(k))}" style="grid-template-columns:1fr;gap:6px"><div class="t">${esc(G[k].term)}</div><div class="s" style="font-size:16px">${G[k].def}${G[k].src ? ` <span class="src">${esc(G[k].src)}</span>` : ""}${G[k].more ? ` <a class="src" href="${esc(G[k].more[0])}">${esc(G[k].more[1])}</a>` : ""}</div></div>`).join("") || `<p class="dim">No match.</p>`; };
  inp.oninput = draw; draw();
  if (focus) { const row = list.querySelector(`#g-${CSS.escape(slug(focus.toLowerCase()))}`); if (row) { row.classList.add("hit"); setTimeout(() => row.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }), 60); } } }
export function settings(host) { const p = page(host); const st = S();
  p.innerHTML = `<section class="hero"><span class="label">Progress and settings</span><h1>Your data, your device</h1><p>Nothing leaves this browser. No account, no server. Clearing site data erases progress, so export a backup now and then.</p></section>`;
  const c1 = h("div", { class: "card" }); c1.innerHTML = `<span class="label">Confidence check</span><p class="dim mt" style="font-size:16px">After you pick an answer, tap how sure you are. A correct guess comes back in 12 hours like a miss, and only Certain and correct answers count fully toward readiness. With this off, a correct answer counts as Fairly sure.</p>`;
  const ch = h("div", { class: "chips mt" }); [["on", "On"], ["off", "Off"]].forEach(([v, t]) => { const b = h("button", { class: "chip" + ((st.settings.confidence ? "on" : "off") === v ? " on" : ""), type: "button" }, t); b.onclick = () => { st.settings.confidence = v === "on"; save(); ch.querySelectorAll(".chip").forEach((x) => x.classList.toggle("on", x === b)); }; ch.append(b); }); c1.append(ch);
  const c2 = h("div", { class: "card" }); c2.innerHTML = `<span class="label">New questions per session</span><p class="dim mt" style="font-size:16px">How many never-seen questions a practice session adds after due reviews.</p>`;
  const ch2 = h("div", { class: "chips mt" }); [6, 12, 20].forEach((n) => { const b = h("button", { class: "chip" + (st.settings.newPerSession === n ? " on" : ""), type: "button" }, String(n)); b.onclick = () => { st.settings.newPerSession = n; save(); ch2.querySelectorAll(".chip").forEach((x) => x.classList.toggle("on", x === b)); }; ch2.append(b); }); c2.append(ch2);
  const c3 = h("div", { class: "card" }); c3.innerHTML = `<span class="label">Backup</span><p class="dim mt" style="font-size:16px">${Object.keys(st.items).length} items with history. Started ${new Date(st.created).toLocaleDateString()}.</p>`;
  const ex = h("button", { class: "btn", type: "button" }, "Export progress"); ex.onclick = () => download(`squawk-school-progress-${new Date().toISOString().slice(0, 10)}.json`, exportJSON());
  const file = h("input", { type: "file", accept: "application/json,.json", hidden: true }); const im = h("button", { class: "btn", type: "button" }, "Import progress"); im.onclick = () => file.click();
  file.onchange = async () => { const f = file.files[0]; if (!f) return; try { const t = await f.text(); if (!confirm("Replace the progress in this browser with the file's progress?")) return; importJSON(t); toast("Progress imported."); location.hash = "#/"; } catch (e) { toast(e.message || "Import failed."); } };
  const rs = h("button", { class: "btn ghost", type: "button" }, "Reset everything"); rs.onclick = () => { if (confirm("Erase all progress in this browser? Export first if you want a backup.")) { reset(); toast("Progress erased."); location.hash = "#/"; } };
  c3.append(h("div", { class: "btns mt" }, ex, im, rs, file));
  p.append(c1, c2, c3); p.insertAdjacentHTML("beforeend", `<div class="card"><span class="label">How review scheduling works</span><div class="prose mt" style="font-size:16px"><p>Each question has its own schedule (a variant of the SM-2 spaced repetition algorithm). A question is never repeated in the same session. A miss resets its schedule and brings it back 12 hours later as a blind spot; a correct guess also comes back in 12 hours. A correct answer pushes it out to 1 day, then 3 days, then longer intervals that grow with how easily you recall it.</p><p>Blind spots also come back inside later lessons' sessions, up to 3 at a time. One clears after correct answers on two different days, or three if you had marked it Certain.</p><p>Readiness counts each question by your latest answer: Certain and correct counts 100%, Fairly sure and correct 50%, a guess or a miss 0%. A lesson reaches 100% only when every question has been answered Certain and correct. An item counts as mastered only when its next review is three weeks or more away and its latest answer was Certain.</p></div></div>`);
  p.insertAdjacentHTML("beforeend", foot()); }
export function about(host) { const p = page(host);
  p.innerHTML = `<section class="hero"><span class="label">About Squawk School</span><h1>Sources and licenses</h1><p>Squawk School is private pilot ground school you can study anywhere: every lesson, visual and check below is built from the FAA sources listed here.</p></section><div class="prose">
  <h4>Teaching sources</h4><ul><li>Pilot's Handbook of Aeronautical Knowledge, FAA-H-8083-25C (PHAK)</li><li>Airplane Flying Handbook, FAA-H-8083-3C (AFH)</li><li>Aviation Weather Handbook, FAA-H-8083-28A (AWH)</li><li>Private Pilot for Airplane Category Airman Certification Standards, FAA-S-ACS-6C (ACS)</li><li>Aeronautical Information Manual (AIM), chapters 2, 4 and 7</li><li>14 CFR Parts 61 and 91, current text from the eCFR</li><li>AC 150/5340-1M Standards for Airport Markings; AC 150/5340-18H Standards for Airport Sign Systems; AC 90-66C Non-Towered Airport Flight Operations</li><li>Cessna 172S limitations and performance figures as published by the manufacturer, stated as facts for study. No manufacturer text or figures are reproduced. Use the POH for your airplane.</li></ul>
  <p>Citations name the chapter, section or regulation. Procedures are marked to confirm with your instructor and your aircraft's POH, because flight schools and airplanes differ.</p>
  <h4>Software and fonts</h4><ul><li>three.js r181, MIT License</li><li>GSAP 3.14, GreenSock Standard "No Charge" License (vendored, not loaded in this build)</li><li>Inter and IBM Plex Mono, SIL Open Font License 1.1</li></ul><p>License texts are in the LICENSES folder.</p>
  <h4>Not affiliated</h4><p>Squawk School is an independent study aid. Not affiliated with or endorsed by the FAA or Textron Aviation. Cessna and Skyhawk are trademarks of their owner.</p></div>`; }
export { coverage, presolo } from "./checks.js?v=c8fe6c3cee";
