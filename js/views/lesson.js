import { h, esc, pct } from "../core/util.js?v=961b79525f";
import { S, save, lessonState } from "../core/store.js?v=961b79525f";
import { LESSONS, lessonItems } from "../../data/index.js?v=961b79525f";
import { lessonStats, buildQueue } from "../core/progress.js?v=961b79525f";
import { rich, autoTerms } from "../core/rich.js?v=961b79525f";
import { mountViz, destroyAll } from "../viz/index.js?v=961b79525f";
import { session } from "./quiz.js?v=961b79525f";
const KIND = { ground: "Ground lesson", flight: "Flight lesson briefing", module: "Module unit" };
export function lessonView(host, id, secIdx) {
  const L0 = LESSONS[id]; const p = h("div", { class: "page" }); host.append(p);
  if (!L0) { p.innerHTML = `<h2>Lesson not found.</h2>`; return; }
  let api = { destroy() {} }; let dead = false;
  // Lesson text is code-split: question banks load up front (the review engine needs them); prose loads when the lesson opens.
  // Supplement sections (data/text/x/<id>.js) slot in after the section named by `at` ("^" = first), else at the end.
  Promise.all([import(`../../data/text/${id}.js?v=961b79525f`), L0.textx ? import(`../../data/text/x/${id}.js?v=961b79525f`) : null]).then(([m, x]) => { if (dead) return;
    const T = { ...L0, ...m.default, sections: mergeSections(m.default.sections || [], x ? x.default.sections || [] : []) };
    if (typeof secIdx === "string") { const k = T.sections.findIndex((s) => s.id === secIdx); secIdx = k >= 0 ? k : null; }
    api = build(p, T, id, secIdx); })
    .catch((e) => { p.innerHTML = `<h2>Could not load this lesson.</h2><p class="dim mt">${esc(e.message)}</p>`; });
  return { destroy() { dead = true; api.destroy(); } };
}
export function mergeSections(base, extra) { const out = base.slice(); const last = {};
  // a later supplement with the same anchor goes after the earlier one, so runs keep the order written
  for (const s of extra) { if (s.at === "^") { const k = last["^"] ? out.indexOf(last["^"]) + 1 : 0; out.splice(k, 0, s); last["^"] = s; continue; }
    const a = last[s.at] || out.find((b) => b.id === s.at); const k = s.at && a ? out.indexOf(a) : -1; if (k >= 0) out.splice(k + 1, 0, s); else out.push(s); if (s.at) last[s.at] = s; }
  return out; }
