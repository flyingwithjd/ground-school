// "Airworthy today?" (GL1 "papers"): pick a situation and the record list shows which line fails, in red, with the rule,
// and the verdict flips between "Records say go" and "Grounded" (or "No-go until fixed" where the rule is narrower).
// The use toggle matters only for the 100-hour line (required for hire or instruction, not for private use).
// Sources: 14 CFR 91.203(a), 91.207(c),(d),(f), 91.215, 91.409(a),(b), 91.413; AFH Ch 2.
import { htmlScene } from "./kit.js?v=7109f603b7";
import { chips } from "./base.js?v=7109f603b7";
import { h } from "../core/util.js?v=7109f603b7";
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();
// months ago each item was done (battery: months until the replace-by date), hours since the 100-hour, papers on board
const BASE = { ann: 4, hun: 64, xpd: 9, elt: 7, bat: 14, reg: true };
const SCEN = { ok: {}, ann: { ann: 13 }, hun: { hun: 104 }, xpd: { xpd: 25 }, bat: { bat: -1 }, reg: { reg: false } };
export function mount(host) {
  const now = new Date(), Y = now.getFullYear(), M = now.getMonth();
  const mo = (k) => { const i = Y * 12 + M + k; return [Math.floor(i / 12), ((i % 12) + 12) % 12]; };
  const fmt = ([y, m]) => `${MO[m]} ${y}`, end = ([y, m]) => `${MO[m]} ${lastDay(y, m)}, ${y}`;
  let scen = "ok", hire = true;
  const { F, body } = htmlScene(host, { cls: "airworthy ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);   // chips on top: the list below can never push them
  chips(F.ctrl, [["ok", "All current"], ["ann", "Annual expired"], ["hun", "100-hour over"], ["xpd", "Transponder overdue"], ["bat", "ELT battery due"], ["reg", "No registration"]], scen, (v) => { scen = v; draw(); }, { label: "Situation" });
  const use = chips(F.ctrl, [["hire", "For hire / instruction"], ["own", "Private use"]], "hire", (v) => { hire = v === "hire"; draw(); }, { label: "How the airplane is used" });
  F.ctrl.append(h("p", { class: "aw-hint" }, "Pick a situation. Use type matters only for the 100-hour."));
  body.append(h("div", { class: "hv-tag" }, `Records on ${MO[M]} ${now.getDate()}, ${Y}`));
  const out = h("div", { class: "hv-out aw-out", "aria-live": "polite" }); body.append(out);
  const list = h("div", { class: "aw-list" }); body.append(list); const els = {};
  [["ann", "Annual"], ["hun", "100-hour"], ["xpd", "Transponder"], ["elt", "ELT inspection"], ["bat", "ELT battery"], ["reg", "Papers · AROW"]].forEach(([k, t]) => {
    const sm = h("small", {}, ""), badge = h("span", { class: "aw-badge" }, ""), row = h("div", { class: "aw-row" }, h("div", { class: "aw-txt" }, h("b", {}, t), sm), badge); list.append(row); els[k] = { row, sm, badge }; });
  const set = (k, st, txt) => { const e = els[k]; e.sm.textContent = txt; e.badge.textContent = st === "bad" ? "FAIL" : st === "na" ? "N/A" : "OK"; e.badge.className = "aw-badge " + (st === "bad" ? "no" : st === "na" ? "na" : "go"); e.row.classList.toggle("bad", st === "bad"); };
  function draw() { const v = { ...BASE, ...SCEN[scen] }; let verdict = null;
    const cal = (k, n, label, rule, why) => { const thru = mo(-v[k] + n); if (v[k] <= n) { set(k, "ok", `Good through ${end(thru)}`); return; }
      set(k, "bad", `Ran out ${end(thru)}`); verdict = verdict || why(end(thru)); };
    cal("ann", 12, "Annual", "91.409(a)", (d) => ["Grounded", `The annual ran out ${d}. Grounded until an annual is signed off. <span class="src">14 CFR 91.409(a)</span>`]);
    if (!hire) set("hun", "na", "Not required for private use");
    else if (v.hun <= 100) set("hun", "ok", `${v.hun} h since · ${100 - v.hun} h left`);
    else { set("hun", "bad", `${v.hun} h since · over by ${v.hun - 100} h`); verdict = verdict || ["Grounded", `Flown for hire or instruction and 4 h past the 100-hour. The only flight allowed is to the inspection (up to 10 h over). <span class="src">14 CFR 91.409(b)</span>`]; }
    cal("xpd", 24, "Transponder check", "91.413", (d) => ["No-go until fixed", `The transponder check ran out ${d}. No transponder use until it is tested, so no flying where one is required. <span class="src">14 CFR 91.413, 91.215</span>`]);
    cal("elt", 12, "ELT inspection", "91.207(d)", () => ["Grounded", ""]);
    if (v.bat >= 0) set("bat", "ok", `Replace by ${end(mo(v.bat))}`);
    else { const d = end(mo(v.bat)); set("bat", "bad", `Replace-by date passed ${d}`); verdict = verdict || ["No-go until fixed", `The ELT battery was due for replacement by ${d}. Replace it first. Local training within 50 NM is one narrow exception; ask your school. <span class="src">14 CFR 91.207(c), (f)</span>`]; }
    if (v.reg) set("reg", "ok", "A, R, O, W on board");
    else { set("reg", "bad", "R missing: no registration certificate"); verdict = verdict || ["Grounded", `The registration certificate (or the temporary copy of the application) must be on board. <span class="src">14 CFR 91.203(a), 47.31(c)</span>`]; }
    out.innerHTML = verdict ? `<h4 class="aw-verdict no">${verdict[0]}</h4><p>${verdict[1]}</p>`
      : `<h4 class="aw-verdict acc">Records say go</h4><p>${scen === "hun" && !hire ? "Flown privately, the 100-hour doesn't apply. " : ""}Next: your walkaround, then yourself with <a href="#/lesson/ad1/0">IMSAFE</a>. <span class="src">14 CFR 91.7 · AFH Ch 2</span></p>`;
  }
  draw();
  F.explain("Calendar months run to the end of the month: an annual done any day in March is good through the end of March next year. Airworthiness directives and inoperative equipment (91.417, 91.213) are checked too; your school's status sheet lists them.");
  return { destroy() { F.destroy(); } };
}
