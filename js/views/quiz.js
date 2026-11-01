// The practice engine UI: multiple choice, ordered sequences, oral self-rating; learn/review/exam modes.
import { h, esc, shuffle, fmtDue, toast } from "../core/util.js?v=af7918520c";
import { review, get, CONF, level, LEVELS } from "../core/srs.js?v=af7918520c";
import { S } from "../core/store.js?v=af7918520c";
import { item } from "../../data/index.js?v=af7918520c";
import { TOPICS, LESSONS } from "../../data/index.js?v=af7918520c";
import { rich } from "../core/rich.js?v=af7918520c";
const KEYS = "ABCDEFG";
export function session(host, { queue, extra = [], mode = "review", title = "Review", label = "", onExit, onFinish, minutes = 0, passMark = 0.7, intro = "" }) {
  const exam = mode === "exam"; let i = 0; const q = queue.slice(); const results = []; const requeued = new Set(); let t0 = Date.now(), timerI = null;
  const wrap = h("div", { class: "quiz" }); host.append(wrap);
  const top = h("div", { class: "qhead" }); const lab = h("span", { class: "label" }, label || title); const right = h("span", { class: "label" }); top.append(lab, right);
  const bar = h("div", { class: "progress-line" }, h("i", { style: "width:0" })); const body = h("div"); wrap.append(top, bar, body);
  if (exam && minutes) { timerI = setInterval(() => { const left = minutes * 60e3 - (Date.now() - t0); if (left <= 0) { clearInterval(timerI); toast("Time. Grading what you finished."); finish(); return; } const m = Math.floor(left / 6e4), s = Math.floor((left % 6e4) / 1e3); right.textContent = `${m}:${String(s).padStart(2, "0")} left`; }, 500); }
  const keyH = (e) => { if (!body.isConnected) return document.removeEventListener("keydown", keyH); const n = KEYS.indexOf(e.key.toUpperCase()); const idx = /^[1-7]$/.test(e.key) ? +e.key - 1 : n; const ch = body.querySelectorAll(".choice:not([disabled])"); if (idx >= 0 && ch[idx] && !e.metaKey && !e.ctrlKey && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { ch[idx].click(); } else if (e.key === "Enter") { const b = body.querySelector("[data-primary]:not([disabled])"); if (b && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); b.click(); } } };
  document.addEventListener("keydown", keyH);
  const destroy = () => { clearInterval(timerI); document.removeEventListener("keydown", keyH); };
  function progress() { bar.firstChild.style.width = `${(i / Math.max(1, q.length)) * 100}%`; if (!exam) right.textContent = `${Math.min(i + 1, q.length)} of ${q.length}`; }
  function next() { i++; if (i >= q.length) return finish(); show(); }
  function show() { progress(); body.innerHTML = ""; const it = item(q[i]); if (!it) return next(); const topic = TOPICS[it.t];
    body.append(h("div", { class: "label mb" }, [topic ? topic.title : "", it.lesson && LESSONS[it.lesson] ? " · " + LESSONS[it.lesson].code : ""].join("")));
    if (it.kind === "oral") return oral(it); if (it.type === "order") return order(it); return mc(it); }
  function record(it, ok, conf, quality) { const before = get(it.id); const r = review(it.id, { ok, conf, q: quality, source: mode }); results.push({ id: it.id, ok, conf, t: it.t }); return { r, before }; }
  function scheduleNote(r, ok) { const lv = LEVELS[level(r)]; return ok ? `Next review ${fmtDue(r.due)} · ${lv}` : `Back ${fmtDue(r.due)}${exam ? "" : ", and again later in this session"}`; }
  function verdict(it, ok, r, extraHtml = "") { if (exam) return next();
    if (!ok && !requeued.has(it.id)) { requeued.add(it.id); q.splice(Math.min(q.length, i + 4), 0, it.id); }
    const v = h("div", { class: "verdict", "aria-live": "polite" }); v.innerHTML = `<div class="big">${ok ? "Correct." : "Not quite."}</div>${extraHtml}<div class="prose"><p>${rich(it.why || "")}</p>${it.src ? `<p class="src">${esc(it.src)}</p>` : ""}</div><p class="label">${esc(scheduleNote(r, ok))}</p>`;
    const nb = h("button", { class: "btn pri arrow", "data-primary": "", type: "button" }, i + 1 >= q.length ? "Finish" : "Next"); nb.onclick = next; v.append(h("div", { class: "btns mt" }, nb, quitBtn())); body.append(v); nb.focus({ preventScroll: true }); v.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
  function quitBtn() { const b = h("button", { class: "btn ghost", type: "button" }, exam ? "Stop and grade" : "End session"); b.onclick = () => finish(); return b; }
  function mc(it) {
    body.append(h("p", { class: "qtext" })); body.lastChild.innerHTML = rich(it.q);
    if (it.img) { const f = h("div", { class: "mb" }); f.innerHTML = it.img; body.append(f); }
    const order = shuffle(it.c.map((_, k) => k)); let sel = null; const list = h("div", { class: "choices", role: "radiogroup" });
    const btns = order.map((k, n) => { const b = h("button", { class: "choice", type: "button", role: "radio", "aria-checked": "false" }, h("span", { class: "k" }, KEYS[n]), h("span", {})); b.lastChild.innerHTML = rich(it.c[k]); b.onclick = (e) => { if (e.target.closest(".gl")) return; sel = k; btns.forEach((x) => { x.classList.toggle("sel", x === b); x.setAttribute("aria-checked", x === b); }); confBox.hidden = false; check.disabled = false; }; list.append(b); return b; });
    body.append(list);
    const useConf = S().settings.confidence && !exam;
    const confBox = h("div", { class: "conf", hidden: true }); const check = h("button", { class: "btn pri", type: "button", "data-primary": "", disabled: true }, exam ? "Next" : "Check");
    if (useConf) { confBox.append(h("span", { class: "label" }, "How sure are you?")); const cc = h("div", { class: "chips" }); Object.entries(CONF).forEach(([k, v]) => { const b = h("button", { class: "chip", type: "button" }, v.label); b.onclick = () => submit(k); cc.append(b); }); confBox.append(cc); body.append(confBox); }
    else { confBox.append(h("div", { class: "btns" }, check, quitBtn())); body.append(confBox); check.onclick = () => submit(null); }
    function submit(conf) { if (sel == null) return; const ok = sel === it.a; const { r } = record(it, ok, conf); confBox.remove(); btns.forEach((b, n) => { b.disabled = true; const k = order[n]; if (k === it.a) b.classList.add("right"); else if (k === sel) b.classList.add("wrong"); else b.classList.add("mute"); });
      if (exam) return next(); verdict(it, ok, r, !ok && conf === "sure" ? `<p class="label acc" style="margin-top:10px">Certain, and wrong. This is logged as a blind spot.</p>` : ""); }
  }
  function order(it) {
    body.append(h("p", { class: "qtext" })); body.lastChild.innerHTML = rich(it.q); const items = shuffle(it.items.map((x, k) => ({ x, k }))); if (items.every((o, n) => o.k === n) && items.length > 1) items.reverse();
    const list = h("div", { class: "order-list" }); body.append(list); body.append(h("p", { class: "dim", style: "font-size:15px;margin-top:12px" }, "Use the arrows to put these in order, first at the top."));
    const draw = () => { list.innerHTML = ""; items.forEach((o, n) => { const up = h("button", { type: "button", "aria-label": "Move up" }, "↑"), dn = h("button", { type: "button", "aria-label": "Move down" }, "↓"); up.disabled = n === 0; dn.disabled = n === items.length - 1;
      up.onclick = () => { [items[n - 1], items[n]] = [items[n], items[n - 1]]; draw(); }; dn.onclick = () => { [items[n + 1], items[n]] = [items[n], items[n + 1]]; draw(); };
      const row = h("div", { class: "order-item" }, h("span", { class: "n" }, String(n + 1).padStart(2, "0")), h("span", {}, o.x), h("span", { class: "mv" }, up, dn)); list.append(row); }); };
    draw(); const useConf = S().settings.confidence && !exam;
    const go = (conf) => { const ok = items.every((o, n) => o.k === n); const { r } = record(it, ok, conf); [...list.children].forEach((row, n) => { row.classList.add(items[n].k === n ? "ok" : "bad"); row.querySelectorAll("button").forEach((b) => (b.disabled = true)); }); ctl.remove();
      verdict(it, ok, r, ok ? "" : `<ol class="prose mt">${it.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`); };
    const ctl = h("div", { class: "conf" });
    if (useConf) { ctl.append(h("span", { class: "label" }, "How sure are you?")); const cc = h("div", { class: "chips" }); Object.entries(CONF).forEach(([k, v]) => { const b = h("button", { class: "chip", type: "button" }, v.label); b.onclick = () => go(k); cc.append(b); }); ctl.append(cc); }
    else { const b = h("button", { class: "btn pri", type: "button", "data-primary": "" }, "Check order"); b.onclick = () => go(null); ctl.append(h("div", { class: "btns" }, b)); }
    body.append(ctl);
  }
  function oral(it) {
    body.append(h("p", { class: "qtext" })); body.lastChild.innerHTML = rich(it.q);
    if (it.acs) body.append(h("p", { class: "label" }, "ACS " + it.acs));
    const notes = h("textarea", { placeholder: "Say it out loud first, or jot your answer here. It is not graded; you grade yourself.", "aria-label": "Your answer" }); body.append(notes);
    const reveal = h("button", { class: "btn pri", type: "button", "data-primary": "" }, "Show model answer"); const bx = h("div", { class: "btns mt" }, reveal, quitBtn()); body.append(bx);
    reveal.onclick = () => { bx.remove(); const v = h("div", { class: "verdict" }); v.innerHTML = `<span class="label">Model answer</span><div class="prose mt">${rich(it.a)}</div>${it.src ? `<p class="src">${esc(it.src)}</p>` : ""}<p class="label mt">How did your answer compare?</p>`;
      const cc = h("div", { class: "chips" }); [["Missed it", 1], ["Partly", 3], ["Got it", 4], ["Nailed it, easy", 5]].forEach(([t, qq]) => { const b = h("button", { class: "chip", type: "button" }, t); b.onclick = () => { const { r } = record(it, qq >= 3, null, qq); cc.querySelectorAll("button").forEach((x) => (x.disabled = true)); b.classList.add("on");
        if (qq < 3 && !requeued.has(it.id)) { requeued.add(it.id); q.splice(Math.min(q.length, i + 4), 0, it.id); }
        const nb = h("button", { class: "btn pri arrow mt", type: "button", "data-primary": "" }, i + 1 >= q.length ? "Finish" : "Next"); nb.onclick = next; v.append(h("p", { class: "label mt" }, scheduleNote(r, qq >= 3)), nb); nb.focus({ preventScroll: true }); }; cc.append(b); });
      v.append(cc); body.append(v); };
  }
  function finish() { destroy(); bar.firstChild.style.width = "100%"; body.innerHTML = ""; right.textContent = "";
    const firstTry = new Map(); results.forEach((r) => { if (!firstTry.has(r.id)) firstTry.set(r.id, r); }); const fr = [...firstTry.values()];
    const total = exam ? q.length : fr.length; const correct = fr.filter((r) => r.ok).length; const sc = total ? correct / total : 0; const overs = fr.filter((r) => !r.ok && r.conf === "sure").length;
    const el = h("div", { class: "verdict" }); const pass = sc >= passMark; onFinish && onFinish({ correct, total, score: sc });
    el.innerHTML = exam ? `<span class="label">${esc(title)}</span><h2 class="mt">${pass ? "Passing score." : "Not yet passing."}</h2><p class="dim mt" style="font-size:19px">${correct} of ${total} correct, ${Math.round(sc * 100)}%. The FAA knowledge test passing score is 70%; a stage check asks for more than a number, so review every miss below with your instructor.</p>`
      : `<span class="label">Session complete</span><h2 class="mt">${total ? `${correct} of ${total} first try.` : "Nothing answered."}</h2><p class="dim mt" style="font-size:19px">${overs ? `${overs} answer${overs > 1 ? "s" : ""} marked certain were wrong. Those are your most important blind spots. ` : ""}Missed items return within minutes; correct ones come back on a growing schedule until they are truly retained.</p>`;
    if (exam) { const missed = fr.filter((r) => !r.ok); const unanswered = q.filter((id) => !firstTry.has(id));
      const byT = {}; q.forEach((id) => { const it = item(id); const k = it.t; byT[k] ||= { n: 0, ok: 0 }; byT[k].n++; if (firstTry.get(id)?.ok) byT[k].ok++; });
      el.innerHTML += `<h3 class="mt2">By topic</h3><div class="tablewrap prose mt"><table><tr><th>Topic</th><th>Score</th></tr>${Object.entries(byT).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([k, v]) => `<tr><td>${esc(TOPICS[k]?.title || k)}</td><td>${v.ok}/${v.n}</td></tr>`).join("")}</table></div>`;
      if (missed.length || unanswered.length) el.innerHTML += `<h3 class="mt2">Review the misses</h3>` + [...missed.map((r) => r.id), ...unanswered].map((id) => { const it = item(id); return `<div class="card mt"><p style="font-weight:600;margin:0 0 8px">${rich(it.q)}</p>${it.c ? `<p class="acc" style="margin:0 0 8px">${rich(it.c[it.a])}</p>` : ""}<p class="dim" style="margin:0;font-size:16px">${rich(it.why || "")}</p>${it.src ? `<p class="src" style="margin-top:8px">${esc(it.src)}</p>` : ""}</div>`; }).join(""); }
    const btns = h("div", { class: "btns mt2" }); const back = h("button", { class: "btn pri", type: "button" }, "Done"); back.onclick = () => onExit && onExit(); btns.append(back);
    if (!exam && extra && extra.length) { const more = h("button", { class: "btn", type: "button" }, "Practice more"); more.onclick = () => { host.innerHTML = ""; session(host, { queue: extra.slice(0, 10), extra: extra.slice(10), mode: "ahead", title, label, onExit }); }; btns.append(more); }
    el.append(btns); body.append(el); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (!q.length) { body.innerHTML = `<h3>Nothing to practice here right now.</h3><p class="dim mt">${intro || "Everything in this set is scheduled for later. Come back when items are due, or practice ahead below."}</p>`; const b = h("div", { class: "btns mt" }); if (extra.length) { const m = h("button", { class: "btn pri", type: "button" }, "Practice ahead"); m.onclick = () => { host.innerHTML = ""; session(host, { queue: extra.slice(0, 10), extra: extra.slice(10), mode: "ahead", title, label, onExit }); }; b.append(m); } const d = h("button", { class: "btn", type: "button" }, "Back"); d.onclick = () => onExit && onExit(); b.append(d); body.append(b); destroy(); return { destroy }; }
  show(); return { destroy };
}
