// Medical certificate duration for private pilot privileges (14 CFR 61.23(d)): exam month + age → last day it's valid.
import { htmlScene } from "./kit.js?v=ab272ba69e";
import { chips } from "./base.js?v=ab272ba69e";
import { h } from "../core/util.js?v=ab272ba69e";
const MO = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function mount(host) {
  const now = new Date();
  let m = now.getMonth(), y = now.getFullYear(), over40 = false;
  const { F, body } = htmlScene(host);
  body.append(h("div", { class: "hv-tag" }, "Exam month and year"));
  const ms = h("select", { class: "hv-sel", "aria-label": "Exam month" }), ys = h("select", { class: "hv-sel", "aria-label": "Exam year" });
  MO.forEach((t, i) => ms.append(h("option", { value: i }, t))); for (let i = y - 6; i <= y; i++) ys.append(h("option", { value: i }, String(i)));
  ms.value = m; ys.value = y; ms.addEventListener("change", () => { m = +ms.value; draw(); }); ys.addEventListener("change", () => { y = +ys.value; draw(); });
  body.append(h("div", { class: "hv-row" }, ms, ys));
  chips(F.ctrl, [["u", "Under 40 on exam day"], ["o", "40 or older"]], "u", (v) => { over40 = v === "o"; draw(); }, { label: "Age on the exam date" });
  const out = h("div", { class: "hv-out", "aria-live": "polite" }); body.append(out);
  function draw() {
    const n = over40 ? 24 : 60, idx = m + n, ey = y + Math.floor(idx / 12), em = idx % 12, last = new Date(ey, em + 1, 0);
    const valid = now <= new Date(ey, em + 1, 0, 23, 59);
    out.innerHTML = `<div class="hv-tag">${n}th calendar month after ${MO[m]} ${y}</div><h4 class="acc">Valid through ${MO[em]} ${last.getDate()}, ${ey}</h4><p>${valid ? "Still valid today" : "Expired before today"} for private pilot privileges. It runs to the last day of that month, not to the exam's day of the month. <span class="src">14 CFR 61.23(d)</span></p>`;
    F.caption(over40 ? "40 or older" : "Under 40", `${MO[em].slice(0, 3)} ${last.getDate()}, ${ey}`);
  }
  draw();
  F.explain("Third-class privileges, which is what student and private pilots use. Even with a valid medical, 61.53 grounds you if you know of a condition that would keep you from meeting its standards.");
  return { destroy() { F.destroy(); } };
}
