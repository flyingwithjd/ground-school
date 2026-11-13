// "Airworthy today?" (GL1 "papers"): set when each inspection was last done and the checker counts calendar months to
// today, line by line, with the rule behind each. Docs row: the AROW papers on board. The PIC still makes the call (91.7).
// Sources: 14 CFR 91.207(c),(d), 91.409(a),(b), 91.413, 91.9, 91.203; AFH Ch 2.
import { htmlScene } from "./kit.js?v=681adac966";
import { chips } from "./base.js?v=681adac966";
import { h } from "../core/util.js?v=681adac966";
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const last = (y, m) => new Date(y, m + 1, 0).getDate();
export function mount(host) {
  const now = new Date(), Y = now.getFullYear(), M = now.getMonth();
  const mo = (k) => { const i = Y * 12 + M + k; return [Math.floor(i / 12), ((i % 12) + 12) % 12]; };   // k months from this month
  const fmt = ([y, m]) => `${MO[m]} ${y}`, fmtEnd = ([y, m]) => `${MO[m]} ${last(y, m)}, ${y}`;
  let hire = true; const docs = { A: true, R: true, O: true, W: true };
  const ROWS = [
    { k: "ann", t: "Annual", label: "annual inspection", v: 4, min: 0, max: 15, ago: true, cal: 12, src: "91.409(a)" },
    { k: "hun", t: "100-hour", v: 64, min: 0, max: 116, step: 4, hours: true, src: "91.409(b)" },
    { k: "xpd", t: "Transponder", label: "transponder check", v: 9, min: 0, max: 27, ago: true, cal: 24, src: "91.413" },
    { k: "elt", t: "ELT inspection", label: "ELT inspection", v: 7, min: 0, max: 15, ago: true, cal: 12, src: "91.207(d)" },
    { k: "bat", t: "ELT battery", v: 14, min: -3, max: 36, due: true, src: "91.207(c)" },
  ];
  const { F, body } = htmlScene(host, { cls: "airworthy ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);   // use chips on top so nothing below them can push them around
  const head = h("div", { class: "hv-tag" }, `Today · ${MO[M]} ${now.getDate()}, ${Y}`); body.append(head);
  const list = h("div", { class: "aw-list" }); body.append(list);
  const els = {};
  ROWS.forEach((r) => { const t = h("div", { class: "aw-txt" }, h("b", {}, r.t), h("small", {}, ""));
    const minus = h("button", { type: "button", class: "aw-btn", "aria-label": `${r.t}: less` }, "−"), plus = h("button", { type: "button", class: "aw-btn", "aria-label": `${r.t}: more` }, "+");
    const badge = h("span", { class: "aw-badge" }, "");
    const row = h("div", { class: "aw-row" }, t, h("div", { class: "aw-step" }, minus, plus), badge); list.append(row);
    const st = r.step || 1; minus.onclick = () => { r.v = Math.max(r.min, r.v - st); draw(); }; plus.onclick = () => { r.v = Math.min(r.max, r.v + st); draw(); };
    els[r.k] = { row, sm: t.querySelector("small"), badge }; });
  const drow = h("div", { class: "aw-row aw-docs" }); const dtx = h("div", { class: "aw-txt" }, h("b", {}, "Papers"), h("small", {}, "AROW on board"));
  const dbt = h("div", { class: "aw-arow" }); const dbadge = h("span", { class: "aw-badge" }, "");
  [["A", "Airworthiness certificate"], ["R", "Registration certificate"], ["O", "Operating limitations"], ["W", "Weight and balance"]].forEach(([k, n]) => { const b = h("button", { type: "button", class: "chip on", "aria-pressed": "true", "aria-label": n }, k);
    b.onclick = () => { docs[k] = !docs[k]; b.classList.toggle("on", docs[k]); b.setAttribute("aria-pressed", docs[k]); draw(); }; dbt.append(b); });
  drow.append(dtx, dbt, dbadge); list.append(drow);
  const out = h("div", { class: "hv-out", "aria-live": "polite" }); body.append(out);
  chips(F.ctrl, [["hire", "For hire / instruction"], ["own", "Private use"]], "hire", (v) => { hire = v === "hire"; draw(); }, { label: "How the airplane is used" });
  const set = (k, ok, small, word) => { const e = els[k]; e.sm.textContent = small; e.badge.textContent = word || (ok ? "GO" : "NO-GO"); e.badge.className = "aw-badge " + (word === "N/A" ? "na" : ok ? "go" : "no"); e.row.classList.toggle("bad", !ok); };
  function draw() { const bad = [];
    for (const r of ROWS) {
      if (r.ago) { const done = mo(-r.v), thru = mo(-r.v + r.cal), ok = r.v <= r.cal; set(r.k, ok, `${fmt(done)} → ${fmtEnd(thru)}`); if (!ok) bad.push(r.label + " overdue"); }
      else if (r.hours) { if (!hire) { set(r.k, true, `${r.v} h · not required`, "N/A"); continue; }
        const ok = r.v <= 100, ferry = r.v > 100 && r.v <= 110; set(r.k, ok, ok ? `${r.v} h since · ${100 - r.v} h left` : ferry ? `${r.v} h · ferry to the shop only` : `${r.v} h · over by ${r.v - 100} h`); if (!ok) bad.push("100-hour inspection due"); }
      else { const d = mo(r.v), ok = r.v >= 0; set(r.k, ok, ok ? `Replace by ${fmtEnd(d)}` : `Expired ${fmt(d)}`); if (!ok) bad.push("ELT battery past its replacement date"); } }
    const miss = Object.keys(docs).filter((k) => !docs[k]); const dok = !miss.length; dbadge.textContent = dok ? "GO" : "NO-GO"; dbadge.className = "aw-badge " + (dok ? "go" : "no"); drow.classList.toggle("bad", !dok);
    if (!dok) bad.push(`missing ${miss.join(", ")}`);
    out.innerHTML = bad.length ? `<h4 class="aw-verdict no">Not airworthy today</h4><p>${bad.join("; ").replace(/^./, (c) => c.toUpperCase())}. Don't fly it until it's fixed. <span class="src">14 CFR 91.7, 91.9, 91.203, 91.207, 91.409, 91.413</span></p>`
      : `<h4 class="aw-verdict acc">Records say go</h4><p>The records are current. You still decide the airplane is in condition for safe flight on your walkaround, then check yourself with <a href="#/lesson/ad1/0">IMSAFE</a>. <span class="src">14 CFR 91.7 · AFH Ch 2</span></p>`;
  }
  draw();
  F.explain("Calendar months run to the end of the month: an annual done any day in March is good through the end of March next year. Tap − and + to move each date. Airworthiness directives and inoperative equipment (91.417, 91.213) are checked too; your school's status sheet lists them.");
  return { destroy() { F.destroy(); } };
}
