import { h, esc, pct } from "../core/util.js?v=310241b6ff";
import { S, save, lessonState } from "../core/store.js?v=310241b6ff";
import { LESSONS, lessonItems } from "../../data/index.js?v=310241b6ff";
import { lessonStats, onlyReached, nextLesson } from "../core/progress.js?v=310241b6ff";
import { plan, pick, wrapPool, pageIds, pageStats, pageBlind, cpState, cpMark, finish } from "../core/flow.js?v=310241b6ff";
import { get } from "../core/srs.js?v=310241b6ff";
import { rich, autoTerms } from "../core/rich.js?v=310241b6ff";
import { mountViz, destroyAll } from "../viz/index.js?v=310241b6ff";
import { practiceSet, allLabel, session } from "./quiz.js?v=310241b6ff";
import { mergeSections } from "./merge-sections.js?v=310241b6ff";
export { mergeSections };
const KIND = { ground: "Ground lesson", flight: "Flight lesson briefing", module: "Module unit" };
// Lesson text is code-split: question banks load up front (the review engine needs them); prose loads when the lesson opens.
// Supplement sections (data/text/x/<id>.js) slot in after the section named by `at` ("^" = first), else at the end.
export function loadLesson(id) { const L0 = LESSONS[id]; if (!L0) return Promise.reject(new Error("Lesson not found."));
  return Promise.all([import(`../../data/text/${id}.js?v=310241b6ff`), L0.textx ? import(`../../data/text/x/${id}.js?v=310241b6ff`) : null])
    .then(([m, x]) => ({ ...L0, ...m.default, sections: mergeSections(m.default.sections || [], x ? x.default.sections || [] : []) })); }
// One page of lesson prose with its visuals, Know/Do/Risk card and ACS codes (also used by the Review blind spots lesson).
export function renderPage(sec, S0, terms = autoTerms) {
  sec.innerHTML = `<span class="label">${esc(S0.label)}</span><h2>${esc(S0.title)}</h2>`;
  const pr = h("div", { class: "prose mt" }); pr.innerHTML = rich(S0.body); sec.append(pr);
  // Visuals sit right after the short explanation (first paragraph) at full width; the rest of the prose continues below.
  let anchor = null; (S0.viz ? [].concat(S0.viz) : []).forEach((v) => { const vh = h("div");
    if (anchor) anchor.after(vh);
    else { const at = v.after === "end" ? null : v.after ? pr.querySelector(v.after) : pr.firstElementChild;
      if (at && at.parentNode === pr && at.nextElementSibling) { const rest = h("div", { class: "prose" }); while (at.nextSibling) rest.append(at.nextSibling); pr.after(vh, rest); } else pr.after(vh); }
    anchor = vh; mountViz(vh, v); });
  if (S0.body2) { const p2 = h("div", { class: "prose mt" }); p2.innerHTML = rich(S0.body2); sec.append(p2); }
  if (S0.kdr) { const k = h("div", { class: "kdr" }); k.innerHTML = [["Know it", S0.kdr.k], ["Do it", S0.kdr.d], ["Manage the risk", S0.kdr.r]].map(([t, x]) => `<div><span class="label">${t}</span><p>${rich(x || "")}</p></div>`).join(""); sec.append(k); if (S0.kdr.codes) sec.append(h("p", { class: "src", style: "margin-top:10px;white-space:normal" }, "ACS " + [].concat(S0.kdr.codes).join(", "))); }
  terms(sec); }
export function lessonView(host, id, secIdx) {
  const L0 = LESSONS[id]; const p = h("div", { class: "page" }); host.append(p);
  if (!L0) { p.innerHTML = `<h2>Lesson not found.</h2>`; return; }
  let api = { destroy() {} }; let dead = false;
  loadLesson(id).then((T) => { if (dead) return; api = build(p, T, id, secIdx); })
    .catch((e) => { p.innerHTML = `<h2>Could not load this lesson.</h2><p class="dim mt">${esc(e.message)}</p>`; });
  return { destroy() { dead = true; api.destroy(); } };
}
// Old links and saved places: a number is a page index (one past the pages = briefing card if any, else the end of the
// lesson); a string is a page id or a step key (check1, check2, brief, wrap).
function resolve(steps, sections, hasPrep, v) { const at = (key) => steps.findIndex((s) => s.key === key);
  if (typeof v === "number") return v < sections.length ? at(String(v)) : hasPrep && v === sections.length ? at("brief") : at("wrap");
  if (typeof v === "string") { const k = sections.findIndex((s) => s.id === v); if (k >= 0) return at(String(k)); if (v === "check" || v === "checkyourself") return at("wrap"); const i = at(v); return i >= 0 ? i : null; }
  return null; }
