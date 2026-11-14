// The pilot's path (GL1 "cert"): milestone cards from student pilot certificate to private pilot certificate. Tap one for
// what it takes. A two-column note under the path gives the real Part 61 vs Part 141 differences. Pilot certificates, not aircraft papers.
// Sources: 14 CFR 61.83, 61.87, 61.103, 61.109(a), 61.23, 61.113(i); 14 CFR 141 Appendix B; FAA-S-ACS-6C; PHAK Ch 1.
import { htmlScene } from "./kit.js?v=093801d129";
import { h } from "../core/util.js?v=093801d129";
const STEPS = [
  { k: "stu", t: "Student pilot certificate", s: "Age 16 · English", d: "At least 16 for airplanes, and able to read, speak, write and understand English. Apply early, through IACRA with your instructor.", src: "14 CFR 61.83" },
  { k: "solo", t: "Pre-solo test and solo endorsement", s: "Instructor's test · 90-day endorsement", d: "Your instructor's knowledge test on Parts 61 and 91, the solo airport and your airplane, every miss reviewed; the pre-solo flight training; then a make-and-model endorsement dated within the preceding 90 days. You also need a medical certificate, or BasicMed if eligible.", src: "14 CFR 61.87, 61.23" },
  { k: "know", t: "Knowledge test", s: "Instructor endorsement · FAA test", d: "An instructor endorses you as prepared, then you pass the FAA knowledge test on the private pilot knowledge areas.", src: "14 CFR 61.103(d), (e)" },
  { k: "ppl", t: "Private pilot certificate", s: "Age 17 · flight time · practical test", d: "", src: "" },
];
export function mount(host) {
  let sel = "stu";
  const { F, body } = htmlScene(host, { cls: "pilotpath" });
  body.append(h("div", { class: "hv-tag" }, "Your path · tap a milestone"));
  const ol = h("ol", { class: "pp-list" }), det = h("div", { class: "pp-det", "aria-live": "polite" }); body.append(ol, det, h("div", { class: "pp-cmp" },
    h("div", {}, h("b", {}, "Part 61"), h("span", {}, "40 h minimum, including 20 h with an instructor and 10 h solo. No FAA-approved syllabus required."), h("span", { class: "src" }, "14 CFR 61.109(a)")),
    h("div", {}, h("b", {}, "Part 141 school"), h("span", {}, "35 h flight training (5 h solo) plus 35 h ground, on an FAA-approved syllabus with stage checks and end-of-course tests."), h("span", { class: "src" }, "14 CFR 141 App B"))));   // details sit below the list, so opening one never moves the cards
  const items = STEPS.map((st, i) => { const b = h("button", { type: "button", class: "pp-card", "aria-expanded": "false" }, h("span", { class: "pp-n" }, String(i + 1)), h("span", { class: "pp-t" }, h("b", {}, st.t), h("small", {}, st.s)));
    b.onclick = () => { sel = st.k; draw(); }; const li = h("li", {}, b); ol.append(li); return b; });
  const ppl = () => ({ d: "At least 17, English, the instructor endorsements, a passed knowledge test, the flight experience, and a passed practical test graded to the ACS. The same certificate and practical test whether you train under Part 61 or Part 141.", src: "14 CFR 61.103 · FAA-S-ACS-6C", big: "Practical test" });
  function draw() { STEPS.forEach((st, i) => { const on = st.k === sel, b = items[i]; b.classList.toggle("on", on); b.setAttribute("aria-expanded", on);
          });
    const st = STEPS.find((x) => x.k === sel), info = st.k === "ppl" ? ppl() : st; det.innerHTML = `<b>${st.t}</b> ${info.d} <span class="src">${info.src}</span>`;
    F.caption(`Milestone ${STEPS.indexOf(st) + 1} of ${STEPS.length}`, st.k === "ppl" ? ppl().big : st.t); }
  draw();
  F.explain("Most pilots need well over the minimum hours either way. These are pilot certificates; the white and pink certificates on the Certification page belong to the airplane.");
  return { destroy() { F.destroy(); } };
}
