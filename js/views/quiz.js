// The practice engine UI: multiple choice and ordered sequences, each followed by a one-tap confidence rating; learn/review/exam modes.
import { h, esc, shuffle, fmtDue, toast } from "../core/util.js?v=43931b26b4";
import { review, get, CONF, isBlind, MISS_DELAY } from "../core/srs.js?v=43931b26b4";
import { nextDue, buildQueue, nextChunk, onlyReached } from "../core/progress.js?v=43931b26b4";
import { S, save } from "../core/store.js?v=43931b26b4";
import { item } from "../../data/index.js?v=43931b26b4";
import { TOPICS, LESSONS } from "../../data/index.js?v=43931b26b4";
import { rich, autoTerms } from "../core/rich.js?v=43931b26b4";
const KEYS = "ABCDEFG";
// Each question is asked at most once per sitting (`seen` is shared by chained "Keep going" sessions). A miss is never
// re-asked in the same session: it is scheduled 12 hours out and opens a blind spot that comes back in later sessions.
// more(seen) -> next ids for "Keep going"; all = { label, start() } for the go-through-everything path; count = { base, total } fixes the counter.
export function session(host, opts) {
  const { queue, extra = [], mode = "review", title = "Review", label = "", onExit, onFinish, minutes = 0, passMark = 0.7, intro = "", check = false, all = null, count = null, onAnswer = null } = opts;
  const seen = opts.seen || new Set(); const more = opts.more || (extra.length ? (ex) => extra.filter((id) => !ex.has(id)).slice(0, 10) : null);
  const exam = mode === "exam"; let i = 0; const q = [...new Set(queue)].filter((id) => !seen.has(id)); const results = []; let t0 = Date.now(), timerI = null;
  const base = count ? count.base : 0, total = count ? count.total : q.length;
  const wrap = h("div", { class: "quiz" }); host.append(wrap);
  const top = h("div", { class: "qhead" }); const lab = h("span", { class: "label" }, label || title); const right = h("span", { class: "label" }); top.append(lab, right);
  const bar = h("div", { class: "progress-line" }, h("i", { style: "width:0" })); const body = h("div"); wrap.append(top, bar, body);
  if (exam && minutes) { timerI = setInterval(() => { const left = minutes * 60e3 - (Date.now() - t0); if (left <= 0) { clearInterval(timerI); toast("Time. Grading what you finished."); finish(); return; } const m = Math.floor(left / 6e4), s = Math.floor((left % 6e4) / 1e3); right.textContent = `${m}:${String(s).padStart(2, "0")} left`; }, 500); }
  const keyH = (e) => { if (!body.isConnected) return document.removeEventListener("keydown", keyH); const n = KEYS.indexOf(e.key.toUpperCase()); const idx = /^[1-7]$/.test(e.key) ? +e.key - 1 : n; const ch = body.querySelectorAll(".choice:not([disabled])"); if (idx >= 0 && ch[idx] && !e.metaKey && !e.ctrlKey && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { ch[idx].click(); } else if (e.key === "Enter") { const b = body.querySelector("[data-primary]:not([disabled])"); if (b && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); b.click(); } } };
  document.addEventListener("keydown", keyH);
  const destroy = () => { clearInterval(timerI); document.removeEventListener("keydown", keyH); };
  function progress() { const done = Math.min(total, base + i); bar.firstChild.style.width = `${(done / Math.max(1, total)) * 100}%`; if (!exam) right.textContent = `Answered ${done} / ${total}`; }
  function next() { i++; if (i >= q.length) return finish(); show(); }
  function show() { progress(); body.innerHTML = ""; const it = item(q[i]); if (!it) return next(); const topic = TOPICS[it.t];
    const lb = h("div", { class: "label mb qlab" }, h("span", {}, [topic ? topic.title : "", it.lesson && LESSONS[it.lesson] ? " · " + LESSONS[it.lesson].code : ""].join("")));
    if (!exam && isBlind(it.id)) lb.append(h("span", { class: "tag acc blind-tag" }, "Blind spot")); body.append(lb);
    if (it.type === "order") return order(it); return mc(it); }
  // An answer to a question that is not due yet counts as practice ahead: it never stretches the schedule (misses always count).
  function record(it, ok, conf, quality, pick) { const before = get(it.id); const now = Date.now(); const src = !exam && before && before.n && before.due > now ? "ahead" : mode;
    const r = review(it.id, { ok, conf, q: quality, source: src, now }); seen.add(it.id); results.push({ id: it.id, ok, conf, q: quality, t: it.t, pick }); onAnswer && onAnswer(it.id); return { r, before }; }
  function scheduleNote(r, ok, guessed) { const back = `back ${fmtDue(r.due)}`; return !ok ? `Blind spot · ${back}` : guessed ? `${guessed === true ? "Guessed" : guessed} · ${back}` : `Next review ${fmtDue(r.due)}`; }
  function verdict(it, ok, r, extraHtml = "", guessed = false) { if (exam) return next();
    const v = h("div", { class: "verdict", "aria-live": "polite" }); v.innerHTML = `<div class="big">${ok ? "Correct." : "Not quite."}</div>${extraHtml}<div class="prose"><p>${rich(it.why || "")}</p>${it.src ? `<p class="src">${esc(it.src)}</p>` : ""}</div><p class="label">${esc(scheduleNote(r, ok, guessed))}</p>`; autoTerms(v.querySelector(".prose"));
    const nb = h("button", { class: "btn pri arrow", "data-primary": "", type: "button" }, i + 1 >= q.length ? "Finish" : "Next"); nb.onclick = next; v.append(h("div", { class: "btns mt" }, nb, quitBtn())); body.append(v); nb.focus({ preventScroll: true }); v.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
  function quitBtn() { const b = h("button", { class: "btn ghost", type: "button" }, exam ? "Stop and grade" : "End session"); b.onclick = () => finish(); return b; }
  function mc(it) {
    body.append(h("p", { class: "qtext" })); body.lastChild.innerHTML = rich(it.q);
    if (it.img) { const f = h("div", { class: "mb" }); f.innerHTML = it.img; body.append(f); }
    const order = shuffle(it.c.map((_, k) => k)); let sel = null; const list = h("div", { class: "choices", role: "radiogroup" });
    const btns = order.map((k, n) => { const b = h("button", { class: "choice", type: "button", role: "radio", "aria-checked": "false" }, h("span", { class: "k" }, KEYS[n]), h("span", {})); b.lastChild.innerHTML = rich(it.c[k]); b.onclick = (e) => { if (e.target.closest(".gl")) return; sel = k; btns.forEach((x) => { x.classList.toggle("sel", x === b); x.setAttribute("aria-checked", x === b); }); confBox.hidden = false; check.disabled = false; }; list.append(b); return b; });
    body.append(list);
    const useConf = true;   // confidence is asked on every answer, timed checks included (no feedback there until the end)
    const confBox = h("div", { class: "conf", hidden: true }); const check = h("button", { class: "btn pri", type: "button", "data-primary": "", disabled: true }, exam ? "Next" : "Check");
    if (useConf) { confBox.append(h("span", { class: "label" }, "How sure are you?")); const cc = h("div", { class: "chips" }); Object.entries(CONF).forEach(([k, v]) => { const b = h("button", { class: "chip", type: "button" }, v.label); b.onclick = () => submit(k); cc.append(b); }); confBox.append(cc); body.append(confBox); if (exam) body.append(h("div", { class: "btns mt" }, quitBtn())); }
    else { confBox.append(h("div", { class: "btns" }, check, quitBtn())); body.append(confBox); check.onclick = () => submit(null); }
    function submit(conf) { if (sel == null) return; const ok = sel === it.a; const { r } = record(it, ok, conf, null, sel); confBox.remove(); btns.forEach((b, n) => { b.disabled = true; const k = order[n]; if (k === it.a) b.classList.add("right"); else if (k === sel) b.classList.add("wrong"); else b.classList.add("mute"); });
      if (exam) return next(); verdict(it, ok, r, "", ok && conf === "guess"); }
  }
  function order(it) {
    body.append(h("p", { class: "qtext" })); body.lastChild.innerHTML = rich(it.q); const items = shuffle(it.items.map((x, k) => ({ x, k }))); if (items.every((o, n) => o.k === n) && items.length > 1) items.reverse();
    const list = h("div", { class: "order-list" }); body.append(list); body.append(h("p", { class: "dim", style: "font-size:15px;margin-top:12px" }, "Use the arrows to put these in order, first at the top."));
    const draw = () => { list.innerHTML = ""; items.forEach((o, n) => { const up = h("button", { type: "button", "aria-label": "Move up" }, "↑"), dn = h("button", { type: "button", "aria-label": "Move down" }, "↓"); up.disabled = n === 0; dn.disabled = n === items.length - 1;
      up.onclick = () => { [items[n - 1], items[n]] = [items[n], items[n - 1]]; draw(); }; dn.onclick = () => { [items[n + 1], items[n]] = [items[n], items[n + 1]]; draw(); };
      const row = h("div", { class: "order-item" }, h("span", { class: "n" }, String(n + 1).padStart(2, "0")), h("span", {}, o.x), h("span", { class: "mv" }, up, dn)); list.append(row); }); };
    draw(); const useConf = true;
    const go = (conf) => { const ok = items.every((o, n) => o.k === n); const { r } = record(it, ok, conf, null, items.map((o) => o.k)); [...list.children].forEach((row, n) => { row.classList.add(items[n].k === n ? "ok" : "bad"); row.querySelectorAll("button").forEach((b) => (b.disabled = true)); }); ctl.remove();
      verdict(it, ok, r, ok ? "" : `<ol class="prose mt">${it.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`, ok && conf === "guess"); };
    const ctl = h("div", { class: "conf" });
    if (useConf) { ctl.append(h("span", { class: "label" }, "How sure are you?")); const cc = h("div", { class: "chips" }); Object.entries(CONF).forEach(([k, v]) => { const b = h("button", { class: "chip", type: "button" }, v.label); b.onclick = () => go(k); cc.append(b); }); ctl.append(cc); if (exam) ctl.append(h("div", { class: "btns mt" }, quitBtn())); }
    else { const b = h("button", { class: "btn pri", type: "button", "data-primary": "" }, "Check order"); b.onclick = () => go(null); ctl.append(h("div", { class: "btns" }, b)); }
    body.append(ctl);
  }
  function finish() { destroy(); bar.firstChild.style.width = "100%"; body.innerHTML = ""; right.textContent = "";
    const firstTry = new Map(); results.forEach((r) => { if (!firstTry.has(r.id)) firstTry.set(r.id, r); }); const fr = [...firstTry.values()];
    const total = exam ? q.length : fr.length; const correct = fr.filter((r) => r.ok).length; const sc = total ? correct / total : 0;
    const el = h("div", { class: "verdict" }); const pass = sc >= passMark; onFinish && onFinish({ correct, total, score: sc });
    if (!exam && !check) { summary(el, fr, correct); body.append(el); wrap.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    el.innerHTML = exam ? `<span class="label">${esc(title)}</span><h2 class="mt">${pass ? "Passing score." : "Not yet passing."}</h2><p class="dim mt" style="font-size:19px">${correct} of ${total} correct, ${Math.round(sc * 100)}%. ${passMark !== 0.7 ? `This check's standard is ${Math.round(passMark * 100)}% with every miss reviewed. ` : "The FAA knowledge test passing score is 70%. "}Review every miss below, ideally with your instructor.</p>`
      : check ? `<span class="label">${esc(title)}</span><h2 class="mt">${pass ? "Passing: " : "Not yet: "}${correct} of ${total}, ${Math.round(sc * 100)}%.</h2><p class="dim mt" style="font-size:19px">The standard is ${Math.round(passMark * 100)}% with every miss reviewed until you can explain it. ${total - correct ? "Your misses are below; they are already back in your review schedule." : "Nothing missed. Do it again in a few days with different items."}</p>${fr.filter((r) => !r.ok).map((r) => { const it = item(r.id); return `<div class="card mt"><p style="font-weight:600;margin:0 0 8px">${rich(it.q)}</p><div class="prose dim" style="font-size:16px">${rich(it.a || it.why || "")}</div>${it.src ? `<p class="src" style="margin-top:8px">${esc(it.src)}</p>` : ""}</div>`; }).join("")}` : "";
    if (exam) { const missed = fr.filter((r) => !r.ok); const unanswered = q.filter((id) => !firstTry.has(id));
      const byT = {}; q.forEach((id) => { const it = item(id); const k = it.t; byT[k] ||= { n: 0, ok: 0 }; byT[k].n++; if (firstTry.get(id)?.ok) byT[k].ok++; });
      el.innerHTML += `<h3 class="mt2">By topic</h3><div class="tablewrap prose mt"><table><tr><th>Topic</th><th>Score</th></tr>${Object.entries(byT).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([k, v]) => `<tr><td>${esc(TOPICS[k]?.title || k)}</td><td>${v.ok}/${v.n}</td></tr>`).join("")}</table></div>`;
      if (missed.length || unanswered.length) el.innerHTML += `<h3 class="mt2">Review the misses</h3>` + [...missed.map((r) => r.id), ...unanswered].map((id) => { const it = item(id); return `<div class="card mt"><p style="font-weight:600;margin:0 0 8px">${rich(it.q)}</p>${it.c ? `<p class="acc" style="margin:0 0 8px">${rich(it.c[it.a])}</p>` : ""}<p class="dim" style="margin:0;font-size:16px">${rich(it.why || "")}</p>${it.src ? `<p class="src" style="margin-top:8px">${esc(it.src)}</p>` : ""}</div>`; }).join(""); }
    const btns = h("div", { class: "btns mt2" }); const back = h("button", { class: "btn pri", type: "button" }, "Done"); back.onclick = () => onExit && onExit(); btns.append(back);
    el.append(btns); body.append(el); window.scrollTo({ top: 0, behavior: "smooth" }); }
  // The end of a practice session: score, a one-line confidence check, what to do next, then every miss with the answer and why.
  function summary(el, fr, correct) {
    const cal = Object.entries(CONF).map(([k, v]) => { const a = fr.filter((r) => r.conf === k); return a.length ? `${v.label} ${a.filter((r) => r.ok).length}/${a.length}` : ""; }).filter(Boolean);
    const nd = nextDue();
    el.innerHTML = `<span class="label">${esc(opts.doneLabel || "Session complete")}</span><h2 class="mt">${fr.length ? `${correct} of ${fr.length} correct` : "Nothing answered"}</h2>
      ${cal.length ? `<p class="label mt cal" title="Correct out of answered, by how sure you were">Right by confidence · ${esc(cal.join(" · "))}</p>` : ""}
      ${isFinite(nd) ? `<p class="dim mt" style="font-size:17px">Next review ${esc(fmtDue(nd))}.</p>` : ""}`;
    if (opts.finishedAll && opts.finishedAll()) el.insertAdjacentHTML("beforeend", `<p class="dim mt" style="font-size:17px">That's all ${total} questions. Starting again begins at the first one.</p>`);
    el.append(opts.endButtons ? opts.endButtons({ correct, total: fr.length, results: fr }) : nextButtons(true));
    const missed = fr.filter((r) => !r.ok); if (missed.length) { const box = h("div", { class: "missed mt2" }); box.innerHTML = `<h3>Missed · ${missed.length}</h3>` + missed.map(missCard).join(""); autoTerms(box); el.append(box); } }
  function missCard(r) { const it = item(r.id); let mine = "", right = "";
    if (it.type === "order") { right = `<p class="lab2">Correct order</p><ol class="prose" style="font-size:16px;margin:0">${it.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`; if (Array.isArray(r.pick)) mine = `<p class="lab2">Your order</p><ol class="prose dim" style="font-size:16px;margin:0 0 10px">${r.pick.map((k) => `<li>${esc(it.items[k])}</li>`).join("")}</ol>`; }
    else { if (r.pick != null && it.c[r.pick] != null) mine = `<p class="ans no"><span class="lab2">Your answer</span>${rich(it.c[r.pick])}</p>`; right = `<p class="ans yes"><span class="lab2">Correct</span>${rich(it.c[it.a])}</p>`; }
    return `<div class="card mt miss"><p class="mq">${rich(it.q)}</p>${mine}${right}${it.why ? `<p class="dim" style="margin:10px 0 0;font-size:16px">${rich(it.why)}</p>` : ""}${it.src ? `<p class="src" style="margin-top:8px">${esc(it.src)}</p>` : ""}</div>`; }
  // One stable button group: Keep going (primary while there is more), All N, Done.
  function nextButtons(afterSession) { const b = h("div", { class: "btns mt2 next-btns" }); const nx = more ? more(seen) : [];
    if (nx.length) { const k = h("button", { class: "btn pri arrow", type: "button", "data-primary": "" }, `Keep going · ${nx.length} more`); k.onclick = () => { host.innerHTML = ""; session(host, { ...opts, queue: nx, seen, mode: mode === "ahead" ? "learn" : mode, count: count ? { base: base + results.length, total } : null }); }; b.append(k); }
    if (all) { const a = h("button", { class: "btn" + (nx.length ? "" : " pri"), type: "button" }, all.label); a.onclick = () => { host.innerHTML = ""; all.start(); }; b.append(a); }
    const d = h("button", { class: "btn" + (nx.length || all ? " ghost" : " pri"), type: "button" }, afterSession ? "Done" : "Back"); d.onclick = () => onExit && onExit(); b.append(d); return b; }
  if (!q.length) { body.innerHTML = `<h3>Nothing due here right now.</h3><p class="dim mt">${intro || "Everything in this set is scheduled for later."}</p>`; body.append(opts.endButtons ? opts.endButtons({ correct: 0, total: 0, results: [] }) : nextButtons(false)); destroy(); return { destroy }; }
  show(); return { destroy };
}

// Practice for one lesson or module. A normal session is due items, a few new ones and up to 3 blind spots from earlier
// lessons; "Keep going" adds 10 more at a time; "All N questions" walks the whole set in order and remembers its place
// (S().qa[key] = next position, an additive field inside ppg.v1).
export function allLabel(key, n) { const at = (S().qa || {})[key] || 0; return at > 0 && at < n ? `All questions · ${at} / ${n}` : `All ${n} questions`; }
export function practiceSet(host, { ids, key, title, label, onExit, all = false, blindMax = 3 }) {
  ids = onlyReached(ids.filter((id) => item(id)));   // only pages the learner has opened
  const allPath = { get label() { return allLabel(key, ids.length); }, start: () => runAll() };
  if (all) return runAll();
  const seen = new Set(); let { queue } = buildQueue(ids, { max: 20, blindMax });
  if (!queue.length) queue = nextChunk(ids, seen, 10);   // nothing due or new: go straight to the next 10 (practice ahead)
  return session(host, { queue, seen, mode: "learn", title, label, onExit, more: (ex) => nextChunk(ids, ex, 10), all: allPath });
  function runAll() { const qa = (S().qa ||= {}); if (!(qa[key] < ids.length)) qa[key] = 0; const seen = new Set(); const from = qa[key];
    return session(host, { queue: ids.slice(from, from + 10), mode: "learn", title, label, onExit, seen, count: { base: from, total: ids.length },
      onAnswer: (id) => { qa[key] = Math.max(qa[key] || 0, ids.indexOf(id) + 1); save(); }, more: () => ids.slice(qa[key], qa[key] + 10), all: null, finishedAll: () => qa[key] >= ids.length }); }
}
