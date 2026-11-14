// "Review blind spots": one flow that rereads the exact pages behind your open blind spots, then asks only those blind
// spots. The 12-hour rule holds: a blind spot is asked only once its wait is over; the pages can be reread any time.
import { h, esc, fmtDue } from "../core/util.js?v=7109f603b7";
import { get } from "../core/srs.js?v=7109f603b7";
import { LESSONS, QUESTIONS, ORDER, secKey } from "../../data/index.js?v=7109f603b7";
import { blindList } from "../core/progress.js?v=7109f603b7";
import { pagesOf } from "../core/flow.js?v=7109f603b7";
import { destroyAll } from "../viz/index.js?v=7109f603b7";
import { loadLesson, renderPage } from "./lesson.js?v=7109f603b7";
import { session } from "./quiz.js?v=7109f603b7";
const MAXP = 6;
const lpos = (lid) => { const k = ORDER.indexOf(lid); if (k >= 0) return k * 100; const P = ORDER.find((o) => (LESSONS[o].includes || []).includes(lid)); return P ? ORDER.indexOf(P) * 100 + 50 : 9e4; };
// Pages behind open blind spots, Certain misses first (up to 6 pages a sitting), shown in course order.
export function blindPages(all = false) { const by = new Map();
  for (const id of blindList()) { const k = secKey(QUESTIONS[id]); if (!k) continue; if (!by.has(k)) by.set(k, []); by.get(k).push(id); }
  const list = [...by].map(([k, ids]) => { const [lid, sid] = k.split("/"); const pg = pagesOf(lid); const i = pg.findIndex((x) => x.id === sid); return { k, lid, sid, i, page: pg[i] || { id: sid, label: sid, title: sid }, ids }; });
  return (all ? list : list.slice(0, MAXP)).sort((a, b) => lpos(a.lid) - lpos(b.lid) || a.i - b.i); }
