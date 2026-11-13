// The pilot's path (GL1 "cert"): milestone cards from student pilot certificate to private pilot certificate. Tap one for
// what it takes; the Part 61 / Part 141 chips flip the flight-time minimum. Pilot certificates, not aircraft papers.
// Sources: 14 CFR 61.83, 61.87, 61.103, 61.109(a), 61.23, 61.113(i); 14 CFR 141 Appendix B; FAA-S-ACS-6C; PHAK Ch 1.
import { htmlScene } from "./kit.js?v=ab272ba69e";
import { chips } from "./base.js?v=ab272ba69e";
import { h } from "../core/util.js?v=ab272ba69e";
const STEPS = [
  { k: "stu", t: "Student pilot certificate", s: "Age 16 · English", d: "At least 16 for airplanes, and able to read, speak, write and understand English. Apply early, through IACRA with your instructor.", src: "14 CFR 61.83" },
  { k: "solo", t: "Pre-solo test and solo endorsement", s: "Instructor's test · 90-day endorsement", d: "Your instructor's knowledge test on Parts 61 and 91, the solo airport and your airplane, every miss reviewed; the pre-solo flight training; then a make-and-model endorsement dated within the preceding 90 days. You also need a medical certificate, or BasicMed if eligible.", src: "14 CFR 61.87, 61.23" },
  { k: "know", t: "Knowledge test", s: "Instructor endorsement · FAA test", d: "An instructor endorses you as prepared, then you pass the FAA knowledge test on the private pilot knowledge areas.", src: "14 CFR 61.103(d), (e)" },
  { k: "ppl", t: "Private pilot certificate", s: "Age 17 · flight time · practical test", d: "", src: "" },
];
export function mount(host) {
  let part = "61", sel = "stu";
  const { F, body } = htmlScene(host, { cls: "pilotpath ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);   // Part 61/141 chips on top: opening a card never moves them
  body.append(h("div", { class: "hv-tag" }, "Your path · tap a milestone"));
  const ol = h("ol", { class: "pp-list" }), det = h("div", { class: "pp-det", "aria-live": "polite" }); body.append(ol, det);   // details sit below the list, so opening one never moves the cards
  const items = STEPS.map((st, i) => { const b = h("button", { type: "button", class: "pp-card", "aria-expanded": "false" }, h("span", { class: "pp-n" }, String(i + 1)), h("span", { class: "pp-t" }, h("b", {}, st.t), h("small", {}, st.s)));
    b.onclick = () => { sel = st.k; draw(); }; const li = h("li", {}, b); ol.append(li); return b; });
  chips(F.ctrl, [["61", "Part 61"], ["141", "Part 141 school"]], part, (v) => { part = v; draw(); }, { label: "Training rules" });
  const ppl = () => part === "61" ? { d: "At least 17, English, the instructor endorsements, a passed knowledge test, the flight experience, and a passed practical test graded to the ACS. Part 61 minimum for single-engine airplanes: 40 hours, including 20 hours of instruction and 10 hours solo.", src: "14 CFR 61.103, 61.109(a) · FAA-S-ACS-6C", big: "40 h minimum" }
    : { d: "Same certificate and the same practical test to the ACS. A Part 141 school's approved course needs at least 35 hours of flight training, including 5 hours solo, plus 35 hours of ground training, with stage checks along the way.", src: "14 CFR 141 App B · PHAK Ch 1", big: "35 h minimum" };
  function draw() { STEPS.forEach((st, i) => { const on = st.k === sel, b = items[i]; b.classList.toggle("on", on); b.setAttribute("aria-expanded", on);
            if (st.k === "ppl") b.querySelector("small").textContent = `Age 17 · ${part === "61" ? "40" : "35"} h minimum · practical test`; });
    const st = STEPS.find((x) => x.k === sel), info = st.k === "ppl" ? ppl() : st; det.innerHTML = `<b>${st.t}</b> ${info.d} <span class="src">${info.src}</span>`;
    F.caption(`Milestone ${STEPS.indexOf(st) + 1} of ${STEPS.length}`, st.k === "ppl" ? ppl().big : st.t); }
  draw();
  F.explain("Most pilots need well over the minimum hours. These are pilot certificates; the white and pink certificates on the Certification page belong to the airplane.");
  return { destroy() { F.destroy(); } };
}