function build(p, L, id, secIdx) {
  const ls = lessonState(id); ls.visited = Date.now(); ls.total = L.sections.length;
  const sections = L.sections.slice(); const hasPrep = !!L.prep; const steps = plan(id, sections, hasPrep);
  let cur = resolve(steps, sections, hasPrep, secIdx);
  if (cur == null || cur < 0) { const a = ls.at != null ? resolve(steps, sections, hasPrep, ls.at) : null; cur = a != null && a >= 0 ? a : resolve(steps, sections, hasPrep, ls.sec || 0);
    if (cur == null || cur < 0 || steps[cur].kind === "wrap") cur = 0; }
  const nItems = lessonItems(id).length;
  const top = h("section", { class: "hero", style: "margin-bottom:0" });
  const tagLine = `${L.code} · Stage ${L.stage || 1} · ${KIND[L.kind] || ""}`;
  top.innerHTML = `<span class="label">${esc(tagLine)}</span><h1>${esc(L.title)}</h1>${L.intro ? `<p>${rich(L.intro)}</p>` : ""}
   <div class="btns mt" style="gap:22px"><span class="pct" id="lready">${nItems} items · readiness ${pct(lessonStats(id).readiness)}</span>${L.refs ? `<span class="src" style="white-space:normal">${esc(L.refs.join(" · "))}</span>` : ""}</div>`;
  // the V-speeds lesson defines these terms in place, so it skips the dotted underlines
  const terms = id === "vs1" ? () => {} : autoTerms;
  terms(top.querySelector("p")); p.append(top);
  if (L.includes) { const inc = h("div", { class: "mt" }); inc.innerHTML = `<div class="list-head mt2"><span class="label">This lesson includes these units</span><span class="label">Readiness</span></div>${L.includes.map((u) => { const U = LESSONS[u]; const s = lessonStats(u); return `<a class="row" href="#/lesson/${u}"><span class="code">${U.code}</span><span><div class="t">${esc(U.title)}</div><div class="s">${esc(U.short || "")}</div></span><span><div class="meter"><i style="width:${Math.round(s.readiness * 100)}%"></i></div></span></a>`; }).join("")}`; p.append(inc); }
  const stepBar = h("nav", { class: "steps", "aria-label": "Lesson steps" }); p.append(stepBar);
  // Every page with its readiness, so the weak parts of a lesson are easy to spot and open.
  const plist = h("details", { class: "pagelist" }); plist.innerHTML = `<summary><span class="label">Pages and readiness</span><span class="label pl-now"></span></summary><div class="plist"></div>`; p.append(plist);
  const body = h("div"); p.append(body);
  steps.forEach((s, i) => { const b = h("button", { type: "button", "aria-label": s.label, title: s.label, class: s.kind === "cp" || s.kind === "wrap" ? "cp" : "" }); b.onclick = () => go(i); stepBar.append(b); });
  const stepDone = (s) => s.kind === "sec" ? ls.read.includes(sections[s.si].id) : s.kind === "cp" ? !!cpState(id, s.key) : s.kind === "wrap" ? !!ls.fin : false;
  function mark() { [...stepBar.children].forEach((b, i) => { b.classList.toggle("on", i === cur); b.classList.toggle("done", stepDone(steps[i])); b.setAttribute("aria-current", i === cur ? "step" : "false"); });
    p.querySelector("#lready").textContent = `${nItems} items · readiness ${pct(lessonStats(id).readiness)}`; drawList(); }
  function drawList() { const nPages = sections.length; const s0 = steps[cur];
    plist.querySelector(".pl-now").textContent = s0.kind === "sec" ? `Page ${s0.si + 1} of ${nPages}` : s0.label;
    plist.querySelector(".plist").innerHTML = steps.map((s, i) => { const on = i === cur ? " on" : "";
      if (s.kind === "sec") { const S0 = sections[s.si]; const n = pageIds(id, S0.id).length; const read = ls.read.includes(S0.id); const st = pageStats(id, S0.id); const bl = pageBlind(id, S0.id);
        const r = !n ? `<span class="pr dim">no questions</span>` : !read ? `<span class="pr dim">not read</span>` : `${bl ? `<span class="tag acc">Blind spot</span>` : ""}<span class="meter"><i style="width:${Math.round(st.readiness * 100)}%"></i></span><span class="pr">${pct(st.readiness)}</span>`;
        return `<button type="button" class="prow${on}" data-i="${i}"><span class="n">${String(s.si + 1).padStart(2, "0")}</span><span class="t">${esc(S0.title || S0.label)}</span><span class="r">${r}</span></button>`; }
      const c = s.kind === "cp" ? cpState(id, s.key) : null; const state = s.kind === "cp" ? (c ? (c.skip ? "skipped" : `${c.ok} of ${c.n} right`) : `${s.size} questions`) : s.kind === "wrap" ? (ls.fin ? "finished" : "") : "";
      return `<button type="button" class="prow chk${on}" data-i="${i}"><span class="n">${(s.kind === "cp" && c) || (s.kind === "wrap" && ls.fin) ? "✓" : "··"}</span><span class="t">${esc(s.label)}</span><span class="r"><span class="pr dim">${esc(state)}</span></span></button>`; }).join("");
    plist.querySelectorAll(".prow").forEach((b) => (b.onclick = () => { plist.open = false; go(+b.dataset.i); })); }
  const legacy = (s) => s.kind === "sec" ? s.si : s.kind === "cp" ? s.to : sections.length;
  function go(i, scroll = true) { cur = i; ls.sec = legacy(steps[i]); ls.at = steps[i].key; save(); history.replaceState(null, "", `#/lesson/${id}/${steps[i].key}`); render(); if (scroll) toTop(); }
  // a new section always opens at the very top: an instant jump (a smooth scroll from the bottom of a long section can be
  // cut short on iOS when the new visuals resize the page, leaving it near the bottom), repeated once the visuals have laid out
  function toTop() { const up = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" }); up(); requestAnimationFrame(() => { up(); setTimeout(up, 120); }); }
  let sess = null;
  const backTo = () => (location.hash = L.module ? "#/module/" + L.module : "#/course");
  function render() { body.innerHTML = ""; sess && sess.destroy && sess.destroy(); sess = null; destroyAll();
    const s = steps[cur]; const sec = h("section", { class: "sec" }); body.append(sec);
    if (s.kind === "sec") { const S0 = sections[s.si]; if (!ls.read.includes(S0.id)) { ls.read.push(S0.id); save(); } renderPage(sec, S0, terms); }
    else if (s.kind === "prep") { briefing(sec); terms(sec); }
    else if (s.kind === "cp") checkpoint(sec, s);
    else wrapUp(sec);
    mark(); top.classList.toggle("compact", cur > 0);
    // Pager: two equal cells, a mono PREVIOUS / NEXT label over a title that wraps to 2 lines, so long titles never collide.
    const nav = h("nav", { class: "secnav", "aria-label": "Lesson sections" });
    const cell = (cls, label, title) => { const b = h("button", { class: "pg " + cls, type: "button" }); b.append(h("span", { class: "pg-l" }, label), h("span", { class: "pg-t" }, title)); if (title) b.title = title; return b; };
    const prev = cur > 0 ? cell("prev", "← Previous", steps[cur - 1].label) : h("span", { class: "pg-gap", "aria-hidden": "true" }); if (cur > 0) prev.onclick = () => go(cur - 1);
    const last = cur >= steps.length - 1;
    const nx = cell("next", last ? "Done →" : "Next →", last ? "Back to course" : steps[cur + 1].label); nx.onclick = () => (!last ? go(cur + 1) : backTo());
    if (!body.querySelector(".quiz")) body.append(nav), nav.append(prev, nx);
  }
  // Hide the pager while questions are on screen; the session's own buttons lead on.
  const startSession = (sec) => { sec.querySelectorAll(".cp-intro").forEach((n) => n.remove()); body.querySelectorAll(".secnav").forEach((n) => n.remove()); const box = h("div", { class: "mt" }); sec.append(box); return box; };
  const skipBtn = (onclick) => h("button", { class: "btn ghost skip-now", type: "button", onclick }, "Skip for now");
  // A quick check after every 2-3 pages: 4-5 questions from only those pages, never a gate.
  function checkpoint(sec, s) { const pool = s.pages.flatMap((sid) => pageIds(id, sid)); const ids = pick(pool, s.size); const unread = s.pages.filter((sid) => !ls.read.includes(sid));
    const titles = s.pages.map((sid) => sections.find((x) => x.id === sid)).map((x) => x.title || x.label);
    const st = cpState(id, s.key); const range = s.from === s.to ? `page ${s.from + 1}` : `pages ${s.from + 1}–${s.to + 1}`;
    sec.innerHTML = `<span class="label">Quick check ${s.n} · ${range}</span><h2>Quick check</h2>`;
    const intro = h("div", { class: "cp-intro" }); sec.append(intro);
    const msg = ids.length ? `${ids.length} question${ids.length > 1 ? "s" : ""} on ${esc(titles.join(", "))}. After each answer, tap how sure you are.${st && st.done ? ` Last time: ${st.ok} of ${st.n} right.` : ""}`
      : unread.length ? `Read ${unread.length > 1 ? "these pages" : "this page"} first: only pages you've opened are asked.` : "You answered these in the last hour; they come back on their schedule. Carry on reading.";
    intro.innerHTML = `<p class="dim mt cp-msg">${msg}</p>`;
    const startB = h("button", { class: "btn pri arrow", type: "button", "data-primary": "" }, "Start");
    startB.onclick = () => { const box = startSession(sec);
      sess = session(box, { queue: ids, mode: "learn", title: `${L.code} · Quick check ${s.n}`, label: `${L.code} · Quick check ${s.n}`, doneLabel: "Quick check done", onExit: () => go(cur + 1),
        endButtons: ({ correct, total }) => { if (total) cpMark(id, s.key, { done: 1, ok: correct, n: total }); mark(); const nx = steps[cur + 1]; const b = h("div", { class: "btns mt2 next-btns" });
          const c = h("button", { class: "btn pri arrow", type: "button", "data-primary": "" }, `Continue · ${nx.label}`); c.onclick = () => go(cur + 1); b.append(c); return b; } }); };
    const bt = h("div", { class: "btns mt cp-btns" }); if (ids.length) bt.append(startB); bt.append(skipBtn(() => { if (ids.length) cpMark(id, s.key, { skip: 1 }); go(cur + 1); })); intro.append(bt); }
  // Lesson finished card: readiness, the weakest pages read so far, and where to go next.
  function finishedCard() { const st = lessonStats(id); const nl = nextLesson(); const N = nl && nl !== id ? LESSONS[nl] : null;
    const weak = sections.map((S0, si) => ({ S0, si, n: pageIds(id, S0.id).length, st: pageStats(id, S0.id) })).filter((x) => x.n && ls.read.includes(x.S0.id) && x.st.readiness < 0.75).sort((a, b) => a.st.readiness - b.st.readiness).slice(0, 3);
    const el = h("div", { class: "card finished mt2" }); el.innerHTML = `<span class="label">Lesson finished</span><div class="num mt">${pct(st.readiness)}<small>readiness</small></div>${meter(st.readiness)}
      <p class="dim mt" style="font-size:16px">Finished counts once you have been through the pages. Readiness grows as you answer Certain and correct over spaced reviews; the questions come back on their own.</p>
      ${weak.length ? `<span class="label mt2" style="display:block">Weakest pages</span><div class="plist">${weak.map((w) => `<button type="button" class="prow" data-si="${w.si}"><span class="n">${String(w.si + 1).padStart(2, "0")}</span><span class="t">${esc(w.S0.title || w.S0.label)}</span><span class="r"><span class="meter"><i style="width:${Math.round(w.st.readiness * 100)}%"></i></span><span class="pr">${pct(w.st.readiness)}</span></span></button>`).join("")}</div>` : ""}`;
    el.querySelectorAll("[data-si]").forEach((b) => (b.onclick = () => go(steps.findIndex((s) => s.kind === "sec" && s.si === +b.dataset.si))));
    const b = h("div", { class: "btns mt2 next-btns" }); if (N) b.append(h("a", { class: "btn pri arrow", href: `#/lesson/${N.id}` }, `Next · ${N.code} ${N.title}`));
    const bk = h("button", { class: "btn" + (N ? " ghost" : " pri"), type: "button" }, "Back to course"); bk.onclick = backTo; b.append(bk); el.append(b); return el; }
  const meter = (x) => `<div class="meter big mt"><i style="width:${Math.round(x * 100)}%"></i></div>`;
  // The wrap-up: 5-6 questions across the whole lesson, weighted toward misses and low confidence. Only pages opened are asked.
  function wrapUp(sec) { const all = wrapPool(id, sections, !L.includes); const reached = onlyReached(all); const n = reached.length >= 12 ? 6 : 5; const ids = pick(all, n, { wrap: true });
    sec.innerHTML = `<span class="label">Wrap-up · ${esc(L.code)}</span><h2>Wrap-up</h2>`;
    const intro = h("div", { class: "cp-intro" }); sec.append(intro);
    const scope = reached.length < all.length ? `${reached.length} of ${all.length} questions so far: only pages you've opened are asked` : `${all.length} questions in this lesson`;
    intro.innerHTML = `<p class="dim mt cp-msg" style="max-width:48rem">${!reached.length ? "Open the pages of this lesson first; their questions show up here." : ids.length ? `${ids.length} questions mixed across the lesson, weighted toward the ones you missed or weren't sure about. After each answer, tap how sure you are.` : "Nothing to ask right now: you answered these recently and they come back on their schedule."} ${reached.length ? `${scope} · readiness ${pct(lessonStats(id).readiness)}. Finishing the lesson never depends on the score.` : ""}</p>`;
    const bt = h("div", { class: "btns mt cp-btns" });
    const done = () => { finish(id); mark(); };
    if (ids.length) { const sb = h("button", { class: "btn pri arrow", type: "button", "data-primary": "" }, "Start"); bt.append(sb);
      sb.onclick = () => { const box = startSession(sec); sess = session(box, { queue: ids, mode: "learn", title: `${L.code} · Wrap-up`, label: `${L.code} · Wrap-up`, doneLabel: "Wrap-up done", onExit: backTo,
        endButtons: () => { done(); const w = h("div"); w.append(finishedCard()); return w; } }); }; }
    if (reached.length) { const allB = h("button", { class: "btn", type: "button" }, allLabel(id, reached.length)); allB.onclick = () => { const box = startSession(sec); sess = practiceSet(box, { ids: all, key: id, all: true, title: L.code, label: L.code, onExit: backTo }); }; bt.append(allB); }
    bt.append(skipBtn(() => { done(); intro.innerHTML = ""; intro.append(finishedCard()); }));
    intro.append(bt); if (ls.fin) intro.append(finishedCard()); }
  function briefing(sec) { const P = L.prep;
    sec.innerHTML = `<span class="label">Briefing card</span><h2>Before and after the flight</h2>
    <div class="cards2 mt">${[["What to expect", P.expect], ["Chair-fly this", P.chairfly], ["Common mistakes", P.mistakes], ["Debrief questions", P.debrief]].filter((x) => x[1]).map(([t, list]) => `<div class="card"><span class="label">${t}</span><ul class="prose mt" style="font-size:16.5px">${list.map((x) => `<li>${rich(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    ${P.note ? `<div class="note cfi">${rich(P.note)}</div>` : ""}<h3 class="mt2">Your debrief notes</h3><p class="dim" style="font-size:16px">Saved only on this device. Write what went well, what to fix, and what your instructor said.</p>`;
    const ta = h("textarea", { "aria-label": "Debrief notes" }); ta.value = S().notes[id] || ""; ta.oninput = () => { S().notes[id] = ta.value; save(); }; sec.append(ta); }
  render();
  return { destroy() { sess && sess.destroy && sess.destroy(); } };
}