export function blindLesson(host, at) {
  const p = h("div", { class: "page blind-lesson" }); host.append(p); const pages = blindPages(); const allPages = blindPages(true).length;
  const ids = pages.flatMap((x) => x.ids); const now = Date.now(); const ready = ids.filter((id) => !get(id) || get(id).due <= now);
  const steps = [{ kind: "intro", label: "Overview" }, ...pages.map((x) => ({ kind: "page", x, label: x.page.title || x.page.label })), { kind: "quiz", label: "Blind spot questions" }];
  let cur = at === "quiz" ? steps.length - 1 : Math.max(0, Math.min(steps.length - 1, +at || 0)); let sess = null, dead = false;
  const top = h("section", { class: "hero", style: "margin-bottom:0" }); top.innerHTML = `<span class="label">Lesson · your blind spots</span><h1>Review blind spots</h1>`; p.append(top);
  if (!ids.length) { top.insertAdjacentHTML("beforeend", `<p>No blind spots right now. A question you miss lands here, with the page that teaches it, and comes back 12 hours later.</p><div class="btns mt"><a class="btn pri arrow" href="#/">Back to what to work on now</a></div>`); return { destroy() {} }; }
  const bar = h("nav", { class: "steps", "aria-label": "Blind spot steps" }); p.append(bar); const body = h("div"); p.append(body);
  steps.forEach((s, i) => { const b = h("button", { type: "button", "aria-label": s.label, title: s.label, class: s.kind === "quiz" ? "cp" : "" }); b.onclick = () => go(i); bar.append(b); });
  const go = (i) => { cur = i; history.replaceState(null, "", `#/blindspots/${steps[i].kind === "quiz" ? "quiz" : i}`); render(); window.scrollTo({ top: 0, left: 0, behavior: "instant" }); requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })); };
  const nextBack = () => Math.min(...ids.map((id) => (get(id) ? get(id).due : Infinity)));
  const quizNote = () => ready.length ? `${ready.length} question${ready.length > 1 ? "s" : ""} ready${ready.length < ids.length ? `; ${ids.length - ready.length} more are back ${fmtDue(Math.min(...ids.filter((id) => !ready.includes(id)).map((id) => get(id).due)))}` : ""}.` : `None is ready yet: each comes back 12 hours after the miss. The next one is back ${fmtDue(nextBack())}.`;
  function render() { sess && sess.destroy && sess.destroy(); sess = null; destroyAll(); body.innerHTML = ""; [...bar.children].forEach((b, i) => { b.classList.toggle("on", i === cur); b.classList.toggle("done", i < cur); });
    top.classList.toggle("compact", cur > 0); const sec = h("section", { class: "sec" }); body.append(sec); const s = steps[cur];
    if (s.kind === "intro") { sec.innerHTML = `<p class="dim" style="font-size:18px;max-width:46rem">You have ${ids.length} blind spot${ids.length > 1 ? "s" : ""} on ${pages.length === 1 ? "one page" : `${pages.length} pages`}${allPages > pages.length ? ` (the first ${pages.length} of ${allPages}; the rest come next time)` : ""}. Reread each page, then answer only those questions. ${esc(quizNote())}</p>
      <div class="plist mt">${pages.map((x, i) => `<button type="button" class="prow" data-i="${i + 1}"><span class="n">${esc(LESSONS[x.lid].code)}</span><span class="t">${esc(x.page.title || x.page.label)}</span><span class="r"><span class="tag acc">Blind spot</span><span class="pr">${x.ids.length}</span></span></button>`).join("")}</div>`;
      sec.querySelectorAll(".prow").forEach((b) => (b.onclick = () => go(+b.dataset.i)));
      const bt = h("div", { class: "btns mt2 cp-btns" }); const a = h("button", { class: "btn pri arrow", type: "button", id: "bl-read" }, "Start reading"); a.onclick = () => go(1);
      const sk = h("button", { class: "btn ghost", type: "button", id: "bl-skip" }, "Skip to the questions"); sk.onclick = () => go(steps.length - 1); bt.append(a, sk); sec.append(bt); }
    else if (s.kind === "page") { const x = s.x; sec.innerHTML = `<p class="dim">Loading…</p>`;
      loadLesson(x.lid).then((T) => { if (dead || steps[cur] !== s) return; const S0 = T.sections.find((q) => q.id === x.sid); if (!S0) { sec.innerHTML = `<p class="dim">This page has moved.</p>`; return; }
        renderPage(sec, S0); sec.insertAdjacentHTML("afterbegin", `<p class="label bl-where">Blind spot page ${cur} of ${pages.length} · <a href="#/lesson/${x.lid}/${x.sid}">${esc(LESSONS[x.lid].code)} ${esc(LESSONS[x.lid].title)}</a></p>`); })
        .catch((e) => { sec.innerHTML = `<p class="dim">Could not load this page. ${esc(e.message)}</p>`; }); }
    else { sec.innerHTML = `<span class="label">Blind spot questions</span><h2>Now answer them</h2><p class="dim mt">${esc(quizNote())} After each answer, tap how sure you are.</p>`;
      if (ready.length) { const b = h("button", { class: "btn pri arrow", type: "button", id: "bl-start" }, "Start"); const bt = h("div", { class: "btns mt cp-btns" }, b); sec.append(bt);
        b.onclick = () => { bt.remove(); sec.querySelector("p").remove(); body.querySelectorAll(".secnav").forEach((n) => n.remove()); const box = h("div", { class: "mt" }); sec.append(box);
          sess = session(box, { queue: ready, mode: "review", title: "Blind spots", label: `Blind spots · ${ready.length}`, doneLabel: "Blind spots done", onExit: () => (location.hash = "#/"),
            endButtons: () => { const d = h("div", { class: "btns mt2 next-btns" }); d.append(h("a", { class: "btn pri arrow", href: "#/" }, "Back to what to work on now")); return d; } }); }; } }
    const nav = h("nav", { class: "secnav", "aria-label": "Blind spot steps" }); const cell = (cls, l, t) => { const b = h("button", { class: "pg " + cls, type: "button" }); b.append(h("span", { class: "pg-l" }, l), h("span", { class: "pg-t" }, t)); return b; };
    const prev = cur > 0 ? cell("prev", "← Previous", steps[cur - 1].label) : h("span", { class: "pg-gap", "aria-hidden": "true" }); if (cur > 0) prev.onclick = () => go(cur - 1);
    const last = cur === steps.length - 1; const nx = cell("next", last ? "Done →" : "Next →", last ? "What to work on now" : steps[cur + 1].label); nx.onclick = () => (last ? (location.hash = "#/") : go(cur + 1));
    nav.append(prev, nx); body.append(nav); }
  render(); return { destroy() { dead = true; sess && sess.destroy && sess.destroy(); } };
}