function build(p, L, id, secIdx) {
  const ls = lessonState(id); ls.visited = Date.now(); ls.total = L.sections.length;
  const sections = L.sections.slice(); const hasPrep = !!L.prep; const steps = [...sections.map((s) => s.label), ...(hasPrep ? ["Briefing card"] : []), "Check yourself"];
  let cur = secIdx != null ? Math.min(secIdx, steps.length - 1) : (ls.sec || 0); if (secIdx == null && cur >= steps.length - 1) cur = 0;
  const st = lessonStats(id); const nItems = lessonItems(id).length;
  const top = h("section", { class: "hero", style: "margin-bottom:0" });
  const tagLine = `${L.code} · Stage ${L.stage || 1} · ${KIND[L.kind] || ""}`;
  top.innerHTML = `<span class="label">${esc(tagLine)}</span><h1>${esc(L.title)}</h1>${L.intro ? `<p>${rich(L.intro)}</p>` : ""}
   <div class="btns mt" style="gap:22px"><span class="pct">${nItems} items · readiness ${pct(st.readiness)}</span>${L.refs ? `<span class="src" style="white-space:normal">${esc(L.refs.join(" · "))}</span>` : ""}</div>`;
  // the V-speeds lesson defines these terms in place, so it skips the dotted underlines
  const terms = id === "vs1" ? () => {} : autoTerms;
  terms(top.querySelector("p")); p.append(top);
  if (L.includes) { const inc = h("div", { class: "mt" }); inc.innerHTML = `<div class="list-head mt2"><span class="label">This lesson includes these units</span><span class="label">Readiness</span></div>${L.includes.map((u) => { const U = LESSONS[u]; const s = lessonStats(u); return `<a class="row" href="#/lesson/${u}"><span class="code">${U.code}</span><span><div class="t">${esc(U.title)}</div><div class="s">${esc(U.short || "")}</div></span><span><div class="meter"><i style="width:${Math.round(s.readiness * 100)}%"></i></div></span></a>`; }).join("")}`; p.append(inc); }
  const stepBar = h("nav", { class: "steps", "aria-label": "Lesson sections" }); p.append(stepBar);
  const body = h("div"); p.append(body);
  steps.forEach((label, i) => { const b = h("button", { type: "button", "aria-label": label, title: label }); b.onclick = () => go(i); stepBar.append(b); });
  function mark() { [...stepBar.children].forEach((b, i) => { b.classList.toggle("on", i === cur); b.classList.toggle("done", i < sections.length && ls.read.includes(sections[i].id)); b.setAttribute("aria-current", i === cur ? "step" : "false"); }); }
  function go(i, scroll = true) { cur = i; ls.sec = i; save(); history.replaceState(null, "", `#/lesson/${id}/${i}`); render(); if (scroll) stepBar.scrollIntoView({ behavior: "smooth", block: "start" }); }
  let sess = null;
  function render() { mark(); top.classList.toggle("compact", cur > 0); body.innerHTML = ""; sess && sess.destroy && sess.destroy(); sess = null; destroyAll();
    const sec = h("section", { class: "sec" }); body.append(sec);
    if (cur < sections.length) { const S0 = sections[cur]; if (!ls.read.includes(S0.id)) { ls.read.push(S0.id); save(); }
      sec.innerHTML = `<span class="label">${esc(S0.label)}</span><h2>${esc(S0.title)}</h2>`;
      const pr = h("div", { class: "prose mt" }); pr.innerHTML = rich(S0.body); sec.append(pr);
      // Visuals sit right after the short explanation (first paragraph) at full width; the rest of the prose continues below.
      let anchor = null; (S0.viz ? [].concat(S0.viz) : []).forEach((v) => { const vh = h("div");
        if (anchor) anchor.after(vh);
        else { const at = v.after === "end" ? null : v.after ? pr.querySelector(v.after) : pr.firstElementChild;
          if (at && at.parentNode === pr && at.nextElementSibling) { const rest = h("div", { class: "prose" }); while (at.nextSibling) rest.append(at.nextSibling); pr.after(vh, rest); } else pr.after(vh); }
        anchor = vh; mountViz(vh, v); });
      if (S0.body2) { const p2 = h("div", { class: "prose mt" }); p2.innerHTML = rich(S0.body2); sec.append(p2); }
      if (S0.kdr) { const k = h("div", { class: "kdr" }); k.innerHTML = [["Know it", S0.kdr.k], ["Do it", S0.kdr.d], ["Manage the risk", S0.kdr.r]].map(([t, x]) => `<div><span class="label">${t}</span><p>${rich(x || "")}</p></div>`).join("") + ""; if (S0.kdr.codes) k.insertAdjacentHTML("beforeend", ""); sec.append(k); if (S0.kdr.codes) sec.append(h("p", { class: "src", style: "margin-top:10px;white-space:normal" }, "ACS " + [].concat(S0.kdr.codes).join(", "))); }
      terms(sec);
    } else if (hasPrep && cur === sections.length) { briefing(sec); terms(sec); }
    else { checkYourself(sec); }
    // Pager: two equal cells, a mono PREVIOUS / NEXT label over a title that wraps to 2 lines, so long titles never collide.
    const nav = h("nav", { class: "secnav", "aria-label": "Lesson sections" });
    const cell = (cls, label, title) => { const b = h("button", { class: "pg " + cls, type: "button" }); b.append(h("span", { class: "pg-l" }, label), h("span", { class: "pg-t" }, title)); if (title) b.title = title; return b; };
    const prev = cur > 0 ? cell("prev", "← Previous", steps[cur - 1]) : h("span", { class: "pg-gap", "aria-hidden": "true" }); if (cur > 0) prev.onclick = () => go(cur - 1);
    const last = cur >= steps.length - 1;
    const nx = cell("next", last ? "Done →" : "Next →", last ? "Back to course" : steps[cur + 1]); nx.onclick = () => (!last ? go(cur + 1) : (location.hash = L.module ? "#/module/" + L.module : "#/course"));
    if (cur < steps.length - 1 || !body.querySelector(".quiz")) body.append(nav), nav.append(prev, nx);
  }
  function briefing(sec) { const P = L.prep;
    sec.innerHTML = `<span class="label">Briefing card</span><h2>Before and after the flight</h2>
    <div class="cards2 mt">${[["What to expect", P.expect], ["Chair-fly this", P.chairfly], ["Common mistakes", P.mistakes], ["Debrief questions", P.debrief]].filter((x) => x[1]).map(([t, list]) => `<div class="card"><span class="label">${t}</span><ul class="prose mt" style="font-size:16.5px">${list.map((x) => `<li>${rich(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    ${P.note ? `<div class="note cfi">${rich(P.note)}</div>` : ""}<h3 class="mt2">Your debrief notes</h3><p class="dim" style="font-size:16px">Saved only on this device. Write what went well, what to fix, and what your instructor said.</p>`;
    const ta = h("textarea", { "aria-label": "Debrief notes" }); ta.value = S().notes[id] || ""; ta.oninput = () => { S().notes[id] = ta.value; save(); }; sec.append(ta); }
  function checkYourself(sec) { const ids = lessonItems(id, { oral: false, deep: !L.includes ? true : false });
    const { queue, extra, dueCount, newCount } = buildQueue(ids, { max: 20 });
    sec.innerHTML = `<span class="label">Check yourself</span><h2>Answer, then trust the schedule</h2><p class="dim mt" style="max-width:48rem">${ids.length} questions in this ${L.includes ? "lesson (the Airport units have their own sets)" : "lesson"}. This session: ${Math.min(queue.length, 20)} (${dueCount} due, ${Math.max(0, queue.length - dueCount)} new). Missed questions come back within minutes; the rest return on a spaced schedule.</p>`;
    const go2 = h("button", { class: "btn pri arrow", type: "button" }, queue.length ? "Start" : "Practice ahead"); const box = h("div", { class: "mt" }); const bt = h("div", { class: "btns mt" }, go2); if ((L.oral || []).length) bt.append(h("a", { class: "btn", href: `#/oral/${id}` }, `Oral questions · ${L.oral.length}`)); sec.append(bt, box);
    go2.onclick = () => { bt.remove(); sec.querySelector("p").remove(); sess = session(box, { queue: queue.length ? queue : extra.slice(0, 10), extra: queue.length ? extra : extra.slice(10), mode: queue.length ? "learn" : "ahead", title: L.code, label: `${L.code} · ${L.title}`, onExit: () => (location.hash = L.module ? "#/module/" + L.module : "#/course") }); }; }
  render();
  return { destroy() { sess && sess.destroy && sess.destroy(); } };
}
